# Text Field

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Text Field — однострочное поле ввода текстовых данных. В отличие от Text Area, ограничен одной строкой и используется для коротких структурированных значений: имён, email, паролей, поисковых запросов, чисел.

### When to use

**Use** — для ввода коротких текстовых значений с известной структурой: имя, email, номер телефона, URL, пароль, поисковый запрос.

**Do not use:**
- Для длинных свободных текстов — используйте **Text Area**
- Для выбора из набора — используйте **Select** или **Segmented Control**
- Для даты/времени — используйте **Date Picker** / **Time Picker**
- Для OTP-кода — используйте **Verification Code**

### Core principles

- **Label всегда видим** — не заменяйте label на placeholder
- **Один слот — одно значение** — не пытайтесь вместить составной ввод в одно поле
- **Валидация после взаимодействия** — показывайте `error` только после blur или попытки отправить форму; текст ошибки следует `foundation/content.md`

---

## 2. Anatomy

```
Label                              [required]
┌──────────┬──────────────────────┬──────────┐
│ prefix-  │ Input / Placeholder  │ suffix-  │
│ icon/text│                      │ icon/text│
└──────────┴──────────────────────┴──────────┘
Helper text                    Character count
```

| Slot | Обязательность | Описание |
|---|---|---|
| `label` | required | Текстовая метка поля. Всегда видима |
| `input` | required | Нативный `<input>` — зона ввода |
| `placeholder` | optional | Подсказка до ввода. Не дублирует label и следует `foundation/content.md` |
| `helper-text` | optional | Подсказка под полем: формат, ограничения, последствие |
| `prefix-icon` | optional | Иконка слева. Следует `foundation/iconography.md`; визуальный контекст типа данных |
| `suffix-icon` | optional | Иконка справа. Следует `foundation/iconography.md`; очистка, показ пароля, статус |
| `prefix-text` | optional | Текст слева: «+7», «https://», валюта |
| `suffix-text` | optional | Текст справа: единицы измерения «кг», «px» |
| `character-count` | optional | Счётчик символов. Требует `maxLength` |

> `prefix-icon` и `prefix-text` взаимоисключают друг друга. Аналогично `suffix-icon` и `suffix-text`.

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `default` | Стандартное текстовое поле |
| `password` | Скрытый ввод с кнопкой показа/скрытия |
| `search` | Иконка поиска слева, кнопка очистки справа |
| `number` | Числовой ввод с кастомными кнопками инкремента |

---

## 4. Sizes

| Size | Height | Font / Line | Radius | Padding H | Контекст |
|---|---|---|---|---|---|
| `small` | 24px | 12px / 16px | 6px | 8px | Компактные таблицы, фильтры |
| `medium` | 32px | 14px / 20px | 8px | 12px | Формы — **дефолт** |
| `large` | 40px | 16px / 24px | 10px | 16px | Крупные формы, поиск в хедере |
| `extraLarge` | 48px | 18px / 28px | 12px | 20px | Hero-формы, мобильные |

> Label и helper-text остаются `14px / 20px` во всех размерах — они не масштабируются вместе с size.

---

## 5. States

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Исходный вид | Базовые border, bg |
| `hover` | Курсор над полем | `border` → `border/hover` |
| `focus` | Поле активно | `border` → `border/brand/default`, `focus/ring` |
| `filled` | Есть введённое значение | Значение цветом `text/primary` |
| `error` | Ошибка валидации | `border` → `status/danger/border`, helper красный |
| `warning` | Предупреждение | `border` → `status/warning/border` |
| `success` | Успешная валидация | `border` → `status/success/border` |
| `read-only` | Только чтение | Фон `surface/base`, cursor `default` |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `focus` + `error` | ✓ | Редактирование поля с ошибкой |
| `filled` + `error` | ✓ | Не прошло валидацию |
| `filled` + `success` | ✓ | Успешно заполнено |
| `read-only` + `filled` | ✓ | Отображение сохранённого значения |
| `error` + `success` | ✗ | Взаимоисключающие состояния |
| `disabled` + любое интерактивное | ✗ | `disabled` отменяет всё |

---

## 6. Details on Types / Variants

### default
`<input type="text">`. Поддерживает все слоты. Используйте `autocomplete` для браузерного автозаполнения.

### password
`<input type="password">`. Suffix-слот зарезервирован за кнопкой показа/скрытия. Иконка меняется между `eye` и `eye-off`.

### search
`<input type="search">`. Prefix — статичная иконка поиска. Suffix — кнопка очистки (×), появляется только при `value.length > 0`. После очистки фокус возвращается на поле.

### number
`<input type="number">`. Нативные стрелки скрыты. Кастомные `+` / `−` в suffix-зоне. Клавиши `↑` / `↓` изменяют значение. Не используйте для телефонов и карт — используйте `default` с `inputmode="numeric"`.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса |
| Символьные клавиши | Ввод текста |
| `↑` / `↓` | Инкремент/декремент (только `number`) |
| `Escape` | Очистка (только `search`) |
| `Enter` | Отправка формы |

### Validation timing
`error` появляется после `blur` или попытки отправки. Не показывайте на пустом поле. Сообщение должно объяснять, что исправить.

### Character count
Формат `[текущее] / [максимальное]`. При ≥ 80% — `status/warning/text`. При превышении — `status/danger/text`.

### Read-only vs Disabled
- `read-only` — значение видимо и копируется, поле в tab-order
- `disabled` — поле полностью исключено из взаимодействия

---

## 8. Accessibility

Компонент следует `foundation/accessibility.md` и соответствует WCAG 2.2 AA.

### Semantics

| Элемент / часть | Семантика | Когда |
|---|---|---|
| `label` | `<label for="...">` | Всегда |
| `input` | Нативный `<input>` | Всегда |
| `prefix-icon` | `aria-hidden="true"` | Если декоративная |
| `suffix-icon` | `<button type="button">` | Если интерактивная: очистка, показать пароль, инкремент |
| `helper-text` | Текстовый элемент с `id` | Когда есть подсказка |
| `character-count` | Текстовый элемент с `id` | Когда есть счётчик |

### Keyboard

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса между input и интерактивными suffix-кнопками |
| Символьные клавиши | Ввод текста |
| `Enter` | Отправка формы, если поле внутри формы |
| `Escape` | Очистка значения только для `search`, затем фокус остаётся в поле |
| `ArrowUp` / `ArrowDown` | Инкремент/декремент только для `number` |

`read-only` поле остаётся в tab-order, если значение полезно для чтения или копирования. `disabled` поле исключается из tab-order.

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `<label for="...">` | Текст label | Всегда |
| `aria-describedby` | ID helper-text / error text / character count | При наличии дополнительного описания |
| `aria-required="true"` | — | Обязательное поле |
| `aria-invalid="true"` | — | Состояние `error` |
| `readonly` | — | Состояние `read-only` |
| `disabled` | — | Состояние `disabled` |
| `aria-label="Показать пароль"` | — | Suffix-кнопка в `password` |
| `aria-label="Скрыть пароль"` | — | Suffix-кнопка в `password`, когда пароль показан |
| `aria-label="Очистить"` | — | Suffix-кнопка в `search` |
| `aria-label="Увеличить значение"` | — | Кнопка инкремента в `number` |
| `aria-label="Уменьшить значение"` | — | Кнопка декремента в `number` |

### Validation & status

| Состояние | Требование |
|---|---|
| `error` | `aria-invalid="true"` и error text, связанный через `aria-describedby` |
| `warning` | Текстовое объяснение, не только цвет border |
| `success` | Не заменяет label/helper text |
| `filled` | Не означает валидность |
| `read-only` | Значение доступно для чтения и копирования |
| `disabled` | Нативный `disabled`, без hover/focus/active |

### Visual
- Контрастность значения, label и helper text: минимум 4.5:1.
- Контрастность иконок и интерактивной границы: минимум 3:1.
- Focus ring использует `focus/ring`, видим на любом фоне и не обрезается контейнером.
- Состояния валидации сопровождаются иконкой или текстом, не только цветом.
- Placeholder не заменяет label и может иметь меньший визуальный приоритет.
- Prefix/suffix icons следуют `foundation/iconography.md`: декоративные скрываются через `aria-hidden`, интерактивные получают `aria-label`.

### Touch

- Минимальная интерактивная зона input и suffix-кнопок — 44×44px.
- Для `small` и `medium` визуальная высота может быть меньше, но hit area расширяется невидимым padding.

### Motion

- Очистка, появление suffix-кнопок и validation feedback не должны вызывать layout shift.

### Acceptance checklist

- [ ] Label видим и программно связан с input.
- [ ] Placeholder не дублирует и не заменяет label.
- [ ] Helper, error и character count связаны через `aria-describedby`.
- [ ] Error использует `aria-invalid="true"` и понятный текст исправления.
- [ ] Suffix-кнопки имеют `type="button"` и `aria-label`.
- [ ] `read-only` и `disabled` реализованы разными состояниями.
- [ ] Focus ring использует `focus/ring`.
- [ ] Текст имеет контраст минимум 4.5:1.
- [ ] Иконки и границы имеют контраст минимум 3:1.
- [ ] Touch target не меньше 44×44px.

---

## 9. Design Tokens

### Background

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--input-bg` | Фон default | `surface/base` | `surface/base` |
| `--input-bg-hover` | Фон hover | `surface/subtle` | `surface/subtle` |
| `--input-bg-disabled` | Фон disabled | `status/disabled/surface` | `status/disabled/surface` |

### Border

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--input-border` | Граница default | `border/default` | `border/default` |
| `--input-border-hover` | Граница hover | `border/hover` | `border/hover` |
| `--input-border-focus` | Граница focus | `border/brand/default` | `border/brand/default` |
| `--input-border-error` | Граница error | `status/danger/border` | `status/danger/border` |
| `--input-border-warning` | Граница warning | `status/warning/border` | `status/warning/border` |
| `--input-border-success` | Граница success | `status/success/border` | `status/success/border` |
| `--input-border-disabled` | Граница disabled | `status/disabled/border` | `status/disabled/border` |

### Text & Labels

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--input-text` | Значение | `text/primary` | `text/primary` |
| `--input-placeholder` | Placeholder | `text/muted` | `text/muted` |
| `--input-label` | Label | `text/secondary` | `text/secondary` |
| `--input-helper` | Helper default | `text/tertiary` | `text/tertiary` |
| `--input-helper-error` | Helper error | `status/danger/text` | `status/danger/text` |
| `--input-helper-warning` | Helper warning | `status/warning/text` | `status/warning/text` |
| `--input-helper-success` | Helper success | `status/success/text` | `status/success/text` |
| `--input-text-disabled` | Текст disabled | `status/disabled/text` | `status/disabled/text` |

### Shared

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--input-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--input-icon` | Иконка prefix/suffix | `text/tertiary` | `text/tertiary` |
| `--input-affix-bg` | Фон зоны affix-текста | `container/neutral/default` | `container/neutral/default` |


---

## Related specifications / Связанные спецификации

- [Text Area](../specs/inputs/text-area.md) — многострочный ввод.
- [Form](../specs/overlays-layout/form.md) — layout, validation и группировка полей.
- [Search](../specs/overlays-layout/search.md) — поисковый input pattern.

