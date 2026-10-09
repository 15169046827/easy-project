//! Explicitly launched local stdio MCP. No network listener or automatic database migration.
mod protocol;
#[cfg(test)]
mod tests;
mod tools;

use crate::common::db_state::{DbState, CURRENT_SCHEMA_VERSION};
use rusqlite::{Connection, OpenFlags};
use std::io::{self, BufRead, Read, Write};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::Duration;

pub const MAX_MESSAGE_BYTES: usize = 262_144;

#[derive(Clone, Copy, Default)]
pub struct Permissions {
    pub write: bool,
    pub delete: bool,
}

pub fn open_database(path: &Path, permissions: Permissions) -> Result<DbState, String> {
    if !path.is_absolute()
        || !path.is_file()
        || path.extension().and_then(|x| x.to_str()) != Some("db")
    {
        return Err("--database must identify an existing absolute .db path; start EasyProject to initialize it first".into());
    }
    if permissions.delete && !permissions.write {
        return Err("--allow-delete requires --allow-write".into());
    }
    let path = path.canonicalize().map_err(|e| e.to_string())?;
    let flags = if permissions.write {
        OpenFlags::SQLITE_OPEN_READ_WRITE
    } else {
        OpenFlags::SQLITE_OPEN_READ_ONLY
    };
    let connection = Connection::open_with_flags(&path, flags).map_err(|e| e.to_string())?;
    connection
        .busy_timeout(Duration::from_secs(5))
        .map_err(|e| e.to_string())?;
    connection
        .execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|e| e.to_string())?;
    let version: i64 = connection
        .query_row("PRAGMA user_version", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    if version != CURRENT_SCHEMA_VERSION {
        return Err(format!("Schema {version} unsupported; expected {CURRENT_SCHEMA_VERSION}. MCP does not migrate databases"));
    }
    for table in [
        "project",
        "task",
        "member",
        "project_member",
        "task_dependency",
        "plan_baseline",
    ] {
        connection
            .prepare(&format!("SELECT id FROM {table} LIMIT 0"))
            .map_err(|e| e.to_string())?;
    }
    Ok(DbState(Mutex::new(connection), path))
}

pub fn run_cli() -> Result<(), String> {
    let mut args = std::env::args().skip(1);
    let mut path: Option<PathBuf> = None;
    let mut permissions = Permissions::default();
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--database" if path.is_none() => {
                path = Some(PathBuf::from(args.next().ok_or("Missing database path")?))
            }
            "--allow-write" => permissions.write = true,
            "--allow-delete" => permissions.delete = true,
            "--help" => {
                eprintln!("easyproject-mcp --database <absolute existing .db> [--allow-write] [--allow-delete]\nDefault read-only. Explicit client launch grants local access; approve tool calls in your MCP client.");
                return Ok(());
            }
            _ => return Err("Unknown or duplicate argument; use --help".into()),
        }
    }
    let db = open_database(&path.ok_or("Explicit --database is required")?, permissions)?;
    serve(&db, permissions, io::stdin().lock(), io::stdout().lock())
}

pub fn serve(
    db: &DbState,
    permissions: Permissions,
    mut input: impl BufRead,
    mut output: impl Write,
) -> Result<(), String> {
    let mut session = protocol::Session::default();
    loop {
        let mut line = Vec::new();
        let bytes = input
            .by_ref()
            .take((MAX_MESSAGE_BYTES + 1) as u64)
            .read_until(b'\n', &mut line)
            .map_err(|e| e.to_string())?;
        if bytes == 0 {
            return Ok(());
        }
        if bytes > MAX_MESSAGE_BYTES {
            return Err("Message exceeds 256 KiB; session closed without processing it".into());
        }
        let response = match serde_json::from_slice(&line) {
            Ok(message) => session.handle(db, permissions, message),
            Err(_) => Some(protocol::error(
                serde_json::Value::Null,
                -32700,
                "Invalid JSON",
            )),
        };
        if let Some(response) = response {
            serde_json::to_writer(&mut output, &response).map_err(|e| e.to_string())?;
            output
                .write_all(b"\n")
                .and_then(|_| output.flush())
                .map_err(|e| e.to_string())?;
        }
    }
}
