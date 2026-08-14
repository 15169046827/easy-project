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
