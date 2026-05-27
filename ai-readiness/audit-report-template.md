# SEDA AI Readiness Audit Report Template

Этот шаблон используется для отчета по SEDA AI Readiness Audit. Он помогает зафиксировать текущее состояние дизайн-системы, Maturity Score, ключевые риски и план перехода к AI-ready design system framework.

## Executive Summary

Кратко опишите:

- цель аудита;
- проверенные артефакты;
- текущий уровень зрелости;
- основные системные риски;
- рекомендуемые следующие шаги.

## Scope

| Area | Included | Notes |
| --- | --- | --- |
| Foundation | Yes / No |  |
| Design Tokens | Yes / No |  |
| Components | Yes / No |  |
| UX Patterns | Yes / No |  |
| Documentation | Yes / No |  |
| Handoff | Yes / No |  |
| Governance | Yes / No |  |
| Validation | Yes / No |  |
| AI Readiness | Yes / No |  |

## Current State

Опишите текущее состояние системы по слоям:

- что уже работает;
- что отсутствует;
- что не связано между собой;
- какие решения существуют только в устной договоренности;
- какие артефакты не готовы к AI-assisted usage.

## Maturity Score

| Layer | Score 0-4 | Current level | Evidence | Target level |
| --- | --- | --- | --- | --- |
| Foundation |  |  |  |  |
| Design Tokens |  |  |  |  |
| Components |  |  |  |  |
| UX Patterns |  |  |  |  |
| Documentation |  |  |  |  |
| Handoff |  |  |  |  |
| Governance |  |  |  |  |
| Validation |  |  |  |  |
| AI Readiness |  |  |  |  |

### Scoring guide

| Score | Meaning |
| --- | --- |
| 0 | Level 0 — Interface Chaos |
| 1 | Level 1 — Basic Design System |
| 2 | Level 2 — Systematic Design System |
| 3 | Level 3 — AI-ready Design System |
| 4 | Level 4 — AI-assisted Interface Infrastructure |

## Foundation Assessment

| Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- |
|  |  |  |  |

Проверьте:

- принципы интерфейса;
- визуальную иерархию;
- accessibility foundation;
- content principles;
- responsive rules;
- ownership.

## Design Tokens / Token Architecture Assessment

| Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- |
|  |  |  |  |

Проверьте:

- primitive, semantic и component tokens;
- naming;
- deprecated tokens;
- design-to-code mapping;
- platform differences;
- token validation.

## Components / Component System Assessment

| Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- |
|  |  |  |  |

Проверьте:

- purpose;
- variants;
- states;
- props;
- behavior;
- accessibility;
- examples;
- anti-patterns;
- AI Layer rules.

## UX Patterns Assessment

| Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- |
|  |  |  |  |

Проверьте:

- form patterns;
- empty, error и loading states;
- table and list patterns;
- navigation patterns;
- confirmation and destructive action patterns;
- content rules;
- edge cases;
- связь patterns с Components, Design Tokens и Handoff.

## Documentation Assessment

| Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- |
|  |  |  |  |

Проверьте:

- единый стандарт component specs;
- полноту документации;
- source of truth;
- versioning;
- пригодность для AI-assisted tasks.

## Handoff Assessment

| Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- |
|  |  |  |  |

Проверьте:

- design-to-code mapping;
- props contract;
- token mapping;
- states;
- edge cases;
- responsive behavior;
- acceptance criteria.

## Governance Assessment

| Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- |
|  |  |  |  |

Проверьте:

- owners;
- review process;
- change management;
- component lifecycle;
- token lifecycle;
- prompt governance.

## Validation Assessment

| Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- |
|  |  |  |  |

Проверьте:

- visual consistency validation;
- token validation;
- Component usage validation;
- accessibility validation;
- handoff validation;
- AI output validation;
- pass/fail criteria;
- human review checkpoints.

## AI Readiness Assessment

| Finding | Evidence | Impact | Recommendation |
| --- | --- | --- | --- |
|  |  |  |  |

Проверьте:

- allowed AI use cases;
- restricted AI use cases;
- AI Layer ownership;
- prompt library;
- validation prompts;
- human review;
- risk classification;
- measurement.

## Key Risks

| Risk | Severity | Probability | Impact | Owner | Mitigation |
| --- | --- | --- | --- | --- | --- |
| AI uses unsupported component variants | High | Medium | Inconsistent UI and broken implementation |  | Add component AI Layer rules |
| Token mapping is incomplete | High | High | Handoff becomes ambiguous |  | Create token mapping table |
| Missing states in specs | Medium | High | Incomplete implementation |  | Add state matrix to component specs |

## Quick Wins

| Quick win | Effort | Impact | Owner | Due date |
| --- | --- | --- | --- | --- |
| Add AI Layer rules to top 5 components | Low | High |  |  |
| Create handoff checklist | Low | Medium |  |  |
| Mark deprecated tokens | Medium | High |  |  |
| Add Validation prompt for Design Token usage | Low | Medium |  |  |

## 3-Month Roadmap

| Month | Focus | Key actions | Expected outcome |
| --- | --- | --- | --- |
| Month 1 | Stabilize source of truth | Audit tokens, define documentation standard, select pilot components | Clear baseline and first AI-ready specs |
| Month 2 | Connect design and code | Add code mapping, props contracts, handoff rules, validation prompts | Handoff becomes repeatable |
| Month 3 | Operationalize AI Readiness | Add Governance, AI Layer ownership, prompt library, review workflow and metrics | AI-assisted workflows become safer and measurable |

## Recommended Next Steps

1. Зафиксировать текущий Maturity Score.
2. Выбрать 3-5 критичных компонентов для AI-ready documentation.
3. Описать token mapping и gaps.
4. Добавить handoff rules и acceptance criteria.
5. Провести pilot validation на одном реальном экране.
6. Обновить roadmap по итогам pilot.

## Appendix

В appendix можно добавить:

- список проверенных файлов;
- screenshots;
- component inventory;
- token inventory;
- prompt outputs;
- интервью с командой;
- decision log;
- unresolved questions.
