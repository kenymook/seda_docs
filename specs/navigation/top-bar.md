# Top Bar / Navbar

> **Category** · Navigation
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Top Bar](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6659-58)

---

## 1. Key Principles

### Что это

Top Bar / Navbar — верхняя навигационная зона приложения или раздела. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует назначение, варианты, состояния, token mapping, accessibility, handoff и правила безопасного использования AI-assisted product development.

AI может ускорять черновики структуры навигации, handoff notes и acceptance criteria, но не заменяет дизайнера и разработчика. Финальное решение по информационной архитектуре, приоритетам действий и доступности остаётся за человеком.

### Когда использовать

- Нужна постоянная верхняя зона с brand area, navigation, search, user menu или системными actions.
- Разделу нужен устойчивый page header с title и контекстными actions.
- Нужно показать изменение состояния при scroll или elevated surface.
- Верхняя панель должна связывать текущий экран с глобальной или разделовой навигацией.

### Когда не использовать

- Как hero header или декоративную промо-зону.
- Для длинной вторичной навигации — используйте Sidebar или Tabs.
- Для временного контекстного действия — используйте Drawer, Popover или Toolbar.
- Для перегруженного набора actions, который невозможно отсканировать.

### Принципы

- **Navigation before decoration** — Top Bar должен помогать ориентироваться, а не занимать место ради визуального веса.
- **Priority is explicit** — brand, title, primary navigation, search и user controls имеют понятный порядок.
- **Tokens before visuals** — surface, border, links, items, icons и focus ring берутся из component tokens.
- **Responsive behavior is designed** — collapse, overflow и mobile navigation описываются в handoff.
- **AI assists, system governs** — AI может предложить структуру, но не добавляет новые variants, tokens или arbitrary actions.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер верхней панели и точка применения `type`, `state`, `size`. |
| `brand` | условно | Логотип или имя продукта/раздела. |
| `title` | условно | Название текущего раздела или страницы. |
| `nav` | условно | Основные ссылки или пункты верхней навигации. |
| `search` | опционально | Поиск по текущему продукту или разделу. |
| `actions` | опционально | Контекстные actions страницы или раздела. |
| `userMenu` | опционально | Профиль, настройки, account actions. |
| `mobileTrigger` | условно | Кнопка открытия mobile navigation или Drawer. |

### Правила anatomy

- В одной панели не смешивайте слишком много равноправных зон: если всё важно, нужна IA-review.
- `brand` не заменяет `title`, если экрану нужен явный page context.
- `actions` должны быть ограничены критичными действиями текущего контекста.
- Search должен иметь понятный scope: глобальный, разделовый или локальный.

---

## 3. Types / Variants

Figma component set: `Top Bar`. Node id: `6659:58`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| `type` | `app-bar` | `app-bar`, `page-header`, `transparent` | Роль панели в layout. |
| `state` | `default` | `default`, `scrolled` | Визуальное состояние поверхности. |
| `size` | `xl` | `s`, `m`, `l`, `xl` | Высота, плотность и масштаб элементов. |

### Type rules

| Type | Когда использовать | Ограничения |
| --- | --- | --- |
| `app-bar` | Глобальная верхняя панель приложения. | Не перегружайте page-specific actions. |
| `page-header` | Верхняя зона конкретной страницы или раздела. | Не должна конкурировать с global nav. |
| `transparent` | Экран, где Top Bar должен лечь поверх контента до scroll. | Требует проверки contrast и `scrolled` state. |

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `s` | Плотные интерфейсы, internal tools, компактные dashboards. | Проверьте touch/focus target. |
| `m` | Стандартная верхняя панель для рабочих интерфейсов. | Используйте как базовый размер, если нет особого layout. |
| `l` | Страницы с большим title или несколькими зонами. | Проверьте, что actions не ломают перенос. |
| `xl` | Крупный header или продуктовый app shell. | Не используйте как hero без navigation purpose. |

Размер влияет на плотность, но не меняет роль панели и порядок приоритетов.

---

## 5. States

| State | Значение | Правило |
| --- | --- | --- |
| `default` | Базовое состояние без scroll elevation. | Surface должен быть читаемым на текущем фоне. |
| `scrolled` | Панель получила elevated/разделяющее состояние. | Используйте, когда контент прокручивается под Top Bar. |
| `selected` | Активный navigation item. | Должен отражать текущий route или раздел. |
| `hover` | Наведение на item/action. | Не должен выглядеть как selected. |
| `active` | Нажатие на item/action. | Краткое interaction state. |
| `disabled` | Действие недоступно. | Причина должна быть понятна из контекста. |
| `loading` | Search/actions загружаются. | Loading относится к вложенным controls, а не ко всей панели. |

---

## 6. Behavior

- Top Bar может быть sticky, fixed или static только если это явно описано в layout handoff.
- При scroll `state` меняется на `scrolled`, если требуется отделить панель от контента.
- Keyboard order идёт слева направо: brand/title, nav, search, actions, user menu.
- На mobile лишние navigation items уходят в menu/Drawer, а не исчезают без доступа.
- Если есть search, Enter, Escape, clear и focus behavior описываются по spec Search.
- User menu и overflow menu должны использовать системные Dropdown Menu/Popover.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Landmark | Верхняя глобальная панель может быть `header`; navigation zone — `nav` с `aria-label`. |
| Active route | Текущий item помечается через `aria-current="page"` или эквивалент. |
| Keyboard | Все links/actions доступны по Tab в логичном порядке. |
| Focus | Focus ring видим на links, buttons, menu triggers и search. |
| Contrast | `transparent` state проверяется на контраст поверх реального контента. |
| Responsive | Mobile trigger имеет понятное accessible name. |

### Accessibility checklist

- [ ] Навигационная зона имеет accessible name.
- [ ] Active route программно отмечен.
- [ ] Focus order совпадает с визуальной структурой.
- [ ] Transparent/scrolled states сохраняют контраст.
- [ ] Icon-only actions имеют `aria-label`.
- [ ] Mobile overflow сохраняет доступ ко всем важным navigation items.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/top-bar/surface/default` | Фон панели | `surface/base` |
| `$collections/components/$modes/Mode 1/top-bar/surface/elevated` | Фон при elevation/scroll | `surface/raised` |
| `$collections/components/$modes/Mode 1/top-bar/border/default` | Разделитель панели | `border/default` |
| `$collections/components/$modes/Mode 1/top-bar/link/foreground/default` | Link default | `text/secondary` |
| `$collections/components/$modes/Mode 1/top-bar/link/foreground/hover` | Link hover | `text/primary` |
| `$collections/components/$modes/Mode 1/top-bar/link/foreground/active` | Link active | `text/primary` |
| `$collections/components/$modes/Mode 1/top-bar/logo/foreground` | Logo foreground | `text/primary` |
| `$collections/components/$modes/Mode 1/top-bar/focus/ring` | Focus indicator | `focus/ring` |
| `$collections/components/$modes/Mode 1/top-bar/title/foreground` | Title foreground | `text/primary` |
| `$collections/components/$modes/Mode 1/top-bar/item/surface/default` | Item surface default | `color/transparent` |
| `$collections/components/$modes/Mode 1/top-bar/item/surface/hover` | Item surface hover | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/top-bar/item/surface/active` | Item surface active | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/top-bar/item/surface/selected` | Item surface selected | `container/neutral/selected` |
| `$collections/components/$modes/Mode 1/top-bar/item/foreground/default` | Item text default | `text/secondary` |
| `$collections/components/$modes/Mode 1/top-bar/item/foreground/hover` | Item text hover | `text/primary` |
| `$collections/components/$modes/Mode 1/top-bar/item/foreground/selected` | Item text selected | `text/primary` |
| `$collections/components/$modes/Mode 1/top-bar/item/foreground/disabled` | Item text disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/top-bar/item/icon/default` | Item icon default | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/top-bar/item/icon/hover` | Item icon hover | `icon/primary` |
| `$collections/components/$modes/Mode 1/top-bar/item/icon/selected` | Item icon selected | `icon/primary` |
| `$collections/components/$modes/Mode 1/top-bar/item/icon/disabled` | Item icon disabled | `status/disabled/icon` |

### Token gaps

- Если нужен отдельный token для shadow или blur в `transparent` mode, фиксируйте `Token gap`.
- Не используйте raw colors для transparent/scrolled contrast.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Type | `type` | Только `app-bar`, `page-header`, `transparent`. |
| State | `state` или derived `scrolled` | `scrolled` вычисляется из scroll state. |
| Size | `size` | Только `s`, `m`, `l`, `xl`. |
| Navigation | `items` | Массив с `href`, `label`, optional `icon`, `selected`, `disabled`. |
| Actions | `actions` | Только действия текущего контекста. |
| Search | `searchProps` | Следует Search spec. |
| User menu | `userMenu` | Следует Dropdown Menu/Popover contract. |

### Contract rules

- Code API должен явно маппить Figma `type`, `state`, `size`.
- Unsupported layout zones помечаются как `Needs system review`.
- Top Bar не должен принимать arbitrary color props вместо tokens.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `6659:58` | Позволяет сверить design/code mapping. |
| `type`, `state`, `size` | Определяет роль и вид панели. |
| IA: brand, title, nav, search, actions, user menu | Убирает спор о приоритетах. |
| Active route и disabled rules | Нужны для навигации и accessibility. |
| Sticky/fixed/static behavior | Влияет на layout и scroll. |
| Mobile overflow/collapse | Предотвращает потерю navigation items. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |

### Acceptance criteria

- Top Bar использует только documented variants.
- Active route видим и программно доступен.
- Transparent/scrolled states сохраняют контраст.
- Keyboard order логичен и покрывает все actions.
- Mobile behavior не скрывает важную навигацию.
- AI-generated handoff не добавляет новые zones, variants или token names без review.

---

## 11. AI usage rules

- AI может предложить структуру навигации, labels, action priority и handoff notes.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI не должен использовать Top Bar как hero, Toolbar, Sidebar или Drawer.
- AI не должен придумывать новые `type`, `state`, `size`, colors или arbitrary props.
- AI обязан помечать unclear IA, missing active route, mobile overflow gap и contrast risk как `Needs system review`.
- AI может подготовить acceptance criteria, но человек утверждает финальную IA.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| `app-bar`, `m` с brand, primary nav, search и user menu. | Есть устойчивая верхняя навигация приложения. |
| `page-header`, `l` с title и двумя actions страницы. | Действия привязаны к текущему экрану. |
| `transparent` с переходом в `scrolled`. | Surface меняется при прокрутке и сохраняет читаемость. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Top Bar с 12 actions. | Нужен action prioritization или overflow pattern. |
| Transparent поверх непредсказуемого контента. | Высокий риск недостаточного контраста. |
| Top Bar как единственный контейнер вторичной навигации. | Нужны Tabs или Sidebar. |

---

## 13. Anti-patterns

- Использовать Top Bar как декоративный hero.
- Скрывать active route только цветом без semantic state.
- Перегружать панель actions разных уровней.
- Убирать navigation items на mobile без доступного overflow.
- Добавлять custom background, blur, shadow или item colors без system review.
