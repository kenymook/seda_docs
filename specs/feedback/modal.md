# Modal / Dialog

> **Category** · Feedback
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Modal](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6653-395)

---

## 1. Key Principles

### Что это

Modal / Dialog — блокирующий overlay-компонент для решения, подтверждения или короткой сфокусированной задачи. Пока Modal открыт, пользователь работает только внутри него; фоновый интерфейс недоступен для фокуса и взаимодействия.

В SEDA AI Modal описывает blocking interaction contract: причину открытия, тип диалога, фокус, закрытие, действия, accessibility, token mapping и handoff. Modal не является универсальным контейнером для любого контента и не должен заменять страницу, Drawer, Popover или Alert без причины. Как часть AI-ready design system framework, Modal должен быть описан так, чтобы AI не мог сгенерировать небезопасный blocking flow без focus rules, dismiss rules и human review.

### Когда использовать

- Нужно подтвердить destructive или irreversible action.
- Пользователь должен принять решение перед продолжением сценария.
- Нужна короткая форма без перехода на отдельную страницу.
- Нужно показать критичное сообщение, которое требует явного ответа.
- Нужно сфокусировать пользователя на ограниченной задаче с понятным началом и завершением.

### Когда не использовать

- Для неблокирующих уведомлений — используйте [Toast](toast.md) или [Alert](alert.md).
- Для контекстной подсказки или компактной настройки — используйте [Popover](popover.md).
- Для длинного многошагового сценария — используйте страницу, Drawer или Stepper flow.
- Для навигационного бокового слоя — используйте Drawer.
- Для нескольких вложенных решений — не открывайте Modal из Modal; пересоберите flow.
- Для загрузки или пустого состояния — используйте Spinner, Skeleton или Empty State.

### Ключевые принципы

- **One decision at a time** — один Modal решает одну задачу.
- **Blocking must be justified** — блокировка фона допустима только если без решения нельзя безопасно продолжить.
- **Focus is owned by Modal** — при открытии фокус переносится внутрь и не выходит на фон.
- **Exit is explicit** — у пользователя должен быть понятный способ закрыть Modal.
- **Destructive actions need safety** — опасное действие не получает initial focus по умолчанию.
- **AI assists, system governs** — AI может подготовить текст и критерии, но не придумывает новые типы, токены и focus rules.

### Связанные спецификации

- [Button](../actions/button.md) — footer actions, confirmation и destructive action.
- [Icon Button](../actions/icon-button.md) — close button.
- [Alert](alert.md) — неблокирующее системное сообщение.
- [Popover](popover.md) — contextual non-blocking surface.
- [Drawer](../navigation/drawer.md) — боковая overlay-панель для более длинных задач.

---

## 2. Anatomy

```text
[scrim]
  [dialog surface]
    header: title, description, close
    content slot
    footer: secondary action, primary action
```

| Слот | Обязательность | Назначение |
| --- | --- | --- |
| `scrim` | да | Затемняет и блокирует фон. |
| `surface` | да | Диалоговая поверхность. |
| `header` | рекомендуется | Title, description и close button. |
| `title` | да | Accessible name и смысл диалога. |
| `description` | условно | Контекст, риск или пояснение решения. |
| `closeButton` | условно | Явное закрытие, если сценарий разрешает dismiss. |
| `content` | да | Основной content slot. |
| `footer` | условно | Action area для confirmation, submit, cancel. |

### Правила anatomy

- `title` обязателен: видимый heading или доступное имя через `aria-label`.
- `content` не должен содержать длинную страницу внутри Modal.
- `footer` нужен, если пользователь должен принять решение или отправить форму.
- Close button можно скрыть только в сценариях, где требуется явное решение через footer actions.
- Вложенные Button, Icon Button, Form controls и links сохраняют собственные specs.

---

## 3. Types / Variants

Figma component set использует variant property `type`.

| `type` | Назначение | Типовая структура |
| --- | --- | --- |
| `default` | Стандартная сфокусированная задача или короткий контент. | Header, content, optional footer. |
| `confirmation` | Подтверждение действия, особенно destructive или irreversible. | Title, risk description, cancel, confirm. |
| `alert` | Блокирующее сообщение, требующее явного acknowledgement. | Title, message, one primary action. |
| `fullscreen` | Сложная задача, которой нужно больше пространства, но она остается modal flow. | Header, large content area, footer или toolbar. |

### Type rules

- `confirmation` должен явно описывать последствие действия.
- `alert` используется только когда сообщение блокирует продолжение сценария.
- `fullscreen` не заменяет обычную страницу; используйте его только если нужно сохранить modal context.
- `default` не должен становиться контейнером для длинного многошагового flow.

---

## 4. Sizes

Figma component set использует variant property `size`.

| `size` | Назначение | Правила |
| --- | --- | --- |
| `s` | Короткие confirmations и alerts. | Минимальный content, 1-2 действия. |
| `m` | Стандартный Modal. | Default для коротких форм и решений. |
| `l` | Более сложный content или форма. | Используйте только если сценарий все еще короткий. |
| `xl` | Fullscreen или почти fullscreen modal flow. | Для `type=fullscreen` и сложных задач с явным завершением. |

### Правила размеров

- Размер отвечает за доступное пространство, а не за важность сообщения.
- Не задавайте ширину вручную, если доступен подходящий `size`.
- Если контент требует нескольких секций, deep navigation или долгого чтения, лучше отдельная страница.
- На mobile `s/m/l` могут адаптироваться к почти fullscreen layout, но сохраняют modal semantics.

---

## 5. States

| State | Значение | Поведение |
| --- | --- | --- |
| `closed` | Modal закрыт. | Не участвует в tab order; focus остается в основном интерфейсе. |
| `opening` | Modal появляется. | Фокус переносится внутрь сразу, не после анимации. |
| `open` | Modal активен. | Focus trap включен, фон inert. |
| `closing` | Modal скрывается. | После закрытия focus возвращается на trigger или безопасный fallback. |
| `submitting` | Внутреннее действие выполняется. | Footer action показывает loading/disabled через Button spec. |
| `blocked` | Закрытие временно запрещено. | Нужно объяснить причину и дать безопасный путь завершения. |

### State ownership

- Modal владеет open/close, focus trap, scrim и background inert.
- Button владеет loading, disabled, danger и focus состояниями действий.
- Form controls владеют validation states внутри content slot.
- Alert внутри Modal используется только для локального сообщения, не для замены Modal state.

### Decision matrix

| Сценарий | Используйте | Почему |
| --- | --- | --- |
| Короткое неблокирующее сообщение | Toast или Alert | Modal не должен блокировать workflow без необходимости. |
| Подтверждение удаления | Modal `confirmation` | Нужны явное решение, безопасный focus и danger action. |
| Контекстная настройка рядом с trigger | Popover | Фон не должен блокироваться. |
| Длинная задача с несколькими секциями | Drawer или отдельная страница | Modal станет перегруженным и ухудшит focus/navigation. |
| Критичное blocking сообщение | Modal `alert` | Нужен явный acknowledgement и alertdialog semantics. |

---

## 6. Behavior

### Open / close

- Modal открывается явным trigger action или системным blocking event.
- `Escape` закрывает Modal, если сценарий не требует обязательного решения.
- Click по scrim может закрывать только non-destructive Modal.
- Close button закрывает Modal без side effects, если пользователь не внес несохраненные изменения.
- После закрытия focus возвращается на trigger; если trigger удален, focus переходит на логически следующий элемент.

### Focus management

- При открытии focus переходит внутрь Modal.
- Для `confirmation` initial focus обычно ставится на безопасное действие: `Отмена`, `Закрыть`, `ОК`.
- Для destructive confirmation dangerous action не получает initial focus по умолчанию.
- Для form Modal focus ставится на первое поле или на heading, если форма длинная.
- `Tab` и `Shift+Tab` циклично перемещают focus внутри Modal.

### Actions

- Footer actions выстраиваются по иерархии: secondary/cancel рядом с primary/confirm.
- Destructive confirm использует Button danger variant и конкретный label: `Удалить проект`, а не `Да`.
- Если действие async, loading state принадлежит Button, а Modal не закрывается до завершения или явной отмены.
- Несохраненные изменения требуют confirmation перед закрытием или понятного autosave behavior.

### Motion

- Motion следует [foundation/motion.md](../../foundation/motion.md).
- Overlay fade и content transition должны быть короткими и не задерживать focus.
- `prefers-reduced-motion: reduce` отключает выразительный transition, но не меняет порядок focus management.

---

## 7. Accessibility

Modal следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Role | Используйте native `<dialog>` или `role="dialog"`. |
| Alert dialog | Для критичного blocking message используйте `role="alertdialog"`. |
| Modal semantics | Устанавливайте `aria-modal="true"`. |
| Accessible name | Связывайте title через `aria-labelledby` или задавайте `aria-label`. |
| Description | Для confirmation/alert связывайте body через `aria-describedby`, если текст важен для решения. |
| Background | Фон становится inert или недоступным для focus. |
| Close button | Close Icon Button имеет `aria-label="Закрыть"`. |

### Accessibility checklist

- [ ] Modal имеет accessible name.
- [ ] `aria-modal="true"` установлен.
- [ ] Focus trap работает для `Tab` и `Shift+Tab`.
- [ ] Initial focus выбран по типу Modal.
- [ ] Background content недоступен для focus.
- [ ] После закрытия focus возвращается на trigger или safe fallback.
- [ ] `Escape` закрывает Modal, если сценарий это разрешает.
- [ ] Destructive action не получает focus по умолчанию.
- [ ] Touch targets close и footer actions не меньше 44x44 px.
- [ ] Reduced-motion fallback описан и реализуем.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Элемент | Component token | Роль | Semantic token |
| --- | --- | --- | --- |
| Surface | `modal/surface/default` | Поверхность диалога. | `surface/overlay` |
| Border | `modal/border/default` | Граница поверхности. | `border/default` |
| Title foreground | `modal/title/foreground` | Цвет заголовка. | `text/primary` |
| Description foreground | `modal/description/foreground` | Цвет описания. | `text/secondary` |
| Scrim | `modal/scrim/default` | Фон, блокирующий основной интерфейс. | `surface/scrim` |
| Close icon default | `modal/close/icon/default` | Цвет close icon. | `icon/tertiary` |
| Close icon hover | `modal/close/icon/hover` | Цвет close icon на hover. | `icon/primary` |
| Close surface hover | `modal/close/surface/hover` | Hover surface close button. | `container/neutral/hover` |
| Close surface active | `modal/close/surface/active` | Active surface close button. | `container/neutral/pressed` |
| Focus ring | `modal/focus/ring` | Focus outline для modal controls. | `focus/ring` |

### Token gaps

- Нет component tokens для width, padding, gap, radius, elevation/shadow, header separator и footer separator.
- Нет отдельных component tokens для `type=confirmation`, `type=alert` и `type=fullscreen`.
- Destructive action styling должен приходить из Button tokens, а не из Modal tokens.
- Не используйте legacy CSS custom properties как source of truth в spec.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правила |
| --- | --- | --- |
| Open state | `open` | Controlled или uncontrolled, но поведение закрытия должно быть явным. |
| Type | `type` | `default`, `confirmation`, `alert`, `fullscreen`. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Title | `title` | Visible heading или accessible name. |
| Description | `description` | Optional text; required for risky confirmation. |
| Content slot | `children` / `content` | Соответствует Figma slot `Content`. |
| Close button | `showCloseButton` | Можно скрыть только при обязательном decision flow. |
| Close handler | `onOpenChange` / `onClose` | Должен возвращать focus и учитывать unsaved changes. |
| Footer actions | `primaryAction`, `secondaryAction` | Button contract. |
| Dismiss behavior | `closeOnEscape`, `closeOnScrimClick` | Не включать без сценарного решения. |

### Contract rules

- `type` и `size` должны соответствовать Figma variants.
- Modal не должен принимать arbitrary width/color props без system review.
- Close behavior должен учитывать destructive flow и unsaved changes.
- Footer actions используют Button spec, включая loading, disabled и danger.
- Nested Modal запрещен; используйте отдельный flow или замену текущего Modal.

---

## 10. Handoff notes

В handoff нужно передать:

- trigger, который открывает Modal;
- `type`, `size` и content slot;
- title, description, body content и footer action labels;
- можно ли закрыть через close button, `Escape` и scrim click;
- initial focus target;
- focus return target после закрытия;
- destructive или irreversible risks;
- unsaved changes behavior;
- async submit/loading behavior;
- mobile adaptation;
- accessibility role и ARIA связи;
- token mapping и token gaps.

### Acceptance criteria

- Modal блокирует фон только при оправданном сценарии.
- Открыт только один Modal.
- Focus trap и focus return работают.
- `type` и `size` совпадают с Figma variants.
- Destructive confirmation явно описывает последствие.
- Dangerous action не получает initial focus по умолчанию.
- Close behavior описан для close button, `Escape` и scrim click.
- Визуальные значения берутся из documented tokens или отмеченных token gaps.

### Handoff table

| Design artifact | Code artifact | AI can help with | Human must validate |
| --- | --- | --- | --- |
| Modal type и size | `type`, `size` | Проверить соответствие Figma variants. | Подходит ли Modal, а не Drawer/Popover/page. |
| Header title/description | `title`, `description`, ARIA links | Черновик copy и accessible description. | Риск, юридический смысл и ясность текста. |
| Footer actions | `primaryAction`, `secondaryAction` | Сформировать action labels и criteria. | Destructive behavior, loading и permissions. |
| Dismiss behavior | `closeOnEscape`, `closeOnScrimClick`, `onClose` | Найти missing close rules. | Безопасность закрытия и unsaved changes. |
| Focus model | initial focus, trap, return target | Составить checklist. | Реальную реализацию focus management. |

---

## 11. AI usage rules

- AI может использовать только `type`: `default`, `confirmation`, `alert`, `fullscreen`.
- AI может использовать только `size`: `s`, `m`, `l`, `xl`.
- AI не должен предлагать nested Modal.
- AI должен проверять, нужен ли Modal, Alert, Popover, Drawer или отдельная страница.
- AI должен описывать focus trap, initial focus, focus return и dismiss behavior.
- AI не должен придумывать Modal tokens, arbitrary widths, custom scrim или новые variants.
- AI должен помечать unclear close behavior, missing accessible name, destructive action without confirmation и long content as `Needs system review`.
- AI может подготовить copy, footer actions, handoff notes и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Примеры

### Корректно

| Сценарий | Решение |
| --- | --- |
| Удаление проекта. | `type=confirmation`, `size=s`, safe initial focus, Button danger `Удалить проект`. |
| Короткая форма создания. | `type=default`, `size=m`, focus на первое поле, footer `Отмена` / `Создать`. |
| Критичное сообщение, требующее OK. | `type=alert`, `size=s`, `role=alertdialog`, одна primary action. |
| Сложный modal flow без ухода со страницы. | `type=fullscreen`, `size=xl`, явный close и сохранение состояния. |

### Требует review

| Сценарий | Почему |
| --- | --- |
| Modal открывает второй Modal. | Нарушает layering и focus model. |
| Длинная форма с несколькими секциями в `size=s`. | Нужна страница, Drawer или fullscreen flow. |
| Destructive confirm с label `ОК`. | Не описывает последствие. |
| Scrim click закрывает destructive confirmation. | Риск случайной потери решения или данных. |
| Нет visible title и нет `aria-label`. | Modal не имеет accessible name. |

---

## 13. Anti-patterns

- Использовать Modal для обычного уведомления, которое не блокирует сценарий.
- Открывать Modal из Modal.
- Скрывать close behavior из handoff.
- Ставить initial focus на destructive action.
- Использовать Modal как контейнер для длинной страницы.
- Передавать статус, риск или destructive смысл только цветом.
- Создавать локальные scrim, shadow, radius или width значения без token mapping.
