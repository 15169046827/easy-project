# 产品官网检查点

日期：2026-10-22，本地候选验证完成；五小时余8%，按长期10%门禁保存并暂停，未部署。

- 目标/范围：用户已批准第一版产品着陆页；介绍、演示截图、在线入口、桌面下载状态、MCP说明、数据与试用边界，中英文/深浅主题/手机与键盘。沿用既有服务器，不新建外部托管或付费服务。
- 标准：WACAS未定义/待确认；实际适用AGENTS、交接规则1.10/79条、PrimeVue/nonce约束、UPARS1.1.0质量原则；本次非全库审计。
- 基线：`c077bc7cc359c0ff7cc4a65474baacff1deb71e4`，分支`codex/audit-release-20261006-api`，开工干净。
- 额度：开工五小时余20%，第一实现里程碑余17%，周额度余20%；无重置/定时唤醒/关机。
- 当前修改：index.html、src/main.js、src/i18n/index.js；新entryMode工具/单测、landing中英文词典、LandingPage.vue、public/easyproject.svg与landing/project-board.png；新增e2e/landing.spec.js、调整web-server.spec.js；本文。后续文档清单以Git状态核对。
- 实现：根路径无应用hash/无demo/非Tauri展示官网；`/index.html#/dashboard`显式进入工作区，历史`/#/...`保持。首页不加载RemoteRoot/router、不检查会话或读取工作区；真实PrimeVue按钮、原主题nonce，不改后端/API/CSP。截图来自仓库历史演示看板，标明版本差异/演示数据，不是生产用户数据。
- 下载：不公开/搬运未签名内部安装包，仅说明暂无公开安装包并链接公开Release列表。不改已有草稿、不承诺正式发布通过。
- 文档入口：固定到已推送c077bc7文档，避免main尚无MCP.md导致404。
- 验证：首轮lint/typecheck已通过；新E2E与完整回归待执行；无Rust代码修改，不迁移/操作真实库。
- 下一步：运行lint/typecheck/全单测/build及生产E2E、真实HTTP12项；浏览器预览手机/深浅与键盘；核查入口加载隔离。再查额度/保存进度，足额时准备安全更新服务器静态资源（不换后端/不迁移库），并同步Git/Wolai/交接。
- 文档同步：Git尚未提交；Wolai尚未更新；交接当前状态/架构/README待更新；API契约未改，Apifox不需重传。
- 已确认设备：本机E盘仓库/已有Node依赖与server调试exe可用；本次尚未连接home-host。服务器历史Funnel公网试用已获授权且用户马来西亚测试可达，不以此冒称本次已验。桌面与独立MCP不覆盖、不重启、不更改权限。

## 实现里程碑与失败记录

- lint/typecheck通过；255单测/52文件通过；生产构建与release:check通过。保留XLSX940040/workCalendar1368669字节的大块历史告警，不关闭500KB门禁。
- 官网7项通过：1280/960/375、深浅、中英、键盘skip、无横向溢出、无API请求、截图/下载状态与旧链接。真实HTTP首轮11通过/1失败：登录helper已改/index.html但桌面Bearer的HTML拦截仍为根路径，导致误走Web适配；仅同步拦截路径，原一次登录/同Bearer/零导航断言保留，复跑12项全通过。
- 完整首轮78通过/4失败/12真实HTTP专用跳过：storage场景注入启动信息却无isTauri标记，官网误接管。已让main同时识别__EASYPROJECT_STORAGE_INFO__，不是改测试制造通过；lint/typecheck/build再通过，最终完整零重试生产回归进行中。
- 最初受限进程的回环服务无法被浏览器访问（route.fetch超时）；停止自建进程，获工具审批后仅回环预览，官网7项通过。一次误带ignore-snapshots的运行主动终止，不作通过证据；完整复验未使用该参数，不关闭断言。
- IAB最终生产4173预览已看到中文官网首屏，主标题/按钮/示例看板正常。1420最初超时不作通过证据。
- SSH默认批处理无密钥；正规审批后以既有凭据一次只读连接成功，current=/opt/easyproject/releases/bca2d4506e33、服务active。无服务器文件/系统配置/真实库改动，不保存凭据。
- 最新额度五小时余10%，周余19%。待收取已经启动的最终回归后保存；若低于10%不启动服务器部署等新长阶段，不重置/唤醒。

## 暂停检查点（最新状态覆盖上文进行中）

- 最终生产构建后的完整界面回归：82通过、12真实HTTP专用用例按设计跳过，零重试；包括原4个存储失败场景均通过。独立真实HTTP运行12/12通过（在最终存储门禁布尔条件补充前运行；该门禁补充由完整桌面/存储/浮窗回归覆盖，未重跑真实HTTP）。255单测在新增入口逻辑后通过；最后main门禁补充后lint/typecheck/build通过。release:check通过、diff --check通过。不是Rust/原生桌面/公网部署验收；未重新编译Rust、未覆盖安装。
- 最终五小时余8%、周余19%，不开始服务器部署、公开下载或新长任务。不重置、定时唤醒或关机。
- 全部待提交文件：CHANGELOG.md；docs/PROJECT_PLAN.md；docs/handoff/{README,CURRENT_STATE,ARCHITECTURE,CHECKPOINT}.md；docs/LANDING_PAGE_CHECKPOINT.md；e2e/{landing,web-server}.spec.js；index.html；src/i18n/index.js；src/main.js；public/easyproject.svg；public/landing/project-board.png；src/__tests__/router/entryMode.test.js；src/i18n/locales/landing-{en,zh}.js；src/modules/landing/LandingPage.vue；src/utils/entryMode.js。无用户原有未提交文件。提交后此清单为本轮改动清单，准确状态以Git为准。
- 生成证据：test-results/landing-{1280,960,375}-{false,true}.png；src-tauri/target/audit-tools/landing-final-e2e；dist为最终候选构建，不作为已上线证据。预览静态画面已在IAB实际观察，手机/中英/深浅/键盘由生产自动化覆盖。
- 准确下一步：恢复后先读本文、核对Git/额度/源文件；无需重做有效回归。检查服务器当前静态资源路径/版本及可用磁盘，按新唯一目录保存部署副本，保护真实库与既有API/MCP/nonce；仅更新静态资源（或新的只读静态版本目录），原子切换并校验摘要、首页/在线入口/旧链接/匿名401/health/权限。不要使用历史账号迁移脚本，不换后端、不动schema、不覆盖桌面/MCP、不公开内部包。服务器SSH密码认证已只读验证可用，凭据不落盘；服务器仍current=bca2d4506e33、active；本轮无远端写入。
- 文档同步：交接四入口、架构、计划、CHANGELOG已更新，规则1.10/79条复核不变；API契约未改，Apifox无需重传。Git提交/推送及Wolai本轮状态回执在收尾核对。官网尚未上线，不声称已完成公开交付。
