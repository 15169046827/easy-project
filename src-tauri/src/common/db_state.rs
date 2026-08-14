use rusqlite::Connection;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

pub struct DbState(pub Mutex<Connection>, pub PathBuf);

const CURRENT_SCHEMA_VERSION: i64 = 5;

pub fn init_db(database_path: &Path) -> Result<DbState, String> {
    let conn = Connection::open(database_path)
        .map_err(|error| format!("Failed to open database: {error}"))?;
    conn.execute_batch("PRAGMA foreign_keys = ON;")
        .map_err(|error| format!("Failed to configure database: {error}"))?;
    let existing_version: i64 = conn
        .query_row("PRAGMA user_version", [], |row| row.get(0))
        .map_err(|error| format!("Failed to read schema version: {error}"))?;
    if existing_version > CURRENT_SCHEMA_VERSION {
        return Err(format!(
            "Database schema {existing_version} is newer than this EasyProject build supports ({CURRENT_SCHEMA_VERSION})"
        ));
    }

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS project (
            id            VARCHAR(32) PRIMARY KEY,                  -- unique id of project
            name          VARCHAR(256) NOT NULL,                    -- project name
            version       VARCHAR(64) DEFAULT 'v1.0',               -- version
            type          VARCHAR(32) DEFAULT 'private',            -- private / public
            status        VARCHAR(32) DEFAULT 'InProgress',         -- project status
            owner         VARCHAR(256),                             -- owner (default = creator)
            calendar_country VARCHAR(8) DEFAULT 'CN',               -- ISO country code
            calendar_region VARCHAR(32) DEFAULT '',                 -- state / province code
            weekend_days VARCHAR(64) DEFAULT '[0,6]',               -- JSON weekday indexes
            calendar_exceptions TEXT DEFAULT '[]',                  -- JSON date overrides
            creator       VARCHAR(256),                             -- creator
            create_time   VARCHAR(64) DEFAULT CURRENT_TIMESTAMP,    -- create time
            update_time   VARCHAR(64) DEFAULT CURRENT_TIMESTAMP,    -- update time
            stateflag     VARCHAR(16) DEFAULT '0'                   -- 0: active / timestamp: terminated
        );

        CREATE TABLE IF NOT EXISTS task (
            id            VARCHAR(32) PRIMARY KEY,                  -- unique id of task
            name          VARCHAR(256) NOT NULL,                    -- task name
            parent        VARCHAR(32),                              -- parent task id
            dependence    VARCHAR(1000),                            -- dependence ids (comma separated)
            start_time    VARCHAR(64),                              -- start time
            end_time      VARCHAR(64),                              -- end time
            type          VARCHAR(32) DEFAULT 'Task',               -- Task / Milestone / File
            priority      VARCHAR(32) DEFAULT 'Normal',             -- priority level
            status        VARCHAR(32) DEFAULT 'InProgress',         -- task status
            comment       VARCHAR(2000),                            -- JSON-style comment text
            assignee      VARCHAR(256),                             -- assigned user
            creator       VARCHAR(256),                             -- creator
            create_time   VARCHAR(64) DEFAULT CURRENT_TIMESTAMP,    -- create time
            update_time   VARCHAR(64) DEFAULT CURRENT_TIMESTAMP,    -- update time
            stateflag     VARCHAR(16) DEFAULT '0'                   -- 0: active / timestamp: terminated
        );

        CREATE TABLE IF NOT EXISTS task_dependency (
            id                  VARCHAR(32) PRIMARY KEY,
            predecessor_task_id VARCHAR(32) NOT NULL,
            successor_task_id   VARCHAR(32) NOT NULL,
            dependency_type     VARCHAR(8) NOT NULL DEFAULT 'FS',
            lag_minutes         INTEGER NOT NULL DEFAULT 0,
            create_time         VARCHAR(64) DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(predecessor_task_id, successor_task_id),
            CHECK(predecessor_task_id <> successor_task_id),
            FOREIGN KEY(predecessor_task_id) REFERENCES task(id),
            FOREIGN KEY(successor_task_id) REFERENCES task(id)
        );

        CREATE TABLE IF NOT EXISTS member (
            id            VARCHAR(32) PRIMARY KEY,                  -- unique id of member
            name          VARCHAR(128) NOT NULL,                    -- member name
            email         VARCHAR(256) DEFAULT '',                  -- email address
            phone         VARCHAR(64) DEFAULT '',                   -- phone number
            role          VARCHAR(64) DEFAULT 'Developer',          -- role
            avatar        VARCHAR(512) DEFAULT '',                  -- avatar URL
            create_time   VARCHAR(64) DEFAULT CURRENT_TIMESTAMP,    -- create time
            update_time   VARCHAR(64) DEFAULT CURRENT_TIMESTAMP,    -- update time
            stateflag     VARCHAR(16) DEFAULT '0'                   -- 0: active / timestamp: terminated
        );

        CREATE TABLE IF NOT EXISTS project_member (
            id            VARCHAR(32) PRIMARY KEY,                  -- unique id of relationship
            project_id    VARCHAR(32) NOT NULL,                     -- related project id
            member_id     VARCHAR(32) NOT NULL,                     -- related member id
            role          VARCHAR(64) DEFAULT 'Member',             -- role within the project
            joined_at     VARCHAR(64) DEFAULT CURRENT_TIMESTAMP,    -- joined time
            stateflag     VARCHAR(16) DEFAULT '0'                   -- 0: active / timestamp: terminated
        );

        CREATE TABLE IF NOT EXISTS plan_baseline (
            id            VARCHAR(32) PRIMARY KEY,                  -- unique id of baseline row
            project_id    VARCHAR(32) NOT NULL,                     -- related project id
            task_id       VARCHAR(32) NOT NULL,                     -- related task id
            task_name     VARCHAR(256),                             -- snapshot of task name
            start_time    VARCHAR(64),                              -- baseline start time
            end_time      VARCHAR(64),                              -- baseline end time
            created_at    VARCHAR(64) DEFAULT CURRENT_TIMESTAMP     -- when the baseline was saved
        );
        "
    ).map_err(|error| format!("Failed to create tables: {error}"))?;

    let task_columns = {
        let mut statement = conn
            .prepare("PRAGMA table_info(task)")
            .map_err(|error| format!("Failed to inspect task table: {error}"))?;
        let columns = statement
            .query_map([], |row| row.get::<_, String>(1))
            .map_err(|error| format!("Failed to inspect task columns: {error}"))?;
        columns.filter_map(Result::ok).collect::<Vec<_>>()
    };

    if !task_columns.iter().any(|name| name == "project_id") {
        conn.execute("ALTER TABLE task ADD COLUMN project_id VARCHAR(32)", [])
            .map_err(|error| format!("Failed to migrate task table: {error}"))?;
    }

    if !task_columns.iter().any(|name| name == "sort_order") {
        conn.execute(
            "ALTER TABLE task ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0",
            [],
        )
        .map_err(|error| format!("Failed to migrate task ordering: {error}"))?;
        conn.execute(
            "UPDATE task SET sort_order = rowid WHERE sort_order = 0",
            [],
        )
        .map_err(|error| format!("Failed to initialize task ordering: {error}"))?;
    }

    if !task_columns.iter().any(|name| name == "progress") {
        conn.execute(
            "ALTER TABLE task ADD COLUMN progress INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100)",
            [],
        )
        .map_err(|error| format!("Failed to migrate task progress: {error}"))?;
    }

    if !task_columns.iter().any(|name| name == "effort_days") {
        conn.execute(
            "ALTER TABLE task ADD COLUMN effort_days REAL NOT NULL DEFAULT 0 CHECK(effort_days >= 0)",
            [],
        )
        .map_err(|error| format!("Failed to migrate task effort: {error}"))?;
    }

    if !task_columns.iter().any(|name| name == "schedule_mode") {
        conn.execute(
            "ALTER TABLE task ADD COLUMN schedule_mode VARCHAR(32) NOT NULL DEFAULT 'fixed_dates' CHECK(schedule_mode IN ('fixed_effort', 'fixed_dates'))",
            [],
        )
        .map_err(|error| format!("Failed to migrate task schedule mode: {error}"))?;
    }

    let project_columns = {
        let mut statement = conn
            .prepare("PRAGMA table_info(project)")
            .map_err(|error| format!("Failed to inspect project table: {error}"))?;
        let columns = statement
            .query_map([], |row| row.get::<_, String>(1))
            .map_err(|error| format!("Failed to inspect project columns: {error}"))?;
        columns.filter_map(Result::ok).collect::<Vec<_>>()
    };
    for (name, definition) in [
        ("calendar_country", "VARCHAR(8) DEFAULT 'CN'"),
        ("calendar_region", "VARCHAR(32) DEFAULT ''"),
        ("weekend_days", "VARCHAR(64) DEFAULT '[0,6]'"),
        ("calendar_exceptions", "TEXT DEFAULT '[]'"),
    ] {
        if !project_columns.iter().any(|column| column == name) {
            conn.execute(
                &format!("ALTER TABLE project ADD COLUMN {name} {definition}"),
                [],
            )
            .map_err(|error| format!("Failed to migrate project calendar {name}: {error}"))?;
        }
    }

    let member_columns = {
        let mut statement = conn
            .prepare("PRAGMA table_info(member)")
            .map_err(|error| format!("Failed to inspect member table: {error}"))?;
        let columns = statement
            .query_map([], |row| row.get::<_, String>(1))
            .map_err(|error| format!("Failed to inspect member columns: {error}"))?;
        columns.filter_map(Result::ok).collect::<Vec<_>>()
    };
    if !member_columns
        .iter()
        .any(|name| name == "availability_exceptions")
    {
        conn.execute(
            "ALTER TABLE member ADD COLUMN availability_exceptions TEXT NOT NULL DEFAULT '[]'",
            [],
        )
        .map_err(|error| format!("Failed to migrate member availability: {error}"))?;
    }

    conn.execute_batch(
        "CREATE INDEX IF NOT EXISTS idx_task_project_id ON task(project_id);
         CREATE INDEX IF NOT EXISTS idx_task_parent ON task(parent);
         CREATE INDEX IF NOT EXISTS idx_task_assignee ON task(assignee);
         CREATE INDEX IF NOT EXISTS idx_task_project_state ON task(project_id, stateflag);",
    )
    .map_err(|error| format!("Failed to create indexes: {error}"))?;

    conn.execute_batch(
        "CREATE INDEX IF NOT EXISTS idx_dependency_predecessor ON task_dependency(predecessor_task_id);
         CREATE INDEX IF NOT EXISTS idx_dependency_successor ON task_dependency(successor_task_id);",
    )
    .map_err(|error| format!("Failed to create dependency indexes: {error}"))?;

    conn.execute_batch(
        "CREATE INDEX IF NOT EXISTS idx_pm_project ON project_member(project_id);
         CREATE INDEX IF NOT EXISTS idx_pm_member ON project_member(member_id);",
    )
    .map_err(|error| format!("Failed to create project_member indexes: {error}"))?;

    conn.execute(
        "INSERT INTO project_member (id, project_id, member_id, role, joined_at, stateflag)
         SELECT 'PM:' || lower(hex(randomblob(9))), project.id, project.owner, 'Owner',
                datetime('now', 'localtime'), '0'
         FROM project
         JOIN member ON member.id = project.owner AND member.stateflag = '0'
         WHERE project.stateflag = '0'
           AND project.owner IS NOT NULL
           AND trim(project.owner) <> ''
           AND NOT EXISTS (
               SELECT 1 FROM project_member
               WHERE project_member.project_id = project.id
                 AND project_member.member_id = project.owner
                 AND project_member.stateflag = '0'
           )",
        [],
    )
    .map_err(|error| format!("Failed to backfill project owners into teams: {error}"))?;

    conn.execute(
        "INSERT INTO project_member (id, project_id, member_id, role, joined_at, stateflag)
         SELECT 'PM:' || lower(hex(randomblob(9))), task.project_id, task.assignee, 'Member',
                datetime('now', 'localtime'), '0'
         FROM task
         JOIN project ON project.id = task.project_id AND project.stateflag = '0'
         JOIN member ON member.id = task.assignee AND member.stateflag = '0'
         WHERE task.stateflag = '0'
           AND trim(COALESCE(task.assignee, '')) <> ''
           AND NOT EXISTS (
               SELECT 1 FROM project_member
               WHERE project_member.project_id = task.project_id
                 AND project_member.member_id = task.assignee
                 AND project_member.stateflag = '0'
           )",
        [],
    )
    .map_err(|error| format!("Failed to backfill task assignees into teams: {error}"))?;

    conn.execute_batch(
        "CREATE INDEX IF NOT EXISTS idx_baseline_project ON plan_baseline(project_id);",
    )
    .map_err(|error| format!("Failed to create plan_baseline indexes: {error}"))?;

    conn.pragma_update(None, "user_version", CURRENT_SCHEMA_VERSION)
        .map_err(|error| format!("Failed to record schema version: {error}"))?;

    Ok(DbState(Mutex::new(conn), database_path.to_path_buf()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn initializes_mvp_schema_and_constraints() {
        let path = std::env::temp_dir().join(format!("easy-project-{}.db", Uuid::new_v4()));
        let state = init_db(&path).expect("database should initialize");
        let conn = state.0.lock().expect("database lock");
        let progress_exists: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM pragma_table_info('task') WHERE name = 'progress'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        let dependency_exists: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'task_dependency'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        let effort_exists: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM pragma_table_info('task') WHERE name = 'effort_days'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        let calendar_exists: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM pragma_table_info('project') WHERE name = 'calendar_country'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        let schedule_mode_exists: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM pragma_table_info('task') WHERE name = 'schedule_mode'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        let member_availability_exists: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM pragma_table_info('member') WHERE name = 'availability_exceptions'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        let foreign_keys: i64 = conn
            .query_row("PRAGMA foreign_keys", [], |row| row.get(0))
            .unwrap();
        let schema_version: i64 = conn
            .query_row("PRAGMA user_version", [], |row| row.get(0))
            .unwrap();
        assert_eq!(progress_exists, 1);
        assert_eq!(dependency_exists, 1);
        assert_eq!(effort_exists, 1);
        assert_eq!(calendar_exists, 1);
        assert_eq!(schedule_mode_exists, 1);
        assert_eq!(member_availability_exists, 1);
        assert_eq!(foreign_keys, 1);
        assert_eq!(schema_version, CURRENT_SCHEMA_VERSION);
        drop(conn);
        drop(state);
        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn persists_project_task_and_dependency_graph_across_reopen() {
        let path =
            std::env::temp_dir().join(format!("easy-project-integration-{}.db", Uuid::new_v4()));
        let state = init_db(&path).expect("database should initialize");
        {
            let conn = state.0.lock().expect("database lock");
            conn.execute(
                "INSERT INTO project (id, name) VALUES (?1, ?2)",
                ["project-1", "Integration project"],
            )
            .expect("project should be inserted");
            conn.execute(
                "INSERT INTO task (id, project_id, sort_order, name, parent, progress)
                 VALUES (?1, ?2, 1, ?3, '', 25)",
                ["task-1", "project-1", "Plan"],
            )
            .expect("predecessor should be inserted");
            conn.execute(
                "INSERT INTO task (id, project_id, sort_order, name, parent, progress)
                 VALUES (?1, ?2, 2, ?3, '', 0)",
                ["task-2", "project-1", "Build"],
            )
            .expect("successor should be inserted");
            conn.execute(
                "INSERT INTO task_dependency
                 (id, predecessor_task_id, successor_task_id, dependency_type, lag_minutes)
                 VALUES ('dep-1', 'task-1', 'task-2', 'FS', 1440)",
                [],
            )
            .expect("dependency should be inserted");

            let self_dependency = conn.execute(
                "INSERT INTO task_dependency
                 (id, predecessor_task_id, successor_task_id)
                 VALUES ('dep-self', 'task-1', 'task-1')",
                [],
            );
            assert!(self_dependency.is_err(), "self dependency must be rejected");

            let duplicate_dependency = conn.execute(
                "INSERT INTO task_dependency
                 (id, predecessor_task_id, successor_task_id)
                 VALUES ('dep-duplicate', 'task-1', 'task-2')",
                [],
            );
            assert!(
                duplicate_dependency.is_err(),
                "duplicate dependency must be rejected"
            );
        }
        drop(state);

        let reopened = init_db(&path).expect("database should reopen");
        let conn = reopened.0.lock().expect("database lock after reopen");
        let persisted: (String, String, String, i64) = conn
            .query_row(
                "SELECT project.name, predecessor.name, successor.name, dependency.lag_minutes
                 FROM task_dependency dependency
                 JOIN task predecessor ON predecessor.id = dependency.predecessor_task_id
                 JOIN task successor ON successor.id = dependency.successor_task_id
                 JOIN project ON project.id = successor.project_id
                 WHERE dependency.id = 'dep-1'",
                [],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
            )
            .expect("project task graph should persist");
        assert_eq!(
            persisted,
            (
                "Integration project".to_string(),
                "Plan".to_string(),
                "Build".to_string(),
                1440
            )
        );
        drop(conn);
        drop(reopened);
        let _ = std::fs::remove_file(path);
    }

    #[test]
    fn backfills_existing_project_owner_into_team_on_reopen() {
        let path = std::env::temp_dir().join(format!("easy-project-owner-{}.db", Uuid::new_v4()));
        let state = init_db(&path).expect("database should initialize");
        {
            let conn = state.0.lock().expect("database lock");
            conn.execute(
                "INSERT INTO member (id, name) VALUES ('member-1', 'Alice')",
                [],
            )
            .expect("member should insert");
            conn.execute(
                "INSERT INTO project (id, name, owner) VALUES ('project-1', 'Release', 'member-1')",
                [],
            )
            .expect("legacy project should insert");
        }
        drop(state);

        let reopened = init_db(&path).expect("database should reopen");
        let conn = reopened.0.lock().expect("database lock after reopen");
        let membership: (String, String) = conn
            .query_row(
                "SELECT member_id, role FROM project_member
                 WHERE project_id = 'project-1' AND stateflag = '0'",
                [],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .expect("owner membership should be backfilled");
        assert_eq!(membership, ("member-1".to_string(), "Owner".to_string()));
        drop(conn);
        drop(reopened);
        let _ = std::fs::remove_file(path);
    }
}
