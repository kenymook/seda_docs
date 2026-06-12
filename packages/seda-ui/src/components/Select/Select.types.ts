import type { ReactNode, SelectHTMLAttributes } from "react";
import type { SedaSize } from "../../types";

export type SelectSelection = "single" | "multi";
export type SelectState = "default" | "hover" | "focus" | "open" | "filled" | "error" | "disabled";

export interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children" | "defaultValue" | "multiple" | "onChange" | "size" | "value"> {
  label: ReactNode;
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  selection?: SelectSelection;
  size?: SedaSize;
  state?: SelectState;
  placeholder?: string;
  helperText?: ReactNode;
  errorText?: ReactNode;
  onChange?: SelectHTMLAttributes<HTMLSelectElement>["onChange"];
  onValueChange?: (value: string | string[]) => void;
}
