import type { InputHTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export type TextFieldState = "default" | "hover" | "focus" | "error" | "disabled";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label: ReactNode;
  size?: SedaSize;
  state?: TextFieldState;
  filled?: boolean;
  helperText?: ReactNode;
  errorText?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
}
