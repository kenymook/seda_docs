import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createContractEngine, loadBundle } from '../../../../packages/seda-contracts/src/index.mjs';

const root = import.meta.dirname;
const canonicalRepoRoot = await fs.realpath(path.join(root, '../../../..'));
const repoRoot = await fs.realpath(path.resolve(process.env.SEDA_REPO_ROOT || canonicalRepoRoot));
if (repoRoot !== canonicalRepoRoot) throw new Error('SEDA_REPO_ROOT must resolve to this pilot checkout; the verifier and compiler must use the same source tree.');
const packageRoot = path.join(repoRoot, 'packages/seda-contracts');
const dist = path.resolve(process.env.SEDA_PILOT_DIST || path.join(root, 'dist'));
const output = path.resolve(process.env.SEDA_PILOT_OUTPUT || path.join(root, '.diagnostics'));
const url = new URL(process.env.SEDA_PILOT_URL || 'http://127.0.0.1:5184/');
url.searchParams.set('review', '1');
const bundle = loadBundle(packageRoot);
const require = createRequire(import.meta.url);
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const verifierHash = hash(await fs.readFile(new URL(import.meta.url)));
const near = (actual, expected, label, tolerance = 0.1) => assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual}, expected ${expected}`);
const ruleIds = component => bundle.contracts.find(contract => contract.id === component).rules.filter(rule => rule.layer === 'browser');
const results = [];
const errors = [];
const geometryEvidence = [];
let browser;
let page;
let buildMetadata;
let initialCompiled;

async function verifySources() {
  const sources = buildMetadata?.provenance?.sources;
  assert.ok(sources && Object.keys(sources).length > 0, 'Build metadata has no source hashes');
  const checked = await Promise.all(Object.entries(sources).map(async ([name, expected]) => {
    let absolute = path.resolve(repoRoot, name);
    assert.ok(absolute.startsWith(repoRoot + path.sep), `Source path escapes repository: ${name}`);
    if (name === 'tokens.json' && buildMetadata.provenance.tokenSource === 'provided-token-file') {
      assert.ok(process.env.SEDA_TOKENS_FILE, 'SEDA_TOKENS_FILE is required to verify an override-token build');
      absolute = path.resolve(process.env.SEDA_TOKENS_FILE);
    }
    const actual = hash(await fs.readFile(absolute));
    assert.equal(actual, expected, `Source changed after the build: ${name}`);
    return { path: name, sha256: actual };
  }));
  assert.equal(hash(await fs.readFile(new URL(import.meta.url))), verifierHash, 'Verifier source changed during execution');
  return checked;
}

async function check(id, description, rules, run) {
  const started = performance.now();
  try {
    const evidence = await run();
    results.push({ id, description, rules, status: 'passed', durationMs: Math.round(performance.now() - started), evidence });
    process.stdout.write(`PASS ${id}\n`);
  } catch (error) {
    results.push({ id, description, rules, status: 'violated', durationMs: Math.round(performance.now() - started), error: error.stack || String(error) });
    process.stdout.write(`FAIL ${id}: ${error.message}\n`);
  }
}

async function settle() {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function reset() {
  await page.evaluate(() => {
    window.sedaPilot.reset();
    window.sedaPilot.setTransportMode('manual');
    window.sedaReview.setLoading(false);
    window.sedaReview.setFieldProps({
      disabled: false, errorText: undefined, helperText: 'Локальное пояснение', state: 'default',
      description: 'review-description review-extra-description review-description review-field-message',
    });
    document.activeElement?.blur();
  });
  await page.mouse.move(2, 2);
  await settle();
}

async function configure(theme, controlSize = 'm') {
  await page.locator('#profile-theme').selectOption(theme);
  await page.locator('#profile-size').selectOption(controlSize);
  await page.evaluate(() => document.activeElement?.blur());
  await page.mouse.move(2, 2);
  await settle();
  return page.evaluate(() => window.sedaPilot.getCompiled());
}

const state = () => page.evaluate(() => window.sedaPilot.getState());
const requests = () => page.evaluate(() => window.sedaPilot.getRequests());

async function read(selector) {
  return page.locator(selector).evaluate(async element => {
    // Read the actual endpoint of CSS transitions. Infinite spinner motion is
    // excluded; no styles are patched or injected by the verification script.
    await new Promise(resolve => requestAnimationFrame(resolve));
    const finite = element.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().iterations ?? 1));
    await Promise.allSettled(finite.map(animation => animation.finished));
    const box = element.getBoundingClientRect();
    const css = getComputedStyle(element);
    return {
      width: box.width, height: box.height, x: box.x, y: box.y,
      boxSizing: css.boxSizing, radius: parseFloat(css.borderTopLeftRadius),
      fontSize: parseFloat(css.fontSize), lineHeight: parseFloat(css.lineHeight),
      fontFamily: css.fontFamily, fontWeight: css.fontWeight,
      paddingInline: parseFloat(css.paddingLeft), borderWidth: parseFloat(css.borderTopWidth),
      background: css.backgroundColor, color: css.color, border: css.borderTopColor,
      outline: { style: css.outlineStyle, width: parseFloat(css.outlineWidth), color: css.outlineColor, offset: parseFloat(css.outlineOffset) },
      boxShadow: css.boxShadow, opacity: css.opacity, visibility: css.visibility,
      focused: element === document.activeElement, focusVisible: element.matches(':focus-visible'),
      ariaInvalid: element.getAttribute('aria-invalid'), ariaDisabled: element.getAttribute('aria-disabled'),
      ariaDescribedBy: element.getAttribute('aria-describedby'),
    };
  });
}

async function color(value) {
  return page.evaluate(value => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.append(probe);
    const result = getComputedStyle(probe).color;
    probe.remove();
    return result;
  }, value);
}

function token(compiled, role, family, stateName = 'default') {
  const branch = compiled.instances[role].tokenBranch.children;
  const values = branch[family];
  const leaf = values?.[stateName] ?? values?.default;
  assert.ok(leaf, `Missing compiled ${role}/${family}/${stateName}`);
  return leaf;
}

async function paint(selector, compiled, role, stateName = 'default', { foregroundSelector } = {}) {
  const actual = await read(selector);
  const expected = {};
  for (const [family, property] of [['surface', 'background'], ['border', 'border'], ['foreground', 'color']]) {
    const leaf = token(compiled, role, family, stateName);
    expected[property] = await color(leaf.cssValue);
    const observed = family === 'foreground' && foregroundSelector ? (await read(foregroundSelector)).color : actual[property];
    assert.equal(observed, expected[property], `${role} ${stateName} ${property}`);
  }
  assert.equal(actual.opacity, '1', `${role} has no opacity multiplier over resolved colors`);
  return { actual, expected };
}

async function keyboardFocus(selector) {
  await page.locator('#profile-theme').focus();
  for (let index = 0; index < 36; index++) {
    await page.keyboard.press('Tab');
    if (await page.locator(selector).evaluate(element => element === document.activeElement)) return;
  }
  throw new Error(`Keyboard could not reach ${selector}`);
}

async function focusRing(selector, compiled, role) {
  const actual = await read(selector);
  const item = compiled.instances[role];
  const leaf = item.tokenBranch.children.focus?.ring ?? item.auxiliaryTokens?.focus?.children?.ring ?? item.auxiliaryTokens?.focus?.ring;
  const evidence = await page.evaluate(role => window.sedaPilot.getEvidence().recipes[role].evidence, role);
  const source = leaf ?? evidence.find(entry => entry.property === '--seda-focus-ring');
  assert.ok(source, `Missing ${role} focus source`);
  const expected = await color(source.cssValue);
  const outlineVisible = actual.outline.style !== 'none' && actual.outline.width > 0 && actual.outline.color !== 'rgba(0, 0, 0, 0)';
  const shadowVisible = actual.boxShadow !== 'none' && actual.boxShadow.includes(expected);
  assert.ok(outlineVisible || shadowVisible, `${role} has no visible actual focus indicator`);
  if (outlineVisible) assert.equal(actual.outline.color, expected, `${role} focus color`);
  return { actual, expected };
}

async function physicalClick(selector) {
  const box = await page.locator(selector).boundingBox();
  assert.ok(box, `${selector} has no box`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await settle();
}

async function reply(requestId, outcome) {
  await page.evaluate(({ requestId, outcome }) => window.sedaPilot.respond(requestId, outcome), { requestId, outcome });
  await settle();
}

await fs.mkdir(output, { recursive: true });
try {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(url.href, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.sedaPilot && window.sedaReview);
  await page.evaluate(() => document.fonts.ready);
  initialCompiled = await page.evaluate(() => window.sedaPilot.getCompiled());
  buildMetadata = JSON.parse(await fs.readFile(path.join(dist, 'build-metadata.json'), 'utf8'));

  await check('build-identity', 'Current source bytes and served assets match the build metadata, including font files.', [], async () => {
    assert.equal(buildMetadata.kind, 'seda-parametric-build');
    const sourceFiles = await verifySources();
    for (const required of ['index.html', 'app.js', 'app.css']) assert.ok(buildMetadata.artifacts.some(item => item.path === required), `Missing artifact hash for ${required}`);
    const measured = [];
    const artifacts = [...buildMetadata.artifacts, { path: 'build-metadata.json', sha256: hash(await fs.readFile(path.join(dist, 'build-metadata.json'))) }];
    for (const artifact of artifacts) {
      const name = artifact.path;
      const absolute = path.resolve(dist, name);
      assert.ok(absolute.startsWith(dist + path.sep), `Artifact path escapes output: ${name}`);
      const local = await fs.readFile(absolute);
      assert.equal(hash(local), artifact.sha256, `Local artifact differs from build metadata: ${name}`);
      const response = await page.request.get(new URL(name, url).href);
      assert.ok(response.ok(), `Cannot read served ${name}`);
      const actual = hash(await response.body());
      assert.equal(actual, artifact.sha256, `Served ${name} differs from the local build`);
      measured.push({ file: name, sha256: actual });
    }
    return { sources: sourceFiles, artifacts: measured, verifierSha256: verifierHash };
  });

  await check('font-loaded', 'Inter Latin and Cyrillic faces load before geometry is measured.', [], async () => {
    const fonts = await page.evaluate(() => ({
      normal: document.fonts.check('400 14px Inter', 'SEDA AI Название проекта'),
      semibold: document.fonts.check('600 14px Inter', 'SEDA AI Название проекта'),
      faces: [...document.fonts].filter(face => face.family.replaceAll('"', '') === 'Inter').map(face => ({ family: face.family, weight: face.weight, status: face.status })),
    }));
    assert.ok(fonts.normal && fonts.semibold, 'Inter required text is not loaded');
    assert.ok(fonts.faces.some(face => face.status === 'loaded'), 'No actual Inter FontFace loaded');
    return fonts;
  });

  for (const theme of ['Light', 'Dark']) for (const size of ['s', 'm', 'l', 'xl']) {
    await check(`geometry-${theme}-${size}`, 'Measured boxes, typography and icons match the compiled preset.', ['Button.geometry', 'IconButton.geometry', 'IconButton.icon-box', 'TextField.geometry'], async () => {
      await reset();
      const compiled = await configure(theme, size);
      const geometry = compiled.geometry;
      const measured = {};
      for (const [role, selector] of [['save', '#save-button'], ['cancel', '#cancel-button'], ['help', '#help-button'], ['field', '#project-name']]) {
        const controlSelector = role === 'field' ? '#project-name >> xpath=..' : selector;
        const box = await read(controlSelector);
        const type = await read(selector);
        near(box.height, geometry.height.value, `${role} height`);
        near(box.radius, geometry.radius.value, `${role} radius`);
        near(box.borderWidth, geometry.borderWidth.value, `${role} border width`);
        assert.equal(box.boxSizing, 'border-box', `${role} box sizing`);
        near(type.fontSize, geometry.fontSize.value, `${role} font size`);
        near(type.lineHeight, geometry.lineHeight.value, `${role} line height`);
        assert.ok(type.fontFamily.includes(compiled.typography.family.value), `${role} font family`);
        if (role === 'help') near(box.width, geometry.height.value, 'IconButton square width');
        if (role === 'field') near(box.paddingInline, geometry.textFieldPaddingInline.value, 'TextField inline padding');
        if (role === 'save' || role === 'cancel') near(box.paddingInline, geometry.buttonPaddingInline.value, `${role} inline padding`);
        measured[role] = { box, type };
      }
      measured.icon = await read('#help-button svg');
      near(measured.icon.width, geometry.iconSize.value, 'Help icon width');
      near(measured.icon.height, geometry.iconSize.value, 'Help icon height');
      const fieldLabel = await read('#project-name >> xpath=ancestor::label[1]//span[contains(@class,"seda-field__label")]');
      near(fieldLabel.fontSize, geometry.fontSize.value, 'Field label font size');
      near(fieldLabel.lineHeight, geometry.lineHeight.value, 'Field label line height');
      assert.equal(Number(fieldLabel.fontWeight), compiled.typography.field.weight.cssValue, 'Field label font weight');
      const message = await read('#review-field-message');
      near(message.fontSize, geometry.fontSize.value, 'Message follows effective field font');
      near(message.lineHeight, geometry.lineHeight.value, 'Message follows effective field line');
      const cancelLabel = await read('#cancel-button .seda-button__label');
      near(measured.cancel.box.width, cancelLabel.width + 2 * geometry.buttonPaddingInline.value + 2 * geometry.borderWidth.value, 'Cancel has no loading slot gap', 0.2);
      const fieldsBlock = await read('.settings-fields');
      const actionsBlock = await read('.settings-actions');
      const fieldsToActions = actionsBlock.y - fieldsBlock.y - fieldsBlock.height;
      near(fieldsToActions, compiled.layout.fieldsToActions.value, 'Fields block to action row gap');
      const actionsGap = measured.cancel.box.x - measured.save.box.x - measured.save.box.width;
      near(actionsGap, compiled.layout.actionsGap.value, 'Save to Cancel gap');
      const record = { configuration: compiled.configuration, measured, label: fieldLabel, message, layout: { fieldsBlock, actionsBlock, fieldsToActions, actionsGap } };
      geometryEvidence.push(record);
      return record;
    });
  }

  for (const theme of ['Light', 'Dark']) {
    await check(`paint-${theme}`, 'DOM states select actual component color roles in each theme.', ['Button.token-binding', 'IconButton.token-binding', 'TextField.token-binding'], async () => {
      await reset();
      const compiled = await configure(theme);
      const observations = [];
      for (const [role, selector] of [['save', '#save-button'], ['cancel', '#cancel-button'], ['help', '#help-button']]) {
        await page.mouse.move(2, 2);
        await page.evaluate(() => document.activeElement?.blur());
        observations.push({ role, state: 'default', ...await paint(selector, compiled, role) });
        await page.locator(selector).hover();
        observations.push({ role, state: 'hover', ...await paint(selector, compiled, role, 'hover') });
        await page.mouse.down();
        try { observations.push({ role, state: 'pressed', ...await paint(selector, compiled, role, 'pressed') }); }
        finally { await page.mouse.move(2, 2); await page.mouse.up(); }
      }
      await page.evaluate(() => document.activeElement?.blur());
      observations.push({ role: 'projectName', state: 'default', ...await paint('#project-name >> xpath=..', compiled, 'projectName', 'default', { foregroundSelector: '#project-name' }) });
      await page.locator('#project-name').hover();
      observations.push({ role: 'projectName', state: 'hover', ...await paint('#project-name >> xpath=..', compiled, 'projectName', 'hover', { foregroundSelector: '#project-name' }) });
      await page.mouse.down();
      try { observations.push({ role: 'projectName', state: 'active', ...await paint('#project-name >> xpath=..', compiled, 'projectName', 'active', { foregroundSelector: '#project-name' }) }); }
      finally { await page.mouse.move(2, 2); await page.mouse.up(); }
      await page.locator('#project-name').click();
      observations.push({ role: 'projectName', state: 'focus', ...await paint('#project-name >> xpath=..', compiled, 'projectName', 'focus', { foregroundSelector: '#project-name' }) });
      await page.locator('#project-name').fill('   ');
      await page.keyboard.press('Enter');
      await settle();
      observations.push({ role: 'projectName', state: 'error+focus', ...await paint('#project-name >> xpath=..', compiled, 'projectName', 'error', { foregroundSelector: '#project-name' }) });
      await page.evaluate(() => window.sedaReview.setFieldProps({ disabled: true, errorText: 'Сохранённая ошибка' }));
      await settle();
      observations.push({ role: 'projectName', state: 'disabled', ...await paint('#review-field >> xpath=..', compiled, 'projectName', 'disabled', { foregroundSelector: '#review-field' }) });
      await page.locator('#project-name').fill('Цвета при сохранении');
      await page.locator('#save-button').click();
      await settle();
      observations.push({ role: 'save', state: 'loading', ...await paint('#save-button', compiled, 'save', 'loading') });
      observations.push({ role: 'cancel', state: 'disabled', ...await paint('#cancel-button', compiled, 'cancel', 'disabled') });
      return observations;
    });

    await check(`focus-${theme}`, 'Keyboard focus remains visible on actions and error input.', ['Button.focus', 'IconButton.focus', 'TextField.focus'], async () => {
      await reset();
      const compiled = await configure(theme);
      const observations = {};
      for (const [role, selector] of [['save', '#save-button'], ['cancel', '#cancel-button'], ['help', '#help-button']]) {
        await keyboardFocus(selector);
        assert.ok((await read(selector)).focusVisible, `${role} receives actual keyboard focus`);
        observations[role] = await focusRing(selector, compiled, role);
      }
      await keyboardFocus('#project-name');
      observations.field = await focusRing('#project-name >> xpath=..', compiled, 'projectName');
      await page.locator('#project-name').fill('   ');
      await page.keyboard.press('Enter');
      await settle();
      assert.ok((await read('#project-name')).focused, 'Invalid submission focuses the actual input');
      assert.equal(await page.locator('#project-name').getAttribute('aria-invalid'), 'true');
      observations.error = await focusRing('#project-name >> xpath=..', compiled, 'projectName');
      await page.evaluate(() => window.sedaReview.setFieldProps({ state: 'focus', errorText: undefined }));
      await page.locator('#review-focus-before').focus();
      await settle();
      const preview = await read('#review-field >> xpath=..');
      assert.ok(!await page.locator('#review-field').evaluate(element => element === document.activeElement));
      assert.ok(preview.outline.style === 'none' || preview.outline.width === 0, 'state=focus must not draw a real focus ring');
      assert.equal(preview.boxShadow, 'none', 'state=focus must not draw a shadow focus ring');
      return { ...observations, unfocusedPreview: preview };
    });
  }

  for (const size of ['s', 'm', 'l', 'xl']) {
    await check(`loading-slots-${size}`, 'No/left/right/both icon layouts retain width, label position and focus while loading.', ['Button.loading-width', 'Button.focus'], async () => {
      await reset();
      const compiled = await configure('Light', size);
      const evidence = [];
      for (const slots of ['none', 'left', 'right', 'both']) {
        await page.evaluate(() => window.sedaReview.setLoading(false));
        await settle();
        const selector = `#review-button-${slots}`;
        await keyboardFocus(selector);
        const before = await read(selector);
        const labelBefore = await read(`${selector} .seda-button__label`);
        await page.evaluate(() => window.sedaReview.setLoading(true));
        await settle();
        const after = await read(selector);
        const labelAfter = await read(`${selector} .seda-button__label`);
        near(after.width, before.width, `${slots} loading width`);
        near(after.height, before.height, `${slots} loading height`);
        near(labelAfter.x, labelBefore.x, `${slots} label x position`);
        assert.ok(after.focused && after.focusVisible, `${slots} loading retains keyboard focus`);
        await focusRing(selector, compiled, 'save');
        assert.equal(after.ariaDisabled, 'true');
        assert.equal(await page.locator(`${selector} .seda-button__label`).innerText(), 'Сохранить');
        assert.equal(labelAfter.visibility, 'visible');
        assert.equal(labelAfter.opacity, '1');
        const spinner = await read(`${selector} .seda-button__spinner`);
        near(spinner.width, compiled.geometry.iconSize.value, 'Spinner width');
        near(spinner.height, compiled.geometry.iconSize.value, 'Spinner height');
        const countBefore = await page.evaluate(() => window.sedaReview.getState().activations);
        await physicalClick(selector);
        await page.keyboard.press('Enter');
        await page.keyboard.press('Space');
        assert.equal(await page.evaluate(() => window.sedaReview.getState().activations), countBefore, 'Loading action never calls onClick');
        evidence.push({ slots, before, after, labelBefore, labelAfter, spinner });
      }
      return evidence;
    });
  }

  await check('description-and-disabled-error', 'External descriptions survive, IDs deduplicate, disabled hides validation presentation.', ['TextField.description', 'TextField.disabled-error'], async () => {
    await reset();
    const compiled = await configure('Light');
    const external = ['review-description', 'review-extra-description'];
    const expected = [...external, 'review-field-message'];
    const ids = async () => (await page.locator('#review-field').getAttribute('aria-describedby')).trim().split(/\s+/);
    assert.deepEqual(await ids(), expected);
    await page.evaluate(() => window.sedaReview.setFieldProps({ errorText: 'Введите название проекта.' }));
    await settle();
    assert.deepEqual(await ids(), expected);
    assert.equal(await page.locator('#review-field-message').innerText(), 'Введите название проекта.');
    assert.equal(await page.locator('#review-field').getAttribute('aria-invalid'), 'true');
    await page.evaluate(() => window.sedaReview.setFieldProps({ disabled: true }));
    await settle();
    assert.ok(await page.locator('#review-field').isDisabled());
    assert.equal(await page.locator('#review-field').getAttribute('aria-invalid'), null);
    assert.equal(await page.locator('#review-field-message').innerText(), 'Локальное пояснение');
    assert.deepEqual(await ids(), expected);
    assert.equal(await page.evaluate(() => window.sedaReview.getState().field.errorText), 'Введите название проекта.');
    const disabledPaint = await paint('#review-field >> xpath=..', compiled, 'projectName', 'disabled', { foregroundSelector: '#review-field' });
    await page.evaluate(() => window.sedaReview.setFieldProps({ disabled: false }));
    await settle();
    assert.equal(await page.locator('#review-field-message').innerText(), 'Введите название проекта.');
    await page.evaluate(() => window.sedaReview.setFieldProps({ disabled: true, helperText: undefined, description: 'review-description review-extra-description' }));
    await settle();
    assert.equal(await page.locator('#review-field-message').count(), 0, 'Disabled error-only field has no error message element');
    assert.deepEqual(await ids(), external);
    await page.evaluate(() => window.sedaReview.setFieldProps({ disabled: false, errorText: undefined, state: 'error' }));
    await settle();
    assert.equal(await page.locator('#review-field').getAttribute('aria-invalid'), null, 'state=error without a message does not produce an error');
    return { mergedIds: expected, disabledPaint, preservedOwnerError: true };
  });

  await check('default-icon-variant', 'The actual IconButton default belongs to its public union.', [], async () => {
    assert.equal(await page.locator('#review-default-icon').getAttribute('data-variant'), 'secondary');
    return { observedDefault: 'secondary' };
  });

  await check('form-required-and-revalidation', 'Whitespace remains visible, submit validates and focuses, valid input clears the displayed error.', ['TextField.focus'], async () => {
    await reset();
    await page.locator('#project-name').fill('   ');
    await page.locator('#save-button').click();
    await settle();
    const invalid = await state();
    assert.equal(invalid.projectName, '   ');
    assert.equal(invalid.fieldError, bundle.profile.formPolicy.requiredMessage);
    assert.equal(invalid.attemptedSubmit, true);
    assert.equal((await requests()).length, 0);
    assert.ok((await read('#project-name')).focused);
    assert.equal(await page.locator('#project-name').inputValue(), '   ');
    await page.locator('#project-name').fill('  Название · 42  ');
    await settle();
    assert.equal((await state()).fieldError, undefined);
    assert.equal(await page.locator('#project-name').getAttribute('aria-invalid'), null);
    await page.locator('#save-button').click();
    await settle();
    const request = (await requests()).at(-1);
    assert.equal(request.value, '  Название · 42  ');
    return { invalid, request };
  });

  await check('form-submit-guard', 'Click, Enter and requestSubmit cannot duplicate a pending save.', ['Button.loading-width'], async () => {
    await reset();
    await page.locator('#project-name').fill('Запрос A');
    await keyboardFocus('#save-button');
    const before = await read('#save-button');
    await page.keyboard.press('Enter');
    await settle();
    assert.equal((await requests()).length, 1);
    const loading = await read('#save-button');
    near(loading.width, before.width, 'Main Save loading width');
    assert.ok(loading.focused, 'Save retains focus');
    assert.ok(await page.locator('#cancel-button').isDisabled());
    assert.ok(await page.locator('#project-name').isEnabled());
    await physicalClick('#save-button');
    await physicalClick('#save-button');
    await page.locator('#project-name').focus();
    await page.keyboard.press('Enter');
    await page.evaluate(() => {
      const form = document.querySelector('#settings-form');
      form.requestSubmit();
      form.requestSubmit();
      form.requestSubmit(document.querySelector('#save-button'));
    });
    await settle();
    assert.equal((await requests()).length, 1);
    return { before, loading, requestCount: 1, finalState: await state() };
  });

  await check('form-late-response-and-profile', 'Reply A retains edit B; profile changes preserve state and component identity.', [], async () => {
    await reset();
    await page.locator('#project-name').fill('A');
    await page.locator('#save-button').click();
    await settle();
    const first = (await requests()).at(-1);
    await page.locator('#project-name').fill('B');
    await page.locator('#project-name').blur();
    const before = await state();
    await page.evaluate(() => { window.__sedaIdentity = ['project-name', 'save-button', 'cancel-button', 'help-button'].map(id => document.getElementById(id)); });
    for (const [theme, size] of [['Dark', 'xl'], ['Light', 's'], ['Dark', 'l']]) {
      await configure(theme, size);
      assert.deepEqual(await state(), before, 'Presentation updates preserve every form field');
      assert.ok(await page.evaluate(() => window.__sedaIdentity.every(element => document.getElementById(element.id) === element)), 'Profile change remounted a component');
    }
    await reply(first.requestId, 'success');
    const after = await state();
    assert.equal(after.projectName, 'B');
    assert.equal(after.savedValue, 'A');
    assert.equal(after.dirty, true);
    assert.equal(after.saving, false);
    assert.equal(await page.locator('#project-name').inputValue(), 'B');
    await page.locator('#save-button').click();
    await settle();
    const pending = await state();
    await reply(first.requestId, 'success');
    assert.deepEqual(await state(), pending, 'Duplicate old response changed a new active request');
    return { first, before, after, nextRequest: (await requests()).at(-1) };
  });

  await check('form-failure-retry-cancel', 'Transport failure remains a form error; retry uses the latest value; Cancel restores the saved snapshot.', [], async () => {
    await reset();
    const original = (await state()).savedValue;
    await page.locator('#project-name').fill('A');
    await page.locator('#save-button').click();
    await settle();
    await reply((await requests()).at(-1).requestId, 'failure');
    const failed = await state();
    assert.equal(failed.saveError, bundle.profile.formPolicy.saveFailureMessage);
    assert.equal(failed.fieldError, undefined);
    assert.equal(await page.locator('#project-name').getAttribute('aria-invalid'), null);
    assert.ok(await page.locator('#form-error').isVisible());
    await page.locator('#project-name').fill('B');
    await page.locator('#save-button').click();
    await settle();
    const retry = (await requests()).at(-1);
    assert.equal(retry.value, 'B');
    await reply(retry.requestId, 'success');
    assert.equal((await state()).saveError, undefined);
    assert.equal((await state()).savedValue, 'B');
    await page.locator('#project-name').fill('');
    await page.locator('#project-name').blur();
    await page.locator('#cancel-button').click();
    await settle();
    const cancelled = await state();
    assert.equal(cancelled.projectName, 'B');
    assert.equal(cancelled.fieldError, undefined);
    assert.equal(cancelled.touched, false);
    assert.equal(cancelled.dirty, false);
    return { original, failed, retry, cancelled };
  });

  await check('help-keyboard', 'Help expands visible explanatory content without persistent pressed selection.', ['IconButton.focus'], async () => {
    await reset();
    await keyboardFocus('#help-button');
    assert.equal(await page.locator('#help-button').getAttribute('aria-pressed'), null);
    assert.equal(await page.locator('#help-button').getAttribute('aria-expanded'), 'false');
    await page.keyboard.press('Enter');
    await settle();
    assert.equal(await page.locator('#help-button').getAttribute('aria-expanded'), 'true');
    assert.ok((await read('#help-button')).focused);
    const panelId = await page.locator('#help-button').getAttribute('aria-controls');
    assert.ok(panelId, 'Help points to the expanded panel');
    assert.ok(await page.locator(`#${panelId}`).isVisible());
    assert.ok((await page.locator(`#${panelId}`).innerText()).includes(bundle.profile.copy.helpText));
    await page.keyboard.press('Enter');
    await settle();
    assert.equal(await page.locator('#help-button').getAttribute('aria-expanded'), 'false');
    return { panelId, visibleText: bundle.profile.copy.helpText, focusRetained: true };
  });

  const mutations = [
    { component: 'Button', role: 'save', selector: '#save-button', property: 'background', path: ['button', 'primary', 'solid', 'surface', 'default'], value: '#a61e4d' },
    { component: 'IconButton', role: 'help', selector: '#help-button', property: 'color', path: ['icon-button', 'ghost', 'foreground', 'default'], value: '#0f766e' },
    { component: 'TextField', role: 'projectName', selector: '#project-name >> xpath=..', property: 'border', path: ['text-field', 'border', 'default'], value: '#7c3aed' },
  ];
  for (const mutation of mutations) {
    await check(`token-mutation-${mutation.component}`, 'A changed source component token recompiles into the corresponding rendered role and explain chain.', [`${mutation.component}.token-binding`], async () => {
      await reset();
      await configure('Light');
      const before = await read(mutation.selector);
      const tokens = JSON.parse(await fs.readFile(path.join(repoRoot, 'tokens.json'), 'utf8'));
      let leaf = tokens.$collections.components.$modes['Mode 1'];
      for (const segment of mutation.path) leaf = leaf[segment];
      assert.equal(leaf.$type, 'color');
      const sourceBefore = leaf.$value;
      leaf.$value = mutation.value;
      const engine = createContractEngine({ repoRoot, packageRoot, tokens });
      const compiled = engine.compile();
      await page.evaluate(compiled => window.sedaPilot.replaceCompiled(compiled), compiled);
      await settle();
      const after = await read(mutation.selector);
      const expected = await color(mutation.value);
      assert.notEqual(before[mutation.property], expected, 'Mutation must differ from the original paint');
      assert.equal(after[mutation.property], expected);
      const evidence = await page.evaluate(role => window.sedaPilot.getEvidence().recipes[role].evidence, mutation.role);
      const applied = evidence.find(entry => entry.chain?.[0]?.collection === 'components' && JSON.stringify(entry.chain[0].path) === JSON.stringify(mutation.path));
      assert.ok(applied, 'Applied explain evidence omits the actual component token');
      assert.equal(applied.value, mutation.value);
      const actualVariable = await page.locator(mutation.role === 'projectName' ? '#project-name >> xpath=ancestor::div[@data-seda-contract="TextField"][1]' : mutation.selector).evaluate((element, property) => getComputedStyle(element).getPropertyValue(property).trim(), applied.property);
      assert.equal(await color(actualVariable), expected, 'Evidence value is not the applied custom property');
      if (await page.locator('#source-explanation').getAttribute('open') === null) await page.locator('#source-explanation summary').click();
      await page.locator('#inspect-component').selectOption(mutation.role);
      const row = page.locator('#source-explanation tbody tr').filter({ hasText: applied.property });
      assert.equal(await row.locator('td').nth(1).innerText(), String(applied.cssValue), 'Visible explanation has a different applied value');
      assert.ok((await row.locator('td').nth(2).innerText()).includes(`components/${mutation.path.join('/')}`), 'Visible explanation omits the actual source path');
      return { source: { collection: 'components', mode: 'Mode 1', path: mutation.path, before: sourceBefore, after: mutation.value }, paintBefore: before[mutation.property], paintAfter: after[mutation.property], applied };
    });
  }

  await check('missing-token-rejected', 'An unresolved required token fails compilation before any browser presentation is accepted.', [], async () => {
    const source = JSON.parse(await fs.readFile(path.join(repoRoot, 'tokens.json'), 'utf8'));
    const scenarios = [];
    for (const missing of ['unresolved-alias', 'surface/active', 'foreground/placeholder']) {
      const tokens = structuredClone(source);
      const field = tokens.$collections.components.$modes['Mode 1']['text-field'];
      if (missing === 'unresolved-alias') field.border.default.$value = '{does.not.exist}';
      else {
        const [family, state] = missing.split('/');
        assert.ok(Object.hasOwn(field[family], state), `Source role ${missing} must exist before deletion`);
        delete field[family][state];
      }
      const engine = createContractEngine({ repoRoot, packageRoot, tokens });
      let failure;
      try { engine.compile(); } catch (error) { failure = error; }
      assert.ok(failure?.issues?.length, `Missing ${missing} compiled without an addressed issue`);
      assert.ok(failure.issues.some(issue => issue.path && issue.code));
      scenarios.push({ missing, issues: failure.issues });
    }
    return scenarios;
  });

  await check('browser-console', 'The tested interactions produce no React or browser runtime errors.', [], async () => {
    assert.deepEqual(errors, []);
    const finalSources = await verifySources();
    return { errors, sourceHashesStillMatch: true, checkedSources: finalSources.length };
  });

  await reset();
  await configure('Light', 'm');
  await page.evaluate(() => { document.querySelector('#source-explanation').removeAttribute('open'); window.scrollTo(0, 0); });
  await page.screenshot({ path: path.join(output, 'settings-light-m.png'), fullPage: false, animations: 'disabled' });
  await configure('Dark', 'm');
  await page.screenshot({ path: path.join(output, 'settings-dark-m.png'), fullPage: false, animations: 'disabled' });
  await keyboardFocus('#project-name');
  await page.locator('#project-name').fill('   ');
  await page.keyboard.press('Enter');
  await settle();
  await page.screenshot({ path: path.join(output, 'settings-error-focus.png'), fullPage: false, animations: 'disabled' });
} catch (error) {
  results.push({ id: 'verification-setup', description: 'Browser verification must be runnable against the current build.', rules: [], status: 'violated', error: error.stack || String(error) });
} finally {
  const rules = bundle.contracts.flatMap(contract => ruleIds(contract.id).map(rule => {
    const key = `${contract.id}.${rule.id}`;
    const related = results.filter(result => result.rules.includes(key));
    return {
      component: contract.id, ruleId: rule.id, check: rule.check, decision: rule.decision,
      expected: rule.expected, source: rule.source,
      status: related.length === 0 ? 'not-checked' : related.some(result => result.status === 'violated') ? 'violated' : 'passed',
      evidence: related.map(result => result.id),
    };
  }));
  const passed = results.filter(result => result.status === 'passed').length;
  const failed = results.filter(result => result.status === 'violated').length;
  const report = {
    generatedAt: new Date().toISOString(),
    scope: 'settings-form pilot; Chromium desktop; pointer and keyboard; Light/Dark × s/m/l/xl; regular density',
    environment: { node: process.version, browser: browser?.version(), playwright: require('playwright/package.json').version, viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 },
    source: buildMetadata,
    verificationSource: { path: path.relative(repoRoot, fileURLToPath(import.meta.url)).split(path.sep).join('/'), sha256: verifierHash },
    totals: { passed, failed, browserRules: rules.length, rulesPassed: rules.filter(rule => rule.status === 'passed').length },
    rules, results, geometry: geometryEvidence,
    capabilities: initialCompiled?.capabilities ?? [],
    browserErrors: errors,
  };
  await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
  process.stdout.write(JSON.stringify({ output, ...report.totals }, null, 2) + '\n');
  if (failed || rules.some(rule => rule.status !== 'passed')) process.exitCode = 1;
}
