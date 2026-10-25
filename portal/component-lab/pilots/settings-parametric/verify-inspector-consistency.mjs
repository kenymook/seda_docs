import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import{chromium}from'playwright';import{createPilotServer}from'./server.mjs';
const routes=['recents','building','chat','sandbox','spline','webflow','framer','workflow'];
const cases=[{size:'s',scale:80,x:0,y:0},{size:'s',scale:100,x:0,y:0},{size:'m',scale:100,x:0,y:0},{size:'l',scale:115,x:12,y:6},{size:'xl',scale:150,x:24,y:12}];
const sections='.sandbox-properties-section,.wf-inspector-section,.wf-selector,.wf-computed,.wf-node-settings,.fr-section,.fr-inspector section,.flow-inspector section,.spline-inspector>section,.spline-inspector>details';
export async function openAppearance(page,route){
 if(route==='recents'||route==='building'){await page.getByRole('button',{name:'Kenymook',exact:true}).click();await page.getByRole('menuitem',{name:'Параметры интерфейса',exact:true}).click();}
 else if(route==='chat'||route==='sandbox')await page.getByRole('button',{name:'Параметры SEDA',exact:true}).click();
 else if(route==='spline'){await page.getByRole('button',{name:'Scene menu',exact:true}).click();await page.getByRole('menuitem',{name:'Appearance and parameters',exact:true}).click();}
 else if(route==='webflow')await page.locator('#wf-appearance').click();else await page.getByRole('button',{name:'SEDA',exact:true}).click();
 await page.getByRole('dialog').waitFor();
}
export async function configureAppearance(page,route,config){
 await openAppearance(page,route);const dialog=page.getByRole('dialog');
 for(const c of await dialog.locator('select').all()){const values=await c.locator('option').evaluateAll(a=>a.map(o=>o.value));
  if(values.includes('light')&&values.includes('dark'))await c.selectOption(config.theme);
  else if(values.includes('s')&&values.includes('xl'))await c.selectOption(config.size);
  else if(values.includes('80')&&values.includes('150'))await c.selectOption(String(config.scale));
  else if(values.includes('0')&&values.includes('24'))await c.selectOption(String(config.x));
  else if(values.includes('0')&&values.includes('6')&&values.includes('12'))await c.selectOption(String(config.y));
 }
 const numbers=dialog.locator('input[type=number]');if(await numbers.count()>=2){await numbers.nth(0).fill(String(config.x));await numbers.nth(1).fill(String(config.y));}
 await page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();await dialog.waitFor({state:'hidden'});await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});await page.mouse.move(500,100);await page.getByRole('tooltip').first().waitFor({state:'hidden'});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}
export async function verifyInspectorConsistency(page,origin,output){
 const catalog=JSON.parse(await fs.readFile(new URL('./references/reference-glyph-metrics.json',import.meta.url),'utf8')),composites=JSON.parse(await fs.readFile(new URL('./references/reference-composite-metrics.json',import.meta.url),'utf8'));const hashes=new Set();
 for(const[file,m]of Object.entries(catalog.glyphs)){const b=await fs.readFile(new URL('./references/assets/'+file,import.meta.url));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),m.sha256,file);hashes.add(file);}
 for(const parts of Object.values(composites.parts))for(const p of parts){const b=await fs.readFile(new URL('./references/assets/'+p.file,import.meta.url));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),p.sha256,p.file);hashes.add(p.file);}
 const samples=[],used=new Set(),errors=[],paintSources=new Map();const listener=e=>errors.push(e.message);page.on('pageerror',listener);page.setDefaultTimeout(15000);
 try{for(const route of routes){
  await page.setViewportSize({width:1440,height:1000});await page.goto(origin+'/references/'+route+'.html');await page.locator('.seda-provider').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  if(route==='spline'){await page.getByRole('button',{name:'Scene menu',exact:true}).click();await page.getByRole('menuitem',{name:'Source context: Object · 1:5441',exact:true}).click();await page.locator('#spline-object-name').waitFor();}
  for(const width of [1440,1024])for(const theme of ['light','dark'])for(const c of cases){
   await page.setViewportSize({width,height:1000});await configureAppearance(page,route,{theme,...c});
   const m=await page.evaluate(sections=>{const rect=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:r.width,h:r.height};};
    const glyphs=[...document.querySelectorAll('[data-reference-glyph]')].map(n=>{const s=getComputedStyle(n);return{file:n.dataset.referenceGlyph,...rect(n),slot:parseFloat(s.getPropertyValue('--seda-control-icon-size')||s.getPropertyValue('--seda-preset-icon-size')),color:getComputedStyle(n.querySelector('.reference-glyph__ink')||n).backgroundColor,foreground:s.color,mask:getComputedStyle(n.querySelector('.reference-glyph__ink')||n).maskImage,filter:s.filter,alphaSlope:n.querySelector('feFuncA')?.getAttribute('slope')};});
    const compounds=[...document.querySelectorAll('[data-reference-composite]')].map(n=>{const s=getComputedStyle(n);return{id:n.dataset.referenceComposite,...rect(n),foreground:s.color,flood:getComputedStyle(n.querySelector('feFlood')).floodColor,slope:Number(n.querySelector('feFuncA').getAttribute('slope')),loaded:[...n.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0)};});
    const panels=[...document.querySelectorAll('[data-workspace-inspector]')].map(n=>({bounds:rect(n),sections:[...n.querySelectorAll(sections)].filter(e=>e.getBoundingClientRect().height>0).map(e=>({class:e.className,padding:getComputedStyle(e).padding})),fields:[...n.querySelectorAll('.seda-field')].filter(e=>e.getBoundingClientRect().height>0).map(e=>({id:e.querySelector('input,textarea,select')?.id,...rect(e)})),grids:[...n.querySelectorAll('.sandbox-property-grid,.spline-axis-grid,.wf-fields')].map(e=>({class:e.className,gap:getComputedStyle(e).gap}))}));
    return{glyphs,compounds,panels,overflow:document.documentElement.scrollWidth-innerWidth};},sections);
   assert.equal(m.overflow,0,route+' root overflow '+JSON.stringify({width,theme,c}));
   for(const g of m.glyphs){const metric=catalog.glyphs[g.file];assert.ok(metric&&metric.extent>0,'Measured nonempty source: '+g.file);assert.ok(Math.abs(g.w-g.slot)<=1&&Math.abs(g.h-g.slot)<=1,JSON.stringify({route,g,c}));assert.equal(g.color,g.foreground);assert.ok(g.mask.includes(g.file));if(metric.peakAlpha<.98)assert.ok(Math.abs(Number(g.alphaSlope)-1/metric.peakAlpha)<.001);used.add(g.file);}
   for(const g of m.compounds){assert.equal(g.foreground,g.flood);assert.ok(g.loaded&&g.w>0&&g.h>0);assert.ok(Math.abs(g.slope-1/composites.glyphs[g.id].peakAlpha)<.001);used.add('composite:'+g.id);}
   for(const p of m.panels){for(const s of p.sections)assert.equal(s.padding,'16px',JSON.stringify({route,s}));for(const grid of p.grids)assert.equal(grid.gap,'8px',JSON.stringify({route,grid}));for(const f of p.fields)assert.ok(f.x>=p.bounds.x-1&&f.right<=p.bounds.right+1,JSON.stringify({route,c,width,f,panel:p.bounds}));}
   if(!['recents','building'].includes(route))assert.ok(m.panels.length,route+' inspector scope');
   samples.push({route,width,theme,...c,glyphs:m.glyphs.length,composites:m.compounds.length,panels:m.panels});
   if(width===1440&&theme==='light'&&c.size==='m'){for(const item of await page.locator('[data-reference-glyph],[data-reference-composite]').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.referenceGlyph||n.dataset.referenceComposite,composite:!!n.dataset.referenceComposite,html:n.outerHTML}))))paintSources.set(item.id,item);}
   if((width===1440&&c.size==='m')||(width===1024&&c.size==='xl'))await page.screenshot({path:path.join(output,route+'-'+theme+'-'+width+'-'+c.size+'.png')});
  }
 console.log(JSON.stringify({inspectorRoute:route,samples:samples.length}));
 }const paint=await verifyGlyphPaint(page,origin,[...paintSources.values()],catalog,composites);assert.deepEqual(errors,[]);return{paint,scope:'Source glyph foreground/alpha/geometry and inspector spacing, five density cases × two widths × two themes × eight apps; not AT or full Figma certification',samples,sourceFilesHashed:hashes.size,usedGlyphs:[...used],errors};}finally{page.off('pageerror',listener);}
}
export async function verifyGlyphPaint(page,origin,sources,catalog,composites){
 const probe=await page.context().newPage(),paint=[];try{await probe.goto(origin+'/build-metadata.json');for(const source of sources){
  await probe.setContent(`<base href="${origin}/references/"><style>html,body{margin:0;background:transparent}.seda-icon,.reference-composite-glyph{display:block;flex:none;width:128px;height:128px;color:#fff;background-color:currentColor;--seda-control-icon-size:128px;mask-position:center;mask-size:contain;mask-repeat:no-repeat}.reference-composite-glyph{background:transparent;overflow:hidden}</style>${source.html}`);
  await probe.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
  if(!source.composite)await probe.evaluate(async file=>{const i=new Image();i.src='./assets/'+file;await i.decode();},source.id);
  const icon=probe.locator('[data-reference-glyph],[data-reference-composite]').first();
  const bytes=await icon.screenshot({omitBackground:true});const raster=await probe.evaluate(async b=>{const i=new Image();i.src='data:image/png;base64,'+b;await i.decode();const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const x=c.getContext('2d');x.drawImage(i,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let peak=0,l=c.width,r=-1,t=c.height,k=-1;for(let y=0;y<c.height;y++)for(let z=0;z<c.width;z++){const a=d[(y*c.width+z)*4+3];peak=Math.max(peak,a);if(a>16){l=Math.min(l,z);r=Math.max(r,z);t=Math.min(t,y);k=Math.max(k,y);}}return{peakAlpha:peak/255,extent:Math.max(r-l+1,k-t+1)/c.width};},bytes.toString('base64'));
  assert.ok(raster.extent>.45&&raster.extent<.9,JSON.stringify({source:source.id,raster}));const metric=source.composite?composites.glyphs[source.id]:catalog.glyphs[source.id];if(metric.peakAlpha)assert.ok(raster.peakAlpha>=.9,JSON.stringify({source:source.id,raster,sourceAlpha:metric.peakAlpha}));paint.push({id:source.id,composite:source.composite,sourceAlpha:metric.peakAlpha,...raster});
 }return paint;}finally{await probe.close();}
}
if(process.argv[1]===import.meta.filename){const output=path.join(import.meta.dirname,'.diagnostics-inspector-consistency');await fs.mkdir(output,{recursive:true});const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})}),context=await browser.newContext(),page=await context.newPage();try{const result=await verifyInspectorConsistency(page,'http://127.0.0.1:'+server.address().port,output);await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({samples:result.samples.length,hashed:result.sourceFilesHashed,used:result.usedGlyphs.length,errors:result.errors,output}));}catch(e){await page.screenshot({path:path.join(output,'failure.png')});throw e;}finally{await browser.close();await new Promise(r=>server.close(r));}}
