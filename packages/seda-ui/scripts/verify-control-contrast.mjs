import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {paintColor,textContrast} from './verify-colors.mjs';

export async function readControlParts(page,selectors) { return page.evaluate(selectors=>{
  const chain=el=>{const colors=[];for(let p=el;p;p=p.parentElement)colors.push(getComputedStyle(p).backgroundColor);return colors;};
  return Object.entries(selectors).map(([id,selector])=>{const input=document.querySelector(selector);if(!input)throw Error('Missing control '+selector);const el=input.closest('.seda-field__control')||input,s=getComputedStyle(el),after=getComputedStyle(input,'::after'),glyph=el.querySelector('.seda-icon');return{id,disabled:input.disabled,checked:!!input.checked,indeterminate:!!input.indeterminate,border:s.borderTopColor,borderWidth:parseFloat(s.borderTopWidth),background:s.backgroundColor,backgroundClip:s.backgroundClip,outer:chain(el.parentElement),layers:chain(el),focus:{width:parseFloat(s.outlineWidth),style:s.outlineStyle,color:s.outlineColor},marker:{rawShown:after.content!=='none'&&after.content!=='normal'&&parseFloat(after.width)>0&&parseFloat(after.height)>0,shown:(input.getAttribute('role')==='switch'||input.checked||input.indeterminate)&&after.content!=='none'&&after.content!=='normal'&&parseFloat(after.width)>0&&parseFloat(after.height)>0,background:after.backgroundColor},glyph:glyph?{color:getComputedStyle(glyph).backgroundColor,layers:chain(glyph.parentElement)}:null};});
 },selectors); }

export async function verifyControlContrast({cwd,browser,enforce=true,peerReactDirectory}) {
 await fs.writeFile(path.join(cwd,'control-contrast-entry.mjs'),`
  import React from 'react';import {createRoot} from 'react-dom/client';import {SedaProvider,TextField,TextArea,Select,Checkbox,Radio,Toggle,Icon,IconButton} from '@seda-ai/ui';import '@seda-ai/ui/styles.css';
  const h=React.createElement,root=createRoot(document.getElementById('root'));
  window.configure=({theme='light',size='m',state='default',checked=false}={})=>{
   const disabled=state.startsWith('disabled'),errorText=state.startsWith('error')?'Review value':undefined;
   root.render(h(SedaProvider,{theme,controlSize:size,style:{background:'var(--surface-base)',padding:24}},h('main',{style:{display:'grid',gap:24,width:420}},
    h(TextField,{id:'field',label:'Name',placeholder:'Project name',prefix:h(Icon,{name:'search'}),disabled,errorText}),
    h(TextArea,{id:'area',label:'Notes',placeholder:'Notes',disabled,errorText}),
    h(Select,{id:'select',label:'Team',defaultValue:'',placeholder:'Choose team',options:[{value:'core',label:'Core'}],disabled,errorText}),
    h(Checkbox,{id:'check',label:'Include subfolders',checked,indeterminate:state.includes('mixed'),disabled,errorText,onCheckedChange:()=>{}}),
    h(Radio,{name:'scope',label:'Scope',options:[{value:'private',label:'Private'}],value:checked?'private':'',disabled,errorText,onValueChange:()=>{}}),
    h(Toggle,{id:'toggle',label:'Notifications',checked,disabled,onCheckedChange:()=>{}}),
    h(IconButton,{id:'icon','aria-label':'Information',icon:h(Icon,{name:'info'}),disabled})
   )));
  };window.configure();
 `);
 await build({absWorkingDir:cwd,entryPoints:['control-contrast-entry.mjs'],outdir:path.join(cwd,'control-contrast-web'),bundle:true,format:'esm',...(peerReactDirectory?{alias:{react:peerReactDirectory}}:{})});
 const js=await fs.readFile(path.join(cwd,'control-contrast-web/control-contrast-entry.js')),css=await fs.readFile(path.join(cwd,'control-contrast-web/control-contrast-entry.css'));
 const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const page=await browser.newPage({viewport:{width:780,height:1100}}),errors=[],samples=[],disabledPaints=new Map();
 page.on('pageerror',e=>errors.push(e.message));
 const settle=()=>page.evaluate(async()=>{await Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
 const measure=()=>readControlParts(page,{field:'#field',area:'#area',select:'#select',check:'#check',toggle:'#toggle',icon:'#icon',radio:'input[type=radio]'});
 try {
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.configure);await page.waitForSelector('#field');
  for(const theme of ['light','dark'])for(const state of ['default','error','mixed','error-mixed','disabled','disabled-mixed'])for(const checked of [false,true])for(const interaction of ['rest','hover','focus']){
   await page.mouse.move(779,1099);await page.evaluate(()=>document.activeElement?.blur());await page.evaluate(config=>window.configure(config),{theme,state,checked});await settle();
   const parts=[];
   for(const id of ['field','area','select','check','toggle','icon','radio']){
    const locator=id==='radio'?page.locator('input[type=radio]'):page.locator('#'+id);
    if(interaction!=='rest'){if(interaction==='focus')await page.keyboard.press('Tab');await locator[interaction]();await settle();}
    const actual=(await measure()).find(part=>part.id===id);
    assert.ok(actual,id);if(state.startsWith('disabled')){assert.equal(actual.disabled,true,id+' native disabled');const key=theme+'/'+id+'/'+interaction,paint=JSON.stringify([actual.background,actual.border]);if(disabledPaints.has(key))assert.equal(paint,disabledPaints.get(key),'Disabled paint must override selected/mixed state');else disabledPaints.set(key,paint);}if(actual.disabled)continue;if(enforce&&id==='radio'&&!actual.checked)assert.equal(actual.marker.rawShown,false,'Unchecked Radio must not inherit the Checkbox indeterminate bar');
    const borderPaint=paintColor(actual.border,actual.backgroundClip==='padding-box'?actual.outer:actual.layers);
    const borderRatio=actual.borderWidth?textContrast(borderPaint,actual.outer):0,fillRatio=textContrast(actual.background,actual.outer);
    const boundary=Math.max(borderRatio,fillRatio),checks=[];
    // Captions/glyphs identify icon buttons; their hit-area border is not essential.
    if(id!=='icon')checks.push({part:'boundary',ratio:boundary});
    if(actual.marker.shown)checks.push({part:'marker',ratio:textContrast(actual.marker.background,actual.layers)});
    if(actual.glyph)checks.push({part:'glyph',ratio:textContrast(actual.glyph.color,actual.glyph.layers)});
    if(interaction==='focus')checks.push({part:'focus',ratio:actual.focus.width&&actual.focus.style!=='none'?textContrast(actual.focus.color,actual.outer):0});
    parts.push({id,checks,actual});
   }
   if(state==='default'&&!checked&&interaction==='rest')await page.screenshot({path:path.join(cwd,`control-contrast-${theme}.png`)});
   const failures=parts.flatMap(part=>part.checks.filter(check=>check.ratio<3).map(check=>({id:part.id,...check})));samples.push({theme,state,checked,interaction,parts,failures});
   if(enforce)assert.deepEqual(failures,[],JSON.stringify({theme,state,checked,interaction,failures}));
  }
  const geometry=[];
  for(const size of ['s','m','l','xl'])for(const checked of [false,true]){
   await page.evaluate(config=>window.configure(config),{theme:'light',size,checked});await settle();
   const actual=await page.locator('#toggle').evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el),p=getComputedStyle(el,'::after'),matrix=new DOMMatrixReadOnly(p.transform==='none'?undefined:p.transform),width=parseFloat(p.width),height=parseFloat(p.height);return{width:r.width,height:r.height,thumbWidth:width,thumbHeight:height,thumbX:parseFloat(s.borderLeftWidth)+parseFloat(p.left)+matrix.m41,thumbY:parseFloat(s.borderTopWidth)+parseFloat(p.top)+matrix.m42};});
   assert.ok(Math.abs(actual.thumbY+actual.thumbHeight/2-actual.height/2)<=1,'Toggle thumb remains vertically centred after border');
   assert.ok(Math.abs(actual.thumbX-(checked?actual.width-actual.thumbWidth-2:2))<=1,'Toggle thumb keeps actual outer inset');geometry.push({size,checked,...actual});
  }
  await page.emulateMedia({forcedColors:'active'});await page.evaluate(()=>window.configure({theme:'light',checked:true}));await settle();
  const forced=await measure();for(const part of forced.filter(p=>['check','radio','toggle'].includes(p.id))){if(part.marker.shown)assert.ok(textContrast(part.marker.background,part.layers)>=3,'Forced colors marker '+part.id);}
  await fs.writeFile(path.join(cwd,'control-contrast-results.json'),JSON.stringify({samples,geometry,forced,errors},null,2));assert.deepEqual(errors,[]);return{installedPackage:true,sourceAlias:false,samples,geometry,forced,errors};
 }finally{await page.close();await new Promise(resolve=>server.close(resolve));}
}
