import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
import {createHash} from 'node:crypto';
const hash=createHash('sha256').update(await fs.readFile('../../../../tokens.json')).digest('hex');
const server=await createPilotServer({port:0});
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const page=await browser.newPage({viewport:{width:1480,height:1244}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
// Isolated API protocol fixture: no production database writes.
let doc={sourceTokensSha256:hash,revision:0,edits:{},updatedAt:null};
let writes=0;
await page.route('**/api/token-document',async route=>{
  if(route.request().method()==='PUT'){
    const body=route.request().postDataJSON();assert.equal(body.revision,doc.revision);
    assert.equal(body.sourceTokensSha256,hash);writes++;
    doc={...doc,revision:doc.revision+1,edits:body.edits,updatedAt:new Date().toISOString()};
  }
  await route.fulfill({json:doc});
});
async function saved(){await page.locator('.studio-edit-toolbar').getByRole('status').filter({hasText:'Сохранено в базе'}).waitFor();}
async function border(state){return page.locator(`[data-preview-state="${state}"] .seda-field__control`).evaluate(e=>getComputedStyle(e).borderColor);}
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/tokens.html`);await saved();
 assert.equal(await page.locator('.studio-select-state-grid select').count(),9);
 assert.equal(await page.getByLabel('Preview disabled',{exact:true}).isDisabled(),true);
 assert.equal(await page.getByLabel('Preview error',{exact:true}).getAttribute('aria-invalid'),'true');
 for(const tone of ['warning','success']){
  assert.equal(await page.getByLabel('Preview '+tone,{exact:true}).getAttribute('aria-invalid'),null);
  assert.equal(await page.locator('[data-preview-state='+tone+'] .seda-field').getAttribute('data-state'),tone);
  assert.equal(await page.locator('[data-preview-state='+tone+'] .seda-field__message').getAttribute('data-tone'),tone);
 }
 assert.equal(await page.locator('.studio-select-state-grid select').first().getAttribute('tabindex'),'-1');
 for(const theme of ['Light','Dark']){
  await page.getByLabel('Theme',{exact:true}).selectOption(theme);
  const hover=await border('hover'),focus=await border('focus');assert.notEqual(hover,focus);
  await page.getByRole('button',{name:'select/border/default color',exact:true}).click();
  await page.getByRole('dialog',{name:'Color role'}).getByRole('button',{name:'border/subtle',exact:true}).click();
  await page.keyboard.press('Escape');await saved();
  const expected=await page.locator('.studio').evaluate(e=>getComputedStyle(e).getPropertyValue('--border-subtle').trim());
  assert.equal(await page.locator('[data-preview-state=default] .seda-field').evaluate(e=>getComputedStyle(e).getPropertyValue('--seda-field-border').trim()),expected);
  assert.equal(await border('hover'),hover);assert.equal(await border('focus'),focus);
  await fs.mkdir('.diagnostics-select-studio',{recursive:true});
  await page.locator('.studio-select-states').evaluate(e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:`.diagnostics-select-studio/${theme}.png`,fullPage:true});
  await page.getByRole('button',{name:'Отменить изменение',exact:true}).click();await saved();
 }
 // Edit from a state tile, persist, reload, and reset exactly the selected token.
 await page.locator('[data-preview-state=hover] .studio-state-label').click();
 await page.getByRole('dialog',{name:'Color role'}).getByRole('button',{name:'border/strong',exact:true}).click();
 await page.keyboard.press('Escape');await saved();
 assert.ok(Object.values(doc.edits).includes('{border.strong}'));
 // A newer external edit must disable local undo rather than overwrite it.
 const hoverKey=Object.keys(doc.edits)[0];const writesBefore=writes;
 doc={...doc,revision:doc.revision+1,edits:{[hoverKey]:'{border.default}'}};
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('seda-token-workbench-v2')).edits[Object.keys(JSON.parse(localStorage.getItem('seda-token-workbench-v2')).edits)[0]]==='{border.default}');
 assert.equal(await page.getByRole('button',{name:'Отменить изменение',exact:true}).isDisabled(),true);
 assert.equal(writes,writesBefore);
 await page.reload();await saved();assert.ok(await page.locator('.studio-select-states').isVisible());
 await page.getByRole('button',{name:'select/border/hover color',exact:true}).click();
 await page.getByRole('button',{name:'Вернуть исходное значение',exact:true}).click();await page.keyboard.press('Escape');await saved();
 assert.deepEqual(doc.edits,{});
 await page.getByRole('button',{name:'select/border/default color',exact:true}).click();
 await page.getByRole('button',{name:'Открыть общую роль',exact:true}).click();
 assert.ok(await page.locator('.studio-edit-scope').innerText().then(t=>t.includes('Общая роль:')));
 await page.getByRole('button',{name:'Компоненты',exact:true}).click();
 await page.getByLabel('Preview default',{exact:true}).count();
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);assert.ok(writes>=6);
 console.log('PASS: nine real Select fixtures, state tokens in both themes, isolated autosave/reload, undo/reset, shared-role scope, mobile, no JS errors. API is a test fixture.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
