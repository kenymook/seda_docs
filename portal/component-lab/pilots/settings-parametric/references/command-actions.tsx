import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Button,DropdownMenu} from '@seda-ai/ui';
import type {MenuAction,MenuEntry} from '@seda-ai/ui';
import './command-actions.css';

interface CommandActionsProps {
 /** First command stays visible. Remaining commands collapse from the end. */
 actions:readonly MenuAction[];
 overflowItems:readonly MenuEntry[];
 overflowLabel:string;
 label:string;
 /** Parameters that can change intrinsic control widths without a host resize. */
 densityKey:string;
}

/** Application recipe over public SEDA primitives; not a new public component. */
export function CommandActions({actions,overflowItems,overflowLabel,label,densityKey}:CommandActionsProps){
 const root=useRef<HTMLDivElement>(null),repair=useRef(false);
 const [width,setWidth]=useState(0),[hidden,setHidden]=useState(0);
 const count=Math.min(hidden,Math.max(0,actions.length-1));
 useEffect(()=>{
  const node=root.current;if(!node)return;
  const observer=new ResizeObserver(()=>setWidth(node.clientWidth));
  observer.observe(node);return()=>observer.disconnect();
 },[]);
 useLayoutEffect(()=>{setHidden(0);},[width,densityKey]);
 useLayoutEffect(()=>{
  const node=root.current;if(!node)return;
  if(repair.current){node.querySelector<HTMLButtonElement>('.seda-dropdown-menu > button[aria-haspopup=menu]')?.focus({preventScroll:true});repair.current=false;}
  if(node.scrollWidth>node.clientWidth+1&&count<actions.length-1){
   const removed=actions[actions.length-count-1];
   const focused=node.ownerDocument.activeElement?.closest('[data-command-id]');
   repair.current=focused?.getAttribute('data-command-id')===removed.id;
   setHidden(count+1);
  }
 },[width,densityKey,count,actions]);
 const inline=actions.slice(0,actions.length-count),collapsed=actions.slice(actions.length-count);
 const items:MenuEntry[]=[...collapsed,...(collapsed.length&&overflowItems.length?[{type:'separator' as const,id:'commands-divider'}]:[]),...overflowItems];
 return <div ref={root} className="command-actions" aria-label={label} data-overflow-count={count}>
  <div className="command-actions__row" onFocusCapture={event=>{
   // Native local scroll is the last resort if even primary + More cannot fit.
   const node=root.current;if(!node)return;const a=node.getBoundingClientRect(),b=event.target.getBoundingClientRect();
   if(b.left<a.left)node.scrollBy({left:b.left-a.left});else if(b.right>a.right)node.scrollBy({left:b.right-a.right});
  }}>
   {inline.map(action=><Button key={action.id} data-command-id={action.id} variant="secondary" iconLeft={action.icon} disabled={action.disabled} onClick={action.onSelect}>{action.label}</Button>)}
   <DropdownMenu key="overflow" triggerLabel={overflowLabel} items={items} align="end"/>
  </div>
 </div>;
}
