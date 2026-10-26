const installed=new WeakSet();
/** Test-only browser probe for absolute CSS lengths, including calc/max/round expressions. */
function installReader(){
  if(window.__sedaReadPixel)return;const cache=new Map();
  window.__sedaReadPixel=(element,name,fallback)=>{
    const style=getComputedStyle(element),value=(style.getPropertyValue(name)||(fallback?style.getPropertyValue(fallback):'')).trim();
    if(!value||value.includes('%'))throw new Error('Expected absolute CSS length: '+name+' = '+value);
    if(/^-?(?:\d+\.?\d*|\.\d+)px$/.test(value))return parseFloat(value);
    const key=[value,style.fontSize,style.lineHeight,getComputedStyle(document.documentElement).fontSize,innerWidth,innerHeight].join('|');if(cache.has(key))return cache.get(key);
    if(!CSS.supports('width',value))throw new Error('Unsupported CSS length: '+name+' = '+value);
    const probe=document.createElement('span');probe.setAttribute('aria-hidden','true');probe.inert=true;Object.assign(probe.style,{position:'fixed',left:'-10000px',top:'0',display:'block',boxSizing:'border-box',padding:'0',border:'0',margin:'0',height:'0',width:value,fontSize:style.fontSize,lineHeight:style.lineHeight,pointerEvents:'none'});document.body.append(probe);
    try{const pixels=probe.getBoundingClientRect().width;if(!Number.isFinite(pixels))throw new Error('Nonfinite CSS length');cache.set(key,pixels);return pixels;}finally{probe.remove();}
  };
}
export async function installSedaPixelReader(page){if(installed.has(page))return;await page.addInitScript(installReader);await page.evaluate(installReader);installed.add(page);}
