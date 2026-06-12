import { forwardRef, useId } from "react";
import { cx } from "../../utils/classNames";
import type { FileUploadProps } from "./FileUpload.types";

function formatFileList(files: File[] = []) {
  if (!files.length) return null;
  return files.map((file) => file.name).join(", ");
}

function clampProgress(progress?: number) {
  if (progress === undefined) return undefined;
  return Math.max(0, Math.min(100, progress));
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      actionLabel = "Choose file",
      className,
      disabled,
      errorText,
      files = [],
      helperText,
      icon,
      id,
      label,
      multiple,
      onChange,
      onDragLeave,
      onDragOver,
      onDrop,
      onFilesChange,
      progress,
      required,
      size = "m",
      state = "default",
      variant = "dropzone",
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
    const fileList = formatFileList(files);
    const resolvedState = disabled ? "disabled" : errorText ? "error" : state;
    const resolvedProgress = clampProgress(progress);

    return (
      <label
        className={cx("seda-file-upload", className)}
        data-disabled={disabled ? "true" : undefined}
        data-size={size}
        data-state={resolvedState}
        data-variant={variant}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          onDragOver?.(event);
        }}
        onDragLeave={(event) => {
          if (disabled) return;
          onDragLeave?.(event);
        }}
        onDrop={(event) => {
          if (disabled) return;
          event.preventDefault();
          const droppedFiles = Array.from(event.dataTransfer.files);
          onFilesChange?.(multiple ? droppedFiles : droppedFiles.slice(0, 1));
          onDrop?.(event);
        }}
      >
        <input
          {...props}
          aria-describedby={helperText || errorText || fileList ? messageId : props["aria-describedby"]}
          aria-invalid={resolvedState === "error" || undefined}
          className="seda-file-upload__input"
          disabled={disabled}
          id={inputId}
          multiple={multiple}
          onChange={(event) => {
            onFilesChange?.(Array.from(event.currentTarget.files ?? []));
            onChange?.(event);
          }}
          ref={ref}
          required={required}
          type="file"
        />
        <span aria-hidden="true" className="seda-file-upload__icon">
          {icon ?? "↑"}
        </span>
        <span className="seda-file-upload__content">
          <span className="seda-file-upload__label">
            {label}
            {required ? " *" : null}
          </span>
          <span className="seda-file-upload__action">{actionLabel}</span>
          {errorText || helperText || fileList ? (
            <span className="seda-file-upload__message" data-tone={errorText ? "error" : undefined} id={messageId}>
              {errorText ?? fileList ?? helperText}
            </span>
          ) : null}
          {resolvedProgress !== undefined ? (
            <span
              aria-label={`Upload progress ${resolvedProgress}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={resolvedProgress}
              className="seda-file-upload__progress"
              role="progressbar"
            >
              <span className="seda-file-upload__progress-fill" style={{ width: `${resolvedProgress}%` }} />
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);

FileUpload.displayName = "FileUpload";
