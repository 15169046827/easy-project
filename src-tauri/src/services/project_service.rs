use crate::common::db_state::DbState;
use crate::db::{member_db, project_db, task_db};
use crate::models::common::ApiResponse;
use crate::models::project::{NewProject, ProjectCreateRequest, ProjectFromTemplateRequest};
use crate::models::task::NewTask;
use log::info;
use rusqlite::params;
use serde_json::Value;
use std::collections::{HashMap, HashSet};
use tauri::State;
use uuid::Uuid;

fn generated_id(prefix: &str) -> String {
    let value = Uuid::new_v4().simple().to_string();
    format!("{prefix}:{}", &value[..18])
}

pub fn handle_action(
    db: &State<DbState>,
    action: String,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    match action.as_str() {
        "add" => {
            info!("Adding project");

            let project_create_request: ProjectCreateRequest =
                serde_json::from_value(data).map_err(|e| format!("JSON parse error: {}", e))?;

            let owner = project_create_request.owner.trim().to_string();
            if !owner.is_empty() {
                match member_db::member_exists(db, &owner) {
                    Ok(true) => {}
                    Ok(false) => return ApiResponse::err("The selected owner does not exist"),
                    Err(e) => return ApiResponse::err(&format!("DB error: {}", e)),
                }
            }

            let uuid = Uuid::new_v4().to_string().replace("-", "");
            let unique_part = &uuid[..18.min(uuid.len())];

            let new_project = NewProject {
                id: format!("PROJECT:{}", unique_part),
                creator: "System".to_string(),
                name: project_create_request.name,
                version: project_create_request.version,
                r#type: project_create_request.r#type,
                status: project_create_request.status,
                owner,
                calendar_country: project_create_request.calendar_country,
                calendar_region: project_create_request.calendar_region,
                weekend_days: project_create_request.weekend_days,
                calendar_exceptions: project_create_request.calendar_exceptions,
            };

            let owner_membership_id = (!new_project.owner.is_empty()).then(|| {
                let uuid = Uuid::new_v4().to_string().replace("-", "");
                format!("PM:{}", &uuid[..18.min(uuid.len())])
            });
            if let Err(e) =
                project_db::insert_project(db, &new_project, owner_membership_id.as_deref())
            {
                return ApiResponse::err(&format!("DB error: {}", e));
            }

            ApiResponse::ok(Some(serde_json::json!({ "id": new_project.id })))
        }

        "create_from_template" => {
            info!("Creating project from template");
            let request: ProjectFromTemplateRequest =
                serde_json::from_value(data).map_err(|e| format!("JSON parse error: {e}"))?;
            if request.project.name.trim().is_empty() {
                return ApiResponse::err("Project name is required");
            }
            if request.tasks.len() > 200 {
                return ApiResponse::err("A project template cannot contain more than 200 tasks");
            }

            let owner = request.project.owner.trim().to_string();
            if !owner.is_empty() {
                match member_db::member_exists(db, &owner) {
                    Ok(true) => {}
                    Ok(false) => return ApiResponse::err("The selected owner does not exist"),
                    Err(e) => return ApiResponse::err(&format!("DB error: {e}")),
                }
            }

            let project = NewProject {
                id: generated_id("PROJECT"),
                creator: "System".to_string(),
                name: request.project.name,
                version: request.project.version,
                r#type: request.project.r#type,
                status: request.project.status,
                owner: owner.clone(),
                calendar_country: request.project.calendar_country,
                calendar_region: request.project.calendar_region,
                weekend_days: request.project.weekend_days,
                calendar_exceptions: request.project.calendar_exceptions,
            };
            let owner_membership_id = (!owner.is_empty()).then(|| generated_id("PM"));

            let mut key_to_id: HashMap<String, String> = HashMap::new();
            let mut tasks = Vec::with_capacity(request.tasks.len());
            let mut dependencies = Vec::new();
            for (sort_order, template_task) in request.tasks.into_iter().enumerate() {
                let key = template_task.key.trim().to_string();
                if key.is_empty() || key_to_id.contains_key(&key) {
                    return ApiResponse::err("Template task keys must be unique and non-empty");
                }
                if template_task.name.trim().is_empty() {
                    return ApiResponse::err("Template task names cannot be empty");
                }
                if !template_task.start_time.is_empty()
                    && !template_task.end_time.is_empty()
                    && template_task.start_time > template_task.end_time
                {
                    return ApiResponse::err("A template task starts after it ends");
                }
                if !matches!(
                    template_task.schedule_mode.as_str(),
                    "fixed_effort" | "fixed_dates"
                ) {
                    return ApiResponse::err(
                        "Template task schedule mode must be fixed_effort or fixed_dates",
                    );
                }
                if !template_task.assignee.is_empty() && template_task.assignee != owner {
                    return ApiResponse::err(
                        "Template tasks can initially be assigned only to the project owner",
                    );
                }

                let parent = if template_task.parent_key.is_empty() {
                    String::new()
                } else {
                    match key_to_id.get(&template_task.parent_key) {
                        Some(id) => id.clone(),
                        None => {
                            return ApiResponse::err(
                                "Template parent tasks must appear before their children",
                            )
                        }
                    }
                };
                let mut unique_predecessors = HashSet::new();
                let mut predecessor_ids = Vec::new();
                for predecessor_key in &template_task.predecessor_keys {
                    if !unique_predecessors.insert(predecessor_key) {
                        return ApiResponse::err("Template dependencies cannot be duplicated");
                    }
                    match key_to_id.get(predecessor_key) {
                        Some(id) => predecessor_ids.push(id.clone()),
                        None => {
                            return ApiResponse::err(
                                "Template predecessors must appear before their successors",
                            )
                        }
                    }
                }

                let task_id = generated_id("TASK");
                let task = NewTask {
                    id: task_id.clone(),
                    project_id: project.id.clone(),
                    sort_order: sort_order as i64,
                    name: template_task.name,
                    parent,
                    dependence: String::new(),
                    start_time: template_task.start_time,
                    end_time: template_task.end_time,
                    r#type: template_task.r#type,
                    priority: template_task.priority,
                    status: template_task.status,
                    progress: 0,
                    effort_days: template_task.effort_days.max(0.0),
                    schedule_mode: template_task.schedule_mode,
                    comment: template_task.comment,
                    assignee: template_task.assignee,
                    creator: "System".to_string(),
                };
                dependencies.extend(
                    predecessor_ids
                        .into_iter()
                        .map(|predecessor_id| (predecessor_id, task_id.clone())),
                );
                key_to_id.insert(key, task_id);
                tasks.push(task);
            }

            let mut connection = db.0.lock().unwrap();
            let transaction = match connection.transaction() {
                Ok(value) => value,
                Err(e) => return ApiResponse::err(&format!("DB error: {e}")),
            };
            if let Err(e) = project_db::insert_project_transaction(
                &transaction,
                &project,
                owner_membership_id.as_deref(),
            ) {
                return ApiResponse::err(&format!("DB error: {e}"));
            }
            for task in &tasks {
                if let Err(e) = task_db::insert_task_transaction(&transaction, task) {
                    return ApiResponse::err(&format!("DB error: {e}"));
                }
            }
            for (predecessor_id, successor_id) in dependencies {
                if let Err(e) = transaction.execute(
                    "INSERT INTO task_dependency
                     (id, predecessor_task_id, successor_task_id, dependency_type, lag_minutes)
                     VALUES (?1, ?2, ?3, 'FS', 0)",
                    params![generated_id("DEP"), predecessor_id, successor_id],
                ) {
                    return ApiResponse::err(&format!("DB error: {e}"));
                }
            }
            if let Err(e) = transaction.commit() {
                return ApiResponse::err(&format!("DB error: {e}"));
            }

            ApiResponse::ok(Some(serde_json::json!({
                "id": project.id,
                "taskCount": tasks.len()
            })))
        }

        "get_all" => {
            info!("Listing projects");
            let page_index = data.get("pageIndex").and_then(|v| v.as_u64()).unwrap_or(1);
            let page_size = data.get("pageSize").and_then(|v| v.as_u64()).unwrap_or(20);

            match project_db::get_all_project(db, page_index, page_size) {
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
            info!("Updating project");

            // 提取 id
            let id = match data.get("id") {
                Some(v) => v.as_str().unwrap_or(""),
                None => return ApiResponse::err("Missing id"),
            };

            let owner = data
                .get("owner")
                .and_then(|value| value.as_str())
                .map(|value| value.trim().to_string());
            if let Some(member_id) = owner.as_deref().filter(|value| !value.is_empty()) {
                match member_db::member_exists(db, member_id) {
                    Ok(true) => {}
                    Ok(false) => return ApiResponse::err("The selected owner does not exist"),
                    Err(e) => return ApiResponse::err(&format!("DB error: {}", e)),
                }
            }

            // 动态拼接更新字段
            let mut param_set = Vec::new();
            let mut value_set = Vec::new();

            const ALLOWED_FIELDS: &[&str] = &[
                "name",
                "version",
                "type",
                "status",
                "owner",
                "calendar_country",
                "calendar_region",
                "weekend_days",
                "calendar_exceptions",
            ];
            for (key, value) in data.as_object().unwrap() {
                if key == "id" {
                    continue;
                }
                if !ALLOWED_FIELDS.contains(&key.as_str()) {
                    return ApiResponse::err(&format!("Field is not editable: {}", key));
                }
                param_set.push(format!("{} = ?", key));
                value_set.push(value.as_str().unwrap_or("").to_string());
            }

            // 没有可更新字段
            if param_set.is_empty() {
                info!("No fields to update for id={}", id);
                return ApiResponse::ok(None);
            }

            param_set.push("update_time = datetime('now', 'localtime')".to_string());
            value_set.push(id.to_string());

            let owner_membership_id =
                owner.as_deref().filter(|value| !value.is_empty()).map(|_| {
                    let uuid = Uuid::new_v4().to_string().replace("-", "");
                    format!("PM:{}", &uuid[..18.min(uuid.len())])
                });
            let owner_membership = owner_membership_id
                .as_deref()
                .zip(owner.as_deref().filter(|value| !value.is_empty()));

            if let Err(e) = project_db::update_project(db, &param_set, &value_set, owner_membership)
            {
                return ApiResponse::err(&format!("DB error: {}", e));
            }
            ApiResponse::ok(None)
        }

        "delete" => {
            info!("Deleting projects");
            // 提取 ids
            let ids = match data.get("ids") {
                Some(v) => v.as_array().cloned().unwrap_or_default(),
                None => return ApiResponse::err("Missing ids"),
            };

            if ids.is_empty() {
                return ApiResponse::err("Empty id list");
            }

            // 转换成 Vec<String>
            let id_list: Vec<String> = ids
                .into_iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect();

            match project_db::projects_have_active_tasks(db, &id_list) {
                Ok(true) => {
                    return ApiResponse::err("Cannot delete a project that still has active tasks")
                }
                Ok(false) => {}
                Err(error) => return ApiResponse::err(&format!("DB error: {}", error)),
            }

            if let Err(e) = project_db::remove_project(db, &id_list) {
                return ApiResponse::err(&format!("DB error: {}", e));
            }
            ApiResponse::ok(None)
        }

        _ => ApiResponse::err("Unsupported action for project"),
    }
}
