use serde::{Deserialize, Serialize};

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

/// 关联所属项目信息，用于 get_by_member 返回
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

/// 关联成员信息，用于 get_by_project 返回
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
