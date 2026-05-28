# Chip

> **Category** · Data Display
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-28
> **Figma** · [Chip](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=978-11403)

---

## 1. Key Principles / Принципы использования

### Что это

Chip — компактный интерактивный элемент для выбранного значения, фильтра или короткого объекта, который можно раскрыть, выбрать или удалить. Chip обычно живет внутри Select multi, filter bar, search query builder или compact control group.

В SEDA AI Chip является selection contract: он должен явно описывать выбранное значение, тип взаимодействия, control behavior, states, token mapping и accessibility. AI может помогать собирать набор фильтров или handoff notes, но не должен превращать Chip в произвольную метку, кнопку или Badge.

### Когда использовать

Используйте Chip, когда:

- нужно показать выбранное значение в multi-select;
- пользователь может удалить выбранное значение;
- фильтр представлен коротким label и может быть сброшен;
- chip открывает связанный picker, menu или select;
- нужно показать компактный объект с ограниченным действием;
- набор chips является частью формы, фильтрации или настройки запроса.

### Не используйте

Не используйте Chip, когда:

- нужна статичная метка без взаимодействия — используйте [Tag](tag.md);
- нужен счетчик, dot или системный сигнал на host-элементе — используйте [Badge](badge.md);
- нужно выполнить самостоятельное действие — используйте [Button](../actions/button.md) или [Icon Button](../actions/icon-button.md);
- нужен длинный текстовый статус — используйте Tag или Description List;
- значение должно быть редактируемым текстом — используйте input pattern;
- chip становится основной навигацией между разделами — используйте Tabs или navigation pattern.

### Основные принципы

- **Selected value first** — Chip показывает выбранное значение, а не произвольный декоративный label.
- **One clear control** — control внутри Chip должен иметь один смысл: remove, expand или select.
- **Short labels only** — label должен оставаться коротким и не ломать layout.
- **No hidden destructive action** — удаление значения должно быть понятно по label и accessible name.
- **State is explicit** — selected, hover, active, focus и disabled должны быть описаны отдельно.
- **Tokens before visuals** — цвет, border, icon и focus задаются через component tokens.
- **AI assists, system governs** — AI может предложить структуру chips, но использует только documented variants, states, props и tokens.

### Связанные спецификации

- [Tag](tag.md) — статичная, selectable или dismissible метка.
- [Badge](badge.md) — count/status signal на host-элементе.
- [Button](../actions/button.md) — самостоятельное действие.
- [Icon Button](../actions/icon-button.md) — icon-only действие.

---

## 2. Anatomy / Анатомия

| Slot | Обязательность | Описание |
|---|---:|---|
| `root` | Да | Контейнер Chip. Управляет surface, border, radius и state. |
| `label` | Да | Видимое значение или название фильтра. |
| `leadingIcon` | Нет | Иконка категории, сущности или типа фильтра. |
| `control` | Нет | Встроенный control для remove, expand или select action. |
| `controlIcon` | Нет | Иконка control: close, chevron или check. |

### Правила анатомии

- `label` обязателен для всех вариантов Chip.
- `control` не должен быть декоративным: если он есть, у него должен быть action и accessible name.
- `leadingIcon` не заменяет label.
- `controlIcon` должен совпадать со смыслом действия: close для remove, chevron для expand, check для selected.
- Внутри Chip не размещаются Badge, nested Button, input, tooltip trigger или второй action.
- Chip не должен становиться многострочным; длинный label сокращается по правилам truncation.

---

## 3. Types / Variants / Варианты

| Variant | Когда использовать | Поведение |
|---|---|---|
| `default` | Выбранное значение без заливки. | Border + transparent surface. |
| `filled` | Более заметный selected/filter state. | Neutral filled surface. |
| `selected` | Chip входит в selectable group и выбран. | Brand surface, selected foreground. |

### Control variants

| Control | Когда использовать | Требование |
|---|---|---|
| `none` | Chip только отображает selected value. | Не фокусируется отдельно, если нет interaction. |
| `remove` | Значение можно удалить. | Нужен `removeLabel` и keyboard support. |
| `expand` | Chip открывает picker, menu или select. | Нужны `aria-expanded`, `aria-controls` при наличии popup. |
| `select` | Chip переключает selected state. | Нужны `aria-pressed` или checkbox/radio pattern в зависимости от группы. |

---

## 4. Sizes / Размеры

| Size | Когда использовать | Примечание |
|---|---|---|
| `s` | Dense forms, compact filters, table toolbars. | Минимальная плотность. |
| `m` | Базовый размер для большинства интерфейсов. | Default в Figma. |
| `l` | Touch-friendly surfaces и mobile. | Используйте, когда нужна большая hit area. |
| `xl` | Специальные touch-heavy сценарии. | Требует проверки плотности layout. |

### Правила размеров

- Размер должен совпадать с плотностью контейнера: toolbar, form, filter bar или mobile surface.
- Click/tap target для interactive Chip должен соответствовать accessibility rules продукта.
- Если visual height меньше целевого tap area, hit area расширяется без изменения visual box.
- Padding, radius, gap, icon size и typography пока задаются foundation rules и Figma variants, а не отдельными component tokens.

---

## 5. States / Состояния

| State | Описание | Token behavior |
|---|---|---|
| `default` | Chip доступен и не находится под pointer. | `chip/surface/default`, `chip/border/default`, `chip/foreground/default`. |
| `hover` | Pointer над Chip или control. | `chip/surface/hover`, `chip/border/hover`, control hover tokens. |
| `active` | Момент нажатия. | `chip/surface/active`, `chip/border/active`, control active tokens. |
| `focus` | Keyboard focus на Chip или control. | `chip/focus/ring`. |
| `selected` | Chip выбран в selectable group. | `chip/surface/selected`, `chip/border/selected`, selected foreground/icon. |
| `disabled` | Chip недоступен. | `chip/surface/disabled`, `chip/border/disabled`, disabled foreground/icon. |

### State ownership

- `hover` и `active` могут принадлежать всему Chip или только `control`, если action локализован в control.
- `selected` применяется только для selectable Chip или выбранного filter value.
- `disabled` блокирует все действия Chip, включая remove и expand.
- `focus` должен быть видимым на интерактивной части, которая получает keyboard focus.

---

## 6. Behavior / Поведение

### Remove behavior

- Remove control удаляет только связанное значение, а не весь список или фильтр целиком.
- После удаления фокус переходит на следующий Chip, предыдущий Chip или control контейнера.
- Если удаление запускает async update, Chip может оставаться до подтверждения или удаляться оптимистично только по product rule.
- Ошибка удаления должна возвращать значение или показывать feedback рядом с control area.

### Expand behavior

- Expand Chip открывает связанный picker, menu, select или filter editor.
- `aria-expanded` обновляется вместе с состоянием popup.
- Повторное нажатие закрывает popup, если это соответствует pattern выбранного control.
- Закрытие через `Escape` возвращает фокус на Chip.

### Select behavior

- Selectable Chip переключает selected state.
- В группе с множественным выбором используйте checkbox-like semantics.
- В группе с одиночным выбором используйте radio-like или tabs pattern, если chip фактически переключает view.
- Selected state не должен быть передан только цветом.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещает фокус к интерактивному Chip или control. |
| `Enter` | Активирует remove, expand или select action. |
| `Space` | Активирует remove, expand или select action, если role допускает. |
| `Delete` / `Backspace` | Удаляет Chip, если focus на removable Chip и это documented behavior. |
| `Escape` | Закрывает popup, если Chip находится в expand mode. |

---

## 7. Accessibility

Chip должен следовать [foundation/accessibility.md](../../foundation/accessibility.md) и не полагаться только на цвет или иконку для передачи смысла.

| Сценарий | Требование | Пример |
|---|---|---|
| Removable Chip | У control есть явный accessible name. | `Удалить фильтр: Статус Активен`. |
| Expand Chip | Есть `aria-expanded` и связь с popup. | `aria-controls="status-filter-menu"`. |
| Selectable Chip | Selected state доступен screen reader. | `aria-pressed="true"` или checkbox semantics. |
| Disabled Chip | Disabled state не допускает activation. | Native disabled control или `aria-disabled` + guard. |
| Icon-only control | Иконка скрыта от screen reader, смысл передан label. | `aria-hidden="true"` на icon. |

### Accessibility checklist

- [ ] Chip имеет короткий видимый label.
- [ ] Remove/expand/select action имеет accessible name.
- [ ] Focus ring видим на keyboard focus.
- [ ] Selected state не передан только цветом.
- [ ] Disabled Chip не активируется мышью, touch и keyboard.
- [ ] После remove focus не теряется.
- [ ] Popup, открытый через Chip, связан с trigger через ARIA.
- [ ] Длинные labels имеют readable truncation и полный текст доступен по product pattern.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Chip доступны component tokens в namespace `chip`; устаревшие aliases вида `--chip-*` не являются source of truth.

| Component token | Роль | Semantic mapping |
|---|---|---|
| `chip/surface/default` | Surface для default Chip. | `color/transparent` |
| `chip/surface/filled` | Surface для filled Chip. | `container/neutral/default` |
| `chip/surface/hover` | Hover surface. | `container/neutral/hover` |
| `chip/surface/active` | Active surface. | `container/neutral/pressed` |
| `chip/surface/selected` | Selected surface. | `container/brand/default` |
| `chip/surface/disabled` | Disabled surface. | `status/disabled/container` |
| `chip/border/default` | Default border. | `border/default` |
| `chip/border/hover` | Hover border. | `border/hover` |
| `chip/border/active` | Active border. | `border/strong` |
| `chip/border/selected` | Selected border. | `border/brand/default` |
| `chip/border/disabled` | Disabled border. | `status/disabled/border` |
| `chip/foreground/default` | Label color. | `text/primary` |
| `chip/foreground/filled` | Filled label color. | `text/primary` |
| `chip/foreground/selected` | Selected label color. | `text/on-brand/primary` |
| `chip/foreground/disabled` | Disabled label color. | `status/disabled/text` |
| `chip/icon/default` | Leading icon color. | `icon/tertiary` |
| `chip/icon/filled` | Filled leading icon color. | `icon/secondary` |
| `chip/icon/selected` | Selected icon color. | `text/on-brand/primary` |
| `chip/control/icon` | Control icon base color. | `text/tertiary` |
| `chip.control.icon.default` | Control icon default. | `icon/tertiary` |
| `chip.control.icon.hover` | Control icon hover. | `icon/primary` |
| `chip.control.icon.active` | Control icon active. | `icon/primary` |
| `chip/control/surface/hover` | Control hover surface. | `container/neutral/hover` |
| `chip/control/surface/active` | Control active surface. | `container/neutral/pressed` |
| `chip/remove/icon/default` | Remove icon default. | `icon/tertiary` |
| `chip/remove/icon/hover` | Remove icon hover. | `icon/primary` |
| `chip/remove/icon/selected` | Remove icon on selected Chip. | `text/on-brand/primary` |
| `chip/remove/surface/hover` | Remove hover surface. | `container/neutral/hover` |
| `chip.remove.surface.selectedHover` | Remove hover surface on selected Chip. | `container/brand/hover` |
| `chip/focus/ring` | Focus ring. | `focus/ring` |

### Token gaps

- Size, height, radius, padding, gap, typography, icon size и hit area пока описаны через foundation rules и Figma variants, а не отдельные Chip component tokens.
- `danger` или `warning` tone для Chip не описан; если нужен рискованный фильтр или удаление с последствиями, используйте product confirmation или другой pattern.
- Не придумывайте новые Chip token paths без обновления `tokens.json` и Figma bindings.

---

## 9. Code mapping

| Spec concept | Code prop / attribute | Notes |
|---|---|---|
| Variant | `variant` | Values: `default`, `filled`, `selected`. Должен соответствовать Figma variants и token mapping. |
| Size | `size` | Values: `s`, `m`, `l`, `xl`. Значения совпадают с Figma variants. |
| Label | `children` или `label` | Обязательный видимый текст. |
| Leading icon | `leadingIcon` | Не заменяет label. |
| Control | `control` | Values: `none`, `remove`, `expand`, `select`. Определяет interaction contract. |
| Remove action | `onRemove` | Требует `removeLabel`. |
| Expand action | `onOpenChange`, `expanded`, `controlsId` | Требует ARIA-связь с popup. |
| Select action | `selected`, `onSelectedChange` | Используется только для selectable group. |
| Disabled | `disabled` или `aria-disabled` | Blocking guard обязателен для non-native element. |
| Truncation | `maxWidth`, `truncate` | Не должен скрывать критичный смысл без fallback. |

### Contract rules

- Chip без interaction может рендериться как `span` или `div`, но interactive Chip должен использовать native button/control semantics или корректный ARIA pattern.
- `onRemove`, `onOpenChange` и `onSelectedChange` не должны одновременно конкурировать за один click target.
- Если весь Chip раскрывает меню, remove control должен быть отдельным focusable target или отсутствовать.
- Если `disabled=true`, все action callbacks игнорируются.

---

## 10. Handoff notes

Handoff для Chip должен фиксировать:

- список chips и источник данных;
- variant, size и control для каждого типа Chip;
- что происходит при remove, expand или select;
- правило truncation и max width;
- порядок keyboard focus внутри группы;
- состояние после удаления последнего Chip;
- связь с popup/menu/select, если Chip раскрывает control;
- tokens для surface, border, foreground, icon, control и focus;
- empty/error/loading behavior контейнера, если chips зависят от async data.

---

## 11. Acceptance criteria

- [ ] Chip используется для selected value, filter value или compact interactive object.
- [ ] Для статичной метки выбран Tag, а для count/status signal выбран Badge.
- [ ] Chip имеет короткий visible label.
- [ ] Variant, size, state и control соответствуют documented values.
- [ ] Remove/expand/select action имеет понятный accessible name.
- [ ] Focus ring видим и использует `chip/focus/ring`.
- [ ] Disabled Chip не активируется.
- [ ] После remove focus остается предсказуемым.
- [ ] Длинный label не ломает layout.
- [ ] Используются реальные Chip component tokens из `tokens.json`.
- [ ] Handoff описывает edge cases: последний Chip, async remove, popup close, truncation.

---

## 12. AI usage rules

AI может:

- предложить набор chips для фильтров, multi-select или query builder;
- проверить, нужен ли Chip, Tag, Badge, Button или Icon Button;
- подготовить handoff notes для remove, expand, select и focus behavior;
- сгенерировать acceptance criteria для chips group;
- найти missing states, token gaps и accessibility gaps.

AI не должен:

- использовать Chip как обычную декоративную метку;
- превращать Chip в Badge, Button или navigation item;
- придумывать новые variants, sizes, controls или token names;
- добавлять destructive behavior без явного product rule;
- скрывать смысл remove action за одной иконкой без accessible name;
- рекомендовать color-only selected state.

Если требование выходит за contract Chip, AI должен пометить его как `Needs system review` и предложить ближайший documented component или pattern.

---

## 13. Examples / Примеры

### Корректно

| Сценарий | Решение |
|---|---|
| Multi-select с выбранными городами. | Removable Chips с label города и `onRemove`. |
| Filter bar со статусом заказа. | Filled Chip с remove control и явным `removeLabel`. |
| Chip открывает filter menu. | Expand Chip с `aria-expanded` и `aria-controls`. |
| Selectable quick filters. | Selectable Chips с documented selected state и keyboard support. |

### Требует review

| Сценарий | Почему нужна проверка |
|---|---|
| Chip содержит два действия: открыть меню и удалить. | Нужен явный focus order и отдельные targets. |
| Chip используется как ссылка на страницу. | Вероятно нужен Link или navigation component. |
| Chip содержит длинное название объекта. | Нужны truncation rules и accessible full label. |
| Remove запускает необратимое удаление объекта. | Нужен confirmation или другой destructive pattern. |

---

## 14. Anti-patterns

- Использовать Chip для статичного статуса без interaction.
- Использовать Chip как Badge для счетчика.
- Делать весь Chip кликабельным и одновременно добавлять nested remove без focus strategy.
- Передавать selected state только цветом.
- Использовать icon-only Chip без visible label.
- Добавлять произвольные color variants вне tokens.
- Прятать длинный label без доступного полного значения.
- Удалять Chip без понятного focus recovery.
