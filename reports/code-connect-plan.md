# Code Connect Plan

Last updated: 2026-06-12  
Figma file: `SEDA AI v0.2.0` / `Su1jWqKc9TkD1R8f7wHOQU`  
Registry source: `reports/component-registry.md`  
Wave 1 mapping review: `reports/code-connect-wave1-mapping-review.md`

This plan defines the first Code Connect mapping waves for SEDA AI. The canonical production package decision is recorded in `reports/canonical-code-package-plan.md`: `packages/seda-ui` is the source of truth. Wave 1 components are scaffolded; Wave 2 has started with Badge and Tag exports. Local TypeScript validation passes with `.local/node/bin/node packages/seda-ui/node_modules/typescript/bin/tsc --noEmit -p packages/seda-ui/tsconfig.json`. Figma-side Code Connect mapping is currently blocked by account permissions: the MCP tool reports that a Developer seat in an Organization or Enterprise plan is required.

Button and Icon Button are treated as separate components inside one Button System. Live Figma sets are named `Button / Button` and `Button / IconButton`. Code Connect should map them to separate exports, `Button` and `IconButton`, while enforcing the shared public variant contract: `primary`, `secondary`, `outline`, `ghost`, `text`, `destruction`.

## Current Decision

| Question | Decision |
|---|---|
| Create Code Connect files now? | Blocked in Figma: Developer seat in Organization/Enterprise plan required. |
| Use `seda-docs.jsx` as source? | No. It is useful for preview logic, but not a source-of-truth package. |
| Use registry for planning? | Yes. `reports/component-registry.md` is the mapping baseline. |
| Canonical source path | `packages/seda-ui/src/components/*.tsx`, with exports from `packages/seda-ui/src/index.ts` and package import `@seda-ai/ui`. |
| Next required input | Enable Code Connect access in Figma, then create/review Wave 1 mappings against `reports/code-connect-wave1-mapping-review.md`. |

## Priority Waves

### Wave 1 — High-impact primitives

These components should be implemented and mapped first because other components and screens depend on them.

| Priority | Component | Figma node | Expected code export | Why first |
|---:|---|---|---|---|
| 1 | Button | `4017:1035` | `Button` | Button System labeled action; `packages/seda-ui/src/components/Button/Button.tsx` |
| 2 | Icon Button | `2654:2866` | `IconButton` | Button System icon-only action; `packages/seda-ui/src/components/IconButton/IconButton.tsx` |
| 3 | Link | `1276:11371` | `Link` | `packages/seda-ui/src/components/Link/Link.tsx` |
| 4 | Text Field | `914:9795` | `TextField` | `packages/seda-ui/src/components/TextField/TextField.tsx` |
| 5 | Select | `4080:170` | `Select` | `packages/seda-ui/src/components/Select/Select.tsx` |
| 6 | Checkbox | `1090:16624` | `Checkbox` | `packages/seda-ui/src/components/Checkbox/Checkbox.tsx` |
| 7 | Radio | `1082:14510` | `Radio` | `packages/seda-ui/src/components/Radio/Radio.tsx` |
| 8 | Toggle | `912:8761` | `Toggle` | `packages/seda-ui/src/components/Toggle/Toggle.tsx` |

### Wave 2 — Components changed in the current Figma pass

These are now clean in the saved scan. Their mappings can follow after Wave 1 primitives.

| Priority | Component | Figma node | Expected code export | Blocker |
|---:|---|---|---|---|
| 9 | Badge | `1183:18587` | `Badge` | Code export ready; Code Connect blocked by Figma access. |
| 10 | Tag | `1172:1185`, `1178:16954`, `1180:17533` | `Tag` | Code export ready; multi-set mapping review pending. |
| 11 | File Upload | `6661:46` | `FileUpload` | API/readability and text styles captured; `packages/seda-ui` component pending. |
| 12 | Top Bar / Navbar | `7061:410` | `TopBar` | Saved scan confirms corrected role semantics; `packages/seda-ui` component pending. |
| 13 | Chat Bubble | `7063:1570` | `ChatBubble` | API/content and text styles captured; `packages/seda-ui` component pending. |
| 14 | Notification Center | `6977:2860` | `NotificationCenter` | State/content, text styles, and retry Button delta captured in latest scan; `packages/seda-ui` component pending. |

### Wave 3 — Data and feedback

These are important for product workflows but can follow primitives.

| Component | Figma node | Expected code export | Notes |
|---|---|---|---|
| Table | `7318:412` | `Table` | Needs density and row/header subcomponent decisions. |
| Avatar | `61:4220`, `473:8735` | `Avatar`, `AvatarGroup` | Multi-node family mapping. |
| Toast | `6652:62` | `Toast` | Feedback primitive. |
| Alert | `8:3867` | `Alert` | Feedback primitive. |
| Modal | `6653:395` | `Modal` or `Dialog` | Overlay behavior and accessibility need code review. |
| Popover | `1617:8952` | `Popover` | Overlay behavior and trigger contract need code review. |

## Current Blocker

| Blocker | Evidence | Resolution |
|---|---|---|
| Figma Code Connect access | `get_code_connect_map` returned: Developer seat in an Organization or Enterprise plan is required. | Add/enable the required Figma seat/plan, then rerun Wave 1 mapping. |
| IconButton visual alignment | Saved scan confirms `Button / IconButton`, 144 variants, quality score `100`, unstyled text `0`, raw paints `0`, audit warnings `0`, and Button-compatible API values. Live validation confirms root fill, root stroke, icon/spinner fill and focus ring match Button across all 144 combinations. | Done. |
| IconButton property order | Live values are correct, but `componentPropertyDefinitions` still reports IconButton variant/state option order as non-canonical. | Optional manual reorder in Figma UI after visual QA; do not treat as API mismatch. |
| Button Social removal | `Button Social` and `Button Social Group` are no longer production mapping targets and no longer appear in saved inventory. Provider auth scenarios should compose `Button` inside `Button Group` with approved provider logo artwork. | Done. |

## Mapping Requirements

Before creating `.figma.ts` mappings, each component needs:

- [x] Canonical source file path.
- [x] Named export or default export.
- [x] Public prop names and allowed values.
- [x] Figma variant property names and allowed values from saved/final scan.
- [x] Token/code syntax decision for variables, if exposed. Wave 1 mappings do not expose design tokens as props; token usage remains internal CSS/source implementation.
- [x] Accessibility props, especially labels and state announcements. Wave 1 props include required labels/aria labels and disabled/error/loading mapping guidance.
- [x] Example template guidance that uses realistic content.

## Proposed Code Connect Template Shape

Use React mappings first, once a production component package exists.

```tsx
import { figma } from "@figma/code-connect";
import { Button } from "@seda-ai/ui";

figma.connect(Button, "<figma-node-url>", {
  props: {
    variant: figma.enum("variant", {
      primary: "primary",
      secondary: "secondary",
    }),
    size: figma.enum("size", {
      s: "s",
      m: "m",
      l: "l",
      xl: "xl",
    }),
    disabled: figma.boolean("disabled"),
  },
  example: (props) => <Button {...props}>Label</Button>,
});
```

This is illustrative only. Use the current `packages/seda-ui` Wave 1 exports when creating real Code Connect mappings.

## Open Questions

| Question | Owner | Impact |
|---|---|---|
| Are Wave 1 Code Connect mappings reviewed? | Kenymook + engineering | Required before using mappings as implementation guidance. |
| Are component exports React, Web Components, or another framework? | Kenymook | Decided for current package: React first. Reopen only if implementation target changes. |
| Should multi-set specs map to one export or several exports? | Kenymook + engineering | Affects Avatar, Tag, Button Group, Text Field, and legacy/current Link sets. |
| Which components should be mapped first once Code Connect access exists? | Kenymook | Current default is Wave 1 order in this document. |

## Done Criteria

Code Connect is considered ready when:

- Wave 1 mappings exist and point to canonical source files.
- Fresh Component Scan confirms all Figma node IDs and variant properties.
- Mappings are reviewed against `reports/component-registry.md`.
- At least one design-to-code retrieval test succeeds for Button, Text Field, and one complex component.
