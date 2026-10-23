import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef, useId } from "react";
import { hasMessage, mergeDescriptionIds } from "../../utils/fieldMessage";
import { cx } from "../../utils/classNames";
import type { TextFieldProps } from "./TextField.types";

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
      size: sizeProp,
      state = "default",
      suffix,
      value,
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
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
