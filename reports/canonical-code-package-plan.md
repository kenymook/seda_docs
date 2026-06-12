# Canonical Code Package Plan

Last updated: 2026-06-12  
Owner: Kenymook  
Related: `reports/code-connect-plan.md`, `reports/component-registry.md`
Wave 1 mapping review: `reports/code-connect-wave1-mapping-review.md`

This document records the canonical production code source decision for SEDA AI. It exists because the current repo contains documentation/demo surfaces, but not a production UI package that Code Connect should point to.

## Decision

| Question | Decision |
|---|---|
| Package name | `@seda-ai/ui` |
| Canonical package path | `packages/seda-ui` |
| Component source path | `packages/seda-ui/src/components` |
| Public export entry | `packages/seda-ui/src/index.ts` |
| Framework target | React first |
| Styling contract | Token-driven CSS variables from `tokens.json`; no hardcoded theme values in component source |
| Code Connect source | Import from `@seda-ai/ui`; source files live under `packages/seda-ui/src/components/<Component>/<Component>.tsx` |
| Demo/docs source status | `seda-docs.jsx`, `portal/docs-site`, and `portal/component-lab` remain documentation/demo references, not source of truth |

## Package Shape

```text
packages/seda-ui/
  package.json
  tsconfig.json
  src/
    index.ts
    components/
      Button/
        Button.tsx
        Button.types.ts
        index.ts
      TextField/
        TextField.tsx
        TextField.types.ts
        index.ts
      ...
```

## Package Exports

Wave 1 exports should exist before real Code Connect mappings are committed. Wave 2 exports can be added while Code Connect access is blocked, using the same source-of-truth rules.

| Export | Source path | Figma node | Wave | Notes |
|---|---|---|---|---|
| `Button` | `packages/seda-ui/src/components/Button/Button.tsx` | `4017:1035` / `Button / Button` | 1 | Core action primitive. |
| `IconButton` | `packages/seda-ui/src/components/IconButton/IconButton.tsx` | `2654:2866` / `Button / IconButton` | 1 | Compact action primitive in the shared Button System. |
| `Link` | `packages/seda-ui/src/components/Link/Link.tsx` | `1276:11371` | 1 | Canonical normalized Link set. |
| `TextField` | `packages/seda-ui/src/components/TextField/TextField.tsx` | `914:9795` | 1 | Input foundation for forms and search. |
| `Select` | `packages/seda-ui/src/components/Select/Select.tsx` | `4080:170` | 1 | Common form/control primitive. |
| `Checkbox` | `packages/seda-ui/src/components/Checkbox/Checkbox.tsx` | `1090:16624` | 1 | Common selection control. |
| `Radio` | `packages/seda-ui/src/components/Radio/Radio.tsx` | `1082:14510` | 1 | Common selection control. |
| `Toggle` | `packages/seda-ui/src/components/Toggle/Toggle.tsx` | `912:8761` | 1 | Common setting/control primitive. |
| `Badge` | `packages/seda-ui/src/components/Badge/Badge.tsx` | `1183:18587` | 2 | Non-interactive count/status signal. |
| `Tag` | `packages/seda-ui/src/components/Tag/Tag.tsx` | `1172:1185`, `1178:16954`, `1180:17533` | 2 | Read-only, selectable, and interactive status/classification label. |

## Implementation Rules

- Public prop names must match the component specs and the Figma variant API unless a mapping exception is documented.
- Component variants must use typed unions, not free-form strings.
- Button and IconButton are separate exports, but they share the Button System public variant contract: `primary`, `secondary`, `outline`, `ghost`, `text`, `destruction`.
- Visual styling must resolve through token variables; component source should not introduce one-off colors, radii, spacing, or typography.
- Accessibility props must be explicit where the spec requires them, especially labels, disabled state, invalid state, loading state, focus behavior, and announcements.
- Examples in Code Connect must use realistic content, not lorem ipsum or generic placeholders when the component has domain-specific expectations.
- Demo-only helpers from `seda-docs.jsx` can inform behavior, but should be rewritten into clean production components rather than imported directly.

## Code Connect Gate

Real `.figma.ts` mappings can start when these are true:

- [x] `packages/seda-ui` exists and publishes/imports as `@seda-ai/ui`.
- [x] Wave 1 components have stable exports from `packages/seda-ui/src/index.ts`; Badge and Tag Wave 2 exports are also available.
- [x] Wave 1 public props are reviewed against specs and `reports/component-registry.md`.
- [x] The final Notification Center retry Button scan has been saved into `portal/docs-site/figma-components.json`.
- [x] At least one local type/build check exists for the package. `.local/node/bin/node packages/seda-ui/node_modules/typescript/bin/tsc --noEmit -p packages/seda-ui/tsconfig.json` passes in this workspace.
- [ ] Figma Code Connect access is available. Current blocker: Developer seat in an Organization or Enterprise plan is required.
- [x] Wave 1 Figma APIs match `@seda-ai/ui` props or have approved adapters. IconButton scan is refreshed, matches Button-compatible API values, and visual-token alignment with Button is captured.

## Open Decisions

| Decision | Recommended default | Why |
|---|---|---|
| Package manager/workspace | Keep package-local setup for now | The current repo has no root `package.json`; package-local TypeScript validation is enough for Wave 1 readiness. |
| CSS delivery | Package-local CSS plus token variables | Keeps components portable while reusing existing token pipeline. |
| Multi-set component mapping | Start with one public export per spec, add sub-exports only when code needs them | Avoids exposing Figma implementation detail as public API. |
| Server/client boundary | Client components by default | Most components are interactive controls; framework-specific SSR rules can be added later. |

## Next Step

Enable Figma Code Connect access, then create Wave 1 mappings for Button, IconButton, Link, TextField, Select, Checkbox, Radio, and Toggle.
