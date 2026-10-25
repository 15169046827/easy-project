//! Versioned estimate provenance; zero is not evidence that an estimate was entered.
use rusqlite::Connection;

pub fn migrate(conn: &Connection) -> Result<(), String> {
    let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;
    let mut columns = tx
        .prepare("PRAGMA table_info(task)")
        .map_err(|e| e.to_string())?;
    let has_column = columns
        .query_map([], |row| row.get::<_, String>(1))
        .map_err(|e| e.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|e| e.to_string())?
        .iter()
        .any(|name| name == "effort_state");
    drop(columns);
    if !has_column {
        tx.execute_batch(
        "ALTER TABLE task ADD COLUMN effort_state TEXT NOT NULL DEFAULT 'legacy_unknown'
         CHECK(effort_state IN ('unestimated','estimated','legacy_unknown'));
         UPDATE task SET effort_state=CASE WHEN effort_days>0 THEN 'estimated' ELSE 'legacy_unknown' END;
         PRAGMA user_version=8;",
    ).map_err(|e| e.to_string())?;
    }
    validate_import(&tx)?;
    tx.pragma_update(None, "user_version", 8)
        .map_err(|e| e.to_string())?;
    tx.commit().map_err(|e| e.to_string())
}

pub fn validate_import(conn: &Connection) -> Result<(), String> {
    let invalid: i64 = conn.query_row(
        "SELECT count(*) FROM task WHERE effort_state NOT IN ('unestimated','estimated','legacy_unknown')
         OR (effort_state<>'estimated' AND effort_days<>0)", [], |row| row.get(0),
    ).map_err(|e| e.to_string())?;
    if invalid != 0 {
        return Err("Invalid estimate provenance or nonzero unestimated effort".into());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn migration_preserves_values_and_does_not_guess_historical_zero() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("CREATE TABLE task(id TEXT PRIMARY KEY,effort_days REAL NOT NULL); INSERT INTO task VALUES('zero',0),('positive',2.5); PRAGMA user_version=7;").unwrap();
        migrate(&conn).unwrap();
        assert_eq!(
            conn.query_row("SELECT effort_state FROM task WHERE id='zero'", [], |r| {
                r.get::<_, String>(0)
            })
            .unwrap(),
            "legacy_unknown"
        );
        assert_eq!(
            conn.query_row(
                "SELECT effort_days FROM task WHERE id='positive'",
                [],
                |r| r.get::<_, f64>(0)
            )
            .unwrap(),
            2.5
        );
        conn.execute(
            "UPDATE task SET effort_state='estimated' WHERE id='zero'",
            [],
        )
        .unwrap();
        migrate(&conn).unwrap();
        assert_eq!(
            conn.query_row("SELECT effort_state FROM task WHERE id='zero'", [], |r| {
                r.get::<_, String>(0)
            })
            .unwrap(),
            "estimated"
        );
    }
    #[test]
    fn migration_failure_rolls_back_column_and_version() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("CREATE TABLE task(id TEXT PRIMARY KEY,effort_days REAL NOT NULL); INSERT INTO task VALUES('zero',0); PRAGMA user_version=7; CREATE TRIGGER reject_migration BEFORE UPDATE ON task BEGIN SELECT RAISE(ABORT,'synthetic failure'); END;").unwrap();
        assert!(migrate(&conn).is_err());
        assert_eq!(
            conn.query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            7
        );
        assert!(conn.prepare("SELECT effort_state FROM task").is_err());
    }

    #[test]
    fn full_schema_seven_upgrade_preserves_relations_and_original_snapshot() {
        use crate::common::{db_state::init_db, id::new_id};
        let root = std::env::temp_dir().join(format!(
            "easyproject-effort-upgrade-{}",
            uuid::Uuid::new_v4()
        ));
        std::fs::create_dir(&root).unwrap();
        let path = root.join("workspace.db");
        let state = init_db(&path).unwrap();
        let project = new_id("PROJECT");
        let parent = new_id("TASK");
        let child = new_id("TASK");
        {
            let conn = state.lock_connection().unwrap();
            conn.execute(
                "INSERT INTO project(id,name) VALUES(?1,'Synthetic migration')",
                [&project],
            )
            .unwrap();
            crate::common::task_status::seed_project(&conn, &project).unwrap();
            let status = crate::common::task_status::list(&conn, &project)
                .unwrap()
                .remove(0)
                .id;
            for (id, ancestor, effort) in [(&parent, "", 0.0), (&child, parent.as_str(), 2.5)] {
                conn.execute("INSERT INTO task(id,project_id,parent,name,status_id,effort_days) VALUES(?1,?2,?3,'Synthetic',?4,?5)",rusqlite::params![id,project,ancestor,status,effort]).unwrap();
            }
            conn.execute_batch("ALTER TABLE task DROP COLUMN effort_state; PRAGMA user_version=7;")
                .unwrap();
        }
        drop(state);
        let before = root.join("before-schema7.db");
        std::fs::copy(&path, &before).unwrap();
        let upgraded = init_db(&path).unwrap();
        let conn = upgraded.lock_connection().unwrap();
        assert_eq!(
            conn.query_row(
                "SELECT effort_state FROM task WHERE id=?1",
                [&parent],
                |r| r.get::<_, String>(0)
            )
            .unwrap(),
            "legacy_unknown"
        );
        assert_eq!(
            conn.query_row("SELECT parent FROM task WHERE id=?1", [&child], |r| r
                .get::<_, String>(0))
                .unwrap(),
            parent
        );
        let original = Connection::open(&before).unwrap();
        assert_eq!(
            original
                .query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            7
        );
        assert!(original.prepare("SELECT effort_state FROM task").is_err());
        assert!(std::fs::read_dir(root.join("backups"))
            .unwrap()
            .any(|entry| entry
                .unwrap()
                .file_name()
                .to_string_lossy()
                .starts_with("pre-schema8-")));
        drop(original);
        drop(conn);
        drop(upgraded);
        std::fs::remove_dir_all(root).unwrap();
    }
}
