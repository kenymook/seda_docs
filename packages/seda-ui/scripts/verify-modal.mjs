import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {build} from 'esbuild';

/** Installed tarball, no source aliases and no application CSS. */
export async function verifyModal({cwd,browser}) {
  await fs.writeFile(path.join(cwd,'modal-consumer.mjs'),`
import React,{useState,useRef,useEffect} from 'react';
import {Modal,SedaProvider,Button,TextField,DropdownMenu,Icon} from '@seda-ai/ui';
const h=React.createElement;
export function Consumer(){
 const [config,setConfig]=useState({theme:'light',size:'m',scale:100}),[open,setOpen]=useState(false),[calls,setCalls]=useState([]),[busy,setBusy]=useState(false);
 const dialog=useRef(null),initial=useRef(null),fallback=useRef(null);
 useEffect(()=>{window.modal={configure:next=>setConfig(old=>({...old,...next})),open:setOpen,nativeClose:value=>dialog.current.close(value),busy:setBusy};},[]);
 const close=(value,details)=>{setCalls(old=>[...old,{value,...details}]);if(!config.reject)setOpen(value);};
 const body=config.empty?null:config.tall?h('div',null,...Array.from({length:45},(_,i)=>h('p',{key:i},'Long content '+i))):h(React.Fragment,null,
   config.remove?null:h(TextField,{key:'name',label:'Name',id:'name',ref:initial}),
   h(DropdownMenu,{triggerLabel:'Commands',items:[{id:'copy',label:'Copy',icon:h(Icon,{name:'copy'}),onSelect:()=>{}}]}),
   h('form',{method:'dialog'},h('button',{value:'confirmed'},'Native submit')));
 return h(SedaProvider,{theme:config.theme,controlSize:config.size,textScale:config.scale},
  config.removeTrigger?null:h(Button,{id:'trigger',onClick:()=>setOpen(true)},'Open'),
  h(Button,{ref:fallback,id:'fallback'},'Fallback'),
  h('output',{id:'calls',hidden:true},JSON.stringify(calls)),
  h(Modal,{ref:dialog,id:'modal',open,onOpenChange:close,title:'Workspace settings',description:config.empty?null:'Change your workspace',
   variant:config.variant??'default',size:config.surface??(config.variant==='fullscreen'?'xl':'l'),
   showCloseButton:config.showClose!==false,closeOnEscape:config.escape!==false,closeOnScrimClick:!!config.scrim,
   initialFocusRef:config.explicit?initial:undefined,returnFocusRef:config.removeTrigger?fallback:undefined,
   footer:config.empty?null:h(Button,{id:'save',loading:busy,onClick:()=>setBusy(true)},'Save changes')},body));
}
`);
  await fs.writeFile(path.join(cwd,'modal-ssr.mjs'),`
import React from 'react';import {renderToString} from 'react-dom/server';import {Modal} from '@seda-ai/ui';import {Consumer} from './modal-consumer.mjs';import assert from 'node:assert/strict';
const base={title:'Test',open:false,onOpenChange:()=>{}};
const invalid=[{title:''},{open:undefined},{onOpenChange:undefined},{variant:'invented'},{size:'wide'},{variant:'fullscreen',size:'s'},{variant:'alert',closeOnScrimClick:true},{variant:'confirmation',closeOnScrimClick:true},{variant:'confirmation'},{variant:'alert'},{closeLabel:''},{open:true,hidden:true}];
for(const bad of invalid)assert.throws(()=>renderToString(React.createElement(Modal,{...base,...bad})),TypeError);
assert.throws(()=>renderToString(React.createElement(Modal,base,React.createElement(Modal,{...base,open:true}))),TypeError);
const errors=[];console.error=(...args)=>errors.push(args.join(' '));
const html=renderToString(React.createElement(React.StrictMode,null,React.createElement(Consumer)));assert.deepEqual(errors,[]);console.log(JSON.stringify({html,invalid:invalid.length+1}));
`);
  const ssr=spawnSync(process.execPath,['modal-ssr.mjs'],{cwd,encoding:'utf8',windowsHide:true});
  assert.equal(ssr.status,0,ssr.stdout+ssr.stderr);const {html,invalid}=JSON.parse(ssr.stdout);
  await fs.writeFile(path.join(cwd,'modal-entry.mjs'),`import React from 'react';import {hydrateRoot} from 'react-dom/client';import {Consumer} from './modal-consumer.mjs';import '@seda-ai/ui/styles.css';window.root=hydrateRoot(document.getElementById('root'),React.createElement(React.StrictMode,null,React.createElement(Consumer)));`);
  await build({absWorkingDir:cwd,entryPoints:['modal-entry.mjs'],outdir:path.join(cwd,'modal-web'),bundle:true,format:'esm'});
  const js=await fs.readFile(path.join(cwd,'modal-web/modal-entry.js')),css=await fs.readFile(path.join(cwd,'modal-web/modal-entry.css'));
  const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript; charset=utf-8':req.url==='/app.css'?'text/css; charset=utf-8':'text/html; charset=utf-8');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body><div id="root">'+html+'</div><script type="module" src="/app.js"></script></body></html>');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[],samples=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const configure=async value=>{await page.evaluate(value=>window.modal.configure(value),value);await settle();};
  const active=()=>page.evaluate(()=>document.activeElement.id);
  const calls=()=>page.locator('#calls').evaluate(node=>JSON.parse(node.textContent));
  const open=async()=>{await page.locator('#trigger').click();await page.waitForSelector('#modal:modal');await settle();};
  const close=async()=>{await page.getByRole('button',{name:'Закрыть диалог'}).click();await page.waitForSelector('#modal:modal',{state:'hidden'});await settle();};
  try{
    await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.modal);await settle();
    assert.equal(await page.locator('#modal').isVisible(),false);assert.deepEqual(await calls(),[]);
    await open();assert.equal(await active(),'name');assert.equal(await page.getByRole('dialog',{name:'Workspace settings'}).count(),1);
    await page.locator('#fallback').evaluate(node=>node.focus());assert.notEqual(await active(),'fallback','Native modal makes background inert');
    await page.locator('#save').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('.seda-modal__close').evaluate(node=>node===document.activeElement),true);
    await page.keyboard.press('Shift+Tab');assert.equal(await active(),'save');
    await page.getByRole('button',{name:'Commands',exact:true}).click();await page.waitForSelector('[role="menu"]');assert.equal(await page.getByRole('menuitem',{name:'Copy'}).evaluate(node=>node===document.activeElement),true);await page.keyboard.press('Escape');
    assert.equal(await page.locator('#modal:modal').count(),1,'Menu escape must not close Modal');assert.deepEqual(await calls(),[]);
    await page.keyboard.press('Escape');await settle();assert.equal(await page.locator('#modal:modal').count(),0);assert.equal(await active(),'trigger');
    assert.equal((await calls()).at(-1).reason,'escape');
    await configure({variant:'confirmation'});await open();assert.equal(await active(),'modal-title','Confirmation starts at safe heading');await close();
    await configure({variant:'alert'});await open();assert.equal(await page.getByRole('alertdialog',{name:'Workspace settings'}).count(),1);await close();
    await configure({variant:'default',escape:false});await open();const before=(await calls()).length;await page.keyboard.press('Escape');await settle();assert.equal((await calls()).length,before);assert.equal(await page.locator('#modal:modal').count(),1);await close();
    await configure({escape:true,reject:true});await open();await page.evaluate(()=>window.modal.nativeClose('kept'));await settle();assert.equal(await page.locator('#modal:modal').count(),1,'Rejected native close must reopen');assert.equal((await calls()).at(-1).returnValue,'kept');
    await configure({reject:false});await page.getByRole('button',{name:'Native submit'}).click();await settle();assert.equal(await page.locator('#modal:modal').count(),0);assert.equal((await calls()).at(-1).returnValue,'confirmed');
    await open();await configure({remove:true});assert.notEqual(await active(),'name');assert.equal(await page.locator('#modal').evaluate(node=>node.contains(document.activeElement)),true);await close();
    await configure({remove:false,scrim:true});await open();
    const rect=await page.locator('#modal').boundingBox();await page.mouse.move(rect.x+10,rect.y+10);await page.mouse.down();await page.mouse.move(5,5);await page.mouse.up();await settle();assert.equal(await page.locator('#modal:modal').count(),1,'Dragging content to scrim must not dismiss');
    await page.mouse.click(5,5);await settle();assert.equal(await page.locator('#modal:modal').count(),0);assert.equal((await calls()).at(-1).reason,'scrim');
    await configure({scrim:false});await open();await configure({removeTrigger:true});await close();assert.equal(await active(),'fallback');await configure({removeTrigger:false});
    await open();const save=await page.locator('#save').boundingBox();await page.locator('#save').click();await settle();const loading=await page.locator('#save').boundingBox();assert.ok(Math.abs(loading.width-save.width)<=1&&Math.abs(loading.height-save.height)<=1);await page.evaluate(()=>window.modal.busy(false));await close();
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,150]){
      await configure({theme,size,scale});await open();
      const sample=await page.locator('#modal').evaluate(node=>{const c=node.querySelector('.seda-modal__close'),title=node.querySelector('h2'),r=c.getBoundingClientRect(),s=getComputedStyle(node);return{width:node.getBoundingClientRect().width,close:{width:r.width,height:r.height},title:parseFloat(getComputedStyle(title).fontSize),background:s.backgroundColor,expectedBackground:s.getPropertyValue('--modal-surface-default').trim(),icon:getComputedStyle(c.querySelector('.seda-icon')).backgroundColor,owner:getComputedStyle(c).color};});
      assert.equal(sample.width,720,'Surface size independent of control density');assert.ok(sample.close.width>=44&&sample.close.height===sample.close.width);assert.equal(sample.icon,sample.owner);assert.notEqual(sample.background,'rgba(0, 0, 0, 0)');samples.push({theme,size,scale,...sample});await close();
    }
    assert.ok(samples.find(x=>x.scale===150).title>samples.find(x=>x.scale===80).title);
    for(const [width,height]of [[1200,800],[600,360],[360,640]]){
      await page.setViewportSize({width,height});await configure({tall:true,scale:150,size:'xl'});await open();
      const geometry=await page.locator('#modal').evaluate(node=>{const r=node.getBoundingClientRect(),body=node.querySelector('.seda-modal__body'),close=node.querySelector('.seda-modal__close').getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,scrollable:body.scrollHeight>body.clientHeight,closeBottom:close.bottom};});
      assert.ok(geometry.x>=0&&geometry.y>=0&&geometry.right<=width+1&&geometry.bottom<=height+1,JSON.stringify(geometry));assert.ok(geometry.scrollable);assert.ok(geometry.closeBottom<=height);
      await page.getByRole('region',{name:'Workspace settings'}).focus();await page.keyboard.press('End');await page.waitForFunction(()=>document.querySelector('.seda-modal__body').scrollTop>0);await page.locator('#save').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('.seda-modal__close').evaluate(node=>node===document.activeElement),true);
      await page.screenshot({path:path.join(cwd,'modal-'+width+'x'+height+'.png')});await close();
    }
    await configure({empty:true,tall:false});await open();assert.equal(await page.locator('.seda-modal__body,.seda-modal__footer,.seda-modal__description').count(),0);assert.equal(await page.locator('#modal').getAttribute('aria-describedby'),null);await close();
    await configure({empty:false,variant:'fullscreen'});await open();assert.equal(await page.locator('#modal').getAttribute('data-modal-size'),'xl');await close();
    await page.emulateMedia({forcedColors:'active'});await configure({variant:'default'});await open();assert.equal(await page.locator('.seda-modal__close .seda-icon').evaluate(node=>getComputedStyle(node).backgroundColor===getComputedStyle(node.closest('button')).color),true);await close();
    await page.evaluate(()=>window.root.unmount());await settle();assert.equal(await page.locator('dialog:modal').count(),0);assert.deepEqual(errors,[]);
    const result={invalid,ssr:true,strictHydration:true,samples,workflows:['focus-cycle','inert-background','menu-escape','safe-confirmation','alert','escape-policy','rejected-native-close','method-dialog-return-value','dynamic-focus-repair','scrim-gesture','removed-trigger-fallback','loading-geometry','short-viewport-scroll','empty-slots','fullscreen','forced-colors','unmount']};
    await fs.writeFile(path.join(cwd,'modal-results.json'),JSON.stringify(result,null,2));return result;
  }catch(error){await fs.writeFile(path.join(cwd,'modal-failure.json'),JSON.stringify({errors,html:await page.content(),active:await active()},null,2));await page.screenshot({path:path.join(cwd,'modal-failure.png')});throw error;}
  finally{await page.close();await new Promise(resolve=>server.close(resolve));}
}
