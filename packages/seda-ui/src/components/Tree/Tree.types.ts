import type { HTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export interface TreeNode {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  children?: readonly TreeNode[];
}

/** Selection, expansion and keyboard focus are independent states. */
export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> {
  label: string;
  items: readonly TreeNode[];
  size?: SedaSize;
  selectionMode?: "single" | "multiple";
  selectedIds?: readonly string[];
  defaultSelectedIds?: readonly string[];
  onSelectionChange?: (ids: readonly string[]) => void;
  expandedIds?: readonly string[];
  defaultExpandedIds?: readonly string[];
  onExpandedChange?: (ids: readonly string[]) => void;
  onActivate?: (id: string) => void;
  disabled?: boolean;
  emptyText?: string;
}
