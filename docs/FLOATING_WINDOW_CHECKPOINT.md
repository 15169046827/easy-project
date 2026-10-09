# 悬浮窗开发检查点

日期：2026-10-09。目标：独立可置顶任务悬浮窗，收起/展开、手动任务选择、截止日期/项目/进度、返回主窗口。API/MCP仅记录后续需求，本轮不开放外部接口或修改数据库。

- 标准：项目维护规则、既有质量门禁和UPARS1.1.0；WACAS未定义/待确认。
- 基线：`codex/audit-release-20261006-api` / `82a02d3c92f18d16a616071318f9b288eac46471`，恢复时工作区干净。
- 开始阶段五小时剩余99%、周68%，允许长任务；不重置或自动唤醒，长期10%门禁及所有窗口5%硬底线继续适用。
- 已完成：独立任务窗、单实例原生入口、收起/展开、任务选择/项目/截止日期/进度、置顶开关、返回主窗口和退出清理；中英文、最小窗口权限、过期刷新与卸载清理。API/MCP仅在项目计划中记录。
- 验证：生产构建、发布配置检查、24项生产浏览器回归、178项单元测试/36文件、29项Rust测试、Clippy零警告、Rust格式、类型检查、ESLint零警告、UPARS验证脚本通过。浅色/深色340×360浏览器截图已目视复查，无遮挡；浏览器预览工具仍因Windows sandbox helper初始化错误不可用，用生产回归截图补充前端外观检查，不冒充原生窗口验收。发现的类型错误及npm转发打包参数失败已整改并复验，不以串行命令最终退出码冒充全部通过。
- 里程碑额度：五小时剩余93%、周67%，允许继续打包。
- 本阶段提交范围：CHANGELOG.md、docs/PROJECT_PLAN.md、docs/FLOATING_WINDOW_CHECKPOINT.md、e2e/smoke.spec.js、src-tauri/src/lib.rs、src-tauri/src/floating_window.rs、src-tauri/capabilities/task-floating.json、src/App.vue、src/main.js、src/i18n/locales/en-US.js、src/i18n/locales/zh-CN.js、src/modules/floating/{FloatingTaskWindow.vue,taskSelection.js,useFloatingTasks.js,windowActions.js}、src/__tests__/components/FloatingTaskWindow.test.js、src/window.d.ts、tsconfig.json。提交后以Git status核对全部未提交文件，不忽略未跟踪文件。
- 本地NSIS：`src-tauri/target/release/bundle/nsis/EasyProject_0.1.0_x64-setup.exe`，SHA256 `636C7548F4C33017FA8FB8E3368B0EB6D81BB11A094173C97743A82EF81015A2`。构建完成，不自动安装；原内部Release草稿及六资产不变。版本仍为开发用0.1.0，不能充当跨版本升级测试。
- 准确下一步：同步本阶段Git与Wolai后交付本地测试包；在应用关闭、数据保护条件下再安排安装及原生拖动/置顶/DPI多屏/关闭主窗口退出测试。API/MCP下一阶段先确认只读工具和授权模型，不直接开放写入。
- 保留数据：当前用户的新项目与E盘安全副本不删除、不恢复；既有0.1.0内部安装不自动覆盖正在使用的程序。
- 已确认设备：只有本开发Windows，无Mac/独立干净设备或新签名身份。原生Computer Use近期启动失败，原生置顶/缩放/跨显示器行为需实测，浏览器不能替代。
- 文档：项目计划与变更记录已更新，Wolai将在本阶段Git提交后同步并读回（外部页面记录实际提交SHA与同步结果）。正式发布仍未通过；3项P3例外复查2026-10-22或变更触发条件先到者。悬浮窗内不做写入、开机启动、吸附或自动提醒，主题/语言在窗口打开时读取当前设置，未承诺跨窗口即时同步。
