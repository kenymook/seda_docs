# Button Group

> **Category** · Actions
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [ссылка на фрейм компонента]
> **Foundation** · `accessibility.md`, `content.md`, `iconography.md`, `spacing-sizing.md`, `state-vocabulary.md`, `tokens.md`

---

## 1. Key Principles / Принципы использования

### Что это

Button Group — связанный набор кнопок, который воспринимается как единый control. Компонент используется для компактного выбора режима, переключения представления или группировки близких действий в одном локальном контексте.

В SEDA AI Button Group является contract-компонентом для grouped actions: он должен явно описывать состав группы, режим выбора, состояние активного элемента, keyboard behavior, token mapping и handoff. AI может помогать с черновиком состава группы и acceptance criteria, но не должен придумывать новые режимы, props или token paths.

### Когда использовать

Используйте Button Group, когда:

- нужно показать 2-5 связанных действий рядом;
- пользователь выбирает один активный режим из короткого набора;
- действия относятся к одному объекту, toolbar или локальному блоку;
- нужно сохранить визуальную связь между кнопками без отдельного layout-контейнера;
- важно передать `selected` state внутри группы.

### Не используйте

Не используйте Button Group, когда:

- действия независимы и не должны восприниматься как один control — используйте отдельные Button;
- нужен выбор одного значения в форме — используйте Radio или Segmented Control;
- нужен выбор нескольких значений — используйте Checkbox, Chip или фильтры;
- вариантов больше 5 — используйте Dropdown Menu, Select или отдельный toolbar pattern;
- действие является icon-only — используйте Icon Button внутри grouped pattern и обязательно задайте `aria-label`;
- требуется navigation между разделами страницы — используйте Tabs или Navigation component.

### Основные принципы

- **Связанный смысл** — все items в группе решают одну локальную задачу.
- **Один режим управления** — группа не смешивает mutually exclusive selection и независимые команды.
- **Один размер** — все items используют общий `size`.
- **Одна визуальная рамка** — внешняя форма группы задается контейнером, а не отдельными card-like wrappers.
- **Selected is explicit** — активный item должен быть передан через prop/state, а не через произвольный стиль.
- **Tokens before visuals** — surface, border, divider, foreground, icon и focus берутся из `button-group` tokens.
- **AI assists, system governs** — AI может предложить структуру группы, но финальный contract проверяет человек.

### Связанные спецификации

- [Button](../specs/actions/button.md) — базовое действие с текстовым label.
- [Icon Button](../specs/actions/icon-button.md) — icon-only действие внутри compact toolbar.
- [Segmented Control](../specs/inputs/segmented-control.md) — выбор одного режима как input control.
- [Tabs](../specs/navigation/tabs.md) — переключение разделов контента.
- [Dropdown Menu](../specs/overlays-layout/dropdown-menu.md) — список действий, который не помещается в группу.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `root` | Да | Контейнер группы, задает orientation, border, radius и роль. |
| `item` | Да | Дочерняя кнопка или icon button. Минимум 2, максимум 5. |
| `divider` | Авто | Разделитель между соседними items, если он нужен визуально. |
| `label` | Условно | Видимый текст item. Обязателен для regular button item. |
| `icon` | Условно | Иконка item. Для icon-only item нужен `aria-label`. |

### Правила анатомии

- Button Group содержит только interactive items одного типа поведения.
- В группе не должно быть ссылок, dropdown-контейнеров, input fields или cards.
- Внутренние items не создают собственный внешний radius на смежных сторонах.
- Divider не должен быть отдельным фокусируемым элементом.
- Если используется icon-only item, требования Icon Button по `aria-label` и Tooltip остаются обязательными.

---

## 3. Types / Variants / Варианты

| Variant | Назначение | Типичный сценарий |
|---|---|---|
| `horizontal` | Items расположены в строку. | Toolbar, переключатель вида, card actions. |
| `vertical` | Items расположены в колонку. | Side panel, compact settings, narrow container. |

### Mode

| Mode | Назначение | Правило |
|---|---|---|
| `singleSelect` | Один активный item из группы. | Используйте `selectedValue`, `aria-pressed` или radio pattern по контексту. |
| `actions` | Набор связанных независимых команд. | Не показывайте persistent `selected`, если действие не является режимом. |

### Modifiers

| Modifier | Назначение | Ограничения |
|---|---|---|
| `equalWidth` | Все items занимают одинаковую ширину. | Подходит для коротких labels и mode switcher. |
| `fullWidth` | Группа занимает всю ширину parent. | Чаще для mobile, forms и narrow panels. |
| `iconOnly` | Items состоят только из иконок. | Нужны `aria-label` и Tooltip для каждого item. |
| `disabled` | Отключает всю группу или отдельный item. | Причина должна быть понятна из контекста или helper text. |

---

## 4. Sizes / Размеры

Button Group использует тот же размерный словарь, что Button и Icon Button. Размер задается на уровне группы и применяется ко всем items.

| Size | Высота item | Типичный контекст |
|---|---:|---|
| `small` | 24px | Dense toolbar, table controls, compact card actions. |
| `medium` | 32px | Default для продуктового интерфейса. |
| `large` | 40px | Forms, panels, touch-friendly controls. |
| `extraLarge` | 48px | Mobile или high-emphasis режимы. |

### Правила размеров

- Не смешивайте разные sizes внутри одной Button Group.
- Touch target должен быть не меньше 44x44px там, где ожидается touch input.
- Ширина item может зависеть от label, но высота должна быть стабильной.
- Для `equalWidth` нужно проверять, что самый длинный label не ломает layout.

---

## 5. States / Состояния

| State | Когда возникает | Правило |
|---|---|---|
| `default` | Группа доступна, item не выбран и не взаимодействует с пользователем. | Используются default tokens. |
| `hover` | Pointer над item. | Применяется только к конкретному item. |
| `pressed` | Pointer или keyboard activation. | Краткосрочное состояние нажатия. |
| `focus` | Keyboard focus на item. | Focus ring должен быть видим и не обрезан. |
| `selected` | Item выбран как текущий режим. | Допустимо только в `singleSelect` или documented grouped context. |
| `disabled` | Item или вся группа недоступны. | Disabled отменяет hover/pressed и исключает item из activation. |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
|---|---:|---|
| `selected` + `hover` | Да | Активный item может получать hover feedback. |
| `selected` + `focus` | Да | Keyboard focus может находиться на активном item. |
| `pressed` + `focus` | Да | Keyboard activation. |
| `disabled` + `selected` | Условно | Только если система должна показать сохраненный недоступный режим; нужен review. |
| `hover` + `disabled` | Нет | Disabled item не получает interactive states. |

---

## 6. Behavior / Поведение

### Selection behavior

- В `singleSelect` всегда должен быть понятен текущий selected item.
- Если выбор обязателен, группа не может оставаться без selected item.
- Если выбор может быть пустым, это должно быть явно описано в handoff.
- Повторный клик по selected item не должен сбрасывать выбор без отдельного требования.

### Action behavior

- В `actions` mode каждый item запускает отдельную команду.
- Items не должны менять persistent selected state, если это не режим.
- Async action может показать loading на конкретном item, но не должна ломать ширину всей группы.
- Если одно действие открывает Dropdown Menu, item должен явно сообщать disclosure state.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещает фокус к группе или от нее. |
| `ArrowRight` / `ArrowDown` | Переход к следующему item в `singleSelect` pattern. |
| `ArrowLeft` / `ArrowUp` | Переход к предыдущему item в `singleSelect` pattern. |
| `Home` | Переход к первому item, если включен roving focus. |
| `End` | Переход к последнему item, если включен roving focus. |
| `Enter` / `Space` | Активирует item в фокусе. |

### Responsive behavior

- Horizontal группа может перейти в vertical layout только по documented breakpoint или container rule.
- Если labels не помещаются, сначала используйте более короткие labels, затем `equalWidth=false`, затем Dropdown Menu.
- Не скрывайте label в icon-only вид без добавления `aria-label` и Tooltip.

---

## 7. Accessibility

| Сценарий | Семантика | Правило |
|---|---|---|
| Набор независимых действий | `role="group"` или семантический контейнер | Нужен accessible label группы, если назначение не очевидно. |
| Выбор одного режима | `radiogroup`/`radio` или `aria-pressed` pattern | Выберите один pattern и не смешивайте их. |
| Icon-only items | `<button aria-label="...">` + Tooltip | Accessible name обязателен для каждого item. |
| Disabled group | `disabled` на items или `aria-disabled` по сценарию | Поведение должно соответствовать выбранной семантике. |
| Divider | Decorative | Не попадает в tab order и screen reader tree. |

### Accessibility checklist

- [ ] У группы есть понятный label или контекст.
- [ ] Выбран один consistent pattern: `group`, `radiogroup` или `aria-pressed`.
- [ ] Каждый item доступен с клавиатуры.
- [ ] Focus order совпадает с визуальным порядком.
- [ ] Focus ring не обрезается container overflow.
- [ ] Selected state передается не только цветом.
- [ ] Icon-only items имеют `aria-label` и Tooltip.
- [ ] Disabled items не активируются мышью, клавиатурой или программно.
- [ ] Contrast текста, иконок, border и selected state соответствует требованиям.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Button Group доступен namespace `button-group`; устаревшие aliases вида `--btn-group-*` не считаются source of truth.

### Group container

| Component token | Роль | Semantic token |
|---|---|---|
| `button-group/surface/default` | Фон контейнера группы. | `color/transparent` |
| `button-group/surface/disabled` | Фон disabled группы. | `color/transparent` |
| `button-group/border/default` | Внешняя граница группы. | `border/default` |
| `button-group/border/hover` | Граница item или группы при hover. | `border/hover` |
| `button-group/border/selected` | Граница selected item. | `border/selected` |
| `button-group/border/disabled` | Disabled border. | `status/disabled/border` |
| `button-group/divider/default` | Разделитель между items. | `border/default` |
| `button-group/divider/disabled` | Disabled divider. | `status/disabled/border` |

### Item surface and content

| Component token | Роль | Semantic token |
|---|---|---|
| `button-group/item/surface/default` | Фон item по умолчанию. | `surface/base` |
| `button-group/item/surface/hover` | Фон item при hover. | `container/neutral/hover` |
| `button-group/item/surface/pressed` | Фон item при нажатии. | `container/neutral/pressed` |
| `button-group/item/surface/selected` | Фон selected item. | `container/neutral/selected` |
| `button-group/item/surface/disabled` | Фон disabled item. | `status/disabled/container` |
| `button-group/item/foreground/default` | Текст item по умолчанию. | `text/primary` |
| `button-group/item/foreground/hover` | Текст item при hover. | `text/primary` |
| `button-group/item/foreground/pressed` | Текст item при нажатии. | `text/primary` |
| `button-group/item/foreground/selected` | Текст selected item. | `text/primary` |
| `button-group/item/foreground/disabled` | Текст disabled item. | `status/disabled/text` |
| `button-group/item/icon/default` | Иконка item по умолчанию. | `icon/secondary` |
| `button-group/item/icon/hover` | Иконка item при hover. | `icon/primary` |
| `button-group/item/icon/selected` | Иконка selected item. | `icon/primary` |
| `button-group/item/icon/disabled` | Иконка disabled item. | `status/disabled/icon` |
| `button-group/focus/ring` | Focus ring для item. | `focus/ring` |

### Token gaps

- Size, radius, padding, gap и typography пока описаны foundation rules, а не `button-group` component tokens.
- Если появятся component-level size tokens, spec должен заменить raw px на явный token mapping.
- Нельзя добавлять в handoff или code новые token names без обновления `tokens.json`.

---

## 9. Code mapping

| Design concept | Prop / API | Правило |
|---|---|---|
| Orientation | `orientation` | `horizontal`, `vertical`. |
| Mode | `mode` | `singleSelect`, `actions`. |
| Size | `size` | `small`, `medium`, `large`, `extraLarge`. |
| Items | `items` или children | 2-5 items, единый contract. |
| Selected value | `selectedValue` | Только для `singleSelect`. |
| Change handler | `onValueChange` | Для выбора режима. |
| Action handler | `onAction` или item `onClick` | Для `actions` mode. |
| Equal width | `equalWidth` | Boolean. |
| Full width | `fullWidth` | Boolean. |
| Disabled group | `disabled` | Boolean на всю группу. |
| Disabled item | item `disabled` | Boolean на конкретный item. |

### Contract rules

- `mode` должен быть задан явно, если группа может быть прочитана двояко.
- `singleSelect` требует `selectedValue` или documented empty selection behavior.
- `actions` не должен использовать persistent selected state.
- `items` не должны смешивать text button и icon-only button без явного pattern review.
- `orientation`, `size` и token mapping задаются на уровне группы.
- Raw colors, arbitrary borders и custom dividers запрещены.

---

## 10. Handoff notes

Handoff для Button Group должен фиксировать:

- mode: `singleSelect` или `actions`;
- orientation;
- size;
- список items: label, icon, value, disabled state;
- selected item и правило изменения selected state;
- keyboard pattern: roving focus, radio pattern или стандартная tab-навигация;
- responsive behavior;
- token branch `button-group`;
- loading или async behavior на уровне item, если есть;
- aria pattern и accessible label группы;
- ограничения: max item count, equal width, full width.

---

## 11. Acceptance criteria

- [ ] Группа содержит 2-5 связанных items.
- [ ] `mode` выбран и не смешивает selection с независимыми actions.
- [ ] Все items используют один `size`.
- [ ] Selected state задан явно, если группа работает как переключатель режима.
- [ ] Keyboard behavior соответствует выбранному accessibility pattern.
- [ ] Icon-only items имеют `aria-label` и Tooltip.
- [ ] Focus ring видим для каждого item.
- [ ] Divider не является фокусируемым элементом.
- [ ] Используются реальные `button-group` component tokens.
- [ ] Не используются устаревшие aliases `--btn-group-*`.

---

## 12. AI usage rules

AI может:

- предложить состав Button Group для локального toolbar или mode switcher;
- определить, нужен ли `singleSelect` или `actions`;
- подготовить item labels на русском;
- предложить `aria-label` для icon-only items;
- сформировать handoff notes и acceptance criteria;
- проверить token mapping с `tokens.json`;
- указать, когда лучше использовать Button, Icon Button, Segmented Control, Tabs или Dropdown Menu.

AI не должен:

- придумывать variants, props, states или token paths;
- использовать Button Group для несвязанных действий;
- скрывать labels в icon-only вид без accessibility contract;
- добавлять больше 5 items без system review;
- смешивать navigation Tabs и action Button Group;
- использовать raw CSS values вместо `button-group` tokens;
- считать selected state допустимым для `actions` mode без явного требования.

Если требование выходит за contract Button Group, AI должен пометить его как `Needs system review`.

---

## 13. Examples / Примеры

### Корректно

| Scenario | Usage |
|---|---|
| Переключение вида таблицы | `mode="singleSelect"`, items `Список`, `Сетка`, `Канбан`. |
| Toolbar alignment | `mode="singleSelect"`, icon-only items с `aria-label`: `Выровнять слева`, `По центру`, `Справа`. |
| Card actions | `mode="actions"`, items `Открыть`, `Дублировать`, `Архивировать`. |
| Compact status view | `orientation="vertical"`, `size="small"`, 3 связанных режима. |

### Требует review

| Scenario | Причина |
|---|---|
| 8 items в одной группе. | Слишком длинный control; нужен Dropdown Menu или другой pattern. |
| `selected` в группе независимых actions. | Пользователь может принять action за active mode. |
| Icon-only items без Tooltip. | Недостаточный visible explanation. |
| Смешивание Button и Link внутри группы. | Разная семантика поведения. |
| Custom green selected state. | Нужен token review, нельзя обходить `button-group` tokens. |

---

## 14. Anti-patterns

- Использовать Button Group как декоративную рамку вокруг несвязанных кнопок.
- Смешивать режим выбора и независимые команды в одной группе.
- Добавлять больше 5 items без пересмотра pattern.
- Прятать длинные labels за иконки без `aria-label` и Tooltip.
- Использовать Button Group вместо Tabs для навигации по разделам.
- Использовать Button Group вместо Segmented Control для form-like выбора значения.
- Применять raw colors, custom borders или ad-hoc divider styles.
- Убирать focus ring или обрезать его через overflow.
- Передавать selected state только цветом.
