# AI-Assisted Development Workflow

How this repository is actually built: an AI pair (Claude Code) operated under four
engineering disciplines, with a human owning every decision, approval, and push.
This is an engineering report, not a manifesto — every claim links to evidence in
this repo's own history.

> This document grows with the project.

## TL;DR

AI provides velocity; the harness provides quality; the human provides judgment.
None of the three is optional. The interesting part is not that an AI wrote code —
it's that the system around it makes unverified code physically difficult to ship.

## 1. Prompt engineering — sessions run on contracts

Every working session starts from a written kickoff that fixes scope (specific commit-
ledger rows), quality protocol (failing tests shown before any implementation exists),
and a STOP rule (the session ends at a declared boundary with a summary and handoff —
no unbounded wandering). Model selection is part of the contract: high-reasoning models
for architecture and planning, faster models for execution within an approved plan.

Evidence:
- Commit [`8ed4a4d`](https://github.com/sebkoo/borrowise/commit/8ed4a4d) (`feat(core): amortization engine`)
  records the red run ("2 suites / 0 tests — Cannot find module") before implementation
  existed — the kickoff demanded that ordering, and the commit body proves it happened.
- The commit cadence itself shows session boundaries: bootstrap (#1), toolchain
  (#2–#6), engine + UI + E2E (#7–#9), each ending exactly where its contract said.

## 2. Context engineering — one source of truth that survives sessions

State lives in versioned documents, not in anyone's memory:
- A **commit ledger** (#1–#33) fixes each commit's scope, files, and verification
  method before work starts.
- **[CLAUDE.md](../../CLAUDE.md)** is the standing rulebook (committed in the very
  first commit): Conventional Commits, TDD gates, layering, no-secrets policy,
  English-only, media protocol.
- **ADRs** record architecture decisions with alternatives considered
  ([0002](../adr/0002-expo-react-native-with-swift-native-module.md): why Expo+RN
  with a Swift native module).

The context is a living document, not a shrine. When the ledger was found to be
missing slots for two user stories (onboarding, schedule screen), it was amended,
renumbered #1–#32, and the amendment note dated and recorded — then verified for
duplicate slot numbers before work continued. It was amended a second time,
mid-session, to insert this very document as commit #13 — the ledger describing
its own growth in real time, not just in retrospect.

## 3. Harness engineering — the machine enforces the quality bar

The harness is the set of mechanisms that make "trust me" unnecessary:

- **Commit hooks** (`commitlint` + `lint-staged`): the hooks rejected this project's
  own commits twice — once for a non-conventional message (the negative test recorded
  in commit [`0f5e766`](https://github.com/sebkoo/borrowise/commit/0f5e766)'s body), once for a capitalized
  subject. Rules that don't bind their author aren't rules.
- **Coverage gates** (`jest.config.js`): global 80% floor from day one; a stricter 90%
  gate on `core/` that self-activates the moment the directory exists (commit
  [`5b52129`](https://github.com/sebkoo/borrowise/commit/5b52129) explains the conditional-registration
  mechanics). When `core/` landed at #7, the gate went live and the engine shipped at
  100%.
- **Tiered command approvals**: file edits are auto-accepted (reviewed later in commit
  diffs); every shell command, package install, and git operation requires human
  approval. This gate earned its keep when a dependency with a suspicious-looking name
  (`test-renderer`) was held at the approval prompt and only installed after verifying
  its provenance (same maintainer as @testing-library/react-native; documented rename
  of `universal-test-renderer`; exact peer-range match).
- **CI as the outer harness**: run #1 failed immediately and correctly — typecheck
  passed locally only via a gitignored generated file (`expo-env.d.ts`), which CI's
  clean checkout exposed as TS2882. Root cause and fix in commit
  [`39a258e`](https://github.com/sebkoo/borrowise/commit/39a258e). The e2e job uploads failure artifacts,
  which later turned a CI-only Maestro failure into a five-minute diagnosis (see §4).

## 4. Loop engineering — incidents become rules, rules become behavior

The feedback loop is the discipline of converting failures into committed process:

- **The 1h28m stall.** A backgrounded native build was awaited open-endedly; its
  actual failure (a corrupted Metro bundle) went unnoticed for 88 minutes. The fix
  was not just fixing the bundle — it was a rule, committed to CLAUDE.md
  (commit [`1189a92`](https://github.com/sebkoo/borrowise/commit/1189a92)): poll long-running work on a
  bounded schedule with a hard ceiling, then surface the log tail and decide. Later
  sessions demonstrably follow it — the CI-verification loop for commits #10–#12
  used 90–180s scheduled wake-ups, each scoped to the specific step in flight (not
  a single fixed wall-clock deadline for the whole run), and every wake-up either
  reported real progress or escalated with a log tail, never a silent re-wait.
- **The Metro bundling break behind that stall** was itself root-caused, not retried:
  expo-router's `require.context` scans everything under `src/app/`, including a
  colocated test file, dragging jest tooling (and Node's `console`) into the native
  bundle. Fix and full explanation in commit
  [`0a31dd1`](https://github.com/sebkoo/borrowise/commit/0a31dd1).
- **The e2e failure artifacts loop**: the CI e2e job was designed to upload Maestro
  debug output on failure. Its first real failure was diagnosed from those artifacts
  in minutes — an iOS "Open in Borrowise?" system dialog stuck over the UI — and fixed
  at the flow level (commit [`35ce256`](https://github.com/sebkoo/borrowise/commit/35ce256)), with the
  3-attempt retry explicitly kept as a net for ordinary CI noise, *not* as a
  workaround for the diagnosed bug.
- **The same-hypothesis loop, closed**: repeated same-hypothesis retries during a
  network diagnosis needed a human to interrupt. That gap became its own CLAUDE.md
  rule — commit [`1bf45b3`](https://github.com/sebkoo/borrowise/commit/1bf45b3): two same-hypothesis failures
  now mean stop, summarize evidence, and either pivot or escalate, not retry a third
  time.

## What the human owns

Scope and priorities; the tiered-permission gate that every shell command, install,
commit, and push runs through — file edits auto-apply within the session's approved
ledger scope, but shell commands are approved case by case or under a revocable
standing policy, never unconditionally; name/trademark verification; API keys and
secrets (never pasted into sessions; `.env` + EAS secrets only); legal and
store-compliance calls; and the final read of every diff. The AI proposes; the
harness constrains; the human decides.

## Why publish this

Velocity claims are cheap. Gated velocity — where the gates are public, versioned,
and demonstrably enforced against the author's own commits — is engineering.
