import { Fragment, forwardRef, isValidElement, useId } from "react";
import type { ReactNode } from "react";
import { cx } from "../../utils/classNames";
import type { TextFieldProps } from "./TextField.types";

// Known empty content does not create a validation error. Custom React
// components remain opaque: the owner must provide a meaningful message.
function hasMessage(value: ReactNode): boolean {
  if (value == null || typeof value === "boolean") return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.some(hasMessage);
  if (isValidElement<{ children?: ReactNode }>(value) && (typeof value.type === "string" || value.type === Fragment)) {
    return hasMessage(value.props.children);
  }
  return true;
}

function mergeDescriptionIds(...values: Array<string | undefined>): string | undefined {
  const ids = values.flatMap(value => value?.trim().split(/\s+/).filter(Boolean) ?? []);
  return [...new Set(ids)].join(" ") || undefined;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      disabled,
      errorText,
      filled,
      helperText,
      id,
      label,
      prefix,
      required,
      size = "m",
      state = "default",
      suffix,
      value,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const labelId = `${inputId}-label`;
    const messageId = `${inputId}-message`;
    const hasError = !disabled && hasMessage(errorText);
    const message = hasError ? errorText : hasMessage(helperText) ? helperText : undefined;
    const resolvedState = disabled ? "disabled" : hasError ? "error" : state === "error" || state === "disabled" ? "default" : state;
    const isFilled = filled ?? (value != null && String(value).length > 0);
    const externalDescriptions = props["aria-describedby"]?.split(/\s+/).filter(id => id && (message != null || id !== messageId)).join(" ");

    return (
      <label className={cx("seda-field", "seda-field--text", className)} data-disabled={disabled ? "true" : undefined} data-size={size} data-state={resolvedState} htmlFor={inputId}>
        <span className="seda-field__label" id={labelId}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </span>
        <span className="seda-field__control" data-filled={isFilled ? "true" : undefined} data-size={size}>
          {prefix ? <span className="seda-field__affix">{prefix}</span> : null}
          <input
            {...props}
            aria-describedby={mergeDescriptionIds(externalDescriptions, message != null ? messageId : undefined)}
            aria-invalid={disabled ? undefined : hasError ? true : props["aria-invalid"]}
            aria-labelledby={props["aria-labelledby"] ?? (props["aria-label"] ? undefined : labelId)}
            className="seda-field__input"
            disabled={disabled}
            id={inputId}
            ref={ref}
            required={required}
            value={value}
          />
          {suffix ? <span className="seda-field__affix">{suffix}</span> : null}
        </span>
        {message != null ? (
          <span className="seda-field__message" data-tone={hasError ? "error" : undefined} id={messageId}>
            {message}
          </span>
        ) : null}
      </label>
    );
  },
);

TextField.displayName = "TextField";
