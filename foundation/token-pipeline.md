# Token Pipeline

Token pipeline описывает, как `tokens.json` становится рабочими токенами для дизайна, кода и документации. Цель — один source of truth без ручного рассинхрона между Figma, CSS variables и markdown-таблицами.

---

## 1. Source of Truth

Основной источник токенов:

```text
tokens.json
```

Файл содержит коллекции, modes и значения токенов. Все публичные токены должны быть выводимы из него или явно описаны как component-specific draft tokens в component specs.

---

## 2. Слои токенов

Pipeline должен сохранять архитектуру из `foundation/tokens.md`:

| Layer | Назначение | Пример |
|---|---|---|
| Primitive | Базовые значения палитры, размеров, радиусов, теней. | `color/blue/500`, `radius/8` |
| Semantic | Роль в интерфейсе. | `text/primary`, `surface/page`, `border/default` |
| Component | Локальная роль компонента. | `button/primary/background/default` |
| Mode | Значение для light/dark/high-contrast. | `light`, `dark` |

Primitive tokens не используются напрямую в component specs, если для сценария есть semantic token.

---

## 3. Outputs

Минимальные выходы pipeline:

```text
tokens.json
  -> dist/tokens.css
  -> dist/tokens.light.css
  -> dist/tokens.dark.css
  -> dist/tokens.json
  -> docs generated token tables
  -> Figma variables sync notes
```

### CSS variables

CSS variables должны использовать стабильный prefix:

```css
:root {
  --seda-text-primary: #18191b;
  --seda-surface-page: #ffffff;
}
```

Mode-specific значения можно поставлять через selector:

```css
:root[data-theme="dark"] {
  --seda-text-primary: #f5f6f8;
  --seda-surface-page: #0f1115;
}
```

### JSON distribution

`dist/tokens.json` нужен для платформенных адаптеров, тестов и генерации документации. Он должен быть нормализован: без Figma-only metadata, с понятными `name`, `path`, `type`, `value`, `mode`, `description`, `deprecated`, `replacement`.

### Documentation tables

Markdown-таблицы в foundation не должны вручную переписывать значения токенов, если их можно сгенерировать. Ручной текст описывает правила применения; значения и mode mapping должны приходить из token source.

### Figma variables

Figma variables должны синхронизироваться с теми же слоями:

- collection: `Primitive`, `Semantic`, `Component`;
- modes: `Light`, `Dark`, optional `High contrast`;
- names: совпадают с public token names;
- deprecated tokens имеют description с replacement.

---

## 4. Naming Transform

Token path в документации:

```text
text/primary
button/primary/background/default
```

CSS variable:

```text
--seda-text-primary
--seda-button-primary-background-default
```

JSON path:

```json
{
  "path": ["button", "primary", "background", "default"],
  "name": "button/primary/background/default"
}
```

Правила:

- slash `/` в docs превращается в hyphen `-` в CSS;
- все имена lowercase;
- не использовать пробелы и camelCase в public token names;
- state всегда в конце имени, если токен state-specific.

---

## 5. Validation

Pipeline должен проверять:

| Check | Ошибка |
|---|---|
| Missing mode value | Токен есть в light, но отсутствует в dark. |
| Invalid reference | Токен ссылается на несуществующий primitive/semantic token. |
| Undocumented public token | Токен есть в source, но не попадает в docs. |
| Unknown token in specs | Spec ссылается на токен, которого нет в source или foundation docs. |
| Deprecated without replacement | Deprecated token не имеет replacement. |
| Component token without semantic mapping | Component token указывает raw value вместо semantic token. |
| Contrast pair failure | Text/background pair не проходит WCAG threshold. |

На раннем этапе проверки могут быть report-only. Для `ready` компонентов unknown token и missing mode value должны быть blocking.

---

## 6. Deprecation Metadata

Deprecated token должен иметь:

```json
{
  "deprecated": true,
  "replacement": "surface/page",
  "removeAfter": "2.0.0",
  "reason": "Layer model renamed background/default to surface/page."
}
```

Если token используется в specs, checker должен показывать предупреждение с replacement.

---

## 7. Versioning

Token release следует `foundation/governance.md`:

| Change | Version |
|---|---|
| Add new token | minor |
| Add new mode value | minor |
| Fix wrong value without semantic change | patch |
| Rename token | major |
| Remove token | major |
| Change semantic meaning | major |
| Change component sizing token | major, если влияет на layout |

---

## 8. Suggested Build Steps

1. Parse `tokens.json`.
2. Flatten collections and modes into token records.
3. Resolve references.
4. Validate required modes.
5. Generate CSS variables.
6. Generate normalized JSON.
7. Generate markdown tables or data files for docs.
8. Run docs checker against specs.
9. Produce report with warnings/errors.

---

## 9. Первый практический scope

Для ближайшей итерации достаточно:

1. добавить token extraction report;
2. проверить, какие token-like references встречаются в specs;
3. сравнить их с `tokens.json`;
4. выделить три группы:
   - known tokens;
   - component-specific draft tokens;
   - unknown / legacy tokens.

Это даст безопасную карту для следующей нормализации component token tables.
