# Chat Bubble

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Chat Bubble — data display-компонент для одного сообщения в чат-интерфейсе. Он отображает содержимое сообщения, автора или направление, время, статус доставки и опциональные действия, но не описывает весь chat thread, input composer или messaging workflow.

### Когда использовать

**Используйте** — когда нужно показать отдельное сообщение внутри conversational UI:

- чат поддержки;
- тикетная переписка;
- AI-assistant response;
- комментарии в формате диалога;
- системное сообщение внутри чата;
- сообщение с вложением, ссылкой или файлом;
- grouped message sequence от одного автора.

**Не используйте:**

- Для всей ленты сообщений — используйте Chat Thread или page pattern.
- Для поля ввода сообщения — используйте Text Area, Button и composer pattern.
- Для notification или transient feedback — используйте Toast или Alert.
- Для обычного комментария без conversational layout — используйте Comment или Card pattern.
- Для данных таблицы, логов или audit history — используйте Table или Timeline.

### Основные принципы

- **One bubble, one message** — Chat Bubble описывает одно сообщение, а не поток целиком.
- **Author and direction are explicit** — входящее, исходящее, AI или system message не должны определяться только выравниванием.
- **Status is readable** — delivery/error/sending/read имеют текст или accessible label, не только иконку или цвет.
- **Grouped messages reduce noise** — аватар, имя и timestamp можно показывать один раз в группе, если порядок остаётся понятным.
- **AI content needs boundary** — AI-сообщения должны быть обозначены как AI output, когда это важно для доверия и review.
- **Nested actions own interaction** — retry, copy, reactions и attachment actions используют свои component specs.

---

## 2. Anatomy

```text
Incoming:
[avatar]  ┌────────────────────────┐
          │ Message text            │
          └────────────────────────┘
          Author · 12:34 · delivered

Outgoing:
          ┌────────────────────────┐
          │ Message text            │
          └────────────────────────┘
          12:34 · read
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Message container |
| `bubble` | yes | Visual surface around message content |
| `content` | yes | Text, media, file, code, or rich content |
| `avatar` | optional | Sender avatar for incoming or actor-heavy contexts |
| `author` | conditional | Sender name when context does not already identify the author |
| `timestamp` | optional | Sent time or edited time |
| `deliveryStatus` | optional | Sending, sent, delivered, read, or error |
| `actions` | optional | Copy, retry, react, download, open attachment |
| `reactions` | optional | Reaction summary |

### Правила anatomy

- `content` is required.
- `author` is required when multiple non-current-user authors may appear.
- `timestamp` can be hidden in dense groups only if the thread pattern provides access to it.
- `deliveryStatus` must have accessible text when shown.

---

## 3. Types / Variants

### Direction / sender variants

| Variant | Description | Token mapping |
| --- | --- | --- |
| `incoming` | Message from another user or system actor | incoming surface/foreground |
| `outgoing` | Message from current user | outgoing surface/foreground |
| `ai` | AI-generated message | AI surface/foreground/border/icon |
| `system` | Non-user system message | Use neutral pattern unless system tokens are added |

### Content variants

| Content type | Description | Rule |
| --- | --- | --- |
| `text` | Plain or formatted text | Default |
| `image` | Image attachment | Needs alt text or decorative decision |
| `file` | File attachment | Shows file name, type, size, action |
| `audio` | Audio message | Requires controls and transcript policy |
| `code` | Code block or technical output | Preserve formatting and copy action |
| `rich` | Mixed content | Needs explicit content model |

### Grouping variants

| Group position | Description | Rule |
| --- | --- | --- |
| `single` | Standalone message | Show full metadata as needed |
| `first` | First message in grouped sequence | May show author/avatar |
| `middle` | Middle message in sequence | Reduce repeated metadata |
| `last` | Last message in sequence | May show timestamp/status |

---

## 4. Sizes

Chat Bubble size describes message density and maximum width, not text scale alone.

| Size | Density | Max width guidance | Use |
| --- | --- | --- | --- |
| `compact` | Reduced spacing and metadata | Narrow content width | Dense support views, side panels |
| `medium` | Default spacing | Comfortable reading width | Default chat UI |
| `large` | More breathing room | Wider content for rich messages | Detail view, AI response, rich content |

### Правила размеров

- Use `medium` by default.
- Bubble width should be constrained for readability.
- Very long text wraps; it should not stretch across the full viewport.
- Rich content may use a wider layout than short text messages.
- Не используйте size для передачи delivery status.

---

## 5. States

Chat Bubble has message-level states and nested action states.

| State | Meaning | Required signal |
| --- | --- | --- |
| `sending` | Message is being sent | Text or accessible status |
| `sent` | Message left the client | Accessible label if icon is shown |
| `delivered` | Message reached recipient/server | Accessible label if icon is shown |
| `read` | Message was read | Accessible label; do not rely on color only |
| `error` | Sending failed | Error text and retry action when possible |
| `edited` | Message was edited | Edited label or timestamp note |

### State ownership

- Hover/focus/active states belong to nested actions, links, reactions, file buttons, or copy controls.
- Chat Bubble may reveal actions on hover only if the same actions are keyboard accessible.
- Delivery status tokens are not currently defined; do not invent status token paths.

---

## 6. Behavior

### Layout behavior

- Incoming and outgoing messages may align differently, but DOM order remains chronological.
- Grouped messages reduce repeated avatar/author/timestamp while preserving meaning.
- Bubble tail is optional; do not rely on tail shape alone to communicate direction.
- Message width adapts to content but remains constrained for reading.

### Metadata behavior

- Timestamp may be always visible, grouped, or revealed by interaction, depending on thread pattern.
- Delivery status is usually shown for outgoing messages.
- Error state should show retry or recovery action near the failed message.
- Edited messages should include `edited` text if product policy requires transparency.

### Content behavior

- Text supports wrapping and preserves intentional line breaks where relevant.
- Attachments need file name, type/size where useful, and a clear action.
- AI responses may include copy, regenerate, cite, or feedback actions, but those belong to nested controls.
- Unsafe, uncertain, or generated content policies belong to the surrounding AI workflow, not the bubble alone.

### Responsive behavior

- Bubble max width changes by viewport.
- Avatar and metadata may stack or collapse in narrow layouts.
- Actions must remain reachable by keyboard and touch.

---

## 7. Accessibility

Chat Bubble follows [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Reading order | DOM order follows chronological message order |
| Sender | Author or direction is programmatically available when needed |
| Timestamp | Timestamp is available when message time matters |
| Delivery status | Status has accessible text, not only icon/color |
| Error | Failed message includes readable error and recovery action |
| Attachments | File/media actions have accessible names |
| AI message | AI output is labelled when user needs to distinguish generated content |

### Accessibility checklist

- [ ] Message content is readable in chronological order.
- [ ] Sender/direction is understandable without layout alone.
- [ ] Delivery status has text or accessible label.
- [ ] Error status includes recovery path.
- [ ] Revealed actions are keyboard accessible.
- [ ] Attachments have names and actions.
- [ ] AI-generated message is labelled when applicable.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Role | Component token | Semantic |
| --- | --- | --- |
| Outgoing surface default | `chat-bubble/outgoing/surface/default` | `container/brand/default` |
| Outgoing surface hover | `chat-bubble/outgoing/surface/hover` | `container/brand/hover` |
| Outgoing foreground default | `chat-bubble/outgoing/foreground/default` | `text/on-brand/primary` |
| Outgoing foreground secondary | `chat-bubble/outgoing/foreground/secondary` | `text/on-brand/secondary` |
| Incoming surface default | `chat-bubble/incoming/surface/default` | `surface/subtle` |
| Incoming surface hover | `chat-bubble/incoming/surface/hover` | `container/neutral/hover` |
| Incoming foreground default | `chat-bubble/incoming/foreground/default` | `text/primary` |
| Incoming foreground secondary | `chat-bubble/incoming/foreground/secondary` | `text/secondary` |
| Timestamp foreground | `chat-bubble/timestamp/foreground` | `text/tertiary` |
| AI surface | `chat-bubble/ai/surface` | `status/ai/surface` |
| AI foreground | `chat-bubble/ai/foreground` | `status/ai/text` |
| AI border | `chat-bubble/ai/border` | `status/ai/border` |
| AI icon | `chat-bubble/ai/icon` | `status/ai/icon` |
| Action icon default | `chat-bubble/action/icon/default` | `icon/tertiary` |
| Action icon hover | `chat-bubble/action/icon/hover` | `icon/primary` |

### Token gaps

- Chat Bubble does not currently have component tokens for delivery status, error status, radius, tail, spacing, max width, attachment surface, or reaction surface.
- Use nested component tokens for actions, attachments, reactions, and retry controls.
- Do not invent Chat Bubble token names in specs, code, Figma, or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Sender variant | `variant` | `incoming`, `outgoing`, `ai`, `system` |
| Content type | `contentType` | `text`, `image`, `file`, `audio`, `code`, `rich` |
| Content | `content` | Required |
| Author | `author` | Required when not obvious |
| Avatar | `avatar` | Optional |
| Timestamp | `timestamp` | Optional visible value |
| Datetime | `dateTime` | Machine-readable timestamp |
| Delivery status | `deliveryStatus` | `sending`, `sent`, `delivered`, `read`, `error`, `edited` |
| Group position | `groupPosition` | `single`, `first`, `middle`, `last` |
| Actions | `actions` | Copy, retry, react, download, open |
| Reactions | `reactions` | Reaction summary |

### Contract rules

- `content` is required.
- `variant` and `contentType` must use documented values.
- Delivery status must have accessible text.
- AI variant must not imply human authorship.
- Do not pass raw colors for bubble surface or text.
- Use nested component APIs for actions and attachments.

---

## 10. Handoff notes

В handoff нужно передать:

- message sender variant and author rules;
- content type and content model;
- grouping rules for consecutive messages;
- timestamp visibility and formatting;
- delivery status behavior and accessible labels;
- error and retry behavior;
- AI message labelling rules, if applicable;
- attachment, copy, reaction, and feedback action contracts;
- responsive max-width and metadata layout rules;
- token mapping for incoming, outgoing, AI, timestamp, and action icons;
- token gaps for status, radius, spacing, attachments, and reactions.

### Acceptance criteria

- Chat Bubble represents one message.
- Message order remains chronological in DOM.
- Sender/direction is clear without relying only on alignment.
- Delivery and error statuses have accessible text.
- AI-generated messages are labelled when needed.
- Nested actions use Button, Icon Button, Link, or attachment specs.
- Bubble colors use documented component tokens.
- Unsupported delivery/status token needs are marked as token gaps.

---

## 11. AI usage rules

- AI may use Chat Bubble only for a single message inside a conversational interface.
- AI must recommend a chat/thread pattern for full message lists.
- AI must recommend Text Area and Button patterns for message composition.
- AI must not invent delivery status tokens, sender variants, content types, or raw colors.
- AI must check `tokens.json` before changing Chat Bubble token mappings.
- AI must flag missing sender, missing accessible delivery status, unclear AI authorship, unsupported attachment behavior, or color-only status as `Needs system review`.
- AI may draft message structure, metadata, handoff notes, and acceptance criteria, but human review is required.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| Support agent reply | `variant=incoming`, author visible, timestamp available |
| Current user message | `variant=outgoing`, delivery status `read` with accessible label |
| AI assistant response | `variant=ai`, AI label, copy/feedback nested actions |
| Failed send | `deliveryStatus=error`, error text and retry action |
| Consecutive messages | First shows author/avatar; middle reduces repeated metadata |

### Требует review

| Scenario | Reason |
| --- | --- |
| Status shown only as blue checkmarks | Color/icon-only status |
| AI response visually identical to human message | Authorship and trust risk |
| Full chat screen documented as Chat Bubble | Component boundary is too broad |
| File attachment without file name or action | Incomplete content contract |

---

## 13. Anti-patterns

- Using Chat Bubble to describe the entire chat interface.
- Inferring sender only from left/right alignment.
- Showing delivery status only through icons or color.
- Hiding retry action for failed outgoing messages.
- Mixing AI and human messages without clear authorship.
- Creating custom bubble colors outside component tokens.
- Making hover-revealed actions inaccessible by keyboard.
