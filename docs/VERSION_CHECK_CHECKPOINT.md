# 版本检查候选续接（2026-10-26）

## 当前结论

同步收尾回执：产品31c756e与文档1d718330a908a194f36ccdb8369b16a76a32c95b已推送并完整远端SHA读回；Wolai主/交接两页均已同步最终来源、产物、323/94结果及用户操作/更新许可等待状态并读回通过。无业务代码或接口新变化，本最小回执另存，不重复同步其它内容。用户回复仍待，候选保持运行于合成空登录页；原生/真实部署仍未完成。

2026-10-26最终自动门禁/候选已完成，等待用户本地入口与更新许可：产品源31c756ef18a1abe649b99d611c03e7b7493c6d87已推送并精确读回，构建时Git干净。内部tag修复后完整323/63测试、typecheck/lint通过；清洁源默认NSIS构建及最终94生产UI零重试通过（13 Web专用跳过，不冒称本轮真实HTTP通过）。最终NSIS SHA862FA61969C41E0EC0CA6E49AC659F20B88DD8B965E0A6E631D8E40A0938D7B5；release/隔离exe均AAFDDC1433CD477FD5CCA77B102F4C016C0D268A2B9E57121A8173989D177748。旧2f70199包仅历史，不部署。

准确原生续接：新E盘合成目录src-tauri/target/audit-tools/version-native-31c756e（从既有parent-child-native-20261025合成库在线备份，integrity ok/FK0；未复制凭据/profile），直接完整路径启动PID5360，返回窗口已核对路径，仍在空登录页。旧合成PID36992仅在路径匹配且只读确认空登录后关闭；原安装runtime-current-user窗口不关闭/覆盖。请用户自行点击“不登录，本地使用”后再继续，不代操作登录。真实Windows 1280/960浅深/键盘/CSP/受限发布页打开及备份目录opener状态仍未验；未新连home-host/未部署索引/覆盖桌面/改MCP。正式生产未通过。

当前不是额度暂停：5h余79%/周52%，不重置/唤醒/关机。用户已授权开发按序推进，另已询问三个阶段（版本检查、官网截图/下载、西语）验证后逐阶段安全副本与桌面/网页静态更新许可，回复未到，不推定获准。下一步1）收用户本地入口确认，完成最终原生矩阵与安全边界；2）收安装/静态更新许可，保护副本与SHA/全部原数据核验后交付，后端/DB/MCP/地址/权限不变；3）依序官网新合成截图/下载、es-ES。不能为跳过原生验收先称本阶段已交付。

本次续接基线04d6798/既有codex/audit-release-20261006-api；WACAS未定义/待确认，UPARS1.1.0/交接1.15未改。全部源码已提交，无未提交产品代码；本最终回执仅本文及handoff README/CURRENT_STATE、api README更新，提交后以git status为准。Apifox新索引已全19读回/原18摘要不变/原生66不变。Wolai2f70199里程碑已读回，本最终来源/候选/待用户状态在本次收尾同步，结果另读回，不声称原生已验。后续保留目前所有合成及旧保护副本，不自动清理。

内部tag修复最终323测试/63文件、typecheck/lint再次通过；实际Vite子进程负例也确认匹配tag+未知Git源拒绝、错误基础版本tag拒绝，两次都在输出构建前失败。下一步封存此次修复，重新清洁源NSIS/生产UI；上段2f70199包不得作为最终交付。用户本地入口切换回复仍待；无真实安装/服务器改动。

2026-10-26清洁源阶段：2f70199ab2b2661ae678c42669490c44b1dea878已提交/推送/完整SHA远端读回，Wolai主/交接里程碑已读回。该清洁源默认NSIS构建通过，94生产UI零重试通过（13独立HTTP专用跳过，非本轮HTTP通过）；NSIS SHA5D90958A27D35558E99FDCC0170534A80294A8FE1884189B612CB1A2E298353A，release程序1848D741A2A57726EB30FB0A2DEC4E8FDE2280EAFB82BA0149393848BB90F786。

代码复核随后发现内部Release tag也须保持内部提示（原实现仅无tag时提示），已修改isInternalBuildTag/版本组件及反例，故上述包现为旧验证候选，禁止当最终交付包。最终全量测试正在运行；3个未提交代码文件为src/utils/releaseVersion.js、src/components/VersionCheck.vue、src/__tests__/utils/releaseVersion.test.js，另本检查点等文档续记。下一步先封存修复、清洁源重建并重跑最终生产回归，再原生收尾；不要用2f70199旧包覆盖。

新合成运行目录version-native-2f70199只从既有合成库SQLite在线备份，未复制账号/凭据/profile，integrity/FK通过。sky.launch_app完整候选路径第一次却唤起已安装runtime-current-user窗口，未对原窗口输入/关闭/覆盖；改经直接精确文件路径启动后，PID36992及返回窗口4852616路径确认正确，当前在默认空登录页。已请用户自行点击“不登录，本地使用”，不自动操作登录表单。主机在线且无锁屏，未新连home-host；现有安装可能因误唤起启动自动备份，不声称所有目录完全无变化。额度里程碑5h余84%/周52%，不关机/重置/唤醒。

2026-10-26恢复里程碑：额度5h余90%/周53%，基线04d679804149cca5ccfd829bb34206741c0824fa，原分支且开工干净。用户授权完成后顺序推进后续开发，不授权新公开Release/本阶段真实安装部署。新增纯构建身份gate及15正反例，收紧ready=false无发布字段契约；最新完整323测试/63文件、typecheck/lint/build/release:check通过。首次全量因契约数量断言仍15路径/18操作失败1项（其余322通过），改为真实16/19及静态资源schema断言后定向26通过、最终全量323通过；未删除/忽略测试。两原有大资源警告保留。

新增VERSION_CHECK.md说明手动/无凭据/取消/内部版/索引发布流程，公开静态GET /release-info.json已独立记为运行状态资源，不冒充业务或MCP。Apifox仅新增528731814并全19项schema/分组/摘要读回通过，原18项ID/内容SHA保持不变；首次受限网络HTTP0发生在读前置，无写入，提升到允许联网环境后成功。目标选择器允许仅新增指定的已知spec操作，仍全量旧SHA冲突保护/同path碰撞拒绝/未知操作网络前拒绝。主窗opener能力说明见专项使用文档，无新增invoke或MCP权限。

尚未清洁源重建/原生/新NSIS/部署。全部本轮文件：docs/RELEASING.md、CHANGELOG.md、docs/VERSION_CHECK.md、docs/api/README.md、web-openapi.json、web-apifox-manifest.json、scripts/build-identity.js、apifox-contract.test.js、sync-web-apifox.ps1、verify-web-apifox.ps1、src/__tests__/utils/buildIdentity.test.js、releaseVersion.test.js、src/utils/releaseVersion.js、vite.config.js及本专项/handoff对应更新（提交后以git status为准）。WACAS未定义/待确认，UPARS1.1.0/交接1.15不变；Wolai本轮里程碑尚待同步。设备未新连home-host/未启动候选，不重复上一部署或关机。下一步：保存候选并清洁源完整构建/生产UI，再默认NSIS及新E盘合成目录原生验证；成功后另批覆盖/静态部署，依序截图/es-ES。

最终封存：4d6fa8d7c16944c48ebf6f3b68032e653a9b692d已提交/推送并完整远端SHA读回，提交后Git干净。最新5h余8%/周55%，已触10%长阶段门禁，暂停等待用户额度恢复提醒；未新启动原生/包构建。Wolai主/交接已同步源SHA、验证/失败历史、未部署/API缺口和准确下一步并读回。本最小同步回执另保存，不修改产品代码，不关机/重置/自动唤醒。

源码候选已实现，未打包/安装/部署，不是正式发布通过。五小时剩10%边界保存，不启动新的原生构建/长阶段；恢复须先核本检查点、额度、Git及文件。上阶段后端31d9b7c与运维作业已经安全交付，不重复迁移/安装/部署；精确服务器副本见NEXT_PHASE_CHECKPOINT顶部。

## 范围与基线

- 用户要求按既定顺序继续开发，本阶段为桌面版本检查；不自动下载、安装、发布或回退数据。新桌面安装/官网前端部署/新公开Release需取得对应明确许可，不能套用上一后端许可。
- 基线8173740e9dcda6a9d35ed249de0faaf0b792e349，分支codex/audit-release-20261006-api；开工干净，无他人重叠修改。
- WACAS未定义/待确认；适用AGENTS、维护skill、交接1.15、UPARS1.1.0。阶段开工5h余32%/周59%，里程碑余22%、15%、13%，最新10%/周56%；不重置、唤醒或关机。所有维护写入须E盘。

## 已完成候选

- App工具栏新增真实PrimeVue按钮/Dialog/Message，中英词条齐全。用户明确点击才请求；内部/开发构建与公开tag分开，不能用package基础版本误判“已是最新”或建议降级。
- releaseVersion.js负责受限SemVer顺序、tag/版本/日期/schema校验、固定本仓库发布页和只读对象；releaseCheck.js只请求受控官网或Web同源的/release-info.json，cookie/Bearer均不发送、不跟重定向，16KiB流读取上限、取消、8秒UI截止、5分钟内存缓存，不改登录/数据源。
- public/release-info.json从现有已核验downloadRelease.js生成；build-release-info.js检查官网版本/发布页/下载base一致性，build前强制检查索引未落后。GitHub只读核对最新公开仍v0.1.2-beta.1，其余draft保持，不把候选当公开版。该索引不是自动遍历所有GitHub tag，发布维护流程须在资产公开核验后同步更新。
- Vite注入版本、源SHA、dirty和release tag；显式tag必须匹配app版本且源干净可识别，否则拒绝发布构建。release.yml仅将原prepare输出tag传入，不改变draft/公开授权/签名门禁。
- 主窗opener仅允许固定本仓库/releases/tag/\*默认浏览器URL；不授予任意URL、文件/自选程序权限，浮窗及MCP无扩权。2.7.0源码证明OpenerExt依赖已管理状态，原Builder未初始化；本候选补初始化并关闭自动链接接管，兼顾原受控备份目录打开状态依赖。未实际原生验证，不能称已完成实机修复。

## 验证证据与失败记录

- 完整308 Vitest/62文件、94生产UI通过，13 Web专用跳过（本阶段未重跑13真实HTTP；上一后端最终13有效，不冒称本次复跑）。日志version-check-vitest.log、version-check-production.log。
- 桌面Rust72单元+1真实stdio通过，fmt/严格Clippy通过；日志version-check-rust.log、version-check-clippy.log。未改server后端，共享业务代码未动。
- 最后小补丁（构建SHA全文提示、索引版本/base一致性、缓存到期反例）后，21定向测试/3文件、类型/lint、生产build与4个1280/960×640浅深严格nonce场景再次通过；日志version-check-build-final.log、version-check-ui-final.log。完整308/94属于该小补丁前，后续最终封存再运行完整门禁，不将定向结果冒充全量。
- 严格nonce矩阵验证真实PrimeVue动态样式、手动检查前零请求、请求无cookie/Bearer、内部版提示、边界宽度、Escape关闭/焦点回到入口；只用了隔离合成fixture，不是原生Tauri证明。
- 首次2工具测试因未显式设置TEMP被执行环境指向C盘沙盒缓存并EPERM，断言未执行，重设进程TEMP/TMP为E盘并宿主运行后18项通过。保留该不合维护要求的临时写尝试，不声称从未尝试C写入；不清理未知C目录/不改系统策略。
- 新延迟回调测试先出现undefined/never类型错误，改显式函数类型后最终typecheck通过；未忽略规则/删除测试。
- 当前dist为8173740+dirty内部候选；尚未clean source重建、生成可安装NSIS或替换release/mcp产物。不要把旧父子FA8BC7FF包或旧966F4864主程序当作版本功能包。

## 准确下一步

1. 恢复额度后查额度/Git、读此检查点及相关差异；已通过工作不重复，最终清洁源门禁除外。
2. 补版本检查使用说明/发布索引维护说明、API与交接规范：未新增自有invoke命令（仍7），但主窗URL能力及公开静态JSON契约须准确记录；确定将静态元数据作为公开运行状态资源维护，按实际契约补私有Apifox并读回，不能虚构CRUD接口。当前Apifox仍上一后端18HTTP/66原生，不声称新静态资源及插件说明已同步。
3. 核代码评审与源/权限边界，clean source重建并完整前端/生产回归；对发布tag识别/dirty拒绝补构建门禁反例。原生Windows隔离合成库验证1280/960浅深、键盘/焦点、严格CSP与opener限定URL/备份目录状态初始化，未授权真实CRUD或修改MCP配置。操作UI前读当前computer-use技能。
4. 通过后构建默认配置NSIS候选、记录SHA/源/dirty，申请本阶段新的桌面覆盖和官网前端静态资源更新许可；保持数据/账号/后端/独立MCP，公开Release仍另批。线上目前缺release-info.json，新功能未交付，原生请求失败必须显示失败而非“最新”。
5. 本阶段交付后才按原顺序继续官网最新合成截图/下载简化与es-ES等，不把尚未完成的工作量计为交付。

## 全部未提交文件（封存前）

.github/workflows/release.yml；package.json；vite.config.js；src-tauri/src/lib.rs；src-tauri/capabilities/default.json；src/App.vue；src/i18n/locales/en-US.js、zh-CN.js；public/release-info.json；scripts/build-release-info.js；src/utils/releaseVersion.js、releaseCheck.js；src/components/VersionCheck.vue；src/**tests**/utils/releaseVersion.test.js、releaseCheck.test.js；src/**tests**/components/VersionCheck.test.js；e2e/ui-consistency.spec.js；docs/NEXT_PHASE_CHECKPOINT.md；本文及随后handoff/文档检查点（提交后以Git为准）。均本任务，无他人修改。

## 同步、设备及风险

- 本阶段准备提交/推送并同步Wolai主/交接；最终SHA与读回另补。未完成API资源/插件说明的Apifox同步，准确缺口如上。实际后端和此前18接口同步已完成，不重复修改。
- 本机Colin未启动本阶段原生候选窗口、未覆盖应用或独立MCP；测试runner的隔离预览会自行结束。home-host上一后端安全部署SSH已正常退出，实际服务及日备份/15分钟监测保持运行，未关机，没有其它设备新连接证明。
- 站外告警、OS硬配额、异地备份/自动清理、跨平台正式验收及新公开包仍未完成；上一生产结论不变。
- 已记录历史UI债务：App快捷键/数据恢复自绘浮层与DataView可见browse span后续按PrimeVue约束整改，不把版本弹窗的真实组件证明推广为全局UI已合规。
