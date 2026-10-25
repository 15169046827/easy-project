//! Operator-only offline migration. Stop the service and take an external snapshot first.
use std::path::{Path, PathBuf};

fn regular(path: &Path, directory: bool) -> Result<(), String> {
    let metadata = std::fs::symlink_metadata(path).map_err(|_| "Existing storage required")?;
    if metadata.file_type().is_symlink()
        || (directory && !metadata.is_dir())
        || (!directory && !metadata.is_file())
    {
        return Err("Storage links and unexpected file types are not allowed".into());
    }
    Ok(())
}

/// Does not bootstrap accounts or create missing workspaces. No credentials are returned.
pub fn migrate_existing(root: &Path) -> Result<usize, String> {
    if !root.is_absolute() {
        return Err("Absolute storage directory required".into());
    }
    for ancestor in root.ancestors() {
        regular(ancestor, true)?;
    }
    let accounts = root.join("accounts.db");
    regular(&accounts, false)?;
    let mut databases: Vec<PathBuf> = Vec::new();
    let workspaces = root.join("workspaces");
    if std::fs::symlink_metadata(&workspaces).is_ok() {
        regular(&workspaces, true)?;
        for entry in std::fs::read_dir(&workspaces).map_err(|_| "Cannot inspect workspaces")? {
            let entry = entry.map_err(|_| "Cannot inspect workspace")?;
            let name = entry.file_name();
            let name = name.to_str().ok_or("Invalid workspace name")?;
            if name.len() != 32
                || !name
                    .bytes()
                    .all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase())
            {
                return Err("Unexpected workspace directory; inspect before migration".into());
            }
            regular(&entry.path(), true)?;
            let path = entry.path().join("project_manager.db");
            regular(&path, false)?;
            databases.push(path);
        }
    }
    // Validate all paths before the first migration; each database has its own
    // protected backup and transaction. Cross-database rollback is operator-owned.
    drop(crate::auth::open(&accounts)?);
    for path in &databases {
        drop(crate::common::db_state::init_db(path)?);
    }
    Ok(databases.len())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn missing_storage_does_not_create_an_empty_replacement() {
        let root = std::env::temp_dir().join(uuid::Uuid::new_v4().simple().to_string());
        assert!(migrate_existing(&root).is_err());
        assert!(!root.exists());
    }

    #[test]
    fn migrates_existing_databases_without_creating_other_workspaces() {
        let root = std::env::temp_dir().join(uuid::Uuid::new_v4().simple().to_string());
        let key = uuid::Uuid::new_v4().simple().to_string();
        let directory = root.join("workspaces").join(&key);
        std::fs::create_dir_all(&directory).unwrap();
        let accounts = rusqlite::Connection::open(root.join("accounts.db")).unwrap();
        accounts.execute_batch("CREATE TABLE account(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,admin INTEGER NOT NULL DEFAULT 0,must_change INTEGER NOT NULL DEFAULT 1,disabled INTEGER NOT NULL DEFAULT 0); CREATE TABLE session(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES account(id),expires INTEGER NOT NULL); PRAGMA user_version=1;").unwrap();
        accounts
            .execute(
                "INSERT INTO account VALUES(?1,'fixture','preserved-hash',1,0,0)",
                [&key],
            )
            .unwrap();
        drop(accounts);
        let path = directory.join("project_manager.db");
        let state = crate::common::db_state::init_db(&path).unwrap();
        state
            .lock_connection()
            .unwrap()
            .execute_batch("PRAGMA user_version=5;")
            .unwrap();
        drop(state);
        assert_eq!(migrate_existing(&root).unwrap(), 1);
        let accounts = crate::auth::open(&root.join("accounts.db")).unwrap();
        let stored: (String, String) = accounts
            .query_row("SELECT workspace_key,password_hash FROM account", [], |r| {
                Ok((r.get(0)?, r.get(1)?))
            })
            .unwrap();
        assert_eq!(stored, (key, "preserved-hash".into()));
        assert_eq!(
            std::fs::read_dir(root.join("workspaces")).unwrap().count(),
            1
        );
        let db = rusqlite::Connection::open(path).unwrap();
        assert_eq!(
            db.query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            8
        );
        assert_eq!(migrate_existing(&root).unwrap(), 1);
    }
}
