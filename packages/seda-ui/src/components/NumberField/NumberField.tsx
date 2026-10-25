import {forwardRef,useRef} from 'react';
import {TextField} from '../TextField';
import {cx} from '../../utils/classNames';
import {useSedaSize} from '../../foundation/SedaProvider';
import {createNumberFieldModel,stepNumberFieldValue} from '../../../../seda-contracts/src/number-field.mjs';
import type {NumberFieldProps} from './NumberField.types';

/** Numeric interaction over the actual TextField. No alternate draft/save owner. */
export const NumberField=forwardRef<HTMLInputElement,NumberFieldProps>(({value,onValueChange,min,max,step=1,mixed=false,mixedLabel='Mixed',label,size:sizeProp,disabled=false,readOnly=false,onKeyDown,className,id,...props},ref)=>{
  const size=useSedaSize(sizeProp),model=createNumberFieldModel({value,min,max,step,mixed}),composing=useRef(false);
  if(typeof label!=='string'||!label.trim()||typeof onValueChange!=='function'||typeof mixedLabel!=='string'||!mixedLabel.trim()||typeof disabled!=='boolean'||typeof readOnly!=='boolean'||!['s','m','l','xl'].includes(size)||id!==undefined&&!id.trim())throw TypeError('Invalid NumberField label, owner, size or availability');
  for(const key of ['type','role','inputMode','defaultValue','onChange','onInput','pattern','aria-valuenow','aria-valuemin','aria-valuemax'])if(Object.prototype.hasOwnProperty.call(props,key))throw TypeError('NumberField owns '+key);
  return <TextField {...props} ref={ref} id={id} label={label} size={size} disabled={disabled} readOnly={readOnly} className={cx('seda-number-field',className)}
    type="text" role="spinbutton" inputMode="decimal" value={value}
    data-seda-number-field="" data-numeric-state={model.numericState}
    aria-valuenow={model.value??undefined} aria-valuemin={min} aria-valuemax={max}
    aria-valuetext={model.mixed?mixedLabel:props['aria-valuetext']}
    aria-invalid={!disabled&&model.outOfRange?true:props['aria-invalid']}
    placeholder={model.mixed?mixedLabel:props.placeholder}
    onCompositionStart={event=>{composing.current=true;props.onCompositionStart?.(event);}}
    onCompositionEnd={event=>{composing.current=false;props.onCompositionEnd?.(event);}}
    onChange={event=>{if(!disabled&&!readOnly&&!event.currentTarget.matches(':disabled'))onValueChange(event.currentTarget.value);}}
    onKeyDown={event=>{
      onKeyDown?.(event);
      if(event.defaultPrevented||composing.current||event.nativeEvent.isComposing||event.keyCode===229||disabled||readOnly||event.currentTarget.matches(':disabled')||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
      if(!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key))return;
      if(event.key==='Home'&&min===undefined||event.key==='End'&&max===undefined)return;
      event.preventDefault();event.stopPropagation();
      const next=stepNumberFieldValue(model,event.key as Parameters<typeof stepNumberFieldValue>[1]);
      if(next!==undefined)onValueChange(next);
    }}/>
});
NumberField.displayName='NumberField';
