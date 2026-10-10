# 界面体验整改检查点

2026-10-10。目标：用户10项任务页体验整改，另统一仪表盘/项目/任务/人员/相关页面的标题、统计、筛选和外边框基准线；保持功能、数据和最小权限。

- 标准：token-saver、EasyProject维护规则、既有UPARS1.1.0及项目质量门禁；WACAS未定义/待确认。
- 基线：codex/audit-release-20261006-api / 15f99122b1296fdf6c233b56d73f974de8b8a0f6；开始工作区干净。
- 已完成第一轮：任务统计图标静态；固定名称与列宽、列选择及偏好保存；父/前置默认展示，跨分页/筛选查询项目关联目录；前置统一MultiSelect且可清空；删除改Dialog；搜索清空按钮；延迟200ms显示真实加载状态，启动主题背景提前初始化；悬浮窗入口增加文字。未修改真实库或客户端MCP权限，未安装新程序。
- 初步验证：Vue类型检查通过；ESLint发现useTaskListQuery超过100行，待拆分整改，不放宽规则。浏览器1280×800实测发现名称占位拖动区造成额外缩进、日期换行和分页选择框过宽，待修正。预览工具已可用，不再沿用历史不可用结论。
- 当前未提交文件：src/App.vue、src/i18n/locales/{zh-CN,en-US}.js、src/modules/task/components/TaskList/TaskList.vue、src/modules/task/components/ProjectList/ProjectList.vue、src/modules/member/components/MemberList.vue、src/modules/task/composables/useTaskListQuery.js、src/modules/task/utils/taskColumns.js、src/composables/useDelayedBusy.js、index.html、public/theme-init.js、本检查点。恢复必须核对完整git status --untracked-files=all，不覆盖其它用户改动。
- 未解决：上述3布局问题与函数行数；单位/浏览器回归待补；用户新增跨页面统一布局待实施；最新安装包及悬浮窗入口需交付，当前旧安装不自动覆盖。
- 准确下一步：修初步发现的问题，统一共享布局类及统计高度，补跨页面几何对齐、表格冻结/列选择/关联/弹窗/清空/加载测试；运行静态、单元、生产浏览器、构建及发布配置门禁，构建E盘NSIS并记录摘要，再同步Git/Wolai。
- 文档同步：本地开始检查点已保存；Wolai仍为MCP接入完成，尚未同步本次整改。
- 设备与额度：本开发Windows，浏览器演示可用；Mac/独立设备未连接，原生新包未验。开始五小时剩余79%、周50%，未重置或定时唤醒；重要里程碑后与昂贵阶段前继续查额度。

## 第二阶段检查点：界面复验完成，准备打包

- 目标/标准/基线同上。跨页共享布局已实施；初轮名称缩进、日期换行、分页宽度和超长函数已修正，未降低检查规则。
- 已完成：静态检查及Vue类型通过；Vitest 38文件186测试通过；Vite生产构建通过（既有XLSX/节假日大块警告保留）；生产浏览器31/31通过。新增7项界面验收覆盖4页面×两尺寸×深浅主题，标题/统计/工具栏/内容x/y/宽度误差≤1px、卡片76px、无外层滚动；冻结列、列偏好、关系全文、前置清空、删除取消/确认与搜索清空通过。第一轮5项测试失败为就绪时序、隐藏输入点击和编辑行定位，纠正定位后完整复验通过。
- 未提交文件完整清单：index.html；src/App.vue；src/main.js；src/i18n/locales/en-US.js、zh-CN.js；src/modules/dashboard/components/DashboardView.vue；src/modules/data/components/DataView.vue；src/modules/member/components/MemberList.vue；src/modules/project/components/ProjectWorkspace.vue；src/modules/task/components/ProjectList/ProjectList.vue、TaskList/TaskList.vue；src/modules/task/composables/useTaskListQuery.js；src/__tests__/composables/useTaskListQuery.test.js；e2e/smoke.spec.js；README.md；CHANGELOG.md；docs/PROJECT_PLAN.md；以及新增docs/UI_EXPERIENCE_CHECKPOINT.md、e2e/ui-consistency.spec.js、public/theme-init.js、src/__tests__/composables/useDelayedBusy.test.js、src/__tests__/task/taskColumns.test.js、src/assets/workspace-layout.css、src/composables/useDelayedBusy.js、src/modules/task/utils/taskColumns.js。恢复先核对Git完整状态。
- 未解决/准确下一步：补最终静态/单元/发布配置/UPARS/Rust门禁；E盘构建NSIS并记录hash；更新本检查点、提交Git、同步Wolai。真实数据未变、新包未安装；原生安装/悬浮窗口验收和正式签名、其它平台仍未验证。本次不改变MCP权限、不发布外部Release。
- 文档同步：README/CHANGELOG/规划和本检查点已更新；Git未提交，Wolai未同步本次工作。
- 设备：Windows和演示浏览器已确认；其它设备未连接。额度：五小时剩余47%、周45%，允许进入打包阶段，无重置/定时唤醒。
