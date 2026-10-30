import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

export async function readWorkspaceChoices(page) {
  return page.locator('#components-page .seda-choice,#components-page .seda-toggle').evaluateAll(rows=>rows.map(row=>{
    const input=row.querySelector('input');
    const label=row.querySelector('.seda-choice__label,.seda-toggle__label');
    const control=input.getBoundingClientRect(),text=label.getBoundingClientRect(),style=getComputedStyle(label);
    const firstLine=text.top+parseFloat(style.paddingTop)+parseFloat(style.lineHeight)/2;
    return {id:input.id||input.value,delta:Math.abs(control.top+control.height/2-firstLine),firstLine,overflow:row.scrollWidth>row.clientWidth+1};
  }));
}

export async function verifyWorkspaceChoices(page,output) {
  const samples=[];
  const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.locator('#nav-components').click();
  for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,100,150])for(const spacing of [0,12]){
    await page.evaluate(config=>window.sedaPilot.configure(config),{theme,controlSize:size});
    await page.locator('#scale').fill(String(scale));
    await page.locator('#air').fill(String(spacing));
    await page.locator('#airX').fill(String(spacing*2));
    await settle();
    const rows=await readWorkspaceChoices(page);
    assert.ok(rows.length>=12,'Gallery includes all three choice types and states');
    for(const row of rows){assert.ok(row.delta<=1,JSON.stringify({theme,size,scale,spacing,...row}));assert.equal(row.overflow,false);}
    for(const state of ['default','error','disabled']){
      const check=rows.find(row=>row.id==='visual-check-'+state),toggle=rows.find(row=>row.id==='visual-toggle-'+state);
      assert.ok(Math.abs(check.firstLine-toggle.firstLine)<=1,'Neighbour labels align in '+state);
    }
    samples.push({theme,size,scale,spacing,rows});
    if(size==='m'&&scale===100&&spacing===0)await page.screenshot({path:path.join(output,'choices-'+theme+'.png'),fullPage:true});
  }
  return {scope:'First-line alignment in actual compiler-bound Lab controls; scale and X/Y extremes',samples};
}

if(process.argv[1]===import.meta.filename){
  const output=path.join(import.meta.dirname,'.diagnostics-choice-layout');await fs.mkdir(output,{recursive:true});
  const server=await createPilotServer({port:0});
  const browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
  const page=await browser.newPage({viewport:{width:1702,height:1244}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
    const result=await verifyWorkspaceChoices(page,output);assert.deepEqual(errors,[]);
    await fs.writeFile(path.join(output,'results.json'),JSON.stringify({...result,errors},null,2));
    console.log(JSON.stringify({samples:result.samples.length,maxDelta:Math.max(...result.samples.flatMap(s=>s.rows.map(r=>r.delta))),errors,output}));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
