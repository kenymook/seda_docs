import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';import {chromium} from 'playwright';import {createPilotServer} from './server.mjs';
import {openReferenceAppearance} from './verify-application-text.mjs';
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
export async function verifyAdaptivePanels(page,origin,output){
 const samples=[],errors=[],error=event=>errors.push(event.message);page.on('pageerror',error);page.setDefaultTimeout(12000);
 try{
  for(const route of ['chat','sandbox']){
   await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/references/'+route+'.html');
   await page.locator(route==='chat'?'#chat-input':'#sandbox-selection-count').waitFor();await page.evaluate(()=>document.fonts.ready);
   await openReferenceAppearance(page,route);
   for(const[name,value]of [['theme','light'],['size','xl'],['scale','150']])await page.locator('#'+route+'-'+name).selectOption(value);
   for(const[axis,value]of [['x','24'],['y','12']])await page.getByRole('dialog').locator('#'+route+'-'+(route==='sandbox'?'air-':'')+axis).fill(value);
   await page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();await settle(page);
   for(const width of [960,1280,1440]){
    await page.setViewportSize({width,height:1000});await settle(page);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
    if(route==='chat'){
     const brand=await page.locator('.chat-navigation header strong').evaluate(node=>{const r=node.getBoundingClientRect(),parent=node.parentElement.getBoundingClientRect();return{wrap:getComputedStyle(node).whiteSpace,x:r.x,right:r.right,parentRight:parent.right,text:node.textContent};});
     assert.equal(brand.wrap,'nowrap');assert.ok(brand.x>=0&&brand.right<=brand.parentRight+1);assert.equal(brand.text,'ChatGPT');
     const values=await page.locator('.chat-activity dd .seda-text').evaluateAll(nodes=>nodes.map(node=>({text:node.textContent,rects:node.getClientRects().length})));for(const value of values)assert.equal(value.rects,1,JSON.stringify({width,value}));
     const buttons=await page.locator('.chat-activity>.seda-button[data-full-width],.chat-navigation-scroll>.seda-button[data-full-width]').evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect(),p=node.parentElement.getBoundingClientRect();return{left:r.left,right:r.right,parentLeft:p.left,parentRight:p.right,accessible:node.textContent,title:node.title};}));
     assert.ok(buttons.length);for(const button of buttons){assert.ok(button.left>=button.parentLeft-1&&button.right<=button.parentRight+1,JSON.stringify({width,button}));assert.ok(button.title);}
     await page.locator('.chat-scroll').evaluate(node=>{node.scrollTop=0;});const jump=page.getByRole('button',{name:'К последнему сообщению',exact:true});await jump.waitFor();
     const j=await jump.boundingBox(),composer=await page.locator('.chat-composer-column').boundingBox(),history=await page.locator('.chat-history').boundingBox();assert.ok(j.y+j.height<=composer.y+1&&j.y>=history.y-1,JSON.stringify({width,j,composer,history}));assert.ok(j.x>=history.x&&j.x+j.width<=history.x+history.width+1);
     await page.screenshot({path:path.join(output,'chat-jump-'+width+'.png')});await jump.click();await page.waitForFunction(()=>{const node=document.querySelector('.chat-scroll');return node.scrollHeight-node.clientHeight-node.scrollTop<2;});
     samples.push({route,width,brand,values,buttons,jump:j,composer});
    }else{
     const zoom=page.locator('.sandbox-inspector>header .seda-dropdown-menu button');assert.equal(await zoom.count(),1);
     const z=await zoom.boundingBox(),list=page.getByRole('tablist',{name:'Режим инспектора',exact:true}),l=await list.boundingBox();assert.ok(z.y+z.height<=l.y+1,'Zoom must not overlap tab labels');
     await page.getByRole('tab',{name:'Design',exact:true}).focus();await page.keyboard.press('End');await settle(page);
     const prototype=page.getByRole('tab',{name:'Prototype',exact:true}),p=await prototype.boundingBox(),viewport=await list.boundingBox();assert.equal(await prototype.getAttribute('aria-selected'),'true');assert.ok(p.x>=viewport.x-1&&p.x+p.width<=viewport.x+viewport.width+1,JSON.stringify({width,p,viewport}));
     await page.keyboard.press('Home');await settle(page);
     const dock=await page.locator('.sandbox-toolbar').boundingBox(),canvas=await page.locator('.sandbox-stage').boundingBox();assert.ok(dock.x>=canvas.x&&dock.x+dock.width<=canvas.x+canvas.width+1&&dock.y>=canvas.y&&dock.y+dock.height<=canvas.y+canvas.height+1,JSON.stringify({width,dock,canvas}));
     const heading=await page.locator('#sandbox-pages-title').evaluate(node=>({wrap:getComputedStyle(node).whiteSpace,rects:node.getClientRects().length}));assert.equal(heading.wrap,'nowrap');
     const grids=await page.locator('.sandbox-property-grid').evaluateAll(nodes=>nodes.map(node=>({columns:getComputedStyle(node).gridTemplateColumns,fields:Array.from(node.querySelectorAll(':scope>.seda-field')).map(field=>{const r=field.getBoundingClientRect(),p=node.getBoundingClientRect();return{left:r.left,right:r.right,parentLeft:p.left,parentRight:p.right};})})));
     assert.ok(grids.length);for(const grid of grids){assert.equal(grid.columns.trim().split(/\s+/).length,1,'Large appearance uses one readable field column');for(const field of grid.fields)assert.ok(field.left>=field.parentLeft-1&&field.right<=field.parentRight+1);}
     await page.screenshot({path:path.join(output,'sandbox-panels-'+width+'.png')});samples.push({route,width,zoom:z,tablist:l,prototype:p,grids,dock,canvas,heading});
    }
   }
  }
  assert.deepEqual(errors,[]);const result={samples,errors};await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2));return result;
 }catch(error){await page.screenshot({path:path.join(output,'failure.png')});throw error;}
 finally{page.off('pageerror',error);}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const output=path.join(import.meta.dirname,'.diagnostics-adaptive-panels');await fs.mkdir(output,{recursive:true});const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
 try{const page=await browser.newPage();const result=await verifyAdaptivePanels(page,'http://127.0.0.1:'+server.address().port,output);console.log(JSON.stringify({samples:result.samples.length,errors:result.errors,output}));}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
