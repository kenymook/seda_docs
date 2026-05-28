# Container

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Container — layout-компонент, который задаёт читаемую ширину контента, горизонтальные отступы и базовую surface/border модель для секций, страниц и layout regions. Он помогает удерживать интерфейс в согласованной сетке без ручных ширин и padding.

### Когда использовать

**Используйте** — когда нужно управлять шириной и горизонтальными отступами layout region:

- страницы документации или продукта;
- секции внутри экрана;
- формы и detail pages;
- дашборды с ограничением ширины;
- content areas рядом с navigation/sidebar;
- overlay content, если нужен consistent surface/border wrapper;
- responsive layout, где ширина должна меняться по правилам системы.

**Не используйте:**

- Для вложенных контейнеров одного размера.
- Для полной ширины карты, canvas, media или data grid, если контент должен занять весь viewport.
- Для декоративной карточки — используйте **Card** или surface pattern.
- Для структуры колонок — используйте **Grid**.
- Для scrollable body без явных границ и overflow rules.

### Основные принципы

- **One container per section** — не вкладывайте Container в Container одного назначения.
- **Width follows content** — текст, формы, таблицы и дашборды требуют разных max-width.
- **Gutters are systematic** — горизонтальные отступы следуют [foundation/spacing-sizing.md](../foundation/spacing-sizing.md).
- **Surface is optional** — Container может быть layout-only или иметь surface/border, но это должно быть явно задано.
- **DOM order is stable** — Container не меняет порядок контента ради визуального layout.
- **AI must not invent breakpoints** — responsive rules должны быть задокументированы в handoff.

---

## 2. Anatomy

```text
|← viewport ───────────────────────────────→|
   |← gutter →| container content |← gutter →|
              max-width
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Layout wrapper |
| `content` | yes | Arbitrary child content |
| `surface` | optional | Background surface when container is visually framed |
| `border` | optional | Boundary when container is visually framed |
| `divider` | optional | Internal section separation |

### Правила anatomy

- `content` is required.
- Surface and border are optional; use them only when the container needs visual framing.
- Не используйте Container как замену Card, Modal, Drawer или Grid.

---

## 3. Types / Variants

### Width variants

| Size | Max-width | Use |
| --- | --- | --- |
| `sm` | 640px | Narrow forms, auth, focused text |
| `md` | 768px | Articles, docs, readable long-form content |
| `lg` | 1024px | Standard content with side detail |
| `xl` | 1280px | Product pages and dashboards |
| `2xl` | 1440px | Wide dashboards and data-heavy screens |
| `full` | 100% | Full-width canvas, table, map, media, or app shell |

### Surface variants

| Surface | Use |
| --- | --- |
| `none` | Layout-only container |
| `page` | Page background region |
| `base` | Standard framed region |
| `subtle` | Low-emphasis region |
| `raised` | Elevated or separated region |
| `overlay` | Floating or overlay content region |
| `inverse` | Inverse surface use cases |

### Border variants

| Border | Use |
| --- | --- |
| `none` | No visual boundary |
| `subtle` | Low-emphasis separation |
| `default` | Standard boundary |
| `strong` | Higher-emphasis boundary |

---

## 4. Sizes

Container size describes maximum width and responsive gutter behavior.

| Size | Content type | Max-width | Notes |
| --- | --- | --- | --- |
| `sm` | Short forms and focused content | 640px | Avoid for tables or dashboards |
| `md` | Reading content | 768px | Good for docs and articles |
| `lg` | Mixed content | 1024px | Useful for detail pages |
| `xl` | Product layout | 1280px | Default app content width |
| `2xl` | Wide layout | 1440px | Use for complex dashboards |
| `full` | Full viewport content | 100% | Requires explicit child layout rules |

### Responsive gutters

| Viewport | Padding inline |
| --- | --- |
| `xs` | 16px |
| `sm` | 24px |
| `md` | 32px |
| `lg+` | 40px |

### Правила размеров

- Choose max-width by content type, not by screen size alone.
- Do not place wide tables inside narrow article containers.
- `full` must still define internal content spacing or child layout rules.
- Nested containers should use a different purpose or be removed.

---

## 5. States

Container is a layout primitive and has no interactive component states.

| State-like condition | Meaning | Rule |
| --- | --- | --- |
| `responsive` | Width/gutter changes by viewport | Treat as layout behavior, not state |
| `overflow` | Content exceeds available space | Define scroll/overflow behavior outside visual state |
| `surface` | Container has background/border | Treat as variant, not state |
| `disabled/loading/error` | Nested content state | Owned by child components or page pattern |

### State ownership

- Nested components own hover, focus, loading, disabled, selected, and validation states.
- Container must not style child states directly.

---

## 6. Behavior

### Layout behavior

- Container centers content using horizontal auto margins when width is constrained.
- Container applies responsive gutters at the outer edge of the content area.
- Container should align with the page grid and sibling sections.
- Container should not create extra scroll containers unless overflow is explicitly required.

### Surface behavior

- Layout-only containers do not add background, border, elevation, or landmarks.
- Surface containers use documented surface and border tokens.
- Scrim is reserved for overlay contexts and should not be used as a regular page background.

### Nesting behavior

- Avoid Container inside Container with the same width and gutter rules.
- Allow nested Container only when it changes purpose: for example, full-width shell containing a narrower readable text section.
- Handoff must document why nested containers exist.

### Responsive behavior

- Container gutters adjust by viewport.
- Full-width containers keep content readable through child grid or section rules.
- Wide content may switch to horizontal scroll only when the component pattern supports it.

---

## 7. Accessibility

Container follows [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Landmarks | Do not add landmarks by default |
| Semantics | Use semantic region only when content needs navigation structure |
| DOM order | Do not reorder content visually in a way that changes reading order |
| Focus | Do not trap focus; overlays own focus behavior |
| Scroll | Scrollable containers need visible boundaries and keyboard access |
| Hidden overflow | Do not clip focus rings or important content |

### Accessibility checklist

- [ ] Container does not add unnecessary landmarks.
- [ ] DOM order matches reading order.
- [ ] Focus rings are not clipped.
- [ ] Scrollable content is reachable by keyboard.
- [ ] Surface/border does not replace semantic grouping when grouping is needed.
- [ ] Responsive changes do not hide content.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Role | Component token | Semantic |
| --- | --- | --- |
| Surface page | component path: container surface page | `surface/page` |
| Surface base | component path: container surface base | `surface/base` |
| Surface subtle | component path: container surface subtle | `surface/subtle` |
| Surface raised | component path: container surface raised | `surface/raised` |
| Surface overlay | component path: container surface overlay | `surface/overlay` |
| Surface inverse | component path: container surface inverse | `surface/inverse` |
| Border default | component path: container border default | `border/default` |
| Border subtle | component path: container border subtle | `border/subtle` |
| Border strong | component path: container border strong | `border/strong` |
| Divider default | component path: container divider default | `border/subtle` |
| Scrim default | component path: container scrim default | `surface/scrim` |

### Token gaps

- Container does not currently have component tokens for max-width, gutter, padding, breakpoint, radius, or layout gap.
- Use foundation spacing and layout rules until component-level layout tokens are introduced.
- Do not invent Container token names in specs, code, Figma, or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Width | `size` or `maxWidth` | `sm`, `md`, `lg`, `xl`, `2xl`, `full` |
| Gutters | `gutter` | Default responsive gutter unless overridden by system rule |
| Centering | `centered` | Usually true for constrained containers |
| Surface | `surface` | `none`, `page`, `base`, `subtle`, `raised`, `overlay`, `inverse` |
| Border | `border` | `none`, `subtle`, `default`, `strong` |
| Divider | `divider` | Optional internal divider |
| Scrim | `scrim` | Overlay contexts only |
| As element | `as` | `div`, `section`, `main`, `aside` when semantic structure is needed |

### Contract rules

- `size` must use documented width values.
- `surface` and `border` must map to documented token paths.
- Do not pass raw max-width values unless the system defines an exception.
- Do not create new breakpoints in component usage.
- Use semantic `as` only when the content requires it.

---

## 10. Handoff notes

В handoff нужно передать:

- container purpose: page, section, overlay, dashboard, or readable content;
- width size and responsive gutter rules;
- surface and border variant, if any;
- whether the container is centered or full-width;
- nested container rationale, if present;
- overflow and scroll behavior;
- semantic element choice, if not `div`;
- token mapping for surface, border, divider, and scrim;
- token gaps for max-width, gutter, breakpoint, radius, and spacing.

### Acceptance criteria

- Container width matches the content type.
- Gutter behavior is responsive and documented.
- Container is not nested inside an equivalent Container.
- Wide content is not forced into narrow readable width.
- Surface and border use documented component tokens.
- Container does not add unnecessary landmarks or change DOM order.
- Focus rings and child content are not clipped.

---

## 11. AI usage rules

- AI may use Container only for layout width, gutters, and optional surface framing.
- AI must recommend Grid when the task is column structure.
- AI must recommend Card when the task is a repeated framed content item.
- AI must not invent max-widths, breakpoints, component tokens, or raw surface colors.
- AI must check `tokens.json` before changing Container token mappings.
- AI must flag nested containers, missing responsive gutter rules, clipped focus, unsupported full-width content, or raw layout values as `Needs system review`.
- AI may draft layout handoff notes and acceptance criteria, but human review is required.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| Documentation article | `size=md`, layout-only |
| Product dashboard | `size=xl` or `2xl`, child Grid controls columns |
| Auth form | `size=sm`, centered |
| Overlay body | `surface=overlay`, border by overlay pattern |
| Full-width table | `size=full`, child Table owns horizontal behavior |

### Требует review

| Scenario | Reason |
| --- | --- |
| Container inside same-size Container | Redundant layout wrapper |
| Wide data grid inside `md` container | Content type mismatch |
| Raw `max-width: 1180px` | System width token/rule missing |
| Container used as Card | Wrong component boundary |

---

## 13. Anti-patterns

- Nesting equivalent containers.
- Using Container to create card-like decoration.
- Adding arbitrary max-width values per page.
- Using `full` without defining child content spacing.
- Clipping focus rings with hidden overflow.
- Creating scroll containers without keyboard-accessible boundaries.
- Adding semantic landmarks only for styling.
