import type {HTMLAttributes,KeyboardEventHandler,MouseEventHandler,ReactElement,ReactNode,RefCallback,RefObject} from 'react';
export type PopoverSize='s'|'m'|'l'|'xl';
export type PopoverSide='top'|'bottom'|'left'|'right';
export interface PopoverChangeDetails {reason:'trigger'|'close-button'|'escape'|'outside'|'focus-out'|'unavailable'|'native'}
export interface PopoverTriggerProps {
 ref:RefCallback<HTMLButtonElement>;
 onClick:MouseEventHandler<HTMLButtonElement>;
 onKeyDown:KeyboardEventHandler<HTMLButtonElement>;
 disabled:boolean;
 'aria-haspopup':'dialog';
 'aria-expanded':boolean;
 'aria-controls':string|undefined;
}
export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>,'children'|'title'|'role'|'tabIndex'|'aria-modal'|'aria-label'|'aria-labelledby'|'aria-describedby'|'hidden'|'popover'|'onToggle'|'onBeforeToggle'> {
 /** The owner accepts or declines close requests, including dirty drafts. */
 open:boolean;
 onOpenChange:(open:boolean,details:PopoverChangeDetails)=>void;
 title:string;
 closeLabel:string;
 /** Bind the actual Button/IconButton; do not wrap a second interactive element. */
 trigger:(props:PopoverTriggerProps)=>ReactElement;
 children:ReactNode;
 description?:string;
 footer?:ReactNode;
 variant?:'default'|'avatar'|'checkbox'|'emoji'|'icon'|'custom';
 /** Surface width; nested controls retain the inherited compiler density. */
 size?:PopoverSize;
 side?:PopoverSide;
 align?:'start'|'center'|'end';
 disabled?:boolean;
 initialFocusRef?:RefObject<HTMLElement|null>;
 /** Logical fallback if an action can remove the trigger. */
 returnFocusRef?:RefObject<HTMLElement|null>;
}
