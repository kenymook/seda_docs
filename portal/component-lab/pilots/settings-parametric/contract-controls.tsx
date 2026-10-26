import React, { createContext, forwardRef, useContext } from "react";
import {
  Select as SedaSelect,
  TextArea as SedaTextArea,
  Slider as SedaSlider,
  NumberField as SedaNumberField,
  Checkbox as SedaCheckbox,
  Radio as SedaRadio,
  Toggle as SedaToggle,
  Tabs as SedaTabs,
  DropdownMenu as SedaDropdownMenu,
  SedaProvider,
} from "@seda-ai/ui";
import {
  evaluateRules,
  deriveState,
} from "../../../../packages/seda-contracts/src/rules.mjs";
const Catalog = createContext<any>(null);
export function ControlContractProvider({
  compiled,
  children,
}: {
  compiled: any;
  children: React.ReactNode;
}) {
  return (
    <Catalog.Provider value={compiled.controls}>
      <SedaProvider theme={compiled.domTheme} controlSize={compiled.configuration.controlSize} style={{display:"contents"}}>{children}</SedaProvider>
    </Catalog.Provider>
  );
}
/** Only validates/binds props; rendering and event handling belong to the real SEDA components. */
function checkedAttributes(name: string, props: any, catalog: any) {
  const contract = catalog?.[name];
  if (!contract) throw new Error(`Missing compiled ${name} contract`);
  const violations = evaluateRules(
    { id: name, rules: contract.rules },
    props,
  ).filter((c: any) => c.status === "violated");
  if (violations.length)
    throw new Error(
      `${name}: ${violations.map((c: any) => c.message).join("; ")}`,
    );
  const state = deriveState(name, props);
  return {
    "data-seda-contract": name,
    "data-contract-data": state.data,
    "data-contract-validation": state.validation,
    "data-contract-activity": state.activity,
  };
}
export const Select = forwardRef<
  HTMLSelectElement,
  React.ComponentProps<typeof SedaSelect>
>((props, ref) => (
  <SedaSelect
    {...props}
    {...checkedAttributes("Select", props, useContext(Catalog))}
    ref={ref}
  />
));
export const Checkbox = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof SedaCheckbox>
>((props, ref) => (
  <SedaCheckbox
    {...props}
    {...checkedAttributes("Checkbox", props, useContext(Catalog))}
    ref={ref}
  />
));
export const Radio = forwardRef<
  HTMLFieldSetElement,
  React.ComponentProps<typeof SedaRadio>
>((props, ref) => (
  <SedaRadio
    {...props}
    {...checkedAttributes("Radio", props, useContext(Catalog))}
    ref={ref}
  />
));
export const Toggle = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof SedaToggle>
>((props, ref) => (
  <SedaToggle
    {...props}
    {...checkedAttributes("Toggle", props, useContext(Catalog))}
    ref={ref}
  />
));
export const Tabs = forwardRef<HTMLDivElement, React.ComponentProps<typeof SedaTabs>>((props, ref) => (
  <SedaTabs {...props} {...checkedAttributes("Tabs", props, useContext(Catalog))} ref={ref} />
));
export const DropdownMenu = forwardRef<HTMLDivElement, React.ComponentProps<typeof SedaDropdownMenu>>((props, ref) => (
  <SedaDropdownMenu {...props} {...checkedAttributes("DropdownMenu", props, useContext(Catalog))} ref={ref} />
));

export const Slider = forwardRef<HTMLDivElement, React.ComponentProps<typeof SedaSlider>>((props, ref) => (
  <SedaSlider {...props} {...checkedAttributes("Slider", props, useContext(Catalog))} ref={ref} />
));

export const NumberField=forwardRef<HTMLInputElement,React.ComponentProps<typeof SedaNumberField>>((props,ref)=><SedaNumberField {...props} {...checkedAttributes('NumberField',props,useContext(Catalog))} ref={ref}/>);

export const TextArea=forwardRef<HTMLTextAreaElement,React.ComponentProps<typeof SedaTextArea>>((props,ref)=><SedaTextArea {...props} {...checkedAttributes('TextArea',props,useContext(Catalog))} ref={ref}/>);
