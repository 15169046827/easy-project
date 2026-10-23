# C盘产品限制纠正

2026-10-23，用户明确澄清：非C盘仅是本机维护环境要求，不约束终端用户。

- 目标：允许C盘安装侧默认数据及自定义C盘可写目录，保持实际权限/网络/链接/穿越/重叠/迁移检查；不静默回退换库。WACAS未定义，实际AGENTS/交接1.12/UPARS1.1.0。
- 基线44f18ccfac20129c555e50c0fa9f55469f612cc4，codex/audit-release-20261006-api，开工干净。额度五小时余87%、周余98%。
- 已改storage.rs两处盘符拦截，保留解析后网络目录检查；凭据和WebView沿用同一校验因此一起解除盘符限制。新增Windows只读C路径验证，不写C盘；相对/网络/重叠原负例保留。中英文数据设置提示更新。
- 验证完成：存储8、完整Rust53+stdio1通过；fmt/严格clippy、前端lint/typecheck/build/diff通过。初次并行单测Apifox4超时、再次默认并行3超时（npm未转发maxWorkers参数），直接Vitest两worker全258/53文件通过，不改断言或超时。生产UI初轮80通过/2失败/12专用HTTP跳过，失败为备份告警等待与1280dark存储状态等待；随后本次四存储尺寸/主题+备份告警串行零重试5/5通过。保留初轮失败，不能称完整82一次全绿；不是新安装或写C盘验收。
- 保存前未提交：AGENTS.md、docs/handoff/RULES.md、docs/handoff/CURRENT_STATE.md、本文、src-tauri/src/storage.rs、src/i18n/locales/zh-CN.js与en-US.js。源码整改完成，下一步是独立新补丁版本/发布计划，须按该阶段范围执行，不覆盖既有beta.2附件，不提前改官网系统要求误导用户。
- 当前公开beta.2仍含旧盘符限制，官网下载文案暂保留其真实行为。服务器/安装/真实数据/MCP本轮未动；仅沿用上轮连接成功证据，不冒称新部署。Git/Wolai/交接待验证里程碑同步，API契约无变。
