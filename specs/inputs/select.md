# Select

> **Category** · Inputs
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Select](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=4080-170)

---

## 1. Key Principles

### Что это

Select — контрол выбора одного или нескольких значений из раскрывающегося списка. Он используется, когда варианты заранее известны, но их больше, чем удобно показывать через Radio или Checkbox.

В SEDA AI Select описан как часть AI-ready design system framework: spec фиксирует trigger, dropdown, option states, props contract, token mapping, accessibility, handoff и AI usage rules. AI может помогать проверять состав options, состояния, empty/error/loading сценарии и handoff, но не должен придумывать новые variants, props или tokens.

### Когда использовать

- Нужно выбрать одно значение из списка.
- Нужно выбрать несколько значений из списка с понятным selected state.
- Вариантов больше, чем удобно показывать всегда видимыми controls.
- Нужны `open`, `filled`, `error`, `disabled` states.
- Значения имеют label/value contract и могут быть переданы в Form.

### Когда не использовать

- Для короткого видимого выбора используйте Radio или Checkbox.
- Для команд и actions используйте Dropdown Menu.
- Для поиска по данным с results panel используйте Search.
- Для свободного ввода используйте Text Field.
- Не используйте Select, если options неизвестны и генерируются без product rules.

### Ключевые принципы

- **Options are data** — каждый option имеет stable `value`, видимый `label` и optional metadata.
- **Selection is explicit** — selected state виден и программно доступен.
- **Open state has ownership** — trigger, dropdown и parent Form не должны конфликтовать за `open`.
- **Tokens before visuals** — trigger, arrow, list и option оформляются через component tokens.
- **AI assists, system governs** — AI может предложить структуру options, но не утверждает data model и business rules.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер Select и связь trigger/dropdown. |
| `label` | условно | Видимое имя поля, если Select используется в форме. |
| `trigger` | да | Интерактивный control, который показывает текущее значение и раскрывает список. |
| `value` | да | Label выбранного значения или summary для multi select. |
| `placeholder` | опционально | Текст до выбора, не заменяет label. |
| `arrow` | да | Индикатор раскрытия; не должен быть единственным признаком open state. |
| `dropdown` | да | Список options, связанный с trigger. |
| `option` | да | Элемент выбора с label, value и state. |
| `helperText` | опционально | Подсказка или ограничение выбора. |
| `errorText` | условно | Текст ошибки для `State=error`. |

Подкомпоненты в Figma:

| Component | Назначение |
| --- | --- |
| `Select` | Trigger/control с `Type`, `Size`, `State`. |
| `select-dropdown` | Контейнер списка options. |
| `select-option` | Элемент списка; должен иметь `selected`, `hover`, `disabled` и text contract. |

---

## 3. Types / Variants

Figma component set: `Select`. Variants: 56.

| Property | Default | Options |
| --- | --- | --- |
| `Type` | `single` | `single`, `multi` |
| `Size` | `small` | `small`, `medium`, `large`, `extraLarge` |
| `State` | `default` | `default`, `hover`, `focus`, `open`, `filled`, `error`, `disabled` |

### Type rules

| Type | Когда использовать | Правило |
| --- | --- | --- |
| `single` | Пользователь выбирает одно значение. | `value` хранит один option id. |
| `multi` | Пользователь выбирает несколько значений. | `value` хранит массив option ids; trigger показывает summary. |

### State rules

- `open` означает, что dropdown видим и связан с trigger.
- `filled` означает, что выбран хотя бы один option.
- `error` требует текст ошибки и связь с Form validation.
- `disabled` блокирует trigger и не открывает dropdown.
- `hover` и `focus` не заменяют selected state option.

Если нужен searchable select, async loading, grouping, creatable options или virtualized list, пометьте сценарий как `Needs system review`, пока это не зафиксировано в component set и handoff.

---

## 4. Sizes

| Size | Контекст | Правило |
| --- | --- | --- |
| `small` | Плотные формы, фильтры, таблицы. | Используйте только при коротких labels. |
| `medium` | Базовые формы и настройки. | Рекомендуемый default. |
| `large` | Простые формы и onboarding. | Хорош для touch/mouse mixed сценариев. |
| `extraLarge` | Touch-first интерфейсы. | Trigger и options должны сохранять touch target. |

Dropdown должен соответствовать ширине trigger или иметь явно описанное правило ширины. На мобильных узких экранах long labels переносятся или truncation описывается в handoff.

---

## 5. States

| State | Trigger | Dropdown / option |
| --- | --- | --- |
| `default` | Нет выбранного значения или есть placeholder. | Dropdown закрыт. |
| `hover` | Pointer над trigger. | Option hover не должен менять selection. |
| `focus` | Trigger или active option в keyboard flow. | Focus indicator видим. |
| `open` | `aria-expanded="true"`. | Dropdown видим, active option управляется клавиатурой. |
| `filled` | Trigger показывает выбранный label или summary. | Selected options имеют selected state. |
| `error` | Trigger показывает error styling. | Error text находится рядом с field, не внутри option list. |
| `disabled` | Trigger недоступен. | Dropdown не открывается. |

Multi select:

- selected options должны быть видимы в dropdown;
- trigger показывает summary: один label, несколько chips или счетчик;
- clear all должен быть отдельной action, если она есть в UI;
- max selected count и disabled options передаются в handoff.

---

## 6. Behavior

### Opening and closing

- `Enter`, `Space` или click по trigger открывает dropdown.
- `Esc` закрывает dropdown и возвращает фокус на trigger.
- Click outside закрывает dropdown без изменения selection, если option не выбран.
- После выбора в `single` dropdown обычно закрывается.
- После выбора в `multi` dropdown может оставаться open; правило фиксируется в handoff.

### Selection

- Option selection меняет только value, а не label вручную.
- Disabled option видим только если он нужен для объяснения недоступного выбора.
- Если options загружаются async, loading и error state должны быть описаны как parent pattern.
- Empty options state не должен выглядеть как disabled Select; нужен explicit empty message.

### Keyboard

| Key | Поведение |
| --- | --- |
| `Tab` | Переходит к trigger или следующему focusable control. |
| `Enter` / `Space` | Открывает dropdown или выбирает active option. |
| `ArrowDown` / `ArrowUp` | Перемещает active option. |
| `Home` / `End` | Переходит к первому/последнему option, если поддержано. |
| `Esc` | Закрывает dropdown. |
| Typeahead | Допустим, если options локальные и правило описано в handoff. |

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Label | Select имеет видимый label или программное имя. |
| Expanded state | Trigger передает `aria-expanded`. |
| Relationship | Trigger связан с dropdown через `aria-controls` или framework equivalent. |
| Options | Каждый option имеет текстовый label и selected/disabled state программно. |
| Error | `State=error` использует `aria-invalid` и error text. |
| Keyboard | Dropdown полностью управляется клавиатурой. |
| Focus | Фокус не теряется при open/close и выборе option. |
| Multi select | Количество выбранных значений понятно screen reader пользователю. |

Accessibility checklist:

- [ ] Trigger имеет accessible name.
- [ ] `open` state программно доступен.
- [ ] Selected option не обозначен только цветом.
- [ ] Error text связан с field.
- [ ] Disabled options имеют понятную причину или не показываются.
- [ ] Long option labels читаются и не ломают dropdown.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`. Для Select используются component tokens из namespace `select`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/select/surface/default` | Фон trigger. | `surface/base` |
| `$collections/components/$modes/Mode 1/select/surface/hover` | Фон hover. | `surface/subtle` |
| `$collections/components/$modes/Mode 1/select/surface/focus` | Фон focus. | `surface/base` |
| `$collections/components/$modes/Mode 1/select/surface/disabled` | Фон disabled. | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/select/surface/error` | Фон error. | `status/danger/container` |
| `$collections/components/$modes/Mode 1/select/border/default` | Граница trigger. | `border/default` |
| `$collections/components/$modes/Mode 1/select/border/hover` | Граница hover. | `border/hover` |
| `$collections/components/$modes/Mode 1/select/border/focus` | Граница focus. | `border/focus` |
| `$collections/components/$modes/Mode 1/select/border/error` | Граница error. | `status/danger/border` |
| `$collections/components/$modes/Mode 1/select/border/disabled` | Граница disabled. | `status/disabled/border` |
| `$collections/components/$modes/Mode 1/select/foreground/default` | Текст выбранного значения. | `text/primary` |
| `$collections/components/$modes/Mode 1/select/foreground/placeholder` | Placeholder. | `text/muted` |
| `$collections/components/$modes/Mode 1/select/foreground/disabled` | Текст disabled. | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/select/arrow/default` | Arrow icon. | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/select/arrow/active` | Arrow в open/active. | `icon/primary` |
| `$collections/components/$modes/Mode 1/select/arrow/disabled` | Arrow disabled. | `status/disabled/icon` |
| `$collections/components/$modes/Mode 1/select/arrow/error` | Arrow error. | `status/danger/icon` |
| `$collections/components/$modes/Mode 1/select/focus/ring` | Focus ring. | `focus/ring` |
| `$collections/components/$modes/Mode 1/select/dropdown/surface` | Фон dropdown. | `surface/overlay` |
| `$collections/components/$modes/Mode 1/select/dropdown/border` | Граница dropdown. | `border/default` |
| `$collections/components/$modes/Mode 1/select/option/foreground/default` | Текст option. | `text/primary` |
| `$collections/components/$modes/Mode 1/select/option/foreground/disabled` | Текст disabled option. | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/select/option/surface/hover` | Фон hover option. | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/select/option/surface/selected` | Фон selected option. | `container/neutral/selected` |

Token gaps:

- Если конкретный option-level token отсутствует в `tokens.json`, используйте ближайший существующий semantic token только с пометкой `Token gap`.
- Не добавляйте локальные colors для dropdown или selected option.
- Searchable/async Select может потребовать дополнительных tokens для loading и empty state; это `Needs system review`.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Type | `type` / `multiple` | `single` или `multi`. |
| Size | `size` | `small`, `medium`, `large`, `extraLarge`. |
| Value | `value` / `defaultValue` | Single: один id; multi: массив ids. |
| Options | `options` | Массив `{ value, label, disabled?, description? }`. |
| Open | `open`, `defaultOpen`, `onOpenChange` | Controlled и uncontrolled modes не смешиваются. |
| Change | `onChange` | Возвращает value, а не label. |
| Error | `error`, `errorText` | Error state плюс текст. |
| Placeholder | `placeholder` | Только до выбора. |
| Disabled | `disabled` | Блокирует trigger. |
| Option disabled | `option.disabled` | Блокирует выбор конкретного option. |
| Empty | `emptyText` | Показывается, если options пустые. |

Contract rules:

- `label` нужен для отображения, `value` нужен для данных; не храните только label.
- Multi select должен явно описывать порядок selected values.
- Async options должны иметь loading/error/empty owner вне Select, если Figma state это не покрывает.
- Creatable options не поддержаны без system review.

---

## 10. Handoff notes

Handoff для Select должен включать:

- Figma component и node id: `4080:170`;
- `Type`, `Size`, `State`;
- single или multi value model;
- schema options: `value`, `label`, `disabled`, `description`, grouping;
- selected summary в trigger;
- open/close behavior и owner `open`;
- keyboard flow и focus return;
- empty/loading/error states для options source;
- token mapping и token gaps;
- mobile behavior: dropdown, sheet или native select.

### Acceptance criteria

- Select использует только documented `Type`, `Size`, `State`.
- Trigger имеет accessible name и программный `open` state.
- Option labels и values разделены в data contract.
- Selected state видим и доступен программно.
- Multi select описывает summary и порядок selected values.
- Error state сопровождается error text.
- Dropdown закрывается и возвращает focus предсказуемо.
- AI-generated output не добавляет searchable/async/creatable behavior без `Needs system review`.

---

## 11. AI usage rules

- AI может предложить структуру options и selected summary, но должен явно отделять label от value.
- AI должен сверять `tokens.json` до изменения Design Tokens.
- AI не должен превращать Select в Search, Dropdown Menu или free text input.
- AI должен помечать async loading, grouping, virtualization, creatable options и searchable behavior как `Needs system review`, если они не описаны в spec.
- AI может подготовить keyboard и accessibility checklist, но человек проверяет product data model.

---

## 12. Примеры

### Корректно

| Сценарий | Почему |
| --- | --- |
| Select страны из длинного списка с `value=countryCode`. | Есть stable value и понятный label. |
| Multi select ролей с summary "3 выбрано". | Trigger не перегружается длинными labels. |
| Disabled option с объяснением в helper или description. | Пользователь понимает ограничение. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Select должен искать по удаленному API. | Нужен async/search pattern. |
| Пользователь может создать новый option. | Creatable behavior не покрыт текущими variants. |
| Dropdown должен быть bottom sheet на mobile. | Нужен platform handoff. |

---

## 13. Anti-patterns

- Использовать Select для команд вместо Dropdown Menu.
- Хранить только label без stable value.
- Показывать selected state только цветом.
- Закрывать multi select после каждого выбора без описанного правила.
- Прятать error только в Toast.
- Добавлять searchable или async behavior без system review.
- Использовать raw colors для dropdown, option hover или selected state.
