import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef, useId } from "react";
import { hasMessage, mergeDescriptionIds } from "../../utils/fieldMessage";
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
      size: sizeProp,
      value,
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
    const generatedName = useId();
    const groupName = name ?? generatedName;
    const messageId = `${groupName}-message`;
    const hasError = !disabled && hasMessage(errorText);
    const message = hasError
      ? errorText
      : hasMessage(helperText)
        ? helperText
        : undefined;
    const externalDescriptions = props["aria-describedby"]
      ?.split(/\s+/)
      .filter((id) => id && (message != null || id !== messageId))
      .join(" ");

    return (
      <fieldset
        {...props}
        aria-describedby={mergeDescriptionIds(
          externalDescriptions,
          message != null ? messageId : undefined,
        )}
        aria-invalid={hasError || undefined}
        className={cx("seda-radio-group", className)}
        data-size={size}
        disabled={disabled}
        ref={ref}
      >
        <legend className="seda-field__label">
          {label}
          {required ? " *" : null}
        </legend>
        <span className="seda-radio-group__items">
          {options.map((option, index) => (
            <label
              className="seda-choice"
              data-disabled={disabled || option.disabled ? "true" : undefined}
              data-size={size}
              key={option.value}
            >
              <input
                aria-labelledby={`${generatedName}-option-${index}-label`}
                aria-describedby={hasMessage(option.helperText) ? `${generatedName}-option-${index}-message` : undefined}
                className="seda-choice__control"
                defaultChecked={
                  value === undefined
                    ? defaultValue === option.value
                    : undefined
                }
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
                checked={
                  value === undefined ? undefined : value === option.value
                }
              />
              <span className="seda-choice__content">
                <span className="seda-choice__label" id={`${generatedName}-option-${index}-label`}>{option.label}</span>
                {hasMessage(option.helperText) ? (
                  <span className="seda-field__message" id={`${generatedName}-option-${index}-message`}>
                    {option.helperText}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </span>
        {message != null ? (
          <span
            className="seda-field__message"
            data-tone={hasError ? "error" : undefined}
            id={messageId}
          >
            {message}
          </span>
        ) : null}
      </fieldset>
    );
  },
);

Radio.displayName = "Radio";
