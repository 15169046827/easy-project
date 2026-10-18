# 内部测试版2检查点

- 2026-10-18，范围：最新MCP/UI/安全补丁的独立未签名内部候选、多平台六资产核验、本机数据保护安装验收；不公开Release，不改变MCP写权限，不覆盖历史草稿/资产。
- 基线c520002f1a0ca1b0ef5a949daeea182abb8f40bb，分支codex/audit-release-20261006-api，开工Git干净。WACAS未定义/待确认，实际UPARS1.1.0及项目维护/数据保护/PrimeVue/CSP/额度规则。
- 开始五小时剩余42%、周91%，不重置/唤醒。已读前检查点并核对安全候选；旧internal.1/Draft406330701仍六资产，源3d62039。internal.2标签只读查询404，旧草稿列表未占用该名。
- 已实现待验证：内部编号参数默认2；所有发布工作流串行；验证/安全门禁后预留新内部草稿，先核对不存在同名tag或draft，再POST新草稿并校验精确SHA；三个构建只上传新releaseId，保留正式路径原行为，内部重跑遇同名即失败不覆盖。
- 全部未提交：.github/workflows/release.yml、scripts/prepare-internal-release.js、scripts/prepare-internal-release.test.js、本检查点。测试待执行，尚未dispatch/创建新草稿。
- 准确下一步：格式/lint/类型/新增正负例/全单测/元数据/YAML校验；保存Git精确同步后dispatch一次internal_test=true/internal_number=2，绑定精确候选SHA，等待验证/安全/三构建；在重要里程碑保存并查额度。剩余<10%不开始新长阶段，先保存暂停；所有窗口<=5%硬停。六资产齐备才独立下载核验，保护E盘当前数据后再安装原目录并原生验收。不可把同版本覆盖当跨版本验收。
- 文档同步：本地检查点，Git/Wolai未同步。本Windows确认，其它设备/签名身份未确认；用户库/当前安装/旧Release/MCP配置均未改。

## 提交前门禁

- 新7项正负例通过，完整213单测/43文件通过（22.72秒），lint/typecheck/release:check/diff通过；YAML结构待最后校验。正式路径不预留内部草稿，原行为保持。内部路径新增read-before-write、防同名、精确SHA/返回draft校验；HTTP30秒超时失败即停，无盲目重复创建。
- 当前未提交仍4文件，后续另更新RELEASING流程说明。五小时剩余34%、周90%，允许进入远程长阶段；dispatch前再保存并查询，低于10%不开始新长任务。
- 旧Draft406330701仍draft/prerelease，source3d62039。资产基线（ID/字节/SHA256，完成后逐项核对）：
  - ARM app：620411051 / 6882168 / c836dabeceecd97207aba4e0e9494ddb21b1fbb22fb8f44df573b7b4824a5b81
  - ARM dmg：620410962 / 6985164 / 8c19f2a48971a6e720cbcce2b3b01adb1abc260b8233485a6ecd9b1f1cd4cb68
  - Intel app：620414646 / 7105371 / 409d4fc07b672bb8dc23ff1595c676b06e22456428791fec8acb7701f3d1c50b
  - Intel dmg：620414600 / 7200310 / a053d322b0d8a93c66aeadd650fc91a5d4fdaa25aa4fee46ac85b9344d4d7987
  - NSIS：620410377 / 5149435 / fa56b80ec8b95b5c66a69d3032cf82c103c8ab8f84b716d64a3249141b5f394e
  - MSI：620410309 / 6868992 / 43655fb29e8bd7cc34ff642b92d04a40e092941ff52e71b0b64e7751429f246e
