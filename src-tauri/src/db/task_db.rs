use crate::common::db_state::DbState;
use crate::models::task::{NewTask, Task};
use rusqlite::params_from_iter;
use rusqlite::{params, Connection, Row};

pub struct TaskQuery<'a> {
    pub page_index: u64,
    pub page_size: u64,
    pub project_id: Option<&'a str>,
    pub keyword: Option<&'a str>,
    pub status: Option<&'a str>,
    pub priority: Option<&'a str>,
    pub assignee: Option<&'a str>,
    pub sort_by: &'a str,
    pub sort_direction: &'a str,
}

pub fn swap_task_order(db: &DbState, source_id: &str, target_id: &str) -> Result<(), String> {
    let mut conn = db.lock_connection().map_err(|error| error.to_string())?;
    swap_task_order_connection(&mut conn, source_id, target_id)
}

fn swap_task_order_connection(
    conn: &mut rusqlite::Connection,
    source_id: &str,
    target_id: &str,
) -> Result<(), String> {
    if source_id.is_empty() || target_id.is_empty() || source_id == target_id {
        return Err("Two different task IDs are required".to_string());
    }
    let transaction = conn.transaction().map_err(|error| error.to_string())?;
    let relation = |id: &str| {
        transaction
            .query_row(
                "SELECT COALESCE(project_id, ''), COALESCE(parent, ''), COALESCE(sort_order, 0)
             FROM task WHERE id = ?1 AND stateflag = '0'",
                [id],
                |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, String>(1)?,
                        row.get::<_, i64>(2)?,
                    ))
                },
            )
            .map_err(|error| error.to_string())
    };
    let source = relation(source_id)?;
    let target = relation(target_id)?;
    if source.0 != target.0 || source.1 != target.1 {
        return Err("Only sibling tasks in the same project can be reordered".to_string());
    }
    for (id, order) in [(source_id, target.2), (target_id, source.2)] {
        let changed = transaction
            .execute(
                "UPDATE task SET sort_order = ?1, update_time = datetime('now', 'localtime')
             WHERE id = ?2 AND stateflag = '0'",
                params![order, id],
            )
            .map_err(|error| error.to_string())?;
        if changed != 1 {
            return Err("The task is no longer available".to_string());
        }
    }
    transaction.commit().map_err(|error| error.to_string())
}

pub fn insert_task(db: &DbState, p: &NewTask) -> rusqlite::Result<()> {
    let mut conn = db.lock_connection()?;
    let transaction = conn.savepoint()?;
    insert_task_transaction(&transaction, p)?;
    transaction.commit()
}

pub(crate) fn insert_task_transaction(
    transaction: &Connection,
    p: &NewTask,
) -> rusqlite::Result<()> {
    crate::common::task_status::seed_project(transaction, &p.project_id)?;
    let state =
        crate::common::task_status::resolve_builtin_or_id(transaction, &p.project_id, &p.status)
            .map_err(|message| {
                rusqlite::Error::ToSqlConversionFailure(Box::new(std::io::Error::other(message)))
            })?;
    transaction.execute(
        "INSERT INTO task (id, project_id, sort_order, name, parent, dependence, start_time, end_time, type,
        priority, status, progress, effort_days, schedule_mode, comment, assignee, creator, create_time, update_time, stateflag,status_id)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17,
         datetime('now', 'localtime'), datetime('now', 'localtime'), '0',?18)",
        params![
            p.id,
            p.project_id,
            p.sort_order,
            p.name,
            p.parent,
            p.dependence,
            p.start_time,
            p.end_time,
            p.r#type,
            p.priority,
            state.name,
            if state.is_completed {100} else {p.progress},
            p.effort_days,
            p.schedule_mode,
            p.comment,
            p.assignee,
            p.creator,
            state.id
        ],
    )?;
    Ok(())
}

pub fn get_all_task(
    db: &DbState,
    page_index: u64,
    page_size: u64,
    project_id: Option<&str>,
) -> rusqlite::Result<(Vec<Task>, u64)> {
    let conn = db.lock_connection()?;

    let offset = super::pagination_offset(page_index, page_size);

    // ---- 查询分页列表 ----
    let select_sql =
        "SELECT id, COALESCE(project_id, ''), COALESCE(sort_order, 0), name, COALESCE(parent, ''),
                COALESCE(dependence, ''), COALESCE(start_time, ''), COALESCE(end_time, ''),
                type, priority, status, COALESCE(progress, 0), COALESCE(effort_days, 0),
                COALESCE(schedule_mode, 'fixed_dates'),
                COALESCE(comment, ''), COALESCE(assignee, ''),
                COALESCE(creator, ''), create_time, update_time, stateflag,status_id,
                COALESCE((SELECT is_completed FROM task_status s WHERE s.id=task.status_id),0),
                COALESCE((SELECT builtin_key FROM task_status s WHERE s.id=task.status_id),'')
         FROM task
         WHERE stateflag = '0'";

    let list = if let Some(project_id) = project_id {
        let sql = format!(
            "{} AND project_id = ? ORDER BY sort_order ASC, create_time ASC LIMIT ? OFFSET ?",
            select_sql
        );
        let mut stmt = conn.prepare(&sql)?;
        let rows = stmt.query_map(params![project_id, page_size, offset], map_task)?;
        rows.collect::<rusqlite::Result<Vec<_>>>()?
    } else {
        let sql = format!(
            "{} ORDER BY project_id, sort_order ASC, create_time ASC LIMIT ? OFFSET ?",
            select_sql
        );
        let mut stmt = conn.prepare(&sql)?;
        let rows = stmt.query_map(params![page_size, offset], map_task)?;
        rows.collect::<rusqlite::Result<Vec<_>>>()?
    };

    // ---- 查询总数 ----
    let total: u64 = if let Some(project_id) = project_id {
        conn.query_row(
            "SELECT COUNT(*) FROM task WHERE stateflag = '0' AND project_id = ?1",
            [project_id],
            |row| row.get(0),
        )?
    } else {
        conn.query_row(
            "SELECT COUNT(*) FROM task WHERE stateflag = '0'",
            [],
            |row| row.get(0),
        )?
    };

    Ok((list, total))
}

pub fn query_tasks(db: &DbState, query: &TaskQuery<'_>) -> rusqlite::Result<(Vec<Task>, u64)> {
    let conn = db.lock_connection()?;
    let offset = super::pagination_offset(query.page_index, query.page_size);
    let select_sql = "SELECT id, COALESCE(project_id, ''), COALESCE(sort_order, 0), name,
        COALESCE(parent, ''), COALESCE(dependence, ''), COALESCE(start_time, ''),
        COALESCE(end_time, ''), type, priority, status, COALESCE(progress, 0),
        COALESCE(effort_days, 0), COALESCE(schedule_mode, 'fixed_dates'), COALESCE(comment, ''),
        COALESCE(assignee, ''), COALESCE(creator, ''), create_time, update_time, stateflag,status_id,
        COALESCE((SELECT is_completed FROM task_status s WHERE s.id=task.status_id),0),
        COALESCE((SELECT builtin_key FROM task_status s WHERE s.id=task.status_id),'')
        FROM task WHERE stateflag = '0'";

    let mut conditions = Vec::new();
    let mut values = Vec::<String>::new();
    if let Some(project_id) = query.project_id.filter(|value| !value.is_empty()) {
        conditions.push("project_id = ?".to_string());
        values.push(project_id.to_string());
    }
    if let Some(keyword) = query.keyword.filter(|value| !value.trim().is_empty()) {
        conditions.push(
            "(LOWER(name) LIKE LOWER(?) OR LOWER(COALESCE(comment, '')) LIKE LOWER(?))".to_string(),
        );
        let pattern = format!("%{}%", keyword.trim());
        values.push(pattern.clone());
        values.push(pattern);
    }
    if let Some(status) = query.status.filter(|value| !value.is_empty()) {
        match status {
            "Pending" => conditions.push("COALESCE((SELECT builtin_key FROM task_status s WHERE s.id=task.status_id),CASE WHEN status IN ('Pending','Todo') THEN 'Pending' ELSE '' END)='Pending'".to_string()),
            "Overdue" => conditions.push("COALESCE((SELECT is_completed FROM task_status s WHERE s.id=task.status_id),CASE WHEN status IN ('Done','Archived') THEN 1 ELSE 0 END)=0 AND datetime(end_time) < datetime('now', 'localtime')".to_string()),
            "Done" => conditions.push("COALESCE((SELECT is_completed FROM task_status s WHERE s.id=task.status_id),CASE WHEN status='Done' THEN 1 ELSE 0 END)=1".to_string()),
            _ => {
                conditions.push("(status_id = ? OR status = ?)".to_string());
                values.push(status.to_string());
                values.push(status.to_string());
            }
        }
    }
    if let Some(priority) = query.priority.filter(|value| !value.is_empty()) {
        conditions.push("priority = ?".to_string());
        values.push(priority.to_string());
    }
    if let Some(assignee) = query.assignee.filter(|value| !value.is_empty()) {
        conditions.push("assignee = ?".to_string());
        values.push(assignee.to_string());
    }
    let where_suffix = if conditions.is_empty() {
        String::new()
    } else {
        format!(" AND {}", conditions.join(" AND "))
    };
    let sort_column = match query.sort_by {
        "name" => "name",
        "status" => "status",
        "priority" => "CASE priority WHEN '1' THEN 1 WHEN '2' THEN 2 WHEN 'High' THEN 2 WHEN '3' THEN 3 WHEN 'Normal' THEN 3 WHEN '4' THEN 4 WHEN 'Low' THEN 4 WHEN '5' THEN 5 ELSE 6 END",
        "start_time" => "start_time",
        "end_time" => "end_time",
        "update_time" => "update_time",
        _ => "sort_order",
    };
    let sort_direction = if query.sort_direction.eq_ignore_ascii_case("desc") {
        "DESC"
    } else {
        "ASC"
    };
    let sql = format!(
        "{}{} ORDER BY {} {}, create_time ASC LIMIT ? OFFSET ?",
        select_sql, where_suffix, sort_column, sort_direction
    );
    let mut list_values = values.clone();
    list_values.push(query.page_size.to_string());
    list_values.push(offset.to_string());
    let mut statement = conn.prepare(&sql)?;
    let rows = statement.query_map(params_from_iter(&list_values), map_task)?;
    let list = rows.collect::<rusqlite::Result<Vec<_>>>()?;

    let count_sql = format!(
        "SELECT COUNT(*) FROM task WHERE stateflag = '0'{}",
        where_suffix
    );
    let total = conn.query_row(&count_sql, params_from_iter(&values), |row| row.get(0))?;
    Ok((list, total))
}

pub fn update_task(
    db: &DbState,
    param_set: &[String],
    value_set: &[String],
) -> rusqlite::Result<()> {
    let conn = db.lock_connection()?;
    let sql = format!("UPDATE task SET {} WHERE id = ?", param_set.join(", "));
    conn.execute(&sql, params_from_iter(value_set))?;
    Ok(())
}

pub fn remove_task(db: &DbState, ids: &[String]) -> rusqlite::Result<()> {
    let conn: std::sync::MutexGuard<'_, rusqlite::Connection> = db.lock_connection()?;
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
    let sql = format!(
        "UPDATE task SET stateflag = strftime('%s', 'now') where id in ({})",
        placeholders
    );
    let params: Vec<&str> = ids.iter().map(|s| s.as_str()).collect();
    conn.execute(&sql, params_from_iter(params))?;
    Ok(())
}

fn map_task(row: &Row<'_>) -> rusqlite::Result<Task> {
    Ok(Task {
        id: row.get(0)?,
        project_id: row.get(1)?,
        sort_order: row.get(2)?,
        name: row.get(3)?,
        parent: row.get(4)?,
        dependence: row.get(5)?,
        start_time: row.get(6)?,
        end_time: row.get(7)?,
        r#type: row.get(8)?,
        priority: row.get(9)?,
        status: row.get(10)?,
        status_id: row.get(20)?,
        is_completed: row.get(21)?,
        status_builtin_key: row.get(22)?,
        progress: row.get(11)?,
        effort_days: row.get(12)?,
        schedule_mode: row.get(13)?,
        comment: row.get(14)?,
        assignee: row.get(15)?,
        creator: row.get(16)?,
        create_time: row.get(17)?,
        update_time: row.get(18)?,
        stateflag: row.get(19)?,
    })
}

pub fn next_sort_order(db: &DbState, project_id: &str, parent: &str) -> rusqlite::Result<i64> {
    let conn = db.lock_connection()?;
    conn.query_row(
        "SELECT COALESCE(MAX(sort_order), 0) + 1 FROM task
         WHERE project_id = ?1 AND COALESCE(parent, '') = ?2 AND stateflag = '0'",
        params![project_id, parent],
        |row| row.get(0),
    )
}

pub fn get_task_relation(db: &DbState, task_id: &str) -> rusqlite::Result<(String, String)> {
    let conn = db.lock_connection()?;
    conn.query_row(
        "SELECT COALESCE(project_id, ''), COALESCE(parent, '') FROM task
         WHERE id = ?1 AND stateflag = '0'",
        [task_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )
}

pub fn get_task_schedule(db: &DbState, task_id: &str) -> rusqlite::Result<(String, String)> {
    let conn = db.lock_connection()?;
    conn.query_row(
        "SELECT COALESCE(start_time, ''), COALESCE(end_time, '') FROM task WHERE id = ?1 AND stateflag = '0'",
        [task_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )
}

pub fn get_task_assignee(db: &DbState, task_id: &str) -> rusqlite::Result<String> {
    let conn = db.lock_connection()?;
    conn.query_row(
        "SELECT COALESCE(assignee, '') FROM task WHERE id = ?1 AND stateflag = '0'",
        [task_id],
        |row| row.get(0),
    )
}

pub fn validate_parent(
    db: &DbState,
    task_id: Option<&str>,
    project_id: &str,
    parent_id: &str,
) -> Result<(), String> {
    if parent_id.is_empty() {
        return Ok(());
    }
    if task_id == Some(parent_id) {
        return Err("A task cannot be its own parent".to_string());
    }

    let conn = db.lock_connection().map_err(|error| error.to_string())?;
    let mut current = parent_id.to_string();
    for _ in 0..1000 {
        if task_id == Some(current.as_str()) {
            return Err("The selected parent would create a cycle".to_string());
        }
        let relation = conn.query_row(
            "SELECT COALESCE(project_id, ''), COALESCE(parent, '') FROM task
             WHERE id = ?1 AND stateflag = '0'",
            [&current],
            |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)),
        );
        let (parent_project_id, next_parent) =
            relation.map_err(|_| "The selected parent task does not exist".to_string())?;
        if parent_project_id != project_id {
            return Err("Parent and child tasks must belong to the same project".to_string());
        }
        if next_parent.is_empty() {
            return Ok(());
        }
        current = next_parent;
    }
    Err("Task hierarchy is too deep".to_string())
}

pub fn tasks_have_active_children(db: &DbState, ids: &[String]) -> rusqlite::Result<bool> {
    let conn = db.lock_connection()?;
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
    let sql = format!(
        "SELECT COUNT(*) FROM task WHERE stateflag = '0' AND parent IN ({})",
        placeholders
    );
    let count: u64 = conn.query_row(&sql, params_from_iter(ids), |row| row.get(0))?;
    Ok(count > 0)
}

pub fn has_project_bound_relations(db: &DbState, id: &str) -> rusqlite::Result<bool> {
    db.lock_connection()?.query_row(
        "SELECT EXISTS(SELECT 1 FROM task WHERE parent = ?1 AND stateflag = '0')
         OR EXISTS(SELECT 1 FROM task_dependency WHERE predecessor_task_id = ?1 OR successor_task_id = ?1)
         OR EXISTS(SELECT 1 FROM plan_baseline WHERE task_id = ?1)",
        [id], |row| row.get(0),
    )
}

#[cfg(test)]
mod reorder_tests {
    use super::*;

    fn database() -> rusqlite::Connection {
        let conn = rusqlite::Connection::open_in_memory().unwrap();
        conn.execute_batch(
            "CREATE TABLE task (id TEXT PRIMARY KEY, project_id TEXT, parent TEXT,
             sort_order INTEGER, stateflag TEXT DEFAULT '0', update_time TEXT);
             INSERT INTO task (id, project_id, parent, sort_order) VALUES
             ('a', 'p1', '', 1), ('b', 'p1', '', 2),
             ('c', 'p2', '', 3), ('d', 'p1', 'a', 4);
             INSERT INTO task (id, project_id, parent, sort_order, stateflag)
             VALUES ('deleted', 'p1', '', 5, '1');",
        )
        .unwrap();
        conn
    }

    fn orders(conn: &rusqlite::Connection) -> Vec<i64> {
        conn.prepare("SELECT sort_order FROM task ORDER BY id")
            .unwrap()
            .query_map([], |row| row.get(0))
            .unwrap()
            .collect::<rusqlite::Result<Vec<_>>>()
            .unwrap()
    }

    #[test]
    fn swaps_siblings_in_one_transaction() {
        let mut conn = database();
        swap_task_order_connection(&mut conn, "a", "b").unwrap();
        assert_eq!(orders(&conn), vec![2, 1, 3, 4, 5]);
    }

    #[test]
    fn rejects_invalid_or_unavailable_pairs_without_writes() {
        let mut conn = database();
        let original = orders(&conn);
        for (source, target) in [
            ("a", "c"),
            ("a", "d"),
            ("a", "a"),
            ("", "b"),
            ("a", "missing"),
            ("a", "deleted"),
        ] {
            assert!(swap_task_order_connection(&mut conn, source, target).is_err());
            assert_eq!(orders(&conn), original);
        }
    }

    #[test]
    fn rolls_back_first_write_when_second_write_fails() {
        let mut conn = database();
        conn.execute_batch(
            "CREATE TRIGGER fail_second BEFORE UPDATE ON task
            WHEN OLD.id = 'b' BEGIN SELECT RAISE(ABORT, 'injected failure'); END;",
        )
        .unwrap();
        let original = orders(&conn);
        assert!(swap_task_order_connection(&mut conn, "a", "b").is_err());
        assert_eq!(orders(&conn), original);
        assert!(
            conn.is_autocommit(),
            "failed transaction must release its resources"
        );
    }
}

#[cfg(test)]
mod status_query_tests {
    use super::*;
    use std::{path::PathBuf, sync::Mutex};

    #[test]
    fn pending_includes_legacy_todo_and_overdue_excludes_finished_or_invalid_dates() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(
            "CREATE TABLE task (
            id TEXT, project_id TEXT, sort_order INTEGER, name TEXT, parent TEXT, dependence TEXT,
            start_time TEXT, end_time TEXT, type TEXT DEFAULT 'Task', priority TEXT DEFAULT '3',
            status TEXT, progress INTEGER, effort_days REAL, schedule_mode TEXT, comment TEXT,
            assignee TEXT, creator TEXT, create_time TEXT DEFAULT '', update_time TEXT DEFAULT '',
            stateflag TEXT DEFAULT '0');
            INSERT INTO task (id,name,status,end_time) VALUES
            ('pending','Pending','Pending','2000-01-01'),
            ('todo','Todo','Todo','2000-01-01'),
            ('done','Done','Done','2000-01-01'),
            ('archived','Archived','Archived','2000-01-01'),
            ('future','Future','InProgress','2999-01-01'),
            ('invalid','Invalid','InProgress','invalid'),
            ('empty','Empty','InProgress','');",
        )
        .unwrap();
        conn.execute_batch("CREATE TABLE project(id TEXT PRIMARY KEY); ALTER TABLE task ADD COLUMN status_id TEXT NOT NULL DEFAULT '';").unwrap();
        crate::common::task_status::create_schema(&conn).unwrap();
        let db = DbState(Mutex::new(conn), PathBuf::new());
        let mut query = TaskQuery {
            page_index: 1,
            page_size: 100,
            project_id: None,
            keyword: None,
            status: Some("Pending"),
            priority: None,
            assignee: None,
            sort_by: "name",
            sort_direction: "asc",
        };
        let (tasks, total) = query_tasks(&db, &query).unwrap();
        assert_eq!(total, 2);
        assert_eq!(
            tasks
                .iter()
                .map(|task| task.id.as_str())
                .collect::<Vec<_>>(),
            vec!["pending", "todo"]
        );
        query.status = Some("Overdue");
        assert_eq!(query_tasks(&db, &query).unwrap().1, 2);
        query.status = Some("Done");
        assert_eq!(query_tasks(&db, &query).unwrap().1, 1);
        query.status = Some("Done' OR 1=1 --");
        assert_eq!(query_tasks(&db, &query).unwrap().1, 0);
        query.status = None;
        assert_eq!(query_tasks(&db, &query).unwrap().1, 7);
        db.lock_connection().unwrap().execute_batch("UPDATE task SET priority=CASE id WHEN 'pending' THEN '1' WHEN 'todo' THEN 'High' WHEN 'done' THEN 'Normal' WHEN 'archived' THEN 'Low' WHEN 'future' THEN '5' WHEN 'invalid' THEN '3' ELSE 'legacy-unknown' END").unwrap();
        query.sort_by = "priority";
        let sorted = query_tasks(&db, &query).unwrap().0;
        assert_eq!(sorted.first().unwrap().id, "pending");
        assert_eq!(sorted[1].id, "todo");
        assert_eq!(sorted[4].id, "archived");
        assert_eq!(sorted[5].id, "future");
        assert_eq!(sorted.last().unwrap().id, "empty");
    }
}
