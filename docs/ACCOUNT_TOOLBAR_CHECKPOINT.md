# 用户头像工具栏调整检查点

2026-10-21进行中。目标：桌面/网页用户入口与主题、快捷键按钮同一工具栏，头像弹出菜单收纳用户设置/MCP/管理员账号管理/退出，不再在整个App上方占一行。保留冲突/错误提示和免登录本地入口，不修改鉴权/API/真实数据。

- 基线ebf6adaee54dac89c28e7350e28cabb5156a4947，分支codex/audit-release-20261006-api，开工干净。
- WACAS未定义/待确认；适用UPARS1.1.0、维护技能、交接1.8/79条、PrimeVue/nonce规则。
- 原因：RemoteRoot把remote-status放在整个App上方。桌面缺注册是原安装仍旧版，上轮新包未覆盖，并非桌面不支持注册。
- 额度：开工五小时剩余13%、周59%；低于10%不进新长阶段，任一窗口<=5%硬停，只保存必要检查点。
- 设备：home-host上轮2cbe3f1e6920/active/enabled，本轮未连接；Windows上次锁屏，未确认解锁，不原生输入；不继承关机授权。
- 下一步：最小组件调整及专项验证；额度允许才完整回归/构建部署。未覆盖现安装，不盲跑旧安装脚本。
- 同步：Git/Wolai/交接待里程碑；API不变，Apifox只复核不机械重传。

## 额度门禁暂停（2026-10-21）

最新五小时剩余7%（used93），周58%；触发低于10%不开始新长阶段，保存后暂停，不使用重置、不定时唤醒。未达到5%前也不得以剩余额度继续开展新阶段。

用户新增要求一并保留：

1. 用户信息与主题/快捷键同一行，头像菜单收纳用户设置/退出等。
2. 桌面没有注册：已确认原安装还是旧版，上轮注册包未覆盖。新版源码已有注册；不得误判为注册API缺失或重复开发注册。后续新候选需包含本轮UI与注册，覆盖前重新确认实际安装路径/包SHA/进程和全新安全副本，不盲跑旧脚本。
3. 新Token不要直接嵌在原管理弹窗内，更不能使用输入框展示。生成后打开更上一层独立PrimeVue Dialog，以不可编辑的语义正文/code展示，使用真实PrimeVue复制按钮；仅用户点击才写剪贴板，不泄露到日志/截图，关闭展示弹窗即清理Secret。原管理弹窗保持元数据列表和生成表单。该项尚未开始修改。

已修改未提交：`src/components/RemoteRoot.vue`（移除常驻顶层用户条，保留冲突条，provide菜单动作，用户设置Dialog）；`src/components/RemoteConnect.vue`（PrimeVue Avatar/Button/Menu，本地/远端权限菜单）；`src/i18n/locales/zh-CN.js`、`src/i18n/locales/en-US.js`（用户菜单/设置/本地模式文案）；本检查点及本次handoff状态增补。

实际验证：4源文件Prettier完成；lint通过；typecheck失败，RemoteConnect.vue第54/59/66/82行共4处TS2339，inject默认空对象推断为{}导致settings/mcp/accounts/logout无类型。尚未修复，不声称验证通过。未运行新UI测试、未构建/打包/部署/安装、未改真实数据或API。旧线上仍2cbe3f1e6920，旧安装不变。

恢复后的准确下一步：先读本检查点，git status确认上述文件/基线，再修复注入动作类型（显式JSDoc类型或有明确类型的默认接口，不用any/关闭类型检查）；检查菜单键盘、标题栏层级、窄屏与提示。实现上层一次性Token展示Dialog（保持Secret仅内存、关闭清理）。更新e2e/web-server.spec.js对.remote-status和原顶层按钮的断言，改从头像Menu进入；e2e/ui-consistency.spec.js前4本地云入口用例改为头像菜单→登录账号。保留全部旧账号/Token业务验证，补菜单与快捷键同排/无常驻顶条、设置/退出、Token只读正文/复制/关闭清理/无输入框测试。再按额度门禁运行规范/类型/单测/build/67生产UI/真实HTTP8、3尺寸深浅/CSP/键盘与图像目视复核，必要原生验收另记。保存新候选后才进行私有服务器部署/桌面交付，Git/Wolai/交接三方收尾，API未变不机械重传Apifox。

设备状态仍未变：本轮没有SSH、原生输入、安装、关机或真实业务写入。当前源码为未验证WIP，不能发布。用户下次提醒额度恢复后再续接，不自动恢复。

## 2026-10-21恢复与实现里程碑

恢复先读本检查点，核对HEAD仍3a5769ae7b28dbb7ca05ad5efeff4f58f6b0ecac/原分支、4个WIP文件一致；五小时剩余98%后续80%，周55%，未重置。用户本轮明确批准安全覆盖当前安装，先全新备份、保留数据、不改独立MCP。

已完成：PrimeVue Avatar/Button/Menu与主题/语言/帮助同工具栏，本地菜单设置/登录、远端菜单用户设置/MCP/管理员账号管理/退出/桌面回本地。移除常驻顶层用户条，冲突/错误通过App notice插槽在标题栏/工具栏下展示。明确JSDoc注入接口修复4个TS2339，未关闭类型检查。用户设置展示账号并保留改密功能，不改认证契约。

Token生成后独立上层PrimeVue Dialog，以pre/code只读可选正文展示，不含输入框/可编辑元素；真实PrimeVue复制/关闭按钮，点击才写剪贴板，失败保留文本并明确提示。关闭立即清理，管理弹窗关闭/重开期间的迟到响应以viewEpoch拒绝重新展示Secret；从不持久化/日志输出Secret。测试发现重构后撤销成功未清revoking，已修resetPanels，8项真实HTTP全量重跑通过。

验证已完成：lint/typecheck、236单测/47文件（新增3项Token内存生命周期/复制失败）、生产build、桌面Rust47+stdio1/fmt、发布元数据/UPARS1.1.0。生产67/另8Web专用跳过已通过，最终代码尚待末轮；独立真实HTTP8已通过，覆盖1280/960/375深浅、头像同排、菜单键盘/权限、用户设置、Token只读上层/点击命中/复制/关闭重开、原注册/账号隔离/冲突。最初layer测试错误读取dialog而非PrimeVue mask的zIndex，已改真实mask层级+elementFromPoint命中；单位测试补齐matchMedia模拟与类型。没有削弱检查。菜单图像最初被首次引导动画遮挡，已固定隔离测试的onboarding偏好并重新截图，不把遮挡图当菜单验收。

本阶段未提交：`src/App.vue`、`src/components/{RemoteRoot.vue,RemoteConnect.vue,RemoteMcpTokens.vue}`、`src/i18n/locales/{zh-CN.js,en-US.js}`、`src/__tests__/components/RemoteMcpTokens.test.js`、`e2e/{web-server.spec.js,ui-consistency.spec.js,test-globals.d.ts}`、本检查点与后续交接增补。

下一步：确认新菜单/已掩码Secret图像；末轮67生产E2E、构建NSIS，保存源提交。用现有已验证Linux源48b0d6d/CI39542084645（本轮Rust/API不变）打包新前端，核对服务器当前版本和数据，短暂停服务保护后部署，仅正常TLS只读健康/资源核验，不在生产生成Token或CRUD。然后检查本机原安装/包SHA/无主窗运行、制作全新E盘安全副本（MCP活动库用SQLite在线backup）、安全覆盖并验证业务行摘要/全部非程序文件，原生桌面仅在解锁后检查。Git/Wolai/交接收尾，API不变仅复核Apifox无需重传。

设备确认：本轮原生工具初始化/只读列表成功，未发现运行的EasyProject主窗；CIM仅3个独立artifacts/mcp进程，未中断；HKCU安装仍原E盘runtime-current-user/app。原生屏幕未操作/未确认解锁。开发预览仅127.0.0.1:1420 demo，真实HTTP测试仅E盘新隔离实例；服务器尚未重连/改变。无关机/自动唤醒授权。
