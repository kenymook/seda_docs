import { forwardRef } from "react";
import { cx } from "../../utils/classNames";
import type { IconButtonProps } from "./IconButton.types";

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      disabled,
      icon,
      loading = false,
      onClick,
      selected,
      size = "m",
      tooltip,
      type = "button",
      variant = "secondary",
      ...props
    },
    ref,
  ) => {
    const isBlocked = disabled || loading;

    return (
      <button
        {...props}
        aria-busy={loading ? true : props["aria-busy"]}
        aria-disabled={loading ? true : props["aria-disabled"]}
        aria-pressed={selected}
        className={cx("seda-icon-button", className)}
        data-loading={loading ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        data-size={size}
        data-variant={variant}
        disabled={disabled}
        onClick={(event) => {
          if (isBlocked) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        ref={ref}
        title={tooltip ?? props.title}
        type={type}
      >
        <span aria-hidden="true" className="seda-icon-button__icon">
          {loading ? <span className="seda-icon-button__spinner" /> : icon}
        </span>
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
