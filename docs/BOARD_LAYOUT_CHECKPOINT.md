# 看板固定容器与任务标题提示整改

## 2026-10-24实际交付完成回执

- 源码f8fe4e5c3512dcf1057eaea1061ebd70a81e7461已按本轮批准覆盖两端，非候选未部署状态；不需要再次覆盖或迁移。266单测/54文件、88生产UI零重试+独立真实HTTP12通过，lint/typecheck/build/release:check/diff通过。专项完整nonce CSP、6状态2/4/2/1列矩阵、列内滚动/全文提示、真实鼠标跨行状态更新与撤销、320/424项目动作/表格可达均通过。
- 桌面：NSIS退出0，副本E:/Project/Project/easy-project/src-tauri/target/audit-tools/board-overwrite-20261024-f8fe4e5新受限目录，503文件保存、500非程序SHA不变，启动前后DB逻辑全表一致/integrity ok/FK0。安装exe C4EE6D5129E1CFD1BF5C5FFA36608FCB77E0D66E0716656DD0478BCC1A916298；包7F3B8A2E9D98695C015D6716FF1F7DF7F58B7D177947F3FED30B08A6607909EA。实时启动PID35324/Responding=true/窗口EasyProject；未代登录/真实业务CRUD，原生新UI完整矩阵仍待用户实用反馈。
- 本轮不改MCP：安装时把新包附带重新编译的伴随程序还原为保护副本原件，安装侧和独立程序均原765B4C33330442DC947B76DE58747FEFF0EB78181B8738481B980E72C5FC70DF；权限/配置/现有进程未扩大或强停。数据库仍schema7，无迁移/换库/内容修改。
- 网页：current=/opt/easyproject/releases/board-f8fe4e5-20261024，全新root700副本/var/backups/easyproject/board-f8fe4e5-20261024；64交付文件摘要验证、172旧assets保留，服务active/PID672与后端4730a739…完全不变，2数据库全表逻辑一致/integrity ok/FK0。无服务重启、Origin/CSP/公网/MCP权限变化。
- 正常TLS上线复验：两HTML入口/nonce安全头、63静态文件与当前dist逐SHA一致、4匿名401边界、health200均通过，证据audit-tools/board-https-verification-f8fe4e5.json；未用真实账号进行线上CRUD。没有公开新版安装包，正式生产发布结论未变。
- 同步：CHANGELOG/架构/当前状态/入口与本专项同步，长期RULES规则1.13复核未改；API与数据契约未变化，Apifox不需要机械重传。Wolai主/交接最终回执待追加读回；Git源码f8fe4e5本地已存，首次普通push与命令级HTTP/1.1重试均SSL10054，最后确证远端1640e31，不能声称远端更新成功。最后额度五小时余46%，无重置/唤醒/关机。
- 本最终回执提交前未提交仅本检查点及后续交接/计划/入口回执，精确列表提交前git status核对；保存后应干净。下一步仅补Wolai/Git最终同步（先远端读回再非强制push），不重做已通过测试/部署。设备已确认本机桌面与home-host在线，演示IAB/1420将清理，生产/HTTP测试入口自身清理服务；桌面/服务器保持运行。
- 外部任务另反馈MCP旧status文字更新失败：仅收到脱敏问题摘要，未对其业务库操作或盲重试；本轮UI范围不扩展此写路径，后续按独立隔离复现/核对实际23工具Schema（状态ID引用）与诊断处理，不能把未复现反馈当已修。

## 2026-10-24交付执行检查点

- 固定源码f8fe4e5c3512dcf1057eaea1061ebd70a81e7461，打包NSIS成功；安装包SHA256 7F3B8A2E9D98695C015D6716FF1F7DF7F58B7D177947F3FED30B08A6607909EA，主程序候选C4EE6D5129E1CFD1BF5C5FFA36608FCB77E0D66E0716656DD0478BCC1A916298。未公开。补充12真实HTTP/登录/头像/多会话回归12/12通过，无真实账号操作。
- 用户本轮允许两端安全更新后：已只读确认home-host current=status-1640e31、服务active/PID672；已上传64静态文件包board-layout-f8fe4e5.tar.gz（SHA a1075b06d00aa6e1042679864b2e77ad50bc7f57b9bc2385f608c17040542324）和基于完整审阅旧静态流程机械绑定的新部署脚本。目标board-f8fe4e5-20261024，先全新root700副本与只读DB快照，再保留旧assets/后端摘要与PID不变后切换；尚待执行结果，不称已上线。
- 本机实时核对主程序未运行，仅发现精确artifacts/mcp独立进程；不强停/不替换这些MCP。安装流程已审，新增安装侧MCP原件还原/摘要校验，以满足本轮“不改MCP”；独立MCP也核验原765B4C33…不变。目标新E盘副本board-overwrite-20261024-f8fe4e5，待执行，不复用旧副本。禁止迁移schema7或换库。
- Git本地f8fe4e5已保存、此前工作区干净；只读远端仍1640e31，常规及命令级HTTP/1.1两次非强制push均SSL10054，远端同步缺口仍在。Wolai最终候选/交付待同步。当前未提交仅本检查点；额度最后五小时余61%，无关机/重置/唤醒。

## 2026-10-24候选完整验证通过，已获两端安全更新授权

- 最终候选：266单测/54文件、88生产UI零重试通过（12真实HTTP按专用入口跳过），lint/typecheck/build/release:check/diff通过。新增深浅看板矩阵在完整nonce CSP下验证PrimeVue动态style均为当前nonce；320/424项目按钮/弹窗/任务工具及表格可达性通过；真实鼠标跨行拖拽状态修改及撤销通过。最后补CSP测试后重新lint/typecheck也通过。
- 浏览器视觉：424×640深色项目管理，新建按钮位于页面标题区/无品牌重叠；1280×800深色与960×640浅色看板均双420px固定容器、卡片左对齐，第三状态换行；测试另覆盖1920四列/640一列。1280预览存E盘audit-tools/board-layout-1280-dark.png。尚未原生覆盖/新UI登录验收。
- 用户已明确批准：验证全部通过后，新E盘安全副本并覆盖桌面、同步服务器网页前端；保留账号/项目，不迁移数据库、不改MCP或权限。本轮仅前端静态/嵌入资源更新，不重新迁移schema7、不替换独立MCP、不公开发布新包。五小时余68%，符合新长阶段门禁。
- 下一步：保存候选源码/交接并构建NSIS，原程序退出后新安全副本/摘要核验覆盖；服务器前端使用现后端/新root700副本/保留旧资源/逻辑数据及进程不变/正常TLS验证。真实HTTP专用12项按相称性再验；Git只读已确认远端1640e31，非强制推送本地保存历史关闭此前网络缺口。Wolai待追加候选验证/授权及最终交付结果。

## 2026-10-24恢复：交互根因已修，进入完整复验

- 基线90df559fa5049b35145361d53987dc4a4305cf97/原分支，恢复工作区干净，五小时余99%；WACAS未定义，AGENTS/交接1.13/UPARS1.1.0。未做真实库/安装/服务器/MCP改动，无关机/重置授权。
- 已确认卡片提示根因：card-list默认auto网格行在多任务下将按钮压至约29px，标题行被挤成0px且按钮scrollTop45，鼠标命中footer。设置grid-auto-rows:max-content、卡片auto高度/不内部裁切、标题正常换行后，卡片约183px且自身scrollTop0，标题/备注完整PrimeVue提示通过；不是凭推测绕过Tooltip。
- 跨行旧dragTo预滚动目标后源卡片已离屏，浏览器没有dragstart。测试改真实鼠标先按下/移动启动原生拖拽，再滚动到换行目标、移动/释放；实际dragstart/drop/dragend、状态update/完成进度100及撤销均通过，无合成drop。保留420px固定/2、4、2、1列矩阵。
- 追加320/424窄屏深浅验证发现内容区flex局部样式覆盖最小高度，修明确作用域/最低可滚动高度；同时全局header-actions规则限定app-header，防止泄漏到项目新建按钮。两项窄屏回归通过：新建项目按钮在品牌/导航下方且弹窗可开、任务创建/表格可滚到、无页面横溢出。
- 当前隔离开发回归：4项看板/列表标题/真实跨行拖拽通过，2项窄屏深浅通过。下一步最终格式/类型/266单测/build/完整生产UI、严格CSP与浏览器视觉核对、Git/Wolai/交接同步。API与权限未改变，Apifox只需记录复核无契约变化。
- 当前未提交：既有TaskBoard/样式/App/两个e2e文件及本检查点；后续文档补充提交前以git status完整核对。开发测试4173为session53458，将停后运行生产入口；无真实数据库连接，尚未SSH确认服务器。覆盖安装/部署须本轮批准，不继承旧轮授权。

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
