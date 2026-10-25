import type { CSSProperties, HTMLAttributes } from "react";
import { sedaIconAssets } from "./seda-icon-assets";

export type IconName = keyof typeof sedaIconAssets;
export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  name: IconName;
  /** Omit for decorative icons. Icon-only controls must name the control itself. */
  label?: string;
}

/** Original SEDA glyphs; geometry and foreground inherit from the owning slot. */
export function Icon({ name, label, className, style, ...props }: IconProps) {
  if(typeof name!=='string'||!Object.prototype.hasOwnProperty.call(sedaIconAssets,name))throw new TypeError('Unknown SEDA icon: use an original catalog name');
  const mask = `url("${sedaIconAssets[name]}")`;
  return <span {...props} data-seda-icon={name} className={["seda-icon", className].filter(Boolean).join(" ")}
    role={label ? "img" : undefined} aria-label={label || undefined}
    aria-hidden={label ? undefined : true}
    style={{ ...style, maskImage: mask, WebkitMaskImage: mask } as CSSProperties} />;
}
