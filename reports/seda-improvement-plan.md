# План улучшения и доработки SEDA AI

Дата: 2026-05-09  
Основа: `reports/seda-foundation-comparison.md`

## Цель

Довести SEDA AI от набора сильных component specs до полноценной foundation-дизайн-системы: с понятными токенами, типографикой, accessibility-стандартами, layout-моделью, motion/elevation, governance и проверками качества документации.

## Принцип работы

Улучшать систему слоями:

1. Сначала усилить foundation-документы.
2. Затем синхронизировать component specs с новыми foundation-правилами.
3. После этого добавить автоматические проверки, lifecycle токенов и governance.

Компоненты не переписывать сразу. Текущие specs уже полезны; задача первой итерации - поднять повторяющиеся правила из компонентов в общий foundation-слой.

## Этап 0. Инвентаризация и фиксация текущего состояния

Срок: 0.5-1 день  
Приоритет: высокий

### Задачи

1. Собрать индекс всех foundation-документов.
2. Собрать индекс всех component specs.
3. Отметить статус каждого spec-файла: `draft`, `needs-review`, `ready`.
4. Найти расхождения:
   - компонент есть в `foundation/components.md`, но нет spec-файла;
   - spec-файл есть, но компонент не указан в overview;
   - Figma-ссылка placeholder;
   - отсутствуют обязательные секции;
   - токены в specs не описаны в foundation.

### Артефакты

- `reports/seda-docs-inventory.md`
- Таблица зрелости компонентов внутри отчета или отдельный `reports/component-maturity-matrix.md`

### Критерий готовности

Есть список всех пробелов документации и понятный статус каждого компонента.

## Этап 1. Accessibility foundation

Срок: 1-2 дня  
Приоритет: высокий
Статус: базовая доработка выполнена 2026-05-09

### Почему первым

Accessibility влияет на все компоненты и задает обязательные критерии качества: контраст, фокус, keyboard, screen reader, ошибки, touch targets.

### Задачи

1. Расширить `foundation/accessibility.md`.
2. Добавить WCAG 2.2 AA критерии:
   - текст: минимум 4.5:1;
   - крупный текст: минимум 3:1;
   - UI-компоненты и иконки: минимум 3:1;
   - focus indicator не только цветом;
   - touch target минимум 44x44px.
3. Описать keyboard rules:
   - tab order;
   - focus trap;
   - focus return;
   - Escape для overlay;
   - arrow navigation для composite widgets.
4. Описать screen reader patterns:
   - labels;
   - descriptions;
   - error messages;
   - live regions;
   - status updates;
   - icon-only actions.
5. Добавить checklist для дизайнеров и разработчиков.
6. Обновить `specs/component-spec-template.md`: добавить accessibility acceptance criteria.

### Артефакты

- Обновленный `foundation/accessibility.md` - выполнено
- Обновленный `specs/component-spec-template.md` - выполнено
- Пилотная сверка `Button`, `Text Field`, `Modal` с новым accessibility foundation - выполнено

### Критерий готовности

Любой компонент можно проверить по единому accessibility checklist без чтения внешних источников.

## Этап 2. Typography foundation

Срок: 1-2 дня  
Приоритет: высокий
Статус: базовая доработка выполнена 2026-05-09

### Почему важно

Сейчас типографика завязана на размеры компонентов. Для полноценной системы нужны отдельные роли текста: заголовки, body, labels, captions, metrics, code.

### Задачи

1. Создать `foundation/typography.md`.
2. Описать font stack для Web:
   - primary;
   - fallback;
   - monospace.
3. Ввести type roles:
   - `display`;
   - `heading`;
   - `title`;
   - `body`;
   - `label`;
   - `caption`;
   - `code`;
   - `metric`.
4. Для каждой роли описать:
   - font size;
   - line height;
   - font weight;
   - use cases;
   - don't use cases.
5. Связать type roles с системой component sizing в `spacing-sizing.md`.
6. Добавить правила:
   - длина строки;
   - truncation;
   - numeric alignment;
   - casing;
   - responsive behavior.

### Артефакты

- Новый `foundation/typography.md` - выполнено
- При необходимости обновленный component sizing в `foundation/spacing-sizing.md` - выполнено

### Критерий готовности

Дизайнер и разработчик понимают, какой текстовый стиль использовать для страницы, секции, компонента, подписи, метрики и кода.

## Этап 3. Tokens и color architecture

Срок: 2-4 дня  
Приоритет: высокий
Статус: базовая доработка выполнена 2026-05-09

### Почему важно

Токены уже есть, но нужна архитектура: primitive, semantic, component, mode, lifecycle и правила использования.

### Задачи

1. Создать `foundation/tokens.md`.
2. Описать слои токенов:
   - primitive tokens;
   - semantic tokens;
   - component tokens;
   - mode tokens.
3. Формализовать naming grammar:
   - `category/role/state`;
   - когда использовать `surface`;
   - когда использовать `container`;
   - когда использовать `border`;
   - когда использовать `status`.
4. Создать `foundation/color.md`.
5. В `color.md` описать:
   - color roles;
   - light/dark model;
   - contrast matrix;
   - surface/layer model;
   - text-on-color rules;
   - status color usage;
   - visited link usage.
6. Добавить layer tokens:
   - `layer/01`;
   - `layer/02`;
   - `layer/03`;
   - `overlay/scrim`;
   - `surface/raised`.
7. Описать token lifecycle:
   - add;
   - rename;
   - deprecate;
   - remove;
   - migration note.

### Артефакты

- Новый `foundation/tokens.md` - выполнено
- Новый `foundation/color.md` - выполнено
- Обновленный `foundation/theming.md` - выполнено

### Критерий готовности

Любой новый токен можно назвать, разместить в правильном слое и объяснить его allowed usage.

## Этап 4. Spacing, layout и density

Срок: 2-3 дня  
Приоритет: высокий
Статус: базовая доработка выполнена 2026-05-09

### Почему важно

SEDA похожа на B2B/AI UI-систему, где плотность, таблицы, формы и панели важнее декоративных экранов. Нужны правила компоновки, а не только шкала отступов.

### Задачи

1. Расширить `foundation/spacing-sizing.md`.
2. Добавить semantic spacing tokens:
   - `space/component/xs`;
   - `space/component/s`;
   - `space/component/m`;
   - `space/layout/s`;
   - `space/layout/m`;
   - `space/layout/l`;
   - `space/section/m`;
   - `space/section/l`.
3. Описать density modes:
   - `compact`;
   - `regular`;
   - `comfortable`.
4. Описать layout patterns:
   - form;
   - table;
   - dashboard;
   - master-detail;
   - sidebar layout;
   - command/search overlay.
5. Описать responsive behavior:
   - breakpoints;
   - container max-width;
   - grid columns;
   - safe areas;
   - mobile stacking.

### Артефакты

- Обновленный `foundation/spacing-sizing.md` - выполнено
- При необходимости новый `foundation/density.md`

### Критерий готовности

Можно собрать экран формы, таблицы или dashboard без произвольных отступов и спорных layout-решений.

## Этап 5. Radius, border, elevation

Срок: 1-2 дня  
Приоритет: средний
Статус: базовая доработка выполнена 2026-05-09

### Задачи

1. Создать `foundation/radius-border.md`.
2. Описать radius scale:
   - `none`;
   - `xs`;
   - `sm`;
   - `md`;
   - `lg`;
   - `xl`;
   - `full`.
3. Описать border tokens:
   - width;
   - style;
   - subtle/default/strong;
   - focus border vs focus ring.
4. Создать `foundation/elevation.md`.
5. Описать elevation levels:
   - none;
   - raised;
   - floating;
   - overlay;
   - modal.
6. Добавить z-index layers:
   - base;
   - sticky;
   - dropdown;
   - overlay;
   - modal;
   - toast.

### Артефакты

- Новый `foundation/radius-border.md` - выполнено
- Новый `foundation/elevation.md` - выполнено

### Критерий готовности

У каждого overlay, card, dropdown, modal и toast есть единая логика глубины, тени и слоя.

## Этап 6. Motion foundation

Срок: 1-2 дня  
Приоритет: средний
Статус: базовая доработка выполнена 2026-05-09

### Задачи

1. Создать `foundation/motion.md`.
2. Добавить duration tokens:
   - `duration/instant`;
   - `duration/fast`;
   - `duration/base`;
   - `duration/slow`.
3. Добавить easing tokens:
   - `easing/standard`;
   - `easing/enter`;
   - `easing/exit`;
   - `easing/emphasized`.
4. Описать motion patterns:
   - fade;
   - slide;
   - collapse;
   - expand;
   - loading;
   - skeleton;
   - drag.
5. Описать `prefers-reduced-motion`.
6. Синхронизировать specs, где motion уже упоминается:
   - Drawer;
   - Alert;
   - Toggle;
   - Skeleton;
   - Spinner;
   - Toast;
   - Modal.

### Артефакты

- Новый `foundation/motion.md` - выполнено
- Обновленные specs, где есть анимации - пилотная синхронизация выполнена для Drawer, Alert, Toggle, Skeleton, Spinner, Toast, Modal

### Критерий готовности

Все анимации используют общие duration/easing rules и имеют reduced-motion fallback.

## Этап 7. Content design и UX writing

Срок: 1-2 дня  
Приоритет: средний
Статус: базовая доработка выполнена 2026-05-09

### Задачи

1. Создать `foundation/content.md`.
2. Описать voice and tone:
   - clear;
   - concise;
   - useful;
   - calm;
   - action-oriented.
3. Описать правила label:
   - button labels;
   - field labels;
   - menu items;
   - tabs;
   - destructive actions.
4. Описать message patterns:
   - error;
   - warning;
   - success;
   - info;
   - empty state;
   - loading;
   - confirmation.
5. Добавить glossary терминов SEDA AI.

### Артефакты

- Новый `foundation/content.md` - выполнено

### Критерий готовности

Тексты в компонентах можно писать по общей системе, без разрозненных правил внутри отдельных specs.

## Этап 8. Iconography

Срок: 1 день  
Приоритет: средний
Статус: базовая доработка выполнена 2026-05-09

### Задачи

1. Создать `foundation/iconography.md`.
2. Описать icon sizes:
   - 12;
   - 14;
   - 16;
   - 20;
   - 24;
   - 32.
3. Описать стиль:
   - stroke width;
   - caps/joins;
   - filled vs outline;
   - optical alignment.
4. Описать usage:
   - decorative icons;
   - meaningful icons;
   - status icons;
   - action icons;
   - empty state illustrations.
5. Описать accessibility:
   - когда нужен `aria-label`;
   - когда `aria-hidden="true"`;
   - когда нужен tooltip.

### Артефакты

- Новый `foundation/iconography.md` - выполнено

### Критерий готовности

Icon-only, prefix/suffix, status и decorative icons описаны единообразно.

## Этап 9. Component specs cleanup

Срок: 3-5 дней  
Приоритет: высокий после foundation-этапов
Статус: начато 2026-05-09; inventory, maturity matrix и Color Picker draft выполнены

### Задачи

1. Обновить `specs/component-spec-template.md` под новые foundation-документы.
2. Пройти все specs и привести к единой структуре:
   - Key principles;
   - Anatomy;
   - Types / Variants;
   - Sizes;
   - States;
   - Behavior;
   - Accessibility;
   - Design tokens.
3. Исправить placeholder Figma-ссылки:
   - заменить реальной ссылкой;
   - или явно указать `Figma: TBD`.
4. Создать недостающий `specs/inputs/color-picker.md` или удалить Color Picker из `foundation/components.md`. — выполнено
5. Добавить maturity status:
   - `draft`;
   - `review`;
   - `ready`;
   - `deprecated`.
6. Добавить owner/last reviewed, если у команды есть владельцы.

### Артефакты

- Обновленный `specs/component-spec-template.md`
- Обновленные component specs
- `reports/component-maturity-matrix.md` - выполнено
- `reports/seda-docs-inventory.md` - выполнено

### Критерий готовности

Каждый компонент имеет одинаковую структуру, понятный статус и не ссылается на несуществующие foundation-правила.

## Этап 10. Governance и tooling

Срок: 3-7 дней  
Приоритет: средний
Статус: начато 2026-05-09; governance, changelog, token pipeline и базовый docs checker добавлены. Metadata и missing sections в specs нормализованы, coverage check добавлен, token reference audit подключен. Остались реальные Figma URL.

### Задачи

1. Создать `foundation/governance.md`.
2. Описать lifecycle:
   - proposal;
   - draft;
   - review;
   - ready;
   - deprecated;
   - removed.
3. Создать `CHANGELOG.md`.
4. Добавить правила версионирования:
   - patch;
   - minor;
   - major;
   - breaking changes.
5. Добавить docs quality checks:
   - missing required sections;
   - placeholder Figma links;
   - invalid token refs;
   - component listed but spec missing;
   - spec exists but component not listed.
6. Подготовить token pipeline:
   - `tokens.json` как source;
   - CSS variables export;
   - docs tables export;
   - Figma variables sync notes.

### Артефакты

- Новый `foundation/governance.md` - выполнено
- Новый `CHANGELOG.md` - выполнено
- Скрипт проверки документации, например `tools/check-docs.ps1` - базовая версия выполнена
- Результат первого запуска `reports/docs-check-results.md` - выполнено
- Проверка coverage `foundation/components.md` ↔ `specs/` - выполнено
- Документ token pipeline - выполнено
- Первичный token reference audit `tools/check-token-refs.ps1` / `reports/token-reference-audit.md` - выполнено
- План нормализации token references `reports/token-normalization-plan.md` - выполнено

### Критерий готовности

Система может развиваться управляемо: изменения имеют статус, версию, владельца и автоматическую проверку.

## Приоритетный backlog

### P0

1. `foundation/accessibility.md`
2. `foundation/typography.md`
3. `foundation/tokens.md`
4. `foundation/color.md`
5. `foundation/spacing-sizing.md`
6. `specs/component-spec-template.md`

### P1

1. `foundation/motion.md`
2. `foundation/elevation.md`
3. `foundation/radius-border.md`
4. `foundation/content.md`
5. `foundation/iconography.md`
6. `reports/component-maturity-matrix.md`

### P2

1. `foundation/governance.md`
2. `CHANGELOG.md`
3. `tools/check-docs.ps1`
4. token pipeline
5. platform adapters

## Рекомендуемый порядок выполнения

1. Accessibility
2. Typography
3. Tokens
4. Color
5. Spacing/Layout/Density
6. Radius/Border/Elevation
7. Motion
8. Content
9. Iconography
10. Component specs cleanup
11. Governance/Tooling

## Definition of Done для foundation-документа

Документ считается готовым, если:

1. Есть цель и область применения.
2. Есть базовые принципы.
3. Есть токены или правила, если категория токенизируется.
4. Есть примеры использования.
5. Есть "Do / Don't" или "Use / Don't use".
6. Есть accessibility notes, если категория влияет на доступность.
7. Есть связь с компонентами.
8. Нет ссылок на несуществующие токены.
9. Документ можно использовать без внешнего контекста.

## Definition of Done для component spec

Spec считается готовым, если:

1. Есть реальная Figma-ссылка или явный `TBD`.
2. Есть anatomy.
3. Есть variants/types.
4. Есть sizes или объяснение, почему sizes не применяются.
5. Есть state matrix.
6. Есть behavior и keyboard interaction.
7. Есть accessibility section.
8. Есть token mapping.
9. Все токены существуют в foundation или помечены как component-specific.
10. Есть статус зрелости.

## Риски

| Риск | Что может случиться | Как снизить |
|---|---|---|
| Слишком много новых документов сразу | Система станет тяжелой и недоделанной | Делать по P0/P1/P2, не начинать все одновременно |
| Токены разойдутся с Figma | Документация потеряет доверие | Ввести проверку refs и единый source of truth |
| Accessibility останется в component specs | Правила будут повторяться и конфликтовать | Сначала усилить foundation/accessibility |
| Typography будет смешана с sizes | Сложно строить страницы и контент | Разделить type roles и component sizes |
| Governance появится слишком рано | Команда утонет в процессе | Сначала foundation, потом lifecycle и tooling |

## Ожидаемый результат

После выполнения плана SEDA AI должна иметь:

- полный foundation-layer;
- единый token language;
- измеримые accessibility criteria;
- самостоятельную typography system;
- понятную layout/density model;
- motion/elevation правила;
- единый component spec standard;
- roadmap зрелости компонентов;
- основу для автоматической проверки документации и токенов.
