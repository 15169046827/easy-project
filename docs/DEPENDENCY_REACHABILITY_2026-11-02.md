# 剩余依赖风险可达性复核

- 日期：2026-11-02；基线fba2e03188352ed7d2ff177ce4f7777109f2f3f3，codex/audit-release-20261006-api。
- UPARS1.1.0；WACAS未定义；范围仅剩余依赖链，不替代全代码审计。候选基于26813a6，含Vite6.4.5/undici7.30.1/i18n11.4.16；原根依赖/产品未改。
- 扫描21节点（18中/3低）主要来自下述三个底层公告；传播节点数不是独立应用漏洞数。没有批准新的风险例外，不标accepted。

## 证据与处置

| 风险链 | 实际证据/触发与影响 | 当前结论与下一步 |
| --- | --- | --- |
| minimatch GHSA-g3hv-75wg-m249 → ESLint/ExcelJS等 | 公告范围<11.0.1，细节涉及optimizationLevel>=2。安装3.1.5/5.1.9未包含该预处理代码；两个9.0.9包含firstPhasePreProcess，glob10调用显式设2，不能宣称全链无相关代码。恶意glob模式可耗尽开发进程资源 | 生产517模块图排除该链；开发仓库/模式输入仍应可信。保留告警，禁止全局override11或降级ESLint4。后续独立开发工具链兼容迁移；未接受例外 |
| glob GHSA-3g3m-2fjr-6pw4 → js-beautify | 公告影响9—14.0.1、修复14.0.2；取消后仍可能遍历文件系统。本候选10.5.0为开发链，ExcelJS旧glob7不在该公告直接版本范围但受minimatch传播告警 | 无生产输出路径，不等于开发端安全。不能把10→14当补丁或直接覆盖调用方；开发进程隔离/限制资源、不得处理陌生glob输入。兼容升级仍待验证 |
| deepmerge GHSA-gcqx-w48m-w2h4 → date-holidays-parser/date-holidays | 公告4.2—4.3.1无修复。生产包含deepmerge；workCalendar仅以country/region选内置规则，exceptions单独处理，不传合并规则对象。Data.getRules/_dateByRule合并内置规则/内部日期；15组合、171次merge断言目标普通原型且无合成用户marker，普通CN/US正例包括在内 | 当前未发现支持路径的攻击数据源，但不以有限用例证明所有路径不可达。维持低风险未知/未接受例外，替代节假日引擎将是单独功能迁移，不能降级1.8.4去掉能力或自动补丁第三方源 |

来源：[minimatch公告](https://github.com/advisories/GHSA-g3hv-75wg-m249)、[glob公告](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)、[deepmerge公告](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)。2026-11-02读回，官方风险等级与项目P级不混用。

## 实际验证

- 隔离reachability-probe.mjs调用Vite生产build(write:false)，517输出模块，assert排除archiver/archiver-utils/glob/minimatch/readdir-glob/zip-stream/ESLint/js-beautify/rimraf；assert包含exceljs/dist/exceljs.min.js和deepmerge，通过12.04秒。不改构建配置，不输出安装包。
- 模块图不能解包浏览器预打包文件所有内部函数，ExcelJS浏览器包入口选择证据与Node链排除并用；不声称覆盖其所有可能漏洞。
- calendar-boundary-probe.cjs：15组合、171次合并断言通过；仅合成国家/区域字符串，无真实数据。不是全量国家/年份或浏览器原型攻击证明。
- 初次quota工具不可用，重试五小时余52%/周89%；里程碑余50%/89%。未调用reset，无桌面控制/SSH。
- 本轮规范域仅检查新增文档和ignored验证脚本，没有修改自有生产代码；未将原384/130结果冒充本轮重跑。

## 判定与接续

EP-HANDOFF-SEC-001(P2门禁缺口)仍open：高危已在候选降至0，原根项目尚未整改；剩余风险不能静默接受。代码安全签收未通过，正式发布未通过。

拟申请限定例外而非永久豁免：负责人Ym_Li，截止2026-11-16或依赖/入口/平台变化时提前复核；只适用于内部测试版/隔离候选，保留21扫描告警，不放宽npm门禁或公开正式发布条件。开发只处理可信仓库模式、CI限时且无生产凭据；deepmerge只用内置假日规则，不允许外部规则对象。用户批准前状态仍open。若不批准，继续独立开发工具链迁移及节假日替代方案，不以强制升级/删除检查制造通过。

候选合入与真实桌面/服务部署是不同阶段，部署仍需新范围确认。准确下一步：确认以上限定风险控制是否接受，再决定候选依赖最小合入和完整根门禁；或继续替换剩余依赖。不重做已完成Apifox66/32/19约束读取，DOC-SYNC-001继续保留。
