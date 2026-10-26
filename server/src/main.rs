use easyproject_server::{
    auth,
    http::{router, Server, ServerOptions},
    rate_limit::ProxyPolicy,
    storage_budget::StorageBudget,
};
use std::{
    io::{self, Read},
    path::PathBuf,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let root = PathBuf::from(std::env::var("EASYPROJECT_DATA_DIR")?);
    if !root.is_absolute() {
        return Err("EASYPROJECT_DATA_DIR must be absolute".into());
    }
    if std::env::args().nth(1).as_deref() == Some("check-storage") {
        let count =
            easyproject_server::storage_budget::check_existing(&root, storage_budget_settings()?)
                .map_err(|error| error.message())?;
        println!("Existing workspace budget check passed: {count} workspaces");
        return Ok(());
    }
    if std::env::args().nth(1).as_deref() == Some("migrate-storage") {
        let count = easyproject_server::maintenance::migrate_existing(&root)?;
        println!("Existing storage migrated and validated: {count} workspaces");
        return Ok(());
    }
    if std::env::args().nth(1).as_deref() == Some("issue-reset-code") {
        if !root.join("accounts.db").is_file() {
            return Err("Existing account database required".into());
        }
        let username = std::env::args().nth(2).ok_or("Username required")?;
        let mut db = auth::open(&root.join("accounts.db"))?;
        let code = auth::issue_password_reset(&mut db, &username)?;
        println!("One-time reset code (15 minutes; shown once): {code}");
        return Ok(());
    }
    if std::env::args().nth(1).as_deref() == Some("bootstrap-admin") {
        std::fs::create_dir_all(&root)?;
        let username = std::env::args().nth(2).ok_or("Username required")?;
        let db = auth::open(&root.join("accounts.db"))?;
        if !auth::list(&db)?.is_empty() {
            return Err("Bootstrap only allowed for an empty account database".into());
        }
        let mut password = String::new();
        io::stdin().take(1024).read_to_string(&mut password)?;
        auth::create(&db, &username, password.trim_end(), true)?;
        println!("Administrator created; initial password change is required");
        return Ok(());
    }
    let assets = PathBuf::from(std::env::var("EASYPROJECT_ASSETS_DIR")?);
    let origin = std::env::var("EASYPROJECT_ORIGIN")?;
    let address = std::env::var("EASYPROJECT_LISTEN").unwrap_or_else(|_| "127.0.0.1:8080".into());
    let address: std::net::SocketAddr = address.parse()?;
    if !address.ip().is_loopback() {
        return Err("Bind loopback only; use an authenticated private reverse proxy".into());
    }
    let proxy_setting = std::env::var_os("EASYPROJECT_TRUSTED_PROXY")
        .map(|value| {
            value
                .into_string()
                .map_err(|_| "Proxy policy must be UTF-8")
        })
        .transpose()?;
    let proxy_policy = ProxyPolicy::parse(proxy_setting.as_deref())?;
    let storage_budget = storage_budget_settings()?;
    let server = Server::open_with_options(
        root,
        assets,
        origin,
        ServerOptions {
            proxy_policy,
            storage_budget,
        },
    )?;
    let listener = tokio::net::TcpListener::bind(address).await?;
    println!("EasyProject headless server listening on loopback");
    axum::serve(
        listener,
        router(server).into_make_service_with_connect_info::<std::net::SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal())
    .await?;
    Ok(())
}

fn storage_budget_settings() -> Result<StorageBudget, Box<dyn std::error::Error>> {
    let setting = |name| {
        std::env::var_os(name)
            .map(|value| {
                value
                    .into_string()
                    .map_err(|_| "Storage budget must be UTF-8")
            })
            .transpose()
    };
    let workspace = setting("EASYPROJECT_WORKSPACE_BUDGET_BYTES")?;
    let data = setting("EASYPROJECT_DATA_BUDGET_BYTES")?;
    Ok(StorageBudget::from_settings(
        workspace.as_deref(),
        data.as_deref(),
    )?)
}

async fn shutdown_signal() {
    let interrupt = tokio::signal::ctrl_c();
    #[cfg(unix)]
    let terminate = async {
        match tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate()) {
            Ok(mut signal) => {
                signal.recv().await;
            }
            Err(_) => std::future::pending::<()>().await,
        }
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();
    tokio::select! { _ = interrupt => {}, _ = terminate => {} }
}
