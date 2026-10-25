import type {InputHTMLAttributes,ReactNode} from 'react';
import type {SedaSize} from '../../types';

export interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>,'size'|'type'|'inputMode'|'role'|'prefix'|'value'|'defaultValue'|'onChange'|'onInput'|'min'|'max'|'step'|'pattern'|'aria-valuenow'|'aria-valuemin'|'aria-valuemax'> {
  label:string;
  /** Controlled raw buffer: preserves empty, minus, exponent and rejected drafts. */
  value:string;
  onValueChange:(value:string)=>void;
  size?:SedaSize;
  min?:number;
  max?:number;
  step?:number;
  mixed?:boolean;
  mixedLabel?:string;
  helperText?:ReactNode;
  errorText?:ReactNode;
  prefix?:ReactNode;
  suffix?:ReactNode;
}
