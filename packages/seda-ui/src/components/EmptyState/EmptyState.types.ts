import type {HTMLAttributes, ReactNode} from 'react';
import type {SedaSize} from '../../types';
export interface EmptyStateAction {label:string; onAction:()=>void}
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>,'title'|'children'> {
 title:string;
 description?:string;
 reason?:'no-data'|'no-results'|'no-access'|'error'|'first-time';
 size?:SedaSize;
 /** Decorative only; do not put interactive content here. */
 media?:ReactNode;
 primaryAction?:EmptyStateAction;
 secondaryAction?:EmptyStateAction;
 headingLevel?:2|3|4|5|6;
}
