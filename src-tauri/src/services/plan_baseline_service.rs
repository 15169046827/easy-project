use crate::common::db_state::DbState;
use crate::db::plan_baseline_db;
use crate::models::common::ApiResponse;
use crate::models::plan_baseline::{NewPlanBaseline, PlanBaselineSaveRequest};
use log::info;
use serde_json::Value;
use tauri::State;
use uuid::Uuid;

pub fn handle_action(
    db: &State<DbState>,
    action: String,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    match action.as_str() {
        "save" => {
            info!("Saving plan baseline");
            let req: PlanBaselineSaveRequest =
                serde_json::from_value(data).map_err(|e| format!("JSON parse error: {}", e))?;

            if req.project_id.trim().is_empty() {
                return ApiResponse::err("project_id is required");
            }

            let mut baselines = Vec::with_capacity(req.tasks.len());
            for t in &req.tasks {
                let uuid = Uuid::new_v4().to_string().replace("-", "");
                let unique_part = &uuid[..18.min(uuid.len())];
                baselines.push(NewPlanBaseline {
                    id: format!("BL:{}", unique_part),
                    project_id: req.project_id.clone(),
                    task_id: t.task_id.clone(),
                    task_name: t.task_name.clone(),
                    start_time: t.start_time.clone(),
                    end_time: t.end_time.clone(),
                });
            }
            if let Err(e) = plan_baseline_db::replace_for_project(db, &req.project_id, &baselines) {
                return ApiResponse::err(&format!("DB error: {}", e));
            }
            ApiResponse::ok(Some(serde_json::json!({ "saved": req.tasks.len() })))
        }

        "get_by_project" => {
            let project_id = data
                .get("projectId")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            match plan_baseline_db::get_by_project(db, &project_id) {
                Ok(list) => ApiResponse::ok(Some(serde_json::json!({ "list": list }))),
                Err(e) => Err(format!("DB error: {}", e)),
            }
        }

        "clear" => {
            info!("Clearing plan baseline");
            let project_id = data
                .get("projectId")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            if project_id.trim().is_empty() {
                return ApiResponse::err("project_id is required");
            }
            match plan_baseline_db::delete_by_project(db, &project_id) {
                Ok(()) => ApiResponse::ok(None),
                Err(e) => Err(format!("DB error: {}", e)),
            }
        }

        _ => ApiResponse::err("Unsupported action for plan_baseline"),
    }
}
