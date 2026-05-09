# Grid

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Grid — сетка для компоновки интерфейса. Обеспечивает визуальное выравнивание и ритм между элементами.

### When to use

**Use** — для лейаута страниц с несколькими колонками, карточных сеток, форм с выравниванием.

### Core principles

- **12-column как базис** — все элементы выравниваются по 12-колоночной сетке
- **Адаптивность** — количество колонок меняется по брейкпоинтам
- **Gap, не margin** — отступы между элементами через `gap`, не внешний margin

---

## 2. Anatomy

```
|  col  |  col  |  col  |  col  |  col  |  col  |
|←gap→| |←gap→| |←gap→| |←gap→| |←gap→|
```

| Параметр | Описание |
|---|---|
| `columns` | Количество колонок (1–12) |
| `gap` | Отступ между элементами |
| `gutter` | Отступ снаружи сетки |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `12-column` | Фиксированная 12-колоночная сетка |
| `auto` | CSS Grid `auto-fill` / `auto-fit` для адаптивных карточек |

### Брейкпоинты

| Брейкпоинт | Width | Колонок (рекомендация) |
|---|---|---|
| `xs` | 320px | 4 |
| `sm` | 640px | 4 |
| `md` | 768px | 8 |
| `lg` | 1024px | 12 |
| `xl` | 1280px | 12 |
| `2xl` | 1440px | 12 |

---


---

## States

Grid is a layout primitive and has no interactive states. Responsive column changes are layout behavior, not component states. Nested cards, rows or controls own their own states.

---


---

## Accessibility

Grid as layout should not use ARIA grid roles. Preserve DOM reading order across breakpoints. Use CSS layout for columns and keep keyboard focus order consistent with visual order.

---

## 4. Design Tokens

Grid использует только spacing-токены.

| Параметр | Стандартные значения |
|---|---|
| `gap` | 8px / 12px / 16px / 24px / 32px |
| `gutter` | Соответствует Container padding |
