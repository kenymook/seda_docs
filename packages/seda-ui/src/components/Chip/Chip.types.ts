import type {HTMLAttributes, ReactNode} from 'react';
import type {SedaSize} from '../../types';

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'onClick'> {
  label: string;
  variant?: 'default' | 'filled' | 'selected';
  size?: SedaSize;
  leadingIcon?: ReactNode;
  control?: 'none' | 'remove' | 'expand' | 'select';
  disabled?: boolean;
  removeLabel?: string;
  onRemove?: () => void;
  expanded?: boolean;
  controlsId?: string;
  onOpenChange?: (open: boolean) => void;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}
