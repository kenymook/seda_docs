# Package Export Coverage

Last updated: 2026-10-25
Owner: Kenymook  
Package: `@seda-ai/ui` at `packages/seda-ui`

This report tracks code-export coverage across all 52 production component specs. The historical spec status is not a runtime or fresh Figma acceptance certificate; this file answers a different question: which components already have canonical production exports and which still exist only as documentation/Figma assets.

## Current runtime summary

`packages/seda-ui/src/index.ts` has33 component entry modules (including foundation Icon and reference-oriented Tree/SplitView), plus provider/host APIs. This is not33/52 complete production specs: those inventories are not one-to-one. Search now has an experimental export and real Files/Chat consumers; full local verification and independent runtime CI passed. Private version53 is published; production inspectors pass and native owner-browser Search navigation was checked separately from the incomplete production bypass-header runner. Full Figma/AT/OS acceptance and surface instance contracts remain open. Current evidence and gaps are in [component-maturity-matrix.md](component-maturity-matrix.md).

The historical13-export list below is retained as a dated baseline, not a current count. Since then Icon, Tabs, DropdownMenu, SplitView, Tree, TextArea, Text, Modal, Tooltip, experimental Table, Card and Avatar/AvatarGroup were added. Table is a real installed-package implementation with controlled sort/selection/expansion/pagination and native semantics; it is not a registry instance contract or a fresh Figma acceptance. Source: `packages/seda-ui/src/components/Table`. Card and Avatar/AvatarGroup now have installed-package APIs and Projects/Team consumers; their full spec variants, instance contracts and Figma/OS/AT approval remain incomplete.

Popover now has an experimental controlled nonmodal source export and Files/Chat consumers. Private version52 has passed63 package groups,46 application scripts and production Popover/inspector checks; it remains experimental and is not a production maturity certificate. See [Popover](2026-10-25-popover.md).

Slider now has an experimental controlled native single/range export and installed Lab consumers. Private version53 passed65 package groups,47 application scripts and production Slider/inspector checks. No new instance contract or platform acceptance is claimed. [Proof and limits](2026-10-25-slider.md).

## Historical coverage baseline — 2026-06-12

## Exported Components

| Component | Export | Source |
|---|---|---|
| Button | `Button` | `packages/seda-ui/src/components/Button/Button.tsx` |
| Icon Button | `IconButton` | `packages/seda-ui/src/components/IconButton/IconButton.tsx` |
| Link | `Link` | `packages/seda-ui/src/components/Link/Link.tsx` |
| Text Field | `TextField` | `packages/seda-ui/src/components/TextField/TextField.tsx` |
| Select | `Select` | `packages/seda-ui/src/components/Select/Select.tsx` |
| Checkbox | `Checkbox` | `packages/seda-ui/src/components/Checkbox/Checkbox.tsx` |
| Radio | `Radio` | `packages/seda-ui/src/components/Radio/Radio.tsx` |
| Toggle | `Toggle` | `packages/seda-ui/src/components/Toggle/Toggle.tsx` |
| Badge | `Badge` | `packages/seda-ui/src/components/Badge/Badge.tsx` |
| Tag | `Tag` | `packages/seda-ui/src/components/Tag/Tag.tsx` |
| Alert | `Alert` | `packages/seda-ui/src/components/Alert/Alert.tsx` |
| Toast | `Toast` | `packages/seda-ui/src/components/Toast/Toast.tsx` |
| File Upload | `FileUpload` | `packages/seda-ui/src/components/FileUpload/FileUpload.tsx` |

## Remaining Components By Area

| Area | Remaining components |
|---|---|
| Actions | Button Group |
| Data display | Accordion, Avatar, Card, Chat Bubble, Chip, Description List, Divider, Property List, Stat / Metric, Table, Timeline |
| Feedback | Empty State, Modal / Dialog, Popover, Progress Bar, Skeleton, Spinner / Loader, Tooltip |
| Inputs | Color Picker, Date Picker, Segmented Control, Slider, Text Area, Time Picker, Verification Code |
| Navigation | Breadcrumbs, Drawer, Pagination, Sidebar / Navigation Menu, Stepper, Tabs, Top Bar / Navbar |
| Overlays / layout | Container, Dropdown Menu, Form, Grid, Notification Center, Search |

## Recommended Coverage Order

The next work should deliberately broaden coverage instead of returning to the same primitives.

| Wave | Goal | Components |
|---|---|---|
| 2B | Product-facing AI surfaces and app chrome | Chat Bubble, Top Bar, Notification Center, Search, Dropdown Menu |
| 3 | Small reusable primitives with low behavior risk | Progress Bar, Spinner, Skeleton, Tooltip, Divider, Chip, Empty State |
| 4 | Layout and data structure | Accordion, Card, Avatar, Description List, Property List, Stat / Metric, Timeline, Table |
| 5 | Remaining input controls | Text Area, Slider, Segmented Control, Date Picker, Time Picker, Color Picker, Verification Code |
| 6 | Navigation and composition primitives | Button Group, Breadcrumbs, Pagination, Tabs, Stepper, Sidebar / Navigation Menu |
| 7 | Complex overlays and containers | Modal / Dialog, Popover, Drawer, Container, Form, Grid |

## Next Recommended Batch

Do the next batch as a breadth pass:

1. Review Search version51 evidence and its explicit production automation limit; retain local/Linux and actual owner-browser results as separate scopes.
2. Complete remaining public/instance contracts and fresh visual/platform acceptance for the components above; an export is not a maturity certificate.
3. Search is no longer a missing source export. Its remaining gaps include a standalone anchored overlay host, full platform/AT/Figma review and executable instance contract.
4. TopBar, Sidebar, Accordion and DropdownMenu already have exports. Their remaining review gaps must not be described as missing source components.

This gives the package coverage for the app shell and AI conversation surfaces, not just form primitives.

## Done Criteria For Each Export

- Typed public props match the markdown spec and Figma variant API.
- Component source lives under `packages/seda-ui/src/components/<Component>`.
- Export is included from `packages/seda-ui/src/index.ts`.
- Styling uses package CSS and token variables, not one-off hardcoded theme values.
- Accessibility defaults are explicit for labels, focus, disabled, loading, error, modal, overlay, and live-region behavior where relevant.
- Local TypeScript validation passes:

```bash
.local/node/bin/node packages/seda-ui/node_modules/typescript/bin/tsc --noEmit -p packages/seda-ui/tsconfig.json
```
