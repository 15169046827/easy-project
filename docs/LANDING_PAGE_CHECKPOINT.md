# 产品官网检查点

日期：2026-10-22，官网第一版已安全部署并完成有界上线核验；下方暂停/准备记录保留历史身份。

## 最终交付与剩余边界

最终同步回执：部署证据8文档提交c64957a03e517032c4b25e8b07e510c2066b8853已同树2d13d7c655f5b773e4c469f601d76840e0135284/同SHA/force:false同步原GitHub分支；Wolai主状态v94、交接v31读回准确源/部署事实/未验边界。规则、API/Apifox复核无变。本回执为最后文档补记，不改变已部署cd05e93构建。1420/4173无本轮遗留服务，SSH已退出；线上浏览器工具超时产生的临时页由宿主回收，未标记持久交付页。不再自动开始其它任务。

- 官网：https://home-host.tail2956dd.ts.net/ ；在线入口：https://home-host.tail2956dd.ts.net/index.html#/dashboard ，原/#/...深链由原入口判定保留，隔离回归已验证。
- 源码/资产绑定cd05e93a3f631709d1e75cc949f5785f9f636420（产品实现a4428a8）；current=/opt/easyproject/releases/cd05e93-landing-20261022。不改systemd/反代/域名/Origin/API/MCP/DBschema，bin保持bca2d45原件SHA，运行PID不变。桌面安装/独立MCP不动，内部未签名包不公开；官网交付不等于正式生产发布验收。
- 保护：新root700副本/var/backups/easyproject/cd05e93-landing-20261022，包括原release的逐文件核验和SQLite官方在线副本。两份真实库所有表逻辑（含账号/会话/Token/revision）前后相同，integrity ok/FK0；63新交付SHA通过，37旧assets逐个保留，运行服务active。
- 外部正常证书校验：两HTML入口200，62静态文件（除动态nonce HTML外）逐份与清单SHA一致；strict script/style CSP、nonce/no-store/DENY仍在。health200，匿名session/revision/个人Token/MCP共4边界401。生成本地证据src-tauri/target/audit-tools/landing-cd05e93-https-verification.json；无登录/业务写入。
- 两个既有公网中继强制连接且正常SNI/TLS验证：首页200，分别1.479/4.552秒，tls verify=0。说明本次中继访问可达，不冒称所有地区/运营商稳定性或负载验收。用户前轮马来西亚直连成功反馈仍仅对应其网络。
- 验证时序：前轮255单测/82完整生产UI已有效；本轮源未改，重新build/release:check通过，并补最终构建12真实HTTP全过（零重试、全新E盘隔离库）。未重跑Rust/原生桌面矩阵，未重新安装。
- 线上浏览器工具：首轮create超时但产生标题EasyProject的tab6；重置后getTab仍超时，未取得可信线上DOM/截图或进行点击/登录。未通过其它UI通道绕过，也不把本地截图冒充线上截图。静态字节及真实HTTP/CSP回归可证明交付一致，但线上人工点击和真实账号使用仍待用户日常反馈；无需为此修改安全配置或阻断已验证的静态交付。
- 后续待办：将来公开桌面下载须另行完成资产核验/授权，才能补版本/系统/日期/SHA/下载链接；共享限流、存储配额/告警、正式签名与多平台验收保持独立任务，不自动扩展本次。当前无需用户迁移/重连MCP或覆盖桌面。
- 回退：先核对current仍为本轮目录且没有后续部署，再用同目录临时symlink+os.replace原子切回保留的/opt/easyproject/releases/bca2d4506e33；只回退静态版本指针，后端相同，无需DB回滚/重启。保留新旧版本和所有安全副本，不能自动清理或用历史脚本恢复旧库。
- 文档：README/server README/计划/交接四入口与架构同步，规则1.10/79条复核无变；API契约无变化，Apifox不重传。Git/Wolai最终来源回执收尾补记；本轮未提交文件均仅这些文档。设备：home-host active且SSH已退出，本机测试服务已自行结束，桌面进程未操作，无重置/唤醒/关机。

## 恢复与部署准备

### 部署里程碑（已完成，外部浏览器复验中）

- 63文件归档与脚本上传SHA与本地一致，新release=/opt/easyproject/releases/cd05e93-landing-20261022，current已原子切换。服务不重启、PID不变、受限账户/后端二进制SHA904d2b3a2d7c3d54767543a97195eb7a952f6e625c3b50da1d927eb2f1a5bc8a保持。
- 新root700副本=/var/backups/easyproject/cd05e93-landing-20261022：原release逐文件摘要核对、两份SQLite官方在线备份及所有表逻辑摘要核对，含账号/会话/MCP Token/revision；两库无改动、完整性ok/外键0。保留原bca2d4506e33版本和37个旧assets以兼容已打开页的懒加载；新63交付SHA核验通过。不自动删除副本或还原DB。
- 服务器回环首页/显式index/health200、匿名session/revision/个人Token/MCP401、strict CSP Web标记/当前nonce/精确主模块SHA通过。入口/assets/index-B9WNX2Kt.js。无新账号、真实CRUD、迁移、桌面覆盖或MCP配置改动。
- 本轮最终cd05e93重建后的12真实HTTP测试全部通过（1.0min，独立全新E盘隔离数据），补齐上轮最后布尔门禁补充后的复验时序；前轮255/82仍有效未重做。
- SSH执行结束已正常退出；下一步真实HTTPS与浏览器/旧深链/移动主题复验后同步Git/Wolai/交接。没有重启整机、额度重置或定时唤醒。

- 从cd05e93a3f631709d1e75cc949f5785f9f636420恢复，原分支/远端一致，工作区干净；未重做已有效的255/82验收。本轮重新build/release:check通过，最终构建12真实HTTP复验进行中。
- 额度恢复核对：五小时余100%，周余18%；无重置/唤醒/关机。标准/目标范围不变。
- SSH只读确认home-host、current仍bca2d4506e33、服务账户easyproject、磁盘约88GB空余、web目录root755；不读取完整Environment。一次过宽的环境变量检查被工具拦截，已删除该检查，未读取或暴露凭据。
- 本轮静态候选绑定cd05e93：E盘landing-cd05e93-payload，63文件逐项SHA；归档landing-cd05e93-20261022.tar.gz，SHA256=3427def7d37a13c7a0888ea9c8d38702700fc1eff03a8b9a4b68426a63ac35d8。
- 安全方案：新独立release目录，保留原bin摘要和全部旧assets；root700新副本保存原release及SQLite官方在线副本，核验所有表逻辑（含账号/会话/Token和revision），原子切换current。无需停服/重启，PID必须不变；失败只回退版本指针，绝不自动恢复数据库。首页与静态JS摘要、严格nonce CSP、health/匿名401/API/MCP边界均验证。尚未切换或写真实库。
- 已完成：只读预检、候选绑定与打包；上传/真实HTTP末验进行中。准确下一步：读取两项结果，成功后执行经摘要校验的一次性部署；再实际浏览器访问官网/在线入口/旧深链与移动/主题，不登录真实账号、不做CRUD。桌面/MCP/后端/schema/Origin/Funnel不变，未签名内部包不公开。
- 当前未提交文件仅本文；忽略目录一次性打包/部署辅助不作为跨机器产品交付依赖。Wolai与交接在部署里程碑后同步，本段不冒称上线成功。

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

## 同步回执

- 官网及上述19文件已提交并精确同步远端：`a4428a88bcc8c3d40e6878ec5ce4e8b60ba59511`，树`e56f085f76bed99ea58ed2d8f688fbe78d265bb6`。常规push连接重置，正规备用GitHub传输核对远端直接父、PNG二进制blob SHA、完整tree/commit SHA后仅force:false更新原分支；无TLS放宽/强推/Release。忽略目录传输辅助新增PNG base64上传且核对Git blob SHA，不是产品依赖。
- Wolai主状态v91、交接v28已读回本轮a4428a8/暂停说明，收尾再补已推送回执；不是部署上线证明。交接四入口和架构/计划/CHANGELOG与代码一致。
- 本轮全部产品改动已入Git；仅本回执文档为收尾提交。生成截图留在test-results；回环4173预览在收尾停止，IAB临时页关闭；不停止用户桌面或服务器。当前无SSH连接。
