# Segmented Control

> **Category** · Inputs
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Segmented Control - Single selection](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=805-10516)

---

## 1. Key Principles

### Что это

Segmented Control — компактный control для выбора одного режима, фильтра или представления из небольшого набора равноправных вариантов. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует selected value, segment states, token mapping, accessibility, handoff и правила использования AI-assisted product development.

AI может помогать с labels, option grouping, handoff notes и acceptance criteria, но не заменяет дизайнера и разработчика. Финальное решение по количеству сегментов, режимам и keyboard behavior остаётся за человеком.

### Когда использовать

- Есть 2-5 коротких равноправных вариантов.
- Переключение меняет режим, фильтр или представление в текущем контексте.
- Пользователь должен видеть все варианты одновременно.
- Выбор не является навигацией на другую страницу.

### Когда не использовать

- Для перехода между страницами или крупными разделами — используйте Tabs или Navigation.
- Для длинного списка — используйте Select.
- Для independent multiple selection — используйте Checkbox group.
- Для набора command buttons, где каждый segment запускает отдельное действие.

### Принципы

- **One selected segment** — выбран один segment, если не описан multi-select variant через system review.
- **Mode, not action** — segment меняет состояние интерфейса, а не запускает самостоятельную команду.
- **Short labels only** — labels должны быть короткими и сопоставимыми.
- **Tokens before visuals** — surface, segment states, foreground, icon, border и focus ring используют component tokens.
- **AI assists, system governs** — AI может предложить options, но не придумывает variants, tokens или command behavior.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер segmented control. |
| `segment` | да | Один вариант выбора. |
| `label` | да | Текст segment. |
| `icon` | опционально | Дополнительный маркер режима. |
| `selectedIndicator` | условно | Визуальное выделение выбранного segment. |
| `helperText` | опционально | Пояснение к группе, если нужно. |

### Правила anatomy

- Segment не должен содержать длинный текст, badge и сложный layout без review.
- Icon-only segments требуют accessible name.
- Все segments должны быть одного типа: не смешивайте фильтры, действия и навигацию.
- Helper text относится ко всей группе, а не к одному segment.

---

## 3. Types / Variants

Figma component set: `Segmented Control - Single selection`. Node id: `805:10516`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| Variant properties | documented in Figma | documented in Figma | Используйте только свойства из component set и code contract. |

### Variant rules

- Используйте documented props contract и данные Figma component set.
- Если требуется size, orientation, icon-only или multi-select variant, пометьте сценарий как `Needs system review`.
- Не создавайте локальные visual variants в продукте без обновления component set.

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `s` | Плотные toolbar и table controls. | Проверьте читаемость labels. |
| `m` | Основной размер для фильтров и view switchers. | Используйте как default, если code поддерживает size. |
| `l` | Touch-oriented режимы или крупные панели. | Проверьте ширину каждого segment. |
| `xl` | Редкие случаи с повышенной читаемостью. | Требует system review, если Figma size не зафиксирован. |

Если Figma не содержит нужный size variant, размер считается code/design contract gap и должен быть согласован.

---

## 5. States

| State | Значение | Правило |
| --- | --- | --- |
| `default` | Segment доступен, не выбран. | Должен быть читаемым и отличаться от disabled. |
| `hover` | Pointer наведён на segment. | Не должен выглядеть как selected. |
| `active` | Segment нажимается. | Краткое interaction state. |
| `selected` | Текущий value. | Должен быть один selected segment. |
| `focus` | Keyboard focus. | Focus ring видим. |
| `disabled` | Segment недоступен. | Причина должна быть понятна из контекста. |
| `loading` | Переключение режима загружает данные. | Loading относится к affected content, а не только к segment. |

---

## 6. Behavior

- Click по segment меняет `value`.
- Keyboard behavior должен быть согласован с выбранной семантикой: `radiogroup` для выбора одного значения или tabs pattern, если control управляет panels.
- `ArrowLeft`/`ArrowRight` перемещают focus или selection по documented activation mode.
- Выбор segment не должен уводить пользователя на другую страницу.
- Loading при смене режима должен сохранять выбранное значение или показывать rollback strategy.
- На узких экранах используйте overflow, wrap или Select fallback только после handoff.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Semantics | Для mode selection используйте `radiogroup`; для panel switching рассмотрите Tabs pattern. |
| Group name | Control имеет accessible group label. |
| Selected state | Selected segment программно доступен. |
| Keyboard | Arrow keys и Tab работают по выбранной семантике. |
| Icon-only | Каждый icon-only segment имеет accessible name. |
| Loading/error | Изменение affected content объявляется доступным способом. |

### Accessibility checklist

- [ ] Есть group label.
- [ ] Selected segment программно отмечен.
- [ ] Keyboard behavior описан.
- [ ] Icon-only segments имеют accessible name.
- [ ] Disabled segments имеют понятную причину.
- [ ] Loading/error affected content доступен screen reader.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/segmented-control/surface/default` | Root surface | `container/neutral/default` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/surface/active` | Segment surface active | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/surface/hover` | Segment surface hover | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/surface/default` | Segment surface default | `color/transparent` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/surface/selected` | Segment surface selected | `surface/base` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/surface/disabled` | Segment surface disabled | `color/transparent` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/foreground/active` | Segment text active | `text/primary` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/foreground/inactive` | Segment text inactive | `text/tertiary` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/foreground/default` | Segment text default | `text/secondary` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/foreground/hover` | Segment text hover | `text/primary` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/foreground/selected` | Segment text selected | `text/primary` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/foreground/disabled` | Segment text disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/icon/default` | Segment icon default | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/icon/selected` | Segment icon selected | `icon/primary` |
| `$collections/components/$modes/Mode 1/segmented-control/segment/icon/disabled` | Segment icon disabled | `status/disabled/icon` |
| `$collections/components/$modes/Mode 1/segmented-control/border/default` | Border default | `border/default` |
| `$collections/components/$modes/Mode 1/segmented-control/focus/ring` | Focus indicator | `focus/ring` |
| `$collections/components/$modes/Mode 1/segmented-control/disabled/foreground` | Disabled foreground | `status/disabled/text` |

### Token gaps

- Variant/size mapping должен сверяться с Figma component set и code contract.
- Если нужен token для selected shadow или animation, фиксируйте `Token gap`.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Value | `value` | Controlled selected value. |
| Default value | `defaultValue` | Только для uncontrolled mode. |
| Items | `items` | Массив с `value`, `label`, optional `icon`, `disabled`. |
| Change | `onValueChange` | Возвращает selected value. |
| Size | `size` | Используйте только documented values, если code их поддерживает. |
| Disabled | `disabled` group или item | Не скрывает причину ограничения. |
| Activation | `activationMode` | Нужен, если переключение запускает загрузку данных. |

### Contract rules

- Segmented Control выбирает режим, а не выполняет command.
- Не используйте для navigation между страницами.
- Figma `TBD` должно быть явно отмечено в handoff как metadata gap.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `805:10516` | Позволяет сверить design/code mapping. |
| Items, labels, selected/default value | Определяет режимы. |
| Semantics: radiogroup или tabs-like | Влияет на accessibility и keyboard. |
| Loading behavior при смене режима | Нужен для data-heavy views. |
| Responsive behavior | Предотвращает слом labels. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |

### Acceptance criteria

- В группе выбран один segment.
- Labels короткие и сопоставимые.
- Segment states используют component tokens.
- Keyboard behavior описан и проверен.
- Figma component set и code contract сверены перед handoff.
- AI-generated output не добавляет variants, props или token names без review.

---

## 11. AI usage rules

- AI может предложить segment labels, grouping, activation mode и handoff notes.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI не должен использовать Segmented Control вместо Tabs, Radio, Checkbox или Select.
- AI не должен придумывать Figma variants, sizes или token names без сверки component set.
- AI обязан помечать too many options, unclear semantics, missing selected value и accessibility gap как `Needs system review`.
- AI может подготовить acceptance criteria, но человек утверждает режимы и semantics.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| Переключение `List` / `Grid`. | Меняется представление текущих данных. |
| Фильтр `All` / `Active` / `Archived`. | Небольшой набор равноправных режимов. |
| Выбор периода `Day` / `Week` / `Month` внутри графика. | Контекст остаётся тем же. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| 8 segments с длинными labels. | Нужен Select или другой filter pattern. |
| Segment запускает export/delete action. | Это command, а не mode selection. |
| Segmented Control переключает страницы приложения. | Нужны Tabs или Navigation. |

---

## 13. Anti-patterns

- Использовать Segmented Control как набор buttons.
- Делать labels длинными и несопоставимыми.
- Смешивать фильтры, actions и navigation в одной группе.
- Добавлять multi-select без system review.
- Придумывать Figma variants без сверки component set.
