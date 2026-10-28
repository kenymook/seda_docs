import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { createPilotServer } from './server.mjs';
const server=await createPilotServer({port:0});const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await fs.mkdir('.diagnostics-mini',{recursive:true});
try{
await page.goto(`http://127.0.0.1:${server.address().port}/tokens.html`);
assert.equal(await page.getByRole('heading',{name:'Компонент · select'}).count(),1);
await page.getByRole('button',{name:'Назначить роль border/default для select/border/default'}).click();
assert.equal(await page.locator('.token-border-demo--current .seda-field--select').evaluate(e=>getComputedStyle(e).getPropertyValue('--select-border-default').trim()),'#18191b1f');
await page.screenshot({path:'.diagnostics-mini/components-light.png',fullPage:true});
await page.getByRole('button',{name:/Палитра/}).click();await page.getByLabel('Поиск по токенам').fill('blue/60');await page.locator('.token-row').first().click();await page.getByLabel('OKLCH').fill('oklch(60% 0.12 260)');await page.screenshot({path:'.diagnostics-mini/palette-light.png',fullPage:true});
await page.getByRole('button',{name:/Семантика/}).click();await page.getByLabel('Поиск по токенам').fill('border/default');await page.locator('.token-row').first().click();await page.getByLabel('Цвет палитры').selectOption('{color.blue.60}');
await page.getByRole('button',{name:/Компоненты/}).click();assert.equal(await page.locator('.token-border-demo--current .seda-field--select').evaluate(e=>getComputedStyle(e).getPropertyValue('--select-border-default').trim()),'oklch(60% 0.12 260)');
await page.reload();assert.match(await page.locator('.token-status').innerText(),/3 изменений/);
await page.getByLabel('Тема').selectOption('Dark');await page.screenshot({path:'.diagnostics-mini/components-dark.png',fullPage:true});
await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'.diagnostics-mini/mobile.png',fullPage:true});
assert.deepEqual(errors,[]);console.log('PASS: component role, palette → semantic → live component, automatic apply, reload, both themes, mobile; no page errors');
}finally{await browser.close();await new Promise(r=>server.close(r));}

