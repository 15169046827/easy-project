use crate::common::db_state::DbState;
use crate::models::project::{NewProject, Project};
use rusqlite::params_from_iter;
use rusqlite::{params, Transaction};
use tauri::State;

fn ensure_owner_membership(
    transaction: &Transaction<'_>,
    relationship_id: &str,
    project_id: &str,
    member_id: &str,
) -> rusqlite::Result<()> {
    transaction.execute(
        "INSERT INTO project_member (id, project_id, member_id, role, joined_at, stateflag)
         SELECT ?1, ?2, ?3, 'Owner', datetime('now', 'localtime'), '0'
         WHERE NOT EXISTS (
             SELECT 1 FROM project_member
             WHERE project_id = ?2 AND member_id = ?3 AND stateflag = '0'
         )",
        params![relationship_id, project_id, member_id],
    )?;
    Ok(())
}

pub fn insert_project(
    db: &State<DbState>,
    p: &NewProject,
    owner_membership_id: Option<&str>,
) -> rusqlite::Result<()> {
    let mut conn = db.0.lock().unwrap();
    let transaction = conn.transaction()?;
    insert_project_transaction(&transaction, p, owner_membership_id)?;
    transaction.commit()?;
    Ok(())
}

pub(crate) fn insert_project_transaction(
    transaction: &Transaction<'_>,
    p: &NewProject,
    owner_membership_id: Option<&str>,
) -> rusqlite::Result<()> {
    transaction.execute(
        "INSERT INTO project (id, name, version, type, status, owner, calendar_country,
         calendar_region, weekend_days, calendar_exceptions, creator, create_time, update_time, stateflag)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11,
         datetime('now', 'localtime'), datetime('now', 'localtime'), '0')",
        params![
            p.id,
            p.name,
            p.version,
            p.r#type,
            p.status,
            p.owner,
            p.calendar_country,
            p.calendar_region,
            p.weekend_days,
            p.calendar_exceptions,
            p.creator
        ],
    )?;
    if let Some(relationship_id) = owner_membership_id {
        ensure_owner_membership(transaction, relationship_id, &p.id, &p.owner)?;
    }
    Ok(())
}

pub fn get_all_project(
    db: &State<DbState>,
    page_index: u64,
    page_size: u64,
) -> rusqlite::Result<(Vec<Project>, u64)> {
    let conn = db.0.lock().unwrap();
    let offset = (page_index - 1) * page_size;
    let mut stmt = conn.prepare(
        "SELECT id, name, version, type, status, COALESCE(owner, ''),
         COALESCE(calendar_country, 'CN'), COALESCE(calendar_region, ''),
         COALESCE(weekend_days, '[0,6]'), COALESCE(calendar_exceptions, '[]'),
         COALESCE(creator, ''), create_time, update_time, stateflag FROM project
         WHERE stateflag = '0'
         ORDER BY create_time desc
         LIMIT ? OFFSET ?",
    )?;
    let rows = stmt.query_map([page_size, offset], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            version: row.get(2)?,
            r#type: row.get(3)?,
            status: row.get(4)?,
            owner: row.get(5)?,
            calendar_country: row.get(6)?,
            calendar_region: row.get(7)?,
            weekend_days: row.get(8)?,
            calendar_exceptions: row.get(9)?,
            creator: row.get(10)?,
            create_time: row.get(11)?,
            update_time: row.get(12)?,
            stateflag: row.get(13)?,
        })
    })?;

    let mut list = Vec::new();
    for row in rows {
        list.push(row?);
    }

    let total: u64 = conn.query_row(
        "SELECT COUNT(*) FROM project WHERE stateflag = '0'",
        [],
        |row| row.get(0),
    )?;

    Ok((list, total))
}

pub fn update_project(
    db: &State<DbState>,
    param_set: &Vec<String>,
    value_set: &Vec<String>,
    owner_membership: Option<(&str, &str)>,
) -> rusqlite::Result<()> {
    let mut conn = db.0.lock().unwrap();
    let transaction = conn.transaction()?;
    update_project_transaction(&transaction, param_set, value_set, owner_membership)?;
    transaction.commit()?;
    Ok(())
}

fn update_project_transaction(
    transaction: &Transaction<'_>,
    param_set: &[String],
    value_set: &[String],
    owner_membership: Option<(&str, &str)>,
) -> rusqlite::Result<()> {
    let sql = format!("UPDATE project SET {} WHERE id = ?", param_set.join(", "));
    transaction.execute(&sql, params_from_iter(value_set))?;
    if let Some((relationship_id, member_id)) = owner_membership {
        let project_id = value_set.last().map(String::as_str).unwrap_or_default();
        ensure_owner_membership(transaction, relationship_id, project_id, member_id)?;
    }
    Ok(())
}

pub fn remove_project(db: &State<DbState>, ids: &Vec<String>) -> rusqlite::Result<()> {
    let conn: std::sync::MutexGuard<'_, rusqlite::Connection> = db.0.lock().unwrap();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
    let sql = format!(
        "UPDATE project SET stateflag = strftime('%s', 'now') where id in ({})",
        placeholders
    );
    let value_set: Vec<&str> = ids.iter().map(|s| s.as_str()).collect();
    conn.execute(&sql, params_from_iter(value_set))?;
    Ok(())
}

pub fn project_exists(db: &State<DbState>, id: &str) -> rusqlite::Result<bool> {
    let conn = db.0.lock().unwrap();
    let count: u64 = conn.query_row(
        "SELECT COUNT(*) FROM project WHERE id = ?1 AND stateflag = '0'",
        [id],
        |row| row.get(0),
    )?;
    Ok(count > 0)
}

pub fn projects_have_active_tasks(db: &State<DbState>, ids: &[String]) -> rusqlite::Result<bool> {
    let conn = db.0.lock().unwrap();
    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
    let sql = format!(
        "SELECT COUNT(*) FROM task WHERE stateflag = '0' AND project_id IN ({})",
        placeholders
    );
    let count: u64 = conn.query_row(&sql, params_from_iter(ids), |row| row.get(0))?;
    Ok(count > 0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;

    fn project(owner: &str) -> NewProject {
        NewProject {
            id: "project-1".to_string(),
            name: "Release".to_string(),
            version: "v1.0".to_string(),
            r#type: "private".to_string(),
            status: "InProgress".to_string(),
            owner: owner.to_string(),
            calendar_country: "CN".to_string(),
            calendar_region: String::new(),
            weekend_days: "[0,6]".to_string(),
            calendar_exceptions: "[]".to_string(),
            creator: "System".to_string(),
        }
    }

    #[test]
    fn owner_is_added_to_team_and_previous_owner_is_retained() {
        let mut connection = Connection::open_in_memory().expect("database should open");
        connection
            .execute_batch(
                "CREATE TABLE project (
                    id TEXT PRIMARY KEY, name TEXT, version TEXT, type TEXT, status TEXT,
                    owner TEXT, calendar_country TEXT, calendar_region TEXT, weekend_days TEXT,
                    calendar_exceptions TEXT, creator TEXT, create_time TEXT, update_time TEXT,
                    stateflag TEXT
                );
                CREATE TABLE project_member (
                    id TEXT PRIMARY KEY, project_id TEXT, member_id TEXT, role TEXT,
                    joined_at TEXT, stateflag TEXT
                );",
            )
            .expect("schema should initialize");

        let transaction = connection.transaction().expect("transaction should start");
        insert_project_transaction(&transaction, &project("member-1"), Some("pm-1"))
            .expect("project and owner membership should insert");
        transaction.commit().expect("insert should commit");

        let params = vec![
            "owner = ?".to_string(),
            "update_time = datetime('now', 'localtime')".to_string(),
        ];
        let values = vec!["member-2".to_string(), "project-1".to_string()];
        let transaction = connection.transaction().expect("transaction should start");
        update_project_transaction(&transaction, &params, &values, Some(("pm-2", "member-2")))
            .expect("new owner should join the team");
        transaction.commit().expect("update should commit");

        let owner: String = connection
            .query_row(
                "SELECT owner FROM project WHERE id = 'project-1'",
                [],
                |row| row.get(0),
            )
            .expect("owner should be available");
        let member_count: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM project_member
                 WHERE project_id = 'project-1' AND stateflag = '0'",
                [],
                |row| row.get(0),
            )
            .expect("memberships should be available");

        assert_eq!(owner, "member-2");
        assert_eq!(
            member_count, 2,
            "changing owners must not remove the previous owner"
        );
    }
}
