import type { HTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export interface TabsItem {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  content: ReactNode;
}

/** Horizontal section navigation. Panels stay mounted to preserve local state. */
export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
  label: string;
  items: readonly TabsItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  activationMode?: "automatic" | "manual";
  variant?: "line" | "pill";
  size?: SedaSize;
}
