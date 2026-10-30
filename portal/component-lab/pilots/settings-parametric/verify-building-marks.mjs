import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {chromium,firefox,webkit} from 'playwright';
import {createPilotServer} from './server.mjs';

const engineName=process.env.SEDA_BROWSER_ENGINE||'chromium',engines={chromium,firefox,webkit};if(!Object.hasOwn(engines,engineName))throw Error('Unsupported browser engine: '+engineName);
const root=import.meta.dirname,output=path.join(root,engineName==='chromium'?'.diagnostics-building-marks':'.diagnostics-building-marks-'+engineName);
await fs.mkdir(output,{recursive:true});
await build({absWorkingDir:root,entryPoints:['references/document-marks.ts','references/document-model.ts'],outdir:output,bundle:true,format:'esm',platform:'node',outExtension:{'.js':'.mjs'}});
const marks=await import(pathToFileURL(path.join(output,'document-marks.mjs'))),model=await import(pathToFileURL(path.join(output,'document-model.mjs')));
const results=[];
async function check(name,run){try{const evidence=await run();results.push({name,status:'passed',evidence});console.log('PASS '+name);}catch(error){results.push({name,status:'failed',error:error.stack});console.log('FAIL '+name+': '+error.message);}}

await check('marks-range-toggle-edit-and-structure',()=>{
 let value=marks.toggleMark([],10,'bold',2,8);
 value=marks.toggleMark(value,10,'italic',4,10);
 assert.deepEqual(value,[{kind:'bold',start:2,end:8},{kind:'italic',start:4,end:10}]);
 value=marks.toggleMark(value,10,'bold',4,6);
 assert.deepEqual(value.filter(mark=>mark.kind==='bold'),[{kind:'bold',start:2,end:4},{kind:'bold',start:6,end:8}]);
 assert.deepEqual(marks.remapMarks('abcdefghij','abcXYZdefghij',value).filter(mark=>mark.kind==='italic'),[{kind:'italic',start:7,end:13}]);
 assert.deepEqual(marks.remapMarks('abc','',[{kind:'bold',start:0,end:3}]),[]);
 const block={id:'a',kind:'paragraph',text:'abcdefghij',marks:[{kind:'bold',start:2,end:8}]};
 const split=model.splitBlock([block],'a',5),joined=model.joinPrevious(split.blocks,split.id);
 assert.equal(split.blocks[0].text,'abcde');assert.equal(split.blocks[1].text,'fghij');
 assert.deepEqual(joined.blocks[0].marks,block.marks);
 const base={version:1,pages:model.initialDocument.pages.map(page=>page.id==='description'?{...page,blocks:[block]}:page)};
 assert.deepEqual(model.readDocument(JSON.stringify(base)).pages.find(page=>page.id==='description').blocks[0].marks,block.marks);
 for(const invalid of [[{kind:'bold',start:8,end:2}],[{kind:'bold',start:0,end:11}],[{kind:'bold',start:2,end:5},{kind:'bold',start:4,end:8}]])assert.throws(()=>model.readDocument(JSON.stringify({version:1,pages:base.pages.map(page=>page.id==='description'?{...page,blocks:[{...block,marks:invalid}]}:page)})));
 return{overlap:true,toggleOff:true,editMapping:true,splitJoin:true,invalidRejected:3};
});

const server=await createPilotServer({port:0}),url='http://127.0.0.1:'+server.address().port+'/references/building.html';
const browser=await engines[engineName].launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(8000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
const field=()=>page.locator('#doc-block-block-165'),toolbar=()=>page.getByRole('toolbar',{name:'Форматирование выделенного текста'});
async function select(start,end){await field().evaluate((element,{start,end})=>{element.focus();const point=offset=>{const walk=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);let text=walk.nextNode(),count=0;while(text){const length=text.textContent?.length??0;if(offset<=count+length)return{text,offset:offset-count};count+=length;text=walk.nextNode();}throw Error('Selection outside text');};const a=point(start),b=point(end),range=document.createRange();range.setStart(a.text,a.offset);range.setEnd(b.text,b.offset);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);element.dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));},{start,end});if(end>start)await toolbar().waitFor();}
try{
 await page.goto(url,{waitUntil:'networkidle'});await field().waitFor();
 await check('document-inline-toolbar-format-save-reload',async()=>{
  await select(0,4);
  assert.equal(await toolbar().getByRole('button').count(),3);
  await toolbar().getByRole('button',{name:'Жирный'}).click();
  assert.equal(await field().locator('strong').first().textContent(),(await field().textContent()).slice(0,4));
  await select(2,8);await toolbar().getByRole('button',{name:'Курсив'}).click();
  assert.ok(await field().locator('em').count()>0);
  await page.locator('#doc-save').click();await page.waitForFunction(()=>document.getElementById('doc-dirty').textContent.includes('Без изменений'));
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('seda.reference.building.document.v1')).pages.find(page=>page.id==='description').blocks[0].marks);
  assert.equal(before.length,2);
  await page.reload({waitUntil:'networkidle'});await field().waitFor();
  assert.ok(await field().locator('strong').count()>0);assert.ok(await field().locator('em').count()>0);
  await select(0,4);await page.keyboard.press('Control+b');
  assert.equal(await field().locator('strong').count(),0);
  await page.keyboard.press('Control+b');
  assert.ok(await field().locator('strong').count()>0);
  await select(2,2);await page.keyboard.type('X');
  assert.ok((await field().textContent()).startsWith('SDXDS'));
  assert.match(await field().locator('strong').first().textContent(),/X/);
  return{toolbarActions:3,marksPersisted:true,markedPreview:true};
 });
 await check('document-toolbar-keyboard-and-dense-themes',async()=>{
  await select(0,4);await toolbar().getByRole('button',{name:'Жирный'}).focus();
  await toolbar().getByRole('button',{name:'Жирный'}).press('ArrowRight');
  assert.equal(await toolbar().getByRole('button',{name:'Курсив'}).evaluate(el=>el===document.activeElement),true);
  await toolbar().getByRole('button',{name:'Курсив'}).press('End');
  assert.equal(await toolbar().getByRole('button',{name:'Код'}).evaluate(el=>el===document.activeElement),true);
  const measurements=[];
  for(const theme of ['light','dark']){
   await page.locator('.building-account button').first().click();
   await page.getByRole('menuitem',{name:'Параметры интерфейса'}).click();
   await page.locator('#doc-theme').selectOption(theme);await page.locator('#doc-size').selectOption('xl');await page.locator('#doc-x').fill('24');await page.locator('#doc-y').fill('12');
   await page.getByRole('dialog').getByRole('button',{name:'Закрыть'}).click();
   await select(0,4);
   const m=await toolbar().evaluate(el=>{const r=el.getBoundingClientRect(),root=document.querySelector('.building-document').getBoundingClientRect(),title=document.querySelector('.building-document>h1').getBoundingClientRect(),style=getComputedStyle(el);return{x:r.x,right:r.right,top:r.top,titleBottom:title.bottom,rootLeft:root.left,rootRight:root.right,height:r.height,border:style.borderTopColor,surface:style.backgroundColor,overflow:document.documentElement.scrollWidth-innerWidth};});
   assert.ok(m.x>=m.rootLeft-1&&m.right<=m.rootRight+1);assert.ok(m.top>=m.titleBottom-1);assert.ok(m.height>0);assert.equal(m.overflow,0);measurements.push({theme,...m});
   await page.screenshot({path:path.join(output,'building-inline-'+theme+'-xl.png'),animations:'disabled'});
  }
  return measurements;
 });
 await check('document-marked-text-full-deletion',async()=>{
  const length=(await field().textContent()).length;
  await select(0,length);
  await page.keyboard.press('Backspace');
  assert.equal(await field().textContent(),'');
  assert.equal(await field().locator('strong,em,code').count(),0);
  await page.locator('#doc-save').click();
  await page.waitForFunction(()=>document.getElementById('doc-dirty').textContent.includes('Без изменений'));
  const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('seda.reference.building.document.v1')).pages.find(page=>page.id==='description').blocks[0]);
  assert.equal(restored.text,'');
  assert.ok(!restored.marks?.length);
  return{allMarkedTextDeleted:true,saved:true};
 });
 await check('document-marks-no-browser-errors',()=>{assert.deepEqual(errors,[]);return{errors:0};});
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
await fs.writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length,output}));
if(results.some(r=>r.status==='failed'))process.exitCode=1;
