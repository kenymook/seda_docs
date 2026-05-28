# Token Pipeline

Token pipeline РѕРїРёСЃС‹РІР°РµС‚, РєР°Рє `tokens.json` СЃС‚Р°РЅРѕРІРёС‚СЃСЏ СЂР°Р±РѕС‡РёРјРё С‚РѕРєРµРЅР°РјРё РґР»СЏ РґРёР·Р°Р№РЅР°, РєРѕРґР° Рё РґРѕРєСѓРјРµРЅС‚Р°С†РёРё. Р¦РµР»СЊ вЂ” РѕРґРёРЅ source of truth Р±РµР· СЂСѓС‡РЅРѕРіРѕ СЂР°СЃСЃРёРЅС…СЂРѕРЅР° РјРµР¶РґСѓ Figma, CSS variables Рё markdown-С‚Р°Р±Р»РёС†Р°РјРё.

---

## 1. Source of Truth

РћСЃРЅРѕРІРЅРѕР№ РёСЃС‚РѕС‡РЅРёРє С‚РѕРєРµРЅРѕРІ:

```text
tokens.json
```

Р¤Р°Р№Р» СЃРѕРґРµСЂР¶РёС‚ РєРѕР»Р»РµРєС†РёРё, modes Рё Р·РЅР°С‡РµРЅРёСЏ С‚РѕРєРµРЅРѕРІ. Р’СЃРµ РїСѓР±Р»РёС‡РЅС‹Рµ С‚РѕРєРµРЅС‹ РґРѕР»Р¶РЅС‹ Р±С‹С‚СЊ РІС‹РІРѕРґРёРјС‹ РёР· РЅРµРіРѕ РёР»Рё СЏРІРЅРѕ РѕРїРёСЃР°РЅС‹ РєР°Рє component-specific draft tokens РІ component specs.

---

## 2. РЎР»РѕРё С‚РѕРєРµРЅРѕРІ

Pipeline РґРѕР»Р¶РµРЅ СЃРѕС…СЂР°РЅСЏС‚СЊ Р°СЂС…РёС‚РµРєС‚СѓСЂСѓ РёР· `foundation/tokens.md`:

| Layer | РќР°Р·РЅР°С‡РµРЅРёРµ | РџСЂРёРјРµСЂ |
|---|---|---|
| Primitive | Р‘Р°Р·РѕРІС‹Рµ Р·РЅР°С‡РµРЅРёСЏ РїР°Р»РёС‚СЂС‹, СЂР°Р·РјРµСЂРѕРІ, СЂР°РґРёСѓСЃРѕРІ, С‚РµРЅРµР№. | `color/blue/50`, border/radius/m |
| Semantic | Р РѕР»СЊ РІ РёРЅС‚РµСЂС„РµР№СЃРµ. | `text/primary`, `surface/page`, `border/default` |
| Component | Р›РѕРєР°Р»СЊРЅР°СЏ СЂРѕР»СЊ РєРѕРјРїРѕРЅРµРЅС‚Р°. | `button/primary/solid/surface/default` |
| Mode | Р—РЅР°С‡РµРЅРёРµ РґР»СЏ light/dark/high-contrast. | `light`, `dark` |

Primitive tokens РЅРµ РёСЃРїРѕР»СЊР·СѓСЋС‚СЃСЏ РЅР°РїСЂСЏРјСѓСЋ РІ component specs, РµСЃР»Рё РґР»СЏ СЃС†РµРЅР°СЂРёСЏ РµСЃС‚СЊ semantic token.

---

## 3. Outputs

РњРёРЅРёРјР°Р»СЊРЅС‹Рµ РІС‹С…РѕРґС‹ pipeline:

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

CSS variables РґРѕР»Р¶РЅС‹ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ СЃС‚Р°Р±РёР»СЊРЅС‹Р№ prefix:

```css
:root {
  --seda-text-primary: <resolved-text-primary>;
  --seda-surface-page: <resolved-surface-page>;
}
```

Mode-specific Р·РЅР°С‡РµРЅРёСЏ РјРѕР¶РЅРѕ РїРѕСЃС‚Р°РІР»СЏС‚СЊ С‡РµСЂРµР· selector:

```css
:root[data-theme="dark"] {
  --seda-text-primary: <resolved-text-primary-dark>;
  --seda-surface-page: <resolved-surface-page-dark>;
}
```

### JSON distribution

`dist/tokens.json` РЅСѓР¶РµРЅ РґР»СЏ РїР»Р°С‚С„РѕСЂРјРµРЅРЅС‹С… Р°РґР°РїС‚РµСЂРѕРІ, С‚РµСЃС‚РѕРІ Рё РіРµРЅРµСЂР°С†РёРё РґРѕРєСѓРјРµРЅС‚Р°С†РёРё. РћРЅ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РЅРѕСЂРјР°Р»РёР·РѕРІР°РЅ: Р±РµР· Figma-only metadata, СЃ РїРѕРЅСЏС‚РЅС‹РјРё `name`, `path`, `type`, `value`, `mode`, `description`, `deprecated`, `replacement`.

### Documentation tables

Markdown-С‚Р°Р±Р»РёС†С‹ РІ foundation РЅРµ РґРѕР»Р¶РЅС‹ РІСЂСѓС‡РЅСѓСЋ РїРµСЂРµРїРёСЃС‹РІР°С‚СЊ Р·РЅР°С‡РµРЅРёСЏ С‚РѕРєРµРЅРѕРІ, РµСЃР»Рё РёС… РјРѕР¶РЅРѕ СЃРіРµРЅРµСЂРёСЂРѕРІР°С‚СЊ. Р СѓС‡РЅРѕР№ С‚РµРєСЃС‚ РѕРїРёСЃС‹РІР°РµС‚ РїСЂР°РІРёР»Р° РїСЂРёРјРµРЅРµРЅРёСЏ; Р·РЅР°С‡РµРЅРёСЏ Рё mode mapping РґРѕР»Р¶РЅС‹ РїСЂРёС…РѕРґРёС‚СЊ РёР· token source.

### Figma variables

Figma variables РґРѕР»Р¶РЅС‹ СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°С‚СЊСЃСЏ СЃ С‚РµРјРё Р¶Рµ СЃР»РѕСЏРјРё:

- collection: `Primitive`, `Semantic`, `Component`;
- modes: `Light`, `Dark`, optional `High contrast`;
- names: СЃРѕРІРїР°РґР°СЋС‚ СЃ public token names;
- deprecated tokens РёРјРµСЋС‚ description СЃ replacement.

---

## 4. Naming Transform

Token path РІ РґРѕРєСѓРјРµРЅС‚Р°С†РёРё:

```text
text/primary
button/primary/solid/surface/default
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
  "name": "button/primary/solid/surface/default"
}
```

РџСЂР°РІРёР»Р°:

- slash `/` РІ docs РїСЂРµРІСЂР°С‰Р°РµС‚СЃСЏ РІ hyphen `-` РІ CSS;
- РІСЃРµ РёРјРµРЅР° lowercase;
- РЅРµ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РїСЂРѕР±РµР»С‹ Рё camelCase РІ public token names;
- state РІСЃРµРіРґР° РІ РєРѕРЅС†Рµ РёРјРµРЅРё, РµСЃР»Рё С‚РѕРєРµРЅ state-specific.

---

## 5. Validation

Pipeline РґРѕР»Р¶РµРЅ РїСЂРѕРІРµСЂСЏС‚СЊ:

| Check | РћС€РёР±РєР° |
|---|---|
| Missing mode value | РўРѕРєРµРЅ РµСЃС‚СЊ РІ light, РЅРѕ РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚ РІ dark. |
| Invalid reference | РўРѕРєРµРЅ СЃСЃС‹Р»Р°РµС‚СЃСЏ РЅР° РЅРµСЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ primitive/semantic token. |
| Undocumented public token | РўРѕРєРµРЅ РµСЃС‚СЊ РІ source, РЅРѕ РЅРµ РїРѕРїР°РґР°РµС‚ РІ docs. |
| Unknown token in specs | Spec СЃСЃС‹Р»Р°РµС‚СЃСЏ РЅР° С‚РѕРєРµРЅ, РєРѕС‚РѕСЂРѕРіРѕ РЅРµС‚ РІ source РёР»Рё foundation docs. |
| Deprecated without replacement | Deprecated token РЅРµ РёРјРµРµС‚ replacement. |
| Component token without semantic mapping | Component token СѓРєР°Р·С‹РІР°РµС‚ raw value РІРјРµСЃС‚Рѕ semantic token. |
| Contrast pair failure | Text/background pair РЅРµ РїСЂРѕС…РѕРґРёС‚ WCAG threshold. |

РќР° СЂР°РЅРЅРµРј СЌС‚Р°РїРµ РїСЂРѕРІРµСЂРєРё РјРѕРіСѓС‚ Р±С‹С‚СЊ report-only. Р”Р»СЏ `ready` РєРѕРјРїРѕРЅРµРЅС‚РѕРІ unknown token Рё missing mode value РґРѕР»Р¶РЅС‹ Р±С‹С‚СЊ blocking.

---

## 6. Deprecation Metadata

Deprecated token РґРѕР»Р¶РµРЅ РёРјРµС‚СЊ:

```json
{
  "deprecated": true,
  "replacement": "surface/page",
  "removeAfter": "2.0.0",
  "reason": "Layer model renamed background/default to surface/page."
}
```

Р•СЃР»Рё token РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РІ specs, checker РґРѕР»Р¶РµРЅ РїРѕРєР°Р·С‹РІР°С‚СЊ РїСЂРµРґСѓРїСЂРµР¶РґРµРЅРёРµ СЃ replacement.

---

## 7. Versioning

Token release СЃР»РµРґСѓРµС‚ `foundation/governance.md`:

| Change | Version |
|---|---|
| Add new token | minor |
| Add new mode value | minor |
| Fix wrong value without semantic change | patch |
| Rename token | major |
| Remove token | major |
| Change semantic meaning | major |
| Change component sizing token | major, РµСЃР»Рё РІР»РёСЏРµС‚ РЅР° layout |

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

## 9. РџРµСЂРІС‹Р№ РїСЂР°РєС‚РёС‡РµСЃРєРёР№ scope

Р”Р»СЏ Р±Р»РёР¶Р°Р№С€РµР№ РёС‚РµСЂР°С†РёРё РґРѕСЃС‚Р°С‚РѕС‡РЅРѕ:

1. РґРѕР±Р°РІРёС‚СЊ token extraction report;
2. РїСЂРѕРІРµСЂРёС‚СЊ, РєР°РєРёРµ token-like references РІСЃС‚СЂРµС‡Р°СЋС‚СЃСЏ РІ specs;
3. СЃСЂР°РІРЅРёС‚СЊ РёС… СЃ `tokens.json`;
4. РІС‹РґРµР»РёС‚СЊ С‚СЂРё РіСЂСѓРїРїС‹:
   - known tokens;
   - component-specific draft tokens;
   - unknown / legacy tokens.

Р­С‚Рѕ РґР°СЃС‚ Р±РµР·РѕРїР°СЃРЅСѓСЋ РєР°СЂС‚Сѓ РґР»СЏ СЃР»РµРґСѓСЋС‰РµР№ РЅРѕСЂРјР°Р»РёР·Р°С†РёРё component token tables.

