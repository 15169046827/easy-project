# 开放注册与用户 MCP Token 检查点

2026-10-21，进行中，尚未部署。用户选择直接开放注册；仅 Tailscale 私有服务，不公开公网。

- 目标：普通用户自助注册；用户管理独立 MCP Token，按只读/写入/删除权限访问自己的远端工作区。本地免登录及独立 stdio MCP 不变。
- WACAS：未定义/待确认；适用维护规则、UPARS1.1.0、交接1.7与 MCP Streamable HTTP 规范。
- 基线：`7afcd89644e2150725e33e14bd2d5da20584883d`，分支 `codex/audit-release-20261006-api`，开工工作区干净。
- 未提交文件：本检查点；后续以 Git status 逐项更新。
- 完成：读取维护技能、项目上下文、交接和相关源码；确认注册尚不存在，账号库 schema1，远端无 MCP Token。
- 验证：尚未修改/测试新功能。
- 下一步：先实现注册服务与 PrimeVue 注册入口，验证普通权限、隔离、限流；再实现独立 Token 和 HTTP MCP 边界。迁移前保护服务器账号库，不重置管理员或真实工作区。
- 文档同步：Git/Wolai/Apifox/交接待随里程碑同步；不声称已上线。
- 设备：本机 Windows 上次为锁屏，禁止继续原生输入直到观察到解锁；home-host 上次服务正常，尚未重新连接；旧关机授权已结束，本轮不关机。
- 额度：最后有效五小时剩余47%，周剩余64%；本次查询暂不可用。进入高成本阶段及里程碑后重查；低于10%保存并暂停。

## 里程碑1：候选实现和隔离复验

已实现开放注册（普通角色、Argon2id、用户名/密码白名单、10次/小时/socket IP、总账号1000）、账号schema2事务迁移；旧身份/密码/会话保留。个人Token仅摘要、一次显示、20个有效上限、7/30/90天、read/write/delete对应7/14/18工具；撤销/到期/禁用/首次改密门禁/改密全部失效。Token不能冒充网页会话，网页会话不能冒充MCP。

远端`/mcp`无状态Streamable HTTP，单JSON-RPC、256KiB、专用Bearer、Origin存在时同源、Accept双类型、3个协议版本、JSON回复/通知202/GET405；不提供OAuth自动发现/SSE/会话回放。复用原MCP工具Schema/实体服务/写前备份/脱敏审计，与Web共用账号互斥并失效旧revision。本地离线及stdio不变。

已执行：前端233/46文件；服务端29共享+13专项；严格Clippy/fmt、lint/typecheck、生产build；真实HTTP Playwright8项，含注册密码不一致/成功、Token一次显示/取消撤销/撤销、1280/960/375深浅及nonce。全部最终通过。中途测试恢复点期望误写12（实际11次写）及双弹窗定位歧义已修正重跑，未降低产品检查。构建既有xlsx/日历大包警告保留。

本阶段未提交文件：`.github/workflows/server.yml`；本检查点；`docs/api/{OVERVIEW.md,README.md,apifox-documents.json,web-openapi.json}`；`docs/handoff/{README.md,RULES.md,CURRENT_STATE.md,ARCHITECTURE.md,CHECKPOINT.md}`；`e2e/web-server.spec.js`；`scripts/{apifox-contract.test.js,build-web-api.js}`；`server/{README.md,src/auth.rs,src/http.rs,src/lib.rs,src/mcp.rs,src/workspace.rs,tests/web.rs}`；`src/components/{RemoteRoot.vue,RemoteMcpTokens.vue}`；`src/i18n/locales/{zh-CN.js,en-US.js}`。

下一步准确顺序：提交并非强制同步此候选以触发Linux CI；同步15HTTP操作（新建两个分组，保留55原生条目/26参考和远端SHA保护）；完成全量生产UI/桌面Rust回归及新界面图像复核；验证CI产物后，SSH核对真实数据、停服务并作schema1安全备份，再部署schema2，检查身份/账号/业务行摘要、HTTPS/恶意Origin/Token门禁，不在生产创建测试账号/业务。旧二进制不兼容schema2，禁止无授权恢复旧库丢新数据。

交接已更新1.8/79条；Git/Wolai/Apifox本轮尚待闭环；旧服务器/原安装未改。最后有效额度五小时剩余35%、周剩余63%；设备状态仍为上段（未原生操作/未重新SSH）。

## 里程碑2：全量回归与交付候选

- 功能源提交`48b0d6d447b7aedf91c75f012b53826c28297c86`已同树同SHA非强制同步（普通push SSL reset，既有受控GitHub API通道成功）；Linux CI `39542084645`两个job通过，包含新鲜RustSec/撤包检查、fmt/严格Clippy、42项共享/鉴权测试及release构建。
- 已下载官方artifact12320465159，ZIP SHA`0e50a5a70a462678e2d2f2f5321e0eb8f24f11000dc6dfdcdf846e02f51da575`；ELF x64 10130680字节，SHA`0b6445595583a1bdd9927d1018ce8fd676f739de0bdbf604966d262be8f55876`。
- 全量生产Playwright67通过/8明确Web专用跳过，单worker零重试；另真实HTTP8通过。桌面Rust47+stdio1、fmt、发布元数据、UPARS1.1.0通过；233前端单测/规范/类型再次通过。NSIS构建成功，SHA`AC61043E649E79901B612072313CB593D433FA0C03561169A7526E1408DB2D09`；未覆盖旧安装，独立MCP未改。
- Apifox新增两个目录97961216/97961217，HTTP15操作/6分组（总27目录/70接口，原55原生协议和26参考保留），9原接口写前SHA检查均通过；六次分组导入无额外目录。导入默认状态为released，已逐一改回testing；结构搜索缓存仍显示旧值，权威getHttpEndpoint已确认新状态，验证脚本改以权威详情核对并保留分组/Schema/摘要保护。OVERVIEW参考已更新，其余25篇UNCHANGED。完整最终读回回执随后补记。
- 新增`server/deploy/schema2-safety.py`，仅root、固定目录、服务停机后新建根私有安全副本，逐库完整性/外键/所有旧表行摘要核验；升级后只核对、不自动恢复旧库。账号schema迁移回滚风险明确，禁止直接用旧程序读schema2。
- home-host SSH已连接，sudo已授权；只读确认当前4b4128769b6a、active，schema1/1账号/0会话/0工作区。尚未停服务或部署。Windows未原生操作，未覆盖安装；本轮不关机。
- 下一步：保存当前脚本/API绑定提交；打包已验证Linux源48b0和当前前端/部署资料，上传SSH，停服务→新备份→核验交付→切换→启动→旧行摘要/schema2/HTTPS/鉴权/Origin复验。真实服务不注册测试用户或CRUD；最后同步Wolai/交接并记录上线/未验边界。
