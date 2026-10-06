# EasyProject v0.1.0 release notes (draft)

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
