# Card

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Card — контейнер для группировки связанного контента и действий. Визуально ограничивает единицу информации и создаёт сетку однотипных объектов.

### When to use

**Use** — для отображения сущностей в сетке или списке: товары, пользователи, статьи, проекты; для группировки формы или виджета на странице.

**Don't use:**
- Для структурирования всей страницы — используйте layout-примитивы
- Для разделения длинного текста — используйте типографику и отступы

### Core principles

- **Одна сущность — одна карточка** — Card объединяет данные об одном объекте
- **Консистентная высота** — в сетке все карточки одинаковой высоты
- **Кликабельная карточка** — только тип `clickable`, не оборачивайте произвольный контент в `<a>`

---

## 2. Anatomy

```
┌─────────────────────────────┐
│ [media]                     │ ← media (изображение, превью)
├─────────────────────────────┤
│ [badge]  Header             │ ← header
│          Subtitle           │
├─────────────────────────────┤
│ Body content                │ ← body
│ Description text            │
├─────────────────────────────┤
│ [Action 1]  [Action 2]      │ ← footer + actions
└─────────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `media` | optional | Изображение, видео, превью |
| `badge` | optional | Badge на карточке (статус, тип) |
| `header` | optional | Заголовок и подзаголовок |
| `body` | required | Основное содержимое |
| `footer` | optional | Мета-информация, дата |
| `actions` | optional | Кнопки действий |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `default` | Стандартная карточка с границей |
| `clickable` | Вся карточка — кнопка/ссылка. Hover + cursor pointer |
| `selected` | Выбранная карточка. Акцентная граница |
| `outlined` | Только граница без тени или заливки |
| `elevated` | С тенью вместо границы |

---

## 4. States

### State types

- **interaction:** `hover`, `focus`, `active` (для `clickable`)
- **selection:** `selected`
- **availability:** `disabled`

| Состояние | Применимые типы | Визуальное изменение |
|---|---|---|
| `default` | Все | Базовый вид |
| `hover` | `clickable` | `shadow/darker`, лёгкий подъём |
| `active` | `clickable` | `surface/pressed` |
| `focus` | `clickable` | `focus/ring` |
| `selected` | `selected` | Граница `border/brand/default` 2px |
| `disabled` | Все | `status/disabled/text`, `status/disabled/container`, `status/disabled/border`, `pointer-events: none` |

---

## 5. Behavior

### Clickable card
Вся карточка — нативный `<a>` или `<button>`. `role="article"` или `role="link"`. Внутренние действия (кнопки) — `e.stopPropagation()`.

### Keyboard interaction (`clickable`)

| Клавиша | Действие |
|---|---|
| `Tab` | Фокус на карточку |
| `Enter` | Переход / активация |
| `Space` | Активация (тип `button`) |

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="article"` | — | Самостоятельная единица контента |
| `aria-label` | Описание карточки | Для `clickable` без видимого заголовка |
| `aria-selected` | `true` / `false` | Для `selected` в группе |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--card-bg` | Фон | `surface/default` | `surface/default` |
| `--card-border` | Граница | `border/default` | `border/default` |
| `--card-border-selected` | Граница selected | `border/brand/default` | `border/brand/default` |
| `--card-shadow` | Тень elevated | `shadow/base` | `shadow/base` |
| `--card-shadow-hover` | Тень hover | `shadow/darker` | `shadow/darker` |
| `--card-radius` | Скругление | `border-radius-lg` | `border-radius-lg` |
| `--card-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
| `--card-disabled-bg` | Фон disabled | `status/disabled/surface` | `status/disabled/surface` |
