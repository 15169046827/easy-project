use crate::common::db_state::DbState;
use crate::models::plan_baseline::{NewPlanBaseline, PlanBaseline};
use rusqlite::params;
use tauri::State;

pub fn replace_for_project(
    db: &State<DbState>,
    project_id: &str,
    baselines: &[NewPlanBaseline],
) -> rusqlite::Result<()> {
    let mut conn = db.0.lock().unwrap();
    let tx = conn.transaction()?;
    tx.execute(
        "DELETE FROM plan_baseline WHERE project_id = ?1",
        params![project_id],
    )?;
    for baseline in baselines {
        tx.execute(
            "INSERT INTO plan_baseline
             (id, project_id, task_id, task_name, start_time, end_time, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now', 'localtime'))",
            params![
                baseline.id,
                baseline.project_id,
                baseline.task_id,
                baseline.task_name,
                baseline.start_time,
                baseline.end_time
            ],
        )?;
    }
    tx.commit()
}

pub fn get_by_project(
    db: &State<DbState>,
    project_id: &str,
) -> rusqlite::Result<Vec<PlanBaseline>> {
    let conn = db.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id, project_id, task_id, task_name, start_time, end_time, created_at
         FROM plan_baseline WHERE project_id = ?1 ORDER BY task_id",
    )?;
    let rows = stmt.query_map([project_id], |row| {
        Ok(PlanBaseline {
            id: row.get(0)?,
            project_id: row.get(1)?,
            task_id: row.get(2)?,
            task_name: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            created_at: row.get(6)?,
        })
    })?;
    let mut list = Vec::new();
    for row in rows {
        list.push(row?);
    }
    Ok(list)
}

pub fn delete_by_project(db: &State<DbState>, project_id: &str) -> rusqlite::Result<()> {
    let conn = db.0.lock().unwrap();
    conn.execute(
        "DELETE FROM plan_baseline WHERE project_id = ?1",
        params![project_id],
    )?;
    Ok(())
}
