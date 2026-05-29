# Checkbox

> **Category** · Inputs
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [checkbox](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=1090-16624)

---

## 1. Key Principles

### Что это

Checkbox — control для независимого бинарного выбора или множественного выбора в группе. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует checked/unchecked/indeterminate states, token mapping, accessibility, handoff и правила безопасного использования AI-assisted product development.

AI может ускорять черновики form structure, validation rules и handoff notes, но не заменяет дизайнера и разработчика. Финальное решение по смыслу выбора, обязательности, ошибкам и состояниям остаётся за человеком.

### Когда использовать

- Пользователь включает или выключает независимый параметр.
- Нужно выбрать несколько пунктов из списка.
- Нужно подтвердить согласие, опцию или дополнительное условие перед submit.
- Parent checkbox управляет группой и может иметь `indeterminate` state.

### Когда не использовать

- Для взаимоисключающего выбора одного варианта — используйте Radio.
- Для мгновенного переключения системного режима без submit — используйте Toggle.
- Для длинного списка вариантов с поиском — используйте Select или специализированный list pattern.
- Для действия, которое запускается сразу после клика и не является выбором значения.

### Принципы

- **Choice is explicit** — label должен описывать, что именно включается или выбирается.
- **Checked is data** — checked state является значением формы, а не только визуальным состоянием.
- **Indeterminate is derived** — `indeterminate` вычисляется из дочерних checkbox, а не сохраняется как самостоятельный user value.
- **Tokens before visuals** — control surface, border, icon, label, helper и focus ring берутся из component tokens.
- **AI assists, system governs** — AI может предложить группы и validation, но не придумывает states, props или token names.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер control, label и вспомогательного текста. |
| `control` | да | Интерактивная область checkbox. |
| `icon` | условно | Check или indeterminate mark. |
| `label` | да | Видимое описание выбора. |
| `helperText` | опционально | Подсказка, ограничение или дополнительный контекст. |
| `errorText` | условно | Текст ошибки при validation. |
| `group` | условно | Набор checkbox для multiple selection. |

### Правила anatomy

- Label не заменяется Tooltip или placeholder.
- Helper и error text должны быть связаны с control программно.
- В группе каждый checkbox имеет собственный label; group имеет общий legend или heading.
- Icon не должен быть единственным способом понять checked state.

---

## 3. Types / Variants

Figma component set: `checkbox`. Node id: `1090:16624`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| `size` | `s` | `s`, `m`, `l`, `xl` | Размер control и плотность текста. |
| `state` | `default` | `default`, `hover` | Interaction state из Figma. |
| `turnOn` | `false` | `false`, `true` | Visual mapping для checked state. |

### Variant rules

- `turnOn=true` соответствует checked state.
- `indeterminate` описывается в code/behavior contract; если Figma variant не покрывает его полностью, фиксируйте как `Needs system review`.
- Error и disabled states должны поддерживаться через props и tokens, даже если не вынесены в Figma variant property.

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `s` | Плотные формы и таблицы. | Проверьте touch target в mobile. |
| `m` | Основной размер для форм. | Используйте как default. |
| `l` | Touch-oriented layout или крупные настройки. | Label должен переноситься без сдвига control. |
| `xl` | Редкие сценарии с повышенной читаемостью. | Требует проверки плотности формы. |

Размер не меняет смысл checked state и validation contract.

---

## 5. States

| State | Значение | Правило |
| --- | --- | --- |
| `unchecked` | Значение не выбрано. | Должно быть явно отличимо от disabled. |
| `checked` | Значение выбрано. | Передаётся как form value. |
| `indeterminate` | Выбрана часть дочерних пунктов. | Derived state parent checkbox. |
| `hover` | Pointer наведён на control или label. | Не должен выглядеть как checked. |
| `focus` | Keyboard focus. | Focus ring видим на control. |
| `disabled` | Выбор недоступен. | Причина должна быть понятна из контекста. |
| `error` | Значение не прошло validation. | Ошибка объясняется текстом. |

---

## 6. Behavior

- Click по label переключает checkbox так же, как click по control.
- `Space` переключает focused checkbox.
- В группе checkbox каждый пункт меняется независимо.
- Parent checkbox с `indeterminate` переключает всю группу по правилам parent flow.
- Required checkbox при submit показывает error, если значение не выбрано.
- Async save не должен менять checked state без явного optimistic или confirmed strategy.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Native semantics | Используйте native checkbox или эквивалент с `role="checkbox"`. |
| Checked state | `checked`, `aria-checked="true/false/mixed"` отражают состояние. |
| Label | Control имеет видимый label или программное имя. |
| Group | Группа имеет legend/heading и связанный контекст. |
| Error | Error text связан с control через description/error contract. |
| Keyboard | `Space` переключает значение; Tab перемещает фокус. |

### Accessibility checklist

- [ ] У каждого checkbox есть label.
- [ ] Checked/unchecked/indeterminate state программно доступен.
- [ ] Label кликабелен.
- [ ] Error state передаётся текстом.
- [ ] Disabled state не используется без объяснения.
- [ ] Group context доступен screen reader.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/checkbox/surface/default` | Root surface | `surface/base` |
| `$collections/components/$modes/Mode 1/checkbox/surface/checked` | Checked surface | `container/brand/default` |
| `$collections/components/$modes/Mode 1/checkbox/icon/default` | Checked icon | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/checkbox/label/default` | Label default | `text/primary` |
| `$collections/components/$modes/Mode 1/checkbox/label/disabled` | Label disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/checkbox/helper/default` | Helper text | `text/tertiary` |
| `$collections/components/$modes/Mode 1/checkbox/helper/error` | Error helper | `status/danger/text` |
| `$collections/components/$modes/Mode 1/checkbox/focus/ring` | Focus indicator | `focus/ring` |
| `$collections/components/$modes/Mode 1/checkbox/disabled/surface` | Disabled surface | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/checkbox/disabled/border` | Disabled border | `status/disabled/border` |
| `$collections/components/$modes/Mode 1/checkbox/control/surface/default` | Control surface default | `surface/base` |
| `$collections/components/$modes/Mode 1/checkbox/control/surface/hover` | Control surface hover | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/checkbox/control/surface/active` | Control surface active | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/checkbox/control/surface/checked` | Control surface checked | `container/brand/default` |
| `$collections/components/$modes/Mode 1/checkbox/control/surface/indeterminate` | Control surface indeterminate | `container/brand/default` |
| `$collections/components/$modes/Mode 1/checkbox/control/surface/error` | Control surface error | `status/danger/container` |
| `$collections/components/$modes/Mode 1/checkbox/control/surface/disabled` | Control surface disabled | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/checkbox/control/border/default` | Control border default | `border/default` |
| `$collections/components/$modes/Mode 1/checkbox/control/border/hover` | Control border hover | `border/hover` |
| `$collections/components/$modes/Mode 1/checkbox/control/border/checked` | Control border checked | `border/brand/default` |
| `$collections/components/$modes/Mode 1/checkbox/control/border/error` | Control border error | `status/danger/border` |
| `$collections/components/$modes/Mode 1/checkbox/control/border/disabled` | Control border disabled | `status/disabled/border` |
| `$collections/components/$modes/Mode 1/checkbox/control/icon/checked` | Check icon | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/checkbox/control/icon/indeterminate` | Indeterminate icon | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/checkbox/control/icon/disabled` | Disabled icon | `status/disabled/icon` |

### Token gaps

- Если нужен отдельный token для required/error label marker, фиксируйте `Token gap`.
- Не используйте raw colors для checked, error или disabled states.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Size | `size` | Только `s`, `m`, `l`, `xl`. |
| Checked | `checked` | Controlled boolean value. |
| Default checked | `defaultChecked` | Только для uncontrolled mode. |
| Indeterminate | `indeterminate` | Derived visual/ARIA state. |
| Change | `onCheckedChange` | Возвращает новое значение. |
| Label | `label` / children | Обязателен или заменяется `ariaLabel` только в исключении. |
| Error | `error`, `errorText` | Ошибка сопровождается текстом. |
| Disabled | `disabled` | Не скрывает причину ограничения. |

### Contract rules

- Не смешивайте controlled и uncontrolled state.
- `indeterminate` не должен отправляться как обычное checked value.
- Unsupported visual state помечается как `Needs system review`.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `1090:16624` | Позволяет сверить design/code mapping. |
| `size`, checked/unchecked/indeterminate states | Определяет вид и значение. |
| Label, helper, error text | Нужны для формы и accessibility. |
| Required/validation rules | Определяют submit behavior. |
| Group behavior и parent checkbox logic | Нужны для multiple selection. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |

### Acceptance criteria

- Checkbox имеет label и доступен с клавиатуры.
- Checked state совпадает с form value.
- Indeterminate state вычисляется из дочерних пунктов.
- Error state передаётся текстом и tokens.
- AI-generated output не добавляет новые states, props или token names без review.

---

## 11. AI usage rules

- AI может предложить структуру checkbox group, labels, validation и handoff notes.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI не должен использовать Checkbox вместо Radio, Toggle или Select.
- AI не должен придумывать token names, visual values или Figma variants.
- AI обязан помечать missing label, unclear group behavior, missing validation и accessibility gap как `Needs system review`.
- AI может подготовить acceptance criteria, но человек утверждает смысл выбора и validation.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| Список независимых фильтров с несколькими выбранными пунктами. | Checkbox поддерживает multiple selection. |
| Согласие с условиями перед submit. | Значение валидируется как часть формы. |
| Parent checkbox в состоянии `indeterminate`. | Отражает частичный выбор дочерних пунктов. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Один вариант из нескольких через Checkbox. | Нужен Radio. |
| Instant on/off setting через Checkbox без submit. | Возможно нужен Toggle. |
| Checkbox без label. | Нарушает accessibility и handoff. |

---

## 13. Anti-patterns

- Использовать Checkbox для взаимоисключающего выбора.
- Скрывать смысл выбора в Tooltip.
- Сохранять `indeterminate` как пользовательское значение.
- Показывать error только цветом control.
- Добавлять custom checked colors без system review.
