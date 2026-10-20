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
    if version > 1 {
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
         PRAGMA user_version=1;
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
        must_change_password: true,
    };
    db.execute(
        "INSERT INTO account(id,username,password_hash,admin) VALUES(?1,?2,?3,?4)",
        params![user.id, user.username, hash, admin],
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
    tx.commit().map_err(|_| "Password update failed".into())
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
