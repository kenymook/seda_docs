# Grid

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Grid — layout-компонент для распределения контента по колонкам, строкам и responsive tracks. Он задаёт структуру страницы или секции, но не является data grid, table или interactive spreadsheet.

### Когда использовать

**Используйте** — когда нужно управлять композицией интерфейса:

- страницы с несколькими колонками;
- dashboard layout;
- card grids;
- формы с выравниванием полей;
- responsive секции;
- layout внутри Container;
- placeholder или guide mode для проверки выравнивания.

**Не используйте:**

- Для табличных данных — используйте **Table**.
- Для full-width layout wrapper — используйте **Container**.
- Для одной карточки или framed item — используйте **Card**.
- Для каждого маленького компонента внутри карточки.
- Для изменения DOM order ради визуального расположения.
- Для ARIA grid roles, если это только visual layout.

### Основные принципы

- **Layout, not data grid** — Grid управляет композицией, а не табличным поведением.
- **Columns follow content** — количество колонок выбирается по типу контента и breakpoint.
- **Gap before margins** — расстояние между grid items задаётся через `gap`, а не внешние margins.
- **Container owns gutters** — внешние gutters обычно принадлежат Container, Grid управляет внутренними tracks.
- **Responsive order stays readable** — визуальный порядок не должен ломать DOM reading order.
- **AI must preserve layout rules** — AI не должен придумывать breakpoints, gaps или column spans без handoff.

---

## 2. Anatomy

```text
| column | gap | column | gap | column |
| item span 2 columns | item span 1 |
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Grid container |
| `item` | yes | Child content placed on the grid |
| `column` | yes | Track used for horizontal placement |
| `row` | optional | Track used for vertical placement |
| `gap` | yes | Space between tracks |
| `guide` | optional | Visual alignment guide |
| `placeholder` | optional | Empty layout slot or design-time placeholder |

### Правила anatomy

- Grid children should be meaningful layout items.
- Grid should not add semantic roles unless the content itself requires them.
- Guides and placeholders are visual aids, not user content.

---

## 3. Types / Variants

| Variant | Description | Use |
| --- | --- | --- |
| `columns` | Explicit column count, often 12-column | Page and dashboard layout |
| `auto-fit` | Responsive columns based on item minimum width | Card grids |
| `auto-fill` | Fills available space with tracks, including empty slots | Design-time or repeated layouts |
| `subgrid` | Local alignment with parent grid, when supported | Forms, nested alignment |
| `guide` | Visual grid guides | Design review and layout debugging |

### Breakpoints

| Breakpoint | Width | Recommended columns |
| --- | ---: | ---: |
| `xs` | 320px | 4 |
| `sm` | 640px | 4 |
| `md` | 768px | 8 |
| `lg` | 1024px | 12 |
| `xl` | 1280px | 12 |
| `2xl` | 1440px | 12 |

### Item spans

| Span rule | Description |
| --- | --- |
| `span` | Item width in columns |
| `start` / `end` | Explicit placement when needed |
| `auto` | Browser places item in next available track |
| `full` | Item spans all columns |

---

## 4. Sizes

Grid size describes column system, gap, and density. It does not describe viewport size alone.

| Size / density | Gap guidance | Use |
| --- | --- | --- |
| `compact` | Small internal gap | Dense panels, narrow forms |
| `medium` | Default internal gap | Default product layouts |
| `spacious` | Larger internal gap | Marketing-like content sections, overview dashboards |

### Column presets

| Preset | Columns | Use |
| --- | ---: | --- |
| `single` | 1 | Mobile, linear content |
| `four` | 4 | Small viewport layout |
| `eight` | 8 | Tablet or medium content |
| `twelve` | 12 | Desktop application layout |
| `auto` | dynamic | Repeating cards with min item width |

### Правила размеров

- Use `medium` density by default.
- Use `compact` only when scan efficiency matters and content remains readable.
- Use `spacious` when items need visual separation and the section is not dense.
- Do not create arbitrary gap values; use foundation spacing roles.

---

## 5. States

Grid is a layout primitive and has no interactive component states.

| State-like condition | Meaning | Rule |
| --- | --- | --- |
| `responsive` | Columns/gaps change by breakpoint | Layout behavior, not state |
| `guide` | Alignment guides visible | Design/debug variant |
| `placeholder` | Empty slot shown | Visual placeholder, not data state |
| `rowHover` / `rowSelected` | Data-grid-like row behavior | Use only in patterns that document row interaction |

### State ownership

- Nested cards, rows, forms, controls, and table items own their interactive states.
- If row selection, keyboard navigation, or cell focus is required, use Table/Data Grid pattern instead.

---

## 6. Behavior

### Layout behavior

- Grid places child items into columns and rows using documented tracks.
- Use `gap` for spacing between items.
- Container usually owns page gutters; Grid owns spacing between child items.
- Items should align to the same tracks within a section.

### Responsive behavior

- Column count changes by breakpoint.
- Items may span fewer columns on smaller viewports.
- Do not change DOM order to create visual order unless accessibility impact is reviewed.
- Auto-fit grids should define minimum item width.

### Guide and placeholder behavior

- Grid guides are for design review or layout debugging.
- Placeholders should not be exposed as real content.
- Focus ring token is used only when a grid item or placeholder is intentionally focusable in a specific pattern.

### Data behavior

- Grid does not provide sorting, filtering, row selection, cell navigation, or table semantics.
- If those are required, use Table or a dedicated data grid pattern.

---

## 7. Accessibility

Grid follows [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| ARIA roles | Не используйте `role="grid"` для визуального layout |
| DOM order | Preserve logical reading order |
| Focus order | Keyboard focus follows meaningful order |
| Placeholder | Hide visual placeholders from assistive technologies unless meaningful |
| Guide lines | Hide decorative guides |
| Responsive changes | Do not hide or reorder essential content unexpectedly |

### Accessibility checklist

- [ ] Visual layout does not break reading order.
- [ ] Keyboard focus order remains predictable.
- [ ] Decorative guides are not announced.
- [ ] Placeholder content is not mistaken for real content.
- [ ] ARIA grid roles are not used for layout-only grids.
- [ ] Wide layouts remain usable on narrow screens.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Role | Component token | Semantic |
| --- | --- | --- |
| Surface default | `grid/surface/default` | `color/transparent` |
| Row hover surface | `grid/surface/rowHover` | `container/neutral/hover` |
| Row selected surface | `grid/surface/rowSelected` | `container/neutral/selected` |
| Line default | `grid/line/default` | `border/subtle` |
| Line strong | `grid/line/strong` | `border/default` |
| Guide default | `grid/guide/default` | `border/subtle` |
| Guide active | `grid/guide/active` | `border/focus` |
| Placeholder surface | `grid/placeholder/surface` | `surface/subtle` |
| Placeholder border | `grid/placeholder/border` | `border/default` |
| Focus ring | `grid/focus/ring` | `focus/ring` |

### Token gaps

- Grid does not currently have component tokens for column count, max track width, min item width, row height, gap, gutter, breakpoint, or span.
- Use foundation spacing and layout rules until component-level layout tokens are introduced.
- Do not invent Grid token names in specs, code, Figma, or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Variant | `variant` | `columns`, `auto-fit`, `auto-fill`, `subgrid`, `guide` |
| Columns | `columns` | Number or responsive map |
| Gap | `gap` | Foundation spacing role |
| Row gap | `rowGap` | Optional |
| Column gap | `columnGap` | Optional |
| Min item width | `minItemWidth` | Required for auto-fit/auto-fill |
| Item span | `span` | Per item or responsive map |
| Item start/end | `start`, `end` | Explicit placement when needed |
| Guide visible | `showGuides` | Design/debug only |
| Placeholder | `placeholder` | Visual empty slot |

### Contract rules

- Grid props define layout only.
- `columns`, `gap`, and spans must follow documented system rules.
- Не используйте Grid API для поведения data table.
- Do not pass raw line, guide, or placeholder colors.
- Do not create new breakpoints in component usage.

---

## 10. Handoff notes

В handoff нужно передать:

- grid purpose: page layout, card grid, form alignment, dashboard, guide mode;
- column count per breakpoint;
- gap and density;
- item spans per breakpoint;
- auto-fit/auto-fill minimum item width;
- responsive order rules;
- relation to Container gutters;
- guide/placeholder behavior, if used;
- token mapping for surface, lines, guides, placeholder, and focus;
- token gaps for columns, gap, breakpoint, min item width, and spans.

### Acceptance criteria

- Grid is used for layout, not tabular data.
- Column count and gap are documented per breakpoint.
- DOM and focus order remain meaningful.
- Container owns external gutters unless handoff says otherwise.
- Grid items align to shared tracks.
- Visual guide/placeholder tokens use documented component tokens.
- No raw layout colors or arbitrary breakpoints are introduced.

---

## 11. AI usage rules

- AI may use Grid only for layout composition.
- AI must recommend Table when data needs rows, columns, sorting, filtering, or cell navigation.
- AI must recommend Container when the task is max-width and page gutters.
- AI must not invent breakpoints, gap values, spans, token paths, or data-grid behavior.
- AI must check `tokens.json` before changing Grid token mappings.
- AI must flag unclear column rules, DOM order risk, table misuse, raw layout values, or missing responsive behavior as `Needs system review`.
- AI may draft layout handoff notes and acceptance criteria, but human review is required.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| Dashboard cards | `variant=columns`, 12 columns on desktop, cards span 3 or 4 |
| Responsive card grid | `variant=auto-fit`, min item width documented |
| Form alignment | `subgrid` or local grid with documented label/input spans |
| Design review | `variant=guide`, guide lines hidden from assistive tech |

### Требует review

| Scenario | Reason |
| --- | --- |
| Sortable rows built with Grid | Table/Data Grid is required |
| Visual order differs from DOM order | Accessibility risk |
| Arbitrary 17px gap | Not mapped to spacing system |
| Page gutters implemented inside every child Grid | Container responsibility is unclear |

---

## 13. Anti-patterns

- Using Grid for tabular data behavior.
- Adding Grid around every small component.
- Using margins between grid items instead of gap.
- Inventing breakpoints per screen.
- Reordering content visually while DOM order stays different.
- Exposing decorative guide lines to assistive technologies.
- Creating custom guide or line colors outside component tokens.
