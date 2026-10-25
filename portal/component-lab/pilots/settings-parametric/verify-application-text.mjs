import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';import {chromium} from 'playwright';import {createPilotServer} from './server.mjs';
import {createContractEngine,deriveTypography} from '../../../../packages/seda-contracts/src/index.mjs';

const routes={
 recents:{prefix:'reference',ready:'.reference-file[data-file-id]',targets:['.reference-header h1','.reference-file-summary h2','.reference-file-summary p','.reference-local-note','.reference-status'],icon:'.reference-file-summary>img:not(.reference-avatar)',model:'seda.reference.recents.files.v1'},
 building:{prefix:'doc',ready:'#doc-page-title',targets:['.building-nav-label','#doc-dirty','#doc-status','.building-sidebar-footer a .seda-text'],icon:'.building-header nav :is(img,[data-reference-glyph],[data-reference-artwork])',model:'seda.reference.building.document.v1'},
 chat:{prefix:'chat',ready:'#chat-input',targets:['.chat-navigation .seda-sidebar__section-title','.chat-activity>h2','.chat-activity h3','.chat-source-label','.chat-composer-note','#chat-save-state','.chat-message p[data-seda-text]','.chat-message h2[data-seda-text]','.chat-message td .seda-text'],icon:'.chat-project>:is(img,[data-reference-glyph],[data-reference-artwork])',model:'seda.reference.chat.model.v1'},
 sandbox:{prefix:'sandbox',ready:'#sandbox-selection-count',targets:['.sandbox-section-heading h2','.sandbox-properties-section h2','#sandbox-selection-count','#sandbox-dirty','#sandbox-status','.sandbox-navigation>header small'],icon:'.sandbox-selection-header [data-seda-icon=more]',model:'seda.reference.sandbox.scene.v1'}
};
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function settings(page,route){
 if(route==='recents'||route==='building'){await page.getByRole('button',{name:'Kenymook',exact:true}).click();await page.getByRole('menuitem',{name:'Параметры интерфейса',exact:true}).click();}
 else await page.getByRole('button',{name:'Параметры SEDA',exact:true}).click();
 await page.getByRole('dialog').waitFor();
}
export {settings as openReferenceAppearance};
const authored=async(page,route)=>route==='building'?page.locator('.building-document>h1,.building-block h2,.building-block .building-editable').evaluateAll(nodes=>nodes.map(node=>({id:node.id,text:node.textContent,font:getComputedStyle(node).fontSize,line:getComputedStyle(node).lineHeight,family:getComputedStyle(node).fontFamily}))):route==='sandbox'?page.locator('[data-scene-node]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.sceneNode,transform:node.getAttribute('transform'),graphics:Array.from(node.querySelectorAll('rect,ellipse,path,text')).map(shape=>Object.fromEntries(['x','y','width','height','rx','ry','cx','cy','d','font-size','transform'].map(name=>[name,shape.getAttribute(name)])))}))):null;

export async function verifyApplicationText(page,origin,output){
 const engine=createContractEngine(),typography=Object.fromEntries(['light','dark'].map(theme=>[theme,engine.compile(engine.bundle.profile,{overrides:{theme:theme==='light'?'Light':'Dark',controlSize:'m'}}).typography.roles]));
 const errors=[],samples=[],reload=[],isolation=[];const error=event=>errors.push(event.message);page.on('pageerror',error);
 page.setDefaultTimeout(12000);
 try{
  for(const[route,config]of Object.entries(routes)){
   const key='seda.reference.'+route+'.preferences.v1';await page.goto(origin+'/references/'+route+'.html');
   await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({theme:'light',size:'m',airX:0,airY:0,view:'grid'})),key);await page.reload();
   await page.locator(config.ready).first().waitFor();await page.evaluate(()=>document.fonts.ready);await settle(page);
   if(route==='chat')await page.waitForFunction(()=>document.getElementById('chat-save-state').textContent.includes('Сохранено'));
   const original=await authored(page,route),data=await page.evaluate(key=>localStorage.getItem(key),config.model);
   await settings(page,route);assert.equal(await page.locator('#'+config.prefix+'-scale').inputValue(),'100','Legacy preference migration: '+route);
   for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,100,150]){
    await page.locator('#'+config.prefix+'-theme').selectOption(theme);await page.locator('#'+config.prefix+'-size').selectOption(size);await page.locator('#'+config.prefix+'-scale').selectOption(String(scale));await settle(page);
    const text=[];
    for(const selector of config.targets){
     const rows=await page.locator(selector).evaluateAll(nodes=>nodes.map(node=>{const s=getComputedStyle(node);return{role:node.dataset.sedaText,size:parseFloat(s.fontSize),line:parseFloat(s.lineHeight),weight:Number(s.fontWeight),spacing:parseFloat(s.letterSpacing)||0};}));
     assert.ok(rows.length,route+' '+selector);
     for(const row of rows){assert.ok(row.role,route+' '+selector+' requires actual SEDA Text');const expected=deriveTypography(typography[theme],row.role,scale);for(const[actual,value]of [[row.size,expected.size],[row.line,expected.lineHeight],[row.weight,expected.weight],[row.spacing,expected.letterSpacing]])assert.ok(Math.abs(actual-value)<.05,JSON.stringify({route,theme,size,scale,selector,row,expected:{size:expected.size,line:expected.lineHeight,weight:expected.weight,spacing:expected.letterSpacing}}));}
     text.push({selector,rows});
    }
    const icons=await page.locator(config.icon).evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return{width:r.width,height:r.height,expected:parseFloat(getComputedStyle(node).getPropertyValue('--seda-control-icon-size'))};}));
    assert.ok(icons.length,route+' standalone chrome icon');for(const icon of icons){assert.ok(Math.abs(icon.width-icon.expected)<=.05);assert.ok(Math.abs(icon.height-icon.expected)<=.05);}
    assert.deepEqual(await authored(page,route),original,'Appearance must not change authored typography or scene: '+route);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);assert.equal(overflow,0,route+' document horizontal overflow');
    samples.push({route,theme,size,scale,text,icons});
    if(size==='xl'&&scale===150){await page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();await settle(page);await page.screenshot({path:path.join(output,route+'-'+theme+'-150.png')});await settings(page,route);}
   }
   // Typography and authored values remain stable when control padding changes.
   for(const[axis,value]of [['x','24'],['y','12']])await page.getByRole('dialog').locator('#'+config.prefix+'-'+(route==='sandbox'?'air-':'')+axis).fill(value);
   await settle(page);assert.deepEqual(await authored(page,route),original);
   await page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();await page.reload();await page.locator(config.ready).first().waitFor();await page.evaluate(()=>document.fonts.ready);
   if(route==='chat')await page.waitForFunction(()=>document.getElementById('chat-save-state').textContent.includes('Сохранено'));
   await settings(page,route);assert.equal(await page.locator('#'+config.prefix+'-scale').inputValue(),'150');
   const persisted=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);assert.equal(persisted.scale,150);assert.equal(persisted.airX,24);assert.equal(persisted.airY,12);
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),config.model),data,'Appearance persistence must not rewrite document/file/chat data');
   assert.deepEqual(await authored(page,route),original);isolation.push({route,authoredUnchanged:true,dataUnchanged:true});reload.push({route,scale:persisted.scale,airX:persisted.airX,airY:persisted.airY});
   await page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();
  }
  assert.deepEqual(errors,[]);const result={samples,reload,isolation,errors};await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2));return result;
 }catch(error){await page.screenshot({path:path.join(output,'failure.png')});throw error;}
 finally{page.off('pageerror',error);}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const output=path.join(import.meta.dirname,'.diagnostics-application-text');await fs.mkdir(output,{recursive:true});
 // Migration and corrupted storage boundaries, independently of browser defaults.
 await build({absWorkingDir:import.meta.dirname,entryPoints:['references/file-model.ts'],outfile:path.join(output,'model.mjs'),bundle:true,platform:'node',format:'esm'});
 const model=await import(pathToFileURL(path.join(output,'model.mjs'))),legacy={theme:'dark',size:'s',airX:0,airY:0,view:'grid'};
 assert.equal(model.readPreferences(JSON.stringify(legacy)).scale,100);assert.equal(model.readPreferences(null).scale,100);
 for(const scale of [80,100,115.5,150])assert.equal(model.readPreferences(JSON.stringify({...legacy,scale})).scale,scale);
 for(const scale of [0,79,151,999,'150',null,NaN,Infinity])assert.throws(()=>model.readPreferences(JSON.stringify({...legacy,scale})));
 const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
 try{const page=await browser.newPage({viewport:{width:1440,height:1288}});const result=await verifyApplicationText(page,'http://127.0.0.1:'+server.address().port,output);console.log(JSON.stringify({samples:result.samples.length,reload:result.reload,isolation:result.isolation,errors:result.errors,output}));}
 finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
