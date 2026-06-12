import type { HTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export type BadgeVariant = "count" | "dot" | "label" | "icon";
export type BadgeTone = "neutral" | "brand" | "info" | "success" | "warning" | "danger" | "ai" | "disabled";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "onClick"> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: SedaSize;
  count?: number | null;
  max?: number;
  label?: ReactNode;
  icon?: ReactNode;
  hidden?: boolean;
  accessibleLabel?: string;
  decorative?: boolean;
}
