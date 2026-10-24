import {textContrast} from '../../../../packages/seda-ui/scripts/verify-colors.mjs';
/** Computed DOM text audit, not pixel/AT certification. Hidden details and disabled controls are recorded/excluded. */
export async function auditRenderedText(page) {
  const elements=await page.evaluate(()=>{
   const seen=new Set(),found=[],skip=[];
   function read(el,text,placeholder=false){if(!text.trim()||seen.has(el))return;seen.add(el);const style=getComputedStyle(el),box=el.getBoundingClientRect();if(!box.width||!box.height||style.visibility==='hidden'||!el.checkVisibility({checkVisibilityCSS:true,contentVisibilityAuto:true}))return;const details=el.closest('details:not([open])');if(details&&!el.closest('summary'))return;
    if(el.closest(':disabled,[aria-disabled=true],[data-disabled=true],[inert],option,script,style')){skip.push({text:text.slice(0,50),reason:'disabled or non-rendered native option'});return;}
    const backgrounds=[],opacity=[];for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);backgrounds.push(s.backgroundColor);if(s.backgroundImage!=='none'||Number(s.opacity)!==1)opacity.push({image:s.backgroundImage,opacity:s.opacity});}
    const size=parseFloat(style.fontSize),weight=parseFloat(style.fontWeight),color=placeholder?getComputedStyle(el,'::placeholder').color:style.color;
    found.push({selector:el.id?'#'+el.id:el.tagName.toLowerCase()+'.'+String(el.className).trim().split(/\s+/).join('.'),text:text.trim().slice(0,100),color,backgrounds,size,weight,opacity,threshold:size>=24||(size>=14*96/72&&weight>=700)?3:4.5});
   }
   const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const n=walker.currentNode;if(n.parentElement)read(n.parentElement,n.textContent);}
   for(const el of document.querySelectorAll('input:not([type=checkbox],[type=radio],[type=range],[type=file]),textarea,select'))read(el,el.value||el.placeholder||'',!el.value&&!!el.placeholder);
   return{found,skip};
  });
  const checked=elements.found.map(e=>({...e,ratio:textContrast(e.color,e.backgrounds)}));
return {checked,skipped:elements.skip,failures:checked.filter(e=>e.ratio<e.threshold),unsupported:checked.filter(e=>e.opacity.length)};
}
