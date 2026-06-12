import { forwardRef, useId } from "react";
import { cx } from "../../utils/classNames";
import type { RadioProps } from "./Radio.types";

export const Radio = forwardRef<HTMLFieldSetElement, RadioProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      errorText,
      helperText,
      label,
      name,
      onValueChange,
      options,
      required,
      size = "m",
      value,
      ...props
    },
    ref,
  ) => {
    const generatedName = useId();
    const groupName = name ?? generatedName;
    const messageId = `${groupName}-message`;

    return (
      <fieldset
        {...props}
        aria-describedby={helperText || errorText ? messageId : props["aria-describedby"]}
        aria-invalid={Boolean(errorText) || undefined}
        className={cx("seda-radio-group", className)}
        disabled={disabled}
        ref={ref}
      >
        <legend className="seda-field__label">
          {label}
          {required ? " *" : null}
        </legend>
        <span className="seda-radio-group__items">
          {options.map((option) => (
            <label className="seda-choice" data-size={size} key={option.value}>
              <input
                className="seda-choice__control"
                defaultChecked={defaultValue === option.value}
                disabled={disabled || option.disabled}
                name={groupName}
                onChange={(event) => {
                  if (event.currentTarget.checked) {
                    onValueChange?.(option.value);
                  }
                }}
                required={required}
                type="radio"
                value={option.value}
                checked={value === undefined ? undefined : value === option.value}
              />
              <span className="seda-choice__content">
                <span className="seda-choice__label">{option.label}</span>
                {option.helperText ? <span className="seda-field__message">{option.helperText}</span> : null}
              </span>
            </label>
          ))}
        </span>
        {errorText || helperText ? (
          <span className="seda-field__message" data-tone={errorText ? "error" : undefined} id={messageId}>
            {errorText ?? helperText}
          </span>
        ) : null}
      </fieldset>
    );
  },
);

Radio.displayName = "Radio";
