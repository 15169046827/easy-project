//! Headless server reuses domain services, without a Tauri/GTK dependency.
#[path = "../../src-tauri/src/common/mod.rs"]
pub mod common;
#[path = "../../src-tauri/src/db/mod.rs"]
pub mod db;
#[path = "../../src-tauri/src/models/mod.rs"]
pub mod models;
#[path = "../../src-tauri/src/services/mod.rs"]
pub mod services;

mod account_schema;
pub mod auth;
pub mod http;
pub mod maintenance;
pub mod mcp;
mod password_reset;
mod profile;
pub mod workspace;
