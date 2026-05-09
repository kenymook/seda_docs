# Отчет: сравнение foundation-документации SEDA AI

Дата: 2026-05-09  
Область анализа: `foundation/`, `specs/`, `tokens.json`, `seda-docs.jsx`

## 1. Краткий вывод

SEDA AI уже имеет хороший каркас дизайн-системы: есть семантические color tokens, light/dark модель, словарь состояний, interaction model, система размеров и подробный шаблон спецификации компонента. По зрелости component specs местами сильнее, чем foundation-раздел: например, `Button` и `Text Field` уже описывают anatomy, keyboard, accessibility, state combinations и component tokens.

Главный разрыв с крупными foundation-системами не в компонентах, а в глубине базовых основ. У SEDA пока мало или нет отдельных foundation-документов для typography, motion, elevation/layering, iconography, content design, governance, token delivery, platform adaptation и accessibility checklist. Это мешает использовать SEDA как “foundation for systems”, потому что правила есть, но часть решений остается в компонентах или коде, а не в общей модели.

## 2. Системы для сравнения

| Система | Что взято как ориентир | Сильная сторона |
|---|---|---|
| Carbon Design System | Themes, color tokens, accessibility | Ролевая модель токенов, layering, темы white/gray/dark, строгие AA-правила |
| Fluent 2 | Design tokens, accessibility, layout, typography | Инклюзивность, структура, фокус, responsive guidance, platform-native typography |
| Shopify Polaris | Color/layout/typography tokens | Ясная структура semantic tokens: element, role, prominence, state |
| Material Design 3 | Typography, color roles, accessibility/touch, adaptive layout | Адаптивность, type scale, touch targets, platform implementation |
| Adobe Spectrum | Spectrum Design Data tokens and registry | Машинно-читаемые токены, component-specific tokens, scale/color variants |
| Atlassian Design System | Foundations overview | Полнота foundation-карты: tokens, content, grid, elevation, radius, iconography |

Источники: [Carbon color overview](https://carbondesignsystem.com/elements/color/overview/), [Carbon color tokens](https://carbondesignsystem.com/elements/color/tokens/), [Carbon accessibility color](https://carbondesignsystem.com/guidelines/accessibility/color/), [Fluent design tokens](https://fluent2.microsoft.design/design-tokens), [Fluent accessibility](https://fluent2.microsoft.design/accessibility), [Fluent layout](https://fluent2.microsoft.design/layout), [Fluent typography](https://fluent2.microsoft.design/typography), [Polaris color tokens](https://polaris-react.shopify.com/design/colors/color-tokens), [Polaris layout tokens](https://polaris-react.shopify.com/design/layout/layout-tokens), [Polaris typography tokens](https://polaris-react.shopify.com/design/typography/typography-tokens), [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3), [Material accessibility](https://m1.material.io/usability/accessibility.html), [Spectrum Design Data tokens](https://opensource.adobe.com/spectrum-design-data/tokens/), [Spectrum typography tokens](https://opensource.adobe.com/spectrum-design-data/tokens/typography/), [Atlassian foundations](https://atlassian.design/foundations).

## 3. Плюсы и минусы систем

### SEDA AI

Плюсы:
- Хорошая компонентная структура: категории, variants, sizes, states, behavior, accessibility, tokens.
- Сильная терминология состояний: `active` не смешивается с `selected`, `checked`, `on/off`.
- Есть light/dark semantic tokens и компонентные токены в specs.
- Interaction model описывает keyboard parity, focus return, disabled vs read-only, async feedback.
- Документация написана практически, с конкретными “Use / Don't use”.

Минусы:
- Foundation неполный: нет отдельных документов для typography, motion, elevation, iconography, content, governance.
- `accessibility.md`, `spacing-layout.md`, `validation-model.md`, `component-anatomy.md` слишком короткие по сравнению с глубиной component specs.
- В `components.md` есть `Color Picker`, но отдельного `specs/inputs/color-picker.md` нет.
- Почти все specs, кроме Button, имеют placeholder Figma-ссылки.
- `tokens.json` выглядит богаче документации: там есть radius/typography/shadow, но foundation раскрывает их частично.
- Нет явной модели поставки токенов: CSS variables, JSON, Figma variables, платформенные экспорты, versioning.

### Carbon

Плюсы:
- Очень сильная role-based color модель: token, role, value и theme разделены.
- Есть layering model для светлых и темных тем.
- Токены покрывают core, component и AI-specific cases.
- Accessibility привязана к WCAG AA и конкретным contrast ratios.

Минусы:
- Корпоративная IBM-логика может быть тяжелой для небольшой продуктовой системы.
- Некоторые naming-паттерны Carbon менее интуитивны для команд, привыкших к semantic slash naming.

Что взять SEDA:
- Описать layering model: page background, layer 1, layer 2, overlays.
- Ввести таблицу “Token / Role / Allowed usage / Contrast requirement”.
- Разделить global/core tokens, semantic tokens и component tokens.

### Fluent 2

Плюсы:
- Сильная доступность: структура, focus management, keyboard, meaningful text, code standards.
- Layout описан через смысл пространства: proximity, hierarchy, responsive behavior.
- Typography учитывает платформенные шрифты и читаемость.
- Поддерживает light/dark/high-contrast/branded themes.

Минусы:
- Много guidance-level текста, меньше прямой token-table конкретики в некоторых разделах.
- Microsoft-экосистема задает специфичный контекст.

Что взять SEDA:
- Расширить accessibility до checklist для дизайнеров и разработчиков.
- Добавить high-contrast theme как отдельный режим или минимум требования к контрасту.
- Сделать layout foundation не только “scale”, но и правила группировки, плотности, responsive hierarchy.

### Shopify Polaris

Плюсы:
- Отличная структура semantic tokens: element, role, prominence, state.
- Interaction states явно встроены в token naming.
- Layout tokens привязаны к 4px base scale и правилам применения.
- Typography tokens имеют primitive и semantic слои.

Минусы:
- Система сильно заточена под Shopify Admin и merchant workflows.
- Большая token taxonomy может стать избыточной для ранней системы.

Что взять SEDA:
- Формализовать token grammar: `category/role/prominence/state`.
- Разделить spacing tokens для padding, gap, layout и component internals.
- Добавить semantic typography tokens, а не только размеры компонентов.

### Material Design 3

Плюсы:
- Сильная типографическая шкала: display, headline, title, body, label.
- Хорошая адаптивная логика для разных экранов и touch-first интерфейсов.
- Color roles и dynamic theming дают системную гибкость.
- В implementation docs есть мост к реальному коду.

Минусы:
- Material визуально узнаваем и может “перекрасить” продукт, если брать его слишком буквально.
- Dynamic color полезен не для всех брендов и B2B-продуктов.

Что взять SEDA:
- Ввести отдельную type scale с ролями, не завязанными только на component size.
- Уточнить touch target: сейчас SEDA использует 44x44px, но можно описать platform variants, например desktop compact и mobile comfortable.
- Добавить adaptive layout patterns: list-detail, feed, supporting pane, dashboard.

### Adobe Spectrum

Плюсы:
- Машинно-читаемые design data: tokens, component schemas, registry.
- Есть component-specific layout и color tokens.
- Учитываются scale variants, color themes, deprecated tokens и replacements.
- Подходит для AI-assisted development и автоматической проверки документации.

Минусы:
- Очень техническая система, не всегда удобна как первое чтение для дизайнера.
- Большой объем токенов требует строгого governance.

Что взять SEDA:
- Сделать registry терминов: sizes, states, variants, slots.
- Добавить deprecation policy для токенов и компонентов.
- Синхронизировать `tokens.json` и markdown-документацию автоматической проверкой.

### Atlassian

Плюсы:
- Foundation-карта полная и понятная: tokens, accessibility, content, spacing, grid, color, typography, iconography, illustration, elevation, border, radius.
- Хорошо разделены guidelines и styles.

Минусы:
- Overview сам по себе обзорный, для внедрения нужны глубокие дочерние документы.
- Система продуктово привязана к Atlassian software workflows.

Что взять SEDA:
- Сделать foundation index как карту улучшений и владельцев.
- Добавить недостающие foundation-категории в явном виде.

## 4. Сравнение по категориям

### 4.1 Токены и тематизация

SEDA сейчас:
- Есть `foundation/theming.md` с semantic tokens: `surface`, `container`, `border`, `text`, `link`, `status`, `shadow`, `focus`, `tag`.
- Есть light/dark таблицы.
- Component specs часто мапят component tokens на semantic tokens.

Отличия от зрелых систем:
- Carbon и Fluent явно описывают уровни токенов: global/core → alias/semantic → component.
- Polaris фиксирует грамматику имени токена и state suffixes.
- Spectrum публикует токены как machine-readable источник с deprecated/replaced metadata.

Плюсы SEDA:
- Slash naming читаемый.
- Семантический слой уже отделен от foundation palette.
- State → Token mapping есть прямо в theming.

Минусы SEDA:
- Не описаны primitive tokens как отдельный публичный слой.
- Не хватает rules: когда использовать `surface`, когда `container`, когда `status`.
- Нет token lifecycle: добавление, переименование, deprecation, breaking changes.
- Нет связи `tokens.json` → CSS variables → Figma variables → docs.

Что улучшить:
1. Добавить `foundation/tokens.md`: layers, naming grammar, lifecycle, examples.
2. Разделить токены на `primitive`, `semantic`, `component`, `mode`.
3. Добавить таблицу “Allowed usage” для каждой semantic-группы.
4. Добавить token quality checks: missing dark value, unused token, undocumented token, invalid reference.

### 4.2 Цвет и темы

SEDA сейчас:
- Light/Dark описаны для основных semantic groups.
- Есть status colors и focus ring.

Отличия:
- Carbon описывает layering model и 4 default themes.
- Fluent явно говорит о high contrast и WCAG AA.
- Material делает color roles и пары “on color” частью системы.
- Polaris разделяет element, role, prominence, state.

Плюсы SEDA:
- Есть `text/on-brand/*` и `text/on-inverse/*`, что правильно для контрастных поверхностей.
- Есть visited links.
- Есть status-семантика.

Минусы SEDA:
- Нет документа “Color” как foundation: роль цвета, anatomy, contrast, examples.
- Не хватает surface/layer depth: page, section, card, overlay, raised, selected.
- `shadow/base` как цветовой токен выглядит менее ясно, чем полноценный elevation token.
- Нет high-contrast или accessibility mode.

Что улучшить:
1. Добавить `foundation/color.md` с color anatomy, semantic usage и contrast matrix.
2. Добавить layer tokens: `layer/01`, `layer/02`, `overlay/scrim`, `surface/raised`.
3. Проверить все пары text/background на 4.5:1 и UI boundary на 3:1.
4. Добавить high-contrast strategy: отдельная тема или overrides.

### 4.3 Типографика

SEDA сейчас:
- Типографика встроена в `sizes.md`: small 12/16, medium 14/20, large 16/24, extraLarge 18/28.
- В `tokens.json` есть признаки typography tokens, но отдельной foundation-документации нет.

Отличия:
- Material имеет role-based type scale: display, headline, title, body, label.
- Fluent описывает platform-native font stack, hierarchy и readable text.
- Polaris и Spectrum имеют primitive и semantic typography tokens.

Плюсы SEDA:
- Размеры компонентов согласованы с font/line-height.
- Для UI controls схема простая и предсказуемая.

Минусы SEDA:
- Нет ролей для page title, section title, body, caption, code, metric.
- Нет font family, font weight, letter spacing, paragraph spacing.
- Не описаны responsive/mobile typography decisions.
- Нельзя отделить “размер компонента” от “иерархии текста”.

Что улучшить:
1. Добавить `foundation/typography.md`.
2. Ввести semantic roles: `display`, `heading`, `title`, `body`, `label`, `caption`, `code`, `metric`.
3. Описать font stack для Web и возможные platform substitutions.
4. Добавить правила длины строк, line height, truncation, numeric alignment.

### 4.4 Spacing, grid и layout

SEDA сейчас:
- `spacing-layout.md` содержит шкалу 4, 8, 12, 16, 24, 32 и общие правила.
- `Container` и `Grid` specs описывают breakpoints и max widths.

Отличия:
- Fluent объясняет space as relationship: proximity, hierarchy, grouping.
- Polaris явно запрещает применять spacing tokens для non-space свойств.
- Atlassian разделяет spacing и grid как отдельные foundations.

Плюсы SEDA:
- База 4px читаемая.
- Есть breakpoints в Grid и Container.

Минусы SEDA:
- Документ слишком короткий для foundation.
- Нет плотностей: compact, regular, comfortable.
- Нет layout patterns для dashboard, forms, master-detail, tables.
- Не описаны vertical rhythm, gutters, responsive behavior, safe areas.

Что улучшить:
1. Расширить `foundation/spacing-layout.md` до spacing, grid, density, layout patterns.
2. Добавить semantic spacing tokens: `space/component/xs`, `space/layout/md`, `space/section/lg`.
3. Описать responsive контейнеры и правила перестройки.
4. Добавить примеры для форм, таблиц, sidebars, dashboards.

### 4.5 Размеры, radius, border, elevation

SEDA сейчас:
- `sizes.md` сильный для components: 24, 32, 40, 48px.
- Radius встроен в размеры.
- Shadow описан только в `theming.md` и частично в specs.

Отличия:
- Atlassian выделяет elevation, border, radius как отдельные foundations.
- Carbon использует layering model для глубины.
- Spectrum имеет layout tokens для dimensions, corner radius и component internals.

Плюсы SEDA:
- Размеры компонентов очень понятные и легко внедряются.
- Система хорошо подходит для плотных B2B-интерфейсов.

Минусы SEDA:
- Radius смешан с size, но нет общего radius scale.
- Border widths/styles не описаны как foundation.
- Elevation не имеет уровней, назначения и правил.

Что улучшить:
1. Добавить `foundation/elevation.md`: levels, shadows, overlays, z-index.
2. Добавить `foundation/radius-border.md`: radius scale, stroke widths, separators.
3. Уточнить, какие компоненты могут иметь elevation, а какие только border.

### 4.6 Motion

SEDA сейчас:
- Motion есть локально в specs: Drawer 200ms, Alert transition, Toggle animation, Skeleton reduced motion.
- Отдельного foundation motion нет.

Отличия:
- Зрелые системы задают duration, easing, reduced motion, enter/exit patterns.
- Material особенно силен в interaction feedback и transitions.

Плюсы SEDA:
- В некоторых specs уже учитывается `prefers-reduced-motion`.

Минусы SEDA:
- Нет общей motion scale.
- Нет правил, когда motion нужен, а когда вреден.
- Нет standard easing, duration, delay, spring/linear distinction.

Что улучшить:
1. Добавить `foundation/motion.md`.
2. Ввести tokens: `duration/fast`, `duration/base`, `duration/slow`, `easing/standard`, `easing/exit`, `easing/enter`.
3. Описать patterns: fade, slide, collapse, loading, drag.
4. Обязать reduced-motion fallback.

### 4.7 Состояния и interaction model

SEDA сейчас:
- Это одна из лучших частей системы.
- `state-vocabulary.md`, `states.md`, `interaction-model.md` хорошо разделяют смысл, визуал и поведение.

Отличия:
- Polaris сильнее связывает states с token naming.
- Material добавляет state layers и gestures.
- Fluent сильнее раскрывает focus management для accessibility.

Плюсы SEDA:
- Термины не конфликтуют.
- Есть valid state combinations в component template.
- Есть правила focus return, keyboard parity, loading, disabled/read-only.

Минусы SEDA:
- Нет gesture model: drag, swipe, long press, resize.
- Нет pointer/touch distinction кроме touch targets.
- Не хватает state precedence: например, disabled > loading > error > focus > hover.

Что улучшить:
1. Добавить state precedence matrix.
2. Добавить gestures/pointer section.
3. Привязать states к token grammar: `.../hover`, `.../pressed`, `.../selected`, `.../disabled`.
4. Добавить examples для complex components: Select, Table, Date Picker.

### 4.8 Accessibility

SEDA сейчас:
- `accessibility.md` короткий: native-first, visible focus, keyboard support, roles.
- В component specs accessibility раскрыта лучше.

Отличия:
- Carbon и Fluent фиксируют WCAG AA ratios и дизайн/код чеклисты.
- Fluent отдельно говорит о structure, hierarchy, keyboard, assistive tech, meaningful text.
- Material добавляет доступные описания, подтверждение действий и не завязывает инструкции на конкретный жест.

Плюсы SEDA:
- Правильный native-first подход.
- Icon-only требования есть в Button/Icon Button.
- В specs часто есть aria-атрибуты.

Минусы SEDA:
- Foundation accessibility не задает measurable standard.
- Нет screen reader patterns для composite widgets.
- Нет требований к focus order, landmarks, error summary, live regions.
- Нет checklist для дизайнера перед передачей в разработку.

Что улучшить:
1. Расширить `foundation/accessibility.md` до WCAG 2.2 AA checklist.
2. Добавить contrast requirements: text 4.5:1, large text 3:1, UI components 3:1.
3. Описать focus order, focus trap, live regions, error handling.
4. Добавить accessibility acceptance criteria в `component-spec-template.md`.

### 4.9 Content design и UX writing

SEDA сейчас:
- Есть отдельные советы в компонентах: Button label должен быть глаголом, ошибки должны иметь текст.
- Общего документа нет.

Отличия:
- Atlassian и Fluent явно включают content как foundation.
- Material accessibility рекомендует короткие accessibility labels и не описывать конкретный жест.

Плюсы SEDA:
- В component specs уже есть практичные правила для labels.

Минусы SEDA:
- Нет tone of voice.
- Нет правил для empty states, errors, confirmations, tooltips, destructive actions.
- Нет словаря терминов продукта.

Что улучшить:
1. Добавить `foundation/content.md`.
2. Описать label grammar: глаголы, существительные, длина, casing.
3. Добавить message patterns: error, warning, success, empty, loading.
4. Добавить glossary для терминов SEDA AI.

### 4.10 Iconography и visual assets

SEDA сейчас:
- Иконки упоминаются в component specs, но foundation отсутствует.

Отличия:
- Atlassian и Spectrum рассматривают iconography как отдельную foundation-область.
- Spectrum имеет token categories для icons.

Плюсы SEDA:
- Specs уже различают icon-left/right, icon-only, prefix/suffix icons.

Минусы SEDA:
- Нет icon sizes, stroke width, style, optical alignment.
- Нет правил для status icons, destructive icons, empty state illustration.

Что улучшить:
1. Добавить `foundation/iconography.md`.
2. Описать sizes: 12, 14, 16, 20, 24, 32.
3. Указать stroke, corner style, fill/stroke preference.
4. Добавить accessibility: decorative vs meaningful icons.

### 4.11 Component documentation

SEDA сейчас:
- `component-spec-template.md` очень полезный.
- Specs покрывают много компонентов: actions, inputs, navigation, data display, feedback, overlays-layout.

Отличия:
- Carbon component docs разделяют Usage, Style, Code, Accessibility.
- Spectrum публикует component schemas и registry.

Плюсы SEDA:
- В компонентных docs часто есть behavior и tokens, а не только визуал.
- Хорошо описаны “Don't use” и alternatives.

Минусы SEDA:
- Неполная консистентность глубины: некоторые specs полные, некоторые короткие.
- Figma links почти везде placeholder.
- `Color Picker` есть в overview, но нет spec-файла.
- Нет статуса зрелости компонента: draft, ready, deprecated.

Что улучшить:
1. Добавить frontmatter: status, owner, figmaNode, codePackage, lastReviewed.
2. Добавить maturity matrix по компонентам.
3. Автоматически проверять наличие обязательных секций.
4. Создать `specs/inputs/color-picker.md` или убрать Color Picker из `components.md` до готовности.

### 4.12 Governance, versioning, tools

SEDA сейчас:
- Есть version 1.0 в specs, но нет governance-модели.
- Нет git repo в текущей папке, поэтому история изменений не видна.

Отличия:
- Spectrum и Polaris имеют package-level distribution и machine-readable tokens.
- Carbon/Fluent дают developer entry points и theming packages.

Плюсы SEDA:
- Локальная документация уже структурирована и готова к автоматизации.

Минусы SEDA:
- Нет changelog, ownership, contribution model.
- Нет проверки расхождений docs ↔ tokens ↔ Figma.
- Нет release policy для breaking changes.

Что улучшить:
1. Добавить `CONTRIBUTING.md` или `foundation/governance.md`.
2. Добавить `CHANGELOG.md` для foundation и specs.
3. Ввести token build pipeline: `tokens.json` → CSS variables → docs tables.
4. Добавить docs linter: Figma link placeholder, missing sections, invalid token refs.

## 5. Приоритетный roadmap улучшений SEDA

### Быстрые улучшения, 1-2 дня

1. Расширить `foundation/accessibility.md` до measurable checklist.
2. Расширить `foundation/spacing-layout.md`: spacing rules, density, grid, responsive.
3. Добавить `foundation/typography.md` с type roles.
4. Добавить `foundation/motion.md` с duration/easing/reduced-motion.
5. Исправить покрытие: `Color Picker` spec или удалить из overview.
6. Заменить placeholder Figma-ссылки хотя бы на статус `TBD`.

### Средний слой, 1-2 недели

1. Добавить `foundation/tokens.md` и token grammar.
2. Добавить `foundation/color.md` с contrast matrix и layering.
3. Добавить `foundation/elevation.md` и `foundation/radius-border.md`.
4. Добавить `foundation/content.md`.
5. Ввести maturity matrix для компонентов.

### Системный слой, 2-4 недели

1. Настроить token pipeline и автоматическую генерацию таблиц.
2. Добавить docs linter для обязательных секций и token references.
3. Добавить governance: owners, release policy, deprecation.
4. Подготовить platform adapters: Web CSS, Figma variables, iOS/Android naming.
5. Добавить accessibility review workflow.

## 6. Рекомендуемая структура foundation после улучшений

```text
foundation/
  introducing.md
  tokens.md
  color.md
  typography.md
  spacing-layout.md
  density.md
  sizes.md
  radius-border.md
  elevation.md
  motion.md
  iconography.md
  accessibility.md
  content.md
  state-vocabulary.md
  states.md
  interaction-model.md
  validation-model.md
  component-anatomy.md
  components.md
  governance.md
```

## 7. Самые ценные категории для следующей итерации

1. Accessibility: высокий риск и максимальная польза для всех specs.
2. Tokens + Color: основа theming, dark mode, component consistency.
3. Typography: сейчас самый заметный foundation-пробел.
4. Spacing/Layout/Density: критично для B2B и AI-интерфейсов с высокой плотностью данных.
5. Motion/Elevation: поможет унифицировать overlay, drawer, toast, modal, skeleton.
6. Governance/Tooling: превратит документацию из набора markdown-файлов в управляемую систему.

## 8. Итоговая оценка зрелости

| Категория | Оценка SEDA | Комментарий |
|---|---:|---|
| Component specs | 4/5 | Хороший шаблон и много покрытых компонентов, но есть разная глубина и Figma placeholders |
| State model | 4.5/5 | Сильная терминология и interaction model |
| Tokens/theming | 3.5/5 | Хороший semantic layer, но нет lifecycle и full token architecture |
| Color | 3/5 | Есть таблицы, но нет отдельной color foundation и contrast matrix |
| Typography | 1.5/5 | Есть component sizes, но нет type system |
| Spacing/layout | 2/5 | Есть scale и specs, но мало foundation-guidance |
| Accessibility | 2.5/5 | В specs лучше, чем в foundation; нужен checklist и WCAG criteria |
| Motion | 1.5/5 | Есть локальные правила, нет общей модели |
| Governance/tooling | 1/5 | Почти не описано |

Главная рекомендация: сначала усилить foundation, не переписывая component specs. SEDA уже накопила хорошую компонентную практику; теперь ее нужно поднять на уровень общих правил, токенов и проверок.
