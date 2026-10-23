import { forwardRef, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { SedaProvider, useSedaSize } from "../../foundation/SedaProvider";
import { useBrowserLayoutEffect } from "../../utils/useBrowserLayoutEffect";
import { cx } from "../../utils/classNames";
import type { TreeNode, TreeProps } from "./Tree.types";
import { indexTree, visibleTree, treeIds, treeRange, treeSearch } from "./treeModel";

export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree({
  label, items, size: sizeProp, selectionMode = "single", selectedIds, defaultSelectedIds,
  onSelectionChange, expandedIds, defaultExpandedIds, onExpandedChange, onActivate,
  disabled = false, emptyText = "Нет элементов", id, className, ...props
}, ref) {
  const size = useSedaSize(sizeProp), generated = useId(), rootId = id ?? generated;
  const root = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => root.current!);
  const rows = useRef(new Map<string, HTMLDivElement>());
  const ownedFocus = useRef(false), lineage = useRef<string[]>([]);
  const anchor = useRef<string | undefined>(undefined), search = useRef({ value: "", time: 0 });
  const [localSelected, setLocalSelected] = useState<readonly string[]>(defaultSelectedIds ?? []);
  const [localExpanded, setLocalExpanded] = useState<readonly string[]>(defaultExpandedIds ?? []);
  const [focused, setFocused] = useState<string>();
  const index = useMemo(() => indexTree(items), [items]);
  const selected = treeIds(index, selectedIds ?? localSelected, "selection").slice(0, selectionMode === "single" ? 1 : undefined);
  const expanded = treeIds(index, expandedIds ?? localExpanded, "expansion"), open = new Set(expanded);
  const visible = visibleTree(index, open), enabled = disabled ? [] : visible.filter(key => !index.get(key)!.disabled);
  const enabledSet = new Set(enabled);
  function nearest(key: string | undefined): string | undefined {
    while (key) { if (enabledSet.has(key)) return key; key = index.get(key)?.parent; }
    return undefined;
  }
  const roving = nearest(focused) ?? lineage.current.find(key => enabledSet.has(key)) ?? selected.map(nearest).find(Boolean) ?? enabled[0];
  useBrowserLayoutEffect(() => {
    if (selectionMode === "single" && selectedIds === undefined && localSelected.length > 1) setLocalSelected(selected);
    // Repair only our focus. Theme/model updates must not pull focus from an inspector.
    if (ownedFocus.current && root.current && !root.current.contains(document.activeElement)) {
      if (document.activeElement === document.body) (roving ? rows.current.get(roving) : root.current)?.focus();
      else ownedFocus.current = false;
    } else if (ownedFocus.current && focused !== roving) {
      (roving ? rows.current.get(roving) : root.current)?.focus();
    }
  });
  if (typeof label !== "string" || !label.trim() || !["single", "multiple"].includes(selectionMode)) throw new TypeError("Tree requires a label and supported selectionMode");
  if (typeof disabled !== "boolean" || !emptyText.trim()) throw new TypeError("Invalid Tree availability or emptyText");
  if (selectedIds !== undefined && (defaultSelectedIds !== undefined || !onSelectionChange)) throw new TypeError("Controlled Tree selection requires onSelectionChange and excludes defaultSelectedIds");
  if (expandedIds !== undefined && (defaultExpandedIds !== undefined || !onExpandedChange)) throw new TypeError("Controlled Tree expansion requires onExpandedChange and excludes defaultExpandedIds");
  if (selectionMode === "single" && (selectedIds ?? defaultSelectedIds ?? []).length > 1) throw new TypeError("Single Tree accepts at most one selected id");

  function focus(key: string) {
    setFocused(key); rows.current.get(key)?.focus({ preventScroll: true });
    rows.current.get(key)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  function select(next: readonly string[]) {
    const result = treeIds(index, next, "selection");
    if (result.length === selected.length && result.every((key, i) => key === selected[i])) return;
    if (selectedIds === undefined) setLocalSelected(result);
    onSelectionChange?.(result);
  }
  function expand(next: readonly string[]) {
    const result = treeIds(index, next, "expansion");
    if (result.length === expanded.length && result.every((key, i) => key === expanded[i])) return;
    if (expandedIds === undefined) setLocalExpanded(result);
    onExpandedChange?.(result);
  }
  function toggle(key: string) { expand(open.has(key) ? expanded.filter(value => value !== key) : [...expanded, key]); }
  function choose(key: string, range = false, additive = false, toggleSelection = false) {
    if (selectionMode === "single") { select([key]); anchor.current = key; return; }
    if (range) select([...(additive ? selected : []), ...treeRange(enabled, anchor.current ?? key, key)]);
    else {
      anchor.current = key;
      select(toggleSelection ? selected.includes(key) ? selected.filter(value => value !== key) : [...selected, key] : [key]);
    }
  }
  function keydown(event: KeyboardEvent<HTMLDivElement>, key: string) {
    event.stopPropagation();
    if (event.defaultPrevented || disabled || index.get(key)!.disabled) return;
    const entry = index.get(key)!, at = enabled.indexOf(key), modifier = event.ctrlKey || event.metaKey;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    let next: string | undefined, handled = true;
    if (event.key === "ArrowDown") next = enabled[Math.min(at + 1, enabled.length - 1)];
    else if (event.key === "ArrowUp") next = enabled[Math.max(0, at - 1)];
    else if (event.key === "Home") next = enabled[0];
    else if (event.key === "End") next = enabled[enabled.length - 1];
    else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
      if (entry.node.children?.length && !open.has(key)) toggle(key);
      else next = enabled.find(value => index.get(value)!.parent === key);
    } else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
      if (entry.node.children?.length && open.has(key)) toggle(key);
      else next = nearest(entry.parent);
    } else if (event.key === " ") choose(key, event.shiftKey, modifier, selectionMode === "multiple" && !event.shiftKey);
    else if (event.key === "Enter") { if (!event.repeat) { choose(key); onActivate?.(key); } }
    else if (event.key === "*" && !modifier) expand([...expanded, ...enabled.filter(value => index.get(value)!.parent === entry.parent)]);
    else if (event.key.toLowerCase() === "a" && modifier && selectionMode === "multiple") select([...selected, ...enabled]);
    else if (event.key.length === 1 && !modifier && !event.altKey && !event.nativeEvent.isComposing) {
      const now = Date.now(), character = treeSearch(event.key);
      const value = now - search.current.time > 500 ? character : search.current.value + character;
      search.current = { value, time: now };
      const prefix = [...value].every(c => c === character) ? character : value;
      next = [...enabled.slice(at + 1), ...enabled.slice(0, at + 1)].find(value => treeSearch(index.get(value)!.node.label).startsWith(prefix));
    } else handled = false;
    if (handled) event.preventDefault();
    if (next) {
      if (event.shiftKey && selectionMode === "multiple") { anchor.current ??= key; choose(next, true, modifier); }
      focus(next);
    }
  }
  function click(event: MouseEvent, key: string) {
    event.stopPropagation();
    if (event.defaultPrevented || disabled || index.get(key)!.disabled) return;
    focus(key);
    if ((event.target as Element).closest("[data-tree-disclosure]")) toggle(key);
    else choose(key, event.shiftKey, event.ctrlKey || event.metaKey, event.ctrlKey || event.metaKey);
  }
  function render(nodes: readonly TreeNode[]) {
    return nodes.map(node => {
      const entry = index.get(node.id)!, unavailable = disabled || entry.disabled;
      const branch = !!node.children?.length, suffix = encodeURIComponent(node.id), labelId = `${rootId}-label-${suffix}`;
      return <div key={node.id} ref={element => { if (element) rows.current.set(node.id, element); else rows.current.delete(node.id); }}
        id={`${rootId}-${suffix}`} role="treeitem" aria-labelledby={labelId} aria-level={entry.level} aria-posinset={entry.position} aria-setsize={entry.count}
        aria-expanded={branch ? open.has(node.id) : undefined} aria-selected={unavailable ? undefined : selected.includes(node.id)} aria-disabled={unavailable || undefined}
        tabIndex={!unavailable && node.id === roving ? 0 : -1} className="seda-tree__item"
        onFocus={event => { if (event.target !== event.currentTarget) return; ownedFocus.current = true; setFocused(node.id); const path = []; let key: string | undefined = node.id; while (key) { path.push(key); key = index.get(key)?.parent; } lineage.current = path; }}
        onKeyDown={event => keydown(event, node.id)}>
        <div className="seda-tree__row" style={{ paddingInlineStart: `calc(var(--seda-control-padding-inline, var(--seda-preset-field-padding)) + ${entry.level - 1} * (var(--seda-preset-icon-size) + var(--seda-control-gap, var(--seda-preset-gap))))` }}
          onMouseDown={event => { event.preventDefault(); }} onClick={event => click(event, node.id)}
          onDoubleClick={event => { event.stopPropagation(); if (unavailable || (event.target as Element).closest("[data-tree-disclosure]")) return; if (branch) toggle(node.id); else onActivate?.(node.id); }}>
          <span className="seda-tree__disclosure" data-tree-disclosure={branch ? "" : undefined} aria-hidden="true">{branch ? open.has(node.id) ? "⌄" : "›" : null}</span>
          {node.icon != null && <span className="seda-tree__icon" aria-hidden="true">{node.icon}</span>}
          <span className="seda-tree__label" id={labelId}>{node.label}</span>
        </div>
        {branch && open.has(node.id) && <div role="group">{render(node.children!)}</div>}
      </div>;
    });
  }
  return <SedaProvider {...props} ref={root} id={rootId} controlSize={size} className={cx("seda-tree", className)} data-size={size}
    role="tree" aria-label={label} aria-multiselectable={selectionMode === "multiple" || undefined} aria-disabled={disabled || undefined} tabIndex={enabled.length ? -1 : 0}
    onFocusCapture={event => { props.onFocusCapture?.(event); ownedFocus.current = true; }}
    onBlurCapture={event => { props.onBlurCapture?.(event); if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) { ownedFocus.current = false; setFocused(undefined); lineage.current = []; } }}>
    {items.length ? render(items) : <div className="seda-tree__empty" role="presentation">{emptyText}</div>}
  </SedaProvider>;
});
