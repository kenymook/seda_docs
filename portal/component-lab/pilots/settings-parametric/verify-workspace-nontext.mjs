import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
import {readControlParts} from '../../../../packages/seda-ui/scripts/verify-control-contrast.mjs';
import {paintColor,textContrast} from '../../../../packages/seda-ui/scripts/verify-colors.mjs';
const output=path.join(import.meta.dirname,'.diagnostics-nontext-workspace');await fs.mkdir(output,{recursive:true});
const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1702,height:1244}}),samples=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
const settle=()=>page.evaluate(async()=>{await Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
function audit(parts,focus){
 const checks=[];
 for(const part of parts){assert.equal(part.disabled,false);const borderPaint=paintColor(part.border,part.backgroundClip==='padding-box'?part.outer:part.layers);
  if(part.id!=='icon')checks.push({id:part.id,part:'boundary',ratio:Math.max(part.borderWidth?textContrast(borderPaint,part.outer):0,textContrast(part.background,part.outer))});
  if(part.marker.shown)checks.push({id:part.id,part:'marker',ratio:textContrast(part.marker.background,part.layers)});
  if(part.glyph)checks.push({id:part.id,part:'glyph',ratio:textContrast(part.glyph.color,part.glyph.layers)});
  if(part.id.startsWith('radio')&&!part.checked)assert.equal(part.marker.rawShown,false,'No Checkbox bar in unchecked Radio');
  if(focus)checks.push({id:part.id,part:'focus',ratio:part.focus.width&&part.focus.style!=='none'?textContrast(part.focus.color,part.outer):0});
 }
 for(const check of checks)assert.ok(check.ratio>=3,JSON.stringify(check));return checks;
}
try {
 await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);await page.locator('#nav-components').click();
 for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,100,150]){
  await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme,size});await page.locator('#scale').fill(String(scale));await page.locator('#air').fill('4');await page.locator('#airX').fill('8');await settle();
  for(const state of ['default','error'])for(const toggleChecked of [false,true]){
   if(await page.locator('#visual-toggle-default').isChecked()!==toggleChecked)await page.locator('#visual-toggle-default').click();
   await page.evaluate(()=>document.activeElement?.blur());await page.mouse.move(1,1);await settle();
   const selectors={field:'#visual-field-'+state,select:'#visual-select-'+state,check:'#visual-check-'+state,toggle:'#visual-toggle-'+state,icon:'#visual-icon-'+state,radio:'#visual-radio-'+state+' input[value=weekly]',radioEmpty:'#visual-radio-'+state+' input[value=monthly]'};
   const checks=audit(await readControlParts(page,selectors),false);
   for(const id of ['check','radio','toggle']){await page.locator(selectors[id]).hover();await settle();checks.push(...audit(await readControlParts(page,{[id]:selectors[id]}),false));}
   for(const id of ['field','select','check','radio','toggle','icon']){await page.keyboard.press('Tab');await page.locator(selectors[id]).focus();await settle();checks.push(...audit(await readControlParts(page,{[id]:selectors[id]}),true));}
   const geometry=await page.locator(selectors.toggle).evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el),p=getComputedStyle(el,'::after'),m=new DOMMatrixReadOnly(p.transform==='none'?undefined:p.transform),w=parseFloat(p.width),h=parseFloat(p.height),x=parseFloat(s.borderLeftWidth)+parseFloat(p.left)+m.m41,y=parseFloat(s.borderTopWidth)+parseFloat(p.top)+m.m42;return{dy:Math.abs(y+h/2-r.height/2),inset:el.checked?r.width-x-w:x};});
   assert.ok(geometry.dy<=1&&Math.abs(geometry.inset-2)<=1,JSON.stringify(geometry));samples.push({theme,size,scale,state,toggleChecked,minimum:Math.min(...checks.map(c=>c.ratio)),checks,geometry});
  }
 }
 const disabledSelector={check:'#visual-check-disabled'},before=(await readControlParts(page,disabledSelector))[0];
 await page.locator(disabledSelector.check).evaluate(el=>{el.checked=false;el.indeterminate=true;});await settle();const after=(await readControlParts(page,disabledSelector))[0];
 assert.equal(after.disabled,true);assert.equal(after.background,before.background,'Native disabled-mixed fixture must keep disabled background');assert.equal(after.border,before.border);await page.locator(disabledSelector.check).evaluate(el=>{el.checked=true;el.indeterminate=false;});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({scope:'Lab boundary/marker/glyph/focus and Toggle geometry across compiler parameters; computed colors, not AT certification',samples:samples.length,disabledMixedFixture:true,failed:0,output}));
}finally{await browser.close();await new Promise(r=>server.close(r));await fs.writeFile(path.join(output,'results.json'),JSON.stringify({samples,errors},null,2));}
