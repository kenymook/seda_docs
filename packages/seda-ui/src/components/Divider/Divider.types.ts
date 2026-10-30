import type {HTMLAttributes} from 'react';
import type {SedaSize} from '../../types';

/** A non-interactive boundary; the parent provides spacing and vertical height. */
export interface DividerProps extends Omit<HTMLAttributes<HTMLDivElement>,'children'|'onClick'|'role'|'tabIndex'> {
 size?:SedaSize;
 orientation?:'horizontal'|'vertical';
 emphasis?:'default'|'strong'|'inverse';
 semantic?:boolean;
 label?:string;
}
