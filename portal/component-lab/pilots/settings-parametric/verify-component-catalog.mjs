import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
const server=await createPilotServer({port:0}),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE}),page=await browser.newPage({viewport:{width:1480,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));let writes=0;
const hash=createHash('sha256').update(await fs.readFile('../../../../tokens.json')).digest('hex');
await page.route('**/api/token-document',route=>{if(route.request().method()!=='GET')writes++;return route.fulfill({json:{sourceTokensSha256:hash,revision:0,edits:{},updatedAt:null}});});
try{
 const response=await page.request.get(base+'/component-catalog.json');assert.ok(response.ok());const catalog=await response.json();
 assert.equal(catalog.counts.publicModules,36);assert.equal(catalog.counts.studioPreviews,7);
 await page.goto(base+'/owner.html');await page.getByText('Каталог покрытия',{exact:true}).click();
 const rows=page.getByRole('list',{name:'Покрытие компонентов'}).locator('li');assert.equal(await rows.count(),catalog.counts.entries);
 // Scope assertions use the entry itself; registered preview does not imply accepted visual review.
 await page.locator('[data-component-id="select"]').scrollIntoViewIfNeeded();
 assert.match(await page.locator('[data-component-id="select"]').innerText(),/registered[\s\S]*not-accepted/);
 assert.match(await page.locator('[data-component-id="chip"]').innerText(),/missing/);
 assert.equal(await page.getByRole('link',{name:'Скачать каталог JSON'}).getAttribute('href'),'/component-catalog.json');
 await fs.mkdir('.diagnostics-component-catalog',{recursive:true});
 await page.locator('[data-component-id="select"]').scrollIntoViewIfNeeded();await page.screenshot({path:'.diagnostics-component-catalog/owner.png'});
 for(const theme of ['Light','Dark']){
  await page.goto(base+'/tokens.html?area=components');await page.getByLabel('Theme',{exact:true}).selectOption(theme);
  for(const entry of catalog.entries.filter(x=>x.preview.status==='registered')){
   await page.locator('.studio-library-items').getByRole('button',{name:entry.id,exact:true}).click();
   assert.equal(await page.locator('.studio-selected-element').getByText(/проверенный предпросмотр ещё не подготовлен/).count(),0,entry.id);
   assert.ok(await page.locator('.studio-selected-element .seda-provider').count(),entry.id);
  }
 }
 assert.deepEqual(errors,[]);assert.equal(writes,0);
 await page.screenshot({path:'.diagnostics-component-catalog/dark.png'});
 console.log('PASS: generated catalog endpoint, honest owner coverage, JSON download, seven real Studio previews in Light/Dark; isolated token API, no writes or JS errors.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
