# Search

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Search — поле поиска с автодополнением и отображением результатов. Расширенная версия Text Field типа `search`, дополненная выпадающим списком результатов, историей и подсказками.

### When to use

**Use** — для глобального поиска по приложению; для поиска в пределах раздела (таблица, список); для command palette.

**Don't use:**
- Для простого фильтра по одному полю — используйте **Text Field** типа `search`
- Для навигации по известной структуре — используйте **Breadcrumbs** или **Sidebar**

### Core principles

- **Мгновенная обратная связь** — результаты начинают появляться с 1–2 символов
- **История поиска** — показывайте последние запросы в пустом состоянии
- **Empty state** — объясняйте что искать, если запрос не дал результатов

---

## 2. Anatomy

```
┌─────────────────────────────────────┐
│ 🔍  Search...                  [×] │ ← input
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Recent searches                     │ ← recent-items
│  🕐 Previous query 1               │
│  🕐 Previous query 2               │
├─────────────────────────────────────┤
│ Suggestions                         │ ← suggested-items
│  💡 Suggestion A                   │
├─────────────────────────────────────┤
│ Results                             │ ← results-list
│  [icon] Result title               │
│         Subtitle / path            │
├─────────────────────────────────────┤
│ [Footer action]                     │ ← footer
└─────────────────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `input` | required | Поле ввода поискового запроса |
| `results-list` | conditional | Список найденных результатов |
| `recent-items` | optional | История поиска (при пустом запросе) |
| `suggested-items` | optional | Подсказки по запросу |
| `footer` | optional | «Показать все результаты», ссылка |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `inline` | Встроен в страницу. Результаты в выпадающем под полем |
| `overlay` | Открывается как полноэкранный оверлей. Для мобильных и глобального поиска |
| `command-palette` | Поиск + команды. Открывается по `⌘K`. Поддерживает действия |

---

## 4. States

### State types

- **data:** `empty`, `typing`, `loading`, `results`, `no-results`

| Состояние | Описание |
|---|---|
| `empty` | Поле пустое. Показываются recent-items или suggested-items |
| `typing` | Пользователь вводит запрос. Небольшая задержка (debounce) |
| `loading` | Идёт поиск. Spinner в поле или над результатами |
| `results` | Результаты найдены |
| `no-results` | Запрос не дал результатов. Empty state с объяснением |

---

## 5. Behavior

### Open / Close (из interaction-model.md)

**Открывается:** Focus на поле (inline), Click/`⌘K` (overlay / command-palette).
**Закрывается:** `Escape`, click outside, выбор результата.
**После закрытия:** фокус возвращается на trigger или остаётся на поле (inline).

### Debounce
Запрос к API отправляется с задержкой 200–300ms после последнего нажатия клавиши. Это снижает нагрузку и устраняет лишние запросы.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `↑` / `↓` | Навигация по результатам |
| `Enter` | Переход к выбранному результату |
| `Escape` | Очистить поле / закрыть оверлей |
| `Tab` | Переход к следующему интерактивному элементу |

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="combobox"` | — | Поле ввода |
| `aria-expanded` | `true` / `false` | Поле ввода |
| `aria-haspopup="listbox"` | — | Поле ввода |
| `role="listbox"` | — | Контейнер результатов |
| `role="option"` | — | Каждый результат |
| `aria-activedescendant` | ID активного | Поле ввода при навигации |
| `aria-busy="true"` | — | Состояние `loading` |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--search-input-bg` | Фон поля | `surface/default` | `surface/default` |
| `--search-input-border` | Граница поля | `border/default` | `border/default` |
| `--search-input-border-focus` | Граница focus | `border/brand/default` | `border/brand/default` |
| `--search-icon` | Иконка поиска | `text/tertiary` | `text/tertiary` |
| `--search-placeholder` | Placeholder | `text/muted` | `text/muted` |
| `--search-dropdown-bg` | Фон выпадающего | `surface/default` | `surface/default` |
| `--search-dropdown-shadow` | Тень выпадающего | `shadow/darker` | `shadow/darker` |
| `--search-result-title` | Заголовок результата | `text/primary` | `text/primary` |
| `--search-result-subtitle` | Подзаголовок | `text/tertiary` | `text/tertiary` |
| `--search-result-hover` | Фон hover | `surface/hover` | `surface/hover` |
| `--search-highlight` | Подсветка совпадения | `status/warning/container` | `status/warning/container` |
| `--search-section-title` | Заголовок секции | `text/tertiary` | `text/tertiary` |
| `--search-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
