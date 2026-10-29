use axum::{
    body::Body,
    http::{header, Method, StatusCode},
};
use easyproject_server::{
    auth,
    http::{router, test_request, Server},
    workspace::{Action, Workspace},
};
use http_body_util::BodyExt;
use serde_json::{json, Value};
use std::sync::Arc;
use tower::ServiceExt;

fn setup() -> (Arc<Server>, std::path::PathBuf) {
    let root = std::env::temp_dir().join(format!(
        "easyproject-web-test-{}",
        uuid::Uuid::new_v4().simple()
    ));
    std::fs::create_dir_all(root.join("assets")).unwrap();
    std::fs::write(
        root.join("assets/index.html"),
        "<html><head><style>body{margin:0}</style></head><body></body></html>",
    )
    .unwrap();
    let server = Server::open(
        root.join("data"),
        root.join("assets"),
        "http://127.0.0.1:8080".into(),
    )
    .unwrap();
    (server, root)
}
async fn call(
    server: Arc<Server>,
    method: Method,
    path: &str,
    body: Value,
    token: Option<&str>,
    revision: Option<i64>,
) -> (StatusCode, Value, axum::http::HeaderMap) {
    let mut request = test_request(
        method,
        path,
        Body::from(body.to_string()),
        "http://127.0.0.1:8080",
    );
    request
        .headers_mut()
        .insert("x-easyproject-client", "desktop".parse().unwrap());
    if let Some(token) = token {
        request.headers_mut().insert(
            header::AUTHORIZATION,
            format!("Bearer {token}").parse().unwrap(),
        );
    }
    if let Some(revision) = revision {
        request.headers_mut().insert(
            "x-workspace-revision",
            revision.to_string().parse().unwrap(),
        );
    }
    let response = router(server).oneshot(request).await.unwrap();
    let status = response.status();
    let headers = response.headers().clone();
    let bytes = response.into_body().collect().await.unwrap().to_bytes();
    let value = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    (status, value, headers)
}
fn account(server: &Server, name: &str, admin: bool) -> auth::User {
    auth::create(
        &server.auth.lock().unwrap(),
        name,
        "Initial-password-123!",
        admin,
    )
    .unwrap()
}
async fn ready_token(server: Arc<Server>, name: &str) -> String {
    let (_, login, _) = call(
        server.clone(),
        Method::POST,
        "/api/auth/login",
        json!({"username":name,"password":"Initial-password-123!"}),
        None,
        None,
    )
    .await;
    let token = login["token"].as_str().unwrap();
    let (status, _, _) = call(
        server.clone(),
        Method::POST,
        "/api/auth/password",
        json!({"currentPassword":"Initial-password-123!","newPassword":"Changed-password-123!"}),
        Some(token),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let (_, login, _) = call(
        server,
        Method::POST,
        "/api/auth/login",
        json!({"username":name,"password":"Changed-password-123!"}),
        None,
        None,
    )
    .await;
    login["token"].as_str().unwrap().to_owned()
}

#[tokio::test]
async fn status_id_union_queries_preserve_pagination_and_account_isolation() {
    let (server, _root) = setup();
    account(&server, "overview_alice", true);
    account(&server, "overview_bob", false);
    let alice = ready_token(server.clone(), "overview_alice").await;
    let bob = ready_token(server.clone(), "overview_bob").await;
    let mut ids = Vec::new();
    let mut scope_records = Vec::new();
    for name in ["First project", "Second project"] {
        let (_, current, _) = call(
            server.clone(),
            Method::GET,
            "/api/workspace/revision",
            json!({}),
            Some(&alice),
            None,
        )
        .await;
        let (code, created, _) = call(server.clone(), Method::POST, "/api/workspace/action", json!({"model":"project","action":"add","data":{"name":name,"version":"v1","type":"private","status":"InProgress","owner":""}}), Some(&alice), current["revision"].as_i64()).await;
        assert_eq!(code, StatusCode::OK, "{created}");
        let project = created["data"]["id"].as_str().unwrap();
        let (code, dictionary, _) = call(
            server.clone(),
            Method::POST,
            "/api/workspace/action",
            json!({"model":"task_status","action":"get_all","data":{"projectId":project}}),
            Some(&alice),
            None,
        )
        .await;
        assert_eq!(code, StatusCode::OK);
        let state = dictionary["data"]["list"]
            .as_array()
            .unwrap()
            .iter()
            .find(|state| state["builtin_key"] == "Pending")
            .unwrap()["id"]
            .as_str()
            .unwrap();
        ids.push(state.to_owned());
        let (code, task, _) = call(server.clone(), Method::POST, "/api/workspace/action", json!({"model":"task","action":"add","data":{"project_id":project,"name":name,"parent":"","dependence":"","start_time":"","end_time":"","type":"Task","priority":"Normal","status_id":state,"comment":"","assignee":""}}), Some(&alice), created["revision"].as_i64()).await;
        assert_eq!(code, StatusCode::OK, "{task}");
        let done = dictionary["data"]["list"]
            .as_array()
            .unwrap()
            .iter()
            .find(|state| state["builtin_key"] == "Done")
            .unwrap()["id"]
            .as_str()
            .unwrap()
            .to_owned();
        scope_records.push((
            project.to_owned(),
            task["data"]["id"].as_str().unwrap().to_owned(),
            done,
        ));
    }
    let read = |ids: Value, page| json!({"model":"task","action":"get_all","data":{"statusIds":ids,"hierarchy":true,"pageSize":1,"pageIndex":page}});
    let mut first_id = String::new();
    for page in [1, 2] {
        let (code, result, _) = call(
            server.clone(),
            Method::POST,
            "/api/workspace/action",
            read(json!(ids), page),
            Some(&alice),
            None,
        )
        .await;
        assert_eq!(code, StatusCode::OK, "{result}");
        assert_eq!(result["data"]["total"], 2);
        assert_eq!(result["data"]["list"].as_array().unwrap().len(), 1);
        let id = result["data"]["list"][0]["id"].as_str().unwrap();
        assert_ne!(id, first_id);
        first_id = id.to_owned();
    }
    for token in [&alice, &bob] {
        let (code, result, _) = call(
            server.clone(),
            Method::POST,
            "/api/workspace/action",
            read(if token == &bob { json!(ids) } else { json!([]) }, 1),
            Some(token),
            None,
        )
        .await;
        assert_eq!(code, StatusCode::OK);
        assert_eq!(result["data"]["total"], 0);
    }
    for bad in [json!(null), json!(["Done"]), json!([17])] {
        let (code, _, _) = call(
            server.clone(),
            Method::POST,
            "/api/workspace/action",
            read(bad, 1),
            Some(&alice),
            None,
        )
        .await;
        assert_eq!(code, StatusCode::BAD_REQUEST);
    }
    for (model, action, data) in [
        (
            "task",
            "add",
            json!({"project_id":scope_records[0].0,"name":"Nested completed match","parent":scope_records[0].1,"dependence":"","start_time":"","end_time":"","type":"Task","priority":"Normal","status_id":scope_records[0].2,"progress":100,"comment":"","assignee":""}),
        ),
        (
            "task",
            "update",
            json!({"id":scope_records[1].1,"project_id":scope_records[1].0,"name":"Second project","parent":"","dependence":"","start_time":"","end_time":"","type":"Task","priority":"Normal","status_id":scope_records[1].2,"progress":100,"comment":"","assignee":""}),
        ),
    ] {
        let (_, current, _) = call(
            server.clone(),
            Method::GET,
            "/api/workspace/revision",
            json!({}),
            Some(&alice),
            None,
        )
        .await;
        let (code, result, _) = call(
            server.clone(),
            Method::POST,
            "/api/workspace/action",
            json!({"model":model,"action":action,"data":data}),
            Some(&alice),
            current["revision"].as_i64(),
        )
        .await;
        assert_eq!(code, StatusCode::OK, "{action}: {result}");
    }
    for (scope, count) in [("top_level", 1), ("all_tasks", 2)] {
        let (code, result, _) = call(server.clone(), Method::POST, "/api/workspace/action",
            json!({"model":"task","action":"get_all","data":{"hierarchy":true,"statusIds":[scope_records[0].2,scope_records[1].2],"statusScope":scope,"pageSize":1}}), Some(&alice), None).await;
        assert_eq!(code, StatusCode::OK, "{result}");
        assert_eq!(result["data"]["total"], count);
        if scope == "top_level" {
            assert_eq!(result["data"]["list"][0]["id"], scope_records[1].1);
        }
    }
    for bad in [json!(true), json!("roots"), json!(null)] {
        let (code, _, _) = call(
            server.clone(),
            Method::POST,
            "/api/workspace/action",
            json!({"model":"task","action":"get_all","data":{"hierarchy":true,"statusScope":bad}}),
            Some(&alice),
            None,
        )
        .await;
        assert_eq!(code, StatusCode::BAD_REQUEST);
    }
}

async fn signup(server: Arc<Server>, name: &str) -> (String, String) {
    let (status, result, _) = call(
        server.clone(),
        Method::POST,
        "/api/auth/register",
        json!({"username":name,"password":"Synthetic-signup-123!"}),
        None,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(result["user"]["admin"], false);
    assert_eq!(result["user"]["mustChangePassword"], false);
    let (_, login, _) = call(
        server,
        Method::POST,
        "/api/auth/login",
        json!({"username":name,"password":"Synthetic-signup-123!"}),
        None,
        None,
    )
    .await;
    (
        result["user"]["id"].as_str().unwrap().to_owned(),
        login["token"].as_str().unwrap().to_owned(),
    )
}

async fn pat(server: Arc<Server>, session: &str, scope: &str) -> (String, String) {
    let (status, result, _) = call(
        server,
        Method::POST,
        "/api/account/mcp-tokens",
        json!({"name":"Synthetic agent","scope":scope,"days":30}),
        Some(session),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    (
        result["token"]["id"].as_str().unwrap().to_owned(),
        result["secret"].as_str().unwrap().to_owned(),
    )
}

async fn rpc(server: Arc<Server>, secret: &str, input: Value) -> (StatusCode, Value) {
    let mut request = test_request(
        Method::POST,
        "/mcp",
        Body::from(input.to_string()),
        "http://127.0.0.1:8080",
    );
    request.headers_mut().insert(
        header::AUTHORIZATION,
        format!("Bearer {secret}").parse().unwrap(),
    );
    request.headers_mut().insert(
        header::ACCEPT,
        "application/json, text/event-stream".parse().unwrap(),
    );
    request
        .headers_mut()
        .insert("mcp-protocol-version", "2025-11-25".parse().unwrap());
    let response = router(server).oneshot(request).await.unwrap();
    let status = response.status();
    let value = serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes())
        .unwrap_or(Value::Null);
    (status, value)
}

async fn tool(server: Arc<Server>, secret: &str, name: &str, arguments: Value) -> Value {
    let (status,result)=rpc(server,secret,json!({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":name,"arguments":arguments}})).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(result["result"]["isError"], false, "{result}");
    result["result"]["structuredContent"].clone()
}

#[tokio::test]
async fn signup_validates_privilege_fields_duplicates_origin_and_rate_limits() {
    let (server, _) = setup();
    for fields in [
        json!({"username":"new_user","password":"short"}),
        json!({"username":"../bad","password":"Synthetic-signup-123!"}),
        json!({"username":"new_user","password":"Synthetic-signup-123!","admin":true}),
    ] {
        let (status, _, _) = call(
            server.clone(),
            Method::POST,
            "/api/auth/register",
            fields,
            None,
            None,
        )
        .await;
        assert!(status.is_client_error());
    }
    let (id, session) = signup(server.clone(), "new_user").await;
    let (status, _, _) = call(
        server.clone(),
        Method::GET,
        "/api/admin/users",
        json!({}),
        Some(&session),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::FORBIDDEN);
    {
        let db = server.auth.lock().unwrap();
        let hash: String = db
            .query_row("SELECT password_hash FROM account WHERE id=?1", [id], |r| {
                r.get(0)
            })
            .unwrap();
        assert!(hash.starts_with("$argon2id$"));
    }
    let (status, _, _) = call(
        server.clone(),
        Method::POST,
        "/api/auth/register",
        json!({"username":"new_user","password":"Synthetic-signup-123!"}),
        None,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::BAD_REQUEST);
    let request = test_request(
        Method::POST,
        "/api/auth/register",
        Body::from("{}"),
        "https://evil.invalid",
    );
    assert_eq!(
        router(server.clone())
            .oneshot(request)
            .await
            .unwrap()
            .status(),
        StatusCode::FORBIDDEN
    );
    for _ in 0..12 {
        let _ = call(
            server.clone(),
            Method::POST,
            "/api/auth/register",
            json!({"username":"bad","password":"short"}),
            None,
            None,
        )
        .await;
    }
    assert_eq!(
        call(
            server,
            Method::POST,
            "/api/auth/register",
            json!({"username":"limited","password":"Synthetic-signup-123!"}),
            None,
            None
        )
        .await
        .0,
        StatusCode::TOO_MANY_REQUESTS
    );
}

#[test]
fn account_v1_migration_preserves_existing_identity_and_sessions() {
    let (_, root) = setup();
    let path = root.join("legacy.db");
    let db = rusqlite::Connection::open(&path).unwrap();
    db.execute_batch("CREATE TABLE account(id TEXT PRIMARY KEY,username TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,admin INTEGER NOT NULL DEFAULT 0,must_change INTEGER NOT NULL DEFAULT 1,disabled INTEGER NOT NULL DEFAULT 0); CREATE TABLE session(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES account(id),expires INTEGER NOT NULL); PRAGMA user_version=1;").unwrap();
    db.execute(
        "INSERT INTO account VALUES('legacy','legacy_admin','unchanged-hash',1,0,0)",
        [],
    )
    .unwrap();
    db.execute(
        "INSERT INTO session VALUES('unchanged-session','legacy',9999999999)",
        [],
    )
    .unwrap();
    drop(db);
    let db = auth::open(&path).unwrap();
    assert_eq!(
        db.query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
            .unwrap(),
        3
    );
    assert_eq!(
        db.query_row("SELECT password_hash FROM account", [], |r| r
            .get::<_, String>(0))
            .unwrap(),
        "unchanged-hash"
    );
    assert_eq!(
        db.query_row("SELECT token_hash FROM session", [], |r| r
            .get::<_, String>(0))
            .unwrap(),
        "unchanged-session"
    );
    assert!(db.prepare("SELECT * FROM mcp_token").is_ok());
    for (table, prefix) in [("account", "ACCOUNT"), ("session", "SESSION")] {
        let id: String = db
            .query_row(&format!("SELECT id FROM {table}"), [], |r| r.get(0))
            .unwrap();
        assert!(easyproject_server::common::id::valid_id(&id, prefix));
    }
    assert!(!db
        .prepare("PRAGMA foreign_key_check")
        .unwrap()
        .exists([])
        .unwrap());
}

#[test]
fn passwords_use_exact_six_to_thirty_one_character_boundary() {
    for length in [6, 31] {
        assert!(auth::password_hash(&"x".repeat(length)).is_ok());
    }
    for length in [0, 5, 32, 128] {
        assert!(auth::password_hash(&"x".repeat(length)).is_err());
    }
    assert!(auth::password_hash(&"中".repeat(31)).is_ok());
}

fn synthetic_avatar(size: u32) -> String {
    use base64::Engine;
    let mut output = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut output, size, size);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        encoder
            .write_header()
            .unwrap()
            .write_image_data(&vec![128; (size * size * 4) as usize])
            .unwrap();
    }
    format!(
        "data:image/png;base64,{}",
        base64::engine::general_purpose::STANDARD.encode(output)
    )
}

#[tokio::test]
async fn profile_updates_require_ownership_password_and_safe_square_image() {
    let (server, _) = setup();
    let (id, token) = signup(server.clone(), "profile_old").await;
    let key: String = server
        .auth
        .lock()
        .unwrap()
        .query_row(
            "SELECT workspace_key FROM account WHERE id=?1",
            [&id],
            |r| r.get(0),
        )
        .unwrap();
    for avatar in [
        "data:image/svg+xml,<svg/>".to_owned(),
        synthetic_avatar(32),
        "data:image/png;base64,bad".to_owned(),
    ] {
        assert_eq!(
            call(
                server.clone(),
                Method::POST,
                "/api/account/profile",
                json!({"username":"profile_old","avatar":avatar}),
                Some(&token),
                None
            )
            .await
            .0,
            StatusCode::BAD_REQUEST
        );
    }
    assert_eq!(
        call(
            server.clone(),
            Method::POST,
            "/api/account/profile",
            json!({"username":"profile_new","avatar":"","currentPassword":"wrong!"}),
            Some(&token),
            None
        )
        .await
        .0,
        StatusCode::BAD_REQUEST
    );
    let (status,user,_)=call(server.clone(),Method::POST,"/api/account/profile",json!({"username":"profile_new","avatar":synthetic_avatar(128),"currentPassword":"Synthetic-signup-123!"}),Some(&token),None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(user["user"]["id"], id);
    assert!(user["user"]["avatar"]
        .as_str()
        .unwrap()
        .starts_with("data:image/png;base64,"));
    {
        let db = server.auth.lock().unwrap();
        assert_eq!(
            db.query_row(
                "SELECT workspace_key FROM account WHERE id=?1",
                [&id],
                |r| r.get::<_, String>(0)
            )
            .unwrap(),
            key
        );
        assert_eq!(
            auth::authenticate(&db, &token).unwrap().username,
            "profile_new"
        );
    }
    assert_eq!(
        call(
            server,
            Method::POST,
            "/api/account/profile",
            json!({"username":"profile_new","avatar":"","admin":true}),
            Some(&token),
            None
        )
        .await
        .0,
        StatusCode::UNPROCESSABLE_ENTITY
    );
}

#[tokio::test]
async fn reset_codes_are_admin_only_one_time_expiring_and_revoke_old_credentials() {
    let (server, _) = setup();
    account(&server, "reset_admin", true);
    let admin = ready_token(server.clone(), "reset_admin").await;
    let (id, user) = signup(server.clone(), "reset_user").await;
    let (_, pat) = pat(server.clone(), &user, "delete").await;
    assert_eq!(
        call(
            server.clone(),
            Method::POST,
            "/api/admin/reset-codes",
            json!({"username":"reset_user"}),
            Some(&user),
            None
        )
        .await
        .0,
        StatusCode::FORBIDDEN
    );
    let (status, result, _) = call(
        server.clone(),
        Method::POST,
        "/api/admin/reset-codes",
        json!({"username":"reset_user"}),
        Some(&admin),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let code = result["code"].as_str().unwrap();
    let stored: String = server
        .auth
        .lock()
        .unwrap()
        .query_row(
            "SELECT token_hash FROM password_reset WHERE account_id=?1",
            [&id],
            |r| r.get(0),
        )
        .unwrap();
    assert_ne!(stored, code);
    assert_eq!(stored, auth::digest(code));
    let reset = json!({"username":"reset_user","code":code,"newPassword":"abc123"});
    assert_eq!(
        call(
            server.clone(),
            Method::POST,
            "/api/auth/reset-password",
            json!({"username":"unknown","code":code,"newPassword":"abc123"}),
            None,
            None
        )
        .await
        .0,
        StatusCode::BAD_REQUEST
    );
    assert_eq!(
        call(
            server.clone(),
            Method::POST,
            "/api/auth/reset-password",
            reset.clone(),
            None,
            None
        )
        .await
        .0,
        StatusCode::OK
    );
    {
        let db = server.auth.lock().unwrap();
        assert!(auth::authenticate(&db, &user).is_err());
        assert!(auth::authenticate_mcp(&db, &pat).is_err());
        assert_eq!(
            db.query_row(
                "SELECT COUNT(*) FROM password_reset WHERE account_id=?1",
                [&id],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
            0
        );
    }
    assert_eq!(
        call(
            server.clone(),
            Method::POST,
            "/api/auth/reset-password",
            reset,
            None,
            None
        )
        .await
        .0,
        StatusCode::BAD_REQUEST
    );
    assert_eq!(
        call(
            server.clone(),
            Method::POST,
            "/api/auth/login",
            json!({"username":"reset_user","password":"abc123"}),
            None,
            None
        )
        .await
        .0,
        StatusCode::OK
    );
    let (_, result, _) = call(
        server.clone(),
        Method::POST,
        "/api/admin/reset-codes",
        json!({"username":"reset_user"}),
        Some(&admin),
        None,
    )
    .await;
    server
        .auth
        .lock()
        .unwrap()
        .execute("UPDATE password_reset SET expires=0", [])
        .unwrap();
    assert_eq!(
        call(
            server.clone(),
            Method::POST,
            "/api/auth/reset-password",
            json!({"username":"reset_user","code":result["code"],"newPassword":"abc456"}),
            None,
            None
        )
        .await
        .0,
        StatusCode::BAD_REQUEST
    );
    for _ in 0..10 {
        let _ = call(
            server.clone(),
            Method::POST,
            "/api/auth/reset-password",
            json!({"username":"unknown","code":"invalid","newPassword":"abc123"}),
            None,
            None,
        )
        .await;
    }
    assert_eq!(
        call(
            server,
            Method::POST,
            "/api/auth/reset-password",
            json!({"username":"unknown","code":"invalid","newPassword":"abc123"}),
            None,
            None
        )
        .await
        .0,
        StatusCode::TOO_MANY_REQUESTS
    );
}

#[tokio::test]
async fn personal_tokens_are_hashed_owned_scoped_expiring_and_revocable() {
    let (server, _) = setup();
    let (id, a) = signup(server.clone(), "signup_a").await;
    let (_, b) = signup(server.clone(), "signup_b").await;
    for (scope, count) in [("read", 9), ("write", 18), ("delete", 23)] {
        let (token_id, secret) = pat(server.clone(), &a, scope).await;
        assert!(auth::authenticate(&server.auth.lock().unwrap(), &secret).is_err());
        assert_eq!(
            rpc(
                server.clone(),
                &a,
                json!({"jsonrpc":"2.0","id":1,"method":"tools/list"})
            )
            .await
            .0,
            StatusCode::UNAUTHORIZED
        );
        let (_, list) = rpc(
            server.clone(),
            &secret,
            json!({"jsonrpc":"2.0","id":1,"method":"tools/list"}),
        )
        .await;
        assert_eq!(list["result"]["tools"].as_array().unwrap().len(), count);
        if scope == "read" {
            let (_,denied)=rpc(server.clone(),&secret,json!({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"easyproject_project_create","arguments":{"data":{"name":"denied"}}}})).await;
            assert_eq!(denied["error"]["code"], -32602);
        }
        let (_, list, _) = call(
            server.clone(),
            Method::GET,
            "/api/account/mcp-tokens",
            json!({}),
            Some(&a),
            None,
        )
        .await;
        assert!(!list.to_string().contains(&secret));
        assert_eq!(
            call(
                server.clone(),
                Method::POST,
                "/api/account/mcp-tokens/revoke",
                json!({"id":token_id}),
                Some(&b),
                None
            )
            .await
            .0,
            StatusCode::BAD_REQUEST
        );
        {
            let db = server.auth.lock().unwrap();
            let stored: String = db
                .query_row(
                    "SELECT token_hash FROM mcp_token WHERE id=?1",
                    [&token_id],
                    |r| r.get(0),
                )
                .unwrap();
            assert_eq!(stored, auth::digest(&secret));
            assert_eq!(auth::authenticate_mcp(&db, &secret).unwrap().0.id, id);
        }
        assert_eq!(
            call(
                server.clone(),
                Method::POST,
                "/api/account/mcp-tokens/revoke",
                json!({"id":token_id}),
                Some(&a),
                None
            )
            .await
            .0,
            StatusCode::OK
        );
        assert!(auth::authenticate_mcp(&server.auth.lock().unwrap(), &secret).is_err());
    }
    let (token_id, secret) = pat(server.clone(), &a, "read").await;
    server
        .auth
        .lock()
        .unwrap()
        .execute("UPDATE mcp_token SET expires=0 WHERE id=?1", [token_id])
        .unwrap();
    assert!(auth::authenticate_mcp(&server.auth.lock().unwrap(), &secret).is_err());
    let (_, secret) = pat(server.clone(), &a, "delete").await;
    let (status, _, _) = call(
        server.clone(),
        Method::POST,
        "/api/auth/password",
        json!({"currentPassword":"Synthetic-signup-123!","newPassword":"Synthetic-changed-456!"}),
        Some(&a),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert!(auth::authenticate_mcp(&server.auth.lock().unwrap(), &secret).is_err());
    assert!(auth::authenticate(&server.auth.lock().unwrap(), &a).is_err());
}

#[tokio::test]
async fn remote_mcp_crud_is_account_isolated_and_invalidates_web_revisions() {
    let (server, root) = setup();
    let (uid, session) = signup(server.clone(), "crud_user").await;
    let (_, other) = signup(server.clone(), "other_user").await;
    let (_, secret) = pat(server.clone(), &session, "delete").await;
    let (_, other_secret) = pat(server.clone(), &other, "delete").await;
    let (_, revision, _) = call(
        server.clone(),
        Method::GET,
        "/api/workspace/revision",
        json!({}),
        Some(&session),
        None,
    )
    .await;
    let project = tool(
        server.clone(),
        &secret,
        "easyproject_project_create",
        json!({"data":{"name":"Secret synthetic project"}}),
    )
    .await;
    let pid = project["record"]["id"].clone();
    let states = tool(
        server.clone(),
        &secret,
        "easyproject_task_status_list",
        json!({"projectId":pid}),
    )
    .await;
    assert_eq!(states["list"].as_array().unwrap().len(), 3);
    let state = tool(
        server.clone(),
        &secret,
        "easyproject_task_status_create",
        json!({"data":{"project_id":pid,"name":"Testing"}}),
    )
    .await;
    let sid = state["record"]["id"].clone();
    tool(
        server.clone(),
        &secret,
        "easyproject_task_status_update",
        json!({"id":sid,"changes":{"name":"Review"}}),
    )
    .await;
    let member = tool(
        server.clone(),
        &secret,
        "easyproject_member_create",
        json!({"data":{"name":"Synthetic member"}}),
    )
    .await;
    let mid = member["record"]["id"].clone();
    let membership = tool(
        server.clone(),
        &secret,
        "easyproject_project_member_create",
        json!({"data":{"project_id":pid,"member_id":mid}}),
    )
    .await;
    let task = tool(
        server.clone(),
        &secret,
        "easyproject_task_create",
        json!({"data":{"name":"Synthetic task","project_id":pid,"assignee":mid,"status_id":sid}}),
    )
    .await;
    let tid = task["record"]["id"].clone();
    for (name, arguments) in [
        (
            "easyproject_task_update",
            json!({"id":tid,"changes":{"priority":"Urgent"}}),
        ),
        (
            "easyproject_task_update",
            json!({"id":tid,"changes":{"type":"Bug"}}),
        ),
        (
            "easyproject_project_update",
            json!({"id":pid,"changes":{"status":"Waiting"}}),
        ),
        (
            "easyproject_task_status_create",
            json!({"data":{"project_id":pid,"name":"已完成"}}),
        ),
        (
            "easyproject_task_status_update",
            json!({"id":sid,"changes":{"name":" pending "}}),
        ),
    ] {
        let (_, rejected) = rpc(server.clone(), &secret, json!({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":name,"arguments":arguments}})).await;
        assert_eq!(rejected["result"]["isError"], true);
    }
    let unchanged = tool(
        server.clone(),
        &secret,
        "easyproject_task_get",
        json!({"id":tid}),
    )
    .await;
    assert_eq!(unchanged["record"]["priority"], "Normal");
    assert_eq!(unchanged["record"]["type"], "Task");
    let usage = tool(
        server.clone(),
        &secret,
        "easyproject_task_status_get",
        json!({"id":sid}),
    )
    .await;
    assert_eq!(usage["usage"]["total"], 1);
    let (_,blocked)=rpc(server.clone(),&secret,json!({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"easyproject_task_status_delete","arguments":{"id":sid,"confirm_name":"Review"}}})).await;
    assert_eq!(blocked["result"]["isError"], true);
    let empty = tool(
        server.clone(),
        &secret,
        "easyproject_task_status_create",
        json!({"data":{"project_id":pid,"name":"Unused"}}),
    )
    .await;
    tool(
        server.clone(),
        &secret,
        "easyproject_task_status_delete",
        json!({"id":empty["record"]["id"],"confirm_name":"Unused"}),
    )
    .await;
    for (model, id, name) in [
        ("project", pid.clone(), "Project edited"),
        ("member", mid.clone(), "Member edited"),
        ("task", tid.clone(), "Task edited"),
    ] {
        tool(
            server.clone(),
            &secret,
            &format!("easyproject_{model}_get"),
            json!({"id":id}),
        )
        .await;
        tool(
            server.clone(),
            &secret,
            &format!("easyproject_{model}_list"),
            json!({}),
        )
        .await;
        tool(
            server.clone(),
            &secret,
            &format!("easyproject_{model}_update"),
            json!({"id":id,"changes":{"name":name}}),
        )
        .await;
    }
    tool(
        server.clone(),
        &secret,
        "easyproject_project_member_list",
        json!({"projectId":pid}),
    )
    .await;
    let foreign = tool(
        server.clone(),
        &other_secret,
        "easyproject_project_list",
        json!({}),
    )
    .await;
    assert!(foreign["list"].as_array().unwrap().is_empty());
    let (_,denied)=rpc(server.clone(),&other_secret,json!({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"easyproject_project_get","arguments":{"id":pid}}})).await;
    assert_eq!(denied["result"]["isError"], true);
    assert_eq!(
        call(
            server.clone(),
            Method::POST,
            "/api/workspace/action",
            json!({"model":"project","action":"add","data":{"name":"stale"}}),
            Some(&session),
            revision["revision"].as_i64()
        )
        .await
        .0,
        StatusCode::CONFLICT
    );
    tool(
        server.clone(),
        &secret,
        "easyproject_task_delete",
        json!({"id":tid,"confirm_name":"Task edited"}),
    )
    .await;
    tool(
        server.clone(),
        &secret,
        "easyproject_project_delete",
        json!({"id":pid,"confirm_name":"Project edited"}),
    )
    .await;
    tool(
        server.clone(),
        &secret,
        "easyproject_project_member_delete",
        json!({"id":membership["record"]["id"],"confirm_member_name":"Member edited"}),
    )
    .await;
    tool(
        server.clone(),
        &secret,
        "easyproject_member_delete",
        json!({"id":mid,"confirm_name":"Member edited"}),
    )
    .await;
    let key: String = server
        .auth
        .lock()
        .unwrap()
        .query_row(
            "SELECT workspace_key FROM account WHERE id=?1",
            [uid],
            |r| r.get(0),
        )
        .unwrap();
    let directory = root.join("data/workspaces").join(key);
    let audit = std::fs::read_to_string(directory.join("mcp-audit.jsonl")).unwrap();
    assert!(audit.contains("committed"));
    assert!(!audit.contains("Secret synthetic"));
    assert!(!audit.contains(&secret));
    // Original eleven writes plus two status creates, one update, a rejected
    // referenced delete and one successful status delete each need a recovery point.
    // Two added semantic duplicate rejections also retain their recovery points;
    // schema-invalid enum calls are rejected before backup/audit creation.
    assert_eq!(
        std::fs::read_dir(directory.join("backups"))
            .unwrap()
            .count(),
        18
    );
}

#[tokio::test]
async fn mcp_http_transport_validates_origin_accept_version_and_notifications() {
    let (server, _) = setup();
    let (_, session) = signup(server.clone(), "transport_user").await;
    let (_, secret) = pat(server.clone(), &session, "read").await;
    let initialize = json!({"jsonrpc":"2.0","id":"init","method":"initialize","params":{"protocolVersion":"2025-11-25","clientInfo":{"name":"synthetic","version":"1"},"capabilities":{}}});
    assert_eq!(
        rpc(server.clone(), &secret, initialize).await.1["result"]["serverInfo"]["name"],
        "easyproject-remote"
    );
    let (status, result) = rpc(
        server.clone(),
        &secret,
        json!({"jsonrpc":"2.0","method":"notifications/initialized"}),
    )
    .await;
    assert_eq!(status, StatusCode::ACCEPTED);
    assert!(result.is_null());
    assert_eq!(
        rpc(server.clone(), &secret, json!([])).await.1["error"]["code"],
        -32600
    );
    for (key, value, status) in [
        ("origin", "https://evil.invalid", StatusCode::FORBIDDEN),
        ("mcp-protocol-version", "unknown", StatusCode::BAD_REQUEST),
        ("accept", "application/json", StatusCode::NOT_ACCEPTABLE),
    ] {
        let mut request = test_request(
            Method::POST,
            "/mcp",
            Body::from("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"ping\"}"),
            "http://127.0.0.1:8080",
        );
        request.headers_mut().insert(
            header::AUTHORIZATION,
            format!("Bearer {secret}").parse().unwrap(),
        );
        request.headers_mut().insert(
            header::ACCEPT,
            "application/json, text/event-stream".parse().unwrap(),
        );
        request.headers_mut().insert(
            axum::http::HeaderName::from_bytes(key.as_bytes()).unwrap(),
            value.parse().unwrap(),
        );
        assert_eq!(
            router(server.clone())
                .oneshot(request)
                .await
                .unwrap()
                .status(),
            status
        );
    }
    let mut request = test_request(Method::GET, "/mcp", Body::empty(), "http://127.0.0.1:8080");
    request.headers_mut().insert(
        header::AUTHORIZATION,
        format!("Bearer {secret}").parse().unwrap(),
    );
    assert_eq!(
        router(server.clone())
            .oneshot(request)
            .await
            .unwrap()
            .status(),
        StatusCode::METHOD_NOT_ALLOWED
    );
    let request = test_request(
        Method::GET,
        &format!("/mcp?token={secret}"),
        Body::empty(),
        "http://127.0.0.1:8080",
    );
    assert_eq!(
        router(server).oneshot(request).await.unwrap().status(),
        StatusCode::UNAUTHORIZED
    );
}

#[test]
fn passwords_are_salted_and_weak_passwords_rejected() {
    assert!(auth::password_hash("short").is_err());
    let first = auth::password_hash("A-valid-password-123!").unwrap();
    let second = auth::password_hash("A-valid-password-123!").unwrap();
    assert_ne!(first, second);
    assert!(first.starts_with("$argon2id$"));
    assert!(auth::verify("A-valid-password-123!", &first));
    assert!(!auth::verify("wrong", &first));
}

#[test]
fn account_schema_and_write_audit_fail_closed_without_logging_business_values() {
    let (server, root) = setup();
    server
        .auth
        .lock()
        .unwrap()
        .execute_batch("PRAGMA user_version=4")
        .unwrap();
    assert!(auth::open(&root.join("data/accounts.db")).is_err());
    let id = uuid::Uuid::new_v4().simple().to_string();
    let mut workspace = Workspace::open(&root, &id).unwrap();
    let payload = json!({"model":"project","action":"add","data":{"name":"Never-log-this-name","version":"v1.0","type":"private","status":"InProgress","owner":""}});
    workspace
        .run(
            serde_json::from_value(payload.clone()).unwrap(),
            Some(workspace.revision().unwrap()),
        )
        .unwrap();
    let audit_path = root.join("workspaces").join(id).join("web-audit.jsonl");
    let audit = std::fs::read_to_string(&audit_path).unwrap();
    assert!(audit.contains("committed"));
    assert!(!audit.contains("Never-log-this-name"));
    let file = std::fs::OpenOptions::new()
        .write(true)
        .open(audit_path)
        .unwrap();
    file.set_len(10 * 1024 * 1024).unwrap();
    drop(file);
    assert_eq!(
        workspace
            .run(
                serde_json::from_value(payload).unwrap(),
                Some(workspace.revision().unwrap())
            )
            .unwrap_err()
            .0,
        500
    );
}

#[tokio::test]
async fn auth_required_origin_checked_and_initial_password_enforced() {
    let (server, _root) = setup();
    account(&server, "admin", true);
    let (status, _, _) = call(
        server.clone(),
        Method::GET,
        "/api/workspace/revision",
        json!({}),
        None,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
    let request = test_request(
        Method::POST,
        "/api/auth/login",
        Body::from("{}"),
        "https://attacker.invalid",
    );
    assert_eq!(
        router(server.clone())
            .oneshot(request)
            .await
            .unwrap()
            .status(),
        StatusCode::FORBIDDEN
    );
    let (status, _, _) = call(
        server.clone(),
        Method::POST,
        "/api/auth/login",
        json!({"username":"admin","password":"incorrect"}),
        None,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
    let (_, login, _) = call(
        server.clone(),
        Method::POST,
        "/api/auth/login",
        json!({"username":"admin","password":"Initial-password-123!"}),
        None,
        None,
    )
    .await;
    let old = login["token"].as_str().unwrap();
    let (status, _, _) = call(
        server.clone(),
        Method::GET,
        "/api/workspace/revision",
        json!({}),
        Some(old),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::FORBIDDEN);
    let (status, _, _) = call(
        server.clone(),
        Method::POST,
        "/api/auth/password",
        json!({"currentPassword":"Initial-password-123!","newPassword":"Changed-password-123!"}),
        Some(old),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let (status, _, _) = call(
        server,
        Method::GET,
        "/api/auth/session",
        json!({}),
        Some(old),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn separate_accounts_are_isolated_and_stale_devices_cannot_overwrite() {
    let (server, _root) = setup();
    account(&server, "alice", true);
    account(&server, "bob", false);
    let alice = ready_token(server.clone(), "alice").await;
    let bob = ready_token(server.clone(), "bob").await;
    let (_, state, _) = call(
        server.clone(),
        Method::GET,
        "/api/workspace/revision",
        json!({}),
        Some(&alice),
        None,
    )
    .await;
    let revision = state["revision"].as_i64().unwrap();
    let create = json!({"model":"project","action":"add","data":{"name":"Device A","version":"v1.0","type":"private","status":"InProgress","owner":""}});
    let (status, created, _) = call(
        server.clone(),
        Method::POST,
        "/api/workspace/action",
        create.clone(),
        Some(&alice),
        Some(revision),
    )
    .await;
    assert_eq!(status, StatusCode::OK, "{created}");
    let (status, _, _) = call(
        server.clone(),
        Method::POST,
        "/api/workspace/action",
        create,
        Some(&alice),
        Some(revision),
    )
    .await;
    assert_eq!(status, StatusCode::CONFLICT);
    let list = json!({"model":"project","action":"get_all","data":{}});
    let (_, data, _) = call(
        server.clone(),
        Method::POST,
        "/api/workspace/action",
        list.clone(),
        Some(&alice),
        None,
    )
    .await;
    assert!(data.to_string().contains("Device A"));
    let (_, data, _) = call(
        server.clone(),
        Method::POST,
        "/api/workspace/action",
        list,
        Some(&bob),
        None,
    )
    .await;
    assert!(!data.to_string().contains("Device A"));
    let (status, _, _) = call(
        server.clone(),
        Method::GET,
        "/api/admin/users",
        json!({}),
        Some(&bob),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::FORBIDDEN);
    let (status, data, _) = call(
        server,
        Method::GET,
        "/api/admin/users",
        json!({}),
        Some(&alice),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(data["users"].as_array().unwrap().len(), 2);
}

#[tokio::test]
async fn cookies_are_http_only_sessions_expire_and_logout_revokes() {
    let (server, _root) = setup();
    account(&server, "alice", false);
    let mut request = test_request(
        Method::POST,
        "/api/auth/login",
        Body::from(json!({"username":"alice","password":"Initial-password-123!"}).to_string()),
        "http://127.0.0.1:8080",
    );
    request.headers_mut().remove("x-easyproject-client");
    let response = router(server.clone()).oneshot(request).await.unwrap();
    let cookie = response.headers()[header::SET_COOKIE]
        .to_str()
        .unwrap()
        .to_owned();
    assert!(cookie.contains("HttpOnly"));
    assert!(cookie.contains("SameSite=Strict"));
    let body: Value =
        serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes()).unwrap();
    assert!(body["token"].is_null());
    let token = cookie
        .split(';')
        .next()
        .unwrap()
        .strip_prefix("ep_session=")
        .unwrap();
    let (status, _, _) = call(
        server.clone(),
        Method::POST,
        "/api/auth/logout",
        json!({}),
        Some(token),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let (status, _, _) = call(
        server.clone(),
        Method::GET,
        "/api/auth/session",
        json!({}),
        Some(token),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
    let (_, login, _) = call(
        server.clone(),
        Method::POST,
        "/api/auth/login",
        json!({"username":"alice","password":"Initial-password-123!"}),
        None,
        None,
    )
    .await;
    let token = login["token"].as_str().unwrap();
    server
        .auth
        .lock()
        .unwrap()
        .execute("UPDATE session SET expires=0", [])
        .unwrap();
    let (status, _, _) = call(
        server,
        Method::GET,
        "/api/auth/session",
        json!({}),
        Some(token),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn index_has_fresh_nonce_and_web_marker() {
    let (server, _root) = setup();
    let response = router(server)
        .oneshot(test_request(
            Method::GET,
            "/",
            Body::empty(),
            "http://127.0.0.1:8080",
        ))
        .await
        .unwrap();
    assert!(response.headers()[header::CONTENT_SECURITY_POLICY]
        .to_str()
        .unwrap()
        .contains("'nonce-"));
    let html = String::from_utf8(
        response
            .into_body()
            .collect()
            .await
            .unwrap()
            .to_bytes()
            .to_vec(),
    )
    .unwrap();
    assert!(html.contains("easyproject-web"));
    assert!(html.contains("<style nonce="));
}

#[test]
fn workspace_persists_and_restart_invalidates_old_revision() {
    let root = std::env::temp_dir().join(format!(
        "easyproject-persistence-{}",
        uuid::Uuid::new_v4().simple()
    ));
    let id = uuid::Uuid::new_v4().simple().to_string();
    let mut workspace = Workspace::open(&root, &id).unwrap();
    let previous = workspace.revision().unwrap();
    workspace
        .run(
            serde_json::from_value::<Action>(
                json!({"model":"project","action":"add","data":{"name":"Persisted","version":"v1.0","type":"private","status":"InProgress","owner":""}}),
            )
            .unwrap(),
            Some(previous),
        )
        .unwrap();
    let last = workspace.revision().unwrap();
    let first_backup =
        easyproject_server::services::data_service::create_backup(&workspace.db, "web").unwrap();
    let second_backup =
        easyproject_server::services::data_service::create_backup(&workspace.db, "web").unwrap();
    assert_ne!(first_backup["path"], second_backup["path"]);
    assert_eq!(first_backup["reason"], "web");
    drop(workspace);
    let mut workspace = Workspace::open(&root, &id).unwrap();
    assert_ne!(workspace.revision().unwrap(), last);
    let value = workspace
        .run(
            serde_json::from_value(json!({"model":"project","action":"get_all","data":{}}))
                .unwrap(),
            None,
        )
        .unwrap();
    assert!(value.to_string().contains("Persisted"));
    assert!(Workspace::open(&root, "../escape").is_err());
}

#[tokio::test]
async fn login_rate_limit_and_unregistered_operations_fail_closed() {
    let (server, _root) = setup();
    for _ in 0..30 {
        let _ = call(
            server.clone(),
            Method::POST,
            "/api/auth/login",
            json!({"username":"missing","password":"incorrect"}),
            None,
            None,
        )
        .await;
    }
    let (status, _, _) = call(
        server,
        Method::POST,
        "/api/auth/login",
        json!({"username":"missing","password":"incorrect"}),
        None,
        None,
    )
    .await;
    assert_eq!(status, StatusCode::TOO_MANY_REQUESTS);
    assert!(easyproject_server::workspace::is_mutation("sql", "execute").is_none());
    assert!(Server::open(
        std::env::temp_dir(),
        std::env::temp_dir(),
        "http://home-host:8080".into()
    )
    .is_err());
}

#[tokio::test]
async fn trusted_proxy_separates_clients_but_default_still_ignores_spoofed_headers() {
    use easyproject_server::rate_limit::ProxyPolicy;
    for policy in [ProxyPolicy::None, ProxyPolicy::TailscaleLoopback] {
        let root = std::env::temp_dir().join(format!(
            "easyproject-proxy-test-{}",
            uuid::Uuid::new_v4().simple()
        ));
        std::fs::create_dir_all(root.join("assets")).unwrap();
        let server = Server::open_with_proxy(
            root.join("data"),
            root.join("assets"),
            "https://example.test".into(),
            policy,
        )
        .unwrap();
        for index in 0..12 {
            let mut request = test_request(
                Method::POST,
                "/api/auth/register",
                Body::from(json!({"username":"synthetic","password":"short"}).to_string()),
                "https://example.test",
            );
            request
                .headers_mut()
                .insert("x-forwarded-for", "203.0.113.1".parse().unwrap());
            request
                .headers_mut()
                .insert("x-forwarded-host", "example.test".parse().unwrap());
            request
                .headers_mut()
                .insert("x-forwarded-proto", "https".parse().unwrap());
            let response = router(server.clone()).oneshot(request).await.unwrap();
            assert_eq!(
                response.status(),
                if index < 10 {
                    StatusCode::BAD_REQUEST
                } else {
                    StatusCode::TOO_MANY_REQUESTS
                }
            );
        }
        let mut request = test_request(
            Method::POST,
            "/api/auth/register",
            Body::from(json!({"username":"synthetic","password":"short"}).to_string()),
            "https://example.test",
        );
        request
            .headers_mut()
            .insert("x-forwarded-for", "203.0.113.2".parse().unwrap());
        request
            .headers_mut()
            .insert("x-forwarded-host", "example.test".parse().unwrap());
        request
            .headers_mut()
            .insert("x-forwarded-proto", "https".parse().unwrap());
        let response = router(server.clone()).oneshot(request).await.unwrap();
        assert_eq!(
            response.status(),
            if policy == ProxyPolicy::None {
                StatusCode::TOO_MANY_REQUESTS
            } else {
                StatusCode::BAD_REQUEST
            }
        );
        assert!(auth::list(&server.auth.lock().unwrap()).unwrap().is_empty());
    }
    assert!(Server::open_with_proxy(
        std::env::temp_dir(),
        std::env::temp_dir(),
        "http://127.0.0.1:8080".into(),
        ProxyPolicy::TailscaleLoopback
    )
    .is_err());
}

#[test]
fn storage_budget_blocks_web_and_remote_mcp_before_revision_audit_or_backup() {
    use easyproject_server::{mcp, storage_budget::StorageBudget};
    let root = std::env::temp_dir().join(format!(
        "easyproject-budget-boundary-{}",
        uuid::Uuid::new_v4().simple()
    ));
    let key = "a".repeat(32);
    let mut workspace = Workspace::open_with_budget(
        &root,
        &key,
        StorageBudget {
            workspace_bytes: 0,
            data_bytes: 8192 * 1024 * 1024,
        },
    )
    .unwrap();
    let directory = root.join("workspaces").join(key);
    let database = directory.join("project_manager.db");
    let before = std::fs::read(&database).unwrap();
    let revision = workspace.revision().unwrap();
    let files_before = std::fs::read_dir(&directory).unwrap().count();
    let error = workspace
        .run(
            Action {
                model: "project".into(),
                action: "add".into(),
                data: json!({"name":"synthetic blocked"}),
            },
            Some(revision),
        )
        .unwrap_err();
    assert_eq!(error.0, 507);
    assert!(error.1.contains("reads remain available"));
    let response = mcp::handle(&mut workspace, mcp::Permissions { write: true, delete: true },
        json!({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"easyproject_project_create","arguments":{"data":{"name":"synthetic blocked"}}}})).unwrap();
    assert_eq!(response["result"]["isError"], true);
    assert!(response["result"]["content"][0]["text"]
        .as_str()
        .unwrap()
        .contains("storage budget reached"));
    assert_eq!(workspace.revision().unwrap(), revision);
    assert_eq!(std::fs::read(&database).unwrap(), before);
    assert_eq!(std::fs::read_dir(&directory).unwrap().count(), files_before);
    assert!(workspace
        .run(
            Action {
                model: "project".into(),
                action: "get_all".into(),
                data: json!({})
            },
            None
        )
        .is_ok());
    assert!(workspace
        .run(
            Action {
                model: "data".into(),
                action: "export_json".into(),
                data: json!({})
            },
            None
        )
        .is_ok());
    let response = mcp::handle(&mut workspace, mcp::Permissions { write: true, delete: true },
        json!({"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"easyproject_project_list","arguments":{}}})).unwrap();
    assert_eq!(response["result"]["isError"], false);
}

#[tokio::test]
async fn http_budget_errors_preserve_authenticated_reads_and_remote_mcp_contract() {
    use easyproject_server::{http::ServerOptions, storage_budget::StorageBudget};
    let root = std::env::temp_dir().join(format!(
        "easyproject-http-budget-{}",
        uuid::Uuid::new_v4().simple()
    ));
    std::fs::create_dir_all(root.join("assets")).unwrap();
    let server = Server::open_with_options(
        root.join("data"),
        root.join("assets"),
        "http://127.0.0.1:8080".into(),
        ServerOptions {
            storage_budget: StorageBudget {
                workspace_bytes: 64 * 1024 * 1024,
                data_bytes: 64 * 1024 * 1024,
            },
            ..Default::default()
        },
    )
    .unwrap();
    let user = account(&server, "budget_user", false);
    let token = ready_token(server.clone(), "budget_user").await;
    let (_, result, _) = call(
        server.clone(),
        Method::GET,
        "/api/workspace/revision",
        json!({}),
        Some(&token),
        None,
    )
    .await;
    let revision = result["revision"].as_i64().unwrap();
    let (status, credential, _) = call(
        server.clone(),
        Method::POST,
        "/api/account/mcp-tokens",
        json!({"name":"synthetic","scope":"delete","days":7}),
        Some(&token),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    let key: String = server
        .auth
        .lock()
        .unwrap()
        .query_row(
            "SELECT workspace_key FROM account WHERE id=?1",
            [&user.id],
            |row| row.get(0),
        )
        .unwrap();
    let directory = root.join("data/workspaces").join(key);
    std::fs::File::create(directory.join("synthetic-budget-pad"))
        .unwrap()
        .set_len(64 * 1024 * 1024)
        .unwrap();
    let before = std::fs::read(directory.join("project_manager.db")).unwrap();
    let (status, failure, _) = call(
        server.clone(),
        Method::POST,
        "/api/workspace/action",
        json!({"model":"project","action":"add","data":{"name":"blocked"}}),
        Some(&token),
        Some(revision),
    )
    .await;
    assert_eq!(status, StatusCode::INSUFFICIENT_STORAGE);
    assert!(failure["error"]
        .as_str()
        .unwrap()
        .contains("reads remain available"));
    let mut request = test_request(Method::POST, "/mcp", Body::from(json!({"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"easyproject_project_create","arguments":{"data":{"name":"blocked"}}}}).to_string()), "http://127.0.0.1:8080");
    request.headers_mut().insert(
        header::AUTHORIZATION,
        format!("Bearer {}", credential["secret"].as_str().unwrap())
            .parse()
            .unwrap(),
    );
    request.headers_mut().insert(
        header::ACCEPT,
        "application/json, text/event-stream".parse().unwrap(),
    );
    let response = router(server.clone()).oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
    let response: Value =
        serde_json::from_slice(&response.into_body().collect().await.unwrap().to_bytes()).unwrap();
    assert_eq!(response["result"]["isError"], true);
    assert!(response["result"]["content"][0]["text"]
        .as_str()
        .unwrap()
        .contains("storage budget reached"));
    assert_eq!(
        std::fs::read(directory.join("project_manager.db")).unwrap(),
        before
    );
    let (status, current, _) = call(
        server.clone(),
        Method::GET,
        "/api/workspace/revision",
        json!({}),
        Some(&token),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(current["revision"], revision);
    let (status, _, _) = call(
        server,
        Method::POST,
        "/api/workspace/action",
        json!({"model":"project","action":"get_all","data":{}}),
        Some(&token),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
}
