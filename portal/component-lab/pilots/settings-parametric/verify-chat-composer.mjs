import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const slots=[['Добавить файлы','imgIcon','1:4249'],['Голосовой ввод не подключён','imgIcon2','1:4272'],['Голосовой разговор не подключён','imgIcon3','1:4278']];
export async function verifyChatComposer(page,origin,output){
 await page.setViewportSize({width:1440,height:1288});await page.goto(origin+'/references/chat.html');
 const input=page.locator('#chat-input');await input.waitFor();await page.evaluate(()=>document.fonts.ready);await input.fill('');
 const assets=[];
 for(const[name,alias,nodeId]of slots){
  const button=page.locator('.chat-composer').getByRole('button',{name,exact:true}),img=button.locator('img');
  await img.evaluate(el=>el.decode());assert.equal(await img.getAttribute('src'),'./assets/chat-composer-'+alias+'.svg');
  const geometry=await img.evaluate(el=>{const r=el.getBoundingClientRect();return{width:r.width,height:r.height,naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight};});
  assert.ok(geometry.naturalWidth>0&&geometry.naturalHeight>0);assert.ok(geometry.width>0&&geometry.height>0);assert.ok(Math.abs(geometry.width/geometry.height-geometry.naturalWidth/geometry.naturalHeight)<.01);
  assets.push({name,alias,nodeId,...geometry});
 }
 assert.equal(await page.locator('.chat-composer').getByRole('button',{name:'Medium',exact:true}).locator('[data-seda-icon=arrow-chevron-down]').count(),1,'One shared menu disclosure replaces the source-only chevron');
 assert.equal(await input.locator('..').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
 const reference=await page.locator('.chat-composer-row').boundingBox();assert.ok(Math.abs(reference.width-768)<=1);assert.ok(Math.abs(reference.height-52)<=1);
 await page.screenshot({path:path.join(output,'chat-composer-dark-1440.png')});
 for(const name of slots.slice(2).map(x=>x[0])){await page.locator('.chat-composer').getByRole('button',{name,exact:true}).click();await page.waitForFunction(()=>document.querySelector('.chat-status').textContent.includes('не подключён'));assert.equal(await page.locator('#chat-stop').count(),0);}
 const samples=[];
 for(const width of [960,1440])for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,100,150]){
  await page.setViewportSize({width,height:1288});await page.getByRole('button',{name:'Параметры SEDA',exact:true}).click();
  await page.locator('#chat-theme').selectOption(theme);await page.locator('#chat-size').selectOption(size);await page.locator('#chat-scale').selectOption(String(scale));
  await page.locator('#chat-x').fill('24');await page.locator('#chat-y').fill('12');await page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();await settle(page);
  const geometry=await page.locator('.chat-composer-row').evaluate(el=>{const r=el.getBoundingClientRect(),input=document.getElementById('chat-input'),ir=input.getBoundingClientRect();return{width:r.width,height:r.height,scroll:el.scrollWidth,client:el.clientWidth,inputWidth:ir.width,inputHeight:ir.height,inputTop:ir.top,inputBottom:ir.bottom,viewport:innerHeight,buttons:[...el.querySelectorAll('button')].map(b=>{const q=b.getBoundingClientRect();return{name:b.getAttribute('aria-label')??b.textContent,left:q.left-r.left,right:q.right-r.left,top:q.top-r.top,bottom:q.bottom-r.top,width:q.width,height:q.height};})};});
  assert.ok(geometry.inputWidth>=32,JSON.stringify({width,theme,size,scale,geometry}));assert.ok(geometry.scroll<=geometry.client+1,'Compound surface overflow');assert.ok(geometry.inputTop>=0&&geometry.inputBottom<=geometry.viewport);
  for(const b of geometry.buttons){assert.ok(b.width>0&&b.height>0);assert.ok(b.left>=-1&&b.right<=geometry.width+1&&b.top>=-1&&b.bottom<=geometry.height+1,JSON.stringify({width,theme,size,scale,b,geometry}));}
  samples.push({width,theme,size,scale,...geometry});
 }
 await input.fill('First line\n'+('Long editable message '.repeat(60)));await settle(page);const grown=await input.boundingBox();await page.screenshot({path:path.join(output,'chat-composer-before-growth-check.png')});assert.ok(grown.height>samples.at(-1).inputHeight,JSON.stringify({grown,last:samples.at(-1),value:await input.inputValue()}));assert.equal(await input.inputValue(),'First line\n'+('Long editable message '.repeat(60)));
 await page.screenshot({path:path.join(output,'chat-composer-extreme-1440.png')});
 return{sourceFrame:'1:3894',sourceComposer:'1:4244',reference,assets,samples,voiceExplicitlyUnavailable:true,multilineRetained:true};
}
if(process.argv[1]===import.meta.filename){
 const output=path.join(import.meta.dirname,'.diagnostics-chat-composer');await fs.mkdir(output,{recursive:true});
 const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{const result=await verifyChatComposer(page,'http://127.0.0.1:'+server.address().port,output);assert.deepEqual(errors,[]);await fs.writeFile(path.join(output,'results.json'),JSON.stringify({...result,errors},null,2)+'\n');console.log(JSON.stringify({samples:result.samples.length,assets:result.assets.length,reference:result.reference,errors,output}));}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
