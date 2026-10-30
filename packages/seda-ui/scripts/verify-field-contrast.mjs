import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {textContrast} from './verify-colors.mjs';
export async function verifyFieldContrast({cwd,browser}) {
  await fs.writeFile(path.join(cwd,'field-contrast-entry.mjs'),`
    import React from 'react';import {createRoot} from 'react-dom/client';import {SedaProvider,TextField,TextArea,Select} from '@seda-ai/ui';import '@seda-ai/ui/styles.css';
    const h=React.createElement,root=createRoot(document.getElementById('root'));
    window.configure=({theme='light',size='m',state='default'}={})=>{const disabled=state==='disabled',errorText=state==='error'?'Check this value':undefined;
      root.render(h(SedaProvider,{theme,controlSize:size},h('main',{style:{padding:24,display:'grid',gap:24,width:420}},
        h(TextField,{id:'field',label:'Project',placeholder:'Enter project name',disabled,errorText,readOnly:state==='read-only'}),
        h(TextArea,{id:'area',label:'Notes',placeholder:'Enter notes',disabled,errorText,readOnly:state==='read-only'}),
        h(Select,{id:'select',label:'Role',defaultValue:'',placeholder:'Choose role',required:true,disabled,errorText,options:[{value:'r',label:'Editor'}]}),
        h(Select,{id:'meaningful-empty',label:'Filter',defaultValue:'',options:[{value:'',label:'All roles'},{value:'r',label:'Editor'}]})
      )));
    };window.configure();
  `);
  await build({absWorkingDir:cwd,entryPoints:['field-contrast-entry.mjs'],outdir:path.join(cwd,'field-contrast-web'),bundle:true,format:'esm'});
  const js=await fs.readFile(path.join(cwd,'field-contrast-web/field-contrast-entry.js')),css=await fs.readFile(path.join(cwd,'field-contrast-web/field-contrast-entry.css'));
  const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const page=await browser.newPage({viewport:{width:780,height:900}}),errors=[],samples=[];page.on('pageerror',e=>errors.push(e.message));
  const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const measure=()=>page.evaluate(()=>['field','area','select'].map(id=>{const el=document.getElementById(id),backgrounds=[];for(let p=el;p;p=p.parentElement)backgrounds.push(getComputedStyle(p).backgroundColor);return{id,color:getComputedStyle(el,id==='select'?null:'::placeholder').color,backgrounds};}));
  try {
    await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.configure);
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const state of ['default','error']){
      await page.evaluate(config=>window.configure(config),{theme,size,state});await settle();
      const paints=await measure();for(const paint of paints){paint.ratio=textContrast(paint.color,paint.backgrounds);assert.ok(paint.ratio>=4.5,JSON.stringify({theme,size,state,...paint}));}samples.push({theme,size,state,paints});
    }
    const interactions=[];
    for(const theme of ['light','dark'])for(const state of ['default','error','read-only']){
      await page.evaluate(config=>window.configure(config),{theme,state});await settle();
      for(const id of state==='read-only'?['field','area']:['field','area','select'])for(const interaction of ['hover','focus']){
        await page.locator('#'+id)[interaction]();await page.evaluate(async()=>{await Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})));});await settle();
        const paint=(await measure()).find(paint=>paint.id===id);paint.ratio=textContrast(paint.color,paint.backgrounds);assert.ok(paint.ratio>=4.5,JSON.stringify({theme,state,id,interaction,...paint}));interactions.push({theme,state,id,interaction,...paint});
      }
    }
    await page.evaluate(()=>window.configure({theme:'light'}));await settle();assert.notEqual(await page.locator('#select').evaluate(el=>getComputedStyle(el).color),await page.locator('#meaningful-empty').evaluate(el=>getComputedStyle(el).color),'A real empty-valued option is not a placeholder');
    await page.locator('#select').selectOption('r');await settle();assert.equal(await page.locator('#select').evaluate(el=>getComputedStyle(el).color),await page.locator('#meaningful-empty').evaluate(el=>getComputedStyle(el).color),'Native uncontrolled selection updates closed-trigger color');
    await page.evaluate(()=>window.configure({theme:'dark',state:'disabled'}));await settle();for(const id of ['field','area','select'])assert.equal(await page.locator('#'+id).isDisabled(),true);
    await page.reload();await page.waitForFunction(()=>window.configure);await settle();await page.screenshot({path:path.join(cwd,'field-contrast-light.png')});
    assert.deepEqual(errors,[]);return{installedPackage:true,sourceAlias:false,samples,interactions,meaningfulEmptyPreserved:true,nativeSelectionUpdatesColor:true,disabledSemantic:true,errors};
  }finally{await page.close();await new Promise(resolve=>server.close(resolve));}
}
