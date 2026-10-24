import { forwardRef, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { SedaProvider, useSedaConfiguration, useSedaSize } from "../../foundation/SedaProvider";
import { useBrowserLayoutEffect } from "../../utils/useBrowserLayoutEffect";
import { registerOverlay } from "../../utils/overlayStack";
import { cx } from "../../utils/classNames";
import { matchesShortcut, menuActions, shortcutAria, validateMenuItems } from "./menuModel";
import type { DropdownMenuProps, MenuAction, MenuOpenReason } from "./DropdownMenu.types";

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ triggerLabel, triggerIcon, iconOnly = false, items, size: sizeProp, variant = "menu", disabled = false,
    open, defaultOpen, onOpenChange, shortcutScope = "menu", side = "bottom", align = "start", id, className, ...props }, ref) => {
    const size = useSedaSize(sizeProp);
    const configuration = useSedaConfiguration();
    const generatedId = useId();
    const rootId = id ?? generatedId;
    const [localOpen, setLocalOpen] = useState(defaultOpen ?? false);
    const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const surface = useRef<HTMLDivElement>(null);
    const scope = useRef<HTMLDivElement>(null);
    validateMenuItems(items, shortcutScope === "provider");
    const actions = menuActions(items);
    const requested = open ?? localOpen;
    const unavailable = disabled || !actions.length;
    const isOpen = requested && !unavailable;
    const intent = useRef<"first" | "last">("first");
    const invoking = useRef(false);
    const requesting = useRef(false);
    const focusedWithin = useRef(false);
    const query = useRef({ text: "", time: 0 });
    const reposition = useRef<(() => void) | null>(null);
    const latest = useRef({ open, requested, onOpenChange, actions, side, align, unavailable });
    useBrowserLayoutEffect(() => { latest.current = { open, requested, onOpenChange, actions, side, align, unavailable }; });

    function change(next: boolean, reason: MenuOpenReason, restore = false) {
      const current = latest.current;
      if (next === current.requested || requesting.current) return;
      requesting.current = true;
      // Focus return happens before product actions, so a subsequently opened dialog retains focus.
      if (restore && trigger.current && !trigger.current.disabled) trigger.current.focus();
      if (current.open === undefined) setLocalOpen(next);
      try { current.onOpenChange?.(next, reason); }
      finally { queueMicrotask(() => { requesting.current = false; }); }
    }
    function perform(item: MenuAction) {
      if (item.disabled || latest.current.unavailable || invoking.current) return;
      invoking.current = true;
      try {
        change(false, "select", true);
        item.onSelect();
      } finally { queueMicrotask(() => { invoking.current = false; }); }
    }
    function itemButtons() {
      return Array.from(surface.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    }
    function focusEdge(edge: "first" | "last") {
      const buttons = itemButtons();
      (edge === "last" ? buttons[buttons.length - 1] : buttons[0])?.focus();
    }

    useBrowserLayoutEffect(() => {
      if (requested && unavailable) change(false, "unavailable");
    }, [requested, unavailable]);
    useBrowserLayoutEffect(() => {
      if (!isOpen || !trigger.current) return;
      const host = trigger.current.ownerDocument.createElement("div");
      host.className = "seda-overlay-portal";
      trigger.current.ownerDocument.body.append(host);
      setPortalHost(host);
      return () => {
        setPortalHost(current => current === host ? null : current);
        host.remove();
      };
    }, [isOpen]);

    useBrowserLayoutEffect(() => {
      const menu = surface.current, anchor = trigger.current, themeScope = scope.current;
      if (!isOpen || !portalHost || !menu || !anchor || !themeScope) return;
      const document = anchor.ownerDocument, view = document.defaultView!;
      const copied = new Set<string>();
      let frame = 0;
      const position = () => {
        if (!anchor.isConnected || !anchor.getClientRects().length) { change(false, "unavailable"); return; }
        const computed = view.getComputedStyle(anchor);
        const next = new Set<string>();
        for (const property of Array.from(computed)) {
          if (/^--(dropdown-menu-|seda-(control-|preset-|font-family$|label-weight$)|status-danger-|focus-)/.test(property)) {
            next.add(property);
            const value = computed.getPropertyValue(property);
            if (themeScope.style.getPropertyValue(property) !== value) themeScope.style.setProperty(property, value);
          }
        }
        for (const property of copied) if (!next.has(property)) themeScope.style.removeProperty(property);
        copied.clear();next.forEach(property => copied.add(property));
        themeScope.dir = computed.direction;
        menu.style.colorScheme = computed.colorScheme;
        const viewport = view.visualViewport;
        const bounds = { left: viewport?.offsetLeft ?? 0, top: viewport?.offsetTop ?? 0,
          width: viewport?.width ?? view.innerWidth, height: viewport?.height ?? view.innerHeight };
        const gutter = 8, gap = 4;
        menu.style.minWidth = Math.max(0, Math.min(192, bounds.width - 2 * gutter)) + "px";
        menu.style.maxWidth = Math.max(0, Math.min(360, bounds.width - 2 * gutter)) + "px";
        menu.style.maxHeight = Math.max(0, bounds.height - 2 * gutter) + "px";
        const a = anchor.getBoundingClientRect(), box = menu.getBoundingClientRect();
        const below = bounds.top + bounds.height - a.bottom - gap - gutter;
        const above = a.top - bounds.top - gap - gutter;
        let placement = latest.current.side;
        if (placement === "bottom" && box.height > below && above > below) placement = "top";
        if (placement === "top" && box.height > above && below > above) placement = "bottom";
        const startRight = computed.direction === "rtl";
        const right = latest.current.align === "start" ? startRight : !startRight;
        const x = right ? a.right - box.width : a.left;
        const y = placement === "top" ? a.top - box.height - gap : a.bottom + gap;
        menu.style.left = Math.max(bounds.left + gutter, Math.min(x, bounds.left + bounds.width - box.width - gutter)) + "px";
        menu.style.top = Math.max(bounds.top + gutter, Math.min(y, bounds.top + bounds.height - box.height - gutter)) + "px";
        menu.dataset.side = placement;
        menu.style.visibility = "visible";
      };
      const schedule = () => { view.cancelAnimationFrame(frame); frame = view.requestAnimationFrame(position); };
      // A native top layer is used when available; the portal also works without the Popover API.
      if (typeof menu.showPopover === "function") {
        menu.setAttribute("popover", "manual");
        try { menu.showPopover(); menu.dataset.topLayer = "true"; }
        catch { menu.removeAttribute("popover"); menu.dataset.topLayer = "false"; }
      } else menu.dataset.topLayer = "false";
      position();
      const unregister = registerOverlay({ surface: menu, trigger: anchor,
        dismiss: reason => change(false, reason, reason === "escape") });
      focusEdge(intent.current);
      query.current = {text:"",time:0};
      const observer = new view.ResizeObserver(schedule);
      observer.observe(anchor);observer.observe(menu);
      const mutation = new view.MutationObserver(schedule);
      for (let element: HTMLElement | null = anchor; element; element = element.parentElement)
        mutation.observe(element, { attributes:true, attributeFilter:["style","class","dir","hidden","data-seda-theme","data-seda-size"] });
      view.addEventListener("resize", schedule);
      document.addEventListener("scroll", schedule, true);
      viewportListeners(view.visualViewport, schedule, true);
      reposition.current = position;
      return () => {
        unregister();observer.disconnect();mutation.disconnect();
        view.cancelAnimationFrame(frame);view.removeEventListener("resize", schedule);
        document.removeEventListener("scroll", schedule, true);
        viewportListeners(view.visualViewport, schedule, false);
        reposition.current = null;
        if (menu.hasAttribute("popover")) {
          if (menu.isConnected && menu.matches(":popover-open")) menu.hidePopover();
          menu.removeAttribute("popover");
        }
        intent.current = "first";
      };
    }, [isOpen, portalHost]);
    useBrowserLayoutEffect(() => {
      if (!isOpen || !portalHost) return;
      reposition.current?.();
      if (focusedWithin.current && surface.current && !surface.current.contains(surface.current.ownerDocument.activeElement)) focusEdge("first");
    });

    useBrowserLayoutEffect(() => {
      if (shortcutScope !== "provider" || unavailable || !trigger.current) return;
      const anchor = trigger.current;
      const provider = anchor.closest('.seda-provider[data-seda-theme]');
      if (!provider) throw new TypeError("Provider shortcut scope requires a SedaProvider ancestor");
      const listener = (event: KeyboardEvent) => {
        if (event.defaultPrevented || !(event.target instanceof anchor.ownerDocument.defaultView!.Element) || event.target.closest('.seda-provider[data-seda-theme]') !== provider) return;
        if ((event.target as Element).closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])')) return;
        const item = latest.current.actions.find(item => !item.disabled && item.shortcut && matchesShortcut(event, item.shortcut));
        if (item) { event.preventDefault(); perform(item); }
      };
      anchor.ownerDocument.addEventListener("keydown", listener);
      return () => anchor.ownerDocument.removeEventListener("keydown", listener);
    }, [shortcutScope, unavailable]);

    function menuKey(event: ReactKeyboardEvent<HTMLDivElement>) {
      if (event.defaultPrevented || event.nativeEvent.isComposing) return;
      if (event.key === "Tab") { trigger.current?.focus(); change(false,"tab"); return; }
      const command = latest.current.actions.find(item => item.shortcut && matchesShortcut(event.nativeEvent, item.shortcut));
      if (command) { event.preventDefault(); perform(command); return; }
      const buttons = itemButtons(), current = buttons.indexOf(event.currentTarget.ownerDocument.activeElement as HTMLButtonElement);
      let next: HTMLButtonElement | undefined;
      if (event.key === "ArrowDown") next = buttons[(current + 1) % buttons.length];
      else if (event.key === "ArrowUp") next = buttons[(current - 1 + buttons.length) % buttons.length];
      else if (event.key === "Home") next = buttons[0];
      else if (event.key === "End") next = buttons[buttons.length - 1];
      else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && event.key !== " ") {
        const time = Date.now(), character = normalize(event.key);
        const text = time - query.current.time > 500 ? character : query.current.text + character;
        query.current = {text,time};
        const search = [...text].every(letter => letter === character) ? character : text;
        for (let offset=1; offset<=buttons.length; offset++) {
          const candidate = buttons[(current + offset) % buttons.length];
          if (candidate && normalize(candidate.dataset.label ?? "").startsWith(search)) { next=candidate;break; }
        }
      }
      if (next) { event.preventDefault();next.focus(); }
    }
    function renderAction(item: MenuAction) {
      const descriptionId = `${rootId}-description-${encodeURIComponent(item.id)}`;
      return <button type="button" role="menuitem" key={item.id} className="seda-dropdown-menu__item" tabIndex={-1}
        data-menu-id={item.id} data-label={item.label} data-danger={item.danger ? "true" : undefined}
        aria-disabled={item.disabled || undefined} aria-describedby={item.description ? descriptionId : undefined}
        aria-keyshortcuts={item.shortcut ? shortcutAria(item.shortcut) : undefined}
        onClick={event => { if (!event.defaultPrevented) { if (item.disabled) event.preventDefault();else perform(item); } }}>
        {item.icon != null || variant === "with-icons" ? <span className="seda-dropdown-menu__icon" aria-hidden="true">{item.icon}</span> : null}
        <span className="seda-dropdown-menu__text"><span>{item.label}</span>{item.description ? <span id={descriptionId} className="seda-dropdown-menu__description">{item.description}</span> : null}</span>
        {item.shortcut ? <kbd className="seda-dropdown-menu__shortcut" aria-hidden="true">{item.shortcut.label}</kbd> : null}
      </button>;
    }

    if (!triggerLabel.trim() || iconOnly && triggerIcon == null) throw new TypeError("Menu trigger needs a text label and an icon for iconOnly");
    if (!["menu","with-icons","with-shortcuts","grouped","danger"].includes(variant) || !["menu","provider"].includes(shortcutScope) || !["top","bottom"].includes(side) || !["start","end"].includes(align)) throw new TypeError("Unsupported menu configuration");
    if (open !== undefined && (defaultOpen !== undefined || !onOpenChange)) throw new TypeError("Controlled menu needs onOpenChange and cannot use defaultOpen");
    const triggerProps = { id:`${rootId}-trigger`, ref:trigger, size, disabled:unavailable,
      "aria-haspopup":"menu" as const, "aria-expanded":isOpen, "aria-controls":`${rootId}-menu`,
      onClick:() => change(!isOpen,"trigger",isOpen),
      onKeyDown:(event:ReactKeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();intent.current=event.key === "ArrowUp" ? "last" : "first";
          if (isOpen) focusEdge(intent.current);else change(true,"trigger");
        }
      } };
    return <div {...props} ref={ref} id={rootId} className={cx("seda-dropdown-menu",className)} data-size={size}>
      {iconOnly ? <IconButton {...triggerProps} variant="ghost" aria-label={triggerLabel} icon={triggerIcon} /> : <Button {...triggerProps} iconLeft={triggerIcon}>{triggerLabel}</Button>}
      {isOpen && portalHost ? createPortal(<SedaProvider ref={scope} theme={configuration.theme} controlSize={size} style={{display:"contents"}}>
        <div ref={surface} id={`${rootId}-menu`} className="seda-dropdown-menu__surface" role="menu" aria-labelledby={`${rootId}-trigger`}
          data-size={size} data-variant={variant} tabIndex={-1} onKeyDown={menuKey}
          onFocusCapture={()=>{focusedWithin.current=true;}}
          onBlurCapture={event=>{if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focusedWithin.current=false;}}>
          {items.map(item=>item.type === "separator" ? <div role="separator" className="seda-dropdown-menu__separator" key={item.id}/> : item.type === "group" ?
            <div role="group" aria-labelledby={`${rootId}-group-${encodeURIComponent(item.id)}`} key={item.id}>
              <div id={`${rootId}-group-${encodeURIComponent(item.id)}`} className="seda-dropdown-menu__group-title">{item.label}</div>{item.items.map(renderAction)}
            </div> : renderAction(item))}
        </div>
      </SedaProvider>,portalHost) : null}
    </div>;
  },
);
DropdownMenu.displayName = "DropdownMenu";
function normalize(text: string) { return text.normalize("NFKD").replace(/\p{M}/gu,"").toLocaleLowerCase(); }
function viewportListeners(viewport: VisualViewport | null, listener: () => void, add: boolean) {
  if (add) { viewport?.addEventListener("resize",listener);viewport?.addEventListener("scroll",listener); }
  else { viewport?.removeEventListener("resize",listener);viewport?.removeEventListener("scroll",listener); }
}
