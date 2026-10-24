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
    if matches!(action, "add" | "update") {
        crate::common::field_dictionary::validate(model, &data)?;
    }
    if model == "project" && action == "create_from_template" {
        crate::common::field_dictionary::validate(model, &data["project"])?;
        if let Some(tasks) = data["tasks"].as_array() {
            for task in tasks {
                crate::common::field_dictionary::validate("task", task)?;
            }
        }
    }
    let hierarchy_data =
        if matches!(model, "task" | "task_status") && matches!(action, "add" | "update") {
            let conn = db.lock_connection().map_err(|e| e.to_string())?;
            crate::common::task_hierarchy::before_write(&conn, model, action, &data)?;
            Some(data.clone())
        } else {
            None
        };
    let result = match model {
        "project" => project_service::handle_action(db, action.into(), data),
        "task" => task_service::handle_action(db, action.into(), data),
        "task_status" => super::task_status_service::handle_action(db, action.into(), data),
        "member" => member_service::handle_action(db, action.into(), data),
        "project_member" => project_member_service::handle_action(db, action.into(), data),
        _ => return Err("Unsupported entity".into()),
    }?;
    if result.success {
        if let Some(data) = hierarchy_data {
            let conn = db.lock_connection().map_err(|e| e.to_string())?;
            crate::common::task_hierarchy::after_write(
                &conn,
                model,
                action,
                &data,
                result.data.as_ref(),
            )?;
        }
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
        "task_status" => ("task_status", "id,project_id,name,color,sort_order,is_completed,is_default,builtin_key,create_time,update_time,stateflag"),
        "project" => ("project", "id,name,version,type,status,owner,calendar_country,calendar_region,weekend_days,calendar_exceptions,creator,create_time,update_time,stateflag"),
        "task" => ("task", "id,project_id,sort_order,name,parent,dependence,start_time,end_time,type,priority,status,status_id,COALESCE((SELECT is_completed FROM task_status s WHERE s.id=task.status_id),0) AS is_completed,COALESCE((SELECT builtin_key FROM task_status s WHERE s.id=task.status_id),'') AS status_builtin_key,progress,effort_days,schedule_mode,comment,assignee,creator,create_time,update_time,stateflag"),
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
                    ValueRef::Integer(value)
                        if matches!(name.as_str(), "is_completed" | "is_default") =>
                    {
                        json!(value != 0)
                    }
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
