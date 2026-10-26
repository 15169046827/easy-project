# 版本检查候选续接（2026-10-26）

## 当前结论

源码候选已实现，未打包/安装/部署，不是正式发布通过。五小时剩10%边界保存，不启动新的原生构建/长阶段；恢复须先核本检查点、额度、Git及文件。上阶段后端31d9b7c与运维作业已经安全交付，不重复迁移/安装/部署；精确服务器副本见NEXT_PHASE_CHECKPOINT顶部。

## 范围与基线

- 用户要求按既定顺序继续开发，本阶段为桌面版本检查；不自动下载、安装、发布或回退数据。新桌面安装/官网前端部署/新公开Release需取得对应明确许可，不能套用上一后端许可。
- 基线8173740e9dcda6a9d35ed249de0faaf0b792e349，分支codex/audit-release-20261006-api；开工干净，无他人重叠修改。
- WACAS未定义/待确认；适用AGENTS、维护skill、交接1.15、UPARS1.1.0。阶段开工5h余32%/周59%，里程碑余22%、15%、13%，最新10%/周56%；不重置、唤醒或关机。所有维护写入须E盘。

## 已完成候选

- App工具栏新增真实PrimeVue按钮/Dialog/Message，中英词条齐全。用户明确点击才请求；内部/开发构建与公开tag分开，不能用package基础版本误判“已是最新”或建议降级。
- releaseVersion.js负责受限SemVer顺序、tag/版本/日期/schema校验、固定本仓库发布页和只读对象；releaseCheck.js只请求受控官网或Web同源的/release-info.json，cookie/Bearer均不发送、不跟重定向，16KiB流读取上限、取消、8秒UI截止、5分钟内存缓存，不改登录/数据源。
- public/release-info.json从现有已核验downloadRelease.js生成；build-release-info.js检查官网版本/发布页/下载base一致性，build前强制检查索引未落后。GitHub只读核对最新公开仍v0.1.2-beta.1，其余draft保持，不把候选当公开版。该索引不是自动遍历所有GitHub tag，发布维护流程须在资产公开核验后同步更新。
- Vite注入版本、源SHA、dirty和release tag；显式tag必须匹配app版本且源干净可识别，否则拒绝发布构建。release.yml仅将原prepare输出tag传入，不改变draft/公开授权/签名门禁。
- 主窗opener仅允许固定本仓库/releases/tag/\*默认浏览器URL；不授予任意URL、文件/自选程序权限，浮窗及MCP无扩权。2.7.0源码证明OpenerExt依赖已管理状态，原Builder未初始化；本候选补初始化并关闭自动链接接管，兼顾原受控备份目录打开状态依赖。未实际原生验证，不能称已完成实机修复。

## 验证证据与失败记录

- 完整308 Vitest/62文件、94生产UI通过，13 Web专用跳过（本阶段未重跑13真实HTTP；上一后端最终13有效，不冒称本次复跑）。日志version-check-vitest.log、version-check-production.log。
- 桌面Rust72单元+1真实stdio通过，fmt/严格Clippy通过；日志version-check-rust.log、version-check-clippy.log。未改server后端，共享业务代码未动。
- 最后小补丁（构建SHA全文提示、索引版本/base一致性、缓存到期反例）后，21定向测试/3文件、类型/lint、生产build与4个1280/960×640浅深严格nonce场景再次通过；日志version-check-build-final.log、version-check-ui-final.log。完整308/94属于该小补丁前，后续最终封存再运行完整门禁，不将定向结果冒充全量。
- 严格nonce矩阵验证真实PrimeVue动态样式、手动检查前零请求、请求无cookie/Bearer、内部版提示、边界宽度、Escape关闭/焦点回到入口；只用了隔离合成fixture，不是原生Tauri证明。
- 首次2工具测试因未显式设置TEMP被执行环境指向C盘沙盒缓存并EPERM，断言未执行，重设进程TEMP/TMP为E盘并宿主运行后18项通过。保留该不合维护要求的临时写尝试，不声称从未尝试C写入；不清理未知C目录/不改系统策略。
- 新延迟回调测试先出现undefined/never类型错误，改显式函数类型后最终typecheck通过；未忽略规则/删除测试。
- 当前dist为8173740+dirty内部候选；尚未clean source重建、生成可安装NSIS或替换release/mcp产物。不要把旧父子FA8BC7FF包或旧966F4864主程序当作版本功能包。

## 准确下一步

1. 恢复额度后查额度/Git、读此检查点及相关差异；已通过工作不重复，最终清洁源门禁除外。
2. 补版本检查使用说明/发布索引维护说明、API与交接规范：未新增自有invoke命令（仍7），但主窗URL能力及公开静态JSON契约须准确记录；确定将静态元数据作为公开运行状态资源维护，按实际契约补私有Apifox并读回，不能虚构CRUD接口。当前Apifox仍上一后端18HTTP/66原生，不声称新静态资源及插件说明已同步。
3. 核代码评审与源/权限边界，clean source重建并完整前端/生产回归；对发布tag识别/dirty拒绝补构建门禁反例。原生Windows隔离合成库验证1280/960浅深、键盘/焦点、严格CSP与opener限定URL/备份目录状态初始化，未授权真实CRUD或修改MCP配置。操作UI前读当前computer-use技能。
4. 通过后构建默认配置NSIS候选、记录SHA/源/dirty，申请本阶段新的桌面覆盖和官网前端静态资源更新许可；保持数据/账号/后端/独立MCP，公开Release仍另批。线上目前缺release-info.json，新功能未交付，原生请求失败必须显示失败而非“最新”。
5. 本阶段交付后才按原顺序继续官网最新合成截图/下载简化与es-ES等，不把尚未完成的工作量计为交付。

## 全部未提交文件（封存前）

.github/workflows/release.yml；package.json；vite.config.js；src-tauri/src/lib.rs；src-tauri/capabilities/default.json；src/App.vue；src/i18n/locales/en-US.js、zh-CN.js；public/release-info.json；scripts/build-release-info.js；src/utils/releaseVersion.js、releaseCheck.js；src/components/VersionCheck.vue；src/**tests**/utils/releaseVersion.test.js、releaseCheck.test.js；src/**tests**/components/VersionCheck.test.js；e2e/ui-consistency.spec.js；docs/NEXT_PHASE_CHECKPOINT.md；本文及随后handoff/文档检查点（提交后以Git为准）。均本任务，无他人修改。

## 同步、设备及风险

- 本阶段准备提交/推送并同步Wolai主/交接；最终SHA与读回另补。未完成API资源/插件说明的Apifox同步，准确缺口如上。实际后端和此前18接口同步已完成，不重复修改。
- 本机Colin未启动本阶段原生候选窗口、未覆盖应用或独立MCP；测试runner的隔离预览会自行结束。home-host上一后端安全部署SSH已正常退出，实际服务及日备份/15分钟监测保持运行，未关机，没有其它设备新连接证明。
- 站外告警、OS硬配额、异地备份/自动清理、跨平台正式验收及新公开包仍未完成；上一生产结论不变。
- 已记录历史UI债务：App快捷键/数据恢复自绘浮层与DataView可见browse span后续按PrimeVue约束整改，不把版本弹窗的真实组件证明推广为全局UI已合规。
