# 项目独立任务状态改造

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
