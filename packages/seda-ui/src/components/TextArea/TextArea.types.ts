import type {TextareaHTMLAttributes,ReactNode} from 'react';
import type {SedaSize} from '../../types';
export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>,'size'|'value'|'defaultValue'|'children'|'dangerouslySetInnerHTML'> {
 label:ReactNode;
 size?:SedaSize;
 value?:string;
 defaultValue?:string;
 helperText?:ReactNode;
 errorText?:ReactNode;
 hideLabel?:boolean;
 autoResize?:boolean;
 maxRows?:number;
 resize?:'vertical'|'none';
 showCount?:boolean;
 clearable?:boolean;
 onClear?:()=>void;
}
