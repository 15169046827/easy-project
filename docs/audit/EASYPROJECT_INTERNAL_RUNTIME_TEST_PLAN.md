# 内部测试版实机验收计划

日期：2026-10-08。当前状态：用户授权清空旧测试数据后，原NSIS内部包已在当前账户安装并首次启动；界面交互测试尚未执行。下文专用账户方案为历史记录，已被当前授权替代。

## 测试对象与边界

- 源码：`3d62039c4761efa70c34a5b57a19557521da922d`。
- 内部版：`v0.1.0-internal.1`，Draft 406330701；包位于 `src-tauri/target/audit-tools/release-37715193321`，摘要见 `docs/RELEASING.md`。
- 当前采用用户明确授权的当前账户测试，原数据全部为可删除测试数据、无需备份；不是干净机器验收。原专用账户已删除。
- 不启用 Windows 系统功能、不重启、不购买证书、不公开草稿；新增工具和安装目录不得放在 C 盘。操作系统自身的账户数据路径不属于工具安装目录，但仍需单独确认隔离与授权。

## 准备检查结果

- 本机为 Windows 11 教育版，版本 10.0.26200；HypervisorPresent=false。
- WindowsSandbox.exe、常见 VirtualBox/VMware CLI 默认路径均不存在，未找到相应命令。vmcompute 服务存在但停止；这不是已具备可运行隔离环境的证据。
- 当前账户应用数据目录存在，含 102400 字节的 `project_manager.db`；只检查文件元数据，未读取数据库内容。
- `src-tauri/src/lib.rs` 启动直接使用 Tauri app_data_dir，初始化数据库并创建自动备份。当前没有独立测试数据目录入口；仅修改 LOCALAPPDATA 环境变量不能视为可靠隔离。
- 没有确认任何 Mac 或独立 Windows 测试设备；未确认当前程序安装位置。没有安装、启动、卸载、迁移或恢复操作。

## 获得隔离环境后的执行顺序

每项记录设备/系统、包名与 SHA256、步骤、预期、实际结果、日志或截图；失败不得以既有浏览器测试替代。

1. 确认环境可恢复且无真实数据，核对包摘要；记录测试账户与数据库路径。
2. 分别测试 NSIS 与 MSI 安装，安装目录选 E 盘；验证首次启动、标题栏、窗口缩放与外层滚动条、控制台窗口是否出现。
3. 创建测试项目与任务，编辑负责人、日期、进度；验证依赖约束、甘特拖动和缩放，并重启核对持久化。
4. 测试 JSON/XLSX 导出再导入；非法数据必须拒绝且原有测试数据保持不变。
5. 创建备份，修改测试数据后恢复，核对内容与数据库完整性；记录失败路径中的安全备份。
6. 使用历史包进行同版本替换/修复安装及回退，核对数据保留。所有现有包版本均为 0.1.0，不能把此项称为跨版本升级通过；真正版本升级留待不同版本及明确迁移矩阵。
7. 卸载后核对测试数据库与备份保留，再安装验证恢复使用；只清理明确归属本轮的测试数据。
8. 汇总 Windows 结果。Mac ARM/Intel、签名与公证仍独立未验证，正式发布结论继续保持未通过。

## 下一步所需资源

优先使用现有独立测试机或虚拟机。若只能使用本机，需用户明确批准创建隔离测试账户及必要的本机安装测试；不能由“开始任务”推定允许改动用户账户或开启虚拟化功能。实际界面验收也需可用的原生交互方式或用户协助，当前未确认自动化路径。

## 本机专用账户准备结果

用户已明确批准本机创建。通过 Windows 正常管理员确认运行 `scripts/create-isolated-test-account.ps1`，创建 `EasyProjectTest`；只读复核 Enabled=false、Users 成员=true、Administrators 成员=false，到期时间为2026-11-07。初始随机密码仅在创建进程内存中生成，未输出、未保存；账户未登录，用户配置文件与应用数据隔离尚待首次登录核验。

下一步由用户在管理员 PowerShell 中执行 `net user EasyProjectTest *`，交互设置密码，再执行 `Enable-LocalUser -Name EasyProjectTest`。不要将密码发送到聊天或写入项目文件。完成后使用“切换用户”登录该账户（无需注销原账户），再核对独立数据路径与 E 盘安装位置后继续测试。此账户不能替代干净虚拟机验收，操作系统、全局组件和机器级安装仍共享。

## 当前账户安装与首次启动结果

- 用户明确授权永久清除旧测试数据、不备份，删除EasyProjectTest账户。精确删除应用Roaming数据库/备份、Local WebView缓存及未跟踪的 `db/project_manager.db`；删除后逐项复核不存在，账户及其配置文件不存在。源码与安装包未删除；此前账户脚本不再作为下一步。
- 使用发布资产 `EasyProject_0.1.0_windows_x64-setup.exe`，SHA256再次匹配RELEASING记录。当前普通用户安装至 `E:/Project/Project/easy-project/src-tauri/target/audit-tools/runtime-current-user/app`，退出0，文件存在，ProductVersion/FileVersion为0.1.0，HKCU安装登记匹配E盘路径。没有执行MSI安装，未安装新WebView2（已有154.0.4258.62）。
- 实际启动E盘安装程序，PID48912，主窗口标题EasyProject，Responding=true，主窗口句柄非零；直接子进程为msedgewebview2。未完成可视化检查，不能据此认定没有闪现控制台或标题栏/滚动条正常。
- 原生启动生成全新 `project_manager.db` 与 `backups/easy-project-auto-20261008-173706-742.db`。二者独立只读SQLite检查均integrity_check=ok、foreign_key_check零错误，project/task/task_dependency/member/project_member/plan_baseline全部0行。
- 初次备份校验因手工输入文件名漏写 `easy-project` 的连字符失败；从目录实际返回路径纠正后两文件校验退出0，不是产品数据库损坏。Node24内置SQLite仍显示实验性API提示，不屏蔽；没有通过数据库直接写入假冒界面操作。
- 原生Computer Use的node_repl初始化连续两次失败：`windows sandbox failed: helper_unknown_error: setup refresh had errors`。未执行任何点击、输入或拖动，不改安全设置来绕过；已安装程序留在当前账户打开状态。
- 下一步需恢复原生交互工具或用户协助检查已打开窗口，然后依次验证项目/任务编辑、甘特交互、导入导出、备份恢复与同版本替换/卸载数据保留。上述项目、MSI、Mac、正式签名与干净设备验收仍未通过/未执行。
