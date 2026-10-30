import type {HTMLAttributes,ReactNode} from "react";
export type SplitViewResizeReason = "pointer" | "keyboard" | "cancel";
export interface SplitViewProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onResize"> {
  primary: ReactNode;
  secondary: ReactNode;
  primaryLabel: string;
  secondaryLabel: string;
  separatorLabel?: string;
  /** Layout direction; separator's aria-orientation is perpendicular. */
  orientation?: "horizontal" | "vertical";
  /** Requested primary pane extent in CSS px; rendered size obeys bounds. */
  primarySize?: number;
  defaultPrimarySize?: number;
  minSize?: number;
  maxSize?: number;
  secondaryMinSize?: number;
  resizeStep?: number;
  largeResizeStep?: number;
  disabled?: boolean;
  onSizeChange?: (size: number, reason: SplitViewResizeReason) => void;
  /** Committed rendered size, suitable for persistence by the host. */
  onResizeEnd?: (size: number, reason: SplitViewResizeReason) => void;
}
