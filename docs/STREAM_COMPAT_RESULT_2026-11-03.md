# 压缩链兼容整改与复验

- 日期2026-11-03；基线5cc6d4fd727dd188ca2fb26cedef14ccb8ffa3c1，分支codex/audit-release-20261006-api；UPARS1.1.0/规则1.25，WACAS未定义。
- 用户后续明确选择局部流适配，覆盖前阶段“不增加兼容补丁”的范围决策。仅npm依赖/私有Node流契约与测试，非全量代码重审；不部署、不迁移、不动真实库或MCP权限。

## 结论

根实际扫描从10降至3（0 critical/0 high/0 moderate/3 low），原27累计降至3。7项中危传播链已移除，不隐藏或降级扫描。余3项均同一个deepmerge上游公告经date-holidays传播，已有原始摘要保护的本地修补与攻击负例；保留原版号告警，不能声称npm零告警或所有未知风险归零。

## 实施与稳定问题闭环

EP-DEP-004(P3)在本轮关闭：ExcelJS4.4.0的私有StreamBuf.pipe执行原有转发行为，但没有返回destination。新archiver-utils会取返回值，造成流式写入报错。新apply-excel-stream-compat.cjs只给该方法增加标准返回值，不改全局Stream、不重写事件或错误处理、不改浏览器预打包；限定版本4.4.0、原文件SHA256 `40DC7250BAEFDE463A2AA348044033317AAB9CE6C530132D5D8A821ED285D2AD`，源漂移即拒绝写入、幂等重施，保留MIT许可。该兼容缺陷只在新依赖候选触发，旧正式程序未被改坏。

随后只更新ExcelJS分支：archiver7.0.1→readdir-glob3.0.0→minimatch11.0.4，archiver-utils5.0.2→glob14.0.2；zip-stream等必要传递依赖随分支更新。没有全局覆盖旧API，没有换Excel引擎、没有删功能。初次外层版本选择器未应用到已override的readdir边，扫描7；已改为显式嵌套、从基线锁重解析及严格ci，实际图无旧3/5 minimatch或glob7。

EP-DEP-003的deepmerge本地防护保持；新security:patch串联两个独立受保护补丁，predev/prelint/pretest/prebuild/prerelease:check仍强制执行。升级ExcelJS或任何受保护文件改变时必须人工复核适配，不能仅更新hash绕过。

## 本轮实际证据

- E盘隔离候选先严格engine/peer ci、lint/type、402项72文件、build6.79秒及6兼容用例通过。包含文档值/样式/日期/公式/多表、流式写入读取、目录ZIP与解压、私有pipe返回/内容/end、损坏ZIP拒绝、已写入条目的archive取消、源漂移拒绝且零写入。
- 根`stream-root-ci/lint/type/unit/build.log`：严格ci及两防护自动重施、lint/type过，402/72过，build7.15秒过。既有chunk大小提示未隐藏，测试未删除。新脚本/测试遵循项目格式，未关闭规则。
- `stream-root-ui.log`：130生产UI过4.1分钟，13HTTP按模式跳过；独立`stream-root-http.log`实际13HTTP通过1.3分钟，不把skip当通过。
- `stream-root-audit.json`实际3低；`stream-root-prod-audit.log`原生产high门禁exit0，CI原阈值未改。release:check、verify-audit-standard(UPARS1.1.0)、git diff --check过。
- `stream-calendar-equivalence.cjs`：12国家×3年份共36组日历完整JSON与适配前等价。Excel浏览器包仍SHA256 `7E49DA68588E250DBB8BBA190D2CAA8AB3787CC0284BDA1D8B2F805C4DF742C9`。Node压缩链仍被生产模块门禁禁止入前端。必要传递buffer/readable-stream重排已包含在完整功能回归中，不仅凭文件名断言无影响。
- 无真实桌面/跨平台CI/新RustSec复验，Rust/后端源码未变，不将旧结果冒充新执行；产物带未提交源身份，不封存为可分发安装包。正式发布仍未通过，新交付需干净源重建及原生验收。

## 同步与下一步

最终收件：源码bd8ef71b34e9c3c8c4e4ba6352f32a3a5dada461已同树同SHA非强制同步Git，Wolai主/交接两处新段精确读回，工作区提交后clean。后续仅按新交付授权干净构建/原生验收，不自动重复本轮候选或覆盖真实程序。

本轮依赖兼容整改源验收已闭环；全项目重新审计和正式发布是独立结论。MCP/IPC/HTTP契约/数据库/权限未变，Apifox无新定义需写入，66/32/19既有读回与DOC-SYNC-001状态保持。无需重连或停止独立MCP。

Git/Wolai/交接资料同期保存；实际桌面、网页、服务器后端、数据库和MCP程序未覆盖，无控制/SSH/关机。余3低是已防护库的上游元数据告警，不通过改名改版号或删除依赖掩盖；后续上游正式修复后复核移除本地补丁。未新增UPARS要求，既有供应链及正负例要求已覆盖。
