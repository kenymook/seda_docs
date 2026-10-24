import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { build } from 'esbuild';

const rgba=value=>{
  assert.match(value,/^rgba?\(/);
  const numbers=value.match(/[\d.]+/g).map(Number);
  return [...numbers.slice(0,3),numbers[3]??1];
};
const over=(foreground,background)=>foreground.slice(0,3).map((value,i)=>value*foreground[3]+background[i]*(1-foreground[3]));
function textContrast(foreground,backgrounds){
  const background=backgrounds.toReversed().reduce((background,value)=>over(rgba(value),background),[255,255,255]);
  const painted=over(rgba(foreground),background);
  const luminance=rgb=>rgb.map(value=>value/255).reduce((sum,value,i)=>sum+[.2126,.7152,.0722][i]*(value<=.04045?value/12.92:((value+.055)/1.055)**2.4),0);
  const [lo,hi]=[luminance(background),luminance(painted)].sort((a,b)=>a-b);
  return (hi+.05)/(lo+.05);
}

/** Installed consumer: no Lab CSS and no source aliases. */
export async function verifyFileUpload({cwd,browser}) {
  const profiles=JSON.parse(await fs.readFile(path.join(cwd,'node_modules/@seda-ai/ui/dist/profiles.json'),'utf8'));
  await fs.writeFile(path.join(cwd,'upload-entry.mjs'),`
    import React from 'react';import {createRoot} from 'react-dom/client';
    import {SedaProvider,FileUpload} from '@seda-ai/ui';import '@seda-ai/ui/styles.css';
    const h=React.createElement,root=createRoot(document.getElementById('root'));let options={},files=[];
    window.events={changes:0,files:0,drops:0};
    function render(){root.render(h(SedaProvider,{theme:options.theme||'light',controlSize:options.size||'m',style:options.geometry},
      h('p',{id:'external'},'External description'),h('button',{id:'before'},'Before'),
      h('div',{style:{width:options.width||360}},h(FileUpload,{id:'upload',label:'Attachment',actionLabel:'Choose files',
        helperText:options.helper??'PNG or text',required:true,files,variant:options.variant||'dropzone',state:options.state||'default',
        disabled:options.disabled,errorText:options.error,progress:options.progress,multiple:options.multiple,
        'aria-describedby':'external external','aria-label':options.ariaLabel,
        onFilesChange:next=>{window.events.files++;files=next;window.lastFiles=next.map(f=>f.name);render();},
        onChange:()=>window.events.changes++,onDrop:()=>window.events.drops++})),h('button',{id:'after'},'After')));}
    window.configure=next=>{options=next;files=[];render();};window.configure({});
  `);
  await build({absWorkingDir:cwd,entryPoints:['upload-entry.mjs'],outdir:path.join(cwd,'upload-web'),bundle:true,format:'esm'});
  const js=await fs.readFile(path.join(cwd,'upload-web/upload-entry.js')),css=await fs.readFile(path.join(cwd,'upload-web/upload-entry.css'));
  const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const page=await browser.newPage(),errors=[],samples=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const configure=async options=>{await page.evaluate(next=>window.configure(next),options);await settle();};
  const near=(a,b,message)=>assert.ok(Math.abs(a-b)<=1,`${message}: ${a} vs ${b}`);
  try {
    await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#upload').waitFor();
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const variant of ['dropzone','button','inline'])for(const state of ['default','hover','drag-over','uploading','success','error','disabled']) {
      await configure({theme,size,variant,state,error:state==='error'?'Rejected file':undefined});
      const actual=await page.locator('.seda-file-upload').evaluate(el=>{const backgrounds=[];for(let ancestor=el;ancestor;ancestor=ancestor.parentElement)backgrounds.push(getComputedStyle(ancestor).backgroundColor);const css=getComputedStyle(el),title=el.querySelector('.seda-file-upload__label'),glyph=el.querySelector('.seda-icon'),icon=el.querySelector('.seda-file-upload__icon'),input=el.querySelector('input');return{backgrounds,messageColor:getComputedStyle(el.querySelector('.seda-file-upload__message')).color,height:el.getBoundingClientRect().height,font:parseFloat(getComputedStyle(title).fontSize),line:parseFloat(getComputedStyle(title).lineHeight),radius:parseFloat(css.borderRadius),paddingX:parseFloat(css.paddingInlineStart),paddingY:parseFloat(css.paddingBlockStart),gap:parseFloat(css.columnGap),iconWidth:icon.getBoundingClientRect().width,glyphWidth:glyph.getBoundingClientRect().width,disabled:input.disabled,background:css.backgroundColor,color:css.color,titleColor:getComputedStyle(title).color,actionColor:getComputedStyle(el.querySelector('.seda-file-upload__action')).color,overflow:el.scrollWidth>el.clientWidth+1};});
      const g=profiles.profiles[theme+':'+size].geometry;
      near(actual.font,g.fontSize.value,'preset font');near(actual.line,g.lineHeight.value,'preset line');near(actual.radius,g.radius.value,'preset radius');near(actual.iconWidth,g.iconSize.value,'preset icon');near(actual.glyphWidth,g.iconSize.value,'glyph fills slot');
      near(actual.paddingX,variant==='inline'?0:variant==='button'?g.buttonPaddingInline.value:g.textFieldPaddingInline.value,'variant base padding');
      assert.ok(actual.height>=g.height.value);assert.equal(actual.disabled,state==='disabled');assert.equal(actual.overflow,false);
      if(state==='disabled'||state==='drag-over'){assert.equal(actual.titleColor,actual.color);assert.equal(actual.actionColor,actual.color);}
      assert.equal(await page.getByRole('button',{name:'Attachment',exact:true}).count(),1,await page.locator('#upload').ariaSnapshot());
      assert.equal(await page.locator('#upload').getAttribute('aria-describedby'),'external upload-message');
      if(state==='uploading'){assert.equal(await page.locator('#upload').getAttribute('aria-busy'),'true');assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'),null);}
      const contrast=state==='disabled'?null:Math.min(...[actual.titleColor,actual.actionColor,actual.messageColor].map(color=>textContrast(color,actual.backgrounds)));
      if(contrast!=null)assert.ok(contrast>=4.5,`${theme}/${size}/${variant}/${state} text contrast ${contrast}`);
      samples.push({theme,size,variant,state,contrast,...actual});
    }
    const parametric=[];
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const variant of ['dropzone','button','inline']) {
      const g=profiles.profiles[theme+':'+size].geometry,icon=Math.round(g.iconSize.value*1.5),font=Math.round(g.fontSize.value*1.5),line=Math.round(g.lineHeight.value*1.5),py=(g.height.value-g.lineHeight.value-2*g.borderWidth.value)/2+6;
      await configure({theme,size,variant,geometry:{'--seda-control-font-size':font+'px','--seda-control-line-height':line+'px','--seda-control-icon-size':icon+'px','--seda-control-padding-block':py+'px','--seda-control-field-padding-inline':g.textFieldPaddingInline.value+8+'px','--seda-control-button-padding-inline':g.buttonPaddingInline.value+8+'px','--seda-control-extra-padding-inline':'8px'}});
      const actual=await page.locator('.seda-file-upload').evaluate(el=>({font:parseFloat(getComputedStyle(el.querySelector('.seda-file-upload__label')).fontSize),icon:el.querySelector('.seda-icon').getBoundingClientRect().width,x:parseFloat(getComputedStyle(el).paddingInlineStart),y:parseFloat(getComputedStyle(el).paddingBlockStart),height:el.getBoundingClientRect().height}));
      near(actual.font,font,'derived font');near(actual.icon,icon,'derived icon');near(actual.y,py,'base Y + 6');near(actual.x,variant==='inline'?8:(variant==='button'?g.buttonPaddingInline.value:g.textFieldPaddingInline.value)+8,'base X + 8');parametric.push({theme,size,variant,...actual});
    }
    await configure({error:'   '});assert.equal(await page.locator('#upload').getAttribute('aria-invalid'),null);
    await configure({error:'Rejected file'});assert.equal(await page.locator('#upload').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#upload-message').textContent(),'Rejected file');
    const errorBackground=await page.locator('.seda-file-upload').evaluate(el=>getComputedStyle(el).backgroundColor);
    await page.locator('.seda-file-upload').hover();assert.equal(await page.locator('.seda-file-upload').evaluate(el=>getComputedStyle(el).backgroundColor),errorBackground);
    await page.mouse.move(0,0);
    await configure({error:'Rejected file',state:'disabled'});assert.equal(await page.locator('#upload').getAttribute('aria-invalid'),null);assert.equal(await page.locator('#upload-message').textContent(),'PNG or text');
    await configure({ariaLabel:'Import reference'});assert.equal(await page.getByRole('button',{name:'Import reference',exact:true}).count(),1);
    for(const [input,expected]of[[-20,0],[35,35],[140,100]]){await configure({state:'uploading',progress:input});assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'),String(expected));}
    for(const value of ['NaN','Infinity']){await page.evaluate(value=>window.configure({state:'uploading',progress:Number(value)}),value);await settle();assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuenow'),null);}
    await configure({});await page.locator('#before').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#upload').evaluate(el=>el===document.activeElement),true);
    const chooser=page.waitForEvent('filechooser');await page.keyboard.press('Space');await (await chooser).setFiles({name:'report.txt',mimeType:'text/plain',buffer:Buffer.from('real file')});await settle();
    assert.deepEqual(await page.evaluate(()=>window.lastFiles),['report.txt']);assert.equal(await page.locator('#upload-message').textContent(),'report.txt');assert.equal(await page.getByRole('button',{name:'Attachment',exact:true}).count(),1);
    async function drop({disabled=false,multiple=false,empty=false}={}){await configure({disabled,multiple});return page.evaluate(({empty})=>{const target=document.querySelector('.seda-file-upload'),data=new DataTransfer();if(!empty){data.items.add(new File(['a'],'a.txt',{type:'text/plain'}));data.items.add(new File(['b'],'b.txt',{type:'text/plain'}));}const before={...window.events};target.dispatchEvent(new DragEvent('dragover',{dataTransfer:data,bubbles:true,cancelable:true}));const prevented=!target.dispatchEvent(new DragEvent('drop',{dataTransfer:data,bubbles:true,cancelable:true}));return{before,after:window.events,names:window.lastFiles,prevented};},{empty});}
    let result=await drop();assert.deepEqual(result.names,['a.txt']);assert.equal(result.after.files,result.before.files+1);
    result=await drop({multiple:true});assert.deepEqual(result.names,['a.txt','b.txt']);
    result=await drop({disabled:true});assert.deepEqual(result.after,result.before);assert.equal(result.prevented,true);
    result=await drop({empty:true});assert.equal(result.after.files,result.before.files);
    await configure({state:'disabled'});let before=await page.evaluate(()=>window.events.files);await page.locator('#upload').setInputFiles({name:'blocked.txt',mimeType:'text/plain',buffer:Buffer.from('a')});assert.equal(await page.evaluate(()=>window.events.files),before);
    await configure({});await page.locator('.seda-file-upload').evaluate(target=>{const data=new DataTransfer();data.items.add(new File(['a'],'a.txt'));target.dispatchEvent(new DragEvent('dragover',{dataTransfer:data,bubbles:true,cancelable:true}));});await settle();assert.equal(await page.locator('.seda-file-upload').getAttribute('data-state'),'drag-over');
    await configure({disabled:true});await configure({});assert.equal(await page.locator('.seda-file-upload').getAttribute('data-state'),'default');
    const long='длинное-имя-файла-'.repeat(25)+'.txt';await configure({width:180});await page.locator('#upload').setInputFiles({name:long,mimeType:'text/plain',buffer:Buffer.from('a')});assert.equal(await page.locator('.seda-file-upload').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
    await page.emulateMedia({reducedMotion:'reduce'});await configure({state:'uploading'});assert.equal(await page.locator('.seda-file-upload__progress-fill').evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.emulateMedia({forcedColors:'active'});await configure({});await page.locator('#before').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('.seda-file-upload').evaluate(el=>getComputedStyle(el).outlineWidth),'2px');assert.notEqual(await page.locator('.seda-icon').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
    assert.deepEqual(errors,[]);
    return{installedPackage:true,sourceAlias:false,matrixSamples:samples.length,samples,parametric,keyboardChooser:true,realFileSelection:true,dropSingleMultiple:true,disabledNoCallbacks:true,namingAndDescription:true,finiteAndIndeterminateProgress:true,longNameWrap:true,reducedMotion:true,forcedColorsFocusAndIcon:true,errors};
  } finally {await page.close();await new Promise(resolve=>server.close(resolve));}
}
