# Contributing to EasyProject

Thank you for improving EasyProject. Keep changes local-first, reversible, and compatible with existing user data.

## Before opening a pull request

1. Install dependencies with `npm install` and the Tauri platform prerequisites.
2. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`.
3. Run `cargo fmt --check`, `cargo clippy --all-targets --locked -- -D warnings`, and `cargo test --locked` from `src-tauri`.
4. Run `npm run release:check` when changing dependencies, packaging, version metadata, examples, or release documentation.

Audit and remediation work follows [UPARS 1.1.0](docs/audit/UNIVERSAL_PROJECT_AUDIT_STANDARD.md) and its report template. Production dependency advisories are checked in CI and release validation.

Database changes must be additive or include an explicit migration. Data-exchange changes must retain backward compatibility or document the migration path. Do not commit API tokens, published private calendar URLs, certificates, signing keys, real project databases, or personal backups.

UI changes should support both Chinese and English, light and dark themes, keyboard use, and the existing compact desktop layout.

## Long-task checkpoints and quota gate

The project permanently follows the continuation rules in [AGENTS.md](AGENTS.md). Before a long stage and after each milestone, save a resumable checkpoint and check the five-hour quota when the account tool is available. Below 10% remaining, do not begin another long stage: save progress and pause until the user asks to resume after recovery. Any applicable window at or below 5% also stops new modifications except the minimum checkpoint write. Never use quota resets or scheduled wake-ups without authorization for the current task.
