import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef, useId } from "react";
import { hasMessage, mergeDescriptionIds } from "../../utils/fieldMessage";
import { cx } from "../../utils/classNames";
import type { ToggleProps } from "./Toggle.types";

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      checked,
      className,
      disabled,
      helperText,
      id,
      label,
      loading = false,
      onCheckedChange,
      required,
      size: sizeProp,
      statusText,
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const labelId = `${inputId}-label`;
    const messageId = `${inputId}-message`;
    const message = hasMessage(statusText)
      ? statusText
      : hasMessage(helperText)
        ? helperText
        : undefined;
    const externalDescriptions = props["aria-describedby"]
      ?.split(/\s+/)
      .filter((id) => id && (message != null || id !== messageId))
      .join(" ");
    const isBlocked = disabled || loading;

    return (
      <label
        className={cx("seda-toggle", className)}
        data-disabled={disabled ? "true" : undefined}
        data-size={size}
      >
        <input
          {...props}
          aria-labelledby={props["aria-labelledby"] ?? (props["aria-label"] ? undefined : labelId)}
          aria-describedby={mergeDescriptionIds(
            externalDescriptions,
            message != null ? messageId : undefined,
          )}
          aria-disabled={loading ? true : props["aria-disabled"]}
          aria-busy={loading || undefined}
          onClick={(event) => {
            if (isBlocked || props.readOnly) {
              event.preventDefault();
              return;
            }
            props.onClick?.(event);
          }}
          checked={checked}
          className="seda-toggle__control"
          disabled={disabled}
          id={inputId}
          onChange={(event) => {
            if (isBlocked) {
              event.preventDefault();
              return;
            }
            onCheckedChange?.(event.currentTarget.checked);
            props.onChange?.(event);
          }}
          ref={ref}
          required={required}
          role="switch"
          type="checkbox"
        />
        <span className="seda-toggle__content">
          <span className="seda-toggle__label" id={labelId}>
            {label}
            {required ? " *" : null}
          </span>
          {message != null ? (
            <span className="seda-field__message" id={messageId}>
              {message}
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);

Toggle.displayName = "Toggle";
