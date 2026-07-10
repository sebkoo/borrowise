# 3. Bottom tab navigation

Date: 2026-07-10

## Status

Accepted

## Context

Through commit #11 the app was a single screen (`src/app/index.tsx`): the home screen with
the loan calculator. Commit #12 adds a market/benchmark dashboard (US-04/US-05), and the
amended ledger (session 4) adds an amortization schedule screen at #13 (US-03) and an
onboarding flow at #14 (US-01). That's three peer, always-reachable screens (home/calculator,
dashboard, schedule) plus one pre-app gating flow (onboarding, shown once before any of them).
No navigation pattern had been decided yet; `src/app/_layout.tsx` was a bare `Stack` wrapping
a single route.

## Decision

- **Peer screens (home, dashboard, schedule) use an expo-router `Tabs` group** at
  `src/app/(tabs)/`, with a bottom tab bar. `src/app/(tabs)/index.tsx` (home/calculator) and
  `src/app/(tabs)/dashboard.tsx` (market dashboard) are the first two tabs; the schedule screen
  slots in at #13 as a third tab.
- **Onboarding (#14) stays outside the tabs group**, as its own route in the root `Stack`
  (`src/app/onboarding.tsx` or similar), shown once before the tab navigator when no local
  profile exists yet — a gate, not a peer destination.
- The root `_layout.tsx` `Stack` keeps `headerShown: false`; the `Tabs` layout provides its own
  bar and per-tab titles/icons instead of a stack header.
- No new dependency: `expo-router`'s `Tabs` re-implements bottom-tabs internally and only needs
  peer packages already installed (`react-native-screens`, `react-native-safe-area-context`,
  `react-native-reanimated`, `react-native-gesture-handler`) — confirmed present before deciding.

## Alternatives considered

- **Stack + a simple "View market rates" link/button** from the home screen, pushing
  `/dashboard` with a back button. Less upfront UI work, but doesn't scale past two screens —
  #13's schedule screen would need the same treatment days later, likely forcing a rewrite into
  tabs anyway. Rejected as a short-term save that creates near-term rework.
- **Single scrolling home screen**, appending the dashboard as a second section below the
  calculator (no new route). Avoids the navigation decision entirely, but doesn't match the
  ledger's `app/dashboard` file-path expectation for #12, and pushes the same three-peer-screens
  problem to #13 unresolved. Rejected.

## Consequences

- **Positive:** standard, discoverable pattern that scales cleanly as #13 adds a third tab;
  matches typical fintech-app UX (Mint, Copilot, etc. all use bottom tabs for peer sections);
  no new dependency to audit or version-pin.
- **Negative / cost:** requires moving `src/app/index.tsx` → `src/app/(tabs)/index.tsx` and
  updating its colocated screen test's import path; the root `Stack` now needs a documented
  contract for #14 (onboarding gates the tab navigator, not vice versa) so the routing intent
  doesn't drift as more screens are added.
