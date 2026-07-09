# 2. Expo React Native with a Swift native module

Date: 2026-07-09

## Status

Accepted

## Context

Borrowise has two jobs that pull in different directions. As a **product**, it needs to ship
fast across iOS (first) and Android (soon), with offline loan math, live market-rate data, a
home-screen widget, and a secure sign-in/backup path. As a **portfolio**, it must
demonstrably prove depth in React Native + TypeScript *and* in native Swift/SwiftUI, plus a
credible API-security and testing story.

We framed the native-vs-cross-platform question using publicly documented industry practice —
notably the engineering blog post "Building a Mobile App: Zero to One", which frames the choice
as native for high-interactivity UX and webview/cross-platform for surfaces that need fast
iteration. (The company that authored that post is named only as the source of a cited public
article, in keeping with this project's rules.)

## Decision

- **Framework:** Expo (latest SDK) + React Native **New Architecture** + **TypeScript strict**.
- **Routing:** expo-router (file-based).
- **State:** TanStack Query for server state; Zustand for client state.
- **Layering:** Screen/Component → Hook(Service) → **Domain (`core/`, pure, zero React)** →
  API Client (`integration/`). `core/` stays framework-free so unit tests are near-instant and
  the business logic is portable.
- **Three-tier auth spectrum**, one integration per rung, to make API-security trade-offs concrete:
  1. **No auth** — U.S. Treasury FiscalData average interest rates.
  2. **API key** — FRED series; key via `.env` + EAS secrets, never committed (`.env.example` shipped).
  3. **OAuth 2.0** — Google, Authorization Code + **PKCE** (no client secret on native); tokens in
     Keychain/SecureStore. (Stretch: Plaid Sandbox link-token exchange.)
- **Native depth:** a Swift module via the **Expo Modules API** bridging an **App Group** shared
  store, plus a **WidgetKit** widget in SwiftUI. We keep **CNG (prebuild)** rather than ejecting.
- **Testing pyramid:** Jest + React Native Testing Library (unit/component) → Maestro (E2E) →
  XCTest (Swift). CI retries flaky tests in isolation before failing.

## Consequences

- **Positive:** proves every target keyword (React Native, TypeScript, native Swift, WidgetKit,
  OAuth/PKCE, CI/CD, testing strategy) with real code; `core/` purity keeps the fast-test feedback
  loop tight; the deliberate three-tier auth design becomes the README "API Security" teaching section.
- **Negative / cost:** the App Group + native module requires a config-plugin/prebuild step and
  raises CI matrix complexity (JS + native). WidgetKit work is iOS-specific and will not carry to Android.
- **Rejected alternatives:** bare React Native (loses Expo/EAS velocity and the OTA story); Flutter
  or fully-native iOS (off-target for a React Native role); webview-only (fails the native-depth
  signal the portfolio must send).
