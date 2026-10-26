import type {HTMLAttributes,ReactNode} from 'react';
import type {SedaSize} from '../../types';

/** A compact action group near an editing selection. The host owns placement and actions. */
export interface InlineToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>,'children'> {
  label: string;
  children: ReactNode;
  size?: SedaSize;
}
