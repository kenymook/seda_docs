import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateOwnerPolicy } from '../src/owner-policy.mjs';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const policy = read('../owner-policy.json');
const system = read('../system.json');
const profile = read('../profiles/settings-form.json');
const clone = () => structuredClone(policy);

test('owner choices are subsets of executable system values and include owner defaults', () => {
  assert.equal(validateOwnerPolicy(policy, system, profile), policy);
  const invalid = clone();
  invalid.availableSizes = ['xxl'];
  assert.throws(() => validateOwnerPolicy(invalid, system, profile), /unsupported size/);
  invalid.availableSizes = ['s'];
  assert.throws(() => validateOwnerPolicy(invalid, system, profile), /default size is unavailable/);
  invalid.defaultConfiguration.controlSize = 's';
  assert.equal(validateOwnerPolicy(invalid, system, profile), invalid);
  invalid.availableThemes = ['Dark'];
  assert.throws(() => validateOwnerPolicy(invalid, system, profile), /default theme is unavailable/);
  invalid.defaultConfiguration.theme = 'Dark';
  assert.equal(validateOwnerPolicy(invalid, system, profile), invalid);
});

test('owner range rejects out-of-range or off-step defaults', () => {
  const invalid = clone();
  invalid.controls.scale.default = 151;
  assert.throws(() => validateOwnerPolicy(invalid, system, profile), /outside the range/);
  invalid.controls.scale.default = 103;
  assert.throws(() => validateOwnerPolicy(invalid, system, profile), /off step/);
  invalid.controls.scale.default = 100;
  invalid.controls.scale.max = 201;
  assert.throws(() => validateOwnerPolicy(invalid, system, profile), /exceeds executable geometry limits/);
  invalid.controls.scale.max = 149;
  assert.throws(() => validateOwnerPolicy(invalid, system, profile), /max is off step/);
});
