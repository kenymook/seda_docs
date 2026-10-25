import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {textContrast} from './verify-colors.mjs';

export async function verifyFeedback({cwd,browser}) {
  const profiles=JSON.parse(await fs.readFile(path.join(cwd,'node_modules/@seda-ai/ui/dist/profiles.json'),'utf8'));
  const icons=JSON.parse(await fs.readFile(createRequire(path.join(cwd,'package.json')).resolve('@seda-ai/ui/icons.json'),'utf8'));
  assert.equal(icons.icons.length,26);
  assert.equal(new Set(icons.icons.map(icon=>icon.file)).size,25);
  assert.ok(icons.icons.every(icon=>/^[a-f0-9]{64}$/.test(icon.sha256)));
  await fs.writeFile(path.join(cwd,'feedback-entry.mjs'),`
    import React from 'react';import {createRoot} from 'react-dom/client';
    import {SedaProvider,Icon,Alert,Toast,Tag,Badge,Button} from '@seda-ai/ui';import '@seda-ai/ui/styles.css';
    const h=React.createElement,root=createRoot(document.getElementById('root'));let options={};window.events={selected:0,tagDismiss:0,action:0,dismiss:0};
    function render(){const tone=options.tone||'neutral',severity=tone==='danger'?'error':tone==='brand'||tone==='disabled'||tone==='neutral'?'info':tone;
      root.render(h(SedaProvider,{theme:options.theme||'light',controlSize:options.size||'m',style:options.geometry},h('main',{style:{width:options.width||440,padding:8}},
        h(Button,{id:'brand',variant:'primary'},'Save'),
        h(Badge,{id:'badge',tone,count:options.count??142,variant:options.badgeVariant||'count',label:options.badgeLabel??'Queued',icon:h(Icon,{name:'info'}),accessibleLabel:'Pending items'}),
        h(Tag,{id:'tag',tone:tone==='disabled'?'neutral':tone,type:options.tagType||'selectable',disabled:options.disabled||tone==='disabled',selected:options.selected||false,dismissible:true,badgeValue:0,leadingIcon:h(Icon,{name:'user'}),dismissLabel:'Remove tag',onSelectedChange:next=>{window.events.selected++;options.selected=next;render();},onDismiss:options.unbound?undefined:()=>window.events.tagDismiss++},options.long?'Long tag label '.repeat(30):'Owner'),
        h(Alert,{id:'alert',variant:severity,title:'Status message',description:options.description??'Helpful explanation',showIcon:options.showIcon!==false,dismissible:options.close!==false,actionLabel:'Review',onAction:options.unbound?undefined:()=>window.events.action++,onDismiss:options.unbound||options.close===false?undefined:()=>window.events.dismiss++}),
        h(Toast,{id:'toast',intent:severity==='ai'?'info':tone==='neutral'?'neutral':severity,title:'Notification',description:options.description??'Local message',showIcon:options.showIcon!==false,dismissible:options.close!==false,actionLabel:'Undo',duration:null,onAction:options.unbound?undefined:()=>window.events.action++,onDismiss:options.unbound||options.close===false?undefined:()=>window.events.dismiss++})
      )));
    }
    window.configure=next=>{options=next;render();};window.configure({});
  `);
  await build({absWorkingDir:cwd,entryPoints:['feedback-entry.mjs'],outdir:path.join(cwd,'feedback-web'),bundle:true,format:'esm'});
  const js=await fs.readFile(path.join(cwd,'feedback-web/feedback-entry.js')),css=await fs.readFile(path.join(cwd,'feedback-web/feedback-entry.css'));
  const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const page=await browser.newPage({viewport:{width:1000,height:900}}),errors=[],samples=[],parametric=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const configure=async options=>{await page.evaluate(options=>window.configure(options),options);await settle();};
  const near=(a,b,label)=>assert.ok(Math.abs(a-b)<=1,`${label}: ${a} != ${b}`);
  const measure=()=>page.evaluate(()=>{
    const paints=[];
    for(const element of document.querySelectorAll('#brand,#badge,#tag .seda-tag__label,#tag .seda-tag__badge,#alert .seda-alert__title,#alert .seda-alert__description,#alert .seda-alert__action,#toast .seda-toast__title,#toast .seda-toast__description,#toast .seda-toast__action')){
      const backgrounds=[];for(let ancestor=element;ancestor;ancestor=ancestor.parentElement)backgrounds.push(getComputedStyle(ancestor).backgroundColor);
      const css=getComputedStyle(element);paints.push({part:element.id||element.className,color:css.color,backgrounds,font:parseFloat(css.fontSize),line:parseFloat(css.lineHeight)});
    }
    const glyphs=Array.from(document.querySelectorAll('#tag .seda-icon,#alert .seda-alert__icon .seda-icon,#toast .seda-toast__icon .seda-icon')).map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));
    return {paints,glyphs,tagOverflow:document.querySelector('#tag').scrollWidth>document.querySelector('#tag').clientWidth+1};
  });
  try{
    await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#brand').waitFor();
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const tone of ['neutral','brand','info','success','warning','danger','ai','disabled'])for(const tagType of ['read-only','selectable','interactive']){
      await configure({theme,size,tone,tagType});const actual=await measure(),g=profiles.profiles[theme+':'+size].geometry;
      for(const paint of actual.paints){if(paint.part!=='seda-tag__badge')near(paint.font,g.fontSize.value,'shared font '+paint.part);if(tone!=='disabled'||!['badge','seda-tag__label','seda-tag__badge'].includes(paint.part)){const ratio=textContrast(paint.color,paint.backgrounds);assert.ok(ratio>=4.5,`${theme}/${size}/${tone}/${tagType}/${paint.part} contrast ${ratio}`);paint.contrast=ratio;}}
      for(const glyph of actual.glyphs){near(glyph.width,g.iconSize.value,'shared glyph width');near(glyph.height,g.iconSize.value,'shared glyph height');}
      assert.equal(await page.locator('#tag .seda-tag__badge').textContent(),'0');assert.equal(actual.tagOverflow,false);
      assert.equal(await page.locator('#toast').getAttribute('role'),tone==='danger'?'alert':'status');
      samples.push({theme,size,tone,tagType,...actual});
    }
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl']){
      const g=profiles.profiles[theme+':'+size].geometry,font=Math.round(g.fontSize.value*1.5),line=Math.round(g.lineHeight.value*1.5),icon=Math.round(g.iconSize.value*1.5),py=(g.height.value-g.lineHeight.value-2*g.borderWidth.value)/2+6;
      await configure({theme,size,geometry:{'--seda-control-font-size':font+'px','--seda-control-line-height':line+'px','--seda-control-icon-size':icon+'px','--seda-control-height':Math.max(line,icon)+py*2+2*g.borderWidth.value+'px','--seda-control-padding-block':py+'px','--seda-control-extra-padding-inline':'8px','--seda-control-extra-padding-block':'6px','--seda-control-field-padding-inline':g.textFieldPaddingInline.value+8+'px'}});
      const actual=await measure();for(const p of actual.paints)if(p.part!=='seda-tag__badge')near(p.font,font,'scaled feedback font');for(const glyph of actual.glyphs)near(glyph.width,icon,'scaled glyph');parametric.push({theme,size,font,icon});
    }
    const brandStates=[];
    for(const theme of ['light','dark']){await configure({theme});const button=page.locator('#brand');const colors=[];for(const state of ['default','hover','pressed']){if(state==='hover')await button.hover();if(state==='pressed')await page.mouse.down();await button.evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished.catch(()=>{}))));try{const actual=(await measure()).paints.find(p=>p.part==='brand');const ratio=textContrast(actual.color,actual.backgrounds);assert.ok(ratio>=4.5,`brand ${theme}/${state} contrast`);colors.push(actual.backgrounds[0]);brandStates.push({theme,state,contrast:ratio});}finally{if(state==='pressed')await page.mouse.up();}}assert.equal(new Set(colors).size,3,JSON.stringify({theme,colors}));await page.mouse.move(0,0);}
    await configure({});const main=page.locator('#tag .seda-tag__main');await main.focus();let before=await page.evaluate(()=>({...window.events}));await page.keyboard.press('Space');assert.equal(await main.getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(()=>window.events.selected),before.selected+1);
    await page.locator('#tag .seda-tag__dismiss').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.events.selected),before.selected+1);assert.equal(await page.evaluate(()=>window.events.tagDismiss),before.tagDismiss+1);assert.equal(await page.locator('button button,[role=button] button').count(),0);
    await configure({disabled:true});before=await page.evaluate(()=>({...window.events}));await page.locator('#tag .seda-tag__main').evaluate(el=>el.click());await page.locator('#tag .seda-tag__dismiss').evaluate(el=>el.click());assert.deepEqual(await page.evaluate(()=>window.events),before);
    await configure({unbound:true});for(const selector of ['#tag .seda-tag__dismiss','#alert .seda-alert__action','#alert .seda-alert__dismiss','#toast .seda-toast__action','#toast .seda-toast__dismiss'])assert.equal(await page.locator(selector).isDisabled(),true);
    for(const showIcon of [true,false])for(const close of [true,false]){
      await configure({showIcon,close});for(const id of ['alert','toast']){const b=await page.locator('#'+id).evaluate(el=>{const s=getComputedStyle(el),content=el.querySelector('[class$="__content"]').getBoundingClientRect(),r=el.getBoundingClientRect();return{left:content.left-r.left,right:r.right-content.right,padding:parseFloat(s.paddingInlineStart),border:parseFloat(s.borderLeftWidth),columns:s.gridTemplateColumns.split(' ').length};});assert.equal(b.columns,1+Number(showIcon)+Number(close));if(!showIcon)near(b.left,b.padding+b.border,'no phantom icon slot');if(!close)near(b.right,b.padding+b.border,'no phantom dismiss slot');}
    }
    await configure({description:0,badgeVariant:'label',badgeLabel:0});assert.equal(await page.locator('#badge').textContent(),'0');assert.equal(await page.locator('.seda-alert__description').textContent(),'0');assert.equal(await page.locator('.seda-toast__description').textContent(),'0');
    await configure({count:0});assert.equal(await page.locator('#badge').count(),0);
    for(const badgeVariant of ['dot','icon']){await configure({badgeVariant});const box=await page.locator('#badge').boundingBox();near(box.width,box.height,'badge square/circle');}
    await configure({width:180,long:true});assert.equal(await page.locator('#tag').evaluate(el=>el.getBoundingClientRect().width<=180),true);
    await configure({theme:'dark'});await page.screenshot({path:path.join(cwd,'feedback-dark.png')});
    await page.emulateMedia({forcedColors:'active'});await page.locator('#tag .seda-tag__main').focus();assert.equal(await page.locator('#tag .seda-tag__main').evaluate(el=>getComputedStyle(el).outlineWidth),'2px');assert.notEqual(await page.locator('.seda-alert__icon .seda-icon').evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
    assert.deepEqual(errors,[]);
    return{installedPackage:true,sourceAlias:false,icons:icons.icons.length,samples,parametric,brandStates,nativeSelectionOnce:true,dismissDoesNotSelect:true,noNestedButtons:true,disabledAndUnboundGuards:true,noPhantomSlots:true,zeroContent:true,forcedColors:true,errors};
  }finally{await page.close();await new Promise(resolve=>server.close(resolve));}
}
