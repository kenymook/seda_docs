import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createContractEngine, createFormState, transitionForm, mergeDescriptionIds, ContractValidationError } from '../src/index.mjs';

const engine = createContractEngine();
const copy = () => structuredClone(engine.bundle);
const field = { label: 'Название', value: '', onChange: { $handler: 'form.change' } };
const has = (result, code) => result.issues.some(issue => issue.code === code);

test('C01/R07: valid contracts retire implemented D16 while keeping browser evidence separate', () => {
  const report = engine.validate();
  assert.equal(report.valid, true, JSON.stringify(report.issues));
  assert.equal(report.issues.length, 0);
  assert.deepEqual(report.planned, []);
  assert.equal(report.deferredChecks.length, 39);
  assert.ok(report.deferredChecks.every(item => item.status === 'not-checked'));
  assert.equal(report.runtimeConformance, 'not-checked');
});

test('C01: malformed roots and unknown nested fields produce structured errors', () => {
  for (const value of [null, [], 2, 'wrong']) assert.equal(engine.validate(value).valid, false);
  const unknown = copy(); unknown.extra = true;
  assert.ok(has(engine.validate(unknown), 'BUNDLE_UNKNOWN_FIELD'));
  for (const mutate of [
    data => { data.system.schemaVersion = '2.0'; },
    data => { data.contracts[0].anatomy[0].magic = true; },
    data => { data.profile.configuration.density = 'compact'; },
    data => { delete data.contracts[0].anatomy; },
    data => { data.contracts[0].rules = {}; },
  ]) { const value = copy(); mutate(value); assert.ok(has(engine.validate(value), 'SCHEMA_INVALID')); }
  assert.equal(engine.validateInstance('Button', null).valid, false);
  const malformed = { ...copy().contracts[0], rules: {} };
  assert.equal(engine.validateInstance('Button', {}, { contract: malformed }).valid, false);
});

test('C01: rule mutation cannot become a silent no-op', () => {
  for (const [mutate, code] of [
    [data => { data.contracts[0].rules[0].check = 'pretend-pass'; }, 'SCHEMA_INVALID'],
    [data => { data.contracts[0].rules[0].layer = 'browser'; }, 'RULE_INVALID'],
    [data => { delete data.contracts[0].rules[0].prop; }, 'RULE_INVALID'],
    [data => { data.contracts[0].rules.push({ ...data.contracts[0].rules[0] }); }, 'RULE_DUPLICATE'],
    [data => { data.contracts[0].rules[0].prop = 'title'; }, 'REQUIRED_RULE_MISSING'],
  ]) { const value = copy(); mutate(value); assert.ok(has(engine.validate(value), code), code); }
});

test('C01/C02: source provenance and contract identity are enforced', () => {
  const value = copy(); value.contracts[0].api.typesFile = 'wrong.ts';
  assert.ok(has(engine.validate(value), 'API_SOURCE_MISMATCH'));
  const missing = copy(); missing.system.sizes.m.height.source = 'no-such-file.md';
  assert.ok(has(engine.validate(missing), 'SOURCE_NOT_FOUND'));
  const contract = { ...copy().contracts[0], id: 'IconButton' };
  assert.ok(has(engine.validateInstance('Button', { children: 'Save' }, { contract }), 'COMPONENT_ID_MISMATCH'));
});

test('C02/R06: observed defaults now agree with types and target contracts', () => {
  assert.equal(engine.validate().valid, true);
  const audit = engine.audit();
  assert.equal(audit.valid, true);
  assert.deepEqual(audit.issues, []);
  assert.deepEqual(audit.targetDrift, []);
  const instance = engine.validateInstance('IconButton', { 'aria-label': 'Help', icon: { $slot: 'help-icon' } });
  assert.equal(instance.valid, true);
  assert.equal(instance.appliedDefaults.variant, 'secondary');
  assert.equal(instance.checks.find(check => check.check === 'pilot-variant').status, 'not-checked');
});

test('C03: missing token paths and missing recipe branches fail before compilation', () => {
  const value = copy(); value.system.geometry.borderWidth.path = ['border', 'width', 'missing'];
  assert.ok(has(engine.validate(value), 'TOKEN_NOT_FOUND'));
  const branch = copy(); delete branch.contracts[0].tokenBranches.primary;
  assert.ok(has(engine.validate(branch), 'TOKEN_BRANCH_MISSING'));
  const dimensions = copy(); dimensions.system.sizes.m.height = { collection: 'semantic', path: ['text', 'primary'], expectedType: 'color' };
  assert.ok(has(engine.validate(dimensions), 'SCHEMA_INVALID'));
  const weight = copy(); weight.system.typography.labelWeight = { collection: 'foundation', path: ['font', 'family'], expectedType: 'string' };
  assert.ok(has(engine.validate(weight), 'FONT_WEIGHT_ADAPTER_MISSING'));
});

test('C03: branch validity does not conceal a missing required state leaf', () => {
  const tokens = JSON.parse(fs.readFileSync(new URL('../../../tokens.json', import.meta.url), 'utf8'));
  delete tokens.$collections.components.$modes['Mode 1'].button.primary.solid.surface.hover;
  const changed = createContractEngine({ tokens });
  const report = changed.validate();
  assert.equal(report.valid, false);
  assert.ok(report.issues.some(issue => issue.code === 'TOKEN_NOT_FOUND' && issue.path.includes('tokenRequirements/primary/surface/hover')));
});

test('C03/C06: theme and size updates produce derived values with provenance', () => {
  const expected = { s: [24, 6, 12, 16, 8], m: [32, 8, 14, 20, 12], l: [40, 10, 16, 24, 16], xl: [48, 12, 18, 28, 20] };
  for (const theme of ['Light', 'Dark']) for (const [size, values] of Object.entries(expected)) {
    const result = engine.compile(undefined, { overrides: { theme, controlSize: size } });
    assert.ok(Object.values(result.instances).every(instance => instance.props.size === size));
    assert.deepEqual(['height', 'radius', 'fontSize', 'lineHeight', 'buttonPaddingInline'].map(key => result.geometry[key].value), values);
    assert.equal(result.geometry.height.cssValue, `${values[0]}px`);
    const surface = result.instances.save.tokenBranch.children.surface.default;
    assert.deepEqual(surface.chain.map(item => item.collection), ['components', 'semantic', 'foundation']);
    assert.equal(surface.chain[1].mode, theme);
    assert.equal(result.typography.labelWeight.cssValue, 600);
    assert.equal(result.runtimeConformance, 'not-checked');
  }
  assert.equal(engine.bundle.profile.configuration.controlSize, 'm');
});

test('C04: error plus focus is valid and independent of preview state', () => {
  const result = engine.validateInstance('TextField', { ...field, value: '   ', errorText: 'Введите имя.' }, { interaction: { focused: true } });
  assert.equal(result.valid, true, JSON.stringify(result.issues));
  assert.equal(result.state.validation, 'error');
  assert.equal(result.state.focusRing, true);
  assert.equal(result.state.data, 'filled');
  assert.equal(result.state.tokenState, 'error');
  const preview = engine.validateInstance('TextField', { ...field, state: 'focus' });
  assert.equal(preview.state.interaction.focused, false);
});

test('C04: disabled preview and aria-disabled cannot pretend to block interaction', () => {
  assert.equal(engine.validateInstance('TextField', { ...field, state: 'disabled' }).valid, false);
  assert.equal(engine.validateInstance('TextField', { ...field, state: 'disabled', disabled: true }).valid, true);
  assert.equal(engine.validateInstance('Button', { children: 'Save', 'aria-disabled': true }).valid, false);
  assert.equal(engine.validateInstance('Button', { children: 'Save', 'aria-disabled': true, loading: true }).valid, true);
  const disabled = engine.validateInstance('TextField', { ...field, disabled: true, errorText: 'Сохранённая ошибка' });
  assert.equal(disabled.state.validation, 'none');
  assert.equal(disabled.checks.find(check => check.check === 'disabled-error-presentation').status, 'not-checked');
});

test('C04: label/error content and active/selection semantics remain distinct', () => {
  assert.equal(engine.validateInstance('Button', { children: '   ' }).valid, false);
  assert.equal(engine.validateInstance('TextField', { ...field, state: 'error' }).valid, false);
  assert.equal(engine.validateInstance('TextField', { ...field, errorText: ' ' }).valid, false);
  const opaque = engine.validateInstance('TextField', { ...field, errorText: { $slot: 'error' } });
  assert.equal(opaque.state.validation, 'error');
  assert.equal(opaque.checks.find(check => check.check === 'error-message').status, 'not-checked');
  const icon = { variant: 'ghost', icon: { $slot: 'help-icon' }, 'aria-label': 'Help' };
  const active = engine.validateInstance('IconButton', icon, { interaction: { active: true } });
  assert.equal(active.state.tokenState, 'pressed');
  assert.equal(Object.hasOwn(icon, 'selected'), false);
  assert.equal(engine.validateInstance('IconButton', { ...icon, selected: false }).valid, false);
  assert.equal(mergeDescriptionIds('external shared', 'shared local-message'), 'external shared local-message');
  const wrongCheck = structuredClone(engine.bundle.contracts[0]);
  wrongCheck.rules[0].prop = 'title';
  assert.ok(has(engine.validateInstance('Button', { children: '', title: 'Tooltip' }, { contract: wrongCheck }), 'REQUIRED_RULE_MISSING'));
});

test('C04/C06: public but uncovered capabilities do not become a green visual claim', () => {
  const outline = engine.validateInstance('Button', { children: 'Save', variant: 'outline' });
  assert.equal(outline.valid, true);
  assert.equal(outline.checks.find(check => check.check === 'pilot-variant').status, 'not-checked');
  const value = copy(); value.profile.recipes.help.props.loading = true;
  assert.ok(has(engine.validate(value), 'PILOT_STATE_UNSUPPORTED'));
  const loadingHelp = engine.validateInstance('IconButton', { variant: 'ghost', icon: { $slot: 'help-icon' }, 'aria-label': 'Help', loading: true });
  assert.ok(has(loadingHelp, 'STATE_UNSUPPORTED'));
});

test('C06: wiring detects duplicate authoring and valid-typed wrong owners', () => {
  for (const [mutate, code] of [
    [data => { data.profile.recipes.save.props.size = 'l'; }, 'SIZE_BINDING_CONFLICT'],
    [data => { data.profile.recipes.cancel.bindings.disabled = 'form.helpExpanded'; }, 'PROFILE_ROLE_WIRING'],
    [data => { data.profile.recipes.projectName.props.onChange.$handler = 'form.unknown'; }, 'HANDLER_UNKNOWN'],
    [data => { delete data.profile.recipes.projectName.props.onBlur; }, 'PROFILE_ROLE_WIRING'],
    [data => { data.profile.recipes.help.visibleExplanation = ' '; }, 'SCHEMA_INVALID'],
    [data => { data.profile.recipes.projectName.bindings.disabled = 'form.fieldError'; }, 'BINDING_TYPE_MISMATCH'],
  ]) { const value = copy(); mutate(value); assert.ok(has(engine.validate(value), code), code); }
});

test('C05/C06: compiled pending state binds all roles and preserves newer input on profile update', () => {
  const policy = engine.bundle.profile.formPolicy;
  let state = createFormState('A');
  state = transitionForm(state, { type: 'submit', route: 'enter' }, policy).state;
  state = transitionForm(state, { type: 'change', value: 'B' }, policy).state;
  const before = structuredClone(state);
  const result = engine.compile(undefined, { formState: state, overrides: { theme: 'Dark', controlSize: 'l' } });
  assert.equal(result.instances.projectName.props.value, 'B');
  assert.equal(result.instances.save.props.loading, true);
  assert.equal(result.instances.cancel.props.disabled, true);
  assert.equal(result.instances.help.props.loading, undefined);
  assert.deepEqual(state, before);
  assert.deepEqual(result.form.state, before);
  assert.equal(result.form.state.activeRequest.value, 'A');
});

test('C06: invalid configuration throws addressable violations before output', () => {
  for (const overrides of [{ controlSize: 'xxl' }, { density: 'compact' }, { theme: 'Solarized' }, { ignored: true }]) assert.throws(() => engine.compile(undefined, { overrides }), error => error instanceof ContractValidationError && error.issues.some(issue => issue.path.startsWith('/profile/configuration')));
});
