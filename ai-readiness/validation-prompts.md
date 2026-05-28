# SEDA AI Validation Prompts

Validation prompts РїРѕРјРѕРіР°СЋС‚ РїСЂРѕРІРµСЂСЏС‚СЊ РєР°С‡РµСЃС‚РІРѕ AI-assisted Рё human-created Р°СЂС‚РµС„Р°РєС‚РѕРІ РІ SEDA AI. РС… Р·Р°РґР°С‡Р° вЂ” РІС‹СЏРІР»СЏС‚СЊ РЅРµСЃРѕРѕС‚РІРµС‚СЃС‚РІРёСЏ AI-ready design system framework РґРѕ С‚РѕРіРѕ, РєР°Рє РѕРЅРё РїРѕРїР°РґСѓС‚ РІ СЂР°Р·СЂР°Р±РѕС‚РєСѓ РёР»Рё production.

Validation РЅРµ СЏРІР»СЏРµС‚СЃСЏ Р·Р°РјРµРЅРѕР№ review РґРёР·Р°Р№РЅРµСЂР°, СЂР°Р·СЂР°Р±РѕС‚С‡РёРєР° РёР»Рё Р°РЅР°Р»РёС‚РёРєР°. AI РјРѕР¶РµС‚ СѓСЃРєРѕСЂРёС‚СЊ РїРѕРёСЃРє РЅР°СЂСѓС€РµРЅРёР№, missing states, token gaps Рё Handoff gaps, РЅРѕ РёС‚РѕРіРѕРІРѕРµ СЂРµС€РµРЅРёРµ Рѕ РєР°С‡РµСЃС‚РІРµ РїСЂРёРЅРёРјР°РµС‚ С‡РµР»РѕРІРµРє.

## Р¤РѕСЂРјР°С‚ СЂРµР·СѓР»СЊС‚Р°С‚Р° validation

РСЃРїРѕР»СЊР·СѓР№С‚Рµ РµРґРёРЅС‹Р№ С„РѕСЂРјР°С‚:

| Field | Description |
| --- | --- |
| Status | Pass, Pass with notes, Needs review, Fail |
| Severity | Low, Medium, High, Critical |
| Area | Foundation, Design Tokens, Components, UX Patterns, Documentation, Handoff, Governance, Validation, AI Layer |
| Finding | Р§С‚Рѕ РЅР°Р№РґРµРЅРѕ |
| Evidence | Р“РґРµ СЌС‚Рѕ РІРёРґРЅРѕ |
| Rule | РќР° РєР°РєРѕРµ РїСЂР°РІРёР»Рѕ РёР»Рё spec СЃСЃС‹Р»Р°РµС‚СЃСЏ РїСЂРѕРІРµСЂРєР° |
| Recommendation | Р§С‚Рѕ РёСЃРїСЂР°РІРёС‚СЊ |
| Human review | РўСЂРµР±СѓРµС‚СЃСЏ Р»Рё РїСЂРѕРІРµСЂРєР° С‡РµР»РѕРІРµРєРѕРј |

## Visual consistency validation

### Р§С‚Рѕ РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ

- Р’РёР·СѓР°Р»СЊРЅР°СЏ РёРµСЂР°СЂС…РёСЏ.
- Spacing Рё density.
- Typography scale.
- Р¦РІРµС‚РѕРІС‹Рµ СЂРѕР»Рё.
- Layout Рё alignment.
- РЎРѕРіР»Р°СЃРѕРІР°РЅРЅРѕСЃС‚СЊ states.
- РћС‚СЃСѓС‚СЃС‚РІРёРµ РґРµРєРѕСЂР°С‚РёРІРЅС‹С… СЌР»РµРјРµРЅС‚РѕРІ Р±РµР· С„СѓРЅРєС†РёРѕРЅР°Р»СЊРЅРѕР№ СЂРѕР»Рё.

### РљР°РєРёРµ РѕС€РёР±РєРё РёСЃРєР°С‚СЊ

- РќРµСЃРёСЃС‚РµРјРЅС‹Рµ РѕС‚СЃС‚СѓРїС‹.
- РЎРјРµС€РµРЅРёРµ СЂР°Р·РЅС‹С… РёРµСЂР°СЂС…РёР№ РЅР° РѕРґРЅРѕРј СЌРєСЂР°РЅРµ.
- РЎР»РёС€РєРѕРј РєСЂСѓРїРЅС‹Рµ Р·Р°РіРѕР»РѕРІРєРё РІРЅСѓС‚СЂРё СЂР°Р±РѕС‡РёС… РїР°РЅРµР»РµР№.
- РќРµРїРѕРґРґРµСЂР¶Р°РЅРЅС‹Рµ РІРёР·СѓР°Р»СЊРЅС‹Рµ variants.
- РћС‚Р»РёС‡РёСЏ РјРµР¶РґСѓ РїРѕС…РѕР¶РёРјРё СЌР»РµРјРµРЅС‚Р°РјРё Р±РµР· РїСЂРёС‡РёРЅС‹.

### РџСЂРёРјРµСЂ prompt

```text
РџСЂРѕРІРµСЂСЊ visual consistency СЌРєСЂР°РЅР° РІ СЂР°РјРєР°С… SEDA AI.
РСЃРїРѕР»СЊР·СѓР№ Foundation, Design Tokens, component specs Рё UX Pattern rules РєР°Рє source of truth.
РќР°Р№РґРё РЅРµСЃРѕРѕС‚РІРµС‚СЃС‚РІРёСЏ РІ hierarchy, spacing, typography, color roles, alignment, density Рё states.
РќРµ РїСЂРµРґР»Р°РіР°Р№ РЅРѕРІС‹Рµ РІРёР·СѓР°Р»СЊРЅС‹Рµ СЂРµС€РµРЅРёСЏ Р±РµР· СЃСЃС‹Р»РєРё РЅР° СЃСѓС‰РµСЃС‚РІСѓСЋС‰РµРµ РїСЂР°РІРёР»Рѕ.
Р’РµСЂРЅРё СЂРµР·СѓР»СЊС‚Р°С‚ РІ С„РѕСЂРјР°С‚Рµ Status / Severity / Area / Finding / Evidence / Rule / Recommendation / Human review.
```

### Р¤РѕСЂРјР°С‚ СЂРµР·СѓР»СЊС‚Р°С‚Р°

| Status | Severity | Area | Finding | Evidence | Rule | Recommendation | Human review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Needs review | Medium | Visual consistency | Р Р°Р·РЅС‹Рµ РѕС‚СЃС‚СѓРїС‹ РјРµР¶РґСѓ РѕРґРЅРѕС‚РёРїРЅС‹РјРё Р±Р»РѕРєР°РјРё | Section A uses 16px, Section B uses 24px | Spacing tokens | РџСЂРёРІРµСЃС‚Рё Рє semantic spacing token | Yes |

## Token validation

### Р§С‚Рѕ РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ

- РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ semantic Рё component tokens.
- РћС‚СЃСѓС‚СЃС‚РІРёРµ hardcoded values.
- РЎРѕРѕС‚РІРµС‚СЃС‚РІРёРµ token mapping РјРµР¶РґСѓ design Рё code.
- РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ Р°РєС‚СѓР°Р»СЊРЅС‹С… С‚РѕРєРµРЅРѕРІ.
- РљРѕСЂСЂРµРєС‚РЅРѕРµ РїСЂРёРјРµРЅРµРЅРёРµ platform-specific mappings.

### РљР°РєРёРµ РѕС€РёР±РєРё РёСЃРєР°С‚СЊ

- Р¦РІРµС‚Р°, spacing, radius РёР»Рё typography Р±РµР· С‚РѕРєРµРЅР°.
- РСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ primitive token С‚Р°Рј, РіРґРµ РЅСѓР¶РµРЅ semantic token.
- РЈСЃС‚Р°СЂРµРІС€РёР№ token.
- РќРµСЃРѕРѕС‚РІРµС‚СЃС‚РІРёРµ design token Рё code token.
- РўРѕРєРµРЅ РїСЂРёРјРµРЅРµРЅ РІРЅРµ СЃРІРѕРµР№ СЃРјС‹СЃР»РѕРІРѕР№ СЂРѕР»Рё.

### РџСЂРёРјРµСЂ prompt

```text
РџСЂРѕРІРµСЂСЊ Design Token usage РІ Р°СЂС‚РµС„Р°РєС‚Рµ SEDA AI.
РЎСЂР°РІРЅРё РІРёР·СѓР°Р»СЊРЅС‹Рµ Р·РЅР°С‡РµРЅРёСЏ СЃ token architecture Рё component token mapping.
РќР°Р№РґРё hardcoded values, РЅРµРІРµСЂРЅС‹Рµ semantic tokens, deprecated tokens Рё missing mappings.
Р”Р»СЏ РєР°Р¶РґРѕР№ РїСЂРѕР±Р»РµРјС‹ РїСЂРµРґР»РѕР¶Рё РєРѕСЂСЂРµРєС‚РЅС‹Р№ token name РёР»Рё РѕС‚РјРµС‚СЊ Open question, РµСЃР»Рё mapping РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚.
```

### Р¤РѕСЂРјР°С‚ СЂРµР·СѓР»СЊС‚Р°С‚Р°

| Token issue | Current value | Expected token | Severity | Recommendation |
| --- | --- | --- | --- | --- |
| Hardcoded color | <raw-color-value> | semantic.surface.default | High | Р—Р°РјРµРЅРёС‚СЊ РЅР° semantic token |

## Component usage validation

### Р§С‚Рѕ РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ

- РЎРѕРѕС‚РІРµС‚СЃС‚РІРёРµ Purpose.
- When to use / When not to use.
- Variants Рё props.
- States.
- Anatomy.
- Anti-patterns.
- РќР°Р»РёС‡РёРµ РѕР±СЏР·Р°С‚РµР»СЊРЅС‹С… СЌР»РµРјРµРЅС‚РѕРІ.

### РљР°РєРёРµ РѕС€РёР±РєРё РёСЃРєР°С‚СЊ

- РќРµРІРµСЂРЅС‹Р№ РєРѕРјРїРѕРЅРµРЅС‚ РґР»СЏ Р·Р°РґР°С‡Рё.
- РќРµРїРѕРґРґРµСЂР¶Р°РЅРЅС‹Р№ variant.
- РџСЂРѕРїСѓС‰РµРЅРЅС‹Р№ disabled, loading, error РёР»Рё focus state.
- РР·РѕР±СЂРµС‚РµРЅРЅС‹Р№ prop.
- РќРµРїСЂР°РІРёР»СЊРЅР°СЏ composition.

### РџСЂРёРјРµСЂ prompt

```text
РџСЂРѕРІРµСЂСЊ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ РєРѕРјРїРѕРЅРµРЅС‚РѕРІ SEDA AI РЅР° СЌРєСЂР°РЅРµ.
Р”Р»СЏ РєР°Р¶РґРѕРіРѕ РєРѕРјРїРѕРЅРµРЅС‚Р° СЃСЂР°РІРЅРё С„Р°РєС‚РёС‡РµСЃРєРѕРµ РїСЂРёРјРµРЅРµРЅРёРµ СЃ Purpose, When to use, When not to use, Variants, States, Props, Anatomy Рё Anti-patterns.
Р•СЃР»Рё РєРѕРјРїРѕРЅРµРЅС‚ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РІРЅРµ РїСЂР°РІРёР», СѓРєР°Р¶Рё Р°Р»СЊС‚РµСЂРЅР°С‚РёРІСѓ РёР· СЃСѓС‰РµСЃС‚РІСѓСЋС‰РµР№ СЃРёСЃС‚РµРјС‹ РёР»Рё РѕС‚РјРµС‚СЊ Need system review.
```

### Р¤РѕСЂРјР°С‚ СЂРµР·СѓР»СЊС‚Р°С‚Р°

| Component | Status | Issue | Severity | Recommended action |
| --- | --- | --- | --- | --- |
| Button | Fail | РСЃРїРѕР»СЊР·РѕРІР°РЅ РЅРѕРІС‹Р№ visual variant Р±РµР· spec | High | РСЃРїРѕР»СЊР·РѕРІР°С‚СЊ documented variant РёР»Рё РёРЅРёС†РёРёСЂРѕРІР°С‚СЊ system review |

## Accessibility validation

### Р§С‚Рѕ РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ

- Contrast.
- Focus visibility.
- Keyboard navigation.
- Semantic roles.
- Labels and descriptions.
- Error announcement.
- Touch target size.
- Reduced motion, РµСЃР»Рё РїСЂРёРјРµРЅРёРјРѕ.

### РљР°РєРёРµ РѕС€РёР±РєРё РёСЃРєР°С‚СЊ

- РќРµРґРѕСЃС‚Р°С‚РѕС‡РЅС‹Р№ contrast.
- РќРµС‚ visible focus.
- РРєРѕРЅРєР° Р±РµР· accessible label.
- Error message РЅРµ СЃРІСЏР·Р°РЅ СЃ field.
- Interaction РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РјС‹С€СЊСЋ.
- Dynamic state РЅРµ РѕР±СЉСЏРІР»СЏРµС‚СЃСЏ assistive technologies.

### РџСЂРёРјРµСЂ prompt

```text
РџСЂРѕРІРµСЂСЊ accessibility Р°СЂС‚РµС„Р°РєС‚Р° SEDA AI.
РћС†РµРЅРё contrast, focus, keyboard support, semantic roles, labels, error handling, touch targets Рё dynamic state announcements.
РЈРєР°Р¶Рё, РєР°РєРёРµ С‚СЂРµР±РѕРІР°РЅРёСЏ РјРѕР¶РЅРѕ РїСЂРѕРІРµСЂРёС‚СЊ РїРѕ РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅРЅС‹Рј РґР°РЅРЅС‹Рј, Р° РєР°РєРёРµ С‚СЂРµР±СѓСЋС‚ manual РёР»Рё technical review.
```

### Р¤РѕСЂРјР°С‚ СЂРµР·СѓР»СЊС‚Р°С‚Р°

| Requirement | Status | Evidence | Risk | Recommendation |
| --- | --- | --- | --- | --- |
| Focus visibility | Needs review | Focus state РЅРµ РїРѕРєР°Р·Р°РЅ | Keyboard users may lose context | Р”РѕР±Р°РІРёС‚СЊ focus state РІ spec Рё handoff |

## Handoff validation

### Р§С‚Рѕ РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ

- Component mapping.
- Props contract.
- Token mapping.
- States and edge cases.
- Responsive behavior.
- Platform differences.
- Acceptance criteria.
- Open questions.

### РљР°РєРёРµ РѕС€РёР±РєРё РёСЃРєР°С‚СЊ

- Handoff СЃРѕРґРµСЂР¶РёС‚ С‚РѕР»СЊРєРѕ РјР°РєРµС‚ Р±РµР· РєРѕРЅС‚СЂР°РєС‚Р°.
- РќРµС‚ props РёР»Рё code mapping.
- РќРµ РѕРїРёСЃР°РЅС‹ states.
- РќРµС‚ responsive rules.
- Acceptance criteria РЅРµРїСЂРѕРІРµСЂСЏРµРјС‹.
- Platform differences РЅРµ СѓРєР°Р·Р°РЅС‹.

### РџСЂРёРјРµСЂ prompt

```text
РџСЂРѕРІРµСЂСЊ handoff notes РґР»СЏ SEDA AI.
РЈР±РµРґРёСЃСЊ, С‡С‚Рѕ РѕРЅРё РІРєР»СЋС‡Р°СЋС‚ design-to-code mapping, component props, token mapping, states, edge cases, responsive behavior, platform differences, accessibility Рё acceptance criteria.
Р’СЃРµ РЅРµРґРѕСЃС‚Р°СЋС‰РёРµ С‡Р°СЃС‚Рё РѕС„РѕСЂРјРё РєР°Рє blockers РёР»Рё open questions.
```

### Р¤РѕСЂРјР°С‚ СЂРµР·СѓР»СЊС‚Р°С‚Р°

| Handoff area | Status | Missing information | Impact | Next step |
| --- | --- | --- | --- | --- |
| States | Fail | Error and loading states missing | Implementation may be incomplete | Р”РѕР±Р°РІРёС‚СЊ state matrix РґРѕ СЂР°Р·СЂР°Р±РѕС‚РєРё |

## AI output validation

### Р§С‚Рѕ РїСЂРѕРІРµСЂСЏРµС‚СЃСЏ

- AI РёСЃРїРѕР»СЊР·РѕРІР°Р» РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅРЅС‹Р№ РєРѕРЅС‚РµРєСЃС‚.
- AI РЅРµ РїСЂРёРґСѓРјР°Р» РЅРѕРІС‹Рµ tokens, props, variants РёР»Рё components.
- AI СѓРєР°Р·Р°Р» РЅРµРѕРїСЂРµРґРµР»РµРЅРЅРѕСЃС‚Рё.
- AI СЃРѕСЃР»Р°Р»СЃСЏ РЅР° specs РёР»Рё rules.
- AI output РјРѕР¶РЅРѕ РїСЂРѕРІРµСЂРёС‚СЊ С‡РµР»РѕРІРµРєРѕРј.
- AI РЅРµ РїРѕРґРјРµРЅРёР» product decision.

### РљР°РєРёРµ РѕС€РёР±РєРё РёСЃРєР°С‚СЊ

- РЈРІРµСЂРµРЅРЅС‹Рµ СѓС‚РІРµСЂР¶РґРµРЅРёСЏ Р±РµР· РёСЃС‚РѕС‡РЅРёРєР°.
- РќРѕРІС‹Рµ СЌР»РµРјРµРЅС‚С‹ СЃРёСЃС‚РµРјС‹ Р±РµР· review.
- РћС‚СЃСѓС‚СЃС‚РІРёРµ СЂРёСЃРєРѕРІ Рё open questions.
- РЎРјРµС€РµРЅРёРµ system rules Рё РїСЂРµРґРїРѕР»РѕР¶РµРЅРёР№.
- РќРµРїСЂРѕРІРµСЂСЏРµРјС‹Рµ СЂРµРєРѕРјРµРЅРґР°С†РёРё.

### РџСЂРёРјРµСЂ prompt

```text
РџСЂРѕРІРµСЂСЊ AI-generated output РЅР° СЃРѕРѕС‚РІРµС‚СЃС‚РІРёРµ SEDA AI.
РћРїСЂРµРґРµР»Рё, РіРґРµ AI РѕРїРёСЂР°РµС‚СЃСЏ РЅР° РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅРЅС‹Рµ rules, Р° РіРґРµ РґРµР»Р°РµС‚ РїСЂРµРґРїРѕР»РѕР¶РµРЅРёСЏ.
РќР°Р№РґРё invented Design Tokens, Components, variants, props, unsupported UX Patterns Рё missing human review points.
Р’РµСЂРЅРё СЃРїРёСЃРѕРє findings СЃ severity Рё required action.
```

### Р¤РѕСЂРјР°С‚ СЂРµР·СѓР»СЊС‚Р°С‚Р°

| Finding | Evidence | Risk | Severity | Required action |
| --- | --- | --- | --- | --- |
| Invented prop | AI suggested `visualMode="hero"` | Component contract may be broken | High | РЈРґР°Р»РёС‚СЊ prop РёР»Рё РѕС‚РїСЂР°РІРёС‚СЊ РЅР° system review |

