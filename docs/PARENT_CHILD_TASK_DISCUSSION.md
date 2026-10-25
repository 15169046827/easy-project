# 父子任务体验：已批准，开发进行中

## 2026-10-25低高度原生补验（进行中，最新）

最终阶段回执：13HTTP/90生产UI均通过，最终类型/lint/diff通过；键盘物理点击后Tab已见导航焦点框、编辑名称Tab到项目选择器正常。UIA点击不等于Web键盘焦点，不能据此前无效按键判产品故障。新版原生低高度仍等用户再次缩窄（候选重启默认1280×800），不称完成；旧候选946×633已真实发现问题且自动复验闭环。最近额度5h余13%/周86%，不另起新的长阶段；先同步本轮保存，不继承关机/真实部署权限。未提交：e2e/web-server.spec.js、src/modules/task/components/{TaskList/TaskList,TaskStatusStatistics}.vue、本专项、docs/audit/PARENT_CHILD_AUDIT_2026-10-25.md、docs/handoff/{README,CURRENT_STATE}.md。Wolai与Git本轮追加回执即将同步；API不变，既有Apifox同步仍有效。

用户已手动缩窄，实际截图946×633（不能称精确960×640）暴露低高度、多字典统计占满任务区问题。新增EP-PC-004/P2：低高度统计限一行内部滚动，任务局部面板可滚动且表格最小20rem，应用标题栏仍在外层。新增6个合成状态的HTTP层级用例，960×640深浅检查统计≤80px/任务区≥120px。首次补测任务区57.47px失败，未降断言；补面板滚动/最小高度后13HTTP全部通过，完整90生产UI也通过。283前端单测通过；类型/lint通过（最终CSS补丁需再最终核对），Rust未改复用既有72+1/server50+16有效证据。

新NSIS打包通过（已验证dist后不重复重写资源），SHA5084CA6789B4038E9EB6EA3A58BF3C3E70A03494F00554063AD39E4493DAEDA8；旧524CD...不再是最新候选。隔离候选app已刷新并重新启动，仍仅合成数据；重新启动默认登录，选本地入口不操作登录表单。新版原生低高度/键盘最终复验仍待，不能把旧窗口检查当新版通过。本轮开工5h余28%，最近余20%/周87%，未触门禁；无迁移真实数据/安装/部署/关机。

本轮基线daae92586d9f9273809c6eedd1a13a33e6f5a535，分支不变；WACAS未定义，标准和目标范围不变。当前未提交为e2e/web-server.spec.js、TaskList/TaskList.vue、TaskStatusStatistics.vue及本检查点/后续审计与交接同步。下一步完成原生新候选低高度/键盘，补EP-PC-004及最终门禁回执，Git/Wolai/交接同步；API未变不用重复Apifox。已有部署审批仍不继承。home-host本轮未连接。

## 2026-10-25候选收尾检查点（最新）

源码封存：a5aa95810e1849dd4d3eac1e42efdb0182c0bde5已提交并非强制推送，远端完整SHA读回一致，提交后Git干净。Wolai主/交接SHA及边界回执读回通过；本最小文档回执另存。隔离原生编辑草稿已取消，未保存业务改动；原生仍1280×800（含系统边框1282×802），窄窗口/完整键盘待补，不虚报完成。用户已收到手工缩窄请求，等待确认；无真实升级或关机。

- 目标/范围仍为8项批准父子方案；WACAS未定义/待确认，适用AGENTS、交接1.15、维护skill与UPARS1.1.0。功能基线db7e149，本轮基线3f467ac63802399a6f57f13d3257f6a80ccc0b40，分支codex/audit-release-20261006-api。本节点5h余31%/周89%，非额度暂停；上次关机授权永久失效，无重置/定时唤醒。
- 完成：候选功能及本轮3项P2整改均已复验；283前端/59文件、桌面Rust72+stdio1、server50+16、10项Python迁移工具、10项Apifox契约测试、类型/lint/双fmt/双严格Clippy/build/release:check通过。最终生产90项和真实HTTP13项串行通过。初次生产88/2导航错误恰逢另一构建重写dist，构建结束后全量90通过，未改断言/重试。日志parent-child-{tests-4,rust-4,server-final-3,production-5,http-4,nsis-5}.log均在target/audit-tools。
- NSIS成功，SHA524CD1C9F9B12B3E5DE1160B75CA9C78BA39D18AB8D05AF2303567624FEF6302；首次受限makensis系统DLL623失败、正常宿主重试成功，无系统设置修改。只生成候选，未安装。隔离原生app路径见上阶段，已实际启动合成schema7→8并用核验器确认3项目/3任务/9状态和全部原字段/ID/关联保留、integrity=ok/外键0。
- 原生证据：1280×800浅/深任务汇总、行下抽屉、真实PrimeVue编辑弹窗显示通过。用户先自行退出候选里的远端登录、明确确认本地使用后才继续；未读写真实业务数据。原生960及完整键盘矩阵仍待，不能把失败缩放/未生效键盘当通过；本机Alt+Space被快捷工具截获，未改全局设置。用户可手动缩窄后补验。浏览器1280/960深浅矩阵已通过但不替代原生。
- API：候选debug实际23工具/合成DB SHA不变，66原生/32参考及18HTTP已同步Apifox并读回；来源3f467ac+dirty=true，不替换已安装MCP。分组同步网络HTTP0中断发生于66接口全部读回之后；两个同步流程并发共用manifest的本地摘要风险已通过只读逐份32参考等于目标后校准，随后串行全量只读计划66接口UNCHANGED且参考分组核对通过，18HTTP均VERIFIED。以后共用manifest写流程必须串行，读回不匹配先停不盲重试。
- 专项审计：docs/audit/PARENT_CHILD_AUDIT_2026-10-25.md，范围取数80文件/64代码配置，P0/P1=0、P2三项均闭环、P3=0。专项代码层通过，正式生产仍未通过；无新通用标准条款，既有规则已覆盖数值/分页/一致性。未做本轮全仓库/全依赖新扫描，不延长旧例外。
- 同步：CHANGELOG/规划/发布与交接入口已更新；Wolai主页面/完整交接增补本轮结果及未验边界并读回。代码/API/报告待本轮明确Git提交/推送后补SHA回执，不能先称Git已同步。
- 全部未提交：.github/workflows/ci.yml、CHANGELOG.md；docs/{PARENT_CHILD_TASK_DISCUSSION,PROJECT_PLAN,RELEASING}.md、api/{DESKTOP_IPC,MODELS}.md、api/{catalog,apifox-documents,apifox-layout,apifox-manifest,web-apifox-manifest,web-openapi}.json、handoff/{README,CURRENT_STATE,CHECKPOINT}.md、audit/PARENT_CHILD_AUDIT_2026-10-25.md；scripts/{build-api-catalog,build-web-api}.js、{verify-effort-migration,test_effort_migration}.py；src-tauri/src/common/{task_effort,task_rollup}.rs、db/task_db.rs、mcp/tests.rs、services/{data_service,entity_api,project_service,task_tree_service}.rs；src/api/taskCatalog.js、src/__tests__/api/taskCatalog.test.js、components/ResourceLoadHierarchy.test.js、project/ProjectWorkspace.test.js；src/modules/dashboard/components/DashboardView.vue、gantt/composables/useGanttProjectData.js、member/components/MemberList.vue、project/components/ProjectWorkspace.vue、task/composables/useTaskListQuery.js。提交后以Git为准。
- 下一步：补原生窄窗口/键盘并保存实际结果；最终Git/Wolai SHA闭环。之后另请用户授权新保护副本、真实schema7→8、桌面覆盖、服务器及独立MCP更新/客户端断开协调；不直接升级。真实库/当前安装/服务器schema7保持，未SSH home-host、未部署，没有本轮服务器在线证明。候选窗口暂保持以供窄屏复验，测试runner已自动关闭合成回环服务。

## 2026-10-25续接里程碑三（候选复验，未部署）

- 目标仍为下方8项批准方案；WACAS未定义/待确认，实际适用AGENTS、维护skill、交接规则1.15、UPARS1.1.0。基线3f467ac63802399a6f57f13d3257f6a80ccc0b40，分支codex/audit-release-20261006-api。开工工作区干净，本轮改动均属本任务；关机授权已失效，不重放。
- 额度开工5h余97%/周100%，本节点余68%/95%，未触门禁。没有额度重置或定时唤醒。
- 已完成整改：派生父日期参与排序/逾期判断后再分页；共享完整任务目录消除各视图1000条截断；稳定加权均值避免有限大数相乘溢出，聚合溢出在写事务/导入/模板提交前拒绝。新增完整schema7→8字段/ID保留只读核验器与6项测试、完整数据库迁移及资源负载不重复统计回归，CI加入迁移核验器测试。
- 最新验证：前端283/59文件通过；桌面Rust72+真实stdio1通过；server50+16通过；类型/lint、两个工程严格Clippy及生产构建/release:check通过。Python迁移核验器6项通过。格式最终复核、完整生产90/真实HTTP13与原生严格CSP/候选NSIS尚在收尾；不将运行中视为通过。大块构建与增量硬链接复制环境警告保留。
- 契约：隔离schema8合成库实际发现23工具，前后DB SHA不变；66原生/23目录/18HTTP已重新生成，TaskSummary纳入模型。候选debug MCP来源3f467ac+dirty=true、SHA8E1112121B545B0DFFFAD5B788ECD3FC30C3D8E73FF70C7CF21EA639D09A1DF7，不是已安装MCP。Apifox尚未同步新生成契约。
- 准确下一步：完成串行生产/HTTP全量复验；隔离E盘原生候选启动合成schema7副本，核验迁移保留和严格nonce下1280/960、深浅/键盘。完成专项UPARS报告、API/Apifox读回、Git/Wolai/交接闭环；真实迁移、覆盖安装、服务器部署及独立MCP替换仍须另外确认。
- 本节点全部未提交：.github/workflows/ci.yml；docs/api/{DESKTOP_IPC,MODELS}.md、{catalog,apifox-documents,apifox-layout,web-openapi}.json；scripts/{build-api-catalog,build-web-api}.js、{verify-effort-migration,test_effort_migration}.py；src-tauri/src/common/{task_effort,task_rollup}.rs、db/task_db.rs、mcp/tests.rs、services/{data_service,entity_api,project_service,task_tree_service}.rs；src/api/taskCatalog.js、src/__tests__/api/taskCatalog.test.js、components/ResourceLoadHierarchy.test.js、project/ProjectWorkspace.test.js；src/modules/dashboard/components/DashboardView.vue、gantt/composables/useGanttProjectData.js、member/components/MemberList.vue、project/components/ProjectWorkspace.vue、task/composables/useTaskListQuery.js；本检查点与交接入口。后续新增以Git为准。
- 同步：本轮代码尚未提交，Wolai/Apifox仍待，不能声称同步完成。设备仅本机E盘合成测试，未SSH home-host、未修改真实账号/项目库、安装或MCP。隔离候选目录src-tauri/target/audit-tools/parent-child-native-20261025，原生尚未启动；测试runner会自行关闭它的隔离回环服务。

## 2026-10-25额度暂停检查点（最新，从这里继续）

最终封存：候选e3c77601b43e1284b53e1b8eef699dba2e3cab33已本地提交/非强制推送并完整远端SHA读回。首次push SSL重置，核远端仍db7e149后一次有界重试成功，未改TLS/代理配置。提交后Git干净；Wolai主/交接已同步该SHA、阶段验证、准确缺口并读回。最新5h余5%硬门槛/周53%，仅保存此最小回执即停止；不做代码/API/外部接口修改，不关机或重置。真实HTTP串行13/13最终通过；其余未完成项如下，不能称完整候选验收通过。本最小文档回执另提交保存。

- 目标/范围仍为8项批准父子改造；WACAS未定义/待确认，实际适用AGENTS、维护skill、交接规则1.15、UPARS1.1.0。基线db7e149dae18948a9e96846ac279a68a0dbb9314，分支codex/audit-release-20261006-api。恢复时Git干净，本轮全部修改由本任务产生，无他人重叠修改。
- 额度：开工5h余96%/周67%，里程碑余68%/63%、45%/59%、19%/55%，最新5h余9%/周54%，触发10%长任务门禁。保存后暂停，不启动新长任务、不重置、不定时唤醒、不关机。上次一次性关机已执行且用户明确失效。
- 已完成候选主体：schema8/JSON8估算来源事务迁移及旧0待确认、备份5—7恢复升级、XLSX按版本字段；共享迭代工作量/进度/日期汇总和零权重null；父派生字段只读；hierarchy=true根分页、祖先context_only、两维字典统计；PrimeVue估算输入/统计口径/多层行下抽屉（子项选择、编辑、新增、全文提示）；甘特零工作量日期独立、单开始日期当天短条、未排期列表；资源负载不重复计算派生父项。账号仍schema3。UI/Web/本地与远端MCP共用完成约束，远端仅放行限定层级冲突说明，内部SQL/路径仍脱敏。
- 结果：279前端单测/57文件通过（之后新增1项开始单日期Gantt测试尚未再次全量运行）；桌面Rust70+真实stdio1通过；server49单元+16集成通过；构建/release:check通过；类型/lint及桌面严格Clippy通过。server严格Clippy曾通过，但其后新增远端层级错误白名单及远端MCP回复，仍需最终全量fmt/Clippy/Rust重验；不得把此前检查当最终候选全部验证。已有holiday/XLSX大块、Rust增量硬链接复制环境警告保留，未降低阈值或关检查。
- UI证据：生产完整首轮88通过/2失败/13 Web专用跳过；两处失败为旧控件定位（前置选择器隐藏input和已替换旧统计class），按真实新控件定位修正后定向2/2通过，不删测试。真实HTTP首轮12通过/1失败：四场景矩阵同hash导航保留前一场筛选/展开，第二场等待“展开”超时；每场显式reload后串行13/13通过，未增重试或超时。真实HTTP新用例含1280/960浅深四矩阵、根计数/工作量/拒绝完成冲突/抽屉编辑/筛选父上下文；截图test-results/hierarchy-{1280,960}-{light,dark}.png。两套runner曾并行共享test-results，失败输出可能覆盖；已改最后串行运行，之后完整生产+HTTP应保持串行。
- 浏览器手工：本机隔离demo已确认空工作量DOM值为空/placeholder待估算；新增演示子项后根总数不增加、父零权重显示待估算，并正常展开抽屉。仅演示数据，不是业务后端CRUD证明。IAB新标签2（已核实URL127.0.0.1:1420/?demo=1#/tasks）；第一次沙箱预览不可达，提升为宿主回环预览后成功，不改代理/证书。
- 准确下一步：恢复先读此段、额度/Git/diff；先补最终fmt/类型/lint、280项预期单测及全量Rust/Clippy复验，再将生产90项和HTTP13项串行跑一次（不能冒称已有单次90通过）。补ResourceLoad排除父项的专项回归、估算来源/真实副本7→8保留核验器与测试；检查全量task read/date排序、各视图分页边界。再进行隔离原生桌面严格nonce/1280/960/键盘验证及候选打包；未做的原生CSP不能拿浏览器代替。
- API/文档缺口：MCP.md、数据库设计、IPC/协议总览和API入口已写候选语义；catalog/MODELS/apifox-documents/layout/HTTP契约及私有Apifox尚未生成同步。需扩展build-api-catalog模型清单包含common/task_rollup.rs的TaskSummary，使用新编译隔离候选MCP+相匹配manifest及不再写入的schema8合成库，只读发现23工具且数据库SHA不变；不要覆盖artifacts/mcp或当前客户端。然后增量同步私有Apifox/读回、Git/Wolai/交接闭环。下方旧API已部署来源不是新候选能力。尚未专项代码审计/最终验收，不是完整交付或正式发布通过。
- 设备/数据：本轮未SSH home-host、未读写真实库、未覆盖桌面/独立MCP、未部署服务器或扩大权限；仅E盘隔离测试/缓存/产物。维护预览进程会正常停止；测试runner结束会自行关闭其隔离服务器。无实体设备/服务器新连接证明。真实schema7与账号3不变，候选真实升级仍须另外确认。
- 当前全部未提交（提交保存后以Git为准）：docs/{DATABASE_DESIGN,MCP,PARENT_CHILD_TASK_DISCUSSION}.md、docs/api/{DESKTOP_IPC,OVERVIEW,README}.md、docs/handoff/{ARCHITECTURE,CURRENT_STATE,README}.md；e2e/{smoke,ui-consistency,web-server}.spec.js；server/src/{maintenance,mcp,workspace}.rs；src-tauri/src/common/{db_state,field_dictionary,mod,task_hierarchy,task_effort,task_rollup}.rs、db/task_db.rs、mcp/{tests,tools}.rs、models/task.rs、services/{data_service,entity_api,mod,task_service,task_tree_service}.rs；src/__tests__/components/TaskHierarchy.test.js、composables/{useGanttPresentation,useGanttTaskEditors,useTaskListQuery}.test.js、data/xlsx.test.js、gantt/{interaction,taskFormSchedule}.test.js；src/api/{demo,demoHierarchy}.js；src/components/{ResourceLoadPanel,TaskEffortInput}.vue；src/i18n/locales/{en-US,zh-CN}.js；src/modules/calendar/utils/scheduling.js、data/utils/xlsx.js、gantt/components/{GanttTaskDialog,GanttView}.vue、gantt/composables/{useGanttCreateEditor,useGanttEditEditor,useGanttPresentation,useGanttTaskDragging}.js、gantt/utils/{interaction,taskFormSchedule}.js、task/components/TaskList/TaskList.vue、task/components/{TaskChildrenDrawer,TaskStatusStatistics}.vue、task/composables/useTaskListQuery.js、task/utils/taskRowPersistence.js；src/utils/taskEffort.js。
- 同步状态：本段与交接/候选说明已本地保存；代码与检查点即将做明确范围Git候选提交，Wolai主/交接同步本阶段及缺口并读回，最终SHA/远端状态另补最小回执。API/Apifox缺口如上，不称全部同步。

## 2026-10-25里程碑二（开发中，不是交付）

- 目标仍为下方8项批准方案；WACAS未定义，适用AGENTS/维护skill/规则1.15/UPARS1.1.0。基线db7e149dae18948a9e96846ac279a68a0dbb9314，分支codex/audit-release-20261006-api，开工干净。开工5h余96%/周67%，本节点余68%/63%，未触门禁。
- 已实现候选：schema8事务估算来源迁移（保留旧值，旧0=legacy_unknown，正值=estimated）；JSON8与1—7兼容导入、旧备份恢复升级；共享迭代汇总（1万层测试不递归）、父只读工作量/进度/日期，零权重progress=null；读接口summary元数据，任务/甘特估算输入PrimeVue组件、空值/明确0提示。没有真实库/服务器/安装/MCP替换。
- 当前验证：server48单元通过（新增6迁移/聚合测试），原有事务保护测试已改查原始存储验证回滚，不把只读汇总当手填进度。首轮schema兼容/测试fixture问题已整改。前端类型检查发现Gantt估算/summary/derived类型声明未补齐，尚未通过；lint在运行，完整Rust/stdio/Web/E2E/构建及UI/CSP尚未执行，不能交付。
- 准确下一步：补Gantt类型与未填写默认、清理未用导入；接共享根分页/筛选上下文/动态双维统计；以根DataTable展开槽实现行下紧凑多层抽屉，替换同级flatten展开。然后补契约/迁移/写入/MCP/UI测试，完整门禁、API/Apifox/Wolai/Git同步。真实升级仍须另确认。
- 本节点全部未提交（均本轮）：server/src/maintenance.rs；src-tauri/src/common/{db_state,field_dictionary,mod,task_hierarchy,task_effort,task_rollup}.rs、db/task_db.rs、mcp/tools.rs、models/task.rs、services/{data_service,entity_api,task_service}.rs；src/i18n/locales/{en-US,zh-CN}.js；src/modules/calendar/utils/scheduling.js；src/modules/data/utils/xlsx.js；src/modules/gantt/components/GanttTaskDialog.vue、composables/{useGanttEditEditor,useGanttPresentation,useGanttTaskDragging}.js、utils/{interaction,taskFormSchedule}.js；src/modules/task/components/TaskList/TaskList.vue、utils/taskRowPersistence.js；src/components/TaskEffortInput.vue、src/utils/taskEffort.js；本检查点。后续新增以Git为准。
- 文档：本检查点先保存；阶段二Wolai/Apifox/交接与Git尚未同步，不能声称闭环。设备：仅本Windows本地隔离测试，未重新连接home-host，无真实数据操作；所有本机写入在E盘。上次关机授权已执行并失效，禁止重放。

## 2026-10-24续接里程碑一：共享完成约束候选

最终静态回执：server与桌面`cargo fmt --check`均通过，两个工程`cargo clippy --all-targets -- -D warnings`均通过；本阶段server42+16、桌面62单元均通过。Wolai主页面与交接副本已增补批准方案和候选边界，等待本阶段提交SHA读回。按用户本轮关机要求保存本阶段，不声称额度耗尽或整个功能完成。

阶段封存回执：源码/检查点e62e32e579817f2ee426da7788c7f4c05c47303a已推送并完整SHA读回，提交后Git干净；Wolai主/交接的源码SHA、候选边界与关机前回执均已读回一致。本段及单次关机实际状态另作最小文档提交。home-host已发送正常关机并在随后SSH探测超时，本机最后执行一次正常关机；后续不能重放。下一步不变，从工作量来源/schema8设计继续。

- 目标/范围：继续下方8项已批准设计；本阶段仅落地共享后端完成约束，整体功能未完成、未交付。WACAS未定义/待确认；适用AGENTS、EasyProject维护skill、交接规则1.15及UPARS1.1.0。
- 基线：c6295744e331b454d407b85ac84dcedd126b2fe7，codex/audit-release-20261006-api。恢复时仅本文件与handoff/README、CURRENT_STATE为上次保存的文档，无无关修改。开工五小时余100%/周69%，后查余96%/69%；不是额度耗尽暂停，不重置、不定时唤醒。
- 已完成：检查TaskList/taskTree/任务模型/数据库初始化/服务/状态/导入/模板与共享Web路径；新增common/task_hierarchy.rs，在同一事务内保护所有祖先/后代。父完成遇未完成后代拒绝并返回ID/名称；完成祖先下新增/移动任务（即使新子任务已完成）要求先显式重开；重开后代或修改状态字典完成属性不能绕过。失败连同进度/状态更新一并回滚。导入和模板同样检查；软删除子任务不算未完成，非关联历史冲突不阻塞其它分支。
- 未做：工作量持久化及历史0待确认迁移、多层权重汇总、日期/甘特、顶层统计分页、筛选上下文、行下展开抽屉、UI反馈及API/MCP契约更新。业务schema仍7、账号schema仍3，没有真实库操作、安装/部署、独立MCP替换或真实CRUD验收。
- 测试：新增4项隔离共享领域/事务测试通过；server完整42单元+16集成及严格Clippy通过；桌面Rust62单元通过。首次编译发现MutexGuard借用及语句生命周期问题，已修正后复验。增量缓存硬链接退化复制为环境警告，不是关闭检查。未运行本轮前端/浏览器/桌面CSP验收，旧轮结果不算本轮通过；fmt/桌面严格Clippy最终结果另补回执。
- 准确下一步：核对本检查点/Git/额度，从schema8的effort估算来源字段及版本化事务迁移设计开始（正值/明确0/未估算/历史待确认），同步模型/查询/导入导出/MCP。接着实现单一共享层级汇总与测试，再接顶层分页/筛选抽屉和甘特/UI全矩阵。候选全部验证后，真实迁移/部署仍需另行确认。
- 文档同步：本阶段规则/架构/交接已更新；Git/Wolai同步以最终回执为准。Apifox不以半成品候选覆盖已部署契约，本轮未改变参数/Schema；新持久化契约完成后须更新实际API目录、Apifox并读回。
- 未提交文件（保存检查点时）：本文件、docs/handoff/{README,CURRENT_STATE,RULES,ARCHITECTURE}.md、docs/ONE_TIME_SHUTDOWN_2026-10-24.md、src-tauri/src/common/{mod.rs,task_hierarchy.rs}、src-tauri/src/services/{entity_api,data_service,project_service}.rs。提交后以Git实际状态为准。
- 设备连接：本机hostname=Colin；home-host已SSH认证确认hostname=home-host、账户ym_li、easyproject服务active；无免密SSH/sudo，不更改认证配置。测试/缓存/临时写入均E盘。用户本轮新增一次性双机关机授权单列[回执](ONE_TIME_SHUTDOWN_2026-10-24.md)，不能从历史记录继承或重放。

## 2026-10-24最终决定与开发授权

用户明确“都批准了，准备好了可以开始开发”。以下为已批准需求，覆盖下方早期讨论候选；不是仅供参考的提案。

1. 父任务代表交付目标，子任务为执行拆分；父任务仍有负责人、截止时间、整体状态，不只是文件夹。所有层级沿用本项目状态字典，不把父任务限制成固定三态，不新增隐藏状态父分类。
2. 叶子任务手动进度；有子任务的父任务按直接子任务预计工作量加权汇总进度，不手动填总进度；父工作量由子任务逐层汇总，不重复计父自身投入。多级递归聚合，进度100%不自动完成父任务，仍待整体确认。
3. 工作量需区分未估算、明确0（无工作量）、正值；未填写与0计算时都按0、不参与权重，但父任务需提示未估算数量。全部权重0：存在未估算则“待估算”，全部明确0则“无工作量”，均不显示误导百分比。历史0没有填写来源，标为“待确认”，不得认定用户明确无工作量；保留原值及关联。具体持久化字段/迁移方式须先核对现有架构，不先猜实现。
4. 甘特图日期跨度与工作量分开：0工作量但有起止日期正常画条，只有开始日期画当天短条且不自动成为里程碑，无日期进入未排期任务。父任务日期汇总最早子任务开始/最晚结束，部分未排期提示不完整。
5. 默认统计和分页均以顶层任务为单位（包括无子任务的独立任务），展开子任务不占外层分页名额；提供“全部任务”统计维度切换，状态卡片按项目字典动态展示，明确口径。
6. 筛选命中子任务时保留父级上下文并自动展开，区分匹配任务与仅展示父级，不混淆统计口径。
7. 样式确定为父行下方内嵌展开抽屉，不是侧边Drawer。轻底色/留白/圆角，不画连接线、不延续外层交替染色；内部紧凑任务信息、完成数量、直接新增子任务，不重复全套工具栏/外层分页，多级继续原位展开。通用交互控件仍用真实PrimeVue。
8. 父任务进入完成属性状态前检查全部未完成子任务并阻止；父任务已完成时新增/重新打开子任务，必须先显式选择父任务恢复到哪个未完成状态，不自动猜选。UI、MCP、Web共享服务端约束，不能只在前端检查；多级祖先一致性一并设计与验证。

本次授权为开发及隔离验证；真实数据库迁移、覆盖安装、服务器部署、独立MCP替换不继承上一轮的一次性授权，候选验证完成后另行确认。全程保留数据/关联，维护环境写入仍在E盘，Git/Wolai/交接/API/Apifox按影响同步。

## 额度门禁检查点（暂停，未开始开发）

- 目标/范围：实现上述已批准父子语义、工作量、汇总、统计分页、抽屉、筛选、排期和完成约束；不是继续上轮颜色/拖拽已完成任务。
- WACAS未定义；实际适用AGENTS、交接规则1.14、UPARS1.1.0及EasyProject维护skill。
- 基线c6295744e331b454d407b85ac84dcedd126b2fe7，分支codex/audit-release-20261006-api；开工git status干净。
- 开始前五小时剩余6%，周剩70%，低于10%长任务门槛；不启动代码修改、构建/迁移/部署，不重置、不定时唤醒、不关机。仅保存本必要检查点。
- 已完成：需求讨论和用户最终批准、读取维护skill/项目参考/最近交付检查点、只读核对Git。未修改产品代码、数据库或MCP；没有本轮新测试/构建结果，上轮275/90+12等不能冒充本轮验证。
- 未提交文件（本检查点保存后）：本文件及docs/handoff/{README.md,CURRENT_STATE.md}；无产品代码。Git提交/推送及Wolai同步若受额度门禁暂缓，明确留待恢复，不称已同步。
- 准确下一步：用户通知额度恢复后先查额度、读本检查点、核对git diff/status；再读TaskList/taskTree/工作量与甘特编辑器、Rust模型/服务/导入/迁移/MCP/Web及相关测试，形成一致的持久化/递归聚合/分页查询与迁移设计，再分阶段实施。不得重做上轮部署，不能直接运行候选迁移真实库。
- 文档同步：已批准方案保存本指定项目文档和交接入口；Wolai/API/Apifox尚未更新本新功能（没有实际新契约），恢复后先同步批准方案，契约变化后再同步实际schema并读回。
- 设备连接：本轮未SSH、未操作桌面/服务器/设备；上轮确认在线不等于本轮重新确认，不能假定当前PID/连接状态。

## 以下为早期讨论历史

2026-10-24用户要求：本轮状态颜色、拖拽、写入校验与全文提示整改完成后再讨论。本记录不是实施授权。

- 当前疑问：任务列表统计把父子任务同时计数，统计卡片又未跟随自定义状态；父子同层统计可能造成重复理解。
- 展示候选：子任务展开区域有明确缩进/容器/层级样式，不沿用普通同级行的交替染色；具体样式待讨论。
- 统计/分页候选：仅按顶层任务计数，或者提供顶层任务与全部任务两个明确维度；需要讨论筛选后的层级、孤立子任务和分页展开规则。
- 状态候选问题：父任务是否需要限制默认三状态、子任务才用自定义状态？尚未决定，不改变已批准的项目级自定义状态规则。
- 讨论顺序：先定义父任务是可执行任务还是汇总容器，以及完成状态/进度是否独立或聚合，再定统计口径、分页、样式和MCP语义；避免先改UI导致契约冲突。

下一步：完成当前专项后与用户讨论上述选项，不自动开发、迁移或修改真实数据。
