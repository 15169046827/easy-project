//! Transactional identity migration. Disk workspace keys stay separate and stable.
use crate::common::id::{new_id, valid_id};
use rusqlite::{params, Connection};
use std::{collections::HashMap, path::Path};

pub fn open(path: &Path) -> Result<Connection, String> {
    let mut db = Connection::open(path).map_err(|e| e.to_string())?;
    let version: i64 = db
        .query_row("PRAGMA user_version", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;
    if version > 3 {
        return Err("Account schema is newer than this server supports".into());
    }
    if version < 3 {
        let has_accounts: bool = db
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name='account')",
                [],
                |r| r.get(0),
            )
            .map_err(|e| e.to_string())?;
        if has_accounts {
            let parent = path.parent().ok_or("Account directory unavailable")?;
            let backup = parent.join(format!(
                "accounts-pre-schema3-{}.db",
                uuid::Uuid::new_v4().simple()
            ));
            db.backup(
                rusqlite::DatabaseName::Main,
                &backup,
                None::<fn(rusqlite::backup::Progress)>,
            )
            .map_err(|e| format!("Account backup failed: {e}"))?;
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                std::fs::set_permissions(&backup, std::fs::Permissions::from_mode(0o600))
                    .map_err(|_| "Cannot protect account backup")?;
            }
        }
        // Older account tables have no cascading FK. Rebuild all three atomically,
        // rather than changing identity while leaving dangling session/token rows.
        db.execute_batch("PRAGMA foreign_keys=OFF;")
            .map_err(|e| e.to_string())?;
        migrate(&mut db).map_err(|e| format!("Account migration failed: {e}"))?;
    }
    db.execute_batch("PRAGMA foreign_keys=ON;")
        .map_err(|e| e.to_string())?;
    for query in [
        "SELECT id,username,password_hash,avatar,workspace_key FROM account LIMIT 0",
        "SELECT id,token_hash,account_id,expires FROM session LIMIT 0",
        "SELECT id,account_id,token_hash FROM mcp_token LIMIT 0",
        "SELECT id,account_id,token_hash FROM password_reset LIMIT 0",
    ] {
        db.prepare(query)
            .map_err(|_| "Account schema validation failed")?;
    }
    if db
        .prepare("PRAGMA foreign_key_check")
        .map_err(|e| e.to_string())?
        .exists([])
        .map_err(|e| e.to_string())?
    {
        return Err("Account foreign-key validation failed".into());
    }
    Ok(db)
}

fn migrate(db: &mut Connection) -> rusqlite::Result<()> {
    let tx = db.transaction()?;
    tx.execute_batch("CREATE TABLE IF NOT EXISTS account(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,admin INTEGER NOT NULL DEFAULT 0,must_change INTEGER NOT NULL DEFAULT 1,disabled INTEGER NOT NULL DEFAULT 0);
        CREATE TABLE IF NOT EXISTS session(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES account(id),expires INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS mcp_token(id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES account(id),name TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,scope TEXT NOT NULL,created INTEGER NOT NULL,expires INTEGER NOT NULL);
        CREATE TABLE account_next(id TEXT PRIMARY KEY NOT NULL,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,admin INTEGER NOT NULL DEFAULT 0,must_change INTEGER NOT NULL DEFAULT 1,disabled INTEGER NOT NULL DEFAULT 0,avatar TEXT NOT NULL DEFAULT '',workspace_key TEXT NOT NULL UNIQUE);
        CREATE TABLE session_next(id TEXT PRIMARY KEY NOT NULL,token_hash TEXT NOT NULL UNIQUE,account_id TEXT NOT NULL REFERENCES account_next(id),expires INTEGER NOT NULL);
        CREATE TABLE mcp_token_next(id TEXT PRIMARY KEY NOT NULL,account_id TEXT NOT NULL REFERENCES account_next(id),name TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,scope TEXT NOT NULL CHECK(scope IN ('read','write','delete')),created INTEGER NOT NULL,expires INTEGER NOT NULL);")?;
    let mut mapping = HashMap::new();
    {
        let mut stmt =
            tx.prepare("SELECT id,username,password_hash,admin,must_change,disabled FROM account")?;
        let rows = stmt.query_map([], |r| {
            Ok((
                r.get::<_, String>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, String>(2)?,
                r.get::<_, i64>(3)?,
                r.get::<_, i64>(4)?,
                r.get::<_, i64>(5)?,
            ))
        })?;
        for row in rows {
            let (old, name, hash, admin, must_change, disabled) = row?;
            let key = if old.len() == 32
                && old
                    .bytes()
                    .all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase())
            {
                old.clone()
            } else {
                uuid::Uuid::new_v4().simple().to_string()
            };
            let id = if valid_id(&old, "ACCOUNT") {
                old.clone()
            } else {
                format!("ACCOUNT:{key}")
            };
            tx.execute("INSERT INTO account_next(id,username,password_hash,admin,must_change,disabled,workspace_key) VALUES(?1,?2,?3,?4,?5,?6,?7)",params![id,name,hash,admin,must_change,disabled,key])?;
            mapping.insert(old, id);
        }
    }
    {
        let mut stmt = tx.prepare("SELECT token_hash,account_id,expires FROM session")?;
        for row in stmt.query_map([], |r| {
            Ok((
                r.get::<_, String>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, i64>(2)?,
            ))
        })? {
            let (hash, account, expires) = row?;
            let account = mapping.get(&account).ok_or(rusqlite::Error::InvalidQuery)?;
            tx.execute(
                "INSERT INTO session_next VALUES(?1,?2,?3,?4)",
                params![new_id("SESSION"), hash, account, expires],
            )?;
        }
    }
    {
        let mut stmt = tx
            .prepare("SELECT id,account_id,name,token_hash,scope,created,expires FROM mcp_token")?;
        for row in stmt.query_map([], |r| {
            Ok((
                r.get::<_, String>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, String>(2)?,
                r.get::<_, String>(3)?,
                r.get::<_, String>(4)?,
                r.get::<_, i64>(5)?,
                r.get::<_, i64>(6)?,
            ))
        })? {
            let (old, account, name, hash, scope, created, expires) = row?;
            let account = mapping.get(&account).ok_or(rusqlite::Error::InvalidQuery)?;
            let id = if valid_id(&old, "MCP_TOKEN") {
                old
            } else if old.len() == 32
                && old
                    .bytes()
                    .all(|b| b.is_ascii_hexdigit() && !b.is_ascii_uppercase())
            {
                format!("MCP_TOKEN:{old}")
            } else {
                new_id("MCP_TOKEN")
            };
            tx.execute(
                "INSERT INTO mcp_token_next VALUES(?1,?2,?3,?4,?5,?6,?7)",
                params![id, account, name, hash, scope, created, expires],
            )?;
        }
    }
    tx.execute_batch("DROP TABLE session; DROP TABLE mcp_token; DROP TABLE account;
        ALTER TABLE account_next RENAME TO account; ALTER TABLE session_next RENAME TO session; ALTER TABLE mcp_token_next RENAME TO mcp_token;
        CREATE INDEX session_expiry ON session(expires); CREATE INDEX mcp_token_account ON mcp_token(account_id);
        CREATE TABLE password_reset(id TEXT PRIMARY KEY NOT NULL,account_id TEXT NOT NULL UNIQUE REFERENCES account(id),token_hash TEXT NOT NULL UNIQUE,created INTEGER NOT NULL,expires INTEGER NOT NULL);
        PRAGMA user_version=3;")?;
    if tx.prepare("PRAGMA foreign_key_check")?.exists([])? {
        return Err(rusqlite::Error::InvalidQuery);
    }
    tx.commit()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn schema_two_preserves_workspace_key_hashes_sessions_and_token_permissions() {
        let root =
            std::env::temp_dir().join(format!("account-v2-{}", uuid::Uuid::new_v4().simple()));
        std::fs::create_dir_all(&root).unwrap();
        let path = root.join("accounts.db");
        let legacy = uuid::Uuid::new_v4().simple().to_string();
        let work = root.join("workspaces").join(&legacy);
        std::fs::create_dir_all(&work).unwrap();
        std::fs::write(
            work.join("preserved-fixture.bin"),
            b"Existing workspace bytes",
        )
        .unwrap();
        let db = Connection::open(&path).unwrap();
        db.execute_batch("CREATE TABLE account(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,admin INTEGER NOT NULL DEFAULT 0,must_change INTEGER NOT NULL DEFAULT 1,disabled INTEGER NOT NULL DEFAULT 0);
            CREATE TABLE session(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES account(id),expires INTEGER NOT NULL);
            CREATE TABLE mcp_token(id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES account(id),name TEXT NOT NULL,token_hash TEXT NOT NULL UNIQUE,scope TEXT NOT NULL,created INTEGER NOT NULL,expires INTEGER NOT NULL); PRAGMA user_version=2;").unwrap();
        let hash = crate::auth::password_hash("abc123").unwrap();
        db.execute(
            "INSERT INTO account VALUES(?1,'old_account',?2,1,0,0)",
            params![legacy, hash],
        )
        .unwrap();
        let session = "a".repeat(64);
        let token = format!("epmcp_{}", "b".repeat(64));
        db.execute(
            "INSERT INTO session VALUES(?1,?2,9999999999)",
            params![crate::auth::digest(&session), legacy],
        )
        .unwrap();
        db.execute(
            "INSERT INTO mcp_token VALUES(?1,?2,'Synthetic token',?3,'delete',123,9999999999)",
            params![
                uuid::Uuid::new_v4().simple().to_string(),
                legacy,
                crate::auth::digest(&token)
            ],
        )
        .unwrap();
        drop(db);
        let db = open(&path).unwrap();
        let user = crate::auth::authenticate(&db, &session).unwrap();
        assert_eq!(user.id, format!("ACCOUNT:{legacy}"));
        assert!(user.admin);
        assert_eq!(
            crate::auth::authenticate_mcp(&db, &token).unwrap().1,
            "delete"
        );
        assert_eq!(
            db.query_row("SELECT workspace_key FROM account", [], |r| r
                .get::<_, String>(0))
                .unwrap(),
            legacy
        );
        assert_eq!(
            db.query_row("SELECT password_hash FROM account", [], |r| r
                .get::<_, String>(0))
                .unwrap(),
            hash
        );
        assert_eq!(
            std::fs::read(work.join("preserved-fixture.bin")).unwrap(),
            b"Existing workspace bytes"
        );
        for (table, prefix) in [
            ("account", "ACCOUNT"),
            ("session", "SESSION"),
            ("mcp_token", "MCP_TOKEN"),
        ] {
            let id: String = db
                .query_row(&format!("SELECT id FROM {table}"), [], |r| r.get(0))
                .unwrap();
            assert!(valid_id(&id, prefix));
        }
        assert_eq!(
            db.query_row("PRAGMA foreign_keys", [], |r| r.get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert!(std::fs::read_dir(root)
            .unwrap()
            .filter_map(Result::ok)
            .any(|entry| entry
                .file_name()
                .to_string_lossy()
                .starts_with("accounts-pre-schema3-")));
    }
}
