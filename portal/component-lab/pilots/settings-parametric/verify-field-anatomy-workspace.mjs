import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
/** Actual dense application, not a component gallery or a source alias. */
export async function verifyFieldAnatomyWorkspace(page,origin,output){
 await fs.mkdir(output,{recursive:true});const samples=[],errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError);
 try{
  await page.goto(origin+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
  for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const scale of [100,150]){
   await page.evaluate(c=>window.sedaPilot.configure(c),{theme,controlSize:size});
   for(const[id,value]of Object.entries({scale,airX:scale===150?24:0,air:scale===150?12:0}))await page.locator('#'+id).fill(String(value));
   for(const section of ['projects','settings','members','components']){
    await page.locator('#nav-'+section).click();await settle(page);
    const fields=await page.locator('[data-workspace] :is(.seda-field--text,.seda-field--select,.seda-textarea)').evaluateAll(roots=>roots.filter(r=>r.getBoundingClientRect().width>0).map(root=>{
     const label=root.querySelector('.seda-field__label'),control=root.querySelector('.seda-field__control'),message=root.querySelector('.seda-field__message'),input=control.querySelector('input,select,textarea'),header=root.querySelector('.seda-textarea__header')??label,lc=getComputedStyle(label),mc=message&&getComputedStyle(message),rect=e=>{const r=e.getBoundingClientRect();return{y:r.y,bottom:r.bottom,height:r.height};};
     return{id:input.id,size:root.dataset.size,label:rect(label),control:rect(control),message:message&&rect(message),font:parseFloat(lc.fontSize),line:parseFloat(lc.lineHeight),weight:lc.fontWeight,messageFont:mc&&parseFloat(mc.fontSize),messageLine:mc&&parseFloat(mc.lineHeight),messageWeight:mc?.fontWeight,labelGap:control.getBoundingClientRect().top-header.getBoundingClientRect().bottom,messageGap:message&&message.getBoundingClientRect().top-control.getBoundingClientRect().bottom};
    }));
    assert.ok(fields.length,section+' contains real fields');
    for(const f of fields){const base={s:{font:12,line:16},m:{font:14,line:20},l:{font:16,line:24},xl:{font:18,line:28}}[f.size],font=Math.round(base.font*scale/100),line=Math.round(base.line*scale/100);assert.equal(f.font,font,f.id+' label font');assert.equal(f.line,line);assert.equal(f.weight,'400');assert.equal(f.labelGap,4,f.id+' label gap');if(f.message){assert.equal(f.messageFont,font,f.id+' helper font');assert.equal(f.messageLine,line);assert.equal(f.messageWeight,'400');assert.equal(f.messageGap,4,f.id+' helper gap');}}
    if(section==='settings'){
     const area=page.locator('#workspace-description');
     const clear=page.locator('#workspace-description').locator('xpath=..').locator('xpath=..').getByRole('button',{name:'Очистить',exact:true});
     await area.fill('Контекст команды');await clear.click();assert.equal(await area.inputValue(),'');assert.equal(await clear.isDisabled(),true);assert.equal(await area.evaluate(el=>document.activeElement===el),true);
     await area.fill('Первая строка');await area.press('End');await area.press('Enter');await page.keyboard.type('д');assert.equal(await area.inputValue(),'Первая строка\nд');
     assert.equal(await page.locator('.seda-textarea__counter').textContent(),'15 / 500');
    }
    samples.push({theme,size,scale,section,fields});
    if(size==='m')await page.screenshot({path:path.join(output,section+'-'+theme.toLowerCase()+'-'+scale+'.png'),fullPage:true});
   }
  }
  // Cross-component filters retain their real data ownership after parameter changes.
  await page.locator('#nav-projects').click();await page.locator('#filter').selectOption('paused');
  assert.equal((await page.locator('#count').textContent()).trim(),'1 проектов');assert.ok((await page.locator('#projects-table').textContent()).includes('Horizon App'));
  await page.locator('#reset-filters').click();assert.equal((await page.locator('#count').textContent()).trim(),'4 проектов');assert.deepEqual(errors,[]);
  const result={scope:'Actual Projects/Settings/Members/Components, Light/Dark × S–XL × 100/150 vectors; label/helper geometry and coupled filter workflow',cases:samples.length,fieldRecords:samples.reduce((n,s)=>n+s.fields.length,0),samples,filtersCoupled:true,textAreaCoupled:true,errors};
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');return result;
 }catch(error){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw error;}
 finally{page.off('pageerror',onError);await fs.writeFile(path.join(output,'partial.json'),JSON.stringify({samples,errors},null,2)+'\n');}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const output=path.join(import.meta.dirname,'.diagnostics-field-anatomy-workspace'),server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})}),page=await browser.newPage({viewport:{width:1702,height:1244}});
 try{const r=await verifyFieldAnatomyWorkspace(page,'http://127.0.0.1:'+server.address().port,output);console.log(JSON.stringify({cases:r.cases,fieldRecords:r.fieldRecords,filtersCoupled:r.filtersCoupled,errors:r.errors,output}));}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
