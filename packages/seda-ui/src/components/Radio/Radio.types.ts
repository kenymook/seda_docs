import type { FieldsetHTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export interface RadioOption {
  value: string;
  label: ReactNode;
  helperText?: ReactNode;
  disabled?: boolean;
}

export interface RadioProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange"> {
  label: ReactNode;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  size?: SedaSize;
  errorText?: ReactNode;
  helperText?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  onValueChange?: (value: string) => void;
}
