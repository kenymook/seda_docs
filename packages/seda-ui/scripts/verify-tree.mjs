import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {createContractEngine} from '../../seda-contracts/src/index.mjs';

/** Only the installed package is imported by the SSR/browser consumer. */
export async function verifyTree({cwd,browser}) {
 const engine=createContractEngine();
 await fs.writeFile(path.join(cwd,'tree-consumer.mjs'),`
import React,{useState,useEffect} from 'react';import {Tree,SedaProvider} from '@seda-ai/ui';const h=React.createElement;
export function TreeConsumer(){
 const [config,setConfig]=useState({theme:'light',controlSize:'m',selectionMode:'single',dir:'ltr'}),[selection,setSelection]=useState(['a']),[expanded,setExpanded]=useState(['root']),[calls,setCalls]=useState([]);
 const nodes=config.empty?[]:[{id:'root',label:'Workspace',children:[{id:'a',label:'Alpha'},{id:'blocked',label:'Disabled',disabled:true},{id:'branch',label:'Documents',children:[{id:'deep',label:'Nested document'}]},{id:'b',label:'Béta'}]},{id:'last',label:'Zebra'}];
 function filter(items){return items.filter(item=>item.id!==config.remove).map(item=>({...item,disabled:item.disabled||item.id===config.disable,children:item.children?filter(item.children):undefined}));}
 useEffect(()=>{window.sedaTree={configure:next=>setConfig(old=>({...old,...next})),select:setSelection,expand:setExpanded};return()=>delete window.sedaTree;},[]);
 return h(SedaProvider,{theme:config.theme,controlSize:config.controlSize,dir:config.dir,style:{width:config.width||480,padding:16}},
 h(Tree,{id:'tree',label:'Objects',items:filter(nodes),disabled:!!config.disabled,selectionMode:config.selectionMode,defaultSelectedIds:config.controlled?undefined:['a'],defaultExpandedIds:config.controlled?undefined:['root'],
 ...(config.controlled?{selectedIds:selection,expandedIds:expanded}:{}),onSelectionChange:next=>{setCalls(old=>[...old,{selection:next}]);if(!config.reject)setSelection(next);},onExpandedChange:next=>{setCalls(old=>[...old,{expanded:next}]);if(!config.reject)setExpanded(next);},onActivate:id=>setCalls(old=>[...old,{activate:id}]),onKeyDownCapture:e=>{if(config.veto)e.preventDefault();}}),
 h('button',{id:'outside'},'Inspector'),h('output',{id:'tree-state'},JSON.stringify({selection,expanded,calls})));}
`);
 await fs.writeFile(path.join(cwd,'tree-ssr.mjs'),`
import React from 'react';import {renderToString} from 'react-dom/server';import {Tree} from '@seda-ai/ui';import {TreeConsumer} from './tree-consumer.mjs';import assert from 'node:assert/strict';
const base={label:'Objects',items:[]};let invalid=0;for(const props of [{label:''},{items:[{id:'x',label:'A'},{id:'x',label:'B'}]},{items:[{id:'x',label:''}]},{selectionMode:'invented'},{selectedIds:['x']},{expandedIds:['x']},{selectedIds:['x'],defaultSelectedIds:[],onSelectionChange:()=>{}},{defaultSelectedIds:['a','b']},{defaultExpandedIds:[3]},{disabled:'false'}]){assert.throws(()=>renderToString(React.createElement(Tree,{...base,...props})),TypeError);invalid++;}
const cyclic={id:'cycle',label:'Cycle'};cyclic.children=[cyclic];assert.throws(()=>renderToString(React.createElement(Tree,{...base,items:[cyclic]})),TypeError);invalid++;
console.log(JSON.stringify({html:renderToString(React.createElement(TreeConsumer)),invalid}));
`);
 const ssr=spawnSync(process.execPath,['tree-ssr.mjs'],{cwd,encoding:'utf8',windowsHide:true});assert.equal(ssr.status,0,ssr.stdout+ssr.stderr);assert.equal(ssr.stderr,'');const {html,invalid}=JSON.parse(ssr.stdout);
 await fs.writeFile(path.join(cwd,'tree-entry.mjs'),`import React from 'react';import {hydrateRoot} from 'react-dom/client';import {TreeConsumer} from './tree-consumer.mjs';import '@seda-ai/ui/styles.css';hydrateRoot(document.getElementById('root'),React.createElement(React.StrictMode,null,React.createElement(TreeConsumer)));`);
 const bundle=await build({absWorkingDir:cwd,entryPoints:['tree-entry.mjs'],outdir:path.join(cwd,'tree-web'),bundle:true,format:'esm',metafile:true});
 assert.ok(Object.keys(bundle.metafile.inputs).some(file=>file.includes('node_modules/@seda-ai/ui/dist/components/Tree/Tree.js')));
 const js=await fs.readFile(path.join(cwd,'tree-web/tree-entry.js')),css=await fs.readFile(path.join(cwd,'tree-web/tree-entry.css'));
 const profiles=JSON.parse(await fs.readFile(path.join(cwd,'node_modules/@seda-ai/ui/dist/profiles.json'),'utf8'));
 const server=createServer((req,res)=>{if(req.url==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}else if(req.url==='/app.css'){res.setHeader('Content-Type','text/css');res.end(css);}else {res.setHeader('Content-Type','text/html');res.end('<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body><div id="root">'+html+'</div><script type="module" src="/app.js"></script></body></html>');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const page=await browser.newPage({viewport:{width:900,height:700}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 const item=id=>page.locator('#tree-'+id),row=id=>item(id).locator(':scope > .seda-tree__row');
 const configure=async next=>{await page.evaluate(value=>window.sedaTree.configure(value),next);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));};
 const focusId=()=>page.evaluate(()=>document.activeElement.id);
 const selected=()=>page.locator('[role=treeitem][aria-selected=true]').evaluateAll(items=>items.map(item=>item.id.slice(5)));
 const press=key=>page.keyboard.press(key);
 try {
  await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.sedaTree);
  assert.equal(await item('root').getAttribute('aria-expanded'),'true');assert.equal(await item('a').getAttribute('aria-expanded'),null);
  assert.equal(await item('a').getAttribute('aria-level'),'2');assert.equal(await item('a').getAttribute('aria-setsize'),'4');assert.equal(await item('blocked').getAttribute('aria-selected'),null);
  assert.equal(await page.locator('[role=treeitem][tabindex="0"]').count(),1);assert.deepEqual(await selected(),['a']);
  await item('a').focus();await press('ArrowDown');assert.equal(await focusId(),'tree-branch');assert.deepEqual(await selected(),['a']);
  await press('ArrowRight');assert.equal(await item('branch').getAttribute('aria-expanded'),'true');await press('ArrowRight');assert.equal(await focusId(),'tree-deep');
  await press('Space');assert.deepEqual(await selected(),['deep']);await press('ArrowLeft');assert.equal(await focusId(),'tree-branch');await press('ArrowLeft');assert.equal(await item('deep').count(),0);assert.deepEqual(await selected(),[]);
  // Hidden selection is preserved and reappears on expand.
  await press('ArrowRight');assert.deepEqual(await selected(),['deep']);await press('End');assert.equal(await focusId(),'tree-last');await press('Home');assert.equal(await focusId(),'tree-root');
  await press('b');assert.equal(await focusId(),'tree-b');await press('Enter');assert.deepEqual(await selected(),['b']);
  await row('root').locator('[data-tree-disclosure]').click();assert.equal(await item('a').count(),0);await row('root').locator('[data-tree-disclosure]').click();assert.deepEqual(await selected(),['b']);
  // A disappearing focused descendant returns focus to its surviving ancestor.
  await item('a').focus();await configure({remove:'a'});assert.equal(await focusId(),'tree-root');await configure({remove:null});
  await item('b').focus();await configure({disable:'b'});assert.equal(await focusId(),'tree-root');await configure({disable:null});
  await configure({selectionMode:'multiple'});await row('a').click();await row('b').click({modifiers:['Control']});assert.deepEqual(await selected(),['a','b']);
  await item('a').focus();await press('Shift+ArrowDown');assert.deepEqual(await selected(),['branch','deep','b']);
  // Range anchor is the most recent pointer selection (B), disabled rows are skipped.
  await press('Control+a');assert.deepEqual(await selected(),['root','a','branch','deep','b','last']);
  await press('Space');assert.deepEqual(await selected(),['root','a','deep','b','last']);
  await configure({controlled:true,reject:true});await page.evaluate(()=>{window.sedaTree.select(['a']);window.sedaTree.expand(['root']);});await row('b').click();assert.deepEqual(await selected(),['a']);
  await row('root').locator('[data-tree-disclosure]').click();assert.equal(await item('root').getAttribute('aria-expanded'),'true');
  await configure({reject:false,selectionMode:'single',dir:'rtl'});await item('branch').focus();await press('ArrowLeft');assert.equal(await item('branch').getAttribute('aria-expanded'),'true');await press('ArrowLeft');assert.equal(await focusId(),'tree-deep');
  await configure({veto:true});await press('End');assert.equal(await focusId(),'tree-deep');await configure({veto:false,dir:'ltr'});
  let combinations=0;const measurements=[];
  for(const theme of ['light','dark'])for(const controlSize of ['s','m','l','xl'])for(const width of [260,720]) {
   await page.locator('#outside').focus();await configure({theme,controlSize,width});assert.equal(await focusId(),'outside');
   const transparent=await page.getByRole('tree').evaluate(node=>{node.parentElement.style.background='var(--container-neutral-default)';return getComputedStyle(node).backgroundColor;});assert.equal(transparent,'rgba(0, 0, 0, 0)','Tree scope must not paint a base-surface rectangle on its host');
   const actual=await row('a').evaluate(el=>({height:el.getBoundingClientRect().height,font:getComputedStyle(el).fontSize,foreground:getComputedStyle(el).color}));
   assert.equal(actual.height,profiles.profiles[theme+':'+controlSize].geometry.height.value);
   assert.notEqual(actual.foreground,'rgba(0, 0, 0, 0)');measurements.push({theme,controlSize,width,transparent,...actual});combinations++;
  }
  await configure({theme:'dark',width:480});await page.screenshot({path:path.join(cwd,'tree-dark.png'),animations:'disabled'});await configure({theme:'light'});await page.screenshot({path:path.join(cwd,'tree-light.png'),animations:'disabled'});
  await item('a').focus();await configure({disabled:true});assert.equal(await focusId(),'tree');assert.equal(await page.locator('[role=treeitem][tabindex="0"]').count(),0);
  await configure({disabled:false,empty:true});assert.equal(await page.getByRole('treeitem').count(),0);assert.equal(await page.getByRole('tree').getAttribute('tabindex'),'0');assert.equal(await page.getByText('Нет элементов').count(),1);
  let compilerSnapshots=0;
  for(const sample of [{selection:['deep'],expanded:['root','branch']},{selection:['deep'],expanded:['root']},{selection:['blocked','missing'],expanded:['root'],selectionMode:'multiple'},{selection:['b','a'],expanded:['root'],selectionMode:'multiple'},{selection:['a'],expanded:['root'],disabled:true},{selection:['a'],expanded:['root'],remove:'a'},{selection:[],expanded:[],empty:true}]) {
   await page.evaluate(sample=>{window.sedaTree.configure({disabled:false,empty:false,remove:null,selectionMode:'single',...sample,controlled:true});window.sedaTree.select(sample.selection);window.sedaTree.expand(sample.expanded);},sample);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const nodes=sample.empty?[]:[{id:'root',label:'Workspace',children:[{id:'a',label:'Alpha'},{id:'blocked',label:'Disabled',disabled:true},{id:'branch',label:'Documents',children:[{id:'deep',label:'Nested document'}]},{id:'b',label:'Béta'}].filter(item=>item.id!==sample.remove)},{id:'last',label:'Zebra'}];
   const expected=engine.compileControl('Tree',{label:'Objects',items:nodes,selectionMode:sample.selectionMode??'single',disabled:sample.disabled??false,selectedIds:sample.selection,expandedIds:sample.expanded,onSelectionChange:{$handler:'select'},onExpandedChange:{$handler:'expand'}}).state.tree.items.filter(item=>item.visible).map(({id,level,position,count,disabled,branch,expanded,selected})=>({id,level,position,count,disabled,expanded:branch?expanded:null,selected}));
   const actual=await page.locator('[role=treeitem]').evaluateAll(items=>items.map(item=>({id:item.id.slice(5),level:Number(item.getAttribute('aria-level')),position:Number(item.getAttribute('aria-posinset')),count:Number(item.getAttribute('aria-setsize')),disabled:item.getAttribute('aria-disabled')==='true',expanded:item.hasAttribute('aria-expanded')?item.getAttribute('aria-expanded')==='true':null,selected:item.getAttribute('aria-selected')==='true'})));
   assert.deepEqual(actual,expected);compilerSnapshots++;
  }
  assert.deepEqual(errors,[]);const result={sourceAlias:false,ssr:true,strictHydration:true,invalidInputsRejected:invalid,combinations,compilerSnapshots,measurements,keyboard:true,independentSelectionExpansion:true,multipleRange:true,controlledRejection:true,focusRepair:true,rtl:true,externalFocusRetained:true,errors};
  await fs.writeFile(path.join(cwd,'tree-results.json'),JSON.stringify(result,null,2)+'\n');return result;
 }finally{await page.close();await new Promise(resolve=>server.close(resolve));}
}
