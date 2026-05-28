# Divider

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `layout.md`, `spacing-sizing.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Divider — визуальный разделитель между связанными группами контента. Он помогает сканировать интерфейс, но не заменяет spacing, heading, Card, Section или навигационную структуру.

В SEDA AI Divider является visual separation contract: он должен явно описывать orientation, emphasis, label behavior, accessibility role и token mapping. AI может предложить Divider только после проверки, что spacing или структура контента не решают задачу лучше.

### Когда использовать

Используйте Divider, когда:

- нужно разделить группы внутри меню, списка, панели или Card;
- рядом находятся связанные блоки, которым нужен слабый visual boundary;
- есть label, который разделяет небольшие группы внутри dense UI;
- vertical line нужна между inline controls в toolbar;
- semantic section already exists, а Divider нужен только как визуальная поддержка.

### Не используйте

Не используйте Divider, когда:

- достаточно spacing;
- нужен заголовок секции или явная структура страницы;
- вы отделяете целые page sections — используйте layout primitives;
- несколько Divider идут подряд;
- Divider нужен как декоративная линия без структурной причины;
- divider line становится основным способом объяснить иерархию.

### Основные принципы

- **Spacing first** — сначала проверьте spacing и layout.
- **Visual, not structural by default** — Divider обычно декоративен.
- **One boundary, one reason** — каждый Divider должен отделять конкретные группы.
- **No divider stacks** — несколько линий подряд сигнализируют о проблеме структуры.
- **Label is rare** — label используется только если он реально называет группу.
- **Tokens before visuals** — line и label берутся из `divider` tokens.
- **AI assists, system governs** — AI не должен добавлять Divider как универсальный декор.

### Связанные спецификации

- [Card](../specs/data-display/card.md) — группировка контента без лишних разделителей.
- [Description List](../specs/data-display/description-list.md) — term-value структура.
- [Accordion](../specs/data-display/accordion.md) — раскрытие вторичного контента.
- [Container](../specs/overlays-layout/container.md) — layout wrapper для секций.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `root` | Да | Контейнер Divider. |
| `line` | Да | Визуальная линия разделения. |
| `label` | Нет | Короткий текст между линиями или рядом с линией. |
| `icon` | Нет | Иконка в центре; использовать только с понятной причиной. |

### Правила анатомии

- `line` не должен быть фокусируемым.
- `label` не должен заменять heading, если начинается новая смысловая секция.
- `icon` не должен быть декоративным шумом; чаще нужен label или ничего.
- Vertical Divider получает высоту от parent layout.
- Horizontal Divider получает ширину от container.

---

## 3. Types / Variants / Варианты

| Variant | Назначение | Правило |
|---|---|---|
| `horizontal` | Разделяет блоки по вертикали. | Default для списков, меню, Card. |
| `vertical` | Разделяет inline controls по горизонтали. | Parent должен задавать высоту. |

### Emphasis

| Emphasis | Назначение | Token |
|---|---|---|
| `default` | Слабое разделение. | `divider/line/default` |
| `strong` | Более заметное разделение. | `divider/line/strong` |
| `inverse` | Разделение на inverse/dark surface. | `divider/line/inverse` |

### Modifiers

| Modifier | Назначение | Ограничения |
|---|---|---|
| `withLabel` | Добавляет короткий label. | Label должен называть группу. |
| `withIcon` | Добавляет icon. | Требует review, часто избыточен. |
| `inset` | Линия начинается после leading content. | Для list rows или menu items. |

---

## 4. Sizes / Размеры

Divider не имеет размерной шкалы. Толщина линии по умолчанию — 1px, а длину задает parent layout.

### Правила размеров

- Не масштабируйте Divider произвольно.
- Для более заметного разделения используйте `strong`, а не raw border width.
- Vertical Divider должен иметь явно заданную высоту через parent layout.
- Spacing до и после Divider задается layout rules, а не самим Divider.

---

## 5. States / Состояния

Divider статичен. Interactive states не применяются.

| State | Применимость | Правило |
|---|---|---|
| `default` | Да | Стандартное отображение. |
| `hover` / `focus` / `active` | Нет | Divider не интерактивен. |
| `disabled` | Нет | Disabled принадлежит parent component. |

---

## 6. Behavior / Поведение

- Divider не имеет click, keyboard или hover behavior.
- Divider не должен менять layout при загрузке данных.
- Label Divider не должен становиться focus target.
- Если Divider находится внутри интерактивного компонента, interaction принадлежит parent.
- Semantic separator используется только если разделение важно для assistive technology.

---

## 7. Accessibility

| Сценарий | Рекомендация | Правило |
|---|---|---|
| Декоративный Divider | `aria-hidden="true"` | Default case. |
| Семантическое разделение секций | `<hr>` или `role="separator"` | Использовать только когда разделение важно для структуры. |
| Label Divider | Visible text или heading outside Divider | Label не должен ломать heading hierarchy. |
| Vertical Divider | `aria-orientation="vertical"` при semantic separator | Только для semantic use case. |

### Accessibility checklist

- [ ] Divider не фокусируется.
- [ ] Decorative Divider скрыт от screen reader.
- [ ] Semantic Divider используется только по реальной структурной причине.
- [ ] Label не заменяет heading, если нужен heading.
- [ ] Цвет линии имеет достаточную видимость на фоне.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Divider доступны component tokens в namespace `divider`; устаревшие aliases вида `--divider-*` не являются source of truth.

| Component token | Роль | Semantic token |
|---|---|---|
| `divider/line/default` | Стандартная линия. | `border/subtle` |
| `divider/line/strong` | Усиленная линия. | `border/default` |
| `divider/line/inverse` | Линия на inverse surface. | `border/inverse` |
| `divider/label/foreground` | Текст label. | `text/tertiary` |
| `divider/label/surface` | Фон под label. | `surface/base` |

### Token gaps

- Нет component tokens для spacing before/after, inset, line thickness и label gap.
- До появления таких tokens используйте foundation spacing/layout rules.
- Не добавляйте custom divider colors или widths без token architecture review.

---

## 9. Code mapping

| Design concept | Prop / API | Правило |
|---|---|---|
| Orientation | `orientation` | `horizontal`, `vertical`. |
| Emphasis | `emphasis` | `default`, `strong`, `inverse`. |
| Label | `label` | Короткий текст, если нужен `withLabel`. |
| Icon | `icon` | Только documented icon и только после review. |
| Inset | `inset` | Boolean или side-specific value по layout rule. |
| Decorative | `decorative` | Default `true`; задает `aria-hidden`. |
| Semantic | `semantic` | Использовать `<hr>` / `role="separator"`, если нужно. |

### Contract rules

- `decorative` и `semantic` не должны конфликтовать.
- `withLabel` не используется вместо heading.
- `vertical` требует parent height.
- Divider не принимает `onClick`.
- Raw border colors, border widths и ad-hoc dash styles запрещены.

---

## 10. Handoff notes

Handoff для Divider должен фиксировать:

- зачем нужен разделитель;
- orientation;
- emphasis;
- decorative или semantic behavior;
- spacing/inset от parent layout;
- label или icon, если используется;
- token mapping и token gaps.

---

## 11. Acceptance criteria

- [ ] Divider отделяет реальные группы контента.
- [ ] Spacing alone был проверен как альтернатива.
- [ ] Divider не используется как page-section wrapper.
- [ ] Decorative Divider скрыт от screen reader.
- [ ] Semantic Divider имеет корректный role/orientation.
- [ ] Label не заменяет heading.
- [ ] Используются реальные `divider` component tokens.
- [ ] Не используются устаревшие aliases `--divider-*`.

---

## 12. AI usage rules

AI может:

- предложить Divider для меню, списка, Card или toolbar;
- проверить, достаточно ли spacing вместо Divider;
- выбрать orientation и emphasis;
- подготовить handoff notes;
- сверить token mapping с `tokens.json`.

AI не должен:

- добавлять Divider как декоративный шум;
- использовать Divider вместо spacing, heading, Card или Container;
- придумывать token paths, line styles или widths;
- делать Divider интерактивным;
- использовать label Divider вместо semantic heading.

Если Divider нужен для всей page section или появляется несколько Divider подряд, AI должен пометить сценарий как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Scenario | Usage |
|---|---|
| Разделение групп в menu | `orientation="horizontal"`, `emphasis="default"`, decorative. |
| Toolbar groups | `orientation="vertical"`, parent задает высоту. |
| Разделение metadata внутри Card | `orientation="horizontal"`, spacing controlled by Card layout. |
| Dark surface | `emphasis="inverse"`. |

### Требует review

| Scenario | Причина |
|---|---|
| Divider между каждой строкой длинного списка. | Возможно нужен Table/List pattern. |
| Три Divider подряд. | Проблема структуры контента. |
| Divider вместо heading. | Нарушается semantic hierarchy. |
| Custom dashed line. | Нет documented token/style contract. |

---

## 14. Anti-patterns

- Использовать Divider вместо spacing.
- Использовать Divider как единственный способ объяснить иерархию страницы.
- Добавлять несколько Divider подряд.
- Делать Divider кликабельным.
- Использовать raw colors, widths или dash styles.
- Использовать label Divider вместо heading.
- Разделять несвязанные page sections вместо корректного layout.
