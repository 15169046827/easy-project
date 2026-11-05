# Windows 安装依赖

默认 NSIS/MSI 使用 Tauri `offlineInstaller`，包含完整架构匹配的 Microsoft Evergreen WebView2 安装程序，不能以 `embedBootstrapper`（仍需联网）替代。构建机需要下载官方组件，终端首次安装不应依赖下载主机可达。不得用 `skip` 绕过运行库检测。

## 2026-11-05 检查范围与结果

- 固定源码084e962的 x64 `easy-project.exe`、`easyproject-mcp.exe` 已用 Microsoft dumpbin /dependents 检查：仅 Windows 系统/API-set/UCRT 导入，无 VCRUNTIME/MSVCP、sqlite3、OpenSSL、Node、Python 或 .NET 运行库导入。这不是跨架构或任意未来版本的保证，新包需再核验。
- UCRT 属于 Windows 10/11 系统组件，不将系统 DLL 私自复制进应用。Windows 7/8、裁剪系统不在此次验收结论内。
- rusqlite 启用 bundled，SQLite 无需外装；reqwest 使用 Rustls，不依赖单独 OpenSSL。
- Vue/PrimeVue/ExcelJS/节假日库/图标字体由 Vite 随应用分发。未配置外部 sidecar 或下载资源；Node、Rust、MSVC、NSIS/WiX 是构建工具，不要求终端用户安装。
- 本地离线入口不要求账号；远端登录、版本检查、订阅日历、在线下载等本来需要网络，不能宣传为全部离线功能。检查未把这些业务联网能力误当作安装依赖。
- 旧 NSIS 脚本包含 WebView2 下载器与离线分支，实际由编译定义选择；新包必须核对 `offlineInstaller` 定义及内嵌组件，不仅搜索脚本文本判定。

## 安装与维护边界

WebView2 Evergreen 是微软共享运行库，可能写系统盘并独立更新；应用选F盘不等于运行库也在F盘。不要关闭系统安全保护、删除系统运行库或为验收卸载其它应用需要的组件。固定版运行库不作为默认方案，以免承担独立浏览器安全补丁分发。

Steam Deck 原在线包在缺运行库时连接下载源失败，未能首次安装。离线包应在同机尚未补装运行库时验收。RDP需要网络，不能通过远程断网伪造完整离线测试；先核对安装内容/脚本，再单独安排不切断控制链的离线验证。新候选完成前，不把本页当作实机已通过。

参考：[Tauri 安装方式](https://v2.tauri.app/distribute/windows-installer/#webview2-installation-options)、[微软 UCRT](https://learn.microsoft.com/en-us/cpp/windows/universal-crt-deployment)、[微软运行库](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)。
