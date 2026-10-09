# EasyProject 本地 MCP

第一版提供项目、任务、人员的分页列表/单条查询/新建/修改/软删除，以及项目团队成员列表、加入和退出（18个工具）。独立stdio进程，无HTTP监听、云端账号或自动启动；关闭桌面程序后仍可使用已有数据库。

## 连接与权限

MCP客户端需支持本地stdio并允许配置可执行文件与参数。默认只读，仅发现7个查询工具；`--allow-write`增加创建/修改/加入团队，`--allow-delete`同时要求写入开关，增加删除/退出工具。开关是对该客户端整个会话的权限授权，不是每次操作的人工确认；应在客户端保留工具调用审批，尤其是删除。只接入可信客户端：查询结果包含项目内容、人员邮箱/电话，客户端可能将这些发送给模型服务。

客户端配置示例（模板，替换两条绝对路径；不要直接复制YOUR_USER）：

```json
{
  "mcpServers": {
    "easyproject": {
      "command": "E:/Project/Project/easy-project/artifacts/mcp/easyproject-mcp.exe",
      "args": [
        "--database",
        "C:/Users/YOUR_USER/AppData/Roaming/com.easyproject.desktop/project_manager.db",
        "--allow-write",
        "--allow-delete"
      ]
    }
  }
}
```

要只读，删除两个allow参数。数据库是现有应用数据，不是程序安装目录；程序构建/交付在E盘，既有Windows应用数据目录没有迁移。服务拒绝相对路径、不存在的库、非`.db`、不是schema-v5的库，不创建空库或自动迁移，不猜测数据库路径。启动前先用桌面程序初始化一次。

本轮不会修改本机任何MCP客户端配置；已安装旧桌面版也不会自动更新。第一版建议写入会话期间关闭桌面程序，结束会话后重新打开查看结果。新代码的实体写入共用SQLite `BEGIN IMMEDIATE`和服务校验，跨进程写锁等待最多5秒；不要同时导入/恢复或用旧版桌面编辑。页面不是实时订阅，读取到旧列表时重新进入页面或重启。没有网络鉴权令牌，保护边界是本机账户权限、显式启动和客户端审批，并不防御拥有同账户文件访问权的其它程序。

## 工具契约

`entity`为`project`、`task`、`member`；完整字段以`tools/list`的严格`inputSchema`为准，不接受未知字段、空白名称、错误类型或越界进度。列表只返回活跃记录，分页最多100条，默认沿用实体服务的页大小。

| 工具 | 参数 |
| --- | --- |
| `easyproject_<entity>_list` | 可选pageIndex/pageSize；任务可按projectId过滤 |
| `easyproject_<entity>_get` | id |
| `easyproject_<entity>_create` | data；name必填，任务另需project_id |
| `easyproject_<entity>_update` | id、非空changes；可选expected_update_time |
| `easyproject_<entity>_delete` | id、与当前名称完全一致的confirm_name |
| `easyproject_project_member_list` | projectId，返回包含关系id的团队列表 |
| `easyproject_project_member_create` | data含project_id、member_id，可选role |
| `easyproject_project_member_delete` | 关系id、confirm_member_name |

创建示例：

```json
{"name":"easyproject_project_create","arguments":{"data":{"name":"新版开发"}}}
{"name":"easyproject_member_create","arguments":{"data":{"name":"小李","role":"Developer"}}}
{"name":"easyproject_project_member_create","arguments":{"data":{"project_id":"PROJECT:返回的ID","member_id":"MEMBER:返回的ID"}}}
{"name":"easyproject_task_create","arguments":{"data":{"name":"实现功能","project_id":"PROJECT:返回的ID","assignee":"MEMBER:返回的ID","end_time":"2026-10-20"}}}
```

创建响应的record含实际生成ID；示例ID是占位符。project.owner是人员ID，自动加入项目团队；其它任务负责人须先加入团队。已完成任务保持100%进度。任务日期只接受空值或标准YYYY-MM-DD，不做时区转换。calendar_exceptions、weekend_days、availability_exceptions目前沿用项目原生JSON数组字符串格式。MCP不暴露原始SQL、依赖写入、模板、导入、恢复、文件路径操作或批量删除。

删除为软删除，不自动级联：有活跃任务的项目、拥有子任务的任务、仍有负责人/分配/团队关联的人员，以及仍为项目负责人或任务负责人的团队关系都会拒绝。先重分配、移出团队或删除关联任务，再执行单条删除。删除前先get/list确认名称；名称确认是服务端匹配保护，不代表真人已批准。可选expected_update_time能检测部分过期编辑，但时间戳精度为秒，不是严格版本号/CAS；需要强并发编辑冲突检测时另加版本机制。

跨项目移动任务时，如果仍有活跃子任务、依赖边或基线记录，会拒绝以保护项目聚合及基线归属；先在桌面功能中解除关联。没有这些关联的任务仍可修改project_id。

## 恢复点与审计

每次通过参数校验的写入尝试先保存`backups/easy-project-mcp-时间-UUID.db`，完整性/schema检查成功后才执行；失败写入回滚。业务关联拒绝也可能保留恢复点。MCP恢复点不自动删除，需按实际存储容量管理；恢复操作仍通过桌面数据管理页人工预览，不由MCP执行。

库同目录`mcp-audit.jsonl`记录操作ID、时间、实体/动作/目标ID和attempt/committed/rejected，不记录名称、评论、邮箱、电话或完整参数。超过10MiB后停止新写入，先归档再继续；审计失败或备份失败不开始修改。提交后审计失败会报告操作ID和已提交状态：不得盲目重试，先get确认。写入不是幂等接口，自动重试可能重复新建；传输中断时同样先查询/核对审计记录。stdout仅协议JSON，错误诊断使用stderr；单消息上限256KiB。

## 构建与验证

从仓库根目录执行：

```powershell
cargo build --manifest-path src-tauri/Cargo.toml --locked --release --bin easyproject-mcp
cargo test --manifest-path src-tauri/Cargo.toml --locked
cargo clippy --manifest-path src-tauri/Cargo.toml --locked --all-targets -- -D warnings
```

Windows程序位于`src-tauri/target/release/easyproject-mcp.exe`（自定义CARGO_TARGET_DIR时以该目录为准）。本轮另复制到E盘`artifacts/mcp`交付目录，独立于NSIS，不会伪称已经随旧安装包安装。程序为控制台子进程，MCP客户端应隐藏启动窗口；它不改变桌面应用无控制台的入口。

可用`scripts/package-mcp.ps1`构建并复制Windows交付程序、本文和含提交/脏工作区标记/SHA256的清单到`artifacts/mcp`；已有本轮验证过的release程序可用`-SkipBuild`仅打包。生成目录不提交Git，不自动安装或修改客户端配置。不要拿未经重建的旧程序搭配新提交清单，复制操作本身不能证明构建来源。

协议支持2025-03-26/2025-06-18/2025-11-25的initialize握手族（请求其它版本时返回2025-11-25，客户端必须接受或断开），不声称实现2026-07-28的新无状态协议。协议依据：[stdio传输](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)、[生命周期](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle)、[工具规范](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)。真实子进程测试验证握手、发现、CRUD和默认拒绝，隔离库测试验证恢复点/事务/人员约束；还不代表所有第三方MCP客户端或Mac/Linux已验收。正式发布/签名状态仍独立记录。
