# Validation Workflow

Last updated: 2026-06-12  
Source prompts: `ai-readiness/validation-prompts.md`, `ai-readiness/prompt-library.md`  
Release gate: `reports/release-checklist.md`

This workflow turns SEDA AI validation prompts into a repeatable review process for human-created and AI-assisted artifacts. It defines when to validate, what evidence to provide, what pass/fail output is required, and which findings block release.

## Required Result Format

Every validation run must return this table shape, matching `ai-readiness/validation-prompts.md`:

| Status | Severity | Area | Finding | Evidence | Rule | Recommendation | Human review |
|---|---|---|---|---|---|---|---|
| Pass / Pass with notes / Needs review / Fail | Low / Medium / High / Critical | Foundation / Design Tokens / Components / UX Patterns / Documentation / Handoff / Governance / Validation / AI Layer | What was found | Specific file, Figma node, screenshot, token, prop, or rule | Source rule/spec | Concrete fix | Yes / No |

## Workflow Stages

| Stage | When to run | Inputs | Prompt source | Blocking result |
|---|---|---|---|---|
| 1. Scope validation | Before changing specs/Figma/code | Change summary, affected components, registry rows | Consistency Risk Analysis | High/Critical unresolved scope risk |
| 2. Component usage validation | When reviewing a screen/component composition | Screenshot or Figma node, component list, relevant specs | Component Usage Validation | Unsupported component/variant without system review |
| 3. Token validation | After Figma or CSS/token changes | `tokens.json`, changed spec token tables, Figma scan quality output | Token Usage Check | Invalid token refs, raw values, missing token mapping |
| 4. Visual consistency validation | After Figma visual changes | Screenshot, Figma node id, foundation rules | Visual consistency validation | Layout, hierarchy, state, or density issue that changes meaning/usability |
| 5. Accessibility validation | Before marking component/screen ready | Spec, screenshot, interaction notes, ARIA/keyboard notes | Accessibility validation | Missing focus, keyboard path, accessible label, readable error/loading state |
| 6. Handoff validation | Before implementation or Code Connect | Component registry row, code props, token mapping, states | Handoff validation | Missing props, states, token gaps, responsive behavior, acceptance criteria |
| 7. AI output validation | After any AI-generated design/spec/handoff output | AI output, provided context, source rules | AI output validation | Invented token/component/variant/prop, unsupported confidence, missing human review |
| 8. Release validation | Before commit/release | `reports/release-checklist.md`, scan, health JSON, changelog | Acceptance Criteria from System Rules | Any release checklist blocker remains open |

## Current SEDA AI Validation Gates

| Gate | Status | Evidence |
|---|---|---|
| Component registry available | Pass | `reports/component-registry.md` maps 52 production specs to Figma nodes. |
| Release checklist available | Pass | `reports/release-checklist.md` defines scan/health/docs/token/accessibility/handoff gates. |
| Code Connect plan available | Pass with notes | `reports/code-connect-plan.md`; canonical package and Wave 1 review are ready, real mappings are blocked by Figma Code Connect access. |
| Fresh Figma scan | Pass | `portal/docs-site/figma-components.json` generated at `2026-06-12T16:52:43.458Z`; Button System, IconButton visual-token alignment, Tag rebinding, Button Social removal, and Notification Center retry Button delta are captured with score `100`, unstyled text `0`, raw paints `0`, and audit warnings `0`. |
| Portal health after latest saved scan | Pass | Health rerun at `2026-06-12T17:01:58.993Z`: `score=100`, `matchedSpecs=52`, `readySpecs=52`, `invalidReferences=0`, `missingInFigma=0`, `needsNaming=0`, `actionPlan.total=0`. |
| Token references | Pass | Portal health reports `invalidReferences=0` after normalizing Chat Bubble error status to `status/danger/text`. |
| Live Figma text-style validation | Pass | Chat Bubble, File Upload, and Notification Center all return `unstyledCount=0` in live Figma validation. |
| Live Badge tone validation | Pass | Badge returns 256 variants, `tone` axis with 8 values, duplicate count 0, raw paint count 0, and unstyled text count 0. |
| Live Notification Center retry validation | Pass | All 8 error variants contain one Button instance `Retry loading`, no old `retry-action-label`, unstyled text `0`, raw paints `0`. |
| Live IconButton API validation | Pass | Saved scan confirms `Button / IconButton` with 144 Button-compatible variants, score `100`, unstyled text `0`, raw fills/strokes `0`, and audit warnings `0`; post-scan live validation confirms visual token alignment with Button, mismatch count `0`. |
| Production specs have real Figma links | Pass | 52 production specs checked after Button Social removal. |
| Production specs marked `ready` | Pass | All 52 production specs are marked `ready` after the Kenymook owner approval pass. |

## Severity Rules

| Severity | Use when | Release impact |
|---|---|---|
| Critical | Accessibility, data-loss, destructive-action, security/privacy, or misleading AI authorship risk. | Blocks release. |
| High | Unsupported component API, invalid token mapping, missing required state, broken Figma/spec/code traceability. | Blocks release unless explicit owner exception exists. |
| Medium | Visual/state/content issue that affects clarity but has a known workaround. | Needs owner review; may ship with documented note. |
| Low | Documentation wording, example, or non-blocking cleanup issue. | Does not block release if tracked. |

## Validation Prompts To Use

### Component Change Review

```text
Validate this SEDA AI component change.
Use the component spec, reports/component-registry.md, reports/release-checklist.md, tokens.json, and the Figma scan as source of truth.
Check component usage, public API, states, tokens, accessibility, handoff, and AI-readiness.
Return findings in the required Status / Severity / Area / Finding / Evidence / Rule / Recommendation / Human review table.
Do not invent tokens, props, variants, or components.
```

### Figma Scan Review

```text
Validate the latest SEDA AI Component Scan.
Compare portal/docs-site/figma-components.json with reports/component-registry.md, reports/component-maturity-matrix.md, and the changed component specs.
Confirm changed components are captured, variant counts and public properties match specs, and quality issues are either zero or covered by accepted exceptions.
Return blockers, warnings, and pass/fail result using the required validation table.
```

### Handoff / Code Connect Review

```text
Validate SEDA AI handoff and Code Connect readiness for the selected component.
Use reports/component-registry.md, reports/code-connect-plan.md, the component spec, and the canonical code source.
Check Figma node, source path, export name, prop mapping, variant values, token gaps, accessibility props, and example quality.
If canonical source is missing, mark the result Needs review and list the exact missing input.
```

### AI Output Review

```text
Validate this AI-generated SEDA AI artifact.
Check whether the AI used only provided specs, tokens, Figma data, registry rows, and release checklist rules.
Find invented tokens, components, props, variants, unsupported visual decisions, missing uncertainty, and missing human review.
Return each finding with severity, evidence, source rule, recommendation, and whether human review is required.
```

## Done Criteria

Validation workflow is considered active when:

- [ ] This workflow is referenced by release checklist and maturity matrix.
- [ ] Fresh Component Scan validation uses the Figma Scan Review prompt.
- [ ] Each Code Connect mapping uses the Handoff / Code Connect Review prompt before being marked complete.
- [ ] Any AI-generated spec/design/handoff output is checked with AI Output Review.
- [ ] High/Critical findings block release unless explicitly accepted by owner.
