import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const root = import.meta.dirname;
const output = path.join(root, '.diagnostics-chat-artifact');
await fs.mkdir(output, {recursive:true});
await build({absWorkingDir:root,entryPoints:['references/artifact-model.ts'],outdir:output,bundle:true,format:'esm',platform:'node',outExtension:{'.js':'.mjs'}});
const model = await import(pathToFileURL(path.join(output,'artifact-model.mjs')));
const results = [];
async function check(name,run){try{const evidence=await run();results.push({name,status:'passed',evidence});console.log('PASS '+name);}catch(error){results.push({name,status:'failed',error:error.stack});console.log('FAIL '+name+': '+error.message);}}

await check('artifact-model-version-proposal-recovery',()=>{
  let doc=model.blankArtifact('thread-1');
  doc={...doc,title:'Brief',body:'Manual draft'};
  doc=model.saveArtifactVersion(doc,'v1',1);
  assert.equal(doc.revisions.length,1);
  assert.equal(model.saveArtifactVersion(doc,'ignored',2),doc);
  const proposal=model.proposeMessage(doc,'message-1','Suggested text');
  assert.equal(proposal.body,'Manual draft');
  assert.throws(()=>model.acceptProposal({...proposal,body:'New manual text'},'v2',2));
  doc=model.acceptProposal(proposal,'v2',2);
  assert.equal(doc.body,'Suggested text');
  assert.equal(doc.revisions.length,2);
  const restored=model.restoreArtifactVersion(doc,'v1');
  assert.equal(restored.body,'Manual draft');
  assert.deepEqual(model.readArtifact(model.serializeArtifact(doc),'thread-1'),doc);
  assert.throws(()=>model.readArtifact(model.serializeArtifact(doc),'thread-2'));
  assert.throws(()=>model.readArtifact('{"version":1}','thread-1'));
  let bounded=doc;
  for(let index=3;index<=32;index++) bounded=model.saveArtifactVersion({...bounded,body:'Revision '+index},'v'+index,index);
  assert.equal(bounded.revisions.length,30);
  assert.throws(()=>model.restoreArtifactVersion(bounded,'v1'));
  return{manualVersion:true,proposalRequiresAcceptance:true,staleProposalGuard:true,restore:true,threadIsolation:true,boundedHistory:true};
});

const server=await createPilotServer({port:0});
const url='http://127.0.0.1:'+server.address().port+'/references/chat.html';
const browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.setDefaultTimeout(8000);
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const panel=()=>page.locator('.chat-artifact');
async function ready(){await page.locator('#chat-input').waitFor();await page.waitForFunction(()=>document.getElementById('chat-save-state').textContent.includes('Сохранено'));}
try{
  await page.goto(url,{waitUntil:'networkidle'});await ready();
  await check('artifact-edit-preview-version-and-reload',async()=>{
    await page.locator('#chat-open-artifact').click();
    await panel().waitFor();
    assert.equal(await panel().locator('.seda-field').count()>0,true);
    await page.locator('#artifact-title').fill('Рабочий brief');
    await page.locator('#artifact-body').fill('Первая версия\nДетали проекта');
    await page.locator('#artifact-save-version').click();
    assert.match(await panel().textContent(),/Версий: 1/);
    await page.getByRole('tab',{name:'Просмотр'}).click();
    assert.match(await page.locator('#artifact-preview').textContent(),/Первая версия/);
    await page.screenshot({path:path.join(output,'artifact-dark-1440.png'),animations:'disabled'});
    await page.reload({waitUntil:'networkidle'});await ready();
    await panel().waitFor();
    assert.equal(await page.locator('#artifact-title').inputValue(),'Рабочий brief');
    await page.getByRole('tab',{name:'Редактирование'}).click();
    assert.equal(await page.locator('#artifact-body').inputValue(),'Первая версия\nДетали проекта');
    return{installedControls:true,preview:true,version:true,reload:true};
  });
  await check('artifact-message-accept-restore-and-thread-isolation',async()=>{
    await page.locator('.chat-message--assistant').last().getByRole('button',{name:'В артефакт'}).click();
    await page.locator('#artifact-accept').waitFor();
    assert.equal(await page.locator('#artifact-body').inputValue(),'Первая версия\nДетали проекта');
    await page.locator('#artifact-accept').click();
    assert.match(await panel().textContent(),/Версий: 2/);
    const accepted=await page.locator('#artifact-body').inputValue();
    assert.notEqual(accepted,'Первая версия\nДетали проекта');
    await page.locator('#artifact-version').selectOption({index:0});
    await page.locator('#artifact-restore').click();
    assert.equal(await page.locator('#artifact-body').inputValue(),'Первая версия\nДетали проекта');
    await page.locator('#chat-new').click();
    await panel().waitFor();
    assert.equal(await page.locator('#artifact-title').inputValue(),'Новый артефакт');
    await page.goBack();await ready();await panel().waitFor();
    assert.equal(await page.locator('#artifact-title').inputValue(),'Рабочий brief');
    assert.equal(await page.locator('#artifact-accept').count(),0);
    await page.locator('#chat-open-artifact').click();
    await page.locator('#chat-open-artifact').click();
    await panel().waitFor();
    assert.equal(await page.locator('#artifact-accept').count(),0);
    return{explicitAcceptance:true,restore:true,perThreadDocument:true,noStaleProposalReplay:true};
  });
  await check('artifact-dense-themes-and-corrupt-recovery',async()=>{
    await page.locator('.chat-message--assistant').last().getByRole('button',{name:'В артефакт'}).click();
    await page.locator('#artifact-accept').waitFor();
    for(const theme of ['dark','light']){
      await page.getByRole('button',{name:'Параметры SEDA',exact:true}).click();
      await page.locator('#chat-theme').selectOption(theme);
      await page.locator('#chat-size').selectOption('xl');
      await page.locator('#chat-scale').selectOption('150');
      await page.locator('#chat-x').fill('24');
      await page.locator('#chat-y').fill('12');
      await page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();
      const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,panel:document.querySelector('.chat-artifact').getBoundingClientRect().toJSON(),button:document.getElementById('artifact-save-version').getBoundingClientRect().toJSON()}));
      assert.equal(geometry.overflow,0);
      assert.ok(geometry.panel.width>=300 && geometry.button.width>0);
      const action=await page.evaluate(()=>{const panel=document.querySelector('.chat-artifact').getBoundingClientRect(),button=document.getElementById('artifact-accept').getBoundingClientRect();return{panelRight:panel.right,buttonRight:button.right,buttonLeft:button.left,panelLeft:panel.left};});
      assert.ok(action.buttonRight<=action.panelRight+1 && action.buttonLeft>=action.panelLeft-1,JSON.stringify(action));
      await page.screenshot({path:path.join(output,`artifact-${theme}-xl.png`),animations:'disabled'});
    }
    await page.setViewportSize({width:1280,height:900});
    const narrow=await page.evaluate(()=>({navigation:getComputedStyle(document.querySelector('.chat-navigation')).display,panel:document.querySelector('.chat-artifact').getBoundingClientRect().width,overflow:document.documentElement.scrollWidth-innerWidth}));
    assert.equal(narrow.navigation,'none');
    assert.ok(narrow.panel>=400);
    assert.equal(narrow.overflow,0);
    await page.screenshot({path:path.join(output,'artifact-light-xl-1280.png'),animations:'disabled'});
    await page.evaluate(()=>{window.artifactOriginalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Quota','QuotaExceededError');};});
    try {
      await page.locator('#artifact-title').fill('Черновик при ошибке сохранения');
      await page.locator('#artifact-retry-save').waitFor();
      assert.equal(await page.locator('#artifact-title').inputValue(),'Черновик при ошибке сохранения');
    } finally {
      await page.evaluate(()=>{Storage.prototype.setItem=window.artifactOriginalSet;delete window.artifactOriginalSet;});
    }
    await page.locator('#artifact-retry-save').click();
    await page.waitForFunction(()=>document.getElementById('artifact-save-state')?.textContent.includes('Сохранено'));
    const threadId=new URL(page.url()).searchParams.get('thread')??'design';
    await page.evaluate(key=>localStorage.setItem(key,'{"version":1,"threadId":"wrong"}'),model.artifactKey(threadId));
    await page.reload({waitUntil:'networkidle'});await ready();
    await page.getByRole('button',{name:'Создать пустой артефакт'}).waitFor();
    assert.equal(await page.evaluate(key=>localStorage.getItem(key),model.artifactKey(threadId)),'{"version":1,"threadId":"wrong"}');
    await page.getByRole('button',{name:'Создать пустой артефакт'}).click();
    assert.equal(await page.locator('#artifact-title').inputValue(),'Новый артефакт');
    return{themes:2,dense:true,narrowNavigation:true,noPageOverflow:true,quotaRetry:true,corruptDataExplicitRecovery:true};
  });
  await check('artifact-no-browser-errors',()=>{assert.deepEqual(errors,[]);return{errors};});
}finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));
  const report={passed:results.filter(result=>result.status==='passed').length,failed:results.filter(result=>result.status==='failed').length,results,errors};
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:report.passed,failed:report.failed,output}));
}
if(results.some(result=>result.status==='failed'))process.exitCode=1;
