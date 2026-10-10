# 本地MCP开发检查点

日期：2026-10-09。目标：本地stdio MCP，项目/任务/人员增删改查，复用Rust业务规则，无HTTP端口或自动启用。

- 标准：项目维护及既有质量门禁、UPARS1.1.0；WACAS未定义/待确认。
- 基线：codex/audit-release-20261006-api / 2a74a2b2c7b6819e662f98c2d8c0377526ef815f，开始工作区干净。
- 额度：五小时剩余88%、周66%；长期10%门禁、所有窗口5%硬底线继续，未重置或定时唤醒。
- 范围：独立程序显式数据库路径，默认只读；显式启用写入及删除，删除目标名称确认；写前备份，操作审计记录不存业务正文或联系方式；不暴露SQL/导入/恢复接口。
- 已完成：显式本地stdio协议、18工具目录/严格参数契约、默认只读及写入/删除开关、名称确认、共享DbState服务与原子写入边界、写前完整性校验恢复点和脱敏审计。增加团队列表/加入/退出，使分配任务及人员关联解除不依赖直接SQL。修复Done任务仅更新progress可低于100的共享服务问题。
- 验证里程碑：38项Rust单元测试+1项真实stdio子进程CRUD集成测试、Clippy零警告通过；包括跨连接写锁、失败回滚、默认拒绝、审计/备份失败拒绝写入、固定输出字段不泄露未来列和备份完整性。178前端单测/36文件、24生产浏览器回归、9项1000任务专项、类型/ESLint零警告/Rust格式/生产构建/发布配置/UPARS验证通过，既有大chunk警告保留。首次CRUD测试因正确的团队关联阻止人员删除失败，补团队退出工具后按业务顺序复验通过，未关闭校验。完成Done进度及跨项目移动孩子/依赖/基线归属的共享服务整改和对应复验。
- 未提交范围：.gitignore；scripts/package-mcp.ps1；src-tauri/Cargo.toml；src-tauri/src/cmds/crud_action.rs；src-tauri/src/db/{member_db,plan_baseline_db,project_db,project_member_db,task_db,task_dependency_db}.rs；src-tauri/src/lib.rs；src-tauri/src/services/{calendar_service,data_service,member_service,mod,plan_baseline_service,project_member_service,project_service,task_dependency_service,task_service,entity_api}.rs；src-tauri/src/bin/easyproject-mcp.rs；src-tauri/src/mcp/{mod,protocol,tools,tests}.rs；src-tauri/tests/mcp_stdio.rs；docs/MCP.md；docs/MCP_CHECKPOINT.md；docs/PROJECT_PLAN.md；README.md；CHANGELOG.md。恢复时以git status --untracked-files=all核对，保护新增其它用户文件。仅忽略生成的artifacts/mcp交付目录，不忽略源码、测试或门禁。
- 本地交付：MCP release已构建；最终Tauri构建会同时重编译MCP，因此以最终文件而非先前构建摘要为准，正在对最终文件再次执行隔离stdio验收。MCP SHA256 `8C11FCDFAA263BBA8E9AE52F7FE9F6162737D44A075F15FEF589EC01C50AD5B3`，3124736字节；NSIS `src-tauri/target/release/bundle/nsis/EasyProject_0.1.0_x64-setup.exe` SHA256 `1966162237D5CDCF0CAA24946614E6B4709F76A2495000B9E16E823A40A3D054`。未安装、未签名、未覆盖原内部Release草稿。
- 准确下一步：最终release子进程通过后提交/sync Git，使用package-mcp.ps1 -SkipBuild将已验证程序及文档复制到E盘artifacts/mcp并摘要核对；同步Wolai与最终检查点。随后由用户选择可信客户端接入，按权限开启；真实库不自动测试，Mac/全部客户端兼容与正式发布仍未验。
- 里程碑额度：五小时77%、周64%，允许进入构建阶段；不重置。
- 构建后额度：五小时71%、周64%，仍满足门禁，无重置或自动唤醒。
- 数据：不删除或修改当前用户数据；当前应用和原Release草稿不替换。测试仅用E盘隔离库。
- 设备：仅本开发Windows；Mac/干净设备未连接。原生预览工具因sandbox helper失败不可用，MCP协议可用子进程隔离验证。
- 文档同步：本地开始检查点已保存，Wolai尚为悬浮窗阶段；里程碑同步并读回。原正式发布未通过结论不变。

## 最终验证里程碑

- 39项Rust单元测试+1项真实stdio集成测试通过；团队加入/重复拒绝/任务分配/安全退出分支已补齐。Clippy零警告、Rust格式、diff检查通过。最终Tauri构建后的MCP文件（上述8C11…摘要）再次通过release真实子进程CRUD与默认拒绝验收，未用之前已被重编译的文件冒充。
- 桌面生产构建及NSIS成功；178单测、24生产浏览器回归、9专项及完整既有门禁成功。没有新增依赖或修改Cargo.lock，没有关闭检查/删除测试。
- 下一步仅保存提交并同步Git/Wolai、运行交付脚本核对复制摘要；随后等待用户选择可信MCP客户端接入。客户端授权、版本兼容和真实库写入演练不在本轮自动执行范围。测试库均为E盘唯一隔离目录，不改变当前用户项目数据。
- 原安装程序和内部Release草稿不变，原生安装/置顶交互、Mac/独立设备/签名、公证/正式发布仍未通过；当前代码增量验证不能替代上述验收。

## 交付与同步闭环

- 代码/契约/测试提交`e534644007bdd3a593d2887f0ab5d0acf9ad6ed3`（32文件）已同树/同SHA非强制同步GitHub；提交后工作区干净，无未提交文件。当前追加仅为最终检查点文档，不改变构建源码。
- `artifacts/mcp/easyproject-mcp.exe`、`MCP.md`、`manifest.json`已在E盘生成；清单sourceCommit=e534644、worktreeDirty=false，复制后的程序摘要与最终已实测release文件一致。MCP未包含在NSIS中，单独交付，不伪称随安装自动配置。
- Wolai状态块`28dPKMDkPpLCFu557s8exF`已同步MCP范围、权限/风险、验证、摘要、Git和准确下一步，并读回确认（version36）。本地README/CHANGELOG/计划/接入文档已同步。
- 最后额度五小时69%、周63%，未重置/定时唤醒。设备仍仅本开发Windows；没有修改真实库、安装程序或任何客户端配置。
- 下一步：选择并配置可信stdio客户端，先只读发现/查询，再按用户授权启用写入/删除及客户端审批。真实数据演练和平台验收单独安排，当前正式发布仍未通过。

## Codex 本机接入检查点（2026-10-09）

- 目标与范围：用户授权接入当前Codex；仅本地stdio配置、真实Codex握手/工具发现，不修改项目数据，不启用写入/删除，不安装或重启桌面程序。
- 标准：项目维护及额度门禁；WACAS未定义/待确认，既有UPARS1.1.0，非新一轮完整审计。
- 基线：codex/audit-release-20261006-api / 6bbebcebde92bd725cd845a778cf37f5e9fe5e72；开始工作区干净。
- 已完成：官方CLI新增全局easyproject服务器。command=E:/Project/Project/easy-project/artifacts/mcp/easyproject-mcp.exe；数据库=C:/Users/Canace/AppData/Roaming/com.easyproject.desktop/project_manager.db；仅--database参数，无allow-write/allow-delete，未覆盖其它服务器配置。
- 复验：程序SHA256仍为8C11FCDFAA263BBA8E9AE52F7FE9F6162737D44A075F15FEF589EC01C50AD5B3；数据库存在；codex mcp get读回正确。本机Codex app-server的mcpServerStatus/list发现7个只读工具，无create/update/delete。authStatus=unsupported表示本地stdio不采用网络认证；runtimeStatus=null，该库存查询不证明当前聊天已加载。
- 未验证：未发起真实数据查询或写入，未发起模型请求；当前聊天工具列表未包含新增服务器，需重新加载连接后验证实际调用。其它平台/客户端仍未实测，正式发布结论不变。
- 未提交文件：docs/MCP_CHECKPOINT.md、docs/MCP.md。诊断脚本/协议生成文件位于已忽略src-tauri/target/audit-tools，不纳入源码或发布包；全局Codex用户配置不提交Git。
- 准确下一步：Codex重新加载MCP连接（必要时重启客户端）后，调用一次easyproject_project_list验证当前聊天查询。保持只读，不自动开始真实库写入演练。
- 文档同步：本地检查点及Codex说明已更新；本轮未同步Wolai、提交或推送Git。
- 额度：开始五小时剩余63%、周62%，满足门禁；未重置、定时唤醒或创建新聊天。
- 设备：仅本Windows开发机；真实Codex子进程工具发现成功，当前聊天热加载未确认；Mac/干净设备未连接。

## Codex 只读验收完成（2026-10-10）

- 目标与范围：完成当前客户端只读工具验收及隔离交付程序回归；不启用真实库写入/删除，不安装或发布产品。WACAS未定义/待确认，项目维护及既有UPARS1.1.0适用。
- 基线与分支：6bbebcebde92bd725cd845a778cf37f5e9fe5e72 / codex/audit-release-20261006-api。开始未提交docs/MCP.md及docs/MCP_CHECKPOINT.md为上一接入阶段保留修改，已续接，没有覆盖其它用户改动。
- 已完成：用户重启后，本聊天7只读工具全部调用，项目/任务单条读取、人员/团队空集、人员不存在ID错误、任务过滤与分页通过。现库1项目/5任务/0人员，仅记录统计，不将业务正文同步外部文档。
- 复验：交付SHA256未变；真实Codex配置无allow参数；既有隔离真实子进程CRUD/默认拒绝测试针对交付exe再跑1通过0失败（0.31秒），临时目录在E盘，真实库未写。完整证据docs/MCP_CODEX_ACCEPTANCE.md；文档diff检查另行核对。
- 未解决与边界：当前只读任务无阻塞；现库无人员，因此member_get存在记录未在真实库验证，隔离回归提供补充。真实库写入、其它客户端/平台与正式发布尚未验，不能扩大通过结论。
- 未提交文件：docs/MCP.md、docs/MCP_CHECKPOINT.md、docs/MCP_CODEX_ACCEPTANCE.md、docs/PROJECT_PLAN.md；均为本任务文档，用户全局Codex配置及target诊断产物不提交。
- 准确下一步：保存文档提交，非强制同步Git及Wolai验收摘要并读回，随后结束当前只读接入任务；后续仅按用户授权启用真实库写入/删除。
- 文档同步：本地验收/检查点/计划已更新，Git及Wolai最终结果待保存；交付exe和manifest源码仍e534644，无重建。
- 额度与设备：开始五小时94%、周53%；未重置/唤醒。本Windows当前聊天MCP实际调用确认，Mac/干净设备未连接；不依赖原生UI验证。
