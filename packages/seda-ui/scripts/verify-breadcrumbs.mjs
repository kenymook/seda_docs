import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {build} from 'esbuild';

export async function verifyBreadcrumbs({cwd,browser}){
 const entry=`import React from 'react';import{createRoot}from'react-dom/client';import{Breadcrumbs,SedaProvider,Icon}from'@seda-ai/ui';import'@seda-ai/ui/styles.css';const h=React.createElement,root=createRoot(document.getElementById('root'));window.activations=0;window.configure=render;function render({theme='light',size='m',variant='ghost',separator='slash',count=6,long=false,scale=100,x=0,y=0,dir='ltr',disabled=false,identity='default'}={}){const items=Array.from({length:count},(_,index)=>({id:'level-'+index,label:long&&index===count-1?'Длинное название документа '.repeat(12):'Level '+index,href:'#level-'+index,disabled:disabled||index===1,icon:index===0?h(Icon,{name:'monitor'}):undefined,onClick:e=>{e.preventDefault();window.activations++;}}));root.render(h(SedaProvider,{theme,controlSize:size,controlParameters:{scale,extraPaddingInline:x,extraPaddingBlock:y}},h('div',{id:'box',dir,style:{width:'100%',maxWidth:760}},h(Breadcrumbs,{key:identity,id:'path',label:'Document path',items,variant,separator,expandLabel:'Show full path'})),h('button',{id:'after'},'After path')));}render();`;
 await fs.writeFile(path.join(cwd,'breadcrumbs-entry.mjs'),entry);
 await build({absWorkingDir:cwd,entryPoints:['breadcrumbs-entry.mjs'],outdir:path.join(cwd,'breadcrumbs-web'),bundle:true,format:'esm'});
 const js=await fs.readFile(path.join(cwd,'breadcrumbs-web/breadcrumbs-entry.js')),css=await fs.readFile(path.join(cwd,'breadcrumbs-web/breadcrumbs-entry.css'));
 const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><meta name="viewport" content="width=device-width"><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const page=await browser.newPage({viewport:{width:1000,height:800}}),errors=[],samples=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto('http://127.0.0.1:'+server.address().port);await page.getByRole('navigation',{name:'Document path'}).waitFor();
  for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const variant of ['ghost','text']){
   const options={identity:theme+'-'+size+'-'+variant,theme,size,variant,separator:variant==='text'?'triangle':'slash'};
   await page.evaluate(options=>window.configure(options),options);await page.waitForFunction(({size,theme})=>document.querySelector('#path').dataset.size===size&&document.querySelector('[data-seda-theme]').dataset.sedaTheme===theme,options);
   const nav=page.locator('#path');assert.equal(await nav.locator('[aria-current=page]').count(),1);assert.equal(await nav.locator('[aria-current=page]').evaluate(n=>n.tagName),'SPAN');assert.equal(await nav.locator('[aria-current=page]').getAttribute('href'),null);assert.equal(await nav.getByRole('link').count(),2);assert.equal(await nav.locator('li').count(),4);
   assert.equal(await nav.locator('.seda-breadcrumbs__separator:not([aria-hidden=true])').count(),0);
   const trigger=nav.getByRole('button',{name:'Show full path'});await trigger.focus();await trigger.press('Enter');assert.equal(await nav.getByRole('button').count(),0);assert.equal(await nav.locator('li').count(),6);assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-breadcrumb-id')),'level-2','Expansion focuses first available revealed ancestor');
   assert.equal(await nav.locator('[aria-disabled=true]').evaluate(n=>n.tagName),'SPAN');assert.equal(await nav.locator('[aria-disabled=true]').getAttribute('tabindex'),null);
   const root=nav.getByRole('link',{name:'Level 0',exact:true});await root.focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-breadcrumb-id')),'level-2','Tab skips disabled levels');assert.equal(await nav.locator('[data-breadcrumb-id=level-2]').evaluate(n=>getComputedStyle(n).outlineStyle),'solid');
   const before=await page.evaluate(()=>window.activations);await nav.getByRole('link',{name:'Level 2',exact:true}).press('Enter');assert.equal(await page.evaluate(()=>window.activations),before+1);
   const paint=async(selector,property,token)=>{const colors=await nav.locator(selector).evaluate((n,{property,token})=>{const s=getComputedStyle(n),probe=document.createElement('span');probe.style[property]=s.getPropertyValue(token);n.append(probe);const pair=[s[property],getComputedStyle(probe)[property],s.getPropertyValue(token).trim()];probe.remove();return pair;},{property,token});assert.ok(colors[2],token);assert.equal(colors[0],colors[1],selector+'/'+token);};
   await page.mouse.move(0,0);await paint('[data-breadcrumb-id=level-0]','color','--breadcrumbs-item-foreground-default');await root.hover();await paint('[data-breadcrumb-id=level-0]','color','--breadcrumbs-item-foreground-hover');await paint('[aria-current]','color','--breadcrumbs-item-foreground-current');await paint('[aria-disabled]','color','--breadcrumbs-item-foreground-disabled');
   samples.push(options);
  }
  // Changed hierarchy discards a previous expansion; a theme change alone keeps it.
  await page.evaluate(()=>window.configure({count:7}));await page.getByRole('button',{name:'Show full path'}).waitFor();await page.getByRole('button',{name:'Show full path'}).click();await page.evaluate(()=>window.configure({count:7,theme:'dark'}));assert.equal(await page.locator('#path li').count(),7);
  await page.evaluate(()=>window.configure({count:8}));await page.getByRole('button',{name:'Show full path'}).waitFor();
  for(const dir of ['ltr','rtl']){
   await page.setViewportSize({width:390,height:900});await page.evaluate(dir=>window.configure({count:3,long:true,dir,scale:150,x:24,y:12}),dir);await page.waitForFunction(dir=>document.querySelector('#box').dir===dir,dir);
   const geometry=await page.locator('#path').evaluate(n=>({width:n.getBoundingClientRect().width,overflow:n.scrollWidth-n.clientWidth,bodyOverflow:document.documentElement.scrollWidth-innerWidth,font:parseFloat(getComputedStyle(n).fontSize),icon:n.querySelector('.seda-breadcrumbs__icon').getBoundingClientRect().width}));assert.ok(geometry.overflow<=1&&geometry.bodyOverflow<=1,JSON.stringify(geometry));assert.equal(geometry.font,21);assert.equal(geometry.icon,24);
  }
  await page.setViewportSize({width:1000,height:800});
  for(const theme of ['light','dark']){await page.evaluate(theme=>window.configure({theme,count:6}),theme);await page.waitForFunction(theme=>document.querySelector('[data-seda-theme]').dataset.sedaTheme===theme,theme);await page.screenshot({path:path.join(cwd,'breadcrumbs-'+theme+'.png')});}
  await page.evaluate(()=>window.configure({disabled:true,count:6}));await page.getByRole('button',{name:'Show full path'}).click();assert.equal(await page.evaluate(()=>document.activeElement.id),'path','An all-disabled hierarchy keeps expansion focus in its navigation');
  await page.emulateMedia({forcedColors:'active'});await page.evaluate(()=>window.configure({count:2}));await page.getByRole('link',{name:'Level 0',exact:true}).focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await page.getByRole('link',{name:'Level 0',exact:true}).evaluate(n=>getComputedStyle(n).outlineWidth),'2px');
  const touch=await browser.newPage({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
  try{await touch.goto('http://127.0.0.1:'+server.address().port);await touch.getByRole('navigation').waitFor();await touch.evaluate(()=>window.configure({size:'s',count:2}));const target=touch.getByRole('link',{name:'Level 0',exact:true});await touch.waitForFunction(()=>document.querySelector('#path').dataset.size==='s');assert.equal(await touch.evaluate(()=>matchMedia('(pointer:coarse)').matches),true);const box=await target.boundingBox();assert.ok(box.width>=44&&box.height>=44);}finally{await touch.close();}
  assert.deepEqual(errors,[]);return{installedPackage:true,samples,keyboard:true,collapse:true,routeIdentity:true,longPathRTL:true,scaledTextAndIcon:true,forcedColors:true,coarsePointer44:true,errors};
 }finally{await page.close();await new Promise(resolve=>server.close(resolve));}
}
