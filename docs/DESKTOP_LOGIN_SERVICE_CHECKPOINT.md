# 桌面默认登录与独立服务账户检查点

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
