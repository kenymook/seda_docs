import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium, firefox, webkit} from 'playwright';
import {createPilotServer} from './server.mjs';

const engineName=process.env.SEDA_BROWSER_ENGINE||'chromium';
const engines={chromium,firefox,webkit};
if(!Object.hasOwn(engines,engineName))throw new Error(`Unsupported browser engine: ${engineName}`);
const output=path.join(import.meta.dirname,`.diagnostics-select-engines-${engineName}`);
await fs.mkdir(output,{recursive:true});
const server=await createPilotServer({port:0});
const browser=await engines[engineName].launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.setDefaultTimeout(6000);
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const origin=`http://127.0.0.1:${server.address().port}`;
const cases=[];
const measure=select=>select.evaluate(node=>{
 const control=node.parentElement,rect=control.getBoundingClientRect(),style=getComputedStyle(control);
 return{width:rect.width,height:rect.height,background:style.backgroundColor,border:style.borderTopColor,focused:document.activeElement===node,appearance:getComputedStyle(node).appearance,supportsBaseSelect:CSS.supports('appearance','base-select')};
});
const sameSize=(a,b,label)=>{
 assert.ok(Math.abs(a.width-b.width)<=1,`${label} width changed ${a.width} → ${b.width}`);
 assert.ok(Math.abs(a.height-b.height)<=1,`${label} height changed ${a.height} → ${b.height}`);
};
try{
 await page.goto(origin+'/references/framer.html');
 const position=page.locator('#fr-position');
 await position.waitFor();
 const before=await measure(position);
 await position.click();
 const open=await measure(position);
 sameSize(before,open,'Framer Select open');
 await page.keyboard.press('ArrowDown');
 await page.keyboard.press('Enter');
 assert.equal(await position.inputValue(),'absolute','keyboard commits the next option in Framer');
 const chosen=await measure(position);
 assert.equal(chosen.focused,true,'Framer Select retains focus after selection');
 sameSize(before,chosen,'Framer Select selection');
 await position.click();
 await page.keyboard.press('Escape');
 assert.equal(await position.inputValue(),'absolute','Escape preserves Framer selection');
 assert.equal((await measure(position)).focused,true,'Escape returns focus to Framer Select');
 cases.push({screen:'framer',before,open,chosen});

 await page.goto(origin+'/');
 const filter=page.locator('#filter');
 await filter.waitFor();
 const labBefore=await measure(filter);
 await filter.click();
 await page.keyboard.press('ArrowDown');
 await page.keyboard.press('Enter');
 assert.equal(await filter.inputValue(),'active','keyboard updates React filter value');
 await page.locator('#count').getByText('2 проекта').waitFor();
 const labSelected=await measure(filter);
 sameSize(labBefore,labSelected,'Lab Select after filtering');
 await page.locator('#theme').selectOption('dark');
 assert.equal(await filter.inputValue(),'active','theme change preserves React filter state');
 const dark=await measure(filter);
 sameSize(labBefore,dark,'Lab Select after theme change');
 await filter.click();
 await page.keyboard.press('Escape');
 assert.equal(await filter.inputValue(),'active','Escape preserves Lab filter');
 assert.equal((await measure(filter)).focused,true,'Escape returns focus to Lab Select');
 cases.push({screen:'lab',before:labBefore,selected:labSelected,dark});
 assert.deepEqual(errors,[]);
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
 await fs.writeFile(path.join(output,'results.json'),JSON.stringify({engine:engineName,cases,errors},null,2)+'\n');
}
console.log(JSON.stringify({engine:engineName,passed:cases.length,failed:0,output}));
