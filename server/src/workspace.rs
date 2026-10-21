use crate::common::db_state::{init_db, DbState};
use crate::services::{
    calendar_service, data_service, entity_api, plan_baseline_service, task_dependency_service,
};
use serde::Deserialize;
use serde_json::{json, Value};
use std::io::Write;
use std::path::Path;

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Action {
    pub model: String,
    pub action: String,
    #[serde(default = "empty_data")]
    pub data: Value,
}

fn empty_data() -> Value {
    json!({})
}

pub struct Workspace {
    pub db: DbState,
    current_revision: i64,
}

impl Workspace {
    pub fn open(root: &Path, id: &str) -> Result<Self, String> {
        if id.len() != 32 || !id.bytes().all(|b| b.is_ascii_hexdigit()) {
            return Err("Invalid workspace identity".into());
        }
        let directory = root.join("workspaces").join(id);
        std::fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
        let db = init_db(&directory.join("project_manager.db"))?;
        db.lock_connection().map_err(|e| e.to_string())?.execute_batch(
            "CREATE TABLE IF NOT EXISTS web_revision(id INTEGER PRIMARY KEY CHECK(id=1), value INTEGER NOT NULL);
             INSERT OR IGNORE INTO web_revision VALUES(1,0);"
        ).map_err(|e| e.to_string())?;
        let revision = new_revision();
        db.lock_connection()
            .map_err(|e| e.to_string())?
            .execute("UPDATE web_revision SET value=?1 WHERE id=1", [revision])
            .map_err(|e| e.to_string())?;
        Ok(Self {
            db,
            current_revision: revision,
        })
    }

    pub fn revision(&self) -> Result<i64, String> {
        Ok(self.current_revision)
    }

    pub fn mcp_call(
        &mut self,
        mutation: bool,
        call: impl FnOnce(&DbState) -> Result<Value, String>,
    ) -> Result<Value, String> {
        if mutation {
            let next = new_revision();
            self.db
                .lock_connection()
                .map_err(|_| "Workspace unavailable")?
                .execute("UPDATE web_revision SET value=?1 WHERE id=1", [next])
                .map_err(|_| "Workspace unavailable")?;
            self.current_revision = next;
        }
        // The caller holds the same per-account mutex as Web actions. Existing
        // MCP code owns its validated transaction, recovery point and redacted audit.
        call(&self.db)
    }

    pub fn run(&mut self, request: Action, expected: Option<i64>) -> Result<Value, (u16, String)> {
        let mutation = is_mutation(&request.model, &request.action)
            .ok_or((400, "Unsupported action".into()))?;
        let revision = self.revision().map_err(|e| (500, e))?;
        if mutation && expected != Some(revision) {
            return Err((
                409,
                "Workspace changed on another device; refresh before saving".into(),
            ));
        }
        let next = if mutation { new_revision() } else { revision };
        let operation_id = uuid::Uuid::new_v4().simple().to_string();
        if mutation {
            self.audit(&request, &operation_id, "attempt", true)
                .map_err(|e| (500, e))?;
            data_service::create_backup(&self.db, "web").map_err(|e| (500, e))?;
            // Invalidate stale writers durably before a business commit. A process
            // failure may cause a conservative conflict, never an old-token overwrite.
            self.db
                .lock_connection()
                .map_err(|e| (500, e.to_string()))?
                .execute("UPDATE web_revision SET value=?1 WHERE id=1", [next])
                .map_err(|e| (500, e.to_string()))?;
            // Keep the process epoch independently of SQLite restore contents.
            // If post-restore bookkeeping fails, old backup revisions stay invalid.
            self.current_revision = next;
        }
        let result = match request.model.as_str() {
            "project" | "task" | "member" | "project_member" => entity_api::dispatch(
                &self.db,
                &request.model,
                &request.action,
                request.data.clone(),
            ),
            "task_dependency" => task_dependency_service::handle_action(
                &self.db,
                request.action.clone(),
                request.data.clone(),
            ),
            "plan_baseline" => plan_baseline_service::handle_action(
                &self.db,
                request.action.clone(),
                request.data.clone(),
            ),
            "calendar" => calendar_service::handle_action(
                &self.db,
                request.action.clone(),
                request.data.clone(),
            ),
            "data" => {
                data_service::handle_action(&self.db, request.action.clone(), request.data.clone())
            }
            _ => return Err((400, "Unsupported model".into())),
        };
        if mutation {
            let phase = if result.as_ref().is_ok_and(|response| response.success) {
                "committed"
            } else {
                "rejected"
            };
            self.audit(&request, &operation_id, phase, false)
                .map_err(|_| {
                    (
                        500,
                        "Operation may have completed but audit failed; refresh before retrying"
                            .into(),
                    )
                })?;
        }
        let result = result.map_err(|_| {
            (
                400,
                "Operation failed; verify fields and relationships".into(),
            )
        })?;
        if !result.success {
            return Err((400, result.message));
        }
        if mutation {
            self.db.lock_connection().map_err(|e| (500,e.to_string()))?.execute_batch(
                "CREATE TABLE IF NOT EXISTS web_revision(id INTEGER PRIMARY KEY CHECK(id=1), value INTEGER NOT NULL);"
            ).map_err(|e| (500,e.to_string()))?;
            self.db.lock_connection().map_err(|e| (500,e.to_string()))?
                .execute("INSERT INTO web_revision VALUES(1,?1) ON CONFLICT(id) DO UPDATE SET value=excluded.value", [next]).map_err(|e| (500,e.to_string()))?;
        }
        Ok(json!({"data":result.data,"revision":next}))
    }

    fn audit(
        &self,
        request: &Action,
        operation_id: &str,
        phase: &str,
        reserve: bool,
    ) -> Result<(), String> {
        let directory = self
            .db
            .1
            .parent()
            .ok_or("Workspace directory unavailable")?;
        let path = directory.join("web-audit.jsonl");
        let mut file = std::fs::OpenOptions::new()
            .append(true)
            .create(true)
            .open(path)
            .map_err(|_| "Audit unavailable")?;
        if reserve
            && file.metadata().map_err(|_| "Audit unavailable")?.len() > 10 * 1024 * 1024 - 4096
        {
            return Err(
                "Audit capacity reached; operator archival required before more writes".into(),
            );
        }
        let record = json!({"operation":operation_id,"time":chrono::Utc::now().to_rfc3339(),"model":request.model,"action":request.action,"phase":phase});
        writeln!(file, "{record}")
            .and_then(|_| file.sync_data())
            .map_err(|_| "Audit unavailable".into())
    }
}

fn new_revision() -> i64 {
    // Stay exactly representable by JavaScript numbers; random epochs also
    // invalidate tokens after restart, restore, or connection-cache eviction.
    (uuid::Uuid::new_v4().as_u128() as u64 & 0x000f_ffff_ffff_ffff) as i64
}

pub fn is_mutation(model: &str, action: &str) -> Option<bool> {
    let actions: &[&str] = match model {
        "project" => &["get_all", "add", "create_from_template", "update", "delete"],
        "task" => &["get_all", "add", "update", "delete", "swap_order"],
        "member" => &["get_all", "search", "add", "update", "delete"],
        "project_member" => &["get_by_member", "get_by_project", "add", "delete"],
        "task_dependency" => &["get_all", "set_for_task"],
        "plan_baseline" => &["get_by_project", "save", "clear"],
        "calendar" => &["fetch_ics"],
        "data" => &[
            "export_json",
            "import_json",
            "backup",
            "list_backups",
            "preview_backup",
            "restore",
        ],
        _ => return None,
    };
    if !actions.contains(&action) {
        return None;
    }
    Some(!matches!(
        action,
        "get_all"
            | "search"
            | "get_by_member"
            | "get_by_project"
            | "export_json"
            | "list_backups"
            | "preview_backup"
            | "fetch_ics"
    ))
}
