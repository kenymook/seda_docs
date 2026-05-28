# Drawer

> **Category** · Navigation
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Drawer — панель, выезжающая с края экрана. Используется для дополнительного контента, настроек, фильтров, деталей объекта — не блокируя основной контент полностью.

### When to use

**Use** — для фильтров таблицы, деталей записи, настроек, форм создания/редактирования без перехода на новую страницу.

**Do not use:**
- Для критически важных действий, требующих фокуса — используйте **Modal**
- Для коротких одношаговых подтверждений — используйте **Modal** типа `confirmation`
- Для основной навигации — используйте **Sidebar**

### Core principles

- **Overlay или смещение** — Drawer может перекрывать контент или смещать его (push-режим)
- **Закрытие предсказуемо** — всегда по `Escape`, кнопке закрытия и клику вне панели
- **Фокус управляем** — при открытии фокус уходит в Drawer, при закрытии — возвращается на триггер

---

## 2. Anatomy

```
Left / Right:              Bottom:
┌────────┬──────────────┐  ┌──────────────────────────┐
│ Header │              │  │ Handle (drag indicator)  │
│ ─────  │   Main       │  ├──────────────────────────┤
│ Body   │   content    │  │ Header                   │
│        │              │  │ ─────                    │
│ ─────  │              │  │ Body                     │
│ Footer │              │  │ ─────                    │
└────────┴──────────────┘  │ Footer                   │
                           └──────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `header` | optional | Заголовок панели + кнопка закрытия |
| `body` | required | Основное содержимое |
| `footer` | optional | Кнопки действий |
| `handle` | conditional | Визуальный хэндл для `bottom` |

---

## 3. Types / Variants

| Позиция | Описание |
|---|---|
| `left` | Выезжает слева. Для навигации, меню |
| `right` | Выезжает справа. Для деталей, настроек — дефолт |
| `bottom` | Выезжает снизу. Для мобильных устройств |

### Sizes

| Size | Width (left/right) | Height (bottom) |
|---|---|---|
| `small` | 320px | 40vh |
| `medium` | 480px | 60vh |
| `large` | 640px | 80vh |
| `full` | 100% | 100% |

---

## 4. States

### State types

- **data:** `open`, `closed`

| Состояние | Описание |
|---|---|
| `closed` | Скрыт за краем экрана |
| `open` | Виден, контент доступен |

---

## 5. Behavior

### Open / Close model (из interaction-model.md)

**Открывается по:** Click на триггере, `Enter` / `Space` на триггере.

**Закрывается по:**
- `Escape`
- Click на overlay (фон за Drawer)
- Кнопка закрытия внутри Drawer
- Явное действие (Submit, Cancel)

**После закрытия:** фокус возвращается на элемент, который открыл Drawer.

### Focus trap
При открытом Drawer фокус заперт внутри панели (focus trap). Tab / Shift+Tab цикличен внутри Drawer.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Escape` | Закрыть Drawer |
| `Tab` / `Shift+Tab` | Навигация внутри |

### Animation
Следует `foundation/motion.md`.

Выезд/заезд: `transform: translateX` (left/right) или `translateY` (bottom). Используйте `duration/moderate` (200ms) и `easing/emphasized`. `prefers-reduced-motion` — мгновенный toggle без анимации.

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="dialog"` | — | Корневой элемент Drawer |
| `aria-modal="true"` | — | Всегда |
| `aria-label` / `aria-labelledby` | Заголовок | Всегда |
| `aria-hidden="true"` | — | На фоновом контенте при открытом Drawer |
| Focus trap | — | Пока Drawer открыт |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--drawer-bg` | Фон панели | `surface/base` | `surface/base` |
| `--drawer-border` | Граница панели | `border/default` | `border/default` |
| `--drawer-overlay` | Фон overlay за Drawer | `shadow/overlay` | `shadow/overlay` |
| `--drawer-header-border` | Граница под header | `border/default` | `border/default` |
| `--drawer-footer-border` | Граница над footer | `border/default` | `border/default` |
| `--drawer-handle` | Цвет хэндла (bottom) | `border/hover` | `border/hover` |
| `--drawer-shadow` | Тень панели | `shadow/overlay` | `shadow/overlay` |


---

## Related specifications / Связанные спецификации

- [Modal](../specs/feedback/modal.md) — блокирующие overlay-сценарии.
- [Sidebar](../specs/navigation/sidebar.md) — постоянная боковая навигация.
- [Button](../specs/actions/button.md) — trigger и действия Drawer.

