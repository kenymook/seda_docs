import{createNumberFieldModel}from'./number-field.mjs';
import { componentNames } from './registry.mjs';
import{createSliderModel}from'./slider.mjs';
import { deriveTree, validateTreeState } from './tree.mjs';
const own = (o, key) => Object.prototype.hasOwnProperty.call(o, key);
const browserChecks = new Set(['control-geometry', 'focus-visible', 'stable-loading-width', 'description-merge', 'disabled-error-presentation', 'component-token-binding', 'icon-box', 'full-tooltip', 'tabs-keyboard', 'tabs-panels', 'tabs-focus-repair', 'menu-keyboard', 'menu-focus', 'menu-overlay','tree-keyboard','tree-focus','tree-semantics','slider-keyboard','slider-pointer','slider-form','slider-value-text','number-field-keyboard','number-field-draft','number-field-form']);
const instanceChecks = new Set(['text-content', 'slot-present', 'controlled-value', 'error-message', 'native-disabled', 'aria-disabled-activation', 'persistent-selection-unused', 'pilot-variant', 'selection-value', 'checked-value', 'tabs-items', 'tabs-selection', 'menu-items', 'menu-open','tree-items','tree-state','textarea-value','textarea-layout','slider-model','number-field-model']);
export const ruleCheckNames = [...instanceChecks, ...browserChecks];

function content(value) {
  if (typeof value === 'string') return value.trim() ? 'present' : 'empty';
  if (typeof value === 'number' && Number.isFinite(value)) return 'present';
  if (value == null || typeof value === 'boolean') return 'empty';
  if (Array.isArray(value)) {
    const parts = value.map(content);
    return parts.includes('present') ? 'present' : parts.includes('opaque') ? 'opaque' : 'empty';
  }
  return 'opaque';
}

/** Contract facts, not measurements of an existing DOM. Focus is an independent input. */
export function deriveState(component, props, interaction = {}) {
  if (!componentNames.includes(component)) throw new TypeError(`Unknown component ${component}`);
  for (const [key, value] of Object.entries(interaction)) {
    if (!['hovered', 'focused', 'active'].includes(key) || typeof value !== 'boolean') throw new TypeError(`Unknown interaction fact: ${key}`);
  }
  const tabs = component === 'Tabs' ? deriveTabsSelection(props) : undefined;
  const menu = component === 'DropdownMenu' ? deriveMenu(props) : undefined;
  const disabled = tabs ? tabs.value === null : menu ? menu.unavailable : props.disabled === true;
  const loading = props.loading === true;
  const error = ['TextField','TextArea','Select','Checkbox','Radio','Slider','NumberField'].includes(component) && content(props.errorText) !== 'empty';
  const focused = interaction.focused ?? false;
  const hovered = interaction.hovered ?? false;
  const active = interaction.active ?? false;
  return {
    availability: disabled ? 'disabled' : component==='NumberField'&&props.readOnly ? 'read-only' : 'enabled',
    activity: loading ? 'loading' : 'idle',
    validation: disabled ? 'none' : error ? 'error' : 'none',
    interaction: { hovered, focused, active },
    data: tabs ? (tabs.value === null ? 'empty' : 'filled') : ['Checkbox','Toggle'].includes(component) ? (props.indeterminate ? 'indeterminate' : (props.checked ?? props.defaultChecked) ? 'checked' : 'unchecked') : ['TextField','TextArea','Select','Radio'].includes(component) ? ((props.value ?? props.defaultValue)?.length > 0 ? 'filled' : 'empty') : null,
    tokenState: disabled ? 'disabled' : loading ? 'loading' : error ? 'error' : component==='TextArea'&&props.readOnly ? 'read-only' : active ? (['TextField','TextArea','Select','Checkbox','Radio','Toggle','Tabs','DropdownMenu','Slider','NumberField'].includes(component) ? 'active' : 'pressed') : hovered ? 'hover' : component === 'Checkbox' && props.indeterminate ? 'indeterminate' : component === 'Checkbox' && (props.checked ?? props.defaultChecked) ? 'checked' : component === 'Radio' && (props.value ?? props.defaultValue) ? 'selected' : component === 'Toggle' ? ((props.checked ?? props.defaultChecked) ? 'on' : 'off') : 'default',
    focusRing: focused && !disabled,
    ...(tabs ? { tabs } : {}),
    ...(menu ? { menu, data: menu.items.length ? 'filled' : 'empty' } : {}),
    ...(component==='Tree'?{tree:deriveTree(props),data:props.items?.length?'filled':'empty'}:{}),
    ...(component==='Slider'?{slider:createSliderModel(props),data:'filled'}:{}),
    ...(component==='NumberField'?{numberField:createNumberFieldModel(props),data:props.value.length?'filled':'empty'}:{}),
  };
}

const menuActions = items => Array.isArray(items) ? items.flatMap(item => item?.type === 'separator' ? [] : item?.type === 'group' ? Array.isArray(item.items) ? item.items : [] : item ? [item] : []) : [];
function deriveMenu(props) {
  const items = menuActions(props.items);
  const unavailable = props.disabled === true || !items.length;
  return { controlled: props.open !== undefined, requestedOpen: props.open ?? props.defaultOpen ?? false,
    open: !unavailable && (props.open ?? props.defaultOpen ?? false), unavailable,
    items: items.map(item => ({id:item.id, state:item.disabled ? 'disabled' : 'default', danger:item.danger === true})) };
}

/** Host handlers may be real functions or typed opaque bindings; neither is executed here. */
function handler(value) {
  return typeof value === 'function' || value && typeof value === 'object' && Object.keys(value).length === 1 && typeof value.$handler === 'string' && value.$handler.trim().length > 0;
}
function validMenuItems(items, provider) {
  if (!Array.isArray(items)) return false;
  const ids = new Set(), shortcuts = new Set();
  const id = value => { if (typeof value !== 'string' || !value.trim() || ids.has(value)) return false; ids.add(value);return true; };
  const text = value => typeof value === 'string' && value.trim().length > 0;
  const action = item => {
    if (!item || typeof item !== 'object' || !id(item.id) || item.type !== undefined && item.type !== 'action' || !text(item.label) || !handler(item.onSelect)) return false;
    if (item.shortcut !== undefined) {
      const s = item.shortcut;
      if (!s || !text(s.key) || !text(s.label) || !Array.isArray(s.modifiers) || s.modifiers.some(m => !['Control','Meta','Alt','Shift'].includes(m)) || new Set(s.modifiers).size !== s.modifiers.length || provider && !s.modifiers.some(m => ['Control','Meta','Alt'].includes(m))) return false;
      const signature = [...s.modifiers].sort().join('+') + ':' + s.key.toLocaleLowerCase();
      if (shortcuts.has(signature)) return false;
      shortcuts.add(signature);
    }
    return true;
  };
  return items.every(item => item && typeof item === 'object' && (item.type === 'separator' ? id(item.id) : item.type === 'group' ? id(item.id) && text(item.label) && Array.isArray(item.items) && item.items.every(action) : action(item)));
}

/** Authored selection snapshot; internal uncontrolled state/focus still needs browser evidence. */
function deriveTabsSelection(props) {
  const items = Array.isArray(props.items) ? props.items : [];
  const enabled = items.filter(item => item && !item.disabled);
  const requestedValue = props.value ?? props.defaultValue ?? null;
  const value = enabled.some(item => item.value === requestedValue) ? requestedValue : enabled[0]?.value ?? null;
  return { requestedValue, value, controlled: props.value !== undefined, activationMode: props.activationMode ?? 'automatic',
    items: items.map(item => ({ value: item?.value, state: item?.disabled ? 'disabled' : item?.value === value ? 'selected' : 'default' })) };
}

/** Target ARIA composition; the existing TextField adapter is audited separately. */
export function mergeDescriptionIds(external, local) {
  const ids = [external, local].filter(value => typeof value === 'string').flatMap(value => value.split(/\s+/)).filter(Boolean);
  return [...new Set(ids)].join(' ') || undefined;
}

export function validateRuleDefinition(rule) {
  if (!ruleCheckNames.includes(rule.check)) return `Unknown executable check ${rule.check}`;
  if ((browserChecks.has(rule.check) ? 'browser' : 'instance') !== rule.layer) return `Check ${rule.check} belongs to a different verification layer`;
  if (['text-content', 'slot-present'].includes(rule.check)) {
    if (!rule.prop) return `${rule.check} requires a prop`;
  } else if (own(rule, 'prop')) return `${rule.check} does not accept a prop parameter`;
  return undefined;
}

export function evaluateRules(contract, props) {
  return contract.rules.map(rule => {
    const definitionError = validateRuleDefinition(rule);
    if (definitionError) throw new TypeError(definitionError);
    let status = 'passed';
    let detail = rule.expected;
    const violate = message => { status = 'violated'; detail = message; };
    const unchecked = message => { status = 'not-checked'; detail = message; };
    switch (rule.check) {
      case 'text-content': {
        const result = content(props[rule.prop]);
        if (result === 'empty') violate(`${rule.prop} must contain nonempty text.`);
        if (result === 'opaque') unchecked(`Rendered text of opaque ${rule.prop} requires a DOM check.`);
        break;
      }
      case 'slot-present':
        if (content(props[rule.prop]) === 'empty') violate(`A nonempty ${rule.prop} slot is required.`);
        break;
      case 'selection-value': {
        const options = Array.isArray(props.options) ? props.options : [];
        if (!Array.isArray(options) || !options.length || options.some(o => !o || typeof o.value !== 'string' || !o.value.trim() || content(o.label) === 'empty') || new Set(options.map(o => o.value)).size !== options.length) violate('Options require unique nonempty values and labels.');
        if (props.value !== undefined && props.defaultValue !== undefined) violate('value and defaultValue are mutually exclusive.');
        if (props.value !== undefined && !props.onValueChange && !props.onChange) violate('A controlled selection requires a change handler.');
        const value = props.value ?? props.defaultValue;
        const multi = contract.id === 'Select' && props.selection === 'multi';
        if (value !== undefined && (multi ? !Array.isArray(value) : typeof value !== 'string')) violate('Selection value shape must match single/multi mode.');
        const values = Array.isArray(value) ? value : value === undefined || value === '' ? [] : [value];
        if (new Set(values).size !== values.length || values.some(v => !options.some(o => o?.value === v))) violate('Every selected value must occur exactly once in options.');
        break;
      }
      case 'checked-value':
        if (props.checked !== undefined && props.defaultChecked !== undefined) violate('checked and defaultChecked are mutually exclusive.');
        if (props.checked !== undefined && !props.onCheckedChange && !props.onChange && !props.readOnly) violate('Controlled checked requires a change handler or readOnly.');
        break;
      case 'tabs-items': {
        const items = props.items;
        if (!Array.isArray(items) || items.some(item => !item || typeof item !== 'object' || Array.isArray(item) || typeof item.value !== 'string' || !item.value.trim() || typeof item.label !== 'string' || !item.label.trim() || !own(item, 'content')) || new Set(items.map(item => item.value)).size !== items.length)
          violate('Tabs items require unique nonempty string values/labels and a content field; an empty list is supported.');
        break;
      }
      case 'tabs-selection':
        if (props.value !== undefined && props.defaultValue !== undefined) violate('Tabs value and defaultValue are mutually exclusive.');
        break;
      case 'tree-items':
        try{deriveTree(props);}catch(error){violate(error.message);}
        break;
      case 'tree-state':
        if(!validateTreeState(props))violate('Tree controlled state requires its handler, excludes defaults, and single selection accepts at most one id.');
        break;
      case 'menu-items':
        if (!validMenuItems(props.items, props.shortcutScope === 'provider')) violate('Menu items require unique IDs, text labels, action handlers and valid unique shortcuts.');
        break;
      case 'menu-open':
        if (props.open !== undefined && (props.defaultOpen !== undefined || !handler(props.onOpenChange))) violate('Controlled menu requires onOpenChange and excludes defaultOpen.');
        if (props.iconOnly && content(props.triggerIcon) === 'empty') violate('Icon-only menu trigger needs triggerIcon.');
        break;
      case 'number-field-model':
        try{createNumberFieldModel(props);if(!handler(props.onValueChange))violate('NumberField requires its controlled raw-buffer owner.');}catch(error){violate(error.message);}
        break;
      case 'slider-model':
        try{createSliderModel(props);if(!handler(props.onValueChange))violate('Controlled Slider requires its owner handler.');}catch(error){violate(error.message);}
        break;
      case 'textarea-value':
        if(props.clearable&&props.clearLabel!==undefined&&(typeof props.clearLabel!=='string'||!props.clearLabel.trim()))violate('Clearable TextArea requires nonempty clearLabel.');
        if(props.value!==undefined&&(typeof props.value!=='string'||props.defaultValue!==undefined||!handler(props.onChange)&&!props.readOnly&&!props.disabled))violate('Controlled TextArea requires string value and onChange or readOnly/disabled, without defaultValue.');
        if(props.defaultValue!==undefined&&typeof props.defaultValue!=='string')violate('TextArea defaultValue must be a string.');
        if(props.clearable&&props.value!==undefined&&!handler(props.onClear))violate('Controlled clearable TextArea requires onClear.');
        break;
      case 'textarea-layout': {
        const rows=props.rows??3;
        if(!Number.isInteger(rows)||rows<1||props.maxRows!==undefined&&(!props.autoResize||!Number.isInteger(props.maxRows)||props.maxRows<rows))violate('Positive integer rows; maxRows requires autoResize and must be >= rows.');
        break;
      }
      case 'controlled-value':
        if (typeof props.value !== 'string' || !props.onChange || own(props, 'defaultValue')) violate('The pilot field requires value:string and onChange, without defaultValue.');
        else if (own(props, 'filled') && props.filled !== (props.value.length > 0)) violate('filled must follow the raw current value length.');
        break;
      case 'error-message': {
        const result = content(props.errorText);
        if ((props.state === 'error' || props.errorText !== undefined) && result === 'empty') violate('Error state requires nonempty errorText; use undefined when there is no error.');
        if (props.errorText !== undefined && result === 'opaque') unchecked('Rendered error text requires a DOM check.');
        break;
      }
      case 'native-disabled':
        if (props.state === 'disabled' && props.disabled !== true) violate('Preview state=disabled does not disable the native input; pass disabled=true.');
        break;
      case 'aria-disabled-activation':
        if ([true, 'true'].includes(props['aria-disabled']) && props.disabled !== true && props.loading !== true) violate('aria-disabled alone does not block activation; the pilot requires disabled or loading.');
        break;
      case 'persistent-selection-unused':
        if (own(props, 'selected') || own(props, 'aria-pressed')) violate('The help action uses aria-expanded and must omit selected/aria-pressed.');
        break;
      case 'pilot-variant':
        if (!props.variant || !contract.pilotVariants.includes(props.variant)) unchecked(`Variant ${String(props.variant)} has no verified visual recipe in this pilot.`);
        break;
      default:
        unchecked('Requires browser evidence from the UI implementation; a contract check cannot establish this result.');
    }
    return { ruleId: `${contract.id}.${rule.id}`, check: rule.check, layer: rule.layer, status, path: rule.prop ? `/props/${rule.prop}` : '/props', message: detail, source: rule.source, decision: rule.decision };
  });
}
