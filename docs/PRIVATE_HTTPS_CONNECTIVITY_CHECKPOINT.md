# 私有HTTPS浏览器访问修复检查点

## 2026-10-21 完成状态

- 目标：用户允许检查Clash并仅为EasyProject私有域名添加直连，恢复浏览器访问；不切换全局代理模式、不修改系统DNS/证书/Tailscale或其它项目。WACAS未定义/待确认，适用UPARS1.1.0、AGENTS、数据保护与持续交接规则。基线c6a479967727a381aac9b0bed42d07273ae77522，分支codex/audit-release-20261006-api，开工Git干净。
- 诊断证据：Colin及home-host Tailscale在线，Windows将域名解析为100.65.59.38；正常TLS无代理访问网页/主脚本/健康均200。系统代理实际为本机Clash 127.0.0.1:7890，代理路径SSL失败；Clash内置DNS对此私有域名返回Status=3/NXDOMAIN、无A记录。不是服务器停机或证书过期，未关闭证书验证。
- 唯一外部配置修改：现有Clash配置C:/Users/Canace/.config/clash/profiles/1770951119417.yml新增两行：hosts中home-host.tail2956dd.ts.net→100.65.59.38，以及规则首项DOMAIN,home-host.tail2956dd.ts.net,DIRECT。移除这两行后文本（仅归一CRLF）与原配置完全相同；CFW settings/root core config、系统代理/DNS均未修改。此C盘第三方原有配置的用户授权编辑不等于允许EasyProject数据/工具转存C盘。
- 安全备份：E盘src-tauri/target/audit-tools/clash-direct-20261021，原profile、运行设置/规则/节点选择及摘要；目录ACL仅当前用户和SYSTEM。备份含代理凭据，属于ignored本地证据，禁止复制进Git/Wolai或向外发送。控制器令牌仅内存使用，不打印/提交；使用本机已配置loopback控制接口，不更改controller、认证或LAN可达性。
- 应用与验证：受控API重新加载，只读读回3853规则=新域名首项+原3852逐项完全相同；mode=rule、其余general设置完全相同、全部手动Selector选择相同。URLTest在正常重载/测速中自动选择发生变化，不修改其配置、不强制改自动节点。普通系统代理路径（没有-NoProxy/没有TLS绕过）网页200/marker正确、健康200/status ok；Clash未退出重启，服务器/桌面/数据库/权限无新改动。
- 失败与纠正：第一次命令行补丁格式被拒绝未写；第一次原配置插入缩进不符，语义预检拒绝且未加载到核心，按原4空格更正后通过。预检数量起初错误比较新增后的文件与旧运行规则，修正为阶段感知后继续；初次直连规则已生效但因Clash DNS仍NXDOMAIN导致TLS失败，追加同一域名hosts映射后完整通过。手动/自动节点断言已分开，未掩盖URLTest自动变化。未打印原代理配置正文或凭据。
- 持久性边界：两行写入当前选中配置，正常重新读取该文件有效；切换配置或重新下载订阅可能覆盖本地修改。此次未擅自建立全局Mixin/解析器、修改订阅链接或定时任务；届时需保留/重新应用同一域名的两项配置。若Tailscale地址变化，先核对真实解析并更新这条精确映射，不扩展为整个网段/通配直连。
- 设备：仅当前Windows Colin与指定home-host确认；未声称其它终端/真实浏览器人工已验。本次未使用UI、不关机，无额度重置或自动唤醒。最新额度五小时52%、周65%。
- 同步：本轮产品源码/HTTP/MCP/IPC/Apifox契约不变，旧门禁只作对应源证据，不冒称重新跑全量构建。当前未提交为本文件、server/README.md及handoff/CURRENT_STATE.md/CHECKPOINT.md；下一步Git/Wolai/交接同步读回后等待用户刷新网页试用，不自行扩大代理改动。
