# Popover

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

Popover — контекстная поверхностная панель, которая раскрывается от trigger и содержит дополнительную информацию, действия или компактный интерактивный сценарий. В отличие от Tooltip, Popover может содержать фокусируемые элементы: кнопки, ссылки, поля, списки и настройки.

В SEDA AI Popover используется как controlled interaction pattern. Он не должен становиться маленьким Modal: если сценарий блокирует задачу, требует подтверждения или содержит длинную форму, нужен Modal или отдельный экран.

### Когда использовать

Используйте Popover, когда:

- нужно раскрыть контекстные действия рядом с объектом;
- пользователь редактирует небольшой набор параметров без ухода со страницы;
- контент связан с trigger и не требует отдельного workflow;
- нужно показать короткую карточку с деталями, действиями или quick settings;
- меню или список требует кастомного содержимого, которое не покрывает Dropdown Menu.

### Не используйте

Не используйте Popover, когда:

- нужен только короткий поясняющий текст — используйте [Tooltip](../specs/feedback/tooltip.md);
- действие блокирует интерфейс или требует подтверждения — используйте [Modal](../specs/feedback/modal.md);
- нужен список команд без сложного контента — используйте [Dropdown Menu](../specs/overlays-layout/dropdown-menu.md);
- содержимое длиннее компактной панели и требует прокрутки всего экрана;
- Popover должен открывать другой Popover внутри себя.

### Основные принципы

- **Context before surface** — Popover должен быть привязан к понятному trigger и конкретному объекту.
- **Small task, not full flow** — внутри Popover допустимы короткие действия, а не полноценный workflow.
- **Focus is explicit** — при открытии и закрытии фокус управляется предсказуемо.
- **Dismissal is safe** — `Escape`, click outside и explicit close не должны терять важные данные без правила.
- **Layering is governed** — Popover не вкладывается в Popover и не конкурирует с Modal.
- **AI drafts, human validates** — AI может предложить поведение и handoff, но человек проверяет focus management и edge cases.

### Связанные спецификации

- [Tooltip](../specs/feedback/tooltip.md) — для неинтерактивных подсказок.
- [Modal](../specs/feedback/modal.md) — для блокирующих сценариев.
- [Dropdown Menu](../specs/overlays-layout/dropdown-menu.md) — для списков команд.
- [Button](../specs/actions/button.md) — типичный trigger и действия внутри Popover.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `trigger` | Да | Элемент, который открывает Popover. |
| `surface` | Да | Контейнер всплывающей панели. |
| `arrow` | Нет | Визуальная привязка к trigger. |
| `title` | Условно | Заголовок панели, если контекст не очевиден. |
| `description` | Нет | Короткое пояснение сценария. |
| `content` | Да | Основное содержимое: текст, список, форма или действия. |
| `separator` | Нет | Разделение смысловых групп. |
| `close` | Условно | Явное закрытие, если контент интерактивный или долго читается. |
| `footer` | Условно | Apply/Cancel или вторичные действия. |

### Правила анатомии

- `trigger` должен иметь понятное имя и состояние `aria-expanded`.
- `surface` не должен содержать лишние декоративные слои.
- `title` обязателен, если Popover содержит форму, выбор или несколько действий.
- `close` нужен, если закрытие через outside click может быть неочевидным.
- `footer` используется только для действий, которые относятся к содержимому Popover.

---

## 3. Types / Variants / Варианты

| Вариант | Когда использовать | Ограничения |
|---|---|---|
| `informational` | Краткая карточка с деталями и возможной ссылкой. | Если нет интерактива, проверьте, не достаточно ли Tooltip. |
| `actions` | Небольшой набор команд или contextual actions. | Для простого списка команд предпочтительнее Dropdown Menu. |
| `form` | 1-3 компактных поля и Apply/Cancel. | Длинные формы переносятся в Modal или страницу. |
| `preview` | Быстрый просмотр объекта: пользователь, файл, событие. | Не должен заменять detail page. |
| `custom` | Особый компактный сценарий. | Требует отдельного handoff и accessibility review. |

### Placement

| Placement | Когда использовать | Правило |
|---|---|---|
| `top` | Есть место над trigger. | Arrow указывает на trigger, если включен. |
| `bottom` | Основной placement для toolbar и forms. | Default для большинства сценариев. |
| `left` | Trigger справа от рабочей области. | Проверить viewport collision. |
| `right` | Trigger слева от рабочей области. | Проверить viewport collision. |
| `start` / `end` | Выравнивание по краю trigger. | Учитывать направление текста и responsive. |

### Triggers

| Trigger mode | Когда использовать | Правило |
|---|---|---|
| `click` | Интерактивное содержимое, действия, формы. | Default. |
| `hover` | Только информационный контент без фокусируемых элементов. | Для интерактива не использовать. |
| `focus` | Keyboard-first подсказка или contextual help. | Не должен конфликтовать с Tooltip. |

---

## 4. Sizes / Размеры

Popover не масштабирует типографику. Размер задается шириной surface, внутренними отступами и ограничением высоты.

| Size | Ширина | Контекст |
|---|---:|---|
| `small` | 220-280px | Короткое описание, 1-2 действия. |
| `medium` | 320-400px | Default: карточка, компактная форма, preview. |
| `large` | 480-560px | Расширенный preview или несколько групп настроек. |

### Правила размеров

- Высота Popover не должна превышать viewport; при необходимости прокручивается только content area.
- Если контент не помещается в `large`, используйте Modal или отдельный экран.
- Минимальная ширина должна защищать текст и controls от переноса в нечитаемую колонку.
- На mobile Popover может переходить в bottom sheet или Modal-like surface, если обычный placement ломает доступность.

---

## 5. States / Состояния

| Состояние | Когда возникает | Правило |
|---|---|---|
| `closed` | Popover скрыт. | Контент не доступен для tab navigation. |
| `open` | Popover видим. | `aria-expanded="true"` на trigger. |
| `opening` | Переходное состояние анимации. | Не должно задерживать focus management. |
| `closing` | Закрытие после outside click, `Escape` или action. | Фокус возвращается на trigger, если он еще существует. |
| `disabled-trigger` | Trigger недоступен. | Popover не открывается. |
| `error-inside` | Внутри формы есть validation error. | Outside dismiss не должен терять несохраненные данные без правила. |

---

## 6. Behavior / Поведение

### Открытие

- Click trigger открывает Popover и обновляет `aria-expanded`.
- Для интерактивного Popover фокус переходит на первый meaningful focus target или остается на trigger по описанному паттерну.
- Hover-trigger разрешен только для неинтерактивного контента.
- Popover должен учитывать viewport collision и выбирать доступный placement.

### Закрытие

- `Escape` закрывает Popover.
- Click outside закрывает Popover, если нет несохраненных изменений.
- Явная кнопка close закрывает Popover и возвращает фокус.
- Action внутри Popover может закрывать surface после успешного выполнения.
- Если trigger удален после действия, фокус переводится на ближайший логичный элемент.

### Focus management

- Фокусируемые элементы внутри Popover идут в логичном DOM-порядке.
- Popover не должен создавать focus trap, если это не Modal-like mobile adaptation.
- При закрытии фокус возвращается на trigger или безопасную fallback-точку.
- Вложенные Popover запрещены; используйте отдельный workflow или Modal.

---

## 7. Accessibility

| Элемент | Атрибут | Правило |
|---|---|---|
| Trigger | `aria-expanded` | Отражает состояние открытия. |
| Trigger | `aria-controls` | Указывает на surface, если surface присутствует в DOM. |
| Trigger | `aria-haspopup="dialog"` | Для интерактивного Popover. |
| Surface | `role="dialog"` | Когда внутри есть фокусируемые элементы. |
| Surface | `aria-labelledby` | Если есть title. |
| Surface | `aria-describedby` | Если есть description. |
| Close button | Accessible name | Например, `Закрыть`. |

### Accessibility checklist

- [ ] Trigger имеет понятное accessible name.
- [ ] `aria-expanded` синхронизирован с open state.
- [ ] Interactive Popover доступен с клавиатуры.
- [ ] `Escape` закрывает Popover.
- [ ] Фокус после закрытия возвращается предсказуемо.
- [ ] Hover-only Popover не содержит фокусируемых элементов.
- [ ] Несохраненные изменения не теряются без правила.
- [ ] Mobile adaptation не ломает screen reader navigation.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Popover доступны component tokens в namespace `popover`.

| Component token | Роль | Semantic token |
|---|---|---|
| `popover/surface/default` | Фон surface. | `surface/overlay` |
| `popover/border/default` | Граница surface. | `border/default` |
| `popover/border/separator` | Разделитель внутри Popover. | `border/default` |
| `popover/title/foreground` | Цвет title. | `text/primary` |
| `popover/description/foreground` | Цвет description. | `text/secondary` |
| `popover/close/icon/default` | Иконка close по умолчанию. | `icon/tertiary` |
| `popover/close/icon/hover` | Иконка close при hover. | `icon/primary` |
| `popover/close/surface/hover` | Поверхность close при hover. | `container/neutral/hover` |
| `popover/close/surface/active` | Поверхность close при active. | `container/neutral/pressed` |
| `popover/focus/ring` | Focus ring для trigger и controls. | `focus/ring` |

Token gap: отдельные component tokens для shadow, radius, padding, arrow и placement offset пока не выделены. До появления таких tokens эти параметры должны ссылаться на foundation rules или layout primitives, а не на новые непроверенные token names.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Open state | `open` | Controlled state для раскрытия. |
| Initial open | `defaultOpen` | Только uncontrolled mode. |
| Open change | `onOpenChange` | Вызывается при trigger, `Escape`, outside click и action close. |
| Placement | `placement` | `top`, `bottom`, `left`, `right` + alignment. |
| Trigger mode | `trigger` | `click`, `hover`, `focus`; интерактивный контент требует `click`. |
| Size | `size` | `small`, `medium`, `large`. |
| Arrow | `withArrow` | Включает визуальную привязку к trigger. |
| Close button | `showCloseButton` | Рекомендуется для интерактивного или длинного контента. |
| Modal adaptation | `modalOnMobile` | Используется только если mobile Popover ломает доступность. |

---

## 10. Handoff notes

Handoff для Popover должен фиксировать:

- trigger element и trigger mode;
- controlled или uncontrolled open state;
- placement, alignment, collision behavior и mobile adaptation;
- есть ли arrow, title, description, close и footer;
- focus target при открытии;
- dismiss rules: `Escape`, outside click, close button, action;
- правила для unsaved changes;
- список интерактивных элементов внутри;
- связь с Dropdown Menu, Tooltip или Modal, если сценарий находится на границе паттернов.

---

## 11. Acceptance criteria

- [ ] Popover открывается только от понятного trigger.
- [ ] Интерактивный Popover использует click-trigger, а не hover-only.
- [ ] `Escape` и outside click работают по описанным правилам.
- [ ] Фокус при открытии и закрытии предсказуем.
- [ ] Hover-only Popover не содержит фокусируемых элементов.
- [ ] Вложенные Popover не используются.
- [ ] Размер не превышает viewport; длинный контент не ломает layout.
- [ ] Token mapping соответствует documented Popover component tokens из `tokens.json`.
- [ ] Если есть несохраненные изменения, dismissal behavior явно описан.

---

## 12. AI usage rules

AI может:

- предложить подходящий variant Popover по сценарию;
- проверить, не нужен ли Tooltip, Dropdown Menu или Modal вместо Popover;
- подготовить state matrix, focus rules и handoff notes;
- найти недостающие accessibility требования.

AI не должен:

- превращать Popover в полноценный Modal без явного решения;
- добавлять nested Popover;
- использовать hover-trigger для интерактивного содержимого;
- создавать новые token paths без `Token gap`;
- пропускать human review focus management и unsaved changes.

Если сценарий требует блокировки, длинной формы или критичного подтверждения, AI должен пометить его как `Needs system review`.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Короткие настройки фильтра в `medium` Popover. | Сценарий контекстный и компактный. |
| Карточка пользователя с действиями `Написать` и `Открыть профиль`. | Контент связан с trigger и не блокирует workflow. |
| Быстрое редактирование одного параметра с Apply/Cancel. | Есть явные dismiss и commit rules. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Popover содержит форму из нескольких полей. | Не нужен ли Modal или отдельный экран. |
| Popover открывается по hover. | Нет ли внутри интерактивных элементов. |
| На mobile Popover занимает почти весь экран. | Нужна ли bottom sheet или Modal adaptation. |

---

## 14. Anti-patterns

- Использовать Popover вместо Tooltip для одной строки текста.
- Использовать Popover вместо Modal для блокирующего решения.
- Вкладывать Popover в Popover.
- Открывать интерактивный Popover только по hover.
- Терять несохраненные изменения при outside click.
- Не возвращать фокус после закрытия.
- Добавлять произвольные shadows, borders или colors вместо documented Popover tokens.
