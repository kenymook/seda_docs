# Notification Center

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Notification Center — панель истории уведомлений. Открывается как оверлей или боковая панель при нажатии на иконку колокольчика. Показывает историю системных событий и действий.

### When to use

**Use** — в приложениях с активными уведомлениями: задачи, комментарии, изменения статусов, системные события.

**Don't use:**
- Для срочных уведомлений, требующих немедленного внимания — используйте **Toast** + Badge
- Для постоянных предупреждений — используйте **Alert** на странице

### Core principles

- **Непрочитанные выделены** — чёткое визуальное различие между `unread` и `read`
- **Сортировка по дате** — новые сверху
- **Bulk actions** — «Отметить все как прочитанные», «Очистить всё»

---

## 2. Anatomy

```
┌──────────────────────────────────┐
│ Notifications        [✓ All] [⚙] │ ← header
├──────────────────────────────────┤
│ [All] [Unread] [Mentions]        │ ← filter-tabs
├──────────────────────────────────┤
│ ● [icon] Title                   │ ← notification (unread)
│          Description · 2min ago  │
├──────────────────────────────────┤
│   [icon] Title                   │ ← notification (read)
│          Description · 1hr ago   │
├──────────────────────────────────┤
│         [Empty state]            │ ← empty-state
└──────────────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `header` | required | Заголовок + действия (отметить все, настройки) |
| `filter-tabs` | optional | Фильтры: Все / Непрочитанные / Упоминания |
| `notification-list` | required | Список уведомлений |
| `empty-state` | required | Контент при отсутствии уведомлений |

---

## 3. Types / Variants

### Типы элементов уведомления

| Тип | Описание |
|---|---|
| `info` | Нейтральное информационное |
| `success` | Успешное завершение |
| `warning` | Требует внимания |
| `error` | Ошибка или критическое событие |

### Состояния элемента

| Состояние | Описание |
|---|---|
| `unread` | Непрочитанное. Выделяется цветом или точкой |
| `read` | Прочитанное. Приглушённый вид |
| `dismissed` | Удалённое (анимация исчезновения) |

---

## 4. Behavior

### Open / Close (из interaction-model.md)

**Открывается:** Click на иконке колокольчика.
**Закрывается:** `Escape`, click outside, кнопка закрытия.

### Mark as read
Уведомление помечается как `read` при клике или явном действии. При открытии панели — можно автоматически помечать видимые.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Навигация по уведомлениям |
| `Enter` | Переход к связанному объекту |
| `Delete` | Dismiss уведомление |
| `Escape` | Закрыть панель |

---

## 5. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="dialog"` | — | Контейнер Notification Center |
| `aria-label="Notifications"` | — | Всегда |
| `aria-live="polite"` | — | Список (для новых уведомлений) |
| `aria-atomic="false"` | — | Добавляются элементы, не весь список |

---


---

## States

Notification Center can be empty, loading, has-unread, ll-read, error or offline. Individual notifications own read/unread, selected and dismissed states.

---

## 6. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--notif-center-bg` | Фон панели | `surface/default` | `surface/default` |
| `--notif-center-border` | Граница | `border/default` | `border/default` |
| `--notif-item-bg-unread` | Фон непрочитанного | `status/info/container` | `status/info/container` |
| `--notif-item-bg-read` | Фон прочитанного | `surface/default` | `surface/default` |
| `--notif-item-bg-hover` | Фон hover | `surface/hover` | `surface/hover` |
| `--notif-item-border` | Разделитель элементов | `border/default` | `border/default` |
| `--notif-dot-unread` | Точка непрочитанного | `status/info/surface` | `status/info/surface` |
| `--notif-title-unread` | Заголовок непрочитанного | `text/primary` | `text/primary` |
| `--notif-title-read` | Заголовок прочитанного | `text/secondary` | `text/secondary` |
| `--notif-time` | Временная метка | `text/tertiary` | `text/tertiary` |
| `--notif-header-border` | Граница под header | `border/default` | `border/default` |
