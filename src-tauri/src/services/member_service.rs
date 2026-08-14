use crate::common::db_state::DbState;
use crate::db::member_db;
use crate::models::common::ApiResponse;
use crate::models::member::{MemberCreateRequest, NewMember};
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
            info!("Adding member");

            let req: MemberCreateRequest =
                serde_json::from_value(data).map_err(|e| format!("JSON parse error: {}", e))?;

            if req.name.trim().is_empty() {
                return ApiResponse::err("Member name cannot be empty");
            }

            let uuid = Uuid::new_v4().to_string().replace("-", "");
            let unique_part = &uuid[..18.min(uuid.len())];

            let new_member = NewMember {
                id: format!("MEMBER:{}", unique_part),
                name: req.name,
                email: req.email,
                phone: req.phone,
                role: req.role,
                avatar: req.avatar,
                availability_exceptions: req.availability_exceptions,
            };

            if let Err(e) = member_db::insert_member(db, &new_member) {
                return ApiResponse::err(&format!("DB error: {}", e));
            }

            ApiResponse::ok(Some(serde_json::json!({ "id": new_member.id })))
        }

        "get_all" => {
            info!("Listing members");
            let page_index = data.get("pageIndex").and_then(|v| v.as_u64()).unwrap_or(1);
            let page_size = data.get("pageSize").and_then(|v| v.as_u64()).unwrap_or(50);

            match member_db::get_all_member(db, page_index, page_size) {
                Ok((list, total)) => {
                    let total_page = if total == 0 {
                        0
                    } else {
                        (total + page_size - 1) / page_size
                    };

                    ApiResponse::ok(Some(serde_json::json!({
                        "list": list,
                        "total": total,
                        "pageIndex": page_index,
                        "pageSize": page_size,
                        "totalPage": total_page
                    })))
                }
                Err(e) => Err(format!("DB error: {}", e)),
            }
        }

        "update" => {
            info!("Updating member");

            let id = match data.get("id") {
                Some(v) => v.as_str().unwrap_or(""),
                None => return ApiResponse::err("Missing id"),
            };

            let mut param_set = Vec::new();
            let mut value_set = Vec::new();

            const ALLOWED_FIELDS: &[&str] = &[
                "name",
                "email",
                "phone",
                "role",
                "avatar",
                "availability_exceptions",
            ];
            for (key, value) in data.as_object().unwrap() {
                if key == "id" {
                    continue;
                }
                if !ALLOWED_FIELDS.contains(&key.as_str()) {
                    return ApiResponse::err(&format!("Field is not editable: {}", key));
                }
                if key == "availability_exceptions" {
                    let raw = value.as_str().unwrap_or("");
                    let parsed: Value = serde_json::from_str(raw)
                        .map_err(|_| "availability_exceptions must be valid JSON".to_string())?;
                    if !parsed.is_array() {
                        return ApiResponse::err("availability_exceptions must be an array");
                    }
                }
                param_set.push(format!("{} = ?", key));
                value_set.push(value.as_str().unwrap_or("").to_string());
            }

            if param_set.is_empty() {
                info!("No fields to update for id={}", id);
                return ApiResponse::ok(None);
            }

            param_set.push("update_time = datetime('now', 'localtime')".to_string());
            value_set.push(id.to_string());

            if let Err(e) = member_db::update_member(db, &param_set, &value_set) {
                return ApiResponse::err(&format!("DB error: {}", e));
            }
            ApiResponse::ok(None)
        }

        "delete" => {
            info!("Deleting members");
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

            match member_db::removal_blocker(db, &id_list) {
                Ok(Some("project_owner")) => {
                    return ApiResponse::err(
                        "This member owns an active project. Change the project owner first",
                    )
                }
                Ok(Some("task_assignee")) => {
                    return ApiResponse::err(
                        "This member still owns active tasks. Reassign those tasks first",
                    )
                }
                Ok(Some("project_member")) => return ApiResponse::err(
                    "This member still belongs to a project. Remove them from each project first",
                ),
                Ok(_) => {}
                Err(e) => return ApiResponse::err(&format!("DB error: {}", e)),
            }

            if let Err(e) = member_db::remove_member(db, &id_list) {
                return ApiResponse::err(&format!("DB error: {}", e));
            }
            ApiResponse::ok(None)
        }

        "search" => {
            info!("Searching members");
            let query = data
                .get("query")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();

            match member_db::search_members(db, &query) {
                Ok(list) => ApiResponse::ok(Some(serde_json::json!({ "list": list }))),
                Err(e) => Err(format!("DB error: {}", e)),
            }
        }

        _ => ApiResponse::err("Unsupported action for member"),
    }
}
