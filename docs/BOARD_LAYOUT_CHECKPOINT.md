# 看板固定容器与任务标题提示整改

## 2026-10-23按额度门禁暂停（五小时剩余9%）

- 最新范围加用户新报窄屏“新建项目/工具按钮挤到EasyProject图标”：已确认全局.header-actions绝对定位重叠品牌，改为窄屏正常流/可换行，浮窗入口隐藏长标签；任务嵌入工具栏及动作按钮改可换行/按钮不压缩文字。IAB当前约424×600深色截图确认品牌与工具行分离；项目创建页本身及完整窄屏流程尚未复验，不能称全部修复。
- 看板最新固定420px（不足时缩至100%），不是早期25rem/400px。首两轮矩阵预期2列实际3列，先发现rem根字号及实际内容宽度余量，最终420px后1280/1920/960/640两主题的列数2/4/2/1、无横溢出/换行/列内滚动/左对齐/两行标题等断言均已走过；仍在后续提示断言失败，不能称矩阵整体通过。
- 最新4项生产UI：任务列表完整PrimeVue标题提示+title兜底通过；2项看板深浅矩阵在卡片strong悬停后找不到tooltip失败；跨列拖拽撤销此前两轮通过，420px换行后本轮未出现预期update而失败。必须继续检查Button子内容命中/Tooltip事件，以及跨换行目标滚动时的真实拖拽路径；这只是待定位方向，未确认根因，不得削弱测试或用合成drop冒充实际拖拽。
- 静态/单测：修正新增fixture未知返回类型后lint/typecheck通过，266单测/54文件、release:check/diff通过；这些在最后App.vue窄屏CSS/420px及工具栏CSS微调之前启动，最新build成功，但最后CSS仍需完整静态/相称回归。首轮typecheck新增测试unknown.data失败已补精确JSDoc类型，不使用any/忽略。
- 基线75c418f51b715f2751a803843f274587fb29af90/原分支；WACAS未定义，AGENTS/交接1.13/UPARS1.1.0。全部未提交7文件：src/App.vue、src/assets/workspace-layout.css、src/modules/task/components/TaskBoard.vue、src/modules/task/components/TaskList/TaskList.vue、e2e/ui-consistency.spec.js、docs/BOARD_LAYOUT_CHECKPOINT.md、docs/handoff/CURRENT_STATE.md；随后保存WIP提交，以Git状态为准。未修产品API，Apifox契约无变化已复核无需重传。
- 文档：本检查点/交接已更新，Wolai主/交接待同步此次暂停并读回；Git之前远端网络缺口未关闭，本次WIP仅本地保存，不声称推送。CHANGELOG最终交付记录留待修复/复验通过，不把候选写成上线。
- 设备/服务：无SSH/真实库/安装/MCP替换，现安装和服务器仍上一已验证版。IAB临时演示http://127.0.0.1:1420/?demo=1#/project/demo-project将关闭，演示服务session57316将停止；生产E2E入口自身清理4173，无其它本轮测试后台。没有关机/重置/定时唤醒授权。
- 恢复准确下一步：先读本文件、查额度/Git7文件与WIP提交；不要重做已有效代码。先定位看板提示未出现（可能Button子元素命中但尚未确认）与跨行拖拽无update，补真实可用交互后重跑4专项；补424窄屏品牌/新建项目/工具栏碰撞及内容可达性测试、1280/960深浅与严格CSP复验。之后再静态/单测/构建、Git/Wolai/交接同步；覆盖桌面/服务器另需本轮具体批准，不沿用此前授权。

2026-10-23，目标：固定约400px状态容器自动换行、列内滚动、卡片左对齐/标题两行备注三行及完整PrimeVue提示；任务列表标题补完整悬停提示/原生title兜底。无数据/API/权限变更，不自动继承上一轮覆盖安装/服务器部署授权。

- 基线75c418f51b715f2751a803843f274587fb29af90，分支codex/audit-release-20261006-api；WACAS未定义，实际AGENTS/交接1.13/UPARS1.1.0。开工干净，五小时余20%，界面实现后余16%；不重置/关机/唤醒。
- 已改TaskBoard.vue去掉按状态数平分与max-content撑宽；25rem固定轨道自动换行，窄窗口不溢出，列高clamp/列内滚动、卡片网格stretch且最小宽度0；标题/备注截断和完整PrimeVue提示、成员截断；TaskList标题保留PrimeVue并加完整title，workspace-layout提供可换行受视口限制提示样式。
- 新增生产UI矩阵测试：1280/1920/960/640、深浅主题、固定宽/换行/列滚动/完整提示/键盘焦点；保留既有拖拽/撤销回归。lint初轮通过、typecheck/build进行中，新矩阵尚未执行。真实桌面/服务器未改，未原生验收。
- 全部未提交：src/modules/task/components/TaskBoard.vue、src/modules/task/components/TaskList/TaskList.vue、src/assets/workspace-layout.css、e2e/ui-consistency.spec.js及本检查点。文档/Wolai/Git尚待同步；GitHub此前网络超时缺口仍在，不声称推送成功。
- 下一步：完成build/typecheck，执行新矩阵+任务名提示+拖拽测试；浏览器演示视觉核对，相称单测/静态门禁；记录真实结果/更新CHANGELOG与交接/Wolai/Git。任何新长阶段前查额度，低于10%保存暂停，不继续安装/部署。设备仅本机隔离浏览器测试，无新SSH或真实库操作。
