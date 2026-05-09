# Timeline

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Timeline — хронологическое отображение событий или шагов процесса. Визуализирует последовательность во времени через вертикальную или горизонтальную ось.

### When to use

**Use** — для истории изменений объекта, логов событий, хода исполнения процесса, онбординговых историй.

**Don't use:**
- Для прогресса с активным управлением — используйте **Stepper**
- Для сравнения нескольких временных рядов — используйте Chart

---

## 2. Anatomy

```
Vertical:
●  [icon/number/avatar]  Title
│                        Description · Timestamp
●  [icon/number/avatar]  Title
│                        Description · Timestamp
●  [icon/number/avatar]  Title (current)
```

| Slot | Обязательность | Описание |
|---|---|---|
| `point` | required | Визуальный маркер события |
| `connector` | auto | Линия между событиями |
| `title` | required | Название события |
| `description` | optional | Описание события |
| `timestamp` | optional | Дата / время события |
| `content` | optional | Дополнительный контент после описания |

---

## 3. Types / Variants

### Ориентации

| Ориентация | Описание |
|---|---|
| `vertical` | События сверху вниз. Дефолт |
| `horizontal` | События слева направо. Для компактных хронологий |

### Варианты маркера

| Вариант | Описание |
|---|---|
| `dot` | Простая точка |
| `icon` | SVG-иконка |
| `number` | Порядковый номер |
| `avatar` | Аватар пользователя-автора |

### Состояния события

| Состояние | Описание |
|---|---|
| `upcoming` | Событие ещё не произошло |
| `current` | Текущее активное событие |
| `completed` | Завершённое событие |
| `error` | Событие с ошибкой |

---


---

## States

Timeline items can be completed, current, upcoming, error or disabled. State must be exposed through text, icon label or status text, not only color.

---


---

## Accessibility

Timeline should preserve chronological reading order. Current, completed and error states need text labels. Decorative connector lines are hidden from assistive technology.

---

## 4. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--timeline-connector` | Линия-коннектор | `border/default` | `border/default` |
| `--timeline-point-upcoming` | Маркер upcoming | `container/default` | `container/default` |
| `--timeline-point-current` | Маркер current | `container/brand/default` | `container/brand/default` |
| `--timeline-point-completed` | Маркер completed | `container/brand/default` | `container/brand/default` |
| `--timeline-point-error` | Маркер error | `status/error/surface` | `status/error/surface` |
| `--timeline-title` | Заголовок события | `text/primary` | `text/primary` |
| `--timeline-description` | Описание | `text/secondary` | `text/secondary` |
| `--timeline-timestamp` | Временная метка | `text/tertiary` | `text/tertiary` |
