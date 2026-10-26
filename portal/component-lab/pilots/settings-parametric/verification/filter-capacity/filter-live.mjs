import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from '../.integration-lab2/portal/component-lab/pilots/settings-parametric/node_modules/playwright/index.mjs';
import {verifyWorkspaceFilters} from '../.integration-lab2/portal/component-lab/pilots/settings-parametric/verify-workspace-filters.mjs';

process.stdin.setEncoding('utf8');process.stdin.setRawMode(true);process.stdin.resume();console.error('Ready for filter production verification (hidden input).');
let input='';const config=await new Promise(resolve=>process.stdin.on('data',chunk=>{input+=chunk;if(/[\r\n]/.test(input)){process.stdin.setRawMode(false);process.stdin.pause();resolve(JSON.parse(input.trim()));}}));
const output=path.join(import.meta.dirname,'filter-live'),origin=new URL(config.url).origin;
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const context=await browser.newContext({viewport:{width:1702,height:1244}}),errors=[];
await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue({headers:{...route.request().headers(),'OAI-Sites-Authorization':'Bearer '+config.token}}):route.continue());
context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
const page=await context.newPage(),near=(a,b,name)=>assert.ok(Math.abs(a-b)<=1,name+': '+a+' != '+b);
try{
 await page.goto(origin+'/');await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
 const expected=JSON.parse(await fs.readFile(path.join(import.meta.dirname,'../.integration-lab2/portal/component-lab/pilots/settings-parametric/dist/build-metadata.json'),'utf8'));
 const metadata=await page.evaluate(async()=>{const r=await fetch('/build-metadata.json');assertResponse(r);return r.json();function assertResponse(r){if(!r.ok)throw Error('Metadata HTTP '+r.status);}});
 assert.deepEqual(metadata,expected);assert.ok(metadata.installedPackage&&!metadata.sourceAlias);
 const artifacts=await page.evaluate(async entries=>{let cursor=0,matched=0;await Promise.all(Array.from({length:8},async()=>{while(cursor<entries.length){const item=entries[cursor++],r=await fetch('/'+item.path);if(!r.ok)throw Error('HTTP '+r.status+' '+item.path);const b=await r.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');if(b.byteLength!==item.bytes||hash!==item.sha256)throw Error('Artifact mismatch '+item.path);matched++;}}));return matched;},metadata.artifacts);
 const filters=await verifyWorkspaceFilters(page,origin,path.join(output,'filters'));
 const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const appearance=async(theme,size,scale,x,y)=>{await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme,size});for(const[id,value]of Object.entries({scale,airX:x,air:y}))await page.locator('#'+id).fill(String(value));await settle();};
 const screens=[];
 for(const section of ['projects','members'])for(const theme of ['Light','Dark']){
  await page.locator('#nav-'+section).click();await page.setViewportSize({width:1702,height:1244});await appearance(theme,'m',150,24,12);
  const file=section+'-'+theme.toLowerCase()+'-full.png';await page.screenshot({path:path.join(output,file),fullPage:true});screens.push(file);
 }
 await page.locator('#nav-projects').click();const loading=[];
 for(const theme of ['Light','Dark']){
  await page.evaluate(()=>window.sedaPilot.reset());await appearance(theme,'s',80,0,0);await page.locator('#strict').uncheck();await page.locator('#project').fill('Filter proof '+theme);const save=page.locator('#save'),before=await save.boundingBox();await save.click();await save.evaluate(el=>el.click());
  await appearance(theme,'s',150,24,12);await page.waitForFunction(()=>document.getElementById('conformance').textContent.startsWith('PASS'));
  const fit=await save.evaluate(el=>{const b=el.getBoundingClientRect(),spinner=el.querySelector('.seda-button__spinner'),r=spinner.getBoundingClientRect(),s=getComputedStyle(spinner);return{width:b.width,height:b.height,spinnerWidth:parseFloat(s.width),spinnerHeight:parseFloat(s.height),deltaX:Math.abs(r.x+r.width/2-b.x-b.width/2),deltaY:Math.abs(r.y+r.height/2-b.y-b.height/2),requests:window.sedaPilot.getRequests().length};});
  near(fit.width,before.width,'loading width');near(fit.height,before.height,'loading height');assert.equal(fit.requests,1);assert.ok(fit.spinnerWidth<=Math.min(fit.width,fit.height)-2);near(fit.spinnerWidth,fit.spinnerHeight,'spinner square');assert.ok(fit.deltaX<=1&&fit.deltaY<=1);
  await page.emulateMedia({reducedMotion:'reduce'});await save.screenshot({path:path.join(output,'loading-'+theme.toLowerCase()+'.png')});await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>window.sedaPilot.respond(window.sedaPilot.getState().activeRequest.id,'success'));await settle();assert.ok((await save.boundingBox()).height>before.height);loading.push({theme,before,...fit});
 }
 assert.deepEqual(errors,[]);
 const result={version:config.version,runtimeGitHubCommit:config.commit,artifactHashesMatched:artifacts,sourceHashesMatched:Object.keys(metadata.provenance.sources).length,installedPackage:true,sourceAlias:false,filters,loading,screens,errors};
 await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({version:config.version,commit:config.commit,artifacts,filters:filters.samples.length,loading:loading.length,errors,output}));
}catch(error){await page.screenshot({path:path.join(output,'failure.png'),fullPage:true});throw error;}
finally{await browser.close();}
