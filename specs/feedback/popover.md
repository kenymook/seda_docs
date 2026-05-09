# Popover

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Popover — расширенная подсказка с интерактивным содержимым. В отличие от Tooltip, содержит кликабельные элементы: меню, списки, формы, действия.

### When to use

**Use** — для контекстных меню при наведении, детальных карточек пользователя, форм быстрого редактирования, фильтров.

**Don't use:**
- Для простого текста — используйте **Tooltip**
- Для блокирующих действий — используйте **Modal**

### Core principles

- **Закрытие по Escape и click outside** (из interaction-model.md)
- **Фокус переходит внутрь** при открытии по click
- **Не вкладывать Popover в Popover**

---

## 2. Anatomy

```
  [Trigger]
      ▲
┌──────────────────┐
│ [icon]  Header   │
│ ─────────────    │
│ Content / Form   │
│ [Action button]  │
└──────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `content` | required | Произвольный контент |
| `header` | optional | Заголовок Popover |
| `footer` | optional | Кнопки действий |
| `arrow` | optional | Стрелка-указатель |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `default` | Произвольный контент |
| `icon` | Содержит иконки с действиями |
| `emoji` | Emoji-picker |
| `checkbox` | Список чекбоксов |
| `avatar` | Карточка пользователя |
| `custom` | Полностью кастомный контент |

### Позиции

`top` · `bottom` · `left` · `right` + варианты `start` / `end`

### Триггеры

`click` · `hover`

---

## 4. States

| Состояние | Описание |
|---|---|
| `closed` | Скрыт |
| `open` | Видим, интерактивен |

---

## 5. Behavior

### Open / Close (из interaction-model.md)

**Открывается:** Click или hover (зависит от конфигурации).
**Закрывается:** `Escape`, click outside, явное действие.
**После закрытия:** фокус возвращается на trigger.

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="dialog"` | — | При наличии интерактивного контента |
| `aria-expanded` | `true` / `false` | Trigger |
| `aria-haspopup="dialog"` | — | Trigger |
| `aria-label` | Описание | Popover без видимого заголовка |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--popover-bg` | Фон | `surface/default` | `surface/default` |
| `--popover-border` | Граница | `border/default` | `border/default` |
| `--popover-shadow` | Тень | `shadow/darker` | `shadow/darker` |
| `--popover-title` | Заголовок | `text/primary` | `text/primary` |
| `--popover-separator` | Разделитель | `border/default` | `border/default` |
