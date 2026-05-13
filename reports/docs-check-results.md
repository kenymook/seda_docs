# Docs Check Results

Дата: 2026-05-09  
Команда: `powershell -ExecutionPolicy Bypass -File tools\check-docs.ps1`

## Итог

Базовая проверка документации запустилась успешно.

Первый запуск показал 177 issue(s). После нормализации metadata и добавления недостающих `States` / `Accessibility` sections осталось 50 Figma warnings. После добавления severity modes результат проверки:

```text
Docs check found 0 error(s), 50 warning(s).
```

## Основные типы проблем

| Тип | Что означает | Дальнейшее действие |
|---|---|---|
| Missing metadata `Status` | Spec не имеет явного статуса зрелости. | Выполнено: metadata добавлена во все specs. |
| Missing metadata `Owner` | У spec нет владельца. | Выполнено: временно указано `Owner · TBD`. |
| Missing metadata `Last reviewed` | Непонятно, когда spec проверяли. | Выполнено: добавлено `Last reviewed · 2026-05-09`. |
| Missing real Figma URL | Нет реальной Figma-ссылки. | Осталось как warning для `draft` / `needs-review`; станет error для `ready`. |
| Missing section `States` | Не описаны состояния или явно не указано, что они не применимы. | Выполнено для найденных specs. |
| Missing section `Accessibility` | Нет accessibility-раздела. | Выполнено для найденных specs. |

## Приоритет исправления

1. Добавить реальные Figma node URLs в 50 specs.
2. Заменить временные `Owner · TBD` на владельцев.
3. Coverage check `foundation/components.md` ↔ `specs/` добавлен.
4. После этого расширить checker: token reference validation.
5. Настроить режимы severity: выполнено.

## Вывод

Governance/tooling этап теперь имеет первый работающий контроль качества. Структурный долг по metadata и обязательным разделам закрыт; blocking errors отсутствуют. Следующий практический долг — реальные Figma-ссылки и владельцы.
