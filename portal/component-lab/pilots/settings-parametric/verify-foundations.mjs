import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {applyWorkbenchEdits,designCatalog} from './token-workbench-model.mjs';
import {foundationCatalog,foundationSections} from './foundation-model.mjs';
import {compileTypography,createTypographyBindings} from '../../../../packages/seda-contracts/src/typography.mjs';
import {createTokenResolver} from '../../../../packages/seda-contracts/src/tokens.mjs';
import {createPilotServer} from './server.mjs';
const source=JSON.parse(await fs.readFile('../../../../tokens.json','utf8'));
const key=path=>'foundation|Mode 1|'+path;
assert.equal(foundationCatalog(source).length,216);
const mixed={[key('space/m')]:'12',[key('border/radius/m')]:'10',[key('border/width/m')]:'1.5',[key('font/body/base/size')]:'16','semantic|Dark|duration/base':'450','semantic|Dark|opacity/disabled':'0.5','components|Mode 1|select/border/default':'{border.default}'};
const changed=applyWorkbenchEdits(source,mixed);
assert.equal(changed.$collections.foundation.$modes['Mode 1'].space.m.$value,12);
assert.equal(changed.$collections.semantic.$modes.Dark.duration.base.$value,450);
assert.equal(changed.$collections.semantic.$modes.Light.duration.base.$value,200);
assert.equal(createTypographyBindings(compileTypography(createTokenResolver(changed))).vars['--seda-type-body-default-size'],'16px');
for(const [path,value] of [['space/m','-1'],['border/radius/m','1000'],['border/width/m','20'],['font/body/base/size','100'],['font/body/base/weight','Unknown']])assert.throws(()=>applyWorkbenchEdits(source,{[key(path)]:value}));
assert.throws(()=>applyWorkbenchEdits(source,{'semantic|Dark|opacity/disabled':'1.1'}));
assert.throws(()=>applyWorkbenchEdits(source,{'semantic|Dark|easing/standard':'cubic-bezier(2, 0, 0, 1)'}));
assert.equal(source.$collections.foundation.$modes['Mode 1'].space.m.$value,8);
assert.equal(designCatalog(source).length,2061);
const server=await createPilotServer({port:0});
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const page=await browser.newPage({viewport:{width:1489,height:1000}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
await fs.mkdir('.diagnostics-studio',{recursive:true});
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/tokens.html');
 assert.equal(await page.locator('.studio-rail').evaluate(e=>e.getBoundingClientRect().width),54);
 for(const theme of ['Light','Dark']){
  await page.getByLabel('Theme').selectOption(theme);
  for(const section of foundationSections){
   await page.getByRole('button',{name:section.label,exact:true}).click();
   await page.getByRole('region',{name:section.title+' preview',exact:true}).waitFor();
   assert.ok(await page.getByRole('table',{name:section.title+' tokens'}).getByRole('row').count()>1);
   assert.equal(await page.locator('.studio-rail button[aria-current=page]').getAttribute('aria-label'),section.label);
   await page.screenshot({animations:'disabled',path:'.diagnostics-studio/foundation-'+section.id+'-'+theme+'.png',fullPage:true});
  }
 }
 async function update(area,token,value){await page.getByRole('button',{name:area,exact:true}).click();await page.getByRole('table').getByRole('button',{name:token,exact:true}).click();await page.getByRole('complementary',{name:'Foundation inspector'}).getByRole('spinbutton').fill(value);await page.getByRole('button',{name:'Применить',exact:true}).click();}
 await update('Типографика','font/body/base/size','16');
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-seda-text="body/default"]')).fontSize==='16px');
 await update('Отступы','space/m','12');assert.equal(await page.locator('.studio-spacing-specimen').evaluate(e=>getComputedStyle(e).gap),'12px');
 await update('Скругления','border/radius/m','10');assert.equal(await page.locator('.studio-radius-specimen').evaluate(e=>getComputedStyle(e).borderRadius),'10px');
 await update('Толщина рамки','border/width/m','1.5');assert.equal(await page.locator('.studio-border-specimen').evaluate(e=>e.style.borderWidth),'1.5px');
 await update('Анимация','duration/base','450');await page.getByRole('button',{name:'Воспроизвести',exact:true}).click();assert.equal(await page.locator('.studio-motion-marker').evaluate(e=>getComputedStyle(e).animationDuration),'0.45s');
 await update('Прозрачность','opacity/disabled','0.5');assert.equal(await page.locator('.studio-opacity-specimen>div').evaluate(e=>getComputedStyle(e).opacity),'0.5');
 await page.getByRole('spinbutton').fill('2');await page.getByRole('button',{name:'Применить',exact:true}).click();await page.getByRole('complementary',{name:'Foundation inspector'}).getByRole('alert').waitFor();assert.equal(await page.locator('.studio-opacity-specimen>div').evaluate(e=>getComputedStyle(e).opacity),'0.5');
 await page.reload();await page.getByRole('button',{name:'Отступы',exact:true}).click();assert.equal(await page.locator('.studio-spacing-specimen').evaluate(e=>getComputedStyle(e).gap),'12px');
 await page.getByRole('button',{name:'Вернуть исходное значение',exact:true}).click();await page.waitForFunction(()=>getComputedStyle(document.querySelector('.studio-spacing-specimen')).gap==='8px');
 await page.getByRole('button',{name:'Компоненты',exact:true}).click();await page.getByRole('button',{name:'select/border/default color',exact:true}).waitFor();
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Типографика',exact:true}).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({animations:'disabled',path:'.diagnostics-studio/foundation-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS: scalar validation, mixed color/foundation edits, typed values, typography compiler, six sections in Light/Dark, real preview changes, invalid input, reload/revert, color navigation, 54px rail and mobile');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
