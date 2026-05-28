# Tag

> **Category** · Data Display
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Tag / Read-only](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=1172-1185), [Tag / Selectable](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=1178-16954), [Tag / Interactive](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=1180-17533)

---

## 1. Key Principles / Принципы использования

### Что это

Tag — компактная метка для статуса, категории, признака или короткого классификатора объекта. Tag помогает быстро сканировать данные в таблицах, списках, карточках, Property List и detail views.

В SEDA AI Tag является status and classification contract: он должен явно описывать смысл метки, тип взаимодействия, color/tone, state, token mapping и accessibility. AI может помогать выбирать тип Tag и формулировать label, но не должен использовать Tag как кнопку, счетчик или выбранное значение формы.

### Когда использовать

Используйте Tag, когда:

- нужно показать статус объекта: Active, Pending, Disabled, Failed;
- нужно показать категорию, тип, сегмент или классификатор;
- короткая метка помогает сканировать таблицу, список или карточку;
- пользователь может включать/выключать фильтр через selectable Tag;
- метку можно убрать из контекста без сложной логики;
- нужно показать AI-related или system-generated marker с явным смыслом.

### Не используйте

Не используйте Tag, когда:

- нужен count, dot или сигнал на host-элементе — используйте [Badge](badge.md);
- нужно показать выбранное значение multi-select — используйте [Chip](chip.md);
- нужно выполнить действие — используйте [Button](../actions/button.md) или [Icon Button](../actions/icon-button.md);
- нужен переход по URL — используйте Link;
- нужен длинный статус с пояснением — используйте текстовый блок, Description List или Empty/Error pattern;
- цвет является единственным носителем смысла.

### Основные принципы

- **Meaning before color** — смысл Tag задается label, а цвет только усиливает классификацию.
- **Short and scannable** — Tag должен быть коротким, без длинных предложений.
- **Type defines interaction** — read-only, selectable и interactive Tag не смешиваются.
- **Tone follows taxonomy** — color/tone должен соответствовать documented status или category mapping.
- **No hidden actions** — dismissible или interactive Tag должен иметь явное доступное действие.
- **Tokens before visuals** — surface, foreground, border, icon и focus задаются через component tokens.
- **AI assists, system governs** — AI может предложить label/tone, но использует только documented variants, states, props и tokens.

### Связанные спецификации

- [Badge](badge.md) — count, dot или status signal на host-элементе.
- [Chip](chip.md) — выбранное значение или фильтр с remove/expand/select behavior.
- [Table](table.md) — статусные значения внутри строк.
- [Property List](property-list.md) — свойства объекта, где Tag может быть value.

---

## 2. Anatomy / Анатомия

| Slot | Обязательность | Описание |
|---|---:|---|
| `root` | Да | Контейнер Tag. Управляет tone, surface, border, state и radius. |
| `label` | Да | Короткий видимый текст метки. |
| `leadingIcon` | Нет | Иконка, уточняющая категорию или статус. |
| `badge` | Нет | Малый count/signal внутри read-only Tag, если он предусмотрен Figma variant. |
| `dismissButton` | Условно | Кнопка удаления для dismissible/interactive Tag. |

### Правила анатомии

- `label` обязателен и не заменяется иконкой.
- `leadingIcon` должен быть декоративным или иметь тот же смысл, что и label.
- `dismissButton` используется только когда Tag можно убрать из текущего контекста.
- `badge` внутри Tag допустим только как documented Figma option; для самостоятельного счетчика используйте Badge.
- Tag не должен содержать nested Button, input, menu, tooltip trigger или второй action.
- Tag не должен становиться многострочным.

---

## 3. Types / Variants / Варианты

| Type | Когда использовать | Behavior |
|---|---|---|
| `read-only` | Статус, категория, сегмент, системная метка. | Не кликается и не получает hover как action. |
| `selectable` | Быстрый фильтр или toggle внутри группы. | Переключает selected state. |
| `interactive` | Метку можно удалить или открыть связанное действие. | Требует явного action contract и focus behavior. |

### Color / tone variants

| Tone | Когда использовать |
|---|---|
| `neutral` / `gray` | Нейтральная категория или default status. |
| `brand` | Brand-related marker или выбранный акцент. |
| `info` / `blue` | Информационный статус. |
| `success` / `mint` / `pistachio` | Успешное или положительное состояние. |
| `warning` / `yellow` / `orange` | Требует внимания, но не блокирует сценарий. |
| `danger` / `red` | Ошибка, риск, критичный статус. |
| `ai` / `purple` | AI-related marker, AI-generated или AI-assisted content. |

### Figma component sets

| Component set | Назначение |
|---|---|
| `Tag / Read-only` | Базовая метка без interaction. |
| `Tag / Selectable` | Переключаемая метка для фильтров. |
| `Tag / Interactive` | Метка с dismiss/action behavior. |

---

## 4. Sizes / Размеры

| Size | Когда использовать | Примечание |
|---|---|---|
| `s` | Dense data surfaces, table cells, compact lists. | Минимальная плотность. |
| `m` | Базовый размер для большинства интерфейсов. | Default для Tag. |
| `l` | Touch-friendly surfaces, mobile, крупные cards. | Требует проверки плотности layout. |

### Правила размеров

- Размер Tag должен соответствовать плотности контейнера.
- В Table и Property List чаще используется компактный размер.
- В touch-heavy сценариях интерактивный Tag должен иметь достаточную hit area.
- Height, padding, radius, gap, typography и icon size пока задаются foundation rules и Figma variants, а не отдельными size tokens.

---

## 5. States / Состояния

| State | Применяется к | Описание |
|---|---|---|
| `enabled` / `default` | Все типы. | Базовое отображение. |
| `hover` | `selectable`, `interactive`. | Показывает, что Tag можно активировать. |
| `active` | `selectable`, `interactive`. | Момент нажатия. |
| `focus` | `selectable`, `interactive`, dismiss button. | Keyboard focus через `tag/focus/ring`. |
| `selected` | `selectable`. | Tag выбран как фильтр или toggle. |
| `disabled` | Все типы. | Недоступен и не активируется. |
| `skeleton` | Все типы. | Placeholder до загрузки label/status. |

### State ownership

- Read-only Tag не получает interactive hover/click behavior.
- Selectable Tag владеет `selected` state.
- Interactive Tag может иметь dismiss action, но не должен одновременно быть primary action и dismiss control без явного focus strategy.
- Disabled Tag не активируется мышью, touch и keyboard.
- Skeleton state не должен содержать реальный label или misleading status.

---

## 6. Behavior / Поведение

### Read-only Tag

- Не кликается.
- Не получает pointer cursor.
- Не меняет состояние при hover.
- Используется как часть content/data surface.

### Selectable Tag

- Работает как toggle filter.
- `selected` state должен быть доступен screen reader.
- В группе multiple selection используйте checkbox-like semantics.
- В группе single selection проверьте, не подходит ли Tabs или Segmented Control.

### Interactive Tag

- Dismiss action удаляет Tag только из текущего контекста.
- Если Tag открывает detail или filter action, это должно быть явно описано в handoff.
- Dismiss button должен иметь отдельный accessible name.
- После удаления фокус переходит на следующий Tag, предыдущий Tag или group container.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещает фокус к selectable/interactive Tag или dismiss button. |
| `Enter` | Активирует selectable или interactive action. |
| `Space` | Переключает selectable Tag или активирует button-like action. |
| `Delete` / `Backspace` | Может удалить dismissible Tag, если это documented behavior. |

---

## 7. Accessibility

Tag должен следовать [foundation/accessibility.md](../../foundation/accessibility.md). Цвет не должен быть единственным способом понять статус, категорию или selected state.

| Сценарий | Требование | Пример |
|---|---|---|
| Status Tag | Label содержит смысл статуса. | `Ошибка`, `Активен`, `На проверке`. |
| Selectable Tag | Selected state доступен assistive tech. | `aria-pressed="true"` или checkbox semantics. |
| Dismissible Tag | Dismiss button имеет accessible name. | `Удалить тег: Enterprise`. |
| Icon in Tag | Icon декоративна или дублирует label. | `aria-hidden="true"`, если смысл уже в label. |
| AI Tag | Label ясно объясняет AI-related status. | `AI-generated`, `AI-assisted`, `Needs review`. |

### Accessibility checklist

- [ ] Label Tag понятен без цвета.
- [ ] Цвет/tone соответствует documented taxonomy.
- [ ] Interactive Tag доступен с клавиатуры.
- [ ] Focus ring видим и использует `tag/focus/ring`.
- [ ] Selected state не передан только цветом.
- [ ] Dismiss button имеет `aria-label`.
- [ ] Disabled Tag не активируется.
- [ ] Skeleton Tag не объявляет ложный статус.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Tag доступны component tokens в namespace `tag`; устаревшие aliases вида `--tag-*` не являются source of truth.

### Status / category tokens

| Component token | Роль | Semantic mapping |
|---|---|---|
| `tag/surface/neutral` | Neutral surface. | `container/neutral/default` |
| `tag/foreground/neutral` | Neutral text. | `text/secondary` |
| `tag/border/neutral` | Neutral border. | `border/default` |
| `tag/icon/neutral` | Neutral icon. | `icon/secondary` |
| `tag/surface/brand` | Brand surface. | `container/brand/default` |
| `tag/foreground/brand` | Brand text. | `text/on-brand/primary` |
| `tag/border/brand` | Brand border. | `border/brand/subtle` |
| `tag/icon/brand` | Brand icon. | `text/on-brand/primary` |
| `tag/surface/info` | Info surface. | `status/info/surface` |
| `tag/foreground/info` | Info text. | `status/info/text` |
| `tag/border/info` | Info border. | `status/info/border` |
| `tag/icon/info` | Info icon. | `status/info/icon` |
| `tag/surface/success` | Success surface. | `status/success/surface` |
| `tag/foreground/success` | Success text. | `status/success/text` |
| `tag/border/success` | Success border. | `status/success/border` |
| `tag/icon/success` | Success icon. | `status/success/icon` |
| `tag/surface/warning` | Warning surface. | `status/warning/surface` |
| `tag/foreground/warning` | Warning text. | `status/warning/text` |
| `tag/border/warning` | Warning border. | `status/warning/border` |
| `tag/icon/warning` | Warning icon. | `status/warning/icon` |
| `tag/surface/danger` | Danger surface. | `status/danger/surface` |
| `tag/foreground/danger` | Danger text. | `status/danger/text` |
| `tag/border/danger` | Danger border. | `status/danger/border` |
| `tag/icon/danger` | Danger icon. | `status/danger/icon` |
| `tag/surface/ai` | AI marker surface. | `status/ai/surface` |
| `tag/foreground/ai` | AI marker text. | `status/ai/text` |
| `tag/border/ai` | AI marker border. | `status/ai/border` |
| `tag/icon/ai` | AI marker icon. | `status/ai/icon` |

### Selectable, focus, disabled

| Component token | Роль | Semantic mapping |
|---|---|---|
| `tag/selectable/surface/default` | Selectable default surface. | `container/neutral/default` |
| `tag/selectable/surface/hover` | Selectable hover surface. | `container/neutral/hover` |
| `tag/selectable/surface/selected` | Selectable selected surface. | `container/brand/default` |
| `tag/selectable/foreground/selected` | Selectable selected text. | `text/on-brand/primary` |
| `tag/focus/ring` | Focus ring. | `focus/ring` |
| `tag/disabled/surface` | Disabled surface. | `status/disabled/container` |
| `tag/disabled/foreground` | Disabled text. | `status/disabled/text` |

### Legacy and token gaps

- `tag/gray/foreground` существует как compatibility token, но для новой документации используйте `tag/foreground/neutral`.
- Size, height, radius, padding, gap, typography, icon size и dismiss button geometry пока описаны foundation rules и Figma variants, а не отдельными Tag size tokens.
- Не придумывайте новые Tag color aliases без обновления `tokens.json` и Figma bindings.

---

## 9. Code mapping

| Spec concept | Code prop / attribute | Notes |
|---|---|---|
| Type | `type` | Values: `read-only`, `selectable`, `interactive`. |
| Tone | `tone` | Values: `neutral`, `brand`, `info`, `success`, `warning`, `danger`, `ai`. |
| Legacy color | `color` | Values from Figma read-only set: `gray`, `blue`, `mint`, `pistachio`, `purple`, `orange`, `yellow`, `red`. Map to tone when possible. |
| Size | `size` | Values: `s`, `m`, `l`. |
| Label | `children` или `label` | Обязательный visible text. |
| Leading icon | `leadingIcon` | Не заменяет label. |
| Badge option | `showBadge`, `badgeValue` | Только если соответствует Figma option и product rule. |
| Selectable state | `selected`, `onSelectedChange` | Только для `selectable`. |
| Dismiss action | `dismissible`, `onDismiss`, `dismissLabel` | Требует accessible label. |
| Disabled | `disabled` или `aria-disabled` | Blocking guard обязателен для non-native element. |

### Contract rules

- `read-only` Tag не должен иметь `onClick`.
- `selectable` Tag требует selected state и keyboard activation.
- `interactive` Tag требует explicit action: dismiss, open или documented custom action.
- Dismiss button не должен быть единственным способом понять смысл Tag.
- Если Tag используется для AI-related status, label должен объяснять состояние: `AI-generated`, `AI-assisted`, `Needs review`.

---

## 10. Handoff notes

Handoff для Tag должен фиксировать:

- список Tag labels и источник данных;
- type, tone/color, size и state;
- taxonomy mapping: какой статус или категория соответствует tone;
- где Tag read-only, selectable или interactive;
- selected behavior для фильтров;
- dismiss behavior и focus recovery;
- accessible names для dismiss buttons;
- token paths для surface, foreground, border, icon, focus и disabled;
- fallback для длинного label и skeleton state.

---

## 11. Acceptance criteria

- [ ] Tag используется для статуса, категории или короткой метки.
- [ ] Для count/dot выбран Badge, для selected form value выбран Chip.
- [ ] Label понятен без цвета.
- [ ] Type, tone, size и state соответствуют documented values.
- [ ] Read-only Tag не кликается.
- [ ] Selectable Tag имеет accessible selected state.
- [ ] Interactive/dismissible Tag имеет accessible action label.
- [ ] Focus ring видим и использует `tag/focus/ring`.
- [ ] Используются реальные Tag component tokens из `tokens.json`.
- [ ] Handoff описывает taxonomy mapping и edge cases.

---

## 12. AI usage rules

AI может:

- предложить type и tone для списка Tag по статусам или категориям;
- проверить, нужен ли Tag, Badge, Chip, Button или Link;
- подготовить taxonomy mapping для статусов;
- сформировать handoff notes и acceptance criteria;
- найти missing states, token gaps и accessibility gaps.

AI не должен:

- использовать Tag как самостоятельную кнопку или ссылку;
- использовать Tag как счетчик вместо Badge;
- использовать Tag как выбранное значение multi-select вместо Chip;
- придумывать новые tones, colors, states, props или token names;
- передавать статус только цветом;
- добавлять dismiss action без accessible label и focus recovery.

Если статус влияет на безопасность, доступ, деньги, права или irreversible action, AI должен пометить сценарий как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Сценарий | Решение |
|---|---|
| Статус заказа в Table. | Read-only Tag с label `Оплачен` и success tone. |
| Категория пользователя в Property List. | Read-only neutral или brand Tag. |
| Быстрые фильтры в списке задач. | Selectable Tags с selected state. |
| AI-generated summary в карточке. | AI tone Tag с label `AI-generated` или `Needs review`. |

### Требует review

| Сценарий | Что проверить |
|---|---|
| Tag кликается и ведет на другую страницу. | Возможно, нужен Link. |
| Tag содержит число уведомлений. | Возможно, нужен Badge. |
| Tag удаляет объект из базы. | Нужен destructive flow, не dismissible Tag. |
| Tag label длиннее одной короткой фразы. | Нужен truncation или другой pattern. |

---

## 14. Anti-patterns

- Использовать Tag для count или dot notification.
- Использовать Tag как Button.
- Использовать Tag как Chip в multi-select.
- Передавать статус только цветом.
- Добавлять tone без taxonomy mapping.
- Делать read-only Tag кликабельным.
- Добавлять dismiss button без accessible name.
- Использовать icon-only Tag без label.
