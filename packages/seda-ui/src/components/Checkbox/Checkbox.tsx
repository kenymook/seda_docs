import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { cx } from "../../utils/classNames";
import type { CheckboxProps } from "./Checkbox.types";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      className,
      disabled,
      errorText,
      helperText,
      id,
      indeterminate = false,
      label,
      onCheckedChange,
      required,
      size = "m",
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <label className={cx("seda-choice", className)} data-disabled={disabled ? "true" : undefined} data-size={size}>
        <input
          {...props}
          aria-checked={indeterminate ? "mixed" : checked}
          aria-describedby={helperText || errorText ? messageId : props["aria-describedby"]}
          aria-invalid={Boolean(errorText) || undefined}
          checked={checked}
          className="seda-choice__control"
          disabled={disabled}
          id={inputId}
          onChange={(event) => {
            onCheckedChange?.(event.currentTarget.checked);
            props.onChange?.(event);
          }}
          ref={inputRef}
          required={required}
          type="checkbox"
        />
        <span className="seda-choice__content">
          <span className="seda-choice__label">
            {label}
            {required ? " *" : null}
          </span>
          {errorText || helperText ? (
            <span className="seda-field__message" data-tone={errorText ? "error" : undefined} id={messageId}>
              {errorText ?? helperText}
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
