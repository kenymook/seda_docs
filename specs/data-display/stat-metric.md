# Stat / Metric

> **Category** · Data Display
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Stat Metric](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6671-56)

---

## 1. Key Principles / Принципы использования

### Что это

Stat / Metric — компонент для выделения одного числового показателя с label, value, unit, периодом, источником данных и optional trend. Он помогает быстро считать KPI, но не заменяет Table, Chart, Progress Bar или подробный отчет.

В SEDA AI Stat / Metric является metric contract: он должен явно описывать бизнес-смысл показателя, формат значения, единицу измерения, период, baseline, trend logic, token mapping и accessibility. AI может помогать формулировать метрики и handoff notes, но не должен угадывать положительный или отрицательный смысл тренда без контекста.

### Когда использовать

Используйте Stat / Metric, когда:

- нужно показать один ключевой числовой показатель;
- KPI должен быть виден до просмотра таблицы или графика;
- значение сравнивается с предыдущим периодом, планом, forecast или benchmark;
- карточка, dashboard section или detail view требует краткой метрики;
- нужно показать current value и короткое пояснение;
- рядом с таблицей или графиком нужен summary indicator.

### Не используйте

Не используйте Stat / Metric, когда:

- нужно показать обычное число внутри текста — используйте typography;
- нужно показать выполнение операции — используйте Progress Bar;
- нужно показать тренд по нескольким точкам во времени — используйте Chart;
- нужно сравнить много значений, сортировать или фильтровать — используйте Table;
- нужно показать статус без числа — используйте Tag, Badge или Alert;
- метрика не имеет label, unit, периода или понятного источника данных;
- в одной строке появляется больше 6 метрик без группировки.

### Основные принципы

- **Value needs meaning** — число должно иметь label, unit и контекст.
- **Trend needs baseline** — `+12%` без периода или baseline неполон.
- **Direction is not tone** — рост не всегда positive, снижение не всегда negative.
- **Formatting is UX** — числа, проценты, валюты и даты форматируются последовательно.
- **Missing is not zero** — отсутствие данных нельзя показывать как `0`.
- **Compact by design** — Stat / Metric выделяет показатель, но не объясняет весь отчет.
- **AI assists, system governs** — AI может предложить структуру метрики, но использует только documented props, states и tokens.

### Связанные спецификации

- [Table](table.md) — сравнение нескольких записей или метрик.
- [Tag](tag.md) — статус без числового значения.
- [Badge](badge.md) — count/status signal на host-элементе.
- [Card](card.md) — контейнер для группы метрик.
- [Skeleton](../feedback/skeleton.md) — loading state для данных.

---

## 2. Anatomy / Анатомия

| Slot | Обязательность | Описание |
|---|---:|---|
| `root` | Да | Контейнер метрики. |
| `label` | Да | Короткое название показателя. |
| `value` | Да | Основное числовое значение или formatted value. |
| `unit` | Условно | Валюта, процент, штуки, секунды, пользователи или другая единица. |
| `trend` | Нет | Изменение относительно baseline. |
| `trendIcon` | Нет | Визуальная подсказка направления или состояния тренда. |
| `description` | Нет | Период, источник, caveat, target или пояснение. |

### Правила анатомии

- `label` и `value` обязательны, кроме состояния `unavailable`.
- `unit` обязателен, если без него value непонятен.
- `trend` должен включать baseline: период, target, forecast, cohort или benchmark.
- `trendIcon` не заменяет текстовое описание тренда.
- `description` используется для периода, источника, caveat или target, а не для длинного отчета.
- Если значение загружается, используйте loading state или Skeleton, а не пустое число.

---

## 3. Types / Variants / Варианты

### Display variants

| Variant | Когда использовать | Состав |
|---|---|---|
| `default` | Базовая метрика. | Label, value, optional unit/description. |
| `withTrend` | KPI сравнивается с baseline. | Label, value, unit, trend, trend context. |
| `compact` | Плотная сетка или side panel. | Короткий label, value, optional trend. |
| `featured` | Главный KPI секции. | Более сильный value и больше воздуха. |

### Figma variants

| Variant group | Values | Примечание |
|---|---|---|
| `trend` | `up`, `down`, `neutral`, `none` | Direction не равен tone. |
| `state` | `default`, `loading`, `error` | Data state, а не hover state. |
| `size` | `s`, `m`, `l`, `xl` | Управляет визуальным акцентом и плотностью. |

### Trend tone

| Tone | Значение | Required context |
|---|---|---|
| `neutral` | Нет оценки good/bad или изменение незначимо. | Baseline или period. |
| `positive` | Движение желательное для продукта. | Что улучшилось и относительно чего. |
| `warning` | Нужно внимание, но сценарий не критичен. | Почему изменение важно. |
| `negative` | Движение нежелательное или unhealthy. | Что ухудшилось и относительно чего. |

---

## 4. Sizes / Размеры

| Size | Когда использовать | Правило |
|---|---|---|
| `s` | Dense dashboards, table side panels, compact cards. | Минимальная плотность. |
| `m` | Базовые продуктовые интерфейсы. | Default для большинства случаев. |
| `l` | Primary KPI в секции. | Используйте для 1-3 метрик рядом. |
| `xl` | Hero metric или executive summary. | Только когда метрика является главным содержанием секции. |

### Правила размеров

- Size управляет акцентом, а не смыслом positive/negative.
- В одной группе метрик используйте одинаковый size и formatting.
- `xl` не должен использоваться для второстепенных значений.
- Value и unit должны оставаться визуально связанными на всех размерах.
- Typography, spacing, padding и layout пока задаются foundation rules и Figma variants, а не отдельными component tokens.

---

## 5. States / Состояния

| State | Описание | Правило |
|---|---|---|
| `default` | Значение доступно и актуально. | Показывайте label, value и optional context. |
| `loading` | Значение загружается. | Используйте Skeleton или loading placeholder той же геометрии. |
| `error` | Значение не удалось получить. | Покажите error text или unavailable reason. |
| `unavailable` | Значение нельзя посчитать или нет данных. | Не показывайте `0`, если это не реальный ноль. |
| `stale` | Значение устарело. | Нужен timestamp или caveat. |

### Trend states

| Direction | Tone может быть | Пример |
|---|---|---|
| `up` | `positive`, `warning`, `negative`, `neutral` | Рост выручки positive, рост расходов warning/negative. |
| `down` | `positive`, `warning`, `negative`, `neutral` | Снижение ошибок positive, снижение выручки negative. |
| `neutral` | `neutral`, `positive`, `warning` | Изменение незначимо или соответствует target. |
| `none` | `neutral` | Тренд скрыт или baseline отсутствует. |

---

## 6. Behavior / Поведение

### Data formatting

- Используйте locale-aware formatting для чисел, валют, процентов и compact notation.
- Unit должен быть одинаковым внутри группы метрик.
- Точность должна помогать решению, а не создавать ложную точность.
- Compact notation (`1.2M`, `42K`) допустима только когда точное значение не критично.
- Валюта, проценты и длительность должны следовать правилам [foundation/content.md](../../foundation/content.md).

### Trend behavior

- Trend всегда должен иметь baseline: прошлый период, target, forecast, cohort или benchmark.
- Trend tone определяется бизнес-смыслом метрики, а не направлением стрелки.
- Если направление неизвестно, используйте `trend="none"` или объясните caveat.
- Если trend является forecast или AI-estimate, это должно быть явно указано в description.

### Group behavior

- Связанные метрики должны иметь общий период, если не указано иначе.
- Смешивание разных time ranges в одной группе требует явных labels.
- Более 6 метрик нужно группировать, переносить в Table или разбивать по секциям.
- В группе метрик label, value formatting, unit placement и trend wording должны быть согласованы.

### Responsive behavior

- Value и unit не должны визуально разрываться.
- Trend и description могут переноситься ниже value.
- Compact metrics могут скрывать description только если контекст остается понятен.
- Длинные labels должны переноситься или сокращаться по documented rule.

---

## 7. Accessibility

Stat / Metric должен следовать [foundation/accessibility.md](../../foundation/accessibility.md). Число, unit, trend и интерпретация должны быть доступны как текст, а не только цвет или иконка.

| Сценарий | Требование | Пример |
|---|---|---|
| Value | Значение читается как текст. | `1 240 000 рублей`. |
| Trend | Direction и tone имеют текстовое описание. | `Рост на 12% к прошлому месяцу, положительная динамика`. |
| Icon | Иконка декоративна, если текст уже есть. | `aria-hidden="true"`. |
| Missing value | Причина недоступности объявлена. | `Данных пока нет`. |
| Real-time update | Live region только для важного обновления. | `aria-live="polite"` по product rule. |

### Accessibility checklist

- [ ] Metric имеет visible label.
- [ ] Value и unit доступны как текст.
- [ ] Trend имеет baseline и текстовое описание.
- [ ] Positive/negative/warning meaning не передан только цветом.
- [ ] Missing data не показан как `0`.
- [ ] Loading state не объявляет ложное значение.
- [ ] Real-time updates не создают шумных announcements.
- [ ] AI-generated или forecast value явно помечен.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Stat / Metric доступны component tokens в namespace `stat-metric`.

| Component token | Роль | Semantic mapping |
|---|---|---|
| `stat-metric/label/foreground` | Label color. | `text/tertiary` |
| `stat-metric/value/foreground` | Value color. | `text/primary` |
| `stat-metric/unit/foreground` | Unit color. | `text/secondary` |
| `stat-metric/trend/neutral` | Neutral trend text. | `text/tertiary` |
| `stat-metric/trend/positive` | Positive trend text. | `status/success/text` |
| `stat-metric/trend/warning` | Warning trend text. | `status/warning/text` |
| `stat-metric/trend/negative` | Negative trend text. | `status/danger/text` |
| `stat-metric/trend/icon/positive` | Positive trend icon. | `status/success/icon` |
| `stat-metric/trend/icon/warning` | Warning trend icon. | `status/warning/icon` |
| `stat-metric/trend/icon/negative` | Negative trend icon. | `status/danger/icon` |
| `stat-metric/description/foreground` | Description color. | `text/tertiary` |

### Token gaps

- Stat / Metric пока не имеет component tokens для typography, gap, padding, radius, background, loading surface и error text.
- Для loading используйте Skeleton tokens и foundation layout rules.
- Для error state используйте documented status tokens через компонент или pattern, а не новые token paths для Stat / Metric.
- Не придумывайте новые Stat / Metric token paths без обновления `tokens.json` и Figma bindings.

---

## 9. Code mapping

| Spec concept | Code prop / attribute | Notes |
|---|---|---|
| Label | `label` | Обязателен. |
| Value | `value` | Raw value или formatted string. |
| Formatted value | `formattedValue` | Optional override, если formatting внешний. |
| Unit | `unit` | Currency, percent, seconds, count, users и т.п. |
| Description | `description` | Период, источник, caveat или target. |
| Variant | `variant` | Values: `default`, `withTrend`, `compact`, `featured`. |
| Size | `size` | Values: `s`, `m`, `l`, `xl`. |
| Data state | `state` | Values: `default`, `loading`, `error`, `unavailable`, `stale`. |
| Trend direction | `trend.direction` | Values: `up`, `down`, `neutral`, `none`. |
| Trend tone | `trend.tone` | Values: `neutral`, `positive`, `warning`, `negative`. |
| Trend value | `trend.value` | Difference, percent, points or text. |
| Trend baseline | `trend.baseline` | Обязателен, если trend показан. |
| Unavailable reason | `unavailableReason` | Обязателен для unavailable/error state. |

### Contract rules

- `label` обязателен.
- `value` обязателен, кроме `state="loading"`, `state="error"` или `state="unavailable"`.
- `unit` обязателен, если без него value неоднозначен.
- `trend.baseline` обязателен при наличии trend.
- `trend.tone` не выводится автоматически из `trend.direction`.
- Arbitrary color props запрещены.
- Stat / Metric не используется для progress operations или time-series chart.

---

## 10. Handoff notes

Handoff для Stat / Metric должен фиксировать:

- business definition метрики;
- raw value и formatted display value;
- unit и locale formatting rules;
- period, target, benchmark или comparison baseline;
- trend direction и trend tone logic;
- источник данных и freshness/timestamp;
- unavailable, loading и error behavior;
- grouping rules для набора метрик;
- accessibility text для value, unit и trend;
- token paths для label, value, unit, trend, icon и description;
- token gaps для typography, spacing и layout.

---

## 11. Acceptance criteria

- [ ] Metric имеет label и value или documented unavailable/loading/error state.
- [ ] Unit видим, если без него value непонятен.
- [ ] Formatting согласован с locale и соседними метриками.
- [ ] Trend включает baseline.
- [ ] Positive/negative/warning meaning не выводится только из direction.
- [ ] Missing data не показан как `0`.
- [ ] Loading state сохраняет геометрию value.
- [ ] Error/unavailable state объясняет причину.
- [ ] Используются реальные `stat-metric` tokens из `tokens.json`.
- [ ] Handoff описывает source, period, baseline и freshness.

---

## 12. AI usage rules

AI может:

- предложить label, unit, formatting и description для метрики;
- проверить, нужен ли Stat / Metric, Table, Chart, Progress Bar, Tag или Badge;
- подготовить trend wording с baseline;
- найти missing unit, missing label, missing baseline и ambiguous trend tone;
- подготовить handoff notes и acceptance criteria;
- предложить unavailable/loading/error copy.

AI не должен:

- использовать Stat / Metric для time-series analysis вместо Chart;
- использовать Stat / Metric для progress operation вместо Progress Bar;
- считать `up` автоматически positive, а `down` automatically negative;
- показывать missing data как `0`;
- придумывать token paths, trend tones, units или arbitrary colors;
- скрывать AI-generated, forecast или estimated nature of value.

Если метрика влияет на деньги, доступ, права, безопасность или executive reporting, AI должен пометить сценарий как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Сценарий | Решение |
|---|---|
| Revenue KPI. | Label `Выручка`, value `$1.2M`, trend `+12% к прошлому месяцу`, tone `positive`. |
| Error rate decrease. | Label `Ошибки`, value `1.8%`, trend `-0.6 п.п. к прошлой неделе`, tone `positive`. |
| Cost increase. | Label `Расходы`, value `$42K`, trend `+8% к плану`, tone `warning` или `negative` по business rule. |
| Missing metric. | State `unavailable` с причиной, а не `0`. |

### Требует review

| Сценарий | Что проверить |
|---|---|
| `+12%` без comparison period. | Baseline отсутствует. |
| Зеленый рост расходов. | Direction может быть negative. |
| 20 метрик в одной строке. | Нужна группировка, Table или dashboard layout. |
| Метрика используется для загрузки файла. | Нужен Progress Bar. |

---

## 14. Anti-patterns

- Показывать число без label или unit.
- Использовать цвет как единственный смысл тренда.
- Считать любой рост положительным.
- Показывать missing data как `0`.
- Использовать Stat / Metric для анализа временного ряда.
- Использовать Stat / Metric как Progress Bar.
- Создавать custom trend colors вне component tokens.
- Смешивать разные периоды в одной группе без labels.
