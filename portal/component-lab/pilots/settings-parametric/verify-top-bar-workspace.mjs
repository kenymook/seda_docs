import assert from'node:assert/strict';import fs from'node:fs/promises';import path from'node:path';import{chromium}from'playwright';import{createPilotServer}from'./server.mjs';import{configureAppearance}from'./verify-inspector-consistency.mjs';
const routes={recents:'.reference-header',building:'.building-header',chat:'.chat-header'},cases=[{size:'s',scale:80,x:0,y:0},{size:'m',scale:100,x:0,y:0},{size:'l',scale:115,x:12,y:6},{size:'xl',scale:150,x:24,y:12}];
export async function verifyTopBarWorkspace(page,origin,output){
 const samples=[],errors=[],listener=e=>errors.push(e.message);page.on('pageerror',listener);page.setDefaultTimeout(15000);
 try{
  for(const[route,selector]of Object.entries(routes)){
   await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/references/'+route+'.html');await page.locator(selector+'.seda-top-bar').waitFor();await page.evaluate(()=>document.fonts.ready);
   const bindings=await page.evaluate(async route=>{const m=await(await fetch('/build-metadata.json')).json();return{installed:m.references[route].installedPackage,alias:m.references[route].sourceAlias,components:m.references[route].bundledComponents};},route);assert.ok(bindings.installed&&!bindings.alias&&bindings.components.some(s=>s.endsWith('/TopBar/TopBar.js')),'Actual installed TopBar: '+route);
   const authored=route==='building'?await page.locator('.building-document [data-editor-field]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.editorField,text:n.textContent,font:getComputedStyle(n).fontSize,line:getComputedStyle(n).lineHeight}))):null;
   if(route==='chat')await page.locator('#chat-input').fill('Черновик до смены параметров');
   for(const width of [960,1440,1920])for(const theme of ['light','dark'])for(const c of cases){
    await page.setViewportSize({width,height:1000});await configureAppearance(page,route,{theme,...c});
    const m=await page.locator(selector).evaluate(n=>{const r=n.getBoundingClientRect(),s=getComputedStyle(n);return{variant:n.dataset.variant,size:n.dataset.size,gutter:n.dataset.gutter,state:n.dataset.state,paddingX:parseFloat(s.paddingInlineStart),paddingY:parseFloat(s.paddingBlockStart),x:r.x,right:r.right,width:r.width,height:r.height,overflow:document.documentElement.scrollWidth-innerWidth,buttons:[...n.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>0).map(b=>{const a=b.getBoundingClientRect();return{text:b.getAttribute('aria-label')??b.textContent,x:a.x,right:a.right,w:a.width,h:a.height};})};});
    assert.equal(m.size,c.size);assert.equal(m.overflow,0,JSON.stringify({route,width,theme,c,m}));assert.equal(m.paddingX,(route==='recents'?24:16)+c.x);assert.equal(m.paddingY,(route==='chat'?{s:6,m:8,l:10,xl:12}:{s:5.5,m:7.5,l:9.5,xl:11.5})[c.size]+c.y);
    for(const button of m.buttons)assert.ok(button.x>=m.x-1&&button.right<=m.right+1,JSON.stringify({route,width,theme,c,button,m}));
    if(route==='building')assert.deepEqual(await page.locator('.building-document [data-editor-field]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.editorField,text:n.textContent,font:getComputedStyle(n).fontSize,line:getComputedStyle(n).lineHeight}))),authored);
    if(route==='chat')assert.equal(await page.locator('#chat-input').inputValue(),'Черновик до смены параметров');
    samples.push({route,width,theme,...c,...m});if(width===1440&&c.size==='m')await page.screenshot({path:path.join(output,route+'-'+theme+'.png')});
   }
   if(route==='recents'){
    await page.setViewportSize({width:960,height:720});await configureAppearance(page,route,{theme:'light',size:'m',scale:100,x:0,y:0});const main=page.locator('#reference-main');assert.ok(await main.evaluate(n=>n.scrollHeight>n.clientHeight));await main.evaluate(n=>{n.scrollTop=200;});await page.waitForFunction(()=>document.querySelector('.reference-header').dataset.state==='scrolled');const y=await page.locator(selector).evaluate(n=>n.getBoundingClientRect().y);assert.ok(Math.abs(y)<=1,'Only Files owning scroll activates its sticky header');await main.evaluate(n=>{n.scrollTop=0;});await page.waitForFunction(()=>document.querySelector('.reference-header').dataset.state==='default');
   }
  }
  assert.deepEqual(errors,[]);return{scope:'Three real installed TopBar headers;72 selected viewport/theme/density cases; owner actions, authored-document isolation and chat draft preserved; no fresh Figma/AT certification',samples,filesScopedScroll:true,authoredTextUnchanged:true,chatDraftRetained:true,errors};
 }finally{page.off('pageerror',listener);}
}
if(process.argv[1]===import.meta.filename){const output=path.join(import.meta.dirname,'.diagnostics-top-bar-workspace');await fs.mkdir(output,{recursive:true});const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})}),page=await browser.newPage();try{const r=await verifyTopBarWorkspace(page,'http://127.0.0.1:'+server.address().port,output);await fs.writeFile(path.join(output,'results.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({samples:r.samples.length,errors:r.errors,output}));}catch(e){await page.screenshot({path:path.join(output,'failure.png')});throw e;}finally{await browser.close();await new Promise(r=>server.close(r));}}
