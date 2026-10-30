import metrics from './reference-glyph-metrics.json';
import {useId} from 'react';
import type {CSSProperties} from 'react';
/** Monochrome reference artwork only. Identity marks/thumbnails remain original images. */
export function ReferenceGlyph({file}:{file:string}){
 const filterId='reference-alpha-'+useId().replaceAll(':','');
 if(!/^[a-zA-Z0-9_-]+\.svg$/.test(file))throw new TypeError('Expected a local SVG reference glyph');
 const mask='url("./assets/'+file+'")';
 const metric=(metrics.glyphs as Record<string,{extent:number;cx:number;cy:number;mode?:string;naturalWidth?:number;naturalHeight?:number;peakAlpha?:number}>)[file];
 if(metric?.mode==='artwork')return <img aria-hidden="true" className="reference-artwork" data-reference-artwork={file} src={'./assets/'+file} alt=""/>;
 if(metric?.extent===0)throw new TypeError('Empty reference glyph: '+file);
 const fit=metric?0.8/metric.extent:1;
 const shift=(center:number)=>'calc(50% + '+((0.5-center)*fit).toFixed(5)+' * var(--seda-control-icon-size,var(--seda-preset-icon-size,16px)))';
 const widthFit=fit*Math.min(1,(metric?.naturalWidth??1)/(metric?.naturalHeight??1));
 const normalize=metric?.peakAlpha!==undefined&&metric.peakAlpha>0&&metric.peakAlpha<.98;
 const inkStyle={maskImage:mask,WebkitMaskImage:mask,...(metric?{maskSize:(widthFit*100)+'% auto',WebkitMaskSize:(widthFit*100)+'% auto',maskPosition:shift(metric.cx)+' '+shift(metric.cy),WebkitMaskPosition:shift(metric.cx)+' '+shift(metric.cy)}:{})} as CSSProperties;
 return <span aria-hidden="true" className="seda-icon reference-glyph" data-reference-glyph={file} style={normalize?{position:'relative',backgroundColor:'transparent',filter:'url(#'+filterId+')'}:inkStyle}>{normalize&&<><span className="reference-glyph__ink" style={{...inkStyle,position:'absolute',inset:0,backgroundColor:'currentColor',maskRepeat:'no-repeat',WebkitMaskRepeat:'no-repeat'}}/><svg style={{position:'absolute',width:0,height:0,pointerEvents:'none'}}><defs><filter id={filterId} colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncA type="linear" slope={1/metric!.peakAlpha!}/></feComponentTransfer></filter></defs></svg></>}</span>;
}
