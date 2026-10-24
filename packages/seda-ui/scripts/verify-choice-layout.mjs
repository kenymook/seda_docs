import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'node:http';
import {build} from 'esbuild';
export async function readChoiceLayout(page) {
 return page.evaluate(()=>{
  const rows=Array.from(document.querySelectorAll('#choice-fixture .seda-choice,#choice-fixture .seda-toggle'));
  return rows.map(row=>{const input=row.querySelector('input'),label=row.querySelector('.seda-choice__label,.seda-toggle__label'),message=row.querySelector('.seda-field__message'),r=input.getBoundingClientRect(),l=label.getBoundingClientRect(),s=getComputedStyle(label),line=parseFloat(s.lineHeight),head=l.top+parseFloat(s.paddingTop)+line/2;
   return{id:input.id||input.value,controlCenter:r.y+r.height/2,firstLineCenter:head,delta:Math.abs(r.y+r.height/2-head),labelTop:l.top,labelBottom:l.bottom,rowHeight:row.getBoundingClientRect().height,helper:message?{top:message.getBoundingClientRect().top,text:message.textContent}:null,overflow:row.scrollWidth>row.clientWidth+1};
  });
 });
}
export async function verifyChoiceLayout({cwd,browser,enforce=true}) {
 await fs.writeFile(path.join(cwd,'choice-layout-entry.mjs'),`
  import React from 'react';import {createRoot} from 'react-dom/client';import {SedaProvider,Checkbox,Radio,Toggle} from '@seda-ai/ui';import '@seda-ai/ui/styles.css';
  const h=React.createElement,root=createRoot(document.getElementById('root'));window.events={check:0,toggle:0,radio:0};
  window.configure=({theme='light',size='m',kind='none',dir='ltr'}={})=>{
   document.documentElement.dir=dir;const helper=kind==='none'?undefined:kind==='zero'?0:'Additional context that can wrap onto several lines.';
   const long=kind==='wrap';root.render(h(SedaProvider,{theme,controlSize:size,style:{padding:24}},h('main',{id:'choice-fixture'},
    h('div',{className:'choice-pair'},h(Checkbox,{id:'check',label:long?'Share changes with all workspace members and reviewers':'Share changes',helperText:helper,errorText:kind==='error'?'Choose report sections':undefined,onCheckedChange:()=>window.events.check++}),h(Toggle,{id:'live',label:long?'Live preview including inherited project settings':'Live preview',helperText:undefined,onCheckedChange:()=>window.events.toggle++})),
    h(Radio,{className:'fixture-radio',name:'scope',label:'Sharing scope',options:[{value:'private',label:long?'Private access for invited workspace collaborators':'Private access',helperText:helper},{value:'team',label:'Team access'}],errorText:kind==='error'?'Select a scope':undefined,onValueChange:()=>window.events.radio++}),
    h(Toggle,{id:'live-helper',label:'Background preview',helperText:helper,onCheckedChange:()=>{}}),
    h(Checkbox,{id:'custom-name',label:'Visible caption','aria-label':'Custom accessible name',helperText:'Custom description'})
   )));
  };window.configure();
 `);
 await build({absWorkingDir:cwd,entryPoints:['choice-layout-entry.mjs'],outdir:path.join(cwd,'choice-layout-web'),bundle:true,format:'esm'});
 const js=await fs.readFile(path.join(cwd,'choice-layout-web/choice-layout-entry.js')),css=await fs.readFile(path.join(cwd,'choice-layout-web/choice-layout-entry.css'));
 const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"><style>main{width:620px;display:grid;gap:24px}.choice-pair,.fixture-radio .seda-radio-group__items{display:flex;align-items:first baseline;gap:24px}.choice-pair>label,.fixture-radio .seda-choice{width:250px;min-width:0}</style></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const page=await browser.newPage({viewport:{width:900,height:1100}}),samples=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 try {
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForSelector('#check');
  for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const kind of ['none','helper','error','zero','wrap'])for(const dir of ['ltr','rtl']){
   await page.evaluate(config=>window.configure(config),{theme,size,kind,dir});await settle();const rows=await readChoiceLayout(page);
   samples.push({theme,size,kind,dir,rows});
   if(enforce){for(const row of rows){assert.ok(row.delta<=1,JSON.stringify({theme,size,kind,dir,...row}));assert.equal(row.overflow,false);if(row.helper)assert.ok(row.helper.top>=row.labelBottom,'Helper starts after the entire label');}
    const [check,toggle,radio,radioPlain]=rows;assert.ok(Math.abs(check.firstLineCenter-toggle.firstLineCenter)<=1,'Adjacent primary lines stay aligned');assert.ok(Math.abs(radio.firstLineCenter-radioPlain.firstLineCenter)<=1,'Radio option first lines stay aligned');
    if(kind==='zero')assert.equal(rows.filter(r=>r.helper?.text==='0').length,3,'Numeric helper content is retained');
   }
  }
  await page.evaluate(()=>window.configure({kind:'helper'}));await settle();
  if(enforce){assert.equal(await page.getByRole('checkbox',{name:'Share changes',exact:true}).count(),1);assert.equal(await page.getByRole('radio',{name:'Private access',exact:true}).count(),1);assert.equal(await page.getByRole('switch',{name:'Background preview',exact:true}).count(),1);assert.equal(await page.getByRole('checkbox',{name:'Custom accessible name',exact:true}).count(),1);}
  await page.locator('#check').check();await page.locator('#live').check();await page.getByRole('radio',{name:/Team access/}).check();assert.deepEqual(await page.evaluate(()=>window.events),{check:1,toggle:1,radio:1});
  await page.screenshot({path:path.join(cwd,'choice-layout-light.png')});await fs.writeFile(path.join(cwd,'choice-layout-results.json'),JSON.stringify({samples,errors},null,2));assert.deepEqual(errors,[]);return{installedPackage:true,sourceAlias:false,samples,errors};
 }finally{await page.close();await new Promise(r=>server.close(r));}
}
