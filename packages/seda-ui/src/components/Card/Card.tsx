import {forwardRef, useId, Fragment, isValidElement} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import {cx} from '../../utils/classNames';
import {hasMessage} from '../../utils/fieldMessage';
import {Checkbox} from '../Checkbox';
import {Text} from '../Text';
import type {CardProps} from './Card.types';

// Ignore known empty slots without inspecting opaque custom components or media elements.
function slotPresent(value:ReactNode):boolean {
  if(value==null||typeof value==='boolean')return false;
  if(typeof value==='string')return !!value.trim();
  if(Array.isArray(value))return value.some(slotPresent);
  if(isValidElement<{children?:ReactNode}>(value)&&value.type===Fragment)return slotPresent(value.props.children);
  return true;
}

/** One entity, explicit interaction, native semantics. Data and action ownership stay outside. */
export const Card = forwardRef<HTMLElement, CardProps>(function Card({
  title,description,metadata,children,status,actions,media,mediaAspectRatio,
  variant='default',interactiveStrategy,size:sizeProp,headingLevel,titleLines=2,descriptionLines=3,
  loading=false,loadingLabel='Загрузка',as:asProp,selected,disabled=false,
  onSelectedChange,href,onClick,id,className,style,...props
},ref) {
  const generated=useId();
  const titleId=(id ?? 'seda-card-'+generated.replace(/:/g,''))+'-title';
  const clickable=variant==='clickable',selectable=variant==='selectable';
  const size=sizeProp ?? (variant==='compact'?'compact':'medium');
  if (!hasMessage(title) || !['default','media','compact','clickable','selectable'].includes(variant) ||
      !['compact','medium','large'].includes(size) || headingLevel!==undefined&&![2,3,4,5,6].includes(headingLevel) || ![titleLines,descriptionLines].every(value=>Number.isInteger(value)&&value>=1&&value<=10) ||
      ![loading,disabled].every(value=>typeof value==='boolean') || !loadingLabel.trim()) {
    throw new TypeError('Card requires meaningful title and documented presentation');
  }
  if (selectable ? interactiveStrategy!=='selectable'||typeof selected!=='boolean'||typeof onSelectedChange!=='function' :
      selected!==undefined||onSelectedChange!==undefined) throw new TypeError('Card selection must be explicitly controlled');
  if (clickable) {
    if (interactiveStrategy!=='whole-card'||typeof title!=='string'||!title.trim()||
        metadata!==undefined&&typeof metadata!=='string'||children!=null||actions!=null||media!=null||status!=null||asProp||headingLevel!==undefined ||
        (!!href === (typeof onClick==='function')) || href!==undefined&&(!href.trim())) {
      throw new TypeError('Whole-card requires one native action and text-only content; use actions-only for composed cards');
    }
  } else if (href!==undefined||onClick!==undefined||!selectable&&interactiveStrategy!==undefined&&interactiveStrategy!=='actions-only'||!selectable&&disabled) {
    throw new TypeError('Content Card does not act as a hidden click target');
  }
  if (description!==undefined&&typeof description!=='string') throw new TypeError('Card description must be text');
  if (slotPresent(media)&&(!Number.isFinite(mediaAspectRatio)||!mediaAspectRatio||mediaAspectRatio<=0)||variant==='media'&&!slotPresent(media)) {
    throw new TypeError('Card media requires content and a positive mediaAspectRatio');
  }
  if (asProp!==undefined&&!['article','section','li','div'].includes(asProp)) throw new TypeError('Unsupported Card semantic container');
  const blocked=disabled||loading;
  const hasMedia=slotPresent(media),hasMetadata=slotPresent(metadata),hasBody=slotPresent(children),hasStatus=slotPresent(status),hasActions=slotPresent(actions);
  const hasDescription=!!description?.trim();
  const shared={...props,id,ref:ref as never,className:cx('seda-card',className),
    'data-variant':variant,'data-density':size,'data-loading':loading||undefined,
    'data-disabled':disabled||undefined,'data-selected':selected||undefined,
    style:{...style,'--seda-card-title-lines':titleLines,'--seda-card-description-lines':descriptionLines} as CSSProperties};
  const announcement=<Text as="span" variant="caption/default" className="seda-visually-hidden" role="status">{loading?loadingLabel:null}</Text>;
  if (clickable) {
    const content=<><span className="seda-card__content" aria-busy={loading||undefined}>
      <Text id={titleId} variant="label/default" title={typeof title==='string'?title:undefined} className="seda-card__title">{title}</Text>
      {hasDescription && <Text variant="body/small" className="seda-card__description">{description}</Text>}
      {hasMetadata && <Text variant="caption/default" className="seda-card__metadata">{metadata}</Text>}
    </span>{announcement}</>;
    if(href!==undefined)return <a {...shared} href={blocked?undefined:href} role="link" tabIndex={blocked?0:props.tabIndex}
      aria-disabled={blocked||undefined} onClick={event=>{if(blocked)event.preventDefault();}}>{content}</a>;
    return <button {...shared} type="button" aria-disabled={blocked||undefined}
      onClick={event=>{if(blocked)event.preventDefault();else onClick?.(event);}}>{content}</button>;
  }
  const Element=asProp??'article';
  const TitleElement=({2:'h2',3:'h3',4:'h4',5:'h5',6:'h6'} as const)[headingLevel??3];
  return <Element {...shared} aria-labelledby={props['aria-label']?undefined:titleId}>
    {hasMedia&&<div className="seda-card__media" style={{aspectRatio:mediaAspectRatio}}>{media}</div>}
    <div className="seda-card__content" aria-busy={loading||undefined}>
      <header className="seda-card__header">
        {selectable&&<Checkbox label="" aria-labelledby={titleId} checked={selected!} disabled={disabled}
          readOnly={loading} aria-disabled={loading||undefined} onCheckedChange={next=>{if(!blocked)onSelectedChange?.(next);}}/>}
        <Text as={TitleElement} id={titleId} variant="label/default" title={typeof title==='string'?title:undefined} className="seda-card__title">{title}</Text>
        {hasStatus&&<div className="seda-card__status">{status}</div>}
      </header>
      {hasDescription&&<Text as="p" variant="body/small" className="seda-card__description">{description}</Text>}
      {hasMetadata&&<Text as="div" variant="caption/default" className="seda-card__metadata">{metadata}</Text>}
      {hasBody&&<Text as="div" variant="body/default" className="seda-card__body">{children}</Text>}
      {hasActions&&<footer className="seda-card__actions">{actions}</footer>}
    </div>{announcement}
  </Element>;
});
Card.displayName='Card';
