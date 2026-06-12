import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export type TagType = "read-only" | "selectable" | "interactive";
export type TagTone = "neutral" | "brand" | "info" | "success" | "warning" | "danger" | "ai";
export type TagSize = Exclude<SedaSize, "xl">;

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "onClick" | "type"> {
  children: ReactNode;
  type?: TagType;
  tone?: TagTone;
  size?: TagSize;
  leadingIcon?: ReactNode;
  badgeValue?: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  dismissible?: boolean;
  dismissLabel?: string;
  onSelectedChange?: (selected: boolean) => void;
  onDismiss?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}
