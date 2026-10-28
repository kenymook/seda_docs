import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef, useId } from "react";
import { hasMessage, mergeDescriptionIds } from "../../utils/fieldMessage";
import { cx } from "../../utils/classNames";
import { Icon } from "../Icon";
import type { SelectProps } from "./Select.types";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      errorText,
      warningText,
      successText,
      helperText,
      id,
      label,
      onValueChange,
      options,
      placeholder,
      required,
      selection = "single",
      size: sizeProp,
      state = "default",
      value,
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const labelId = `${selectId}-label`;
    const messageId = `${selectId}-message`;
    const hasError = !disabled && hasMessage(errorText);
    const validation = disabled ? undefined : hasError ? "error" : hasMessage(warningText) ? "warning" : hasMessage(successText) ? "success" : undefined;
    const message = hasError
      ? errorText
      : validation === "warning" ? warningText
      : validation === "success" ? successText
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
      : validation
        ? validation
        : value && value.length !== 0
          ? "filled"
          : state === "error" || state === "warning" || state === "success" || state === "disabled"
            ? "default"
            : state;

    return (
      <label
        className={cx("seda-field", "seda-field--select", className)}
        data-disabled={disabled ? "true" : undefined}
        data-state={resolvedState}
        data-size={size}
      >
        <span className="seda-field__label" id={labelId}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </span>
        <span className="seda-field__control" data-size={size}>
          <select
            {...props}
            aria-labelledby={props["aria-labelledby"] ?? (props["aria-label"] ? undefined : labelId)}
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
              <option value="" data-seda-placeholder="true" disabled={required}>
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
          {!multiple && <span className="seda-select__arrow" aria-hidden="true"><Icon name="arrow-chevron-down" /></span>}
        </span>
        {message != null ? (
          <span
            className="seda-field__message"
            data-tone={validation}
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
