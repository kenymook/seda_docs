/** Browser-safe adapter. Input is validated compiler output; no token lookup or Node API here. */
import { createTypographyBindings } from './typography.mjs';
import {deriveControlGeometry,controlGeometryVariables} from './control-geometry.mjs';
/**
 * @typedef {Record<string, string|number>} CSSVariables
 * @typedef {{collection: string, mode: string, path: string[]}} ResolutionStep
 * @typedef {{property: string, cssValue: string|number, value: string|number, type: string,
 * path: string, chain: ResolutionStep[], source?: string, tokenPath?: string[],
 * ref?: Record<string, unknown>, adapter?: string}} BindingEvidence
 * @typedef {{vars: CSSVariables, attributes: Record<string, string>, evidence: BindingEvidence[]}} RecipeBinding
 * @typedef {{layout: {vars: CSSVariables, evidence: BindingEvidence[]}, recipes: Record<string, RecipeBinding>, controls: Record<string, RecipeBinding>,controlParameters?:import('./control-geometry.mjs').ControlParameters}} WebBindings
 */
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const kebab = value => value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
const weights = { Regular: 400, Medium: 500, Semibold: 600, Bold: 700 };

export class WebBindingError extends Error {
  constructor(path, message) {
    super(`${path}: ${message}`);
    this.name = 'WebBindingError';
    this.code = 'WEB_BINDING_INVALID';
    this.path = path;
  }
}

const fail = (path, message) => { throw new WebBindingError(path, message); };

function leaf(value, path, expectedType) {
  if (!object(value) || !own(value, 'value') || !Array.isArray(value.chain)) fail(path, 'Expected a resolved leaf with provenance.');
  if (expectedType && value.type !== expectedType) fail(path, `Expected ${expectedType}, received ${value.type}.`);
  if (!['string', 'number'].includes(typeof value.cssValue) || (typeof value.cssValue === 'number' && !Number.isFinite(value.cssValue))) fail(path, 'Expected a finite CSS value.');
  return value;
}

function px(value, path, { positive = false, allowNegative = false } = {}) {
  leaf(value, path, 'number');
  if (typeof value.value !== 'number' || !Number.isFinite(value.value)) fail(path, 'Expected a finite dimension.');
  if (positive ? value.value <= 0 : !allowNegative && value.value < 0) fail(path, `Expected a ${positive ? 'positive' : 'nonnegative'} rendered dimension.`);
  return { ...value, cssValue: `${value.value}px`, adapter: 'number-to-css-px' };
}

/** Re-execute the shared graph against actual resolved inputs; stale authored results are rejected. */
function withParametric(binding,control,at){
  const p=control.parametric;if(p===undefined)return binding;
  if(p?.kind!=='seda-parametric-control-geometry'||p.modelSource!=='packages/seda-contracts/src/control-geometry.mjs')fail(at+'/parametric','Expected shared control geometry and source');
  const keys={height:'height',font:'fontSize',line:'lineHeight',icon:'iconSize',radius:'radius',border:'borderWidth',buttonPaddingX:'buttonPaddingInline',fieldPaddingX:'textFieldPaddingInline'},preset={};
  const inputs={};for(const[name,key]of Object.entries(keys)){preset[name]=px(control.geometry?.[key],at+'/geometry/'+key,{positive:['height','font','line','icon'].includes(name)}).value;inputs[name]=control.geometry[key];}
  if(p.runtimeConformance!=='not-checked'||JSON.stringify(inputs)!==JSON.stringify(p.inputs))fail(at+'/parametric/inputs','Derived geometry provenance differs from the resolved inputs');
  let derived;try{derived=deriveControlGeometry(preset,p.parameters);}catch(error){fail(at+'/parametric',error.message);}
  for(const[name,value]of Object.entries(derived))if(name!=='parameters'&&value!==p[name])fail(at+'/parametric/'+name,'Compiled result differs from the shared control geometry');
  const vars=controlGeometryVariables(derived),gap=control.component==='Button'?control.geometry.buttonContentGap:control.geometry.textFieldAffixGap;
  vars['--seda-control-gap']=(px(gap,at+'/geometry/gap').value+(['Checkbox','Toggle'].includes(control.component)?derived.parameters.extraPaddingInline:0))+'px';
  const evidence=Object.entries(vars).map(([property,cssValue])=>({property,cssValue,value:cssValue,type:'derived',path:at+'/parametric',chain:[],source:p.modelSource,adapter:'shared-control-geometry',inputs:structuredClone(inputs),parameters:derived.parameters}));
  return{...binding,vars:{...binding.vars,...vars},evidence:[...binding.evidence.filter(item=>!own(vars,item.property)),...evidence]};
}

/** Props supplied by this pilot's host rather than by a component recipe. */
export const webOwnedProps = Object.freeze({
  common: Object.freeze(['id', 'ref', 'style', 'data-seda-contract', 'data-seda-loading-slot']),
  save: Object.freeze(['onClick']),
  cancel: Object.freeze([]),
  help: Object.freeze(['aria-controls']),
  projectName: Object.freeze([]),
});

const hostedHandlers = Object.freeze({
  save: Object.freeze({}),
  cancel: Object.freeze({ onClick: 'form.cancel' }),
  help: Object.freeze({ onClick: 'form.toggleHelp' }),
  projectName: Object.freeze({ onChange: 'form.change', onBlur: 'form.blur' }),
});

export function validateWebProfile(profile) {
  const issues = [];
  for (const [role, recipe] of Object.entries(profile.recipes ?? {})) {
    for (const prop of [...webOwnedProps.common, ...(webOwnedProps[role] ?? [])]) {
      if (object(recipe.props) && own(recipe.props, prop)) issues.push({
        code: 'PROFILE_ADAPTER_PROP_CONFLICT', path: `/profile/recipes/${role}/props/${prop}`,
        message: `${prop} is supplied by the settings-form web adapter; a recipe value would be overwritten.`,
        status: 'violated', severity: 'error',
      });
    }
    for (const [prop, value] of Object.entries(recipe.props ?? {})) {
      if (object(value) && own(value, '$handler') && hostedHandlers[role]?.[prop] !== value.$handler) issues.push({
        code: 'PROFILE_HOST_HANDLER_UNSUPPORTED', path: `/profile/recipes/${role}/props/${prop}`,
        message: `The settings-form host does not bind ${value.$handler} to ${role}.${prop}.`,
        status: 'violated', severity: 'error',
      });
    }
  }
  return issues;
}

function writer() {
  const vars = {};
  const evidence = [];
  return {
    vars, evidence,
    add(property, resolved, path, expectedType) {
      const value = leaf(resolved, path, expectedType);
      if (own(vars, property)) fail(path, `Duplicate CSS assignment ${property}.`);
      vars[property] = value.cssValue;
      evidence.push({ property, cssValue: value.cssValue, value: value.value, type: value.type,
        path, chain: structuredClone(value.chain),
        ...(value.source ? { source: value.source } : {}),
        ...(value.ref ? { tokenPath: [...value.ref.path], ref: structuredClone(value.ref) } : {}),
        ...(value.adapter ? { adapter: value.adapter } : {}),
      });
    },
  };
}

function colors(target, node, prefix, at, namespace = '--seda-') {
  if (!object(node)) fail(at, 'Expected a resolved color branch.');
  for (const [key, value] of Object.entries(node)) {
    const parts = [...prefix, key];
    if (object(value) && own(value, 'value')) target.add(`${namespace}${parts.join('-')}`, value, `${at}/${key}`, 'color');
    else colors(target, value, parts, `${at}/${key}`, namespace);
  }
}

/** Navigation binding consumes validated compiler data, never reads tokens in the browser. */
export function createTabsWebBindings(control) {
  const at = '/controls/Tabs';
  if (control?.component !== 'Tabs' || !object(control.geometry) || !Array.isArray(control.tokenRequirements) || !control.tokenRequirements.length) fail(at, 'Expected compiled Tabs contract, geometry and required roles.');
  const target = writer();
  requiredColors(control.tokenBranch?.children, control.tokenRequirements.map(parts => parts.join('/')), `${at}/tokenBranch`);
  colors(target, control.tokenBranch.children, ['tabs'], `${at}/tokenBranch`, '--');
  for (const [key, variable] of Object.entries({ height: 'height', radius: 'radius', fontSize: 'font-size', lineHeight: 'line-height', iconSize: 'icon-size', borderWidth: 'border-width', textFieldPaddingInline: 'field-padding', textFieldAffixGap: 'gap' })) {
    target.add(`--seda-preset-${variable}`, px(control.geometry[key], `${at}/geometry/${key}`, { positive: ['height','fontSize','lineHeight','iconSize'].includes(key) }), `${at}/geometry/${key}`);
  }
  return withParametric({ vars: target.vars, evidence: target.evidence, attributes: { 'data-seda-contract': 'Tabs' } },control,at);
}

export function createNumberFieldWebBindings(control){
 const at='/controls/NumberField';if(control?.component!=='NumberField'||!object(control.geometry)||!Array.isArray(control.tokenRequirements)||!control.tokenRequirements.length)fail(at,'Expected compiled NumberField with explicit TextField visual alias.');
 const target=writer();requiredColors(control.tokenBranch?.children,control.tokenRequirements.map(parts=>parts.join('/')),at+'/tokenBranch');colors(target,control.tokenBranch.children,['text','field'],at+'/tokenBranch','--');
 for(const[key,name]of Object.entries({height:'height',radius:'radius',fontSize:'font-size',lineHeight:'line-height',borderWidth:'border-width',textFieldPaddingInline:'field-padding'}))target.add('--seda-preset-'+name,px(control.geometry[key],at+'/geometry/'+key,{positive:key!=='borderWidth'&&key!=='textFieldPaddingInline'}),at+'/geometry/'+key);
 return withParametric({vars:target.vars,evidence:target.evidence,attributes:{'data-seda-contract':'NumberField'}},control,at);
}

export function createSliderWebBindings(control){
 const at='/controls/Slider';if(control?.component!=='Slider'||!object(control.geometry)||!Array.isArray(control.tokenRequirements)||!control.tokenRequirements.length)fail(at,'Expected compiled Slider geometry and required roles.');
 const target=writer();requiredColors(control.tokenBranch?.children,control.tokenRequirements.map(parts=>parts.join('/')),at+'/tokenBranch');colors(target,control.tokenBranch.children,['slider'],at+'/tokenBranch','--');
 for(const[key,name]of Object.entries({height:'height',fontSize:'font-size',lineHeight:'line-height',iconSize:'icon-size'}))target.add('--seda-preset-'+name,px(control.geometry[key],at+'/geometry/'+key,{positive:true}),at+'/geometry/'+key);
 for(const key of ['minRailHeight','minThumbSize','trackHeight','thumbBorderWidth','focusWidth','focusOffset','headerGap'])target.add('--seda-slider-'+kebab(key),px(control.geometry[key],at+'/geometry/'+key,{positive:key!=='focusOffset'}),at+'/geometry/'+key);
 const error=control.semanticAdapters?.['--status-danger-text'];target.add('--status-danger-text',leaf(error,at+'/semanticAdapters/error','color'),at+'/semanticAdapters/error');
 return withParametric({vars:target.vars,evidence:target.evidence,attributes:{'data-seda-contract':'Slider'}},control,at);
}

export function createTextAreaWebBindings(control){
 const at='/controls/TextArea';if(control?.component!=='TextArea'||!object(control.geometry)||!Array.isArray(control.tokenRequirements)||!control.tokenRequirements.length)fail(at,'Expected compiled TextArea with required roles.');
 const target=writer();requiredColors(control.tokenBranch?.children,control.tokenRequirements.map(parts=>parts.join('/')),at+'/tokenBranch');colors(target,control.tokenBranch.children,['text-area'],at+'/tokenBranch','--');
 for(const [key,name]of Object.entries({height:'height',radius:'radius',fontSize:'font-size',lineHeight:'line-height',borderWidth:'border-width',textFieldPaddingInline:'field-padding'}))target.add('--seda-preset-'+name,px(control.geometry[key],at+'/geometry/'+key,{positive:key!=='borderWidth'&&key!=='textFieldPaddingInline'}),at+'/geometry/'+key);
 return withParametric({vars:target.vars,evidence:target.evidence,attributes:{'data-seda-contract':'TextArea'}},control,at);
}

export function createTreeWebBindings(control) {
  const at='/controls/Tree';
  if(control?.component!=='Tree'||!object(control.geometry)||!Array.isArray(control.tokenRequirements)||!control.tokenRequirements.length)fail(at,'Expected compiled Tree and required roles.');
  const target=writer();
  requiredColors(control.tokenBranch?.children,control.tokenRequirements.map(parts=>parts.join('/')),`${at}/tokenBranch`);
  colors(target,control.tokenBranch.children,['tree'],`${at}/tokenBranch`,'--');
  for(const [key,variable] of Object.entries({height:'height',radius:'radius',fontSize:'font-size',lineHeight:'line-height',iconSize:'icon-size',borderWidth:'border-width',textFieldPaddingInline:'field-padding',textFieldAffixGap:'gap'}))target.add(`--seda-preset-${variable}`,px(control.geometry[key],`${at}/geometry/${key}`,{positive:['height','fontSize','lineHeight','iconSize'].includes(key)}),`${at}/geometry/${key}`);
  return withParametric({vars:target.vars,evidence:target.evidence,attributes:{'data-seda-contract':'Tree'}},control,at);
}

function requiredColors(branch, paths, at) {
  for (const path of paths) {
    let node = branch;
    for (const part of path.split('/')) node = object(node) ? node[part] : undefined;
    leaf(node, `${at}/${path}`, 'color');
  }
}

/** Menu branch and the documented focus/danger semantic adapters are already resolved. */
export function createDropdownMenuWebBindings(control) {
  const at = '/controls/DropdownMenu';
  if (control?.component !== 'DropdownMenu' || !object(control.geometry) || !Array.isArray(control.tokenRequirements) || !control.tokenRequirements.length) fail(at, 'Expected compiled DropdownMenu geometry and required roles.');
  const target = writer();
  requiredColors(control.tokenBranch?.children, control.tokenRequirements.map(parts => parts.join('/')), `${at}/tokenBranch`);
  colors(target, control.tokenBranch.children, ['dropdown-menu'], `${at}/tokenBranch`, '--');
  for (const property of ['--focus-ring','--status-danger-text','--status-danger-container']) target.add(property,control.semanticAdapters?.[property],`${at}/semanticAdapters/${property}`,'color');
  for (const [key, variable] of Object.entries({height:'height',radius:'radius',fontSize:'font-size',lineHeight:'line-height',iconSize:'icon-size',borderWidth:'border-width',textFieldPaddingInline:'field-padding',textFieldAffixGap:'gap'})) target.add(`--seda-preset-${variable}`,px(control.geometry[key],`${at}/geometry/${key}`,{positive:['height','fontSize','lineHeight','iconSize'].includes(key)}),`${at}/geometry/${key}`);
  return withParametric({vars:target.vars,evidence:target.evidence,attributes:{'data-seda-contract':'DropdownMenu'}},control,at);
}

/** Bind compiled selection/choice contracts without resolving tokens in the browser. */
export function createControlWebBindings(compiled) {
  if (!object(compiled?.controls)) fail('/controls', 'Compiled control catalog is required.');
  return Object.fromEntries(['Select', 'Checkbox', 'Radio', 'Toggle'].map(name => {
    const control = compiled.controls[name];
    const at = `/controls/${name}`;
    if (control?.component !== name || !Array.isArray(control.tokenRequirements) || !control.tokenRequirements.length) fail(at, 'Expected compiled component contract and required roles.');
    const target = writer();
    requiredColors(control.tokenBranch?.children, control.tokenRequirements.map(parts => parts.join('/')), `${at}/tokenBranch`);
    colors(target, control.tokenBranch.children, [name.toLowerCase()], `${at}/tokenBranch`);
    return [name, withParametric({ vars: target.vars, evidence: target.evidence, attributes: { 'data-seda-contract': name } },control,at)];
  }));
}

/** @param {Record<string, any>} compiled @returns {WebBindings} */
export function createWebBindings(compiled) {
  if (!object(compiled) || compiled.kind !== 'seda-compiled-profile' || compiled.schemaVersion !== '0.1.0') fail('/', 'Expected SEDA compiled profile version 0.1.0.');
  const { geometry, typography, layout, instances } = compiled;
  if (![geometry, typography, layout, instances].every(object)) fail('/', 'Compiled profile is incomplete.');
  const layoutWriter = writer();
  const typeBindings=createTypographyBindings(typography.roles);
  Object.assign(layoutWriter.vars,typeBindings.vars);layoutWriter.evidence.push(...typeBindings.evidence);
  for(const [key,property] of Object.entries({surface:'--surface-base',separator:'--border-subtle',focus:'--focus-ring'}))layoutWriter.add(property,compiled.foundationTokens?.[key],`/foundationTokens/${key}`,'color');
  for (const [key, value] of Object.entries(layout)) {
    const path = `/layout/${key}`;
    const resolved = object(value) ? px(value, path, { positive: key === 'containerMaxWidth' }) : {
      value, type: 'string', cssValue: value, chain: [],
      source: `packages/seda-contracts/profiles/settings-form.json#layout/${key}`,
    };
    layoutWriter.add(`--seda-layout-${kebab(key)}`, resolved, path);
  }
  const recipes = {};
  for (const [role, instance] of Object.entries(instances)) {
    const at = `/instances/${role}`;
    if (!['Button', 'IconButton', 'TextField'].includes(instance.component)) fail(at, 'Unsupported web component.');
    const target = writer();
    for (const [key, variable] of Object.entries({ height: 'height', radius: 'radius', fontSize: 'font-size', lineHeight: 'line-height', iconSize: 'icon-size', borderWidth: 'border-width' })) {
      target.add(`--seda-control-${variable}`, px(geometry[key], `/geometry/${key}`, { positive: ['height', 'fontSize', 'lineHeight', 'iconSize'].includes(key) }), `/geometry/${key}`);
    }
    target.add('--seda-font-family', typography.family, '/typography/family', 'string');
    target.add('--seda-label-weight', typography.labelWeight, '/typography/labelWeight', 'string');
    if (instance.component !== 'IconButton') {
      const field = instance.component === 'TextField';
      const padding = field ? 'textFieldPaddingInline' : 'buttonPaddingInline';
      const gap = field ? 'textFieldAffixGap' : 'buttonContentGap';
      target.add('--seda-control-padding-inline', px(geometry[padding], `/geometry/${padding}`), `/geometry/${padding}`);
      target.add('--seda-control-gap', px(geometry[gap], `/geometry/${gap}`), `/geometry/${gap}`);
    }
    const branch = instance.tokenBranch?.children;
    const required = ['surface/default', 'surface/hover', 'surface/disabled', 'border/default', 'border/hover', 'border/disabled', 'foreground/default', 'foreground/disabled'];
    if (instance.component === 'TextField') required.push('surface/focus', 'surface/error', 'surface/active', 'border/focus', 'border/error', 'border/active', 'foreground/placeholder', 'label/default', 'label/disabled', 'helper/default', 'helper/error', 'focus/ring', 'affix/surface', 'affix/foreground', 'icon/default', 'icon/active', 'icon/disabled', 'icon/error');
    else required.push('surface/pressed', 'border/pressed');
    if (instance.component === 'IconButton') required.push('foreground/hover', 'foreground/pressed');
    if (instance.component === 'Button') required.push('surface/loading', 'border/loading', 'foreground/loading', 'spinner/foreground', 'focus/ring');
    requiredColors(branch, required, `${at}/tokenBranch`);
    colors(target, branch, [], `${at}/tokenBranch`);
    if (instance.component === 'IconButton') {
      const focus = instance.auxiliaryTokens?.focus?.children;
      requiredColors(focus, ['ring'], `${at}/auxiliaryTokens/focus`);
      colors(target, focus, ['focus'], `${at}/auxiliaryTokens/focus`);
    }
    if (instance.component === 'TextField') {
      target.add('--seda-label-gap', px(layout.labelToControl, '/layout/labelToControl'), '/layout/labelToControl');
      target.add('--seda-message-gap', px(layout.controlToMessage, '/layout/controlToMessage'), '/layout/controlToMessage');
      const message = typography.messageTokens?.children;
      target.add('--seda-message-font-size', px(message?.size, '/typography/message/size', { positive: true }), '/typography/message/size');
      target.add('--seda-message-line-height', px(message?.lineHeight, '/typography/message/lineHeight', { positive: true }), '/typography/message/lineHeight');
      target.add('--seda-message-letter-spacing', px(message?.letterSpacing, '/typography/message/letterSpacing', { allowNegative: true }), '/typography/message/letterSpacing');
      const weight = leaf(message?.weight, '/typography/message/weight', 'string');
      if (!own(weights, weight.value)) fail('/typography/message/weight', `No font-weight adapter for ${weight.value}.`);
      target.add('--seda-message-weight', { ...weight, cssValue: weights[weight.value], adapter: 'font-weight-name-to-number' }, '/typography/message/weight');
    }
    recipes[role] = withParametric({
      vars: target.vars,
      attributes: { 'data-seda-contract': instance.component,
        ...(instance.component === 'Button' && own(instance.props, 'loading') ? { 'data-seda-loading-slot': 'true' } : {}),
      },
      evidence: target.evidence,
    },{...instance,geometry},at);
  }
  const layoutBinding=withParametric({vars:layoutWriter.vars,evidence:layoutWriter.evidence},compiled,'');
  return { layout:layoutBinding, recipes,...(compiled.parametric?{controlParameters:compiled.parametric.parameters}:{}), controls: { ...createControlWebBindings(compiled), NumberField:createNumberFieldWebBindings(compiled.controls?.NumberField),Slider:createSliderWebBindings(compiled.controls?.Slider), TextArea:createTextAreaWebBindings(compiled.controls?.TextArea), Tabs: createTabsWebBindings(compiled.controls?.Tabs), DropdownMenu:createDropdownMenuWebBindings(compiled.controls?.DropdownMenu),Tree:createTreeWebBindings(compiled.controls?.Tree) } };
}

/** Bind only declared sources and host adapters. Does not infer events or duplicate form rules. */
/**
 * @param {Record<string, any>} recipe
 * @param {Record<string, any>} configuration
 * @param {Record<string, any>} form
 * @param {{handlers?: Record<string, Function>, slots?: Record<string, unknown>}} [adapters]
 * @returns {Record<string, any>}
 */
export function bindWebRecipe(recipe, configuration, form, { handlers = {}, slots = {} } = {}) {
  if (!object(recipe) || !object(recipe.props) || !object(recipe.bindings)) fail('/recipe', 'Expected a validated recipe.');
  const props = {};
  for (const [name, value] of Object.entries(recipe.props)) {
    const at = `/recipe/props/${name}`;
    if (object(value) && own(value, '$handler')) {
      if (Object.keys(value).length !== 1 || !own(handlers, value.$handler) || typeof handlers[value.$handler] !== 'function') fail(at, `Missing host handler ${value.$handler}.`);
      props[name] = handlers[value.$handler];
    } else if (object(value) && own(value, '$slot')) {
      if (Object.keys(value).length !== 1 || !own(slots, value.$slot) || slots[value.$slot] == null) fail(at, `Missing host slot ${value.$slot}.`);
      props[name] = slots[value.$slot];
    } else props[name] = structuredClone(value);
  }
  for (const [name, binding] of Object.entries(recipe.bindings)) {
    const at = `/recipe/bindings/${name}`;
    if (own(props, name)) fail(at, 'A bound prop already has an authored value.');
    if (typeof binding !== 'string') fail(at, 'Expected an owner.property binding.');
    const parts = binding.split('.');
    const source = parts[0] === 'configuration' ? configuration : parts[0] === 'form' ? form : undefined;
    if (parts.length !== 2 || !object(source) || !own(source, parts[1])) fail(at, `Missing binding source ${binding}.`);
    props[name] = source[parts[1]];
  }
  return props;
}
