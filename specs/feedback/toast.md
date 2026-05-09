# Toast / Snackbar

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Toast — временное уведомление, появляющееся поверх интерфейса. Исчезает автоматически через 4–6 секунд или по действию пользователя. В отличие от Alert — не находится в потоке контента.

### When to use

**Use** — для подтверждения завершённых действий («Сохранено», «Скопировано», «Удалено»); для системных уведомлений без необходимости взаимодействия.

**Don't use:**
- Для ошибок, требующих исправления — используйте **Alert** в форме
- Для важной информации, которая должна оставаться видимой — используйте **Alert**
- Более 3 Toast одновременно — ограничивайте очередь

### Core principles

- **Автоисчезание** — 4–6 секунд дефолт. `persistent` для важных уведомлений
- **Пауза при hover** — таймер приостанавливается пока пользователь навёл курсор
- **Позиция — константна** — не меняйте позицию в рамках одного приложения

---

## 2. Anatomy

```
┌──────────────────────────────────────┐
│ [icon]  Title                  [×]  │
│         Description  [Action]        │
└──────────────────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `icon` | optional | Семантическая иконка |
| `title` | required | Краткое уведомление |
| `description` | optional | Уточнение |
| `action` | optional | Ссылка-действие (отмена, подробнее) |
| `close-button` | conditional | Кнопка закрытия (модификатор `dismissible`) |

---

## 3. Types / Variants

| Тип | Назначение |
|---|---|
| `info` | Нейтральное уведомление |
| `success` | Успешное завершение действия |
| `warning` | Предупреждение |
| `error` | Ошибка при выполнении действия |

### Позиции

`top-left` · `top-center` · `top-right` · `bottom-left` · `bottom-center` · `bottom-right`

### Modifiers

| Модификатор | Описание |
|---|---|
| `dismissible` | Кнопка ручного закрытия |
| `with-action` | Кнопка или ссылка для действия |
| `with-icon` | Семантическая иконка |
| `persistent` | Не исчезает автоматически |

---

## 4. States

| Состояние | Описание |
|---|---|
| `entering` | Появление. Slide-in + fade-in по `foundation/motion.md` |
| `visible` | Полностью видим, таймер идёт |
| `exiting` | Исчезновение. Fade-out по `foundation/motion.md` |

---

## 5. Behavior

### Auto-dismiss
Дефолт: 4000ms для `success` / `info`, 6000ms для `warning` / `error`. Таймер паузируется при `hover` и `focus` внутри Toast. Прогресс-бар (опционально) показывает оставшееся время.

### Motion
Toast следует `foundation/motion.md`: enter использует slide + fade с `duration/base`-`duration/moderate` и `easing/enter`; exit использует fade или slide-out с `duration/base` и `easing/exit`. При `prefers-reduced-motion: reduce` Toast появляется и скрывается без перемещения.

### Queue management
При нескольких Toast — показываются последовательно в позиции. Максимум 3 одновременно. Новые вытесняют старые или добавляются стэком.

---

## 6. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="alert"` | — | Типы `error`, `warning` |
| `role="status"` | — | Типы `info`, `success` |
| `aria-live="polite"` | — | Контейнер Toast-ов |
| `aria-atomic="true"` | — | Обёртка |

---

## 7. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--toast-bg` | Фон (общий) | `surface/inverse/default` | `surface/inverse/default` |
| `--toast-text` | Цвет текста | `text/on-inverse/primary` | `text/on-inverse/primary` |
| `--toast-info-icon` | Иконка info | `status/info/surface` | `status/info/surface` |
| `--toast-success-icon` | Иконка success | `status/success/surface` | `status/success/surface` |
| `--toast-warning-icon` | Иконка warning | `status/warning/surface` | `status/warning/surface` |
| `--toast-error-icon` | Иконка error | `status/error/surface` | `status/error/surface` |
| `--toast-action-color` | Action link | `link/default` | `link/default` |
| `--toast-shadow` | Тень | `shadow/darker` | `shadow/darker` |
