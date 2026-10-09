//! Shared desktop/MCP boundary. Validation and entity writes share one SQLite write lock.
use crate::common::db_state::DbState;
use crate::models::common::ApiResponse;
use crate::services::{member_service, project_member_service, project_service, task_service};
use rusqlite::{types::ValueRef, OptionalExtension};
use serde_json::{json, Map, Value};
use std::sync::Mutex;

static ENTITY_GATE: Mutex<()> = Mutex::new(());

pub fn with_write<T>(
    db: &DbState,
    operation: impl FnOnce() -> Result<T, String>,
) -> Result<T, String> {
    let _gate = ENTITY_GATE
        .lock()
        .map_err(|_| "Entity operation lock is poisoned")?;
    db.lock_connection()
        .map_err(|e| e.to_string())?
        .execute_batch("BEGIN IMMEDIATE")
        .map_err(|e| e.to_string())?;
    let result = operation();
    let connection = db.lock_connection().map_err(|e| e.to_string())?;
    if result.is_ok() {
        if let Err(error) = connection.execute_batch("COMMIT") {
            connection
                .execute_batch("ROLLBACK")
                .map_err(|rollback| format!("Commit: {error}; rollback: {rollback}"))?;
            return Err(error.to_string());
        }
    } else {
        connection
            .execute_batch("ROLLBACK")
            .map_err(|e| e.to_string())?;
    }
    result
}

pub fn dispatch_raw(
    db: &DbState,
    model: &str,
    action: &str,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    let result = match model {
        "project" => project_service::handle_action(db, action.into(), data),
        "task" => task_service::handle_action(db, action.into(), data),
        "member" => member_service::handle_action(db, action.into(), data),
        "project_member" => project_member_service::handle_action(db, action.into(), data),
        _ => return Err("Unsupported entity".into()),
    }?;
    if result.success {
        Ok(result)
    } else {
        Err(result.message)
    }
}

pub fn dispatch(
    db: &DbState,
    model: &str,
    action: &str,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    let operation = || dispatch_raw(db, model, action, data);
    if matches!(action, "add" | "update" | "delete") {
        with_write(db, operation)
    } else {
        operation()
    }
}

pub fn get(db: &DbState, model: &str, id: &str) -> Result<Value, String> {
    let (table, fields) = match model {
        "project" => ("project", "id,name,version,type,status,owner,calendar_country,calendar_region,weekend_days,calendar_exceptions,creator,create_time,update_time,stateflag"),
        "task" => ("task", "id,project_id,sort_order,name,parent,dependence,start_time,end_time,type,priority,status,progress,effort_days,schedule_mode,comment,assignee,creator,create_time,update_time,stateflag"),
        "member" => ("member", "id,name,email,phone,role,avatar,availability_exceptions,create_time,update_time,stateflag"),
        "project_member" => ("project_member", "id,project_id,member_id,role,joined_at,stateflag"),
        _ => return Err("Unsupported entity".into()),
    };
    let connection = db.lock_connection().map_err(|e| e.to_string())?;
    // Only fixed internal table names enter SQL; the ID remains a bound parameter.
    let mut statement = connection
        .prepare(&format!(
            "SELECT {fields} FROM {table} WHERE id = ?1 AND stateflag = '0'"
        ))
        .map_err(|e| e.to_string())?;
    let columns = statement
        .column_names()
        .iter()
        .map(|name| name.to_string())
        .collect::<Vec<_>>();
    statement
        .query_row([id], |row| {
            let mut record = Map::new();
            for (index, name) in columns.iter().enumerate() {
                let value = match row.get_ref(index)? {
                    ValueRef::Null => Value::Null,
                    ValueRef::Integer(value) => json!(value),
                    ValueRef::Real(value) => json!(value),
                    ValueRef::Text(value) => json!(String::from_utf8_lossy(value)),
                    ValueRef::Blob(_) => {
                        return Err(rusqlite::Error::InvalidColumnType(
                            index,
                            name.clone(),
                            rusqlite::types::Type::Blob,
                        ))
                    }
                };
                record.insert(name.clone(), value);
            }
            Ok(Value::Object(record))
        })
        .optional()
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Active record not found".into())
}
