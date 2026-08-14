use crate::common::db_state::DbState;
use crate::models::task::{NewTask, Task};
use rusqlite::params_from_iter;
use rusqlite::{params, Row, Transaction};
use tauri::State;

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

pub fn insert_task(db: &State<DbState>, p: &NewTask) -> rusqlite::Result<()> {
    let mut conn = db.0.lock().unwrap();
    let transaction = conn.transaction()?;
    insert_task_transaction(&transaction, p)?;
    transaction.commit()
}

pub(crate) fn insert_task_transaction(
    transaction: &Transaction<'_>,
    p: &NewTask,
) -> rusqlite::Result<()> {
    transaction.execute(
        "INSERT INTO task (id, project_id, sort_order, name, parent, dependence, start_time, end_time, type,
        priority, status, progress, effort_days, schedule_mode, comment, assignee, creator, create_time, update_time, stateflag)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17,
         datetime('now', 'localtime'), datetime('now', 'localtime'), '0')",
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
            p.status,
            p.progress,
            p.effort_days,
            p.schedule_mode,
            p.comment,
            p.assignee,
            p.creator
        ],
    )?;
    Ok(())
}

pub fn get_all_task(
    db: &State<DbState>,
    page_index: u64,
    page_size: u64,
    project_id: Option<&str>,
) -> rusqlite::Result<(Vec<Task>, u64)> {
    let conn = db.0.lock().unwrap();

    let offset = page_index.saturating_sub(1) * page_size;

    // ---- 查询分页列表 ----
    let select_sql =
        "SELECT id, COALESCE(project_id, ''), COALESCE(sort_order, 0), name, COALESCE(parent, ''),
                COALESCE(dependence, ''), COALESCE(start_time, ''), COALESCE(end_time, ''),
                type, priority, status, COALESCE(progress, 0), COALESCE(effort_days, 0),
                COALESCE(schedule_mode, 'fixed_dates'),
                COALESCE(comment, ''), COALESCE(assignee, ''),
                COALESCE(creator, ''), create_time, update_time, stateflag
         FROM task
         WHERE stateflag = '0'";

    let list = if let Some(project_id) = project_id {
        let sql = format!(
            "{} AND project_id = ? ORDER BY sort_order ASC, create_time ASC LIMIT ? OFFSET ?",
            select_sql
        );
        let mut stmt = conn.prepare(&sql)?;
        let rows = stmt.query_map(params![project_id, page_size, offset], map_task)?;
        let tasks = rows.collect::<rusqlite::Result<Vec<_>>>()?;
        tasks
    } else {
        let sql = format!(
            "{} ORDER BY project_id, sort_order ASC, create_time ASC LIMIT ? OFFSET ?",
            select_sql
        );
        let mut stmt = conn.prepare(&sql)?;
        let rows = stmt.query_map(params![page_size, offset], map_task)?;
        let tasks = rows.collect::<rusqlite::Result<Vec<_>>>()?;
        tasks
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

pub fn query_tasks(
    db: &State<DbState>,
    query: &TaskQuery<'_>,
) -> rusqlite::Result<(Vec<Task>, u64)> {
    let conn = db.0.lock().unwrap();
    let offset = query.page_index.saturating_sub(1) * query.page_size;
    let select_sql = "SELECT id, COALESCE(project_id, ''), COALESCE(sort_order, 0), name,
        COALESCE(parent, ''), COALESCE(dependence, ''), COALESCE(start_time, ''),
        COALESCE(end_time, ''), type, priority, status, COALESCE(progress, 0),
        COALESCE(effort_days, 0), COALESCE(schedule_mode, 'fixed_dates'), COALESCE(comment, ''),
        COALESCE(assignee, ''), COALESCE(creator, ''), create_time, update_time, stateflag
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
        conditions.push("status = ?".to_string());
        values.push(status.to_string());
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
        "priority" => "priority",
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
    db: &State<DbState>,
    param_set: &Vec<String>,
    value_set: &Vec<String>,
) -> rusqlite::Result<()> {
    let conn = db.0.lock().unwrap();
    let sql = format!("UPDATE task SET {} WHERE id = ?", param_set.join(", "));
    conn.execute(&sql, params_from_iter(value_set))?;
    Ok(())
}

pub fn remove_task(db: &State<DbState>, ids: &Vec<String>) -> rusqlite::Result<()> {
    let conn: std::sync::MutexGuard<'_, rusqlite::Connection> = db.0.lock().unwrap();
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

pub fn next_sort_order(
    db: &State<DbState>,
    project_id: &str,
    parent: &str,
) -> rusqlite::Result<i64> {
    let conn = db.0.lock().unwrap();
    conn.query_row(
        "SELECT COALESCE(MAX(sort_order), 0) + 1 FROM task
         WHERE project_id = ?1 AND COALESCE(parent, '') = ?2 AND stateflag = '0'",
        params![project_id, parent],
        |row| row.get(0),
    )
}

pub fn get_task_relation(db: &State<DbState>, task_id: &str) -> rusqlite::Result<(String, String)> {
    let conn = db.0.lock().unwrap();
    conn.query_row(
        "SELECT COALESCE(project_id, ''), COALESCE(parent, '') FROM task
         WHERE id = ?1 AND stateflag = '0'",
        [task_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )
}

pub fn get_task_schedule(db: &State<DbState>, task_id: &str) -> rusqlite::Result<(String, String)> {
    let conn = db.0.lock().unwrap();
    conn.query_row(
        "SELECT COALESCE(start_time, ''), COALESCE(end_time, '') FROM task WHERE id = ?1 AND stateflag = '0'",
        [task_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )
}

pub fn get_task_assignee(db: &State<DbState>, task_id: &str) -> rusqlite::Result<String> {
    let conn = db.0.lock().unwrap();
    conn.query_row(
        "SELECT COALESCE(assignee, '') FROM task WHERE id = ?1 AND stateflag = '0'",
        [task_id],
        |row| row.get(0),
    )
}

pub fn validate_parent(
    db: &State<DbState>,
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

    let conn = db.0.lock().unwrap();
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

pub fn tasks_have_active_children(db: &State<DbState>, ids: &[String]) -> rusqlite::Result<bool> {
    let conn = db.0.lock().unwrap();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
    let sql = format!(
        "SELECT COUNT(*) FROM task WHERE stateflag = '0' AND parent IN ({})",
        placeholders
    );
    let count: u64 = conn.query_row(&sql, params_from_iter(ids), |row| row.get(0))?;
    Ok(count > 0)
}
