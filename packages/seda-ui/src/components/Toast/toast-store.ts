import type { ToastProps } from "./Toast.types";

/** Host owns lifecycle; arbitrary action nodes remain a presentation-only Toast API. */
export type ToastOptions = Pick<ToastProps,
  "title" | "description" | "intent" | "icon" | "showIcon" | "actionLabel" | "onAction" | "dismissLabel"
> & { duration?: number | null; dedupeKey?: string };
export interface ToastRecord {
  readonly id: string;
  readonly revision: number;
  readonly options: Readonly<ToastOptions>;
  readonly duration: number | null;
}
export interface ToastSnapshot {
  readonly visible: readonly ToastRecord[];
  readonly queued: number;
}
export interface ToastController {
  notify(options: ToastOptions): string | null;
  update(id: string, patch: Partial<ToastOptions>): boolean;
  dismiss(id: string): boolean;
  clear(): void;
  readonly visible: readonly ToastRecord[];
  readonly queued: number;
}
const empty: ToastSnapshot = Object.freeze({ visible: Object.freeze([]), queued: 0 });
function resolveDuration(options: ToastOptions) {
  const duration = options.duration === undefined
    ? (options.onAction || options.intent === "warning" || options.intent === "error" ? null : 5000)
    : options.duration;
  if (duration !== null && (!Number.isFinite(duration) || duration < 1000 || duration > 2147483647))
    throw new TypeError("Toast duration must be null or 1000–2147483647 milliseconds");
  if (options.dedupeKey !== undefined && !options.dedupeKey.trim())
    throw new TypeError("Toast dedupeKey must not be empty");
  return duration;
}

/** Per-provider memory only; no global singleton, DOM, timer or network side effects. */
export function createToastStore(prefix: string) {
  let entries: ToastRecord[] = [], sequence = 0, snapshot = empty, mounted = false;
  const listeners = new Set<() => void>();
  const remaining = new Map<string, number | null>();
  function publish() {
    snapshot = Object.freeze({ visible: Object.freeze(entries.slice(0, 3)), queued: Math.max(0, entries.length - 3) });
    listeners.forEach(listener => listener());
  }
  function update(id: string, patch: Partial<ToastOptions>) {
    const index = entries.findIndex(entry => entry.id === id);
    if (index < 0) return false;
    const old = entries[index]!, options = Object.freeze({ ...old.options, ...patch }), duration = resolveDuration(options);
    if (options.dedupeKey && entries.some(entry => entry.id !== id && entry.options.dedupeKey === options.dedupeKey))
      throw new TypeError("Toast dedupeKey already belongs to another notification");
    entries[index] = Object.freeze({ id, revision: old.revision + 1, options, duration });
    remaining.set(id, duration); publish(); return true;
  }
  function dismiss(id: string) {
    if (!entries.some(entry => entry.id === id)) return false;
    entries = entries.filter(entry => entry.id !== id); remaining.delete(id); publish(); return true;
  }
  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => empty,
    notify(options: ToastOptions): string | null {
      const duration = resolveDuration(options);
      const duplicate = options.dedupeKey && entries.find(entry => entry.options.dedupeKey === options.dedupeKey);
      if (duplicate) { update(duplicate.id, options); return duplicate.id; }
      // Bounded FIFO: keep existing notifications, reject the newest beyond capacity.
      if (entries.length >= 53) return null;
      const id = `${prefix}-toast-${++sequence}`;
      entries.push(Object.freeze({ id, revision: 0, options: Object.freeze({ ...options }), duration }));
      remaining.set(id, duration); publish(); return id;
    },
    update,
    dismiss,
    expire(id: string, revision: number) {
      return entries.some(entry => entry.id === id && entry.revision === revision) ? dismiss(id) : false;
    },
    clear() { entries = []; remaining.clear(); publish(); },
    getRemaining(id: string) { return remaining.get(id) ?? null; },
    setRemaining(id: string, revision: number, value: number) {
      if (entries.some(entry => entry.id === id && entry.revision === revision)) remaining.set(id, value);
    },
    mount() {
      if (mounted) throw new Error("Render exactly one ToastViewport per ToastProvider");
      mounted = true; return () => { mounted = false; };
    },
  };
}
