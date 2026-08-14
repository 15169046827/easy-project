use serde::{Deserialize, Serialize};

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

fn default_availability_exceptions() -> String {
    "[]".to_string()
}
