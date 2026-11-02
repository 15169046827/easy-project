# 依赖定向整改与复验结果

- 日期：2026-11-02；基线78de3bae03227269ef1a09c3e302ecc608cff1b0；分支codex/audit-release-20261006-api。
- 标准UPARS1.1.0/规则1.25，WACAS未定义。模式：已授权整改；仅依赖、供应链防护及关联构建测试配置，不是新一轮全部自有代码人工审计。
- 全部改动先隔离验证，再合入根仓库；未安装桌面、更新服务器、迁移数据库、替换独立MCP或改变权限。

## 1. 结论

本轮定向整改已完成并通过根仓库复验。原27节点告警降至11，高危5→0；没有force、降级、扩大安全忽略或删除测试。剩余8中危来自未进入前端产物的ExcelJS Node依赖链，3低危是已定向防护但仍保留原版本号的deepmerge传播告警。**不能宣称扫描零告警或风险为零**。

原EP-HANDOFF-SEC-001的高危门禁缺口已由定向升级、防护与实际根扫描收敛；剩余风险按本报告保留，不采用此前未获批准的临时例外。该结论仅为本轮依赖整改验收，不是新完整项目代码审计通过或正式发布通过。真实桌面/服务未交付，新原生验收、跨平台CI、正式签名及DOC-SYNC-001仍未完成。

## 2. 实际整改

| ID/等级/状态 | 证据、触发与影响 | 发布可达性 | 整改与复验 |
| --- | --- | --- | --- |
| EP-DEP-001/P2/fixed | i18n旧分支插值/HTML净化公告、Vite开发服务器敏感文件绕过、undici旧分支；攻击依赖特定渲染或开发网络条件，不把npm high直接当应用P1 | i18n进入产品；Vite/undici开发测试链。未证明旧产品已被利用 | i18n11.4.16、Vite6.4.5、undici7.30.1；扫描不再列出，合成插值/srcdoc及Vite正负例、完整UI通过 |
| EP-DEP-002/P2/fixed | glob取消与minimatch放大算法，开发glob显式启用高优化；原ESLint3 API不能盲换11 | 开发工具链，不进前端 | ESLint10.14.0、兼容plugin-vue10.12.0/plugin-prettier5.5.7、Vue测试工具2.5.1；只对现代父分支锁glob14.0.2/minimatch11.0.1。严格peer/engine ci、lint/type/396单测通过；无全局minimatch覆盖 |
| EP-DEP-003/P2/fixed（本地防护） | deepmerge复制目标own __proto__时污染返回对象原型；原始库攻击PoC可复现，上游无修复版本 | 节假日库进入产品；未发现普通用户输入可达，但仍修补库原语 | 三入口9处赋值使用defineProperty建立own数据属性；原始SHA256和版本校验，漂移先拒绝所有写入，支持幂等。predev/prelint/pretest/prebuild/prerelease:check重施；攻击负例、数组/嵌套/日期/Symbol/custom merge兼容、36组日历等价、干净ci后重施均通过。包原名/版本/license保留，扫描3低不隐藏 |
| EP-DEP-004/P3/open | legacy glob7/minimatch3/5经archiver/ExcelJS传播8中危扫描；库级告警仍存在 | 应用只导入ExcelJS浏览器预打包，Node链不进517模块图；浏览器预打包内部功能并非被本报告全面审计 | 新构建门禁检查所有静态/动态分包，拒绝Node链及ExcelJS Node入口；8个新增正反例、生产build过。后续ExcelJS兼容替换可再减少元数据告警，当前不做大范围XLSX引擎迁移。维护责任Ym_Li，2026-11-16或导入/导出入口/依赖变化复查；这是待办责任建议，不是用户风险豁免批准 |
| EP-DEP-005/P3/fixed | 根Vitest误进入src-tauri/target内多套候选，重复执行1544项并报错 | 本机开发测试发现范围；不影响用户运行 | 仅排除Rust构建输出目录，正式src/scripts测试不删不跳过，核验71文件/396项通过；原失败日志保留 |

## 3. 实际验证及证据

所有日志位于E盘`src-tauri/target/audit-tools`（ignored），没有真实数据/凭据。根仓库：

- `dependency-root-ci.log`：Node24.15便携运行时，严格engine/peer、ignore-scripts干净ci过；原有工具peer提示和旧Excel Node链弃用警告保留，未出现引擎不满足。首次测试工具2升级要求更高Node，已用官方SHA256核对E盘便携版解决；无系统安装/持久PATH修改。
- `dependency-root-gated-lint/type/unit/build.log`：lint/type过，71文件396项通过，构建7.16秒过；历史大chunk提示仍在，未调阈值隐藏。
- `dependency-root-final-ui.log`：130生产UI通过4.6分钟；13HTTP在该运行模式跳过，另见`dependency-root-http.log`实际13HTTP通过1.5分钟。最终仅新增构建门禁/测试，不改变UI源码，130/13对应相同产品依赖和防护代码，不伪称在最后文档提交重新执行。
- `dependency-root-audit.json`：11（0 critical/0 high/8 moderate/3 low）。全量结果保留；`dependency-root-prod-audit.log`现有生产high门禁exit0。CI原audit-level=high未更改。
- release:check、verify-audit-standard.ps1(UPARS1.1.0)、git diff --check通过。Rust/后端/协议未变，未重跑Rust检查或新RustSec扫描；此前结果仅历史，不作为本轮新证据。
- 候选calendar-equivalence：12国家×2024/2026/2030，共36组完整JSON等价；攻击前后、摘要漂移拒绝均成为正式单测。候选388/130后根新增8构建边界用例达396。

## 4. 规范与持续门禁

最终锁复核：现代minimatch为11.0.1（ESLint/editorconfig）及11.0.4（glob自身锁定依赖），均高于修复门槛11.0.1，未将旧3/5 API强行替换。其他变化仅上述工具链的传递依赖；Vue/PrimeVue/Tauri、Rust及数据库依赖版本不变。构建产物带当时未提交工作区身份，不封存为可分发安装包；正式交付需新干净源构建及原生复验。

新脚本/测试使用现有Prettier/ESLint，0 lint错误/警告，类型检查过；无规则关闭。新脚本仅改校验过的deepmerge三个入口，保留MIT许可，不接受未知源或静默失败。升级依赖时必须先评估移除本地修补，不能随意更新hash让检查通过。

package engines为`^22.22.2 || >=24.15.0`，两份CI/release workflow固定Node24.15.0。直接运行Vite绕过npm prehook不属标准构建流程；正常npm dev/build/test/lint/release:check自动验证防护，直接vitest攻击负例也会因缺少防护失败。

未修改UPARS通用标准：现有供应链、门禁正负例及防漂移要求已覆盖。API/MCP数量/schema/权限/数据库未变化，Apifox66/32/19原始约束此前读回一致无需机械重写；OAS导出损失DOC-SYNC-001继续保留。Git/Wolai/交接需同步此状态。
