# 公开测试版 Beta 1 检查点

日期2026-10-22；用户明确批准公开未签名预发布测试版，并接入官网下载。此授权不代表正式生产验收通过，不授权覆盖本机、迁移真实库或改变MCP/服务器权限。

- 目标：当前源重新构建Windows x64 NSIS/MSI、macOS ARM/Intel各app/DMG；逐份摘要/容器/版本/架构核验后，公开新v0.1.1-beta.1，官网列实际文件与风险。旧7个草稿及资产保留，不改名冒充新包。
- 基线：8912dda35c5ffca6a26d338be5467433d7e9db9e，codex/audit-release-20261006-api，开工干净。WACAS未定义/待确认，实际AGENTS/交接规则1.10/UPARS1.1.0质量原则；本次非新全库审计。
- 额度：开工五小时余88%、周余16%；长阶段前/里程碑复查，低10%或硬5%按规则保存暂停，不重置/唤醒/关机。
- 实现中：app版本0.1.1（package/锁/Cargo/锁/Tauri一致），公开标签v0.1.1-beta.1；现有release流程增public_beta/beta_number，仍先保护性draft、同SHA/防覆盖/质量安全三平台构建，不自动发布。旧internal与stable行为保留，增加互斥/编号/保护单测。
- 未提交文件：package.json、package-lock.json、src-tauri/Cargo.toml/Cargo.lock/tauri.conf.json、scripts/prepare-internal-release.js/.test.js、.github/workflows/release.yml、本文。官网尚未改下载状态。
- 下一步：本地lint/typecheck/版本与发布脚本正负例，确认新标签/草稿未占用；保存提交/推送，dispatch原分支新beta，核对精确headSha。等待完整质量/新鲜安全门禁、3平台构建；任何失败先定位，不绕过规则或复用过期内部例外。通过后独立下载/摘要/格式核验，公开Release与SHA清单，再更新官网并安全部署/读回。
- 剩余风险：未签名/未公证、Mac和MSI干净设备/真实跨版本/多屏矩阵未验，须公开说明而不写正式通过；原Linux信息告警只按实际发布目标启用树复核，不自动延长旧内部例外。若发现新漏洞或真实可达风险先整改/复验。
- 同步：Git未提交/Wolai与交接待本轮里程碑同步；API契约无变，Apifox无需重传。官网当前仍cd05e93旧下载状态，桌面/MCP/服务/真实库均不动；本轮尚未连接服务器，既有home-host状态只沿用上轮证据。

## 准备里程碑

- lint/typecheck通过；发布候选脚本10项正负例通过，release:check=0.1.1一致、diff通过。未删除测试/关闭门禁；旧internal候选测试继续通过。标签v0.1.1-beta.1查询404，7个既有草稿无同名，最后release工作流已结束，无冲突运行。
- 新增docs/RELEASING和handoff README/CURRENT_STATE/RULES当前任务增补；手册1.11/79条，本次公开beta的明确授权与正式验收分开，不是永久放行所有未来包。当前全部修改准备提交，下一步dispatch新模式并核对完整源SHA。
