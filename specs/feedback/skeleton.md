# Skeleton

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Skeleton — feedback-компонент для первичной загрузки известной структуры интерфейса. Он показывает форму будущего контента до того, как данные готовы, и помогает избежать ощущения пустого или сломанного экрана.

### Когда использовать

**Используйте** — когда структура будущего контента известна заранее:

- карточки;
- строки списка;
- таблицы;
- профиль или объектная страница;
- блоки дашборда;
- формы, где поля уже известны;
- повторяющиеся элементы с одинаковой композицией.

**Не используйте:**

- Для операций короче 300ms, чтобы не создавать flicker.
- Для неизвестной структуры — используйте **Spinner** или текстовое loading-состояние.
- Для известного прогресса — используйте **Progress Bar**.
- Для состояния после завершения загрузки без данных — используйте **Empty State**.
- Для ошибки загрузки — используйте **Alert**, **Toast** или error-состояние в контексте.

### Основные принципы

- **Shape before decoration** — Skeleton повторяет форму будущего контента, а не рисует абстрактные полосы.
- **Stable layout** — замена Skeleton на контент не должна вызывать layout shift.
- **Short-lived state** — Skeleton исчезает сразу после готовности данных.
- **Motion supports loading** — анимация следует [foundation/motion.md](../foundation/motion.md) и имеет reduced-motion fallback.
- **State vocabulary is explicit** — Skeleton описывает loading-состояние по [foundation/state-vocabulary.md](../foundation/state-vocabulary.md), но не получает hover, focus, selected или disabled.

---

## 2. Anatomy

Skeleton собирается из примитивов, которые повторяют будущую композицию.

```text
[circle]  [text line long]
          [text line short]

[rectangle image placeholder]
[text line]
[text line short]
```

| Part | Shape | Required | Usage |
| --- | --- | --- | --- |
| `root` | Container | yes | Holds one or more skeleton primitives |
| `text` | Rounded line | conditional | Text line, label, title, description |
| `circle` | Circle | optional | Avatar, user image, icon slot |
| `rectangle` | Rectangle | optional | Image, media block, chart area |
| `rounded` | Rounded rectangle | optional | Button, input, card surface |
| `shine` | Overlay highlight | conditional | Used only for `wave` animation |

### Composition rules

- Use the minimum number of primitives needed to communicate structure.
- Match the final content proportions closely enough to avoid layout jump.
- Do not expose Skeleton primitives as meaningful content to assistive technologies.
- Не используйте реальные text labels внутри Skeleton.

---

## 3. Types / Variants

### Animation variants

| Variant | Description | Default use |
| --- | --- | --- |
| `pulse` | Opacity or surface shift over `duration/loading` | Default for simple placeholders |
| `wave` | Shine passes across the placeholder | Large content blocks, cards, lists |
| `none` | Static placeholder | Reduced motion or constrained environments |

### Composition patterns

| Pattern | Description | Notes |
| --- | --- | --- |
| `text-skeleton` | One or more text lines | Last line is usually shorter |
| `avatar-row-skeleton` | Circle plus text lines | User list, comment row, profile header |
| `card-skeleton` | Media block plus title/details | Card grid or dashboard tile |
| `list-skeleton` | Repeated rows | Keep row height close to final list item |
| `table-skeleton` | Header/row placeholders | Preserve table header if it is already known |
| `form-skeleton` | Label/input placeholders | Use only when form fields are known |
| `chart-skeleton` | Rectangle or chart-shaped placeholder | Avoid fake data visualization |

---

## 4. Sizes

Skeleton size is driven by the final content it represents. It does not introduce independent typography or density choices.

| Size / pattern | Dimensions | Use |
| --- | --- | --- |
| `text-xs` | Small text line height from typography context | Metadata, helper text |
| `text-sm` | Body text line height from typography context | Body copy, table cell |
| `text-md` | Label/title line height from typography context | Form label, card title |
| `circle-sm` | Icon or compact avatar slot | Dense rows, toolbar placeholder |
| `circle-md` | Default avatar slot | User row, profile summary |
| `rectangle` | Container-defined width and aspect ratio | Media, image, chart, preview |
| `block` | Container-defined height | Panels, cards, large sections |

### Правила размеров

- Use the final component's height, width, radius, and spacing when they are known.
- Keep repeated Skeleton rows consistent with the eventual row height.
- If exact content width is unknown, vary text line width in a realistic range instead of using identical full-width lines.
- Do not create component-level size tokens until the system defines them; use foundation spacing, radius, and typography roles.

---

## 5. States

Skeleton represents async loading state only.

| State | Значение | Поведение |
| --- | --- | --- |
| `loading` | Data is still being fetched or prepared | Skeleton is visible |
| `reduced-motion` | User prefers reduced motion | Skeleton is static |
| `resolved` | Data is ready | Skeleton is replaced by final content |
| `empty` | Request completed with no data | Use Empty State, not Skeleton |
| `error` | Request failed | Use contextual error pattern, not Skeleton |

### Unsupported states

Skeleton must not expose `hover`, `focus`, `active`, `selected`, `checked`, `disabled`, or `read-only`. Those states belong to the final component that replaces Skeleton.

---

## 6. Behavior

### Display timing

- Do not show Skeleton immediately for very short operations if it causes flicker.
- For predictable loading, Skeleton may appear after a short delay and remain until content is ready.
- Replace Skeleton and content in the same layout region.
- Do not keep Skeleton visible after content is available.

### Layout behavior

- Reserve the final content space before data arrives.
- Keep container width, row height, card height, and major spacing stable.
- Use the same grid/list/table structure that final content will use.
- Avoid fake details that imply data exists.

### Motion behavior

- `pulse` and `wave` use `duration/loading`.
- `wave` uses `skeleton/shine/default`.
- Reduced motion sets animation to `none`.
- Loading motion must not be the only signal that content is loading.

### Replacement behavior

- When data resolves, replace Skeleton with final content without shifting surrounding layout.
- If the result is empty, replace Skeleton with Empty State.
- If loading fails, replace Skeleton with the appropriate error or retry pattern.

---

## 7. Accessibility

Skeleton follows [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Busy region | Set `aria-busy="true"` on the loading content region when appropriate |
| Status text | Provide a loading status outside decorative primitives when users need confirmation |
| Decorative primitives | Mark Skeleton primitives as `aria-hidden="true"` |
| Reduced motion | Respect `prefers-reduced-motion: reduce` |
| Focus | Do not move focus to Skeleton |
| Screen reader content | Do not expose fake headings, rows, labels, or values |

### Accessibility checklist

- [ ] Skeleton primitives are hidden from assistive technologies.
- [ ] Loading region communicates busy state when needed.
- [ ] Focus remains on the user's current task or trigger.
- [ ] Reduced motion disables shimmer/wave animation.
- [ ] Final content replacement does not unexpectedly move focus.
- [ ] Error and empty outcomes replace Skeleton with meaningful states.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Role | Component token | Semantic |
| --- | --- | --- |
| Base surface | `skeleton/surface/default` | `status/disabled/container` |
| Subtle surface | `skeleton/surface/subtle` | `surface/subtle` |
| Wave shine | `skeleton/shine/default` | `surface/base` |

### Token gaps

- Skeleton does not currently have component tokens for radius, spacing, primitive height, line width, or animation duration.
- Use foundation radius, spacing, typography, and motion roles until component-level Skeleton tokens are introduced.
- Do not invent token names for Skeleton primitives in specs, code, Figma, or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Animation | `animation` | `pulse`, `wave`, `none` |
| Pattern | `pattern` | `text`, `avatar-row`, `card`, `list`, `table`, `form`, `chart` |
| Lines | `lines` | Number of text lines |
| Shape | `shape` | `text`, `circle`, `rectangle`, `rounded` for primitive API |
| Width | `width` | Token, percentage, or container-derived value |
| Height | `height` | Token or container-derived value |
| Radius | `radius` | Foundation radius role |
| Animated | `animated` | Boolean fallback for demos or simple APIs |
| Aria hidden | `aria-hidden` | True for decorative primitives |

### Contract rules

- Skeleton API should describe structure, not fake content.
- Pattern APIs should map to documented compositions.
- Do not expose arbitrary color props.
- Do not expose focusable Skeleton primitives.
- Не используйте Skeleton после завершения request.

---

## 10. Handoff notes

В handoff нужно передать:

- loading trigger condition;
- expected final component or content pattern;
- Skeleton pattern and primitive structure;
- animation variant: `pulse`, `wave`, or `none`;
- reduced-motion behavior;
- replacement outcome: content, Empty State, or error state;
- layout constraints that must remain stable;
- token mapping for surface and shine;
- any token gaps for size, radius, or spacing.

### Acceptance criteria

- Skeleton appears only while content is loading.
- Skeleton structure matches the expected final content.
- Final content replacement does not create noticeable layout shift.
- Reduced motion disables shimmer or pulse animation.
- Skeleton primitives are not announced as real content.
- Empty and error outcomes do not keep Skeleton visible.
- Surface and shine colors use documented component tokens.

---

## 11. AI usage rules

- AI may use Skeleton only for loading of known content structure.
- AI must recommend Spinner when structure is unknown.
- AI must recommend Progress Bar when progress is measurable.
- AI must recommend Empty State when loading completes with no data.
- AI must not invent fake labels, data rows, chart values, or token names.
- AI must check `tokens.json` before changing Skeleton token mappings.
- AI must flag missing loading trigger, missing replacement state, missing reduced-motion behavior, or layout shift risk as `Needs system review`.
- AI may draft Skeleton structure and handoff notes, but human review is required.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| User list loading | `avatar-row-skeleton` repeated for expected visible rows |
| Card grid loading | `card-skeleton` with media rectangle and two text lines |
| Table body loading | Keep known header; show row-shaped placeholders |
| Profile header loading | Circle plus title/subtitle text lines |

### Требует review

| Scenario | Reason |
| --- | --- |
| Skeleton shown after data is already empty | Should be Empty State |
| Shimmer continues for reduced-motion users | Accessibility issue |
| Placeholder rows are much taller than final rows | Causes layout shift |
| Fake chart bars imply real values | Misleading representation |

---

## 13. Anti-patterns

- Using Skeleton for every async operation by default.
- Showing Skeleton for short operations that would complete without visible loading.
- Using identical full-width lines for all text placeholders.
- Exposing Skeleton primitives to screen readers as real content.
- Keeping Skeleton visible after error or empty result.
- Creating one-off Skeleton colors outside component tokens.
- Using Skeleton to hide slow interaction feedback that should be optimized instead.
