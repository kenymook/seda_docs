# Badge

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `content.md`, `iconography.md`, `state-vocabulary.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Badge — компактный визуальный индикатор количества, статуса или системного сигнала, связанный с конкретным host-элементом: иконкой, Avatar, navigation item, tab, card или строкой списка. Badge помогает быстро заметить изменение состояния, но не является самостоятельным действием.

В SEDA AI Badge является signal contract: он должен явно описывать host, смысл сигнала, count behavior, tone, доступное текстовое описание и token mapping. AI может помогать с формулировкой label и правилами отображения count, но не должен превращать Badge в Tag, Button или произвольную цветную метку.

### Когда использовать

Используйте Badge, когда:

- нужно показать количество новых или непрочитанных объектов;
- нужно отметить наличие активности поверх host-элемента;
- счетчик относится к navigation item, tab, Avatar, icon button или card;
- нужен короткий системный сигнал: `new`, `AI`, `beta`, `warning`, `error`;
- статус должен быть видим в плотном интерфейсе, но полное описание доступно рядом или через accessible label.

### Не используйте

Не используйте Badge, когда:

- нужен самостоятельный текстовый статус объекта — используйте Tag;
- нужен кликабельный фильтр или выбор — используйте Chip;
- нужно выполнить действие — используйте Button или Icon Button;
- значение является основной метрикой — используйте Stat / Metric;
- Badge не связан с host-элементом или понятным контекстом;
- цвет является единственным способом понять смысл.

### Основные принципы

- **Host first** — Badge всегда привязан к host или контексту.
- **Signal, not content** — Badge не заменяет полноценный текст, статус или метрику.
- **Count is bounded** — длинные значения сокращаются через max count, например `99+`.
- **Zero is intentional** — при `0` Badge скрывается или превращается в `dot` только по documented rule.
- **Tone follows meaning** — tone выбирается по статусу, а не по декоративному цвету.
- **Accessible text is required** — смысл Badge должен быть доступен screen reader.
- **Tokens before visuals** — foreground, border, surface и icon берутся из `badge` tokens.
- **AI assists, system governs** — AI может предложить label, но не придумывает tones и token paths.

### Связанные спецификации

- [Tag](../specs/data-display/tag.md) — самостоятельный статус или категория.
- [Chip](../specs/data-display/chip.md) — интерактивный фильтр или выбранная сущность.
- [Avatar](../specs/data-display/avatar.md) — identity component, рядом с которым может быть status indicator.
- [Tabs](../specs/navigation/tabs.md) — tab counters.
- [Notification Center](../specs/overlays-layout/notification-center.md) — источники notification count.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `root` | Да | Контейнер Badge. |
| `value` | Условно | Число, короткий label или symbol. |
| `dot` | Условно | Минимальный индикатор без текста. |
| `icon` | Нет | Короткий status icon, если он добавляет смысл. |
| `host` | Да | Элемент или контекст, к которому относится Badge. |
| `accessibleLabel` | Да | Текстовое описание смысла Badge. |

### Правила анатомии

- `value`, `dot` и `icon` не должны одновременно конкурировать за один смысл.
- Badge не должен содержать длинный текст; для длинного статуса используйте Tag.
- Badge поверх host не должен перекрывать важную часть иконки, Avatar или текста.
- Если Badge находится внутри host, порядок чтения должен оставаться понятным.
- Decorative Badge допустим только если тот же смысл уже передан текстом рядом.

---

## 3. Types / Variants / Варианты

| Variant | Назначение | Типичный сценарий |
|---|---|---|
| `count` | Показывает число. | Непрочитанные уведомления, сообщения, items в tab. |
| `dot` | Показывает факт активности без числа. | Новая активность, online-like presence, unseen update. |
| `label` | Показывает короткий текст 2-6 символов. | `New`, `AI`, `Beta`, `99+`. |
| `icon` | Показывает status icon. | Warning/error marker в плотном UI. |

### Tone

| Tone | Назначение | Пример |
|---|---|---|
| `neutral` | Нейтральная информация. | Количество элементов. |
| `brand` | Акцент продукта или основной счетчик. | New messages. |
| `info` | Информационный сигнал. | Новое обновление. |
| `success` | Успешное или доступное состояние. | Verified, online. |
| `warning` | Требует внимания. | Pending, delayed. |
| `danger` | Ошибка, риск или критичный count. | Failed, urgent unread. |
| `ai` | AI-related signal. | AI suggestion, generated content. |
| `disabled` | Недоступный или выключенный сигнал. | Disabled count. |

---

## 4. Sizes / Размеры

| Size | Высота | Типичный контекст |
|---|---:|---|
| `small` | 16px | Toolbar, icon button, compact table. |
| `medium` | 20px | Default для navigation, tabs, Avatar. |
| `large` | 24px | Prominent card или panel context. |

### Правила размеров

- Dot size должен быть стабильным внутри одного host pattern.
- Count Badge должен вмещать минимум 1-2 цифры без изменения высоты.
- Для `99+` ширина может расти, но высота остается стабильной.
- Badge не должен менять layout host-элемента при обновлении count.

---

## 5. States / Состояния

| State | Когда возникает | Правило |
|---|---|---|
| `default` | Badge видим и активен как сигнал. | Используются tokens выбранного tone. |
| `hidden` | Нет значения или сигнал не нужен. | Badge не рендерится или скрыт для visual и accessibility tree. |
| `overflow` | Count больше max. | Показывается `max+`, например `99+`. |
| `updating` | Значение обновляется. | Не дергать layout и не сбрасывать focus host. |
| `disabled` | Host или сигнал недоступен. | Используются disabled tokens. |

### Count rules

| Input | Visual | Accessibility |
|---|---|---|
| `0` | Скрыть или `dot` по правилу продукта. | Не объявлять ложный count. |
| `1-99` | Показать число. | `1 новое уведомление`, `5 новых сообщений`. |
| `>99` | `99+` или product max. | Полное значение можно передать в accessible label. |
| `null` / `undefined` | Скрыть Badge. | Нет announcement. |

---

## 6. Behavior / Поведение

- Badge сам по себе не фокусируется и не получает click handler.
- Interaction принадлежит host: Icon Button, Tab, Link, Avatar или Card.
- Обновление count не должно менять размер host или вызывать layout shift.
- Появление/исчезновение Badge может быть анимировано, но reduced motion должен быть учтен.
- Live updates объявляются screen reader только если это важно для текущей задачи.
- Для frequently updating count используйте throttling или не объявляйте каждое изменение.

### Placement

| Host | Placement rule |
|---|---|
| Icon Button | Верхний правый угол, без перекрытия recognisable icon shape. |
| Avatar | Нижний или верхний правый угол по status pattern. |
| Tab | Рядом с label, внутри tab layout. |
| Navigation item | Рядом с label или icon, но не вместо label. |
| Card | В зоне metadata/status, не поверх основного content. |

---

## 7. Accessibility

Badge чаще всего декоративен визуально, но его смысл должен быть включен в accessible name или description host-элемента.

| Сценарий | Рекомендация | Правило |
|---|---|---|
| Count на Icon Button | Обновить `aria-label` host. | `Уведомления, 5 новых`. |
| Count на Tab | Включить count в accessible tab name. | `Комментарии, 12`. |
| Dot Badge | Добавить смысл в host label. | `Есть новые обновления`. |
| Status Badge | Добавить текстовый статус. | `Статус: ошибка`. |
| Decorative duplicate | `aria-hidden="true"` на Badge. | Только если текст уже есть рядом. |

### Accessibility checklist

- [ ] Badge не является единственным источником смысла для screen reader.
- [ ] Host label включает count/status, если Badge важен.
- [ ] Dot Badge имеет текстовое описание.
- [ ] Цвет не является единственным способом понять tone.
- [ ] Dynamic updates не создают шум для screen reader.
- [ ] Badge не получает focus отдельно от host.
- [ ] Overflow `99+` имеет понятное accessible значение.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Badge доступны component tokens в namespace `badge`; устаревшие aliases вида `--badge-*` не являются source of truth.

### Tone tokens

| Role | Component token pattern | Supported tones |
|---|---|---|
| Foreground | `badge.foreground.{tone}` | `default`, `neutral`, `brand`, `info`, `success`, `warning`, `danger`, `ai`, `disabled` |
| Border | `badge.border.{tone}` | `default`, `neutral`, `brand`, `info`, `success`, `warning`, `danger`, `ai`, `disabled` |
| Surface | `badge.surface.{tone}` | `neutral`, `brand`, `info`, `success`, `warning`, `danger`, `ai`, `disabled` |
| Icon | `badge.icon.{tone}` | `neutral`, `brand`, `info`, `success`, `warning`, `danger`, `ai`, `disabled` |

### Examples

| Component token | Роль | Semantic token |
|---|---|---|
| `badge/surface/brand` | Brand Badge surface. | `container/brand/default` |
| `badge/foreground/brand` | Brand Badge text. | `text/on-brand/primary` |
| `badge/border/brand` | Brand Badge border. | `border/brand/subtle` |
| `badge/surface/danger` | Danger Badge surface. | `status/danger/container` |
| `badge/foreground/danger` | Danger Badge text. | `status/danger/text` |
| `badge/icon/danger` | Danger Badge icon. | `status/danger/icon` |
| `badge/surface/ai` | AI Badge surface. | `status/ai/container` |
| `badge/foreground/ai` | AI Badge text. | `status/ai/text` |
| `badge/surface/disabled` | Disabled Badge surface. | `status/disabled/container` |

### Token gaps

- Size, radius, padding, dot size, max width и placement offsets пока описаны foundation/layout rules, а не Badge component tokens.
- Если появятся placement tokens, spec должен явно связать их с host patterns.
- Не добавляйте custom tones без обновления `tokens.json`.

---

## 9. Code mapping

| Design concept | Prop / API | Правило |
|---|---|---|
| Variant | `variant` | `count`, `dot`, `label`, `icon`. |
| Tone | `tone` | `neutral`, `brand`, `info`, `success`, `warning`, `danger`, `ai`, `disabled`. |
| Count value | `count` | Number для `count`. |
| Max count | `max` | Default `99`, если продукт не задает другое. |
| Label | `label` | Короткий текст для `label` variant. |
| Icon | `icon` | Только documented icon. |
| Size | `size` | `small`, `medium`, `large`. |
| Hidden | `hidden` | Скрывает Badge при отсутствии сигнала. |
| Accessible label | `accessibleLabel` | Описание count/status для host. |

### Contract rules

- Badge не должен иметь `onClick`.
- `count` и `label` не используются одновременно как разные смыслы.
- `dot` требует accessible meaning на host.
- `tone` должен быть только documented tone.
- `max` должен быть одинаковым внутри одного product area.
- Raw colors и ad-hoc status names запрещены.

---

## 10. Handoff notes

Handoff для Badge должен фиксировать:

- host component и placement;
- variant и tone;
- count source и update rule;
- max count и zero behavior;
- visible value и accessible label;
- live region policy, если count обновляется в реальном времени;
- size;
- token mapping и token gaps;
- условие скрытия Badge.

---

## 11. Acceptance criteria

- [ ] Badge связан с host-элементом или понятным контекстом.
- [ ] Variant и tone входят в documented contract.
- [ ] Count overflow использует documented max rule.
- [ ] Zero behavior явно задан.
- [ ] Badge не фокусируется и не имеет собственного click handler.
- [ ] Accessible label host передает count/status.
- [ ] Цвет не является единственным способом понять смысл.
- [ ] Используются реальные `badge` component tokens.
- [ ] Не используются устаревшие aliases `--badge-*`.

---

## 12. AI usage rules

AI может:

- предложить variant и tone по смыслу сигнала;
- подготовить accessible label для host;
- сформулировать count overflow и zero behavior;
- проверить, нужен ли Tag, Chip, Stat / Metric или Badge;
- подготовить handoff notes и acceptance criteria;
- сверить token mapping с `tokens.json`.

AI не должен:

- использовать Badge как самостоятельную метку без host;
- превращать Badge в Button, Link или Chip;
- придумывать tones, props, token paths или placement rules;
- передавать смысл только цветом;
- скрывать count/status от screen reader;
- использовать `--badge-*` aliases как source of truth.

Если Badge несет бизнес-критичный статус, AI должен пометить сценарий как `Needs system review` и предложить текстовый статус рядом.

---

## 13. Examples / Примеры

### Корректно

| Scenario | Usage |
|---|---|
| Уведомления в Top Bar | `variant="count"`, `tone="danger"`, `count=5`, host label `Уведомления, 5 новых`. |
| Новое обновление в Tab | `variant="dot"`, `tone="info"`, accessible text `Есть новые обновления`. |
| AI suggestion | `variant="label"`, `tone="ai"`, label `AI`. |
| Warning marker on card | `variant="icon"`, `tone="warning"`, visible status text рядом или accessible label. |

### Требует review

| Scenario | Причина |
|---|---|
| Badge без host. | Нет контекста сигнала. |
| Цветная точка без текстового смысла. | Недоступно для screen reader и color-blind users. |
| Count `12843` без max rule. | Ломает layout и плохо сканируется. |
| Badge с `onClick`. | Это уже action; нужен Button/Icon Button или Chip. |
| Badge вместо Tag для статуса заказа. | Нужен самостоятельный текстовый статус. |

---

## 14. Anti-patterns

- Использовать Badge как самостоятельную категориальную метку.
- Использовать Badge для интерактивного фильтра.
- Добавлять click handler на Badge.
- Использовать arbitrary colors вместо `badge` tokens.
- Показывать `0`, если продуктовый сценарий не требует нулевого сигнала.
- Передавать смысл только цветом или формой.
- Объявлять каждое частое изменение count через live region.
- Перекрывать Badge важную часть host icon или Avatar.
