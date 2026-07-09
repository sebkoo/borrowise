# Borrowise — Project Rules

## Mission
Portfolio-grade, open-source loan intelligence app (React Native + Swift). Primary
audience: hiring teams at fintech mobile orgs. Quality bar: "Insist on High Standards."

## Hard rules
- Conventional Commits; one logical change per commit; never combine refactor with behavior change.
- TDD: failing test first for every feature (Jest/RNTL for TS, XCTest for Swift, Maestro for E2E). `core/` stays free of React imports; coverage gates: core 90%+, overall 80%+.
- No secrets in code or commits. API keys via `.env` (+ `.env.example`) and EAS secrets.
- Every user-facing feature ships with: unit tests, UI/E2E test, demo media in `docs/media/` (`us-XX-<slug>.gif/mp4`), README row update.
- Architecture layering: Screen/Component → Hook(Service) → Domain(core, pure) → API Client(integration). Do not skip layers.
- English only — all code, docs, commits, and session dialogue. Include "Educational tool — not financial advice" where relevant.
- Never use the word "Upstart" in app name, bundle id, or marketing copy.

## Definition of Done (per commit)
typecheck ✓ lint ✓ tests ✓ (media ✓ if UI) README/ADR updated ✓
