use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub version: String,
    pub r#type: String,
    pub status: String,
    pub owner: String,
    pub calendar_country: String,
    pub calendar_region: String,
    pub weekend_days: String,
    pub calendar_exceptions: String,
    pub creator: String,
    pub create_time: String,
    pub update_time: String,
    pub stateflag: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectCreateRequest {
    pub name: String,
    pub version: String,
    pub r#type: String,
    pub status: String,
    pub owner: String,
    #[serde(default = "default_calendar_country")]
    pub calendar_country: String,
    #[serde(default)]
    pub calendar_region: String,
    #[serde(default = "default_weekend_days")]
    pub weekend_days: String,
    #[serde(default = "default_calendar_exceptions")]
    pub calendar_exceptions: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectTemplateTaskRequest {
    pub key: String,
    pub name: String,
    #[serde(default)]
    pub parent_key: String,
    #[serde(default)]
    pub predecessor_keys: Vec<String>,
    pub start_time: String,
    pub end_time: String,
    pub r#type: String,
    pub priority: String,
    pub status: String,
    #[serde(default)]
    pub effort_days: f64,
    #[serde(default = "default_template_schedule_mode")]
    pub schedule_mode: String,
    #[serde(default)]
    pub comment: String,
    #[serde(default)]
    pub assignee: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectFromTemplateRequest {
    pub project: ProjectCreateRequest,
    #[serde(default)]
    pub tasks: Vec<ProjectTemplateTaskRequest>,
}

fn default_template_schedule_mode() -> String {
    "fixed_effort".to_string()
}

fn default_calendar_country() -> String {
    "CN".to_string()
}

fn default_weekend_days() -> String {
    "[0,6]".to_string()
}

fn default_calendar_exceptions() -> String {
    "[]".to_string()
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewProject {
    pub id: String,
    pub name: String,
    pub version: String,
    pub r#type: String,
    pub status: String,
    pub owner: String,
    pub calendar_country: String,
    pub calendar_region: String,
    pub weekend_days: String,
    pub calendar_exceptions: String,
    pub creator: String,
}
