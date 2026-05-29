# Radio

> **Category** · Inputs
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [radio](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=1082-14510)

---

## 1. Key Principles

### Что это

Radio — control для выбора ровно одного значения из взаимоисключающей группы. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует group behavior, selected state, token mapping, accessibility, handoff и правила использования AI-assisted product development.

AI может помогать с формулировкой options, validation rules и handoff notes, но не заменяет дизайнера и разработчика. Финальное решение по набору вариантов, default value и ошибкам остаётся за человеком.

### Когда использовать

- Пользователь должен выбрать один вариант из 2-7 видимых опций.
- Все варианты важно показать одновременно.
- Выбор является частью формы или настройки с явным значением.
- Нужен default или required selection в группе.

### Когда не использовать

- Для независимых параметров — используйте Checkbox.
- Для мгновенного on/off режима — используйте Toggle.
- Для длинного списка или поиска — используйте Select.
- Для единственного бинарного control без группы.

### Принципы

- **One selected option** — в группе выбран максимум один вариант.
- **Group owns value** — значение принадлежит Radio Group, а не отдельному item.
- **Options are comparable** — labels должны быть однородными и взаимоисключающими.
- **Tokens before visuals** — control surface, border, dot, label, helper и focus ring используют component tokens.
- **AI assists, system governs** — AI может предложить options, но не придумывает states, tokens или group semantics.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `group` | да | Общий контейнер выбора и владелец значения. |
| `legend` | рекомендуется | Название вопроса или группы. |
| `item` | да | Один вариант выбора. |
| `control` | да | Radio control. |
| `dot` | для selected | Визуальный маркер выбранного варианта. |
| `label` | да | Текст варианта. |
| `helperText` | опционально | Пояснение к группе или варианту. |
| `errorText` | условно | Текст ошибки группы. |

### Правила anatomy

- Radio без группы не используется.
- Каждый item имеет label; group имеет общий вопрос или legend.
- Helper/error на уровне группы не заменяет label каждого item.
- Варианты должны быть одного уровня детализации.

---

## 3. Types / Variants

Figma component set: `radio`. Node id: `1082:14510`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| `size` | `s` | `s`, `m`, `l`, `xl` | Размер control и плотность текста. |
| `state` | `default` | `default`, `hover` | Interaction state из Figma. |
| `turnOn` | `false` | `false`, `true` | Visual mapping для selected state. |

### Variant rules

- `turnOn=true` соответствует selected state.
- Error и disabled states описываются props/tokens и должны быть отражены в code.
- Если нужен card-radio или rich option layout, пометьте сценарий как `Needs system review`.

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `s` | Плотные формы. | Проверьте читаемость labels. |
| `m` | Основной размер radio group. | Используйте как default. |
| `l` | Touch-oriented options или важный выбор. | Проверьте vertical spacing. |
| `xl` | Редкие сценарии с повышенной читаемостью. | Не используйте для длинных списков. |

Размер не меняет group semantics и selected value.

---

## 5. States

| State | Значение | Правило |
| --- | --- | --- |
| `unselected` | Вариант не выбран. | Все варианты кроме selected. |
| `selected` | Текущий value группы. | В группе должен быть только один selected item. |
| `hover` | Pointer наведён на item. | Не должен выглядеть как selected. |
| `focus` | Keyboard focus на item. | Focus ring видим. |
| `disabled` | Вариант недоступен. | Причина должна быть понятна из контекста. |
| `error` | Группа не прошла validation. | Ошибка относится к group, а не только одному item, если выбор required. |

---

## 6. Behavior

- Click по label выбирает соответствующий item.
- `ArrowUp`/`ArrowDown` или `ArrowLeft`/`ArrowRight` перемещают выбор внутри группы по platform convention.
- `Tab` входит в group и выходит из неё, не проходит все items как обычный список buttons.
- Если группа required, submit без value показывает error.
- Default value должен быть осознанным: не выбирайте вариант заранее, если это может исказить решение пользователя.
- Disabled item не может стать selected через keyboard или pointer.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Native semantics | Используйте native radio group или `role="radiogroup"` с `role="radio"`. |
| Group name | Группа имеет legend/label. |
| Checked state | Selected item имеет `checked` или `aria-checked="true"`. |
| Keyboard | Arrow keys управляют выбором внутри группы. |
| Error | Error text связан с group. |
| Disabled | Disabled item не активируется. |

### Accessibility checklist

- [ ] Radio используется только в группе.
- [ ] Группа имеет понятный question/legend.
- [ ] У каждого item есть label.
- [ ] Selected state программно доступен.
- [ ] Keyboard behavior соответствует radio group.
- [ ] Error state передаётся текстом.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/radio/surface/default` | Root surface | `surface/base` |
| `$collections/components/$modes/Mode 1/radio/surface/selected` | Selected surface | `container/brand/default` |
| `$collections/components/$modes/Mode 1/radio/dot/default` | Dot color | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/radio/label/default` | Label default | `text/primary` |
| `$collections/components/$modes/Mode 1/radio/label/disabled` | Label disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/radio/helper/default` | Helper text | `text/tertiary` |
| `$collections/components/$modes/Mode 1/radio/helper/error` | Error helper | `status/danger/text` |
| `$collections/components/$modes/Mode 1/radio/focus/ring` | Focus indicator | `focus/ring` |
| `$collections/components/$modes/Mode 1/radio/disabled/surface` | Disabled surface | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/radio/control/surface/default` | Control surface default | `surface/base` |
| `$collections/components/$modes/Mode 1/radio/control/surface/hover` | Control surface hover | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/radio/control/surface/active` | Control surface active | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/radio/control/surface/selected` | Control surface selected | `container/brand/default` |
| `$collections/components/$modes/Mode 1/radio/control/surface/error` | Control surface error | `status/danger/container` |
| `$collections/components/$modes/Mode 1/radio/control/surface/disabled` | Control surface disabled | `status/disabled/container` |
| `$collections/components/$modes/Mode 1/radio/control/border/default` | Control border default | `border/default` |
| `$collections/components/$modes/Mode 1/radio/control/border/hover` | Control border hover | `border/hover` |
| `$collections/components/$modes/Mode 1/radio/control/border/selected` | Control border selected | `border/brand/default` |
| `$collections/components/$modes/Mode 1/radio/control/border/error` | Control border error | `status/danger/border` |
| `$collections/components/$modes/Mode 1/radio/control/border/disabled` | Control border disabled | `status/disabled/border` |
| `$collections/components/$modes/Mode 1/radio/control/dot/selected` | Dot selected | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/radio/control/dot/disabled` | Dot disabled | `status/disabled/icon` |
| `$collections/components/$modes/Mode 1/radio/control/dot/default` | Dot default | `surface/base` |

### Token gaps

- Если нужен token для card-radio layout, фиксируйте `Token gap`.
- Не используйте raw colors для selected, error или disabled states.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Group value | `value` | Controlled selected value. |
| Default value | `defaultValue` | Только для uncontrolled mode. |
| Options | `options` / children | Каждый item имеет `value`, `label`, optional `disabled`. |
| Change | `onValueChange` | Возвращает selected value. |
| Size | `size` | Только `s`, `m`, `l`, `xl`. |
| Error | `error`, `errorText` | Ошибка на уровне группы. |
| Disabled | `disabled` group или item | Group disabled отключает все items. |

### Contract rules

- Не используйте один Radio как самостоятельный binary control.
- Не смешивайте controlled и uncontrolled state.
- Unsupported rich option layout помечается как `Needs system review`.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `1082:14510` | Позволяет сверить design/code mapping. |
| Group label, options, selected/default value | Определяет смысл выбора. |
| Required/validation rules | Нужны для submit behavior. |
| Disabled options и причины | Влияют на доступность и бизнес-логику. |
| Keyboard behavior | Нужен для QA. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |

### Acceptance criteria

- Radio находится внутри группы с понятным label.
- В группе выбран максимум один item.
- Error state относится к group и передаётся текстом.
- Keyboard navigation работает стрелками.
- AI-generated output не добавляет новые states, props или token names без review.

---

## 11. AI usage rules

- AI может предложить labels options, default value risk и validation notes.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI не должен использовать Radio вместо Checkbox, Toggle или Select.
- AI не должен придумывать token names, visual values или Figma variants.
- AI обязан помечать missing group label, unclear default, too many options и accessibility gap как `Needs system review`.
- AI может подготовить acceptance criteria, но человек утверждает options и default behavior.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| Выбор одного способа доставки из трёх. | Варианты взаимоисключающие и видимы. |
| Выбор периода отчёта: день, неделя, месяц. | Один selected value управляет режимом. |
| Required radio group с error при пустом submit. | Validation понятна и доступна. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| 20 вариантов Radio подряд. | Нужен Select или search pattern. |
| Единственный Radio "включить уведомления". | Нужен Checkbox или Toggle. |
| Default value выбран без осознанного решения пользователя. | Можно исказить результат формы. |

---

## 13. Anti-patterns

- Использовать Radio для multiple selection.
- Делать Radio без group label.
- Прятать error только в цвете.
- Смешивать options разных уровней детализации.
- Добавлять custom selected colors без system review.
