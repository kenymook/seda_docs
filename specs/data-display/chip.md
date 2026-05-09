# Chip

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Chip — компактный контрол для отображения выбранных значений в Select multi или фильтрах. Состоит из текстового контента и контрола управления (стрелка или крестик удаления).

### When to use

**Use** — для отображения выбранных тегов в Select multi; для компактных фильтров с возможностью сброса; в полях ввода с множественным выбором.

**Don't use:**
- Для статичных меток без взаимодействия — используйте **Tag** типа `read-only`

---

## 2. Anatomy

```
┌──────────────────┐
│ chipItem  [ctrl] │
└──────────────────┘
  ↑ text + icon    ↑ arrow or ×
```

| Slot | Обязательность | Описание |
|---|---|---|
| `chipItem` | required | Текст + опциональная иконка |
| `chipControl` | required | Стрелка (expand) или × (delete) |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `default` | Прозрачный фон, граница |
| `filled` | Заливка фоном |

### chipControl варианты

| Вариант | Описание |
|---|---|
| `arrow` | Стрелка вниз — открытие связанного Select |
| `remove` | Крестик — удаление значения |

---

## 4. Sizes

Chip имеет один размер, соответствующий `small` в системе SEDA UI.

| Параметр | Значение |
|---|---|
| Height | 24px |
| Font | 12px / 16px |
| Radius | 6px |

---

## 5. States

| Состояние | Описание |
|---|---|
| `default` | Базовый вид |
| `hover` | Лёгкое затемнение |
| `active` | Момент нажатия |

---

## 6. Behavior

### Keyboard

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на chipControl |
| `Enter` / `Space` | Активация control (expand / remove) |
| `Delete` / `Backspace` | Удаление (если `remove`) |

---

## 7. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `aria-label="Удалить [значение]"` | — | chipControl с `remove` |
| `role="button"` | — | На chipControl |

---

## 8. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--chip-bg` | Фон default | `surface/default` | `surface/default` |
| `--chip-bg-filled` | Фон filled | `container/default` | `container/default` |
| `--chip-bg-hover` | Фон hover | `surface/hover` | `surface/hover` |
| `--chip-border` | Граница | `border/default` | `border/default` |
| `--chip-text` | Цвет текста | `text/primary` | `text/primary` |
| `--chip-control-icon` | Иконка control | `text/tertiary` | `text/tertiary` |
| `--chip-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
