import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createElement as h,Fragment} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {TextField,NumberField,Icon,SedaProvider} from '@seda-ai/ui';
import {chromium} from 'playwright';
import {createContractEngine} from '../../../../packages/seda-contracts/src/index.mjs';
import {createWebBindings} from '../../../../packages/seda-contracts/src/web.mjs';
import {createPilotServer} from './server.mjs';

const css=await fs.readFile('node_modules/@seda-ai/ui/dist/styles.css','utf8');
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
let cases=0,server;
const samples=[
 [{warningText:'Check'},'warning','Check'],
 [{successText:'Confirmed'},'success','Confirmed'],
 [{errorText:'Invalid',warningText:'Check',successText:'Done'},'error','Invalid'],
 [{warningText:'Check',successText:'Done'},'warning','Check'],
 [{disabled:true,errorText:'Invalid',warningText:'Check',successText:'Done'},'disabled','Helper'],
 [{successText:'Confirmed','aria-invalid':true},'default','Helper'],
 [{warningText:' ',successText:h(Fragment,null,false,null)},'default','Helper'],
];
try {
 await fs.mkdir('.diagnostics-field-validation',{recursive:true});
 const engine=createContractEngine();
 for(const theme of ['Light','Dark']) {
  const web=createWebBindings(engine.compile(undefined,{overrides:{theme}}));
  for(const [name,Component] of [['TextField',TextField],['NumberField',NumberField]])for(const bound of [false,true])for(const [props,state,message] of samples) {
   const binding=name==='TextField'?web.recipes.projectName:web.controls.NumberField;
   const field=h(Component,{label:'Workspace',id:'field',name:'field',value:name==='NumberField'?'320':'Atlas',...(name==='NumberField'?{onValueChange:()=>{},min:1,max:4096}:{onChange:()=>{}}),helperText:'Helper','aria-describedby':'outside outside',prefix:h(Icon,{name:'search'}),...props});
   const wrapper=h('div',bound?{...binding.attributes,style:binding.vars}:null,field);
   await page.setContent(`<style>${css}</style>`+renderToStaticMarkup(h(SedaProvider,{theme:theme.toLowerCase()},h('p',{id:'outside'},'Description'),wrapper)));
   const root=page.locator('.seda-field');
   assert.equal(await root.getAttribute('data-state'),state);
   assert.equal(await page.locator('.seda-field__message').innerText(),message);
   assert.equal(await page.locator('#field').getAttribute('aria-invalid'),state==='error'||props['aria-invalid']?'true':null);
   assert.deepEqual((await page.locator('#field').getAttribute('aria-describedby')).split(/\s+/),['outside','field-message']);
   if(['warning','success','error'].includes(state)) {
    await root.evaluate((e,{state,bound,name})=>{
     const prefix=bound&&name==='TextField'?'--seda-':'--text-field-';
     for(const [part,value] of [['border','rgb(1, 2, 3)'],['surface','rgb(210, 220, 230)'],['helper','rgb(4, 5, 6)'],['icon','rgb(7, 8, 9)']])e.style.setProperty(prefix+part+'-'+state,value);
    },{state,bound,name});
    const check=async()=>{
     const paint=await root.evaluate(e=>({border:getComputedStyle(e.querySelector('.seda-field__control')).borderTopColor,surface:getComputedStyle(e.querySelector('.seda-field__control')).backgroundColor,helper:getComputedStyle(e.querySelector('.seda-field__message')).color,icon:getComputedStyle(e.querySelector('.seda-icon')).color}));
     assert.deepEqual(paint,{border:'rgb(1, 2, 3)',surface:'rgb(210, 220, 230)',helper:'rgb(4, 5, 6)',icon:'rgb(7, 8, 9)'});
    };
    await check();await page.locator('#field').focus();await root.locator('.seda-field__control').hover();await check();
   }
   cases++;
  }
 }
 server=await createPilotServer({port:0});
 // Isolated reader fixture: this composition never writes shared DS settings.
 await page.route('**/api/design-system',route=>route.fulfill({status:404,contentType:'application/json',body:'{}'}));
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await page.waitForFunction(()=>window.sedaPilot);
 await page.locator('#nav-components').click();
 for(const theme of ['Light','Dark']) {
  await page.evaluate(theme=>window.sedaPilot.configure({theme,controlSize:'m'}),theme);
  await page.locator('#field-validation-tone').selectOption('success');
  const number=page.locator('#field-validation-number');
  await number.evaluate(e=>window.fieldValidationNode=e);
  for(const value of ['','-','1e','no','5000']) {
   await number.fill(value);
   assert.equal(await number.inputValue(),value);
   assert.equal(await number.locator('..').locator('..').getAttribute('data-state'),'default');
   assert.equal(await number.getAttribute('aria-invalid'),value==='5000'?'true':null);
  }
  await number.fill('320');await number.press('ArrowUp');assert.equal(await number.inputValue(),'321');
  assert.equal(await number.locator('..').locator('..').getAttribute('data-state'),'success');
  await page.locator('#field-validation-text').fill('New workspace');
  await page.locator('#field-validation-select').selectOption('viewer');
  await page.locator('#field-validation-tone').selectOption('warning');
  for(const id of ['text','number','select'])assert.equal(await page.locator('#field-validation-'+id).locator('..').locator('..').getAttribute('data-state'),'warning');
  assert.equal(await page.locator('#field-validation-text').inputValue(),'New workspace');assert.equal(await number.inputValue(),'321');assert.equal(await page.locator('#field-validation-select').inputValue(),'viewer');
  assert.equal(await number.evaluate(e=>window.fieldValidationNode===e),true,'tone changes retain the mounted numeric input');
  await page.locator('#field-validation-example').screenshot({path:`.diagnostics-field-validation/${theme}-workspace.png`});
  await page.locator('#field-validation-tone').selectOption('disabled');
  for(const id of ['text','number','select'])assert.equal(await page.locator('#field-validation-'+id).isDisabled(),true);
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('#field-validation-tone').selectOption('success');
 assert.equal(await page.locator('#field-validation-example').evaluate(e=>e.scrollWidth>e.clientWidth+1),false,'validation composition fits the narrow workspace');
 assert.deepEqual(errors,[]);console.log(`PASS: ${cases} installed-package message/paint cases (direct and contract bindings) and 2 live workspace themes; raw numeric drafts, stepping, tone changes retain values, disabled guards.`);
} finally {await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
