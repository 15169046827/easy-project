# EasyProject release process

## Current output

The `Release desktop` GitHub Actions workflow builds three native variants:

- Windows x64: MSI and NSIS setup executable.
- macOS Apple Silicon: app bundle and DMG.
- macOS Intel: app bundle and DMG.

Every build is uploaded both to a draft GitHub Release and as an independent workflow artifact. The workflow validates that `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` contain the same version before building.

## Publishing a version

1. Update the same semantic version in the three version files.
2. Run `npm run release:check` and the normal quality gates.
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

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `EasyProject_0.1.0_windows_x64-setup.exe` | 5,037,832 | `C3FFBD703FC21B6BBCF3219E78B81E47D60C5F23FE933B166918ABEF333EF133` |
| `EasyProject_0.1.0_windows_x64.msi` | 6,770,688 | `582443C75E2E184E961FBFFA8F77A45ABD8DE2986E08D112FEF3FFF4785A1236` |
| `EasyProject_0.1.0_darwin_aarch64.app.tar.gz` | 6,733,237 | `4A90D967056A0EB1DEA51DABB22ED9F23CED02568651C2875663CBBBBA7BD098` |
| `EasyProject_0.1.0_darwin_aarch64.dmg` | 6,833,279 | `41FF7DFAE18BA2B5B84893629E11960E22BBFCB2C82D8E3954AA7A9BD85B6DC2` |
| `EasyProject_0.1.0_darwin_x64.app.tar.gz` | 6,959,739 | `7C3994A652E8F2B8FCDC9DC9AF8F238ADDEBE64F4DE280E26474BB1EFCA9187E` |
| `EasyProject_0.1.0_darwin_x64.dmg` | 7,052,619 | `DE270A3E184432C208EAA840442629629B79B71E36186368C5FF2432C08B63F1` |

All six assets were downloaded independently after the run. The Windows files have valid PE/MSI container headers, product version `0.1.0`, and the expected unsigned status. Both app archives contain a non-empty executable (`17,969,120` bytes for Apple Silicon and `18,532,924` bytes for Intel), and both DMGs contain the expected UDIF `koly` trailer. These checks prove build and container integrity only; they do not replace signing or the manual installation matrix.

## Required smoke-test matrix

Record the result for every release candidate before publishing:

| Platform                | Install | Launch  | Create/edit task | Gantt/board drag | Backup/restore | XLSX/ICS exchange | Uninstall |
| ----------------------- | ------- | ------- | ---------------- | ---------------- | -------------- | ----------------- | --------- |
| Windows x64 NSIS        | Pass    | Pass    | Pending          | Pending          | Pending        | Pending           | Pass      |
| Windows x64 MSI         | Pending | Pending | Pending          | Pending          | Pending        | Pending           | Pending   |
| macOS Apple Silicon DMG | Pending | Pending | Pending          | Pending          | Pending        | Pending           | Pending   |
| macOS Intel DMG         | Pending | Pending | Pending          | Pending          | Pending        | Pending           | Pending   |

Installation acceptance also requires confirming that an upgrade preserves the existing application-data database, automatic backups appear in the Data view, restore creates a safety snapshot, and a clean uninstall does not silently remove user-created backup files.

Before publishing, also verify that a schema-v5 export retains plan baselines, an invalid import leaves the current workspace unchanged, an out-of-directory restore is rejected, and an online calendar subscription cannot access localhost or private network addresses.

## Signing status

The current workflow intentionally produces unsigned artifacts. Before public distribution, configure Windows and Apple signing credentials according to the official Tauri signing guides, then expose only the required secrets to the release environment. Do not place certificates, private keys, passwords, or notarization credentials in the repository.

After signing is enabled, validate the Windows Authenticode signature and macOS code signature/notarization result before publishing the draft release.

## Release notes checklist

- Summarize user-visible changes and known limitations.
- State whether artifacts are signed and notarized.
- Link the example project and data-migration notes.
- Include the exact automated test totals and platform smoke-test results.
- Never publish a draft whose artifact validation or restore smoke test failed.

The prepared v0.1.0 draft is in [`RELEASE_NOTES_0.1.0.md`](RELEASE_NOTES_0.1.0.md). Keep it marked as a draft until signing and every required platform smoke test are complete.
