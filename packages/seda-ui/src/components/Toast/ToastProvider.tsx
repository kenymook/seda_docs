import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { HTMLAttributes, ReactNode, RefObject } from "react";
import { createToastStore } from "./toast-store";
import type { ToastController, ToastRecord } from "./toast-store";
import { Toast } from "./Toast";
import { cx } from "../../utils/classNames";

const ToastContext = createContext<ReturnType<typeof createToastStore> | null>(null);
export function ToastProvider({ children }: { children: ReactNode }) {
  const id = useId();
  const [store] = useState(() => createToastStore(id));
  return <ToastContext.Provider value={store}>{children}</ToastContext.Provider>;
}
function useStore() {
  const store = useContext(ToastContext);
  if (!store) throw new Error("Toast components require a ToastProvider");
  return store;
}
/** Returns null when the bounded queue is full. Dedupe updates preserve FIFO position. */
export function useToast(): ToastController {
  const store = useStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return { notify: store.notify, update: store.update, dismiss: store.dismiss, clear: store.clear,
    visible: snapshot.visible, queued: snapshot.queued };
}
export interface ToastViewportProps extends HTMLAttributes<HTMLElement> {
  /** Logical focus destination if an interactive toast is removed. No arrival autofocus. */
  restoreFocusRef?: RefObject<HTMLElement | null>;
}
/** Place inside the application's SEDA scope; placement belongs to application CSS. */
export function ToastViewport({ className, restoreFocusRef, ...props }: ToastViewportProps) {
  const store = useStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [inactive, setInactive] = useState(false);
  const region = useRef<HTMLElement>(null);
  useEffect(() => {
    const unmount = store.mount();
    const document = region.current!.ownerDocument, view = document.defaultView!;
    const sync = () => setInactive(document.hidden || !document.hasFocus());
    const blur = () => setInactive(true), focus = () => setInactive(document.hidden);
    sync(); document.addEventListener("visibilitychange", sync); view.addEventListener("blur", blur); view.addEventListener("focus", focus);
    return () => { unmount(); document.removeEventListener("visibilitychange", sync); view.removeEventListener("blur", blur); view.removeEventListener("focus", focus); };
  }, [store]);
  return <section {...props} ref={region} tabIndex={props.tabIndex ?? -1} aria-label={props["aria-label"] ?? "Notifications"}
    className={cx("seda-toast-viewport", className)} data-queued={snapshot.queued}>
    {snapshot.visible.map(entry => <ManagedToast key={entry.id} entry={entry} inactive={inactive} restoreFocusRef={restoreFocusRef} region={region} />)}
  </section>;
}
function ManagedToast({ entry, inactive, restoreFocusRef, region }: {
  entry: ToastRecord; inactive: boolean; restoreFocusRef: RefObject<HTMLElement | null> | undefined; region: RefObject<HTMLElement | null>;
}) {
  const store = useStore(), node = useRef<HTMLDivElement>(null), origin = useRef<HTMLElement | null>(null);
  const logicalTarget = useRef<HTMLElement | null>(null);
  const { dedupeKey: _dedupeKey, ...toastProps } = entry.options;
  const [hovered, setHovered] = useState(false), [focused, setFocused] = useState(false);
  const paused = inactive || hovered || focused;
  useLayoutEffect(() => {
    // A sibling useImperativeHandle may clear its ref in the same deletion commit.
    // Retain the last committed DOM target, then verify connectivity on dismissal.
    if (restoreFocusRef?.current) logicalTarget.current = restoreFocusRef.current;
  });
  useLayoutEffect(() => {
    const element = node.current!, document = element.ownerDocument;
    origin.current = document.activeElement instanceof document.defaultView!.HTMLElement ? document.activeElement as HTMLElement : null;
    return () => {
      if (!element.contains(document.activeElement)) return;
      for (const target of [restoreFocusRef?.current, logicalTarget.current, origin.current, region.current]) {
        if (!target?.isConnected || target.hasAttribute("disabled") || target.closest("[inert]")) continue;
        target.focus({ preventScroll: true });
        if (document.activeElement === target) break;
      }
    };
  }, []);
  useEffect(() => {
    const duration = store.getRemaining(entry.id);
    if (duration === null || paused) return;
    const view = node.current!.ownerDocument.defaultView!, start = view.performance.now();
    let active = true;
    const timer = view.setTimeout(() => { if (active) store.expire(entry.id, entry.revision); }, duration);
    return () => { active = false; view.clearTimeout(timer); store.setRemaining(entry.id, entry.revision, Math.max(0, duration - (view.performance.now() - start))); };
  }, [entry.id, entry.revision, paused, store]);
  return <Toast {...toastProps} ref={node} data-toast-id={entry.id} data-lifecycle={entry.duration === null ? "persistent" : paused ? "paused" : "visible"}
    duration={entry.duration} dismissible onDismiss={() => store.dismiss(entry.id)}
    onPointerEnter={event => { if (event.pointerType !== "touch") setHovered(true); }} onPointerLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
    onKeyDown={event => { if (event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); event.stopPropagation(); store.dismiss(entry.id); } }} />;
}
