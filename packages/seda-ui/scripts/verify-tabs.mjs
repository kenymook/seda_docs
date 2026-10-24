import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { build } from "esbuild";
import { createContractEngine } from "../../seda-contracts/src/index.mjs";

/** Consumer uses only installed tarball exports, including SSR -> hydration. */
export async function verifyTabs({cwd, browser}) {
  const engine = createContractEngine();
  await fs.writeFile(path.join(cwd, "tabs-consumer.mjs"), `
import React,{useState,useEffect} from 'react';import {Tabs,SedaProvider,TextField} from '@seda-ai/ui';const h=React.createElement;
export function TabsConsumer(){const [config,setConfig]=useState({theme:'light',controlSize:'m',variant:'line',activationMode:'automatic',controlled:false,dir:'ltr'});const [value,setValue]=useState('a');const [calls,setCalls]=useState([]);const items=[{value:'a',label:'Свойства',icon:'A',content:h(TextField,{id:'tab-field',label:'Название',defaultValue:'Atlas'})},{value:'blocked',label:'Недоступно',disabled:true,content:'Blocked'},{value:'b',label:'История',content:h('p',null,'History')},{value:'c',label:'Очень длинное название вкладки для проверки прокрутки',content:h('p',null,'Versions')}].filter(item=>!config.remove||item.value!==config.remove).map(item=>({...item,disabled:item.disabled||config.disable===item.value||config.allDisabled}));
useEffect(()=>{window.sedaTabs={configure:next=>setConfig(old=>({...old,...next})),select:setValue};return()=>{delete window.sedaTabs;};},[]);
return h(SedaProvider,{theme:config.theme,controlSize:config.controlSize,dir:config.dir,style:{padding:16}},h(Tabs,{id:'work-tabs',label:'Рабочие панели',items,variant:config.variant,activationMode:config.activationMode,...(config.controlled?{value}:{}),onValueChange:next=>{setCalls(old=>[...old,next]);if(!config.reject)setValue(next);}}),h('output',{id:'tab-state'},JSON.stringify({value,calls})),h('button',{id:'outside'},'Outside'));}
`);
  await fs.writeFile(path.join(cwd,"tabs-ssr.mjs"), `import React from 'react';import {renderToString} from 'react-dom/server';import {TabsConsumer} from './tabs-consumer.mjs';import {Tabs} from '@seda-ai/ui';import assert from 'node:assert/strict';const errors=[];console.error=(...a)=>errors.push(a.join(' '));for(const props of [{label:'',items:[]},{label:'Panels',items:[{value:'a',label:'A'},{value:'a',label:'B'}]},{label:'Panels',items:[],variant:'invented'},{label:'Panels',items:[],activationMode:'invented'},{label:'Panels',items:[],value:'a',defaultValue:'b'}])assert.throws(()=>renderToString(React.createElement(Tabs,props)),TypeError);const html=renderToString(React.createElement(TabsConsumer));if(errors.length)throw Error(errors.join('\\n'));console.log(JSON.stringify({html}));`);
  const ssr=spawnSync(process.execPath,["tabs-ssr.mjs"],{cwd,encoding:"utf8",windowsHide:true});
  assert.equal(ssr.status,0,ssr.stdout+ssr.stderr);assert.equal(ssr.stderr,"");
  const {html}=JSON.parse(ssr.stdout);
  await fs.writeFile(path.join(cwd,"tabs-entry.mjs"), `import React from 'react';import {hydrateRoot} from 'react-dom/client';import {TabsConsumer} from './tabs-consumer.mjs';import '@seda-ai/ui/styles.css';hydrateRoot(document.getElementById('root'),React.createElement(TabsConsumer));`);
  const bundled=await build({absWorkingDir:cwd,entryPoints:["tabs-entry.mjs"],outdir:path.join(cwd,"tabs-web"),bundle:true,format:"esm",metafile:true});
  assert.ok(Object.keys(bundled.metafile.inputs).some(f=>f.includes("node_modules/@seda-ai/ui/dist/components/Tabs/Tabs.js")));
  const js=await fs.readFile(path.join(cwd,"tabs-web/tabs-entry.js")),css=await fs.readFile(path.join(cwd,"tabs-web/tabs-entry.css"));
  const metadata=JSON.parse(await fs.readFile(path.join(cwd,"node_modules/@seda-ai/ui/dist/profiles.json"),"utf8"));
  const server=createServer((req,res)=>{if(req.url==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}else if(req.url==='/app.css'){res.setHeader('Content-Type','text/css');res.end(css);}else {res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body style="margin:0"><div id="root">'+html+'</div><script type="module" src="/app.js"></script></body></html>');}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const page=await browser.newPage({viewport:{width:900,height:650}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const configure=async config=>{await page.evaluate(next=>window.sedaTabs.configure(next),config);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
  const tab=value=>page.locator(`[role="tab"][id$="-tab-${value}"]`);
  const selected=()=>page.getByRole('tab',{selected:true});
  try {
    await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.sedaTabs);await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.getByRole('tablist',{name:'Рабочие панели'}).count(),1);
    assert.equal(await selected().count(),1);assert.equal(await selected().textContent(),'AСвойства');
    const relations=await page.locator('[role="tab"]').evaluateAll(tabs=>tabs.every(tab=>{const panel=document.getElementById(tab.getAttribute('aria-controls'));return panel?.getAttribute('role')==='tabpanel'&&panel.getAttribute('aria-labelledby')===tab.id;}));assert.equal(relations,true);
    await tab('a').focus();await page.keyboard.press('ArrowRight');assert.equal(await tab('b').getAttribute('aria-selected'),'true');
    await page.keyboard.press('End');assert.equal(await tab('c').getAttribute('aria-selected'),'true');
    await page.keyboard.press('ArrowRight');assert.equal(await tab('a').getAttribute('aria-selected'),'true');
    await page.locator('#tab-field').fill('Retained draft');await tab('b').click();assert.equal(await page.locator('#tab-field').isVisible(),false);await tab('a').click();assert.equal(await page.locator('#tab-field').inputValue(),'Retained draft');
    await configure({activationMode:'manual'});await tab('a').focus();await page.keyboard.press('ArrowRight');assert.equal(await tab('b').evaluate(el=>el===document.activeElement),true);assert.equal(await tab('a').getAttribute('aria-selected'),'true');
    await page.keyboard.press('Tab');assert.equal(await page.getByRole('tabpanel').evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Shift+Tab');assert.equal(await tab('a').evaluate(el=>el===document.activeElement),true);await page.keyboard.press('ArrowRight');await page.keyboard.press('Space');assert.equal(await tab('b').getAttribute('aria-selected'),'true');await page.keyboard.press('Home');assert.equal(await tab('b').getAttribute('aria-selected'),'true');await page.keyboard.press('Enter');assert.equal(await tab('a').getAttribute('aria-selected'),'true');
    await configure({activationMode:'automatic',dir:'rtl'});await tab('a').focus();await page.keyboard.press('ArrowLeft');assert.equal(await tab('b').getAttribute('aria-selected'),'true');await page.keyboard.press('ArrowRight');assert.equal(await tab('a').getAttribute('aria-selected'),'true');
    await configure({dir:'ltr',controlled:true,reject:true});await page.evaluate(()=>window.sedaTabs.select('a'));await tab('a').focus();await page.keyboard.press('ArrowRight');assert.equal(await tab('a').getAttribute('aria-selected'),'true');assert.equal(await tab('b').evaluate(el=>el===document.activeElement),true);
    await configure({reject:false});await tab('b').click();assert.equal(await tab('b').getAttribute('aria-selected'),'true');
    // Removing the focused selected tab repairs focus to an enabled tab.
    await configure({remove:'b'});assert.equal(await tab('a').getAttribute('aria-selected'),'true');assert.equal(await tab('a').evaluate(el=>el===document.activeElement),true);
    await configure({remove:null});await tab('c').click();await configure({disable:'c'});assert.equal(await tab('a').getAttribute('aria-selected'),'true');assert.equal(await tab('a').evaluate(el=>el===document.activeElement),true);
    await configure({disable:null});await page.locator('#outside').focus();await configure({theme:'dark',controlSize:'xl'});assert.equal(await page.locator('#outside').evaluate(el=>el===document.activeElement),true);
    let combinations=0;const measurements=[];
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const variant of ['line','pill'])for(const width of [900,390]){
      await page.setViewportSize({width,height:650});await configure({theme,controlSize:size,variant});await page.evaluate(()=>window.sedaTabs.select('a'));await page.mouse.move(0,0);
      const actual=await tab('a').evaluate(el=>{const s=getComputedStyle(el),root=el.closest('.seda-tabs'),list=el.closest('[role="tablist"]');return {height:el.getBoundingClientRect().height,font:parseFloat(s.fontSize),color:s.color,border:s.borderBottomColor,surface:s.backgroundColor,rootWidth:root.getBoundingClientRect().width,viewport:innerWidth,scroll:list.scrollWidth>list.clientWidth};});
      const geometry=metadata.profiles[theme+':'+size].geometry;assert.equal(actual.height,geometry.height.value);assert.equal(actual.font,geometry.fontSize.value);assert.ok(actual.rootWidth<=actual.viewport);
      const binding=property=>metadata.themes[theme].find(x=>x.property===property).cssValue;
      const normalized=async value=>page.evaluate(color=>{const el=document.createElement('span');el.style.color=color;document.body.append(el);const result=getComputedStyle(el).color;el.remove();return result;},value);
      assert.equal(actual.color,await normalized(binding(variant==='line'?'--tabs-foreground-active':'--tabs-pill-foreground-selected')));
      assert.equal(actual.border,await normalized(binding(variant==='line'?'--tabs-indicator-selected':'--tabs-pill-border-selected')));
      if(width===390)assert.equal(actual.scroll,true);
      measurements.push({theme,size,variant,width,...actual});combinations++;
    }
    await tab('a').focus();await page.keyboard.press('ArrowRight');assert.equal(await tab('b').evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
    await configure({allDisabled:true});assert.equal(await selected().count(),0);assert.equal(await page.locator('[role=tab][tabindex="0"]').count(),0);assert.equal(await page.getByRole('tabpanel').count(),0);await configure({allDisabled:false});
    let compilerSnapshots = 0;
    for (const sample of [
      {value:'a'}, {value:'b'}, {value:'blocked'}, {value:'removed'},
      {value:'b',remove:'b'}, {value:'b',disable:'b'}, {value:'a',allDisabled:true},
    ]) {
      await configure({controlled:true,remove:null,disable:null,allDisabled:false,...sample});
      await page.evaluate(value=>window.sedaTabs.select(value),sample.value);
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const input = { label:'Рабочие панели', value:sample.value, items: [
        {value:'a',label:'Свойства',content:{$slot:'properties'}},
        {value:'blocked',label:'Недоступно',disabled:true,content:null},
        {value:'b',label:'История',content:'History'},
        {value:'c',label:'Versions',content:'Versions'},
      ].filter(item=>item.value!==sample.remove).map(item=>({...item,disabled:Boolean(item.disabled||sample.allDisabled||sample.disable===item.value)})) };
      const expected=engine.compileControl('Tabs',input).state.tabs;
      const actual=await page.locator('[role="tab"]').evaluateAll(tabs=>tabs.map(tab=>({value:decodeURIComponent(tab.id.split('-tab-')[1]),state:tab.disabled?'disabled':tab.getAttribute('aria-selected')==='true'?'selected':'default'})));
      assert.deepEqual(actual,expected.items);compilerSnapshots++;
    }
    await configure({allDisabled:false});await page.evaluate(()=>window.sedaTabs.select('a'));
    await page.screenshot({path:path.join(cwd,'tabs-dark.png')});await configure({theme:'light',variant:'line'});await page.screenshot({path:path.join(cwd,'tabs-light.png')});
    const focusVisibility=[];
    for(const dir of ['ltr','rtl'])for(const width of [900,390]){
      await page.setViewportSize({width,height:650});await configure({dir,controlled:false,reject:false,remove:null,disable:null,allDisabled:false,controlSize:'xl'});
      await tab('a').focus();await page.keyboard.press('End');await page.keyboard.press(dir==='ltr'?'ArrowLeft':'ArrowRight');
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const visible=await tab('b').evaluate(node=>{const list=node.closest('[role=tablist]'),r=node.getBoundingClientRect(),v=list.getBoundingClientRect();return{left:r.left,right:r.right,viewportLeft:v.left,viewportRight:v.right,focused:node===document.activeElement,documentScrollX:scrollX};});
      assert.ok(visible.focused);assert.ok(visible.left>=visible.viewportLeft-1&&visible.right<=visible.viewportRight+1,JSON.stringify({dir,width,...visible}));assert.equal(visible.documentScrollX,0);focusVisibility.push({dir,width,...visible});
    }
    assert.deepEqual(errors,[]);
    const result={sourceAlias:false,ssr:true,hydrationErrors:errors,combinations,compilerSnapshots,invalidInputsRejected:5,relationships:relations,keyboard:'automatic/manual, Home/End, wrap, skip disabled, RTL',focusVisibility,controlledRejection:true,dynamicFocusRepair:true,panelDraftRetained:true,themeChangeDidNotStealFocus:true,measurements};
    await fs.writeFile(path.join(cwd,'tabs-results.json'),JSON.stringify(result,null,2)+'\n');return result;
  }finally{await page.close();await new Promise(r=>server.close(r));}
}
