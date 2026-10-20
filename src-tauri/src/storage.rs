//! Installation-local storage. Legacy AppData is read only during migration;
//! a failed migration must never be replaced with a new empty workspace.
use crate::common::db_state::CURRENT_SCHEMA_VERSION;
use rusqlite::{Connection, DatabaseName, OpenFlags};
use serde::{Deserialize, Serialize};
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::path::{Component, Path, PathBuf};
use std::sync::Mutex;
use tauri::{Manager, State, WebviewWindow};
use tauri_plugin_opener::OpenerExt;

const DATABASE: &str = "project_manager.db";
const CONFIG: &str = "easyproject-storage.json";

#[derive(Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct StorageConfig {
    #[serde(default)]
    active_dir: Option<PathBuf>,
    #[serde(default)]
    pending_dir: Option<PathBuf>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageInfo {
    pub ready: bool,
    pub active_dir: PathBuf,
    pub database_path: PathBuf,
    pub default_dir: PathBuf,
    pub profile_dir: PathBuf,
    pub config_path: PathBuf,
    pub pending_dir: Option<PathBuf>,
    pub error: Option<String>,
}

pub struct StorageState {
    pub info: Mutex<StorageInfo>,
}

fn fail(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub fn installation_directory(executable: &Path) -> Result<PathBuf, String> {
    let parent = executable
        .parent()
        .ok_or("Executable directory unavailable")?;
    // Do not modify a macOS app bundle (or invalidate its signature).
    if parent.file_name().is_some_and(|name| name == "MacOS")
        && parent
            .parent()
            .and_then(Path::file_name)
            .is_some_and(|name| name == "Contents")
    {
        return parent
            .ancestors()
            .nth(3)
            .map(|path| path.join("EasyProject-storage"))
            .ok_or_else(|| "Application directory unavailable".into());
    }
    Ok(parent.to_path_buf())
}

fn reject_links(path: &Path) -> Result<(), String> {
    for ancestor in path.ancestors() {
        match fs::symlink_metadata(ancestor) {
            Ok(metadata) if metadata.file_type().is_symlink() => {
                return Err("Linked storage paths are not allowed".into());
            }
            Ok(_) => {}
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
            Err(error) => return Err(fail(error)),
        }
    }
    Ok(())
}

pub fn validate_directory(path: &Path) -> Result<(), String> {
    if !path.is_absolute() || path.components().any(|c| matches!(c, Component::ParentDir)) {
        return Err("Choose an absolute local directory without parent traversal".into());
    }
    let normalized = path
        .to_string_lossy()
        .replace('\\', "/")
        .to_ascii_lowercase();
    if normalized.starts_with("c:/") || normalized.starts_with("//?/c:/") {
        return Err("EasyProject storage must not be on drive C".into());
    }
    if normalized.starts_with("//?/unc/")
        || (normalized.starts_with("//") && !normalized.starts_with("//?/"))
    {
        return Err("Network storage is not supported".into());
    }
    reject_links(path)?;
    for ancestor in path.ancestors().filter(|p| p.exists()) {
        let resolved = fs::canonicalize(ancestor).map_err(fail)?;
        let value = resolved
            .to_string_lossy()
            .replace('\\', "/")
            .to_ascii_lowercase();
        if value.starts_with("c:/") || value.starts_with("//?/c:/") {
            return Err("Resolved storage must not be on drive C".into());
        }
    }
    Ok(())
}

fn resolved_path(path: &Path) -> Result<PathBuf, String> {
    for ancestor in path.ancestors() {
        if ancestor.exists() {
            return Ok(fs::canonicalize(ancestor)
                .map_err(fail)?
                .join(path.strip_prefix(ancestor).map_err(fail)?));
        }
    }
    Err("Storage parent cannot be resolved".into())
}

fn directories_overlap(left: &Path, right: &Path) -> Result<bool, String> {
    let normalize = |path: PathBuf| {
        let value = path
            .to_string_lossy()
            .replace('\\', "/")
            .trim_end_matches('/')
            .to_owned();
        if cfg!(windows) {
            value.to_ascii_lowercase()
        } else {
            value
        }
    };
    let a = normalize(resolved_path(left)?);
    let b = normalize(resolved_path(right)?);
    Ok(a == b || a.starts_with(&(b.clone() + "/")) || b.starts_with(&(a + "/")))
}

fn read_config(root: &Path) -> Result<StorageConfig, String> {
    let path = root.join(CONFIG);
    if !path.exists() {
        return Ok(StorageConfig::default());
    }
    reject_links(&path)?;
    if fs::metadata(&path).map_err(fail)?.len() > 64 * 1024 {
        return Err("Storage configuration is too large".into());
    }
    serde_json::from_slice(&fs::read(path).map_err(fail)?)
        .map_err(|_| "Invalid storage configuration; existing data was not replaced".into())
}

fn save_config(root: &Path, config: &StorageConfig) -> Result<(), String> {
    validate_directory(root)?;
    let temp = root.join(format!(".storage-{}.tmp", uuid::Uuid::new_v4()));
    let result = (|| {
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temp)
            .map_err(fail)?;
        file.write_all(&serde_json::to_vec_pretty(config).map_err(fail)?)
            .map_err(fail)?;
        file.sync_all().map_err(fail)?;
        fs::rename(&temp, root.join(CONFIG)).map_err(fail)
    })();
    if temp.exists() {
        let _ = fs::remove_file(temp);
    }
    result
}

fn checked_database(path: &Path) -> Result<Connection, String> {
    reject_links(path)?;
    let connection =
        Connection::open_with_flags(path, OpenFlags::SQLITE_OPEN_READ_ONLY).map_err(fail)?;
    let integrity: String = connection
        .query_row("PRAGMA integrity_check", [], |r| r.get(0))
        .map_err(fail)?;
    let version: i64 = connection
        .query_row("PRAGMA user_version", [], |r| r.get(0))
        .map_err(fail)?;
    let projects: i64 = connection
        .query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='project'",
            [],
            |r| r.get(0),
        )
        .map_err(fail)?;
    if integrity != "ok" || version > CURRENT_SCHEMA_VERSION || projects != 1 {
        return Err(
            "Source database failed integrity/schema validation; no empty replacement was created"
                .into(),
        );
    }
    Ok(connection)
}

fn equal_files(left: &Path, right: &Path) -> Result<bool, String> {
    let (mut a, mut b) = (
        File::open(left).map_err(fail)?,
        File::open(right).map_err(fail)?,
    );
    if a.metadata().map_err(fail)?.len() != b.metadata().map_err(fail)?.len() {
        return Ok(false);
    }
    let (mut x, mut y) = ([0; 65536], [0; 65536]);
    loop {
        let count = a.read(&mut x).map_err(fail)?;
        b.read_exact(&mut y[..count]).map_err(fail)?;
        if x[..count] != y[..count] {
            return Ok(false);
        }
        if count == 0 {
            return Ok(true);
        }
    }
}

fn copy_tree(source: &Path, target: &Path) -> Result<(), String> {
    reject_links(source)?;
    fs::create_dir(target).map_err(fail)?;
    for entry in fs::read_dir(source).map_err(fail)? {
        let entry = entry.map_err(fail)?;
        let (from, to) = (entry.path(), target.join(entry.file_name()));
        let kind = entry.file_type().map_err(fail)?;
        if kind.is_symlink() {
            return Err("Migration refuses linked backup files".into());
        }
        if kind.is_dir() {
            copy_tree(&from, &to)?;
        } else if kind.is_file() {
            fs::copy(&from, &to).map_err(fail)?;
            if !equal_files(&from, &to)? {
                return Err("Backup copy verification failed".into());
            }
        } else {
            return Err("Migration found an unsupported file".into());
        }
    }
    Ok(())
}

fn empty_or_absent(path: &Path) -> Result<bool, String> {
    if !path.exists() {
        return Ok(true);
    }
    Ok(path.is_dir() && fs::read_dir(path).map_err(fail)?.next().is_none())
}

fn migrate(source: &Path, target: &Path) -> Result<(), String> {
    validate_directory(target)?;
    reject_links(source)?;
    if directories_overlap(source, target)? {
        return Err("Source and destination must not contain one another".into());
    }
    if !empty_or_absent(target)? {
        return Err("Destination must be empty; existing data will not be overwritten".into());
    }
    let parent = target.parent().ok_or("Destination parent unavailable")?;
    fs::create_dir_all(parent).map_err(fail)?;
    let staging = parent.join(format!(".easyproject-migrate-{}", uuid::Uuid::new_v4()));
    fs::create_dir(&staging).map_err(fail)?;
    // Keep failed staging evidence. It is never considered an active workspace.
    let connection = checked_database(&source.join(DATABASE))?;
    connection.execute_batch("BEGIN").map_err(fail)?;
    connection
        .backup(DatabaseName::Main, staging.join(DATABASE), None)
        .map_err(fail)?;
    checked_database(&staging.join(DATABASE))?;
    if source.join("backups").exists() {
        copy_tree(&source.join("backups"), &staging.join("backups"))?;
    }
    if source.join("mcp-audit.jsonl").exists() {
        let from = source.join("mcp-audit.jsonl");
        reject_links(&from)?;
        fs::copy(&from, staging.join("mcp-audit.jsonl")).map_err(fail)?;
        if !equal_files(&from, &staging.join("mcp-audit.jsonl"))? {
            return Err("Audit copy verification failed".into());
        }
    }
    connection.execute_batch("ROLLBACK").map_err(fail)?;
    if target.exists() {
        // Only remove the explicitly selected, still-empty directory.
        fs::remove_dir(target).map_err(fail)?;
    }
    fs::rename(&staging, target).map_err(fail)?;
    Ok(())
}

pub fn prepare(root: &Path, legacy: Option<&Path>) -> Result<StorageInfo, String> {
    validate_directory(root)?;
    let config = read_config(root)?;
    let default = root.join("data");
    let current = config.active_dir.clone().unwrap_or_else(|| default.clone());
    let target = config
        .pending_dir
        .clone()
        .unwrap_or_else(|| current.clone());
    validate_directory(&target)?;
    let source = if current.join(DATABASE).exists() {
        Some(current.clone())
    } else if config.active_dir.is_none() {
        legacy
            .filter(|p| p.join(DATABASE).exists())
            .map(Path::to_path_buf)
    } else {
        return Err(
            "Configured database is missing; refusing to create an empty replacement".into(),
        );
    };
    if config.pending_dir.is_some() && target != current && !empty_or_absent(&target)? {
        return Err("Pending destination is occupied; existing workspace remains unchanged".into());
    }
    if let Some(source) = source.filter(|source| *source != target) {
        migrate(&source, &target)?;
    } else if target.join(DATABASE).exists() {
        checked_database(&target.join(DATABASE))?;
    } else {
        if !empty_or_absent(&target)? {
            return Err("Data directory contains unrelated files".into());
        }
        fs::create_dir_all(&target).map_err(fail)?;
    }
    Ok(StorageInfo {
        ready: true,
        database_path: target.join(DATABASE),
        active_dir: target,
        default_dir: default,
        profile_dir: root.join("webview"),
        config_path: root.join(CONFIG),
        pending_dir: None,
        error: None,
    })
}

pub fn confirm(info: &StorageInfo) -> Result<(), String> {
    save_config(
        info.config_path
            .parent()
            .ok_or("Configuration directory unavailable")?,
        &StorageConfig {
            active_dir: Some(info.active_dir.clone()),
            pending_dir: None,
        },
    )
}

pub fn failed_info(root: &Path, error: String) -> StorageInfo {
    let default = root.join("data");
    let config = read_config(root).unwrap_or_default();
    let active = config.active_dir.unwrap_or_else(|| default.clone());
    StorageInfo {
        ready: false,
        database_path: active.join(DATABASE),
        active_dir: active,
        default_dir: default,
        profile_dir: root.join("webview"),
        config_path: root.join(CONFIG),
        pending_dir: config.pending_dir,
        error: Some(error),
    }
}

fn require_main(window: &WebviewWindow) -> Result<(), String> {
    if window.label() == "main" {
        Ok(())
    } else {
        Err("Only the main window can configure storage".into())
    }
}

#[tauri::command]
pub fn storage_info(
    window: WebviewWindow,
    state: State<StorageState>,
) -> Result<StorageInfo, String> {
    require_main(&window)?;
    state
        .info
        .lock()
        .map(|value| value.clone())
        .map_err(|_| "Storage state lock failed".into())
}

fn request_directory(state: &StorageState, directory: &Path) -> Result<StorageInfo, String> {
    validate_directory(directory)?;
    let mut info = state.info.lock().map_err(|_| "Storage state lock failed")?;
    if directory != info.active_dir && !empty_or_absent(directory)? {
        return Err(
            "Choose a new or empty destination; existing files will not be overwritten".into(),
        );
    }
    if directory != info.active_dir && directories_overlap(directory, &info.active_dir)? {
        return Err("Source and destination must not contain one another".into());
    }
    let pending = (directory != info.active_dir).then(|| directory.to_path_buf());
    let root = info
        .config_path
        .parent()
        .ok_or("Configuration directory unavailable")?;
    let previous = read_config(root)?;
    // If initial migration failed, keep the original discovery path on restart.
    let active = if info.ready {
        Some(info.active_dir.clone())
    } else {
        previous.active_dir
    };
    save_config(
        root,
        &StorageConfig {
            active_dir: active,
            pending_dir: pending.clone(),
        },
    )?;
    info.pending_dir = pending;
    Ok(info.clone())
}

#[tauri::command]
pub fn set_data_directory(
    window: WebviewWindow,
    state: State<StorageState>,
    directory: String,
) -> Result<StorageInfo, String> {
    require_main(&window)?;
    request_directory(&state, Path::new(&directory))
}

#[tauri::command]
pub fn reveal_backup_directory(
    window: WebviewWindow,
    app: tauri::AppHandle,
    db: State<crate::common::db_state::DbState>,
) -> Result<(), String> {
    require_main(&window)?;
    let directory =
        db.1.parent()
            .ok_or("Database directory unavailable")?
            .join("backups");
    validate_directory(&directory)?;
    fs::create_dir_all(&directory).map_err(fail)?;
    app.opener().reveal_item_in_dir(directory).map_err(fail)
}

pub fn profile_directory(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let info = app.state::<StorageState>();
    let path = info
        .info
        .lock()
        .map_err(|_| "Storage state lock failed")?
        .profile_dir
        .clone();
    validate_directory(&path)?;
    Ok(path)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::common::db_state::init_db;

    struct Fixture(PathBuf);
    impl Fixture {
        fn new() -> Self {
            let path = Path::new(env!("CARGO_MANIFEST_DIR"))
                .join("target/storage-tests")
                .join(uuid::Uuid::new_v4().to_string());
            fs::create_dir_all(&path).unwrap();
            Self(path)
        }
        fn root(&self) -> PathBuf {
            let root = self.0.join("app");
            fs::create_dir(&root).unwrap();
            root
        }
        fn database(&self, name: &str) -> PathBuf {
            let path = self.0.join(name);
            fs::create_dir(&path).unwrap();
            let db = init_db(&path.join(DATABASE)).unwrap();
            db.0.lock()
                .unwrap()
                .execute("INSERT INTO project(id,name) VALUES('p1','preserve')", [])
                .unwrap();
            path
        }
    }
    impl Drop for Fixture {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    #[test]
    fn default_and_profile_are_beside_installation_not_appdata() {
        let f = Fixture::new();
        let root = f.root();
        let info = prepare(&root, None).unwrap();
        assert_eq!(info.active_dir, root.join("data"));
        assert_eq!(info.profile_dir, root.join("webview"));
        assert_eq!(info.config_path, root.join(CONFIG));
        let db = init_db(&info.database_path).unwrap();
        confirm(&info).unwrap();
        drop(db);
        assert_eq!(
            prepare(&root, None).unwrap().database_path,
            info.database_path
        );
    }

    #[test]
    fn migrates_legacy_database_backups_and_audit_without_changing_source() {
        let f = Fixture::new();
        let root = f.root();
        let legacy = f.database("legacy");
        fs::create_dir(legacy.join("backups")).unwrap();
        fs::write(legacy.join("backups/manual.db"), b"preserved backup bytes").unwrap();
        fs::write(legacy.join("mcp-audit.jsonl"), b"{\"safe\":true}\n").unwrap();
        let before = fs::read(legacy.join(DATABASE)).unwrap();
        let info = prepare(&root, Some(&legacy)).unwrap();
        let copy = checked_database(&info.database_path).unwrap();
        let name: String = copy
            .query_row("SELECT name FROM project WHERE id='p1'", [], |r| r.get(0))
            .unwrap();
        assert_eq!(name, "preserve");
        assert_eq!(fs::read(legacy.join(DATABASE)).unwrap(), before);
        assert!(equal_files(
            &legacy.join("backups/manual.db"),
            &info.active_dir.join("backups/manual.db")
        )
        .unwrap());
        assert!(equal_files(
            &legacy.join("mcp-audit.jsonl"),
            &info.active_dir.join("mcp-audit.jsonl")
        )
        .unwrap());
    }

    #[test]
    fn pending_change_copies_latest_data_only_on_restart() {
        let f = Fixture::new();
        let root = f.root();
        let info = prepare(&root, None).unwrap();
        let db = init_db(&info.database_path).unwrap();
        confirm(&info).unwrap();
        let state = StorageState {
            info: Mutex::new(info.clone()),
        };
        let target = f.0.join("custom");
        let pending = request_directory(&state, &target).unwrap();
        assert_eq!(pending.pending_dir, Some(target.clone()));
        assert_eq!(pending.database_path, info.database_path);
        assert!(!target.exists());
        db.0.lock()
            .unwrap()
            .execute(
                "INSERT INTO project(id,name) VALUES('latest','after-setting')",
                [],
            )
            .unwrap();
        drop(db);
        let next = prepare(&root, None).unwrap();
        assert_eq!(next.active_dir, target);
        let latest: String = checked_database(&next.database_path)
            .unwrap()
            .query_row("SELECT name FROM project WHERE id='latest'", [], |r| {
                r.get(0)
            })
            .unwrap();
        assert_eq!(latest, "after-setting");
        confirm(&next).unwrap();
        assert!(read_config(&root).unwrap().pending_dir.is_none());
        assert!(info.database_path.exists());
    }

    #[test]
    fn occupied_pending_target_never_overwrites_or_changes_active_config() {
        let f = Fixture::new();
        let root = f.root();
        let legacy = f.database("legacy");
        let info = prepare(&root, Some(&legacy)).unwrap();
        confirm(&info).unwrap();
        let target = f.0.join("occupied");
        let state = StorageState {
            info: Mutex::new(info.clone()),
        };
        request_directory(&state, &target).unwrap();
        fs::create_dir(&target).unwrap();
        fs::write(target.join("keep.txt"), b"do not overwrite").unwrap();
        assert!(prepare(&root, None).unwrap_err().contains("occupied"));
        assert_eq!(
            fs::read(target.join("keep.txt")).unwrap(),
            b"do not overwrite"
        );
        assert_eq!(
            read_config(&root).unwrap().active_dir,
            Some(info.active_dir)
        );
    }

    #[test]
    fn invalid_source_config_and_missing_active_database_do_not_create_empty_replacements() {
        let f = Fixture::new();
        let root = f.root();
        let legacy = f.0.join("invalid");
        fs::create_dir(&legacy).unwrap();
        fs::write(legacy.join(DATABASE), b"not a database").unwrap();
        assert!(prepare(&root, Some(&legacy)).is_err());
        assert!(!root.join("data").exists());
        fs::write(root.join(CONFIG), b"{broken").unwrap();
        assert!(prepare(&root, None).is_err());
        save_config(
            &root,
            &StorageConfig {
                active_dir: Some(f.0.join("missing")),
                pending_dir: None,
            },
        )
        .unwrap();
        assert!(prepare(&root, None).unwrap_err().contains("missing"));
        assert!(!f.0.join("missing").exists());
    }

    #[test]
    fn rejects_c_drive_relative_network_and_nested_destinations() {
        for path in [
            "C:/EasyProject/data",
            "c:\\data",
            "relative/data",
            "//server/share",
            "\\\\?\\UNC\\server\\share",
        ] {
            assert!(validate_directory(Path::new(path)).is_err(), "{path}");
        }
        let f = Fixture::new();
        let root = f.root();
        let info = prepare(&root, None).unwrap();
        let state = StorageState {
            info: Mutex::new(info.clone()),
        };
        assert!(request_directory(&state, &info.active_dir.join("nested")).is_err());
        #[cfg(windows)]
        assert!(request_directory(
            &state,
            &PathBuf::from(info.active_dir.to_string_lossy().to_uppercase()).join("nested")
        )
        .is_err());
    }

    #[test]
    fn mac_installation_data_is_outside_the_app_bundle() {
        let path = Path::new("/Applications/EasyProject.app/Contents/MacOS/easy-project");
        assert_eq!(
            installation_directory(path).unwrap(),
            PathBuf::from("/Applications/EasyProject-storage")
        );
    }
}
