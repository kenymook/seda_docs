import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {build} from 'esbuild';

/** The real packed consumer owns the editing selection; the library owns toolbar semantics. */
export async function verifyInlineToolbar({cwd,browser,version}) {
  await fs.writeFile(path.join(cwd,'inline-toolbar-consumer.mjs'),String.raw`
import React,{useEffect,useState} from 'react';import{SedaProvider,InlineToolbar,Button}from'@seda-ai/ui';const h=React.createElement;
export function Consumer(){const[config,set]=useState({theme:'light',size:'m',scale:100,x:0,y:0,dir:'ltr'}),[action,run]=useState('');useEffect(()=>{window.setToolbarConfig=change=>set(old=>({...old,...change}));return()=>{delete window.setToolbarConfig;};},[]);return h(SedaProvider,{id:'provider',theme:config.theme,controlSize:config.size,textScale:config.scale,dir:config.dir,style:{'--seda-control-extra-padding-inline':config.x+'px','--seda-control-extra-padding-block':config.y+'px'}},h(InlineToolbar,{id:'toolbar',label:'Форматирование'},h(Button,{id:'bold',variant:'ghost','aria-pressed':action==='bold',onClick:()=>run('bold')},'Bold'),h(Button,{id:'disabled',disabled:true},'Disabled'),h(Button,{id:'italic',variant:'ghost',onClick:()=>run('italic')},'Italic'),h(Button,{id:'code',variant:'ghost',onClick:()=>run('code')},'Code')),h('output',{id:'state',hidden:true},JSON.stringify({config,action})));}
`);
  await fs.writeFile(path.join(cwd,'inline-toolbar-ssr.mjs'),String.raw`
import React from'react';import{renderToString}from'react-dom/server';import{InlineToolbar}from'@seda-ai/ui';import{Consumer}from'./inline-toolbar-consumer.mjs';const h=React.createElement;
for(const props of [{label:''},{label:'A',children:null},{label:'A',size:'mega'}]){let rejected=false;try{renderToString(h(InlineToolbar,{...props,children:props.children??null}));}catch(error){if(error instanceof TypeError)rejected=true;else throw error;}if(!rejected)throw Error('Invalid toolbar accepted '+JSON.stringify(props));}
const errors=[];console.error=(...args)=>errors.push(args.join(' '));const markup=renderToString(h(Consumer));if(errors.length)throw Error(errors.join('\n'));process.stdout.write(markup);`);
  const ssr=spawnSync(process.execPath,['inline-toolbar-ssr.mjs'],{cwd,encoding:'utf8',windowsHide:true});assert.equal(ssr.status,0,ssr.stderr);
  await fs.writeFile(path.join(cwd,'inline-toolbar-entry.mjs'),`import React from'react';import{hydrateRoot}from'react-dom/client';import{Consumer}from'./inline-toolbar-consumer.mjs';import'@seda-ai/ui/styles.css';hydrateRoot(document.getElementById('root'),React.createElement(React.StrictMode,null,React.createElement(Consumer)));`);
  const bundle=await build({absWorkingDir:cwd,entryPoints:['inline-toolbar-entry.mjs'],outdir:path.join(cwd,'inline-toolbar-web'),bundle:true,format:'esm',metafile:true});
  assert.ok(Object.keys(bundle.metafile.inputs).some(item=>item.replaceAll('\\','/').includes('node_modules/@seda-ai/ui/dist/components/InlineToolbar/')));
  assert.ok(!Object.keys(bundle.metafile.inputs).some(item=>item.replaceAll('\\','/').includes('seda-ui/src/')));
  const js=await fs.readFile(path.join(cwd,'inline-toolbar-web/inline-toolbar-entry.js')),css=await fs.readFile(path.join(cwd,'inline-toolbar-web/inline-toolbar-entry.css'));
  const server=createServer((req,res)=>{if(req.url==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}else if(req.url==='/app.css'){res.setHeader('Content-Type','text/css');res.end(css);}else{res.setHeader('Content-Type','text/html;charset=utf-8');res.end('<!doctype html><html><head><link rel="stylesheet" href="/app.css"></head><body><div id="root">'+ssr.stdout+'</div><script type="module" src="/app.js"></script></body></html>');}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const context=await browser.newContext({viewport:{width:640,height:480}}),page=await context.newPage(),errors=[],samples=[];page.on('pageerror',error=>errors.push(error.message));
  try{
    await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.setToolbarConfig);
    const toolbar=page.getByRole('toolbar',{name:'Форматирование'});assert.equal(await toolbar.count(),1);
    const bold=page.locator('#bold'),italic=page.locator('#italic'),code=page.locator('#code');
    await bold.focus();await bold.press('ArrowRight');assert.ok(await italic.evaluate(el=>el===document.activeElement));
    await italic.press('ArrowLeft');assert.ok(await bold.evaluate(el=>el===document.activeElement));
    await bold.press('End');assert.ok(await code.evaluate(el=>el===document.activeElement));
    await code.press('Home');assert.ok(await bold.evaluate(el=>el===document.activeElement));
    await bold.press('Enter');assert.equal(JSON.parse(await page.locator('#state').textContent()).action,'bold');assert.equal(await bold.getAttribute('aria-pressed'),'true');
    for(const dir of ['ltr','rtl']){await page.evaluate(dir=>window.setToolbarConfig({dir}),dir);await page.waitForFunction(dir=>document.getElementById('provider').getAttribute('dir')===dir,dir);await bold.focus();await bold.press('ArrowRight');assert.ok(await (dir==='rtl'?code:italic).evaluate(el=>el===document.activeElement));}
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl']){await page.evaluate(config=>window.setToolbarConfig(config),{theme,size,scale:150,x:24,y:12,dir:'ltr'});await page.waitForFunction(({theme,size})=>{const state=JSON.parse(document.getElementById('state').textContent);return state.config.theme===theme&&state.config.size===size;},{theme,size});const sample=await toolbar.evaluate(el=>({height:el.getBoundingClientRect().height,width:el.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth-innerWidth,surface:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderColor}));assert.equal(sample.overflow,0);assert.ok(sample.height>0);samples.push({theme,size,...sample});if(size==='xl')await page.screenshot({path:path.join(cwd,'inline-toolbar-'+theme+'-xl.png'),animations:'disabled'});}
    assert.deepEqual(errors,[]);const result={version,ssr:true,installedBundle:true,keyboard:{ltr:true,rtl:true,disabledSkipped:true},samples,errors};await fs.writeFile(path.join(cwd,'inline-toolbar-results.json'),JSON.stringify(result,null,2));return result;
  }finally{await context.close();await new Promise(resolve=>server.close(resolve));}
}
