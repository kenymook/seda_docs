import type {HTMLAttributes,ReactNode} from 'react';
export interface AccordionItem {
  id:string;
  title:string;
  content:ReactNode;
  description?:string;
  /** Static count/status, never an interactive control inside the trigger. */
  badge?:string|number;
  icon?:ReactNode;
  disabled?:boolean;
}
interface AccordionBase extends Omit<HTMLAttributes<HTMLDivElement>,'children'|'defaultValue'|'onChange'> {
  label:string;
  items:readonly AccordionItem[];
  variant?:'default'|'bordered'|'elevated'|'compact';
  /** Surface density, separate from the provider's control size. */
  size?:'compact'|'medium'|'large';
  disabled?:boolean;
  rovingFocus?:boolean;
  /** Default true: hidden panels stay mounted and preserve form drafts. */
  forceMount?:boolean;
  headingLevel?:2|3|4|5|6;
}
type AccordionValue<T,Next=T> = {value:T;defaultValue?:never;onValueChange:(value:Next)=>void} | {value?:never;defaultValue?:T;onValueChange?:(value:Next)=>void};
export type AccordionProps=AccordionBase & (
  ({type:'single';collapsible:boolean} & AccordionValue<string>) |
  ({type:'multiple';collapsible?:never} & AccordionValue<readonly string[],string[]>)
);
