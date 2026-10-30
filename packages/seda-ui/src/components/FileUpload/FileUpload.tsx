import { useSedaSize } from "../../foundation/SedaProvider";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { Icon } from "../Icon";
import { hasMessage, mergeDescriptionIds } from "../../utils/fieldMessage";
import { cx } from "../../utils/classNames";
import type { FileUploadProps } from "./FileUpload.types";

function formatFileList(files: File[] = []) {
  if (!files.length) return null;
  return files.map((file) => file.name).join(", ");
}

function clampProgress(progress?: number) {
  if (progress === undefined || !Number.isFinite(progress)) return undefined;
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
      size: sizeProp,
      state = "default",
      variant = "dropzone",
      ...props
    },
    ref,
  ) => {
    const size = useSedaSize(sizeProp);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const labelId = `${inputId}-label`;
    const messageId = `${inputId}-message`;
    const [dragging, setDragging] = useState(false);
    const dragDepth = useRef(0);
    const isDisabled = Boolean(disabled || state === "disabled");
    useEffect(() => {
      if (isDisabled) { dragDepth.current = 0; setDragging(false); }
    }, [isDisabled]);
    const hasError = !isDisabled && hasMessage(errorText);
    const fileList = formatFileList(files);
    const message = hasError ? errorText : fileList ?? (hasMessage(helperText) ? helperText : undefined);
    const resolvedState = isDisabled ? "disabled" : hasError ? "error"
      : dragging && state !== "error" && state !== "uploading" ? "drag-over" : state;
    const resolvedProgress = clampProgress(progress);

    return (
      <label
        className={cx("seda-file-upload", className)}
        data-disabled={isDisabled ? "true" : undefined}
        data-size={size}
        data-state={resolvedState}
        data-variant={variant}
        onDragEnter={() => {
          if (isDisabled) return;
          dragDepth.current += 1;
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (isDisabled) return;
          if (Array.from(event.dataTransfer.types).includes("Files")) setDragging(true);
          onDragOver?.(event);
        }}
        onDragLeave={(event) => {
          if (isDisabled) return;
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
          onDragLeave?.(event);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          if (isDisabled) return;
          const droppedFiles = Array.from(event.dataTransfer.files);
          if (droppedFiles.length) onFilesChange?.(multiple ? droppedFiles : droppedFiles.slice(0, 1));
          onDrop?.(event);
        }}
      >
        <input
          {...props}
          aria-labelledby={props["aria-labelledby"] ?? (props["aria-label"] ? undefined : labelId)}
          aria-describedby={mergeDescriptionIds(
            props["aria-describedby"]?.split(/\s+/).filter(id => message != null || id !== messageId).join(" "),
            message != null ? messageId : undefined,
          )}
          aria-busy={resolvedState === "uploading" ? true : props["aria-busy"]}
          aria-invalid={resolvedState === "error" || undefined}
          className="seda-file-upload__input"
          disabled={isDisabled}
          id={inputId}
          multiple={multiple}
          onChange={(event) => {
            if (isDisabled) return;
            onFilesChange?.(Array.from(event.currentTarget.files ?? []));
            onChange?.(event);
          }}
          ref={ref}
          required={required}
          type="file"
        />
        <span aria-hidden="true" className="seda-file-upload__icon">
          {icon ?? <Icon name="upload" />}
        </span>
        <span className="seda-file-upload__content">
          <span className="seda-file-upload__label" id={labelId}>
            {label}
            {required ? <span aria-hidden="true"> *</span> : null}
          </span>
          <span className="seda-file-upload__action">{actionLabel}</span>
          {message != null ? (
            <span className="seda-file-upload__message" data-tone={hasError ? "error" : undefined} id={messageId}>
              {message}
            </span>
          ) : null}
          {resolvedProgress !== undefined || resolvedState === "uploading" ? (
            <span
              aria-label={resolvedProgress === undefined ? "Upload progress" : `Upload progress ${resolvedProgress}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={resolvedProgress}
              className="seda-file-upload__progress"
              role="progressbar"
              data-indeterminate={resolvedProgress === undefined ? "true" : undefined}
            >
              <span className="seda-file-upload__progress-fill" style={{ width: resolvedProgress === undefined ? "30%" : `${resolvedProgress}%` }} />
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);

FileUpload.displayName = "FileUpload";
