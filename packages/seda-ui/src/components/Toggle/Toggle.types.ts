import type { InputHTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange"> {
  label: ReactNode;
  size?: SedaSize;
  helperText?: ReactNode;
  statusText?: ReactNode;
  loading?: boolean;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
  onCheckedChange?: (checked: boolean) => void;
}
