# Icon Button

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

Icon Button — кнопка действия без видимого текстового label, где единственный видимый контент — иконка. Компонент используется в плотных интерфейсах: toolbar, table row actions, карточки, header actions, close controls и overflow actions.

В SEDA AI Icon Button является action-компонентом с повышенным accessibility-риском: без текста пользователь может не понять действие, поэтому обязательны `aria-label`, Tooltip и строгая связь иконки с действием.

### Когда использовать

Используйте Icon Button, когда:

- пространство ограничено, а действие понятно из контекста;
- кнопка находится в toolbar или повторяющейся строке таблицы;
- действие является вспомогательным: close, copy, edit, delete, share, more;
- визуальный label перегрузит плотный интерфейс;
- Tooltip и accessible name можно задать явно.

### Не используйте

Не используйте Icon Button, когда:

- действие неочевидно по иконке и контексту — используйте [Button](../specs/actions/button.md) с label;
- это главный primary action страницы или сложного сценария;
- нельзя добавить Tooltip или accessible name;
- иконка используется как декоративный элемент;
- нужен постоянный selection/toggle pattern — используйте Button Group, Toggle или Segmented Control.

### Основные принципы

- **Accessible name is required** — каждый Icon Button имеет `aria-label`.
- **Tooltip mirrors the action** — Tooltip должен объяснять то же действие, что и accessible name.
- **Icon follows action** — иконка выбирается по смыслу действия, а не по визуальной симпатии.
- **Same hierarchy as Button** — visual priority следует тем же правилам, что Button.
- **Touch target is protected** — визуальный размер может быть small, но hit area должен быть доступным.
- **AI assists, system governs** — AI может предложить label и icon, но должен проверять доступность и не придумывать variants.

### Связанные спецификации

- [Button](../specs/actions/button.md) — действия с видимым текстовым label.
- [Button Group](../specs/actions/button-group.md) — группировка связанных icon actions.
- [Tooltip](../specs/feedback/tooltip.md) — обязательное пояснение для icon-only action.
- [Dropdown Menu](../specs/overlays-layout/dropdown-menu.md) — overflow actions.
- [Table](../specs/data-display/table.md) — row actions.

---

## 2. Anatomy / Анатомия

| Часть | Обязательность | Назначение |
|---|---:|---|
| `root` | Да | Нативный `<button>` и квадратный visual container. |
| `icon` | Да | SVG icon из iconography system. |
| `tooltip` | Да | Видимое пояснение действия при hover/focus. |
| `spinner` | Условно | Loading indicator вместо icon. |

### Правила анатомии

- `root` всегда квадратный: width equals height.
- `icon` не заменяет accessible name.
- Tooltip не должен содержать интерактивный контент.
- Spinner может заменить icon только во время `loading`.
- Если требуется text label, используйте Button.

---

## 3. Types / Variants / Варианты

| Variant | Назначение | Типичный сценарий |
|---|---|---|
| `primary` | Самое заметное icon-only действие в локальном контексте. | Add, create, main toolbar action. |
| `neutral` | Вторичное действие с контейнером и border. | Edit, open, copy в строке или карточке. |
| `ghost` | Минимальный визуальный вес. | Toolbar utilities, close, more, secondary row actions. |
| `danger` | Рискованное действие. | Delete, remove, revoke. |

### Modifiers

| Modifier | Назначение | Ограничения |
|---|---|---|
| `loading` | Async action выполняется. | Spinner заменяет icon, accessible name сохраняется. |
| `disabled` | Action недоступен. | Причина должна быть понятна из контекста. |
| `selected` | Временно допустим для toolbar/action state. | Для persistent toggle лучше использовать Toggle или Button Group. |

---

## 4. Sizes / Размеры

| Size | Control | Icon | Radius | Контекст |
|---|---:|---:|---:|---|
| `small` | 24x24px | 14px | 6px | Table rows, dense toolbar. |
| `medium` | 32x32px | 16px | 8px | Default для cards, panels, headers. |
| `large` | 40x40px | 18px | 10px | Prominent action, touch-friendly panels. |
| `extraLarge` | 48x48px | 20px | 12px | Mobile, large surfaces, high-emphasis controls. |

### Правила размеров

- Визуальный размер и hit area могут отличаться.
- Для touch input hit area должен быть не меньше 44x44px.
- Icon size не масштабируется произвольно.
- В Button Group все Icon Buttons используют один size.

---

## 5. States / Состояния

| State | Когда возникает | Правило |
|---|---|---|
| `default` | Кнопка доступна без взаимодействия. | Используются default surface, border и foreground. |
| `hover` | Pointer над кнопкой. | Используются hover tokens. |
| `pressed` | Pointer или keyboard activation. | Используются pressed tokens. |
| `focus` | Keyboard focus. | Используется shared focus ring. |
| `loading` | Async action выполняется. | Icon заменяется spinner, повторная активация блокируется. |
| `selected` | Кнопка отражает выбранное состояние в группе. | Допустимо только в documented grouped context. |
| `disabled` | Action недоступен. | Нативный disabled или `aria-disabled` по сценарию. |

### Допустимые сочетания

| Сочетание | Допустимо | Правило |
|---|---:|---|
| `hover` + `focus` | Да | Pointer может быть над focused control. |
| `pressed` + `focus` | Да | Keyboard activation. |
| `loading` + `focus` | Да | Фокус может остаться на кнопке во время запроса. |
| `selected` + `hover` | Да | Для grouped или toolbar state. |
| `hover` + `disabled` | Нет | Disabled отменяет interactive states. |

---

## 6. Behavior / Поведение

### Native behavior

- Используйте нативный `<button>`.
- Всегда задавайте `type="button"`, если Icon Button не является submit control.
- Не используйте clickable `<div>`.
- Не используйте Icon Button как Link; для navigation нужен Link или Button с явным navigation exception.

### Keyboard interaction

| Клавиша | Действие |
|---|---|
| `Tab` / `Shift+Tab` | Перемещает фокус к Icon Button или от него. |
| `Enter` | Активирует Icon Button. |
| `Space` | Активирует Icon Button. |
| `Escape` | Закрывает Tooltip, если он открыт. |

### Tooltip

- Tooltip появляется при hover и focus.
- Tooltip text должен совпадать по смыслу с `aria-label`.
- Tooltip не заменяет `aria-label`.
- Если Tooltip невозможен, Icon Button нельзя использовать для неочевидного действия.

### Loading

- Loading блокирует повторное действие.
- Spinner должен иметь token-driven color.
- Accessible name остается названием действия, а не становится "loading".
- После ошибки кнопка возвращается в actionable state или показывает error feedback рядом с контекстом.

---

## 7. Accessibility

| Элемент | Семантика | Правило |
|---|---|---|
| Root | `<button type="button">` | Default для icon-only action. |
| Icon | `aria-hidden="true"` | Если action name задан через `aria-label`. |
| Root label | `aria-label` | Обязателен всегда. |
| Tooltip | `role="tooltip"` | Дополняет, но не заменяет accessible name. |
| Loading | `aria-disabled="true"` + activation guard | Если фокус должен остаться во время async action. |
| Disabled | Native `disabled` | Если действие недоступно и должно выйти из tab order. |

### Accessibility checklist

- [ ] Icon Button имеет `aria-label`.
- [ ] Tooltip доступен при hover и focus.
- [ ] Tooltip text соответствует действию.
- [ ] Icon скрыт от screen reader, если не несет дополнительный смысл.
- [ ] Root является нативным `<button>`.
- [ ] Focus ring видим и не обрезается.
- [ ] Touch target не меньше 44x44px там, где ожидается touch input.
- [ ] Danger action не передается только цветом или иконкой.

---

## 8. Design Tokens

Перед изменением этого раздела нужно сверять реальные component tokens в `tokens.json`. Для Icon Button доступны component tokens в namespace `icon-button`.

### Primary

| Component token | Роль | Semantic token |
|---|---|---|
| `icon-button/primary/surface/default` | Фон primary default. | `container/brand/default` |
| `icon-button/primary/surface/hover` | Фон primary hover. | `container/brand/hover` |
| `icon-button/primary/surface/pressed` | Фон primary pressed. | `container/brand/pressed` |
| `icon-button/primary/surface/disabled` | Фон primary disabled. | `status/disabled/container` |
| `icon-button/primary/surface/loading` | Фон primary loading. | `container/brand/default` |
| `icon-button/primary/foreground/default` | Иконка primary default. | `text/on-brand/primary` |
| `icon-button/primary/foreground/disabled` | Иконка primary disabled. | `status/disabled/icon` |
| `icon-button/primary/foreground/loading` | Иконка/spinner primary loading. | `text/on-brand/primary` |
| `icon-button/primary/border/default` | Border primary default. | `container/brand/default` |
| `icon-button/primary/border/hover` | Border primary hover. | `container/brand/hover` |
| `icon-button/primary/border/pressed` | Border primary pressed. | `container/brand/pressed` |
| `icon-button/primary/border/disabled` | Border primary disabled. | `status/disabled/border` |
| `icon-button/primary/border/loading` | Border primary loading. | `container/brand/default` |

### Neutral, ghost и danger

| Component token | Роль | Semantic token |
|---|---|---|
| `icon-button/neutral/surface/default` | Фон neutral default. | `container/neutral/default` |
| `icon-button/neutral/surface/hover` | Фон neutral hover. | `container/neutral/hover` |
| `icon-button/neutral/surface/pressed` | Фон neutral pressed. | `container/neutral/pressed` |
| `icon-button/neutral/surface/selected` | Фон neutral selected. | `container/neutral/selected` |
| `icon-button/neutral/foreground/default` | Иконка neutral default. | `icon/primary` |
| `icon-button/neutral/border/default` | Border neutral default. | `border/default` |
| `icon-button/neutral/border/selected` | Border neutral selected. | `border/selected` |
| `icon-button/ghost/surface/default` | Фон ghost default. | `color/transparent` |
| `icon-button/ghost/surface/hover` | Фон ghost hover. | `container/neutral/hover` |
| `icon-button/ghost/surface/pressed` | Фон ghost pressed. | `container/neutral/pressed` |
| `icon-button/ghost/foreground/default` | Иконка ghost default. | `icon/secondary` |
| `icon-button/ghost/foreground/hover` | Иконка ghost hover. | `icon/primary` |
| `icon-button/danger/surface/default` | Фон danger default. | `container/danger/default` |
| `icon-button/danger/surface/hover` | Фон danger hover. | `container/danger/hover` |
| `icon-button/danger/surface/pressed` | Фон danger pressed. | `container/danger/pressed` |
| `icon-button/danger/foreground/default` | Иконка danger default. | `text/on-danger/primary` |
| `icon-button/danger/border/default` | Border danger default. | `border/danger/default` |

### Shared

| Component token | Роль | Semantic token |
|---|---|---|
| `icon-button/spinner/foreground` | Spinner color. | `icon/inverse` |
| `icon-button/focus/ring` | Focus ring. | `focus/ring` |

Token gap: size, radius, padding, hit area и icon size пока описаны foundation rules, а не Icon Button component tokens.

---

## 9. Code mapping

| Design concept | Prop / API | Правило |
|---|---|---|
| Variant | `variant` | `primary`, `neutral`, `ghost`, `danger`. |
| Size | `size` | `small`, `medium`, `large`, `extraLarge`. |
| Icon | `icon` | Имя иконки из icon system. |
| Accessible name | `ariaLabel` или `aria-label` | Обязателен всегда. |
| Tooltip | `tooltip` | Текст совпадает по смыслу с accessible name. |
| Loading | `loading` | Boolean; spinner вместо icon. |
| Disabled | `disabled` | Boolean. |
| Selected | `selected` | Только для grouped/toolbar contexts. |
| Type | `type` | Обычно `button`. |
| Click handler | `onClick` | Для action behavior. |

### Contract rules

- `aria-label` обязателен.
- `tooltip` обязателен, если действие не видно текстом рядом.
- `variant` должен быть documented variant.
- `size` должен быть documented size.
- Icon-only navigation требует отдельного system review.
- Не передавайте raw color, spacing или custom icon size через props.

---

## 10. Handoff notes

Handoff для Icon Button должен фиксировать:

- action name;
- icon name;
- `aria-label`;
- tooltip text;
- variant и size;
- state requirements: default, hover, pressed, focus, loading, selected, disabled;
- action behavior: click handler, close, copy, delete, open menu;
- danger confirmation requirement, если действие рискованное;
- placement в toolbar, table row, card или header;
- token branch и known token gaps.

---

## 11. Acceptance criteria

- [ ] Icon Button имеет `aria-label`.
- [ ] Tooltip есть и доступен при hover/focus.
- [ ] Icon соответствует действию.
- [ ] Root является native `<button>`.
- [ ] Variant и size входят в documented contract.
- [ ] Loading сохраняет accessible action name.
- [ ] Touch target защищен для touch input.
- [ ] Danger action требует подтверждения или явного контекста.
- [ ] Используются реальные `icon-button` component tokens.

---

## 12. AI usage rules

AI может:

- предложить icon name по действию;
- подготовить `aria-label` и tooltip text на русском;
- проверить, не нужен ли Button с label вместо Icon Button;
- подготовить handoff notes и acceptance criteria;
- сверить token mapping с `tokens.json`.

AI не должен:

- использовать Icon Button без `aria-label`;
- считать Tooltip заменой accessible name;
- придумывать variants, props, states или token paths;
- рекомендовать icon-only control для неочевидного primary action;
- использовать Icon Button как декоративную иконку;
- скрывать danger action за одной иконкой без confirmation rule.

Если действие неочевидно без текста, AI должен пометить сценарий как `Needs system review` и рекомендовать Button с label.

---

## 13. Examples / Примеры

### Корректно

| Scenario | Usage |
|---|---|
| Close dialog | `variant="ghost"`, icon `x`, `aria-label="Закрыть"`, tooltip `Закрыть`. |
| Copy ID in table row | `variant="ghost"`, icon `copy`, `aria-label="Скопировать ID"`. |
| Delete item | `variant="danger"`, icon `trash`, `aria-label="Удалить файл"`, confirmation required. |
| More actions | `variant="ghost"`, icon `more-horizontal`, opens Dropdown Menu. |

### Требует review

| Scenario | Причина |
|---|---|
| Icon-only create as page primary action. | Пользователь может не понять главное действие. |
| Icon Button без Tooltip. | Недостаточный visible explanation. |
| Иконка `star` без контекста. | Неясно: favorite, rating или status. |
| Toggle-like selected state вне группы. | Нужен Toggle или Button Group pattern. |

---

## 14. Anti-patterns

- Использовать Icon Button без `aria-label`.
- Использовать Tooltip вместо `aria-label`.
- Использовать неоднозначную иконку без контекста.
- Делать Icon Button главным действием страницы.
- Применять custom colors вместо `icon-button` tokens.
- Уменьшать hit area до визуального размера small.
- Использовать Icon Button как декоративную иконку.
