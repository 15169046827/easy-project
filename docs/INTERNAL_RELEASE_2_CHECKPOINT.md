# 内部测试版2检查点

- 2026-10-18，范围：最新MCP/UI/安全补丁的独立未签名内部候选、多平台六资产核验、本机数据保护安装验收；不公开Release，不改变MCP写权限，不覆盖历史草稿/资产。
- 基线c520002f1a0ca1b0ef5a949daeea182abb8f40bb，分支codex/audit-release-20261006-api，开工Git干净。WACAS未定义/待确认，实际UPARS1.1.0及项目维护/数据保护/PrimeVue/CSP/额度规则。
- 开始五小时剩余42%、周91%，不重置/唤醒。已读前检查点并核对安全候选；旧internal.1/Draft406330701仍六资产，源3d62039。internal.2标签只读查询404，旧草稿列表未占用该名。
- 已实现待验证：内部编号参数默认2；所有发布工作流串行；验证/安全门禁后预留新内部草稿，先核对不存在同名tag或draft，再POST新草稿并校验精确SHA；三个构建只上传新releaseId，保留正式路径原行为，内部重跑遇同名即失败不覆盖。
- 全部未提交：.github/workflows/release.yml、scripts/prepare-internal-release.js、scripts/prepare-internal-release.test.js、本检查点。测试待执行，尚未dispatch/创建新草稿。
- 准确下一步：格式/lint/类型/新增正负例/全单测/元数据/YAML校验；保存Git精确同步后dispatch一次internal_test=true/internal_number=2，绑定精确候选SHA，等待验证/安全/三构建；在重要里程碑保存并查额度。剩余<10%不开始新长阶段，先保存暂停；所有窗口<=5%硬停。六资产齐备才独立下载核验，保护E盘当前数据后再安装原目录并原生验收。不可把同版本覆盖当跨版本验收。
- 文档同步：本地检查点，Git/Wolai未同步。本Windows确认，其它设备/签名身份未确认；用户库/当前安装/旧Release/MCP配置均未改。

## 提交前门禁

- 新7项正负例通过，完整213单测/43文件通过（22.72秒），lint/typecheck/release:check/diff通过；YAML结构待最后校验。正式路径不预留内部草稿，原行为保持。内部路径新增read-before-write、防同名、精确SHA/返回draft校验；HTTP30秒超时失败即停，无盲目重复创建。
- 当前未提交仍4文件，后续另更新RELEASING流程说明。五小时剩余34%、周90%，允许进入远程长阶段；dispatch前再保存并查询，低于10%不开始新长任务。
- 旧Draft406330701仍draft/prerelease，source3d62039。资产基线（ID/字节/SHA256，完成后逐项核对）：
  - ARM app：620411051 / 6882168 / c836dabeceecd97207aba4e0e9494ddb21b1fbb22fb8f44df573b7b4824a5b81
  - ARM dmg：620410962 / 6985164 / 8c19f2a48971a6e720cbcce2b3b01adb1abc260b8233485a6ecd9b1f1cd4cb68
  - Intel app：620414646 / 7105371 / 409d4fc07b672bb8dc23ff1595c676b06e22456428791fec8acb7701f3d1c50b
  - Intel dmg：620414600 / 7200310 / a053d322b0d8a93c66aeadd650fc91a5d4fdaa25aa4fee46ac85b9344d4d7987
  - NSIS：620410377 / 5149435 / fa56b80ec8b95b5c66a69d3032cf82c103c8ab8f84b716d64a3249141b5f394e
  - MSI：620410309 / 6868992 / 43655fb29e8bd7cc34ff642b92d04a40e092941ff52e71b0b64e7751429f246e

## 远程构建启动准备

- 完整213单测/43文件、lint/typecheck/元数据/diff、Prettier及js-yaml结构/门禁依赖检查通过；源码提交453104e9e0b9367121077dcd5bbb6b26be57be22已校验同树/同SHA非强制同步，提交后工作区干净。
- dispatch前五小时剩余30%、周89%，允许启动长阶段；不重置/定时唤醒。工作流准确源为上述SHA，原产品安全源e3b0f4d；仅新发布工具/文档，不改业务/依赖。
- 正在发起一次internal_test=true/internal_number=2；运行ID与远程结论未取回前不称启动成功或完成。追加本记录后仅本检查点未提交。下一步核对run.headSha、保存运行ID，等待同一运行的验证/安全/prepare/三构建；创建新草稿后记录ID，六资产不齐不得交付。

- 已确认一次dispatch成功：Actions运行39091301348，headSha精确453104e9e0b9367121077dcd5bbb6b26be57be22，当前validate/rust-security运行中；prepare/三构建尚未开始，新草稿尚未创建。不是旧run37715193321，不能用旧五job成功替代本次结果。
- 当前唯一未提交仍本检查点；本机进程检查EasyProject未运行，当前安装和数据未改。安装辅助脚本已读，仅在六资产及远程NSIS通过后才改用新的E盘安全副本和已核验安装文件。下一步继续等待同一run，不重dispatch。

## 首次远程门禁失败与修复

- 39091301348的validate在前端lint失败，33个prettier换行CR错误；prepare受门禁阻断，未创建internal.2草稿或资产。当地本地lint通过不代替Windows干净检出。发现.gitattributes缺*.ts LF规则，新增声明文件在Windows自动检出CRLF；不放宽Prettier/ESLint。
- 修复仅加*.ts text eol=lf及声明文件换行回归测试；下一步用core.autocrlf=true独立检出验证，然后本地门禁/新提交同步，确认旧run终态且internal.2仍未占用再新dispatch。不得重跑旧SHA或覆盖旧草稿。
- 当前全部未提交：.gitattributes、scripts/prepare-internal-release.test.js、本检查点。五小时最近剩余21%、周88%，进入新长阶段前再次检查；低于10%先保存暂停。本机/其它设备/安装/业务数据/权限边界不变。

## 换行修复复验完成

- Windows core.autocrlf=true独立检出至E盘lf-proof-20261018，确认TypeScript声明无CR；完整214单测/43文件通过（18.83秒），lint/typecheck/release:check/diff全部通过。未放宽格式规则或修改业务代码。
- 旧运行39091301348终态failure，rust-security成功，prepare/build跳过；不得把该运行当交付证据。准备提交上述三文件并精确同步，重新确认internal.2未占用后用新SHA启动一次构建。
- 本阶段开始五小时剩余14%、周87%；下一长阶段前再查，低于10%则只保存暂停。WACAS仍未定义，UPARS1.1.0及既有规则不变。Wolai待同步此失败及修复结果；当前安装、用户数据、MCP权限及设备状态未改变。

## 新候选运行已启动

- 修复提交f758ec7bcfe7b5e927129ee5761fb088fcca7d9e，树2e7dd2577cab7c92a4f1d545075e7cc13895dead，已精确非强制同步，提交后Git干净。确认internal.2标签404且无同名草稿后，仅dispatch一次新运行39091923826：https://github.com/15169046827/easy-project/actions/runs/39091923826 。headSha与该提交一致，最近validate/rust-security运行中，尚无六资产完成证据。
- 启动前五小时剩余11%、周86%；Wolai状态块28dPKMDkPpLCFu557s8exF已追加失败/修复/新运行并读回version59。本段保存后唯一未提交为本检查点。
- 准确下一步：只读检查同一run的validate/security/prepare/三平台构建；不要重新dispatch。若失败按日志定位；若成功先记录新draft ID、精确源和六资产，下载到E盘release-39091923826后调用已读verify-draft-assets.cjs指定f758ec7、实际draft ID、39091923826，核验SHA/大小/容器/架构，再比较旧六资产基线。安装前另查额度并保存，低于10%不开始下载验收或安装长阶段；改安装辅助脚本时必须换新E盘安全副本目录及实际已核验NSIS，保留所有当前数据，不复用已有安全副本目录。
- 其它设备仍未连接确认，仅本Windows；安装与真实数据未变。正式发布未通过、未签名内部版及例外期限保持，不重置/自动唤醒。

- 额度门禁暂停：最新五小时剩余9%、周86%，不开始新下载/修复/安装长阶段。当前基线f758ec7、同分支，唯一未提交本检查点；新运行39091923826继续在GitHub执行，不取消也不重发，最终结论尚未验。恢复后先读本检查点、核对Git，再从同一run终态与资产状态继续；已通过214单测等不重复整改。Wolai追加本暂停记录，除此无外部文档/权限/设备变化。

## 额度恢复后精确诊断（2026-10-18）

- 恢复五小时100%、周86%；核对HEAD f758ec7和唯一未提交检查点后查询39091923826，validate再次失败、security成功、prepare/build跳过、无internal.2草稿。读取首条错误前完整文件名确认实际报错是scripts/check-runtime-database.cjs（33行），不是此前推断的TypeScript声明；上轮.ts规则有效但未解决真正阻断，明确更正此前根因描述。
- 追加*.cjs text eol=lf，回归同时检查两声明和该CommonJS文件。E盘独立core.autocrlf=true检出三文件全部无CR；214测试/43文件通过（17.83秒），lint/typecheck/release:check/diff通过后再提交。未放宽门禁或改业务/依赖。
- 全部未提交为.gitattributes、scripts/prepare-internal-release.test.js、本检查点；下一步精确提交同步、确认编号仍空后新SHA单次dispatch。安装、真实数据、MCP权限和其它设备状态不变；Wolai待同步本次精确更正。WACAS未定义，UPARS1.1.0及项目规则继续适用。

- 修复提交0c38194bff24730427cf263f34277b2b3f2cf1d8已同树/同SHA非强制同步；确认internal.2仍未占用后单次启动39105705643（https://github.com/15169046827/easy-project/actions/runs/39105705643）。dispatch已返回该URL，须直接读取该run验证headSha，列表短暂仍显示旧run不能当新运行证据。保存本段后仅检查点未提交。

- 已直接核对39105705643 headSha=0c38194bff24730427cf263f34277b2b3f2cf1d8；新远程前端lint/类型/npm生产扫描/单测/性能/build成功，浏览器回归进行中；rust-security完整成功（3分1秒），并非跳过扫描。Wolai已同步精确更正并读回version61。只读当前库完整性ok/外键0，六表计数1/5/4/0/0/5，应用未运行；仅Windows连接确认，原生工具初始化及列窗成功，但尚未验证新包窗口。
- 当前未提交本检查点、docs/RELEASING.md和docs/PROJECT_PLAN.md（纠正已完成的独立编号仍写待办）；源码候选不变，安装/用户数据/MCP权限未改。里程碑五小时87%、周84%；下一步继续同run，六资产齐备后再核验与安装，正式发布限制不变。

- 旧Draft406330701及六资产ID/大小/digest再次与本文件基线逐项匹配，未变；当前已安装exe SHA仍CA484D91A665D2967C456EF4F4FF1BDD42A43462D99E8F9BE7D5EF53134993F8。新运行Rust格式/严格Clippy也成功，Test Rust进行中，不能提前认定全部门禁通过。

## 新草稿预留成功

- 阶段文档提交f2a7bdc99e114ea025112f048d583aec23e5eab3已精确非强制同步，源码候选仍0c38194。39105705643的validate/rust-security/prepare现全部success，Windows2022、Mac ARM26、Mac Intel26三打包进行中。
- 新Draft416293740，tag v0.1.0-internal.2，draft=true/prerelease=true，target_commitish精确0c38194bff24730427cf263f34277b2b3f2cf1d8；最近0资产，尚未完成。未发布或覆盖旧Release。
- 里程碑五小时剩余75%、周82%，下一步继续等待同run三构建；六资产齐全后核验下载。当前仅检查点未提交，Wolai待同步本里程碑，安装/业务数据/设备连接/例外期限保持。WACAS未定义，UPARS1.1.0及项目规则不变。

- 三平台构建/产物检查已执行成功，六资产齐全；Windows/ARM job终态success，Intel仅剩Post Cache Rust build收尾，整体success仍待最终确认。新draft实际地址https://github.com/15169046827/easy-project/releases/tag/untagged-418e1d25d78621174692 。进入独立下载核验阶段，目录固定E盘release-39105705643，禁止覆盖已存在文件。新增验收记录docs/INTERNAL_RELEASE_2_ACCEPTANCE.md（未提交），和本检查点为当前全部未提交；安装与真实数据未变。

- 现确认39105705643整体及六job全部success；六资产ID/大小/官方SHA已写验收记录。下载阶段前额度五小时61%、周80%。直接Release下载运行中（执行会话55433），速度慢且文件未齐/未达官方大小，绝不当作已验证；检查同run备份通道，任何替代来源也须与官方digest逐字节匹配。当前安装/数据仍未改。

- 下载续接：原慢速gh release进程已按精确命令/目录确认后停止，部分文件保留release-39105705643。独立工作流备份NSIS位于workflow-backup-39105705643，SHA49fa4d...与新Release匹配，版本0.1.0/NotSigned。另一只限此候选的Node下载器在release-39105705643-node，执行会话37061（只在GitHub API使用凭据，不向资产域转发），六文件约32MB，NSIS已完整摘要匹配，其它仍待；workflow-all-39105705643备份下载会话48696也在运行，已取回ARM DMG，未宣称其余完成。校验脚本仅增加可选下载目录参数，现位于ignored audit-tools；最终核验须指定实际目录，不能用部分文件。
- 当前HEAD f2a7bdc，全部未提交仅本检查点和新增INTERNAL_RELEASE_2_ACCEPTANCE.md。尚未安装/执行任何新包；原数据/配置不变。下一步等待下载完成并验证六资产，若传输失败只记录失败并续接安全下载，不盲目执行或改摘要。

## 内部版2验收完成

- 保护性NSIS覆盖退出0，原E盘目录不变；全新internal-2-20261018/safety-copy保留11文件并逐一验证安装前后SHA不变。安装exe SHA390CAF9560292F95935A9E4B8CCD257213F3FF9A0C659FD113D7C75A6A884167，Windows GUI子系统已验。
- 当前Windows真实窗口已验仪表盘/状态跳转Pending5项/编辑旧值与取消/深浅任务页/深色浮窗5条关系信息/刷新同一窗口340×360/收起64px球/展开恢复/关闭浮窗，原浅色主题恢复。工具缓存索引与几何错误经重新观察/定位后恢复，不冒充产品bug。未保存业务编辑；验收后库完整性ok/外键0/六表1/5/4/0/0/5保持。跨版本/MSI/Mac设备/签名/混合DPI未验，正式发布未通过。
- 已精确停止本任务冗余备份下载，保留所有部分文件；正式六资产仍release-39105705643-node。独立MCP程序/配置/只读权限均未替换。仅本Windows确认，其它设备未连接。WACAS未定义，UPARS1.1.0及既有例外/期限不变。
- 本里程碑五小时14%、周72%，不再开启新长阶段，仅完成文档/Git/Wolai闭环。当前全部未提交：本检查点、INTERNAL_RELEASE_2_ACCEPTANCE.md、RELEASING.md、PROJECT_PLAN.md；HEAD f2a7bdc，分支不变，源码/产物候选仍0c38194。准确下一步核对diff并提交四文档、同SHA非强制同步、Wolai追加读回，结束内部版2任务；后续正式发布需另按矩阵安排，不自动公开/重置/唤醒。

## 最终同步闭环

- 四份验收文档提交fcae48b4590f7eb9f9ebe5004d2de37e81344262已同树同SHA非强制同步，工作区干净；Wolai交付状态已追加并读回确认。新候选验收完成后再次核对旧Draft406330701六资产ID/大小/digest全不变。
- 真实窗口最后确认浅色仪表盘、仅主窗口保留。产品/产物仍对应0c38194，未替换独立MCP程序，正式发布限制/例外期限不变。当前仅此闭环段待提交，除此无未提交；完成同步后本阶段任务结束，下一步等待用户试用反馈或明确安排正式发布矩阵，不自动扩展任务。无重置/唤醒；仅本Windows确认。

## 六资产核验完成，进入保护性安装

- Node下载会话37061退出0，六文件全部官方大小/digest匹配，完整独立校验退出0；Mac版本0.1.0及两架构/安全路径、DMG容器、WindowsPE/MSI通过。NSIS/MSI均NotSigned、版本0.1.0，详见验收记录。首次静态校验在Intel DMG未下载完时按预期拒绝，不当作包缺陷；完成后完整复验通过。
- 正式文件目录release-39105705643-node；旧release-39105705643部分文件不交付。备份workflow-all会话48696若仍运行可精确停止，保留已下载文件。安装阶段前五小时32%、周75%，允许进入长阶段，不重置/唤醒。
- 安装辅助脚本已限定为此次已核验NSIS SHA49FA4D662AEA7ED342E765554C2DA6058D9C8CA2C787035F6ABBF2EC50AE7097及全新E盘internal-2-20261018/safety-copy；仅当前程序未运行才执行，原目录runtime-current-user/app，检查数据与WebView/注册表，不安装共享组件。Git未提交仍两文档（辅助脚本在ignored target内）。Wolai待同步最终资产/安装结果；设备/权限/例外边界不变。
