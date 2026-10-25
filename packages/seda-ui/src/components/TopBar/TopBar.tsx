import {forwardRef,useId,useRef,useState} from 'react';
import {useSedaSize} from '../../foundation/SedaProvider';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {hasSlotContent} from '../../utils/hasSlotContent';
import {cx} from '../../utils/classNames';
import {Link} from '../Link';
import {Text} from '../Text';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Modal} from '../Modal';
import type {TopBarProps} from './TopBar.types';

const named=(value:unknown):value is string=>typeof value==='string'&&!!value.trim();
/** App navigation/chrome only. Scroll, route, request and action ownership stay outside. */
export const TopBar=forwardRef<HTMLElement,TopBarProps>(({
  label,as:Element='header',variant='app-bar',state='default',size:sizeProp,gutter='regular',
  brand,title,titleAs='span',leading,breadcrumbs,search,actions,userMenu,
  items,navigationLabel,navigationPresentation='inline',navigationTriggerLabel,navigationCloseLabel,
  className,...props
},ref)=>{
  const size=useSedaSize(sizeProp),navigation=useRef<HTMLElement|null>(null),dialogId=useId();
  const [open,setOpen]=useState(false);
  const enabled=Array.isArray(items)?items.filter(item=>!item.disabled):[];
  const initialFocus=useRef<HTMLElement|null>(null);
  const present={brand:hasSlotContent(brand),title:hasSlotContent(title),breadcrumbs:hasSlotContent(breadcrumbs),leading:hasSlotContent(leading),search:hasSlotContent(search),actions:hasSlotContent(actions),userMenu:hasSlotContent(userMenu)};
  if(!named(label)||!['header','div'].includes(Element)||!['app-bar','application','page-header','transparent'].includes(variant)||!['default','scrolled'].includes(state)||!['s','m','l','xl'].includes(size)||!['span','h1','h2','h3'].includes(titleAs)||!['compact','regular','wide'].includes(gutter))throw new TypeError('Unsupported TopBar label, variant, state, size or semantics');
  if(!present.brand&&!present.title&&!present.breadcrumbs&&!items?.length)throw new TypeError('TopBar needs a visible page/product/navigation context');
  if(variant==='application'&&!items?.length||items!==undefined&&(!Array.isArray(items)||!items.length||!named(navigationLabel)||variant==='app-bar'||variant==='page-header'))throw new TypeError('Primary navigation needs items, a name and an application/transparent variant');
  if(!['inline','dialog'].includes(navigationPresentation)||!items&&navigationPresentation!=='inline'||navigationPresentation==='dialog'&&(!named(navigationTriggerLabel)||!named(navigationCloseLabel)))throw new TypeError('Collapsed navigation needs named opening and closing controls');
  if(!items&&(navigationLabel!==undefined||navigationTriggerLabel!==undefined||navigationCloseLabel!==undefined)||navigationPresentation==='inline'&&(navigationTriggerLabel!==undefined||navigationCloseLabel!==undefined))throw new TypeError('Navigation labels require their matching presentation');
  if(items){const ids=new Set<string>();let selected=0;for(const item of items){if(!named(item.id)||ids.has(item.id)||!named(item.label)||!named(item.href)||item.target!==undefined&&!['_self','_blank'].includes(item.target))throw new TypeError('Invalid or duplicate TopBar navigation item');ids.add(item.id);if(item.selected){selected++;if(item.disabled)throw new TypeError('Current TopBar destination must remain available');}}if(selected>1)throw new TypeError('TopBar has one current route');}
  // Preserve native horizontal scrolling and reveal keyboard-focused links locally.
  const reveal=(element:HTMLElement)=>{
    const viewport=navigation.current;if(!viewport||!viewport.contains(element))return;
    const r=viewport.getBoundingClientRect(),n=element.getBoundingClientRect(),rtl=viewport.ownerDocument.defaultView!.getComputedStyle(viewport).direction==='rtl';
    const delta=n.width>viewport.clientWidth?(rtl?n.right-r.right:n.left-r.left):n.left<r.left?n.left-r.left:n.right>r.right?n.right-r.right:0;
    if(Math.abs(delta)>.05)viewport.scrollBy({left:delta,behavior:'instant'});
  };
  // Direction, fonts or item labels can move a focused link without resizing its viewport.
  useBrowserLayoutEffect(()=>{const viewport=navigation.current,active=viewport?.ownerDocument.activeElement;if(viewport&&active&&viewport.contains(active))reveal(active as HTMLElement);});
  useBrowserLayoutEffect(()=>{
    if(navigationPresentation==='inline'&&open){setOpen(false);const viewport=navigation.current;
      queueMicrotask(()=>{if(viewport?.isConnected&&viewport.ownerDocument.activeElement===viewport.ownerDocument.body){const link=viewport.querySelector<HTMLElement>('[aria-current="page"]')??viewport.querySelector<HTMLElement>('a:not([aria-disabled=true])');link?.focus({preventScroll:true});}});
    }
    const viewport=navigation.current,view=viewport?.ownerDocument.defaultView;
    if(!viewport||!view?.ResizeObserver)return;
    const observer=new view.ResizeObserver(()=>{const active=viewport.ownerDocument.activeElement;if(active instanceof HTMLElement&&viewport.contains(active))reveal(active);});observer.observe(viewport);return()=>observer.disconnect();
  },[navigationPresentation,open]);
  const links=(dialog:boolean)=>items?.map(item=><Link key={item.id} className="seda-top-bar__item" href={item.href} size={size} variant="subtle" disabled={item.disabled??false} aria-current={item.selected?'page':undefined} target={item.target} {...(item.target==='_blank'?{rel:'noopener noreferrer'}:{})} iconLeft={item.icon}
    ref={node=>{if(dialog&&(item.id===(enabled.find(i=>i.selected)??enabled[0])?.id))initialFocus.current=node;}}
    onFocus={event=>{if(!dialog)reveal(event.currentTarget);}}
    onClick={event=>{item.onClick?.(event);if(dialog&&event.button===0&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey)setOpen(false);}}>{item.label}</Link>);
  return <Element {...props} ref={ref as never} aria-label={label} className={cx('seda-top-bar',className)} data-variant={variant} data-state={state} data-size={size} data-gutter={gutter}>
    {present.leading&&<div className="seda-top-bar__leading">{leading}</div>}
    {(present.brand||present.title||present.breadcrumbs)&&<div className="seda-top-bar__context">
      {present.brand&&<div className="seda-top-bar__brand">{typeof brand==='string'?<Text as="strong" variant="label/default">{brand}</Text>:brand}</div>}
      {present.breadcrumbs&&<div className="seda-top-bar__breadcrumbs">{breadcrumbs}</div>}
      {present.title&&<div className="seda-top-bar__title">{typeof title==='string'?<Text as={titleAs} variant={variant==='page-header'?'heading/compact':'label/default'}>{title}</Text>:title}</div>}
    </div>}
    {items&&navigationPresentation==='inline'&&<nav ref={navigation} className="seda-top-bar__navigation" aria-label={navigationLabel}>{links(false)}</nav>}
    {items&&navigationPresentation==='dialog'&&<Button className="seda-top-bar__navigation-trigger" size={size} variant="secondary" aria-haspopup="dialog" aria-controls={dialogId} aria-expanded={open} iconRight={<Icon name="arrow-chevron-down"/>} onClick={()=>setOpen(true)}>{navigationTriggerLabel}</Button>}
    {present.search&&<div className="seda-top-bar__search">{search}</div>}
    {present.actions&&<div className="seda-top-bar__actions">{actions}</div>}
    {present.userMenu&&<div className="seda-top-bar__user">{userMenu}</div>}
    {items&&navigationPresentation==='dialog'&&<Modal id={dialogId} open={open} title={navigationLabel!} size="s" closeLabel={navigationCloseLabel!} initialFocusRef={initialFocus} onOpenChange={setOpen}><nav aria-label={navigationLabel} className="seda-top-bar__dialog-navigation">{links(true)}</nav></Modal>}
  </Element>;
});
TopBar.displayName='TopBar';
