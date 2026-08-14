use crate::common::db_state::DbState;
use crate::db::task_dependency_db;
use crate::models::common::ApiResponse;
use serde_json::Value;
use tauri::State;

pub fn handle_action(
    db: &State<DbState>,
    action: String,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    match action.as_str() {
        "get_all" => {
            let project_id = data.get("projectId").and_then(Value::as_str).unwrap_or("");
            if project_id.is_empty() {
                return ApiResponse::err("Missing projectId");
            }
            match task_dependency_db::list_for_project(db, project_id) {
                Ok(list) => ApiResponse::ok(Some(serde_json::json!({ "list": list }))),
                Err(error) => ApiResponse::err(&error),
            }
        }
        "set_for_task" => {
            let task_id = data.get("taskId").and_then(Value::as_str).unwrap_or("");
            let predecessors = data
                .get("predecessorIds")
                .and_then(Value::as_array)
                .map(|items| {
                    items
                        .iter()
                        .filter_map(Value::as_str)
                        .map(str::to_string)
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default();
            if task_id.is_empty() {
                return ApiResponse::err("Missing taskId");
            }
            match task_dependency_db::replace_predecessors(db, task_id, &predecessors) {
                Ok(()) => ApiResponse::ok(None),
                Err(error) => ApiResponse::err(&error),
            }
        }
        _ => ApiResponse::err("Unsupported action for task_dependency"),
    }
}
