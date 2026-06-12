import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { SedaSize } from "../../types";

export type LinkVariant = "default" | "subtle" | "inverse" | "danger";
export type LinkTextStyle = "body-extra-small" | "body-small" | "body" | "body-large";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  textStyle?: LinkTextStyle;
  size?: SedaSize;
  strong?: boolean;
  visited?: boolean;
  external?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  hiddenText?: string;
}
