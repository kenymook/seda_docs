# Stepper

> **Category** · Navigation
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Stepper — индикатор прогресса многошагового процесса. Показывает текущее положение в потоке и общее число шагов. Используется в регистрации, оформлении заказа, онбординге.

### When to use

**Use** — для линейных процессов из 2–6 шагов, где важно показать прогресс и дать ощущение завершённости.

**Don't use:**
- Для 1 шага — нет смысла в индикаторе
- Для нелинейной навигации — используйте Tabs или Sidebar
- Более 6 шагов — разбейте процесс или используйте прогресс-бар

### Core principles

- **Текущий шаг всегда выделен** — пользователь видит где находится
- **Завершённые шаги отмечены** — галочка или номер показывает прогресс
- **Ошибка блокирует переход** — шаг с `error` требует исправления

---

## 2. Anatomy

```
Horizontal:
①────────②────────③────────④
Done    Current   Upcoming  Upcoming
        [Label]

Vertical:
① Done
│
② Current  ← [Label + optional description]
│
③ Upcoming
│
④ Upcoming
```

| Slot | Обязательность | Описание |
|---|---|---|
| `step-indicator` | required | Кружок с номером или иконкой |
| `step-label` | required | Название шага |
| `step-description` | optional | Краткое описание (с модификатором `with-description`) |
| `connector` | auto | Линия между шагами |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `horizontal` | Шаги расположены горизонтально. Для хедеров форм |
| `vertical` | Шаги расположены вертикально. Для боковых панелей |

### Варианты шага

| Вариант | Описание |
|---|---|
| `upcoming` | Шаг ещё не достигнут. Серый индикатор |
| `current` | Текущий активный шаг. Акцентный индикатор |
| `completed` | Шаг завершён. Галочка вместо номера |
| `error` | Ошибка на шаге. Красный индикатор |

### Modifiers

| Модификатор | Описание |
|---|---|
| `with-description` | Подпись под названием шага |
| `clickable` | Пользователь может кликнуть на шаг и перейти на него |

---

## 4. States (на шаг)

### State types

- **data:** `upcoming`, `current`, `completed`, `error`
- **interaction:** `hover` (только при `clickable`), `focus`

| Состояние | Визуально |
|---|---|
| `upcoming` | Пустой кружок, серый, номер |
| `current` | Заливка `container/brand/default`, номер |
| `completed` | Заливка `container/brand/default`, галочка |
| `error` | Заливка `status/error/surface`, иконка ошибки |

---

## 5. Behavior

### Keyboard interaction (при `clickable`)

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на шаги |
| `Enter` / `Space` | Переход на шаг (только `completed`) |

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `<ol>` | — | Список шагов |
| `aria-label="Step N of M"` | — | Каждый шаг |
| `aria-current="step"` | — | Текущий шаг |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--stepper-indicator-upcoming` | Фон upcoming | `container/default` | `container/default` |
| `--stepper-indicator-current` | Фон current | `container/brand/default` | `container/brand/default` |
| `--stepper-indicator-completed` | Фон completed | `container/brand/default` | `container/brand/default` |
| `--stepper-indicator-error` | Фон error | `status/error/surface` | `status/error/surface` |
| `--stepper-icon-color` | Иконка/номер | `text/on-brand/primary` | `text/on-brand/primary` |
| `--stepper-icon-upcoming` | Номер upcoming | `text/tertiary` | `text/tertiary` |
| `--stepper-connector` | Линия-коннектор | `border/default` | `border/default` |
| `--stepper-connector-completed` | Коннектор completed | `border/brand/default` | `border/brand/default` |
| `--stepper-label-current` | Label current | `text/primary` | `text/primary` |
| `--stepper-label-upcoming` | Label upcoming | `text/tertiary` | `text/tertiary` |
| `--stepper-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
