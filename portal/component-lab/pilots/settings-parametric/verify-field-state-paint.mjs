import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {TextField,NumberField,Select,Icon,SedaProvider} from '@seda-ai/ui';
import {chromium} from 'playwright';

// Distinct assignments prove that component roles, not similarly coloured
// semantic fallbacks, own the actual painted surface throughout interaction.
const css=await fs.readFile('node_modules/@seda-ai/ui/dist/styles.css','utf8');
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const page=await browser.newPage({viewport:{width:1100,height:780}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));let cases=0;
const colors={border:'rgb(91, 22, 131)',surface:'rgb(231, 219, 241)',helper:'rgb(103, 26, 125)',icon:'rgb(123, 33, 149)'};
try {
 await fs.mkdir('.diagnostics-field-state-paint',{recursive:true});
 for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const state of ['default','error','disabled']) {
  const common={size,label:'Workspace',helperText:'Helper',errorText:state==='error'?'Check the value':undefined,disabled:state==='disabled'};
  const markup=renderToStaticMarkup(h(SedaProvider,{theme,size},
   h('main',{style:{padding:24,display:'grid',gap:24}},
    h(TextField,{...common,id:'text',value:'Atlas',onChange:()=>{},prefix:h(Icon,{name:'search'})}),
    h(NumberField,{...common,id:'number',value:'320',onValueChange:()=>{},min:1,max:4096,prefix:h(Icon,{name:'search'}),suffix:'px'}),
    h(Select,{...common,id:'select',defaultValue:'editor',options:[{value:'editor',label:'Editor'},{value:'viewer',label:'Viewer'}]}))));
  await page.setContent(`<style>${css}</style>${markup}`);
  if(size==='m'&&state==='error') {
   await page.locator('#text').focus();
   await page.screenshot({path:`.diagnostics-field-state-paint/${theme}-error.png`});
   await page.locator('#text').evaluate(e=>e.blur());
  }
  for(const id of ['text','number','select']) {
   const root=page.locator('label').filter({has:page.locator('#'+id)});
   const family=id==='select'?'select':'text-field';
   await root.evaluate((e,{family,colors,state})=>{
    for(const [part,value] of Object.entries(colors))e.style.setProperty(`--${family}-${part}-${state}`,value);
   },{family,colors,state});
   const check=async()=>{
    const paint=await root.evaluate(e=>{const c=getComputedStyle(e.querySelector('.seda-field__control'));return {border:c.borderTopColor,surface:c.backgroundColor,helper:getComputedStyle(e.querySelector('.seda-field__message')).color,icon:getComputedStyle(e.querySelector('.seda-icon')??e.querySelector('.seda-select__arrow')).color};});
    assert.equal(paint.border,colors.border,`${theme}/${size}/${state}/${id} border`);
    assert.equal(paint.surface,colors.surface,`${theme}/${size}/${state}/${id} surface`);
    if(state==='error') {assert.equal(paint.helper,colors.helper);if(id!=='select')assert.equal(paint.icon,colors.icon);}
   };
   // Default legitimately changes to hover/focus; validation/disabled must persist.
   await page.mouse.move(0,0);await check();
   if(state!=='default') {
    await root.locator('.seda-field__control').hover();await check();
    if(state!=='disabled') {
     const before=await root.locator('.seda-field__control').boundingBox();
     await page.locator('#'+id).press('Tab');
     await page.locator('#'+id).focus();await check();
     const outline=await root.locator('.seda-field__control').evaluate(e=>getComputedStyle(e).outlineStyle);
     assert.notEqual(outline,'none','error must retain the field focus indicator');
     const after=await root.locator('.seda-field__control').boundingBox();
     assert.equal(after.width,before.width);assert.equal(after.height,before.height);
     const box=await root.locator('.seda-field__control').boundingBox();
     await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await check();await page.mouse.up();
     await page.locator('#'+id).press('Escape');
     await page.locator('#'+id).evaluate(e=>e.blur());
    }
   }
   assert.equal(await page.locator('#'+id).getAttribute('aria-invalid'),state==='error'?'true':null);
   cases++;
  }
 }
 assert.deepEqual(errors,[]);
 console.log(`PASS: ${cases} installed-package field paint cases; Light/Dark, S/M/L/XL, TextField/NumberField/Select, component token overrides persist through hover/focus/press, disabled priority.`);
} finally {await browser.close();}
