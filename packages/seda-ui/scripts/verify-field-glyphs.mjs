import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {createContractEngine} from '../../seda-contracts/src/index.mjs';
import {createWebBindings} from '../../seda-contracts/src/web.mjs';
import {textContrast} from './verify-colors.mjs';

/** Installed consumer: the compiler is only an independent, Node-side colour oracle. */
export async function verifyFieldGlyphs({cwd,browser}){
 const engine=createContractEngine(),recipes={};
 for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const scale of [100,150]){
  const compiled=engine.compile(undefined,{overrides:{theme,controlSize:size},controlParameters:{scale,extraPaddingInline:scale===150?24:0,extraPaddingBlock:scale===150?12:0}});
  recipes[theme.toLowerCase()+':'+size+':'+scale]={...createWebBindings(compiled).recipes.projectName,expectedIcon:Math.round(compiled.geometry.iconSize.value*scale/100)};
 }
 await fs.writeFile(path.join(cwd,'field-glyph-recipes.json'),JSON.stringify(recipes));
 await fs.writeFile(path.join(cwd,'field-glyph-entry.mjs'),`
 import React,{useState,useEffect}from'react';import{createRoot}from'react-dom/client';
 import{SedaProvider,TextField,NumberField,Icon,Search}from'@seda-ai/ui';import'@seda-ai/ui/styles.css';import recipes from'./field-glyph-recipes.json';
 const h=React.createElement,labels={clear:'Clear',empty:'Empty',typing:'Typing',loading:'Loading',noResults:'No results',retry:'Retry',resultCount:n=>'Results: '+n};
 function Consumer(){const[c,set]=useState({theme:'light',size:'m',state:'default',scale:100}),[values,update]=useState({});useEffect(()=>{window.configure=p=>set(v=>({...v,...p}));},[]);
  const recipe=recipes[c.theme+':'+c.size+':'+c.scale],disabled=c.state==='disabled',errorText=c.state==='error'?'Review the value':undefined;
  const mark=kind=>kind==='svg'?h('svg',{'aria-hidden':true,viewBox:'0 0 24 24'},h('circle',{cx:12,cy:12,r:8,fill:'currentColor'})):h(Icon,{name:'search'});
  const fields=mode=>h('section',{'data-mode':mode,key:mode},h('h2',null,mode),...['icon','svg','number','text'].map(kind=>{
   const id=mode+'-'+kind,number=kind==='number',value=values[id]??(number?'120':'Atlas');
   const props={id,label:kind,disabled,errorText,prefix:kind==='text'?'EUR':mark(kind),suffix:kind==='text'?'px':mark(kind),value,...(number?{onValueChange:v=>update(s=>({...s,[id]:v}))}:{onChange:e=>{const value=e.target.value;update(s=>({...s,[id]:value}));}})};
   return h('div',{key:kind,...(mode==='bound'?{...recipe.attributes,style:recipe.vars}:{})},h(number?NumberField:TextField,props));
  }));
  return h(SedaProvider,{theme:c.theme,controlSize:c.size,controlParameters:{scale:c.scale,extraPaddingInline:c.scale===150?24:0,extraPaddingBlock:c.scale===150?12:0}},h('main',null,fields('public'),fields('bound'),
   h(Search,{id:'search',label:'Search owns its icon role',labels,mode:'filter',resultsId:'results',resultCount:0,query:values.search??'',onQueryChange:v=>update(s=>({...s,search:v})),disabled}),h('div',{id:'results'})));
 }createRoot(document.getElementById('root')).render(h(Consumer));
 `);
 await build({absWorkingDir:cwd,entryPoints:['field-glyph-entry.mjs'],outdir:path.join(cwd,'field-glyph-web'),bundle:true,format:'esm'});
 const js=await fs.readFile(path.join(cwd,'field-glyph-web/field-glyph-entry.js')),css=await fs.readFile(path.join(cwd,'field-glyph-web/field-glyph-entry.css'));
 const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"><style>body{margin:0}main{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px}section{display:grid;align-content:start;gap:20px;min-width:0}h2{font:inherit;margin:0}.seda-search{grid-column:1/-1}</style></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const page=await browser.newPage({viewport:{width:1280,height:1100}}),samples=[],errors=[];
 page.on('pageerror',e=>errors.push(e.message));const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const measure=id=>page.locator('#'+id).evaluate(node=>{
  const root=node.closest('.seda-field--text'),surface=node.closest('.seda-field__control'),b=surface.getBoundingClientRect(),s=getComputedStyle(surface);
  return{id:node.id,disabled:node.disabled,font:parseFloat(s.fontSize),family:s.fontFamily,labelFamily:getComputedStyle(root.querySelector('.seda-field__label')).fontFamily,height:b.height,glyphs:[...surface.querySelectorAll('.seda-field__affix > :is(svg,.seda-icon)')].map(glyph=>{const g=glyph.getBoundingClientRect(),c=getComputedStyle(glyph),backgrounds=[];for(let p=glyph.parentElement;p;p=p.parentElement)backgrounds.push(getComputedStyle(p).backgroundColor);return{color:c.color,width:g.width,height:g.height,centerDelta:Math.abs(g.y+g.height/2-b.y-b.height/2),backgrounds};}),affixes:[...root.querySelectorAll('.seda-field__affix')].map(el=>getComputedStyle(el).color)};
 });
 const normalize=colors=>page.evaluate(colors=>Object.fromEntries(Object.entries(colors).map(([key,value])=>{const node=document.createElement('span');node.style.color=value;document.body.append(node);const normalized=getComputedStyle(node).color;node.remove();return[key,normalized];})),colors);
 try{
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.configure);await page.evaluate(()=>document.fonts.ready);
  for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const scale of [100,150])for(const state of ['default','hover','focus','error','disabled']){
   await page.mouse.move(1279,1099);await page.evaluate(()=>document.activeElement?.blur());await page.evaluate(c=>window.configure(c),{theme,size,scale,state});await settle();
   const recipe=recipes[theme+':'+size+':'+scale],vars=recipe.vars,colors=await normalize(Object.fromEntries(['default','active','error','disabled'].map(name=>[name,vars['--seda-icon-'+name]]))),fields=[];
   for(const mode of ['public','bound'])for(const kind of ['icon','svg','number','text']){
    const id=mode+'-'+kind,locator=page.locator('#'+id);await page.evaluate(()=>document.activeElement?.blur());await page.mouse.move(1279,1099);
    if(state==='hover')await locator.hover();if(state==='focus')await locator.focus();await settle();
    const actual=await measure(id),expected=colors[state==='focus'?'active':state==='hover'?'default':state];
    assert.equal(actual.disabled,state==='disabled');
    if(kind!=='text'){
     assert.equal(actual.glyphs.length,2,'Both prefix and suffix glyphs are measured');
     for(const glyph of actual.glyphs){assert.equal(glyph.color,expected,JSON.stringify({theme,size,scale,state,id,glyph,expected}));assert.ok(glyph.centerDelta<=1,'Glyph centred on the actual control');assert.equal(glyph.width,glyph.height);assert.equal(glyph.width,recipe.expectedIcon,'Icon scales with the control');if(!actual.disabled)assert.ok(textContrast(glyph.color,glyph.backgrounds)>=3,'Glyph contrast over its actual affix layers');}
    }else{
     assert.equal(actual.glyphs.length,0,'Text affixes are not treated as icon slots');
     if(mode==='bound'){const {affix}=await normalize({affix:vars['--seda-affix-foreground']});assert.deepEqual(actual.affixes,[affix,affix]);}
    }
    fields.push(actual);
   }
   for(const kind of ['icon','svg','number','text']){const plain=fields.find(f=>f.id==='public-'+kind),bound=fields.find(f=>f.id==='bound-'+kind);assert.equal(bound.family,plain.family,'Compiler bindings retain the public fallback stack');assert.equal(bound.labelFamily,plain.labelFamily,'Labels use the same fallback stack');assert.ok(bound.family.endsWith('sans-serif'));}
   samples.push({theme,size,scale,state,fields});
   if(size==='m'&&scale===100&&state!=='hover')await page.screenshot({path:path.join(cwd,'field-glyph-'+theme+'-'+state+'.png'),fullPage:true});
  }
  // Search owns a separate icon role. A TextField fix must not recolour it.
  const search=[];
  for(const theme of ['light','dark'])for(const focused of [false,true]){
   await page.evaluate(c=>window.configure(c),{theme,size:'m',state:'default',scale:150});await settle();await page.mouse.move(1279,1099);if(focused)await page.locator('#search').focus();else await page.evaluate(()=>document.activeElement?.blur());await settle();
   const actual=await measure('search'),expected=await page.locator('#search').evaluate((el,focused)=>{const token=getComputedStyle(el).getPropertyValue('--search-input-icon-'+(focused?'active':'default'));const span=document.createElement('span');span.style.color=token;document.body.append(span);const color=getComputedStyle(span).color;span.remove();return color;},focused);
   assert.equal(actual.glyphs[0].color,expected,'Search semantic role remains the owner');search.push({theme,focused,...actual});
  }
  await page.locator('#public-icon').fill('A draft');await page.locator('#public-icon').evaluate(node=>{window.retainedGlyphField=node;node.setSelectionRange(2,5);});
  await page.evaluate(()=>window.configure({theme:'dark',scale:100}));await settle();assert.equal(await page.locator('#public-icon').evaluate(node=>node===window.retainedGlyphField&&node===document.activeElement&&node.value==='A draft'&&node.selectionStart===2&&node.selectionEnd===5),true,'Theme/scale changes retain input, focus, value and caret');
  assert.deepEqual(errors,[]);const result={installedPackage:true,sourceAlias:false,samples,search,focusCaretValueRetained:true,errors};await fs.writeFile(path.join(cwd,'field-glyph-results.json'),JSON.stringify(result,null,2)+'\n');return{samples:samples.length,search:search.length,focusCaretValueRetained:true,errors};
 }catch(error){await page.screenshot({path:path.join(cwd,'field-glyph-failure.png'),fullPage:true});throw error;}
 finally{await fs.writeFile(path.join(cwd,'field-glyph-partial.json'),JSON.stringify({samples,errors},null,2)+'\n');await page.close();await new Promise(resolve=>server.close(resolve));}
}
