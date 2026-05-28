# Table

> **Category** · Data Display
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Table](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=2617-2104)

---

## 1. Key Principles / Принципы использования

### Что это

Table — компонент для отображения структурированных данных в строках и колонках. Он помогает сравнивать записи, сортировать, фильтровать, выбирать строки, раскрывать детали и выполнять действия над объектами.

В SEDA AI Table является data interaction contract: он должен явно описывать column model, row model, sorting, selection, pagination, loading/empty/error states, token mapping, accessibility и handoff. AI может помогать проектировать структуру таблицы, но не должен выдумывать колонки, токены, состояния или интерактивное поведение без правил.

Как часть AI-ready design system framework, Table должен быть пригоден для безопасного AI-assisted product development: AI может предложить черновик columns и states, но каждая колонка, action, permission rule и data transformation должны иметь владельца и проверяемый handoff.

### Когда использовать

Используйте Table, когда:

- нужно сравнить несколько объектов по нескольким атрибутам;
- данные должны сканироваться по колонкам;
- нужны sorting, filtering, pagination, row selection или bulk actions;
- каждая row соответствует одной записи или group row;
- важны numeric alignment, statuses, row actions и плотность данных;
- пользователю нужно принимать решения на основе набора записей.

### Не используйте

Не используйте Table, когда:

- у объекта 1-2 атрибута — используйте List, [Card](card.md), [Description List](description-list.md) или [Property List](property-list.md);
- нужно показать relation или trend — используйте Chart или специализированный data visualization pattern;
- данные лучше читаются как cards на mobile и сравнение по колонкам не нужно;
- таблица превращается в сложную форму с большим количеством inline editing;
- нет empty, loading и error states;
- набор данных не имеет стабильной row/column структуры.

### Основные принципы

- **Columns define meaning** — каждая колонка имеет key, header, type, width, alignment и formatting rule.
- **Rows are objects** — одна row соответствует одной записи, group row или summary row.
- **Density is intentional** — compact mode повышает плотность, но не ломает читаемость и hit areas.
- **Selection is explicit** — row selection делается через checkbox/control, а не только цветом.
- **Data states are designed** — loading, empty и error states не должны ломать layout.
- **Mobile is a contract** — широкий набор колонок требует documented responsive behavior.
- **AI assists, system governs** — AI может предложить column model, но использует только documented props, states и tokens.

### Связанные спецификации

- [Checkbox](../inputs/checkbox.md) — row selection и select all.
- [Search](../overlays-layout/search.md) — поиск в toolbar.
- [Dropdown Menu](../overlays-layout/dropdown-menu.md) — row actions и column actions.
- [Pagination](../navigation/pagination.md) — навигация по страницам данных.
- [Empty State](../feedback/empty-state.md) — отсутствие строк.
- [Skeleton](../feedback/skeleton.md) — loading rows.

---

## 2. Anatomy / Анатомия

| Slot | Обязательность | Описание |
|---|---:|---|
| `toolbar` | Нет | Search, filters, bulk actions, view controls. |
| `table` | Да | Основной контейнер данных. |
| `header` | Да | Названия колонок и controls сортировки. |
| `row` | Да | Одна запись данных. |
| `cell` | Да | Значение в колонке. |
| `selectionControl` | Условно | Checkbox для выбора row или select all. |
| `rowActions` | Нет | Действия над строкой. |
| `expandedContent` | Нет | Дополнительная информация раскрытой строки. |
| `footer` | Нет | Pagination, totals, summary. |
| `emptyState` | Да | Состояние без данных. |
| `loadingState` | Да | Загрузка данных или обновление таблицы. |
| `errorState` | Да | Ошибка загрузки или обновления. |

### Правила анатомии

- Header обязателен, если данные представлены как table.
- Toolbar не заменяет header или row actions.
- Selection column размещается первой и имеет select-all control в header.
- Actions column размещается последней и не участвует в sorting как data column.
- Empty/loading/error state занимает область table body и сохраняет геометрию контейнера.
- Expanded content не должен заменять detail page, если данных слишком много.

---

## 3. Types / Variants / Варианты

### Table variants

| Variant | Когда использовать | Правило |
|---|---|---|
| `default` | Базовая таблица с header и rows. | Default. |
| `compact` | Плотные operational views. | Не уменьшать доступную hit area controls. |
| `striped` | Длинные таблицы с похожими строками. | Не заменяет hover/selected state. |
| `bordered` | Данные требуют сильного разделения колонок. | Использовать осторожно, чтобы не создать visual noise. |
| `fixedHeader` | Много строк и vertical scroll. | Header остается связанным с колонками. |
| `selectable` | Row selection и bulk actions. | Нужны checkbox и selected state. |
| `expandable` | Строки раскрывают дополнительную информацию. | Expanded content связан с trigger через ARIA. |

### Data contract

| Contract | Обязательность | Правило |
|---|---:|---|
| `rowKey` | Да | Стабильный id строки для selection, expansion, updates и analytics. |
| `columns[].key` | Да | Стабильный id колонки, не зависящий от локализованного header. |
| `columns[].header` | Да | Видимое название колонки. |
| `columns[].type` | Да | `text`, `numeric`, `status`, `date`, `link`, `actions` или documented custom type. |
| `columns[].align` | Условно | Особенно важно для numeric/date/status columns. |
| `columns[].format` | Условно | Даты, деньги, проценты и units форматируются по правилу, а не вручную. |
| `columns[].sortable` | Условно | Sort behavior должен иметь owner: client или server. |
| `columns[].responsive` | Условно | Hide, pin, wrap, truncate или transform to card/list. |

### Cell types

| Cell type | Назначение | Правило |
|---|---|---|
| `text` | Обычное текстовое значение. | Нужны truncation и full-value access для длинного текста. |
| `numeric` | Числа, суммы, проценты. | Alignment и formatting задаются column model. |
| `status` | Status text, Tag или Badge. | Статус не передается только цветом. |
| `avatar` | Пользователь, команда или actor. | Нужен text label или accessible name. |
| `link` | Переход к объекту или ресурсу. | Используйте Link semantics. |
| `actions` | Row actions. | Не сортируется и не выбирается как data. |
| `custom` | Специальный контент. | Требует handoff и accessibility review. |

---

## 4. Sizes / Размеры

| Size | Row height | Контекст |
|---|---:|---|
| `compact` | 32-36px | Плотные таблицы с большим количеством строк. |
| `medium` | 40-44px | Default для рабочих интерфейсов. |
| `comfortable` | 48-56px | Таблицы с avatar, secondary text или touch usage. |

### Правила размеров

- Row height должен быть стабильным внутри одной таблицы.
- Cell padding задается density pattern, а не локальными отступами.
- Interactive controls внутри cell должны сохранять доступную hit area.
- Если row содержит многострочный контент, column model должен описывать max lines.
- На mobile таблица может переходить в card/list representation, если horizontal scroll ломает сценарий.

---

## 5. States / Состояния

| State | Где применяется | Правило |
|---|---|---|
| `default` | Table, header, row, cell. | Базовая surface и text. |
| `hover` | Header или row. | Показывает интерактивность sorting или row action. |
| `active` | Header или row. | Краткий feedback при нажатии. |
| `sorted` | Header cell. | Direction озвучивается через `aria-sort`. |
| `selected` | Row. | Selection control и row surface синхронизированы. |
| `expanded` | Row. | Expanded content связан с row trigger. |
| `disabled` | Row, header action или cell action. | Disabled controls имеют disabled semantics. |
| `loading` | Table body или row. | Data заменяется Skeleton/Spinner по контексту. |
| `empty` | Table body. | Показывается Empty State с действием, если уместно. |
| `error` | Table body или toolbar. | Ошибка загрузки не маскируется пустым состоянием. |

### State ownership

- Header владеет sorting states.
- Selection column владеет selected state.
- Row actions владеют action states и menus.
- Empty/loading/error states относятся к data source, а не к отдельной cell.
- Status внутри cell должен использовать Tag, Badge или текстовый status pattern.

---

## 6. Behavior / Поведение

### Sorting

- Sortable header является button-like control.
- Sort cycle задается продуктом: обычно `none` -> `ascending` -> `descending`.
- Active sorting отражается через `aria-sort`.
- Multi-sort допустим только при явном handoff и visual indication.
- Sort state должен быть controlled, если данные приходят с сервера.

### Row selection

- Selectable table использует checkbox в первой колонке.
- Header checkbox поддерживает `checked`, `unchecked` и `indeterminate`.
- Bulk actions появляются только при наличии выбранных rows.
- Selected state не должен передаваться только цветом.
- Selection across pages требует отдельного product rule.

### Row actions and expansion

- Row actions должны иметь accessible names.
- Actions column не должна мешать horizontal scroll и key data columns.
- Expanded row trigger использует `aria-expanded` и `aria-controls`.
- Expanded content должен быть связан с row и закрываться предсказуемо.
- Если action зависит от permissions, disabled/hidden behavior описывается в handoff.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Переход между интерактивными элементами таблицы. |
| `Enter` | Активирует sortable header, row action или row trigger. |
| `Space` | Переключает checkbox или button-like row control. |
| `Escape` | Закрывает row action menu или expanded content, если применимо. |

### Data states

- Loading state должен сохранять размеры table.
- Empty state объясняет, почему данных нет, и предлагает следующее действие, если оно есть.
- Error state показывает retry или путь восстановления.
- Pagination не показывается как активная, если данных нет.
- Filtered empty state должен отличаться от true empty state.

### Server/client ownership

| Feature | Client-owned | Server-owned |
|---|---|---|
| Sorting | Малый локальный dataset, stable client data. | Большие списки, pagination, permissions, remote data. |
| Filtering | Простые локальные фильтры. | Фильтры, влияющие на запрос или доступность данных. |
| Pagination | Локальный split известного массива. | Page/pageSize/total приходят из API. |
| Selection | Текущая страница или локальная выборка. | Selection across pages, bulk operations, permissions. |
| Formatting | UI formatting без изменения значения. | Business formatting, currency, timezone, masking rules. |

---

## 7. Accessibility

Table должен следовать [foundation/accessibility.md](../../foundation/accessibility.md). Нативный `<table>` предпочтителен; ARIA grid используется только при сложной интерактивности, которая действительно требует grid navigation.

| Элемент | Семантика | Правило |
|---|---|---|
| Table | Native `<table>` или documented grid. | Не использовать `div`-table без semantics. |
| Header cell | `<th scope="col">`. | Каждая колонка имеет понятный header. |
| Sortable header | Button внутри header или доступный control. | `aria-sort` отражает состояние. |
| Row selection | Checkbox. | Label связывает checkbox со строкой. |
| Expanded row | `aria-expanded`, `aria-controls`. | Trigger и expanded content связаны. |
| Empty/loading/error | Text status. | Screen reader получает понятный результат. |
| Numeric cells | Читаемый формат. | Выравнивание визуальное, смысл текстовый. |

### Accessibility checklist

- [ ] Все колонки имеют понятные headers.
- [ ] Sort state озвучивается через `aria-sort`.
- [ ] Selection доступен с клавиатуры и screen reader.
- [ ] Numeric values имеют понятный формат и alignment.
- [ ] Empty/loading/error states представлены текстом.
- [ ] Row actions имеют accessible names.
- [ ] Horizontal scroll не скрывает key actions без альтернативы.
- [ ] Mobile representation сохраняет связь label/value.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Table доступны component tokens в namespace `table`.

### Header и row

| Component token | Роль | Semantic mapping |
|---|---|---|
| `table/header/surface/default` | Header surface. | `surface/subtle` |
| `table/header/surface/hover` | Sortable header hover surface. | `container/neutral/hover` |
| `table/header/surface/active` | Sortable header active surface. | `container/neutral/pressed` |
| `table/header/foreground/default` | Header text. | `text/secondary` |
| `table/header/foreground/hover` | Header text on hover. | `text/primary` |
| `table/header/foreground/sorted` | Sorted header text. | `text/primary` |
| `table/header/foreground/disabled` | Disabled header text. | `status/disabled/text` |
| `table/header/border/bottom` | Header bottom border. | `border/default` |
| `table/header/icon/default` | Header icon. | `icon/tertiary` |
| `table/header/icon/hover` | Header icon hover. | `icon/secondary` |
| `table/header/icon/sorted` | Header icon sorted. | `icon/primary` |
| `table/header/icon/disabled` | Disabled header icon. | `status/disabled/icon` |
| `table/row/border/default` | Row border. | `border/subtle` |
| `table/row/border/selected` | Selected row border. | `border/selected` |
| `table/row/border/focus` | Focus row border. | `border/focus` |
| `table/row/surface/default` | Row surface. | `surface/base` |
| `table/row/surface/hover` | Row hover surface. | `container/neutral/hover` |
| `table/row/surface/active` | Row active surface. | `container/neutral/pressed` |
| `table/row/surface/selected` | Selected row surface. | `container/neutral/selected` |
| `table/row/surface/striped` | Striped row surface. | `surface/subtle` |
| `table/row/surface/disabled` | Disabled row surface. | `status/disabled/container` |
| `table/row/surface/expanded` | Expanded row surface. | `surface/subtle` |

### Cell, sort и selection

| Component token | Роль | Semantic mapping |
|---|---|---|
| `table/cell/foreground/default` | Main cell text. | `text/primary` |
| `table/cell/foreground/secondary` | Secondary cell text. | `text/secondary` |
| `table/cell/foreground/tertiary` | Tertiary cell text. | `text/tertiary` |
| `table/cell/foreground/muted` | Muted cell text. | `text/muted` |
| `table/cell/foreground/disabled` | Disabled cell text. | `status/disabled/text` |
| `table/cell/foreground/numeric` | Numeric cell text. | `text/primary` |
| `table/cell/icon/default` | Cell icon. | `icon/tertiary` |
| `table/cell/icon/active` | Active cell icon. | `icon/primary` |
| `table/cell/icon/disabled` | Disabled cell icon. | `status/disabled/icon` |
| `table/cell/link/default` | Cell link. | `link/default` |
| `table/cell/link/hover` | Cell link hover. | `link/hover` |
| `table/cell/link/visited` | Cell link visited. | `link/visited` |
| `table/sort/icon/default` | Sort icon default. | `icon/tertiary` |
| `table/sort/icon/hover` | Sort icon hover. | `icon/secondary` |
| `table/sort/icon/active` | Sort icon active. | `icon/primary` |
| `table/sort/icon/sorted` | Sort icon sorted. | `icon/primary` |
| `table/sort/foreground/sorted` | Sorted header foreground. | `text/primary` |
| `table/selection/control/surface/default` | Checkbox surface. | `color/transparent` |
| `table/selection/control/surface/hover` | Checkbox hover surface. | `container/neutral/hover` |
| `table/selection/control/surface/checked` | Checkbox checked surface. | `container/brand/default` |
| `table/selection/control/border/default` | Checkbox border. | `border/default` |
| `table/selection/control/border/hover` | Checkbox border hover. | `border/hover` |
| `table/selection/control/border/checked` | Checkbox checked border. | `border/brand/default` |
| `table/selection/control/icon/checked` | Checkbox checked icon. | `text/on-brand/primary` |

### Status и data states

| Component token | Роль | Semantic mapping |
|---|---|---|
| `table/status/info/foreground` | Info status text. | `status/info/text` |
| `table/status/success/foreground` | Success status text. | `status/success/text` |
| `table/status/warning/foreground` | Warning status text. | `status/warning/text` |
| `table/status/danger/foreground` | Danger status text. | `status/danger/text` |
| `table/surface/default` | Table surface. | `surface/base` |
| `table/surface/loading` | Loading table surface. | `surface/base` |
| `table/surface/empty` | Empty table surface. | `surface/base` |
| `table/border/default` | Table border. | `border/default` |
| `table/border/strong` | Strong table border. | `border/strong` |
| `table/divider/default` | Default divider. | `border/subtle` |
| `table/divider/strong` | Strong divider. | `border/default` |
| `table/empty/foreground/title` | Empty title. | `text/primary` |
| `table/empty/foreground/description` | Empty description. | `text/secondary` |
| `table/loading/surface` | Loading surface. | `surface/base` |
| `table/loading/foreground` | Loading text. | `text/secondary` |
| `table/loading/spinner` | Loading spinner. | `icon/brand` |
| `table/focus/ring` | Focus ring. | `focus/ring` |

### Token gaps

- Row height, cell padding, sticky shadow, column resize handle, gridline width, pinned column shadow и responsive card representation пока не имеют отдельных Table component tokens.
- До появления таких tokens используйте foundation spacing/layout rules.
- Не придумывайте новые Table token paths без обновления `tokens.json` и Figma bindings.

---

## 9. Code mapping

| Spec concept | Code prop / attribute | Notes |
|---|---|---|
| Columns | `columns` | Описывает key, header, type, width, align, sort и render. |
| Rows | `data` | Массив записей со стабильным `rowKey`. |
| Row key | `rowKey` | Обязателен для selection, expansion и updates. |
| Density | `size` | Values: `compact`, `medium`, `comfortable`. |
| Sorting | `sort`, `onSortChange` | Controlled state для client/server sorting. |
| Filtering | `filters`, `onFiltersChange` | Обычно живет в toolbar. |
| Selection | `selectedRowKeys`, `onSelectionChange` | Controlled state для выбора rows. |
| Pagination | `pagination` | Page, pageSize, total, callbacks. |
| Loading | `loading` | Показывает loading state без потери layout. |
| Empty | `emptyState` | Настраиваемый empty content. |
| Error | `errorState`, `onRetry` | Ошибка загрузки или обновления. |
| Row actions | `rowActions` | Действия строки через menu/buttons. |
| Expandable | `expandedRowKeys`, `onExpandedChange` | Для expandable rows. |
| Responsive | `mobileMode` | Values: `scroll`, `cards`, `list`, `hiddenColumns`. |

### Contract rules

- Каждая column имеет `key`, `header` и `type`.
- Каждая row имеет стабильный `rowKey`.
- `columns[].type` должен задавать formatting, alignment и accessibility expectations.
- Sorting, filtering, selection и pagination должны быть controlled, если данные приходят с сервера.
- `rowActions` требуют permission/disabled rules.
- Raw colors и invented token props запрещены.

### Column model example

| Field | Example | Rule |
|---|---|---|
| `key` | `createdAt` | Stable id, не локализуется. |
| `header` | `Создано` | Видимый текст может локализоваться. |
| `type` | `date` | Определяет formatting и alignment. |
| `sortKey` | `created_at` | Нужен, если API использует другой ключ. |
| `width` | `160` или `minmax` rule | Не задавайте произвольную ширину без responsive rule. |
| `render` | `DateCell` | Custom render требует accessibility review. |

---

## 10. Handoff notes

Handoff для Table должен фиксировать:

- column model: key, header, type, width, alignment, sortability;
- row key и источник данных;
- density и responsive behavior;
- selection mode, select-all behavior и bulk actions;
- sorting, filtering, pagination и loading states;
- empty/error state copy и actions;
- row actions, permissions и disabled behavior;
- expandable rows и focus behavior;
- keyboard behavior;
- mobile representation;
- token mapping и token gaps.

---

## 11. Acceptance criteria

- [ ] Каждая колонка имеет key, header, type и formatting rule.
- [ ] Каждая row имеет стабильный `rowKey`.
- [ ] Sorting state синхронизирован с `aria-sort`.
- [ ] Row selection работает через checkbox и доступен с клавиатуры.
- [ ] Empty/loading/error states описаны и не ломают layout.
- [ ] Numeric cells имеют согласованное alignment и formatting.
- [ ] Row actions имеют accessible names и permission rules.
- [ ] Mobile behavior описан для широких таблиц.
- [ ] Используются реальные Table component tokens из `tokens.json`.
- [ ] Handoff описывает server/client ownership для sorting, filtering и pagination.

### Handoff table

| Design artifact | Code artifact | AI can help with | Human must validate |
|---|---|---|---|
| Column headers | `columns[].header` | Предложить названия и порядок. | Смысл, локализацию и business priority. |
| Data types | `columns[].type` | Выявить numeric/date/status/link columns. | Formatting, timezone, currency и masking. |
| Row actions | `rowActions` | Составить draft action list. | Permissions, disabled behavior и side effects. |
| Selection model | `selectedRowKeys` | Описать select all/indeterminate. | Selection across pages и bulk operation rules. |
| Data states | `loading`, `emptyState`, `errorState` | Подготовить copy и recovery actions. | Реальные API states и retry behavior. |
| Responsive mode | `mobileMode` | Предложить scroll/cards/hiddenColumns. | Потерю смысла при скрытии колонок. |

---

## 12. AI usage rules

AI может:

- предложить column model по структуре данных;
- проверить, нужен ли Table, Card/List, Description List, Property List или Chart;
- подготовить sorting, selection, pagination и data state rules;
- сформировать handoff notes и acceptance criteria;
- найти missing rowKey, missing column type, missing empty/loading/error state и accessibility gaps.

AI не должен:

- создавать columns без data type, formatting и sorting rules;
- скрывать отсутствие empty/loading/error states;
- добавлять новые token paths без `Token gap`;
- заменять доступную row selection цветом;
- использовать Table для данных, которые лучше представить Cards, Description List или Property List;
- придумывать row actions без permission, disabled и accessibility rules.

Если таблица требует virtualization, inline editing, complex grid navigation, permission-based actions или sensitive data masking, AI должен пометить сценарий как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Список пользователей с ролью, статусом, датой и actions. | Есть несколько атрибутов и сравнение по колонкам. |
| Таблица транзакций с numeric alignment и сортировкой по дате. | Данные структурированы и требуют сканирования. |
| Selectable table для bulk actions. | Выбор rows является частью workflow. |

### Требует review

| Сценарий | Что проверить |
|---|---|
| Таблица на mobile с 8 колонками. | Нужна card/list representation или hidden columns strategy. |
| Inline editing в каждой ячейке. | Возможно нужен специализированный grid pattern. |
| Таблица без строк после фильтра. | Нужен filtered empty state и clear filters action. |
| Sensitive data в columns. | Нужны masking, permissions и audit rules. |

---

## 14. Anti-patterns

- Использовать Table для 1-2 атрибутов.
- Скрывать empty state и показывать пустую сетку.
- Делать selection только цветом строки.
- Размещать важные actions только за horizontal scroll.
- Использовать произвольные colors вместо documented Table component tokens.
- Добавлять columns без правил formatting, sorting и responsive behavior.
- Показывать loading как layout shift.
