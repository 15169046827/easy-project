// src/lib.rs
//! 库入口：负责组装模块、初始化数据库并启动 Tauri 应用。
//! 保持 run() 作为唯一对外启动点，main.rs 只负责调用 run()。

pub mod cmds;
pub mod common;
pub mod db;
pub mod models;
pub mod services;

use env_logger::Env;
use log::info;
use tauri::{generate_handler, Manager};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 初始化数据库（返回 DbState 实例）
    let default_log_level = if cfg!(debug_assertions) {
        "debug"
    } else {
        "warn"
    };
    let _ = env_logger::Builder::from_env(Env::default().default_filter_or(default_log_level))
        .format_timestamp_secs() // 时间戳到秒
        .try_init();

    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let database_path = data_dir.join("project_manager.db");
            let legacy_path = std::path::Path::new("../db/project_manager.db");

            if !database_path.exists() && legacy_path.exists() {
                std::fs::copy(legacy_path, &database_path)?;
            }

            let db_state =
                common::db_state::init_db(&database_path).map_err(std::io::Error::other)?;
            if let Err(error) = services::data_service::create_backup(&db_state, "auto") {
                log::warn!("Automatic startup backup failed: {error}");
            }
            app.manage(db_state);
            info!("Database ready at {}", database_path.display());
            Ok(())
        })
        .invoke_handler(generate_handler![cmds::crud_action::crud_action])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
