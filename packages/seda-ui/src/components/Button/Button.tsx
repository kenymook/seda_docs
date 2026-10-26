import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef, useRef, useImperativeHandle } from "react";
import { useBrowserLayoutEffect } from "../../utils/useBrowserLayoutEffect";
import { cx } from "../../utils/classNames";
import { hasSlotContent } from "../../utils/hasSlotContent";
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
      size: sizeProp,
      type = "button",
      variant = "secondary",
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
    const isBlocked = disabled || loading;
    const element = useRef<HTMLButtonElement>(null);
    const measured = useRef<{ width: number; height: number } | null>(null);
    useImperativeHandle(ref, () => element.current!);
    useBrowserLayoutEffect(() => {
      const button = element.current;
      if (!button) return;
      const authored = {
        width: button.style.width,
        height: button.style.height,
        paddingInlineStart: button.style.paddingInlineStart,
        paddingInlineEnd: button.style.paddingInlineEnd,
      };
      if (loading) {
        // Hidden label/icons still occupy their intrinsic box, so this is the
        // actual pre-spinner geometry even after fonts or the container resize.
        const { width, height } = button.getBoundingClientRect();
        measured.current = { width, height };
        button.style.width = `${measured.current.width}px`;
        button.style.height = `${measured.current.height}px`;
        // New profile padding must not impose a border-box minimum wider than
        // the frozen width of a short label (e.g. S -> XL while pending).
        const computed = getComputedStyle(button);
        button.style.paddingInlineStart = computed.paddingInlineStart;
        button.style.paddingInlineEnd = computed.paddingInlineEnd;
      } else if (!loading) {
        const { width, height } = button.getBoundingClientRect();
        measured.current = { width, height };
      }
      return () => {
        // Restore authored dimensions before the next measurement or unmount.
        if (loading) {
          button.style.width = authored.width;
          button.style.height = authored.height;
          button.style.paddingInlineStart = authored.paddingInlineStart;
          button.style.paddingInlineEnd = authored.paddingInlineEnd;
        }
      };
    }, [loading]);

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
        ref={element}
        type={type}
      >
        {hasSlotContent(iconLeft) && (
          <span
            aria-hidden="true"
            className="seda-button__icon seda-button__leading"
          >
            <span className="seda-button__icon-content">{iconLeft}</span>
          </span>
        )}
        <span className="seda-button__label">{children}</span>
        {hasSlotContent(iconRight) ? (
          <span
            aria-hidden="true"
            className="seda-button__icon seda-button__trailing"
          >
            <span className="seda-button__icon-content">{iconRight}</span>
          </span>
        ) : null}
        {loading && (
          <span className="seda-button__loading-center" aria-hidden="true">
            <span className="seda-button__spinner" />
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
