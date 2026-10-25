use super::*;
use crate::services::entity_api;
use serde_json::{json, Value};

struct Fixture {
    directory: PathBuf,
    db: DbState,
}

#[test]
fn estimate_provenance_and_parent_rollups_are_consistent_over_mcp() {
    let f = Fixture::new();
    let project = f
        .call(
            "easyproject_project_create",
            json!({"data":{"name":"Estimate fixture"}}),
        )
        .unwrap()["record"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let parent = f
        .call(
            "easyproject_task_create",
            json!({"data":{"name":"Goal","project_id":project}}),
        )
        .unwrap()["record"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_eq!(
        entity_api::get(&f.db, "task", &parent).unwrap()["effort_state"],
        "unestimated"
    );
    let child = f.call("easyproject_task_create", json!({"data":{"name":"Execution","project_id":project,"parent":parent,"effort_days":0}})).unwrap()["record"]["id"].as_str().unwrap().to_owned();
    assert_eq!(
        entity_api::get(&f.db, "task", &child).unwrap()["effort_state"],
        "estimated"
    );
    assert!(f
        .call(
            "easyproject_task_update",
            json!({"id":parent,"changes":{"progress":20}})
        )
        .unwrap_err()
        .contains("derived"));
    f.call(
        "easyproject_task_update",
        json!({"id":child,"changes":{"effort_days":2,"progress":35}}),
    )
    .unwrap();
    let record = entity_api::get(&f.db, "task", &parent).unwrap();
    assert_eq!(record["effort_days"], 2.0);
    assert_eq!(record["summary"]["progress"], 35.0);
    assert_eq!(record["is_completed"], false);
    let page = f
        .call(
            "easyproject_task_list",
            json!({"hierarchy":true,"pageSize":1}),
        )
        .unwrap();
    assert_eq!(page["total"], 1);
    assert_eq!(page["list"].as_array().unwrap().len(), 2);
    assert!(f
        .call(
            "easyproject_task_update",
            json!({"id":child,"changes":{"effort_state":"legacy_unknown"}})
        )
        .is_err());
    f.call(
        "easyproject_task_update",
        json!({"id":child,"changes":{"effort_state":"unestimated"}}),
    )
    .unwrap();
    assert_eq!(
        entity_api::get(&f.db, "task", &child).unwrap()["effort_days"],
        0.0
    );
}

#[test]
fn rejects_unknown_dictionary_values_and_localized_status_duplicates() {
    let f = Fixture::new();
    let project = f
        .call(
            "easyproject_project_create",
            json!({"data":{"name":"Dictionary checks"}}),
        )
        .unwrap();
    let pid = &project["record"]["id"];
    for (model, field) in [
        ("project", "status"),
        ("project", "type"),
        ("task", "priority"),
        ("task", "type"),
        ("task", "schedule_mode"),
    ] {
        let mut data = json!({"name":"Invalid", "project_id":pid});
        if model == "project" {
            data.as_object_mut().unwrap().remove("project_id");
        }
        data[field] = json!("outside-dictionary");
        assert!(f
            .call(&format!("easyproject_{model}_create"), json!({"data":data}))
            .is_err());
    }
    for name in ["Done", "已完成", " done ", "待办", "进行中", "in progress"] {
        assert!(f
            .call(
                "easyproject_task_status_create",
                json!({"data":{"project_id":pid,"name":name}})
            )
            .is_err());
    }
    let state = f
        .call(
            "easyproject_task_status_create",
            json!({"data":{"project_id":pid,"name":"Review"}}),
        )
        .unwrap();
    assert!(f
        .call(
            "easyproject_task_status_update",
            json!({"id":state["record"]["id"],"changes":{"name":"已完成"}})
        )
        .is_err());
    assert!(f
        .call(
            "easyproject_task_status_create",
            json!({"data":{"project_id":pid,"name":"review"}})
        )
        .is_err());
    assert!(crate::services::entity_api::dispatch(
        &f.db,
        "task",
        "update",
        json!({"id":"missing","priority":"urgent"})
    )
    .is_err());
    let other = f
        .call(
            "easyproject_project_create",
            json!({"data":{"name":"Other"}}),
        )
        .unwrap();
    assert!(f
        .call(
            "easyproject_task_status_create",
            json!({"data":{"project_id":other["record"]["id"],"name":"Review"}})
        )
        .is_ok());
}

#[test]
fn finite_large_estimates_have_stable_means_and_aggregate_overflow_rolls_back() {
    let f = Fixture::new();
    let project = f
        .call(
            "easyproject_project_create",
            json!({"data":{"name":"Large estimate fixture"}}),
        )
        .unwrap()["record"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let parent = f
        .call(
            "easyproject_task_create",
            json!({"data":{"project_id":project,"name":"Goal"}}),
        )
        .unwrap()["record"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    f.call("easyproject_task_create",json!({"data":{"project_id":project,"name":"Large finite","parent":parent,"effort_days":1e308,"progress":100}})).unwrap();
    assert_eq!(
        entity_api::get(&f.db, "task", &parent).unwrap()["summary"]["progress"],
        100.0
    );
    assert!(f.call("easyproject_task_create",json!({"data":{"project_id":project,"name":"Would overflow","parent":parent,"effort_days":1e308}})).is_err());
    let count: i64 =
        f.db.lock_connection()
            .unwrap()
            .query_row("SELECT count(*) FROM task", [], |r| r.get(0))
            .unwrap();
    assert_eq!(count, 2);
    assert_eq!(
        entity_api::get(&f.db, "task", &parent).unwrap()["summary"]["effort_days"],
        1e308
    );
}
impl Fixture {
    fn new() -> Self {
        let directory =
            std::env::temp_dir().join(format!("easyproject-mcp-test-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&directory).unwrap();
        let db = crate::common::db_state::init_db(&directory.join("workspace.db")).unwrap();
        Self { directory, db }
    }
    fn call(&self, name: &str, mut args: Value) -> Result<Value, String> {
        // Legacy scenario fixtures explicitly resolve the new project-owned state reference.
        // Strict missing/foreign-reference tests call tools::call directly below.
        if name == "easyproject_task_create" || name == "easyproject_task_update" {
            let field = if name.ends_with("create") {
                "data"
            } else {
                "changes"
            };
            let project = args[field]["project_id"]
                .as_str()
                .map(str::to_owned)
                .or_else(|| {
                    args["id"]
                        .as_str()
                        .and_then(|id| entity_api::get(&self.db, "task", id).ok())
                        .and_then(|v| v["project_id"].as_str().map(str::to_owned))
                });
            let legacy = args[field]["status"].as_str().map(str::to_owned);
            if args[field].get("status_id").is_none()
                && (field == "data" || legacy.is_some() || args[field].get("project_id").is_some())
            {
                if let Some(project) = project {
                    let connection = self.db.lock_connection().unwrap();
                    if let Ok(state) = crate::common::task_status::resolve_builtin_or_id(
                        &connection,
                        &project,
                        legacy.as_deref().unwrap_or("Pending"),
                    ) {
                        args[field]["status_id"] = json!(state.id);
                        args[field].as_object_mut().unwrap().remove("status");
                    }
                }
            }
        }
        tools::call(
            &self.db,
            Permissions {
                write: true,
                delete: true,
            },
            name,
            args,
        )
    }
}
impl Drop for Fixture {
    fn drop(&mut self) {
        // Release SQLite handles before deleting this uniquely generated fixture on Windows.
        let connection = std::mem::replace(
            &mut self.db.0,
            Mutex::new(Connection::open_in_memory().unwrap()),
        );
        drop(connection);
        let _ = std::fs::remove_dir_all(&self.directory);
    }
}

#[test]
fn status_dictionary_enforces_project_references_and_blocks_in_use_deletion() {
    let f = Fixture::new();
    let p = f
        .call("easyproject_project_create", json!({"data":{"name":"P"}}))
        .unwrap()["record"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let q = f
        .call("easyproject_project_create", json!({"data":{"name":"Q"}}))
        .unwrap()["record"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let s = f
        .call(
            "easyproject_task_status_create",
            json!({"data":{"project_id":p,"name":"Waiting","is_completed":false}}),
        )
        .unwrap()["record"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let permissions = Permissions {
        write: true,
        delete: true,
    };
    for data in [
        json!({"name":"Missing","project_id":p}),
        json!({"name":"Foreign","project_id":q,"status_id":s}),
        json!({"name":"Text","project_id":p,"status_id":"Waiting"}),
    ] {
        assert!(tools::call(
            &f.db,
            permissions,
            "easyproject_task_create",
            json!({"data":data})
        )
        .is_err());
    }
    let t = f
        .call(
            "easyproject_task_create",
            json!({"data":{"name":"Conflict task","project_id":p,"status_id":s}}),
        )
        .unwrap()["record"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let usage = f
        .call("easyproject_task_status_get", json!({"id":s}))
        .unwrap();
    assert_eq!(usage["usage"]["list"][0]["id"], t);
    assert!(f
        .call(
            "easyproject_task_status_delete",
            json!({"id":s,"confirm_name":"Waiting"})
        )
        .unwrap_err()
        .contains("Deletion blocked"));
    f.call(
        "easyproject_task_status_update",
        json!({"id":s,"changes":{"name":"Accepted","is_completed":true}}),
    )
    .unwrap();
    let task = f.call("easyproject_task_get", json!({"id":t})).unwrap();
    assert_eq!(task["record"]["status_id"], s);
    assert_eq!(task["record"]["status"], "Accepted");
    assert_eq!(task["record"]["progress"], 100);
    assert_eq!(task["record"]["is_completed"], true);
    let unused = f
        .call(
            "easyproject_task_status_create",
            json!({"data":{"project_id":p,"name":"Unused"}}),
        )
        .unwrap()["record"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    assert!(f
        .call(
            "easyproject_task_status_delete",
            json!({"id":unused,"confirm_name":"Incorrect"})
        )
        .is_err());
    f.call(
        "easyproject_task_status_delete",
        json!({"id":unused,"confirm_name":"Unused"}),
    )
    .unwrap();
    assert!(f
        .call("easyproject_task_status_get", json!({"id":unused}))
        .is_err());
}

#[test]
fn entity_crud_round_trip_preserves_rules_and_recovery_points() {
    let f = Fixture::new();
    let member = f
        .call(
            "easyproject_member_create",
            json!({"data":{"name":"Owner","email":"private@example.test"}}),
        )
        .unwrap();
    let member_id = member["record"]["id"].as_str().unwrap();
    let project = f
        .call(
            "easyproject_project_create",
            json!({"data":{"name":"Project","owner":member_id}}),
        )
        .unwrap();
    let project_id = project["record"]["id"].as_str().unwrap();
    let task = f
        .call(
            "easyproject_task_create",
            json!({"data":{"name":"Task","project_id":project_id,"assignee":member_id}}),
        )
        .unwrap();
    let task_id = task["record"]["id"].as_str().unwrap();
    for (model, id, name) in [
        ("project", project_id, "Project"),
        ("task", task_id, "Task"),
        ("member", member_id, "Owner"),
    ] {
        let list = f
            .call(&format!("easyproject_{model}_list"), json!({}))
            .unwrap();
        assert_eq!(list["total"], 1);
        let get = f
            .call(&format!("easyproject_{model}_get"), json!({"id":id}))
            .unwrap();
        assert_eq!(get["record"]["name"], name);
        let updated = f
            .call(
                &format!("easyproject_{model}_update"),
                json!({"id":id,"changes":{"name":format!("{name} edited")}}),
            )
            .unwrap();
        assert_eq!(updated["record"]["name"], format!("{name} edited"));
    }
    assert!(f
        .call(
            "easyproject_project_delete",
            json!({"id":project_id,"confirm_name":"Project edited"})
        )
        .is_err());
    assert!(f
        .call(
            "easyproject_member_delete",
            json!({"id":member_id,"confirm_name":"Owner edited"})
        )
        .is_err());
    let done = f
        .call(
            "easyproject_task_update",
            json!({"id":task_id,"changes":{"status":"Done","progress":7}}),
        )
        .unwrap();
    assert_eq!(done["record"]["progress"], 100);
    let still_done = f
        .call(
            "easyproject_task_update",
            json!({"id":task_id,"changes":{"progress":30}}),
        )
        .unwrap();
    assert_eq!(still_done["record"]["progress"], 100);
    assert!(f
        .call(
            "easyproject_task_delete",
            json!({"id":task_id,"confirm_name":"wrong"})
        )
        .is_err());
    for (model, id, name) in [
        ("task", task_id, "Task edited"),
        ("project", project_id, "Project edited"),
    ] {
        f.call(
            &format!("easyproject_{model}_delete"),
            json!({"id":id,"confirm_name":name}),
        )
        .unwrap();
        assert!(entity_api::get(&f.db, model, id).is_err());
    }
    let memberships = f
        .call(
            "easyproject_project_member_list",
            json!({"projectId":project_id}),
        )
        .unwrap();
    let membership_id = &memberships["list"][0]["id"];
    f.call(
        "easyproject_project_member_delete",
        json!({"id":membership_id,"confirm_member_name":"Owner edited"}),
    )
    .unwrap();
    f.call(
        "easyproject_member_delete",
        json!({"id":member_id,"confirm_name":"Owner edited"}),
    )
    .unwrap();
    assert!(entity_api::get(&f.db, "member", member_id).is_err());
    let audit = std::fs::read_to_string(f.directory.join("mcp-audit.jsonl")).unwrap();
    assert!(!audit.contains("private@example.test"));
    assert!(!audit.contains("Project edited"));
    assert!(audit.contains("committed"));
    let backups = std::fs::read_dir(f.directory.join("backups"))
        .unwrap()
        .collect::<Vec<_>>();
    assert!(backups.len() >= 12);
    for backup in backups {
        let connection =
            Connection::open_with_flags(backup.unwrap().path(), OpenFlags::SQLITE_OPEN_READ_ONLY)
                .unwrap();
        let integrity: String = connection
            .query_row("PRAGMA integrity_check", [], |row| row.get(0))
            .unwrap();
        assert_eq!(integrity, "ok");
    }
}

#[test]
fn disabled_and_invalid_calls_have_no_side_effects() {
    let f = Fixture::new();
    assert_eq!(tools::catalog(Permissions::default()).len(), 9);
    assert_eq!(
        tools::catalog(Permissions {
            write: true,
            delete: false
        })
        .len(),
        18
    );
    assert_eq!(
        tools::catalog(Permissions {
            write: true,
            delete: true
        })
        .len(),
        23
    );
    assert!(tools::call(
        &f.db,
        Permissions::default(),
        "easyproject_member_create",
        json!({"data":{"name":"No"}})
    )
    .is_err());
    for args in [
        json!({"data":{"name":" "}}),
        json!({"data":{"name":"No","email":42}}),
        json!({"data":{"name":"No","stateflag":"0"}}),
    ] {
        assert!(f.call("easyproject_member_create", args).is_err());
    }
    assert!(f
        .call(
            "easyproject_task_create",
            json!({"data":{"name":"No","project_id":"missing","progress":101}})
        )
        .is_err());
    assert!(!f.directory.join("mcp-audit.jsonl").exists());
    let count: i64 =
        f.db.lock_connection()
            .unwrap()
            .query_row("SELECT COUNT(*) FROM member", [], |row| row.get(0))
            .unwrap();
    assert_eq!(count, 0);
}

#[test]
fn rejected_relations_and_stale_edits_roll_back() {
    let f = Fixture::new();
    let project = f
        .call("easyproject_project_create", json!({"data":{"name":"P"}}))
        .unwrap();
    let pid = &project["record"]["id"];
    let member = f
        .call(
            "easyproject_member_create",
            json!({"data":{"name":"Outsider"}}),
        )
        .unwrap();
    assert!(f
        .call(
            "easyproject_task_create",
            json!({"data":{"name":"Bad","project_id":pid,"assignee":member["record"]["id"]}})
        )
        .is_err());
    assert!(f
        .call(
            "easyproject_task_create",
            json!({"data":{"name":"Bad","project_id":pid,"parent":"missing"}})
        )
        .is_err());
    assert!(f
        .call(
            "easyproject_project_update",
            json!({"id":pid,"expected_update_time":"old","changes":{"name":"Must not persist"}})
        )
        .is_err());
    assert_eq!(
        entity_api::get(&f.db, "project", pid.as_str().unwrap()).unwrap()["name"],
        "P"
    );
    assert!(f.db.lock_connection().unwrap().is_autocommit());
}

#[test]
fn protocol_requires_handshake_and_emits_only_json_lines() {
    let f = Fixture::new();
    let messages = [
        json!({"jsonrpc":"2.0","id":1,"method":"tools/list"}),
        json!({"jsonrpc":"2.0","id":2,"method":"initialize","params":{"protocolVersion":"2025-11-25","clientInfo":{"name":"test","version":"1"},"capabilities":{}}}),
        json!({"jsonrpc":"2.0","method":"notifications/initialized"}),
        json!({"jsonrpc":"2.0","id":"tools","method":"tools/list"}),
        json!({"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"easyproject_member_create","arguments":{"data":{"name":"Denied"}}}}),
        json!({"jsonrpc":"2.0","id":5,"method":"unknown"}),
    ];
    let input = messages
        .iter()
        .map(Value::to_string)
        .collect::<Vec<_>>()
        .join("\n")
        + "\nnot-json\n";
    let mut output = Vec::new();
    serve(
        &f.db,
        Permissions::default(),
        std::io::Cursor::new(input),
        &mut output,
    )
    .unwrap();
    let lines = String::from_utf8(output)
        .unwrap()
        .lines()
        .map(|line| serde_json::from_str::<Value>(line).unwrap())
        .collect::<Vec<_>>();
    assert_eq!(lines.len(), 6);
    assert_eq!(lines[0]["error"]["code"], -32002);
    assert_eq!(lines[1]["result"]["protocolVersion"], "2025-11-25");
    assert_eq!(lines[2]["result"]["tools"].as_array().unwrap().len(), 9);
    assert_eq!(lines[3]["result"]["isError"], true);
    assert_eq!(lines[4]["error"]["code"], -32601);
    assert_eq!(lines[5]["error"]["code"], -32700);
}

#[test]
fn database_open_is_explicit_existing_and_read_only_by_default() {
    let f = Fixture::new();
    assert!(open_database(Path::new("workspace.db"), Permissions::default()).is_err());
    assert!(open_database(&f.directory.join("missing.db"), Permissions::default()).is_err());
    let readonly = open_database(&f.db.1, Permissions::default()).unwrap();
    assert!(readonly
        .lock_connection()
        .unwrap()
        .execute("DELETE FROM member", [])
        .is_err());
    assert!(open_database(
        &f.db.1,
        Permissions {
            write: false,
            delete: true
        }
    )
    .is_err());
    assert!(serve(
        &f.db,
        Permissions::default(),
        std::io::Cursor::new(vec![b'x'; MAX_MESSAGE_BYTES + 1]),
        Vec::new()
    )
    .is_err());
}

#[test]
fn write_boundary_prevents_an_external_writer_between_validation_and_commit() {
    let f = Fixture::new();
    let other = Connection::open(&f.db.1).unwrap();
    other.busy_timeout(Duration::from_millis(50)).unwrap();
    entity_api::with_write(&f.db, || {
        assert!(other
            .execute(
                "INSERT INTO member (id,name) VALUES ('race','Should block')",
                []
            )
            .is_err());
        entity_api::dispatch_raw(
            &f.db,
            "member",
            "add",
            json!({"name":"Safe","email":"","phone":"","role":"Developer","avatar":""}),
        )?;
        Ok(())
    })
    .unwrap();
    let count: i64 = other
        .query_row("SELECT COUNT(*) FROM member", [], |row| row.get(0))
        .unwrap();
    assert_eq!(count, 1);
    assert!(f.db.lock_connection().unwrap().is_autocommit());
}

#[test]
fn audit_or_backup_failure_prevents_a_mutation() {
    let f = Fixture::new();
    std::fs::create_dir(f.directory.join("mcp-audit.jsonl")).unwrap();
    assert!(f
        .call(
            "easyproject_member_create",
            json!({"data":{"name":"Never write"}})
        )
        .is_err());
    std::fs::remove_dir(f.directory.join("mcp-audit.jsonl")).unwrap();
    std::fs::write(
        f.directory.join("backups"),
        b"fixture blocks backup directory",
    )
    .unwrap();
    assert!(f
        .call(
            "easyproject_member_create",
            json!({"data":{"name":"Never write"}})
        )
        .is_err());
    let count: i64 =
        f.db.lock_connection()
            .unwrap()
            .query_row("SELECT COUNT(*) FROM member", [], |row| row.get(0))
            .unwrap();
    assert_eq!(count, 0);
    assert!(f.db.lock_connection().unwrap().is_autocommit());
}

#[test]
fn records_do_not_silently_expose_future_database_columns() {
    let f = Fixture::new();
    f.db.lock_connection()
        .unwrap()
        .execute("ALTER TABLE member ADD COLUMN future_secret TEXT", [])
        .unwrap();
    let created = f
        .call(
            "easyproject_member_create",
            json!({"data":{"name":"Public fields"}}),
        )
        .unwrap();
    assert!(created["record"].get("future_secret").is_none());
}

#[test]
fn cross_project_moves_preserve_children_dependencies_and_baselines() {
    let f = Fixture::new();
    let first = f
        .call(
            "easyproject_project_create",
            json!({"data":{"name":"First"}}),
        )
        .unwrap();
    let second = f
        .call(
            "easyproject_project_create",
            json!({"data":{"name":"Second"}}),
        )
        .unwrap();
    let pid = &first["record"]["id"];
    let target = &second["record"]["id"];
    let parent = f
        .call(
            "easyproject_task_create",
            json!({"data":{"name":"Parent","project_id":pid}}),
        )
        .unwrap();
    let tid = &parent["record"]["id"];
    let child = f
        .call(
            "easyproject_task_create",
            json!({"data":{"name":"Child","project_id":pid,"parent":tid}}),
        )
        .unwrap();
    assert!(f
        .call(
            "easyproject_task_update",
            json!({"id":tid,"changes":{"project_id":target}})
        )
        .is_err());
    f.call(
        "easyproject_task_update",
        json!({"id":child["record"]["id"],"changes":{"parent":""}}),
    )
    .unwrap();
    f.db.lock_connection().unwrap().execute("INSERT INTO task_dependency (id,predecessor_task_id,successor_task_id) VALUES ('dependency',?1,?2)",rusqlite::params![tid.as_str().unwrap(),child["record"]["id"].as_str().unwrap()]).unwrap();
    assert!(f
        .call(
            "easyproject_task_update",
            json!({"id":tid,"changes":{"project_id":target}})
        )
        .is_err());
    f.db.lock_connection()
        .unwrap()
        .execute("DELETE FROM task_dependency WHERE id='dependency'", [])
        .unwrap();
    f.db.lock_connection()
        .unwrap()
        .execute(
            "INSERT INTO plan_baseline (id,project_id,task_id) VALUES ('baseline',?1,?2)",
            rusqlite::params![pid.as_str().unwrap(), tid.as_str().unwrap()],
        )
        .unwrap();
    assert!(f
        .call(
            "easyproject_task_update",
            json!({"id":tid,"changes":{"project_id":target}})
        )
        .is_err());
    assert_eq!(
        entity_api::get(&f.db, "task", tid.as_str().unwrap()).unwrap()["project_id"],
        *pid
    );
    // An unrelated task may still move, proving the check is narrow rather than disabling the API.
    assert!(f
        .call(
            "easyproject_task_update",
            json!({"id":child["record"]["id"],"changes":{"project_id":target}})
        )
        .is_ok());
}

#[test]
fn team_tools_support_assignment_and_safe_detachment() {
    let f = Fixture::new();
    let project = f
        .call(
            "easyproject_project_create",
            json!({"data":{"name":"Team project"}}),
        )
        .unwrap();
    let person = f
        .call(
            "easyproject_member_create",
            json!({"data":{"name":"Teammate"}}),
        )
        .unwrap();
    let pid = &project["record"]["id"];
    let mid = &person["record"]["id"];
    let membership = f
        .call(
            "easyproject_project_member_create",
            json!({"data":{"project_id":pid,"member_id":mid}}),
        )
        .unwrap();
    assert_eq!(membership["record"]["role"], "Member");
    assert!(f
        .call(
            "easyproject_project_member_create",
            json!({"data":{"project_id":pid,"member_id":mid}})
        )
        .is_err());
    let task = f
        .call(
            "easyproject_task_create",
            json!({"data":{"name":"Assigned","project_id":pid,"assignee":mid}}),
        )
        .unwrap();
    let remove = json!({"id":membership["record"]["id"],"confirm_member_name":"Teammate"});
    assert!(f
        .call("easyproject_project_member_delete", remove.clone())
        .is_err());
    f.call(
        "easyproject_task_update",
        json!({"id":task["record"]["id"],"changes":{"assignee":""}}),
    )
    .unwrap();
    f.call("easyproject_project_member_delete", remove).unwrap();
    f.call(
        "easyproject_member_delete",
        json!({"id":mid,"confirm_name":"Teammate"}),
    )
    .unwrap();
    assert!(entity_api::get(&f.db, "member", mid.as_str().unwrap()).is_err());
}
