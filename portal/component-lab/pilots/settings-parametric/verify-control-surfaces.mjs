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
      .map(node=>({tag:node.tagName,background:getComputedStyle(node).backgroundColor,border:getComputedStyle(node).borderTopColor,focused:node.matches(':focus-within')}));
    const searchFields=[...document.querySelectorAll('.seda-search__query .seda-field__control')]
      .filter(node=>node.getBoundingClientRect().width>0)
      .map(node=>{const probe=document.createElement('span');probe.style.border='1px solid var(--search-input-border-default)';node.append(probe);const expected=getComputedStyle(probe).borderTopColor;probe.remove();return{actual:getComputedStyle(node).borderTopColor,expected};});
    const swatch=document.createElement('span');root.append(swatch);swatch.style.background='var(--surface-overlay)';const overlay=getComputedStyle(swatch).backgroundColor;swatch.remove();
    const pickers=[...document.querySelectorAll('.seda-field__select:not([multiple])')].filter(node=>node.getBoundingClientRect().width>0).map(node=>({scheme:getComputedStyle(node).colorScheme,background:getComputedStyle(node,'::picker(select)').backgroundColor}));
    return{control:s.getPropertyValue('--surface-control').trim(),hover:s.getPropertyValue('--surface-control-hover').trim(),select:s.getPropertyValue('--select-surface-default').trim(),textField:s.getPropertyValue('--text-field-surface-default').trim(),textArea:s.getPropertyValue('--text-area-surface-default').trim(),fieldBorder:s.getPropertyValue('--border-field-default').trim(),fieldHoverBorder:s.getPropertyValue('--border-field-hover').trim(),choiceBorder:s.getPropertyValue('--border-control-default').trim(),choiceHoverBorder:s.getPropertyValue('--border-control-hover').trim(),componentBorders:['--text-field-border-default','--select-border-default','--text-area-border-default'].map(name=>s.getPropertyValue(name).trim()),panel:s.getPropertyValue('--container-neutral-default').trim(),overlay,supportsPicker:CSS.supports('appearance','base-select')&&CSS.supports('selector(::picker(select))'),pickers,fields,searchFields};
   });
   const expected=theme==='dark'?'#ffffff12':'#ffffff';
   assert.equal(state.control,expected);assert.equal(state.select,expected);
   assert.equal(state.textField,expected);assert.equal(state.textArea,expected);
   assert.equal(state.hover,theme==='dark'?'#ffffff1c':'#f8f8f9');
   assert.equal(state.fieldBorder,theme==='dark'?'#ffffff4d':state.choiceBorder);
   assert.equal(state.fieldHoverBorder,theme==='dark'?'#ffffff59':state.choiceHoverBorder);
   assert.ok(state.componentBorders.every(border=>border===state.fieldBorder),route+' '+theme+' field border bindings');
   if(route==='recents')assert.ok(state.searchFields.length>0,'Files contains a visible Search field');
   for(const searchField of state.searchFields)assert.equal(searchField.actual,searchField.expected,route+' '+theme+' Search border follows its component token');
   const opaque=state.fields.filter(item=>item.background!=='rgba(0, 0, 0, 0)');
   for(const field of opaque){
    if(theme==='dark')assert.equal(field.background,'rgba(255, 255, 255, 0.07)',route+' '+theme+' '+field.tag);
    else assert.ok(['rgb(255, 255, 255)','rgba(24, 25, 27, 0.06)'].includes(field.background),route+' '+theme+' '+field.tag+' '+field.background);
   }
   for(const picker of state.pickers){
    assert.equal(picker.scheme,theme,route+' native Select theme');
    if(state.supportsPicker){assert.equal(picker.background,state.overlay,route+' picker must use solid overlay');assert.match(picker.background,/^rgb\(/);}
   }
   if(route==='framer'&&theme==='dark'){
    const select=page.locator('#fr-position');
    const actualBorder=()=>select.evaluate(node=>getComputedStyle(node.parentElement).borderTopColor);
    const expectedBorder=await page.evaluate(()=>{const swatch=document.createElement('span');document.querySelector('.seda-provider').append(swatch);swatch.style.background='var(--select-border-default)';const value=getComputedStyle(swatch).backgroundColor;swatch.remove();return value;});
    await page.mouse.move(500,100);await select.evaluate(node=>node.blur());
    assert.equal(await actualBorder(),expectedBorder,'Framer dark Select uses soft default border');
    await select.hover();
    assert.equal(await select.evaluate(node=>getComputedStyle(node.parentElement).backgroundColor),'rgba(255, 255, 255, 0.11)');
    await page.mouse.move(500,100);await select.focus();assert.equal(await select.evaluate(node=>getComputedStyle(node.parentElement).backgroundColor),'rgba(255, 255, 255, 0.07)');
    await page.mouse.move(500,100);await select.evaluate(node=>node.blur());
   }
   if(route==='framer'&&state.supportsPicker){
    const select=page.locator('#fr-position');await select.click();await page.waitForTimeout(100);
    assert.equal(await select.evaluate(node=>node.matches(':open')),true);
    await page.screenshot({path:path.join(output,'framer-picker-'+theme+'.png')});
    await page.keyboard.press('Escape');assert.equal(await select.evaluate(node=>node.matches(':open')),false);
   }
   await page.waitForTimeout(500);
   await page.screenshot({path:path.join(output,route+'-'+theme+'.png')});
   samples.push({route,theme,visibleFields:state.fields.length,layeredFields:opaque.length,pickers:state.pickers.length,searchFields:state.searchFields.length,...Object.fromEntries(Object.entries(state).filter(([key])=>key!=='fields'&&key!=='pickers'&&key!=='searchFields'))});
  }
 }
 await page.goto(origin+'/');await page.locator('#theme').waitFor();
 const labRail=[];
 for(const theme of ['light','dark']){
  await page.locator('#theme').selectOption(theme);
  const surface=await page.locator('#theme').evaluate(node=>({field:getComputedStyle(node.parentElement).backgroundColor,select:getComputedStyle(node).backgroundColor}));
  assert.equal(surface.field,theme==='dark'?'rgba(255, 255, 255, 0.07)':'rgb(255, 255, 255)');
  assert.equal(surface.select,'rgba(0, 0, 0, 0)','SEDA Select native element stays transparent over its control surface');
  labRail.push({theme,...surface});
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
