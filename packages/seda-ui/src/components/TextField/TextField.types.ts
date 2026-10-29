import type { InputHTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export type TextFieldState = "default" | "hover" | "focus" | "error" | "warning" | "success" | "disabled";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label: ReactNode;
  size?: SedaSize;
  state?: TextFieldState;
  filled?: boolean;
  helperText?: ReactNode;
  errorText?: ReactNode;
  warningText?: ReactNode;
  successText?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
}
