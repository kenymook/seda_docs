import { createWebBindings } from "../../../../packages/seda-contracts/src/web.mjs";
/** Web geometry experiment over token branches validated by the shared compiler. */
export function createWorkspaceBindings(
  compiled,
  derived,
  parameters,
) {
  const web=createWebBindings(compiled);
  const vars = {
    "--seda-text-scale":parameters.scale/100,
    ...web.layout.vars,
    ...web.recipes.projectName.vars,
    "--seda-control-height": derived.height + "px",
    "--seda-control-radius": derived.radius + "px",
    "--seda-control-font-size": derived.font + "px",
    "--seda-control-line-height": derived.line + "px",
    "--seda-control-icon-size": derived.icon + "px",
    "--seda-control-padding-block": derived.py + "px",
    "--seda-control-field-padding-inline": derived.fieldPaddingX + "px",
    "--seda-control-button-padding-inline": derived.buttonPaddingX + "px",
    "--seda-control-extra-padding-inline": parameters.airX + "px",
    "--seda-control-extra-padding-block": parameters.air + "px",
    "--seda-control-gap": compiled.geometry.textFieldAffixGap.value + "px",
    "--seda-control-padding-inline": derived.fieldPaddingX + "px",
    "--lab-choice-gap":
      compiled.geometry.textFieldAffixGap.value + parameters.airX + "px",
    "--lab-button-padding": derived.buttonPaddingX + "px",
    "--lab-padding-y": derived.py + "px",
    "--lab-choice-size": Math.max(derived.icon, derived.font) + "px",
    "--lab-choice-radius":
      Math.min(
        derived.radius,
        Math.max(derived.icon, derived.font) / 3,
      ) + "px",
    "--lab-toggle-height":
      Math.max(derived.icon, derived.font) + 4 + "px",
    "--lab-toggle-width":
      Math.max(derived.icon, derived.font) * 2 + 4 + "px",
  };
  const evidence = web.layout.evidence.map(item=>({...item,component:'foundation'}));
  for (const [component, binding] of Object.entries(web.controls)) {
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
        icon: derived.icon,
        font: derived.font,
        value: Math.max(derived.icon, derived.font),
      },
      feedback: {
        source: "compiled.geometry + lab-model.mjs#derive",
        font: derived.font,
        line: derived.line,
        icon: derived.icon,
        radius: derived.radius,
        paddingY: derived.py,
        extraX: parameters.airX,
        extraY: parameters.air,
        layout: "Intrinsic multi-line Alert/Toast; semantic pill Tag/Badge and circular dot retain their shape.",
        instanceContract: false,
      },
    },
    geometry: {
      height: derived.height,
      paddingX: derived.fieldPaddingX,
      paddingY: derived.py,
      iconSize: derived.icon,
      choiceSize: Math.max(derived.icon, derived.font),
    },
    parameters,
    coverage: {
      contract: ["Button", "IconButton", "TextField", "Select", "Checkbox", "Radio", "Toggle", "Tabs", "DropdownMenu", "Tree"],
      libraryAdapter: ["SplitView", "FileUpload", "Badge", "Tag", "Alert", "Toast"],
      composition: ["Navigation", "Table", "Card", "Dialog", "Editor"],
    },
  };
}
