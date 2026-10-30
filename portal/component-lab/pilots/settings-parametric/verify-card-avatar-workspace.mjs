import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
import {deriveTypography} from '../../../../packages/seda-contracts/src/index.mjs';
const cases=[{size:'s',scale:80,x:0,y:0},{size:'s',scale:100,x:0,y:0},{size:'m',scale:100,x:0,y:0},{size:'l',scale:115,x:12,y:6},{size:'xl',scale:150,x:24,y:12}];
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1,JSON.stringify({a,b}));

export async function verifyCardAvatarWorkspace(page,origin,output){
 const errors=[],samples=[];const listener=e=>errors.push(e.message);page.on('pageerror',listener);page.setDefaultTimeout(15000);
 const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const configure=async(theme,c)=>{await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme,size:c.size});for(const[id,value]of Object.entries({scale:c.scale,airX:c.x,air:c.y,radius:100}))await page.locator('#'+id).fill(String(value));await settle();};
 try{
  await page.goto(origin+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
  const metadata=await page.evaluate(()=>fetch('/build-metadata.json').then(r=>r.json()));assert.equal(metadata.installedPackage,true);assert.equal(metadata.sourceAlias,false);
  for(const file of ['/Avatar/Avatar.js','/Avatar/AvatarGroup.js','/Card/Card.js'])assert.ok(metadata.bundledComponents.some(value=>value.endsWith(file)),file);
  for(const section of ['projects','members']){
   await page.locator('#nav-'+section).click();if(section==='projects')await page.locator('[data-view=cards]').click();
   for(const width of [1543,1024,390])for(const theme of ['Light','Dark'])for(const c of cases){
    await page.setViewportSize({width,height:1100});await configure(theme,c);
    const scope=section==='projects'?'#cardsView':'#members-page';
    const m=await page.locator(scope).evaluate(root=>{
     const visible=node=>node.getBoundingClientRect().height>0;
     const avatars=[...root.querySelectorAll('.seda-avatar')].filter(visible).map(node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);return{w:r.width,h:r.height,radius:s.borderRadius,ink:s.color,surface:s.backgroundColor,label:node.getAttribute('aria-label'),hidden:node.getAttribute('aria-hidden')};});
     const cards=[...root.querySelectorAll('.seda-card')].filter(visible).map(node=>{const css=getComputedStyle(node),title=node.querySelector('.seda-card__title'),text=getComputedStyle(title),input=node.querySelector('input[type=checkbox]');return{x:parseFloat(css.paddingInlineStart),y:parseFloat(css.paddingTop),radius:parseFloat(css.borderTopLeftRadius),overflow:node.scrollWidth-node.clientWidth,titleSize:parseFloat(text.fontSize),titleLine:parseFloat(text.lineHeight),selectionGap:title.getBoundingClientRect().left-input.getBoundingClientRect().right,emptySlot:node.querySelector('.seda-choice__content')!==null,role:node.tagName};});
     return{avatars,cards,overflow:document.documentElement.scrollWidth-innerWidth};
    });
    assert.equal(m.overflow,0);assert.ok(m.avatars.length>0);for(const avatar of m.avatars){near(avatar.w,{s:24,m:32,l:40,xl:48}[c.size]);near(avatar.w,avatar.h);assert.equal(avatar.radius,'50%');}
    if(section==='projects'){
     assert.equal(m.cards.length,4);const compiled=await page.evaluate(()=>window.sedaPilot.getCompiled()),derived=await page.evaluate(()=>window.sedaPilot.getLab().derived),text=deriveTypography(compiled.typography.roles,'label/default',c.scale);
     for(const card of m.cards){near(card.x,16+c.x);near(card.y,16+c.y);near(card.radius,derived.radius);near(card.titleSize,text.size);near(card.titleLine,text.lineHeight);near(card.selectionGap,8);assert.equal(card.emptySlot,false);assert.equal(card.overflow,0);assert.equal(card.role,'ARTICLE');}
    }
    samples.push({section,width,theme,...c,...m});
    if(width===1543&&c.size==='m'||width===1024&&c.size==='xl'){
     const target=page.locator(section==='projects'?'#cardsView':'#members-page');await target.screenshot({path:path.join(output,section+'-'+theme.toLowerCase()+'-'+width+'-'+c.size+'.png')});
    }
   }
  }
  await page.setViewportSize({width:1543,height:1100});await configure('Light',cases[2]);await page.locator('#nav-projects').click();
  const cards=page.locator('#cardsView'),first=cards.locator('.seda-card').filter({has:page.getByRole('heading',{name:'Atlas Platform',exact:true})});
  const selected=first.getByRole('checkbox',{name:'Atlas Platform',exact:true});await selected.focus();await selected.press('Space');assert.equal(await selected.isChecked(),true);
  await first.getByRole('button',{name:'Подробнее',exact:true}).click();assert.equal(await selected.isChecked(),true);assert.equal(await page.locator('#project').inputValue(),'Atlas Platform');
  await page.locator('[data-view=table]').click();assert.equal(await page.locator('#projects-table').getByRole('checkbox',{name:'Выбрать Atlas Platform',exact:true}).isChecked(),true);
  await page.locator('#filter').selectOption('draft');await page.locator('[data-view=cards]').click();assert.equal(await cards.locator('.seda-card').count(),1);await page.locator('#filter').selectOption('all');assert.equal(await selected.isChecked(),true);
  const paused=cards.locator('.seda-tag').filter({hasText:'Приостановлен'});
  await page.setViewportSize({width:1024,height:1100});for(const theme of ['Light','Dark']){await configure(theme,cases[4]);await paused.hover();const tooltip=page.getByRole('tooltip').filter({hasText:'Приостановлен'});await tooltip.waitFor();const box=await tooltip.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=1025&&box.y>=0&&box.y+box.height<=1101);await page.screenshot({path:path.join(output,'status-tooltip-'+theme.toLowerCase()+'.png')});await page.mouse.move(10,10);await tooltip.waitFor({state:'hidden'});}await page.setViewportSize({width:1543,height:1100});await configure('Light',cases[2]);
  await page.locator('#create').click();await page.locator('#modalName').fill('🚀 QA проект');await page.locator('#modalName').press('Enter');assert.equal(await cards.getByRole('heading',{name:'🚀 QA проект',exact:true}).count(),1);
  await page.locator('#nav-members').click();await page.locator('#member-search').fill('никого-нет');assert.equal(await page.locator('#members-table tbody tr[data-row-key]').count(),0);
  await page.getByRole('button',{name:'Показать всех участников в таблице, ещё 1',exact:true}).click();await settle();assert.equal(await page.locator('#member-search').inputValue(),'');assert.equal(await page.locator('#members-table tbody tr[data-row-key]').count(),3);assert.equal(await page.locator('#members-table .seda-table__scroll').evaluate(node=>document.activeElement===node),true);
  assert.deepEqual(errors,[]);return{scope:'Installed Card/Avatar in Projects and Team; selected parameters, native semantics, shared table selection and actual overflow navigation; not full Figma/AT approval',samples,sharedSelection:true,independentDetailsAction:true,selectionSurvivesFilter:true,overflowRevealsMembers:true,emptyCheckboxSlotRemoved:true,unicodeProjectIdentity:true,fullStatusTooltip:true,errors};
 }finally{page.off('pageerror',listener);}
}
if(process.argv[1]===import.meta.filename){
 const output=path.join(import.meta.dirname,'.diagnostics-card-avatar-workspace');await fs.mkdir(output,{recursive:true});const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})}),page=await browser.newPage();
 try{const result=await verifyCardAvatarWorkspace(page,'http://127.0.0.1:'+server.address().port,output);await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({samples:result.samples.length,errors:result.errors,output}));}
 catch(error){await page.screenshot({path:path.join(output,'failure.png')});throw error;}
 finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
