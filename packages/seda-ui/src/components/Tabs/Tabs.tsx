import { forwardRef, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useSedaSize } from "../../foundation/SedaProvider";
import { useBrowserLayoutEffect } from "../../utils/useBrowserLayoutEffect";
import { cx } from "../../utils/classNames";
import type { TabsProps } from "./Tabs.types";

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ label, items, value, defaultValue, onValueChange, activationMode = "automatic", variant = "line", size: sizeProp, id, className, ...props }, ref) => {
    const size = useSedaSize(sizeProp);
    const generatedId = useId();
    const rootId = id ?? generatedId;
    const [localValue, setLocalValue] = useState(defaultValue);
    const [focusValue, setFocusValue] = useState<string>();
    const buttons = useRef(new Map<string, HTMLButtonElement>());
    const list = useRef<HTMLDivElement>(null);
    const focusWithin = useRef(false);
    const enabled = items.filter((item) => !item.disabled).map((item) => item.value);
    const requested = value !== undefined ? value : localValue;
    const selected = requested !== undefined && enabled.includes(requested) ? requested : enabled[0];
    const roving = focusValue !== undefined && enabled.includes(focusValue) ? focusValue : selected;
    const reveal = (button: HTMLElement) => {
      const viewport = list.current;
      if (!viewport) return;
      const box = viewport.getBoundingClientRect(), tab = button.getBoundingClientRect();
      const style = viewport.ownerDocument.defaultView!.getComputedStyle(viewport);
      const left = box.left + viewport.clientLeft + (parseFloat(style.paddingLeft) || 0);
      const right = box.left + viewport.clientLeft + viewport.clientWidth - (parseFloat(style.paddingRight) || 0);
      const delta = tab.width > right - left ? (style.direction === 'rtl' ? tab.right - right : tab.left - left)
        : tab.left < left ? tab.left - left : tab.right > right ? tab.right - right : 0;
      if (Math.abs(delta) > .05) viewport.scrollBy({left: delta, behavior: 'instant'});
    };
    // Only repair focus if it was in this tablist; updates must not steal panel focus.
    useBrowserLayoutEffect(() => {
      if (value === undefined && localValue !== selected) setLocalValue(selected);
      if (focusWithin.current && roving !== undefined && (!list.current?.contains(document.activeElement) || (document.activeElement as HTMLButtonElement)?.disabled)) {
        buttons.current.get(roving)?.focus({preventScroll:true});
      }
      const active = list.current?.ownerDocument.activeElement;
      if (active && list.current?.contains(active)) reveal(active as HTMLElement);
    });
    useBrowserLayoutEffect(() => {
      const viewport = list.current, view = viewport?.ownerDocument.defaultView;
      if (!viewport || !view?.ResizeObserver) return;
      const observer = new view.ResizeObserver(() => {
        const active = viewport.ownerDocument.activeElement;
        if (active && viewport.contains(active)) reveal(active as HTMLElement);
      });
      observer.observe(viewport);
      for (const button of buttons.current.values()) observer.observe(button);
      return () => observer.disconnect();
    }, [items]);
    const ids = new Set(items.map((item) => item.value));
    if (!label.trim() || ids.size !== items.length || items.some((item) => !item.value.trim() || !item.label.trim()))
      throw new TypeError("Tabs require a label and unique non-empty item values/labels");
    if (!["automatic", "manual"].includes(activationMode) || !["line", "pill"].includes(variant))
      throw new TypeError("Unsupported Tabs activationMode or variant");
    if (value !== undefined && defaultValue !== undefined)
      throw new TypeError("Tabs value and defaultValue are mutually exclusive");
    const select = (next: string) => {
      if (!enabled.includes(next) || next === selected) return;
      if (value === undefined) setLocalValue(next);
      onValueChange?.(next);
    };
    const navigate = (event: KeyboardEvent<HTMLButtonElement>, current: string) => {
      const index = enabled.indexOf(current);
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      let next: string | undefined;
      if (event.key === "Home") next = enabled[0];
      else if (event.key === "End") next = enabled[enabled.length - 1];
      else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const step = (event.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1);
        next = enabled[(index + step + enabled.length) % enabled.length];
      }
      if (next !== undefined) {
        event.preventDefault();
        setFocusValue(next);
        buttons.current.get(next)?.focus({preventScroll:true});
        if (activationMode === "automatic") select(next);
      }
    };
    return (
      <div {...props} ref={ref} id={rootId} className={cx("seda-tabs", className)} data-size={size} data-variant={variant}>
        <div ref={list} className="seda-tabs__list" role="tablist" aria-label={label} aria-orientation="horizontal"
          onFocusCapture={() => { focusWithin.current = true; }}
          onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { focusWithin.current = false; setFocusValue(undefined); } }}>
          {items.map((item) => {
            const suffix = encodeURIComponent(item.value);
            return <button key={item.value} ref={(node) => { if (node) buttons.current.set(item.value, node); else buttons.current.delete(item.value); }}
              className="seda-tabs__tab" type="button" role="tab" id={`${rootId}-tab-${suffix}`} aria-controls={`${rootId}-panel-${suffix}`}
              aria-selected={selected === item.value} disabled={item.disabled} tabIndex={roving === item.value ? 0 : -1}
              onFocus={(event) => {setFocusValue(item.value);reveal(event.currentTarget);}} onKeyDown={(event) => navigate(event, item.value)} onClick={() => select(item.value)}>
              {item.icon != null ? <span className="seda-tabs__icon" aria-hidden="true">{item.icon}</span> : null}<span>{item.label}</span>
            </button>;
          })}
        </div>
        {items.map((item) => {
          const suffix = encodeURIComponent(item.value);
          return <div key={item.value} className="seda-tabs__panel" role="tabpanel" id={`${rootId}-panel-${suffix}`} aria-labelledby={`${rootId}-tab-${suffix}`}
            hidden={selected !== item.value} tabIndex={0}>{item.content}</div>;
        })}
      </div>
    );
  },
);
Tabs.displayName = "Tabs";
