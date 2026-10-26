import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
import {configureAppearance} from './verify-inspector-consistency.mjs';

const routes=['recents','building','chat','sandbox','spline','webflow','framer','workflow'];
export async function verifyControlSurfaces(page,origin,output){
 await fs.mkdir(output,{recursive:true});
 const samples=[],errors=[];page.on('pageerror',error=>errors.push(error.message));
 for(const route of routes){
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin+'/references/'+route+'.html');
  await page.locator('.seda-provider').first().waitFor();
  if(route==='spline'){
   await page.getByRole('button',{name:'Scene menu',exact:true}).click();
   await page.getByRole('menuitem',{name:'Source context: Object · 1:5441',exact:true}).click();
   await page.locator('#spline-object-name').waitFor();
  }
  for(const theme of ['light','dark']){
   await configureAppearance(page,route,{theme,size:'m',scale:100,x:0,y:0});
   const state=await page.evaluate(()=>{
    const root=document.querySelector('.seda-provider'),s=getComputedStyle(root);
    const fields=[...document.querySelectorAll('.seda-select select,.seda-field__control,.seda-textarea__control')]
      .filter(node=>node.getBoundingClientRect().width>0)
      .map(node=>({tag:node.tagName,background:getComputedStyle(node).backgroundColor}));
    return{control:s.getPropertyValue('--surface-control').trim(),hover:s.getPropertyValue('--surface-control-hover').trim(),select:s.getPropertyValue('--select-surface-default').trim(),textField:s.getPropertyValue('--text-field-surface-default').trim(),textArea:s.getPropertyValue('--text-area-surface-default').trim(),panel:s.getPropertyValue('--container-neutral-default').trim(),fields};
   });
   const expected=theme==='dark'?'#ffffff12':'#ffffff';
   assert.equal(state.control,expected);assert.equal(state.select,expected);
   assert.equal(state.textField,expected);assert.equal(state.textArea,expected);
   assert.equal(state.hover,theme==='dark'?'#ffffff1c':'#f8f8f9');
   const opaque=state.fields.filter(item=>item.background!=='rgba(0, 0, 0, 0)');
   for(const field of opaque){
    if(theme==='dark')assert.equal(field.background,'rgba(255, 255, 255, 0.07)',route+' '+theme+' '+field.tag);
    else assert.ok(['rgb(255, 255, 255)','rgba(24, 25, 27, 0.06)'].includes(field.background),route+' '+theme+' '+field.tag+' '+field.background);
   }
   if(route==='framer'&&theme==='dark'){
    const select=page.locator('#fr-position');await select.hover();
    assert.equal(await select.evaluate(node=>getComputedStyle(node.parentElement).backgroundColor),'rgba(255, 255, 255, 0.11)');
    await page.mouse.move(500,100);await select.focus();assert.equal(await select.evaluate(node=>getComputedStyle(node.parentElement).backgroundColor),'rgba(255, 255, 255, 0.07)');
    await page.mouse.move(500,100);await select.evaluate(node=>node.blur());
   }
   await page.waitForTimeout(500);
   await page.screenshot({path:path.join(output,route+'-'+theme+'.png')});
   samples.push({route,theme,visibleFields:state.fields.length,layeredFields:opaque.length,...Object.fromEntries(Object.entries(state).filter(([key])=>key!=='fields'))});
  }
 }
 await page.goto(origin+'/');await page.locator('#theme').waitFor();
 const labRail=[];
 for(const theme of ['light','dark']){
  await page.locator('#theme').selectOption(theme);
  const background=await page.locator('#theme').evaluate(node=>getComputedStyle(node).backgroundColor);
  assert.equal(background,theme==='dark'?'rgba(255, 255, 255, 0.07)':'rgb(255, 255, 255)');
  labRail.push({theme,background});
 }
 assert.ok(samples.filter(x=>x.theme==='dark').reduce((sum,x)=>sum+x.layeredFields,0)>=100);
 assert.deepEqual(errors,[]);
 const result={scope:'8 reference apps × Light/Dark at 1440 M100; computed control roles, 100+ visible fields, Framer hover/focus, Lab rail; excludes native popup and OS/AT',samples,labRail,errors};
 await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');
 return result;
}
if(process.argv[1]===import.meta.filename){
 const output=path.join(import.meta.dirname,'.diagnostics-control-surfaces');
 const server=await createPilotServer({port:0});
 const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
 const page=await browser.newPage();
 try{const result=await verifyControlSurfaces(page,'http://127.0.0.1:'+server.address().port,output);console.log(JSON.stringify({cases:result.samples.length,fields:result.samples.filter(x=>x.theme==='dark').reduce((n,x)=>n+x.layeredFields,0),errors:result.errors,output}));}
 finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
