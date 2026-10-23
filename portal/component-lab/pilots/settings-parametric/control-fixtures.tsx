import React, { useEffect, useState } from "react";
import { Select, Checkbox, Radio, Toggle } from "./contract-controls";
/** Controlled state matrix, only rendered in the existing review mode. */
export function ControlFixtures({
  size,
  style,
}: {
  size: "s" | "m" | "l" | "xl";
  style: React.CSSProperties;
}) {
  const [state, setState] = useState({
    disabled: false,
    error: false,
    loading: false,
    indeterminate: false,
    multi: false,
  });
  const [value, setValue] = useState("a");
  const [many, setMany] = useState<string[]>(["a"]);
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState("a");
  const [count, setCount] = useState(0);
  const options = [
    { value: "a", label: "Альфа" },
    { value: "b", label: "Бета" },
    { value: "c", label: "Гамма", disabled: true },
  ];
  const common = {
    size,
    disabled: state.disabled,
    helperText: "Локальное описание",
    "aria-describedby": "control-external control-external",
    errorText: state.error ? "Проверьте выбор" : undefined,
  };
  useEffect(() => {
    (window as any).sedaControlReview = {
      setState: (next: any) => setState((s) => ({ ...s, ...next })),
      getState: () => ({ state, value, many, checked, radio, count }),
    };
    return () => {
      delete (window as any).sedaControlReview;
    };
  }, [state, value, many, checked, radio, count]);
  return (
    <section
      id="control-fixtures"
      data-workspace
      style={{ ...style, padding: 24, display: "grid", gap: 20 }}
    >
      <p id="control-external">Внешнее описание</p>
      <Select
        {...common}
        className="workspace-select"
        id="control-select"
        label="Контракт Select"
        selection={state.multi ? "multi" : "single"}
        value={state.multi ? many : value}
        options={options}
        onValueChange={(v) => {
          if (Array.isArray(v)) setMany(v);
          else setValue(v);
          setCount((c) => c + 1);
        }}
      />
      <Checkbox
        {...common}
        id="control-checkbox"
        label="Контракт Checkbox"
        checked={checked}
        indeterminate={state.indeterminate}
        onCheckedChange={(v) => {
          setChecked(v);
          setCount((c) => c + 1);
        }}
      />
      <Radio
        {...common}
        id="control-radio"
        name="control-radio"
        className="workspace-radio"
        label="Контракт Radio"
        value={radio}
        options={options}
        onValueChange={(v) => {
          setRadio(v);
          setCount((c) => c + 1);
        }}
      />
      <Toggle
        size={size}
        disabled={state.disabled}
        helperText="Локальное описание"
        aria-describedby="control-external control-external"
        id="control-toggle"
        label="Контракт Toggle"
        checked={checked}
        loading={state.loading}
        onCheckedChange={(v) => {
          setChecked(v);
          setCount((c) => c + 1);
        }}
      />
    </section>
  );
}
