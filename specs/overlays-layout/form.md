# Form

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Form — составной компонент для сбора, проверки и отправки пользовательских данных. Он задает структуру field groups, layout, validation behavior, submit flow, error summary и handoff contract между дизайном, разработкой и продуктовой логикой.

Form не является отдельным input control. Он собирает поля и действия в управляемый сценарий: какие данные нужны, как они валидируются, когда показываются ошибки, что происходит при submit и как пользователь восстанавливается после ошибки.

### Когда использовать

**Используйте** — когда интерфейс собирает данные через несколько связанных controls:

- создание или редактирование объекта;
- настройки профиля, продукта или workspace;
- фильтры с несколькими параметрами;
- onboarding или multi-step flow;
- форма внутри Modal, Drawer или page section;
- submit flow с validation, loading и success/error result.

**Не используйте:**

- Для одиночного поля без submit behavior — используйте [Text Field](../inputs/text-field.md), [Select](../inputs/select.md) или другой input напрямую.
- Для простого переключателя настройки — используйте [Toggle](../inputs/toggle.md) или [Checkbox](../inputs/checkbox.md).
- Для подтверждения действия без ввода данных — используйте [Modal](../feedback/modal.md) или Button flow.
- Для layout без сбора данных — используйте [Container](../overlays-layout/container.md) или [Grid](../overlays-layout/grid.md).
- Для одноразовой подсказки об ошибке вне формы — используйте [Alert](../feedback/alert.md).

### Основные принципы

- **Data before layout** — структура формы начинается с данных, validation rules и submit contract, а не с расположения полей.
- **Labels are required** — каждое поле должно иметь понятный label и связь с control.
- **Validation is staged** — ошибки показываются после blur, submit или другого документированного interaction point.
- **Error summary supports recovery** — summary нужен, когда ошибок несколько или форма длинная.
- **Submit state is explicit** — submitting, success, failure и retry behavior должны быть описаны.
- **AI must preserve field contracts** — AI может предложить структуру формы, но не должен придумывать поля, правила валидации или API contract без review.

### Связанные спецификации

- [Text Field](../specs/inputs/text-field.md)
- [Text Area](../specs/inputs/text-area.md)
- [Select](../specs/inputs/select.md)
- [Checkbox](../specs/inputs/checkbox.md)
- [Radio](../specs/inputs/radio.md)
- [Button](../specs/actions/button.md)
- [Alert](../specs/feedback/alert.md)
- [Modal](../specs/feedback/modal.md)

---

## 2. Anatomy

```text
Form title
Description

[Error summary, if submit validation failed]

Group title
Label *
[Input control]
Helper / error text

Label
[Input control]
Helper text

[Cancel] [Submit]
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Native form or form-like container with submit behavior |
| `title` | conditional | Form title when the surrounding surface does not provide one |
| `description` | optional | Explains purpose, scope or consequences |
| `errorSummary` | conditional | Summary of multiple validation errors or form-level error |
| `fieldGroup` | yes | Logical group of related fields |
| `groupTitle` | conditional | Label for a field group |
| `field` | yes | Input component with label, helper/error text and validation state |
| `requiredMarker` | conditional | Visual marker for required field convention |
| `helperText` | optional | Field-level guidance or format hint |
| `actions` | yes | Submit and secondary actions |
| `submitButton` | yes | Primary action that starts validation and submit |
| `secondaryAction` | optional | Cancel, back, reset, save draft or close |

### Правила anatomy

- Form must contain at least one field and one submit path.
- Field groups should represent data meaning, not only visual columns.
- Required marker must have a documented convention.
- Error summary appears before the first field group or at the top of the visible form region.
- Submit action must be visually and semantically primary within the form.

---

## 3. Types / Variants

### Layout variants

| Variant | Description | Use |
| --- | --- | --- |
| `vertical` | Labels above controls | Default for most forms |
| `horizontal` | Labels beside controls | Dense settings pages with short labels |
| `inline` | Controls and action in one row | Search/filter bars and compact one-step forms |
| `sectioned` | Form split into groups with titles | Complex settings or profile forms |
| `wizard` | Multi-step form | Long flows with clear step progression |

### Usage variants

| Variant | Description | Rule |
| --- | --- | --- |
| `page` | Form on a page or content section | Can include long content and section navigation |
| `modal` | Form inside Modal | Keep scope short; avoid long multi-section forms |
| `drawer` | Form inside Drawer | Useful for side-editing without leaving context |
| `filter` | Form that updates list/table query | Submit/apply/reset behavior must be explicit |

---

## 4. Sizes

Form size controls density, spacing between fields, action placement and max width. Individual input heights remain owned by each input component.

| Size | Density | Typical width | Use |
| --- | --- | --- | --- |
| `compact` | Tight field spacing | Narrow panel | Filters, drawers, dense settings |
| `medium` | Default spacing | Readable form column | Most product forms |
| `large` | Roomier sections | Wide page or wizard | Complex forms with explanations |

### Правила размеров

- Use `medium` by default.
- Use `compact` only when labels, helper text and errors still remain readable.
- Use `large` for forms with long helper text, grouped sections or onboarding.
- Form width should follow Container rules; do not stretch short fields across very wide pages.
- Button size follows [Button](../actions/button.md), not Form size directly.

---

## 5. States

### Aggregate states

| State | Значение | Обязательное поведение |
| --- | --- | --- |
| `default` | Initial form | Fields are editable and no validation result is shown |
| `dirty` | User changed at least one field | Enable save/submit logic according to product rules |
| `validating` | Validation is running | Keep fields readable; show progress only if delay is noticeable |
| `invalid` | Form has validation errors | Show field errors and error summary when needed |
| `submitting` | Submit request is running | Submit Button shows loading and duplicate submit is blocked |
| `submitted` | Submit succeeded | Show success, redirect or close according to flow |
| `submit-error` | Submit failed after request | Show form-level error and recovery path |
| `disabled` | Whole form is unavailable | Controls and actions follow disabled/read-only rules |

### Field states

Field interaction states are owned by the corresponding input specs. Form coordinates field state timing:

- `error` appears after blur, submit or a documented validation trigger.
- `warning` can appear while the field remains submittable.
- `success` is optional and should not create visual noise.
- `disabled` and `read-only` fields must still communicate why editing is unavailable when it is not obvious.

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
| --- | --- | --- |
| `dirty` + `invalid` | yes | User changed data and validation found errors |
| `validating` + `submitting` | yes | Submit may trigger server validation |
| `submit-error` + field errors | yes | Show both only when errors are distinct |
| `submitted` + `dirty` | no | New edits after success move form back to dirty/default flow |
| `disabled` + `submitting` | no | Submitting is an active async state, not static disabled |

---

## 6. Behavior

### Validation behavior

- Empty required field is not shown as error before user interaction or submit.
- `filled` does not mean `valid`.
- Validation messages must explain how to fix the issue.
- Client and server validation errors use the same field/error summary structure.
- Cross-field validation must name all affected fields in handoff.
- Form-level errors must not replace field-level errors when the failing field is known.

### Submit flow

1. User activates Submit.
2. Form validates visible and required hidden-dependent fields.
3. If errors exist, show field errors and error summary; focus moves to summary or first invalid field according to product rule.
4. If valid, submit request starts and duplicate submit is blocked.
5. On success, show success state, redirect, close surface or update data.
6. On failure, show form-level error, preserve user-entered values and provide retry.

### Reset, cancel and draft

- Cancel returns to the previous surface or closes the parent overlay; destructive data loss needs confirmation when dirty.
- Reset clears user edits only when product explicitly supports reset.
- Save draft must define which fields are persisted and whether validation is partial.
- Auto-save forms must define status messaging and conflict handling.

### Responsive behavior

- Vertical layout is preferred on narrow screens.
- Horizontal forms collapse to vertical before labels or controls become cramped.
- Inline forms wrap as a group; submit action remains reachable.
- Error summary remains near the top of the active form region.
- Long forms may use sticky actions only if they do not cover fields or errors.

### Keyboard interaction

| Клавиша | Действие |
| --- | --- |
| `Tab` / `Shift+Tab` | Move through fields and actions in logical order |
| `Enter` | Submit when focus is in single-line input and no component-specific override exists |
| `Space` | Activate checkbox, radio, button-like controls |
| `Escape` | Close parent overlay only when the parent component owns Escape behavior |
| `Ctrl/Cmd+Enter` | Optional submit shortcut for text-heavy forms, if documented |

---

## 7. Accessibility

Form follows [foundation/accessibility.md](../../foundation/accessibility.md), [foundation/content.md](../../foundation/content.md) and validation rules.

| Требование | Правило |
| --- | --- |
| Native semantics | Use `<form>` when the surface submits data |
| Label association | Every control has a programmatic label |
| Required fields | Use visible convention and accessible required state |
| Error state | Invalid fields expose error state programmatically |
| Descriptions | Helper/error text is connected to the control |
| Error summary | Summary is announced and links or moves users to invalid fields |
| Submit loading | Loading state prevents duplicate submit and remains announced |
| Focus management | Failed submit moves focus to recovery path |
| Keyboard order | Order follows visual and data logic |
| Color reliance | Required, error and warning states are not communicated by color only |

### Accessibility checklist

- [ ] Each field has label and accessible description/error association.
- [ ] Required convention is visible and explained.
- [ ] Error messages are specific and actionable.
- [ ] Error summary is present for long forms or multiple errors.
- [ ] Submit Button has correct `type="submit"`.
- [ ] Secondary buttons do not accidentally submit the form.
- [ ] Loading submit blocks duplicate requests.
- [ ] User input is preserved after submit error.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`. Prefer canonical paths in new documentation, code and Figma handoff.

| Role | Component token | Semantic |
| --- | --- | --- |
| Label foreground default | component path: form label foreground default | `text/secondary` |
| Required marker foreground | component path: form label foreground required | `status/danger/text` |
| Disabled label foreground | component path: form label foreground disabled | `status/disabled/text` |
| Group title foreground | component path: form groupTitle foreground | `text/primary` |
| Description foreground | component path: form description foreground | `text/tertiary` |
| Helper default | component path: form helper default | `text/tertiary` |
| Helper error | component path: form helper error | `status/danger/text` |
| Helper warning | component path: form helper warning | `status/warning/text` |
| Helper success | component path: form helper success | `status/success/text` |
| Divider | component path: form divider | `border/subtle` |
| Error summary border | component path: form errorSummary border | `status/danger/border` |
| Error summary foreground | component path: form errorSummary foreground | `status/danger/text` |
| Error summary surface | component path: form errorSummary surface | `status/danger/container` |

### Legacy aliases

- The old group-title path exists as a compatibility alias; use the canonical groupTitle mapping for new work.
- The old label foreground base value should map to the default label foreground state.
- The old required-marker path should map to the required label foreground state.
- The old error-summary paths should map to canonical errorSummary paths.

### Token gaps

- Form does not currently have component tokens for field gap, group gap, section padding, max width, action gap, sticky action surface or validation motion.
- Use foundation spacing, Container, Grid, Button and child input tokens until Form-specific layout tokens are introduced.
- Do not invent `--form-*` or new Form token paths in specs, code, Figma or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Layout variant | `layout` | `vertical`, `horizontal`, `inline`, `sectioned`, `wizard` |
| Size | `size` | `compact`, `medium`, `large` |
| Fields | `fields` | Field schema or composed children |
| Field groups | `groups` | Logical grouping and group title |
| Values | `values` | Current form data |
| Initial values | `initialValues` | Used for dirty state |
| Validation schema | `validationSchema` | Required, format, range, cross-field rules |
| Errors | `errors` | Field-level and form-level errors |
| Touched state | `touched` | Controls validation timing |
| Dirty state | `dirty` | Enables/disables submit or save |
| Submitting | `submitting` | Async submit state |
| Submit action | `onSubmit` | Valid form submit handler |
| Cancel action | `onCancel` | Optional secondary action |
| Reset action | `onReset` | Optional destructive/explicit reset |
| Error summary | `showErrorSummary` | Required for long forms or multiple errors |

### Contract rules

- Field schema requires stable field id, label, control type, value binding and validation rules.
- Required fields must be represented in both UI and validation schema.
- Submit Button uses `type="submit"`; secondary actions use `type="button"` unless documented otherwise.
- Form-level error and field-level errors must be separate data paths.
- Custom fields, hidden dependencies and cross-field validation require handoff notes.

---

## 10. Handoff notes

В handoff нужно передать:

- form purpose and data model;
- layout variant, size and responsive behavior;
- field list: id, label, control type, required/optional, default value and placeholder;
- validation rules per field and cross-field dependencies;
- validation trigger: blur, change, submit, server response;
- error message copy and error summary behavior;
- submit, cancel, reset, save draft and auto-save behavior;
- loading, disabled, read-only, submit-error and success states;
- focus management after failed submit and after success;
- API contract or target action for submit;
- token mapping for labels, helper text, error summary, group titles and dividers;
- token gaps for layout spacing and action placement.

### Acceptance criteria

- Every field has label, value binding and validation contract.
- Required fields are visible and accessible.
- Validation timing is documented.
- Error summary appears for multiple errors or long forms.
- Submit blocks duplicate requests while preserving user input.
- Form can recover from server error.
- Responsive behavior is defined for horizontal and inline layouts.
- Component uses documented Form tokens and child component tokens.
- AI-generated drafts do not introduce fields, tokens or validation rules without review.

---

## 11. AI usage rules

- AI may propose form structure only from documented product requirements, data model or existing fields.
- AI must not invent required fields, validation rules, API payloads, token names or submit behavior.
- AI must check `tokens.json` before changing Form token mappings.
- AI must recommend child input components instead of drawing custom input rectangles.
- AI must flag missing labels, missing validation timing, missing error states, missing submit behavior, unclear data model, or inaccessible error summary as `Needs system review`.
- AI may draft field schemas, Handoff notes, validation copy and acceptance criteria, but human review is required.
- AI must preserve the distinction between design draft, approved component contract and implementation behavior.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| Profile edit | `layout=sectioned`, fields grouped by personal data and preferences |
| Login form | `layout=vertical`, short fields, submit and recovery link |
| Table filter panel | `layout=inline` or `compact`, explicit Apply/Reset behavior |
| Modal create flow | `layout=vertical`, small number of fields, clear submit/cancel |
| Long settings page | `layout=sectioned`, error summary and group titles |

### Требует review

| Scenario | Reason |
| --- | --- |
| Form has fields but no submit behavior | Data flow is undefined |
| Required markers exist without validation schema | UI and behavior can diverge |
| Error summary lists errors that are not linked to fields | Accessibility and recovery gap |
| Horizontal layout on narrow mobile screen | Responsive behavior missing |
| AI adds "Company size" field without product requirement | Invented data requirement |

---

## 13. Anti-patterns

- Using Form as a generic visual wrapper.
- Creating handmade input rectangles instead of child input components.
- Showing all validation errors before the user interacts.
- Clearing user input after submit error.
- Disabling Submit without explaining why when the issue is not visible.
- Using placeholder text as the only label.
- Mixing form-level errors and field-level errors into one generic message.
- Adding raw spacing, color or error styles outside documented tokens.
