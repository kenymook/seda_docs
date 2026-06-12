import { forwardRef } from "react";
import { cx } from "../../utils/classNames";
import type { AlertProps, AlertVariant } from "./Alert.types";

const defaultIcons: Record<AlertVariant, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  error: "!",
  ai: "AI",
};

function defaultRole(variant: AlertVariant) {
  if (variant === "error") return "alert";
  if (variant === "success") return "status";
  return undefined;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      action,
      actionLabel,
      children,
      className,
      description,
      dismissible = false,
      dismissLabel,
      icon,
      onAction,
      onDismiss,
      role,
      showIcon = true,
      size = "m",
      title,
      variant = "info",
      ...props
    },
    ref,
  ) => {
    const resolvedRole = role ?? defaultRole(variant);
    const resolvedIcon = icon ?? defaultIcons[variant];

    return (
      <div
        {...props}
        className={cx("seda-alert", className)}
        data-size={size}
        data-variant={variant}
        ref={ref}
        role={resolvedRole}
      >
        {showIcon ? (
          <span aria-hidden="true" className="seda-alert__icon">
            {resolvedIcon}
          </span>
        ) : null}
        <div className="seda-alert__content">
          <div className="seda-alert__title">{title}</div>
          {description ? <div className="seda-alert__description">{description}</div> : null}
          {children ? <div className="seda-alert__body">{children}</div> : null}
          {action || actionLabel ? (
            <div className="seda-alert__actions">
              {action ?? (
                <button className="seda-alert__action" onClick={onAction} type="button">
                  {actionLabel}
                </button>
              )}
            </div>
          ) : null}
        </div>
        {dismissible || onDismiss ? (
          <button
            aria-label={dismissLabel ?? "Dismiss alert"}
            className="seda-alert__dismiss"
            onClick={onDismiss}
            type="button"
          >
            ×
          </button>
        ) : null}
      </div>
    );
  },
);

Alert.displayName = "Alert";
