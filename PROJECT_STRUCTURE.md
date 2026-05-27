# SEDA AI Project Structure

Этот файл фиксирует рабочую структуру проекта и границы того, что должно попадать в GitHub.

## Source of Truth

| Path | Role | GitHub |
| --- | --- | --- |
| `tokens.json` | Исходные Foundation, Semantic и Component tokens | Да |
| `foundation/` | Правила Foundation: accessibility, color, content, governance, typography, tokens, validation | Да |
| `specs/` | Component specs и UX/layout specs | Да |
| `ai-readiness/` | AI-ready design system framework слой: audit, maturity, prompts, Handoff, Validation | Да |
| `assets/` | Иконки и изображения, используемые документацией и demos | Да |
| `CHANGELOG.md` | История изменений | Да |

## Documentation And Review Tools

| Path | Role | GitHub |
| --- | --- | --- |
| `portal/` | Документационный портал SEDA AI: docs-site, component-lab и shared portal assets | Да |
| `portal/docs-site/` | Локальный docs/health сайт для SEDA AI | Да |
| `portal/component-lab/` | Лаборатория компонентов и визуальной проверки | Да |
| `figma-plugins/` | Figma tooling, если используется как часть проекта | Да |
| `portal/portal-*.js`, `portal/portal-*.css` | Shared portal scripts/styles для документации и component lab | Да |
| `seda-docs.jsx` | Документационный артефакт/прототип | Да, пока нужен для reference |
| `token-usage-guide.md` | Практическое руководство по использованию токенов | Да |
| `seda_ui_architecture.md` | Архитектурная заметка по системе | Да |

## Local Or Generated Files

Эти файлы не должны попадать в GitHub и отмечены в `.gitignore`.

| Path | Why ignored |
| --- | --- |
| `.claude/` | Локальный контекст AI-ассистентов |
| `CLAUDE.md` | Локальные инструкции для ассистента |
| `handoff.md` | Рабочий handoff с локальными путями, текущим состоянием и задачами |
| `figma_references.md` | Локальные Figma/reference заметки |
| `portal/docs-site/claude-tasks.md` | Сгенерированная очередь задач для AI/agent workflow |
| `portal/docs-site/figma-components.json` | Сгенерированный Figma scan snapshot, его можно пересоздать |
| `reports/` | Сгенерированные отчеты |
| `tools/` | Локальные helper scripts/workspaces, если они не оформлены как часть продукта |
| `tmp/`, `temp/`, `.cache/` | Временные файлы и cache |
| `.env`, `.env.*` | Локальные переменные окружения и потенциальные секреты |
| `*.log`, `*.tmp` | Логи и временные файлы |

## Figma Health Data

| File | Recommendation |
| --- | --- |
| `portal/docs-site/figma-component-aliases.json` | Хранить в GitHub: это curated mapping, влияющий на Health |
| `portal/docs-site/figma-quality-exceptions.json` | Хранить в GitHub: это curated список принятых исключений |
| `portal/docs-site/figma-components.json` | Не хранить в GitHub: это generated snapshot из Figma |

## Practical Rule

Если файл является source of truth, правилом системы, компонентной спецификацией, токеном, документацией или curated health config — он должен быть в GitHub.

Если файл содержит локальный контекст, временный результат AI/agent работы, Figma export snapshot, reports, cache, env или machine-specific данные — он должен быть в `.gitignore`.
