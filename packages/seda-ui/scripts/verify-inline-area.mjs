import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {createContractEngine,deriveControlGeometry} from '../../seda-contracts/src/index.mjs';
import {createWebBindings,createTextAreaWebBindings} from '../../seda-contracts/src/web.mjs';
const near=(a,b,message)=>assert.ok(Math.abs(a-b)<=1,`${message}: ${a} / ${b}`);
export async function verifyInlineArea({cwd,browser}){
 const engine=createContractEngine();
 await fs.writeFile(path.join(cwd,'inline-area-entry.mjs'),`
import React,{useState,useEffect}from'react';import{createRoot}from'react-dom/client';import{SedaProvider,Button,Icon,IconButton,TextField,TextArea}from'@seda-ai/ui';import'@seda-ai/ui/styles.css';const h=React.createElement;
function App(){const[c,set]=useState({theme:'light',size:'m',parameters:{}}),[value,change]=useState('Рабочее описание');useEffect(()=>{window.configureInline=next=>set(old=>({...old,...next}));return()=>delete window.configureInline;},[]);
return h(SedaProvider,{theme:c.theme,controlSize:c.size,controlParameters:c.parameters,style:{padding:24,minHeight:600}},h('main',{style:{display:'grid',gap:24,maxWidth:680}},h('div',{style:{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}},h(Button,{id:'inline',variant:'text',loading:c.loading,disabled:c.disabled,iconLeft:h(Icon,{name:'add'}),iconRight:h(Icon,{name:'arrow-chevron-down'}),style:c.buttonBinding,...c.attributes},'Добавить'),h(Button,{id:'empty',variant:'text',iconLeft:false,iconRight:h(React.Fragment)},'Действие'),h(Button,{id:'regular'},'Сохранить'),h(IconButton,{id:'square','aria-label':'Настройки',icon:h(Icon,{name:'settings'})})),h(TextField,{label:'Название',defaultValue:'Atlas'}),h(TextArea,{id:'inline-area',label:'Описание проекта',helperText:'Укажите контекст для команды',value,onChange:e=>change(e.target.value),clearable:true,onClear:()=>change(''),showCount:true,maxLength:500,rows:3,autoResize:!!c.auto,maxRows:c.auto?4:undefined,resize:'none',disabled:c.disabled,readOnly:c.readOnly,errorText:c.error?'Объясните изменение':undefined,style:{...c.areaBinding,...(c.fixed?{height:c.fixed}:{})}})));}
createRoot(document.getElementById('root')).render(h(React.StrictMode,null,h(App)));
 `);
 const bundle=await build({absWorkingDir:cwd,entryPoints:['inline-area-entry.mjs'],outdir:path.join(cwd,'inline-area-web'),bundle:true,format:'esm',metafile:true});
 assert.ok(Object.keys(bundle.metafile.inputs).some(file=>file.includes('node_modules/@seda-ai/ui/dist/components/TextArea/TextArea.js')));
 const js=await fs.readFile(path.join(cwd,'inline-area-web/inline-area-entry.js')),css=await fs.readFile(path.join(cwd,'inline-area-web/inline-area-entry.css'));
 const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><meta charset="utf-8"><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"><div id="root"></div><script type="module" src="/app.js"></script>');});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const page=await browser.newPage({viewport:{width:1024,height:1000}}),errors=[],samples=[],loading=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const frame=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const configure=async value=>{await page.evaluate(v=>window.configureInline(v),value);await frame();};
 const box=()=>page.locator('#inline').boundingBox();
 try{
  await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.configureInline);await page.evaluate(()=>document.fonts.ready);
  for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const parameters of [{},{scale:80,preserveMinimumHeight:false},{scale:150,extraPaddingInline:14,extraPaddingBlock:6,radiusScale:1.25}])for(const bound of [false,true]){
   const profile=structuredClone(engine.bundle.profile);profile.recipes.cancel.props.variant='text';
   const compiled=engine.compile(profile,{overrides:{theme,controlSize:size},controlParameters:parameters}),binding=createWebBindings(compiled).recipes.cancel;
   const area=createTextAreaWebBindings(engine.compileControl('TextArea',{label:'Описание проекта',size},{theme,controlParameters:parameters}));
   await configure({theme:theme.toLowerCase(),size,parameters,loading:false,disabled:false,readOnly:false,error:false,auto:false,fixed:undefined,buttonBinding:bound?binding.vars:undefined,attributes:bound?binding.attributes:undefined,areaBinding:bound?area.vars:undefined});
   const e=compiled.instances.cancel.parametric,g=compiled.geometry;
   near((await box()).height,e.height,'inline action source height');
   assert.equal(await page.locator('.seda-textarea__header').count(),1,'Clear belongs beside label in the header');
   const sample=await page.evaluate(()=>{
    const button=document.getElementById('inline'),area=document.getElementById('inline-area'),root=area.closest('.seda-textarea'),header=root.querySelector('.seda-textarea__header'),label=root.querySelector('label'),footer=root.querySelector('.seda-textarea__footer'),clear=root.querySelector('.seda-textarea__clear'),control=root.querySelector('.seda-textarea__control');
    const style=el=>{const s=getComputedStyle(el),b=el.getBoundingClientRect();return{width:b.width,height:b.height,font:parseFloat(s.fontSize),line:parseFloat(s.lineHeight),weight:s.fontWeight,padding:parseFloat(s.paddingInlineStart),border:parseFloat(s.borderTopWidth),gap:parseFloat(s.gap)};};
    return{button:style(button),icon:style(button.querySelector('.seda-button__icon')),label:style(label),helper:style(footer.querySelector('.seda-field__message')),counter:style(footer.querySelector('.seda-textarea__counter')),clear:style(clear),header:style(header),control:style(control),regular:style(document.getElementById('regular')),square:style(document.getElementById('square')),emptySlots:document.querySelectorAll('#empty .seda-button__icon').length,labelGap:control.getBoundingClientRect().top-header.getBoundingClientRect().bottom,helperGap:footer.getBoundingClientRect().top-control.getBoundingClientRect().bottom,clearOutside:!control.contains(clear),labelText:label.textContent};
   });
   near(sample.button.height,e.height,'inline height');near(sample.button.padding,e.buttonPaddingX,'inline X');near(sample.icon.height,e.icon,'inline icon');assert.equal(sample.button.weight,'400');assert.equal(sample.button.border,0);assert.equal(sample.emptySlots,0);assert.equal(sample.clearOutside,true);assert.equal(sample.labelText,'Описание проекта');near(sample.labelGap,4,'header gap');near(sample.helperGap,4,'footer gap');
   for(const key of ['label','helper','counter']){near(sample[key].font,compiled.parametric.font,key+' font');near(sample[key].line,compiled.parametric.line,key+' line');assert.equal(sample[key].weight,'400');}
   near(sample.clear.height,e.height,'real inherited inline Clear');near(sample.regular.height,compiled.parametric.height,'regular unchanged');near(sample.square.height,sample.square.width,'IconButton square');near(sample.control.height,compiled.parametric.height+2*compiled.parametric.line,'rows3');
   if(!bound&&size==='m'&&parameters.scale===150)await page.screenshot({path:path.join(cwd,'inline-area-'+theme.toLowerCase()+'.png'),fullPage:true});
   const before=await box();await configure({loading:true});await configure({parameters:{...parameters,scale:200,extraPaddingInline:24,extraPaddingBlock:12}});const pending=await box();near(pending.width,before.width,'loading width');near(pending.height,before.height,'loading height');
   const spinner=page.locator('#inline .seda-button__spinner'),spin=await spinner.boundingBox(),layout=await spinner.evaluate(el=>({width:el.offsetWidth,height:el.offsetHeight}));near(spin.x+spin.width/2,pending.x+pending.width/2,'spinner X');near(spin.y+spin.height/2,pending.y+pending.height/2,'spinner Y');
   // A rotated square's AABB exceeds its circular border paint. Check its layout diameter.
   assert.ok(layout.width<=pending.width&&layout.height<=pending.height,JSON.stringify({theme,size,parameters,bound,spin,layout,pending}));loading.push({theme,size,bound,before,pending,spin,layout});samples.push({theme,size,parameters,bound,sourceLine:g.lineHeight.value,...sample});
  }
  await configure({theme:'light',size:'m',parameters:{},loading:false,buttonBinding:undefined,attributes:undefined,areaBinding:undefined,fixed:280});
  const area=page.locator('#inline-area'),root=page.locator('.seda-textarea');const fixed=await root.boundingBox();near(fixed.height,280,'host fill height');const inner=await area.boundingBox();assert.ok(inner.height>190,'textarea must fill remaining parent allocation');
  const clear=root.getByRole('button',{name:'Очистить',exact:true});await clear.click();assert.equal(await area.inputValue(),'');assert.equal(await clear.isDisabled(),true);assert.equal(await area.evaluate(el=>document.activeElement===el),true);near((await root.boundingBox()).height,280,'clear retains parent size');
  await area.fill('one\ntwo\nthree\nfour\nfive\nsix');await configure({auto:true});const capped=await area.boundingBox();assert.ok(capped.height<inner.height,'autoResize owns input height even in fixed parent');assert.equal(await area.evaluate(el=>getComputedStyle(el).overflowY),'auto');
  for(const state of ['readOnly','disabled','error']){await configure({auto:false,fixed:undefined,readOnly:state==='readOnly',disabled:state==='disabled',error:state==='error'});if(state!=='error')assert.equal(await clear.isDisabled(),true);else{await area.focus();assert.equal(await area.getAttribute('aria-invalid'),'true');assert.equal(await root.locator('.seda-textarea__control').evaluate(el=>getComputedStyle(el).outlineWidth),'2px');}}
  assert.deepEqual(errors,[]);const result={installedPackage:true,sourceAlias:false,samples,loading,fixedParent:280,autoResizeOwnership:true,stableClearHeader:true,emptySlotsOmitted:true,errors};await fs.writeFile(path.join(cwd,'inline-area-results.json'),JSON.stringify(result,null,2)+'\n');return result;
 }catch(error){await fs.writeFile(path.join(cwd,'inline-area-failure.json'),JSON.stringify({error:error.stack,errors},null,2)+'\n');throw error;}finally{await page.close();await new Promise(resolve=>server.close(resolve));}
}
