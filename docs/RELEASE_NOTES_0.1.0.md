# EasyProject v0.1.0 release notes (draft)

> 2026-10-08内部测试版完成：用户批准3项限定例外并选择未签名内部测试版。37项=34fixed+3accepted/open0（P0=0/P1=2/P2=25/P3=10，P0/P1/P2未关闭0）；责任Ym_Li，复审2026-10-22或依赖/资源增长/平台变化，以先发生为准。源码3d62039c4761efa70c34a5b57a19557521da922d/tree76bb5e22531a8676a27658e74f958ebceb512e0e；Actions37715193321五job成功：validate3m46s、安全2m4s、Windows3m10s、Mac ARM3m12s、Intel4m30s。新远程174单测35文件/9专项/23生产E2E/28Rust、lint/类型/fmt/严格Clippy/构建/元数据/UPARS通过；官方npm安装/生产安全扫描0，RustSec525依赖仅2既有已批准信息性告警。独立Draft406330701/v0.1.0-internal.1/draft+prerelease/target完整同SHA，六资产官方大小/digest/独立SHA、结构/0.1.0/Mac架构验证通过。Windows NSIS/MSI明确NotSigned；Mac app归档路径与Mach-O CPU通过，DMG只验容器未挂载；未安装或运行新包。内部测试版打包及静态产物验收通过，代码层通过含例外，正式签名/公证/真实干净设备安装升级数据保留回滚仍未验，正式发布未通过。历史草稿不变、不公开。本轮不新增UPARS条款。以下较早状态保留为历史，不作为当前结论。

> 2026-10-08用户批准记录：用户明确“都批准”，随后选择“先交付未签名内部测试版，保留正式发布验收未通过状态”。EP-BUILD-002、EP-SEC-006、EP-SEC-008改为accepted（不是fixed）；累计37项＝34fixed+3accepted，open=0，P0/P1/P2未关闭0。责任人/批准人：项目发布负责人Ym_Li；复查期限2026-10-22或下一次依赖/资源增长/平台变更，以先发生为准。例外仅限当前XLSX940.04KB、workCalendar1368.65KB两资源及Windows x64/Mac ARM/Intel不可达的Linux GTK链；保留500KB警告、入口加载门禁、174单测/23生产E2E与RustSec全部公告，Linux支持前必须关闭两个GTK例外。基于已验证6cde72e源集，代码层审计通过（含3项限定例外）；正式发布验收未通过，签名/公证/干净设备安装升级数据保留回滚仍待。仅生成独立内部测试草稿v0.1.0-internal.1，不公开、不覆盖历史草稿、不购买证书或操作用户数据库。以下未批准/open/暂不通过记录均为批准前历史。新内部安装包尚待本轮构建及独立验证。

> 2026-10-08加载整改复验（最新工作区，尚未生成新安装包）：新增2个自有文本输入，累计173文本+24资源引用；37项/34fixed/3P3open不变。174单测（35文件）、23项生产构建浏览器回归、lint/类型/构建/版本/UPARS通过；Rust28及官方npm扫描沿用ae6c未变源集/锁文件证据，不冒充本日重跑。移除全依赖vendor聚合，显式分块不再吸入CommonJS共享辅助，构建门禁检查完整入口静态依赖闭包。入口JS原1967202字节→601209字节（减少69.4%，不是整页加载时间）；仪表盘工作量功能仍需要完整日历规则。Excel在仪表盘和进入数据页时均不加载，点击导出后加载，真实下载再导入六表映射通过。保留500KB阈值和两体积警告：XLSX940.04KB、workCalendar1368.65KB，BUILD002仅部分整改仍open。CI与发布校验改测实际dist产物；旧ae6c五job/六安装资产仅证明历史候选，不证明此新打包配置。SEC006/008复查Linux逆依赖路径及官方公告，GTK0.18约束不兼容glib≥0.20，无安全的直接锁文件升级；不强制跨版本、不忽略扫描。代码审计暂不通过，正式发布仍需签名公证、干净Windows/Mac ARM/Intel安装升级数据保留回滚及逐项风险处置授权。

> Do not publish this draft until Windows and macOS signing and the complete platform smoke-test matrix are finished.

EasyProject v0.1.0 is the first public candidate of the open-source, local-first desktop project planner. It combines structured task management, dependency-aware Gantt planning, team and work-calendar views, portable data exchange, and SQLite recovery without requiring an account.

## Highlights

- Plan projects in linked task-list, Gantt, board, team, resource-load, and work-calendar views.
- Create scheduled projects from blank, software-release, marketing-campaign, and writing templates.
- Maintain task hierarchy, status, priority, progress, assignees, milestones, and finish-to-start dependencies with cycle prevention.
- Schedule around weekends, regional holidays, project exceptions, member availability, effort days, and predecessors.
- Export and import schema-v5 JSON, CSV, and XLSX data, including relationships and plan baselines.
- Export ICS schedules and import or synchronize member busy-time calendars with private-network target protection.
- Use undo/redo, automatic backups, recovery previews, safety snapshots, and transactional restore/import protections.
- Use the EasyProject-styled Windows title bar and refreshed application icon without an extra command-line window at startup.
- Keep all project data in the local operating-system application-data directory.

## Verification status

2026-10-07 source follow-up: task reordering is atomic and project-scoped; baseline readback, drag cleanup, task query isolation and creation retries are corrected. Gantt viewport/navigation/task dragging and project data loading have separate tested responsibilities. Current gates: 170 unit tests, 9 performance tests, 22 browser tests, lint, type checking, production build (430 modules) and release metadata pass. Rust 28/fmt/strict Clippy and official full/production npm audits (zero findings) passed final verification. UPARS: 37 findings, 34 fixed, 3 open P3. CODE003 is closed with tested responsibility boundaries; the two original chunk warnings and two Linux-only dependency informational findings remain visible. The old dee97ed local installer and 5e7aced remote draft assets do not cover this source; candidate ae6c1c3 has a verified local unsigned NSIS; run 37572579794 passed all five jobs; all six assets in draft 405384157 independently match official sizes/digests, containers and Mac app versions/architectures. Windows packages are NotSigned and real-device acceptance remains pending. Dependency drag now resolves stable task IDs and uses an independently clickable link handle; a real two-task mouse-drag regression passes.

2026-10-07: candidate `5e7aced` passed all five jobs in Actions `37432253128`. All six assets in draft `404450655` were independently downloaded and matched GitHub sizes/digests, package structures, version0.1.0 and the expected Mac architectures. Windows NSIS/MSI are NotSigned; signing/notarization and actual installation/upgrade/rollback remain unverified. UPARS:29 findings,25 verified fixes,4 open P3. Historical installation tests do not certify this candidate.

- ESLint: passed with zero warnings.
- Vitest: 82/82 passed; 9/9 critical-path and performance tests passed.
- Playwright: 16/16 passed on Windows WebView mocks, including backup-failure feedback, the custom title bar, and outer-scroll regression.
- Rust/SQLite: 25/25 passed; Rust formatting and strict Clippy passed.
- Latest full and production npm audits: zero vulnerabilities. Current official RustSec snapshot: zero vulnerabilities and yanked crates; two Linux GTK informational advisories remain explicitly recorded in the UPARS report.
- Production frontend build and v0.1.0 metadata validation: passed.
- Windows x64 NSIS: built locally; prior repair install, launch, uninstall, and row-for-row schema-v5 data preservation passed.
- Historical GitHub Actions run `33578595689` built commit `4f00719`; all six unsigned draft assets were verified. These older assets do not include the October audit fixes; a new candidate run and exact artifact checks are required.
- Manual clean-machine Windows MSI and macOS installation smoke testing remains pending.

## Data compatibility

The native exchange format is schema v5. Full export/import includes projects, tasks, task dependencies, members, project memberships, and plan baselines. Invalid imports are rejected transactionally without replacing the current workspace. Restore only accepts verified databases from the managed backup directory and creates a safety snapshot first.

An example project is available at [`public/examples/easy-project-example.json`](../public/examples/easy-project-example.json).

## Known limitations

- Current artifacts are unsigned. Public distribution requires Windows code signing and Apple signing/notarization.
- Calendar URL synchronization is read-only and on demand; OAuth, recurring-event expansion, complete timezone conversion, and two-way synchronization are not included.
- Large XLSX and global holiday-data chunks remain post-release performance candidates.
- Clean-machine Windows MSI and macOS smoke coverage is not yet complete.

## Installation safety

Back up important work before installing a prerelease candidate. An upgrade must preserve the existing application database and backup files. Do not publish a build that fails artifact validation, backup/restore testing, or the platform matrix in [`docs/RELEASING.md`](RELEASING.md).
