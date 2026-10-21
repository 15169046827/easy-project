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

- 232前端单测/46文件、lint/typecheck、Rust fmt/严格Clippy、NSIS构建通过。生产界面单进程/零重试67通过+8专用Web跳过，其中4新增深浅/尺寸/键盘/nonce/免登录本地/启动ID回归均通过；真实HTTP专用8/8通过，未弱化检查。初次新增类型声明时序问题已复验消除。NSIS SHA444DDDEF6B0DBE729F9A80165A2875368F83AD0B3E82AF9F53E5C62B60B9DBFA，exe SHA6F73AB43DAE3AA9DF8CF5FFFE07D6179CB63D2B9C8EC340D26019300CED13030，未覆盖原安装。
- 新增/修改文档：AGENTS、README、CHANGELOG、PROJECT_PLAN、API总览/生成引用、handoff五文件及RULES1.7/仍79条、server/README；旧检查点保留历史身份，入口指向本文件。运行服务器代码与HTTP/IPC/MCP契约不变，复用已验63e70d1 Linux产物；生成器的无关JSON缩进已按项目格式恢复，web-openapi无实质差异。API总览Apifox同步进行中。
- 服务器新布局/单位尚不存在已确认，旧服务仍active、账户1/must_change/会话0/工作区0。计划仅新建独立空账号库，新管理员密码随机生成、root600文件保存；旧/home/ym_li/easyproject全部原件不删不覆盖。额度五小时89%、周71%；设备连接均确认。本次未提交精确清单见git status（25项源/文档/测试/部署脚本），下一步提交绑定并校验新交付包后实施受限账户迁移，原生隔离UI复验进行中，不关机。
