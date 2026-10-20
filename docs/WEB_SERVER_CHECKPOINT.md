# EasyProject 网页版与多端工作区检查点

## 2026-10-21 最终部署阶段（覆盖下方历史“未部署”）

### 收尾结论

关机执行补记（2026-10-21，仅本对话）：已再次核对远端hostname=home-host及宿主hostname=Colin；服务器已接受sudo shutdown -h now，SSH被远端关闭。不能把SSH断开直接当作物理断电证明。两个独立烟测窗口已正常关闭，进程退出。Colin将在本闭环同步后通过一次性、短延时、无强制关闭的本地请求关机；自身物理关机无法由执行中的助手自证。本次关机授权视为已用于此次收尾，未来任务禁止重放；若系统因未保存应用阻止关机，不自动强杀或日后重试。以下历史“尚未执行”均已被本补记覆盖，不能据其重新执行home-host关机。启动后的服务自启仍需用户下次开机确认。闭环文档源70e79e236f21689f591b978411cc64a65de94f07，业务/前端及安装包源保持1e0e443不变。

- 私有内测功能验收通过；正式公网发布条件仍未通过。本次不是全库新UPARS审计，不改变历史限定例外。新增Windows候选未覆盖用户原安装，独立MCP未替换；用户需自行首次登录改密，不提供明文初始密码到聊天。
- 当前服务前端/交付源1e0e4434cb7286169309992d234756e0389a9618，Linux运行源仍63e70d1；Git常规push连接重置后安全传输精确同树335442ae3c86d161b92ad781aa97b94224767b79/同提交SHA、非强制成功。最新49文件包SHA c348424030a329d47ab022cf19a7d51c8b85faef400b3104dba01268b13d8d1a，远端tar摘要及逐文件验证通过；current已原子切换releases/1e0e4434cb72，stop/start后账号行摘要一致、完整性ok。一次核验误写users表/一次错误把全部懒加载index块当HTML入口导致检查失败，均未修改数据；改实际account表/HTML真实script入口核对后通过，不冒充首次全通过。
- 升级后正常TLS健康/HTML200、HTML入口与交付manifest匹配、nonce CSP通过；账号1/会话0/工作区0。systemd active/enabled、linger=yes、仅127.0.0.1:8080复核。无需再次bootstrap，也没有重置初始密码。
- 最终Windows NSIS6272953字节，SHA E1C6ADF933BA103748E2E7F3AC3E39444FE71389FAD882E876EF5C2BC8971EF0；exe SHA4E89766A3CD022F0733E510B532C11772F4384E38D1D6DB11FAA26808385AAFE。两者源码1e0e443（文档闭环提交不改变二进制身份）。隔离E盘desktop-smoke-1e0e443从本轮空业务fixture启动，默认免登录、云图标、深色PrimeVue连接弹窗真实CSP观察通过；其WebView主进程实参含--no-proxy-server，profile在E盘，不改变全局代理。原生一次元素几何不可用后重新绑定/截图坐标操作恢复；未自动化输入真实登录密码，不声称真实多设备/原生账号全链路人工验收。
- 最终门禁：230前端单测/46文件、HTTP8/8、桌面Rust47+真实stdio1、ESLint/类型/fmt/严格Clippy/NSIS/发布元数据/UPARS1.1.0/diff通过。生产界面两次8并发分别Gantt日期/存储确认失败，1工作进程且retries=0全量63通过+8专用Web明确跳过（专用8另跑已通过）。没有修改这两个既有用例或删除检查；高并发测试稳定性保留为后续风险，不能描述为所有运行零失败。原大资源警告保留。
- Wolai主状态v72、交接首部v9、API-03/DOMAIN-01增补v5读回均匹配1e0e443/手册1.6/9HTTP。私有Apifox25目录/55原生+9HTTP及26参考的先前读回有效；本轮只UI/进程代理/部署资料，无契约改变。交接README/CURRENT_STATE/ARCHITECTURE/CHECKPOINT及规则已复核，规则仍79条，未机械重写无影响内容。
- 最新额度五小时25%、周73%；没有重置/唤醒。剩余：物理重启自启、真实多设备使用、跨时区完整模型、Mac/MSI/签名、公网部署运维及10-22桌面限定例外复查，均不能以本次私有部署代替。准确下一步：关闭本次两个隔离测试窗口、保存本闭环文档并同步Git；按一次性授权核对身份关home-host后Colin，记录实际请求结果，不跨任务继承。当前未提交仅本检查点和handoff/CHECKPOINT闭环说明，运行源不再改；关机状态此刻仍未执行，最后状态以下方日期化补记为准。

- 目标/范围不变：网页登录、同账号多端服务端工作区、每账号隔离；桌面默认本地免登录，不上传真实库，不公开公网。WACAS未定义/待确认，适用UPARS1.1.0/AGENTS/PrimeVue/CSP/非C盘/额度与持续交接规范。分支codex/audit-release-20261006-api，开工eada26f，当前已推送a32eaffc8ddcfb38cdff1c6223168f0ef8981b88。
- 已部署home-host：Linux程序源63e70d1cd64a41ec838c307e210d241ade91b30c、CI39449520194两job成功、SHA1775bb4921f45c7639461b66593bb70125f09466eeb32608f196cf8043ab5a85；前端/交付a32eaff，49文件包SHA c8f5694c5afec742ab1a2d604cb0a3582bbeb1288aa31f03d677b0ec2ae89e5e。服务器独立releases/a32eaffc8ddc逐文件核验通过，current指向该版本，持久data独立700，账号库600/schema1/integrity ok；管理员ym_li随机初始密码只在data/initial-admin-password（600），未输出/上传。systemd用户服务active/enabled、linger=yes；仅127.0.0.1:8080，TZ只限进程Asia/Shanghai。
- 真实HTTPS https://home-host.tail2956dd.ts.net 验证：正常证书、health/HTML200、nonce及web标记、未登录401、初始管理员登录/会话200、Secure/HttpOnly/Strict cookie、首次改密业务403、退出200/撤销401、恶意Origin403、Tauri精确预检通过。测试后会话0、业务workspaces0；没有真实业务CRUD。已确认Windows Colin及Ubuntu home-host身份、SSH/Tailscale可达；开机自启配置不是物理重启验证。
- 宿主机默认代理请求曾超时/EOF，-NoProxy正常TLS200。新增仅应用WebView --no-proxy-server（主/浮同设置），不更改系统/其它应用代理或关闭证书；普通浏览器须私有域名直连。补375px登录卡片border-box与深浅窄屏测试。
- 本轮230单测/46文件、lint/typecheck、Rust fmt/严格Clippy、NSIS构建通过；真实HTTP8项最终通过（1280/960/375深浅6项+双会话/冲突/持久化+账号隔离/首次改密）。一次测试因hash导航/默认5秒短于15秒轮询失败，改实际导航并限定20秒断言后8/8通过，未关闭检查/重试掩盖。原生a32隔离E盘空业务库主窗紧凑图标及PrimeVue连接Dialog真实CSP浅色观察通过，无真实库改动。
- 当前未提交：e2e/web-server.spec.js、src/components/RemoteRoot.vue、src-tauri/src/lib.rs、src-tauri/src/floating_window.rs、server/README.md、docs/handoff/{README,CURRENT_STATE,ARCHITECTURE,CHECKPOINT}.md、本检查点。准确下一步：提交源补丁、最新dist与同一已验Linux程序打包升级（不重复bootstrap），复验服务重启/数据保留与最终桌面参数；Git/Wolai/交接闭环后按一次性授权关机。Apifox9HTTP/55原生接口及25目录已逐条读回，无契约变化无需重传；Wolai本阶段待同步。额度最新五小时34%、周74%，无重置/唤醒。一次性关机尚未执行，不能被后续任务继承。正式公网发布仍未通过；物理重启、Mac/MSI/真实多设备登录、跨时区完整模型及原桌面限定例外仍按各自边界记录。

## 2026-10-20 开工

### 第二阶段：真实HTTP验证与交付准备

- 第三批运行39449520194精确绑定63e70d1cd64a41ec838c307e210d241ade91b30c，server/security两job均成功；29领域+8鉴权/审计专项、严格Clippy、RustSec无桌面例外通过。常规push超时后既有校验传输同树3b45b945096ccec1bc48b9d0e4d64dff6299aecd/同提交SHA、非强制同步成功，无TLS绕过。下载artifact12276259894独立匹配官方ZIP SHA256 560c23a93b67e4a8697cb18c0f0eee7db82a15da41c40e3ab1db97d52c8e9ef4，Linux ELF x64 9854072字节、SHA256 1775bb4921f45c7639461b66593bb70125f09466eeb32608f196cf8043ab5a85。新download/package/verify脚本分别绑定工作流成功/源码/官方摘要/唯一条目/架构/文件清单，不能拿旧735二进制部署。
- 原生工具已恢复可用；独立E盘desktop-smoke-63e70d1/app（PID41588，测试后已请求正常关闭）从本轮隔离空业务库启动，免登录仪表盘与PrimeVue连接弹窗真实CSP外观已观察。没有安装覆盖或读写真实用户库。原生发现远端入口文字被挤成多行，已改带tooltip/可访问名称的固定紧凑云图标并补1280/960深浅4项桌面样式模拟回归；最终图标补丁仍需重建新桌面包及原生复验。旧63 NSIS 6272581字节/SHA9E38DC6F4970F3CA0CA87AB568F545643B23A97E608AF285E89D440B97222495和exeC5660EE4088C0923A462D1EC36643587077CA0C2AC6336249907F73825122EF7仅阶段产物，不作为最终桌面交付。
- 当前后续仅UI/交付辅助与用户服务TZ配置变化，Linux运行代码仍63e70d1。最终包需分别记录serverSource和delivery/frontendSource。服务TZ限定Asia/Shanghai进程，不改系统时区。下一步提交辅助/图标修正，打包最新dist+已核验63 Linux程序；SCP独立版本目录、逐文件验收后启用用户systemd和随机应用管理员，再实际HTTPS复验。服务器尚无应用/管理员，最终关机尚未执行。最新额度五小时56%、周78%；Wolai仍待本阶段同步。

- 第二批1c73b094cf1a58f32d4feed902d4dd2dccd01f43已非强制推送，CI39447020699构建/安全运行中；账号创建/首次改密UI第6用例通过，完整真实HTTP6/6，普通生产E2E59通过+6明确跳过，桌面Rust47+真实stdio1及严格Clippy通过。部署前补账号schema-v1事务/未来版本拒绝、脱敏写入审计10MiB停写、8业务/2哈希并发限制和恢复后独立进程epoch保护，正在最终专项复验；这些补丁须再绑新Linux产物，不能用1c73/735旧二进制代替。服务器仍未部署/无应用管理员，最终一次性关机尚未执行。

- 首批实现735f7b3c5d4e2cf104cdc490522d3001c3f72961已非强制推送，Ubuntu22.04/Rust1.90运行39441302725的格式/严格Clippy/29共享+7鉴权测试/Release构建通过，Linux程序9816680字节、SHA256 A1DC32D7DE5ABE94FC014963AC26F76833B3DE26E859CFFEBA825E8225F07BA0。后续补丁（SIGTERM优雅退出、web UUID恢复点等）尚待新CI，不把旧程序当新源码部署。
- 新增本机真实HTTP隔离浏览器用例：5项通过，覆盖1280/960深浅、严格响应nonce、cookie登录退出、双浏览器同账号共享、409旧写拒绝及刷新/重载持久化。最初引导遮挡/暗色按钮文案与测试hash导航不重载导致失败，明确操作引导/真实刷新后复验；未关闭CSP、未强制点击或忽略失败。引导按钮改为真实PrimeVue；远端数据页隐藏本地目录设置/打开入口。账号创建/首次改密UI第6用例正在补验。
- 230前端单测46文件、lint/typecheck及生产构建通过；原59生产E2E通过，新增Web用例普通运行明确跳过、由隔离真实HTTP专用runner执行，不冒充旧mock验真实服务。Rust29+7/严格Clippy通过。服务端183锁依赖使用官方RustSec当前提交b19b2c83c2493961ccb12f9fc4699a00fb2c6c44的REST归档（SHA256 2A33F6CBD7C1A0C73A336F28EA0260AF434F6EA8B937659DC1A2350E97B7954C），加载1345公告，cargo-audit0.22.2 --no-fetch --deny yanked退出0、漏洞0/告警{}，无忽略。原Git/扫描器fetch连接失败，改官方HTTPS已确认提交快照，不冒称新鲜Git fetch；headless无GTK链，不套用旧桌面Linux例外。CI新增独立服务端安全门禁待新运行。
- Apifox已新增真实9 HTTP操作/8路径，根04=97929320，四模块97929349/350/351/355；逐条name/method/path/目录/正文/请求schema/响应与CSRF字段读回，本地web-apifox-manifest存ID/SHA。导入器按tags额外生成4同名子目录，9接口已移回既定模块；只清理本轮生成且已空的4子目录，最终25目录，无原条目删除。一次DELETE传输异常后读回确认原目录仍在才续接；getStructureInfo按这些folderId报不存在，未据错误当作清空证据，核对全局9 HTTP和逐条目标目录后完成。原55通用接口/26正文保留，只有总览更新以明确真实HTTP新增，25篇UNCHANGED；无令牌/真实数据上传。
- 服务器当前仅Tailscale Serve已配置，暂无应用/systemd/应用管理员。宿主机hostname=Colin、SSH hostname=home-host均已核对；一次性最终关机尚未执行。下一步：第二批提交触发新Linux构建/安全门禁，下载精确二进制；对核验manifest的bin/web/deploy包SCP到独立版本目录，bootstrap随机应用管理员、启用普通用户systemd/开机持续服务，真实HTTPS启动/登录保护验证；再做最终门禁、文档/Git/Wolai/交接闭环，按一次性授权关机后汇报。当前全部差异以git status为准（第二批含Web E2E/打包/HTTP规范与同步清单、原生存储UI隔离/引导/共享备份小改及对应文档）；Wolai本阶段待同步。额度五小时64%、周79%，不重置/唤醒。

- 用户再次确认：无登录本地使用必须保留。桌面启动默认仍为原本地模式，只有显式远端入口才需要登录；不因网络/会话失败静默切换数据源，不自动合并或上传。此为长期兼容硬约束。
- 本次对话一次性授权：最终汇报前（完成或额度暂停均适用），先保存/同步进度，再核对身份关闭home-host、随后关闭宿主机colin。仅执行一次，执行后永久失效；不是长期规则，不创建自动化/额度重置，不跨对话继承。执行状态目前：尚未执行，需在最终阶段记录实际结果。
- 开发里程碑：新增server独立Cargo工程（仅共享Rust领域模块，不带Tauri/GTK）、账号/会话/密码、每账号业务库、精确origin和写请求marker、限流/请求上限、带持久revision的跨端冲突拒绝与写前备份；新增PrimeVue登录/改密/账号创建与桌面显式远端入口，token仅内存。本地默认不登录/不联网，远端会话失效不静默回退。229前端单测46文件、lint/typecheck、生产构建和原59生产E2E通过；Rust29共享测试通过，7鉴权专项最初2个fixture缺少原生必填字段失败，已补合法请求，正在复验；3处MutexGuard显式解引用/账号列表借用和1处Clippy冗余闭包已整改，不忽略检查。
- 服务器：home-host x86_64 Ubuntu22.04 SSH确认，独立~/easyproject已建立、权限700；安装编译前置build-essential/pkg-config/ca-certificates，无系统升级。官方Rustup下载慢且120秒超时，没有执行未完整下载的二进制，未安装Rust；改用Ubuntu22.04 CI构建交付二进制，不在服务器保留编译依赖作为运行要求。用户已启用Tailscale Serve，实际私有HTTPS反代https://home-host.tail2956dd.ts.net -> 127.0.0.1:8080已启动，无Funnel。服务端尚未部署/管理员尚未创建。
- 当前未提交：本检查点、server/{Cargo.toml,Cargo.lock,.gitignore,README,src/*,tests/web.rs,deploy/*}、.github/workflows/server.yml、src/{main.js,App.vue,api/index.js,api/remote.js,components/RemoteRoot.vue,components/RemoteConnect.vue,i18n/locales/zh-CN.js,i18n/locales/en-US.js,__tests__/api/crudAction.test.js,__tests__/api/remote.test.js}、src-tauri/tauri.conf.json。准确下一步：服务端专项/严格Clippy复验、API与交接文档首批同步后提交触发Linux CI；下载核验二进制并带dist部署独立版本目录、bootstrap随机应用管理员、systemd用户服务与HTTPS实测；补真实HTTP浏览器多端/隔离/CSP测试和桌面本地兼容，再同步Git/Wolai/Apifox/交接。五小时90%、周83%，未重置/唤醒；当前仅本Windows和指定Ubuntu确认。最终关机指令尚未执行。

- 目标：新增真实网页版、账号登录、同账号多端访问统一服务端工作区，部署用户指定的Ubuntu服务器；保留桌面离线模式和已有数据。账号隔离，管理员负责账号管理；第一版不自动合并本地库、不做离线双向同步、不公开公网。
- 基线：eada26f，codex/audit-release-20261006-api，开工Git干净。WACAS未定义/待确认；适用UPARS1.1.0、PrimeVue/CSP、非C盘、额度与Git/Wolai/交接/Apifox同步规则。五小时剩余100%、周85%，无重置/定时唤醒。
- 已确认连接：通过Tailscale SSH登录home-host（Ubuntu22.04，x86架构尚待确认），指定普通管理员账户可用。认证信息仅交互输入，不落盘/提交/云文档。当前服务器没有docker/cargo/node可执行入口，磁盘约86GiB可用，监听SSH及Tailscale内部服务，未改配置。
- 架构检查：Vue API当前只走Tauri invoke；Rust services/DbState可独立复用，无需在服务器编译Linux桌面GTK链。拟新增headless Rust HTTP服务、单独账号库与每用户业务库；复用现有服务校验，避免直接SQL旁路。鉴权、会话、限流、CSRF/Origin、并发版本和隔离测试必须先行。
- 本轮尚无业务代码改动，未上传真实桌面数据、未创建服务/应用管理员。当前未提交仅本文件。准确下一步：完成服务器工具/HTTPS部署前置检查，编写受控设计与实现、隔离自动测试，再部署独立目录验证。Git/Wolai/交接/Apifox待阶段同步；已有桌面和独立MCP程序保持不变。
