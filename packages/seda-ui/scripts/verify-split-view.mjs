import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {createServer} from "node:http";
import {build} from "esbuild";

export async function verifySplitView({cwd,browser}){
 await fs.writeFile(path.join(cwd,"split-consumer.mjs"),`
import React,{useState,useEffect} from 'react';import {SplitView,SedaProvider,TextField} from '@seda-ai/ui';const h=React.createElement;
export function SplitConsumer(){
 const [config,setConfig]=useState({theme:'light',controlSize:'m',orientation:'horizontal',dir:'ltr',width:900,height:400,controlled:false,reject:false,disabled:false,mounted:true});
 const [value,setValue]=useState(240),[calls,setCalls]=useState([]),[ends,setEnds]=useState([]);
 useEffect(()=>{window.sedaSplit={configure:next=>setConfig(old=>({...old,...next})),setValue};return()=>{delete window.sedaSplit;};},[]);
 return h(SedaProvider,{theme:config.theme,controlSize:config.controlSize,dir:config.dir,style:{width:config.width,height:config.height,transform:config.scale?'scale('+config.scale+')':undefined,transformOrigin:'top left'}},
 config.mounted?h(SplitView,{id:'editor',orientation:config.orientation,primaryLabel:'Навигация',secondaryLabel:'Рабочая область',separatorLabel:'Размер навигации',minSize:config.minSize??160,maxSize:500,secondaryMinSize:160,disabled:config.disabled,
 ...(config.controlled?{primarySize:value}:{}),
 onKeyDownCapture:e=>{if(config.veto)e.preventDefault();},
 onSizeChange:(next,reason)=>{setCalls(old=>[...old,{value:next,reason}]);if(!config.reject)setValue(next);},
 onResizeEnd:(next,reason)=>setEnds(old=>[...old,{value:next,reason}]),
 primary:h(TextField,{id:'split-draft',label:'Название',defaultValue:'Document draft'}),
 secondary:h(SplitView,{id:'nested',primaryLabel:'Canvas',secondaryLabel:'Inspector',separatorLabel:'Размер canvas',minSize:100,secondaryMinSize:100,defaultPrimarySize:300,primary:h('p',null,'Canvas'),secondary:h('input',{id:'nested-draft','aria-label':'Inspector name',defaultValue:'Retained'})})
 }):null,
 h('output',{id:'split-state',hidden:true},JSON.stringify({value,calls,ends})));
}`);
 await fs.writeFile(path.join(cwd,"split-ssr.mjs"),`
import React from 'react';import {renderToString} from 'react-dom/server';import {SplitView} from '@seda-ai/ui';import {SplitConsumer} from './split-consumer.mjs';import assert from 'node:assert/strict';
const base={primary:'A',secondary:'B',primaryLabel:'A',secondaryLabel:'B'};
const invalid=[{primaryLabel:' '},{orientation:'invented'},{minSize:-1},{maxSize:100,minSize:200},{resizeStep:0},{primarySize:100},{primarySize:100,defaultPrimarySize:200,onSizeChange:()=>{}},{secondaryMinSize:NaN},{defaultPrimarySize:Infinity}];
for(const changed of invalid)assert.throws(()=>renderToString(React.createElement(SplitView,{...base,...changed})),TypeError);
const errors=[];console.error=(...a)=>errors.push(a.join(' '));const html=renderToString(React.createElement(React.StrictMode,null,React.createElement(SplitConsumer)));assert.deepEqual(errors,[]);console.log(JSON.stringify({html,invalid:invalid.length}));`);
 const ssr=spawnSync(process.execPath,["split-ssr.mjs"],{cwd,encoding:"utf8",windowsHide:true});assert.equal(ssr.status,0,ssr.stdout+ssr.stderr);assert.equal(ssr.stderr,"");const {html,invalid}=JSON.parse(ssr.stdout);
 await fs.writeFile(path.join(cwd,"split-entry.mjs"),`import React from 'react';import {hydrateRoot} from 'react-dom/client';import {SplitConsumer} from './split-consumer.mjs';import '@seda-ai/ui/styles.css';hydrateRoot(document.getElementById('root'),React.createElement(React.StrictMode,null,React.createElement(SplitConsumer)));`);
 const bundled=await build({absWorkingDir:cwd,entryPoints:["split-entry.mjs"],outdir:path.join(cwd,"split-web"),bundle:true,format:"esm",metafile:true});
 assert.ok(Object.keys(bundled.metafile.inputs).some(f=>f.includes("node_modules/@seda-ai/ui/dist/components/SplitView/SplitView.js")));
 const js=await fs.readFile(path.join(cwd,"split-web/split-entry.js")),css=await fs.readFile(path.join(cwd,"split-web/split-entry.css"));
 const server=createServer((req,res)=>{if(req.url==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}else if(req.url==='/app.css'){res.setHeader('Content-Type','text/css');res.end(css);}else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body style="margin:0"><div id="root">'+html+'</div><script type="module" src="/app.js"></script></body></html>');}});
 await new Promise(r=>server.listen(0,"127.0.0.1",r));
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.setDefaultTimeout(8000);
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const separator=()=>page.getByRole('separator',{name:'Размер навигации',exact:true});
 const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const configure=async next=>{await page.evaluate(next=>window.sedaSplit.configure(next),next);await settle();};
 const state=async()=>JSON.parse(await page.locator('#split-state').textContent());
 const extent=()=>page.locator('#editor-primary').evaluate(el=>el.getBoundingClientRect()[el.closest('.seda-split-view').dataset.orientation==='horizontal'?'width':'height']);
 const near=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<=1,label+': '+actual+' != '+expected);
 async function drag(delta,{cancel=false,scale=1}={}){
  const box=await separator().boundingBox();const x=box.x+box.width/2,y=box.y+Math.min(30,box.height/2);
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+delta*scale,y,{steps:4});await settle();
  if(cancel==='pointer')await separator().dispatchEvent('pointercancel',{pointerId:1});else if(cancel)await page.keyboard.press('Escape');
  await page.mouse.up();await settle();
 }
 try{
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.sedaSplit);await settle();
  near(await extent(),240,'initial extent');assert.equal(await separator().getAttribute('aria-controls'),'editor-primary');assert.equal(await separator().getAttribute('aria-orientation'),'vertical');
  await page.locator('#split-draft').fill('Draft survives resize');await page.locator('#nested-draft').fill('Inspector retained');
  await separator().focus();await page.keyboard.press('ArrowRight');await settle();near(await extent(),248,'ArrowRight');
  await page.keyboard.press('Shift+ArrowLeft');await settle();near(await extent(),216,'large step');
  await page.keyboard.press('Enter');await settle();near(await extent(),160,'Enter minimizes');await page.keyboard.press('Enter');await settle();near(await extent(),216,'Enter restores');
  await page.keyboard.press('Home');await settle();near(await extent(),160,'Home min');await page.keyboard.press('End');await settle();near(await extent(),500,'End max');
  const keyboardEnd=(await state()).ends.at(-1);assert.equal(keyboardEnd.value,500);assert.equal(keyboardEnd.reason,'keyboard');
  await drag(-100);near(await extent(),400,'pointer drag');assert.equal((await state()).ends.at(-1).reason,'pointer');
  const before=await extent();await drag(-60,{cancel:true});near(await extent(),before,'Escape cancels drag');assert.equal((await state()).ends.at(-1).reason,'cancel');
  await drag(-40,{cancel:'pointer'});near(await extent(),before,'pointercancel restores drag');assert.equal((await state()).ends.at(-1).reason,'cancel');
  assert.equal(await page.locator('#split-draft').inputValue(),'Draft survives resize');assert.equal(await page.locator('#nested-draft').inputValue(),'Inspector retained');
  await configure({dir:'rtl'});await separator().focus();await page.keyboard.press('ArrowRight');await settle();near(await extent(),before-8,'RTL ArrowRight shrinks');await drag(-20);near(await extent(),before+12,'RTL drag left grows');
  await configure({dir:'ltr',controlled:true,reject:true});await page.evaluate(()=>window.sedaSplit.setValue(320));await settle();await separator().press('ArrowRight');await settle();near(await extent(),320,'controlled rejection');assert.equal((await state()).ends.at(-1).value,320);
  await drag(80);near(await extent(),320,'controlled pointer rejection');assert.equal((await state()).ends.at(-1).value,320);
  await configure({reject:false});await separator().press('ArrowRight');await settle();near(await extent(),328,'controlled accept');
  await configure({minSize:0});await page.evaluate(()=>window.sedaSplit.setValue(240));await settle();await separator().press('Enter');await settle();near(await extent(),0,'zero minimum collapses');assert.equal(await page.locator('#split-draft').isVisible(),false);await page.keyboard.press('Tab');assert.equal(await page.locator('#split-draft').evaluate(el=>el===document.activeElement),false);await separator().press('Enter');await settle();near(await extent(),240,'zero collapse restores');assert.equal(await page.locator('#split-draft').inputValue(),'Draft survives resize');await configure({minSize:160});await page.evaluate(()=>window.sedaSplit.setValue(328));await settle();
  const count=(await state()).calls.length;await configure({width:400});near(await extent(),232,'container clamp');await configure({width:900});near(await extent(),328,'requested size restored');assert.equal((await state()).calls.length,count);
  await page.evaluate(()=>window.sedaSplit.setValue(400));await configure({width:400});await drag(-40,{cancel:true});assert.equal((await state()).value,400);await configure({width:900});near(await extent(),400,'cancel preserves pre-clamp requested intent');await page.evaluate(()=>window.sedaSplit.setValue(328));await settle();
  await configure({disabled:true});await separator().focus();await page.keyboard.press('End');await settle();near(await extent(),328,'disabled keyboard');assert.equal(await separator().getAttribute('tabindex'),'-1');await configure({disabled:false,veto:true});await separator().press('ArrowRight');near(await extent(),328,'host event veto');await configure({veto:false});
  await configure({orientation:'vertical'});assert.equal(await separator().getAttribute('aria-orientation'),'horizontal');await separator().press('End');await settle();near(await extent(),232,'vertical max');await separator().press('ArrowUp');await settle();near(await extent(),224,'vertical keyboard');
  await configure({orientation:'horizontal',width:900,scale:1.25});await settle();const scaledBefore=await extent();await drag(24,{scale:1.25});near(await extent(),scaledBefore+30,'transformed pointer uses CSS px');await configure({scale:null});
  const measurements=[];
  for(const theme of ['light','dark'])for(const orientation of ['horizontal','vertical'])for(const width of [900,390]){
   await configure({theme,orientation,width});await separator().focus();await page.keyboard.press(orientation==='horizontal'?'ArrowRight':'ArrowDown');await settle();
   const actual=await separator().evaluate(el=>{const style=getComputedStyle(el);return {orientation:el.getAttribute('aria-orientation'),now:Number(el.getAttribute('aria-valuenow')),min:Number(el.getAttribute('aria-valuemin')),max:Number(el.getAttribute('aria-valuemax')),text:el.getAttribute('aria-valuetext'),outline:style.outlineStyle,outlineColor:style.outlineColor,divider:getComputedStyle(el,'::after').backgroundColor};});
   assert.ok(actual.now>=actual.min&&actual.now<=actual.max);assert.ok(actual.min>=0&&actual.max<=100);assert.equal(actual.outline,'solid');assert.notEqual(actual.divider,'rgba(0, 0, 0, 0)');
   measurements.push({theme,orientation,width,...actual});
  }
  await configure({orientation:'horizontal',width:280});assert.equal(await page.locator('#editor').getAttribute('data-overconstrained'),'true');near(await extent(),160,'minimum retained');assert.equal(await page.locator('#editor').evaluate(el=>el.scrollWidth>el.clientWidth),true);
  await configure({width:900,theme:'dark'});await page.screenshot({path:path.join(cwd,'split-dark.png')});
  await configure({theme:'light'});await page.screenshot({path:path.join(cwd,'split-light.png')});
  const box=await separator().boundingBox();await page.mouse.move(box.x+4,box.y+20);await page.mouse.down();await page.mouse.move(box.x+40,box.y+20);await settle();await configure({mounted:false});const ended=(await state()).ends.length;await page.mouse.up();await settle();assert.equal((await state()).ends.length,ended);assert.equal(await page.getByRole('separator').count(),0);assert.deepEqual(errors,[]);
  const result={sourceAlias:false,ssr:true,strictMode:true,invalidInputsRejected:invalid,hydrationErrors:errors,keyboard:true,rtl:true,pointerCapture:true,escapeCancel:true,controlledRejection:true,committedEndSize:true,containerClampRestoresIntent:true,nestedDraftRetained:true,transformCoordinates:true,overconstrainedExplicit:true,hostEventVeto:true,unmountDuringDrag:true,measurements};
  await fs.writeFile(path.join(cwd,'split-results.json'),JSON.stringify(result,null,2)+'\n');return result;
 }finally{await page.close();await new Promise(r=>server.close(r));}
}
