# Breadcrumbs

> **Category** · Navigation
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Breadcrumbs](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6220-927)

---

## 1. Key Principles

### Что это

Breadcrumbs — навигационная цепочка, которая показывает положение пользователя в иерархии продукта. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует структуру пути, варианты, состояния, token mapping, accessibility, handoff и правила использования AI-assisted product development.

AI может помогать с проверкой иерархии, сокращением labels, collapse rules и handoff notes, но не заменяет дизайнера и разработчика. Финальное решение по IA, URL mapping и доступности остаётся за человеком.

### Когда использовать

- Экран находится внутри иерархии: организация, проект, раздел, объект, подстраница.
- Пользователю нужен быстрый возврат на верхние уровни.
- Текущий экран не очевиден только из title или Sidebar.
- Есть стабильные parent pages, на которые можно перейти.

### Когда не использовать

- Для линейного процесса — используйте Stepper.
- Для прогресса выполнения — используйте Progress Bar.
- Для глобальной навигации между разделами — используйте Top Bar или Sidebar.
- Для цепочки действий, которая не соответствует реальной иерархии.
- Для слишком длинного пути без collapse rule.

### Принципы

- **Hierarchy before history** — Breadcrumbs показывают структуру, а не историю кликов.
- **Current page is not a link** — текущий item должен быть отмечен как current.
- **Collapse is explicit** — длинные цепочки сокращаются по правилу, а не произвольно.
- **Tokens before visuals** — foreground, separator, item surface и focus ring используют component tokens.
- **AI assists, system governs** — AI может проверить путь, но не придумывает IA или URL.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер navigation landmark. |
| `list` | да | Упорядоченная цепочка уровней. |
| `item` | да | Один уровень иерархии. |
| `link` | для parent items | Переход на родительский уровень. |
| `current` | да | Текущий экран; не является обычной ссылкой. |
| `separator` | да | Визуальное разделение уровней. |
| `collapseItem` | условно | Сокращение длинной цепочки. |

### Правила anatomy

- Первый item должен быть значимым entry point, а не декоративным label.
- Последний item описывает текущую страницу и помечается как current.
- Separator не должен читаться screen reader как отдельный важный символ.
- Collapse item должен раскрывать или вести к понятному списку скрытых уровней.

---

## 3. Types / Variants

Figma component set: `Breadcrumbs`. Node id: `6220:927`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| `Type` | `Ghost` | `Ghost`, `Text` | Визуальный тип item. |
| `Separator` | `Slash` | `Slash`, `Triangle` | Вид разделителя между уровнями. |
| `Size` | `S` | `S`, `M`, `L`, `XL` | Плотность и масштаб items. |

### Variant rules

- `Ghost` подходит для кликабельных parent items с мягким hover surface.
- `Text` подходит для более спокойной цепочки в плотном layout.
- `Slash` и `Triangle` не должны смешиваться в одной цепочке.
- Новый separator или collapse pattern требует `Needs system review`.

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `S` | Плотные product pages и таблицы. | Проверьте читаемость и focus target. |
| `M` | Стандартный размер для большинства экранов. | Используйте как default. |
| `L` | Крупные page headers или touch-oriented layout. | Проверьте перенос и высоту строки. |
| `XL` | Редкие случаи с повышенной читаемостью. | Нужна проверка, что breadcrumbs не конкурируют с title. |

Размер не меняет структуру пути и не должен использоваться вместо collapse.

---

## 5. States

| State | Значение | Правило |
| --- | --- | --- |
| `default` | Parent item доступен. | Может быть ссылкой на родительский уровень. |
| `hover` | Наведение на кликабельный item. | Не применяется к current item как link behavior. |
| `active` | Нажатие на item. | Краткое interaction state. |
| `current` | Текущий экран. | Помечается программно и обычно не ведёт на себя же. |
| `disabled` | Переход недоступен. | Используется редко; причина должна быть понятна. |
| `collapsed` | Часть цепочки скрыта. | Скрытые уровни должны быть доступны через menu или правило раскрытия. |

---

## 6. Behavior

- Parent items ведут на соответствующие URL/route.
- Current item не должен перезагружать текущий экран как обычная ссылка.
- При длинной цепочке сохраняйте первый, предпоследний и current items, если нет другого правила.
- Collapse item должен быть доступен с клавиатуры и иметь понятное accessible name.
- На mobile Breadcrumbs могут быть сокращены до parent link, но это должно быть описано в handoff.
- Если route меняется динамически, labels должны обновляться вместе с URL mapping.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Landmark | Используйте `nav` с `aria-label="Breadcrumb"` или локализованным именем. |
| Structure | Используйте `ol`/`li` или эквивалентную ordered structure. |
| Current page | Последний item получает `aria-current="page"`. |
| Separator | Separator скрывается от screen reader, если он декоративный. |
| Keyboard | Все ссылки и collapse controls доступны с клавиатуры. |
| Focus | Focus ring видим на links и collapse trigger. |

### Accessibility checklist

- [ ] Есть navigation landmark с понятным именем.
- [ ] Текущий item программно отмечен.
- [ ] Separator не засоряет чтение screen reader.
- [ ] Collapse item доступен с клавиатуры.
- [ ] Labels понятны вне визуального контекста.
- [ ] Mobile сокращение сохраняет путь назад.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/breadcrumbs/surface/default` | Root surface default | `color/transparent` |
| `$collections/components/$modes/Mode 1/breadcrumbs/surface/disabled` | Root surface disabled | `color/transparent` |
| `$collections/components/$modes/Mode 1/breadcrumbs/border/default` | Border default | `color/transparent` |
| `$collections/components/$modes/Mode 1/breadcrumbs/border/hover` | Border hover | `color/transparent` |
| `$collections/components/$modes/Mode 1/breadcrumbs/border/pressed` | Border pressed | `color/transparent` |
| `$collections/components/$modes/Mode 1/breadcrumbs/border/disabled` | Border disabled | `color/transparent` |
| `$collections/components/$modes/Mode 1/breadcrumbs/foreground/default` | Foreground default | `text/tertiary` |
| `$collections/components/$modes/Mode 1/breadcrumbs/foreground/disabled` | Foreground disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/breadcrumbs/foreground/hover` | Foreground hover | `text/primary` |
| `$collections/components/$modes/Mode 1/breadcrumbs/focus/ring` | Focus indicator | `focus/ring` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/surface/default` | Item surface default | `color/transparent` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/surface/hover` | Item surface hover | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/surface/active` | Item surface active | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/surface/disabled` | Item surface disabled | `color/transparent` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/foreground/default` | Item text default | `text/tertiary` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/foreground/hover` | Item text hover | `text/primary` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/foreground/current` | Item text current | `text/primary` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/foreground/disabled` | Item text disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/icon/default` | Item icon default | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/icon/hover` | Item icon hover | `icon/secondary` |
| `$collections/components/$modes/Mode 1/breadcrumbs/item/icon/disabled` | Item icon disabled | `status/disabled/icon` |
| `$collections/components/$modes/Mode 1/breadcrumbs/separator/foreground` | Separator foreground | `icon/muted` |

### Token gaps

- Если нужен token для collapse menu surface, используйте соответствующий Dropdown/Popover spec или фиксируйте `Token gap`.
- Не используйте raw colors для separator или current item.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Type | `type` | Маппится на Figma `Type`: `ghost` или `text`. |
| Separator | `separator` | Только `slash` или `triangle`. |
| Size | `size` | Только `s`, `m`, `l`, `xl`; code может нормализовать регистр. |
| Items | `items` | Массив с `label`, `href`, optional `disabled`. |
| Current | last item / `current` | Последний item помечается как current. |
| Collapse | `maxItems` / `collapseMode` | Описывает, какие уровни скрываются. |

### Contract rules

- Breadcrumbs должны отражать hierarchy, а не browser history.
- Current item не должен быть обычной ссылкой на текущий URL без причины.
- Unsupported separator или collapse behavior помечается как `Needs system review`.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `6220:927` | Позволяет сверить design/code mapping. |
| `Type`, `Separator`, `Size` | Определяет вид цепочки. |
| Полный список items и URL mapping | Нужен для корректной навигации. |
| Current item | Нужен для accessibility и route state. |
| Collapse rule | Предотвращает слишком длинную цепочку. |
| Mobile behavior | Часто отличается от desktop. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |

### Acceptance criteria

- Breadcrumbs отражают реальную иерархию.
- Последний item помечен как current.
- Separator декоративен для screen reader.
- Длинная цепочка имеет collapse rule.
- Parent items ведут на корректные routes.
- AI-generated output не добавляет вымышленные levels, URLs или token names.

---

## 11. AI usage rules

- AI может предложить labels, collapse rule и handoff notes на основе известной IA.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI не должен использовать Breadcrumbs как Stepper, Progress Bar или Tabs.
- AI не должен придумывать уровни иерархии, URL или separator variants без system review.
- AI обязан помечать unclear hierarchy, missing current item, long path without collapse и accessibility gap как `Needs system review`.
- AI может подготовить acceptance criteria, но человек утверждает IA и URL mapping.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| `Organization / Project / Settings / Members`. | Показывает путь в иерархии. |
| Длинная цепочка с collapse между первым и предпоследним item. | Сохраняет ориентацию без перегруза. |
| Mobile показывает ссылку на parent section. | Сохраняет путь назад в ограниченной ширине. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Breadcrumbs показывают историю переходов. | Пользователь получает ложную IA. |
| Current item кликает на текущую страницу без смысла. | Лишняя интерактивность и шум для accessibility. |
| Separator меняется между items. | Нарушается consistency. |

---

## 13. Anti-patterns

- Использовать Breadcrumbs как Stepper.
- Показывать слишком длинную цепочку без collapse.
- Делать separator частью читаемого текста.
- Придумывать parent levels ради визуального заполнения.
- Использовать disabled parent item без объяснения.
