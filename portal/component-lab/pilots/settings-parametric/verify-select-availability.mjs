import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import path from 'node:path';
import {chromium} from 'playwright';
const output=await build({alias:{react:path.resolve('node_modules/react'),'react-dom':path.resolve('node_modules/react-dom')},stdin:{resolveDir:process.cwd(),sourcefile:'select-availability-fixture.tsx',loader:'tsx',contents:`
import React,{useState,useLayoutEffect} from 'react';import{createRoot}from'react-dom/client';import{Select,SedaProvider}from'@seda-ai/ui';import'@seda-ai/ui/styles.css';
function App(){const[c,set]=useState({theme:'light',size:'m',scale:100,multi:false,controlled:false,readOnly:false,loading:false,disabled:false,error:false,value:'a'}),[calls,update]=useState({change:0,input:0,value:0});
useLayoutEffect(()=>{window.configure=p=>set(c=>({...c,...p}));},[]);
return <SedaProvider theme={c.theme} controlSize={c.size} controlParameters={{scale:c.scale,extraPaddingInline:c.scale===150?24:0,extraPaddingBlock:c.scale===150?12:0}}><form id="form"><Select key={String(c.multi)} id="role" name="role" label="Роль" selection={c.multi?'multi':'single'} options={[{value:'a',label:'Альфа'},{value:'b',label:'Бета'},{value:'c',label:'Гамма'}]} value={c.controlled?c.value:undefined} defaultValue={c.controlled?undefined:c.multi?['a','b']:'a'} readOnly={c.readOnly} loading={c.loading} disabled={c.disabled} errorText={c.error?'Ошибка':undefined} helperText="Описание" onValueChange={value=>{update(n=>({...n,value:n.value+1}));if(c.controlled)set(n=>({...n,value}));}} onChange={()=>update(n=>({...n,change:n.change+1}))} onInput={()=>update(n=>({...n,input:n.input+1}))}/><button type="button" id="next">Далее</button></form><output id="state">{JSON.stringify({c,calls})}</output></SedaProvider>}
createRoot(document.getElementById('root')).render(<App/>);`},bundle:true,format:'esm',write:false,outdir:'.diagnostics-select-availability'});
const js=output.outputFiles.find(f=>f.path.endsWith('.js')).text,css=output.outputFiles.find(f=>f.path.endsWith('.css')).text;
const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<link rel="stylesheet" href="/app.css"><style>body{margin:24px}form{max-width:500px}.seda-provider{padding:20px;min-height:360px}</style><div id="root"></div><script type="module" src="/app.js"></script>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const page=await browser.newPage({viewport:{width:1000,height:760}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url='http://127.0.0.1:'+server.address().port;
const vals=()=>page.locator('#role').evaluate(e=>Array.from(e.selectedOptions,o=>o.value));
const state=async()=>JSON.parse(await page.locator('#state').innerText());
async function configure(p){await page.evaluate(p=>window.configure(p),p);await page.waitForFunction(p=>Object.entries(p).every(([k,v])=>JSON.stringify(JSON.parse(document.querySelector('#state').textContent).c[k])===JSON.stringify(v)),p);}
const rect=()=>page.locator('.seda-field__control').boundingBox();let cases=0;
try{
 await fs.mkdir('.diagnostics-select-availability',{recursive:true});
 for(const theme of ['light','dark'])for(const controlled of [false,true])for(const multi of [false,true])for(const mode of ['readOnly','loading']){
  await page.goto(url);await page.waitForFunction(()=>!!window.configure);
  await configure({theme,controlled,multi,value:multi?['a','b']:'a',size:multi?'xl':'m',scale:multi?150:100});
  await page.locator('#role').selectOption(multi?['b','c']:'b');const expected=multi?['b','c']:['b'];
  assert.deepEqual(await vals(),expected);await page.locator('#role').focus();
  const before=await rect(),beforeCalls=(await state()).calls;
  await page.locator('#role').evaluate(e=>window.keptSelect=e);await configure({[mode]:true,error:true});
  assert.equal(await page.locator('.seda-field').getAttribute('data-state'),mode==='readOnly'?'read-only':'loading');
  assert.equal(await page.locator('#role').getAttribute('aria-invalid'),null);
  assert.equal(await page.locator('#role').evaluate(e=>e===window.keptSelect&&e===document.activeElement&&!e.disabled),true);
  assert.equal(await page.locator('#role').getAttribute(mode==='readOnly'?'aria-readonly':'aria-busy'),'true');
  const after=await rect();assert.ok(Math.abs(before.height-after.height)<=1&&Math.abs(before.width-after.width)<=1);
  await page.locator('#role').click({force:true});
  await page.locator('.seda-field').evaluate((e,mode)=>e.style.setProperty('--select-border-'+(mode==='readOnly'?'read-only':'loading'),'rgb(11, 22, 33)'),mode);
  await page.locator('.seda-field__control').hover();assert.equal(await page.locator('.seda-field__control').evaluate(e=>getComputedStyle(e).borderTopColor),'rgb(11, 22, 33)');
  if(!multi){const offset=await page.locator('.seda-field__control').evaluate(e=>{const a=e.querySelector('.seda-select__arrow').getBoundingClientRect(),b=e.getBoundingClientRect();return Math.abs(a.top+a.height/2-b.top-b.height/2);});assert.ok(offset<=0.5);}
  await page.locator('.seda-field').evaluate((e,mode)=>e.style.removeProperty('--select-border-'+(mode==='readOnly'?'read-only':'loading')),mode);
  for(const key of ['ArrowDown','ArrowUp','Home','End','Enter','Space','g','Alt+ArrowDown','F4','Control+a'])await page.keyboard.press(key);
  assert.equal(await page.locator('#role').evaluate(e=>e.matches(':open')),false);assert.deepEqual(await vals(),expected);
  assert.equal(await page.locator('#role').evaluate(e=>e.dispatchEvent(new KeyboardEvent('keydown',{key:'F4',altKey:true,bubbles:true,cancelable:true}))),true,'Window shortcut is not a Select selection command');
  await page.keyboard.press('Tab');assert.equal(await page.locator('#next').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Shift+Tab');
  await page.locator('#role').evaluate(e=>{for(const o of e.options)o.selected=o.value==='a';e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));});
  assert.deepEqual(await vals(),expected);assert.deepEqual((await state()).calls,beforeCalls);
  assert.deepEqual(await page.locator('#form').evaluate(e=>new FormData(e).getAll('role')),expected);
  if(controlled){await configure({value:multi?['a','c']:'c'});assert.deepEqual(await vals(),multi?['a','c']:['c']);}
  if(controlled){await page.locator('#form').evaluate(e=>e.reset());await page.waitForFunction(expected=>JSON.stringify(Array.from(document.querySelector('#role').selectedOptions,o=>o.value))===JSON.stringify(expected),multi?['a','c']:['c']);}
  if(!multi&&!controlled)await page.screenshot({path:'.diagnostics-select-availability/'+theme+'-'+mode+'.png'});
  await configure({readOnly:false,loading:false,error:false});await page.locator('#role').selectOption('a');assert.deepEqual(await vals(),['a']);assert.ok((await state()).calls.value>beforeCalls.value);
  cases++;
 }
 await page.goto(url);await page.waitForFunction(()=>!!window.configure);await page.locator('#role').click();assert.equal(await page.locator('#role').evaluate(e=>e.matches(':open')),true);
 await configure({loading:true});await page.waitForFunction(()=>!document.querySelector('#role').matches(':open')&&document.activeElement===document.querySelector('#role'));const opening=await page.locator('#role').evaluate(e=>({open:e.matches(':open'),focus:e===document.activeElement,active:document.activeElement?.outerHTML.slice(0,200),state:e.closest('.seda-field').dataset.state}));assert.ok(!opening.open&&opening.focus,JSON.stringify(opening));
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.seda-select__spinner').evaluate(e=>getComputedStyle(e).animationName),'none');
 await configure({loading:false});await page.locator('#role').selectOption('c');await configure({readOnly:true});await page.locator('#form').evaluate(e=>e.reset());await page.waitForFunction(()=>document.querySelector('#role').value==='a');await page.locator('#role').selectOption('b');assert.deepEqual(await vals(),['a']);
 await configure({disabled:true,loading:true});assert.equal(await page.locator('#role').evaluate(e=>e.disabled),true);assert.deepEqual(await page.locator('#form').evaluate(e=>new FormData(e).getAll('role')),[]);assert.equal(await page.locator('.seda-select__spinner').count(),0);
 await configure({disabled:false,loading:false,readOnly:false});await page.locator('#next').focus();await configure({loading:true});assert.equal(await page.locator('#next').evaluate(e=>e===document.activeElement),true);
 assert.deepEqual(errors,[]);console.log('PASS: '+cases+' live installed Select availability cases; controlled/uncontrolled single/multi, keys/pointer, guarded callbacks, FormData, stable DOM/focus/geometry, owner updates, reset, open-to-loading, disabled precedence, reduced motion.');
}catch(error){console.error({errors});await page.screenshot({path:'.diagnostics-select-availability/failure.png'});throw error;}finally{await browser.close();await new Promise(r=>server.close(r));}
