import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef, useId, useRef, useEffect, useLayoutEffect, useImperativeHandle } from "react";
import { hasMessage, mergeDescriptionIds } from "../../utils/fieldMessage";
import { cx } from "../../utils/classNames";
import { Icon } from "../Icon";
import type { SelectProps } from "./Select.types";
const useClientLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      readOnly = false,
      loading = false,
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
    const inner = useRef<HTMLSelectElement>(null);
    const committed = useRef<string[]>([]);
    const ownerValue = useRef<string[] | undefined>(undefined);
    const locked = !!disabled || readOnly || loading;
    useImperativeHandle(ref, () => inner.current!);
    // Capture the DOM's committed selection after props/options and controlled
    // values have been applied. Do not remount or replace the native control.
    useClientLayoutEffect(() => {
      ownerValue.current = value === undefined ? undefined : Array.isArray(value) ? value : [value];
      if (inner.current) committed.current = Array.from(inner.current.selectedOptions, option => option.value);
    });
    useClientLayoutEffect(() => {
      const node = inner.current;
      if (!node || !locked || disabled) return;
      const focused = document.activeElement === node || node.contains(document.activeElement);
      if (!focused) return;
      // The locked CSS dismisses the UA picker. Flush that change before
      // restoring focus if the browser temporarily moved it to the body.
      node.getBoundingClientRect();
      if (document.activeElement === document.body || document.activeElement === node || node.contains(document.activeElement)) node.focus({preventScroll:true});
    }, [locked, disabled]);
    useClientLayoutEffect(() => {
      const node = inner.current, form = node?.form;
      if (!node || !form) return;
      const reset = (event:Event) => queueMicrotask(() => {
        if (!event.defaultPrevented && node.isConnected) {
          if (ownerValue.current !== undefined) {
            for (const option of Array.from(node.options)) option.selected = ownerValue.current.includes(option.value);
            if (!ownerValue.current.length) node.selectedIndex = -1;
          }
          committed.current = Array.from(node.selectedOptions, option => option.value);
        }
      });
      form.addEventListener('reset', reset);
      return () => form.removeEventListener('reset', reset);
    }, [props.form]);
    function restoreSelection(node: HTMLSelectElement) {
      for (const option of Array.from(node.options)) option.selected = committed.current.includes(option.value);
      if (!committed.current.length) node.selectedIndex = -1;
    }
    const hasError = !locked && hasMessage(errorText);
    const validation = locked ? undefined : hasError ? "error" : hasMessage(warningText) ? "warning" : hasMessage(successText) ? "success" : undefined;
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
      : loading ? "loading"
      : readOnly ? "read-only"
      : validation
        ? validation
        : value && value.length !== 0
          ? "filled"
          : state === "error" || state === "warning" || state === "success" || state === "disabled" || state === "loading" || state === "read-only"
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
            aria-readonly={!disabled && readOnly || undefined}
            aria-busy={!disabled && loading || undefined}
            aria-disabled={disabled || loading || undefined}
            className="seda-field__select"
            defaultValue={defaultValue}
            disabled={disabled}
            id={selectId}
            multiple={multiple}
            onChange={(event) => {
              if (locked) { restoreSelection(event.currentTarget); event.stopPropagation(); return; }
              committed.current = Array.from(event.currentTarget.selectedOptions, option => option.value);
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
            onInput={(event) => {
              if (locked) { restoreSelection(event.currentTarget); event.stopPropagation(); return; }
              props.onInput?.(event);
            }}
            onPointerDown={(event) => {
              props.onPointerDown?.(event);
              if (locked && event.button === 0) { event.preventDefault(); if (!disabled) event.currentTarget.focus(); }
            }}
            onClick={(event) => { props.onClick?.(event); if (locked) event.preventDefault(); }}
            onKeyDown={(event) => {
              props.onKeyDown?.(event);
              if (locked && (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown','Enter',' '].includes(event.key) || event.key === 'F4' && !event.altKey && !event.ctrlKey && !event.metaKey || event.key.length === 1 && !(event.ctrlKey || event.metaKey))) event.preventDefault();
              if (locked && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') event.preventDefault();
            }}
            ref={inner}
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
          {(!multiple || loading && !disabled) && <span className="seda-select__arrow" aria-hidden="true">{loading && !disabled ? <span className="seda-select__spinner" /> : <Icon name="arrow-chevron-down" />}</span>}
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
