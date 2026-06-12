import { forwardRef } from "react";
import { cx } from "../../utils/classNames";
import type { ToastIntent, ToastProps } from "./Toast.types";

const defaultIcons: Record<ToastIntent, string> = {
  neutral: "•",
  info: "i",
  success: "✓",
  warning: "!",
  error: "!",
};

function defaultRole(intent: ToastIntent) {
  return intent === "error" ? "alert" : "status";
}

function defaultLive(intent: ToastIntent) {
  return intent === "error" ? "assertive" : "polite";
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      action,
      actionLabel,
      className,
      description,
      dismissible = false,
      dismissLabel,
      duration = 5000,
      icon,
      intent = "neutral",
      onAction,
      onDismiss,
      role,
      showIcon = true,
      size = "m",
      title,
      ...props
    },
    ref,
  ) => {
    const resolvedIcon = icon ?? defaultIcons[intent];

    return (
      <div
        {...props}
        aria-atomic={props["aria-atomic"] ?? true}
        aria-live={props["aria-live"] ?? defaultLive(intent)}
        className={cx("seda-toast", className)}
        data-dismissible={dismissible ? "true" : undefined}
        data-duration={duration === null ? "persistent" : duration}
        data-intent={intent}
        data-size={size}
        ref={ref}
        role={role ?? defaultRole(intent)}
      >
        {showIcon ? (
          <span aria-hidden="true" className="seda-toast__icon">
            {resolvedIcon}
          </span>
        ) : null}
        <div className="seda-toast__content">
          <div className="seda-toast__title">{title}</div>
          {description ? <div className="seda-toast__description">{description}</div> : null}
          {action || actionLabel ? (
            <div className="seda-toast__actions">
              {action ?? (
                <button className="seda-toast__action" onClick={onAction} type="button">
                  {actionLabel}
                </button>
              )}
            </div>
          ) : null}
        </div>
        {dismissible || onDismiss ? (
          <button
            aria-label={dismissLabel ?? "Dismiss notification"}
            className="seda-toast__dismiss"
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

Toast.displayName = "Toast";
