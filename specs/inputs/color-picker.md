# Color Picker

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · `ColorPicker` (`6386:423`)
> **Foundation** · [Accessibility](../../foundation/accessibility.md), [Color](../../foundation/color.md), [Content](../../foundation/content.md), [Tokens](../../foundation/tokens.md)

---

## 1. Key Principles

### Что это

Color Picker — компонент для выбора пользовательского цвета через swatch, preset palette, spectrum, hue/alpha sliders и текстовый ввод значения. В SEDA AI он используется там, где цвет является пользовательскими данными: цвет категории, метки, бренда клиента, визуального объекта или настройки в продукте.

Color Picker не заменяет design tokens. Если команда выбирает системный цвет интерфейса, нужен token selector или заранее ограниченный список semantic tokens. Произвольный пользовательский цвет не должен автоматически становиться токеном дизайн-системы.

### Когда использовать

- Пользователь задает собственный цвет для объекта, категории, метки или брендовой настройки.
- Нужно поддержать точный ввод значения: `HEX`, `RGB`, `HSL` или `alpha`.
- Важно показать preview выбранного цвета до применения.
- Сценарий поддерживает presets, recent colors или сохраненные swatches.
- Выбранный цвет влияет на доступность, и требуется проверка contrast ratio.

### Не используйте

- Для выбора системного цвета состояния: `error`, `warning`, `success`, `disabled`.
- Для выбора semantic token из дизайн-системы без отдельного token selector.
- Когда доступно 3-8 фиксированных вариантов: используйте `Radio`, `Segmented Control` или `Select`.
- Если цвет влияет на текст или иконки, но сценарий не предусматривает contrast validation.
- Если выбранное значение должно проходить governance как часть темы или token architecture.

### Основные принципы

- **User color is data** — выбранный цвет хранится как пользовательское значение, а не как новый design token.
- **Tokens govern the control** — сам компонент оформляется через component tokens, даже если выбираемый цвет произвольный.
- **Preview is not enough** — swatch должен сопровождаться текстовым значением, label или accessible name.
- **Validation before apply** — невалидный формат, недопустимая alpha или низкий контраст не применяются молча.
- **Presets before free choice** — если сценарий можно ограничить безопасной палитрой, сначала показывайте presets.
- **AI assists, human validates** — AI может ускорить draft спецификации, handoff и проверки, но решение по accessibility и governance остается за человеком.

### Связанные спецификации

- [Text Field](text-field.md) — ручной ввод значения цвета.
- [Select](select.md) — выбор системного цвета или preset из списка.
- [Radio](radio.md) — выбор из короткого набора цветов.
- [Form](../overlays-layout/form.md) — размещение Color Picker в формах.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
|---|---:|---|
| `label` | Да | Видимое название поля. |
| `trigger` | Да | Контейнер со swatch, value input и иконкой раскрытия. |
| `swatch` | Да | Preview текущего цвета или empty state. |
| `value-input` | Да | Текстовый ввод `HEX`, `RGB`, `HSL` или другого поддержанного формата. |
| `helper-text` | Нет | Подсказка, ошибка, warning или результат проверки контраста. |
| `panel` | Условно | Расширенный выбор цвета в popover/panel. |
| `palette` | Нет | Набор preset swatches. |
| `spectrum` | Нет | Визуальный выбор hue, saturation и brightness. |
| `sliders` | Нет | Управление hue, alpha или каналами цвета. |
| `actions` | Условно | `Apply` и `Cancel`, если изменение не применяется сразу. |

Правила анатомии:

- `label` не заменяется placeholder.
- `swatch` всегда имеет текстовое значение, label или accessible name.
- `value-input` должен быть доступен с клавиатуры и показывать явную ошибку формата.
- `panel` не открывается у `disabled` trigger.
- `helper-text` используется для правил, которые пользователь может исправить: формат, alpha, contrast, недоступный preset.

---

## 3. Types / Variants

Figma component `ColorPicker` поддерживает property `Type` со значениями `swatch-only`, `compact`, `full`.

| Variant | Когда использовать | Ограничения |
|---|---|---|
| `swatch-only` | Выбор из заранее заданной палитры. | Каждый swatch должен иметь accessible name и selected state. |
| `compact` | Основной вариант для форм: trigger, swatch, value input и panel. | Не подходит для сложных редакторов цвета с большим числом настроек. |
| `full` | Брендовые настройки, редакторы, расширенные панели. | Требует больше места и подробного handoff для форматов, alpha и validation. |

Подкомпоненты в Figma:

| Подкомпонент | Назначение |
|---|---|
| `color-picker-panel` | Контейнер расширенного выбора; `Mode`: `compact`, `full`. |
| `color-picker-spectrum` | Область выбора saturation/brightness. |
| `color-picker-hue-slider` | Управление hue. |
| `color-picker-alpha-slider` | Управление прозрачностью. |
| `color-picker-swatch` | Preview значения; `Size`: `s`, `m`, `l`, `xl`; `State`: `empty`, `filled`, `disabled`. |
| `color-picker-swatch-item` | Элемент preset palette; `State`: `default`, `hover`, `selected`, `disabled`. |
| `color-picker-value-input` | Поле значения; `Format`: `HEX`, `R`, `G`, `B`, `A`; `State`: `default`, `focus`, `error`, `disabled`, `filled`. |
| `color-picker-thumb` | Thumb для spectrum и sliders. |

---

## 4. Sizes

Figma property `Size`: `s`, `m`, `l`, `xl`. Размер влияет на высоту trigger, размер swatch и плотность panel controls.

| Size | Контекст | Правило |
|---|---|---|
| `s` | Плотные панели, таблицы, компактные настройки. | Не уменьшайте keyboard focus area. |
| `m` | Основной размер для форм. | Используйте как default для desktop forms. |
| `l` | Простые формы и настройки с большим количеством пространства. | Сохраняйте одинаковую высоту с соседними inputs. |
| `xl` | Touch-first сценарии. | Hit area для trigger и swatches не меньше 44x44px. |

---

## 5. States

Figma property `State`: `default`, `hover`, `focus`, `filled`, `open`, `error`, `warning`, `disabled`, `read-only`.

| State | Когда возникает | Правило |
|---|---|---|
| `default` | Значение не выбрано или задано начальное значение. | Используются базовые surface, border и foreground tokens. |
| `hover` | Pointer над trigger или swatch. | Усиливается border или surface согласно token mapping. |
| `focus` | Фокус клавиатуры на trigger, input, swatch или slider. | Focus ring видим и не теряется при открытии panel. |
| `filled` | Есть валидное значение. | Swatch и value input показывают одно и то же значение. |
| `open` | Panel раскрыта. | `aria-expanded="true"`, фокус управляется внутри panel. |
| `error` | Формат невалиден, значение запрещено или контраст ниже минимума. | Значение не применяется без явного исправления или подтвержденного правила. |
| `warning` | Значение допустимо, но требует внимания. | Warning не блокирует действие, если сценарий это разрешает. |
| `disabled` | Контрол недоступен. | Не открывает panel и не принимает ввод. |
| `read-only` | Значение доступно только для просмотра. | Значение можно прочитать и при необходимости скопировать, но нельзя изменить. |

Допустимые сочетания:

| Сочетание | Допустимо | Правило |
|---|---:|---|
| `open` + `focus` | Да | Фокус остается в trigger/panel flow. |
| `filled` + `error` | Да | Значение есть, но не проходит validation. |
| `filled` + `warning` | Да | Значение допустимо, но требует проверки. |
| `read-only` + `filled` | Да | Значение видно и доступно для копирования. |
| `disabled` + `open` | Нет | Disabled control не раскрывается. |
| `error` + `warning` | Нет | Validation state должен быть один. |

---

## 6. Behavior

### Ввод значения

- Поддержанные форматы фиксируются в props и handoff: например `hex`, `rgb`, `hsl`, `alpha`.
- `value` нормализуется до согласованного output format.
- Невалидный ввод не должен молча приводиться к ближайшему цвету.
- Если включена alpha, handoff описывает диапазон, формат хранения и визуализацию прозрачности.
- Если сценарий зависит от контраста, validation должна знать background/foreground target.

### Panel и keyboard

- `Enter` или `Space` открывает panel из trigger.
- `Esc` закрывает panel без commit, если сценарий использует `Apply`.
- `Tab` проходит по интерактивным элементам в предсказуемом порядке.
- Arrow keys могут управлять sliders/spectrum, если это поддержано в реализации.
- При закрытии panel фокус возвращается на trigger.

### Commit model

| Model | Когда использовать | Handoff |
|---|---|---|
| `instant` | Изменение безопасно и обратимо. | `onChange` применяет значение сразу. |
| `apply` | Изменение влияет на бренд, доступность или внешний вид сложного объекта. | `onChange` меняет draft, `onCommit` применяет значение. |
| `form-submit` | Color Picker часть большой формы. | Значение валидируется вместе с формой. |

---

## 7. Accessibility

| Проверка | Требование |
|---|---|
| Label | У поля есть видимый label или связанный accessible name. |
| Swatch name | Цвет не передается только через визуальный swatch. |
| Keyboard | Trigger, input, swatches, sliders и actions доступны с клавиатуры. |
| Focus | Focus ring видим на всех интерактивных частях. |
| Validation | Ошибки формата и contrast feedback связаны с полем через `aria-describedby`. |
| Popover | `aria-expanded`, `aria-controls` и возврат фокуса описаны в реализации. |
| Contrast | Если выбранный цвет влияет на текст/иконки, проверяется contrast ratio. |
| Alpha | Прозрачность имеет текстовое значение, не только checkerboard preview. |

Acceptance checklist:

- [ ] Цветовое значение доступно как текст.
- [ ] `error` и `warning` не различаются только цветом.
- [ ] Panel открывается, закрывается и управляется с клавиатуры.
- [ ] Swatches имеют понятные labels.
- [ ] Touch target для trigger и swatches не меньше 44x44px в touch-first сценариях.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Color Picker доступны component tokens в namespace `color-picker`; новые token paths нельзя добавлять в спецификацию без обновления token architecture.

### Trigger

| Component token | Роль | Semantic token |
|---|---|---|
| `color-picker/trigger/surface/default` | Фон trigger по умолчанию. | `surface/base` |
| `color-picker/trigger/surface/hover` | Фон trigger при hover. | `surface/subtle` |
| `color-picker/trigger/surface/active` | Фон active/open trigger. | `surface/base` |
| `color-picker/trigger/surface/focus` | Фон trigger в focus. | `surface/base` |
| `color-picker/trigger/surface/disabled` | Фон disabled trigger. | `status/disabled/container` |
| `color-picker/trigger/surface/readOnly` | Фон read-only trigger. | `surface/subtle` |
| `color-picker/trigger/surface/error` | Фон error state. | `status/danger/container` |
| `color-picker/trigger/surface/warning` | Фон warning state. | `status/warning/container` |
| `color-picker/trigger/surface/success` | Фон success state. | `status/success/container` |
| `color-picker/trigger/border/default` | Граница trigger по умолчанию. | `border/default` |
| `color-picker/trigger/border/hover` | Граница trigger при hover. | `border/hover` |
| `color-picker/trigger/border/active` | Граница active/open trigger. | `border/strong` |
| `color-picker/trigger/border/focus` | Граница focus trigger. | `border/focus` |
| `color-picker/trigger/border/disabled` | Граница disabled trigger. | `status/disabled/border` |
| `color-picker/trigger/border/readOnly` | Граница read-only trigger. | `border/subtle` |
| `color-picker/trigger/border/error` | Граница error state. | `status/danger/border` |
| `color-picker/trigger/border/warning` | Граница warning state. | `status/warning/border` |
| `color-picker/trigger/border/success` | Граница success state. | `status/success/border` |
| `color-picker/trigger/foreground/default` | Текст значения. | `text/primary` |
| `color-picker/trigger/foreground/placeholder` | Placeholder. | `text/muted` |
| `color-picker/trigger/foreground/disabled` | Текст disabled state. | `status/disabled/text` |
| `color-picker/trigger/foreground/readOnly` | Текст read-only state. | `text/secondary` |
| `color-picker/trigger/icon/default` | Иконка trigger по умолчанию. | `icon/tertiary` |
| `color-picker/trigger/icon/active` | Иконка active/open trigger. | `icon/primary` |
| `color-picker/trigger/icon/disabled` | Иконка disabled state. | `status/disabled/icon` |
| `color-picker/trigger/icon/error` | Иконка error state. | `status/danger/icon` |
| `color-picker/trigger/icon/warning` | Иконка warning state. | `status/warning/icon` |
| `color-picker/trigger/icon/success` | Иконка success state. | `status/success/icon` |

### Swatch, panel и slider

| Component token | Роль | Semantic token |
|---|---|---|
| `color-picker/swatch/border/default` | Граница swatch по умолчанию. | `border/default` |
| `color-picker/swatch/border/hover` | Граница swatch при hover. | `border/hover` |
| `color-picker/swatch/border/selected` | Граница выбранного swatch. | `border/focus` |
| `color-picker/swatch/border/disabled` | Граница disabled swatch. | `status/disabled/border` |
| `color-picker/swatch/checkerboard/light` | Светлая ячейка checkerboard для alpha. | `color/neutral/0` |
| `color-picker/swatch/checkerboard/dark` | Темная ячейка checkerboard для alpha. | `color/neutral/20` |
| `color-picker/swatch/icon/selected` | Иконка выбранного swatch. | `text/on-brand/primary` |
| `color-picker/swatch/icon/disabled` | Иконка disabled swatch. | `status/disabled/icon` |
| `color-picker/panel/surface` | Фон popover/panel. | `surface/overlay` |
| `color-picker/panel/border` | Граница popover/panel. | `border/default` |
| `color-picker/slider/border` | Граница slider. | `border/default` |
| `color-picker/slider/thumb` | Поверхность thumb. | `surface/base` |
| `color-picker/slider/thumbBorder` | Граница thumb. | `border/strong` |
| `color-picker/slider/thumbShadow` | Тень thumb. | `shadow/ambient` |

### Label, helper и focus

| Component token | Роль | Semantic token |
|---|---|---|
| `color-picker/label/default` | Label по умолчанию. | `text/secondary` |
| `color-picker/label/disabled` | Label disabled state. | `status/disabled/text` |
| `color-picker/helper/default` | Helper text. | `text/tertiary` |
| `color-picker/helper/error` | Error text. | `status/danger/text` |
| `color-picker/helper/warning` | Warning text. | `status/warning/text` |
| `color-picker/helper/success` | Success text. | `status/success/text` |
| `color-picker/focus/ring` | Focus ring. | `focus/ring` |

Token gaps:

- Нет отдельного documented token для размера swatch и thumb. Пока размер задается через компонентную геометрию Figma и должен быть вынесен в token architecture только после system review.
- Нет отдельного token для checkerboard size. Не добавляйте новый путь без обновления `tokens.json`.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Значение | `value` | Нормализованное значение выбранного цвета. |
| Начальное значение | `defaultValue` | Только для uncontrolled mode. |
| Draft change | `onChange` | Вызывается при изменении внутри panel или input. |
| Commit | `onCommit` | Вызывается при Apply, blur или другом согласованном commit event. |
| Variant | `type` | `swatch-only`, `compact`, `full`. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Format | `format` | Поддержанные значения задаются явно: `hex`, `rgb`, `hsl`. |
| Alpha | `allowAlpha` | Включает прозрачность только при поддержке data model. |
| Presets | `presets` | Массив разрешенных swatches с `label` и `value`. |
| Validation | `validationState` | `error`, `warning`, `success` или пустое значение. |
| Helper | `helperText` | Подсказка или validation feedback. |
| Disabled | `disabled` | Отключает ввод и panel. |
| Read-only | `readOnly` | Показывает значение без редактирования. |

Контракт данных:

- `value` и `presets.value` используют один формат или явный adapter.
- `presets.label` обязателен для accessibility и не должен генерироваться только из HEX.
- Если включена alpha, handoff описывает диапазон, формат хранения и отображение прозрачности.
- Если выбранный цвет связан с design token, token id передается отдельно от пользовательского color value.

---

## 10. Handoff notes

Handoff для Color Picker должен фиксировать:

- `type`, `size`, `state` и выбранный commit model;
- поддержанные форматы значения и output format;
- включена ли alpha и как она сериализуется;
- список presets, их labels и правила сортировки;
- validation rules: формат, contrast, недоступные значения;
- поведение `onChange` и `onCommit`;
- panel placement, keyboard flow и focus management;
- empty, filled, error, warning, disabled и read-only states;
- где применяется выбранный цвет и нужен ли contrast target.

| Design artifact | Code artifact | AI can help with | Human must validate |
|---|---|---|---|
| Swatch и trigger | `ColorPicker` props | Подготовить props contract и state matrix. | Соответствие реальному компоненту и tokens. |
| Preset palette | `presets` data | Сформировать структуру label/value. | Разрешенность цветов и product rules. |
| Contrast feedback | validation logic | Составить acceptance criteria. | Accessibility thresholds и фон проверки. |
| Panel behavior | focus/keyboard handling | Описать сценарии клавиатуры. | Реальную реализацию focus management. |

---

## 11. Acceptance criteria

- [ ] Компонент использует только documented variants, sizes и states.
- [ ] Trigger, swatch, panel, slider, label, helper и focus используют component tokens из `tokens.json`.
- [ ] В спецификации нет raw color values как визуальных решений для самого компонента.
- [ ] Value input валидирует формат и показывает текстовую ошибку.
- [ ] Panel открывается и закрывается с клавиатуры.
- [ ] `disabled` не открывает panel и не принимает ввод.
- [ ] `read-only` позволяет просмотреть и при необходимости скопировать значение.
- [ ] Presets имеют label, selected state и keyboard navigation.
- [ ] Contrast validation описана для accessibility-критичных сценариев.
- [ ] Handoff содержит output format, alpha rules и commit behavior.

---

## 12. AI usage rules

AI может:

- подготовить draft props contract для Color Picker;
- проверить, что spec использует реальные component tokens из `tokens.json`;
- предложить state matrix и acceptance criteria;
- подготовить handoff notes для panel, presets, alpha и validation;
- найти сценарии, где нужен contrast feedback.

AI не должен:

- создавать новые token paths без явного `Token gap`;
- превращать произвольный пользовательский цвет в design token;
- предлагать raw color values для оформления trigger, border, helper или focus ring;
- скрывать accessibility-риск, если background или contrast target неизвестны;
- добавлять variants, props или states, которых нет в спецификации;
- считать Color Picker заменой token governance.

Если требования продукта выходят за текущую спецификацию, AI должен пометить их как `Needs system review`. Финальное решение принимает дизайнер или владелец системы.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Настройка цвета пользовательской категории через `compact` Color Picker. | Цвет является пользовательским данным, а не системным token. |
| Выбор брендового цвета из presets без свободного ввода. | Governance ограничивает выбор разрешенной палитрой. |
| Цвет текста проверяется через contrast validation перед Apply. | Accessibility-риск проверяется до применения. |
| Alpha включена только там, где data model поддерживает прозрачность. | Handoff не обещает невозможное поведение. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Пользователь выбирает цвет фона для карточки. | Есть ли контраст с текстом и иконками внутри карточки. |
| Команда хочет сохранять выбранные цвета как tokens. | Нужен governance process, naming и owner. |
| Color Picker используется в таблице. | Достаточны ли compact size, keyboard navigation и panel placement. |

---

## 14. Anti-patterns

- Использовать Color Picker для выбора системных semantic colors вместо token selector.
- Показывать только цветной swatch без текстового значения или accessible name.
- Применять невалидный ввод после blur без явного сообщения.
- Использовать raw color values для оформления trigger, border, helper или focus ring.
- Давать пользователю выбрать цвет текста без проверки контраста.
- Смешивать presets, recent colors и semantic tokens без визуального разделения.
- Открывать panel из `disabled` state.
- Генерировать handoff без формата значения, alpha rules и commit behavior.
