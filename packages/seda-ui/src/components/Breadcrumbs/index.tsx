import {forwardRef,useId,useRef,useState} from 'react';
import type {HTMLAttributes,MouseEventHandler,ReactNode} from 'react';
import type {SedaSize} from '../../types';
import {SedaProvider,useSedaSize} from '../../foundation/SedaProvider';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {cx} from '../../utils/classNames';

export interface BreadcrumbItem {
  id:string;
  label:string;
  /** Required for available ancestors. The last item is always the current page. */
  href?:string;
  disabled?:boolean;
  icon?:ReactNode;
  onClick?:MouseEventHandler<HTMLAnchorElement>;
}
export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>,'children'> {
  label:string;
  items:readonly BreadcrumbItem[];
  variant?:'ghost'|'text';
  separator?:'slash'|'triangle';
  size?:SedaSize;
  /** Keep first, penultimate and current levels; reveal the intervening path inline. */
  maxItems?:number;
  expandLabel?:string;
}
const named=(value:unknown):value is string=>typeof value==='string'&&!!value.trim();
/** Native hierarchy navigation. Routing and destination ownership stay with the application. */
export const Breadcrumbs=forwardRef<HTMLElement,BreadcrumbsProps>(({label,items,variant='ghost',separator='slash',size:sizeProp,maxItems=4,expandLabel='Show full path',className,...props},ref)=>{
  const size=useSedaSize(sizeProp),listId=useId(),navigation=useRef<HTMLElement|null>(null),firstRevealed=useRef<HTMLAnchorElement|null>(null),restore=useRef(false);
  const [expandedPath,setExpandedPath]=useState<string|null>(null);
  if(!named(label)||!named(expandLabel)||!['ghost','text'].includes(variant)||!['slash','triangle'].includes(separator)||!['s','m','l','xl'].includes(size)||!Number.isSafeInteger(maxItems)||maxItems<3||!Array.isArray(items)||!items.length)throw new TypeError('Breadcrumbs needs a named nonempty hierarchy, supported appearance and maxItems >= 3');
  const ids=new Set<string>();
  for(const [index,item] of items.entries()){
    if(!named(item.id)||ids.has(item.id)||!named(item.label)||item.disabled!==undefined&&typeof item.disabled!=='boolean'||item.onClick!==undefined&&typeof item.onClick!=='function'||index<items.length-1&&!item.disabled&&!named(item.href))throw new TypeError('Breadcrumb ancestors need unique IDs, visible labels and destinations');
    ids.add(item.id);
  }
  const path=JSON.stringify(items.map(item=>[item.id,item.href,item.label]));
  const collapsed=items.length>maxItems&&expandedPath!==path;
  const hiddenCount=items.length-3;
  const revealIndex=items.findIndex((item,index)=>index>0&&index<items.length-1&&!item.disabled);
  useBrowserLayoutEffect(()=>{
    if(restore.current){restore.current=false;(firstRevealed.current??navigation.current)?.focus({preventScroll:true});}
  },[expandedPath]);
  const render=(item:BreadcrumbItem,index:number)=>{
    const current=index===items.length-1;
    const content=<>{item.icon&&<span className="seda-breadcrumbs__icon" aria-hidden="true">{item.icon}</span>}<span className="seda-breadcrumbs__label">{item.label}</span></>;
    const shared={className:'seda-breadcrumbs__item',title:item.label,'data-breadcrumb-id':item.id};
    return <li key={item.id} className="seda-breadcrumbs__level">
      {index>0&&<span className="seda-breadcrumbs__separator" aria-hidden="true">{separator==='slash'?'/':<i/>}</span>}
      {current?<span {...shared} aria-current="page">{content}</span>:item.disabled?<span {...shared} aria-disabled="true">{content}</span>:<a {...shared} ref={index===(revealIndex<0?0:revealIndex)?firstRevealed:undefined} href={item.href} onClick={item.onClick}>{content}</a>}
    </li>;
  };
  return <SedaProvider controlSize={size} className="seda-breadcrumbs-scope"><nav {...props} tabIndex={-1} ref={node=>{navigation.current=node;if(typeof ref==='function')ref(node);else if(ref)ref.current=node;}} aria-label={label} className={cx('seda-breadcrumbs',className)} data-size={size} data-variant={variant} data-separator={separator}>
    <ol id={listId} className="seda-breadcrumbs__list">{items.map((item,index)=>{
      if(collapsed&&index===1)return <li key={item.id} className="seda-breadcrumbs__level"><span className="seda-breadcrumbs__separator" aria-hidden="true">{separator==='slash'?'/':<i/>}</span><button type="button" className="seda-breadcrumbs__item" aria-label={expandLabel} aria-expanded="false" aria-controls={listId} title={expandLabel} onClick={()=>{restore.current=true;setExpandedPath(path);}}>…<span className="seda-visually-hidden"> ({hiddenCount})</span></button></li>;
      if(collapsed&&index>1&&index<items.length-2)return null;
      return render(item,index);
    })}</ol>
  </nav></SedaProvider>;
});
Breadcrumbs.displayName='Breadcrumbs';
