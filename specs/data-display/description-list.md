# Description List

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `content.md`, `layout.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Description List — компонент для отображения пар `term` / `definition`: название свойства и его значение. Семантически это структура `<dl>`, `<dt>`, `<dd>`, а не таблица, форма или произвольная сетка.

В SEDA AI Description List является data contract для read-only свойств одного объекта или одной записи. Он должен явно описывать структуру данных, формат значений, empty values, вложенные actions, responsive behavior и token mapping. AI может помочь подготовить schema списка, но не должен использовать Description List вместо Table или Form.

### Когда использовать

Используйте Description List, когда нужно показать:

- детали профиля, заказа, задачи, сделки или заявки;
- свойства одного продукта или файла;
- read-only summary перед подтверждением;
- metadata объекта;
- технические атрибуты, если их немного и они читаются как пары ключ-значение;
- значения, которые иногда требуют copy action, Link или Tooltip.

### Не используйте

Не используйте Description List, когда:

- нужно показать несколько записей с одинаковыми колонками — используйте Table;
- нужна сортировка, фильтрация, сравнение или bulk actions — используйте Table;
- значения редактируются — используйте Form и input-компоненты;
- нужно выделить один KPI — используйте Stat / Metric;
- контент не является term-value данными;
- список становится длинным настолько, что теряет scanability.

### Основные принципы

- **Term defines value** — каждое значение имеет понятный term.
- **One object, many properties** — список описывает один объект или одну запись.
- **Semantic structure matters** — используйте `<dl>`, `<dt>`, `<dd>`, если это возможно.
- **Empty is explicit** — отсутствующее значение отображается текстом, а не пустым местом.
- **Density follows context** — компактность не должна ломать читаемость длинных значений.
- **Do not fake a table** — если нужны строки объектов, колонки и сортировка, это Table.
- **Formatting is part of contract** — даты, суммы, ID, email и ссылки форматируются по правилам продукта.
- **AI assists, system governs** — AI может предложить пары, но человек проверяет смысл, формат и доступность.

### Связанные спецификации

- [Table](../specs/data-display/table.md) — много записей и табличное сравнение.
- [Form](../specs/overlays-layout/form.md) — редактируемые значения.
- [Stat / Metric](../specs/data-display/stat-metric.md) — один выделенный показатель.
- [Link](../specs/actions/link.md) — значения, ведущие к ресурсу.
- [Icon Button](../specs/actions/icon-button.md) — copy action для ID, token или URL.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `root` | Да | Контейнер Description List, обычно `<dl>`. |
| `item` | Да | Одна пара term-definition. |
| `term` / `dt` | Да | Название свойства или label. |
| `definition` / `dd` | Да | Значение свойства. |
| `description` | Нет | Пояснение к значению. |
| `action` | Нет | Copy, Link, Tooltip или другое вложенное действие. |
| `divider` | Нет | Визуальное разделение строк. |

### Правила анатомии

- У каждого item должен быть один term и минимум одно definition.
- Несколько definitions у одного term допустимы только при корректной семантической связи.
- Вложенные actions используют Button, Icon Button или Link contracts.
- Empty value должен отображаться как `Не указано`, `Нет данных` или product-specific text.
- Divider не должен становиться частью доступного имени term или definition.

---

## 3. Types / Variants / Варианты

| Variant | Назначение | Когда использовать |
|---|---|---|
| `horizontal` | Term и definition в одной строке. | Короткие значения, детали объекта. |
| `vertical` | Term над definition. | Длинные значения, mobile, narrow panels. |
| `tableLike` | Строки с разделителями и выравненными колонками. | Плотные read-only details без table interactions. |

### Modifiers

| Modifier | Назначение | Правило |
|---|---|---|
| `bordered` | Добавляет разделители строк. | Использовать для плотных или сгруппированных данных. |
| `striped` | Чередует row surface. | Только если много строк и нужна scan clarity. |
| `compact` | Уменьшает spacing. | Side panels, dense cards. |
| `withDescriptions` | Добавляет поясняющий текст. | Для технических или неоднозначных values. |
| `withActions` | Добавляет copy/link/action controls. | Состояния принадлежат вложенным компонентам. |

---

## 4. Sizes / Размеры

Size управляет плотностью, spacing и шириной term column. Семантика списка не меняется.

| Size | Плотность | Term width | Применение |
|---|---|---|---|
| `compact` | Меньше vertical spacing. | Узкая или content-fit. | Side panels, table expansion, dense cards. |
| `medium` | Default spacing. | Стабильная label column. | Основной продуктовый UI. |
| `large` | Больше spacing. | Более широкая label column. | Detail pages, confirmation summary. |

### Правила размеров

- `medium` используется по умолчанию.
- `compact` допустим только если values остаются читаемыми.
- `large` подходит, когда Description List является основным содержимым секции.
- Term width должен быть стабильным внутри одного списка.
- На узких экранах horizontal layout может переходить в vertical.

---

## 5. States / Состояния

Description List статичен по умолчанию. Состояния описывают доступность данных или акцент строки, а не прямую интерактивность компонента.

| State | Когда возникает | Правило |
|---|---|---|
| `default` | Обычное отображение term-value. | Используются default row и text tokens. |
| `striped` | Чередование строк помогает сканированию. | Только визуальная поддержка. |
| `hover` | Row раскрывает action или имеет вложенное действие. | Не использовать для полностью статичных строк. |
| `empty` | Значение отсутствует. | Показывать explicit empty text. |
| `disabled` | Значение недоступно из-за прав или состояния объекта. | Объяснить причину, если она не очевидна. |

### State ownership

- Link, Button, Icon Button, copy action, Tooltip и Popover владеют своими состояниями.
- Description List не должен иметь selection, checked, loading или validation states без более высокого pattern.
- Empty values не передаются отсутствием текста.

---

## 6. Behavior / Поведение

### Layout behavior

- Horizontal layout выравнивает terms и definitions в стабильных колонках.
- Vertical layout ставит term над definition для длинных значений или узких контейнеров.
- Длинные definitions переносятся и не выходят за контейнер.
- Родственные группы можно разделять heading outside component.

### Content behavior

- Terms пишутся короткими noun phrases: `Owner`, `Status`, `Created`.
- Definitions сохраняют значимое форматирование: даты, суммы, ID, email, links.
- Для ID, token, URL и повторно используемых values добавляйте copy action.
- Критичные значения нельзя обрезать без Tooltip, copy или expand behavior.

### Responsive behavior

- Horizontal layout переключается в vertical, когда term/value columns становятся слишком узкими.
- Actions переходят под definition или после него на narrow widths.
- Stripes и borders остаются согласованными после переноса строк.

### Large data behavior

- Если список перестает быть summary одного объекта, сгруппируйте items или используйте Table.
- Если пользователю нужны sorting, filtering, comparison или scanning many records, используйте Table.

---

## 7. Accessibility

| Требование | Правило |
|---|---|
| Semantics | Использовать `<dl>`, `<dt>`, `<dd>` для term-value данных. |
| Reading order | DOM order соответствует visual order. |
| Empty values | Отсутствующие значения имеют читаемый текст. |
| Actions | Вложенные actions имеют accessible names. |
| Table-like layout | Не использовать layout tables для description lists. |
| Truncation | Полное значение доступно через Tooltip, copy или expand. |

### Accessibility checklist

- [ ] Terms и definitions программно связаны.
- [ ] Empty values отображаются явно.
- [ ] Copy/action controls имеют понятные accessible labels.
- [ ] Длинные значения можно прочитать, скопировать или раскрыть.
- [ ] Visual separators не объявляются как содержимое.
- [ ] Компонент не используется как data table.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Description List доступны component tokens в namespace `description-list`.

| Role | Component token | Semantic token |
|---|---|---|
| Term foreground | `description-list/term/foreground` | `text/tertiary` |
| Definition foreground | `description-list/definition/foreground` | `text/primary` |
| Description foreground | `description-list/description/foreground` | `text/secondary` |
| Stripe surface | `description-list/stripe/surface` | `surface/base` |
| Row surface default | `description-list/row/surface/default` | `color/transparent` |
| Row surface striped | `description-list/row/surface/striped` | `surface/subtle` |
| Row surface hover | `description-list/row/surface/hover` | `container/neutral/hover` |
| Row border | `description-list/row/border` | `border/subtle` |

### Token gaps

- Нет component tokens для term width, row gap, column gap, padding, typography и action spacing.
- До появления component-level tokens используйте foundation spacing, typography и layout roles.
- Не добавляйте новые Description List token names в specs, code, Figma или AI-generated handoff без token architecture review.

---

## 9. Code mapping

| Design concept | Prop / API | Правило |
|---|---|---|
| Items | `items` | Массив term-value pairs. |
| Term | `item.term` | Обязателен. |
| Definition | `item.definition` | Обязателен, если нет `emptyText`. |
| Description | `item.description` | Опциональный supporting text. |
| Action | `item.action` | Опциональное вложенное действие. |
| Variant | `variant` | `horizontal`, `vertical`, `tableLike`. |
| Size | `size` | `compact`, `medium`, `large`. |
| Bordered | `bordered` | Boolean. |
| Striped | `striped` | Boolean. |
| Empty text | `emptyText` | Текст для missing values. |
| Term width | `termWidth` | Только layout value; token gap, если нужен system token. |

### Contract rules

- Каждый item должен иметь `term`.
- Missing definition должна рендерить explicit empty text.
- Raw colors для row, term или definition запрещены.
- Links, buttons, copy actions и tooltips передаются через nested component APIs.
- Description List не используется для multi-record table data.
- `tableLike` не добавляет сортировку, фильтры или table semantics.

---

## 10. Handoff notes

Handoff для Description List должен фиксировать:

- purpose списка и объект, который он описывает;
- variant, size, bordered/striped behavior;
- item schema: term, definition, description, action;
- empty value wording;
- formatting rules для dates, IDs, currencies, links и long text;
- responsive switch rules;
- truncation, copy или expand behavior;
- nested interaction specs, если есть actions;
- token mapping для term, definition, description, row, stripe и border;
- token gaps для spacing, term width и typography.

---

## 11. Acceptance criteria

- [ ] Description List описывает свойства одного объекта или одной записи.
- [ ] У каждого value есть term.
- [ ] Missing values отображаются явно.
- [ ] Используется semantic `<dl>`, `<dt>`, `<dd>`, если возможно.
- [ ] Long values wrap или имеют documented truncation/copy behavior.
- [ ] Row surfaces, borders, terms, definitions и descriptions используют documented tokens.
- [ ] Компонент не используется для sortable/filterable multi-record data.
- [ ] `tableLike` variant не подменяет Table.

---

## 12. AI usage rules

AI может:

- предложить item schema для одного объекта;
- подготовить empty value text;
- сформировать formatting rules для ID, dates, currencies и links;
- подготовить handoff notes и acceptance criteria;
- проверить, не нужен ли Table, Form или Stat / Metric вместо Description List;
- сверить token mapping с `tokens.json`.

AI не должен:

- использовать Description List для multi-record data, comparison, sorting или filtering;
- использовать Description List для editable values;
- придумывать token paths, variants, row states или raw visual styles;
- оставлять blank values без empty text;
- обрезать critical value без способа прочитать или скопировать полный текст;
- добавлять hover state к статичной строке без interaction.

Если отсутствует term, value пустое без объяснения, данные похожи на таблицу или вложенное действие не описано, AI должен пометить сценарий как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Scenario | Usage |
|---|---|
| Profile details | Terms: `Name`, `Email`, `Role`; definitions как values. |
| Order summary | Terms: `Order ID`, `Status`, `Created`; copy action для ID. |
| Product specs | Terms и definitions сгруппированы по category. |
| Confirmation screen | Read-only summary перед submit. |

### Требует review

| Scenario | Причина |
|---|---|
| Сравнение 10 пользователей по 8 полям. | Нужен Table. |
| Editable profile settings. | Нужны Form controls. |
| Empty value как пустое место. | Missing state неясен. |
| Long token truncated без copy. | Пользователь не может получить полное значение. |

---

## 14. Anti-patterns

- Использовать Description List как layout grid.
- Использовать его для списка нескольких записей.
- Оставлять value пустым при отсутствии данных.
- Делать terms слишком длинными или похожими на предложения.
- Скрывать важные values за truncation без доступа к полному тексту.
- Добавлять row hover styles, когда rows не интерактивны.
- Создавать custom row colors вне component tokens.
