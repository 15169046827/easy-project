# Changelog

All notable changes to EasyProject are documented here.

## Unreleased

- 2026-10-27 delivered: Keep task status cards at192×76px with neutral theme surfaces and dictionary-colored dots instead of full-card saturated fills. Put state names before project names and retain full tooltips. Status filters affect table rows only; refresh overview counts without the status condition while retaining project/search/priority dimensions, with atomic error and stale-response protection. Native light/dark narrow-window and keyboard checks passed; fresh protected desktop/static updates preserved original files/data. No backend, schema, permission, MCP or public Release change.

- 2026-10-27: Delivered standalone MCP70E303F8 after specifically approved connection shutdown and protected backups; 23-tool discovery left real/synthetic databases unchanged. Native narrow-window verification exposed compressed search/reset labels: remove the conflicting global eight-column rule and use the shared component's four/two-column breakpoints with nonwrapping buttons. Full350/110+13 regression passed after a documented local navigation-reset rerun. Website CSS patch deployed without backend restart; repaired desktop passed native narrow light/dark verification and a fresh protected overwrite preserving669 non-program files and all original database rows after startup.

- 2026-10-27 desktop/web delivery (standalone MCP replacement pending): Unify global and project task-list controls, expand child drawers to the visible table width, and provide opaque dictionary-colored status cards with zero-count hiding, icon scope switching, ID-based filtering and whole-section collapse. Persist balanced random colors for new uncolored states at the shared boundary; preserve explicit custom colors and keep built-in display colors consistent across projects. Fresh protected copies and unchanged original records verified; native 1280 light/dark passed, native narrow-window coverage pending. No database migration, automatic legacy cleanup or new public Release.

- 2026-10-27: Safely delivered complete Spanish catalogs, shared website/sign-in/workspace language selection, PrimeVue localization, date/number display, shared Spanish status-alias conflict checks and the product-feedback email link. Desktop, headless and independent MCP updates preserved original data and permissions; public download artifacts remain unchanged. Native 1280px checks passed; native narrow-window/full-keyboard coverage remains unconfirmed.

- 2026-10-26: Deployed the refreshed synthetic website previews and grouped downloads after full regression and a fresh protected server snapshot. All six public assets remain on the same existing release; backend, databases and access configuration are unchanged. No desktop reinstall for this website-only change.

- Candidate: Replace the historical website preview with current synthetic task-list/board captures and a PrimeVue view switch. Group common Windows/macOS installers separately from expandable alternate formats; retain all six assets, checksum and prerelease warnings. No new public release.

- 2026-10-26: Safely installed manual version checks and deployed the public static release index after protected snapshots and data-preservation checks. Native 1280px light/dark checking and scoped release-page opening verified; native narrow-window/full-keyboard/backup-folder checks remain unverified. No new public installer release or backend/database migration.

- Candidate: Add opt-in manual version checks with a bounded, credential-free public release index, explicit internal-build identity and scoped release-page opening. Enforce clean identified source for tagged builds; document the static resource separately from business APIs. Not yet installed or deployed; no automatic updater or new public release.

- 2026-10-26: Activated the approved backend authentication/storage admission protections after an existing-data preflight and fresh protected snapshots. Both databases retain original fields and IDs; no schema migration, automatic cleanup, desktop overwrite or new public release.

- Candidate: Separate authentication rate buckets only behind an explicitly trusted, strictly validated loopback Tailscale proxy, retaining per-client/global budgets and existing authentication boundaries. Add shared remote Web/MCP logical write-admission storage budgets, recovery headroom and read-only deployment preflight; preserve reads and local offline/stdio behavior. No automatic data cleanup, hard-quota claim or schema migration.

- 2026-10-26: Safely activated the approved hierarchy update on the existing desktop, server and independent MCP. Schema7→8 preserves all original fields, IDs, relationships and estimate provenance; protected snapshots retained. MCP clients must reconnect. No new public release or production-ready claim.

- 2026-10-25 (candidate): Keep global and embedded task drawers usable in low-height windows with one-row scrollable status statistics, a bounded minimum task area, precise local scrolling and keyboard scroll padding. Verified both scopes at 960×640 and in an isolated native release window; no real-data deployment yet.

- 2026-10-25 (candidate, not deployed): Project-owned statuses now work with root-level pagination, dual-scope statistics, inline child drawers and ancestor filter context. Schema/JSON8 preserves unestimated, explicit zero and legacy-unknown effort; parents derive weighted progress, effort and dates without double-counting. Shared write boundaries protect completion across ancestors and descendants. Complete task catalogs, derived-date queries and finite-number aggregation are covered by new regressions. Migration/deployment and independent MCP replacement require separate approval; see `docs/PARENT_CHILD_TASK_DISCUSSION.md`.

- 2026-10-24: Safely deployed dictionary/color/full-text fixes and application-managed pointer board dragging to the approved desktop, website, backend and independent MCP. Real Windows synthetic drag/undo, 275 unit tests, 90 production UI and 12 isolated HTTP checks passed. Data/relations/schema/permissions preserved; no new public installer release. Earlier configuration-only native drag candidate failed and was not deployed. Evidence: `docs/STATUS_COLORS_DRAG_CHECKPOINT.md`.

- 2026-10-24 (candidate): Add reusable named status-color presets, prevent same-project case/trim/built-in translated-name duplicates, and validate controlled write dictionaries across MCP/IPC/Web/imports. Validate nested calendar values, preserve legacy data, and consistently rank/color legacy priority aliases. Disable Tauri's Windows drop interception for HTML5 board dragging, add internal drag payloads and broaden full-text hover fallbacks across clipped data. No schema migration or MCP permission change. Parent/child statistics redesign is recorded for later discussion, not implemented.

- 2026-10-24: Fixed-width wrapping task-board columns with independent vertical scrolling, left-aligned bounded cards and full PrimeVue hover text. Restored full task-title hover fallback and isolated navigation actions from page actions on narrow screens; kept task controls and tables reachable. No schema, API or MCP permission changes.

- 2026-10-23: Deployed project-owned task statuses to the approved local desktop, independent MCP and private server release. Protected schema 6→7 migration preserves original account/business fields and relationships; no new public installer release. Exact provenance and validation limits: `docs/PROJECT_TASK_STATUS_CHECKPOINT.md`.

### Project-owned task statuses (2026-10-23, candidate)

- Add schema7 project status dictionaries and stable task references, explicit completion/default properties, dynamic boards and status filtering. Preserve legacy labels in protected, transactional migration.
- Use PrimeVue status selection with cancellable quick-add in task/Gantt dialogs and a separate project management view. Referenced statuses display conflicts and cannot be deleted, including references from soft-deleted tasks.
- Add five MCP status CRUD tools (9/18/23 by scope); task creation requires an existing same-project status ID. Extend JSON/CSV/XLSX7 exchange, backup validation and older backup restore. Current installed schema6 programs have not been replaced; deployment remains separate.

### Product homepage (2026-10-22)

- Add a bilingual, responsive public homepage with product overview, demonstration board image, online/local mode boundaries, MCP documentation, privacy/trial disclosures and an explicit not-yet-public desktop download status.
- Keep historical hash links, explicit `/index.html` workspace entry, desktop startup/storage-error handling and floating windows separate. The homepage does not fetch authentication or workspace data and retains PrimeVue nonce styling.
- No installer is publicly released, and no production data, API contract or MCP permissions are changed. Deployment status: [landing checkpoint](docs/LANDING_PAGE_CHECKPOINT.md).

### UI maintenance (2026-10-22)

- Fix the reproduced `SyntaxError / Button / 17` crash when historical/custom project statuses were passed as an undefined translation key. Known values are translated and unknown values remain safe text; no database status rewrite is performed. Include real vue-i18n, custom-status navigation and HTTP regressions.

- Stabilize project table columns and row heights on hover/focus, keep project names readable with truncation/tooltips, and preserve full semantic UUIDs in named-route navigation.
- Keep project view tabs, task expand buttons, board cards and template selection geometry stable. Board/template buttons, template checkbox and board progress now use actual PrimeVue components.
- Add in-session page-load/render failure feedback and retry/back recovery without reloading away desktop authentication. The historical-status crash was reproduced and fixed; the user confirmed restored pages and associated project tasks after the final safe desktop update.

### Added

- Candidate account profile editor with square, metadata-free compressed avatars and authenticated username changes, Windows current-user DPAPI password saving (opt-in, no automatic sign-in), and administrator-issued 15-minute single-use password recovery. Recovery revokes existing sessions and MCP credentials. Login and new passwords use 6–31 characters without a legacy long-password exception.
- Protected account-schema3 and business-schema6 identity migrations: each owned table has an independent semantic-prefix full UUID ID, separate account/workspace keys preserve storage, all business references are mapped transactionally, original backups and expected ID maps are retained. JSON exports use version6 with v1–v6 imports, and managed schema5 backups are migrated without altering the source.

- Open self-registration for ordinary accounts with isolated workspaces, plus personal remote MCP tokens (read / write / full CRUD scopes, one-time secret display, expiry and revocation). The new stateless Streamable HTTP endpoint shares existing validated entity tools and invalidates stale web revisions; password changes revoke sessions and MCP tokens. Local offline mode and the independent stdio companion remain unchanged.

- Authenticated web/desktop remote workspaces, with a headless Rust server sharing existing domain validation, per-account storage, Argon2id passwords, revocable sessions, first-login password change, administrator account creation, CSRF/origin checks, conflict revisions and pre-write snapshots. Desktop launches at sign-in with an explicit login-free local/offline entry; no automatic migration, merge or error fallback. A dedicated restricted Ubuntu service account and system-level startup unit separate the application from the host administrator. Private Tailscale HTTPS deployment is separate from public release.

- Opt-in local stdio MCP companion: project/task/member CRUD plus project-team membership tools, default read-only permissions, explicit deletion confirmation, write recovery points and privacy-reduced operation audit. Desktop and MCP entity writes share business validation and an atomic SQLite boundary.
- Independent read-only task floating window with nearby task cards, collapse/expand, due dates and progress, optional always-on-top, refresh, and return-to-project navigation. It closes with the main window; Windows behavior has been checked on the current device.
- Project creation templates for blank projects, software releases, marketing campaigns, and writing projects, including work-calendar scheduling and dependency generation.
- Automatic, manual, pre-import, and pre-restore SQLite recovery points with metadata and restore preview.
- Global undo and redo for data-changing actions.
- Project task board with drag-to-status workflow.
- XLSX import/export with worksheet field mapping preview and a downloadable example project.
- ICS project export, member busy-time import, and private published-URL synchronization.
- Schema-v5 JSON/XLSX/CSV exchange for plan baselines and relationship-complete workspace migration.
- Database schema version tracking and regression tests for destructive import and restore paths.

### Improved

- Account avatar menu shares the theme/help toolbar; one-time MCP secrets appear in a separate read-only upper dialog with explicit copy and immediate close cleanup. Workspace conflict refresh reloads data without reloading the page or dropping the desktop memory-only login; actual session expiry still requires sign-in.

- Installation-local storage replaces the Windows AppData default: database/backups/MCP audit in `data`, WebView profiles in `webview`, and an installation-side location config. The Data page accepts a new/empty non-C local directory for verified next-launch migration; unsafe destinations and silent empty fallbacks are rejected. Legacy production data is copied without deleting the source; debug builds remain isolated.

- Dashboard task-status rows keep identical geometry on pointer hover and keyboard focus, avoiding a two-pixel border-induced jump.
- Docked floating balls now peek out as a half-circle on all four edges, reveal the full circle on hover or keyboard focus, and retract on leave. Free-floating, drag and click-to-expand behavior remain available; reduced-motion preferences are respected.
- Unified dashboard cards and list pointer/keyboard states, removed transient attention-row borders, and fixed member-avatar growth/row-height changes. Status totals (including legacy Todo) and overdue cards link to working task filters.
- Task-list and Gantt editors share a PrimeVue slider plus numeric percentage input. Gantt forms now use PrimeVue dialogs and form controls with fixed action footers.
- Floating task windows resize from their edges with a 340×360 minimum and remembered expanded size. Collapse creates a draggable 64px transparent window containing a floating ball; release near any work-area edge docks it, while other positions remain free. Keyboard movement/resize are supported.
- Floating window now lists the five nearest dated unfinished tasks with project navigation, due dates and progress, without manual task selection. Background refresh retains keyed task cards and does not show a transient loading row or resize/focus a window.
- Task editing now uses an independent-draft PrimeVue dialog instead of crowded row editors; hidden table columns stay hidden and cancellation discards unsaved changes. Navigation hover/focus keeps border dimensions stable.
- Aligned route headings, 76px statistic cards, toolbars, and content borders across dashboard/project/task/member pages, with shared responsive spacing and the same outer grid for data/project workspaces.
- Task tables now use fixed-width ellipsis cells, pinned left-aligned names, configurable remembered columns, and parent/predecessor names that remain available across filters and pagination. Predecessors use a clearable PrimeVue selector; delete confirmation is an in-app dialog and search has an inline clear button.
- In-progress statistics are static; short loads no longer flash a gray mask, startup initializes the saved theme before paint, and the floating-window entry is visibly labeled.
- Floating tasks open expanded with explicit loading/error states. Navigation, affected list/form controls, progress and hover details use real PrimeVue components; project/member deletion uses PrimeVue confirmation instead of the browser dialog. Added a component-contract regression check and date-only adapters.
- PrimeVue dynamic theme styles reuse Tauri's per-response style nonce, preserving CSP enforcement and preventing unstyled desktop controls; covered by a strict-nonce production UI regression.
- Completed tasks retain 100% when editing only progress; tasks with children, dependency edges, or plan baselines cannot move across projects and invalidate those relationships.
- Windows now uses an EasyProject-styled title bar with native dragging and minimize, maximize/restore, and close controls while other desktop platforms retain their native window chrome.
- Fixed outer-window scrolling so the custom title bar remains pinned at the top.
- Redesigned the cross-platform application icon around a compact task timeline, with validated Windows transparency, small-size previews, and a seven-size ICO package.
- Windows release builds now use the GUI subsystem, so launching EasyProject no longer opens an extra command-line window.
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
