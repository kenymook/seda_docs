import type { HTMLAttributes, ReactNode } from 'react';
import type { SedaSize } from '../../types';

interface SliderBase extends Omit<HTMLAttributes<HTMLDivElement>, 'children'|'onChange'|'defaultValue'|'onInput'|'role'> {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  size?: SedaSize;
  disabled?: boolean;
  helperText?: ReactNode;
  errorText?: ReactNode;
  /** Plain, nonempty text used for both visible values and aria-valuetext. */
  formatValue?: (value: number) => string;
  /** Range mode contributes two values in lower/upper order under the same name. */
  name?: string;
  form?: string;
}
export type SliderProps = SliderBase & (
  | {mode?: 'single';value: number;onValueChange: (value: number) => void;thumbLabels?: never}
  | {mode: 'range';value: readonly [number,number];onValueChange: (value: [number,number]) => void;thumbLabels: readonly [string,string]}
);
