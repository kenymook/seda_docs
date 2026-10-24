import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef } from "react";
import { Icon, type IconName } from "../Icon";
import { cx } from "../../utils/classNames";
import { hasMessage } from "../../utils/fieldMessage";
import type { ToastIntent, ToastProps } from "./Toast.types";

const defaultIcons: Record<ToastIntent, IconName> = {
  neutral: "info",
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
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
      size: sizeProp,
      title,
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
    const resolvedIcon = icon ?? <Icon name={defaultIcons[intent]} />;

    return (
      <div
        {...props}
        aria-atomic={props["aria-atomic"] ?? true}
        aria-live={props["aria-live"] ?? defaultLive(intent)}
        className={cx("seda-toast", className)}
        data-dismissible={dismissible || onDismiss ? "true" : "false"}
        data-show-icon={showIcon ? "true" : "false"}
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
          {hasMessage(description) ? <div className="seda-toast__description">{description}</div> : null}
          {action || hasMessage(actionLabel) ? (
            <div className="seda-toast__actions">
              {action ?? (
                <button className="seda-toast__action" disabled={!onAction} onClick={onAction} type="button">
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
            disabled={!onDismiss}
            onClick={onDismiss}
            type="button"
          >
            <Icon name="close" />
          </button>
        ) : null}
      </div>
    );
  },
);

Toast.displayName = "Toast";
