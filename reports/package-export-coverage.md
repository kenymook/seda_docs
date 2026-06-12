# Package Export Coverage

Last updated: 2026-06-12  
Owner: Kenymook  
Package: `@seda-ai/ui` at `packages/seda-ui`

This report tracks code-export coverage across all 52 production component specs. Figma and docs are green; this file answers a different question: which components already have canonical production exports and which still exist only as documentation/Figma assets.

## Summary

| Metric | Count |
|---|---:|
| Production component specs | 52 |
| `packages/seda-ui` exports ready | 13 |
| Remaining exports | 39 |

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

1. `ChatBubble`
2. `TopBar`
3. `NotificationCenter`
4. `Search`
5. `DropdownMenu`

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
