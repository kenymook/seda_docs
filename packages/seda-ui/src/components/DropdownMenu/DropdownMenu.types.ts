import type { HTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export interface MenuShortcut {
  /** KeyboardEvent.key, not a physical key code. */
  key: string;
  modifiers: readonly ("Control" | "Meta" | "Alt" | "Shift")[];
  label: string;
}
export interface MenuAction {
  type?: "action";
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: MenuShortcut;
  onSelect: () => void;
}
export interface MenuGroup {
  type: "group";
  id: string;
  label: string;
  items: readonly MenuAction[];
}
export interface MenuSeparator { type: "separator"; id: string }
export type MenuEntry = MenuAction | MenuGroup | MenuSeparator;
export type MenuOpenReason = "trigger" | "escape" | "outside" | "focus-out" | "tab" | "select" | "unavailable";
export interface DropdownMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> {
  triggerLabel: string;
  triggerIcon?: ReactNode;
  iconOnly?: boolean;
  items: readonly MenuEntry[];
  size?: SedaSize;
  variant?: "menu" | "with-icons" | "with-shortcuts" | "grouped" | "danger";
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason: MenuOpenReason) => void;
  /** Menu-local by default; provider mode also binds commands inside the nearest SedaProvider. */
  shortcutScope?: "menu" | "provider";
  side?: "top" | "bottom";
  align?: "start" | "end";
}
