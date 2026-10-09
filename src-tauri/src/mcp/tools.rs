use super::Permissions;
use crate::common::db_state::DbState;
use crate::services::{data_service, entity_api};
use serde_json::{json, Value};
use std::fs::OpenOptions;
use std::io::Write;
use uuid::Uuid;

fn fields(model: &str) -> Value {
    if model == "project_member" {
        return json!({"project_id":{"type":"string","minLength":1,"maxLength":128},"member_id":{"type":"string","minLength":1,"maxLength":128},"role":{"type":"string","maxLength":64}});
    }
    let mut fields = json!({"name":{"type":"string","minLength":1,"maxLength":256}});
    let names: &[&str] = match model {
        "project" => &[
            "version",
            "type",
            "status",
            "owner",
            "calendar_country",
            "calendar_region",
            "weekend_days",
            "calendar_exceptions",
        ],
        "task" => &[
            "project_id",
            "parent",
            "start_time",
            "end_time",
            "type",
            "priority",
            "status",
            "comment",
            "assignee",
            "schedule_mode",
        ],
        "member" => &[
            "email",
            "phone",
            "role",
            "avatar",
            "availability_exceptions",
        ],
        _ => &[],
    };
    for name in names {
        fields[*name] = json!({"type":"string","maxLength":2000});
    }
    if model == "member" {
        fields["name"]["maxLength"] = json!(128);
    }
    if model == "task" {
        fields["progress"] = json!({"type":"integer","minimum":0,"maximum":100});
        fields["effort_days"] = json!({"type":"number","minimum":0});
        fields["schedule_mode"] = json!({"type":"string","enum":["fixed_effort","fixed_dates"]});
        for name in ["start_time", "end_time"] {
            fields[name] = json!({"type":"string","description":"Empty or YYYY-MM-DD; no timezone conversion","maxLength":10});
        }
        fields["project_id"]["description"] =
            json!("Existing active project ID; required for creation");
        fields["assignee"]["description"] =
            json!("Empty or active member ID already in this project's team");
    }
    fields
}

fn object(properties: Value, required: &[&str]) -> Value {
    json!({"type":"object","properties":properties,"required":required,"additionalProperties":false})
}

fn schema(model: &str, action: &str) -> Value {
    let id = json!({"type":"string","minLength":1,"maxLength":128});
    if model == "project_member" {
        return match action {
            "list" => object(json!({"projectId":id}), &["projectId"]),
            "create" => object(
                json!({"data":object(fields(model), &["project_id","member_id"])}),
                &["data"],
            ),
            _ => object(
                json!({"id":id,"confirm_member_name":{"type":"string","minLength":1}}),
                &["id", "confirm_member_name"],
            ),
        };
    }
    match action {
        "list" => {
            let mut properties = json!({"pageIndex":{"type":"integer","minimum":1},"pageSize":{"type":"integer","minimum":1,"maximum":100}});
            if model == "task" {
                properties["projectId"] = id;
            }
            object(properties, &[])
        }
        "get" => object(json!({"id":id}), &["id"]),
        "create" => {
            let required = if model == "task" {
                vec!["name", "project_id"]
            } else {
                vec!["name"]
            };
            object(json!({"data":object(fields(model), &required)}), &["data"])
        }
        "update" => {
            let mut changes = object(fields(model), &[]);
            changes["minProperties"] = json!(1);
            object(
                json!({"id":id,"changes":changes,"expected_update_time":{"type":"string","description":"Optional stale-edit check against get result; timestamp has second precision"}}),
                &["id", "changes"],
            )
        }
        _ => object(
            json!({"id":id,"confirm_name":{"type":"string","minLength":1,"description":"Exact current name from get; approve deletion in the client"}}),
            &["id", "confirm_name"],
        ),
    }
}

pub fn catalog(permissions: Permissions) -> Vec<Value> {
    let mut tools = Vec::new();
    for model in ["project", "task", "member", "project_member"] {
        for action in ["list", "get", "create", "update", "delete"] {
            if model == "project_member" && matches!(action, "get" | "update") {
                continue;
            }
            if matches!(action, "create" | "update") && !permissions.write {
                continue;
            }
            if action == "delete" && !permissions.delete {
                continue;
            }
            tools.push(json!({"name":format!("easyproject_{model}_{action}"),
                "description":format!("{action} local EasyProject {model}. Delete is soft deletion, never cascades active children/assignments. Write tools require client approval; do not automatically retry."),
                "inputSchema":schema(model, action),
                "annotations":{"readOnlyHint":matches!(action,"list"|"get"),"destructiveHint":matches!(action,"update"|"delete"),"idempotentHint":matches!(action,"list"|"get"),"openWorldHint":false}
            }));
        }
    }
    tools
}

fn validate(value: &Value, schema: &Value) -> Result<(), String> {
    match schema["type"].as_str() {
        Some("object") => {
            let map = value.as_object().ok_or("Expected object")?;
            let properties = schema["properties"]
                .as_object()
                .ok_or("Invalid internal schema")?;
            for required in schema["required"]
                .as_array()
                .ok_or("Invalid internal schema")?
            {
                if !map.contains_key(required.as_str().ok_or("Invalid required key")?) {
                    return Err(format!("Missing required field {required}"));
                }
            }
            if map.len() < schema["minProperties"].as_u64().unwrap_or(0) as usize {
                return Err("No changes supplied".into());
            }
            for (key, field) in map {
                let property = properties
                    .get(key)
                    .ok_or_else(|| format!("Unknown field {key}"))?;
                validate(field, property).map_err(|e| format!("{key}: {e}"))?;
            }
        }
        Some("string") => {
            let text = value.as_str().ok_or("Expected string")?;
            let length = text.chars().count();
            if length < schema["minLength"].as_u64().unwrap_or(0) as usize
                || length > schema["maxLength"].as_u64().unwrap_or(2000) as usize
            {
                return Err("String length outside allowed range".into());
            }
        }
        Some("integer") => {
            let number = value.as_i64().ok_or("Expected integer")? as f64;
            bounds(number, schema)?;
        }
        Some("number") => bounds(value.as_f64().ok_or("Expected number")?, schema)?,
        _ => return Err("Invalid internal field type".into()),
    }
    if let Some(values) = schema["enum"].as_array() {
        if !values.contains(value) {
            return Err("Unsupported value".into());
        }
    }
    Ok(())
}

fn bounds(number: f64, schema: &Value) -> Result<(), String> {
    if !number.is_finite()
        || number < schema["minimum"].as_f64().unwrap_or(f64::NEG_INFINITY)
        || number > schema["maximum"].as_f64().unwrap_or(f64::INFINITY)
    {
        return Err("Number outside allowed range".into());
    }
    Ok(())
}

fn validate_fields(data: &Value) -> Result<(), String> {
    if data
        .get("name")
        .and_then(Value::as_str)
        .is_some_and(|text| text.trim().is_empty())
    {
        return Err("Name cannot be blank".into());
    }
    for name in [
        "weekend_days",
        "calendar_exceptions",
        "availability_exceptions",
    ] {
        if let Some(raw) = data.get(name).and_then(Value::as_str) {
            let value: Value =
                serde_json::from_str(raw).map_err(|_| format!("{name} must be JSON"))?;
            if !value.is_array() {
                return Err(format!("{name} must be a JSON array"));
            }
        }
    }
    for name in ["start_time", "end_time"] {
        if let Some(raw) = data
            .get(name)
            .and_then(Value::as_str)
            .filter(|x| !x.is_empty())
        {
            let date = chrono::NaiveDate::parse_from_str(raw, "%Y-%m-%d")
                .map_err(|_| format!("{name} must be YYYY-MM-DD"))?;
            if date.format("%Y-%m-%d").to_string() != raw {
                return Err(format!("{name} must be canonical YYYY-MM-DD"));
            }
        }
    }
    Ok(())
}

fn defaults(model: &str) -> Value {
    match model {
        "project_member" => json!({"role":"Member"}),
        "project" => {
            json!({"version":"v1.0","type":"private","status":"Draft","owner":"","calendar_country":"CN","calendar_region":"","weekend_days":"[0,6]","calendar_exceptions":"[]"})
        }
        "task" => {
            json!({"parent":"","dependence":"","start_time":"","end_time":"","type":"Task","priority":"Normal","status":"Draft","progress":0,"effort_days":0,"schedule_mode":"fixed_effort","comment":"","assignee":""})
        }
        _ => {
            json!({"email":"","phone":"","role":"Developer","avatar":"","availability_exceptions":"[]"})
        }
    }
}

fn audit(
    db: &DbState,
    operation_id: &str,
    model: &str,
    action: &str,
    id: Option<&str>,
    status: &str,
) -> Result<(), String> {
    let path =
        db.1.parent()
            .ok_or("Database directory unavailable")?
            .join("mcp-audit.jsonl");
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)
        .map_err(|e| format!("Audit unavailable: {e}"))?;
    if file.metadata().map_err(|e| e.to_string())?.len() > 10 * 1024 * 1024 {
        return Err("Audit log exceeds 10 MiB. Archive it before enabling more writes".into());
    }
    let line = json!({"time":chrono::Utc::now().to_rfc3339(),"operation_id":operation_id,"entity":model,"action":action,"id":id,"status":status});
    writeln!(file, "{line}")
        .and_then(|_| file.sync_data())
        .map_err(|e| format!("Audit write failed: {e}"))
}

pub fn call(
    db: &DbState,
    permissions: Permissions,
    name: &str,
    arguments: Value,
) -> Result<Value, String> {
    let suffix = name.strip_prefix("easyproject_").ok_or("Unknown tool")?;
    let (model, action) = suffix.rsplit_once('_').ok_or("Unknown tool")?;
    if !["project", "task", "member", "project_member"].contains(&model)
        || !["list", "get", "create", "update", "delete"].contains(&action)
    {
        return Err("Unknown tool".into());
    }
    validate(&arguments, &schema(model, action))?;
    if model == "project_member" && matches!(action, "get" | "update") {
        return Err("Unknown tool".into());
    }
    if action == "list" {
        return Ok(entity_api::dispatch(
            db,
            model,
            if model == "project_member" {
                "get_by_project"
            } else {
                "get_all"
            },
            arguments,
        )?
        .data
        .unwrap_or_else(|| json!({})));
    }
    let id = arguments.get("id").and_then(Value::as_str);
    if action == "get" {
        return Ok(json!({"record":entity_api::get(db, model, id.ok_or("ID required")?)?}));
    }
    if !permissions.write || (action == "delete" && !permissions.delete) {
        return Err("Tool is disabled by server permissions".into());
    }
    let supplied = if action == "create" {
        &arguments["data"]
    } else {
        &arguments["changes"]
    };
    if action != "delete" {
        validate_fields(supplied)?;
    }
    let operation_id = Uuid::new_v4().to_string();
    audit(db, &operation_id, model, action, id, "attempt")?;
    let backup = data_service::create_backup(db, "mcp")?;
    if !backup["counts"].is_object() {
        return Err(
            "Recovery point integrity/schema validation failed; no mutation executed".into(),
        );
    }
    let result = entity_api::with_write(db, || execute(db, model, action, &arguments));
    let status = if result.is_ok() {
        "committed"
    } else {
        "rejected"
    };
    audit(db, &operation_id, model, action, id, status).map_err(|e| format!("Operation {operation_id} outcome {status}; {e}. Do not retry blindly; get current data."))?;
    result.map(|record| json!({"record":record,"operation_id":operation_id,"recovery_point":backup["name"]}))
}

fn execute(db: &DbState, model: &str, action: &str, arguments: &Value) -> Result<Value, String> {
    let id = arguments.get("id").and_then(Value::as_str);
    if let Some(id) = id {
        let current = entity_api::get(db, model, id)?;
        if let Some(expected) = arguments.get("expected_update_time") {
            if current.get("update_time") != Some(expected) {
                return Err("Record changed since it was read; get it again".into());
            }
        }
        if action == "delete" {
            let (target, confirmation) = if model == "project_member" {
                (
                    entity_api::get(
                        db,
                        "member",
                        current["member_id"]
                            .as_str()
                            .ok_or("Member ID unavailable")?,
                    )?,
                    "confirm_member_name",
                )
            } else {
                (current, "confirm_name")
            };
            if target.get("name") != arguments.get(confirmation) {
                return Err("Deletion confirmation does not match current name".into());
            }
        }
    }
    let (service_action, data) = match action {
        "create" => {
            let mut data = defaults(model);
            data.as_object_mut()
                .ok_or("Invalid defaults")?
                .extend(arguments["data"].as_object().ok_or("Missing data")?.clone());
            ("add", data)
        }
        "update" => {
            let mut data = arguments["changes"]
                .as_object()
                .ok_or("Missing changes")?
                .clone();
            data.insert("id".into(), json!(id));
            ("update", Value::Object(data))
        }
        _ => ("delete", json!({"ids":[id]})),
    };
    let result = entity_api::dispatch_raw(db, model, service_action, data)?;
    if action == "delete" {
        return Ok(json!({"id":id,"deleted":true}));
    }
    let result_id = id
        .or_else(|| result.data.as_ref()?.get("id")?.as_str())
        .ok_or("Missing created ID")?;
    entity_api::get(db, model, result_id)
}
