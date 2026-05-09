# Token Reference Audit

Дата: 2026-05-09  
Команда: `powershell -ExecutionPolicy Bypass -File tools\check-token-refs.ps1`

## Цель

Проверить, какие token-like references встречаются в component specs, и разделить их на три группы:

- `known` — токен найден в `tokens.json`;
- `component-specific` — локальный component token или CSS custom property, который допустим в spec;
- `unknown` — ссылка похожа на design token, но не найдена в source.

## Что добавлено

Добавлен скрипт:

```text
tools/check-token-refs.ps1
```

Он:

1. читает `tokens.json`;
2. собирает все token paths из collections и modes;
3. сканирует `specs/**/*.md`;
4. извлекает inline-code references с token prefixes;
5. выводит summary и список unknown references.

## Правила классификации

| Группа | Пример | Значение |
|---|---|---|
| `known` | `text/primary` | Есть в `tokens.json`. |
| `component-specific` | `--btn-primary-bg`, `button/primary/background/default` | Локальный component token; должен мапиться на semantic token. |
| `unknown` | `container/default` | Выглядит как токен, но не найден в source. Нужно проверить naming или добавить alias. |

## Как использовать результат

Unknown references не обязательно являются ошибками сразу. На текущем этапе это audit list:

1. проверить, является ли ссылка старым названием semantic token;
2. заменить на актуальный token из `tokens.json`;
3. или добавить token в source, если ссылка правильная;
4. или пометить как component-specific, если это локальный токен компонента.

## Следующий шаг

## Результат первого запуска

Первый запуск до нормализации:

```text
Known tokens: 1040
Component-specific refs: 460
Unknown refs: 41
```

После добавления semantic motion tokens в `tokens.json` и замены wildcard/status aliases:

```text
Known tokens: 1112
Component-specific refs: 460
Unknown refs: 0
```

### Группы unknown references

| Группа | Примеры | Вероятная причина | Рекомендация |
|---|---|---|---|
| Motion aliases | `duration/base`, `duration/moderate`, `duration/loading`, `easing/enter`, `easing/exit`, `easing/standard`, `easing/linear`, `easing/emphasized` | Motion foundation ввел semantic aliases, которых не было в `tokens.json`. | Выполнено: aliases добавлены в semantic Light/Dark modes. |
| Disabled wildcard | `status/disabled/*` | В specs использовался shorthand для группы disabled tokens. | Выполнено: заменено на конкретные `status/disabled/text`, `status/disabled/container`, `status/disabled/border`. |
| Status aliases | `status/error/container`, `status/*` | Старое или обобщенное имя status token. | Выполнено: заменено на `status/error/container/default` или обычный текст без token reference. |

### Файлы с unknown references

| Файл | Тема |
|---|---|
| `specs/feedback/modal.md` | motion aliases |
| `specs/feedback/toast.md` | motion aliases |
| `specs/inputs/toggle.md` | motion aliases, disabled wildcard |
| `specs/feedback/skeleton.md` | motion aliases |
| `specs/feedback/spinner.md` | motion aliases |
| `specs/feedback/alert.md` | motion aliases, status aliases |
| `specs/navigation/drawer.md` | motion aliases |
| `specs/actions/button.md` | disabled wildcard |
| `specs/actions/icon-button.md` | disabled wildcard |
| `specs/data-display/card.md` | disabled wildcard |
| `specs/data-display/tag.md` | disabled wildcard |
| `specs/inputs/*` | disabled wildcard in multiple inputs |
| `specs/overlays-layout/form.md` | status alias |

## Следующий шаг

После первого запуска нужно:

1. сохранить summary по количеству `known`, `component-specific`, `unknown`;
2. пройти unknown references по группам;
3. обновить `foundation/tokens.md` и component token tables;
4. затем подключить token audit к `tools/check-docs.ps1` как warning или error.

Рекомендуемый порядок:

1. Сначала решить motion aliases: выполнено.
2. Затем заменить `status/disabled/*` на конкретные semantic tokens: выполнено.
3. После этого проверить `status/error/container` и обновить Alert/Form: выполнено.
4. Повторить `tools/check-token-refs.ps1` до `Unknown refs: 0`: выполнено.
