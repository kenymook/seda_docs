import { createWebBindings } from "../../../../packages/seda-contracts/src/web.mjs";
/** Explicit Lab adapter for library controls outside the phase-3 contract bundle. */
export function createWorkspaceBindings(
  compiled,
  derived,
  parameters,
  branches,
) {
  const vars = {
    ...createWebBindings(compiled).recipes.projectName.vars,
    "--seda-control-height": derived.height + "px",
    "--seda-control-radius": derived.radius + "px",
    "--seda-control-font-size": derived.font + "px",
    "--seda-control-line-height": derived.line + "px",
    "--seda-control-padding-inline": derived.fieldPaddingX + "px",
    "--lab-choice-gap":
      compiled.geometry.textFieldAffixGap.value + parameters.airX + "px",
    "--lab-button-padding": derived.buttonPaddingX + "px",
    "--lab-padding-y": derived.py + "px",
    "--lab-choice-size": Math.max(derived.preset.icon, derived.font) + "px",
    "--lab-choice-radius":
      Math.min(
        derived.radius,
        Math.max(derived.preset.icon, derived.font) / 3,
      ) + "px",
    "--lab-toggle-height":
      Math.max(derived.preset.icon, derived.font) + 4 + "px",
    "--lab-toggle-width":
      Math.max(derived.preset.icon, derived.font) * 2 + 4 + "px",
  };
  const evidence = [];
  function visit(component, node, path = []) {
    for (const [key, value] of Object.entries(node)) {
      const parts = [...path, key];
      if (value && typeof value === "object" && "cssValue" in value) {
        const property = "--lab-" + component + "-" + parts.join("-");
        vars[property] = value.cssValue;
        evidence.push({
          component,
          property,
          cssValue: value.cssValue,
          chain: value.chain,
          ref: value.ref,
        });
      } else visit(component, value, parts);
    }
  }
  for (const [component, branch] of Object.entries(branches))
    visit(component, branch.children);
  return {
    vars,
    evidence,
    derivations: {
      choiceGap: {
        base: compiled.geometry.textFieldAffixGap,
        parameter: parameters.airX,
        value: compiled.geometry.textFieldAffixGap.value + parameters.airX,
      },
      choiceSize: {
        icon: derived.preset.icon,
        font: derived.font,
        value: Math.max(derived.preset.icon, derived.font),
      },
    },
    geometry: {
      height: derived.height,
      paddingX: derived.fieldPaddingX,
      paddingY: derived.py,
      choiceSize: Math.max(derived.preset.icon, derived.font),
    },
    parameters,
    coverage: {
      contract: ["Button", "IconButton", "TextField"],
      libraryAdapter: ["Select", "Checkbox", "Radio", "Toggle"],
      composition: ["Navigation", "Table", "Card", "Dialog"],
    },
  };
}
