# Timeline

> **Category** · Data Display
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Timeline](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6672-242)

---

## 1. Key Principles / Принципы использования

### Что это

Timeline — компонент для последовательного отображения событий, изменений, этапов или действий во времени. Он помогает прочитать историю объекта, audit log, lifecycle процесса или инцидент как упорядоченную цепочку.

В SEDA AI Timeline является chronology contract: он должен явно описывать порядок событий, direction, item state, timestamp, marker, connector, token mapping и accessibility. AI может помогать структурировать события и handoff notes, но не должен превращать Timeline в Stepper, Chart или декоративную инфографику без данных.

### Когда использовать

Используйте Timeline, когда:

- порядок событий важен для понимания;
- нужно показать историю изменений объекта;
- нужен audit log или activity history;
- нужно показать lifecycle заявки, заказа, сделки, задачи или инцидента;
- события имеют timestamp, actor, source или status;
- процесс содержит прошедшие, текущие и будущие этапы, но не является активной пошаговой навигацией;
- комментарии или сообщения требуют явной временной оси.

### Не используйте

Не используйте Timeline, когда:

- нужна активная пошаговая навигация — используйте Stepper;
- нужно показать измеримый прогресс операции — используйте Progress Bar;
- нужно показать загрузку без известного порядка — используйте Spinner или Skeleton;
- нужно сравнить несколько временных рядов — используйте Chart;
- важнее сортировка, фильтры и плотность данных — используйте Table;
- список не имеет временного или процессного порядка;
- каждый item превращается в отдельную сложную карточку с множеством действий.

### Основные принципы

- **Chronology first** — порядок событий должен быть однозначным.
- **Direction is explicit** — newest-first или oldest-first фиксируется в handoff.
- **State needs text** — `current`, `completed`, `error` и `upcoming` не передаются только цветом.
- **Connector is structural** — линия помогает читать последовательность, но не несет смысл без текста.
- **Timestamp is part of meaning** — дата, время, timezone и relative time должны быть согласованы.
- **Content stays scannable** — item не должен становиться тяжелее table row без причины.
- **AI assists, system governs** — AI может предложить структуру событий, но использует только documented variants, states, props и tokens.

### Связанные спецификации

- [Table](table.md) — плотный audit log с сортировкой и фильтрами.
- [Tag](tag.md) — status внутри timeline item.
- [Badge](badge.md) — count/status signal на host-элементе.
- [Skeleton](../feedback/skeleton.md) — loading state для timeline items.
- [Spinner](../feedback/spinner.md) — короткое ожидание загрузки.

---

## 2. Anatomy / Анатомия

| Slot | Обязательность | Описание |
|---|---:|---|
| `root` | Да | Контейнер Timeline. |
| `item` | Да | Одно событие или этап последовательности. |
| `point` | Да | Маркер состояния или типа события. |
| `connector` | Условно | Линия между items; скрывается у одиночного item и последнего item. |
| `title` | Да | Название события или этапа. |
| `description` | Нет | Контекст события, причина, результат или actor. |
| `timestamp` | Условно | Дата, время, relative time или duration. |
| `content` | Нет | Дополнительные metadata, actions или вложенные детали. |
| `statusText` | Условно | Текст для `current`, `completed`, `error`, `upcoming` или `disabled`. |

### Правила анатомии

- Каждый item должен иметь `title`.
- `timestamp` рекомендуется для истории, audit log и activity feed.
- `connector` декоративен для screen reader и не должен объявляться как content.
- `statusText` обязателен, если state влияет на понимание процесса.
- `content` не должен превращать каждый item в перегруженную карточку.
- Nested actions внутри item должны ссылаться на собственные component specs.

---

## 3. Types / Variants / Варианты

### Orientation

| Orientation | Когда использовать | Правило |
|---|---|---|
| `vertical` | Большинство продуктовых сценариев, audit log, activity history. | Читается сверху вниз. |
| `horizontal` | Короткие последовательности с 3-5 items и достаточной шириной. | На narrow viewport может перейти в vertical. |

### Marker variants

| Marker | Когда использовать | Ограничение |
|---|---|---|
| `dot` | Базовый marker события. | Default. |
| `icon` | Тип события важен для сканирования. | Icon не заменяет title/status text. |
| `number` | Нужна явная последовательность шагов. | Не превращать в Stepper без navigation behavior. |
| `avatar` | Важен actor события. | Нужен текстовый actor рядом или в description. |

### Item states

| State | Значение | Required content |
|---|---|---|
| `default` | Нейтральное событие или обычный item. | Title. |
| `upcoming` | Будущий этап в Figma variant. | Title и, если нужно, expected date. |
| `completed` | Этап завершен. | Status text, если completion влияет на смысл. |
| `current` | Текущий активный этап. | Текст `Текущий этап` или `aria-current`. |
| `error` | Событие завершилось ошибкой или требует внимания. | Error explanation. |
| `disabled` | Недоступный или inactive item. | Причина, если неочевидно. |

---

## 4. Sizes / Размеры

| Size | Когда использовать | Правило |
|---|---|---|
| `s` | Dense logs, side panels, compact cards. | Минимальная плотность. |
| `m` | Базовый product UI. | Default для большинства случаев. |
| `l` | Detail pages и incident timelines. | Позволяет больше description/content. |
| `xl` | Timeline является главным содержанием секции. | Использовать редко, для rich content. |

### Правила размеров

- Size управляет плотностью, marker scale и spacing, а не смыслом состояния.
- В одной Timeline используйте один size.
- `xl` не должен использоваться для плотных audit logs.
- Marker size, connector width, item gap, typography и content gap пока задаются foundation rules и Figma variants, а не отдельными component tokens.

---

## 5. States / Состояния

| State | Visual role | Content rule |
|---|---|---|
| `default` | Neutral point и connector. | Обычное событие. |
| `upcoming` | Future/inactive point. | Будущий этап должен быть понятен из текста. |
| `completed` | Completed point и connector. | Completion state не должен быть только цветом. |
| `current` | Current point. | Нужен visible text или `aria-current`. |
| `error` | Error point. | Нужен error title/description. |
| `disabled` | Disabled point/text. | Нужна причина, если item видим, но недоступен. |

### State rules

- `error` требует текстового объяснения.
- `current` должен быть заметен без опоры только на цвет.
- `completed` не нужен для каждого события, которое просто произошло; используйте его только для process stages.
- `upcoming` используется для будущих этапов, а не для неизвестных данных.
- Если пользователь может переходить между этапами, нужен Stepper или отдельный workflow pattern.

---

## 6. Behavior / Поведение

### Ordering

- Timeline должен сохранять хронологический или процессный порядок.
- Handoff должен указывать order: `newestFirst` или `oldestFirst`.
- Нельзя смешивать направления порядка в одной Timeline.
- Если события grouped by date, порядок внутри группы тоже должен быть указан.

### Layout behavior

- Vertical Timeline размещает connector вдоль последовательности items.
- Horizontal Timeline подходит только для коротких последовательностей.
- Long Timeline должен иметь pagination, lazy loading, grouping или virtualization вне базового компонента.
- Timestamp alignment должен быть стабильным внутри одной Timeline.
- Connector и point должны оставаться выровненными после переноса title/description.

### Interaction behavior

- Timeline по умолчанию non-interactive.
- Item может содержать Links, Buttons, Tags или metadata, но их behavior принадлежит вложенным компонентам.
- Expand/collapse, filtering и sorting являются pattern-level behavior и должны быть описаны отдельно.
- Если Timeline item кликабелен целиком, handoff должен описывать target, focus ring и nested interaction strategy.

### Responsive behavior

- Horizontal Timeline может переходить в vertical на narrow viewports.
- Rich content складывается под title/timestamp на small screens.
- Long titles переносятся или сокращаются по documented truncation rule.
- DOM order должен соответствовать визуальному порядку после responsive switch.

---

## 7. Accessibility

Timeline должен следовать [foundation/accessibility.md](../../foundation/accessibility.md). Порядок чтения, state и timestamp должны быть доступны как текст.

| Сценарий | Требование | Пример |
|---|---|---|
| Reading order | DOM order соответствует визуальному order. | `oldestFirst` или `newestFirst` не меняется случайно. |
| Structure | Используйте list semantics для списка событий. | `<ol>` для ordered process, `<ul>` для activity history. |
| Connector | Decorative connector скрыт от assistive tech. | `aria-hidden="true"`. |
| Marker | Decorative marker скрыт или имеет text equivalent. | Error marker сопровождается error text. |
| Current item | Current state доступен текстом. | `aria-current="step"` или visible `Текущий этап`. |
| Timestamp | Дата/время понятны и машиночитаемы, где возможно. | `<time dateTime="2026-05-28T10:00:00+03:00">`. |

### Accessibility checklist

- [ ] Items читаются в правильном порядке.
- [ ] Connector lines не объявляются как content.
- [ ] Current/completed/error/upcoming states имеют text equivalent.
- [ ] Nested interactive elements следуют своим specs.
- [ ] Timestamp format согласован и понятен.
- [ ] Horizontal layout не ломает reading order.
- [ ] Error item содержит объяснение, а не только цвет или icon.
- [ ] Actor/avatar имеет текстовое представление, если actor важен.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Timeline доступны component tokens в namespace `timeline`.

| Component token | Роль | Semantic mapping |
|---|---|---|
| `timeline/connector/default` | Default connector. | `border/default` |
| `timeline/connector/completed` | Completed connector. | `border/brand/default` |
| `timeline/connector/disabled` | Disabled connector. | `status/disabled/border` |
| `timeline/point/default` | Default point. | `container/neutral/default` |
| `timeline/point/current` | Current point. | `container/brand/default` |
| `timeline/point/completed` | Completed point. | `container/brand/default` |
| `timeline/point/error` | Error point. | `container/danger/default` |
| `timeline/point/disabled` | Disabled point. | `status/disabled/container` |
| `timeline/title/foreground` | Title color. | `text/primary` |
| `timeline/title/disabled` | Disabled title color. | `status/disabled/text` |
| `timeline/description/foreground` | Description color. | `text/secondary` |
| `timeline/description/disabled` | Disabled description color. | `status/disabled/text` |
| `timeline/timestamp/foreground` | Timestamp color. | `text/tertiary` |

### Token gaps

- Timeline пока не имеет component tokens для marker size, connector width, item gap, content gap, radius, typography, avatar size и horizontal spacing.
- `upcoming` в Figma должен использовать documented default/disabled visual mapping до появления отдельного component token.
- Не придумывайте новые Timeline token paths без обновления `tokens.json` и Figma bindings.

---

## 9. Code mapping

| Spec concept | Code prop / attribute | Notes |
|---|---|---|
| Items | `items` | Массив timeline events. |
| Orientation | `orientation` | Values: `vertical`, `horizontal`. |
| Size | `size` | Values: `s`, `m`, `l`, `xl`. |
| Marker | `marker` | Values: `dot`, `icon`, `number`, `avatar`. |
| Item state | `items[].state` | Values: `default`, `upcoming`, `completed`, `current`, `error`, `disabled`. |
| Title | `items[].title` | Обязателен. |
| Description | `items[].description` | Optional context. |
| Timestamp | `items[].timestamp` | Visible date/time/relative time. |
| Datetime | `items[].dateTime` | Machine-readable value. |
| Actor | `items[].actor` | Для activity feed. |
| Content | `items[].content` | Optional slot. |
| Order | `order` | Values: `newestFirst`, `oldestFirst`. |

### Contract rules

- Каждый item должен иметь `title`.
- `items[].state` должен использовать documented values.
- `orientation` и responsive switch должны быть описаны в handoff.
- Raw marker colors и connector colors через props запрещены.
- Timeline не используется как Stepper, если navigation behavior не описан отдельным pattern.
- `error` state требует error explanation.

---

## 10. Handoff notes

Handoff для Timeline должен фиксировать:

- chronological direction: `newestFirst` или `oldestFirst`;
- orientation и responsive switch rules;
- item structure и required fields;
- marker type и state для каждого item;
- timestamp format, timezone и relative time rules;
- actor/source, если событие создано пользователем или системой;
- grouping, pagination, lazy loading или virtualization rules для long timelines;
- nested interactions внутри item content;
- token mapping для connector, point, title, description и timestamp;
- token gaps для marker size, connector width и spacing.

---

## 11. Acceptance criteria

- [ ] Timeline отображает события в понятном chronological или process order.
- [ ] Handoff фиксирует `newestFirst` или `oldestFirst`.
- [ ] Каждый item имеет title.
- [ ] Timestamp есть для audit/history сценариев.
- [ ] Current, completed, error и upcoming states не передаются только цветом.
- [ ] Error item содержит explanation.
- [ ] DOM order соответствует visual reading order.
- [ ] Connector и point используют реальные Timeline component tokens.
- [ ] Long Timeline имеет documented loading/pagination/grouping strategy.
- [ ] Timeline не используется для active step navigation без Stepper pattern.

---

## 12. AI usage rules

AI может:

- предложить структуру timeline items по истории событий;
- проверить, нужен ли Timeline, Table, Stepper, Progress Bar или Chart;
- подготовить chronological order, grouping и timestamp rules;
- сформировать handoff notes и acceptance criteria;
- найти missing title, missing timestamp, unclear order, inaccessible state и token gaps.

AI не должен:

- использовать Timeline для unordered list;
- использовать Timeline как clickable wizard navigation вместо Stepper;
- использовать Timeline как Progress Bar или Chart;
- придумывать states, marker variants, token paths или raw colors;
- передавать current/error/completed state только цветом;
- менять chronological direction без явного product rule.

Если Timeline описывает audit, incident, legal, access, payment или security events, AI должен пометить сценарий как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Сценарий | Решение |
|---|---|
| Audit log объекта. | Vertical Timeline, timestamp на каждом item, `newestFirst`. |
| Lifecycle заказа. | `completed`, `current`, `upcoming` states с текстовыми labels. |
| Incident history. | Error item содержит explanation и timestamp. |
| Activity feed. | Avatar marker с actor, action title и time. |

### Требует review

| Сценарий | Что проверить |
|---|---|
| Timeline используется как wizard navigation. | Вероятно нужен Stepper. |
| Error item показан только красной точкой. | Status передан только цветом. |
| Horizontal Timeline содержит 20 items на mobile. | Риск reading order и overflow. |
| Events отсортированы непоследовательно. | Chronology становится неясной. |

---

## 14. Anti-patterns

- Использовать Timeline для простого unordered list.
- Использовать Timeline вместо Table, когда важны sorting/filtering.
- Показывать current/error/completed states только цветом.
- Смешивать newest-first и oldest-first в одном view.
- Добавлять active step navigation без Stepper behavior.
- Создавать custom marker colors вне component tokens.
- Рендерить decorative connector lines как screen reader content.
- Делать каждый item тяжелой Card без причины.
