use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub project_id: String,
    pub sort_order: i64,
    pub name: String,
    pub parent: String,
    pub dependence: String,
    pub start_time: String,
    pub end_time: String,
    pub r#type: String,
    pub priority: String,
    pub status: String,
    pub progress: i64,
    pub effort_days: f64,
    pub schedule_mode: String,
    pub comment: String,
    pub assignee: String,
    pub creator: String,
    pub create_time: String,
    pub update_time: String,
    pub stateflag: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TaskCreateRequest {
    pub name: String,
    #[serde(default)]
    pub project_id: String,
    #[serde(default)]
    pub sort_order: i64,
    pub parent: String,
    pub dependence: String,
    pub start_time: String,
    pub end_time: String,
    pub r#type: String,
    pub priority: String,
    pub status: String,
    #[serde(default)]
    pub progress: i64,
    #[serde(default)]
    pub effort_days: f64,
    #[serde(default = "default_schedule_mode")]
    pub schedule_mode: String,
    pub comment: String,
    pub assignee: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewTask {
    pub id: String,
    pub project_id: String,
    pub sort_order: i64,
    pub name: String,
    pub parent: String,
    pub dependence: String,
    pub start_time: String,
    pub end_time: String,
    pub r#type: String,
    pub priority: String,
    pub status: String,
    pub progress: i64,
    pub effort_days: f64,
    pub schedule_mode: String,
    pub comment: String,
    pub assignee: String,
    pub creator: String,
}

fn default_schedule_mode() -> String {
    "fixed_effort".to_string()
}
