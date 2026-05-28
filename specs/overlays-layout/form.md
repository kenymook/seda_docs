# Form

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Form](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6724-387)

---

## 1. Key Principles

### Что это

Form — структура сбора, проверки и отправки пользовательских данных. Это не просто контейнер для inputs: Form задает layout, grouping, validation model, submit/cancel flow, error summary, helper text и handoff между design, code и QA.

В SEDA AI Form описан как часть AI-ready design system framework. Spec фиксирует, какие поля входят в сценарий, кто владеет состояниями, как показываются ошибки, какие design tokens используются и какие правила должен соблюдать AI при генерации черновиков формы.

AI может ускорить черновик структуры формы, validation matrix, helper/error copy, acceptance criteria и handoff notes. Финальное решение по бизнес-правилам, обязательности полей, legal copy, accessibility и data contract остается за человеком.

### Когда использовать

- Нужно собрать несколько связанных значений.
- Есть submit/cancel flow или explicit apply.
- Поля имеют validation, helper text, error states и зависимости.
- Нужно сгруппировать поля по смыслу.
- Нужен единый handoff для design, frontend, backend и QA.

### Когда не использовать

- Для одного независимого значения используйте конкретный input.
- Для instant setting без submit используйте Toggle, Checkbox или другой control с явным behavior.
- Не прячьте ошибки формы только в Toast.
- Не смешивайте submit flow и instant apply без описанного правила.
- Не используйте Form как декоративный layout container.

### Ключевые принципы

- **Intent before fields** — сначала цель формы и data model, потом набор controls.
- **Validation is layered** — field-level, group-level, form-level и server errors имеют разных owners.
- **Errors are actionable** — ошибка объясняет, что исправить и где.
- **Submission is explicit** — submit, cancel, reset и unsaved changes описаны в handoff.
- **AI assists, system governs** — AI помогает собрать черновик, но не утверждает бизнес-правила и required fields.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `form` | да | Корневой semantic container или framework form wrapper. |
| `form-title` | условно | Название формы, если форма самостоятельная или сложная. |
| `description` | опционально | Контекст, ограничения, legal или пояснение сценария. |
| `group` | условно | Смысловая группа полей. |
| `group-title` | условно | Название группы. |
| `field` | да | Конкретный input/control со своим label и validation. |
| `helper` | опционально | Подсказка для поля, группы или всей формы. |
| `error-summary` | условно | Список ошибок формы после submit или server validation. |
| `actions` | да | Submit, cancel, reset или secondary actions. |
| `divider` | опционально | Разделение групп, если оно помогает сканированию. |

Правила anatomy:

- Каждое поле следует собственной component spec.
- Error summary не заменяет field-level errors.
- Group title нужен только там, где группа помогает понять структуру.
- Actions располагаются предсказуемо и не смешиваются с полями.
- Required/optional indication должно быть единым для всей формы.

---

## 3. Types / Variants

Figma component set: `Form`. Variants: 12.

| Property | Default | Options |
| --- | --- | --- |
| `layout` | `inline` | `vertical`, `inline` |
| `state` | `default` | `default`, `error` |
| `size` | `s` | `s`, `m`, `l`, `xl` |

### Layout rules

| Layout | Когда использовать | Правило |
| --- | --- | --- |
| `vertical` | Большинство форм, длинные labels, mobile, сложная validation. | Поля идут сверху вниз, error text остается рядом с полем. |
| `inline` | Короткие настройки, фильтры, компактные панели. | Используйте только если labels и errors остаются читаемыми. |

### State rules

- `state=default` означает, что форма не показывает form-level error.
- `state=error` означает наличие ошибки на уровне формы или error summary.
- Field-level `error` живет в конкретном input и не обязан переводить всю Form в `state=error`, если нет summary.
- Loading/submitting/success не описаны как Figma variants; фиксируйте их как parent flow или `Needs system review`.

---

## 4. Sizes

| Size | Контекст | Правило |
| --- | --- | --- |
| `s` | Плотные панели, фильтры, таблицы настроек. | Допустим только при коротких labels и простых errors. |
| `m` | Базовые продуктовые формы. | Рекомендуемый default. |
| `l` | Формы с большим количеством пояснений. | Используйте для onboarding и settings pages. |
| `xl` | Touch-first и mobile-first сценарии. | Touch target всех controls должен быть достаточным. |

Размер Form задает плотность группы, но не должен переопределять size отдельных controls без handoff. Если в одной форме смешиваются sizes, причина фиксируется в spec или design notes.

---

## 5. States

| State / phase | Owner | Правило |
| --- | --- | --- |
| `default` | Form | Нет form-level error; поля могут быть empty или filled. |
| `dirty` | Parent/app logic | Есть изменения относительно initial values. |
| `touched` | Field/form library | Поле было в фокусе или изменено. |
| `field-error` | Field | Ошибка рядом с конкретным control. |
| `form-error` | Form | Ошибка submit, server response или error summary. |
| `submitting` | Parent/app logic | Блокировка actions или progress описываются отдельно. |
| `success` | Parent/app logic | Не является variant Form; показывается через flow или feedback component. |
| `disabled` | Parent/app logic | Вся форма или группа недоступна; причина понятна из контекста. |

State ownership должен быть явным: компонент Form отвечает за layout и form-level feedback, отдельные inputs отвечают за свои visual states, product logic отвечает за data и server rules.

---

## 6. Behavior

### Validation flow

| Слой | Пример | Где показывать |
| --- | --- | --- |
| Field-level | Неверный email, обязательное поле. | Рядом с полем через `errorText`. |
| Group-level | Должен быть выбран хотя бы один контакт. | Под группой или рядом с group title. |
| Form-level | Submit невозможен из-за нескольких ошибок. | Error summary в начале или рядом с actions. |
| Server-side | Email уже занят, нет прав, конфликт данных. | Field-level, form-level или оба, по смыслу ошибки. |

Validation triggers:

- `onBlur` — мягкая проверка формата после выхода из поля.
- `onChange` — только для ограничений, которые помогают прямо во время ввода.
- `onSubmit` — обязательная финальная проверка всех полей.
- `server response` — ошибки backend не должны теряться при повторном submit.

### Submit / cancel / reset

- Submit action disabled только если это не скрывает причину недоступности.
- Cancel должен иметь понятное поведение: закрыть, вернуться, сбросить или показать confirmation.
- Reset опасен для введенных данных; если есть unsaved changes, нужен explicit rule.
- После server error фокус переводится к error summary или первому ошибочному полю.
- После success пользователь получает явный результат: transition, inline success или feedback component.

### Responsive behavior

- `inline` layout на узких экранах обычно переходит в `vertical`.
- Error text не должен перекрывать соседние поля.
- Actions остаются доступными после длинной формы: sticky actions допустимы только с отдельным handoff.
- Long labels переносятся, а не сжимаются до нечитабельного состояния.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Semantic form | Используйте semantic `form` или framework equivalent, если есть submit. |
| Labels | Каждое поле имеет видимый label и программную связь с control. |
| Fieldset/group | Связанные поля группируются с group title/legend, если это влияет на понимание. |
| Error summary | Summary связан с ошибочными полями и доступен после submit. |
| Focus management | После submit error фокус переводится к summary или первому error field. |
| Required | Required/optional indication единообразна и доступна screen reader. |
| Keyboard | Все поля и actions доступны с клавиатуры в логичном порядке. |
| Status updates | Async submit/result объявляется программно, если это влияет на пользователя. |

Accessibility checklist:

- [ ] Все поля имеют labels.
- [ ] Error text связан с соответствующим field.
- [ ] Error summary не заменяет field-level errors.
- [ ] Submit/cancel доступны с клавиатуры.
- [ ] Required/optional rule одинаковый по всей форме.
- [ ] Focus после ошибки или success управляется предсказуемо.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`. Для Form используются component tokens из namespace `form`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/form/label/foreground` | Label поля. | `text/secondary` |
| `$collections/components/$modes/Mode 1/form/group-title/foreground` | Group title. | `text/primary` |
| `$collections/components/$modes/Mode 1/form/groupTitle/foreground` | Group title alias. | `text/primary` |
| `$collections/components/$modes/Mode 1/form/description/foreground` | Описание формы или группы. | `text/tertiary` |
| `$collections/components/$modes/Mode 1/form/helper/default` | Helper text. | `text/tertiary` |
| `$collections/components/$modes/Mode 1/form/helper/error` | Error helper. | `status/danger/text` |
| `$collections/components/$modes/Mode 1/form/helper/warning` | Warning helper. | `status/warning/text` |
| `$collections/components/$modes/Mode 1/form/helper/success` | Success helper. | `status/success/text` |
| `$collections/components/$modes/Mode 1/form/divider` | Divider между группами. | `border/subtle` |
| `$collections/components/$modes/Mode 1/form/errorSummary/border` | Border error summary. | `status/danger/border` |
| `$collections/components/$modes/Mode 1/form/errorSummary/foreground` | Text error summary. | `status/danger/text` |
| `$collections/components/$modes/Mode 1/form/errorSummary/surface` | Surface error summary. | `status/danger/container` |

Token gaps:

- Layout spacing для groups, fields и actions должен быть сверян с foundation spacing или добавлен как token architecture task.
- Loading/submitting/success containers не имеют отдельных Form variants; используйте feedback components или помечайте `Needs system review`.
- Не добавляйте local spacing или colors для error summary без обновления tokens.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Layout | `layout` | `vertical` или `inline`. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| State | `state` | `default` или `error` на уровне формы. |
| Values | `values` | Объект data model формы. |
| Initial values | `initialValues` | Источник dirty/reset behavior. |
| Submit | `onSubmit` | Вызывает validation и отправку. |
| Cancel | `onCancel` | Поведение явно описано. |
| Reset | `onReset` | Не используется без unsaved changes rule. |
| Validation | `validate`, `schema`, `errors` | Field/group/form/server errors разделены. |
| Disabled | `disabled` | Блокирует всю форму или группу по явному правилу. |
| Submitting | `isSubmitting` | Parent/app state; не является Form variant. |

Contract rules:

- Field names должны совпадать между design annotations, code и analytics.
- Ошибки должны иметь target: field, group или form.
- Submit не должен терять пользовательские данные при server error.
- Если backend возвращает error codes, handoff должен описывать mapping в user-facing text.

---

## 10. Handoff notes

Handoff для Form должен включать:

- Figma component и node id: `6724:387`;
- `layout`, `state`, `size`;
- список fields: name, component, required, default value, validation, helper/error text;
- field/group/form/server validation matrix;
- submit, cancel, reset, dirty и unsaved changes behavior;
- loading/submitting/success/error flow;
- focus management после submit и server errors;
- responsive behavior для `inline` и `vertical`;
- analytics events, если форма важна для продукта;
- token mapping и token gaps.

### Acceptance criteria

- Form использует только documented `layout`, `state`, `size`.
- Каждое поле имеет label, data name и validation owner.
- Field-level errors показываются рядом с полями.
- Form-level errors показываются через error summary, если ошибка относится ко всей форме.
- Submit/cancel/reset behavior описан и не теряет данные.
- Focus после ошибки управляется предсказуемо.
- Tokens берутся из `form` namespace и specs вложенных controls.
- AI-generated output не добавляет fields, rules или tokens без system review.

---

## 11. AI usage rules

- AI может предложить структуру полей, grouping и validation matrix, но должен помечать неизвестные business rules как `Needs system review`.
- AI должен сверять `tokens.json` перед изменением Design Tokens.
- AI не должен добавлять required fields, legal copy, analytics events или backend rules без подтверждения человека.
- AI должен различать field-level, group-level, form-level и server errors.
- AI может подготовить helper/error copy, но человек проверяет тон, юридический смысл и product accuracy.
- AI должен проверять, не является ли сценарий instant setting вместо submit form.

---

## 12. Примеры

### Корректно

| Сценарий | Почему |
| --- | --- |
| Profile form с `vertical` layout, required fields и error summary после submit. | Есть цель, validation flow и recovery path. |
| Inline filter form с короткими Select/Text Field controls и Apply action. | Compact layout оправдан задачей и имеет submit behavior. |
| Server error "email already exists" маппится на email field. | Ошибка показывается там, где пользователь может ее исправить. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Submit disabled до заполнения всех полей. | Пользователь может не понять причину блокировки. |
| Ошибки показываются только в Toast. | Пользователь теряет связь ошибки с field. |
| AI добавил обязательное поле без data model. | Нарушается продуктовый contract. |

---

## 13. Anti-patterns

- Использовать Form как обычный layout container.
- Смешивать instant apply и submit без явного правила.
- Показывать form-level error вместо field-level error, когда ошибка относится к конкретному полю.
- Скрывать required/optional rule.
- Очищать форму после server error.
- Делать reset без confirmation при dirty state.
- Добавлять поля или validation rules только потому, что AI предложил "полную форму".
