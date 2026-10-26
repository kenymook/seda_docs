import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));

export async function verifyLabComposition(page,origin,output){
 const samples=[];
 await page.goto(origin+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
 const header=page.locator('header.seda-top-bar.top');
 assert.equal(await header.count(),1,'Lab chrome uses the installed SEDA TopBar');
 assert.equal(await header.locator('.brand small').count(),0,'The header has a single SEDA AI name');
 assert.equal(await page.locator('#lab .eyebrow').count(),0,'Lab sections use clear headings without decorative overlines');
 assert.equal(await header.locator('nav[aria-label="Эталонные приложения"] a.seda-link').count(),9);
 assert.equal(await header.locator('nav[aria-label="Эталонные приложения"] a[aria-current="page"]').count(),1);
 assert.equal(await header.locator('.seda-button').count(),2);
 for(const [width,height] of [[1702,900],[1280,800],[1140,900],[780,900]]){
  await page.setViewportSize({width,height});await settle(page);
  const sample=await page.evaluate(()=>{
   const box=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();
   const scroll=selector=>{const el=document.querySelector(selector);return{client:el.clientHeight,content:el.scrollHeight,top:el.scrollTop,overflow:getComputedStyle(el).overflowY};};
   return{viewport:{width:innerWidth,height:innerHeight},documentOverflow:document.documentElement.scrollWidth-innerWidth,documentScroll:document.documentElement.scrollHeight-innerHeight,
    header:box('.top'),rail:box('.rail'),canvas:box('.canvas'),inspector:box('.inspector'),
    scroll:{rail:scroll('.rail'),canvas:scroll('.canvas'),inspector:scroll('.inspector')}};
  });
  assert.ok(sample.documentOverflow<=1,JSON.stringify(sample));
  if(width>=1181){
   assert.ok(sample.documentScroll<=1,'Desktop Lab keeps navigation, workspace and inspector in one app viewport');
   assert.ok(sample.scroll.canvas.content>sample.scroll.canvas.client+50,'Product workspace has an independent scroll region');
   assert.equal(sample.scroll.canvas.overflow,'auto');
   const before=await page.locator('.rail h2,.inspector h2,.product-workspace-chrome').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top));
   await page.locator('.canvas').evaluate(el=>{el.scrollTop=320;});await settle(page);
   const after=await page.locator('.rail h2,.inspector h2,.product-workspace-chrome').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top));
   assert.ok(Math.abs(before[0]-after[0])<=1&&Math.abs(before[1]-after[1])<=1,'Only the product region scrolls');
   assert.ok(Math.abs(before[2]-after[2])<=1,'Workspace navigation stays available while the product scrolls');
   await page.locator('.canvas').evaluate(el=>{el.scrollTop=0;});await settle(page);
  }
  samples.push(sample);
  if(width===1702||width===780)await page.screenshot({path:path.join(output,'lab-layout-'+width+'.png')});
 }
 await page.setViewportSize({width:1702,height:900});await settle(page);
 for(const [id,title] of [['settings','Настройки · форма'],['members','Команда · роли и данные'],['editor','Редактор · связанные панели'],['components','Компоненты · совместные состояния'],['feedback','Состояния · обратная связь'],['projects','Проекты · поиск и просмотр']]){
  await page.locator('#nav-'+id).click();
  assert.equal((await page.locator('#composition-current-page').textContent()).trim(),title);
  assert.equal(await page.locator('#nav-'+id).getAttribute('aria-current'),'page');
 }
 for(const theme of ['light','dark']){
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
  samples.push(sample);
 }
 return{scope:'Installed TopBar, desktop panel scroll, responsive width and live composition ownership in both themes',samples};
}

if(process.argv[1]===import.meta.filename){
 const output=path.join(import.meta.dirname,'.diagnostics-lab-composition');await fs.mkdir(output,{recursive:true});
 const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
 const page=await browser.newPage({viewport:{width:1702,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{const result=await verifyLabComposition(page,'http://127.0.0.1:'+server.address().port,output);assert.deepEqual(errors,[]);await fs.writeFile(path.join(output,'results.json'),JSON.stringify({...result,errors},null,2)+'\n');console.log(JSON.stringify({samples:result.samples.length,errors,output}));}
 finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
