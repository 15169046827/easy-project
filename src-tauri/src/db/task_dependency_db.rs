use crate::common::db_state::DbState;
use crate::models::task_dependency::TaskDependency;
use rusqlite::{params, OptionalExtension};
use std::collections::{HashMap, HashSet};
use tauri::State;
use uuid::Uuid;

/// 有向图环检测 DFS，导出便于测试
pub fn has_cycle(graph: &HashMap<String, Vec<String>>, start: &str, target: &str) -> bool {
    fn reaches(
        graph: &HashMap<String, Vec<String>>,
        current: &str,
        target: &str,
        seen: &mut HashSet<String>,
    ) -> bool {
        if current == target {
            return true;
        }
        if !seen.insert(current.to_string()) {
            return false;
        }
        graph
            .get(current)
            .is_some_and(|next| next.iter().any(|id| reaches(graph, id, target, seen)))
    }
    reaches(graph, start, target, &mut HashSet::new())
}

pub fn list_for_project(
    db: &State<DbState>,
    project_id: &str,
) -> Result<Vec<TaskDependency>, String> {
    let conn =
        db.0.lock()
            .map_err(|_| "Database lock failed".to_string())?;
    let mut stmt = conn.prepare(
        "SELECT d.id, d.predecessor_task_id, d.successor_task_id, d.dependency_type, d.lag_minutes
         FROM task_dependency d
         JOIN task successor ON successor.id = d.successor_task_id
         WHERE successor.project_id = ?1 AND successor.stateflag = '0'
         ORDER BY d.create_time",
    ).map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([project_id], |row| {
            Ok(TaskDependency {
                id: row.get(0)?,
                predecessor_task_id: row.get(1)?,
                successor_task_id: row.get(2)?,
                dependency_type: row.get(3)?,
                lag_minutes: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<rusqlite::Result<Vec<_>>>()
        .map_err(|e| e.to_string())
}

pub fn replace_predecessors(
    db: &State<DbState>,
    successor_id: &str,
    predecessors: &[String],
) -> Result<(), String> {
    if predecessors.iter().any(|id| id == successor_id) {
        return Err("A task cannot depend on itself".to_string());
    }
    let mut unique = HashSet::new();
    if predecessors.iter().any(|id| !unique.insert(id)) {
        return Err("Duplicate task dependency".to_string());
    }
    let mut conn =
        db.0.lock()
            .map_err(|_| "Database lock failed".to_string())?;
    let project_id: String = conn
        .query_row(
            "SELECT project_id FROM task WHERE id = ?1 AND stateflag = '0'",
            [successor_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| e.to_string())?
        .ok_or("Task not found")?;
    for predecessor in predecessors {
        let predecessor_project: Option<String> = conn
            .query_row(
                "SELECT project_id FROM task WHERE id = ?1 AND stateflag = '0'",
                [predecessor],
                |row| row.get(0),
            )
            .optional()
            .map_err(|e| e.to_string())?;
        if predecessor_project.as_deref() != Some(project_id.as_str()) {
            return Err("Dependent tasks must belong to the same project".to_string());
        }
    }

    let mut graph: HashMap<String, Vec<String>> = HashMap::new();
    {
        let mut stmt = conn.prepare("SELECT predecessor_task_id, successor_task_id FROM task_dependency WHERE successor_task_id <> ?1")
            .map_err(|e| e.to_string())?;
        let edges = stmt
            .query_map([successor_id], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })
            .map_err(|e| e.to_string())?;
        for edge in edges {
            let (from, to) = edge.map_err(|e| e.to_string())?;
            graph.entry(from).or_default().push(to);
        }
    }
    for predecessor in predecessors {
        graph
            .entry(predecessor.clone())
            .or_default()
            .push(successor_id.to_string());
    }
    for predecessor in predecessors {
        if has_cycle(&graph, successor_id, predecessor) {
            return Err("The dependency would create a cycle".to_string());
        }
    }

    let tx = conn.transaction().map_err(|e| e.to_string())?;
    tx.execute(
        "DELETE FROM task_dependency WHERE successor_task_id = ?1",
        [successor_id],
    )
    .map_err(|e| e.to_string())?;
    for predecessor in predecessors {
        let id = format!("DEP:{}", &Uuid::new_v4().simple().to_string()[..18]);
        tx.execute(
            "INSERT INTO task_dependency (id, predecessor_task_id, successor_task_id, dependency_type, lag_minutes) VALUES (?1, ?2, ?3, 'FS', 0)",
            params![id, predecessor, successor_id],
        ).map_err(|e| e.to_string())?;
    }
    tx.commit().map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn g(edges: &[(&str, &str)]) -> HashMap<String, Vec<String>> {
        let mut graph: HashMap<String, Vec<String>> = HashMap::new();
        for (from, to) in edges {
            graph
                .entry(from.to_string())
                .or_default()
                .push(to.to_string());
        }
        graph
    }

    #[test]
    fn self_loop_is_cycle() {
        let graph = g(&[("A", "A")]);
        assert!(has_cycle(&graph, "A", "A"));
    }

    #[test]
    fn direct_cycle_detected() {
        let graph = g(&[("A", "B"), ("B", "A")]);
        assert!(has_cycle(&graph, "A", "A"));
    }

    #[test]
    fn three_node_cycle() {
        let graph = g(&[("A", "B"), ("B", "C"), ("C", "A")]);
        assert!(has_cycle(&graph, "A", "A"));
    }

    #[test]
    fn no_cycle_linear_chain() {
        // A -> B -> C, check if adding C -> A would create a cycle:
        // successor=C, predecessor=A → can C reach A? No.
        let graph = g(&[("A", "B"), ("B", "C")]);
        assert!(!has_cycle(&graph, "C", "A"));
    }

    #[test]
    fn no_cycle_dag() {
        // A -> B, A -> C, B -> D, check if adding D -> A would create a cycle:
        // successor=D, predecessor=A → can D reach A? No.
        let graph = g(&[("A", "B"), ("A", "C"), ("B", "D")]);
        assert!(!has_cycle(&graph, "D", "A"));
    }

    #[test]
    fn cycle_via_new_edge() {
        // A -> B, B -> C, check if adding C -> A would create a cycle
        let graph = g(&[("A", "B"), ("B", "C"), ("C", "A")]);
        assert!(has_cycle(&graph, "A", "A"));
    }

    #[test]
    fn isolated_nodes_no_cycle() {
        let graph = g(&[("X", "Y")]);
        assert!(!has_cycle(&graph, "Y", "X"));
        assert!(!has_cycle(&graph, "X", "Z"));
    }
}
