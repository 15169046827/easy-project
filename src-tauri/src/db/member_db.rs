use crate::common::db_state::DbState;
use crate::models::member::{Member, NewMember};
use rusqlite::params;
use rusqlite::params_from_iter;
use tauri::State;

pub fn insert_member(db: &State<DbState>, m: &NewMember) -> rusqlite::Result<()> {
    let conn = db.0.lock().unwrap();
    conn.execute(
        "INSERT INTO member (id, name, email, phone, role, avatar, availability_exceptions, create_time, update_time, stateflag)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, datetime('now', 'localtime'), datetime('now', 'localtime'), '0')",
        params![m.id, m.name, m.email, m.phone, m.role, m.avatar, m.availability_exceptions],
    )?;
    Ok(())
}

pub fn get_all_member(
    db: &State<DbState>,
    page_index: u64,
    page_size: u64,
) -> rusqlite::Result<(Vec<Member>, u64)> {
    let conn = db.0.lock().unwrap();
    let offset = (page_index - 1) * page_size;
    let mut stmt = conn.prepare(
        "SELECT id, name, email, phone, role, avatar, COALESCE(availability_exceptions, '[]'), create_time, update_time, stateflag FROM member
         WHERE stateflag = '0'
         ORDER BY create_time DESC
         LIMIT ? OFFSET ?",
    )?;
    let rows = stmt.query_map([page_size, offset], |row| {
        Ok(Member {
            id: row.get(0)?,
            name: row.get(1)?,
            email: row.get(2)?,
            phone: row.get(3)?,
            role: row.get(4)?,
            avatar: row.get(5)?,
            availability_exceptions: row.get(6)?,
            create_time: row.get(7)?,
            update_time: row.get(8)?,
            stateflag: row.get(9)?,
        })
    })?;

    let mut list = Vec::new();
    for row in rows {
        list.push(row?);
    }

    let total: u64 = conn.query_row(
        "SELECT COUNT(*) FROM member WHERE stateflag = '0'",
        [],
        |row| row.get(0),
    )?;

    Ok((list, total))
}

pub fn update_member(
    db: &State<DbState>,
    param_set: &Vec<String>,
    value_set: &Vec<String>,
) -> rusqlite::Result<()> {
    let conn = db.0.lock().unwrap();
    let sql = format!("UPDATE member SET {} WHERE id = ?", param_set.join(", "));
    conn.execute(&sql, params_from_iter(value_set))?;
    Ok(())
}

pub fn remove_member(db: &State<DbState>, ids: &Vec<String>) -> rusqlite::Result<()> {
    let conn = db.0.lock().unwrap();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
    let sql = format!(
        "UPDATE member SET stateflag = strftime('%s', 'now') WHERE id IN ({})",
        placeholders
    );
    let value_set: Vec<&str> = ids.iter().map(|s| s.as_str()).collect();
    conn.execute(&sql, params_from_iter(value_set))?;
    Ok(())
}

pub fn removal_blocker(
    db: &State<DbState>,
    ids: &[String],
) -> rusqlite::Result<Option<&'static str>> {
    if ids.is_empty() {
        return Ok(None);
    }

    let conn = db.0.lock().unwrap();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
    let values: Vec<&str> = ids.iter().map(String::as_str).collect();

    let owner_sql = format!(
        "SELECT EXISTS(
            SELECT 1 FROM project
            WHERE owner IN ({placeholders}) AND stateflag = '0'
        )"
    );
    let is_owner: bool = conn.query_row(
        &owner_sql,
        rusqlite::params_from_iter(values.iter()),
        |row| row.get(0),
    )?;
    if is_owner {
        return Ok(Some("project_owner"));
    }

    let task_sql = format!(
        "SELECT EXISTS(
            SELECT 1 FROM task
            WHERE assignee IN ({placeholders}) AND stateflag = '0'
        )"
    );
    let has_tasks: bool = conn.query_row(
        &task_sql,
        rusqlite::params_from_iter(values.iter()),
        |row| row.get(0),
    )?;
    if has_tasks {
        return Ok(Some("task_assignee"));
    }

    let membership_sql = format!(
        "SELECT EXISTS(
            SELECT 1 FROM project_member
            WHERE member_id IN ({placeholders}) AND stateflag = '0'
        )"
    );
    let has_memberships: bool = conn.query_row(
        &membership_sql,
        rusqlite::params_from_iter(values.iter()),
        |row| row.get(0),
    )?;

    Ok(has_memberships.then_some("project_member"))
}

pub fn member_exists(db: &State<DbState>, id: &str) -> rusqlite::Result<bool> {
    let conn = db.0.lock().unwrap();
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM member WHERE id = ?1 AND stateflag = '0'",
        [id],
        |row| row.get(0),
    )?;
    Ok(count > 0)
}

pub fn search_members(db: &State<DbState>, query: &str) -> rusqlite::Result<Vec<Member>> {
    let conn = db.0.lock().unwrap();
    let pattern = format!("%{}%", query);
    let mut stmt = conn.prepare(
        "SELECT id, name, email, phone, role, avatar, COALESCE(availability_exceptions, '[]'), create_time, update_time, stateflag FROM member
         WHERE stateflag = '0'
         AND (name LIKE ?1 OR email LIKE ?1 OR role LIKE ?1)
         ORDER BY name
         LIMIT 50",
    )?;
    let rows = stmt.query_map([&pattern], |row| {
        Ok(Member {
            id: row.get(0)?,
            name: row.get(1)?,
            email: row.get(2)?,
            phone: row.get(3)?,
            role: row.get(4)?,
            avatar: row.get(5)?,
            availability_exceptions: row.get(6)?,
            create_time: row.get(7)?,
            update_time: row.get(8)?,
            stateflag: row.get(9)?,
        })
    })?;

    let mut list = Vec::new();
    for row in rows {
        list.push(row?);
    }
    Ok(list)
}
