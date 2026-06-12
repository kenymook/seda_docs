import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export type ToastIntent = "neutral" | "info" | "success" | "warning" | "error";

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  intent?: ToastIntent;
  size?: SedaSize;
  icon?: ReactNode;
  showIcon?: boolean;
  action?: ReactNode;
  actionLabel?: ReactNode;
  onAction?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  dismissible?: boolean;
  dismissLabel?: string;
  onDismiss?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  duration?: number | null;
}
