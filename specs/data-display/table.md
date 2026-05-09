# Table

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Table — структурированное отображение данных в строках и столбцах. Позволяет сравнивать, сортировать, фильтровать и выбирать записи.

### When to use

**Use** — для отображения списков объектов с несколькими атрибутами: пользователи, заказы, транзакции, товары.

**Don't use:**
- Для 1–2 атрибутов — используйте список или карточки
- Для отношений между данными — используйте Charts или Description List

### Core principles

- **Сортировка по клику на заголовок** — пользователь ожидает этого поведения
- **Фиксированный хедер** — при скролле хедер остаётся виден
- **Empty state** — всегда показывайте заглушку при отсутствии данных

---

## 2. Anatomy

```
┌─────────────────────────────────────────────────────┐
│  [Toolbar: search, filters, actions]                │ ← toolbar
├────────┬─────────────────┬─────────────────────────┤
│  [☐]  │  Name ↑↓        │  Status       Actions   │ ← header
├────────┼─────────────────┼─────────────────────────┤
│  [☐]  │  John Doe       │  ● Active     [Edit]    │ ← row
│  [☑]  │  Jane Smith     │  ○ Inactive   [Edit]    │ ← selected row
│  [☐]  │  Bob Lee        │  ● Active     [Edit]    │
├────────┴─────────────────┴─────────────────────────┤
│  [Pagination]                      Showing 1–20/80 │ ← footer
└─────────────────────────────────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `toolbar` | optional | Поиск, фильтры, массовые действия |
| `header` | required | Заголовки столбцов |
| `body` | required | Строки с данными |
| `footer` | optional | Pagination, итоги |
| `empty-state` | required | Контент при отсутствии данных |

---

## 3. Types / Variants

### Типы ячеек

| Тип | Описание |
|---|---|
| `text` | Текстовое значение |
| `tag` | Tag компонент |
| `avatar` | Avatar + имя |
| `badge` | Badge с числом |
| `actions` | Кнопки действий строки |
| `checkbox` | Checkbox выбора строки |
| `custom` | Произвольный контент |

### Типы заголовков

| Тип | Описание |
|---|---|
| `label` | Простая текстовая метка |
| `sortable` | Кликабельный, с иконкой сортировки |
| `filter` | С возможностью фильтрации |

### Модификаторы таблицы

`fixed-header` · `striped` · `bordered` · `compact` · `resizable-columns` · `row-selection` · `expandable-rows`

---

## 4. States (строка)

### State types

- **interaction:** `hover`
- **selection:** `selected`
- **data:** `expanded`

| Состояние | Описание |
|---|---|
| `default` | Стандартная строка |
| `hover` | Курсор над строкой, фон `surface/hover` |
| `selected` | Строка выбрана через checkbox, фон `container/brand/default` с низкой прозрачностью |
| `expanded` | Строка раскрыта (expandable row) |

---

## 5. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Перемещение между интерактивными ячейками |
| `Space` | Выбор строки (если row-selection) |
| `Enter` | Открытие строки / активация действия |

### Sorting
По клику на заголовок сортируемого столбца: `none` → `asc` → `desc` → `none`. Иконка показывает направление.

### Row selection
Чекбокс в хедере — `indeterminate` / `checked` / `unchecked` в зависимости от выбора строк.

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="table"` / `<table>` | — | Контейнер |
| `<th scope="col">` | — | Заголовки столбцов |
| `aria-sort` | `ascending` / `descending` / `none` | Сортируемый заголовок |
| `aria-selected` | `true` / `false` | Выбранная строка |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--table-header-bg` | Фон хедера | `surface/default` | `surface/default` |
| `--table-header-text` | Текст заголовка | `text/secondary` | `text/secondary` |
| `--table-header-border` | Граница под хедером | `border/inverse/default` | `border/inverse/default` |
| `--table-row-border` | Граница строк | `border/default` | `border/default` |
| `--table-row-hover` | Фон hover | `surface/hover` | `surface/hover` |
| `--table-row-selected` | Фон selected | `status/info/container` | `status/info/container` |
| `--table-row-striped` | Фон чётных строк | `surface/default` | `surface/default` |
| `--table-cell-text` | Цвет текста ячейки | `text/primary` | `text/primary` |
| `--table-sort-icon` | Иконка сортировки | `text/tertiary` | `text/tertiary` |
| `--table-sort-icon-active` | Активная сортировка | `text/primary` | `text/primary` |
