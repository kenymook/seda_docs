# Release Checklist

Last updated: 2026-06-12  
Scope: SEDA AI design system docs, Figma library, tokens, portal health, and AI-readiness artifacts.

Use this checklist before calling any design-system change complete. It is intentionally stricter than the green portal scan: release readiness requires documentation, Figma, tokens, accessibility, handoff, and governance to agree.

## Release Gate Summary

| Gate | Required artifact | Status for current work |
|---|---|---|
| Spec ownership | `Owner`, `Status`, `Last reviewed` in each production spec | Done: 52 production specs are owned by Kenymook and marked `ready`; Button Social removed as standalone spec |
| Figma traceability | Real Figma node links in each production spec | Done for 52 production specs |
| Component registry | Spec -> Figma node -> inventory match map | Done: `reports/component-registry.md` |
| Fresh Component Scan | Updated `portal/docs-site/figma-components.json` | Done: latest scan `2026-06-12T16:52:43.458Z` captures Button System, IconButton visual alignment, Tag rebinding, Button Social removal, and Notification Center retry Button delta |
| Portal health | `portal/docs-site/health.json` after scan | Done: `score=100`, `matchedSpecs=52`, `readySpecs=52`, `invalidReferences=0`, `missingInFigma=0`, `needsNaming=0`, `actionPlan.total=0` |
| Visual QA | Screenshot or live inspection for changed components | Notification Center retry Button validated live; IconButton live token validation matches Button |
| Code mapping | Code Connect or equivalent component mapping | Priority plan, Wave 1 mapping review, canonical package decision, verified Wave 1 scaffold, and Badge/Tag/Alert/Toast Wave 2 exports done; Figma Code Connect blocked by Developer seat / Organization or Enterprise access |
| Validation workflow | Pass/fail prompts for review gates | Done: `reports/validation-workflow.md` |
| Changelog | `CHANGELOG.md` entry for release-impacting changes | Done: Unreleased records specs, Figma, portal, reports, Button System, Button Social removal, and package scaffold changes |

## 1. Scope Lock

- [x] List changed specs, Figma components, tokens, portal files, and reports.
- [x] Mark whether the release is documentation-only, Figma-only, token-impacting, or code-impacting.
- [x] Identify breaking changes using `foundation/governance.md`.
- [x] Confirm whether any current users depend on the changed Figma library or code package.
- [x] Record open decisions that are intentionally deferred.

Current scope summary:

- Docs/specs: production specs are owned by Kenymook and marked `ready`; `Button Social` standalone spec was removed; `Button System` was added as one system spec.
- Figma: latest scan captures Button System naming, IconButton visual-token alignment, Tag rebinding, Button Social removal, Badge tone expansion, and Notification Center retry Button delta.
- Portal/reports: health model treats `Button System` as a system spec; aliases map `Button` and `Icon Button` to `Button / Button` and `Button / IconButton`.
- Code: `packages/seda-ui` Wave 1 scaffold exists for Button, IconButton, Link, TextField, Select, Checkbox, Radio, and Toggle; Wave 2 now includes Badge, Tag, Alert, and Toast exports.
- Breaking/migration note: provider auth should use Button and Button Group instead of standalone Button Social components. Current user impact is low because this design system is not yet used by downstream consumers.
- Deferred decisions: real Code Connect mappings and retrieval tests are deferred until Figma Developer seat / Organization or Enterprise access is available.

## 2. Documentation Gate

- [x] Every changed spec has `Owner`, `Status`, `Last reviewed`, and real Figma link.
- [x] Component anatomy, variants, states, behavior, accessibility, tokens, code mapping, handoff, acceptance criteria, AI rules, examples, and anti-patterns are present.
- [x] No production spec uses placeholder Figma links.
- [x] New or changed component APIs are reflected in `reports/component-registry.md`.
- [x] `reports/component-maturity-matrix.md` reflects the current blocker/backlog state.

## 3. Figma Gate

- [x] Run SEDA Docs plugin -> Component Scan.
- [x] Save the scan into `portal/docs-site/figma-components.json`.
- [x] Confirm saved scan captures the main API/visual deltas:
  - [x] Button System
  - [x] Top Bar
  - [x] Chat Bubble variant/API deltas
  - [x] File Upload variant/API/readability deltas
  - [x] Notification Center state/content deltas
- [x] Confirm final Component Scan captured live Figma fixes:
  - [x] Chat Bubble `textWithoutStyle=0`
  - [x] File Upload `textWithoutStyle=0`
  - [x] Notification Center `textWithoutStyle=0`
  - [x] Badge has `tone=neutral|brand|info|success|warning|danger|ai|disabled`
- [x] Run final Component Scan for Notification Center retry Button delta:
  - [x] Error variants contain Button instance `Retry loading`
  - [x] No `retry-action-label` plain text remains
- [x] Component Scan for IconButton visual-token alignment:
  - [x] Live IconButton root fill matches Button for all 144 combinations
  - [x] Live IconButton root stroke matches Button for all 144 combinations
  - [x] Live IconButton icon/spinner fill matches Button for all 144 combinations
  - [x] Live IconButton focus ring matches Button for all focus combinations
  - [x] Saved scan has 144 IconButton variants
  - [x] Saved scan has `variant=primary|secondary|outline|ghost|text|destruction`
  - [x] Saved scan has `state=default|hover|active|loading|focus|disabled`
  - [x] Saved scan captures post-scan visual-token alignment
- [x] Check that changed component variant counts and public properties match specs.
- [x] Run Component Scan after live Tag token rebinding:
  - [x] `Tag / Interactive` old `surface/base` fills rebound to `tag/surface/neutral`
  - [x] `Tag / Interactive` old `focus/base` focus strokes rebound to `tag/focus/ring`
  - [x] `Tag / Selectable` old `focus/base` focus strokes rebound to `tag/focus/ring`
  - [x] Saved scan reflects updated Tag quality scores
- [x] Run Component Scan after Button Social removal/deprecation:
  - [x] `_Deprecated/Button Social` hidden live in Figma
  - [x] `_Deprecated/Button Social Group` hidden live in Figma
  - [x] Saved scan no longer treats Button Social as a production component
- [ ] Inspect screenshots for changed components and document any remaining visual QA risk.

Visual QA note: saved scan and live validations are green for the changed high-risk items, including IconButton token alignment and Notification Center retry Button instances. Manual screenshot review remains recommended before a public design-system release, but it is not blocking this pre-Code-Connect baseline commit.

## 4. Portal Health Gate

After latest Component Scan:

- [x] Start docs portal if needed:

```bash
.local/node/bin/node portal/docs-site/server.js
```

- [x] Check health:

```bash
curl -sS http://127.0.0.1:4173/docs-site/health.json
```

- [x] Expected release baseline:
  - [x] `score=100`
  - [x] `warnings=0` or documented accepted warnings
  - [x] `invalidReferences=0`
  - [x] `matchedSpecs=52`
  - [x] `qualityIssues=0`
  - [x] `missingInFigma=0`
  - [x] `needsNaming=0`
  - [x] `actionableSemanticTotal=0`
  - [x] `actionPlan.total=0`

## 5. Token Gate

- [x] Token references in changed specs exist in `tokens.json`.
- [x] Component tokens are preferred for component internals.
- [x] Semantic tokens are used only where component tokens are unavailable and the gap is documented.
- [x] No raw colors, spacing, radius, shadows, or typography values are introduced without review.
- [x] Token gaps are listed in the affected spec and maturity matrix if release-blocking.

## 6. Accessibility And Content Gate

- [x] Keyboard/focus behavior is described for interactive changes.
- [x] Error, loading, empty, disabled, and read-only states have readable text or accessible labels.
- [x] Icon-only actions have accessible names.
- [x] AI/system/generated content is labelled where trust or review requires it.
- [x] Microcopy follows `foundation/content.md`.

## 7. Handoff And Code Mapping Gate

- [x] `reports/component-registry.md` contains the changed component and current Figma node id.
- [x] Code props in specs match the public Figma API or explicitly document the design/code split.
- [x] Priority changed components have Code Connect mapping or a tracked mapping gap.
- [x] Canonical code package exists at `packages/seda-ui`; `reports/code-connect-plan.md` names the remaining Figma Code Connect access blocker and priority waves.
- [x] Handoff notes include states, token gaps, responsive behavior, accessibility, and open questions.
- [x] Any implementation-breaking change has migration notes.

## 8. Changelog Gate

- [x] Add `CHANGELOG.md` entry under `Unreleased`.
- [x] Use categories: `Added`, `Changed`, `Deprecated`, `Breaking`.
- [x] Mention Figma API changes, token changes, component spec changes, portal/report changes, and migration notes.
- [x] For breaking changes, include reason, impacted components, and migration path.

## 9. Validation Gate

- [x] Use `reports/validation-workflow.md` for scan, component, token, accessibility, handoff, Code Connect, and AI output review.
- [x] High/Critical findings block release unless explicitly accepted by owner.
- [x] Validation output uses Status / Severity / Area / Finding / Evidence / Rule / Recommendation / Human review.

## 10. Release Decision

| Result | Meaning |
|---|---|
| `Pass` | All gates complete, no release-blocking risks. |
| `Pass with notes` | Minor non-blocking gaps are documented with owners. |
| `Needs review` | Human decision required before release. |
| `Fail` | Release should not proceed. |

Current recommended result: `Pass with notes` for the pre-Code-Connect baseline. Public release still requires manual screenshot review and real Code Connect mappings once Figma access is available.
