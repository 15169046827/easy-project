# 甘特导航与滚轮整改检查点

## 2026-10-31 候选开发／复验中，尚未部署

- 最新里程碑：完整前端384单元/70文件通过；lint/typecheck/release元数据过，最终三语build过（既有大chunk警告保留）。补完整MediaQueryList测试替身修正类型错误，减少动画及blur取消测试通过。六严格CSP生产矩阵1920/1280/960深浅全部通过，包含两周双向实际位移、Shift双向跨边延展、两组SVG几何居中及既有创建/层级/纵滚。两轮旧E2E分别在普通未排期及末行框选使用补日前grid.x导致操作落到屏外，均改为可视calendarX后整套6通过；不改产品框选规则/超时/测试数量。
- 最终三语源码完整384单元/70文件再次通过，减少动画mock完整类型、lint/typecheck/元数据/diff复核通过。完整生产界面正在运行，提交候选不等于全量门禁/原生/部署已完成；提交后构建会绑定新产品SHA，不能把dff旧构建身份当最终包。Rust/服务/API源码无差异，原b144954的76+stdio1及server64+20/CI安全证据继续适用，不声称本轮重跑。
- 规则1.25、AGENTS、三语帮助、架构/交接入口/状态/检查点与CHANGELOG已本地更新。当前未提交另含上述文档及三语locale；精确清单以git status为准。下一阶段为最终完整生产UI/HTTP/全量单元与包；五小时余82%/周29%，无额度门禁。仍未接管桌面或连接服务器，本轮更新许可待回复。

- 范围：统一行内日期偏移及左右两周导航为固定尺寸SVG箭头，真实PrimeVue Button保留；两周按钮实际平移14日并短动画，延展日历后仍移动；普通滚轮上下、Shift滚轮/横向触控左右，边缘继续补日，无固定日期窗口边界。减少动画偏好及卸载/失焦/隐藏/缩放取消保护。
- WACAS未定义/待确认；适用UPARS1.1.0、EasyProject规则1.24及本轮明确滚轮要求。分支codex/audit-release-20261006-api，基线dff6c5834bd151b23cbbce58d2cab0afbd4d27d5。正式桌面/网页仍上轮b144954，不把本候选当已交付。
- 已改：新增GanttArrowIcon与useGanttHorizontalNavigation；Navigation排队处理输入，前补日补偿原视角再移动；160ms受控动画及连续按钮累加；deltaMode换算/OS映射Shift deltaX防重复。GanttView箭头插槽、accessible label、flex中心与日历体中心导航；不改业务数据/API/后端/MCP。
- 首轮10项导航单测1失败：同一事件周期缩放后的异步watch取消紧接的滚轮队列，已改同步watch，10项复验通过。追加减少动画/失焦项待完整重跑。lint/typecheck及初版build过，保留既有大chunk警告，不关闭规则。六严格CSP生产层级矩阵含新导航/Shift扩展/居中检查正在执行；完整单元/UI/真实HTTP及最终包/原生仍待。
- 当前未提交：src/modules/gantt/components/GanttView.vue、GanttArrowIcon.vue；composables/useGanttNavigation.js、useGanttHorizontalNavigation.js；src/__tests__/composables/useGanttNavigation.test.js；e2e/gantt-hierarchy.spec.js、e2e/helpers/ganttNavigation.js及本检查点，后续以git status完整核对。
- 下一步：收定向真实浏览器结果，处理新问题并跑相称完整门禁；补规则/交接/Wolai，提交产品后封存最终包及隔离合成原生复验。本轮桌面/网页静态安全更新许可已询问待回复，不继承上轮已耗用许可；不需要改后端/数据库/独立MCP或停止连接。
- 同步：当前本地候选，Git/Wolai/交接新行为未同步，API无变化只复核不重复上传。DOC-SYNC-001及正式发布未通过风险保持。额度开始五小时余91%/周31%，下一耗时阶段前重新查询；无重置/关机/定时唤醒授权。
- 设备：没有桌面控制或SSH连接，本轮未改正式安装、服务器或真实数据；不沿用上轮在线状态。
