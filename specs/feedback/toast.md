# Toast / Snackbar

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `content.md`, `motion.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Toast — временное уведомление поверх интерфейса. Оно сообщает результат действия или короткое системное событие и исчезает автоматически либо по действию пользователя.

В SEDA AI Toast используется для обратной связи, которая не требует немедленного исправления в текущем контексте. Если сообщение должно оставаться видимым рядом с проблемой или блокирует продолжение сценария, используйте Alert, inline validation или Modal.

### Когда использовать

Используйте Toast, когда:

- нужно подтвердить успешное завершение действия;
- действие выполнено в фоне и не требует немедленного решения;
- пользователь может продолжать основной workflow;
- сообщение короткое и не должно занимать место в layout;
- есть вторичное действие: undo, details, retry.

### Не используйте

Не используйте Toast, когда:

- ошибка требует исправления в форме — используйте inline validation или [Alert](../specs/feedback/alert.md);
- информация критична и должна оставаться видимой;
- сообщение содержит длинный текст, таблицу или сложные действия;
- нужно показать progress или loading — используйте [Spinner](../specs/feedback/spinner.md) или [Progress Bar](../specs/feedback/progress-bar.md);
- на экране уже есть несколько уведомлений и очередь не управляется.

### Основные принципы

- **Feedback after action** — Toast появляется как реакция на действие или системное событие, а не как постоянный контент.
- **Short and actionable** — текст короткий, действие одно и понятное.
- **Queue is governed** — очередь ограничена, сообщения не перекрывают важный UI.
- **Do not hide errors** — ошибки, требующие исправления, остаются в контексте проблемы.
- **Motion is respectful** — анимация не мешает чтению и учитывает reduced motion.
- **AI drafts, human validates** — AI может предложить текст и правила очереди, но человек проверяет смысл, тон и критичность сообщения.

### Связанные спецификации

- [Alert](../specs/feedback/alert.md) — для видимых сообщений в контексте.
- [Spinner](../specs/feedback/spinner.md) — для неопределенной загрузки.
- [Progress Bar](../specs/feedback/progress-bar.md) — для определенного прогресса.
- [Button](../specs/actions/button.md) — для действий внутри Toast.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `container` | Да | Поверхность Toast. |
| `icon` | Условно | Семантическая иконка типа уведомления. |
| `title` | Да | Короткий текст результата или события. |
| `description` | Нет | Дополнительная деталь, если title недостаточно. |
| `action` | Нет | Одно действие: undo, retry, details. |
| `close` | Условно | Ручное закрытие для dismissible или persistent Toast. |
| `timer` | Нет | Визуальный индикатор auto-dismiss, если продукт его поддерживает. |

### Правила анатомии

- `title` должен быть самостоятельным и понятным без description.
- `description` не используется для длинных инструкций.
- `action` допускается только одно; несколько действий переводят сценарий в Alert или Modal.
- `close` нужен для persistent Toast и Toast с action.
- Иконка не заменяет текстовый смысл сообщения.

---

## 3. Types / Variants / Варианты

| Variant | Когда использовать | Role |
|---|---|---|
| `default` | Нейтральное системное событие. | `status` |
| `info` | Информационное сообщение без риска. | `status` |
| `success` | Действие успешно завершено. | `status` |
| `warning` | Есть риск или частичная проблема, но workflow не заблокирован. | `alert` или `status` по критичности. |
| `danger` | Ошибка фонового действия или невозможность завершить операцию. | `alert` |

### Модификаторы

| Модификатор | Назначение | Правило |
|---|---|---|
| `dismissible` | Показывает кнопку закрытия. | Рекомендуется для action и persistent. |
| `with-action` | Добавляет одно действие. | Action не должен быть единственным способом восстановиться. |
| `persistent` | Не исчезает автоматически. | Использовать только для важных, но не блокирующих сообщений. |
| `with-timer` | Показывает оставшееся время. | Не заменяет доступное объявление статуса. |

### Position

| Position | Когда использовать |
|---|---|
| `top-right` | Default для desktop operational UI. |
| `top-center` | Глобальные системные события. |
| `bottom-right` | Если верх экрана занят navigation или panels. |
| `bottom-center` | Mobile или touch-first интерфейсы. |

Позиция должна быть постоянной в рамках приложения.

---

## 4. Sizes / Размеры

| Size | Ширина | Контекст |
|---|---:|---|
| `compact` | 280-320px | Короткий title без description. |
| `medium` | 360-420px | Default: title, description и одно action. |
| `wide` | 480-560px | Длинное название объекта или фоновые операции. |

### Правила размеров

- Toast не должен занимать ширину, из-за которой перекрывает основной workflow.
- На mobile Toast занимает доступную ширину с безопасными отступами.
- Если текст не помещается в `wide`, сообщение нужно сократить или заменить на Alert/Modal.
- Высота stack должна быть ограничена: максимум 3 Toast одновременно.

---

## 5. States / Состояния

| Состояние | Когда возникает | Правило |
|---|---|---|
| `entering` | Toast появляется. | Короткая enter-анимация с reduced-motion fallback. |
| `visible` | Toast полностью видим. | Timer идет, если Toast не persistent. |
| `paused` | Hover, focus внутри Toast или пользователь взаимодействует. | Auto-dismiss timer приостанавливается. |
| `exiting` | Toast закрывается автоматически или вручную. | Фокус не должен теряться. |
| `queued` | Toast ожидает показа. | Очередь управляется системой уведомлений. |
| `persistent` | Toast остается до действия пользователя. | Нужен close или action. |

---

## 6. Behavior / Поведение

### Auto-dismiss

- Default duration: 4-6 секунд для `default`, `info` и `success`.
- `warning` и `danger` могут быть persistent, если сообщение важно.
- Timer приостанавливается при hover и focus внутри Toast.
- Toast с action не должен исчезать до того, как пользователь успеет прочитать действие.

### Queue management

- Одновременно показывайте не больше 3 Toast.
- Новые сообщения добавляются в очередь или заменяют менее важные по policy продукта.
- Повторяющиеся Toast должны группироваться или обновлять существующий Toast.
- Очередь не должна скрывать Modal, critical Alert или navigation.

### Motion

- Enter и exit анимации должны быть короткими и не отвлекать.
- При `prefers-reduced-motion: reduce` Toast появляется и исчезает без перемещения.
- Motion не должен быть единственным сигналом появления уведомления.

---

## 7. Accessibility

| Элемент | Атрибут | Когда |
|---|---|---|
| Toast region | `aria-live="polite"` | Для `default`, `info`, `success`. |
| Toast region | `aria-live="assertive"` | Только для критичных `danger` или `warning`. |
| Toast item | `role="status"` | Нейтральные и успешные сообщения. |
| Toast item | `role="alert"` | Критичные warning/danger. |
| Toast item | `aria-atomic="true"` | Чтобы сообщение читалось целиком. |
| Close button | Accessible name | Для dismissible/persistent. |

### Accessibility checklist

- [ ] Toast не получает focus автоматически.
- [ ] Action и close доступны с клавиатуры.
- [ ] Auto-dismiss приостанавливается при focus внутри Toast.
- [ ] Критичные сообщения не исчезают слишком быстро.
- [ ] Текст не передает смысл только цветом или иконкой.
- [ ] Screen reader announcement соответствует критичности.
- [ ] Motion имеет reduced-motion fallback.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Toast доступны component tokens в namespace `toast`.

| Component token | Роль | Semantic token |
|---|---|---|
| `toast/surface/default` | Фон neutral Toast. | `surface/inverse` |
| `toast/surface/info` | Фон info Toast. | `container/info/default` |
| `toast/surface/success` | Фон success Toast. | `container/success/default` |
| `toast/surface/warning` | Фон warning Toast. | `container/warning/default` |
| `toast/surface/danger` | Фон danger Toast. | `container/danger/default` |
| `toast/foreground/default` | Основной текст на inverse surface. | `text/on-inverse/primary` |
| `toast/foreground/secondary` | Вторичный текст на inverse surface. | `text/on-inverse/secondary` |
| `toast/foreground/onStatus` | Текст на status surface. | `text/on-brand/primary` |
| `toast/icon/default` | Иконка neutral Toast. | `icon/inverse` |
| `toast/icon/info` | Иконка info Toast. | `text/on-info/primary` |
| `toast/icon/success` | Иконка success Toast. | `text/on-success/primary` |
| `toast/icon/warning` | Иконка warning Toast. | `text/on-warning/primary` |
| `toast/icon/danger` | Иконка danger Toast. | `text/on-danger/primary` |
| `toast/action/foreground` | Action foreground. | `text/on-inverse/primary` |
| `toast/action/foreground/default` | Action default foreground. | `text/on-inverse/primary` |
| `toast/action/foreground/hover` | Action hover foreground. | `text/on-inverse/secondary` |
| `toast/close/icon/default` | Close icon default. | `icon/inverse` |
| `toast/close/icon/hover` | Close icon hover. | `text/on-inverse/primary` |
| `toast/focus/ring` | Focus ring для action и close. | `focus/ring` |

Token gap: отдельные component tokens для width, stack gap, radius, shadow, timer и motion duration пока не выделены. До появления таких tokens используйте foundation rules и layout primitives.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Тип | `variant` | `default`, `info`, `success`, `warning`, `danger`. |
| Заголовок | `title` | Обязателен. |
| Описание | `description` | Опционально, короткое. |
| Действие | `action` | Одно действие с label и handler. |
| Закрытие | `dismissible` | Показывает close button. |
| Длительность | `duration` | Auto-dismiss duration; `null` или special value для persistent. |
| Позиция | `position` | Единая policy приложения. |
| Callback | `onDismiss` | Вызывается при закрытии. |
| Queue id | `id` | Нужен для dedupe и обновления Toast. |

---

## 10. Handoff notes

Handoff для Toast должен фиксировать:

- variant и критичность сообщения;
- title, description и action label;
- duration и persistent behavior;
- position и max stack count;
- queue policy: dedupe, replace, append;
- pause rules при hover/focus;
- accessibility role и aria-live;
- reduced-motion behavior;
- что происходит после action, close и timeout.

---

## 11. Acceptance criteria

- [ ] Toast используется для временного feedback, а не для критичной постоянной информации.
- [ ] Title короткий и понятный без description.
- [ ] Для ошибки, требующей исправления, есть inline feedback или Alert.
- [ ] Одновременно отображается не больше 3 Toast.
- [ ] Auto-dismiss приостанавливается при hover/focus.
- [ ] Toast с action не исчезает слишком быстро.
- [ ] Action и close доступны с клавиатуры.
- [ ] Accessibility role соответствует критичности.
- [ ] Token mapping соответствует documented Toast component tokens из `tokens.json`.

---

## 12. AI usage rules

AI может:

- предложить короткий текст Toast по результату действия;
- выбрать variant по критичности события;
- проверить, не нужен ли Alert вместо Toast;
- подготовить queue policy и acceptance criteria.

AI не должен:

- скрывать критичные ошибки во временном Toast;
- добавлять несколько actions в один Toast;
- придумывать новые token paths без `Token gap`;
- менять позицию Toast от сценария к сценарию без system rule;
- считать auto-dismiss безопасным для любого сообщения.

Если сообщение влияет на сохранность данных, безопасность или восстановление после ошибки, AI должен пометить его как `Needs system review`.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| `success`: "Изменения сохранены". | Короткое подтверждение завершенного действия. |
| `default`: "Ссылка скопирована". | Событие не требует дальнейшего решения. |
| `danger` с action `Повторить`. | Ошибка фонового действия и понятный путь восстановления. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Toast сообщает о потере данных. | Нужен ли Modal, Alert или persistent state. |
| Несколько одинаковых Toast появляются подряд. | Нужен dedupe или update существующего Toast. |
| Warning исчезает автоматически. | Достаточно ли времени и не теряется ли важный смысл. |

---

## 14. Anti-patterns

- Использовать Toast для form validation вместо inline error.
- Показывать длинные инструкции во временном уведомлении.
- Добавлять два и более actions.
- Автоматически скрывать критичное сообщение.
- Менять position в разных частях одного продукта.
- Показывать неограниченную очередь Toast.
- Использовать raw colors вместо documented Toast component tokens.
