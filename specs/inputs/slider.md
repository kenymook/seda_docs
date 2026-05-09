# Slider

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Slider — контрол для выбора числового значения в непрерывном диапазоне. Используется когда точное число менее важно, чем относительное положение: громкость, яркость, уровень прозрачности, возрастной фильтр.

### When to use

**Use** — когда важен диапазон и относительное значение, а не точное число; для настроек восприятия (размер, скорость); для фильтрации по диапазону.

**Don't use:**
- Когда нужно точное конкретное число — используйте **Text Field** с `type="number"`
- Когда диапазон неизвестен пользователю и контекст не ясен

### Core principles

- **Показывайте текущее значение** — подсказка над thumb или inline-инпут
- **Заметные шаги** — если используете `step`, визуализируйте через `with-steps`
- **Доступный диапазон** — всегда отображайте `min` и `max`

---

## 2. Anatomy

```
Label
  min  ●──────────────○  max
        [value tooltip]

Range:
  min  ○──●────────●──○  max
```

| Slot | Обязательность | Описание |
|---|---|---|
| `track` | required | Горизонтальная дорожка |
| `thumb` | required | Ползунок(и) |
| `fill` | auto | Заполненная часть дорожки |
| `label` | optional | Метка контрола |
| `value-tooltip` | conditional | Подсказка с текущим значением при drag |
| `min-label` | conditional | Метка минимального значения |
| `max-label` | conditional | Метка максимального значения |
| `input` | conditional | Числовой инпут для точного ввода (`with-input`) |
| `steps` | conditional | Точки шагов на дорожке (`with-steps`) |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `single` | Один ползунок. Value — число |
| `range` | Два ползунка. Value — массив [min, max] |

### Modifiers

| Модификатор | Описание |
|---|---|
| `with-input` | Числовой инпут рядом для точного ввода |
| `with-labels` | Метки min/max под дорожкой |
| `with-steps` | Точки шагов на дорожке |

---

## 4. Sizes

Slider не использует стандартную height-систему. Размеры специфичны для компонента.

| Параметр | Значение |
|---|---|
| Track height | 4px |
| Thumb size | 16px (дефолт) |
| Touch-target thumb | 44×44px |

---

## 5. States

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Исходный вид | Track: fill/empty, thumb без тени |
| `hover` | Курсор над thumb | Thumb увеличивается, тень |
| `active` | Drag thumb | Tooltip с текущим значением, thumb активен |
| `focus` | Фокус клавиатуры | `focus/ring` на thumb |
| `disabled` | Недоступен | `status/disabled/text`, `status/disabled/container`, `status/disabled/border`, cursor `not-allowed` |

---

## 6. Details on Types / Variants

### single
Thumb перемещается от `min` до `max`. Заполненная часть дорожки — от левого края до thumb.

### range
Два thumb: `start` и `end`. Они не могут перекрываться (`start <= end`). Заполненная часть — между двумя thumb.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на thumb |
| `→` / `↑` | Увеличить на `step` |
| `←` / `↓` | Уменьшить на `step` |
| `Home` | Перейти к `min` |
| `End` | Перейти к `max` |

---

## 8. Accessibility

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `role="slider"` | — | Нативный `<input type="range">` |
| `aria-valuemin` | min | Всегда |
| `aria-valuemax` | max | Всегда |
| `aria-valuenow` | текущее | Всегда |
| `aria-valuetext` | «50%» / «$200» | Когда число требует единицы |
| `aria-label` | Описание | Если нет видимого label |

---

## 9. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--slider-track-empty` | Незаполненная дорожка | `container/default` | `container/default` |
| `--slider-track-fill` | Заполненная дорожка | `container/brand/default` | `container/brand/default` |
| `--slider-thumb` | Цвет ползунка | `surface/brand/default` | `surface/brand/default` |
| `--slider-thumb-border` | Граница ползунка | `border/brand/default` | `border/brand/default` |
| `--slider-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--slider-disabled-track` | Дорожка disabled | `status/disabled/container` | `status/disabled/container` |
| `--slider-disabled-thumb` | Thumb disabled | `status/disabled/surface` | `status/disabled/surface` |
