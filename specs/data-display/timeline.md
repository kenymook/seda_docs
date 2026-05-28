# Timeline

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Timeline — data display-компонент для последовательного отображения событий, изменений или этапов во времени. Он помогает прочитать историю объекта, ход процесса или цепочку действий в хронологическом порядке.

### Когда использовать

**Используйте** — когда порядок событий важен для понимания:

- история изменений объекта;
- audit log;
- lifecycle заявки, заказа, сделки или задачи;
- цепочка событий в инциденте;
- действия пользователя или системы;
- процесс с прошлыми, текущими и будущими этапами;
- комментарии или сообщения, если требуется явная временная ось.

**Не используйте:**

- Для активной пошаговой навигации — используйте **Stepper**.
- Для измеримого выполнения операции — используйте **Progress Bar**.
- Для неизвестной загрузки — используйте **Spinner** или **Skeleton** по контексту.
- Для сравнения нескольких временных рядов — используйте Chart.
- Для простой таблицы событий, где важнее сортировка, фильтры и плотность — используйте **Table**.

### Основные принципы

- **Chronology first** — порядок событий должен быть однозначным.
- **State needs text** — `current`, `completed`, `error` и `disabled` не передаются только цветом.
- **Connector is structural** — линия помогает читать последовательность, но не должна быть единственным носителем смысла.
- **Content stays scannable** — title, description и timestamp следуют [foundation/content.md](../foundation/content.md).
- **Accessibility preserves order** — чтение через assistive technologies должно соответствовать визуальному порядку по [foundation/accessibility.md](../foundation/accessibility.md).

---

## 2. Anatomy

```text
●  Title
│  Description · Timestamp
│
●  Title
│  Description · Timestamp
│
●  Title (current)
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Timeline container |
| `item` | yes | One event or step in the sequence |
| `point` | yes | Marker for the item state or type |
| `connector` | conditional | Line between items |
| `title` | yes | Event name or step name |
| `description` | optional | Supporting context |
| `timestamp` | optional | Date, time, relative time, or duration |
| `content` | optional | Extra content such as metadata, actions, or nested details |
| `statusText` | conditional | Text label for current, completed, error, or disabled state |

### Правила anatomy

- Each item needs a title.
- Timestamp is recommended for event history and audit logs.
- Connector is hidden for a single-item Timeline.
- Additional content should not make each item harder to scan than a table row.

---

## 3. Types / Variants

### Orientation

| Orientation | Description | Use |
| --- | --- | --- |
| `vertical` | Events read top-to-bottom | Default and most product contexts |
| `horizontal` | Events read left-to-right | Short sequences with few items and enough width |

### Marker variants

| Marker | Description | Use |
| --- | --- | --- |
| `dot` | Simple point marker | Default event marker |
| `icon` | Icon communicates event type | Status, system event, user action |
| `number` | Sequential number | Ordered process or checklist |
| `avatar` | Actor avatar | Activity feed with user authors |

### Item states

| State | Description | Required content |
| --- | --- | --- |
| `default` | Normal event or upcoming item | Title |
| `completed` | Finished event or step | Status text or clear copy |
| `current` | Active/current step | Text label such as `Текущий этап` |
| `error` | Failed or problematic event | Error explanation |
| `disabled` | Unavailable or inactive future item | Reason when not obvious |

---

## 4. Sizes

Timeline size describes density and marker scale. It does not change chronology or state semantics.

| Size | Marker | Connector | Content density | Use |
| --- | --- | --- | --- | --- |
| `compact` | Small dot/icon | Thin connector | Title and timestamp only or short description | Tables, side panels, dense logs |
| `medium` | Default dot/icon | Default connector | Title, description, timestamp | Default product UI |
| `large` | Larger marker/icon/avatar | Default or emphasized connector | Rich content, metadata, actions | Detail pages and incident timelines |

### Правила размеров

- Use `medium` by default.
- Use `compact` when the Timeline is embedded in a dense surface.
- Use `large` only when Timeline is the primary content of the page or section.
- Do not create custom marker sizes without a documented component token or foundation mapping.

---

## 5. States

| State | Meaning | Visual and content rule |
| --- | --- | --- |
| `default` | Event is neutral or upcoming | Default point and connector |
| `completed` | Event or step is done | Completed point and connector; label if state matters |
| `current` | Active event or current step | Current point; visible current text |
| `error` | Event failed or needs attention | Error point plus error text |
| `disabled` | Item is unavailable or inactive | Disabled point/text; explain if needed |

### State rules

- `error` requires text, not only danger color.
- `current` must be identifiable without relying only on color.
- `completed` should not be used for events that simply occurred if completion state is irrelevant.
- If users can move between steps, use Stepper or a workflow component instead.

---

## 6. Behavior

### Ordering

- Timeline must preserve chronological or process order.
- Default order should be newest-first or oldest-first based on product context, and handoff must state which order is used.
- Do not mix chronological directions in one Timeline.

### Layout behavior

- Vertical Timeline places connector along the item sequence.
- Horizontal Timeline is limited to short sequences; long horizontal timelines should scroll only if the product context requires it.
- Long timelines should support pagination, lazy loading, grouping by date, or virtualization outside the component.
- Timestamp alignment should stay consistent within one Timeline.

### Interaction behavior

- Timeline itself is non-interactive by default.
- Item content may contain Links or Buttons, but their behavior belongs to those nested components.
- Expand/collapse, filtering, and sorting are pattern-level behaviors and must be documented in handoff when used.

### Responsive behavior

- Horizontal Timeline may switch to vertical on narrow viewports.
- Rich item content should stack below title and timestamp on small screens.
- Connector and point must remain aligned after wrapping.

---

## 7. Accessibility

Timeline follows [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Reading order | DOM order matches visual order |
| Structure | Use list semantics when Timeline is a list of events |
| Decorative connector | Hide connector lines from assistive technologies |
| Marker | Hide decorative markers or provide status text when marker has meaning |
| Current item | Expose current state through text or `aria-current` when appropriate |
| Error item | Provide error text, not only color or icon |
| Timestamp | Use machine-readable date/time where practical |

### Accessibility checklist

- [ ] Timeline items are readable in correct order.
- [ ] Connector lines are not announced as content.
- [ ] Current/completed/error states have text equivalents.
- [ ] Nested interactive elements follow their own specs.
- [ ] Timestamps are understandable and consistently formatted.
- [ ] Horizontal layout does not create inaccessible reading order.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Role | Component token | Semantic |
| --- | --- | --- |
| Connector default | `timeline/connector/default` | `border/default` |
| Connector completed | `timeline/connector/completed` | `border/brand/default` |
| Connector disabled | `timeline/connector/disabled` | `status/disabled/border` |
| Point default | `timeline/point/default` | `container/neutral/default` |
| Point current | `timeline/point/current` | `container/brand/default` |
| Point completed | `timeline/point/completed` | `container/brand/default` |
| Point error | `timeline/point/error` | `container/danger/default` |
| Point disabled | `timeline/point/disabled` | `status/disabled/container` |
| Title foreground | `timeline/title/foreground` | `text/primary` |
| Title disabled | `timeline/title/disabled` | `status/disabled/text` |
| Description foreground | `timeline/description/foreground` | `text/secondary` |
| Description disabled | `timeline/description/disabled` | `status/disabled/text` |
| Timestamp foreground | `timeline/timestamp/foreground` | `text/tertiary` |

### Token gaps

- Timeline does not currently have component tokens for marker size, connector width, item gap, content gap, radius, or typography.
- Use foundation spacing, radius, typography, and iconography roles until component-level Timeline tokens are introduced.
- Do not invent Timeline token names in specs, code, Figma, or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Items | `items` | Array of timeline events |
| Orientation | `orientation` | `vertical`, `horizontal` |
| Size | `size` | `compact`, `medium`, `large` |
| Marker | `marker` | `dot`, `icon`, `number`, `avatar` |
| Item state | `state` | `default`, `completed`, `current`, `error`, `disabled` |
| Title | `title` | Required per item |
| Description | `description` | Optional |
| Timestamp | `timestamp` | Optional visible value |
| Datetime | `dateTime` | Machine-readable value when available |
| Content | `content` | Optional slot |

### Contract rules

- Each item must have a title.
- Item state must use documented values only.
- Timeline orientation must be documented for responsive behavior.
- Do not pass raw marker colors or connector colors through props.
- Не используйте Timeline как Stepper, если navigation behavior не описан явно в другом месте.

---

## 10. Handoff notes

В handoff нужно передать:

- chronological direction: newest-first or oldest-first;
- orientation and responsive switch rules;
- item structure and required fields;
- marker type and state per item;
- timestamp format and timezone rules;
- grouping, pagination, lazy loading, or virtualization rules for long timelines;
- nested interactions inside item content;
- token mapping for connector, point, title, description, and timestamp;
- token gaps for marker size, connector width, and spacing.

### Acceptance criteria

- Timeline displays events in a clear chronological or process order.
- Each item has a title.
- Current, completed, error, and disabled states are not communicated by color alone.
- DOM order matches visual reading order.
- Connector and point colors use documented component tokens.
- Long timelines have a documented loading or pagination strategy.
- Timeline is not used for active step navigation without a Stepper pattern.

---

## 11. AI usage rules

- AI may use Timeline only for chronological events, audit history, activity feeds, or process history.
- AI must recommend Stepper for active step navigation.
- AI must recommend Progress Bar for measurable operation progress.
- AI must not invent Timeline states, marker variants, token paths, or raw colors.
- AI must check `tokens.json` before changing Timeline token mappings.
- AI must flag missing item title, unclear chronological order, status-by-color-only, inaccessible horizontal order, or unsupported interaction as `Needs system review`.
- AI may draft item structure, handoff notes, and acceptance criteria, but human review is required.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| Audit log | Vertical Timeline, timestamp on each item, newest-first |
| Order lifecycle | `completed`, `current`, and `default` states with text labels |
| Incident history | Error event includes explanation and timestamp |
| Activity feed | Avatar marker with actor, action title, and time |

### Требует review

| Scenario | Reason |
| --- | --- |
| Timeline used as clickable wizard navigation | Stepper is likely required |
| Error item shown only as red point | Status is color-only |
| Horizontal Timeline with 20 items on mobile | Reading and interaction risk |
| Events sorted inconsistently | Chronology becomes unclear |

---

## 13. Anti-patterns

- Using Timeline for simple unordered lists.
- Using Timeline instead of Table when sorting/filtering is primary.
- Showing current/error/completed states only through color.
- Mixing newest-first and oldest-first in one view.
- Adding interactive step navigation without Stepper behavior.
- Creating custom marker colors outside component tokens.
- Rendering decorative connector lines as screen reader content.
