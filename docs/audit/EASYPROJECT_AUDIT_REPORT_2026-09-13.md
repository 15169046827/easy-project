# EasyProject 审计与整改报告

> 2026-10-06 最新 npm 闭环：扫描恢复后发现的三个根因现已按 EP-SEC-013/014/015 登记并修复。严格 TLS 的官方 npm 全量/生产复扫均为 0，退出码 0；Vue 3.5.43、source-map-js 1.2.2、eslint-plugin-vue 10.11.1 / postcss-selector-parser 7.1.6，全部前端回归通过。系统 DNS/代理/证书库未改，默认解析异常仍未永久修复；仅扫描进程使用实时 DNS。

- 审计标准：仓库 UPARS 1.1.0（较已安装的全局 UPARS 1.0.0 增加外部地址校验—使用绑定检查）
- 审计日期：2026-09-13—14；前端依赖整改复验：2026-10-06
- 审计模式：审计并整改
- 项目版本：0.1.0；数据库及 JSON 交换 schema v5
- 提交基线：`main` / `c0bb3220347f3978f547d0c4841156c648f2711a`；基线工作区干净，本轮改动均未提交
- 发布目标：Windows x64 NSIS/MSI、macOS Apple Silicon/Intel APP/DMG；目前为未签名草稿
- 审计任务：EasyProject 全源集 UPARS 审计与整改

## 1. 结论

已检查原 137 个自有文本输入文件，含 10-06 依赖复验新增共 28 项确认问题：P0 0、P1 2、P2 17、P3 9。23 项已整改复验；P0/P1/P2 未关闭均为 0，5 项 P3 保留。npm 全量/生产最新扫描为 0；当前官方 RustSec 快照 1290 公告扫描 546 依赖为漏洞 0、撤包 0，另有 9 信息性警告。82 单测、9 专项、16 E2E、Rust 25 测试、严格 Clippy/格式和生产构建通过。**代码审计暂不通过**：信息性警告、两项大块警告和远程 CI 缺口未闭环。**不具备正式发布条件**：签名、多平台候选和真实安装/升级/数据保留矩阵未验。

## 2. 范围与排除项

### 已审计

- 使用 `git ls-files` 加未跟踪文件清单建立全量清册：本报告生成前共 161 个项目文件，其中 137 个自有文本输入文件、24 个二进制资源。文本覆盖前端 59、Rust 30、脚本 6、E2E/类型声明 2、CI 2、Tauri 配置 8、根配置/项目文件 21、项目文档 9。报告自身不计入输入数。
- 对全部 JS/Vue/测试/E2E/构建脚本/根 JS 配置运行 ESLint、Prettier 及 `checkJs` 类型检查；对全部 Rust 源集运行格式、Clippy、单测及 Windows release 编译；检查 Python 图标脚本 AST 和 PowerShell 审计脚本 AST。检查 JSON/YAML、锁文件、Tauri 能力/CSP、发布脚本与工作流。
- 逐域审查项目、任务、成员、依赖、日历订阅、JSON/XLSX/ICS 交换、SQLite schema/迁移、备份/恢复、前端状态与错误反馈、权限和外部网络边界；复核 README、贡献与发布文档。

### 排除

- 24 个 PNG/ICO/ICNS 等二进制资源的逐像素设计复验：属于视觉/设备验收，不属于本次代码审计；文件及发布引用已清点。需在真实桌面、开始菜单和任务栏上另验。
- 第三方 `node_modules`、Cargo registry 与生成的 `dist`/`target` 源码：不属于项目自有代码；通过锁文件、依赖告警、构建和产物验证间接检查。
- macOS 目标构建与真实设备/干净机器流程：当前只有 Windows 主机和本地 NSIS 构建证据，正式发布前需分别验收。

## 3. 技术栈与门禁

| 技术栈/组件            | 规范                                             | 测试                             | 构建/安全                                   | 结果                                                |
| ---------------------- | ------------------------------------------------ | -------------------------------- | ------------------------------------------- | --------------------------------------------------- |
| Vue/JS、测试和脚本     | ESLint/类型/3 文件复杂度门禁                     | Vitest 82；专项 9；E2E 16        | Vite；官方 npm 全量/生产扫描                | 功能门禁通过，npm 两次均 0；大块警告保留            |
| Rust/Tauri/SQLite      | `cargo fmt --check`；Clippy `-D warnings`        | 25 项 Rust/SQLite 单测           | Windows x64 NSIS release 构建；RustSec 扫描 | 构建/测试通过；RustSec 漏洞 0、撤包 0、信息性警告 9 |
| Python/PowerShell/YAML | Python AST、PowerShell AST、YAML 解析与 Prettier | 标准校验脚本、发布脚本和产物校验 | UPARS 1.1.0 版本一致性                      | 已执行项目适用项；Ruff 不可用                       |

## 4. 编码规范审计

- 初始结果：基线 ESLint 和 Rustfmt 通过；首次严格 Clippy 报 15 条（切片参数、返回控制流、整数范围与分页计算）；引入完整 `checkJs` 后共揭示 96 条类型诊断（首轮 `src` 81 条，扩展 E2E 后又 15 条）。对全部 JS/Vue/脚本额外诊断发现 3 个文件中的 5 条复杂度/函数长度提示：`ResourceLoadPanel.vue` 21、`ics.js` 21/31、`criticalPath.js` 24 且 122 行。
- 整改结果：修复 Clippy 与类型诊断，补充真实的模型/测试环境类型、边界处理和 CI 门禁；测试目录及 E2E 均保留在类型检查范围内。针对本轮编辑引入的 7 条 Prettier 错误做定向格式化，未删除测试或关闭规则。
- 最终结果：10-06 ESLint/类型检查均为 0 错误/警告；ICS、关键路径、资源负载的原 5 条复杂度/长度诊断已归零，并对原 3 文件接入复杂度≤20、函数有效行≤100 的持续门禁；正例通过，两个内存超限负例分别被两条规则拒绝。Rustfmt/Clippy 保留 9-14 的 0 错误/警告结果。Gantt/TaskList 文件级大组件尚未拆分，EP-CODE-003 保持 open；没有全局豁免或阈值放宽。
- 持续控制：CI 和 release tag 验证都运行 ESLint、类型检查、前端测试、Rustfmt/Clippy/Rust 测试；远程工作流尚未在本轮提交上运行。

## 5. 发现与整改闭环

下表中的“可达”指当前应用或发布流程可触达，不表示已在真实设备上重现。P2 无接受例外。

| ID           | 状态  | 严重度 | 置信度 | 范围                     | 证据/触发                                                                                                                                                          | 影响与发布可达性                                                                                                                                                | 整改/接受理由                                                                                                           | 验证                                                                                                                    |
| ------------ | ----- | ------ | ------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| EP-SEC-001   | fixed | P1     | 高     | ICS 远程订阅             | 原先仅在连接前解析 DNS，`reqwest` 可能重新解析；重绑定或跳转到私网可触发                                                                                           | 支持的订阅路径可达，可能访问本机/内网                                                                                                                           | 每跳重新校验；禁用自动跳转与代理；`resolve_to_addrs` 把已检查地址固定到连接；补挡映射/保留地址                          | Rust 测试含私网、映射地址、跳转反例；Clippy/Windows release 通过；真实 DNS 重绑定环境未模拟                             |
| EP-DATA-001  | fixed | P1     | 高     | SQLite 备份恢复          | 原 `database_counts` 对缺表 SQL 错误返回 0；目录内非本项目 `.db` 可通过预览并尝试恢复                                                                              | 数据视图可达，可能使工作区 schema 不可用；安全快照虽存在但不应误报成功                                                                                          | 恢复前要求 schema v5 和全部必要表可读，错误直接拒绝；文档标明旧 `.db` 限制                                              | 新增缺表/旧版备份负例；Rust 25/25，NSIS release 通过                                                                    |
| EP-SEC-002   | fixed | P2     | 高     | ICS 响应                 | 无 `Content-Length` 时先 `response.text()` 全量分配，之后才检查 5 MB                                                                                               | 订阅路径可达，恶意服务器可耗尽内存                                                                                                                              | 改为最多读取 5 MB+1 字节；请求错误移除 URL 以免令牌出现在错误消息                                                       | 无长度无限流测试拒绝；Rust 25/25、Clippy 通过                                                                           |
| EP-SEC-003   | fixed | P2     | 高     | npm 生产依赖             | 初次 `npm audit --omit=dev` 为 3 高危、1 中危（brace-expansion、js-yaml、nanoid、postcss）                                                                         | 锁文件生产依赖可进入构建链；具体调用可达性不全相同                                                                                                              | 仅更新锁文件中可兼容修复的传递依赖，不降低审计阈值                                                                      | 最终 `npm audit --omit=dev --audit-level=moderate` 为 0；78 单测、16 E2E、生产构建通过                                  |
| EP-REL-001   | fixed | P2     | 高     | 撤销/重做                | `src/api/index.js` 原先先 `pop` 再导出/恢复；导出失败即丢历史项                                                                                                    | 桌面快捷键可达，撤销/重做可靠性受损                                                                                                                             | 成功恢复后才移除栈项；失败留原历史                                                                                      | 新增失败后重试单测；78/78，16/16                                                                                        |
| EP-REL-002   | fixed | P2     | 高     | 自动备份与历史提示       | `src/App.vue` 原定时备份 `.catch(() => {})`，失败无用户提示                                                                                                        | 桌面运行 30 分钟后可达，用户误以为有恢复点                                                                                                                      | 显示中英文 `role=alert` 错误提示；历史操作失败也提示                                                                    | 新增时钟快进的自动备份失败 E2E；16/16，类型/构建通过                                                                    |
| EP-REL-003   | fixed | P2     | 高     | Rust DB 访问             | 34 处生产 `Mutex::lock().unwrap()` 在互斥锁中毒后造成二次 panic                                                                                                    | 异常之后的 DB 路径可达，扩大故障                                                                                                                                | 集中 `lock_connection` 返回错误，DB/service 层传播                                                                      | 锁中毒负例；Rust 25/25、Clippy 0 警告                                                                                   |
| EP-DATA-002  | fixed | P2     | 高     | 服务端分页               | 成员/项目页号 0 下溢、页大小 0 除零；极端页号乘法溢出                                                                                                              | UI/IPC 参数可达，列表请求崩溃或过量读取                                                                                                                         | 页号至少 1、页大小限制 1–1000；共享饱和偏移并限制 SQLite 整数范围                                                       | 0 与极端页号单测；Rust 25/25、Clippy 通过                                                                               |
| EP-CODE-001  | fixed | P2     | 高     | Rust 编码规范            | 基线严格 Clippy 15 条，CI 原仅 `cargo check`                                                                                                                       | 所有后续构建可触达，警告积累                                                                                                                                    | 定向修复 15 条并加入 CI/release Clippy                                                                                  | `cargo fmt --check` 与 `cargo clippy --all-targets --locked -- -D warnings` 通过                                        |
| EP-CODE-002  | fixed | P2     | 高     | JS/Vue 类型规范          | 原无类型门禁；首次全源集共 96 条诊断                                                                                                                               | 前端及测试/脚本可触达，静态错误未阻断                                                                                                                           | 加 `vue-tsc`、完整 `checkJs`；修正模型、模板、mock 和 E2E 类型；未排除测试                                              | `npm run typecheck` 0 错误；78 单测、16 E2E、Vite build 通过                                                            |
| EP-BUILD-001 | fixed | P2     | 高     | release tag 工作流       | 原 tag `validate` 仅前端 lint/单测，Rust、E2E、构建与标准门禁缺席                                                                                                  | 可直接由 tag 进入草稿产物发布                                                                                                                                   | Windows 验证 job 补齐 CI 等价门禁，并保留多平台构建矩阵                                                                 | 两份 YAML 解析/Prettier 通过；各命令本地通过；远程 tag CI 待运行                                                        |
| EP-AUDIT-001 | fixed | P2     | 高     | 审计治理                 | 用户指定的仓库标准正文、模板、机器规则及校验脚本在基线缺失                                                                                                         | 审计及后续 CI 可达，标准不可复现                                                                                                                                | 补齐仓库 UPARS 资产并在 CI/release 校验；README 声明版本                                                                | `verify-audit-standard.ps1` 输出 1.1.0、6 域、11 字段；YAML 解析通过                                                    |
| EP-AUDIT-002 | fixed | P3     | 高     | PowerShell 标准校验      | 初版脚本在 Windows PowerShell 5.1 因 UTF-8 文本解码导致版本误判                                                                                                    | 开发/CI 可达，误报门禁失败                                                                                                                                      | 明确按 UTF-8 读资产，脚本检查表达式使用 ASCII/Unicode 正则                                                              | 本机 Windows PowerShell 执行通过；AST 错误 0                                                                            |
| EP-CODE-003  | open  | P3     | 高     | 复杂函数/大组件          | 原 3 文件 5 条复杂度/长度诊断；Gantt/TaskList 大组件                                                                                                               | 维护路径可达，增加回归成本，未证实功能失败                                                                                                                      | 已拆分 ICS、CPM、资源负载周峰值并接入局部门禁；Gantt/TaskList 拆分仍待完成                                              | 原 5 诊断归零；82 单测、9 关键路径/性能、16 E2E、lint/类型/构建通过；门禁两个超限负例被拒绝。组件拆分及回归前保持 open  |
| EP-BUILD-002 | open  | P3     | 高     | 前端资源体积             | 10-06 Vite 报 XLSX 940.20 KB、vendor 1495.38 KB 两项 >500 KB 警告                                                                                                  | 首次进入交换/相关视图可达，低配置机器加载延迟                                                                                                                   | 按需拆分/懒加载，不调高阈值掩盖                                                                                         | 构建通过但 2 项警告仍在；加载时长待量化                                                                                 |
| EP-SEC-004   | fixed | P3     | 高     | 开发测试依赖             | Vitest/@vitest/mocker 原 3.2.7；[GHSA-82fw-gwwq-j7x9](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9)；jsdom、无独立对外 mocker 服务 | 不进入生产 bundle，未证实当前远程利用路径；测试服务暴露时可能触发                                                                                               | npm 10/11.3 的 edgesOut 错误后，改用 E 盘兼容 npm 11.21.0，定向升至 4.1.11；直接声明 @types/node 22.20.5                | 最新全量/生产官方 npm audit 均 0，原公告消失；82 单测/9 专项/16 E2E、lint/类型/构建通过                                 |
| EP-SEC-005   | fixed | P2     | 高     | Rust 传递依赖            | 初次 RustSec 扫描对 `bytes` 1.10.1、`quick-xml` 0.38.3、`rustls-webpki` 0.103.6、`time` 0.3.44 报 8 条漏洞                                                         | `bytes`/TLS 经 ICS 网络栈可达，但公告中的溢出、异常证书条件较窄；`quick-xml` 经 macOS `plist` 链，未见应用解析不可信 XML 路径；仍需关闭已知风险                 | 定向更新锁文件至 `bytes` 1.11.1、`plist` 1.10.0/`quick-xml` 0.41.0、`rustls-webpki` 0.103.13、`time` 0.3.47，未忽略公告 | E 盘官方 RustSec 库 1243 条公告；复扫 0 漏洞；Rust 25/25、严格 Clippy 与 Windows NSIS 构建通过；macOS 编译待验          |
| EP-SEC-006   | open  | P3     | 高     | 未维护 Rust 传递依赖     | RustSec 仍报 `fxhash`、`proc-macro-error` 及 `unic-*` 五包，共 7 条未维护公告；锁文件中可核对                                                                      | `fxhash`/`unic-*` 经 Tauri HTML/URL 模块可到 Windows 构建或运行路径；`proc-macro-error` 当前 Windows 树不出现。未维护意味着后续缺乏修复，不等于已确认可利用漏洞 | 精确记录 7 个公告，不做全局忽略；维护者在下一次 Tauri 上游升级时核查替换，正式发布前复审                                | 本轮 RustSec 复扫仍列 7 条；25 项测试和 NSIS 构建通过，但此 P3 未关闭                                                   |
| EP-SEC-007   | fixed | P3     | 高     | `event-listener` 5.4.1   | RUSTSEC-2026-0221：`StackSlot` 在带非 `Send` tag 的跨线程等待条件下可不安全；经 Linux `zbus` 链引入                                                                | Windows/macOS 目标依赖树无路径，Linux 通过 `tauri-plugin-opener` 可达；当前未发布 Linux 产物                                                                    | 定向更新锁文件至 `event-listener` 5.4.2，不忽略公告                                                                     | RustSec 复扫该告警消失、漏洞/撤包仍为 0；Rust 25/25、严格 Clippy、Windows NSIS 通过；Linux 目标未编译                   |
| EP-SEC-008   | open  | P3     | 高     | `glib` 0.18.5            | RUSTSEC-2024-0429：`VariantStrIter` 的迭代实现存在不安全行为                                                                                                       | 当前 Windows `cargo tree -i` 无路径；GTK/GLib 属非 Windows/macOS 发布路径，Linux 构建尚未在本项目声明支持                                                       | 建议由 GTK/Tauri 上游链升级至 `glib` ≥0.20，添加 Linux 目标时先关闭                                                     | RustSec 复扫仍列 1 条；Windows 构建/测试通过，Linux 未验                                                                |
| EP-SEC-009   | open  | P3     | 高     | `rand` 0.7.3             | RUSTSEC-2026-0097：仅在自定义 logger 内再次调用线程 RNG 等复合条件下可不安全；经 `phf_generator`/`selectors` 引入                                                  | 当前 Windows 树为 PHF 生成链；项目日志器未在回调中使用线程 RNG，未见支持路径触发                                                                                | 0.7 线无公告列出的兼容修复版；等待上游 PHF/选择器依赖迁移，正式发布前复查调用条件                                       | `rand` 0.8/0.9 已升至修复版并从公告消失；0.7.3 仍列 1 条，Windows 测试/构建通过                                         |
| EP-SEC-010   | fixed | P2     | 高     | Rust 撤包依赖            | 完整索引 RustSec 扫描发现锁文件 `tray-icon 0.21.1` 已撤回；Tauri 2.8.5 约束为 `^0.21`                                                                              | 当前 Windows 目标依赖树未启用此可选功能，但全目标锁文件和发布安全门禁可达；撤回原因不等于已证实可利用漏洞，仍妨碍供应链审核                                     | 定向升级至同一兼容系列 `tray-icon 0.21.3`；CI/release 先 `cargo fetch --locked` 补齐索引，再以 `--deny yanked` 强制拦截 | 完整 RustSec 复扫漏洞 0、撤包 0、退出码 0；Rust 25/25、严格 Clippy 和 Windows NSIS 重新构建通过；远程门禁待运行         |
| EP-SEC-011   | fixed | P2     | 高     | brace-expansion 传递依赖 | 10-06 全量/生产 npm 扫描列高危，GHSA-q2hr-2g5m-vwhr、GHSA-qhr7-859c-m2p7、GHSA-6j4f-fj2g-mc7p；原 1.1.18/2.1.4                                                     | 恶意或深层嵌套模式可引起耗时/栈溢出；ESLint/测试工具和 ExcelJS archiver 链均可达，应用未证实直接接收不可信 glob                                                 | 同系列定向更新为 1.1.21/2.1.7，无 force/忽略                                                                            | 最新全量/生产官方 npm audit 均 0，原公告消失；82 单测/9 专项/16 E2E、lint/类型/构建通过                                 |
| EP-SEC-012   | fixed | P2     | 高     | moment 生产传递依赖      | 10-06 全量/生产 npm 扫描列中危，GHSA-4p3w-j4w9-5jqw；原 2.30.1                                                                                                     | 特制非字符串 locale 可路径穿越；经 date-holidays-parser/moment-timezone 进入生产链，应用层远程利用未证实                                                        | 定向更新至 2.31.0 兼容修复版                                                                                            | 最新全量/生产官方 npm audit 均 0，原公告消失；82 单测/9 专项/16 E2E、lint/类型/构建通过                                 |
| EP-SEC-013   | fixed | P2     | 高     | Vue 供应链               | GHSA-g2v6-rqmx-r4w6；Vue/server-renderer 3.5.22，SSR 动态属性名含 CR 可触发 XSS                                                                                    | 生产锁文件及安全门禁可达，源码未使用 SSR/renderToString，未证实桌面远程利用；阻断发布安全门禁                                                                   | 同一 Vue 3.5 线升至 3.5.43，声明最低 ^3.5.42，对应 renderer/compiler 同组更新                                           | npm 全量/生产 0；npm ls 一致，82 单测/9 专项/16 E2E、lint/类型/构建通过                                                 |
| EP-SEC-014   | fixed | P2     | 高     | source-map-js            | GHSA-68fv-2mgg-jv7q；1.2.1，特制 indexed source-map 偏移可耗尽事件循环                                                                                             | Vue 编译器、Vite/PostCSS、intlify 编译链可达，未证实运行时不可信源映射入口；构建/发布安全门禁受影响                                                             | 定向更新同系列 1.2.2，无全局 override 或忽略                                                                            | 安装/锁文件修复版；官方全量/生产 0，前端全部门禁通过                                                                    |
| EP-SEC-015   | fixed | P3     | 高     | 开发期 CSS 解析          | GHSA-rj75-hqrm-r3gf；eslint-plugin-vue 10.5.0 引入 parser 6.1.4，长 flat selector 可耗尽 CPU                                                                       | ESLint 开发/CI 路径可达，不属于生产包漏洞条目；源码输入受仓库权限控制                                                                                           | 兼容更新插件至 10.11.1，parser 7.1.6；不强制替换旧插件传递主版本                                                        | 全量 audit 0；lint、类型、82 单测/9 专项/16 E2E、构建通过                                                               |
| EP-SEC-016   | fixed | P2     | 高     | ICS TLS 客户端           | RUSTSEC-2026-0285 / GHSA-2mjx-qc3c-rqvc；rustls 0.23.32 接受跨加密层 TLS 1.3 握手消息                                                                              | 公共 ICS HTTPS/reqwest 链可达；握手 transcript 仍认证，不等同于能伪造握手，但违反消息加密边界并阻断安全门禁                                                     | 同兼容线定向 rustls 0.23.45、rustls-webpki 0.103.15                                                                     | 当前 1290 公告快照复扫该公告消失，漏洞/撤包 0；更新锁文件后 Rust 25/25、fmt/严格 Clippy 通过；最终NSIS构建/产物校验通过 |

## 6. 分域结论

### 正确性与可靠性

已检查主流程、模板创建、任务/成员/依赖状态、异常恢复与撤销；关闭历史项丢失、备份失败静默和锁中毒问题。单测及 E2E 通过。并发撤销与进程强制终止场景未做故障注入，保留为未知，不推断“绝无风险”。

### 安全与隐私

已检查 Tauri CSP/能力、输入/SQL 白名单、备份路径、ICS URL/DNS/跳转/代理/容量和日志。ICS 负例及静态证据证明校验地址固定到连接。10-06 新 npm 三根因已修复，严格 TLS 全量/生产扫描均 0；Rust 25 测试、严格 Clippy 与格式于本轮复验通过。官方当前 RustSec 快照确认漏洞/撤包0，新增 rustls 漏洞定向修复并复验；9条信息性警告仍保留。日历 URL 存设备 localStorage，备份/迁移不覆盖，隐私说明发布前复审。

### 数据与存储

检查 schema v5、外键/关系校验、导入事务回滚、备份安全快照及路径边界；修复缺表备份误判。JSON 导入支持 v1–v5；SQLite 原生备份恢复现明确只接受 v5。未进行真实断电或跨版本 SQLite `.db` 迁移演练。

### UI、无障碍与国际化

检查中英文文案、键盘/窗口标题栏、错误 `role=alert`、Light/Dark 和小窗口历史测试；16 项浏览器 E2E 覆盖主要页面及备份失败提示。真实屏幕阅读器、桌面/开始菜单/任务栏图标效果、macOS GUI 未在本轮复验。

### 构建、测试与发布

CI 和 release tag 均已接入前端、Rust、npm 与 RustSec 漏洞/撤包门禁；后者作为独立 Ubuntu job，先获取完整锁定依赖并以 `--deny yanked` 审计，release 构建依赖其通过。Windows x64 NSIS 新构建、产物非空与 SHA-256 已验证。远程新增 RustSec job 未运行，不能推断其实际结果。正式发布仍受未签名、MSI/macOS 本轮产物及干净机器矩阵未验收约束。构建大块警告仍开。

## 7. 最终验证

前端、Rust规范/25测试/Clippy、版本和Windows NSIS均于2026-10-06在最终Vue/rustls依赖状态执行。RustSec使用官方固定提交ef6173cbc5c50ec8166f9a5b28f07834144373ee（1290公告/546依赖）的归档快照；不冒充其Git元数据。

| 验证项           | 命令/证据                                                                                        | 结果               | 数量/摘要                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------- |
| 前端规范/类型    | `npm run lint`；`npm run typecheck`；Prettier                                                    | 通过               | 0 lint 错误/警告，0 类型错误；`checkJs` 覆盖测试、E2E、脚本                                          |
| 前端单测/性能    | `npm test -- --maxWorkers=2`；`npm run test:performance -- --maxWorkers=2`                       | 通过               | 82/82（新增 4 边界用例）；9/9 关键路径测试含原性能预算                                               |
| 浏览器回归       | `npm run test:e2e`                                                                               | 通过               | 16/16；包含备份失败提示                                                                              |
| 前端生产构建     | `npm run build`，NSIS 构建前再次执行                                                             | 通过但有警告       | 412 模块，2 个 >500 KB 资源块                                                                        |
| Rust 规范/测试   | `cargo fmt --check`；`cargo clippy --all-targets --locked -- -D warnings`；`cargo test --locked` | 通过               | 0 Clippy 警告；25/25 测试                                                                            |
| Windows 目标构建 | 10-06 最终Vue/rustls锁文件后 NSIS 构建；产物校验；Authenticode检查                               | 构建通过、签名缺失 | 5,115,687字节；SHA-256 `415C3C9DDA0A59B027274357A0F167FDB26FF68BEADCCB241040FEEF8ED1D894`；NotSigned |
| 发布/标准配置    | `npm run release:check`；UPARS 校验；YAML 解析；PowerShell/Python AST                            | 通过               | 版本 0.1.0；UPARS 1.1.0、6 域、11 字段；AST 错误 0                                                   |
| npm 安全         | 官方 npm 11.21.0 audit / audit --omit=dev，单进程实时 DNS，strict TLS                            | 通过               | 最新全量/生产所有等级 0、退出码均 0；原三个新根因全部消失                                            |
| Rust 安全        | cargo-audit0.22.2；官方ef6173cbc5c50ec8166f9a5b28f07834144373ee快照；--no-fetch --deny yanked    | 漏洞/撤包门禁通过  | 1290公告/546依赖，漏洞0、撤包0、退出码0、ignore=[]；7未维护/2unsound仍保留                           |

一次直接 `playwright test -g` 因未通过项目包装脚本启动 Vite 而报连接拒绝；随后使用项目标准 `npm run test:e2e` 完整复验 16/16。此环境操作失误不作为产品缺陷或最终测试失败。

## 8. 例外、未知与环境缺口

| 类型            | 内容                                                                                                       | 风险                                                | 责任/复查条件                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 供应链远程验证  | 本地 E 盘完整索引 RustSec 复扫已确认漏洞与撤包均为 0；新增 CI/release 门禁未在 GitHub Actions 上运行       | 远程环境的索引、网络与门禁结果尚无证据              | 提交后由发布负责人核对首次远程运行结果，失败则继续整改，不跳过安全 job                                 |
| Rust 信息性警告 | EP-SEC-006、EP-SEC-008、EP-SEC-009 共 9 条：7 未维护、2 潜在不安全；均保留在扫描结果中，未通过忽略 ID 消除 | 上游维护与特定 GTK/日志条件风险，当前目标可达性不同 | 项目维护者在正式发布前逐条复审、在下一次 Tauri/GTK/PHF 上游升级时迁移；新增 Linux 目标前先关闭对应告警 |
| npm 解析环境    | 默认 Windows 缓存仍指向异常 IP；单进程实时 DNS、官方域名/SNI/TLS 验证均保留，已成功完成两次官方扫描        | 系统异常未永久修复，普通命令可能仍失败              | 发布前用正常网络或同样严格验证路径重扫；不改系统代理/CA、不关闭 strict-ssl                             |
| 质量债          | EP-CODE-003 和 EP-BUILD-002；无阈值抑制或未经批准的 P2 例外                                                | 维护和加载性能                                      | 建议项目维护者在下一性能迭代量化并拆分；正式发布时间前复审体积                                         |
| 发布设备        | 仅构建本地 Windows NSIS；未实际安装/升级，MSI/macOS 和签名/公证未验证                                      | 不能证明用户机器可安全安装、迁移或回滚              | 发布负责人完成 `docs/RELEASING.md` 矩阵及签名后再发布                                                  |
| 标准同步        | 仓库 UPARS 1.1.0 已补充“建议补充通用标准”，已安装全局技能仍是 1.0.0，未在本任务写入全局目录                | 其他项目暂未自动继承新规则                          | 通用标准维护者获写入权限后将最小条款同步至全局版本，并运行其 `verify-standard.ps1`                     |
| 环境/文档       | Python Ruff不可用；WACAS无定义；Wolai已同步并读回；候选提交待保存                                          | 非核心代码门禁/源码追溯状态待完成                   | 提供WACAS定义；保存Git候选并核验远程，不把旧资产当本轮结果                                             |

## 9. 发布判定

- P0 未关闭：0；P1 未关闭：0；P2 未关闭或已接受：0。P3 未关闭：5（EP-CODE-003、EP-BUILD-002、EP-SEC-006、EP-SEC-008、EP-SEC-009）。
- 前端规范/类型、82单测/9专项/16 E2E、npm全量/生产0；Rustfmt/严格Clippy/25测试、当前RustSec漏洞/撤包0均通过。9条信息性与2项体积警告、远程CI仍待闭环。
- **代码层判定：暂不通过**。23项整改有复验证据；5项P3及相关信息性/体积警告未关闭或批准最窄例外，当前候选远程门禁待核验。
- **正式发布判定：不可发布**。签名/公证、各平台新产物、真实安装/升级/数据保留和回滚演练均尚未满足 `docs/RELEASING.md`。

## 10. 变更与证据索引

- 代码与门禁：`src-tauri/src/services/calendar_service.rs`、`src-tauri/src/services/data_service.rs`、`src-tauri/src/common/db_state.rs`、`src-tauri/src/db/`、`src/api/index.js`、`src/App.vue`、`tsconfig.json`、`e2e/smoke.spec.js`、`.github/workflows/ci.yml`、`.github/workflows/release.yml`、`package-lock.json`、`src-tauri/Cargo.lock`。RustSec 公告库与工具位于 E 盘被 Git 忽略的 `src-tauri/target/audit-tools`，未进入交付文件。
- 标准补充：`docs/audit/UNIVERSAL_PROJECT_AUDIT_STANDARD.md` 1.1.0、`docs/audit/AUDIT_REPORT_TEMPLATE.md`、`config/audit/audit-standard.json`、`scripts/verify-audit-standard.ps1`。适用场景为校验外部地址后再连接；风险为 DNS/跳转/代理使检查对象与连接目标分离；检查方法为沿每次连接追踪解析结果；通过条件为连接使用已校验目标或等价策略；验证方式为目标变化负例。已在本项目完成检查、整改和测试，标记为“建议补充通用标准”。
- 文档与续接：README、CONTRIBUTING、RELEASING、检查点与发布验收记录已更新；Wolai相关首发状态已同步并读回，Git候选待提交；用户数据未改。
- 余项安排：`docs/audit/EASYPROJECT_REMEDIATION_PLAN.md` 列明 5 项开放 P3、当前信息性警告与远程门禁及独立发布验收；不构成例外批准或远程验证结果。10-06 使用兼容 npm 11.21.0，Vitest 4.1.11、@types/node 22.20.5 和定向传递依赖补丁均通过前端回归；Vue/source-map-js/CSS解析依赖/rustls新告警亦已修复；本次没有新增通用标准条款。
