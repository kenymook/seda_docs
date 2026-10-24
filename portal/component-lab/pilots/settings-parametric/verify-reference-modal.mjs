import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

export async function verifyReferenceModal(page,origin,output){
 const errors=[],samples=[];const error=event=>errors.push(event.message);page.on('pageerror',error);
 const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 try{
  for(const route of ['recents','building','chat','sandbox','spline','webflow','framer','workflow']){
   await page.goto(origin+'/references/'+route+'.html');await page.evaluate(()=>document.fonts.ready);
   if(route==='recents'||route==='building'){await page.getByRole('button',{name:'Kenymook',exact:true}).click();await page.getByRole('menuitem',{name:'Параметры интерфейса',exact:true}).click();}
   else if(route==='chat'||route==='sandbox')await page.getByRole('button',{name:'Параметры SEDA',exact:true}).click();
   else if(route==='spline'){await page.getByRole('button',{name:'Scene menu',exact:true}).click();await page.getByRole('menuitem',{name:'Appearance and parameters',exact:true}).click();}
   else if(route==='webflow')await page.locator('#wf-appearance').click();
   else await page.getByRole('button',{name:'SEDA',exact:true}).click();
   const dialog=page.getByRole('dialog');await dialog.waitFor();
   assert.equal(await dialog.getAttribute('data-seda-component'),'Modal');
   const selects=dialog.locator('select'),count=await selects.count();let themeControl,sizeControl,scaleControl;
   for(let index=0;index<count;index++){
    const control=selects.nth(index),values=await control.locator('option').evaluateAll(options=>options.map(option=>option.value));
    if(values.includes('light')&&values.includes('dark'))themeControl=control;
    if(['s','m','l','xl'].every(value=>values.includes(value)))sizeControl=control;
    if(values.includes('80')&&values.includes('150'))scaleControl=control;
   }
   assert.ok(themeControl&&sizeControl,route+' appearance controls');
   for(const theme of ['light','dark'])for(const size of ['s','xl']){
    await themeControl.selectOption(theme);await sizeControl.selectOption(size);if(scaleControl)await scaleControl.selectOption('150');await settle();
    const sample=await dialog.evaluate(node=>{
     const close=node.querySelector('.seda-modal__close'),r=close.getBoundingClientRect(),title=node.querySelector('h2'),style=getComputedStyle(title),s=getComputedStyle(node),provider=node.closest('.seda-provider');
     return{width:node.getBoundingClientRect().width,titleRole:title.dataset.sedaText,titleFont:parseFloat(style.fontSize),expectedTitleFont:Math.max(parseFloat(style.getPropertyValue('--seda-type-heading-section-minimum')),parseFloat(style.getPropertyValue('--seda-type-heading-section-size'))*Number(provider.dataset.sedaTextScale)/100),textScale:Number(provider.dataset.sedaTextScale),close:{width:r.width,height:r.height,icon:close.querySelector('[data-seda-icon]')?.dataset.sedaIcon},background:s.backgroundColor,body:!!node.querySelector('.seda-modal__body'),focusInside:node.contains(node.ownerDocument.activeElement)};
    });
    assert.equal(sample.titleRole,'heading/section');assert.ok(Math.abs(sample.titleFont-sample.expectedTitleFont)<.05,JSON.stringify(sample));assert.ok(sample.close.width>=44);assert.equal(sample.close.width,sample.close.height);assert.equal(sample.close.icon,'close');assert.ok(sample.body&&sample.focusInside);assert.notEqual(sample.background,'rgba(0, 0, 0, 0)');assert.equal(sample.width,720);samples.push({route,theme,size,...sample});
   }
   await page.screenshot({path:path.join(output,'modal-'+route+'-dark-xl.png')});
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await settle();
   assert.equal(await page.locator('dialog:modal').count(),0);
   assert.ok(await page.evaluate(()=>!!document.activeElement&&document.activeElement!==document.body),'Logical focus destination: '+route);
  }
  assert.deepEqual(errors,[]);const result={samples,errors};await fs.writeFile(path.join(output,'reference-modal-results.json'),JSON.stringify(result,null,2));return result;
 }finally{page.off('pageerror',error);}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const output=path.join(import.meta.dirname,'.diagnostics-reference-modal');await fs.mkdir(output,{recursive:true});
 const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
 try{const page=await browser.newPage({viewport:{width:1440,height:1288}});const result=await verifyReferenceModal(page,'http://127.0.0.1:'+server.address().port,output);console.log(JSON.stringify({samples:result.samples.length,errors:result.errors,output}));}
 finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
