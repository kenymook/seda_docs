# Pagination

> **Category** · Navigation
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Pagination — навигация по страницам в таблицах и списках. Позволяет пользователю перемещаться между порциями данных.

### When to use

**Use** — для таблиц и списков с большим количеством записей (> 20–50), когда нужно разбить данные на страницы.

**Do not use:**
- До 20 записей — показывайте все сразу
- Для контента с бесконечной лентой — используйте тип `infinite-scroll`
- Вместо фильтрации — Pagination не заменяет поиск

### Core principles

- **Текущая страница всегда видна** — пользователь понимает своё положение
- **Размер страницы управляем** — предоставляйте возможность менять `page-size`
- **Быстрый переход** — для длинных списков добавляйте `jump-to-page`

---

## 2. Anatomy

```
[←] [1] [2] [●3] [4] [5] [...] [24] [→]
Показано 41–60 из 480        Строк на стр: [20 ▼]
```

| Slot | Обязательность | Описание |
|---|---|---|
| `prev-button` | required | Кнопка «Предыдущая страница» |
| `next-button` | required | Кнопка «Следующая страница» |
| `page-items` | conditional | Пронумерованные кнопки страниц (тип `numbered`) |
| `ellipsis` | conditional | `...` при большом числе страниц |
| `total-count` | optional | «Показано X–Y из Z» |
| `page-size-select` | optional | Выпадающий список кол-ва строк на странице |
| `jump-to-page` | optional | Поле ввода номера страницы |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `numbered` | Пронумерованные кнопки страниц + Prev/Next |
| `prev-next-only` | Только кнопки «‹» и «›». Компактный вариант |
| `load-more` | Кнопка «Загрузить ещё» под списком |
| `infinite-scroll` | Автозагрузка при достижении низа списка |

---

## 4. Sizes

| Size | Button height | Font / Line | Контекст |
|---|---|---|---|
| `small` | 24px | 12px / 16px | Компактные таблицы |
| `medium` | 32px | 14px / 20px | Стандартные таблицы — дефолт |
| `large` | 40px | 16px / 24px | Акцентные списки |

---

## 5. States (кнопка страницы)

### State types

- **interaction:** `hover`, `focus`, `active` (момент клика)
- **selection:** `selected` (текущая страница)
- **availability:** `disabled`

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Страница доступна | Базовые bg, border, text |
| `hover` | Курсор над кнопкой | `surface/subtle` |
| `active` | Нажатие | `surface/sunken` |
| `selected` | Текущая страница | Заливка `container/brand/default` |
| `focus` | Фокус клавиатуры | `focus/ring` |
| `disabled` | Prev на первой / Next на последней | `status/disabled/text`, `status/disabled/container`, `status/disabled/border` |

---

## 6. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса между кнопками |
| `Enter` / `Space` | Переход на страницу |

### Ellipsis
При > 7 страницах средние скрываются в `...`. Всегда показывайте первую и последнюю страницу. Эллипсис — не кликабелен, но можно сделать popup с вводом номера.

---

## 7. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `<nav aria-label="Pagination">` | — | Обёртка |
| `aria-current="page"` | — | Текущая страница |
| `aria-label="Страница 3"` | — | Каждая кнопка страницы |
| `aria-label="Предыдущая страница"` | — | Кнопка Prev |
| `aria-label="Следующая страница"` | — | Кнопка Next |
| `aria-disabled="true"` | — | Disabled кнопки |

---

## 8. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--pagination-bg` | Фон кнопки default | `surface/base` | `surface/base` |
| `--pagination-bg-hover` | Фон hover | `surface/subtle` | `surface/subtle` |
| `--pagination-bg-selected` | Фон текущей страницы | `container/brand/default` | `container/brand/default` |
| `--pagination-text` | Цвет текста | `text/secondary` | `text/secondary` |
| `--pagination-text-selected` | Текст текущей | `text/on-brand/primary` | `text/on-brand/primary` |
| `--pagination-border` | Граница | `border/default` | `border/default` |
| `--pagination-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--pagination-disabled-text` | Текст disabled | `status/disabled/text` | `status/disabled/text` |


---

## Related specifications / Связанные спецификации

- [Table](../specs/data-display/table.md) — основной потребитель Pagination.
- [Button](../specs/actions/button.md) — навигационные действия.
- [Icon Button](../specs/actions/icon-button.md) — компактные controls.

