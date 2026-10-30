import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
import {createContractEngine,deriveTypography} from '../../../../packages/seda-contracts/src/index.mjs';

const subjects=[
  ['#projects-subtitle','caption/default'],['#count','caption/default'],['#projects-panel-title','heading/compact'],
  ['#projects-description','body/default'],['.workspace-pagination>p','caption/default'],
  ['.product-masthead strong','label/default'],['.product-masthead>div>div>span','caption/default'],['.workspace-account','caption/default'],
];
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<.05,JSON.stringify({actual,expected}));

export async function verifyWorkspaceText(page,origin,output) {
  const engine=createContractEngine(),samples=[],roles={};
  await page.goto(origin+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
  const serviceSize=await page.locator('.inspector>h2').evaluate(el=>getComputedStyle(el).fontSize);
  for(const theme of ['Light','Dark']){
    roles[theme]=engine.compile(engine.bundle.profile,{overrides:{theme,controlSize:'m'}}).typography.roles;
    for(const size of ['s','m','l','xl'])for(const scale of [80,100,150]){
      await page.evaluate(config=>window.sedaPilot.configure(config),{theme,controlSize:size});await page.locator('#scale').fill(String(scale));await settle(page);
      const measurements=[];
      for(const[selector,role]of subjects){
        const values=await page.locator(selector).evaluateAll(elements=>elements.map(el=>{const s=getComputedStyle(el);return{role:el.dataset.sedaText,font:parseFloat(s.fontSize),line:parseFloat(s.lineHeight),weight:Number(s.fontWeight)};}));
        assert.ok(values.length,selector);const expected=deriveTypography(roles[theme],role,scale);
        for(const value of values){assert.equal(value.role,role);near(value.font,expected.size);near(value.line,expected.lineHeight);near(value.weight,expected.weight);}
        measurements.push({selector,role,expectedSize:expected.size,values});
      }
      const tableGeometry=await page.evaluate(()=>window.sedaPilot.getLab().derived);
      const tableHeaders=await page.locator('#projects-table thead th,#projects-table .seda-table__sort').evaluateAll(nodes=>nodes.map(n=>({font:parseFloat(getComputedStyle(n).fontSize),line:parseFloat(getComputedStyle(n).lineHeight)})));
      assert.ok(tableHeaders.length>=4);for(const value of tableHeaders){near(value.font,Math.max(12,tableGeometry.font));near(value.line,tableGeometry.line);}
      measurements.push({selector:'#projects-table thead th/.seda-table__sort',source:'compiled control typography with Table readability floor',values:tableHeaders});
      assert.equal(await page.locator('.inspector>h2').evaluate(el=>getComputedStyle(el).fontSize),serviceSize,'Lab service panel remains separate');
      const viewLabels=await page.locator('.view-switch .seda-button__label').evaluateAll(labels=>labels.map(label=>({text:label.textContent,width:label.clientWidth,scroll:label.scrollWidth})));
      for(const label of viewLabels)assert.ok(label.scroll<=label.width+1,'Short view label must remain visible: '+label.text);
      samples.push({theme,size,scale,measurements});
      if(size==='m'&&scale===150)await page.screenshot({path:path.join(output,'project-text-'+theme+'-150.png'),fullPage:true});
    }
  }
  const search=page.getByRole('textbox',{name:'Поиск проектов',exact:true});
  await search.fill('Nova');assert.equal(parseInt(await page.locator('#count').textContent()),1);
  await search.fill('no-such-project-59173');assert.equal(parseInt(await page.locator('#count').textContent()),0);
  await search.fill('');assert.equal(parseInt(await page.locator('#count').textContent()),4);
  await page.locator('[data-view=cards]').click();
  const cardRole=await page.locator('#cardsView .productcard header .seda-text').first().getAttribute('data-seda-text');assert.equal(cardRole,'label/default');
  const cardText=await page.locator('#cardsView .productcard header .seda-text').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));near(cardText,deriveTypography(roles.Dark,'label/default',150).size);
  for(const width of [1024,1702]){
    await page.setViewportSize({width,height:1244});await settle(page);
    const overflow=await page.locator('#cardsView .productcard').evaluateAll(cards=>cards.map(card=>card.scrollWidth>card.clientWidth+1));assert.ok(overflow.every(value=>!value));
  }
  await page.screenshot({path:path.join(output,'cards-text-150.png'),fullPage:true});
  return {scope:'Real SEDA Text roles in project subtitle, count, headings, metadata, native Table headers through compiler geometry, pagination and cards',samples,filterCounts:[1,0,4],cardsScale:true,servicePanelIsolated:true};
}

if(process.argv[1]===import.meta.filename){
  const output=path.join(import.meta.dirname,'.diagnostics-workspace-text');await fs.mkdir(output,{recursive:true});
  const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
  const page=await browser.newPage({viewport:{width:1702,height:1244}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{
    const result=await verifyWorkspaceText(page,'http://127.0.0.1:'+server.address().port,output);assert.deepEqual(errors,[]);
    await fs.writeFile(path.join(output,'results.json'),JSON.stringify({...result,errors},null,2));console.log(JSON.stringify({samples:result.samples.length,cardsScale:result.cardsScale,errors,output}));
  }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
