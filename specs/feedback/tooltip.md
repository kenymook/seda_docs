# Tooltip

> **Category** · Feedback
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Tooltip](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6649-54)

---

## 1. Key Principles

### Что это

Tooltip — короткая неинтерактивная подсказка, которая появляется при hover или focus на trigger. Она поясняет назначение элемента, раскрывает усеченный текст или добавляет короткий контекст, но не заменяет видимый label, help text, validation или инструкцию.

В SEDA AI Tooltip является вспомогательным feedback layer. Важная информация должна быть доступна без необходимости открыть Tooltip; если внутри нужны actions, ссылки, форма или длинное объяснение, используется Popover, Alert или видимый контент.

### Когда использовать

- Icon-only action нуждается в видимом пояснении при hover/focus.
- Текст усечен, и нужно показать полное значение.
- Элемент имеет неочевидное назначение, но менять layout нецелесообразно.
- Нужно дать короткую справочную подсказку без интерактива внутри.
- Нужно пояснить статус в таблице или плотном интерфейсе, если информация не критична.

### Когда не использовать

- Информация критична для выполнения задачи.
- Нужен интерактивный контент — используйте [Popover](popover.md).
- Нужно показать ошибку формы — используйте inline validation или [Alert](alert.md).
- Текст длиннее 1-2 коротких строк.
- Mobile-only сценарий не имеет альтернативы hover.
- Tooltip становится единственным label действия.

### Ключевые принципы

- **Text only** — Tooltip не содержит Button, Link, form controls и других focusable elements.
- **Enhance, do not replace** — Tooltip дополняет интерфейс, но не заменяет label, validation или instruction.
- **Hover and focus parity** — подсказка доступна и мышью, и с клавиатуры.
- **Escape closes** — пользователь может закрыть Tooltip клавишей `Escape`.
- **No critical content** — важная информация должна быть видима без Tooltip.
- **AI assists, system governs** — AI может предложить короткий текст, но не меняет границы Tooltip и Popover.

### Связанные спецификации

- [Popover](popover.md) — интерактивный или более длинный contextual content.
- [Alert](alert.md) — важная информация в потоке.
- [Icon Button](../actions/icon-button.md) — основной потребитель Tooltip.
- [Button](../actions/button.md) — trigger behavior и accessible name.

---

## 2. Anatomy

```text
[trigger]
   ^
[tooltip surface]
  content
```

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `trigger` | да | Элемент, к которому относится подсказка. |
| `surface` | да | Контейнер текста подсказки. |
| `content` | да | Короткий текст подсказки. |
| `arrow` | опционально | Визуальная привязка к trigger. |

### Правила anatomy

- `content` должен быть текстовым и коротким.
- `surface` не получает focus.
- `arrow` не несет смысловой информации.
- Tooltip не содержит header, footer, action, close button или fields.
- Trigger должен иметь собственный accessible name; Tooltip может быть description, но не единственным именем действия.

---

## 3. Types / Variants

Figma component set использует variant properties `type`, `placement`, `arrow` и `size`.

### Type

| `type` | Когда использовать | Token mapping |
| --- | --- | --- |
| `default` | Default tooltip на светлой или нейтральной поверхности. | `tooltip/dark/surface`, `tooltip/dark/foreground`, `tooltip/arrow/dark` |
| `light` | Tooltip на темной, насыщенной или inverse поверхности. | `tooltip/light/surface`, `tooltip/light/foreground`, `tooltip/light/border`, `tooltip/arrow/light` |

### Token naming note

Figma использует `type=default`, а tokens используют группу dark для темной поверхности. В реализации `type=default` маппится на реальные dark tokens Tooltip. `tooltip/default/foreground` остается fallback foreground для default tooltip, но поверхность берется из `tooltip/dark/surface`.

### Placement

| `placement` | Когда использовать |
| --- | --- |
| `top` | Default для toolbar и icon buttons. |
| `bottom` | Если сверху нет места. |
| `left` | Для элементов у правого края. |
| `right` | Для элементов у левого края. |

### Arrow

| `arrow` | Правило |
| --- | --- |
| `true` | Используйте, если нужна визуальная привязка к trigger. |
| `false` | Используйте в плотных интерфейсах или когда связь с trigger очевидна. |

---

## 4. Sizes

Figma component set использует variant property `size`.

| `size` | Назначение | Правила |
| --- | --- | --- |
| `s` | Очень короткий label или action hint. | 1 строка, без сложных терминов. |
| `m` | Default Tooltip. | 1-2 короткие строки. |
| `l` | Более длинное пояснение в рамках tooltip-сценария. | Проверить, не нужен ли Popover/help text. |
| `xl` | Максимально допустимое пояснение. | Не использовать для инструкций и критичной информации. |

### Правила размеров

- Tooltip не должен задавать пустую фиксированную ширину.
- Текст переносится на 1-2 короткие строки.
- Если текст не помещается в `xl`, используйте Popover, Alert или visible help text.
- Padding, radius, max width и arrow size должны ссылаться на foundation rules до появления component tokens.

---

## 5. States

| State | Когда возникает | Поведение |
| --- | --- | --- |
| `closed` | Tooltip скрыт. | Не участвует в tab navigation. |
| `delayed-open` | Trigger получил hover/focus, идет короткая задержка. | Задержка не должна мешать keyboard users. |
| `open` | Tooltip видим. | Trigger связан с подсказкой через `aria-describedby`. |
| `closing` | Pointer leave, blur или `Escape`. | Tooltip скрывается без изменения focus. |
| `reduced-motion` | Пользователь предпочитает меньше motion. | Появление без перемещения. |

### Unsupported states

Tooltip не получает `selected`, `disabled`, `error`, `loading` или `active` как собственные состояния. Эти состояния принадлежат trigger или родительскому компоненту.

---

## 6. Behavior

### Открытие и закрытие

- Tooltip открывается по hover и focus.
- Tooltip закрывается по pointer leave, blur и `Escape`.
- Tooltip не открывается напрямую на disabled native elements; используйте wrapper и visible explanation, если пояснение важно.
- При смене placement Tooltip не должен перекрывать trigger так, чтобы пользователь терял hover.

### Positioning

- Placement может автоматически flip/shift при выходе за viewport.
- Tooltip должен оставаться визуально связанным с trigger.
- На mobile нужен fallback: visible label, help text или Popover-like pattern.

### Content

- Текст отвечает на вопрос "что это" или "что произойдет".
- Не используйте Tooltip для инструкции из нескольких шагов.
- Не дублируйте видимый label без дополнительной пользы.
- Не скрывайте validation, error или обязательные правила только в Tooltip.

---

## 7. Accessibility

Tooltip следует [foundation/accessibility.md](../foundation/accessibility.md).

| Элемент | Атрибут | Правило |
| --- | --- | --- |
| Tooltip surface | `role="tooltip"` | Только для контейнера подсказки. |
| Trigger | `aria-describedby` | Указывает на Tooltip, когда подсказка доступна. |
| Trigger | Accessible name | Не должен зависеть только от Tooltip. |
| Keyboard | `Escape` | Закрывает видимый Tooltip. |

### Accessibility checklist

- [ ] Tooltip открывается по focus, не только по hover.
- [ ] Tooltip закрывается по `Escape`.
- [ ] В Tooltip нет focusable controls.
- [ ] Текст не содержит критичную информацию.
- [ ] Trigger имеет собственный accessible name.
- [ ] Disabled element не является единственной точкой доступа к объяснению.
- [ ] Mobile fallback описан, если сценарий важен.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Элемент | Component token | Роль | Semantic token |
| --- | --- | --- | --- |
| Default foreground | `tooltip/default/foreground` | Fallback text color для default Tooltip. | `text/on-inverse/primary` |
| Light surface | `tooltip/light/surface` | Фон light Tooltip. | `surface/overlay` |
| Light foreground | `tooltip/light/foreground` | Текст light Tooltip. | `text/primary` |
| Light border | `tooltip/light/border` | Граница light Tooltip. | `border/default` |
| Dark surface | `tooltip/dark/surface` | Фон default/dark Tooltip. | `surface/inverse` |
| Dark foreground | `tooltip/dark/foreground` | Текст default/dark Tooltip. | `text/on-inverse/primary` |
| Arrow dark | `tooltip/arrow/dark` | Arrow для `type=default`. | `surface/inverse` |
| Arrow light | `tooltip/arrow/light` | Arrow для `type=light`. | `surface/overlay` |

### Token gaps

- Нет component tokens для shadow, radius, padding, max width, arrow size, placement offset и motion.
- Нет отдельного default surface token; `type=default` маппится на dark surface.
- Не создавайте новые token names для placement, delay или arrow geometry без system review.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правила |
| --- | --- | --- |
| Content | `content` | Обязательный короткий текст. |
| Type | `type` | `default`, `light`. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Placement | `placement` | `top`, `bottom`, `left`, `right`. |
| Arrow | `arrow` / `withArrow` | Boolean, соответствует Figma `true/false`. |
| Delay | `delay` | Короткая задержка допустима, но не должна скрывать feedback. |
| Disabled | `disabled` | Отключает Tooltip, если подсказка не нужна. |
| Controlled state | `open`, `onOpenChange` | Только для специальных сценариев. |

### Contract rules

- `type`, `size`, `placement` и `arrow` должны соответствовать Figma variants.
- Tooltip не принимает interactive children.
- Tooltip не должен быть click-trigger; для click behavior используйте Popover.
- Trigger должен иметь accessible name независимо от Tooltip.
- Не добавляйте arbitrary color, shadow, width или delay без system review.

---

## 10. Handoff notes

В handoff нужно передать:

- trigger element и его accessible name;
- content text;
- `type`, `size`, `placement` и `arrow`;
- hover/focus behavior;
- delay и close behavior;
- mobile fallback;
- есть ли риск, что Tooltip содержит critical information;
- почему Popover не нужен, если есть сомнение;
- token mapping, включая `type=default` → dark tokens;
- token gaps для radius, padding, max width, arrow geometry и motion.

### Acceptance criteria

- Tooltip содержит только текст и не содержит интерактивных элементов.
- Tooltip доступен по hover и focus.
- Tooltip закрывается по `Escape`.
- Trigger имеет собственный accessible name.
- Важная информация не спрятана только в Tooltip.
- Длинный текст перенесен в Popover, Alert или help text.
- Placement не выводит Tooltip за viewport.
- Token mapping соответствует documented Tooltip component tokens.

---

## 11. AI usage rules

- AI может использовать только `type`: `default`, `light`.
- AI может использовать только `size`: `s`, `m`, `l`, `xl`.
- AI может использовать только `placement`: `top`, `bottom`, `left`, `right`.
- AI не должен добавлять Button, Link, form controls или close button внутрь Tooltip.
- AI не должен использовать Tooltip как единственный label действия.
- AI должен проверять, не нужен ли Popover, Alert, visible help text или inline validation.
- AI не должен придумывать Tooltip tokens, custom placement, shadow, width или motion values.
- AI должен помечать interactive content, long text, critical information, missing keyboard access и missing mobile fallback как `Needs system review`.
- AI может подготовить короткий tooltip text и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Примеры

### Корректно

| Сценарий | Решение |
| --- | --- |
| Icon Button с иконкой удаления. | Tooltip `Удалить`, trigger все равно имеет `aria-label="Удалить"`. |
| Усеченное имя файла. | Tooltip показывает полное имя при hover/focus. |
| Короткое пояснение статуса в таблице. | Tooltip содержит вспомогательный текст, не критичный для действия. |
| Темная панель с подсказкой. | `type=light`, чтобы сохранить контраст. |

### Требует review

| Сценарий | Почему |
| --- | --- |
| Tooltip содержит две длинные строки. | Возможно, нужен Popover или help text. |
| Tooltip объясняет disabled action. | Проверьте, не нужно ли сделать объяснение видимым без hover. |
| Tooltip используется в mobile-only интерфейсе. | Нужен альтернативный паттерн. |
| Tooltip содержит ссылку. | Это Popover, не Tooltip. |

---

## 13. Anti-patterns

- Помещать интерактивные controls в Tooltip.
- Использовать Tooltip вместо visible label.
- Прятать ошибку или обязательное правило только в Tooltip.
- Дублировать видимый текст без дополнительного смысла.
- Использовать click-trigger вместо Popover.
- Оставлять Tooltip недоступным с клавиатуры.
- Создавать локальные colors, shadows или widths вне documented tokens.
