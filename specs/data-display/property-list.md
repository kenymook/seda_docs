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

Property List — компактный key-value pattern для отображения свойств одной сущности: профиля, аккаунта, объекта, настройки, заказа или технического идентификатора. Он группирует строки вида label + value и может включать section title, icon, helper text и локальные действия.

В SEDA AI Property List используется как практичный data display pattern для product interfaces. Он близок к Description List, но допускает более прикладные строки: copy action, reveal action, status Tag, inline link или editable section.

### Когда использовать

Используйте Property List, когда:

- нужно показать свойства одной сущности;
- данные читаются как label + value;
- значения нужно быстро сканировать в detail panel, profile view или admin sidebar;
- у отдельных строк есть локальные действия: copy, reveal, edit, open;
- требуется компактная альтернатива Table для одной записи.

### Не используйте

Не используйте Property List, когда:

- нужно сравнить несколько записей — используйте [Table](../specs/data-display/table.md);
- нужен простой семантический список терминов без действий — используйте [Description List](../specs/data-display/description-list.md);
- нужно показать статус отдельно от свойства — используйте [Tag](../specs/data-display/tag.md) или [Badge](../specs/data-display/badge.md);
- строки превращаются в форму редактирования;
- значения требуют сложной визуализации.

### Основные принципы

- **One entity per list** — один Property List описывает одну сущность или одну логическую группу свойств.
- **Labels stay quiet** — label помогает сканировать, value несет основной смысл.
- **Actions are local** — copy, reveal, edit и open относятся к строке или секции.
- **Rows keep rhythm** — высота, gap и label column стабильны внутри секции.
- **Tokens before decoration** — если нет component tokens, используйте documented semantic tokens и отметьте token gap.
- **AI drafts, human validates** — AI может предложить структуру строк, но человек проверяет смысл, privacy и действия.

### Связанные спецификации

- [Description List](../specs/data-display/description-list.md) — семантический key-value список.
- [Table](../specs/data-display/table.md) — сравнение нескольких записей.
- [Tag](../specs/data-display/tag.md) — status value внутри строки.
- [Button](../specs/actions/button.md) — действия секции и строки.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `section-title` | Да | Название группы свойств. |
| `section-action` | Нет | Действие над секцией: edit, copy, manage. |
| `row` | Да | Одна пара label + value. |
| `icon` | Нет | Leading icon для сканирования повторяющихся полей. |
| `label` | Да | Название свойства. |
| `value` | Да | Текст, ссылка, число, дата, Tag или inline component. |
| `supporting-text` | Нет | Вторичная строка для адресов, описаний, helper details. |
| `row-action` | Нет | Copy, reveal, open, edit для конкретной строки. |
| `divider` | Нет | Разделение секций. |

### Правила анатомии

- `label` должен быть коротким и стабильным.
- `value` может быть сильнее визуально, чем label.
- `row-action` не должен скрывать само значение.
- `supporting-text` используется только для уточнения value.
- Иконка не заменяет label.

---

## 3. Types / Variants / Варианты

| Variant | Когда использовать | Правило |
|---|---|---|
| `plain` | Строки на странице или в панели без отдельной рамки. | Default. |
| `divided` | Секции нужно явно разделить. | Использовать divider между группами. |
| `card-row` | Одна строка выглядит как компактный объект. | Не превращать каждую строку в Card. |
| `editable-section` | Секция редактируется целиком. | Section action управляет edit flow. |
| `actionable-row` | У строки есть copy/reveal/open/edit. | Нужен keyboard и focus behavior. |

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

| Состояние | Где применяется | Правило |
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
- `reveal` временно показывает sensitive value и должен иметь privacy rule.
- `edit` открывает section-level или row-level edit flow.
- `open` ведет к detail page или external resource.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Переход между section actions, row actions и links. |
| `Enter` / `Space` | Активирует focused action. |
| `Escape` | Закрывает Tooltip, Popover или reveal state, если применимо. |

### Composition

- Используйте `Tag` для status values: Active, Pending, Disabled, Primary.
- Используйте `Badge` только для count/dot на вложенном control.
- Не смешивайте editable fields и read-only rows в одной секции без явного mode switch.

---

## 7. Accessibility

| Сценарий | Рекомендация | Правило |
|---|---|---|
| Static Property List | `dl`, `dt`, `dd`. | Предпочтительно для web. |
| Section title | Heading или grouped label. | Помогает навигации screen reader. |
| Row action | Нативный button/link. | Accessible name включает действие и label. |
| Sensitive value | Masked text + reveal button. | Не раскрывать без действия пользователя. |
| Icon | `aria-hidden="true"` если декоративная. | Если несет смысл, нужен text alternative. |

### Accessibility checklist

- [ ] Labels и values имеют корректную семантическую связь.
- [ ] Row actions доступны с клавиатуры.
- [ ] Copy/reveal/open actions имеют понятные accessible names.
- [ ] Status values содержат текст, не только цвет.
- [ ] Truncated value можно раскрыть, скопировать или открыть.
- [ ] Sensitive values имеют privacy behavior.

---

## 8. Design Tokens

В `tokens.json` пока нет отдельного namespace `property-list`. Используйте semantic tokens и отмечайте это как token gap, пока component tokens не появятся.

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

Token gap: нужны component tokens для `property-list/section/title`, `property-list/row/label`, `property-list/row/value`, `property-list/row/action`, `property-list/divider`, density spacing и card-row styling.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Sections | `sections` | Массив групп свойств. |
| Rows | `sections[].items` | Label, value, optional icon/action. |
| Density | `density` | `compact`, `regular`, `comfortable`. |
| Variant | `variant` | `plain`, `divided`, `card-row`, `editable-section`, `actionable-row`. |
| Action | `action` | `copy`, `reveal`, `edit`, `open` или custom handler. |
| Sensitive | `masked` | Управляет reveal behavior. |
| Truncation | `truncate` | `start`, `middle`, `end`, `none`. |

---

## 10. Handoff notes

Handoff для Property List должен фиксировать:

- entity, которую описывает список;
- sections и rows;
- density и label column width;
- какие values являются links, tags, IDs или sensitive values;
- truncation и full-value access;
- row actions и feedback после действия;
- empty/loading behavior;
- token gap до появления component tokens.

---

## 11. Acceptance criteria

- [ ] Property List описывает одну сущность или одну логическую группу.
- [ ] Labels короткие и стабильные.
- [ ] Values имеют корректный формат, truncation и full-value access.
- [ ] Row actions локальны и доступны с клавиатуры.
- [ ] Sensitive values не раскрываются без действия пользователя.
- [ ] Loading state сохраняет row geometry.
- [ ] Token gap явно отмечен, component token names не выдуманы.

---

## 12. AI usage rules

AI может:

- предложить sections и rows по данным сущности;
- найти свойства, которым нужны copy/reveal/open actions;
- подготовить handoff notes и acceptance criteria;
- отметить token gaps для будущей token architecture.

AI не должен:

- превращать Property List в Table для нескольких записей;
- выдумывать component tokens, которых нет в `tokens.json`;
- раскрывать sensitive values без privacy rule;
- использовать цвет как единственный status signal;
- смешивать read-only и edit mode без явного сценария.

Если список содержит персональные данные, секреты, payment data или permissions, AI должен пометить сценарий как `Needs system review`.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Профиль аккаунта: ID, email, роль, статус. | Одна сущность и набор key-value свойств. |
| Admin side panel с copy action для UID. | Локальное действие относится к строке. |
| Payment method row с masked value и reveal. | Sensitive behavior описан явно. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Список содержит несколько пользователей. | Возможно, нужна Table. |
| Все строки стали editable fields. | Возможно, нужна Form. |
| Длинные значения скрыты без доступа к полному тексту. | Нужен Tooltip, copy или detail view. |

---

## 14. Anti-patterns

- Использовать Property List для сравнения нескольких записей.
- Выдумывать component tokens до token architecture review.
- Прятать sensitive value без понятного reveal/copy behavior.
- Делать всю строку кликабельной, если есть отдельные row actions.
- Передавать status только цветом или иконкой.
