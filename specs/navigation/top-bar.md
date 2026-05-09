# Top Bar / Navbar

> **Category** · Navigation
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Top Bar — верхняя панель приложения с логотипом, основной навигацией и глобальными действиями. Постоянно присутствует на экране и даёт доступ к ключевым разделам и функциям.

### When to use

**Use** — как основная навигация для сайтов и несложных приложений; как глобальная шапка над Sidebar в продуктах.

**Don't use:**
- Как замену Sidebar для сложных продуктов с глубокой иерархией
- Для отображения контента страницы

### Core principles

- **Всегда на виду** — `app-bar` тип фиксируется при прокрутке
- **Минимум элементов** — Top Bar не место для всех действий. Только глобальные
- **Mobile-first collapse** — на мобильных навигация уходит в hamburger-меню

---

## 2. Anatomy

```
┌─────────────────────────────────────────────────────┐
│ [Logo]  [Nav link 1] [Nav link 2]   [🔍][🔔][👤]  │
└─────────────────────────────────────────────────────┘
  logo    primary-nav                  actions  avatar
```

| Slot | Обязательность | Описание |
|---|---|---|
| `logo` | required | Логотип или название продукта |
| `primary-nav` | optional | Основные навигационные ссылки |
| `search` | optional | Поисковая строка или кнопка поиска |
| `actions` | optional | Глобальные действия: уведомления, настройки |
| `avatar` | optional | Аватар текущего пользователя |
| `breadcrumbs` | optional | Хлебные крошки под основной строкой |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `app-bar` | Фиксированная панель. Остаётся при прокрутке. Добавляет `shadow/base` при scroll |
| `page-header` | В потоке страницы, не фиксируется. Для контентных страниц |
| `transparent` | Прозрачный фон. Для hero-зон поверх изображений |

---

## 4. States

| Состояние | Описание | Визуальное изменение |
|---|---|---|
| `default` | Стандартный вид | Базовые bg, border |
| `scrolled` | Страница прокручена (app-bar) | `shadow/base` появляется |
| `mobile-collapsed` | Навигация скрыта в hamburger | Показывается кнопка меню |

---

## 5. Behavior

### Keyboard interaction
Tab-навигация по всем интерактивным элементам слева направо. Skip link «Перейти к содержимому» — первый в tab-order.

### Mobile behavior
При ширине < breakpoint навигационные ссылки скрываются. Hamburger кнопка открывает Sidebar `overlay` или выпадающее меню. Логотип и actions остаются.

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `<header>` | — | Семантический тег |
| `<nav aria-label="Main">` | — | Блок навигации |
| `aria-current="page"` | — | Активная ссылка |
| Skip link | «Перейти к содержимому» | Первый в tab-order |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--topbar-bg` | Фон панели | `surface/default` | `surface/default` |
| `--topbar-border` | Нижняя граница | `border/default` | `border/default` |
| `--topbar-shadow` | Тень при scrolled | `shadow/base` | `shadow/base` |
| `--topbar-link-text` | Цвет nav-ссылок | `text/secondary` | `text/secondary` |
| `--topbar-link-text-hover` | Hover | `text/primary` | `text/primary` |
| `--topbar-link-text-active` | Активная | `text/primary` | `text/primary` |
| `--topbar-logo-color` | Цвет логотипа | `text/primary` | `text/primary` |
| `--topbar-focus-ring` | Кольцо фокуса | `focus/ring` | `focus/ring` |
