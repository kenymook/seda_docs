import {forwardRef} from 'react';
import {useSedaSize} from '../../foundation/SedaProvider';
import {cx} from '../../utils/classNames';
import type {DividerProps} from './Divider.types';

export const Divider=forwardRef<HTMLDivElement,DividerProps>(function Divider({size:sizeProp,orientation='horizontal',emphasis='default',semantic=false,label,className,...props},ref){
 const size=useSedaSize(sizeProp);
 if(!['s','m','l','xl'].includes(size)||!['horizontal','vertical'].includes(orientation)||!['default','strong','inverse'].includes(emphasis)||typeof semantic!=='boolean'||label!==undefined&&(typeof label!=='string'||!label.trim())||orientation==='vertical'&&label!==undefined)throw new TypeError('Divider requires supported size, orientation and emphasis; labels are horizontal and nonempty');
 return <div {...props} ref={ref} className={cx('seda-divider',className)} data-size={size} data-orientation={orientation} data-emphasis={emphasis} role={semantic?'separator':undefined} aria-orientation={semantic?orientation:undefined} aria-hidden={semantic?undefined:true} aria-label={semantic&&label?label:undefined}>
  <span className="seda-divider__line" aria-hidden="true"/>{label&&<><span className="seda-divider__label" aria-hidden="true">{label}</span><span className="seda-divider__line" aria-hidden="true"/></>}
 </div>;
});
