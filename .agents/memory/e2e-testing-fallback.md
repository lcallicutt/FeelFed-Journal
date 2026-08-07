---
name: E2E testing fallback in this workspace
description: The testing subagent kind is unavailable here; how to run Playwright regressions locally instead
---

## Rule
`subagent({ config: { $kind: "testing" } })` errors with "Unknown config kind: testing" in this workspace. Run Playwright directly instead.

**Why:** Discovered Aug 2026 while automating the journal edit regression; the testing skill exists but the kind is not registered.

**How to apply:**
- Scripts live in `.agents/e2e/` (own package.json with `playwright-core`).
- `npx playwright-core install chromium` fails on NixOS; use a nix chromium binary via `executablePath`, e.g. `/nix/store/5afrhwm7zqn1vb7p5z1mc2rkh2grsfgz-ungoogled-chromium-138.0.7204.100/bin/chromium` with `--no-sandbox --disable-dev-shm-usage`.
- FeelFed app quirks: hero ring knobs are `[role="slider"][aria-label="fullness level"]` etc. — use `.focus()` + arrow keys (click is intercepted by ring circles). Edit-form Radix sliders put aria-label on the root, so select thumbs by index. Close sheets via the "Close" button, not Escape.
- Store is in-memory: never reload mid-test.
