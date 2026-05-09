# Breadcrumbs

> **Category** · Navigation
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Breadcrumbs — цепочка навигации, показывающая положение пользователя в иерархии контента. Каждый элемент — это ссылка на родительский уровень. Последний элемент — текущая страница, она не кликабельна.

### When to use

**Use** — в приложениях с глубокой иерархией (3+ уровня): файловые менеджеры, CMS, e-commerce категории, настройки с вложенными разделами.

**Don't use:**
- На главной странице или в корне — нет смысла без родительских уровней
- Если структура плоская (1–2 уровня) — пользователь и так понимает контекст
- Вместо основной навигации — Breadcrumbs дополняют, не заменяют

### Core principles

- **Текущая страница не кликабельна** — последний элемент цепочки показывает контекст, а не навигацию
- **Коллапс при длинном пути** — при переполнении скрывайте средние уровни через многоточие, оставляя первый и последний
- **Разделитель — декорация** — не должен быть интерактивным или нести смысловую нагрузку

---

## 2. Anatomy

```
Home  ›  Products  ›  Electronics  ›  Laptops
 ↑           ↑             ↑              ↑
link        link          link        current (not clickable)

Collapsed:
Home  ›  ...  ›  Laptops
        [options button]
```

| Slot | Обязательность | Описание |
|---|---|---|
| `crumb-link` | required (1+) | Кликабельный элемент-предок |
| `crumb-current` | required | Текущая страница. Не кликабельна |
| `separator` | auto | Разделитель между элементами. `slash` или `triangle` |
| `options` | conditional | Кнопка «...» при коллапсе. Раскрывает скрытые уровни |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `ghost` | Интерактивные ссылки с фоном при hover. Для хедеров и выделенных зон навигации |
| `text` | Текстовые ссылки без фона, встраиваются в контент страницы |

### Разделители

| Вариант | Символ | Когда |
|---|---|---|
| `slash` | `/` | Нейтральный, универсальный |
| `triangle` | `›` | Более направленный, для иерархий |

### Modifiers

| Модификатор | Описание |
|---|---|
| `collapsed` | Средние уровни скрыты через `...` |
| `options` | Кнопка раскрытия свёрнутых уровней |

---

## 4. Sizes

| Size | Height (элемент) | Font / Line | Radius (ghost) | Контекст |
|---|---|---|---|---|
| `small` | 24px | 12px / 16px | 6px | Компактные хедеры |
| `medium` | 32px | 14px / 20px | 8px | Стандартный хедер — дефолт |
| `large` | 40px | 16px / 24px | 10px | Крупные страницы, лендинги |
| `extraLarge` | 48px | 18px / 28px | 12px | Hero-зоны |

---

## 5. States

### State types

- **interaction:** `hover`, `focus`, `pressed`
- **selection:** `active` (текущая страница)
- **availability:** `disabled`

### State matrix (на элемент-ссылку)

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Ссылка-предок, не наведена | Цвет `text/tertiary` или `link/default` |
| `hover` | Курсор над ссылкой | Цвет `link/hover`, фон для `ghost`-типа |
| `active` | Текущая страница (last crumb) | Цвет `text/primary`, не кликабельна |
| `pressed` | Нажатие ссылки | Цвет `link/pressed` |
| `focus` | Фокус клавиатуры | Кольцо `focus/ring` |
| `disabled` | Уровень недоступен | `status/disabled/text`, cursor `default` |

### Valid state combinations

| Комбинация | Допустимо | Примечание |
|---|---|---|
| `hover` + `focus` | ✓ | Tab-навигация при наведении |
| `active` + любое интерактивное | ✗ | Текущая страница не взаимодействует |
| `disabled` + `hover` | ✗ | `disabled` отменяет интерактивность |

---

## 6. Details on Types / Variants

### ghost
Каждый элемент-ссылка имеет фоновую заливку при hover — `surface/hover`. Скругление через `border-radius`. Подходит для хедеров с выраженным фоном.

### text
Ссылки без фона. Подчёркивание при hover как сигнал интерактивности. Встраивается в текстовый контент, не выбивается из потока.

### Collapsed + options
При длинном пути (более N уровней) средние уровни заменяются кнопкой `...` (`options`). По клику — раскрывается dropdown или инлайн-список промежуточных уровней. Всегда оставляйте первый и последний элементы видимыми.

---

## 7. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса между ссылками |
| `Enter` | Переход по ссылке |
| `Enter` / `Space` | Раскрытие кнопки `options` |

### Overflow handling
Определяйте коллапс на основе доступной ширины контейнера. При resize — пересчитывать. Приоритет видимости: первый крамб и текущий (последний) — всегда видны.

---

## 8. Accessibility

### Screen reader

| Атрибут | Значение | Когда |
|---|---|---|
| `<nav aria-label="Breadcrumb">` | — | Обёртка всей цепочки |
| `<ol>` / `<li>` | — | Список элементов |
| `aria-current="page"` | — | Текущая страница (last crumb) |
| `aria-label="Ещё уровни"` | — | Кнопка `options` |
| `aria-expanded` | `true` / `false` | Кнопка `options` при раскрытии |

### Visual
- Контрастность ссылок: минимум 4.5:1
- Разделитель (`/` или `›`) — декоративный, `aria-hidden="true"`
- Текущий элемент не ссылка — не передаётся только цветом, отсутствие hover / underline тоже сигнализирует

---

## 9. Design Tokens

### Foreground

| Component token | Figma token | Роль | Semantic |
|---|---|---|---|
| `--breadcrumb-link-color` | `breadcrumbs/foreground/default` | Ссылка-предок default | `text/tertiary` |
| `--breadcrumb-link-color-hover` | `breadcrumbs/foreground/hover` | Ссылка hover | `text/primary` |
| `--breadcrumb-link-color-disabled` | `breadcrumbs/foreground/disabled` | Ссылка disabled | `status/disabled/text` |
| `--breadcrumb-current-color` | — | Текущая страница (not clickable) | `text/primary` |
| `--breadcrumb-link-color-pressed` | — | Ссылка pressed | `link/pressed` |

### Surface (ghost type)

| Component token | Figma token | Роль | Semantic |
|---|---|---|---|
| `--breadcrumb-ghost-bg` | `breadcrumbs/surface/default` | Фон default | `transparent` |
| `--breadcrumb-ghost-bg-hover` | `breadcrumbs/surface/hover` | Фон hover | `container/hover` |
| `--breadcrumb-ghost-bg-pressed` | `breadcrumbs/surface/pressed` | Фон pressed | `container/pressed` |
| `--breadcrumb-ghost-bg-disabled` | `breadcrumbs/surface/disabled` | Фон disabled | `transparent` |

### Separator & Shared

| Component token | Figma token | Роль | Semantic |
|---|---|---|---|
| `--breadcrumb-separator-color` | — | Цвет разделителя | `text/tertiary` |
| `--breadcrumb-focus-ring` | `breadcrumbs/focus/ring` | Кольцо фокуса | `focus/ring` |
