import {forwardRef,useEffect,useId,useImperativeHandle,useLayoutEffect,useRef,useState} from 'react';
import type {CSSProperties} from 'react';
import {useSedaSize} from '../../foundation/SedaProvider';
import {hasMessage,mergeDescriptionIds} from '../../utils/fieldMessage';
import {cx} from '../../utils/classNames';
import {IconButton} from '../IconButton';
import type {TextAreaProps} from './TextArea.types';
const useClientLayoutEffect=typeof window==='undefined'?useEffect:useLayoutEffect;
export const TextArea=forwardRef<HTMLTextAreaElement,TextAreaProps>(({
 label,size:sizeProp,value,defaultValue,helperText,errorText,hideLabel=false,autoResize=false,maxRows,rows=3,resize='vertical',showCount=false,clearable=false,onClear,disabled=false,readOnly=false,required=false,className,style,id,onChange,...props
},ref)=>{
 const size=useSedaSize(sizeProp),generated=useId(),inputId=id??generated,messageId=inputId+'-message',counterId=inputId+'-counter';
 const autoOwnedHeight=useRef(false),inner=useRef<HTMLTextAreaElement>(null),[localValue,setLocalValue]=useState(defaultValue??'');
 const text=value??localValue,hasError=!disabled&&hasMessage(errorText),message=hasError?errorText:hasMessage(helperText)?helperText:undefined;
 useImperativeHandle(ref,()=>inner.current!);
 if(!['s','m','l','xl'].includes(size)||!Number.isInteger(rows)||rows<1||maxRows!==undefined&&(!autoResize||!Number.isInteger(maxRows)||maxRows<rows)||!['vertical','none'].includes(resize))throw new TypeError('Invalid TextArea size, rows, maxRows or resize');
 if(value!==undefined&&(typeof value!=='string'||defaultValue!==undefined)||defaultValue!==undefined&&typeof defaultValue!=='string')throw new TypeError('TextArea accepts string value or defaultValue, never both');
 if(clearable&&value!==undefined&&typeof onClear!=='function')throw new TypeError('Controlled clearable TextArea requires onClear');
 function measure(){const el=inner.current;if(!el)return;if(!autoResize){if(autoOwnedHeight.current){el.style.removeProperty('height');el.style.removeProperty('overflow-y');autoOwnedHeight.current=false;}return;}autoOwnedHeight.current=true;el.style.height='auto';const css=getComputedStyle(el),line=parseFloat(css.lineHeight),padding=parseFloat(css.paddingTop)+parseFloat(css.paddingBottom),minimum=parseFloat(css.minHeight);const maximum=maxRows===undefined?Infinity:maxRows*line+padding;const height=Math.max(minimum,Math.min(el.scrollHeight,maximum));el.style.height=height+'px';el.style.overflowY=el.scrollHeight>height+1?'auto':'hidden';}
 useClientLayoutEffect(measure);
 useEffect(()=>{const el=inner.current;if(!el)return;let width=-1;const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(entries=>{const next=entries[0]?.contentRect.width;if(next!==undefined&&next!==width){width=next;measure();}});observer?.observe(el);const fonts=el.ownerDocument.fonts;fonts?.addEventListener('loadingdone',measure);return()=>{observer?.disconnect();fonts?.removeEventListener('loadingdone',measure);};},[autoResize,maxRows,rows]);
 useEffect(()=>{const el=inner.current,form=el?.form;if(!el||!form)return;let frame=0;const reset=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{setLocalValue(el.value);measure();});};form.addEventListener('reset',reset);return()=>{cancelAnimationFrame(frame);form.removeEventListener('reset',reset);};},[props.form,autoResize,maxRows,rows]);
 const descriptions=props['aria-describedby']?.split(/\s+/).filter(token=>token&&(message!=null||token!==messageId)&&(showCount||token!==counterId)).join(' ');
 const clearVisible=clearable&&text.length>0&&!disabled&&!readOnly;
 return <div className={cx('seda-field','seda-textarea',className)} style={{...style,'--seda-textarea-rows':rows} as CSSProperties} data-size={size} data-disabled={disabled||undefined} data-read-only={readOnly||undefined} data-state={disabled?'disabled':hasError?'error':readOnly?'read-only':'default'}>
  <label htmlFor={inputId} id={inputId+'-label'} className={cx('seda-field__label',hideLabel&&'seda-visually-hidden')}>{label}{required&&<span aria-hidden="true"> *</span>}</label>
  <div className="seda-field__control seda-textarea__control" data-filled={text.length>0||undefined} data-clear={clearVisible||undefined}>
   <textarea {...props} id={inputId} ref={inner} className="seda-textarea__input" rows={rows} required={required} disabled={disabled} readOnly={readOnly} value={value} defaultValue={defaultValue} style={{resize:autoResize?'none':resize}} aria-invalid={disabled?undefined:hasError?true:props['aria-invalid']} aria-labelledby={props['aria-labelledby']??(props['aria-label']?undefined:inputId+'-label')} aria-describedby={mergeDescriptionIds(descriptions,message!=null?messageId:undefined,showCount?counterId:undefined)} onChange={event=>{if(value===undefined)setLocalValue(event.currentTarget.value);onChange?.(event);measure();queueMicrotask(measure);}}/>
   {clearVisible&&<IconButton className="seda-textarea__clear" size={size} variant="ghost" aria-label="Очистить поле" icon="×" onClick={()=>{if(disabled||readOnly)return;if(value===undefined&&inner.current){inner.current.value='';setLocalValue('');measure();}onClear?.();inner.current?.focus();}}/>}
  </div>
  {(message!=null||showCount)&&<div className="seda-textarea__footer">{message!=null&&<span className="seda-field__message" id={messageId} data-tone={hasError?'error':undefined}>{message}</span>}{showCount&&<span id={counterId} dir="ltr" className="seda-textarea__counter">{text.length}{props.maxLength!==undefined?' / '+props.maxLength:''}</span>}</div>}
 </div>;
});
TextArea.displayName='TextArea';
