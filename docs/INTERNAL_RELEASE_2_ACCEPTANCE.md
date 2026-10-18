# EasyProject Internal Test 2 acceptance

## Scope and identity

- Date: 2026-10-18. Unsigned internal testing only; no public release.
- Source: `0c38194bff24730427cf263f34277b2b3f2cf1d8` on `codex/audit-release-20261006-api`.
- Run: [39105705643](https://github.com/15169046827/easy-project/actions/runs/39105705643).
- Draft: `416293740`, tag `v0.1.0-internal.2`, draft/prerelease, exact target source verified. App version remains 0.1.0.
- Applicable rules: UPARS 1.1.0, repository data-preservation, PrimeVue/CSP and quota rules; WACAS undefined/pending confirmation.
- [Continuation checkpoint](INTERNAL_RELEASE_2_CHECKPOINT.md). This is release verification, not a new full-code audit.

## Automated verification

- Remote validation and RustSec jobs passed. Lint, frontend types, production npm audit, unit/performance/browser tests, production build, Rust formatting, strict all-target Clippy, Rust tests, release metadata and UPARS checks passed.
- Remote browser regression: 55 passed. Performance: 9 passed. Rust: 40 unit tests and one isolated stdio integration passed.
- Local frontend regression: 214 tests / 43 files passed; lint/typecheck/release metadata/diff passed.
- Two earlier runs failed before draft creation. Exact log diagnosis identified CRLF in `scripts/check-runtime-database.cjs`; `.cjs` LF attributes and regression now cover the actual file. TypeScript LF protection from the earlier attempt is retained. Windows autocrlf checkout of all three declaration/CommonJS files verified LF. No rule was disabled.
- RustSec retained the same five approved informational advisories; no new vulnerability blocker. Existing exceptions remain limited to current Windows/macOS internal testing, owner Ym_Li, review by 2026-10-22 or relevant dependency/resource/platform changes, whichever comes first. Linux support is not approved.

## Artifact verification

All six workflow jobs completed successfully (validation, security, reservation and three platform builds). All six files were downloaded independently to `src-tauri/target/audit-tools/release-39105705643-node` on E: and match official sizes/digests. Both Mac app archives have safe paths, version 0.1.0 and expected ARM64/Intel Mach-O CPUs (executables 18,671,136 / 19,180,896 bytes). Both DMGs have UDIF trailers; payloads were not mounted. Windows NSIS/MSI headers pass, versions are 0.1.0 (MSI queried read-only from its Property table), signatures NotSigned. Do not substitute historical Internal Test 1 or a local installer for this candidate.

The first static check ran while the Intel DMG was still incomplete and correctly failed its size/digest gate; no package was executed. After the downloader completed with all six verified, the full independent check passed. Slow/redundant partial downloads are retained separately and are not delivery files.

| Asset suffix (prefix `EasyProject_0.1.0_`) | Asset ID | Bytes | GitHub SHA256 |
| --- | ---: | ---: | --- |
| darwin_aarch64.app.tar.gz | 652765927 | 8389304 | e6385d288d917d8252f1418f01a0fa51fda78770f5d43d148b135729996187e4 |
| darwin_aarch64.dmg | 652765899 | 8486272 | 28d365eeeb8bd7df1b376f459850b6401fe87ab33ec60ab5e652e9238046d317 |
| darwin_x64.app.tar.gz | 652772584 | 8702358 | 7f70c3d32207a795c981e2d25d36ffc244ac39cc39efaff61a515d74e98b53ce |
| darwin_x64.dmg | 652772521 | 8792161 | 9f7d950ab67821ba741432f1e38b07826aedf25df2253023ea7ffe4e0b8e53d8 |
| windows_x64-setup.exe | 652769048 | 5545518 | 49fa4d662aea7ed342e765554c2da6058d9c8ca2c787035f6abbf2ec50ae7097 |
| windows_x64.msi | 652769016 | 8499200 | 0e19746b24a071c26363660453adf5110aedbe53ba75bb9362a615e1110636b1 |

The old draft `406330701` was checked independently: exact old source, six asset IDs, sizes and GitHub digests match the saved baseline. No historical asset was overwritten.

## Current Windows installation and runtime

The exact downloaded NSIS was installed over the existing E-drive directory, exit 0. Installer SHA256 `49FA4D662AEA7ED342E765554C2DA6058D9C8CA2C787035F6ABBF2EC50AE7097`; installed executable SHA256 `390CAF9560292F95935A9E4B8CCD257213F3FF9A0C659FD113D7C75A6A884167`. Previous installed executable SHA256 `CA484D91A665D2967C456EF4F4FF1BDD42A43462D99E8F9BE7D5EF53134993F8`.

Before installation, current SQLite read-only integrity is `ok`, foreign-key errors zero; project/task/dependency/member/team/baseline counts are 1/5/4/0/0/5. Preserve all current files in a fresh E-drive safety directory and verify hashes before/after installation. Existing safety directories must not be overwritten. Installation must remain in the existing E-drive app directory; do not install shared system dependencies.

All 11 existing data files were copied and hash-verified in `src-tauri/target/audit-tools/internal-2-20261018/safety-copy` on E:, then verified unchanged after installation. The install location remains `src-tauri/target/audit-tools/runtime-current-user/app`. Existing WebView2 was confirmed; no shared system dependency was installed. After launch and UI checks, read-only integrity remained `ok`, foreign-key errors zero and six business counts 1/5/4/0/0/5 unchanged.

Actual Windows smoke passed: dashboard loads existing data; Pending state navigates to the five-task filtered list; task edit Dialog displays old values, dependency/parent selectors and slider/percent input, and cancellation returns without saving. Light/dark task-page appearance and dark floating-window appearance are correct. Floating window lists five dated tasks with projects/progress, manual refresh retains window ID and 340×360 layout, collapse produces 64×64 ball and click restores 340×360. Closed the test floating window and restored the original light theme. Installed PE is Windows GUI subsystem; no console was observed in target window checks (not a frame-by-frame startup recording).

Desktop tooling twice rejected cached floating accessibility indexes; re-observed screenshots and coordinate actions succeeded. After closing that secondary window, reselecting/activating the returned main window restored valid input geometry. These were automation-state issues, not saved application failures. No business values were changed. The separately configured MCP executable/client permissions were not replaced by the desktop installer and remain outside this package acceptance.

## Independent conclusions

- Automated source gates: passed for the exact source above.
- Internal artifact/static acceptance: passed for these exact six files, subject to the stated unsigned/internal limitations.
- Current Windows NSIS same-version replacement/data preservation/basic runtime smoke: passed on this development machine, within the scope above; not full cross-platform acceptance.
- Formal production release acceptance: not passed. Windows signing, macOS signing/notarization and actual-device Mac/MSI/clean-device/cross-version/mixed-DPI coverage remain outside verified scope. Same-version replacement is not cross-version upgrade evidence. DMG container inspection alone does not prove mounted payload/runtime behavior.
