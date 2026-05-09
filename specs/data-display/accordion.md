# Accordion

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Accordion — набор сворачиваемых секций контента. Позволяет скрывать редко используемый контент и экономить пространство.

### When to use

**Use** — для FAQ, разделов настроек, групп фильтров, длинных форм с группировкой полей.

**Don't use:**
- Когда весь контент важен — скрытие важного контента снижает его доступность
- Для навигации — используйте Tabs или Sidebar

### Core principles

- **Тип `single`** — в любой момент открыт только один элемент. Клик на новый закрывает предыдущий
- **Тип `multiple`** — несколько элементов могут быть открыты одновременно
- **Анимация** — открытие/закрытие через `height` transition или `grid-template-rows` transition

---

## 2. Anatomy

```
┌───────────────────────────────┬───┐
│ Header / Title                │ ▼ │ ← trigger (кликабельна вся строка)
├───────────────────────────────┴───┤
│ Content panel                     │ ← panel (скрыта / видима)
└───────────────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `trigger` | required | Заголовок секции с иконкой раскрытия |
| `panel` | required | Содержимое секции |
| `icon` | auto | Шеврон, меняющийся при открытии/закрытии |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `single` | Открыт один элемент одновременно |
| `multiple` | Несколько элементов могут быть открыты |

### Варианты оформления

| Вариант | Описание |
|---|---|
| `default` | Только горизонтальные разделители |
| `bordered` | Полная рамка вокруг каждого элемента |
| `elevated` | С тенью, карточный стиль |

---

## 4. States (на элемент)

### State types

- **interaction:** `hover`, `focus`
- **data:** `expanded`, `collapsed`
- **availability:** `disabled`

| Состояние | Описание |
|---|---|
| `collapsed` | Панель скрыта, шеврон вправо/вниз |
| `expanded` | Панель видима, шеврон повёрнут |
| `hover` | Курсор над trigger |
| `focus` | `focus/ring` на trigger |
| `disabled` | Trigger неактивен |

---

## 5. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на trigger |
| `Enter` / `Space` | Открыть / закрыть панель |
| `↑` / `↓` | Переход между trigger-ами |
| `Home` | Первый trigger |
| `End` | Последний trigger |

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="button"` | — | Trigger (если не `<button>`) |
| `aria-expanded` | `true` / `false` | Trigger |
| `aria-controls` | ID panel | Trigger → связанная панель |
| `aria-hidden` | `true` | Скрытая панель |
| `id` | — | На panel (для `aria-controls`) |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--accordion-trigger-bg` | Фон trigger | `surface/default` | `surface/default` |
| `--accordion-trigger-bg-hover` | Фон hover | `surface/hover` | `surface/hover` |
| `--accordion-trigger-text` | Цвет заголовка | `text/primary` | `text/primary` |
| `--accordion-icon` | Цвет шеврона | `text/tertiary` | `text/tertiary` |
| `--accordion-border` | Разделитель | `border/default` | `border/default` |
| `--accordion-panel-bg` | Фон панели | `surface/default` | `surface/default` |
| `--accordion-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--accordion-disabled-text` | Текст disabled | `status/disabled/text` | `status/disabled/text` |
