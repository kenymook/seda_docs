# Progress Bar

> **Category** · Feedback
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Progress Bar — feedback-компонент для отображения известного, измеримого прогресса операции или сценария. Он показывает, какая часть процесса уже выполнена, сколько осталось и в каком статусе находится операция.

### Когда использовать

**Используйте** — когда прогресс можно выразить значением, процентом или шагами:

- загрузка или импорт файла;
- синхронизация данных с известным числом элементов;
- прохождение урока, теста или мастера;
- заполненность профиля или настройки;
- выполнение batch-операции;
- лимит, quota или completion state, если нужен именно progress feedback.

**Не используйте:**

- Когда прогресс неизвестен — используйте **Spinner**.
- Когда известна только будущая структура загружаемого контента — используйте **Skeleton**.
- Когда загрузка завершилась без данных — используйте **Empty State**.
- Для метрик и аналитики без процесса выполнения — используйте Chart, Stat / Metric или Data Display pattern.
- Для пошаговой навигации по сценарию — используйте **Stepper**, если пользователь должен видеть порядок шагов.

### Основные принципы

- **Known progress only** — Progress Bar должен иметь `value`, `min` и `max` или эквивалентную дробь.
- **Text confirms meaning** — визуальная полоса дополняется label или value text, если пользователь должен понять статус.
- **Status is explicit** — success, warning, danger и disabled не передаются только цветом.
- **Stable feedback** — Progress Bar не должен прыгать назад без объяснения.
- **Motion is restrained** — любые transition следуют [foundation/motion.md](../foundation/motion.md) и не скрывают реальный прогресс.
- **Accessible semantics first** — Progress Bar следует [foundation/accessibility.md](../foundation/accessibility.md).

---

## 2. Anatomy

```text
Label                                      75%
┌────────────────────────────────────────────┐
│████████████████████████░░░░░░░░░░░░░░░░░░│
└────────────────────────────────────────────┘
 track                 fill
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Progress container and semantic wrapper |
| `label` | optional | Human-readable operation name |
| `value` | recommended | Percentage, fraction, or status value |
| `track` | yes | Background track |
| `fill` | yes | Filled portion representing progress |
| `statusText` | conditional | Success, warning, danger, or disabled explanation |

### Правила anatomy

- `track` and `fill` are required for visual progress.
- `label` is required when context does not already name the operation.
- `value` is recommended for determinate progress.
- Не передавайте success, warning или danger только цветом.

---

## 3. Types / Variants

| Variant | Description | Use |
| --- | --- | --- |
| `linear` | Horizontal progress bar | Default product UI |
| `segmented` | Progress divided into known segments | Steps, milestones, quota chunks |
| `compact` | Small inline progress without large label area | Dense lists, table rows, cards |

### Tone

| Tone | Meaning | Token mapping |
| --- | --- | --- |
| `default` | Normal in-progress state | `progress-bar/fill/default` |
| `success` | Complete or successful result | `progress-bar/fill/success` |
| `warning` | Progress needs attention but is not failed | `progress-bar/fill/warning` |
| `danger` | Failed, blocked, over-limit, or destructive risk | `progress-bar/fill/danger` |
| `disabled` | Progress is not currently active or unavailable | disabled track/fill/label/value tokens |

### Display options

| Option | Description | Rule |
| --- | --- | --- |
| `withLabel` | Shows operation label | Use when context is not enough |
| `withValue` | Shows percentage or fraction | Recommended for determinate progress |
| `showStatusText` | Shows success/warning/danger message | Required when status cannot be inferred |

---

## 4. Sizes

Progress Bar size describes track thickness and surrounding density. It does not change the meaning of the value.

| Size | Track height | Label style | Use |
| --- | --- | --- | --- |
| `small` | 4px | Optional small text | Table row, card metadata, compact list |
| `medium` | 6px | Default body/label text | Default product UI |
| `large` | 8px | Visible label and value | Prominent upload, onboarding, profile completion |

### Правила размеров

- `medium` is the default.
- Use `small` only when surrounding context already names the operation.
- Use `large` when progress is the primary feedback in the region.
- Circular progress is not part of this spec until a separate component or variant is defined and tokenized.

---

## 5. States

| State | Значение | Поведение |
| --- | --- | --- |
| `in-progress` | Value is between min and max | Fill reflects current value |
| `success` | Operation completed successfully | Fill uses success tone and status may be announced |
| `warning` | Operation requires attention | Fill uses warning tone and explanatory text |
| `danger` | Operation failed, blocked, or exceeded limit | Fill uses danger tone and explanatory text |
| `disabled` | Progress is unavailable or inactive | Disabled tokens; no active updates |

### Value rules

- Clamp visual fill between `min` and `max`.
- Default range is `0` to `100`.
- Do not animate backwards unless the underlying progress actually decreased and the reason is clear.
- If progress becomes unknown, switch to Spinner or another indeterminate loading pattern.

---

## 6. Behavior

### Progress updates

- Update `aria-valuenow` with each meaningful value change.
- Use `aria-valuetext` when the value is not a simple percent, for example `3 из 5 файлов`.
- Avoid excessive announcements for rapid updates; announce milestone changes or final state instead.
- Keep the track width stable while fill changes.

### Completion

- At 100%, show success state long enough for the user to understand completion.
- Do not remove the Progress Bar instantly if it is the only completion feedback.
- If completion moves the user to another state, preserve enough context through status text, Toast, or resulting content.

### Error and warning behavior

- Warning and danger states require text that explains what changed.
- Danger state should not imply progress is still moving unless recovery is active.
- Retry behavior belongs to a nearby Button, not the Progress Bar itself.

### Responsive behavior

- Label and value may stack above the track in narrow containers.
- The track should remain readable at small widths.
- Do not truncate the value if it is essential to understanding progress.

---

## 7. Accessibility

Progress Bar follows [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Semantics | Use native `<progress>` or `role="progressbar"` |
| Min/max | Provide `aria-valuemin` and `aria-valuemax` when using ARIA role |
| Current value | Provide `aria-valuenow` for determinate progress |
| Value text | Provide `aria-valuetext` for fractions or domain-specific values |
| Label | Use visible label, `aria-labelledby`, or `aria-label` |
| Status changes | Use nearby status text or polite live region when needed |
| Color | Do not communicate status by color alone |

### Accessibility checklist

- [ ] Progress has an accessible name.
- [ ] Current value is programmatically available.
- [ ] `aria-valuetext` is provided when percentage is not enough.
- [ ] Success, warning, and danger have text, not only color.
- [ ] Updates are not announced too frequently.
- [ ] Disabled state is understandable from context or text.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Role | Component token | Semantic |
| --- | --- | --- |
| Track default | `progress-bar/track/default` | `container/neutral/default` |
| Track disabled | `progress-bar/track/disabled` | `status/disabled/container` |
| Fill default | `progress-bar/fill/default` | `container/brand/default` |
| Fill success | `progress-bar/fill/success` | `container/success/default` |
| Fill warning | `progress-bar/fill/warning` | `container/warning/default` |
| Fill danger | `progress-bar/fill/danger` | `container/danger/default` |
| Fill disabled | `progress-bar/fill/disabled` | `status/disabled/icon` |
| Label foreground | `progress-bar/label/foreground` | `text/secondary` |
| Label disabled | `progress-bar/label/disabled` | `status/disabled/text` |
| Value foreground | `progress-bar/value/foreground` | `text/primary` |
| Value disabled | `progress-bar/value/disabled` | `status/disabled/text` |

### Token gaps

- Progress Bar does not currently have component tokens for track height, radius, spacing, or transition duration.
- Use foundation spacing, radius, and motion roles until component-level tokens are introduced.
- Do not invent Progress Bar token names in specs, code, Figma, or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Value | `value` | Current numeric value |
| Min | `min` | Default `0` |
| Max | `max` | Default `100` |
| Variant | `variant` | `linear`, `segmented`, `compact` |
| Size | `size` | `small`, `medium`, `large` |
| Tone | `tone` | `default`, `success`, `warning`, `danger`, `disabled` |
| Label | `label` | Visible operation name |
| Value label | `valueLabel` | Visible percent/fraction text |
| Aria value text | `ariaValueText` | Required for non-percent values |
| Disabled | `disabled` | Boolean |

### Contract rules

- `value`, `min`, and `max` must define determinate progress.
- `value` must be clamped for visual rendering.
- `tone` must use documented values only.
- Use Spinner for indeterminate progress.
- Do not expose arbitrary fill color props.

---

## 10. Handoff notes

В handoff нужно передать:

- operation being measured;
- `value`, `min`, `max`, and display format;
- variant, size, and tone;
- label and value label text;
- completion behavior at 100%;
- warning/danger/status text, if applicable;
- update frequency or milestones, if relevant;
- accessibility label and `aria-valuetext`;
- token mapping for track, fill, label, and value;
- token gaps for size, radius, spacing, or motion.

### Acceptance criteria

- Progress Bar is used only for determinate progress.
- Current value is visible or programmatically available.
- Status is not communicated by color alone.
- Completion, warning, and danger states are explained in text when needed.
- Track and fill use documented component tokens.
- Indeterminate loading uses Spinner or Skeleton instead.
- No raw visual values are introduced for color.

---

## 11. AI usage rules

- AI may use Progress Bar only when progress is measurable.
- AI must recommend Spinner when progress is unknown.
- AI must recommend Skeleton when the future content structure is known but progress is not.
- AI must not invent tones, token paths, arbitrary colors, or circular progress behavior.
- AI must check `tokens.json` before changing Progress Bar token mappings.
- AI must flag missing value range, missing accessible name, status-by-color-only, unsupported tone, or indeterminate progress as `Needs system review`.
- AI may draft labels, status text, handoff notes, and acceptance criteria, but human review is required.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| File upload | `value=72`, label `Загрузка файла`, value label `72%` |
| Import rows | `value=3`, `max=5`, value label `3 из 5 файлов` |
| Profile completion | `tone=default`, label `Профиль заполнен`, value label `80%` |
| Completed operation | `value=100`, `tone=success`, status text `Импорт завершён` |
| Over limit | `tone=danger`, status text explains the limit issue |

### Требует review

| Scenario | Reason |
| --- | --- |
| Progress Bar with no known value | Should be Spinner |
| Red fill without text explanation | Status is communicated only by color |
| Circular progress in this spec | Not defined or tokenized here |
| Progress jumps backward without reason | Breaks user trust |

---

## 13. Anti-patterns

- Using Progress Bar for unknown loading.
- Showing a decorative progress-like bar for metrics without process meaning.
- Hiding the numeric value when the user needs precision.
- Removing the bar immediately at 100% without completion feedback.
- Using success, warning, or danger color without text.
- Creating custom fill colors outside component tokens.
- Treating Progress Bar as a Button or retry control.
