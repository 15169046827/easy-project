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
    let workspace = Workspace::open(&root, &id).unwrap();
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
    let workspace = Workspace::open(&root, &id).unwrap();
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
