# Shared SEDA token storage

This runtime adds Cloudflare D1 to the existing private Site, preserving every static route. The hosting manifest declares DB; Sites provisions the hosted database and applies the generated Drizzle migration. No extra application login is added. The API requires the identity supplied by private Sites in production and rejects cross-origin writes.

From the repository root: build the settings-parametric pilot, install site-runtime dependencies with npm ci, then run npm run db:generate only when changing db/schema.ts. Run npm run build in site-runtime. Its build-api.mjs bundles the real token resolver and copies the pilot output into public. Apply pending migrations locally using the starter commands, then npm start -- --port 5198.

Run node verify-token-store.mjs from the pilot with SEDA_STORE_URL pointing to that local runtime and SEDA_BROWSER_EXECUTABLE pointing to Chrome. The verification mutates and resets the test document: never point it at production.

GET /api/token-document returns one shared document. PUT requires its revision and matching sourceTokensSha256; validation uses applyWorkbenchEdits. D1 atomically checks revision and appends an immutable snapshot to token_history. Browser autosave is debounced and serialized; late writes cannot replace a later revision. New browsers load the shared document. Existing local drafts migrate automatically into an empty database; differing local/shared drafts require an explicit choice and are preserved until resolved. Offline changes retain a browser backup and expose a retry action.

The shared document contains palette, semantic and component color edits. It changes the editor preview; it does not release tokens.json or the library package. A source-hash mismatch blocks writes until an explicit migration is implemented. History is retained in the database; a history browser is outside this change.
