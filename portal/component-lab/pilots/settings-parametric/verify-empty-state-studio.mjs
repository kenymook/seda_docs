import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const hash=createHash('sha256').update(await fs.readFile('../../../../tokens.json')).digest('hex');
const server=await createPilotServer({port:0}),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
try {
 for(const theme of ['Light','Dark']) {
  const context=await browser.newContext({viewport:{width:1480,height:1000}});
  let document={sourceTokensSha256:hash,revision:0,edits:{},updatedAt:null},writes=0;
  await context.route('**/api/token-document',async route=>{if(route.request().method()==='PUT'){const body=route.request().postDataJSON();assert.equal(body.revision,document.revision);document={...document,revision:document.revision+1,edits:body.edits};writes++;}await route.fulfill({json:document});});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/tokens.html?area=components');await page.getByLabel('Theme',{exact:true}).selectOption(theme);
  await page.locator('.studio-library-items').getByRole('button',{name:'empty-state',exact:true}).click();
  const empty=page.locator('.studio-selected-element .seda-empty-state'),title=empty.getByRole('heading',{name:'Ничего не найдено'});await title.waitFor();
  const before=await title.evaluate(n=>getComputedStyle(n).color);
  await page.getByLabel('Property group',{exact:true}).selectOption('title');
  await page.getByRole('button',{name:'empty-state/title/foreground color',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Color role'});await dialog.getByRole('textbox',{name:'Поиск цвета'}).fill('text/brand');
  const saved=page.waitForResponse(response=>response.url().endsWith('/api/token-document')&&response.request().method()==='PUT');
  await dialog.getByRole('button',{name:'text/brand',exact:true}).click();await saved;
  assert.equal(document.edits['components|Mode 1|empty-state/title/foreground'],'{text.brand}');
  const colors=await empty.evaluate(n=>({actual:getComputedStyle(n.querySelector('.seda-empty-state__title')).color, token:getComputedStyle(n).getPropertyValue('--empty-state-title-foreground').trim(), brand:getComputedStyle(n).getPropertyValue('--text-brand').trim()}));
  assert.notEqual(colors.actual,before);assert.equal(colors.token,colors.brand);
  await page.reload();await page.getByLabel('Theme',{exact:true}).selectOption(theme);await page.locator('.studio-library-items').getByRole('button',{name:'empty-state',exact:true}).click();await title.waitFor();
  assert.equal(await title.evaluate(n=>getComputedStyle(n).color),colors.actual);
  const lab=await context.newPage();lab.on('pageerror',e=>errors.push(e.message));await lab.goto(base+'/');await lab.waitForFunction(()=>window.sedaPilot);
  await lab.evaluate(theme=>window.sedaPilot.configure({theme,controlSize:'m'}),theme);await lab.locator('#nav-members').click();await lab.locator('#member-search').fill('нет таких участников');
  const labTitle=lab.locator('#members-table .seda-empty-state__title');await labTitle.waitFor();
  await lab.waitForFunction(expected=>getComputedStyle(document.querySelector('#members-table .seda-empty-state__title')).color===expected,colors.actual);
  assert.equal(writes,1);assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS: EmptyState semantic title assignment, Studio reload and Team propagation in Light/Dark using isolated storage.');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
