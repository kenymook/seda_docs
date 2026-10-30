import test from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createContractEngine, ContractValidationError } from '../src/index.mjs';
import { createTabsWebBindings, WebBindingError } from '../src/web.mjs';

const engine = createContractEngine();
const items = [
  { value: 'properties', label: 'Свойства', content: { $slot: 'workspace.properties' } },
  { value: 'locked', label: 'Недоступно', content: null, disabled: true },
  { value: 'history', label: 'История', content: 'История документа' },
];
const props = { label: 'Панели документа', items, value: 'properties', onValueChange: { $handler: 'workspace.panel' } };

test('Tabs: actual API/defaults, eight profiles and two variants compile opaque panel slots', () => {
  assert.deepEqual(engine.api.get('Tabs').observedDefaults, { activationMode: 'automatic', variant: 'line', size: 'm' });
  assert.deepEqual(engine.api.get('Tabs').props.variant.enumValues.sort(), ['line','pill']);
  assert.equal(engine.api.get('Tabs').refElement, 'HTMLDivElement');
  for (const theme of ['Light','Dark']) for (const size of ['s','m','l','xl']) for (const variant of ['line','pill']) {
    const compiled = engine.compileControl('Tabs', { ...props, size, variant }, { theme });
    assert.equal(compiled.props.size, size);
    assert.equal(compiled.geometry.height.value, engine.bundle.system.sizes[size].height.value);
    assert.equal(compiled.state.tabs.value, 'properties');
    assert.equal(compiled.tokenBranch.children.focus.ring.chain.length > 1, true);
    assert.equal(compiled.runtimeConformance, 'not-checked');
    assert.equal(compiled.checks.filter(c => c.layer === 'browser').length, 6);
    assert.ok(compiled.checks.filter(c => c.layer === 'browser').every(c => c.status === 'not-checked'));
  }
});

test('Tabs: invalid items, labels, public props and ambiguous controlled input are rejected', () => {
  for (const change of [
    { label: ' ' }, { label: { $slot: 'label' } }, { items: null }, { items: 1 },
    { items: [items[0], items[0]] }, { items: [{ value:'a',label:' ',content:null }] },
    { items: [{ value:' ',label:'A',content:null }] }, { items: [{ value:'a',label:'A' }] },
    { items: [{ value:'a',label:'A',content:null,disabled:'yes' }] },
    { value: 42 }, { defaultValue: 'history' }, { activationMode:'invented' }, { orientation:'vertical' }, { size:'huge' },
  ]) {
    const result = engine.validateInstance('Tabs', { ...props, ...change });
    assert.equal(result.valid, false, JSON.stringify(change));
    assert.throws(() => engine.compileControl('Tabs', { ...props, ...change }), ContractValidationError);
  }
});

test('Tabs: fallback, empty/all-disabled and per-item states are explicit authored facts', () => {
  for (const requested of ['properties','history','locked','removed']) {
    const { state } = engine.validateInstance('Tabs', { ...props, value: requested });
    const expected = requested === 'history' ? 'history' : 'properties';
    assert.equal(state.tabs.value, expected);
    assert.equal(state.tabs.requestedValue, requested);
    assert.equal(state.tabs.items.filter(item => item.state === 'selected').length, 1);
    assert.equal(state.tabs.items.find(item => item.value === 'locked').state, 'disabled');
  }
  for (const empty of [[],items.map(item => ({...item,disabled:true}))]) {
    const result = engine.validateInstance('Tabs', { ...props, items:empty }, { interaction:{focused:true} });
    assert.equal(result.valid, true, JSON.stringify(result.issues));
    assert.equal(result.state.tabs.value, null);
    assert.equal(result.state.data, 'empty');
    assert.equal(result.state.availability, 'disabled');
    assert.equal(result.state.focusRing, false);
  }
  assert.equal(engine.validateInstance('Tabs', props, {interaction:{active:true}}).state.tokenState,'active');
  const uncontrolled = engine.compileControl('Tabs', { label:'Panels', items, defaultValue:'history', activationMode:'manual' });
  assert.equal(uncontrolled.state.tabs.controlled, false);
  assert.equal(uncontrolled.state.tabs.activationMode, 'manual');
  assert.equal(uncontrolled.state.tabs.value, 'history');
});

test('Tabs: nested descriptors preserve actual enclosing TypeScript types', () => {
  assert.equal(engine.api.validate('Tabs', props).length, 0);
  for (const item of [
    { ...items[0], value: { $slot:'bad' } }, { ...items[0], label: { $slot:'bad' } },
    { ...items[0], disabled: { $slot:'bad' } }, { ...items[0], content: { $handler:'bad' } },
    { ...items[0], content: { $slot:'bad',extra:true } }, { ...items[0], content: { $slot:' ' } },
  ]) assert.ok(engine.api.validate('Tabs', { ...props, items:[item] }).some(issue => issue.severity === 'error'), JSON.stringify(item));
  assert.equal(engine.api.validate('Tabs', { ...props, items:[{ ...items[0],icon:{$slot:'icon'} }] }).length,0);
});

test('Tabs: required instance rules, defaults and actual used state leaves cannot be weakened', () => {
  for (const check of ['tabs-items','tabs-selection']) {
    const bundle = structuredClone(engine.bundle);
    const contract = bundle.contracts.find(c => c.id === 'Tabs');
    contract.rules = contract.rules.filter(r => r.check !== check);
    assert.ok(engine.validate(bundle).issues.some(i => i.code === 'REQUIRED_RULE_MISSING'));
  }
  const bundle = structuredClone(engine.bundle);
  bundle.contracts.find(c => c.id === 'Tabs').targetDefaults.activationMode = 'invented';
  assert.equal(engine.validate(bundle).valid,false);
  const tokens = JSON.parse(fs.readFileSync(new URL('../../../tokens.json',import.meta.url),'utf8'));
  delete tokens.$collections.components.$modes['Mode 1'].tabs.pill.foreground.disabled;
  const changed = createContractEngine({tokens});
  assert.equal(changed.validate().valid,false);
  assert.throws(() => changed.compileControl('Tabs', {...props,variant:'pill'}), ContractValidationError);
  assert.equal(changed.compileControl('Tabs', {...props,variant:'line'}).component,'Tabs');
});

test('Tabs: web binding uses resolved geometry/colors with provenance and rejects broken compiler data', () => {
  const compiled = engine.compileControl('Tabs', { ...props,variant:'pill',size:'l' }, {theme:'Dark'});
  const binding = createTabsWebBindings(compiled);
  assert.equal(binding.attributes['data-seda-contract'],'Tabs');
  assert.equal(binding.vars['--seda-preset-height'],compiled.geometry.height.cssValue);
  assert.equal(binding.vars['--tabs-pill-foreground-selected'],compiled.tokenBranch.children.pill.foreground.selected.cssValue);
  assert.ok(binding.evidence.find(e=>e.property==='--tabs-focus-ring').chain.length>1);
  for (const corrupt of [
    data=>{data.geometry.height.value=-1;},
    data=>{delete data.tokenBranch.children.pill.foreground.selected;},
    data=>{data.geometry.fontSize.cssValue=NaN;},
  ]) {const data=structuredClone(compiled);corrupt(data);assert.throws(()=>createTabsWebBindings(data),WebBindingError);}
});

test('Tabs: compiled common profiles expose shared navigation contracts without claiming runtime PASS', () => {
  const compiled = engine.compile();
  const tabs = compiled.controls.Tabs;
  assert.equal(tabs.component,'Tabs');
  assert.ok(tabs.rules.some(rule=>rule.check==='tabs-keyboard'));
  assert.equal(compiled.runtimeConformance,'not-checked');
  assert.equal(engine.audit().valid,true);
});
