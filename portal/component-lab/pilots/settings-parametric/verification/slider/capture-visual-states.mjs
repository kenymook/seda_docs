import path from'node:path';import fs from'node:fs/promises';
/** Visual review frames only; this is not an additional test-count claim. */
export async function captureSliderStates(page,output){
 await fs.mkdir(output,{recursive:true});await page.setViewportSize({width:1702,height:1244});await page.locator('#nav-components').click();
 const value=async(id,min,step,next)=>{const input=page.locator('#'+id);await input.focus();await page.keyboard.press('Home');for(let i=0;i<Math.round((next-min)/step);i++)await page.keyboard.press('ArrowRight');};
 const frames=[];
 for(const theme of ['Light','Dark'])for(const[size,scale,x,y]of[['m',100,0,0],['xl',150,24,12]]){
  await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme,size});await value('scale',80,5,scale);await value('airX',0,1,x);await value('air',0,1,y);
  await page.locator('#visual-range-default-upper').press('End');await value('visual-range-default-lower',0,1,20);await value('visual-range-default-upper',20,1,80);
  await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});await page.mouse.move(5,5);
  for(const state of ['default','error','disabled']){const file='slider-'+theme.toLowerCase()+'-'+size+'-'+state+'.png';await page.locator('[data-visual-state='+state+']>.visual-consistency__fields').first().screenshot({path:path.join(output,file)});frames.push(file);}
  await page.locator('#visual-range-default-upper').focus();const file='slider-'+theme.toLowerCase()+'-'+size+'-focus.png';await page.locator('[data-visual-state=default]>.visual-consistency__fields').first().screenshot({path:path.join(output,file)});frames.push(file);
 }
 return frames;
}
