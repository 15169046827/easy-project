# 后续阶段：公网稳定性、更新体验与国际化

2026-10-26当前进入INTERNATIONALIZATION/es-ES候选：三语入口/701主词条/组件locale/日期数字与用户新增反馈邮箱已接入，343测试+20词条门禁/17界面定向通过。最终104+13/clean封存待续；新增默认状态西语别名需共享服务端重复校验，已单独询问后端/MCP扩展许可，未回复不改后端/部署缺口。官网邮箱尚未上线，不把本地预览当公网交付。前两阶段已完成不重做，下一步以I18N_SPANISH_CHECKPOINT顶部为准。

2026-10-26官网新合成任务/看板截图及下载分组已上线83adac3/current=website-refresh-83adac3-20261026。323/94+13通过，新root700完整副本、71文件/306旧assets、2DB及后端PID2608/unit/Funnel保持；正常TLS2HTML/70静态/4匿名边界通过。桌面和独立MCP无本阶段变更，仍公开beta.1不新发包。准确证据见WEBSITE_REFRESH_CHECKPOINT顶部。下一步规范i18n及es-ES，按本次许可验证后安全更新，不重做前两阶段。

2026-10-26版本检查已安全交付（源31c756e），本机578文件新副本/575非程序及启动后业务行保持；服务器version-check-31c756e-20261026，新root700副本/2DB/后端PID2608/unit/Funnel不变，2HTML/66静态TLS核验通过。323单测/94生产UI/13真实HTTP通过；原生1280浅深及发布页打开已验，原生960/完整键盘/备份目录未验，正式生产仍未通过。用户已批准版本检查、官网截图/下载、西语三阶段逐阶段安全更新，不新发公开包/改后端/独立MCP/权限或迁移。准确证据见VERSION_CHECK_CHECKPOINT顶部。现在直接进入新合成产品截图/下载收纳，随后规范i18n和es-ES，不重复旧安装/迁移。

2026-10-26最新续接转[版本检查专项](VERSION_CHECK_CHECKPOINT.md)：源码/主要门禁已完成，当前5h余10%边界保存，不启动原生打包新阶段。308前端/94生产UI、桌面72+stdio1通过，最后小补丁21定向+4严格CSP/静态构建复验通过；原生/NSIS/clean封存/API资源同步及真实交付尚待。旧后端31d9b7c已安全交付，不重复；无本阶段新安装/前端部署/公开Release授权。

## 2026-10-26桌面版本检查候选开发中（最新，未部署）

验证里程碑：18工具规则/请求测试+3真实PrimeVue组件测试均通过；新延迟回调测试曾类型失败（undefined/never），已用显式函数类型修正，最终类型/lint通过。生产构建/release:check及4个1280/960×640深浅严格nonce CSP/手动无凭据请求/Escape焦点恢复通过。当前dist来源8173740+dirty（内部候选），未封存安装包；提交后须按clean source重建，不能用它冒称最终构建。最新五小时余15%/周56%，将完成当前完整前端/生产/Rust复验后再次查询，低于10%不再启动原生打包新阶段；无关机/重置/唤醒。文档/API指南/交接与Wolai候选同步、原生真实CSP/包/交付仍待。

- 上一后端安全交付回执8173740e9dcda6a9d35ed249de0faaf0b792e349已推送/完整SHA读回，Wolai主/交接实际交付读回通过；线上31d9b7c、主PID2608/easyproject/两timer正常、2DB保持，不重复迁移/覆盖。当前基线8173740，分支不变，WACAS未定义/实际UPARS1.1.0/规则1.15。
- 继续原批准第2阶段：手动版本检查，不自动下载/安装，不自动访问网络。只GET官网同源/桌面受控Origin的release-info.json，不发送cookie或Bearer，不用可编辑旧缓存地址；16KiB上限/8秒UI截止/取消及5分钟内存缓存。元数据从既有已公开验证的landing downloadRelease单源生成，严格schema/tag/SemVer/日期，发布页只能派生本仓库GitHub tag地址；不直接信任远端URL。GitHub只读确认最新公开仍v0.1.2-beta.1（旧beta.1 draft保留），不公开新Release。
- 新App工具栏真实PrimeVue版本按钮/Dialog，显示本机构建与公开版、明确内部构建不能仅凭版本号升级、签名需另验；中英文词条齐备，西语仍后续未做。Vite注入源SHA/dirty/受保护发布tag，release工作流仅传既有prepare tag，不自动发布。新public静态metadata文件不是业务API/无新增CRUD工具。
- 初始化已有opener插件但关闭自动链接接管，只给主窗限定本仓库/releases/tag/\*默认浏览器权限；无任意URL/文件打开权限，浮窗及MCP不扩。源码核实2.7.0的OpenerExt使用已管理状态，而原Builder未初始化；同时补足原受控备份目录打开的状态依赖。真实原生行为/严格CSP尚待验证，不冒称已修复实机问题。
- 首轮类型/lint通过；2个新增工具测试首试未进入断言，进程未显式带E盘TEMP时被执行环境引到C盘沙盒临时缓存并EPERM，非产品通过/失败。已明确所有后续测试TEMP/TMP/npm缓存E盘并宿主上下文复验；不改系统策略、不过度忽略、不安装工具。该次临时写尝试不符合维护约束，准确保留，不能称全程没有C盘尝试；不删除未知/宽泛C目录。
- 准确下一步：工具测试/组件取消与错误反例，最终类型/lint/完整前端/build及UI深浅/1280/960/键盘/严格CSP复验；桌面Rust fmt/Clippy/测试/隔离原生及NSIS候选、源/权限/文档同步随后做。新前端/桌面安装/公开版本均未部署，上一后端许可不跨用于此；metadata线上尚404，新功能未交付，不制造“已经最新”的离线假象。
- 开工五小时余32%/周59%，本节点余22%/周58%，未触门禁；进入昂贵验证前再次查询。当前全部未提交：.github/workflows/release.yml、package.json、vite.config.js、src-tauri/{src/lib.rs,capabilities/default.json}、src/App.vue、src/i18n/locales/{zh-CN,en-US}.js、public/release-info.json、scripts/build-release-info.js、src/utils/{releaseVersion,releaseCheck}.js、src/components/VersionCheck.vue、src/**tests**/utils/{releaseVersion,releaseCheck}.test.js、本检查点（后续以Git为准）。无他人修改，候选未Git/Wolai/交接同步；设备本机仅代码/测试，home-host SSH已正常退出，仍运行，无关机/重置/唤醒。
- UI后续复核记录：App历史快捷键浮层和DataView历史恢复浮层仍为自绘，DataView可见browse span也需在后续UI一致性范围按PrimeVue约束整改；本次版本弹窗不复用这些自绘控件，不将历史遗留说成新实现或已全局合规。

## 2026-10-26限流及逻辑写入预算已安全上线（最新）

- 用户已明确批准新受限副本、仅更新home-host后端及受控配置（每工作区512MiB/池8GiB，短重启，不迁移/清理、不改桌面/本地MCP/域名/权限）。基线54bb2d57d291c1a2320f53428f591f9874e768a0，原分支，开工五小时剩40%/周60%；WACAS未定义，实际AGENTS/维护skill/交接1.15/UPARS1.1.0。
- 服务器实际current=/opt/easyproject/releases/public-safety-31d9b7c-20261026，后端源31d9b7c/CI40249270452、ELF SHA9D0D7D0A7F1F91743AF8F87A21ADB2802BA8D4A2728895DA0E2C7E44AC5BC358；前端沿用原47b981d，282个Web文件SHA逐一保持。新root700副本/var/backups/easyproject/public-safety-31d9b7c-20261026保存完整旧程序/数据/主unit及原drop-ins。
- 以原easyproject身份check-storage对1个现有工作区预检通过后才停主服务；2DB所有原字段/ID/关联/账号行摘要和完整schema对象保持，账号3/业务8，integrity ok/FK0。只允许启动epoch值变化、不改其ID；未调用迁移、业务CRUD/清理/恢复覆盖。仅新public-safety.conf增3项环境配置，主unit字节与原件不变、受限身份active/enabled、原Funnel配置JSON完全一致，两个运维timer仍active/enabled。
- 正常TLS外验官网200、health200、匿名session401。没有登录真实账号/压力测试/多公网客户端人工验证，不把代码/隔离测试冒称公网全矩阵。桌面/独立MCP/新连接均未更换或停止，仍需此前客户端重连。
- 首次部署预检在停服前因私有umask使新版本/bin目录0700而失败，原服务和数据未动；stat与受限身份执行明确Permission denied。修正仅本次不可变版本目录为0755、数据库/副本/root暂存继续0700，逐SHA验证复用本任务暂存；未关保护或换用root运行主应用。最终辅助脚本audit-tools/deploy-safety-31d9b7c.py及root deploy-v2.py SHA111A1C2DADC832055A2204C0E39A5ACA57B01A218604D8E7860A77C4EFD4032B，首次失败脚本及现场保留。
- 本阶段核心交付闭环：认证每客户端与全局预算、逻辑写入预算、定时备份/隔离恢复、磁盘本地告警已实现并实际启用；不是OS硬配额、站外告警/异地备份/自动清理或正式生产验收通过。后续按批准顺序继续桌面版本检查，再官网当前合成截图/下载与es-ES等；新桌面安装、前端部署及新公开Release届时须相应授权，不跨用本次后端许可。
- 当前未提交为本回执与随后Git/Wolai/交接/API/计划说明，无产品源码改动；服务器部署动作不改本地源码。SSH已发正常退出，不关机；主服务和监测保持运行，所有本机下载/脚本/副本在E盘。文档最终同步及下一阶段开工额度见后续回执。

## 2026-10-26安全候选全量门禁/契约已闭环，等待后端更新许可（最新）

- 源码31d9b7c676da7b16abbc252d0ea309fc800f0f63已提交/推送并完整SHA读回；CI40249270452/server与security两job成功，Linux62单元+19集成（含Unix链接拒绝）、20运维及原生systemd保护测试通过。Windows最终61+19、287前端/11契约、13真实HTTP、类型/lint/严格Clippy/格式/CLI4工作区19文件SHA不变均已完成，日志见下段。
- 私有Apifox仅更新本次6个已管理HTTP接口，全18操作内容/Schema/状态/分组与摘要最终读回通过（public-safety-apifox-20261026.log，Updated6/Verified18）；没有机械重传原生66接口或替换本地MCP二进制，接口总数18/15路径保持。新增503/507响应按官方updateHttpEndpoint结构创建并读回，受控同步器仍先核全体远端冲突，未知目标联网前拒绝。
- Linux产物已准备但**未部署**：CI artifact12619417944，官方归档digest独立匹配ADC6A8D75DE4AC571399D487F5938EB6FAF7FB4D90D1926B13F77AB46D54124E，解压唯一ELF64 x86-64服务程序10983272字节、SHA9D0D7D0A7F1F91743AF8F87A21ADB2802BA8D4A2728895DA0E2C7E44AC5BC358。本机E盘audit-tools/public-safety-31d9b7c保存zip/unpacked；不拿旧a5aa958后端冒充新候选。
- 已向用户单独请求本阶段后端安全更新许可，尚未收到：新受限服务器副本后只更新home-host后端及明确512MiB/8GiB准入/受信代理配置，短暂重启应用；不迁移/清理库，不改桌面/独立MCP/域名/权限。此前父子安装授权和38944停止许可均已使用，不扩大到本阶段部署；回复前不上传/安装该新后端或启用新限制。原主服务及日备份/15分钟监测继续正常运行，SSH已退出。
- 获批后准确下一步：查额度/Git及此段；重新核home-host当前release、Tailscale1.104.1/实际HTTP Funnel代理类型与受限easyproject身份；新产物check-storage对现有目录只读预检通过才停主服务并做新root700完整程序/配置/DB副本，原字段/ID/关联/账号摘要核验后只换后端并以新限定drop-in增3项配置，保持原service安全选项/Origin/CSP/Funnel；不执行schema迁移，不动桌面或独立MCP/新进程。正常TLS、匿名拒绝、原数据和timer核对后同步Git/Wolai/交接，再按原顺序继续版本检查/官网新截图与es-ES等已批准开发。若用户选择不部署，保留候选与准确未交付边界并按新指示继续。
- 基线31d9b7c、分支codex/audit-release-20261006-api，WACAS未定义/实际UPARS1.1.0/规则1.15；最新额度上节点五小时剩52%/周62%，不是额度暂停。当前未提交为docs/api/web-apifox-manifest.json与本最终同步检查点及随后交接/API说明（保存提交后以Git为准），无未提交产品代码或他人修改。候选同步即将保存Git/Wolai，实际后端未变；所有本机写入E盘，不关机/重置/定时唤醒。
- 后续发布边界：既有公开桌面beta不自动等于后续schema8/UI功能交付，需在新发布阶段复核兼容矩阵并取得具体新Release授权；不得将当前私有桌面或服务器升级说成新版公开下载已更新。无站外通知、OS硬配额、自动保留清理或异地备份，正式生产仍未通过。

## 2026-10-26认证限流及业务写入预算候选复验（最新）

最终本地补验：CLI在4个既有合成工作区预检通过，19个原文件SHA及文件数均不变；最终13真实HTTP串行零重试通过。新增真正HTTP507及远端MCP HTTP200/isError容量拒绝/认证查询保留反例通过，最新完整server61单元+19集成、严格Clippy/格式通过；日志public-safety-{server,clippy}-final.log及public-safety-http-final.log。287前端/11契约/类型/lint有效。候选将提交并触发CI，不部署前不改实际服务配置。

- 基线766e424，原分支；WACAS未定义、适用AGENTS/维护skill/规则1.15/UPARS1.1.0。本阶段开工五小时剩63%，最新上节点52%，仍可继续，下一里程碑重查；不重置/唤醒/关机。
- 共享限流候选如下一段；另增storage_budget模块，默认单工作区512MiB/服务数据池8GiB，包含恢复点/审计及2×最大文件+8MiB余量。远端业务变更（含导入/备份/恢复、HTTP MCP）在审计/恢复点/revision之前拒绝超限；Web507/测量异常503、MCP限定安全工具错误，读/导出保留，登录等账号认证不因该门禁锁住。无自动清理或OS硬配额承诺，并发可短暂超准入值；本地离线/独立stdio不受远端预算影响。范围/配置/测量限制见server/deploy/STORAGE_BUDGET.md。
- 新check-storage只读元数据预检，不打开/初始化缺失DB、不改revision；部署必须先在现有数据上通过该预检，再新保护副本后替换后端，不迁移schema8或更换前端/桌面/独立MCP。预算512MiB/8GiB可由维护者在受控环境设置，客户端不能传入；未来归档/清理须另授权。
- 验证：最终Windows server61单元+18集成，fmt/严格Clippy/显式build通过；6限流、5预算及1Web/MCP写前拒绝/读保留边界覆盖，Linux另有链接拒绝测试待CI。287前端/59文件、11契约及lint/类型通过，新增429/503/507不会登出或重试写入的反例。13真实HTTP串行通过；显式cargo build后SHA不变BE6C13B8...证明当时套件使用新预算程序（之后仅增加check-storage预检，最后HTTP补验正在安排）。原生UI/桌面未改，不冒称重跑90生产或新桌面包。
- HTTP契约18操作/15路径，变更限流3项及workspace action/revision、MCP post的503/507/工具错误说明，受控定向同步器仅允许已管理目标，保留全体写前冲突校验和最终全量读回。尚未同步本候选Apifox或部署服务器；native23工具/66原生契约/独立程序不变。
- 当前未提交：server/src/{http.rs,lib.rs,main.rs,mcp.rs,workspace.rs,rate_limit.rs,storage_budget.rs}、server/tests/web.rs、server/deploy/{easyproject-system.service,TRUSTED_PROXY.md,STORAGE_BUDGET.md}、scripts/{build-web-api.js,sync-web-apifox.ps1,apifox-contract.test.js}、src/**tests**/api/remote.test.js、docs/{MCP,NEXT_PHASE_CHECKPOINT}.md、docs/api/web-openapi.json及随后交接/候选文档。无他人修改，所有维护写入E盘。
- 准确下一步：最终CLI无写入核验/13HTTP补验与文档校验，提交候选触发Linux CI（含新Unix链接反例）、6个HTTP接口定向Apifox同步及全18读回；成功后新受限服务器副本、既有库预算预检通过、停主服务备份核验后只换新后端及新增限定配置，原字段/ID/关联保持再启动/探活。不重复本机安装/MCP停止/迁移。服务器运维timer已启用继续运行，主程序当前仍旧后端/共享反代限流；本轮SSH已正常退出。

## 2026-10-26共享认证限流候选完成（最新，尚未部署）

- 运维实际交付回执766e424已推送且Wolai主/交接读回。当前候选基线766e424，分支不变，WACAS未定义/实际UPARS1.1.0/交接1.15。root运维SSH已正常退出；主服务及两个timer保留运行，不关机。
- server/rate_limit模块实现显式EASYPROJECT_TRUSTED_PROXY=none（默认）或tailscale-loopback；仅后者且真实回环peer+HTTPS origin+单值有效IP/匹配Host/https时使用代理地址，异常回退peer桶，非回环/默认永不信任。依据服务器实际1.104.1及官方对应tag源代码，不用任意XFF作认证或权限。保留2哈希/8业务并发位、Origin/CSRF和loopback监听。
- 每客户端登录30/15min、注册10/h、重置10/15min；独立全局300/100/100及1024键上限，IP轮换不能绕总预算。满表拒绝新键但保留已有键，不记录用户名/凭据。内存计数重启清空，不冒充持久账号锁。服务模板已加显式模式，实际线上尚未启用或更换二进制。
- 已验56 server单元+17集成、fmt/严格Clippy；新增6单元+受信/默认两模式真实路由反例，未真实创建账号。其后全局预算测试扩到三操作，6项重验通过/Clippy通过；11 API契约测试、lint通过（最新新增测试/同步选择器后待再最终lint）。新增HTTP定向同步OnlyOperations只允许已管理ID，未知ID在联网前拒绝，避免机械重写未改15接口。HTTP18说明仅本地候选更新3项，尚未同步Apifox；native MCP契约/独立程序不变。
- 准确下一步：继续同一公网稳定性阶段的工作区/数据池写入预算与安全可见错误，Web及远端MCP写前统一检查、读/导出不阻止，不自动删数据。只做可配置逻辑写入准入预算，不冒称系统硬配额；保留恢复点空间，低空间由已部署运维监测。然后完整server/HTTP/门禁与契约同步、CI及新副本后受控后端部署，不重复迁移、桌面安装或MCP替换。预算初始值/边界须明确记录验证，不隐藏新限制。
- 当前全部未提交：server/src/{http.rs,lib.rs,main.rs,rate_limit.rs}、server/tests/web.rs、server/deploy/{easyproject-system.service,TRUSTED_PROXY.md}、scripts/{build-web-api.js,sync-web-apifox.ps1,apifox-contract.test.js}、docs/api/web-openapi.json、本检查点。其余Git干净，无他人重叠修改。预算尚未实现，不声称整个第一阶段完成；Wolai上次仅运维实际交付，这一候选里程碑待同步。

## 2026-10-26运维备份/容量监测已部署（最新）

- 源d9fe3ac9225302d1a2fc033defc796bb9a8a50c8已推送，CI40245676939/server与security两job成功，包含20Python/原生隔离systemd及原Rust检查/安全扫描；不扩展为桌面全依赖新扫描。Wolai主/交接候选里程碑已读回；本段实际部署回执随后同步。
- root新保护目录/var/backups/easyproject/ops-install-d9fe3ac-20261026保存主unit原件/原PID和current/安装结果，既有运维目录与同名unit先确认不存在；root只读代码/opt/easyproject/ops/safety.py与0644 unit已安装。受限作业源/var/lib/easyproject只读、仅ops副本目录可写、无网络，flock/超时保护保持。
- 首次真实数据**只读**备份及隔离恢复通过2DB，bundle=/var/backups/easyproject/ops/snapshots/snapshot-e8348bf22ecca4db49b846413a470eace；逐库一致、不是跨库原子，不恢复覆盖在线库/调用业务CRUD。原主程序PID680未变/active，正常TLS官网与health200，没有重启主程序、迁移数据库或删历史副本。
- easyproject-backup.timer及easyproject-health.timer均enabled/active；run和health作业Result=success/ExecMainStatus=0。日备份03:00按服务器UTC加随机15分钟（首次下次时间2026-10-26 03:11:08 UTC，即上海11:11:08），健康每15分钟；并非Codex定时唤醒。仅本地journal/受限回执告警，没有站外通知或自动清理/硬存储配额/异地备份。
- 安装辅助脚本audit-tools/install-ops-d9fe3ac.py语法通过，root副本实际SHA92388357662641AB95AF0FDC13978FE8A6E2D4863081A1350A7C9040A8C8068B，最终候选包97F4BC17...已在root私有目录再次比对来源字节。新systemd timer文件补LF约束，未改变应用权限。
- 下一步继续第一阶段：核对可信Funnel转发边界后改善共享登录/注册限流，再补工作区写入预算及可见告警，不信任任意转发头、不改Funnel/域名/来源授权。目前home-host实际Tailscale1.104.1；官方同版本serve.go表明代理覆盖为单一X-Forwarded-For，后续仍需显式受信回环配置、单值/格式/Host/Proto校验、默认不信任及全局预算，不能只读Header就放宽。此前方案来源只为研究，不代表已改限流。
- 基线d9fe3ac，分支不变；WACAS未定义/实际UPARS1.1.0/交接1.15；最新额度上节点五小时剩76%/周66%，下一长阶段前重新查询。当前未提交.gitattributes、本文与后续交接/服务文档部署回执，无未提交产品代码。SSH维护连接仍开，本机桌面已关闭，MCP需客户端重连；不关机。

## 2026-10-26运维安全候选本地与Linux复验通过（最新，未部署）

- 候选补齐备份/恢复空间预算：完整bundle及最大恢复副本预算、复制中剩余页容量检查，额外保留至少1GiB和10%空间；并发系统写入仍可能耗空间，不冒称硬配额。20项Windows测试、20项home-host Python3.10测试、真实systemd只读源写入拒绝/WAL快照/实际恢复/缺源/锁冲突/硬超时均通过。最终包97F4BC176FA41F429AFC3292715C9DEE05D9EA1EB21B37480C17D5192115CD5F，隔离代码/var/tmp/easyproject-ops-candidate-20261026-d，隔离证据/var/lib/easyproject-safety-check-o5kbhmuj。
- 首轮NAMESPACE失败已通过journal证明PrivateTmp隐藏/var/tmp测试根，测试移至与生产数据无包含关系的/var/lib/easyproject-safety-check-\*，未关闭保护；旧失败现场保留。候选unit权限已显式0644，systemd语法验证通过，唯一余警告为系统snapd旧键，不修改非项目服务。两轮中间成功证据jccevsk5/6greqrcr是过程，最终以o5kbhmuj为准。
- 新CI门禁覆盖20Python测试、systemd模板语法和sudo隔离原生验证；未改Rust/UI/API权限契约，本次不重复已有效业务测试。lint、10契约、release:check、Python3文件AST及diff检查通过。ops候选尚未部署或启用timer，线上主服务active/enabled，/opt/easyproject/ops及目标unit/ops副本目录检查为尚不存在。
- 下一步：本候选提交/推送并等待CI；核对服务器无同名运维文件后，新root700运维部署副本、安装root管理代码/只读源作业、先执行一次真实只读备份与隔离恢复；成功并核对主服务未重启后启用原计划的每日备份/15分钟磁盘监测timer，不自动清理副本。随后继续第一阶段的共享限流/容量与可见告警，不能把本候选或本机测试当作整个公网验收通过。
- 本节点未提交：.github/workflows/server.yml、server/ops/{safety.py,test_safety.py,README.md,verify_linux_safety.py}、server/deploy/{easyproject-safety@.service,easyproject-backup.timer,easyproject-health.timer}、本检查点、父子专项最终同步回执及随后交接/文档。基线d5e1c55，分支不变；WACAS未定义，实际UPARS1.1.0/规则1.15。Wolai上次已记候选/18本地/ Linux进行中，本20+Linux最终状态待本里程碑同步。SSH仍在本次授权维护会话，未改真实业务库或主服务，不关机。

## 2026-10-26恢复后续阶段：运维安全候选验证中（最新）

- 父子改造已真实交付桌面/服务器/独立MCP，升级与契约回执d5e1c55e36c1155b2937456c38268d956027941d已推送/完整远端SHA读回，Wolai主/交接读回通过；准确保护副本/23工具只读发现/原字段与ID保留见PARENT_CHILD_TASK_DISCUSSION顶部。客户端须重连，正式生产仍未通过。下方“状态设计仅讨论”的早期方案已由最终项目字典方案覆盖，不再开发隐藏三分类。
- 用户授权完成本步后按原开发顺序继续，本阶段接续本文件原批准公网安全/稳定性计划，不新增公网入口、账户权限、付费服务或删除数据。WACAS未定义/待确认；AGENTS、维护skill、交接1.15和UPARS1.1.0适用；基线d5e1c55，分支codex/audit-release-20261006-api。阶段最近五小时余84%/周67%，无门禁，不重置/唤醒/关机。
- 已实现候选：safety.py共享300秒协作时限（备份回调/查询/分块hash）、唯一成功/失败回执、diskWarning非零退出及不开始新备份、manifest路径身份限制、真实隔离恢复。新增systemd只读源/仅副本可写/禁网络/并发flock/360秒硬超时及每日备份/15分钟健康timer模板；未启用。18项Windows合成测试通过，10契约测试/lint通过；文档明确逐库而非跨库原子、不自动清理、无站外告警。
- Linux首次隔离验证失败，尚未算通过：home-host已SSH确认Python3.10.12/systemd249；候选包SHA FDF20CEF876A660CFDADF1DAB14D274AEC326CF5FEEF457D060B15C6845F51D2，root私有解压目录/var/tmp/easyproject-ops-candidate-20261026；tar时间偏差、Windows归档模式导致仅候选unit world-writable警告，须修正为0644再复验。系统自带snapd的RestartMode警告不属于本项目，不修改系统snapd。首个success隔离临时unit启动失败，正在检查日志/命名空间（PrivateTmp可能隐藏/var/tmp测试根），不得关掉保护来制造通过。
- 准确下一步：证明隔离失败原因并修测试位置/诊断，复验Linux的只读WAL源、真正恢复、源缺失拒绝、锁冲突与硬超时；补CI与文档/数据安全检查后再考虑受保护部署运维作业，不能把源码模板当已启用。然后继续限流/存储预算与可见告警，完成第一阶段再做版本检查、官网截图/下载、冲突可见性、发布矩阵、浮窗/MCP体验与贯穿es-ES。
- 全部未提交（本节点）：.github/workflows/server.yml、server/ops/{safety.py,test_safety.py,README.md,verify_linux_safety.py}、server/deploy/{easyproject-safety@.service,easyproject-backup.timer,easyproject-health.timer}、本检查点（随后文档以Git为准）。父子交付已独立提交，不把运维候选混入已交付范围。Wolai只同步“候选/18本地/ Linux进行中”，本阶段新代码尚未Git提交/推送。
- 设备/数据：本机Colin与home-host SSH已确认，无其它设备连接；测试只写E盘及服务器新私有合成目录/临时单元，不读取生产账号业务正文、不修改/恢复生产库、不启用定时器，不影响主服务。失败测试保留隔离现场，旧一次性关机授权失效。

2026-10-23新增状态设计讨论（未授权直接迁移）：用户发现MCP写入“持续维护/等待决策/受阻”等任意状态，列表显示但看板遗漏。已核对Task.status为String、服务只精确Done触发100%，TaskBoard固定Pending/InProgress/Done且精确过滤；Todo旧别名也未入Pending列。建议稳定三大生命周期+受控项目自定义状态（独立ID/分类/排序/颜色/归档），MCP先发现合法状态再引用ID，不允许任意文本隐式建状态；现有未知值先保留并显示“未分类”，不擅自猜分类/改真实任务。受阻宜独立阻塞标记，持续维护可能是标签/任务类型，由用户决定；完整自定义状态是跨数据库/API/MCP/统计/看板/国际化的独立需求，待确认方案后实施。

第一阶段里程碑：新增server/ops/safety.py与test_safety.py，本地6测试通过，覆盖两库在线备份/实际隔离恢复内容核验/损坏拒绝/穿越拒绝/缺源不建空库/输出路径重叠/磁盘报告。显式声明仅per-database online一致性，不冒称跨库原子；工具不覆盖在线数据库、不输出账号正文。PATH无python，读取已有应用内置Python执行，TEMP/TMP与测试临时目录E盘、禁写pycache；未安装工具。当前尚未部署、未设定时器/告警/配额，未改限流，不称公网稳定性已完成。下一步增加运行时限/失败回执、运维文档与CI门禁，并在隔离Linux验证权限/计时任务，再安全部署；备份保留/容量策略不能自动删除现有数据。当前未提交本文、handoff README与server/ops两文件，无其它产品代码；Git/Wolai待首阶段保存，服务器/本机程序/真实库未动。

2026-10-23用户授权逐项推进后续六项，并新增官网历史截图更新与西班牙语。

- 顺序：1 公网安全/稳定性（限流、配额、告警、定时备份和恢复演练）；2 桌面版本检查；3 官网下载简化及当前版本隔离演示截图；4 本地/在线工作区及冲突可见性；5 补正式发布矩阵；6 浮窗/MCP文档体验。国际化检查作为跨阶段基础，扩展es-ES，覆盖官网、桌面/网页入口、PrimeVue控件、日期数字、词条键完整性，不用英文展开假称西语完成。
- 基线603e161126820920ca5c51fc5971ad5bbca98f91，codex/audit-release-20261006-api，开工干净。WACAS未定义；实际AGENTS/交接1.12/UPARS1.1.0。五小时余99%、周余93%；重要里程碑复查。
- 已确认：现i18n集中zh-CN/en-US，语言保存及html lang已有；官网中英toggle写死，其他日期/控件语言与完整键尚待审查。官网project-board.png确为旧合成截图。新图仅从当前隔离demo生成，不采集真实项目/账号。
- 安全现状：HTTP有socket-IP登录30/15分钟、注册10/小时、重置10/15分钟，Funnel下共享反代限额，拒绝不可信X-Forwarded-For；密码哈希2并发/工作8并发，正文2MiB，1000账号上限与Token数量上限已存在。不能称完全没做限流。仍需完善共享限流策略、磁盘预算、告警与可恢复备份，保持精确Origin/CSRF/revision/权限。
- 下一步：先补本地可测试的运维安全备份/恢复验证与健康报告，不在生产做注册/CRUD或恢复覆盖；再按阶段实现与验证。生产部署需新受限副本，不能把单库在线备份说成跨库事务快照，不自动删用户数据/备份。
- 当前未提交：本文（以及随后明确列出的阶段文件，以Git核对）。Git/Wolai/交接待首个里程碑；API若变化必须同步Apifox。服务器/桌面/MCP/真实库本轮未动，未重新确认设备连接；最近一次连接证据仍上一安装/官网下载任务。
- 发布边界：现0.1.2-beta.1桌面已安全覆盖并启动，官网新下载已上线；正式生产仍未通过，不自动付费签名/域名、不扩大SSH/数据库暴露、不继承此前临时CI写权限授权。
