# 账号设置与数据库规范整改检查点

## 候选阶段完成，等待真实升级确认（2026-10-22）

2026-10-22候选验证与接口同步完成，真实部署等待用户明确确认：产品源码25afe853482ec6aa341feba56a522444b90ecbfa已推送，Linux CI39720455218的server/security均成功。243前端单测/48文件、68生产UI及独立11真实HTTP、桌面52+stdio1、服务端49、lint/typecheck/fmt/严格clippy/build/NSIS/元数据/UPARS1.1.0通过；无关闭检查/删测试。Apifox8948094/main8751742共29目录/74接口（56原生+18HTTP）/27参考，原ID保留、请求/响应Schema/分组/testing/摘要读回；新增HTTP同步脚本先全量SHA预检、增量导入、续接与读回，null说明错误拒绝后先核对再修正，未盲重试。Wolai主v81/交接入口v18已读回候选与规则增补，末轮回执继续保存。

候选仅E盘src-tauri/target/audit-tools/account-profile-25afe85：NSIS6316237字节、未签名，SHA4AE0A60E82917E17395F2648309ED2FC93DA1CD2EDEEBB94368CFC1965EDDA34；MCP8E3978B6651CC13BC84A16464369B1F9F0B1AA6A448AEC1B9AE6BCAA31E46A55；Linux916A1E25AEB69EC05FBF32FF37DB24C64B00F9C0CC10882110CCE51D746CC06B。当前实际桌面/服务器仍13e6ab7，独立MCP8C11/schema5不动；新schema3/6迁移、全新副本、独立MCP替换与客户端重连必须获确认后统一处理，不复用旧schema2校验脚本，不先迁移再留旧写进程。真实桌面新UI与真实库迁移尚未验，正式发布仍未通过。准确设计/字段见docs/DATABASE_DESIGN.md。

10-22到期复查节点已检查15项逆依赖：原5提示在Windows/macOS ARM/Intel均无启用路径，告警保留/限定平台和责任边界不变，不批准Linux或正式发布，不新设自动延期；两锁新鲜扫描0漏洞/0撤回。home-host本轮未连，真实数据未变；无关机、重置、定时唤醒。WACAS未定义，UPARS1.1.0/交接1.9/79条。下一步只等部署/ID迁移/MCP更新确认；恢复先读本检查点、核对Git和实际文件，不重做候选实现。

候选源码已提交25afe85；以下为收尾提交前全部未提交文件（收尾后应为空，不以历史清单推断当前WIP）：

- docs/ACCOUNT_PROFILE_DATABASE_CHECKPOINT.md
- docs/api/MODELS.md
- docs/api/README.md
- docs/api/apifox-documents.json
- docs/api/apifox-layout.json
- docs/api/apifox-manifest.json
- docs/api/catalog.json
- docs/api/web-apifox-manifest.json
- docs/handoff/CHECKPOINT.md
- docs/handoff/CURRENT_STATE.md
- docs/handoff/README.md
- scripts/apifox-contract.test.js
- scripts/apifox-mcp.ps1
- scripts/verify-web-apifox.ps1
- scripts/sync-web-apifox.ps1

## 客户端关闭后恢复（2026-10-22，优先于下方历史）

末轮补充：证书补丁后的桌面52+stdio1及全目标严格clippy通过；服务端49+clippy通过；NSIS候选构建成功，SHA256=4AE0A60E82917E17395F2648309ED2FC93DA1CD2EDEEBB94368CFC1965EDDA34，未签名/未安装；独立候选MCP release编译成功，未替换当前客户端文件。API专项8项Vitest通过（误用node --test的运行器错误已纠正，不是产品失败）；fmt、release:check、diff通过。本次恢复后生产UI首次因受限环境回环服务启动超时未运行，正规授权环境重跑中。Wolai outline可读，但目标块get_block遭HTTP传输错误，尚未写入。最新额度五小时余40%、周39%。

目标范围不变：头像/用户名、6—31密码、Windows显式加密保存、管理员15分钟一次性码找回、全表语义前缀完整UUID与分库。WACAS未定义/待确认；实际UPARS1.1.0、交接1.9/79条。基线01a8593f22fbc4427b82d5a8c9776e02e10d987c，分支codex/audit-release-20261006-api，本轮尚未提交。

已完成候选见下方实现说明；另有PrimeVue双标签避免窄屏裁切、受控ID映射文件、schema5恢复迁移、实际DPAPI文件验证。有效验证：前端241/48文件；生产UI68通过；另11真实HTTP全部通过；桌面52库+1真实stdio集成；规范/类型/构建/元数据/UPARS校验通过。恢复后服务端Tokio1.54.1重跑33库+16HTTP=49通过、严格clippy通过。旧工具会话失效不当成测试结果，证书补丁后的桌面复验进行中。

新鲜RustSec库4b587f00996ebe5c05a73eaef105ef241e876414（2026-10-21）发现RUSTSEC-2026-0382/0381，定向rustls-webpki0.103.16、webpki-roots1.0.10；撤回Tokio1.54.0定向1.54.1。重新扫描两锁均0漏洞/0撤回、退出0；桌面保留原5条维护/unsound提示，旧限定例外到10-22须复核，不自动续期。未改系统证书/TLS安全配置。

下一步：完成补丁后桌面测试/clippy及候选NSIS/MCP；核对18HTTP/56原生/27参考，源码提交后重绑catalog来源SHA，同步Git/Apifox/Wolai/交接并读回。新Linux构建及真实桌面UI未验。真实迁移/覆盖的独立确认未收到明确回答，不执行；桌面/服务器仍13e6ab7，独立旧MCP仅兼容schema5，真实升级须协调更新重连，不能留下旧写进程。

同步状态：本地手册/设计/接口候选已更新，Wolai/Apifox本轮尚未写，Git未提交/推送。设备仅本机Windows命令与隔离测试，home-host本轮未重连；真实库/安装/服务器未变。无关机/重置/唤醒授权。最新五小时余45%、周40%。

全部未提交文件：

- AGENTS.md
- CHANGELOG.md
- README.md
- docs/PROJECT_PLAN.md
- docs/RELEASING.md
- docs/api/DESKTOP_IPC.md
- docs/api/MODELS.md
- docs/api/OVERVIEW.md
- docs/api/README.md
- docs/api/apifox-documents.json
- docs/api/apifox-layout.json
- docs/api/catalog.json
- docs/api/web-openapi.json
- docs/handoff/ARCHITECTURE.md
- docs/handoff/CHECKPOINT.md
- docs/handoff/CURRENT_STATE.md
- docs/handoff/README.md
- docs/handoff/RULES.md
- e2e/test-globals.d.ts
- e2e/web-server.spec.js
- scripts/apifox-contract.test.js
- scripts/build-api-catalog.js
- scripts/build-apifox-layout.js
- scripts/build-web-api.js
- scripts/verify-web-apifox.ps1
- server/Cargo.lock
- server/Cargo.toml
- server/README.md
- server/src/auth.rs
- server/src/http.rs
- server/src/lib.rs
- server/src/main.rs
- server/src/workspace.rs
- server/tests/web.rs
- src-tauri/Cargo.lock
- src-tauri/Cargo.toml
- src-tauri/src/common/db_state.rs
- src-tauri/src/common/mod.rs
- src-tauri/src/db/task_dependency_db.rs
- src-tauri/src/lib.rs
- src-tauri/src/services/data_service.rs
- src-tauri/src/services/member_service.rs
- src-tauri/src/services/plan_baseline_service.rs
- src-tauri/src/services/project_member_service.rs
- src-tauri/src/services/project_service.rs
- src-tauri/src/services/task_service.rs
- src/App.vue
- src/components/RemoteConnect.vue
- src/components/RemoteRoot.vue
- src/i18n/locales/en-US.js
- src/i18n/locales/zh-CN.js
- docs/ACCOUNT_PROFILE_DATABASE_CHECKPOINT.md
- docs/DATABASE_DESIGN.md
- e2e/credentials-ui.spec.js
- server/src/account_schema.rs
- server/src/password_reset.rs
- server/src/profile.rs
- src-tauri/src/common/id.rs
- src-tauri/src/common/id_migration.rs
- src-tauri/src/credentials.rs
- src/__tests__/utils/avatarImage.test.js
- src/components/AccountAvatarEditor.vue
- src/components/PasswordRecoveryDialog.vue
- src/utils/avatarImage.js

下方是阶段历史，测试数量和下一步以上述恢复节为准。

## 源码里程碑（2026-10-22，进行中未部署）

已实现候选：正圆Avatar固定宽高/flex与工具栏padding；真实PrimeVue文件选择，PNG/JPEG/WebP<=5MB/20MP，居中裁剪128方形PNG（避免大照片PNG无法压到上限），方形预览；后端限尺寸/类型/解码/重新编码去元数据。本人资料接口改登录用户名需当前密码，身份/工作区key不变。账号schema3事务重建account/session/mcp_token，独立ID+完整前缀，session摘要另设唯一；workspace_key维持原32位目录，避免改ID丢库。password_reset独立ID/摘要/15分钟/管理员一次显示/登录页弹窗；公开重置限流，成功原子撤销旧会话/Token/重置码，普通改密也撤销码。桌面Windows DPAPI当前用户加密，安装侧easyproject-login.dpapi，默认不勾/仅填充不自动登录、取消勾选清理、改密/改名/重置清理；不进入业务导出，不改系统安全设置。

业务schema6：完整ID图事务映射项目/任务/人员/团队/依赖/基线/父子/兼容dependence；旧schema迁移前SQLite新副本，失败回滚。旧PM/DEP/BL统一PROJECT_MEMBER/TASK_DEPENDENCY/PLAN_BASELINE，新增ID全32UUID。Web内部版本表独立WEB_REVISION ID+singleton_key，版本值保留；JSON导出6、导入1—6归一ID，恢复兼容5/6并在副本/当前安全恢复边界迁移，旧备份原件不改。业务列历史VARCHAR(32)在SQLite为文本亲和无长度限制，不因ID变长截断。

实际验证：服务端31共享单测+16 HTTP=47通过（头像尺寸后改128仍需末轮）；桌面lib50通过含DPAPI、ID图迁移/回滚；规范/类型初轮通过，新增头像单测仅测试替身TS2352已改unknown显式断言，最新全量前端正在跑。此前测试因schemaVersion由5→6的旧断言失败已更新为6并重跑共享通过，没有删除检查；账号版本未来拒绝测试改为4，工作区路径测试改为独立key，保持原安全断言。添加png/base64离线解析曾回退5旧锁版本，现定向恢复全部原版本并--locked编译验证，未整体升级；仅新增必要PNG包。尚未运行新真实HTTP浏览器/生产UI、构建NSIS/Linux交付或真实库迁移/覆盖。

下一步：确认前端241单测/类型/规范及最新Rust结果，补真实HTTP头像/用户名/忘记密码/管理员码/保存凭据与深浅窄屏键盘/strict nonce测试；补schema2账号完整关联/目录和恢复schema5测试及ID迁移前后除映射外字段保留。完善迁移目录链接边界及保存密码UI生命周期。更新API契约/Apifox（新增profile/reset/admin-reset及desktop_credentials、schema6说明），Git/Wolai/交接完整同步后构建；部署必须新Linux构建和新schema3/6保护/验证脚本，不复用schema2旧snapshot验证或旧包。真实安装尚运行13e6ab7，覆盖前确认无主窗未保存工作并制作全新安全副本，不自动杀进程。原机/服务器数据未修改，home-host本轮未连。

WACAS未定义/UPARS1.1.0，基线01a8593/原codex分支。最新五小时余80%、周45%，未重置/唤醒/关机。文档已更新handoff入口/状态/架构，Wolai/Apifox待本阶段可提交后同步，不能声称已完成。未提交文件如下（均本轮，未丢弃用户改动）：

- docs/handoff/ARCHITECTURE.md
- docs/handoff/CHECKPOINT.md
- docs/handoff/CURRENT_STATE.md
- server/Cargo.lock
- server/Cargo.toml
- server/src/auth.rs
- server/src/http.rs
- server/src/lib.rs
- server/src/workspace.rs
- server/tests/web.rs
- src-tauri/Cargo.lock
- src-tauri/Cargo.toml
- src-tauri/src/common/db_state.rs
- src-tauri/src/common/mod.rs
- src-tauri/src/db/task_dependency_db.rs
- src-tauri/src/lib.rs
- src-tauri/src/services/data_service.rs
- src-tauri/src/services/member_service.rs
- src-tauri/src/services/plan_baseline_service.rs
- src-tauri/src/services/project_member_service.rs
- src-tauri/src/services/project_service.rs
- src-tauri/src/services/task_service.rs
- src/App.vue
- src/components/RemoteConnect.vue
- src/components/RemoteRoot.vue
- src/i18n/locales/en-US.js
- src/i18n/locales/zh-CN.js
- docs/ACCOUNT_PROFILE_DATABASE_CHECKPOINT.md
- docs/DATABASE_DESIGN.md
- server/src/account_schema.rs
- server/src/password_reset.rs
- server/src/profile.rs
- src-tauri/src/common/id.rs
- src-tauri/src/common/id_migration.rs
- src-tauri/src/credentials.rs
- src/__tests__/utils/avatarImage.test.js
- src/components/AccountAvatarEditor.vue
- src/components/PasswordRecoveryDialog.vue
- src/utils/avatarImage.js

2026-10-22，目标：头像正圆、上传方形预览/自动居中裁剪压缩、更改登录用户名；桌面显式保存密码；新密码6—31字符；核对并统一全表独立ID及大写语义前缀+完整UUID；展示实际数据库设计。基线01a8593，分支codex/audit-release-20261006-api，开工Git干净。WACAS未定义，实际UPARS1.1.0/交接1.8/维护技能。开工五小时99%、周48%，长期10%/硬停5%门禁不变。

已确认账号/业务已经分库：server accounts.db的account/session/mcp_token与每账号workspaces/<内部key>/project_manager.db分离，本地project_manager.db只含六业务表。账号ID、Token ID无前缀、session无独立id、web_revision数字id；业务六表均有id，但使用18位UUID片段，PM/DEP/BL为缩写。不虚构已经符合规范。SQLite VARCHAR(32)并不实际限制长度，但目标改为TEXT明确语义。

实施顺序：先记录现状/目标和小UI修复，再实现账号schema迁移/头像用户名/密码规则，桌面加密保存，再统一业务ID兼容迁移/交换/恢复及内部revision表；每阶段隔离测试和检查点。账号ID变更需保留独立workspace_key映射，不以新ID重建空工作区；事务中维护会话/Token关联，保留密码哈希和有效凭据。业务ID变更须完整映射所有父子/依赖/团队/基线，不改原始备份；先隔离复验再部署，不能直接对真实库试验。

安全边界：保存密码仅桌面、默认关闭、系统加密、非C盘受控文件、不存明文；不自动登录、不把密码写网页存储。用户随后明确没有现存长密码，登录与设置均严格6—31，不保留长密码兼容。用户名修改保持账号身份/工作区，需当前密码校验；头像限制输入类型/大小/像素，前端方形预览/裁剪压缩、服务端再次验证，不接受任意SVG/远端URL。

新增已确认：登录页“忘记密码”弹窗，用户选择管理员提供一次性重置码方案（非邮件）。管理员本人认证后生成，短时有效、只存摘要、一次显示；重置须用户名/码/新密码，成功原子销毁码并撤销所有旧会话和MCP Token，公开入口限流/不泄露账号存在性。密码重置不能直接凭用户名，不需配置邮件。此项待实现。

未完成：上述功能/迁移和新验证均待实施；当前无真实库/服务器/安装修改。线上/桌面仍13e6ab7，上轮测试238/67/9为历史。实际设备本轮仅Windows命令读取；home-host未重连。Git/Wolai/交接/Apifox待里程碑同步（本轮将新增HTTP和IPC契约）。无关机、重置、定时唤醒授权。
