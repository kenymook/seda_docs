import type {HTMLAttributes, ReactElement, RefCallback} from 'react';
export type TooltipPlacement='top'|'bottom'|'left'|'right';
export interface TooltipTriggerProps extends Pick<HTMLAttributes<HTMLElement>,'aria-describedby'> {ref:RefCallback<HTMLElement>}
export interface TooltipProps {
  /** Plain, supplemental text. The trigger still needs its own accessible name. */
  content:string;
  children:(trigger:TooltipTriggerProps)=>ReactElement;
  variant?:'default'|'light';
  placement?:TooltipPlacement;
  disabled?:boolean;
  /** Preserve an existing description on the actual trigger. */
  describedBy?:string;
}
