import { createContext, forwardRef, useContext, useMemo } from "react";
import type { HTMLAttributes } from "react";
import type { SedaSize } from "../types";
import { cx } from "../utils/classNames";
export interface SedaConfiguration {
  readonly theme: "light" | "dark";
  readonly controlSize: SedaSize;
}
const defaultConfiguration: SedaConfiguration = Object.freeze({
  theme: "light",
  controlSize: "m",
});
const SedaContext = createContext<SedaConfiguration>(defaultConfiguration);
export interface SedaProviderProps extends HTMLAttributes<HTMLDivElement> {
  theme?: SedaConfiguration["theme"];
  controlSize?: SedaSize;
}
/** Each scope inherits unspecified settings. Explicit component sizes remain local. */
export const SedaProvider = forwardRef<HTMLDivElement, SedaProviderProps>(
  ({ theme, controlSize, className, children, ...props }, ref) => {
    const parent = useContext(SedaContext);
    const configuration = useMemo(
      () =>
        Object.freeze({
          theme: theme ?? parent.theme,
          controlSize: controlSize ?? parent.controlSize,
        }),
      [theme, controlSize, parent.theme, parent.controlSize],
    );
    if (
      !["light", "dark"].includes(configuration.theme) ||
      !["s", "m", "l", "xl"].includes(configuration.controlSize)
    )
      throw new TypeError("Unsupported SEDA theme or controlSize");
    return (
      <SedaContext.Provider value={configuration}>
        <div
          {...props}
          ref={ref}
          className={cx("seda-provider", className)}
          data-seda-theme={configuration.theme}
          data-seda-size={configuration.controlSize}
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
