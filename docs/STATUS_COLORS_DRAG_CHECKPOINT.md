# 状态预设色与原生看板拖拽

## 最终已交付（2026-10-24）

本轮已完成桌面/网页/后端/独立MCP安全更新，不再是候选。产品c74bccaaa33f48917a525b19139050f10d3b7de3、后端d2e5d41cbed8fce8d24b728761f40130d90fe95d均已推送读回；后续只有UI/测试/文档变化。WACAS未定义，UPARS1.1.0，规则1.14/79条。专项代码审计通过（P2六/P3一均fixed），正式生产仍未通过，未公开新安装包。

- 最终验证：275单测/56文件、90生产UI零重试（2并发）、另12独立HTTP、11组件/20专项、Rust58+stdio1/server38+16、lint/typecheck/build/clippy/release/UPARS检查通过。真实Windows1280×800严格桌面CSP隔离任务Pending→Testing及Ctrl+Z撤销均界面/SQL确认；正常TLS两HTML/63静态SHA/4匿名401/health200通过。不冒称原生全矩阵/macOS/真实账号全量CRUD。
- 桌面新受限副本`audit-tools/dictionary-overwrite-c74bcca-20261024`：534原文件/531非程序及DB全表一致，启动后DB再核对一致，已启动PID480，未操作登录。NSIS1B79CB65…，安装主exe BFABC9B3…与release979A6C55…仅offset14072768—14072770的Tauri bundle标记UNK→NSS三字节差异，其余完全相同。隔离验收窗已关闭。
- 独立MCP新受限副本`audit-tools/dictionary-mcp-c74bcca-20261024`；只停止获批且再核对创建时间/路径的24436/46452/8768。独立/伴随MCP均65ABB83278C10DB6BE34958470668C59B78E99FAC18FC4FA5693F53212878165；配置/权限不变，当前Codex须重连，不能把磁盘更新当客户端已加载。release实际23工具/合成DB SHA不变，API已重绑实际来源。
- 服务器current=`/opt/easyproject/releases/dictionary-c74bcca-20261024`，新root700副本`/var/backups/easyproject/dictionary-c74bcca-20261024`；65文件校验、204旧assets保留、2DB全表一致/integrity ok/FK0。无migrate-storage或真实CRUD，受限easyproject active/enabled/PID1986，后端905E493D…/CI40077325372两job成功。Funnel/Origin/CSP/域名/SSH暴露未变，服务器保持开机，无关机授权。
- Apifox66原生/32参考已按实际release来源同步并逐项读回，HTTP18无语义变化不机械重传。Wolai/交接最终交付回执及Git文档提交正在收尾；以最终同步回执为准，不声称未完成部分已完成。当前未提交仅收尾文档/生成契约manifest，无产品代码。
- 历史非法值/重复状态/旧色不批量改写或合并，用户逐项确认改名/选合法值，任务引用保留。原生全矩阵/macOS/签名/既有公网运营风险仍保留。下一步只讨论`PARENT_CHILD_TASK_DISCUSSION.md`中的定义/统计分页/层级/状态限制，不自动开发。下方候选/未部署/验证中仅为历史，不重复安装或迁移。

## 2026-10-24扩展范围与续接

部署前里程碑：最终产品源码c74bccaaa33f48917a525b19139050f10d3b7de3已推送/完整SHA读回；最终275单测/56文件、90生产UI（另12HTTP独立通过）、20专项、Rust58+stdio1/server38+16及静态通过。真实Windows1280x800严格桌面CSP合成库：新PointerEvent方案成功Pending→Testing，界面成功提示/列计数0→1，直接只读SQL确认status_id=6a7564714d04464498f16e4b189c2c63；Ctrl+Z后SQL恢复原PendingID d93d8848a0e3484e85d5da66b1364971，未误开编辑。只操作隔离dictionary-native-d2e5d41，真实库无CRUD。旧d2e原生失败历史保留。

候选NSIS SHA1B79CB65427C6FAB69C99B2EC52E2B2A49471CCAB8AE17101D0D47EE70050CA3，主exe979A6C55EE9D7B1F94E5261E7B8A86C716E5BDB75B7B2840A77DFBB6E2C254C0，MCP65ABB83278C10DB6BE34958470668C59B78E99FAC18FC4FA5693F53212878165。后端CI40077325372/d2e5d41两job通过，905E493DF2F3D4206EEF670FC1C3655BD3C936DA9C152B54863CDF328A0DD98F；后续c74仅前端/测试/回执，后端Rust未再变。65文件部署包00beb3ef75359ed9b46ece6f798f110b5ffc1d773b430711898534116ae5a676。原生窗口当前仍隔离任务页，下一步关闭隔离窗→新E盘保护副本覆盖真实安装→已批准3个旧MCP进程核对/停止/独立新副本替换→服务器新root700副本/相同schema后端+前端更新→正常TLS/API/数据不变核验→契约实际release来源/Apifox/Git/Wolai/交接最终回执。不以候选产物假称已安装。

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
