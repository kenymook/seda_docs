import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
import {configureAppearance} from './verify-inspector-consistency.mjs';

const fields={sandbox:'#sandbox-width',spline:'#spline-position-X',webflow:'#wf-style-gap',framer:'#fr-top'};
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
export async function verifyEditorDock(page,origin,output){
 const samples=[],transitions=[],errors=[];const listener=e=>errors.push(e.message);page.on('pageerror',listener);page.setDefaultTimeout(15000);
 try{
  for(const route of Object.keys(fields))for(const theme of ['light','dark']){
   await page.setViewportSize({width:1702,height:1244});await page.goto(origin+'/references/'+route+'.html'+(route==='spline'?'?context=object':''));
   await page.locator('.editor-dock').waitFor();await page.evaluate(()=>document.fonts.ready);
   if(route==='spline')await page.locator('#spline-position-X').waitFor();
   const dock=page.locator('.editor-dock'),split=dock.locator(':scope > .seda-split-view'),separator=split.locator(':scope > [role=separator]');
   for(const density of [{size:'m',scale:100,x:0,y:0},{size:'xl',scale:150,x:24,y:12}]){
    await configureAppearance(page,route,{theme,...density});
    for(const width of [1702,1024]){
     await page.setViewportSize({width,height:1244});await settle(page);
     const sample=await dock.evaluate(node=>{
      const split=node.firstElementChild,panels=split.querySelectorAll(':scope > .seda-split-view__panel'),rect=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
      return{dock:node.dataset.editorDock,orientation:split.dataset.orientation,host:rect(node),panels:[...panels].map(rect),scroll:split.scrollWidth-split.clientWidth,overconstrained:split.hasAttribute('data-overconstrained'),rootOverflow:document.documentElement.scrollWidth-innerWidth};
     });
     assert.equal(sample.rootOverflow,0,JSON.stringify({route,theme,width,...sample}));assert.ok(sample.scroll<=1,JSON.stringify(sample));assert.equal(sample.overconstrained,false,JSON.stringify(sample));
     const [canvas,inspector]=sample.panels;assert.equal(sample.panels.length,2);
     if(width===1024&&density.size==='xl')assert.equal(sample.dock,'bottom',route+' must give large controls full editor width');
     if(width===1702)assert.equal(sample.dock,'side',route+' should preserve a wide desktop layout');
     if(sample.dock==='bottom'){
      assert.equal(sample.orientation,'vertical');assert.ok(Math.abs(canvas.width-inspector.width)<=1);assert.ok(inspector.y>=canvas.bottom-1);assert.ok(canvas.width>500,JSON.stringify(sample));assert.equal(await separator.getAttribute('aria-orientation'),'horizontal');
     }else{assert.equal(sample.orientation,'horizontal');assert.ok(inspector.x>=canvas.right-1);assert.equal(await separator.getAttribute('aria-orientation'),'vertical');}
     for(const panel of sample.panels){assert.ok(panel.x>=sample.host.x-1&&panel.right<=sample.host.right+1);assert.ok(panel.y>=sample.host.y-1&&panel.bottom<=sample.host.bottom+1);}
     if(route==='framer'){
      sample.canvasViewport=await page.locator('.fr-stage').boundingBox();assert.ok(sample.canvasViewport.height>=350,'Actual canvas keeps its previous350px minimum: '+JSON.stringify(sample.canvasViewport));
      sample.zoom=await page.locator('.fr-canvas-tools select').evaluate(node=>{const style=getComputedStyle(node),ctx=document.createElement('canvas').getContext('2d');ctx.font=style.font;return{label:node.selectedOptions[0].label,text:ctx.measureText(node.selectedOptions[0].label).width,available:node.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)};});
      assert.ok(sample.zoom.available>=sample.zoom.text+1,'Zoom text must fit before its picker icon: '+JSON.stringify(sample.zoom));
     }
     samples.push({route,theme,width,...density,...sample});
     if(density.size==='xl')await page.screenshot({path:path.join(output,route+'-'+theme+'-'+width+'-xl.png')});
    }
   }
   // Keep the same actual input node, draft and caret while its persistent
   // SplitView changes orientation. View changes must not run a document commit.
   await page.setViewportSize({width:1702,height:1244});await settle(page);
   const field=page.locator(fields[route]);await field.scrollIntoViewIfNeeded();assert.equal(await field.isDisabled(),false,route+' editable draft fixture');const original=await field.inputValue();
   await field.fill(route==='sandbox'||route==='spline'?'327.5':'17px');
   await field.evaluate(node=>{window.__dockDraft=node;node.focus();node.setSelectionRange(1,3);});
   const surfaces=await page.evaluate(()=>{window.__dockSurfaces=[...document.querySelectorAll('.fr-frame-host iframe,.wf-frame-host iframe,.spline-stage canvas,.sandbox-svg')];return window.__dockSurfaces.length;});assert.ok(surfaces>0,route+' actual preview surface');
   for(const width of [1024,1702]){
    await page.setViewportSize({width,height:1244});await settle(page);
    const draft=await field.evaluate(node=>({same:window.__dockDraft===node,focused:document.activeElement===node,value:node.value,start:node.selectionStart,end:node.selectionEnd}));
    assert.deepEqual(draft,{same:true,focused:true,value:route==='sandbox'||route==='spline'?'327.5':'17px',start:1,end:3});
    assert.equal(await page.evaluate(()=>{const current=[...document.querySelectorAll('.fr-frame-host iframe,.wf-frame-host iframe,.spline-stage canvas,.sandbox-svg')];return current.length===window.__dockSurfaces.length&&current.every((node,index)=>node===window.__dockSurfaces[index]);}),true,route+' preview surface stays mounted');
   }
   await field.press('Escape');assert.equal(await field.inputValue(),original,route+' draft cancel');
   await separator.focus();await separator.press('Home');await settle(page);
   assert.equal(await dock.getAttribute('data-editor-dock'),'side','A requested inspector width must not change the responsive minimum or interrupt a resize');
   await separator.press('End');await settle(page);assert.equal(await dock.getAttribute('data-editor-dock'),'side');
   await page.setViewportSize({width:1024,height:1244});await settle(page);assert.equal(await dock.getAttribute('data-editor-dock'),'bottom');
   const before=Number(await separator.getAttribute('aria-valuenow'));await separator.focus();await separator.press('ArrowDown');await settle(page);const after=Number(await separator.getAttribute('aria-valuenow'));assert.ok(after>before,'Keyboard resizing the bottom dock must resize the canvas');
   const height=await split.locator(':scope > .seda-split-view__panel').first().evaluate(node=>node.getBoundingClientRect().height);
   await page.setViewportSize({width:1702,height:1244});await settle(page);await page.setViewportSize({width:1024,height:1244});await settle(page);
   const restored=await split.locator(':scope > .seda-split-view__panel').first().evaluate(node=>node.getBoundingClientRect().height);assert.ok(Math.abs(restored-height)<=1,'Vertical size survives reflow independently of widths');
   let bottomWidth=1024,sideWidth=1702;
   while(sideWidth-bottomWidth>1){const width=Math.floor((bottomWidth+sideWidth)/2);await page.setViewportSize({width,height:1244});await settle(page);if(await dock.getAttribute('data-editor-dock')==='bottom')bottomWidth=width;else sideWidth=width;}
   for(const[width,mode]of[[bottomWidth,'bottom'],[sideWidth,'side']]){await page.setViewportSize({width,height:1244});await settle(page);assert.equal(await dock.getAttribute('data-editor-dock'),mode);assert.equal(await split.getAttribute('data-overconstrained'),null,'No one-pixel overconstraint at the actual reflow boundary');}
   transitions.push({route,theme,inputNodePreserved:true,previewSurfacesPreserved:surfaces,draftAndCaretPreserved:true,cancel:true,wideResizeDoesNotReflow:true,keyboardResize:true,height,restored,boundary:{bottomWidth,sideWidth}});
  }
  assert.deepEqual(errors,[]);const result={scope:'Four actual editor compositions, selected dimensions and themes; persistent drafts/caret and independent dock height. No Figma or platform certification.',samples,transitions,errors};await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');return result;
 }catch(error){await page.screenshot({path:path.join(output,'failure.png')});throw error;}finally{page.off('pageerror',listener);}
}
if(process.argv[1]===import.meta.filename){
 const output=path.join(import.meta.dirname,'.diagnostics-editor-dock');await fs.mkdir(output,{recursive:true});const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})}),page=await browser.newPage();
 try{const result=await verifyEditorDock(page,'http://127.0.0.1:'+server.address().port,output);console.log(JSON.stringify({samples:result.samples.length,transitions:result.transitions.length,errors:result.errors,output}));}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
