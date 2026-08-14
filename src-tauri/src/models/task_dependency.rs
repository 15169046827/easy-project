use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskDependency {
    pub id: String,
    pub predecessor_task_id: String,
    pub successor_task_id: String,
    pub dependency_type: String,
    pub lag_minutes: i64,
}
