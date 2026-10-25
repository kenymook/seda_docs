export type OverlayDismissReason = "escape" | "outside" | "focus-out";
interface OverlayEntry {
  surface: HTMLElement;
  trigger: HTMLElement;
  dismiss: (reason: OverlayDismissReason) => void;
}
const stacks = new WeakMap<Document, { entries: OverlayEntry[]; nextZ: number; destroy: () => void }>();

/** One listener set per document. Only the top overlay owns Escape and focus dismissal. */
export function registerOverlay(entry: OverlayEntry): () => void {
  const document = entry.surface.ownerDocument;
  let stack = stacks.get(document);
  if (!stack) {
    const entries: OverlayEntry[] = [];
    const top = () => entries[entries.length - 1];
    const contains = (item: OverlayEntry, event: Event) => {
      const path = event.composedPath();
      return path.includes(item.surface) || path.includes(item.trigger);
    };
    const keydown = (event: KeyboardEvent) => {
      const current = top();
      if (event.key === "Escape" && !event.defaultPrevented && current) {
        // The native Select picker sits above our surface. Let its own first
        // Escape close the picker before handling a later, separate intent.
        const nativePicker = event.composedPath().some(node => {
          if (!(node instanceof document.defaultView!.HTMLSelectElement)) return false;
          try { return node.matches(":open"); } catch { return false; }
        });
        if (nativePicker) return;
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) current.dismiss("escape");
      }
    };
    const pointerdown = (event: PointerEvent) => {
      const current = top();
      if (current && !contains(current, event)) current.dismiss("outside");
    };
    const focusin = (event: FocusEvent) => {
      const current = top();
      if (current && !contains(current, event)) current.dismiss("focus-out");
    };
    document.addEventListener("keydown", keydown, true);
    document.addEventListener("pointerdown", pointerdown, true);
    document.addEventListener("focusin", focusin, true);
    stack = { entries, nextZ: 1000, destroy: () => {
      document.removeEventListener("keydown", keydown, true);
      document.removeEventListener("pointerdown", pointerdown, true);
      document.removeEventListener("focusin", focusin, true);
    } };
    stacks.set(document, stack);
  }
  stack.entries.push(entry);
  entry.surface.style.setProperty("--seda-overlay-z-index", String(++stack.nextZ));
  const owned = stack;
  return () => {
    const index = owned.entries.indexOf(entry);
    if (index !== -1) owned.entries.splice(index, 1);
    if (!owned.entries.length) {
      owned.destroy();
      stacks.delete(document);
    }
  };
}
