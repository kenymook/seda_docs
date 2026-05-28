# Card

> **Category** · Data Display
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `content.md`, `layout.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Card — контейнер для группировки связанного контента, метаданных и действий об одной сущности или одном смысловом блоке. Card помогает сканировать повторяющиеся объекты: проекты, пользователей, файлы, статьи, задачи, настройки или аналитические виджеты.

В SEDA AI Card является layout-and-content pattern, а не декоративной рамкой. Она должна иметь понятную структуру, токены, states и правила интерактивности.

### Когда использовать

Используйте Card, когда:

- нужно показать одну сущность как самостоятельный объект;
- повторяющиеся элементы должны сканироваться в grid или list;
- у объекта есть title, description, metadata, status, preview или actions;
- нужно отделить компактный виджет от соседних блоков;
- пользователь может выбрать, открыть или сравнить несколько объектов.

### Не используйте

Не используйте Card, когда:

- нужно структурировать всю страницу — используйте layout primitives;
- нужно просто отделить длинный текст — используйте spacing, headings и [Divider](../specs/data-display/divider.md);
- внутри Card оказывается полноценный workflow или длинная форма;
- вся страница превращается в набор вложенных cards;
- Card нужна только как декоративный фон без смысловой группировки.

### Основные принципы

- **One entity, one card** — одна Card описывает один объект или один смысловой блок.
- **Structure before decoration** — Card должна иметь понятную анатомию, а не только border и shadow.
- **Interactive card is explicit** — кликабельность задается отдельным variant и keyboard behavior.
- **No nested card stacks** — не вкладывайте Card в Card без сильной структурной причины.
- **Consistent scanning** — в коллекции cards сохраняйте одинаковый порядок слотов и сопоставимую высоту.
- **AI drafts, human validates** — AI может предложить структуру Card, но человек проверяет информационную архитектуру и интерактивность.

### Связанные спецификации

- [Grid](../specs/overlays-layout/grid.md) — размещение Card в сетке.
- [Container](../specs/overlays-layout/container.md) — layout wrapper для sections.
- [Badge](../specs/data-display/badge.md) — статус внутри Card.
- [Button](../specs/actions/button.md) — действия в footer.
- [Avatar](../specs/data-display/avatar.md) — пользовательский preview.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `surface` | Да | Контейнер Card. |
| `media` | Нет | Изображение, preview, chart или thumbnail. |
| `header` | Условно | Title, subtitle, metadata или primary action. |
| `title` | Условно | Название объекта или блока. |
| `description` | Нет | Краткое описание объекта. |
| `metadata` | Нет | Дата, автор, счетчик, secondary details. |
| `status` | Нет | Badge, tag или icon status. |
| `body` | Условно | Основное содержимое. |
| `footer` | Нет | Actions, metadata или summary. |
| `actions` | Нет | Кнопки или ссылки, относящиеся к Card. |

### Правила анатомии

- В Card должен быть хотя бы один смысловой контентный слот: `title`, `body`, `media` или `metadata`.
- `actions` не должны конкурировать с кликабельностью всей Card.
- `media` должен иметь aspect ratio или стабильную высоту, чтобы сетка не прыгала.
- `status` размещается рядом с title или metadata, если относится ко всей Card.
- Footer используется для действий и secondary metadata, а не для случайного контента.
- Если вся Card кликабельна, внутри не должно быть независимых interactive controls без отдельной event strategy.
- Если Card используется как section wrapper для страницы, проверьте, не подходит ли лучше Container или layout primitive.

---

## 3. Types / Variants / Варианты

| Variant | Когда использовать | Правило |
|---|---|---|
| `default` | Базовая Card с border и surface. | Не интерактивна сама по себе. |
| `clickable` | Вся Card открывает объект или выполняет одно primary action. | Нужен keyboard behavior и focus ring. |
| `selectable` | Card выбирается в группе объектов. | Используйте `aria-selected` или checkbox pattern. |
| `elevated` | Card должна визуально отделяться от сложного фона. | Не использовать как единственный способ группировки. |
| `media` | Card с изображением, chart или thumbnail. | Media slot имеет stable aspect ratio. |
| `compact` | Плотный список cards или dashboard. | Сократить secondary content. |

### Composition variants

| Pattern | Когда использовать | Что проверить |
|---|---|---|
| `object-card` | Пользователь, проект, файл, товар. | Title, metadata, status, primary action. |
| `metric-card` | Краткий аналитический виджет. | Не дублирует [Stat Metric](../specs/data-display/stat-metric.md). |
| `settings-card` | Группа настроек. | Не превращается в длинную форму. |
| `preview-card` | Контент с media preview. | Alt text, aspect ratio, loading state. |

---

## 4. Sizes / Размеры

Card не имеет жестких размеров, но должна использовать системные density-паттерны и стабильные constraints.

| Size | Padding | Контекст |
|---|---:|---|
| `compact` | 12-16px | Плотные списки, dashboards, side panels. |
| `medium` | 16-24px | Default для grid/list cards. |
| `large` | 24-32px | Feature cards, сложные previews, крупные виджеты. |

### Правила размеров

- Width задается parent layout: grid columns, list container или responsive breakpoint.
- В коллекции cards используйте одинаковые constraints для media и header.
- Кликабельная Card должна иметь достаточную hit area и видимый focus state.
- Если Card содержит слишком много разнородных блоков, разделите content или используйте отдельную страницу.

---

## 5. States / Состояния

| Состояние | Когда возникает | Правило |
|---|---|---|
| `default` | Card отображает контент без интерактивности. | Используются базовые surface и border. |
| `hover` | Pointer над clickable/selectable Card. | Усиление surface или border. |
| `focus` | Card получает keyboard focus. | Используется focus ring. |
| `active` | Card активируется pointer или keyboard. | Не должен конфликтовать с внутренними actions. |
| `selected` | Card выбрана в группе. | Явный selected border или control. |
| `disabled` | Card недоступна для действия. | Контент приглушен, интерактивность отключена. |
| `loading` | Контент Card еще загружается. | Используйте Skeleton внутри структуры Card. |
| `empty` | Объект есть, но данных нет. | Покажите ясное empty content, не пустую рамку. |

---

## 6. Behavior / Поведение

### Clickable Card

- Кликабельная Card должна быть нативной ссылкой или кнопкой, если вся поверхность выполняет одно действие.
- Если внутри есть самостоятельные buttons/links, не делайте всю Card кликабельной без явного event strategy.
- `Enter` активирует ссылку или кнопку; `Space` активирует button-like Card.
- Focus ring виден вокруг Card или понятной интерактивной области.

### Selectable Card

- Selection state должен быть видимым и не передаваться только цветом.
- В группах выбора используйте checkbox/radio pattern, если пользователь может выбирать несколько или один объект.
- `aria-selected` допустим в соответствующем composite widget; иначе используйте нативные controls.

### Layout behavior

- Media slot резервирует место до загрузки изображения.
- Cards в grid должны иметь предсказуемую высоту или правила выравнивания.
- Длинные titles и metadata должны иметь truncation/line clamp rules.
- Empty/loading/error состояния внутри Card не должны менять внешний layout непредсказуемо.

---

## 7. Accessibility

| Сценарий | Рекомендация | Правило |
|---|---|---|
| Контентная Card | `article`, `section` или нейтральный container. | Выбирайте семантику по смыслу. |
| Clickable Card | Нативный `<a>` или `<button>`. | Не имитируйте интерактивность через `div`. |
| Selectable Card | Checkbox/radio или composite widget. | Selection должен быть доступен screen reader. |
| Media | Alt text или decorative handling. | Preview не должен быть единственным смыслом. |
| Actions | Нативные buttons/links. | Не конфликтуют с Card click target. |

### Accessibility checklist

- [ ] Card имеет понятную структуру heading/content/actions.
- [ ] Clickable Card доступна с клавиатуры.
- [ ] Focus state видим.
- [ ] Selection state не передается только цветом.
- [ ] Изображения имеют корректный alt text или помечены как декоративные.
- [ ] Внутренние actions не конфликтуют с кликом по Card.
- [ ] Loading/empty/error states озвучиваются или представлены текстом.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Card доступны component tokens в namespace `card`.

| Component token | Роль | Semantic token |
|---|---|---|
| `card/surface/default` | Фон Card по умолчанию. | `surface/base` |
| `card/surface/disabled` | Фон disabled Card. | `status/disabled/container` |
| `card/surface/hover` | Фон hover Card. | `surface/raised` |
| `card/surface/selected` | Фон selected Card. | `surface/base` |
| `card/border/default` | Граница Card по умолчанию. | `border/default` |
| `card/border/selected` | Граница selected Card. | `border/selected` |
| `card/border/hover` | Граница hover Card. | `border/hover` |
| `card/border/disabled` | Граница disabled Card. | `status/disabled/border` |
| `card/focus/ring` | Focus ring. | `focus/ring` |
| `card/title/foreground` | Title text. | `text/primary` |
| `card/description/foreground` | Description text. | `text/secondary` |
| `card/metadata/foreground` | Metadata text. | `text/tertiary` |
| `card/icon/foreground` | Icon foreground. | `icon/secondary` |

Token gap: отдельные component tokens для padding, gap, radius, shadow и media aspect ratio пока не выделены. До появления таких tokens используйте foundation spacing/layout rules и не добавляйте новые token names в spec без token architecture review.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Variant | `variant` | `default`, `clickable`, `selectable`, `elevated`, `media`, `compact`. |
| Size | `size` | `compact`, `medium`, `large`. |
| Selected | `selected` | Только для selectable scenarios. |
| Disabled | `disabled` | Отключает интерактивность. |
| Loading | `loading` | Показывает Skeleton structure. |
| Title | `title` или slot | Заголовок объекта. |
| Description | `description` или slot | Краткое описание. |
| Metadata | `metadata` или slot | Secondary information. |
| Actions | `actions` slot | Нативные controls. |
| Click | `href`, `onClick` | Только если вся Card выполняет одно действие. |
| Semantic element | `as` | `article`, `section`, `li`, `a`, `button` или neutral container по смыслу. |
| Aspect ratio | `mediaAspectRatio` | Stable ratio для media slot, если media используется. |
| Line clamp | `titleLines`, `descriptionLines` | Ограничение строк в коллекциях cards. |
| Interactive strategy | `interactiveStrategy` | `whole-card`, `actions-only`, `selectable`; не смешивать без review. |

### Contract rules

- `href` и `onClick` не должны использоваться одновременно.
- `interactiveStrategy="whole-card"` запрещает независимые buttons/links внутри Card без system review.
- `interactiveStrategy="actions-only"` означает, что surface Card не получает hover/focus как click target.
- `selectable` Card должна иметь явный selection control или доступный composite pattern.
- `mediaAspectRatio` обязателен для media grids, чтобы избежать layout shift.
- `as` должен соответствовать смыслу: navigation Card рендерится как link, action Card как button, content Card как `article`/`section`.
- Card не должна быть page-section wrapper по умолчанию; для этого используется layout layer.

---

## 10. Handoff notes

Handoff для Card должен фиксировать:

- variant, size и layout context;
- какие слоты используются и какие обязательны;
- clickable/selectable behavior;
- semantic element (`as`) и interactive strategy;
- keyboard rules для интерактивной Card;
- truncation rules для title, description и metadata;
- media aspect ratio и loading fallback;
- empty/loading/error states;
- внутренние actions и конфликт с Card click target;
- token mapping и известные token gaps.

---

## 11. Acceptance criteria

- [ ] Card группирует один объект или один смысловой блок.
- [ ] В коллекции cards порядок слотов согласован.
- [ ] Clickable Card доступна с клавиатуры и имеет focus ring.
- [ ] Semantic element соответствует поведению Card.
- [ ] `href` и `onClick` не конфликтуют.
- [ ] Внутренние actions не конфликтуют с кликом по Card.
- [ ] Interactive strategy явно задана для clickable/selectable cards.
- [ ] Selection state доступен не только через цвет.
- [ ] Media slot имеет stable aspect ratio.
- [ ] Title, description и metadata имеют line clamp rules в коллекциях cards.
- [ ] Empty/loading/error states описаны.
- [ ] Token mapping соответствует documented Card component tokens из `tokens.json`.
- [ ] Card не используется как декоративная оболочка для всей страницы.

---

## 12. AI usage rules

AI может:

- предложить структуру Card для конкретной сущности;
- проверить, не используется ли Card как декоративный wrapper;
- подготовить state matrix и handoff notes;
- найти конфликт между clickable Card и внутренними actions;
- предложить truncation и loading rules.
- определить, какая interactive strategy нужна: `whole-card`, `actions-only` или `selectable`;
- проверить, не нужна ли вместо Card таблица, список, Container или отдельная страница.

AI не должен:

- вкладывать Cards друг в друга без system review;
- делать всю Card кликабельной, если внутри есть независимые actions;
- создавать новые token paths без `Token gap`;
- использовать Card вместо layout primitives;
- скрывать отсутствие empty/loading/error states.
- задавать `href` и `onClick` одновременно;
- делать Card page-section wrapper без содержательной сущности.

Если Card содержит полноценный workflow, длинную форму или несколько несвязанных сущностей, AI должен пометить сценарий как `Needs system review`.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Project Card с title, status, metadata и action. | Одна Card описывает один объект. |
| Selectable Card в выборе тарифа. | Selection является частью сценария и доступна. |
| Metric Card с кратким значением и подписью. | Компактный виджет имеет ясную структуру. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Card содержит несколько independent actions. | Не конфликтуют ли они с clickable behavior. |
| Card используется как фон для целой секции. | Нужен ли Container вместо Card. |
| В Card много разнородных блоков. | Не пора ли вынести сценарий на отдельную страницу. |

---

## 14. Anti-patterns

- Использовать Card как универсальную декоративную рамку.
- Вкладывать Card в Card.
- Делать всю Card кликабельной при наличии внутренних buttons/links без правил.
- Передавать selected state только цветом.
- Использовать произвольные colors, borders или shadows вместо documented Card component tokens.
- Оставлять media без aspect ratio и loading fallback.
- Смешивать несколько несвязанных сущностей в одной Card.
