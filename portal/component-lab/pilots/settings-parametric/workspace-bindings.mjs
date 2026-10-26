import { createWebBindings } from "../../../../packages/seda-contracts/src/web.mjs";
import {normalizeControlParameters} from '../../../../packages/seda-contracts/src/control-geometry.mjs';
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

  };
  const evidence = web.layout.evidence.map(item=>({...item,component:'foundation'}));
  // Pass resolved base inputs through the public size slots. Public CSS owns all
  // derived geometry, while compiler/token edits still reach the real controls.
  for (const [role, suffix] of Object.entries({height:'height',radius:'radius',fontSize:'font-size',lineHeight:'line-height',iconSize:'icon-size',borderWidth:'border-width',textFieldPaddingInline:'text-field-padding-inline',textFieldAffixGap:'text-field-affix-gap',buttonContentGap:'button-content-gap',buttonPaddingInline:'button-padding-inline'})) {
    const value=compiled.geometry[role], property='--seda-size-'+compiled.configuration.controlSize+'-'+suffix;
    vars[property]=value.cssValue;
    evidence.push({...value,property,cssValue:value.cssValue,component:'foundation',adapter:'compiled-preset-input'});
  }
  for (const [component, binding] of Object.entries(web.controls)) {
    Object.assign(vars, binding.vars);
    evidence.push(...binding.evidence.map(item => ({ ...item, component: component.toLowerCase() })));
  }
  const controlParameters=normalizeControlParameters({scale:parameters.scale,extraPaddingInline:parameters.airX??0,extraPaddingBlock:parameters.air,radiusScale:parameters.radius/100,preserveMinimumHeight:parameters.strict});
  return {
    // Geometry belongs to the public Provider; this adapter retains colors, typography evidence and host layout.
    vars:Object.fromEntries(Object.entries(vars).filter(([name])=>!name.startsWith('--seda-control-')&&!name.startsWith('--lab-'))),
    controlParameters,
    evidence,
    derivations: {
      slider:{source:'compiled.controls.Slider.geometry + shared slider.mjs',minRailHeight:compiled.controls.Slider.geometry.minRailHeight,railHeight:Math.max(compiled.controls.Slider.geometry.minRailHeight.value,derived.height),thumbSize:Math.max(compiled.controls.Slider.geometry.minThumbSize.value,derived.icon),trackHeight:compiled.controls.Slider.geometry.trackHeight,instanceContract:true,runtimeConformance:'requires-browser-evidence'},
      choiceGap: {
        base: compiled.geometry.buttonContentGap,
        parameter: parameters.airX,
        value: compiled.geometry.buttonContentGap.value + parameters.airX,
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
      contract: ["Button", "IconButton", "TextField", "Select", "Checkbox", "Radio", "Toggle", "Tabs", "DropdownMenu", "Tree", "TextArea", "Slider", "NumberField"],
      libraryAdapter: ["SplitView", "FileUpload", "Badge", "Tag", "Alert", "Toast", "Table", "Card", "Avatar", "AvatarGroup"],
      composition: ["Navigation", "Dialog", "Editor"],
    },
  };
}
