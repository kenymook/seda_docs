# Дизайнерский план SEDA AI до версии 1.0

Дата: 2026-05-10  
Фокус: дизайн-документация, Figma-покрытие, правила применения, компонентное ревью.

## 1. Цель

Версия 1.0 для дизайнеров должна отвечать на простой вопрос: можно ли открыть SEDA AI, выбрать компонент, понять когда его использовать, найти его в Figma, применить правильные состояния, тексты, spacing, tokens и передать в разработку без устных пояснений.

До 1.0 нам не нужно углубляться в developer tooling. Сейчас важнее:

- дизайнерский entry point;
- Figma coverage;
- правила применения foundation;
- зрелость компонентов;
- понятные review checklist;
- примеры типовых сценариев.

---

## 2. Что уже хорошо

| Область | Статус |
|---|---|
| Foundation coverage | Сильное покрытие: color, typography, spacing/layout, motion, content, iconography, accessibility, governance. |
| Component specs | 51 spec, overview совпадает со specs. |
| Tokens | Unknown token refs = 0, семантическая модель описана. |
| Accessibility | Есть общий foundation и пилотная сверка ключевых компонентов. |
| Content | Есть правила labels, errors, empty states, confirmations. |
| Motion/Iconography | Есть отдельные foundation-документы. |

Главный оставшийся дизайнерский разрыв: Figma-связи, примеры применения и maturity/status.

---

## 3. P0 для дизайнерской версии 1.0

### 3.1 Figma coverage

Сейчас 50 specs имеют warning по отсутствующей реальной Figma URL.

Что сделать:

1. Для каждого component spec добавить ссылку на Figma component/frame.
2. Если компонента в Figma нет, поставить `Status · draft`.
3. Если компонент есть, но требует ревью, оставить `needs-review`.
4. Если компонент готов, перевести в `ready`.

Критерий готовности:

- дизайнер может из spec перейти в Figma;
- Figma component соответствует anatomy, variants, sizes, states;
- если Figma не готова, это явно видно по статусу.

### 3.2 Дизайнерский index

Нужен простой вход для дизайнеров: не технический README, а карта “с чего начать”.

Создать:

```text
reports/seda-designer-index.md
```

Содержание:

1. Как пользоваться SEDA AI в Figma.
2. Какие foundation читать первыми.
3. Как выбрать компонент.
4. Как проверить accessibility.
5. Как писать тексты.
6. Как готовить handoff.
7. Что значит `draft`, `needs-review`, `ready`.

### 3.3 Maturity matrix для дизайнеров

Текущая `component-maturity-matrix.md` уже есть, но ее нужно обновить под дизайн-реальность.

Что добавить:

| Поле | Значение |
|---|---|
| Figma status | missing / draft / ready |
| Spec status | draft / needs-review / ready |
| Design review | not-started / in-progress / passed |
| Accessibility review | not-started / passed / needs-work |
| Content review | not-started / passed / needs-work |
| Priority | P0 / P1 / P2 |

---

## 4. P1. Foundation для дизайнерского использования

### 4.1 Design usage examples

Foundation сейчас хорошо описывает правила, но для дизайнеров нужны примеры “как применить”.

Добавить в ключевые foundation:

| Документ | Какие примеры добавить |
|---|---|
| `color.md` | Surface/layer examples, status examples, text-on-color examples. |
| `typography.md` | Page layout: title, section, body, label, caption, metric. |
| `spacing-sizing.md` | Form layout, table layout, dashboard layout, settings page. |
| `elevation.md` | Modal, Drawer, Popover, Tooltip, sticky header. |
| `content.md` | Button labels, empty states, errors, destructive confirmation. |
| `iconography.md` | Icon-only button, status icon, decorative icon, empty state icon. |

Формат примера:

```text
Сценарий
Use
Don't use
Tokens / components
Accessibility note
```

### 4.2 Handoff checklist

Создать дизайнерский checklist:

```text
reports/design-handoff-checklist.md
```

Пункты:

- выбран правильный компонент;
- variant/state соответствует spec;
- Figma component linked;
- text follows content foundation;
- focus/keyboard behavior понятен;
- empty/loading/error states есть;
- contrast и text-on-color проверены;
- icons meaningful/decorative отмечены;
- responsive/density решение понятно;
- open questions записаны.

---

## 5. P2. Component review для дизайнеров

### 5.1 Первая волна: самые частые компоненты

Проверить и довести до `ready`:

1. Button
2. Icon Button
3. Text Field
4. Text Area
5. Select
6. Checkbox
7. Radio
8. Modal
9. Alert
10. Toast

Что проверять:

- Figma variants;
- anatomy;
- sizes;
- states;
- content rules;
- accessibility notes;
- tokens;
- examples.

### 5.2 Вторая волна: сложные сценарии

1. Table
2. Dropdown / Menu
3. Search
4. Popover
5. Drawer
6. Tabs
7. Form
8. Date Picker
9. File Upload
10. Tooltip

Фокус:

- keyboard/focus behavior;
- responsive;
- overlays;
- empty/loading/error states;
- density.

### 5.3 Третья волна: data display и polish

1. Card
2. Tag
3. Badge
4. Avatar
5. Stat / Metric
6. Timeline
7. Chat Bubble
8. Empty State
9. Skeleton
10. Progress Bar

Фокус:

- visual hierarchy;
- semantic color;
- content;
- status meaning;
- iconography;
- data density.

---

## 6. P3. Figma library readiness

Для версии 1.0 дизайнерская Figma library должна иметь:

1. Components organized by category.
2. Variants named like specs.
3. Sizes match component sizing rules in `foundation/spacing-sizing.md`.
4. Text styles match `foundation/typography.md`.
5. Color variables match semantic tokens.
6. Effects/elevation match `foundation/elevation.md`.
7. Icons match `foundation/iconography.md`.
8. Component descriptions include usage notes or spec link.
9. Deprecated/draft components clearly marked.
10. Ready components have stable names.

---

## 7. Что не делаем сейчас

Чтобы не распыляться, пока не добавляем:

- token export scripts;
- production package;
- platform adapters;
- Code Connect;
- build pipeline;
- generated docs tables;
- visual regression tooling.

Эти задачи полезны, но они относятся к developer/system operations треку. Сейчас основной путь к 1.0 — дизайнерская зрелость.

---

## 8. Новый ближайший порядок

1. Создать `reports/seda-designer-index.md`.
2. Создать `reports/design-handoff-checklist.md`.
3. Обновить `reports/component-maturity-matrix.md` под дизайнерские поля.
4. Пройти первую волну компонентов: Button, Icon Button, Text Field, Text Area, Select, Checkbox, Radio, Modal, Alert, Toast.
5. Для каждого компонента добавить или уточнить Figma URL/status.
6. Добавить usage examples в color, typography, spacing-layout, content.

---

## 9. Definition of Done для дизайнерского 1.0

SEDA AI готова как дизайнерская 1.0, если:

- дизайнер понимает, с чего начать;
- у P0 компонентов есть Figma-ссылки;
- maturity matrix показывает честный статус;
- первая волна компонентов прошла design/content/accessibility review;
- foundation содержит не только правила, но и практические примеры;
- handoff checklist покрывает состояния, тексты, accessibility и tokens;
- все незавершенное явно помечено как draft или post-1.0 backlog.
