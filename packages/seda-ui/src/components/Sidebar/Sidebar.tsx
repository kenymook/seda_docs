import {forwardRef,useId,useRef} from 'react';
import type {ReactElement} from 'react';
import {useSedaSize} from '../../foundation/SedaProvider';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {hasSlotContent} from '../../utils/hasSlotContent';
import {cx} from '../../utils/classNames';
import {Link} from '../Link';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Text} from '../Text';
import {Tooltip} from '../Tooltip';
import type {TooltipTriggerProps} from '../Tooltip/Tooltip.types';
import type {SidebarItem,SidebarProps,SidebarSection} from './Sidebar.types';

const named=(v:unknown):v is string=>typeof v==='string'&&!!v.trim();
/** Persistent, native navigation. Never a menu/tree keyboard model or a mobile drawer. */
export const Sidebar=forwardRef<HTMLElement,SidebarProps>(({label,sections,selectedKey,full=true,size:sizeProp,header,footer,loading=false,loadingLabel,className,...props},ref)=>{
  const size=useSedaSize(sizeProp),id=useId(),body=useRef<HTMLElement|null>(null),focused=useRef<HTMLElement|null>(null),restore=useRef(false);
  if(!named(label)||typeof full!=='boolean'||typeof loading!=='boolean'||!['s','m','l','xl'].includes(size)||!Array.isArray(sections)||!sections.length||loading&&!named(loadingLabel)||!loading&&loadingLabel!==undefined)throw new TypeError('Sidebar needs named sections, supported size and explicit loading status');
  const keys=new Map<string,SidebarItem>(),groups=new Set<string>();
  for(const section of sections){
    if(!named(section.id)||groups.has(section.id)||!Array.isArray(section.items)||section.label!==undefined&&!named(section.label)||!section.items.length&&!named(section.emptyText))throw new TypeError('Invalid Sidebar section or missing empty text');groups.add(section.id);
    if(section.collapsible!==undefined&&typeof section.collapsible!=='boolean')throw new TypeError('Sidebar collapse is an explicit boolean');
    if(section.collapsible){if(!named(section.label)||typeof section.expanded!=='boolean'||typeof section.onExpandedChange!=='function'||!named(section.expandLabel)||!named(section.collapseLabel))throw new TypeError('Collapsible Sidebar sections need owned state and named controls');}
    else if(section.expanded!==undefined||section.onExpandedChange!==undefined||section.expandLabel!==undefined||section.collapseLabel!==undefined)throw new TypeError('Collapse properties require a collapsible Sidebar section');
    for(const item of section.items){
      if(!named(item.id)||keys.has(item.id)||!named(item.label)||!['link','action'].includes(item.kind)||!full&&!hasSlotContent(item.icon)||item.disabled!==undefined&&typeof item.disabled!=='boolean'||item.description!==undefined&&!named(item.description))throw new TypeError('Invalid Sidebar item or missing collapsed icon');
      if(item.kind==='link'&&(!named(item.href)||item.target!==undefined&&!['_self','_blank'].includes(item.target)||item.onClick!==undefined&&typeof item.onClick!=='function')||item.kind==='action'&&(typeof item.onClick!=='function'||item.href!==undefined||item.target!==undefined))throw new TypeError('Sidebar separates native destinations and owned actions');keys.set(item.id,item);
    }
  }
  if(selectedKey!==undefined&&(!named(selectedKey)||!keys.has(selectedKey)||keys.get(selectedKey)!.kind!=='link'||keys.get(selectedKey)!.disabled))throw new TypeError('Current Sidebar key must name an available link');
  useBrowserLayoutEffect(()=>{const nav=body.current,doc=nav?.ownerDocument;if(!nav||!doc)return;const track=(event:FocusEvent)=>{restore.current=nav.contains(event.target as Node);};doc.addEventListener('focusin',track);return()=>doc.removeEventListener('focusin',track);},[]);
  // Remember only focus owned by the scrolling navigation. Removing/hiding its item repairs it locally.
  useBrowserLayoutEffect(()=>{
    const nav=body.current,doc=nav?.ownerDocument;if(!nav||!doc)return;
    const old=focused.current,available=(n:HTMLElement)=>n.isConnected&&!n.closest('[hidden]')&&!n.matches(':disabled,[aria-disabled=true]');
    if(restore.current&&old&&!available(old)&&(doc.activeElement===doc.body||doc.activeElement===old)){
      const section=old.closest('[data-sidebar-section]')?.getAttribute('data-sidebar-section');
      const candidates=[...nav.querySelectorAll<HTMLElement>('[data-sidebar-disclosure],a:not([aria-disabled=true]),button:not(:disabled)')];
      const oldKey=old.getAttribute('data-sidebar-item');
      const next=candidates.find(n=>available(n)&&oldKey&&n.getAttribute('data-sidebar-item')===oldKey)??candidates.find(n=>available(n)&&section&&n.getAttribute('data-sidebar-disclosure')===section)??candidates.find(n=>available(n)&&n.getAttribute('aria-current')==='page')??candidates.find(available)??nav;next.focus({preventScroll:true});focused.current=next;
    }
    const active=doc.activeElement;if(active instanceof HTMLElement&&nav.contains(active)){const r=nav.getBoundingClientRect(),a=active.getBoundingClientRect();if(a.top<r.top)nav.scrollBy({top:a.top-r.top,behavior:'instant'});else if(a.bottom>r.bottom)nav.scrollBy({top:a.bottom-r.bottom,behavior:'instant'});}
  });
  const current=(item:SidebarItem)=>!loading&&item.id===selectedKey;
  function renderItem(item:SidebarItem):ReactElement{
    const name=<><span className={full?'seda-sidebar__label':'seda-visually-hidden'}>{item.label}</span>{hasSlotContent(item.annotation)&&<span className={full?'seda-sidebar__annotation':'seda-visually-hidden'}>{item.annotation}</span>}</>;
    const render=(trigger:Partial<TooltipTriggerProps>={})=>{
      const common={...trigger,className:'seda-sidebar__item',size,disabled:loading||!!item.disabled,'data-sidebar-item':item.id,'data-selected':current(item)||undefined,'aria-label':!full?item.label:undefined,title:full?item.description??item.label:undefined};
      return item.kind==='link'?<Link {...common} href={item.href} target={item.target} aria-current={current(item)?'page':undefined} variant="subtle" iconLeft={item.icon} onClick={item.onClick}>{name}</Link>:<Button {...common} variant="ghost" iconLeft={item.icon} onClick={item.onClick}>{name}</Button>;
    };
    return <li key={item.id}>{full?render():<Tooltip content={item.description?item.label+' — '+item.description:item.label} placement="right">{render}</Tooltip>}</li>;
  }
  const renderSection=(section:SidebarSection,index:number)=>{
    const heading=id+'-section-'+index,content=id+'-items-'+index,open=!section.collapsible||section.expanded;
    const disclosureLabel=section.collapsible?(open?section.collapseLabel:section.expandLabel):'';
    const currentInClosedGroup=!open&&!loading&&section.items.some(item=>item.id===selectedKey);
    return <section key={section.id} data-sidebar-section={section.id} aria-labelledby={section.label?heading:undefined} className="seda-sidebar__section">
      {section.label&&(section.collapsible?<Button id={heading} variant="ghost" size={size} className="seda-sidebar__disclosure" data-sidebar-disclosure={section.id} aria-label={disclosureLabel} aria-expanded={open} aria-controls={content} aria-current={currentInClosedGroup?'location':undefined} aria-describedby={currentInClosedGroup?heading+'-current':undefined} title={!full?section.label:undefined} disabled={loading} iconLeft={section.icon} iconRight={<Icon name="arrow-chevron-down"/>} onClick={()=>section.onExpandedChange(!open)}><span className={full?'':'seda-visually-hidden'}>{section.label}</span></Button>:<Text id={heading} as="h2" variant="label/small" className={cx('seda-sidebar__section-title',!full&&'seda-visually-hidden')}>{section.icon&&<span aria-hidden="true">{section.icon}</span>}{section.label}</Text>)}
      {currentInClosedGroup&&<span id={heading+'-current'} className="seda-visually-hidden">{keys.get(selectedKey!)!.label}</span>}
      <div id={content} hidden={!open}>{section.items.length?<ul className="seda-sidebar__items">{section.items.map(renderItem)}</ul>:<Text as="p" variant="caption/default" className={full?'seda-sidebar__empty':'seda-visually-hidden'}>{section.emptyText}</Text>}</div>
    </section>;
  };
  return <aside {...props} ref={ref as never} aria-label={label} className={cx('seda-sidebar',className)} data-size={size} data-full={full} data-loading={loading||undefined}>
    {hasSlotContent(header)&&<div className="seda-sidebar__header">{header}</div>}
    <nav ref={body} tabIndex={-1} aria-label={label} aria-busy={loading||undefined} className="seda-sidebar__navigation" onFocusCapture={event=>{restore.current=true;focused.current=event.target as HTMLElement;}}>{sections.map(renderSection)}</nav>
    {loading&&<Text as="p" variant="caption/default" role="status" className="seda-visually-hidden">{loadingLabel}</Text>}
    {hasSlotContent(footer)&&<div className="seda-sidebar__footer">{footer}</div>}
  </aside>;
});
Sidebar.displayName='Sidebar';
