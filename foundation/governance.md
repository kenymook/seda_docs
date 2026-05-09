# Governance

Governance описывает, как SEDA AI меняется без потери доверия: кто принимает решения, какие статусы бывают у foundation и components, как фиксировать breaking changes и как не рассинхронизировать docs, tokens, Figma и code.

---

## 1. Цели

- Сделать изменения прозрачными для дизайнеров, разработчиков и продуктовых команд.
- Не допускать скрытых breaking changes в tokens, components и accessibility behavior.
- Держать documentation, Figma и code в одной модели.
- Дать каждому компоненту понятный статус зрелости.
- Упростить ревью: решение должно быть проверяемым, а не зависеть от памяти команды.

---

## 2. Область действия

Governance применяется к:

- foundation-документам;
- design tokens;
- component specs;
- Figma components и variables;
- code components и package exports;
- documentation tooling и quality checks.

Governance не должен блокировать быстрые продуктовые эксперименты. Если решение временное, оно помечается как `draft` или `experimental` и не становится частью стабильной системы без ревью.

---

## 3. Роли

| Роль | Ответственность |
|---|---|
| Design System Owner | Принимает финальное решение по foundation, tokens и component API. |
| Designer | Проверяет anatomy, variants, states, Figma consistency и визуальное качество. |
| Engineer | Проверяет implementability, accessibility behavior, token mapping и code API. |
| Accessibility Reviewer | Проверяет WCAG, keyboard, focus, screen reader behavior и contrast. |
| Content Reviewer | Проверяет labels, errors, empty states, confirmations и терминологию. |
| Product Stakeholder | Подтверждает, что изменение решает реальный продуктовый сценарий. |

Для маленькой команды один человек может совмещать несколько ролей, но checklist все равно остается тем же.

---

## 4. Lifecycle

| Статус | Значение | Когда использовать |
|---|---|---|
| `proposal` | Идея или RFC без готовой спецификации. | Нужно обсудить проблему, варианты и impact. |
| `draft` | Черновик, который можно читать и пилотировать. | Нет полного ревью, Figma/code может быть TBD. |
| `needs-review` | Материал готов к проверке. | Есть структура, tokens, accessibility notes, но нужен review. |
| `ready` | Готово к использованию. | Есть owner, дата ревью, Figma/code refs, acceptance criteria. |
| `deprecated` | Не использовать в новых сценариях. | Есть replacement и migration notes. |
| `removed` | Удалено из системы. | Удаление отражено в changelog и миграции выполнены. |

Статус должен быть указан в каждом component spec и, по возможности, в foundation-документах, которые еще не стабилизированы.

---

## 5. Типы изменений

| Тип | Пример | Версия |
|---|---|---|
| Documentation fix | Исправлена формулировка, добавлен пример без изменения правил. | patch |
| Clarification | Уточнено уже существующее правило. | patch |
| Additive foundation | Добавлен новый foundation-документ или новая секция без breaking impact. | minor |
| Additive component | Добавлен новый variant, state или token с обратной совместимостью. | minor |
| Token rename/remove | Переименован или удален token. | major |
| Component behavior change | Изменен keyboard/focus/API contract. | major |
| Visual breaking change | Изменены размеры, spacing, typography или color roles, влияющие на layout. | major |
| Deprecation | Компонент или token помечен deprecated с replacement. | minor |
| Removal | Deprecated объект удален. | major |

---

## 6. Breaking Changes

Изменение считается breaking, если оно:

- удаляет или переименовывает token;
- меняет semantic meaning token;
- меняет размеры компонента, влияя на layout;
- меняет keyboard behavior, focus order или ARIA contract;
- меняет обязательные slots или component API;
- удаляет variant/state;
- меняет визуальный статус так, что existing UI начинает сообщать другой смысл.

Breaking change требует:

1. описания причины;
2. migration path;
3. списка затронутых компонентов;
4. даты вступления;
5. записи в `CHANGELOG.md`;
6. проверки accessibility impact.

---

## 7. Deprecation Policy

Deprecated token или component нельзя удалять сразу.

Минимальный процесс:

1. Пометить объект как `deprecated`.
2. Указать replacement.
3. Добавить migration note.
4. Оставить поддержку минимум на один minor release.
5. Удалять только в major release.

Пример:

```text
Deprecated: color/background/default
Replacement: surface/page
Reason: новый layer model разделяет page, container и overlay.
Removal: next major release.
```

---

## 8. Component Readiness Checklist

Component spec может стать `ready`, если:

- есть `Status`, `Owner`, `Last reviewed`;
- есть реальная Figma-ссылка или явный `Figma · TBD` для draft;
- описаны anatomy, variants, sizes, states и behavior;
- accessibility соответствует `foundation/accessibility.md`;
- content соответствует `foundation/content.md`;
- icons соответствуют `foundation/iconography.md`, если используются;
- motion соответствует `foundation/motion.md`, если есть анимации;
- radius, borders и elevation соответствуют foundation;
- tokens имеют mapping на semantic/component tokens;
- есть open questions или явно указано, что их нет.

---

## 9. Foundation Readiness Checklist

Foundation-документ может считаться стабильным, если:

- описывает цель и область применения;
- содержит правила use / don't use;
- дает token или component implications;
- содержит accessibility impact, если применимо;
- связан с соседними foundation-документами;
- имеет примеры применения;
- не противоречит existing specs;
- добавлен в `foundation/components.md` или другой index, если нужен entry point.

---

## 10. Quality Checks

Минимальный docs check должен находить:

- component listed in overview but missing spec;
- spec exists but component missing in overview;
- placeholder Figma links;
- missing status metadata;
- missing required sections;
- token references that do not exist in token source;
- deprecated tokens without replacement;
- foundation links to missing files.

Проверка может быть мягкой на раннем этапе: сначала report-only, затем warning, затем blocking для ready/release.

---

## 11. Token Pipeline

Recommended source of truth:

```text
tokens.json
  -> CSS variables
  -> Figma variables
  -> documentation tables
  -> platform aliases
```

Правила:

- primitive values живут в token source;
- semantic tokens ссылаются на primitive или mode values;
- component tokens ссылаются на semantic tokens;
- docs не должны вручную расходиться с token source;
- deprecated tokens должны иметь replacement metadata;
- dark/light/high-contrast modes должны проверяться вместе.

Подробный процесс описан в `foundation/token-pipeline.md`.

---

## 12. Release Notes

Каждый release должен отвечать на четыре вопроса:

1. Что добавлено?
2. Что изменено?
3. Что deprecated?
4. Что breaking?

Для каждого breaking change указывается migration path.

---

## 13. Следующие улучшения

- Добавить владельцев для foundation-разделов.
- Подключить автоматическую проверку metadata и Figma placeholders.
- Сгенерировать docs tables из `tokens.json`.
- Добавить release labels: `foundation`, `tokens`, `component`, `accessibility`, `figma`, `code`.
- Вести `reports/component-maturity-matrix.md` как живой backlog.
