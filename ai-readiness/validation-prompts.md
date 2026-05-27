# SEDA AI Validation Prompts

Validation prompts помогают проверять качество AI-assisted и human-created артефактов в SEDA AI. Их задача — выявлять несоответствия AI-ready design system framework до того, как они попадут в разработку или production.

Validation не является заменой review дизайнера, разработчика или аналитика. AI может ускорить поиск нарушений, missing states, token gaps и Handoff gaps, но итоговое решение о качестве принимает человек.

## Формат результата validation

Используйте единый формат:

| Field | Description |
| --- | --- |
| Status | Pass, Pass with notes, Needs review, Fail |
| Severity | Low, Medium, High, Critical |
| Area | Foundation, Design Tokens, Components, UX Patterns, Documentation, Handoff, Governance, Validation, AI Layer |
| Finding | Что найдено |
| Evidence | Где это видно |
| Rule | На какое правило или spec ссылается проверка |
| Recommendation | Что исправить |
| Human review | Требуется ли проверка человеком |

## Visual consistency validation

### Что проверяется

- Визуальная иерархия.
- Spacing и density.
- Typography scale.
- Цветовые роли.
- Layout и alignment.
- Согласованность states.
- Отсутствие декоративных элементов без функциональной роли.

### Какие ошибки искать

- Несистемные отступы.
- Смешение разных иерархий на одном экране.
- Слишком крупные заголовки внутри рабочих панелей.
- Неподдержанные визуальные variants.
- Отличия между похожими элементами без причины.

### Пример prompt

```text
Проверь visual consistency экрана в рамках SEDA AI.
Используй Foundation, Design Tokens, component specs и UX Pattern rules как source of truth.
Найди несоответствия в hierarchy, spacing, typography, color roles, alignment, density и states.
Не предлагай новые визуальные решения без ссылки на существующее правило.
Верни результат в формате Status / Severity / Area / Finding / Evidence / Rule / Recommendation / Human review.
```

### Формат результата

| Status | Severity | Area | Finding | Evidence | Rule | Recommendation | Human review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Needs review | Medium | Visual consistency | Разные отступы между однотипными блоками | Section A uses 16px, Section B uses 24px | Spacing tokens | Привести к semantic spacing token | Yes |

## Token validation

### Что проверяется

- Использование semantic и component tokens.
- Отсутствие hardcoded values.
- Соответствие token mapping между design и code.
- Использование актуальных токенов.
- Корректное применение platform-specific mappings.

### Какие ошибки искать

- Цвета, spacing, radius или typography без токена.
- Использование primitive token там, где нужен semantic token.
- Устаревший token.
- Несоответствие design token и code token.
- Токен применен вне своей смысловой роли.

### Пример prompt

```text
Проверь Design Token usage в артефакте SEDA AI.
Сравни визуальные значения с token architecture и component token mapping.
Найди hardcoded values, неверные semantic tokens, deprecated tokens и missing mappings.
Для каждой проблемы предложи корректный token name или отметь Open question, если mapping отсутствует.
```

### Формат результата

| Token issue | Current value | Expected token | Severity | Recommendation |
| --- | --- | --- | --- | --- |
| Hardcoded color | #FFFFFF | semantic.surface.default | High | Заменить на semantic token |

## Component usage validation

### Что проверяется

- Соответствие Purpose.
- When to use / When not to use.
- Variants и props.
- States.
- Anatomy.
- Anti-patterns.
- Наличие обязательных элементов.

### Какие ошибки искать

- Неверный компонент для задачи.
- Неподдержанный variant.
- Пропущенный disabled, loading, error или focus state.
- Изобретенный prop.
- Неправильная composition.

### Пример prompt

```text
Проверь использование компонентов SEDA AI на экране.
Для каждого компонента сравни фактическое применение с Purpose, When to use, When not to use, Variants, States, Props, Anatomy и Anti-patterns.
Если компонент используется вне правил, укажи альтернативу из существующей системы или отметь Need system review.
```

### Формат результата

| Component | Status | Issue | Severity | Recommended action |
| --- | --- | --- | --- | --- |
| Button | Fail | Использован новый visual variant без spec | High | Использовать documented variant или инициировать system review |

## Accessibility validation

### Что проверяется

- Contrast.
- Focus visibility.
- Keyboard navigation.
- Semantic roles.
- Labels and descriptions.
- Error announcement.
- Touch target size.
- Reduced motion, если применимо.

### Какие ошибки искать

- Недостаточный contrast.
- Нет visible focus.
- Иконка без accessible label.
- Error message не связан с field.
- Interaction доступен только мышью.
- Dynamic state не объявляется assistive technologies.

### Пример prompt

```text
Проверь accessibility артефакта SEDA AI.
Оцени contrast, focus, keyboard support, semantic roles, labels, error handling, touch targets и dynamic state announcements.
Укажи, какие требования можно проверить по предоставленным данным, а какие требуют manual или technical review.
```

### Формат результата

| Requirement | Status | Evidence | Risk | Recommendation |
| --- | --- | --- | --- | --- |
| Focus visibility | Needs review | Focus state не показан | Keyboard users may lose context | Добавить focus state в spec и handoff |

## Handoff validation

### Что проверяется

- Component mapping.
- Props contract.
- Token mapping.
- States and edge cases.
- Responsive behavior.
- Platform differences.
- Acceptance criteria.
- Open questions.

### Какие ошибки искать

- Handoff содержит только макет без контракта.
- Нет props или code mapping.
- Не описаны states.
- Нет responsive rules.
- Acceptance criteria непроверяемы.
- Platform differences не указаны.

### Пример prompt

```text
Проверь handoff notes для SEDA AI.
Убедись, что они включают design-to-code mapping, component props, token mapping, states, edge cases, responsive behavior, platform differences, accessibility и acceptance criteria.
Все недостающие части оформи как blockers или open questions.
```

### Формат результата

| Handoff area | Status | Missing information | Impact | Next step |
| --- | --- | --- | --- | --- |
| States | Fail | Error and loading states missing | Implementation may be incomplete | Добавить state matrix до разработки |

## AI output validation

### Что проверяется

- AI использовал предоставленный контекст.
- AI не придумал новые tokens, props, variants или components.
- AI указал неопределенности.
- AI сослался на specs или rules.
- AI output можно проверить человеком.
- AI не подменил product decision.

### Какие ошибки искать

- Уверенные утверждения без источника.
- Новые элементы системы без review.
- Отсутствие рисков и open questions.
- Смешение system rules и предположений.
- Непроверяемые рекомендации.

### Пример prompt

```text
Проверь AI-generated output на соответствие SEDA AI.
Определи, где AI опирается на предоставленные rules, а где делает предположения.
Найди invented Design Tokens, Components, variants, props, unsupported UX Patterns и missing human review points.
Верни список findings с severity и required action.
```

### Формат результата

| Finding | Evidence | Risk | Severity | Required action |
| --- | --- | --- | --- | --- |
| Invented prop | AI suggested `visualMode="hero"` | Component contract may be broken | High | Удалить prop или отправить на system review |
