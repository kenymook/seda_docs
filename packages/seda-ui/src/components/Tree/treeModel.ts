import type { TreeNode } from "./Tree.types";

export interface IndexedTreeNode {
  node: TreeNode;
  parent: string | undefined;
  level: number;
  position: number;
  count: number;
  disabled: boolean;
}

/** Validates before recursive rendering; bounded depth also rejects cycles. */
export function indexTree(items: readonly TreeNode[]): Map<string, IndexedTreeNode> {
  const index = new Map<string, IndexedTreeNode>();
  function visit(nodes: readonly TreeNode[], parent?: string, level = 1, inheritedDisabled = false) {
    if (level > 128) throw new TypeError("Tree supports at most 128 levels");
    if (!Array.isArray(nodes)) throw new TypeError("Tree items/children must be arrays");
    nodes.forEach((node, i) => {
      if (!node || typeof node.id !== "string" || !node.id.trim() || typeof node.label !== "string" || !node.label.trim() || index.has(node.id))
        throw new TypeError("Tree requires unique nonempty ids and labels");
      if (node.disabled !== undefined && typeof node.disabled !== "boolean") throw new TypeError("Tree disabled must be boolean");
      const disabled = inheritedDisabled || !!node.disabled;
      index.set(node.id, { node, parent, level, position: i + 1, count: nodes.length, disabled });
      if (node.children !== undefined) visit(node.children, node.id, level + 1, disabled);
    });
  }
  visit(items);
  return index;
}

export function visibleTree(index: ReadonlyMap<string, IndexedTreeNode>, expanded: ReadonlySet<string>) {
  const visible: string[] = [], included = new Set<string>();
  for (const [id, entry] of index) {
    if (!entry.parent || (included.has(entry.parent) && expanded.has(entry.parent))) {
      visible.push(id); included.add(id);
    }
  }
  return visible;
}

/** Canonical preorder makes callback ordering independent of click order. */
export function treeIds(index: ReadonlyMap<string, IndexedTreeNode>, ids: readonly string[], kind: "selection" | "expansion") {
  if (!Array.isArray(ids) || ids.some(id => typeof id !== "string")) throw new TypeError("Tree state must contain string ids");
  const requested = new Set(ids);
  return [...index].filter(([id, entry]) => requested.has(id) && !entry.disabled && (kind === "selection" || !!entry.node.children?.length)).map(([id]) => id);
}

export function treeRange(visible: readonly string[], anchor: string, target: string) {
  const a = visible.indexOf(anchor), b = visible.indexOf(target);
  if (a < 0 || b < 0) return [target];
  return visible.slice(Math.min(a, b), Math.max(a, b) + 1);
}

export function treeSearch(label: string) {
  return label.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase();
}
