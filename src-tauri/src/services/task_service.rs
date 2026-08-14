use crate::common::db_state::DbState;
use crate::db::{member_db, project_db, project_member_db, task_db};
use crate::models::common::ApiResponse;
use crate::models::task::{NewTask, TaskCreateRequest};
use log::info;
use serde_json::Value;
use tauri::State;
use uuid::Uuid;

fn validate_schedule(start: &str, end: &str) -> Result<(), String> {
    if !start.is_empty() && !end.is_empty() && start > end {
        return Err("Start time cannot be later than end time".to_string());
    }
    Ok(())
}

fn validate_assignee(db: &State<DbState>, project_id: &str, assignee: &str) -> Result<(), String> {
    if assignee.is_empty() {
        return Ok(());
    }
    match member_db::member_exists(db, assignee) {
        Ok(true) => {}
        Ok(false) => return Err("The selected assignee does not exist".to_string()),
        Err(error) => return Err(format!("DB error: {error}")),
    }
    match project_member_db::exists(db, project_id, assignee) {
        Ok(true) => Ok(()),
        Ok(false) => Err("The selected assignee is not in the project team".to_string()),
        Err(error) => Err(format!("DB error: {error}")),
    }
}

pub fn handle_action(
    db: &State<DbState>,
    action: String,
    data: Value,
) -> Result<ApiResponse<Value>, String> {
    match action.as_str() {
        "add" => {
            info!("Adding task");
            // 解析前端传入数据
            let task_create_request: TaskCreateRequest =
                serde_json::from_value(data).map_err(|e| format!("JSON parse error: {}", e))?;

            if task_create_request.project_id.trim().is_empty() {
                return ApiResponse::err("A task must belong to a project");
            }
            if task_create_request.name.trim().is_empty() {
                return ApiResponse::err("Task name is required");
            }
            if !matches!(
                task_create_request.schedule_mode.as_str(),
                "fixed_effort" | "fixed_dates"
            ) {
                return ApiResponse::err("Schedule mode must be fixed_effort or fixed_dates");
            }
            if let Err(message) = validate_schedule(
                &task_create_request.start_time,
                &task_create_request.end_time,
            ) {
                return ApiResponse::err(&message);
            }
            match project_db::project_exists(db, &task_create_request.project_id) {
                Ok(true) => {}
                Ok(false) => return ApiResponse::err("The selected project does not exist"),
                Err(error) => return ApiResponse::err(&format!("DB error: {}", error)),
            }
            if let Err(message) = task_db::validate_parent(
                db,
                None,
                &task_create_request.project_id,
                &task_create_request.parent,
            ) {
                return ApiResponse::err(&message);
            }
            if let Err(message) = validate_assignee(
                db,
                &task_create_request.project_id,
                &task_create_request.assignee,
            ) {
                return ApiResponse::err(&message);
            }

            let sort_order = match task_db::next_sort_order(
                db,
                &task_create_request.project_id,
                &task_create_request.parent,
            ) {
                Ok(value) => value,
                Err(error) => return ApiResponse::err(&format!("DB error: {}", error)),
            };

            let uuid = Uuid::new_v4().to_string().replace("-", "");
            let unique_part = &uuid[..18.min(uuid.len())];

            let progress = if task_create_request.status == "Done" {
                100
            } else {
                task_create_request.progress.clamp(0, 100)
            };
            let new_task = NewTask {
                id: format!("TASK:{}", unique_part),
                project_id: task_create_request.project_id,
                sort_order,
                creator: "System".to_string(),
                name: task_create_request.name,
                parent: task_create_request.parent,
                dependence: task_create_request.dependence,
                start_time: task_create_request.start_time,
                end_time: task_create_request.end_time,
                r#type: task_create_request.r#type,
                priority: task_create_request.priority,
                status: task_create_request.status,
                progress,
                effort_days: task_create_request.effort_days.max(0.0),
                schedule_mode: task_create_request.schedule_mode,
                comment: task_create_request.comment,
                assignee: task_create_request.assignee,
            };

            if let Err(e) = task_db::insert_task(db, &new_task) {
                return ApiResponse::err(&format!("DB error: {}", e));
            }

            ApiResponse::ok(Some(serde_json::json!({ "id": new_task.id })))
        }

        "get_all" => {
            info!("Listing tasks");
            let page_index = data.get("pageIndex").and_then(|v| v.as_u64()).unwrap_or(1);
            let page_size = data.get("pageSize").and_then(|v| v.as_u64()).unwrap_or(20);
            let project_id = data
                .get("projectId")
                .and_then(|value| value.as_str())
                .filter(|value| !value.is_empty());
            let keyword = data.get("keyword").and_then(|value| value.as_str());
            let status = data.get("status").and_then(|value| value.as_str());
            let priority = data.get("priority").and_then(|value| value.as_str());
            let assignee = data.get("assignee").and_then(|value| value.as_str());
            let sort_by = data
                .get("sortBy")
                .and_then(|value| value.as_str())
                .unwrap_or("sort_order");
            let sort_direction = data
                .get("sortDirection")
                .and_then(|value| value.as_str())
                .unwrap_or("asc");
            let query = task_db::TaskQuery {
                page_index,
                page_size: page_size.clamp(1, 1000),
                project_id,
                keyword,
                status,
                priority,
                assignee,
                sort_by,
                sort_direction,
            };

            return match task_db::query_tasks(db, &query) {
                Ok((list, total)) => {
                    let total_page = if total == 0 {
                        0
                    } else {
                        (total + query.page_size - 1) / query.page_size
                    };

                    ApiResponse::ok(Some(serde_json::json!({
                        "list": list,
                        "total": total,
                        "pageIndex": page_index,
                        "pageSize": query.page_size,
                        "totalPage": total_page
                    })))
                }
                Err(e) => Err(format!("DB error: {}", e)),
            };
        }

        "update" => {
            info!("Updating task");

            // 提取 id
            let id = match data.get("id") {
                Some(v) => v.as_str().unwrap_or(""),
                None => return ApiResponse::err("Missing id"),
            };

            let (current_project_id, current_parent) = match task_db::get_task_relation(db, id) {
                Ok(relation) => relation,
                Err(_) => return ApiResponse::err("Task not found"),
            };
            let target_project_id = data
                .get("project_id")
                .and_then(|value| value.as_str())
                .unwrap_or(&current_project_id);
            let target_parent = data
                .get("parent")
                .and_then(|value| value.as_str())
                .unwrap_or(&current_parent);
            let current_assignee =
                task_db::get_task_assignee(db, id).map_err(|_| "Task not found".to_string())?;
            let target_assignee = data
                .get("assignee")
                .and_then(Value::as_str)
                .unwrap_or(&current_assignee);
            let (current_start, current_end) =
                task_db::get_task_schedule(db, id).map_err(|_| "Task not found".to_string())?;
            let target_start = data
                .get("start_time")
                .and_then(Value::as_str)
                .unwrap_or(&current_start);
            let target_end = data
                .get("end_time")
                .and_then(Value::as_str)
                .unwrap_or(&current_end);
            if let Err(message) = validate_schedule(target_start, target_end) {
                return ApiResponse::err(&message);
            }
            if let Some(progress) = data.get("progress").and_then(Value::as_i64) {
                if !(0..=100).contains(&progress) {
                    return ApiResponse::err("Progress must be between 0 and 100");
                }
            }
            if let Some(effort_days) = data.get("effort_days").and_then(Value::as_f64) {
                if effort_days < 0.0 {
                    return ApiResponse::err("Effort days cannot be negative");
                }
            }
            if let Some(schedule_mode) = data.get("schedule_mode").and_then(Value::as_str) {
                if !matches!(schedule_mode, "fixed_effort" | "fixed_dates") {
                    return ApiResponse::err("Schedule mode must be fixed_effort or fixed_dates");
                }
            }

            // 动态拼接更新字段
            let mut param_set = Vec::new();
            let mut value_set = Vec::new();

            if let Some(project_id) = data.get("project_id").and_then(|value| value.as_str()) {
                if project_id.is_empty() {
                    return ApiResponse::err("A task must belong to a project");
                }
                match project_db::project_exists(db, project_id) {
                    Ok(true) => {}
                    Ok(false) => return ApiResponse::err("The selected project does not exist"),
                    Err(error) => return ApiResponse::err(&format!("DB error: {}", error)),
                }
            }
            if let Err(message) =
                task_db::validate_parent(db, Some(id), target_project_id, target_parent)
            {
                return ApiResponse::err(&message);
            }
            if let Err(message) = validate_assignee(db, target_project_id, target_assignee) {
                return ApiResponse::err(&message);
            }

            const ALLOWED_FIELDS: &[&str] = &[
                "project_id",
                "name",
                "parent",
                "dependence",
                "start_time",
                "end_time",
                "type",
                "priority",
                "status",
                "progress",
                "effort_days",
                "schedule_mode",
                "comment",
                "assignee",
                "sort_order",
            ];
            let completing_task = data.get("status").and_then(Value::as_str) == Some("Done");
            for (key, value) in data.as_object().unwrap() {
                if key == "id" {
                    continue;
                }
                if !ALLOWED_FIELDS.contains(&key.as_str()) {
                    return ApiResponse::err(&format!("Field is not editable: {}", key));
                }
                param_set.push(format!("{} = ?", key));
                value_set.push(if key == "progress" && completing_task {
                    "100".to_string()
                } else {
                    value
                        .as_str()
                        .map(str::to_string)
                        .unwrap_or_else(|| value.to_string())
                });
            }
            if completing_task && !data.as_object().unwrap().contains_key("progress") {
                param_set.push("progress = ?".to_string());
                value_set.push("100".to_string());
            }

            if (target_project_id != current_project_id || target_parent != current_parent)
                && !data.as_object().unwrap().contains_key("sort_order")
            {
                let next_order =
                    match task_db::next_sort_order(db, target_project_id, target_parent) {
                        Ok(value) => value,
                        Err(error) => return ApiResponse::err(&format!("DB error: {}", error)),
                    };
                param_set.push("sort_order = ?".to_string());
                value_set.push(next_order.to_string());
            }

            // 没有可更新字段
            if param_set.is_empty() {
                info!("No fields to update for id={}", id);
                return ApiResponse::ok(None);
            }

            param_set.push("update_time = datetime('now', 'localtime')".to_string());
            value_set.push(id.to_string());

            if let Err(e) = task_db::update_task(db, &param_set, &value_set) {
                return ApiResponse::err(&format!("DB error: {}", e));
            }
            ApiResponse::ok(None)
        }

        "delete" => {
            info!("Deleting tasks");
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

            match task_db::tasks_have_active_children(db, &id_list) {
                Ok(true) => return ApiResponse::err("Delete or move child tasks first"),
                Ok(false) => {}
                Err(error) => return ApiResponse::err(&format!("DB error: {}", error)),
            }

            if let Err(e) = task_db::remove_task(db, &id_list) {
                return ApiResponse::err(&format!("DB error: {}", e));
            }
            ApiResponse::ok(None)
        }

        _ => ApiResponse::err("Unsupported action for task"),
    }
}
