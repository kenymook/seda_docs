import {createContext,forwardRef,Fragment,isValidElement,useContext,useId,useImperativeHandle,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {Icon} from '../Icon';
import {IconButton} from '../IconButton';
import {Text} from '../Text';
import {cx} from '../../utils/classNames';
import {mergeDescriptionIds} from '../../utils/fieldMessage';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import type {ModalProps,ModalChangeDetails} from './Modal.types';

const ModalScope=createContext(false);
// Native modal interaction is document-wide, including independent React roots.
const owners=new WeakMap<Document,HTMLDialogElement>();
const selector='button,input:not([type="hidden"]),select,textarea,a[href],area[href],summary,[tabindex],[contenteditable="true"],[contenteditable=""]';
function present(value:ReactNode):boolean {
  if(value==null||typeof value==='boolean')return false;
  if(typeof value==='string')return !!value.trim();
  if(Array.isArray(value))return value.some(present);
  if(isValidElement<{children?:ReactNode}>(value)&&value.type===Fragment)return present(value.props.children);
  return true;
}
function usable(node:HTMLElement|null|undefined,root:HTMLDialogElement):node is HTMLElement {
  if(!node?.isConnected||!root.contains(node)||node.matches(':disabled')||node.closest('[hidden],[inert]'))return false;
  const style=node.ownerDocument.defaultView?.getComputedStyle(node);
  return !!node.getClientRects().length&&style?.visibility!=='hidden'&&style?.visibility!=='collapse';
}
function tabbables(root:HTMLElement):HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(node=>node.tabIndex>=0&&!node.matches(':disabled')&&!node.closest('[hidden],[inert]')&&!!node.getClientRects().length&&node.ownerDocument.defaultView?.getComputedStyle(node).visibility!=='hidden')
    .map((node,index)=>({node,index})).sort((a,b)=>((a.node.tabIndex||Infinity)-(b.node.tabIndex||Infinity))||a.index-b.index).map(item=>item.node);
}
function otherModal(dialog:HTMLDialogElement) {
  return Array.from(dialog.ownerDocument.querySelectorAll('dialog:modal')).some(node=>node!==dialog);
}
/** Reveal only modal-local scrollports; never scroll the underlying application. */
function reveal(target:HTMLElement,dialog:HTMLDialogElement) {
  for(let parent=target.parentElement;parent;parent=parent.parentElement){
    const style=parent.ownerDocument.defaultView?.getComputedStyle(parent),r=target.getBoundingClientRect(),p=parent.getBoundingClientRect();
    if(style){
      const x=p.left+parent.clientLeft,y=p.top+parent.clientTop;
      const dx=/auto|scroll/.test(style.overflowX)&&parent.scrollWidth>parent.clientWidth?(r.left<x?r.left-x:r.right>x+parent.clientWidth?r.right-x-parent.clientWidth:0):0;
      const dy=/auto|scroll/.test(style.overflowY)&&parent.scrollHeight>parent.clientHeight?(r.top<y?r.top-y:r.bottom>y+parent.clientHeight?r.bottom-y-parent.clientHeight:0):0;
      if(dx||dy)parent.scrollBy({left:dx,top:dy,behavior:'instant'});
    }
    if(parent===dialog)break;
  }
}

/** Native top-layer modal. Its surface size is not a single-line control profile. */
export const Modal=forwardRef<HTMLDialogElement,ModalProps>(({
  open,onOpenChange,title,description,variant='default',size:requestedSize,footer,
  showCloseButton=true,closeLabel='Закрыть диалог',closeOnEscape=true,closeOnScrimClick=false,
  initialFocusRef,returnFocusRef,id,className,children,onKeyDown,onFocusCapture,
  onPointerDown,onPointerUp,onPointerCancel,onClick,...props
},forwardedRef)=>{
  const nested=useContext(ModalScope),generated=useId(),rootId=id??generated,titleId=rootId+'-title',descriptionId=rootId+'-description';
  const size=requestedSize??(variant==='fullscreen'?'xl':'m');
  if(typeof open!=='boolean'||typeof onOpenChange!=='function'||typeof title!=='string'||!title.trim())throw new TypeError('Modal needs controlled open, onOpenChange and a non-empty title');
  if(!['default','confirmation','alert','fullscreen'].includes(variant)||!['s','m','l','xl'].includes(size)||variant==='fullscreen'&&size!=='xl')throw new TypeError('Unsupported Modal variant or surface size');
  if(closeOnScrimClick&&(variant==='confirmation'||variant==='alert'))throw new TypeError('Confirmation and alert Modal cannot dismiss on scrim');
  if((variant==='confirmation'||variant==='alert')&&!present(description))throw new TypeError('Confirmation and alert Modal require a description');
  if(typeof closeLabel!=='string'||!closeLabel.trim())throw new TypeError('Modal close label must be non-empty');
  if(open&&nested)throw new TypeError('Nested Modal is unsupported; replace the current flow');
  if(open&&props.hidden)throw new TypeError('An open Modal cannot be hidden');

  const ref=useRef<HTMLDialogElement>(null),heading=useRef<HTMLElement>(null),body=useRef<HTMLDivElement>(null),content=useRef<HTMLDivElement>(null);
  const latest=useRef({open,onOpenChange,variant,closeOnEscape,closeOnScrimClick,initialFocusRef,returnFocusRef});
  const trigger=useRef<HTMLElement|null>(null),cycle=useRef(false),generation=useRef(0),alive=useRef(false),internalClose=useRef(false),requesting=useRef(false);
  const closeRecords=useRef<{generation:number;internal:boolean}[]>([]),pointer=useRef<{id:number;outside:boolean}|null>(null),scrimClick=useRef(false);
  const [bodyFocusable,setBodyFocusable]=useState(false);
  useImperativeHandle(forwardedRef,()=>ref.current as HTMLDialogElement);
  useBrowserLayoutEffect(()=>{latest.current={open,onOpenChange,variant,closeOnEscape,closeOnScrimClick,initialFocusRef,returnFocusRef};});

  function request(next:boolean,reason:ModalChangeDetails['reason']) {
    if(requesting.current||next===latest.current.open)return;
    requesting.current=true;
    try{latest.current.onOpenChange(next,{reason,returnValue:ref.current?.returnValue??''});}
    finally{queueMicrotask(()=>{requesting.current=false;});}
  }
  function initial(dialog:HTMLDialogElement) {
    const explicit=latest.current.initialFocusRef?.current;
    const field=latest.current.variant==='default'?Array.from(dialog.querySelectorAll<HTMLElement>('input:not([type="hidden"]),select,textarea,[contenteditable="true"]')).find(node=>usable(node,dialog)):undefined;
    const target=usable(explicit,dialog)?explicit:field??heading.current;
    target?.focus({preventScroll:true});if(target)reveal(target,dialog);
  }
  function restore(dialog:HTMLDialogElement) {
    if(otherModal(dialog))return;
    const target=latest.current.returnFocusRef?.current??trigger.current,doc=dialog.ownerDocument,active=doc.activeElement;
    if(target?.isConnected&&!target.matches(':disabled')&&target.getClientRects().length&&(active===doc.body||active===trigger.current||active===dialog||dialog.contains(active)))target.focus({preventScroll:true});
  }
  function closeNative(dialog:HTMLDialogElement) {
    if(!dialog.open)return;
    const count=closeRecords.current.length;internalClose.current=true;
    try{dialog.close();}finally{internalClose.current=false;}
    // Fallback for engines which omit dialog beforetoggle.
    if(closeRecords.current.length===count)closeRecords.current.push({generation:generation.current,internal:true});
  }
  useBrowserLayoutEffect(()=>{
    const dialog=ref.current;if(!dialog)return;
    alive.current=true;const epoch=++generation.current;
    const before=(event:Event)=>{
      const state=(event as ToggleEvent).newState;
      if(state==='closed')closeRecords.current.push({generation:generation.current,internal:internalClose.current});
      if(state==='open'&&!latest.current.open){event.preventDefault();request(true,'native');}
    };
    const closed=()=>{
      const record=closeRecords.current.shift()??{generation:epoch,internal:false};
      if(record.internal||record.generation!==generation.current||!alive.current||!latest.current.open||dialog.open)return;
      request(false,'native');
      queueMicrotask(()=>{if(alive.current&&generation.current===epoch&&latest.current.open&&dialog.isConnected&&!dialog.open&&!otherModal(dialog)){dialog.showModal();initial(dialog);}});
    };
    const cancel=(event:Event)=>{event.preventDefault();if(latest.current.closeOnEscape)request(false,'escape');};
    dialog.addEventListener('beforetoggle',before);dialog.addEventListener('close',closed);dialog.addEventListener('cancel',cancel);
    dialog.setAttribute('closedby','closerequest');
    let observer:MutationObserver|undefined,resize:ResizeObserver|undefined;
    const repair=()=>{
      if(!alive.current||generation.current!==epoch||!dialog.open||!latest.current.open)return;
      const area=body.current;
      if(area)setBodyFocusable(area.scrollHeight>area.clientHeight+1&&!tabbables(area).length);
      const active=dialog.ownerDocument.activeElement as HTMLElement|null;
      if(!otherModal(dialog)&&(!active||!dialog.contains(active)||active.matches(':disabled')))initial(dialog);
    };
    try{
      if(open){
        const existing=owners.get(dialog.ownerDocument);
        if(existing&&existing!==dialog&&existing.isConnected||otherModal(dialog))throw new TypeError('Only one Modal may be active in a document');
        owners.set(dialog.ownerDocument,dialog);
        if(!cycle.current){trigger.current=dialog.ownerDocument.activeElement as HTMLElement|null;cycle.current=true;dialog.returnValue='';}
        heading.current?.setAttribute('autofocus','');
        if(!dialog.open)dialog.showModal();
        if(!dialog.getClientRects().length)throw new TypeError('Modal must be rendered in a visible application scope');
        initial(dialog);
        observer=new MutationObserver(repair);observer.observe(dialog,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','hidden','inert','style','class']});
        resize=new ResizeObserver(repair);if(body.current)resize.observe(body.current);if(content.current)resize.observe(content.current);repair();
      }else cycle.current=false;
    }catch(error){
      closeNative(dialog);if(owners.get(dialog.ownerDocument)===dialog)owners.delete(dialog.ownerDocument);
      dialog.removeEventListener('beforetoggle',before);dialog.removeEventListener('close',closed);dialog.removeEventListener('cancel',cancel);alive.current=false;throw error;
    }
    return()=>{
      observer?.disconnect();resize?.disconnect();alive.current=false;
      closeNative(dialog);if(owners.get(dialog.ownerDocument)===dialog)owners.delete(dialog.ownerDocument);generation.current++;
      dialog.removeEventListener('beforetoggle',before);dialog.removeEventListener('close',closed);dialog.removeEventListener('cancel',cancel);
      if(open)queueMicrotask(()=>{if(!alive.current||!latest.current.open)restore(dialog);});
    };
  },[open]);
  useBrowserLayoutEffect(()=>{
    const dialog=ref.current,active=dialog?.ownerDocument.activeElement as HTMLElement|null;
    if(dialog?.open&&open&&(!active||!dialog.contains(active))&&!otherModal(dialog))initial(dialog);
  });

  const hasDescription=present(description),hasBody=present(children),hasFooter=present(footer);
  const outside=(x:number,y:number)=>{const r=ref.current!.getBoundingClientRect();return x<r.left||x>r.right||y<r.top||y>r.bottom;};
  const externalDescriptions=props['aria-describedby']?.split(/\s+/).filter(value=>value&&(hasDescription||value!==descriptionId)).join(' ');
  return <ModalScope.Provider value={true}><dialog {...props} id={rootId} ref={ref} className={cx('seda-modal',className)}
    data-seda-component="Modal" data-modal-size={size} data-modal-variant={variant}
    role={variant==='alert'?'alertdialog':undefined} aria-modal="true"
    aria-labelledby={props['aria-labelledby']??(props['aria-label']?undefined:titleId)}
    aria-describedby={mergeDescriptionIds(externalDescriptions,hasDescription?descriptionId:undefined)}
    onKeyDown={event=>{
      onKeyDown?.(event);if(event.defaultPrevented||event.key!=='Tab')return;
      const dialog=event.currentTarget,items=tabbables(dialog),active=dialog.ownerDocument.activeElement;
      if(!items.length){event.preventDefault();heading.current?.focus({preventScroll:true});return;}
      if(event.shiftKey&&(active===items[0]||active===heading.current)||!event.shiftKey&&active===items[items.length-1]){
        event.preventDefault();(event.shiftKey?items[items.length-1]:items[0])?.focus({preventScroll:true});
      }
    }}
    onFocusCapture={event=>{onFocusCapture?.(event);if(!event.defaultPrevented&&event.target!==event.currentTarget)reveal(event.target as HTMLElement,event.currentTarget);}}
    onPointerDown={event=>{onPointerDown?.(event);scrimClick.current=false;pointer.current={id:event.pointerId,outside:!event.defaultPrevented&&event.button===0&&event.target===event.currentTarget&&outside(event.clientX,event.clientY)};}}
    onPointerUp={event=>{onPointerUp?.(event);scrimClick.current=!event.defaultPrevented&&pointer.current?.id===event.pointerId&&!!pointer.current.outside&&event.target===event.currentTarget&&outside(event.clientX,event.clientY);pointer.current=null;}}
    onPointerCancel={event=>{pointer.current=null;scrimClick.current=false;onPointerCancel?.(event);}}
    onClick={event=>{const dismiss=scrimClick.current;scrimClick.current=false;onClick?.(event);if(!event.defaultPrevented&&dismiss&&latest.current.closeOnScrimClick)request(false,'scrim');}}>
      <header className="seda-modal__header"><div className="seda-modal__heading">
        <Text as="h2" variant="heading/section" id={titleId} ref={heading} tabIndex={-1}>{title}</Text>
        {hasDescription?<Text as="div" variant="body/small" id={descriptionId} className="seda-modal__description">{description}</Text>:null}
      </div>{showCloseButton?<IconButton className="seda-modal__close" aria-label={closeLabel} variant="ghost" icon={<Icon name="close"/>} onClick={()=>request(false,'close-button')}/>:null}</header>
      {hasBody?<div className="seda-modal__body" ref={body} tabIndex={bodyFocusable?0:undefined} role={bodyFocusable?'region':undefined} aria-labelledby={bodyFocusable?titleId:undefined}><div className="seda-modal__content" ref={content}>{children}</div></div>:null}
      {hasFooter?<footer className="seda-modal__footer">{footer}</footer>:null}
    </dialog></ModalScope.Provider>;
});
Modal.displayName='Modal';
