import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { createPilotServer } from './server.mjs';

const output=path.join(import.meta.dirname,'.diagnostics-visual-consistency');
await fs.mkdir(output,{recursive:true});
const server=await createPilotServer({port:0});
const browser=await chromium.launch({headless:true,...(process.env.SEDA_BROWSER_EXECUTABLE?{executablePath:process.env.SEDA_BROWSER_EXECUTABLE}:{})});
const page=await browser.newPage({viewport:{width:1702,height:1244}});
const errors=[], samples=[];
page.on('pageerror',error=>errors.push(error.message));
const near=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<=1,`${label}: ${actual} vs ${expected}`);
const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(()=>window.sedaPilot);
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('#nav-components').click();
  for(const theme of ['Light','Dark']) for(const size of ['s','m','l','xl']) for(const scale of [80,100,150]) {
    await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme,size});
    await page.locator('#scale').fill(String(scale));
    await page.locator('#air').fill('4');
    await page.locator('#airX').fill('8');
    await settle();
    const sample=await page.evaluate(()=>{
      const rect=element=>{const r=element.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2};};
      const root=document.querySelector('#components-page');
      const field=root.querySelector('#visual-field-default');
      const surface=field.closest('.seda-field__control');
      const button=root.querySelector('#visual-button-default');
      const iconButton=root.querySelector('#visual-icon-default');
      const glyph=button.querySelector('.seda-icon');
      const slot=glyph.closest('.seda-button__icon');
      const tabGlyph=root.querySelector('.seda-tabs__icon .seda-icon');
      const fieldGlyph=surface.querySelector('.seda-icon');
      const uploads=Array.from(root.querySelectorAll('[data-visual-state="default"] .seda-file-upload')).map(el=>({variant:el.dataset.variant,font:parseFloat(getComputedStyle(el.querySelector('.seda-file-upload__label')).fontSize),icon:el.querySelector('.seda-icon').getBoundingClientRect().width,x:parseFloat(getComputedStyle(el).paddingInlineStart),y:parseFloat(getComputedStyle(el).paddingBlockStart),height:el.getBoundingClientRect().height,overflow:el.scrollWidth>el.clientWidth+1}));
      return {uploads,compiled:window.sedaPilot.getCompiled().geometry,derived:window.sedaPilot.getLab().derived,
        button:rect(button),glyph:rect(glyph),slot:rect(slot),iconButton:rect(iconButton),iconGlyph:rect(iconButton.querySelector('.seda-icon')),
        field:rect(surface),fieldGlyph:rect(fieldGlyph),tabGlyph:rect(tabGlyph),
        padding:parseFloat(getComputedStyle(surface).paddingInlineStart),buttonPadding:parseFloat(getComputedStyle(button).paddingInlineStart),
        gap:parseFloat(getComputedStyle(button).columnGap),fieldGap:parseFloat(getComputedStyle(surface).columnGap),
        name:button.textContent,decorative:glyph.getAttribute('aria-hidden'),formula:window.sedaPilot.getLab().derived.formula};
    });
    const icon=Math.round(sample.compiled.iconSize.value*scale/100);
    assert.equal(sample.derived.icon,icon);
    assert.ok(sample.formula.startsWith(`max(${Math.round(sample.compiled.lineHeight.value*scale/100)}, ${icon})`));
    for(const key of ['glyph','iconGlyph','fieldGlyph','tabGlyph']) {near(sample[key].width,icon,key+' width');near(sample[key].height,icon,key+' height');}
    near(sample.glyph.cy,sample.button.cy,'button icon vertical center');
    near(sample.iconGlyph.cx,sample.iconButton.cx,'IconButton horizontal center');
    near(sample.iconGlyph.cy,sample.iconButton.cy,'IconButton vertical center');
    near(sample.iconButton.width,sample.iconButton.height,'IconButton square');
    near(sample.field.height,sample.button.height,'field/action shared row height');
    near(sample.padding,sample.compiled.textFieldPaddingInline.value+8,'field padding base + X');
    near(sample.buttonPadding,sample.compiled.buttonPaddingInline.value+8,'button padding base + X');
    near(sample.gap,sample.compiled.buttonContentGap.value,'button content gap');
    near(sample.fieldGap,sample.compiled.textFieldAffixGap.value,'field source content gap');
    assert.equal(sample.uploads.length,3);
    for(const upload of sample.uploads){near(upload.font,sample.derived.font,'upload shared font');near(upload.icon,icon,'upload shared icon');near(upload.y,sample.derived.py,'upload shared Y');near(upload.x,upload.variant==='inline'?8:upload.variant==='button'?sample.derived.buttonPaddingX:sample.derived.fieldPaddingX,'upload base + X');assert.equal(upload.overflow,false);}
    assert.equal(sample.decorative,'true');
    const disabled=page.locator('#visual-button-disabled');
    assert.equal(await disabled.isDisabled(),true);
    assert.equal(await page.locator('#visual-field-error').getAttribute('aria-invalid'),'true');
    await page.locator('#visual-loading').check(); await settle();
    const after=await page.locator('#visual-button-default').boundingBox();
    near(after.width,sample.button.width,'loading width');near(after.height,sample.button.height,'loading height');
    const spinner=await page.locator('#visual-button-default .seda-button__spinner').boundingBox();
    near(spinner.x+spinner.width/2,after.x+after.width/2,'loading horizontal center');
    near(spinner.y+spinner.height/2,after.y+after.height/2,'loading vertical center');
    const afterIcon=await page.locator('#visual-icon-default').boundingBox();
    near(afterIcon.width,sample.iconButton.width,'IconButton loading width');near(afterIcon.height,sample.iconButton.height,'IconButton loading height');
    await page.locator('#visual-loading').uncheck();
    samples.push({theme,size,scale,icon,buttonHeight:after.height,loadingWidthDelta:after.width-sample.button.width});
    if(size==='m') await page.screenshot({path:path.join(output,`${theme}-${scale}.png`),fullPage:true});
  }
  // Consumers also pass raster/SVG <img> elements with intrinsic dimensions.
  const image=await page.evaluate(()=>{
    const slot=document.querySelector('#visual-button-default .seda-button__icon-content');
    const glyph=slot.querySelector('.seda-icon');
    const img=document.createElement('img');img.width=53;img.height=29;img.alt='';
    img.src=getComputedStyle(glyph).maskImage.slice(5,-2);slot.replaceChildren(img);
    const a=slot.getBoundingClientRect(),b=img.getBoundingClientRect();return {slot:a.width,width:b.width,height:b.height};
  });
  near(image.width,image.slot,'intrinsic image width normalized');near(image.height,image.slot,'intrinsic image height normalized');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:samples.length,failed:0,image,errors,output}));
} finally {
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify({scope:'shared icon scale, slot alignment, preset gaps, X padding, disabled/error and loading geometry',samples,errors},null,2));
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
