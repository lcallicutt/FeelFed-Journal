# SEO Strategy — FeelFed

## In scope
- Public landing page (`/`) — the only public-facing route; this is the primary SEO surface

## Out of scope
- Authenticated app pages (app is pre-launch; no auth routes currently exist)
- API server endpoints (`/api/**`)

## Target audience
- People managing low appetite, early fullness, energy changes, or hydration tracking — likely with a health condition or appointment-based context
- iOS users interested in a gentle, judgment-free food and body-signal journal

## Primary keywords
- "gentle food journal", "fullness tracker", "appetite journal app", "food logging for low appetite"
- Brand: "FeelFed"

## Rendering strategy
- React SPA (Vite + Wouter) — single public route `/`
- Only the static HTML shell (`index.html`) is visible to social crawlers and AI bots
- Googlebot can render JS (delayed); social preview bots and AI crawlers cannot

## Dismissed categories
- (None yet)
