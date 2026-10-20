# 数据存储目录整改检查点

- 2026-10-20 Asia/Shanghai，用户明确整改：所有项目文件不得默认在C盘，数据库默认跟随App安装位置，允许用户设置。此前交接中的“应用数据目录例外”已被新要求覆盖，不能继续沿用。
- 基线3bcfc391a8ab46abc5fa158405add9303c8c69f4，分支codex/audit-release-20261006-api，开工Git干净。WACAS未定义/待确认，UPARS1.1.0及项目PrimeVue/CSP/额度/三方交接同步规则有效。
- 范围：默认目录/可配置位置、安全复制与启动切换、备份/目录打开边界、WebView数据路径、现有MCP接入路径、安装升级/数据保护及文档；不公开发布，不扩大MCP写权限，不清空或盲覆盖用户数据。
- 根因确认：lib.rs使用app_data_dir后join project_manager.db；备份随DbState数据库目录。现有默认opener权限仅$APPDATA，需要改为固定Rust受控目录入口，不能开放任意路径。
- 设计：默认安装目录下data；配置保存在安装侧，不能静默回退C；用户在PrimeVue界面输入绝对新目录，保存待切换配置，重启才复制最新库/备份并验证后切换，源保留到本机核验和明确迁移收尾。目标已存在/不安全/复制失败须拒绝而非建空库。开发运行隔离，不能自动迁移真实生产库。WebView主/浮窗也指定安装侧目录，避免只迁DB却继续默认写C。
- 实现里程碑：storage.rs安装侧路径/配置、pending重启迁移、SQLite只读备份复制、备份/审计逐字节核验、C/网络/链接/嵌套目录拒绝；lib与浮窗指定Windows WebView目录；启动失败进入PrimeVue存储设置而非空业务库；数据页新增真实PrimeVue配置、备份打开受控Rust命令并收窄opener权限；中英文同步。旧C盘业务数据仍原样，未安装/真实迁移/MCP配置改动。
- 本轮验证：217前端单测/44文件通过；47Rust单测+1stdio隔离集成通过（修正Windows路径尾斜杠嵌套判定）；lint/typecheck通过（新增测试最初两个类型错误已修）；生产build/release元数据通过、clippy -D warnings通过。新增4个存储CSP/深浅/960与1280/键盘E2E通过；首次全量56/59（新增dark初始化时documentElement未就绪已修，另1甘特日期用例重跑已过）。第二轮与NSIS beforeBuild重建dist重叠，若干资源加载失败，不能算产品回归通过；必须构建结束后单独重新执行完整生产E2E。不得弱化断言或称全量通过。
- 当前26项未提交：AGENTS.md、README.md、docs/MCP.md、docs/handoff/{ARCHITECTURE,CHECKPOINT,CURRENT_STATE,README,RULES}.md、e2e/test-globals.d.ts、src-tauri/capabilities/default.json、src-tauri/src/{floating_window,lib}.rs、src-tauri/tauri.conf.json、src-tauri/tauri.windows.conf.json、src/i18n/locales/{en-US,zh-CN}.js、src/main.js、src/modules/data/components/DataView.vue、src/window.d.ts；新docs/STORAGE_LOCATION_CHECKPOINT.md、e2e/storage.spec.js、src-tauri/src/storage.rs、src/**tests**/components/StorageSettings.test.js、src/api/storage.js、src/components/{DesktopRoot,StorageSettings}.vue。以git status复核。
- 验证计划：路径/配置负例、迁移完整性/目标冲突/失败保留、待切换后新写入保留、C路径与链接拒绝；前端PrimeVue/深浅窄窗键盘/严格CSP，完整门禁与E盘包；保护性安装和当前真实库只读核验。不能拿历史214/55/40结果当本轮通过。
- 准确下一步：等待NSIS构建会话61169完成；完成后单独重跑全量生产E2E；最新reject_links补丁需fmt/clippy/tests最终复核。全新E盘安全副本后覆盖本机E盘安装（已确认无桌面进程，仍有2只读MCP进程），启动迁移、核验真实库内容/备份/缓存路径、真实桌面PrimeVue与重启；再仅变更Codex MCP数据库路径且保持只读，安全归档旧C数据至E（先确保无句柄且核验，不盲删）。Git/Wolai尚待同步，交接资料已更新规则/架构/状态但仍标实施中。Mac/其它设备未验，不公开发布。
- 额度开始五小时98%、周28%，任一窗口<=5%只保存暂停，五小时<10%不新增长阶段；无重置/定时唤醒授权。仅本Windows环境确认，其它设备未连接。
- 里程碑额度五小时82%、周26%；普通隔离shell出现CreateProcessWithLogonW 1909（隔离账户锁定），正规require_escalated只读命令仍可用，不更改账户/安全策略。Windows UI已完整读computer-use技能及guidance/confirmations，尚未接管窗口。

## 本机部署及最终复验（2026-10-20）

- 上述“尚未安装/迁移”是阶段历史，本节覆盖：最新Rust补丁fmt/clippy零警告及7项存储专项再通过；完整47Rust+1stdio与217前端/44文件已通过。lint/typecheck通过，NSIS构建结束后独立完整生产E2E **59/59、无重试** 通过，含新增4项存储深浅/960/1280/键盘/严格nonce CSP。生产构建、发布元数据、UPARS1.1.0和diff通过，原500KB两资源告警保留且体积未增长，不改变限定风险期限。
- E盘安全目录`src-tauri/target/audit-tools/storage-location-20261020`：迁移前11文件safety-copy逐个SHA一致；本次包`storage-setup.exe`SHA **EF5CBD847B030C76EA554E6E8C096F1DB8B051C8680AAC271C6BD89A330A79F3**。覆盖原E盘runtime-current-user/app退出0；安装exeSHA **498BD72B5CBBF37A28C4F1AA4C20DDB80F19C08653DDBAB8D1489BD9B1A12D38**，与release文件同长度，唯一区别为偏移13719360处UNK→NSS三字节打包标记。源码storage.rs最后修改11:53，release/包11:54生成，未拿旧包验新源码。
- 真实启动PID44692，窗口EasyProject/Responding=true。安装侧配置activeDir为`E:\Project\Project\easy-project\src-tauri\target\audit-tools\runtime-current-user\app\data`、pendingDir=null；数据库就在该目录。Windows主WebView六个相关进程参数均指向E盘安装侧webview。未自动打开浮窗或操作业务UI。
- 新库只读integrity_check=ok、foreign_key_check=0；六表计数1/5/4/0/0/5，按id排序全部业务行SHA256与迁移前相等（e5c611dff77c67d1c444b325e4638bee2b1e7bb61d248927faaa2b17c8998a3a）。迁移后正常创建启动自动备份并按既有10份上限轮转，安全副本和旧归档不受此轮转影响。
- Codex官方MCP文档及本机CLI帮助已核对；`codex mcp add`仅更新同名easyproject的--database到新E盘库，get读回无allow-write/allow-delete，二进制仍原artifacts/mcp交付（未刷新其锁/构建）。停止精确匹配旧C参数的两个只读进程13392/24152以释放旧库；最终原exe对新E盘库真实stdio握手与tools/list通过，恰7只读工具。当前聊天旧连接不等于自动重载，必要时用户需重新连接/重启Codex；不得声称已有会话已加载新连接。
- 旧C Roaming/Local先归档至legacy-archive，逐文件校验11/498文件；跨盘Move后旧路径仍有1/318文件，残留库为更早历史（13成员/5团队，与当前0/0不同，文件日期10-17），原因未确定。首次清理因摘要差异立即停止，未删除差异文件；另存legacy-residual/roaming和local并逐文件核验1/318后才精确Remove-Item两个旧产品路径，不覆盖当前库或原归档，不合并历史内容。随后只读复核旧两个C路径递归文件数均0；Test-Path曾仍true，空目录/投影残留不当作文件清理失败或删除成功凭据。保留两套历史版本，可恢复，不清理E盘副本。
- 原生工具@oai/sky初始化报1909（隔离账户锁定），按技能重试/内核重置一次后仍失败，未做任何UI输入，不改账户或系统安全设置。**未验证**：新设置界面的真实桌面点击/外观、自选目录本机手动重启切换、浮窗使用新profile的原生创建；这些分别有生产mock和Rust隔离覆盖，但不冒充原生验收。当前应用已启动且真实迁移/响应/路径通过，用户可在数据页查看新设置；当前偏好为新的E盘profile，旧偏好已安全归档而未盲合并缓存。
- 全部未提交文件在前述26项基础上新增CHANGELOG.md，共27项。根规则、README/MCP、交接规则/架构/状态/入口/检查点已同步本地；Wolai交接首部已追加10-20规则覆盖并读回，主项目状态与最终Git来源尚待收尾。没有公开Release或替换历史Draft/六资产，没有MCP权限扩大或真实业务写入。
- 准确下一步：格式化/文档链接和最终diff核验；提交27文件并非强制同步Git；把最终证据/源SHA同步Wolai主状态及交接对应段并读回，最后保存闭环。用户侧后续只需确认新界面及正常重开；如恢复原生工具可补验，不重做已通过迁移。正式发布仍未通过，Mac安装处可写性/实机、MSI、混合DPI未验，旧版本回退只能显式用保护副本，不能让旧版重新在C创建空库。
- 最近额度五小时78%、周25%，无重置/唤醒；仅本Windows确认，无其它连接设备。WACAS未定义/待确认，实际标准不变，无通用审计标准扩充。

## 同步闭环

- 实现与文档共29文件提交 **4b1a2920f1cb16fa1b3db4ef836f8acbc0063c38** 已正常非强制推送；ls-remote精确同SHA，提交后Git干净。89本地链接有效、78规则ID唯一，手册1.2；此前27项清单加PROJECT_PLAN/RELEASING为29项，产品代码/安装包源不因本收尾记录改变。
- Wolai主状态28dPKMDkPpLCFu557s8exF读回version68，交接首部oLvsZ6M65HtTfFsJmg8ptD为version5，ENV-01/DATA-01/架构对应块均version3；5块源SHA均匹配4b1a292，规则覆盖、真实迁移/包摘要、数据保护、MCP只读及原生未验边界完整同步。未覆盖全页或修改历史资产。
- 最终再次检查旧C Roaming/Local路径递归文件数均0，当前E盘库完整性ok/外键0、计数1/5/4/0/0/5。归档和不同历史残留均可从E盘对应目录恢复，未删除保护副本；当前程序保持运行。未确认旧目录为何曾暴露不同历史库，不虚构为当前业务数据丢失或已合并修复。
- 当前只剩本检查点与交接检查点的闭环记录待提交；下一步提交并同步两文件后结束实施。用户后续重连/必要时重启Codex使现有会话使用新路径；新设置UI原生外观/点击/手动重启与浮窗profile实机复验仍明确未完成，工具恢复或用户正常试用时补验，不再重复已通过代码/数据迁移。正式发布状态不变。
