# 账号设置与数据库规范整改检查点

## 真实交付完成与剩余边界（2026-10-22，优先于全部历史）

用户已明确批准部署/迁移/MCP更新，均已执行。前端/桌面源码71ec2c738b2991a6bf5e961c1997a54d89d23b18，后端bca2d4506e334bc7967c7ca31c5f12dcecfe4fa0/成功CI39722557466；WACAS未定义，UPARS1.1.0/手册1.9/79条。新增忘记密码真实PrimeVue小字位于密码框右下，4桌面深浅/键盘及6网页尺寸主题几何断言、完整68生产UI+11真实HTTP通过；末轮243/48前端与lint/typecheck/build/release检查通过，服务端35+16=51/严格clippy，桌面52+stdio1仍有效。真实登录后头像/改名/DPAPI人工流程未操作，不冒充原生交互已验。

桌面最终覆盖NSIS6317611字节，SHA98A2176567ADAB3F432861CF6E8CE5571995837CF11A46DF8C75EC21AEC53B51；安装exe E770F6D9C9B1F0E67B4618F16836D9BA158EA2E2C38B06AAF6B946A8114A6DE7，正常NSIS标记核验通过。全新副本account-profile-overwrite-20261022-final保护394文件/391非程序文件原样，初次schema5原副本及中间副本均保留E盘，不覆盖。主窗PID45256已启动响应，WebView实际E盘；本地schema6全部原字段/引用按ID映射保留，1项目/5任务/4依赖/0人员/0团队/5基线不变。伴随与独立MCP最终EC9C6EFEF361166B25FFD57AF48F12886A81AACF4DFCA33E9D60047466049420；原8C11及manifest/文档受限备份保留。配置路径/18权限不变，真实新exe仅握手发现18工具、DB SHA不变；当前Codex会话需要用户重连/重启加载，未自动重启客户端。

服务器current=/opt/easyproject/releases/bca2d4506e33，受限easyproject身份active/enabled；新root700副本/var/backups/easyproject/bca2d45-profile-20261022。账号2→3/业务5→6、账号与工作区目录映射不变，所有原账号/会话/Token哈希和权限及全部业务字段/关联保留，integrity ok/外键0；实际2账号/1会话/1个人Token/0重置码、1工作区1项目20任务。44程序/前端/验证器文件SHA核验；新启动epoch可变，不误报数据损坏。正常证书验证直连HTTPS page/health/主应用模块200，匿名session401；主模块/assets/index-CEFD4-Ux.js SHA420923E8F9CA6D0A3D8A85AF8E49EF0A727216DC62C4C30CC8B6AF306B6BEC61与本地一致。普通系统代理路径出现TLS EOF，直连复验通过；本轮未修改系统代理/DNS/证书，不能称普通代理链路通过，若网页受影响需单独定位该链路。

Git源代码已推送；实际独立MCP来源与摘要已重新发现绑定71ec2c7，Apifox29目录/74接口/27参考保持分组、原ID和逐项读回，新总览同步正在收尾。HTTP契约本轮无新增变化，原18项Schema复验仍有效。Git部署回执/交接/Wolai最终同步待下节记录；现有未提交均文档生成/清单/部署交接，不含未验证产品修改。设备确认本Windows与home-host，本轮无关机/重置/自动唤醒。正式发布仍未通过，未修改公开Release/旧草稿。后续仅重连MCP、用户试用反馈与代理链路诊断，不重复已完成迁移或用旧schema2/5程序回退新库。

## 已批准安全部署，部署准备中（2026-10-22）

真实升级已完成（最终回执待同步）：离线服务端bca2d45/CI39722557466已部署到/opt/easyproject/releases/bca2d4506e33，前端为71ec2c7（含忘记密码右下小字），44文件SHA逐个核验；正常停服后全新root700副本/var/backups/easyproject/bca2d45-profile-20261022，账号2→3、业务5→6。全部原字段/密码哈希/会话与Token摘要/权限/目录key及业务引用按映射核验保持；实际2账号/1会话/1个人Token/0重置码、1工作区1项目/20任务，其余业务0，完整性ok/外键0/全ID规范。current原子切换、easyproject身份active/enabled，未生产注册/重置/业务CRUD，不读取或输出凭据。

最终桌面小字补丁98A2176567ADAB3F432861CF6E8CE5571995837CF11A46DF8C75EC21AEC53B51已覆盖，独立新副本account-profile-overwrite-20261022-final保护394文件；391非程序文件与迁移后DB原样，退出0；安装exe E770F6D9C9B1F0E67B4618F16836D9BA158EA2E2C38B06AAF6B946A8114A6DE7与NSIS标记核验通过。包内及独立MCP最终EC9C6EFEF361166B25FFD57AF48F12886A81AACF4DFCA33E9D60047466049420，旧原件独立受限副本保留；桌面启动PID45256。所有原本地字段/映射/关联再次验证保留，1项目/5任务/4依赖/5基线不变。独立新exe真实仅握手18工具，DB SHA前后相同；现聊天尚未动态重连，需重启Codex后实际加载，不把独立探测算客户端重连。最终API目录已生成来源71ec2c7/新MCP，Apifox对应来源摘要同步中；Wolai/交接和Git部署回执待本节收尾，无关机/重置/唤醒。

本地已迁移里程碑：第二次新副本account-profile-overwrite-20261022-2保护390文件，387非程序文件安装后SHA不变、覆盖退出0；NSIS5F28C31E...，安装exe8C5B213D...、包内伴随MCP92F94A...符合本次固定构建。独立旧MCP已完整备份到受限account-profile-mcp-backup-20261022，按SkipBuild替换为92F94A...，原配置路径与18工具权限不变。桌面正常启动PID41820，业务schema5→6；新逐字段验证器验证所有原字段/引用按ID映射保持，integrity ok/外键0/完整前缀ID，表数量1项目/5任务/4依赖/0成员/0团队/5基线不变。新MCP仅握手发现18工具，前后真实DB SHA相同，无自动业务CRUD；当前聊天需重连/重启后实际加载新进程，不能把单独发现当已重连。

用户追加“忘记密码在密码框右下方小字”已实现真实PrimeVue Button；桌面4深浅/键盘与网页6尺寸主题几何断言通过，完整68生产UI+11真实HTTP通过，lint/typecheck/build通过，最终新NSIS重建中。服务端bca2d45/新CI已成功，私有上传D55832BD...仅程序/前端/验证器，无数据/凭据；root部署脚本ED30006F...已读写审查，服务尚未停或迁移。后续必须先新root700副本，再离线迁移全部账号/业务库、逐字段/摘要/映射验证后才切换启动。五小时余19%、周35%；新的长阶段前再查门禁。

部署中间检查点：新增离线migrate-storage入口bca2d4506e334bc7967c7ca31c5f12dcecfe4fa0已同树非强制推送，35库+16HTTP=51/严格clippy通过，Linux CI39722557466 server/security成功。home-host只读确认1账号库schema2、1业务库schema5，尚未停服/备份/迁移。桌面主窗已正常关闭请求成功、旧独立MCP35644已按授权停止。E盘全新account-profile-overwrite-20261022安全副本已完成；NSIS覆盖退出0且主exe符合打包标记校验，但伴随MCP07565...与后续独立构建8E397...不同，校验停止、未启动/迁移。正在重建包并固化包内特性构建的MCP摘要，不能仅拿后来改写的release/MCP与已打包程序比较。旧副本MCP D8A5...保留，独立artifacts/MCP仍8C11未替换。下一步先完成安装侧其余文件与DB不变校验，再统一更新独立MCP、受控迁移与字段映射核验；主窗不强杀，不自动回滚覆盖用户数据。最新五小时余25%、周36%，无重置/唤醒/关机。

用户明确选择“允许安全部署、迁移及更新MCP”，覆盖此前待答。开工HEAD5582409、原分支干净，五小时余30%/周37%。本机旧主窗PID17388与独立MCP35644仍运行，尚未停止/替换；SSH密码认证已确认home-host/ym_li/current13e6ab7/active，密钥认证不可用，sudo需正常密码认证；不改变SSH或系统安全设置。服务器/本机真实库尚未修改。下一步补受控离线全工作区迁移入口及验证，源码测试/新Linux构建后，先停服务与新副本、再迁移并比较所有字段/引用。桌面须正常退出旧主窗并协调旧MCP停止后方可迁移，不能强杀未保存工作。设备仅当前Windows与home-host；不继承关机/额度重置/唤醒授权。文档/外部部署回执均待实际执行，不能称已上线。

## 候选阶段完成，等待真实升级确认（2026-10-22）

最终同步回执：产品25afe85与收尾6cea4004449d8c3091e414f94b4749b8adc18309均已远端核对。常规Git连接重置后先确认直接父，再用既有受保护传输校验树6aa3c30cb32b7fad5eb95a20962561872d42fb42/15文件/精确提交SHA、force=false成功，不绕TLS。Wolai主状态v83/交接入口v20最终读回本阶段回执；Apifox29/74/27已完成，三方状态一致（候选完成、真实升级待批准）。收尾前Git已干净，本条及handoff回执为最后纯文档修改；提交后应再次干净。没有新连接home-host、真实数据迁移或当前安装/MCP替换。

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
