# SEDA AI Prompt Library

Эта библиотека содержит prompts для работы внутри SEDA AI. Их цель — не генерация случайного UI, а аудит, структурирование, проверка и подготовка артефактов в рамках AI-ready design system framework.

Prompts являются частью AI Layer. Они помогают ускорять аудит, генерацию черновиков, документацию, проверку соответствия правилам и подготовку Handoff. Финальное решение остается за человеком.

## Правила использования prompts

- Всегда передавайте AI актуальные specs, tokens, screenshots или ссылки на артефакты.
- Просите AI указывать неопределенности и риски.
- Не принимайте AI output без human review.
- Требуйте ссылки на конкретные правила, токены, компоненты или sections документации.
- Запрещайте AI придумывать новые Components, variants, Design Tokens и props без явного запроса и system review.

## Аудит экрана на соответствие дизайн-системе

| Поле | Содержание |
| --- | --- |
| Название | Screen Design System Audit |
| Когда использовать | Перед design review, handoff или реализацией экрана |
| Входные данные | Скриншот или описание экрана, список компонентов, relevant specs, tokens |
| Prompt | Проверь экран на соответствие SEDA AI. Оцени Foundation, Design Token usage, Component usage, UX Patterns, states, accessibility и Handoff readiness. Не предлагай новые Components, если задача решается существующими. Для каждого нарушения укажи severity, affected area, ссылку на правило или spec, recommended fix и need for human review. |
| Ожидаемый результат | Таблица нарушений, список рисков, quick fixes, open questions |

## Проверка использования компонентов

| Поле | Содержание |
| --- | --- |
| Название | Component Usage Validation |
| Когда использовать | Когда нужно проверить, правильно ли выбраны компоненты на экране |
| Входные данные | Экран, список использованных компонентов, component specs |
| Prompt | Проверь, соответствуют ли использованные компоненты их Purpose, When to use, When not to use, Variants и States. Найди случаи неверного выбора компонента, неподдержанных variants, отсутствующих states и конфликтов с anti-patterns. Не придумывай новые props или variants. |
| Ожидаемый результат | Component-by-component review с pass/fail, issues, severity и recommendations |

## Проверка токенов

| Поле | Содержание |
| --- | --- |
| Название | Token Usage Check |
| Когда использовать | Перед handoff, после AI-generated draft или при ревью реализации |
| Входные данные | Design Tokens, CSS или code snippet, component spec, screen description |
| Prompt | Проверь, выражены ли визуальные значения через токены SEDA AI. Найди hardcoded values, неверные semantic tokens, смешение primitive и component tokens, устаревшие токены и потенциальные конфликты между design и code mapping. |
| Ожидаемый результат | Список token issues, correct token suggestions, unresolved mappings |

## Генерация структуры формы

| Поле | Содержание |
| --- | --- |
| Название | System-based Form Structure |
| Когда использовать | При проектировании формы внутри существующей системы |
| Входные данные | Цель формы, поля, validation rules, component specs, UX pattern rules |
| Prompt | Сформируй структуру формы в рамках SEDA AI. Используй только задокументированные компоненты и patterns. Для каждого поля укажи label, input type, validation, helper text, error state, required status, accessibility notes и handoff notes. Если данных недостаточно, пометь open questions. |
| Ожидаемый результат | Структура формы, field matrix, states, validation notes, open questions |

## Генерация empty/error/loading states

| Поле | Содержание |
| --- | --- |
| Название | State Set Generator |
| Когда использовать | Когда экран или компонент требует системных состояний |
| Входные данные | Screen purpose, component specs, product context, UX pattern rules |
| Prompt | Подготовь empty, error и loading states для указанного сценария в рамках SEDA AI. Для каждого состояния укажи trigger, user message, available actions, Component usage, accessibility notes и acceptance criteria. Не используй декоративные решения без функциональной роли. |
| Ожидаемый результат | State matrix с текстами, действиями, components и criteria |

## Подготовка handoff notes

| Поле | Содержание |
| --- | --- |
| Название | AI-assisted Handoff Notes |
| Когда использовать | Перед передачей экрана в разработку |
| Входные данные | Экран, components, tokens, behavior, responsive rules, acceptance criteria |
| Prompt | Подготовь handoff notes для реализации в рамках SEDA AI. Включи component mapping, props, token mapping, states, edge cases, responsive behavior, accessibility requirements и acceptance criteria. Все неопределенности вынеси в Open questions. |
| Ожидаемый результат | Структурированный handoff document и checklist для review |

## Проверка component spec

| Поле | Содержание |
| --- | --- |
| Название | Component Spec Review |
| Когда использовать | Перед публикацией или обновлением component documentation |
| Входные данные | Component spec draft, documentation standard, related specs |
| Prompt | Проверь component spec на соответствие SEDA AI Documentation Standard. Оцени полноту Purpose, When to use, When not to use, Anatomy, Variants, States, Props, Behavior, Accessibility, Design Tokens, Code mapping, Handoff notes, AI usage rules, Examples и Anti-patterns. |
| Ожидаемый результат | Checklist, missing sections, risk notes, rewritten suggestions |

## Создание UX Pattern

| Поле | Содержание |
| --- | --- |
| Название | UX Pattern Draft |
| Когда использовать | Когда повторяющийся сценарий нужно оформить как pattern |
| Входные данные | User goal, scenario, components, states, constraints, product rules |
| Prompt | Создай draft UX Pattern для SEDA AI. Опиши purpose, user goal, when to use, when not to use, flow, required Components, states, accessibility, content rules, Handoff notes, AI usage rules и anti-patterns. Не добавляй новые Components без пометки Needs system review. |
| Ожидаемый результат | Draft pattern spec с рисками и open questions |

## Подготовка acceptance criteria

| Поле | Содержание |
| --- | --- |
| Название | Acceptance Criteria from System Rules |
| Когда использовать | Перед разработкой или QA review |
| Входные данные | Feature description, screen design, component specs, behavior rules |
| Prompt | Подготовь acceptance criteria для реализации интерфейса в рамках SEDA AI. Критерии должны покрывать Component usage, Design Token usage, states, responsive behavior, accessibility, data edge cases и Handoff completeness. Формулируй критерии проверяемо. |
| Ожидаемый результат | Список acceptance criteria с pass/fail форматом |

## Анализ риска неконсистентности

| Поле | Содержание |
| --- | --- |
| Название | Consistency Risk Analysis |
| Когда использовать | При добавлении нового экрана, компонента, токена или pattern |
| Входные данные | Описание изменения, affected components, tokens, related screens, specs |
| Prompt | Оцени риск неконсистентности для предлагаемого изменения в SEDA AI. Найди возможные конфликты с Foundation, Design Tokens, Components, UX Patterns, Documentation, Handoff и AI usage rules. Для каждого риска укажи severity, affected artifacts, mitigation и whether system review is required. |
| Ожидаемый результат | Risk map, mitigation plan, review recommendations |
