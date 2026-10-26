import {forwardRef,useRef} from 'react';
import {useSedaSize} from '../../foundation/SedaProvider';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {cx} from '../../utils/classNames';
import {hasSlotContent} from '../../utils/hasSlotContent';
import type {InlineToolbarProps} from './InlineToolbar.types';

const selectable = 'button:not(:disabled):not([aria-disabled="true"]),a[href]:not([aria-disabled="true"]),[role="button"]:not([aria-disabled="true"])';

export const InlineToolbar = forwardRef<HTMLDivElement,InlineToolbarProps>(({label,children,size:sizeProp,className,onKeyDown,onFocusCapture,...props},forwardedRef)=>{
  const size=useSedaSize(sizeProp),root=useRef<HTMLDivElement|null>(null);
  if(!label.trim()||!hasSlotContent(children)||!['s','m','l','xl'].includes(size))throw new TypeError('InlineToolbar needs a name, actions and a supported size');
  const items=()=>Array.from(root.current?.querySelectorAll<HTMLElement>(selectable)??[]);
  const current=(target:EventTarget|null)=>items().findIndex(item=>item===target||item.contains(target as Node));
  const activate=(item:HTMLElement)=>{for(const control of items())control.tabIndex=control===item?0:-1;item.focus({preventScroll:true});};
  useBrowserLayoutEffect(()=>{const controls=items();if(!controls.length)return;const active=root.current?.ownerDocument.activeElement,selected=controls.find(item=>item===active)||controls.find(item=>item.tabIndex===0)||controls[0];for(const control of controls)control.tabIndex=control===selected?0:-1;});
  return <div {...props} ref={node=>{root.current=node;if(typeof forwardedRef==='function')forwardedRef(node);else if(forwardedRef)forwardedRef.current=node;}} role="toolbar" aria-label={label} className={cx('seda-inline-toolbar',className)} data-size={size}
    onFocusCapture={event=>{onFocusCapture?.(event);if(event.defaultPrevented)return;const index=current(event.target);if(index>=0){const controls=items();for(const control of controls)control.tabIndex=control===controls[index]?0:-1;}}}
    onKeyDown={event=>{onKeyDown?.(event);if(event.defaultPrevented||event.altKey||event.ctrlKey||event.metaKey)return;const controls=items(),index=current(event.target),rtl=getComputedStyle(event.currentTarget).direction==='rtl';if(index<0||!controls.length)return;let next=-1;
      if(event.key==='Home')next=0;else if(event.key==='End')next=controls.length-1;
      else if(event.key==='ArrowRight')next=(index+(rtl?-1:1)+controls.length)%controls.length;
      else if(event.key==='ArrowLeft')next=(index+(rtl?1:-1)+controls.length)%controls.length;
      if(next>=0){event.preventDefault();activate(controls[next]!);}
    }}>{children}</div>;
});
InlineToolbar.displayName='InlineToolbar';
