# Component Registry

Last updated: 2026-06-12  
Figma inventory: `portal/docs-site/figma-components.json` generated at `2026-06-12T16:52:43.458Z`  
Scope: 52 production component specs. This is the first AI-ready registry baseline: spec -> Figma node -> inventory match -> code props/handoff gaps. Button Social was removed as a standalone production component; provider auth scenarios now use Button and Button Group. Latest saved scan captures Button System, IconButton visual-token alignment, Tag rebinding, and Button Social removal.

## Summary

| Metric | Count |
|---|---:|
| Production specs | 52 |
| Specs with real Figma links | 52 |
| Specs with inventory node match | 52 |
| Specs marked ready | 52 |
| Specs needing status review | 0 |

## Registry

| Component | Spec | Status | Figma node ids | Inventory match | Aliases | Next gap |
|---|---|---|---|---|---|---|
| Button Group | `specs/actions/button-group.md` | ready | `867:11362`, `2729:1986` | ButtonGroupHorizontal, ButtonGroupVertical | ButtonGroupHorizontal, ButtonGroupVertical | alias verify |
| Button | `specs/actions/button.md` | ready | `4017:1035` | Button / Button | Button System | sibling of Icon Button |
| Icon Button | `specs/actions/icon-button.md` | ready | `2654:2866` | Button / IconButton | Button System | - |
| Link | `specs/actions/link.md` | ready | `1276:11371` | Link | `4071:74` legacy Link set | semantic variant stays code/handoff intent |
| Accordion | `specs/data-display/accordion.md` | ready | `6668:44` | Accordion | - | - |
| Avatar | `specs/data-display/avatar.md` | ready | `61:4220`, `473:8735` | Avatar, Avatar group | Avatar block, Avatar group, Avatar photo, `_Avatar image`, `_Avatar add button`, `_Avatar more button` | alias verify |
| Badge | `specs/data-display/badge.md` | ready | `1183:18587` | badge | - | `packages/seda-ui` export ready |
| Card | `specs/data-display/card.md` | ready | `77:4322` | Cards | Cards, Sender | alias verify |
| Chat Bubble | `specs/data-display/chat-bubble.md` | ready | `7063:1570` | Chat Bubble | - | roadmap content decision |
| Chip | `specs/data-display/chip.md` | ready | `978:11403` | Chip | - | - |
| Description List | `specs/data-display/description-list.md` | ready | `6670:174` | Description List | - | - |
| Divider | `specs/data-display/divider.md` | ready | `1432:6693` | divider | - | - |
| Property List | `specs/data-display/property-list.md` | ready | `7148:18099` | PropertyList | Description List | alias verify |
| Stat / Metric | `specs/data-display/stat-metric.md` | ready | `6671:56` | Stat Metric | - | - |
| Table | `specs/data-display/table.md` | ready | `7318:412` | Table | - | - |
| Tag | `specs/data-display/tag.md` | ready | `1172:1185`, `1178:16954`, `1180:17533` | Tag / Read-only, Tag / Selectable, Tag / Interactive | Tag / Read-only, Tag / Selectable, Tag / Interactive | `packages/seda-ui` export ready; multi-set mapping review |
| Timeline | `specs/data-display/timeline.md` | ready | `6672:242` | Timeline | - | - |
| Alert | `specs/feedback/alert.md` | ready | `8:3867` | Alert | - | - |
| Empty State | `specs/feedback/empty-state.md` | ready | `6650:37` | Empty State | - | - |
| Modal / Dialog | `specs/feedback/modal.md` | ready | `6653:395` | Modal | - | - |
| Popover | `specs/feedback/popover.md` | ready | `1617:8952` | Popover | - | - |
| Progress Bar | `specs/feedback/progress-bar.md` | ready | `6648:110` | Progress Bar | - | - |
| Skeleton | `specs/feedback/skeleton.md` | ready | `1174:1028` | Skeleton state animation | Skeleton state animation | alias verify |
| Spinner / Loader | `specs/feedback/spinner.md` | ready | `6647:38` | Spinner | - | - |
| Toast / Snackbar | `specs/feedback/toast.md` | ready | `6652:62` | Toast | - | - |
| Tooltip | `specs/feedback/tooltip.md` | ready | `6649:54` | Tooltip | - | - |
| Checkbox | `specs/inputs/checkbox.md` | ready | `1090:16624` | checkbox | - | - |
| Color Picker | `specs/inputs/color-picker.md` | ready | `6386:423` | ColorPicker | ColorPicker | alias verify |
| Date Picker | `specs/inputs/date-picker.md` | ready | `4101:4117` | DatePicker | Calendar | alias verify |
| File Upload | `specs/inputs/file-upload.md` | ready | `6661:46` | File Upload | - | - |
| Radio | `specs/inputs/radio.md` | ready | `1082:14510` | radio | - | - |
| Segmented Control | `specs/inputs/segmented-control.md` | ready | `805:10516` | Segmented Control - Single selection | Segmented Control - Single selection, Segment | alias verify |
| Select | `specs/inputs/select.md` | ready | `4080:170` | Select | - | - |
| Slider | `specs/inputs/slider.md` | ready | `4113:3829` | Slider | - | - |
| Text Area | `specs/inputs/text-area.md` | ready | `2187:3331` | TextArea | TextArea | alias verify |
| Text Field | `specs/inputs/text-field.md` | ready | `914:9795` | TextField/Input | TextField/Input, TextField/Search, TextField/Email, TextField/Password, TextField/CardNumber | alias verify |
| Time Picker | `specs/inputs/time-picker.md` | ready | `4103:4312` | TimePicker | - | - |
| Toggle | `specs/inputs/toggle.md` | ready | `912:8761` | Toggle | - | - |
| Verification Code | `specs/inputs/verification-code.md` | ready | `6662:247` | Verification Code | - | - |
| Breadcrumbs | `specs/navigation/breadcrumbs.md` | ready | `6220:927` | Breadcrumbs | - | - |
| Drawer | `specs/navigation/drawer.md` | ready | `6657:116` | Drawer | - | - |
| Pagination | `specs/navigation/pagination.md` | ready | `6213:202` | Pagination | - | - |
| Sidebar / Navigation Menu | `specs/navigation/sidebar.md` | ready | `933:8891` | Sidebar | Menu | alias verify |
| Stepper | `specs/navigation/stepper.md` | ready | `6658:45` | Stepper | - | - |
| Tabs | `specs/navigation/tabs.md` | ready | `6196:25` | Tabs | - | - |
| Top Bar / Navbar | `specs/navigation/top-bar.md` | ready | `7061:410` | Top Bar | - | - |
| Container | `specs/overlays-layout/container.md` | ready | `1353:6860` | Container | - | - |
| Dropdown Menu | `specs/overlays-layout/dropdown-menu.md` | ready | `7036:567` | DropdownMenu | DropdownMenu, Dropdown | alias verify |
| Form | `specs/overlays-layout/form.md` | ready | `6724:387` | Form | - | - |
| Grid | `specs/overlays-layout/grid.md` | ready | `6673:83` | Grid | - | - |
| Notification Center | `specs/overlays-layout/notification-center.md` | ready | `6977:2860` | Notification Center | - | retry Button captured; score `100` |
| Search | `specs/overlays-layout/search.md` | ready | `6739:599` | Search | - | - |

## Usage

- Use this file as the handoff map before creating Code Connect mappings.
- `alias verify` means the docs-site alias file intentionally maps extra Figma names to the same public spec.
- `ready` means the owner approval pass has been applied in the markdown specs.
