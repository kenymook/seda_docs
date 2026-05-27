# SEDA AI Documentation Standard

Этот стандарт описывает, как писать component specs для SEDA AI так, чтобы ими могли пользоваться дизайнеры, разработчики, аналитики и AI-ассистенты.

Component spec в SEDA AI — это не только описание внешнего вида. Это контракт между design, code, product logic, accessibility, Handoff, Validation и AI Layer.

## Для кого пишется документация

| Роль | Что должна получить из spec |
| --- | --- |
| Дизайнер | Назначение, сценарии использования, anatomy, variants, states, constraints, anti-patterns |
| Разработчик | Props, behavior, token mapping, code mapping, accessibility requirements, edge cases |
| Аналитик | Product behavior, acceptance criteria, validation logic, content rules |
| AI-ассистент | Структурированные правила, разрешенные действия, ограничения, expected output format и точки обязательного human review |

## Принципы написания specs

- Описывать назначение перед визуальными деталями.
- Фиксировать ограничения так же явно, как возможности.
- Связывать визуальные решения с design tokens.
- Описывать states и edge cases до handoff.
- Разделять правила для людей и правила для AI, но хранить их в одном source of truth.
- Писать конкретно: "используй Button variant=primary для основного действия", а не "используй заметную кнопку".
- Помечать все неподдержанные сценарии как anti-patterns или restricted usage.
- Указывать, где AI может ускорить draft или проверку, а где финальное решение остается за дизайнером, разработчиком или аналитиком.

## Component Spec Template

```md
# Component Name

## Purpose

Кратко опишите, какую задачу решает компонент и какую роль он играет в интерфейсе.

## When to use

- Сценарий 1
- Сценарий 2
- Сценарий 3

## When not to use

- Ограничение 1
- Ограничение 2
- Альтернативный компонент или pattern

## Anatomy

| Part | Required | Description |
| --- | --- | --- |
| Root | Yes | Контейнер компонента |
| Label | Depends | Текстовая метка |
| Icon | Optional | Иконка до или после label |

## Variants

| Variant | Purpose | Constraints |
| --- | --- | --- |
| primary | Основное действие | Один primary action в пределах смыслового блока |
| secondary | Вторичное действие | Не конкурирует с primary |

## States

| State | Description | Required behavior |
| --- | --- | --- |
| default | Базовое состояние | Доступно для взаимодействия |
| hover | Наведение | Только для pointer devices |
| focus | Фокус клавиатуры | Видимый focus indicator |
| disabled | Недоступно | Не получает action |
| loading | Выполняется действие | Предотвращает повторную отправку |

## Props

| Prop | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| variant | enum | secondary | No | Визуальная и смысловая роль |
| size | enum | medium | No | Размер компонента |
| disabled | boolean | false | No | Отключает взаимодействие |

## Behavior

- Опишите основные взаимодействия.
- Опишите правила keyboard interaction.
- Опишите edge cases.
- Опишите связь с form или navigation behavior, если применимо.

## Accessibility

- Требования к role и semantic HTML.
- Требования к label, aria attributes и focus order.
- Требования к contrast и keyboard support.

## Design Tokens

| Element | Token | Usage |
| --- | --- | --- |
| Background | component.button.primary.bg | Фон primary variant |
| Text | component.button.primary.text | Цвет label |
| Radius | component.button.radius | Скругление |

## Code mapping

| Design variant | Code prop | Notes |
| --- | --- | --- |
| Primary | variant="primary" | Используется для главного действия |
| Disabled | disabled={true} | Должно блокировать action |

## Handoff notes

- Укажите обязательные states.
- Укажите responsive behavior.
- Укажите зависимости от данных.
- Укажите acceptance criteria.

## AI usage rules

- AI может предложить вариант использования компонента только на основе `When to use`.
- AI не должен создавать новые variants без design-system review.
- AI должен возвращать token names, а не hardcoded values.
- AI должен пометить любые недостающие states как риск.

## Examples

### Correct

Опишите правильный пример и почему он соответствует системе.

### Needs review

Опишите пример, который требует решения владельца системы.

## Anti-patterns

- Неверное использование 1.
- Неверное использование 2.
- Неподдержанная комбинация props или variants.
```

## AI Usage Rules

AI usage rules должны быть короткими, проверяемыми и связанными с конкретным компонентом или pattern.

AI не заменяет автора component spec. Он может помочь найти пропущенные states, подготовить черновик examples, проверить token mapping и собрать Handoff notes, но финальное решение по назначению, поведению, accessibility и code contract остается за владельцами системы.

### Примеры правил

| Rule | Why it matters |
| --- | --- |
| AI must use documented variants only. | Предотвращает появление неподдержанных визуальных решений. |
| AI must include all required states in handoff notes. | Снижает риск неполной реализации. |
| AI must map visual values to token names. | Поддерживает tokens as source of truth. |
| AI must flag missing accessibility information. | Не позволяет скрыть отсутствие критичных требований. |
| AI must not invent component props. | Сохраняет контракт design-to-code. |
| AI must ask for human review when usage conflicts with `When not to use`. | Фиксирует риск до реализации. |

## Quality checklist для component spec

- [ ] Purpose описывает задачу, а не внешний вид.
- [ ] When to use содержит реальные сценарии.
- [ ] When not to use содержит ограничения и альтернативы.
- [ ] Anatomy отделяет обязательные части от опциональных.
- [ ] Variants имеют смысловые роли.
- [ ] States включают default, hover, focus, disabled, loading, error или empty, если применимо.
- [ ] Props описаны как контракт.
- [ ] Behavior покрывает interaction и edge cases.
- [ ] Accessibility содержит проверяемые требования.
- [ ] Design Tokens указаны именами токенов.
- [ ] Code mapping связывает design artifact с code artifact.
- [ ] Handoff notes пригодны для разработки.
- [ ] AI usage rules ограничивают допустимые действия AI.
- [ ] Examples и anti-patterns помогают отличать правильное применение от похожего неправильного.
