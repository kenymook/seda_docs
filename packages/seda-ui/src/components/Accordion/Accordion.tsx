import {forwardRef,useId,useImperativeHandle,useRef,useState} from 'react';
import type {KeyboardEvent} from 'react';
import {useSedaSize} from '../../foundation/SedaProvider';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {hasSlotContent} from '../../utils/hasSlotContent';
import {cx} from '../../utils/classNames';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Badge} from '../Badge';
import {Text} from '../Text';
import type {AccordionProps} from './Accordion.types';

const named=(v:unknown):v is string=>typeof v==='string'&&!!v.trim();
export const Accordion=forwardRef<HTMLDivElement,AccordionProps>(({
  label,items,type,collapsible,value,defaultValue,onValueChange,variant='default',size='medium',disabled=false,rovingFocus=false,forceMount=true,headingLevel=3,id,className,onFocusCapture,...props
},ref)=>{
  const controlSize=useSedaSize(undefined),generated=useId(),rootId=id??generated,root=useRef<HTMLDivElement|null>(null),buttons=useRef(new Map<string,HTMLButtonElement>()),focused=useRef<HTMLElement|null>(null),focusedItem=useRef<string|null>(null),ownedFocus=useRef(false);
  const [focusKey,setFocusKey]=useState<string>();
  useImperativeHandle(ref,()=>root.current!,[]);
  if(!named(label)||!Array.isArray(items)||!items.length||!['single','multiple'].includes(type)||!['default','bordered','elevated','compact'].includes(variant)||!['compact','medium','large'].includes(size)||![2,3,4,5,6].includes(headingLevel)||[disabled,rovingFocus,forceMount].some(v=>typeof v!=='boolean')||!named(rootId)||/\s/.test(rootId))throw new TypeError('Accordion needs a label, items and supported semantics/density');
  if(type==='single'&&typeof collapsible!=='boolean'||type==='multiple'&&collapsible!==undefined||value!==undefined&&(defaultValue!==undefined||typeof onValueChange!=='function')||onValueChange!==undefined&&typeof onValueChange!=='function')throw new TypeError('Accordion requires explicit mode/ownership and single-mode collapse policy');
  const keys=new Set<string>();
  for(const item of items){if(!named(item.id)||keys.has(item.id)||!named(item.title)||item.description!==undefined&&!named(item.description)||item.disabled!==undefined&&typeof item.disabled!=='boolean'||item.badge!==undefined&&!(typeof item.badge==='string'&&!!item.badge.trim()||typeof item.badge==='number'&&Number.isFinite(item.badge)&&item.badge>=0)||!hasSlotContent(item.content))throw new TypeError('Invalid Accordion item, empty panel or duplicate id');keys.add(item.id);}
  const read=(input:unknown):string[]=>{
    const next=type==='single'?(typeof input==='string'?(input?[input]:[]):null):Array.isArray(input)?input:null;
    if(!next||next.some(k=>!named(k)||!keys.has(k))||new Set(next).size!==next.length)throw new TypeError('Accordion values must match unique existing item ids and their mode');return [...next];
  };
  const [local,setLocal]=useState(()=>read(defaultValue??(type==='single'?'':[])));
  const controlled=value!==undefined,enabled=items.filter(item=>!disabled&&!item.disabled).map(item=>item.id);
  let open=controlled?read(value):local.filter(key=>keys.has(key));
  if(type==='single'&&open.length>1)open=open.slice(0,1);
  if(type==='single'&&!collapsible&&!open.length&&enabled.length){if(controlled)throw new TypeError('Non-collapsible controlled Accordion needs an open item');open=[enabled[0]!];}
  const expanded=new Set(open),roving=focusKey&&enabled.includes(focusKey)?focusKey:enabled.find(k=>expanded.has(k))??enabled[0];
  const reveal=(node:HTMLElement)=>{
    // Native Tab already scrolls. Programmatic repair/arrow navigation only adjusts owning scroll areas.
    for(let parent=node.parentElement;parent;parent=parent.parentElement){const style=parent.ownerDocument.defaultView!.getComputedStyle(parent);if(/auto|scroll/.test(style.overflowY)){const r=parent.getBoundingClientRect(),a=node.getBoundingClientRect();if(a.top<r.top)parent.scrollBy({top:a.top-r.top,behavior:'instant'});else if(a.bottom>r.bottom)parent.scrollBy({top:a.bottom-r.bottom,behavior:'instant'});break;}}
  };
  useBrowserLayoutEffect(()=>{const doc=root.current?.ownerDocument;if(!doc)return;const track=(event:FocusEvent)=>{ownedFocus.current=!!root.current?.contains(event.target as Node);};doc.addEventListener('focusin',track);return()=>doc.removeEventListener('focusin',track);},[]);
  useBrowserLayoutEffect(()=>{
    if(!controlled&&(local.length!==open.length||local.some((key,i)=>open[i]!==key)))setLocal(open);
    const host=root.current,doc=host?.ownerDocument,old=focused.current;if(!host||!doc)return;
    const unavailable=old&&(!old.isConnected||!!old.closest('[hidden]')||old.matches(':disabled'));
    if(ownedFocus.current&&unavailable&&(doc.activeElement===doc.body||doc.activeElement===old)){
      const item=focusedItem.current;const target=(item&&enabled.includes(item)?buttons.current.get(item):undefined)??(roving?buttons.current.get(roving):undefined)??host;target.focus({preventScroll:true});focused.current=target;reveal(target);
    }
  });
  const toggle=(key:string)=>{
    if(!enabled.includes(key))return;
    const next=type==='single'?(expanded.has(key)?collapsible?[]:open:[key]):expanded.has(key)?open.filter(k=>k!==key):[...open,key];
    if(next.length===open.length&&next.every((key,i)=>key===open[i]))return;
    if(!controlled)setLocal(next);
    if(type==='single')(onValueChange as ((v:string)=>void)|undefined)?.(next[0]??'');else(onValueChange as ((v:string[])=>void)|undefined)?.(next);
  };
  const navigate=(event:KeyboardEvent<HTMLButtonElement>,key:string)=>{
    if(!rovingFocus||event.altKey||event.ctrlKey||event.metaKey)return;const index=enabled.indexOf(key);let next:string|undefined;
    if(event.key==='Home')next=enabled[0];else if(event.key==='End')next=enabled[enabled.length-1];else if(event.key==='ArrowDown')next=enabled[(index+1)%enabled.length];else if(event.key==='ArrowUp')next=enabled[(index-1+enabled.length)%enabled.length];
    if(next){event.preventDefault();setFocusKey(next);const node=buttons.current.get(next);if(node){node.focus({preventScroll:true});reveal(node);}}
  };
  const Heading=('h'+headingLevel) as 'h2'|'h3'|'h4'|'h5'|'h6';
  return <div {...props} ref={root} id={rootId} role="group" aria-label={label} tabIndex={-1} className={cx('seda-accordion',className)} data-variant={variant} data-density={size} data-size={controlSize} data-disabled={disabled||undefined}
    onFocusCapture={event=>{ownedFocus.current=true;focused.current=event.target as HTMLElement;focusedItem.current=(event.target as HTMLElement).closest('[data-accordion-item]')?.getAttribute('data-accordion-item')??null;onFocusCapture?.(event);}}>
    {items.map(item=>{const suffix=encodeURIComponent(item.id),triggerId=rootId+'-trigger-'+suffix,panelId=rootId+'-panel-'+suffix,isOpen=expanded.has(item.id),off=disabled||!!item.disabled;return <section key={item.id} className="seda-accordion__item" data-accordion-item={item.id} data-expanded={isOpen} data-disabled={off||undefined}>
      <Heading className="seda-accordion__heading"><Button id={triggerId} ref={node=>{if(node)buttons.current.set(item.id,node);else buttons.current.delete(item.id);}} variant="ghost" size={controlSize} disabled={off} className="seda-accordion__trigger" aria-label={item.title} aria-describedby={[item.description?triggerId+'-description':'',item.badge!==undefined?triggerId+'-badge':''].filter(Boolean).join(' ')||undefined} aria-expanded={isOpen} aria-controls={panelId} aria-disabled={type==='single'&&!collapsible&&isOpen||off||undefined} tabIndex={rovingFocus?(roving===item.id?0:-1):undefined} onFocus={()=>setFocusKey(item.id)} onKeyDown={event=>navigate(event,item.id)} onClick={()=>toggle(item.id)} iconLeft={item.icon} iconRight={<Icon name="arrow-chevron-down"/>}>
        <span className="seda-accordion__title-block"><span className="seda-accordion__title">{item.title}</span>{item.description&&<Text id={triggerId+'-description'} variant="caption/default" className="seda-accordion__description">{item.description}</Text>}</span>
        {item.badge!==undefined&&<Badge id={triggerId+'-badge'} variant={typeof item.badge==='number'?'count':'label'} {...(typeof item.badge==='number'?{count:item.badge}:{label:item.badge})} decorative/>}
      </Button></Heading>
      {(forceMount||isOpen)&&<div id={panelId} role="region" aria-labelledby={triggerId} hidden={!isOpen} className="seda-accordion__panel">{item.content}</div>}
    </section>;})}
  </div>;
});
Accordion.displayName='Accordion';
