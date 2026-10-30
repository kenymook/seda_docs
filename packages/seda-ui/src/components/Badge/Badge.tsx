import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef } from "react";
import { cx } from "../../utils/classNames";
import { hasMessage } from "../../utils/fieldMessage";
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
      size: sizeProp,
      tone = "neutral",
      variant = "count",
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
    if (variant === "count" && (typeof count === "number" && !Number.isSafeInteger(count)
      || !Number.isSafeInteger(max) || max < 1)) throw new TypeError("Badge count/max require safe integers; max must be positive.");
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
        {hasMessage(value) ? <span className="seda-badge__value">{value}</span> : null}
      </span>
    );
  },
);

Badge.displayName = "Badge";
