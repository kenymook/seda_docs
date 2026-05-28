# Drawer

> **Category** · Navigation
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Drawer](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6657-116)

---

## 1. Key Principles

### Что это

Drawer — временная overlay-панель для контекстной задачи, деталей объекта, настроек или вспомогательной навигации. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует назначение, варианты, состояния, token mapping, accessibility, handoff и правила безопасного использования AI-assisted product development.

AI может ускорять черновики сценариев, handoff notes и acceptance criteria, но не заменяет дизайнера и разработчика. Финальное решение по поведению, доступности, токенам и продуктовой уместности остаётся за человеком.

### Когда использовать

- Нужно показать дополнительный контекст без полной смены страницы.
- Пользователь выполняет короткую или среднюю задачу рядом с исходным экраном: редактирование свойств, фильтры, просмотр деталей, служебные настройки.
- Контент длиннее Popover, но сценарий не требует жёсткого блокирующего Modal.
- Нужна временная панель с понятным открытием, закрытием и возвратом фокуса.

### Когда не использовать

- Для критичного подтверждения, удаления, оплаты или необратимого действия — используйте Modal.
- Для постоянной навигации по продукту — используйте Sidebar или основную навигацию.
- Для маленькой подсказки или краткого выбора рядом с trigger — используйте Popover или Dropdown Menu.
- Для вложенных Drawer внутри Drawer. Такой сценарий требует пересмотра flow.
- Для полноценной страницы, где пользователь должен сравнивать много данных одновременно.

### Принципы

- **System before generation** — сначала используйте documented variants, states и props, затем формируйте экран.
- **Tokens before visuals** — поверхность, scrim, border, icon и focus ring берутся из component tokens.
- **Components before custom UI** — содержимое Drawer собирается из системных компонентов, а не локальных визуальных решений.
- **State ownership is explicit** — `open`, dismiss, unsaved changes и loading имеют владельца: компонент или parent flow.
- **Documentation is source of truth** — Figma, code и handoff должны совпадать со spec.
- **AI assists, system governs** — AI помогает проверять и описывать, но не добавляет новые варианты, токены или props.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `trigger` | условно | Элемент, который открывает Drawer и получает фокус после закрытия. |
| `scrim` | да | Затемнение фонового интерфейса и область dismiss, если сценарий разрешает закрытие по outside click. |
| `surface` | да | Контейнер панели с фоном, border и размером по `placement`/`size`. |
| `header` | рекомендуется | Заголовок, описание и close action. |
| `title` | да | Видимое имя панели; используется для `aria-labelledby`. |
| `description` | опционально | Кратко объясняет контекст или последствия действий; используется для `aria-describedby`, если важно. |
| `close` | да | Icon Button закрытия, если закрытие не запрещено состоянием flow. |
| `content` | да | Основной контент: форма, список, фильтры, детали объекта. |
| `footer` | условно | Primary/secondary actions, если Drawer содержит задачу с подтверждением. |

### Правила anatomy

- `title` обязателен даже для технических панелей: Drawer должен иметь понятное accessible name.
- `footer` фиксируется снизу только если действия относятся ко всему содержимому панели.
- Внутренний scroll должен быть внутри `content`; `header` и `footer` не должны исчезать при прокрутке, если в них есть критичные действия.
- Close action не заменяет primary/secondary actions. Закрытие без сохранения должно быть явно безопасным.

---

## 3. Types / Variants

Figma component set: `Drawer`. Node id: `6657:116`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| `placement` | `right` | `right`, `left`, `bottom` | Сторона появления панели. |
| `size` | `s` | `s`, `m`, `l`, `xl` | Ширина или высота панели в зависимости от `placement`. |

### Placement rules

| Placement | Когда использовать | Ограничения |
| --- | --- | --- |
| `right` | Детали объекта, настройки, редактирование записи, фильтры. | Не используйте для глобальной навигации. |
| `left` | Вспомогательная навигация в контексте раздела или дерево объектов. | Не заменяет постоянный Sidebar. |
| `bottom` | Mobile-first сценарии, короткие настройки, нижний sheet. | Нельзя перегружать длинными формами без явного scroll behavior. |

### Size rules

- `s` — короткий контекст, фильтры, компактные настройки.
- `m` — стандартное редактирование или просмотр деталей.
- `l` — формы с несколькими группами, списки, расширенные настройки.
- `xl` — сложный контент, который всё ещё должен оставаться overlay, а не отдельной страницей.

Если сценарий требует новый `placement`, `size` или вложенный layout, пометьте его как `Needs system review`.

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `s` | Короткие фильтры, компактные настройки, быстрый preview. | Контент должен помещаться без сложной вложенной навигации. |
| `m` | Стандартный просмотр или редактирование свойств. | Используйте как базовый размер для desktop. |
| `l` | Формы с несколькими группами, списки, расширенные настройки. | Проверьте fixed header/footer и scroll внутри `content`. |
| `xl` | Сложный overlay-сценарий, который ещё не должен быть отдельной страницей. | Если пользователь сравнивает много данных, пересмотрите сценарий в пользу страницы. |

Размер не меняет назначение Drawer. Если новый размер нужен только для одного экрана, фиксируйте это как layout gap и отправляйте на system review.

---

## 5. States

| State | Кто владеет | Правило |
| --- | --- | --- |
| `closed` | parent flow | Drawer не находится в DOM или скрыт безопасно для screen reader. |
| `open` | parent flow / component | Фокус переводится внутрь Drawer, фоновой контент недоступен для взаимодействия. |
| `loading` | parent flow | Внутри `content` используется Skeleton или Spinner; `title` и close action остаются доступными, если это безопасно. |
| `empty` | content owner | Используется Empty State внутри `content`, а не пустая поверхность. |
| `error` | content owner | Ошибка объясняется текстом и действием восстановления. |
| `unsavedChanges` | parent flow | Закрытие требует подтверждения или сохранения черновика. |
| `disabledDismiss` | parent flow | Закрытие через scrim/Escape отключается только для обоснованного критичного процесса. |

---

## 6. Behavior

- Открытие Drawer переводит фокус на заголовок, первый интерактивный элемент или логичную стартовую точку сценария.
- Закрытие возвращает фокус на `trigger`, если он всё ещё существует.
- `Escape` закрывает Drawer, кроме сценариев с `disabledDismiss` или несохранёнными изменениями.
- Клик по `scrim` закрывает Drawer только если это не приводит к потере данных.
- Фоновый интерфейс не должен принимать focus, hover или click, пока Drawer открыт.
- Для `bottom` на мобильных экранах проверьте безопасные зоны, высоту клавиатуры и scroll внутри `content`.
- Если Drawer содержит форму, primary action должен быть в footer или рядом с последней группой полей, но не в обоих местах одновременно.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Role | Используйте `role="dialog"` или нативный dialog-паттерн, если Drawer блокирует фон. |
| Accessible name | `title` связывается через `aria-labelledby`; при отсутствии видимого заголовка нужен `aria-label`, но это исключение. |
| Description | Важное описание связывается через `aria-describedby`. |
| Focus management | Фокус переводится внутрь, удерживается в Drawer и возвращается на trigger после закрытия. |
| Keyboard | `Escape`, `Tab`, `Shift+Tab` работают предсказуемо; close action доступен с клавиатуры. |
| Screen reader | Фоновый контент не должен читаться как активный контекст. |
| Motion | Анимация открытия не должна мешать `prefers-reduced-motion`. |

### Accessibility checklist

- [ ] Drawer имеет видимый `title`.
- [ ] Focus trap работает без потери фокуса.
- [ ] Close action имеет понятное accessible name.
- [ ] Закрытие не приводит к потере несохранённых данных без предупреждения.
- [ ] Ошибки внутри Drawer передаются текстом, а не только цветом.
- [ ] Mobile scroll и экранная клавиатура не скрывают primary action.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/drawer/surface/default` | Фон панели | `surface/overlay` |
| `$collections/components/$modes/Mode 1/drawer/border/default` | Граница панели | `border/default` |
| `$collections/components/$modes/Mode 1/drawer/scrim/default` | Overlay затемнение | `surface/scrim` |
| `$collections/components/$modes/Mode 1/drawer/title/foreground` | Цвет заголовка | `text/primary` |
| `$collections/components/$modes/Mode 1/drawer/description/foreground` | Цвет описания | `text/secondary` |
| `$collections/components/$modes/Mode 1/drawer/close/icon/default` | Иконка close по умолчанию | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/drawer/close/icon/hover` | Иконка close при hover | `icon/primary` |
| `$collections/components/$modes/Mode 1/drawer/close/surface/hover` | Фон close при hover | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/drawer/close/surface/active` | Фон close при active | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/drawer/focus/ring` | Focus indicator | `focus/ring` |

### Token gaps

- Если нужен отдельный token для shadow, radius, width или motion, фиксируйте это как `Token gap`.
- Не используйте raw color, custom opacity или локальные значения scrim.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Открытие | `open` | Controlled state, владелец — parent flow. |
| Изменение открытия | `onOpenChange` | Вызывается при close action, Escape, scrim click и programmatic close. |
| Placement | `placement` | Только `right`, `left`, `bottom`. |
| Size | `size` | Только `s`, `m`, `l`, `xl`. |
| Заголовок | `title` | Обязателен для accessible name. |
| Описание | `description` | Опционально; связывается с dialog, если важно для понимания. |
| Закрытие | `dismissible` | Отключается только при явном сценарии. |
| Несохранённые изменения | `hasUnsavedChanges` / parent guard | Закрытие требует confirm flow. |
| Actions | `primaryAction`, `secondaryAction` или footer slot | Actions должны быть описаны в handoff. |

### Contract rules

- `placement` и `size` должны совпадать с Figma variants.
- `open` не должен управляться одновременно компонентом и parent flow без явного controlled/uncontrolled contract.
- Unsupported requirements помечаются как `Needs system review`.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `6657:116` | Позволяет сверить design/code mapping. |
| `placement`, `size`, `open`, dismiss rules | Определяет поведение панели. |
| Заголовок, описание, content model, footer actions | Убирает неоднозначность в реализации. |
| Правила close, Escape, scrim click, unsaved changes | Предотвращает потерю данных. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |
| Focus management и ARIA contract | Нужны для accessibility QA. |
| Responsive behavior | Особенно важно для `bottom` и узких экранов. |

### Acceptance criteria

- Drawer использует только documented `placement` и `size`.
- Открытие и закрытие работают с мышью, клавиатурой и touch.
- Фокус не уходит в фоновый интерфейс, пока Drawer открыт.
- Закрытие с несохранёнными изменениями не теряет данные.
- Цвета surface, scrim, close и focus берутся из component tokens.
- AI-generated handoff не содержит новых props, variants или token names без review.

---

## 11. AI usage rules

- AI может предлагать структуру Drawer только на базе documented variants, states, props и component tokens.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI должен отличать Drawer от Modal, Popover, Sidebar и полноценной страницы.
- AI не должен предлагать nested Drawer, новые placements, raw colors или custom scrim.
- AI обязан помечать missing token, unclear dismiss behavior, focus gap и unsupported behavior как `Needs system review`.
- AI может подготовить handoff notes и acceptance criteria, но человек утверждает финальное поведение.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| Drawer `right`, `m` для редактирования свойств объекта. | Пользователь остаётся в контексте списка или карточки. |
| Drawer `bottom`, `s` для мобильных фильтров. | Короткий flow удобно завершить без смены страницы. |
| Drawer с confirm guard при несохранённых изменениях. | Данные пользователя не теряются при dismiss. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Drawer поверх Drawer. | Ломает focus management и ментальную модель. |
| Drawer как постоянная левая навигация. | Нужно использовать Sidebar или navigation pattern. |
| Drawer без заголовка и close action. | Нарушает accessibility и контроль пользователя. |

---

## 13. Anti-patterns

- Использовать Drawer как generic container без сценария открытия и закрытия.
- Скрывать критичные действия в footer без visible primary action.
- Разрешать dismiss при несохранённых данных без предупреждения.
- Делать фон доступным для click/focus при открытом Drawer.
- Добавлять новые размеры, colors, shadows или motion values без system review.
