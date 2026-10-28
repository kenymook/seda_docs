import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const url=process.env.SEDA_STORE_URL||'http://127.0.0.1:5198';
const get=()=>fetch(url+'/api/token-document').then(r=>r.json());
const put=async(body,origin=url)=>{const r=await fetch(url+'/api/token-document',{method:'PUT',headers:{'Content-Type':'application/json',Origin:origin,Connection:'close'},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});const data=await r.json();return {status:r.status,json:async()=>data};};
let doc=await get();const hash=doc.sourceTokensSha256;
assert.equal((await put({...doc,edits:{}},'https://foreign.example')).status,403);
assert.equal((await put({...doc,edits:{unknown:'oklch(50% 0 0)'}})).status,422);
assert.equal((await put({...doc,sourceTokensSha256:'old'})).status,409);
assert.equal((await put({...doc,edits:{}})).status,200);doc=await get();
const key='components|Mode 1|select/border/default';
const saved=await put({...doc,edits:{[key]:'{border.subtle}'}});assert.equal(saved.status,200);const written=await saved.json();assert.equal(written.revision,doc.revision+1);
assert.equal((await put({...doc,edits:{}})).status,409);assert.deepEqual((await get()).edits,{[key]:'{border.subtle}'});
assert.equal((await put({...written,edits:{}})).status,200);
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const errors=[];
try{
 const a=await browser.newContext(),b=await browser.newContext();const page=await a.newPage(),other=await b.newPage();for(const p of [page,other])p.on('pageerror',e=>errors.push(e.message));
 // Import a legacy browser draft into a populated empty shared document without losing it.
 await page.addInitScript(({hash,key})=>{if(!sessionStorage.migrated){localStorage.setItem('seda-token-workbench-v1',JSON.stringify({sourceTokensSha256:hash,edits:{[key]:'{border.default}'}}));sessionStorage.migrated='yes';}},{hash,key});
 await page.goto(url+'/tokens');await page.getByRole('button',{name:'Сохранить мою версию',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Сохранено в базе'));
 assert.deepEqual((await get()).edits,{[key]:'{border.default}'});
 const sibling=await a.newPage();await sibling.goto(url+'/tokens');await sibling.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Сохранено в базе'));
 await other.goto(url+'/tokens');await other.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Сохранено в базе'));
 assert.equal(await other.locator('.studio-role-name').first().innerText(),'border/default');
 await page.getByRole('button',{name:'select/border/default color',exact:true}).click();await page.getByRole('dialog',{name:'Color role'}).getByRole('button',{name:'border/strong',exact:true}).click();await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Сохранено в базе'));
 await sibling.evaluate(()=>window.dispatchEvent(new Event('focus')));await sibling.waitForFunction(()=>document.querySelector('.studio-role-name')?.textContent==='border/strong');assert.equal((await get()).edits[key],'{border.strong}');
 await other.getByRole('button',{name:'select/border/default color',exact:true}).click();await other.getByRole('dialog',{name:'Color role'}).getByRole('button',{name:'border/subtle',exact:true}).click();await other.keyboard.press('Escape');await other.getByRole('button',{name:'Загрузить из базы',exact:true}).waitFor();assert.equal((await get()).edits[key],'{border.strong}');
 await other.getByRole('button',{name:'Загрузить из базы',exact:true}).click();await other.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Сохранено в базе'));assert.equal(await other.locator('.studio-role-name').first().innerText(),'border/strong');
 await a.close();const fresh=await browser.newPage();await fresh.goto(url+'/tokens');await fresh.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Сохранено в базе'));assert.equal(await fresh.locator('.studio-role-name').first().innerText(),'border/strong');
 // A failed request retains the local draft and a later retry writes it.
 await fresh.route('**/api/token-document',route=>route.request().method()==='PUT'?route.abort():route.continue());
 await fresh.getByRole('button',{name:'select/border/default color',exact:true}).click();await fresh.getByRole('dialog',{name:'Color role'}).getByRole('button',{name:'border/default',exact:true}).click();await fresh.keyboard.press('Escape');await fresh.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Не удалось сохранить'));
 assert.equal((await get()).edits[key],'{border.strong}');await fresh.unroute('**/api/token-document');await fresh.getByRole('button',{name:'Синхронизировать',exact:true}).click();await fresh.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Сохранено в базе'));assert.equal((await get()).edits[key],'{border.default}');
 await fresh.getByRole('button',{name:'Отступы',exact:true}).click();await fresh.getByRole('spinbutton').fill('12');await fresh.getByRole('button',{name:'Применить',exact:true}).click();await fresh.waitForFunction(()=>document.querySelector('[role=status]')?.textContent.includes('Сохранено в базе'));assert.equal((await get()).edits['foundation|Mode 1|space/m'],'12');assert.equal((await get()).edits[key],'{border.default}');
 await fresh.reload();await fresh.getByRole('button',{name:'Отступы',exact:true}).click();await fresh.waitForFunction(()=>getComputedStyle(document.querySelector('.studio-spacing-specimen')).gap==='12px');
 for(const theme of ['Light','Dark']){await fresh.getByLabel('Theme').selectOption(theme);await fresh.screenshot({path:'.diagnostics-studio/database-'+theme+'.png',animations:'disabled',fullPage:true});}
 assert.deepEqual(errors,[]);
 console.log('PASS: real D1 API validation, revision CAS, local migration, independent browsers, conflict protection, fresh session restore, offline recovery, Light/Dark screenshots');
}finally{await browser.close();const latest=await get();await put({...latest,edits:{}});}
