# EasyProject UPARS 审计续接检查点

- 记录日期：2026-09-13（Asia/Shanghai）
- 状态：审计报告已形成，本地整改与复验已完成；代码审计仍暂不判定通过，正式发布条件未满足。下方早期里程碑保留当时状态，最终状态以文末为准。
- 目标与范围：对 EasyProject 全部自有代码、配置、构建脚本、数据处理、接口、安全边界及发布流程执行代码审计、整改和复验，形成 UPARS 模板报告；同时遵守用户指定的额度续接规则。
- WACAS 版本：未定义/待确认。仓库搜索未发现 WACAS 标准或版本；本次审计实际使用仓库 UPARS 1.1.0，版本一致性已由脚本验证。
- 基线：`main`，`c0bb3220347f3978f547d0c4841156c648f2711a`；审计启动前工作区干净。
- 额度：本次查询显示主窗口已用 1%、次窗口已用 15%（分别剩余 99%、85%）；可用重置次数 0。暂停源于用户要求，不是触及 5% 门槛。额度数字会变化，恢复时必须重新查询。

## 未提交文件

以下为暂停前 `git status --porcelain=v1 -uall` 的完整清单；恢复时以重新核对的 Git 状态为准。`M` 为已跟踪文件修改，`??` 为新文件。

```text
 M .github/workflows/ci.yml
 M .github/workflows/release.yml
 M package-lock.json
 M package.json
 M src-tauri/src/common/db_state.rs
 M src-tauri/src/db/member_db.rs
 M src-tauri/src/db/mod.rs
 M src-tauri/src/db/plan_baseline_db.rs
 M src-tauri/src/db/project_db.rs
 M src-tauri/src/db/project_member_db.rs
 M src-tauri/src/db/task_db.rs
 M src-tauri/src/services/calendar_service.rs
 M src-tauri/src/services/data_service.rs
 M src-tauri/src/services/member_service.rs
 M src-tauri/src/services/project_service.rs
 M src-tauri/src/services/task_service.rs
 M src/App.vue
 M src/__tests__/api/crudAction.test.js
 M src/api/index.js
 M src/components/ResourceLoadPanel.vue
 M src/composables/useKeyboard.js
 M src/i18n/locales/en-US.js
 M src/i18n/locales/zh-CN.js
 M src/modules/calendar/components/CalendarSyncPanel.vue
 M src/modules/calendar/utils/ics.js
 M src/modules/dashboard/components/DashboardView.vue
 M src/modules/data/components/DataView.vue
 M src/modules/gantt/components/GanttView.vue
 M src/modules/task/components/ProjectList/ProjectList.vue
 M src/modules/task/components/TaskBoard.vue
 M src/modules/task/components/TaskList/TaskList.vue
 M src/router/index.js
?? config/audit/audit-standard.json
?? docs/audit/AUDIT_REPORT_TEMPLATE.md
?? docs/audit/UNIVERSAL_PROJECT_AUDIT_STANDARD.md
?? scripts/verify-audit-standard.ps1
?? tsconfig.json
?? AGENTS.md
?? docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md
```

## 已完成修改

- 日历订阅：对外部地址及每次跳转重新校验，将已校验 DNS 地址绑定到连接，禁用代理，限制响应读取为 5 MB，过滤请求错误中的 URL；增加私网、映射地址、跳转和容量测试。
- 数据与可靠性：撤销/重做仅在成功恢复后移除历史项；自动备份及历史操作失败会给出中英文可访问提示；分页参数及极端偏移处理；数据库互斥锁中毒由二次崩溃改为返回错误并增加测试。
- 编码规范与门禁：修复初始 15 条 Clippy 严格检查问题；新增 CI Clippy、前端 Vue/JS 类型检查及生产依赖审计；修复类型检查揭示的代码问题。
- 依赖与标准：更新锁文件中受影响的生产依赖；把缺失的仓库 UPARS 正文、模板、机器规则和校验脚本补入仓库，版本提升到 1.1.0，并补充可复用的“外部地址校验与实际连接绑定”要求。
- 本次新增项目级额度续接规则和本检查点；未提交、未推送、未更新 Wolai。

## 已执行验证及边界

- `npm.cmd test`：78 项通过；执行时间早于随后部分类型修复和依赖更新，需最终重跑。
- `npm.cmd run test:e2e`：15 项通过；执行时间早于随后部分类型修复和依赖更新，需最终重跑。
- `cargo test --locked`：20 项通过；执行时间早于新增分页、锁中毒和跳转测试，需最终重跑。
- `cargo clippy --all-targets --locked -- -D warnings`：最近一次通过；需要最终重跑。
- `npm.cmd run typecheck`：最近一次通过；需要最终重跑。
- `npm.cmd audit --omit=dev --audit-level=moderate`：更新生产依赖后为 0 项漏洞；最终需复查。
- `scripts/verify-audit-standard.ps1`：曾在 UPARS 1.0.0 时通过；标准升级至 1.1.0 后尚未复验。
- 更早的基线 `lint`、前端构建、发布元数据检查通过；最终改动后均未复验。Rust 目标平台安装包构建、真实设备/干净机器验收未完成。

## 未解决问题与下一步

- 未完成全文件发现登记、分域结论和统一模板审计报告；不能宣称 P0/P1 为零或代码审计通过。
- 开发测试依赖 Vitest 仍有 2 项中危告警；生产依赖查询为 0，不代表全依赖为 0。需评估定向升级至已修复版本并复验。
- Rust 依赖漏洞扫描工具未安装，尚无 RustSec 完整扫描结果；发布签名、跨平台安装包及干净机器验证仍缺证据。
- WACAS 版本未定义；如用户指的是另一标准，先取得准确名称/版本再更新检查点。
- 文档同步：仅本地仓库 UPARS 文件和本检查点有未提交修改；Wolai 未同步；正式审计报告尚未创建。
- 已确认的设备连接状态：本任务未检查设备连接；无已确认的真实设备或干净测试机在线状态。不得推断为已连接或已验收。

恢复时依次：①读取本检查点，查询额度并核对 `git status --porcelain=v1 -uall`、分支、基线及相关差异；②复验 UPARS 1.1.0 校验脚本，处理 Vitest 告警及其他未关闭问题；③完成剩余全量审计与发现登记；④重跑全部质量门禁、单元/端到端测试、构建和安全检查，修复新问题；⑤按统一模板写报告，明确代码审计与正式发布两个独立结论，并更新检查点和必要文档。不得把此前测试当作最终复验。

## 2026-09-13 恢复里程碑

- 已重新读取检查点与标准，核对 `main` 基线及全部未提交文件；Git 差异检查无空白错误。
- 仓库 UPARS 1.1.0 校验脚本已通过：`AUDIT_STANDARD_OK id=UPARS version=1.1.0 domains=6 findingFields=11`。
- 恢复时额度查询：主窗口剩余约 95%、次窗口约 84%，可用重置次数 0；进入高成本复验前检查点已保存。
- 定向升级 Vitest 至 4.1.11 的尝试被本机 npm 11.3.0 内部 `edgesOut` 错误中止，未改动 `package.json`；暂不以强制升级制造通过。下一步评估该开发期告警的实际可达性，并运行全部最终门禁与报告。

## 2026-09-13 质量门禁里程碑

- 恢复后 `cargo fmt --check`、严格 Clippy、`cargo test --locked`（24 项）、`npm run typecheck`、`npm run build`、`npm run release:check` 和 UPARS 1.1.0 校验通过。
- 前端构建仍报告两个大块警告（XLSX 940 KB、vendor 1,489 KB），不能记录为零警告；需在报告中评价。
- 首轮 `npm run lint` 发现 7 处本轮编辑产生的 Prettier 格式错误；已仅格式化涉及的 5 个文件，尚需重跑 Lint。
- 最新额度查询：主窗口剩余约 90%、次窗口约 83%，可用重置次数 0。下一步：重跑 Lint、前端单测/E2E/性能测试、依赖安全查询及其他语言门禁，再完成审计报告。

## 2026-09-13 回归与数据恢复里程碑

- 最终格式修复后 `npm run lint` 0 错误/警告，前端单测 78 项、性能基线 7 项和浏览器 E2E 15 项均通过。
- 新发现并整改备份预览将缺失数据表误记为 0 的风险：现在要求相容的 schema v5，缺表直接报错；Rust Clippy 0 警告，Rust 测试增加至 25 项并通过。
- 全量 npm 漏洞查询仅余开发测试链的 Vitest/@vitest/mocker 两项中危；生产依赖前次查询为 0，需最终再确认。Python 脚本 AST、PowerShell 校验脚本 AST 均通过；Python Ruff 不可用。
- 本节点额度剩余主窗口约 76%、次窗口约 81%，可用重置次数 0。下一步：尝试 Rust 依赖安全扫描和 Windows 目标构建，完成完整发现与发布判定报告。

## 2026-09-13 安装包与发布门禁里程碑

- 本地 Windows x64 NSIS 安装包构建成功：`src-tauri/target/release/bundle/nsis/EasyProject_0.1.0_x64-setup.exe`，5,116,355 字节，SHA-256 `A2D8FD7BCA4E2EF19BC964829C8185B52520AE8B5788CD22092CFCFAFF583508`；产物验证脚本通过，签名状态 `NotSigned`。未做真实安装/升级/卸载或用户数据保留复验。
- 发布 tag 的 `validate` job 已补齐前端、浏览器、Rust、依赖和 UPARS 门禁；YAML 解析及 Prettier 检查通过，远程 CI 尚未运行。
- RustSec `cargo-audit` 在临时目录安装的权限自动审核连续两次超时，未安装；Rust 依赖漏洞状态仍未知。全量 npm 查询余 2 项开发期中危，生产依赖最终复验进行中。
- 本节点额度工具返回“Could not read current usage limits”；不得据此推断额度充足或耗尽。上一成功查询为主窗口剩余约 76%、次窗口约 81%。下一步：完成审计报告与必要文档同步，复查 Git 差异和最终门禁结果。

## 2026-09-13 类型覆盖与提示复验里程碑

- 移除了测试目录的类型检查排除；新增 `e2e/test-globals.d.ts`，将 `src`、测试、`scripts`、`e2e` 和根配置纳入类型检查，当前 `npm run typecheck` 0 错误。测试中的 mock 类型已定向修正，不靠忽略规则通过。
- 新增自动备份失败的端到端回归用例。直接调用 Playwright 因未启动项目测试服务器而失败，已改用 `npm run test:e2e` 标准入口复验 16 项；结果待返回。`npm run lint` 再次通过。
- 额度查询再次不可用；按上一成功查询继续，仅进行报告和收尾验证，不执行重置或定时唤醒。

## 2026-09-13 最终报告与交接检查点

- 目标与范围：全量自有代码、配置、构建脚本、数据、接口、安全边界、UI/无障碍及发布流程的 UPARS 审计、整改和复验。基线仍为 `main` / `c0bb3220347f3978f547d0c4841156c648f2711a`，本轮未提交、未推送；审计输入为 161 个文件（137 文本、24 二进制），报告自身另计。
- 标准版本：仓库 UPARS 1.1.0，标准脚本最终通过（6 域、11 字段）；WACAS 未在仓库定义，不能臆定版本。
- 已完成修改：16 项发现中 P1 2、P2 10、P3 1 共 13 项已整改并按报告逐项复验；余 3 项 P3。报告位于 `docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md`。通用标准新增外部地址校验与实际连接绑定条款；全局已安装技能仍为 1.0.0，未改写工作区外文件。
- 最终测试及结果：ESLint 0 错误/警告、全源集类型检查 0 错误、前端单测 78/78、性能 7/7、E2E 16/16、Vite 构建通过但 2 项大块警告；Rustfmt/严格 Clippy 通过、Rust 测试 25/25；Windows x64 NSIS 产物构建及校验通过，但签名状态 `NotSigned`；生产 npm 审计 0 项，全量 npm 审计余 2 项开发期中危；UPARS 校验、发布检查、YAML/AST、`git diff --check` 通过。最终报告和标准模板已按 Prettier 格式化并复验标准脚本。
- 未解决问题：EP-CODE-003 复杂函数、EP-BUILD-002 大块资源、EP-SEC-004 开发依赖告警；RustSec 扫描未执行（临时安装 `cargo-audit` 的权限自动审核连续两次超时），远程 CI 尚未运行。代码审计暂不判定通过；正式发布尚缺签名、MSI/macOS 本轮产物及真实安装/升级/数据保留验收。
- 文档同步：本地 README、CONTRIBUTING、发布说明、UPARS 标准/模板/规则、审计报告和本检查点已更新；Wolai 未同步，Git 未提交/推送。
- 已确认设备连接状态：未检查真实设备或干净测试机的连接；不得推断在线或已完成设备验收。
- 额度：最终可用查询显示主窗口已用 59%（剩余 41%），次窗口已用 24%（剩余 76%），可用重置次数 0；高于 5% 安全门槛。未使用重置、未创建定时唤醒。

### 当前未提交文件

以下为最终 `git status --porcelain=v1 -uall`，恢复时仍须重新核对：

```text
 M .github/workflows/ci.yml
 M .github/workflows/release.yml
 M CONTRIBUTING.md
 M README.md
 M docs/RELEASING.md
 M e2e/smoke.spec.js
 M package-lock.json
 M package.json
 M src-tauri/src/common/db_state.rs
 M src-tauri/src/db/member_db.rs
 M src-tauri/src/db/mod.rs
 M src-tauri/src/db/plan_baseline_db.rs
 M src-tauri/src/db/project_db.rs
 M src-tauri/src/db/project_member_db.rs
 M src-tauri/src/db/task_db.rs
 M src-tauri/src/services/calendar_service.rs
 M src-tauri/src/services/data_service.rs
 M src-tauri/src/services/member_service.rs
 M src-tauri/src/services/project_service.rs
 M src-tauri/src/services/task_service.rs
 M src/App.vue
 M src/__tests__/api/crudAction.test.js
 M src/__tests__/project/ProjectWorkspace.test.js
 M src/__tests__/router/deepLinks.test.js
 M src/api/index.js
 M src/components/ResourceLoadPanel.vue
 M src/composables/useKeyboard.js
 M src/i18n/locales/en-US.js
 M src/i18n/locales/zh-CN.js
 M src/modules/calendar/components/CalendarSyncPanel.vue
 M src/modules/calendar/utils/ics.js
 M src/modules/dashboard/components/DashboardView.vue
 M src/modules/data/components/DataView.vue
 M src/modules/gantt/components/GanttView.vue
 M src/modules/task/components/ProjectList/ProjectList.vue
 M src/modules/task/components/TaskBoard.vue
 M src/modules/task/components/TaskList/TaskList.vue
 M src/router/index.js
?? AGENTS.md
?? config/audit/audit-standard.json
?? docs/audit/AUDIT_REPORT_TEMPLATE.md
?? docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md
?? docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md
?? docs/audit/UNIVERSAL_PROJECT_AUDIT_STANDARD.md
?? e2e/test-globals.d.ts
?? scripts/verify-audit-standard.ps1
?? tsconfig.json
```

准确下一步：在获准/已具备 `cargo-audit` 的环境运行 RustSec 锁文件扫描并处理结果；量化或拆分构建大块、复查开发期告警及复杂函数；运行新增远程 CI，并在目标平台完成签名和安装/升级/回滚矩阵。每一项关闭后更新报告、检查点与验证证据；正式发布前重新作独立判定。若用户要求 Wolai 同步，先确认可用连接和目标页面，再同步报告摘要。不要重复已完成的 78/7/16/25 项本地回归，除非后续代码或依赖发生变化。

## 2026-09-13 RustSec 补验启动检查点

- 用户明确允许安装 `cargo-audit`，附加约束为不得安装在 C 盘；本轮仅补齐 Rust 依赖安全扫描及其必要整改和报告更新，不启动新的发布动作。
- 已读取上述检查点，核对分支 `main`、基线 `c0bb3220347f3978f547d0c4841156c648f2711a` 与 47 个未提交文件，未发现外部新改动。仓库 UPARS 版本 1.1.0；WACAS 未定义；Wolai 仍未同步；未检查真实设备连接。
- 安装位置预定为已被 Git 忽略的 `E:\Project\Project\easy-project\src-tauri\target\audit-tools`，将下载缓存、编译目录、安装根目录和临时目录全部定向至此。现有 Rust 可执行文件及工具链在 D 盘；原系统临时目录在 C 盘，因此执行时必须覆盖 `TEMP`/`TMP`，绝不能使用默认临时目录。
- 进入高成本安装前的额度查询：主窗口已用 64%（剩余 36%）、次窗口已用 25%（剩余 75%），可用重置次数 0；高于 5% 门槛。若安装或扫描后额度降至 5% 以下，先保存检查点再暂停。
- 准确下一步：验证 E 盘路径后安装工具，执行锁文件扫描；若发现告警，评估生产可达性、按 P0–P3 分类并整改/复验；更新报告和本检查点，重新核对 Git 差异。所有工具写入限定在上述 E 盘已忽略目录，不提交工具文件。

## 2026-09-13 cargo-audit 安装里程碑

- `cargo-audit 0.22.2` 已成功安装于 `E:\Project\Project\easy-project\src-tauri\target\audit-tools\install\bin\cargo-audit.exe`。下载缓存、编译目录、安装根和临时目录均定向于同一 E 盘已忽略目录；`git check-ignore` 已确认工具文件不会进入提交，当前未提交文件数仍为 47。未在 C 盘安装该工具。
- 本节点额度查询工具返回暂时无法读取；上一成功结果为主窗口剩余 36%、次窗口剩余 75%，不据此推断当前额度。未使用重置。标准仍为 UPARS 1.1.0，WACAS 未定义；Wolai 与设备连接状态均未变化。
- 准确下一步：使用此 E 盘可执行文件审计 `src-tauri/Cargo.lock`，完整保存警告分类与扫描结果；如需联网更新 RustSec 数据库，同样将数据库/临时文件定向至 E 盘。再按结果更新报告和结论。

## 2026-09-13 RustSec 数据库获取受阻检查点

- `cargo-audit 0.22.2` 安装已完成并验证位置；`git check-ignore` 确认 E 盘工具目录不会进入版本控制。工具和缓存、编译、临时目录均位于 `E:\Project\Project\easy-project\src-tauri\target\audit-tools`；C 盘未安装工具。当前未提交文件仍为此前登记的 47 项，未改动应用源码或锁文件。
- 运行目标：`cargo-audit audit --file src-tauri/Cargo.lock --db E:\Project\Project\easy-project\src-tauri\target\audit-tools\advisory-db`。默认权限无法连接 GitHub RustSec 公告库；两次联网提权的自动审核均超时，命令未获授权运行，公告库仍不存在，故无扫描结果、不得记为 0 漏洞。审计报告已按实际状态更新，代码审计暂不通过、正式发布不可用的结论不变。
- 额度查询本节点再次不可用；最后一次成功查询为主窗口剩余 36%、次窗口剩余 75%，重置次数 0。本轮未重置、未设定唤醒。仓库标准仍 UPARS 1.1.0；WACAS 未定义；Wolai 未同步；设备连接状态未检查。
- 准确下一步：在网络权限审核可完成的环境中运行上述 E 盘工具，或由项目维护者把官方 RustSec `advisory-db` 提供到上述 E 盘路径，再用 `--no-fetch` 扫描。若发现公告，逐条确定影响与可达性、整改并复验，然后更新审计报告和检查点；不要重做未受影响的本地回归。

## 2026-09-13 RustSec 公告库重试前检查点

- 用户要求重试；范围仍仅为 E 盘已安装工具的公告库获取、Rust 锁文件扫描及必要整改。`main` 和基线提交未变，未提交文件仍为 47 项；工具存在，E 盘 `advisory-db` 尚不存在。标准 UPARS 1.1.0、WACAS 未定义、Wolai 未同步、设备连接未检查，均与上一检查点相同。
- 进入联网阶段前额度工具再次返回暂时无法读取；最后一次成功查询为主窗口剩余 36%、次窗口剩余 75%，重置次数 0。本轮不使用重置或定时唤醒。
- 准确下一步：仅将官方 GitHub RustSec 公告库克隆到 `E:\Project\Project\easy-project\src-tauri\target\audit-tools\advisory-db`，系统临时目录定向 E 盘。成功后用 `--no-fetch` 扫描 `src-tauri/Cargo.lock`；失败则如实记录，不能推断漏洞为零。

## 2026-09-13 RustSec 公告库获取里程碑

- `https://github.com/RustSec/advisory-db.git` 已成功浅克隆至 E 盘已忽略目录 `src-tauri/target/audit-tools/advisory-db`，配置中的 `origin` 指向官方仓库，`crates` 公告目录存在；没有更改应用源码或锁文件。由于联网提权进程与当前进程的 Windows 文件所有者不同，普通 Git 命令把该新仓库视为 `unsafe repository`；不得因此修改用户全局 Git 配置或使用通配符忽略。
- 本里程碑额度查询显示主窗口已用 80%（剩余 20%）、次窗口已用 28%（剩余 72%），重置次数 0；仍高于 5% 门槛。仓库标准 UPARS 1.1.0、WACAS 未定义、Wolai 未同步、设备未检查，均未变化。
- 准确下一步：优先用已安装 E 盘工具加 `--no-fetch` 扫描 `src-tauri/Cargo.lock`；若因所有者校验失败，只设置进程级、针对该精确 E 盘路径的 Git 安全配置，不写全局配置。按扫描结果更新报告、整改与复验。

## 2026-09-13 RustSec 首轮扫描里程碑

- 使用 E 盘 `cargo-audit 0.22.2` 和 E 盘官方公告库（1243 条）扫描 `src-tauri/Cargo.lock` 的 546 个依赖。加 `--no-fetch --no-yanked` 的结构化复验稳定得到 8 条漏洞记录：`bytes 1.10.1` 1 条、`quick-xml 0.38.3` 2 条、`rustls-webpki 0.103.6` 4 条、`time 0.3.44` 1 条；另有 7 条未维护警告与 6 条潜在不安全警告。扫描退出码 1，不得判定通过。
- 首次不加 `--no-yanked` 时，E 盘独立 Cargo 索引缺少大部分项目依赖，撤包检查报大量“索引无此 crate”，故当前只确认 RustSec 漏洞/警告扫描，撤包状态未验证。没有忽略安全公告；`--no-yanked` 仅隔离离线索引缺口。
- 本节点额度查询工具再次不可用；最后成功值为主窗口剩余 20%、次窗口剩余 72%，可用重置次数 0。标准 UPARS 1.1.0、WACAS 未定义、Wolai 未同步、设备连接未检查、未提交文件 47 项，均无变化。
- 准确下一步：查看四个受影响 crate 的依赖来源与受支持路径，优先定向更新可兼容修复版本并复验；`quick-xml` 若受上游版本约束，分析调用可达性与上游升级路径。同步更新审计报告、finding 编号/级别和代码层结论。若额度查询恢复且剩余≤5%，先保存检查点暂停。

## 2026-09-13 RustSec 漏洞整改里程碑

- 新增唯一受控代码变更 `src-tauri/Cargo.lock`：定向更新 `bytes 1.11.1`、`rustls-webpki 0.103.13`、`time 0.3.47`，并把依赖 `quick-xml` 的 `plist 1.8.0` 升至兼容的 `plist 1.10.0`、`quick-xml 0.41.0`。Cargo 为解析锁文件同步更新了少量传递依赖；没有改动 Rust 源码。重新用 E 盘公告库和 `--no-fetch --no-yanked` 扫描，8 条漏洞降为 0，退出码 0；仍有 7 条未维护和 6 条潜在不安全警告，未隐藏。
- D 盘现有 Cargo 索引缺少部分新版本，E 盘安装工具的独立索引又缺少项目旧依赖；已把 D 盘索引中缺失的 704 个缓存条目仅复制到 E 盘已忽略目录，未写 D/C 盘。后续编译若缺源码缓存，可同样只复制既有压缩缓存至 E，必要时再联网下载缺失 crate。
- 本节点额度工具持续不可用；最后成功结果为主窗口剩余 20%、次窗口剩余 72%，重置次数 0，不能据此推断当前值。标准、WACAS、Wolai 和设备状态不变；未提交文件增加为 48 项（新修改的 `Cargo.lock`）。
- 准确下一步：检查 13 条 RustSec 信息性警告的可达性/可修复性，运行 `cargo test --locked`、严格 Clippy、目标构建及 RustSec 复扫；将新发现、整改证据和残余风险纳入报告。额度若恢复且≤5%，先保存检查点并暂停。

## 2026-09-13 RustSec 警告处理与额度恢复里程碑

- RustSec 结构化复扫确认漏洞 0，仍列 7 条未维护、6 条潜在不安全警告；其中 `anyhow 1.0.100` 已更新到 1.0.103，`rand 0.8.5` 到 0.8.6，`rand 0.9.2` 到 0.9.3。旧 `rand 0.7.3` 由跨版本 PHF 生成链引入，公告仅在自定义日志器调用线程 RNG 的特定条件触发；其余警告继续逐项核对，不隐瞒。
- 新额度查询可用：主窗口已用 18%（剩余 82%）、次窗口已用 31%（剩余 69%），可用重置次数 0；未用重置。Git 分支、基线、WACAS、Wolai、设备状态仍同前，当前源码唯一新增改动是 `src-tauri/Cargo.lock`。
- 准确下一步：获取 `event-listener 5.4.2` 的官方索引和 crate，继续定向更新；再运行全套 Rust 规范、测试和构建以及安全复扫，并更新报告结论。所有下载、缓存、编译和临时文件继续只写 E 盘已忽略目录。

## 2026-09-13 Rust 复验前检查点

- 更新 `anyhow 1.0.103`、`rand 0.8.6`、`rand 0.9.3` 后 RustSec 复扫仍为 0 漏洞，信息性警告降至 10 条（7 未维护、3 潜在不安全）。`event-listener 5.4.2` 的在线元数据更新获准后长时间无进展，已中断等待；锁文件未包含该升级。未关闭警告需按目标平台和触发条件分类，不得忽略。
- E 盘 Cargo 索引已合并 D 盘既有缓存中缺失的条目，E 盘 crate 压缩缓存也仅复制了 D 盘既有的 438 个缺失压缩包；未写入 D 或 C 盘。所有新增项目变更仍仅为 `src-tauri/Cargo.lock`（报告/检查点更新另计）。
- 进入高成本 Rust 编译前额度查询：主窗口已用 29%（剩余 71%）、次窗口已用 33%（剩余 67%），重置次数 0。标准 UPARS 1.1.0；WACAS 未定义；Wolai 未同步；设备未检查。
- 准确下一步：先在 E 盘 Cargo 缓存下运行离线 Rust 单测/Clippy/Windows 构建；若缺少具体新 crate，仅从官方来源定向获取到 E 盘，再复验。随后更新审计报告中的 RustSec 漏洞整改 finding、残余警告和两个发布结论。

## 2026-09-13 Rust 本地回归里程碑

- 只向 E 盘 Cargo 缓存定向下载了 Windows 编译缺失的 `anyhow 1.0.103`、`rand 0.8.6` 和 `rand 0.9.3`；`cargo test --locked --offline` 25/25 通过，`cargo fmt --check` 与 `cargo clippy --all-targets --locked --offline -- -D warnings` 均通过。公告复扫仍为漏洞 0、信息性警告 10；`--no-yanked` 隔离的撤包状态尚待检查。
- `event-listener` 的官方元数据更新虽然获联网权限，但长时间无进展而已中断；当前 5.4.1 位于非 Windows 目标依赖链，须在报告中评估其余目标可达性，不得假称已升级。代码层最终判定仍待发行构建和报告更新。
- 进入 Windows NSIS 发布构建前额度查询：主窗口已用 37%（剩余 63%）、次窗口已用 34%（剩余 66%），重置次数 0；高于 5% 门槛。UPARS 1.1.0、WACAS 未定义、Wolai 未同步、设备连接未检查状态均不变。未提交文件保持 48 项（含新改 `Cargo.lock`）。
- 准确下一步：使用 E 盘缓存/临时目录构建 Windows NSIS 并核对新产物；随后将 8 条已修复漏洞与 10 条剩余警告的证据逐项登记报告，复验格式和标准脚本。

## 2026-09-13 Rust 发布构建里程碑

- 更新锁文件后 `cargo test --locked --offline` 25/25、Rustfmt 和严格 Clippy 均通过；`npm run tauri -- build --bundles nsis` 成功并重跑前端生产构建，仍有原有的 2 项大块警告。新安装包 `src-tauri/target/release/bundle/nsis/EasyProject_0.1.0_x64-setup.exe` 为 5,115,139 字节，SHA-256 `1CD3A2CA32E0068A56B6A88342E63072F528D62242514728262E547DA5BC40B8`，产物校验脚本通过，签名仍为 `NotSigned`；未做真实安装/升级/卸载。所有 Cargo 下载、构建、缓存和临时文件均在 E 盘。
- `git diff --check` 仅报告 `Cargo.lock` 行尾将来可能由 Git 转换的提示，不是空白错误；本轮源码变更仍为锁文件。RustSec 漏洞复扫 0，信息性警告 10。额度工具本节点不可用，最后可确认额度为主窗口剩余 63%、次窗口剩余 66%，重置次数 0；不得当成当前读数。
- UPARS 1.1.0、WACAS 未定义、Wolai 未同步、设备连接未检查状态不变。准确下一步：分组登记 10 条警告与目标平台/触发条件，新增锁文件漏洞整改 finding，更新报告统计、当前产物信息和代码/发布结论，最后复查一致性。

## 2026-09-13 撤包状态核查前检查点

- 已把 RustSec 8 条已修复漏洞登记为 EP-SEC-005（P2 fixed），余 10 条信息性警告按 EP-SEC-006 至 EP-SEC-009 分组登记为 P3 open；报告现为 21 项（P1 2、P2 11、P3 8），已整改 14、P3 未关闭 7。CI 与 release 新增独立 Ubuntu RustSec job，发布构建依赖该 job；YAML 解析和仓库 UPARS 1.1.0 校验通过，远程未运行。`docs/RELEASING.md` 已声明漏洞门禁与撤包状态缺口。
- 新 RustSec 公告库源为官方 `https://github.com/RustSec/advisory-db.git`，E 盘仓库 HEAD `b50980aad8b8f14f77e25a97b32dd94bf008b0af`；漏洞扫描 0，仍用 `--no-yanked` 因索引不全。报告与检查点本地更新，未提交/推送，Wolai 未同步，设备连接未检查；WACAS 未定义。
- 进入全目标 Cargo 元数据/撤包状态核查前的额度查询：主窗口已用 62%（剩余 38%）、次窗口已用 38%（剩余 62%），重置次数 0；高于 5% 门槛。所有新增缓存和临时文件仍只写 E 盘已忽略目录，不在 C 盘安装。
- 准确下一步：在 E 盘 Cargo 缓存执行全目标 `cargo fetch --locked`，然后不用 `--no-yanked` 复跑 RustSec。若发现撤包版本，按实际影响整改/复验；若工具仍无法完整核查，报告保留未知。最后复核报告统计、标准脚本、Git 差异和额度。

## 2026-09-14 额度恢复与全目标缓存续接检查点

- 用户要求额度恢复后继续。已重读本检查点并核对 `main` / `c0bb3220347f3978f547d0c4841156c648f2711a`，仍有 48 项未提交文件；具体清单见此前“当前未提交文件”47 项，另新增 `M src-tauri/Cargo.lock`。报告为 21 项发现、14 已整改、7 项 P3 未关闭；RustSec 漏洞 0、信息性警告 10。UPARS 1.1.0；WACAS 未定义/待确认；Wolai 未同步；未检查设备连接。
- 前一轮全目标 `cargo fetch --locked` 会话已结束且无法读取最终输出；实际离线复核显示 E 盘缓存已有 945 个 crate 压缩包，但还缺 `windows_x86_64_gnu 0.53.0`，不能宣称全目标缓存完成。此前 Rust 25/25、严格 Clippy、Windows NSIS 和安装包哈希仍有效，锁文件未变，不重做。
- 本节点额度查询：主窗口已用 4%（剩余 96%）、次窗口已用 45%（剩余 55%），可用重置次数 0；高于 5% 门槛。所有新缓存和临时文件继续仅写项目 E 盘已忽略目录，不在 C 盘安装。
- 准确下一步：从 E 盘缓存断点继续 `cargo fetch --locked`，直至 `--offline` 复核通过；随后不用 `--no-yanked` 运行 RustSec 并处理撤包结果，更新报告、检查点与验证证据。若外部网络不稳定，只记录客观缺口，不推断安全。

## 2026-09-14 完整 RustSec 扫描里程碑

- 全目标 Cargo 缓存已补齐至 E 盘，`cargo fetch --locked --offline` 退出码 0。随后不使用 `--no-yanked` 的 RustSec 扫描完整结束、退出码 0、索引错误 0：已知漏洞 0，信息性警告为未维护 7、潜在不安全 3、撤包 1。唯一撤包依赖为 `tray-icon 0.21.1`，不能继续写作“撤包状态未知”或“撤包 0”；审计报告待更新。
- 标准仍 UPARS 1.1.0，WACAS 未定义/待确认；`main` 基线与 48 项未提交文件未变，本轮先前完成的 Rust 25/25、Clippy、Windows NSIS 结果仍对应更新 `tray-icon` 之前的锁文件。Wolai 未同步；设备连接未检查。
- 本节点额度查询：主窗口已用 16%（剩余 84%）、次窗口已用 46%（剩余 54%），重置次数 0，高于 5% 门槛；未使用重置或定时唤醒。
- 准确下一步：追踪 `tray-icon` 的上游约束，若有兼容非撤包版本则定向更新，复扫并重跑 Rust 单测、严格 Clippy 与 Windows NSIS 构建；如无兼容修复，按 P2 记录负责人、风险控制及截止时间，不放行正式发布。随后更新报告统计与新产物哈希。

## 2026-09-14 撤包整改与高成本复验前检查点

- 目标与范围：续接 EasyProject 全项目 UPARS 代码审计、整改和复验；本阶段只处理 Rust 锁文件的撤包依赖、CI/release 安全门禁及对应报告，不重做已完成的前端审计。实际适用标准 UPARS 1.1.0；WACAS 未定义/待确认。分支 `main`，基线提交 `c0bb3220347f3978f547d0c4841156c648f2711a`。
- 已完成：官方索引确认 `tray-icon 0.21.1` 已撤回，在 Tauri 2.8.5 的 `^0.21` 约束下定向更新到 `0.21.3`；完整 RustSec 复扫（不使用 `--no-yanked`）为已知漏洞 0、撤包 0、未维护 7、潜在不安全 3。CI 与 release 的 RustSec job 已增加 `cargo fetch --locked`，随后执行完整 `cargo audit`，超时上限 60 分钟；发布说明已同步。此前 Rust 25/25、严格 Clippy 和 NSIS 构建是这次锁文件变更之前的结果，必须重跑。
- 当前全部 48 项未提交文件：`.github/workflows/ci.yml`、`.github/workflows/release.yml`、`CONTRIBUTING.md`、`README.md`、`docs/RELEASING.md`、`e2e/smoke.spec.js`、`package-lock.json`、`package.json`、`src-tauri/Cargo.lock`、`src-tauri/src/common/db_state.rs`、`src-tauri/src/db/member_db.rs`、`src-tauri/src/db/mod.rs`、`src-tauri/src/db/plan_baseline_db.rs`、`src-tauri/src/db/project_db.rs`、`src-tauri/src/db/project_member_db.rs`、`src-tauri/src/db/task_db.rs`、`src-tauri/src/services/calendar_service.rs`、`src-tauri/src/services/data_service.rs`、`src-tauri/src/services/member_service.rs`、`src-tauri/src/services/project_service.rs`、`src-tauri/src/services/task_service.rs`、`src/App.vue`、`src/__tests__/api/crudAction.test.js`、`src/__tests__/project/ProjectWorkspace.test.js`、`src/__tests__/router/deepLinks.test.js`、`src/api/index.js`、`src/components/ResourceLoadPanel.vue`、`src/composables/useKeyboard.js`、`src/i18n/locales/en-US.js`、`src/i18n/locales/zh-CN.js`、`src/modules/calendar/components/CalendarSyncPanel.vue`、`src/modules/data/components/DataView.vue`、`src/modules/dashboard/components/DashboardView.vue`、`src/modules/gantt/components/GanttView.vue`、`src/modules/calendar/utils/ics.js`、`src/modules/task/components/ProjectList/ProjectList.vue`、`src/modules/task/components/TaskBoard.vue`、`src/modules/task/components/TaskList/TaskList.vue`、`src/router/index.js`、`AGENTS.md`、`config/audit/audit-standard.json`、`docs/audit/AUDIT_REPORT_TEMPLATE.md`、`docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md`、`docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md`、`docs/audit/UNIVERSAL_PROJECT_AUDIT_STANDARD.md`、`e2e/test-globals.d.ts`、`scripts/verify-audit-standard.ps1`、`tsconfig.json`。
- 未解决：7 项 P3、RustSec 信息性告警 10 条、前端大块警告 2 条、远程 CI 未运行、MSI/macOS 及干净机安装/升级/签名未验；本报告尚未登记 `tray-icon` 新 finding 和新构建证据。Wolai 未同步；设备连接状态未检查，不能推定在线。
- 进入高成本复验前额度：主窗口剩余 74%、次窗口剩余 52%，重置次数 0；高于 5% 门槛。未使用重置、未建立唤醒；所有 Cargo 缓存/编译/临时文件继续只放在 E 盘项目已忽略目录，不在 C 盘安装。
- 准确下一步：先对更新后的锁文件运行离线 `cargo fetch --locked`、Rustfmt、25 项 Rust 测试与严格 Clippy，再构建 Windows x64 NSIS 并记录大小/哈希/签名；更新 EP-SEC-010、报告统计、两个独立结论和本检查点，最后复核工作流语法、UPARS 标准脚本、Git 差异及额度。

## 2026-09-14 审计最终本地复验检查点

- 目标与范围：EasyProject 全自有代码、配置、数据/接口/安全边界及发布流程的 UPARS 审计整改已完成本地可执行部分；实际标准 UPARS 1.1.0，WACAS 未定义/待确认。基线仍为 `main` / `c0bb3220347f3978f547d0c4841156c648f2711a`；未提交文件仍为上一节逐项列出的全部 48 项，`git status --porcelain=v1 -uall` 已复核，无新增路径。未提交、未推送。
- 已完成修改与结果：`src-tauri/Cargo.lock` 的 `tray-icon` 0.21.1→0.21.3；CI/release RustSec job 先 `cargo fetch --locked` 再 `cargo audit --deny yanked`，并调整超时至 60 分钟；`docs/RELEASING.md`、审计报告已同步。完整本地 RustSec 以 E 盘官方数据库 `--no-fetch --deny yanked` 扫描：漏洞 0、撤包 0、未维护 7、潜在不安全 3，退出码 0；既有 P3 不忽略。报告现在 22 项：P0 0、P1 2、P2 12、P3 8，15 项已整改复验、7 项 P3 开放。
- 复验：E 盘缓存 `cargo fetch --locked --offline`、`cargo fmt --check`、Rust 测试 25/25、严格 Clippy 均通过；Windows x64 NSIS 构建与前端生产构建通过（仍有两项大块警告）。安装包 5,114,576 字节，SHA-256 `126E3DF619C1FBFE41662E2CE16492D9889E2E29BB13E6D44A68DB6A1E642C43`，签名 `NotSigned`；产物校验、`npm run release:check`、两份 YAML 解析、Prettier、UPARS 1.1.0 校验及 `git diff --check` 均通过。`git diff --check` 只产生 Cargo.lock 将来 LF/CRLF 转换提示，无空白错误。本次锁文件修改之后未重跑未受影响的前端单测/性能/E2E，其此前结果为 78/78、7/7、16/16。
- 未解决问题/风险：EP-CODE-003、EP-BUILD-002、EP-SEC-004、EP-SEC-006 至 EP-SEC-009 共 7 项 P3；RustSec 信息性告警 10 条；大块警告 2 条；新增远程 CI 未运行；MSI/macOS、签名/公证及干净机器安装、升级、回滚未验。代码审计暂不通过，正式发布不可用，详见报告独立结论。
- 文档与设备：报告和本地发布说明已更新；Wolai 未同步，未更改外部文档。设备连接状态未检查，不能断言连接；真实安装/桌面 UI 未执行。Cargo 工具、索引、缓存、构建和临时文件均位于 E 盘项目已忽略目录，未在 C 盘安装。额度主窗口剩余 54%、次窗口剩余 49%，可用重置次数 0，未使用重置或定时唤醒。
- 准确下一步：若用户要求继续正式发布准备，先读此检查点并核对 48 项 Git 状态、报告与产物；提交后核验 GitHub CI/release 首次远程运行，再由发布负责人完成 MSI/macOS、签名和干净机器安装/升级/回滚矩阵。P3 与信息性告警依报告处理；不要误报为本轮已验证，也不要重做未受影响的本地审计。

## 2026-09-14 审计余项整改启动与复验前检查点

- 目标与范围：用户要求开始安排上一轮 UPARS 审计的整改；先处理可本地关闭的 P3，再形成其余问题的责任、顺序与验收安排。实际标准 UPARS 1.1.0，WACAS 未定义/待确认。基线仍为 `main` / `c0bb3220347f3978f547d0c4841156c648f2711a`；`git status --porcelain=v1 -uall` 核对后未提交文件仍为上一节逐项列出的 48 项，未新增路径。此前整改与完整报告保持原状，未提交/推送。
- 本轮已完成：按原报告 EP-SEC-007 定向把 `src-tauri/Cargo.lock` 中 `event-listener` 5.4.1 升至 5.4.2；E 盘官方 RustSec 复扫已知漏洞 0、撤包 0、未维护 7、潜在不安全从 3 降至 2，扫描退出码 0。该 crate 压缩包尚未进入 E 盘缓存，`cargo fetch --locked --offline` 因缺此包失败；不能先标记 finding fixed。其它 6 项 P3、远程 CI、真实发布验收仍未处理。
- 测试/文档/设备：先前 25 项 Rust 测试、Clippy、NSIS 安装包只适用于此次锁文件更新前；本轮尚未重跑。审计报告尚未调整 EP-SEC-007 状态与统计；Wolai 未同步；设备连接状态未检查，不能推定在线。Cargo 目录/缓存/临时文件继续限制在 E 盘项目已忽略目录，未在 C 盘安装。
- 额度检查：主窗口剩余 42%、次窗口剩余 47%，重置次数 0，均高于 5% 门槛；未使用重置或定时唤醒。
- 准确下一步：仅将 `event-listener 5.4.2` 下载到 E 盘 Cargo 缓存，然后离线 Rustfmt、测试、严格 Clippy、RustSec 复扫和 Windows NSIS 构建；通过后更新 EP-SEC-007 及报告统计。随后为其它余项编排本地整改、上游依赖和外部发布验收的顺序，明确哪些需要用户决定，保存新的检查点。

## 2026-09-14 审计余项整改安排里程碑

- 目标与范围：已按用户要求启动审计余项整改，关闭可局部修复的 EP-SEC-007，并为其余 6 项 P3 与正式发布验收形成 `docs/audit/EASYPROJECT_REMEDIATION_PLAN.md`。实际标准 UPARS 1.1.0，WACAS 未定义/待确认。分支 `main`、基线 `c0bb3220347f3978f547d0c4841156c648f2711a` 不变。
- 当前全部未提交文件：上一节逐项列出的 48 项均仍未提交，另新增 `docs/audit/EASYPROJECT_REMEDIATION_PLAN.md`，合计 49 项；`git status --porcelain=v1 -uall` 已复核。未提交、未推送、未更改用户应用数据。
- 已完成修改：锁文件 `event-listener` 5.4.1→5.4.2；EP-SEC-007 在报告中改为 fixed。报告共 22 项（P0 0、P1 2、P2 12、P3 8），16 项已整改复验、6 项 P3 保留。余项安排按开发依赖、复杂度、前端体积和上游 Rust 链排序，列明角色、关闭条件及与正式发布独立的 CI/签名/设备验收；未代用户批准例外或设定未经核对的发布日期。
- 复验：E 盘 `cargo fetch --locked --offline`、Rustfmt、Rust 测试 25/25、严格 Clippy 通过；完整 RustSec 复扫漏洞 0、撤包 0、未维护 7、潜在不安全 2，退出码 0；Windows x64 NSIS 和产物校验通过。最新安装包 5,117,545 字节，SHA-256 `47499C2E8B7BE07896C1AB7D4AC0FADF33259937F650694AFA806AB14801866B`，仍为 `NotSigned`。报告 finding 统计唯一性校验 22/16/6、UPARS 校验与 `git diff --check` 均通过；Linux 目标未编译，前端单测/E2E 本轮未因纯锁文件改动重复执行。Cargo.lock 仅有非失败的 LF/CRLF 提示。
- 未解决问题：EP-CODE-003、EP-BUILD-002、EP-SEC-004、EP-SEC-006、EP-SEC-008、EP-SEC-009 共 6 项 P3；RustSec 信息性告警 9 条、前端大块警告 2 条；远程 CI、MSI/macOS、签名/公证、干净机器安装/升级/回滚尚未验证。代码审计仍暂不通过，正式发布仍不可用。
- 文档/设备/额度：本地报告、整改安排和检查点已更新；Wolai 未同步。设备连接未检查，不能断言在线。Cargo 工具、缓存、构建、临时目录均留在 E 盘项目已忽略目录，未在 C 盘安装。额度主窗口剩余 27%、次窗口剩余 45%，可用重置次数 0，未使用重置或建立定时唤醒。
- 准确下一步：恢复时先核对本检查点、49 项 Git 状态与报告；依整改安排顺序 1，在 E 盘缓存环境尝试把 Vitest/@vitest/mocker 升至修复版并运行全量前端门禁。若 npm 工具仍报 `edgesOut`，记录错误后换兼容包管理器，不手工篡改锁文件或使用 `--force`；结果未验证前 EP-SEC-004 保持 open。后续再逐项处理复杂度、体积和 Tauri/GTK/PHF 上游链；远程/设备验收不得提前标记完成。

## 2026-10-06 Vitest 升级前检查点

- 目标与范围：按用户授权执行整改安排的下一步 EP-SEC-004，定向升级 Vitest 并完成前端验证。实际标准 UPARS 1.1.0；WACAS 未定义/待确认。基线 `main` / `c0bb3220347f3978f547d0c4841156c648f2711a`，已重读前一检查点并核对 Git。
- 全部未提交文件为此前列明的 49 项加 `docs/PROJECT_PLAN.md`（2026-09-25 仅登记悬浮窗候选需求），共 50 项；没有新增源码变更。此前已完成 16 项整改、6 项 P3 开放；已有测试结果仍为历史记录，不冒充本轮结果。
- 已检查：当前 Node 24.0.0、npm 11.3.0、Vitest 锁定 3.2.7；官方 npm 元数据确认 4.1.11 兼容 Node 24/Vite 6。普通网络读取长时间无输出已中断；获准网络读取后成功。尚未升级或执行本轮测试。
- 未解决：EP-SEC-004 及另外 5 项 P3；RustSec 信息性警告 9 条、构建大块警告 2 条；远程 CI、签名、多平台及真实安装/升级/回滚仍未验。Wolai 未同步；设备连接未检查；悬浮窗不进入本次开发。
- 进入依赖安装前额度：主窗口剩余 94%、次窗口剩余 76%，重置次数 0，高于 5% 门槛。npm 缓存与临时目录使用 E 盘 `src-tauri/target/audit-tools` 已忽略目录，不在 C 盘安装；不使用重置或定时唤醒。
- 准确下一步：以 E 盘缓存中的 npm 10 定向安装 `vitest 4.1.11`，检查包与锁文件差异，运行 lint、类型、全部单测、性能基线、E2E、生产构建与 npm 审计；失败则修复兼容问题并保留原测试要求。通过后更新报告、整改安排和检查点。

## 2026-10-06 Vitest 安装完成与回归前检查点

- 目标/范围/标准/基线保持上一节：EP-SEC-004；UPARS 1.1.0；WACAS 未定义/待确认；`main` / `c0bb3220347f3978f547d0c4841156c648f2711a`。全部未提交文件仍为既有 50 项（此前清单 49 项加 `docs/PROJECT_PLAN.md`），新增修改仅在已有 `package.json`、`package-lock.json` 中，未提交/推送。
- npm 10.9.4 同样报 `edgesOut`；`--prefer-dedupe` 未解决。npm 最新 12.2.0 要求更高 Node，未用它安装项目。改用兼容的最新 npm 11 后定向安装成功：Vitest/@vitest/mocker 声明、锁定、安装版本均为 4.1.11，Vite 仍为 6.4.3；新增 3、删除 12、更新 13 个包。所有工具/缓存/临时目录在 E 盘项目已忽略目录。npm 提示 esbuild 的安装脚本未获 allowScripts 覆盖，后续通过测试/构建确认实际可用性，不忽略失败。
- 本轮回归与 npm 审计尚未执行；EP-SEC-004 暂仍 open，其它 5 项 P3 和发布缺口保持原状。Wolai 未同步、设备连接未检查；悬浮窗仅记录。
- 进入完整前端门禁前额度：主窗口剩余 85%、次窗口剩余 75%，重置次数 0，高于 5% 门槛；未重置或建立唤醒。
- 准确下一步：运行 lint/类型、全部单测、性能、E2E、Vite 构建、版本检查及全量/生产 npm 审计；修复升级引入的兼容问题。全部通过再关闭 finding、更新报告统计和整改安排，并保存检查点。

## 2026-10-06 前端整改复验与安装包构建前检查点

- 目标与范围：EP-SEC-004 升级和相关供应链复验；实际标准 UPARS 1.1.0，WACAS 未定义/待确认。基线仍为 `main` / `c0bb3220347f3978f547d0c4841156c648f2711a`。全部未提交文件仍为前文完整 48 项清单，加 `docs/audit/EASYPROJECT_REMEDIATION_PLAN.md`、`docs/PROJECT_PLAN.md`，合计 50 项；未新增路径，未提交/推送。
- 已完成：使用 E 盘 npm 11.21.0 升级 Vitest/@vitest/mocker 至 4.1.11；升级引入的 Node 类型缺失通过直接声明 `@types/node` 22.20.5 修复。成功的全量/生产 npm 扫描发现另两项新告警：brace-expansion 高危和 moment 中危。定向将两条 brace-expansion 链升至 1.1.21/2.1.7、moment 升至 2.31.0；Vite 保持 6.4.3，无强制安装或规则关闭。
- 所有最终前端门禁通过：lint、类型、78/78 单测、7/7 性能、16/16 E2E、Vite 构建、release:check 0.1.0。构建仍有 XLSX 940.20 KB、vendor 1491.11 KB 两项大块警告。最终安全复扫受证书异常阻断：npm self-signed certificate，Windows TLS/IPv4 均报 SEC_E_WRONG_PRINCIPAL；系统 CA 重试无效。没有关闭 TLS，当前全量/生产漏洞总数未知，不能沿用旧的 0 结论。
- 未解决：其它 5 项 P3；9 条历史 RustSec 信息性警告；最终 npm 在线扫描和远程 CI；签名、多平台、干净机安装/升级/回滚。旧 NSIS 不包含此次生产依赖补丁，需重构建。文档报告待更新，Wolai 未同步；设备连接未检查。悬浮窗不开发。
- 进入 NSIS 构建前额度：主窗口剩余 78%、次窗口剩余 74%，重置次数 0。工具/缓存/临时文件全部在 E 盘被忽略目录，无 C 盘安装、重置或定时唤醒。
- 准确下一步：用已有 E 盘离线 Cargo 缓存构建新 NSIS、核对产物哈希/签名；更新报告新增两项发现及 EP-SEC-004 闭环，明确安全复扫客观缺口；更新整改安排和最终检查点，运行标准、格式与 Git 差异检查。网络证书恢复后优先重新执行全量/生产 npm audit。

## 2026-10-06 依赖整改交付检查点

- 目标与范围：EP-SEC-004 Vitest 升级及复验新发现的两项依赖问题整改；不开发悬浮窗，不修改用户数据。实际标准 UPARS 1.1.0，WACAS 未定义/待确认。分支 `main`，基线 `c0bb3220347f3978f547d0c4841156c648f2711a`。全部未提交文件为前文逐项列明的 48 项，加 `docs/audit/EASYPROJECT_REMEDIATION_PLAN.md`、`docs/PROJECT_PLAN.md` 共 50 项；`git status --porcelain=v1 -uall` 已核对，无新增路径。未提交或推送。
- 已完成修改：Vitest/@vitest/mocker 4.1.11；直接声明 @types/node 22.20.5；brace-expansion 1.1.21/2.1.7、moment 2.31.0 定向补丁。包声明、锁定与安装树一致，使用兼容 npm 11.21.0，无 force、规则忽略或 TLS 放宽。报告新增 EP-SEC-011/012，关闭 EP-SEC-004；24 项问题（P0 0、P1 2、P2 14、P3 8），19 fixed、5 open，编号唯一性与状态统计已校验。
- 复验：lint/类型 0 错误，单测 78/78、性能 7/7、E2E 16/16；生产构建、release:check 0.1.0、Windows x64 NSIS、产物非空校验通过。安装包 `src-tauri/target/release/bundle/nsis/EasyProject_0.1.0_x64-setup.exe` 为 5,115,942 字节，SHA-256 `8A2B6044BD621151E39460691C0AD973C21FCCBDFCE23E895EB24C7508E955CF`，NotSigned。UPARS 1.1.0 校验、Prettier、git diff --check 通过（Cargo.lock 非失败 LF/CRLF 提示）。Rust 25/25、Clippy、RustSec 为 9-14 历史证据；本轮未改 Rust，不冒充新公告复扫。
- 未解决：最终 npm 全量/生产复扫因 self-signed certificate 失败；Windows TLS 和 IPv4 校验均报证书主体不匹配，系统 CA 无效，未绕过验证。当前漏洞总数未知。5 项 P3 为 EP-CODE-003、EP-BUILD-002、EP-SEC-006、EP-SEC-008、EP-SEC-009；9 条历史 RustSec 信息性警告、2 项资源大块警告；远程 CI、签名/MSI/macOS、真实安装/升级/回滚未验。代码审计暂不通过，正式发布不可用。
- 文档同步与设备：本地审计报告、整改安排、检查点已更新；Wolai 未同步，Git 未提交/推送。设备连接状态未检查，不能推定在线；本轮只构建，未启动安装器。全部新增工具、缓存、临时目录位于 E 盘被忽略目录，没有 C 盘安装。
- 额度：主窗口剩余 74%、次窗口剩余 73%，重置次数 0；未使用重置或定时唤醒。本次无通用标准补充，沿用 UPARS 1.1.0。
- 准确下一步：先读取本节并核对 50 项 Git 状态、包/锁文件及报告；可信 npm 网络恢复后先执行全量 `npm audit` 和 `npm audit --omit=dev`，记录实际结果并处理新增告警。然后按整改安排进入 EP-CODE-003，先拆分 ICS 解析和 criticalPath 纯计算，再渐进拆分组件并回归；不要重复已有效的升级。发布前重新获取 RustSec 最新公告并复扫，随后提交/远程 CI 与发布设备验收按独立授权处理。

## 2026-10-06 复杂函数整改回归前检查点

- 目标与范围：EP-CODE-003 第一批局部重构（ICS、CPM、资源负载），无 UI/数据库/API 行为变更。UPARS 1.1.0，WACAS 未定义/待确认；`main` / `c0bb3220347f3978f547d0c4841156c648f2711a`。开始前重读检查点、核对既有 50 项；本轮另修改 `src/modules/gantt/utils/criticalPath.js`、`src/__tests__/calendar/ics.test.js`、`src/__tests__/gantt/criticalPath.test.js`、`eslint.config.js`，共 54 项未提交文件，原 50 项逐项清单仍有效；未提交/推送。
- 已完成：ICS 导出详情、事件属性赋值和归一化独立；CPM 分为时间轴、依赖图、拓扑排序及计算；资源负载提取周峰值计算。新增 4 项边界回归用例。原 3 文件 5 条额外复杂度/长度诊断已归零；将复杂度≤20、函数有效行≤100 的规则仅对该 3 文件接入既有 lint/CI，不提高阈值或关闭检查。初步类型检查通过，新增测试与最终门禁尚未执行。
- 额度：进入完整回归前主窗口剩余 68%、次窗口剩余 72%，重置 0（本轮开始实查值，最终里程碑再查询）。未在 C 盘安装、重置或定时唤醒。
- 未解决：npm 复扫仍证书主体不匹配，不绕过 TLS；5 项 P3 仍 open，Gantt/TaskList 大组件尚未拆分。旧安装包未包含本轮重构，不能称最新源状态产物。Wolai 未同步、设备连接未检查。
- 准确下一步：执行 lint、类型、全部单测、性能、E2E、构建与版本检查；整改新失败；复核局部门禁的负例；更新报告/整改安排及本检查点。EP-CODE-003 在组件拆分前仍保持 open，不把本批函数诊断归零误报为全部质量债已关闭。

## 2026-10-06 复杂函数复验里程碑

- 目标/范围/标准/基线和全部 54 项未提交文件与上一节一致，无新增路径；未提交/推送。函数重构完成，EP-CODE-003 保持 open，剩余为 Gantt/TaskList 大组件拆分。
- 本批结果：lint/类型通过；18 文件 82/82 单测、9/9 关键路径测试（含原 1000 任务性能预算）、16/16 E2E 通过；Vite 412 模块生产构建、release:check 通过。3 文件的原 5 条复杂度/长度诊断归零；内存构造两种超限负例，分别被 complexity 与 max-lines-per-function 拦截，不写入生产源码、不关闭规则。两项大资源警告仍在。
- 文档待更新；npm 证书缺口、其它 P3、远程 CI 和发布设备验收保持原状态，Wolai 未同步，设备连接未检查。UPARS 1.1.0、WACAS 未定义/待确认。进入 NSIS 构建前额度实查主窗口剩余 62%、次窗口剩余 71%，重置 0；只用既有 E 盘工具与缓存。
- 准确下一步：构建本批重构后的 NSIS，核对新哈希/签名，更新报告与整改安排（不关闭组件余项），最终运行格式/标准/Git 差异检查并保存交付检查点。

## 2026-10-06 复杂函数首批整改交付检查点

- 目标与范围：EP-CODE-003 首批完成 ICS、关键路径、资源负载函数拆分，不开发悬浮窗，不改数据或界面行为。UPARS 1.1.0；WACAS 未定义/待确认。基线 `main` / `c0bb3220347f3978f547d0c4841156c648f2711a` 已复核。全部未提交文件为前文逐项列明的原 48 项，加 `docs/audit/EASYPROJECT_REMEDIATION_PLAN.md`、`docs/PROJECT_PLAN.md`，再加本批 `src/modules/gantt/utils/criticalPath.js`、`src/__tests__/calendar/ics.test.js`、`src/__tests__/gantt/criticalPath.test.js`、`eslint.config.js`，共 54 项；无其它新增路径，未提交/推送。
- 已完成修改：ICS 导出详情/属性赋值/事件归一化分离，CPM 时间轴/依赖图/拓扑排序分离，资源负载周峰值计算独立。4 项边界测试覆盖取消/无效事件、日期范围、空/无效任务与负滞后/独立支路。原 3 文件 5 条函数诊断清零，并将复杂度≤20、函数有效行≤100 接入该 3 文件的既有 lint/CI，两个超限内存负例均被拒绝；无规则抑制或性能预算放宽。
- 复验：lint/类型 0 错误，18 文件 82/82 单测、9/9 关键路径/性能、16/16 E2E，通过；Vite 412 模块生产构建、版本 0.1.0 检查、Windows NSIS 和产物非空验证通过。安装包 5,116,584 字节，SHA-256 `3AA62C0A9A07A5EF186A7F19CDFCDBE3A522711DB3E2A77B5D40CB70AD9DFAC5`，NotSigned。Prettier、UPARS 校验与 git diff --check 通过；Cargo.lock 只有非失败换行提示。Rust 源/锁文件未改，规范/25 测试/RustSec 仍为 9-14 历史证据。
- 未解决：EP-CODE-003 的 Gantt/TaskList 大组件拆分尚未做，整项仍 open；共 24 项发现、19 fixed、5 P3 open。其它 open 为 EP-BUILD-002、EP-SEC-006、EP-SEC-008、EP-SEC-009。2 项大块警告、9 条历史 RustSec 信息性告警；本轮 npm audit 再试仍报证书不含有效 DNS 名，当前全量/生产漏洞数量未知。远程 CI、签名/MSI/macOS、干净机安装/升级/回滚仍未验。代码审计暂不通过，正式发布不可用。
- 文档同步/设备/额度：本地报告、整改安排与检查点已更新，Wolai 未同步，Git 未提交/推送。设备连接未检查，本轮没有启动安装器。E 盘缓存/工具/临时目录策略不变，无 C 盘安装；主额度剩余 60%、次额度 71%，重置 0，未重置或定时唤醒。通用标准无新增条款。
- 准确下一步：读取本节并核对 54 项 Git 状态和相关文件，先对 Gantt/TaskList 的职责与测试覆盖做映射，选一块纯逻辑/独立组件小步抽取，再运行局部与全量回归；不得回退已完成函数拆分或关闭检查。可信 npm 网络恢复后优先复扫全量/生产依赖；正式发布前获取 RustSec 最新公告复扫、核对远程 CI、签名和设备矩阵。

## 2026-10-06 网络安全操作与扫描恢复检查点

- 目标与范围：按用户授权执行不影响本机正常工作的安全操作，恢复 npm 扫描；仅单次进程解析替代，不改系统 DNS、代理、hosts、证书库或网络软件，不升级项目依赖。UPARS 1.1.0；WACAS 未定义/待确认。基线 main / c0bb3220347f3978f547d0c4841156c648f2711a。全部 54 项未提交文件沿用上一节的完整路径组成，未新增路径；本次只补充已有报告和检查点，未提交/推送。
- 诊断证据：Windows DNS 缓存及 GetHostAddresses/Node lookup 返回 registry.npmjs.org→103.73.220.77，其证书 SAN 仅该 IP；实时 resolve4 查询返回 104.16.\*.34，对其中两个地址保留官方 SNI 的严格 TLS 验证均成功。WinHTTP 无代理、用户代理关闭、npm strict-ssl=true、cafile=null；hosts 无相关覆盖。不能仅凭这些证据确定是哪一个网络软件或 DNS 来源注入缓存，未修改或关闭它们。
- 本次安全操作：只在扫描的 Node 进程中对 registry.npmjs.org 将地址查询切换为实时 resolve4/resolve6，其它域名保留原解析；无固定 IP、无证书校验绕过。运行 E 盘已有 npm 11.21.0 官方 CLI 的 audit 与 audit --omit=dev，两次均成功取得 JSON 报告；退出码 1 表示漏洞告警。全量 5 包（3 high、2 moderate），生产 3 包（3 high）；Vitest/brace-expansion/moment 原公告均消失。未改源码、依赖、系统设置或用户数据，工具/缓存/临时路径仍在 E 盘。
- 新告警：Vue/@vue/server-renderer 3.5.22，GHSA-g2v6-rqmx-r4w6（修复 ≥3.5.42）；source-map-js 1.2.1，GHSA-68fv-2mgg-jv7q（修复 ≥1.2.2）；postcss-selector-parser 6.1.4 经 eslint-plugin-vue 10.5.0，GHSA-rj75-hqrm-r3gf（修复 ≥7.1.6）。共 3 个根因，UPARS 可达性/等级尚未核实，未直接按 npm 等级冒充 P1/P2。此前 24 项登记统计仍为历史闭环数量，新告警必须进一步登记分级并整改，当前安全门禁不通过。
- 测试/同步/设备/额度：本次无代码修改，不重复已有效的 82 单测、9 专项、16 E2E；已检查依赖树与版本，报告顶部已补充当前扫描事实。Wolai 未同步，Git 未提交，设备连接未检查。开始实查额度主剩余 54%、次 70%，重置 0；无重置或定时唤醒。
- 准确下一步：先核对检查点/Git/锁文件，对上述 3 个根因审查应用和构建调用路径，登记稳定编号/等级，再进行兼容定向升级及全量回归；在需要网络的进程内复用实时解析方式并保持严格 TLS，不把它永久写入系统或普通构建配置。默认系统异常仍待查明，不声称已经修复。优先新安全告警，之后再继续 Gantt/TaskList 拆分及发布验收。

## 2026-10-06 持续发布验收启动检查点

- 用户目标：持续整改、复验并推进发布验收；仅完成、必须用户处理的发布阻碍或额度暂停时统一汇报。沿用 token-saver、EasyProject maintenance、UPARS 1.1.0；WACAS 未定义/待确认。基线 main/c0bb3220347f3978f547d0c4841156c648f2711a，开始前核对全部 54 项既有未提交路径，未提交/推送。
- 新门禁：每次长期任务前查询五小时额度，剩余低于 10% 不启动长期任务，保存进度后暂停，等待用户提醒恢复；任一其它适用窗口≤5%仍停止新修改。不自动重置或定时唤醒。启动实查五小时剩余 50%、周窗口 69%、重置 0。
- 第一阶段：先定向修复 Vue/source-map-js/PostCSS selector 3 根因，运行全部前端门禁与严格 TLS 官方全量/生产扫描；然后复杂度/体积及 Rust 当前公告复查，再准备提交、远程 CI/多平台构建与本地安全验收。不得擅自把未签名或缺少真实 macOS 设备验证的产物判定正式发布通过；不能创造签名身份。
- 已完成/测试沿用上一节；本次目前仅将新门禁写入已有 AGENTS.md，并在 E 盘被忽略的 audit-tools 生成可复用单进程 npm 解析 runner。全部未提交路径仍 54 项，无源码/依赖新修改；工具不进入交付。不在 C 盘安装。
- 未解决：新 npm 3 根因尚未修复，5 项原 P3，9 条历史 Rust 信息性告警，体积、远程 CI、签名/跨平台/设备安装升级回滚。Wolai 未同步、设备连接未确认。
- 准确下一步：通过 ignored runner 定向 npm update vue、eslint-plugin-vue、source-map-js、postcss-selector-parser；核对实际锁定/安装版本、依赖差异、官方扫描，再回归。若升级引出不兼容立即修复，不能降级门禁。

## 2026-10-06 新依赖告警修复、全量复验前里程碑

- 目标/标准/基线/54 项未提交路径沿用上一节，源码未新增修改。已更新 Vue 3.5.43（声明最低修复线 ^3.5.42）及对应编译器/server-renderer 3.5.43；eslint-plugin-vue 10.11.1→postcss-selector-parser 7.1.6，source-map-js 1.2.2。首次 npm update 因旧 Vue peer 留在 3.5.22，随后显式升级同系列修复下限，安装树已一致，无 force。原三个公告已消失。
- 严格 TLS 官方全量/生产 npm audit 均返回 vulnerabilities={}、所有等级 0、退出码 0。一次中间重试曾证书失败，最终两次成功结果已获取，不以缓存或忽略模拟。系统设置仍未改，runner 为 E 盘 ignored 工具，不进入普通构建。
- 升级后完整功能门禁尚未执行；接下来执行前端 lint/类型、82 单测、9 专项、16 E2E、构建/版本检查，同时更新 RustSec 官方公告数据库并全锁文件复扫、Rust 格式/测试/严格 Clippy。报告尚待把新三个根因登记成正式 finding 并更新统计，未先标记全部复验通过。
- 额度进入长复验前实查：五小时剩余 45%、周窗口 69%，重置 0，高于 10% 门槛。Wolai 未同步、设备连接未检查。签名/干净机与 macOS 验收仍无资源证据，不得判定发布完成。

## 2026-10-06 新供应链整改验证里程碑

- 目标/范围/标准/基线与 54 项未提交路径沿用前文，无新增 tracked/untracked 路径；未提交/推送。上述 Vue/source-map-js/PostCSS 修复已通过全部前端回归：lint/类型、82 单测、9 专项、16 E2E、Vite 构建、release:check。全量和生产 audit 都为 0、退出码 0，未绕过 TLS。原 P3 体积警告仍在（XLSX 940.20 KB、vendor 1495.38 KB）。正式报告新增 EP-SEC-013/014 P2、EP-SEC-015 P3；统计 27 项、22 fixed、5 open；未假装 SSR 漏洞当前在桌面可远程利用。
- 官方 RustSec DB pull 首次连接重置，原数据库不冒充新版本；即将用仅本次 Git 的 Windows TLS backend 重试。Rust fmt/test/Clippy 正在执行，结果尚未记录。签名资源只读核对：GitHub secrets list 无条目，CurrentUser/My 无代码签名证书，现有 v0.1.0 为未签名 Draft；不尝试伪造正式签名。GitHub 账号可用，但远程门禁尚未触发。
- 文档/Wolai/设备状态不变。新工具均 E 盘 ignored 目录；准确下一步为完成 Rust 当前公告复扫和本地门禁，随后整理发布候选、提交并核验远程 CI/草稿构建。签名与真实 macOS/干净机验收所需外部资源缺口须保留，不能通过降低标准自行关闭。

## 2026-10-06 当前 RustSec 公告检查里程碑

- 官方 Git pull 在 OpenSSL/Schannel 均连接失败，改从 GitHub 官方 API 查询当前提交 ef6173cbc5c50ec8166f9a5b28f07834144373ee 并下载该提交 tarball；在 E 盘新 snapshot 目录前校验全部归档路径，无绝对路径/父级穿越，原数据库未覆盖。cargo-audit --db snapshot --no-fetch --deny yanked 成功读取 1290 公告、546 锁定依赖；数据库 Git 元数据 null 是归档方式导致，不伪装 last-commit，固定官方 SHA 另记为证据。
- 当前扫描发现 1 项新漏洞：RUSTSEC-2026-0285 / GHSA-2mjx-qc3c-rqvc，rustls 0.23.32，TLS 1.3 加密层消息边界错误，修复 ≥0.23.45；9 个原信息性警告仍在。扫描退出码 1，不隐瞒。本轮 Rustfmt、25 测试与严格 Clippy 已通过，但只适用于修复前锁文件。
- 基线/标准/54 未提交路径/WACAS/文档同步沿用上一节；设备连接未确认。下一步在 E 盘 CARGO_HOME 定向 rustls 至 0.23.45，获取锁定依赖并全量扫描/测试/Clippy/NSIS 复验；完成后登记 EP-SEC-016 P2、更新报告与发行记录。不开始上游大范围升级以掩盖当前漏洞。

## 2026-10-06 Rust 漏洞整改与候选构建前检查点

- rustls 0.23.32→0.23.45、rustls-webpki 0.103.13→0.103.15 定向升级成功，E 盘 cargo fetch --locked 完成。官方 ef6173cbc5c50ec8166f9a5b28f07834144373ee 快照（1290 公告）复扫漏洞 0、撤包 0，未维护 7、unsound 2，退出码 0，ignore=[]。一次统计对 null yanked 数组用 PowerShell @($null).Count 误显示 1，随即按 null=0 纠正并重扫，真实为 0，不把统计错误当漏洞。
- 最终锁文件 Rustfmt、25/25 Rust 测试、严格 Clippy 通过。EP-SEC-016 P2已登记 fixed；累计 28 finding，23 fixed，5 open。前端最新回归82/9/16和 npm全量/生产0保持有效。本地 NSIS 尚需重构建，旧包不包含 rustls补丁。
- 标准 UPARS1.1.0、WACAS未定义、main/c0bb322 基线、全部54未提交文件组成保持前文；本次只有原 Cargo.lock、报告/检查点更新，无新交付路径。五小时额度最近实查剩余36%、周67%、重置0，准备长构建前再次查询。不在C安装。
- GitHub账号正常，已有v0.1.0仅Draft、target为旧4f00719，无正式tag引用；读取签名secrets与当前用户代码签名证书均无可用资源。Wolai outline可读，尚未写入；设备连接/真实验收未确认，不伪造正式签名。
- 准确下一步：构建NSIS、记录哈希/签名，整理所有报告事实、发布验收清单；代码门禁可执行部分完成后在codex候选分支保存提交并触发草稿发布工作流，核对validate/RustSec与三平台结果。正式签名和真实macOS/干净机矩阵是不可代替的资源门槛，仍不得公开发布。

## 2026-10-06 最终本地候选与远程阶段前检查点

- 目标/范围：持续整改及草稿候选验证至正式发布验收；UPARS1.1.0，WACAS未定义/待确认。源基线main/c0bb3220347f3978f547d0c4841156c648f2711a；尚未提交。五小时剩余26%、周66%、重置0，高于新长任务10%门槛。
- 已完成：累计28 finding、23 fixed、5 P3 open；Vue/source-map-js/CSS解析及rustls补丁回归通过；lint/类型、82单测、9专项、16 E2E、25 Rust测试、严格Clippy/fmt、npm全量/生产0、当前RustSec漏洞/撤包0。1290公告/546依赖，7未维护/2unsound保留。
- 最终NSIS：5,115,687字节，SHA256 415C3C9DDA0A59B027274357A0F167FDB26FF68BEADCCB241040FEEF8ED1D894，NotSigned；构建与产物校验通过。标准校验UPARS1.1.0/6域/11字段、Prettier、Git差异检查通过。
- 未解决：5P3、9信息性/2体积警告；当前候选远程validate/RustSec/三平台构建未运行；正式签名/公证无资源、干净Windows及Mac ARM/Intel设备未确认连接/验收。不启动安装器，不改用户数据、系统网络或C盘安装。
- 文档：报告、整改安排、发行说明与发布验收记录已同步本地；Wolai首发状态已局部更新并get_block读回一致。Git未提交/推送。
- 准确下一步：保存codex/audit-release-20261006候选提交，push该分支，保持现有v0.1.0 Draft并将源码目标与候选一致；触发release.yml，核对validate/RustSec/三平台结果及下载资产。网络受限先使用受控授权重试，绝不跳过TLS/安全门禁；额度低于10%时不开始新长期阶段，保存并等待用户恢复。

## 2026-10-06 远程候选运行检查点

- 已保存并推送候选codex/audit-release-20261006 / 25426627f79988efd069fc2ff3c49ee1f9642a37，基线仍main/c0bb3220347f3978f547d0c4841156c648f2711a。56项整改文件全部进入候选提交。UPARS1.1.0；WACAS未定义/待确认。
- release.yml运行37402521676已启动，validate和rust-security进行中，三平台build需两个门禁通过才开始；源码SHA确认一致。v0.1.0仍Draft，target绑定候选完整SHA；第一次缩短SHA PATCH被422拒绝未生效，完整SHA更正成功。暂时仍含历史资产，不冒充新候选。
- 本地最终82/9/16/25、npm全量/生产0、RustSec漏洞/撤包0及NSIS哈希沿用上一节，无源码变化；未解决5P3/9信息性/2体积警告、签名/公证、干净机及Mac真实矩阵。已确认设备连接仍无；不安装/操作用户数据。Wolai已同步并读回。
- 开始远程阶段前五小时剩余25%、周65%、重置0，高于10%门禁。当前未提交文件仅docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/RELEASING.md及本检查点；余工作树干净。
- 准确下一步：核对37402521676的validate/RustSec/三平台状态；失败读取对应日志定向整改后重跑，成功后在E盘下载六个草稿资产核对容器/版本/哈希并更新报告。远程job长等候采用短时有界等待，不创建自动唤醒；签名和设备缺口不能凭runner成功关闭。
- 全部未提交文件（56项；本次新增发行说明修改与发布验收记录）：

- `github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `CONTRIBUTING.md`
- `README.md`
- `docs/PROJECT_PLAN.md`
- `docs/RELEASE_NOTES_0.1.0.md`
- `docs/RELEASING.md`
- `e2e/smoke.spec.js`
- `eslint.config.js`
- `package-lock.json`
- `package.json`
- `src-tauri/Cargo.lock`
- `src-tauri/src/common/db_state.rs`
- `src-tauri/src/db/member_db.rs`
- `src-tauri/src/db/mod.rs`
- `src-tauri/src/db/plan_baseline_db.rs`
- `src-tauri/src/db/project_db.rs`
- `src-tauri/src/db/project_member_db.rs`
- `src-tauri/src/db/task_db.rs`
- `src-tauri/src/services/calendar_service.rs`
- `src-tauri/src/services/data_service.rs`
- `src-tauri/src/services/member_service.rs`
- `src-tauri/src/services/project_service.rs`
- `src-tauri/src/services/task_service.rs`
- `src/App.vue`
- `src/__tests__/api/crudAction.test.js`
- `src/__tests__/calendar/ics.test.js`
- `src/__tests__/gantt/criticalPath.test.js`
- `src/__tests__/project/ProjectWorkspace.test.js`
- `src/__tests__/router/deepLinks.test.js`
- `src/api/index.js`
- `src/components/ResourceLoadPanel.vue`
- `src/composables/useKeyboard.js`
- `src/i18n/locales/en-US.js`
- `src/i18n/locales/zh-CN.js`
- `src/modules/calendar/components/CalendarSyncPanel.vue`
- `src/modules/calendar/utils/ics.js`
- `src/modules/dashboard/components/DashboardView.vue`
- `src/modules/data/components/DataView.vue`
- `src/modules/gantt/components/GanttView.vue`
- `src/modules/gantt/utils/criticalPath.js`
- `src/modules/task/components/ProjectList/ProjectList.vue`
- `src/modules/task/components/TaskBoard.vue`
- `src/modules/task/components/TaskList/TaskList.vue`
- `src/router/index.js`
- `AGENTS.md`
- `config/audit/audit-standard.json`
- `docs/audit/AUDIT_REPORT_TEMPLATE.md`
- `docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md`
- `docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md`
- `docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md`
- `docs/audit/EASYPROJECT_REMEDIATION_PLAN.md`
- `docs/audit/UNIVERSAL_PROJECT_AUDIT_STANDARD.md`
- `e2e/test-globals.d.ts`
- `scripts/verify-audit-standard.ps1`
- `tsconfig.json`

## 2026-10-06 远程质量及安全门禁通过里程碑

- 候选codex/audit-release-20261006/25426627f79988efd069fc2ff3c49ee1f9642a37，源基线main/c0bb322不变；UPARS1.1.0、WACAS未定义。Actions37402521676的validate与rust-security均success；三平台build正在进行，不提前报安装包成功。
- 本地最终测试与28/23/5问题统计有效；当前未提交3文档为docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/RELEASING.md；均是追溯和状态文字，不改变构建源码。Wolai已同步上阶段并读回，远程新结果待最终同步；设备连接/签名资源仍未确认，无实际安装。
- 未解决5P3、9Rust信息性/2体积告警、签名公证与实际设备验收。下一步等候同一run的Windows/MSI、Mac ARM/Intel构建，成功后E盘下载六资产核对哈希/结构并更新报告；失败对应日志定位整改，不跳过job。五小时最近实查剩余22%、周65%、重置0，新耗费阶段前再次检查。

## 2026-10-06 候选资产核验前检查点

- 五小时剩余15%、周64%、重置0，高于10%长期门禁；开始E盘下载/容器验证阶段。当前run37402521676的validate、rust-security、Windows和Mac ARM构建success，Mac Intel尚在构建。候选SHA25426627f79988efd069fc2ff3c49ee1f9642a37不变。
- Tauri工作流创建实际当前v0.1.0 Draft id404242113（候选SHA）；旧Draft id370399919在GitHub变为untagged历史项，仍保存原6资产。已恢复旧target为4f00719并加historical名称，避免旧资产错误绑定新源码；未删除、未公开发布。
- 当前未提交文件仍为检查点、发布验收记录、RELEASING三个文档。所有测试与UPARS1.1.0/WACAS未定义沿用前文；5P3、签名/设备门槛仍未解决，Wolai上一阶段已读回、新run结果待最终同步。
- 准确下一步：从当前id404242113/tag v0.1.0下载资产到src-tauri/target/audit-tools/release-37402521676，逐个对比官方digest/大小/容器/版本/签名；Intel未完成不能称6资产齐备。待最终run success更新全部报告与保存文档提交，正式签名与真实设备结果不能由本步骤代替。

## 2026-10-06 额度9%暂停——最新续接检查点

- 目标与范围：继续审计整改、候选草稿构建和正式发布验收；本任务不得公开未验收发布。UPARS1.1.0，WACAS未定义/待确认。源基线main/c0bb3220347f3978f547d0c4841156c648f2711a；候选分支codex/audit-release-20261006，25426627f79988efd069fc2ff3c49ee1f9642a37已推送。
- 额度：五小时剩余9%、周63%、可用重置0；按用户10%门禁停止开始新长期任务，保存后暂停，等待用户恢复提醒。无定时唤醒/重置。现有远程run不会强行取消，恢复后先读结果，不重复发起。
- 已完成修改与验证：累计28项（P0=0/P1=2/P2=17/P3=9），23fixed、5P3open；82单测、9专项、16 E2E、25 Rust、lint/类型/fmt/严格Clippy、生产构建/版本、UPARS校验、npm全量及生产0、官方当前RustSec漏洞及撤包0。9信息性/2体积告警保留。最终本地NSIS 5115687字节，SHA256 415C3C9DDA0A59B027274357A0F167FDB26FF68BEADCCB241040FEEF8ED1D894，NotSigned。
- 远程：Actions37402521676 head=候选完整SHA；validate、rust-security、Windows MSI/NSIS和Mac ARM app/DMG success；最近查询Intel build仍in_progress，整体无最终结论，不能报全平台通过。当前Draft id404242113/tag v0.1.0/target=候选；历史Draft370399919保留原6资产，tag变untagged，名称historical且target恢复4f00719，未删除或发布。
- 下载已核验4资产，目录E:/Project/Project/easy-project/src-tauri/target/audit-tools/release-37402521676（ignored，未安装）：Windows setup5068068字节/04a0cd6c790f86d342f917b168f8d2fec2c2eff3e6087a2aa6275a834b4b8883；MSI6750208/ca6a2282c43a6463595bcefcfac626943d58634131ede433193f46bd2e0c39f0；Mac ARM app6775663/9cd3835443da763a4b67b9b50138d61fea93d1bd54f6f2cf804089cbaad2acee；ARM DMG6876035/68a70d221bbc2c26ee43635029f2a00ecaba1c8f02cfc794bce852cb10c90158。四哈希与GitHub digest一致；PE/MSI/gzip-tar-app/UDIF容器通过，ARM app非空可执行18102768字节；Windows两包版本0.1.0、NotSigned。NSIS引导程序PE machine14c正常，不据此断言应用架构错误。Intel两资产未下载/验证。
- 全部未提交文件仅5文档：docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md。代码无未提交变化；该5项为候选提交后的最新追溯，不改变已构建源码。
- 未解决：EP-CODE-003、EP-BUILD-002、EP-SEC-006/008/009仍open；未批准最窄警告例外。签名身份/Apple公证及干净Windows/Mac ARM/Intel真实安装升级数据保留回滚资源缺失；已确认设备连接：未确认任何独立验收设备，当前仅开发主机，未启动安装器或更改用户数据库。不改系统DNS/代理/CA；所有新增本地工具、下载和缓存E盘。代码审计暂不通过、正式发布验收未完成。
- 文档同步：本地报告/整改安排/验收记录已更新到部分远程成功；Wolai首发状态及本最新额度检查点已同步，get_block读回一致。Git候选已远程保存，上述5文档尚未提交。
- 准确下一步：用户提醒额度恢复后读取本节、查额度、git status/HEAD，先查询37402521676最终结果；Intel失败则取失败日志定位整改，成功则只下载当前Draft的darwin_x64两个缺失资产（不要重复覆盖四个已有效下载），比对GitHub digest/大小/安全tar路径/Mach-O架构/DMG koly和版本。保存完整remote日志/六资产表至RELEASING及验收报告，更新Wolai并读回，然后把5文档最新状态提交推送同一候选分支；文档提交不冒充构建源码SHA。之后处理5P3与签名/设备资源门槛，不能凭无签名runner成功宣告正式发布完成。

## 2026-10-06 恢复与Rust P3稳定版兼容评估检查点

- 用户恢复并要求长期固化门禁；AGENTS及CONTRIBUTING将五小时<10%长期任务门禁作为所有后续本项目任务规范，5%全窗口底线不变。UPARS1.1.0；WACAS未定义/待确认。恢复额度实查五小时99%、周62%、重置0。
- 候选基线codex/audit-release-20261006/25426627f79988efd069fc2ff3c49ee1f9642a37，原main/c0bb322；核对原5文档dirty不覆盖，新增AGENTS/CONTRIBUTING修改，共7项尚未提交。
- Actions37402521676现已全部success，validate/RustSec/Windows/Mac ARM/Mac Intel五job均通过，实际head SHA确认一致；当前Draft404242113仍未公开。仅恢复下载缺失Intel两资产，下载仍进行中（中间大小非最终不验证）；其它四项有效哈希不重复下载。
- P3评估：官方cargo info tauri@2取得2.12.1、tauri-utils@2取得2.10.1；本机rustc1.90满足它们最低1.90。官方manifest已引入build-2/html-manipulation-2/dom_query替代旧kuchikiki HTML链；旧链是rand0.7.3与部分未维护依赖根源。准备同主版本定向升级Tauri/build，禁止3.0 alpha或强制单独覆盖HTML传递依赖，必须扫描/测试/Clippy/本地与三平台重新构建后才可关闭问题。
- 未解决5P3、签名/公证、真实设备矩阵；设备未确认新增连接；Wolai上次暂停已读回，本次结果待里程碑同步。准确下一步：先完成已开始Intel资产核验与当前候选记录，再按官方同主版本约束升级tauri2.12.1/tauri-build2.7.1，核对锁文件树是否移除旧HTML/PHF/UNIC链。任何新漏洞或兼容失败继续整改，不把旧候选产物冒充新锁文件验证。

## 2026-10-06 六资产验收与Tauri锁文件整改里程碑

- 候选25426627的Actions37402521676全部五job success；当前Draft404242113的六资产下载完成，全部大小/SHA256与官方digest匹配。Intel新增APP6994825字节/f170fb4c6fab77eb4a08b9fe1924b615a1738e06b266a848de1447b47bf78109，DMG7092386/c8071c81be7b2a9b24cbe8da9722e65db0ed268ba9c95ab37a4e09c9b11a8191；APP架构ARM100000c、Intel1000007，版本0.1.0，安全tar路径和DMG koly均通过。六资产表保存RELEASING。未安装/启动，签名公证及真实设备不推断通过。
- 已修改Cargo.toml约束Tauri2.12.1/build2.7.1、Rust最低1.90；官方同主版本配套升级opener2.7.0等105个框架依赖，锁文件移除kuchikiki、rand0.7.3、fxhash与五UNIC。525依赖/1290公告初扫漏洞0、撤包未列出、退出码0，剩proc-macro-error1.0.4未维护与glib0.18.5 unsound；尚不关闭finding，完整复验未完。
- cargo fetch --locked全目标缓存仍获取中（session35081），cargo test --locked --offline session65887在等待同一个Cargo包缓存锁；并发audit曾提示DB目录锁，已读官方源码证明该提示也用于Cargo包索引锁，不是旧DB损坏；两个audit随后退出0。下次避免并行执行同缓存fetch/test/scan以免无谓等待，不删除锁文件/杀未知进程。
- 静态比对旧/新Tauri app_data_dir默认均为dirs::data_dir+identifier，com.easyproject.desktop和project_manager.db未改；这只是路径证据，不替代升级/回滚真实测试。所有缓存/下载/临时在E，未安装工具或接触用户数据；设备仍无独立连接确认。
- UPARS1.1.0、WACAS未定义/待确认；原基线main/c0bb322，候选分支codex/audit-release-20261006/25426627。全部9未提交文件：AGENTS.md、CONTRIBUTING.md、docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md、src-tauri/Cargo.toml、src-tauri/Cargo.lock。
- 文档：本地及Wolai恢复/六资产/长期额度门禁状态已同步get_block读回一致；准备先保存7文档提交，不把该文档SHA改成已构建源码SHA。最近额度五小时82%、周59%、重置0。未解决5P3，Tauri新锁完整测试/本地NSIS/远程多平台待验，签名公证和实际设备资源仍缺。
- 准确下一步：完成fetch与Rust25测试，随后顺序fmt/严格Clippy/精简JSON audit（明确yanked=0并记录525依赖），验证残留两个告警在Windows/Mac树不可达；构建新本地NSIS。全部有效后只关闭rand finding、部分关闭未维护六根因并保留GTK未维护一项，再更新报告/提交新候选、远程五job及六资产复验；禁止使用3.0alpha、忽略ID或将旧候选哈希冒充新Tauri。

## 2026-10-06 Tauri本地Rust回归通过里程碑

- Git文档提交7447d5d7cca90832e02846202bb835f96677b8b7已推送codex/audit-release-20261006；只含长期门禁和已验证25426627候选六资产证据，不更改该Draft的构建源SHA。普通Git TLS/连接失败后以刚查询官方DNS20.205.243.166、仅当前进程http.curloptResolve且严格TLS推送成功；未修改系统或全局Git设置。
- Tauri2.12.1/build2.7.1/opener2.7.0的105个配套依赖获取完成；新锁525依赖，官方1290公告快照扫描漏洞0、撤包0、ignore=[]，只剩proc-macro-error未维护和glib unsound两项。rand/fxhash/五UNIC确已移除，问题仍待构建复验后关闭。
- 新框架Rust25/25、fmt通过；严格Clippy正在session81313执行。6次target tree证明两个残留包在Windows x64、Mac ARM与Intel均无路径，仅Linux GTK依赖链；不删依赖或忽略公告。旧新app_data_dir默认实现一致，实际数据迁移仍未验证。
- 长期额度门禁已Git持久化且Wolai读回；源基线main/c0bb322、工作基线7447d5d，UPARS1.1.0/WACAS未定义。当前未提交4文件：src-tauri/Cargo.toml、src-tauri/Cargo.lock、README.md和本检查点。最新额度五小时68%、周57%、重置0。
- 设备：仅开发主机；Get-Command未找到可用WindowsSandbox/VBoxManage/vmrun/Get-VM（仅PATH检查，不推断绝无安装），无独立干净机/Mac连接；CurrentUser代码签名证书0。未启动安装器、不改用户数据/网络/C盘工具。
- 准确下一步：等严格Clippy结果，查询额度并构建新NSIS及哈希/签名，更新EP-SEC-009关闭证据与EP-SEC-006残留范围（由7条缩至1条）；累计finding28不增，只在完整验证通过后更新fixed。随后保存新Tauri候选提交并再次远程五job/六资产验证；正式签名/设备/剩余P3仍须单独闭环。

## 2026-10-06 配套前端升级与打包前检查点

后续完成：新NSIS5193100字节/A4FE17287D045C450E18B131E55466AB06DDD312263B23897C9EAC0CF2536C4F，NotSigned/0.1.0，产物检查通过；NSIS3.11与插件官方哈希校验通过，缓存E盘target/.tauri。重复allowScripts键已修复，前端重建仅原两体积告警；npm全量/生产正式复扫退出0、所有等级0。EP-SEC-009关闭，累计28/24fixed/4P3open；剩proc-macro-error与glib仅Linux GTK树。最新五小时49%、周54%、重置0。全部未提交12文件：上述8文件加docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md、docs/RELEASE_NOTES_0.1.0.md。下一步保存新候选并触发远程五job；签名、设备、Wolai待本轮里程碑同步，无新增设备或系统修改。

- 目标仍为全项目UPARS整改与发布验收；UPARS1.1.0，WACAS未定义/待确认。原基线main/c0bb322，当前分支codex/audit-release-20261006，HEAD7447d5d；旧候选25426627六资产证据有效，但不覆盖当前升级。
- 新框架Rust25测试、fmt、严格Clippy全通过；前端lint、类型、82单测、9专项、生产构建、版本检查及16浏览器E2E均通过。两体积告警保留，vendor1495.96kB。首次NSIS在版本匹配门禁退出，未生成新安装包；已将官方API/CLI升级2.12.1、opener2.7.0并核对实际安装版本。
- npm11.21默认阻止esbuild0.25.10脚本：完整审查官方安装脚本后仅批准此精确版本，allowScripts无通配、无全局放行，待处理脚本列表为空；贡献指南记录旧npm不执行此策略。E2E首次有子进程色彩环境冲突，清除该子进程NO_COLOR后16/16重验无告警，未改全局环境。
- 官方Tauri支持bundle.useLocalToolsDir=true，将NSIS/Wix缓存固定项目target/.tauri（E盘）；不使用未证实环境变量。npm全量/生产安全复扫因官方域名DNS返回不可连地址191.101.132.214而失败，不记作通过；此前安装审计0漏洞仍有证据，最终需再次复扫。
- 当前全部未提交8文件：CONTRIBUTING.md、README.md、docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、package.json、package-lock.json、src-tauri/Cargo.toml、src-tauri/Cargo.lock、src-tauri/tauri.conf.json。最新额度五小时54%、周55%、重置0；满足长任务门禁。
- 未解决5P3暂不提前关闭；签名证书0、无独立Windows/Mac设备确认，未安装或启动应用、未触碰用户数据。Wolai停留前一里程碑，下一次完整打包后同步。准确下一步：构建新NSIS并核验哈希/签名；恢复严格TLS npm安全扫描；根据真实结果更新报告、提交新候选并复验远程平台，保持Draft。

## 2026-10-06 新候选远程验证启动

- 目标/范围不变，UPARS1.1.0、WACAS未定义。源基线main/c0bb322；原候选分支codex/audit-release-20261006保留f987a0c47af43b31b69344a611674f0bbe58719e。Git HTTPS连续三次连接重置/超时，未修改系统设置；通过官方Git数据API上传12文件，源码树22cbe4038ed40c4318153c668c62dd503cde88fa与本地完全相等。API去掉提交消息末尾换行（作者/时间/父提交不变），提交SHA5998a87db32b760da0002fed32b43556c65fe4d4；原分支未强推覆盖。已校验原提交仅移除消息末尾换行后的Git对象SHA完全一致并导入，当前本地/远程独立分支codex/audit-release-20261006-api均为5998a87。
- 新Draft404435429/tag v0.1.0明确target5998a87；旧Draft404242113改名historical candidate25426627、tag v0.1.0-audit-25426627，6资产全部保留；370399919历史草稿亦未删除。未公开发布。新Actions37430197698已启动，等待五job和六新资产；不重复发起。
- 本地完成28问题/24fixed/4P3open，82/9/16/25测试、类型/格式/Clippy、npm所有等级0、RustSec漏洞/撤包0与2 Linux信息性、NSIS5193100字节已复验；原两块体积告警保留。quota五小时33%、周52%、重置0，满足远程长任务启动门禁。
- 当前新候选全部源码/文档已提交；仅此检查点后续写入未提交。Wolai已记录f987a0c本地闭环并读回，远程5998/run/Draft映射待下一里程碑同步。设备仍仅开发主机，签名证书0，无独立Windows/Mac连接，不触碰数据、不在C盘安装、无系统网络修改。
- 准确下一步：只读取run37430197698进展；如失败按日志整改，否则六资产下载到E盘新run目录并验证官方digest/容器/版本/架构/签名。更新报告、发布验收与Wolai映射，然后保存文档提交。剩大组件/体积/GTK风险及正式签名、真实设备仍需独立闭环，不宣称正式验收完成。

- 后续状态：远程validate/rust-security均success，三平台build进行中；当前全部未提交5文档：docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md。Wolai新SHA/树/Draft/run映射已同步并读回一致；最新五小时28%、周51%、重置0。当前本地/远程分支5998a87已确认，仅消息末尾换行变化，作者/时间/父提交不变。

- 新阶段门禁五小时25%、周50%，允许最小发布配置整改。run37430197698发现EP-BUILD-003/P3：checkout@v4/setup-node@v4使用已废弃Node20，runner强制Node24。官方v6运行Node24、最低runner2.327.1，已升级CI/release共8引用，应用Node22不变；未跳过检查。累计29问题/24fixed/5P3open，待新远程复验才关闭。当前全部未提交7文件：上面5文档加.github/workflows/ci.yml、.github/workflows/release.yml；设备/签名无变化，Wolai此新增项待同步。下一步：YAML/格式验证；等当前三平台结束后保存其历史草稿，提交新workflow候选再跑完整门禁，避免新旧资产混用。

## 2026-10-06 工作流整改复验启动前

- 目标仍全项目UPARS整改与发布验收，UPARS1.1.0/WACAS未定义，main/c0bb322源基线；当前codex/audit-release-20261006-api/5e7aced868c0e95c9644a68ce88ac1acc7767171，本地与远程同SHA、源码树4dd58911b1cb667a67a7d6c08606a3bc162bb07b。官方API精确保留完整提交消息后同树/同SHA非强制上传成功，原f987分支保留。
- 5e7aced含8处v6/Node24动作升级及5文档追溯，无应用源码变化。Prettier、js-yaml结构/版本引用、diff检查、UPARS校验通过；未安装yaml包，初次yaml模块不可用后使用已安装js-yaml验证通过。EP-BUILD-003待远程复验，累计29/24fixed/5open。
- run37430197698质量/安全/Windows/ARM通过，Intel打包和产物校验步骤已通过、仅post-cache收尾；Draft404435429已有6资产但未独立下载，不提前报完整六资产验收。将保存此草稿历史归档并创建target5e7aced的新Draft；新现有workflow复验队列不删除或取消上一run。
- 额度五小时19%，高于长期10%门禁，无重置或定时唤醒。当前全部未提交仅此检查点；Wolai上一5998状态已读回，新v6与5e状态待同步；无新增设备、签名身份或用户数据操作。准确下一步：启动5e7aced远程门禁，完成后核验其六资产；如额度低于10%，保存当前run/Draft/资产状态并暂停，不发起新的长任务。

- 已启动Actions37432253128/head5e7aced，新Draft404450655/v0.1.0明确target5e7aced，资产初始0；上一Draft404435429已tag v0.1.0-audit-5998a87/history，6资产保留。准确下一步改为仅观察此现有run并完成六新资产核验，禁止再次发起同一构建。

- 最新里程碑：Actions37432253128五job全部success，Draft404450655已有6资产；v6动作实际远程复验通过，EP-BUILD-003可关闭，累计29/25fixed/4P3open。新长阶段前五小时11%，允许独立下载六资产到E盘src-tauri/target/audit-tools/release-37432253128；哈希/结构/版本/架构与签名仍待验证，不把生成当验收。当前仅本检查点未提交，其他报告/Wolai最新状态待此里程碑同步；设备及正式签名仍未确认，无系统或用户数据修改。

## 2026-10-06 五小时9%门禁暂停——最新续接检查点

本节为历史暂停记录；2026-10-07已恢复，最新续接以本文末尾2026-10-07检查点为准。

- 目标/范围：继续全项目UPARS代码整改、复验与正式发布验收，不公开未验收草稿。UPARS1.1.0，WACAS未定义/待确认；原源基线main/c0bb3220347f3978f547d0c4841156c648f2711a，当前源码/流程候选codex/audit-release-20261006-api/5e7aced868c0e95c9644a68ce88ac1acc7767171，树4dd58911b1cb667a67a7d6c08606a3bc162bb07b。本地和远程同SHA；原f987分支与全部历史草稿保留。
- 额度：五小时9%、周48%、重置0。按永久10%长任务门禁保存后暂停，等待用户恢复提醒；不重置、不定时唤醒。新长阶段不再开始；已启动下载不取消或重发，恢复后先核对其完成状态。
- 已完成修改/复验：Tauri Rust/JS API/CLI2.12.1、build2.7.1、opener2.7.0协调升级；Rust最低1.90；工具缓存E盘target/.tauri，精确esbuild脚本批准；checkout/setup-node共8引用升级官方v6/Node24。82单测/9专项/16浏览器E2E/25 Rust、lint/类型/fmt/严格Clippy、生产构建/版本、UPARS/工作流Prettier与js-yaml通过；官方npm全量/生产0，RustSec1290公告/525依赖漏洞0、撤包0、ignore=[]，仅proc-macro-error/glib两Linux GTK公告（Windows/Mac六目标树无路径）。本地NSIS5193100字节/A4FE17287D045C450E18B131E55466AB06DDD312263B23897C9EAC0CF2536C4F，0.1.0/NotSigned。
- 远程：Actions37432253128/head5e7aced全部五job success，废弃Node20动作警告已消失；平台容量/Ubuntu未来迁移通知不是该弃用问题。新Draft404450655/tag v0.1.0/target5e7aced有6资产，未公开。上一5998候选run37430197698亦五job通过，其Draft404435429/tag v0.1.0-audit-5998a87保留6资产；更早404242113/370399919亦未删除。
- 资产下载仍运行session43082：gh release download v0.1.0到E:/Project/Project/easy-project/src-tauri/target/audit-tools/release-37432253128；最后5文件约0.9–1.0MB/各仍增长，MSI尚未开始。不能把这些部分文件当有效安装包，六新资产的独立哈希/结构/版本/架构/签名未验证。只读核验脚本E:/Project/Project/easy-project/src-tauri/target/audit-tools/verify-draft-assets.cjs已准备，校验固定Draft/source/6资产/digest与安全tar、Mach-O、PE/MSI、UDIF；不得对未完成下载直接判通过。
- 问题：EP-SEC-009已关闭，EP-SEC-006由7未维护缩至1；新EP-BUILD-003实际远程复验通过，应关闭。最新累计29项/P0=0/P1=2/P2=17/P3=10，25已整改、4P3剩余（CODE003、BUILD002、SEC006、SEC008），P0/P1/P2未关闭0。报告当前BUILD003仍open、旧快照28/24/4与新增29/24/5并存；额度恢复后需先按实际结果统一为29/25/4，不把检查点当最终报告。
- 未提交/保存：暂停前全部未提交仅docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md；准备将本检查点单独提交并通过同树/同SHA校验API非强制保存，源码候选仍固定5e7aced，不因文档提交改Draft target。ignored的下载目录与两个验证/上传脚本留在E盘，不进入Git。Wolai已读回上一5e启动状态，本次暂停检查点将同步该项目状态块并读回；报告/验收/RELEASING最终候选资产表待恢复后更新。
- 已确认设备状态：仅本机开发Windows；无独立干净Windows/Mac ARM/Intel连接确认，当前用户代码签名证书0。未安装/启动候选程序、不触碰数据库、不改系统DNS/代理/CA、不在C盘安装工具；真实安装升级回滚、签名公证仍未验，不具备正式发布条件。
- 准确下一步：恢复后先读本节、核对Git分支/HEAD/全部状态；查询额度≥10%再开始长期阶段。先查看session43082/六文件是否完整（若会话消失，以官方大小/digest核对），不重复构建或盲目重下；完成后运行固定脚本verify-draft-assets.cjs、Windows两包Authenticode/版本检查；失败仅重取明确损坏/缺失资产。记录六资产证据，统一报告29/25/4和BUILD003关闭，更新验收/RELEASING/Wolai并保存文档。最后仍须处理4P3及有效签名和真实设备矩阵，不宣称正式验收已完成。

## 2026-10-07 六资产复验闭环

- 目标/范围：全项目UPARS整改复验和正式发布验收，UPARS1.1.0/WACAS未定义/待确认；原main/c0bb322基线，分支codex/audit-release-20261006-api，恢复HEAD a9df642746fa3c6bd982b9f691c80b45c78a20ff，产物源码固定5e7aced868c0e95c9644a68ce88ac1acc7767171。恢复时Git干净；仅文档续接，不重做有效构建。
- 额度恢复后五小时99%、周47%；完成核验后五小时82%、周44%、重置0，未触及门禁。本项目10%长阶段与5%硬停止永久规范继续有效，无重置/自动唤醒。本阶段等待发布资源不是额度暂停。
- session43082已消失，但六完整文件均已在E盘；无需重下。只读脚本初次因Windows tar输出CRLF漏识别plist，修正诊断分隔符后完整重验成功。六资产大小/SHA256全部与Draft404450655官方digest一致，安全tar路径、app0.1.0、ARM/Intel Mach-O CPU、PE/MSI/UDIF均通过。Windows两包NotSigned，EXE0.1.0；MSI通过只读WindowsInstaller数据库确认ProductVersion0.1.0，COM资源已释放，未执行安装。六哈希/大小详见RELEASING当前候选表。
- Actions37432253128/head5e7aced五job success再次确认；Draft404450655仍draft且target5e7aced，6资产；历史草稿保留，不公开发布。EP-BUILD-003关闭，报告已统一29问题/P0=0/P1=2/P2=17/P3=10，25fixed/4P3open，P0/P1/P2未关闭0。原82/9/16/25测试与完整前端/Rust门禁有效，npm0/RustSec漏洞撤包0；2体积/2 Linux GTK信息性仍保留，不暗中批准例外。正文及模板/规则UPARS1.1.0完整读过，本次未新增标准条款。
- 全部未提交6文档：docs/RELEASE_NOTES_0.1.0.md、docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md。应用/配置/锁文件无新增变化；准备统一文档校验、同树/同SHA提交同步。Wolai先读outline及相关状态块，只更新阶段状态并读回，最终同步结果在Git保存后确认。
- 未解决：CODE003大组件/BUILD002体积为P3质量债，SEC006宏包未维护/SEC008glib为Linux GTK上游链；不强制跨主版本覆盖或静默接受风险。正式Windows/Apple签名身份、公证、独立Windows与Mac ARM/Intel安装升级回滚证据缺失。10-07只读当前用户代码签名证书与仓库Secrets均0；仅本机开发Windows，无独立设备连接确认。不动用户数据库、系统DNS/代理/证书，不在C盘安装或启动候选。
- 准确下一步：正式验收需要负责人提供受控签名/公证资源及可验收的干净Windows/Mac环境，并对4P3安排整改或批准最窄范围、带负责人和复查条件的例外；不自动购买、申请身份或公开未验收包。资源确认后先核对最新Git/检查点与额度，再按RELEASING真实设备矩阵执行。源码若有新改动，须生成新候选、门禁与资产，旧5e7aced证据不可冒充新源集；浮窗仍仅记录，未开发。

## 2026-10-07 组件职责拆分与拖放边界——最新检查点

- 目标与范围：继续EP-CODE-003渐进拆分，先独立TaskList拖拽排序职责并整改新增EP-REL-004/P2：onDragOver验证项目，但onDrop仅验证父级；模板.prevent使跨项目根任务仍可进入drop并交换sort_order。UPARS1.1.0；WACAS未定义/待确认。基线main/c0bb3220347f3978f547d0c4841156c648f2711a，当前分支codex/audit-release-20261006-api，HEAD beb7c7dba854d168ab9155a85560a60e334c5d30，恢复时Git干净。
- 额度：本阶段五小时剩余72%、周43%，重置0；允许开始，永久10%/5%门禁继续生效。
- 已完成：完整读取适用技能及UPARS正文/模板/机器规则，核对最新检查点、Git与TaskList源码；旧5e7aced候选六资产及82/9/16/25结果仍仅证明旧源集，不覆盖即将发生的修改。此时新增问题尚未整改或复验，CODE003保持open。
- 全部未提交文件：仅docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md；下一步新增useTaskReordering及单测、集成TaskList、扩展既有局部复杂度门禁，再运行lint/类型/单测/性能/E2E/生产构建与版本检查。不得以搬移代码直接关闭大组件问题；验证失败继续定向整改。
- 未解决：新增跨项目排序边界、4项P3、正式签名/公证和真实安装升级回滚矩阵。Wolai已同步上一六资产里程碑，本阶段待同步；无新增设备连接确认，仅开发Windows，无签名身份，未安装应用、未触碰用户数据库或系统DNS/代理/CA。所有缓存和临时产物保持E盘。浮窗仅记录。

### 排序第一批复验与原子性整改入口

- EP-REL-004前端修复通过：同项目/父级判断统一用于hover/drop；并发锁、空dataTransfer和失败状态补充10单测及1强制跨项目drop界面回归。全量92单测/9专项/17E2E、lint/类型/构建/版本通过，413模块、原两体积警告；初次测试钩子误返回mock导致超时已修复并全量复验，不增加超时阈值。CODE003仅部分推进，仍open。
- 新确认EP-REL-005/P2：拖放与按钮排序均以两个独立update执行；第二写入失败时第一可能已提交，造成重复/部分顺序且撤销快照可能竞争。下一步新增后端swap_order事务：同一事务读取并校验同项目同父级、交换两行、失败全部回滚；前端两个入口共用一个调用并纳入撤销历史。用内存SQLite触发器注入第二写入失败证明回滚；不操作用户数据库，不改schema。
- 长阶段前额度五小时64%、周42%、重置0。全部未提交6路径：docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、eslint.config.js、e2e/smoke.spec.js、src/modules/task/components/TaskList/TaskList.vue、src/modules/task/composables/useTaskReordering.js、`src/__tests__/composables/useTaskReordering.test.js`。计划新增Rust任务DB/service、API历史与demo以及测试；完成后重新全量验证并准确记录全部路径。Wolai阶段同步待完成；设备/签名状态不变，旧候选保持Draft且不覆盖本次源集。

### 原子排序复验里程碑与打包入口

- 两个入口已共用swap_order；后端同一事务查询当前排序并校验项目/父级/有效状态，再交换两行。内存SQLite三项新增测试证明成功交换、跨项目/父级/自身/缺失/已删除拒绝和第二写入失败全部回滚；28 Rust测试与严格Clippy通过。96单测（20文件）、9专项、17E2E、lint/类型/生产构建/版本通过；演示模式边界和一次撤销快照覆盖。新增代码曾有ApiResponse返回类型编译错误和测试InvokeArgs类型错误，均定向修复后复验通过，未关闭检查。EP-REL-004/005本地关闭；CODE003仍open，TaskList已移除约90行重复排序职责，Gantt及其他职责仍待拆分。
- 全部未提交12路径：docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、eslint.config.js、e2e/smoke.spec.js、src-tauri/src/db/task_db.rs、src-tauri/src/services/task_service.rs、`src/__tests__/api/crudAction.test.js`、`src/__tests__/api/demoReordering.test.js`、`src/__tests__/composables/useTaskReordering.test.js`、src/api/demo.js、src/api/index.js、src/modules/task/components/TaskList/TaskList.vue、src/modules/task/composables/useTaskReordering.js。基线/HEAD仍beb7c7d；Wolai待里程碑同步。
- 打包前额度五小时60%、周41%，重置0。准确下一步：E盘离线缓存构建NSIS并记录大小/版本/哈希/签名，统一报告31项/P0=0/P1=2/P2=19/P3=10、27fixed/4P3open；保存Git与Wolai检查点，然后继续大组件职责拆分。旧5e候选保持历史证据，当前新源集尚无远程候选/六平台资产。签名/真实设备缺口、无用户数据操作状态不变；UPARS无需新增条款（事务一致性已被现有数据域覆盖）。

- 后续打包闭环：新NSIS5185831字节，SHA256 C7FF3849877D9D2D33645EE524A38418DE8788741428F0E796FD850E8B61E228，0.1.0/NotSigned；构建退出0，未安装或启动。Rustfmt、UPARS1.1.0脚本、Git diff --check通过；报告和发布/整改文档已统一31/27/4并明确新旧源集证据边界。保存前五小时58%、周41%、重置0。
- 全部未提交17路径：上述12路径加docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/RELEASE_NOTES_0.1.0.md、docs/RELEASING.md。准备保存同一分支阶段提交并精确同树/同SHA、非强制同步；Wolai已重读outline及状态块，待本里程碑替换读回。无新增设备连接/签名资源，缓存E盘。
- 准确下一步：继续CODE003中的Gantt计划基线职责拆分；检查发现loadBaseline吞掉请求错误，saveBaseline在读回失败后仍报成功，需以独立finding登记并用失败用例整改，不直接搬移缺陷。新代码开始前再次保存范围/额度，完成后回归；新候选远程打包安排在该批源码稳定之后，避免重复构建。正式发布仍不可验收。

### Gantt基线职责阶段入口（2026-10-07）

- 上批17文件已保存并精确同树/同SHA非强制同步：HEAD dee97edbd21c15ab52217e972c3de99005e3af17，tree9004ebc766283932bd9eb6af95a02e1ee1817cbf；同分支，Git干净。Wolai排序里程碑已同步并读回。原基线/UPARS1.1.0/WACAS未定义与设备/签名状态不变。
- 额度五小时55%、周40%、重置0，允许开始。目标继续CODE003，抽离Gantt计划基线读写状态与呈现计算，不变更UI结构/schema；新EP-REL-006/P2：loadBaseline的catch静默清空数据，saveBaseline接着设置成功和显示状态，读回失败可被错误报告为完成。范围是基线保存/读取、主项目甘特图生产入口；整改传播读取失败到既有错误反馈，并测试写失败/读回失败/清除失败，避免搬移后保留缺陷。
- 当前全部未提交仅此检查点；计划改GanttView/ESLint，新增基线composable/呈现纯工具与单测。准确下一步实现明确失败状态与职责分离，运行局部门禁及全部前端回归，按结果关闭REL006、更新32项统计，不提前关闭CODE003。完成后保存检查点/同步；远程候选打包待源码稳定，旧5e与本地dee包均不覆盖下一批。Wolai当前仍为上批，待新里程碑同步；无额外设备连接或用户数据操作。

### 基线职责复验完成

- EP-REL-006关闭：Gantt基线持久化状态抽至usePlanBaseline，偏差/几何/提示纯计算抽至baselinePresentation；读取异常传播到错误横幅，读回失败不报保存成功，清除失败保留快照，旧项目响应不写入当前项目。新增12单测和1界面回归；108单测（22文件）/9专项/18E2E、lint/类型/构建通过，415模块，原两体积警告不变；Rust28/fmt/严格Clippy仍有效（Rust源码未变）。测试resolve类型错误已初始化修复并复验，未豁免检查。
- 统计32项/P0=0/P1=2/P2=20/P3=10，28fixed/4P3open；原137文本加7新增JS输入累计144。CODE003仍open：Gantt减少约100行基线职责，编辑器/交互与TaskList编辑/筛选仍需拆分。
- 全部未提交9路径：本检查点、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、e2e/smoke.spec.js、eslint.config.js、src/modules/gantt/components/GanttView.vue、`src/modules/gantt/composables/usePlanBaseline.js`、`src/modules/gantt/utils/baselinePresentation.js`、`src/__tests__/composables/usePlanBaseline.test.js`、`src/__tests__/gantt/baselinePresentation.test.js`。HEAD仍dee97edbd21c15ab52217e972c3de99005e3af17，准备阶段保存；Wolai待同步。新前端未再打NSIS，dee本地包和5e远程包均非当前源集。
- 最新实查额度五小时96%、周99%、重置0（窗口重置后的工具值，非本任务重置操作）；永久门禁仍有效。准确下一步：提交同步本批与Wolai，继续Gantt编辑/创建职责拆分；源码稳定再统一新NSIS/远程五job/六资产，避免重复打包。签名/真实设备缺口、未操作用户数据状态不变；UPARS1.1.0/WACAS未定义，无新增通用标准条款。

- 保存前发布说明/RELEASING/验收/整改计划四文档已追加基线阶段，全部未提交共13路径：上述9项加docs/RELEASE_NOTES_0.1.0.md、docs/RELEASING.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md。格式与Git diff --check通过。准备同分支保存并精确非强制API同步，Wolai更新32/28/4和108/9/18/28后读回；阶段提交之后未提交应为0，以下一阶段开始实查为准。

### Gantt任务编辑职责阶段入口

- 基线阶段13文件已提交12cbc64d6cbce114b988cce83e07c5ddab1ebfaf、tree348b4320819789180fa900e463a9bb4e7c02ba3c并精确API非强制同步成功，同分支Git干净；Wolai32/28/4与108/9/18/28已同步读回。原main/c0bb322基线、UPARS1.1.0/WACAS未定义、设备/签名状态不变。
- 长阶段前实查五小时84%、周98%、重置0；当前全部未提交仅此检查点。目标CODE003第三批，按创建/编辑表单职责抽离Gantt状态、字段初始化、工作日重算、提交与反馈，不改变模板/CSS/schema；保留既有payload纯工具并集中重复工作日计算。新增模块接入原复杂度/函数长度门禁，补保存/失败/日期与状态测试，再完整前端回归；失败继续修复，不关闭规则。
- 准确下一步实现useGanttCreateEditor/useGanttEditEditor及共用表单日期重算，集成GanttView；记录实际新增文件/测试并更新报告。源码稳定再统一打包/远程验证，旧dee/5e包不覆盖新源集。Wolai阶段待同步，无新设备连接、用户数据或系统设置变更。

### 编辑职责复验与监听器生命周期入口

- 创建/编辑表单状态与提交已独立为两个composable，工作日重算共用taskFormSchedule；Gantt不再持有重复表单初始化/提交逻辑，保持模板/CSS/schema。新增13单测覆盖初始化/完整payload/日期/保存失败重试/提交顺序/防重复提交。121单测（24文件）/18E2E、lint/类型/生产构建通过，418模块、原两体积警告；9专项上批有效，Rust28/fmt/Clippy未受本批影响。CODE003仍open。
- 全部未提交8路径：本检查点、eslint.config.js、src/modules/gantt/components/GanttView.vue、`src/modules/gantt/composables/useGanttCreateEditor.js`、`src/modules/gantt/composables/useGanttEditEditor.js`、`src/modules/gantt/utils/taskFormSchedule.js`、`src/__tests__/composables/useGanttTaskEditors.test.js`、`src/__tests__/gantt/taskFormSchedule.test.js`。HEAD/分支仍12cbc64，新增5自有文本（累计149）；报告/Wolai仍上批32/28/4与108测试，本里程碑待统一。
- 新EP-REL-007/P2：Gantt三个拖动入口注册document mousemove/mouseup，仅在mouseup移除，无组件卸载清理。拖动中路由切换后仍可触发旧组件状态/后端更新；生产鼠标交互入口可达，涉及资源释放和迟到写入。准确下一步用组件生命周期管理器统一注册/移除、卸载时全部释放，并mount/unmount负例验证旧回调不再执行；不改交互视觉或用户数据。先保留本进度，再修复/全量复验后更新33项统计；UPARS资源释放已有覆盖，无通用条款新增需求。

### 编辑及监听器复验完成

- EP-REL-007已关闭：三类document拖动监听统一生命周期注册/移除，onBeforeUnmount全部释放；3个新增生命周期单测与浏览器拖动中离开路由负例证实后续mouseup不产生task.update。编辑/创建职责和日期重算13新增单测也通过。全量124单测（25文件）/9专项/19E2E、lint/类型/生产构建通过，419模块，体积警告940.20/1495.97KB仍保留；Rust28/fmt/严格Clippy未变仍有效。测试setup闭包类型错误已用明确类型状态容器修复，随后格式错误已定向格式化并复验，不排除测试。
- 统计33项/P0=0/P1=2/P2=21/P3=10，29fixed/4P3open；原137文本加14新增自有JS累计151。CODE003仍open，Gantt基线/创建/编辑已分离，TaskList编辑/筛选与Gantt交互仍待整理；本阶段不做视觉结构变更。6发布/审计文档将同步本地，Wolai仍为12cbc64基线阶段待更新；未提交列表在保存前实查后逐项补齐。
- 最近实查额度五小时77%、周96%、重置0；准确下一步保存本批并同步Git/Wolai，再提取TaskList行编辑与请求/筛选并回归；稳定源码统一新NSIS和远程全平台产物，不复用旧包。无新增设备连接、签名资源或用户数据操作；UPARS1.1.0/WACAS未定义，无新增通用标准条款。

- 保存前全部未提交16文件：docs/RELEASE_NOTES_0.1.0.md、docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md、e2e/smoke.spec.js、eslint.config.js、src/modules/gantt/components/GanttView.vue、`src/__tests__/composables/useDocumentDragListeners.test.js`、`src/__tests__/composables/useGanttTaskEditors.test.js`、`src/__tests__/gantt/taskFormSchedule.test.js`、`src/modules/gantt/composables/useDocumentDragListeners.js`、`src/modules/gantt/composables/useGanttCreateEditor.js`、`src/modules/gantt/composables/useGanttEditEditor.js`、`src/modules/gantt/utils/taskFormSchedule.js`。6文档已同步33/29/4和124/9/19/28；格式/Git diff --check通过；阶段提交/精确非强制同步后Wolai更新并读回，保存成功状态以下一阶段Git核对为准。

### TaskList查询与编辑阶段入口

- 上批16文件已提交2b752960cacc7252ee801a2c7e73d1ffe7cf4253/tree46626c7e879c8052ff3325ff2f9523c49405679a并精确API非强制同步；同分支Git干净，Wolai33/29/4和124/9/19/28已读回。原基线/UPARS1.1.0/WACAS未定义/设备签名状态不变。开始前额度五小时73%、周96%、重置0，允许开始；未提交仅此检查点。
- 范围CODE003查询/行编辑职责。新EP-REL-008/P2：TaskList.init吞掉查询失败并正常返回，排序/删除/行编辑后续仍可报成功；并发筛选请求还可旧响应覆盖新结果。方案查询集中状态与请求序号，只最新请求可提交状态，返回明确成败；变更入口使用checked reload，失败不宣布成功。
- 新EP-REL-009/P2：临时NEWTASK行add成功后set_for_task失败，catch仍保留NEWTASK ID；再次保存可重复add。方案在add成功后立即接续后端真实ID和缓存身份，失败重试仅更新既有任务/依赖，不重复创建；测试故障注入。该修复不声称任务字段与依赖是整体原子事务，保留部分保存错误反馈并明确数据已创建事实，进一步事务组合属于单独评估项。
- 准确下一步先实现useTaskListQuery与最新请求状态隔离，随后useTaskRowEditor与创建ID交接，全部新增模块纳入既有门禁并补负例/全量前端复验；关闭发现后统一35项统计及检查点，稳定源集再打包。新阶段Wolai待同步，无用户数据库、系统设置、安装器或设备操作。

### TaskList查询与编辑复验完成

- EP-REL-008/009本地关闭：查询状态集中，任务/依赖完整取回后一次提交，只最新请求及原项目一致时可更新；init返回成败，变更入口用initChecked，查询失败不宣布保存/排序/删除成功。创建后立即接续真实ID与编辑缓存，依赖失败显示已创建但后续未完成，重试只处理既有任务；不声称字段/依赖整体原子。新增14单测及2E2E（真实行编辑依赖失败重试仅一次add、排序后读取失败无success横幅）均通过。
- 全量138单测（27文件）/21E2E、lint/类型/构建通过，422模块，原两体积警告；9专项上一批有效，Rust28/fmt/Clippy未变仍有效。新query初次106有效函数行被门禁拒绝，拆分独立快照加载职责后通过，未放宽100门槛；SFC初始化顺序类型错误已调整并复验。父Gantt/TaskList额外严格复杂度≤20/有效函数行≤100检查均0诊断。TaskList脚本582→327行；Gantt925→711行，后者交互职责继续提取，不提前关闭CODE003。
- 当前统计35项/P0=0/P1=2/P2=23/P3=10，31fixed/4P3open；原137文本加19新增JS输入累计156。全部未提交11路径：本检查点、e2e/smoke.spec.js、eslint.config.js、src/i18n/locales/en-US.js、src/i18n/locales/zh-CN.js、src/modules/task/components/TaskList/TaskList.vue、`src/__tests__/composables/useTaskListQuery.test.js`、`src/__tests__/composables/useTaskRowEditor.test.js`、`src/modules/task/composables/useTaskListQuery.js`、`src/modules/task/composables/useTaskRowEditor.js`、`src/modules/task/utils/taskRowPersistence.js`。HEAD仍2b752960，同分支；6审计/发布文档待统一本阶段，Wolai仍前阶段33/29/4待同步。
- 最新额度五小时67%、周95%、重置0。准确下一步保存报告/文档与本阶段提交、同步Wolai，再继续Gantt拖动与视口职责整理并全量回归。旧dee/5e产物不覆盖新前端；签名/设备缺口不变，无用户数据或系统操作。标准与原基线不变，无新增通用标准条款。

- 保存前全部未提交16项：上述11项加docs/RELEASE_NOTES_0.1.0.md、docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md。6文档已同步35/31/4与138/9/21/28，格式/Git diff --check通过；准备同分支阶段提交并精确API非强制同步，Wolai随后更新读回。下一阶段开始核对实际HEAD和干净状态，不重复已完成回归。

### Gantt视口与任务拖动阶段入口

- 上批16文件已提交7d1a427da68c0a205f1fdbb951925ccfa1309040/tree5b3a5ecd3ad8e6849dceafdc95292e8b3ff28042并精确API非强制同步成功，同分支Git干净，Wolai35/31/4与138/9/21/28已读回。原基线/标准/WACAS/设备签名状态不变；最近额度五小时67%、周95%、重置0，允许新长阶段。当前未提交仅此检查点。
- 目标CODE003继续按职责拆分：日期范围/日期格/月分组为可测试纯计算，视口响应状态和导航独立；任务条拖动保存与DOM监听独立，不改template/CSS/API/schema。保留既有日期/几何算法、缩放限制、边缘扩展和点击编辑行为；消息计时器随组件卸载清理。所有新增模块与两个父组件纳入20复杂度/100有效函数行门禁，增加日期/视口/拖动边界测试并全部回归。
- 准确下一步实现上述模块与集成；闭环需实际职责界限、静态门禁、回归和源码差异证据，不能只因行数降低关闭CODE003。源码稳定后统一新NSIS/远程平台/六资产。新阶段文档/Wolai待同步，无本机安装或用户数据操作。

### 视口/拖动复验与Gantt加载隔离入口

- 视口日期范围/天格/月分组纯计算、视口响应状态/滚动缩放导航、任务条拖动保存均已独立；消息计时器随卸载清理。新增13单测，151单测（30文件）/21E2E、lint/类型通过；模板/CSS未变。新阶段尚未更新报告或打包。
- 全部未提交10路径：本检查点、eslint.config.js、src/modules/gantt/components/GanttView.vue、`src/modules/gantt/utils/viewportCalendar.js`、`src/modules/gantt/composables/useGanttViewport.js`、`src/modules/gantt/composables/useGanttNavigation.js`、`src/modules/gantt/composables/useGanttTaskDragging.js`、`src/__tests__/gantt/viewportCalendar.test.js`、`src/__tests__/composables/useGanttNavigation.test.js`、`src/__tests__/composables/useGanttTaskDragging.test.js`。HEAD仍7d1a427、同分支；Wolai上一35/31/4待新里程碑同步。
- 新EP-REL-010/P2：Gantt.load无请求/项目隔离，项目切换期间旧四请求快照可覆盖新视图；后续交互可能在新项目日历下计算旧项目任务。load还吞掉读失败，变更入口继续自动调度。生产项目切换/异步读取可达。准确下一步抽离项目快照加载，校验请求序号和选中项目，只完整当前快照可提交；读操作返回明确成败，变更入口用checked load，失败不继续调度。补跨项目异步/读取失败/基线失败负例，不声称跨接口读是数据库快照事务。
- 新长阶段前额度五小时62%、周94%、重置0；允许此定向整改。完成后统一36项统计并复验/保存，无用户数据或系统设置操作；UPARS异步状态隔离/错误处理已有覆盖，无新增通用标准条款。

### Gantt加载隔离与交互职责复验完成（2026-10-07）

- 目标仍为全源集审计整改及发布验收，UPARS1.1.0，WACAS未定义/待确认；原main/c0bb3220347f3978f547d0c4841156c648f2711a基线，当前分支codex/audit-release-20261006-api、HEAD7d1a427da68c0a205f1fdbb951925ccfa1309040。
- EP-REL-010已整改复验：useGanttProjectData只提交完整且属于当前请求/项目的快照，读失败传播到变更入口，阻止后续自动调度；6单测覆盖失败、基线异常及旧项目响应隔离。不声称多接口读取是数据库事务。视口/导航/拖动职责独立，模板/CSS未改；新增13交互/日期单测。157单测（31文件）、9专项、21E2E、lint、类型、生产构建与release:check通过；427模块，两原有体积警告仍在。Rust28/fmt/严格Clippy为未变更Rust源码的有效前阶段证据。报告将统一36项/P0=0/P1=2/P2=24/P3=10、32fixed/4P3open，累计165自有文本输入（原137加28新增JS模块/测试）。CODE003尚待最终职责复核，不能只因行数下降关闭。
- 全部未提交12文件：本检查点、eslint.config.js、src/modules/gantt/components/GanttView.vue、`src/modules/gantt/utils/viewportCalendar.js`、`src/modules/gantt/composables/useGanttViewport.js`、`src/modules/gantt/composables/useGanttNavigation.js`、`src/modules/gantt/composables/useGanttTaskDragging.js`、`src/modules/gantt/composables/useGanttProjectData.js`、`src/__tests__/gantt/viewportCalendar.test.js`、`src/__tests__/composables/useGanttNavigation.test.js`、`src/__tests__/composables/useGanttTaskDragging.test.js`、`src/__tests__/composables/useGanttProjectData.test.js`。其余五审计/发布文档与Wolai尚为7d1a427阶段待同步。
- 实查额度五小时55%、周93%、重置0。准确下一步更新报告及四发布/整改文档（纠正当前门禁表中的旧测试数量并保留历史产物边界）、保存Git并精确非强制同步、更新Wolai读回；然后评估CODE003最终范围与体积风险，再统一新源集打包/远程验收。当前本地dee包与远程5e包不覆盖本源集。仅确认本开发Windows环境，无新增设备连接、签名资源；未安装启动程序、未改用户数据库或系统配置。UPARS现有异步隔离/错误传播要求已覆盖，无新通用条款。

- 保存前全部未提交17文件：上述12项加docs/RELEASE_NOTES_0.1.0.md、docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md。六文档已统一36/32/4和157/9/21/28，UPARS校验/格式/Git diff --check通过；准备阶段提交与精确非强制同步，Wolai随后读回。最新源集打包仍未执行，签名/设备状态不变。

### 依赖拖放识别整改入口

- 上批17文件已保存08bc2a26ffa397242f7c8bdf90f8290ae8a3c3be/tree d703394dacce03ee3ed24521a8a27dacd1ee0329，精确非强制同步成功，Git干净，Wolai36/32/4与157/9/21/28读回一致。标准/原基线/设备签名状态不变；当前额度五小时49%、周92%、重置0，可进入定向阶段。
- 新EP-REL-011/P2：Gantt.onLinkUp读取目标任务条style.left与父行style.top，但匹配barStyle(t).top（固定11px/16px），行top从62px开始，因此目标匹配失败、依赖无法创建。生产依赖拖放入口可达，影响依赖规划。整改通过稳定任务ID识别目标，不再由视觉坐标猜测业务身份；提取依赖拖动职责，保留循环/重复校验、checked reload和卸载监听清理。仅增加DOM数据属性，不改变视觉布局；测试真实两任务拖放与错误/自链接/未知ID边界。
- 当前未提交仅此检查点。准确下一步实现useGanttDependencyDragging与集成，补单测/真实E2E，全量前端复验后统一37项统计并同步；当前新源集尚未打包，无用户数据库或系统修改。UPARS稳定身份/正确性已有覆盖，无新标准条款。

### 依赖拖放复验完成

- EP-REL-011根因含两部分：目标身份由不同坐标系错误匹配；连接span又被进度span通用CSS的pointer-events:none/left:0覆盖，并与z-index4的右缩放手柄重叠。已改为data-task-id精确身份、独立依赖拖动composable、进度样式只作用非连接span、连接手柄内移到right16px避开缩放区域。初两轮真实E2E失败没有掩盖；增加临时连接线可见断言及DOM命中诊断后定位样式冲突，修复后22E2E全通过。6单测覆盖稳定ID/未知目标/自连接/重复依赖/读取失败/卸载释放，163单测全通过；类型测试fixture诊断定向修复，未排除测试。
- 应用内安全demo在1280×800、960×640暗/浅色布局截图检查，三连接手柄DOM命中均为link-handle、pointer:auto；布局无新增视觉遮挡。仅临时演示主题切换，预览已关闭/视口重置，停止自己启动的开发服务器；没有本机桌面交互、安装或用户数据库修改。Rust与锁文件未变。
- 当前全部未提交6路径：本检查点、e2e/smoke.spec.js、eslint.config.js、src/modules/gantt/components/GanttView.vue、`src/modules/gantt/composables/useGanttDependencyDragging.js`、`src/__tests__/composables/useGanttDependencyDragging.test.js`。报告/四发布整改文档尚为36/32/4，Wolai08bc阶段；当前HEAD08bc2a26、同分支。预计统一37项/P0=0/P1=2/P2=25/P3=10、33fixed/4P3open；原137加30新增JS累计167文本。
- 实查五小时43%、周91%、重置0；下一步保存37项报告与Git/Wolai，再继续CODE003剩余网格/呈现职责复核，源码稳定统一打包。UPARS1.1.0/WACAS未定义、原基线与签名/真实设备缺口不变，无新标准条款。构建/类型/lint最终复验结果以下次会话输出核对，不提前宣称打包完成。

- 最终会话已核对：类型/lint退出0，428模块生产构建与release:check退出0，原两体积警告未改变。全部未提交11项：上述6路径加docs/RELEASE_NOTES_0.1.0.md、docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md；六文档已统一37/33/4与163/9/22/28。保存提交、精确非强制同步及Wolai读回后进入下一阶段，仍不宣称当前源集安装包通过。

### CODE003剩余职责复核入口

- 上批11文件0b625d8c00f56471997b59411b1ea05c2b1e3989/tree4ab8b3cdb1d05e22edeac792aeb089c196ad2645精确非强制同步成功，Git干净、Wolai37/33/4及163/9/22/28已读回；原分支/基线/UPARS1.1.0/WACAS未定义、设备签名状态不变。五小时40%、周91%、重置0，允许此长阶段；当前未提交仅此检查点。
- 目标抽离Gantt网格创建拖动（预览、日期范围、编辑器交接、DOM监听）和任务/依赖/关键路径呈现计算；不改变模板/CSS或已有算法。父组件保留视图组合、调度协调、导出和生命周期入口，呈现/持久化/交互职责有明确边界。新增模块纳入20/100门禁，补独立测试并全量前端复验，按实际职责和回归证据判定CODE003，不仅凭LOC。实体模板/样式较长会如实保留为渲染资源事实，不能隐瞒。
- 准确下一步实现useGanttCreationDragging/useGanttPresentation，测试边界/卸载/几何/层级/依赖路径，完成后统一报告并打包当前源集；Wolai待下一里程碑。无用户数据/系统/安装操作，新源集仍无新包。

### 剩余职责本地复验进度

- 网格创建拖动已独立，呈现模块集中日期任务层级、任务条几何、关键路径/依赖路径和可用性提示；纯几何/层级辅助函数独立以保持100有效函数行门禁，曾143/104行被拒绝后继续拆分，未放宽。父Gantt脚本925→293行，TaskList582→327行；模板/样式仍保留原渲染布局（除上一依赖手柄修复），不是以物理行数单独认定闭环。
- 类型/lint0诊断，170单测（34文件）/430模块生产构建/版本检查通过；7新增独立测试覆盖层级/几何/拖动预览/依赖路径/网格范围交接/非法起点/卸载。与单测和构建同时执行E2E时2个既有首屏断言5秒超时、20通过；未删测试或增大超时，当前正独立运行全量22E2E复验，不能先标为通过。
- 当前全部未提交7路径：本检查点、eslint.config.js、src/modules/gantt/components/GanttView.vue、`src/modules/gantt/composables/useGanttPresentation.js`、`src/modules/gantt/composables/useGanttCreationDragging.js`、`src/__tests__/composables/useGanttPresentation.test.js`、`src/__tests__/composables/useGanttCreationDragging.test.js`。HEAD0b625d8、同分支；原137加34新增JS累计171文本。文档/Wolai仍37/33/4与163/22阶段，需E2E完成后同步。
- 五小时35%、周90%、重置0；准确下一步核对独立E2E，失败则继续定位，全部门禁通过后据职责边界关闭CODE003（预计37/34fixed/3P3open），保存同步并统一新NSIS/远程源集产物。原标准/基线/设备签名缺口和用户数据未操作状态不变。

- 独立完整E2E22/22退出0，类型/lint0诊断、170单测/430模块构建/版本检查已核对。CODE003按持久化/编辑/交互/纯呈现职责、23文件20/100门禁和独立/真实回归证据关闭；模板/CSS较大仍明确登记，不以LOC单独证明。最终37项/P0=0/P1=2/P2=25/P3=10，34fixed/3P3open，所有P0/P1/P2未关闭0。六文档已同步，全部未提交12路径：上述7项加docs/RELEASE_NOTES_0.1.0.md、docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md。准确下一步保存精确同步与Wolai，再查询额度、记录候选来源，统一新NSIS与远程五job/六资产，不公开发布；正式签名/真实设备仍未验。

### 新源集打包验收入口

- 源码候选ae6c1c3a5e2d326e9b11941c3ff23aae682361f3/tree23ffcfdaf9460c72e057b37508868e79494365e5，原分支不变，12文件已精确非强制同步，Git干净；Wolai37/34/3及170/9/22/28已读回。UPARS1.1.0/WACAS未定义、原审计基线及设备签名状态不变。
- 长阶段前额度五小时32%、周89%、重置0，允许打包。当前未提交仅此检查点。范围最终Rustfmt/28测试/严格Clippy、E盘工具/缓存/临时路径离线NSIS构建及只读大小/哈希/版本/签名核验；不安装或启动。随后保留旧5e Draft六资产为历史草稿，为ae6c源集建立独立Draft与远程五job映射，避免同名旧资产混入。
- 准确下一步执行上述本地门禁，核验官方GitHub旧Draft/tag状态；常规沙箱网络读被系统拒绝，不改变DNS/TLS，使用已授权的安全网络通路重试。正式签名/真实设备仍缺，不公开发布，不触碰用户数据。远程新构建尚未发起，禁止把旧五job成功充作新证据。

- 本地最终Rustfmt/28测试/严格Clippy退出0；官方npm全量及生产安全复验全部等级0、退出0，严格TLS、仅扫描进程实时DNS，缓存/临时E盘。NSIS构建session24392正在执行，尚无新包核验结果。
- 已只读确认旧Draft404450655/draft=true/target5e7aced/6资产，无正式v0.1.0 tag引用。旧草稿保留六资产并改历史tag v0.1.0-audit-5e7aced；新Draft405384157/v0.1.0/draft=true/target完整ae6c1c3a5e2d326e9b11941c3ff23aae682361f3，初始资产0。仅启动一次Actions37572579794，head同ae6c，初始queued；禁止重复发起、不得宣称远程通过。全部未提交仅此检查点，其他文档/Wolai远程来源待新里程碑同步。
- 准确下一步等待已有本地构建并只读摘要/版本/签名；查询已有远程run五job至终态，全部成功后下载新六资产到独立E盘目录并核对官方digest/size/结构/架构。任何失败需记录并整改，不复用旧成功。正式发布仍需签名与真实设备，历史草稿未删除/公开。

- 本地NSIS新源集ae6c构建退出0：5187629字节，SHA256 2AAF183D1A17851EC9DBF7EEF5F319413FCA1E279C7AD6A2222E30C1436533D6，ProductVersion0.1.0、NotSigned；只读检查未安装。自有native crate release编译57秒、E盘NSIS缓存，无新增编译诊断，前端原两体积警告保留。历史Draft404450655六资产ID/大小/官方digest均读回保持原值。新Actions37572579794仍in_progress，只有validate/rust-security已开始，三平台build尚未出现；新六资产未验证。

- 远程里程碑：validate4m9s、rust-security2m43s均success，Mac ARM2m9s success；Windows与Intel仍in_progress，新Draft已生成4资产（ARM app/DMG及Windows MSI/NSIS），尚无最终五job/六资产结论。最新五小时25%、周88%、重置0，允许后续独立资产下载/验证长阶段。六本地文档已记录ae6c/Draft405384157/run37572579794和本地新包，全部未提交6文档（检查点、报告、验收、整改、RELEASING、RELEASE_NOTES），Wolai仍源码保存里程碑待产物结果同步。
- 准确下一步只等待现有run终态和Intel资产齐备，再一次下载六资产到`src-tauri/target/audit-tools/release-37572579794`并用参数化只读核验器绑定SHA/Draft/run。前次五job与旧六资产仍历史；无新的设备连接/签名身份或用户数据操作。

- 最新远程五job全部success：validate4m9s、rust-security2m43s、Windows3m22s、ARM2m9s、Intel4m20s；run37572579794结束退出0，新Draft405384157仍draft/target完整ae6c、6资产。现在开始一次独立六资产下载，完整摘要/结构/版本/签名尚待核对；不得把job成功自动当真实设备验收通过。

- 安全实际新job输出：525依赖，退出success；仅proc-macro-error1.0.4/RUSTSEC-2024-0370未维护及glib0.18.5/RUSTSEC-2024-0429 unsound两信息性发现，无新漏洞/撤包失败。独立下载session34168仍运行，已出现5个部分文件，不能当有效安装包；网络较慢但未失败，不重复下载/修改网络配置。五小时24%、周88%、重置0（进入资产阶段实查）。准确下一步等待同一下载会话完成，再运行绑定ae6c/405384157/37572579794的只读核验器和Windows两包签名/版本核验；全部成功后更新报告/资产表/最终状态、保存Git并Wolai读回。六文档未提交不含代码，源集不变，签名与真实设备缺口保持。

- 进度文档已提交f3fa3c446a14e9cfb3b33c162d5e05c52d1ad658/tree2e5fae7a5f900fd1fa4c1398368191499eb1f043，精确非强制同步成功，源码候选仍ae6c；Wolai此Git及产物阶段状态已读回。发布下载较慢但五部分文件持续增长，不重启现有session34168。对尚未开始的MSI尝试同一成功工作流备份，artifact11461528048/easyproject-0.1.0-windows-x64-msi下载session21917已退出0；文件位于E盘workflow-37572579794-msi/EasyProject_0.1.0_x64_en-US.msi，6864896字节/SHA256 893FFDC28B231F3785DB2A39B8E9D9AAA418E2D4F66B2015EB4E1BC82F708EB4，与Draft官方MSI大小/digest完全相同。不用该备份冒充其它包通过，原六资产校验仍待其余下载。当前全部未提交仅此检查点，未操作网络/系统/用户数据。

### 新六资产独立验收完成

- 已确认前五包完整传输后，停止自己发起的session34168冗余MSI传输（主动中止退出1，不是产品失败）；其部分文件保存在E盘workflow-37572579794-msi/redundant-release-msi.partial，未删除。以同一run官方MSI备份（已确认发布页同大小/同SHA）复制为发布规范文件名。只读核验器绑定ae6c/405384157/37572579794退出0：六资产全部大小/官方digest/独立SHA匹配，Mac app安全tar路径、0.1.0及ARM/Intel Mach-O CPU通过，DMG仅独立核验UDIF容器（不声称已挂载验证内部应用）；Windows NSIS PE/0.1.0/NotSigned，MSI复合容器/只读ProductVersion0.1.0/NotSigned。未安装或运行任何安装资产。
- 来源：源码ae6c1c3a5e2d326e9b11941c3ff23aae682361f3/tree23ffcfdaf9460c72e057b37508868e79494365e5，五job run37572579794均success；新Draft405384157仍未公开、六资产，旧404450655/v0.1.0-audit-5e7aced六资产保留不变。Git文档HEADf3fa3c446a14e9cfb3b33c162d5e05c52d1ad658，同分支。当前仅本检查点未提交，报告/四发布整改文档与Wolai待将“下载待验”替换为此已验证结论。
- 目标与标准、原main/c0bb322基线不变：UPARS1.1.0/WACAS未定义待确认；累计171文本输入+24资源（资源不冒充像素验收），37项/P0=0/P1=2/P2=25/P3=10，34fixed/3P3open，P0/P1/P2未关闭0。170单测/9专项/22E2E/28Rust、lint/类型/fmt/严格Clippy/构建/版本/标准通过，官方npm全量/生产0，当前远程RustSec门禁success仍两既有信息性。CODE003已闭环；BUILD002两体积警告和SEC006/008仍未关闭/批准例外，因此代码审计暂不通过；正式签名公证及干净Windows/Mac ARM/Intel安装升级数据保留回滚仍缺，正式发布不可通过。
- 准确下一步更新六文档和资产表、保存Git精确非强制同步、Wolai读回；随后需要发布负责人提供签名/公证及真实验收资源，并对三个P3余项作技术整改或逐项明确风险控制/责任/复审条件。仅确认开发Windows环境，无新设备连接/签名身份，未触碰用户DB/系统DNS代理CA，不在C盘安装。没有新增UPARS条款、没有额度重置或自动唤醒。

### 额度门禁暂停检查点（2026-10-07）

- 五小时剩余9%、周86%、重置0，低于长期10%门禁；不再开启新长期阶段，完成必要进度保存后暂停，等待用户额度恢复提醒。目标仍为完整审计整改/复验与正式发布验收，UPARS1.1.0/WACAS未定义待确认，原main/c0bb322基线、codex/audit-release-20261006-api分支不变。
- 本地六文档已记录37项/34fixed/3P3open、171自有文本输入及24资源边界、170/9/22/28测试、新ae6c源集五job与六资产独立核验通过，并附RELEASING六资产官方大小/SHA表。格式、UPARS校验、Git diff --check通过。源码ae6c不变；保存前HEADf3fa3c4，全部未提交6路径：docs/RELEASE_NOTES_0.1.0.md、docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md。仅将已完成证据保存提交/精确非强制同步，再将本暂停检查点同步Wolai读回；不启动新修改或远程构建。
- 源码候选ae6c1c3a5e2d326e9b11941c3ff23aae682361f3/tree23ffcfdaf9460c72e057b37508868e79494365e5；Actions37572579794五job成功，新Draft405384157六资产未公开。代码审计暂不通过（BUILD002体积警告、SEC006/008两个Linux信息性未闭环/批准例外），正式发布不可通过（签名、公证及干净Windows/Mac ARM/Intel安装升级数据保留回滚未验）。仅开发Windows确认，无新增设备连接或签名身份；未安装运行新包、不改用户DB/系统设置，冗余MSI部分文件已保留可恢复，当前所有下载/预览自有会话结束。
- 恢复后的准确下一步：先读本检查点、查Git与六文档，核对保存提交/远程HEAD及Wolai读回；不重复已完成的170/9/22/28或五job/六资产（除必要最终复验）。评估三个P3的可安全整改/逐项风险控制，并由发布负责人提供签名公证和真实设备验收资源；未经新指示不公开未签名草稿、不购买证书、不重置额度或定时唤醒。本轮无新增通用标准补充。

### 恢复检查点（2026-10-08）

- 目标仍为完整审计整改、复验和发布验收；适用UPARS1.1.0，WACAS未定义/待确认。原基线main/c0bb3220347f3978f547d0c4841156c648f2711a；当前codex/audit-release-20261006-api/6972b482efa95505c398d92a4813fe0858087bae。恢复时Git干净，Wolai版本23与暂停检查点一致；记录后未提交文件仅本检查点。
- 已完成34/37整改、170单测/9专项/22E2E/28Rust及ae6c源集五job/六资产证据仍有效，不重复构建或下载。未解决BUILD002体积警告、SEC006/008 Linux GTK信息性，以及签名、公证、独立干净设备安装升级回滚验收缺口。
- 恢复实查五小时100%、周86%；进入体积分析阶段复查97%、周85%，允许继续，无重置授权或自动唤醒。准确下一步先分析生产模块依赖/首屏引入，采用不损失全球节假日、时区和XLSX功能的加载优化，再复验；禁止扩大500KB阈值或仅任意拆包隐藏警告。
- 本地文档正在记录恢复进度，Wolai仍保留上一暂停点，阶段完成后同步并读回。仅开发Windows环境确认，无新增设备/签名身份，未安装运行资产、未改用户DB或系统DNS/代理/CA，不在C盘安装。

### 加载边界里程碑（2026-10-08）

- 移除catch-all vendor并启用显式手工分块，防止CommonJS辅助模块将Excel提前引入仪表盘；新增scripts/check-bundle-loading.js及src/**tests**/bundleLoading.test.js，遍历入口静态依赖闭包，以4正负例防止重依赖被改名后重新进入入口。CI与release校验切换生产dist浏览器回归，runner显式preview/strictPort，保持开发模式命令。累计173文本输入+24资源；37/34fixed/3P3open不变。
- 复验：174单测35文件、23生产E2E、lint/类型/构建/版本/UPARS均通过。第一次生产回归揭示CommonJS辅助提前吸入Excel，已修正；第二次新测试失败因Playwright下载临时名无.xlsx扩展导致按JSON读取，保留真实文件名/MIME后全23通过，没有放宽超时。原Rust28、npm0沿用未变Rust源集/锁文件历史证据，不冒充本日执行。入口静态JS1967202→601209字节，非整页耗时测量；仪表盘资源工作量仍加载日历。两警告XLSX940.04KB/workCalendar1368.65KB保留，BUILD002仅部分整改。
- SEC006/008已执行Linux目标cargo tree --locked离线逆依赖确认GTK宏链；缓存GTK0.18要求glib0.18，官方glib修复≥0.20、proc-macro-error无已修复版本。因此不进行破坏性强制跨版本升级；扫描仍不忽略。尚需负责人批准最窄平台/资源警告例外或进一步架构替换；未自行接受风险。签名公证及真实干净设备矩阵仍无新资源。
- 全部未提交14文件：.github/workflows/ci.yml、.github/workflows/release.yml、docs/RELEASE_NOTES_0.1.0.md、docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_CHECKPOINT.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md、e2e/smoke.spec.js、package.json、scripts/run-e2e.js、vite.config.js、新scripts/check-bundle-loading.js、新src/**tests**/bundleLoading.test.js。HEAD/分支及原基线同上；新打包配置尚无对应安装资产，旧ae6c五job/六包完整证据保持但不得证明新源集。
- 里程碑额度五小时90%、周84%，未触发额度暂停；准确下一步格式/差异最终核验、保存Git精确非强制同步及Wolai读回，再请求必须的风险处置授权/签名与真实验收资源，不公开未签名草稿、不购买证书、不安装应用或改系统。六文档已记录新阶段，Wolai待同步；仅开发Windows确认，无新增设备/账号/签名连接；本轮无通用标准补充、无重置/定时唤醒。
