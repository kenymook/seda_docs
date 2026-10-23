import React, { useEffect, useState } from "react";
import { Button, IconButton, TextField } from "@seda-ai/ui";
import { createWebBindings } from "../../../../packages/seda-contracts/src/web.mjs";

/** Real components for conditions outside the main form; mounted only in ?review=1. */
export function ReviewFixtures({ compiled }: { compiled: any }) {
  const [label, setLabel] = useState("Сохранить");
  const [loading, setLoading] = useState(false);
  const [activations, setActivations] = useState(0);
  const [field, setField] = useState({
    disabled: false,
    errorText: undefined as string | undefined,
    helperText: "Локальное пояснение" as string | undefined,
    state: "default" as "default" | "hover" | "focus" | "error" | "disabled",
    description:
      "review-description review-extra-description review-description review-field-message",
  });
  const bindings = createWebBindings(compiled);
  const action = bindings.recipes.save;
  const fieldBinding = bindings.recipes.projectName;
  const icon = (
    <svg width="53" height="29" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10M8 3v10" stroke="currentColor" />
    </svg>
  );

  useEffect(() => {
    (window as any).sedaReview = {
      setLoading,
      setLabel,
      setFieldProps: (next: Partial<typeof field>) =>
        setField((previous) => ({ ...previous, ...next })),
      getState: () => ({ loading, activations, field }),
    };
    return () => {
      delete (window as any).sedaReview;
    };
  }, [loading, activations, field, label]);

  return (
    <section
      id="review-fixtures"
      aria-label="Дополнительные условия проверки компонентов"
      style={{ marginTop: 32, padding: 24, border: "1px solid currentColor" }}
    >
      <h2>Проверка компонентов</h2>
      <p>Эти примеры открываются только в режиме проверки.</p>
      <button id="review-focus-before" type="button">
        Начало проверки фокуса
      </button>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 16,
          paddingBlock: 24,
        }}
      >
        {(["none", "left", "right", "both"] as const).map((slots) => (
          <Button
            key={slots}
            {...action.attributes}
            style={action.vars as React.CSSProperties}
            id={`review-button-${slots}`}
            size={compiled.configuration.controlSize}
            variant="primary"
            type="button"
            loading={loading}
            iconLeft={slots === "left" || slots === "both" ? icon : undefined}
            iconRight={slots === "right" || slots === "both" ? icon : undefined}
            onClick={() => setActivations((value) => value + 1)}
          >
            {label}
          </Button>
        ))}
      </div>
      <p id="review-description">Внешнее описание.</p>
      <p id="review-extra-description">Второе внешнее описание.</p>
      <div
        {...fieldBinding.attributes}
        style={{ ...fieldBinding.vars, maxWidth: 480 } as React.CSSProperties}
      >
        <TextField
          id="review-field"
          size={compiled.configuration.controlSize}
          label="Поле для проверки"
          value="SEDA AI"
          onChange={() => {}}
          disabled={field.disabled}
          errorText={field.errorText}
          helperText={field.helperText}
          state={field.state}
          aria-describedby={field.description}
        />
      </div>
      <IconButton
        id="review-default-icon"
        aria-label="Проверка варианта по умолчанию"
        icon={icon}
      />
    </section>
  );
}
