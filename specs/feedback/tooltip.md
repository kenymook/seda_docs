# Tooltip

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Tooltip — всплывающая подсказка при наведении или фокусе на элементе. Кратко объясняет назначение элемента, не заменяя видимый label.

### When to use

**Use** — для icon-only кнопок (обязательно); для сокращённых или усечённых текстов; для элементов с неочевидным назначением.

**Don't use:**
- Для важной информации — пользователь не должен «открывать» критичное
- Для длинного текста — используйте Popover
- На мобильных без hover — Tooltip не работает без курсора

### Core principles

- **Только текст** — Tooltip не содержит интерактивных элементов
- **Без задержки открытия** — появляется сразу при hover / focus
- **Закрытие по Escape** — обязательно

---

## 2. Anatomy

```
  [Trigger element]
        ▲
┌───────────────┐
│  Tooltip text │
└───────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `content` | required | Текст подсказки (или кастомный HTML) |
| `arrow` | optional | Стрелка-указатель на триггер |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `default` | Тёмный фон, светлый текст |
| `light` | Светлый фон с рамкой. Для тёмных интерфейсов |

### Позиции

`top` · `bottom` · `left` · `right` · `top-start` · `top-end` · `bottom-start` · `bottom-end`

### Триггеры

`hover` · `focus` · `click`

---

## 4. Behavior

### Open / Close (из interaction-model.md)

**Открывается:** hover (delay ~0ms), focus.
**Закрывается:** mouseout, blur, `Escape`.

### Positioning
Автоматически смещается при выходе за края viewport (flip).

---

## 5. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="tooltip"` | — | Контейнер Tooltip |
| `aria-describedby` | ID tooltip | На trigger-элементе |
| Только описание | — | Не замещает `aria-label` |

---


---

## States

Tooltip has closed, open, delayed-open and educed-motion states. It opens from hover or focus trigger, closes on blur, pointer leave or Escape, and must not contain focusable controls.

---

## 6. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--tooltip-bg` | Фон default | `surface/inverse/default` | `surface/inverse/default` |
| `--tooltip-text` | Текст default | `text/on-inverse/primary` | `text/on-inverse/primary` |
| `--tooltip-light-bg` | Фон light | `surface/default` | `surface/default` |
| `--tooltip-light-text` | Текст light | `text/primary` | `text/primary` |
| `--tooltip-light-border` | Граница light | `border/default` | `border/default` |
| `--tooltip-shadow` | Тень | `shadow/base` | `shadow/base` |
