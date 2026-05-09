# Time Picker

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Time Picker — контрол выбора времени через ввод с клавиатуры или скролл-барабаны. Может использоваться самостоятельно или в сочетании с Date Picker.

### When to use

**Use** — для выбора времени события, напоминания, встречи; в формах бронирования и расписания.

**Don't use:**
- Когда точное время не важно — используйте Select с предустановленными интервалами
- Для ввода длительности — используйте Text Field с маской

---

## 2. Anatomy

```
Label
┌──────┬──────┬──────┐
│  14  │  30  │  AM  │  (input)
└──────┴──────┴──────┘

Scroll (открыт):
┌──────┬──────┐
│  13  │  28  │
│ >14< │ >30< │  ← активные
│  15  │  32  │
└──────┴──────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `label` | optional | Метка контрола |
| `hour-input` | required | Поле часов |
| `minute-input` | required | Поле минут |
| `period-toggle` | conditional | AM/PM для формата 12h |
| `scroll-drum` | conditional | Барабан прокрутки для типа `scroll` |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `input` | Прямой ввод через текстовые поля |
| `scroll` | Выбор через прокручиваемые барабаны |
| `combined` | Date Picker + Time Picker в одном виджете |

**Форматы:** `12h` (AM/PM) · `24h`

---

## 4. States

| Состояние | Описание |
|---|---|
| `default` | Поле пустое или с временем |
| `hover` | Курсор над полем |
| `focus` | Активное поле / барабан |
| `open` | Scroll-барабан раскрыт |
| `filled` | Время выбрано |
| `error` | Невалидное время |
| `disabled` | Недоступен |

---

## 5. Behavior

### Keyboard interaction (input)

| Клавиша | Действие |
|---|---|
| `↑` / `↓` | Инкремент / декремент часов или минут |
| `Tab` | Переход между часами, минутами, AM/PM |
| `A` / `P` | Быстрый выбор AM / PM |

### Keyboard interaction (scroll)

| Клавиша | Действие |
|---|---|
| `↑` / `↓` | Прокрутка барабана |
| `Enter` | Подтверждение |

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="spinbutton"` | — | Поле часов и минут |
| `aria-valuemin` | 0 | Часы/минуты |
| `aria-valuemax` | 23 / 59 | Часы / минуты |
| `aria-valuenow` | текущее | Всегда |
| `aria-label` | «Часы» / «Минуты» | Каждый spinbutton |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--timepicker-bg` | Фон инпута | `surface/default` | `surface/default` |
| `--timepicker-border` | Граница | `border/default` | `border/default` |
| `--timepicker-border-focus` | Граница focus | `border/brand/default` | `border/brand/default` |
| `--timepicker-text` | Значение времени | `text/primary` | `text/primary` |
| `--timepicker-drum-bg` | Фон барабана | `surface/default` | `surface/default` |
| `--timepicker-drum-selected` | Активная позиция | `container/brand/default` | `container/brand/default` |
| `--timepicker-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
