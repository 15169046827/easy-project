// src/lib.rs
//! 库入口：负责组装模块、初始化数据库并启动 Tauri 应用。
//! 保持 run() 作为唯一对外启动点，main.rs 只负责调用 run()。

pub mod cmds;
pub mod common;
pub mod db;
pub mod floating_window;
pub mod mcp;
pub mod models;
pub mod services;
pub mod storage;

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
            let root = storage::installation_directory(&std::env::current_exe()?)?;
            storage::validate_directory(&root)?;
            let legacy = if cfg!(debug_assertions) {
                None
            } else {
                Some(app.path().app_data_dir()?)
            };
            let prepared = storage::prepare(&root, legacy.as_deref()).and_then(|info| {
                let db = common::db_state::init_db(&info.database_path)?;
                storage::confirm(&info)?;
                if let Err(error) = services::data_service::create_backup(&db, "auto") {
                    log::warn!("Automatic startup backup failed: {error}");
                }
                info!("Database ready at {}", info.database_path.display());
                app.manage(db);
                Ok(info)
            });
            let info = prepared.unwrap_or_else(|error| storage::failed_info(&root, error));
            let profile = info.profile_dir.clone();
            let bootstrap = format!(
                "window.__EASYPROJECT_STORAGE_INFO__ = {};",
                serde_json::to_string(&info)?
            );
            app.manage(storage::StorageState {
                info: std::sync::Mutex::new(info),
            });
            std::fs::create_dir_all(&profile)?;
            let config = app
                .config()
                .app
                .windows
                .first()
                .ok_or("Missing main window configuration")?;
            let builder = tauri::WebviewWindowBuilder::from_config(app, config)?
                .initialization_script(&bootstrap);
            #[cfg(windows)]
            let builder = builder
                .data_directory(profile)
                .additional_browser_args("--no-proxy-server");
            builder.build()?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if window.label() == "main" && matches!(event, tauri::WindowEvent::Destroyed) {
                if let Some(floating) = window
                    .app_handle()
                    .get_webview_window(floating_window::FLOATING_LABEL)
                {
                    let _ = floating.close();
                }
            }
        })
        .invoke_handler(generate_handler![
            cmds::crud_action::crud_action,
            floating_window::open_task_window,
            floating_window::show_main_window,
            storage::storage_info,
            storage::set_data_directory,
            storage::reveal_backup_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
