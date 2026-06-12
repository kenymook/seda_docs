# Changelog

Все заметные изменения SEDA AI фиксируются в этом файле.

Формат следует идее Keep a Changelog, а типы версий описаны в `foundation/governance.md`.

---

## Unreleased

### Added

- Добавлен `foundation/governance.md` с lifecycle, versioning, deprecation policy и readiness checklist.
- Добавлен `foundation/token-pipeline.md` с правилами поставки токенов из `tokens.json` в CSS, docs и Figma variables.
- Добавлен `tools/check-token-refs.ps1`, `reports/token-reference-audit.md` и `reports/token-normalization-plan.md` для первичного аудита token references в specs.
- Добавлен `specs/inputs/color-picker.md` как draft для закрытия пробела в Inputs & Forms.
- Добавлены `reports/seda-docs-inventory.md` и `reports/component-maturity-matrix.md` для управления component cleanup.
- Добавлены `reports/component-registry.md` и `reports/release-checklist.md` как AI-ready handoff/release gate для component registry, scan, health, Code Connect и changelog readiness.
- Добавлен `reports/code-connect-plan.md` с приоритетными Wave 1-3 mapping targets и явным blocker: нужен canonical production component package перед созданием `.figma.ts` mappings.
- Добавлен `reports/validation-workflow.md` с pass/fail validation stages для scan review, component usage, token usage, visual QA, accessibility, handoff, Code Connect и AI output review.
- Добавлен `reports/canonical-code-package-plan.md` с решением по canonical production package: `@seda-ai/ui` at `packages/seda-ui`, React first, exports из `packages/seda-ui/src/index.ts`.

### Changed

- План улучшений SEDA AI доведен до этапа governance/tooling.
- Production component specs переведены в статус `ready` под owner `Kenymook`; после удаления standalone Button Social production scope содержит 52 specs.
- Code Connect Plan обновлен: blocker уточнен с неизвестного package path на реализацию `packages/seda-ui` Wave 1 components.
- Figma scan обновлен до `2026-06-12T16:52:43.458Z`; Button System, IconButton visual-token alignment, Tag rebinding, Button Social removal и Notification Center retry Button delta captured, score `100`, unstyled text `0`, raw paints `0`, audit warnings `0`.
- Создан и проверен `packages/seda-ui` Wave 1 scaffold для `@seda-ai/ui`: Button, IconButton, Link, TextField, Select, Checkbox, Radio и Toggle с typed props, native semantics и token-driven CSS. TypeScript validation проходит через локальный Node: `.local/node/bin/node packages/seda-ui/node_modules/typescript/bin/tsc --noEmit -p packages/seda-ui/tsconfig.json`.
- Code Connect access checked through Figma MCP; real mappings are blocked until a Figma Developer seat in an Organization or Enterprise plan is available.
- Добавлен `reports/code-connect-wave1-mapping-review.md`; Wave 1 mapping review готовит Figma prop -> `@seda-ai/ui` prop mapping и фиксирует восстановленный IconButton Button-compatible API.
- IconButton в Figma восстановлен live до Button-compatible API и captured in scan `2026-06-12T16:52:43.458Z`: 144 variants, `variant=primary|secondary|outline|ghost|text|destruction`, `state=default|hover|active|loading|focus|disabled`, score `100`, unstyled text `0`, raw fills/strokes `0`; visual-token alignment с Button подтвержден.
- Добавлен `specs/actions/button-system.md`; Figma component sets переименованы в shared namespace `Button / Button` и `Button / IconButton` без объединения sets и без изменения variant matrices.
- В Figma исправлены token bindings для `Tag / Interactive` и `Tag / Selectable`: старые direct semantic `surface/base` и `focus/base` заменены на component tokens `tag/surface/neutral` и `tag/focus/ring`; scan подтверждает score `100`.
- Удален standalone production spec `Button Social`; Figma sets `Button Social` и `Button Social Group` скрыты как `_Deprecated/*`. Provider auth сценарии теперь собираются через `Button` и `Button Group` с approved provider logo artwork.
- `tools/check-docs.ps1` расширен проверкой coverage между `foundation/components.md` и `specs/`.
- `tokens.json` дополнен semantic motion tokens `duration/*` и `easing/*`.
- Unknown token references в specs нормализованы до `0`.
- `foundation/introducing.md`, `foundation/component-anatomy.md` и `foundation/validation-model.md` переписаны как полноценные foundation-разделы для подготовки 1.0.
- `tools/check-docs.ps1` получил severity modes: blocking errors отдельно от Figma URL warnings.
- Добавлен `reports/seda-designer-1-0-plan.md`; token export перенесен из ближайшего scope в post-1.0 developer/system operations backlog.
- Figma readiness reports обновлены по скану `2026-06-12T16:52:43.458Z`; Button System, Tag, Top Bar, Chat Bubble, File Upload, Notification Center и Badge подтверждены чистыми.
- Portal health rerun после удаления Button Social и классификации `Button System` как system spec: `score=100`, `matchedSpecs=52`, `readySpecs=52`, `invalidReferences=0`, `missingInFigma=0`, `needsNaming=0`, `actionPlan.total=0`.
- `Button / IconButton` live visual bindings синхронизированы со matching `Button / Button` variants по root fill, root stroke, icon/spinner fill и focus ring; validation mismatch count `0`.
- `specs/data-display/chat-bubble.md` нормализован с `status/error/text` на существующий semantic token `status/danger/text`, поэтому portal health снова показывает `invalidReferences=0`.
- Badge в Figma расширен до 256 variants с новым semantic axis `tone=neutral|brand|info|success|warning|danger|ai|disabled`; `specs/data-display/badge.md` и readiness reports обновлены под это решение.
- Canonical Link node обновлен на normalized component set `1276:11371`; legacy Link set `4071:74` оставлен как migration/alias review item.
- Notification Center error state captured in scan: `Retry loading` является Button instance во всех 8 error variants, а не plain text label.
- `packages/seda-ui` расширен Wave 2 exports: добавлены `Badge` и `Tag` с typed props, accessibility contract, token-driven CSS и проверкой TypeScript.
- В `packages/seda-ui` добавлен `Alert` как Wave 2 feedback primitive с typed props, role/live-region defaults, action/dismiss support и token-driven CSS.

### Deprecated

- Пока нет.

### Breaking

- Пока нет.

---

## 2026-05-09

### Added

- Добавлены foundation-документы: typography, tokens, color, radius-border, elevation, motion, content, iconography.
- Расширены accessibility и spacing/layout foundations.

### Changed

- Button, Text Field и Modal сверены с accessibility foundation.
- Motion rules синхронизированы с Drawer, Alert, Toggle, Skeleton, Spinner, Toast и Modal.
- Content rules синхронизированы с Button, Text Field и Empty State.
- Iconography rules синхронизированы с Button, Icon Button и Text Field.

### Breaking

- Нет.
