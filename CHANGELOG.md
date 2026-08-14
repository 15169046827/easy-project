# Changelog

All notable changes to EasyProject are documented here.

## Unreleased

### Added

- Project creation templates for blank projects, software releases, marketing campaigns, and writing projects, including work-calendar scheduling and dependency generation.
- Automatic, manual, pre-import, and pre-restore SQLite recovery points with metadata and restore preview.
- Global undo and redo for data-changing actions.
- Project task board with drag-to-status workflow.
- XLSX import/export with worksheet field mapping preview and a downloadable example project.
- ICS project export, member busy-time import, and private published-URL synchronization.
- Schema-v5 JSON/XLSX/CSV exchange for plan baselines and relationship-complete workspace migration.
- Database schema version tracking and regression tests for destructive import and restore paths.

### Improved

- Unified dashboard metric typography, table pagination width, card heading scale, member role wrapping, localized empty states/onboarding, and readable task dates across desktop window sizes.
- Data recovery verifies backup integrity and creates a rollback point before restore.
- Release documentation now includes a platform installation and data-safety smoke-test matrix.
- Project owners and task assignees are kept in the project team; invalid assignments and unsafe member removal are rejected.
- Online calendar synchronization rejects local/private targets and unsafe redirects.
- Desktop security now uses an explicit CSP, scoped file-reveal permission, reduced production logging, and a managed backup-directory boundary.
- Gantt image capture is loaded only when requested, reducing startup work.
- Release artifact validation now confirms that macOS app bundles contain non-empty files instead of accepting an empty `.app` directory.

### Known limitations

- Calendar URL sync is read-only and on demand; OAuth, recurring-event expansion, complete timezone conversion, and two-way updates remain future work.
- Public release artifacts remain unsigned until project-owned Windows and Apple signing credentials are configured.
- Large XLSX and holiday-data chunks remain candidates for further lazy loading and regional data reduction.
