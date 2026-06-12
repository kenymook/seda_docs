# Component Maturity Matrix

Last updated: 2026-06-12  
Figma inventory: `portal/docs-site/figma-components.json` generated at `2026-06-12T16:52:43.458Z`  
Figma file: `SEDA AI v0.2.0` / `Su1jWqKc9TkD1R8f7wHOQU`

This matrix tracks whether SEDA AI can be treated as an AI-ready design system, not just a green Figma scan. Portal health is currently `score=100` after the latest scan and health rerun, but production readiness also requires stable component APIs, reviewed specs, owners, Figma links, visual QA, and handoff/code mapping.

## Current Readiness

| Layer | Current state | Readiness |
|---|---|---:|
| Tokens | `tokens.json` has foundation, semantic, and component token layers; portal reports `invalidReferences=0`. | Strong |
| Foundation | 19 foundation docs exist, including governance, validation, token pipeline, accessibility, content, and theming. | Strong |
| Component specs | 52 production specs exist, follow the AI documentation structure, and are marked `ready`. Button Social was removed as a standalone production spec. | Strong |
| Figma inventory | 107 component sets, 164 standalone components, 3757 variants. | Strong |
| Automated health | Saved scan captures Button System, IconButton visual-token alignment, Tag rebinding, and Button Social removal. Button / Button, Button / IconButton, Tag / Interactive, and Tag / Selectable all have score `100`, unstyled text `0`, raw paints `0`, and audit warnings `0`. | Strong |
| Governance | All production specs have owner `Kenymook`, real Figma links, and markdown status `ready`; the owner approval pass is complete. | Strong |
| Public API consistency | Main P1 API normalization batch is reflected in the saved Figma inventory; remaining API work is strategic visual/semantic modeling. | Strong |
| Visual QA | Initial P2 fixes and Button System scan are reflected in the saved inventory. IconButton live visual-token validation now matches Button across all 144 combinations and the saved scan captures the aligned 144-variant set. | Strong |
| Code mapping | Specs include code mapping sections; registry, Code Connect plan, Wave 1 mapping review, verified Wave 1 `packages/seda-ui` scaffold, and Wave 2 Badge/Tag exports exist. Real Code Connect mappings are blocked by Figma access. | Medium |

Overall maturity: **Level 3 candidate / AI-ready Design System pending Code Connect mappings**.

Target maturity: **Level 3 / AI-ready Design System**.

## Blocking Themes

| Theme | Count / Scope | Why it blocks 100% |
|---|---:|---|
| Spec status is not `ready` | 0 specs | Done: all 52 production specs are owner-approved as `ready`. |
| Placeholder Figma links | 0 public specs | Done for production specs; `specs/component-spec-template.md` intentionally keeps `TBD`. |
| Public API normalization | Strategic residuals | Most public API inconsistencies have been normalized; remaining decisions affect visual semantics and code mapping. |
| Known visual QA gaps | 0 tracked items after live fix | IconButton visual-token alignment is captured in the saved scan with score `100` and no raw/direct semantic issues. |
| Scan quality polish | 9 saved-scan items | Remaining saved-scan penalties are Avatar effect/text token gaps, standalone emoji artwork without bindings, and provider-logo brand artwork exceptions. |
| Code Connect missing | System-wide | Priority plan, mapping review, verified `packages/seda-ui` Wave 1 scaffold, and Badge/Tag Wave 2 exports exist; Figma-side mapping is blocked by account access. |

## Latest Scan Results

The `2026-06-12T16:52:43.458Z` scan captured the Button System rename, IconButton visual-token alignment, Tag rebinding, Button Social removal, Badge tone expansion, and Notification Center retry Button delta.

| Component | Live state | Required next step |
|---|---|---|
| Icon Button | Scan confirms `Button / IconButton`, 144 Button-compatible variants, quality score `100`, unstyled text `0`, raw fills/strokes `0`, audit warnings `0`, and no direct semantic bindings. Live validation also reports root fill, root stroke, icon/spinner fill and focus ring match Button across all 144 combinations. | Done. |
| Badge | Scan confirms 256 variants with `variant/state/size/tone`; `tone=neutral/brand/info/success/warning/danger/ai/disabled`; quality score `100`. | Done. |
| File Upload | Scan confirms API `variant/state/size`, all text styled, and quality score `100`. | Done. |
| Top Bar | Scan confirms API `variant/state/size`, corrected role semantics, and quality score `100`. | Done. |
| Chat Bubble | Scan confirms API `sender/contentType/deliveryStatus/size`, 256 variants, all text styled, and quality score `100`. | Done. |
| Notification Center | Scan confirms 40 variants, state/content fixes, all text styled, and quality score `100`. | Done. |
| Notification Center retry action | Latest scan captures the live Button-instance fix. Notification Center has 40 variants, `nodeCount=1729`, unstyled text `0`, raw paints `0`, audit warnings `0`, and quality score `100`. | Done. |
| Tag quality polish | Scan confirms `Tag / Interactive` and `Tag / Selectable` no longer use direct semantic `surface/base` or legacy `focus/base`; both now have quality score `100`. | Done. |

## Priority Backlog

### P0 — Governance And Traceability

| Task | Scope | Done when |
|---|---|---|
| Assign owners | All 52 specs | Done: production specs use `Owner · Kenymook`. |
| Replace placeholder Figma links | Public specs | Done: every production spec has a real `figma.com` node link; only the reusable template keeps `TBD`. |
| Introduce readiness status gate | All specs | Done: all 52 production specs are marked `ready`; future changes must keep owner, real Figma link, token mapping, visual QA, accessibility review, and open questions current. |
| Add release audit entry | Repo | `CHANGELOG.md` records API/visual/token changes before release. |

### P1 — Public API Normalization

| Task | Components | Target contract |
|---|---|---|
| Normalize size values | Avatar, Avatar group, Table | Done in saved inventory: public sizes use named scales; density is separate from size. |
| Normalize prop casing | Link, Property List, Alert | Done in saved inventory: public variant props use lower camel/kebab consistently. |
| Replace ambiguous `type` | Done for current P1 batch | Remaining API work is strategic, not a simple `type` rename. |
| Remove standalone provider button primitive | Button Social | Done and captured: `Button Social` and `Button Social Group` no longer appear in saved inventory. Use Button and Button Group for provider auth scenarios; provider logo remains approved artwork inside Button. |

### P2 — Visual QA And UX State Completeness

| Component | Risk | Required work |
|---|---|---|
| Chat Bubble | AI/system sender contract is represented and captured with quality score `100`; `code/rich`, `sending/edited/streaming`, and dedicated AI/system tokens remain roadmap gaps. | Decide whether roadmap content/status states should become Figma variants or stay code-level patterns. |
| Top Bar | Variant-role fix is captured with score `100`. | Spot-check final release health only. |
| File Upload | Density/readability fix is captured with quality score `100`. | Done for current pass. |
| Notification Center | Error action decision is closed and captured: retry is a real Button instance in every error variant; latest scan remains score `100`. | Done for current pass. |

### P3 — AI-ready Handoff And Code Mapping

| Task | Scope | Done when |
|---|---|---|
| Create component registry | All public components | Done: `reports/component-registry.md` maps 52 production specs to Figma nodes, inventory matches, aliases, and next gaps. |
| Add Code Connect mappings | Priority components first | Planned in `reports/code-connect-plan.md`; canonical package, Wave 1 review, and Wave 2 Badge/Tag source exports are ready, but real mappings are blocked by Figma Code Connect access. |
| Add validation prompts to workflow | Design review and handoff | Done: `reports/validation-workflow.md` defines pass/fail validation stages for scope, component usage, tokens, visual QA, accessibility, handoff, AI output, and release. |
| Create release checklist | Repo + Figma | Done: `reports/release-checklist.md` defines scan, health, visual QA, docs, token, accessibility, handoff, Code Connect, and changelog gates. |

## Component Matrix

Legend:

- **Spec**: markdown status from the component spec.
- **Figma**: matched component from inventory.
- **API**: public API risk observed from inventory.
- **Blocker**: remaining review note, if any.

| Component | Spec | Figma | API | Main blocker |
|---|---|---|---|---|
| Button Group | ready | ButtonGroupHorizontal / ButtonGroupVertical | OK | Real Figma links added; verify alias coverage after fresh scan. |
| Button | ready | Button / Button | OK | Button System scan confirms 144 variants and quality score `100`. |
| Icon Button | ready | Button / IconButton | OK | Scan confirms visual-token alignment and score `100`. |
| Link | ready | Link | OK | Decision captured: semantic variants stay code/handoff token intent; canonical Figma API remains `textStyle/state/strong/visited/size`. |
| Accordion | ready | Accordion | OK | Real Figma link added. |
| Avatar | ready | Avatar | OK | Figma API normalized to `size=xxs/xs/s/m/l/xl`. |
| Badge | ready | badge | OK | Scan confirms `variant/state/size/tone`; `packages/seda-ui` export is ready. |
| Card | ready | Cards | OK | Real Figma link added. |
| Chat Bubble | ready | Chat Bubble | OK | Scan confirms `sender/contentType/deliveryStatus/size`, `sender=ai/system`, readable delivery labels, and quality score `100`; `code/rich` and streaming states remain roadmap/code-level gaps. |
| Chip | ready | Chip | OK | Ready. |
| Description List | ready | Description List | OK | Real Figma link added. |
| Divider | ready | divider | OK | Figma API normalized to `style/text/vertical/size`. |
| Property List | ready | PropertyList | OK | Figma API normalized to `variant/density`. |
| Stat / Metric | ready | Stat Metric | OK | Ready. |
| Table | ready | Table | OK | API normalized to `density`. |
| Tag | ready | Tag / Read-only, Tag / Selectable, Tag / Interactive | OK | Scan confirms Selectable/Interactive binding polish and score `100`; `packages/seda-ui` export is ready. |
| Timeline | ready | Timeline | OK | Ready. |
| Alert | ready | Alert | OK | Figma API normalized to `variant/size`. |
| Empty State | ready | Empty State | OK | Figma API normalized to `reason/size`. |
| Modal / Dialog | ready | Modal | OK | API normalized to `variant/size`. |
| Popover | ready | Popover | OK | API normalized to `variant/size`. |
| Progress Bar | ready | Progress Bar | OK | Ready. |
| Skeleton | ready | Skeleton state animation | OK | Ready. |
| Spinner / Loader | ready | Spinner | OK | Ready. |
| Toast / Snackbar | ready | Toast | OK | Figma API normalized to `intent/dismissible/size`. |
| Tooltip | ready | Tooltip | OK | API normalized to `variant/placement/arrow/size`. |
| Checkbox | ready | checkbox | OK | Ready. |
| Color Picker | ready | ColorPicker | OK | API normalized to `variant/size/state`; real Figma link added. |
| Date Picker | ready | DatePicker | OK | API normalized to `selection/size/state`. |
| File Upload | ready | File Upload | OK | Scan confirms API `variant/state/size`, `s` helper readability, disabled contextual reason, and quality score `100`. |
| Radio | ready | radio | OK | Ready. |
| Segmented Control | ready | Segmented Control | OK | Ready. |
| Select | ready | Select | OK | API normalized to `selection/size/state`. |
| Slider | ready | Slider | OK | API normalized to `mode/size/state`. |
| Text Area | ready | TextArea | OK | Ready. |
| Text Field | ready | TextField variants | OK | Verify registry alias and code mapping. |
| Time Picker | ready | TimePicker | OK | API normalized to `variant/size/state`. |
| Toggle | ready | Toggle | OK | Ready. |
| Verification Code | ready | Verification Code | OK | Ready. |
| Breadcrumbs | ready | Breadcrumbs | OK | API normalized to `variant/separator/size`. |
| Drawer | ready | Drawer | OK | Ready. |
| Pagination | ready | Pagination | OK | API normalized to `variant/size`. |
| Sidebar / Navigation Menu | ready | Sidebar | OK | Ready; Menu alias should be explicit in registry. |
| Stepper | ready | Stepper | OK | Ready. |
| Tabs | ready | Tabs | OK | API normalized to `variant/size`. |
| Top Bar / Navbar | ready | Top Bar | OK | Saved scan confirms API `variant/state/size`; Figma distinguishes `app-bar`, `application`, and `page-header` roles. |
| Container | ready | Container | OK | API normalized to `variant/state/size`. |
| Dropdown Menu | ready | DropdownMenu | OK | API normalized to `variant/size`. |
| Form | ready | Form | OK | Ready. |
| Grid | ready | Grid | OK | Ready. |
| Notification Center | ready | Notification Center | OK | Latest scan captures the `Retry loading` Button-instance delta with quality score `100`. |
| Search | ready | Search | OK | API normalized to `variant/state/size`. |

## Next Recommended Step

Continue with **Wave 2 package growth while Code Connect access is blocked**. `packages/seda-ui` TypeScript validation passes through the local Node command; Figma-side Code Connect remains blocked by required Developer seat / Organization or Enterprise access.

1. Add the next Wave 2 source export, recommended `Alert` or `Toast`.
2. Enable a Figma Developer seat in an Organization or Enterprise plan for Code Connect access.
3. Create Wave 1 Code Connect mappings and run retrieval tests once access is available.
