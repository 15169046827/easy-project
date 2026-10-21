use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::path::Path;

pub const SESSION_SECONDS: i64 = 12 * 60 * 60;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: String,
    pub username: String,
    pub admin: bool,
    pub must_change_password: bool,
}

pub fn open(path: &Path) -> Result<Connection, String> {
    let db = Connection::open(path).map_err(|e| e.to_string())?;
    let version: i64 = db
        .query_row("PRAGMA user_version", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    if version > 2 {
        return Err("Account schema is newer than this server supports".into());
    }
    db.execute_batch(
        "PRAGMA foreign_keys=ON;
         BEGIN IMMEDIATE;
         CREATE TABLE IF NOT EXISTS account(
           id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE,
           password_hash TEXT NOT NULL, admin INTEGER NOT NULL DEFAULT 0,
           must_change INTEGER NOT NULL DEFAULT 1, disabled INTEGER NOT NULL DEFAULT 0);
         CREATE TABLE IF NOT EXISTS session(
           token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES account(id),
           expires INTEGER NOT NULL);
         CREATE INDEX IF NOT EXISTS session_expiry ON session(expires);
         CREATE TABLE IF NOT EXISTS mcp_token(
           id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES account(id),
           name TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE,
           scope TEXT NOT NULL CHECK(scope IN ('read','write','delete')),
           created INTEGER NOT NULL, expires INTEGER NOT NULL);
         CREATE INDEX IF NOT EXISTS mcp_token_account ON mcp_token(account_id);
         PRAGMA user_version=2;
         COMMIT;",
    )
    .map_err(|e| e.to_string())?;
    Ok(db)
}

pub fn digest(token: &str) -> String {
    format!("{:x}", Sha256::digest(token.as_bytes()))
}

pub fn random_token() -> String {
    format!(
        "{}{}",
        uuid::Uuid::new_v4().simple(),
        uuid::Uuid::new_v4().simple()
    )
}

pub fn password_hash(password: &str) -> Result<String, String> {
    if !(12..=128).contains(&password.chars().count()) {
        return Err("Password must contain 12 to 128 characters".into());
    }
    Argon2::default()
        .hash_password(password.as_bytes(), &SaltString::generate(&mut OsRng))
        .map(|hash| hash.to_string())
        .map_err(|_| "Password hashing failed".into())
}

pub fn verify(password: &str, hash: &str) -> bool {
    PasswordHash::new(hash).is_ok_and(|parsed| {
        Argon2::default()
            .verify_password(password.as_bytes(), &parsed)
            .is_ok()
    })
}

pub fn create(
    db: &Connection,
    username: &str,
    password: &str,
    admin: bool,
) -> Result<User, String> {
    create_account(db, username, password, admin, true)
}

pub fn register(db: &Connection, username: &str, password: &str) -> Result<User, String> {
    let count: i64 = db
        .query_row("SELECT COUNT(*) FROM account", [], |r| r.get(0))
        .map_err(|_| "Account unavailable")?;
    if count >= 1000 {
        return Err("Registration capacity reached; contact the administrator".into());
    }
    create_account(db, username, password, false, false)
}

fn create_account(
    db: &Connection,
    username: &str,
    password: &str,
    admin: bool,
    must_change: bool,
) -> Result<User, String> {
    if !(3..=48).contains(&username.len())
        || !username
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"_-".contains(&b))
    {
        return Err("Username must be 3-48 ASCII letters, digits, _ or -".into());
    }
    let hash = password_hash(password)?;
    let user = User {
        id: uuid::Uuid::new_v4().simple().to_string(),
        username: username.to_owned(),
        admin,
        must_change_password: must_change,
    };
    db.execute(
        "INSERT INTO account(id,username,password_hash,admin,must_change) VALUES(?1,?2,?3,?4,?5)",
        params![user.id, user.username, hash, admin, must_change],
    )
    .map_err(|_| "Account creation failed (possibly duplicate username)")?;
    Ok(user)
}

fn read_user(row: &rusqlite::Row<'_>) -> rusqlite::Result<User> {
    Ok(User {
        id: row.get(0)?,
        username: row.get(1)?,
        admin: row.get(2)?,
        must_change_password: row.get(3)?,
    })
}

pub fn login(
    db: &Connection,
    username: &str,
    password: &str,
    dummy_hash: &str,
) -> Result<(User, String), String> {
    let record = db.query_row(
        "SELECT id,username,admin,must_change,password_hash FROM account WHERE username=?1 AND disabled=0",
        [username], |row| Ok((read_user(row)?, row.get::<_, String>(4)?)),
    ).optional().map_err(|_| "Authentication unavailable")?;
    let hash = record
        .as_ref()
        .map(|(_, hash)| hash.as_str())
        .unwrap_or(dummy_hash);
    let valid = verify(password, hash);
    let (user, _) = record
        .filter(|_| valid)
        .ok_or("Invalid username or password")?;
    let token = random_token();
    let now = chrono::Utc::now().timestamp();
    db.execute("DELETE FROM session WHERE expires <= ?1", [now])
        .map_err(|_| "Session unavailable")?;
    // Bound sessions for each account; only most recent 20 are retained.
    db.execute("DELETE FROM session WHERE account_id=?1 AND token_hash NOT IN (SELECT token_hash FROM session WHERE account_id=?1 ORDER BY expires DESC LIMIT 19)", [&user.id]).map_err(|_| "Session unavailable")?;
    db.execute(
        "INSERT INTO session VALUES(?1,?2,?3)",
        params![digest(&token), user.id, now + SESSION_SECONDS],
    )
    .map_err(|_| "Session unavailable")?;
    Ok((user, token))
}

pub fn authenticate(db: &Connection, token: &str) -> Result<User, String> {
    if token.len() != 64 {
        return Err("Authentication required".into());
    }
    db.query_row(
        "SELECT a.id,a.username,a.admin,a.must_change FROM account a JOIN session s ON s.account_id=a.id
         WHERE s.token_hash=?1 AND s.expires>?2 AND a.disabled=0",
        params![digest(token), chrono::Utc::now().timestamp()], read_user,
    ).map_err(|_| "Authentication required".into())
}

pub fn change_password(
    db: &mut Connection,
    user: &User,
    old: &str,
    new: &str,
) -> Result<(), String> {
    let hash: String = db
        .query_row(
            "SELECT password_hash FROM account WHERE id=?1",
            [&user.id],
            |row| row.get(0),
        )
        .map_err(|_| "Account unavailable")?;
    if !verify(old, &hash) {
        return Err("Invalid current password".into());
    }
    if old == new {
        return Err("New password must differ".into());
    }
    let new_hash = password_hash(new)?;
    let tx = db.transaction().map_err(|_| "Account unavailable")?;
    tx.execute(
        "UPDATE account SET password_hash=?1,must_change=0 WHERE id=?2",
        params![new_hash, user.id],
    )
    .map_err(|_| "Password update failed")?;
    tx.execute("DELETE FROM session WHERE account_id=?1", [&user.id])
        .map_err(|_| "Session invalidation failed")?;
    tx.execute("DELETE FROM mcp_token WHERE account_id=?1", [&user.id])
        .map_err(|_| "Token invalidation failed")?;
    tx.commit().map_err(|_| "Password update failed".into())
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct McpToken {
    pub id: String,
    pub name: String,
    pub scope: String,
    pub created: i64,
    pub expires: i64,
}

pub fn create_mcp_token(
    db: &Connection,
    user: &User,
    name: &str,
    scope: &str,
    days: i64,
) -> Result<(McpToken, String), String> {
    if user.must_change_password
        || name.trim().is_empty()
        || name.chars().count() > 64
        || !["read", "write", "delete"].contains(&scope)
        || ![7, 30, 90].contains(&days)
    {
        return Err("Invalid token name, scope or lifetime".into());
    }
    let now = chrono::Utc::now().timestamp();
    db.execute("DELETE FROM mcp_token WHERE expires<=?1", [now])
        .map_err(|_| "Token unavailable")?;
    let count: i64 = db
        .query_row(
            "SELECT COUNT(*) FROM mcp_token WHERE account_id=?1",
            [&user.id],
            |r| r.get(0),
        )
        .map_err(|_| "Token unavailable")?;
    if count >= 20 {
        return Err("Maximum 20 active tokens per account".into());
    }
    let record = McpToken {
        id: uuid::Uuid::new_v4().simple().to_string(),
        name: name.trim().to_owned(),
        scope: scope.to_owned(),
        created: now,
        expires: now + days * 86400,
    };
    let secret = format!("epmcp_{}", random_token());
    db.execute(
        "INSERT INTO mcp_token VALUES(?1,?2,?3,?4,?5,?6,?7)",
        params![
            record.id,
            user.id,
            record.name,
            digest(&secret),
            record.scope,
            record.created,
            record.expires
        ],
    )
    .map_err(|_| "Token unavailable")?;
    Ok((record, secret))
}

pub fn list_mcp_tokens(db: &Connection, user: &User) -> Result<Vec<McpToken>, String> {
    let mut stmt = db.prepare("SELECT id,name,scope,created,expires FROM mcp_token WHERE account_id=?1 AND expires>?2 ORDER BY created DESC,id").map_err(|_| "Token unavailable")?;
    let records = stmt
        .query_map(params![user.id, chrono::Utc::now().timestamp()], |r| {
            Ok(McpToken {
                id: r.get(0)?,
                name: r.get(1)?,
                scope: r.get(2)?,
                created: r.get(3)?,
                expires: r.get(4)?,
            })
        })
        .map_err(|_| "Token unavailable")?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|_| "Token unavailable".to_owned())?;
    Ok(records)
}

pub fn revoke_mcp_token(db: &Connection, user: &User, id: &str) -> Result<(), String> {
    if db
        .execute(
            "DELETE FROM mcp_token WHERE account_id=?1 AND id=?2",
            params![user.id, id],
        )
        .map_err(|_| "Token unavailable")?
        != 1
    {
        return Err("Token not found".into());
    }
    Ok(())
}

pub fn authenticate_mcp(db: &Connection, secret: &str) -> Result<(User, String), String> {
    if secret.len() != 70 || !secret.starts_with("epmcp_") {
        return Err("MCP token required".into());
    }
    db.query_row("SELECT a.id,a.username,a.admin,a.must_change,t.scope FROM account a JOIN mcp_token t ON t.account_id=a.id WHERE t.token_hash=?1 AND t.expires>?2 AND a.disabled=0 AND a.must_change=0", params![digest(secret),chrono::Utc::now().timestamp()], |r| Ok((read_user(r)?,r.get(4)?))).map_err(|_| "MCP token required".into())
}

pub fn list(db: &Connection) -> Result<Vec<User>, String> {
    let mut stmt = db
        .prepare(
            "SELECT id,username,admin,must_change FROM account WHERE disabled=0 ORDER BY username",
        )
        .map_err(|e| e.to_string())?;
    let users = stmt
        .query_map([], read_user)
        .map_err(|e| e.to_string())?
        .collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|e| e.to_string());
    users
}
