import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {chromium} from 'playwright';import {createPilotServer} from './server.mjs';
export async function verifyWorkspaceRhythm(page,origin,output){
 const samples=[];await page.setViewportSize({width:1440,height:1000});
 for(const route of ['recents','building','chat','sandbox','spline','webflow','framer','workflow']){
  await page.goto(origin+'/references/'+route+'.html');await page.locator('.seda-provider').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  for(const theme of ['light','dark']){
   if(route==='recents'||route==='building'){await page.getByRole('button',{name:'Kenymook',exact:true}).click();await page.getByRole('menuitem',{name:'Параметры интерфейса',exact:true}).click();}
   else if(route==='chat'||route==='sandbox')await page.getByRole('button',{name:'Параметры SEDA',exact:true}).click();
   else if(route==='spline'){await page.getByRole('button',{name:'Scene menu',exact:true}).click();await page.getByRole('menuitem',{name:'Appearance and parameters',exact:true}).click();}
   else if(route==='webflow')await page.locator('#wf-appearance').click();else await page.getByRole('button',{name:'SEDA',exact:true}).click();
   const dialog=page.getByRole('dialog');await dialog.waitFor();for(const control of await dialog.locator('select').all()){const values=await control.locator('option').evaluateAll(options=>options.map(o=>o.value));if(values.includes('light')&&values.includes('dark'))await control.selectOption(theme);if(values.includes('s')&&values.includes('xl'))await control.selectOption('m');}await page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();await dialog.waitFor({state:'hidden'});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight&&i.getBoundingClientRect().bottom>0).map(i=>i.decode().catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
   const sample=await page.evaluate(()=>({groups:[...document.querySelectorAll('[data-workspace-actions]')].map(el=>({kind:el.dataset.workspaceActions,gap:parseFloat(getComputedStyle(el).columnGap)})),menus:[...document.querySelectorAll('.seda-dropdown-menu>.seda-button')].map(el=>({name:el.textContent,glyph:el.querySelector('.seda-menu-disclosure')?.getAttribute('data-seda-icon')})),overflow:document.documentElement.scrollWidth-innerWidth}));
   assert.ok(sample.groups.length,route+' adopts the common action rhythm');for(const group of sample.groups)assert.equal(group.gap,group.kind==='compact'?4:8,route);for(const menu of sample.menus)assert.equal(menu.glyph,'arrow-chevron-down');assert.equal(sample.overflow,0,route);
   await page.screenshot({path:path.join(output,route+'-'+theme+'.png')});samples.push({route,theme,...sample});
  }
 }
 return{scope:'Shared action rhythm and menu disclosure; full-screen screenshots require visual review, not pixel fidelity certification',samples};
}
if(process.argv[1]===import.meta.filename){const output=path.join(import.meta.dirname,'.diagnostics-workspace-rhythm');await fs.mkdir(output,{recursive:true});const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{const result=await verifyWorkspaceRhythm(page,'http://127.0.0.1:'+server.address().port,output);assert.deepEqual(errors,[]);await fs.writeFile(path.join(output,'results.json'),JSON.stringify({...result,errors},null,2)+'\n');console.log(JSON.stringify({samples:result.samples.length,errors,output}));}finally{await browser.close();await new Promise(r=>server.close(r));}}
