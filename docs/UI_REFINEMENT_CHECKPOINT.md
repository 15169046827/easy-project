# UI交互与悬浮球整改检查点

## 开始（2026-10-16）

- 目标：统一仪表盘卡片/关注任务/成员名称悬停与键盘焦点；状态统计跳转筛选；进度滑动+百分数输入；浮窗可调整大小且最小尺寸可用；收起为可拖动、可吸边/悬空的悬浮球；相关界面深浅/窄屏/键盘/CSP回归。
- 标准：WACAS未定义/待确认；实际适用UPARS1.1.0、EasyProject维护及AGENTS的PrimeVue/CSP/数据保护/额度规则。
- 基线：b7f1f19e10676c7c432298512d7c208d8855760a；分支codex/audit-release-20261006-api；开工Git干净。
- 已完成：读技能、项目上下文、前次闭环与相关实现/测试；当前五小时剩余90%、周98%，可开始。不重置、不定时唤醒。
- 未提交文件：本检查点（后续以完整git status为准）。尚无代码修改、无本轮测试结果。
- 未解决：用户本轮提出的全部问题，正在定位样式与原生窗口实现。前次192单测/40回归仅为历史基线，不替代本轮复验。
- 准确下一步：修复统一交互、状态路由与进度组件，实现受限窗口大小/悬浮球吸附；补测试后执行静态/类型/单元/生产浏览器/Rust门禁；原生构建和真实Windows验证，不修改业务数据。
- 文档同步：已保存本地检查点；本轮Git/Wolai未同步。保持内部测试状态，不公开Release。
- 设备：仅本Windows开发机已确认；本轮浏览器/原生窗口尚未重新连接，未确认其它设备。

## 实现与首轮复验里程碑

- 基线/分支/范围及WACAS未定义、实际UPARS1.1.0等标准同上。五小时剩余58%、周93%（打包前尚须再次查询），未重置/唤醒。
- 已完成：四统计统一真实PrimeVue按钮及非几何交互；关注任务不出现瞬时边框且保留键盘焦点；成员头像固定32px、行高稳定；状态/完成/逾期路由筛选和后端参数化查询（待办兼容Todo）；共享滑块+百分数输入，甘特图原生编辑表单/按钮替换PrimeVue；浮窗八边缩放、展开最小340×360、64px悬浮球、四边吸附/自由位置、键盘移动与调整尺寸、DPI物理坐标和工作区限位。
- 已验证：200单测/41文件、44生产E2E（44.7秒，无重试）、lint/typecheck/build通过；Rust40单测+1真实stdio集成通过，新增状态/逾期/无效日期/注入值过滤测试。默认D盘cargo缓存离线依赖不全，切换既有E盘项目cargo-home后成功，没有改系统/关闭检查。初次2项前端路由断言/2项浏览器定位与关联目录查询断言已按新行为精确修正，完整复验通过。
- 后续补充：悬浮球拖动/键盘单测、尺寸与严格nonce CSP进度条回归，以及避免收起时旧内容裁切的状态顺序调整；这些最新变更的最终门禁正在运行，不能用上一44例替代。
- 全部未提交文件：CHANGELOG.md；README.md；docs/PROJECT_PLAN.md；e2e/smoke.spec.js；e2e/ui-consistency.spec.js；src-tauri/capabilities/task-floating.json；src-tauri/src/db/task_db.rs；src-tauri/src/floating_window.rs；src/__tests__/components/FloatingTaskWindow.test.js；src/__tests__/components/PrimeVueControls.test.js；src/__tests__/router/deepLinks.test.js；src/api/demo.js；src/assets/workspace-layout.css；src/i18n/locales/en-US.js；src/i18n/locales/zh-CN.js；src/main.js；src/modules/dashboard/components/DashboardView.vue；src/modules/floating/FloatingTaskWindow.vue；src/modules/floating/windowActions.js；src/modules/gantt/components/GanttView.vue；src/modules/member/components/MemberList.vue；src/modules/task/components/TaskList/TaskList.vue；src/router/index.js；docs/UI_REFINEMENT_CHECKPOINT.md；src/__tests__/components/ProgressEditor.test.js；src/__tests__/components/floatingWindowActions.test.js；src/__tests__/components/windowGeometry.test.js；src/components/ProgressEditor.vue；src/modules/floating/useFloatingBall.js；src/modules/floating/windowGeometry.js；src/modules/gantt/components/GanttTaskDialog.vue。
- 未解决/下一步：确认最新静态/类型/单元/46生产E2E；构建E盘NSIS、记录摘要；安全覆盖原E盘目录（另建不覆盖旧副本），真实桌面验证透明悬浮球、拖动四边吸附/悬空、扩展恢复/最小尺寸、PrimeVue进度和导航过滤；数据只读复查；最后Git/Wolai同步。未公开Release、未改MCP或业务数据。
- 文档同步：README/CHANGELOG/PROJECT_PLAN及本检查点已更新；Git/Wolai未同步。演示IAB连接成功，实际操作确认进行中统计跳转有效；仅Windows已确认，其它设备未连接，原生新版未构建/安装。

## 最终自动化通过，准备原生打包

- 最终204单测/42文件通过；新增悬浮球拖动误触抑制/吸附/方向键、原生窗口API尺寸记忆/缩放最小值/物理坐标/浏览器隔离。测试模拟PointerEvent在当前jsdom的只读属性赋值失败，改用真实MouseEvent构造器分发同名pointer事件后通过；未放宽断言。Tooltip按真实指令注册，消除测试告警。
- 最终完整46/46生产浏览器通过（54.4秒，无重试），包括四页面深浅/1280/960几何、卡片/关注行/成员几何、状态实际查询/清除、滑块键盘/数值/保存、浮窗340×360及500×600填充/操作可见/球展开、严格nonce CSP进度条和Dialog动态样式。lint/typecheck/build/release:check/diff检查通过；Rust40+stdio1、格式通过。保留既有XLSX/日历大块警告。
- 打包前五小时剩余53%、周93%，允许开始；仅Windows已确认（当前无EasyProject窗口）。UPARS校验脚本直接执行被本机执行策略阻止，正在用已完整审阅的脚本内容和显式项目根进行只读校验，不修改机器执行策略。
- 未提交范围为上节全部文件，加README.md、CHANGELOG.md、docs/PROJECT_PLAN.md、src/__tests__/components/floatingWindowActions.test.js；后续以Git完整状态核对。基线/分支/目标/实际标准/WACAS与文档同步状态同上。
- 准确下一步：E盘构建NSIS并验证摘要，安全覆盖已有安装（新建独立安全副本、不卸载），原生透明球/八边拖动/工作区吸附/尺寸恢复/状态筛选与进度只开不保存验证；再Git/Wolai。业务库/MCP权限未改变，正式发布限制保留。

## 原生验收发现快速拖动起点时序（继续修复）

- 首包NSIS6227248字节、SHA9841BCE9FA2A6B9BE2C5C67EC37BAA9122E472D74E35792969F1CF27FB91C74D；覆盖原E盘成功Exit0，14文件SHA不变，独立副本target/audit-tools/ui-floating-ball-20261016/safety-copy保留；安装exeSHA8A4BFF9A50DC7F8485FEB2D97A88930D37AEF84E5B89AEFCAE47DF6E32FC5DAB。只读库完整性ok/外键0，1项目5任务4依赖0成员0团队5基线。
- Windows真实确认：340×360最小拖动约束；方向键扩大356×376；原生右下拖动缩为348×368（真实边角缩放有效）；收起为64×64球；方向键移动真实位置有效、无权限错误。刷新同窗口，5任务内容与固定页脚正常。球的快速鼠标拖动未产生位置变化，不能记为通过。
- 根因：异步读取光标起点可能晚于快速拖动结束。已改为在pointer-down同步记录client坐标，由原生窗口位置+缩放率换算物理起点，移动仍用真实物理光标；新增晚返回场景单测。未改权限/CSP/数据。
- 当前基线/分支/标准/全部未提交文件仍同上（新增本节相关3文件均已在清单内）；Git/Wolai未同步交付。最后查询五小时47%、周92%。准确下一步：最终静态/类型/205单测/46生产E2E通过后重新打包；正常关闭主窗/球，换ui-floating-ball-final-20261016新安全副本覆盖；重验快速拖动/吸边/悬空/展开记忆，再同步。当前已安装首包不是最终版本，不向用户声称完成。

- 快速拖动修正最终lint/typecheck、205/205单测（42文件）、生产46/46（60.0秒，无重试）与构建通过。Windows主窗已正常Alt+F4退出并确认球同步关闭，无草稿/业务写入；UPARS1.1.0只读校验通过且未改执行策略。重打包前五小时剩余37%、周90%，允许开始。下一步安全副本改ui-floating-ball-final-20261016，不能覆盖首副本；真实快速拖动验收仍未完成。

## 快速拖动原生通过，统计兼容性最后补正

- 第二包6230177字节，SHA6A724F8361AD25F851D575E01F2D2E7ACF82B0C767A87728960E07A048457088；原E盘覆盖Exit0，11数据文件SHA不变；安全副本ui-floating-ball-final-20261016/safety-copy保留，安装exeSHA1B0EBE8B679EC8F664D5C546F8C8308F8F4364000CCC0AE0F6AB35F7E0EE6D9D。
- Windows最终快速拖动真实连续坐标y336→280→224→168→112→56，释放点y20自动吸附y0，拖离后y55自由悬空，点击展开正常；透明球/固定页脚/刷新与方向键移动已验。四边算法/负坐标/DPI阈值由单元覆盖，当前原生只实测上边，不能冒充多屏全矩阵。
- 原生点击待办统计确实跳转待办筛选并返回5条Todo；打开PrimeVue编辑实际可见滑块与0%数字、取消固定可见，取消未保存。发现任务页待办统计仍只计Pending而显示0，已补Todo计数并新增精确生产断言。该一行源改动需最终复验/重包，当前第二包不包含最后统计修正。
- 最后查询五小时25%、周88%，尚可继续；基线/分支/标准/WACAS/未提交范围与外部同步状态仍同上。下一步静态/类型/205单测/46生产回归完成，再E盘重包；正常退出，独立ui-floating-ball-accepted-20261016副本覆盖，只复核最终计数与取消；球逻辑未再改变，不重复全部有效原生步骤。随后Git/Wolai提交闭环。无业务写入、无MCP权限改变、无公开Release。

- 最后计数兼容补正静态/类型/205单测及构建通过；最终46项生产E2E包含待办计数断言。原生编辑只打开与取消，无保存；退出后数据库完整性ok/外键0、全部六类业务计数不变。最终打包前五小时22%、周88%，允许开始最后打包阶段；新包安全副本使用ui-floating-ball-accepted-20261016。

## 最终交付验收通过（2026-10-16）

- 最终NSIS6231511字节，SHA256 53D438AE56AF6DCFADE868EE2D20A723DE391B219EF7AD2DEF0689BE610F3D8D，18:39:30完成。覆盖原E盘runtime-current-user/app，Exit0；11个已有文件摘要不变，独立安全副本target/audit-tools/ui-floating-ball-accepted-20261016/safety-copy及前序副本保留。安装exe SHA C75DF93EEFB2A9D81AC5CC89016E52A061895E982F25C9748E72695102BF9641；按Tauri唯一UNK→NSS标记在内存规范化后与release逐字节相同（仅3字节差异），未修改二进制文件。校验器最初把共享前缀当作唯一标记而拒绝，检查两个合法常量后改为定位唯一完整UNK标记，通过严格整文件比较。
- 最终205/205单测（42文件）、46/46生产E2E（59.9秒，无重试，含Todo统计）、lint/typecheck/build/release:check、Rust格式40单测+stdio1、UPARS1.1.0与diff通过；保留既有大块警告，没有放宽规则或删除测试。
- Windows真实验收：340×360最小约束、356×376键盘放大、348×368原生右下拖动；64px球及透明背景、快速连续拖动、进入24px范围自动贴顶、拖离后自由悬空、点击展开、方向键移动、五条任务与固定页脚/刷新同窗口；最终计数修正版点击待办统计进入真实5条Todo，任务页待办统计为5。真实编辑可见PrimeVue滑块与百分数输入，取消未保存。首包至最终只在快速拖动起点和Todo统计继续补正，其余仍有效的原生结果未重复冒充新测试。
- 已解决用户本轮全部功能点；四边吸附算法/负坐标/DPI阈值有单测，当前原生仅实测上边，混合DPI/多显示器/独立设备和其它平台全矩阵未验。当前真实库无人员，成员行由真实PrimeVue浏览器深浅/键盘/几何回归验证，未为手测写入真实人员。仍为未签名内部测试版，正式发布限制与原例外保持。
- 当前仅Windows连接确认，最终主程序浅色任务列表打开且无草稿；WACAS未定义/待确认，实际标准同上。五小时17%、周87%，未重置/唤醒。基线仍b7f1f19，原分支不变；31个本轮代码/测试/文档文件待提交，GitHub基线只读复查一致，无并发提交；README/CHANGELOG/规划及本检查点更新，Wolai已读版本47但本轮交付尚未追加。
- 准确下一步：提交已验收31文件，校验同树/同SHA非强制同步原GitHub分支，追加Wolai脱敏交付记录并读回，再保存同步闭环；不再修改产品或重新打包，不公开Release，不改变MCP权限或业务数据。
