# Contributing to EasyProject

Thank you for improving EasyProject. Keep changes local-first, reversible, and compatible with existing user data.

## Before opening a pull request

1. Install dependencies with `npm install` and the Tauri platform prerequisites.
2. Run `npm run lint`, `npm test`, `npm run test:e2e`, and `npm run build`.
3. Run `cargo fmt --check`, `cargo check`, and `cargo test` from `src-tauri`.
4. Run `npm run release:check` when changing dependencies, packaging, version metadata, examples, or release documentation.

Database changes must be additive or include an explicit migration. Data-exchange changes must retain backward compatibility or document the migration path. Do not commit API tokens, published private calendar URLs, certificates, signing keys, real project databases, or personal backups.

UI changes should support both Chinese and English, light and dark themes, keyboard use, and the existing compact desktop layout.
