# Modal / Dialog

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Modal — диалоговое окно, блокирующее взаимодействие с основным интерфейсом до принятия решения или выполнения действия. Требует явного закрытия.

### When to use

**Use** — для подтверждения необратимых действий; для форм, которые не умещаются инлайн; для фокусированных задач без смены страницы.

**Do not use:**
- Для некритичных уведомлений — используйте **Toast** или **Alert**
- Для длинного контента с прокруткой — рассмотрите отдельную страницу
- Вложенные модалы — никогда

### Core principles

- **Явное закрытие** — пользователь должен явно закрыть Modal: кнопка, `Escape`, или клик на overlay
- **Один Modal за раз** — не открывайте Modal из Modal
- **Фокус внутри** — focus trap пока Modal открыт

---

## 2. Anatomy

```
░░░░░░░░ overlay ░░░░░░░░░
░ ┌────────────────────┐ ░
░ │ Header         [×] │ ░ ← header
░ ├────────────────────┤ ░
░ │                    │ ░ ← body
░ │  Content           │ ░
░ │                    │ ░
░ ├────────────────────┤ ░
░ │ [Cancel] [Confirm] │ ░ ← footer
░ └────────────────────┘ ░
░░░░░░░░░░░░░░░░░░░░░░░░░░
```

| Slot | Обязательность | Описание |
|---|---|---|
| `header` | optional | Заголовок + кнопка закрытия |
| `body` | required | Основное содержимое |
| `footer` | optional | Кнопки действий |

---

## 3. Types / Variants

| Тип | Описание |
|---|---|
| `default` | Стандартный диалог: header + body + footer |
| `confirmation` | Подтверждение действия: 2 кнопки (Cancel / Confirm) |
| `alert` | Информационное сообщение: 1 кнопка (OK) |
| `form` | Форма внутри модала |
| `fullscreen` | На весь экран. Для сложных задач |

---

## 4. Sizes

| Size | Width | Контекст |
|---|---|---|
| `small` | 400px | Подтверждения, короткие алерты |
| `medium` | 560px | Стандартный — дефолт |
| `large` | 720px | Формы, детальный контент |
| `fullscreen` | 100% | Сложные задачи, редакторы |

---

## 5. States

### State types (жизненный цикл)

- **data:** `closed`, `opening`, `open`, `closing`

| Состояние | Описание |
|---|---|
| `closed` | Скрыт, не в DOM или `display: none` |
| `opening` | Анимация появления (150ms) |
| `open` | Полностью видим, интерактивен |
| `closing` | Анимация скрытия (150ms) |

---

## 6. Behavior

### Open / Close (из interaction-model.md)

**Открывается:** Click на триггере.
**Закрывается:** `Escape`, click на overlay, кнопка закрытия, Submit / Cancel.
**После закрытия:** фокус возвращается на элемент, открывший Modal.

### Focus trap
При открытии фокус перемещается на первый интерактивный элемент (или на сам Modal). Tab / Shift+Tab цикличен внутри Modal.

### Keyboard

| Клавиша | Действие |
|---|---|
| `Escape` | Закрыть |
| `Tab` / `Shift+Tab` | Навигация внутри (focus trap) |
| `Enter` | Подтверждение (при фокусе на кнопке) |

---

## 7. Accessibility

Компонент следует `foundation/accessibility.md` и соответствует WCAG 2.2 AA.

### Semantics

| Атрибут | Значение | Когда |
|---|---|---|
| `role="dialog"` | — | Корневой элемент стандартного, confirmation и form Modal |
| `role="alertdialog"` | — | Критичный alert или destructive confirmation, требующий немедленного внимания |
| `aria-modal="true"` | — | Всегда |
| `aria-labelledby` | ID заголовка | При наличии header |
| `aria-label` | Краткое имя диалога | Если нет видимого заголовка |
| `aria-describedby` | ID body / текста предупреждения | Для `alert` и `confirmation` |
| `inert` / `aria-hidden="true"` | — | На фоновом контенте при открытом Modal |

### Keyboard

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Цикличная навигация внутри Modal |
| `Escape` | Закрыть, если закрытие разрешено сценарием |
| `Enter` | Активировать кнопку в фокусе; не должен случайно подтверждать destructive action |

### Focus management

- При открытии фокус перемещается внутрь Modal.
- Для confirmation и alert фокус обычно ставится на безопасное действие (`Cancel`, `Close`, `OK`), а не на destructive action.
- Для form Modal фокус ставится на первое поле или на заголовок, если форма длинная.
- Фокус не выходит на фоновый контент, пока Modal открыт.
- После закрытия фокус возвращается на trigger, открывший Modal.
- Если trigger удалён, фокус возвращается на логически следующий элемент.

### Screen reader

- Заголовок должен быть связан через `aria-labelledby`.
- Критичный текст подтверждения или alert body связывается через `aria-describedby`.
- Кнопка закрытия имеет `aria-label="Закрыть"`.
- Overlay декоративный и не получает фокус.

### Visual

- Контраст текста и кнопок: минимум 4.5:1.
- Иконки и границы: минимум 3:1.
- Focus ring всех интерактивных элементов использует `focus/ring`.
- Destructive confirmation не передаётся только цветом: заголовок, body и confirm label явно описывают риск.

### Touch

- Кнопка закрытия и footer actions имеют touch target минимум 44×44px.
- Клик по overlay может закрывать только non-destructive Modal. Для destructive confirmation предпочтительно явное действие.

### Motion

- Motion следует `foundation/motion.md`: `opening` / `closing` используют `duration/base` (150ms) и `easing/enter` / `easing/exit`.
- Анимация уважает `prefers-reduced-motion: reduce`: Modal появляется и скрывается без перехода.
- Анимация не должна задерживать установку фокуса внутрь Modal.

### Acceptance checklist

- [ ] Корневой элемент имеет `role="dialog"` или `role="alertdialog"`.
- [ ] У Modal есть accessible name через `aria-labelledby` или `aria-label`.
- [ ] `aria-modal="true"` установлен.
- [ ] Фоновый контент недоступен для фокуса.
- [ ] Focus trap работает для `Tab` и `Shift+Tab`.
- [ ] Initial focus выбран по типу Modal.
- [ ] После закрытия фокус возвращается на trigger.
- [ ] `Escape` закрывает Modal, если сценарий не требует явного решения.
- [ ] Кнопка закрытия имеет `aria-label`.
- [ ] Destructive confirmation не ставит фокус на опасное действие по умолчанию.
- [ ] Touch target кнопок не меньше 44×44px.
- [ ] Reduced-motion fallback описан.

---

## 8. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--modal-bg` | Фон диалога | `surface/base` | `surface/base` |
| `--modal-border` | Граница диалога | `border/default` | `border/default` |
| `--modal-overlay` | Фон overlay | `shadow/overlay` | `shadow/overlay` |
| `--modal-shadow` | Тень диалога | `shadow/overlay` | `shadow/overlay` |
| `--modal-header-border` | Граница под header | `border/default` | `border/default` |
| `--modal-footer-border` | Граница над footer | `border/default` | `border/default` |
| `--modal-title` | Заголовок | `text/primary` | `text/primary` |


---

## Related specifications / Связанные спецификации

- [Popover](../specs/feedback/popover.md) — неблокирующие contextual surfaces.
- [Drawer](../specs/navigation/drawer.md) — боковая overlay-панель.
- [Button](../specs/actions/button.md) — trigger и actions Modal.

