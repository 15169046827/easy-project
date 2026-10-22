//! Rewrite the complete identity graph in the caller's transaction.
use super::id::{new_id, valid_id};
use rusqlite::{params, Connection};
use std::collections::HashMap;

pub type IdMappings = HashMap<&'static str, HashMap<String, String>>;

pub fn normalize(conn: &Connection) -> rusqlite::Result<IdMappings> {
    let entities = [
        ("project", "PROJECT"),
        ("task", "TASK"),
        ("member", "MEMBER"),
        ("project_member", "PROJECT_MEMBER"),
        ("task_dependency", "TASK_DEPENDENCY"),
        ("plan_baseline", "PLAN_BASELINE"),
    ];
    let mut maps = HashMap::new();
    for (table, prefix) in entities {
        let mut stmt = conn.prepare(&format!("SELECT id FROM {table}"))?;
        let mut map = HashMap::new();
        for id in stmt.query_map([], |r| r.get::<_, String>(0))? {
            let old = id?;
            if !valid_id(&old, prefix) {
                map.insert(old, new_id(prefix));
            }
        }
        maps.insert(table, map);
    }
    conn.execute_batch("PRAGMA defer_foreign_keys=ON;")?;
    for (table, _) in entities {
        for (old, new) in &maps[table] {
            conn.execute(
                &format!("UPDATE {table} SET id=?1 WHERE id=?2"),
                params![new, old],
            )?;
        }
    }
    for (table, column, target) in [
        ("project", "owner", "member"),
        ("task", "project_id", "project"),
        ("task", "parent", "task"),
        ("task", "assignee", "member"),
        ("project_member", "project_id", "project"),
        ("project_member", "member_id", "member"),
        ("task_dependency", "predecessor_task_id", "task"),
        ("task_dependency", "successor_task_id", "task"),
        ("plan_baseline", "project_id", "project"),
        ("plan_baseline", "task_id", "task"),
    ] {
        for (old, new) in &maps[target] {
            conn.execute(
                &format!("UPDATE {table} SET {column}=?1 WHERE {column}=?2"),
                params![new, old],
            )?;
        }
    }
    {
        let mut stmt = conn.prepare(
            "SELECT id,dependence FROM task WHERE dependence IS NOT NULL AND dependence<>''",
        )?;
        for row in stmt.query_map([], |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)))? {
            let (id, old) = row?;
            let updated = old
                .split(',')
                .map(|key| {
                    maps["task"]
                        .get(key.trim())
                        .map(String::as_str)
                        .unwrap_or(key)
                })
                .collect::<Vec<_>>()
                .join(",");
            if updated != old {
                conn.execute(
                    "UPDATE task SET dependence=?1 WHERE id=?2",
                    params![updated, id],
                )?;
            }
        }
    }
    if conn.prepare("PRAGMA foreign_key_check")?.exists([])? {
        return Err(rusqlite::Error::InvalidQuery);
    }
    Ok(maps)
}

/// Save the expected old-to-new identity map before committing. The file is not
/// a claim of success: callers/validators must verify the committed schema and IDs.
pub fn save_mapping(conn: &Connection, maps: &IdMappings) -> rusqlite::Result<()> {
    if maps.values().all(HashMap::is_empty) {
        return Ok(());
    }
    let path = conn
        .path()
        .filter(|p| !p.is_empty())
        .ok_or(rusqlite::Error::InvalidQuery)?;
    let parent = std::path::Path::new(path)
        .parent()
        .ok_or(rusqlite::Error::InvalidQuery)?;
    let directory = parent.join("backups");
    let io_error = |error| rusqlite::Error::ToSqlConversionFailure(Box::new(error));
    for ancestor in directory.ancestors() {
        if let Ok(metadata) = std::fs::symlink_metadata(ancestor) {
            if metadata.file_type().is_symlink() {
                return Err(rusqlite::Error::InvalidPath(directory));
            }
        }
    }
    std::fs::create_dir_all(&directory).map_err(io_error)?;
    let target = directory.join(format!(
        "id-map-schema6-{}.json",
        uuid::Uuid::new_v4().simple()
    ));
    let mut options = std::fs::OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let mut file = options.open(target).map_err(io_error)?;
    use std::io::Write;
    let bytes=serde_json::to_vec_pretty(&serde_json::json!({"targetSchema":6,"note":"Expected mapping; verify committed database before treating it as applied","mappings":maps})).map_err(|e|rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    file.write_all(&bytes).map_err(io_error)?;
    file.sync_all().map_err(io_error)
}

pub fn migrate(conn: &Connection) -> rusqlite::Result<()> {
    let tx = conn.unchecked_transaction()?;
    let mut maps = normalize(&tx)?;
    let exists: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name='web_revision')",
        [],
        |r| r.get(0),
    )?;
    if exists {
        let old_value: i64 =
            tx.query_row("SELECT value FROM web_revision WHERE id=1", [], |r| {
                r.get(0)
            })?;
        tx.execute_batch("CREATE TABLE web_revision_next(id TEXT PRIMARY KEY NOT NULL,singleton_key INTEGER NOT NULL UNIQUE CHECK(singleton_key=1),value INTEGER NOT NULL);")?;
        let id = new_id("WEB_REVISION");
        tx.execute(
            "INSERT INTO web_revision_next VALUES(?1,1,?2)",
            params![id, old_value],
        )?;
        tx.execute_batch(
            "DROP TABLE web_revision; ALTER TABLE web_revision_next RENAME TO web_revision;",
        )?;
        maps.insert("web_revision", HashMap::from([("1".into(), id)]));
    }
    tx.pragma_update(None, "user_version", 6)?;
    save_mapping(&tx, &maps)?;
    tx.commit()
}

pub fn normalize_memberships(conn: &Connection) -> rusqlite::Result<()> {
    let ids = conn
        .prepare("SELECT id FROM project_member")?
        .query_map([], |r| r.get::<_, String>(0))?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    for old in ids {
        if !valid_id(&old, "PROJECT_MEMBER") {
            conn.execute(
                "UPDATE project_member SET id=?1 WHERE id=?2",
                params![new_id("PROJECT_MEMBER"), old],
            )?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::common::db_state::init_db;

    #[test]
    fn schema_five_graph_migrates_all_relations_and_preserves_original_backup() {
        let root = std::env::temp_dir().join(format!("id-graph-{}", uuid::Uuid::new_v4().simple()));
        std::fs::create_dir_all(&root).unwrap();
        let path = root.join("project_manager.db");
        let state = init_db(&path).unwrap();
        state.lock_connection().unwrap().execute_batch("INSERT INTO member(id,name) VALUES('m','Member');
            INSERT INTO project(id,name,owner) VALUES('p','Project','m');
            INSERT INTO project_member(id,project_id,member_id,role) VALUES('pm','p','m','Owner');
            INSERT INTO task(id,project_id,name,assignee) VALUES('t1','p','Parent','m');
            INSERT INTO task(id,project_id,name,parent,dependence,assignee) VALUES('t2','p','Child','t1','t1','m');
            INSERT INTO task_dependency(id,predecessor_task_id,successor_task_id) VALUES('d','t1','t2');
            INSERT INTO plan_baseline(id,project_id,task_id,task_name) VALUES('b','p','t2','Old snapshot');
            CREATE TABLE web_revision(id INTEGER PRIMARY KEY CHECK(id=1),value INTEGER NOT NULL);
            INSERT INTO web_revision VALUES(1,42); PRAGMA user_version=5;").unwrap();
        drop(state);
        let state = init_db(&path).unwrap();
        let db = state.lock_connection().unwrap();
        let mut identities = Vec::new();
        for (table, prefix) in [
            ("project", "PROJECT"),
            ("task", "TASK"),
            ("member", "MEMBER"),
            ("project_member", "PROJECT_MEMBER"),
            ("task_dependency", "TASK_DEPENDENCY"),
            ("plan_baseline", "PLAN_BASELINE"),
            ("web_revision", "WEB_REVISION"),
        ] {
            for id in db
                .prepare(&format!("SELECT id FROM {table} ORDER BY id"))
                .unwrap()
                .query_map([], |r| r.get::<_, String>(0))
                .unwrap()
            {
                let id = id.unwrap();
                assert!(valid_id(&id, prefix), "{table}");
                identities.push(id);
            }
        }
        let linked:i64=db.query_row("SELECT COUNT(*) FROM task c JOIN task p ON p.id=c.parent AND p.id=c.dependence JOIN task_dependency d ON d.predecessor_task_id=p.id AND d.successor_task_id=c.id JOIN project j ON j.id=c.project_id JOIN member m ON m.id=c.assignee AND m.id=j.owner JOIN project_member pm ON pm.project_id=j.id AND pm.member_id=m.id JOIN plan_baseline b ON b.task_id=c.id AND b.project_id=j.id WHERE c.name='Child' AND p.name='Parent' AND b.task_name='Old snapshot'",[],|r|r.get(0)).unwrap();
        assert_eq!(linked, 1);
        assert_eq!(
            db.query_row(
                "SELECT value FROM web_revision WHERE singleton_key=1",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
            42
        );
        assert_eq!(
            db.query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            6
        );
        assert!(!db
            .prepare("PRAGMA foreign_key_check")
            .unwrap()
            .exists([])
            .unwrap());
        drop(db);
        drop(state);
        let backups = std::fs::read_dir(root.join("backups"))
            .unwrap()
            .map(|x| x.unwrap().path())
            .filter(|p| p.extension().is_some_and(|e| e == "db"))
            .collect::<Vec<_>>();
        assert_eq!(backups.len(), 1);
        let saved =
            Connection::open_with_flags(&backups[0], rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)
                .unwrap();
        assert_eq!(
            saved
                .query_row("SELECT id FROM project", [], |r| r.get::<_, String>(0))
                .unwrap(),
            "p"
        );
        assert_eq!(
            saved
                .query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            5
        );
        drop(saved);
        let reopened = init_db(&path).unwrap();
        for id in identities {
            assert!(reopened.lock_connection().unwrap().query_row("SELECT EXISTS(SELECT 1 FROM project WHERE id=?1 UNION ALL SELECT 1 FROM task WHERE id=?1 UNION ALL SELECT 1 FROM member WHERE id=?1 UNION ALL SELECT 1 FROM project_member WHERE id=?1 UNION ALL SELECT 1 FROM task_dependency WHERE id=?1 UNION ALL SELECT 1 FROM plan_baseline WHERE id=?1 UNION ALL SELECT 1 FROM web_revision WHERE id=?1)",[id],|r|r.get::<_,bool>(0)).unwrap());
        }
    }

    #[test]
    fn failed_identity_update_rolls_back_the_entire_graph() {
        let root =
            std::env::temp_dir().join(format!("id-rollback-{}", uuid::Uuid::new_v4().simple()));
        std::fs::create_dir_all(&root).unwrap();
        let path = root.join("project_manager.db");
        let state = init_db(&path).unwrap();
        state.lock_connection().unwrap().execute_batch("INSERT INTO project(id,name) VALUES('p','Preserved'); INSERT INTO task(id,project_id,name) VALUES('t','p','Task'); CREATE TRIGGER reject_id BEFORE UPDATE OF id ON task BEGIN SELECT RAISE(ABORT,'synthetic failure'); END; PRAGMA user_version=5;").unwrap();
        drop(state);
        assert!(init_db(&path).is_err());
        let db = Connection::open(path).unwrap();
        assert_eq!(
            db.query_row("SELECT id FROM project", [], |r| r.get::<_, String>(0))
                .unwrap(),
            "p"
        );
        assert_eq!(
            db.query_row("SELECT project_id FROM task", [], |r| r.get::<_, String>(0))
                .unwrap(),
            "p"
        );
        assert_eq!(
            db.query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            5
        );
    }
}
