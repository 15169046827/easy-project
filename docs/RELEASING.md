# EasyProject release process

> 2026-10-08用户批准记录：用户明确“都批准”，随后选择“先交付未签名内部测试版，保留正式发布验收未通过状态”。EP-BUILD-002、EP-SEC-006、EP-SEC-008改为accepted（不是fixed）；累计37项＝34fixed+3accepted，open=0，P0/P1/P2未关闭0。责任人/批准人：项目发布负责人Ym_Li；复查期限2026-10-22或下一次依赖/资源增长/平台变更，以先发生为准。例外仅限当前XLSX940.04KB、workCalendar1368.65KB两资源及Windows x64/Mac ARM/Intel不可达的Linux GTK链；保留500KB警告、入口加载门禁、174单测/23生产E2E与RustSec全部公告，Linux支持前必须关闭两个GTK例外。基于已验证6cde72e源集，代码层审计通过（含3项限定例外）；正式发布验收未通过，签名/公证/干净设备安装升级数据保留回滚仍待。仅生成独立内部测试草稿v0.1.0-internal.1，不公开、不覆盖历史草稿、不购买证书或操作用户数据库。以下未批准/open/暂不通过记录均为批准前历史。新内部安装包尚待本轮构建及独立验证。

> 2026-10-08加载整改复验（最新工作区，尚未生成新安装包）：新增2个自有文本输入，累计173文本+24资源引用；37项/34fixed/3P3open不变。174单测（35文件）、23项生产构建浏览器回归、lint/类型/构建/版本/UPARS通过；Rust28及官方npm扫描沿用ae6c未变源集/锁文件证据，不冒充本日重跑。移除全依赖vendor聚合，显式分块不再吸入CommonJS共享辅助，构建门禁检查完整入口静态依赖闭包。入口JS原1967202字节→601209字节（减少69.4%，不是整页加载时间）；仪表盘工作量功能仍需要完整日历规则。Excel在仪表盘和进入数据页时均不加载，点击导出后加载，真实下载再导入六表映射通过。保留500KB阈值和两体积警告：XLSX940.04KB、workCalendar1368.65KB，BUILD002仅部分整改仍open。CI与发布校验改测实际dist产物；旧ae6c五job/六安装资产仅证明历史候选，不证明此新打包配置。SEC006/008复查Linux逆依赖路径及官方公告，GTK0.18约束不兼容glib≥0.20，无安全的直接锁文件升级；不强制跨版本、不忽略扫描。代码审计暂不通过，正式发布仍需签名公证、干净Windows/Mac ARM/Intel安装升级数据保留回滚及逐项风险处置授权。

2026-10-07 source follow-up: task reordering is atomic and project-scoped; baseline readback, drag cleanup, task query isolation and creation retries are corrected. Gantt viewport/navigation/task dragging and project data loading have separate tested responsibilities. Current gates: 170 unit tests, 9 performance tests, 22 browser tests, lint, type checking, production build (430 modules) and release metadata pass. Rust 28/fmt/strict Clippy and official full/production npm audits (zero findings) passed final verification. UPARS: 37 findings, 34 fixed, 3 open P3. CODE003 is closed with tested responsibility boundaries; the two original chunk warnings and two Linux-only dependency informational findings remain visible. The old dee97ed local installer and 5e7aced remote draft assets do not cover this source; candidate ae6c1c3 has a verified local unsigned NSIS; run 37572579794 passed all five jobs; all six assets in draft 405384157 independently match official sizes/digests, containers and Mac app versions/architectures. Windows packages are NotSigned and real-device acceptance remains pending. Dependency drag now resolves stable task IDs and uses an independently clickable link handle; a real two-task mouse-drag regression passes.

## Current output

The `Release desktop` GitHub Actions workflow builds three native variants:

- Windows x64: MSI and NSIS setup executable.
- macOS Apple Silicon: app bundle and DMG.
- macOS Intel: app bundle and DMG.

Every build is uploaded both to a draft GitHub Release and as an independent workflow artifact. The workflow validates that `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` contain the same version, then runs the frontend, Rust, browser, npm/RustSec dependency, and UPARS quality gates before building. The RustSec job fetches the complete locked dependency set before scanning for known vulnerabilities and uses `--deny yanked` to fail on withdrawn versions; review documented informational advisories in the current UPARS report before publication.

## Publishing a version

1. Update the same semantic version in the three version files.
2. Run `npm run release:check` and the normal quality gates.
   SQLite backup restore is supported for schema-v5 backups only; test rejection of older or incomplete `.db` files without changing the current workspace.
3. Push a tag named `v<version>`, for example `v0.1.0`, or manually run the workflow.
4. Download and smoke-test each workflow artifact.
5. Edit and publish the draft GitHub Release.

The 2026-08-10 local v0.1.0 candidate passed lint, 67 frontend tests, 18 Rust tests, 14 Windows WebView end-to-end tests, the production frontend build, release metadata validation, and an unsigned Windows x64 NSIS bundle build. A same-version repair install, launch, and silent uninstall also passed while preserving every row in the schema-v5 application database and keeping user backup files. Clean-machine and cross-platform coverage is still required before publication.

## Candidate verification record — 2026-08-14

The candidate was rechecked locally and then merged to `main` as `9ff0937`:

- ESLint passed with zero warnings.
- Vitest passed 71/71 tests, including four release-artifact validation tests.
- Playwright passed 14/14 Windows WebView tests.
- Rust formatting and 18/18 Rust/SQLite tests passed.
- The production frontend build and v0.1.0 release metadata check passed.
- `EasyProject_0.1.0_x64-setup.exe` rebuilt successfully as an unsigned 5,092,787-byte NSIS installer with SHA-256 `A1C8AA40AD307DCA05D4612AEAF346EAFB2455F177F25B71D4DCBCE6E8BB0BF9`.
- Artifact validation was strengthened so a macOS `.app` directory must contain at least one non-empty file.

The local MSI attempt reached WiX after compiling the application but could not run ICE validation because the host Windows Installer service was unavailable. GitHub Actions run [`31777572933`](https://github.com/15169046827/easy-project/actions/runs/31777572933) subsequently passed validation and all three build jobs on `windows-2022`, `macos-26`, and `macos-26-intel`. Each job also passed the strengthened generated-bundle check and uploaded both workflow artifacts and draft Release assets.

### Unsigned GitHub draft artifacts

| Asset                                         |     Bytes | SHA-256                                                            |
| --------------------------------------------- | --------: | ------------------------------------------------------------------ |
| `EasyProject_0.1.0_windows_x64-setup.exe`     | 5,037,832 | `C3FFBD703FC21B6BBCF3219E78B81E47D60C5F23FE933B166918ABEF333EF133` |
| `EasyProject_0.1.0_windows_x64.msi`           | 6,770,688 | `582443C75E2E184E961FBFFA8F77A45ABD8DE2986E08D112FEF3FFF4785A1236` |
| `EasyProject_0.1.0_darwin_aarch64.app.tar.gz` | 6,733,237 | `4A90D967056A0EB1DEA51DABB22ED9F23CED02568651C2875663CBBBBA7BD098` |
| `EasyProject_0.1.0_darwin_aarch64.dmg`        | 6,833,279 | `41FF7DFAE18BA2B5B84893629E11960E22BBFCB2C82D8E3954AA7A9BD85B6DC2` |
| `EasyProject_0.1.0_darwin_x64.app.tar.gz`     | 6,959,739 | `7C3994A652E8F2B8FCDC9DC9AF8F238ADDEBE64F4DE280E26474BB1EFCA9187E` |
| `EasyProject_0.1.0_darwin_x64.dmg`            | 7,052,619 | `DE270A3E184432C208EAA840442629629B79B71E36186368C5FF2432C08B63F1` |

All six assets were downloaded independently after the run. The Windows files have valid PE/MSI container headers, product version `0.1.0`, and the expected unsigned status. Both app archives contain a non-empty executable (`17,969,120` bytes for Apple Silicon and `18,532,924` bytes for Intel), and both DMGs contain the expected UDIF `koly` trailer. These checks prove build and container integrity only; they do not replace signing or the manual installation matrix.

## Refreshed v0.1.0 draft — 2026-09-02

GitHub Actions run [`33578595689`](https://github.com/15169046827/easy-project/actions/runs/33578595689) rebuilt the draft from commit `4f00719` after the Windows icon, GUI-subsystem launch, custom title bar, and outer-scroll fixes. The validation job and all three platform build jobs passed. The six Release assets were replaced, downloaded independently, and hashed:

| Asset                                         |     Bytes | SHA-256                                                            |
| --------------------------------------------- | --------: | ------------------------------------------------------------------ |
| `EasyProject_0.1.0_windows_x64-setup.exe`     | 5,060,442 | `78013A7871B7920213A3F3D634FC7AD94DAEC71AC7300FDDCFFA4E8B07D2C86F` |
| `EasyProject_0.1.0_windows_x64.msi`           | 6,758,400 | `01E6D2F6DF9C6794BF853171A400E70A173D325990865001F28DEACAF72E0656` |
| `EasyProject_0.1.0_darwin_aarch64.app.tar.gz` | 6,749,599 | `4041BA096F6E787BC1BBB40BE3B79102646024AED5BCBF607D28C8F63EC6AE04` |
| `EasyProject_0.1.0_darwin_aarch64.dmg`        | 6,849,507 | `39468E980D81B66AF16C71CE26032D939B7DC3BE1BD142ACDD7C860D2AC63227` |
| `EasyProject_0.1.0_darwin_x64.app.tar.gz`     | 6,962,618 | `D73A0384200FB2FB13FA22325D6F058C4B331CF8F9CCFFB41A0D98AFF1EA89CF` |
| `EasyProject_0.1.0_darwin_x64.dmg`            | 7,060,183 | `20FF9FAB994A24B07840C5FD37F35C02CF8D52AC21643071D64CB9D70F1CCEC5` |

The refreshed candidate passed ESLint, 77 Vitest tests, 15 Playwright tests, 18 Rust tests, Rust formatting, the production build, and release metadata validation. It remains an unsigned draft because signing and the outstanding manual smoke-test matrix are unchanged.

## Audited candidate — 2026-10-06

Candidate source: `codex/audit-release-20261006` / `25426627f79988efd069fc2ff3c49ee1f9642a37`. [Actions run 37402521676](https://github.com/15169046827/easy-project/actions/runs/37402521676) completed successfully: the validation and RustSec jobs and all three native build jobs passed. Draft Release ID `404242113` targets that exact source; it remains unpublished. The prior September draft and its assets are retained separately as a clearly named historical draft, not mixed with this candidate.

All six assets were independently downloaded to the E-drive audit workspace. Their bytes and SHA-256 values match GitHub's asset metadata:

| Asset                                         |     Bytes | SHA-256                                                            |
| --------------------------------------------- | --------: | ------------------------------------------------------------------ |
| `EasyProject_0.1.0_windows_x64-setup.exe`     | 5,068,068 | `04A0CD6C790F86D342F917B168F8D2FEC2C2EFF3E6087A2AA6275A834B4B8883` |
| `EasyProject_0.1.0_windows_x64.msi`           | 6,750,208 | `CA6A2282C43A6463595BCEFCFAC626943D58634131EDE433193F46BD2E0C39F0` |
| `EasyProject_0.1.0_darwin_aarch64.app.tar.gz` | 6,775,663 | `9CD3835443DA763A4B67B9B50138D61FEA93D1BD54F6F2CF804089CBAAD2ACEE` |
| `EasyProject_0.1.0_darwin_aarch64.dmg`        | 6,876,035 | `68A70D221BBC2C26EE43635029F2A00ECABA1C8F02CFC794BCE852CB10C90158` |
| `EasyProject_0.1.0_darwin_x64.app.tar.gz`     | 6,994,825 | `F170FB4C6FAB77EB4A08B9FE1924B615A1738E06B266A848DE1447B47BF78109` |
| `EasyProject_0.1.0_darwin_x64.dmg`            | 7,092,386 | `C8071C81BE7B2A9B24CBE8DA9722E65DB0ED268BA9C95AB37A4E09C9B11A8191` |

PE/MSI headers and both Windows product versions (`0.1.0`) passed; both Windows packages are `NotSigned`. Both app archives have safe relative paths, version `0.1.0`, and non-empty Mach-O executables with the correct CPU types: ARM64 `0x0100000c` (18,102,768 bytes), Intel x64 `0x01000007` (18,577,456 bytes). Both DMGs have the UDIF `koly` trailer. No package was installed or executed, and no signing/notarization or real-device acceptance is implied.

These results apply only to the stated source SHA. A newer local Tauri 2 compatibility remediation is in progress and requires its own full gates and rebuilt candidate before use; this table must not be relabeled as evidence for unverified code.

## Required smoke-test matrix

Record the result for every release candidate before publishing. Historical NSIS install/launch/uninstall results below do not validate the changed 2026-10-06 audit candidate; all actual-device acceptance items for that candidate are pending in `audit/EASYPROJECT_RELEASE_ACCEPTANCE_2026-10-06.md`.

| Platform                | Install | Launch  | Create/edit task | Gantt/board drag | Backup/restore | XLSX/ICS exchange | Uninstall |
| ----------------------- | ------- | ------- | ---------------- | ---------------- | -------------- | ----------------- | --------- |
| Windows x64 NSIS        | Pass    | Pass    | Pending          | Pending          | Pending        | Pending           | Pass      |
| Windows x64 MSI         | Pending | Pending | Pending          | Pending          | Pending        | Pending           | Pending   |
| macOS Apple Silicon DMG | Pending | Pending | Pending          | Pending          | Pending        | Pending           | Pending   |
| macOS Intel DMG         | Pending | Pending | Pending          | Pending          | Pending        | Pending           | Pending   |

Installation acceptance also requires confirming that an upgrade preserves the existing application-data database, automatic backups appear in the Data view, restore creates a safety snapshot, and a clean uninstall does not silently remove user-created backup files.

Before publishing, also verify that a schema-v5 export retains plan baselines, an invalid import leaves the current workspace unchanged, an out-of-directory restore is rejected, and an online calendar subscription cannot access localhost or private network addresses.

## Signing status

### Verified current candidate assets — 2026-10-07

Draft404450655, source5e7aced, run37432253128. All sizes and SHA256 match GitHub's digest. No installer was executed. NSIS/MSI versions are0.1.0 and Authenticode is NotSigned. App metadata is0.1.0, Mach-O CPU is ARM0x0100000c / Intel0x01000007; tar paths are safe, DMGs have UDIF trailers. macOS signing/notarization cannot be certified on this Windows host.

| Asset                     |   Bytes | SHA256                                                           |
| ------------------------- | ------: | ---------------------------------------------------------------- |
| darwin_aarch64.app.tar.gz | 6878621 | b1bb92ba10c19322ee29882bb29df35dc3004bf036b818686582274124b0cf55 |
| darwin_aarch64.dmg        | 6977912 | b0ee49eea457fa925f8f913bb713e441fe5c8722d89e4a9968551b4aacf528e5 |
| darwin_x64.app.tar.gz     | 7095788 | 0e5088f8b57fea75bc449465e829d6a7018c54ee6acc08d9557083adeba77aeb |
| darwin_x64.dmg            | 7190861 | 624ed7b308bbbc3fa77a6001bf8f59682c8524ee8615907e6fc5a320115c3b6a |
| windows_x64-setup.exe     | 5146499 | 9eb04adfa9e50a8193814d99996e17435f3a8099eb45a2cd9e7c02201bb1da9c |
| windows_x64.msi           | 6864896 | bcce989702e5941866e3018247169be09946d5d34c383193f507f4c9dffb6120 |

All names above are prefixed `EasyProject_0.1.0_`; downloads are retained in ignored `src-tauri/target/audit-tools/release-37432253128`. Initial local verification misread Windows tar CRLF separators; correcting the diagnostic script and re-running verified all six. This was a diagnostic formatting issue, not a bundle defect.

The previous verified unsigned draft is `404450655` (`v0.1.0`), bound to commit `5e7aced868c0e95c9644a68ce88ac1acc7767171` on `codex/audit-release-20261006-api`. Run `37432253128` passed all five jobs. All six assets were downloaded and independently verified on 2026-10-07; see the table below. Historical drafts `404435429`, `404242113`, and `370399919` retain their assets. This is not signed or real-device release acceptance.

The current workflow intentionally produces unsigned artifacts. Before public distribution, configure Windows and Apple signing credentials according to the official Tauri signing guides, then expose only the required secrets to the release environment. Do not place certificates, private keys, passwords, or notarization credentials in the repository.

After signing is enabled, validate the Windows Authenticode signature and macOS code signature/notarization result before publishing the draft release.

## Current audit candidate — 2026-10-07

Source `ae6c1c3a5e2d326e9b11941c3ff23aae682361f3`, tree `23ffcfdaf9460c72e057b37508868e79494365e5`, is the immutable candidate for run `37572579794` and unsigned Draft `405384157` (`v0.1.0`). The run passed all five jobs; all six new assets were independently verified against official sizes/digests, containers and Mac app versions/architectures (DMG container only, not mounted payload). Historical Draft `404450655` now uses `v0.1.0-audit-5e7aced`, retaining all six asset IDs/sizes/digests unchanged. Nothing has been published.

The local NSIS build for this source passed: 5,187,629 bytes, SHA-256 `2AAF183D1A17851EC9DBF7EEF5F319413FCA1E279C7AD6A2222E30C1436533D6`, ProductVersion `0.1.0`, Authenticode `NotSigned`. It was inspected only, not installed. Final local gates: 170 unit tests, 9 performance tests, 22 browser tests, 28 Rust tests, strict Clippy, Rustfmt, lint, type checks, build and release metadata passed. Official full/production npm audits both returned zero findings with strict TLS. Two chunk warnings and two Linux-only informational dependency findings remain; signing/notarization and the clean-device acceptance matrix are still unverified.

### Independently verified six assets

| Asset                                         |     Bytes | SHA-256                                                            |
| --------------------------------------------- | --------: | ------------------------------------------------------------------ |
| `EasyProject_0.1.0_darwin_aarch64.app.tar.gz` | 6,881,548 | `198036a541a789079ad17e01e31b5bb3c12657f2c501c21412109baa423689d4` |
| `EasyProject_0.1.0_darwin_aarch64.dmg`        | 6,983,693 | `112359a3060a902576e978c375d36fc45736ccc4d82e44cf4173fcdfd31a004e` |
| `EasyProject_0.1.0_darwin_x64.app.tar.gz`     | 7,104,362 | `590d3cd94a557adcd1914fd5b91d3c7181f834086a7b87e622dbe7178fd4703e` |
| `EasyProject_0.1.0_darwin_x64.dmg`            | 7,199,477 | `25d29af59bb140fa171702b91d9e42606fba7ef340080a62bf6e8d3f1e3516bf` |
| `EasyProject_0.1.0_windows_x64-setup.exe`     | 5,149,154 | `0317252673a2f0ef94f74fa7a8713f68d8bf46a42260412736058721de66a1c2` |
| `EasyProject_0.1.0_windows_x64.msi`           | 6,864,896 | `893ffdc28b231f3785db2a39b8e9d9aaa418e2d4f66b2015eb4e1bc82f708eb4` |

MSI was obtained from the same successful workflow artifact and matched the release digest exactly; the redundant partial release download was retained, not deleted. All six files are in the isolated E-drive `src-tauri/target/audit-tools/release-37572579794` directory. Both Windows packages report version 0.1.0 and `NotSigned`. Mac app archives passed path, version and Mach-O CPU checks; DMG payloads were not mounted or run. This is static artifact acceptance, not formal release acceptance.

## Release notes checklist

- Summarize user-visible changes and known limitations.
- State whether artifacts are signed and notarized.
- Link the example project and data-migration notes.
- Include the exact automated test totals and platform smoke-test results.
- Never publish a draft whose artifact validation or restore smoke test failed.

The prepared v0.1.0 draft is in [`RELEASE_NOTES_0.1.0.md`](RELEASE_NOTES_0.1.0.md). Keep it marked as a draft until signing and every required platform smoke test are complete.
