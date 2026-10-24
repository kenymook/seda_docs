import { Fragment, isValidElement } from "react";
import type { ReactNode } from "react";
// Known empty content does not create a validation error. Custom React
// components remain opaque: the owner must provide a meaningful message.
export function hasMessage(value: ReactNode): boolean {
  if (value == null || typeof value === "boolean") return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.some(hasMessage);
  if (
    isValidElement<{ children?: ReactNode }>(value) &&
    (typeof value.type === "string" || value.type === Fragment)
  ) {
    return hasMessage(value.props.children);
  }
  return true;
}

export function mergeDescriptionIds(
  ...values: Array<string | undefined>
): string | undefined {
  const ids = values.flatMap(
    (value) => value?.trim().split(/\s+/).filter(Boolean) ?? [],
  );
  return [...new Set(ids)].join(" ") || undefined;
}
