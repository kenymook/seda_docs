# Sidebar / Navigation Menu

> **Category** · Navigation
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Sidebar](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=933-8891)

---

## 1. Key Principles

### Что это

Sidebar / Navigation Menu — постоянная боковая навигация по разделам продукта или рабочей области. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует структуру навигации, варианты, состояния, token mapping, accessibility, handoff и правила использования AI-assisted product development.

AI может помогать с анализом IA, группировкой пунктов, handoff notes и acceptance criteria, но не заменяет дизайнера и разработчика. Финальное решение по структуре разделов, правам доступа и responsive behavior остаётся за человеком.

### Когда использовать

- Продукту нужна постоянная навигация по разделам.
- Есть группы navigation items, активный раздел и возможный collapsed/full режим.
- Навигация должна оставаться доступной при переходе между экранами.
- Нужны secondary sections, category labels или persistent workspace controls.

### Когда не использовать

- Для временной панели задачи — используйте Drawer.
- Для верхнего уровня приложения с малым числом разделов — используйте Top Bar.
- Для переключения равноправных разделов внутри одного экрана — используйте Tabs.
- Для перегруженного дерева с глубокой вложенностью без IA-review.

### Принципы

- **Persistent navigation** — Sidebar должен быть стабильной опорой, а не временным контейнером.
- **Hierarchy is explicit** — sections, categories, selected item и disabled items описаны явно.
- **Collapsed is still usable** — collapsed mode требует icons, tooltips или accessible labels.
- **Tokens before visuals** — surface, item states, accent, icons и focus ring берутся из component tokens.
- **AI assists, system governs** — AI может предложить группировку, но не придумывает новые variants, tokens или states.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер Sidebar и variant state `full`. |
| `header` | опционально | Brand, workspace switcher или compact title. |
| `section` | условно | Группа navigation items. |
| `sectionTitle` | условно | Название группы. |
| `item` | да | Навигационная ссылка или action. |
| `itemIcon` | условно | Иконка пункта; обязательна для collapsed mode. |
| `itemLabel` | да для full | Текст пункта в full mode. |
| `itemAccent` | условно | Визуальный маркер selected item. |
| `footer` | опционально | Settings, help, collapse control или user controls. |

### Правила anatomy

- В collapsed mode у каждого item должен быть accessible name.
- `sectionTitle` не должен исчезать так, чтобы терялась структура навигации; используйте grouping semantics.
- `footer` не должен содержать primary product navigation.
- Вложенность глубже двух уровней требует system review.

---

## 3. Types / Variants

Figma component set: `Sidebar`. Node id: `933:8891`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| `full` | `true` | `true`, `false` | Полный или collapsed режим. |
| `size` | `m` | `s`, `m`, `l`, `xl` | Плотность пунктов и секций. |

### Boolean / slot properties

| Property | Default | Rule |
| --- | --- | --- |
| `category1 (933:1)` | `true` | Видимость первой группы должна соответствовать IA. |
| `category2 (933:2)` | `true` | Видимость второй группы должна соответствовать IA. |

### Variant rules

- `full=false` не означает, что labels удалены из accessibility tree.
- Если нужен floating/mobile Sidebar, используйте Drawer pattern или фиксируйте `Needs system review`.
- Не смешивайте Sidebar item и Button behavior без явного navigation/action contract.

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `s` | Плотные admin-интерфейсы с большим числом разделов. | Проверьте читаемость label и focus target. |
| `m` | Основной размер persistent navigation. | Используйте как default. |
| `l` | Touch-oriented layout или крупные рабочие пространства. | Проверьте, что sidebar не съедает контент. |
| `xl` | Малое число крупных разделов. | Требует проверки на desktop и tablet. |

Размер не меняет IA и не должен использоваться для скрытия лишних пунктов.

---

## 5. States

| State | Значение | Правило |
| --- | --- | --- |
| `default` | Пункт доступен, не выбран. | Должен быть читаемым и сканируемым. |
| `hover` | Pointer наведён на item. | Не должен выглядеть как selected. |
| `active` | Item нажимается. | Краткое interaction state. |
| `selected` | Текущий раздел или route. | Должен быть один selected item в группе маршрута. |
| `disabled` | Пункт недоступен. | Причина должна быть объяснена контекстом или правами доступа. |
| `collapsed` | Sidebar свернут. | Labels остаются доступными программно. |
| `loading` | Навигация или права доступа загружаются. | Не показывайте ложный selected state. |

---

## 6. Behavior

- Selected item вычисляется из route или выбранного workspace context.
- Collapse/expand должен сохранять selected item и scroll position, если это возможно.
- Keyboard order идёт сверху вниз по видимым пунктам.
- Если item открывает вложенную группу, используйте отдельный expanded/collapsed state для группы.
- Mobile behavior не должен быть автоматическим Sidebar: чаще используется Drawer с теми же navigation items.
- Permission-based hidden/disabled items должны быть описаны в handoff.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Landmark | Используйте `nav` с понятным `aria-label`. |
| Active route | Selected item получает `aria-current="page"` или эквивалент. |
| Collapsed mode | Icon-only items имеют accessible name и, при необходимости, Tooltip. |
| Keyboard | Все items и collapse control доступны с клавиатуры. |
| Focus | Focus ring не обрезается контейнером Sidebar. |
| Groups | Sections имеют программную структуру или понятные headings. |

### Accessibility checklist

- [ ] Sidebar имеет accessible name.
- [ ] Selected item программно отмечен.
- [ ] Collapsed items не теряют labels для screen reader.
- [ ] Focus order совпадает с визуальным порядком.
- [ ] Disabled/hidden items имеют понятную логику.
- [ ] Mobile navigation не теряет доступ к разделам.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/sidebar/surface/default` | Фон Sidebar | `surface/base` |
| `$collections/components/$modes/Mode 1/sidebar/surface/elevated` | Elevated фон | `surface/raised` |
| `$collections/components/$modes/Mode 1/sidebar/item/foreground/default` | Item text default | `text/secondary` |
| `$collections/components/$modes/Mode 1/sidebar/item/foreground/hover` | Item text hover | `text/primary` |
| `$collections/components/$modes/Mode 1/sidebar/item/foreground/active` | Item text active | `text/primary` |
| `$collections/components/$modes/Mode 1/sidebar/item/foreground/selected` | Item text selected | `text/primary` |
| `$collections/components/$modes/Mode 1/sidebar/item/foreground/disabled` | Item text disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/sidebar/item/surface/hover` | Item surface hover | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/sidebar/item/surface/active` | Item surface active | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/sidebar/item/surface/default` | Item surface default | `color/transparent` |
| `$collections/components/$modes/Mode 1/sidebar/item/surface/selected` | Item surface selected | `container/neutral/selected` |
| `$collections/components/$modes/Mode 1/sidebar/item/surface/disabled` | Item surface disabled | `color/transparent` |
| `$collections/components/$modes/Mode 1/sidebar/item/accent/default` | Item accent default | `border/brand/default` |
| `$collections/components/$modes/Mode 1/sidebar/item/accent/selected` | Item accent selected | `border/brand/default` |
| `$collections/components/$modes/Mode 1/sidebar/item/icon/default` | Item icon default | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/sidebar/item/icon/hover` | Item icon hover | `icon/secondary` |
| `$collections/components/$modes/Mode 1/sidebar/item/icon/selected` | Item icon selected | `icon/primary` |
| `$collections/components/$modes/Mode 1/sidebar/item/icon/disabled` | Item icon disabled | `status/disabled/icon` |
| `$collections/components/$modes/Mode 1/sidebar/icon/default` | System icon default | `text/tertiary` |
| `$collections/components/$modes/Mode 1/sidebar/icon/active` | System icon active | `text/primary` |
| `$collections/components/$modes/Mode 1/sidebar/section-title/foreground` | Section title | `text/tertiary` |
| `$collections/components/$modes/Mode 1/sidebar/border/default` | Border | `border/default` |
| `$collections/components/$modes/Mode 1/sidebar/focus/ring` | Focus indicator | `focus/ring` |
| `$collections/components/$modes/Mode 1/sidebar/sectionTitle/foreground` | Section title alias | `text/tertiary` |

### Token gaps

- Если нужен отдельный token для collapsed width или mobile surface, фиксируйте `Token gap`.
- Не используйте raw colors для selected, hover или disabled states.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Full mode | `full` / `collapsed` | Маппится на Figma `full`; naming в code должен быть однозначным. |
| Size | `size` | Только `s`, `m`, `l`, `xl`. |
| Items | `items` | Массив sections и navigation items. |
| Selected item | `selectedKey` / route match | Вычисляется из route/workspace context. |
| Collapse control | `onCollapsedChange` | Controlled или parent-owned state. |
| Disabled | `disabled` per item | Используется для permission или unavailable state. |
| Sections | `sections` | Сохраняют порядок и labels. |

### Contract rules

- Hidden/disabled logic должна быть описана явно.
- Code не должен принимать arbitrary item colors.
- Unsupported nesting или mobile variant помечается как `Needs system review`.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `933:8891` | Позволяет сверить design/code mapping. |
| `full`, `size`, selected item | Определяет режим и состояние. |
| Sections, item order, labels, icons | Нужны для IA и code API. |
| Permission/disabled rules | Предотвращает неоднозначность доступа. |
| Collapse/expand behavior | Влияет на layout и accessibility. |
| Mobile behavior | Часто требует Drawer mapping. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |

### Acceptance criteria

- Sidebar использует только documented variants.
- Selected item видим и программно доступен.
- Collapsed mode сохраняет accessible labels.
- Keyboard order покрывает все navigation items.
- Disabled/hidden logic описана в handoff.
- AI-generated output не добавляет новые nesting levels, variants или token names без review.

---

## 11. AI usage rules

- AI может предложить группировку navigation items, labels и handoff notes.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI не должен использовать Sidebar вместо Drawer, Tabs или Top Bar.
- AI не должен придумывать новые states, arbitrary colors, nesting levels или mobile variant без review.
- AI обязан помечать unclear IA, missing selected state, collapsed accessibility gap и permission ambiguity как `Needs system review`.
- AI может подготовить acceptance criteria, но человек утверждает IA и access rules.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| Sidebar `full=true`, `m` с grouped product sections. | Поддерживает постоянную навигацию. |
| Collapsed Sidebar с icons и accessible labels. | Экономит место без потери доступности. |
| Disabled item для раздела без прав доступа с пояснением. | Пользователь понимает ограничение. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Sidebar с четырьмя уровнями вложенности. | Нужна IA-review или другой navigation pattern. |
| Mobile Sidebar без Drawer behavior. | Может ломать layout и focus management. |
| Item, который выглядит как ссылка, но запускает destructive action. | Нарушает navigation/action contract. |

---

## 13. Anti-patterns

- Использовать Sidebar как временную панель задачи.
- Прятать selected state только цветом.
- Удалять labels в collapsed mode из accessibility tree.
- Смешивать navigation items и unrelated actions без группировки.
- Добавлять custom item colors или nesting без system review.
