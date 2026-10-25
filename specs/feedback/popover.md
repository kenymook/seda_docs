# Popover

> **Category** · Feedback
> **Version** · 1.0
> **Status** · experimental / needs-review
> **Owner** · Kenymook
> **Last reviewed** · 2026-05-28
> **Figma** · [Popover](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=1617-8952)

---

## 1. Key Principles

### Что это

Popover — контекстная поверхностная панель, которая раскрывается от trigger и показывает дополнительную информацию, короткий набор действий или компактный интерактивный сценарий. В отличие от Tooltip, Popover может содержать фокусируемые элементы: Button, Link, Checkbox, поля, списки и настройки.

В SEDA AI Popover является controlled interaction pattern: он связан с конкретным объектом, не блокирует весь интерфейс и не должен превращаться в маленький Modal. Если сценарий требует обязательного решения, подтверждения, длинной формы или focus trap, нужен Modal, Drawer или отдельная страница.

### Когда использовать

- Нужно показать контекстные действия рядом с объектом.
- Нужна короткая карточка с деталями, quick settings или preview.
- Пользователь редактирует 1-3 компактных параметра без ухода со страницы.
- Контент связан с trigger и не требует отдельного workflow.
- Обычный Dropdown Menu недостаточен, потому что нужен составной контент.

### Когда не использовать

- Для одной короткой подсказки без интерактива — используйте [Tooltip](tooltip.md).
- Для блокирующего решения или destructive confirmation — используйте [Modal](modal.md).
- Для простого списка команд — используйте Dropdown Menu.
- Для длинной формы, нескольких секций или сложного workflow — используйте Modal, Drawer или страницу.
- Для вложенных Popover — пересоберите сценарий или используйте отдельный flow.
- Для hover-only интерактива — interactive Popover должен открываться по click/focus.

### Ключевые принципы

- **Context before surface** — Popover должен быть привязан к понятному trigger и конкретному объекту.
- **Small task, not full flow** — внутри допустим короткий сценарий, а не полноценная страница.
- **Dismissal is safe** — `Escape`, outside click и close button не должны терять важные данные без правила.
- **Focus is predictable** — открытие и закрытие должны иметь понятный focus target и return target.
- **Layering is governed** — Popover не вкладывается в Popover и не конкурирует с Modal.
- **AI assists, system governs** — AI может помочь с handoff и copy, но не придумывает variants, tokens и focus behavior.

### Связанные спецификации

- [Tooltip](tooltip.md) — короткие неинтерактивные подсказки.
- [Modal](modal.md) — блокирующие решения и confirmations.
- [Button](../actions/button.md) — trigger и actions внутри Popover.
- [Icon Button](../actions/icon-button.md) — compact trigger и close control.
- Dropdown Menu — список команд без составного контента.

---

## 2. Anatomy

```text
[trigger]
   |
   v
[popover surface]
  header: title, description, close
  content / menu items
  optional footer
```

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `trigger` | да | Элемент, который открывает Popover. |
| `surface` | да | Контейнер всплывающей панели. |
| `title` | условно | Заголовок, если контекст не очевиден. |
| `description` | опционально | Короткое пояснение сценария. |
| `content` | да | Основной контент: текст, preview, controls или actions. |
| `menu3`-`menu8` | опционально | Управляемые Figma boolean-слоты для строк меню/контента. |
| `close` | условно | Явное закрытие для интерактивного или длинного содержимого. |
| `footer` | условно | Apply/Cancel или вторичные действия. |

### Правила anatomy

- `trigger` должен иметь понятное accessible name.
- `surface` не должен содержать лишние декоративные слои без роли.
- `title` нужен, если внутри есть несколько действий, form controls или неочевидный контекст.
- `close` нужен, если outside click не является очевидным способом закрытия.
- `footer` используется только для действий, относящихся к содержимому Popover.
- Вложенные Button, Link, Checkbox и другие controls сохраняют собственные specs.

---

## 3. Types / Variants

Figma component set использует variant property `variant`.

| `variant` | Назначение | Ограничения |
| --- | --- | --- |
| `default` | Универсальная карточка с title, description и коротким контентом. | Не использовать для длинной формы или blocking decision. |
| `avatar` | Карточка человека, участника или профиля. | Не заменяет полноценную страницу профиля. |
| `checkbox` | Компактный выбор нескольких настроек. | Только короткий список; длинные настройки уводятся в Modal/страницу. |
| `emoji` | Быстрый выбор реакции или emoji. | Нужны keyboard navigation и понятный selected state. |
| `icon` | Контекстная панель с иконками или icon actions. | Иконки должны иметь accessible labels. |
| `custom` | Специальный короткий сценарий. | Требует отдельного handoff и accessibility review. |

### Boolean content slots

В Figma есть boolean properties `menu3`, `menu4`, `menu5`, `menu6`, `menu7`, `menu8`. Они управляют количеством видимых строк/элементов внутри Popover.

| Property | Правило |
| --- | --- |
| `menu3`-`menu8` | Используйте только для системных строк, которые уже предусмотрены компонентом. |
| Hidden menu item | Не должен оставлять пустые gaps или нарушать keyboard order. |
| Дополнительные пункты | Если нужно больше 8 элементов, проверьте, не нужен ли Dropdown Menu, Modal или отдельный экран. |

---

## 4. Sizes

Figma component set использует variant property `size`.

| `size` | Назначение | Правила |
| --- | --- | --- |
| `s` | Короткое описание, 1-2 действия или компактный preview. | Не перегружать формами и длинным текстом. |
| `m` | Default для большинства Popover. | Подходит для коротких карточек и quick settings. |
| `l` | Несколько групп контента или expanded preview. | Проверить высоту и viewport collision. |
| `xl` | Максимальный Popover перед переходом в Modal/Drawer. | Использовать только если содержимое остается компактным и контекстным. |

### Правила размеров

- Размер задает ширину и плотность surface, а не новый сценарий.
- Если content не помещается в `xl`, используйте Modal, Drawer или отдельную страницу.
- На mobile Popover может адаптироваться в bottom sheet или Modal-like surface, если обычный placement ломает доступность.
- Не задавайте custom width без system review.

---

## 5. States

| State | Когда возникает | Поведение |
| --- | --- | --- |
| `closed` | Popover скрыт. | Контент недоступен для tab navigation. |
| `opening` | Surface появляется. | Focus behavior не должен ждать завершения анимации. |
| `open` | Popover видим. | Trigger получает `aria-expanded="true"`. |
| `closing` | Закрытие по `Escape`, outside click, close или action. | Focus возвращается на trigger или safe fallback. |
| `disabled-trigger` | Trigger недоступен. | Popover не открывается. |
| `dirty` | Внутри есть несохраненные изменения. | Dismissal требует явного правила: discard, apply, confirm. |

### State ownership

- Popover владеет open/close, placement, collision и dismiss behavior.
- Trigger владеет disabled, hover, active и focus states по своей spec.
- Controls внутри Popover владеют validation, selected и disabled states.
- Popover не создает focus trap, кроме специально описанной mobile adaptation.

---

## 6. Behavior

### Открытие

- Click trigger открывает interactive Popover и обновляет `aria-expanded`.
- Hover допустим только для неинтерактивного informational Popover; если есть focusable elements, используйте click/focus.
- Placement должен учитывать viewport collision и fallback placement.
- Popover должен быть визуально связан с trigger через позицию; arrow является optional, если он есть в реализации.

### Закрытие

- `Escape` закрывает Popover.
- Outside click закрывает Popover, если нет несохраненных изменений.
- Close button закрывает Popover и возвращает focus.
- Action внутри Popover может закрыть surface после успешного выполнения.
- Если trigger удален после действия, focus переходит на логически следующий элемент.

### Focus management

- Focusable elements идут в логичном DOM-порядке.
- При открытии focus остается на trigger или переходит на первый meaningful focus target по описанному паттерну.
- При закрытии focus возвращается на trigger или safe fallback.
- Nested Popover запрещены.
- Popover не должен перехватывать focus как Modal.

### Responsive behavior

- Surface не выходит за viewport.
- Content area может прокручиваться, но header/actions остаются понятными.
- Если mobile adaptation становится blocking surface, нужно явно описать Modal-like behavior.

---

## 7. Accessibility

Popover следует [foundation/accessibility.md](../foundation/accessibility.md).

| Элемент | Атрибут | Правило |
| --- | --- | --- |
| Trigger | `aria-expanded` | Синхронизирован с open state. |
| Trigger | `aria-controls` | Указывает на surface, если surface есть в DOM. |
| Trigger | `aria-haspopup="dialog"` | Для interactive Popover. |
| Surface | `role="dialog"` | Когда внутри есть focusable elements. |
| Surface | `aria-labelledby` | Если есть title. |
| Surface | `aria-describedby` | Если есть description. |
| Close button | Accessible name | Например, `Закрыть`. |

### Accessibility checklist

- [ ] Trigger имеет понятное accessible name.
- [ ] `aria-expanded` синхронизирован с open state.
- [ ] Interactive Popover доступен с клавиатуры.
- [ ] `Escape` закрывает Popover.
- [ ] Focus после закрытия возвращается предсказуемо.
- [ ] Hover-only Popover не содержит focusable elements.
- [ ] Несохраненные изменения не теряются без правила.
- [ ] Mobile adaptation не ломает screen reader navigation.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Элемент | Component token | Роль | Semantic token |
| --- | --- | --- | --- |
| Surface | `popover/surface/default` | Фон surface. | `surface/overlay` |
| Border default | `popover/border/default` | Граница surface. | `border/default` |
| Border separator | `popover/border/separator` | Разделитель внутри Popover. | `border/default` |
| Title foreground | `popover/title/foreground` | Цвет title. | `text/primary` |
| Description foreground | `popover/description/foreground` | Цвет description. | `text/secondary` |
| Close icon default | `popover/close/icon/default` | Цвет close icon. | `icon/tertiary` |
| Close icon hover | `popover/close/icon/hover` | Цвет close icon на hover. | `icon/primary` |
| Close surface hover | `popover/close/surface/hover` | Hover surface close control. | `container/neutral/hover` |
| Close surface active | `popover/close/surface/active` | Active surface close control. | `container/neutral/pressed` |
| Focus ring | `popover/focus/ring` | Focus outline для controls. | `focus/ring` |

### Token gaps

- Нет component tokens для width, padding, radius, elevation/shadow, arrow, placement offset и viewport margin.
- Нет отдельных component tokens для `variant=avatar`, `variant=checkbox`, `variant=emoji`, `variant=icon` и `variant=custom`.
- Styling пунктов меню внутри Popover должен ссылаться на соответствующие nested component specs, а не на новые Popover tokens.
- Не создавайте новые token names для arrow, shadow или spacing без system review.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правила |
| --- | --- | --- |
| Open state | `open` | Controlled state для раскрытия. |
| Initial open | `defaultOpen` | Только uncontrolled mode. |
| Open change | `onOpenChange` | Вызывается при trigger, `Escape`, outside click и action close. |
| Variant | `variant` | `default`, `avatar`, `checkbox`, `emoji`, `icon`, `custom`. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Placement | `placement` | `top`, `bottom`, `left`, `right` с alignment/fallback. |
| Trigger mode | `triggerMode` | `click`, `focus`, `hover`; interactive content требует `click` или `focus`. |
| Menu visibility | `menuItemsVisible` | Маппинг на Figma `menu3`-`menu8`, если используется системный список. |
| Close button | `showCloseButton` | Рекомендуется для interactive или длинного content. |
| Mobile adaptation | `modalOnMobile` | Только если обычный placement ломает доступность. |

### Contract rules

- `variant` и `size` должны соответствовать Figma variants.
- Interactive Popover не должен открываться только по hover.
- `menu3`-`menu8` не должны ломать DOM order и keyboard order.
- Popover не должен принимать arbitrary color, shadow или width props без system review.
- Nested Popover запрещен.

---

## 10. Handoff notes

В handoff нужно передать:

- trigger element и trigger mode;
- controlled или uncontrolled open state;
- `variant`, `size`, placement, alignment и collision behavior;
- какие `menu3`-`menu8` включены, если используется системный список;
- title, description, content и footer actions;
- нужен ли close button;
- focus target при открытии и focus return target;
- dismiss rules: `Escape`, outside click, close button, action;
- правила для unsaved changes;
- mobile adaptation;
- accessibility role и ARIA связи;
- token mapping и token gaps.

### Acceptance criteria

- Popover открывается только от понятного trigger.
- `variant` и `size` совпадают с Figma variants.
- Interactive Popover не использует hover-only trigger.
- `Escape`, outside click и close button работают по описанным правилам.
- Focus при открытии и закрытии предсказуем.
- Nested Popover не используется.
- Content не превышает разумный viewport; длинный flow переводится в Modal/Drawer/страницу.
- Token mapping соответствует `tokens.json`, gaps отмечены явно.

---

## 11. AI usage rules

- AI может использовать только `variant`: `default`, `avatar`, `checkbox`, `emoji`, `icon`, `custom`.
- AI может использовать только `size`: `s`, `m`, `l`, `xl`.
- AI должен проверять, не нужен ли Tooltip, Dropdown Menu, Modal, Drawer или отдельная страница.
- AI не должен предлагать nested Popover.
- AI не должен использовать hover-only trigger для interactive content.
- AI не должен придумывать Popover tokens, custom shadows, arbitrary widths или новые variants.
- AI должен помечать missing trigger, unclear dismiss behavior, unsaved changes, unsupported mobile adaptation и focus ambiguity как `Needs system review`.
- AI может подготовить content draft, focus rules, handoff notes и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Примеры

### Корректно

| Сценарий | Решение |
| --- | --- |
| Карточка участника рядом с avatar trigger. | `variant=avatar`, `size=m`, actions `Написать`, `Открыть профиль`. |
| Быстрые настройки фильтра. | `variant=checkbox`, `size=m`, click trigger, Apply/Cancel. |
| Выбор реакции. | `variant=emoji`, keyboard navigation, selected state в content. |
| Контекстная панель с иконками действий. | `variant=icon`, accessible labels для каждой icon action. |
| Специальный короткий preview. | `variant=custom`, explicit handoff и accessibility review. |

### Требует review

| Сценарий | Почему |
| --- | --- |
| Popover содержит форму из многих полей. | Нужен Modal, Drawer или отдельная страница. |
| Interactive Popover открывается только по hover. | Keyboard и touch users теряют доступ. |
| Popover занимает почти весь mobile viewport. | Нужна bottom sheet или Modal-like adaptation. |
| Нужно больше 8 menu items. | Проверьте Dropdown Menu, Modal или страницу. |
| Есть unsaved changes и outside click закрывает surface. | Риск потери данных. |

---

## 13. Anti-patterns

- Использовать Popover вместо Tooltip для одной строки текста.
- Использовать Popover вместо Modal для blocking decision.
- Вкладывать Popover в Popover.
- Открывать interactive Popover только по hover.
- Терять несохраненные изменения при outside click.
- Не возвращать focus после закрытия.
- Добавлять произвольные shadows, borders, colors или widths вне documented tokens.


## React runtime — 25.10.2026

Реальный public export `Popover` находится в packages/seda-ui/src/components/Popover. Это controlled nonmodal host, не готовые emoji/profile/color-picker приложения. Исторические Figma variant names сохранены; свежая сверка node1617:8952 недоступна из-за service quota. Исполняемый registry instance contract пока не введён. Общая цель зрелости библиотеки остаётся открытой.

### Публичный API и причины

- `open` и `onOpenChange(next,{reason})` обязательны: владелец принимает либо отклоняет intent и владеет dirty drafts. Reasons: trigger, close-button, escape, outside, focus-out, unavailable, native. `defaultOpen` текущая React-реализация не предоставляет; существующим app owners нужен единый controlled state.
- `trigger(bindings)` обязателен и возвращает реальный Button/IconButton со spread bindings: ref, onClick, onKeyDown, disabled, aria-haspopup=dialog, aria-expanded, aria-controls. Нет дополнительного wrapper-button или клонирования child props. Trigger должен быть native button; accessible name остаётся ответственностью его владельца.
- `title`, локализованный `closeLabel`, `children` обязательны; `description` — необязательный непустой текст, `footer` — собственные actions. Header, description и close — настоящие Text/IconButton/Icon. Controls сохраняют свои контракты.
- `size=s|m|l|xl` задаёт ширину поверхности независимо от provider controlSize; `variant=default|avatar|checkbox|emoji|icon|custom` помечает композицию. Dedicated emoji/grid/profile selection, их keyboard и domain state принадлежат children, не симулируются Popover.
- `side=top|bottom|left|right`, `align=start|center|end` задают предпочтение; фактическая сторона доступна как data-side после collision flip. Start/end логические, учитывают RTL. Нет произвольного width/arrow/shadow API.
- `disabled` запрещает открытие и выдаёт close intent при изменении; `initialFocusRef` выбирает meaningful child, иначе фокусируется heading. `returnFocusRef` задаёт логическую точку возврата, особенно при удалении trigger. Forwarded ref — реальная поверхность, null в закрытом состоянии.

При закрытии children размонтируются: durable/dirty draft хранится у владельца в controlled fields; uncontrolled input может сброситься при новом открытии. Нет скрытого forceMount или автоматического сохранения.

При Escape/close focus возвращается на trigger либо указанный return target. Outside pointer и focus-out сохраняют внешний target. Tab не запирается: из последнего control идёт к следующему элементу после trigger; Shift+Tab из первого — к trigger, Tab с trigger возвращает внутрь открытой панели. Удалённый focused child заменяется heading без захвата внешнего фокуса. Portal остаётся в owner Document и внутри owning native Modal при наличии; Menu/Tooltip сохраняют общий overlayStack, Escape закрывает только верхнюю поверхность. Открытый native Select picker получает первый Escape; родитель остаётся открыт. Повторный keydown при удержании Escape не снимает следующие слои, включая owning native Modal после закрытия последнего nonmodal overlay. Вложенный Popover запрещён. Новый Modal flow рендерится владельцем рядом с Popover, не внутри уничтожаемого children.

Visibility/layout: manual native Popover top layer при доступности; fixed portal fallback без API. Нет hover-only открытия, scrim или focus trap. Resize/scroll/visualViewport, ancestor style/direction и удаление trigger пересчитывают позицию. Clipped/hidden/inert/disabled anchor скрывает и обездвиживает surface и выдаёт unavailable intent; он не становится невидимым tab target. Native hide не переписывает controlled owner. Приложение не должно перезаписывать visibility/placement через style или передавать hidden/popover attributes.

### Реальные токены и явные geometry gaps

Проверены существующие десять color roles popover в tokens.json: surface.default; border.default/separator; title.foreground; description.foreground; close.icon.default/hover; close.surface.hover/active; focus.ring. CSS generator требует эти роли и отвергает отсутствующий focus.ring. Никаких новых tokens.json значений не добавлено. Portal переносит inherited compiler variables и направление с trigger; nested controls меняются через общий SEDA compiler/provider.

Width fallback240/320/400/480px; viewport margin8px и anchor gap8px; header/body/footer spacing16px, related fields8px и title-description4px. Border1px; radius от inherited control/preset radius; elevation0 8px 32px #0003. Это документированный experimental geometry adapter при отсутствующих width/padding/radius/elevation tokens, не точные значения из свежего Figma. Длинное содержимое прокручивается внутри ограниченной поверхности; изменение размера surface не растягивает контролы. Если окно физически меньше отдельного контрола или сценарий требует длинной формы/обязательного решения, владелец использует другой flow, а не бесконечно уплотняет Popover.

Files показывает короткие новости от Read more; Chat — локальную ссылку и существующий JSON export от Поделиться. Document/save/request/clipboard owners сохранены. Поиск Chat остаётся command palette в Modal. Отдельная installed-package композиция Search variant=overlay внутри Popover проверяет reusable anchored host; это не новый remote search service.

SSR/Strict hydration, token provenance, close ownership, native/fallback, focus traversal/repair, nested Menu/Modal, selected collision/density matrix, real Files/Chat model isolation и обе темы проверяются отдельными verifiers. Результаты полного release run фиксируются в reports/2026-10-25-popover.md; наличие экспорта не является full Figma/AT/OS acceptance. Native OS/AT, Firefox/WebKit и transformed/animated host edge cases требуют отдельной приёмки.
