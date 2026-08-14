use crate::common::db_state::DbState;
use crate::models::common::ApiResponse;
use chrono::Local;
use rusqlite::{params_from_iter, DatabaseName};
use serde_json::{json, Value};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::State;

fn table_rows(
    conn: &rusqlite::Connection,
    sql: &str,
    columns: usize,
) -> Result<Vec<Vec<Value>>, String> {
    let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            let mut values = Vec::with_capacity(columns);
            for index in 0..columns {
                let value = row.get_ref(index)?;
                values.push(match value {
                    rusqlite::types::ValueRef::Null => Value::Null,
                    rusqlite::types::ValueRef::Integer(v) => json!(v),
                    rusqlite::types::ValueRef::Real(v) => json!(v),
                    rusqlite::types::ValueRef::Text(v) => json!(String::from_utf8_lossy(v)),
                    rusqlite::types::ValueRef::Blob(_) => Value::Null,
                });
            }
            Ok(values)
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|e| e.to_string())
}

fn export_json(db: &DbState) -> Result<Value, String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Database lock failed".to_string())?;
    let projects = table_rows(&conn, "SELECT id,name,version,type,status,owner,calendar_country,calendar_region,weekend_days,calendar_exceptions,creator,create_time,update_time,stateflag FROM project", 14)?;
    let tasks = table_rows(&conn, "SELECT id,project_id,sort_order,name,parent,dependence,start_time,end_time,type,priority,status,progress,effort_days,schedule_mode,comment,assignee,creator,create_time,update_time,stateflag FROM task", 20)?;
    let dependencies = table_rows(&conn, "SELECT id,predecessor_task_id,successor_task_id,dependency_type,lag_minutes,create_time FROM task_dependency", 6)?;
    let members = table_rows(
        &conn,
        "SELECT id,name,email,phone,role,avatar,availability_exceptions,create_time,update_time,stateflag FROM member",
        10,
    )?;
    let project_members = table_rows(
        &conn,
        "SELECT id,project_id,member_id,role,joined_at,stateflag FROM project_member",
        6,
    )?;
    let plan_baselines = table_rows(
        &conn,
        "SELECT id,project_id,task_id,task_name,start_time,end_time,created_at FROM plan_baseline",
        7,
    )?;
    Ok(
        json!({"schemaVersion":5,"exportedAt":Local::now().to_rfc3339(),"projects":projects,"tasks":tasks,"dependencies":dependencies,"members":members,"project_members":project_members,"plan_baselines":plan_baselines}),
    )
}

fn import_json(db: &DbState, payload: &Value) -> Result<(), String> {
    let schema_version = payload.get("schemaVersion").and_then(Value::as_i64);
    if !matches!(schema_version, Some(1 | 2 | 3 | 4 | 5)) {
        return Err("Unsupported or missing schemaVersion".to_string());
    }
    let projects = payload
        .get("projects")
        .and_then(Value::as_array)
        .ok_or("Missing projects")?;
    let tasks = payload
        .get("tasks")
        .and_then(Value::as_array)
        .ok_or("Missing tasks")?;
    let dependencies = payload
        .get("dependencies")
        .and_then(Value::as_array)
        .ok_or("Missing dependencies")?;
    let empty_vec = vec![];
    let members = payload
        .get("members")
        .and_then(Value::as_array)
        .unwrap_or(&empty_vec);
    let project_members = payload
        .get("project_members")
        .and_then(Value::as_array)
        .unwrap_or(&empty_vec);
    let plan_baselines = payload
        .get("plan_baselines")
        .and_then(Value::as_array)
        .unwrap_or(&empty_vec);
    let mut conn =
        db.0.lock()
            .map_err(|_| "Database lock failed".to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM plan_baseline", [])
        .map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM task_dependency", [])
        .map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM task", [])
        .map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM project", [])
        .map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM project_member", [])
        .map_err(|e| e.to_string())?;
    tx.execute("DELETE FROM member", [])
        .map_err(|e| e.to_string())?;
    fn strings(row: &Value, expected: usize) -> Result<Vec<String>, String> {
        let a = row.as_array().ok_or("Invalid row")?;
        if a.len() != expected {
            return Err("Invalid column count".to_string());
        }
        Ok(a.iter()
            .map(|v| {
                if v.is_null() {
                    String::new()
                } else if let Some(s) = v.as_str() {
                    s.to_string()
                } else {
                    v.to_string()
                }
            })
            .collect())
    }
    for row in projects {
        let length = row.as_array().map(Vec::len).unwrap_or(0);
        if length == 10 {
            let v = strings(row, 10)?;
            tx.execute("INSERT INTO project(id,name,version,type,status,owner,creator,create_time,update_time,stateflag) VALUES(?,?,?,?,?,?,?,?,?,?)",params_from_iter(v)).map_err(|e|format!("Invalid project: {e}"))?;
        } else {
            let v = strings(row, 14)?;
            tx.execute("INSERT INTO project(id,name,version,type,status,owner,calendar_country,calendar_region,weekend_days,calendar_exceptions,creator,create_time,update_time,stateflag) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",params_from_iter(v)).map_err(|e|format!("Invalid project: {e}"))?;
        }
    }
    for row in tasks {
        let length = row.as_array().map(Vec::len).unwrap_or(0);
        if length == 18 {
            let v = strings(row, 18)?;
            tx.execute("INSERT INTO task(id,project_id,sort_order,name,parent,dependence,start_time,end_time,type,priority,status,progress,comment,assignee,creator,create_time,update_time,stateflag) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",params_from_iter(v)).map_err(|e|format!("Invalid task: {e}"))?;
        } else if length == 19 {
            let v = strings(row, 19)?;
            tx.execute("INSERT INTO task(id,project_id,sort_order,name,parent,dependence,start_time,end_time,type,priority,status,progress,effort_days,comment,assignee,creator,create_time,update_time,stateflag) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",params_from_iter(v)).map_err(|e|format!("Invalid task: {e}"))?;
        } else {
            let v = strings(row, 20)?;
            tx.execute("INSERT INTO task(id,project_id,sort_order,name,parent,dependence,start_time,end_time,type,priority,status,progress,effort_days,schedule_mode,comment,assignee,creator,create_time,update_time,stateflag) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",params_from_iter(v)).map_err(|e|format!("Invalid task: {e}"))?;
        }
    }
    for row in dependencies {
        let v = strings(row, 6)?;
        tx.execute("INSERT INTO task_dependency(id,predecessor_task_id,successor_task_id,dependency_type,lag_minutes,create_time) VALUES(?,?,?,?,?,?)",params_from_iter(v)).map_err(|e|format!("Invalid dependency: {e}"))?;
    }
    for row in members {
        let length = row.as_array().map(Vec::len).unwrap_or(0);
        if length == 9 {
            let v = strings(row, 9)?;
            tx.execute("INSERT INTO member(id,name,email,phone,role,avatar,create_time,update_time,stateflag) VALUES(?,?,?,?,?,?,?,?,?)",params_from_iter(v)).map_err(|e|format!("Invalid member: {e}"))?;
        } else {
            let v = strings(row, 10)?;
            tx.execute("INSERT INTO member(id,name,email,phone,role,avatar,availability_exceptions,create_time,update_time,stateflag) VALUES(?,?,?,?,?,?,?,?,?,?)",params_from_iter(v)).map_err(|e|format!("Invalid member: {e}"))?;
        }
    }
    for row in project_members {
        let v = strings(row, 6)?;
        tx.execute("INSERT INTO project_member(id,project_id,member_id,role,joined_at,stateflag) VALUES(?,?,?,?,?,?)",params_from_iter(v)).map_err(|e|format!("Invalid project_member: {e}"))?;
    }
    for row in plan_baselines {
        let v = strings(row, 7)?;
        tx.execute("INSERT INTO plan_baseline(id,project_id,task_id,task_name,start_time,end_time,created_at) VALUES(?,?,?,?,?,?,?)",params_from_iter(v)).map_err(|e|format!("Invalid plan_baseline: {e}"))?;
    }
    if schema_version.is_some_and(|version| version < 5) {
        tx.execute(
            "INSERT INTO project_member(id,project_id,member_id,role,joined_at,stateflag)
             SELECT 'PM:' || lower(hex(randomblob(9))), p.id, p.owner, 'Owner',
                    datetime('now','localtime'), '0'
             FROM project p JOIN member m ON m.id = p.owner AND m.stateflag = '0'
             WHERE p.stateflag = '0' AND trim(COALESCE(p.owner,'')) <> ''
               AND NOT EXISTS (SELECT 1 FROM project_member pm
                   WHERE pm.project_id = p.id AND pm.member_id = p.owner AND pm.stateflag = '0')",
            [],
        )
        .map_err(|error| error.to_string())?;
        tx.execute(
            "INSERT INTO project_member(id,project_id,member_id,role,joined_at,stateflag)
             SELECT 'PM:' || lower(hex(randomblob(9))), t.project_id, t.assignee, 'Member',
                    datetime('now','localtime'), '0'
             FROM task t JOIN member m ON m.id = t.assignee AND m.stateflag = '0'
             JOIN project p ON p.id = t.project_id AND p.stateflag = '0'
             WHERE t.stateflag = '0' AND trim(COALESCE(t.assignee,'')) <> ''
               AND NOT EXISTS (SELECT 1 FROM project_member pm
                   WHERE pm.project_id = t.project_id AND pm.member_id = t.assignee AND pm.stateflag = '0')",
            [],
        )
        .map_err(|error| error.to_string())?;
    }
    let invalid_relations: i64 = tx
        .query_row(
            "SELECT
                (SELECT COUNT(*) FROM task t LEFT JOIN project p ON p.id = t.project_id
                 WHERE t.stateflag = '0' AND (p.id IS NULL OR p.stateflag <> '0')) +
                (SELECT COUNT(*) FROM project_member pm
                 LEFT JOIN project p ON p.id = pm.project_id
                 LEFT JOIN member m ON m.id = pm.member_id
                 WHERE pm.stateflag = '0' AND (p.id IS NULL OR m.id IS NULL OR p.stateflag <> '0' OR m.stateflag <> '0')) +
                (SELECT COUNT(*) FROM task t
                 LEFT JOIN member m ON m.id = t.assignee AND m.stateflag = '0'
                 LEFT JOIN project_member pm ON pm.project_id = t.project_id
                     AND pm.member_id = t.assignee AND pm.stateflag = '0'
                 WHERE t.stateflag = '0' AND trim(COALESCE(t.assignee, '')) <> ''
                     AND (m.id IS NULL OR pm.id IS NULL)) +
                (SELECT COUNT(*) FROM plan_baseline b
                 LEFT JOIN project p ON p.id = b.project_id
                 LEFT JOIN task t ON t.id = b.task_id AND t.project_id = b.project_id
                 WHERE p.id IS NULL OR t.id IS NULL)",
            [],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
    if invalid_relations > 0 {
        return Err(format!(
            "Import contains {invalid_relations} invalid project, member, assignee, or baseline relationship(s)"
        ));
    }
    tx.commit().map_err(|e| e.to_string())
}

fn backup_directory(db: &DbState) -> PathBuf {
    db.1.parent()
        .unwrap_or_else(|| Path::new("."))
        .join("backups")
}

fn validated_backup_path(db: &DbState, value: &str) -> Result<PathBuf, String> {
    let directory = backup_directory(db);
    fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    let directory = directory
        .canonicalize()
        .map_err(|error| format!("Cannot resolve backup directory: {error}"))?;
    let path = Path::new(value)
        .canonicalize()
        .map_err(|error| format!("Cannot resolve backup path: {error}"))?;
    if !path.starts_with(&directory)
        || path.extension().and_then(|item| item.to_str()) != Some("db")
    {
        return Err("Backup must be a .db file from the EasyProject backup directory".to_string());
    }
    Ok(path)
}

fn database_counts(path: &Path) -> Result<Value, String> {
    let conn =
        rusqlite::Connection::open_with_flags(path, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)
            .map_err(|e| format!("Cannot open backup: {e}"))?;
    let integrity: String = conn
        .query_row("PRAGMA integrity_check", [], |row| row.get(0))
        .map_err(|e| format!("Cannot verify backup: {e}"))?;
    if integrity != "ok" {
        return Err(format!("Backup integrity check failed: {integrity}"));
    }
    let count = |table: &str| -> i64 {
        conn.query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |row| {
            row.get(0)
        })
        .unwrap_or(0)
    };
    Ok(json!({
        "projects": count("project"),
        "tasks": count("task"),
        "members": count("member"),
        "dependencies": count("task_dependency")
        ,"baselines": count("plan_baseline")
    }))
}

fn backup_info(path: &Path) -> Value {
    let file_name = path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or_default();
    let parsed_reason = file_name
        .strip_prefix("easy-project-")
        .and_then(|value| value.split('-').next())
        .unwrap_or("manual");
    let reason = match parsed_reason {
        "auto" | "import" | "restore" | "manual" => parsed_reason,
        _ => "manual",
    };
    let metadata = fs::metadata(path).ok();
    let created_at = metadata
        .as_ref()
        .and_then(|value| value.modified().ok())
        .map(chrono::DateTime::<Local>::from)
        .map(|value| value.to_rfc3339())
        .unwrap_or_default();
    json!({
        "path": path.to_string_lossy(),
        "name": file_name,
        "reason": reason,
        "created_at": created_at,
        "size": metadata.map(|value| value.len()).unwrap_or(0),
        "counts": database_counts(path).ok()
    })
}

fn prune_automatic_backups(dir: &Path, keep: usize) {
    let mut automatic = fs::read_dir(dir)
        .map(|items| {
            items
                .filter_map(Result::ok)
                .map(|entry| entry.path())
                .filter(|path| {
                    path.file_name()
                        .and_then(|value| value.to_str())
                        .is_some_and(|name| name.starts_with("easy-project-auto-"))
                })
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    automatic.sort();
    let remove_count = automatic.len().saturating_sub(keep);
    for path in automatic.into_iter().take(remove_count) {
        let _ = fs::remove_file(path);
    }
}

pub fn create_backup(db: &DbState, reason: &str) -> Result<Value, String> {
    let dir = backup_directory(db);
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let safe_reason = match reason {
        "auto" | "import" | "restore" | "manual" => reason,
        _ => "manual",
    };
    let path = dir.join(format!(
        "easy-project-{}-{}.db",
        safe_reason,
        Local::now().format("%Y%m%d-%H%M%S-%3f")
    ));
    let conn =
        db.0.lock()
            .map_err(|_| "Database lock failed".to_string())?;
    conn.backup(DatabaseName::Main, &path, None)
        .map_err(|e| e.to_string())?;
    drop(conn);
    if safe_reason == "auto" {
        prune_automatic_backups(&dir, 10);
    }
    Ok(backup_info(&path))
}

fn restore_backup(db: &DbState, source: &Path) -> Result<Value, String> {
    database_counts(source)?;
    let safety = create_backup(db, "restore")?;
    let safety_path = safety
        .get("path")
        .and_then(Value::as_str)
        .map(ToOwned::to_owned)
        .unwrap_or_default();
    let mut conn =
        db.0.lock()
            .map_err(|_| "Database lock failed".to_string())?;
    match conn.restore(
        DatabaseName::Main,
        source,
        None::<fn(rusqlite::backup::Progress)>,
    ) {
        Ok(()) => Ok(json!({"safety_backup": safety})),
        Err(error) => {
            let rollback = if safety_path.is_empty() {
                Err(rusqlite::Error::InvalidPath(PathBuf::new()))
            } else {
                conn.restore(
                    DatabaseName::Main,
                    &safety_path,
                    None::<fn(rusqlite::backup::Progress)>,
                )
            };
            match rollback {
                Ok(()) => Err(format!(
                    "Restore failed and current data was rolled back: {error}"
                )),
                Err(rollback_error) => Err(format!(
                    "Restore failed: {error}; automatic rollback also failed: {rollback_error}"
                )),
            }
        }
    }
}

pub fn handle_action(
    db: &State<DbState>,
    action: String,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    match action.as_str() {
        "export_json" => match export_json(db) {
            Ok(v) => ApiResponse::ok(Some(v)),
            Err(e) => ApiResponse::err(&e),
        },
        "import_json" => match import_json(db, data.get("payload").unwrap_or(&Value::Null)) {
            Ok(()) => ApiResponse::ok(None),
            Err(e) => ApiResponse::err(&e),
        },
        "backup" => {
            let reason = data
                .get("reason")
                .and_then(Value::as_str)
                .unwrap_or("manual");
            match create_backup(db, reason) {
                Ok(value) => ApiResponse::ok(Some(value)),
                Err(error) => ApiResponse::err(&error),
            }
        }
        "list_backups" => {
            let dir = backup_directory(db);
            let mut list = fs::read_dir(dir)
                .map(|items| {
                    items
                        .filter_map(Result::ok)
                        .filter(|e| e.path().extension().is_some_and(|x| x == "db"))
                        .map(|e| backup_info(&e.path()))
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();
            list.sort_by(|left, right| {
                left.get("name")
                    .and_then(Value::as_str)
                    .cmp(&right.get("name").and_then(Value::as_str))
            });
            list.reverse();
            ApiResponse::ok(Some(json!({"list":list,"directory":backup_directory(db)})))
        }
        "preview_backup" => {
            let path = data.get("path").and_then(Value::as_str).unwrap_or("");
            if path.is_empty() {
                return ApiResponse::err("Missing backup path");
            }
            let path = match validated_backup_path(db, path) {
                Ok(value) => value,
                Err(error) => return ApiResponse::err(&error),
            };
            match database_counts(&path) {
                Ok(counts) => ApiResponse::ok(Some(json!({"counts":counts}))),
                Err(error) => ApiResponse::err(&error),
            }
        }
        "restore" => {
            let path = data.get("path").and_then(Value::as_str).unwrap_or("");
            if path.is_empty() {
                return ApiResponse::err("Missing backup path");
            }
            let source = match validated_backup_path(db, path) {
                Ok(value) => value,
                Err(error) => return ApiResponse::err(&error),
            };
            match restore_backup(db, &source) {
                Ok(value) => ApiResponse::ok(Some(value)),
                Err(error) => ApiResponse::err(&error),
            }
        }
        _ => ApiResponse::err("Unsupported action for data"),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::common::db_state::init_db;

    #[test]
    fn creates_an_inspectable_backup_with_model_counts() {
        let root =
            std::env::temp_dir().join(format!("easyproject-backup-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&root).expect("temporary backup root");
        let state = init_db(&root.join("project.db")).expect("database should initialize");
        {
            let conn = state.0.lock().expect("database lock");
            conn.execute("INSERT INTO project(id,name) VALUES('p1','Alpha')", [])
                .expect("project should insert");
            conn.execute(
                "INSERT INTO task(id,project_id,name) VALUES('t1','p1','Plan')",
                [],
            )
            .expect("task should insert");
        }

        let info = create_backup(&state, "manual").expect("backup should be created");
        assert_eq!(info["reason"], "manual");
        assert_eq!(info["counts"]["projects"], 1);
        assert_eq!(info["counts"]["tasks"], 1);
        assert!(Path::new(info["path"].as_str().expect("backup path")).exists());

        drop(state);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn round_trips_plan_baselines_in_schema_five() {
        let root = std::env::temp_dir().join(format!(
            "easyproject-baseline-export-{}",
            uuid::Uuid::new_v4()
        ));
        fs::create_dir_all(&root).expect("temporary export root");
        let state = init_db(&root.join("project.db")).expect("database should initialize");
        {
            let conn = state.0.lock().expect("database lock");
            conn.execute("INSERT INTO project(id,name) VALUES('p1','Alpha')", [])
                .expect("project should insert");
            conn.execute(
                "INSERT INTO task(id,project_id,name) VALUES('t1','p1','Plan')",
                [],
            )
            .expect("task should insert");
            conn.execute(
                "INSERT INTO plan_baseline(id,project_id,task_id,task_name,start_time,end_time)
                 VALUES('b1','p1','t1','Plan','2026-07-01','2026-07-02')",
                [],
            )
            .expect("baseline should insert");
        }

        let snapshot = export_json(&state).expect("snapshot should export");
        assert_eq!(snapshot["schemaVersion"], 5);
        assert_eq!(snapshot["plan_baselines"].as_array().unwrap().len(), 1);
        import_json(&state, &snapshot).expect("snapshot should import");
        let count: i64 = state
            .0
            .lock()
            .unwrap()
            .query_row("SELECT COUNT(*) FROM plan_baseline", [], |row| row.get(0))
            .unwrap();
        assert_eq!(count, 1);

        drop(state);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn failed_import_rolls_back_existing_workspace() {
        let root = std::env::temp_dir().join(format!(
            "easyproject-import-rollback-{}",
            uuid::Uuid::new_v4()
        ));
        fs::create_dir_all(&root).expect("temporary import root");
        let state = init_db(&root.join("project.db")).expect("database should initialize");
        state
            .0
            .lock()
            .unwrap()
            .execute(
                "INSERT INTO project(id,name) VALUES('original','Original')",
                [],
            )
            .unwrap();
        let invalid = json!({
            "schemaVersion": 5,
            "projects": [],
            "tasks": [["task","missing",1,"Orphan","","","","","Task","3","Pending",0,0,"fixed_dates","","","","","","0"]],
            "dependencies": [],
            "members": [],
            "project_members": [],
            "plan_baselines": []
        });
        assert!(import_json(&state, &invalid).is_err());
        let name: String = state
            .0
            .lock()
            .unwrap()
            .query_row("SELECT name FROM project WHERE id='original'", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(name, "Original");

        drop(state);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn rejects_backup_paths_outside_the_managed_directory() {
        let root = std::env::temp_dir().join(format!(
            "easyproject-backup-boundary-{}",
            uuid::Uuid::new_v4()
        ));
        fs::create_dir_all(&root).expect("temporary backup root");
        let state = init_db(&root.join("project.db")).expect("database should initialize");
        assert!(validated_backup_path(&state, root.join("project.db").to_str().unwrap()).is_err());
        let backup = create_backup(&state, "manual").expect("backup should be created");
        assert!(validated_backup_path(&state, backup["path"].as_str().unwrap()).is_ok());

        drop(state);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn restores_a_verified_backup_and_preserves_a_safety_snapshot() {
        let root =
            std::env::temp_dir().join(format!("easyproject-restore-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&root).expect("temporary restore root");
        let state = init_db(&root.join("project.db")).expect("database should initialize");
        state
            .0
            .lock()
            .unwrap()
            .execute("INSERT INTO project(id,name) VALUES('p1','Original')", [])
            .unwrap();
        let backup = create_backup(&state, "manual").expect("backup should be created");
        state
            .0
            .lock()
            .unwrap()
            .execute("UPDATE project SET name='Changed' WHERE id='p1'", [])
            .unwrap();

        let result = restore_backup(
            &state,
            Path::new(backup["path"].as_str().expect("backup path")),
        )
        .expect("backup should restore");
        let name: String = state
            .0
            .lock()
            .unwrap()
            .query_row("SELECT name FROM project WHERE id='p1'", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(name, "Original");
        assert!(Path::new(result["safety_backup"]["path"].as_str().unwrap()).exists());

        drop(state);
        let _ = fs::remove_dir_all(root);
    }
}
