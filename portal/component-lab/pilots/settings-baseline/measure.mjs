import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { verifyBuild,sha256,gitBlobSha } from './provenance.mjs';
const require=createRequire(import.meta.url);
const repoRoot=path.resolve(process.env.SEDA_REPO_ROOT || path.join(import.meta.dirname,'../../../..'));
const buildMetadata=await verifyBuild(import.meta.dirname,repoRoot);
const out=path.resolve(process.env.SEDA_BASELINE_OUTPUT || path.join(import.meta.dirname,'.diagnostics'));
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1100,height:850},deviceScaleFactor:1});
const consoleErrors=[];
page.on('pageerror',err=>consoleErrors.push(String(err)));
page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text());});
await page.goto(process.env.SEDA_BASELINE_URL || 'http://127.0.0.1:5183/',{waitUntil:'networkidle'});
const servedBase=new URL(page.url());
for(const item of buildMetadata.bundleArtifacts){
  const response=await page.request.get(new URL('/'+item.path,servedBase).href);
  if(!response.ok()||sha256(await response.body())!==item.sha256)throw new Error(`Server bundle differs from fresh local build: ${item.path}`);
}
for(const [url,name] of [['/tokens.json','tokens.json'],['/portal-tokens.js','portal/portal-tokens.js']]){
  const response=await page.request.get(new URL(url,servedBase).href);
  const expected=buildMetadata.sourceProvenance.files.find(f=>f.path===name).actualGitBlobSha;
  if(!response.ok()||gitBlobSha(await response.body())!==expected)throw new Error(`Served source differs from build metadata: ${name}`);
}
await page.waitForFunction(()=>window.SEDA_TOKENS && window.baselineApi);
const settle=async()=>{await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await page.waitForTimeout(180);};
async function config(data){await page.evaluate(d=>{for(const [k,v] of Object.entries(d))window.baselineApi['set'+k[0].toUpperCase()+k.slice(1)](v);},data);await settle();}
async function read(){return page.evaluate(()=>{
  const one=sel=>{const el=document.querySelector(sel), s=getComputedStyle(el),r=el.getBoundingClientRect();return {width:r.width,height:r.height,x:r.x,y:r.y,boxSizing:s.boxSizing,fontSize:s.fontSize,lineHeight:s.lineHeight,fontFamily:s.fontFamily,fontWeight:s.fontWeight,borderRadius:s.borderRadius,minHeight:s.minHeight,padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft],border:[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth],background:s.backgroundColor,color:s.color,borderColor:s.borderColor,outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,outlineColor:s.outlineColor,outlineOffset:s.outlineOffset,boxShadow:s.boxShadow,opacity:s.opacity,focus:el===document.activeElement,focusVisible:el.matches(':focus-visible'),variant:el.getAttribute('data-variant')};};
  const field=document.querySelector('.seda-field'),input=document.querySelector('#project-name');
  const root=getComputedStyle(document.documentElement);
  return {state:window.baselineApi.getState(),button:one('#save-button'),iconButton:one('#help-button'),fieldControl:one('.seda-field__control'),fieldInput:one('#project-name'),fieldLabel:one('.seda-field__label'),fieldMessage:one('.seda-field__message'),fieldState:field.dataset.state,inputDisabled:input.disabled,inputReadOnly:input.readOnly,ariaInvalid:input.getAttribute('aria-invalid'),ariaDescribedBy:input.getAttribute('aria-describedby'),inputValue:input.value,tokenVars:Object.fromEntries(['--text-primary','--container-brand-default','--button-primary-surface-default','--icon-button-neutral-surface-default','--focus-ring'].map(n=>[n,root.getPropertyValue(n).trim()])),inlineTokenVariableCount:document.documentElement.style.length};
});}
const data={referenceCommit:buildMetadata.referenceCommit,sourceProvenance:buildMetadata.sourceProvenance,bundleArtifacts:buildMetadata.bundleArtifacts,builtAt:buildMetadata.builtAt,generatedAt:new Date().toISOString(),environment:{node:process.version,browser:browser.version(),playwright:require('playwright/package.json').version,react:require('react/package.json').version,reactDom:require('react-dom/package.json').version,esbuild:require('esbuild/package.json').version,viewport:{width:1100,height:850},deviceScaleFactor:1,hostTypography:'body font:16px/24px system-ui,sans-serif; component font-family is original package CSS',globalBoxSizingReset:false},profiles:[],observations:{}};
for(const theme of ['light','dark'])for(const size of ['s','m','l','xl']){await config({theme,size,loading:false,fieldMode:'default'});data.profiles.push(await read());}
await config({theme:'light',size:'m',loading:false,fieldMode:'default'});
await page.mouse.move(1000,750);
data.observations.lightDefault=await read();
await page.screenshot({path:path.join(out,'baseline-light-m.png'),fullPage:true,animations:'disabled'});
await page.locator('#save-button').hover();
await page.waitForTimeout(160);
data.observations.buttonHover=await read();
await page.mouse.move(1000,750);
await config({loading:true});
data.observations.loading=await read();
data.observations.loadingAccessibleSnapshot=await page.locator('#save-button').ariaSnapshot();
const beforeSubmit=await page.evaluate(()=>window.baselineApi.getState().submitCount);
let b=await page.locator('#save-button').boundingBox();
await page.mouse.click(b.x+b.width/2,b.y+b.height/2);
await settle();
const afterMouse=await page.evaluate(()=>window.baselineApi.getState().submitCount);
await page.locator('#project-name').focus();
await page.keyboard.press('Enter');
await settle();
const afterEnter=await page.evaluate(()=>window.baselineApi.getState().submitCount);
await page.locator('#settings-form').evaluate(form=>form.requestSubmit());
await settle();
const afterRequestSubmit=await page.evaluate(()=>window.baselineApi.getState().submitCount);
data.observations.loadingActivation={beforeSubmit,afterMouse,enterTarget:'project-name input',afterEnter,requestSubmitTarget:'settings-form without submitter argument',afterRequestSubmit};
await config({loading:false,submitCount:0,notice:''});
await page.locator('#harness-loading').focus();
await page.keyboard.press('Tab');
data.observations.keyboardFocus=await read();
await config({fieldMode:'errorText'});
data.observations.focusedErrorText=await read();
await page.screenshot({path:path.join(out,'baseline-error-focus-m.png'),fullPage:true,animations:'disabled'});
data.fieldModes=[];
for(const fieldMode of ['default','errorText','state-error','state-disabled','disabled','readOnly']){await config({fieldMode});data.fieldModes.push(await read());}
await config({fieldMode:'state-disabled'});
await page.locator('#project-name').fill('Изменено при state=disabled');
data.observations.stateDisabledCanEdit=await page.locator('#project-name').inputValue();
await config({projectName:'SEDA AI',fieldMode:'default',theme:'dark'});
await page.locator('#project-name').blur();
data.observations.darkDefault=await read();
await page.screenshot({path:path.join(out,'baseline-dark-m.png'),fullPage:true,animations:'disabled'});
data.consoleErrors=consoleErrors;
await fs.writeFile(path.join(out,'measurements.json'),JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({output:out,browser:data.environment.browser,profileCount:data.profiles.length,buttonWidth:data.observations.lightDefault.button.width,loadingWidth:data.observations.loading.button.width,fieldHeights:data.profiles.filter(x=>x.state.theme==='light').map(x=>[x.state.size,x.fieldControl.height]),focusOutline:data.observations.keyboardFocus.fieldInput.outlineStyle,errors:consoleErrors},null,2));
await browser.close();
