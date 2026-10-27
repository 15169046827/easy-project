# EasyProject 本地 MCP

2026-10-27配色共享规则已在服务器远端MCP及桌面伴随程序70E303F8部署；独立artifacts/mcp仍53521FBD，等待占用的新连接停止许可，不能声称当前Codex连接已加载新规则。23工具/权限不变，契约已实际发现并同步Apifox66接口/32参考；无迁移/历史重写，详见TASK_LIST_UI_REFINEMENT_CHECKPOINT。

2026-10-27配色候选（尚未部署）：状态create省略color时，共享服务从八色集随机选择最少使用色并保存；显式自定义hex保留，不批量清理历史。八色为#3b82f6/#8b5cf6/#14b8a6/#f59e0b/#f43f5e/#06b6d4/#d946ef/#22c55e。仍保留builtin_key的Pending/InProgress/Done跨项目显示固定#64748b/#3b82f6/#22c55e，不接受显式更新为其它颜色；需自定义则先明确重命名为自定义状态。旧库不自动改写，完成语义仍依is_completed，不能从颜色或文字推断。当前实际部署仍70ad16e，见TASK_LIST_UI_REFINEMENT_CHECKPOINT。

2026-10-26实际交付：本机及服务器业务schema8/账号3，独立及伴随release MCP源47b981d clean、SHA1E8840C2...已安全更新并完成真实23工具只读发现/DB SHA不变；当前客户端须重连。下方“父子候选未部署”是历史，实际保护副本/原字段与ID核验见PARENT_CHILD_TASK_DISCUSSION顶部。

2026-10-26远端安全已启用（后端31d9b7c）：远端HTTP MCP的业务变更受共享工作区/服务池写入准入预算约束，超限在恢复点/审计/revision及业务写入之前拒绝，并保留查询能力；`isError=true`返回安全容量说明，不扩大权限或返回他人用量。默认512MiB工作区/8GiB服务池包含副本及恢复余量，非OS硬配额、无自动清理；详见server/deploy/STORAGE_BUDGET.md。不改变本地stdio工具schema或引入本地配额；精确部署/核验以NEXT_PHASE_CHECKPOINT为准。

## 2026-10-25父子任务与估算来源候选（未部署）

业务schema8、JSON8；独立MCP不自行迁移，schema7真实库与现有程序不变，须另获升级授权。新增task参数`effort_state`仅允许`unestimated`/`estimated`；不传工作量为待估算，显式`effort_days:0`为已估算且无工作量，清除可传`effort_state:unestimated`。`legacy_unknown`只用于保留旧0来源，不接受普通写入。所有字段仍共享服务端校验。

task get/list返回`effort_state`及`summary`：has_children/direct_child_count/completed_child_count/effort_days/progress（可null）/unestimated_count/legacy_unknown_count/start_time/end_time/schedule_incomplete。父任务顶层progress、effort_days、日期由后代递归汇总，不重复计父手填值；零权重summary.progress=null，不应把兼容整数progress=0当成真实0%。父进度/工作量/日期为只读，不可传入update；状态仍人工确认，100%不自动完成。父完成须所有后代完成；完成祖先下新增/移动/重开子项须先显式重开祖先，不自动猜状态；状态字典完成属性更改同样受约束，拒绝会回滚。

task_list可选`hierarchy:true`，缺省false保持平铺分页；true按顶层分页，list含当页根的匹配后代和必要祖先，context_only标识未命中的父级上下文。total/totalPage按根计算，statistics.top_level/all_tasks分别返回total及带项目ID/状态ID/name/builtin_key/color/count的statuses；全部任务只计命中项。模板/导入也检查完成约束，JSON1—7导入保留旧值并标记历史0待确认。权限工具数仍9/18/23，不扩大权限。

当前契约说明为开发候选；catalog、原生接口分组和私有Apifox尚待绑定新隔离二进制生成/同步/读回，不能把旧release来源当本候选已同步。真实安装和客户端配置未变。

2026-10-23实际更新：业务schema7已在保护副本及逐字段核验后迁移，独立与安装侧MCP均为release 765B4C33330442DC947B76DE58747FEFF0EB78181B8738481B980E72C5FC70DF（构建源1640e31）。新进程tools/list实际发现23工具且真实库SHA不变；原有write/delete开关未扩大。当前Codex需要重连/重启重新发现；MCP仍不自行迁移。下方18工具/schema6为历史，当前语义以本段及状态专项为准。

## 2026-10-23项目状态字典候选（未替换已安装程序）

新增`easyproject_task_status_list/get/create/update/delete`，只读9工具、可写18、完整23。list必填projectId；create数据须project_id/name，可选color/sort_order/is_completed/is_default；update变更不允许移动项目。get返回record和首50条usage（含total），更多冲突由IPC get_usage分页读取；delete使用id与精确confirm_name，任何任务引用（含软删除）均拒绝，默认/最后状态也拒绝。写前恢复点、事务、脱敏审计、审批及账号隔离不变。

MCP task_create必须提供`data.status_id`，仅接受当前项目已有且活跃状态ID；文字status不再是MCP参数，不隐式新建。先list发现、需要时显式create状态，再创建任务。跨项目移动任务须显式提供目标项目status_id。重命名不改ID；自定义完成状态通过is_completed布尔控制。默认三项不是固定父分类。新程序只接受schema7且不迁移；当前已安装18工具/schema6与当前客户端目录不因源码更新而变化，须获批迁移及更新后重连。

2026-10-22本机独立程序已按用户批准更新至兼容schema6的新构建，SHA256 EC9C6EFEF361166B25FFD57AF48F12886A81AACF4DFCA33E9D60047466049420；E盘原库已保护迁移，原配置路径和18工具权限不变。须重连/重启Codex后加载；独立进程握手发现18项与真实库SHA不变通过，不等于当前聊天已重连。旧schema5程序不能读取schema6，MCP本身仍不迁移/创建数据库，详见账号资料专项检查点。

第一版提供项目、任务、人员的分页列表/单条查询/新建/修改/软删除，以及项目团队成员列表、加入和退出（18个工具）。独立stdio进程，无HTTP监听、云端账号或自动启动；关闭桌面程序后仍可使用已有数据库。

## 连接与权限

2026-10-20当前本机选择：用户明确要求完整增删改查，Codex同名easyproject配置已加入`--allow-write --allow-delete`，数据库为当前E盘安装侧data。18工具发现与实际交付exe的E盘隔离CRUD/default-denial复验通过，未调用真实库增删改，客户端审批策略未变；当前聊天旧工具目录需重连/必要时重启后重新发现。此前只读是接入时的权限选择，不是功能缺失。准确证据见[CRUD启用检查点](MCP_CRUD_ENABLEMENT_CHECKPOINT.md)。

MCP客户端需支持本地stdio并允许配置可执行文件与参数。默认只读，仅发现7个查询工具；`--allow-write`增加创建/修改/加入团队，`--allow-delete`同时要求写入开关，增加删除/退出工具。开关是对该客户端整个会话的权限授权，不是每次操作的人工确认；应在客户端保留工具调用审批，尤其是删除。只接入可信客户端：查询结果包含项目内容、人员邮箱/电话，客户端可能将这些发送给模型服务。

客户端配置示例（模板，替换两条绝对路径；数据库以桌面数据页显示为准）：

```json
{
    "mcpServers": {
        "easyproject": {
            "command": "E:/Project/Project/easy-project/artifacts/mcp/easyproject-mcp.exe",
            "args": [
                "--database",
                "E:/EasyProject/data/project_manager.db",
                "--allow-write",
                "--allow-delete"
            ]
        }
    }
}
```

要只读，删除两个allow参数。默认安装侧`data/project_manager.db`，数据页可设置非C盘目录并于重启受控迁移；旧AppData仅历史。独立MCP不会随桌面设置自动改参数，不负责迁移。新程序拒绝相对路径、不存在/非`.db`或非schema-v6的库，不建空库、不猜路径。新建库先用桌面初始化；旧库升级先制作副本并由桌面迁移，不能用旧schema5程序读新库。

初次开发交付不改客户端的限制是历史阶段；10-20用户已明确授权本机当前连接启用CRUD，不因此自动更新独立exe或其它客户端。第一版建议写入会话期间关闭桌面程序，结束会话后重新打开查看结果。新代码的实体写入共用SQLite `BEGIN IMMEDIATE`和服务校验，跨进程写锁等待最多5秒；不要同时导入/恢复或用旧版桌面编辑。页面不是实时订阅，读取到旧列表时重新进入页面或重启。没有网络鉴权令牌，保护边界是本机账户权限、显式启动和客户端审批，并不防御拥有同账户文件访问权的其它程序。

## 工具契约

### 受控字典与写入校验（2026-10-24源码候选）

以下约束由同一共享Rust边界执行，MCP工具schema也公开枚举；桌面IPC、Web action和显式导入不能绕过。候选不代表当前连接中的旧程序已更新。

| 字段                           | 允许值/规则                                                                                                                                                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| task.priority                  | 字符串`1`、`2`、`3`、`4`、`5`（1最高）；兼容`High`=2、`Normal`=3、`Low`=4。新调用推荐数字字符串；不能传数字或Urgent等任意标签                                                                                     |
| task.type                      | `Task`、`Milestone`、`File`                                                                                                                                                                                       |
| task.schedule_mode             | `fixed_effort`、`fixed_dates`                                                                                                                                                                                     |
| task.status_id                 | 必须显式引用本项目已有且有效的完整TASK_STATUS ID；不能写status文字或隐式建状态                                                                                                                                    |
| project.type                   | `private`、`public`（项目展示属性，不是服务端授权）                                                                                                                                                               |
| project.status                 | `Draft`、`InProgress`、`Paused`、`Done`、`Archived`                                                                                                                                                               |
| task.progress / effort_days    | 0—100整数 / 非负有限数值；完成字典属性决定进度100                                                                                                                                                                 |
| task_status                    | name去首尾空格、同项目忽略大小写查重，默认状态同时保留中英西显示别名冲突校验（Pending/待办/Pendiente，InProgress/In Progress/进行中/En curso，Done/已完成/Completada）；不同项目可同名。别名不是写入status_id的替代值，不按名称猜测完成语义。color为#RRGGBB，sort_order整数0—1000000，两标记必须布尔值 |
| project.weekend_days           | JSON数组字符串，元素为0—6整数（0星期日）；如`[0,6]`                                                                                                                                                               |
| project.calendar_exceptions    | JSON数组字符串，元素含标准`date`和`type=holiday或working`，可选自由文本name                                                                                                                                       |
| member.availability_exceptions | JSON数组字符串，元素含标准start_date/end_date且起<=止，type为`leave`或`available`；可保留name/source/source_uid等元信息                                                                                           |

日期为真实且规范的YYYY-MM-DD；成员role/团队role是自由文本标签，不是权限枚举。calendar_country/calendar_region是节日日历库配置而非任务状态字典；不支持的配置不据此产生账号权限。自由文本仍受工具长度/类型限制；未知字段拒绝，ID/人员/父子/团队关系仍须服务端核验。

重复状态新增/重命名失败时保留原状态和任务引用，UI保留草稿。历史重复或字典外值不自动删除、合并、猜测映射；可在管理页逐项重命名，在任务编辑中选择合法值。导入含非法枚举或重复状态时整次回滚；备份与旧库读取不因此被禁止。服务端远端错误保持脱敏，先刷新读取，不盲目重试写入。

### Codex 本机接入

2026-10-09经用户授权，已在本机Codex新增全局`easyproject`只读stdio配置；2026-10-10用户重启后，本聊天已加载7个查询工具，并完成项目/任务/人员/团队查询、分页和不存在记录错误分支验收。未启用写入/删除，未修改真实项目数据。之前开发交付阶段“不修改客户端配置”的范围已由本次明确授权改变。详细证据：[Codex接入验收](MCP_CODEX_ACCEPTANCE.md)。

其它设备可使用下列模板（替换数据库路径）：

```powershell
codex mcp add easyproject -- E:/Project/Project/easy-project/artifacts/mcp/easyproject-mcp.exe --database E:/EasyProject/data/project_manager.db --allow-write --allow-delete
codex mcp get easyproject --json
```

上例为用户明确授权后的完整CRUD；只读连接去掉两个allow开关。配置成功不等于已有聊天已加载；重新加载MCP连接，必要时重启客户端，再发现工具并仅查询验证，不拿真实库做CRUD演练。不要仅为测试或替其它未授权客户端自动添加权限。客户端配置格式不同不影响通用MCP业务契约。[Codex官方说明](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)。

`entity`为`project`、`task`、`member`；完整字段以`tools/list`的严格`inputSchema`为准，不接受未知字段、空白名称、错误类型或越界进度。列表只返回活跃记录，分页最多100条，默认沿用实体服务的页大小。

| 工具                                | 参数                                          |
| ----------------------------------- | --------------------------------------------- |
| `easyproject_<entity>_list`         | 可选pageIndex/pageSize；任务可按projectId过滤 |
| `easyproject_<entity>_get`          | id                                            |
| `easyproject_<entity>_create`       | data；name必填，任务另需project_id            |
| `easyproject_<entity>_update`       | id、非空changes；可选expected_update_time     |
| `easyproject_<entity>_delete`       | id、与当前名称完全一致的confirm_name          |
| `easyproject_project_member_list`   | projectId，返回包含关系id的团队列表           |
| `easyproject_project_member_create` | data含project_id、member_id，可选role         |
| `easyproject_project_member_delete` | 关系id、confirm_member_name                   |

创建示例：

```json
{"name":"easyproject_project_create","arguments":{"data":{"name":"新版开发"}}}
{"name":"easyproject_member_create","arguments":{"data":{"name":"小李","role":"Developer"}}}
{"name":"easyproject_project_member_create","arguments":{"data":{"project_id":"PROJECT:返回的ID","member_id":"MEMBER:返回的ID"}}}
{"name":"easyproject_task_status_list","arguments":{"projectId":"PROJECT:返回的ID"}}
{"name":"easyproject_task_create","arguments":{"data":{"name":"实现功能","project_id":"PROJECT:返回的ID","status_id":"TASK_STATUS:查询返回的完整ID","priority":"3","assignee":"MEMBER:返回的ID","end_time":"2026-10-20"}}}
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
