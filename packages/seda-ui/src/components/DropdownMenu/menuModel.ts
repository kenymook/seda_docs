import type { MenuAction, MenuEntry, MenuShortcut } from "./DropdownMenu.types";

export function menuActions(items: readonly MenuEntry[]): MenuAction[] {
  return items.flatMap(item => item.type === "separator" ? [] : item.type === "group" ? [...item.items] : [item]);
}
export function validateMenuItems(items: readonly MenuEntry[], providerShortcuts: boolean): void {
  if (!Array.isArray(items)) throw new TypeError("Menu items must be an array");
  const ids = new Set<string>();
  const bindings = new Set<string>();
  const id = (value: string) => {
    if (typeof value !== "string" || !value.trim() || ids.has(value)) throw new TypeError("Menu entries need unique nonempty IDs");
    ids.add(value);
  };
  const action = (item: MenuAction) => {
    if (!item || typeof item !== "object") throw new TypeError("Invalid menu action");
    id(item.id);
    if (item.type !== undefined && item.type !== "action" || typeof item.label !== "string" || !item.label.trim() || typeof item.onSelect !== "function") throw new TypeError("Menu actions need a text label and onSelect");
    if (item.shortcut) {
      const shortcut = item.shortcut;
      if (typeof shortcut.key !== "string" || !shortcut.key.trim() || typeof shortcut.label !== "string" || !shortcut.label.trim() || !Array.isArray(shortcut.modifiers) || shortcut.modifiers.some(value => !["Control","Meta","Alt","Shift"].includes(value)) || new Set(shortcut.modifiers).size !== shortcut.modifiers.length) throw new TypeError("Invalid menu shortcut");
      if (providerShortcuts && !shortcut.modifiers.some(value => ["Control","Meta","Alt"].includes(value))) throw new TypeError("Provider shortcuts need a command modifier");
      const signature = [...shortcut.modifiers].sort().join("+") + ":" + shortcut.key.toLocaleLowerCase();
      if (bindings.has(signature)) throw new TypeError("Menu shortcuts must be unique");
      bindings.add(signature);
    }
  };
  for (const item of items) {
    if (!item || typeof item !== "object") throw new TypeError("Invalid menu entry");
    if (item.type === "group") {
      id(item.id);
      if (typeof item.label !== "string" || !item.label.trim() || !Array.isArray(item.items)) throw new TypeError("Menu groups need a text label and items");
      item.items.forEach(action);
    } else if (item.type === "separator") id(item.id);
    else action(item);
  }
}
export function matchesShortcut(event: KeyboardEvent, shortcut: MenuShortcut): boolean {
  if (event.repeat || event.isComposing || event.getModifierState("AltGraph") || event.key.toLocaleLowerCase() !== shortcut.key.toLocaleLowerCase()) return false;
  return (["Control","Meta","Alt","Shift"] as const).every(modifier => event.getModifierState(modifier) === shortcut.modifiers.includes(modifier));
}
export function shortcutAria(shortcut: MenuShortcut): string {
  return [...shortcut.modifiers, shortcut.key === " " ? "Space" : shortcut.key].join("+");
}
