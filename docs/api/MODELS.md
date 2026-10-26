# EasyProject模型与原生请求类型

来源：70ad16e7b9a89fd59b4fd8bcfbf7f1e6b4f1a689

以下为真实Rust类型及serde默认属性。String不代表业务允许任意字符串；业务关系/范围以服务校验为准。MCP另有严格inputSchema和默认补齐，不能与桌面原生请求互换。

## project

```rust
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
```

## task

```rust
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
    #[serde(default)]
    pub status_id: String,
    #[serde(default)]
    pub is_completed: bool,
    #[serde(default)]
    pub status_builtin_key: String,
    pub progress: i64,
    pub effort_days: f64,
    pub effort_state: String,
    #[serde(default)]
    pub summary: Option<crate::common::task_rollup::TaskSummary>,
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
    #[serde(default)]
    pub status: String,
    #[serde(default)]
    pub status_id: String,
    #[serde(default)]
    pub progress: i64,
    #[serde(default)]
    pub effort_days: f64,
    #[serde(default)]
    pub effort_state: Option<String>,
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
```

## task_status

```rust
#[derive(Debug, Serialize)]
pub struct TaskStatus {
    pub id: String,
    pub project_id: String,
    pub name: String,
    pub color: String,
    pub sort_order: i64,
    pub is_completed: bool,
    pub is_default: bool,
    pub builtin_key: String,
}
```

## task_rollup

```rust
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TaskSummary {
    pub has_children: bool,
    pub direct_child_count: usize,
    pub completed_child_count: usize,
    pub effort_days: f64,
    pub progress: Option<f64>,
    pub unestimated_count: usize,
    pub legacy_unknown_count: usize,
    pub start_time: String,
    pub end_time: String,
    pub schedule_incomplete: bool,
}
```

## member

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Member {
    pub id: String,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub role: String,
    pub avatar: String,
    pub availability_exceptions: String,
    pub create_time: String,
    pub update_time: String,
    pub stateflag: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MemberCreateRequest {
    pub name: String,
    pub email: String,
    pub phone: String,
    pub role: String,
    pub avatar: String,
    #[serde(default = "default_availability_exceptions")]
    pub availability_exceptions: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewMember {
    pub id: String,
    pub name: String,
    pub email: String,
    pub phone: String,
    pub role: String,
    pub avatar: String,
    pub availability_exceptions: String,
}
```

## project_member

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectMember {
    pub id: String,
    pub project_id: String,
    pub member_id: String,
    pub role: String,
    pub joined_at: String,
    pub stateflag: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectMemberCreateRequest {
    pub project_id: String,
    pub member_id: String,
    #[serde(default)]
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewProjectMember {
    pub id: String,
    pub project_id: String,
    pub member_id: String,
    pub role: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectMemberWithProject {
    pub id: String,
    pub project_id: String,
    pub member_id: String,
    pub role: String,
    pub joined_at: String,
    pub project_name: String,
    pub project_status: String,
    pub project_version: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectMemberWithMember {
    pub id: String,
    pub project_id: String,
    pub member_id: String,
    pub role: String,
    pub joined_at: String,
    pub member_name: String,
    pub member_role: String,
    pub member_email: String,
    pub member_avatar: String,
}
```

## task_dependency

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct TaskDependency {
    pub id: String,
    pub predecessor_task_id: String,
    pub successor_task_id: String,
    pub dependency_type: String,
    pub lag_minutes: i64,
}
```

## plan_baseline

```rust
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

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct BaselineTaskInput {
    pub task_id: String,
    pub task_name: String,
    pub start_time: String,
    pub end_time: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PlanBaselineSaveRequest {
    pub project_id: String,
    pub tasks: Vec<BaselineTaskInput>,
}
```

## common

```rust
#[derive(Serialize)]
pub struct PageResult<T> {
    pub list: Vec<T>,
    pub total: u64,
    pub page_index: u64,
    pub page_size: u64,
    pub total_page: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    pub data: Option<T>,
}
```
