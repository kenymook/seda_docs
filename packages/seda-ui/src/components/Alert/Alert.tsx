import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef } from "react";
import { Icon, type IconName } from "../Icon";
import { cx } from "../../utils/classNames";
import { hasMessage } from "../../utils/fieldMessage";
import type { AlertProps, AlertVariant } from "./Alert.types";

const defaultIcons: Record<AlertVariant, IconName> = {
  info: "info",
  success: "success",
  warning: "warning",
  error: "error",
  ai: "ai",
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
      size: sizeProp,
      title,
      variant = "info",
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
    const resolvedRole = role ?? defaultRole(variant);
    const resolvedIcon = icon ?? <Icon name={defaultIcons[variant]} />;

    return (
      <div
        {...props}
        className={cx("seda-alert", className)}
        data-size={size}
        data-variant={variant}
        data-show-icon={showIcon ? "true" : "false"}
        data-dismissible={dismissible || onDismiss ? "true" : "false"}
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
          {hasMessage(description) ? <div className="seda-alert__description">{description}</div> : null}
          {hasMessage(children) ? <div className="seda-alert__body">{children}</div> : null}
          {action || hasMessage(actionLabel) ? (
            <div className="seda-alert__actions">
              {action ?? (
                <button className="seda-alert__action" disabled={!onAction} onClick={onAction} type="button">
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

Alert.displayName = "Alert";
