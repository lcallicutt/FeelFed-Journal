---
name: FeelFed project overview
description: Key decisions, asset paths, and conventions for the FeelFed design system and hero screen artifacts
---

## Design system (`artifacts/feelfed-ds`)
- Package: `@workspace/feelfed-ds`, consumed via `@import "@workspace/feelfed-ds/styles.css"` in any web artifact
- Fonts: Fraunces = display/serif (font-serif), Poppins = UI labels (font-sans), Lato = body/prose (font-mono slot — non-standard but intentional)
- Palette hex: cream #FBF7F2, teal #3A8F88, deep teal #1F4E49, peach #F0A576, water blue #5FA8C4
- Base radius: 0.75rem (organic/soft feel)
- Logo assets: `artifacts/feelfed-ds/docs/references/logos/feelfed-cream-logo.png` (bowl mark, cream bg) and `feelfed-teal-icon.png` (app icon/favicon)
- Fonts are loaded via `@import url(...)` baked into `scripts/theme-template.css` → generated into `src/index.css` and exported via `styles.css`
- Token API: `tokens.color.light.*`, `tokens.color.dark.*`, `tokens.fontFamily.{sans,serif,mono}`, `tokens.radius`, `tokens.spacing`
- Build env vars: PORT and BASE_PATH default to "5173" and "/" (no throw if missing)
- allowedHosts: explicit list of localhost + .replit.dev + .repl.co (not `true`)

**Why:** Lato in font-mono slot is intentional — it's the reading/prose face for FeelFed, not monospace.

## Hero app (`artifacts/feelfed-hero`)
- Slug: `feelfed-hero`, previewPath: `/`
- Frontend-only react-vite, no backend
- Logo files at `public/logo.png` (cream mark) and `public/favicon-512.png` (teal icon)
- Three concentric SVG rings (fullness outer r=140, energy middle r=105, hydration inner r=70), pointer-capture drag
- CSS custom properties: `--fullness`, `--energy`, `--hydration` (0–1 each) on document.documentElement
- Key components: `DraggableRings.tsx`, `MoteCanvas.tsx`, `AmbientLayer.tsx`, `ReflectionCard.tsx`
- Reflection card: 18-line lookup by band (L/M/H for each dimension); typewriter 40ms/char with 600ms debounce
- Ambient: energy → warm overlay + canvas particle motes; hydration → prismatic conic-gradient (high) vs feTurbulence grain (low)
