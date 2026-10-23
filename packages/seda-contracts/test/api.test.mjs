import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiInspector } from '../src/api.mjs';

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));
const inspector = createApiInspector({ repoRoot });
const button = { children: 'Сохранить' };
const icon = { 'aria-label': 'Помощь', icon: { $slot: 'help-icon' } };
const field = { label: 'Название проекта' };
const errors = issues => issues.filter(issue => issue.status === 'violated');
const codes = issues => issues.map(issue => issue.code);

test('metadata comes from public TypeScript interfaces with inherited native props', () => {
  const b = inspector.get('Button');
  const i = inspector.get('IconButton');
  const f = inspector.get('TextField');
  assert.deepEqual([...b.props.variant.enumValues].sort(), ['destruction', 'ghost', 'outline', 'primary', 'secondary', 'text']);
  assert.deepEqual([...f.props.size.enumValues].sort(), ['l', 'm', 's', 'xl']);
  assert.equal(b.props.form.origin, 'native');
  assert.equal(b.props.children.origin, 'native');
  assert.equal(f.props.readOnly.origin, 'native');
  assert.equal(f.props.prefix.origin, 'own');
  assert.equal(f.props.label.required, true);
  assert.equal(i.props['aria-label'].required, true);
  assert.equal(i.props.icon.required, true);
  assert.equal(i.props.children, undefined);
  assert.equal(b.props.size.required, false);
  assert.equal(b.props.ref.origin, 'react');
  assert.equal(b.props.key.origin, 'react');
  assert.equal(b.refElement, 'HTMLButtonElement');
  assert.equal(f.refElement, 'HTMLInputElement');
});

test('forwardRef attributes come from React types and the actual element generic', () => {
  assert.deepEqual(inspector.validate('Button', { ...button, ref: { $handler: 'button-ref' }, key: 'save' }), []);
  assert.deepEqual(inspector.validate('TextField', { ...field, ref: { current: null }, key: 1 }), []);
  assert(codes(inspector.validate('Button', { ...button, ref: { current: 'not-an-element' } })).includes('API_PROP_TYPE'));
  assert(codes(inspector.validate('Button', { ...button, key: {} })).includes('API_PROP_TYPE'));
});

test('valid button HTML/ARIA attributes remain available', () => {
  assert.deepEqual(inspector.validate('Button', {
    ...button, form: 'settings', formNoValidate: true, name: 'action', value: 'save',
    type: 'submit', 'aria-describedby': 'save-description', 'aria-expanded': false,
    'data-tracking-id': 'save-project', onClick: { $handler: 'form.submit' },
  }), []);
});

test('valid TextField native props and own ReactNode prefix remain available', () => {
  assert.deepEqual(inspector.validate('TextField', {
    ...field, value: 'Project', readOnly: true, autoComplete: 'organization',
    'aria-describedby': 'external-description', inputMode: 'text',
    'data-step': 1, onChange: { $handler: 'form.change' }, prefix: { $slot: 'prefix' },
  }), []);
});

test('wrong native primitives and enum values fail at their actual property paths', () => {
  for (const [name, props, property] of [
    ['Button', { ...button, formNoValidate: 'yes' }, 'formNoValidate'],
    ['Button', { ...button, variant: 'neutral' }, 'variant'],
    ['Button', { ...button, type: 'link' }, 'type'],
    ['TextField', { ...field, readOnly: 'yes' }, 'readOnly'],
    ['TextField', { ...field, inputMode: 'numerical' }, 'inputMode'],
    ['TextField', { ...field, 'aria-expanded': 'perhaps' }, 'aria-expanded'],
  ]) {
    const result = inspector.validate(name, props);
    assert(result.some(issue => issue.code === 'API_PROP_TYPE' && issue.path === `/props/${property}`), JSON.stringify(result));
  }
});

test('Omit and own overrides are respected', () => {
  assert(inspector.validate('TextField', { ...field, size: 4 }).some(issue => issue.path === '/props/size'));
  assert(inspector.validate('IconButton', { ...icon, children: 'Unexpected' }).some(issue => issue.code === 'API_UNKNOWN_PROP' && issue.path === '/props/children'));
  assert.deepEqual(inspector.validate('TextField', { ...field, size: 'm' }), []);
});

test('invented own props and ARIA typos are rejected rather than accepted by a broad allowlist', () => {
  for (const property of ['error', 'clearable', 'hintText', 'onClear', 'startAdornment', 'aria-labl']) {
    const result = inspector.validate('TextField', { ...field, [property]: true });
    assert(result.some(issue => issue.code === 'API_UNKNOWN_PROP' && issue.path === `/props/${property}`));
  }
});

test('required interface properties are enforced separately from their ReactNode values', () => {
  assert(codes(inspector.validate('TextField', {})).includes('API_REQUIRED_PROP'));
  const missingIcon = inspector.validate('IconButton', { 'aria-label': 'Help' });
  assert(missingIcon.some(issue => issue.path === '/props/icon' && issue.code === 'API_REQUIRED_PROP'));
  assert.deepEqual(inspector.validate('TextField', { size: 'm' }, { requireRequired: false }), []);
  for (const requireRequired of [true, false]) {
    const result = inspector.validate('IconButton', { ...icon, 'aria-label': undefined }, { requireRequired });
    assert(result.some(issue => issue.code === 'API_PROP_TYPE' && issue.path === '/props/aria-label'));
  }
});

test('opaque handlers and slots only bind to compatible semantic TypeScript positions', () => {
  assert.deepEqual(inspector.validate('IconButton', icon), []);
  for (const [name, props, property] of [
    ['TextField', { ...field, value: { $handler: 'bad' } }, 'value'],
    ['TextField', { ...field, value: { $slot: 'bad' } }, 'value'],
    ['Button', { ...button, onClick: { $slot: 'bad' } }, 'onClick'],
    ['IconButton', { ...icon, 'aria-label': { $slot: 'bad' } }, 'aria-label'],
    ['Button', { ...button, style: { $slot: 'bad' } }, 'style'],
    ['Button', { ...button, children: { $handler: 'bad' } }, 'children'],
  ]) {
    const result = inspector.validate(name, props);
    assert(result.some(issue => issue.code === 'API_BINDING_TYPE' && issue.path === `/props/${property}`), JSON.stringify(result));
  }
});

test('binding descriptors require exactly one meaningful identifier', () => {
  for (const value of [{ $handler: '' }, { $handler: '   ' }, { $handler: 'save', extra: true }, { $handler: 'save', $slot: 'icon' }]) {
    assert(codes(inspector.validate('Button', { ...button, onClick: value })).includes('API_BINDING_DESCRIPTOR'));
  }
});

test('native nested style and array props use TypeScript assignability', () => {
  assert.deepEqual(inspector.validate('Button', { ...button, style: { opacity: 0.5, display: 'flex' } }), []);
  assert.deepEqual(inspector.validate('TextField', { ...field, value: ['one', 'two'] }), []);
  assert(codes(inspector.validate('Button', { ...button, style: { opacity: { nested: true } } })).includes('API_PROP_TYPE'));
  assert(codes(inspector.validate('TextField', { ...field, value: { unexpected: 'object' } })).includes('API_PROP_TYPE'));
});

test('data attributes have scalar values and are not confused with arbitrary props', () => {
  assert.deepEqual(inspector.validate('Button', { ...button, 'data-enabled': false, 'data-count': 3 }), []);
  assert(codes(inspector.validate('Button', { ...button, 'data-value': {} })).includes('API_DATA_ATTRIBUTE_VALUE'));
  assert(codes(inspector.validate('Button', { ...button, 'data-': 'value' })).includes('API_UNKNOWN_PROP'));
});

test('type validation does not claim rendered visibility or accessible-name completeness', () => {
  // These values are legal React/TypeScript shapes. Contract semantic rules must
  // separately reject missing visible text/icons and whitespace-only names.
  assert.deepEqual(inspector.validate('IconButton', { 'aria-label': '   ', icon: null }), []);
  assert.deepEqual(inspector.validate('TextField', { label: undefined }), []);
  assert.deepEqual(inspector.validate('Button', { children: '' }), []);
});

test('unserializable object trees are explicitly not checked', () => {
  const cyclic = {}; cyclic.self = cyclic;
  const result = inspector.validate('Button', { ...button, style: cyclic });
  assert(result.some(issue => issue.code === 'API_VALUE_UNCHECKED' && issue.status === 'not-checked'));
  assert(codes(inspector.validate('Button', { ...button, title: Symbol('bad') })).includes('API_VALUE_UNCHECKED'));
  const functionResult = inspector.validate('Button', { ...button, onClick: (wrongArgument) => wrongArgument });
  assert(functionResult.some(issue => issue.code === 'API_VALUE_UNCHECKED' && issue.status === 'not-checked'));
  assert.match(functionResult[0].message, /function signatures/);
});

test('fixed implementation defaults are read from source and pass the real type audit', () => {
  assert.equal(inspector.get('IconButton').observedDefaults.variant, 'secondary');
  assert.deepEqual(inspector.auditDefaults('IconButton'), []);
  assert.deepEqual(inspector.auditDefaults('Button'), []);
  assert.deepEqual(inspector.auditDefaults('TextField'), []);
});

test('a regression to the old neutral source default is still detected', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'seda-api-regression-'));
  try {
    fs.cpSync(path.join(repoRoot, 'packages/seda-ui/src'), path.join(temp, 'packages/seda-ui/src'), { recursive: true });
    const file = path.join(temp, 'packages/seda-ui/src/components/IconButton/IconButton.tsx');
    const original = fs.readFileSync(file, 'utf8');
    assert.match(original, /variant = "secondary"/);
    fs.writeFileSync(file, original.replace('variant = "secondary"', 'variant = "neutral"'));
    const changed = createApiInspector({ repoRoot: temp });
    const result = changed.auditDefaults('IconButton');
    assert.equal(changed.get('IconButton').observedDefaults.variant, 'neutral');
    assert.equal(errors(result).length, 1);
    assert.equal(result[0].code, 'API_DEFAULT_OUTSIDE_TYPE');
    assert.equal(result[0].path, '/props/variant');
    assert.match(result[0].message, /neutral/);
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});

test('metadata is defensive and unknown components fail clearly', () => {
  const copy = inspector.get('Button'); copy.props.size.enumValues.push('xxl');
  assert(!inspector.get('Button').props.size.enumValues.includes('xxl'));
  assert.throws(() => inspector.get('Missing'), /API_UNKNOWN_COMPONENT/);
  assert.equal(inspector.validate('Missing', {})[0].code, 'API_UNKNOWN_COMPONENT');
});

test('binding validation checks whole domains against the actual TypeScript props', () => {
  assert.deepEqual(inspector.validateBindingTypes('Button', { size: 'size', loading: 'boolean', children: 'string', disabled: 'boolean' }), []);
  assert.deepEqual(inspector.validateBindingTypes('TextField', { size: 'size', value: 'string', errorText: 'optional-string' }), []);
  assert.deepEqual(inspector.validateBindingTypes('IconButton', { size: 'size', 'aria-label': 'string' }), []);
  for (const [name, mapping, property] of [
    ['Button', { disabled: 'optional-string' }, 'disabled'],
    ['Button', { type: 'string' }, 'type'],
    ['Button', { loading: 'string' }, 'loading'],
    ['Button', { variant: 'size' }, 'variant'],
    ['TextField', { size: 'string' }, 'size'],
    ['IconButton', { 'aria-label': 'optional-string' }, 'aria-label'],
  ]) {
    const result = inspector.validateBindingTypes(name, mapping);
    assert(result.some(issue => issue.code === 'BINDING_TYPE_MISMATCH' && issue.path === `/props/${property}`), JSON.stringify(result));
  }
});

test('undefined initial sample cannot hide an incompatible later binding value', () => {
  assert.deepEqual(inspector.validate('Button', { ...button, disabled: undefined }), []);
  const result = inspector.validateBindingTypes('Button', { disabled: 'optional-string' });
  assert.equal(result.length, 1);
  assert.equal(result[0].code, 'BINDING_TYPE_MISMATCH');
  assert.equal(result[0].path, '/props/disabled');
});

test('binding domains are closed and native data attributes remain bindable', () => {
  assert.deepEqual(inspector.validateBindingTypes('Button', { 'data-value': 'string', 'data-state': 'optional-string', 'data-busy': 'boolean' }), []);
  for (const domain of ['unknown', 'number', 'toString', undefined, {}, null]) {
    const result = inspector.validateBindingTypes('Button', { loading: domain });
    assert.equal(result[0].code, 'BINDING_DOMAIN_UNKNOWN');
    assert.equal(result[0].path, '/props/loading');
  }
  assert.equal(inspector.validateBindingTypes('TextField', { inventedProp: 'string' })[0].code, 'BINDING_TYPE_MISMATCH');
  assert.equal(inspector.validateBindingTypes('Missing', {})[0].code, 'API_UNKNOWN_COMPONENT');
});
test('contextual size defaults retain explicit standalone provenance', () => {
  for (const name of ['Button','IconButton','TextField','Select','Checkbox','Radio','Toggle']) {
    const metadata=inspector.get(name);
    assert.equal(metadata.observedDefaults.size,'m');
    assert.deepEqual(metadata.defaultSources.size,{sourcePath:'packages/seda-ui/src/foundation/SedaProvider.tsx',scope:'standalone-fallback',providerOverride:true});
  }
});
test('context fallback drift and unsupported helper rewrites cannot pass source audit', () => {
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'seda-context-regression-'));
  try {
    fs.cpSync(path.join(repoRoot,'packages/seda-ui/src'),path.join(temp,'packages/seda-ui/src'),{recursive:true});
    const file=path.join(temp,'packages/seda-ui/src/foundation/SedaProvider.tsx');
    const original=fs.readFileSync(file,'utf8');
    assert.match(original,/controlSize: "m"/);
    fs.writeFileSync(file,original.replace('controlSize: "m"','controlSize: "giant"'));
    const changed=createApiInspector({repoRoot:temp});
    assert.equal(changed.get('Button').observedDefaults.size,'giant');
    assert.ok(changed.auditDefaults('Button').some(i=>i.code==='API_DEFAULT_OUTSIDE_TYPE'));
    fs.writeFileSync(file,original.replace('size ?? configuration.controlSize','size ?? "m"'));
    assert.throws(()=>createApiInspector({repoRoot:temp}),/size fallback\/context protocol changed/);
  } finally { assert.equal(path.dirname(temp),path.resolve(os.tmpdir())); assert.ok(path.basename(temp).startsWith('seda-context-regression-')); fs.rmSync(temp,{recursive:true,force:true}); }
});
