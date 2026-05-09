# Sidebar / Navigation Menu

> **Category** · Navigation
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Sidebar — боковая панель навигации с иерархическим списком разделов приложения. Основной навигационный элемент для сложных продуктов с множеством разделов.

### When to use

**Use** — для приложений с несколькими основными разделами, вложенной навигацией, постоянным доступом к разделам.

**Don't use:**
- Для простых сайтов с 3–4 страницами — используйте Top Bar
- Для мобильных устройств в открытом состоянии — используйте тип `overlay`

### Core principles

- **Активный раздел всегда виден** — при коллапсе Sidebar показывает только иконки, активный раздел остаётся подсвеченным
- **Группировка** — разделяйте навигационные элементы на логические группы с заголовками
- **Footer-элементы** — настройки профиля, выход, помощь — всегда внизу

---

## 2. Anatomy

```
┌──────────────────┐
│ [Logo]           │ ← logo-area
├──────────────────┤
│ 📊 Dashboard     │ ← item (active)
│ 👥 Users       ▸ │ ← item with children
│   └ All users    │ ← sub-item
│   └ Roles        │
│ ─────────────    │ ← divider
│ ⚙ Settings      │ ← section-title + items
│   └ General      │
│   └ Security     │
├──────────────────┤
│ [👤 Profile]     │ ← footer-items
│ [← Collapse]     │ ← collapse-trigger
└──────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `logo-area` | optional | Логотип или название продукта |
| `navigation-items` | required | Основные навигационные элементы |
| `item` | required | Отдельный пункт навигации |
| `group` | optional | Группа связанных пунктов |
| `sub-item` | optional | Вложенный элемент |
| `section-title` | optional | Заголовок группы элементов |
| `divider` | optional | Разделитель между группами |
| `footer-items` | optional | Элементы в нижней части |
| `collapse-trigger` | optional | Кнопка сворачивания Sidebar |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `fixed` | Постоянно видима, занимает место в layout |
| `collapsible` | Сворачивается до иконок или полностью скрывается |
| `overlay` | Накрывает контент. Для мобильных или временных задач |

### Варианты элемента

| Вариант | Описание |
|---|---|
| `item` | Простой элемент — иконка + label |
| `group` | Раскрываемая группа с дочерними sub-items |
| `sub-item` | Дочерний элемент под group |
| `section-title` | Некликабельный заголовок секции |
| `divider` | Горизонтальная линия-разделитель |

---

## 4. Sizes

| Size | Item height | Font / Line | Контекст |
|---|---|---|---|
| `compact` | 32px | 14px / 20px | Плотные продуктовые интерфейсы |
| `default` | 40px | 14px / 20px | Стандартный SaaS — дефолт |
| `comfortable` | 48px | 16px / 24px | Просторные интерфейсы |

---

## 5. States (на элемент)

### State types

- **interaction:** `hover`, `focus`
- **selection:** `active` (текущий раздел)
- **data:** `expanded` / `collapsed` (для групп)
- **availability:** `disabled`

### State matrix

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Обычный элемент | Цвет `text/secondary` |
| `hover` | Курсор над элементом | Фон `surface/hover`, цвет `text/primary` |
| `active` | Текущий раздел | Фон `container/default`, цвет `text/primary`, accent-bar слева |
| `focus` | Фокус клавиатуры | `focus/ring` |
| `expanded` | Группа раскрыта | Стрелка вниз, показаны sub-items |
| `collapsed` | Группа свёрнута | Стрелка вправо, sub-items скрыты |
| `disabled` | Элемент недоступен | `status/disabled/text` |

---

## 6. Behavior

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещение фокуса |
| `Enter` / `Space` | Активация или раскрытие группы |
| `→` | Раскрыть группу |
| `←` | Свернуть группу |
| `↑` / `↓` | Навигация между видимыми элементами |

### Collapsible behavior
При сворачивании: ширина уменьшается до ширины иконок (~48–56px). Лейблы скрыты, иконки остаются. Tooltip на каждой иконке показывает название раздела. Активный раздел подсвечен.

### Overlay behavior
Открывается по триггеру (hamburger). Закрывается по `Escape` или click outside. При открытии фокус перемещается внутрь Sidebar.

---

## 7. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `<nav aria-label="Main navigation">` | — | Обёртка |
| `aria-current="page"` | — | Активный элемент |
| `aria-expanded` | `true` / `false` | Группа с sub-items |
| `aria-haspopup="true"` | — | Элемент с sub-items |
| `role="menuitem"` | — | Навигационный элемент |

---

## 8. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--sidebar-bg` | Фон панели | `surface/default` | `surface/default` |
| `--sidebar-item-text` | Текст элемента | `text/secondary` | `text/secondary` |
| `--sidebar-item-text-hover` | Текст hover | `text/primary` | `text/primary` |
| `--sidebar-item-text-active` | Текст активного | `text/primary` | `text/primary` |
| `--sidebar-item-bg-hover` | Фон hover | `surface/hover` | `surface/hover` |
| `--sidebar-item-bg-active` | Фон активного | `container/default` | `container/default` |
| `--sidebar-item-accent` | Accent-bar активного | `border/brand/default` | `border/brand/default` |
| `--sidebar-icon` | Цвет иконки | `text/tertiary` | `text/tertiary` |
| `--sidebar-icon-active` | Иконка активного | `text/primary` | `text/primary` |
| `--sidebar-section-title` | Заголовок секции | `text/tertiary` | `text/tertiary` |
| `--sidebar-divider` | Разделитель | `border/default` | `border/default` |
| `--sidebar-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
