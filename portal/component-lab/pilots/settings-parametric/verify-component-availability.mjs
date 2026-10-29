import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';import {chromium} from 'playwright';import {createPilotServer} from './server.mjs';
import {componentAvailability} from './component-availability.mjs';
const repo=path.resolve('../../../..'),source=await fs.readFile(path.join(repo,'tokens.json')),hash=createHash('sha256').update(source).digest('hex');
const server=await createPilotServer({port:0}),base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE}),page=await browser.newPage({viewport:{width:1480,height:1000}}),errors=[];let writes=0;
page.on('pageerror',e=>errors.push(e.message));await page.route('**/api/token-document',route=>{if(route.request().method()!=='GET')writes++;return route.fulfill({json:{sourceTokensSha256:hash,revision:0,edits:{},updatedAt:null}});});
try{
 const catalog=await(await page.request.get(base+'/component-catalog.json')).json();
 assert.equal(componentAvailability(catalog,'unknown').kind,'tokens');
 await fs.mkdir('.diagnostics-component-availability',{recursive:true});
 for(const theme of ['Light','Dark']){
  await page.goto(base+'/tokens.html?area=components');await page.getByLabel('Theme',{exact:true}).selectOption(theme);
  const library=page.locator('.studio-library-items');
  assert.equal(await library.getByRole('button',{name:'select',exact:true}).getAttribute('data-availability'),'live');
  assert.equal(await library.getByRole('button',{name:'avatar',exact:true}).getAttribute('data-availability'),'runtime');
  assert.equal(await library.getByRole('button',{name:'chip',exact:true}).getAttribute('data-availability'),'live');
  await library.getByRole('button',{name:'chip',exact:true}).click();
  const chip=page.locator('.studio-selected-element .seda-chip');await chip.waitFor();
  assert.ok(await chip.evaluate(n=>getComputedStyle(n).getPropertyValue('--chip-border-default').trim()));
  await chip.getByRole('button',{name:'Удалить фильтр'}).click();
  await page.getByRole('button',{name:'Восстановить фильтр'}).click();await chip.waitFor();
  await page.getByLabel('Property group',{exact:true}).selectOption('control');
  assert.equal(await page.getByText('icon (fallback)',{exact:true}).count(),1);
  const preview=page.locator('.studio-selected-element').getByRole('button',{name:'Фильтр'});await preview.click();
  assert.equal(await preview.getAttribute('aria-expanded'),'true');assert.equal(await page.getByText('Параметры фильтра',{exact:true}).isVisible(),true);
  await page.getByRole('button',{name:'chip/control/icon color',exact:true}).click();
  assert.ok(await page.getByRole('note').getByText(/Резервный цвет/).isVisible());
  await page.getByRole('button',{name:'Close color editor',exact:true}).click();
  assert.equal(await library.getByRole('button',{name:'button-group',exact:true}).getAttribute('data-availability'),'tokens');
  for(const [id,kind]of [['avatar','runtime'],['button-group','tokens']]){
   const button=library.getByRole('button',{name:id,exact:true});await button.click();
   assert.equal(await page.locator('.studio-preview-availability').getAttribute('data-availability'),kind);
   assert.equal(await page.locator('.studio-selected-element,.studio-selection-label,.studio-handle').count(),0);
   assert.ok(await page.locator('.studio-property-row').count()>0);assert.equal(await page.getByRole('dialog').count(),0);
   assert.ok(await button.getAttribute('aria-describedby'));
   await page.screenshot({path:'.diagnostics-component-availability/'+theme.toLowerCase()+'-'+kind+'.png'});
  }
  await page.getByLabel('Поиск в библиотеке',{exact:true}).fill('select');assert.equal(await library.getByRole('button').count(),1);
  const select=library.getByRole('button',{name:'select',exact:true});await select.focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('.studio-selected-element .seda-field--select').count(),1);assert.equal(await page.getByRole('dialog').count(),0);
  await page.getByLabel('Поиск в библиотеке',{exact:true}).fill('');await page.screenshot({path:'.diagnostics-component-availability/'+theme.toLowerCase()+'.png'});
 }
 // Serve only the actual legacy assets through an isolated route fixture. No source server or token writes.
 const assets={'component-lab/index.html':'portal/component-lab/index.html','component-lab/app.js':'portal/component-lab/app.js','component-lab/styles.css':'portal/component-lab/styles.css','portal-tokens.js':'portal/portal-tokens.js','portal-sidebar.css':'portal/portal-sidebar.css','portal-icons.css':'portal/portal-icons.css','portal-scrollbars.js':'portal/portal-scrollbars.js'};
 await page.route('**/legacy/**',async route=>{
  const key=new URL(route.request().url()).pathname.slice('/legacy/'.length);
  if(key==='tokens.json')return route.fulfill({contentType:'application/json',body:source});
  if(key==='docs-site/docs.json')return route.fulfill({json:[]});
  const file=assets[key];if(!file)return route.fulfill({status:404,body:'Unavailable test asset'});
  return route.fulfill({contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html',body:await fs.readFile(path.join(repo,file))});
 });
 await page.goto(base+'/legacy/component-lab/index.html');await page.locator('#nav .nav-link[data-component="select"]').click();
 assert.equal(await page.locator('#demoStatus').innerText(),'HTML demo');assert.match(await page.locator('.legacy-lab-notice').innerText(),/не использует React/);
 assert.equal(await page.locator('#nav .nav-link:not([data-component="size-matrix"]) .legacy-demo-label').count(),52);
 assert.equal(await page.locator('#demoStatus').getByText('Interactive',{exact:true}).count(),0);
 await page.screenshot({path:'.diagnostics-component-availability/legacy.png'});
 await page.locator('#themeButton').click();assert.match(await page.locator('.legacy-lab-notice').innerText(),/не использует React/);await page.screenshot({path:'.diagnostics-component-availability/legacy-light.png'});
 assert.equal(writes,0);assert.deepEqual(errors,[]);console.log('PASS: preselection availability from catalog, runtime/missing preview distinction, no fake component frame, keyboard/search, real Select, Light/Dark; all 52 legacy entries labeled HTML demo; no token writes.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
