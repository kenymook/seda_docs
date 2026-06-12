# Button System

> **Category** · Actions
> **Version** · 1.0
> **Status** · ready
> **Owner** · Kenymook
> **Last reviewed** · 2026-06-12
> **Figma** · [Button / Button](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=4017-1035), [Button / IconButton](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=2654-2866)
> **Foundation** · `accessibility.md`, `content.md`, `iconography.md`, `spacing-sizing.md`, `state-vocabulary.md`, `tokens.md`

---

## Decision

Button System is the shared action model for labeled and icon-only buttons in SEDA AI.

Button and Icon Button are not merged into one component set. They stay as separate production components because their anatomy, accessibility contract and code props are different:

- **Button** has visible action text and may include leading/trailing icons.
- **Icon Button** has no visible text label and requires an accessible name plus tooltip.

They must still share the same action hierarchy, size scale and state vocabulary so designers, engineers and AI tools can select actions consistently.

---

## Figma naming

Use a shared namespace for discoverability:

| Public component | Figma component set name | Purpose |
|---|---|---|
| Button | `Button / Button` | Labeled action button. |
| Icon Button | `Button / IconButton` | Icon-only action button. |

Do not combine Button and Icon Button variants into one giant set. The shared namespace expresses that both components belong to the same system without mixing incompatible anatomy.

---

## Shared API axes

Button and Icon Button must expose the same public values for these axes:

| Axis | Values | Rule |
|---|---|---|
| `variant` | `primary`, `secondary`, `outline`, `ghost`, `text`, `destruction` | Same visual hierarchy across labeled and icon-only actions. |
| `size` | `small`, `medium`, `large`, `extraLarge` | Code API names. Figma may show `s`, `m`, `l`, `xl` if the existing component set uses compact labels. |
| `state` | `default`, `hover`, `active`, `loading`, `focus`, `disabled` | `pressed` in Figma should map to `active` in docs/code. |

If one component receives a new public variant, the other component must be reviewed in the same change. New action hierarchy values require system review.

---

## Differences that must remain separate

| Concern | Button | Icon Button |
|---|---|---|
| Visible content | Required text label. | Icon only. |
| Accessible name | Usually derived from visible label. | Required via `aria-label` or equivalent. |
| Tooltip | Optional. | Required unless visible text next to the control already explains the action. |
| Shape | Content-width pill/rectangle. | Square control. |
| Icons | Optional leading/trailing support. | Required icon slot. |
| Main page action | Allowed. | Usually not allowed without visible text nearby. |

---

## Token model

Button and Icon Button may use separate component token namespaces:

- Button tokens use the `button` component-token namespace.
- Icon Button tokens use the `icon-button` component-token namespace.

The semantic meaning of variants must stay aligned even if the token paths differ. For example, `destruction` in both components represents the same risky action hierarchy, even if Button uses `button/danger/solid/surface/default` and Icon Button uses `icon-button/danger/surface/default`.

---

## Code model

Use separate exports:

```tsx
import { Button, IconButton } from "@seda-ai/ui";
```

Both components share `variant`, `size`, `loading`, `disabled`, `type` and action handler semantics where applicable. They diverge where the UI contract diverges:

| Prop area | Button | IconButton |
|---|---|---|
| Content | `children` / visible label | `icon` |
| Accessibility | visible label, optional `aria-label` for special cases | required `ariaLabel` / `aria-label` |
| Tooltip | optional `tooltip` | required `tooltip` in most icon-only contexts |
| Width | optional `fullWidth` | fixed square size |

---

## AI readiness rules

AI may:

- choose between Button and Icon Button based on whether visible text is needed;
- reuse the shared variant, size and state vocabulary;
- suggest `aria-label` and tooltip text for Icon Button;
- flag missing pair updates when Button and Icon Button APIs diverge.

AI must not:

- merge Button and Icon Button into one component implementation;
- invent new variants for only one of the two components;
- use Icon Button when the action needs visible explanation;
- use Button without visible text for icon-only actions;
- map Figma `pressed` to a public code value unless the component contract explicitly calls it `active`.

---

## Acceptance criteria

- [ ] Button and Icon Button stay as separate component sets.
- [ ] Both component sets live under the `Button /` namespace in Figma.
- [ ] Both components expose the same public `variant` values.
- [ ] Both components expose the same public size scale.
- [ ] Both components use the same state vocabulary or documented adapter mapping.
- [ ] Icon Button keeps required accessible-name and tooltip rules.
- [ ] Code Connect maps both components to separate exports from `@seda-ai/ui`.
