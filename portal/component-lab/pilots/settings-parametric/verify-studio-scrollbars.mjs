import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {createHash} from 'node:crypto';import {chromium} from 'playwright';import {createPilotServer} from './server.mjs';
const hash=createHash('sha256').update(await fs.readFile('../../../../tokens.json')).digest('hex'),server=await createPilotServer({port:0}),base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE}),page=await browser.newPage({viewport:{width:1480,height:800}}),errors=[],samples=[];page.on('pageerror',e=>errors.push(e.message));let writes=0;
await page.route('**/api/token-document',route=>{if(route.request().method()!=='GET')writes++;return route.fulfill({json:{sourceTokensSha256:hash,revision:0,edits:{},updatedAt:null}});});await fs.mkdir('.diagnostics-studio-scrollbars',{recursive:true});
const measure=region=>region.evaluate(n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return{width:r.width,height:r.height,clientWidth:n.clientWidth,clientHeight:n.clientHeight,scrollWidth:n.scrollWidth,scrollHeight:n.scrollHeight,gutter:s.scrollbarGutter,color:s.scrollbarColor,active:n.hasAttribute('data-studio-scrolling'),top:n.scrollTop};});
const hidden=async region=>{await page.mouse.move(1000,20);await page.waitForFunction(selector=>!document.querySelector(selector).hasAttribute('data-studio-scrolling'),region);};
try{
 await page.goto(base+'/tokens.html?area=components');
 for(const theme of ['Light','Dark']){
  await page.getByLabel('Theme',{exact:true}).selectOption(theme);await page.locator('.studio-library-items').getByRole('button',{name:'button',exact:true}).click();
  for(const selector of ['.studio-library-items','.studio-canvas-scroll','.studio-inspector']){
   const region=page.locator(selector);await region.evaluate(n=>n.scrollTop=0);await hidden(selector);const idle=await measure(region);assert.equal(idle.gutter,'stable');assert.ok(idle.color.includes('rgba(0, 0, 0, 0)'),idle.color);assert.ok(idle.width-idle.clientWidth>=5,'A native scrollbar gutter is reserved');
   await region.hover({position:{x:Math.min(50,idle.width/2),y:80}});const hovered=await measure(region);assert.notEqual(hovered.color,idle.color);assert.equal(hovered.clientWidth,idle.clientWidth);assert.equal(hovered.clientHeight,idle.clientHeight);
   if(idle.scrollHeight>idle.clientHeight){await page.mouse.wheel(0,120);await page.waitForFunction(selector=>document.querySelector(selector).scrollTop>0,selector);await page.mouse.move(1000,20);const active=await measure(region);assert.equal(active.active,true);assert.notEqual(active.color,idle.color);await hidden(selector);assert.equal((await measure(region)).color,idle.color);}
   samples.push({theme,selector,idle,hovered});
  }
  // Filtering removes overflow without changing the library's content width.
  const library=page.locator('.studio-library-items'),before=await measure(library);await page.getByLabel('Поиск в библиотеке',{exact:true}).fill('breadcrumbs');const after=await measure(library);assert.equal(after.clientWidth,before.clientWidth);await page.getByLabel('Поиск в библиотеке',{exact:true}).fill('');
  await page.locator('.studio-library-items').getByRole('button',{name:'select',exact:true}).click();await page.locator('.studio-color-trigger').first().click();const options=page.locator('.studio-color-popover .studio-color-options');await options.waitFor();await hidden('.studio-color-popover .studio-color-options');assert.equal((await measure(options)).gutter,'stable');await options.hover();assert.ok(!(await measure(options)).color.startsWith('rgba(0, 0, 0, 0)'));await page.getByRole('button',{name:'Close color editor',exact:true}).click();
  await page.locator('.studio-canvas-scroll').hover();await page.screenshot({path:'.diagnostics-studio-scrollbars/'+theme.toLowerCase()+'.png'});
 }
 await page.setViewportSize({width:1480,height:340});const rail=await measure(page.locator('.studio-rail'));assert.equal(rail.width,54);assert.ok(rail.scrollWidth-rail.clientWidth<=1,'Rail must not gain horizontal overflow');
 await page.goto(base+'/');for(const selector of ['.lab-navigation','.lab-right-sidebar','.lab-studio .canvas']){const region=page.locator(selector);await region.waitFor();assert.equal((await measure(region)).gutter,'stable');}
 await page.emulateMedia({forcedColors:'active'});assert.equal((await measure(page.locator('.lab-right-sidebar'))).color,'auto');
 assert.equal(writes,0);assert.deepEqual(errors,[]);await fs.writeFile('.diagnostics-studio-scrollbars/results.json',JSON.stringify({samples,rail,writes,errors},null,2));console.log('PASS: Light/Dark native stable gutters, hover/scroll/idle visibility, overflow filtering without width shift, popover, 54px rail, Lab regions, forced colors; no token writes or JS errors. API is an isolated fixture.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
