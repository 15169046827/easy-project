# Contributing to EasyProject

Thank you for improving EasyProject. Keep changes local-first, reversible, and compatible with existing user data.

New maintainers and AI collaborators should first read the [handoff entry](docs/handoff/README.md), then its rules, current-state and architecture documents. Historical permissions, test counts and release records must not be treated as current authority without checking the stated source and scope.

## Before opening a pull request

1. Install dependencies with `npm install` and the Tauri platform prerequisites.
2. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`.
3. Run `cargo fmt --check`, `cargo clippy --all-targets --locked -- -D warnings`, and `cargo test --locked` from `src-tauri`.
4. Run `npm run release:check` when changing dependencies, packaging, version metadata, examples, or release documentation.

Audit and remediation work follows [UPARS 1.1.0](docs/audit/UNIVERSAL_PROJECT_AUDIT_STANDARD.md) and its report template. Production dependency advisories are checked in CI and release validation.

Database changes must be additive or include an explicit migration. Data-exchange changes must retain backward compatibility or document the migration path. Do not commit API tokens, published private calendar URLs, certificates, signing keys, real project databases, or personal backups.

The npm lifecycle policy approves only the reviewed `esbuild@0.25.10` setup script; do not add wildcard/all-version approvals. Its native optional packages must stay version-locked. Review a new script/version before changing `allowScripts`; older npm versions do not enforce this field, so it does not replace dependency integrity or CI review.

UI changes should support both Chinese and English, light and dark themes, keyboard use, and the existing compact desktop layout.

## Always-ready handoff

Every change must include an impact check and the corresponding update to `docs/handoff/`, alongside Git and Wolai documentation. Keep rules, architecture, current state, pending work, verification and checkpoints accurate at milestones and before completion or pause. Update affected Wolai handoff content with a date and source commit; do not silently leave the handoff as an obsolete snapshot. Unaffected sections need review, not gratuitous rewrites. If quota, permissions or service failure prevents synchronization, save the exact gap and next step and do not claim all three destinations are synchronized. This is a permanent delivery requirement, not a one-time handoff task.

## Long-task checkpoints and quota gate

The project permanently follows the continuation rules in [AGENTS.md](AGENTS.md). Before a long stage and after each milestone, save a resumable checkpoint and check the five-hour quota when the account tool is available. Below 10% remaining, do not begin another long stage: save progress and pause until the user asks to resume after recovery. Any applicable window at or below 5% also stops new modifications except the minimum checkpoint write. Never use quota resets or scheduled wake-ups without authorization for the current task.
