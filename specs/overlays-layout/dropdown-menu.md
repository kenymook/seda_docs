# Dropdown / Menu

> **Category** · Overlays & Layout
> **Version** · 1.0
> **Status** · needs-review
> **Owner** · TBD
> **Last reviewed** · 2026-05-09
> **Figma** · [ссылка на фрейм компонента]

---

## 1. Key Principles of Use

### Что это

Dropdown / Menu — overlay-компонент для показа компактного списка действий, команд или контекстных опций, связанных с trigger или выбранным объектом. Он помогает вынести второстепенные действия из основного интерфейса, сохраняя понятную навигацию, keyboard interaction и accessibility.

Dropdown / Menu не является form control для выбора значения. Если выбранное значение участвует в Form validation или сохраняется как field value, используйте Select. Если нужен поиск по командам, используйте Search или отдельный command-palette pattern.

### Когда использовать

**Используйте** — когда у объекта или области есть несколько действий:

- actions menu для строки таблицы, карточки или сущности;
- overflow menu для второстепенных действий;
- context menu по right click или long press;
- compact menu для дополнительных команд в toolbar;
- grouped menu с separators и group titles;
- menu item с icon, description, badge или shortcut.

**Не используйте:**

- Для выбора значения в форме — используйте [Select](../inputs/select.md).
- Для одного основного действия — используйте [Button](../actions/button.md) или [Icon Button](../actions/icon-button.md).
- Для постоянной навигации — используйте [Sidebar](../navigation/sidebar.md), Tabs или Navigation pattern.
- Для поиска и запуска большого набора команд — используйте [Search](../overlays-layout/search.md) или command-palette pattern.
- Для blocking decision — используйте [Modal](../feedback/modal.md).
- Для содержимого, которому нужен свободный layout, формы или сложные controls — используйте [Popover](../feedback/popover.md) или Drawer.

### Основные принципы

- **Actions явные** — каждый item должен иметь понятное действие, target или command handler.
- **Selection не является дефолтным поведением menu** — selected/checkmark нужен только для select-like или toggle menu item.
- **Destructive actions отделены** — destructive item ставится в конце группы и отделяется separator, если рядом есть safe actions.
- **Menus должны быть короткими** — длинные списки требуют поиска, группировки или другого pattern.
- **Keyboard behavior является частью компонента** — Arrow keys, Enter, Space, Escape, Home/End должны быть определены.
- **AI не превращает Select в Menu** — AI должен сохранять различие между action menu и value selection.

### Связанные спецификации

- [Button](../specs/actions/button.md)
- [Icon Button](../specs/actions/icon-button.md)
- [Select](../specs/inputs/select.md)
- [Search](../specs/overlays-layout/search.md)
- [Popover](../specs/feedback/popover.md)
- [Modal](../specs/feedback/modal.md)
- [Sidebar](../specs/navigation/sidebar.md)

---

## 2. Anatomy

```text
[Trigger button]
      |
      v
+------------------------------+
| Group title                  |
| [icon] Item label            |
|        Description     Ctrl+E|
| [icon] Item label            |
|------------------------------|
| [icon] Destructive action    |
+------------------------------+
```

| Часть | Обязательность | Описание |
| --- | --- | --- |
| `trigger` | да, кроме context menu | Button/Icon Button или object event, открывающий menu |
| `menuSurface` | да | Overlay surface, внутри которого находится menu content |
| `menuItem` | да | Clickable action, command, link или selectable item |
| `itemLabel` | да | Primary text элемента |
| `itemIcon` | опционально | Leading icon для сканируемости |
| `itemDescription` | опционально | Secondary text; используйте только если он помогает принять решение |
| `shortcut` | опционально | Подсказка по keyboard shortcut, не единственный способ активации |
| `groupTitle` | опционально | Некликабельный label группы |
| `separator` | опционально | Визуальное разделение между группами действий |
| `checkmark` | условно | Selection/toggle indicator для checked или selected items |
| `badge` | опционально | Малый status/count indicator, если нужен |

### Правила anatomy

- Menu требует минимум один actionable item.
- Trigger label/icon должен описывать область действий.
- Group title не фокусируется.
- Separator не озвучивается как menu item.
- Destructive item не должен быть визуально спрятан среди обычных действий.
- Item description не должен повторять label.

---

## 3. Types / Variants

### Типы menu

| Тип | Описание | Когда использовать |
| --- | --- | --- |
| `menu` | Список действий или links | Object actions, toolbar overflow |
| `context-menu` | Menu, открываемое контекстным событием | Right click, long press, canvas/table context |
| `select-menu` | Menu-like value selection | Только если задокументировано; для форм обычно используйте Select |
| `command-menu` | Короткий список команд без полноценного поиска | Command groups с ограниченным количеством items |

### Варианты item

| Вариант | Описание | Правило |
| --- | --- | --- |
| `default` | Text-only item | Дефолтный action item |
| `with-icon` | Leading icon плюс label | Иконка должна усиливать смысл действия |
| `with-description` | Label плюс secondary text | Используйте для неоднозначных или важных действий |
| `with-shortcut` | Shortcut hint | Shortcut должен быть описан в product behavior |
| `with-badge` | Count/status badge | Используйте редко, чтобы не перегружать layout |
| `selected` | Текущее значение или selected command | Только для select-like или stateful item |
| `checkbox-item` | Multi-select/toggle item | Требует checked state |
| `radio-item` | Single choice внутри группы | Требует один selected item в группе |
| `destructive` | Опасное действие | Требует separation и часто confirmation |
| `disabled` | Недоступное действие | Нужно объяснить причину, если она не очевидна |

### Placement

| Placement | Когда использовать |
| --- | --- |
| `bottom-start` | Дефолт для left-aligned triggers |
| `bottom-end` | Toolbar/action menus у правого края |
| `top-start` | Когда снизу нет места |
| `top-end` | Right-aligned trigger у нижнего края |

---

## 4. Sizes

Размер Dropdown / Menu управляет плотностью, высотой item, размером icon, шириной menu и spacing. Компонент должен следовать overlay, spacing, typography и touch-target rules.

| Size | Плотность item | Когда использовать |
| --- | --- | --- |
| `compact` | Плотная высота item и короткие labels | Data tables, toolbars, dense desktop UI |
| `medium` | Дефолтный spacing | Большинство product menus |
| `large` | Увеличенная hit area и место для descriptions | Touch contexts, menus with descriptions |

### Правила размеров

- Используйте `medium` по умолчанию.
- Используйте `compact` только когда все items остаются читаемыми, а keyboard focus — заметным.
- Используйте `large`, когда menu items содержат descriptions, badges или touch interaction.
- Ширина menu должна помещать самый длинный label без обрезки типовых действий.
- Не используйте viewport-scaled font sizes; лучше расширьте menu или перенесите текст.

---

## 5. States

### Состояния контейнера

| State | Значение | Обязательное поведение |
| --- | --- | --- |
| `closed` | Menu скрыто | Trigger остается focusable |
| `open` | Menu видно | Active/focused item управляется компонентом |
| `positioning` | Overlay placement рассчитывается | Избегайте видимого layout jump |
| `empty` | Нет доступных actions | Лучше скрыть trigger или показать disabled reason |

### Состояния item

| State | Значение | Визуальное изменение |
| --- | --- | --- |
| `default` | Базовое состояние item | Default foreground и transparent/default surface |
| `hover` | Pointer над item | Hover surface |
| `active` | Item нажат | Active surface |
| `focus` | Keyboard focus | Видимый focus treatment |
| `selected` | Current value или checked item | Selected surface и checkmark/icon |
| `disabled` | Action недоступен | Disabled foreground/icon и нет activation |
| `destructive` | Опасное действие | Danger foreground или icon treatment |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
| --- | --- | --- |
| `selected` + `hover` | да | Selected meaning остается видимым |
| `destructive` + `disabled` | да | Disabled style побеждает destructive activation |
| `disabled` + `active` | нет | Disabled item не активируется |
| `groupTitle` + `focus` | нет | Group title не интерактивен |
| `separator` + `selected` | нет | Separator не имеет state |

---

## 6. Behavior

### Открытие и закрытие

- Trigger открывает menu по click/tap, `Enter`, `Space` или документированному shortcut.
- Context menu открывается по `contextmenu` event или long press, если это поддержано.
- Menu закрывается по `Escape`, outside click, уходу focus из menu pattern или activation item для single action menus.
- После закрытия focus возвращается на trigger или объект, открывший context menu.
- Menu должно оставаться внутри viewport и обновлять placement при нехватке места.

### Активация item

- Action item выполняет command и закрывает menu.
- Link item выполняет navigation и закрывает menu.
- Checkbox item переключает state и может оставить menu открытым.
- Radio item выбирает value; close behavior зависит от product pattern.
- Destructive item должен открывать confirmation или иметь явно reversible action.
- Disabled item не выполняет действие и должен объяснять причину, если это нужно.

### Поведение списка

- Держите menus короткими; если items больше 10-12, нужна grouping, search или другой pattern.
- Primary/common actions ставятся первыми.
- Destructive actions ставятся последними и отделяются от safe actions.
- Не смешивайте navigation, destructive actions и selection без понятной grouping.
- Не помещайте формы, длинный content или multi-step flows внутрь menu.

### Keyboard interaction

| Клавиша | Действие |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Переместить active item |
| `Enter` | Активировать focused item |
| `Space` | Активировать или toggle focused item |
| `Escape` | Закрыть menu и вернуть focus |
| `Home` | Перейти к первому enabled item |
| `End` | Перейти к последнему enabled item |
| Character key | Опциональный typeahead к matching item |
| `Tab` | Обычно закрывает menu и переводит focus дальше |

---

## 7. Accessibility

Dropdown / Menu следует [foundation/accessibility.md](../../foundation/accessibility.md) и overlay interaction rules.

| Требование | Правило |
| --- | --- |
| Trigger semantics | Используйте Button/Icon Button semantics, если trigger есть |
| Expanded state | Trigger показывает open state |
| Popup type | Используйте menu/listbox semantics в соответствии с реальным поведением |
| Item roles | Action items, links и selected options используют подходящие roles |
| Disabled state | Disabled items не активируются |
| Focus management | Открытие переводит focus в menu или управляет active descendant |
| Focus return | Закрытие возвращает focus на trigger/object |
| Typeahead | Если поддержан, active item меняется предсказуемо |
| Shortcut hints | Hints — визуальная помощь, не единственный способ активации |
| Destructive action | Не должен распознаваться только по цвету |

### Accessibility checklist

- [ ] Trigger имеет accessible name и open state.
- [ ] Menu container использует role, соответствующий поведению.
- [ ] Keyboard navigation достигает каждого enabled item.
- [ ] Disabled items не активируются.
- [ ] Selected или checked items озвучиваются.
- [ ] Destructive item понятен без опоры только на цвет.
- [ ] Focus корректно возвращается после закрытия.
- [ ] Context menu имеет keyboard alternative.

---

## 8. Design Tokens

Component paths ниже сверены с `tokens.json`. Они записаны как component paths, чтобы не путать их с semantic token references.

| Роль | Component path | Semantic |
| --- | --- | --- |
| Menu surface | dropdown-menu surface default | `surface/overlay` |
| Menu border | dropdown-menu border default | `border/default` |
| Item foreground default | dropdown-menu item foreground default | `text/primary` |
| Item foreground disabled | dropdown-menu item foreground disabled | `status/disabled/text` |
| Item foreground secondary | dropdown-menu item foreground secondary | `text/secondary` |
| Item foreground selected | dropdown-menu item foreground selected | `text/primary` |
| Item surface default | dropdown-menu item surface default | `color/transparent` |
| Item surface hover | dropdown-menu item surface hover | `container/neutral/hover` |
| Item surface active | dropdown-menu item surface active | `container/neutral/pressed` |
| Item surface selected | dropdown-menu item surface selected | `container/neutral/selected` |
| Item surface disabled | dropdown-menu item surface disabled | `color/transparent` |
| Item icon default | dropdown-menu item icon default | `icon/tertiary` |
| Item icon selected | dropdown-menu item icon selected | `icon/primary` |
| Item icon disabled | dropdown-menu item icon disabled | `status/disabled/icon` |
| Item description foreground | dropdown-menu item description foreground | `text/tertiary` |
| Group title foreground | dropdown-menu groupTitle foreground | `text/tertiary` |
| Separator | dropdown-menu separator default | `border/subtle` |
| Checkmark default | dropdown-menu checkmark default | `text/primary` |
| Checkmark selected | dropdown-menu checkmark selected | `icon/primary` |

### Token gaps

- Сейчас у Dropdown / Menu нет component tokens для menu shadow, radius, item height, item padding, item gap, max height, placement offset или animation.
- Используйте foundation radius, spacing, elevation, motion и overlay rules, пока не появятся component-specific tokens.
- Не придумывайте `--menu-*` или новые Dropdown / Menu token paths в specs, code, Figma или AI-generated handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Примечания |
| --- | --- | --- |
| Type | `type` | `menu`, `context-menu`, `select-menu`, `command-menu` |
| Size | `size` | `compact`, `medium`, `large` |
| Open state | `open` | Controlled или uncontrolled |
| Placement | `placement` | `bottom-start`, `bottom-end`, `top-start`, `top-end` |
| Trigger | `trigger` | Button/Icon Button или context event |
| Items | `items` | Список item objects |
| Item id | `item.id` | Stable key и action id |
| Item label | `item.label` | Обязательный visible text |
| Item kind | `item.kind` | `action`, `link`, `checkbox`, `radio`, `separator`, `groupTitle` |
| Item icon | `item.icon` | Optional leading icon |
| Description | `item.description` | Optional secondary text |
| Shortcut | `item.shortcut` | Optional visual hint |
| Disabled | `item.disabled` | Блокирует activation |
| Selected/checked | `item.selected` / `item.checked` | Selection state |
| Destructive | `item.destructive` | Требует danger treatment и review |
| Activation | `onAction` / `onSelect` | Command или selection handler |

### Contract rules

- Каждый interactive item требует `id`, `label`, `kind` и activation behavior.
- Separator и group title не интерактивны.
- Select-like menu behavior должен описывать single/multi selection и close behavior.
- Context menu должен определить object/context, к которому относится.
- Destructive item требует confirmation, undo или документированного безопасного результата.

---

## 10. Handoff notes

В handoff нужно передать:

- menu type, size, placement и trigger;
- item schema: `id`, `label`, `kind`, `icon`, `description`, `shortcut`, `disabled`, `selected`, `destructive`;
- command/action target для каждого interactive item;
- grouping order, separator placement и destructive action placement;
- open/close behavior и focus return;
- keyboard behavior, typeahead и context menu keyboard alternative;
- viewport collision handling и responsive behavior;
- token mapping для surface, border, item foreground, item surface, icons, group title, separator и checkmark;
- token gaps для shadow, radius, spacing, dimensions и motion.

### Acceptance criteria

- Trigger открывает и закрывает menu с pointer и keyboard.
- Menu placement остается внутри viewport.
- Enabled items доступны и активируются с keyboard.
- Disabled, selected, destructive и separator states различимы.
- Destructive action отделен и имеет безопасную обработку.
- Select-like usage не применяется там, где для Form value нужен Select.
- Компонент использует документированные Dropdown / Menu component paths и semantic tokens.
- AI-generated drafts не добавляют unsupported items, states, token names или shortcuts.

---

## 11. AI usage rules

- AI может использовать Dropdown / Menu для компактных списков действий и contextual commands.
- AI должен рекомендовать Select, когда menu представляет form value или участвует в validation.
- AI должен рекомендовать Button/Icon Button, когда есть только одно действие.
- AI не должен придумывать item variants, shortcuts, destructive behavior, token paths или keyboard rules.
- AI должен проверять `tokens.json` перед изменением Dropdown / Menu token mappings.
- AI должен помечать missing trigger, missing item action target, unclear selection behavior, unsafe destructive action, inaccessible keyboard navigation или unsupported long menu как `Needs system review`.
- AI может подготовить item schemas, Handoff notes и acceptance criteria, но финальное решение остается за человеком.

---

## 12. Examples

### Корректно

| Сценарий | Использование |
| --- | --- |
| Table row actions | `type=menu`, item actions: Edit, Duplicate, Archive |
| Toolbar overflow | `type=menu`, `placement=bottom-end`, grouped secondary commands |
| Canvas right click | `type=context-menu`, target object передается в context |
| Toggle visibility options | Checkbox items с понятным checked state |
| Dangerous delete | Destructive item в конце, separated и confirmed |

### Требует review

| Сценарий | Причина |
| --- | --- |
| Menu хранит selected form value | Используйте Select, если не описано иное |
| Menu содержит 30 ungrouped actions | Нужен search, grouping или другой pattern |
| Destructive action смешан с safe actions | Риск случайной activation |
| Icon-only items без labels | Accessibility gap |
| AI добавляет shortcut, которого продукт не поддерживает | Unsupported behavior |

---

## 13. Anti-patterns

- Использовать Dropdown / Menu как скрытый drawer для сложного content.
- Помещать формы, sliders или multi-step flows внутрь menu.
- Использовать destructive color без separation или confirmation.
- Полагаться на hover-only item actions.
- Показывать disabled items без причины, когда причина не очевидна.
- Смешивать select, navigation и destructive commands без grouping.
- Создавать raw colors, shadows или недокументированные token names для menu states.
