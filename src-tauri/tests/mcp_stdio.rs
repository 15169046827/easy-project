//! Real subprocess interoperability tests; all data stays in a uniquely generated fixture.
use easy_project_lib::common::db_state::init_db;
use serde_json::{json, Value};
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::mpsc::{channel, Receiver};
use std::time::Duration;

struct Client {
    child: Child,
    input: ChildStdin,
    output: Receiver<Value>,
    directory: PathBuf,
}
impl Client {
    fn new(write: bool) -> Self {
        let directory =
            std::env::temp_dir().join(format!("easyproject-mcp-process-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&directory).unwrap();
        drop(init_db(&directory.join("workspace.db")).unwrap());
        let binary = std::env::var_os("EASYPROJECT_MCP_TEST_BINARY")
            .map(PathBuf::from)
            .unwrap_or_else(|| PathBuf::from(env!("CARGO_BIN_EXE_easyproject-mcp")));
        let mut command = Command::new(binary);
        command
            .arg("--database")
            .arg(directory.join("workspace.db"));
        if write {
            command.args(["--allow-write", "--allow-delete"]);
        }
        let mut child = command
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .unwrap();
        let input = child.stdin.take().unwrap();
        let stdout = child.stdout.take().unwrap();
        let (send, output) = channel();
        std::thread::spawn(move || {
            for line in BufReader::new(stdout).lines() {
                let Ok(line) = line else {
                    break;
                };
                let value = serde_json::from_str::<Value>(&line)
                    .expect("stdout must contain only JSON-RPC");
                if send.send(value).is_err() {
                    break;
                }
            }
        });
        Self {
            child,
            input,
            output,
            directory,
        }
    }
    fn send(&mut self, message: Value) {
        writeln!(self.input, "{message}").unwrap();
        self.input.flush().unwrap();
    }
    fn request(&mut self, id: i64, method: &str, params: Value) -> Value {
        self.send(json!({"jsonrpc":"2.0","id":id,"method":method,"params":params}));
        let response = self
            .output
            .recv_timeout(Duration::from_secs(10))
            .expect("MCP response timed out");
        assert_eq!(response["id"], id);
        response
    }
    fn handshake(&mut self) {
        let initialized=self.request(1,"initialize",json!({"protocolVersion":"2025-11-25","clientInfo":{"name":"integration","version":"1"},"capabilities":{}}));
        assert_eq!(initialized["result"]["protocolVersion"], "2025-11-25");
        self.send(json!({"jsonrpc":"2.0","method":"notifications/initialized"}));
    }
    fn tool(&mut self, id: i64, name: &str, arguments: Value) -> Value {
        self.request(id, "tools/call", json!({"name":name,"arguments":arguments}))["result"].clone()
    }
}
impl Drop for Client {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
        let _ = std::fs::remove_dir_all(&self.directory);
    }
}

#[test]
fn real_stdio_supports_entity_crud_and_default_permission_denial() {
    let mut client = Client::new(true);
    client.handshake();
    let catalog = client.request(2, "tools/list", json!({}));
    assert_eq!(catalog["result"]["tools"].as_array().unwrap().len(), 18);
    let project = client.tool(
        3,
        "easyproject_project_create",
        json!({"data":{"name":"Integration"}}),
    );
    assert_eq!(project["isError"], false);
    let pid = project["structuredContent"]["record"]["id"].clone();
    for (offset, model, data) in [
        (10, "member", json!({"name":"Person"})),
        (20, "task", json!({"name":"Work","project_id":pid})),
    ] {
        let created = client.tool(
            offset,
            &format!("easyproject_{model}_create"),
            json!({"data":data}),
        );
        assert_eq!(created["isError"], false);
        let id = created["structuredContent"]["record"]["id"].clone();
        let get = client.tool(
            offset + 1,
            &format!("easyproject_{model}_get"),
            json!({"id":id}),
        );
        assert_eq!(get["isError"], false);
        let list = client.tool(
            offset + 2,
            &format!("easyproject_{model}_list"),
            json!({"pageSize":1}),
        );
        assert_eq!(list["structuredContent"]["total"], 1);
        let update = client.tool(
            offset + 3,
            &format!("easyproject_{model}_update"),
            json!({"id":id,"changes":{"name":"Changed"}}),
        );
        assert_eq!(update["isError"], false);
        let delete = client.tool(
            offset + 4,
            &format!("easyproject_{model}_delete"),
            json!({"id":id,"confirm_name":"Changed"}),
        );
        assert_eq!(delete["isError"], false);
    }
    assert_eq!(
        client.tool(
            30,
            "easyproject_project_update",
            json!({"id":pid,"changes":{"name":"Project changed"}})
        )["isError"],
        false
    );
    assert_eq!(
        client.tool(
            31,
            "easyproject_project_delete",
            json!({"id":pid,"confirm_name":"Project changed"})
        )["isError"],
        false
    );
    let mut readonly = Client::new(false);
    readonly.handshake();
    assert_eq!(
        readonly.tool(
            3,
            "easyproject_member_create",
            json!({"data":{"name":"Denied"}})
        )["isError"],
        true
    );
    assert!(!readonly.directory.join("mcp-audit.jsonl").exists());
}
