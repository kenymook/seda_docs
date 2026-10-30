import {createContext,forwardRef,useContext,useId,useImperativeHandle,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {SedaProvider,useSedaConfiguration} from '../../foundation/SedaProvider';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {registerOverlay} from '../../utils/overlayStack';
import {cx} from '../../utils/classNames';
import {IconButton} from '../IconButton';
import {Icon} from '../Icon';
import {Text} from '../Text';
import type {PopoverChangeDetails,PopoverProps,PopoverSide} from './Popover.types';

const PopoverScope=createContext(false);
const selector='a[href],button,input:not([type=hidden]),textarea,select,[tabindex],[contenteditable=true]';
function usable(node:HTMLElement|null|undefined){return !!node?.isConnected&&!node.matches(':disabled,[aria-disabled=true]')&&!node.closest('[hidden],[inert]')&&!!node.getClientRects().length&&node.ownerDocument.defaultView!.getComputedStyle(node).visibility==='visible';}
function tabStops(root:ParentNode){return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(n=>usable(n)&&n.tabIndex>=0).sort((a,b)=>(a.tabIndex>0?a.tabIndex:Infinity)-(b.tabIndex>0?b.tabIndex:Infinity));}
function reveal(target:HTMLElement,panel:HTMLElement){const a=target.getBoundingClientRect(),b=panel.getBoundingClientRect();if(a.top<b.top)panel.scrollTop-=b.top-a.top;else if(a.bottom>b.bottom)panel.scrollTop+=a.bottom-b.bottom;}

/** A controlled, nonmodal anchored surface. No transport, draft or submit ownership. */
export const Popover=forwardRef<HTMLDivElement,PopoverProps>(({open,onOpenChange,title,closeLabel,trigger,children,description,footer,variant='default',size='m',side='bottom',align='start',disabled=false,initialFocusRef,returnFocusRef,id,className,onKeyDown,onFocusCapture,...props},forwardedRef)=>{
 const nested=useContext(PopoverScope),configuration=useSedaConfiguration(),generated=useId(),rootId=id??generated;
 if(typeof open!=='boolean'||typeof onOpenChange!=='function'||typeof trigger!=='function'||typeof title!=='string'||!title.trim()||typeof closeLabel!=='string'||!closeLabel.trim())throw new TypeError('Popover requires controlled visibility, trigger, title and close label');
 if(!['default','avatar','checkbox','emoji','icon','custom'].includes(variant)||!['s','m','l','xl'].includes(size)||!['top','bottom','left','right'].includes(side)||!['start','center','end'].includes(align))throw new TypeError('Unsupported Popover variant, size or placement');
 if(typeof disabled!=='boolean'||id!==undefined&&(typeof id!=='string'||!id.trim()))throw new TypeError('Popover disabled and id must be valid');
 if('hidden'in props||'popover'in props)throw new TypeError('Popover owns native visibility');
 if(nested)throw new TypeError('Nested Popover is unsupported; use a separate flow');
 if(description!==undefined&&(typeof description!=='string'||!description.trim()))throw new TypeError('Popover description must be non-empty text');
 const [canAnchor,setCanAnchor]=useState(false);
 const [anchor,setAnchor]=useState<HTMLButtonElement|null>(null),[host,setHost]=useState<HTMLElement|null>(null);
 const panel=useRef<HTMLDivElement>(null),scope=useRef<HTMLDivElement>(null),heading=useRef<HTMLElement>(null),reposition=useRef<(()=>void)|null>(null);
 const focused=useRef<HTMLElement|null>(null);
 const closingReason=useRef<PopoverChangeDetails['reason']|null>(null),unavailableNotified=useRef(false);
 const invoking=useRef(false),internalHide=useRef(false),returnRequested=useRef(false),seenAnchor=useRef(false);
 const latest=useRef({open,onOpenChange,disabled,initialFocusRef,returnFocusRef,side,align,size});
 useBrowserLayoutEffect(()=>{latest.current={open,onOpenChange,disabled,initialFocusRef,returnFocusRef,side,align,size};});
 useImperativeHandle(forwardedRef,()=>panel.current as HTMLDivElement,[host,open,disabled]);
 const visible=open&&!disabled&&!!anchor;
 function request(next:boolean,reason:PopoverChangeDetails['reason']){
  if(invoking.current||next===latest.current.open||next&&latest.current.disabled)return;
  closingReason.current=next?null:reason;returnRequested.current=!next&&['trigger','close-button','escape','native'].includes(reason);invoking.current=true;
  try{latest.current.onOpenChange(next,{reason});}finally{queueMicrotask(()=>{invoking.current=false;});}
 }
 useBrowserLayoutEffect(()=>{if(anchor){seenAnchor.current=true;if(anchor.tagName!=='BUTTON')throw new TypeError('Popover trigger must be the actual Button or IconButton');}if(open&&(disabled||seenAnchor.current&&!anchor))request(false,'unavailable');},[open,disabled,anchor]);
 useBrowserLayoutEffect(()=>{
  if(!visible||!anchor)return;
  const doc=anchor.ownerDocument,portal=doc.createElement('div');portal.className='seda-popover-portal';portal.style.display='contents';
  (anchor.closest('dialog[open]')??doc.body).append(portal);setHost(portal);
  return()=>{setHost(current=>current===portal?null:current);portal.remove();};
 },[visible,anchor]);
 useBrowserLayoutEffect(()=>{
  const node=panel.current,provider=scope.current;if(!visible||!host||!anchor||!node||!provider)return;
  const doc=anchor.ownerDocument,view=doc.defaultView!;let frame=0;
  function available(){
   if(!usable(anchor)||anchor!.matches(':disabled,[aria-disabled=true]'))return false;
   const modal=doc.querySelector('dialog[open]');if(modal&&!modal.contains(anchor))return false;
   const a=anchor!.getBoundingClientRect(),v=view.visualViewport;let l=Math.max(a.left,v?.offsetLeft??0),t=Math.max(a.top,v?.offsetTop??0),r=Math.min(a.right,(v?.offsetLeft??0)+(v?.width??view.innerWidth)),b=Math.min(a.bottom,(v?.offsetTop??0)+(v?.height??view.innerHeight));
   for(let p=anchor!.parentElement;p;p=p.parentElement){const s=view.getComputedStyle(p),box=p.getBoundingClientRect();if(/auto|scroll|clip|hidden/.test(s.overflowX)){l=Math.max(l,box.left+p.clientLeft);r=Math.min(r,box.left+p.clientLeft+p.clientWidth);}if(/auto|scroll|clip|hidden/.test(s.overflowY)){t=Math.max(t,box.top+p.clientTop);b=Math.min(b,box.top+p.clientTop+p.clientHeight);}}
   return r>l&&b>t;
  }
  function position(){
   if(!available()){node!.style.visibility='hidden';node!.inert=true;setCanAnchor(false);if(!unavailableNotified.current){unavailableNotified.current=true;request(false,'unavailable');}return;}unavailableNotified.current=false;node!.inert=false;setCanAnchor(true);
   const c=view.getComputedStyle(anchor!);for(const name of Array.from(c))if(/^--(popover-|seda-)/.test(name)){const value=c.getPropertyValue(name);if(provider!.style.getPropertyValue(name)!==value)provider!.style.setProperty(name,value);}
   provider!.dir=c.direction;node!.style.colorScheme=c.colorScheme;
   const v=view.visualViewport,left=v?.offsetLeft??0,top=v?.offsetTop??0,width=v?.width??view.innerWidth,height=v?.height??view.innerHeight,gutter=8,gap=8;
   const maxWidth=Math.max(0,width-gutter*2),maxHeight=Math.max(0,height-gutter*2),base={s:240,m:320,l:400,xl:480}[latest.current.size];
   node!.style.width=Math.min(base,maxWidth)+'px';node!.style.maxWidth=maxWidth+'px';node!.style.maxHeight=maxHeight+'px';
   const a=anchor!.getBoundingClientRect(),natural=node!.getBoundingClientRect(),space={top:a.top-top-gap-gutter,bottom:top+height-a.bottom-gap-gutter,left:a.left-left-gap-gutter,right:left+width-a.right-gap-gutter},opposite:Record<PopoverSide,PopoverSide>={top:'bottom',bottom:'top',left:'right',right:'left'};
   let placement=latest.current.side;const needed=placement==='top'||placement==='bottom'?natural.height:natural.width;
   if(space[placement]<needed&&space[opposite[placement]]>space[placement])placement=opposite[placement];
   if((placement==='left'||placement==='right')&&space[placement]<Math.min(160,natural.width))placement=space.top>space.bottom?'top':'bottom';
   const vertical=placement==='top'||placement==='bottom';
   if(vertical)node!.style.maxHeight=Math.min(maxHeight,Math.max(96,space[placement]))+'px';else node!.style.maxWidth=Math.min(maxWidth,Math.max(160,space[placement]))+'px';
   const b=node!.getBoundingClientRect(),right=latest.current.align==='start'?c.direction==='rtl':c.direction!=='rtl';
   let x=latest.current.align==='center'?a.left+(a.width-b.width)/2:right?a.right-b.width:a.left,y=latest.current.align==='center'?a.top+(a.height-b.height)/2:latest.current.align==='end'?a.bottom-b.height:a.top;
   if(placement==='top')y=a.top-b.height-gap;else if(placement==='bottom')y=a.bottom+gap;else if(placement==='left')x=a.left-b.width-gap;else x=a.right+gap;
   node!.style.left=Math.max(left+gutter,Math.min(x,left+width-b.width-gutter))+'px';node!.style.top=Math.max(top+gutter,Math.min(y,top+height-b.height-gutter))+'px';node!.dataset.side=placement;node!.style.visibility='visible';if(focused.current&&!usable(focused.current)&&(doc.activeElement===doc.body||node!.contains(doc.activeElement))){heading.current?.focus({preventScroll:true});focused.current=heading.current;}
  }
  const schedule=()=>{view.cancelAnimationFrame(frame);frame=view.requestAnimationFrame(position);};
  const before=(event:Event)=>{if((event as ToggleEvent).newState==='closed'&&!internalHide.current){request(false,'native');queueMicrotask(()=>{if(latest.current.open&&node!.isConnected&&!node!.matches(':popover-open')){try{node!.showPopover();position();}catch{}}});}};
  node.addEventListener('beforetoggle',before);
  if(typeof node.showPopover==='function'){node.setAttribute('popover','manual');try{node.showPopover();node.dataset.topLayer='true';}catch{node.removeAttribute('popover');node.dataset.topLayer='false';}}else node.dataset.topLayer='false';
  position();reposition.current=position;const unregister=registerOverlay({surface:node,trigger:anchor,dismiss:reason=>request(false,reason)});
  const explicit=latest.current.initialFocusRef?.current,target=usable(explicit)&&node.contains(explicit!)?explicit:heading.current;
  if(available()&&target){target.focus({preventScroll:true});reveal(target,node);}
  const resize=new view.ResizeObserver(schedule);resize.observe(anchor);resize.observe(node);
  const mutation=new view.MutationObserver(schedule);for(let p:HTMLElement|null=anchor;p;p=p.parentElement)mutation.observe(p,{attributes:true,attributeFilter:['class','style','dir','hidden','inert','disabled','aria-disabled']});
  const structure=new view.MutationObserver(schedule);structure.observe(doc.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','hidden','inert','disabled','aria-disabled']});
  view.addEventListener('resize',schedule);doc.addEventListener('scroll',schedule,true);view.visualViewport?.addEventListener('resize',schedule);view.visualViewport?.addEventListener('scroll',schedule);
  return()=>{
   const active=doc.activeElement,owned=active===doc.body||active===node||node.contains(active),restore=owned&&(returnRequested.current||closingReason.current===null||closingReason.current==='unavailable'&&!!latest.current.returnFocusRef?.current);
   unregister();resize.disconnect();mutation.disconnect();structure.disconnect();view.cancelAnimationFrame(frame);view.removeEventListener('resize',schedule);doc.removeEventListener('scroll',schedule,true);view.visualViewport?.removeEventListener('resize',schedule);view.visualViewport?.removeEventListener('scroll',schedule);reposition.current=null;
   node.removeEventListener('beforetoggle',before);internalHide.current=true;if(node.hasAttribute('popover')){if(node.isConnected&&node.matches(':popover-open'))node.hidePopover();node.removeAttribute('popover');}internalHide.current=false;
   const destination=latest.current.returnFocusRef?.current??anchor;const modal=doc.querySelector('dialog[open]');if(restore&&usable(destination)&&(!modal||modal.contains(destination!)))destination?.focus({preventScroll:true});returnRequested.current=false;closingReason.current=null;focused.current=null;
  };
 },[visible,host,anchor]);
 useBrowserLayoutEffect(()=>{reposition.current?.();});
 return <>{trigger({ref:setAnchor,disabled,onClick:event=>{if(!event.defaultPrevented&&!event.currentTarget.disabled)request(!latest.current.open,'trigger');},'aria-haspopup':'dialog',onKeyDown:event=>{if(visible&&event.key==='Tab'&&!event.shiftKey&&panel.current){event.preventDefault();(tabStops(panel.current)[0]??heading.current)?.focus();}},'aria-expanded':visible&&canAnchor,'aria-controls':visible?rootId:undefined})}{visible&&host&&createPortal(<PopoverScope.Provider value={true}><SedaProvider ref={scope} {...configuration} style={{display:'contents'}}><div {...props} ref={panel} id={rootId} role="dialog" aria-modal="false" aria-hidden={!canAnchor||undefined} aria-labelledby={rootId+'-title'} aria-describedby={description?rootId+'-description':undefined} tabIndex={-1} className={cx('seda-popover',className)} data-size={size} data-variant={variant} onFocusCapture={event=>{onFocusCapture?.(event);if(panel.current?.contains(event.target)){focused.current=event.target;reveal(event.target,panel.current);}}} onKeyDown={event=>{
  onKeyDown?.(event);if(event.defaultPrevented||event.key!=='Tab'||!panel.current?.contains(event.target as Node))return;
  const stops=tabStops(panel.current),active=panel.current.ownerDocument.activeElement;
  if(event.shiftKey&&(active===stops[0]||active===heading.current||active===panel.current)){event.preventDefault();anchor?.focus({preventScroll:true});}
  else if(!event.shiftKey&&(active===stops[stops.length-1]||!stops.length)){const outside=tabStops(panel.current.ownerDocument).filter(n=>!n.closest('.seda-popover-portal,.seda-overlay-portal,.seda-tooltip-portal')),index=outside.indexOf(anchor!);request(false,'focus-out');const next=outside[index+1];if(index>=0&&next){event.preventDefault();next.focus();}}
 }}><div className="seda-popover__header"><div><Text ref={heading} id={rootId+'-title'} as="h2" variant="heading/panel" tabIndex={-1}>{title}</Text>{description&&<Text as="p" variant="body/small" id={rootId+'-description'}>{description}</Text>}</div><IconButton className="seda-popover__close" variant="ghost" aria-label={closeLabel} icon={<Icon name="close"/>} onClick={()=>request(false,'close-button')}/></div><div className="seda-popover__body">{children}</div>{footer&&<div className="seda-popover__footer">{footer}</div>}</div></SedaProvider></PopoverScope.Provider>,host)}</>;
});
Popover.displayName='Popover';
