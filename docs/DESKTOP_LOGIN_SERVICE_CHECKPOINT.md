# 桌面默认登录与独立服务账户检查点

## 最终完成状态（2026-10-21，覆盖下方阶段记录）

- 目标已实现：新启动默认登录，普通用户仅输入用户名/密码，应用内置受控服务地址；本地入口和本地转登录均无地址配置。同次启动显式本地选择可重载保持，下一次启动UUID不同返回登录；浮窗仍本地。网络失败不自动切本地，未上传/合并真实桌面库。
- 最终产品/前端/部署源4b4128769b6a2d3653beae31210643fb4801195b，已同树38cca9ce79d21fd3b84cc57af88be204d0d9ce48/同SHA非强制同步（正常push重置后使用既有核验传输，不关闭TLS）。基线13806ce、分支codex/audit-release-20261006-api；WACAS未定义，适用UPARS1.1.0/既定规则。手册1.7/79规则，地址透明补充不增加规则ID。
- 最终服务器current=/opt/easyproject/releases/4b4128769b6a，51文件包SHA e23e97e26068b8342e92b261efe10fdb227a428e5a1555f6178ba0ce7d3443a2，上传tar及新旧两侧逐文件核验通过；Linux程序沿用已验63e70d1/SHA1775bb4921f45c7639461b66593bb70125f09466eeb32608f196cf8043ab5a85。root切版本前后账号行摘要一致/完整性ok/会话0，正常TLS健康200。系统服务active/enabled，User/Group=easyproject，密码L/nologin/无sudo，仅127.0.0.1:8080；原用户服务disabled且原目录/初始库保留。未公开公网，未修改SSH密码或整机安全策略。
- 独立应用管理员easyproject_admin；随机初始密码仅/etc/easyproject/initial-admin-password(root600)，服务用户不能读；data700/accounts600属easyproject。初始登录/会话200、业务改密前403、退出200/撤销401，测试后会话0/业务库0；不复用Ubuntu身份，不在真实库做CRUD验收。bootstrap未来创建设置umask077，未重复运行或重置新密码。
- 最终门禁：233单测/46文件、ESLint/typecheck、67生产E2E（单工作进程、零重试，含4默认登录/离线选择/重载/重启/nonce深浅尺寸及4本地转登录无地址检查）+专用HTTP8/8、桌面Rust47+真实stdio1、fmt/严格Clippy、NSIS、发布元数据、UPARS1.1.0、diff通过；普通E2E的8HTTP明确跳过，由专用真实隔离服务另跑，未删除/放宽检查。旧大资源警告仍保留。
- 最终NSIS 6271425字节/SHA2FDBB3051680364C95CF0A5A4DCFA87DB400EACA9E6C330A67CD845378EF3C50，路径src-tauri/target/release/bundle/nsis/EasyProject_0.1.0_x64-setup.exe；exe SHAE20A6B34A0ECA6758D282494195D58B76B2062B914DC41CBC4B07DC2FDAAA9FD。未覆盖原安装或独立MCP。原生E盘desktop-login-service-final独立空业务库启动观察：真实CSP/PrimeVue、窗口栏、只有用户名密码/本地入口、没有地址框；未自动化输入真实密码。两隔离窗口已请求正常关闭并确认进程退出。
- 同步：API总览9567481已读回新SHA，其余25参考UNCHANGED、55原生+9HTTP契约无变；apifox-manifest已随4b41287提交。Git/handoff本阶段完成，Wolai最终同步正在收尾，读回版本另记。本次尚未提交仅handoff/{README,CURRENT_STATE,ARCHITECTURE,CHECKPOINT}.md和本闭环检查点，无产品源码变化。
- 剩余/下一步：新系统unit开机enabled已配置，服务restart/start实际成功，但未重启整机验新unit；原生完整账号人工流程/真实多设备、签名/MSI/Mac及正式公网生产条件仍未通过，不冒称完成新全库审计。用户可安装新候选并首次改密后试用；只在新具体授权下执行覆盖安装/数据操作。当前额度五小时80%、周70%；仅Colin/home-host设备确认，无重置/唤醒/关机，旧一次性授权已失效。完成文档同步后等待用户下一步。

## 2026-10-21 开工

- 目标：桌面每次新启动默认登录，保留显式“不登录，本地使用”；建立独立受限Ubuntu服务账户easyproject、独立应用管理员easyproject_admin；系统级开机自启并提供启动/状态指令。用户最新选择覆盖此前“默认进入本地”，离线能力和禁止自动上传/混库不变。仅EasyProject/Tailscale内网，不公开，不修改SSH管理员密码，不复用操作系统凭据。
- 标准：WACAS未定义/待确认，适用UPARS1.1.0、AGENTS、PrimeVue/nonce/非C盘/持续交接/额度门禁。基线13806ceabc26bd7eb2bf008e9caa54c706a47991，分支codex/audit-release-20261006-api，开工Git干净；额度五小时96%、周72%。
- 已核对设备：Windows Colin与home-host SSH可达；home-host本次开机01:29:56 UTC，旧用户服务01:30:44自动active，说明已有用户级自启实际生效，但运行身份仍ym_li，没有easyproject系统用户。旧应用ym_li为独立账号，并非Ubuntu身份；must_change=true、账号1/会话0/业务工作区0、完整性ok。上次一次性关机授权已耗用，本任务不再关机。
- 已修改：src/api/remote.js按原生主窗默认登录/启动ID限定本地选择、浮窗维持本地；src-tauri/src/lib.rs注入新启动UUID；RemoteRoot登录支持地址、免登录入口及窗口栏；中英文文案、窗口类型和单测；e2e/desktop-login.spec.js新增四个严格nonce深浅/尺寸/键盘/本地重载/新启动返回登录专项，原本地入口布局测试显式选择本地；新增系统级unit及独立管理员bootstrap脚本。
- 当前全部未提交：src/api/remote.js、src-tauri/src/lib.rs、src/components/RemoteRoot.vue、src/i18n/locales/{zh-CN,en-US}.js、src/window.d.ts、src/__tests__/api/remote.test.js、e2e/ui-consistency.spec.js、e2e/desktop-login.spec.js、server/deploy/easyproject-system.service、server/deploy/bootstrap-system-admin.py、本检查点。准确列表后续以Git核对更新。
- 验证：初次类型检查早于window.d.ts补丁，新增Window属性未声明失败，声明已补待复验；格式化通过，生产构建进行中。旧测试与旧安装不是本轮通过证据。
- 下一步：完整门禁与原生登录/离线入口复验；保存独立账户/新管理员/新旧数据分离的安全部署材料，确认旧初始库仍无业务变化后保留原件，在新数据目录bootstrap新应用管理员；旧用户服务停止禁用，启用受限systemd系统服务。逐文件绑定版本、验证仅新身份监听和重启/数据权限，提供sudo systemctl start/status easyproject。Git/Wolai/交接同步，HTTP/MCP/IPC契约未变需复核不机械重传。当前尚未建立新服务器账户或改服务，文档同步待后续里程碑。

## 部署前里程碑

用户追加（2026-10-21）：服务地址对用户透明，只需用户名密码。已移除登录地址框与原本地连接Dialog；本地云图标直接进入登录，桌面只用内置受控origin，不读取旧localStorage地址，增加缓存污染回归。正在重建/复验最终候选，ceee55c为中间源，不能当作最终“无地址框”包。

## 独立身份迁移已完成（最终无地址框候选待复验收尾）

- 首批源ceee55c3ddeb6e339a16190de54a4faad56a6d54已正常非强制推送；51文件交付包SHA a9d329b1d06fbd743c84107ae59b159cd5b5a1008b8e8ce0dd0a2720a1f82edc，本机/远端tar及逐文件摘要一致。Linux运行代码仍已验63e70d1，无需将部署脚本变化伪称新业务二进制。解包有约两分钟文件时间差警告，摘要通过；未修改系统时钟。
- 服务器新系统账户easyproject(uid998)、仅easyproject组、密码锁定L、shell=/usr/sbin/nologin、无sudo。新版本/opt/easyproject/releases/ceee55c3ddeb由root管理，current链接；数据/var/lib/easyproject归服务账户700、accounts.db600；root初始密码文件/etc/easyproject/initial-admin-password600，已验证服务账户不能读取。bootstrap脚本新增umask077避免未来账号库权限宽松；本次库已显式校正600。
- 旧用户服务已停止且disabled；系统级/etc/systemd/system/easyproject.service通过systemd-analyze verify，active/running/enabled，实际User/Group=easyproject，ProtectHome=yes/ProtectSystem=strict/NoNewPrivileges=yes，仅127.0.0.1:8080。旧/home/ym_li/easyproject源/初始库/凭据全部保留，停服后二次确认仍只有ym_li初始账号/must_change、会话0/业务工作区0；未覆盖、删除或自动上传原桌面数据。
- 新应用管理员easyproject_admin已通过同一Rust bootstrap规则创建（与OS easyproject、SSH ym_li三者分开），独立新随机密码，不复用服务器密码。正常TLS登录/会话200、首次改密业务403、退出200/撤销401；验证后会话0/业务库0，没有真实业务CRUD。系统服务restart前后账号行摘要一致，健康200；已设置开机enabled，未为验收重启整机。旧用户服务本次开机自启证据不冒充新系统unit的物理重启验收。
- 启动指令（服务器）：sudo systemctl start easyproject；状态sudo systemctl status easyproject --no-pager；已配置sudo systemctl enable --now easyproject。新初始密码只在自己的SSH终端sudo cat /etc/easyproject/initial-admin-password查看；首次登录需改密，不写聊天/Git/Wolai。
- 最新无地址框版本233单测/46文件、lint/typecheck通过，NSIS重建/67生产E2E复验进行中。Apifox仅总览9567481已更新并读回SHA ad3f366aaae9337d4d98188a3a0a1e2fc88c543e6b0b580e7867d1d564209060，其余25参考UNCHANGED，55原生+9HTTP契约无变化。manifest待提交；Wolai/交接最终增补待同步。原生中间候选登录页已观察，最终无地址框需再观察。准确下一步：完成最终检查、提交绑定新前端包、对新系统服务版本切换（不再次bootstrap）并复验后同步文档；本任务不关机。

- 232前端单测/46文件、lint/typecheck、Rust fmt/严格Clippy、NSIS构建通过。生产界面单进程/零重试67通过+8专用Web跳过，其中4新增深浅/尺寸/键盘/nonce/免登录本地/启动ID回归均通过；真实HTTP专用8/8通过，未弱化检查。初次新增类型声明时序问题已复验消除。NSIS SHA444DDDEF6B0DBE729F9A80165A2875368F83AD0B3E82AF9F53E5C62B60B9DBFA，exe SHA6F73AB43DAE3AA9DF8CF5FFFE07D6179CB63D2B9C8EC340D26019300CED13030，未覆盖原安装。
- 新增/修改文档：AGENTS、README、CHANGELOG、PROJECT_PLAN、API总览/生成引用、handoff五文件及RULES1.7/仍79条、server/README；旧检查点保留历史身份，入口指向本文件。运行服务器代码与HTTP/IPC/MCP契约不变，复用已验63e70d1 Linux产物；生成器的无关JSON缩进已按项目格式恢复，web-openapi无实质差异。API总览Apifox同步进行中。
- 服务器新布局/单位尚不存在已确认，旧服务仍active、账户1/must_change/会话0/工作区0。计划仅新建独立空账号库，新管理员密码随机生成、root600文件保存；旧/home/ym_li/easyproject全部原件不删不覆盖。额度五小时89%、周71%；设备连接均确认。本次未提交精确清单见git status（25项源/文档/测试/部署脚本），下一步提交绑定并校验新交付包后实施受限账户迁移，原生隔离UI复验进行中，不关机。
