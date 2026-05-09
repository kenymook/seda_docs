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

### Changed

- План улучшений SEDA AI доведен до этапа governance/tooling.
- `tools/check-docs.ps1` расширен проверкой coverage между `foundation/components.md` и `specs/`.
- `tokens.json` дополнен semantic motion tokens `duration/*` и `easing/*`.
- Unknown token references в specs нормализованы до `0`.

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
