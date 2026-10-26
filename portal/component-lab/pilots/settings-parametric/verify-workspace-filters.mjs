import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));

/** Measure real option text with the loaded control font, independently of the layout's width recipe. */
export async function readFilterCapacity(page,selector){
 return page.locator(selector).evaluate(root=>{
  const rect=node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
  const r=rect(root),s=getComputedStyle(root),left=r.x+parseFloat(s.paddingLeft)+parseFloat(s.borderLeftWidth),right=r.right-parseFloat(s.paddingRight)-parseFloat(s.borderRightWidth),available=right-left,ctx=document.createElement('canvas').getContext('2d');
  const fields=[...root.querySelectorAll('.seda-field__control')].map(surface=>{
   const native=surface.querySelector('input,select'),n=getComputedStyle(native),c=getComputedStyle(surface),bounds=rect(surface),texts=native.tagName==='SELECT'?[...native.options].map(option=>option.label):[native.placeholder||''];
   ctx.font=[n.fontStyle,n.fontWeight,n.fontSize,n.fontFamily].join(' ');
   const text=Math.max(...texts.map(value=>ctx.measureText(value).width+Math.max(0,value.length-1)*(parseFloat(n.letterSpacing)||0))),affix=surface.querySelector('.seda-field__affix'),prefix=affix?affix.getBoundingClientRect().width+parseFloat(c.columnGap):0;
   const required=text+prefix+parseFloat(n.paddingInlineStart)+parseFloat(n.paddingInlineEnd)+parseFloat(c.paddingInlineStart)+parseFloat(c.paddingInlineEnd)+parseFloat(c.borderInlineStartWidth)+parseFloat(c.borderInlineEndWidth);
   return{id:native.id,...bounds,font:parseFloat(n.fontSize),line:parseFloat(n.lineHeight),radius:parseFloat(c.borderRadius),paddingX:parseFloat(c.paddingInlineStart),required,textWidth:text,availableText:native.clientWidth-parseFloat(n.paddingInlineStart)-parseFloat(n.paddingInlineEnd),constrainedByContainer:required>available+1,deficit:Math.max(0,Math.min(required,available)-bounds.width),value:native.value};
  });
  return{root:r,left,right,available,columns:s.gridTemplateColumns,fields,overflow:document.documentElement.scrollWidth-innerWidth,derived:window.sedaPilot.getLab().derived};
 });
}

export async function verifyWorkspaceFilters(page,origin,output){
 const samples=[],errors=[],onError=e=>errors.push(e.message);page.on('pageerror',onError);page.setDefaultTimeout(12000);await fs.mkdir(output,{recursive:true});
 try{
  await page.goto(origin+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
  for(const section of ['projects','members']){
   await page.locator('#nav-'+section).click();
   const selector=section==='projects'?'.workspace-filters':'.workspace-members-toolbar';
   for(const theme of ['Dark','Light'])for(const size of ['m','s','l','xl'])for(const p of [{scale:150,x:24,y:12},{scale:100,x:0,y:0},{scale:80,x:0,y:0}])for(const width of [1702,1024,390,1440,2200]){
    await page.setViewportSize({width,height:1244});await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme,size});
    for(const[id,value]of Object.entries({scale:p.scale,airX:p.x,air:p.y}))await page.locator('#'+id).fill(String(value));await settle(page);
    const measured=await readFilterCapacity(page,selector),sample={section,theme,size,...p,width,...measured};samples.push(sample);
    assert.equal(measured.fields.length,section==='projects'?4:2,'Actual filter controls, not an empty fixture');assert.equal(measured.overflow,0,JSON.stringify(sample));
    const columnCount=measured.columns.split(' ').length;assert.ok(columnCount>=1&&columnCount<=(section==='projects'?4:2));
    for(const field of measured.fields){
     assert.ok(field.deficit<=1,JSON.stringify({section,theme,size,...p,width,field,available:measured.available}));
     assert.ok(field.x>=measured.left-1&&field.right<=measured.right+1,JSON.stringify({section,width,field,measured}));
     assert.ok(Math.abs(field.height-measured.derived.height)<=1,'Reflow must retain compiled height: '+field.id);assert.ok(Math.abs(field.font-measured.derived.font)<=1,'Reflow must retain compiled font: '+field.id);
     assert.ok(Math.abs(field.line-measured.derived.line)<=1&&Math.abs(field.radius-measured.derived.radius)<=1&&Math.abs(field.paddingX-measured.derived.fieldPaddingX)<=1,'Reflow must retain line, radius and base+X padding: '+field.id);
     assert.ok(field.availableText>0,'Padding and picker affordance must leave a value area: '+field.id);
    }
    if(size==='m'&&width===1702&&p.scale!==80)await page.locator(selector).screenshot({path:path.join(output,`${section}-${theme.toLowerCase()}-${p.scale}.png`)});
    if(size==='xl'&&width===390&&p.scale===150)await page.locator(selector).screenshot({path:path.join(output,`${section}-${theme.toLowerCase()}-390-xl.png`)});
   }
  }
  // Resize a live filtered view without remounting the field or losing selection/caret.
  await page.locator('#nav-projects').click();await page.setViewportSize({width:1702,height:1244});await page.evaluate(()=>window.sedaPilot.configure({theme:'Dark',controlSize:'m'}));
  for(const[id,value]of Object.entries({scale:150,airX:24,air:12}))await page.locator('#'+id).fill(String(value));await page.locator('#search').fill('Atlas');await page.locator('#search').focus();
  await page.locator('#search').evaluate(node=>{window.__retainedFilter=node;node.setSelectionRange(1,4);});
  for(const width of [1024,2200,390,1702]){await page.setViewportSize({width,height:1244});await settle(page);assert.equal(await page.locator('#search').evaluate(node=>node===window.__retainedFilter&&node===document.activeElement&&node.value==='Atlas'&&node.selectionStart===1&&node.selectionEnd===4),true,'Filter focus, caret and value survive reflow');}
  await page.keyboard.press('Tab');assert.equal(await page.locator('#filter').evaluate(node=>node===document.activeElement),true,'DOM tab order is retained');
  await page.locator('#filter').selectOption('paused');await page.locator('#search').fill('');assert.equal((await page.locator('#count').textContent()).trim(),'1 проект');
  await page.locator('#team-filter').selectOption('Mobile');await page.locator('#project-sort').selectOption('name-desc');await settle(page);
  assert.equal((await page.locator('#count').textContent()).trim(),'1 проект');assert.ok((await page.locator('#projects-table').textContent()).includes('Horizon App'));
  const chosen=await readFilterCapacity(page,'.workspace-filters');for(const field of chosen.fields)assert.ok(field.deficit<=1,JSON.stringify(field));
  await page.locator('#reset-filters').click();assert.equal((await page.locator('#count').textContent()).trim(),'4 проекта');
  assert.deepEqual(errors,[]);return{scope:'Projects and Members filter capacity over actual fonts/options; 2 themes × 4 sizes × 3 parameter vectors × 5 viewports × 2 sections, plus resize/filter workflow. Narrow containers may truncate values; keyboard/OS/AT certification is separate.',samples,workflow:{focusCaretValueRetained:true,tabOrder:true,filtersCoupled:true,reset:true},errors};
 }finally{
  page.off('pageerror',onError);await fs.writeFile(path.join(output,'results.json'),JSON.stringify({scope:'Actual filter capacity; partial samples are retained on failure',samples,errors},null,2)+'\n');
 }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const output=path.join(import.meta.dirname,'.diagnostics-workspace-filters'),server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})}),page=await browser.newPage();
 try{const result=await verifyWorkspaceFilters(page,'http://127.0.0.1:'+server.address().port,output);await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({samples:result.samples.length,constrained:result.samples.reduce((n,s)=>n+s.fields.filter(f=>f.constrainedByContainer).length,0),workflow:result.workflow,errors:result.errors,output}));}
 catch(e){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw e;}finally{await browser.close();await new Promise(r=>server.close(r));}
}
