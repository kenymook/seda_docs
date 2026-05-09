# План нормализации token references

Дата: 2026-05-09  
Основание: `reports/token-reference-audit.md`

## 1. Цель

Свести unknown token references к нулю, не ломая смысл component specs. После этого token audit можно будет подключить к quality gate.

## 2. Текущий статус

| Метрика | Количество |
|---|---:|
| Known token references | 1112 |
| Component-specific refs | 460 |
| Unknown refs | 0 |

## 3. Приоритеты

### P0. Motion aliases

Проблема: specs используют `duration/base`, `duration/moderate`, `duration/loading`, `easing/enter`, `easing/exit`, `easing/standard`, `easing/linear`, `easing/emphasized`, но эти aliases не найдены в `tokens.json`.

Варианты решения:

1. Добавить эти aliases в `tokens.json` как semantic motion tokens.
2. Или заменить specs на существующие токены из token source.

Рекомендация: добавить semantic motion aliases, потому что они уже описаны в `foundation/motion.md` и удобны для component specs.

Статус: выполнено. Semantic motion aliases добавлены в `tokens.json`.

Затронутые specs:

- `specs/feedback/modal.md`
- `specs/feedback/toast.md`
- `specs/inputs/toggle.md`
- `specs/feedback/skeleton.md`
- `specs/feedback/spinner.md`
- `specs/feedback/alert.md`
- `specs/navigation/drawer.md`

### P1. Disabled wildcard

Проблема: `status/disabled/*` используется как shorthand, но wildcard не является реальным token path.

Рекомендация: заменить wildcard на конкретные semantic tokens:

| Shorthand | Замена по смыслу |
|---|---|
| `status/disabled/*` for text | `text/disabled` |
| `status/disabled/*` for border | `border/disabled` |
| `status/disabled/*` for background | `container/disabled` или актуальный disabled surface token |

Статус: выполнено. Wildcard заменен на `status/disabled/text`, `status/disabled/container`, `status/disabled/border`.

### P2. Status aliases

Проблема: `status/error/container` и `status/*` выглядят как старые или обобщенные token names.

Рекомендация:

1. проверить фактические `status/error/*` tokens в `tokens.json`;
2. заменить `status/error/container` на актуальный token;
3. заменить `status/*` в Color Picker на текстовое описание группы, если это не конкретная ссылка.

Статус: выполнено.

## 4. Definition of Done

Нормализация считается завершенной, когда:

```text
powershell -ExecutionPolicy Bypass -File tools\check-token-refs.ps1
```

показывает:

```text
Unknown refs: 0
```

Статус: выполнено.

После этого можно:

- подключить token audit в `tools/check-docs.ps1`;
- сделать unknown token refs blocking для `ready` specs;
- оставить component-specific refs как warning, если у них нет semantic mapping.
