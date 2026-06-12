import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "text" | "destruction";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: ButtonVariant;
  size?: SedaSize;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}
