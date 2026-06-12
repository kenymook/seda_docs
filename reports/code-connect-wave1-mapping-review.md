# Code Connect Wave 1 Mapping Review

Last updated: 2026-06-12  
Figma inventory: `portal/docs-site/figma-components.json` generated at `2026-06-12T16:52:43.458Z`  
Code source: `@seda-ai/ui` at `packages/seda-ui`  
Verification: `.local/node/bin/node packages/seda-ui/node_modules/typescript/bin/tsc --noEmit -p packages/seda-ui/tsconfig.json` passes.

This review prepares Wave 1 Code Connect mappings while Figma-side Code Connect access is blocked. It compares Figma component properties from the saved scan with the public props in `packages/seda-ui`.

Button and IconButton are mapped as separate exports in one Button System. They must not be merged into one Code Connect target, but their public `variant`, `size` and action-state vocabulary must stay aligned.

## Summary

| Component | Figma node | Code export | Mapping status | Notes |
|---|---|---|---|---|
| Button | `4017:1035` | `Button` | Ready with adapter | Live Figma set is `Button / Button`. Map `variant`, `size`, label text, icons, `state=loading/disabled`; omit hover/focus/active as design-only states. |
| Icon Button | `2654:2866` | `IconButton` | Ready with adapter | Saved scan captures `Button / IconButton` with Button-compatible API and visual-token alignment; live validation confirms all 144 visual token bindings match Button. |
| Link | `1276:11371` | `Link` | Ready with adapter | Map `textStyle`, `size`, `strong`, `visited`, label text; semantic `variant` remains code/handoff intent. |
| Text Field | `914:9795` | `TextField` | Ready with adapter | Map `size`, `state`, `filled`; label/helper/error booleans guide example content. |
| Select | `4080:170` | `Select` | Ready | Map `selection`, `size`, `state`; example needs realistic options. |
| Checkbox | `1090:16624` | `Checkbox` | Ready | Map `size`, `turnOn -> checked`; `state=hover` is design-only. |
| Radio | `1082:14510` | `Radio` | Ready | Map `size`, `turnOn -> selected value`; component code represents group semantics. |
| Toggle | `912:8761` | `Toggle` | Ready | Map `size`, `on -> checked`; `state=hover` is design-only. |

## Current Figma Access Blocker

Figma MCP Code Connect calls return:

```text
You need a Developer seat in an Organization or Enterprise plan to access Code Connect.
```

Until that is resolved, this file is the source-of-truth mapping review. Do not claim Code Connect is complete.

## Local Validation

Wave 1 code exports and props have been checked against the current package source:

| Export | Source | Required accessibility / state prop |
|---|---|---|
| `Button` | `packages/seda-ui/src/components/Button/Button.tsx` | visible `children`; `loading`, `disabled`, native `type` |
| `IconButton` | `packages/seda-ui/src/components/IconButton/IconButton.tsx` | required `aria-label`, `icon`, optional `tooltip`, `loading` |
| `Link` | `packages/seda-ui/src/components/Link/Link.tsx` | `children`, `href`, optional `hiddenText`, `disabled`, `external` |
| `TextField` | `packages/seda-ui/src/components/TextField/TextField.tsx` | required `label`, `helperText`, `errorText`, `state` |
| `Select` | `packages/seda-ui/src/components/Select/Select.tsx` | required `label`, realistic `options`, `selection`, `state` |
| `Checkbox` | `packages/seda-ui/src/components/Checkbox/Checkbox.tsx` | required `label`, `checked`, `helperText`, `errorText` |
| `Radio` | `packages/seda-ui/src/components/Radio/Radio.tsx` | required group `label`, `options`, `value/defaultValue` |
| `Toggle` | `packages/seda-ui/src/components/Toggle/Toggle.tsx` | required `label`, `checked`, `statusText`, `loading` |

Design tokens are not exposed as Code Connect props in Wave 1. They remain internal implementation details resolved through `packages/seda-ui/src/styles.css` and the shared token pipeline.

## Component Details

### Button

Live Figma component set name: `Button / Button`.

| Figma property | Type | Values | Code mapping |
|---|---|---|---|
| `variant` | variant | `primary`, `secondary`, `outline`, `ghost`, `text`, `destruction` | `variant` |
| `size` | variant | `s`, `m`, `l`, `xl` | `size` |
| `state` | variant | `default`, `hover`, `active`, `loading`, `focus`, `disabled` | `loading={state === "loading"}`, `disabled={state === "disabled"}`; omit visual-only states |
| `typeText#764:0` | text | label | children |
| `showLeftIcon#730:0` | boolean | true/false | include `iconLeft` only when mapped icon has Code Connect |
| `showRightIcon#730:91` | boolean | true/false | include `iconRight` only when mapped icon has Code Connect |

Recommended example shape:

```tsx
<Button variant={variant} size={size} loading={loading} disabled={disabled}>
  {label}
</Button>
```

### Icon Button

Live Figma component set name: `Button / IconButton`.

| Figma property | Type | Values | Code mapping |
|---|---|---|---|
| `variant` | variant | `primary`, `secondary`, `outline`, `ghost`, `text`, `destruction` | `variant` |
| `size` | variant | `s`, `m`, `l`, `xl` | `size` |
| `state` | variant | `default`, `hover`, `active`, `loading`, `focus`, `disabled` | `loading={state === "loading"}`, `disabled={state === "disabled"}`; omit visual-only states |
| `changeIcon#2654:0` | instance swap | icon | `icon` after icon Code Connect exists |

Live Figma has been restored to the Button-compatible spec/code contract:

```text
variant = primary | secondary | outline | ghost | text | destruction
state = default | hover | active | focus | loading | disabled
size = s | m | l | xl
```

Validation: saved scan confirms 144 variants, score `100`, unstyled text `0`, raw fills `0`, raw strokes `0`, and audit warnings `0`. Live validation also found missing combinations `0`, duplicate combinations `0`, occupied grid cells `144`, grid overlaps `0`; `outline` is placed in rows 8-11 and `text` is placed in rows 16-19. A post-scan fix synchronized IconButton root fill, root stroke, icon/spinner fill and focus ring from the matching Button variant/state/size combination; live validation reports `mismatchCount=0` across all 144 combinations.

Known live Figma nuance: IconButton `variant` and `state` dropdown order remains non-canonical in `componentPropertyDefinitions` even though every value and matrix combination is present. If dropdown order matters for authoring ergonomics, reorder manually in the Figma UI.

### Link

| Figma property | Type | Values | Code mapping |
|---|---|---|---|
| `typeText#1280:0` | text | label | children |
| `textStyle` | variant | `body-extra-small`, `body-small`, `body`, `body-large` | `textStyle` |
| `size` | variant | `s`, `m`, `l`, `xl` | `size` |
| `strong` | variant | `false`, `true` | `strong` boolean |
| `visited` | variant | `false`, `true` | `visited` boolean |
| `state` | variant | `default`, `hover`, `pressed` | omit visual-only states |

Semantic `variant=default/subtle/inverse/danger` remains code/handoff token intent and is not exposed by canonical Figma Link yet.

### Text Field

| Figma property | Type | Values | Code mapping |
|---|---|---|---|
| `size` | variant | `s`, `m`, `l`, `xl` | `size` |
| `state` | variant | `default`, `disabled`, `error`, `hover`, `focus` | `state`, `disabled={state === "disabled"}` |
| `filled` | variant | `false`, `true` | `filled` |
| `label#917:31` | boolean | true/false | example label visibility; code requires `label` unless exceptional accessible-name pattern exists |
| `hintText#917:62` | boolean | true/false | `helperText` |
| `errorInfo#917:97` | boolean | true/false | `errorText` when `state=error` |

### Select

| Figma property | Type | Values | Code mapping |
|---|---|---|---|
| `selection` | variant | `single`, `multi` | `selection` |
| `size` | variant | `s`, `m`, `l`, `xl` | `size` |
| `state` | variant | `default`, `disabled`, `error`, `filled`, `focus`, `hover`, `open` | `state`, `disabled={state === "disabled"}` |

Example must provide realistic `options`; options are product data, not a Figma variant.

### Checkbox

| Figma property | Type | Values | Code mapping |
|---|---|---|---|
| `size` | variant | `s`, `m`, `l`, `xl` | `size` |
| `turnOn` | variant | `false`, `true` | `checked` |
| `state` | variant | `default`, `hover` | omit visual-only state |

### Radio

| Figma property | Type | Values | Code mapping |
|---|---|---|---|
| `size` | variant | `s`, `m`, `l`, `xl` | `size` |
| `turnOn` | variant | `false`, `true` | selected example value |
| `state` | variant | `default`, `hover` | omit visual-only state |

Code represents Radio as a group. A single Figma radio variant should map to a minimal two-option group example unless a richer parent group component is introduced.

### Toggle

| Figma property | Type | Values | Code mapping |
|---|---|---|---|
| `size` | variant | `s`, `m`, `l`, `xl` | `size` |
| `on` | variant | `false`, `true` | `checked` |
| `state` | variant | `default`, `hover` | omit visual-only state |

## Next Actions

1. Enable Figma Code Connect access.
2. Create Wave 1 mappings from this review.
3. Run retrieval tests for Button, Text Field, and one selection control.
4. If local npm still cannot find system `node`, run TypeScript validation through the explicit local Node command above.
