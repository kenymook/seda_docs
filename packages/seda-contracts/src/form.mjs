/**
 * Executable event semantics for the settings-form-v1 contract.
 * This pure model does not implement React rendering, DOM focus, or a transport.
 * A host executes the returned save/focus effects and reports responses by ID.
 */

const fixedPolicy = Object.freeze({
  model: 'settings-form-v1',
  owner: 'form',
  field: 'projectName',
  validationRule: 'trimmed-non-empty',
  noValidate: true,
  submitGuard: 'while-saving',
  inputDuringSaving: 'editable',
  responsePolicy: 'request-id-and-snapshot',
  cancelDuringSaving: 'blocked',
});

const eventFields = Object.freeze({
  change: ['type', 'value'],
  blur: ['type'],
  submit: ['type', 'route'],
  saveSucceeded: ['type', 'requestId'],
  saveFailed: ['type', 'requestId'],
  cancel: ['type'],
  toggleHelp: ['type'],
  profileChanged: ['type'],
});

const submitRoutes = new Set(['click', 'enter', 'programmatic', 'retry']);
const stateFields = [
  'projectName', 'savedValue', 'touched', 'attemptedSubmit', 'hasShownError',
  'fieldError', 'saveError', 'saving', 'requestSequence', 'activeRequest',
  'helpExpanded', 'dirty',
];

function record(value, path) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError(`${path} must be a plain object`);
  }
}

function exactKeys(value, allowed, path, optional = []) {
  record(value, path);
  for (const key of Reflect.ownKeys(value)) {
    if (!allowed.includes(key)) throw new TypeError(`${path}.${String(key)} is not supported`);
  }
  for (const key of allowed) {
    if (!optional.includes(key) && !Object.hasOwn(value, key)) {
      throw new TypeError(`${path}.${key} is required`);
    }
  }
}

function string(value, path, nonempty = false) {
  if (typeof value !== 'string' || (nonempty && value.trim().length === 0)) {
    throw new TypeError(`${path} must be ${nonempty ? 'a nonempty' : 'a'} string`);
  }
}

function positiveId(value, path) {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new TypeError(`${path} must be a positive safe integer`);
  }
}

function validatePolicy(policy) {
  exactKeys(policy, [...Object.keys(fixedPolicy), 'requiredMessage', 'saveFailureMessage'], 'policy');
  for (const [key, expected] of Object.entries(fixedPolicy)) {
    if (policy[key] !== expected) throw new TypeError(`policy.${key} must be ${JSON.stringify(expected)}`);
  }
  string(policy.requiredMessage, 'policy.requiredMessage', true);
  string(policy.saveFailureMessage, 'policy.saveFailureMessage', true);
}

function validateEvent(event) {
  record(event, 'event');
  if (typeof event.type !== 'string' || !Object.hasOwn(eventFields, event.type)) {
    throw new TypeError(`event.type is not supported: ${String(event.type)}`);
  }
  exactKeys(event, eventFields[event.type], 'event');
  if (event.type === 'change') string(event.value, 'event.value');
  if (event.type === 'submit' && !submitRoutes.has(event.route)) {
    throw new TypeError('event.route must be click, enter, programmatic, or retry');
  }
  if (event.type === 'saveSucceeded' || event.type === 'saveFailed') {
    positiveId(event.requestId, 'event.requestId');
  }
}

function validateState(state) {
  exactKeys(state, stateFields, 'state', ['fieldError', 'saveError']);
  string(state.projectName, 'state.projectName');
  string(state.savedValue, 'state.savedValue');
  for (const key of ['touched', 'attemptedSubmit', 'hasShownError', 'saving', 'helpExpanded', 'dirty']) {
    if (typeof state[key] !== 'boolean') throw new TypeError(`state.${key} must be a boolean`);
  }
  for (const key of ['fieldError', 'saveError']) {
    if (state[key] !== undefined) string(state[key], `state.${key}`, true);
  }
  if (!Number.isSafeInteger(state.requestSequence) || state.requestSequence < 0) {
    throw new TypeError('state.requestSequence must be a nonnegative safe integer');
  }
  if (state.activeRequest !== null) {
    exactKeys(state.activeRequest, ['id', 'value'], 'state.activeRequest');
    positiveId(state.activeRequest.id, 'state.activeRequest.id');
    string(state.activeRequest.value, 'state.activeRequest.value');
    if (state.activeRequest.id !== state.requestSequence) {
      throw new TypeError('state.activeRequest.id must equal state.requestSequence');
    }
  }
  if (state.saving !== (state.activeRequest !== null)) {
    throw new TypeError('state.saving must match the presence of state.activeRequest');
  }
  if (state.dirty !== (state.projectName !== state.savedValue)) {
    throw new TypeError('state.dirty must equal projectName !== savedValue');
  }
  if (state.fieldError !== undefined && !state.hasShownError) {
    throw new TypeError('state.fieldError requires state.hasShownError');
  }
}

export function createFormState(initialValue = '') {
  string(initialValue, 'initialValue');
  return {
    projectName: initialValue,
    savedValue: initialValue,
    touched: false,
    attemptedSubmit: false,
    hasShownError: false,
    fieldError: undefined,
    saveError: undefined,
    saving: false,
    requestSequence: 0,
    activeRequest: null,
    helpExpanded: false,
    dirty: false,
  };
}

function update(state, changes, effects = []) {
  const next = { ...state, ...changes };
  next.dirty = next.projectName !== next.savedValue;
  return { state: next, effects };
}

export function transitionForm(state, event, policy) {
  validatePolicy(policy);
  validateState(state);
  validateEvent(event);

  const unchanged = () => ({ state, effects: [] });
  const errorFor = value => value.trim().length > 0 ? undefined : policy.requiredMessage;

  switch (event.type) {
    case 'change':
      return update(state, {
        projectName: event.value,
        fieldError: state.hasShownError ? errorFor(event.value) : undefined,
      });

    case 'blur': {
      const fieldError = errorFor(state.projectName);
      return update(state, {
        touched: true,
        fieldError,
        hasShownError: state.hasShownError || fieldError !== undefined,
      });
    }

    case 'submit': {
      // Every submit route reaches this owner-level guard.
      if (state.saving) return unchanged();
      const fieldError = errorFor(state.projectName);
      if (fieldError !== undefined) {
        return update(state, {
          attemptedSubmit: true,
          hasShownError: true,
          fieldError,
          saveError: undefined,
        }, [{ type: 'focus', target: 'projectName' }]);
      }
      if (state.requestSequence === Number.MAX_SAFE_INTEGER) {
        throw new RangeError('state.requestSequence is exhausted');
      }
      const id = state.requestSequence + 1;
      const value = state.projectName;
      return update(state, {
        attemptedSubmit: true,
        fieldError: undefined,
        saveError: undefined,
        saving: true,
        requestSequence: id,
        activeRequest: { id, value },
      }, [{ type: 'save', requestId: id, value }]);
    }

    case 'saveSucceeded':
      if (state.activeRequest?.id !== event.requestId) return unchanged();
      return update(state, {
        savedValue: state.activeRequest.value,
        saveError: undefined,
        saving: false,
        activeRequest: null,
      });

    case 'saveFailed':
      if (state.activeRequest?.id !== event.requestId) return unchanged();
      return update(state, {
        saveError: policy.saveFailureMessage,
        saving: false,
        activeRequest: null,
      });

    case 'cancel':
      if (state.saving) return unchanged();
      return update(state, {
        projectName: state.savedValue,
        touched: false,
        attemptedSubmit: false,
        hasShownError: false,
        fieldError: undefined,
        saveError: undefined,
      });

    case 'toggleHelp':
      return update(state, { helpExpanded: !state.helpExpanded });

    case 'profileChanged':
      // Presentation belongs to the profile; no form reset/remount effect exists.
      return unchanged();
  }
}

/** Describes the implemented model checks; it makes no claim about browser UI. */
export const formEvents = Object.freeze([
  {
    event: 'change', owner: 'form',
    condition: 'A string value is received, including while saving.',
    action: 'Store the raw value; revalidate only after an error has been shown.',
    expected: 'The input is not trimmed; dirty compares the raw value with the saved snapshot.',
    checkIds: ['F01', 'F04', 'F07'], decisions: ['D07', 'D18', 'D20'],
  },
  {
    event: 'blur', owner: 'form',
    condition: 'The field loses focus.',
    action: 'Set touched and evaluate trimmed-non-empty.',
    expected: 'Whitespace is nonempty data but produces the required-field error.',
    checkIds: ['F02'], decisions: ['D17', 'D18'],
  },
  {
    event: 'submit', owner: 'form',
    condition: 'A click, enter, programmatic, or retry submit arrives.',
    action: 'Guard while saving; otherwise validate and capture the raw value with a new request ID.',
    expected: 'Invalid input emits focus only; valid input emits one save; pending submissions emit nothing.',
    checkIds: ['F03', 'F05', 'F06', 'F08'], decisions: ['D18', 'D19', 'D20', 'D21'],
  },
  {
    event: 'saveSucceeded', owner: 'form',
    condition: 'The response request ID matches the active request.',
    action: 'Mark the submitted snapshot saved and clear the active request.',
    expected: 'Newer input is retained; stale or duplicate responses have no effect.',
    checkIds: ['F07', 'F08', 'F09'], decisions: ['D20'],
  },
  {
    event: 'saveFailed', owner: 'form',
    condition: 'The response request ID matches the active request.',
    action: 'Expose a form error and clear the active request.',
    expected: 'Field validation is unchanged; retry validates and submits the current value.',
    checkIds: ['F08', 'F09'], decisions: ['D21'],
  },
  {
    event: 'cancel', owner: 'form',
    condition: 'Cancel is requested; saving blocks it.',
    action: 'When idle, restore the saved snapshot and clear local validation/save flags and errors.',
    expected: 'No transport abort is emitted; request IDs remain monotonic.',
    checkIds: ['F10', 'F11'], decisions: ['D17', 'D19', 'D20'],
  },
  {
    event: 'toggleHelp', owner: 'form',
    condition: 'The help action is activated.',
    action: 'Toggle helpExpanded.',
    expected: 'No focus effect is emitted; the host keeps focus on the help button.',
    checkIds: ['F13'], decisions: ['D15'],
  },
  {
    event: 'profileChanged', owner: 'form',
    condition: 'A presentation profile changes.',
    action: 'Preserve the entire form state object.',
    expected: 'No data, flags, active request, or help state changes; no remount/focus effect is emitted.',
    checkIds: ['F12'], decisions: ['D24'],
  },
].map(item => Object.freeze({
  ...item,
  checkIds: Object.freeze(item.checkIds),
  decisions: Object.freeze(item.decisions),
  verificationLayer: 'model',
})));
