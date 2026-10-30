import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {chromium} from 'playwright';

const entry=`import React,{useState} from 'react';import{createRoot}from'react-dom/client';import{EmptyState,SedaProvider}from'./dist/index.js';function Demo(){const [theme,T]=useState('light'),[size,S]=useState('s'),[count,C]=useState(0);return <SedaProvider theme={theme} controlSize={size}><button onClick={()=>T(theme==='light'?'dark':'light')}>Theme</button><select aria-label="Size" value={size} onChange={e=>S(e.target.value)}>{['s','m','l','xl'].map(x=><option key={x}>{x}</option>)}</select><div id="frame" style={{width:240}}><EmptyState reason="no-results" title="No results" description="Change the search or filters" media={<span>Decorative icon</span>} primaryAction={{label:'Reset filters',onAction:()=>C(count+1)}} secondaryAction={{label:'Help',onAction:()=>C(count+10)}} /></div><output>{count}</output></SedaProvider>}createRoot(document.getElementById('root')).render(<Demo/>);`;
const bundle=await build({stdin:{contents:entry,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,format:'iife',platform:'browser'});
const browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
try {
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setContent('<div id="root"></div>');await page.addStyleTag({content:await fs.readFile('dist/styles.css','utf8')});await page.addScriptTag({content:bundle.outputFiles[0].text});
 const empty=page.locator('.seda-empty-state');assert.equal(await empty.getAttribute('data-reason'),'no-results');
 assert.equal(await empty.getByRole('heading',{name:'No results',level:3}).count(),1);
 assert.equal(await empty.locator('.seda-empty-state__media').getAttribute('aria-hidden'),'true');
 for(const theme of ['light','dark']) {
  if(theme==='dark')await page.getByRole('button',{name:'Theme'}).click();
  for(const size of ['s','m','l','xl']) {
   await page.getByLabel('Size').selectOption(size);assert.equal(await empty.getAttribute('data-size'),size);
   const geometry=await empty.evaluate(n=>({overflow:n.scrollWidth-n.clientWidth,children:[...n.querySelectorAll('button')].map(b=>({width:b.getBoundingClientRect().width,container:n.getBoundingClientRect().width}))}));
   assert.ok(geometry.overflow<=1,JSON.stringify({theme,size,geometry}));for(const b of geometry.children)assert.ok(b.width<=b.container,JSON.stringify({theme,size,b}));
  }
 }
 await empty.getByRole('button',{name:'Reset filters'}).focus();await page.keyboard.press('Enter');assert.equal(await page.locator('output').innerText(),'1');
 await empty.getByRole('button',{name:'Help'}).click();assert.equal(await page.locator('output').innerText(),'11');
 const colors=await empty.evaluate(n=>{n.style.setProperty('--empty-state-title-foreground','rgb(11, 22, 33)');n.style.setProperty('--empty-state-description-foreground','rgb(44, 55, 66)');n.style.setProperty('--empty-state-illustration-foreground','rgb(77, 88, 99)');return ['.seda-empty-state__title','.seda-empty-state__description','.seda-empty-state__media'].map(s=>getComputedStyle(n.querySelector(s)).color)});
 assert.deepEqual(colors,['rgb(11, 22, 33)','rgb(44, 55, 66)','rgb(77, 88, 99)']);assert.deepEqual(errors,[]);
 console.log('PASS: actual EmptyState, callbacks, keyboard, decorative media, three color bindings, S/M/L/XL in Light/Dark.');
} finally {await browser.close()}
