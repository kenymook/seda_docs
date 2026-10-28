import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Select} from '@seda-ai/ui';
assert.ok(!renderToStaticMarkup(createElement(Select,{label:'Multi',selection:'multi',options:[{value:'a',label:'A'}]})).includes('seda-select__arrow'));
const server=await createPilotServer({port:0});
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const page=await browser.newPage({viewport:{width:1684,height:1244}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const measure=()=>page.locator('.studio-selected-element .seda-field__control').evaluate(e=>{
 const rect=e.getBoundingClientRect(),arrow=e.querySelector('.seda-select__arrow').getBoundingClientRect(),select=e.querySelector('select'),style=getComputedStyle(e.querySelector('.seda-select__arrow'));
 return {cy:Math.abs(arrow.y+arrow.height/2-rect.y-rect.height/2),w:rect.width,h:rect.height,aw:arrow.width,ah:arrow.height,gap:Math.min(arrow.x-rect.x,rect.right-arrow.right),pointer:style.pointerEvents,open:select.matches(':open'),nativeIcon:CSS.supports('appearance','base-select')?getComputedStyle(select,'::picker-icon').display:null};
});
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/tokens.html`);
 await fs.mkdir('.diagnostics-select-arrow',{recursive:true});
 let count=0;
 for(const theme of ['Light','Dark']){
  await page.getByLabel('Theme',{exact:true}).selectOption(theme);
  for(const direction of ['ltr','rtl']){
   await page.locator('.studio-selected-element').evaluate((e,d)=>e.dir=d,direction);
   const before=await measure();assert.ok(before.cy<=0.5);assert.equal(before.pointer,'none');if(before.nativeIcon)assert.equal(before.nativeIcon,'none');
   const select=page.locator('.studio-selected-element select');await select.click();
   const open=await measure();assert.equal(open.open,true);assert.ok(open.cy<=0.5);assert.equal(open.w,before.w);assert.equal(open.h,before.h);assert.equal(open.gap,before.gap);
   await page.screenshot({path:`.diagnostics-select-arrow/${theme}-${direction}-open.png`,fullPage:true});
   await page.keyboard.press('Escape');assert.equal((await measure()).open,false);count++;
  }
  await page.locator('.studio-selected-element').evaluate(e=>e.dir='ltr');
  await page.screenshot({path:`.diagnostics-select-arrow/${theme}-closed.png`,fullPage:true});
 }
 // Token-controlled geometry must scale the slot without changing its center.
 for(const [height,icon] of [[28,14],[32,16],[40,20],[48,24],[72,32]]){
  await page.locator('.studio-selected-element>.seda-provider').evaluate((e,[height,icon])=>{e.style.setProperty('--seda-control-height',height+'px');e.style.setProperty('--seda-control-icon-size',icon+'px');},[height,icon]);
  const rect=await measure();assert.ok(rect.cy<=0.5);assert.equal(rect.aw,icon);assert.equal(rect.ah,icon);count++;
 }
 await page.locator('.studio-selected-element>.seda-provider').evaluate(e=>{e.style.removeProperty('--seda-control-height');e.style.removeProperty('--seda-control-icon-size');});
 assert.deepEqual(errors,[]);console.log(`PASS: ${count} arrow geometry cases; open/closed LTR/RTL Light/Dark, hidden native arrow, pointer passthrough, token-scaled slot, no JS errors.`);
}finally{await browser.close();await new Promise(r=>server.close(r));}
