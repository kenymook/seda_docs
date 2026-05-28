# Time Picker

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Time Picker — input-компонент для выбора или ввода времени. Он может работать как маскированный текстовый ввод, dropdown со списками часов/минут, scroll columns или как часть Date + Time flow. Компонент отвечает за формат времени, допустимый диапазон, validation, timezone/locale notes и связь с Form.

Time Picker не предназначен для длительности. Время отвечает на вопрос "когда", а duration отвечает на вопрос "как долго".

### Когда использовать

**Используйте** — когда пользователю нужно выбрать точное время:

- время встречи, события или напоминания;
- расписание, booking или delivery slot;
- время начала/окончания процесса;
- фильтр по времени;
- Date Picker + Time Picker для datetime;
- ввод времени с ограничениями: working hours, шаг минут, min/max time.

**Не используйте:**

- Для выбора длительности — используйте Text Field с единицами измерения или специализированный duration pattern.
- Для грубого периода вроде "утро/день/вечер" — используйте Select или Segmented Control.
- Для выбора даты — используйте [Date Picker](../inputs/date-picker.md).
- Для таймера или прогресса операции — используйте Progress Bar, Spinner или отдельный timer pattern.
- Для timezone selection — используйте Select или Search, если список большой.

### Основные принципы

- **Формат времени должен быть явным** — 12h/24h, locale и timezone нужно фиксировать в handoff.
- **Input и picker синхронизированы** — ручной ввод и выбор из panel должны давать один normalized value.
- **Validation не должна угадываться** — min/max, step, disabled options и error copy описываются явно.
- **Timezone — часть данных** — если время зависит от зоны, это должно быть видно пользователю или описано в контексте.
- **Не путать время и длительность** — Time Picker выбирает момент внутри суток, а не интервал.
- **AI не придумывает timezone и format rules** — AI может подготовить варианты, но правила подтверждает человек.

### Связанные спецификации

- [Date Picker](../specs/inputs/date-picker.md)
- [Text Field](../specs/inputs/text-field.md)
- [Select](../specs/inputs/select.md)
- [Form](../specs/overlays-layout/form.md)
- [Dropdown / Menu](../specs/overlays-layout/dropdown-menu.md)

---

## 2. Anatomy

```text
Label
[ 14 : 30 ] [icon]
Helper text / Error

Dropdown:
+------------------+
| Hours | Minutes  |
|  13   |   25     |
| >14<  |  >30<    |
|  15   |   35     |
+------------------+
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | да | Контейнер Time Picker |
| `label` | рекомендуется | Видимый label control |
| `input` | да | Поле ввода времени или trigger picker |
| `hourSegment` | условно | Segment часов при segmented input |
| `minuteSegment` | условно | Segment минут |
| `secondSegment` | опционально | Segment секунд, если flow требует seconds |
| `periodToggle` | условно | AM/PM для `12h` format |
| `triggerIcon` | опционально | Icon для открытия picker panel |
| `dropdown` | условно | Panel со списком/columns времени |
| `hourColumn` | условно | Список часов |
| `minuteColumn` | условно | Список минут |
| `helperText` | опционально | Формат, timezone, ограничения |
| `errorText` | условно | Ошибка невалидного времени |

### Правила anatomy

- `label` не заменяется placeholder.
- Для `24h` не показывайте AM/PM.
- Для `12h` period должен быть частью value и keyboard order.
- Dropdown не должен скрывать error text и helper text.
- Если есть seconds, они должны быть частью value contract, а не визуальным дополнением.

---

## 3. Types / Variants

### Варианты ввода

| Вариант | Описание | Когда использовать |
| --- | --- | --- |
| `input` | Ручной ввод с mask/parsing | Быстрый ввод известного времени |
| `dropdown` | Input + panel со списками | Формы и booking flows |
| `scroll` | Scroll columns/drums | Touch-first interfaces |
| `combined` | Date Picker + Time Picker | Datetime selection |

### Формат

| Формат | Описание | Правило |
| --- | --- | --- |
| `24h` | 00:00-23:59 | Дефолт для большинства product UI |
| `12h` | 1:00-12:59 + AM/PM | Используйте для locale/product contexts, где это привычный формат |

### Precision

| Precision | Описание | Когда использовать |
| --- | --- | --- |
| `minutes` | Hours + minutes | Дефолт |
| `seconds` | Hours + minutes + seconds | Логи, расписания задач, technical flows |
| `step` | Minutes step: 5, 10, 15, 30 | Booking slots, расписание, ограничения сервиса |

---

## 4. Sizes

Размер Time Picker управляет высотой input, плотностью dropdown options и touch target.

| Size | Input density | Dropdown density | Когда использовать |
| --- | --- | --- | --- |
| `small` | Compact | Dense options | Фильтры, таблицы, narrow panels |
| `medium` | Default | Default options | Большинство форм |
| `large` | Roomy | Touch-friendly options | Mobile, booking, primary scheduling flows |

### Правила размеров

- Используйте `medium` по умолчанию.
- Используйте `small` только когда формат времени остается читаемым.
- Используйте `large` для touch-first выбора времени.
- Размер dropdown должен позволять выбрать option без accidental selection.
- Не меняйте формат времени ради экономии места; меняйте layout или density.

---

## 5. States

### Матрица состояний

| State | Значение | Обязательное поведение |
| --- | --- | --- |
| `default` | Пустое поле или валидное время | Базовый surface/border/foreground |
| `hover` | Pointer над input | Hover border/surface |
| `focus` | Input или option в focus | Focus border/ring |
| `open` | Dropdown/panel открыт | Panel visible, trigger active |
| `filled` | Время выбрано | Value отображается в выбранном format |
| `read-only` | Значение доступно только для чтения | Нет редактирования, value readable |
| `loading` | Доступные slots загружаются | Покажите loading state без потери value |
| `error` | Невалидное время | Error border/surface/helper |
| `warning` | Время допустимо, но требует внимания | Warning helper |
| `success` | Время принято/валидно | Используйте только если это помогает |
| `disabled` | Control недоступен | Disabled treatment, нет ввода |

### Состояния option

| State | Значение | Правило |
| --- | --- | --- |
| `default` | Доступное время | Можно выбрать |
| `hover` | Pointer hover | Hover surface |
| `active` | Pressed option | Active surface |
| `selected` | Текущее значение | Selected surface/foreground |
| `disabled` | Время недоступно | Не выбирается, причина должна быть понятна в контексте |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
| --- | --- | --- |
| `filled` + `focus` | да | Пользователь редактирует выбранное время |
| `open` + `error` | да | Можно исправлять ошибку через picker |
| `loading` + `filled` | да | Slots обновляются, value сохраняется |
| `disabled` + `open` | нет | Disabled control не открывает picker |
| `read-only` + `open` | нет | Read-only не редактируется |

---

## 6. Behavior

### Input behavior

- Ручной ввод должен поддерживать documented format: например `HH:mm`.
- Ввод нормализуется в value format, например `14:30`.
- Некорректные значения показывают error только после blur, submit или явного validation trigger.
- `ArrowUp` / `ArrowDown` могут увеличивать/decrease активный segment, если segmented input поддержан.
- `Tab` переводит focus между segments и следующими controls.
- При blur значение форматируется или остается ошибочным с понятным error text.

### Picker behavior

- Dropdown открывается по trigger, focus или keyboard action, если это описано.
- Выбор hour/minute обновляет value; auto-close зависит от variant и precision.
- Disabled options не выбираются.
- Step ограничивает доступные minute options.
- Если min/max time задан, недоступные options должны быть визуально и программно disabled.

### Datetime, timezone и locale

- Если Time Picker используется с Date Picker, handoff должен описать combined value.
- Timezone должна быть видна или задана контекстом; нельзя молча менять timezone.
- 12h/24h format зависит от locale/product rule, а не от случайного UI решения.
- Для расписаний нужно описать, работает ли время в local timezone пользователя или в timezone объекта.

### Keyboard interaction

| Клавиша | Действие |
| --- | --- |
| `Tab` / `Shift+Tab` | Перемещение между segments, trigger, options и соседними controls |
| `ArrowUp` / `ArrowDown` | Изменить active segment или option |
| `ArrowLeft` / `ArrowRight` | Перейти между segments, если используется segmented input |
| `Enter` | Подтвердить active option или submit form |
| `Escape` | Закрыть dropdown и вернуть focus |
| `A` / `P` | Быстрый выбор AM/PM в `12h`, если поддержано |

---

## 7. Accessibility

Time Picker следует [foundation/accessibility.md](../../foundation/accessibility.md), [foundation/content.md](../../foundation/content.md) и Form validation rules.

| Требование | Правило |
| --- | --- |
| Label | Control имеет visible или programmatic label |
| Format hint | Формат времени доступен в helper text или accessible description |
| Spinbutton | Segmented hour/minute controls могут использовать `role="spinbutton"` |
| Listbox | Dropdown options используют listbox/option pattern, если это список выбора |
| Error | Error text связан с control |
| Timezone | Timezone не должна быть скрытой, если влияет на результат |
| Keyboard | Ввод и выбор доступны без mouse |
| Disabled options | Недоступные times не активируются |

### Accessibility checklist

- [ ] Label связан с control.
- [ ] Формат времени понятен.
- [ ] Keyboard users могут ввести и выбрать время.
- [ ] Error state связан с text и не зависит только от цвета.
- [ ] Dropdown закрывается по `Escape` и возвращает focus.
- [ ] Disabled options не выбираются.
- [ ] Timezone/locale rules понятны пользователю или описаны в контексте.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`. Они записаны как component paths, чтобы не путать их с semantic token references.

| Роль | Component path | Semantic |
| --- | --- | --- |
| Surface default | time-picker surface default | `surface/base` |
| Surface hover | time-picker surface hover | `surface/subtle` |
| Surface active | time-picker surface active | `surface/base` |
| Surface focus | time-picker surface focus | `surface/base` |
| Surface disabled | time-picker surface disabled | `status/disabled/container` |
| Surface read-only | time-picker surface read-only | `surface/subtle` |
| Surface loading | time-picker surface loading | `surface/base` |
| Surface error | time-picker surface error | `status/danger/container` |
| Surface warning | time-picker surface warning | `status/warning/container` |
| Surface success | time-picker surface success | `status/success/container` |
| Border default | time-picker border default | `border/default` |
| Border hover | time-picker border hover | `border/hover` |
| Border active | time-picker border active | `border/strong` |
| Border focus | time-picker border focus | `border/focus` |
| Border disabled | time-picker border disabled | `status/disabled/border` |
| Border read-only | time-picker border read-only | `border/subtle` |
| Border error | time-picker border error | `status/danger/border` |
| Border warning | time-picker border warning | `status/warning/border` |
| Border success | time-picker border success | `status/success/border` |
| Foreground default | time-picker foreground default | `text/primary` |
| Foreground placeholder | time-picker foreground placeholder | `text/muted` |
| Foreground disabled | time-picker foreground disabled | `status/disabled/text` |
| Foreground read-only | time-picker foreground read-only | `text/secondary` |
| Label default | time-picker label default | `text/secondary` |
| Helper default | time-picker helper default | `text/tertiary` |
| Helper error | time-picker helper error | `status/danger/text` |
| Helper warning | time-picker helper warning | `status/warning/text` |
| Helper success | time-picker helper success | `status/success/text` |
| Icon default | time-picker icon default | `icon/tertiary` |
| Icon active | time-picker icon active | `icon/primary` |
| Focus ring | time-picker focus ring | `focus/ring` |
| Dropdown surface | time-picker dropdown surface | `surface/overlay` |
| Dropdown border | time-picker dropdown border | `border/default` |
| Dropdown shadow | time-picker dropdown shadow | `shadow/overlay` |
| Column label | time-picker column label | `text/tertiary` |
| Separator foreground | time-picker separator foreground | `text/tertiary` |
| Option surface default | time-picker option surface default | `color/transparent` |
| Option surface hover | time-picker option surface hover | `container/neutral/hover` |
| Option surface active | time-picker option surface active | `container/neutral/pressed` |
| Option surface selected | time-picker option surface selected | `container/brand/default` |
| Option foreground default | time-picker option foreground default | `text/primary` |
| Option foreground selected | time-picker option foreground selected | `text/on-brand/primary` |
| Option icon selected | time-picker option icon selected | `text/on-brand/primary` |

### Token gaps

- Сейчас у Time Picker нет component tokens для input height, segment width, dropdown max height, option height, column width, spacing, radius и animation.
- Используйте Text Field, Dropdown/Menu, foundation spacing, sizing, radius, typography и motion rules, пока не появятся component-specific tokens.
- Не придумывайте `--timepicker-*` или новые Time Picker token paths в specs, code, Figma или AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Value | `value` | Normalized time string, например `14:30` |
| Format | `format` | `24h`, `12h` |
| Precision | `precision` | `minutes`, `seconds` |
| Step | `minuteStep` | 1, 5, 10, 15, 30 |
| Variant | `variant` | `input`, `dropdown`, `scroll`, `combined` |
| Size | `size` | `small`, `medium`, `large` |
| Min time | `minTime` | Нижняя граница |
| Max time | `maxTime` | Верхняя граница |
| Timezone | `timezone` | IANA timezone или documented product context |
| Locale | `locale` | Управляет format/display |
| Disabled | `disabled` | Блокирует ввод и picker |
| Read-only | `readOnly` | Показывает value без редактирования |
| Error | `error` | Error state/message |
| Open | `open` | Dropdown state |
| On change | `onChange` | Возвращает normalized value |

### Contract rules

- `value` должен иметь единый normalized format.
- `format`, `timezone`, `locale`, `minuteStep`, `minTime` и `maxTime` должны быть описаны в handoff.
- `disabled` options должны соответствовать min/max/step rules.
- `combined` variant требует contract с Date Picker.
- Error message должен объяснять, что исправить.

---

## 10. Handoff notes

В handoff нужно передать:

- назначение поля времени и связанный бизнес-контекст;
- format: `12h` или `24h`;
- normalized value format;
- timezone и locale rules;
- variant, size, precision и minute step;
- min/max time и disabled options;
- validation trigger и error copy;
- поведение dropdown/scroll/input;
- combined behavior с Date Picker, если применяется;
- token mapping для input, helper, icon, dropdown, columns, options и focus;
- token gaps для dimensions, spacing, radius и motion.

### Acceptance criteria

- Пользователь может ввести или выбрать валидное время.
- Format, timezone и step понятны.
- Invalid time показывает error text и recovery.
- Disabled options не выбираются.
- Keyboard interaction работает для input и dropdown.
- `12h` variant корректно обрабатывает AM/PM.
- Component использует документированные Time Picker component paths и semantic tokens.
- AI-generated drafts не добавляют timezone, format rules или token names без review.

---

## 11. AI usage rules

- AI может использовать Time Picker только для выбора момента времени внутри суток.
- AI должен рекомендовать Text Field/duration pattern для длительности.
- AI не должен придумывать timezone, locale, min/max time, minute step, token paths или validation behavior.
- AI должен проверять `tokens.json` перед изменением Time Picker token mappings.
- AI должен помечать missing timezone rule, unclear format, missing validation, inaccessible dropdown или unsupported combined datetime behavior как `Needs system review`.
- AI может подготовить Handoff notes, validation copy и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Examples

### Корректно

| Сценарий | Использование |
| --- | --- |
| Meeting time | `format=24h`, `minuteStep=15`, timezone visible |
| Delivery slot | Dropdown options with disabled unavailable times |
| Datetime booking | Date Picker + Time Picker with shared value contract |
| Reminder | Manual input with helper text `HH:mm` |
| 12h locale | `format=12h`, AM/PM visible and keyboard accessible |

### Требует review

| Сценарий | Причина |
| --- | --- |
| Пользователь выбирает "2 часа" | Это duration, не Time Picker |
| Timezone влияет на результат, но не показана | Риск ошибки данных |
| Disabled times выглядят как обычные options | Accessibility и validation gap |
| AI выбирает `minuteStep=15` без требования | Придуманное product rule |
| Combined Date + Time не описывает normalized value | Handoff неполный |

---

## 13. Anti-patterns

- Использовать Time Picker для длительности.
- Скрывать timezone, если она меняет смысл значения.
- Позволять выбрать disabled time.
- Показывать error только цветом border.
- Смешивать 12h и 24h format без правила locale.
- Не поддерживать keyboard input.
- Создавать raw colors, custom dropdown styles или недокументированные token names.
