# Alert

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Alert — встроенное сообщение для информирования пользователя в контексте страницы или формы. В отличие от Toast, Alert не исчезает автоматически и остаётся в потоке контента.

### When to use

**Use** — для системных сообщений о состоянии формы, важной контекстной информации, предупреждений об ошибках после отправки.

**Don't use:**
- Для коротких временных уведомлений — используйте **Toast**
- Для блокирующих ситуаций, требующих подтверждения — используйте **Modal**
- Более одного Alert одного типа на странице — объедините сообщения

### Core principles

- **Тип соответствует смыслу** — `error` только для ошибок, не для предупреждений
- **Краткость** — Alert — это уведомление, не документация. Для деталей — ссылка или action
- **Не злоупотреблять** — Alert привлекает внимание. Злоупотребление снижает его эффективность

---

## 2. Anatomy

```
┌────────────────────────────────────────────────────┐
│ [icon]  Title text                            [×]  │
│         Description or helper text                 │
│         [Action link]                              │
└────────────────────────────────────────────────────┘
```

| Slot | Обязательность | Описание |
|---|---|---|
| `icon` | optional (рекомендован) | Семантическая иконка типа |
| `title` | required | Краткое сообщение |
| `description` | optional | Уточняющий текст |
| `action` | optional | Ссылка или кнопка-действие |
| `close-button` | conditional | Кнопка закрытия (модификатор `dismissible`) |

---

## 3. Types / Variants

| Тип | Назначение | Семантика |
|---|---|---|
| `info` | Нейтральная информация | Синий |
| `success` | Операция успешно завершена | Зелёный |
| `warning` | Предупреждение о потенциальной проблеме | Жёлтый |
| `error` | Ошибка, требующая исправления | Красный |

### Modifiers

| Модификатор | Описание |
|---|---|
| `dismissible` | Добавляет кнопку закрытия |
| `with-action` | Кнопка или ссылка для действия |
| `with-icon` | Семантическая иконка (рекомендуется) |

---

## 4. Sizes

| Size | Height (мин) | Font / Line | Icon | Контекст |
|---|---|---|---|---|
| `small` | 24px+ | 12px / 16px | 14px | Компактные формы, таблицы |
| `medium` | 32px+ | 14px / 20px | 16px | Стандартный — дефолт |
| `large` | 40px+ | 16px / 24px | 18px | Крупные блоки |
| `extraLarge` | 48px+ | 18px / 28px | 20px | Hero-зоны |

---

## 5. States

Alert не имеет интерактивных состояний кроме кнопки закрытия (наследует состояния Icon Button).

---

## 6. Behavior

### Dismissible
Close-кнопка использует компонент Icon Button `ghost`. После клика Alert скрывается по `foundation/motion.md`: fade + height collapse transition, `duration/moderate` (200ms), `easing/exit`. `prefers-reduced-motion` — мгновенное скрытие.

---

## 7. Accessibility

| Атрибут | Значение | Когда |
|---|---|---|
| `role="alert"` | — | Для `error` и `warning` (немедленное объявление) |
| `role="status"` | — | Для `info` и `success` (вежливое объявление) |
| `aria-live="polite"` | — | На контейнере для динамических Alert |
| `aria-label="Закрыть"` | — | Кнопка dismissible |

---

## 8. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--alert-info-bg` | Фон info | `status/info/container` | `status/info/container` |
| `--alert-info-border` | Граница info | `status/info/border` | `status/info/border` |
| `--alert-info-icon` | Иконка info | `status/info/text` | `status/info/text` |
| `--alert-info-title` | Заголовок info | `status/info/text` | `status/info/text` |
| `--alert-success-bg` | Фон success | `status/success/container` | `status/success/container` |
| `--alert-success-border` | Граница success | `status/success/border` | `status/success/border` |
| `--alert-success-icon` | Иконка success | `status/success/text` | `status/success/text` |
| `--alert-warning-bg` | Фон warning | `status/warning/container` | `status/warning/container` |
| `--alert-warning-border` | Граница warning | `status/warning/border` | `status/warning/border` |
| `--alert-warning-icon` | Иконка warning | `status/warning/text` | `status/warning/text` |
| `--alert-error-bg` | Фон error | `status/error/container/default` | `status/error/container/default` |
| `--alert-error-border` | Граница error | `status/error/border` | `status/error/border` |
| `--alert-error-icon` | Иконка error | `status/error/text` | `status/error/text` |
| `--alert-description` | Цвет описания | `text/secondary` | `text/secondary` |
