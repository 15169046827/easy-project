# 状态预设色与原生看板拖拽

## 2026-10-24扩展范围与续接

原生门禁未通过并继续整改：d2e5d41的真实release在E盘隔离合成工作区，1280x800主窗本地入口/项目/看板可用，但两次sky原生HTML5拖拽无写入，SELECT确认仍Pending；不据此安装旧候选。配置false虽为官方要求，不能冒称单独充分。现看板改应用内主鼠标指针手势（阈值8px、内部按下来源/状态ID目标、取消/失焦/卸载清理、拖后不误开编辑、快速事件合并处理），保留外部drop默认导航阻止；触屏普通滚动不抢。待单测/浏览器/新原生再验。原Tauri配置保留供任务表HTML5路径。尚未更新真实桌面/服务器/MCP。Git d2e5d41已通过现有系统代理命令级非强制推送/完整SHA读回；Linux CI40077325372两job成功，后端905E493D…已下载E盘。Apifox参考32篇同步逐项已读回，原生66接口仍待更新；Wolai候选状态已读回。

打包前检查点：源码已固定d2e5d41cbed8fce8d24b728761f40130d90fe95d（本轮48文件），当前产品源码无未提交；仅后续回执文档会新增差异。最终生产UI在两并发/无同时编译的受控资源条件下90通过、12真实HTTP由独立runner另验；此前8并发遇既有存储键盘确认与重置焦点时序失败日志保留，不删测试。服务端38+16最终通过，前端273/API10/Rust58+stdio1及静态通过。Wolai主/交接候选状态和父子任务待讨论已读回；Apifox只读计划中网络HTTP0失败，尚未执行写同步。额度五小时余48%，周76%。用户已批准停止已核对旧MCP进程24436/46452/8768（路径artifacts/mcp/easyproject-mcp.exe）；替换前需再核对PID/创建时间，不能杀其它新进程。未SSH/安装，原生待隔离验证。下一步：NSIS/release候选→E盘合成原生拖拽→实际契约同步/新副本安全更新→最终数据与文档/Git核验；不迁移库、不清历史数据、不扩大权限。

最终回归补记：前端273通过；Rust58+stdio1/clippy通过；服务端38通过，远端新增反例触发两份拒绝恢复点，断言期望由16改18后专项通过，不削减安全副本。全量生产首次发现甘特日期测试在开放DatePicker中Tab焦点陷阱，保留日期/写入断言，明确失焦后三次重复通过。独立HTTP发现旧测试发送中文项目status“进行中”，新枚举正确拒绝400；fixture改为InProgress而不是放宽接口，待全量再验。未安装/未SSH，正式发布结论不变。

里程碑补记：用户已明确允许本轮新副本后更新服务器后端和独立MCP，不迁移库/批量清理旧数据/扩大权限，已有连接需重连。新增嵌套日历字典/日期范围检查及导入回滚；模板任务复用字段校验；High/Normal/Low展示映射为2/3/4，原值不改。任务关系/项目/人员/甘特/浮窗/数据页全文提示补齐。272前端单测（新增priority后待最终计数）、Rust58、server38+16及clippy通过；规范最终lint/typecheck/release:check/diff通过。5项生产专项通过（含父任务全文提示深浅主题），完整102项生产UI套件进行中。曾因沙箱网络隔离EACCES/超时失败，使用同一受控环境启动预览与测试后恢复，不放宽应用CSP。五小时余62%、周78%，未部署/未SSH。

用户追加：统一校验MCP/API受控字典（含优先级/类型/项目状态/排期模式等）、补全所有截断列全文悬停、UI与MCP防重复状态（含默认Done显示“已完成”的别名冲突）。历史非法值/重复行不自动改写合并或删除。状态色UI与原生拖拽仍在本轮。父子任务展示/统计仅记入`PARENT_CHILD_TASK_DISCUSSION.md`，本轮结束后讨论，不实施。

已完成候选：共享field_dictionary供实体边界/MCP schema/导入复用；数字范围与优先级混合别名排序；按项目的状态名trim/大小写/默认中英显示名冲突校验，事务内执行；导入事务最终校验；任务列新增title全文后备（尚待全界面核对）。Rust58测试全部通过，只有增量缓存硬链接改复制提示。生产UI颜色/拖拽专项5通过；新追加范围仍待测试。五小时余70%，周余80%。WACAS未定义，适用UPARS1.1.0专项报告，不冒称全项目新审计。

未提交文件：e2e/smoke.spec.js、scripts/check-release.js、src-tauri/src/common/{mod.rs,task_status.rs,field_dictionary.rs}、src-tauri/src/db/task_db.rs、src-tauri/src/mcp/{tests.rs,tools.rs}、src-tauri/src/services/{data_service.rs,entity_api.rs,task_status_service.rs}、src-tauri/tauri.conf.json、src/__tests__/components/{TaskStatuses.test.js,statusColors.test.js}、src/components/{TaskStatusManager.vue,TaskStatusSelect.vue,StatusColorSelect.vue}、src/i18n/locales/task-status-{en,zh}.js、src/modules/task/components/{ProjectList/ProjectList.vue,TaskBoard.vue,TaskList/TaskList.vue}、src/utils/{taskStatus.js,statusColors.js}、本检查点、父子任务讨论记录；后续按git status核对。

下一步：补重复/导入回滚/排序测试与既有冲突提示→逐项核对截断字段与全部写入边界→最终门禁/专项报告/API契约与Apifox→候选打包及E盘合成原生拖拽→按已批准范围安全部署；后端/独立MCP替换扩展需确认。未动真实数据、安装或服务器；本轮尚未SSH，原生控制已初始化但未操作。Git/Wolai/交接/Apifox新契约尚待同步，不能声称交付完成。

2026-10-24，基线9e78fc3f41033c32ac784ec299baad9d9009a153，分支codex/audit-release-20261006-api，开工干净。WACAS未定义，适用AGENTS/交接1.13/UPARS1.1.0；开工五小时余91%，不重置/唤醒/关机。

- 用户要求：自定义状态可用颜色集及看板拖拽无效整改。已明确批准本轮验证通过后，新E盘安全副本覆盖桌面与更新网页；不迁移库/批量改旧色/MCP权限，不继承上一轮副本。
- 明确原生配置缺陷：tauri.conf主窗未设dragDropEnabled，Tauri2默认true会替换Windows WebView2原生drop handler；官方v2.tauri.app/reference/config/#dragdropenabled明确HTML5拖拽需false。主窗from_config实际继承，现显式false；浮窗无业务拖拽不改。release:check与单测加入防退回门禁，HTML5 dragstart补内部ID DataTransfer/effectAllowed，drop阻止外部默认导航；不接受外部task ID写入。
- 颜色UI：8个具名预设色共用真实PrimeVue Select，快捷新增与管理菜单复用StatusColorSelect；优先未用色、用完选最少次数，建议大小写一致。管理保留手输合法hex和原自定义色，旧状态不自动改色；本轮不改变MCP/API数据契约或服务端默认灰色规则，MCP依旧可显式提交color，不扩大到旧数据批量重涂。
- 初步11项单测通过。初轮UI因新控件可访问名缺失/fixture三状态全灰导致建议Blue而非Violet失败，已补aria-label和按实际fixture校验；第一次lint与并发格式化相撞曾4格式错误，已格式化，待最终复验。尚未声称原生Windows真实拖拽通过，计划E盘纯合成工作区进行原生验证。
- 当前未提交：scripts/check-release.js、src-tauri/tauri.conf.json、src/__tests__/components/{TaskStatuses.test.js,statusColors.test.js}、src/components/{TaskStatusManager.vue,TaskStatusSelect.vue,StatusColorSelect.vue}、src/utils/statusColors.js、src/i18n/locales/task-status-{en,zh}.js、src/modules/task/components/TaskBoard.vue、e2e/smoke.spec.js、本检查点。后续以git status完整核对。
- 下一步：颜色/拖拽专项回归→最终静态/全量单测/生产UI与独立HTTP→固定源码/NSIS→E盘合成原生拖拽验证→新副本两端更新/数据及MCP原字节保护→Git/Wolai/交接同步。设备尚未SSH/未动安装/真实库，API形状未改Apifox无需机械重传；不能用浏览器回归冒称原生验收。
- 额外外部任务已反馈旧MCP问题按新版status_id写入验证正常并自行关闭；未对此任务真实业务库操作，不另行修复或扩大范围。
