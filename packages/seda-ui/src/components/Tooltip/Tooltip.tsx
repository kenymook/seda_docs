import {useId, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {SedaProvider,useSedaConfiguration} from '../../foundation/SedaProvider';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {registerOverlay} from '../../utils/overlayStack';
import {Text} from '../Text';
import type {TooltipProps,TooltipPlacement} from './Tooltip.types';

const active=new WeakMap<Document,()=>void>();
/** Render props bind the real trigger without wrappers, cloning or replacement focus targets. */
export function Tooltip({children, ...options}:TooltipProps){
  const tooltip=useTooltip(options);
  if(typeof children!=='function')throw new TypeError('Tooltip needs a render function binding the real trigger');
  return <>{children(tooltip.trigger)}{tooltip.surface}</>;
}
/** Internal protocol also used by IconButton; not a public hook. */
export function useTooltip({content,variant='default',placement='top',disabled=false,describedBy}:Omit<TooltipProps,'children'>){
  if(typeof content!=='string'||!disabled&&!content.trim()||!['default','light'].includes(variant)||!['top','bottom','left','right'].includes(placement))throw new TypeError('Unsupported Tooltip content, variant or placement');
  const configuration=useSedaConfiguration(),id=useId();
  const [anchor,setAnchor]=useState<HTMLElement|null>(null),[open,setOpen]=useState(false),[host,setHost]=useState<HTMLElement|null>(null);
  const surface=useRef<HTMLDivElement>(null),scope=useRef<HTMLDivElement>(null),reposition=useRef<(()=>void)|null>(null);
  const latest=useRef({disabled,content,placement});
  const state=useRef({hover:false,focus:false,surface:false,suppressed:false,timer:0});
  useBrowserLayoutEffect(()=>{latest.current={disabled,content,placement};});
  const available=()=>{
    if(!anchor?.isConnected||latest.current.disabled||!latest.current.content.trim()||anchor.matches(':disabled,[aria-disabled="true"]')||anchor.closest('[hidden],[inert]')||!anchor.getClientRects().length)return false;
    const view=anchor.ownerDocument.defaultView!;
    if(view.getComputedStyle(anchor).visibility!=='visible')return false;
    const a=anchor.getBoundingClientRect(),v=view.visualViewport;
    let left=Math.max(a.left,v?.offsetLeft??0),top=Math.max(a.top,v?.offsetTop??0),right=Math.min(a.right,(v?.offsetLeft??0)+(v?.width??view.innerWidth)),bottom=Math.min(a.bottom,(v?.offsetTop??0)+(v?.height??view.innerHeight));
    for(let parent=anchor.parentElement;parent;parent=parent.parentElement){
      const style=view.getComputedStyle(parent),box=parent.getBoundingClientRect();
      if(/auto|scroll|clip|hidden/.test(style.overflowX)){left=Math.max(left,box.left+parent.clientLeft);right=Math.min(right,box.left+parent.clientLeft+parent.clientWidth);}
      if(/auto|scroll|clip|hidden/.test(style.overflowY)){top=Math.max(top,box.top+parent.clientTop);bottom=Math.min(bottom,box.top+parent.clientTop+parent.clientHeight);}
    }
    return right>left&&bottom>top;
  };
  function cancel(){if(anchor?.ownerDocument.defaultView)anchor.ownerDocument.defaultView.clearTimeout(state.current.timer);state.current.timer=0;}
  function dismiss(){cancel();state.current.suppressed=true;setOpen(false);}
  function leave(){
    cancel();const s=state.current;
    if(s.focus||s.hover||s.surface)return;
    s.suppressed=false;s.timer=anchor?.ownerDocument.defaultView?.setTimeout(()=>{setOpen(false);},100)??0;
  }
  function enter(key:'focus'|'hover'|'surface'){
    const s=state.current;cancel();if(key==='focus'||key==='hover'&&!s.focus)s.suppressed=false;s[key]=true;
    if(s.suppressed||!available())return;
    if(key==='focus')setOpen(true);
    else s.timer=anchor!.ownerDocument.defaultView!.setTimeout(()=>{if(available()&&!s.suppressed)setOpen(true);},350);
  }
  useBrowserLayoutEffect(()=>{
    if(!anchor)return;
    const enterPointer=(event:PointerEvent)=>{if(event.pointerType!=='touch')enter('hover');};
    const leavePointer=()=>{state.current.hover=false;leave();};
    const focus=()=>enter('focus'),blur=()=>{state.current.focus=false;leave();};
    anchor.addEventListener('pointerenter',enterPointer);anchor.addEventListener('pointerleave',leavePointer);
    anchor.addEventListener('focus',focus);anchor.addEventListener('blur',blur);anchor.addEventListener('pointerdown',dismiss);anchor.addEventListener('click',dismiss);
    return ()=>{cancel();anchor.removeEventListener('pointerenter',enterPointer);anchor.removeEventListener('pointerleave',leavePointer);anchor.removeEventListener('focus',focus);anchor.removeEventListener('blur',blur);anchor.removeEventListener('pointerdown',dismiss);anchor.removeEventListener('click',dismiss);state.current={hover:false,focus:false,surface:false,suppressed:false,timer:0};};
  },[anchor]);
  useBrowserLayoutEffect(()=>{if(disabled||!content.trim())dismiss();else{state.current.suppressed=false;state.current.focus=anchor?.matches(':focus')??false;if(state.current.focus)enter('focus');}},[disabled]);
  useBrowserLayoutEffect(()=>{
    if(!open||!anchor)return;
    if(!available()){dismiss();return;}
    const document=anchor.ownerDocument,portal=document.createElement('div');portal.className='seda-tooltip-portal';
    (anchor.closest('dialog[open]')??document.body).append(portal);setHost(portal);
    active.get(document)?.();active.set(document,dismiss);
    return ()=>{if(active.get(document)===dismiss)active.delete(document);setHost(null);portal.remove();};
  },[open,anchor]);
  useBrowserLayoutEffect(()=>{
    const node=surface.current,provider=scope.current;if(!open||!host||!anchor||!node||!provider)return;
    const document=anchor.ownerDocument,view=document.defaultView!;let frame=0;
    function position(){
      if(!available()){dismiss();return;}
      const computed=view.getComputedStyle(anchor!);
      for(const property of Array.from(computed))if(/^--(tooltip-|seda-)/.test(property))provider!.style.setProperty(property,computed.getPropertyValue(property));
      provider!.dir=computed.direction;node!.style.colorScheme=computed.colorScheme;
      const v=view.visualViewport,left=v?.offsetLeft??0,top=v?.offsetTop??0,width=v?.width??view.innerWidth,height=v?.height??view.innerHeight,gutter=8;
      node!.style.maxWidth=Math.max(0,Math.min(304,width-2*gutter))+'px';node!.style.maxHeight=Math.max(0,height-2*gutter)+'px';
      const a=anchor!.getBoundingClientRect(),b=node!.getBoundingClientRect();let side=latest.current.placement;
      const space={top:a.top-top-gutter,bottom:top+height-a.bottom-gutter,left:a.left-left-gutter,right:left+width-a.right-gutter};
      const opposite:Record<TooltipPlacement,TooltipPlacement>={top:'bottom',bottom:'top',left:'right',right:'left'};
      const needed=side==='top'||side==='bottom'?b.height:b.width;
      if(space[side]<needed&&space[opposite[side]]>space[side])side=opposite[side];
      let x=a.left+(a.width-b.width)/2,y=a.top+(a.height-b.height)/2;
      if(side==='top')y=a.top-b.height;else if(side==='bottom')y=a.bottom;else if(side==='left')x=a.left-b.width;else x=a.right;
      node!.style.left=Math.max(left+gutter,Math.min(x,left+width-b.width-gutter))+'px';node!.style.top=Math.max(top+gutter,Math.min(y,top+height-b.height-gutter))+'px';node!.dataset.placement=side;node!.style.visibility='visible';
    }
    const schedule=()=>{view.cancelAnimationFrame(frame);frame=view.requestAnimationFrame(position);};
    if(typeof node.showPopover==='function'){node.setAttribute('popover','manual');try{node.showPopover();}catch{node.removeAttribute('popover');}}
    position();reposition.current=position;
    const unregister=registerOverlay({surface:node,trigger:anchor,dismiss});
    const resize=new view.ResizeObserver(schedule);resize.observe(anchor);resize.observe(node);
    const mutation=new view.MutationObserver(schedule);
    for(let parent:HTMLElement|null=anchor;parent;parent=parent.parentElement)mutation.observe(parent,{attributes:true,attributeFilter:['class','style','hidden','dir','disabled','aria-disabled','inert']});
    view.addEventListener('resize',schedule);document.addEventListener('scroll',schedule,true);view.visualViewport?.addEventListener('resize',schedule);view.visualViewport?.addEventListener('scroll',schedule);
    return ()=>{reposition.current=null;unregister();resize.disconnect();mutation.disconnect();view.cancelAnimationFrame(frame);view.removeEventListener('resize',schedule);document.removeEventListener('scroll',schedule,true);view.visualViewport?.removeEventListener('resize',schedule);view.visualViewport?.removeEventListener('scroll',schedule);if(node.hasAttribute('popover')){if(node.isConnected&&node.matches(':popover-open'))node.hidePopover();node.removeAttribute('popover');}};
  },[open,host,anchor]);
  useBrowserLayoutEffect(()=>{reposition.current?.();});
  return {trigger:{ref:setAnchor,'aria-describedby':[describedBy,open&&!disabled?id:null].filter(Boolean).join(' ')||undefined},surface:open&&!disabled&&host?createPortal(<SedaProvider ref={scope} {...configuration} style={{display:'contents'}}><div ref={surface} id={id} role="tooltip" className="seda-tooltip" data-variant={variant} onPointerEnter={()=>{cancel();state.current.surface=true;}} onPointerLeave={()=>{state.current.surface=false;leave();}}><div className="seda-tooltip__content"><Text variant="caption/default">{content}</Text></div></div></SedaProvider>,host):null};
}
