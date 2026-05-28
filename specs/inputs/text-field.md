# Text Field

> **Category** · Inputs
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [TextField/Input](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=914-9795)

---

## 1. Key Principles

### Что это

Text Field — однострочный текстовый ввод для коротких значений: имя, email, пароль, номер, поисковый запрос, код, URL или другое значение, которое пользователь может ввести и проверить в рамках одного поля.

В SEDA AI Text Field описан как часть AI-ready design system framework: спецификация связывает Figma variants, props contract, design tokens, accessibility, validation и handoff. AI может ускорять аудит, черновики microcopy, acceptance criteria и проверку соответствия rules, но не принимает финальные решения за дизайнера и разработчика.

### Когда использовать

- Пользователь вводит короткое однострочное значение.
- Полю нужны label, hint, error text или success/warning feedback.
- Значение должно валидироваться: формат, обязательность, длина, маска, уникальность.
- Нужны prefix/suffix, clear control или affordance для типа значения.
- Поле входит в Form и участвует в submit/validation flow.

### Когда не использовать

- Для многострочного текста используйте [Text Area](text-area.md).
- Для выбора из списка используйте [Select](select.md), Radio или Checkbox.
- Для поиска с результатами используйте [Search](../overlays-layout/search.md).
- Не используйте placeholder вместо label.
- Не добавляйте локальные visual props вместо component tokens.

### Ключевые принципы

- **Label is persistent** — пользователь должен понимать назначение поля после начала ввода.
- **Validation is recoverable** — error text объясняет, что исправить, а не только сообщает факт ошибки.
- **Input type is explicit** — keyboard, mask, autocomplete и parser соответствуют типу данных.
- **Tokens before visuals** — surface, border, foreground, helper, label и focus берутся из component tokens.
- **AI assists, system governs** — AI может предложить тексты и проверки, но не придумывает variants, props или token paths.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер поля, label, control и feedback. |
| `label` | да | Видимое имя поля. Не заменяется placeholder. |
| `control` | да | Интерактивная область ввода. |
| `input` | да | Нативный или framework input с value, focus и validation contract. |
| `placeholder` | опционально | Пример формата, а не инструкция и не label. |
| `prefix` | опционально | Валюта, протокол, icon или короткий текст перед значением. |
| `suffix` | опционально | Единица измерения, action, icon или статус после значения. |
| `clear` | опционально | Очистка значения, если она не конфликтует с validation flow. |
| `helperText` | опционально | Подсказка, ограничение или neutral feedback. |
| `errorInfo` | условно | Текст ошибки, связанный с input программно. |

Правила anatomy:

- `label`, `hintText` и `errorInfo` соответствуют boolean properties в Figma: `label (917:31)`, `hintText (917:62)`, `errorInfo (917:97)`.
- Prefix и suffix не должны подменять label или обязательный helper text.
- Clear control доступен с клавиатуры и имеет понятное accessible name.
- Если поле замаскировано, нужно описать правила reveal/hide и security constraints.

---

## 3. Types / Variants

Figma component set: `TextField/Input`. Variants: 40.

| Property | Default | Options |
| --- | --- | --- |
| `size` | `s` | `s`, `m`, `l`, `xl` |
| `state` | `default` | `default`, `hover`, `focus`, `error`, `disabled` |
| `filled` | `false` | `false`, `true` |

### Boolean / slot properties

| Property | Default | Rule |
| --- | --- | --- |
| `label (917:31)` | `true` | Скрывайте только если accessible name задан другим способом и сценарий это обосновывает. |
| `hintText (917:62)` | `true` | Используйте для neutral guidance, формата или ограничения. |
| `errorInfo (917:97)` | `true` | Включайте при `state=error`; ошибка должна быть текстовой. |

### Variant rules

- `filled=true` означает, что value не пустой; это не validation state.
- `state=error` не должен использоваться без error text.
- `state=disabled` блокирует ввод; для неизменяемого значения нужен отдельный read-only contract, если он появится в Figma.
- Если нужен `warning`, `success`, `loading` или `read-only` как visual state, пометьте требование как `Needs system review`.

---

## 4. Sizes

| Size | Контекст | Правило |
| --- | --- | --- |
| `s` | Плотные формы, таблицы, служебные панели. | Используйте только когда label и error text не теряют читабельность. |
| `m` | Базовые формы desktop. | Рекомендуемый default для большинства продуктовых форм. |
| `l` | Простые формы, настройки, onboarding. | Хорош для форм с небольшим количеством полей. |
| `xl` | Touch-first сценарии. | Touch target должен оставаться не меньше 44px по высоте или через hit area. |

Размер должен совпадать с соседними controls внутри Form. Смешивание размеров в одной группе допустимо только при явной иерархии.

---

## 5. States

| State | Когда возникает | Требование |
| --- | --- | --- |
| `default` | Поле доступно и не находится во взаимодействии. | Показывает label, placeholder или value согласно anatomy. |
| `hover` | Pointer над control. | Не заменяет focus и не должен быть единственным признаком affordance. |
| `focus` | Input активен с клавиатуры, мыши или touch. | Focus ring видим, caret доступен, helper/error остается связанным. |
| `filled` | `filled=true`, value не пустой. | Placeholder не конкурирует с введенным значением. |
| `error` | Значение не проходит validation. | Есть error text и путь исправления. |
| `disabled` | Поле недоступно. | Не участвует в tab order; причина ограничения понятна из контекста. |

State ownership:

- Component отвечает за visual state и focus.
- Parent Form отвечает за required, dirty, touched, submit и async validation.
- Product logic отвечает за parser, mask, normalization и server errors.

---

## 6. Behavior

### Input behavior

- `value` не должен меняться неожиданно во время ввода; normalization выполняется on blur, on submit или через явно описанный formatter.
- Mask должна сохранять редактируемость: backspace, selection, paste и IME input не ломаются.
- Clear control очищает value и возвращает фокус в input, если сценарий не требует другого поведения.
- Placeholder показывает пример формата: например `name@example.com`, но не заменяет label.
- Error появляется после согласованного trigger: blur, submit, async response или live validation.

### Validation

| Validation type | Пример | Правило |
| --- | --- | --- |
| Required | Поле обязательно. | Ошибка появляется после interaction или submit, не до первого действия пользователя. |
| Format | Email, URL, phone. | Текст ошибки объясняет ожидаемый формат. |
| Length | Min/max characters. | Счетчик нужен только если ограничение влияет на ввод. |
| Mask | Card, phone, code. | Handoff описывает raw value и display value. |
| Async | Уникальность, доступность имени. | Loading и server error должны иметь owner вне Text Field, если state не поддержан в Figma. |

### Keyboard

- `Tab` переводит фокус на input.
- `Shift+Tab` возвращает фокус на предыдущий control.
- `Enter` submit-ит Form только если parent flow это разрешает.
- `Esc` не очищает значение без явного product rule.
- Clear control доступен как отдельная action, если он визуально показан.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Accessible name | Видимый `label` связан с input через `for/id` или эквивалент framework API. |
| Description | `hintText` и `errorInfo` связаны через `aria-describedby`. |
| Error | При ошибке используется `aria-invalid="true"` и текстовое объяснение. |
| Required | Required state передается программно и текстом, если это важно для сценария. |
| Autocomplete | Используйте корректный `autocomplete` для email, name, password, one-time-code. |
| Input mode | Для чисел, email, phone и URL задавайте подходящий keyboard/input mode. |
| Focus | Focus ring не перекрывается prefix/suffix и не исчезает при error state. |

Accessibility checklist:

- [ ] У поля есть видимый label.
- [ ] Error text связан с input программно.
- [ ] Placeholder не содержит единственную важную инструкцию.
- [ ] Clear/reveal actions имеют accessible name.
- [ ] Mask и formatter не ломают screen reader output.
- [ ] Disabled field не скрывает причину недоступности.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`. Для Text Field используются component tokens из namespace `text-field`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/text-field/surface/default` | Фон control по умолчанию. | `surface/base` |
| `$collections/components/$modes/Mode 1/text-field/surface/hover` | Фон hover. | `surface/subtle` |
| `$collections/components/$modes/Mode 1/text-field/surface/focus` | Фон focus. | `surface/base` |
| `$collections/components/$modes/Mode 1/text-field/surface/disabled` | Фон disabled. | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/text-field/surface/error` | Фон error. | `status/danger/container` |
| `$collections/components/$modes/Mode 1/text-field/border/default` | Граница по умолчанию. | `border/default` |
| `$collections/components/$modes/Mode 1/text-field/border/hover` | Граница hover. | `border/hover` |
| `$collections/components/$modes/Mode 1/text-field/border/focus` | Граница focus. | `border/focus` |
| `$collections/components/$modes/Mode 1/text-field/border/error` | Граница error. | `status/danger/border` |
| `$collections/components/$modes/Mode 1/text-field/border/disabled` | Граница disabled. | `status/disabled/border` |
| `$collections/components/$modes/Mode 1/text-field/foreground/default` | Текст value. | `text/primary` |
| `$collections/components/$modes/Mode 1/text-field/foreground/placeholder` | Placeholder. | `text/muted` |
| `$collections/components/$modes/Mode 1/text-field/foreground/disabled` | Текст disabled. | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/text-field/label/default` | Label. | `text/secondary` |
| `$collections/components/$modes/Mode 1/text-field/label/disabled` | Label disabled. | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/text-field/helper/default` | Helper text. | `text/tertiary` |
| `$collections/components/$modes/Mode 1/text-field/helper/error` | Error text. | `status/danger/text` |
| `$collections/components/$modes/Mode 1/text-field/helper/warning` | Warning helper. | `status/warning/text` |
| `$collections/components/$modes/Mode 1/text-field/helper/success` | Success helper. | `status/success/text` |
| `$collections/components/$modes/Mode 1/text-field/affix/surface` | Prefix/suffix surface. | `container/subtle/default` |
| `$collections/components/$modes/Mode 1/text-field/affix/foreground` | Prefix/suffix foreground. | `text/tertiary` |
| `$collections/components/$modes/Mode 1/text-field/focus/ring` | Focus ring. | `focus/ring` |

Token gaps:

- В Figma есть только `default`, `hover`, `focus`, `error`, `disabled`. Если нужен visual `warning`, `success`, `loading` или `read-only`, используйте существующие helper tokens только для текста и пометьте visual state как `Needs system review`.
- Не добавляйте локальные spacing, radius или shadow values в spec без обновления token architecture.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Value | `value` / `defaultValue` | Controlled и uncontrolled modes не смешиваются. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| State | `state` или derived state | Derived from focus, error, disabled и value. |
| Filled | `filled` или derived from value | В коде чаще вычисляется из `value`. |
| Label | `label` | Обязателен, кроме редких icon-only/search scenarios с `ariaLabel`. |
| Placeholder | `placeholder` | Только пример формата. |
| Helper | `hintText` / `description` | Neutral guidance. |
| Error | `error` / `errorText` | Error state плюс текст. |
| Disabled | `disabled` | Блокирует ввод и исключает из tab flow. |
| Prefix/suffix | `prefix`, `suffix`, `startAdornment`, `endAdornment` | Не должны менять value contract. |
| Clear | `clearable`, `onClear` | Доступная action с фокусом после очистки. |
| Input type | `type`, `inputMode`, `autoComplete` | Соответствует данным и platform keyboard. |

Contract rules:

- `errorText` без `error=true` не должен показываться как error state.
- `disabled` не используется для read-only display; для read-only нужен отдельный contract.
- Masked input должен передавать raw value и display value явно.
- Async validation не должна добавлять новые visual states без system review.

---

## 10. Handoff notes

Handoff для Text Field должен включать:

- Figma component и node id: `914:9795`;
- `size`, `state`, `filled` и включенные slots;
- label, placeholder, hint, error text и правила их показа;
- input type, inputMode, autocomplete, mask и normalization;
- validation triggers: blur, submit, live, async response;
- raw value vs display value, если используется mask или formatter;
- focus order, clear action, disabled behavior;
- token mapping и token gaps;
- mobile keyboard behavior.

### Acceptance criteria

- Поле имеет видимый label и программную связь label/input.
- Placeholder не является единственным описанием назначения поля.
- `error` всегда сопровождается error text и `aria-invalid`.
- Helper/error text связан через `aria-describedby`.
- `size`, `state` и `filled` соответствуют documented Figma variants.
- Все visual colors берутся из `text-field` component tokens.
- Clear/prefix/suffix не ломают keyboard navigation.
- AI-generated handoff не добавляет variants, token names или props без spec.

---

## 11. AI usage rules

- AI может предложить label, placeholder, helper и error text, но должен проверить их на ясность и отсутствие дублирования.
- AI должен сверять `tokens.json` перед изменением Design Tokens.
- AI не должен добавлять `warning`, `success`, `loading` или `readOnly` как visual state без `Needs system review`.
- AI должен отличать Text Field от Text Area, Select и Search.
- AI может подготовить validation matrix, но product owner или designer подтверждает business rules.
- AI должен помечать unclear parser, mask, async validation или accessibility gap как `Needs system review`.

---

## 12. Примеры

### Корректно

| Сценарий | Почему |
| --- | --- |
| Email field с label, placeholder-примером и error text после blur. | Есть понятный ввод, формат и recovery path. |
| Password field с reveal action и explicit security rule. | Action доступен и не ломает value contract. |
| Phone field с mask, raw value и display value в handoff. | Разработка понимает хранение и отображение. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Нужен loading state для async validation. | В Figma state отсутствует; нужен system review. |
| Поле используется как search с results panel. | Это уже Search pattern, а не только Text Field. |
| Label скрыт ради компактности. | Может потеряться accessible name. |

---

## 13. Anti-patterns

- Использовать placeholder вместо label.
- Показывать error state без error text.
- Нормализовать value во время ввода так, что пользователь теряет caret position.
- Добавлять local colors для border, helper или focus.
- Использовать disabled для read-only значения.
- Прятать ограничения формата только в Tooltip.
- Генерировать handoff без validation triggers и value contract.
