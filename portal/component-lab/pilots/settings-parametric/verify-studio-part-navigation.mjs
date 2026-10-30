import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';
const hash=createHash('sha256').update(await fs.readFile('../../../../tokens.json')).digest('hex');
const server=await createPilotServer({port:0});
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const page=await browser.newPage({viewport:{width:1480,height:1000}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));let writes=0,cases=0;
await page.route('**/api/token-document',route=>{
 if(route.request().method()!=='GET')writes++;
 return route.fulfill({json:{sourceTokensSha256:hash,revision:0,edits:{},updatedAt:null}});
});
try {
 await page.goto(`http://127.0.0.1:${server.address().port}/tokens.html`);
 const dialog=page.getByRole('dialog',{name:'Color role'});
 for(const theme of ['Light','Dark']) {
  await page.getByLabel('Theme',{exact:true}).selectOption(theme);
  for(const component of ['select','text-field','button']) {
   await page.locator('.studio-library-items').getByRole('button',{name:component,exact:true}).click();
   const names=await page.locator('.studio-parts button').allTextContents();
   for(const name of names) {
    const part=page.locator('.studio-parts').getByRole('button',{name,exact:true});
    await part.click();
    assert.equal(await dialog.count(),0,`${component}/${name}: navigation must not open color editor`);
    assert.equal(await part.getAttribute('aria-pressed'),'true');
    assert.equal(await page.getByLabel('Property group',{exact:true}).locator('option:checked').textContent(),name);
    assert.equal(await part.evaluate(e=>e===document.activeElement),true,'part retains keyboard focus');
    await part.press('Enter');assert.equal(await dialog.count(),0,'keyboard activation selects a part only');
    cases++;
   }
   await page.locator('.studio-color-trigger').first().click();assert.equal(await dialog.count(),1,'explicit color action still opens editor');
   await page.locator('.studio-parts').getByRole('button',{name:names[0],exact:true}).click();
   assert.equal(await dialog.count(),0,'switching parts closes an already-open editor');
   await page.getByLabel('Property group',{exact:true}).selectOption({label:names.at(-1)});assert.equal(await dialog.count(),0,'inspector group selection is navigation too');
  }
 }
 await page.locator('.studio-library-items').getByRole('button',{name:'select',exact:true}).click();
 await page.locator('.studio-parts').getByRole('button',{name:'border',exact:true}).click();
 await fs.mkdir('.diagnostics-studio-part-navigation',{recursive:true});
 await page.screenshot({path:'.diagnostics-studio-part-navigation/dark.png'});
 assert.equal(writes,0,'navigation does not save token edits');assert.deepEqual(errors,[]);
 console.log(`PASS: ${cases} part selections in Light/Dark across Select/TextField/Button; pointer/keyboard navigation, explicit-only popover, closing on group change, no token writes.`);
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
