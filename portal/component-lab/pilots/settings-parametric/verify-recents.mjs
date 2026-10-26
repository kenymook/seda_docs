import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium,firefox,webkit} from 'playwright';
import {createPilotServer} from './server.mjs';
const engineName=process.env.SEDA_BROWSER_ENGINE||'chromium',engines={chromium,firefox,webkit};if(!Object.hasOwn(engines,engineName))throw Error('Unsupported browser engine: '+engineName);
const output=path.join(import.meta.dirname,engineName==='chromium'?'.diagnostics-recents':'.diagnostics-recents-'+engineName);await fs.mkdir(output,{recursive:true});
const server=await createPilotServer({port:0}),base='http://127.0.0.1:'+server.address().port+'/references/recents.html';
const browser=await engines[engineName].launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1288}}),errors=[],results=[];page.setDefaultTimeout(8000);
page.on('pageerror',error=>errors.push(error.message));
const list=()=>page.locator('[role=listitem][data-file-id]'),file=id=>page.locator('[data-file-id="'+id+'"]');
const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function ready(){await page.waitForSelector('[data-reference=recents][data-status=ready]');await page.evaluate(()=>document.fonts.ready);await settle();}
async function fresh(){await page.goto(base,{waitUntil:'networkidle'});await ready();}
async function check(name,run){try{const evidence=await run();results.push({name,status:'passed',evidence});console.log('PASS '+name);}catch(error){results.push({name,status:'failed',error:error.stack});console.log('FAIL '+name+': '+error.message);}}
async function menu(id){await file(id).hover();await file(id).getByRole('button',{name:/^Действия:/}).click();}
async function settings(){await page.getByRole('button',{name:'Kenymook',exact:true}).click();await page.getByRole('menuitem',{name:'Параметры интерфейса',exact:true}).click();await page.getByRole('dialog').waitFor();}
const dismiss=()=>page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();
try{
 await fresh();
 await check('reference-package-assets-and-frame-structure',async()=>{
  const metadata=await page.evaluate(async()=>fetch('/build-metadata.json').then(response=>response.json()));assert.equal(metadata.references.recents.sourceAlias,false);assert.equal(metadata.references.recents.installedPackage,true);assert.ok(metadata.references.recents.bundledComponents.some(file=>file.endsWith('/Select/Select.js')));assert.equal(await list().count(),25);
  const geometry=await page.locator('.reference-file').first().boundingBox(),main=await page.locator('.reference-main').boundingBox(),filters=await page.locator('.reference-filters').boundingBox(),tabs=await page.locator('.seda-tabs__list').boundingBox();
  // SEDA composition deliberately replaces the source's 34/32px gutters/gaps with 24/24px.
  assert.ok(Math.abs(geometry.x-(main.x+24))<=1);assert.ok(Math.abs(geometry.width-(main.width-4*24)/3)<=1);assert.ok(Math.abs(geometry.y-(Math.max(filters.y+filters.height,tabs.y+tabs.height)+16))<=1);
  assert.equal(await page.locator('.reference-sidebar').evaluate(el=>el.getBoundingClientRect().width),241);
  // Load every lazy thumbnail before asserting the asset set; the sidebar scroll is independent.
  await page.locator('.reference-main').evaluate(el=>{el.scrollTop=el.scrollHeight;});await page.waitForLoadState('networkidle');await page.locator('.reference-main').evaluate(el=>{el.scrollTop=0;});await settle();
  assert.equal(await page.locator('.reference-thumbnail img').evaluateAll(images=>images.filter(image=>image.complete&&image.naturalWidth===0).length),0);
  assert.equal(await file('file-5').locator('.reference-thumbnail img').getAttribute('src'),'./assets/card-5-imgImage1.png');
  await page.screenshot({path:path.join(output,'recents-dark-1440.png'),animations:'disabled'});return {node:'1:691',installedPublicPackage:true,files:25,geometry};
 });
 await check('reference-search-filter-tabs-and-empty-state',async()=>{
  await page.locator('#reference-search').fill('Sandbox');assert.equal(await list().count(),1);await page.locator('#reference-type').selectOption('published');assert.equal(await list().count(),0);assert.equal(await page.getByRole('heading',{name:'Файлы не найдены'}).count(),1);
  await page.getByRole('button',{name:'Сбросить фильтры',exact:true}).click();assert.equal(await list().count(),25);
  await page.getByRole('tab',{name:'Recently viewed',exact:true}).focus();await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Shared files',exact:true}).getAttribute('aria-selected'),'true');assert.ok(await list().count()<25);
  await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('tab',{name:'Shared folders',exact:true}).getAttribute('aria-selected'),'true');assert.equal(await page.locator('.reference-folder-grid').count(),1);await page.locator('.reference-folder-grid button').first().click();assert.ok(await list().count()>0);await page.getByRole('link',{name:'Recents',exact:true}).click();
  return {coupled:true,keyboardTabs:true,folderNavigation:true};
 });
 await check('reference-real-navigation-and-history',async()=>{
  await page.getByRole('link',{name:'Drafts',exact:true}).click();assert.equal(new URL(page.url()).searchParams.get('section'),'drafts');assert.ok(await list().count()>0);await page.reload();await ready();assert.equal(await page.getByRole('heading',{name:'Drafts',exact:true}).count(),1);
  await page.getByRole('link',{name:'Trash',exact:true}).click();assert.equal(await page.getByRole('heading',{name:'Корзина пуста'}).count(),1);await page.goBack();assert.equal(await page.getByRole('heading',{name:'Drafts',exact:true}).count(),1);await page.getByRole('link',{name:'Recents',exact:true}).click();
  return {reload:true,back:true};
 });
 await check('reference-create-rename-copy-and-local-reload',async()=>{
  await page.getByRole('button',{name:'Design',exact:true}).click();await page.locator('#reference-file-name').fill(' ');assert.equal(await page.getByRole('button',{name:'Сохранить',exact:true}).isDisabled(),true);await page.locator('#reference-file-name').fill('Сохранённый макет');await page.getByRole('button',{name:'Сохранить',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await list().count(),26);
  const created=await list().first().getAttribute('data-file-id');await menu(created);await page.getByRole('menuitem',{name:'Создать копию',exact:true}).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('seda.reference.recents.files.v1')).files.length===27);assert.equal(await list().count(),27);
  await menu(created);await page.getByRole('menuitem',{name:'Переименовать',exact:true}).click();await page.locator('#reference-file-name').fill('Новый рабочий макет');await page.getByRole('button',{name:'Сохранить',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await page.reload();await ready();assert.equal(await file(created).getByRole('heading').textContent(),'Новый рабочий макет');
  await file(created).getByRole('button',{name:'Открыть Новый рабочий макет',exact:true}).click();assert.equal(await page.getByRole('dialog').getByRole('heading',{name:'Новый рабочий макет'}).count(),1);await dismiss();await page.waitForFunction(id=>{const target=[...document.querySelectorAll('[data-file-id]')].find(item=>item.getAttribute('data-file-id')===id)?.querySelector('.reference-file-open');return target&&target===document.activeElement;},created);assert.equal(await file(created).locator('.reference-file-open').evaluate(el=>el===document.activeElement),true);
  return {create:true,validation:true,copy:true,rename:true,reload:true,openAndFocusReturn:true};
 });
 await check('reference-selection-delete-cancel-restore',async()=>{
  const ids=await list().evaluateAll(items=>items.slice(0,2).map(item=>item.dataset.fileId));for(const id of ids){await file(id).hover();await file(id).getByRole('checkbox').check();}
  assert.match(await page.getByRole('region',{name:'Действия с выбранными файлами'}).textContent(),/Выбрано: 2/);await page.getByRole('button',{name:'В корзину',exact:true}).click();await page.getByRole('button',{name:'Отмена',exact:true}).click();assert.equal(await list().count(),27);
  await page.getByRole('button',{name:'В корзину',exact:true}).click();await page.getByRole('button',{name:'Переместить',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await list().count(),25);await page.getByRole('link',{name:'Trash',exact:true}).click();assert.equal(await list().count(),2);
  await menu(ids[0]);await page.getByRole('menuitem',{name:'Восстановить',exact:true}).click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('seda.reference.recents.files.v1')).files.filter(file=>file.trashed).length===1);assert.equal(await list().count(),1);await page.getByRole('link',{name:'Recents',exact:true}).click();assert.equal(await list().count(),26);return {multiple:true,cancel:true,trash:true,restore:true};
 });
 await check('reference-storage-failure-preserves-data-and-draft',async()=>{
  await page.getByRole('button',{name:'Design',exact:true}).click();await page.locator('#reference-file-name').fill('Storage failure draft');
  await page.evaluate(()=>{window.originalStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Disabled','QuotaExceededError');};});
  try{await page.getByRole('button',{name:'Сохранить',exact:true}).click();await page.getByRole('dialog').getByRole('alert').waitFor();assert.equal(await page.locator('#reference-file-name').inputValue(),'Storage failure draft');assert.equal(await list().count(),26);}
  finally{await page.evaluate(()=>{Storage.prototype.setItem=window.originalStorageSet;delete window.originalStorageSet;});}
  await page.getByRole('button',{name:'Сохранить',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await list().count(),27);return {atomicFailure:true,draftRetained:true,retry:true};
 });
 await check('reference-theme-size-xy-and-workspace-layout',async()=>{
  const samples=[];
  for(const width of [1280,1440,1920])for(const theme of ['light','dark'])for(const size of ['s','m','l','xl']){
   await page.setViewportSize({width,height:width===1440?1288:1080});await settings();await page.locator('#reference-theme').selectOption(theme);await page.locator('#reference-size').selectOption(size);await page.locator('#reference-x').fill('14');await page.locator('#reference-y').fill('6');
   assert.equal(await page.locator('#reference-x').inputValue(),'14');await dismiss();await settle();
   const values=await page.evaluate(()=>{const button=[...document.querySelectorAll('.reference-create-actions .seda-button')][0],input=document.getElementById('reference-search'),control=input.closest('.seda-field__control'),icon=document.querySelector('.reference-account .seda-icon-button'),tabs=document.querySelector('.reference-tabs .seda-tabs__tab'),filters=document.querySelector('.reference-filters'),list=document.querySelector('.seda-tabs__list');return {button:button.getBoundingClientRect().height,field:control.getBoundingClientRect().height,iconWidth:icon.getBoundingClientRect().width,iconHeight:icon.getBoundingClientRect().height,tab:tabs.getBoundingClientRect().height,filtersRight:filters.getBoundingClientRect().right,mainRight:document.querySelector('.reference-main').getBoundingClientRect().right,bodyWidth:document.documentElement.scrollWidth,viewport:innerWidth,colors:{field:getComputedStyle(control).backgroundColor,inner:getComputedStyle(input).backgroundColor},tabsBottom:list.getBoundingClientRect().bottom,gridTop:document.querySelector('.reference-files').getBoundingClientRect().top};});
   const expected={s:36,m:44,l:52,xl:60}[size];for(const key of ['button','field','tab'])assert.ok(Math.abs(values[key]-expected)<=1,JSON.stringify({key,size,values}));assert.ok(Math.abs(values.iconWidth-values.iconHeight)<=1);assert.ok(values.filtersRight<=values.mainRight+1);assert.equal(values.bodyWidth,values.viewport);assert.ok(values.gridTop>=values.tabsBottom-1);assert.equal(values.colors.inner,'rgba(0, 0, 0, 0)');samples.push({width,theme,size,...values});
  }
  await settings();await page.locator('#reference-size').selectOption('m');await page.locator('#reference-x').fill('0');await page.locator('#reference-y').fill('0');await page.locator('#reference-theme').selectOption('light');await dismiss();await page.setViewportSize({width:1440,height:1288});await page.screenshot({path:path.join(output,'recents-light-1440.png'),animations:'disabled'});
  return {samples:samples.length,measurements:samples};
 });
 await check('reference-corrupt-storage-recovery',async()=>{
  await page.evaluate(()=>localStorage.setItem('seda.reference.recents.files.v1','{"version":99}'));await page.reload({waitUntil:'networkidle'});await page.waitForSelector('[data-status=error]');assert.equal(await page.getByRole('heading',{name:'Не удалось загрузить рабочее пространство'}).count(),1);
  await page.getByRole('button',{name:'Восстановить исходные файлы'}).click();await page.getByRole('button',{name:'Восстановить',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});await ready();assert.equal(await list().count(),25);return {visibleError:true,explicitRecovery:true};
 });
 await check('reference-no-browser-errors',()=>{assert.deepEqual(errors,[]);return {errors};});
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await fs.writeFile(path.join(output,'results.json'),JSON.stringify({scope:'Recents reference 1:691',passed:results.filter(result=>result.status==='passed').length,failed:results.filter(result=>result.status==='failed').length,results,errors},null,2)+'\n');}
if(results.some(result=>result.status==='failed'))process.exitCode=1;
console.log(JSON.stringify({passed:results.filter(result=>result.status==='passed').length,failed:results.filter(result=>result.status==='failed').length,output}));
