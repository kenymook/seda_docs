import type { ReactNode, SelectHTMLAttributes } from "react";
import type { SedaSize } from "../../types";

export type SelectSelection = "single" | "multi";
export type SelectState = "default" | "hover" | "focus" | "open" | "filled" | "error" | "warning" | "success" | "read-only" | "loading" | "disabled";

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
  /** Focusable and submitted with its form, but cannot be changed by the user. */
  readOnly?: boolean;
  /** Retains the value and geometry while options are being loaded by the owner. */
  loading?: boolean;
  placeholder?: string;
  helperText?: ReactNode;
  errorText?: ReactNode;
  /** Non-blocking validation message. errorText has precedence. */
  warningText?: ReactNode;
  /** Confirmation message. errorText and warningText have precedence. */
  successText?: ReactNode;
  onChange?: SelectHTMLAttributes<HTMLSelectElement>["onChange"];
  onValueChange?: (value: string | string[]) => void;
}
