use crate::common::db_state::DbState;
use crate::models::project_member::{
    NewProjectMember, ProjectMemberWithMember, ProjectMemberWithProject,
};
use rusqlite::params;
use tauri::State;

pub fn insert(db: &State<DbState>, m: &NewProjectMember) -> rusqlite::Result<()> {
    let conn = db.0.lock().unwrap();
    conn.execute(
        "INSERT INTO project_member (id, project_id, member_id, role, joined_at, stateflag)
         VALUES (?1, ?2, ?3, ?4, datetime('now', 'localtime'), '0')",
        params![m.id, m.project_id, m.member_id, m.role],
    )?;
    Ok(())
}

/// 判断某成员是否已在该项目中（用于去重）
pub fn exists(db: &State<DbState>, project_id: &str, member_id: &str) -> rusqlite::Result<bool> {
    let conn = db.0.lock().unwrap();
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM project_member WHERE project_id = ?1 AND member_id = ?2 AND stateflag = '0'",
        params![project_id, member_id],
        |row| row.get(0),
    )?;
    Ok(count > 0)
}

/// 按成员查询其参与的项目（含项目信息）
pub fn get_by_member(
    db: &State<DbState>,
    member_id: &str,
) -> rusqlite::Result<Vec<ProjectMemberWithProject>> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT pm.id, pm.project_id, pm.member_id, pm.role, pm.joined_at,
                p.name, p.status, p.version
         FROM project_member pm
         JOIN project p ON p.id = pm.project_id
         WHERE pm.member_id = ?1 AND pm.stateflag = '0' AND p.stateflag = '0'
         ORDER BY pm.joined_at DESC",
    )?;
    let rows = stmt.query_map([member_id], |row| {
        Ok(ProjectMemberWithProject {
            id: row.get(0)?,
            project_id: row.get(1)?,
            member_id: row.get(2)?,
            role: row.get(3)?,
            joined_at: row.get(4)?,
            project_name: row.get(5)?,
            project_status: row.get(6)?,
            project_version: row.get(7)?,
        })
    })?;
    let mut list = Vec::new();
    for row in rows {
        list.push(row?);
    }
    Ok(list)
}

/// 按项目查询其成员（含成员信息）
pub fn get_by_project(
    db: &State<DbState>,
    project_id: &str,
) -> rusqlite::Result<Vec<ProjectMemberWithMember>> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT pm.id, pm.project_id, pm.member_id, pm.role, pm.joined_at,
                m.name, m.role, m.email, m.avatar
         FROM project_member pm
         JOIN member m ON m.id = pm.member_id
         WHERE pm.project_id = ?1 AND pm.stateflag = '0' AND m.stateflag = '0'
         ORDER BY m.name",
    )?;
    let rows = stmt.query_map([project_id], |row| {
        Ok(ProjectMemberWithMember {
            id: row.get(0)?,
            project_id: row.get(1)?,
            member_id: row.get(2)?,
            role: row.get(3)?,
            joined_at: row.get(4)?,
            member_name: row.get(5)?,
            member_role: row.get(6)?,
            member_email: row.get(7)?,
            member_avatar: row.get(8)?,
        })
    })?;
    let mut list = Vec::new();
    for row in rows {
        list.push(row?);
    }
    Ok(list)
}

/// 软删除（逻辑删除）
pub fn delete(db: &State<DbState>, ids: &Vec<String>) -> rusqlite::Result<()> {
    let conn = db.0.lock().unwrap();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
    let sql = format!(
        "UPDATE project_member SET stateflag = strftime('%s', 'now') WHERE id IN ({})",
        placeholders
    );
    let value_set: Vec<&str> = ids.iter().map(|s| s.as_str()).collect();
    conn.execute(&sql, rusqlite::params_from_iter(value_set))?;
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
            SELECT 1
            FROM project_member pm
            JOIN project p ON p.id = pm.project_id AND p.stateflag = '0'
            WHERE pm.id IN ({placeholders})
              AND pm.stateflag = '0'
              AND p.owner = pm.member_id
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
            SELECT 1
            FROM project_member pm
            JOIN task t ON t.project_id = pm.project_id
                       AND t.assignee = pm.member_id
                       AND t.stateflag = '0'
            WHERE pm.id IN ({placeholders})
              AND pm.stateflag = '0'
        )"
    );
    let has_tasks: bool = conn.query_row(
        &task_sql,
        rusqlite::params_from_iter(values.iter()),
        |row| row.get(0),
    )?;

    Ok(has_tasks.then_some("task_assignee"))
}
