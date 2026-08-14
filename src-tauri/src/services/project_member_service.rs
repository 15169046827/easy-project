use crate::common::db_state::DbState;
use crate::db::{member_db, project_db, project_member_db};
use crate::models::common::ApiResponse;
use crate::models::project_member::{NewProjectMember, ProjectMemberCreateRequest};
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
        "add" => {
            info!("Adding project member");
            let req: ProjectMemberCreateRequest =
                serde_json::from_value(data).map_err(|e| format!("JSON parse error: {}", e))?;

            if req.project_id.trim().is_empty() || req.member_id.trim().is_empty() {
                return ApiResponse::err("project_id and member_id are required");
            }

            match project_db::project_exists(db, &req.project_id) {
                Ok(true) => {}
                Ok(false) => return ApiResponse::err("The selected project does not exist"),
                Err(e) => return ApiResponse::err(&format!("DB error: {}", e)),
            }
            match member_db::member_exists(db, &req.member_id) {
                Ok(true) => {}
                Ok(false) => return ApiResponse::err("The selected member does not exist"),
                Err(e) => return ApiResponse::err(&format!("DB error: {}", e)),
            }
            match project_member_db::exists(db, &req.project_id, &req.member_id) {
                Ok(true) => return ApiResponse::err("This member is already in the project"),
                Ok(false) => {}
                Err(e) => return ApiResponse::err(&format!("DB error: {}", e)),
            }

            let uuid = Uuid::new_v4().to_string().replace("-", "");
            let unique_part = &uuid[..18.min(uuid.len())];
            let new_pm = NewProjectMember {
                id: format!("PM:{}", unique_part),
                project_id: req.project_id,
                member_id: req.member_id,
                role: req.role,
            };

            if let Err(e) = project_member_db::insert(db, &new_pm) {
                return ApiResponse::err(&format!("DB error: {}", e));
            }
            ApiResponse::ok(Some(serde_json::json!({ "id": new_pm.id })))
        }

        "get_by_member" => {
            let member_id = data
                .get("memberId")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            match project_member_db::get_by_member(db, &member_id) {
                Ok(list) => ApiResponse::ok(Some(serde_json::json!({ "list": list }))),
                Err(e) => Err(format!("DB error: {}", e)),
            }
        }

        "get_by_project" => {
            let project_id = data
                .get("projectId")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            match project_member_db::get_by_project(db, &project_id) {
                Ok(list) => ApiResponse::ok(Some(serde_json::json!({ "list": list }))),
                Err(e) => Err(format!("DB error: {}", e)),
            }
        }

        "delete" => {
            info!("Deleting project members");
            let ids = match data.get("ids") {
                Some(v) => v.as_array().cloned().unwrap_or_default(),
                None => return ApiResponse::err("Missing ids"),
            };
            if ids.is_empty() {
                return ApiResponse::err("Empty id list");
            }
            let id_list: Vec<String> = ids
                .into_iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect();
            match project_member_db::removal_blocker(db, &id_list) {
                Ok(Some("project_owner")) => {
                    return ApiResponse::err(
                        "The project owner cannot be removed from the team. Change the owner first",
                    )
                }
                Ok(Some("task_assignee")) => {
                    return ApiResponse::err(
                        "This member still owns active tasks. Reassign those tasks first",
                    )
                }
                Ok(_) => {}
                Err(e) => return ApiResponse::err(&format!("DB error: {}", e)),
            }
            if let Err(e) = project_member_db::delete(db, &id_list) {
                return ApiResponse::err(&format!("DB error: {}", e));
            }
            ApiResponse::ok(None)
        }

        _ => ApiResponse::err("Unsupported action for project_member"),
    }
}
