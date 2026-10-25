//! Root pagination and filter context are resolved before slicing, never per-row in Vue.
use crate::{
    common::db_state::DbState,
    db::task_db::{self, TaskQuery},
    models::task::Task,
};
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};

fn matches(task: &Task, query: &TaskQuery<'_>) -> bool {
    let keyword = query.keyword.unwrap_or("").trim().to_lowercase();
    if !keyword.is_empty()
        && !task.name.to_lowercase().contains(&keyword)
        && !task.comment.to_lowercase().contains(&keyword)
    {
        return false;
    }
    if query
        .priority
        .filter(|v| !v.is_empty())
        .is_some_and(|v| task.priority != v)
    {
        return false;
    }
    if query
        .assignee
        .filter(|v| !v.is_empty())
        .is_some_and(|v| task.assignee != v)
    {
        return false;
    }
    match query.status.unwrap_or("") {
        "" => true,
        "Done" => task.is_completed,
        "Pending" => task.status_builtin_key == "Pending",
        "Overdue" => crate::common::task_rollup::is_overdue(task),
        status => task.status_id == status || task.status == status,
    }
}

pub fn query(db: &DbState, query: &TaskQuery<'_>) -> Result<Value, String> {
    let scope = TaskQuery {
        page_index: 1,
        page_size: i64::MAX as u64,
        keyword: None,
        status: None,
        priority: None,
        assignee: None,
        ..*query
    };
    let (tasks, _) = task_db::query_tasks(db, &scope).map_err(|e| e.to_string())?;
    let by_id = tasks
        .iter()
        .map(|task| (task.id.as_str(), task))
        .collect::<HashMap<_, _>>();
    let matched = tasks
        .iter()
        .filter(|task| matches(task, query))
        .map(|task| task.id.as_str())
        .collect::<HashSet<_>>();
    let mut included = HashSet::new();
    let mut root_of = HashMap::new();
    for task in &tasks {
        if root_of.contains_key(task.id.as_str()) {
            continue;
        }
        let mut cursor = task;
        let mut path = Vec::new();
        let root = loop {
            if let Some(root) = root_of.get(cursor.id.as_str()) {
                break *root;
            }
            path.push(cursor.id.as_str());
            match by_id.get(cursor.parent.as_str()) {
                Some(parent) => cursor = parent,
                None => break cursor.id.as_str(),
            }
        };
        for id in path {
            root_of.insert(id, root);
        }
    }
    for id in &matched {
        let mut cursor = by_id[id];
        loop {
            if !included.insert(cursor.id.as_str()) {
                break;
            }
            match by_id.get(cursor.parent.as_str()) {
                Some(parent) => cursor = parent,
                None => break,
            }
        }
    }
    let roots = tasks
        .iter()
        .filter(|task| task.parent.is_empty() && included.contains(task.id.as_str()))
        .collect::<Vec<_>>();
    let total = roots.len() as u64;
    let offset = query
        .page_index
        .saturating_sub(1)
        .saturating_mul(query.page_size);
    let page_roots = roots
        .iter()
        .skip(usize::try_from(offset).unwrap_or(usize::MAX))
        .take(query.page_size as usize)
        .map(|task| task.id.as_str())
        .collect::<HashSet<_>>();
    let list = tasks
        .iter()
        .filter(|task| {
            included.contains(task.id.as_str()) && page_roots.contains(root_of[task.id.as_str()])
        })
        .map(|task| {
            let mut row = serde_json::to_value(task).map_err(|e| e.to_string())?;
            row["context_only"] = json!(!matched.contains(task.id.as_str()));
            Ok(row)
        })
        .collect::<Result<Vec<_>, String>>()?;
    let statistics = status_statistics(db, &tasks, &roots, &matched, query.project_id)?;
    Ok(
        json!({"list":list,"total":total,"pageIndex":query.page_index,"pageSize":query.page_size,
        "totalPage":total.div_ceil(query.page_size),"statistics":statistics}),
    )
}

fn status_statistics(
    db: &DbState,
    tasks: &[Task],
    roots: &[&Task],
    matched: &HashSet<&str>,
    project_id: Option<&str>,
) -> Result<Value, String> {
    let conn = db.lock_connection().map_err(|e| e.to_string())?;
    let mut statement = conn.prepare("SELECT id,project_id,name,builtin_key,color FROM task_status WHERE stateflag='0' ORDER BY project_id,sort_order,id").map_err(|e| e.to_string())?;
    let statuses = statement
        .query_map([], |r| {
            Ok((
                r.get::<_, String>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, String>(2)?,
                r.get::<_, String>(3)?,
                r.get::<_, String>(4)?,
            ))
        })
        .map_err(|e| e.to_string())?;
    let mut top = Vec::new();
    let mut all = Vec::new();
    for status in statuses {
        let (id, project, name, builtin, color) = status.map_err(|e| e.to_string())?;
        if project_id
            .filter(|v| !v.is_empty())
            .is_some_and(|v| project != v)
        {
            continue;
        }
        let base =
            json!({"id":id,"project_id":project,"name":name,"builtin_key":builtin,"color":color});
        let mut root = base.clone();
        root["count"] = json!(roots.iter().filter(|task| task.status_id == id).count());
        top.push(root);
        let mut each = base;
        each["count"] = json!(tasks
            .iter()
            .filter(|task| matched.contains(task.id.as_str()) && task.status_id == id)
            .count());
        all.push(each);
    }
    Ok(
        json!({"top_level":{"total":roots.len(),"statuses":top},"all_tasks":{"total":matched.len(),"statuses":all}}),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn pagination_counts_roots_and_filters_keep_ancestor_context() {
        let root = std::env::temp_dir().join(format!("easyproject-tree-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir(&root).unwrap();
        let db = crate::common::db_state::init_db(&root.join("workspace.db")).unwrap();
        {
            let conn = db.lock_connection().unwrap();
            conn.execute("INSERT INTO project(id,name) VALUES('p','Synthetic')", [])
                .unwrap();
            crate::common::task_status::seed_project(&conn, "p").unwrap();
            let status = crate::common::task_status::list(&conn, "p")
                .unwrap()
                .remove(0)
                .id;
            for (id, parent, order, name) in [
                ("root", "", 1, "Goal"),
                ("child", "root", 2, "Phase"),
                ("grandchild", "child", 3, "Needle"),
                ("other", "", 4, "Independent"),
            ] {
                conn.execute("INSERT INTO task(id,parent,project_id,sort_order,name,status_id) VALUES(?1,?2,'p',?3,?4,?5)", rusqlite::params![id,parent,order,name,status]).unwrap();
            }
        }
        let mut query = TaskQuery {
            page_index: 1,
            page_size: 1,
            project_id: Some("p"),
            keyword: None,
            status: None,
            priority: None,
            assignee: None,
            sort_by: "sort_order",
            sort_direction: "asc",
        };
        let first = super::query(&db, &query).unwrap();
        assert_eq!(first["total"], 2);
        assert_eq!(first["list"].as_array().unwrap().len(), 3);
        assert_eq!(first["statistics"]["all_tasks"]["total"], 4);
        query.page_index = 2;
        assert_eq!(super::query(&db, &query).unwrap()["list"][0]["id"], "other");
        query.page_index = 1;
        query.keyword = Some("needle");
        let filtered = super::query(&db, &query).unwrap();
        assert_eq!(filtered["total"], 1);
        assert_eq!(filtered["list"].as_array().unwrap().len(), 3);
        assert_eq!(filtered["list"][0]["context_only"], true);
        assert_eq!(filtered["list"][2]["context_only"], false);
        assert_eq!(filtered["statistics"]["all_tasks"]["total"], 1);
        assert_eq!(filtered["statistics"]["top_level"]["total"], 1);
        db.lock_connection().unwrap().execute_batch("UPDATE task SET start_time='2000-01-01',end_time='2000-01-02' WHERE id='root'; UPDATE task SET start_time='2060-01-01',end_time='2060-01-03' WHERE id='grandchild'; UPDATE task SET start_time='2050-01-01',end_time='2050-01-02' WHERE id='other';").unwrap();
        query.keyword = None;
        query.sort_by = "end_time";
        assert_eq!(super::query(&db, &query).unwrap()["list"][0]["id"], "other");
        assert_eq!(task_db::query_tasks(&db, &query).unwrap().0[0].id, "other");
        query.status = Some("Overdue");
        assert_eq!(super::query(&db, &query).unwrap()["total"], 0);
        assert_eq!(task_db::query_tasks(&db, &query).unwrap().1, 0);
        drop(db);
        std::fs::remove_dir_all(root).unwrap();
    }
}
