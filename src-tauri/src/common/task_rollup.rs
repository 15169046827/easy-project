//! One authoritative read-time rollup. Stored leaf estimates are never rewritten.
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TaskSummary {
    pub has_children: bool,
    pub direct_child_count: usize,
    pub completed_child_count: usize,
    pub effort_days: f64,
    pub progress: Option<f64>,
    pub unestimated_count: usize,
    pub legacy_unknown_count: usize,
    pub start_time: String,
    pub end_time: String,
    pub schedule_incomplete: bool,
}
struct Node {
    parent: String,
    project: String,
    completed: bool,
    summary: TaskSummary,
}

pub fn is_overdue(task: &crate::models::task::Task) -> bool {
    let completed = task.is_completed
        || (task.status_id.is_empty() && matches!(task.status.as_str(), "Done" | "Archived"));
    if completed {
        return false;
    }
    let due = chrono::NaiveDateTime::parse_from_str(&task.end_time, "%Y-%m-%d %H:%M:%S")
        .ok()
        .or_else(|| {
            chrono::NaiveDate::parse_from_str(&task.end_time, "%Y-%m-%d")
                .ok()?
                .and_hms_opt(0, 0, 0)
        });
    due.is_some_and(|date| date < chrono::Local::now().naive_local())
}

pub fn calculate(conn: &Connection) -> Result<HashMap<String, TaskSummary>, String> {
    let mut query = conn.prepare(
        "SELECT t.id,COALESCE(t.parent,''),COALESCE(t.project_id,''),COALESCE(t.effort_days,0),t.effort_state,COALESCE(t.progress,0),
         COALESCE(t.start_time,''),COALESCE(t.end_time,''),COALESCE(s.is_completed,0)
         FROM task t LEFT JOIN task_status s ON s.id=t.status_id WHERE t.stateflag='0'",
    ).map_err(|e| e.to_string())?;
    let rows = query
        .query_map([], |row| {
            let start: String = row.get(6)?;
            let end: String = row.get(7)?;
            let state: String = row.get(4)?;
            Ok((
                row.get::<_, String>(0)?,
                Node {
                    parent: row.get(1)?,
                    project: row.get(2)?,
                    completed: row.get(8)?,
                    summary: TaskSummary {
                        effort_days: if state == "estimated" {
                            row.get(3)?
                        } else {
                            0.0
                        },
                        progress: Some(row.get::<_, f64>(5)?),
                        unestimated_count: usize::from(state == "unestimated"),
                        legacy_unknown_count: usize::from(state == "legacy_unknown"),
                        schedule_incomplete: start.is_empty(),
                        end_time: if end.is_empty() { start.clone() } else { end },
                        start_time: start,
                        ..TaskSummary::default()
                    },
                },
            ))
        })
        .map_err(|e| e.to_string())?;
    let mut nodes = rows
        .collect::<rusqlite::Result<HashMap<_, _>>>()
        .map_err(|e| e.to_string())?;
    let mut children: HashMap<String, Vec<String>> = HashMap::new();
    for (id, node) in &nodes {
        if let Some(parent) = nodes.get(&node.parent) {
            if parent.project != node.project || id == &node.parent {
                return Err("Invalid task hierarchy".into());
            }
            children
                .entry(node.parent.clone())
                .or_default()
                .push(id.clone());
        } else if !node.parent.is_empty() {
            return Err("Active task parent missing".into());
        }
    }
    let mut remaining = children
        .iter()
        .map(|(id, items)| (id.clone(), items.len()))
        .collect::<HashMap<_, _>>();
    let mut queue = nodes
        .keys()
        .filter(|id| !children.contains_key(*id))
        .cloned()
        .collect::<VecDeque<_>>();
    let mut result: HashMap<String, TaskSummary> = HashMap::new();
    while let Some(id) = queue.pop_front() {
        let node = nodes.get(&id).ok_or("Rollup node missing")?;
        let parent = node.parent.clone();
        let mut summary = node.summary.clone();
        if let Some(ids) = children.get(&id) {
            summary = TaskSummary {
                has_children: true,
                direct_child_count: ids.len(),
                ..TaskSummary::default()
            };
            let mut weighted_mean = 0.0;
            for child_id in ids {
                let child = result.get(child_id).ok_or("Child rollup missing")?;
                summary.completed_child_count += usize::from(nodes[child_id].completed);
                summary.effort_days += child.effort_days;
                if !summary.effort_days.is_finite() {
                    return Err("Task effort rollup exceeds numeric range".into());
                }
                if child.effort_days > 0.0 {
                    weighted_mean += (child.progress.unwrap_or(0.0) - weighted_mean)
                        * (child.effort_days / summary.effort_days);
                }
                summary.unestimated_count += child.unestimated_count;
                summary.legacy_unknown_count += child.legacy_unknown_count;
                summary.schedule_incomplete |= child.schedule_incomplete;
                if !child.start_time.is_empty()
                    && (summary.start_time.is_empty() || child.start_time < summary.start_time)
                {
                    summary.start_time = child.start_time.clone();
                }
                if child.end_time > summary.end_time {
                    summary.end_time = child.end_time.clone();
                }
            }
            if !weighted_mean.is_finite() {
                return Err("Task effort rollup exceeds numeric range".into());
            }
            summary.progress = (summary.effort_days > 0.0).then_some(weighted_mean);
        }
        result.insert(id, summary);
        if let Some(count) = remaining.get_mut(&parent) {
            *count -= 1;
            if *count == 0 {
                queue.push_back(parent);
            }
        }
    }
    if result.len() != nodes.len() {
        return Err("Task hierarchy contains a cycle".into());
    }
    nodes.clear();
    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    fn fixture() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("CREATE TABLE task(id TEXT PRIMARY KEY,parent TEXT DEFAULT '',project_id TEXT DEFAULT 'p',effort_days REAL DEFAULT 0,effort_state TEXT DEFAULT 'unestimated',progress REAL DEFAULT 0,start_time TEXT DEFAULT '',end_time TEXT DEFAULT '',status_id TEXT DEFAULT '',stateflag TEXT DEFAULT '0'); CREATE TABLE task_status(id TEXT PRIMARY KEY,is_completed INTEGER); INSERT INTO task_status VALUES('open',0),('done',1);").unwrap();
        conn
    }
    #[test]
    fn recursively_weights_leaves_without_double_counting_parent_estimates() {
        let conn = fixture();
        conn.execute_batch("INSERT INTO task(id,parent,effort_days,effort_state,progress) VALUES('root','',99,'estimated',99),('middle','root',50,'estimated',0),('a','middle',2,'estimated',50),('b','middle',6,'estimated',100),('zero','root',0,'estimated',0),('missing','root',0,'unestimated',40),('legacy','root',0,'legacy_unknown',0);").unwrap();
        let rows = calculate(&conn).unwrap();
        assert_eq!(rows["root"].effort_days, 8.0);
        assert_eq!(rows["root"].progress, Some(87.5));
        assert_eq!(rows["root"].unestimated_count, 1);
        assert_eq!(rows["root"].legacy_unknown_count, 1);
        assert_eq!(rows["middle"].progress, Some(87.5));
        assert_eq!(
            conn.query_row("SELECT effort_days FROM task WHERE id='root'", [], |r| r
                .get::<_, f64>(0))
                .unwrap(),
            99.0
        );
    }
    #[test]
    fn zero_weight_is_not_a_fabricated_percentage_and_dates_are_independent() {
        let conn = fixture();
        conn.execute_batch("INSERT INTO task(id,parent,effort_state,start_time,end_time) VALUES('root','','estimated','',''),('zero','root','estimated','2026-10-25','2026-10-29'),('start-only','root','unestimated','2026-10-24',''),('missing','root','legacy_unknown','','');").unwrap();
        let rows = calculate(&conn).unwrap();
        assert_eq!(rows["root"].progress, None);
        assert_eq!(rows["root"].start_time, "2026-10-24");
        assert_eq!(rows["root"].end_time, "2026-10-29");
        assert!(rows["root"].schedule_incomplete);
        assert_eq!(rows["start-only"].end_time, "2026-10-24");
        conn.execute(
            "UPDATE task SET stateflag='deleted' WHERE id IN ('missing','start-only')",
            [],
        )
        .unwrap();
        let rows = calculate(&conn).unwrap();
        assert_eq!(
            rows["root"].unestimated_count + rows["root"].legacy_unknown_count,
            0
        );
        assert!(!rows["root"].schedule_incomplete);
    }
    #[test]
    fn cycles_and_cross_project_parents_fail_closed() {
        let conn = fixture();
        conn.execute_batch("INSERT INTO task(id,parent) VALUES('a','b'),('b','a');")
            .unwrap();
        assert!(calculate(&conn).unwrap_err().contains("cycle"));
        conn.execute_batch("UPDATE task SET parent='' WHERE id='b'; UPDATE task SET project_id='other' WHERE id='b';").unwrap();
        assert!(calculate(&conn).is_err());
    }
    #[test]
    fn deep_hierarchies_are_iterative_not_recursive() {
        let conn = fixture();
        for n in 0..10_000 {
            conn.execute("INSERT INTO task(id,parent,effort_days,effort_state,progress) VALUES(?1,?2,1,'estimated',37)", rusqlite::params![n.to_string(), if n == 0 {String::new()} else {(n-1).to_string()}]).unwrap();
        }
        let rows = calculate(&conn).unwrap();
        assert_eq!(rows.len(), 10_000);
        assert_eq!(rows["0"].effort_days, 1.0);
        assert_eq!(rows["0"].progress, Some(37.0));
    }
}
