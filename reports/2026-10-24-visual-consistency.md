# Shared visual consistency — first correction

User finding: matching heights and passing behavior tests did not establish a coherent visual system. Text scaled independently of icons, intrinsic IMG sizes escaped slots, and control content/gaps were inconsistent.

## Changes

- Public `Icon` uses 11 original SEDA SVGs, with typed names and decorative/meaningful accessibility. Source: `assets/icons/seda/icons.json`. No replacement glyphs were drawn.
- Lab derives font, line-height and icon size from the same percentage. The displayed height formula uses the actual derived icon size. Checkbox/Radio/Toggle marks also follow that derived size; IconButton remains square.
- Button, IconButton, TextField, Tabs, Tree and DropdownMenu icon slots accept the shared size; direct SVG/IMG/Icon contents fill their slot. Tree disclosure follows it too.
- Button/TextField fallback gaps use the generated preset instead of a literal 8 px. X remains additive to each component's base padding.
- Progressive native Select centers selected text; arrow reservation follows icon geometry. Native popup behavior is preserved.
- Lab navigation → «Компоненты» shows real controls together in default, error, disabled and loading states. Original SEDA search/add icons are also used in the project/member workspace.

## Verification, 2026-10-24

- Build and 3 TypeScript projects: PASS.
- Contract/foundation tests: 120/120 PASS.
- Installed-package consumer: 25/25 groups PASS, React 18.3.1 and 19.2.7, native ESM/SSR/hydration/declarations and real keyboard Select. New Icon is imported through the package export, not a source alias.
- Full pilot `npm run verify`: PASS, including existing forms, filters, dialogs, eight reference routes, domain models and isolated renderers/previews.
- Added visual geometry matrix: 24 combinations = Light/Dark × S/M/L/XL × 80/100/150%. Checks actual icon bounds/centers, field/action heights, preset gaps, base + X padding, error/disabled semantics and Button/IconButton loading geometry. All PASS, all sampled loading width deltas 0 px. Direct intrinsic 53×29 IMG also resolves to the square slot.
- Existing loading matrix: 288 scenarios, all width/height deltas 0 px, including X changes during a request. These are nested scenarios, not 288 separate end-to-end workflows.
- Manually inspected Light 100% and Dark 150% full-page captures. The first capture exposed top-aligned Select text despite correct outer height; corrected in shared CSS and reran the visual matrix/package checks.
- Browser automation uses Chromium on Windows. Screenshots and machine-readable evidence remain under the ignored `.diagnostics-*` folders; successful results are not a visual maturity certificate.

## Remaining visual work

- Eleven glyphs do not cover a full application icon vocabulary. Reference applications still contain source-specific/composite icons; wrappers with absolute internal coordinates need dedicated adapters.
- Full spacing/density policy across toolbars, side panels, table rows, messages and grouped fields remains unfinished. Shared height does not imply identical optical balance.
- FileUpload, Badge, Tag, Alert and Toast still need visual/geometry review; this change does not give them executable contracts.
- No claim of pixel parity with all Figma frames, full WCAG/AT acceptance, Firefox/WebKit or native desktop-shell validation.
- `SedaProvider.textScale` scales Text roles; the Lab's control scale additionally derives control geometry. These are explicitly distinct APIs.

## Publication and production verification

- Same URL: https://seda-ai-pilot.kenymook.chatgpt.site/ — version 30, owner-private policy unchanged (custom/revision 1, one allowed owner, no visitors/groups).
- GitHub implementation: `d691dd8dab15862111de2c0cb923d56213c0a6e7`; Site source: `0c076c9dccd03f04a959a8348cd00fb26c01eb44`.
- Native deployment `appgdep_6adca6ca03088191baa7760eef5d9414` succeeded. Archive SHA-256: `96e07e464878708e18dc237b90b1c88e1757e73defc45ddadb724de46c9bb255`.
- Authenticated production Chromium check: all 24 visual combinations PASS, direct IMG normalization PASS, 0 JavaScript errors. All 730 published source hashes matched the canonical checkout.
- The first source-byte comparison correctly rejected CRLF/LF differences in the local checkout. Aligned clean committed files with exact Git blob bytes, refreshed the installed package and rebuilt local metadata; the source comparison then passed. No functional change or second deployment was needed.
- This proves the tested correction is live; the remaining visual limitations above still apply.
