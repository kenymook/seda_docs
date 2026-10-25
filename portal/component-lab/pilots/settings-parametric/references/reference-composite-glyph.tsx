import {useId} from 'react';import type{ReactNode}from'react';
import metrics from './reference-composite-metrics.json';
/** Retains the original DOM hierarchy, source SVGs, clipping and group opacity. */
export function ReferenceCompositeGlyph({sourceId,children}:{sourceId:string;children:ReactNode}){
 const id='source-glyph-'+useId().replaceAll(':','');
 const metric=(metrics.glyphs as Record<string,{extent:number;cx:number;cy:number;peakAlpha:number}>)[sourceId];
 if(!metric?.extent)throw new TypeError('Unmeasured composite glyph: '+sourceId);
 const fit=.8/metric.extent,transform=`translate(${8-metric.cx*16*fit} ${8-metric.cy*16*fit}) scale(${fit})`;
 return <svg className="reference-composite-glyph" data-reference-composite={sourceId} aria-hidden="true" viewBox="0 0 16 16">
  <defs><filter id={id} x="-16" y="-16" width="48" height="48" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB"><feComponentTransfer in="SourceAlpha" result="normalizedAlpha"><feFuncA type="linear" slope={1/metric.peakAlpha}/></feComponentTransfer><feFlood floodColor="currentColor" result="foreground"/><feComposite in="foreground" in2="normalizedAlpha" operator="in"/></filter></defs>
  <g transform={transform} filter={'url(#'+id+')'}><foreignObject x="-16" y="-16" width="48" height="48" overflow="visible"><div style={{position:'relative',width:48,height:48}}><div style={{position:'absolute',left:16,top:16,width:16,height:16}}>{children}</div></div></foreignObject></g>
 </svg>;
}
