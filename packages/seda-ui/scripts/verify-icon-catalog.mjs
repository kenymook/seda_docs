import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createServer} from 'node:http';
import {build} from 'esbuild';
import {spawnSync} from 'node:child_process';
import {iconAssets} from './icon-assets.mjs';

async function verifyIconSourceAliases(cwd){
  const root=path.join(cwd,'icon-source-fixture'),folder=path.join(root,'assets/icons/seda');
  await fs.mkdir(path.join(root,'packages/seda-ui'),{recursive:true});
  await fs.cp(path.resolve(import.meta.dirname,'../../../assets/icons/seda'),folder,{recursive:true});
  const file=path.join(folder,'icons.json'),original=JSON.parse(await fs.readFile(file,'utf8'));
  assert.equal(iconAssets(path.join(root,'packages/seda-ui')).catalog.icons.length,26);
  const cases=[
    ['unsupported-angle',c=>c.icons.find(i=>i.name==='arrow-left').rotation=45],
    ['unattributed-rotation',c=>delete c.icons.find(i=>i.name==='arrow-left').derivedFrom],
    ['missing-source',c=>c.icons.find(i=>i.name==='arrow-left').derivedFrom='missing'],
    ['different-source-file',c=>c.icons.find(i=>i.name==='arrow-left').file='close.svg'],
    ['different-figma-source',c=>c.icons.find(i=>i.name==='arrow-left').figmaNodeId='0:0'],
    ['alias-chain',c=>c.icons.push({...c.icons.find(i=>i.name==='arrow-left'),name:'chain',derivedFrom:'arrow-left'})],
    ['duplicate-name',c=>c.icons.push({...c.icons[0]})],
  ],rejected=[];
  for(const[name,mutate]of cases){const c=structuredClone(original);mutate(c);await fs.writeFile(file,JSON.stringify(c));assert.throws(()=>iconAssets(path.join(root,'packages/seda-ui')),/Invalid derived SEDA icon|rotation requires|Duplicate SEDA icon/);rejected.push(name);}
  return{invalidModels:rejected,originalSVGFiles:new Set(original.icons.map(i=>i.file)).size};
}

export async function verifyIconCatalog({cwd,browser}) {
  const catalog=JSON.parse(await fs.readFile(path.join(cwd,'node_modules/@seda-ai/ui/dist/icon-catalog.json'),'utf8'));
  assert.equal(catalog.icons.length,26);
  assert.equal(new Set(catalog.icons.map(icon=>icon.file)).size,25);
  const alias=catalog.icons.find(icon=>icon.name==='arrow-left'),origin=catalog.icons.find(icon=>icon.name==='arrow-right');
  assert.equal(alias.derivedFrom,'arrow-right');assert.equal(alias.rotation,180);for(const key of['file','figmaNodeId','figmaName','style','sha256'])assert.equal(alias[key],origin[key]);
  const sourceValidation=await verifyIconSourceAliases(cwd);
  assert.equal(new Set(catalog.icons.map(icon=>icon.name)).size,catalog.icons.length);
  await fs.writeFile(path.join(cwd,'icon-invalid-ssr.mjs'),`import React from'react';import{renderToString}from'react-dom/server';import{Icon}from'@seda-ai/ui';for(const name of ['file','invented','__proto__','constructor',undefined]){let rejected=false;try{renderToString(React.createElement(Icon,{name}));}catch(error){if(error instanceof TypeError)rejected=true;else throw error;}if(!rejected)throw Error('Unknown icon must reject: '+name);}console.log('Unknown icon rejection passed');`);
  const rejection=spawnSync(process.execPath,['icon-invalid-ssr.mjs'],{cwd,encoding:'utf8',windowsHide:true});assert.equal(rejection.status,0,rejection.stderr);
  await fs.writeFile(path.join(cwd,'icon-catalog-entry.mjs'),`
    import React from 'react';import {createRoot} from 'react-dom/client';
    import {SedaProvider,Button,IconButton,Icon,DropdownMenu} from '@seda-ai/ui';import '@seda-ai/ui/styles.css';
    import catalog from '@seda-ai/ui/icons.json';
    const h=React.createElement,root=createRoot(document.getElementById('root'));
    window.configure=({theme='light',size='m',disabled=false}={})=>root.render(h(SedaProvider,{theme,controlSize:size},
      h('main',null,...catalog.icons.map(({name})=>h('section',{key:name},
        h(Button,{disabled,iconLeft:h(Icon,{name})},'Use '+name),
        h(IconButton,{disabled,'aria-label':'Icon only '+name,icon:h(Icon,{name})}))),
        h(Icon,{name:'info',label:'Standalone information'}),
        h(DropdownMenu,{triggerLabel:'Icon menu',items:[
          {id:'copy',label:'Copy',icon:h(Icon,{name:'copy'}),onSelect:()=>{}},
          {id:'delete',label:'Delete',danger:true,icon:h(Icon,{name:'trash'}),onSelect:()=>{}},
          {id:'blocked',label:'Blocked delete',danger:true,disabled:true,icon:h(Icon,{name:'trash'}),onSelect:()=>{}}
        ]}),h('div',{id:'orientation-probe',style:{display:'flex',gap:8,gridColumn:'1 / -1',padding:8}},
          h(Icon,{name:'arrow-right',label:'Right orientation probe','data-icon-probe':'right',style:{width:96,height:96}}),
          h(Icon,{name:'arrow-left',label:'Left orientation probe','data-icon-probe':'left',style:{width:96,height:96}})))));window.configure();
  `);
  await build({absWorkingDir:cwd,entryPoints:['icon-catalog-entry.mjs'],outdir:path.join(cwd,'icon-catalog-web'),bundle:true,format:'esm'});
  const js=await fs.readFile(path.join(cwd,'icon-catalog-web/icon-catalog-entry.js')),css=await fs.readFile(path.join(cwd,'icon-catalog-web/icon-catalog-entry.css'));
  const server=createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/app.js'?'text/javascript':req.url==='/app.css'?'text/css':'text/html');res.end(req.url==='/app.js'?js:req.url==='/app.css'?css:'<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"><style>main{display:grid;grid-template-columns:repeat(5,max-content);gap:16px;padding:24px}section{display:flex;gap:8px;align-items:center}</style></head><body><div id="root"></div><script type="module" src="/app.js"></script></body></html>');});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const page=await browser.newPage({viewport:{width:1500,height:800}}),samples=[],errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForSelector('[data-seda-icon]');
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl']){
      await page.evaluate(config=>window.configure(config),{theme,size});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const glyphs=await page.locator('section button [data-seda-icon]').evaluateAll(icons=>icons.map(icon=>{
        const button=icon.closest('button'),r=icon.getBoundingClientRect(),b=button.getBoundingClientRect(),s=getComputedStyle(icon);
        return{name:icon.dataset.sedaIcon,width:r.width,height:r.height,expected:parseFloat(getComputedStyle(button).getPropertyValue('--seda-preset-icon-size')),centerDelta:Math.abs(r.top+r.height/2-b.top-b.height/2),color:s.backgroundColor,ownerColor:getComputedStyle(button).color,mask:s.maskImage,hidden:icon.getAttribute('aria-hidden')};
      }));
      assert.equal(glyphs.length,catalog.icons.length*2);assert.equal(await page.getByRole('button',{name:'Icon menu',exact:true}).locator('[data-seda-icon=arrow-chevron-down]').count(),1);
      for(const glyph of glyphs){assert.equal(glyph.width,glyph.expected);assert.equal(glyph.height,glyph.expected);assert.ok(glyph.centerDelta<=1);assert.equal(glyph.color,glyph.ownerColor);assert.equal(glyph.hidden,'true');}
      samples.push({theme,size,glyphs:glyphs.map(({mask,...glyph})=>glyph)});
      if(size==='m')await page.screenshot({path:path.join(cwd,'icon-catalog-'+theme+'.png')});
    }
    // Verify every actual CSS mask, not just the exported catalog metadata.
    const masks=await page.locator('section .seda-button [data-seda-icon]').evaluateAll(icons=>icons.map(icon=>({name:icon.dataset.sedaIcon,mask:getComputedStyle(icon).maskImage})));
    const ink=[];
    for(const {name,mask}of masks){
      const data=mask.match(/data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/)?.[1];assert.ok(data,'Embedded SVG for '+name);
      assert.equal(crypto.createHash('sha256').update(Buffer.from(data,'base64')).digest('hex'),catalog.icons.find(icon=>icon.name===name).sha256);
      const pixels=await page.evaluate(async source=>{const image=new Image();image.src='data:image/svg+xml;base64,'+source;await image.decode();const canvas=document.createElement('canvas');canvas.width=24;canvas.height=24;const context=canvas.getContext('2d');context.drawImage(image,0,0,24,24);const bytes=context.getImageData(0,0,24,24).data;let count=0;for(let i=3;i<bytes.length;i+=4)if(bytes[i])count++;return count;},data);
      assert.ok(pixels>0,'Glyph paints non-empty alpha: '+name);ink.push({name,pixels});
      assert.equal(await page.getByRole('button',{name:'Use '+name,exact:true}).count(),1);
      assert.equal(await page.getByRole('button',{name:'Icon only '+name,exact:true}).count(),1);
    }
    assert.equal(await page.getByRole('img',{name:'Standalone information',exact:true}).count(),1);assert.deepEqual(errors,[]);
    // Remove only the fixture's opaque ancestor surfaces; preserve the actual Icon mask and paint.
    await page.evaluate(()=>{window.probeSurfaces=[];for(let el=document.getElementById('orientation-probe');el;el=el.parentElement){window.probeSurfaces.push([el,el.getAttribute('style')]);el.style.backgroundColor='transparent';}});
    const rightPNG=await page.locator('[data-icon-probe=right]').screenshot({omitBackground:true,path:path.join(cwd,'icon-arrow-right.png')}),leftPNG=await page.locator('[data-icon-probe=left]').screenshot({omitBackground:true,path:path.join(cwd,'icon-arrow-left.png')});
    await page.evaluate(()=>{for(const[el,style]of window.probeSurfaces)if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);delete window.probeSurfaces;});
    const orientation=await page.evaluate(async({right,left})=>{
      async function alpha(src){const image=new Image();image.src='data:image/png;base64,'+src;await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const a=ctx.getImageData(0,0,c.width,c.height).data;return{width:c.width,height:c.height,alpha:Array.from({length:c.width*c.height},(_,i)=>a[i*4+3])};}
      const r=await alpha(right),l=await alpha(left);if(r.width!==l.width||r.height!==l.height)throw Error('Orientation probe dimensions differ');let union=0,difference=0,unchangedUnion=0,unchangedDifference=0;
      for(let i=0;i<r.alpha.length;i++){const expected=l.alpha[l.alpha.length-1-i];if(r.alpha[i]||expected){union++;difference+=Math.abs(r.alpha[i]-expected);}if(r.alpha[i]||l.alpha[i]){unchangedUnion++;unchangedDifference+=Math.abs(r.alpha[i]-l.alpha[i]);}}
      return{width:r.width,height:r.height,ink:union,hasTransparency:r.alpha.some(a=>a===0)&&l.alpha.some(a=>a===0),rotationError:difference/(255*union),unrotatedError:unchangedDifference/(255*unchangedUnion)};
    },{right:rightPNG.toString('base64'),left:leftPNG.toString('base64')});
    assert.ok(orientation.ink>20&&orientation.hasTransparency,JSON.stringify(orientation));assert.ok(orientation.rotationError<.03&&orientation.unrotatedError>.15,'Actual rendered left arrow must be a180° source rotation: '+JSON.stringify(orientation));
    await page.emulateMedia({forcedColors:'active'});const forcedColors=[];
    for(const disabled of [false,true]){
      await page.evaluate(disabled=>window.configure({disabled}),disabled);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const colors=await page.locator('button [data-seda-icon]').evaluateAll(icons=>icons.map(icon=>({name:icon.dataset.sedaIcon,paint:getComputedStyle(icon).backgroundColor,owner:getComputedStyle(icon.closest('button')).color})));
      forcedColors.push({disabled,colors});
    }
    await fs.writeFile(path.join(cwd,'icon-forced-colors-results.json'),JSON.stringify(forcedColors,null,2));
    for(const sample of forcedColors)for(const color of sample.colors)assert.equal(color.paint,color.owner,JSON.stringify({disabled:sample.disabled,...color}));
    await page.getByRole('button',{name:'Icon menu',exact:true}).click();
    const forcedMenu=await page.getByRole('menuitem').evaluateAll(items=>items.map(item=>({name:item.textContent,disabled:item.getAttribute('aria-disabled')==='true',paint:getComputedStyle(item.querySelector('.seda-icon')).backgroundColor,owner:getComputedStyle(item).color})));
    await fs.writeFile(path.join(cwd,'icon-forced-menu-results.json'),JSON.stringify(forcedMenu,null,2));
    for(const row of forcedMenu)assert.equal(row.paint,row.owner,JSON.stringify(row));
    await page.screenshot({path:path.join(cwd,'icon-forced-colors.png')});assert.deepEqual(errors,[]);
    const result={installedPackage:true,sourceAlias:false,source:catalog.source,iconCount:catalog.icons.length,sourceValidation,orientation,samples,ink,forcedColors,forcedMenu,errors};
    await fs.writeFile(path.join(cwd,'icon-catalog-results.json'),JSON.stringify(result,null,2));return result;
  }catch(error){throw new Error(error.message+'\n'+errors.join('\n'),{cause:error});}
  finally{await page.close();await new Promise(resolve=>server.close(resolve));}
}
