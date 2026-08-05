---
name: Artifact registration for pre-built dirs
description: How to register an artifact when a subagent built its files before artifact.toml existed
---

Subagents cannot register artifacts. If one builds a full artifact directory without an `artifact.toml`, `verifyAndReplaceArtifactToml` cannot create it (fails NOT_FOUND, and with an empty stub fails "cannot change artifact id").

**How to apply:** Move the built dir aside, run `createArtifact` with the same slug (scaffolds + registers + creates workflow), then overlay the built `src/`, `public/`, `index.html`, `tsconfig.json`, `scripts/` onto the scaffold and delete the temp copy. Also give video artifacts a unique previewPath — never `/`, which the hero owns.

**Why:** Hit this on the FeelFed video build (Aug 2026); the createArtifact-then-overlay route worked cleanly on the first try.
