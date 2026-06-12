import { forwardRef } from "react";
import { cx } from "../../utils/classNames";
import type { LinkProps } from "./Link.types";

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      children,
      className,
      disabled = false,
      external = false,
      hiddenText,
      iconLeft,
      iconRight,
      onClick,
      rel,
      size = "m",
      strong = false,
      target,
      textStyle = "body",
      variant = "default",
      visited = false,
      ...props
    },
    ref,
  ) => {
    const externalTarget = external ? "_blank" : target;
    const safeRel = externalTarget === "_blank" ? rel ?? "noopener noreferrer" : rel;

    return (
      <a
        {...props}
        aria-disabled={disabled || undefined}
        className={cx("seda-link", className)}
        data-size={size}
        data-strong={strong ? "true" : undefined}
        data-text-style={textStyle}
        data-variant={variant}
        data-visited={visited ? "true" : undefined}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        ref={ref}
        rel={safeRel}
        tabIndex={disabled ? -1 : props.tabIndex}
        target={externalTarget}
      >
        {iconLeft ? <span aria-hidden="true">{iconLeft}</span> : null}
        <span>{children}</span>
        {hiddenText ? <span className="seda-visually-hidden">{hiddenText}</span> : null}
        {iconRight ? <span aria-hidden="true">{iconRight}</span> : null}
      </a>
    );
  },
);

Link.displayName = "Link";
