import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {chromium} from 'playwright';
const url=process.env.SEDA_STORE_URL,parsed=url&&new URL(url);
if(!parsed||!['127.0.0.1','localhost'].includes(parsed.hostname)||process.env.SEDA_TEST_STORE!=='isolated-owner')throw Error('Set SEDA_STORE_URL to a dedicated local D1 and SEDA_TEST_STORE=isolated-owner. Never run against production.');
const get=async()=>{const r=await fetch(url+'/api/token-document');assert.ok(r.ok);return r.json();};
const initial=await get();assert.deepEqual(initial.edits,{},'Dedicated owner fixture must start without edits');
const put=async edits=>{const doc=await get(),r=await fetch(url+'/api/token-document',{method:'PUT',headers:{'Content-Type':'application/json',Origin:url},body:JSON.stringify({...doc,clientVersion:2,edits})});assert.equal(r.status,200);return r.json();};
const expected={},steps=[],errors=[];
async function stored(key,value){expected[key]=value;for(let n=0;n<150;n++){const doc=await get();if(doc.edits[key]===value){assert.deepEqual(doc.edits,expected,'Only intended token keys change');steps.push({key,value,revision:doc.revision});return doc;}await new Promise(r=>setTimeout(r,100));}throw Error('Missing saved edit '+key);}
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE}),context=await browser.newContext(),editor=await context.newPage({viewport:{width:1480,height:1000}}),consumer=await context.newPage({viewport:{width:1480,height:1000}});
for(const page of [editor,consumer])page.on('pageerror',e=>errors.push(e.message));
const saved=()=>editor.locator('.studio-sync-live').filter({hasText:'Сохранено в базе'}).waitFor();
const applied=(page,revision)=>page.waitForFunction(rev=>document.querySelector('style[data-seda-saved-design]')?.getAttribute('data-revision')===String(rev),revision);
const variable=(page,selector,name)=>page.locator(selector).evaluate((node,name)=>getComputedStyle(node).getPropertyValue(name).trim(),name);
const part=async(name,group,token)=>{await editor.getByRole('button',{name:'Компоненты',exact:true}).click();await editor.locator('.studio-library-items').getByRole('button',{name,exact:true}).click();await editor.getByLabel('Property group',{exact:true}).selectOption(group);assert.equal(await editor.getByRole('dialog').count(),0);await editor.getByRole('button',{name:token+' color',exact:true}).click();};
const assign=async role=>{const dialog=editor.getByRole('dialog',{name:'Color role'});assert.equal(await dialog.locator('.studio-color-options button').filter({hasText:/^color\//}).count(),0,'Component assignments list semantic roles only');await dialog.getByRole('button',{name:role,exact:true}).click();await editor.keyboard.press('Escape');};
try{
 await fs.mkdir('.diagnostics-owner-workflow',{recursive:true});await editor.goto(url+'/tokens');await saved();await consumer.goto(url+'/');await applied(consumer,initial.revision);await consumer.locator('#project').fill('Несохранённый текст приложения');
 // Palette is global. Inspecting scope precedes the first edit.
 await editor.getByRole('button',{name:'Палитра',exact:true}).click();await editor.getByLabel('Поиск по токенам').fill('blue/60');await editor.getByRole('button',{name:'color/blue/60',exact:true}).click();
 assert.match(await editor.locator('.studio-edit-scope').innerText(),/Общий цвет палитры/);
 const color='oklch(55% 0.13 255)';await editor.getByLabel('OKLCH',{exact:true}).fill(color);let doc=await stored('foundation|Mode 1|color/blue/60',color);await saved();await applied(consumer,doc.revision);
 assert.equal(await variable(consumer,'#save','--button-primary-surface-default'),color);
 // Semantic role affects both field types without rewriting component bindings.
 await editor.getByRole('button',{name:'Семантика',exact:true}).click();await editor.getByLabel('Поиск по токенам').fill('border/field/default');await editor.getByRole('button',{name:'border/field/default',exact:true}).click();assert.match(await editor.locator('.studio-edit-scope').innerText(),/Общая роль/);
 await editor.getByLabel('Palette color',{exact:true}).selectOption('{color.blue.60}');doc=await stored('semantic|Light|border/field/default','{color.blue.60}');await applied(consumer,doc.revision);
 for(const [selector,name]of [['#project','--text-field-border-default'],['#filter','--select-border-default']])assert.equal(await variable(consumer,selector,name),color);
 // A component assignment changes that component, not the semantic role or sibling field.
 await part('select','border','select/border/default');await assign('border/subtle');doc=await stored('components|Mode 1|select/border/default','{border.subtle}');await applied(consumer,doc.revision);
 assert.equal(await variable(consumer,'#filter','--select-border-default'),'#18191b0f');assert.equal(await variable(consumer,'#project','--text-field-border-default'),color);
 await part('text-field','border','text-field/border/default');await assign('border/strong');doc=await stored('components|Mode 1|text-field/border/default','{border.strong}');await applied(consumer,doc.revision);
 assert.equal(await variable(consumer,'#project','--text-field-border-default'),'#18191b3d');assert.equal(await variable(consumer,'#filter','--select-border-default'),'#18191b0f');
 await part('button','primary','button/primary/solid/surface/default');await assign('container/accent/default');doc=await stored('components|Mode 1|button/primary/solid/surface/default','{container.accent.default}');await applied(consumer,doc.revision);
 assert.equal(await variable(consumer,'#save','--button-primary-surface-default'),'#8d4dc8');assert.equal(await consumer.locator('#project').inputValue(),'Несохранённый текст приложения');
 // Undo changes only the last local binding; earlier palette and semantic edits survive.
 await editor.getByRole('button',{name:'Отменить изменение',exact:true}).click();delete expected['components|Mode 1|button/primary/solid/surface/default'];
 await editor.waitForFunction(()=>!JSON.parse(localStorage.getItem('seda-token-workbench-v2')).edits['components|Mode 1|button/primary/solid/surface/default']);await saved();assert.deepEqual((await get()).edits,expected);
 const freshContext=await browser.newContext(),fresh=await freshContext.newPage();doc=await get();await fresh.goto(url+'/');await applied(fresh,doc.revision);assert.equal(await variable(fresh,'#filter','--select-border-default'),'#18191b0f');assert.equal((await get()).revision,doc.revision,'New consumer does not write');await freshContext.close();
 await editor.bringToFront();
 for(const theme of ['Light','Dark']){await editor.getByLabel('Theme',{exact:true}).selectOption(theme);await editor.screenshot({animations:'disabled',caret:'hide',path:'.diagnostics-owner-workflow/scope-'+theme.toLowerCase()+'.png'});}
 // Existing direct-palette component bindings remain authored but cannot be chosen as new semantic assignments.
 await part('button','neutral/ghost','button/neutral/ghost/surface/default');assert.match(await editor.getByRole('dialog').innerText(),/Исходная прямая ссылка палитры/);assert.equal(await editor.getByRole('dialog').locator('.studio-color-options button').filter({hasText:/^color\//}).count(),0);await editor.screenshot({animations:'disabled',caret:'hide',path:'.diagnostics-owner-workflow/legacy-binding.png'});await editor.keyboard.press('Escape');
 // Invalid local input must remain editable after an offline reload; the last valid paint is retained.
 await editor.getByLabel('Theme',{exact:true}).selectOption('Light');
 await editor.getByRole('button',{name:'Палитра',exact:true}).click();await editor.getByLabel('Поиск по токенам').fill('blue/60');await editor.getByRole('button',{name:'color/blue/60',exact:true}).click();await editor.route('**/api/token-document',route=>route.abort());
 await editor.getByLabel('OKLCH',{exact:true}).fill('oklch(');await editor.locator('.studio-sync-error').waitFor();
 await editor.reload();await editor.getByRole('button',{name:'Палитра',exact:true}).click();await editor.getByLabel('Поиск по токенам').fill('blue/60');await editor.getByRole('button',{name:'color/blue/60',exact:true}).click();
 assert.equal(await editor.getByLabel('OKLCH',{exact:true}).inputValue(),'oklch(');assert.equal(await variable(editor,'.studio','--container-brand-default'),color);assert.deepEqual((await get()).edits,expected,'Invalid draft never reaches D1');
 assert.match(await editor.locator('.studio-resolved-color code').first().innerText(),/55%/,'Inspector uses the same last-valid snapshot as canvas');
 assert.ok(!/затронет 0 связанных/.test(await editor.locator('.studio-edit-scope').innerText()),'A broken draft must not erase the dependency scope');
 await editor.screenshot({animations:'disabled',caret:'hide',path:'.diagnostics-owner-workflow/invalid-reload.png'});
 await editor.getByLabel('OKLCH',{exact:true}).fill('oklch(56% 0.13 255)');await editor.unroute('**/api/token-document');await editor.getByRole('button',{name:'Синхронизировать',exact:true}).click();doc=await stored('foundation|Mode 1|color/blue/60','oklch(56% 0.13 255)');await saved();
 // A committed response is delayed while a second edit is made. The first response cannot erase the newer draft.
 let release,committed;const committedPromise=new Promise(r=>committed=r),gate=new Promise(r=>release=r);let delayed=true;
 await editor.route('**/api/token-document',async route=>{if(route.request().method()!=='PUT'||!delayed)return route.continue();delayed=false;const response=await route.fetch();committed();await gate;await route.fulfill({response});});
 await editor.getByLabel('OKLCH',{exact:true}).fill('oklch(57% 0.13 255)');await committedPromise;await editor.getByLabel('OKLCH',{exact:true}).fill('oklch(58% 0.13 255)');release();
 doc=await stored('foundation|Mode 1|color/blue/60','oklch(58% 0.13 255)');await saved();assert.equal(await editor.getByLabel('OKLCH',{exact:true}).inputValue(),'oklch(58% 0.13 255)');await editor.unroute('**/api/token-document');
 await editor.reload();await saved();assert.deepEqual((await get()).edits,expected);
 const quotaContext=await browser.newContext(),quota=await quotaContext.newPage();quota.on('pageerror',e=>errors.push(e.message));
 await quota.addInitScript(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='seda-token-workbench-v2')throw new DOMException('Test quota exceeded','QuotaExceededError');return original.call(this,key,value);};});
 await quota.goto(url+'/tokens');await quota.locator('.studio-sync-error').filter({hasText:'Не удалось сохранить локальный черновик'}).waitFor();assert.deepEqual((await get()).edits,expected);await quota.screenshot({animations:'disabled',caret:'hide',path:'.diagnostics-owner-workflow/quota-error.png'});await quotaContext.close();assert.deepEqual(errors,[]);
 await fs.writeFile('.diagnostics-owner-workflow/results.json',JSON.stringify({status:'PASS',store:url,initialRevision:initial.revision,finalRevision:doc.revision,steps,errors,scope:'Real isolated local D1; palette/semantic/three bindings, sibling isolation, undo, unsaved form, new consumer, invalid draft reload/retry, delayed PUT'},null,2));
 console.log('PASS: real isolated local D1 owner workflow; palette → semantic → Select/TextField/Button; exact scope, undo, fresh consumer/no writes, invalid draft recovery and delayed PUT without losing newer edits.');
}finally{await browser.close();await put(initial.edits);}
