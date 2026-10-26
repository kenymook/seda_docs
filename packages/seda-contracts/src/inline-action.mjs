/** Build-time presentation adapter. Values remain resolved leaves, never a second size table. */
export function resolveInlineAction(contract, geometry, {size, resolveMeasurement, resolver, theme, fontWeights}) {
  const model=contract.inlineAction;
  if(!model)return {geometry};
  const measure=value=>resolveMeasurement(value,theme);
  const weight=resolver.resolve(model.labelWeight,{theme});
  if(!Object.hasOwn(fontWeights,weight.value))throw new TypeError('Unknown inline action font weight: '+weight.value);
  return {
    geometry:{...geometry,height:geometry[model.heightFrom],iconSize:geometry[model.iconFrom],
      borderWidth:measure(model.layoutBorder),buttonPaddingInline:measure(model.paddingInline),
      buttonContentGap:measure(model.contentGaps[size]),paintBorderWidth:measure(model.paintBorder)},
    actionTypography:{weight:{...weight,cssValue:fontWeights[weight.value]}},
    actionLayout:{kind:'inline-action',variant:model.variant,source:model.source},
  };
}

/** The authored text branch has transparent surface/border default+loading only. */
export function resolveInlineActionBranch(contract, branch, variant) {
  if(!contract.inlineAction||variant!==contract.inlineAction.variant)return branch;
  const result=structuredClone(branch);
  for(const role of contract.inlineAction.transparentRoles){
    const values=result.children[role];
    if(!values?.default)throw new TypeError('Inline action requires '+role+'/default');
    for(const state of ['hover','pressed','disabled'])if(!values[state])values[state]={...structuredClone(values.default),adapter:'inline-transparent-state',source:contract.inlineAction.source};
  }
  return result;
}
