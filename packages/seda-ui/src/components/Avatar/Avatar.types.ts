import type {HTMLAttributes, MouseEventHandler} from 'react';

export type AvatarSize = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl';
export interface AvatarIdentity {
  name: string;
  src?: string;
  /** Empty alt avoids duplicating an adjacent visible name; status remains named. */
  alt?: string;
  /** Empty initials explicitly chooses the original SEDA user/AI glyph fallback. */
  initials?: string;
  variant?: 'image' | 'initials' | 'icon' | 'brand' | 'ai';
  size?: AvatarSize;
  shape?: 'circle';
  status?: 'online' | 'busy' | 'away' | 'offline';
  statusLabel?: string;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
}
type AvatarBase = AvatarIdentity & Omit<HTMLAttributes<HTMLElement>, 'children' | 'onClick' | 'role' | 'aria-label' | 'aria-hidden'>;
export type AvatarProps = AvatarBase & (
  {href: string; onClick?: never} |
  {href?: never; onClick?: MouseEventHandler<HTMLButtonElement>}
);
export interface AvatarGroupItem extends Omit<AvatarIdentity, 'size' | 'shape' | 'selected'> {id: string}
export interface AvatarGroupProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  label: string;
  items: readonly AvatarGroupItem[];
  size?: 's' | 'm' | 'l' | 'xl';
  maxVisible: number;
  overflowLabel: string;
  onOverflow?: () => void;
}
