# Text Area

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Text Area — многострочное поле ввода свободного текста. Используется для комментариев, описаний, заметок и любого контента, где объём заранее неизвестен или превышает одну строку.

### When to use

**Use** — для комментариев, описаний, биографий, отзывов, сообщений, любого текста длиннее одной строки.

**Do not use:**
- Для коротких структурированных данных — используйте **Text Field**
- Когда нужен форматированный текст (жирный, списки) — используйте Rich Text Editor

### Core principles

- **Минимальная высота** — задавайте начальную высоту, соответствующую ожидаемому объёму ввода
- **Label всегда видим** — не заменяйте label на placeholder
- **Валидация после взаимодействия** — не показывайте `error` на пустом поле

---

## 2. Anatomy

```
Label
┌─────────────────────────────────────┐
│                                     │
│  Input / Placeholder                │
│                                     │
│                           ⠿ resize  │
└─────────────────────────────────────┘
Helper text                 Char count
```

| Slot | Обязательность | Описание |
|---|---|---|
| `label` | required | Текстовая метка. Всегда видима |
| `input` | required | Нативный `<textarea>` |
| `placeholder` | optional | Подсказка до ввода |
| `helper-text` | optional | Подсказка под полем |
| `character-count` | optional | Счётчик символов при наличии `maxLength` |
| `resize-handle` | conditional | Ручка ресайза для типа `manual-resize` |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `manual-resize` | Пользователь может менять высоту вручную (drag) |
| `auto-resize` | Высота подстраивается под контент автоматически |
| `fixed` | Высота фиксирована, внутри появляется скролл |

---

## 4. Sizes

| Size | Min Height | Font / Line | Radius | Контекст |
|---|---|---|---|---|
| `small` | 60px | 12px / 16px | 6px | Компактные формы |
| `medium` | 80px | 14px / 20px | 8px | Стандартные формы — дефолт |
| `large` | 100px | 16px / 24px | 10px | Развёрнутые поля |
| `extraLarge` | 120px | 18px / 28px | 12px | Редакторы, большие блоки |

---

## 5. States

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Исходный вид | Базовые border, bg |
| `hover` | Курсор над полем | `border` → `border/hover` |
| `focus` | Поле активно | `border` → `border/brand/default`, `focus/ring` |
| `filled` | Есть введённый текст | Текст цветом `text/primary` |
| `error` | Ошибка валидации | `border` → `status/danger/border` |
| `warning` | Предупреждение | `border` → `status/warning/border` |
| `success` | Успешная валидация | `border` → `status/success/border` |
| `read-only` | Только чтение | cursor `default`, текст копируется |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `focus` + `error` | ✓ | Редактирование с ошибкой |
| `filled` + `error` | ✓ | Не прошло валидацию |
| `error` + `warning` | ✗ | Взаимоисключающие |
| `disabled` + любое интерактивное | ✗ | — |

---

## 6. Details on Types / Variants

### manual-resize
Пользователь тянет за правый нижний угол. Задайте `min-height` и опционально `max-height`. Ручка ресайза — нативный `resize: vertical` или кастомный handle.

### auto-resize
Высота рассчитывается по `scrollHeight` при каждом `input`-событии. Задайте `min-height` и `max-height`. При достижении `max-height` появляется внутренний скролл.

### fixed
Высота задаётся через проп `rows` или CSS. При переполнении — `overflow-y: auto`. Используйте когда нужен предсказуемый layout.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса |
| `Enter` | Новая строка (не отправка формы) |
| `Shift+Enter` | То же что Enter в большинстве контекстов |

### Character count
Аналогично Text Field: `[текущее] / [максимальное]`. При ≥ 80% — `status/warning/text`. При превышении — `status/danger/text`.

---

## 8. Accessibility

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `<label for="...">` | Текст label | Всегда |
| `aria-describedby` | ID helper-text | При наличии helper-text |
| `aria-required="true"` | — | Обязательное поле |
| `aria-invalid="true"` | — | Состояние `error` |
| `aria-multiline="true"` | — | Автоматически для `<textarea>` |

---

## 9. Design Tokens

### Background & Border

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--textarea-bg` | Фон default | `surface/base` | `surface/base` |
| `--textarea-border` | Граница default | `border/default` | `border/default` |
| `--textarea-border-focus` | Граница focus | `border/brand/default` | `border/brand/default` |
| `--textarea-border-error` | Граница error | `status/danger/border` | `status/danger/border` |
| `--textarea-border-warning` | Граница warning | `status/warning/border` | `status/warning/border` |
| `--textarea-border-success` | Граница success | `status/success/border` | `status/success/border` |

### Text

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--textarea-text` | Значение | `text/primary` | `text/primary` |
| `--textarea-placeholder` | Placeholder | `text/muted` | `text/muted` |
| `--textarea-label` | Label | `text/secondary` | `text/secondary` |
| `--textarea-helper` | Helper default | `text/tertiary` | `text/tertiary` |
| `--textarea-helper-error` | Helper error | `status/danger/text` | `status/danger/text` |
| `--textarea-helper-warning` | Helper warning | `status/warning/text` | `status/warning/text` |
| `--textarea-helper-success` | Helper success | `status/success/text` | `status/success/text` |

### Shared

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--textarea-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--textarea-disabled-bg` | Фон disabled | `status/disabled/surface` | `status/disabled/surface` |
| `--textarea-disabled-text` | Текст disabled | `status/disabled/text` | `status/disabled/text` |


---

## Related specifications / Связанные спецификации

- [Text Field](../specs/inputs/text-field.md) — однострочный ввод.
- [Form](../specs/overlays-layout/form.md) — правила композиции полей.
- [Tooltip](../specs/feedback/tooltip.md) — короткие подсказки к полю.

