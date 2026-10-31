# 甘特导航与滚轮整改检查点

## 2026-10-31 原生发现深色行内箭头沿用固定深蓝，最终候选需重封存

- 三项CSS主题变量整改后lint/typecheck/build及六严格CSP矩阵全部通过，旧候选PID35140已确认退出、控制reset，无SSH。新代码仅GanttView三项颜色值，导航逻辑/测试/数据/后端/API均无再变。下一步新SHA打包并沿用同一合成数据复验深色和最终导航；本轮安全覆盖许可已收到，不再等待审批。

- 用户已批准本轮新副本后安全覆盖桌面/网页静态，并进入同一候选本地。Git4385b54 clean/五小时余71%周28%。396d249原生1280浅色图标居中及连续导航实际通过：初始10/28，右一次11/11，再左两次10/14；普通滚轮600只换任务行、日期不变；横向3600右跨原边、-7200左延展到8月。没有改合成任务或真实数据。
- 深色实际观察发现date-actions仍沿用旧固定#1d4ed8，辨识度偏低，本次聚焦整改改用color-primary、border/subtle主题变量；不再部署旧DA95/FC9B/58A5候选，源码仅此三项CSS变量变化。新包/最终严格CSP及原生应重封存/复验，完整384/130/13的既有结构门禁保留并明确源码差异；不以旧包冒充新候选。
- 已点击旧候选关闭并reset，恢复先核PID是否退出。原生Shift+滚轮修饰键工具不支持持续按键，真实横向滚轮已验、实际Shift组合由浏览器测试；原生键盘/窄窗尚未收尾。未连接服务器或改正式安装/数据库/MCP，许可保持本轮范围。下一步仅CSS定向复验、新SHA封存及同合成库原生，再已批安全静态交付；无关机授权。

## 2026-10-31 最终候选396d249封存，等待本地入口与本轮交付许可

- 产品`396d249edda9bbe785e482d670295cb6e01cf9a4`已同树同SHA非强制同步GitHub；分支codex/audit-release-20261006-api。标准WACAS未定义/待确认、UPARS1.1.0、交接规则1.25。保存前Git clean；本次仅专项及handoff README/CURRENT_STATE/CHECKPOINT四文档追加收尾，其余源码无变化。
- 最终验证：384单元/70文件、130完整生产UI通过；该命令13真实HTTP按设计另跑，独立真实HTTP13/13通过。绑定396d249的最终静态资源再跑6组1920/1280/960深浅严格CSP，导航实际14日位移/Shift跨边延展/两组SVG中心/旧层级和框选全部过。lint/typecheck/build/release元数据/diff与NSIS构建通过。历史两轮E2E坐标及mock类型失败如前段保留，不放宽规则；既有大chunk构建警告保留。Rust/server/契约无变化，复用原b144954安全门禁证据，不称本轮重跑Rust。
- 已封存到E盘`src-tauri/target/audit-tools/gantt-navigation-396d249-20261031-delivery`：raw SHA `DA95DE776658DE21FF005424346E76B969B09885D25494C4147E206157692C03`，NSIS SHA `FC9B6C3A67E318111BC2175F5EF781DBCC8850A79F1929ECC5DE6E3A5E6EA807`。72文件静态包`gantt-navigation-396d249-20261031.tar.gz` SHA `58A547D2619BE9BC4AE483B2C416363AE992A8A248855B9B779AE07CE2406DAA`，对应payload/manifest.json绑定396d249。不得重建或用旧b144安装包替代。
- 新隔离候选`src-tauri/target/audit-tools/gantt-navigation-native-396d249`：PID35140/window10947718为本次观测，2合成项目/46条任务，旧scroll-form合成库经SQLite backup克隆，源保持、integrity ok/FK0，无账号/密码复制。候选raw摘要同上；已启动置前。第一次截图显示被外窗遮挡，未发送输入，激活后准确观察登录/本地入口，没有锁屏。工具禁止自动操作认证页，已请求用户点“不登录，本地使用”；之后立即reset释放控制。不要再重启/重造库导致入口重复。
- 原生外观/真实按钮/滚轮/键盘与窄窗尚未验，不能把浏览器6矩阵当原生通过。当前等待原因是人工本地入口及本轮静态覆盖许可，不是额度；最新五小时余79%/周29%，无重置/关机/唤醒授权。本轮尚未连接home-host或改正式安装/服务器/真实库/MCP；正式仍b144954，服务器DC9853。
- 同步：规则1.25/AGENTS/架构/三语帮助/CHANGELOG/交接已随产品候选同步；Wolai主与交接“导航候选396d249”两处精确读回。API/MCP无变化无需机械重传Apifox，DOC-SYNC-001及正式生产发布未通过风险保留。本次封存/等待回执再提交并同步，准确Git状态以恢复时检查为准。
- 准确下一步：用户完成同一候选本地入口后先核Git/额度/候选当前窗口，不重做有效测试或构建；原生只在合成数据验证SVG居中、两周双向实际移动/短动画、普通纵滚/横向滚轮跨边、深浅/键盘/尽力窄窗，立即正常关闭候选并释放控制。只有收到本轮新许可且验证通过，才新E盘/服务器受限副本后更新桌面和网页静态；守护安装脚本重新绑定本封存NSIS/正式路径/新HEAD，服务器先新鲜只读确认current=已交付row-scheduling-b144954及DC9853，static-only不重启后端，保留两库/配置/Funnel/旧assets/独立MCP。无迁移/清理/扩权/公开Release，无独立MCP停止授权。若未获部署许可，完成候选并等待，不借旧许可执行。

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
