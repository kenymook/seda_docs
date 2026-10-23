import { createWebBindings } from "../../../../packages/seda-contracts/src/web.mjs";
/** Web geometry experiment over token branches validated by the shared compiler. */
export function createWorkspaceBindings(
  compiled,
  derived,
  parameters,
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
  for (const [component, binding] of Object.entries(createWebBindings(compiled).controls)) {
    Object.assign(vars, binding.vars);
    evidence.push(...binding.evidence.map(item => ({ ...item, component: component.toLowerCase() })));
  }
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
      contract: ["Button", "IconButton", "TextField", "Select", "Checkbox", "Radio", "Toggle"],
      libraryAdapter: [],
      composition: ["Navigation", "Table", "Card", "Dialog"],
    },
  };
}
