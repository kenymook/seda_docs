import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
import {auditRenderedText} from './contrast-audit.mjs';
const output=path.join(import.meta.dirname,'.diagnostics-contrast');await fs.mkdir(output,{recursive:true});
const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1702,height:1244}}),samples=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
try {
  await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
  for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,100,150])for(const section of ['projects','settings','members','editor','components','feedback']){
    await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme,size});await page.locator('#scale').fill(String(scale));await page.locator('#nav-'+section).click();await settle();
    const audit=await auditRenderedText(page);assert.ok(audit.checked.length>70,'Audit must cover actual chrome, not an empty surface');
    const sample={theme,size,scale,section,checked:audit.checked.length,skipped:audit.skipped.length,minimum:Math.min(...audit.checked.map(e=>e.ratio)),failures:audit.failures,unsupported:audit.unsupported};samples.push(sample);
    assert.deepEqual(audit.unsupported,[],'Non-solid backgrounds or group opacity need explicit pixel review');assert.deepEqual(audit.failures,[],JSON.stringify({theme,size,scale,section,failures:audit.failures}));
  }
  await page.locator('#nav-feedback').click();await page.locator('#queue-review').click();
  for(const theme of ['Light','Dark']){
    await page.setViewportSize({width:1280,height:900});await page.evaluate(theme=>window.sedaPilot.configure({theme,controlSize:'m'}),theme);await page.locator('#scale').fill('100');await settle();
    const blocks=await page.locator('#feedback-queue-demo').evaluate(el=>{const children=Array.from(el.children).filter(el=>el.getBoundingClientRect().height);return children.slice(1).map((el,i)=>el.getBoundingClientRect().top-children[i].getBoundingClientRect().bottom);});
    const gap=await page.locator('#feedback-queue-demo').evaluate(el=>parseFloat(getComputedStyle(el).gap));for(const actual of blocks)assert.ok(Math.abs(actual-gap)<=1,`Composition gap ${actual} != ${gap}`);
    await page.screenshot({path:path.join(output,`chrome-1280-${theme}.png`),fullPage:true});
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({scope:'6 Lab sections × 2 themes × 4 sizes × 3 scales; repeated DOM measurements, not independent user workflows',samples:samples.length,failed:0,output}));
}finally{await browser.close();await new Promise(r=>server.close(r));await fs.writeFile(path.join(output,'results.json'),JSON.stringify({scope:'Computed active rendered text and native placeholders; large text threshold 3, ordinary text 4.5; closed details/disabled excluded; not pixel/AT certification',samples,errors},null,2));}
