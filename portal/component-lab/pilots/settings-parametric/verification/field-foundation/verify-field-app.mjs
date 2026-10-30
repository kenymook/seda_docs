import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
import{createContractEngine}from'../.integration-lab2/packages/seda-contracts/src/index.mjs';
import{createWebBindings}from'../.integration-lab2/packages/seda-contracts/src/web.mjs';
const engine=createContractEngine(),near=(a,b,label)=>assert.ok(Math.abs(a-b)<=1,label+': '+a+' != '+b);
export async function verifyFieldApplications(page,origin,output){
 await fs.mkdir(output,{recursive:true});const samples=[],errors=[];const listener=e=>errors.push(e.message);page.on('pageerror',listener);page.setDefaultTimeout(12000);
 const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const read=id=>page.locator('#'+id).evaluate(node=>{const surface=node.closest('.seda-field__control'),root=node.closest('.seda-field--text'),b=surface.getBoundingClientRect(),s=getComputedStyle(surface),icon=surface.querySelector('[data-seda-icon]'),r=icon.getBoundingClientRect();return{id:node.id,disabled:node.disabled,font:parseFloat(s.fontSize),family:s.fontFamily,labelFamily:getComputedStyle(root.querySelector('.seda-field__label')).fontFamily,height:b.height,iconColor:getComputedStyle(icon).color,iconWidth:r.width,iconHeight:r.height,centerDelta:Math.abs(r.y+r.height/2-b.y-b.height/2)};});
 try{
  await page.goto(origin+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
  for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const scale of [100,150]){
   const x=scale===150?24:0,y=scale===150?12:0,compiled=engine.compile(undefined,{overrides:{theme,controlSize:size}}),recipe=createWebBindings(compiled).recipes.projectName,g=compiled.geometry,factor=scale/100;
   const expected={height:Math.max(g.height.value,Math.max(Math.round(g.lineHeight.value*factor),Math.round(g.iconSize.value*factor))+g.height.value-g.lineHeight.value+2*y),font:Math.round(g.fontSize.value*factor),icon:Math.round(g.iconSize.value*factor)};
   const normalized=await page.evaluate(vars=>{const span=document.createElement('span');document.body.append(span);const result={};for(const name of ['default','active','error','disabled']){span.style.color=vars['--seda-icon-'+name];result[name]=getComputedStyle(span).color;}span.style.fontFamily=vars['--seda-font-family'];result.family=getComputedStyle(span).fontFamily;span.remove();return result;},recipe.vars);
   await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme,size});for(const[id,value]of Object.entries({scale,airX:x,air:y,radius:100}))await page.locator('#'+id).fill(String(value));await page.locator('#strict').check();await settle();
   const fields=[];
   async function check(id,state){const actual=await read(id);assert.equal(actual.iconColor,normalized[state],JSON.stringify({theme,size,scale,state,actual}));assert.equal(actual.family,normalized.family,'Actual application uses the same fallback stack');assert.equal(actual.labelFamily,normalized.family);near(actual.height,expected.height,id+' height');near(actual.font,expected.font,id+' font');near(actual.iconWidth,expected.icon,id+' icon');near(actual.iconHeight,expected.icon,id+' icon');assert.ok(actual.centerDelta<=1);fields.push({state,...actual});}
   for(const[section,id]of [['projects','search'],['members','member-search']]){
    await page.locator('#nav-'+section).click();await page.mouse.move(1699,1);await page.evaluate(()=>document.activeElement?.blur());await settle();await check(id,'default');await page.locator('#'+id).focus();await settle();await check(id,'active');
    if(size==='m'&&scale===100)await page.screenshot({path:path.join(output,section+'-'+theme.toLowerCase()+'.png'),fullPage:true});
   }
   await page.locator('#nav-components').click();await page.locator('#visual-field-default').waitFor({state:'visible'});await page.mouse.move(1699,1);await settle();
   for(const state of ['default','error','disabled']){await check('visual-field-'+state,state);if(size==='m')await page.locator('#visual-field-'+state).locator('..').locator('..').screenshot({path:path.join(output,'field-'+theme.toLowerCase()+'-'+scale+'-'+state+'.png')});}
   samples.push({theme,size,scale,x,y,expected,fields});
  }
  assert.deepEqual(errors,[]);const result={scope:'Actual Projects bound search, Members public search and feedback states; both themes, S–XL and 100/150 parameter vectors. Existing compiler token roles are the independent colour/font oracle.',samples,errors};await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');return result;
 }catch(error){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw error;}
 finally{page.off('pageerror',listener);await fs.writeFile(path.join(output,'partial.json'),JSON.stringify({samples,errors},null,2)+'\n');}
}
