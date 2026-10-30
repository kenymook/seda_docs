import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {textContrast} from './verify-colors.mjs';

/** Installed public consumer, SSR + Strict hydration, real native media and caller-owned actions. */
export async function verifyChatBubble({cwd,browser}){
 await fs.writeFile(path.join(cwd,'message-consumer.mjs'),String.raw`
import React,{useState,useEffect}from'react';import{ChatBubble,SedaProvider,Button,Text}from'@seda-ai/ui';
const h=React.createElement;
export function MessageConsumer(){
 const[c,set]=useState({theme:'light',size:'m',scale:100,view:'bubble',x:0,y:0,text:'Первый фрагмент',streaming:true,image:'/ok.svg',group:'single',dir:'ltr',failed:true});
 const[copies,copy]=useState(0),[files,file]=useState(0),[retried,retry]=useState(0);
 useEffect(()=>{window.configureMessages=p=>set(old=>({...old,...p}));return()=>{delete window.configureMessages;};},[]);
 const base={appearance:c.view,groupPosition:c.group};
 return h(SedaProvider,{id:'messages',theme:c.theme,controlSize:c.size,textScale:c.scale,dir:c.dir,style:{padding:24,width:900,maxWidth:'100%',boxSizing:'border-box',background:'var(--surface-base)','--seda-control-extra-padding-inline':c.x+'px','--seda-control-extra-padding-block':c.y+'px'}},
 h(Text,{as:'h1',variant:'heading/page'},'SEDA · Сообщения'),
 h('div',{style:{display:'grid',gap:24}},
 ...['incoming','outgoing','ai','system'].map(sender=>h(ChatBubble,{...base,id:'sender-'+sender,key:sender,sender,author:sender==='ai'?'SEDA Assistant':'Анна',...(sender==='ai'?{aiLabel:'AI · тестовый пример'}:{}),avatar:{initials:'АС'},contentType:'text',content:'Согласованные сообщения\nВторая строка',timestamp:'Сегодня, 12:30',dateTime:'2026-10-25T12:30:00+03:00'})),
 h(ChatBubble,{...base,id:'stream',sender:'incoming',author:'Локальный образец',contentType:'text',content:c.text,...(c.streaming?{streaming:true,announcementPolicy:'status-only',statusLabel:'Ответ формируется'}:{statusLabel:'Ответ готов'}),actions:h(Button,{id:'copy-stream',onClick:()=>copy(n=>n+1)},'Копировать ответ')}),
 h(ChatBubble,{...base,id:'failure',sender:'outgoing',author:'Вы',contentType:'text',content:'Сохранённый текст сообщения',...(c.failed?{deliveryStatus:'error',statusLabel:'Не удалось отправить',recovery:{label:'Повторить отправку',onClick:()=>{retry(n=>n+1);set(v=>({...v,failed:false}));}}}:{deliveryStatus:'sent',statusLabel:'Отправлено'})}),
 h(ChatBubble,{...base,id:'code',sender:'incoming',author:'Анна',contentType:'code',content:{languageLabel:'TypeScript',code:'const message = "safe";\n  console.log(message);',copyLabel:'Копировать код',onCopy:()=>copy(n=>n+1)}}),
 h(ChatBubble,{...base,id:'file',sender:'incoming',author:'Анна',contentType:'file',content:{name:'handoff.md',description:'Markdown · 64 байта',action:{label:'Открыть handoff',onClick:()=>file(n=>n+1)}}}),
 h(ChatBubble,{...base,id:'image',sender:'incoming',author:'Анна',contentType:'image',content:{src:c.image,alt:'Тестовое изображение',width:300,height:200,loadingLabel:'Загрузка изображения',errorLabel:'Не удалось загрузить изображение',retryLabel:'Повторить загрузку'}}),
 h(ChatBubble,{...base,id:'audio',sender:'incoming',author:'Анна',contentType:'audio',content:{src:'/sample.wav',name:'Тестовая тишина · 2 секунды',transcript:{unavailableLabel:'Запись без речи; текст не требуется'},errorLabel:'Не удалось загрузить аудио',retryLabel:'Повторить аудио'}}),
 h(ChatBubble,{...base,id:'grouped',sender:'ai',aiLabel:'AI · источник обязателен',author:'Assistant',authorVisibility:'accessible',contentType:'rich',content:h(Text,{variant:'body/large'},'<script> remains text'),actions:false,reactions:'',attachments:h(React.Fragment,null,false)})),
 h('output',{id:'counts'},JSON.stringify({copies,files,retried})),h('output',{id:'config'},JSON.stringify(c)));
}`);
 await fs.writeFile(path.join(cwd,'message-ssr.mjs'),String.raw`
import React from'react';import{renderToString}from'react-dom/server';import{ChatBubble}from'@seda-ai/ui';import{MessageConsumer}from'./message-consumer.mjs';const h=React.createElement;
const valid={sender:'incoming',author:'Anna',contentType:'text',content:'Hello'};
const invalid=[{author:''},{content:''},{contentType:'made-up'},{sender:'ai'},{sender:'incoming',aiLabel:'AI'},{streaming:true},{streaming:true,announcementPolicy:'status-only',statusLabel:'Busy',deliveryStatus:'read'},{deliveryStatus:'read'},{deliveryStatus:'error',statusLabel:'Error'},{recovery:{label:'Retry',onClick:()=>{}}},{dateTime:'not a date',timestamp:'Today'},{groupPosition:'next'},{appearance:'custom'},{size:32},{contentType:'rich',content:h(React.Fragment,null,' ',false)},{contentType:'image',content:{src:'/a',alt:'',width:300,height:200}},{contentType:'file',content:{name:'a',description:'a',action:{label:'Open'}}},{contentType:'audio',content:{src:'/a',name:'Voice'}},{contentType:'code',content:{code:'abc',languageLabel:'JS'}}];
for(const patch of invalid){let rejected=false;try{renderToString(h(ChatBubble,{...valid,...patch}));}catch(e){if(e instanceof TypeError)rejected=true;else throw e;}if(!rejected)throw Error('Missing message guard '+JSON.stringify(patch));}
const errors=[];console.error=(...a)=>errors.push(a.join(' '));const html=renderToString(h(MessageConsumer));if(errors.length)throw Error(errors.join('\n'));process.stdout.write(html);`);
 const ssr=spawnSync(process.execPath,['message-ssr.mjs'],{cwd,encoding:'utf8',windowsHide:true});assert.equal(ssr.status,0,ssr.stderr);
 await fs.writeFile(path.join(cwd,'message-entry.mjs'),`import React from'react';import{hydrateRoot}from'react-dom/client';import{MessageConsumer}from'./message-consumer.mjs';import'@seda-ai/ui/styles.css';hydrateRoot(document.getElementById('root'),React.createElement(React.StrictMode,null,React.createElement(MessageConsumer)));`);
 const bundle=await build({absWorkingDir:cwd,entryPoints:['message-entry.mjs'],outdir:path.join(cwd,'message-web'),bundle:true,format:'esm',tsconfigRaw:{compilerOptions:{}},metafile:true});
 assert.ok(Object.keys(bundle.metafile.inputs).some(file=>file.replaceAll('\\','/').includes('node_modules/@seda-ai/ui/dist/')),'Consume the installed public package');
 assert.ok(!Object.keys(bundle.metafile.inputs).some(file=>file.replaceAll('\\','/').includes('packages/seda-ui/src/')),'Source aliases are forbidden');
 const js=await fs.readFile(path.join(cwd,'message-web/message-entry.js')),css=await fs.readFile(path.join(cwd,'message-web/message-entry.css'));
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="#1964b8"/></svg>';
 const wav=Buffer.alloc(44+32000);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(32000,40);
 let retries=0;
 const server=createServer((req,res)=>{
  if(req.url==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}
  else if(req.url==='/app.css'){res.setHeader('Content-Type','text/css');res.end(css);}
  else if(req.url==='/sample.wav'){res.setHeader('Content-Type','audio/wav');res.end(wav);}
  else if(req.url==='/bad.svg'||req.url==='/retry.svg'&&retries++===0){res.writeHead(404);res.end();}
  else if(req.url?.endsWith('.svg')){res.setHeader('Content-Type','image/svg+xml');res.end(svg);}
  else{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body style="margin:0"><div id="root">'+ssr.stdout+'</div><script type="module" src="/app.js"></script></body></html>');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const context=await browser.newContext(),page=await context.newPage(),errors=[],samples=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});
 async function configure(patch){await page.evaluate(p=>window.configureMessages(p),patch);await page.waitForFunction(p=>{const c=JSON.parse(document.getElementById('config').textContent);return Object.entries(p).every(([k,v])=>c[k]===v);},patch);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
 try{
  await page.setViewportSize({width:1000,height:1100});await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.configureMessages);await page.locator('#image img').evaluate(i=>i.decode());
  for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const scale of [100,150])for(const view of ['bubble','neutral','plain']){
   await configure({theme,size,scale,view,x:scale===150?24:0,y:scale===150?12:0});
   const m=await page.evaluate(()=>{const color=s=>{const n=document.querySelector(s+' .seda-chat-bubble__surface');return{fg:getComputedStyle(n).color,bg:getComputedStyle(n).backgroundColor};};const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return{w:r.width,h:r.height};};return{ai:color('#sender-ai'),outgoing:color('#sender-outgoing'),base:getComputedStyle(document.getElementById('messages')).backgroundColor,overflow:document.documentElement.scrollWidth-innerWidth,media:rect('#image .seda-chat-bubble__image-frame')};});
   assert.equal(m.overflow,0);for(const colors of [m.ai,m.outgoing])assert.ok(textContrast(colors.fg,[colors.bg,m.base])>=4.5,JSON.stringify({theme,view,colors}));assert.ok(Math.abs(m.media.w/m.media.h-1.5)<.01);samples.push({theme,size,scale,view,...m});
   if(size==='m'&&scale===100&&view==='bubble')await page.screenshot({path:path.join(cwd,'messages-'+theme+'.png'),fullPage:true});
  }
  await configure({theme:'light',size:'m',scale:100,view:'plain',x:0,y:0,group:'middle',dir:'rtl'});
  assert.equal(await page.locator('#sender-ai .seda-chat-bubble__avatar').count(),0);assert.equal(await page.locator('#grouped .seda-chat-bubble__source').textContent(),'AI · источник обязателен');for(const empty of ['actions','reactions','attachments'])assert.equal(await page.locator('#grouped .seda-chat-bubble__'+empty).count(),0);
  const status=await page.locator('#stream .seda-chat-bubble__status').elementHandle();await page.evaluate(()=>{window.messageStatusMutations=0;window.messageObserver=new MutationObserver(r=>window.messageStatusMutations+=r.length);window.messageObserver.observe(document.querySelector('#stream .seda-chat-bubble__status'),{subtree:true,characterData:true,childList:true});});
  for(const text of ['First','First second','First second third'])await configure({text});assert.equal(await page.evaluate(()=>window.messageStatusMutations),0);assert.equal(await page.locator('#stream .seda-chat-bubble__body').getAttribute('aria-live'),'off');await configure({streaming:false});assert.ok(await page.locator('#stream .seda-chat-bubble__status').evaluate((el,old)=>el===old,status));await page.evaluate(()=>window.messageObserver.disconnect());
  await page.getByRole('button',{name:'Копировать код',exact:true}).focus();await page.keyboard.press('Enter');await page.getByRole('button',{name:'Открыть handoff',exact:true}).click();await page.getByRole('button',{name:'Повторить отправку',exact:true}).click();assert.deepEqual(JSON.parse(await page.locator('#counts').textContent()),{copies:1,files:1,retried:1});assert.equal(await page.locator('#failure .seda-chat-bubble__status').textContent(),'Отправлено');
  await configure({image:'/retry.svg'});await page.getByText('Не удалось загрузить изображение',{exact:true}).waitFor();const before=await page.locator('#image .seda-chat-bubble__image-frame').boundingBox();await page.getByRole('button',{name:'Повторить загрузку',exact:true}).click();await page.waitForFunction(()=>getComputedStyle(document.querySelector('#image img')).visibility==='visible');const after=await page.locator('#image .seda-chat-bubble__image-frame').boundingBox();assert.ok(Math.abs(before.width-after.width)<=1&&Math.abs(before.height-after.height)<=1);assert.equal(retries,2);
  await page.locator('#audio audio').evaluate(async a=>{if(a.readyState<1)await new Promise(r=>a.addEventListener('loadedmetadata',r,{once:true}));if(Math.abs(a.duration-2)>.01||!a.controls||a.autoplay)throw Error('Native audio policy');a.currentTime=1;await a.play();a.pause();});
  await configure({image:'/ok.svg'});await page.locator('#image img').evaluate(i=>i.decode());assert.deepEqual(errors,[]);
  const result={scope:'48 selected density/theme/view combinations; native media, keyboard actions, SSR/Strict hydration, empty-content rejection and status-only streaming; not AT/Figma/native-shell certification',samples,invalidModels:19,streamChunks:3,statusNodeStable:true,perChunkStatusMutations:0,imageRetryRequests:retries,imageFrameDelta:{width:after.width-before.width,height:after.height-before.height},nativeAudio:{duration:2,seek:1,playPause:true},errors};await fs.writeFile(path.join(cwd,'messages-results.json'),JSON.stringify(result,null,2)+'\n');return result;
 }catch(error){await fs.writeFile(path.join(cwd,'messages-failure.json'),JSON.stringify({error:error.stack,errors,html:await page.content()},null,2));await page.screenshot({path:path.join(cwd,'messages-failure.png'),fullPage:true});throw error;}finally{await context.close();await new Promise(r=>server.close(r));}
}
