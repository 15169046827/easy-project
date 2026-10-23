use crate::common::{db_state::DbState, id::new_id, task_status};
use crate::models::common::ApiResponse;
use rusqlite::params;
use serde_json::{json, Value};

fn text<'a>(data: &'a Value, key: &str) -> Result<&'a str, String> {
    data.get(key)
        .and_then(Value::as_str)
        .ok_or_else(|| format!("Missing string field: {key}"))
}

/// Mutations must be called through entity_api's shared transaction gate.
pub fn handle_action(
    db: &DbState,
    action: String,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    let conn = db.lock_connection().map_err(|e| e.to_string())?;
    if action == "get_all" {
        let project_id = text(&data, "projectId")?;
        return ApiResponse::ok(Some(
            json!({"list":task_status::list(&conn, project_id).map_err(|e|e.to_string())?}),
        ));
    }
    if action == "get_usage" {
        let id = text(&data, "id")?;
        let page = data
            .get("pageIndex")
            .and_then(Value::as_u64)
            .unwrap_or(1)
            .max(1);
        let offset = page
            .saturating_sub(1)
            .saturating_mul(50)
            .min(i64::MAX as u64) as i64;
        let total: i64 = conn
            .query_row("SELECT count(*) FROM task WHERE status_id=?1", [id], |r| {
                r.get(0)
            })
            .map_err(|e| e.to_string())?;
        let mut statement = conn.prepare("SELECT id,name,project_id,stateflag FROM task WHERE status_id=?1 ORDER BY id LIMIT 50 OFFSET ?2").map_err(|e|e.to_string())?;
        let rows = statement.query_map(params![id,offset], |r|Ok(json!({"id":r.get::<_,String>(0)?,"name":r.get::<_,String>(1)?,"project_id":r.get::<_,String>(2)?,"deleted":r.get::<_,String>(3)? != "0"}))).map_err(|e|e.to_string())?;
        let list = rows
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(|e| e.to_string())?;
        return ApiResponse::ok(Some(
            json!({"list":list,"total":total,"pageIndex":page,"pageSize":50}),
        ));
    }
    let map = data.as_object().ok_or("Expected status object")?;
    let allowed: &[&str] = match action.as_str() {
        "add" => &[
            "project_id",
            "name",
            "color",
            "sort_order",
            "is_completed",
            "is_default",
        ],
        "update" => &[
            "id",
            "name",
            "color",
            "sort_order",
            "is_completed",
            "is_default",
        ],
        "delete" => &["id"],
        _ => return Err("Unsupported task status action".into()),
    };
    if map.keys().any(|key| !allowed.contains(&key.as_str())) {
        return Err("Unknown task status field".into());
    }
    let (id, project_id, current) = if action == "add" {
        let project_id = text(&data, "project_id")?.to_owned();
        let active: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM project WHERE id=?1 AND stateflag='0')",
                [&project_id],
                |r| r.get(0),
            )
            .map_err(|e| e.to_string())?;
        if !active {
            return Err("Active project required".into());
        }
        if task_status::list(&conn, &project_id)
            .map_err(|e| e.to_string())?
            .len()
            >= 100
        {
            return Err("A project may have at most 100 active task statuses".into());
        }
        (new_id("TASK_STATUS"), project_id, None)
    } else {
        let id = text(&data, "id")?.to_owned();
        let project_id: String = conn
            .query_row(
                "SELECT project_id FROM task_status WHERE id=?1 AND stateflag='0'",
                [&id],
                |r| r.get(0),
            )
            .map_err(|_| "Active task status not found")?;
        let current = task_status::resolve(&conn, &project_id, &id)?;
        (id, project_id, Some(current))
    };
    if action == "delete" {
        let states = task_status::list(&conn, &project_id).map_err(|e| e.to_string())?;
        if states.len() <= 1 {
            return Err("Cannot delete the last task status".into());
        }
        let references: i64 = conn
            .query_row("SELECT count(*) FROM task WHERE status_id=?1", [&id], |r| {
                r.get(0)
            })
            .map_err(|e| e.to_string())?;
        if references != 0 {
            return Err(format!("Task status is referenced by {references} task(s); use task_status.get_usage to inspect conflicts. Deletion blocked"));
        }
        if current.as_ref().is_some_and(|s| s.is_default) {
            return Err("Choose another default status before deleting this status".into());
        }
        conn.execute("UPDATE task_status SET stateflag=strftime('%s','now'),is_default=0,update_time=datetime('now','localtime') WHERE id=?1", [&id]).map_err(|e|e.to_string())?;
        return ApiResponse::ok(Some(json!({"id":id,"deleted":true})));
    }
    let name = match data.get("name") {
        Some(value) => value.as_str().ok_or("Status name must be a string")?,
        None => current
            .as_ref()
            .map(|s| s.name.as_str())
            .ok_or("Status name required")?,
    }
    .trim();
    if name.is_empty() || name.chars().count() > 64 || name.chars().any(char::is_control) {
        return Err("Status name must contain 1–64 visible characters".into());
    }
    let color = match data.get("color") {
        Some(v) => v.as_str().ok_or("Color must be a string")?,
        None => current
            .as_ref()
            .map(|s| s.color.as_str())
            .unwrap_or("#64748b"),
    };
    if color.len() != 7
        || !color.starts_with('#')
        || !color[1..].bytes().all(|b| b.is_ascii_hexdigit())
    {
        return Err("Color must be #RRGGBB".into());
    }
    let order = match data.get("sort_order") {
        Some(v) => v.as_i64().ok_or("Sort order must be an integer")?,
        None => current.as_ref().map(|s| s.sort_order).unwrap_or(100),
    };
    if !(0..=1_000_000).contains(&order) {
        return Err("Sort order outside range".into());
    }
    let flag = |key: &str, fallback: bool| -> Result<bool, String> {
        match data.get(key) {
            Some(v) => v.as_bool().ok_or_else(|| format!("{key} must be boolean")),
            None => Ok(fallback),
        }
    };
    let completed = flag(
        "is_completed",
        current.as_ref().is_some_and(|s| s.is_completed),
    )?;
    let default = flag("is_default", current.as_ref().is_some_and(|s| s.is_default))?;
    if current.as_ref().is_some_and(|s| s.is_default) && !default {
        return Err("Choose another default status before clearing the current default".into());
    }
    let builtin = current
        .as_ref()
        .filter(|s| s.name == name)
        .map(|s| s.builtin_key.as_str())
        .unwrap_or("");
    if default {
        conn.execute(
            "UPDATE task_status SET is_default=0 WHERE project_id=?1 AND stateflag='0'",
            [&project_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if action == "add" {
        conn.execute("INSERT INTO task_status(id,project_id,name,color,sort_order,is_completed,is_default) VALUES(?1,?2,?3,?4,?5,?6,?7)",params![id,project_id,name,color,order,completed,default]).map_err(|e|e.to_string())?;
    } else {
        conn.execute("UPDATE task_status SET name=?1,color=?2,sort_order=?3,is_completed=?4,is_default=?5,builtin_key=?6,update_time=datetime('now','localtime') WHERE id=?7",params![name,color,order,completed,default,builtin,id]).map_err(|e|e.to_string())?;
        conn.execute("UPDATE task SET status=?1,progress=CASE WHEN ?2 THEN 100 ELSE progress END,update_time=datetime('now','localtime') WHERE status_id=?3",params![name,completed,id]).map_err(|e|e.to_string())?;
    }
    ApiResponse::ok(Some(json!({"id":id})))
}
