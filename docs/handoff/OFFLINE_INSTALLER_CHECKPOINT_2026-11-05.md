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

## GitHub 官方源代下载阶段

- 上段整改已以 `bd40f148` Git同SHA同步，Wolai两处已读回；上段“尚未推送/未提交”为过程记录。本阶段用户批准使用GitHub构建机获取官方文件，不公开Release、不运行下载程序。
- 基线 `bd40f1484fb46e4c2f1d716077de313ebe12a38d` / 原分支；开始工作区干净。额度五小时余40%、周余37%；WACAS/标准不变。新增只读权限的短期Windows工作流，仅官方微软重定向+完整文件下载+微软签名/大小/摘要/来源收件，产物7天保留，不用任何凭据Secret、不执行payload。
- 当前新增工作流与本检查点未提交；下一步提交到既有分支触发一次构建，取回至E盘并独立核验，再续离线打包。Deck/RDP/home-host本阶段未连接或操作；API/MCP/Apifox无变化。Git/Wolai新阶段待同步。

### 官方运行库已取得

- 工作流源 `eca3d5249b6e5c40097abb04534ba8aaf11593d4` 已Git同SHA同步，自动任务 **41975791242** 成功。人工显式dispatch时未及时发现自动任务已完成，产生第二任务41975835980；发现后尝试取消但它也已完成，不再重复。两者均仅下载/验签，未运行payload或发Release。
- 首次产物13391787070，ZIP摘要 `0c6fdf6fea26af849d00e55329a7d1d931d024195e2c093bbc90ded0b01c20f5`，7天留存。GitHub产物大文件取回无进展，已终止本任务自己的下载进程；未把不完整下载当作成功。
- 首次任务解析出的微软官方CDN直链可在宿主机直接访问，已下载完整文件到 `src-tauri/target/audit-tools/MicrosoftEdgeWebView2RuntimeInstallerX64-62863F0F.exe`，215017168字节；SHA256 **62863F0F0611A16CCF124B4F15650C3B66624504EBA74D7CDE1E2AE5D951249B**。本机Microsoft Authenticode Valid，摘要与首次GitHub收件一致，无第三方镜像、无TLS豁免。
- 官方精确源：`https://msedge.sf.dl.delivery.mp.microsoft.com/filestreamingservice/files/d5cc3c1c-bb59-4158-aedc-db0035e44466/MicrosoftEdgeWebView2RuntimeInstallerX64.exe`；固定来源来自任务日志，不手造URL或以Edge浏览器替代运行库。
- 仓库 `verify-windows-runtime.ps1` 对实际payload及新离线候选编译出的两exe已正例通过，依旧仅系统/API-set/UCRT导入，无列出的额外运行库。后续尝试读取失败候选NSIS脚本时路径不存在，整条诊断命令退出1；不影响前面明确输出的签名/依赖验证，但不能声称该命令或新包整体成功。
- 下一步：保持严格校验，解决Tauri打包即使缓存已有仍先HEAD短链的行为（官方util实现已核对）；优先在GitHub正常环境做标准离线候选构建，不采用伪造HEAD/放宽TLS。**当前只有可信运行库和编译结果，尚无新离线NSIS，不进行Deck安装。** 首次运行库下载阻断已解除，标准打包仍待续。

### 标准云端离线候选构建

- 续接基线 `9b1f4f0` / 原分支，工作区干净；五小时余30%、周余36%。新增同一工作流的标准构建job：固定Node24.15、锁定Cargo、lint/404测试/发布门禁，标准Tauri构建NSIS、实际离线编译定义/微软payload签名/原生DLL核验，只有7天测试artifact，无Release或部署权限。
- 本阶段未提交仅工作流与本检查点，Git/Wolai收尾待；设备未操作。下一步：提交并等自动任务（不要重复dispatch），下载完整包到E盘核验摘要后才请求Deck运行当场确认。未改API/MCP/数据库。

- 标准构建已同SHA上传 `b30bab61c12be1d57f5f5e7b897da537869865ee`，自动运行 **41977755619**；fetch-runtime成功，build-offline-candidate在进行中。Git原传输10054后用已有非强制API备用收件核验。GitHub提示upload-artifact@v4动作Node20已废弃/强制用Node24，保留为构建基础设施警告；产品工具链已明确Node24.15，不将动作警告误写产品用Node20。

### 云端完整离线包已构建

- 运行41977755619两个job均成功：404测试、lint/release门禁、标准锁定Tauri构建；NSIS实际offlineInstaller定义、微软payload签名、两exe系统/API-set/UCRT导入均通过。内嵌运行库仍为62863F0F…/215017168字节。没有运行任何安装器。
- 完整包224638346字节，SHA256 **0523063373190B9FE64CB29024A0363E81BED8235C389F610662BD7E9D7F6F8E**，未签名。GitHub测试artifact **13392568422**，ZIP224688523字节/摘要 **f23becd3d6230bb7c0b34830d29d2d3be83d5eb8f27c6a80f9e7fa912046e42c**，7天保留。
- 取回E盘 `src-tauri/target/audit-tools/offline-artifact-41977755619`：单连接慢已主动终止，改官方SAS精确文件16个Range分段，逐段检查206与长度、合并后必须核验完整ZIP和包摘要才可使用。不输出或持久化SAS/token，不关闭TLS。当前分段下载进行中，已有5段核验；旧partial ZIP不是可用安装包。
- 最近额度五小时余20%、周余34%；本阶段没有桌面控制/设备操作。下一步等待分段完成和摘要核验，再同步与传到Deck；新安装仍需当场确认，不把云端静态通过当实机安装通过。当前仅本检查点未提交。

### 本机完整包摘要核验完成

- 16段全部206/长度校验通过，合并ZIP摘要匹配GitHub官方artifact，解压成功；本机最终安装包摘要再次等于 **0523063373190B9FE64CB29024A0363E81BED8235C389F610662BD7E9D7F6F8E**。路径 `src-tauri/target/audit-tools/offline-artifact-41977755619/package/EasyProject_0.1.2_x64-setup.exe`，provenance.json同目录，224638346字节。没有修改/重封装此安装包，旧partial与分段保留供追溯但不可运行。
- 本次云端构建及本机静态产物验收通过；Windows干净设备首次安装仍待。下一步将此精确包经已有RDP复制到Deck并请求当场运行确认，目标 `F:\EasyProject`，缺失WebView2时使用包内微软共享运行库（可能系统盘）。不偷偷恢复小联网包，不关闭安全设置，不中断RDP来伪造断网实测。无需重跑已通过门禁或重新下载payload。
- 无API/MCP/Apifox变更，无宿主机覆盖、服务器部署或公开Release；本阶段未操作桌面，最后RDP/失败窗口状态仍为历史，不声称今日已重连。代码与工作流已Git同步；本轮结果/交接收件随后提交并同步Wolai。
