# EasyProject 网页版与多端工作区检查点

## 2026-10-20 开工

### 第二阶段：真实HTTP验证与交付准备

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
