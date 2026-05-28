# Введение в SEDA AI

SEDA AI — foundation-дизайн-система для построения сложных продуктовых интерфейсов и собственных дизайн-систем поверх общей базы. Она задает не только набор компонентов, но и правила принятия решений: как использовать токены, как строить состояния, как проектировать доступность, как описывать поведение и как выпускать изменения без рассинхронизации дизайна, кода и документации.

Главная идея SEDA AI — composability. Команда не получает жесткий UI kit, который можно только копировать; она получает управляемый фундамент, из которого можно собирать интерфейсы, адаптировать компоненты под продукт и при этом сохранять системность.

---

## 1. Для кого эта система

SEDA AI подходит командам, которые:

- строят B2B, AI, data-heavy или operational интерфейсы;
- развивают несколько продуктов на общей визуальной и поведенческой базе;
- хотят управлять темизацией, плотностью, состояниями и доступностью централизованно;
- используют Figma, code components и markdown-документацию как связанные источники;
- хотят не просто библиотеку компонентов, а правила для масштабирования дизайн-решений.

SEDA AI особенно полезна там, где интерфейс должен выдерживать большое количество данных, сложные формы, таблицы, overlays, async-состояния и разные уровни пользовательских прав.

---

## 2. Принципы

| Принцип | Что означает |
|---|---|
| Foundation first | Общие правила живут в foundation, а components только применяют их. |
| Semantic over raw value | Компоненты используют semantic/component tokens, а не прямые hex/px значения. |
| Accessibility by default | Keyboard, focus, contrast, labels и ARIA рассматриваются как часть дизайна, а не финальная проверка. |
| Predictable states | Состояния имеют общий словарь и не смешивают `active`, `selected`, `checked`, `open`, `pressed`. |
| Content is interface | Labels, errors, empty states и confirmations проектируются как часть компонента. |
| Motion has purpose | Анимация объясняет изменение состояния, но не мешает скорости и доступности. |
| Governance over drift | Изменения имеют статус, владельца, changelog, lifecycle и deprecation path. |

---

## 3. Как устроена документация

```text
foundation/
  introducing.md
  tokens.md
  token-pipeline.md
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
  state-vocabulary.md
  interaction-model.md
  validation-model.md
  component-anatomy.md
  components.md
  governance.md

specs/
  component-spec-template.md
  actions/
  inputs/
  navigation/
  data-display/
  feedback/
  overlays-layout/

tools/
  check-docs.ps1
  check-token-refs.ps1

reports/
  seda-1-0-roadmap.md
  component-maturity-matrix.md
  token-reference-audit.md
```

Foundation отвечает на вопрос “какие правила у системы?”. Specs отвечают на вопрос “как конкретный компонент применяет эти правила?”. Tools проверяют, что документация не расходится сама с собой.

---

## 4. С чего начинать

### Если вы дизайнер

1. Начните с `color.md`, `typography.md`, `spacing-sizing.md`.
2. Для компонента откройте его spec в `specs/`.
3. Проверьте states, accessibility, content и token mapping.
4. Если меняете компонент в Figma, обновите Figma URL и maturity status.

### Если вы разработчик

1. Начните с `tokens.md`, `token-pipeline.md`, `accessibility.md`.
2. Для компонента смотрите behavior, keyboard, ARIA и design tokens.
3. Перед изменениями запускайте:

```powershell
powershell -ExecutionPolicy Bypass -File tools\check-docs.ps1
powershell -ExecutionPolicy Bypass -File tools\check-token-refs.ps1
```

### Если вы владелец системы

1. Используйте `governance.md` для статусов, релизов и breaking changes.
2. Ведите `CHANGELOG.md`.
3. Обновляйте `component-maturity-matrix.md`.
4. Не переводите компонент в `ready`, пока не закрыты Figma, accessibility, tokens и owner.

---

## 5. Уровни системы

| Уровень | Назначение | Где описан |
|---|---|---|
| Tokens | Значения и роли: цвет, spacing, type, motion, elevation. | `tokens.md`, `token-pipeline.md`, `theming.md` |
| Foundations | Общие правила визуала, поведения, доступности и контента. | foundation/*.md |
| Components | Конкретные UI building blocks. | specs/**/*.md |
| Governance | Статусы, владельцы, релизы, deprecation и проверки. | `governance.md`, `CHANGELOG.md`, `tools/` |

---

## 6. Что считается частью 1.0

В 1.0 входят:

- foundation-документы P0/P1;
- 51 component specs;
- semantic token architecture;
- light/dark theming model;
- accessibility, content, motion и iconography rules;
- governance и changelog;
- docs quality checks;
- token reference audit.

В 1.0 не обязательно входят:

- автоматическая синхронизация Figma variables;
- production package components;
- iOS/Android adapters;
- Code Connect mappings;
- полноценный visual regression suite.

Эти направления остаются post-1.0 backlog, если не нужны для первого релиза.

---

## 7. Definition of Done для изменений

Любое изменение в SEDA AI должно отвечать на вопросы:

1. Какой foundation rule оно меняет или использует?
2. Какие component specs затронуты?
3. Есть ли impact на accessibility, content, motion, tokens или layout?
4. Это patch, minor или major change?
5. Нужен ли migration path?
6. Проходят ли `check-docs.ps1` и `check-token-refs.ps1`?

Если на эти вопросы нельзя ответить, изменение остается `draft`.

---

## 8. Куда двигаться дальше

Ближайшая цель — версия 1.0:

1. закрыть Figma URL coverage;
2. назначить owners;
3. довести maturity matrix до актуального состояния;
4. пройти high-risk component review;
5. подготовить release notes и changelog `1.0.0`.

Подробный путь описан в `reports/seda-1-0-roadmap.md`.
