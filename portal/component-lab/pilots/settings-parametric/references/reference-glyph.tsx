import metrics from './reference-glyph-metrics.json';
import type {CSSProperties} from 'react';
/** Monochrome reference artwork only. Identity marks/thumbnails remain original images. */
export function ReferenceGlyph({file}:{file:string}){
 if(!/^[a-zA-Z0-9_-]+\.svg$/.test(file))throw new TypeError('Expected a local SVG reference glyph');
 const mask='url("./assets/'+file+'")';
 const metric=(metrics.glyphs as Record<string,{extent:number;cx:number;cy:number}>)[file];
 const fit=metric?0.8/metric.extent:1;
 const shift=(center:number)=>'calc(50% + '+((0.5-center)*fit).toFixed(5)+' * var(--seda-control-icon-size,var(--seda-preset-icon-size,16px)))';
 return <span aria-hidden="true" className="seda-icon reference-glyph" data-reference-glyph={file} style={{maskImage:mask,WebkitMaskImage:mask,...(metric?{maskSize:(fit*100)+'% auto',WebkitMaskSize:(fit*100)+'% auto',maskPosition:shift(metric.cx)+' '+shift(metric.cy),WebkitMaskPosition:shift(metric.cx)+' '+shift(metric.cy)}:{})} as CSSProperties}/>;
}
