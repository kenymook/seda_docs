import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
import {deriveControlGeometry} from '../../../../packages/seda-contracts/src/control-geometry.mjs';
import {createContractEngine} from '../../../../packages/seda-contracts/src/index.mjs';
const profiles=JSON.parse(await fs.readFile('node_modules/@seda-ai/ui/dist/profiles.json','utf8'));
const bundle=await build({stdin:{resolveDir:process.cwd(),loader:'jsx',contents:`
import React,{useState} from 'react';import{createRoot}from'react-dom/client';import{Chip,SedaProvider}from'@seda-ai/ui';
function Demo(){const [selected,setSelected]=useState(true),[expanded,setExpanded]=useState(false),[removed,setRemoved]=useState(false);
return <><SedaProvider theme="light"><div style={{'--chip-surface-selected':'rgb(10, 20, 30)','--chip-surface-hover':'rgb(220, 30, 30)','--chip-border-filled':'rgb(12, 34, 56)','--chip-control-icon-default':'rgb(30, 40, 50)','--chip-control-icon-hover':'rgb(31, 41, 51)','--chip-control-icon-active':'rgb(32, 42, 52)','--chip-control-icon-disabled':'rgb(33, 43, 53)','--chip-control-surface-hover':'rgb(60, 70, 80)','--chip-remove-surface-selectedHover':'rgb(90, 100, 110)'}}>
<Chip label="Selected filter" control="select" selected={selected} onSelectedChange={setSelected}/>
<Chip label="Menu" control="expand" expanded={expanded} controlsId="popup" onOpenChange={setExpanded}/><div id="popup" hidden={!expanded}>Menu content</div>
<Chip label="Disabled menu" control="expand" expanded={false} onOpenChange={()=>{}} disabled/>
{!removed&&<Chip label="Value" control="remove" removeLabel="Remove value" onRemove={()=>setRemoved(true)}/>}
<Chip label="Disabled" control="remove" removeLabel="Remove disabled" onRemove={()=>{throw Error('disabled action')}} disabled/>
<Chip label="Selected removable" control="remove" variant="selected" removeLabel="Remove selected" onRemove={()=>{}}/>
<Chip label="Filled" variant="filled"/>
<div style={{width:140}}><Chip data-case="long" label="A long filter value that needs truncation" control="remove" removeLabel="Remove long filter" onRemove={()=>{}}/></div>
</div></SedaProvider>{['s','m','l','xl'].map(size=>[100,150].map(scale=><SedaProvider key={size+scale} theme="light" controlSize={size} textScale={scale} controlParameters={{scale}}><Chip data-case={size+'-'+scale} label="Example" control="select" selected={false} onSelectedChange={()=>{}}/></SedaProvider>))}<SedaProvider theme="light" controlSize="m" controlParameters={{scale:100,extraPaddingInline:12,extraPaddingBlock:6,radiusScale:1.5}}><Chip data-case="m-custom" label="Example" control="select" selected={false} onSelectedChange={()=>{}}/></SedaProvider><SedaProvider controlSize="m" controlParameters={{scale:100}}><Chip data-case="xl-explicit" size="xl" label="Example" control="select" selected={false} onSelectedChange={()=>{}}/></SedaProvider></>};createRoot(document.getElementById('root')).render(<Demo/>);`},bundle:true,write:false,format:'iife',platform:'browser',alias:{react:path.resolve('node_modules/react'),'react-dom':path.resolve('node_modules/react-dom')}});
const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE}),page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/chip-fixture-only.html');
 await page.setContent('<!doctype html><html><head></head><body><div id="root"></div></body></html>');
 await page.addStyleTag({content:await fs.readFile('node_modules/@seda-ai/ui/dist/styles.css','utf8')});await page.addScriptTag({content:bundle.outputFiles[0].text});
 const selected=page.getByRole('button',{name:'Selected filter'});try{await selected.waitFor({timeout:3000});}catch(error){console.log(JSON.stringify({errors,body:await page.locator('body').innerText()}));throw error;}assert.equal(await selected.getAttribute('aria-pressed'),'true');
 const root=selected.locator('..');await selected.hover();assert.equal(await root.evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(10, 20, 30)');
 await selected.focus();await page.keyboard.press('Space');assert.equal(await selected.getAttribute('aria-pressed'),'false');assert.equal(await root.getAttribute('data-selected'),null);
 const expand=page.getByRole('button',{name:'Menu',exact:true});await expand.focus();await page.keyboard.press('Enter');assert.equal(await expand.getAttribute('aria-expanded'),'true');assert.equal(await page.locator('#popup').isVisible(),true);
 const control=expand.locator('.seda-chip__control-icon');await page.mouse.move(1,1);assert.equal(await control.evaluate(n=>getComputedStyle(n).color),'rgb(30, 40, 50)');
 await expand.hover();assert.equal(await control.evaluate(n=>getComputedStyle(n).color),'rgb(31, 41, 51)');assert.equal(await control.evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(60, 70, 80)');
 await page.mouse.down();assert.equal(await control.evaluate(n=>getComputedStyle(n).color),'rgb(32, 42, 52)');await page.mouse.up();
 assert.equal(await page.getByRole('button',{name:'Disabled menu'}).locator('.seda-chip__control-icon').evaluate(n=>getComputedStyle(n).color),'rgb(33, 43, 53)');
 const selectedRemove=page.getByRole('button',{name:'Remove selected'});await selectedRemove.hover();assert.equal(await selectedRemove.evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(90, 100, 110)');
 await page.getByRole('button',{name:'Remove value'}).click();assert.equal(await page.getByText('Value',{exact:true}).count(),0);
 assert.equal(await page.getByRole('button',{name:'Remove disabled'}).isDisabled(),true);
 const long=page.locator('[data-case="long"]');assert.equal(await long.getAttribute('title'),'A long filter value that needs truncation');
 const longGeometry=await long.evaluate(n=>{const label=n.querySelector('.seda-chip__label'),root=n.getBoundingClientRect(),button=n.querySelector('button').getBoundingClientRect();return {width:root.width,overflow:label.scrollWidth>label.clientWidth,buttonInside:button.left>=root.left&&button.right<=root.right};});
 assert.ok(longGeometry.width<=140&&longGeometry.overflow&&longGeometry.buttonInside,JSON.stringify(longGeometry));
 assert.equal(await page.getByText('Filled',{exact:true}).locator('..').evaluate(n=>getComputedStyle(n).borderColor),'rgb(12, 34, 56)');
 const dimensions={};for(const id of [...['s','m','l','xl'].flatMap(size=>[100,150].map(scale=>size+'-'+scale)),'m-custom'])dimensions[id]=await page.locator('[data-case="'+id+'"]').evaluate(n=>({height:n.getBoundingClientRect().height,width:n.getBoundingClientRect().width,font:parseFloat(getComputedStyle(n).fontSize),radius:parseFloat(getComputedStyle(n).borderRadius)}));
 for(const scale of [100,150])for(const [a,b] of [['s','m'],['m','l'],['l','xl']])assert.ok(dimensions[a+'-'+scale].height<dimensions[b+'-'+scale].height,JSON.stringify(dimensions));
 for(const size of ['s','m','l','xl'])assert.ok(dimensions[size+'-150'].font>dimensions[size+'-100'].font,JSON.stringify(dimensions));
 assert.ok(dimensions['m-custom'].width>dimensions['m-100'].width);assert.ok(dimensions['m-custom'].height>dimensions['m-100'].height);assert.ok(dimensions['m-custom'].radius>dimensions['m-100'].radius);
 const explicit=await page.locator('[data-case="xl-explicit"]').evaluate(n=>({height:n.getBoundingClientRect().height,font:parseFloat(getComputedStyle(n).fontSize)}));assert.equal(explicit.height,dimensions['xl-100'].height);assert.equal(explicit.font,dimensions['xl-100'].font);
 const engine=createContractEngine();
 for(const [id,actual] of Object.entries(dimensions)){
  const [size,scale]=id.split('-'),g=profiles.profiles['light:'+size].geometry;
  const preset={height:g.height.value,font:g.fontSize.value,line:g.lineHeight.value,icon:g.iconSize.value,radius:g.radius.value,border:g.borderWidth.value,buttonPaddingX:g.buttonPaddingInline.value,fieldPaddingX:g.textFieldPaddingInline.value};
  const params=scale==='custom'?{scale:100,extraPaddingInline:12,extraPaddingBlock:6,radiusScale:1.5}:{scale:Number(scale)};
  const expected=deriveControlGeometry(preset,params);
  const compiled=engine.compileControl('Chip',{label:'Example',size,control:'select',selected:false,onSelectedChange:{$handler:'example.change'}},{theme:'Light',controlParameters:params});
  for(const field of ['height','font','radius'])assert.equal(compiled.parametric[field],expected[field],id+' compiler '+field);
  for(const [field,expectedValue] of [['height',expected.height],['font',expected.font],['radius',expected.radius]])assert.ok(Math.abs(actual[field]-expectedValue)<=1,`${id} ${field}: DOM ${actual[field]} vs compiler ${expectedValue}`);
 }
 console.log(JSON.stringify({geometry:dimensions}));
 assert.deepEqual(errors,[]);console.log('PASS: selected hover/token, Space selection, Enter expansion, remove, disabled, filled border override.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
