# 项目独立任务状态改造

## 2026-10-23交付收尾完成（Git最终同步回执另列）

- 本轮获批的桌面安全覆盖、真实schema7迁移、服务器部署及独立MCP替换均完成，原数据/关联已核验保留。下方实际部署段给出完整摘要/保护副本/设备证据；不需要再部署或重新迁移。
- 最终相称复验：前端266/54文件、API契约10、迁移核验器4、lint/typecheck/release:check/diff通过；线上正常TLS2入口/63静态SHA/4匿名401/health200通过。产品原生/Rust/Web全量此前56+stdio1/37+16/84生产UI+12HTTP证据继续有效，本轮运维文档未改变产品源码，不冒称再次全量执行。
- 实际release来源已绑定API目录；Apifox66原生接口、32参考及18HTTP均完成同步/逐项读回，保留原ID/分组，所有受管摘要非空；HTTP另跑独立权威读回18项通过。状态仍testing，不以文档状态代替正式生产验收。
- Wolai主/交接真实部署回执已读回，最终API/Git结果另补；交接README/RULES/CURRENT_STATE/ARCHITECTURE核对，RULES规范未变不机械重写。现有Codex客户端需重连才加载新23工具，不需要扩大权限。
- 提交前完整未提交19文件：CHANGELOG.md、docs/{DATABASE_DESIGN.md,MCP.md,PROJECT_PLAN.md,PROJECT_TASK_STATUS_CHECKPOINT.md}、docs/api/{MODELS.md,OVERVIEW.md,README.md,apifox-documents.json,apifox-layout.json,apifox-manifest.json,catalog.json,web-apifox-manifest.json,web-openapi.json}、docs/handoff/{ARCHITECTURE.md,CURRENT_STATE.md,README.md}、scripts/{build-api-catalog.js,build-web-api.js}。本次仅生成器部署文案/来源及交付记录，产品代码不再改。
- 剩余边界：原生Windows新UI全矩阵、macOS实机及真实多人CRUD未验；正式生产发布仍未通过，本轮没有公开新版安装包。用户可在项目工作区“任务状态”管理、任务/甘特创建编辑选择器底部“+”使用。新官网截图/es-ES/公网运维待后续专项，不作为本次状态字典阻断。
- 下一步仅保存本轮提交、非强制push并远端SHA读回、Wolai最终回执；若Git网络失败明确记录缺口，不重做有效迁移或自动扩大授权。桌面及服务器保持运行，未继承关机授权。

## 真实部署完成，文档收尾（2026-10-23，覆盖下方协调/未部署历史）

收尾复验：正常TLS两HTML入口、63个当前dist静态文件SHA、4条匿名401边界及/api/health 200全部通过；此前误探/health得到404，已按真实路由/api/health复验。本轮追加全量前端266/54文件通过，API契约10测试、lint/typecheck/release:check/diff通过，补齐末次展示层改动后的单测证据。HTTP18同步及独立权威读回已通过；32参考文档已读回，66原生接口来源分组更新正在逐项读回。Wolai主/交接已保存真实部署回执并读回；Git远端只读确认仍1640e31，本轮6aeb14c及最终文档待非强制推送。当前五小时余38%，未重置。

- 目标：项目独立状态字典及UI/MCP全链路；本轮真实迁移/新副本/桌面覆盖/服务器/独立MCP更新均经用户批准，不含公开新安装包、关机、额度重置。WACAS未定义/待确认，实际AGENTS/交接1.13/UPARS1.1.0。基线6aeb14cfe3da70ab94b43a863021d0157b46da73，分支codex/audit-release-20261006-api；最新额度五小时余46%、周余70%。
- 本机安装完成并启动响应正常，schema6→7逐字段保留1项目/5任务/4依赖/5基线、3状态，integrity ok/FK0。E盘受限新副本status-overwrite-1640e31-20261023保护480文件，477非程序SHA不变；安装包E0B2A0CF3845442071935DE728B5954A38C67A738AD38A8322A918F4AD952BAA，安装exe C618C905D0740673B04D04AE6B6AF35FBC63A57837BB9D64CE2DF49780045237。
- 用户“继续尝试”后实时精确核对/断开3个旧artifacts/mcp进程，受限新副本status-mcp-before-1640e31保留旧程序/manifest/说明。新独立与安装侧MCP均765B4C33330442DC947B76DE58747FEFF0EB78181B8738481B980E72C5FC70DF，实际构建源1640e31+dirty=true，与后续6aeb14c Rust源码无差异。新独立进程只做tools/list，发现23项且真实库SHA不变；当前Codex旧目录仍须重连，不称本聊天已加载。
- home-host已确认在线；SSH认证后经受限easyproject身份迁移、原子切current并启动，服务active/enabled。新release=/opt/easyproject/releases/status-1640e31，新root700全量副本=/var/backups/easyproject/status-1640e31-20261023。Linux源53d664e/成功CI39964991851，二进制4730A7394B7C569C54C12F88ED0CEE3C37F86345A74D96F15BE2BAEBBDABFA4E；66交付文件摘要全部核验，包7f5a795ad95c4a872ca3e7a2ef93c9b6a90fd53a600345151e1025bc483a510c；旧网页哈希资源保留。
- 服务器账号schema3全部字段保留：2账号/1会话/1MCP凭据/0重置码；业务6→7全部原字段/关系保留：1项目/20任务/0依赖/0成员/0团队/0基线/1revision/11状态（历史自定义名称保留）。迁移前后及服务启动后只读核验integrity ok/FK0，revision仅允许预期epoch变化。未运行真实账号/业务CRUD或代操作登录。
- 新迁移核验器4测试在E盘TEMP环境通过；压缩续接后一次漏设TEMP的运行于setUp无法打开临时库，补齐既定E盘TEMP/TMP后4/4通过，不是产品源回归。此前全量验证结果仍见源码候选完成回执，没有冒称再次全量执行。
- 当前全部未提交：本检查点、CHANGELOG、docs/PROJECT_PLAN、docs/DATABASE_DESIGN、docs/MCP、docs/api/{OVERVIEW,README,MODELS,catalog,apifox-documents,apifox-layout}、docs/handoff/{ARCHITECTURE,CURRENT_STATE}、scripts/{build-api-catalog,build-web-api}；后续生成会增加web-openapi及同步manifest，提交前以git status完整核对。
- 正在收尾：公网正常TLS只读入口/静态摘要/匿名边界；API文案已去除生成器硬编码“尚未部署”，待重生成并同步Apifox读回；Wolai两处待更新。Git上次6aeb14c推送SSL失败，须只读远端核对后非强制推送。本轮未完成原生新UI全矩阵、macOS实机、真实多人CRUD，正式生产发布仍未通过。没有当前关机授权。桌面与服务器保持运行，不自动停止。
- 准确下一步：完成只读公网验证→生成实际release来源契约/相称门禁→Apifox只读计划再同步读回→Git提交/非强制推送并读回→Wolai主/交接最终回执读回。新版官网截图/es-ES/公网运维后置，不重做已通过的状态开发或再次迁移。

## 本机真实schema7已核验（2026-10-23）

- 用户继续指示后实时核对并断开3个精确artifacts/mcp旧进程（不是复用历史PID）；新受限status-mcp-before-1640e31副本保留原EC9C6EFE exe/manifest/说明。替换后独立与安装侧伴随MCP均765B4C33330442DC947B76DE58747FEFF0EB78181B8738481B980E72C5FC70DF；manifest实际构建来源更正1640e31+dirty=true（后续6aeb14c仅运维验证器/文档，Rust源无差异）。
- 启动后逐字段核验原schema6→7，1项目/5任务/4依赖/5基线保留，新增3状态，integrity ok/FK0；桌面PID15376/Responding=true/MainWindowTitle EasyProject。未操作登录或真实业务CRUD，不称原生新UI全矩阵通过。
- 实际新独立MCP仅tools/list发现23项，真实库文件SHA前后不变；当前Codex现有目录未自动重连，不冒称已动态加载。API源码已按实际release exe重新生成，来源/Apifox同步待本轮收尾。
- 服务器候选66文件/包SHA7f5a795ad95c4a872ca3e7a2ef93c9b6a90fd53a600345151e1025bc483a510c，专用部署脚本已基于旧流程逐项替换固定路径/摘要并保留旧哈希资源，上传进行中；尚未停服务器或迁移。下一步完成上传核验、全新root700副本/停写迁移/逐字段验证后才切current；失败不自动覆盖回滚数据库。

当前待用户协调：只读CIM核对旧MCP进程2220/3436/38684/11288均为E:/Project/Project/easy-project/artifacts/mcp/easyproject-mcp.exe。未强停，可能属于其他仍在工作的任务；先请用户暂停这些任务的EasyProject MCP写操作并确认可断开，再重新查询实时PID（不能复用此历史PID直接终止）、保护原件、替换/迁移/逐字段核验与重连。当前桌面覆盖但未启动、真实库仍schema6；服务器仅只读确认，尚未上传/停止或部署。新增verifier与4测试及交接回执保存Git，Wolai同步本协调点；无后台自动继续或关机。

## 真实升级中间里程碑（2026-10-23）

- NSIS首次沙箱makensis系统DLL623失败，正常权限复验成功；包E0B2A0CF3845442071935DE728B5954A38C67A738AD38A8322A918F4AD952BAA（未公开）。Linux CI39964991851/源53d664e成功，已E盘下载候选4730A7394B7C569C54C12F88ED0CEE3C37F86345A74D96F15BE2BAEBBDABFA4E。
- 用户开机后SSH密码认证只读确认home-host、easyproject active、current=/opt/easyproject/releases/012-landing-20261023。未停服/上传/迁移服务器。
- 新scripts/verify-status-migration.py及4测试（初轮SQLite连接未关闭导致清理失败已修复并全通过）验证6→7原字段/引用/状态含义/默认/ID/账号3不变。E盘status-isolation-1640e31使用实际桌面库的SQLite隔离副本，真实Rust migrate-storage执行成功，逐字段核验1项目/5任务/4依赖/5基线、3状态，完整性ok/FK0。
- 真实桌面已覆盖但未启动：新受限副本status-overwrite-1640e31-20261023保护480文件，477非程序SHA/数据库逻辑不变，NSIS退出0，安装exe C618C905D0740673B04D04AE6B6AF35FBC63A57837BB9D64CE2DF49780045237。独立MCP仍旧EC9C6EFE...；更新前检查发现已有MCP进程，保护脚本停止未替换/未启动桌面，需先核对进程精确路径并协调停止后继续。真实数据库仍未触发schema7启动迁移，不能说升级已完成。
- 当前未提交：本检查点、新verifier/测试；下一步精确处理本机MCP写进程/新副本/替换，启动迁移核验，再做服务器新受限副本/部署及契约来源同步。Wolai/交接中间回执待同步；不复用旧部署脚本或删除原件。

## 2026-10-23已获真实升级授权，候选构建中

- 用户明确允许全新安全副本、真实schema7迁移、服务器/桌面/独立MCP更新，保留账号/内容/关系且不公开发布；此授权仅本轮，不含关机/重置。基线1640e31c6b19f48c408ee4afce74b6bde1243464，原分支，开工干净；五小时余93%、周余78%。WACAS未定义，实际AGENTS/交接1.13/UPARS1.1.0。
- 已审旧安装/部署脚本，均固化旧路径/摘要/schema6，不直接复用。NSIS构建已启动（仅E盘TEMP/CARGO_HOME），尚未安装；真实进程初查未发现easy-project/easyproject-mcp，不据此推断库离线或可立即覆盖。SSH只读设备/部署路径确认进行中。
- 关键下一步：构建候选并固化源/摘要；新增schema6→7逐字段/新增状态图验证器（旧verify-id-migration只接受schema6且账号假设过时，不能使用）；隔离验证后准备全新副本，再协调停写/迁移与分别安装部署。不运行旧deploy-profile或旧C盘补丁脚本，不丢旧网页资源。当前未提交仅本检查点，Wolai/交接授权回执待同步；尚未修改真实库/服务器或独立MCP。

## 2026-10-23恢复：Git同步已完成，等待真实升级授权

- 已先读检查点、核对Git/文件与额度：五小时剩余98%、周剩余78%，未使用重置。工作区干净；分支codex/audit-release-20261006-api，源码4752da3，续接HEAD53d664e3cb2d8a5a7c379bad3ba525b5cd809139。WACAS未定义，实际AGENTS/交接1.13/UPARS1.1.0；范围仍为状态字典，不扩展后置路线图。
- 先只读确认远端44557ae，再非强制推送既有历史成功；ls-remote读回53d664e3cb2d8a5a7c379bad3ba525b5cd809139。此前SSL重置/超时缺口关闭，未重做有效代码或测试；本轮仅Git同步及文档回执，不把历史验证称新运行。
- 下一步需用户单独批准真实schema7升级/服务器部署/桌面覆盖/独立MCP更新；未获新授权前不连接真实库运行候选。获批后先构建交付候选、重绑实际来源/摘要、确认设备与新保护副本，再分步迁移部署并核验账号/业务内容关系与回滚边界。
- 未提交仅本文和交接CURRENT_STATE的恢复回执，随后保存文档提交并同步；Wolai主/交接待追加读回。既有Apifox同步及源码验证不变；未SSH/未确认服务器在线，未改真实数据/安装/MCP，无本轮活动测试服务/设备验收或关机授权。

## Git与续接回执

- 最终暂停（2026-10-23）：五小时余8%、周余79%，按长期10%门禁保存并暂停，不开启新阶段。源码提交4752da3；回执提交81b9da515dbed22044eab1b3432a1670e575df47；第二次有界push也在21秒后连接GitHub443超时，远端SHA未确认，不能声称更新成功。保存这次最小补充前仅本文与docs/handoff/CURRENT_STATE.md未提交，随后另存文档提交，工作区应干净。恢复首先读此处/核对Git和额度，再只读查远端、非强制推送；其后才构建交付候选与重绑来源，真实升级仍先获单独授权。Wolai两处已同步最终源码/验证/Apifox并将补此网络缺口；无活动测试/服务/浏览器须保留，无新设备连接或真实数据变化。

- 源码候选已本地提交4752da34b0d6f0a85f053b98224c9f8e48f699a0（基于本地WIP536294b/原基线44557ae），分支codex/audit-release-20261006-api；提交后工作区干净。Wolai主页面及交接副本已同步此源码/完整验证/Apifox完成回执并读回。
- 首次Git推送被GitHub HTTPS连接重置（OpenSSL SSL_read errno10054），不能称远端已同步；本回执将另存文档提交并进行一次有界推送确认，最终是否成功以命令结果/远端SHA为准。若仍失败，下次先只读核对远端，再非强制推送本分支，保留两段本地历史，不使用只支持单父提交的旧上传辅助脚本盲传。
- 最后有效额度：五小时剩余10%、周剩余79%。不进入新长期打包/升级阶段；未有本轮真实迁移/安装/服务器部署授权。用户恢复后先核对此回执、Git和相关文件；源码候选验证及API同步已完成，不重复开发。下一步是从4752da3产品源码构建交付候选/重绑实际来源，并先取得真实升级授权。当前全部设备/未验/验证/同步详情见下方完成回执；除本文/交接回执外无新产品修改。

## 2026-10-23源码候选完成回执（真实升级另需确认）

- 目标已实现：项目独立自定义状态、稳定ID引用、MCP状态CRUD/任务强制引用、动态UI/统计、快捷新增/取消与独立管理、引用冲突阻止删除；不是隐藏三父分类。WACAS未定义/待确认，实际AGENTS/交接1.13（79条）/UPARS1.1.0。
- 基线44557ae8e16d85f126f54d10a2f2ad209839587a，分支codex/audit-release-20261006-api；既有本地WIP536294b，当前全部改动准备新提交，远端同步结果须核对下方后续Git回执。五小时余12%、周余79%；不重置/关机/定时唤醒。
- 最新实际验证：前端266单测/54文件、性能9；Rust56单测+真实stdio1；server37单测+16接口；生产UI84/84零重试（12真实HTTP项按独立入口跳过，独立test:web12/12通过）；lint/typecheck/build/release:check、双Rust格式/严格clippy及diff通过。末次TaskList自定义同名状态原文/完成属性显示保护后已再次build、84UI、lint/typecheck通过；266单测是在该展示层小改之前，后端未再改。保留大体积按需块既有警告与E盘增量缓存硬链接降级复制提示，没有关闭门禁。
- 失败历史：暂停前49/6；后续目录数量/交换fixture/ID图修复到56/0；新增图校验后2个旧SQL fixture不完整，补正确字典后复验通过。前端旧Gantt fixture缺status_id导致5失败，改为显式合法引用后266通过。生产UI先遇沙箱回环EACCES/ETIMEDOUT（正常本机隔离进程通过），新增按钮图标可访问名及精确英文大小写断言、旧fixture缺字典/固定3行/旧URL状态文本断言均定位修正，最后84项零重试通过；未删除测试/放宽服务校验。没有宣称最初即全绿。
- 数据/接口：schema7/JSONCSVXLSX7隔离升级与恢复/回滚、默认/状态图验证；真实环境仍schema6。MCP候选9/18/23工具；Apifox66原生接口+18HTTP、32参考均逐项读回，旧ID/分组保留，新2状态分组。原生同步HTTP0中断后先只读核对无未确认ID/摘要一致再续；HTTP同步中断后verify定位post__api_account_mcp_tokens并ResumeFrom准确续接，最终verify18项通过。debug目录发现仅合成库且前后SHA不变，D1E994F6...、536294b+dirty=true来源如catalog/manifest所述；不是已安装独立程序。未来正式候选必须从保存源码重构建并重绑交付来源/摘要，不以该debug exe交付。
- 文档：AGENTS/规则1.13、数据库、MCP、API/Apifox、变更记录、计划、交接与当前状态已更新；Wolai已保存界面里程碑，最终回执待同步读回。公网运维/新版截图/es-ES仍后置不遗失。
- 未验证与下一步：尚未构建本轮NSIS/独立MCP release候选、未原生Windows新UI全矩阵、未macOS实机；正式发布仍未通过。先由用户确认进入真实升级/迁移及覆盖阶段，再从本轮最终源码构建/重绑来源/准备全新E盘与服务器受限副本、确认部署设备在线、schema7隔离升级证据对照、分别更新服务器/桌面/独立MCP并逐字段核验原内容/关系/账号和重连。不自动沿用旧安装/迁移授权，不向真实库运行debug。状态功能的未来新增联机联动不等于本地/云自动合库。
- 设备/进程：本轮无SSH/真实数据CRUD/安装/MCP替换，旧原件与安全副本未动；只确认本机隔离浏览器演示与测试服务，未确认home-host在线。临时IAB演示页已关闭、1420演示服务已停止，生产/HTTP测试脚本自身清理服务，无活动会话需要续接。没有本轮关机授权。
- 提交前全部未提交文件（均本专项，提交后应以git status干净为准）：

```text
 M AGENTS.md
 M CHANGELOG.md
 M docs/DATABASE_DESIGN.md
 M docs/MCP.md
 M docs/PROJECT_PLAN.md
 M docs/PROJECT_TASK_STATUS_CHECKPOINT.md
 M docs/api/DESKTOP_IPC.md
 M docs/api/MODELS.md
 M docs/api/OVERVIEW.md
 M docs/api/README.md
 M docs/api/apifox-documents.json
 M docs/api/apifox-layout.json
 M docs/api/apifox-manifest.json
 M docs/api/catalog.json
 M docs/api/web-apifox-manifest.json
 M docs/api/web-openapi.json
 M docs/handoff/ARCHITECTURE.md
 M docs/handoff/CURRENT_STATE.md
 M docs/handoff/README.md
 M docs/handoff/RULES.md
 M e2e/smoke.spec.js
 M e2e/ui-consistency.spec.js
 M scripts/apifox-contract.test.js
 M scripts/build-api-catalog.js
 M scripts/build-apifox-layout.js
 M scripts/build-web-api.js
 M scripts/group-apifox-api.ps1
 M scripts/run-e2e.js
 M server/src/maintenance.rs
 M server/src/workspace.rs
 M server/tests/web.rs
 M src-tauri/src/common/id_migration.rs
 M src-tauri/src/common/task_status.rs
 M src-tauri/src/db/project_db.rs
 M src-tauri/src/db/task_db.rs
 M src-tauri/src/mcp/mod.rs
 M src-tauri/src/mcp/tests.rs
 M src-tauri/src/mcp/tools.rs
 M src-tauri/src/services/data_service.rs
 M src-tauri/src/services/entity_api.rs
 M src-tauri/src/services/task_service.rs
 M src-tauri/src/services/task_status_service.rs
 M src-tauri/tests/mcp_stdio.rs
 M src/__tests__/api/demoReordering.test.js
 M src/__tests__/composables/useGanttTaskEditors.test.js
 M src/__tests__/data/xlsx.test.js
 M src/api/demo.js
 M src/i18n/index.js
 M src/modules/dashboard/components/DashboardView.vue
 M src/modules/data/components/DataView.vue
 M src/modules/data/utils/xlsx.js
 M src/modules/floating/taskSelection.js
 M src/modules/gantt/components/GanttTaskDialog.vue
 M src/modules/gantt/components/GanttView.vue
 M src/modules/gantt/composables/useGanttCreateEditor.js
 M src/modules/gantt/composables/useGanttEditEditor.js
 M src/modules/gantt/utils/interaction.js
 M src/modules/project/components/ProjectWorkspace.vue
 M src/modules/task/components/TaskBoard.vue
 M src/modules/task/components/TaskList/TaskList.vue
 M src/modules/task/utils/taskRowPersistence.js
 M src/router/index.js
?? src/__tests__/components/TaskStatuses.test.js
?? src/components/TaskStatusManager.vue
?? src/components/TaskStatusSelect.vue
?? src/i18n/locales/task-status-en.js
?? src/i18n/locales/task-status-zh.js
?? src/utils/taskStatus.js
```


## 2026-10-23界面与交换里程碑（进行中，非可部署结论）

- 范围/基线：项目独立状态字典、严格引用、动态界面/MCP及契约；基线44557ae、HEAD本地WIP536294b、分支codex/audit-release-20261006-api，远端仍44557ae。WACAS未定义/待确认，实际AGENTS/交接1.13（79条）/UPARS1.1.0。五小时余23%、周余81%；没有重置/关机/自动唤醒授权。
- 已实现：PrimeVue TaskStatusSelect（底部+上层新增/取消、保留草稿/立即选中/过期响应保护）、ProjectWorkspace独立TaskStatusManager（名称/颜色/排序/完成/默认编辑，分页冲突/引用阻止删除）、TaskBoard动态ID列/未知兜底，TaskList/甘特表单选择与跨项目显式选择，动态筛选/仪表盘及完成/逾期/浮窗语义。JSON/CSV/XLSX7含字典/引用、旧版兼容；导入/备份增加状态图/默认/ID/颜色校验与失败回滚负例。服务端远端MCP5工具CRUD及账号隔离/删除阻止/恢复点数量均有验证。
- 验证：Rust56单测+1真实stdio通过、严格clippy通过；server37单测+16接口通过；前端266单测通过（其后增加文案/门禁/契约生成器改动待最终全量）；build通过；专项真实PrimeVue生产UI浅色/深色960宽严格CSP2/2零重试通过；真实HTTP12/12通过。全量生产UI正在执行，发现旧ui-consistency fixture缺状态字典导致编辑无法保存，及固定3行断言不符实际2状态；已修正fixture/期望且保留所有逐帧几何检查，待重跑。初轮回环EACCES/ETIMEDOUT为沙箱限制，正常本机隔离服务可跑；曾有新增测试精确英文大小写/图标可访问名称断言失败已修复。图校验加入后2个旧SQL fixture缺状态失败，已按新schema补播种并复验，不放宽产品保护。
- 契约：本地已实际发现新debug候选23工具、7命令/36动作、66原生接口/23目录、32参考；HTTP仍18操作15路径，状态通过workspace action而非虚构REST。生成用新的隔离HTTP测试库，发现前后DB SHA不变；binary D1E994F6F8BD3FB32BF52B5FBEE7296D296D1982E17B77929D1BF08F165F278C，源536294b+worktreeDirty=true/debug-isolated-candidate，非已安装程序。manifest在忽略目录status-catalog-manifest.json；生成器新支持--binary/--manifest且校验摘要。Apifox只读同步计划进行中，尚未外部写入，不声称同步完成。
- 准确下一步：收取当前全量UI/前端门禁结果，处理余下失败并零重试全量复验；完成API文档/Apifox计划后增量写入并读回，更新数据库/规则/交接/Wolai；做最终lint/typecheck/test/build/release/performance、Rust/server格式/严格检查及diff，保存Git提交/远端（当前未推送）。真实部署/schema7迁移/覆盖/独立MCP替换须另行确认，不能继承旧授权。
- 文档同步：AGENTS/规则1.13/架构/数据库/MCP/计划/变更记录及本地API候选已增补；Wolai只有前个后端里程碑已读回，本界面里程碑待同步；Apifox当前仅只读计划，旧契约尚在。公网运维/新版截图/es-ES继续后置。设备：未SSH/未改真实库/安装/MCP，桌面与服务器仍schema6；所有新测试库/缓存/临时数据E盘，生产UI/Apifox计划等本轮会话需先查是否结束，不停止其它程序。
- 本里程碑全部未提交文件如下（均本专项，后续新增须再核对）：

```text
 M AGENTS.md
 M CHANGELOG.md
 M docs/DATABASE_DESIGN.md
 M docs/MCP.md
 M docs/PROJECT_PLAN.md
 M docs/PROJECT_TASK_STATUS_CHECKPOINT.md
 M docs/api/DESKTOP_IPC.md
 M docs/api/MODELS.md
 M docs/api/OVERVIEW.md
 M docs/api/apifox-documents.json
 M docs/api/apifox-layout.json
 M docs/api/catalog.json
 M docs/api/web-openapi.json
 M docs/handoff/ARCHITECTURE.md
 M docs/handoff/CURRENT_STATE.md
 M docs/handoff/README.md
 M docs/handoff/RULES.md
 M e2e/smoke.spec.js
 M e2e/ui-consistency.spec.js
 M scripts/apifox-contract.test.js
 M scripts/build-api-catalog.js
 M scripts/build-apifox-layout.js
 M scripts/build-web-api.js
 M scripts/run-e2e.js
 M server/src/maintenance.rs
 M server/src/workspace.rs
 M server/tests/web.rs
 M src-tauri/src/common/id_migration.rs
 M src-tauri/src/common/task_status.rs
 M src-tauri/src/db/project_db.rs
 M src-tauri/src/db/task_db.rs
 M src-tauri/src/mcp/mod.rs
 M src-tauri/src/mcp/tests.rs
 M src-tauri/src/mcp/tools.rs
 M src-tauri/src/services/data_service.rs
 M src-tauri/src/services/entity_api.rs
 M src-tauri/src/services/task_service.rs
 M src-tauri/src/services/task_status_service.rs
 M src-tauri/tests/mcp_stdio.rs
 M src/__tests__/api/demoReordering.test.js
 M src/__tests__/data/xlsx.test.js
 M src/api/demo.js
 M src/i18n/index.js
 M src/modules/dashboard/components/DashboardView.vue
 M src/modules/data/components/DataView.vue
 M src/modules/data/utils/xlsx.js
 M src/modules/floating/taskSelection.js
 M src/modules/gantt/components/GanttTaskDialog.vue
 M src/modules/gantt/components/GanttView.vue
 M src/modules/gantt/composables/useGanttCreateEditor.js
 M src/modules/gantt/composables/useGanttEditEditor.js
 M src/modules/gantt/utils/interaction.js
 M src/modules/project/components/ProjectWorkspace.vue
 M src/modules/task/components/TaskBoard.vue
 M src/modules/task/components/TaskList/TaskList.vue
 M src/modules/task/utils/taskRowPersistence.js
 M src/router/index.js
?? src/__tests__/components/TaskStatuses.test.js
?? src/components/TaskStatusManager.vue
?? src/components/TaskStatusSelect.vue
?? src/i18n/locales/task-status-en.js
?? src/i18n/locales/task-status-zh.js
?? src/utils/taskStatus.js
```


## 2026-10-23恢复后的后端里程碑（进行中，覆盖下方暂停状态）

- 用户已明确继续。基线44557ae8e16d85f126f54d10a2f2ad209839587a，分支codex/audit-release-20261006-api；HEAD为本地WIP536294b385e118522df8566cd0bbcfba4dfd3d20，远端未更新。WACAS未定义/待确认，实际AGENTS、交接1.12、UPARS1.1.0。五小时剩余56%、周剩余86%，不重置/唤醒。
- 已完成后端：schema7隔离迁移、项目状态CRUD/引用冲突分页、任务更新严格同项目status_id/跨项目显式选择、JSON v7交换与旧库恢复路径、MCP五工具及9/18/23权限目录、Web模型白名单。删除有任意引用（包括软删除任务）即拒绝，未采用替换删除。
- 实际复验：最新Rust56单测+1真实stdio通过。恢复过程中先后暴露目录数量、交换fixture/schema和ID图外键失败，均修复后全量复验，未删除测试或放宽保护。已新增严格缺失/文字/跨项目状态拒绝、重命名关联保留、完成属性、引用删除阻止测试。前端新PrimeVue选择器初次类型检查通过，后续TaskList接线尚待完整复验。
- 当前未提交文件：server/src/workspace.rs；src-tauri/src/common/id_migration.rs、db/project_db.rs、db/task_db.rs、mcp/tests.rs、mcp/tools.rs、services/data_service.rs、services/entity_api.rs、services/task_service.rs、services/task_status_service.rs、tests/mcp_stdio.rs；src/i18n/index.js；src/modules/task/components/TaskList/TaskList.vue、utils/taskRowPersistence.js；新src/components/TaskStatusSelect.vue、src/i18n/locales/task-status-en.js、task-status-zh.js；本检查点与交接入口。
- 下一步：完成动态看板、独立项目状态管理、任务选择器快捷新增/取消与demo；再检查统计/逾期/甘特/浮窗的完成语义、交换完整性与默认约束；补前后端/服务端回归，完整质量门禁后同步契约/Apifox/Git/Wolai/交接。尚不能称功能完成或可发布。
- 同步：本地检查点和交接按此更新；Wolai里程碑同步待读回，API/Apifox尚未同步新契约。公网运维/截图/es-ES仍后置。设备：本轮未SSH、未连接/修改真实数据库、未安装/替换MCP；已部署仍schema6。真实schema7迁移/部署/覆盖须另行确认，不启动新源码读取真实库。

## 2026-10-23用户要求暂停，等待Codex重启后明确继续

- 状态：已停止开发，不自动唤醒/部署/迁移/替换MCP。当前基线44557ae8e16d85f126f54d10a2f2ad209839587a，分支codex/audit-release-20261006-api；本轮WIP将仅本地Git保存，远端仍44557ae，避免暂停时推送触发CI。恢复后先核对此检查点/Git/相关文件，不能把WIP当可发布源码。额度五小时余81%、周余90%，无重置/关机授权。
- WACAS未定义/待确认，实际AGENTS/交接1.12/UPARS1.1.0。目标与范围是项目独立状态字典、任务已有状态引用、动态看板/选择器/快捷新增/独立管理、MCP状态CRUD、契约与文档同步；公网运维/新截图/es-ES等上一阶段待办暂后置，不遗失。
- 已做：新增common/task_status.rs，TASK_STATUS全UUID/项目隔离/默认三项/完成与默认属性/颜色排序/内置翻译key/软删除；隔离迁移保留旧原文，Todo归入默认待办，未知不猜完成，错误关系事务回滚。新增task_status_service.rs原型，名称颜色排序/默认/完成校验及get_usage分页冲突查询；最新删除逻辑已按用户要求改为引用即阻止，绝不替换/迁移任务。基础schema7入口/迁移前新副本、project创建播种、task.status_id和返回完成属性、任务创建引用、IPC分发已初接。
- 重要形态：task.status_id为稳定引用，旧task.status文本暂作兼容显示；Task新增status_id/is_completed/status_builtin_key。旧桌面/模板仅允许已存在builtin key到本项目状态解析，MCP后续必须强制显式status_id，不允许 arbitrary字符串或隐式建状态。尚未完整接入，严禁在真实库启动源码调试版本。
- 已执行验证：两次隔离迁移2/2通过（第二次仍在schema入口集成前），cargo fmt执行过；schema7初接后完整Rust55项为49通过/6失败，不能称通过。失败：common::id_migration::tests::schema_five_graph_migrates_all_relations_and_preserves_original_backup；db::project_db::tests::owner_is_added_to_team_and_previous_owner_is_retained；db::task_db::status_query_tests::pending_includes_legacy_todo_and_overdue_excludes_finished_or_invalid_dates；mcp::tests::{entity_crud_round_trip_preserves_rules_and_recovery_points,cross_project_moves_preserve_children_dependencies_and_baselines,team_tools_support_assignment_and_safe_detachment}。其中MCP旧默认Draft已被新引用校验拒绝；schema期待6/最小测试fixture缺新表及任务列表SELECT形态待逐项定位，不放宽产品保护/删除测试。最近删除改动尚未格式化/编译，只有git diff --check通过。
- 保存前全部修改：src-tauri/src/cmds/crud_action.rs、common/db_state.rs、common/mod.rs、db/project_db.rs、db/task_db.rs、models/task.rs、services/entity_api.rs、services/mod.rs、services/task_service.rs；新文件common/task_status.rs、services/task_status_service.rs与本文，另加handoff CURRENT_STATE/README的暂停入口。无其它用户改动；本地WIP提交后工作区应干净，commit id以git log核对。
- 准确下一步：1 先读此回执/新用户删除规则/Git和额度；检查schema7与服务原型，补task更新status_id校验/同项目引用、跨项目移动显式目标状态、完成属性和get返回，统一事务；2 加CRUD/引用/默认/删除冲突并发与旧迁移测试并处理上列6失败，不能先跑前端或部署；3 JSON schema7导出/导入/旧库恢复/模板与ID图联动（当前仍schema6导出/恢复假设，未改）；4 MCP新增5工具/严格status_id必填/布尔schema校验/删除确认与审批审计恢复点/工具数量及stdio测试，IPC和Web白名单接入；5 动态UI/选择框快捷新增可取消/独立管理/冲突任务列表阻止删除、统计/逾期/甘特/浮窗及demo；6 全质量与契约/Apifox/Git/Wolai/交接读回，真实迁移/安装/独立MCP更新先单独确认。
- UI定位：TaskList.vue约652现有状态Select绑定editDraft.status与固定taskStatus；约917固定Todo/Pending/InProgress/Done数组；openTaskEditor约1080，创建/编辑均弹窗；新状态选择组件应绑定status_id并依据editDraft.project_id查询，底部PrimeVue Button“+”弹上层Dialog，取消不写入、成功选中新状态且保留任务草稿。另找ProjectWorkspace状态管理入口；TaskBoard仍固定三列未改。任何已有未知状态不能再次被看板遗漏。
- 文档同步：本地检查点与交接暂停入口本轮保存，Wolai主/交接仅追加准确暂停回执；数据库设计、API源码契约、Apifox、长期规则尚未更新，因实现未完成，不上传虚构接口或冒称已同步新功能。远端Git保留旧已验证基线，WIP只本地保存，恢复后明确处理推送。
- 设备/数据：本轮没有SSH/生产DB/桌面登录或CRUD/安装/MCP真实工具写操作，没有真实schema7迁移。已安装桌面与服务器/独立MCP仍上轮schema6版本，原安全副本保留；没有本轮新设备连接确认。所有测试与编译文件仍E盘，无活动测试/构建会话需保留；不停止用户正在使用的EasyProject或其它任务。

2026-10-23用户新增交互与删除规则（覆盖下文历史替换删除方案）：任务创建/编辑均为PrimeVue状态选择框，不自由输入；选择框底部“＋添加状态”可在不退出/丢失当前表单的情况下弹出轻量添加/取消，创建成功刷新本项目字典并立即选中，取消不写状态或任务。另有独立项目状态管理菜单。删除前检查引用，列出冲突任务并阻止删除，不提供自动迁移/替换后删除；MCP同样强制服务端阻止，不能绕过。默认列需先显式切换默认，最后一列不可删。

2026-10-23用户确认：三个默认状态基础上允许自行新增项目分类，所有页面动态展示，不设置固定三层归类；MCP须支持状态CRUD，添加任务必须引用该项目已存在状态，允许显式新建状态。

- 优先级：本专项先于NEXT_PHASE的公网运维/截图/es-ES等，其已保存44557ae，不丢弃，不重复部署。当前基线44557ae8e16d85f126f54d10a2f2ad209839587a，codex/audit-release-20261006-api，开工干净；WACAS未定义，实际AGENTS/交接1.12/UPARS1.1.0。开工五小时余92%、周余92%，不重置/唤醒。
- 设计：业务schema7新增项目状态字典，独立TASK_STATUS:完整32位UUID、project_id、名称、颜色、排序、完成属性、默认属性、内置翻译key及软删除字段；每项目独立初始化待办/进行中/已完成。无全局共享字典、无隐藏三生命周期父分类。任务存稳定状态引用，名称变化不破坏关联；默认翻译key与自定义原文分离。
- 约束：状态CRUD复用Rust共享领域服务、审批/写前恢复点/审计/远端revision/账号工作区隔离；MCP不隐式造状态，跨项目/缺失状态拒绝。状态重命名不改变任务身份；修改完成属性时事务维护进度；删除有任何任务引用的状态必须指定本项目有效替代，不允许最后一列被删或任务从看板消失。项目间移动任务须选目标项目状态，不凭同名偷偷映射。
- 兼容：旧原始文本逐项目独立迁入字典，保留原文；仅明确内置Done认完成，未知不猜完成。旧Todo别名受控归一待办；迁移前新副本/事务/关联核验，不直接修改真实库或原备份。JSON导出/导入/恢复、项目模板、桌面/网页/MCP/浮窗/统计/逾期/甘特均需覆盖，不能只改看板。
- 范围：先实现源码/隔离迁移/完整回归/契约与文档同步；本轮尚未授权具体生产迁移与覆盖安装，不能沿用前次0.1.2安装授权。新schema真实迁移/独立MCP替换与重连须交付前单独确认。
- 当前进度：完整核对模型/任务服务/看板及schema入口，确认任务status任意String、看板三列、仅Done完成语义；正在核对所有读写、备份交换、MCP/IPC/Web白名单。尚无产品代码修改，无测试新增通过声明。
- 下一步：定稿稳定引用的兼容返回形态→schema7事务迁移与字典CRUD/正负例→任务引用/项目模板/交换恢复→MCP/IPC/Web路由与权限→动态界面/统计→全门禁→Apifox、Git/Wolai/交接读回。每里程碑查额度与保存。
- 同步/设备：本轮未连接服务器、未操作桌面/真实数据；已确认连接仅上一任务历史证据。当前未提交仅本文，交接/长期规则增补待同步，API还未更改，不提前上传虚构契约。
