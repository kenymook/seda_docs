# Toast / Snackbar

> **Category** · Feedback
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Toast](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6652-62)

---

## 1. Key Principles

### Что это

Toast / Snackbar — временное уведомление поверх интерфейса. Оно сообщает результат действия или короткое системное событие и исчезает автоматически либо по действию пользователя.

В SEDA AI Toast описывает non-blocking feedback contract: критичность сообщения, краткий текст, одно возможное действие, dismiss behavior, очередь, accessibility, motion и token mapping. Toast не должен скрывать критичные ошибки, заменять inline validation или блокировать основной workflow. Как часть AI-ready design system framework, Toast должен иметь настолько явные rules, чтобы AI не использовал временное уведомление для ошибок, требующих исправления.

### Когда использовать

- Нужно подтвердить успешное завершение действия.
- Фоновая операция завершилась и не требует немедленного решения.
- Пользователь может продолжать основной workflow.
- Сообщение короткое и не должно занимать место в layout.
- Нужен один вторичный action: `Отменить`, `Повторить`, `Подробнее`.

### Когда не использовать

- Ошибка требует исправления в форме — используйте inline validation или [Alert](alert.md).
- Сообщение критично и должно оставаться видимым.
- Сценарий блокирует продолжение — используйте [Modal](modal.md).
- Сообщение содержит длинный текст, таблицу или несколько действий.
- Нужно показать progress или loading — используйте [Spinner](spinner.md) или [Progress Bar](progress-bar.md).
- Очередь уведомлений не управляется и может перекрыть важный UI.

### Ключевые принципы

- **Feedback after action** — Toast появляется как реакция на действие или системное событие.
- **Short and actionable** — текст короткий, действие одно и понятное.
- **Queue is governed** — очередь ограничена и не перекрывает важный интерфейс.
- **Do not hide errors** — ошибки, требующие исправления, остаются рядом с проблемой.
- **Motion is respectful** — animation короткая и имеет reduced-motion fallback.
- **AI assists, system governs** — AI может подготовить текст и queue policy, но человек проверяет смысл, критичность и доступность.

### Связанные спецификации

- [Alert](alert.md) — видимый feedback в контексте.
- [Modal](modal.md) — blocking confirmation или критичный сценарий.
- [Notification Center](../overlays-layout/notification-center.md) — история уведомлений и системных событий.
- [Spinner](spinner.md) — неопределенная загрузка.
- [Progress Bar](progress-bar.md) — измеримый прогресс.
- [Button](../actions/button.md) — action и close controls.

---

## 2. Anatomy

```text
[icon] Title                 [close]
       Description
       [Action]
```

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `container` | да | Поверхность Toast. |
| `icon` | условно | Семантическая иконка типа сообщения. |
| `title` | да | Короткий текст результата или события. |
| `description` | опционально | Дополнительная деталь, если title недостаточен. |
| `action` | опционально | Одно действие: undo, retry, details. |
| `close` | условно | Ручное закрытие для dismissible или persistent Toast. |
| `timer` | опционально | Визуальный индикатор auto-dismiss, если продукт его поддерживает. |

### Правила anatomy

- `title` должен быть понятен без description.
- `description` не используется для длинных инструкций.
- `action` допускается только одно; два и более actions переводят сценарий в Alert или Modal.
- `close` нужен для Toast с action, persistent behavior или длительным сообщением.
- Иконка поддерживает смысл, но не заменяет текст.

---

## 3. Types / Variants

Figma component set использует variant properties `type`, `dismissible` и `size`.

### Type

| `type` | Когда использовать | Accessibility role |
| --- | --- | --- |
| `neutral` | Нейтральное событие: скопировано, сохранено локально, действие принято. | `status` |
| `info` | Информационное сообщение без риска. | `status` |
| `success` | Действие успешно завершено. | `status` |
| `warning` | Есть риск или частичная проблема, workflow не заблокирован. | `status` или `alert` по критичности. |
| `error` | Фоновое действие не удалось или требуется retry/details. | `alert`, если сообщение критично. |

### Dismissible

| `dismissible` | Когда использовать |
| --- | --- |
| `true` | Toast можно закрыть вручную; рекомендуется для action, warning/error и persistent behavior. |
| `false` | Короткое auto-dismiss сообщение без действия. |

### Token naming note

Figma использует `type=error`, а tokens используют `danger` для соответствующих surface/icon colors. В реализации `type=error` маппится на `toast/surface/danger` и `toast/icon/danger`.

---

## 4. Sizes

Figma component set использует variant property `size`.

| `size` | Назначение | Правила |
| --- | --- | --- |
| `s` | Короткий title без description. | Не использовать для action-heavy сообщений. |
| `m` | Default: title, optional description, optional action. | Подходит для большинства Toast. |
| `l` | Более длинный title или description. | Проверить, не нужен ли Alert. |
| `xl` | Максимальный Toast для фоновых операций с detail/action. | Не использовать как замену persistent panel. |

### Правила размеров

- Toast не должен перекрывать основной workflow.
- На mobile Toast занимает доступную ширину с безопасными отступами.
- Если текст не помещается в `xl`, сократите сообщение или используйте Alert/Modal.
- Одновременно показывайте не больше трех Toast.

---

## 5. States

| State | Когда возникает | Поведение |
| --- | --- | --- |
| `queued` | Toast ожидает показа. | Очередь управляется системой уведомлений. |
| `entering` | Toast появляется. | Короткая animation с reduced-motion fallback. |
| `visible` | Toast полностью видим. | Timer идет, если Toast не persistent. |
| `paused` | Hover, focus внутри Toast или взаимодействие. | Auto-dismiss timer приостанавливается. |
| `exiting` | Toast закрывается автоматически или вручную. | Focus не должен теряться. |
| `persistent` | Toast остается до действия пользователя. | Нужен close или action. |

### State ownership

- Toast system владеет queue, timing, dedupe и placement.
- Toast item владеет title, description, action, close и live region behavior.
- Button или Link внутри Toast владеют собственными focus/hover/active states.

### Feedback boundary

| Сценарий | Используйте | Почему |
| --- | --- | --- |
| Действие успешно завершено и не требует решения | Toast | Временный non-blocking feedback. |
| Ошибка относится к конкретному полю формы | Inline validation | Пользователь должен исправить проблему рядом с полем. |
| Сообщение должно оставаться в контексте страницы | Alert | Persistent feedback виден без таймера. |
| Событие должно сохраняться в истории | Notification Center | Toast не является журналом событий. |
| Нужно подтвердить рискованное действие | Modal | Требуется blocking decision. |

---

## 6. Behavior

### Auto-dismiss

- Default duration: 4-6 секунд для `neutral`, `info` и `success`.
- `warning` и `error` могут быть persistent, если сообщение важно.
- Timer приостанавливается при hover и focus внутри Toast.
- Toast с action не должен исчезать до того, как пользователь успеет прочитать действие.

### Queue management

- Одновременно показывайте не больше трех Toast.
- Новые сообщения добавляются в очередь или заменяют менее важные по policy продукта.
- Повторяющиеся Toast должны группироваться, dedupe-иться или обновлять существующий item.
- Очередь не должна скрывать Modal, critical Alert, navigation или основные controls.

### Position

- Position должна быть постоянной в рамках продукта.
- Desktop default: top-right или bottom-right в зависимости от navigation.
- Mobile default: bottom-center или bottom safe area, если это не перекрывает primary action.
- Position является application-level rule, а не свойством отдельного Toast без причины.

### Motion

- Enter/exit animation короткая и не мешает чтению.
- При `prefers-reduced-motion: reduce` Toast появляется и исчезает без перемещения.
- Motion не является единственным сигналом появления уведомления.

---

## 7. Accessibility

Toast следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Элемент | Атрибут | Когда |
| --- | --- | --- |
| Toast region | `aria-live="polite"` | Для `neutral`, `info`, `success`. |
| Toast region | `aria-live="assertive"` | Только для критичных `warning` или `error`. |
| Toast item | `role="status"` | Нейтральные и успешные сообщения. |
| Toast item | `role="alert"` | Критичные warning/error. |
| Toast item | `aria-atomic="true"` | Чтобы сообщение читалось целиком. |
| Close button | Accessible name | Для dismissible/persistent Toast. |

### Accessibility checklist

- [ ] Toast не получает focus автоматически.
- [ ] Action и close доступны с клавиатуры.
- [ ] Auto-dismiss приостанавливается при focus внутри Toast.
- [ ] Критичные сообщения не исчезают слишком быстро.
- [ ] Смысл не передается только цветом или иконкой.
- [ ] Screen reader announcement соответствует критичности.
- [ ] Motion имеет reduced-motion fallback.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Элемент | Component token | Роль | Semantic token |
| --- | --- | --- | --- |
| Surface neutral | `toast/surface/default` | Фон neutral Toast. | `surface/inverse` |
| Surface info | `toast/surface/info` | Фон info Toast. | `container/info/default` |
| Surface success | `toast/surface/success` | Фон success Toast. | `container/success/default` |
| Surface warning | `toast/surface/warning` | Фон warning Toast. | `container/warning/default` |
| Surface error | `toast/surface/danger` | Фон `type=error`. | `container/danger/default` |
| Foreground default | `toast/foreground/default` | Основной текст на neutral surface. | `text/on-inverse/primary` |
| Foreground secondary | `toast/foreground/secondary` | Вторичный текст на neutral surface. | `text/on-inverse/secondary` |
| Foreground on status | `toast/foreground/onStatus` | Текст на status surface. | `text/on-brand/primary` |
| Icon neutral | `toast/icon/default` | Иконка neutral Toast. | `icon/inverse` |
| Icon info | `toast/icon/info` | Иконка info Toast. | `text/on-info/primary` |
| Icon success | `toast/icon/success` | Иконка success Toast. | `text/on-success/primary` |
| Icon warning | `toast/icon/warning` | Иконка warning Toast. | `text/on-warning/primary` |
| Icon error | `toast/icon/danger` | Иконка `type=error`. | `text/on-danger/primary` |
| Action foreground | `toast/action/foreground` | Базовый цвет action text. | `text/on-inverse/primary` |
| Action foreground default | `toast/action/foreground/default` | Action default state. | `text/on-inverse/primary` |
| Action foreground hover | `toast/action/foreground/hover` | Action hover state. | `text/on-inverse/secondary` |
| Close icon default | `toast/close/icon/default` | Close icon default. | `icon/inverse` |
| Close icon hover | `toast/close/icon/hover` | Close icon hover. | `text/on-inverse/primary` |
| Focus ring | `toast/focus/ring` | Focus outline для action и close. | `focus/ring` |

### Token gaps

- Нет component tokens для width, stack gap, radius, shadow, timer и motion duration.
- Нет token path `toast/surface/error`; используйте `toast/surface/danger` для `type=error`.
- Нет token path `toast/icon/error`; используйте `toast/icon/danger` для `type=error`.
- Не создавайте новые token names для queue, position, shadow или timer без system review.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правила |
| --- | --- | --- |
| Type | `type` | `neutral`, `info`, `success`, `warning`, `error`. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Dismissible | `dismissible` | Boolean, соответствует Figma `true/false`. |
| Title | `title` | Обязательный короткий текст. |
| Description | `description` | Опционально, коротко. |
| Action | `action` | Одно действие с label и handler. |
| Duration | `duration` | Auto-dismiss duration; `null` для persistent. |
| Position | `position` | Application-level policy. |
| Callback | `onDismiss` | Вызывается при close или timeout. |
| Queue id | `id` | Нужен для dedupe и update. |

### Contract rules

- `type`, `size` и `dismissible` должны соответствовать Figma variants.
- `type=error` маппится на danger tokens.
- В одном Toast допускается только один action.
- Critical messages не должны auto-dismiss без review.
- Position не меняется от сценария к сценарию без product-level rule.

---

## 10. Handoff notes

В handoff нужно передать:

- `type`, `size`, `dismissible` и критичность сообщения;
- title, description и action label;
- duration и persistent behavior;
- position и max stack count;
- queue policy: dedupe, replace, append;
- pause rules при hover/focus;
- accessibility role и aria-live;
- reduced-motion behavior;
- что происходит после action, close и timeout;
- token mapping, включая `type=error` → danger tokens.

### Acceptance criteria

- Toast используется для временного feedback, а не для критичной постоянной информации.
- Title короткий и понятный без description.
- Для ошибки, требующей исправления, есть inline feedback или Alert.
- Одновременно отображается не больше трех Toast.
- Auto-dismiss приостанавливается при hover/focus.
- Toast с action не исчезает слишком быстро.
- Action и close доступны с клавиатуры.
- Accessibility role соответствует критичности.
- Token mapping соответствует documented component tokens.

### Handoff table

| Design artifact | Code artifact | AI can help with | Human must validate |
| --- | --- | --- | --- |
| Toast type | `type` | Предложить severity по тексту события. | Критичность, risk и нужен ли Alert/Modal. |
| Copy | `title`, `description` | Сократить и сделать actionable. | Точность, тон и смысл сообщения. |
| Action | `action` | Проверить, что action один. | Handler, permission и side effects. |
| Queue policy | `id`, `duration`, `position`, stack rules | Найти missing dedupe/limit rules. | Product-level placement и max stack. |
| Live region | `role`, `aria-live` | Предложить polite/assertive. | Реальную критичность для accessibility. |

---

## 11. AI usage rules

- AI может использовать только `type`: `neutral`, `info`, `success`, `warning`, `error`.
- AI может использовать только `size`: `s`, `m`, `l`, `xl`.
- AI должен проверять, не нужен ли Alert, Modal, inline validation, Spinner или Progress Bar вместо Toast.
- AI не должен скрывать критичные ошибки во временном Toast.
- AI не должен добавлять больше одного action в один Toast.
- AI не должен придумывать Toast tokens, custom positions или queue behavior без system review.
- AI должен помечать data-loss risk, security impact, critical recovery, multiple actions, missing queue policy и unsafe auto-dismiss как `Needs system review`.
- AI может подготовить short copy, queue policy, handoff notes и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Примеры

### Корректно

| Сценарий | Решение |
| --- | --- |
| Изменения сохранены. | `type=success`, `size=s`, title `Изменения сохранены`. |
| Ссылка скопирована. | `type=neutral`, title `Ссылка скопирована`. |
| Фоновая операция не удалась. | `type=error`, action `Повторить`, role зависит от критичности. |
| Запрос выполнен частично. | `type=warning`, description с коротким объяснением, action `Подробнее`. |

### Требует review

| Сценарий | Почему |
| --- | --- |
| Toast сообщает о потере данных. | Нужен Alert, Modal или persistent state. |
| Несколько одинаковых Toast появляются подряд. | Нужен dedupe или update существующего Toast. |
| Warning исчезает автоматически слишком быстро. | Пользователь может потерять важный смысл. |
| В Toast два действия. | Сценарий должен перейти в Alert или Modal. |

---

## 13. Anti-patterns

- Использовать Toast для form validation вместо inline error.
- Показывать длинные инструкции во временном уведомлении.
- Добавлять два и более actions.
- Автоматически скрывать критичное сообщение.
- Менять position в разных частях одного продукта без system rule.
- Показывать неограниченную очередь Toast.
- Использовать raw colors вместо documented Toast component tokens.
