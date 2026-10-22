use crate::{
    auth::{self, User},
    workspace::{Action, Workspace},
};
use axum::{
    body::Body,
    extract::{ConnectInfo, DefaultBodyLimit, Request, State},
    http::{header, HeaderMap, HeaderValue, Method, StatusCode},
    middleware::{self, Next},
    response::{Html, IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use rusqlite::Connection;
use serde::Deserialize;
use serde_json::{json, Value};
use std::{
    collections::HashMap,
    net::SocketAddr,
    path::PathBuf,
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};
use tower_http::{cors::CorsLayer, services::ServeDir};

type ApiError = (StatusCode, Json<Value>);
fn error(status: StatusCode, message: &str) -> ApiError {
    (status, Json(json!({"error":message})))
}
fn internal(_: impl std::fmt::Display) -> ApiError {
    error(StatusCode::INTERNAL_SERVER_ERROR, "Server operation failed")
}

pub struct Server {
    pub auth: Mutex<Connection>,
    pub root: PathBuf,
    pub assets: PathBuf,
    pub origin: String,
    pub secure: bool,
    pub workspaces: Mutex<HashMap<String, Arc<Mutex<Workspace>>>>,
    attempts: Mutex<HashMap<String, (Instant, u32)>>,
    registrations: Mutex<HashMap<String, (Instant, u32)>>,
    auth_slots: tokio::sync::Semaphore,
    work_slots: tokio::sync::Semaphore,
    dummy_hash: String,
}

impl Server {
    pub fn open(root: PathBuf, assets: PathBuf, origin: String) -> Result<Arc<Self>, String> {
        let url = reqwest::Url::parse(&origin).map_err(|_| "Invalid origin")?;
        let loopback = matches!(url.host_str(), Some("127.0.0.1" | "localhost" | "[::1]"));
        if url.path() != "/"
            || url.query().is_some()
            || url.fragment().is_some()
            || !url.username().is_empty()
            || url.password().is_some()
            || (url.scheme() != "https" && !(url.scheme() == "http" && loopback))
        {
            return Err("HTTPS origin required (HTTP loopback for tests only)".into());
        }
        std::fs::create_dir_all(&root).map_err(|e| e.to_string())?;
        let auth = auth::open(&root.join("accounts.db"))?;
        let dummy_hash = auth::password_hash(&auth::random_token()[..31])?;
        Ok(Arc::new(Self {
            auth: Mutex::new(auth),
            root,
            assets,
            secure: url.scheme() == "https",
            origin: origin.trim_end_matches('/').to_owned(),
            workspaces: Mutex::new(HashMap::new()),
            attempts: Mutex::new(HashMap::new()),
            registrations: Mutex::new(HashMap::new()),
            auth_slots: tokio::sync::Semaphore::new(2),
            work_slots: tokio::sync::Semaphore::new(8),
            dummy_hash,
        }))
    }
    fn user(&self, headers: &HeaderMap) -> Result<(User, String), ApiError> {
        let token = token(headers)
            .ok_or_else(|| error(StatusCode::UNAUTHORIZED, "Authentication required"))?;
        let user = auth::authenticate(&*self.auth.lock().map_err(internal)?, &token)
            .map_err(|_| error(StatusCode::UNAUTHORIZED, "Authentication required"))?;
        Ok((user, token))
    }
    fn workspace(&self, user: &User) -> Result<Arc<Mutex<Workspace>>, ApiError> {
        let mut map = self.workspaces.lock().map_err(internal)?;
        if let Some(workspace) = map.get(&user.id) {
            return Ok(workspace.clone());
        }
        // Bound open connections; idle entries can safely be reopened from disk.
        if map.len() >= 64 {
            map.retain(|_, entry| Arc::strong_count(entry) > 1);
        }
        if map.len() >= 64 {
            return Err(error(
                StatusCode::SERVICE_UNAVAILABLE,
                "Workspace capacity reached",
            ));
        }
        let key: String = self
            .auth
            .lock()
            .map_err(internal)?
            .query_row(
                "SELECT workspace_key FROM account WHERE id=?1",
                [&user.id],
                |r| r.get(0),
            )
            .map_err(internal)?;
        let workspace = Arc::new(Mutex::new(
            Workspace::open(&self.root, &key).map_err(internal)?,
        ));
        map.insert(user.id.clone(), workspace.clone());
        Ok(workspace)
    }
}

fn token(headers: &HeaderMap) -> Option<String> {
    if let Some(value) = headers
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
    {
        return value.strip_prefix("Bearer ").map(str::to_owned);
    }
    headers
        .get(header::COOKIE)?
        .to_str()
        .ok()?
        .split(';')
        .find_map(|part| part.trim().strip_prefix("ep_session=").map(str::to_owned))
}

pub fn router(server: Arc<Server>) -> Router {
    let desktop_origins = [
        "tauri://localhost",
        "http://tauri.localhost",
        "https://tauri.localhost",
    ];
    let cors = CorsLayer::new()
        .allow_origin(desktop_origins.map(HeaderValue::from_static))
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::HeaderName::from_static("x-easyproject-request"),
            header::HeaderName::from_static("x-easyproject-client"),
            header::HeaderName::from_static("x-workspace-revision"),
        ]);
    Router::new()
        .route(
            "/api/health",
            get(|| async { Json(json!({"status":"ok"})) }),
        )
        .route("/api/auth/login", post(login))
        .route("/api/auth/register", post(register))
        .route(
            "/api/account/mcp-tokens",
            get(mcp_tokens).post(create_mcp_token),
        )
        .route("/api/account/mcp-tokens/revoke", post(revoke_mcp_token))
        .route(
            "/mcp",
            get(mcp_get)
                .post(mcp_post)
                .layer(DefaultBodyLimit::max(262144)),
        )
        .route("/api/auth/session", get(session))
        .route("/api/auth/logout", post(logout))
        .route("/api/auth/password", post(password))
        .route("/api/account/profile", post(profile))
        .route("/api/auth/reset-password", post(reset_password))
        .route("/api/admin/reset-codes", post(issue_reset_code))
        .route("/api/admin/users", get(users).post(create_user))
        .route("/api/workspace/revision", get(revision))
        .route("/api/workspace/action", post(action))
        .route("/", get(index))
        .route("/index.html", get(index))
        .fallback_service(
            ServeDir::new(server.assets.clone()).append_index_html_on_directories(false),
        )
        .layer(DefaultBodyLimit::max(2 * 1024 * 1024))
        .layer(cors)
        .layer(middleware::from_fn_with_state(server.clone(), security))
        .with_state(server)
}

async fn security(State(server): State<Arc<Server>>, request: Request, next: Next) -> Response {
    if request.uri().path() == "/mcp"
        && request
            .headers()
            .get(header::ORIGIN)
            .is_some_and(|origin| origin.to_str().ok() != Some(server.origin.as_str()))
    {
        return error(StatusCode::FORBIDDEN, "Origin rejected").into_response();
    }
    if request.uri().path().starts_with("/api/")
        && request.method() != Method::GET
        && request.method() != Method::OPTIONS
    {
        let headers = request.headers();
        let origin = headers.get(header::ORIGIN).and_then(|h| h.to_str().ok());
        let allowed = origin == Some(server.origin.as_str())
            || matches!(
                origin,
                Some("tauri://localhost" | "http://tauri.localhost" | "https://tauri.localhost")
            );
        if !allowed
            || headers
                .get("x-easyproject-request")
                .and_then(|h| h.to_str().ok())
                != Some("1")
        {
            return error(StatusCode::FORBIDDEN, "Origin or request marker rejected")
                .into_response();
        }
    }
    let mut response = next.run(request).await;
    let headers = response.headers_mut();
    headers.insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    headers.insert(
        "x-content-type-options",
        HeaderValue::from_static("nosniff"),
    );
    headers.insert("referrer-policy", HeaderValue::from_static("no-referrer"));
    headers.insert("x-frame-options", HeaderValue::from_static("DENY"));
    response
}

fn cookie(server: &Server, token: &str, age: i64) -> HeaderValue {
    HeaderValue::from_str(&format!(
        "ep_session={token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age={age}{}",
        if server.secure { "; Secure" } else { "" }
    ))
    .expect("generated ASCII cookie")
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Credentials {
    username: String,
    password: String,
}

async fn login(
    State(server): State<Arc<Server>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    headers: HeaderMap,
    Json(input): Json<Credentials>,
) -> Result<Response, ApiError> {
    if input.username.len() > 48 || !(6..=31).contains(&input.password.chars().count()) {
        return Err(error(StatusCode::BAD_REQUEST, "Invalid credentials"));
    }
    {
        let mut attempts = server.attempts.lock().map_err(internal)?;
        attempts.retain(|_, (time, _)| time.elapsed() < Duration::from_secs(900));
        if attempts.len() >= 1024 {
            return Err(error(StatusCode::TOO_MANY_REQUESTS, "Try again later"));
        }
        // Real socket peer, never an untrusted forwarded-for header. A private reverse
        // proxy shares this bound, deliberately conservative until trusted-proxy support.
        let entry = attempts
            .entry(peer.ip().to_string())
            .or_insert((Instant::now(), 0));
        entry.1 += 1;
        if entry.1 > 30 {
            return Err(error(
                StatusCode::TOO_MANY_REQUESTS,
                "Too many login attempts; wait 15 minutes",
            ));
        }
    }
    let permit = server
        .auth_slots
        .try_acquire()
        .map_err(|_| error(StatusCode::TOO_MANY_REQUESTS, "Authentication busy"))?;
    let worker = server.clone();
    let (user, token) = tokio::task::spawn_blocking(move || {
        auth::login(
            &*worker
                .auth
                .lock()
                .map_err(|_| "Authentication unavailable")?,
            &input.username,
            &input.password,
            &worker.dummy_hash,
        )
    })
    .await
    .map_err(internal)?
    .map_err(|_| error(StatusCode::UNAUTHORIZED, "Invalid username or password"))?;
    drop(permit);
    let desktop = headers
        .get("x-easyproject-client")
        .and_then(|h| h.to_str().ok())
        == Some("desktop");
    let mut result =
        Json(json!({"user":user,"token":if desktop{Some(&token)}else{None}})).into_response();
    if !desktop {
        result.headers_mut().insert(
            header::SET_COOKIE,
            cookie(&server, &token, auth::SESSION_SECONDS),
        );
    }
    Ok(result)
}

async fn register(
    State(server): State<Arc<Server>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    Json(input): Json<Credentials>,
) -> Result<Json<Value>, ApiError> {
    if input.username.len() > 48 || input.password.len() > 512 {
        return Err(error(
            StatusCode::BAD_REQUEST,
            "Invalid registration fields",
        ));
    }
    {
        let mut attempts = server.registrations.lock().map_err(internal)?;
        attempts.retain(|_, (time, _)| time.elapsed() < Duration::from_secs(3600));
        if attempts.len() >= 1024 {
            return Err(error(StatusCode::TOO_MANY_REQUESTS, "Try again later"));
        }
        // Reverse-proxy peers intentionally share this conservative registration bound.
        let entry = attempts
            .entry(peer.ip().to_string())
            .or_insert((Instant::now(), 0));
        entry.1 += 1;
        if entry.1 > 10 {
            return Err(error(
                StatusCode::TOO_MANY_REQUESTS,
                "Too many registrations; wait one hour",
            ));
        }
    }
    let _permit = server
        .auth_slots
        .try_acquire()
        .map_err(|_| error(StatusCode::TOO_MANY_REQUESTS, "Authentication busy"))?;
    let worker = server.clone();
    let user = tokio::task::spawn_blocking(move || {
        auth::register(
            &*worker.auth.lock().map_err(|_| "Account unavailable")?,
            &input.username,
            &input.password,
        )
    })
    .await
    .map_err(internal)?
    .map_err(|e| error(StatusCode::BAD_REQUEST, &e))?;
    Ok(Json(json!({"user":user,"loginRequired":true})))
}

async fn mcp_tokens(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    ready(&user)?;
    let tokens =
        auth::list_mcp_tokens(&*server.auth.lock().map_err(internal)?, &user).map_err(internal)?;
    Ok(Json(
        json!({"tokens":tokens,"endpoint":format!("{}/mcp",server.origin)}),
    ))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct TokenInput {
    name: String,
    scope: String,
    days: i64,
}

async fn create_mcp_token(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
    Json(input): Json<TokenInput>,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    ready(&user)?;
    let (record, secret) = auth::create_mcp_token(
        &*server.auth.lock().map_err(internal)?,
        &user,
        &input.name,
        &input.scope,
        input.days,
    )
    .map_err(|e| error(StatusCode::BAD_REQUEST, &e))?;
    Ok(Json(json!({"token":record,"secret":secret})))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct RevokeInput {
    id: String,
}

async fn revoke_mcp_token(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
    Json(input): Json<RevokeInput>,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    ready(&user)?;
    auth::revoke_mcp_token(&*server.auth.lock().map_err(internal)?, &user, &input.id)
        .map_err(|e| error(StatusCode::BAD_REQUEST, &e))?;
    Ok(Json(json!({"ok":true})))
}

fn mcp_identity(
    server: &Server,
    headers: &HeaderMap,
) -> Result<(User, crate::mcp::Permissions), ApiError> {
    if let Some(origin) = headers.get(header::ORIGIN) {
        if origin.to_str().ok() != Some(server.origin.as_str()) {
            return Err(error(StatusCode::FORBIDDEN, "Origin rejected"));
        }
    }
    let version = headers
        .get("mcp-protocol-version")
        .map(|h| h.to_str().unwrap_or(""));
    if version.is_some_and(|v| !crate::mcp::VERSIONS.contains(&v)) {
        return Err(error(
            StatusCode::BAD_REQUEST,
            "Unsupported MCP protocol version",
        ));
    }
    let secret = headers
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
        .ok_or_else(|| error(StatusCode::UNAUTHORIZED, "MCP bearer token required"))?;
    let (user, scope) = auth::authenticate_mcp(&*server.auth.lock().map_err(internal)?, secret)
        .map_err(|_| error(StatusCode::UNAUTHORIZED, "MCP bearer token required"))?;
    Ok((
        user,
        crate::mcp::Permissions {
            write: scope != "read",
            delete: scope == "delete",
        },
    ))
}

async fn mcp_get(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
) -> Result<StatusCode, ApiError> {
    mcp_identity(&server, &headers)?;
    Ok(StatusCode::METHOD_NOT_ALLOWED)
}

async fn mcp_post(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
    Json(input): Json<Value>,
) -> Result<Response, ApiError> {
    let (user, permissions) = mcp_identity(&server, &headers)?;
    let accept = headers
        .get(header::ACCEPT)
        .and_then(|h| h.to_str().ok())
        .unwrap_or("");
    let accepts = |kind| {
        accept
            .split(',')
            .any(|v| v.trim().split(';').next() == Some(kind))
    };
    if !accepts("application/json") || !accepts("text/event-stream") {
        return Err(error(
            StatusCode::NOT_ACCEPTABLE,
            "Accept application/json and text/event-stream",
        ));
    }
    let _permit = server
        .work_slots
        .try_acquire()
        .map_err(|_| error(StatusCode::TOO_MANY_REQUESTS, "Workspace server is busy"))?;
    let workspace = server.workspace(&user)?;
    let result = tokio::task::spawn_blocking(move || {
        let mut workspace = workspace.lock().map_err(|_| "Workspace unavailable")?;
        Ok::<_, &'static str>(crate::mcp::handle(&mut workspace, permissions, input))
    })
    .await
    .map_err(internal)?
    .map_err(internal)?;
    Ok(match result {
        Some(value) => Json(value).into_response(),
        None => StatusCode::ACCEPTED.into_response(),
    })
}

async fn session(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    Ok(Json(json!({"user":user})))
}
async fn logout(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
) -> Result<Response, ApiError> {
    let (_, token) = server.user(&headers)?;
    server
        .auth
        .lock()
        .map_err(internal)?
        .execute(
            "DELETE FROM session WHERE token_hash=?1",
            [auth::digest(&token)],
        )
        .map_err(internal)?;
    let mut response = Json(json!({"ok":true})).into_response();
    response
        .headers_mut()
        .insert(header::SET_COOKIE, cookie(&server, "", 0));
    Ok(response)
}

fn ready(user: &User) -> Result<(), ApiError> {
    if user.must_change_password {
        Err(error(
            StatusCode::FORBIDDEN,
            "Change the initial password first",
        ))
    } else {
        Ok(())
    }
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct PasswordChange {
    current_password: String,
    new_password: String,
}
async fn password(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
    Json(input): Json<PasswordChange>,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    let _permit = server
        .auth_slots
        .try_acquire()
        .map_err(|_| error(StatusCode::TOO_MANY_REQUESTS, "Authentication busy"))?;
    let worker = server.clone();
    tokio::task::spawn_blocking(move || {
        auth::change_password(
            &mut *worker.auth.lock().map_err(|_| "Account unavailable")?,
            &user,
            &input.current_password,
            &input.new_password,
        )
    })
    .await
    .map_err(internal)?
    .map_err(|e| error(StatusCode::BAD_REQUEST, &e))?;
    Ok(Json(json!({"ok":true,"loginRequired":true})))
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ProfileChange {
    username: String,
    avatar: String,
    #[serde(default)]
    current_password: String,
}
async fn profile(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
    Json(input): Json<ProfileChange>,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    ready(&user)?;
    if input.current_password.len() > 512
        || input.avatar.len() > 180_000
        || input.username.len() > 48
    {
        return Err(error(StatusCode::BAD_REQUEST, "Invalid profile size"));
    }
    let _permit = server
        .auth_slots
        .try_acquire()
        .map_err(|_| error(StatusCode::TOO_MANY_REQUESTS, "Authentication busy"))?;
    let worker = server.clone();
    let updated = tokio::task::spawn_blocking(move || {
        crate::profile::update(
            &*worker.auth.lock().map_err(|_| "Account unavailable")?,
            &user,
            &input.username,
            &input.avatar,
            &input.current_password,
        )
    })
    .await
    .map_err(internal)?
    .map_err(|e| error(StatusCode::BAD_REQUEST, &e))?;
    Ok(Json(json!({"user":updated})))
}
#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ResetPassword {
    username: String,
    code: String,
    new_password: String,
}
async fn reset_password(
    State(server): State<Arc<Server>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    Json(input): Json<ResetPassword>,
) -> Result<Json<Value>, ApiError> {
    if input.username.len() > 48
        || input.code.len() > 72
        || !(6..=31).contains(&input.new_password.chars().count())
    {
        return Err(error(StatusCode::BAD_REQUEST, "Invalid reset request"));
    }
    {
        let mut attempts = server.attempts.lock().map_err(internal)?;
        attempts.retain(|_, (time, _)| time.elapsed() < Duration::from_secs(900));
        if attempts.len() >= 1024 {
            return Err(error(StatusCode::TOO_MANY_REQUESTS, "Try again later"));
        }
        let entry = attempts
            .entry(format!("reset:{}", peer.ip()))
            .or_insert((Instant::now(), 0));
        entry.1 += 1;
        if entry.1 > 10 {
            return Err(error(
                StatusCode::TOO_MANY_REQUESTS,
                "Try again in 15 minutes",
            ));
        }
    }
    let _permit = server
        .auth_slots
        .try_acquire()
        .map_err(|_| error(StatusCode::TOO_MANY_REQUESTS, "Authentication busy"))?;
    let worker = server.clone();
    tokio::task::spawn_blocking(move || {
        crate::password_reset::reset(
            &mut *worker.auth.lock().map_err(|_| "Reset unavailable")?,
            &input.username,
            &input.code,
            &input.new_password,
        )
    })
    .await
    .map_err(internal)?
    .map_err(|_| error(StatusCode::BAD_REQUEST, "Invalid or expired reset code"))?;
    Ok(Json(json!({"ok":true})))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ResetTarget {
    username: String,
}
async fn issue_reset_code(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
    Json(input): Json<ResetTarget>,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    ready(&user)?;
    if !user.admin {
        return Err(error(StatusCode::FORBIDDEN, "Administrator required"));
    }
    if input.username.len() > 48 {
        return Err(error(StatusCode::BAD_REQUEST, "Invalid username"));
    }
    let code =
        crate::password_reset::issue(&mut *server.auth.lock().map_err(internal)?, &input.username)
            .map_err(|e| error(StatusCode::BAD_REQUEST, &e))?;
    Ok(Json(json!({"code":code,"expiresIn":900})))
}
async fn users(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    ready(&user)?;
    if !user.admin {
        return Err(error(StatusCode::FORBIDDEN, "Administrator required"));
    }
    Ok(Json(
        json!({"users":auth::list(&*server.auth.lock().map_err(internal)?).map_err(internal)?}),
    ))
}
async fn create_user(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
    Json(input): Json<Credentials>,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    ready(&user)?;
    if !user.admin {
        return Err(error(StatusCode::FORBIDDEN, "Administrator required"));
    }
    let _permit = server
        .auth_slots
        .try_acquire()
        .map_err(|_| error(StatusCode::TOO_MANY_REQUESTS, "Authentication busy"))?;
    let worker = server.clone();
    let user = tokio::task::spawn_blocking(move || {
        auth::create(
            &*worker.auth.lock().map_err(|_| "Account unavailable")?,
            &input.username,
            &input.password,
            false,
        )
    })
    .await
    .map_err(internal)?
    .map_err(|e| error(StatusCode::BAD_REQUEST, &e))?;
    Ok(Json(json!({"user":user})))
}
async fn revision(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    ready(&user)?;
    let workspace = server.workspace(&user)?;
    let revision = workspace
        .lock()
        .map_err(internal)?
        .revision()
        .map_err(internal)?;
    Ok(Json(json!({"revision":revision})))
}
async fn action(
    State(server): State<Arc<Server>>,
    headers: HeaderMap,
    Json(input): Json<Action>,
) -> Result<Json<Value>, ApiError> {
    let (user, _) = server.user(&headers)?;
    ready(&user)?;
    let _permit = server
        .work_slots
        .try_acquire()
        .map_err(|_| error(StatusCode::TOO_MANY_REQUESTS, "Workspace server is busy"))?;
    let expected = headers
        .get("x-workspace-revision")
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.parse::<i64>().ok());
    let workspace = server.workspace(&user)?;
    let value = tokio::task::spawn_blocking(move || {
        workspace
            .lock()
            .map_err(|_| (500, "Workspace unavailable".into()))?
            .run(input, expected)
    })
    .await
    .map_err(internal)?
    .map_err(|(status, message)| {
        error(
            StatusCode::from_u16(status).unwrap_or(StatusCode::INTERNAL_SERVER_ERROR),
            &message,
        )
    })?;
    Ok(Json(value))
}

async fn index(State(server): State<Arc<Server>>) -> Result<Response, ApiError> {
    let html = std::fs::read_to_string(server.assets.join("index.html")).map_err(internal)?;
    let nonce = auth::random_token();
    let html = html
        .replace(
            "<head>",
            "<head><meta name=\"easyproject-web\" content=\"true\">",
        )
        .replace("<style>", &format!("<style nonce=\"{nonce}\">"));
    let mut response = Html(html).into_response();
    response.headers_mut().insert(header::CONTENT_SECURITY_POLICY,HeaderValue::from_str(&format!("default-src 'self'; script-src 'self'; style-src 'self' 'nonce-{nonce}'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'")).map_err(internal)?);
    Ok(response)
}

/// Test clients use this same service with a real socket ConnectInfo extension.
pub fn test_request(method: Method, path: &str, body: Body, origin: &str) -> Request {
    let mut request = Request::builder()
        .method(method)
        .uri(path)
        .header(header::ORIGIN, origin)
        .header("x-easyproject-request", "1")
        .header(header::CONTENT_TYPE, "application/json")
        .body(body)
        .expect("test request");
    request
        .extensions_mut()
        .insert(ConnectInfo(SocketAddr::from(([127, 0, 0, 1], 1234))));
    request
}
