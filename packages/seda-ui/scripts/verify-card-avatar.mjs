import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {textContrast} from './verify-colors.mjs';

/** A real installed consumer: identities, entity cards and their shared Table selection. */
export async function verifyCardAvatar({cwd,browser}) {
  await fs.writeFile(path.join(cwd,'surfaces-consumer.mjs'),String.raw`
import React,{useState,useEffect,useRef} from 'react';
import {SedaProvider,Avatar,AvatarGroup,Card,Table,Button,Text,Tag} from '@seda-ai/ui';
const h=React.createElement;
const never=new Promise(()=>{});function SurfaceGate({blocked}){if(blocked){if(typeof window!=='undefined')window.surfaceGateAttempted=true;throw never;}return null;}
const people=[{id:'a',name:'Анна Смирнова'},{id:'b',name:'Mark Lee'},{id:'c',name:'张 三'}];
export function SurfaceConsumer(){
 const [config,setConfig]=useState({theme:'light',size:'m',scale:100,density:'medium',x:0,y:0,src:'/portrait.svg',suspend:false,loading:false,disabled:false,dir:'ltr'});
 const [selected,setSelected]=useState(false),[primary,setPrimary]=useState(0),[details,setDetails]=useState(0),[avatarActions,setAvatarActions]=useState(0),[showAll,setShowAll]=useState(false);
 const roster=useRef(null);
 useEffect(()=>{window.configureSurfaces=value=>setConfig(old=>({...old,...value}));window.beginAvatarTransition=()=>{window.surfaceGateAttempted=false;React.startTransition(()=>setConfig(old=>({...old,src:'/transition-b.svg',suspend:true})));};return()=>{delete window.configureSurfaces;delete window.beginAvatarTransition;};},[]);
 useEffect(()=>{if(showAll)roster.current?.focus();},[showAll]);
 return h(SedaProvider,{id:'surface-provider',theme:config.theme,controlSize:config.size,textScale:config.scale,dir:config.dir,
  style:{padding:24,width:1000,maxWidth:'100%',boxSizing:'border-box','--seda-control-extra-padding-inline':config.x+'px','--seda-control-extra-padding-block':config.y+'px'}},
  h(Text,{as:'h1',variant:'heading/page'},'SEDA — Entity workspace'),
  h('div',{id:'identities',style:{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}},
   h(React.Suspense,{fallback:h('span',null,'Identity pending')},h(Avatar,{id:'image-avatar',name:'Анна Смирнова',src:config.src,loading:config.loading}),h(SurfaceGate,{blocked:config.suspend})),
   ...['xxs','xs','s','m','l','xl'].map(size=>h(Avatar,{key:size,id:'size-'+size,name:'Анна Смирнова',size})),
   h(Avatar,{id:'decorative-avatar',name:'Mark Lee',alt:''}),
   h(Avatar,{id:'icon-avatar',name:'Unnamed identity',initials:''}),
   h(Avatar,{id:'brand-avatar',name:'Atlas workspace',variant:'brand'}),
   h(Avatar,{id:'ai-avatar',name:'Assistant',variant:'ai'}),
   h(Avatar,{id:'status-avatar',name:'Анна Смирнова',status:'online',statusLabel:'В сети',selected:true}),
   h(Avatar,{id:'action-avatar',name:'Open Anna',onClick:()=>setAvatarActions(n=>n+1),disabled:config.disabled,loading:config.loading}),
   h(Avatar,{id:'tiny-action-avatar',name:'Tiny action',size:'xxs',onClick:()=>setAvatarActions(n=>n+1)}),
   h(Avatar,{id:'link-avatar',name:'Anna profile',href:'#profile',disabled:config.disabled}),
  ),
  h(AvatarGroup,{id:'member-group',label:'Project members',items:people,maxVisible:2,overflowLabel:'Show all members',onOverflow:()=>setShowAll(true)}),
  showAll&&h('div',{id:'all-members',role:'region','aria-label':'All members',tabIndex:-1,ref:roster},people.map(p=>h('p',{key:p.id},p.name))),
  h('div',{id:'cards',style:{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:16,marginTop:16}},
   h(Card,{id:'select-card',title:'Atlas workspace',description:'Рабочая область команды — проекты, документы и обсуждения.',metadata:'Core · обновлено сегодня',variant:'selectable',interactiveStrategy:'selectable',selected,onSelectedChange:setSelected,disabled:config.disabled,loading:config.loading,size:config.density,status:h(Tag,{tone:'success'},'Активный'),actions:h(Button,{disabled:config.loading,onClick:()=>setDetails(n=>n+1)},'Details')}),
   h(Card,{id:'action-card',title:'Open workspace',description:'One primary action; no nested interactive content.',metadata:'Action card',variant:'clickable',interactiveStrategy:'whole-card',onClick:()=>setPrimary(n=>n+1),loading:config.loading,disabled:config.disabled,size:config.density}),
   h(Card,{id:'link-card',title:'Project documentation',variant:'clickable',interactiveStrategy:'whole-card',href:'#documentation',loading:config.loading,disabled:config.disabled,size:config.density}),
   h(Card,{id:'media-card',variant:'media',title:'Document preview',description:'Media frame reserves its aspect ratio before the image arrives.',media:h('img',{src:'/preview.svg',alt:'Blue document preview'}),mediaAspectRatio:16/9,size:config.density}),
  ),
  h(Table,{id:'surface-table',label:'Project selection',columns:[{key:'title',header:'Project',type:'text',render:row=>h('span',null,h(Avatar,{name:row.title,alt:'',variant:'brand'}),' ',row.title)}],data:[{id:'a',title:'Atlas workspace'}],rowKey:r=>r.id,rowLabel:r=>r.title,selectedRowKeys:selected?['a']:[],onSelectionChange:keys=>setSelected(keys.includes('a'))}),
  h('div',{id:'profile'},'Anna profile'),h('div',{id:'documentation'},'Project documentation'),
  h('output',{id:'surface-state'},JSON.stringify({selected,primary,details,avatarActions,showAll})),
 );
}`);
  await fs.writeFile(path.join(cwd,'surfaces-ssr.mjs'),String.raw`
import React from 'react';import{renderToString}from'react-dom/server';import{Avatar,AvatarGroup,Card}from'@seda-ai/ui';import{SurfaceConsumer}from'./surfaces-consumer.mjs';
const h=React.createElement;const invalid=[
 [Avatar,{name:''}],[Avatar,{name:'Anna',shape:'square'}],[Avatar,{name:'Anna',size:32}],
 [Avatar,{name:'Anna',initials:'XYZ'}],[Avatar,{name:'Anna',status:'online'}],
 [Avatar,{name:'Anna',href:'/a',onClick:()=>{}}],
 [AvatarGroup,{label:'Members',overflowLabel:'More',items:[{id:'a',name:'A'},{id:'a',name:'B'}],maxVisible:1,onOverflow:()=>{}}],
 [AvatarGroup,{label:'Members',overflowLabel:'More',items:[{id:'a',name:'A'},{id:'b',name:'B'}],maxVisible:1}],
 [Card,{title:''}],[Card,{title:'Atlas',onClick:()=>{}}],
 [Card,{title:'Atlas',variant:'selectable',interactiveStrategy:'selectable'}],
 [Card,{title:'Atlas',variant:'clickable',interactiveStrategy:'whole-card',onClick:()=>{},actions:h('button',null,'Nested')}],
 [Card,{title:'Atlas',variant:'media',media:h('img',{src:'/a',alt:'Preview'})}],
];let rejected=0;for(const[Component,props]of invalid){try{renderToString(h(Component,props));}catch(error){if(error instanceof TypeError)rejected++;else throw error;}}
if(rejected!==invalid.length)throw Error('Surface rejection guard '+rejected+'/'+invalid.length);
if(!/<h2/.test(renderToString(h(Card,{title:'Section title',headingLevel:2}))))throw Error('Card heading level must control document outline');const empty=renderToString(h(Card,{title:'Only title',metadata:'',actions:false,status:false},[]));if(/seda-card__(metadata|actions|status|body)/.test(empty))throw Error('Known empty slots must not reserve rows');const errors=[];console.error=(...a)=>errors.push(a.join(' '));const html=renderToString(h(SurfaceConsumer));if(errors.length)throw Error(errors.join('\n'));process.stdout.write(html);`);
  const ssr=spawnSync(process.execPath,['surfaces-ssr.mjs'],{cwd,encoding:'utf8',windowsHide:true});
  assert.equal(ssr.status,0,ssr.stderr);
  await fs.writeFile(path.join(cwd,'surfaces-entry.mjs'),`import React from'react';import{hydrateRoot}from'react-dom/client';import{SurfaceConsumer}from'./surfaces-consumer.mjs';import'@seda-ai/ui/styles.css';hydrateRoot(document.getElementById('root'),React.createElement(React.StrictMode,null,React.createElement(SurfaceConsumer)));`);
  await build({absWorkingDir:cwd,entryPoints:['surfaces-entry.mjs'],outdir:path.join(cwd,'surfaces-web'),bundle:true,format:'esm'});
  const js=await fs.readFile(path.join(cwd,'surfaces-web/surfaces-entry.js')),css=await fs.readFile(path.join(cwd,'surfaces-web/surfaces-entry.css'));
  const pending=new Map();
  const svg=color=>`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="${color}"/><circle cx="48" cy="36" r="18" fill="white"/><path d="M16 96a32 32 0 0164 0" fill="white"/></svg>`;
  const server=createServer((req,res)=>{
    if(req.url==='/app.js'){res.setHeader('Content-Type','text/javascript');res.end(js);}
    else if(req.url==='/app.css'){res.setHeader('Content-Type','text/css');res.end(css);}
    else if(req.url==='/slow-a.svg'||req.url==='/slow-b.svg'||req.url==='/preview.svg'||req.url==='/transition-a.svg'){res.setHeader('Content-Type','image/svg+xml');pending.set(req.url,res);}
    else if(req.url==='/bad.svg'){res.writeHead(404);res.end();}
    else if(req.url?.endsWith('.svg')){res.setHeader('Content-Type','image/svg+xml');res.end(svg('#185abc'));}
    else{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body style="margin:0"><div id="root">'+ssr.stdout+'</div><script type="module" src="/app.js"></script></body></html>');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const page=await browser.newPage({viewport:{width:1100,height:1100}}),errors=[],samples=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().startsWith('Failed to load resource'))errors.push(message.text());});
  const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const configure=async next=>{await page.evaluate(value=>window.configureSurfaces(value),next);await settle();};
  const state=()=>page.locator('#surface-state').textContent().then(JSON.parse);
  const near=(a,b)=>assert.ok(Math.abs(a-b)<=1,JSON.stringify({a,b}));
  try{
    await page.goto('http://127.0.0.1:'+server.address().port,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.configureSurfaces);
    await page.waitForFunction(()=>document.getElementById('image-avatar').dataset.state==='image');
    const mediaBefore=await page.locator('#media-card .seda-card__media').boundingBox();const previewDeadline=Date.now()+15000;while(!pending.has('/preview.svg')){assert.ok(Date.now()<previewDeadline,'Preview request must start');await new Promise(resolve=>setTimeout(resolve,5));}pending.get('/preview.svg').end(svg('#185abc'));await page.locator('#media-card img').evaluate(node=>node.decode());const mediaAfter=await page.locator('#media-card .seda-card__media').boundingBox(),mediaFrameDelta=Math.abs(mediaAfter.height-mediaBefore.height);near(mediaAfter.height,mediaBefore.height);
    assert.equal(await page.locator('#decorative-avatar').getAttribute('aria-hidden'),'true');
    assert.equal(await page.locator('#size-m').getAttribute('aria-label'),'Анна Смирнова');
    assert.equal(await page.locator('#size-m .seda-avatar__fallback').textContent(),'АС');
    assert.match(await page.locator('#status-avatar').getAttribute('aria-label'),/В сети, Выбран/);
    assert.equal(await page.locator('#icon-avatar [data-seda-icon=user]').count(),1);
    assert.equal(await page.locator('#ai-avatar [data-seda-icon=ai]').count(),1);
    const imageBox=await page.locator('#image-avatar').boundingBox();
    await configure({src:'/transition-a.svg',suspend:false});const transitionDeadline=Date.now()+15000;while(!pending.has('/transition-a.svg')){assert.ok(Date.now()<transitionDeadline,'Transition A request must start');await new Promise(resolve=>setTimeout(resolve,5));}await page.evaluate(()=>window.beginAvatarTransition());await page.waitForFunction(()=>window.surfaceGateAttempted===true);pending.get('/transition-a.svg').end(svg('#245fba'));await page.waitForFunction(()=>document.getElementById('image-avatar').dataset.state==='image',null,{timeout:3000});assert.equal(await page.locator('#image-avatar img').getAttribute('src'),'/transition-a.svg');await configure({src:'/portrait.svg',suspend:false});
    await configure({src:'/slow-a.svg'});await page.waitForFunction(()=>document.querySelector('#image-avatar img')?.getAttribute('src')==='/slow-a.svg');
    const stale=await page.locator('#image-avatar img').elementHandle();
    await configure({src:'/slow-b.svg'});
    const deadline=Date.now()+15000;while(!pending.has('/slow-b.svg')){assert.ok(Date.now()<deadline,'Image B request must start');await new Promise(resolve=>setTimeout(resolve,5));}
    pending.get('/slow-b.svg').end(svg('#008040'));await page.waitForFunction(()=>document.getElementById('image-avatar').dataset.state==='image');
    pending.get('/slow-a.svg')?.end(svg('#c00000'));await stale.evaluate(node=>{node.dispatchEvent(new Event('error'));node.dispatchEvent(new Event('load'));});await settle();
    assert.equal(await page.locator('#image-avatar img').getAttribute('src'),'/slow-b.svg');
    assert.equal(await page.locator('#image-avatar').getAttribute('data-state'),'image');
    await configure({src:'/bad.svg'});await page.locator('#image-avatar img').waitFor({state:'detached'});
    assert.equal(await page.locator('#image-avatar .seda-avatar__fallback').textContent(),'АС');near((await page.locator('#image-avatar').boundingBox()).width,imageBox.width);
    const avatar=page.locator('#action-avatar');await avatar.focus();await avatar.press('Space');assert.equal((await state()).avatarActions,1);
    await configure({disabled:true});await avatar.press('Enter');assert.equal((await state()).avatarActions,1);assert.equal(await avatar.evaluate(n=>document.activeElement===n),true);await configure({disabled:false});
    const tiny=await page.locator('#tiny-action-avatar').boundingBox();near(tiny.width,16);await page.mouse.click(tiny.x-3,tiny.y+tiny.height/2);assert.equal((await state()).avatarActions,2);
    const overflow=page.getByRole('button',{name:'Show all members, ещё 1',exact:true});await overflow.focus();await overflow.press('Enter');assert.equal((await state()).showAll,true);assert.equal(await page.locator('#all-members p').count(),3);assert.equal(await page.locator('#all-members').evaluate(n=>document.activeElement===n),true);
    const card=page.locator('#select-card'),check=card.getByRole('checkbox',{name:'Atlas workspace',exact:true});await check.focus();await check.press('Space');assert.equal((await state()).selected,true);assert.equal(await page.locator('#surface-table').getByRole('checkbox',{name:'Выбрать Atlas workspace',exact:true}).isChecked(),true);
    await card.getByRole('button',{name:'Details',exact:true}).click();assert.equal((await state()).details,1);assert.equal((await state()).selected,true);
    await page.locator('#surface-table').getByRole('checkbox',{name:'Выбрать Atlas workspace',exact:true}).uncheck();assert.equal(await check.isChecked(),false);
    await page.locator('#action-card').focus();await page.locator('#action-card').press('Enter');await page.locator('#action-card').press('Space');assert.equal((await state()).primary,2);
    const before=await page.locator('#action-card').boundingBox();await configure({loading:true});await page.locator('#action-card').press('Enter');await check.press('Space');assert.equal((await state()).primary,2);assert.equal((await state()).selected,false);const loadingDelta=Math.abs((await page.locator('#action-card').boundingBox()).height-before.height);near(loadingDelta,0);await configure({loading:false});
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const scale of [100,150])for(const density of ['compact','medium','large']){
      await configure({theme,size,scale,density,x:scale===150?12:0,y:scale===150?6:0,src:'/portrait.svg'});
      const m=await page.evaluate(()=>{
        const card=document.getElementById('select-card'),css=getComputedStyle(card),title=getComputedStyle(card.querySelector('.seda-card__title')),metadata=getComputedStyle(card.querySelector('.seda-card__metadata'));
        const input=card.querySelector('input[type=checkbox]').getBoundingClientRect(),label=card.querySelector('.seda-card__title').getBoundingClientRect();return{selectionGap:label.x-input.right,paddingX:parseFloat(css.paddingInlineStart),paddingY:parseFloat(css.paddingTop),titleInk:title.color,metadataInk:metadata.color,surface:css.backgroundColor,avatar:[...document.querySelectorAll('#identities>.seda-avatar')].map(node=>{const s=getComputedStyle(node);return{id:node.id,w:node.getBoundingClientRect().width,h:node.getBoundingClientRect().height,ink:s.color,surface:s.backgroundColor};}),overflow:document.documentElement.scrollWidth-innerWidth};
      });
      assert.equal(m.overflow,0);near(m.selectionGap,8);const base={compact:12,medium:16,large:24}[density];near(m.paddingX,base+(scale===150?12:0));near(m.paddingY,base+(scale===150?6:0));
      for(const avatar of m.avatar){near(avatar.w,avatar.h);if(avatar.id.startsWith('size-'))near(avatar.w,{xxs:16,xs:20,s:24,m:32,l:40,xl:48}[avatar.id.slice(5)]);if(['brand-avatar','ai-avatar'].includes(avatar.id))assert.ok(textContrast(avatar.ink,[avatar.surface])>=4.5,JSON.stringify(avatar));}
      assert.ok(textContrast(m.titleInk,[m.surface])>=4.5,JSON.stringify(m));assert.ok(textContrast(m.metadataInk,[m.surface])>=4.5,JSON.stringify(m));samples.push({theme,size,scale,density,...m});
      if(size==='m'&&scale===100&&density==='medium')await page.screenshot({path:path.join(cwd,'surfaces-'+theme+'.png'),fullPage:true});
    }
    for(const theme of ['light','dark']){await configure({theme,size:'m',scale:100,density:'medium',x:0,y:0,loading:true});await page.screenshot({path:path.join(cwd,'surfaces-'+theme+'-loading.png'),fullPage:true});}await configure({loading:false});
    await configure({dir:'rtl',size:'m',scale:100,density:'medium',x:0,y:0});await page.screenshot({path:path.join(cwd,'surfaces-rtl.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    const result={installedPackage:true,sourceAlias:false,ssr:true,strictHydration:true,rejectedInputs:13,imageFallback:true,lateImageIgnored:true,concurrentImageSourceGuard:true,unicodeInitials:true,decorativeIdentity:true,statusText:true,keyboardAvatar:true,realOverflow:true,sharedCardTableSelection:true,independentCardActions:true,wholeCardKeyboard:true,loadingGeometry:true,loadingDelta,mediaFrameDelta,knownEmptySlotsOmitted:true,expandedSmallTarget:true,rtl:true,samples,errors};
    await fs.writeFile(path.join(cwd,'surfaces-results.json'),JSON.stringify(result,null,2)+'\n');return result;
  }finally{
    for(const response of pending.values())if(!response.writableEnded)response.end();
    await page.close();await new Promise(resolve=>server.close(resolve));
  }
}
