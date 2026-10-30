import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'node:http';
import {build} from 'esbuild';

export async function verifyToastHost({cwd,browser}) {
  await fs.writeFile(path.join(cwd,'toast-host-entry.mjs'),`
    import React,{useRef,useState,useEffect,StrictMode} from 'react';import {createRoot} from 'react-dom/client';
    import {ToastProvider,ToastViewport,useToast,SedaProvider,Button} from '@seda-ai/ui';import '@seda-ai/ui/styles.css';
    const h=React.createElement;window.actions=0;
    function App(){const api=useToast(),trigger=useRef(null),[mounted,setMounted]=useState(true);
      useEffect(()=>{window.host=api;window.mountViewport=setMounted;});
      return h('main',null,h(Button,{id:'trigger',ref:trigger,onClick:()=>api.notify({title:'Clicked',duration:null})},'Notify'),
        h('button',{id:'other-focus'},'Other work'),
        h('output',{id:'summary'},api.visible.length+'/'+api.queued),mounted&&h(ToastViewport,{'aria-label':'Events',restoreFocusRef:trigger}));}
    function Other(){const api=useToast();useEffect(()=>{window.other=api;});return h(ToastViewport,{'aria-label':'Other events'});}
    createRoot(document.getElementById('root')).render(h(StrictMode,null,h(SedaProvider,{theme:'dark',controlSize:'m'},
      h(ToastProvider,null,h(App)),h(ToastProvider,null,h(Other)))));
  `);
  await build({absWorkingDir:cwd,entryPoints:['toast-host-entry.mjs'],outdir:path.join(cwd,'toast-host-web'),bundle:true,format:'esm'});
  const js=await fs.readFile(path.join(cwd,'toast-host-web/toast-host-entry.js')),css=await fs.readFile(path.join(cwd,'toast-host-web/toast-host-entry.css'));
  const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const page=await browser.newPage({viewport:{width:780,height:900}}),errors=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const notify=async options=>{await page.mouse.move(779,899);const id=await page.evaluate(options=>window.host.notify(options),options);await settle();return id;};
  const clear=async()=>{await page.evaluate(()=>window.host.clear());await settle();};
  const titles=()=>page.locator('.seda-toast__title').allTextContents();
  try {
    await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.host&&window.other);await page.bringToFront();await page.locator('#trigger').focus();
    await notify({title:'First',duration:null});await notify({title:'Second',duration:null});await notify({title:'Third',duration:null});await notify({title:'Queued',duration:1000});
    assert.equal(await page.locator('#summary').textContent(),'3/1');await page.waitForTimeout(1200);assert.deepEqual(await titles(),['First','Second','Third']);
    await page.getByRole('button',{name:'Dismiss notification',exact:true}).first().click();await settle();assert.deepEqual(await titles(),['Second','Third','Queued']);
    await page.waitForTimeout(1200);assert.deepEqual(await titles(),['Second','Third']);checks.push('FIFO: queued time starts only on visible promotion');await clear();

    const id=await notify({title:'Old',dedupeKey:'save',duration:1200});await page.waitForTimeout(700);
    assert.equal(await notify({title:'Updated',dedupeKey:'save',duration:1200}),id);await page.waitForTimeout(700);assert.deepEqual(await titles(),['Updated']);
    await page.waitForTimeout(700);assert.deepEqual(await titles(),[]);checks.push('dedupe resets duration without changing ID; stale timer cannot close update');

    await notify({title:'Paused',duration:1000});const toast=page.locator('.seda-toast');await toast.hover();await toast.getByRole('button').focus();await page.mouse.move(779,899);
    await page.waitForTimeout(1300);assert.equal(await toast.getAttribute('data-lifecycle'),'paused');await page.locator('#trigger').focus();await page.waitForTimeout(1100);assert.deepEqual(await titles(),[]);checks.push('hover and focus pause independently; remaining time resumes');

    await notify({title:'Window pause',duration:1000});await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.waitForTimeout(1200);assert.deepEqual(await titles(),['Window pause']);
    await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(1100);assert.deepEqual(await titles(),[]);checks.push('window inactivity event pauses timer (event fixture, not OS certification)');

    await notify({title:'Unmount pause',duration:1500});await page.waitForTimeout(400);await page.evaluate(()=>window.mountViewport(false));await settle();await page.waitForTimeout(1600);
    await page.evaluate(()=>window.mountViewport(true));await settle();assert.deepEqual(await titles(),['Unmount pause']);await page.waitForTimeout(1200);assert.deepEqual(await titles(),[]);checks.push('viewport unmount preserves remaining time and cleans old timers');

    await page.locator('#other-focus').focus();await notify({title:'Focus test',duration:null});assert.equal(await page.locator('#other-focus').evaluate(el=>el===document.activeElement),true);
    await page.locator('.seda-toast__dismiss').focus();await page.keyboard.press('Escape');await settle();assert.deepEqual(await titles(),[]);assert.equal(await page.locator('#trigger').evaluate(el=>el===document.activeElement),true);checks.push('arrival does not steal focus; Escape closes focused item and restores logical focus');
    await notify({title:'Fallback focus',duration:null});await page.evaluate(()=>{document.getElementById('trigger').disabled=true;});await page.locator('.seda-toast__dismiss').focus();await page.keyboard.press('Escape');await settle();assert.equal(await page.getByRole('region',{name:'Events',exact:true}).evaluate(el=>el===document.activeElement),true);await page.evaluate(()=>{document.getElementById('trigger').disabled=false;});await page.locator('#trigger').focus();checks.push('empty region remains focusable when logical return target is disabled');

    await page.evaluate(()=>window.host.notify({title:'Action',actionLabel:'Review',onAction:()=>window.actions++}));await settle();assert.equal(await page.locator('.seda-toast').getAttribute('data-lifecycle'),'persistent');
    await page.getByRole('button',{name:'Review',exact:true}).click();assert.equal(await page.evaluate(()=>window.actions),1);assert.deepEqual(await titles(),['Action']);
    await notify({title:'Error',intent:'error'});assert.equal(await page.locator('.seda-toast').last().getAttribute('role'),'alert');assert.equal(await page.locator('.seda-toast').last().getAttribute('data-lifecycle'),'persistent');await clear();checks.push('action and error persistent defaults; action invokes real handler');

    const bounded=await page.evaluate(()=>{const ids=[];for(let i=0;i<54;i++)ids.push(window.host.notify({title:'Item '+i,duration:null,dedupeKey:'key'+i}));return ids;});await settle();assert.equal(bounded.filter(Boolean).length,53);assert.equal(bounded[53],null);assert.equal(await page.locator('#summary').textContent(),'3/50');
    assert.equal(await notify({title:'Updated full',dedupeKey:'key0',duration:null}),bounded[0]);assert.equal(await page.locator('#summary').textContent(),'3/50');await clear();checks.push('bounded FIFO rejects newest overflow; dedupe remains usable at capacity');

    const invalid=await page.evaluate(()=>[0,NaN,Infinity,-1,999,2147483648].map(duration=>{try{window.host.notify({title:'Invalid',duration});return false;}catch{return true;}}));assert.ok(invalid.every(Boolean));assert.equal(await page.locator('#summary').textContent(),'0/0');
    await page.evaluate(()=>window.other.notify({title:'Independent',duration:null}));await settle();await clear();assert.deepEqual(await titles(),['Independent']);assert.equal(await page.locator('[dedupekey]').count(),0);checks.push('validation atomic, providers isolated, no internal metadata leaked to DOM');
    await page.screenshot({path:path.join(cwd,'toast-host-dark.png')});assert.deepEqual(errors,[]);
    return{installedPackage:true,sourceAlias:false,strictMode:true,checks,errors};
  }finally {await page.close();await new Promise(resolve=>server.close(resolve));}
}
