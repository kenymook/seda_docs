# Сравнение качества документации SEDA AI с mature design systems

Дата: 2026-05-10  
Фокус: качество документации для дизайнеров, foundation completeness, component specs, Figma readiness.

## 1. Честный краткий вывод

SEDA AI заметно выросла по сравнению с первым аудитом. Сейчас это уже не “набор компонентных specs с неполным foundation”, а почти полноценная foundation-документация: есть tokens, color, typography, spacing/layout, accessibility, content, motion, iconography, elevation, radius/border, validation, anatomy, governance и roadmap.

Но до уровня зрелых дизайн-систем SEDA пока не дотягивает в трех местах:

1. **Figma readiness** — 50 component specs не имеют реальных Figma URL. Для дизайнерской системы это главный практический разрыв.
2. **Examples and visual guidance** — правила есть, но мало дизайнерских примеров “как применить” на формах, таблицах, dashboards, overlays, empty/error/loading states.
3. **Maturity and review evidence** — есть статусы и checks, но пока нет подтвержденного design/content/accessibility review по компонентам.

Если говорить строго: **foundation-документация SEDA близка к уровню 1.0**, но **дизайнерская применимость компонентов еще не 1.0**, пока Figma-ссылки, maturity matrix и примеры не закрыты.

## 2. Текущее состояние SEDA AI

Факты из локальной проверки:

| Область | Факт |
|---|---|
| Foundation files | 19 markdown-файлов в `foundation/` после объединения `states.md` и `sizes.md` |
| Component specs | 51 spec-файл |
| Docs check | `0 error(s), 50 warning(s)` |
| Token audit | `Known tokens: 1112`, `Component-specific refs: 460`, `Unknown refs: 0` |
| Coverage overview/specs | Ошибок нет |
| Главный warning | 50 specs без реальной Figma URL |

Что это значит:

- структура документации уже стабильная;
- token references не расходятся с source;
- component overview совпадает со specs;
- оставшийся системный долг связан не с markdown-структурой, а с дизайнерской готовностью библиотеки.

## 3. Системы для сравнения

| Система | Что подтверждено в официальной документации | Чем сильна |
|---|---|---|
| Atlassian Design System | Foundations включают tokens, accessibility, content, spacing, grid, color, typography, iconography, illustration, logos, elevation, border, radius. | Полная карта foundation и понятная навигация. |
| Atlassian Tokens | Tokens описаны как single source of truth; есть объяснение themes, token naming, use in design/code. | Очень сильная token education для дизайнеров и разработчиков. |
| Fluent 2 | Accessibility ориентируется на WCAG 2.1 AA; layout объясняет space, proximity, hierarchy и decision comfort. | Сильные human-centered guidelines, accessibility и layout reasoning. |
| Shopify Polaris | Color token docs объясняют semantic token structure: element, role, prominence, state; typography tokens разделяют primitive и semantic layers. | Очень понятная token grammar для дизайнеров. |
| Adobe Spectrum | Spectrum Design Data публикует token categories: color aliases, component color, palette, icons, layout, typography. Typography tables имеют resolved values, deprecated и replaced metadata. | Machine-readable design data и lifecycle metadata. |

Источники:

- Atlassian Foundations: https://atlassian.design/foundations/
- Atlassian Tokens: https://atlassian.design/foundations/tokens/design-tokens
- Fluent Accessibility: https://fluent2.microsoft.design/accessibility
- Fluent Layout: https://fluent2.microsoft.design/layout
- Polaris Color Tokens: https://polaris-react.shopify.com/design/colors/color-tokens
- Polaris Typography Tokens: https://polaris-react.shopify.com/design/typography/typography-tokens
- Spectrum Design Data Tokens: https://opensource.adobe.com/spectrum-design-data/tokens/
- Spectrum Typography Tokens: https://opensource.adobe.com/spectrum-design-data/tokens/typography/

## 4. Сравнение по категориям

### 4.1 Foundation coverage

**SEDA сейчас**

Сильные разделы:

- `accessibility.md`
- `color.md`
- `typography.md`
- `spacing-sizing.md`
- `content.md`
- `motion.md`
- `iconography.md`
- `elevation.md`
- `radius-border.md`
- `tokens.md`
- `validation-model.md`
- `component-anatomy.md`
- `governance.md`

**Сравнение**

SEDA уже ближе к Atlassian по карте foundation, чем была раньше. У Atlassian сильнее публичный overview и навигация: foundations явно собраны в “Tokens / Guidelines / Styles”. У SEDA структура есть в файлах, но дизайнеру пока нужен отдельный entry point, чтобы быстро понять порядок чтения.

**Плюсы SEDA**

- Foundation покрывает почти все важные зоны.
- Есть отдельные документы под validation и anatomy, чего часто нет в коротких дизайн-системах.
- Есть governance и token pipeline.

**Минусы SEDA**

- Нет дизайнерского index.
- Мало cross-links “если вы делаете форму, читайте X/Y/Z”.
- Некоторые документы сильны как правила, но слабее как обучающие материалы.

**Что улучшить**

1. Создать `reports/seda-designer-index.md` или перенести его в `foundation/designer-index.md`.
2. Добавить “Related foundation” в конец каждого foundation-документа.
3. Добавить “Common design tasks”: форма, таблица, dashboard, overlay, empty/error/loading.

### 4.2 Tokens and theming

**SEDA сейчас**

- Есть `tokens.json`.
- Есть `tokens.md`, `theming.md`, `token-pipeline.md`.
- Token audit показывает `Unknown refs: 0`.
- Добавлены semantic motion tokens.

**Сравнение**

Atlassian и Polaris сильнее объясняют designer-facing token usage. Polaris явно раскладывает semantic color token structure на element, role, prominence, state. Atlassian объясняет, как читать имена токенов и почему нужно выбирать token по смыслу, а не по похожему цвету. Spectrum сильнее как machine-readable registry: resolved values, deprecated, replaced.

**Плюсы SEDA**

- Slash naming читаемый.
- Semantic layer уже работает.
- Проверка unknown token refs — сильный плюс.
- Есть light/dark model.

**Минусы SEDA**

- Для дизайнера пока мало примеров выбора токена.
- Нет token picker / token catalog в удобном виде.
- Нет generated tables из `tokens.json`.
- Нет Figma variables sync evidence.

**Что улучшить**

1. Добавить designer token guide: “какой token выбрать”.
2. Добавить таблицы “Do / Don't” для color/text/border/surface tokens.
3. Для Figma добавить правила naming variables и mode mapping.
4. Post-1.0: generated token tables.

### 4.3 Color

**SEDA сейчас**

Есть сильный `color.md`: semantic usage, contrast, layering, status, text-on-color.

**Сравнение**

SEDA по охвату уже близка к зрелым системам, но уступает Carbon/Atlassian/Polaris в количестве наглядных examples. Polaris особенно силен тем, что показывает token structure и interaction states прямо в color token docs.

**Плюсы SEDA**

- Есть status colors.
- Есть text-on-color логика.
- Есть contrast requirements.
- Есть layer/elevation связь.

**Минусы SEDA**

- Мало визуальных сценариев.
- Нет готовой contrast matrix по основным парам.
- Нет designer-facing примеров для charts/data/status-heavy UI.

**Что улучшить**

1. Добавить examples: form error, destructive button, selected row, tag status, chart status.
2. Добавить contrast matrix для ключевых foreground/background пар.
3. Добавить “не использовать цвет как единственный смысл” с компонентными примерами.

### 4.4 Typography

**SEDA сейчас**

Есть полноценный `typography.md`: roles, scale, line-height, truncation, numeric alignment.

**Сравнение**

Polaris и Spectrum сильнее как tokenized typography systems: primitive font scales, semantic text tokens, resolved values, mobile/desktop differences. SEDA хорошо описывает roles, но еще не показывает дизайнерские текстовые стили как Figma-ready catalog.

**Плюсы SEDA**

- Есть role-based typography.
- Есть numeric alignment и truncation.
- Хорошо подходит для B2B/data UI.

**Минусы SEDA**

- Нет таблицы “Figma text style name → role → usage”.
- Нет примеров page hierarchy.
- Не показаны mobile/desktop adjustments как у Spectrum.

**Что улучшить**

1. Добавить Figma text style naming.
2. Добавить примеры: settings page, dashboard card, table, metric block.
3. Добавить mobile typography note.

### 4.5 Spacing, layout, density

**SEDA сейчас**

`spacing-sizing.md` уже сильный: scale, density, grid, responsive patterns.

**Сравнение**

Fluent сильнее объясняет смысл пространства: proximity, hierarchy, grouping и decision comfort. SEDA описывает правила, но может сильнее показать “почему так” и “что выбрать дизайнеру”.

**Плюсы SEDA**

- Есть density.
- Есть dashboard/form/table patterns.
- Есть responsive guidance.

**Минусы SEDA**

- Мало annotated examples.
- Нет готовых layout recipes.
- Нет Figma layout grids documentation.

**Что улучшить**

1. Добавить layout recipes: form, master-detail, data table, dashboard, settings.
2. Добавить Figma grid styles.
3. Добавить density decision tree.

### 4.6 Accessibility

**SEDA сейчас**

Accessibility foundation сильно улучшен. Component specs имеют обязательные sections. Docs check ловит missing accessibility sections.

**Сравнение**

Fluent явно позиционирует accessibility как инклюзивную практику и опирается на WCAG 2.1 AA. SEDA ближе к checklist/implementation style. Это хорошо для specs, но дизайнеру может не хватать human framing и примеров.

**Плюсы SEDA**

- Есть measurable checklist.
- Есть focus, keyboard, contrast, live regions.
- Есть связь с component specs.

**Минусы SEDA**

- Мало дизайнерских примеров плохого/хорошего accessibility.
- Нет отдельного “accessibility in Figma review”.
- Не хватает сценариев composite widgets: Select, Menu, Search, Tabs.

**Что улучшить**

1. Добавить designer accessibility review checklist.
2. Добавить examples для focus order, error summary, live regions.
3. Пройти P1 composite widgets.

### 4.7 Content design

**SEDA сейчас**

Есть `content.md`, правила labels/errors/empty/loading/destructive actions.

**Сравнение**

Atlassian явно включает content в foundations. SEDA теперь тоже включает content, но уступает в количестве примеров и tone-of-voice guidance.

**Плюсы SEDA**

- Есть practical rules.
- Есть связь с Button, Empty State, validation.
- Есть message patterns.

**Минусы SEDA**

- Нет словаря терминов продукта.
- Нет набора approved/rejected examples.
- Нет voice/tone шкалы.

**Что улучшить**

1. Добавить glossary.
2. Добавить examples для AI-specific интерфейсов: prompt, generation, confidence, error recovery.
3. Добавить destructive confirmation examples.

### 4.8 Iconography

**SEDA сейчас**

Есть sizes, roles, decorative vs meaningful, status icons, icon-only rules.

**Сравнение**

Atlassian и Spectrum имеют более зрелую экосистему иконок и tokenized icon colors. SEDA имеет foundation rules, но не имеет библиотеки/каталога иконок как артефакта.

**Плюсы SEDA**

- Правила уже достаточно сильные.
- Есть accessibility distinction.
- Есть связь с Icon Button/Text Field/Button.

**Минусы SEDA**

- Нет icon catalog.
- Нет Figma icon component rules.
- Нет status icon examples.

**Что улучшить**

1. Добавить icon catalog или ссылку на выбранную библиотеку.
2. Описать Figma component naming для icons.
3. Добавить status/action/navigation examples.

### 4.9 Component specs

**SEDA сейчас**

51 specs, metadata добавлена, required sections есть, token refs чистые.

**Сравнение**

SEDA сильна по глубине specs, но слабее mature systems по публичной “experience layer”: live examples, Figma links, usage demos, code/design tabs, variant previews.

**Плюсы SEDA**

- Хорошая структура.
- Есть anatomy, states, accessibility, behavior, tokens.
- Есть component-spec-template.
- Coverage overview/specs чистый.

**Минусы SEDA**

- 50 specs без реального Figma URL.
- Почти все `Owner · TBD`.
- Maturity matrix устарела частично после последних правок.
- Нет designer review pass по категориям.

**Что улучшить**

1. Figma URL coverage.
2. Обновить maturity matrix.
3. Пройти первую волну компонентов.
4. Добавить component examples в specs: default, error, loading, disabled, empty.

### 4.10 Governance and quality

**SEDA сейчас**

Есть governance, changelog, docs checker, token refs checker, roadmap.

**Сравнение**

Для локальной системы это сильный уровень. Mature systems сильнее за счет публичных packages, token registries, migration guides, automated docs and Figma tooling.

**Плюсы SEDA**

- Есть checks.
- Есть severity modes.
- Есть token audit.
- Есть roadmap до 1.0.

**Минусы SEDA**

- Governance пока описан, но не доказан реальными release cycles.
- Owners не назначены.
- Нет release notes 1.0.
- Нет designer handoff checklist.

**Что улучшить**

1. Назначить owners.
2. Создать designer index и handoff checklist.
3. Подготовить release notes 1.0.

## 5. Оценка качества SEDA после повторного сравнения

| Категория | Было в первом аудите | Сейчас | Честная оценка |
|---|---:|---:|---|
| Foundation coverage | 2.5/5 | 4/5 | Почти полный foundation, но нужны designer examples. |
| Tokens/theming | 3.5/5 | 4/5 | Token refs чистые, но нет дизайнерского token catalog. |
| Color | 3/5 | 4/5 | Хорошая модель, нужны examples/contrast matrix. |
| Typography | 1.5/5 | 3.8/5 | Сильный скачок, нужны Figma text styles examples. |
| Spacing/layout | 2/5 | 3.8/5 | Хорошая база, нужны layout recipes. |
| Accessibility | 2.5/5 | 4/5 | Хороший checklist, нужны designer examples и composite review. |
| Motion | 1.5/5 | 4/5 | Foundation и tokens есть, нужны visual examples. |
| Iconography | 1/5 | 3.5/5 | Правила есть, нет icon catalog/Figma library. |
| Content | 1/5 | 3.8/5 | База есть, нужен glossary и больше examples. |
| Component specs | 4/5 | 4/5 | Структура сильная, Figma readiness слабая. |
| Governance/tooling | 1/5 | 3.8/5 | Для локальной docs-системы хорошо, но owners/release не закрыты. |
| Designer readiness | 2/5 | 3.2/5 | Главный разрыв: Figma links, examples, review status. |

## 6. Что реально осталось до дизайнерской 1.0

### P0

1. Добавить designer index.
2. Добавить design handoff checklist.
3. Обновить maturity matrix под дизайнерские статусы.
4. Закрыть Figma URL для P0/P1 компонентов или честно понизить их до `draft`.

### P1

1. Добавить usage examples в `color.md`, `typography.md`, `spacing-sizing.md`, `content.md`.
2. Пройти первую волну компонентов: Button, Icon Button, Text Field, Text Area, Select, Checkbox, Radio, Modal, Alert, Toast.
3. Для каждого компонента указать design review / content review / accessibility review.

### P2

1. Добавить glossary.
2. Добавить icon catalog или ссылку на иконки.
3. Добавить layout recipes.
4. Подготовить release notes 1.0.

## 7. Самая честная формулировка статуса

SEDA AI сейчас выглядит как **сильная foundation-документация в состоянии pre-1.0**.

Она уже сравнима со зрелыми системами по широте foundation-разделов и даже сильнее многих локальных дизайн-систем по обязательным checks. Но она пока не сравнима с Atlassian/Polaris/Fluent/Spectrum по дизайнерской применимости, потому что у зрелых систем есть больше visual examples, token education, Figma/design workflow и зрелые публичные артефакты.

Если следующая цель — дизайнерская 1.0, не стоит добавлять больше технических tooling-документов. Нужно улучшать:

1. вход для дизайнера;
2. Figma-связи;
3. примеры применения;
4. maturity/review evidence;
5. handoff checklist.
