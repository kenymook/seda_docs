import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {createContractEngine} from '../../seda-contracts/src/index.mjs';
import {createWebBindings} from '../../seda-contracts/src/web.mjs';

/** Source observations: D34. This tests the installed package, never a source alias. */
export async function verifyFieldAnatomy({cwd,browser}) {
  const engine=createContractEngine(),recipes={};
  for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const scale of [100,150]) {
    const compiled=engine.compile(undefined,{overrides:{theme,controlSize:size},controlParameters:{scale,extraPaddingInline:scale===150?24:0,extraPaddingBlock:scale===150?12:0}});
    const web=createWebBindings(compiled);
    recipes[theme.toLowerCase()+':'+size+':'+scale]={text:web.recipes.projectName,number:web.controls.NumberField,select:web.controls.Select};
  }
  await fs.writeFile(path.join(cwd,'field-anatomy-recipes.json'),JSON.stringify(recipes));
  await fs.writeFile(path.join(cwd,'field-anatomy-entry.mjs'),`
    import React,{useState,useEffect}from'react';import{createRoot}from'react-dom/client';
    import{SedaProvider,TextField,NumberField,Select,Icon,Button,Checkbox}from'@seda-ai/ui';import'@seda-ai/ui/styles.css';import recipes from'./field-anatomy-recipes.json';
    const h=React.createElement;
    function App(){const[c,set]=useState({theme:'light',size:'m',scale:100,state:'default'}),[value,update]=useState('Atlas');
      useEffect(()=>{window.configure=p=>set(v=>({...v,...p}));},[]);
      const recipe=recipes[c.theme+':'+c.size+':'+c.scale],disabled=c.state==='disabled',errorText=c.state==='error'?'Check the value':undefined;
      const select=id=>h(Select,{id,label:'Access',helperText:'Visible helper',errorText,disabled,value:'a',options:[{value:'a',label:'Private'},{value:'b',label:'Team'}],onValueChange:()=>{}});
      const field=(id,number=false,props={})=>h(number?NumberField:TextField,{id,label:'Workspace',helperText:'Visible helper',errorText,disabled,prefix:number?'EUR':h(Icon,{name:'search'}),suffix:number?'px':h(Icon,{name:'search'}),...(number?{value:'12',onValueChange:()=>{}}:{value,onChange:e=>update(e.target.value)}),...props});
      return h(SedaProvider,{theme:c.theme,controlSize:c.size,controlParameters:{scale:c.scale,extraPaddingInline:c.scale===150?24:0,extraPaddingBlock:c.scale===150?12:0}},
        h('main',null,field('public'),h('div',{...recipe.text.attributes,style:recipe.text.vars},field('bound')),
        field('number',true),h('div',{...recipe.number.attributes,style:recipe.number.vars},field('bound-number',true)),
        select('select'),h('div',{...recipe.select.attributes,style:recipe.select.vars},select('bound-select')),field('local-s',false,{size:'s'}),field('no-message',false,{helperText:undefined,errorText:undefined}),
        h('div',{style:{width:190}},field('multiline',false,{helperText:'A longer explanation must wrap naturally and remain completely visible without a fixed root height.',errorText:undefined})),
        h(Button,{id:'action',iconLeft:h(Icon,{name:'add'})},'Create'),h(Checkbox,{id:'choice',label:'Selection',checked:false,onCheckedChange:()=>{}})));
    }createRoot(document.getElementById('root')).render(h(App));
  `);
  await build({absWorkingDir:cwd,entryPoints:['field-anatomy-entry.mjs'],outdir:path.join(cwd,'field-anatomy-web'),bundle:true,format:'esm'});
  const js=await fs.readFile(path.join(cwd,'field-anatomy-web/field-anatomy-entry.js')),css=await fs.readFile(path.join(cwd,'field-anatomy-web/field-anatomy-entry.css'));
  const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"><style>body{margin:0}main{padding:24px;display:grid;grid-template-columns:1fr 1fr;align-items:start;gap:24px}.seda-provider{min-height:100vh}</style></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const page=await browser.newPage({viewport:{width:1280,height:1300}}),samples=[],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const measure=()=>page.evaluate(()=>{
    const rect=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};
    return ['public','bound','number','bound-number','select','bound-select','local-s','no-message','multiline'].map(id=>{
      const input=document.getElementById(id),root=input.closest('.seda-field'),label=root.querySelector('.seda-field__label'),control=root.querySelector('.seda-field__control'),message=root.querySelector('.seda-field__message'),lc=getComputedStyle(label),mc=message&&getComputedStyle(message),cc=getComputedStyle(control);
      return{id,root:rect(root),control:rect(control),label:rect(label),message:message&&rect(message),labelFont:parseFloat(lc.fontSize),labelLine:parseFloat(lc.lineHeight),labelWeight:lc.fontWeight,messageFont:mc&&parseFloat(mc.fontSize),messageLine:mc&&parseFloat(mc.lineHeight),messageWeight:mc?.fontWeight,labelGap:control.getBoundingClientRect().top-label.getBoundingClientRect().bottom,messageGap:message&&message.getBoundingClientRect().top-control.getBoundingClientRect().bottom,contentGap:parseFloat(cc.columnGap),affixes:[...root.querySelectorAll('.seda-field__affix')].map(e=>({background:getComputedStyle(e).backgroundColor,font:parseFloat(getComputedStyle(e).fontSize)}))};
    });
  });
  try {
    await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>!!window.configure);
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const scale of [100,150])for(const state of ['default','error','disabled']) {
      await page.evaluate(c=>window.configure(c),{theme,size,scale,state});await settle();
      const fields=await measure();samples.push({theme,size,scale,state,fields});
      // Persist measurements before assertions so the old package is a useful negative control.
      await fs.writeFile(path.join(cwd,'field-anatomy-partial.json'),JSON.stringify({samples,errors},null,2)+'\n');
      for(const f of fields){
        const effective=f.id==='local-s'?'s':size,preset={s:{font:12,line:16,height:24},m:{font:14,line:20,height:32},l:{font:16,line:24,height:40},xl:{font:18,line:28,height:48}}[effective];
        const font=Math.round(preset.font*scale/100),line=Math.round(preset.line*scale/100),height=preset.height+(line-preset.line)+(scale===150?24:0);
        assert.equal(f.labelWeight,'400',f.id+' label uses source Regular, not action Semibold');
        assert.equal(f.labelFont,font);assert.equal(f.labelLine,line);assert.ok(Math.abs(f.control.height-height)<=1);
        assert.equal(f.labelGap,4,f.id+' label/control gap');if(!f.id.includes('select'))assert.equal(f.contentGap,6,f.id+' source content gap');
        for(const affix of f.affixes)assert.equal(affix.background,'rgba(0, 0, 0, 0)',f.id+' affix has no separate surface');
        if(f.message){assert.equal(f.messageFont,font);assert.equal(f.messageLine,line);assert.equal(f.messageWeight,'400');assert.equal(f.messageGap,4);assert.ok(Math.abs(f.root.height-(f.label.height+f.control.height+f.message.height+8))<=1);}
        else assert.ok(Math.abs(f.root.height-(line+height+4))<=1,'Missing message leaves no trailing gap');
        if(f.id==='multiline'){assert.ok(f.message.height>line,'Long helper wraps');assert.ok(f.message.bottom<=f.root.bottom+1,'Root grows with helper');}
      }
      const unchanged=await page.evaluate(()=>{const b=document.getElementById('action'),c=document.getElementById('choice').closest('.seda-choice');return{buttonWeight:getComputedStyle(b).fontWeight,buttonGap:parseFloat(getComputedStyle(b).columnGap),choiceGap:parseFloat(getComputedStyle(c).columnGap)};});
      assert.equal(unchanged.buttonWeight,'600');assert.equal(unchanged.buttonGap,8);assert.equal(unchanged.choiceGap,scale===150?32:8,'Field anatomy must not alter choice geometry');
      if(size==='m'&&state==='default')await page.screenshot({path:path.join(cwd,'field-anatomy-'+theme+'-'+scale+'.png'),fullPage:true});
    }
    const pickerSamples=[];
    for(const theme of ['light','dark']){
      await page.evaluate(c=>window.configure(c),{theme,size:'m',scale:100,state:'default'});await settle();
      const sample=await page.locator('#select').evaluate(select=>{
        const provider=select.closest('.seda-provider'),option=select.selectedOptions[0],swatch=document.createElement('span');provider.append(swatch);
        const resolve=(property,target)=>{swatch.style[target]=`var(${property})`;const value=getComputedStyle(swatch)[target];swatch.style[target]='';return value;};
        const expected=resolve('--select-dropdown-surface','backgroundColor'),selectedExpected=resolve('--select-option-surface-selected','backgroundColor'),selectedTextExpected=resolve('--select-option-foreground-selected','color');swatch.remove();
        return{supported:CSS.supports('appearance','base-select')&&CSS.supports('selector(::picker(select))'),scheme:getComputedStyle(select).colorScheme,picker:getComputedStyle(select,'::picker(select)').backgroundColor,expected,selected:getComputedStyle(option).backgroundColor,selectedExpected,selectedText:getComputedStyle(option).color,selectedTextExpected};
      });
      assert.equal(sample.scheme,theme,'Native picker receives theme');
      if(sample.supported){
        assert.equal(sample.picker,sample.expected,'Picker uses opaque overlay role, not translucent trigger');
        assert.match(sample.picker,/^rgb\(/,'Picker surface must be opaque');
        assert.equal(sample.selected,sample.selectedExpected,'Selected option uses own surface role');
        assert.equal(sample.selectedText,sample.selectedTextExpected,'Selected option text uses contrast role');
        const iconMetrics=()=>page.locator('#select').evaluate(select=>{const control=select.parentElement,slot=control.querySelector('.seda-select__arrow'),glyph=slot.querySelector('[data-seda-icon]'),box=control.getBoundingClientRect(),arrow=slot.getBoundingClientRect();return{selectHeight:box.height,iconHeight:arrow.height,top:arrow.top-box.top,center:arrow.top-box.top+arrow.height/2,transform:getComputedStyle(glyph).transform,nativeDisplay:getComputedStyle(select,'::picker-icon').display,icon:glyph.dataset.sedaIcon};});
        const closed=await iconMetrics();assert.equal(closed.nativeDisplay,'none');assert.equal(closed.icon,'arrow-chevron-down');assert.ok(Math.abs(closed.center-closed.selectHeight/2)<=1,JSON.stringify({theme,closed}));
        await page.locator('#select').click();
        await page.waitForTimeout(200);
        const opened=await iconMetrics();assert.equal(await page.locator('#select').evaluate(select=>select.matches(':open')),true);assert.ok(Math.abs(opened.center-opened.selectHeight/2)<=1,JSON.stringify({theme,opened}));assert.ok(Math.abs(opened.center-closed.center)<=1,JSON.stringify({theme,closed,opened}));assert.notEqual(opened.transform,closed.transform);
        await page.screenshot({path:path.join(cwd,'select-picker-'+theme+'.png')});
        await page.keyboard.press('Escape');
        sample.pickerIcon={closed,opened};
      }
      pickerSamples.push({theme,...sample});
    }
    await page.evaluate(()=>window.configure({state:'default'}));await settle();
    await page.locator('#public').fill('A draft');await page.locator('#public').evaluate(n=>{window.retainedField=n;n.setSelectionRange(2,5);});
    await page.evaluate(()=>window.configure({theme:'light',scale:100,size:'m',state:'default'}));await settle();
    assert.equal(await page.locator('#public').evaluate(n=>n===window.retainedField&&n===document.activeElement&&n.value==='A draft'&&n.selectionStart===2&&n.selectionEnd===5),true);
    assert.deepEqual(errors,[]);const result={installedPackage:true,sourceAlias:false,cases:samples.length,fieldRecords:samples.length*9,samples,pickerSamples,focusCaretValueRetained:true,errors};
    await fs.writeFile(path.join(cwd,'field-anatomy-results.json'),JSON.stringify(result,null,2)+'\n');return{cases:result.cases,fieldRecords:result.fieldRecords,focusCaretValueRetained:true,errors};
  } catch(error){await page.screenshot({path:path.join(cwd,'field-anatomy-failure.png'),fullPage:true});throw error;}
  finally{await page.close();await new Promise(resolve=>server.close(resolve));}
}
