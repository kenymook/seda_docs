import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {createHash} from 'node:crypto';
import {chromium} from 'playwright';import {createPilotServer} from './server.mjs';
const sourceTokensSha256=createHash('sha256').update(await fs.readFile('../../../../tokens.json')).digest('hex');
const server=await createPilotServer({port:0}),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const seed=JSON.parse(await fs.readFile('references/recents-data.json')),samples=[],errors=[];let writes=0;
await fs.mkdir('.diagnostics-command-actions',{recursive:true});
const create=['Design','FigJam','Slides','Make'];
const settled=page=>page.evaluate(async()=>{for(let i=0;i<6;i++)await new Promise(requestAnimationFrame);});
try{
 for(const theme of ['light','dark'])for(const size of ['s','m','l','xl','stress']){
  const stress=size==='stress',prefs={theme,size:stress?'xl':size,scale:stress?150:100,airX:stress?24:0,airY:stress?12:0,view:'grid'};
  const context=await browser.newContext({viewport:{width:1440,height:stress?900:1288}});
  await context.addInitScript(({prefs,files})=>{localStorage.setItem('seda.reference.recents.preferences.v1',JSON.stringify(prefs));localStorage.setItem('seda.reference.recents.files.v1',JSON.stringify({version:1,files}));},{prefs,files:seed.files});
  await context.route('**/api/token-document',route=>{if(route.request().method()!=='GET')writes++;return route.fulfill({json:{sourceTokensSha256,revision:0,edits:{},updatedAt:null}});});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/references/recents.html');await page.locator('.reference-app[data-status=ready]').waitFor();
  await page.waitForFunction(()=>{const n=document.querySelector('.command-actions');return n&&n.scrollWidth<=n.clientWidth+1;});
  const measure=await page.locator('.reference-header').evaluate(n=>{const s=getComputedStyle(n),b=n.querySelector('button').getBoundingClientRect();return{height:n.getBoundingClientRect().height,expected:Math.max(parseFloat(s.minHeight),b.height+parseFloat(s.paddingTop)+parseFloat(s.paddingBottom)+parseFloat(s.borderBottomWidth)),hidden:Number(n.querySelector('.command-actions').dataset.overflowCount),outerOverflow:document.documentElement.scrollWidth-innerWidth,firstCardY:document.querySelector('[data-file-id]').getBoundingClientRect().y};});
  assert.ok(Math.abs(measure.height-measure.expected)<=1,JSON.stringify(measure));assert.equal(measure.outerOverflow,0);assert.ok(await page.locator('[data-command-id=design]').isVisible());if(stress)assert.ok(measure.hidden>0);
  const inline=await page.locator('.command-actions [data-command-id]').allTextContents();
  const more=page.locator('.command-actions').getByRole('button',{name:'More',exact:true});await more.focus();await page.keyboard.press('ArrowDown');
  const menu=page.getByRole('menu');await menu.waitFor();const entries=await menu.getByRole('menuitem').allTextContents();
  for(const name of create)assert.equal([...inline,...entries].filter(x=>x.trim()===name).length,1,'Each command appears once: '+name);
  assert.ok(entries.includes('Параметры интерфейса'));assert.ok(entries.includes('Справка и горячие клавиши'));
  await page.keyboard.press('Escape');await page.waitForFunction(()=>document.activeElement?.textContent==='More');
  if(stress){
   // Dispatch each action through its actual current presentation and check domain type.
   for(const name of create){
    await settled(page);
    await settled(page);const button=page.locator('.command-actions').getByRole('button',{name,exact:true});
    if(await button.count())await button.click();else{await more.click();await page.getByRole('menuitem',{name,exact:true}).click();}
    const dialog=page.getByRole('dialog');await dialog.waitFor();const field=dialog.getByLabel('Название файла',{exact:false});await field.fill('Overflow proof '+name);
    await page.setViewportSize({width:1600,height:900});assert.equal(await field.inputValue(),'Overflow proof '+name);
    await dialog.getByRole('button',{name:'Сохранить',exact:true}).click();await dialog.waitFor({state:'hidden'});
    const created=await page.evaluate(name=>JSON.parse(localStorage.getItem('seda.reference.recents.files.v1')).files.find(f=>f.name==='Overflow proof '+name),name);
    assert.equal(created.type,name.toLowerCase());await page.setViewportSize({width:1440,height:900});
   }
   await page.screenshot({path:'.diagnostics-command-actions/'+theme+'-stress.png'});
  }
  samples.push({theme,size,...measure});await context.close();
 }
 // A focused secondary command moving into More must not leave focus on body.
 const page=await browser.newPage({viewport:{width:1920,height:900}});await page.route('**/api/token-document',r=>r.fulfill({json:{sourceTokensSha256,revision:0,edits:{},updatedAt:null}}));
 await page.addInitScript(()=>localStorage.setItem('seda.reference.recents.preferences.v1',JSON.stringify({theme:'dark',size:'m',scale:100,airX:0,airY:0,view:'grid'})));
 await page.goto(base+'/references/recents.html');await page.locator('[data-command-id=make]').focus();await page.setViewportSize({width:900,height:900});
 await page.waitForFunction(()=>document.activeElement?.textContent==='More');
 await page.locator('.command-actions').getByRole('button',{name:'More',exact:true}).click();await page.getByRole('menuitem',{name:'Make',exact:true}).waitFor();
 await page.setViewportSize({width:1920,height:900});await page.keyboard.press('Escape');assert.equal(await page.locator('.command-actions').getByRole('button',{name:'More',exact:true}).evaluate(n=>n===document.activeElement),true);
 assert.equal(writes,0);assert.deepEqual(errors,[]);
 await fs.writeFile('.diagnostics-command-actions/results.json',JSON.stringify({samples,checks:['one header row','all commands exactly once','keyboard menu and Escape','real create domain types','draft survives resize','focus repair when command collapses'],writes,errors},null,2));
 console.log('PASS: command overflow in both themes, S/M/L/XL/stress; real action dispatch, draft/keyboard/focus preservation; GET-only token fixture.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
