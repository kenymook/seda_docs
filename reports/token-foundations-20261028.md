# Foundation editor — 2026-10-28

Added six functional rail sections: Typography, Radius, Spacing, Border width, Motion and Opacity. They cover the 216 existing non-color leaves across foundation and both semantic modes. There are no new token namespaces or source-token changes.

Selection, typed editing, validation, specimen preview, reset and shared autosave use the existing workbench document. Typography previews include the existing compileTypography/createTypographyBindings pipeline and actual SEDA Text. Other specimens render the selected primitive in a layout, radius, border, opacity or motion example. They do not pretend to recompile installed controls' geometry. The shell remains 14px; the rail remains 54px with 4px gaps and tooltip-only labels.

Validation: finite numbers and bounded ranges, font weight/family syntax, easing syntax and control points, lineHeight at least font size, full existing color alias resolution. Numeric leaves are materialized as numbers while stored patch values remain strings, preserving old color patches and the shared database schema.

Verification passed: TypeScript; audited pilot production build; Worker production build; verify-foundations.mjs model assertions and browser interactions; previous verify-token-editor.mjs regression; verify-token-store.mjs against real local D1 with combined color/spacing edits and reload. Two themes, all six sections and 390px navigation were checked. Screenshots for both themes were visually inspected.

Limits: foundation specimens and typography bindings are previews. Applying settings to every reference application or releasing tokens.json/package builds remains separate. Component size profiles are not duplicated as new foundation tokens. No new font download service, elevation geometry tokens or database migration was introduced. Full CI and non-Chromium verification were not rerun for this scope.

Production follow-up: older open editor tabs were observed replacing a new scalar edit with an empty color-only document. Writes now require clientVersion 2, rejecting old clients with 428. New local/confirmed backups use v2 keys and import v1 only when v2 does not exist. The real-D1 suite verifies legacy write rejection and survival after a simulated legacy backup overwrite. TypeScript, both builds, foundations browser suite, color regression and D1 suite passed after this fix.
