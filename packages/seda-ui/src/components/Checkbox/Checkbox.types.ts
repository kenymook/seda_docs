import type { InputHTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange"> {
  label: ReactNode;
  size?: SedaSize;
  helperText?: ReactNode;
  errorText?: ReactNode;
  indeterminate?: boolean;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
  onCheckedChange?: (checked: boolean) => void;
}
