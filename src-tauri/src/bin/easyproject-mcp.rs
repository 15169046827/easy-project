fn main() {
    if let Err(error) = easy_project_lib::mcp::run_cli() {
        eprintln!("EasyProject MCP: {error}");
        std::process::exit(1);
    }
}
