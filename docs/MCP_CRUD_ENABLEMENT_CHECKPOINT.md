# MCP完整CRUD连接启用检查点

- 日期2026-10-20 Asia/Shanghai。用户明确要求正常增删改查，覆盖此前“当前Codex只读”的会话权限选择；不是授权任意修改/删除业务数据。目标仅启用现有18工具并验证配置、隔离CRUD、同步Git/Wolai/交接，不重建/安装应用，不扩大SQL/文件/网络权限。
- 基线a6400975d8eaabdb03f181ca1372b2b06be53067，分支codex/audit-release-20261006-api，开工Git干净。WACAS未定义/待确认；实际UPARS1.1.0、项目数据/额度/持续交接规范。
- 独立exe仍artifacts/mcp/easyproject-mcp.exe，源e534644，SHA8C11FCDFAA263BBA8E9AE52F7FE9F6162737D44A075F15FEF589EC01C50AD5B3，未随新桌面/安全锁更新，保持这一风险边界，不用新清单包装旧文件。数据库为当前E盘runtime-current-user/app/data/project_manager.db。
- 开工确认：此前只有--database，无allow参数；当前7查询工具正常。用户要求CRUD，因此添加--allow-write与--allow-delete，不改Codex审批策略、不调用真实库mutation；删除仍软删除、名称匹配和关联约束，写前恢复点/脱敏审计保留。
- 下一步：实际交付exe隔离stdio CRUD/default-denial复验；仅用真实库握手tools/list确认18工具、不调用增删改；更新同名Codex配置并读回。新配置不等于当前会话已重新发现工具，必要时用户重连/重启。更新MCP指南及手册规则/状态/入口，最后Git与Wolai读回闭环。
- 当前仅本检查点未提交，未改客户端或真实数据；验证尚未执行。Wolai/Git/交接待同步。额度五小时70%、周24%，无重置/唤醒；仅当前Windows连接，其它设备未连接。

## 实施与复验里程碑

- 已通过受支持CLI更新同名全局easyproject条目，command/数据库路径不变，只新增--allow-write/--allow-delete，get --json读回匹配；未修改审批策略、未把写删工具设为免审批。OpenAI官方MCP/CLI文档已核对，配置不等于当前会话已重新加载。
- E盘TEMP/TMP/CARGO_HOME，EASYPROJECT_MCP_TEST_BINARY精确指向当前交付artifacts/mcp/easyproject-mcp.exe；`cargo test --locked --offline --test mcp_stdio -- --test-threads=1`通过1/1（0.52秒），真实子进程验证项目/任务/人员CRUD、团队关联及默认拒绝，用唯一隔离库，不操作真实库。
- 对实际E盘库仅initialize/notifications/initialized/tools/list：18工具完整（3实体各5项CRUD+团队3项），无tools/call mutation；握手前后实际库文件SHA相同。当前聊天7旧查询工具已在用户重启后验证可读E库，但本次更改权限后尚未重连，因此“18工具客户端加载”仍待；不强杀现有客户端/其它会话。
- 文档更新AGENTS、MCP指南、Codex验收顶部覆盖、PROJECT_PLAN及交接README/RULES/CURRENT_STATE/CHECKPOINT；手册1.3仍78条。架构、应用源码/数据库schema/安装包/独立exe/正式发布状态均复核无变，未重跑无关前端/打包门禁，不冒称本轮全量业务回归。
- 当前全部未提交9文件：AGENTS.md、docs/MCP.md、docs/MCP_CODEX_ACCEPTANCE.md、docs/PROJECT_PLAN.md、docs/handoff/{README,RULES,CURRENT_STATE,CHECKPOINT}.md、新docs/MCP_CRUD_ENABLEMENT_CHECKPOINT.md。文档格式、79本地链接/78规则ID唯一性、发布元数据和diff通过。下一步提交；同步Wolai主状态和交接MCP-01/首部，读回核对源SHA，再保存闭环。用户侧重连后发现18工具即可，不要求在真实库造测试数据。
