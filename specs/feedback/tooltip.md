# Tooltip

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `content.md`, `interaction-model.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Tooltip — короткая неинтерактивная подсказка, которая появляется при hover или focus на trigger. Она поясняет назначение элемента, раскрывает усеченный текст или добавляет короткий контекст, но не заменяет видимый label.

В SEDA AI Tooltip используется как вспомогательный feedback layer. Важная информация должна быть видима в интерфейсе без необходимости открывать Tooltip.

### Когда использовать

Используйте Tooltip, когда:

- icon-only button нуждается в видимом пояснении при hover/focus;
- текст усечен и нужно показать полное значение;
- элемент имеет неочевидное назначение, но менять layout нецелесообразно;
- нужно дать короткую подсказку без действия пользователя внутри подсказки.

### Не используйте

Не используйте Tooltip, когда:

- информация критична для выполнения задачи;
- нужен интерактивный контент — используйте [Popover](../specs/feedback/popover.md);
- нужно показать ошибку формы — используйте inline validation или [Alert](../specs/feedback/alert.md);
- текст длиннее 1-2 коротких строк;
- mobile-сценарий не имеет понятной альтернативы hover.

### Основные принципы

- **Text only** — Tooltip не содержит кнопок, ссылок, полей и других focusable controls.
- **Enhance, do not replace** — Tooltip дополняет интерфейс, но не заменяет label, validation или instruction.
- **Hover and focus parity** — подсказка доступна и мышью, и с клавиатуры.
- **Escape closes** — пользователь может закрыть Tooltip клавишей `Escape`.
- **No critical content** — важная информация должна быть доступна без Tooltip.
- **AI drafts, human validates** — AI может предложить короткий текст, но человек проверяет ясность и доступность.

### Связанные спецификации

- [Popover](../specs/feedback/popover.md) — для интерактивного контента.
- [Alert](../specs/feedback/alert.md) — для важной информации в потоке.
- [Icon Button](../specs/actions/icon-button.md) — основной потребитель Tooltip.
- [Button](../specs/actions/button.md) — trigger behavior и accessible name.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `trigger` | Да | Элемент, к которому относится подсказка. |
| `surface` | Да | Контейнер tooltip-текста. |
| `content` | Да | Короткий текст подсказки. |
| `arrow` | Нет | Визуальная привязка к trigger. |

### Правила анатомии

- `content` должен быть текстовым и коротким.
- `surface` не получает focus.
- `arrow` не обязателен и не несет смысловой информации.
- Tooltip не содержит header, footer, action или close button.
- Trigger должен иметь собственный accessible name; Tooltip может быть описанием, но не единственным именем действия.

---

## 3. Types / Variants / Варианты

| Variant | Когда использовать | Token mapping |
|---|---|---|
| `dark` | Default на светлых поверхностях. | Dark Tooltip component tokens. |
| `light` | На темных или насыщенных поверхностях. | Light Tooltip component tokens. |

### Placement

| Placement | Когда использовать |
|---|---|
| `top` | Default для toolbar и icon buttons. |
| `bottom` | Если сверху нет места. |
| `left` | Для элементов у правого края. |
| `right` | Для элементов у левого края. |
| `top-start` / `top-end` | Когда нужна привязка к краю trigger. |
| `bottom-start` / `bottom-end` | Для элементов в строках или таблицах. |

### Trigger modes

| Trigger mode | Когда использовать | Правило |
|---|---|---|
| `hover` | Pointer interaction. | Работает вместе с focus. |
| `focus` | Keyboard interaction. | Обязателен для keyboard users. |
| `manual` | Controlled сценарий, например guided help. | Требует отдельного review. |

`click` не является стандартным trigger для Tooltip. Если нужно click behavior, используйте Popover.

---

## 4. Sizes / Размеры

Tooltip не имеет размерных вариантов как control. Размер определяется контентом и ограничениями ширины.

| Size rule | Значение | Правило |
|---|---:|---|
| Min width | content-based | Не задавайте пустую фиксированную ширину. |
| Max width | 240-320px | Текст переносится на 1-2 короткие строки. |
| Padding | foundation spacing | Не добавлять произвольные отступы без tokens. |
| Arrow size | foundation rule | Не должен менять layout. |

Если текст не помещается в 1-2 строки, это не Tooltip-сценарий. Используйте Popover, Alert или видимый help text.

---

## 5. States / Состояния

| Состояние | Когда возникает | Правило |
|---|---|---|
| `closed` | Tooltip скрыт. | Не участвует в чтении и tab navigation. |
| `delayed-open` | Trigger получил hover/focus, идет короткая задержка. | Задержка не должна мешать keyboard users. |
| `open` | Tooltip видим. | Trigger связан через `aria-describedby`. |
| `closing` | Pointer leave, blur или `Escape`. | Tooltip скрывается без изменения focus. |
| `reduced-motion` | Пользователь отключил motion. | Появление без перемещения. |

---

## 6. Behavior / Поведение

### Открытие и закрытие

- Tooltip открывается по hover и focus.
- Tooltip закрывается по pointer leave, blur и `Escape`.
- Tooltip не открывается у disabled native elements напрямую; используйте wrapper с доступным объяснением, если это нужно.
- При смене placement Tooltip не должен перекрывать trigger так, чтобы пользователь терял hover.

### Positioning

- Placement может автоматически flip/shift при выходе за viewport.
- Tooltip должен оставаться визуально связанным с trigger.
- На mobile нужно предусмотреть альтернативу: visible label, help text или Popover-like pattern.

### Content

- Текст должен отвечать на вопрос "что это" или "что произойдет".
- Не используйте Tooltip для инструкции из нескольких шагов.
- Не дублируйте видимый label без дополнительной пользы.

---

## 7. Accessibility

| Элемент | Атрибут | Правило |
|---|---|---|
| Tooltip surface | `role="tooltip"` | Только для контейнера подсказки. |
| Trigger | `aria-describedby` | Указывает на Tooltip, когда он доступен. |
| Trigger | Accessible name | Не должен зависеть только от Tooltip. |

### Accessibility checklist

- [ ] Tooltip открывается по focus, не только по hover.
- [ ] Tooltip закрывается по `Escape`.
- [ ] В Tooltip нет focusable controls.
- [ ] Текст не содержит критичной информации.
- [ ] Trigger имеет собственное accessible name.
- [ ] Disabled element не является единственной точкой доступа к объяснению.
- [ ] Mobile fallback описан, если сценарий важен.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Tooltip доступны component tokens в namespace `tooltip`.

| Component token | Роль | Semantic token |
|---|---|---|
| `tooltip/default/foreground` | Текст default Tooltip. | `text/on-inverse/primary` |
| `tooltip/light/surface` | Фон light Tooltip. | `surface/overlay` |
| `tooltip/light/foreground` | Текст light Tooltip. | `text/primary` |
| `tooltip/light/border` | Граница light Tooltip. | `border/default` |
| `tooltip/dark/surface` | Фон dark Tooltip. | `surface/inverse` |
| `tooltip/dark/foreground` | Текст dark Tooltip. | `text/on-inverse/primary` |
| `tooltip/arrow/dark` | Arrow для dark Tooltip. | `surface/inverse` |
| `tooltip/arrow/light` | Arrow для light Tooltip. | `surface/overlay` |

Token gap: отдельные component tokens для shadow, radius, padding, max width, arrow size и motion пока не выделены. До появления таких tokens эти параметры должны ссылаться на foundation rules.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Текст | `content` | Обязательный короткий текст. |
| Variant | `variant` | `dark` или `light`. |
| Placement | `placement` | `top`, `bottom`, `left`, `right` и alignment. |
| Arrow | `withArrow` | Включает визуальную стрелку. |
| Delay | `delay` | Короткая задержка допускается, но не должна скрывать feedback. |
| Disabled | `disabled` | Отключает Tooltip, если подсказка не нужна. |
| Controlled state | `open`, `onOpenChange` | Только для специальных сценариев. |

---

## 10. Handoff notes

Handoff для Tooltip должен фиксировать:

- trigger element и его accessible name;
- content text;
- variant и placement;
- нужен ли arrow;
- hover/focus behavior;
- mobile fallback;
- есть ли риск, что Tooltip содержит критичную информацию;
- почему Popover не нужен, если есть сомнение.

---

## 11. Acceptance criteria

- [ ] Tooltip содержит только текст и не содержит интерактивных элементов.
- [ ] Tooltip доступен по hover и focus.
- [ ] Tooltip закрывается по `Escape`.
- [ ] Trigger имеет собственное accessible name.
- [ ] Важная информация не спрятана только в Tooltip.
- [ ] Длинный текст перенесен в Popover, Alert или help text.
- [ ] Placement не выводит Tooltip за viewport.
- [ ] Token mapping соответствует documented Tooltip component tokens из `tokens.json`.

---

## 12. AI usage rules

AI может:

- предложить короткий текст Tooltip для icon-only action;
- проверить, не нужен ли Popover вместо Tooltip;
- найти случаи, где Tooltip скрывает критичную информацию;
- подготовить acceptance criteria для hover/focus behavior.

AI не должен:

- добавлять кнопки, ссылки или формы внутрь Tooltip;
- использовать Tooltip как единственный label действия;
- прятать validation, error или critical instruction в Tooltip;
- создавать новые token paths без `Token gap`;
- игнорировать mobile fallback.

Если подсказка должна быть интерактивной или длинной, AI должен пометить сценарий как `Needs system review`.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Icon Button с Tooltip `Удалить`. | Tooltip поясняет icon-only действие. |
| Усеченное имя файла раскрывается при hover/focus. | Пользователь получает полное значение без изменения layout. |
| Короткое пояснение статуса в таблице. | Информация вспомогательная и не критичная. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Tooltip содержит две длинные строки. | Возможно, нужен Popover или help text. |
| Tooltip объясняет disabled action. | Нужно ли сделать объяснение видимым без hover. |
| Tooltip используется на mobile-only интерфейсе. | Нужен альтернативный паттерн. |

---

## 14. Anti-patterns

- Помещать интерактивные controls в Tooltip.
- Использовать Tooltip вместо visible label.
- Прятать ошибку или обязательное правило только в Tooltip.
- Дублировать видимый текст без дополнительного смысла.
- Использовать click-trigger вместо Popover.
- Оставлять Tooltip недоступным с клавиатуры.
