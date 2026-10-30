import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const output=path.join(import.meta.dirname,'.diagnostics-empty-state');
await fs.mkdir(output,{recursive:true});
const server=await createPilotServer({port:0});
const browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
try {
 const page=await browser.newPage({viewport:{width:1543,height:1100}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await page.waitForFunction(()=>window.sedaPilot);
 await page.locator('#nav-members').click();
 for(const theme of ['Light','Dark']) {
  await page.evaluate(theme=>window.sedaPilot.configure({theme,controlSize:'m'}),theme);
  const search=page.locator('#member-search');
  await search.fill('нет таких участников');
  const empty=page.locator('#members-table .seda-empty-state');
  assert.equal(await empty.getByRole('heading',{name:'Участники не найдены'}).count(),1);
  assert.equal(await empty.getAttribute('data-reason'),'no-results');
  await empty.scrollIntoViewIfNeeded();
  await page.screenshot({path:path.join(output,`team-${theme.toLowerCase()}.png`)});
  await empty.getByRole('button',{name:'Сбросить фильтры'}).click();
  await page.waitForFunction(()=>document.activeElement?.id==='member-search');
  assert.equal(await search.inputValue(),'');
  assert.equal(await page.locator('#members-table tbody tr[data-row-key]').count(),3);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: Team EmptyState and reset/focus in Light and Dark; screenshots saved.');
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
