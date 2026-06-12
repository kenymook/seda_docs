import { forwardRef } from "react";
import { cx } from "../../utils/classNames";
import type { TagProps } from "./Tag.types";

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      badgeValue,
      children,
      className,
      disabled = false,
      dismissible = false,
      dismissLabel,
      leadingIcon,
      onDismiss,
      onSelectedChange,
      selected = false,
      size = "m",
      tone = "neutral",
      type = "read-only",
      ...props
    },
    ref,
  ) => {
    const isSelectable = type === "selectable";
    const isInteractive = type === "interactive";

    return (
      <span
        {...props}
        aria-disabled={disabled ? true : props["aria-disabled"]}
        aria-pressed={isSelectable ? selected : undefined}
        className={cx("seda-tag", className)}
        data-disabled={disabled ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        data-size={size}
        data-tone={tone}
        data-type={type}
        onClick={(event) => {
          if (!isSelectable || disabled) return;
          event.preventDefault();
          onSelectedChange?.(!selected);
        }}
        onKeyDown={(event) => {
          if (!isSelectable || disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelectedChange?.(!selected);
          }
        }}
        ref={ref}
        role={isSelectable ? "button" : props.role}
        tabIndex={isSelectable && !disabled ? (props.tabIndex ?? 0) : props.tabIndex}
      >
        {leadingIcon ? (
          <span aria-hidden="true" className="seda-tag__icon">
            {leadingIcon}
          </span>
        ) : null}
        <span className="seda-tag__label">{children}</span>
        {badgeValue ? <span className="seda-tag__badge">{badgeValue}</span> : null}
        {dismissible || (isInteractive && onDismiss) ? (
          <button
            aria-label={dismissLabel ?? `Dismiss ${typeof children === "string" ? children : "tag"}`}
            className="seda-tag__dismiss"
            disabled={disabled}
            onClick={onDismiss}
            type="button"
          >
            ×
          </button>
        ) : null}
      </span>
    );
  },
);

Tag.displayName = "Tag";
