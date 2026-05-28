# Description List

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Description List — data display-компонент для отображения пар term-value: свойство объекта и его значение. Семантически это структура `<dl>`, `<dt>`, `<dd>`, а не таблица и не форма.

### Когда использовать

**Используйте** — когда нужно показать набор свойств одного объекта или записи:

- детали профиля;
- параметры заказа, сделки, задачи или заявки;
- характеристики продукта;
- summary блока перед подтверждением;
- read-only данные формы;
- metadata объекта;
- технические атрибуты, если их немного и они читаются как пары ключ-значение.

**Не используйте:**

- Для табличных данных с несколькими строками объектов — используйте **Table**.
- Для сравнения нескольких объектов между собой — используйте **Table**.
- Для редактируемых полей — используйте Form и input-компоненты.
- Для одного визуально выделенного KPI — используйте **Stat / Metric**.
- Для произвольного layout-контента — используйте Card, Section или layout pattern.

### Основные принципы

- **Term defines value** — каждый value должен иметь понятный term.
- **One object, many properties** — Description List лучше всего работает для свойств одного объекта.
- **Semantic structure matters** — используйте `<dl>`, `<dt>`, `<dd>` там, где контент является term-value данными.
- **Density follows context** — компактность не должна ломать читаемость длинных значений.
- **Do not fake a table** — если нужны сортировка, колонки, строки объектов или фильтры, это Table.
- **Content is exact** — labels, empty values и placeholders следуют [foundation/content.md](../foundation/content.md).

---

## 2. Anatomy

```text
Term                  Definition
Status                Ready
Owner                 Design system
Last updated          27 May 2026
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Description list container |
| `item` | yes | One term-definition pair |
| `term` (`dt`) | yes | Property name or label |
| `definition` (`dd`) | yes | Property value |
| `description` | optional | Supporting explanation for a value |
| `action` | optional | Nested copy/link/action when needed |
| `divider` | optional | Visual separation between rows |

### Правила anatomy

- Every item must have one term and at least one definition.
- Multiple definitions may belong to one term only when the relationship is semantically correct.
- Nested actions use Button, Icon Button, or Link contracts.
- Empty values must be explicit: use `Не указано`, `Нет данных`, or product-specific text instead of blank space.

---

## 3. Types / Variants

| Variant | Description | Use |
| --- | --- | --- |
| `horizontal` | Term and definition appear in one row | Short values, object details |
| `vertical` | Term appears above definition | Long values, mobile, narrow panels |
| `table-like` | Row separators and aligned columns | Dense read-only details without table interactions |

### Modifiers

| Modifier | Description | Rule |
| --- | --- | --- |
| `bordered` | Adds row separators | Use for dense or grouped data |
| `striped` | Alternating row surface | Use only when many rows reduce scan clarity |
| `compact` | Reduces spacing | Use in side panels and dense cards |
| `withDescriptions` | Adds supporting text per item | Use for technical or ambiguous values |
| `withActions` | Adds copy/link/action controls | Nested controls own their states |

---

## 4. Sizes

Description List size controls density, spacing, and term column width. It does not change semantic structure.

| Size | Density | Term width | Use |
| --- | --- | --- | --- |
| `compact` | Reduced vertical spacing | Narrow or content-fit | Side panels, table expansion, dense cards |
| `medium` | Default spacing | Stable label column | Default product UI |
| `large` | More spacing | Wider label column | Detail pages, confirmation summary |

### Правила размеров

- Use `medium` by default.
- Use `compact` only when values remain readable.
- Use `large` when Description List is the main content of a section.
- Term width should be stable within one list.
- On narrow screens, horizontal layout may switch to vertical.

---

## 5. States

Description List is static by default. Component-level state describes data availability or row emphasis, not direct interaction.

| State | Meaning | Rule |
| --- | --- | --- |
| `default` | Normal term-value display | Standard row surface |
| `striped` | Alternating row for scan support | Visual aid only |
| `hover` | Row hover when row has nested action or reveals controls | Use only if row is interactive or action-revealing |
| `empty` | Value is missing | Show explicit empty text |
| `disabled` | Value is unavailable due to permissions or state | Explain if not obvious |

### State ownership

- Link, Button, Icon Button, copy action, Tooltip, and Popover states belong to nested components.
- Description List should not expose selection, checked, loading, or validation states unless a higher-level pattern defines them.
- Empty values must not be communicated by absence alone.

---

## 6. Behavior

### Layout behavior

- Horizontal layout aligns terms and definitions in stable columns.
- Vertical layout stacks term above definition for long values or narrow containers.
- Long definitions wrap; they should not overflow the container.
- Related items may be grouped with headings outside the component.

### Content behavior

- Terms are concise nouns or noun phrases: `Owner`, `Status`, `Created`.
- Definitions preserve meaningful formatting: dates, currency, IDs, email, links.
- Use copy actions for IDs, tokens, URLs, or values users often reuse.
- Do not truncate critical values without Tooltip, copy, or expand behavior.

### Responsive behavior

- Horizontal layout switches to vertical when term/value columns become too narrow.
- Actions move below or after the definition on narrow widths.
- Stripes and borders should remain aligned after wrapping.

### Large data behavior

- If the list grows beyond a readable object summary, group items or use Table.
- If users need sorting, filtering, bulk comparison, or scanning many records, use Table.

---

## 7. Accessibility

Description List follows [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Semantics | Use `<dl>`, `<dt>`, and `<dd>` for term-value data |
| Reading order | DOM order follows visual order |
| Empty values | Provide readable text for missing values |
| Actions | Nested actions have accessible names |
| Table-like layout | Не используйте layout tables для description lists |
| Truncation | Provide full value through accessible mechanism when needed |

### Accessibility checklist

- [ ] Terms and definitions are programmatically associated.
- [ ] Empty values are explicit.
- [ ] Copy/action controls have clear accessible labels.
- [ ] Long values are readable, copyable, or expandable.
- [ ] Visual separators are not announced as content.
- [ ] The component is not misused as a data table.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Role | Component token | Semantic |
| --- | --- | --- |
| Term foreground | `description-list/term/foreground` | `text/tertiary` |
| Definition foreground | `description-list/definition/foreground` | `text/primary` |
| Description foreground | `description-list/description/foreground` | `text/secondary` |
| Stripe surface | `description-list/stripe/surface` | `surface/base` |
| Row surface default | `description-list/row/surface/default` | `color/transparent` |
| Row surface striped | `description-list/row/surface/striped` | `surface/subtle` |
| Row surface hover | `description-list/row/surface/hover` | `container/neutral/hover` |
| Row border | `description-list/row/border` | `border/subtle` |

### Token gaps

- Description List does not currently have component tokens for term width, row gap, column gap, padding, typography, or action spacing.
- Use foundation spacing, typography, and layout roles until component-level tokens are introduced.
- Do not invent Description List token names in specs, code, Figma, or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Items | `items` | Array of term-value pairs |
| Term | `item.term` | Required |
| Definition | `item.definition` | Required unless `emptyText` is provided |
| Description | `item.description` | Optional supporting text |
| Action | `item.action` | Optional nested action |
| Variant | `variant` | `horizontal`, `vertical`, `table-like` |
| Size | `size` | `compact`, `medium`, `large` |
| Bordered | `bordered` | Boolean |
| Striped | `striped` | Boolean |
| Empty text | `emptyText` | Text for missing values |

### Contract rules

- Each item must have a term.
- Missing definitions must render explicit empty text.
- Do not pass raw colors for row, term, or definition.
- Use nested component APIs for links, buttons, copy actions, or tooltips.
- Не используйте Description List для multi-record table data.

---

## 10. Handoff notes

В handoff нужно передать:

- list purpose and object being described;
- variant, size, bordered/striped behavior;
- item schema: term, definition, description, action;
- empty value wording;
- formatting rules for dates, IDs, currencies, links, and long text;
- responsive switch rules;
- truncation, copy, or expand behavior;
- nested interaction specs, if actions are present;
- token mapping for term, definition, description, row, stripe, and border;
- token gaps for spacing, term width, and typography.

### Acceptance criteria

- Description List represents properties of one object or record.
- Every value has a term.
- Missing values are explicit.
- Semantic `<dl>`, `<dt>`, `<dd>` structure is used when possible.
- Long values wrap or have documented truncation/copy behavior.
- Row surfaces, borders, terms, definitions, and descriptions use documented tokens.
- Component is not used for sortable/filterable multi-record data.

---

## 11. AI usage rules

- AI may use Description List only for term-value data about one object or record.
- AI must recommend Table for multi-record data, comparison, sorting, or filtering.
- AI must recommend Form controls for editable values.
- AI must not invent token paths, variants, row states, or raw visual styles.
- AI must check `tokens.json` before changing Description List token mappings.
- AI must flag missing term, blank value, table misuse, unclear formatting, or unsupported nested interaction as `Needs system review`.
- AI may draft item schemas, empty value text, handoff notes, and acceptance criteria, but human review is required.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| Profile details | Terms: `Name`, `Email`, `Role`; definitions as values |
| Order summary | Terms: `Order ID`, `Status`, `Created`; copy action for ID |
| Product specs | Terms and definitions grouped by category |
| Confirmation screen | Read-only summary before submit |

### Требует review

| Scenario | Reason |
| --- | --- |
| Comparing 10 users across 8 fields | Table is required |
| Editable profile settings | Form controls are required |
| Empty value rendered as blank space | Missing state is unclear |
| Long token truncated without copy | User cannot recover full value |

---

## 13. Anti-patterns

- Using Description List as a layout grid.
- Using it for lists of multiple records.
- Leaving values blank when data is missing.
- Making terms too long or sentence-like.
- Hiding important values behind truncation without access to the full value.
- Adding row hover styles when rows are not interactive.
- Creating custom row colors outside component tokens.
