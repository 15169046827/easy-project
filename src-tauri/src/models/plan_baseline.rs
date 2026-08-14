use serde::{Deserialize, Serialize};

/// 计划基线中的单条任务快照
#[derive(Debug, Serialize, Deserialize)]
pub struct PlanBaseline {
    pub id: String,
    pub project_id: String,
    pub task_id: String,
    pub task_name: String,
    pub start_time: String,
    pub end_time: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NewPlanBaseline {
    pub id: String,
    pub project_id: String,
    pub task_id: String,
    pub task_name: String,
    pub start_time: String,
    pub end_time: String,
}

/// 保存基线时由前端传入的单个任务快照
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BaselineTaskInput {
    pub task_id: String,
    pub task_name: String,
    pub start_time: String,
    pub end_time: String,
}

/// 保存基线请求：覆盖式保存整个项目的当前排期快照
#[derive(Serialize, Deserialize, Debug)]
pub struct PlanBaselineSaveRequest {
    pub project_id: String,
    pub tasks: Vec<BaselineTaskInput>,
}
