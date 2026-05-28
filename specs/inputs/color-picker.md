# Color Picker

> **Category** · Inputs & Forms
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · TBD
> **Foundation** · `accessibility.md`, `color.md`, `content.md`, `iconography.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Color Picker — компонент для выбора пользовательского цвета через swatch, список готовых цветов, spectrum, slider и текстовый ввод значения. В SEDA AI он используется только там, где цвет является пользовательским данным: например, цвет категории, метки, бренда клиента или визуального объекта.

Color Picker не заменяет выбор design token. Если продуктовая команда выбирает системный цвет интерфейса, нужен token selector, заранее заданный список semantic tokens или настройка темы через governance-процесс.

### Когда использовать

Используйте Color Picker, когда:

- пользователь задает собственный цвет для объекта, категории, метки или брендовой настройки;
- нужен точный ввод значения в формате HEX, RGB, HSL или alpha;
- требуется показать preview выбранного цвета до применения;
- продукт поддерживает пользовательские палитры, presets или сохраненные swatches;
- нужно проверить контраст выбранного цвета с фоном или текстом.

### Не используйте

Не используйте Color Picker, когда:

- нужно выбрать цвет интерфейсного состояния `error`, `warning`, `success` или `disabled`;
- пользователь должен выбрать один из системных semantic tokens;
- доступно 3-8 фиксированных вариантов — в этом случае лучше подходят `Radio`, `Segmented Control` или `Select`;
- цвет влияет на accessibility-критичные элементы, но в интерфейсе нет проверки contrast ratio;
- выбранное значение должно проходить дизайн-ревью как часть темы или brand governance.

### Основные принципы

- **User color is data** — выбранный цвет хранится как пользовательское значение, а не как новый design token.
- **Tokens govern the control** — сам Color Picker оформляется через component tokens, даже если выбираемый цвет произвольный.
- **Preview is not enough** — рядом со swatch должно быть текстовое значение, имя цвета или понятная подпись.
- **Validation before apply** — невалидный формат, недопустимая alpha или плохой контраст не применяются молча.
- **Presets before free choice** — если сценарий можно ограничить безопасной палитрой, сначала показывайте presets.
- **AI drafts, human validates** — AI может подготовить структуру выбора, handoff notes и проверки, но финальное решение по доступности и brand rules остается за человеком.

### Связанные спецификации

- [Text Field](../specs/inputs/text-field.md) — ручной ввод значения цвета.
- [Select](../specs/inputs/select.md) — выбор системного цвета или preset из списка.
- [Radio](../specs/inputs/radio.md) — выбор из короткого набора цветов.
- [Form](../specs/overlays-layout/form.md) — размещение Color Picker в формах.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `label` | Да | Видимое название поля. |
| `trigger` | Да | Контейнер со swatch, value input и иконкой раскрытия. |
| `swatch` | Да | Preview текущего цвета или пустого состояния. |
| `value-input` | Да | Текстовый ввод HEX, RGB, HSL или другого поддержанного формата. |
| `helper-text` | Нет | Подсказка, ошибка, warning или результат contrast validation. |
| `popover` | Условно | Расширенный выбор цвета. |
| `palette` | Нет | Набор preset swatches. |
| `spectrum` | Нет | Визуальный выбор hue, saturation и brightness. |
| `sliders` | Нет | Управление каналами RGB, HSL или alpha. |
| `actions` | Условно | `Apply` и `Cancel`, если изменение не применяется сразу. |

### Правила анатомии

- `label` не заменяется placeholder.
- `swatch` всегда сопровождается текстовым value, названием цвета или accessible name.
- `value-input` должен быть доступен с клавиатуры и поддерживать явную ошибку формата.
- `popover` не должен открываться у `disabled` trigger.
- `helper-text` используется для правил, которые пользователь может исправить: формат, alpha, contrast, недоступный preset.

---

## 3. Types / Variants / Варианты

| Вариант | Когда использовать | Ограничения |
|---|---|---|
| `swatch-only` | Выбор из заранее заданной палитры. | Каждый swatch должен иметь accessible name. |
| `compact` | Основной вариант для форм: swatch, value input и popover. | Не подходит для сложных редакторов цвета. |
| `full` | Настройки бренда, редакторы, расширенные панели. | Требует больше места и явного handoff для форматов. |
| `token-limited` | Выбор только из разрешенных semantic tokens или brand presets. | Не допускает произвольный ввод, если governance запрещает его. |

### Модификаторы

| Модификатор | Назначение | Что проверить |
|---|---|---|
| `with-alpha` | Добавляет управление прозрачностью. | Поддерживается ли alpha в коде и data model. |
| `with-contrast` | Показывает результат проверки контраста. | Известен ли background или foreground для расчета. |
| `with-presets` | Показывает сохраненные или системные swatches. | Есть ли порядок, подписи и selected state. |
| `read-only` | Показывает значение без возможности редактирования. | Можно ли скопировать значение. |

---

## 4. Sizes / Размеры

Color Picker наследует sizing-логику input controls. Размер влияет на высоту trigger, swatch и плотность popover-контролов.

| Size | Высота trigger | Swatch | Контекст |
|---|---:|---:|---|
| `small` | 24px | 14px | Плотные панели и таблицы. |
| `medium` | 32px | 16px | Основной размер для форм. |
| `large` | 40px | 18px | Простые формы и настройки. |
| `extraLarge` | 48px | 20px | Touch-first сценарии. |

Touch target для интерактивных swatches и trigger должен быть не меньше 44x44px за счет hit area, даже если визуальный swatch меньше.

---

## 5. States / Состояния

| Состояние | Когда возникает | Визуальное и поведенческое правило |
|---|---|---|
| `default` | Значение не выбрано или задано начальное значение. | Базовые `surface`, `border`, `foreground`. |
| `hover` | Pointer над trigger или swatch. | Усиливается border или surface согласно token mapping. |
| `focus` | Фокус клавиатуры на trigger, input, swatch или slider. | Используется focus ring, фокус не теряется при открытии popover. |
| `active` | Пользователь нажимает trigger или swatch. | Border может переходить в active. |
| `open` | Popover раскрыт. | `aria-expanded="true"`, фокус переводится внутрь popover по паттерну. |
| `filled` | Есть валидное значение. | Swatch и value input показывают одно и то же значение. |
| `error` | Формат невалиден, значение запрещено или contrast ниже минимума. | Значение не применяется без явного подтверждения правила. |
| `warning` | Значение допустимо, но требует внимания. | Warning не блокирует действие, если продуктовый сценарий это разрешает. |
| `success` | Проверка пройдена и подтверждение полезно пользователю. | Используется только там, где success помогает принять решение. |
| `disabled` | Контрол недоступен. | Не открывает popover и не принимает ввод. |
| `read-only` | Значение доступно только для просмотра. | Пользователь может скопировать value, но не изменить его. |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
|---|---:|---|
| `open` + `focus` | Да | Фокус остается внутри trigger/popover. |
| `filled` + `error` | Да | Значение есть, но не проходит validation. |
| `filled` + `warning` | Да | Значение допустимо, но требует проверки. |
| `read-only` + `filled` | Да | Значение видно и доступно для копирования. |
| `disabled` + `open` | Нет | Disabled control не раскрывается. |
| `error` + `success` | Нет | Validation states взаимоисключающие. |

---

## 6. Behavior / Поведение

### Ввод значения

- Поддержанные форматы должны быть перечислены в props и handoff: например `hex`, `rgb`, `hsl`, `alpha`.
- Значение нормализуется в один output format, согласованный с кодом.
- Ввод без префикса HEX может нормализоваться, если формат однозначен.
- Невалидный ввод показывает `error`, не меняет committed value и не закрывает popover.
- При `read-only` value можно выделить и скопировать.

### Popover

- Popover открывается по trigger, `Enter` или `Space`.
- `Escape` закрывает popover и возвращает фокус на trigger.
- Если есть `Apply` и `Cancel`, изменение считается draft до подтверждения.
- Если изменения применяются сразу, handoff должен явно описывать `onChange` и `onCommit`.
- Popover должен помещаться во viewport и иметь predictable placement.

### Swatches и presets

- Swatches должны иметь selected, hover, focus и disabled states.
- Presets сортируются по продуктовой логике: системные, сохраненные, последние использованные или брендовые.
- Нельзя показывать недоступный цвет как обычный enabled swatch.
- Для прозрачности используется checkerboard background через component tokens.

### Contrast validation

- Contrast validation обязательна, если выбранный цвет применяется к тексту, иконке, background или data visualization с accessibility-риском.
- Результат проверки должен быть текстовым, а не только цветовым.
- Если background неизвестен, AI и handoff должны пометить это как `Needs system review`.

---

## 7. Accessibility

### Семантика

| Элемент | Рекомендация | Когда |
|---|---|---|
| `label` | `<label for="...">` или связанный accessible label. | Всегда. |
| `value-input` | Нативный `<input>` с `aria-describedby`. | Для ручного ввода. |
| `trigger` | `<button type="button">` или input group с корректной ролью. | Когда открывается popover. |
| `swatch` | `<button type="button">` с accessible name. | Если swatch интерактивен. |
| `slider` | Нативный input или `role="slider"` с `aria-valuenow`. | Для RGB, HSL, alpha. |
| `popover` | Диалоговый или popover pattern с управлением фокусом. | Для расширенного выбора. |

### ARIA и сообщения

| Атрибут | Где использовать | Правило |
|---|---|---|
| `aria-expanded` | Trigger | Отражает открытие popover. |
| `aria-controls` | Trigger | Указывает на popover, если он есть в DOM. |
| `aria-invalid="true"` | Value input | Только при реальной validation error. |
| `aria-describedby` | Input/trigger | Связывает helper, error или contrast feedback. |
| `aria-label` | Swatch без текста | Называет цвет или действие. |

### Accessibility checklist

- [ ] У компонента есть видимый label или равноценная доступная метка.
- [ ] Swatch не является единственным источником информации о цвете.
- [ ] Все интерактивные swatches доступны с клавиатуры.
- [ ] Popover закрывается по `Escape` и возвращает фокус.
- [ ] Невалидный формат объясняется текстом.
- [ ] Contrast feedback не передается только цветом.
- [ ] Alpha и прозрачность имеют понятное текстовое значение.
- [ ] Touch target для trigger и swatches не меньше 44x44px.

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

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Значение | `value` | Хранит нормализованное значение выбранного цвета. |
| Начальное значение | `defaultValue` | Используется только в uncontrolled mode. |
| Изменение draft | `onChange` | Вызывается при изменении внутри popover или input. |
| Подтверждение | `onCommit` | Вызывается при Apply, blur или другом согласованном commit-событии. |
| Формат | `format` | Разрешенные значения задаются явно: `hex`, `rgb`, `hsl`. |
| Alpha | `alpha` или `allowAlpha` | Включает прозрачность только при поддержке data model. |
| Presets | `presets` | Передает разрешенные swatches с label и value. |
| Validation | `validationState` | `error`, `warning`, `success` или пустое значение. |
| Helper | `helperText` | Текст подсказки или validation feedback. |
| Disabled | `disabled` | Полностью отключает ввод и popover. |
| Read-only | `readOnly` | Показывает значение без редактирования. |

### Контракт данных

- `value` и `presets.value` должны использовать один формат или явный adapter.
- `presets.label` обязателен для accessibility и не должен генерироваться только из HEX.
- Если компонент поддерживает alpha, handoff должен описывать диапазон, формат хранения и отображение прозрачности.
- Если выбранный цвет связан с design token, передавайте token id отдельно от пользовательского color value.

---

## 10. Handoff notes

Handoff для Color Picker должен фиксировать:

- variant: `swatch-only`, `compact`, `full` или `token-limited`;
- поддержанные форматы значения и output format;
- включена ли alpha и как она сериализуется;
- список presets и правила сортировки;
- validation rules: формат, contrast, недоступные значения;
- поведение `onChange` и `onCommit`;
- popover placement и focus management;
- empty, filled, error, warning, disabled и read-only states;
- где выбранный цвет применяется и нужен ли contrast validation.

### Таблица handoff

| Design artifact | Code artifact | AI can help with | Human must validate |
|---|---|---|---|
| Swatch и trigger | `ColorPicker` variant props | Подготовить props contract и state matrix. | Соответствие реальному компоненту и tokens. |
| Preset palette | `presets` data | Сформировать структуру label/value. | Разрешенность цветов и brand rules. |
| Contrast feedback | validation logic | Составить acceptance criteria. | Accessibility thresholds и фон проверки. |
| Popover behavior | focus/keyboard handling | Описать сценарии клавиатуры. | Реальную реализацию focus management. |

---

## 11. Acceptance criteria

- [ ] Компонент использует только documented variants и states.
- [ ] Trigger, swatch, panel, slider, label, helper и focus используют component tokens из `tokens.json`.
- [ ] В спецификации нет raw color values как визуальных решений для самого компонента.
- [ ] Value input валидирует формат и показывает текстовую ошибку.
- [ ] Popover открывается и закрывается с клавиатуры.
- [ ] `disabled` не открывает popover и не принимает ввод.
- [ ] `read-only` позволяет просмотреть и скопировать значение.
- [ ] Presets имеют label, selected state и keyboard navigation.
- [ ] Contrast validation описана для accessibility-критичных сценариев.
- [ ] Handoff содержит output format, alpha rules и commit behavior.

---

## 12. AI usage rules

AI может:

- подготовить draft props contract для Color Picker;
- проверить, что spec использует реальные component tokens из `tokens.json`;
- предложить state matrix и acceptance criteria;
- подготовить handoff notes для popover, presets, alpha и validation;
- найти сценарии, где нужен contrast feedback.

AI не должен:

- создавать новые token paths без явного `Token gap`;
- превращать произвольный пользовательский цвет в design token;
- предлагать raw color values для оформления самого компонента;
- скрывать accessibility-риск, если background или contrast target неизвестны;
- добавлять variants, props или states, которых нет в спецификации;
- считать Color Picker заменой token governance.

Если требования продукта выходят за текущую спецификацию, AI должен пометить их как `Needs system review`.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Настройка цвета пользовательской категории через `compact` Color Picker. | Цвет является пользовательским данным, а не системным token. |
| Выбор брендового цвета из `token-limited` presets без свободного ввода. | Governance ограничивает выбор разрешенной палитрой. |
| Цвет текста проверяется через contrast validation перед Apply. | Accessibility-риск проверяется до применения. |
| Alpha включена только там, где data model поддерживает прозрачность. | Handoff не обещает невозможное поведение. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Пользователь выбирает цвет фона для карточки. | Есть ли контраст с текстом и иконками внутри карточки. |
| Команда хочет сохранять выбранные цвета как tokens. | Нужен governance-процесс, naming и owner. |
| Color Picker используется в таблице. | Достаточны ли compact size, keyboard navigation и popover placement. |

---

## 14. Anti-patterns

- Использовать Color Picker для выбора системных semantic colors вместо token selector.
- Показывать только цветной swatch без текстового значения или accessible name.
- Применять невалидный ввод после blur без явного сообщения.
- Использовать raw color values для оформления trigger, border, helper или focus ring.
- Давать пользователю выбрать цвет текста без проверки контраста.
- Смешивать presets, recent colors и semantic tokens без визуального разделения.
- Открывать popover из disabled state.
- Генерировать handoff без формата значения, alpha rules и commit behavior.
