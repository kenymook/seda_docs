import { controlParameterMetadata } from './control-geometry.mjs';

const rangeNames = ['scale', 'air', 'airX', 'radius'];
const runtimeNames = { scale: 'scale', air: 'extraPaddingBlock', airX: 'extraPaddingInline', radius: 'radiusScale' };

function assert(condition, message) {
  if (!condition) throw new TypeError(`Owner policy: ${message}`);
}

/** Validate the owner's allowed choices against the executable system and profile. */
export function validateOwnerPolicy(policy, system, profile) {
  assert(policy?.schemaVersion === '0.1.0' && policy?.kind === 'seda-owner-policy', 'unsupported version or kind');
  assert(Array.isArray(policy.availableThemes) && policy.availableThemes.length > 0, 'availableThemes must be nonempty');
  assert(Array.isArray(policy.availableSizes) && policy.availableSizes.length > 0, 'availableSizes must be nonempty');
  assert(new Set(policy.availableThemes).size === policy.availableThemes.length, 'duplicate theme');
  assert(new Set(policy.availableSizes).size === policy.availableSizes.length, 'duplicate size');
  for (const theme of policy.availableThemes) assert(system.supportedThemes.includes(theme), `unsupported theme ${theme}`);
  for (const size of policy.availableSizes) assert(Object.hasOwn(system.sizes, size), `unsupported size ${size}`);
  assert(policy.defaultConfiguration && Object.keys(policy.defaultConfiguration).sort().join(',') === 'controlSize,theme', 'defaultConfiguration requires theme and controlSize');
  assert(policy.availableThemes.includes(policy.defaultConfiguration.theme), 'default theme is unavailable');
  assert(policy.availableSizes.includes(policy.defaultConfiguration.controlSize), 'default size is unavailable');
  assert(system.supportedDensities.includes(profile.configuration.density), 'profile density is unsupported');
  assert(policy.controls && Object.keys(policy.controls).sort().join(',') === [...rangeNames, 'strict'].sort().join(','), 'controls must contain exactly scale, air, airX, radius and strict');
  const runtimeRanges = controlParameterMetadata().ranges;
  for (const name of rangeNames) {
    const range = policy.controls[name];
    assert(range && Object.keys(range).sort().join(',') === 'default,max,min,step', `${name} requires min, max, step and default`);
    for (const key of ['min', 'max', 'step', 'default']) assert(Number.isFinite(range[key]), `${name}.${key} must be finite`);
    assert(range.min <= range.max && range.step > 0, `${name} has an invalid range`);
    const runtime = runtimeRanges[runtimeNames[name]];
    const factor = name === 'radius' ? 100 : 1;
    assert(range.min >= runtime.min * factor && range.max <= runtime.max * factor, `${name} exceeds executable geometry limits`);
    assert(range.default >= range.min && range.default <= range.max, `${name}.default is outside the range`);
    for (const value of [range.default, range.max]) {
      const steps = (value - range.min) / range.step;
      assert(Math.abs(steps - Math.round(steps)) < 1e-8, `${name}.${value === range.default ? 'default' : 'max'} is off step`);
    }
  }
  assert(Object.keys(policy.controls.strict ?? {}).join(',') === 'default' && typeof policy.controls.strict.default === 'boolean', 'strict.default must be boolean');
  return policy;
}
