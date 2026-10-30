import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
import {textContrast} from '../../../../packages/seda-ui/scripts/verify-colors.mjs';

const output=path.join(import.meta.dirname,'.diagnostics-feedback');await fs.mkdir(output,{recursive:true});
const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1702,height:1244}}),errors=[],results=[];
page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000);
const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function check(name,run){try{const evidence=await run();results.push({name,status:'passed',evidence});console.log('PASS '+name);}catch(e){results.push({name,status:'failed',error:e.stack});console.log('FAIL '+name+': '+e.message);}}
const near=(a,b,label)=>assert.ok(Math.abs(a-b)<=1,`${label}: ${a} != ${b}`);
try{
  await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);await page.locator('#nav-feedback').click();
  await check('feedback-native-filter-count-toast-and-dismiss-focus',async()=>{
    const tag=page.locator('#feedback-filter .seda-tag__main');assert.equal(await page.locator('#feedback-projects li').count(),4);
    await tag.focus();await page.keyboard.press('Space');await settle();assert.equal(await tag.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#feedback-projects li').count(),2);assert.equal(await page.locator('#feedback-count').textContent(),'2');assert.match(await page.locator('#feedback-toast').innerText(),/Фильтр включён/);
    await page.getByRole('button',{name:'Сбросить фильтр',exact:true}).click();assert.equal(await page.locator('#feedback-projects li').count(),4);assert.equal(await tag.getAttribute('aria-pressed'),'false');
    await page.getByRole('button',{name:'Закрыть уведомление',exact:true}).click();assert.equal(await page.locator('#feedback-toast').count(),0);assert.equal(await page.locator('#feedback-show-toast').evaluate(el=>el===document.activeElement),true);
    await page.locator('#feedback-filter .seda-tag__dismiss').focus();await page.keyboard.press('Enter');await settle();assert.equal(await page.locator('#feedback-filter').count(),0);assert.match(await page.locator('#feedback-toast').innerText(),/Фильтр удалён/);assert.equal(await page.locator('#feedback-restore-filter').evaluate(el=>el===document.activeElement),true);
    await page.locator('#feedback-restore-filter').click();assert.equal(await page.locator('#feedback-filter').count(),1);assert.equal(await page.locator('button button,[role=button] button').count(),0);return{nativeSpace:true,count2And4:true,independentDismiss:true,focusRestored:true};
  });
  await check('chip-core-filter-intersects-and-restores-focus',async()=>{
    const toggle=page.locator('#feedback-filter .seda-tag__main');await toggle.click();assert.equal(await page.locator('#feedback-projects li').count(),2);
    await page.locator('#feedback-add-core').click();assert.equal(await page.locator('#feedback-projects li').count(),1);assert.equal(await page.locator('#feedback-projects li').first().innerText().then(x=>x.includes('Atlas')),true);
    for(const theme of ['Light','Dark']){await page.evaluate(theme=>window.sedaPilot.configure({theme}),theme);await settle();await page.locator('#feedback-core-chip').locator('..').locator('..').screenshot({path:path.join(output,'chip-filter-'+theme.toLowerCase()+'.png')});}
    await page.evaluate(()=>window.sedaPilot.configure({theme:'Light'}));await settle();
    await page.getByRole('button',{name:'Удалить фильтр команды Core'}).focus();await page.keyboard.press('Enter');await settle();assert.equal(await page.locator('#feedback-projects li').count(),2);
    assert.equal(await page.locator('#feedback-add-core').evaluate(el=>el===document.activeElement),true);assert.equal(await toggle.getAttribute('aria-pressed'),'true');
    await toggle.click();assert.equal(await page.locator('#feedback-projects li').count(),4);
    await page.locator('#feedback-add-core').click();await toggle.click();assert.match(await page.locator('#feedback-toast').innerText(),/1 проект(?!а)/);
    await page.getByRole('button',{name:'Сбросить фильтр',exact:true}).click();assert.equal(await page.locator('#feedback-projects li').count(),2);assert.match(await page.locator('#feedback-toast').innerText(),/2 проекта/);
    await page.getByRole('button',{name:'Удалить фильтр команды Core'}).click();await settle();assert.equal(await page.locator('#feedback-projects li').count(),4);
    return{intersection:true,keyboardRemove:true,focusRestored:true,otherFilterPreserved:true,noticeMatchesFilteredCount:true};
  });
  await check('feedback-alert-dismiss-restore-and-explicit-urgency',async()=>{
    await page.getByRole('button',{name:'Скрыть пример сообщения',exact:true}).click();await settle();assert.equal(await page.locator('#feedback-alert').count(),0);assert.equal(await page.locator('#feedback-show-alert').evaluate(el=>el===document.activeElement),true);
    await page.locator('#feedback-show-alert').click();await settle();assert.equal(await page.locator('#feedback-severity').evaluate(el=>el===document.activeElement),true);
    await page.locator('#feedback-severity').selectOption('error');await page.locator('#feedback-show-toast').click();assert.equal(await page.locator('#feedback-alert').getAttribute('role'),'alert');assert.equal(await page.locator('#feedback-toast').getAttribute('aria-live'),'assertive');assert.equal(await page.locator('#feedback-toast').getAttribute('data-duration'),'persistent');return{alert:true,assertive:true,persistentExplicit:true};
  });
  await check('feedback-shared-scale-shapes-and-semantic-composition-palette',async()=>{
    const samples=[];
    for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,100,150]){
      await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme,size});await page.locator('#scale').fill(String(scale));await page.locator('#air').fill('4');await page.locator('#airX').fill('8');await settle();
      const actual=await page.evaluate(()=>{
        const root=document.querySelector('#feedback-page'),derived=window.sedaPilot.getLab().derived;
        const paints=Array.from(root.querySelectorAll('.seda-alert__title,.seda-alert__description,.seda-toast__title,.seda-toast__description,.seda-toast__action,.seda-tag__label,.seda-badge__value')).filter(el=>el.getBoundingClientRect().height>0).map(el=>{const backgrounds=[];for(let a=el;a;a=a.parentElement)backgrounds.push(getComputedStyle(a).backgroundColor);return{part:el.className,color:getComputedStyle(el).color,backgrounds,font:parseFloat(getComputedStyle(el).fontSize)};});
        const glyphs=Array.from(root.querySelectorAll('.seda-alert__icon .seda-icon,.seda-toast__icon .seda-icon,.seda-tag__icon .seda-icon')).map(el=>el.getBoundingClientRect().width);
        const probe=document.createElement('span');probe.style.background='var(--surface-base)';document.getElementById('lab-scope').append(probe);const base=getComputedStyle(probe).backgroundColor;probe.remove();
        return{derived,paints,glyphs,panelColors:[...root.querySelectorAll('.pane')].map(element=>getComputedStyle(element).backgroundColor),base,overflow:document.documentElement.scrollWidth-innerWidth};
      });
      for(const paint of actual.paints){near(paint.font,actual.derived.font,'feedback shared font');assert.ok(textContrast(paint.color,paint.backgrounds)>=4.5,`${theme}/${size}/${scale}/${paint.part}`);}
      for(const width of actual.glyphs)near(width,actual.derived.icon,'feedback shared icon');for(const color of actual.panelColors)assert.equal(color,actual.base,'same semantic surface');assert.equal(actual.overflow,0);samples.push({theme,size,scale,font:actual.derived.font,icon:actual.derived.icon});
    }
    return{samples,feedbackPaneSurfaces:true,activeTextContrast:4.5,pillShapesRetained:true};
  });
  await check('feedback-all-severities-and-real-project-tags',async()=>{
    for(const severity of ['info','success','warning','error','ai']){await page.locator('#feedback-severity').selectOption(severity);await settle();assert.equal(await page.locator('#feedback-alert .seda-alert__icon .seda-icon').count(),1);}
    await page.locator('#nav-projects').click();assert.ok(await page.locator('#projects-page .seda-tag:visible').count()>=4);assert.equal(await page.locator('#projects-page .pill:visible').count(),0);await page.locator('#nav-feedback').click();return{fiveSeverities:true,libraryTagsInTableAndCards:true};
  });
  await check('feedback-target-viewports-themes-and-captures',async()=>{
    const samples=[];for(const width of [1280,1920])for(const theme of ['Light','Dark']){await page.setViewportSize({width,height:900});await page.evaluate(theme=>window.sedaPilot.configure({theme,controlSize:'m'}),theme);await page.locator('#scale').fill('100');await page.locator('#feedback-severity').selectOption('warning');await settle();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);await page.locator('#reset').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#export').evaluate(el=>el===document.activeElement),true);const header=await page.locator('#export').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,right:el.getBoundingClientRect().right,edge:el.parentElement.getBoundingClientRect().right}));assert.ok(header.scroll<=header.width+1);assert.ok(header.right<=header.edge+1,JSON.stringify({width,theme,...header}));assert.ok(header.right<=page.viewportSize().width);await page.screenshot({path:path.join(output,`feedback-${width}-${theme}.png`),fullPage:true});samples.push({width,theme});}return{samples};
  });
  await check('toast-host-real-queue-actions-and-clear',async()=>{
    await page.locator('#queue-burst').click();await settle();assert.equal(await page.locator('#feedback-queue .seda-toast').count(),3);assert.match(await page.locator('#queue-summary').textContent(),/В очереди: 2/);
    await page.locator('#feedback-queue .seda-toast__dismiss').first().click();await settle();assert.equal(await page.locator('#feedback-queue .seda-toast').count(),3);assert.match(await page.locator('#queue-summary').textContent(),/В очереди: 1/);
    await page.locator('#queue-clear').click();await settle();assert.equal(await page.locator('#feedback-queue .seda-toast').count(),0);assert.equal(await page.locator('#queue-clear').isDisabled(),true);
    await page.locator('#queue-review').click();await page.locator('#queue-review').click();await settle();assert.equal(await page.locator('#feedback-queue .seda-toast').count(),1);assert.equal(await page.locator('#feedback-queue .seda-toast').getAttribute('data-duration'),'persistent');
    await page.locator('#feedback-queue .seda-toast__action').click();assert.match(await page.locator('#queue-summary').textContent(),/Отметок проверки: 1/);
    return{threeVisibleTwoQueued:true,promoted:true,clear:true,dedupe:true,realAction:true};
  });
  await check('toast-host-inherits-parametric-scope-and-focus',async()=>{
    const samples=[];
    for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,100,150]){
      await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme,size});await page.locator('#scale').fill(String(scale));await settle();
      const metrics=await page.locator('#feedback-queue .seda-toast').evaluate(el=>({font:parseFloat(getComputedStyle(el.querySelector('.seda-toast__title')).fontSize),icon:el.querySelector('.seda-icon').getBoundingClientRect().width,expected:window.sedaPilot.getLab().derived,overflow:el.scrollWidth>el.clientWidth+1}));near(metrics.font,metrics.expected.font,'host font');near(metrics.icon,metrics.expected.icon,'host icon');assert.equal(metrics.overflow,false);samples.push({theme,size,scale});
    }
    await page.locator('#feedback-queue .seda-toast__dismiss').focus();await page.keyboard.press('Escape');await settle();assert.equal(await page.locator('#feedback-queue .seda-toast').count(),0);assert.equal(await page.locator('#queue-add').evaluate(el=>el===document.activeElement),true);
    return{samples,focusRestored:true,noPortalScopeLoss:true};
  });
  await check('feedback-browser-errors',()=>assert.deepEqual(errors,[]));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));await fs.writeFile(path.join(output,'results.json'),JSON.stringify({scope:'Real SEDA feedback composition, filter/state actions and shared semantic palette',results,errors},null,2));}
const failed=results.filter(r=>r.status==='failed');console.log(JSON.stringify({passed:results.length-failed.length,failed:failed.length,output}));if(failed.length)process.exitCode=1;
