import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {createServer} from "node:http";
import {build} from "esbuild";

/** Real installed package, SSR/hydration, StrictMode, no Lab styles or source aliases. */
export async function verifyMenu({cwd,browser}) {
  await fs.writeFile(path.join(cwd,"menu-consumer.mjs"), `
import React,{useState,useEffect,useRef} from 'react';import {DropdownMenu,SedaProvider} from '@seda-ai/ui';const h=React.createElement;
export function MenuConsumer(){
 const [config,setConfig]=useState({theme:'light',controlSize:'m',dir:'ltr',shortcutScope:'menu',variant:'grouped'});
 const [calls,setCalls]=useState([]),[changes,setChanges]=useState([]),[open,setOpen]=useState(false),[mounted,setMounted]=useState(true),[confirm,setConfirm]=useState(false);
 const dialog=useRef(null);
 useEffect(()=>{window.sedaMenu={configure:next=>setConfig(old=>({...old,...next})),setOpen,setMounted};return()=>{delete window.sedaMenu;};},[]);
 useEffect(()=>{if(confirm)dialog.current?.showModal();},[confirm]);
 const action=(id,label,extra={})=>({id,label,onSelect:()=>{setCalls(old=>[...old,id]);if(id==='delete')setConfirm(true);},...extra});
 const items=[{type:'group',id:'files',label:'Files',items:[action('open','Открыть',{icon:'↗',shortcut:{key:'o',modifiers:['Alt'],label:'Alt+O'}}),action('blocked','Недоступно',{disabled:true,description:'Нет прав'}),action('alpha','Álpha'),action('another','Another')]},{type:'separator',id:'separator'},action('delete','Удалить проект',{danger:true})];
 if(config.remove)items[0].items=items[0].items.filter(item=>item.id!==config.remove);
 if(config.allDisabled){for(const item of items[0].items)item.disabled=true;items[2].disabled=true;}
 return h(SedaProvider,{id:'menu-provider',theme:config.theme,controlSize:config.controlSize,dir:config.dir,style:{padding:16,...(config.custom?{'--seda-control-height':'60px','--seda-control-line-height':'24px','--seda-control-padding-inline':'30px'}:{})}},
 h('input',{id:'before','aria-label':'Before'}),
 h('div',{id:'clip',style:{overflow:'hidden',width:180,height:48,transform:'translateZ(0)',...(config.edge?{position:'fixed',bottom:8,right:8}:{})}},
 mounted?h(DropdownMenu,{key:config.instance??'main',id:'commands',triggerLabel:'Действия',items:config.empty?[]:items,disabled:!!config.disabled,variant:config.variant,shortcutScope:config.shortcutScope,...(config.controlled?{open}:config.defaultOpen?{defaultOpen:true}:{}),onOpenChange:(value,reason)=>{setChanges(old=>[...old,{value,reason}]);if(!config.reject)setOpen(value);}}):null),
 h('button',{id:'after',style:{position:'fixed',top:16,right:16}},'After'),
 h(SedaProvider,{id:'nested'},h('button',{id:'nested-command'},'Nested scope')),
 h('dialog',{ref:dialog,'aria-label':'Подтверждение'},h('button',{id:'confirm',onClick:()=>{dialog.current.close();setConfirm(false);}},'Подтвердить удаление')),
 h('output',{id:'menu-state',hidden:true},JSON.stringify({calls,changes,open})));
}
`);
  await fs.writeFile(path.join(cwd,"menu-ssr.mjs"),`
import React from 'react';import {renderToString} from 'react-dom/server';import {DropdownMenu} from '@seda-ai/ui';import {MenuConsumer} from './menu-consumer.mjs';import assert from 'node:assert/strict';
const action={id:'a',label:'A',onSelect:()=>{}};
const invalid=[{triggerLabel:'',items:[]},{triggerLabel:'Menu',items:[action,action]},{triggerLabel:'Menu',items:[{id:'a',label:'A'}]},{triggerLabel:'Menu',items:[],variant:'invented'},{triggerLabel:'Menu',items:[],open:true},{triggerLabel:'Menu',items:[],iconOnly:true},{triggerLabel:'Menu',items:[{...action,shortcut:{key:'a',label:'A',modifiers:[]}}],shortcutScope:'provider'},{triggerLabel:'Menu',items:[{type:'group',id:'g',label:'Group',items:[null]}]}];
for(const props of invalid)assert.throws(()=>renderToString(React.createElement(DropdownMenu,props)),TypeError);
const errors=[];console.error=(...args)=>errors.push(args.join(' '));const html=renderToString(React.createElement(React.StrictMode,null,React.createElement(MenuConsumer)));assert.deepEqual(errors,[]);console.log(JSON.stringify({html,invalid:invalid.length}));
`);
  const ssr=spawnSync(process.execPath,["menu-ssr.mjs"],{cwd,encoding:"utf8",windowsHide:true});
  assert.equal(ssr.status,0,ssr.stdout+ssr.stderr);assert.equal(ssr.stderr,"");
  const {html,invalid}=JSON.parse(ssr.stdout);
  await fs.writeFile(path.join(cwd,"menu-entry.mjs"),`import React from 'react';import {hydrateRoot} from 'react-dom/client';import {MenuConsumer} from './menu-consumer.mjs';import '@seda-ai/ui/styles.css';const root=hydrateRoot(document.getElementById('root'),React.createElement(React.StrictMode,null,React.createElement(MenuConsumer)));window.unmountSeda=()=>root.unmount();`);
  const bundled=await build({absWorkingDir:cwd,entryPoints:["menu-entry.mjs"],outdir:path.join(cwd,"menu-web"),bundle:true,format:"esm",metafile:true});
  assert.ok(Object.keys(bundled.metafile.inputs).some(f=>f.includes("node_modules/@seda-ai/ui/dist/components/DropdownMenu/DropdownMenu.js")));
  const js=await fs.readFile(path.join(cwd,"menu-web/menu-entry.js")),css=await fs.readFile(path.join(cwd,"menu-web/menu-entry.css"));
  const metadata=JSON.parse(await fs.readFile(path.join(cwd,"node_modules/@seda-ai/ui/dist/profiles.json"),"utf8"));
  const server=createServer((req,res)=>{if(req.url==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}else if(req.url==='/app.css'){res.setHeader('Content-Type','text/css');res.end(css);}else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body style="margin:0"><div id="root">'+html+'</div><script type="module" src="/app.js"></script></body></html>');}});
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const page=await browser.newPage({viewport:{width:900,height:650}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const trigger=()=>page.locator('#commands-trigger'),menu=()=>page.getByRole('menu'),item=id=>page.locator('[role=menuitem][data-menu-id="'+id+'"]');
  const focused=locator=>locator.evaluate(el=>el===document.activeElement);
  const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const configure=async next=>{await page.evaluate(next=>window.sedaMenu.configure(next),next);await settle();};
  const state=async()=>JSON.parse(await page.locator('#menu-state').textContent());
  const openMenu=async()=>{await trigger().click();await menu().waitFor();await settle();};
  const close=async()=>{if(await menu().count()){await page.keyboard.press('Escape');await settle();}assert.equal(await menu().count(),0);};
  try{
    await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.sedaMenu);
    await trigger().focus();await page.keyboard.press('ArrowUp');await menu().waitFor();assert.equal(await focused(item('delete')),true);
    assert.equal(await menu().getAttribute('aria-labelledby'),'commands-trigger');assert.equal(await trigger().getAttribute('aria-controls'),'commands-menu');
    assert.equal(await page.getByRole('group',{name:'Files'}).count(),1);assert.equal(await page.getByRole('separator').count(),1);
    await page.keyboard.press('ArrowDown');assert.equal(await focused(item('open')),true);
    await page.keyboard.press('ArrowDown');assert.equal(await focused(item('blocked')),true);
    const initialCalls=(await state()).calls.length;await page.keyboard.press('Enter');await page.keyboard.press('Space');await item('blocked').click({force:true});assert.equal((await state()).calls.length,initialCalls);assert.equal(await menu().count(),1);
    await page.keyboard.press('Home');assert.equal(await focused(item('open')),true);await page.keyboard.press('a');assert.equal(await focused(item('alpha')),true);await page.keyboard.press('a');assert.equal(await focused(item('another')),true);
    await page.keyboard.press('End');assert.equal(await focused(item('delete')),true);
    const beforeEscape=(await state()).changes.length;await close();assert.equal(await focused(trigger()),true);assert.equal((await state()).changes.length,beforeEscape+1);
    await trigger().press('Enter');await menu().waitFor();await page.keyboard.press('Tab');assert.equal(await menu().count(),0);assert.equal(await focused(page.locator('#after')),true);
    await trigger().press('Space');await menu().waitFor();await page.keyboard.press('Shift+Tab');assert.equal(await focused(page.locator('#before')),true);assert.equal(await menu().count(),0);
    await openMenu();await page.locator('#after').click();assert.equal(await menu().count(),0);assert.equal(await focused(page.locator('#after')),true);
    await openMenu();await page.locator('#before').focus();assert.equal(await menu().count(),0);assert.equal(await focused(page.locator('#before')),true);
    await openMenu();await page.keyboard.press('Alt+o');assert.equal(await menu().count(),0);assert.equal((await state()).calls.at(-1),'open');assert.equal(await focused(trigger()),true);
    await configure({shortcutScope:'provider'});await page.locator('#after').focus();const n=(await state()).calls.length;await page.keyboard.press('Alt+o');assert.equal((await state()).calls.length,n+1);
    await page.locator('#before').focus();await page.keyboard.press('Alt+o');assert.equal((await state()).calls.length,n+1);
    await page.locator('#nested-command').focus();await page.keyboard.press('Alt+o');assert.equal((await state()).calls.length,n+1);
    await configure({shortcutScope:'menu'});await openMenu();await item('delete').click();assert.equal(await menu().count(),0);assert.equal(await focused(page.locator('#confirm')),true);await page.locator('#confirm').click();
    await configure({controlled:true,reject:true});await trigger().click();assert.equal(await menu().count(),0);
    await page.evaluate(()=>window.sedaMenu.setOpen(true));await menu().waitFor();await page.keyboard.press('Escape');assert.equal(await menu().count(),1);assert.equal(await focused(trigger()),true);
    await configure({reject:false});await item('open').click();assert.equal(await menu().count(),0);
    await openMenu();await item('alpha').focus();await configure({remove:'alpha'});assert.equal(await focused(item('open')),true);await close();await configure({remove:null});
    const measurements=[];
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const width of [900,390]){
      await page.setViewportSize({width,height:650});await configure({theme,controlSize:size,edge:true});await openMenu();await item('alpha').focus();
      const actual=await item('open').evaluate(el=>{const s=getComputedStyle(el),m=el.closest('[role=menu]'),r=m.getBoundingClientRect();return {height:el.getBoundingClientRect().height,font:parseFloat(s.fontSize),background:getComputedStyle(m).backgroundColor,padding:parseFloat(s.paddingInlineStart),x:r.x,y:r.y,right:r.right,bottom:r.bottom,side:m.dataset.side,topLayer:m.dataset.topLayer};});
      const geometry=metadata.profiles[theme+':'+size].geometry;
      assert.equal(actual.height,geometry.height.value);assert.equal(actual.font,geometry.fontSize.value);assert.ok(actual.x>=7&&actual.right<=width-7&&actual.y>=7&&actual.bottom<=643);assert.equal(actual.side,'top');assert.equal(actual.topLayer,'true');
      const token=metadata.themes[theme].find(x=>x.property==='--dropdown-menu-surface-default').cssValue;
      const normalized=await page.evaluate(value=>{const e=document.createElement('span');e.style.color=value;document.body.append(e);const color=getComputedStyle(e).color;e.remove();return color;},token);assert.equal(actual.background,normalized);
      await configure({theme:theme==='light'?'dark':'light',custom:true});assert.equal(await focused(item('alpha')),true);const custom=await item('open').evaluate(el=>({height:el.getBoundingClientRect().height,padding:parseFloat(getComputedStyle(el).paddingInlineStart)}));assert.equal(custom.height,60);assert.equal(custom.padding,30);
      measurements.push({theme,size,width,...actual});await close();await configure({custom:false});
    }
    await configure({edge:false,allDisabled:true});await openMenu();await page.keyboard.press('Enter');assert.equal(await menu().count(),1);await close();await configure({allDisabled:false});
    await openMenu();await configure({disabled:true});assert.equal(await menu().count(),0);assert.equal(await trigger().isDisabled(),true);await configure({disabled:false,empty:true});assert.equal(await trigger().isDisabled(),true);await configure({empty:false});
    await page.setViewportSize({width:900,height:650});await configure({theme:'dark',controlSize:'m'});await openMenu();await page.screenshot({path:path.join(cwd,'menu-dark.png')});await close();await configure({theme:'light',dir:'rtl'});await openMenu();await page.screenshot({path:path.join(cwd,'menu-light-rtl.png')});await close();
    await configure({controlled:false,defaultOpen:true,instance:'strict-open'});await menu().waitFor();await page.evaluate(()=>window.sedaMenu.setMounted(false));await settle();assert.equal(await page.locator('.seda-overlay-portal').count(),0);
    await page.evaluate(()=>window.sedaMenu.setMounted(true));await menu().waitFor();await page.evaluate(()=>window.unmountSeda());await settle();assert.equal(await page.locator('.seda-overlay-portal').count(),0);
    // Explicit non-Popover fallback; independent reload/hydration.
    await page.addInitScript(()=>{HTMLElement.prototype.showPopover=undefined;});
    await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>window.sedaMenu);await configure({edge:true});await openMenu();assert.equal(await menu().getAttribute('data-top-layer'),'false');
    assert.equal(await menu().evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+10,r.y+10)?.closest('[role=menu]')===el;}),true);
    await close();assert.deepEqual(errors,[]);
    const result={sourceAlias:false,ssr:true,strictMode:true,hydrationErrors:errors,invalidInputsRejected:invalid,profileMeasurements:measurements.length,measurements,keyboard:true,disabledGuard:true,typeahead:true,controlledRejection:true,dynamicFocusRepair:true,nestedShortcutIsolation:true,dialogFocusHandoff:true,overflowPortal:true,viewportFlip:true,popoverFallback:true,unmountCleanup:true};
    await fs.writeFile(path.join(cwd,'menu-results.json'),JSON.stringify(result,null,2)+'\n');return result;
  }finally{await page.close();await new Promise(r=>server.close(r));}
}
