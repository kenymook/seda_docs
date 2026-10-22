import test from 'node:test';
import assert from 'node:assert/strict';
import { createFormState, transitionForm, formEvents } from '../src/form.mjs';

const policy = Object.freeze({
  model: 'settings-form-v1',
  owner: 'form',
  field: 'projectName',
  validationRule: 'trimmed-non-empty',
  requiredMessage: 'Введите название проекта.',
  saveFailureMessage: 'Не удалось сохранить изменения. Попробуйте ещё раз.',
  noValidate: true,
  submitGuard: 'while-saving',
  inputDuringSaving: 'editable',
  responsePolicy: 'request-id-and-snapshot',
  cancelDuringSaving: 'blocked',
});

const checks = new Set();
function check(id, description, run) {
  checks.add(id);
  test(`${id}: ${description}`, run);
}
const apply = (state, event) => transitionForm(state, event, policy);
const change = (state, value) => apply(state, { type: 'change', value }).state;
const submit = state => apply(state, { type: 'submit', route: 'click' });

check('F01', 'raw editing before validation does not normalize or show an error', () => {
  const initial = createFormState('Сохранённое имя');
  assert.equal(initial.savedValue, 'Сохранённое имя');
  assert.equal(initial.dirty, false);
  const { state, effects } = apply(initial, { type: 'change', value: '   ' });
  assert.equal(state.projectName, '   ');
  assert.equal(state.projectName.length > 0, true);
  assert.equal(state.fieldError, undefined);
  assert.equal(state.touched, false);
  assert.equal(state.hasShownError, false);
  assert.equal(state.dirty, true);
  assert.deepEqual(effects, []);
  assert.equal(initial.projectName, 'Сохранённое имя');
  assert.equal(change(initial, 'Сохранённое имя').dirty, false);
  assert.throws(() => createFormState(null), /initialValue/);
});

check('F02', 'blur distinguishes nonempty raw data from whitespace validation', () => {
  const before = change(createFormState(), ' \t ');
  const { state, effects } = apply(before, { type: 'blur' });
  assert.equal(state.projectName, ' \t ');
  assert.equal(state.projectName.length > 0, true);
  assert.equal(state.touched, true);
  assert.equal(state.attemptedSubmit, false);
  assert.equal(state.hasShownError, true);
  assert.equal(state.fieldError, policy.requiredMessage);
  assert.deepEqual(effects, []);
  const valid = apply(createFormState('Имя'), { type: 'blur' }).state;
  assert.equal(valid.touched, true);
  assert.equal(valid.hasShownError, false);
  assert.equal(valid.fieldError, undefined);
});

check('F03', 'invalid submit preserves input, shows error, and emits focus without save', () => {
  for (const value of ['', '   ', '\n\t']) {
    const before = change(createFormState('Исходное'), value);
    const { state, effects } = submit(before);
    assert.equal(state.projectName, value);
    assert.equal(state.savedValue, 'Исходное');
    assert.equal(state.attemptedSubmit, true);
    assert.equal(state.hasShownError, true);
    assert.equal(state.fieldError, policy.requiredMessage);
    assert.equal(state.saving, false);
    assert.equal(state.activeRequest, null);
    assert.equal(state.requestSequence, 0);
    assert.deepEqual(effects, [{ type: 'focus', target: 'projectName' }]);
  }
});

check('F04', 'once shown, errors revalidate on every input even after being cleared', () => {
  const invalid = apply(createFormState(), { type: 'blur' }).state;
  const corrected = change(invalid, 'Исправлено');
  assert.equal(corrected.fieldError, undefined);
  assert.equal(corrected.hasShownError, true);
  const invalidAgain = change(corrected, ' ');
  assert.equal(invalidAgain.fieldError, policy.requiredMessage);
  assert.equal(invalidAgain.projectName, ' ');
  assert.equal(change(invalidAgain, ' Новое ').projectName, ' Новое ');
});

check('F05', 'valid submit emits a raw snapshot and monotonically identified save', () => {
  const before = change(createFormState('Исходное'), '  Новое имя  ');
  const { state, effects } = submit(before);
  assert.deepEqual(effects, [{ type: 'save', requestId: 1, value: '  Новое имя  ' }]);
  assert.deepEqual(state.activeRequest, { id: 1, value: '  Новое имя  ' });
  assert.equal(state.projectName, '  Новое имя  ');
  assert.equal(state.savedValue, 'Исходное');
  assert.equal(state.saving, true);
  assert.equal(state.attemptedSubmit, true);
  assert.equal(state.fieldError, undefined);
  assert.equal(state.requestSequence, 1);
  assert.equal(before.saving, false);
});

check('F06', 'the form guard blocks every submit route during saving', () => {
  const pending = submit(change(createFormState(), 'A')).state;
  for (const route of ['click', 'enter', 'programmatic', 'retry']) {
    const result = apply(pending, { type: 'submit', route });
    assert.equal(result.state, pending);
    assert.deepEqual(result.effects, []);
    assert.equal(result.state.requestSequence, 1);
  }
});

check('F07', 'success for A keeps newer B editable and dirty', () => {
  const pendingA = submit(change(createFormState('Исходное'), 'A')).state;
  const withB = change(pendingA, 'B');
  assert.equal(withB.saving, true);
  assert.deepEqual(withB.activeRequest, { id: 1, value: 'A' });
  const { state, effects } = apply(withB, { type: 'saveSucceeded', requestId: 1 });
  assert.equal(state.projectName, 'B');
  assert.equal(state.savedValue, 'A');
  assert.equal(state.dirty, true);
  assert.equal(state.saving, false);
  assert.equal(state.activeRequest, null);
  assert.deepEqual(effects, []);
});

check('F08', 'failure stays a form error and retry captures current B with a new ID', () => {
  const pendingA = submit(change(createFormState('Исходное'), 'A')).state;
  const withB = change(pendingA, 'B');
  const failed = apply(withB, { type: 'saveFailed', requestId: 1 }).state;
  assert.equal(failed.projectName, 'B');
  assert.equal(failed.savedValue, 'Исходное');
  assert.equal(failed.fieldError, undefined);
  assert.equal(failed.saveError, policy.saveFailureMessage);
  assert.equal(failed.saving, false);
  const retry = apply(failed, { type: 'submit', route: 'retry' });
  assert.deepEqual(retry.effects, [{ type: 'save', requestId: 2, value: 'B' }]);
  assert.equal(retry.state.saveError, undefined);
  assert.equal(retry.state.fieldError, undefined);
  for (const type of ['saveSucceeded', 'saveFailed']) {
    const stale = apply(retry.state, { type, requestId: 1 });
    assert.equal(stale.state, retry.state);
    assert.deepEqual(stale.effects, []);
  }
  const saved = apply(retry.state, { type: 'saveSucceeded', requestId: 2 }).state;
  assert.equal(saved.projectName, 'B');
  assert.equal(saved.savedValue, 'B');
  assert.equal(saved.dirty, false);
  const invalidRetry = apply(change(failed, ' '), { type: 'submit', route: 'retry' });
  assert.equal(invalidRetry.state.saving, false);
  assert.equal(invalidRetry.state.fieldError, policy.requiredMessage);
  assert.deepEqual(invalidRetry.effects, [{ type: 'focus', target: 'projectName' }]);
});

check('F09', 'wrong, duplicate, and inactive response IDs have no effects', () => {
  const idle = createFormState('A');
  const pending = submit(idle).state;
  const completed = apply(pending, { type: 'saveSucceeded', requestId: 1 }).state;
  for (const [before, requestId] of [[idle, 1], [pending, 99], [completed, 1]]) {
    for (const type of ['saveSucceeded', 'saveFailed']) {
      const result = apply(before, { type, requestId });
      assert.equal(result.state, before);
      assert.deepEqual(result.effects, []);
    }
  }
});

check('F10', 'idle cancel restores saved data and clears errors without reusing IDs', () => {
  const pending = submit(change(createFormState('Сохранённое'), 'Попытка')).state;
  const failed = apply(pending, { type: 'saveFailed', requestId: 1 }).state;
  const invalid = submit(change(failed, ' ')).state;
  const touched = apply(invalid, { type: 'blur' }).state;
  const before = apply(touched, { type: 'toggleHelp' }).state;
  const { state, effects } = apply(before, { type: 'cancel' });
  assert.equal(state.projectName, 'Сохранённое');
  assert.equal(state.savedValue, 'Сохранённое');
  assert.equal(state.dirty, false);
  assert.equal(state.touched, false);
  assert.equal(state.attemptedSubmit, false);
  assert.equal(state.hasShownError, false);
  assert.equal(state.fieldError, undefined);
  assert.equal(state.saveError, undefined);
  assert.equal(state.helpExpanded, true);
  assert.equal(state.requestSequence, 1);
  assert.deepEqual(effects, []);
  assert.equal(submit(change(state, 'Следующее')).effects[0].requestId, 2);
});

check('F11', 'cancel while saving does not reset data or invent a transport abort', () => {
  const pending = change(submit(createFormState('A')).state, 'B');
  const result = apply(pending, { type: 'cancel' });
  assert.equal(result.state, pending);
  assert.deepEqual(result.effects, []);
});

check('F12', 'profile changes preserve the whole state identity during a pending request', () => {
  const invalid = apply(createFormState(), { type: 'blur' }).state;
  const pending = submit(change(invalid, 'A')).state;
  const edited = change(pending, ' ');
  const before = apply(edited, { type: 'toggleHelp' }).state;
  const snapshot = structuredClone(before);
  const result = apply(before, { type: 'profileChanged' });
  assert.equal(result.state, before);
  assert.deepEqual(result.state, snapshot);
  assert.deepEqual(result.effects, []);
});

check('F13', 'help toggles without moving focus or setting selection state', () => {
  const initial = createFormState('A');
  const open = apply(initial, { type: 'toggleHelp' });
  assert.equal(open.state.helpExpanded, true);
  assert.equal(open.state.projectName, 'A');
  assert.deepEqual(open.effects, []);
  const close = apply(open.state, { type: 'toggleHelp' });
  assert.equal(close.state.helpExpanded, false);
  assert.deepEqual(close.effects, []);
  assert.equal(Object.hasOwn(close.state, 'selected'), false);
});

check('F14', 'invalid and unknown events fail before any ignored-event shortcut', () => {
  const pending = submit(createFormState('A')).state;
  const bad = [
    null, [], {}, { type: 'unknown' }, { type: 'toString' },
    { type: 'change' }, { type: 'change', value: null }, { type: 'change', value: 4 },
    { type: 'change', value: 'A', normalize: true },
    { type: 'submit' }, { type: 'submit', route: 'keyboard' },
    { type: 'cancel', abort: true }, { type: 'profileChanged', reset: true },
    { type: 'saveSucceeded', requestId: 0 },
    { type: 'saveSucceeded', requestId: '1' },
    { type: 'saveFailed', requestId: 1.1 },
    { type: 'saveFailed', requestId: Number.MAX_SAFE_INTEGER + 1 },
  ];
  for (const event of bad) assert.throws(() => apply(pending, event), TypeError);
});

check('F15', 'unknown or incomplete policy semantics never pass silently', () => {
  const state = createFormState('A');
  for (const [key, value] of Object.entries(policy)) {
    const removed = { ...policy };
    delete removed[key];
    assert.throws(() => transitionForm(state, { type: 'profileChanged' }, removed), TypeError);
    const unsupported = { ...policy, [key]: typeof value === 'boolean' ? false : '' };
    assert.throws(() => transitionForm(state, { type: 'profileChanged' }, unsupported), TypeError);
  }
  for (const changed of [
    { ...policy, validationRule: 'email' },
    { ...policy, responsePolicy: 'latest-value' },
    { ...policy, cancelDuringSaving: 'abort' },
    { ...policy, requiredMessage: ' \t ' },
    { ...policy, saveFailureMessage: 42 },
    { ...policy, ignoredFutureSetting: true },
  ]) assert.throws(() => transitionForm(state, { type: 'profileChanged' }, changed), TypeError);
  const custom = { ...policy, requiredMessage: 'Required', saveFailureMessage: 'Save failed' };
  const error = transitionForm(createFormState(), { type: 'blur' }, custom).state;
  assert.equal(error.fieldError, 'Required');
});

check('F16', 'transitions are pure with frozen input state, request, event, and policy', () => {
  const initial = Object.freeze(createFormState('Сохранённое'));
  const edited = apply(initial, Object.freeze({ type: 'change', value: 'A' })).state;
  const result = submit(Object.freeze(edited));
  Object.freeze(result.state.activeRequest);
  Object.freeze(result.state);
  const before = structuredClone(result.state);
  const newer = apply(result.state, Object.freeze({ type: 'change', value: 'B' })).state;
  const success = apply(Object.freeze(newer), Object.freeze({ type: 'saveSucceeded', requestId: 1 }));
  assert.equal(success.state.projectName, 'B');
  assert.equal(success.state.savedValue, 'A');
  assert.deepEqual(result.state, before);
  assert.equal(initial.projectName, 'Сохранённое');
});

check('F17', 'corrupt state is rejected instead of producing contradictory transitions', () => {
  const base = createFormState('A');
  const corrupt = [
    { ...base, dirty: true },
    { ...base, saving: true },
    { ...base, requestSequence: -1 },
    { ...base, projectName: 12 },
    { ...base, touched: 'true' },
    { ...base, fieldError: 'Error', hasShownError: false },
    { ...base, activeRequest: { id: 1, value: 'A' }, saving: true },
    { ...base, extra: true },
  ];
  for (const state of corrupt) assert.throws(() => apply(state, { type: 'profileChanged' }), TypeError);
  const exhausted = { ...base, requestSequence: Number.MAX_SAFE_INTEGER };
  assert.throws(() => submit(exhausted), RangeError);
  const restored = JSON.parse(JSON.stringify(base));
  assert.equal(apply(restored, { type: 'profileChanged' }).state, restored);
});

test('form event metadata references actual model checks and covers every event', () => {
  assert.deepEqual(formEvents.map(item => item.event).sort(), [
    'blur', 'cancel', 'change', 'profileChanged', 'saveFailed', 'saveSucceeded', 'submit', 'toggleHelp',
  ]);
  for (const item of formEvents) {
    assert.equal(item.owner, 'form');
    assert.equal(item.verificationLayer, 'model');
    assert.equal(item.checkIds.length > 0, true);
    for (const id of item.checkIds) assert.equal(checks.has(id), true, `Unimplemented check ${id}`);
    for (const key of ['condition', 'action', 'expected']) assert.equal(item[key].length > 0, true);
  }
});
