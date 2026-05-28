# Pagination

> **Category** · Navigation
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Pagination](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6213-202)

---

## 1. Key Principles

### Что это

Pagination — навигация по страницам набора данных. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует модель страниц, варианты, состояния, token mapping, accessibility, handoff и правила использования AI-assisted product development.

AI может помогать с расчетом window pages, empty/loading states, handoff notes и acceptance criteria, но не заменяет дизайнера и разработчика. Финальное решение по data contract, server/client ownership и доступности остаётся за человеком.

### Когда использовать

- Набор данных разбит на страницы и известны текущая страница, границы и правила перехода.
- Пользователь должен переходить к конкретной странице.
- В таблице, списке или каталоге важно сохранять позицию и URL/query.
- Есть server-side или client-side pagination contract.

### Когда не использовать

- Для бесконечной ленты — используйте infinite pattern или Load More.
- Для многошагового процесса — используйте Stepper.
- Для фильтров и режимов отображения — используйте Segmented Control.
- Если общее число страниц неизвестно и нет стратегии показа next/previous.

### Принципы

- **Data contract first** — page, pageSize, total и loading/error states должны быть известны.
- **Current page is explicit** — текущая страница видима и программно отмечена.
- **Edges are predictable** — first/last/prev/next disabled states вычисляются из границ.
- **Tokens before visuals** — item surface, foreground, border, icon и focus ring используют component tokens.
- **AI assists, system governs** — AI может проверить логику страниц, но не придумывает data contract.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер pagination navigation. |
| `list` | да | Группа page controls. |
| `pageItem` | для numbered | Переход на конкретную страницу. |
| `previous` | условно | Переход на предыдущую страницу. |
| `next` | условно | Переход на следующую страницу. |
| `first` | условно | Переход на первую страницу. |
| `last` | условно | Переход на последнюю страницу. |
| `ellipsis` | условно | Сокращение диапазона страниц. |
| `summary` | опционально | Текст о количестве элементов или диапазоне. |

### Правила anatomy

- Current page не должна быть обычной ссылкой без `aria-current`.
- Ellipsis не является интерактивным item, если не открывает jump menu.
- `previous`/`next` disabled states должны совпадать с границами данных.
- Summary должен соответствовать тем же данным, что и controls.

---

## 3. Types / Variants

Figma component set: `Pagination`. Node id: `6213:202`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| `Type` | `Numbered` | `Numbered`, `Prev-Next`, `First-Disabled`, `Last-Disabled` | Модель отображения controls. |
| `Size` | `s` | `s`, `m`, `l`, `xl` | Плотность и размер controls. |

### Type rules

| Type | Когда использовать | Ограничения |
| --- | --- | --- |
| `Numbered` | Нужно переходить к конкретной странице. | Требует total pages или window strategy. |
| `Prev-Next` | Достаточно последовательной навигации. | Нужно явно описать, известна ли последняя страница. |
| `First-Disabled` | Текущая страница у начала диапазона. | Disabled state должен быть вычислен, не задан вручную. |
| `Last-Disabled` | Текущая страница у конца диапазона. | Disabled state должен быть вычислен, не задан вручную. |

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `s` | Плотные таблицы и data grids. | Проверьте touch/focus target. |
| `m` | Основной размер для списков и таблиц. | Используйте как default. |
| `l` | Touch-oriented списки или крупные карточки. | Проверьте, что controls не занимают слишком много ширины. |
| `xl` | Редкие случаи с повышенной читаемостью. | Нужна проверка mobile overflow. |

Размер влияет на controls, но не меняет page calculation.

---

## 5. States

| State | Значение | Правило |
| --- | --- | --- |
| `default` | Page item доступен. | Ведёт на страницу или вызывает `onPageChange`. |
| `hover` | Pointer наведён на item. | Не должен выглядеть как selected. |
| `active` | Item нажимается. | Краткое interaction state. |
| `selected` | Текущая страница. | Должна быть одна и иметь `aria-current="page"`. |
| `disabled` | Переход невозможен. | Используется для first/prev на первой странице и next/last на последней. |
| `loading` | Идёт загрузка страницы. | Не меняйте current page до подтверждённого перехода, если данные ещё не пришли. |
| `error` | Загрузка страницы не удалась. | Покажите ошибку рядом с контентом списка/таблицы, не только в Pagination. |

---

## 6. Behavior

- `onPageChange` вызывается только для доступных page controls.
- Page state должен синхронизироваться с URL/query, если пользователь может делиться ссылкой.
- При изменении `pageSize`, фильтров или сортировки current page пересчитывается по правилу flow.
- Loading state должен блокировать повторные конфликтующие переходы или показывать optimistic strategy.
- При server-side pagination source of truth находится на сервере/API response.
- При client-side pagination source of truth находится в локальном dataset, но handoff всё равно должен описывать total.
- На mobile используйте сокращенный window pages или Prev/Next pattern.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Landmark | Используйте `nav` с `aria-label`, например "Pagination". |
| Current page | Current item получает `aria-current="page"`. |
| Button/link names | Page controls имеют имена вроде "Page 3", "Next page". |
| Disabled | Disabled controls не активируются с клавиатуры. |
| Keyboard | Все доступные controls достижимы через Tab. |
| Loading/error | Изменение страницы и ошибки объявляются через подходящий live region в контентной зоне. |

### Accessibility checklist

- [ ] Pagination имеет accessible name.
- [ ] Current page программно отмечена.
- [ ] Prev/Next/First/Last имеют понятные labels.
- [ ] Disabled controls не вызывают переход.
- [ ] Loading/error state доступен не только визуально.
- [ ] Mobile/short mode сохраняет возможность перейти назад и вперёд.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/pagination/surface/default` | Root surface default | `surface/base` |
| `$collections/components/$modes/Mode 1/pagination/surface/hover` | Root surface hover | `surface/subtle` |
| `$collections/components/$modes/Mode 1/pagination/surface/selected` | Root surface selected | `container/brand/default` |
| `$collections/components/$modes/Mode 1/pagination/foreground/default` | Foreground default | `text/secondary` |
| `$collections/components/$modes/Mode 1/pagination/foreground/selected` | Foreground selected | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/pagination/focus/ring` | Focus indicator | `focus/ring` |
| `$collections/components/$modes/Mode 1/pagination/disabled/foreground` | Disabled foreground | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/pagination/item/surface/default` | Item surface default | `color/transparent` |
| `$collections/components/$modes/Mode 1/pagination/item/surface/hover` | Item surface hover | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/pagination/item/surface/active` | Item surface active | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/pagination/item/surface/selected` | Item surface selected | `container/brand/default` |
| `$collections/components/$modes/Mode 1/pagination/item/surface/disabled` | Item surface disabled | `color/transparent` |
| `$collections/components/$modes/Mode 1/pagination/item/foreground/default` | Item text default | `text/secondary` |
| `$collections/components/$modes/Mode 1/pagination/item/foreground/hover` | Item text hover | `text/primary` |
| `$collections/components/$modes/Mode 1/pagination/item/foreground/selected` | Item text selected | `text/on-brand/primary` |
| `$collections/components/$modes/Mode 1/pagination/item/foreground/disabled` | Item text disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/pagination/item/border/default` | Item border default | `color/transparent` |
| `$collections/components/$modes/Mode 1/pagination/item/border/selected` | Item border selected | `border/brand/default` |
| `$collections/components/$modes/Mode 1/pagination/item/border/disabled` | Item border disabled | `color/transparent` |
| `$collections/components/$modes/Mode 1/pagination/item/icon/default` | Item icon default | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/pagination/item/icon/hover` | Item icon hover | `icon/primary` |
| `$collections/components/$modes/Mode 1/pagination/item/icon/disabled` | Item icon disabled | `status/disabled/icon` |

### Token gaps

- Если нужен отдельный token для ellipsis или compact mobile mode, фиксируйте `Token gap`.
- Не используйте raw colors для selected/current page.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Type | `type` | Маппится на Figma `Type`. |
| Size | `size` | Только `s`, `m`, `l`, `xl`. |
| Current page | `page` | Controlled state текущей страницы. |
| Page size | `pageSize` | Влияет на total pages и summary. |
| Total | `totalItems` / `totalPages` | Нужен для numbered и last page. |
| Change | `onPageChange` | Вызывается только для доступных controls. |
| Loading | `loading` | Блокирует или маркирует переходы по flow. |
| Boundary state | derived | First/prev/next/last disabled вычисляются из page и total. |

### Contract rules

- `page` должен быть 1-based или 0-based явно; не смешивайте подходы.
- Server-side и client-side ownership описываются в handoff.
- Unsupported jump controls, page-size selector или infinite mode помечаются как `Needs system review`.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `6213:202` | Позволяет сверить design/code mapping. |
| `Type`, `Size`, current page | Определяет вид и состояние. |
| `page`, `pageSize`, `totalItems`/`totalPages` | Нужны для data contract. |
| Server/client ownership | Определяет источник истины. |
| Boundary disabled rules | Нужны для first/prev/next/last. |
| Loading/error behavior | Предотвращает конфликтующие переходы. |
| URL/query sync | Важно для shareable state. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |

### Acceptance criteria

- Current page видима и программно отмечена.
- Disabled edges вычисляются из данных.
- `onPageChange` не вызывается для disabled controls.
- Loading/error states описаны для списка или таблицы.
- Page state синхронизирован с URL/query, если это требуется продуктом.
- AI-generated output не добавляет новые controls, variants или token names без review.

---

## 11. AI usage rules

- AI может предложить page window, boundary rules, loading/error behavior и handoff notes.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI не должен использовать Pagination вместо Stepper, Tabs или infinite pattern.
- AI не должен придумывать total pages, server contract, new controls или token names.
- AI обязан помечать missing data contract, unclear indexing, boundary gap и accessibility gap как `Needs system review`.
- AI может подготовить acceptance criteria, но человек утверждает data contract и UX flow.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| Numbered Pagination для таблицы с известным `totalItems`. | Пользователь может перейти к конкретной странице. |
| Prev/Next для результатов, где нужен только последовательный просмотр. | UI проще и соответствует data contract. |
| First/prev disabled на первой странице. | Boundary state вычислен из page. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Pagination при неизвестном total без стратегии next/previous. | Невозможно корректно показать границы. |
| Одновременно Pagination и infinite scroll. | Конфликт ментальных моделей. |
| Page numbers не синхронизированы с URL/query в shareable table. | Пользователь теряет состояние при перезагрузке или ссылке. |

---

## 13. Anti-patterns

- Использовать Pagination для step flow.
- Показывать current page только цветом.
- Хардкодить disabled first/last вместо вычисления из данных.
- Менять page index base между UI и API без mapping.
- Добавлять custom selected colors или compact controls без system review.
