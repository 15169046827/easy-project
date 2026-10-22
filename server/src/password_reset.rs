//! High-entropy administrator-issued codes; never allow username-only resets.
use crate::{auth, common::id::new_id};
use rusqlite::{params, Connection, OptionalExtension};

pub fn issue(db: &mut Connection, username: &str) -> Result<String, String> {
    let account: String = db
        .query_row(
            "SELECT id FROM account WHERE username=?1 AND disabled=0",
            [username],
            |r| r.get(0),
        )
        .map_err(|_| "Account unavailable")?;
    let code = format!("epreset_{}", auth::random_token());
    let now = chrono::Utc::now().timestamp();
    let tx = db.transaction().map_err(|_| "Reset unavailable")?;
    tx.execute(
        "DELETE FROM password_reset WHERE account_id=?1 OR expires<=?2",
        params![account, now],
    )
    .map_err(|_| "Reset unavailable")?;
    tx.execute(
        "INSERT INTO password_reset VALUES(?1,?2,?3,?4,?5)",
        params![
            new_id("PASSWORD_RESET"),
            account,
            auth::digest(&code),
            now,
            now + 900
        ],
    )
    .map_err(|_| "Reset unavailable")?;
    tx.commit().map_err(|_| "Reset unavailable")?;
    Ok(code)
}

pub fn reset(
    db: &mut Connection,
    username: &str,
    code: &str,
    password: &str,
) -> Result<(), String> {
    if code.len() != 72 || !code.starts_with("epreset_") {
        return Err("Invalid or expired reset code".into());
    }
    let now = chrono::Utc::now().timestamp();
    let tx = db.transaction().map_err(|_| "Reset unavailable")?;
    let account: Option<String>=tx.query_row("SELECT a.id FROM account a JOIN password_reset r ON r.account_id=a.id WHERE a.username=?1 AND a.disabled=0 AND r.token_hash=?2 AND r.expires>?3",params![username,auth::digest(code),now],|r|r.get(0)).optional().map_err(|_|"Reset unavailable")?;
    let account = account.ok_or("Invalid or expired reset code")?;
    let hash = auth::password_hash(password)?;
    tx.execute(
        "UPDATE account SET password_hash=?1,must_change=0 WHERE id=?2",
        params![hash, account],
    )
    .map_err(|_| "Reset unavailable")?;
    for table in ["session", "mcp_token", "password_reset"] {
        tx.execute(
            &format!("DELETE FROM {table} WHERE account_id=?1"),
            [&account],
        )
        .map_err(|_| "Reset unavailable")?;
    }
    tx.commit().map_err(|_| "Reset unavailable".into())
}
