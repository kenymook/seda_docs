import {forwardRef} from 'react';
import type {HTMLAttributes,ReactNode} from 'react';
import type {SedaSize} from '../../types';
import {useSedaSize} from '../../foundation/SedaProvider';
import {Icon} from '../Icon';
import {cx} from '../../utils/classNames';

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>,'children'|'onClick'> {
 label:string;
 variant?:'default'|'filled'|'selected';
 size?:SedaSize;
 leadingIcon?:ReactNode;
 control?:'none'|'remove'|'expand'|'select';
 disabled?:boolean;
 removeLabel?:string;
 onRemove?:()=>void;
 expanded?:boolean;
 controlsId?:string;
 onOpenChange?:(open:boolean)=>void;
 selected?:boolean;
 onSelectedChange?:(selected:boolean)=>void;
}

/** One native action per chip; the parent owns group focus after removal. */
export const Chip=forwardRef<HTMLSpanElement,ChipProps>(function Chip({label,variant='default',size:sizeProp,leadingIcon,control='none',disabled=false,removeLabel,onRemove,expanded,controlsId,onOpenChange,selected,onSelectedChange,className,...props},ref){
 const size=useSedaSize(sizeProp);
 if(!label?.trim()||!['default','filled','selected'].includes(variant)||!['none','remove','expand','select'].includes(control))throw new TypeError('Chip requires a label and supported variant/control');
 if(control==='remove'&&(!removeLabel?.trim()||!onRemove)||control==='expand'&&(expanded===undefined||!onOpenChange)||control==='select'&&(selected===undefined||!onSelectedChange))throw new TypeError('Chip control requires its accessible label, state and handler');
 const content=<>{leadingIcon!=null&&<span className="seda-chip__icon" aria-hidden="true">{leadingIcon}</span>}<span className="seda-chip__label">{label}</span>{control==='expand'&&<span className="seda-chip__control-icon" aria-hidden="true"><Icon name="arrow-chevron-down"/></span>}</>;
 const action=control==='select'?()=>onSelectedChange?.(!selected):control==='expand'?()=>onOpenChange?.(!expanded):undefined;
 return <span {...props} title={props.title??label} ref={ref} className={cx('seda-chip',className)} data-size={size} data-variant={variant} data-selected={(control==='select'?selected:variant==='selected')||undefined} data-disabled={disabled||undefined}>
  {action?<button type="button" className="seda-chip__main" disabled={disabled} aria-pressed={control==='select'?selected:undefined} aria-expanded={control==='expand'?expanded:undefined} aria-controls={control==='expand'?controlsId:undefined} onClick={action}>{content}</button>:content}
  {control==='remove'&&<button type="button" className="seda-chip__remove" aria-label={removeLabel} disabled={disabled} onClick={onRemove}><Icon name="close"/></button>}
 </span>;
});
