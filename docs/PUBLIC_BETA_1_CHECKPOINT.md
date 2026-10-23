# 公开测试版 Beta 1 检查点

## 2026-10-23最终交付回执（覆盖下方历史待办）

- 已公开：https://github.com/15169046827/easy-project/releases/tag/v0.1.1-beta.2 。六原始包+SHA256SUMS.txt+release-manifest.json共8附件，预发布而非latest，产品源34de5f2/成功构建39799550769。所有旧草稿保留。
- 官网下载已上线：https://home-host.tail2956dd.ts.net/#download 。源码6ac13ef2b3cedc1cb68dcb234379620a15cea45f；current=/opt/easyproject/releases/beta2-landing-20261023，新root700副本/var/backups/easyproject/beta2-landing-20261023。63交付文件核验、78旧资源保留；后端SHA904d2b3a.../PID不变、active，两库全表逻辑不变/integrity ok/FK0，未重启/未改凭据/权限/真实业务数据。首次脚本旧路径替换错误在写入前被守卫中止，修正后部署通过，未绕过守卫。
- 最终新官网lint/typecheck、258单测/53文件、82生产UI零重试、单独12真实HTTP通过；build通过，原大chunk警告保留。下载区六张截图已生成，375dark实看通过。正常证书HTTPS核对2HTML/62静态SHA/nonce+CSP安全头/4匿名401/health200通过；不将这些宣称macOS真机或原生桌面新安装验收。六包静态核验及临时CI恢复证据见下，未覆盖本机安装/MCP。
- WACAS未定义/待确认；实际AGENTS、手册1.11、UPARS1.1.0，非重新全库审计。原任务基线8912dda，当前分支codex/audit-release-20261006-api；本轮网站交付基线6ac13ef，保存前未提交仅本文与handoff CURRENT_STATE；功能源码均已推送。API/数据库契约无变，Apifox无需重传，交接规则/架构已复核无新增规则。
- 剩余风险：未签名/未公证、Mac/MSI干净设备及真实跨版本/混合DPI矩阵未验、服务器共享限流/配额/运维告警待完善；正式生产发布结论仍未通过。本轮公开测试交付完成，不自动开启这些新开发或扩大服务暴露。
- 已确认设备连接：本轮SSH home-host、既有Funnel HTTPS正常；桌面未重装/未操作登录或真实数据。额度最近五小时余90%、周余98%，未重置/定时唤醒/关机。后续仅按用户反馈；恢复先读本回执与Git状态，不重做已通过验证。Wolai主/交接最终回执本轮同步，完成后另记提交结果。

2026-10-23公开里程碑：Release420856621/v0.1.1-beta.2已显式draft=false/prerelease=true/latest=false，published_at=2026-10-23T01:50:06Z，匿名API八附件可见。六原始文件本机摘要全匹配，Mac tar版本0.1.1/正确ARM与Intel Mach-O、路径安全、DMG koly、PE/MSI容器通过，Windows两包NotSigned/EXE0.1.1/MSI0.1.1 x64。PowerShell COM只读MSI查询适配失败，改系统VBScript同一只读查询通过，不安装；失败不抹去。SHA256SUMS与manifest已附，不覆盖旧文件。官网ready/date/系统要求候选lint/typecheck/258单测/build与82生产UI零重试通过，12专用HTTP本轮单独待验，6张下载区深浅/窄图已产出、375dark实看正常。home-host SSH只读确认current=cd05e93-landing-20261022、active。接续：真实HTTP12复验→新源码提交→E盘唯一包→服务器新root700副本/只切静态、不重启、不改库→HTTPS读回与文档同步。WACAS/范围同上，基线f9e797d；未提交为本文、handoff CURRENT_STATE、release notes和3官网下载文件，API无变，Wolai待本阶段同步。

2026-10-23桥接3180b57/39885916458 completed/success，附件12472502404（49015160 bytes）包含六份原Release字节和bridge-verification.json。已恢复job contents:read，临时授权结束；不再派发需要写权限的桥接。产品源34de5f2、Release420856621仍草稿；原六资产GET/固定SHA成功，本地下载与容器/版本/架构待完成，不提前公开。上一轮附件失败原因与证据保留。

临时授权运行f5686a9/39885786950：原六文件GET及固定摘要核验步骤成功，但upload-artifact默认排除点目录，未产生附件；不是资产核验失败，不称整体成功。仅为精确路径.verified-beta2/*开启hidden-files上传（目录仅六原文件及公开元数据，无环境/凭据文件），重试同候选；取得附件后恢复contents:read。原始构建/资产均未改变。

2026-10-23恢复：用户明确允许上轮解释的临时CI contents:write，仅本次固定beta.2原资产GET核验；完成后恢复read。基线01f17fdf8ac7e6182ccf03a1d63b397c48075e7f/原分支，开工干净；五小时余97%、周余99%，无额度重置。产品源仍34de5f2。先派发一次限定桥接，取得原六文件后恢复权限，再独立本地核验、校验清单/说明和公开预发布/官网下载。服务器、桌面、真实库/MCP尚未操作；WACAS未定义，实际标准同下。当前变更仅release.yml临时权限和本文，后续运行编号待回填。

等待许可检查点：当前分支codex/audit-release-20261006-api、HEAD fc6e2c4413dd9e9d061991b87c29d9022e3caf4b（已同树推送）；产品产物源仍34de5f2，不能混同。WACAS未定义/待确认，实际AGENTS/手册1.11/UPARS1.1.0；目标与范围仍本次公开未签名beta及官网真实下载，不含覆盖安装/权限绕过/生产数据。本次只读桥接node --check与全仓lint、diff通过；首轮运行403失败完整保留。保存前全部未提交仅本文与docs/handoff/CURRENT_STATE.md，无代码或权限待提交。Wolai主项目与交接已追加此阶段并读回确认；API无影响，Apifox无需上传。停止本次自建4173预览及超时gh下载，六备份和辅助脚本留E盘；本轮未连服务器、未操作桌面/真实库/MCP，既有设备连接证据不刷新。下一步严格为下段权限确认，不继续发布或部署；同意后再核对Git/草稿/原构建状态与额度。正式生产发布仍未通过。

桥接首轮fc6e2c4413dd9e9d061991b87c29d9022e3caf4b/39805193677在读取草稿420856621时HTTP403（原构建run读取成功），未下载/上传附件、未改Release。拟将桥接job改为contents:write以读取未公开草稿，但提交/推送/重试操作被自动安全审批拒绝：认为属于额外CI写权限，需用户明确许可。该拟议变更已撤回，远端/本地仍contents:read；不能绕过审批或把它说成已执行。脚本只有GET且固定本候选，未向服务器传令牌。原质量/构建运行39799550769成功不受桥接失败影响。原始六包尚未独立验完，官网仍ready=false、不公开。准确下一步：请用户决定是否授权仅此核验job的contents:write（令牌具仓库写能力的风险，脚本不调用写接口）；批准后再修改/提交/派发，未批准不扩大权限、不发布未验资产。

续接最新：六份workflow备份已通过第一方连接器取到E盘，Windows/DMG可对应原文件，但Mac app备份为展开目录，不能重打包冒充Release原始tar摘要。新增仅本候选只读桥接：release workflow显式verify_beta2_assets_only模式，先检查原39799550769/source34de整体成功和420856621草稿/六文件官方及固定摘要，再下载原始六文件并上传验证附件；不重建/发布、不改资产、原构建门禁不削弱。默认模式维持全门禁；桥接运行不是新产品构建通过证明。准确桥接提交/运行后补。两原下载超时路径保留，不关闭TLS。五小时余28%、周余7%，无重置/唤醒/关机；当前服务器未连接、桌面/MCP/真实数据未操作。

最新目标已改为v0.1.1-beta.2：beta.1草稿420810898/源513b77f保留，不公开/不改名/不替换旧资产。完整日志进一步发现npm全量开发链2moderate/1high（生产0），官方补丁Vite6.4.4与Vitest4.1.12可消除；现正定向修补并加全量high门禁。任务仍为本次用户批准的公开测试版，不扩大权限/覆盖本机。下文beta.1为候选历史，准确后续会补新源/运行/核验，不把513构建作为最终新包。

依赖修复环境记录：npm11.3.0/Node24的Arborist在原目录与E盘干净隔离目录均报内部TypeError edgesOut，未产生有效新锁；不能当补丁不兼容或靠--force/legacy-peer-deps绕过。使用官方npm10.9.4仅E盘缓存/进程内解析，不改全局工具；精确根版本6.4.4/4.1.12，不用caret拉入后续次版本。beta.1六job后来均成功，但完整开发链风险未关闭故仍不公开。两种独立资产下载均遇连接/超时，未安装或运行、未把部分文件当通过，旧草稿与资产保留。

解析根因进一步确认：npm10也会尝试在Vitest支持的6/7/8范围中选Vite8，触发可选devtools→Vitest5递归后内部错误。仅对vitest和@vitest/mocker的vite使用根依赖引用$vite（6.4.4本来就在官方允许范围），无force/legacy-peer-deps、不放宽peer；随后npm10正常生成新锁、全量审计0。精确变动仅Vite6.4.3→6.4.4及8个Vitest系列4.1.11→4.1.12，esbuild仍0.25.10；npm10附带删除5个不相关libc标记待恢复，当前按新锁安装/复验中。未引入Vite8/Vitest5或全栈升级。

补丁安装里程碑：npm ci --ignore-scripts完成，447包；仅显式执行既有获准的esbuild0.25.10脚本，未新增允许列表，Mac可选fsevents不在Windows执行。最终官方全量npm audit=0（含dev与prod），3旧开发链告警清零。安装曾出现npm11对满足范围的@types/node22.20.5的peer提示，后续以npm ls与完整测试核对，不吞告警；原vue-i18n10等废弃提示保留，不为此擅自跨主版本迁移。原5个不相关libc属性机械恢复，不改变依赖版本；本地完整复验进行中，下一步新beta.2源提交与完整CI。

后续核验：npm11的ls将实际满足范围的6.4.4与esbuild0.25.10误标invalid（官方semver均true）；npm10.9.4在同一目录ls退出0。随后npm10按新锁offline/strict-peer-deps/ignore-scripts再完整ci（387本平台包，Windows过滤其它可选平台）成功、ls退出0，显式esbuild脚本成功；没有关闭peer检查或改松版本。某次早期ls命令忘设E盘cache，沙箱报告一个C盘临时日志；按准确路径只读及审批检查均不存在，未删用户文件，后续所有命令显式E盘cache/TEMP，不冒称曾移动该不存在文件。完整新版258测试与构建重新执行中，之前中止的运行不计通过。

beta.2本地候选：补丁后258单测/53文件通过，lint/typecheck通过，build/release:check结果收尾核对；全量npm审计0，npm10 strict-peer-deps安装/ls退出0。即将提交当前完整受保护候选（网站ready=false），dispatch beta_number=2；旧beta.1不公开。实际新源/运行编号须在派发后补记，发布前仍需六job与独立六资产验证，不能用本地单测代替。

## beta.2最新构建入口

- 最新整体Actions39799550769已completed/success（2026-10-22T15:08:37Z），新草稿420856621/源34de5f2/六文件齐。个别job汇总曾滞后in_progress，但逐步全部success且整体最终成功，不能拿较早不一致状态当最终失败。258单测/53文件、9性能、52Rust+stdio1、完整npm/prod均0；CI生产UI为81直接通过+1既有smoke依赖保存用例重试后通过、12真实HTTP专用跳过，不能写零重试。本机同一生产构建对该用例3次/零重试均通过（6.5秒），原CI不稳定记录保留，未改断言/超时/重试规则。
- 独立新候选下载使用正常TLS curl仍遇28超时，尚未取得六份有效文件；不公开。改从同一成功运行的workflow备份下载，仍必须与Release每份size/digest一致及版本/容器/架构核验；不是把工作流成功当资产验收。新下载目录E盘beta2-workflow-artifacts，TEMP/TMP明确E盘。API契约、服务器、真实库、桌面/MCP仍未操作。

- 旧beta.1汇总GET长时间仍in_progress、六job却全部success；CLI及一次标准POST取消均拒绝（409“not in progress”），未执行取消、未强制操作、不能把它定为实际队列阻塞原因。独立正常TLS客户端读回同样汇总；新beta.2继续排队，未重复派发/改并发规则。所有旧草稿/资产保留。下载辅助现精确绑定34de5f2/beta.2/39799550769，使用正常证书校验的curl、凭据仅stdin/内存、签名跳转仅固定release-assets主机，既不回传GitHub令牌也不输出签名URL。

- 源34de5f2edb090b897f6eb98ccbc5a376f4a7aece/tree73204176b8be969f526bbb0c8afbc1f80bfd5042已精确非强制推送，16文件含补丁/官网ready=false及记录；工作区当时干净。Actions39799550769，2026-10-22T14:52:34Z派发，headSha精确一致。app仍0.1.1，beta_number=2。
- 补丁后258单测/53文件、lint/typecheck/build/release:check/diff通过；新锁仅9版本修补、libc元数据已恢复，esbuild0.25.10不变，全量npm0。源码网站仍ready=false，尚未部署/公开。下一步等待本次完整六job，独立验证新beta.2六文件，补SHA清单/实际验证说明后显式公开，再填日期/ready=true并复验官网、安全静态部署。旧beta.1不得公开或当作新资产来源。
- 最新额度五小时余48%、周余10%；硬5%与五小时低10%仍适用，不重置/唤醒/关机。当前只新增本检查点未提交；其它代码已入Git。实际服务仍cd05e93、桌面与独立MCP/真实数据未动；新的Wolai进度待同步。

日期2026-10-22；用户明确批准公开未签名预发布测试版，并接入官网下载。此授权不代表正式生产验收通过，不授权覆盖本机、迁移真实库或改变MCP/服务器权限。

- 目标：当前源重新构建Windows x64 NSIS/MSI、macOS ARM/Intel各app/DMG；逐份摘要/容器/版本/架构核验后，公开新v0.1.1-beta.1，官网列实际文件与风险。旧7个草稿及资产保留，不改名冒充新包。
- 基线：8912dda35c5ffca6a26d338be5467433d7e9db9e，codex/audit-release-20261006-api，开工干净。WACAS未定义/待确认，实际AGENTS/交接规则1.10/UPARS1.1.0质量原则；本次非新全库审计。
- 额度：开工五小时余88%、周余16%；长阶段前/里程碑复查，低10%或硬5%按规则保存暂停，不重置/唤醒/关机。
- 实现中：app版本0.1.1（package/锁/Cargo/锁/Tauri一致），公开标签v0.1.1-beta.1；现有release流程增public_beta/beta_number，仍先保护性draft、同SHA/防覆盖/质量安全三平台构建，不自动发布。旧internal与stable行为保留，增加互斥/编号/保护单测。
- 未提交文件：package.json、package-lock.json、src-tauri/Cargo.toml/Cargo.lock/tauri.conf.json、scripts/prepare-internal-release.js/.test.js、.github/workflows/release.yml、本文。官网尚未改下载状态。
- 下一步：本地lint/typecheck/版本与发布脚本正负例，确认新标签/草稿未占用；保存提交/推送，dispatch原分支新beta，核对精确headSha。等待完整质量/新鲜安全门禁、3平台构建；任何失败先定位，不绕过规则或复用过期内部例外。通过后独立下载/摘要/格式核验，公开Release与SHA清单，再更新官网并安全部署/读回。
- 剩余风险：未签名/未公证、Mac和MSI干净设备/真实跨版本/多屏矩阵未验，须公开说明而不写正式通过；原Linux信息告警只按实际发布目标启用树复核，不自动延长旧内部例外。若发现新漏洞或真实可达风险先整改/复验。
- 同步：Git未提交/Wolai与交接待本轮里程碑同步；API契约无变，Apifox无需重传。官网当前仍cd05e93旧下载状态，桌面/MCP/服务/真实库均不动；本轮尚未连接服务器，既有home-host状态只沿用上轮证据。

## 准备里程碑

- 构建源55f2699d3fc147d5e074aa3788ed40b83a725d20已同树ddc6a1e1691a095413f25e48f9a0a313345b81f6/force:false推送；Actions39791228497的headSha精确一致，2026-10-22T13:55:36Z启动。validate与rust-security进行中，尚未预留/公开新Release，旧7草稿不变。
- 官网后续WIP：LandingPage.vue、downloadRelease.js（ready=false，未公开不展示）、landing中英文词典、e2e/landing.spec.js、downloadRelease单测；lint/typecheck初次通过，精确链接断言已补、末验待。六链接仅固定本项目v0.1.1-beta.1；公开后填实际发布日期并启用、补校验清单。不把这部分WIP混称55f构建源码。
- 最新额度五小时余81%、周余15%；无重置/唤醒/关机，足够继续当前阶段，重要里程碑再次查。准确下一步：等当前workflow结果；如安全/构建失败先定向处理。下载脚本/核验器历史参数固定旧0.1.0，必须新建或精确参数化，不盲跑旧脚本。

## 新鲜安全检查与目标适用性

- EP-REL-SEC-001/P2：官方npm audit全量3依赖问题（1high/2moderate），涉及Vite6.4.3开发服务器launch-editor/路径边界及Vitest/@vitest/mocker4.1.11手动mock注册/Windows路径校验。触发需开发服务/测试浏览器相关入口；Rust线上服务与打包静态生产资产不启用这些处理器，不能称生产远程漏洞，但构建/开发边界须修。证据GHSA-587h-7wmj-h5pm等5条Vite公告和GHSA-qxg6-89mg-rqv8/GHSA-xp26-3454-mjgp，官方最低兼容修补6.4.4/4.1.12，npm官方元数据和公告已核对。定向lock更新/复验进行中，未关闭或忽略检查。
- release/普通CI新增全量npm high门禁，保留原生产门禁；beta/internal标签不走稳定版push发布路径，仍只手动构建，避免公开候选时再启动不匹配稳定版标签的流程。需要新候选beta.2；现有beta.1资产/草稿均保留。

- 第二轮39793266820已启动，headSha=513b77f08bc2482651887b3554196369905c4770（CI修复、无产品逻辑/依赖改动）。第一轮无draft，继续beta.1并由预留器再查冲突。下载辅助精确源/目录已同步到第二轮，不能使用55f作为最终包来源。
- 本机E盘TEMP下原两项credentials::tests均通过（2/2），未放宽C盘拒绝；二次CI将复验全部52 Rust+stdio门禁。Wolai主/交接已保存第一阶段源55f/运行39791228497进度，后续需追加首轮失败/CI修复513b77f/二轮结果，不冒称外部文档已含最终交付。

- 第一轮39791228497最终失败，prepare/build未执行、无新Release：Rust51通过/1失败，credentials::tests::protected_file_can_be_saved_replaced_read_cleared_and_rejects_corruption在CI默认C盘TEMP触发“EasyProject storage must not be on drive C”。产品保护符合规范，不是放宽路径或删除测试；release validate和普通CI verify两个Windows作业设置进程级TEMP/TMP到github.workspace/.validation-temp，创建目录并明确拒绝C盘workspace。准备重跑完整门禁；旧失败保留，不声称首轮成功。
- 官网WIP本地完整258单测/53文件、lint/typecheck/build通过，ready仍false。与55f构建源区分；下一轮仅提交CI修复及检查点，网站WIP继续保留至实际公开后启用。

- Actions39791228497/rust-security job119867485063成功：本轮从官方库fetch，1349公告/528锁依赖，--deny yanked，未见漏洞/撤包失败；保留5信息告警RUSTSEC-2024-0370/2024-0429/2026-0370/0371/0372，不称零告警、不添加ignore。gh原日志控制字符拒绝直接输出，改用内存捕获/清理控制字符后只输出匹配摘要，不放宽系统安全。
- 当前锁针对Windows x64、Mac ARM与Intel分别逆依赖检查proc-macro-error/glib/zvariant5.7/zvariant_derive5.7/zbus_names4.2，共15项均nothing to print，三发布目标无启用路径。Linux不发布，也不将旧内部例外自动延长为所有公开平台许可；未来启用Linux必须重新整改。资源体积告警仍保留且按需加载，不冒称正式生产通过。
- validate仍在Rust测试阶段；未公开候选，官网ready=false。发布说明草案docs/RELEASE_NOTES_0.1.1_BETA_1.md新增，准确源码/测试数/产物摘要待结果补齐。

- lint/typecheck通过；发布候选脚本10项正负例通过，release:check=0.1.1一致、diff通过。未删除测试/关闭门禁；旧internal候选测试继续通过。标签v0.1.1-beta.1查询404，7个既有草稿无同名，最后release工作流已结束，无冲突运行。
- 新增docs/RELEASING和handoff README/CURRENT_STATE/RULES当前任务增补；手册1.11/79条，本次公开beta的明确授权与正式验收分开，不是永久放行所有未来包。当前全部修改准备提交，下一步dispatch新模式并核对完整源SHA。
