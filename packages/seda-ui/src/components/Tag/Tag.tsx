import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef } from "react";
import { Icon } from "../Icon";
import { Badge } from "../Badge";
import { cx } from "../../utils/classNames";
import { hasMessage } from "../../utils/fieldMessage";
import type { TagProps } from "./Tag.types";

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ badgeValue, children, className, disabled = false, dismissible = false,
    dismissLabel, leadingIcon, onDismiss, onSelectedChange, selected = false,
    size: sizeProp, tone = "neutral", type = "read-only", tabIndex, ...props }, ref) => {
    const size = useSedaSize(sizeProp);
    const selectable = type === "selectable";
    const canDismiss = dismissible || type === "interactive" && Boolean(onDismiss);
    const content = <>
      {leadingIcon != null ? <span aria-hidden="true" className="seda-tag__icon">{leadingIcon}</span> : null}
      <span className="seda-tag__label">{children}</span>
      {hasMessage(badgeValue) ? <Badge className="seda-tag__badge" data-seda-view="tag-counter" size={size} variant="label" tone="neutral" label={badgeValue} /> : null}
    </>;
    return <span {...props} className={cx("seda-tag", className)}
      aria-disabled={disabled ? true : props["aria-disabled"]}
      aria-pressed={undefined}
      role={selectable ? canDismiss ? "group" : undefined : props.role}
      tabIndex={selectable ? undefined : tabIndex}
      data-disabled={disabled ? "true" : undefined} data-selected={selectable && selected ? "true" : undefined}
      data-dismissible={canDismiss ? "true" : undefined}
      data-size={size} data-tone={tone} data-type={type} ref={ref}>
      {selectable ? <button type="button" className="seda-tag__main" disabled={disabled}
        aria-pressed={selected} aria-label={props["aria-label"]} aria-labelledby={props["aria-labelledby"]}
        tabIndex={tabIndex} onClick={()=>onSelectedChange?.(!selected)}>{content}</button> : content}
      {canDismiss ? <button type="button" className="seda-tag__dismiss" disabled={disabled || !onDismiss}
        aria-label={dismissLabel ?? `Dismiss ${typeof children === "string" ? children : "tag"}`}
        onClick={onDismiss}><Icon name="close" /></button> : null}
    </span>;
  },
);
Tag.displayName = "Tag";
