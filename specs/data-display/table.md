# Table

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

Table — компонент для отображения структурированных данных в строках и столбцах. Он помогает сравнивать записи, сортировать, фильтровать, выбирать строки и выполнять действия над объектами.

В SEDA AI Table рассматривается как data interaction pattern. Таблица должна иметь явную модель колонок, состояний, пустых/загрузочных сценариев, доступности и handoff-контрактов.

### Когда использовать

Используйте Table, когда:

- нужно сравнить несколько объектов по нескольким атрибутам;
- пользователю нужны сортировка, фильтрация, выбор строк или bulk actions;
- данные должны сканироваться по колонкам;
- есть стабильная структура записей;
- важны density, выравнивание чисел, статусы и действия в строках.

### Не используйте

Не используйте Table, когда:

- у объекта 1-2 атрибута — используйте list, [Card](../specs/data-display/card.md) или [Description List](../specs/data-display/description-list.md);
- нужно показать отношения и тренды — используйте chart или специализированный data visualization;
- данные лучше читаются как карточки на mobile;
- таблица превращается в форму с большим количеством inline editing;
- нет empty, loading и error states.

### Основные принципы

- **Columns define meaning** — каждая колонка имеет назначение, тип данных и правила сортировки.
- **Rows are objects** — одна строка соответствует одной записи или одному group row.
- **Density is intentional** — compact mode повышает плотность, но не ломает читаемость.
- **Selection is explicit** — выбор строк делается через checkbox/selection control, а не только через цвет.
- **Empty is designed** — отсутствие данных показывает понятное empty state.
- **AI drafts, human validates** — AI может описать column model и states, но человек проверяет data semantics и accessibility.

### Связанные спецификации

- [Checkbox](../specs/inputs/checkbox.md) — row selection и select all.
- [Search](../specs/overlays-layout/search.md) — поиск в toolbar.
- [Dropdown Menu](../specs/overlays-layout/dropdown-menu.md) — row actions и column actions.
- [Pagination](../specs/navigation/pagination.md) — навигация по страницам данных.
- [Empty State](../specs/feedback/empty-state.md) — отсутствие строк.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `toolbar` | Нет | Search, filters, bulk actions, view controls. |
| `table` | Да | Основной контейнер данных. |
| `header` | Да | Названия колонок и controls сортировки. |
| `row` | Да | Одна запись данных. |
| `cell` | Да | Значение в колонке. |
| `selection-control` | Условно | Checkbox для выбора строк. |
| `row-actions` | Нет | Действия над строкой. |
| `expanded-content` | Нет | Дополнительный контент раскрытой строки. |
| `footer` | Нет | Pagination, totals, summary. |
| `empty-state` | Да | Состояние без данных. |
| `loading-state` | Да | Загрузка данных или обновление таблицы. |

### Правила анатомии

- Header обязателен, если данные представлены как таблица.
- Toolbar не должен заменять header или row actions.
- Selection column размещается первой и имеет select-all control в header.
- Actions column размещается последней и не участвует в сортировке.
- Empty/loading state должен занимать область таблицы, а не исчезать вместе с контейнером.

---

## 3. Types / Variants / Варианты

### Table variants

| Variant | Когда использовать | Правило |
|---|---|---|
| `default` | Базовая таблица с header и rows. | Default. |
| `compact` | Плотные operational views. | Не уменьшать touch target ниже доступного минимума. |
| `striped` | Длинные таблицы с похожими строками. | Не использовать вместо hover/selected state. |
| `bordered` | Данные требуют сильного разделения колонок. | Не перегружать визуальный шум. |
| `fixed-header` | Много строк и вертикальный scroll. | Header остается связанным с колонками. |
| `selectable` | Row selection и bulk actions. | Нужны checkbox и selected state. |
| `expandable` | Строки раскрывают дополнительную информацию. | Expanded content не заменяет detail page. |

### Cell types

| Cell type | Назначение | Правило |
|---|---|---|
| `text` | Обычные текстовые значения. | Truncation rules обязательны для длинного текста. |
| `numeric` | Числа, суммы, проценты. | Выравнивание и формат задаются column model. |
| `status` | Status text или Badge. | Не передавать статус только цветом. |
| `avatar` | Пользователь или команда. | Нужен text label рядом или accessible name. |
| `actions` | Row actions. | Не сортируется и не выбирается как данные. |
| `custom` | Специальный контент. | Требует handoff и accessibility review. |

---

## 4. Sizes / Размеры

| Size | Row height | Контекст |
|---|---:|---|
| `compact` | 32-36px | Плотные таблицы с большим количеством строк. |
| `medium` | 40-44px | Default для рабочих интерфейсов. |
| `comfortable` | 48-56px | Таблицы с avatar, secondary text или touch usage. |

### Правила размеров

- Размер строки должен быть стабильным в рамках одной таблицы.
- Cell padding задается density-паттерном, а не локальными отступами.
- Interactive controls внутри cell должны сохранять доступную hit area.
- Если строка содержит многострочный контент, column model должен описывать max lines.
- На mobile таблица может переходить в card/list representation, если горизонтальный scroll ломает сценарий.

---

## 5. States / Состояния

| Состояние | Где применяется | Правило |
|---|---|---|
| `default` | Table, header, row, cell. | Базовая поверхность и текст. |
| `hover` | Header или row. | Показывает интерактивность сортировки или строки. |
| `active` | Header или row. | Краткий feedback при нажатии. |
| `sorted` | Header cell. | Направление сортировки озвучивается через `aria-sort`. |
| `selected` | Row. | Selection control и row surface синхронизированы. |
| `expanded` | Row. | Expanded content связан с row trigger. |
| `disabled` | Row, header action или cell action. | Неактивные controls имеют disabled semantics. |
| `loading` | Table или row. | Данные заменяются Skeleton/Spinner по контексту. |
| `empty` | Table body. | Показывается Empty State с действием, если уместно. |
| `error` | Table body или toolbar. | Ошибка загрузки не маскируется пустым состоянием. |

---

## 6. Behavior / Поведение

### Sorting

- Sortable header является button-like control.
- Цикл сортировки задается продуктом: обычно `none` -> `ascending` -> `descending`.
- Активная сортировка отражается через `aria-sort`.
- Multi-sort допустим только при явном handoff и visual indication.

### Row selection

- Selectable table использует checkbox в первой колонке.
- Header checkbox поддерживает `checked`, `unchecked` и `indeterminate`.
- Bulk actions появляются только при наличии выбранных строк.
- Selected state не должен передаваться только цветом.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` | Переход между интерактивными элементами таблицы. |
| `Enter` | Активирует sortable header, row action или row trigger. |
| `Space` | Переключает checkbox или button-like row. |
| `Escape` | Закрывает открытое row action menu или expanded content, если применимо. |

### Data states

- Loading state должен сохранять размеры таблицы.
- Empty state объясняет, почему данных нет, и предлагает следующее действие, если оно есть.
- Error state показывает retry или путь восстановления.
- Pagination не показывается как активная, если данных нет.

---

## 7. Accessibility

| Элемент | Семантика | Правило |
|---|---|---|
| Table | Нативный `<table>` предпочтителен. | Используйте ARIA grid только при сложной интерактивности. |
| Header cell | `<th scope="col">` | Каждая колонка имеет заголовок. |
| Sortable header | Button внутри header или доступный control. | `aria-sort` отражает состояние. |
| Row selection | Checkbox. | Label связывает checkbox со строкой. |
| Expanded row | `aria-expanded`, `aria-controls`. | Trigger и expanded content связаны. |
| Empty/loading/error | Текстовый status. | Screen reader получает понятный результат. |

### Accessibility checklist

- [ ] Все колонки имеют понятные заголовки.
- [ ] Sort state озвучивается через `aria-sort`.
- [ ] Selection доступен с клавиатуры и screen reader.
- [ ] Numeric values имеют понятный формат и выравнивание.
- [ ] Empty/loading/error states представлены текстом.
- [ ] Row actions имеют accessible names.
- [ ] Горизонтальный scroll не скрывает ключевые actions без альтернативы.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Table доступны component tokens в namespace `table`.

### Header и row

| Component token | Роль | Semantic token |
|---|---|---|
| `table/header/surface/default` | Фон header. | `surface/subtle` |
| `table/header/surface/hover` | Фон sortable header при hover. | `container/neutral/hover` |
| `table/header/surface/active` | Фон sortable header при active. | `container/neutral/pressed` |
| `table/header/foreground/default` | Текст header. | `text/secondary` |
| `table/header/foreground/hover` | Текст header при hover. | `text/primary` |
| `table/header/foreground/sorted` | Текст sorted header. | `text/primary` |
| `table/header/foreground/disabled` | Disabled header text. | `status/disabled/text` |
| `table/header/border/bottom` | Нижняя граница header. | `border/default` |
| `table/row/border/default` | Граница строки. | `border/subtle` |
| `table/row/border/selected` | Граница selected row. | `border/selected` |
| `table/row/border/focus` | Граница focus row. | `border/focus` |
| `table/row/surface/default` | Фон row. | `surface/base` |
| `table/row/surface/hover` | Фон row hover. | `container/neutral/hover` |
| `table/row/surface/active` | Фон row active. | `container/neutral/pressed` |
| `table/row/surface/selected` | Фон selected row. | `container/neutral/selected` |
| `table/row/surface/striped` | Фон striped row. | `surface/subtle` |
| `table/row/surface/disabled` | Фон disabled row. | `status/disabled/container` |
| `table/row/surface/expanded` | Фон expanded row. | `surface/subtle` |

### Cell, sort и selection

| Component token | Роль | Semantic token |
|---|---|---|
| `table/cell/foreground/default` | Основной текст cell. | `text/primary` |
| `table/cell/foreground/secondary` | Secondary cell text. | `text/secondary` |
| `table/cell/foreground/tertiary` | Tertiary cell text. | `text/tertiary` |
| `table/cell/foreground/muted` | Muted cell text. | `text/muted` |
| `table/cell/foreground/disabled` | Disabled cell text. | `status/disabled/text` |
| `table/cell/foreground/numeric` | Numeric cell text. | `text/primary` |
| `table/cell/icon/default` | Cell icon. | `icon/tertiary` |
| `table/cell/icon/active` | Active cell icon. | `icon/primary` |
| `table/cell/icon/disabled` | Disabled cell icon. | `status/disabled/icon` |
| `table/sort/icon/default` | Sort icon default. | `icon/tertiary` |
| `table/sort/icon/hover` | Sort icon hover. | `icon/secondary` |
| `table/sort/icon/sorted` | Sort icon sorted. | `icon/primary` |
| `table/sort/foreground/sorted` | Sorted header foreground. | `text/primary` |
| `table/selection/control/surface/default` | Checkbox surface. | `color/transparent` |
| `table/selection/control/surface/hover` | Checkbox hover surface. | `container/neutral/hover` |
| `table/selection/control/surface/checked` | Checkbox checked surface. | `container/brand/default` |
| `table/selection/control/border/default` | Checkbox border. | `border/default` |
| `table/selection/control/border/checked` | Checkbox checked border. | `border/brand/default` |
| `table/selection/control/icon/checked` | Checkbox checked icon. | `text/on-brand/primary` |

### Status и data states

| Component token | Роль | Semantic token |
|---|---|---|
| `table/status/info/foreground` | Info status text. | `status/info/text` |
| `table/status/success/foreground` | Success status text. | `status/success/text` |
| `table/status/warning/foreground` | Warning status text. | `status/warning/text` |
| `table/status/danger/foreground` | Danger status text. | `status/danger/text` |
| `table/surface/default` | Общая поверхность table. | `surface/base` |
| `table/surface/loading` | Поверхность loading state. | `surface/base` |
| `table/surface/empty` | Поверхность empty state. | `surface/base` |
| `table/empty/foreground/title` | Empty title. | `text/primary` |
| `table/empty/foreground/description` | Empty description. | `text/secondary` |
| `table/loading/surface` | Loading surface. | `surface/base` |
| `table/loading/foreground` | Loading text. | `text/secondary` |
| `table/loading/spinner` | Loading spinner. | `icon/brand` |
| `table/focus/ring` | Focus ring. | `focus/ring` |

Token gap: отдельные component tokens для row height, cell padding, sticky shadow, column resize handle и gridline width пока не выделены. До появления таких tokens используйте foundation spacing/layout rules.

---

## 9. Code mapping

| Concept | Prop / API | Правило |
|---|---|---|
| Columns | `columns` | Описывает key, header, type, width, sort и render. |
| Rows | `data` | Массив записей с устойчивым `rowKey`. |
| Density | `size` | `compact`, `medium`, `comfortable`. |
| Sorting | `sort`, `onSortChange` | Controlled state для сортировки. |
| Selection | `selectedRowKeys`, `onSelectionChange` | Controlled state для выбора. |
| Pagination | `pagination` | Page, pageSize, total, callbacks. |
| Loading | `loading` | Показывает loading state без потери layout. |
| Empty | `emptyState` | Настраиваемый empty content. |
| Row actions | `rowActions` | Действия строки через menu/buttons. |
| Expandable | `expandedRowKeys`, `onExpandedChange` | Для expandable rows. |

---

## 10. Handoff notes

Handoff для Table должен фиксировать:

- column model: key, header, type, width, alignment, sortability;
- row key и источник данных;
- density и responsive behavior;
- selection mode и bulk actions;
- sorting, filtering, pagination и loading states;
- empty/error state copy и actions;
- row actions и permissions;
- keyboard behavior;
- mobile representation;
- token mapping и token gaps.

---

## 11. Acceptance criteria

- [ ] Каждая колонка имеет назначение, header и type.
- [ ] Sorting state синхронизирован с `aria-sort`.
- [ ] Row selection работает через checkbox и доступен с клавиатуры.
- [ ] Empty/loading/error states описаны и не ломают layout.
- [ ] Numeric cells имеют согласованное выравнивание и формат.
- [ ] Row actions имеют accessible names.
- [ ] Mobile behavior описан для широких таблиц.
- [ ] Token mapping соответствует documented Table component tokens из `tokens.json`.

---

## 12. AI usage rules

AI может:

- предложить column model по структуре данных;
- проверить наличие sorting, selection, pagination и empty/loading/error states;
- подготовить handoff notes и acceptance criteria;
- найти случаи, где Card/List лучше Table.

AI не должен:

- создавать table columns без типа данных и правил форматирования;
- скрывать отсутствие empty/loading/error states;
- добавлять новые token paths без `Token gap`;
- заменять доступную row selection цветом;
- использовать Table для данных, которые лучше представить Cards или Description List.

Если таблица требует виртуализации, inline editing, complex grid navigation или permission-based actions, AI должен пометить сценарий как `Needs system review`.

---

## 13. Примеры

### Корректно

| Сценарий | Почему корректно |
|---|---|
| Список пользователей с ролью, статусом, датой и actions. | Есть несколько атрибутов и сравнение по колонкам. |
| Таблица транзакций с numeric alignment и сортировкой по дате. | Данные структурированы и требуют сканирования. |
| Selectable table для bulk actions. | Выбор строк является частью workflow. |

### Требует проверки

| Сценарий | Что проверить |
|---|---|
| Таблица на mobile с 8 колонками. | Нужна ли card/list representation. |
| Inline editing в каждой ячейке. | Не нужен ли специализированный grid pattern. |
| Таблица без строк после фильтра. | Есть ли empty state и clear filters action. |

---

## 14. Anti-patterns

- Использовать Table для 1-2 атрибутов.
- Скрывать empty state и показывать пустую сетку.
- Делать selection только цветом строки.
- Размещать важные actions только за горизонтальным scroll.
- Использовать произвольные colors вместо documented Table component tokens.
- Добавлять columns без правил форматирования, сортировки и responsive behavior.
