# Stat / Metric

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Stat / Metric — data display-компонент для выделения одного числового показателя с подписью, единицей измерения, контекстом и опциональным трендом. Он помогает быстро считать KPI, но не заменяет таблицу, график или детальный отчёт.

### Когда использовать

**Используйте** — когда нужно показать одну ключевую метрику:

- KPI в дашборде;
- итоговое число в карточке объекта;
- текущий статус измеримого показателя;
- сравнение с предыдущим периодом;
- показатель эффективности процесса;
- краткая метрика рядом с таблицей или графиком.

**Не используйте:**

- Для обычного числа внутри текста — используйте типографику.
- Для измеримого выполнения операции — используйте **Progress Bar**.
- Для нескольких точек во времени или тренда как ряда — используйте Chart.
- Для плотного сравнения многих значений — используйте **Table**.
- Для более 6 метрик в одной строке без группировки.
- Для статуса без числового значения — используйте Badge, Tag или Alert по контексту.

### Основные принципы

- **Value needs meaning** — число должно иметь label, unit или описание, чтобы пользователь понимал, что измеряется.
- **Trend is contextual** — `+12%` без периода сравнения недостаточен; используйте `+12% к прошлому месяцу`.
- **Direction is not always good/bad** — рост расходов может быть negative, а снижение ошибок может быть positive.
- **Compact by design** — Stat / Metric выделяет показатель, но не объясняет весь отчёт.
- **Formatting is part of UX** — числа, проценты, валюты и даты форматируются последовательно по [foundation/content.md](../foundation/content.md).
- **State is not color-only** — значение тренда должно быть доступно через текст, знак, icon label или description по [foundation/state-vocabulary.md](../foundation/state-vocabulary.md).

---

## 2. Anatomy

```text
Label
$1,240,000      USD
↑ +12% vs last month
Monthly recurring revenue
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `root` | yes | Metric container |
| `label` | yes | Short name of the metric |
| `value` | yes | Main numeric value |
| `unit` | conditional | Currency, percent, seconds, items, users, etc. |
| `trend` | optional | Change compared with a baseline |
| `trendIcon` | optional | Direction/status icon that supports trend meaning |
| `description` | optional | Context, period, source, or caveat |

### Правила anatomy

- `label` and `value` are required.
- `unit` is required when the value cannot be understood without it.
- `trend` must include comparison context when shown.
- `description` should clarify period, data source, caveat, or target when needed.

---

## 3. Types / Variants

### Display variants

| Variant | Description | Use |
| --- | --- | --- |
| `default` | Label, value, optional unit/description | General metric |
| `with-trend` | Adds trend value and direction | KPI compared to previous period |
| `compact` | Smaller, denser metric | Cards, table side panels, dense dashboards |
| `featured` | Larger value and more spacing | Primary KPI in a dashboard section |

### Trend tones

| Trend tone | Meaning | Required context |
| --- | --- | --- |
| `neutral` | No significant change or context-neutral value | Baseline or period |
| `positive` | Good or desired movement | What improved and compared with what |
| `warning` | Needs attention but not critical | Why the movement matters |
| `negative` | Bad or undesired movement | What worsened and compared with what |

### Trend direction

| Direction | Meaning | Rule |
| --- | --- | --- |
| `up` | Value increased | Can be positive or negative depending on metric |
| `down` | Value decreased | Can be positive or negative depending on metric |
| `flat` | No meaningful change | Use neutral tone unless context says otherwise |

---

## 4. Sizes

Stat / Metric size controls visual emphasis and density. It does not change the data contract.

| Size | Value emphasis | Content density | Use |
| --- | --- | --- | --- |
| `compact` | Smaller value | Label + value, optional short trend | Dense dashboard grid, table-adjacent summary |
| `medium` | Default value | Label, value, unit, trend, description | Default product UI |
| `large` | Strong value emphasis | Full metric with trend and description | Primary KPI or section summary |

### Правила размеров

- Use `medium` by default.
- Use `compact` when many metrics appear together.
- Use `large` for one to three primary metrics per section.
- Не используйте size для передачи positive/negative status; используйте документированный trend tone и text.

---

## 5. States

Stat / Metric is usually static. Semantic state applies to trend or metric status, not hover/focus interaction.

| State | Meaning | Required signal |
| --- | --- | --- |
| `neutral` | No positive/negative interpretation | Text or neutral trend |
| `positive` | Desired movement or healthy metric | Trend text, sign, icon, or description |
| `warning` | Needs attention | Warning text or caveat |
| `negative` | Undesired movement or unhealthy metric | Explanation, sign, icon, or description |
| `unavailable` | Value is missing or cannot be calculated | Placeholder and reason |

### State rules

- Do not map `up` directly to `positive` without metric context.
- Do not map `down` directly to `negative` without metric context.
- Missing data should not show `0` unless the real value is zero.
- If value is loading, use Skeleton or a loading pattern outside the metric value.

---

## 6. Behavior

### Data formatting

- Use locale-aware formatting for numbers, currency, percentages, and compact notation.
- Keep units consistent across a group of metrics.
- Use enough precision for decision-making, but avoid false precision.
- For large values, use compact notation only when exact precision is not required.

### Trend behavior

- Trend must state comparison baseline: previous period, target, forecast, cohort, or benchmark.
- Trend tone must be based on product meaning, not just mathematical direction.
- If direction is unknown, omit direction icon and explain the caveat.

### Group behavior

- Related metrics should share label style, value formatting, unit placement, and period wording.
- More than 6 metrics should be grouped, paginated, or moved into a table/dashboard layout.
- Avoid mixing incompatible time ranges in one metric group unless explicitly labelled.

### Responsive behavior

- Value and unit stay visually connected.
- Trend and description may wrap below the value.
- Compact metrics may hide description only if the surrounding context still explains the value.

---

## 7. Accessibility

Stat / Metric follows [foundation/accessibility.md](../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Text value | Value, unit, and trend must be available as text |
| Trend icon | Decorative if trend text already communicates meaning |
| Status meaning | Positive/negative/warning meaning is not color-only |
| Numeric formatting | Use readable grouping and units |
| Updates | Use polite live region only when metric updates are important in real time |
| Missing value | Announce unavailable state clearly |

### Accessibility checklist

- [ ] Metric has a visible label.
- [ ] Value and unit are readable as text.
- [ ] Trend direction has text, not only icon/color.
- [ ] Positive/negative meaning matches product context.
- [ ] Missing data is not represented as zero.
- [ ] Real-time updates do not create noisy announcements.

---

## 8. Design Tokens

Пути ниже сверены с `tokens.json`.

| Role | Component token | Semantic |
| --- | --- | --- |
| Label foreground | `stat-metric/label/foreground` | `text/tertiary` |
| Value foreground | `stat-metric/value/foreground` | `text/primary` |
| Unit foreground | `stat-metric/unit/foreground` | `text/secondary` |
| Trend neutral | `stat-metric/trend/neutral` | `text/tertiary` |
| Trend positive | `stat-metric/trend/positive` | `status/success/text` |
| Trend warning | `stat-metric/trend/warning` | `status/warning/text` |
| Trend negative | `stat-metric/trend/negative` | `status/danger/text` |
| Trend icon positive | `stat-metric/trend/icon/positive` | `status/success/icon` |
| Trend icon warning | `stat-metric/trend/icon/warning` | `status/warning/icon` |
| Trend icon negative | `stat-metric/trend/icon/negative` | `status/danger/icon` |
| Description foreground | `stat-metric/description/foreground` | `text/tertiary` |

### Token gaps

- Stat / Metric does not currently have component tokens for layout gap, value typography, unit typography, radius, padding, or background.
- Use foundation spacing, typography, radius, and surface patterns until component-level tokens are introduced.
- Do not invent Stat / Metric token names in specs, code, Figma, or AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Label | `label` | Required |
| Value | `value` | Required raw value or formatted string |
| Formatted value | `formattedValue` | Optional override when formatter is external |
| Unit | `unit` | Currency, percent, seconds, count, etc. |
| Description | `description` | Optional context |
| Variant | `variant` | `default`, `with-trend`, `compact`, `featured` |
| Size | `size` | `compact`, `medium`, `large` |
| Trend value | `trend.value` | Difference, percent, or text |
| Trend direction | `trend.direction` | `up`, `down`, `flat` |
| Trend tone | `trend.tone` | `neutral`, `positive`, `warning`, `negative` |
| Trend label | `trend.label` | Comparison context |
| Unavailable | `unavailableReason` | Reason when value is missing |

### Contract rules

- `label` and `value` are required unless `unavailableReason` is provided.
- `trend.tone` must be documented and product-specific.
- Do not expose arbitrary color props.
- Do not infer positive/negative from direction without metric semantics.
- Не используйте Stat / Metric для progress operations.

---

## 10. Handoff notes

В handoff нужно передать:

- metric name and business definition;
- raw value and formatted display value;
- unit and locale formatting rules;
- period, benchmark, or comparison baseline;
- trend direction and trend tone logic;
- unavailable/loading behavior;
- grouping rules when displayed with other metrics;
- accessibility text for value, unit, and trend;
- token mapping for label, value, unit, trend, and description;
- token gaps for typography, spacing, and layout.

### Acceptance criteria

- Metric has label and value.
- Unit is visible when needed to understand the value.
- Trend includes comparison context.
- Positive/negative/warning meaning is not communicated by color alone.
- Missing data is not shown as zero.
- Formatting is consistent across related metrics.
- Component uses documented tokens for text and trend colors.
- Stat / Metric is not used as Progress Bar or Chart.

---

## 11. AI usage rules

- AI may use Stat / Metric only for a single numeric indicator with label and context.
- AI must recommend Progress Bar for measurable operation progress.
- AI must recommend Chart when trend over multiple points is required.
- AI must recommend Table when many metrics need comparison, sorting, or filtering.
- AI must not infer positive/negative meaning from up/down direction without metric context.
- AI must not invent token paths, trend tones, units, or arbitrary colors.
- AI must check `tokens.json` before changing Stat / Metric token mappings.
- AI must flag missing unit, missing comparison baseline, missing label, color-only trend, or ambiguous positive/negative meaning as `Needs system review`.
- AI may draft metric labels, formatting notes, handoff notes, and acceptance criteria, but human review is required.

---

## 12. Examples

### Корректно

| Scenario | Usage |
| --- | --- |
| Revenue KPI | Label `Выручка`, value `$1.2M`, trend `+12% к прошлому месяцу`, positive |
| Error rate decrease | Label `Ошибки`, value `1.8%`, trend `-0.6 п.п. к прошлой неделе`, positive |
| Cost increase | Label `Расходы`, value `$42K`, trend `+8% к плану`, warning or negative by context |
| Missing metric | Show unavailable state with reason, not `0` |

### Требует review

| Scenario | Reason |
| --- | --- |
| `+12%` without comparison period | Baseline is missing |
| Green upward trend for cost without context | Direction may be negative |
| 20 metrics in one row | Needs grouping or table |
| Metric used for upload progress | Progress Bar is required |

---

## 13. Anti-patterns

- Showing a number without label or unit.
- Using color as the only trend meaning.
- Treating every upward trend as positive.
- Showing missing data as zero.
- Using Stat / Metric for time-series analysis.
- Creating custom trend colors outside component tokens.
- Mixing different periods in one metric group without labels.
