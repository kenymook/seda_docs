import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import{pathToFileURL}from'node:url';import{chromium}from'playwright';import{createPilotServer}from'./server.mjs';
const routes={recents:'Справка',building:'Справка',chat:'Справка',sandbox:'Поиск слоёв'};
export async function verifyTooltipWorkspace(page,origin,output){
 await page.setViewportSize({width:1440,height:1288});
 const samples=[],errors=[];const listen=e=>errors.push(e.message);page.on('pageerror',listen);page.setDefaultTimeout(12000);
 try{for(const[route,name]of Object.entries(routes)){
  await page.goto(origin+'/references/'+route+'.html');
  for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const scale of [100,150]){
   await page.evaluate(({route,theme,size,scale})=>{const key='seda.reference.'+route+'.preferences.v1',old=JSON.parse(localStorage.getItem(key)||'{}');localStorage.setItem(key,JSON.stringify({...old,view:old.view??'grid',theme,size,scale,airX:24,airY:12}));},{route,theme,size,scale});await page.reload();await page.locator('.seda-provider[data-seda-theme="'+theme+'"][data-seda-size="'+size+'"][data-seda-text-scale="'+scale+'"]').first().waitFor();
   const trigger=page.getByRole('button',{name,exact:true});await trigger.waitFor();await page.evaluate(()=>document.fonts.ready);const before=await trigger.boundingBox();await trigger.focus();const hint=page.getByRole('tooltip');await hint.waitFor();
   assert.equal(await trigger.getAttribute('title'),null);assert.equal(await hint.textContent(),name);assert.equal(await trigger.evaluate(n=>n===document.activeElement),true);
   const result=await hint.evaluate(n=>{const r=n.getBoundingClientRect(),t=n.querySelector('[data-seda-text]'),s=getComputedStyle(t);return{role:t.dataset.sedaText,font:parseFloat(s.fontSize),line:parseFloat(s.lineHeight),x:r.x,y:r.y,width:r.width,height:r.height};});assert.equal(result.role,'caption/default');assert.equal(result.font,scale===150?18:12,JSON.stringify({route,theme,size,scale,dom:await hint.evaluate(n=>({scope:n.parentElement.outerHTML.slice(0,700),scale:getComputedStyle(n).getPropertyValue('--seda-text-scale'),size:getComputedStyle(n).getPropertyValue('--seda-type-caption-default-size'),root:document.querySelector('[data-reference]')?.getAttribute('data-seda-text-scale')}))}));assert.ok(result.x>=0&&result.y>=0&&result.x+result.width<=1441);assert.deepEqual(await trigger.boundingBox(),before);assert.equal(await trigger.getAttribute('aria-describedby'),await hint.getAttribute('id'));
   if(theme==='dark'&&size==='xl'&&scale===150)await page.screenshot({path:path.join(output,route+'-tooltip.png')});
   await page.keyboard.press('Escape');await hint.waitFor({state:'detached'});assert.equal(await trigger.evaluate(n=>n===document.activeElement),true);assert.equal(await trigger.getAttribute('aria-describedby'),null);
   samples.push({route,theme,size,scale,...result});
  }
 }
 assert.deepEqual(errors,[]);const result={samples,errors};await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2));return result;
 }finally{page.off('pageerror',listen);}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){const output=path.join(import.meta.dirname,'.diagnostics-tooltip-workspace');await fs.mkdir(output,{recursive:true});const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});try{const page=await browser.newPage({viewport:{width:1440,height:1288}});const r=await verifyTooltipWorkspace(page,'http://127.0.0.1:'+server.address().port,output);console.log(JSON.stringify({samples:r.samples.length,errors:r.errors,output}));}finally{await browser.close();await new Promise(r=>server.close(r));}}
