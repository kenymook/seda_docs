import{installSedaPixelReader}from'./css-value-probe.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const actions=[['Undo','undo'],['Redo','redo'],['Orbit left','arrow-left'],['Orbit right','arrow-right']];
const settle=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function configure(page,{theme,size,scale}){
  await page.getByRole('button',{name:'Scene menu',exact:true}).click();
  await page.getByRole('menuitem',{name:'Appearance and parameters',exact:true}).click();
  for(const[label,value]of [['Theme',theme],['Control size',size],['Text scale',String(scale)],['Additional padding X',scale===150?'24':'0'],['Additional padding Y',scale===150?'12':'0']])await page.getByLabel(label,{exact:true}).selectOption(value);
  await page.getByRole('button',{name:'Закрыть диалог',exact:true}).click();await settle(page);
}
export async function verifySplineIcons(page,origin,output){
 await installSedaPixelReader(page);
  const samples=[];page.on('dialog',dialog=>dialog.accept());
  for(const context of ['scene','object']){
    await page.goto(origin+'/references/spline.html?context='+context);
    await page.evaluate(()=>{for(const key of ['seda.reference.spline.document.v1','seda.reference.spline.preferences.v1','seda.reference.spline.panels.v1'])localStorage.removeItem(key);});
    await page.reload();await page.locator('[data-spline-ready=ready]').waitFor();await page.locator('[data-renderer-status=ready],[data-renderer-status=restored]').waitFor();await page.evaluate(()=>document.fonts.ready);
    for(const theme of ['light','dark'])for(const size of ['s','m','l','xl'])for(const scale of [80,100,150]){
      await configure(page,{theme,size,scale});const rows=[];
      for(const[label,name]of actions){
        const button=page.getByRole('button',{name:label,exact:true});assert.equal(await button.locator('[data-seda-icon]').count(),1);
        const row=await button.evaluate(el=>{const icon=el.querySelector('[data-seda-icon]'),r=icon.getBoundingClientRect(),b=el.getBoundingClientRect(),s=getComputedStyle(icon),owner=getComputedStyle(el);return{name:icon.dataset.sedaIcon,hidden:icon.getAttribute('aria-hidden'),rotation:s.rotate,width:r.width,height:r.height,expected:window.__sedaReadPixel(el,'--seda-control-icon-size'),centerX:Math.abs(r.x+r.width/2-b.x-b.width/2),centerY:Math.abs(r.y+r.height/2-b.y-b.height/2),controlWidth:b.width,controlHeight:b.height,color:s.backgroundColor,ownerColor:owner.color,disabled:el.disabled,text:el.textContent};});
        assert.equal(row.name,name);assert.equal(row.hidden,'true');assert.equal(row.rotation,name==='arrow-left'?'180deg':'none');
        assert.equal(row.width,row.expected);assert.equal(row.height,row.expected);assert.ok(row.centerX<=1&&row.centerY<=1,JSON.stringify(row));assert.ok(Math.abs(row.controlWidth-row.controlHeight)<=1,JSON.stringify(row));assert.equal(row.color,row.ownerColor);assert.ok(!/[↶↷]/.test(row.text));rows.push({label,...row});
      }
      samples.push({context,theme,size,scale,rows});
      if((size==='m'&&scale===100)||(size==='xl'&&scale===150)){
        await page.screenshot({path:path.join(output,`spline-icons-${context}-${theme}-${size}-${scale}.png`)});
        await page.locator('.spline-toolbar').screenshot({path:path.join(output,`spline-toolbar-${context}-${theme}-${size}-${scale}.png`)});
      }
    }
  }
  await configure(page,{theme:'light',size:'m',scale:100});
  const undo=page.getByRole('button',{name:'Undo',exact:true}),redo=page.getByRole('button',{name:'Redo',exact:true}),x=page.locator('#spline-position-X');
  assert.equal(await undo.isDisabled(),true);assert.equal(await redo.isDisabled(),true);const initial=await x.inputValue();
  await x.fill('150');await x.press('Enter');assert.equal(await x.inputValue(),'150');assert.equal(await undo.isEnabled(),true);
  await undo.hover();await page.getByRole('tooltip',{name:'Undo · Ctrl/Cmd+Z',exact:true}).waitFor();await undo.click();assert.equal(await x.inputValue(),initial);
  await redo.hover();await page.getByRole('tooltip',{name:'Redo · Ctrl/Cmd+Shift+Z',exact:true}).waitFor();await redo.click();assert.equal(await x.inputValue(),'150');
  await undo.click();assert.equal(await x.inputValue(),initial);assert.equal(await undo.isDisabled(),true);
  const canvas=page.locator('#spline-viewport');await page.mouse.move(1,1);await settle(page);const before=await canvas.screenshot();
  const left=page.getByRole('button',{name:'Orbit left',exact:true});await left.hover();await page.getByRole('tooltip',{name:'Orbit left · Camera',exact:true}).waitFor();await left.click();await page.mouse.move(1,1);await settle(page);const after=await canvas.screenshot();assert.ok(!before.equals(after),'Orbit left must change the actual rendered camera view');
  assert.equal(await undo.isDisabled(),true);assert.equal(await redo.isEnabled(),true);assert.equal(await x.inputValue(),initial);
  const right=page.getByRole('button',{name:'Orbit right',exact:true});await right.hover();await page.getByRole('tooltip',{name:'Orbit right · Camera',exact:true}).waitFor();await right.click();await page.mouse.move(1,1);await settle(page);const returned=await canvas.screenshot();assert.ok(!after.equals(returned),'Orbit right must change the actual rendered camera view');assert.equal(await x.inputValue(),initial);assert.equal(await undo.isDisabled(),true);assert.equal(await redo.isEnabled(),true);
  await redo.click();assert.equal(await x.inputValue(),'150');
  await fs.writeFile(path.join(output,'camera-before.png'),before);await fs.writeFile(path.join(output,'camera-left.png'),after);await fs.writeFile(path.join(output,'camera-return.png'),returned);
  return{scope:'Actual Spline controls using the installed SEDA Icon; source rotation and app-owned history/camera stay distinct',samples,workflow:{undoRedo:true,cameraPaintChanged:true,cameraPreservesHistory:true,tooltips:4},limitations:['Chromium with software WebGL; no target OS/AT or fresh Figma acceptance']};
}
if(process.argv[1]===import.meta.filename){
  const output=path.join(import.meta.dirname,'.diagnostics-spline-icons');await fs.mkdir(output,{recursive:true});
  const server=await createPilotServer({port:0}),browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader'],...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})}),page=await browser.newPage({viewport:{width:1702,height:1244}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  try{const result=await verifySplineIcons(page,'http://127.0.0.1:'+server.address().port,output);assert.deepEqual(errors,[]);await fs.writeFile(path.join(output,'results.json'),JSON.stringify({...result,errors},null,2)+'\n');console.log(JSON.stringify({samples:result.samples.length,workflow:result.workflow,errors,output}));}
  catch(error){await page.screenshot({path:path.join(output,'failure.png')}).catch(()=>{});throw error;}
  finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
}
