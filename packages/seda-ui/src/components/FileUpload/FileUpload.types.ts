import type { ChangeEventHandler, DragEventHandler, InputHTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export type FileUploadVariant = "dropzone" | "button" | "inline";
export type FileUploadState = "default" | "hover" | "drag-over" | "uploading" | "success" | "error" | "disabled";

export interface FileUploadProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "children" | "size" | "type" | "value" | "onDragOver" | "onDragLeave" | "onDrop"
  > {
  label: ReactNode;
  variant?: FileUploadVariant;
  size?: SedaSize;
  state?: FileUploadState;
  helperText?: ReactNode;
  errorText?: ReactNode;
  actionLabel?: ReactNode;
  files?: File[];
  progress?: number;
  icon?: ReactNode;
  onFilesChange?: (files: File[]) => void;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onDragOver?: DragEventHandler<HTMLLabelElement>;
  onDragLeave?: DragEventHandler<HTMLLabelElement>;
  onDrop?: DragEventHandler<HTMLLabelElement>;
}
