import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { displayHex } from './owner-color.mjs';
assert.equal(displayHex('oklch(0% 0 0 / 0.5)'), '#00000080');
assert.equal(displayHex('#18191b0f'), '#18191B0F');
assert.equal(displayHex('oklch(100% 0 0)'), '#FFFFFF');
import { createPilotServer } from './server.mjs';
const server=await createPilotServer({port:0});const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});const page=await browser.newPage({viewport:{width:1686,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await fs.mkdir('.diagnostics-studio',{recursive:true});
try{
await page.goto(`http://127.0.0.1:${server.address().port}/tokens.html`);
assert.equal(await page.getByText('Mini builder',{exact:true}).count(),0);
await page.getByRole('button',{name:'border / default',exact:true}).click();await page.getByLabel('Semantic role',{exact:true}).selectOption('{border.default}');
assert.equal(await page.locator('.studio-selected-element .seda-field--select').evaluate(e=>getComputedStyle(e).getPropertyValue('--select-border-default').trim()),'#18191b1f');
await page.screenshot({path:'.diagnostics-studio/component-light.png',fullPage:true});
await page.getByRole('button',{name:'Палитра',exact:true}).click();assert.match(await page.locator('.studio-token-row .studio-hex-value').first().innerText(),/^#[0-9A-F]{6}([0-9A-F]{2})?$/);await page.getByLabel('Поиск по токенам').fill('blue/60');await page.locator('.studio-token-row button').first().click();await page.getByLabel('OKLCH').fill('oklch(60% 0.12 260)');await page.screenshot({path:'.diagnostics-studio/palette-table-light.png',fullPage:true});await page.getByLabel('Theme').selectOption('Dark');await page.screenshot({path:'.diagnostics-studio/palette-table-dark.png',fullPage:true});await page.getByLabel('Theme').selectOption('Light');
await page.getByRole('button',{name:'Семантика',exact:true}).click();assert.ok(await page.locator('.studio-token-group').count()>0);await page.screenshot({path:'.diagnostics-studio/semantic-table-light.png',fullPage:true});await page.getByLabel('Theme').selectOption('Dark');await page.screenshot({path:'.diagnostics-studio/semantic-table-dark.png',fullPage:true});await page.getByLabel('Theme').selectOption('Light');await page.getByLabel('Поиск по токенам').fill('border/default');await page.locator('.studio-token-row button').first().click();assert.equal(await page.locator('.studio-token-row[aria-selected=true]').count(),1);await page.getByLabel('Palette color').selectOption('{color.blue.60}');
await page.getByRole('button',{name:'Компоненты',exact:true}).click();assert.equal(await page.locator('.studio-selected-element .seda-field--select').evaluate(e=>getComputedStyle(e).getPropertyValue('--select-border-default').trim()),'oklch(60% 0.12 260)');
await page.reload();assert.match(await page.getByRole('status').innerText(),/3 изменений/);
await page.getByRole('button',{name:'button',exact:true}).click();assert.equal(await page.locator('.studio-selected-element .seda-button').count(),1);
await page.getByRole('button',{name:'select',exact:true}).click();await page.getByLabel('Theme').selectOption('Dark');await page.getByLabel('Property group').selectOption('border');await page.getByRole('button',{name:'border / default',exact:true}).click();await page.screenshot({path:'.diagnostics-studio/component-dark.png',fullPage:true});
const boxes=await page.locator('.studio-library,.studio-canvas,.studio-inspector').evaluateAll(els=>els.map(e=>({x:e.getBoundingClientRect().x,w:e.getBoundingClientRect().width})));assert.ok(boxes[0].x<boxes[1].x&&boxes[1].x<boxes[2].x);
await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'.diagnostics-studio/mobile.png',fullPage:true});
assert.deepEqual(errors,[]);console.log('PASS: library/canvas/inspector, property selection, live SEDA controls, palette → semantic → component, auto apply, reload, themes, responsive layout');
}finally{await browser.close();await new Promise(r=>server.close(r));}
