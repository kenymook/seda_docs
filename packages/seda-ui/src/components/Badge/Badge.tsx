import { forwardRef } from "react";
import { cx } from "../../utils/classNames";
import type { BadgeProps } from "./Badge.types";

function formatCount(count: number, max: number) {
  if (count > max) return `${max}+`;
  return String(count);
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      accessibleLabel,
      className,
      count,
      decorative = false,
      hidden = false,
      icon,
      label,
      max = 99,
      size = "m",
      tone = "neutral",
      variant = "count",
      ...props
    },
    ref,
  ) => {
    if (hidden || count === null || count === undefined && variant === "count") return null;
    if (variant === "count" && typeof count === "number" && count <= 0) return null;

    const value =
      variant === "count" && typeof count === "number"
        ? formatCount(count, max)
        : variant === "label"
          ? label
          : variant === "icon"
            ? icon
            : null;

    return (
      <span
        {...props}
        aria-hidden={decorative ? true : props["aria-hidden"]}
        aria-label={!decorative ? accessibleLabel : undefined}
        className={cx("seda-badge", className)}
        data-size={size}
        data-tone={tone}
        data-variant={variant}
        ref={ref}
        role={!decorative && accessibleLabel ? "status" : props.role}
      >
        {value ? <span className="seda-badge__value">{value}</span> : null}
      </span>
    );
  },
);

Badge.displayName = "Badge";
