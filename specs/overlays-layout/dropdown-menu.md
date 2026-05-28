# Dropdown Menu

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [DropdownMenu](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=7036-567)

---

## 1. Key Principles

### Что это

Dropdown Menu — раскрывающееся меню команд, действий или кратких contextual options, вызванное trigger-кнопкой. Это не Select: Dropdown Menu выполняет action, открывает подменю, запускает команду или показывает contextual controls, но не является основным способом выбора form value.

В SEDA AI Dropdown Menu описан как часть AI-ready design system framework: spec фиксирует item anatomy, grouping, danger actions, shortcuts, keyboard behavior, design tokens, handoff и AI usage rules. AI может помочь составить список команд и проверить accessibility, но не должен придумывать destructive behavior, permission rules или token names.

### Когда использовать

- Есть список действий для объекта, строки таблицы, карточки или страницы.
- Нужны icon items, shortcuts, grouped items или danger action.
- Trigger управляет `open` state.
- Действия не требуют длинной формы или сложного content.
- Меню должно быть компактным и контекстным.

### Когда не использовать

- Для выбора значения в форме используйте [Select](../inputs/select.md).
- Для длинного контента, полей или сложной настройки используйте Popover, Drawer или Modal.
- Для основной навигации используйте Navigation/Sidebar/Tabs.
- Не используйте Dropdown Menu для destructive action без confirmation rule.
- Не смешивайте commands и persistent selection без явного pattern.

### Ключевые принципы

- **Commands before content** — menu item запускает действие, а не хранит длинный контент.
- **Danger is explicit** — destructive item визуально и текстово отделен.
- **Keyboard is first-class** — меню полностью работает с клавиатуры.
- **Icons support, text decides** — icon не заменяет label.
- **AI assists, system governs** — AI может предложить структуру меню, но человек подтверждает actions и risk.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `trigger` | да | Кнопка или icon button, открывающая меню. |
| `menu` | да | Overlay container списка. |
| `group` | опционально | Смысловая группа items. |
| `group-title` | условно | Название группы, если оно помогает сканированию. |
| `item` | да | Команда или action. |
| `item-icon` | опционально | Дополнительный визуальный маркер команды. |
| `item-label` | да | Текст команды. |
| `item-description` | опционально | Короткий контекст, если label недостаточен. |
| `shortcut` | опционально | Keyboard shortcut для команды. |
| `separator` | опционально | Разделение групп. |
| `checkmark` | условно | Selected/checkable state, если menu поддерживает checked item. |

Подкомпоненты в Figma:

| Component | Назначение |
| --- | --- |
| `DropdownMenu` | Container меню с type/size variants. |
| `dropdown-menu-item` | Item action. |
| `dropdown-menu-group-header` | Заголовок группы. |
| `dropdown-menu-separator` | Разделитель. |

---

## 3. Types / Variants

Figma component set: `DropdownMenu`. Variants: 20.

| Property | Default | Options |
| --- | --- | --- |
| `type` | `menu` | `menu`, `with-icons`, `with-shortcuts`, `grouped`, `danger` |
| `size` | `s` | `s`, `m`, `l`, `xl` |

### Type rules

| Type | Когда использовать | Правило |
| --- | --- | --- |
| `menu` | Базовый список команд. | Item label обязателен. |
| `with-icons` | Команды легче сканировать по icon. | Icon поддерживает label, но не заменяет его. |
| `with-shortcuts` | Команды имеют реальные keyboard shortcuts. | Shortcut должен работать в продукте или быть удален. |
| `grouped` | Есть смысловые группы. | Group title или separator должен помогать, а не шуметь. |
| `danger` | Есть destructive action. | Danger item отделяется и требует confirmation rule при высоком риске. |

Если нужны nested submenus, checkbox/radio menu, async menu items или permission-based visibility, пометьте как `Needs system review`, пока pattern не описан.

---

## 4. Sizes

| Size | Контекст | Правило |
| --- | --- | --- |
| `s` | Dense table actions и compact toolbar. | Используйте только с короткими labels. |
| `m` | Базовый dropdown. | Рекомендуемый default. |
| `l` | Touch/mixed input и более крупные rows. | Хорош для menus с icons/descriptions. |
| `xl` | Touch-first или mobile menus. | Row height должен быть достаточным для touch. |

Menu width задается содержимым или handoff rule. Long labels должны переноситься или обрезаться с tooltip/accessibility label, если это согласовано.

---

## 5. States

| State | Где применяется | Правило |
| --- | --- | --- |
| `closed` | Trigger/menu | Menu скрыто, trigger доступен. |
| `open` | Trigger/menu | Menu видно, trigger имеет `aria-expanded="true"`. |
| `hover` | Item | Не запускает action. |
| `focus` | Trigger/item | Focus indicator видим. |
| `active` | Item | Pointer/key press feedback. |
| `disabled` | Item | Команда видима, но недоступна; причина должна быть понятна. |
| `selected` / `checked` | Item | Используется только для checkable menu pattern. |
| `danger` | Item | Destructive action с отдельным visual/text treatment. |

State ownership:

- Trigger владеет open/close.
- Item владеет hover/focus/active/disabled.
- Product logic владеет permission, confirmation и action result.

---

## 6. Behavior

### Opening and closing

- Click, `Enter` или `Space` по trigger открывает menu.
- `Esc` закрывает menu и возвращает focus на trigger.
- Click outside закрывает menu.
- После выбора обычного command item menu закрывается.
- Если item открывает confirmation/modal, focus behavior описывается в handoff.

### Actions

- Item action должен быть идемпотентным или иметь confirmation, если действие destructive.
- Danger item не размещается первым, если это повышает риск случайного выбора.
- Disabled item не запускает action мышью или клавиатурой.
- Shortcut отображается только если реально поддержан.
- Permission-hidden actions должны быть согласованы: скрывать или disabled с объяснением.

### Keyboard

| Key | Поведение |
| --- | --- |
| `Enter` / `Space` | Открывает menu или активирует item. |
| `ArrowDown` / `ArrowUp` | Перемещает focus между items. |
| `Home` / `End` | Переходит к первому/последнему item, если поддержано. |
| `Esc` | Закрывает menu. |
| Character key | Может активировать typeahead, если описано в handoff. |
| `Tab` | Закрывает menu или переводит focus по platform rule. |

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Trigger name | Trigger имеет accessible name: например "Действия". |
| Expanded state | Trigger передает `aria-expanded`. |
| Relationship | Trigger связан с menu через `aria-controls` или equivalent. |
| Menu semantics | Menu и items используют корректные roles или framework equivalent. |
| Item label | Каждый item имеет текстовый label. |
| Disabled | Disabled item программно недоступен. |
| Shortcut | Shortcut text не заменяет label. |
| Danger | Danger не передается только цветом. |
| Focus return | После закрытия focus возвращается на trigger или следующий ожидаемый target. |

Accessibility checklist:

- [ ] Trigger имеет понятное accessible name.
- [ ] Menu открывается и закрывается с клавиатуры.
- [ ] Focus не теряется при close/action.
- [ ] Disabled и danger states не различаются только цветом.
- [ ] Shortcut реально работает или не отображается.
- [ ] Destructive action имеет confirmation rule, если риск высокий.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`. Для Dropdown Menu используются component tokens из namespace `dropdown-menu`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/dropdown-menu/surface/default` | Menu surface. | `surface/overlay` |
| `$collections/components/$modes/Mode 1/dropdown-menu/border/default` | Menu border. | `border/default` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/foreground/default` | Item label. | `text/primary` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/foreground/secondary` | Secondary item text. | `text/secondary` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/foreground/disabled` | Disabled item text. | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/foreground/selected` | Selected item text. | `text/primary` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/surface/default` | Item default surface. | `color/transparent` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/surface/hover` | Item hover surface. | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/surface/active` | Item active surface. | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/surface/selected` | Selected item surface. | `container/neutral/selected` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/surface/disabled` | Disabled item surface. | `color/transparent` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/icon/default` | Item icon. | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/icon/selected` | Selected item icon. | `icon/primary` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/icon/disabled` | Disabled item icon. | `status/disabled/icon` |
| `$collections/components/$modes/Mode 1/dropdown-menu/item/description/foreground` | Item description. | `text/tertiary` |
| `$collections/components/$modes/Mode 1/dropdown-menu/group-title/foreground` | Group title. | `text/tertiary` |
| `$collections/components/$modes/Mode 1/dropdown-menu/separator/default` | Separator. | `border/subtle` |
| `$collections/components/$modes/Mode 1/dropdown-menu/checkmark/default` | Checkmark default. | `text/primary` |
| `$collections/components/$modes/Mode 1/dropdown-menu/checkmark/selected` | Checkmark selected. | `icon/primary` |

Token gaps:

- Danger-specific item tokens не перечислены в текущей таблице; используйте existing status/danger semantic tokens только с пометкой `Token gap`, если visual design требует отдельного danger treatment.
- Nested submenu tokens требуют system review.
- Не используйте raw colors для danger, hover, selected или separator.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Type | `type` | `menu`, `with-icons`, `with-shortcuts`, `grouped`, `danger`. |
| Size | `size` | `s`, `m`, `l`, `xl`. |
| Open | `open`, `onOpenChange` | Controlled/uncontrolled modes не смешиваются. |
| Trigger | `trigger`, `triggerAriaLabel` | Trigger имеет accessible name. |
| Items | `items` | Массив actions/groups/separators. |
| Item action | `onSelect`, `action` | Выполняется при выборе item. |
| Disabled | `item.disabled` | Блокирует action. |
| Danger | `item.danger` | Требует confirmation rule при высоком риске. |
| Shortcut | `item.shortcut` | Отображается только если работает. |
| Selected | `item.selected` | Только для checkable menu pattern. |

Contract rules:

- Item id должен быть stable.
- Item label обязателен.
- Action result не должен зависеть только от visual order.
- Permission rules должны описывать: hidden или disabled.
- Danger action должен иметь отдельный owner и confirmation behavior.

---

## 10. Handoff notes

Handoff для Dropdown Menu должен включать:

- Figma component и node id: `7036:567`;
- `type`, `size`, trigger type и placement;
- список items: id, label, icon, shortcut, disabled, danger, selected, group;
- open/close behavior и focus return;
- keyboard navigation;
- action owner и result behavior;
- confirmation rule для destructive actions;
- permission/availability rules;
- token mapping и token gaps;
- mobile behavior: dropdown, bottom sheet или contextual menu.

### Acceptance criteria

- Dropdown Menu использует only documented `type` и `size`.
- Trigger имеет accessible name и `aria-expanded`.
- Каждый item имеет stable id и text label.
- Keyboard navigation работает для всех enabled items.
- Disabled item не запускает action.
- Danger item не определяется только цветом и имеет confirmation rule при риске.
- Shortcut отображается только если поддержан.
- AI-generated output не добавляет actions, permissions или destructive behavior без `Needs system review`.

---

## 11. AI usage rules

- AI может предложить grouping и labels для menu items, но должен помечать unknown actions как `Needs system review`.
- AI должен сверять `tokens.json` перед изменением Design Tokens.
- AI не должен превращать Dropdown Menu в Select, Form или long-content Popover.
- AI не должен добавлять danger action, permission rule или shortcut без подтверждения человека.
- AI должен проверять, есть ли confirmation для destructive actions.
- AI может подготовить keyboard/accessibility checklist, но человек подтверждает command semantics.

---

## 12. Примеры

### Корректно

| Сценарий | Почему |
| --- | --- |
| Row actions: Edit, Duplicate, Archive, Delete. | Это компактный contextual command list. |
| Menu with shortcuts для часто используемых команд. | Shortcuts реально поддержаны. |
| Grouped menu с danger item в нижней группе. | Риск случайного выбора снижен. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Menu item открывает длинную форму. | Нужен Popover/Drawer/Modal. |
| Dropdown используется как field selection. | Нужен Select. |
| Delete action выполняется сразу. | Нужна confirmation/risk rule. |

---

## 13. Anti-patterns

- Использовать Dropdown Menu для выбора form value вместо Select.
- Показывать icon-only items без label.
- Отображать shortcut, который не работает.
- Ставить destructive action первым без причины.
- Скрывать permission logic от handoff.
- Делать disabled item без объяснимого контекста.
- Генерировать список commands через AI без проверки владельца действия.
