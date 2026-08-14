use crate::common::db_state::DbState;
use crate::models::common::ApiResponse;
use crate::services::{
    calendar_service, data_service, member_service, plan_baseline_service, project_member_service,
    project_service, task_dependency_service, task_service,
};
use serde_json::Value;
use tauri::State;

#[tauri::command]
pub fn crud_action(
    db: State<DbState>,
    model: String,
    action: String,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    match model.as_str() {
        "project" => project_service::handle_action(&db, action, data),
        "task" => task_service::handle_action(&db, action, data),
        "task_dependency" => task_dependency_service::handle_action(&db, action, data),
        "data" => data_service::handle_action(&db, action, data),
        "calendar" => calendar_service::handle_action(&db, action, data),
        "member" => member_service::handle_action(&db, action, data),
        "project_member" => project_member_service::handle_action(&db, action, data),
        "plan_baseline" => plan_baseline_service::handle_action(&db, action, data),
        _ => ApiResponse::err(&format!("Unsupported model: {}", model)),
    }
}
