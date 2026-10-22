# 项目跳转与全页面焦点样式检查点

日期：2026-10-22。状态：最终2f409c3已安全覆盖，用户确认各页面及原项目关联任务恢复；本轮修复闭环，正式发布结论不变。

## 用户现场复验已确认

最终同步回执：Wolai主状态v90/交接入口v27均读回最终2f409c3、用户“页面和项目任务都已恢复”、数据保护与验证/未验边界。临时1420/4173服务已停止，演示页关闭、浏览器尺寸已恢复；用户EasyProject pid8492 Responding保留。文档9dcc362cd0ce81edb342ee0c40540cbc9cff1ed6常规推送TLS10054后，既有受控回退已核验同树4b50552974b35ade76ee081f474a14c0aec2f955/同SHA/force=false同步成功；未绕过TLS或强推。代码2f已在远端，API复核无变，无Apifox写入需求。交接RULES/架构已复核符合既定边界，规则版本1.10/79条不变。本最终回执仅文档，不产生新功能、安装或其它外部授权。

用户在最终2f409c3启动后明确回复“页面和项目任务都已恢复”。本轮焦点几何/遮盖有生产自动回归，白屏已取得同类精确反例、完成修复并获原账号现场确认；不把最初b19或诊断5a算作最终通过。未作原生全平台悬停/多屏/DPI矩阵，也未部署网页服务器。本轮额外覆盖/重启授权随本次故障闭环结束，不延伸其它任务。

最终验证：252单测/51文件、75生产UI串行零重试、11真实HTTP、lint/typecheck/build/NSIS/release:check/diff通过；并行甘特一次失败及中间测试/候选失败留在下方历史。最终覆盖431文件新副本/428非程序文件SHA和原DB全表逻辑保持一致/integrity ok/FK0。设备仅本机Windows，独立MCP/服务器/域名与权限未变；原生工具图像不匹配后未继续输入或操作认证。WACAS未定义/待确认，适用AGENTS/维护规范/UI-01—13，非新全库审计。

同步收尾：代码源2f409c3已推送；本检查点与CHANGELOG/handoff入口/当前状态/检查点完成最终更新，Wolai根因候选主89/交接26已读回，最终安装/用户确认回执正在同步。全量WIP仅本检查点、CHANGELOG、handoff README/CURRENT_STATE/CHECKPOINT（无其它产品改动）；下一步仅完成同步/关闭本轮1420/4173临时服务后交付，不再启动新任务。最近额度余27%/22%，不重置/定时唤醒/关机。

## 最终安装证据（现场确认已由上节补齐）

- 产品源 `2f409c3e86c80554a02afb760a8fc5e41df1eaee` 已推送，252单测/51文件、75生产UI串行零重试、11真实HTTP全部通过，规范/类型/build/NSIS/release元数据/diff通过。此前b19未修根因、5a诊断收集以及并行甘特失败均保留历史，不隐藏失败。
- 根因证据：用户 `SyntaxError · Button · 17` 与中文历史状态的生产fixture错误上下文完全一致；vue-i18n INVALID_ARGUMENT=17。`t(undefined)`在回退前抛错，现只翻译自有已知key，未知历史状态原值安全展示，不改DB状态，兼容Todo/Pending。
- 按本轮必要覆盖授权完成原E盘安装退出0。全新安全副本 `src-tauri/target/audit-tools/project-navigation-overwrite-20261022-status-fix-2f409c3`，431文件复制，428原非程序文件SHA不变，原库全表逻辑一致/integrity ok/FK0；独立MCP仍EC9C6EFE...且配置/权限未改。副本含敏感数据，仅本机受限ACL，不上传。
- 最终NSIS 6,317,572字节，SHA `7883386095AA4DC46E07B0B66110332B384F5E7B5AB36638DB12AC2E91092479`；raw主程序 `9D47A65776E39BD92A6403300CA92FE3B856579A89676483077D0F3A9439271D`；安装主程序 `F5E1976A212E3A80D8B2EF448B3B903A4ABD0A9A61E8E56097E52CD9CA5DF89C`（只允许Tauri UNK→NSS内存核验）；随包companion `37D0A3466A0DE4EE89FB6F5C40AF626BE57948004F2F4F2E482030782C8BD487`，不是独立Codex MCP。固定产物 `project-navigation-final-2f409c3/manifest.json`，三文件逐份SHA保留。
- 已重新启动最终版本，等待用户原账号验证仪表盘、各页、原项目关联任务；不能以隔离验证冒称现场通过。原生工具图像不匹配已停止输入，不操作登录/真实业务，未删除缓存或改安全设置。
- 服务器/域名/Funnel/服务器部署和独立MCP均未变，API契约复核无变，不机械重传Apifox。正式发布仍未通过。
- Git产品/交接已推送；Wolai主89/交接26已读回根因与候选，安装最终回执待同步。仅本检查点未提交。下一步取得用户现场结果→必要续修或同步最终文档/Git/Wolai/交接→关闭本任务演示/预览服务，保留用户EasyProject运行。

## 阶段历史：现场失败、诊断与根因修复（以上方最终验收为准）

最终根因修复候选已通过252单测/51文件、全75生产UI串行零重试、11真实HTTP，以及规范/类型/build/release:check/diff；75项独立截图/输出保存在`src-tauri/target/audit-tools/project-navigation-status-fix-ui-evidence`。保留此前并行甘特失败记录，不宣称从未失败。准备提交源码/构建NSIS/新副本覆盖，当前真实安装仍5a8ecda，等待最终现场复验。

根因修复门禁里程碑：252单测/51文件通过，lint/typecheck/build/release:check/diff通过，含中文状态的真实HTTP11项通过。首轮并行生产UI为74通过/1既有甘特日期用例失败（期望2026-07-20、实际2026-06-30），未改断言/延时/超时/产品甘特逻辑；无其它浏览器测试并发的全量串行复验中，该甘特用例已通过，完整结果待收尾。生产反例在修复前精确显示`SyntaxError · Button · 17`，修复后同一fixture跨仪表盘/项目/关联任务/其它主页面通过。当前未提交清单：CHANGELOG、本检查点、handoff README/CURRENT_STATE/ARCHITECTURE/CHECKPOINT、e2e project-navigation/web-server、useStatusLabels.js与新增useStatusLabels.test.js。源码基线72f405b89f481694cacab4476b77303176a5f390；分支仍codex/audit-release-20261006-api；当前安装5a8ecda诊断版。下一步收齐75生产UI结果→提交→NSIS→本轮已批准新副本覆盖→用户原账号现场复验→Git/Wolai/交接收尾。Wolai尚未同步本次根因修复；API/DB/服务器/独立MCP不变。最近额度余37%/23%，不重置/唤醒。

2026-10-22具体诊断已取到：用户报告 `PAGE_RENDER_FAILED / SyntaxError · Button · 17`。本地安装依赖源码确认vue-i18n/core-base INVALID_ARGUMENT=17；新增生产合成fixture把项目状态设为中文“进行中”，在原5a8ecda代码上精确复现同样Button/17与仪表盘消失（失败证据Playwright错误上下文）。根因：useStatusLabels对不在内置枚举中的状态执行`t(undefined)`，原`|| status`回退在异常后无法生效，仪表盘按钮/项目页受影响；原覆盖没有修到此根因。

已开始最小整改：仅映射自有明确key时才翻译，未知/历史字符串安全显示原值（不改库），空/非字符串保持缺省；防原型键误匹配，任务Todo/Pending同待办。新增真实vue-i18n4单测，生产回归覆盖中文状态从仪表盘→项目→关联任务及其它主页面，真实HTTP合成项目亦保留中文状态。最终门禁和新安全覆盖待完成，不提前宣称现场通过。用户本轮必要覆盖/重启授权仍有效。

诊断候选5a8ecda24011290e03280e5b9477c9323e6ce4a1已推送并按本轮明确授权安全覆盖，NSIS成功、248单测/6生产专项通过。新副本 `project-navigation-overwrite-20261022-diagnostic-5a8ecda`：426文件/423非程序文件不变、DB全表逻辑一致/integrity ok/FK0、独立MCP不变；未操作登录或CRUD。NSIS6317725字节/SHA8782185295925B0C735CE7C54B4BA046BC35B4228408CB59F693B53F7C393BC6，raw exe D40A469626E98D0A855C48790D31DD5ABD23B1A63F976075E2839A96896233F8，安装exe F1256B11BEB9C8120CD2C20D6466137A29F2B742B8F3304741CD430682977BD0，随包companion A5183DFFBE088900CB9A08807D5591B3B29BDF8700790DB1CCE8BF4207E6A06D。产物固定于 `project-navigation-diagnostic-5a8ecda`。已正常关闭旧程序而非强制结束，重新启动等待用户登录重现具体本地诊断文字；任务仍未完成。Wolai主88/交接25记录源码和失败边界，安装回执待同步。仅本检查点未提交。

2026-10-22用户已明确授权本轮必要的新安全副本、覆盖和重启直到定位修复，仅本轮有效。新增 `src/utils/pageFailure.js` 及3项单测，只显示内建JS错误类型/受控组件名与脱敏限长文字；任意Error消息不展示、URL/ID/邮箱/长凭据形状串替换，不持久化/传输。WorkspaceRouteView显示本地详情。248单测/50文件、lint/typecheck/build通过，6项生产专项复验中；未再次安装。原生工具依技能完整读取/初始化后窗口绑定元数据虽匹配，实际图像不匹配，已停止所有输入；只启动过现有程序，未操作认证或真实数据。最近额度余48%/25%，无重置。

用户在补丁启动后反馈全部页面显示同样 `PAGE_RENDER_FAILED`，截图为登录后的仪表盘，顶部导航仍在。不能宣称修复已完成，不能把245/74/11隔离测试当现场通过。进程1924 Responding/EasyProject；启动后DB全表逻辑摘要仍与412文件安全副本一致、integrity ok/FK0。当前路由捕获只显示大类诊断，尚不足定位；下一步获取受控具体JS错误/组件，核对原生实际环境与HTTP fixture差异，再做最小整改。当前代码b19d6f1已推送；仅本检查点未提交。Wolai主86/交接23仍是候选证据，须同步用户现场失败。不要盲目重复同一安装或扩大权限，服务器/独立MCP仍未动。

## 2026-10-22 已覆盖桌面，现场复验待用户

- 产品源码 `b19d6f16579ed93356ca9b32e0945a20dd447718` 已推送，245单测/49文件、74生产UI、11真实HTTP最终通过；lint/typecheck/build/release:check/diff通过，NSIS release编译成功。无Rust/数据库/API/依赖源改动，未冒称本轮重跑Rust全套或全库审计。
- 用户明确批准后在原E盘安装覆盖退出0。全新受保护副本 `src-tauri/target/audit-tools/project-navigation-overwrite-20261022`，412文件复制、409非程序文件逐份SHA未变；原数据库全表逻辑摘要一致、完整性ok、外键0，独立MCP SHA仍EC9C6EFE...，配置/权限不改。副本含敏感本地数据，仅当前用户/SYSTEM权限，不上传。
- NSIS 6,319,572字节，SHA256 `6852A7357ABECD779C928FCCD504AF16DD0C03AA0B41DC7AE93D186F3686D33E`；raw主程序 `F0CC36C52E0D771AA10C3287C2BF6D40BA51AD6A3BD98E4DFC69F1ACD05BCD25`；安装主程序 `D7C61F1AAACD78A1C0E8D33C72ADC05FC71CF54F455303D71E5C7B5E72EDFA33`（只允许Tauri UNK→NSS标记的内存核验通过）。随包companion `6D75F4E5CB115BAA3B1A220E1ACDE8C680D21AEABA7FA9D9D9D14B87B515FFE2`，与独立Codex MCP交付区分。
- 固定产物 `src-tauri/target/audit-tools/project-navigation-b19d6f1/manifest.json`，三份程序/包及逐份摘要已保留，后续构建不得以最新mtime代替此候选。
- 浏览器演示项目→任务正常，生产完整语义UUID、严格CSP、5子视图/主页面交互及Cookie/Bearer导航通过。新增模拟模块不可达/渲染失败恢复均有测试。原始截图只有项目区域白屏的现场根因仍未取得，不能宣称已根治；需用户在新桌面原账号/原项目点击复验，若仍失败反馈 `PAGE_MODULE_LOAD_FAILED` 或 `PAGE_RENDER_FAILED` 以继续定位。
- 本轮原生自动操作界面不可用；实际安装文件和启动响应与原生hover/登录后项目交互是不同验收。没有登录/自动CRUD验收，没有清WebView缓存或改本机安全设置。
- home-host、Funnel、域名、服务器版本和独立MCP均不改；API契约复核无变化，不机械重传Apifox。正式发布仍未通过。
- Git源码/交接已推送，Wolai候选读回主v86/交接v23；本次安装最终证据正在同步。所有下方“尚未部署/待复跑”为阶段历史。
- 最近额度五小时余57%、周余26%；无重置/唤醒/关机。后续先核对本检查点与Git，不重复安装或重放历史迁移。

## 当前里程碑

2026-10-22末轮全部通过：245单测/49文件、74生产UI、11真实HTTP（含网页及桌面Bearer进入项目任务页）；规范/类型/构建/release:check/diff检查通过。准备提交源码、NSIS构建和用户已批准的本机安全覆盖；服务器与独立MCP不部署，现场原始白屏根因仍未证实。

最终候选门禁（源码待提交）：规范/类型/构建与245单测/49文件通过；生产预览完整74项通过（原68+新增6），11真实HTTP项按设计在独立服务器套件中执行而非算跳过验收。新增模块失败返回、模板/看板真实PrimeVue回归通过。末轮单测曾因并发负载出现1项PowerShell启动>5秒，未放宽检查，降低worker到2后全245通过。真实HTTP曾把未完成的项目懒加载hash导航算入后续刷新，已在测量前等待项目页/URL就绪，保留零重载/一次登录/相同Bearer等原断言，最终11项复跑中。

已批准安全覆盖的辅助脚本仅在忽略目录 `src-tauri/target/audit-tools/install-navigation-hover-20261022.ps1`；执行前仍须新NSIS/主程序/随包companion SHA和精确源码提交，不能沿用历史包摘要。预检现安装/无运行程序/无链接/无SQLite sidecar/既有WebView2；新E盘ACL副本、全文件摘要、全表逻辑摘要及完整性/外键均核验，不改独立MCP。原生操作工具本轮未提供可操作应用，不能把浏览器回归声称为真实桌面悬停/登录后的复验。

- 用户截图证据：桌面登录后顶部导航仍在，项目内容区域全白；尚未取得该现场的运行时错误，不能断言已定位原始白屏根因。
- 已复现：项目名称按钮 hover 被 PrimeVue 默认状态覆盖，造成表格列位移/窄窗行高+2px；项目视图切换亦有2px高度变化。修复精确组件选择器，不关闭主题/CSP、不使用全局忽略；项目表固定列布局，长名称省略/tooltip，命名路由携带完整ID。
- 连带整改：项目返回/视图切换、模板、看板、任务树展开按钮，明确 hover/active/focus 颜色、边框与焦点环，保留真实 PrimeVue。
- 新增 WorkspaceRouteView：模块加载/子页面渲染失败显示脱敏诊断码、重试/返回项目入口，保留现有 App/内存登录；不整页 reload、不切源。首次单测发现失败导航返回原路由不会触发 guard，已修返回显式清理错误，待最终复验。
- 第一阶段证据：新增4个生产构建/严格脚本与样式CSP场景，1280×800/960×640、深浅模式、完整PROJECT UUID和5子视图及其它主页面通过；原始4场景均先失败于列位移，再暴露视图按钮问题。未以此冒充原生问题全部解决。
- 第一轮真实HTTP11场景9通过/2失败，失败是新增断言误用不存在的 `.task-page.embedded`，AX显示项目/任务表正常；已改实际 `.panel.embedded`，须重跑。测试只操作新建隔离库。
- 第一轮lint有格式14项，已格式化；typecheck通过；单测244通过/1失败（上述返回清理问题），整改后完整门禁进行中。
- 用户已明确批准：最终验证后创建E盘新安全副本并覆盖本机桌面安装。没有服务器部署、改域名、独立MCP替换/权限扩大的新授权。
- 当前未提交：`e2e/web-server.spec.js`、`src/App.vue`、两语言locale、ProjectTemplateDialog、ProjectWorkspace、ProjectList、TaskBoard、TaskList，以及本检查点/`e2e/project-navigation.spec.js`/`src/__tests__/router/WorkspaceRouteView.test.js`/`src/components/WorkspaceRouteView.vue`。
- 下一步：门禁复验、补模块失败恢复/其它按钮测试、构建NSIS并固定摘要、新安全副本后覆盖，记录实际可用的原生验证边界，再同步Git/Wolai/交接。若现场仍白屏取得诊断码续查，不宣称原始根因已证实。
- 最近额度：五小时剩余73%、周剩余29%。本机演示1420和生产预览4173为本任务启动；未连接home-host。Git/Wolai/交接仍待阶段同步，API契约无变化。

## 开工记录（历史）

- 目标：修复项目表格悬停/焦点列位移和遮盖、项目详情空白；连带检查其他页面相同交互。服务器名称/公网地址保持不变，不修改真实业务数据。
- 标准：WACAS 未定义/待确认；适用 AGENTS、EasyProject 维护规范、既有 UI-01—UI-13；非新一轮全库 UPARS 审计。
- 基线：`codex/audit-release-20261006-api` / `0b2cb03ccf1e064cd4ba38c777f79fa7ecfe3f4f`，开始时工作区干净。
- 当前未提交：本检查点。尚未修改产品代码。
- 已完成：读取维护技能、交接规则/当前状态/架构及项目组件/路由/既有测试，开始共享样式排查。
- 验证：尚未执行新测试；开发服务启动，浏览器首次连接超时，待确认进程与网络可达性。不是产品缺陷结论。
- 未解决：两个用户问题根因未证实，其他页面尚未完成动态检查。
- 下一步：复现并记录浏览器错误/几何变化，增加失败回归，最小修复，再执行规范/类型/单测/构建及生产 UI 回归。
- 文档同步：Git/Wolai/交接尚待本任务里程碑同步；API 契约预计无变化，完成时复核。
- 额度：本轮最近查询五小时剩余85%、周剩余31%；不使用重置或定时唤醒。
- 设备：仅本机开发环境；本轮未连接服务器/操作真实安装或独立 MCP。演示浏览器不能替代原生 Tauri 验收。

用户另提供马来西亚测试者可直接打开公网页面的反馈；仅证明该测试网络可达，不等于全部地区稳定性已验。域名调整已暂缓。
