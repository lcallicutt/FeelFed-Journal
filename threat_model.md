# Threat Model

## Project Overview

FeelFed is a Node.js/Express (v5) REST API backed by PostgreSQL (Drizzle ORM) that lets users log personal wellness moments — fullness, energy, hydration, and free-text reflections. The frontend is a React SPA. The app is not yet deployed. Users are identified only by a client-generated `deviceId` stored in `localStorage`; there is no account system or authentication as of this scan.

Tech stack: pnpm workspaces, Node.js 24, TypeScript 5.9, Express 5, PostgreSQL, Drizzle ORM, Zod, esbuild.

## Assets

- **Wellness journal entries** — rows in the `moments` table: fullness, energy, hydration, and personal reflection text. This is sensitive personal health data. Compromise allows reading strangers' health records or corrupting a user's journal history.
- **Email addresses** — rows in the `waitlist_entries` table. Compromise enables spam/phishing targeting.
- **`DATABASE_URL`** — Postgres connection string. Compromise gives full database read/write access.
- **`deviceId` identifiers** — client-generated UUIDs used as the sole access control token for a user's journal. Not a true secret (appears in all API responses); currently the only thing separating one user's data from another.

## Trust Boundaries

- **Browser / API** — All client requests cross this boundary. The API must authenticate and authorize every request; the browser is fully untrusted. **Currently this boundary is not enforced**: the API accepts any `deviceId` from any caller.
- **API / PostgreSQL** — The API server has direct Postgres access via `DATABASE_URL`. SQL injection at the API layer would give full database access. Drizzle ORM uses parameterized queries, mitigating this.
- **Public surface** — All three API routes (`/api/health`, `/api/moments`, `/api/waitlist`) are public with no authentication. The `moments` routes expose and accept private user data with no auth checks.

## Scan Anchors

- Production entry points: `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/`
- Highest-risk area: `artifacts/api-server/src/routes/moments.ts` — no auth, personal health data, client-supplied scope
- Public surface: all routes (`/api/health`, `/api/moments`, `/api/waitlist`) — zero auth
- Authenticated surface: none yet
- Dev/build-only: `artifacts/mockup-sandbox/`, `scripts/`, `lib/api-spec/`, `lib/api-zod/` (codegen output)
- Database schema: `lib/db/src/schema/`

## Threat Categories

### Spoofing

The application has no user identity system. The `deviceId` acts as both identifier and implicit credential, but it is client-generated, appears in every API response, and is never verified server-side. Any caller who supplies a valid `deviceId` is treated as that device's owner. Until a real authentication mechanism is added, any request can spoof any device identity.

**Required guarantee:** All endpoints that read or write personal journal data MUST validate the caller's identity through a server-issued, tamper-evident credential (e.g., signed JWT or session token) before acting on the supplied device or user identifier.

### Tampering

The Zod schemas validate numeric field ranges (0–10) and email format. However:
- `reflection` and `deviceId` have no maximum length, allowing oversized writes.
- Without rate limiting, an attacker can inject unlimited fabricated moments into any user's journal by supplying their `deviceId`.

**Required guarantee:** String inputs MUST have maximum length constraints. POST endpoints MUST verify the caller owns the target `deviceId` before persisting data.

### Information Disclosure

`GET /api/moments?deviceId=X` returns the complete journal history for `X` with no ownership check. CORS is configured as `cors()` (allow-all), so any web page can read a user's journal cross-origin if the attacker knows the `deviceId`.

Database errors in the waitlist route are logged via `console.error` which may surface Postgres connection strings or query details in log aggregators.

**Required guarantee:** Journal data MUST only be returned to authenticated callers who own the requested `deviceId`. CORS MUST be restricted to known frontend origins. Error logs MUST NOT expose connection strings or raw SQL errors.

### Denial of Service

No rate limiting exists on any endpoint. An attacker can:
- Flood `POST /api/moments` with max-size `reflection` payloads, exhausting database storage.
- Flood `POST /api/waitlist` with unique emails, growing the table without bound.

**Required guarantee:** All public write endpoints MUST apply per-IP rate limiting. String fields MUST have maximum length validation.

### Elevation of Privilege

There are no admin routes or role-based access control at this time, so privilege escalation between roles is not yet a concern. The more immediate issue is horizontal privilege escalation: any caller can access any other caller's data by supplying their `deviceId`. This is addressed under Spoofing and Information Disclosure above.
