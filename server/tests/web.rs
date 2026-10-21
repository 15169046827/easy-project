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
        2
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
}

#[tokio::test]
async fn personal_tokens_are_hashed_owned_scoped_expiring_and_revocable() {
    let (server, _) = setup();
    let (id, a) = signup(server.clone(), "signup_a").await;
    let (_, b) = signup(server.clone(), "signup_b").await;
    for (scope, count) in [("read", 7), ("write", 14), ("delete", 18)] {
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
        json!({"data":{"name":"Synthetic task","project_id":pid,"assignee":mid}}),
    )
    .await;
    let tid = task["record"]["id"].clone();
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
    let directory = root.join("data/workspaces").join(uid);
    let audit = std::fs::read_to_string(directory.join("mcp-audit.jsonl")).unwrap();
    assert!(audit.contains("committed"));
    assert!(!audit.contains("Secret synthetic"));
    assert!(!audit.contains(&secret));
    // Four creates, three updates and four deletes each require a recovery point.
    assert_eq!(
        std::fs::read_dir(directory.join("backups"))
            .unwrap()
            .count(),
        11
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
        .execute_batch("PRAGMA user_version=3")
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
