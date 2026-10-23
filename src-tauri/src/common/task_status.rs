//! Project-owned workflow states. Labels are not lifecycle categories.
use super::id::new_id;
use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct TaskStatus {
    pub id: String,
    pub project_id: String,
    pub name: String,
    pub color: String,
    pub sort_order: i64,
    pub is_completed: bool,
    pub is_default: bool,
    pub builtin_key: String,
}

pub fn create_schema(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS task_status(
            id TEXT PRIMARY KEY NOT NULL,
            project_id TEXT NOT NULL REFERENCES project(id),
            name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 64),
            color TEXT NOT NULL DEFAULT '#64748b',
            sort_order INTEGER NOT NULL DEFAULT 0,
            is_completed INTEGER NOT NULL DEFAULT 0 CHECK(is_completed IN (0,1)),
            is_default INTEGER NOT NULL DEFAULT 0 CHECK(is_default IN (0,1)),
            builtin_key TEXT NOT NULL DEFAULT '',
            create_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            update_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            stateflag TEXT NOT NULL DEFAULT '0'
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_task_status_name
            ON task_status(project_id,name) WHERE stateflag='0';
        CREATE UNIQUE INDEX IF NOT EXISTS idx_task_status_default
            ON task_status(project_id) WHERE is_default=1 AND stateflag='0';",
    )
}

pub fn seed_project(conn: &Connection, project_id: &str) -> rusqlite::Result<()> {
    let count: i64 = conn.query_row(
        "SELECT count(*) FROM task_status WHERE project_id=?1",
        [project_id],
        |row| row.get(0),
    )?;
    if count != 0 {
        return Ok(());
    }
    for (order, name, color, completed) in [
        (0, "Pending", "#64748b", false),
        (1, "InProgress", "#3b82f6", false),
        (2, "Done", "#22c55e", true),
    ] {
        conn.execute(
            "INSERT INTO task_status(id,project_id,name,color,sort_order,is_completed,is_default,builtin_key)
             VALUES(?1,?2,?3,?4,?5,?6,?7,?3)",
            params![new_id("TASK_STATUS"), project_id, name, color, order, completed, order == 0],
        )?;
    }
    Ok(())
}

pub fn list(conn: &Connection, project_id: &str) -> rusqlite::Result<Vec<TaskStatus>> {
    let mut statement = conn.prepare(
        "SELECT id,project_id,name,color,sort_order,is_completed,is_default,builtin_key
         FROM task_status WHERE project_id=?1 AND stateflag='0' ORDER BY sort_order,id",
    )?;
    let records = statement.query_map([project_id], |row| {
        Ok(TaskStatus {
            id: row.get(0)?,
            project_id: row.get(1)?,
            name: row.get(2)?,
            color: row.get(3)?,
            sort_order: row.get(4)?,
            is_completed: row.get(5)?,
            is_default: row.get(6)?,
            builtin_key: row.get(7)?,
        })
    })?;
    records.collect()
}

/// Resolve an explicit stable ID only. Never creates or guesses a state.
pub fn resolve(conn: &Connection, project_id: &str, id: &str) -> Result<TaskStatus, String> {
    list(conn, project_id)
        .map_err(|e| e.to_string())?
        .into_iter()
        .find(|status| status.id == id)
        .ok_or_else(|| "Choose an existing active task status in this project".into())
}

/// Compatibility for built-in desktop/template keys only; arbitrary labels never create states.
pub fn resolve_builtin_or_id(
    conn: &Connection,
    project_id: &str,
    value: &str,
) -> Result<TaskStatus, String> {
    let key = if value == "Todo" { "Pending" } else { value };
    list(conn, project_id)
        .map_err(|e| e.to_string())?
        .into_iter()
        .find(|state| {
            state.id == key || (!state.builtin_key.is_empty() && state.builtin_key == key)
        })
        .ok_or_else(|| "Choose an existing active task status in this project".into())
}

/// Caller owns the transaction. Preserve legacy labels per project, including deleted tasks.
pub fn migrate_rows(conn: &Connection) -> rusqlite::Result<()> {
    create_schema(conn)?;
    let has_column = {
        let mut statement = conn.prepare("PRAGMA table_info(task)")?;
        let names = statement.query_map([], |row| row.get::<_, String>(1))?;
        names
            .collect::<rusqlite::Result<Vec<_>>>()?
            .iter()
            .any(|name| name == "status_id")
    };
    if !has_column {
        conn.execute(
            "ALTER TABLE task ADD COLUMN status_id TEXT NOT NULL DEFAULT ''",
            [],
        )?;
    }
    let projects = {
        let mut statement = conn.prepare("SELECT id FROM project ORDER BY id")?;
        let rows = statement.query_map([], |row| row.get::<_, String>(0))?;
        rows.collect::<rusqlite::Result<Vec<_>>>()?
    };
    for project_id in projects {
        seed_project(conn, &project_id)?;
        let labels = {
            let mut statement = conn.prepare("SELECT DISTINCT COALESCE(status,'') FROM task WHERE project_id=?1 AND status_id='' ORDER BY status")?;
            let rows = statement.query_map([&project_id], |row| row.get::<_, String>(0))?;
            rows.collect::<rusqlite::Result<Vec<_>>>()?
        };
        for original in labels {
            let normalized = if original.is_empty() || original == "Todo" {
                "Pending"
            } else {
                &original
            };
            let existing: Option<String> = conn
                .query_row(
                    "SELECT id FROM task_status WHERE project_id=?1 AND name=?2 AND stateflag='0'",
                    params![project_id, normalized],
                    |row| row.get(0),
                )
                .optional()?;
            let id = if let Some(id) = existing {
                id
            } else {
                let id = new_id("TASK_STATUS");
                // Unknown legacy labels are preserved, never inferred as completed.
                conn.execute("INSERT INTO task_status(id,project_id,name,sort_order) VALUES(?1,?2,?3,(SELECT COALESCE(MAX(sort_order),0)+1 FROM task_status WHERE project_id=?2))", params![id, project_id, normalized])?;
                id
            };
            conn.execute("UPDATE task SET status_id=?1 WHERE project_id=?2 AND COALESCE(status,'')=?3 AND status_id=''", params![id, project_id, original])?;
        }
    }
    let invalid: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM task t LEFT JOIN task_status s ON s.id=t.status_id
         WHERE s.id IS NULL OR s.project_id<>t.project_id)",
        [],
        |row| row.get(0),
    )?;
    if invalid {
        return Err(rusqlite::Error::InvalidQuery);
    }
    conn.execute_batch("CREATE INDEX IF NOT EXISTS idx_task_status_reference ON task(status_id);")?;
    let has_progress = conn
        .prepare("SELECT name FROM pragma_table_info('task') WHERE name='progress'")?
        .exists([])?;
    if has_progress {
        conn.execute("UPDATE task SET progress=100 WHERE status_id IN (SELECT id FROM task_status WHERE is_completed=1)", [])?;
    }
    validate_graph(conn)?;
    Ok(())
}

/// Check schema7 exchanges/backups before they can replace the current workspace.
pub fn validate_graph(conn: &Connection) -> rusqlite::Result<()> {
    let invalid: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM project p WHERE
            (SELECT count(*) FROM task_status s WHERE s.project_id=p.id AND s.stateflag='0' AND s.is_default=1)<>1)
         OR EXISTS(SELECT 1 FROM task t LEFT JOIN task_status s ON s.id=t.status_id
            WHERE s.id IS NULL OR s.project_id<>t.project_id OR s.stateflag<>'0')
         OR EXISTS(SELECT 1 FROM task_status s LEFT JOIN project p ON p.id=s.project_id WHERE p.id IS NULL)",
        [], |r| r.get(0))?;
    if invalid {
        return Err(rusqlite::Error::InvalidQuery);
    }
    let mut statement = conn.prepare(
        "SELECT id,name,color,sort_order,is_completed,is_default,builtin_key FROM task_status",
    )?;
    let rows = statement.query_map([], |r| {
        Ok((
            r.get::<_, String>(0)?,
            r.get::<_, String>(1)?,
            r.get::<_, String>(2)?,
            r.get::<_, i64>(3)?,
            r.get::<_, i64>(4)?,
            r.get::<_, i64>(5)?,
            r.get::<_, String>(6)?,
        ))
    })?;
    for row in rows {
        let (id, name, color, order, complete, default, builtin) = row?;
        if !super::id::valid_id(&id, "TASK_STATUS")
            || name.trim() != name
            || name.is_empty()
            || name.chars().count() > 64
            || name.chars().any(char::is_control)
            || color.len() != 7
            || !color.starts_with('#')
            || !color[1..].bytes().all(|b| b.is_ascii_hexdigit())
            || !(0..=1_000_000).contains(&order)
            || !matches!(complete, 0 | 1)
            || !matches!(default, 0 | 1)
            || (!builtin.is_empty()
                && (!matches!(builtin.as_str(), "Pending" | "InProgress" | "Done")
                    || builtin != name))
        {
            return Err(rusqlite::Error::InvalidQuery);
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON; CREATE TABLE project(id TEXT PRIMARY KEY); CREATE TABLE task(id TEXT PRIMARY KEY,project_id TEXT,status TEXT); INSERT INTO project VALUES('p'),('q'); INSERT INTO task VALUES('a','p','受阻'),('b','q','受阻'),('c','p','Done'),('d','p','Todo');").unwrap();
        conn
    }

    #[test]
    fn migration_keeps_unknown_labels_and_scopes_identity_to_project() {
        let conn = fixture();
        let tx = conn.unchecked_transaction().unwrap();
        migrate_rows(&tx).unwrap();
        tx.commit().unwrap();
        let p = list(&conn, "p").unwrap();
        let q = list(&conn, "q").unwrap();
        let blocked = p.iter().find(|s| s.name == "受阻").unwrap();
        assert!(!blocked.is_completed);
        assert!(super::super::id::valid_id(&blocked.id, "TASK_STATUS"));
        assert_ne!(blocked.id, q.iter().find(|s| s.name == "受阻").unwrap().id);
        assert!(resolve(&conn, "q", &blocked.id).is_err());
        assert!(resolve(&conn, "p", "arbitrary text").is_err());
        assert!(p.iter().find(|s| s.name == "Done").unwrap().is_completed);
        let id: String = conn
            .query_row("SELECT status_id FROM task WHERE id='d'", [], |r| r.get(0))
            .unwrap();
        assert_eq!(id, p.iter().find(|s| s.is_default).unwrap().id);
        let original: String = conn
            .query_row("SELECT status FROM task WHERE id='a'", [], |r| r.get(0))
            .unwrap();
        assert_eq!(original, "受阻");
        let ids = p.iter().map(|s| s.id.clone()).collect::<Vec<_>>();
        let tx = conn.unchecked_transaction().unwrap();
        migrate_rows(&tx).unwrap();
        tx.commit().unwrap();
        assert_eq!(
            ids,
            list(&conn, "p")
                .unwrap()
                .iter()
                .map(|s| s.id.clone())
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn invalid_legacy_relation_rolls_back_status_schema_and_references() {
        let conn = fixture();
        conn.execute("INSERT INTO task VALUES('bad','missing','Done')", [])
            .unwrap();
        let tx = conn.unchecked_transaction().unwrap();
        assert!(migrate_rows(&tx).is_err());
        tx.rollback().unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE name='task_status'",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 0);
    }
}
