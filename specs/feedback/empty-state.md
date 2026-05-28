# Empty State

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Empty State — системный feedback-компонент для ситуации, когда в контейнере, разделе или экране нет данных, результатов, доступа или доступного действия. Он объясняет причину состояния и, если возможно, предлагает следующий шаг.

### Когда использовать

**Используйте** — когда пользователь ожидает увидеть данные или содержимое, но система не может их показать:

- раздел без созданных объектов;
- таблица или список без данных;
- поиск или фильтр без результатов;
- недоступный раздел из-за прав;
- ошибка загрузки данных, если вместо отдельного Alert нужен контекстный recovery state;
- первый запуск сценария, где пользователю нужно начать настройку.

**Не используйте:**

- Для временной загрузки — используйте **Skeleton** или **Spinner**.
- Для общей ошибки поверх уже заполненного интерфейса — используйте **Alert** или **Toast**.
- Для декоративного блока без причины и действия.
- Для сообщения `Нет данных` без объяснения, если пользователь может что-то сделать.
- Для пустого места внутри формы, если достаточно helper text или validation message.

### Основные принципы

- **Explain the reason** — title должен назвать состояние: `Проектов пока нет`, `Ничего не найдено`, `Нет доступа`.
- **Offer recovery** — action нужен, если пользователь может исправить ситуацию или продолжить работу.
- **Do not fake data** — не заполняйте пустой экран декоративными карточками, если данных нет.
- **Content is part of UX** — тексты следуют [foundation/content.md](../foundation/content.md), а состояния — [foundation/state-vocabulary.md](../foundation/state-vocabulary.md).
- **Nested actions own interaction states** — hover, focus, loading и disabled принадлежат вложенным Button или Link, а не Empty State целиком.

---

## 2. Anatomy

```text
     [illustration/icon]

     Title
     Description text

     [Primary action]  [Secondary action/link]
```

| Слот | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Layout container for the empty state |
| `media` | optional | Decorative illustration or meaningful icon |
| `title` | yes | Short reason for the empty state |
| `description` | recommended | Context, consequence, or next step |
| `primaryAction` | conditional | Main recovery or first-use action |
| `secondaryAction` | optional | Secondary recovery, learn-more, or reset action |

### Slot rules

- `title` is always required.
- `description` may be omitted only when the title and action fully explain the state.
- Use one primary action unless the state is read-only or the user has no available next step.
- Use secondary action for `Сбросить фильтры`, `Подробнее`, `Связаться с владельцем`, or similar support actions.

---

## 3. Types / Variants

| Variant | Purpose | Primary action |
| --- | --- | --- |
| `no-data` | No objects exist yet | Create first object |
| `no-results` | Search or filters returned no results | Reset filters or edit query |
| `no-access` | User cannot see the content | Request access or contact owner |
| `error` | Data could not be loaded | Retry |
| `first-time` | User has not started the workflow | Start setup |

### Content examples

Follow [foundation/content.md](../foundation/content.md).

| Variant | Title | Description | Action |
| --- | --- | --- | --- |
| `no-data` | `Проектов пока нет` | `Создайте первый проект, чтобы начать работу` | `Создать проект` |
| `no-results` | `Ничего не найдено` | `Измените запрос или сбросьте фильтры` | `Сбросить фильтры` |
| `no-access` | `Нет доступа` | `Запросите доступ у владельца проекта` | `Запросить доступ` |
| `error` | `Не удалось загрузить данные` | `Проверьте соединение и попробуйте снова` | `Повторить` |
| `first-time` | `Настройте рабочее пространство` | `Добавьте команду и подключите первые источники данных` | `Начать настройку` |

---

## 4. Sizes

Empty State size describes layout density, not a new visual style.

| Size | Use for | Layout guidance |
| --- | --- | --- |
| `compact` | Table rows, side panels, small cards | No large illustration; title + short description/action |
| `section` | Empty content area inside a page | Optional icon or small illustration; centered or start-aligned by context |
| `page` | Full-page onboarding or blocking empty state | Larger spacing, clear title, description, and primary action |

### Правила размеров

- Use `compact` inside dense product surfaces.
- Use `section` as the default.
- Use `page` only when the empty state is the primary content of the screen.
- Do not increase typography scale to create emphasis; use layout, spacing, and action hierarchy.

---

## 5. States

Empty State variants represent data states. Interactive states belong to nested components.

| State / variant | Значение | Обязательное поведение |
| --- | --- | --- |
| `empty` / `no-data` | Dataset exists but has no objects | Explain first step and provide create action when allowed |
| `no-results` | Filters or search returned nothing | Preserve query/filter context and offer reset/edit action |
| `no-access` | User lacks permission | Explain access limitation and recovery path |
| `error` | Data request failed | Explain failure and provide retry if possible |
| `first-time` | Workflow has not started | Guide setup without pretending data exists |

### State ownership

- `loading` is not an Empty State. Use Skeleton or Spinner before deciding content is empty.
- `hover`, `focus`, `active`, `disabled`, and `loading` belong to nested Button, Link, or Icon Button.
- If the primary action is unavailable, keep the Empty State readable and explain why the action is not available.

---

## 6. Behavior

### Placement

- In a table/list, Empty State replaces rows, not the table header or filters.
- In a section, Empty State occupies the content area and respects the section's alignment.
- In a full page, Empty State becomes the main landmark content.

### Actions

- Primary action starts the most likely recovery path.
- Secondary action may reset filters, open documentation, contact owner, or show details.
- Do not show an action if the user cannot perform it; explain the limitation instead.

### Error recovery

- `error` variant should preserve user context and avoid clearing filters, query, or selected navigation.
- Retry action should trigger the same data request, not reload the full application unless required.

### Responsive behavior

- Text wraps before actions wrap.
- Actions stack vertically only in narrow containers.
- Illustration may be hidden in compact layouts.

---

## 7. Accessibility

Empty State follows [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Heading | Use a real heading when Empty State is the main content of a region |
| Region semantics | If replacing a content region, keep the region label meaningful |
| Illustration | Mark decorative media as `aria-hidden="true"` |
| Meaningful icon | Provide accessible text only if the icon adds meaning not present in text |
| Actions | Nested actions follow Button or Link accessibility rules |
| Error variant | If content changed after a failed request, announce the state in an appropriate live region |

### Accessibility checklist

- [ ] Title is visible and programmatically exposed.
- [ ] Action labels are specific: `Создать проект`, not `Создать`.
- [ ] Empty state is not communicated only through illustration or color.
- [ ] Keyboard users can reach all available actions.
- [ ] Error and no-access states provide enough context without relying on visuals.

---

## 8. Design Tokens

| Element | Component token | Role | Semantic |
| --- | --- | --- | --- |
| Root gap | Token gap | Vertical spacing between slots | `space/2xl` to `space/5xl` by size |
| Media color | `empty-state/illustration/foreground` | Illustration or icon color | `icon/muted` |
| Title | `empty-state/title/foreground` | Title color | `text/primary` |
| Description | `empty-state/description/foreground` | Supporting text color | `text/secondary` |
| Action foreground | `empty-state/action/foreground` | Link-like secondary action color | `text/brand` |
| Action gap | Token gap | Space between primary and secondary actions | `space/m` to `space/2xl` by size |

### Token gaps

- Component foreground tokens exist for illustration, title, description, and action text.
- Layout gap tokens are not defined yet; use the mapped spacing scale in implementation and mark the mapping as `Token gap` until component gap tokens are added.
- Do not hardcode illustration color, text color, spacing, or action gap.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Variant | `variant` | `no-data`, `no-results`, `no-access`, `error`, `first-time` |
| Size | `size` | `compact`, `section`, `page` |
| Title | `title` | Required string or heading slot |
| Description | `description` | Optional string or rich text slot |
| Media | `media` | Optional icon/illustration slot |
| Primary action | `primaryAction` | Button config or action slot |
| Secondary action | `secondaryAction` | Link or secondary Button config |

### Contract rules

- `title` is required.
- `variant` must be documented; unsupported variants require system review.
- `primaryAction` must use Button or Link contract rather than custom clickable text.
- `error` variant should expose retry behavior through action props or slot.

---

## 10. Handoff notes

В handoff нужно передать:

- variant and size;
- title, description, and action labels;
- whether media is decorative or meaningful;
- required action behavior;
- data condition that triggers the Empty State;
- whether filters/search state should be preserved;
- responsive layout rules;
- Token gaps, if component tokens are missing.

### Acceptance criteria

- Empty State explains why content is absent.
- Empty State provides a next step when recovery is possible.
- `no-results` preserves search/filter context.
- `error` provides retry behavior when data can be requested again.
- Nested actions follow Button or Link specs.
- No raw visual values are used for text, media, spacing, or actions.

---

## 11. AI usage rules

- AI may choose only documented variants: `no-data`, `no-results`, `no-access`, `error`, `first-time`.
- AI must not use Empty State for loading; it must recommend Skeleton or Spinner.
- AI must include title, reason, and next step for generated Empty State content.
- AI must flag missing trigger condition, missing action behavior, or missing token mapping as a risk.
- AI must not invent new props, variants, illustrations, or token names without `Needs system review`.
- AI may draft copy, Handoff notes, and acceptance criteria, but human review is required.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| New project list | `variant=no-data`, title `Проектов пока нет`, primary action `Создать проект` |
| Empty search result | `variant=no-results`, preserve query, secondary action `Сбросить фильтры` |
| Permission restriction | `variant=no-access`, explain owner or access request path |

### Требует review

| Scenario | Reason |
| --- | --- |
| Marketing-style illustration dominates a dense table | May reduce scan efficiency and does not help recovery |
| Empty State with two primary actions | Action hierarchy is unclear |
| Error state without retry or explanation | User cannot recover |

---

## 13. Anti-patterns

- Showing only `Нет данных`.
- Using Empty State while data is still loading.
- Hiding filters in `no-results`.
- Using a decorative illustration as the only explanation.
- Creating a custom clickable text instead of Button or Link.
- Adding a new variant such as `celebration` without system review.
