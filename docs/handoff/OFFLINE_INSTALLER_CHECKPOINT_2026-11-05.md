# Windows 离线安装候选

- 目标：默认 Windows 安装包内置完整 WebView2 离线安装程序，并排查其它首次安装外部运行依赖。不安装运行库到宿主机，不改真实数据/服务器/权限，不公开发布。
- WACAS 未定义；项目规则1.25 / UPARS1.1.0。基线 `codex/audit-release-20261006-api` / `446a138497fe6273c343582b54ec5c689aacba2f`。开始时仅 Windows 候选检查点有上轮未提交记录，保留。
- 用户批准离线候选及安装依赖排查；Deck 上旧安装器已因 WebView2 下载主机连接失败中止，未单独补装，仍适合首次安装依赖验证。RDP 最后确认连通，控制已释放；未连接 home-host。
- 本轮额度开始五小时余75%、周余43%。已改默认 `offlineInstaller`、发布门禁及配置回归测试。未提交：以上3文件、本检查点和原 Windows 候选检查点。
- 下一步：运行回归，检查实际 PE 导入及 NSIS 脚本，构建内置运行库的隔离包；核验微软签名/源和包内容，再在获当场确认后去 Deck 继续。未验证不能称安装通过。
- Git/Wolai/交接新阶段待同步；无 API/MCP 契约变化，不重传 Apifox。正式安装、远端后端及独立MCP不变。

## 已验证与当前阻断

- 源候选 `cb1d0d6` 已固定归档到 E 盘 `src-tauri/target/audit-tools/offline-installer-cb1d0d6-20261105`。严格离线 npm 安装、lint/release gate、Vite 生产构建及锁定 Cargo release 编译通过；原有两个大资源警告保留。
- 新测试最初使用 import.meta URL 导致 Vitest 虚拟路径非file协议失败；改为 Node 环境/项目根解析后全量 **404/73** 通过，未放宽断言或删测试。此修正只影响测试，产品配置/代码与归档一致。候选复用复制的旧 target 里仍有旧 NSIS 文件，打包完成前绝不能将这些旧产物当作离线新包。
- Microsoft dumpbin 检查旧固定候选两原生程序：Windows 系统/API-set/UCRT，无独立 VCRUNTIME/MSVCP/sqlite/OpenSSL/Node/Python/.NET DLL 导入；SQLite bundled、Rustls、前端本地资源已核对。细节见 `docs/WINDOWS_INSTALL_DEPENDENCIES.md`，后续新产物仍需复查。MSI 的 Windows Installer 与完整 Windows 系统组件不作为可随意复制的依赖。
- 离线打包下载官方 WebView2 时 global timeout；仅进程使用当前系统已有127.0.0.1:7890代理重试仍10054。标准curl/PowerShell直连与代理、官方更新目录等已检查；未关闭TLS、未改代理或系统证书、未用第三方镜像。官方更新目录可读但未提供本次所需运行库，不以 Edge 浏览器替代。
- 当前缺 **微软签名有效的 x64 Evergreen Standalone Installer 完整文件**。脚本 `scripts/verify-windows-runtime.ps1`已新增，待拿到真实payload后执行正例；不能声称新包已生成或验收过。准确下一步：在可访问官方源的网络取得完整安装程序至E盘，核验微软签名/摘要/架构，再按实际Tauri缓存路径打包。不要修改默认模式为skip或小下载器。
- Steam Deck 保持未补装运行库状态，本阶段没有桌面输入；上轮失败窗口/RDP状态未重新观察。未连接home-host。当前未提交包括测试修正、发布说明格式、依赖清单/脚本、本检查点/交接入口更新；原 cb1d0d6 尚未推送，随后同步收件。正式产品、数据、后端、MCP不变。
