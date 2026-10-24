//! Shared write dictionaries. Free-form labels (for example member roles) are not enums.
use serde_json::Value;
pub const PRIORITIES: &[&str] = &["1", "2", "3", "4", "5", "High", "Normal", "Low"];
pub const TASK_TYPES: &[&str] = &["Task", "Milestone", "File"];
pub const PROJECT_TYPES: &[&str] = &["private", "public"];
pub const PROJECT_STATUSES: &[&str] = &["Draft", "InProgress", "Paused", "Done", "Archived"];
pub const SCHEDULE_MODES: &[&str] = &["fixed_effort", "fixed_dates"];
pub fn allowed(model: &str, field: &str) -> Option<&'static [&'static str]> {
    match (model, field) {
        ("task", "priority") => Some(PRIORITIES),
        ("task", "type") => Some(TASK_TYPES),
        ("task", "schedule_mode") => Some(SCHEDULE_MODES),
        ("project", "type") => Some(PROJECT_TYPES),
        ("project", "status") => Some(PROJECT_STATUSES),
        _ => None,
    }
}
pub fn validate(model: &str, data: &Value) -> Result<(), String> {
    validate_calendar(model, data)?;
    for field in ["priority", "type", "status", "schedule_mode"] {
        if let (Some(value), Some(values)) = (data.get(field), allowed(model, field)) {
            if !value.as_str().is_some_and(|text| values.contains(&text)) {
                return Err(format!(
                    "{model}.{field} must be one of: {}",
                    values.join(", ")
                ));
            }
        }
    }
    if model == "task" {
        if let Some(value) = data.get("progress") {
            if !value
                .as_i64()
                .is_some_and(|number| (0..=100).contains(&number))
            {
                return Err("progress must be an integer from 0 to 100".into());
            }
        }
        if let Some(value) = data.get("effort_days") {
            if !value
                .as_f64()
                .is_some_and(|number| number.is_finite() && number >= 0.0)
            {
                return Err("effort_days must be a nonnegative finite number".into());
            }
        }
    }
    Ok(())
}
fn canonical_date(value: &Value) -> bool {
    value.as_str().is_some_and(|raw| {
        chrono::NaiveDate::parse_from_str(raw, "%Y-%m-%d")
            .is_ok_and(|date| date.format("%Y-%m-%d").to_string() == raw)
    })
}
fn validate_calendar(model: &str, data: &Value) -> Result<(), String> {
    let fields: &[&str] = match model {
        "project" => &["weekend_days", "calendar_exceptions"],
        "member" => &["availability_exceptions"],
        _ => &[],
    };
    for field in fields {
        let Some(raw) = data.get(*field) else {
            continue;
        };
        let parsed: Value = serde_json::from_str(
            raw.as_str()
                .ok_or_else(|| format!("{field} must be a JSON array string"))?,
        )
        .map_err(|_| format!("{field} must be a JSON array string"))?;
        let items = parsed
            .as_array()
            .ok_or_else(|| format!("{field} must be a JSON array string"))?;
        for item in items {
            let valid = match *field {
                "weekend_days" => item.as_i64().is_some_and(|day| (0..=6).contains(&day)),
                "calendar_exceptions" => {
                    canonical_date(&item["date"])
                        && matches!(item["type"].as_str(), Some("holiday" | "working"))
                }
                _ => {
                    canonical_date(&item["start_date"])
                        && canonical_date(&item["end_date"])
                        && item["start_date"].as_str() <= item["end_date"].as_str()
                        && matches!(item["type"].as_str(), Some("leave" | "available"))
                }
            };
            if !valid {
                return Err(format!(
                    "Invalid {field} entry; use documented dates and dictionary values"
                ));
            }
        }
    }
    Ok(())
}
/// Imports bypass entity services, so validate their final transaction before commit.
pub fn validate_import(conn: &rusqlite::Connection) -> Result<(), String> {
    let mut projects = conn
        .prepare("SELECT type,status FROM project")
        .map_err(|e| e.to_string())?;
    let rows = projects
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?;
    for row in rows {
        let (kind, status) = row.map_err(|e| e.to_string())?;
        validate("project", &serde_json::json!({"type":kind,"status":status}))?;
    }
    let mut tasks = conn
        .prepare("SELECT type,priority,schedule_mode,progress,effort_days FROM task")
        .map_err(|e| e.to_string())?;
    let rows = tasks
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, i64>(3)?,
                row.get::<_, f64>(4)?,
            ))
        })
        .map_err(|e| e.to_string())?;
    for row in rows {
        let (kind, priority, mode, progress, effort) = row.map_err(|e| e.to_string())?;
        validate(
            "task",
            &serde_json::json!({"type":kind,"priority":priority,"schedule_mode":mode,"progress":progress,"effort_days":effort}),
        )?;
    }
    for (model, sql, fields) in [
        (
            "project",
            "SELECT weekend_days,calendar_exceptions FROM project",
            vec!["weekend_days", "calendar_exceptions"],
        ),
        (
            "member",
            "SELECT availability_exceptions FROM member",
            vec!["availability_exceptions"],
        ),
    ] {
        let mut statement = conn.prepare(sql).map_err(|error| error.to_string())?;
        let rows = statement
            .query_map([], |row| {
                let mut data = serde_json::Map::new();
                for (index, field) in fields.iter().enumerate() {
                    data.insert((*field).into(), Value::String(row.get(index)?));
                }
                Ok(Value::Object(data))
            })
            .map_err(|error| error.to_string())?;
        for row in rows {
            validate(model, &row.map_err(|error| error.to_string())?)?;
        }
    }
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    #[test]
    fn validates_all_dictionary_fields_and_numeric_bounds() {
        for (model, field) in [
            ("task", "priority"),
            ("task", "type"),
            ("task", "schedule_mode"),
            ("project", "type"),
            ("project", "status"),
        ] {
            for value in allowed(model, field).unwrap() {
                assert!(validate(model, &json!({field: value})).is_ok());
            }
            assert!(validate(model, &json!({field: "unrecognized"})).is_err());
            assert!(validate(model, &json!({field: 1})).is_err());
        }
        assert!(validate("member", &json!({"role":"Research lead"})).is_ok());
        assert!(validate("task", &json!({"progress":101})).is_err());
        assert!(validate("task", &json!({"progress":1.5})).is_err());
        assert!(validate("task", &json!({"effort_days":-1})).is_err());
        for data in [
            json!({"weekend_days":"[7]"}),
            json!({"calendar_exceptions":"[{\"date\":\"2026-10-24\",\"type\":\"unknown\"}]"}),
        ] {
            assert!(validate("project", &data).is_err());
        }
        assert!(validate("member", &json!({"availability_exceptions":"[{\"start_date\":\"2026-10-25\",\"end_date\":\"2026-10-24\",\"type\":\"leave\"}]"})).is_err());
        assert!(validate("member", &json!({"availability_exceptions":"[{\"start_date\":\"2026-10-24\",\"end_date\":\"2026-10-25\",\"type\":\"available\"}]"})).is_ok());
    }
}
