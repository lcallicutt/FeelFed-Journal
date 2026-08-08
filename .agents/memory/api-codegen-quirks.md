---
name: API codegen quirks (orval + zod)
description: Gotchas when editing lib/api-spec/openapi.yaml and running codegen in this workspace
---

Durable compatibility decisions for the OpenAPI codegen pipeline:

- Orval's zod output must stay pinned to v3 (`override.zod.version: 3`); the workspace ships zod v3 and unpinned output uses v4-only syntax that fails typecheck.
- Generated zod schemas strip unknown fields even with `additionalProperties: true`; for flexible JSON payloads, validate with the schema but persist the raw body.
- Don't mix path and query params on one operation — the generated names collide (TS2308); prefer a request body for such operations.
