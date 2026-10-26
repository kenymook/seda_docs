// @ts-check
import {deriveControlGeometry} from '../../../../packages/seda-contracts/src/control-geometry.mjs';
/** Lab 2 formula port. All base dimensions come from the compiled profile. */
/** @param {number} n */
export const fmt = (n) =>
  Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
/** @param {{geometry:Record<string,{value:number}>}} compiled
 * @param {{scale:number,air:number,airX?:number,radius:number,strict:boolean}} opts */
export function derive(compiled, opts) {
  const g = compiled.geometry;
  const p = {
    height: g.height.value,
    font: g.fontSize.value,
    line: g.lineHeight.value,
    radius: g.radius.value,
    icon: g.iconSize.value,
    border: g.borderWidth.value,
    buttonPaddingX: g.buttonPaddingInline.value,
    fieldPaddingX: g.textFieldPaddingInline.value,
  };
  const result=deriveControlGeometry(p,{scale:opts.scale,extraPaddingInline:opts.airX??0,extraPaddingBlock:opts.air,radiusScale:opts.radius/100,preserveMinimumHeight:opts.strict});
  const{line,font,icon,basePad,py,raw,height,radius}=result;
  return {
    preset: p,
    buttonPaddingX: result.buttonPaddingX,
    fieldPaddingX: result.fieldPaddingX,
    line,
    font,
    icon,
    basePad,
    py,
    raw,
    height,
    radius,
    formula: `max(${line}, ${icon}) + 2 × ${fmt(py)} + 2 × ${p.border} = ${fmt(raw)} px`,
    constraint: opts.strict && raw < p.height,
  };
}
