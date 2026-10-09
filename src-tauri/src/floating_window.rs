use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

pub const FLOATING_LABEL: &str = "task-floating";

fn require_label(actual: &str, expected: &str) -> Result<(), String> {
    if actual == expected {
        Ok(())
    } else {
        Err("This window is not allowed to perform the requested action".into())
    }
}

#[tauri::command]
pub async fn open_task_window(app: AppHandle, window: WebviewWindow) -> Result<(), String> {
    require_label(window.label(), "main")?;
    if let Some(existing) = app.get_webview_window(FLOATING_LABEL) {
        existing.show().map_err(|error| error.to_string())?;
        return existing.set_focus().map_err(|error| error.to_string());
    }
    WebviewWindowBuilder::new(&app, FLOATING_LABEL, WebviewUrl::App("index.html".into()))
        .title("EasyProject — Tasks")
        .initialization_script("window.__EASYPROJECT_FLOATING_WINDOW__ = true;")
        .inner_size(340.0, 72.0)
        .min_inner_size(340.0, 72.0)
        .decorations(false)
        .resizable(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(false)
        .center()
        .build()
        .map(|_| ())
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn show_main_window(
    app: AppHandle,
    window: WebviewWindow,
    project_id: String,
) -> Result<(), String> {
    require_label(window.label(), FLOATING_LABEL)?;
    let main = app
        .get_webview_window("main")
        .ok_or("Main window is unavailable")?;
    main.show().map_err(|error| error.to_string())?;
    main.unminimize().map_err(|error| error.to_string())?;
    main.set_focus().map_err(|error| error.to_string())?;
    app.emit_to("main", "easyproject:open-project", project_id)
        .map_err(|error| error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn window_actions_reject_unexpected_callers() {
        assert!(require_label("main", "main").is_ok());
        assert!(require_label(FLOATING_LABEL, FLOATING_LABEL).is_ok());
        assert!(require_label(FLOATING_LABEL, "main").is_err());
        assert!(require_label("main", FLOATING_LABEL).is_err());
        assert!(require_label("unknown", "main").is_err());
    }
}
