---
name: Journal sync design
description: Durable decisions behind the FeelFed app's server sync
---

- Identity is a bearer "sync code" (UUID kept client-side), no accounts; users link a second device by pasting the code on the You page. This is an intentional prototype-level trust model.
- Entries are stored server-side as raw JSON. **Why:** kind-specific entry shapes vary widely; loose validation + jsonb keeps the API stable as new check-in kinds appear.
- Identity fallback rule: if durable client storage is unavailable, generate a random per-session id — never a fixed shared fallback (that would merge strangers' journals).
- Incremental sync: GET /entries takes optional `since` (server updatedAt cursor, gte + pre-query serverTime so overlap never gaps); client persists the cursor and only uses it when the local entry cache survived — cursor without cache must fall back to a full pull. Delta merges must never treat entries absent from the batch as local-only/uploadable.
- Boot-sync conflict rules (must stay deterministic): pending-dirty ids and tombstones are persisted client-side and cleared only after server acknowledgement; dirty ids win over the server, tombstoned ids stay deleted, local-only ids are uploaded, otherwise the server wins. Never wholesale-replace the local cache with a server response — that loses offline writes.
