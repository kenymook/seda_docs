# Аудит информационной архитектуры foundation

Дата: 2026-05-10  
Фокус: можно ли объединить, пересобрать или переименовать foundation-документы SEDA AI.

> Update: `states.md` удален и объединен в `state-vocabulary.md`; `sizes.md` удален и перенесен в `spacing-sizing.md`.

## 1. Краткий вывод

В `foundation/` было 21 markdown-документ. После объединения `states.md` и `sizes.md` осталось 19 файлов. Это все еще много для плоской папки, но уже меньше дублирования.

Главная проблема не в том, что файлов много. Главная проблема в том, что есть несколько пересечений:

1. `tokens.md` / `theming.md` / `color.md` / `token-pipeline.md`
2. `state-vocabulary.md` / `states.md` / `interaction-model.md`
3. `sizes.md` / `typography.md` / `spacing-sizing.md` / `radius-border.md`
4. `validation-model.md` / `accessibility.md` / `content.md`
5. `components.md` / `component-anatomy.md` / `specs/component-spec-template.md`

Для дизайнерской 1.0 я бы не удалял информацию, но пересобрал бы foundation в более понятные группы и объединил 3-4 коротких/дублирующих файла.

## 2. Текущий размер файлов

| Файл | Строк | Оценка |
|---|---:|---|
| `sizes.md` | 41 | Слишком короткий, лучше объединить. |
| `states.md` | 57 | Дублирует `state-vocabulary.md`, лучше объединить. |
| `introducing.md` | 130 | Нормально как entry point. |
| `token-pipeline.md` | 139 | Для дизайнерского фокуса можно перенести в technical appendix/post-1.0. |
| `theming.md` | 139 | Частично пересекается с `tokens.md` и `color.md`. |
| `elevation.md` | 140 | Оставить отдельно или объединить с radius/border как visual structure. |
| `state-vocabulary.md` | 142 | Оставить, но включить `states.md`. |
| `radius-border.md` | 146 | Можно объединить с elevation. |
| `component-anatomy.md` | 150 | Оставить отдельно для component specs. |
| `governance.md` | 156 | Оставить, но не в дизайнерском первом уровне. |
| `interaction-model.md` | 163 | Оставить, но связать со states. |
| `iconography.md` | 163 | Оставить. |
| `motion.md` | 207 | Оставить. |
| `typography.md` | 209 | Оставить. |
| `accessibility.md` | 209 | Оставить. |
| `validation-model.md` | 214 | Оставить, но связать с forms/content/accessibility. |
| `content.md` | 241 | Оставить. |
| `spacing-sizing.md` | 258 | Оставить, но забрать часть из `sizes.md`. |
| `color.md` | 304 | Оставить. |
| `tokens.md` | 308 | Оставить как основной token foundation. |
| `components.md` | 447 | Лучше пересобрать как каталог/overview, а не foundation guideline. |

## 3. Что точно стоит объединить

### 3.1 `states.md` → внутрь `state-vocabulary.md`

**Почему**

`states.md` короткий и по сути пересказывает, что уже есть в `state-vocabulary.md`: interactive states, functional states, validation states, principles. Отдельный файл заставляет дизайнера выбирать между двумя похожими входами.

**Рекомендация**

Объединить в один файл:

```text
foundation/state-vocabulary.md
```

Новая структура:

1. Что такое state.
2. State vocabulary.
3. State groups.
4. State precedence.
5. Visual vs semantic state.
6. Component examples.
7. Checklist.

`states.md` удалить или заменить коротким redirect:

```markdown
# Состояния

Основной документ: `state-vocabulary.md`.
```

**Эффект**

Минус один файл, меньше дублирования, понятнее навигация.

### 3.2 `sizes.md` → в `spacing-sizing.md`, `typography.md`, `radius-border.md`

**Почему**

`sizes.md` короткий и содержит параметры, которые уже относятся к другим foundation:

- height и padding → spacing/layout;
- font/line-height → typography;
- radius → radius-border;
- icon size → iconography.

Самостоятельный “sizes” документ полезен только как reference table, но сейчас он не тянет на отдельный foundation.

**Рекомендация**

Пересобрать:

- component size table перенести в `spacing-sizing.md` или новый раздел `Component sizing`;
- font-size/line-height оставить ссылкой на `typography.md`;
- radius оставить ссылкой на `radius-border.md`;
- icon size оставить ссылкой на `iconography.md`.

`sizes.md` заменить на reference/redirect или удалить из первого уровня.

**Эффект**

Компонентные размеры будут жить рядом с layout/density, где дизайнер реально принимает решение.

### 3.3 `theming.md` частично объединить с `color.md` и `tokens.md`

**Почему**

`theming.md` пересекается с:

- `color.md` по light/dark и surface/text/status roles;
- `tokens.md` по naming/layers;
- `token-pipeline.md` по source of truth.

Для дизайнера “theming” — это не отдельная тема рядом с color/tokens, а сценарий использования color + tokens + modes.

**Рекомендация**

Оставить `theming.md`, но превратить его в короткий сценарный документ:

```text
foundation/theming.md
```

Содержание:

1. Что такое theme в SEDA.
2. Light/Dark modes.
3. Как дизайнер выбирает token в теме.
4. Что нельзя делать.
5. Ссылки на `color.md`, `tokens.md`, `token-pipeline.md`.

Подробные таблицы semantic colors лучше держать в `color.md` / `tokens.md`.

**Эффект**

Theming станет дизайнерским guide, а не дублем token/color tables.

## 4. Что можно объединить, но не обязательно

### 4.1 `elevation.md` + `radius-border.md` → `visual-structure.md`

**Аргумент за объединение**

Оба документа отвечают за visual container structure: края, линии, глубина, overlay, separation. Дизайнер часто принимает эти решения вместе.

**Аргумент против**

Elevation и border/radius достаточно разные: elevation про слой/z-index/shadow, radius-border про форму и границу. В зрелых системах Atlassian это отдельные foundations.

**Рекомендация**

Для текущей SEDA лучше оставить отдельно, но добавить общий index-блок:

```text
Visual structure:
- radius-border.md
- elevation.md
- color.md section Surface/layers
```

Если хочется меньше файлов, объединить можно, но это не P0.

### 4.2 `validation-model.md` + часть `accessibility.md` + часть `content.md`

**Аргумент за объединение**

Validation затрагивает accessibility и content: aria-describedby, error summary, message text.

**Аргумент против**

Validation достаточно большая самостоятельная модель. Если объединить, получится слишком длинный документ, где дизайнеру сложнее найти конкретные правила.

**Рекомендация**

Оставить отдельно, но добавить в начало `validation-model.md` блок:

```text
Читайте вместе:
- accessibility.md: forms/live regions/focus
- content.md: validation messages
- component-anatomy.md: helper/error slots
```

### 4.3 `component-anatomy.md` + `components.md`

**Аргумент за объединение**

Оба про компоненты.

**Аргумент против**

`component-anatomy.md` — методология описания компонента.  
`components.md` — каталог компонентов.  
Их лучше не смешивать.

**Рекомендация**

Оставить отдельно, но перенести `components.md` из “foundation guideline” в “catalog / reference”.

## 5. Что лучше оставить отдельно

| Файл | Почему оставить |
|---|---|
| `accessibility.md` | Слишком важный и широкий foundation. |
| `color.md` | Один из основных дизайнерских документов. |
| `typography.md` | Основная foundation-область. |
| `spacing-sizing.md` | Основная foundation-область. |
| `content.md` | Нужен как отдельная дисциплина. |
| `motion.md` | Содержит tokens, patterns, reduced motion. |
| `iconography.md` | Нужен отдельный дизайнерский guide. |
| `validation-model.md` | Формы и ошибки достаточно важны для отдельного документа. |
| `component-anatomy.md` | Нужен для качества specs. |
| `governance.md` | Не дизайнерский first-level, но нужен для управления системой. |

## 6. Предлагаемая структура foundation для дизайнерской 1.0

### Вариант A. Минимально инвазивный

Оставляем почти все файлы, но пересобираем навигацию:

```text
foundation/
  introducing.md

  tokens.md
  theming.md
  color.md
  typography.md
  spacing-sizing.md
  radius-border.md
  elevation.md
  motion.md
  iconography.md

  accessibility.md
  content.md
  validation-model.md

  state-vocabulary.md
  interaction-model.md
  component-anatomy.md
  components.md

  governance.md
  token-pipeline.md
```

Изменения:

- `states.md` объединить с `state-vocabulary.md`;
- `sizes.md` объединить с `spacing-sizing.md`;
- `token-pipeline.md` убрать из дизайнерского первого уровня, но оставить как technical appendix;
- `components.md` считать catalog, а не foundation-guideline.

Это самый безопасный вариант.

### Вариант B. Более чистая IA

Собрать foundation вокруг 6 разделов:

```text
foundation/
  introducing.md

  principles/
    accessibility.md
    content.md
    governance.md

  visual/
    color.md
    typography.md
    spacing-sizing.md
    radius-border.md
    elevation.md
    iconography.md
    motion.md

  tokens/
    tokens.md
    theming.md
    token-pipeline.md

  behavior/
    state-vocabulary.md
    interaction-model.md
    validation-model.md

  components/
    component-anatomy.md
    components.md
```

Плюсы:

- дизайнеру легче понимать карту;
- меньше “плоской каши” из 21 файла;
- темы логически сгруппированы.

Минусы:

- нужно обновить ссылки во всех docs;
- может быть лишним для локального markdown-проекта.

### Вариант C. Сильно укрупнить файлы

Свести foundation к 10-12 файлам:

```text
introducing.md
tokens-and-theming.md
color.md
typography.md
layout-and-sizing.md
shape-and-elevation.md
motion.md
iconography.md
accessibility.md
content-and-validation.md
states-and-interaction.md
components.md
governance.md
```

Плюсы:

- меньше файлов.

Минусы:

- файлы станут слишком длинными;
- сложнее точечно ссылаться из component specs;
- часть дисциплин потеряет видимость.

Я не рекомендую вариант C для SEDA сейчас.

## 7. Моя рекомендация

Для SEDA AI лучше выбрать **Вариант A сейчас**, а к варианту B прийти позже, если будет полноценный сайт документации.

Конкретно:

1. Объединить `states.md` в `state-vocabulary.md`.
2. Объединить `sizes.md` в `spacing-sizing.md` с cross-links на typography/radius/iconography.
3. Сократить `theming.md`, убрав дубли с `color.md` и `tokens.md`.
4. Добавить в `introducing.md` карту foundation по группам.
5. Добавить `Related foundation` в конец ключевых документов.
6. Не трогать пока `elevation.md` и `radius-border.md`.
7. Не объединять `validation-model.md`, `content.md`, `accessibility.md`; только связать их ссылками.

## 8. Приоритет работ

### P0

1. `states.md` → merge into `state-vocabulary.md`.
2. `sizes.md` → merge into `spacing-sizing.md`.
3. Обновить ссылки в docs/specs, где упоминаются `foundation/sizes.md` или `foundation/states.md`.

### P1

1. Пересобрать `theming.md` как короткий guide.
2. Добавить foundation map в `introducing.md`.
3. Добавить `Related foundation` в:
   - `color.md`;
   - `typography.md`;
   - `spacing-sizing.md`;
   - `accessibility.md`;
   - `content.md`;
   - `validation-model.md`;
   - `component-anatomy.md`.

### P2

1. Перенести `token-pipeline.md` в technical appendix или оставить, но убрать из дизайнерского маршрута.
2. Пересобрать `components.md` как component catalog.
3. Подготовить будущую структуру папок, если документация станет сайтом.

## 9. Честный риск

Если сейчас начать активно переименовывать и переносить файлы, можно сломать много ссылок в specs. Поэтому я бы сначала сделал мягкое объединение:

- оставить redirect-файлы на старых местах;
- обновлять ссылки постепенно;
- не менять URL/пути, пока дизайнерская 1.0 не стабилизирована.

Так мы улучшим ясность, но не устроим большой механический рефакторинг документации.
