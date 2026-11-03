# 剩余依赖续改结果

- 日期2026-11-03；源基线81ca9874ab97f77b955f93965b03b0729751b0c4，codex/audit-release-20261006-api；UPARS1.1.0/规则1.25，WACAS未定义。
- 用户授权继续可安全实施的整改，不部署、不改真实数据。此为依赖增量复核，不是新全量代码审计。

## 结果与范围

定向更新ExcelJS4.4.0的unzipper传递依赖0.10.14→0.12.5，移除fstream/rimraf及其旧glob支链；ExcelJS版本、应用API和数据库不变，未替换Excel/日历引擎。根实际扫描由11降到10（0高危/0严重/7中危/3低危），原27累计降到10。没有隐藏扫描、全局覆盖旧minimatch API或接受临时例外。

正式新增三项兼容测试：文档值/日期/公式/样式/多表、Node流式写入读取、glob目录ZIP及解压；使用E盘合成夹具，未访问真实项目。ExcelJS浏览器包新旧SHA256均`7E49DA68588E250DBB8BBA190D2CAA8AB3787CC0284BDA1D8B2F805C4DF742C9`，产品实际使用代码未变。

## 未采用方案及实际失败

- 官方latest查询：deepmerge仍4.3.1、ExcelJS仍4.4.0，没有可直接安装的上游修复。
- archiver7/6及现代utils分支测试出现流式Excel写入失败，原因是ExcelJS自定义StreamBuf.pipe不返回destination，新normalizeInputSource依赖返回值。不能为少几个扫描计数牺牲功能，未合入，未删失败测试，也未叠加第三方兼容补丁。
- 初次npm override选择器与直接依赖范围冲突；修正选择器后继续。去掉不兼容override时npm残留archiver6，已从根基线锁重新解析并严格ci，确认恢复5.3.2。所有最终锁版本变化限unzipper支链。
- 新测试两处类型错误（CellValue未收窄、访问未公开Writer.stream）已按Date收窄/公开stream选项修复，未放宽类型检查。

## 当前验证

证据目录`src-tauri/target/audit-tools`，全部ignored且无凭据：

- 候选严格ci、3兼容、lint/type、399单测72文件、build6.96秒通过。
- 根`excel-root-ci/lint/type/unit/build.log`：严格engine/peer且ignore-scripts ci过，既有deepmerge防护按hook重施，399/72过，build7.90秒过；旧大chunk提示保留。无更改Lint规则。
- `excel-root-audit.json`：10（7中/3低）；`excel-root-prod-audit.log`现有生产high门禁exit0。原audit级别未改。
- 根`excel-root-ui.log`：130生产UI通过4.0分钟（13HTTP按模式跳过）；另`excel-root-http.log`独立13HTTP实际通过1.2分钟。release:check、UPARS1.1.0校验和git diff --check均通过。深浅/窄屏/严格CSP属于浏览器自动回归，不冒充本轮原生桌面操作。
- 不重复执行未改的Rust源码/新RustSec或真实桌面验收；不将历史结果冒充本轮。

## 剩余项与停止扩大范围的理由

EP-DEP-004(P3/open)剩余7中为ExcelJS旧Node压缩链传播，生产模块门禁继续禁止入前端；更新archiver的兼容失败已由独立测试证实。继续消除此链需替换Excel引擎或维护额外兼容fork，属于更大的功能/维护迁移，当前不为扫描清零扩大。责任Ym_Li，11月16日或该链/入口变化时复核，不代表用户已批准风险例外。

EP-DEP-003既有deepmerge三入口摘要防漂移防护与攻击负例保持，扫描3低因原库版本仍显示；上游无patched版本，不能隐瞒为0。替换节假日引擎或给本地修补改包名/版本号不会自动证明更安全。

本次新增EP-DEP-006/P3/fixed：旧unzipper支链可兼容移除，证据为新三测试/根399/锁差异/真实扫描。发布可达性原本为未进入产物的Node链，但仍减少维护和开发环境风险。当前已安全实施的进一步缩减完成；完整项目/正式发布结论不因此自动通过。

## 同步与交付边界

Git/Wolai/交接资料需同步本轮收件。MCP、IPC、HTTP契约、权限和数据库未变，ApiFox无新定义可更新，不机械重写已验证66/32/19。DOC-SYNC-001仍保留；实际桌面/服务器/独立MCP仍未覆盖，不创建Release。无桌面控制/SSH/关机授权。未新增通用标准：现有依赖/负例/回归要求已覆盖。
