# Component Coverage Check

Дата: 2026-05-09  
Команда: `powershell -ExecutionPolicy Bypass -File tools\check-docs.ps1`

## Что добавлено

`tools/check-docs.ps1` теперь проверяет не только качество отдельных specs, но и покрытие между:

- `foundation/components.md` как overview;
- `specs/**/*.md` как подробные component specs.

## Правило проверки

Checker берет все component headings из `foundation/components.md` в формате `### Component Name`, переводит их в slug и сравнивает с именами spec-файлов.

Примеры:

| Overview heading | Expected spec |
|---|---|
| `Button` | `specs/actions/button.md` |
| `Text Field` | `specs/inputs/text-field.md` |
| `Progress Bar` | `specs/feedback/progress-bar.md` |
| `Stat / Metric` | `specs/data-display/stat-metric.md` |
| `Dropdown / Menu` | `specs/overlays-layout/dropdown-menu.md` |

## Alias rules

Некоторые overview-названия содержат два термина через `/`. Для них задан явный alias:

| Overview heading | Spec slug |
|---|---|
| `Sidebar / Navigation Menu` | `sidebar` |
| `Top Bar / Navbar` | `top-bar` |
| `Toast / Snackbar` | `toast` |
| `Modal / Dialog` | `modal` |
| `Spinner / Loader` | `spinner` |
| `Dropdown / Menu` | `dropdown-menu` |
| `Stat / Metric` | `stat-metric` |

## Как читать результат

Если checker пишет `Component listed in overview but missing spec`, значит компонент обещан в overview, но отдельной спецификации нет.

Если checker пишет `Spec exists but component missing in overview`, значит spec-файл есть, но компонент не указан в общем каталоге.

## Следующее улучшение

После проверки покрытия стоит добавить token reference validation:

1. собрать token-like references из specs;
2. сравнить их с `tokens.json` и foundation token docs;
3. разделить ошибки на `unknown token`, `component-specific token`, `legacy token`.
