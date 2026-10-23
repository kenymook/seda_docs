import { componentNames } from './registry.mjs';
const own = (o, key) => Object.prototype.hasOwnProperty.call(o, key);
const browserChecks = new Set(['control-geometry', 'focus-visible', 'stable-loading-width', 'description-merge', 'disabled-error-presentation', 'component-token-binding', 'icon-box', 'full-tooltip']);
const instanceChecks = new Set(['text-content', 'slot-present', 'controlled-value', 'error-message', 'native-disabled', 'aria-disabled-activation', 'persistent-selection-unused', 'pilot-variant', 'selection-value', 'checked-value']);
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
  const disabled = props.disabled === true;
  const loading = props.loading === true;
  const error = ['TextField','Select','Checkbox','Radio'].includes(component) && content(props.errorText) !== 'empty';
  const focused = interaction.focused ?? false;
  const hovered = interaction.hovered ?? false;
  const active = interaction.active ?? false;
  return {
    availability: disabled ? 'disabled' : 'enabled',
    activity: loading ? 'loading' : 'idle',
    validation: disabled ? 'none' : error ? 'error' : 'none',
    interaction: { hovered, focused, active },
    data: ['Checkbox','Toggle'].includes(component) ? (props.indeterminate ? 'indeterminate' : (props.checked ?? props.defaultChecked) ? 'checked' : 'unchecked') : ['TextField','Select','Radio'].includes(component) ? ((props.value ?? props.defaultValue)?.length > 0 ? 'filled' : 'empty') : null,
    tokenState: disabled ? 'disabled' : loading ? 'loading' : error ? 'error' : active ? (['TextField','Select','Checkbox','Radio','Toggle'].includes(component) ? 'active' : 'pressed') : hovered ? 'hover' : component === 'Checkbox' && props.indeterminate ? 'indeterminate' : component === 'Checkbox' && (props.checked ?? props.defaultChecked) ? 'checked' : component === 'Radio' && (props.value ?? props.defaultValue) ? 'selected' : component === 'Toggle' ? ((props.checked ?? props.defaultChecked) ? 'on' : 'off') : 'default',
    focusRing: focused && !disabled,
  };
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
