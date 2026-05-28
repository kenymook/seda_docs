# Tabs

> **Category** · Navigation
> **Version** · 1.0
> **Status** · draft
> **Owner** · TBD
> **Last reviewed** · 2026-05-29
> **Figma** · [Tabs](https://www.figma.com/design/Su1jWqKc9TkD1R8f7wHOQU/SEDA-AI--v0.2.0?node-id=6196-25)

---

## 1. Key Principles

### Что это

Tabs — переключение между равноправными разделами внутри одного контекста. В SEDA AI компонент описывается как часть AI-ready design system framework: спецификация фиксирует назначение, варианты, states, token mapping, accessibility, handoff и правила использования AI-assisted product development.

AI может помогать с проверкой структуры вкладок, названиями, handoff notes и acceptance criteria. AI не заменяет дизайнера и разработчика: финальное решение по информационной архитектуре, поведению и доступности остаётся за человеком.

### Когда использовать

- Несколько разделов относятся к одному объекту, странице или задаче.
- Разделы равноправны и пользователь может переключаться между ними без линейного порядка.
- Выбранная вкладка управляет связанным `tabpanel`.
- Нужно уменьшить видимую сложность без смены основного контекста.

### Когда не использовать

- Для последовательного flow — используйте Stepper.
- Для фильтрации или выбора режима отображения — используйте Segmented Control.
- Для навигации между разными страницами продукта — используйте navigation pattern.
- Для скрытия критически важной информации, которую пользователь обязан увидеть.
- Для вложенных Tabs внутри Tabs без system review.

### Принципы

- **One selected tab** — в одном tablist выбран только один tab.
- **Tab controls panel** — каждая вкладка связана с конкретным `tabpanel`.
- **Labels before icons** — icon-only tabs допустимы только при устойчивом и понятном accessible name.
- **Tokens before visuals** — foreground, indicator, pill surface, border и icon используют component tokens.
- **AI assists, system governs** — AI проверяет структуру и handoff, но не добавляет variants, props или token names.

---

## 2. Anatomy

| Часть | Обязательность | Назначение |
| --- | --- | --- |
| `root` | да | Контейнер Tabs и связанного контента. |
| `tablist` | да | Группа вкладок с orientation и keyboard contract. |
| `tab` | да | Интерактивный элемент выбора раздела. |
| `label` | да | Видимое название вкладки. |
| `icon` | опционально | Дополнительный визуальный маркер; не заменяет label без accessible name. |
| `indicator` | для `Line` | Линия выбранной вкладки. |
| `pillSurface` | для `Pill` | Контейнер выбранной или интерактивной вкладки. |
| `tabpanel` | да | Контент выбранной вкладки. |

### Правила anatomy

- `tab` и `tabpanel` должны быть связаны через `aria-controls`/`aria-labelledby` или эквивалентный contract.
- `label` должен быть коротким и стабильным; длинные labels требуют review структуры.
- Icon-only tabs требуют явного `aria-label` и подтверждения узнаваемости.
- Вложенные Tabs допускаются только после system review: часто это признак перегруженной структуры.

---

## 3. Types / Variants

Figma component set: `Tabs`. Node id: `6196:25`.

| Property | Default | Options | Назначение |
| --- | --- | --- | --- |
| `Variant` | `Line` | `Line`, `Pill` | Визуальный тип вкладок. |
| `size` | `m` | `s`, `m`, `l`, `xl` | Плотность, высота и масштаб label/icon. |

### Variant rules

| Variant | Когда использовать | Ограничения |
| --- | --- | --- |
| `Line` | Стандартная навигация по разделам, страницы настроек, карточки объекта. | Не используйте как segmented control для фильтров. |
| `Pill` | Компактные разделы внутри панели, toolbar или локального блока. | Не перегружайте большим количеством вкладок. |

### Size rules

- `s` — компактные панели и плотные интерфейсы.
- `m` — основной размер для большинства сценариев.
- `l` — крупные touch-oriented зоны или верхние разделы страницы.
- `xl` — сценарии с повышенной читаемостью; требует проверки, что Tabs не становятся hero-navigation.

---

## 4. Sizes

| Size | Когда использовать | Handoff rule |
| --- | --- | --- |
| `s` | Плотные панели, компактные toolbar-сценарии. | Label должен оставаться читаемым; icon-only требует accessible name. |
| `m` | Основной размер для разделов страницы или карточки объекта. | Используйте как default. |
| `l` | Крупные touch-oriented вкладки или верхние разделы. | Проверьте, что Tabs не становятся глобальной навигацией. |
| `xl` | Небольшое число вкладок с повышенной читаемостью. | Требует проверки responsive overflow. |

Размер влияет на визуальную плотность tab items, но не меняет tab/panel relationship, selected state и keyboard behavior.

---

## 5. States

| State | Значение | Правило |
| --- | --- | --- |
| `default` | Вкладка доступна, но не выбрана. | Должна быть читаемой и отличаться от disabled. |
| `hover` | Pointer наведён на вкладку. | Не должен выглядеть как selected. |
| `active` | Вкладка нажимается. | Краткое interaction state, не заменяет selected. |
| `selected` | Текущая вкладка. | Должна быть одна в tablist. |
| `focus` | Вкладка в keyboard focus. | Focus ring должен быть видимым. |
| `disabled` | Вкладка недоступна. | Причина должна быть понятна из контекста; disabled tabs не должны скрывать обязательный контент. |
| `loading` | Контент вкладки загружается. | Loading относится к `tabpanel`, а не к самой вкладке, если label не меняется. |
| `empty` | В выбранной вкладке нет данных. | Используйте Empty State в `tabpanel`. |

---

## 6. Behavior

- Выбор вкладки меняет `selectedValue` и отображаемый `tabpanel`.
- `ArrowLeft`/`ArrowRight` перемещают фокус в horizontal tablist; `ArrowUp`/`ArrowDown` используются для vertical orientation, если она будет добавлена.
- `Home` переводит фокус на первую вкладку, `End` — на последнюю.
- `Enter` или `Space` активируют вкладку, если используется manual activation.
- Automatic activation допустима, если загрузка panel быстрая и не приводит к потере данных.
- При overflow используйте scroll, disclosure или адаптацию, но не уменьшайте label до нечитаемого состояния.
- Состояние выбранной вкладки может синхронизироваться с URL/query только если это описано в handoff.

---

## 7. Accessibility

Компонент следует [foundation/accessibility.md](../../foundation/accessibility.md).

| Требование | Правило |
| --- | --- |
| Roles | Используйте `role="tablist"`, `role="tab"` и `role="tabpanel"` или нативный эквивалент. |
| Selected | Выбранная вкладка имеет `aria-selected="true"`. |
| Relationship | `tab` связан с `tabpanel` через `aria-controls`; panel связан с tab через `aria-labelledby`. |
| Keyboard | Arrow keys, Home/End, Enter/Space работают по выбранному activation mode. |
| Focus | Focus indicator видим и не конфликтует с selected indicator. |
| Disabled | Disabled tabs не должны быть активируемыми и должны иметь понятную причину. |

### Accessibility checklist

- [ ] В tablist выбран ровно один tab.
- [ ] Каждый tab связан с panel.
- [ ] Keyboard behavior описан для activation mode.
- [ ] Focus state видим отдельно от selected state.
- [ ] Loading/empty/error states находятся внутри panel и доступны screen reader.
- [ ] Icon-only tabs имеют accessible name.

---

## 8. Design Tokens

Перед изменением Design Tokens сверяйте реальные component tokens в `tokens.json`.

| Token | Роль | Semantic mapping |
| --- | --- | --- |
| `$collections/components/$modes/Mode 1/tabs/foreground/default` | Текст вкладки по умолчанию | `text/tertiary` |
| `$collections/components/$modes/Mode 1/tabs/foreground/hover` | Текст при hover | `text/secondary` |
| `$collections/components/$modes/Mode 1/tabs/foreground/active` | Текст active/selected | `text/primary` |
| `$collections/components/$modes/Mode 1/tabs/foreground/disabled` | Текст disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/tabs/indicator/default` | Индикатор по умолчанию | `border/brand/default` |
| `$collections/components/$modes/Mode 1/tabs/indicator/selected` | Индикатор selected | `border/brand/default` |
| `$collections/components/$modes/Mode 1/tabs/indicator/hover` | Индикатор hover | `border/brand/hover` |
| `$collections/components/$modes/Mode 1/tabs/indicator/disabled` | Индикатор disabled | `border/disabled` |
| `$collections/components/$modes/Mode 1/tabs/pill/surface/active` | Pill surface active | `container/neutral/pressed` |
| `$collections/components/$modes/Mode 1/tabs/pill/surface/hover` | Pill surface hover | `container/neutral/hover` |
| `$collections/components/$modes/Mode 1/tabs/pill/surface/default` | Pill surface default | `color/transparent` |
| `$collections/components/$modes/Mode 1/tabs/pill/surface/selected` | Pill surface selected | `container/neutral/selected` |
| `$collections/components/$modes/Mode 1/tabs/pill/surface/disabled` | Pill surface disabled | `color/transparent` |
| `$collections/components/$modes/Mode 1/tabs/pill/border/default` | Pill border default | `color/transparent` |
| `$collections/components/$modes/Mode 1/tabs/pill/border/hover` | Pill border hover | `border/hover` |
| `$collections/components/$modes/Mode 1/tabs/pill/border/active` | Pill border active | `border/strong` |
| `$collections/components/$modes/Mode 1/tabs/pill/border/selected` | Pill border selected | `border/selected` |
| `$collections/components/$modes/Mode 1/tabs/pill/border/disabled` | Pill border disabled | `color/transparent` |
| `$collections/components/$modes/Mode 1/tabs/pill/foreground/default` | Pill text default | `text/tertiary` |
| `$collections/components/$modes/Mode 1/tabs/pill/foreground/hover` | Pill text hover | `text/secondary` |
| `$collections/components/$modes/Mode 1/tabs/pill/foreground/active` | Pill text active | `text/primary` |
| `$collections/components/$modes/Mode 1/tabs/pill/foreground/selected` | Pill text selected | `text/primary` |
| `$collections/components/$modes/Mode 1/tabs/pill/foreground/disabled` | Pill text disabled | `status/disabled/text` |
| `$collections/components/$modes/Mode 1/tabs/pill/icon/default` | Pill icon default | `icon/tertiary` |
| `$collections/components/$modes/Mode 1/tabs/pill/icon/hover` | Pill icon hover | `icon/secondary` |
| `$collections/components/$modes/Mode 1/tabs/pill/icon/active` | Pill icon active | `icon/primary` |
| `$collections/components/$modes/Mode 1/tabs/pill/icon/selected` | Pill icon selected | `icon/primary` |
| `$collections/components/$modes/Mode 1/tabs/pill/icon/disabled` | Pill icon disabled | `status/disabled/icon` |

### Token gaps

- Если нужен отдельный focus token для Tabs, зафиксируйте `Token gap` и используйте общий focus contract из foundation.
- Не используйте raw colors для selected indicator, pill surface или disabled state.
- Component tokens являются source of truth для Figma, code и handoff.

---

## 9. Code mapping

| Design concept | Suggested prop / API | Правило |
| --- | --- | --- |
| Variant | `variant` | Маппится на Figma `Variant`: `line` или `pill`. |
| Size | `size` | Только `s`, `m`, `l`, `xl`. |
| Items | `items` | Массив с `value`, `label`, optional `icon`, optional `disabled`. |
| Selected tab | `value` / `selectedValue` | Controlled state выбранной вкладки. |
| Change | `onValueChange` | Вызывается при выборе вкладки. |
| Activation | `activationMode` | `automatic` или `manual`, если поддерживается в code. |
| Panel id | `id` / generated ids | Нужен для `aria-controls` и `aria-labelledby`. |
| Disabled | `disabled` per item | Не должен скрывать обязательный контент. |

### Contract rules

- `variant` в code должен явно маппиться на Figma `Line`/`Pill`.
- Loading, empty и error относятся к `tabpanel`, а не к визуальному состоянию tab.
- Unsupported variants, icon-only mode или vertical orientation помечаются как `Needs system review`, если их нет в component contract.

---

## 10. Handoff notes

| Что передать | Почему важно |
| --- | --- |
| Figma component и node id: `6196:25` | Позволяет сверить design/code mapping. |
| `Variant`, `size`, selected tab | Определяет внешний вид и состояние. |
| Список вкладок с `value`, label, optional icon | Нужен для стабильного API. |
| Связь tab и tabpanel | Нужна для accessibility и QA. |
| Activation mode | Определяет keyboard и async behavior. |
| Overflow/responsive behavior | Предотвращает нечитаемые labels на узких экранах. |
| Token mapping и token gaps | Сохраняет связь с Design Tokens. |

### Acceptance criteria

- В tablist выбран ровно один tab.
- Каждая вкладка связана с `tabpanel`.
- `Line` и `Pill` используют documented component tokens.
- Keyboard navigation работает для arrows, Home/End и Enter/Space.
- Loading/empty/error states отображаются внутри panel.
- AI-generated output не содержит новых variants, props или token names без review.

---

## 11. AI usage rules

- AI может предложить структуру вкладок, labels, panel summaries и handoff notes.
- AI должен сверять `tokens.json` перед изменением раздела Design Tokens.
- AI должен отличать Tabs от Stepper, Segmented Control и основной навигации.
- AI не должен придумывать vertical orientation, nested tabs, raw colors или новые token names без system review.
- AI обязан помечать unclear selected state, missing panel relationship, overflow gap и accessibility gap как `Needs system review`.
- AI может подготовить acceptance criteria, но человек утверждает информационную архитектуру вкладок.

---

## 12. Examples

### Корректно

| Сценарий | Почему |
| --- | --- |
| Tabs `Line` для разделов карточки клиента: Overview, Activity, Billing. | Разделы равноправны и относятся к одному объекту. |
| Tabs `Pill` внутри панели фильтрации отчёта по типу данных. | Компактный локальный контекст без линейного flow. |
| Tab panel с Empty State при отсутствии данных. | Empty относится к контенту вкладки, а не к navigation item. |

### Требует review

| Сценарий | Риск |
| --- | --- |
| Tabs для шагов регистрации. | Нужен Stepper с transition и validation rules. |
| Вкладки как глобальная навигация между страницами. | Нарушается navigation model. |
| Вложенные Tabs внутри каждой вкладки. | Структура становится трудной для понимания и accessibility. |

---

## 13. Anti-patterns

- Использовать Tabs для linear wizard.
- Прятать обязательные поля или ошибки в невыбранной вкладке без summary.
- Делать selected state только цветом без indicator или semantic state.
- Добавлять icon-only tabs без accessible name.
- Уменьшать labels до нечитаемости вместо responsive overflow/adaptation.
