import {forwardRef, useRef, useState} from 'react';
import type {CSSProperties} from 'react';
import {useSedaConfiguration} from '../../foundation/SedaProvider';
import {useBrowserLayoutEffect} from '../../utils/useBrowserLayoutEffect';
import {cx} from '../../utils/classNames';
import {Icon} from '../Icon';
import type {AvatarProps, AvatarSize} from './Avatar.types';

export const avatarDiameters: Readonly<Record<AvatarSize, number>> = {xxs:16, xs:20, s:24, m:32, l:40, xl:48};
const nonempty = (value:unknown): value is string => typeof value === 'string' && !!value.trim();
function initialsFor(name:string):string {
  const words = name.normalize('NFC').trim().split(/\s+/);
  const first = (word:string|undefined) => word?.match(/[\p{L}\p{N}]\p{M}*/u)?.[0] ?? '';
  return (first(words[0]) + (words.length > 1 ? first(words[words.length-1]) : '')).toUpperCase().match(/[\p{L}\p{N}]\p{M}*/gu)?.slice(0,2).join('') ?? '';
}

/** Identity geometry follows the named diameter, independently from control padding. */
export const Avatar = forwardRef<HTMLElement, AvatarProps>(function Avatar({
  name, src, alt, initials, variant:variantProp, size:sizeProp, shape='circle',
  status, statusLabel, selected, disabled=false, loading=false,
  href, onClick, className, style, ...props
}, ref) {
  const configuration = useSedaConfiguration();
  const size = sizeProp ?? configuration.controlSize;
  const variant = variantProp ?? (src ? 'image' : 'initials');
  if (!nonempty(name) || !Object.prototype.hasOwnProperty.call(avatarDiameters,size) || shape !== 'circle' ||
      !['image','initials','icon','brand','ai'].includes(variant) ||
      selected !== undefined && typeof selected !== 'boolean' || ![disabled,loading].every(value=>typeof value === 'boolean')) {
    throw new TypeError('Avatar requires a name and documented presentation');
  }
  if (src !== undefined && !nonempty(src) || alt !== undefined && typeof alt !== 'string' ||
      initials !== undefined && (typeof initials !== 'string' || !/^(?:[\p{L}\p{N}]\p{M}*){0,2}$/u.test(initials.normalize('NFC')))) {
    throw new TypeError('Avatar src/alt/initials are invalid');
  }
  if (status !== undefined && (!['online','busy','away','offline'].includes(status) || !nonempty(statusLabel))) {
    throw new TypeError('Avatar status requires an explicit statusLabel');
  }
  if (href !== undefined && (!nonempty(href) || onClick) || onClick !== undefined && typeof onClick !== 'function') {
    throw new TypeError('Avatar accepts either navigation href or an action');
  }
  const imageSource = !['initials','icon'].includes(variant) ? src : undefined;
  const activeSource = useRef(imageSource);
  const image = useRef<HTMLImageElement>(null);
  const [imageState, setImageState] = useState<{source:string|undefined; loaded:boolean; failed:boolean}>({source:imageSource,loaded:false,failed:false});
  const ready = !!imageSource && imageState.source === imageSource && imageState.loaded && !loading;
  const failed = !!imageSource && imageState.source === imageSource && imageState.failed;
  useBrowserLayoutEffect(()=>{
    // Only a committed source can supersede the mounted image. A suspended
    // render must not invalidate load/error events for the still-visible source.
    activeSource.current = imageSource;
    if (imageSource && image.current?.complete && image.current.naturalWidth > 0) {
      setImageState({source:imageSource,loaded:true,failed:false});
    }
  },[imageSource]);
  const letters = variant === 'icon' || variant === 'ai' && initials === undefined ? '' : (initials ?? initialsFor(name));
  const interactive = href !== undefined || onClick !== undefined;
  const blocked = disabled || loading;
  const label = [interactive ? name : (alt ?? name), status ? statusLabel : '', selected ? 'Выбран' : ''].filter(Boolean).join(', ');
  const content = <>
    <span className="seda-avatar__fallback" aria-hidden="true">{letters || <Icon name={variant === 'ai' ? 'ai' : 'user'}/>}</span>
    {imageSource && !failed && <img key={imageSource} ref={image} src={imageSource} alt="" aria-hidden="true" data-ready={ready || undefined}
      onLoad={()=>{if(activeSource.current===imageSource)setImageState({source:imageSource,loaded:true,failed:false});}}
      onError={()=>{if(activeSource.current===imageSource)setImageState({source:imageSource,loaded:false,failed:true});}}/>}
    {status && <span aria-hidden="true" className="seda-avatar__status" data-status={status}/>}
    {selected && <span aria-hidden="true" className="seda-avatar__selected"><Icon name="success"/></span>}
  </>;
  const shared = {...props, title:props.title ?? (status?name+', '+statusLabel:undefined), className:cx('seda-avatar',className), 'data-size':size, 'data-variant':variant,
    'data-disabled':disabled || undefined, 'data-selected':selected || undefined,
    'data-state':loading?'loading':ready?'image':'fallback',
    'aria-label':label || undefined, style:{...style,'--seda-avatar-diameter':avatarDiameters[size]+'px'} as CSSProperties};
  if (href !== undefined) return <a {...shared} ref={ref as never} href={blocked?undefined:href} role="link"
    aria-disabled={blocked || undefined} tabIndex={blocked?0:props.tabIndex}
    onClick={event=>{if(blocked)event.preventDefault();}}>{content}</a>;
  if (onClick) return <button {...shared} ref={ref as never} type="button" aria-disabled={blocked || undefined}
    aria-pressed={selected} onClick={event=>{if(blocked)event.preventDefault();else onClick(event);}}>{content}</button>;
  return <span {...shared} ref={ref as never} role={label?'img':undefined} aria-hidden={!label || undefined}>{content}</span>;
});
Avatar.displayName = 'Avatar';
