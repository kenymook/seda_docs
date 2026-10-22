import { forwardRef } from "react";
import { cx } from "../../utils/classNames";
import type { ButtonProps } from "./Button.types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      fullWidth = false,
      iconLeft,
      iconRight,
      loading = false,
      onClick,
      size = "m",
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
        className={cx("seda-button", className)}
        data-full-width={fullWidth ? "true" : undefined}
        data-loading={loading ? "true" : undefined}
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
        type={type}
      >
        <span
          aria-hidden="true"
          className="seda-button__icon seda-button__leading"
          data-empty={iconLeft == null ? "true" : undefined}
        >
          <span className="seda-button__icon-content">{iconLeft}</span>
          {loading ? <span className="seda-button__spinner" /> : null}
        </span>
        <span className="seda-button__label">{children}</span>
        {iconRight != null ? (
          <span aria-hidden="true" className="seda-button__icon seda-button__trailing">
            <span className="seda-button__icon-content">{iconRight}</span>
          </span>
        ) : null}
      </button>
    );
  },
);

Button.displayName = "Button";
