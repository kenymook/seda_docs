import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createContractEngine, createFormState, transitionForm } from '../src/index.mjs';
import { createWebBindings, bindWebRecipe, WebBindingError } from '../src/web.mjs';

const engine = createContractEngine();
const source = JSON.parse(fs.readFileSync(new URL('../../../tokens.json', import.meta.url), 'utf8'));

test('Web font stacks: control recipes and Text roles share a documented fallback without changing token provenance',()=>{
 for(const theme of ['Light','Dark'])for(const controlSize of ['s','m','l','xl']){
  const compiled=engine.compile(undefined,{overrides:{theme,controlSize}}),web=createWebBindings(compiled),family=compiled.typography.family;
  for(const binding of Object.values(web.recipes)){
   const css=binding.vars['--seda-font-family'],evidence=binding.evidence.find(item=>item.property==='--seda-font-family');
   assert.ok(css.includes('system-ui')&&css.endsWith('sans-serif'),'A named but unavailable font must not fall back to the browser serif default');
   assert.equal(css,web.layout.vars['--seda-type-body-default-family']);assert.equal(evidence.value,family.value);assert.deepEqual(evidence.chain,family.chain);assert.equal(evidence.adapter,'font-family-with-system-fallback');
  }
  assert.match(web.layout.vars['--seda-type-code-default-family'],/monospace$/);assert.ok(!web.layout.vars['--seda-type-code-default-family'].includes('system-ui'));
 }
});

test('Shared layout foundation: canonical semantic colors reach CSS with provenance and cannot be omitted',()=>{
 for(const theme of ['Light','Dark']){
  const compiled=engine.compile(undefined,{overrides:{theme}});
  const binding=createWebBindings(compiled).layout;
  for(const [name,property,path] of [['surface','--surface-base',['surface','base']],['separator','--border-subtle',['border','subtle']],['focus','--focus-ring',['focus','ring']]]){
   const canonical=engine.resolver.resolve({collection:'semantic',path,expectedType:'color'},{theme});
   assert.equal(binding.vars[property],canonical.cssValue);
   assert.deepEqual(binding.evidence.find(item=>item.property===property).chain,canonical.chain);
   const missing=structuredClone(compiled);delete missing.foundationTokens[name];assert.throws(()=>createWebBindings(missing),WebBindingError);
  }
 }
});

test('R01/R02/R10: eight profiles map geometry, tokens and provenance to actual CSS assignments', () => {
  for (const theme of ['Light', 'Dark']) for (const controlSize of ['s', 'm', 'l', 'xl']) {
    const compiled = engine.compile(undefined, { overrides: { theme, controlSize } });
    const before = JSON.stringify(compiled);
    const web = createWebBindings(compiled);
    for (const [role, binding] of Object.entries(web.recipes)) {
      assert.equal(binding.vars['--seda-control-height'], compiled.geometry.height.cssValue);
      assert.equal(binding.vars['--seda-control-radius'], compiled.geometry.radius.cssValue);
      assert.equal(binding.vars['--seda-control-icon-size'], compiled.geometry.iconSize.cssValue);
      const surface = compiled.instances[role].tokenBranch.children.surface.default;
      const proof = binding.evidence.find(item => item.property === '--seda-surface-default');
      assert.equal(binding.vars[proof.property], surface.value);
      assert.deepEqual(proof.chain, surface.chain);
      assert.equal(Object.keys(binding.vars).length, binding.evidence.length);
    }
    assert.equal(web.recipes.save.attributes['data-seda-loading-slot'], 'true');
    assert.equal(web.recipes.cancel.attributes['data-seda-loading-slot'], undefined);
    assert.equal(web.recipes.projectName.attributes['data-seda-contract'], 'TextField');
    assert.equal(web.recipes.projectName.vars['--seda-message-font-size'], '12px');
    assert.equal(web.recipes.projectName.vars['--seda-message-weight'], 400);
    assert.equal(web.recipes.projectName.vars['--seda-label-weight'], 600);
    assert.equal(web.layout.vars['--seda-layout-container-max-width'], '640px');
    assert.equal(web.recipes.help.vars['--seda-focus-ring'], compiled.instances.help.auxiliaryTokens.focus.children.ring.value);
    assert.equal(JSON.stringify(compiled), before);
  }
});

test('R01: changing actual component leaves reaches only the corresponding web roles', () => {
  const changed = structuredClone(source);
  const components = changed.$collections.components.$modes['Mode 1'];
  components.button.primary.solid.surface.default.$value = '#123456';
  components['icon-button'].ghost.foreground.default.$value = '#654321';
  components['text-field'].border.default.$value = '#246813';
  const old = createWebBindings(engine.compile());
  const next = createWebBindings(createContractEngine({ tokens: changed }).compile());
  assert.equal(next.recipes.save.vars['--seda-surface-default'], '#123456');
  assert.equal(next.recipes.help.vars['--seda-foreground-default'], '#654321');
  assert.equal(next.recipes.projectName.vars['--seda-border-default'], '#246813');
  assert.deepEqual(next.recipes.cancel, old.recipes.cancel);
  const proof = next.recipes.save.evidence.find(item => item.property === '--seda-surface-default');
  assert.equal(proof.chain.length, 1);
  assert.deepEqual(proof.tokenPath, ['button', 'primary', 'solid', 'surface', 'default']);
});

test('R07: deleting the implemented disabled border fails validation before rendering', () => {
  const changed = structuredClone(source);
  delete changed.$collections.components.$modes['Mode 1']['text-field'].border.disabled;
  const broken = createContractEngine({ tokens: changed });
  assert.equal(broken.validate().valid, false);
  assert.throws(() => broken.compile(), error => error.issues.some(item => item.code === 'TOKEN_NOT_FOUND' && item.path.endsWith('border/disabled')));
});

test('R01/R03: every field state role consumed by CSS is required before rendering', () => {
  const consumed = ['surface/active', 'border/active', 'foreground/placeholder', 'affix/surface', 'affix/foreground', 'icon/default', 'icon/active', 'icon/disabled', 'icon/error'];
  for (const path of consumed) {
    const changed = structuredClone(source);
    const [family, state] = path.split('/');
    delete changed.$collections.components.$modes['Mode 1']['text-field'][family][state];
    const broken = createContractEngine({ tokens: changed });
    const report = broken.validate();
    assert.equal(report.valid, false, path);
    assert.ok(report.issues.some(item => item.code === 'TOKEN_NOT_FOUND' && item.path.endsWith(path)), path);
  }
});

test('R01: incomplete or wrong-typed compiled values cannot silently fall back in the bridge', () => {
  for (const mutate of [
    value => { delete value.geometry.height; },
    value => { delete value.instances.projectName.tokenBranch.children.border.disabled; },
    value => { delete value.instances.projectName.tokenBranch.children.surface.active; },
    value => { value.instances.save.tokenBranch.children.surface.default.type = 'number'; },
    value => { delete value.instances.help.auxiliaryTokens.focus; },
    value => { value.typography.messageTokens.children.weight.value = 'Ultra'; },
  ]) {
    const compiled = engine.compile(); mutate(compiled);
    assert.throws(() => createWebBindings(compiled), error => error instanceof WebBindingError && error.path.startsWith('/'));
  }
});

test('R02: dimensions rejected by CSS fail the bridge while signed letter spacing stays valid', () => {
  const compiled = engine.compile();
  for (const [key, value] of [['height', 0], ['fontSize', -1], ['lineHeight', 0], ['iconSize', 0], ['radius', -8], ['borderWidth', -1], ['buttonPaddingInline', -2]]) {
    const changed = structuredClone(compiled);
    changed.geometry[key].value = value;
    assert.throws(() => createWebBindings(changed), error => error instanceof WebBindingError && error.path === `/geometry/${key}`);
  }
  const signed = structuredClone(compiled);
  signed.typography.messageTokens.children.letterSpacing.value = -0.1;
  assert.equal(createWebBindings(signed).recipes.projectName.vars['--seda-message-letter-spacing'], '-0.1px');
});

test('R08: recipes cannot silently override attributes owned by the web host', () => {
  for (const [role, prop, value] of [
    ['save', 'onClick', { $handler: 'form.cancel' }],
    ['save', 'style', { opacity: 0.2 }],
    ['projectName', 'id', 'authored-project-id'],
    ['projectName', 'ref', { current: null }],
    ['help', 'aria-controls', 'different-panel'],
    ['cancel', 'data-seda-loading-slot', 'true'],
  ]) {
    const changed = structuredClone(engine.bundle);
    changed.profile.recipes[role].props[prop] = value;
    const report = engine.validate(changed);
    assert.equal(report.valid, false);
    assert.ok(report.issues.some(item => item.code === 'PROFILE_ADAPTER_PROP_CONFLICT' && item.path === `/profile/recipes/${role}/props/${prop}`));
  }
  const extraHandler = structuredClone(engine.bundle);
  extraHandler.profile.recipes.save.props.onKeyDown = { $handler: 'form.submit' };
  assert.ok(engine.validate(extraHandler).issues.some(item => item.code === 'PROFILE_HOST_HANDLER_UNSUPPORTED' && item.path === '/profile/recipes/save/props/onKeyDown'));
  assert.deepEqual(engine.api.validate('Button', { children: 'Save', id: 'native-id', style: { opacity: 0.2 } }), [], 'Public component API remains available outside the pilot recipe.');
});

test('R08/R09: host binding preserves typed state and executes only explicitly registered adapters', () => {
  const { profile } = engine.bundle;
  const handlers = Object.fromEntries(['change', 'blur', 'cancel', 'toggleHelp'].map(name => [`form.${name}`, () => name]));
  const helpIcon = { kind: 'test-slot' };
  const state = transitionForm(createFormState('A'), { type: 'submit', route: 'click' }, profile.formPolicy).state;
  const before = JSON.stringify(profile);
  const adapters = { handlers, slots: { 'help-icon': helpIcon } };
  const field = bindWebRecipe(profile.recipes.projectName, profile.configuration, state, adapters);
  assert.equal(field.value, 'A');
  assert.equal(field.onChange, handlers['form.change']);
  assert.equal(field.required, true);
  assert.equal(field.errorText, undefined);
  assert.equal(bindWebRecipe(profile.recipes.save, profile.configuration, state, adapters).loading, true);
  assert.equal(bindWebRecipe(profile.recipes.cancel, profile.configuration, state, adapters).disabled, true);
  assert.equal(bindWebRecipe(profile.recipes.help, profile.configuration, state, adapters).icon, helpIcon);
  assert.equal(JSON.stringify(profile), before);
});

test('R08/R09: absent adapters, unknown binding owners and duplicate authoring fail with paths', () => {
  const { profile } = engine.bundle;
  assert.throws(() => bindWebRecipe(profile.recipes.help, profile.configuration, createFormState()), WebBindingError);
  const recipe = structuredClone(profile.recipes.save);
  recipe.bindings.loading = 'missing.saving';
  assert.throws(() => bindWebRecipe(recipe, profile.configuration, createFormState()), error => error.path === '/recipe/bindings/loading');
  recipe.bindings.loading = 'form.saving'; recipe.props.loading = false;
  assert.throws(() => bindWebRecipe(recipe, profile.configuration, createFormState()), error => error.path === '/recipe/bindings/loading');
});
