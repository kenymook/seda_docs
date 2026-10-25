import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { useSedaSize } from '../../foundation/SedaProvider';
import { hasMessage, mergeDescriptionIds } from '../../utils/fieldMessage';
import { cx } from '../../utils/classNames';
import type { SliderProps } from './Slider.types';

/** Controlled numeric input: native range semantics, a shared rail, stable thumb order. */
export const Slider = forwardRef<HTMLDivElement, SliderProps>((props, ref) => {
  const {mode='single',label,min=0,max=100,step=1,size:sizeProp,disabled=false,helperText,errorText,formatValue=String,name,form,id,className,style,value,onValueChange,thumbLabels,...rest}=props;
  const size=useSedaSize(sizeProp),generated=useId(),base=id??generated,labelId=base+'-label',messageId=base+'-message';
  const inputs=useRef<(HTMLInputElement|null)[]>([]),rail=useRef<HTMLDivElement>(null),drag=useRef<{id:number;index:number}|null>(null),[active,setActive]=useState(0);
  const values=mode==='range'?value as readonly number[]:[value as number];
  const validText=(v:unknown)=>typeof v==='string'&&v.trim().length>0;
  if(!['single','range'].includes(mode)||!['s','m','l','xl'].includes(size)||!validText(label)||id!==undefined&&!validText(id)||typeof onValueChange!=='function'||typeof disabled!=='boolean')throw TypeError('Invalid Slider mode, label, id, size or owner');
  const count=(max-min)/step,tolerance=1e-7;
  if(![min,max,step].every(Number.isFinite)||max<=min||step<=0||min+step===min||max-step===max||!Number.isSafeInteger(Math.round(count))||Math.round(count)<1||Math.abs(count-Math.round(count))>tolerance)throw TypeError('Slider requires finite bounds and an evenly divided, representable step');
  const aligned=(n:number)=>Number.isFinite(n)&&n>=min&&n<=max&&Math.abs((n-min)/step-Math.round((n-min)/step))<=tolerance;
  if(!Array.isArray(values)||values.length!==(mode==='range'?2:1)||!values.every(aligned)||mode==='range'&&(values[0]>values[1]||!Array.isArray(thumbLabels)||thumbLabels.length!==2||!thumbLabels.every(validText)))throw TypeError('Slider value must be ordered and aligned to its step; range thumbs need names');
  if(typeof formatValue!=='function')throw TypeError('Slider formatValue must be a function');
  const texts=values.map(n=>formatValue(n));if(!texts.every(validText))throw TypeError('Slider formatted values must be nonempty text');
  const hasError=!disabled&&hasMessage(errorText),message=hasError?errorText:hasMessage(helperText)?helperText:undefined;
  const pct=(n:number)=>(n-min)/(max-min)*100;
  // Use exact scaled integers where representable. Fixed significant rounding
  // loses a small step at large offsets; raw binary arithmetic adds decimal noise.
  const places=(n:number)=>{const [base,exponent='0']=n.toString().toLowerCase().split('e');return Math.max(0,(base!.split('.')[1]?.length??0)-Number(exponent));};
  const factor=10**Math.max(places(min),places(step)),minUnits=Math.round(min*factor),stepUnits=Math.round(step*factor);
  const integerGrid=[factor,minUnits,stepUnits,Math.round(count)*stepUnits,minUnits+Math.round(count)*stepUnits].every(Number.isSafeInteger)&&stepUnits>0;
  const snap=(n:number)=>{const index=Math.min(Math.round(count),Math.max(0,Math.round((n-min)/step)));return Math.min(max,Math.max(min,integerGrid?(minUnits+index*stepUnits)/factor:min+index*step));};
  function emit(index:number,next:number){
    const input=inputs.current[index];if(disabled||!input||input.matches(':disabled'))return;
    next=snap(next);if(mode==='range')next=index===0?Math.min(next,values[1]!):Math.max(next,values[0]!);
    if(next===values[index])return;
    if(props.mode==='range'){const pair:[number,number]=[values[0]!,values[1]!];pair[index]=next;props.onValueChange(pair);}else (onValueChange as (n:number)=>void)(next);
  }
  function fromPointer(event:PointerEvent<HTMLDivElement>){const bounds=rail.current!.querySelector('.seda-slider__track')!.getBoundingClientRect(),rtl=getComputedStyle(rail.current!).direction==='rtl';const offset=Math.min(1,Math.max(0,(event.clientX-bounds.left)/bounds.width));return snap(min+(rtl?1-offset:offset)*(max-min));}
  useEffect(()=>{drag.current=null;},[disabled,mode]);
  return <div {...rest} id={base+'-root'} ref={ref} role="group" aria-labelledby={labelId} className={cx('seda-slider',className)} data-size={size} data-mode={mode} data-disabled={disabled||undefined} data-error={hasError||undefined} style={style}>
    <div className="seda-slider__header"><label id={labelId} htmlFor={mode==='single'?base:base+'-lower'}>{label}</label><output aria-hidden="true" className="seda-slider__value">{texts.join(' – ')}</output></div>
    <div className="seda-slider__rail" ref={rail} onPointerDown={event=>{
      if(disabled||!event.isPrimary||event.button!==0||event.target instanceof HTMLInputElement)return;
      const next=fromPointer(event),index=mode==='single'?0:Math.abs(next-values[0])<Math.abs(next-values[1])?0:Math.abs(next-values[0])>Math.abs(next-values[1])?1:next<values[0]?0:1;
      const input=inputs.current[index];if(!input||input.matches(':disabled'))return;
      event.preventDefault();setActive(index);input.focus({preventScroll:true});drag.current={id:event.pointerId,index};event.currentTarget.setPointerCapture(event.pointerId);emit(index,next);
    }} onPointerMove={event=>{if(drag.current?.id===event.pointerId)emit(drag.current.index,fromPointer(event));}} onPointerUp={event=>{if(drag.current?.id===event.pointerId){emit(drag.current.index,fromPointer(event));drag.current=null;event.currentTarget.releasePointerCapture(event.pointerId);}}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}>
      <div className="seda-slider__track" aria-hidden="true"><span className="seda-slider__fill" style={{insetInlineStart:(mode==='range'?pct(values[0]):0)+'%',inlineSize:(mode==='range'?pct(values[1])-pct(values[0]):pct(values[0]))+'%'} as CSSProperties}/></div>
      {values.map((n,index)=><input key={index} className="seda-slider__input" id={mode==='single'?base:base+(index===0?'-lower':'-upper')} type="range" min={min} max={max} step={step} value={n} disabled={disabled} name={name} form={form}
        ref={node=>{inputs.current[index]=node;}} aria-labelledby={labelId+(mode==='range'?' '+base+'-thumb-'+index:'')} aria-describedby={mergeDescriptionIds(rest['aria-describedby'],message!=null?messageId:undefined)} aria-invalid={hasError||undefined} aria-valuetext={texts[index]}
        aria-valuemin={mode==='range'&&index===1?values[0]:min} aria-valuemax={mode==='range'&&index===0?values[1]:max} data-active={active===index||undefined}
        onFocus={()=>setActive(index)} onPointerDown={()=>setActive(index)} onChange={event=>emit(index,Number(event.currentTarget.value))}/>) }
      {mode==='range'&&thumbLabels?.map((text,index)=><span key={index} id={base+'-thumb-'+index} className="seda-visually-hidden">{text}</span>)}
    </div>
    {message!=null&&<span className="seda-slider__message" id={messageId} data-tone={hasError?'error':undefined}>{message}</span>}
  </div>;
});
Slider.displayName='Slider';
