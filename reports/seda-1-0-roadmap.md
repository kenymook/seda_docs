# Roadmap SEDA AI до версии 1.0

Дата: 2026-05-10  
Область: `foundation/`, `specs/`, `tokens.json`, `tools/`, `reports/`

## 1. Текущее состояние

SEDA AI уже прошла основной foundation-этап. Документация покрывает tokens, color, typography, spacing/layout, radius/border, elevation, motion, content, iconography, accessibility, governance и token pipeline. Component specs покрывают 51 компонент и совпадают с overview в `foundation/components.md`.

Автоматические проверки:

```text
powershell -ExecutionPolicy Bypass -File tools\check-token-refs.ps1
Known tokens: 1112
Component-specific refs: 460
Unknown refs: 0
```

```text
powershell -ExecutionPolicy Bypass -File tools\check-docs.ps1
Docs check found 0 error(s), 50 warning(s)
```

Все 50 оставшихся warnings относятся к отсутствующим реальным Figma URL. Структура specs, обязательные metadata, coverage overview/specs и token references уже приведены в порядок.

## 2. Definition of Done для версии 1.0

SEDA AI можно считать версией 1.0, когда:

1. `tools/check-token-refs.ps1` показывает `Unknown refs: 0`.
2. `tools/check-docs.ps1` проходит без blocking errors.
3. Все 51 component specs имеют реальную Figma-ссылку или осознанный статус `draft`.
4. Все компоненты в 1.0 имеют статус `ready` или `needs-review` с понятным owner.
5. Foundation-документы P0/P1 не содержат коротких заглушек.
6. Есть changelog, governance, release criteria и migration/deprecation policy.
7. Есть понятный список того, что не входит в 1.0 и остается post-1.0 backlog.

## 3. P0. Выпускные блокеры

### 3.1 Figma URL coverage

Статус: warning, не blocking.  
Причина: 50 specs не имеют реальных Figma node URLs.

Что сделать:

1. Пройти 50 specs из результата `tools/check-docs.ps1`.
2. Для каждого компонента добавить реальный URL на Figma frame/component.
3. Если компонента в Figma еще нет, оставить `Figma · TBD`, но статус spec должен быть `draft`, а не `ready`.
4. Повторить `tools/check-docs.ps1`.

Критерий готовности:

```text
Missing real Figma URL: 0
```

### 3.2 Owner и maturity cleanup

Статус: частично выполнено.  
Сейчас owner в specs временно указан как `TBD`.

Что сделать:

1. Назначить владельца для foundation-разделов.
2. Назначить владельца для component specs по категориям.
3. Обновить `reports/component-maturity-matrix.md`: убрать устаревшие next steps вроде “добавить metadata”, потому что metadata уже добавлена.
4. Разделить статусы:
   - `ready` для компонентов с Figma URL, проверенными tokens и accessibility;
   - `needs-review` для почти готовых;
   - `draft` для Color Picker и компонентов без Figma или неполной реализации.

Критерий готовности:

```text
Owner · TBD осталось только у draft-компонентов или временно допустимых областей.
```

### 3.3 Foundation stubs cleanup

Статус: не выполнено полностью.  
Короткие документы: `foundation/component-anatomy.md`, `foundation/validation-model.md`. `foundation/introducing.md` требует редакторской нормализации и связи с новой структурой.

Что сделать:

1. Расширить `component-anatomy.md`: выполнено.
   - anatomy slots;
   - naming rules;
   - required/optional slots;
   - composition examples;
   - relation to component spec template.
2. Расширить `validation-model.md`: выполнено.
   - validation timing;
   - inline errors;
   - error summary;
   - async validation;
   - blocking vs non-blocking states;
   - accessibility and live regions.
3. Обновить `introducing.md`: выполнено.
   - написать как входную страницу версии 1.0;
   - добавить карту foundation;
   - добавить “как пользоваться документацией”;
   - убрать устаревшие формулировки, если они конфликтуют с governance/token pipeline.

Критерий готовности:

```text
У foundation нет файлов-заглушек короче уровня P0/P1.
```

## 4. P1. Компонентный ревью-проход

Цель: не переписывать все 51 specs, а пройти самые рискованные категории.

### 4.1 Composite widgets

Приоритет: высокий.

Компоненты:

- `specs/inputs/select.md`
- `specs/overlays-layout/dropdown-menu.md`
- `specs/overlays-layout/search.md`
- `specs/feedback/popover.md`
- `specs/navigation/tabs.md`

Проверить:

- keyboard model;
- focus return;
- roving tabindex или active descendant;
- ARIA pattern;
- empty/loading/no-results states;
- content rules;
- overlay/elevation/motion consistency.

### 4.2 Forms and validation

Компоненты:

- `specs/inputs/text-field.md`
- `specs/inputs/text-area.md`
- `specs/inputs/checkbox.md`
- `specs/inputs/radio.md`
- `specs/inputs/file-upload.md`
- `specs/overlays-layout/form.md`

Проверить:

- связь с `foundation/validation-model.md`;
- helper/error text;
- required/optional;
- error summary;
- disabled vs read-only;
- live regions for async validation.

### 4.3 Data-heavy components

Компоненты:

- `specs/data-display/table.md`
- `specs/data-display/card.md`
- `specs/data-display/stat-metric.md`
- `specs/data-display/timeline.md`
- `specs/data-display/chat-bubble.md`

Проверить:

- density;
- sorting/selection;
- numeric typography;
- status semantics;
- responsive behavior;
- accessibility for structured data.

### 4.4 Feedback and overlays

Компоненты:

- `specs/feedback/modal.md`
- `specs/feedback/alert.md`
- `specs/feedback/toast.md`
- `specs/navigation/drawer.md`
- `specs/feedback/tooltip.md`

Проверить:

- focus trap;
- live regions;
- escape/click-outside behavior;
- motion/reduced motion;
- destructive confirmation content;
- layering/elevation.

Критерий готовности P1:

```text
Все high-risk specs имеют проверенные accessibility, behavior, content, motion и token sections.
```

## 5. P2. Tooling до release quality

### 5.1 Severity modes для checker

Статус: выполнено.

`check-docs.ps1` различает blocking errors и warnings:

- `error`: missing required sections, unknown token refs, component coverage mismatch;
- `warning`: Figma TBD на draft/needs-review компонентах;
- `error`: Figma TBD на ready-компонентах.

Реализовано:

1. Добавлен parsing статуса spec.
2. Если `Status · draft` или `needs-review`, Figma TBD = warning.
3. Если `Status · ready`, Figma TBD = error.
4. Добавлен summary по errors/warnings.

### 5.2 Token export MVP

Статус: перенесено в post-1.0 developer/system operations backlog.

Сейчас token pipeline описан, но export artifacts не являются блокером дизайнерской версии 1.0.

Что сделать позже:

1. Добавить `tools/export-tokens.ps1` или другой build script.
2. Сгенерировать:
   - `dist/tokens.css`;
   - `dist/tokens.light.css`;
   - `dist/tokens.dark.css`;
   - `dist/tokens.normalized.json`.
3. Добавить README к `dist/`.
4. Проверить, что `duration/*` и `easing/*` попадают в export.

### 5.3 Docs index

Нужен единый entry point.

Что сделать:

1. Создать или обновить `README.md`.
2. Добавить карту:
   - Foundation;
   - Components;
   - Tokens;
   - Reports;
   - Tools.
3. Добавить команды:
   - `tools/check-docs.ps1`;
   - `tools/check-token-refs.ps1`;
   - будущий token export.

## 6. P3. Release package

### 6.1 Changelog 1.0

Что сделать:

1. В `CHANGELOG.md` добавить раздел `1.0.0`.
2. Разнести изменения:
   - Added;
   - Changed;
   - Fixed;
   - Known limitations.
3. Явно указать, что post-1.0 остается в backlog.

### 6.2 Release notes

Создать `reports/seda-1-0-release-notes.md`.

Структура:

1. Что входит в 1.0.
2. Что проверено.
3. Что не входит.
4. Как обновляться.
5. Какие проверки запускать перед использованием.

### 6.3 Post-1.0 backlog

Создать `reports/seda-post-1-0-backlog.md`.

Вероятные темы:

- high-contrast theme;
- platform adapters iOS/Android;
- Figma variables sync automation;
- component Code Connect;
- generated docs tables from `tokens.json`;
- visual regression examples;
- examples/playground.

## 7. Новый порядок работ

### Sprint 1. Закрыть выпускные блокеры

1. Обновить `component-anatomy.md`.
2. Обновить `validation-model.md`.
3. Обновить `introducing.md`.
4. Обновить maturity matrix под актуальный статус.
5. Настроить severity modes в `check-docs.ps1`: выполнено.

### Sprint 2. Component review

1. Composite widgets.
2. Forms/validation.
3. Feedback/overlays.
4. Data-heavy components.

### Sprint 3. Figma and release readiness

1. Проставить реальные Figma URLs.
2. Назначить owners.
3. Перевести готовые specs в `ready`.
4. Прогнать checks.

### Sprint 4. Release package

1. Дизайнерский index.
2. Handoff checklist.
3. Changelog 1.0.
4. Release notes.
5. Post-1.0 backlog.

## 8. Самый короткий путь к 1.0

Если нужно выпустить 1.0 максимально прагматично:

1. Расширить три слабых foundation-файла: `introducing.md`, `component-anatomy.md`, `validation-model.md`.
2. Добавить severity в `check-docs.ps1`, чтобы draft/needs-review компоненты не блокировали release только из-за Figma TBD: выполнено.
3. Проставить Figma URLs хотя бы для компонентов P0/P1.
4. Обновить maturity matrix: определить, что входит в 1.0 как `ready`.
5. Создать release notes и changelog `1.0.0`.

Это даст честную версию 1.0: foundation стабильный, tooling работает, риски зафиксированы, а незавершенные области не маскируются под готовые.
