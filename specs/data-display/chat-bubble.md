# Chat Bubble

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### What it is

Chat Bubble — пузырь сообщения в интерфейсах чата. Отображает текст, медиа или файл с метаданными: автор, время, статус доставки.

### When to use

**Use** — в чатах, мессенджерах, тикетных системах, интерфейсах поддержки.

### Core principles

- **Входящие слева, исходящие справа** — стандартный паттерн мессенджеров
- **Аватар только у входящих** — не дублируйте аватар на каждом сообщении в цепочке
- **Временная метка** — показывайте при группировке или по наведению, не на каждом пузыре

---

## 2. Anatomy

```
Incoming:                    Outgoing:
[●] ┌──────────────┐         ┌──────────────┐
    │ Message text │         │ Message text │ [●] (optional)
    │              │         │              │
    └──────────────┘         └──────────────┘
    12:34  ✓delivered        12:34  ✓✓read
```

| Slot | Обязательность | Описание |
|---|---|---|
| `content` | required | Текст, изображение, файл или аудио |
| `avatar` | optional | Аватар отправителя (входящие) |
| `timestamp` | optional | Время отправки |
| `status` | optional | Статус: отправлено, доставлено, прочитано |
| `reactions` | optional | Эмодзи-реакции |

---

## 3. Types / Variants

### Направление

| Тип | Описание |
|---|---|
| `outgoing` | От текущего пользователя. Справа, брендовый фон |
| `incoming` | От собеседника. Слева, нейтральный фон |

### Варианты контента

| Вариант | Описание |
|---|---|
| `text` | Текстовое сообщение |
| `image` | Изображение |
| `file` | Файл с именем и размером |
| `audio` | Аудиосообщение с плеером |

### Состояния сообщения

| Состояние | Описание |
|---|---|
| `sent` | Отправлено (одна галочка) |
| `delivered` | Доставлено (две галочки) |
| `read` | Прочитано (две синих галочки) |
| `error` | Ошибка отправки |

---


---

## States

Chat Bubble has message-level states: sent, delivered, ead, error, sending. Status must be shown with text or an accessible label, not only by color or icon. Interactive states belong to nested controls such as reactions, retry button or attachment actions.

---


---

## Accessibility

Message content must be readable in DOM order from oldest to newest. Delivery and error status must have accessible text. Do not rely on color or checkmark icons alone. Attachments, reactions and retry actions must use the relevant Button/Icon Button accessibility rules.

---

## 4. Design Tokens

| Component token | Роль | Semantic (Light) | Semantic (Dark) |
|---|---|---|---|
| `--bubble-outgoing-bg` | Фон исходящего | `container/brand/default` | `container/brand/default` |
| `--bubble-outgoing-text` | Текст исходящего | `text/on-brand/primary` | `text/on-brand/primary` |
| `--bubble-incoming-bg` | Фон входящего | `container/default` | `container/default` |
| `--bubble-incoming-text` | Текст входящего | `text/primary` | `text/primary` |
| `--bubble-timestamp` | Временная метка | `text/tertiary` | `text/tertiary` |
| `--bubble-status-read` | Статус read | `status/info/surface` | `status/info/surface` |
| `--bubble-status-error` | Статус error | `status/error/surface` | `status/error/surface` |
