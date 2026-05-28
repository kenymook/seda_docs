# Alert

> **Category** · Feedback
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Alert](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=8-3867)

---

## 1. Key Principles / Принципы использования

### Что это

Alert — встроенное сообщение в контексте страницы, формы, блока или состояния данных. Он сообщает важную информацию, предупреждение, ошибку, успешный результат или AI-related status и остается в потоке контента, пока пользователь или система не изменит состояние.

В SEDA AI Alert является feedback contract: он должен явно описывать tone, priority, message content, action, dismiss behavior, accessibility, token mapping и handoff. AI может помогать формулировать текст и выбирать tone, но не должен использовать Alert как временный Toast, блокирующий Modal или декоративный баннер.

### Когда использовать

Используйте Alert, когда:

- нужно показать контекстное сообщение рядом с формой, таблицей, блоком или страницей;
- ошибка требует исправления, но не блокирует весь интерфейс модальным окном;
- предупреждение нужно сохранить видимым до действия пользователя;
- успешное состояние должно быть связано с конкретным блоком;
- требуется AI-related status: AI-generated, AI-assisted, needs review или confidence warning;
- сообщение содержит действие: retry, learn more, configure, review.

### Не используйте

Не используйте Alert, когда:

- нужно краткое временное уведомление после действия — используйте [Toast](toast.md);
- сценарий блокирующий и требует подтверждения — используйте [Modal](modal.md);
- нужно показать пустое состояние — используйте [Empty State](empty-state.md);
- сообщение относится к отдельному input — используйте form field validation;
- на странице появляется несколько Alert одного типа с одинаковым смыслом;
- сообщение используется как декоративная карточка или promo banner.

### Основные принципы

- **Tone matches meaning** — `danger`/`error` только для ошибок или риска, `warning` для потенциальной проблемы.
- **Message is actionable** — пользователь должен понимать, что произошло и что делать дальше.
- **Persistent by default** — Alert не исчезает автоматически как Toast.
- **One context, one message** — дублирующиеся Alerts нужно объединять.
- **Not color-only** — tone должен быть понятен по title, icon text или description.
- **AI status is explicit** — AI-related Alert должен объяснять, что сгенерировано, что проверять и кто принимает решение.
- **AI assists, system governs** — AI может предложить copy, но использует только documented variants, props, roles и tokens.

### Связанные спецификации

- [Toast](toast.md) — временное уведомление после действия.
- [Modal](modal.md) — блокирующее подтверждение или критичный сценарий.
- [Empty State](empty-state.md) — отсутствие данных или контента.
- [Form](../overlays-layout/form.md) — validation summary и ошибки формы.
- [Button](../actions/button.md) — действия внутри Alert.
- [Icon Button](../actions/icon-button.md) — close action.

---

## 2. Anatomy / Анатомия

| Slot | Обязательность | Описание |
|---|---:|---|
| `root` | Да | Контейнер Alert. Управляет tone, surface, border и layout. |
| `icon` | Рекомендуется | Семантическая иконка tone. |
| `title` | Да | Короткое сообщение, понятное без description. |
| `description` | Нет | Детали, причина, последствия или следующий шаг. |
| `action` | Нет | Link или Button для решения сценария. |
| `closeButton` | Условно | Close control для dismissible Alert. |

### Правила анатомии

- `title` обязателен и должен быть коротким.
- `description` не должен превращать Alert в документацию; для длинного текста используйте link или отдельный content block.
- `icon` не заменяет title и должен быть декоративным для screen reader, если смысл уже есть в тексте.
- `action` должен быть один основной; несколько действий требуют отдельного review.
- `closeButton` допустим только если скрытие Alert не удаляет критичную информацию.
- Alert не должен содержать nested Alert, Table, Form или сложный layout.

---

## 3. Types / Variants / Варианты

| Type | Когда использовать | Accessibility intent |
|---|---|---|
| `info` | Нейтральная контекстная информация. | Обычно `role="status"` или static content. |
| `success` | Операция завершилась успешно и сообщение должно остаться видимым. | `role="status"` для dynamic updates. |
| `warning` | Есть потенциальная проблема или риск. | `role="alert"` только если требуется немедленное объявление. |
| `danger` / `error` | Ошибка, риск потери данных, невозможность продолжить. | `role="alert"` для dynamic critical message. |
| `ai` | AI-generated/AI-assisted/needs-review status. | Text должен объяснять, что проверяет человек. |
| `neutral` | Служебная информация без status tone. | Static content или `role="status"` по контексту. |

### Modifiers

| Modifier | Описание | Правило |
|---|---|---|
| `dismissible` | Добавляет close button. | Нужен `dismissLabel` и focus behavior. |
| `withAction` | Добавляет action link/button. | Action должен быть связан с сообщением. |
| `withIcon` | Показывает tone icon. | Рекомендуется для warning/danger/ai. |
| `compact` | Плотный Alert для forms/tables. | Не снижать читаемость и hit area close button. |

---

## 4. Sizes / Размеры

| Size | Когда использовать | Примечание |
|---|---|---|
| `s` | Compact forms, table area, side panels. | Короткий title, optional description. |
| `m` | Базовый page/block Alert. | Default для большинства сценариев. |
| `l` | Секции с заметным сообщением. | Используйте осторожно. |
| `xl` | Page-level critical message. | Не использовать как hero/promo block. |

### Правила размеров

- Size задает плотность и визуальный вес, а не severity.
- Severity задается `type`, текстом и accessibility role.
- В формах и таблицах используйте `s` или `m`.
- Padding, radius, gap, icon size и typography пока задаются foundation rules и Figma variants, а не отдельными size tokens.

---

## 5. States / Состояния

| State | Где применяется | Правило |
|---|---|---|
| `default` | Root Alert. | Сообщение видно в потоке контента. |
| `dismissible` | Root + closeButton. | Alert можно скрыть без потери критичной информации. |
| `dismissed` | Alert скрыт. | Focus recovery должен быть предсказуемым. |
| `actionHover` | Action link/button. | Использует tokens вложенного Button/Link или `alert/action/*`. |
| `closeHover` | Close button. | Использует `alert/close/*` tokens. |
| `closeFocus` | Close button. | Focus ring видим и доступен с клавиатуры. |

### State rules

- Alert сам по себе обычно не является interactive control.
- Close button наследует behavior Icon Button, но использует Alert close tokens.
- Dismissed state не должен скрывать error, который пользователь обязан исправить.
- Dynamic Alert должен быть объявлен screen reader только тогда, когда сообщение действительно появилось или изменилось.

---

## 6. Behavior / Поведение

### Placement

- Alert размещается рядом с контекстом, к которому относится.
- Form-level Alert располагается перед полями или над группой ошибок.
- Table-level Alert располагается в toolbar/body area и не заменяет Empty State без причины.
- Page-level Alert располагается в верхней части content area, а не поверх navigation.

### Dismiss behavior

- Close button скрывает Alert только в текущем контексте.
- После закрытия фокус возвращается к логичному месту: trigger, следующий control или контейнер.
- Dismissible state должен быть сохранен, если продукт ожидает persistence между обновлениями.
- Critical danger Alert не должен быть dismissible без альтернативного способа увидеть проблему.

### Action behavior

- Action должен отвечать на вопрос "что делать дальше".
- Для retry используйте Button.
- Для справки или перехода используйте Link.
- Если action destructive или irreversible, нужен Modal или отдельный confirmation flow.

### AI-related behavior

- AI Alert должен объяснять, что именно AI сделал или оценил.
- Если требуется human review, это должно быть видно в title или description.
- AI Alert не должен обещать автоматическое решение проблемы.
- Финальное решение остается за человеком.

---

## 7. Accessibility

Alert должен следовать [foundation/accessibility.md](../../foundation/accessibility.md). Роль и live region выбираются по urgency, а не только по визуальному tone.

| Сценарий | Рекомендация | Когда |
|---|---|---|
| Critical dynamic error | `role="alert"` | Ошибка появилась после действия и требует внимания. |
| Warning dynamic update | `role="alert"` или `aria-live="polite"` | Зависит от urgency. |
| Info/success dynamic update | `role="status"` | Вежливое объявление результата. |
| Static Alert on page load | Static content без live region | Не надо повторно озвучивать весь экран. |
| Dismiss button | `aria-label` | Например `Закрыть предупреждение`. |
| Action | Native Button или Link | Accessible name совпадает со смыслом действия. |

### Accessibility checklist

- [ ] Title Alert понятен без цвета и иконки.
- [ ] Role выбран по urgency.
- [ ] Dynamic Alert не создает лишних announcements.
- [ ] Dismiss button имеет accessible name.
- [ ] Focus ring видим на close/action controls.
- [ ] Action label говорит, что произойдет.
- [ ] Warning/danger Alert содержит следующий шаг или причину.
- [ ] AI Alert явно говорит, что нужно проверить человеку.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Alert доступны component tokens в namespace `alert`; устаревшие aliases вида `--alert-*` не являются source of truth.

### Tone tokens

| Component token | Роль | Semantic mapping |
|---|---|---|
| `alert/surface/info` | Info surface. | `status/info/surface` |
| `alert/border/info` | Info border. | `status/info/border` |
| `alert/title/foreground/info` | Info title. | `status/info/text` |
| `alert/icon/info` | Info icon. | `status/info/icon` |
| `alert/surface/success` | Success surface. | `status/success/surface` |
| `alert/border/success` | Success border. | `status/success/border` |
| `alert/title/foreground/success` | Success title. | `status/success/text` |
| `alert/icon/success` | Success icon. | `status/success/icon` |
| `alert/surface/warning` | Warning surface. | `status/warning/surface` |
| `alert/border/warning` | Warning border. | `status/warning/border` |
| `alert/title/foreground/warning` | Warning title. | `status/warning/text` |
| `alert/icon/warning` | Warning icon. | `status/warning/icon` |
| `alert/surface/danger` | Danger surface. | `status/danger/surface` |
| `alert/border/danger` | Danger border. | `status/danger/border` |
| `alert/title/foreground/danger` | Danger title. | `status/danger/text` |
| `alert/icon/danger` | Danger icon. | `status/danger/icon` |
| `alert/surface/neutral` | Neutral surface. | `surface/subtle` |
| `alert/border/neutral` | Neutral border. | `border/default` |
| `alert/title/foreground/default` | Default title. | `text/primary` |
| `alert/icon/neutral` | Neutral icon. | `icon/secondary` |

### Content and controls

| Component token | Роль | Semantic mapping |
|---|---|---|
| `alert/description/foreground` | Description base text. | `text/secondary` |
| `alert/description/foreground/default` | Default description text. | `text/secondary` |
| `alert/description/foreground/info` | Info description text. | `text/secondary` |
| `alert/description/foreground/success` | Success description text. | `text/secondary` |
| `alert/description/foreground/warning` | Warning description text. | `text/secondary` |
| `alert/description/foreground/danger` | Danger description text. | `text/secondary` |
| `alert/action/foreground/default` | Action text. | `text/primary` |
| `alert/action/foreground/hover` | Action hover text. | `text/brand` |
| `alert/close/icon/default` | Close icon. | `icon/tertiary` |
| `alert/close/icon/hover` | Close icon hover. | `icon/primary` |
| `alert/close/surface/hover` | Close hover surface. | `container/neutral/hover` |
| `alert/close/surface/active` | Close active surface. | `container/neutral/pressed` |
| `alert/focus/ring` | Focus ring. | `focus/ring` |

### Token gaps

- Figma содержит `Type=ai`, но в `tokens.json` пока нет отдельной AI-ветки для Alert. До появления component tokens AI Alert должен использовать documented fallback и быть помечен как token gap.
- Size, padding, radius, gap, icon size, close button geometry и motion tokens пока описаны foundation rules и Figma variants, а не отдельными Alert component tokens.
- Не придумывайте новые Alert token paths без обновления `tokens.json` и Figma bindings.

---

## 9. Code mapping

| Spec concept | Code prop / attribute | Notes |
|---|---|---|
| Type | `type` | Values: `info`, `success`, `warning`, `danger`, `ai`, `neutral`. |
| Size | `size` | Values: `s`, `m`, `l`, `xl`. |
| Title | `title` | Обязательный visible text. |
| Description | `description` | Optional context. |
| Icon | `showIcon`, `icon` | Icon не заменяет title. |
| Action | `action`, `actionLabel`, `onAction` | Button/Link по контексту. |
| Dismissible | `dismissible`, `onDismiss`, `dismissLabel` | Требует focus recovery. |
| Role | `role` | `alert`, `status` или static по urgency. |
| Live region | `aria-live` | Только для dynamic updates. |

### Contract rules

- `title` обязателен.
- `type="ai"` требует clear human review message.
- `dismissible=true` требует `dismissLabel`.
- `role="alert"` не используется для каждого статичного warning на странице.
- `action` должен иметь один понятный next step.
- Raw colors и invented token props запрещены.

---

## 10. Handoff notes

Handoff для Alert должен фиксировать:

- context: page, form, table, section или field group;
- type/tone и urgency;
- title, description и action copy;
- role/live region behavior;
- dismissible behavior и focus recovery;
- condition, при котором Alert появляется и исчезает;
- token mapping для surface, border, title, description, icon, action, close и focus;
- AI-related review rules, если `type="ai"`;
- token gap для AI tone, если используется Figma `Type=ai`.

---

## 11. Acceptance criteria

- [ ] Alert расположен рядом с контекстом сообщения.
- [ ] Title понятен без description, цвета и иконки.
- [ ] Type соответствует смыслу сообщения.
- [ ] Warning/danger Alert содержит причину или следующий шаг.
- [ ] Role/live region выбран по urgency.
- [ ] Dismissible Alert имеет accessible close label и focus recovery.
- [ ] Action label описывает конкретное действие.
- [ ] AI Alert явно говорит, что AI сделал и что проверяет человек.
- [ ] Используются реальные Alert component tokens из `tokens.json`.
- [ ] `Type=ai` помечен как token gap до появления Alert AI tokens.

---

## 12. AI usage rules

AI может:

- предложить title, description и action copy для Alert;
- проверить, нужен ли Alert, Toast, Modal, Empty State или field validation;
- выбрать preliminary type по смыслу сообщения;
- подготовить handoff notes и acceptance criteria;
- найти missing action, missing role, color-only warning и token gaps.

AI не должен:

- использовать Alert как временный Toast;
- использовать Alert для блокирующего confirmation вместо Modal;
- придумывать Alert token paths для AI tone;
- делать warning/danger сообщение без причины или next step;
- использовать `role="alert"` для всех сообщений подряд;
- обещать, что AI сам исправит проблему без human review.

Если Alert связан с платежами, правами доступа, безопасностью, персональными данными, irreversible action или AI-generated decision, AI должен пометить сценарий как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Сценарий | Решение |
|---|---|
| Ошибка отправки формы. | Danger Alert над формой с причиной и action `Повторить`. |
| Предупреждение перед публикацией. | Warning Alert с описанием риска и ссылкой на настройки. |
| Настройки сохранены в текущем разделе. | Success Alert в контексте формы, если Toast недостаточен. |
| AI summary требует проверки. | AI Alert с текстом `Проверьте вывод перед публикацией`. |

### Требует review

| Сценарий | Что проверить |
|---|---|
| Alert появляется после каждого мелкого действия. | Возможно, нужен Toast. |
| Critical danger Alert можно закрыть без альтернативы. | Риск потери важной информации. |
| AI Alert говорит `Все исправлено автоматически`. | Нужна human validation. |
| На странице пять warning Alerts подряд. | Нужно объединить сообщения или изменить IA. |

---

## 14. Anti-patterns

- Использовать Alert как Toast.
- Использовать Alert как Modal confirmation.
- Передавать severity только цветом.
- Делать Alert без next step, когда пользователь должен действовать.
- Размещать несколько одинаковых Alerts подряд.
- Прятать critical error через dismiss без восстановления.
- Использовать AI tone без текста о human review.
- Добавлять custom colors вместо documented Alert component tokens.
