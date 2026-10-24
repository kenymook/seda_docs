import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function readIcons(locator) {
  return locator.locator('[data-seda-icon]').evaluateAll(icons=>icons.map(icon=>{
    const owner=icon.closest('button,[role=menuitem]'),r=icon.getBoundingClientRect(),b=owner.getBoundingClientRect(),style=getComputedStyle(icon);
    return {name:icon.dataset.sedaIcon,width:r.width,height:r.height,expected:parseFloat(getComputedStyle(owner).getPropertyValue('--seda-control-icon-size')||getComputedStyle(owner).getPropertyValue('--seda-preset-icon-size')),delta:Math.abs(r.top+r.height/2-b.top-b.height/2),color:style.backgroundColor,ownerColor:getComputedStyle(owner).color};
  }));
}
function aligned(rows) {
  assert.ok(rows.length);
  for(const row of rows){assert.equal(row.width,row.expected);assert.equal(row.height,row.expected);assert.ok(row.delta<=1,JSON.stringify(row));}
}
const sceneGeometry=page=>page.locator('[data-scene-node]').evaluateAll(nodes=>nodes.map(node=>({id:node.dataset.sceneNode,transform:node.getAttribute('transform'),graphics:Array.from(node.querySelectorAll('rect,ellipse,path,text')).map(shape=>Object.fromEntries(['x','y','width','height','rx','ry','cx','cy','d','font-size','transform'].map(name=>[name,shape.getAttribute(name)])))})));

export async function verifyApplicationIcons(page,origin,output) {
  const samples=[];
  await page.goto(origin+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
  for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,100,150])for(const spacing of [0,12]){
    await page.evaluate(config=>window.sedaPilot.configure(config),{theme,controlSize:size});
    await page.locator('#scale').fill(String(scale));await page.locator('#air').fill(String(spacing));await page.locator('#airX').fill(String(spacing*2));await settle(page);
    const trigger=page.getByRole('button',{name:'Действия проекта Atlas Platform',exact:true});await trigger.click();
    const menu=page.getByRole('menu'),rows=[...await readIcons(trigger),...await readIcons(menu)];aligned(rows);
    assert.deepEqual(rows.map(row=>row.name),['more','info','copy','trash']);
    const danger=rows.find(row=>row.name==='trash');assert.equal(danger.color,danger.ownerColor,'Danger glyph follows destructive text');
    const bounds=await menu.boundingBox(),viewport=page.viewportSize();assert.ok(bounds.x>=-1&&bounds.x+bounds.width<=viewport.width+1);assert.ok(bounds.y>=-1&&bounds.y+bounds.height<=viewport.height+1);
    samples.push({app:'projects',theme,size,scale,spacing,rows});
    if(size==='m'&&scale===100&&spacing===0)await page.screenshot({path:path.join(output,'menu-'+theme+'.png')});
    await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
  }
  await page.locator('#nav-editor').click();
  const editor=[...await readIcons(page.locator('#editor-undo')),...await readIcons(page.locator('#editor-redo'))];aligned(editor);assert.deepEqual(editor.map(row=>row.name),['undo','redo']);
  await page.goto(origin+'/references/sandbox.html');await page.waitForFunction(()=>document.querySelectorAll('[data-scene-node]').length>100&&document.querySelector('#sandbox-save')&&!document.querySelector('#sandbox-save').disabled);await page.evaluate(()=>document.fonts.ready);
  const geometry=await sceneGeometry(page);assert.ok(geometry.length>100);
  for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,100,150])for(const spacing of [0,12]){
    await page.getByRole('button',{name:'Меню документа',exact:true}).click();
    const settings=page.getByRole('menuitem',{name:'Параметры SEDA',exact:true});assert.equal(await settings.locator('[data-seda-icon=settings]').count(),1);await settings.click();
    await page.locator('#sandbox-theme').selectOption(theme);await page.locator('#sandbox-size').selectOption(size);await page.locator('#sandbox-scale').selectOption(String(scale));
    await page.locator('#sandbox-air-x').fill(String(spacing*2));await page.locator('#sandbox-air-y').fill(String(spacing));
    await page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();await settle(page);
    const rows=await readIcons(page.locator('.sandbox-app'));aligned(rows);
    for(const name of ['add','monitor','circle','undo','redo'])assert.ok(rows.some(row=>row.name===name));
    for(const row of rows)assert.equal(row.color,row.ownerColor,'Glyph inherits owning control foreground');
    assert.deepEqual(await sceneGeometry(page),geometry,'UI appearance never changes authored scene coordinates or font sizes');
    const hand=page.getByRole('button',{name:'Перемещение вида',exact:true});assert.equal(await hand.textContent(),'Hand');assert.equal(await hand.locator('.seda-button__icon').count(),0);
    const scaleSaved=await page.evaluate(()=>JSON.parse(localStorage.getItem('seda.reference.sandbox.preferences.v1')).scale);assert.equal(scaleSaved,scale);
    samples.push({app:'sandbox',theme,size,scale,spacing,rows});
    if(size==='m'&&scale===100&&spacing===0)await page.screenshot({path:path.join(output,'sandbox-'+theme+'.png')});
  }
  await page.reload();await page.waitForSelector('.sandbox-app[data-seda-text-scale="150"]');assert.deepEqual(await sceneGeometry(page),geometry);
  await page.setViewportSize({width:960,height:800});await settle(page);
  const toolbar=page.getByRole('toolbar',{name:'Инструменты холста'}),buttons=toolbar.locator('button:not(:disabled)');
  const overflow=await toolbar.evaluate(el=>el.scrollWidth>el.clientWidth+1),actions=await buttons.count();
  await buttons.first().focus();await settle(page);
  for(let index=0;index<actions;index++){
    const button=buttons.nth(index);assert.equal(await button.evaluate(el=>document.activeElement===el),true);
    const rect=await button.boundingBox(),bounds=await toolbar.boundingBox();assert.ok(rect.x>=bounds.x-1&&rect.x+rect.width<=bounds.x+bounds.width+1,JSON.stringify({index,label:await button.textContent(),rect,bounds}));
    if(index+1<actions){await page.keyboard.press('Tab');await settle(page);}
  }
  assert.equal(await page.evaluate(()=>scrollX),0);assert.deepEqual(await sceneGeometry(page),geometry);
  await page.screenshot({path:path.join(output,'sandbox-960-large.png')});
  return {scope:'Original SEDA glyphs in actual project menus and Sandbox; UI scale independent of authored scene',samples,editor,scaleReload:true,toolbarReachability:{width:960,actions,overflow,allVisibleOnFocus:true}};
}

if(process.argv[1]===import.meta.filename){
  const output=path.join(import.meta.dirname,'.diagnostics-icon-workspace');await fs.mkdir(output,{recursive:true});
  const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
  const page=await browser.newPage({viewport:{width:1702,height:1244}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  try {
    const result=await verifyApplicationIcons(page,'http://127.0.0.1:'+server.address().port,output);assert.deepEqual(errors,[]);
    await fs.writeFile(path.join(output,'results.json'),JSON.stringify({...result,errors},null,2));console.log(JSON.stringify({samples:result.samples.length,scaleReload:result.scaleReload,errors,output}));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
