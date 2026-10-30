import {forwardRef,useId,useImperativeHandle,useRef,useState} from 'react';
import {useSedaSize} from '../../foundation/SedaProvider';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {cx} from '../../utils/classNames';
import {Button} from '../Button';
import {Badge} from '../Badge';
import {Text} from '../Text';
import {Tabs} from '../Tabs';
import type {NotificationCenterProps,NotificationFilter} from './NotificationCenter.types';

const named=(value:unknown):value is string=>typeof value==='string'&&!!value.trim();
const filters:readonly NotificationFilter[]=['all','mentions','unread'];
export const NotificationCenter=forwardRef<HTMLDivElement,NotificationCenterProps>(({
 title,items,labels,state='ready',placement='panel',size:sizeProp,activeFilter,defaultFilter,onActiveFilterChange,
 onMarkRead,onMarkAllRead,onSettings,busy=false,actionStatus,errorText,onRetry,unrecoverableReason,id,className,onFocusCapture,...props
},ref)=>{
 const size=useSedaSize(sizeProp),generated=useId(),rootId=id??generated,root=useRef<HTMLDivElement|null>(null),oldFocus=useRef<HTMLElement|null>(null),ownsFocus=useRef(false),invoking=useRef(false);
 const [localFilter,setLocalFilter]=useState<NotificationFilter>(defaultFilter??'all'),filter=activeFilter??localFilter;
 useImperativeHandle(ref,()=>root.current!,[]);
 if(!named(title)||!named(rootId)||/\s/.test(rootId)||!Array.isArray(items)||!['ready','loading','error'].includes(state)||!['panel','overlay'].includes(placement)||!filters.includes(filter)||typeof busy!=='boolean'||busy&&!named(actionStatus)||typeof onMarkRead!=='function'||typeof onMarkAllRead!=='function'||onSettings!==undefined&&typeof onSettings!=='function'||onActiveFilterChange!==undefined&&typeof onActiveFilterChange!=='function'||activeFilter!==undefined&&(typeof onActiveFilterChange!=='function'||defaultFilter!==undefined)||state!=='error'&&(errorText!==undefined||onRetry!==undefined||unrecoverableReason!==undefined))throw new TypeError('NotificationCenter requires explicit data, filter and action ownership');
 for(const key of ['all','mentions','unread','markAllRead','markRead','empty','noResults','loading','retry','settings'] as const)if(!labels||!named(labels[key]))throw new TypeError('NotificationCenter requires localized labels');
 if(typeof labels.unreadCount!=='function'||state==='error'&&(!named(errorText)||!(typeof onRetry==='function'&&!unrecoverableReason||!onRetry&&named(unrecoverableReason))))throw new TypeError('NotificationCenter needs count copy and an explicit error recovery policy');
 const ids=new Set<string>();for(const item of items){if(!item||!named(item.id)||ids.has(item.id)||![item.title,item.message,item.source,item.timestamp?.label,item.timestamp?.dateTime].every(named)||!Number.isFinite(Date.parse(item.timestamp.dateTime))||typeof item.unread!=='boolean'||item.mention!==undefined&&typeof item.mention!=='boolean')throw new TypeError('Invalid or duplicate NotificationCenter item');ids.add(item.id);}
 const unread=items.filter(item=>item.unread).map(item=>item.id),countLabel=labels.unreadCount(unread.length);if(!named(countLabel))throw new TypeError('NotificationCenter unread count needs readable copy');
 const disabled=busy||state!=='ready';
 function perform(action:()=>void){if(invoking.current||busy)return;invoking.current=true;try{action();}finally{queueMicrotask(()=>{invoking.current=false;});}}
 useBrowserLayoutEffect(()=>{const doc=root.current?.ownerDocument;if(!doc)return;const track=(event:FocusEvent)=>{ownsFocus.current=!!root.current?.contains(event.target as Node);};doc.addEventListener('focusin',track);return()=>doc.removeEventListener('focusin',track);},[]);
 useBrowserLayoutEffect(()=>{const host=root.current,old=oldFocus.current,doc=host?.ownerDocument;if(!host||!old||!doc)return;if(ownsFocus.current&&(!old.isConnected||!!old.closest('[hidden]')||old.matches(':disabled'))&&(doc.activeElement===doc.body||doc.activeElement===old)){const next=host.querySelector<HTMLElement>('[role=tab][aria-selected=true]')??host;next.focus({preventScroll:true});oldFocus.current=next;}});
 const resolved=state==='ready'?(items.length?unread.length?'has-unread':'all-read':'empty'):state;
 return <div {...props} ref={root} id={rootId} role="region" aria-labelledby={rootId+'-title'} tabIndex={-1} className={cx('seda-notification-center',className)} data-size={size} data-placement={placement} data-state={resolved} onFocusCapture={event=>{ownsFocus.current=true;oldFocus.current=event.target as HTMLElement;onFocusCapture?.(event);}}>
  <header className="seda-notification-center__header"><Text as="h2" id={rootId+'-title'} variant="heading/compact">{title}</Text>{unread.length>0&&<Badge variant="count" count={unread.length} accessibleLabel={countLabel}/>}
   <div className="seda-notification-center__actions"><Button size={size} variant="ghost" disabled={disabled||!unread.length} onClick={()=>perform(()=>onMarkAllRead(unread))}>{labels.markAllRead}</Button>{onSettings&&<Button size={size} variant="ghost" disabled={busy} onClick={()=>perform(onSettings)}>{labels.settings}</Button>}</div>
  </header>
  <Tabs label={title} value={filter} size={size} onValueChange={value=>{const next=value as NotificationFilter;if(activeFilter===undefined)setLocalFilter(next);onActiveFilterChange?.(next);}} items={filters.map(key=>({value:key,label:labels[key],content:<div className="seda-notification-center__body" aria-busy={state==='loading'||busy||undefined}>
   {state==='loading'?<Text as="p" variant="body/default" role="status" className="seda-notification-center__status"><span className="seda-notification-center__spinner" aria-hidden="true"/>{labels.loading}</Text>:state==='error'?<div className="seda-notification-center__status"><Text as="p" variant="body/default" role="alert">{errorText}</Text>{onRetry?<Button size={size} disabled={busy} onClick={()=>perform(onRetry)}>{labels.retry}</Button>:<Text as="p" variant="caption/default">{unrecoverableReason}</Text>}</div>:(()=>{const visible=items.filter(item=>key==='all'||key==='mentions'&&item.mention||key==='unread'&&item.unread);return visible.length?<ul className="seda-notification-center__list">{visible.map(item=><li key={item.id} data-notification-id={item.id} data-unread={item.unread} className="seda-notification-center__item">
    {item.icon&&<span className="seda-notification-center__icon" aria-hidden="true">{item.icon}</span>}<div className="seda-notification-center__content"><Text as="h3" variant="label/default">{item.title}</Text><Text as="p" variant="body/default">{item.message}</Text><Text as="p" variant="caption/default" className="seda-notification-center__metadata">{item.source} · <time dateTime={item.timestamp.dateTime}>{item.timestamp.label}</time></Text>{item.unread&&<Button size={size} variant="ghost" disabled={disabled} aria-label={labels.markRead+': '+item.title} onClick={()=>perform(()=>onMarkRead(item.id))}>{labels.markRead}</Button>}</div>{item.unread&&<span className="seda-notification-center__unread" role="img" aria-label={labels.unread}/>}
   </li>)}</ul>:<Text as="p" variant="body/default" className="seda-notification-center__status" role="status">{items.length?labels.noResults:labels.empty}</Text>;})()}
  </div>}))}/>
  {actionStatus&&<Text as="p" variant="caption/default" role="status" className="seda-notification-center__action-status">{actionStatus}</Text>}
 </div>;
});
NotificationCenter.displayName='NotificationCenter';
