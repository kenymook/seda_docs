# Property List

> **Category** · Data Display
> **Version** · 0.1
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [PropertyList](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=7148-18099)
> **Foundation** · `accessibility.md`, `content.md`, `layout.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Property List — прикладной pattern для компактного отображения свойств одной сущности: профиля, аккаунта, объекта, заказа, настройки или технического идентификатора. Он строится на парах `label` + `value` и может включать section title, helper text, Tag, Link, copy action, reveal action или section-level edit action.

В SEDA AI Property List не является заменой Description List. Базовая семантика остается term-value, но Property List описывает более продуктовый сценарий: строки со status values, local actions, masked values, copy/reveal behavior и плотный layout для detail panels. Пока отдельного namespace `property-list` в `tokens.json` нет, поэтому визуальные правила должны опираться на semantic tokens и явно отмеченный token gap.

### Когда использовать

Используйте Property List, когда:

- нужно показать свойства одной сущности;
- данные читаются как label + value;
- список находится в detail panel, profile view, admin sidebar или settings summary;
- у отдельных строк есть локальные действия: copy, reveal, edit, open;
- значения могут быть links, Tags, IDs, masked values или short metadata;
- нужна прикладная альтернатива Table для одной записи.

### Не используйте

Не используйте Property List, когда:

- нужно сравнить несколько записей — используйте Table;
- нужен простой семантический term-value список без действий — используйте Description List;
- строки стали редактируемыми полями — используйте Form;
- статус нужно показать отдельно от свойства — используйте Tag или Badge;
- значения требуют сложной визуализации;
- список содержит персональные, платежные или permission data без privacy rule.

### Основные принципы

- **One entity per list** — один Property List описывает одну сущность или одну логическую группу свойств.
- **Description List is the base** — если actions и product behavior не нужны, используйте Description List.
- **Labels stay quiet** — label помогает сканировать, value несет основной смысл.
- **Actions are local** — copy, reveal, edit и open относятся к строке или секции.
- **Sensitive values need rules** — masked values нельзя раскрывать без явного действия пользователя.
- **No invented tokens** — пока нет `property-list` tokens, это token gap.
- **AI assists, system governs** — AI может предложить rows, но человек проверяет privacy, semantics и actions.

### Связанные спецификации

- [Description List](../specs/data-display/description-list.md) — базовая term-value семантика.
- [Table](../specs/data-display/table.md) — несколько записей, сравнение, сортировка.
- [Tag](../specs/data-display/tag.md) — status value внутри строки.
- [Badge](../specs/data-display/badge.md) — count/dot signal.
- [Button](../specs/actions/button.md) — section action.
- [Icon Button](../specs/actions/icon-button.md) — copy/reveal/open row actions.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `sectionTitle` | Условно | Название группы свойств. |
| `sectionAction` | Нет | Действие над секцией: edit, manage, copy all. |
| `row` | Да | Одна пара label + value. |
| `icon` | Нет | Leading icon для повторяющихся типов строк. |
| `label` | Да | Название свойства. |
| `value` | Да | Текст, число, дата, Link, Tag или inline component. |
| `supportingText` | Нет | Дополнительная строка к value. |
| `rowAction` | Нет | Copy, reveal, open, edit для конкретной строки. |
| `divider` | Нет | Разделение секций, если нужно. |

### Правила анатомии

- `label` должен быть коротким и стабильным.
- `value` может быть визуально сильнее label.
- `rowAction` не должен скрывать само значение.
- `supportingText` уточняет value, но не заменяет label.
- Icon не заменяет label.
- Если строка содержит редактируемый input, это уже Form или edit mode, а не read-only Property List.

---

## 3. Types / Variants / Варианты

| Variant | Когда использовать | Правило |
|---|---|---|
| `plain` | Строки без отдельной рамки. | Default для panels и pages. |
| `divided` | Нужно разделить группы или плотные строки. | Использовать Divider осознанно. |
| `cardRow` | Строка выглядит как компактный объект. | Не превращать каждую строку в Card. |
| `editableSection` | Секция редактируется целиком. | Section action открывает edit flow. |
| `actionableRow` | У строки есть copy/reveal/open/edit. | Нужен keyboard и focus behavior. |

---

## 4. Sizes / Размеры

| Density | Row height | Контекст |
|---|---:|---|
| `compact` | 26px | Dense admin panels и sidebars. |
| `regular` | 32px | Default detail pages. |
| `comfortable` | 40px | Touch-heavy layouts или multiline values. |

### Layout rules

| Property | Рекомендация |
|---|---|
| Section width | Заполняет parent container. |
| Label column | 112-144px внутри одной секции. |
| Icon size | 16px. |
| Row gap | 6-8px. |
| Section gap | 12-16px. |
| Card row height | 40-48px. |

Длинные значения обрезаются только в value area. Для ID используйте middle truncation, для email/address/prose — end truncation или перенос в `comfortable` density.

---

## 5. States / Состояния

| State | Где применяется | Правило |
|---|---|---|
| `default` | Section и row. | Статичное отображение. |
| `hover` | Actionable row или action. | Показывает локальное действие. |
| `focus` | Actionable row или action. | Используется focus ring. |
| `disabled` | Row или action. | Value остается читаемым, action недоступен. |
| `loading` | Section или row. | Skeleton сохраняет геометрию строк. |
| `empty` | Section. | Показывает, что свойства отсутствуют или скрыты. |
| `masked` | Sensitive value. | Значение скрыто до reveal action. |

---

## 6. Behavior / Поведение

### Actions

- `copy` копирует value и показывает feedback через Toast или inline confirmation.
- `reveal` временно показывает sensitive value и требует privacy rule.
- `edit` открывает section-level или row-level edit flow.
- `open` ведет к detail page или external resource.
- Action label должен включать действие и название свойства: `Скопировать ID`, `Показать ключ`.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Переход между section actions, row actions и links. |
| `Enter` / `Space` | Активирует focused action. |
| `Escape` | Закрывает Tooltip, Popover или reveal state, если применимо. |

### Composition

- Используйте Tag для status values: Active, Pending, Disabled, Primary.
- Используйте Badge только для count/dot signal на вложенном control.
- Не смешивайте read-only rows и editable fields без явного mode switch.
- Если actions есть почти в каждой строке, проверьте, не нужен ли dedicated detail/edit screen.

---

## 7. Accessibility

| Сценарий | Рекомендация | Правило |
|---|---|---|
| Static Property List | `<dl>`, `<dt>`, `<dd>`. | Предпочтительно для web. |
| Section title | Heading или grouped label. | Помогает навигации screen reader. |
| Row action | Нативный button/link. | Accessible name включает действие и label. |
| Sensitive value | Masked text + reveal button. | Не раскрывать без действия пользователя. |
| Icon | `aria-hidden="true"`, если декоративная. | Если несет смысл, нужен text alternative. |

### Accessibility checklist

- [ ] Labels и values имеют корректную семантическую связь.
- [ ] Row actions доступны с клавиатуры.
- [ ] Copy/reveal/open actions имеют понятные accessible names.
- [ ] Status values содержат текст, а не только цвет.
- [ ] Truncated value можно раскрыть, скопировать или открыть.
- [ ] Sensitive values имеют privacy behavior.
- [ ] Empty state объясняет, почему свойств нет.

---

## 8. Design Tokens

В `tokens.json` пока нет отдельного namespace `property-list`. Используйте semantic tokens и отмечайте это как token gap, пока component tokens не появятся. Не придумывайте token paths для Property List в specs, code, Figma или AI-generated handoff.

| Роль | Semantic token |
|---|---|
| Section title text | `text/primary` |
| Label text | `text/secondary` |
| Value text | `text/primary` |
| Supporting text | `text/tertiary` |
| Leading icon | `icon/secondary` |
| Divider | `border/default` |
| Card row surface | `surface/base` |
| Card row border | `border/default` |
| Actionable row hover | `surface/subtle` |
| Focus ring | `focus/ring` |

### Token gaps

- Нужны component tokens для section title, row label, row value, row action, divider, density spacing и card-row styling.
- До появления tokens используйте foundation spacing/layout rules.
- Если Figma использует Description List bindings, это допустимо только как alias до появления отдельного token namespace.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Sections | `sections` | Массив групп свойств. |
| Rows | `sections[].items` | Label, value, optional icon/action. |
| Label | `item.label` | Обязателен. |
| Value | `item.value` | Обязателен, если нет `emptyText`. |
| Density | `density` | `compact`, `regular`, `comfortable`. |
| Variant | `variant` | `plain`, `divided`, `cardRow`, `editableSection`, `actionableRow`. |
| Action | `item.action` | `copy`, `reveal`, `edit`, `open` или documented custom handler. |
| Sensitive | `item.masked` | Управляет reveal behavior. |
| Truncation | `item.truncate` | `start`, `middle`, `end`, `none`. |
| Empty text | `emptyText` | Текст для отсутствующего value. |

### Contract rules

- `item.label` обязателен.
- Missing value должен рендерить explicit empty text.
- `item.masked` требует reveal action или объяснение, почему reveal недоступен.
- `variant="actionableRow"` требует keyboard path.
- Raw colors и invented component tokens запрещены.
- Property List не используется для нескольких записей.

---

## 10. Handoff notes

Handoff для Property List должен фиксировать:

- entity, которую описывает список;
- sections и rows;
- density и label column width;
- какие values являются links, Tags, IDs или sensitive values;
- truncation и full-value access;
- row actions и feedback после действия;
- empty/loading behavior;
- privacy rules для masked values;
- token gap до появления component tokens.

---

## 11. Acceptance criteria

- [ ] Property List описывает одну сущность или одну логическую группу.
- [ ] Labels короткие и стабильные.
- [ ] Values имеют корректный формат, truncation и full-value access.
- [ ] Missing values отображаются явно.
- [ ] Row actions локальны и доступны с клавиатуры.
- [ ] Sensitive values не раскрываются без действия пользователя.
- [ ] Loading state сохраняет row geometry.
- [ ] Token gap явно отмечен, component token names не выдуманы.
- [ ] Если действий нет, проверено, не достаточно ли Description List.

---

## 12. AI usage rules

AI может:

- предложить sections и rows по данным сущности;
- определить, где нужны copy/reveal/open actions;
- подготовить empty text, truncation и privacy notes;
- подготовить handoff notes и acceptance criteria;
- отметить token gaps для будущей token architecture;
- предложить Description List, Table или Form вместо Property List, если сценарий ближе к ним.

AI не должен:

- использовать Property List для сравнения нескольких записей;
- выдумывать component tokens, которых нет в `tokens.json`;
- раскрывать sensitive values без privacy rule;
- использовать цвет как единственный status signal;
- смешивать read-only и edit mode без явного сценария;
- делать всю строку кликабельной при наличии отдельных row actions.

Если список содержит персональные данные, секреты, payment data или permissions, AI должен пометить сценарий как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Профиль аккаунта: ID, email, роль, статус. | Одна сущность и набор key-value свойств. |
| Admin side panel с copy action для UID. | Локальное действие относится к строке. |
| Payment method row с masked value и reveal. | Sensitive behavior описан явно. |

### Требует review

| Сценарий | Что проверить |
|---|---|
| Список содержит несколько пользователей. | Возможно, нужна Table. |
| Все строки стали editable fields. | Возможно, нужна Form. |
| Длинные values скрыты без доступа к полному тексту. | Нужен Tooltip, copy или detail view. |
| Почти каждая строка имеет сложное действие. | Возможно, нужен отдельный detail/edit screen. |

---

## 14. Anti-patterns

- Использовать Property List для сравнения нескольких записей.
- Выдумывать component tokens до token architecture review.
- Прятать sensitive value без понятного reveal/copy behavior.
- Делать всю строку кликабельной, если есть отдельные row actions.
- Передавать status только цветом или иконкой.
- Использовать Property List как layout grid.
