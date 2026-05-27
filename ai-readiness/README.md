# AI Readiness

## Purpose

Раздел `ai-readiness` описывает, как SEDA AI помогает продуктовым командам готовить дизайн-систему к безопасному использованию AI-assisted product development. Это слой правил, моделей, чеклистов, prompts и шаблонов для оценки зрелости, улучшения документации, подготовки Handoff и проверки AI-generated outputs.

## Core Idea

SEDA AI помогает продуктовым командам подготовить дизайн-систему, токены, компоненты, документацию, validation и handoff к безопасному использованию AI-assisted product development.

AI не заменяет дизайнера и разработчика. AI помогает ускорять аудит, генерацию черновиков, документацию, проверку соответствия правилам и подготовку Handoff. Финальное решение остается за человеком.

## Documents

| Document | Purpose | When to use |
| --- | --- | --- |
| `manifesto.md` | Объясняет позицию SEDA AI как AI-ready design system framework | Когда нужно зафиксировать принципы, границы и роль AI |
| `maturity-model.md` | Описывает уровни зрелости от Interface Chaos до AI-assisted Interface Infrastructure | Когда нужно оценить текущий уровень системы и следующий шаг |
| `audit-checklist.md` | Дает детальный чеклист Readiness Audit по слоям системы | Когда нужно провести аудит Foundation, Design Tokens, Components, UX Patterns, Documentation, Handoff, Governance, Validation и AI Readiness |
| `ai-documentation-standard.md` | Задает стандарт component specs для людей и AI-ассистентов | Когда нужно писать или ревьюить документацию компонентов |
| `prompt-library.md` | Собирает prompts для системных задач внутри SEDA AI | Когда нужно ускорить аудит, проверку, draft specs, UX Patterns или Handoff |
| `validation-prompts.md` | Описывает prompts и формат результата для контроля качества | Когда нужно проверить visual consistency, Design Tokens, Components, accessibility, Handoff и AI output |
| `ai-handoff-rules.md` | Фиксирует правила design-to-code Handoff для AI-assisted product development | Когда экран или flow передается в разработку |
| `audit-report-template.md` | Дает структуру отчета SEDA AI Readiness Audit | Когда нужно оформить результаты аудита, Maturity Score, risks, quick wins и roadmap |
| `pilot-offer.md` | Описывает коммерческий пилот SEDA AI Readiness Audit | Когда нужно объяснить scope, deliverables, пакеты и критерии успеха пилота |

## Recommended Reading Order

1. `manifesto.md`
2. `maturity-model.md`
3. `audit-checklist.md`
4. `ai-documentation-standard.md`
5. `ai-handoff-rules.md`
6. `validation-prompts.md`
7. `prompt-library.md`
8. `audit-report-template.md`
9. `pilot-offer.md`

## Commercial Use

Этот раздел является основой для SEDA AI Readiness Audit. Документы можно использовать как рабочий набор для:

- диагностики текущей дизайн-системы;
- расчета Maturity Score;
- подготовки problem map;
- подготовки risk map;
- поиска quick wins;
- формирования roadmap;
- подготовки AI Readiness recommendations.

В коммерческом формате этот слой помогает связать аудит, отчет, рекомендации и пилотную программу в один повторяемый процесс: сначала команда оценивает текущее состояние, затем фиксирует риски и gaps, после этого получает практичный roadmap для перехода к AI-ready design system framework.

## Important Boundary

SEDA AI is a separate personal project. Do not mix it with any external or work-related design system context unless explicitly requested.
