use easyproject_server::{
    auth,
    http::{router, Server},
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
    let server = Server::open(root, assets, origin)?;
    let address = std::env::var("EASYPROJECT_LISTEN").unwrap_or_else(|_| "127.0.0.1:8080".into());
    let address: std::net::SocketAddr = address.parse()?;
    if !address.ip().is_loopback() {
        return Err("Bind loopback only; use an authenticated private reverse proxy".into());
    }
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
