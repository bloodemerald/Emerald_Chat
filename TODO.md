# Emerald Chat — Update / Upgrade / Fix TODO

A practical backlog you can work through in phases.

## 1) Immediate stability fixes (high priority)
- [ ] Add error boundaries around major React routes/components so UI failures don’t crash the whole app.
- [ ] Standardize async error handling in API/IPC calls (show user-friendly toast + log full error details).
- [ ] Add validation for all user-configurable settings before saving (prevent invalid state in local storage/config files).
- [ ] Add reconnect logic + status indicators for external integrations (e.g., Twitch/chat services/OBS when disconnected).
- [ ] Add rate limiting/debouncing for high-frequency chat events to avoid UI lag.

## 2) Dependency and platform updates
- [ ] Audit and update npm packages to latest stable versions (`npm outdated` + selective upgrades).
- [ ] Upgrade Tauri + Rust crates and re-test desktop packaging across OS targets.
- [ ] Remove unused dependencies and dead imports to reduce bundle size.
- [x] Enforce a locked Node/Bun version in repo docs and CI for consistent builds.
- [x] Add Dependabot (or Renovate) for automated update PRs.

## 3) Quality and testing improvements
- [ ] Add unit tests for core message parsing, sentiment logic, and utility functions.
- [ ] Add integration tests for chat event pipelines and state updates.
- [ ] Add end-to-end smoke tests (launch app, connect, simulate chat, verify UI updates).
- [ ] Add lint + typecheck + test as required CI checks for PR merge.
- [ ] Add crash/error reporting pipeline (Sentry or equivalent) for desktop runtime issues.

## 4) Performance and reliability
- [ ] Profile rendering hotspots (chat list, overlays, animations) and optimize re-renders.
- [ ] Virtualize long chat lists to keep FPS smooth under high message volume.
- [ ] Move expensive event processing off main thread where possible.
- [ ] Add app startup timing and memory usage metrics for baseline tracking.
- [ ] Implement graceful degradation when AI features or external services are unavailable.

## 5) UX and accessibility fixes
- [ ] Add keyboard navigation and visible focus states for all core controls.
- [ ] Improve contrast and add text scaling options for accessibility mode.
- [ ] Add clearer empty/loading/error states throughout dashboard panels.
- [ ] Add first-run onboarding with defaults and quick integration checks.
- [ ] Add in-app “Reset to safe defaults” for troubleshooting.

## 6) Feature upgrades (from ideas to implementation)
- [ ] Build OBS WebSocket actions (scene/source triggers from chat events).
- [ ] Add streamer control center dashboard (manual triggers + analytics panel).
- [ ] Implement sentiment trend graph with rolling 10-minute window.
- [ ] Add theme editor presets and export/import for configs.
- [ ] Prototype mobile remote web UI for basic app controls.

## 7) Security and data hygiene
- [ ] Review and sanitize all user-generated text before rendering.
- [ ] Store secrets/tokens securely and avoid logging sensitive values.
- [ ] Add config migration/versioning to prevent breakage after updates.
- [ ] Add backup/restore for local app settings.
- [ ] Document privacy behavior for analytics and third-party integrations.

## 8) Documentation and developer workflow
- [ ] Update README with architecture overview + local dev quickstart.
- [ ] Add contributor guide (branching, commit style, testing expectations).
- [ ] Document release checklist (version bump, changelog, packaging, smoke tests).
- [ ] Add troubleshooting guide for common desktop/runtime issues.
- [ ] Keep `UPGRADES.md` as idea bank and track execution in this TODO file.

---

## Suggested execution order
1. Stability fixes + dependency updates
2. CI/testing baseline
3. Performance + accessibility improvements
4. Feature upgrades in small milestones
5. Documentation hardening and release process
