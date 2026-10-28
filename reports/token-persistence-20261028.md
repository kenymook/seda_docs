# Shared token persistence — 2026-10-28

Implemented one shared Cloudflare D1 document for palette, semantic and component color edits on the existing private Site. Each successful write atomically increments a revision and appends a recovery snapshot. Server validation uses the existing token resolver and source hash. Private Sites identity and same-origin writes are enforced. No additional application login.

Verified locally against real Wrangler D1 (not an in-memory API mock): API validation and cross-origin rejection; optimistic revision conflict; legacy local draft recovery; two isolated browser contexts; protection against stale editor overwrite; restore in a fresh context; offline save failure and retry. The integration script passed twice after fixing early request-body rejection in the local Worker.

TypeScript: PASS. Pilot production build/source audit: PASS. Sites Worker production build: PASS. Existing token-editor browser regression: PASS. Light and Dark screenshots inspected: preview, inspector, navigation and database status remain coherent. Existing root, /tokens and /references/webflow return 200 in the Worker runtime.

Run verify-token-store.mjs only against a disposable local database: it modifies then resets the shared test document. Screenshots are local diagnostics, excluded from Git. Hosted deployment and hosted data confirmation are recorded in the delivery message.

Limits: this persists editor settings; tokens.json/library releases remain an explicit release operation. A future baseline hash change needs a deliberate stored-patch migration and currently blocks writes. A conflict exposes explicit load-shared/keep-local actions; no silent overwrite. Recovery snapshots are stored, with no history UI yet.

Follow-up: a clean sibling tab in the same browser now compares against its own confirmed revision, rather than another tab's shared localStorage snapshot. The real-D1 browser suite also checks this focus/pull scenario and passed after the fix. TypeScript, pilot build and Worker build passed again.
