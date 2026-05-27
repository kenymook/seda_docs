# SEDA AI Handoff Rules

Handoff в SEDA AI — это передача не только макета, но и системного контракта: какие Components используются, какие props и Design Tokens применяются, какие states обязательны, какие edge cases нужно реализовать и что должен проверить человек.

AI может ускорить подготовку Handoff notes, props mapping draft, token mapping draft и acceptance criteria. Он не заменяет проверку дизайнера, разработчика или аналитика и не утверждает неподтвержденные решения как финальные.

## Design to code mapping

Каждый значимый design artifact должен иметь соответствующий code artifact или явную пометку `Needs implementation`.

| Design artifact | Code artifact | AI can help with | Human must validate |
| --- | --- | --- | --- |
| Component instance | Component import and props | Предложить props mapping по spec | Корректность API и технических ограничений |
| Variant | Component prop or class | Найти соответствующий documented variant | Что variant поддерживается в коде |
| Design token | CSS variable, theme token, platform token | Подобрать token name из mapping | Что token существует и применен по роли |
| Screen state | State logic, conditional rendering | Составить state matrix | Полноту business logic |
| UX pattern | Composition of components | Подготовить structure draft | Соответствие продуктовой задаче |
| Accessibility note | ARIA, semantic HTML, focus behavior | Сформировать checklist | Реальное поведение в реализации |
| Acceptance criteria | Testable criteria | Черновик критериев | Достаточность для QA и разработки |

## Component props contract

Props contract должен быть указан до передачи в разработку.

| Поле | Описание |
| --- | --- |
| Component | Название компонента в design system |
| Code reference | Импорт, package или путь в коде |
| Prop | Имя свойства |
| Type | Тип значения |
| Default | Значение по умолчанию |
| Required | Обязательность |
| Allowed values | Допустимые значения |
| Design source | Как prop представлен в макете |
| Notes | Ограничения и edge cases |

### Правила

- AI может предложить mapping только на основе documented props.
- AI не должен придумывать props для решения визуальной задачи.
- Если prop отсутствует, результат должен быть помечен как `Needs system review`.
- В handoff должны быть указаны обязательные states и их связь с props.

## Token mapping

Token mapping связывает визуальное решение с source of truth.

| Design value | Token | Code mapping | Notes |
| --- | --- | --- | --- |
| Surface background | semantic.surface.default | var(--seda-surface-default) | Пример naming, требует сверки с actual tokens |
| Primary action text | component.button.primary.text | var(--seda-button-primary-text) | Используется только для primary action |

### Правила

- Не передавать hardcoded values как финальный handoff, если есть соответствующий token.
- Если token отсутствует, указать `Token gap`.
- Для platform differences описывать разные mappings, а не разные смыслы.
- AI-generated handoff должен перечислять все unresolved token mappings.

## Platform differences: web / iOS / Android

| Область | Web | iOS | Android |
| --- | --- | --- | --- |
| Typography | CSS font tokens | Text styles | Text appearances or Compose typography |
| Interaction | Hover, focus, keyboard | Touch, accessibility actions | Touch, focus, accessibility services |
| Navigation | Browser and app routing | Native navigation patterns | Native navigation patterns |
| Inputs | HTML semantics and validation | Native controls | Native controls |
| Motion | CSS or JS animation | UIKit/SwiftUI motion | Android animation APIs |

### Правила

- Platform-specific behavior должен быть указан явно.
- AI может подсветить возможные отличия, но не должен принимать платформенное решение без review.
- Если компонент существует только на одной платформе, handoff должен содержать alternative или gap.

## States and edge cases

Обязательные группы states:

- default;
- hover, если применимо;
- focus;
- active или pressed;
- disabled;
- loading;
- error;
- empty;
- success, если применимо;
- permission denied, если применимо;
- long content;
- no connection или unavailable data, если применимо.

| State | Trigger | UI behavior | Data behavior | Accessibility | Acceptance criteria |
| --- | --- | --- | --- | --- | --- |
| Loading | Data request started | Показать skeleton или loading indicator | Disable destructive action | Announce busy state if needed | User cannot submit twice |
| Error | Request failed | Показать error message and recovery action | Preserve user input | Error connected to field or region | User can retry or recover |

## Responsive behavior

Handoff должен описывать:

- breakpoints или container rules;
- wrapping behavior;
- min/max widths;
- density changes;
- table/list behavior;
- navigation changes;
- behavior for long text;
- touch target requirements.

AI может подготовить draft responsive rules, но человек должен проверить, что они соответствуют продуктовой задаче и реальным ограничениям платформы.

## Acceptance criteria

Acceptance criteria должны быть проверяемыми.

### Хороший формат

- Компонент использует documented variant и props.
- Все обязательные states реализованы.
- Визуальные значения связаны с tokens.
- Focus state видим и доступен с клавиатуры.
- Empty, error и loading states имеют понятные recovery actions.
- Responsive behavior соответствует handoff notes.

### Плохой формат

- Интерфейс выглядит хорошо.
- Сделать красиво.
- Добавить нормальные состояния.
- Реализовать как в макете.

## AI-generated handoff notes

AI может помогать:

- структурировать handoff;
- находить missing states;
- готовить props mapping draft;
- проверять Design Token usage;
- формировать acceptance criteria;
- выявлять open questions.

AI не должен:

- утверждать неподтвержденный mapping как финальный;
- придумывать tokens, props или components;
- скрывать неопределенности;
- заменять review дизайнера, разработчика или аналитика;
- принимать решение о platform-specific behavior без владельца.

## Human review checklist

- [ ] Все components существуют в системе или помечены как gaps.
- [ ] Все variants и props соответствуют component specs.
- [ ] Все visual values связаны с tokens или отмечены как token gaps.
- [ ] Все обязательные states описаны.
- [ ] Edge cases покрыты.
- [ ] Responsive behavior описан проверяемо.
- [ ] Accessibility requirements включены.
- [ ] Platform differences указаны.
- [ ] Acceptance criteria проверяемы.
- [ ] AI-generated sections проверены человеком.
- [ ] Open questions назначены владельцам.
