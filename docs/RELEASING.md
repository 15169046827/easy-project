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

The `main` candidate at merge commit `f64aa4f` was rechecked locally:

- ESLint passed with zero warnings.
- Vitest passed 71/71 tests, including four release-artifact validation tests.
- Playwright passed 14/14 Windows WebView tests.
- Rust formatting and 18/18 Rust/SQLite tests passed.
- The production frontend build and v0.1.0 release metadata check passed.
- `EasyProject_0.1.0_x64-setup.exe` rebuilt successfully as an unsigned 5,092,787-byte NSIS installer with SHA-256 `A1C8AA40AD307DCA05D4612AEAF346EAFB2455F177F25B71D4DCBCE6E8BB0BF9`.
- Artifact validation was strengthened so a macOS `.app` directory must contain at least one non-empty file.

The local MSI attempt reached WiX after compiling the application but could not run ICE validation because the host Windows Installer service was unavailable. No MSI was accepted from that attempt and validation must be completed on the GitHub Windows runner. The release workflow remains unexecuted until GitHub Actions access is reauthenticated; this does not change the automated or manual acceptance criteria below.

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
