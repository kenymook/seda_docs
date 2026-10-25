import {forwardRef} from 'react';
import type {CSSProperties} from 'react';
import {useSedaConfiguration} from '../../foundation/SedaProvider';
import {cx} from '../../utils/classNames';
import {Avatar, avatarDiameters} from './Avatar';
import type {AvatarGroupProps} from './Avatar.types';

/** Product ordering is retained; overflow must lead to the actual members area. */
export const AvatarGroup = forwardRef<HTMLUListElement, AvatarGroupProps>(function AvatarGroup({
  label,items,maxVisible,overflowLabel,onOverflow,size:sizeProp,className,style,...props
},ref) {
  const configuration = useSedaConfiguration();
  const size = sizeProp ?? configuration.controlSize;
  if (!label?.trim() || !overflowLabel?.trim() || !['s','m','l','xl'].includes(size) ||
      !Number.isSafeInteger(maxVisible) || maxVisible<1 || !Array.isArray(items) ||
      items.some(item=>!item.id?.trim()||typeof item.name!=='string'||!item.name.trim()) || new Set(items.map(item=>item.id)).size!==items.length) {
    throw new TypeError('AvatarGroup requires named unique identities, size and positive maxVisible');
  }
  const hidden = Math.max(0,items.length-maxVisible);
  if (hidden && typeof onOverflow !== 'function') throw new TypeError('AvatarGroup overflow requires a real action');
  return <ul {...props} ref={ref} className={cx('seda-avatar-group',className)} aria-label={label}
    style={{...style,'--seda-avatar-diameter':avatarDiameters[size]+'px'} as CSSProperties}>
    {items.slice(0,maxVisible).map(({id,...identity})=><li key={id}><Avatar {...identity} size={size}/></li>)}
    {hidden>0 && <li><button type="button" className="seda-avatar-group__overflow" data-count-long={hidden>=10||undefined} aria-label={overflowLabel+', ещё '+hidden} onClick={onOverflow}>
      <span aria-hidden="true">{hidden<100?'+'+hidden:'99+'}</span>
      <span className="seda-avatar-group__sr">{hidden} скрытых участников</span>
    </button></li>}
  </ul>;
});
AvatarGroup.displayName = 'AvatarGroup';
