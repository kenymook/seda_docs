import { createContext, forwardRef, useContext, useMemo } from "react";
import type { HTMLAttributes, CSSProperties } from "react";
import type { SedaSize } from "../types";
import { cx } from "../utils/classNames";
export interface SedaConfiguration {
  readonly theme: "light" | "dark";
  readonly controlSize: SedaSize;
  readonly textScale: number;
}
const defaultConfiguration: SedaConfiguration = Object.freeze({
  theme: "light",
  controlSize: "m",
  textScale: 100,
});
const SedaContext = createContext<SedaConfiguration>(defaultConfiguration);
export interface SedaProviderProps extends HTMLAttributes<HTMLDivElement> {
  theme?: SedaConfiguration["theme"];
  controlSize?: SedaSize;
  /** Absolute inherited percentage, 80–200. Affects Text roles, not control geometry or author content. */
  textScale?: number;
}
/** Each scope inherits unspecified settings. Explicit component sizes remain local. */
export const SedaProvider = forwardRef<HTMLDivElement, SedaProviderProps>(
  ({ theme, controlSize, textScale, style, className, children, ...props }, ref) => {
    const parent = useContext(SedaContext);
    const configuration = useMemo(
      () =>
        Object.freeze({
          theme: theme ?? parent.theme,
          controlSize: controlSize ?? parent.controlSize,
          textScale: textScale ?? parent.textScale,
        }),
      [theme, controlSize, textScale, parent.theme, parent.controlSize, parent.textScale],
    );
    if (
      !["light", "dark"].includes(configuration.theme) ||
      !["s", "m", "l", "xl"].includes(configuration.controlSize) ||
      !Number.isFinite(configuration.textScale) || configuration.textScale<80 || configuration.textScale>200
    )
      throw new TypeError("Unsupported SEDA theme, controlSize or textScale");
    return (
      <SedaContext.Provider value={configuration}>
        <div
          {...props}
          ref={ref}
          className={cx("seda-provider", className)}
          data-seda-theme={configuration.theme}
          data-seda-size={configuration.controlSize}
          data-seda-text-scale={configuration.textScale}
          style={{...style,'--seda-text-scale':configuration.textScale/100} as CSSProperties}
        >
          {children}
        </div>
      </SedaContext.Provider>
    );
  },
);
SedaProvider.displayName = "SedaProvider";
export function useSedaConfiguration(): SedaConfiguration {
  return useContext(SedaContext);
}
/** The API inspector recognizes this explicit standalone fallback/context protocol. */
export function useSedaSize(size: SedaSize | undefined): SedaSize {
  const configuration = useContext(SedaContext);
  return size ?? configuration.controlSize;
}
