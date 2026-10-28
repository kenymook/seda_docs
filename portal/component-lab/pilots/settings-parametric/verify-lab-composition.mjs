import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));

export async function verifyLabComposition(page,origin,output){
 const samples=[];
 await page.goto(origin+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
 const header=page.locator('header.studio-header');
 assert.equal(await header.count(),1,'Lab and token editor share StudioHeader');
 assert.equal(await page.locator('.studio-rail .seda-icon-button[aria-current=page]').getAttribute('aria-label'),'SEDA AI Lab');
 assert.equal(await page.locator('.lab-navigation nav[aria-label="Навигация рабочего пространства"] button').count(),6);
 assert.equal(await page.locator('.lab-navigation nav[aria-label="Эталонные приложения"] button').count(),8);
 assert.equal(await header.locator('.seda-button').count(),2);
 assert.equal(await page.locator('.product-nav').count(),0);
 for(const [width,height] of [[1702,900],[1280,800],[1140,900],[780,900]]){
  await page.setViewportSize({width,height});await settle(page);
  const sample=await page.evaluate(()=>{
   const box=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();
   return{viewport:{width:innerWidth,height:innerHeight},documentOverflow:document.documentElement.scrollWidth-innerWidth,documentScroll:document.documentElement.scrollHeight-innerHeight,
    header:box('.studio-header'),rail:box('.studio-rail'),navigation:box('.lab-navigation'),canvas:box('.canvas'),right:box('.lab-right-sidebar')};
  });
  assert.ok(sample.documentOverflow<=1,JSON.stringify(sample));
  assert.equal(sample.rail.width,54);
  assert.ok(sample.rail.x<sample.navigation.x&&sample.navigation.x<sample.canvas.x&&sample.canvas.x<sample.right.x);
  assert.ok(sample.documentScroll<=1,'Desktop uses one viewport');
  const before=sample.right.y;
  await page.locator('.canvas').evaluate(el=>{el.scrollTop=320;});await settle(page);
  assert.equal((await page.locator('.lab-right-sidebar').boundingBox()).y,before);
  await page.locator('.canvas').evaluate(el=>{el.scrollTop=0;});
  samples.push(sample);
  if(width===1702||width===780)await page.screenshot({path:path.join(output,'lab-layout-'+width+'.png')});
 }
 await page.setViewportSize({width:1702,height:900});await settle(page);
 for(const [id,title] of [['settings','Настройки · форма'],['members','Команда · роли и данные'],['editor','Редактор · связанные панели'],['components','Компоненты · совместные состояния'],['feedback','Состояния · обратная связь'],['projects','Проекты · поиск и просмотр']]){
  await page.locator('#nav-'+id).click();
  await page.getByRole('tab',{name:'Инспектор',exact:true}).click();
  assert.equal((await page.locator('#composition-current-page').textContent()).trim(),title);
  assert.equal(await page.locator('#nav-'+id).getAttribute('aria-current'),'page');
 }
 for(const theme of ['light','dark']){
  await page.getByRole('tab',{name:'Параметры',exact:true}).click();
  await page.locator('#theme').selectOption(theme);await page.locator('#scale').fill('100');await settle(page);
  await page.screenshot({path:path.join(output,'lab-composition-'+theme+'-100.png')});
  await page.locator('#scale').fill('150');await settle(page);
  const sample=await page.evaluate(()=>({theme:document.querySelector('#lab').dataset.theme,
   count:document.querySelector('#count').textContent.trim(),formula:document.querySelector('#equation').textContent.trim(),
   route:document.querySelector('#composition-current-page').textContent.trim(),
   overflow:document.documentElement.scrollWidth-innerWidth}));
  assert.equal(sample.theme,theme);assert.equal(sample.count,'4 проекта');assert.ok(sample.formula.includes('px'));
  assert.equal(sample.route,'Проекты · поиск и просмотр');assert.ok(sample.overflow<=1);
  await page.screenshot({path:path.join(output,'lab-composition-'+theme+'.png')});
  await page.getByRole('tab',{name:'Инспектор',exact:true}).click();
  await page.screenshot({path:path.join(output,'lab-inspector-'+theme+'.png')});
  samples.push(sample);
 }
 await page.getByRole('tab',{name:'Параметры',exact:true}).click();
 // Panel switching preserves parameter edits and form drafts.
 await page.locator('#scale').fill('125');
 await page.getByRole('tab',{name:'Инспектор',exact:true}).click();
 await page.getByRole('tab',{name:'Параметры',exact:true}).focus();await page.keyboard.press('ArrowRight');
 assert.equal(await page.getByRole('tab',{name:'Инспектор',exact:true}).getAttribute('aria-selected'),'true');
 await page.getByRole('tab',{name:'Параметры',exact:true}).click();
 assert.equal(await page.locator('#scale').inputValue(),'125');
 await page.getByRole('button',{name:'Палитра',exact:true}).click();await page.waitForURL('**/tokens.html?area=foundation');
 assert.equal(await page.getByRole('button',{name:'Палитра',exact:true}).getAttribute('aria-current'),'page');
 await page.getByRole('button',{name:'SEDA AI Lab',exact:true}).click();await page.waitForURL(origin+'/');
 await page.setViewportSize({width:390,height:844});await settle(page);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth<=1));await page.screenshot({path:path.join(output,'lab-mobile.png'),fullPage:true});
 return{scope:'Shared studio chrome, left screen/example navigation, right SEDA tabs, panel state, cross-editor rail navigation, responsive layout and both themes',samples};
}

if(process.argv[1]===import.meta.filename){
 const output=path.join(import.meta.dirname,'.diagnostics-lab-composition');await fs.mkdir(output,{recursive:true});
 const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
 const page=await browser.newPage({viewport:{width:1702,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{const result=await verifyLabComposition(page,'http://127.0.0.1:'+server.address().port,output);assert.deepEqual(errors,[]);await fs.writeFile(path.join(output,'results.json'),JSON.stringify({...result,errors},null,2)+'\n');console.log(JSON.stringify({samples:result.samples.length,errors,output}));}
 finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
