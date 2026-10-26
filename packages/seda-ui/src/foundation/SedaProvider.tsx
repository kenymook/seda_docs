import { createContext, forwardRef, useContext, useMemo } from "react";
import type { HTMLAttributes, CSSProperties } from "react";
import type { SedaSize } from "../types";
import { cx } from "../utils/classNames";
import {normalizeControlParameters,controlParameterVariables} from '../../../seda-contracts/src/control-geometry.mjs';
import type {ControlParameters} from '../../../seda-contracts/src/control-geometry.mjs';
export type {ControlParameters};
export interface SedaConfiguration {
  readonly theme: "light" | "dark";
  readonly controlSize: SedaSize;
  readonly textScale: number;
  readonly controlParameters?:Readonly<ControlParameters>;
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
  /** Opt-in geometry over the existing size presets. Fields inherit absolutely; Text roles remain separate. */
  controlParameters?:Partial<ControlParameters>;
}
/** Each scope inherits unspecified settings. Explicit component sizes remain local. */
export const SedaProvider = forwardRef<HTMLDivElement, SedaProviderProps>(
  ({ theme, controlSize, textScale, controlParameters, style, className, children, ...props }, ref) => {
    const parent = useContext(SedaContext);
    const parameters=controlParameters===undefined?parent.controlParameters:normalizeControlParameters(controlParameters,parent.controlParameters);
    const configuration = useMemo(
      () =>
        Object.freeze({
          theme: theme ?? parent.theme,
          controlSize: controlSize ?? parent.controlSize,
          textScale: textScale ?? parent.textScale,
          ...(parameters?{controlParameters:parameters}:{}),
        }),
      [theme, controlSize, textScale, parent.theme, parent.controlSize, parent.textScale,parameters?.scale,parameters?.extraPaddingInline,parameters?.extraPaddingBlock,parameters?.radiusScale,parameters?.preserveMinimumHeight],
    );
    if (
      !["light", "dark"].includes(configuration.theme) ||
      !["s", "m", "l", "xl"].includes(configuration.controlSize) ||
      !Number.isFinite(configuration.textScale) || configuration.textScale<80 || configuration.textScale>200
    )
      throw new TypeError("Unsupported SEDA theme, controlSize or textScale");
    if(parameters&&typeof CSS!=='undefined'&&(!CSS.supports('height','round(nearest, 1px, 1px)')||!CSS.supports('container-type','size')||!CSS.supports('width','1cqi')||!CSS.supports('height','1cqb')))throw new TypeError('SEDA controlParameters require CSS round() and size container units');
    return (
      <SedaContext.Provider value={configuration}>
        <div
          {...props}
          ref={ref}
          className={cx("seda-provider", className)}
          data-seda-theme={configuration.theme}
          data-seda-size={configuration.controlSize}
          data-seda-text-scale={configuration.textScale}
          data-seda-control-parameters={configuration.controlParameters?'':undefined}
          style={{...style,'--seda-text-scale':configuration.textScale/100,...(configuration.controlParameters?controlParameterVariables(configuration.controlParameters):{})} as CSSProperties}
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
