import { forwardRef, useId } from "react";
import { hasMessage, mergeDescriptionIds } from "../../utils/fieldMessage";
import { cx } from "../../utils/classNames";
import type { SelectProps } from "./Select.types";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      errorText,
      helperText,
      id,
      label,
      onValueChange,
      options,
      placeholder,
      required,
      selection = "single",
      size = "m",
      state = "default",
      value,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const messageId = `${selectId}-message`;
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
    const multiple = selection === "multi";
    const resolvedState = disabled
      ? "disabled"
      : hasError
        ? "error"
        : value && value.length !== 0
          ? "filled"
          : state === "error" || state === "disabled"
            ? "default"
            : state;

    return (
      <label
        className={cx("seda-field", className)}
        data-disabled={disabled ? "true" : undefined}
        data-state={resolvedState}
      >
        <span className="seda-field__label">
          {label}
          {required ? " *" : null}
        </span>
        <span className="seda-field__control" data-size={size}>
          <select
            {...props}
            aria-describedby={mergeDescriptionIds(
              externalDescriptions,
              message != null ? messageId : undefined,
            )}
            aria-invalid={resolvedState === "error" || undefined}
            className="seda-field__select"
            defaultValue={defaultValue}
            disabled={disabled}
            id={selectId}
            multiple={multiple}
            onChange={(event) => {
              if (multiple) {
                onValueChange?.(
                  Array.from(
                    event.currentTarget.selectedOptions,
                    (option) => option.value,
                  ),
                );
              } else {
                onValueChange?.(event.currentTarget.value);
              }
              props.onChange?.(event);
            }}
            ref={ref}
            required={required}
            value={value}
          >
            {placeholder && !multiple ? (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
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
      </label>
    );
  },
);

Select.displayName = "Select";
