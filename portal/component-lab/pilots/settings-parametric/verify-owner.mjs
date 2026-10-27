import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createPilotServer } from './server.mjs';

const output = path.join(import.meta.dirname, '.diagnostics-owner');
await fs.mkdir(output, { recursive: true });
const server = await createPilotServer({ port: 0 });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.SEDA_BROWSER_EXECUTABLE ? { executablePath: process.env.SEDA_BROWSER_EXECUTABLE } : {}),
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  await page.goto(base, { waitUntil: 'load' });
  await page.locator('#owner-lab-link').click();
  await page.waitForURL('**/owner.html');
  assert.equal(await page.getByRole('heading', { name: 'Управление SEDA' }).count(), 1);
  const realControls = await page.locator('.owner-workspace :is(.seda-button,.seda-icon-button,.seda-field,.seda-choice,.seda-radio,.seda-toggle,.seda-table)').count();
  assert.ok(realControls >= 7, `expected real SEDA controls, found ${realControls}`);
  await page.screenshot({ path: path.join(output, 'owner-light.png'), fullPage: true });

  const hexValue = page.getByLabel('Свой HEX');
  assert.equal(await hexValue.inputValue(), '#1964b8');
  await hexValue.click();
  await hexValue.press('ControlOrMeta+A');
  await hexValue.pressSequentially('#8B2D8B');
  assert.equal(await hexValue.inputValue(), '#8B2D8B');
  await page.getByRole('button', { name: 'Применить к предпросмотру' }).click();
  const createButton = page.locator('.owner-buttons .seda-button').first();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.owner-buttons .seda-button')).backgroundColor === 'rgb(139, 45, 139)');
  assert.equal(await createButton.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(139, 45, 139)');
  assert.match(await page.evaluate(() => localStorage.getItem('seda-owner-component-lab-draft-v2') || ''), /#8B2D8B/);
  await page.reload();
  assert.equal(await page.getByLabel('Свой HEX').inputValue(), '#8B2D8B');
  assert.match(await page.locator('.owner-note').innerText(), /восстановлен/);
  await page.getByRole('button', { name: 'Применить к предпросмотру' }).click();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.owner-buttons .seda-button')).backgroundColor === 'rgb(139, 45, 139)');
  assert.equal(await createButton.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(139, 45, 139)');
  await page.locator('.owner-advanced-token summary').click();
  await page.getByLabel('Значение токена').fill('{missing.semantic.role}');
  await page.getByRole('button', { name: 'Применить к предпросмотру' }).click();
  assert.match(await page.locator('.owner-sidebar').innerText(), /no target|not found|не связан|не существует/i);
  await page.getByRole('button', { name: 'Сбросить', exact: true }).click();
  assert.equal(await page.getByLabel('Значение токена').inputValue(), '{container.brand.default}');
  assert.equal(await page.getByLabel('Свой HEX').inputValue(), '#1964b8');

  await page.getByLabel('Компонент', { exact: true }).selectOption('select');
  await page.getByLabel('Часть и состояние').selectOption('select/border/default');
  assert.equal(await page.getByLabel('Раздел палитры').inputValue(), 'border');
  await page.getByLabel('Поиск цвета или роли').fill('focus');
  assert.equal(await page.getByRole('button', { name: /\{border.focus\}/ }).count(), 1);
  await page.getByRole('button', { name: /\{border.focus\}/ }).click();
  assert.equal(await page.locator('.owner-token-preview small').innerText(), '{border.focus}');
  await page.getByRole('button', { name: 'Базовые цвета' }).click();
  await page.getByLabel('Раздел палитры').selectOption('red');
  await page.getByRole('button', { name: /\{color.red.60\}/ }).click();
  await page.getByRole('button', { name: 'Применить к предпросмотру' }).click();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.owner-workspace .seda-field--select > .seda-field__control')).borderTopColor === 'rgb(168, 55, 42)');
  assert.equal(await page.locator('.owner-workspace .seda-field--select > .seda-field__control').evaluate(element => getComputedStyle(element).borderTopColor), 'rgb(168, 55, 42)');
  await page.getByLabel('Выбрать свой цвет').fill('#339966');
  await page.getByRole('button', { name: 'Применить к предпросмотру' }).click();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.owner-workspace .seda-field--select > .seda-field__control')).borderTopColor === 'rgb(51, 153, 102)');
  await page.getByRole('button', { name: 'Сбросить', exact: true }).click();

  const max = page.locator('.owner-range-grid input').nth(1);
  await max.fill('201');
  await page.getByRole('button', { name: 'Применить к предпросмотру' }).click();
  assert.match(await page.locator('.owner-sidebar').innerText(), /exceeds executable geometry limits/);
  await page.reload();
  assert.equal(await page.locator('.owner-range-grid input').nth(1).inputValue(), '201');
  await max.fill('130');
  await page.getByRole('button', { name: 'Применить к предпросмотру' }).click();
  assert.equal(await page.locator('.owner-preview-range input[type=range]').first().getAttribute('max'), '130');
  assert.match(await page.locator('.owner-note').innerText(), /Черновик применён/);

  await page.locator('.owner-section').first().getByLabel('Light', { exact: true }).uncheck();
  await page.getByLabel('Тема по умолчанию').selectOption('Dark');
  await page.getByRole('button', { name: 'Применить к предпросмотру' }).click();
  assert.equal(await page.getByLabel('Тема предпросмотра').locator('option').count(), 1);
  assert.equal(await page.locator('.owner-shell').getAttribute('data-theme'), 'dark');
  await page.screenshot({ path: path.join(output, 'owner-dark.png'), fullPage: true });
  await page.getByLabel('Поиск проектов').fill('Nova');
  assert.equal(await page.locator('.owner-workspace tbody tr').count(), 1);
  assert.match(await page.locator('.owner-workspace tbody').innerText(), /Nova Console/);
  const beforeLoading = await createButton.boundingBox();
  await page.getByLabel('Показать loading').check();
  const duringLoading = await createButton.boundingBox();
  assert.ok(beforeLoading && duringLoading);
  assert.ok(Math.abs(beforeLoading.width - duringLoading.width) <= 1 && Math.abs(beforeLoading.height - duringLoading.height) <= 1, 'Button changed size during loading');
  for (const width of [780, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `${width}px viewport overflows by ${overflow}px`);
    await page.screenshot({ path: path.join(output, `owner-dark-${width}.png`), fullPage: true });
  }
  await page.getByRole('button', { name: 'Разделы' }).click();
  assert.equal(await page.getByRole('dialog').getByRole('link', { name: 'Лаборатория' }).count(), 1);
  await page.getByRole('button', { name: 'Закрыть' }).click();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: 22, realControls, errors: errors.length, output }));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
