import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createElement as h,Fragment} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Select,SedaProvider} from '@seda-ai/ui';
import {chromium} from 'playwright';
const css=await fs.readFile('node_modules/@seda-ai/ui/dist/styles.css','utf8');
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));let cases=0;
const samples=[
 [{warningText:'Check access'},'warning','Check access'],
 [{successText:'Access verified'},'success','Access verified'],
 [{errorText:'Invalid',warningText:'Check',successText:'Done'},'error','Invalid'],
 [{warningText:'Check',successText:'Done'},'warning','Check'],
 [{disabled:true,errorText:'Invalid',warningText:'Check',successText:'Done'},'disabled','Helper'],
 [{warningText:' ',state:'warning'},'default','Helper'],
 [{successText:h(Fragment,null,false,null),state:'success'},'default','Helper'],
 [{errorText:'',warningText:'Check'},'warning','Check'],
];
try{
 for(const theme of ['light','dark'])for(const [props,state,message] of samples){
  const markup=renderToStaticMarkup(h(SedaProvider,{theme},h('p',{id:'outside'},'External'),h(Select,{id:'role',name:'role',label:'Role',defaultValue:'editor',options:[{value:'editor',label:'Editor'},{value:'viewer',label:'Viewer'}],helperText:'Helper','aria-describedby':'outside outside',...props})));
  await page.setContent(`<style>${css}</style>${markup}`);
  assert.equal(await page.locator('.seda-field').getAttribute('data-state'),state);
  assert.equal(await page.locator('.seda-field__message').innerText(),message);
  assert.equal(await page.locator('#role').getAttribute('aria-invalid'),state==='error'?'true':null);
  const ids=(await page.locator('#role').getAttribute('aria-describedby')).split(/\s+/);assert.equal(new Set(ids).size,2);
  assert.equal(await page.locator('#role').isDisabled(),state==='disabled');
  if(['warning','success','error'].includes(state)){
   // Distinct component-level assignments must reach painted border, helper and arrow.
   await page.locator('.seda-field').evaluate((e,state)=>{for(const [part,value] of [['border','rgb(1, 2, 3)'],['helper','rgb(4, 5, 6)'],['arrow','rgb(7, 8, 9)']])e.style.setProperty('--select-'+part+'-'+state,value);},state);
   assert.equal(await page.locator('.seda-field__control').evaluate(e=>getComputedStyle(e).borderTopColor),'rgb(1, 2, 3)');
   assert.equal(await page.locator('.seda-field__message').evaluate(e=>getComputedStyle(e).color),'rgb(4, 5, 6)');
   assert.equal(await page.locator('.seda-select__arrow').evaluate(e=>getComputedStyle(e).color),'rgb(7, 8, 9)');
  }
  if(state==='warning'||state==='success'){
   await page.locator('#role').selectOption('viewer');assert.equal(await page.locator('#role').inputValue(),'viewer');
   assert.equal(await page.locator('#role').evaluate(e=>e.checkValidity()),true);
  }
  cases++;
 }
 assert.deepEqual(errors,[]);console.log(`PASS: ${cases} installed-package validation cases; priority, blank/Fragment suppression, descriptions, native selection/validity, actual border/helper/arrow token paint.`);
}finally{await browser.close();}
