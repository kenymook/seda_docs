# Button

> **Category** · Actions
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · https://www.figma.com/design/h8wSwPpnlt91IQH7h4Kvj0/SEDA-UI-kit?node-id=2463-16164

---

## 1. Key Principles of Use

### Что это

Button — основной action-компонент для запуска действия: отправки формы, подтверждения операции, сохранения изменений, запуска процесса или перехода к следующему шагу сценария. В отличие от Link, Button не ведёт к ресурсу, а инициирует действие внутри продукта.

### Когда использовать

**Используйте** — когда пользователь должен выполнить явное действие:

- отправить форму;
- сохранить или применить изменения;
- подтвердить операцию;
- запустить процесс;
- повторить запрос;
- перейти к следующему шагу мастера;
- выполнить действие в карточке, таблице, тулбаре или модальном окне.

**Не используйте:**

- Для навигации к URL, странице или якорю — используйте **Link**.
- Для выбора одного варианта из набора — используйте **Radio** или **Segmented Control**.
- Для переключения режима с постоянным selected-состоянием — используйте **Button Group** или **Toggle**, если сценарий toggle-like.
- Для действия только с иконкой — используйте **Icon Button**.
- Для декоративного выделения текста — используйте типографику, Badge или Tag.

### Основные принципы

- **One primary per context** — в одном смысловом контексте должен быть один главный Button.
- **Hierarchy communicates priority** — `primary`, `secondary`, `outline`, `ghost`, `text` задают убывающий визуальный вес.
- **Label is an action** — label должен быть глаголом или глагольной фразой по [foundation/content.md](../foundation/content.md): `Сохранить`, `Создать проект`, `Повторить`.
- **State belongs to the control** — состояния Button следуют [foundation/state-vocabulary.md](../foundation/state-vocabulary.md) и не дублируются родителем без причины.
- **Danger needs intent** — `destruction` используется только для действий с необратимыми или рискованными последствиями и обычно требует подтверждения.
- **Tokens before visuals** — визуальные значения берутся из component tokens; raw colors, borders и focus styles не задаются вручную.

---

## 2. Anatomy

```text
┌─────────────────────────────────────┐
│ [icon-left]  Label  [icon-right]    │
└─────────────────────────────────────┘
```

| Слот | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Native button element and visual container |
| `label` | yes | Action label; required for regular Button |
| `iconLeft` | optional | Leading icon that supports the action meaning |
| `iconRight` | optional | Trailing icon for continuation, disclosure, external process, or direction |
| `spinner` | conditional | Loading indicator shown during async action |

### Slot rules

- Regular Button requires visible `label`.
- Не используйте `iconLeft` и `iconRight` только для декорации button.
- If the action has no visible label, use **Icon Button** instead.
- Spinner must not remove the accessible action name.

---

## 3. Types / Variants

| Variant | Purpose | Typical use |
| --- | --- | --- |
| `primary` | Highest emphasis action | Main submit, save, create, continue |
| `secondary` | Supportive action with visible container | Cancel, secondary submit, alternative action |
| `outline` | Lower-emphasis action with border | Toolbar action, neutral action near primary |
| `ghost` | Low-emphasis action without default border/fill | Dense toolbar, table row, card action |
| `text` | Inline or very low-emphasis action | Inline action near text, low-risk utility action |
| `destruction` | Risky or irreversible action | Delete, revoke access, remove data |

### Modifiers

| Modifier | Description | Restrictions |
| --- | --- | --- |
| `iconLeft` | Adds an icon before label | Icon must support label meaning |
| `iconRight` | Adds an icon after label | Use for continuation, disclosure, or direction |
| `fullWidth` | Button fills parent width | Use for mobile, forms, and narrow containers |
| `loading` | Async operation is running | Blocks repeated activation and preserves width |
| `disabled` | Action is not available | Requires visible or contextual explanation if not obvious |

### Type hierarchy

| Context | Primary | Secondary / outline | Ghost / text |
| --- | --- | --- | --- |
| Save form | `Сохранить` | `Отмена` | — |
| Delete dialog | `Удалить` as `destruction` | `Отмена` | — |
| Object card | `Открыть` | `Редактировать` | `Поделиться` |
| Toolbar | — | `Экспорт` | `Фильтр`, `Сортировка` |
| Empty state | `Создать проект` | `Импортировать` | `Подробнее` |

---

## 4. Sizes

Button follows [foundation/spacing-sizing.md](../foundation/spacing-sizing.md), [foundation/radius-border.md](../foundation/radius-border.md), and [foundation/iconography.md](../foundation/iconography.md).

| Size | Height | Font / line | Radius | Horizontal padding | Icon | Context |
| --- | --- | --- | --- | --- | --- | --- |
| `small` | 24px | 12px / 16px | 6px | 8px | 14px | Dense toolbar, table row action |
| `medium` | 32px | 14px / 20px | 8px | 12px | 16px | Default product UI |
| `large` | 40px | 16px / 24px | 10px | 16px | 18px | Prominent action in forms or panels |
| `extraLarge` | 48px | 18px / 28px | 12px | 20px | 20px | Touch-first or high-emphasis flow |

### Правила размеров

- `medium` is the default size for product screens.
- `small` may have visual height below 44px, but the touch target must be expanded where touch input is expected.
- Do not change typography scale to create a custom hierarchy; choose a documented variant and size.
- Size does not change the semantic priority of the action.

---

## 5. States

### Матрица состояний

| State | Описание | Визуальное изменение |
| --- | --- | --- |
| `default` | Base interactive state | Default surface, border, foreground |
| `hover` | Pointer is over the button | Surface and border use hover tokens where defined |
| `active` / `pressed` | Pointer or keyboard activation is in progress | Surface and border use pressed tokens where defined |
| `focus` | Keyboard focus | Focus ring uses `focus/ring` |
| `loading` | Async action is running | Spinner appears; repeat activation is blocked |
| `disabled` | Action is unavailable | Disabled surface, border, and foreground tokens |

### Допустимые сочетания

| Сочетание | Допустимо | Примечания |
| --- | --- | --- |
| `hover` + `focus` | yes | Possible during keyboard focus and pointer hover |
| `active` + `focus` | yes | Possible with Enter or Space activation |
| `loading` + `focus` | yes | Focus may remain on the control while request runs |
| `loading` + `disabled` | conditional | Use only if implementation needs both visual and semantic blocking |
| `hover` + `disabled` | no | Disabled cancels interactive states |
| `active` + `disabled` | no | Disabled controls cannot be activated |

### State ownership

- Button owns `hover`, `active`, `focus`, `loading`, and `disabled`.
- Parent components may pass state into Button, but must not redefine its visual rules.
- Toggle-like `selected` or `pressed` state belongs to Button Group, Toggle, or a documented toggle pattern, not to regular Button.

---

## 6. Details on Types / Variants

### primary

Use for the main action in a local context. The token branch is primary solid. Primary Button should not compete with another primary action in the same form, modal, card, or screen section.

### secondary

Use for supportive actions near a primary action. The token branch is neutral secondary. Secondary has a visible container and can stand alone when the action is neutral but still important.

### outline

Use for neutral actions that need a visible boundary without filled emphasis. The token branch is neutral outline. It is useful in toolbars, modal footers, and action rows where a filled secondary button would be too heavy.

### ghost

Use for low-emphasis actions in dense interfaces. The token branch is neutral ghost. Ghost Button should not be used for the only critical action in a screen.

### text

Use for inline or low-emphasis actions. The token branch is neutral text. Text Button must still behave as a button, not as a link, unless it navigates to a resource.

### destruction

Use for risky or irreversible actions. The token branch is danger solid. Destruction Button should name the destructive action and object clearly: `Удалить проект`, not `Да`.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
| --- | --- |
| `Tab` / `Shift+Tab` | Move focus to or from the button |
| `Enter` | Activate button |
| `Space` | Activate button |

### Native behavior

- Use native `<button>` for actions.
- Always set `type`: `button`, `submit`, or `reset`.
- Default to `type="button"` unless the button submits a form.
- Do not implement Button as clickable `<div>`.
- Не используйте `<a>` для actions, которые не выполняют navigation.

### Loading state

- Loading blocks repeated activation.
- Loading must preserve the accessible name of the action.
- Spinner may replace an icon, but should not erase the label unless an equivalent accessible label remains.
- Button width should remain stable between default and loading states.
- Loading should respect reduced motion preferences.

### Responsive behavior

- Button label wraps only when the container cannot support the minimum useful width.
- In narrow containers, action groups may stack vertically.
- `fullWidth` is allowed in forms, mobile layouts, and narrow panels.
- Icon and label spacing must remain token-driven.

---

## 8. Accessibility

Button follows [foundation/accessibility.md](../foundation/accessibility.md) and should meet WCAG 2.2 AA for interactive controls.

### Semantics

| Element / part | Semantics | Rule |
| --- | --- | --- |
| Root | `<button type="button">`, `<button type="submit">`, or `<button type="reset">` | Use native semantics |
| `iconLeft` / `iconRight` | `aria-hidden="true"` | When icon duplicates label meaning |
| `spinner` | `aria-hidden="true"` or labelled status pattern | Depends on whether the label remains visible |
| Disabled button | Native `disabled` | Use when action is unavailable and should leave tab order |
| Loading button | `aria-disabled="true"` and internal activation guard | Use when focus should remain while async action runs |

### Accessibility checklist

- [ ] Root is a native `<button>`.
- [ ] `type` is explicit.
- [ ] Visible label describes the action.
- [ ] Loading keeps an accessible action name.
- [ ] Disabled reason is clear from context or helper text.
- [ ] Focus ring uses `focus/ring` and is not clipped.
- [ ] Text contrast is at least 4.5:1 where required.
- [ ] Icon and interactive border contrast is at least 3:1 where required.
- [ ] Touch target is at least 44x44px where touch input is expected.
- [ ] Destructive action is not communicated only through color.

---

## 9. Design Tokens

Пути ниже сверены с `tokens.json`. Use component tokens first; use semantic tokens only as implementation fallback when a component token is missing.

### Variant token branches

| Variant | Representative token | Notes |
| --- | --- | --- |
| `primary` | `button/primary/solid/surface/default` | Brand filled action |
| `secondary` | `button/neutral/secondary/surface/default` | Neutral filled or subtle container action |
| `outline` | `button/neutral/outline/border/default` | Neutral bordered action |
| `ghost` | `button/neutral/ghost/surface/default` | Transparent default action |
| `text` | `button/neutral/text/foreground/default` | Transparent inline action |
| `destruction` | `button/danger/solid/surface/default` | Danger filled action |

### Token roles

| Role | Token path pattern | Applies to |
| --- | --- | --- |
| Surface | `button/primary/solid/surface/default` | Button container background |
| Surface hover | `button/primary/solid/surface/hover` | Hover background |
| Surface pressed | `button/primary/solid/surface/pressed` | Active background |
| Surface disabled | `button/primary/solid/surface/disabled` | Disabled background |
| Surface loading | `button/primary/solid/surface/loading` | Loading background |
| Border | `button/primary/solid/border/default` | Button border |
| Border hover | `button/primary/solid/border/hover` | Hover border |
| Border pressed | `button/primary/solid/border/pressed` | Active border |
| Border disabled | `button/primary/solid/border/disabled` | Disabled border |
| Border loading | `button/primary/solid/border/loading` | Loading border |
| Foreground | `button/primary/solid/foreground/default` | Label and icon |
| Foreground disabled | `button/primary/solid/foreground/disabled` | Disabled label and icon |
| Foreground loading | `button/primary/solid/foreground/loading` | Loading label and icon |
| Spinner foreground | `button/primary/solid/spinner/foreground` | Loading spinner |
| Focus ring | `button/primary/solid/focus/ring` | Keyboard focus |

Use the same role structure for the relevant variant branch: neutral secondary, neutral outline, neutral ghost, neutral text, or danger solid.

### Token gaps

- Size, radius, padding, gap, icon size, and typography are currently documented through foundation values rather than Button component tokens.
- If component-level size tokens are added later, map them explicitly instead of replacing this section with raw px values.
- Do not invent Button token names in specs, code, Figma, or AI-generated handoff.

---

## 10. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Variant | `variant` | `primary`, `secondary`, `outline`, `ghost`, `text`, `destruction` |
| Size | `size` | `small`, `medium`, `large`, `extraLarge` |
| Label | `children` or `label` | Required visible text for regular Button |
| Leading icon | `iconLeft` | Decorative unless it adds meaning not in label |
| Trailing icon | `iconRight` | Use for continuation, disclosure, or direction |
| Full width | `fullWidth` | Boolean |
| Loading | `loading` | Boolean; blocks repeat activation |
| Disabled | `disabled` | Boolean; unavailable state |
| Type | `type` | `button`, `submit`, `reset`; default `button` |
| Click handler | `onClick` | Required for non-submit actions |

### Contract rules

- `variant` must be one of the documented variants.
- `size` must be one of the documented sizes.
- Regular Button requires visible text.
- Use Icon Button for icon-only actions.
- Do not pass raw colors, raw spacing, or custom border styles through props.
- Do not add ad-hoc variants such as `success`, `warning`, or `link` without system review.

---

## 11. Handoff notes

В handoff нужно передать:

- variant and size;
- label text;
- icon name and placement, if used;
- state requirements: default, hover, active, focus, loading, disabled;
- action behavior: submit, click handler, retry, navigation exception, or async process;
- `type` value;
- whether the button is `fullWidth`;
- loading behavior and whether width must be preserved;
- disabled reason, if not obvious;
- destructive confirmation requirement, if applicable;
- token branch used for the visual variant.

### Acceptance criteria

- Button uses a documented variant and size.
- Button uses real component token paths for color, border, focus, and spinner.
- Button has a clear action label.
- Button uses native `<button>` semantics with explicit `type`.
- Loading blocks repeated activation and preserves accessible name.
- Disabled state is not used as the only explanation for unavailable action.
- Destruction Button clearly names the risky action.
- No raw visual values are introduced in implementation.

---

## 12. AI usage rules

- AI may use only documented variants: `primary`, `secondary`, `outline`, `ghost`, `text`, `destruction`.
- AI may use only documented sizes: `small`, `medium`, `large`, `extraLarge`.
- AI must check `tokens.json` before writing or changing Button token mappings.
- AI must not invent Button props, variants, states, token paths, or visual overrides.
- AI must recommend Link when the requirement is navigation to a resource.
- AI must recommend Icon Button when the requirement is icon-only action.
- AI must flag missing action behavior, missing `type`, unclear label, unsupported variant, or raw visual values as `Needs system review`.
- AI may draft labels, handoff notes, and acceptance criteria, but human review is required.

---

## 13. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| Save form | `variant=primary`, `type=submit`, label `Сохранить` |
| Cancel in modal | `variant=outline` or `secondary`, `type=button`, label `Отмена` |
| Retry request | `variant=secondary`, label `Повторить`, `loading=true` while request runs |
| Delete project | `variant=destruction`, label `Удалить проект`, confirmation required |
| Dense toolbar action | `variant=ghost`, size `small`, label `Фильтр` |

### Требует review

| Scenario | Reason |
| --- | --- |
| Two primary buttons in one modal footer | Competing hierarchy |
| Button label `OK` for destructive action | Action and object are unclear |
| Custom green success button | Unsupported variant and token branch |
| Icon-only regular Button | Should be Icon Button |
| Raw CSS color override | Breaks token contract |

---

## 14. Anti-patterns

- Using Button for navigation when Link is required.
- Using Link for submit, save, delete, retry, or other actions.
- Adding several primary buttons in one local context.
- Hiding the action meaning behind generic labels: `OK`, `Да`, `Готово` without context.
- Using `destruction` only because the action is visually important.
- Removing focus ring.
- Using `disabled` without explaining why the action is unavailable.
- Replacing loading label with a spinner without accessible name.
- Creating custom one-off button colors outside component tokens.
