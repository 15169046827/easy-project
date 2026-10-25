//! Completion invariants shared by desktop, HTTP and MCP writes.
use rusqlite::Connection;
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};

struct Node {
    id: String,
    name: String,
    parent: String,
    project: String,
    completed: bool,
}

/// Only these domain-generated messages may cross the remote error redaction
/// boundary. They describe the authenticated workspace, never SQL or paths.
pub fn public_message(message: &str) -> Option<&str> {
    if message.starts_with("Completed parents cannot contain unfinished descendants. Reopen the parent explicitly or complete its descendants first: ")
        || message.starts_with("Reopen the completed ancestor with an explicit non-completed status before adding or moving a child: ")
        || message == "Parent progress, effort and dates are derived from children and cannot be edited" {
        Some(message)
    } else { None }
}

fn active_nodes(conn: &Connection) -> Result<HashMap<String, Node>, String> {
    let mut query = conn
        .prepare(
            "SELECT t.id,t.name,COALESCE(t.parent,''),t.project_id,COALESCE(s.is_completed,0)
         FROM task t LEFT JOIN task_status s ON s.id=t.status_id
         WHERE t.stateflag='0'",
        )
        .map_err(|e| e.to_string())?;
    let rows = query
        .query_map([], |row| {
            Ok(Node {
                id: row.get(0)?,
                name: row.get(1)?,
                parent: row.get(2)?,
                project: row.get(3)?,
                completed: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.map(|row| row.map(|node| (node.id.clone(), node)))
        .collect::<rusqlite::Result<HashMap<_, _>>>()
        .map_err(|e| e.to_string())
}

/// New children (including already-completed children) require an explicitly
/// reopened parent. Never guess which non-completed status the user intends.
pub fn validate_attachment(conn: &Connection, parent: &str) -> Result<(), String> {
    let nodes = active_nodes(conn)?;
    let mut cursor = parent;
    let mut visited = HashSet::new();
    while let Some(node) = nodes.get(cursor) {
        if !visited.insert(cursor) {
            return Err("Task hierarchy contains a cycle".into());
        }
        if node.completed {
            return Err(format!(
                "Reopen the completed ancestor with an explicit non-completed status before adding or moving a child: {}",
                json!({"id": node.id, "name": node.name})
            ));
        }
        cursor = &node.parent;
    }
    Ok(())
}

/// Validate a changed branch, or the entire graph for an atomic import.
/// Unrelated historical inconsistencies do not prevent unrelated edits.
pub fn validate_completion(conn: &Connection, focus: Option<&[String]>) -> Result<(), String> {
    let nodes = active_nodes(conn)?;
    let focus: Option<HashSet<&str>> = focus.map(|ids| ids.iter().map(String::as_str).collect());
    let mut conflicts = Vec::new();
    let mut total = 0;
    let mut ordered = nodes
        .values()
        .filter(|node| !node.completed)
        .collect::<Vec<_>>();
    ordered.sort_by(|a, b| a.id.cmp(&b.id));
    for leaf in ordered {
        let mut path = vec![leaf.id.as_str()];
        let mut visited = HashSet::from([leaf.id.as_str()]);
        let mut cursor = leaf.parent.as_str();
        while let Some(ancestor) = nodes.get(cursor) {
            if ancestor.project != leaf.project || !visited.insert(cursor) {
                break;
            }
            path.push(cursor);
            if ancestor.completed
                && focus
                    .as_ref()
                    .is_none_or(|ids| path.iter().any(|id| ids.contains(id)))
            {
                total += 1;
                if conflicts.len() < 20 {
                    conflicts.push(json!({
                        "ancestor_id": ancestor.id, "ancestor_name": ancestor.name,
                        "task_id": leaf.id, "task_name": leaf.name
                    }));
                }
            }
            cursor = &ancestor.parent;
        }
    }
    if total == 0 {
        Ok(())
    } else {
        Err(format!(
            "Completed parents cannot contain unfinished descendants. Reopen the parent explicitly or complete its descendants first: {}",
            json!({"total": total, "conflicts": conflicts, "truncated": total > conflicts.len()})
        ))
    }
}

pub fn before_write(
    conn: &Connection,
    model: &str,
    action: &str,
    data: &Value,
) -> Result<(), String> {
    if model != "task" || !matches!(action, "add" | "update") {
        return Ok(());
    }
    let Some(parent) = data
        .get("parent")
        .and_then(Value::as_str)
        .filter(|id| !id.is_empty())
    else {
        return Ok(());
    };
    if action == "update" {
        let current: String = conn
            .query_row(
                "SELECT COALESCE(parent,'') FROM task WHERE id=?1 AND stateflag='0'",
                [data["id"].as_str().unwrap_or("")],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;
        if current == parent {
            return Ok(());
        }
    }
    validate_attachment(conn, parent)
}

pub fn after_write(
    conn: &Connection,
    model: &str,
    action: &str,
    data: &Value,
    result: Option<&Value>,
) -> Result<(), String> {
    let focus = match (model, action) {
        ("task", "add") => vec![result
            .and_then(|value| value["id"].as_str())
            .ok_or("Created task ID missing")?
            .to_owned()],
        ("task", "update")
            if ["parent", "project_id", "status", "status_id"]
                .iter()
                .any(|key| data.get(key).is_some()) =>
        {
            vec![data["id"].as_str().ok_or("Task ID missing")?.to_owned()]
        }
        ("task_status", "update") if data.get("is_completed").is_some() => {
            let mut query = conn
                .prepare("SELECT id FROM task WHERE status_id=?1 AND stateflag='0'")
                .map_err(|e| e.to_string())?;
            let ids = query
                .query_map([data["id"].as_str().ok_or("Status ID missing")?], |row| {
                    row.get::<_, String>(0)
                })
                .map_err(|e| e.to_string())?;
            ids.collect::<rusqlite::Result<Vec<_>>>()
                .map_err(|e| e.to_string())?
        }
        _ => return Ok(()),
    };
    validate_completion(conn, Some(&focus))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        common::{
            db_state::{init_db, DbState},
            id::new_id,
        },
        services::entity_api,
    };
    use std::path::PathBuf;

    struct Fixture {
        db: Option<DbState>,
        root: PathBuf,
        project: String,
        pending: String,
        done: String,
    }
    impl Fixture {
        fn new() -> Self {
            let root = std::env::temp_dir()
                .join(format!("easyproject-hierarchy-{}", uuid::Uuid::new_v4()));
            std::fs::create_dir(&root).unwrap();
            let db = init_db(&root.join("workspace.db")).unwrap();
            let project = new_id("PROJECT");
            let (pending, done) = {
                let conn = db.lock_connection().unwrap();
                conn.execute(
                    "INSERT INTO project(id,name) VALUES(?1,'Synthetic hierarchy')",
                    [&project],
                )
                .unwrap();
                crate::common::task_status::seed_project(&conn, &project).unwrap();
                let states = crate::common::task_status::list(&conn, &project).unwrap();
                (
                    states
                        .iter()
                        .find(|s| s.builtin_key == "Pending")
                        .unwrap()
                        .id
                        .clone(),
                    states.iter().find(|s| s.is_completed).unwrap().id.clone(),
                )
            };
            Self {
                db: Some(db),
                root,
                project,
                pending,
                done,
            }
        }
        fn db(&self) -> &DbState {
            self.db.as_ref().unwrap()
        }
        fn task(&self, name: &str, parent: &str, completed: bool) -> String {
            let id = new_id("TASK");
            self.db().lock_connection().unwrap().execute(
                "INSERT INTO task(id,name,project_id,parent,status,status_id,progress) VALUES(?1,?2,?3,?4,'fixture',?5,?6)",
                rusqlite::params![id,name,self.project,parent,if completed { &self.done } else { &self.pending },if completed {100} else {25}],
            ).unwrap();
            id
        }
        fn update(
            &self,
            id: &str,
            status: &str,
        ) -> Result<crate::models::common::ApiResponse<Value>, String> {
            entity_api::dispatch(
                self.db(),
                "task",
                "update",
                json!({"id":id,"status_id":status}),
            )
        }
    }
    impl Drop for Fixture {
        fn drop(&mut self) {
            drop(self.db.take());
            std::fs::remove_dir_all(&self.root).unwrap();
        }
    }

    #[test]
    fn completion_checks_all_descendants_and_rolls_back_progress_and_status() {
        let f = Fixture::new();
        let root = f.task("Goal", "", false);
        let child = f.task("Breakdown", &root, false);
        let grandchild = f.task("Execution", &child, false);
        let error = f.update(&root, &f.done).unwrap_err();
        assert!(error.contains(&child) && error.contains(&grandchild));
        let record = entity_api::get(f.db(), "task", &root).unwrap();
        assert_eq!(record["status_id"], f.pending);
        let stored: i64 = f
            .db()
            .lock_connection()
            .unwrap()
            .query_row("SELECT progress FROM task WHERE id=?1", [&root], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(stored, 25);
        f.update(&grandchild, &f.done).unwrap();
        f.update(&child, &f.done).unwrap();
        f.update(&root, &f.done).unwrap();
        assert!(f
            .update(&grandchild, &f.pending)
            .unwrap_err()
            .contains(&root));
        assert_eq!(
            entity_api::get(f.db(), "task", &grandchild).unwrap()["status_id"],
            f.done
        );
        // Every completed ancestor must be reopened explicitly, not just the direct parent.
        f.update(&root, &f.pending).unwrap();
        assert!(f.update(&grandchild, &f.pending).is_err());
        f.update(&child, &f.pending).unwrap();
        f.update(&grandchild, &f.pending).unwrap();
    }

    #[test]
    fn adding_or_moving_even_completed_children_requires_reopened_parent() {
        let f = Fixture::new();
        let parent = f.task("Finished goal", "", true);
        let outside = f.task("Outside", "", true);
        let error = entity_api::dispatch(
            f.db(),
            "task",
            "add",
            json!({
                "name":"New child", "project_id":f.project, "parent":parent,
                "dependence":"", "start_time":"", "end_time":"", "type":"Task",
                "priority":"3", "status_id":f.done, "comment":"", "assignee":""
            }),
        )
        .unwrap_err();
        assert!(error.contains(&parent));
        assert!(entity_api::dispatch(
            f.db(),
            "task",
            "update",
            json!({"id":outside,"parent":parent})
        )
        .is_err());
        assert_eq!(
            entity_api::get(f.db(), "task", &outside).unwrap()["parent"],
            ""
        );
        // Non-hierarchy edits to an already-completed task remain possible.
        entity_api::dispatch(
            f.db(),
            "task",
            "update",
            json!({"id":parent,"name":"Renamed"}),
        )
        .unwrap();
    }

    #[test]
    fn status_dictionary_completion_changes_cannot_bypass_hierarchy() {
        let f = Fixture::new();
        let root = f.task("Done parent", "", true);
        f.task("Done child", &root, true);
        // Reopening all tasks sharing one status is coherent and atomic.
        entity_api::dispatch(
            f.db(),
            "task_status",
            "update",
            json!({"id":f.done,"is_completed":false}),
        )
        .unwrap();
        entity_api::dispatch(
            f.db(),
            "task_status",
            "update",
            json!({"id":f.done,"is_completed":true}),
        )
        .unwrap();
        let other = entity_api::dispatch(
            f.db(),
            "task_status",
            "add",
            json!({"project_id":f.project,"name":"Review"}),
        )
        .unwrap()
        .data
        .unwrap()["id"]
            .as_str()
            .unwrap()
            .to_owned();
        let open_root = f.task("Open parent", "", false);
        let open_child = f.task("Open child", &open_root, false);
        f.update(&open_child, &other).unwrap();
        let result = entity_api::dispatch(
            f.db(),
            "task_status",
            "update",
            json!({"id":f.pending,"is_completed":true}),
        );
        assert!(result.unwrap_err().contains(&open_child));
        assert_eq!(
            entity_api::get(f.db(), "task_status", &f.pending).unwrap()["is_completed"],
            false
        );
        let stored: i64 = f
            .db()
            .lock_connection()
            .unwrap()
            .query_row(
                "SELECT progress FROM task WHERE id=?1",
                [&open_root],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(stored, 25);
    }

    #[test]
    fn imports_check_all_branches_but_unrelated_mutations_are_not_blocked() {
        let f = Fixture::new();
        let historical = f.task("Historical completed", "", true);
        let conflict = f.task("Historical unfinished", &historical, false);
        let unrelated = f.task("Unrelated", "", false);
        f.update(&unrelated, &f.done).unwrap();
        let conn = f.db().lock_connection().unwrap();
        assert!(validate_completion(&conn, None)
            .unwrap_err()
            .contains(&conflict));
        conn.execute(
            "UPDATE task SET stateflag='deleted' WHERE id=?1",
            [&conflict],
        )
        .unwrap();
        validate_completion(&conn, None).unwrap();
    }
}
