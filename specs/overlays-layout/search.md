# Search

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · experimental / needs-review
> **Owner** · Kenymook
> **Last reviewed** · 2026-10-25 (React runtime; fresh Figma review unavailable)
> **Figma** · [Search](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6739-599)

---

## 1. Key Principles

### Что это

Search — паттерн поиска по данным, объектам, страницам или командам. В отличие от Text Field, Search описывает полный lifecycle: query, debounce, loading, results, no-results, error/retry, result selection и empty state.

В SEDA AI Search является частью AI-ready design system framework: spec связывает Figma variants, result structure, accessibility, tokens, handoff и AI usage rules. AI может помогать с drafts для no-results, ranking hints и acceptance criteria, но не утверждает search algorithm, source of truth и business ranking.

### Когда использовать

- Пользователь ищет объект, запись, страницу, команду или действие.
- Есть results list, no-results state и recovery path.
- Query может запускать локальный или remote search.
- Нужны `loading`, `results`, `no-results` states.
- Нужно выбрать result или перейти к найденному объекту.

### Когда не использовать

- Для простого однострочного ввода используйте [Text Field](../inputs/text-field.md).
- Для выбора из конечного списка используйте [Select](../inputs/select.md).
- Для команд без query используйте [Dropdown Menu](dropdown-menu.md).
- Не показывайте no-results без next action.
- Не используйте Search, если источник данных и ranking rules не определены.

### Ключевые принципы

- **Query has lifecycle** — empty, typing, loading, results и no-results имеют разные rules.
- **Results are structured** — result имеет id, title, optional subtitle/icon/highlight/action.
- **Recovery is mandatory** — no-results должен помогать изменить query или создать/перейти дальше.
- **AI assists, system governs** — AI может предложить copy и checks, но не ranking logic.
- **Tokens before visuals** — input, dropdown, result rows и highlights используют component tokens.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер Search pattern. |
| `search-input` | да | Поле query с search icon, clear action и focus state. |
| `placeholder` | опционально | Подсказка области поиска. |
| `clear` | опционально | Очистка query и results. |
| `dropdown` | условно | Results overlay для `overlay` и `command-palette`. |
| `section-title` | опционально | Группировка results. |
| `result` | условно | Найденный объект или команда. |
| `result-icon` | опционально | Тип объекта или действия. |
| `result-title` | да | Основной label результата. |
| `result-subtitle` | опционально | Контекст результата. |
| `highlight` | опционально | Подсветка совпадения query. |
| `empty/no-results` | условно | Состояние без результатов с recovery. |

Правила anatomy:

- Search input может использовать Text Field patterns, но Search отвечает за results lifecycle.
- Result не должен быть только icon или color.
- Highlight не должен быть единственным способом понять совпадение.
- Empty/no-results state должен иметь полезный текст или action.

---

## 3. Types / Variants

Figma component set: `Search`. Variants: 60.

| Property | Default | Options |
| --- | --- | --- |
| `variant` | `inline` | `inline`, `overlay`, `command-palette` |
| `state` | `empty` | `empty`, `typing`, `loading`, `results`, `no-results` |
| `size` | `s` | `s`, `m`, `l`, `xl` |

### Variant rules

| Variant | Когда использовать | Правило |
| --- | --- | --- |
| `inline` | Поиск внутри страницы или панели. | Results могут быть ниже input или обновлять контент страницы. |
| `overlay` | Поиск с раскрывающимся results panel. | Нужен open/close, focus return и outside click. |
| `command-palette` | Поиск команд, страниц или быстрых действий. | Нужны shortcuts, grouping и action semantics. |

### State rules

- `empty` — query пустой; можно показать recent/suggested только если это описано.
- `typing` — query меняется; results могут быть stale или скрыты.
- `loading` — запрос выполняется; пользователь понимает, что поиск идет.
- `results` — есть результаты с keyboard selection.
- `no-results` — результатов нет; есть recovery path.

Если нужен server error state, permission state, recent searches или saved filters, пометьте как `Needs system review`, пока это не описано в component set.

---

## 4. Sizes

| Size | Контекст | Правило |
| --- | --- | --- |
| `s` | Dense panels, tables, toolbar search. | Result row не должен терять readable title. |
| `m` | Базовый page search. | Рекомендуемый default. |
| `l` | Prominent search в settings или catalog. | Подходит для большего placeholder и clearer affordance. |
| `xl` | Touch-first или command palette. | Input и result rows сохраняют touch target. |

Size управляет input и result density. Не смешивайте size input и result rows без handoff.

---

## 5. States

| State | Query | Results area |
| --- | --- | --- |
| `empty` | Query пустой. | Можно показать placeholder, recent или suggestions. |
| `typing` | Пользователь меняет query. | Debounce/threshold описаны в handoff. |
| `loading` | Query отправлен. | Показывается loading indicator или skeleton. |
| `results` | Есть results. | Active result доступен с клавиатуры. |
| `no-results` | Нет matches. | Есть recovery: изменить query, очистить filters, создать объект. |

State ownership:

- Search component отвечает за visual state и keyboard movement.
- Parent/data layer отвечает за search source, debounce, ranking, permissions и async errors.
- Product logic отвечает за navigation или action после result selection.

---

## 6. Behavior

### Query lifecycle

- Query starts после минимальной длины или сразу, если это command palette.
- Debounce value фиксируется в handoff для remote search.
- Clear action очищает query и возвращает Search в `empty`.
- Stale results не должны выглядеть как актуальные, если идет новый request.
- Search terms не должны отправляться в analytics без privacy review.

### Results behavior

- Result selection выполняет navigation, command или value selection; тип действия фиксируется в handoff.
- Results имеют stable id и label.
- Ranking rules не должны быть скрыты от команды, если они влияют на UX.
- Grouping допустим только при понятных section titles.
- No-results copy должен помогать: проверить запрос, изменить фильтры, создать объект или перейти в расширенный поиск.

### Keyboard

| Key | Поведение |
| --- | --- |
| `Tab` | Переходит в Search input или следующий focusable control. |
| `ArrowDown` / `ArrowUp` | Перемещает active result. |
| `Enter` | Выбирает active result или запускает search action. |
| `Esc` | Закрывает overlay/command-palette или очищает active result по правилу handoff. |
| `Ctrl/Command+K` | Может открывать command-palette, если shortcut задокументирован. |

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Accessible name | Search input имеет label или `aria-label`. |
| Results relationship | Input связан с results list через `aria-controls` или equivalent. |
| Loading | Loading state объявляется, если результат не мгновенный. |
| Result count | Количество результатов может быть объявлено для screen reader. |
| Active result | Keyboard active result программно определен. |
| No-results | Сообщение no-results доступно как текст. |
| Highlight | Совпадение query не передается только цветом. |
| Command palette | Dialog/overlay semantics и focus trap описаны, если используется modal behavior. |

Accessibility checklist:

- [ ] Search input имеет accessible name.
- [ ] Results доступны с клавиатуры.
- [ ] Active result и selected result не различаются только цветом.
- [ ] Loading/no-results states имеют текст.
- [ ] Overlay возвращает focus после закрытия.
- [ ] Shortcut, если есть, не конфликтует с platform shortcuts.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`. Для Search используются component tokens из namespace `search`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/search/input/surface` | Search input surface. | `surface/base` |
| `$collections/components/$modes/Mode 1/search/input/border/default` | Input border. | `border/default` |
| `$collections/components/$modes/Mode 1/search/input/border/focus` | Input focus border. | `border/focus` |
| `$collections/components/$modes/Mode 1/search/input/border/hover` | Input hover border. | `border/hover` |
| `$collections/components/$modes/Mode 1/search/input/foreground/default` | Query text. | `text/primary` |
| `$collections/components/$modes/Mode 1/search/input/foreground/placeholder` | Placeholder. | `text/muted` |
| `$collections/components/$modes/Mode 1/search/input/icon/default` | Search icon. | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/search/input/icon/active` | Active icon. | `icon/primary` |
| `$collections/components/$modes/Mode 1/search/dropdown/surface` | Results dropdown surface. | `surface/overlay` |
| `$collections/components/$modes/Mode 1/search/dropdown/border` | Results dropdown border. | `border/default` |
| `$collections/components/$modes/Mode 1/search/result/foreground/title` | Result title. | `text/primary` |
| `$collections/components/$modes/Mode 1/search/result/foreground/subtitle` | Result subtitle. | `text/secondary` |
| `$collections/components/$modes/Mode 1/search/result/foreground/match` | Matched text. | `text/brand` |
| `$collections/components/$modes/Mode 1/search/result/surface/default` | Result row default. | `color/transparent` |
| `$collections/components/$modes/Mode 1/search/result/surface/hover` | Result row hover. | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/search/result/surface/active` | Result row active. | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/search/result/surface/selected` | Result row selected. | `container/neutral/selected` |
| `$collections/components/$modes/Mode 1/search/result/icon/default` | Result icon. | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/search/result/icon/selected` | Selected result icon. | `icon/primary` |
| `$collections/components/$modes/Mode 1/search/highlight/surface` | Highlight surface. | `status/warning/container` |
| `$collections/components/$modes/Mode 1/search/section-title/foreground` | Section title. | `text/tertiary` |
| `$collections/components/$modes/Mode 1/search/focus/ring` | Focus ring. | `focus/ring` |

Token gaps:

- Loading, no-results и error visuals должны использовать feedback components или быть добавлены в token architecture через system review.
- Не добавляйте raw colors для highlights или selected result.
- Если command-palette требует modal overlay tokens, сверяйте их с overlay/foundation tokens.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Variant | `variant` | `inline`, `overlay`, `command-palette`. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Query | `query`, `defaultQuery`, `onQueryChange` | Controlled/uncontrolled modes не смешиваются. |
| State | `state` | Derived from query, loading и results. |
| Results | `results` | Массив stable result objects. |
| Result id | `result.id` | Используется для selection/navigation. |
| Result label | `result.title`, `result.subtitle` | Не храните только rendered HTML. |
| Loading | `isLoading` | Parent/data state. |
| Selection | `onSelectResult` | Возвращает result object/id. |
| Empty | `emptyText`, `noResultsText` | Recovery copy. |
| Shortcut | `shortcut` | Только если поддержан platform behavior. |

Contract rules:

- Query и selected result не должны быть одним prop.
- Results должны иметь stable ids.
- Remote search должен описывать debounce, cancellation и stale response handling.
- Command result должен явно отличаться от navigation result.

---

## 10. Handoff notes

### React runtime — 25.10.2026

Public `Search` из установленного `@seda-ai/ui` использует настоящий TextField, IconButton очистки, Button/Link результатов, Text и исходные Icon. Clear — sibling поля в общей grid-ячейке, а не интерактивный потомок HTML label. Фактические размеры IconButton сохраняются квадратными; поле сохраняет границы при появлении clear/loading. Цвета берутся из существующих `search` roles. Геометрия, радиус, icon/text scale и X/Y наследуются из общего compiler/provider; собственных пресетов Search нет. Surface gap: list inset4px, row Y8px+extraY, inner X равен полю минус list inset, subtitle gap4px, result max-height min(55vh,400px). Это foundation fallbacks, не свежая pixel-приёмка.

Два контекста данных явно разделены, потому что существующий Files фильтрует внешнюю коллекцию, а Chat выбирает отдельный результат:

- `mode=filter`, только inline: `resultsId` ссылается на реальную внешнюю область; `resultCount` и его локализованное объявление принадлежат локальному фильтру приложения. Компонент не подменяет коллекцию своей копией. В Files сохранены Search ID, источник, фильтры и selection. При вводе из страницы уведомлений открывается область файлов без потери фокуса.
- `mode=results`: `queryKey` обозначает текущий search intent. `data` всегда содержит `resultsFor` (точная исходная строка) и свой `queryKey`. Контент, loading и error показываются только при совпадении обоих значений. Для remote owner ключ обязан быть новым при каждом новом запросе/retry, включая A→B→A. `resultsFor` одного текста недостаточно для защиты от позднего ответа. Сеть, debounce, abort и отсечение ответа в data layer принадлежат владельцу; компонент дополнительно не позволяет выбрать несоответствующий snapshot.
- `data.status=ready` требует `results`. Idle/typing/loading не принимают скрытый stale results array. Error требует `errorText` и retry callback либо `unrecoverableReason`. Ошибка источника не делает сам текст query `aria-invalid`. Error/recovery и disabled results — code-level compositions, **Needs system review** относительно Figma metadata, где такого отдельного state нет.
- `query` требует `onQueryChange`; uncontrolled использует `defaultQuery` с тем же callback. Оба режима одновременно запрещены. Callback сообщает reason input/clear и composing. Во время IME нет автоматического выбора результата; финальный composition commit не должен дублировать следующий input event. Query не отправляется в analytics и не сохраняется библиотекой.
- `SearchLabels`: clear, empty, typing, loading, noResults, retry, resultCount(n). Рейтинг, перевод, лимиты, подсказки и форматирование результатов не выводятся из макета автоматически.
- `SearchResult`: уникальный id, title, kind=command/navigation; optional subtitle/section/icon. Navigation требует безопасный href и сохраняет native modified-click/target/rel. `onSelectResult(result,event)` владеет командой или SPA-переходом; обычная ссылка остаётся нативной, пока callback не отменил default. Disabled result требует readable reason. Даже недоступное действие сохраняет читаемые данные результата, без дополнительного opacity на содержимом.
- Optional `matches` — упорядоченные непересекающиеся UTF-16 диапазоны исходного title; нельзя выходить за строку или разрывать surrogate pair. Владелец отвечает за locale/grapheme-aware подбор диапазонов. Это React mark со string slices, без HTML injection и без переписывания исходного текста. Если в списке есть иконки, заголовки строк с и без иконки занимают одну колонку; вторая фиктивная иконка не создаётся.

Keyboard: input ArrowDown/Up переводит фокус к первому/последнему доступному результату; result ArrowDown/Up/Home/End двигает его, пропуская disabled. Up с первого результата возвращает input. Enter в input активирует первый доступный результат через его native action; repeat не повторяет команду. Tab остаётся native для links/buttons, а не имитацией listbox. Активность означает реальный фокус, `aria-selected` не выдумывается. Escape в inline очищает query/возвращает input; в overlay/command-palette требует `onDismiss`. Удаление сфокусированного результата/смена snapshot локально возвращает input; внешний фокус не перехватывается.

`variant=overlay|command-palette` задаёт содержимое поверхности и требует dismiss owner. Сам Search не создаёт второй portal/dialog и не регистрирует глобальный shortcut. Chat использует настоящий Modal host и `initialFocusRef` к публичному input ref. Ctrl/Cmd+K и Ctrl/Cmd+S зарегистрированы владельцем Chat на window, с защитой composition/repeat/modal/menu и без перехвата Alt/Shift-комбинаций. История, сохранение, фоновые ответы и request ownership чата не перенесены в UI-компонент. Overlay без host, clipping/position и outside-dismiss требует отдельной composition acceptance; самостоятельный anchored Popover Search не заявлен готовым.

Acceptance: установленный пакет React18/19, SSR/Strict hydration, типы/invalid models, все темы/размеры, длинные строки и смешанные иконки, контраст, поля/clear без скачка высоты, keyboard/RTL/native navigation, IME event guards, A→B→A и stale error/loading, duplicate same-cycle intent/retry, сохранение authored documents. Источники и ранжирование Files/Chat реальные локальные; remote Search engine не симулируется. Fresh Figma6739:599 недоступна из-за service quota; screen readers/native OS IME/Firefox/WebKit/performance и отдельный executable instance contract остаются открытыми. Experimental export не означает завершение общей цели зрелости.

Handoff для Search должен включать:

- Figma component и node id: `6739:599`;
- `variant`, `state`, `size`;
- query rules: min length, debounce, local/remote source;
- result schema: id, title, subtitle, icon, section, action;
- loading/no-results/error behavior;
- keyboard flow, active result, shortcut;
- selection behavior: navigate, command, filter, insert value;
- analytics/privacy constraints для query;
- token mapping и token gaps;
- mobile behavior: inline, overlay или full-screen search.

### Acceptance criteria

- Search использует только documented `variant`, `state`, `size`.
- Query lifecycle описывает empty, typing, loading, results и no-results.
- Results имеют stable ids и accessible labels.
- No-results содержит recovery path.
- Keyboard navigation работает для results.
- Loading/stale results не вводят пользователя в заблуждение.
- AI-generated output не добавляет ranking, shortcut или remote behavior без `Needs system review`.

---

## 11. AI usage rules

- AI может предложить no-results copy, result schema и acceptance criteria.
- AI должен сверять `tokens.json` перед изменением Design Tokens.
- AI не должен придумывать ranking algorithm, source of truth, shortcuts или analytics events.
- AI должен отличать Search от Text Field, Select и Dropdown Menu.
- AI должен помечать remote search, privacy, permissions и stale results как `Needs system review`, если rules неизвестны.
- AI может предложить recovery paths, но человек подтверждает product behavior.

---

## 12. Примеры

### Корректно

| Сценарий | Почему |
| --- | --- |
| Поиск клиента по имени с loading и no-results recovery. | Есть полный query lifecycle. |
| Command palette для переходов и быстрых действий. | Результаты являются командами, а не form values. |
| Inline search в таблице с debounce и clear action. | Поведение запроса и очистки описано. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Search отправляет query в analytics. | Нужен privacy review. |
| Results зависят от permissions. | Нужны empty/error rules. |
| AI предлагает ranking без данных. | Нет product/data contract. |

---

## 13. Anti-patterns

- Использовать Search как обычный Text Field без results lifecycle.
- Показывать no-results без recovery.
- Не различать loading и no-results.
- Хранить result только как rendered label без id.
- Делать active result только цветом.
- Добавлять shortcut без platform review.
- Генерировать ranking или privacy behavior через AI без подтверждения человека.
