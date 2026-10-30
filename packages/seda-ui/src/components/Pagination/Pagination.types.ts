import type { HTMLAttributes } from 'react';
import type { SedaSize } from '../../types';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'children'> {
  label: string;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  variant?: 'numbered' | 'prev-next';
  size?: SedaSize;
  disabled?: boolean;
  loading?: boolean;
  /** Keep an already focused control reachable while an async request or boundary disables it. */
  retainFocusOnDisabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number) => string;
}
