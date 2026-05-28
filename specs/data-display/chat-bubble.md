# Chat Bubble

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `content.md`, `iconography.md`, `motion.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Chat Bubble — компонент отображения одного сообщения внутри conversational UI. Он показывает содержимое сообщения, автора или направление, время, статус доставки и дополнительные действия вроде copy, retry, reaction или feedback.

В SEDA AI Chat Bubble является message contract, а не спецификацией всего чата. Он не описывает thread layout, input composer, moderation workflow или AI safety policy целиком. AI может помогать структурировать сообщение и handoff, но правила авторства, доступности, токенов и AI-label остаются системными.

### Когда использовать

Используйте Chat Bubble, когда нужно показать:

- одно сообщение пользователя, оператора, AI-ассистента или системного actor;
- ответ поддержки внутри chat thread;
- AI-generated response с явной маркировкой;
- сообщение с вложением, ссылкой, кодом или rich content;
- отправляемое, доставленное, прочитанное или ошибочное исходящее сообщение;
- последовательность grouped messages от одного автора.

### Не используйте

Не используйте Chat Bubble, когда:

- нужно описать весь chat screen или thread — используйте отдельный page/pattern spec;
- нужен input composer — используйте Text Area, Button и composer pattern;
- сообщение является toast/alert feedback — используйте Toast или Alert;
- нужно показать audit log, историю статусов или события — используйте Timeline или Table;
- содержимое не является conversational message;
- AI response нельзя отличить от human message, если это важно для доверия и проверки.

### Основные принципы

- **One bubble, one message** — один Chat Bubble описывает одно сообщение.
- **Authorship is explicit** — incoming, outgoing, AI и system messages не должны определяться только выравниванием.
- **Status is readable** — delivery/error/read state должен иметь текст или accessible label.
- **AI output is labelled** — AI-generated content обозначается, если пользователь должен понимать источник.
- **Grouped messages reduce noise** — avatar, author и timestamp можно группировать, но смысл не должен теряться.
- **Nested actions own interaction** — copy, retry, reaction и attachment actions используют свои component contracts.
- **Tokens before visuals** — surface, foreground, timestamp и action icons берутся из `chat-bubble` tokens.
- **AI assists, system governs** — AI не придумывает sender variants, status tokens или raw colors.

### Связанные спецификации

- [Avatar](../specs/data-display/avatar.md) — автор сообщения.
- [Button](../specs/actions/button.md) — retry, submit, feedback actions.
- [Icon Button](../specs/actions/icon-button.md) — copy, react, more actions.
- [Link](../specs/actions/link.md) — ссылки внутри сообщения.
- [Text Area](../specs/inputs/text-area.md) — composer input.
- [Toast](../specs/feedback/toast.md) — transient feedback вместо message bubble.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `root` | Да | Контейнер одного сообщения в списке. |
| `bubble` | Да | Визуальная поверхность сообщения. |
| `content` | Да | Текст, код, изображение, файл или rich content. |
| `avatar` | Условно | Автор incoming, AI или multi-author message. |
| `author` | Условно | Имя автора, если оно не очевидно из thread context. |
| `timestamp` | Нет | Время отправки, изменения или доставки. |
| `deliveryStatus` | Условно | `sending`, `sent`, `delivered`, `read`, `error`, `edited`. |
| `actions` | Нет | Copy, retry, react, download, open, feedback. |
| `reactions` | Нет | Сводка реакций на сообщение. |

### Правила анатомии

- `content` обязателен для каждого сообщения.
- `author` обязателен, если в thread есть несколько авторов кроме current user.
- `timestamp` можно группировать, но он должен быть доступен по pattern rule.
- `deliveryStatus` должен иметь readable text или accessible label.
- `actions` не должны быть доступны только при hover; нужен keyboard path.
- Bubble tail не является обязательным и не должен быть единственным сигналом направления.

---

## 3. Types / Variants / Варианты

### Sender variants

| Variant | Назначение | Правило |
|---|---|---|
| `incoming` | Сообщение от другого пользователя или оператора. | Требует author/avatar, если thread не дает контекст. |
| `outgoing` | Сообщение текущего пользователя. | Обычно показывает delivery status. |
| `ai` | AI-generated message или ответ AI-agent. | Требует AI label, если источник важен для trust/review. |
| `system` | Системное сообщение внутри thread. | Использовать нейтральный pattern; отдельные system tokens пока не выделены. |

### Content variants

| Content type | Назначение | Правило |
|---|---|---|
| `text` | Plain или formatted text. | Default. |
| `image` | Изображение внутри сообщения. | Нужен alt text или decorative decision. |
| `file` | Вложенный файл. | Нужны имя, тип/размер и action. |
| `audio` | Голосовое сообщение. | Нужны controls и transcript policy. |
| `code` | Код или технический output. | Сохранить форматирование и copy action. |
| `rich` | Смешанный контент. | Нужна явная content model. |

### Group position

| Position | Назначение | Правило |
|---|---|---|
| `single` | Отдельное сообщение. | Показывать metadata по необходимости. |
| `first` | Первое сообщение в группе автора. | Может показывать avatar/author. |
| `middle` | Среднее сообщение группы. | Уменьшить повтор metadata. |
| `last` | Последнее сообщение группы. | Может показывать timestamp/status. |

---

## 4. Sizes / Размеры

Size описывает плотность и максимальную ширину сообщения, а не только font size.

| Size | Плотность | Применение |
|---|---|---|
| `compact` | Меньше spacing и metadata. | Support panel, side panel, dense logs. |
| `medium` | Default spacing. | Основной chat UI. |
| `large` | Больше воздуха и ширины. | Detail view, rich AI response, code/content blocks. |

### Правила размеров

- `medium` используется по умолчанию.
- Bubble width ограничивается для читаемости.
- Длинный текст переносится и не растягивает сообщение на всю ширину viewport.
- Rich content может быть шире обычного текста.
- Size не должен кодировать delivery status или author type.

---

## 5. States / Состояния

| State | Когда возникает | Правило |
|---|---|---|
| `default` | Сообщение отображается без дополнительного статуса. | Используются tokens sender variant. |
| `sending` | Сообщение отправляется. | Нужен текст или accessible status. |
| `sent` | Сообщение покинуло клиент. | Если есть icon, нужен accessible label. |
| `delivered` | Сообщение доставлено. | Не полагаться только на цвет/icon. |
| `read` | Сообщение прочитано. | Нужен readable или accessible status. |
| `error` | Отправка или загрузка content failed. | Нужны error text и recovery action. |
| `edited` | Сообщение изменено. | Добавить edited label или timestamp note. |
| `streaming` | AI или system response генерируется постепенно. | Нужен controlled announcement policy. |

### State ownership

- Hover/focus/active принадлежат вложенным actions, links, reactions, file buttons и copy controls.
- Chat Bubble может показывать actions при hover, только если они доступны с клавиатуры.
- Delivery status tokens пока не выделены; нельзя придумывать `chat-bubble/status/...`.
- Streaming state не должен объявлять каждое изменение текста screen reader без явного live policy.

---

## 6. Behavior / Поведение

### Layout behavior

- DOM order сообщений остается хронологическим, даже если incoming/outgoing визуально выравниваются по разным сторонам.
- Grouped messages уменьшают повтор avatar/author/timestamp, но не скрывают автора полностью.
- Bubble max width зависит от viewport и content type.
- Empty message не рендерится как пустая bubble.
- Error bubble должна оставаться рядом с исходным сообщением, чтобы recovery был понятен.

### Metadata behavior

- Timestamp может быть всегда видимым, grouped или раскрываемым по interaction rule.
- Delivery status обычно применяется к outgoing messages.
- AI message должен сохранять AI label при copy, quote или handoff, если это важно для контекста.
- Edited messages должны быть обозначены, если продуктовая политика требует прозрачности.

### Content behavior

- Text сохраняет intentional line breaks, где это важно.
- Links внутри сообщения используют Link contract.
- Attachments имеют имя, тип/размер и понятное действие.
- Code block сохраняет форматирование и имеет copy action.
- Unsafe, uncertain или generated content policy описывается на уровне AI workflow, но bubble должна поддерживать явную маркировку.

### Responsive behavior

- На узких экранах metadata может переноситься под bubble.
- Avatar может скрываться в grouped messages, но author context должен сохраняться.
- Actions должны оставаться доступны touch и keyboard пользователям.

---

## 7. Accessibility

| Требование | Правило |
|---|---|
| Reading order | DOM order следует хронологии сообщений. |
| Sender | Author или direction доступны программно, когда это нужно. |
| Timestamp | Время доступно, если оно влияет на понимание conversation. |
| Delivery status | Status имеет readable text или accessible label. |
| Error | Failed message включает error text и recovery action. |
| Attachments | File/media actions имеют accessible names. |
| AI message | AI output обозначен, если пользователю нужно отличать generated content. |
| Streaming | Live updates объявляются контролируемо и не создают шум. |

### Accessibility checklist

- [ ] Message content читается в хронологическом порядке.
- [ ] Sender/direction понятны без опоры только на layout.
- [ ] Delivery status имеет text или accessible label.
- [ ] Error state содержит recovery path.
- [ ] Hover-revealed actions доступны с клавиатуры.
- [ ] Attachments имеют названия и действия.
- [ ] AI-generated message обозначено, если это важно.
- [ ] Streaming state имеет live region policy или явно выключенные announcements.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Chat Bubble доступны component tokens в namespace `chat-bubble`.

| Role | Component token | Semantic token |
|---|---|---|
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

- Нет component tokens для delivery status, error status, radius, tail, spacing, max width, attachment surface, reaction surface и streaming indicator.
- Для вложенных действий используйте Button, Icon Button, Link и attachment component tokens.
- Не добавляйте новые Chat Bubble token names без token architecture review.

---

## 9. Code mapping

| Design concept | Prop / API | Правило |
|---|---|---|
| Sender variant | `variant` | `incoming`, `outgoing`, `ai`, `system`. |
| Content type | `contentType` | `text`, `image`, `file`, `audio`, `code`, `rich`. |
| Content | `content` | Обязательный payload сообщения. |
| Author | `author` | Обязателен, если автор не очевиден. |
| Avatar | `avatar` | Опционально, через Avatar contract. |
| Timestamp | `timestamp` | Видимое значение времени. |
| Datetime | `dateTime` | Machine-readable timestamp. |
| Delivery status | `deliveryStatus` | `sending`, `sent`, `delivered`, `read`, `error`, `edited`. |
| Streaming | `streaming` | Boolean для частичной генерации ответа. |
| Group position | `groupPosition` | `single`, `first`, `middle`, `last`. |
| Actions | `actions` | Copy, retry, react, download, open. |
| Reactions | `reactions` | Reaction summary. |
| AI label | `aiLabel` | Обязателен для `variant="ai"`, если source нужно различать. |

### Contract rules

- `content` обязателен.
- `variant` и `contentType` используют только documented values.
- `deliveryStatus` требует accessible text.
- `variant="ai"` не должен подразумевать human authorship.
- `streaming=true` требует live update policy.
- Raw colors, custom status colors и invented token paths запрещены.
- Вложения и actions используют вложенные component APIs.

---

## 10. Handoff notes

Handoff для Chat Bubble должен фиксировать:

- sender variant и author rules;
- content type и content model;
- grouped message rules;
- timestamp visibility и formatting;
- delivery status behavior и accessible labels;
- streaming behavior и live region policy;
- error и retry behavior;
- AI message labelling rules;
- attachment, copy, reaction и feedback action contracts;
- responsive max-width и metadata layout rules;
- token mapping для incoming, outgoing, AI, timestamp и action icons;
- token gaps для status, radius, spacing, attachments и reactions.

---

## 11. Acceptance criteria

- [ ] Chat Bubble представляет одно сообщение.
- [ ] Message order остается хронологическим в DOM.
- [ ] Sender/direction понятны без опоры только на alignment.
- [ ] Delivery и error statuses имеют accessible text.
- [ ] AI-generated messages обозначены, если это нужно для доверия или review.
- [ ] Streaming state не создает чрезмерных screen reader announcements.
- [ ] Nested actions используют Button, Icon Button, Link или attachment specs.
- [ ] Bubble colors используют documented component tokens.
- [ ] Unsupported delivery/status token needs помечены как token gaps.

---

## 12. AI usage rules

AI может:

- предложить структуру одного message bubble;
- подготовить metadata, status labels и handoff notes;
- проверить, не нужен ли thread pattern вместо Chat Bubble;
- предложить AI label, copy/feedback actions и streaming policy;
- сверить token mapping с `tokens.json`;
- подготовить acceptance criteria.

AI не должен:

- использовать Chat Bubble для описания всего chat screen;
- придумывать sender variants, content types, delivery status tokens или raw colors;
- скрывать AI authorship, если оно влияет на доверие и проверку;
- показывать delivery/error status только цветом или иконкой;
- делать hover actions недоступными для клавиатуры;
- пропускать attachment names, retry behavior или accessible status.

Если сообщение содержит AI output, sensitive content, unsafe suggestion, unsupported attachment behavior или unclear authorship, AI должен пометить сценарий как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Scenario | Usage |
|---|---|
| Ответ оператора поддержки | `variant="incoming"`, author visible, timestamp available. |
| Сообщение текущего пользователя | `variant="outgoing"`, `deliveryStatus="read"` с accessible label. |
| Ответ AI-ассистента | `variant="ai"`, AI label, copy/feedback nested actions. |
| Ошибка отправки | `deliveryStatus="error"`, error text и retry action. |
| Последовательные сообщения | `first` показывает author/avatar, `middle` сокращает metadata, `last` показывает status. |

### Требует review

| Scenario | Причина |
|---|---|
| Status показан только синими checkmarks. | Color/icon-only status. |
| AI response выглядит как human message. | Authorship и trust risk. |
| Весь chat screen описан как Chat Bubble. | Граница компонента слишком широкая. |
| File attachment без имени и действия. | Неполный content contract. |
| Streaming AI response объявляет каждое слово screen reader. | Accessibility noise. |

---

## 14. Anti-patterns

- Использовать Chat Bubble для всего chat interface.
- Определять отправителя только через left/right alignment.
- Показывать delivery status только иконкой или цветом.
- Скрывать retry action для failed outgoing message.
- Смешивать AI и human messages без явной маркировки.
- Создавать custom bubble colors вне component tokens.
- Делать hover-revealed actions недоступными с клавиатуры.
- Рендерить empty bubble без содержимого.
