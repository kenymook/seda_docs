import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { createApiInspector } from './api.mjs';
import { createTokenResolver } from './tokens.mjs';
import { createFormState, transitionForm, formEvents } from './form.mjs';
import { deriveState, evaluateRules, validateRuleDefinition, mergeDescriptionIds } from './rules.mjs';
import { validateWebProfile } from './web.mjs';
import { compileTypography } from './typography.mjs';
import {resolveInlineAction,resolveInlineActionBranch} from './inline-action.mjs';
export {createSliderModel,snapSliderValue} from './slider.mjs';
export {createNumberFieldModel,stepNumberFieldValue} from './number-field.mjs';
import {deriveControlGeometry,normalizeControlParameters,defaultControlParameters} from './control-geometry.mjs';
export {deriveControlGeometry,normalizeControlParameters,defaultControlParameters};
export { compileTypography, deriveTypography, createTypographyBindings, typographyRoles, validateTypographyScale } from './typography.mjs';

export { createApiInspector, createTokenResolver, createFormState, transitionForm, formEvents, deriveState, mergeDescriptionIds };
export { TokenResolutionError } from './tokens.mjs';

const defaultPackageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
import { componentNames as components, nativeElements } from './registry.mjs';
const escapePointer = value => String(value).replaceAll('~', '~0').replaceAll('/', '~1');
const issue = (code, at, message, status = 'violated') => ({ code, path: at, message, status, severity: status === 'violated' ? 'error' : 'warning' });
const handlerIds = new Set(formEvents.map(event => `form.${event.event}`));
const slots = new Set(['help-icon']);
const fontWeights = { Regular: 400, Medium: 500, Semibold: 600, Bold: 700 };
const bindingDomains = { 'configuration.controlSize': 'size', 'form.projectName': 'string', 'form.fieldError': 'optional-string', 'form.saving': 'boolean', 'form.helpExpanded': 'boolean' };
const requiredChecks = {
  Button: [['text-content', 'children'], ['aria-disabled-activation'], ['pilot-variant']],
  IconButton: [['text-content', 'aria-label'], ['slot-present', 'icon'], ['aria-disabled-activation'], ['persistent-selection-unused'], ['pilot-variant']],
  TextField: [['text-content', 'label'], ['controlled-value'], ['error-message'], ['native-disabled']],
  Select: [['text-content', 'label'], ['selection-value'], ['error-message'], ['native-disabled']],
  Checkbox: [['text-content', 'label'], ['checked-value'], ['error-message']],
  Radio: [['text-content', 'label'], ['selection-value'], ['error-message']],
  Toggle: [['text-content', 'label'], ['checked-value'], ['aria-disabled-activation']],
  Tabs: [['text-content', 'label'], ['tabs-items'], ['tabs-selection']],
  DropdownMenu: [['text-content', 'triggerLabel'], ['menu-items'], ['menu-open']],
  Tree: [['text-content','label'],['tree-items'],['tree-state']],
  TextArea: [['text-content','label'],['textarea-value'],['textarea-layout'],['error-message'],['native-disabled']],
  Slider: [['text-content','label'],['slider-model'],['error-message'],['native-disabled']],
  NumberField: [['text-content','label'],['number-field-model'],['error-message'],['native-disabled']],
};

export function loadBundle(packageRoot = defaultPackageRoot) {
  return { system: read(path.join(packageRoot, 'system.json')), contracts: components.map(name => read(path.join(packageRoot, 'contracts', `${name}.json`))), profile: read(path.join(packageRoot, 'profiles/settings-form.json')) };
}

export class ContractValidationError extends Error {
  constructor(issues) { super('SEDA contract validation failed'); this.name = 'ContractValidationError'; this.issues = issues; }
}

export function createContractEngine({ packageRoot = defaultPackageRoot, repoRoot = path.resolve(packageRoot, '../..'), bundle = loadBundle(packageRoot), tokens = read(path.join(repoRoot, 'tokens.json')) } = {}) {
  packageRoot = path.resolve(packageRoot);
  repoRoot = path.resolve(repoRoot);
  const ajv = new Ajv({ strict: true, allErrors: true, ownProperties: true, coerceTypes: false, useDefaults: false, removeAdditional: false });
  ajv.addSchema(read(path.join(packageRoot, 'schema/common.schema.json')));
  const validators = Object.fromEntries(['system', 'component', 'profile'].map(name => [name, ajv.compile(read(path.join(packageRoot, 'schema', `${name}.schema.json`)))]));
  const api = createApiInspector({ repoRoot, packageRoot });
  const resolver = createTokenResolver(tokens);

  function schemaIssues(kind, value, prefix) {
    const check = validators[kind];
    if (check(value)) return [];
    return check.errors.map(error => issue('SCHEMA_INVALID', `${prefix}${error.instancePath}${error.params.additionalProperty ? '/' + escapePointer(error.params.additionalProperty) : ''}`, `${error.message} (${error.keyword})`));
  }

  function sourceIssue(source, at) {
    const file = String(source).split('#')[0];
    const absolute = path.resolve(repoRoot, file);
    if (!absolute.startsWith(repoRoot + path.sep) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) return issue('SOURCE_NOT_FOUND', at, `Source does not exist inside the repository: ${file}`);
  }

  function scanSources(value, at, result) {
    if (!value || typeof value !== 'object') return;
    if (typeof value.source === 'string') { const problem = sourceIssue(value.source, `${at}/source`); if (problem) result.push(problem); }
    for (const [key, child] of Object.entries(value)) if (child && typeof child === 'object') scanSources(child, `${at}/${escapePointer(key)}`, result);
  }

  function resolveMeasurement(value, theme) {
    if (own(value, 'collection')) return resolver.resolve(value, { theme });
    return { value: value.value, type: 'number', cssValue: `${value.value}px`, source: value.source, unit: 'px', chain: [] };
  }

  function sliderGeometryIssues(contract, at, themes) {
    if(contract?.id!=='Slider')return [];
    const problems=[];
    for(const key of ['minRailHeight','minThumbSize','trackHeight','thumbBorderWidth','focusWidth','focusOffset','headerGap']) {
      const measurement=contract.geometry?.[key], location=at+'/geometry/'+key;
      if(!measurement){problems.push(issue('SLIDER_GEOMETRY_MISSING',location,'Slider requires an explicit documented measurement.'));continue;}
      for(const theme of themes)try{
        const resolved=resolveMeasurement(measurement,theme);
        if(!Number.isFinite(resolved.value)||resolved.value<0||key!=='focusOffset'&&resolved.value===0)problems.push(issue('SLIDER_GEOMETRY_INVALID',location,'Slider dimensions must be positive; focusOffset may be zero.'));
      }catch(error){problems.push(issue(error.code??'TOKEN_INVALID',location,error.message));}
    }
    return problems;
  }

  function bindRecipe(recipe, configuration, form) {
    const props = { ...recipe.props };
    for (const [prop, binding] of Object.entries(recipe.bindings)) {
      const [owner, key] = binding.split('.');
      const source = owner === 'configuration' ? configuration : owner === 'form' ? form : undefined;
      if (!source || !own(source, key)) throw new ContractValidationError([issue('BINDING_UNKNOWN', `/bindings/${prop}`, `Binding ${binding} has no source.`)]);
      props[prop] = source[key];
    }
    return props;
  }

  function validateWiring(profile) {
    const result = validateWebProfile(profile);
    const required = {
      save: { component: 'Button', props: { type: 'submit' }, bindings: { loading: 'form.saving' } },
      cancel: { component: 'Button', props: { type: 'button', onClick: { $handler: 'form.cancel' } }, bindings: { disabled: 'form.saving' } },
      help: { component: 'IconButton', props: { type: 'button', onClick: { $handler: 'form.toggleHelp' } }, bindings: { 'aria-expanded': 'form.helpExpanded' } },
      projectName: { component: 'TextField', props: { type: 'text', required: true, name: 'projectName', onChange: { $handler: 'form.change' }, onBlur: { $handler: 'form.blur' } }, bindings: { value: 'form.projectName', errorText: 'form.fieldError' } },
    };
    for (const [role, recipe] of Object.entries(profile.recipes)) {
      const at = `/profile/recipes/${role}`;
      if (own(recipe.props, 'size') || recipe.bindings.size !== 'configuration.controlSize') result.push(issue('SIZE_BINDING_CONFLICT', at, 'Every size must derive only from configuration.controlSize.'));
      for (const prop of Object.keys(recipe.bindings)) if (own(recipe.props, prop)) result.push(issue('BINDING_CONFLICT', `${at}/props/${prop}`, 'A bound prop cannot have a second authored value.'));
      const target = required[role];
      if (recipe.component !== target.component) result.push(issue('PROFILE_ROLE_COMPONENT', at, `${role} requires ${target.component}.`));
      for (const group of ['props', 'bindings']) for (const [key, value] of Object.entries(target[group])) {
        if (JSON.stringify(recipe[group][key]) !== JSON.stringify(value)) result.push(issue('PROFILE_ROLE_WIRING', `${at}/${group}/${escapePointer(key)}`, `${role}.${key} must connect to ${JSON.stringify(value)}.`));
      }
      if (role === 'help' && (typeof recipe.visibleExplanation !== 'string' || !recipe.visibleExplanation.trim())) result.push(issue('HELP_EXPLANATION_REQUIRED', at, 'The pilot tooltip exception requires visible explanatory text.'));
      if (['cancel', 'help', 'projectName'].includes(role) && (recipe.props.loading === true || own(recipe.bindings, 'loading'))) result.push(issue('PILOT_STATE_UNSUPPORTED', at, 'Loading is only covered for the Save action in this profile.'));
      for (const [prop, value] of Object.entries(recipe.props)) {
        if (value && typeof value === 'object' && own(value, '$handler') && !handlerIds.has(value.$handler)) result.push(issue('HANDLER_UNKNOWN', `${at}/props/${prop}`, `Unknown form event binding ${value.$handler}.`));
        if (value && typeof value === 'object' && own(value, '$slot') && !slots.has(value.$slot)) result.push(issue('SLOT_UNKNOWN', `${at}/props/${prop}`, `No declared pilot slot ${value.$slot}.`));
      }
    }
    return result;
  }

  function validateInstance(name, props, { interaction = {}, contract = bundle.contracts.find(item => item.id === name) } = {}) {
    if (!contract) return { valid: false, issues: [issue('COMPONENT_UNKNOWN', '/', `Unknown component ${name}`)], checks: [] };
    const invalidContract = schemaIssues('component', contract, '/contract');
    if (contract.id !== name) invalidContract.push(issue('COMPONENT_ID_MISMATCH', '/contract/id', `Requested ${name}, received ${contract.id}.`));
    if(!invalidContract.length)invalidContract.push(...sliderGeometryIssues(contract,'/contract',bundle.system.supportedThemes));
    if (invalidContract.length) return { valid: false, issues: invalidContract, checks: [] };
    const actual = api.get(name);
    const expectedApi = { typesFile: actual.sourcePath, implementationFile: actual.implementationPath, export: `${name}Props`, nativeElement: nativeElements[name] };
    for (const [key, value] of Object.entries(expectedApi)) if (contract.api[key] !== value) invalidContract.push(issue('API_SOURCE_MISMATCH', `/contract/api/${key}`, `Expected ${value}.`));
    for (const rule of contract.rules) { const error = validateRuleDefinition(rule); if (error) invalidContract.push(issue('RULE_INVALID', '/contract/rules', error)); }
    for (const [check, prop] of requiredChecks[name]) if (!contract.rules.some(rule => rule.check === check && rule.prop === prop && rule.layer === 'instance')) invalidContract.push(issue('REQUIRED_RULE_MISSING', '/contract/rules', `Required ${check} check is missing.`));
    if (invalidContract.length) return { valid: false, issues: invalidContract, checks: [] };
    if (!props || typeof props !== 'object' || Array.isArray(props)) return { valid: false, issues: [issue('API_PROPS_OBJECT', '/props', 'Props must be a plain object.')], checks: [] };
    const commonGeometryKeys=new Set([...Object.keys(bundle.system.sizes.m),...Object.keys(bundle.system.geometry),'boxSizing']);
    for(const key of Object.keys(contract.geometry??{}))if(commonGeometryKeys.has(key))return {valid:false,issues:[issue('COMPONENT_GEOMETRY_COLLISION','/contract/geometry/'+key,'Component geometry must not replace a shared preset.')],checks:[]};
    const effective = { ...props };
    const appliedDefaults = {};
    for (const [key, value] of Object.entries(api.get(name).observedDefaults)) if (effective[key] === undefined && (value === null || typeof value !== 'object')) { effective[key] = value; appliedDefaults[key] = value; }
    const issues = api.validate(name, effective);
    const checks = evaluateRules(contract, effective);
    for (const check of checks.filter(check => check.status === 'violated')) issues.push({ ...issue('RULE_VIOLATION', check.path, check.message), ruleId: check.ruleId });
    let state;
    try {
      state = deriveState(name, effective, interaction);
      for (const axis of ['availability', 'activity', 'validation']) if (!contract.states[axis].includes(state[axis])) issues.push(issue('STATE_UNSUPPORTED', `/state/${axis}`, `${state[axis]} is outside this contract's ${axis} axis.`));
      if (state.data !== null && !contract.states.data.includes(state.data)) issues.push(issue('STATE_UNSUPPORTED', '/state/data', `${state.data} is outside this contract's data axis.`));
      for (const [key, active] of Object.entries(state.interaction)) if (active && !contract.states.interaction.includes(key)) issues.push(issue('STATE_UNSUPPORTED', `/state/interaction/${key}`, `${key} is not supported.`));
    } catch (error) { issues.push(issue('STATE_INVALID', '/interaction', error.message)); }
    return { valid: !issues.some(item => item.severity === 'error'), scope: 'serializable-instance', issues, checks, state, appliedDefaults, runtimeConformance: 'not-checked' };
  }

  function validate(candidate = bundle) {
    const result = [];
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return { valid: false, issues: [issue('BUNDLE_INVALID', '/', 'Bundle must contain system, contracts and profile.')], deferredChecks: [], runtimeConformance: 'not-checked' };
    for (const key of Object.keys(candidate)) if (!['system', 'contracts', 'profile'].includes(key)) result.push(issue('BUNDLE_UNKNOWN_FIELD', `/${escapePointer(key)}`, 'Unknown bundle field.'));
    result.push(...schemaIssues('system', candidate.system, '/system'), ...schemaIssues('profile', candidate.profile, '/profile'));
    if (!Array.isArray(candidate.contracts)) result.push(issue('CONTRACTS_REQUIRED', '/contracts', 'Contracts must be an array.'));
    else candidate.contracts.forEach((contract, index) => result.push(...schemaIssues('component', contract, `/contracts/${index}`)));
    if (result.length) return { valid: false, issues: result, deferredChecks: [], runtimeConformance: 'not-checked' };
    const ids = candidate.contracts.map(contract => contract.id);
    if (new Set(ids).size !== ids.length || components.some(name => !ids.includes(name))) result.push(issue('CONTRACT_SET_INVALID', '/contracts', 'Exactly one contract for each pilot component is required.'));
    for (const contract of candidate.contracts) {
      const at = `/contracts/${contract.id}`;
      const actual = api.get(contract.id);
      const expected = { typesFile: actual.sourcePath, implementationFile: actual.implementationPath, export: `${contract.id}Props`, nativeElement: nativeElements[contract.id] };
      for(const key of Object.keys(contract.geometry??{}))if(key in candidate.system.sizes.m||key in candidate.system.geometry||key==='boxSizing')result.push(issue('COMPONENT_GEOMETRY_COLLISION',at+'/geometry/'+key,'Component geometry must not replace a shared preset.'));
      result.push(...sliderGeometryIssues(contract,at,candidate.system.supportedThemes));
      for (const [key, value] of Object.entries(expected)) if (contract.api[key] !== value) result.push(issue('API_SOURCE_MISMATCH', `${at}/api/${key}`, `Expected ${value}, based on the actual component source.`));
      if (JSON.stringify([...(actual.props.size.enumValues ?? [])].sort()) !== JSON.stringify(Object.keys(candidate.system.sizes).sort())) result.push(issue('API_SIZE_DRIFT', `${at}/api/size`, 'Source size union and system presets differ.'));
      for (const problem of api.validate(contract.id, contract.targetDefaults, { requireRequired: false })) result.push({ ...problem, path: `${at}/targetDefaults${problem.path.replace('/props', '')}` });
      for (const key of ['source', 'baseline']) { const problem = sourceIssue(contract.evidence[key], `${at}/evidence/${key}`); if (problem) result.push(problem); }
      const ruleIds = new Set();
      for (const rule of contract.rules) {
        if (ruleIds.has(rule.id)) result.push(issue('RULE_DUPLICATE', `${at}/rules`, `Duplicate rule ID ${rule.id}.`));
        ruleIds.add(rule.id);
        const error = validateRuleDefinition(rule);
        if (error) result.push(issue('RULE_INVALID', `${at}/rules/${rule.id}`, error));
        if (rule.prop && !actual.props[rule.prop]) result.push(issue('RULE_PROP_UNKNOWN', `${at}/rules/${rule.id}/prop`, `Unknown prop ${rule.prop}.`));
      }
      for (const [check, prop] of requiredChecks[contract.id]) if (!contract.rules.some(rule => rule.check === check && rule.prop === prop && rule.layer === 'instance')) result.push(issue('REQUIRED_RULE_MISSING', `${at}/rules`, `Required pilot check ${check}${prop ? ' for ' + prop : ''} is missing.`));
      const requiredBranches = !contract.pilotVariants.length ? ['default'] : contract.pilotVariants;
      if (['Button','IconButton'].includes(contract.id) && !requiredBranches.length) result.push(issue('PILOT_VARIANT_MISSING', `${at}/pilotVariants`, 'Action contract needs at least one pilot variant.'));
      for (const role of requiredBranches) if (!own(contract.tokenBranches, role)) result.push(issue('TOKEN_BRANCH_MISSING', `${at}/tokenBranches/${role}`, `Missing branch for pilot recipe ${role}.`));
      for (const role of Object.keys(contract.tokenBranches)) if (!own(contract.tokenRequirements, role)) result.push(issue('TOKEN_REQUIREMENTS_MISSING', `${at}/tokenRequirements/${role}`, 'Every declared branch needs explicit required roles.'));
      for (const role of Object.keys(contract.tokenRequirements)) if (!own(contract.tokenBranches, role)) result.push(issue('TOKEN_BRANCH_MISSING', `${at}/tokenBranches/${role}`, 'Token requirements refer to an absent branch.'));
      for (const slot of contract.anatomy) if (slot.prop && !actual.props[slot.prop]) result.push(issue('ANATOMY_PROP_UNKNOWN', `${at}/anatomy/${slot.name}`, `Unknown prop ${slot.prop}.`));
      for (const variant of contract.pilotVariants) if (!actual.props.variant?.enumValues?.includes(variant)) result.push(issue('PILOT_VARIANT_INVALID', `${at}/pilotVariants`, `${variant} is not in the public API.`));
    }
    scanSources(candidate, '', result);
    result.push(...validateWiring(candidate.profile));
    const planned = [];
    for (const theme of candidate.system.supportedThemes) {
      const attempt = (at, fn) => { try { return fn(); } catch (error) { result.push(issue(error.code ?? 'TOKEN_INVALID', at, error.message)); } };
      for (const [size, values] of Object.entries(candidate.system.sizes)) for (const [key, value] of Object.entries(values)) attempt(`/system/sizes/${size}/${key}`, () => resolveMeasurement(value, theme));
      for (const [key, value] of Object.entries(candidate.system.geometry)) attempt(`/system/geometry/${key}`, () => resolveMeasurement(value, theme));
      for(const contract of candidate.contracts)for(const[key,value]of Object.entries(contract.geometry??{}))attempt(`/contracts/${contract.id}/geometry/${key}`,()=>resolveMeasurement(value,theme));
      for(const contract of candidate.contracts)if(contract.inlineAction)for(const size of Object.keys(candidate.system.sizes))attempt('/contracts/'+contract.id+'/inlineAction/'+size,()=>resolveInlineAction(contract,Object.fromEntries(Object.entries({...candidate.system.sizes[size],...candidate.system.geometry}).map(([k,v])=>[k,resolveMeasurement(v,theme)])),{size,theme,resolver,resolveMeasurement,fontWeights}));
      for (const [key, value] of Object.entries(candidate.profile.layout)) if (value && typeof value === 'object') attempt(`/profile/layout/${key}`, () => resolveMeasurement(value, theme));
      for (const [key, ref] of Object.entries(candidate.system.typography)) {
        const value = attempt(`/system/typography/${key}`, () => key === 'message' ? resolver.resolveBranch(ref, { theme }) : resolver.resolve(ref, { theme }));
        if (['labelWeight','fieldWeight'].includes(key) && value && !own(fontWeights, value.value)) result.push(issue('FONT_WEIGHT_ADAPTER_MISSING', '/system/typography/'+key, `No web adapter for ${value.value}.`));
      }
      for (const contract of candidate.contracts) for (const [role, ref] of Object.entries(contract.tokenBranches)) attempt(`/contracts/${contract.id}/tokenBranches/${role}`, () => resolver.resolveBranch(ref, { theme }));
      for (const contract of candidate.contracts) for (const [role, paths] of Object.entries(contract.tokenRequirements)) {
        const branch = contract.tokenBranches[role];
        if (!branch) continue;
        for (const suffix of paths) {
          const ref = { collection: branch.collection, path: [...branch.path, ...suffix], expectedType: 'color' };
          const isPlanned = candidate.system.plannedTokenAdditions.some(addition => addition.ref.collection === ref.collection && JSON.stringify(addition.ref.path) === JSON.stringify(ref.path));
          if (!isPlanned) attempt(`/contracts/${contract.id}/tokenRequirements/${role}/${suffix.join('/')}`, () => resolver.resolve(ref, { theme }));
        }
      }
      for (const addition of candidate.system.plannedTokenAdditions) {
        const record = attempt('/system/plannedTokenAdditions', () => resolver.validatePlanned(addition, { theme }));
        if (record) planned.push({ theme, ...record });
      }
    }
    const initial = createFormState();
    try { transitionForm(initial, { type: 'profileChanged' }, candidate.profile.formPolicy); } catch (error) { result.push(issue('FORM_POLICY_INVALID', '/profile/formPolicy', error.message)); }
    for (const [role, recipe] of Object.entries(candidate.profile.recipes)) {
      try {
        result.push(...api.validateBindingTypes(recipe.component, Object.fromEntries(Object.entries(recipe.bindings).map(([prop, binding]) => [prop, bindingDomains[binding]]))).map(item => ({ ...item, path: `/profile/recipes/${role}/bindings${item.path.replace('/props', '')}` })));
        const props = bindRecipe(recipe, candidate.profile.configuration, initial);
        const contract = candidate.contracts.find(item => item.id === recipe.component);
        if (contract && (!contract.pilotVariants.length || contract.pilotVariants.includes(props.variant))) {
          const checked = validateInstance(recipe.component, props, { contract });
          result.push(...checked.issues.map(item => ({ ...item, path: `/profile/recipes/${role}${item.path}` })));
        } else result.push(issue('PILOT_RECIPE_UNSUPPORTED', `/profile/recipes/${role}`, 'The recipe has no token mapping in this pilot.'));
      } catch (error) { result.push(...(error.issues ?? [issue('PROFILE_INVALID', `/profile/recipes/${role}`, error.message)])); }
    }
    return { valid: !result.some(item => item.severity === 'error'), scope: 'contract-and-profile-data', issues: result, planned, deferredChecks: candidate.contracts.flatMap(contract => contract.rules.filter(rule => rule.layer === 'browser').map(rule => ({ component: contract.id, ruleId: rule.id, status: 'not-checked', expected: rule.expected }))), runtimeConformance: 'not-checked' };
  }

  function audit() {
    const issues = bundle.contracts.flatMap(contract => api.auditDefaults(contract.id).map(problem => ({ ...problem, component: contract.id })));
    const targets = bundle.contracts.flatMap(contract => Object.entries(contract.targetDefaults).filter(([prop, value]) => api.get(contract.id).observedDefaults[prop] !== value).map(([prop, value]) => ({ component: contract.id, prop, observed: api.get(contract.id).observedDefaults[prop], target: value, status: 'violated' })));
    return { valid: !issues.some(item => item.severity === 'error') && !targets.length, scope: 'current-source-defaults', issues, targetDrift: targets, runtimeConformance: 'not-checked' };
  }

  function controlGeometry(controlSize, theme) {
    const resolveMap = values => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value && typeof value === 'object' ? resolveMeasurement(value, theme) : value]));
    return { ...resolveMap(bundle.system.sizes[controlSize]), ...resolveMap(bundle.system.geometry), boxSizing: bundle.system.boxSizing };
  }

  function componentGeometry(name,size,theme){const common=controlGeometry(size,theme),contract=bundle.contracts.find(c=>c.id===name);return{...common,...Object.fromEntries(Object.entries(contract?.geometry??{}).map(([key,value])=>{if(key in common)throw new ContractValidationError([issue('COMPONENT_GEOMETRY_COLLISION','/contracts/'+name+'/geometry/'+key,'Component geometry must not replace a shared preset.')]);return[key,resolveMeasurement(value,theme)];}))};}

  function actionPresentation(contract,geometry,size,theme,variant){
    return variant===contract?.inlineAction?.variant?resolveInlineAction(contract,geometry,{size,theme,resolver,resolveMeasurement,fontWeights}):{geometry};
  }

  // D34: TextField and its NumberField alias share source typography, while
  // label/message size and line height follow the effective control geometry.
  function fieldTypography(theme) {
    const weight=resolver.resolve(bundle.system.typography.fieldWeight,{theme});
    return {weight:{...weight,cssValue:fontWeights[weight.value]},letterSpacing:resolver.resolve(bundle.system.typography.fieldLetterSpacing,{theme})};
  }

  function compileParameters(geometry,parameters){
    if(parameters===undefined)return{};
    const keys={height:'height',font:'fontSize',line:'lineHeight',icon:'iconSize',radius:'radius',border:'borderWidth',buttonPaddingX:'buttonPaddingInline',fieldPaddingX:'textFieldPaddingInline'};
    try{const inputs=Object.fromEntries(Object.entries(keys).map(([name,key])=>[name,geometry[key]])),preset=Object.fromEntries(Object.entries(inputs).map(([name,leaf])=>[name,leaf.value]));return{parametric:{kind:'seda-parametric-control-geometry',...deriveControlGeometry(preset,parameters),inputs:structuredClone(inputs),modelSource:'packages/seda-contracts/src/control-geometry.mjs',runtimeConformance:'not-checked'}};}
    catch(error){throw new ContractValidationError([issue('CONTROL_PARAMETERS_INVALID','/controlParameters',error.message)]);}
  }

  function compileControl(name, props, { theme = bundle.profile.configuration.theme, interaction = {},controlParameters } = {}) {
    const contract = bundle.contracts.find(item => item.id === name);
    const checked = validateInstance(name, props, { interaction });
    if (!checked.valid) throw new ContractValidationError(checked.issues);
    if (!bundle.system.supportedThemes.includes(theme)) throw new ContractValidationError([issue('THEME_UNSUPPORTED', '/theme', theme)]);
    const effective = { ...props, ...checked.appliedDefaults };
    const branch = contract.tokenBranches[effective.variant ?? 'default'];
    if (!branch) throw new ContractValidationError([issue('TOKEN_BRANCH_MISSING', '/variant', String(effective.variant))]);
    const requirements = contract.tokenRequirements[effective.variant ?? 'default'];
    if (!requirements?.length) throw new ContractValidationError([issue('TOKEN_REQUIREMENTS_MISSING', '/tokenRequirements', String(effective.variant))]);
    for (const suffix of requirements) {
      try { resolver.resolve({ collection: branch.collection, path: [...branch.path, ...suffix], expectedType: 'color' }, {theme}); }
      catch (error) { throw new ContractValidationError([issue(error.code ?? 'TOKEN_INVALID', `/contracts/${name}/tokenRequirements/${effective.variant ?? 'default'}/${suffix.join('/')}`, error.message)]); }
    }
    const presentation=actionPresentation(contract,componentGeometry(name,effective.size,theme),effective.size,theme,effective.variant),{geometry}=presentation;
    return { component: name, ...presentation,...compileParameters(geometry,controlParameters), ...(['TextField','NumberField','Select','TextArea'].includes(name)?{fieldTypography:fieldTypography(theme)}:{}), props: effective, state: checked.state, checks: checked.checks, tokenRequirements: contract.tokenRequirements[effective.variant ?? 'default'], tokenBranch: resolveInlineActionBranch(contract,resolver.resolveBranch(branch, { theme }),effective.variant), ...(name === 'DropdownMenu' ? {semanticAdapters:menuSemantics(theme)} : {}),...(name==='Slider'?{semanticAdapters:sliderSemantics(theme)}:{}), runtimeConformance: 'not-checked' };
  }

  // Explicit temporary adapters for documented component token gaps; resolved with provenance.
  function sliderSemantics(theme){return{'--status-danger-text':resolver.resolve({collection:'semantic',path:['status','danger','text'],expectedType:'color'},{theme})};}

  function menuSemantics(theme) {
    return Object.fromEntries([['--focus-ring',['focus','ring']], ['--status-danger-text',['status','danger','text']], ['--status-danger-container',['status','danger','container']]].map(([property,path]) => [property, resolver.resolve({collection:'semantic',path,expectedType:'color'}, {theme})]));
  }

  function compile(profile = bundle.profile, { overrides = {}, formState = createFormState(),controlParameters } = {}) {
    const authored = structuredClone(profile);
    authored.configuration = { ...authored.configuration, ...overrides };
    const report = validate({ ...bundle, profile: authored });
    if (!report.valid) throw new ContractValidationError(report.issues);
    // Validate external state and policy without modifying state or emitting effects.
    transitionForm(formState, { type: 'profileChanged' }, authored.formPolicy);
    const { theme, controlSize } = authored.configuration;
    const resolveMap = values => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value && typeof value === 'object' ? resolveMeasurement(value, theme) : value]));
    const geometry = controlGeometry(controlSize, theme);
    const family = resolver.resolve(bundle.system.typography.family, { theme });
    const labelWeight = resolver.resolve(bundle.system.typography.labelWeight, { theme });
    const instances = {};
    for (const [role, recipe] of Object.entries(authored.recipes)) {
      const props = bindRecipe(recipe, authored.configuration, formState);
      const contract = bundle.contracts.find(item => item.id === recipe.component);
      const checked = validateInstance(recipe.component, props, { contract });
      if (!checked.valid) throw new ContractValidationError(checked.issues.map(item => ({ ...item, path: `/recipes/${role}${item.path}` })));
      const branch = contract.tokenBranches[props.variant ?? 'default'];
      const auxiliaryTokens = contract.tokenBranches.focus ? { focus: resolver.resolveBranch(contract.tokenBranches.focus, { theme }) } : {};
      const presentation=actionPresentation(contract,componentGeometry(recipe.component,props.size??controlSize,theme),props.size??controlSize,theme,props.variant);
      instances[role] = { ...(presentation.actionLayout?presentation:{}),component: recipe.component, props, state: checked.state, tokenBranch: resolveInlineActionBranch(contract,resolver.resolveBranch(branch, { theme }),props.variant), auxiliaryTokens, ...(recipe.visibleExplanation ? { visibleExplanation: recipe.visibleExplanation } : {}), checks: checked.checks };
    }
    const controls = Object.fromEntries(bundle.contracts.filter(c => ['Tabs','DropdownMenu'].includes(c.id) || !c.pilotVariants.length && c.id !== 'TextField').map(contract => [contract.id, { component: contract.id, ...(['NumberField','Select','TextArea'].includes(contract.id)?{fieldTypography:fieldTypography(theme)}:{}), geometry:componentGeometry(contract.id,controlSize,theme), tokenRequirements: contract.tokenRequirements.default, api: contract.api, states: contract.states, rules: contract.rules, tokenBranch: resolver.resolveBranch(contract.tokenBranches.default, { theme }), ...(contract.id === 'DropdownMenu' ? {semanticAdapters:menuSemantics(theme)} : {}),...(contract.id==='Slider'?{semanticAdapters:sliderSemantics(theme)}:{}) }]));
    const parameters=compileParameters(geometry,controlParameters);
    if(controlParameters!==undefined){for(const control of Object.values(controls))Object.assign(control,compileParameters(control.geometry,controlParameters));for(const instance of Object.values(instances))Object.assign(instance,compileParameters(instance.geometry??componentGeometry(instance.component,instance.props.size??controlSize,theme),controlParameters));}
    const foundationTokens = Object.fromEntries([['surface',['surface','base']],['separator',['border','subtle']],['focus',['focus','ring']]].map(([key,path])=>[key,resolver.resolve({collection:'semantic',path,expectedType:'color'},{theme})]));
    const buttonContract=bundle.contracts.find(c=>c.id==='Button');
    const actionVariants={text:actionPresentation(buttonContract,componentGeometry('Button',controlSize,theme),controlSize,theme,'text')};
    return { controls, actionVariants, schemaVersion: '0.1.0', kind: 'seda-compiled-profile', generated: true, source: bundle.system.source, configuration: authored.configuration, domTheme: bundle.system.themeAdapter[theme], layout: resolveMap(authored.layout), foundationTokens, geometry,...parameters, typography: { field:fieldTypography(theme), roles: compileTypography(resolver,{theme}), family, labelWeight: { ...labelWeight, cssValue: fontWeights[labelWeight.value] }, messageTokens: resolver.resolveBranch(bundle.system.typography.message, { theme }) }, instances, form: { policy: authored.formPolicy, state: structuredClone(formState), events: formEvents, onSubmit: { $handler: 'form.submit' } }, copy: authored.copy, planned: report.planned, capabilities: [...authored.capabilities, ...bundle.contracts.flatMap(contract => contract.capabilities.map(capability => ({ component: contract.id, ...capability })))], runtimeConformance: 'not-checked' };
  }

  function provenance() {
    const files = new Set(['tokens.json', 'packages/seda-ui/src/types.ts','packages/seda-contracts/src/control-geometry.mjs','packages/seda-contracts/src/control-geometry.d.mts','packages/seda-contracts/src/inline-action.mjs', ...bundle.contracts.flatMap(contract => [contract.api.typesFile, contract.api.implementationFile, ...Object.values(api.get(contract.id).defaultSources).map(item => item.sourcePath)])]);
    return { reference: bundle.system.source, files: Object.fromEntries([...files].sort().map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(repoRoot, file))).digest('hex')])) };
  }

  return { bundle, api, resolver, validate, validateInstance, audit, compile, compileControl, provenance };
}
