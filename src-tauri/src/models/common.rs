use serde::{Deserialize, Serialize};

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

impl<T> ApiResponse<T> {
    pub fn ok(data: Option<T>) -> Result<Self, String> {
        Ok(ApiResponse {
            success: true,
            message: "ok".to_string(),
            data,
        })
    }

    pub fn err(msg: &str) -> Result<Self, String> {
        Ok(ApiResponse {
            success: false,
            message: msg.to_string(),
            data: None,
        })
    }
}
