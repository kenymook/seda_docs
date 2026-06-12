import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export type IconButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "text" | "destruction";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type"> {
  "aria-label": string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: SedaSize;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  selected?: boolean;
  tooltip?: string;
}
