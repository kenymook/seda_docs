import assert from'node:assert/strict';import fs from'node:fs/promises';import path from'node:path';
import{chromium}from'../.integration-lab2/portal/component-lab/pilots/settings-parametric/node_modules/playwright/index.mjs';
import{createPilotServer}from'../.integration-lab2/portal/component-lab/pilots/settings-parametric/server.mjs';
import{verifyWorkspaceFilters}from'../.integration-lab2/portal/component-lab/pilots/settings-parametric/verify-workspace-filters.mjs';
import{verifyInspectorConsistency}from'../.integration-lab2/portal/component-lab/pilots/settings-parametric/verify-inspector-consistency.mjs';
import{verifyFieldAnatomyWorkspace as verifyFieldApplications}from'../.integration-lab2/portal/component-lab/pilots/settings-parametric/verify-field-anatomy-workspace.mjs';
let config,server;
if(process.argv.includes('--local')){server=await createPilotServer({port:0});config={url:'http://127.0.0.1:'+server.address().port,version:'local',commit:'dd1f0e30ef10ec714a3b34e138a24583e63cd3e7'};}
else{process.stdin.setEncoding('utf8');process.stdin.setRawMode(true);process.stdin.resume();console.error('Ready for field foundation verification (hidden input).');let input='';config=await new Promise(resolve=>process.stdin.on('data',chunk=>{input+=chunk;if(/[\r\n]/.test(input)){process.stdin.setRawMode(false);process.stdin.pause();resolve(JSON.parse(input.trim()));}}));}
const output=path.join(import.meta.dirname,server?'field-anatomy-local':'field-anatomy-live'),origin=new URL(config.url).origin;
await fs.mkdir(output,{recursive:true});const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],executablePath:process.env.SEDA_BROWSER_EXECUTABLE}),context=await browser.newContext({viewport:{width:1702,height:1244}}),errors=[];
if(config.token)await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue({headers:{...route.request().headers(),'OAI-Sites-Authorization':'Bearer '+config.token}}):route.continue());context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
try{
 const page=await context.newPage();await page.goto(origin+'/');await page.waitForFunction(()=>window.sedaPilot);
 const expected=JSON.parse(await fs.readFile(path.join(import.meta.dirname,'../.integration-lab2/portal/component-lab/pilots/settings-parametric/dist/build-metadata.json'),'utf8'));
 const metadata=await page.evaluate(async()=>{const r=await fetch('/build-metadata.json');if(!r.ok)throw Error('HTTP '+r.status);return r.json();});assert.deepEqual(metadata,expected);assert.ok(metadata.installedPackage&&!metadata.sourceAlias);
 const artifacts=await page.evaluate(async entries=>{let cursor=0,matched=0;await Promise.all(Array.from({length:8},async()=>{while(cursor<entries.length){const item=entries[cursor++],r=await fetch('/'+item.path);if(!r.ok)throw Error('HTTP '+r.status+' '+item.path);const b=await r.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');if(b.byteLength!==item.bytes||hash!==item.sha256)throw Error('Artifact mismatch '+item.path);matched++;}}));return matched;},metadata.artifacts);
 const fields=await verifyFieldApplications(page,origin,path.join(output,'fields'));console.log(JSON.stringify({fields:fields.samples.length}));
 const filters=await verifyWorkspaceFilters(page,origin,path.join(output,'filters'));console.log(JSON.stringify({filters:filters.samples.length}));
 const inspectorPage=await context.newPage(),inspectors=await verifyInspectorConsistency(inspectorPage,origin,path.join(output,'inspectors'));assert.deepEqual(errors,[]);
 const result={version:config.version,runtimeGitHubCommit:config.commit,sourceHashesMatched:Object.keys(metadata.provenance.sources).length,artifactHashesMatched:artifacts,installedPackage:true,sourceAlias:false,fields,filters,inspectors,errors};
 await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({version:config.version,artifacts,fields:fields.samples.length,filters:filters.samples.length,inspectors:inspectors.samples.length,glyphPaint:inspectors.paint.length,errors,output}));
}finally{await browser.close();if(server)await new Promise(resolve=>server.close(resolve));}
