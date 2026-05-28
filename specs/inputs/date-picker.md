# Date Picker

> **Category** · Inputs
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [DatePicker](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=4101-4117)

---

## 1. Key Principles

### Что это

Date Picker — контрол выбора даты, диапазона дат, месяца или года через input и calendar panel. Он нужен там, где значение даты должно быть не только введено, но и проверено относительно формата, границ, недоступных дат и бизнес-правил.

В SEDA AI Date Picker описан как часть AI-ready design system framework: spec связывает Figma variants, calendar behavior, validation, tokens, accessibility и handoff. AI может подготовить черновик validation matrix, helper/error text и acceptance criteria, но не утверждает правила календаря, timezone и business constraints.

### Когда использовать

- Пользователь выбирает дату из календаря.
- Нужно выбрать диапазон дат.
- Нужны ограничения `minDate`, `maxDate`, disabled dates или unavailable periods.
- Значение должно быть валидировано и передано в Form.
- Месяц или год выбираются как отдельный бизнес-параметр.

### Когда не использовать

- Для свободного текстового ввода используйте [Text Field](text-field.md).
- Для выбора времени используйте [Time Picker](time-picker.md).
- Для сложного расписания, бронирования ресурсов или календарной сетки нужен отдельный calendar/scheduling pattern.
- Не используйте Date Picker, если формат даты не определен в handoff.
- Не добавляйте local calendar states без system review.

### Ключевые принципы

- **Date value is data** — display format и storage format описываются отдельно.
- **Calendar rules are explicit** — min/max, disabled dates, first day of week и locale фиксируются в handoff.
- **Range has two ends** — start и end имеют отдельные states и validation.
- **Manual input is validated** — typed value проходит parser и не применяется молча при ошибке.
- **AI assists, system governs** — AI помогает найти gaps, но не придумывает calendar rules.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер поля и panel. |
| `label` | условно | Видимое имя поля, если Date Picker используется в Form. |
| `trigger/input` | да | Поле с текущим значением и affordance открытия calendar panel. |
| `calendar-icon` | опционально | Иконка открытия; не заменяет label. |
| `calendar-panel` | да | Overlay с календарной навигацией. |
| `header` | да | Текущий месяц/год и navigation controls. |
| `weekday-row` | да | Дни недели с учетом locale. |
| `day-cell` | условно | День месяца со states: today, selected, disabled, outside, range. |
| `month-cell` | условно | Выбор месяца для `Type=month`. |
| `year-cell` | условно | Выбор года для `Type=year`. |
| `helper/error` | условно | Подсказка или ошибка формата/диапазона. |

Правила anatomy:

- Calendar panel не открывается из `disabled`.
- Outside days показываются только если сценарий поддерживает переход между месяцами.
- Range selection должен визуально различать start, end и in-range.
- Helper/error text находится рядом с field, а не только внутри panel.

---

## 3. Types / Variants

Figma component set: `DatePicker`. Variants: 112.

| Property | Default | Options |
| --- | --- | --- |
| `Type` | `single` | `single`, `range`, `month`, `year` |
| `Size` | `s` | `s`, `m`, `l`, `xl` |
| `State` | `default` | `default`, `hover`, `focus`, `open`, `filled`, `error`, `disabled` |

### Type rules

| Type | Value model | Правило |
| --- | --- | --- |
| `single` | Один date value. | Подходит для даты рождения, дедлайна, даты начала. |
| `range` | `startDate` и `endDate`. | Нужны правила open-ended range, min/max и порядок выбора. |
| `month` | Month value. | Не используйте для выбора произвольного дня. |
| `year` | Year value. | Нужен годовой диапазон и правила disabled years. |

### State rules

- `open` означает, что panel видима и управляется keyboard/focus contract.
- `filled` означает, что value валиден и не пуст.
- `error` требует error text.
- `disabled` блокирует input и calendar panel.
- Если нужен `loading`, `read-only`, `warning` или `success`, помечайте как `Needs system review`.

---

## 4. Sizes

| Size | Контекст | Правило |
| --- | --- | --- |
| `s` | Плотные фильтры и таблицы. | Используйте только с коротким display format. |
| `m` | Базовые формы. | Рекомендуемый default. |
| `l` | Простые формы и настройки. | Подходит для более заметного date field. |
| `xl` | Touch-first сценарии. | Day cells и navigation controls должны сохранять touch target. |

Panel size не обязан равняться trigger size, но плотность day cells и navigation должна быть описана в handoff.

---

## 5. States

| State | Trigger | Calendar panel |
| --- | --- | --- |
| `default` | Нет взаимодействия. | Panel закрыта. |
| `hover` | Pointer над trigger. | Не влияет на выбранную дату. |
| `focus` | Trigger или active cell в фокусе. | Focus ring видим на active element. |
| `open` | `aria-expanded="true"`. | Panel открыта, фокус управляется внутри календаря. |
| `filled` | Value валиден. | Selected day/month/year выделен. |
| `error` | Значение невалидно. | Ошибка объясняется текстом рядом с field. |
| `disabled` | Поле недоступно. | Panel не открывается. |

Calendar cell states:

- `today` показывает текущий день, но не означает selected.
- `selected` показывает выбранный день.
- `range-start` и `range-end` различают границы диапазона.
- `in-range` показывает промежуточные даты.
- `disabled` не выбирается и имеет программное состояние.
- `outside` относится к соседнему месяцу и выбирается только при явном правиле.

---

## 6. Behavior

### Input and parsing

- Display format фиксируется в handoff: например `DD.MM.YYYY`.
- Storage format фиксируется отдельно: например ISO date string без времени.
- Typed value проходит parser на blur или submit.
- Невалидный typed value не заменяется автоматически ближайшей датой.
- Locale, timezone и first day of week должны быть явными.

### Calendar selection

- В `single` выбор даты обычно закрывает panel.
- В `range` первый выбор задает start, второй end; если end раньше start, поведение фиксируется в handoff.
- В `month` и `year` выбор закрывает panel только если это подтверждено в сценарии.
- Disabled dates не выбираются мышью или клавиатурой.
- Min/max rules применяются одинаково к typed input и calendar selection.

### Keyboard

| Key | Поведение |
| --- | --- |
| `Enter` / `Space` | Открывает panel или выбирает active date. |
| `Esc` | Закрывает panel и возвращает фокус на trigger. |
| `Arrow keys` | Перемещают active date внутри grid. |
| `PageUp` / `PageDown` | Переключают месяц, если поддержано. |
| `Home` / `End` | Переход к началу/концу недели, если поддержано. |
| `Tab` | Переходит по focusable controls без ловушки. |

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Label | Trigger/input имеет visible label или программное имя. |
| Expanded state | Trigger передает `aria-expanded`. |
| Relationship | Trigger связан с panel через `aria-controls` или framework equivalent. |
| Grid semantics | Calendar grid, weekday headers и day cells имеют корректные roles/labels. |
| Selected date | Selected/today/disabled states не передаются только цветом. |
| Error | Error text связан с input через `aria-describedby`. |
| Keyboard | Все calendar actions доступны с клавиатуры. |
| Locale | Screen reader label даты соответствует locale и display format. |

Accessibility checklist:

- [ ] Trigger имеет accessible name.
- [ ] Error state использует `aria-invalid`.
- [ ] Disabled dates программно недоступны.
- [ ] Today и selected различимы текстово/семантически.
- [ ] Range start/end понятны screen reader пользователю.
- [ ] Focus возвращается на trigger после закрытия panel.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`. Для Date Picker используются component tokens из namespace `date-picker`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/date-picker/border/default` | Trigger border. | `border/default` |
| `$collections/components/$modes/Mode 1/date-picker/border/focus` | Trigger focus border. | `border/focus` |
| `$collections/components/$modes/Mode 1/date-picker/border/hover` | Trigger hover border. | `border/hover` |
| `$collections/components/$modes/Mode 1/date-picker/border/error` | Trigger error border. | `status/danger/border` |
| `$collections/components/$modes/Mode 1/date-picker/border/disabled` | Trigger disabled border. | `status/disabled/border` |
| `$collections/components/$modes/Mode 1/date-picker/calendar/surface` | Calendar panel surface. | `surface/overlay` |
| `$collections/components/$modes/Mode 1/date-picker/calendar/border` | Calendar panel border. | `border/default` |
| `$collections/components/$modes/Mode 1/date-picker/calendar/shadow` | Calendar panel shadow. | `shadow/overlay` |
| `$collections/components/$modes/Mode 1/date-picker/calendar/header/foreground` | Header text. | `text/primary` |
| `$collections/components/$modes/Mode 1/date-picker/calendar/weekday/foreground` | Weekday text. | `text/tertiary` |
| `$collections/components/$modes/Mode 1/date-picker/calendar/nav/surface/default` | Calendar nav default. | `color/transparent` |
| `$collections/components/$modes/Mode 1/date-picker/calendar/nav/surface/hover` | Calendar nav hover. | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/date-picker/calendar/nav/surface/active` | Calendar nav active. | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/date-picker/calendar/nav/icon/default` | Calendar nav icon. | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/date-picker/day/surface/default` | Day default surface. | `color/transparent` |
| `$collections/components/$modes/Mode 1/date-picker/day/surface/hover` | Day hover surface. | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/date-picker/day/surface/active` | Day active surface. | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/date-picker/day/surface/selected` | Selected day surface. | `container/brand/default` |
| `$collections/components/$modes/Mode 1/date-picker/day/surface/today` | Today indicator. | `border/brand/default` |
| `$collections/components/$modes/Mode 1/date-picker/day/surface/disabled` | Disabled day surface. | `color/transparent` |
| `$collections/components/$modes/Mode 1/date-picker/day/surface/outside` | Outside day surface. | `color/transparent` |

Token gaps:

- Range-specific start/end/in-range tokens должны быть сверены в `tokens.json` перед добавлением в spec.
- Если нужны month/year cell tokens, но их нет в namespace, пометьте как `Token gap`.
- Не используйте raw colors для selected, today или disabled dates.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Type | `type` | `single`, `range`, `month`, `year`. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Value | `value` / `defaultValue` | Date, range object, month или year. |
| Open | `open`, `onOpenChange` | Controlled и uncontrolled modes не смешиваются. |
| Format | `displayFormat`, `parse`, `format` | Display и storage format разделены. |
| Boundaries | `minDate`, `maxDate` | Применяются к input и panel. |
| Disabled dates | `isDateDisabled` / `disabledDates` | Единый источник правил. |
| Locale | `locale`, `firstDayOfWeek` | Явно передается в handoff. |
| Error | `error`, `errorText` | Error state плюс текст. |
| Disabled | `disabled` | Блокирует input и panel. |

Contract rules:

- Date value не должен храниться как локализованная display string.
- Range value должен иметь явные `startDate` и `endDate`.
- Parser не должен молча менять невалидную дату.
- Timezone rules должны быть согласованы с backend/data model.

---

## 10. Handoff notes

Handoff для Date Picker должен включать:

- Figma component и node id: `4101:4117`;
- `Type`, `Size`, `State`;
- display format, storage format, locale, timezone;
- min/max, disabled dates, unavailable periods;
- range behavior: start/end, open-ended, invalid order;
- keyboard behavior и focus return;
- mobile behavior: dropdown, dialog или native picker;
- validation triggers и error messages;
- token mapping и token gaps.

### Acceptance criteria

- Date Picker использует только documented `Type`, `Size`, `State`.
- Typed input и calendar selection проходят одинаковые validation rules.
- Selected, today, disabled и range states доступны не только цветом.
- `error` всегда имеет error text.
- `disabled` не открывает panel.
- Handoff содержит display/storage format и timezone.
- AI-generated output не добавляет calendar behavior без `Needs system review`.

---

## 11. AI usage rules

- AI может подготовить validation matrix для min/max, disabled dates и format rules.
- AI должен сверять `tokens.json` перед изменением Design Tokens.
- AI не должен придумывать timezone, locale, first day of week или business date rules.
- AI должен помечать range edge cases как `Needs system review`, если они не описаны.
- AI должен отличать Date Picker от Time Picker, Text Field и scheduling calendar.
- AI может предложить error text, но человек подтверждает product/legal смысл.

---

## 12. Примеры

### Корректно

| Сценарий | Почему |
| --- | --- |
| Дата рождения с `single`, min/max и storage ISO date. | Понятный value contract и validation. |
| Диапазон отпуска с `range`, disabled past dates и error для end before start. | Range edge cases описаны. |
| Month picker для периода отчета. | Тип значения соответствует бизнес-задаче. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Нужен выбор времени внутри Date Picker. | Это пересечение с Time Picker. |
| Нужны цены/доступность по дням в календаре. | Это scheduling pattern, а не базовый Date Picker. |
| Нужен timezone conversion. | Требуется data/backend contract. |

---

## 13. Anti-patterns

- Хранить дату только в локализованной display string.
- Использовать disabled dates без объяснения в helper/error.
- Делать today визуально похожим на selected.
- Применять невалидный typed value без ошибки.
- Добавлять range behavior без start/end rules.
- Использовать raw colors для calendar cells.
- Генерировать handoff без locale, timezone и format rules.
