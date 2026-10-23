import { useSedaSize } from "../../foundation/SedaProvider";
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import { hasMessage, mergeDescriptionIds } from "../../utils/fieldMessage";
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
      size: sizeProp,
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
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
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <label
        className={cx("seda-choice", className)}
        data-disabled={disabled ? "true" : undefined}
        data-size={size}
      >
        <input
          {...props}
          aria-checked={indeterminate ? "mixed" : checked}
          aria-describedby={mergeDescriptionIds(
            externalDescriptions,
            message != null ? messageId : undefined,
          )}
          aria-invalid={hasError || undefined}
          onClick={(event) => {
            if (props.readOnly) {
              event.preventDefault();
              return;
            }
            props.onClick?.(event);
          }}
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
          {message != null ? (
            <span
              className="seda-field__message"
              data-tone={hasError ? "error" : undefined}
              id={messageId}
            >
              {message}
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
