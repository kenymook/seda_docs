// @ts-check
/** Lab 2 formula port. All base dimensions come from the compiled profile. */
/** @param {number} n */
export const fmt = (n) =>
  Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
/** @param {{geometry:Record<string,{value:number}>}} compiled
 * @param {{scale:number,air:number,radius:number,strict:boolean}} opts */
export function derive(compiled, opts) {
  const g = compiled.geometry;
  const p = {
    height: g.height.value,
    font: g.fontSize.value,
    line: g.lineHeight.value,
    radius: g.radius.value,
    icon: g.iconSize.value,
    border: g.borderWidth.value,
  };
  const line = Math.round((p.line * opts.scale) / 100),
    font = Math.round((p.font * opts.scale) / 100);
  const basePad = (p.height - p.line - 2 * p.border) / 2,
    py = basePad + opts.air;
  const raw = Math.max(line, p.icon) + 2 * py + 2 * p.border;
  const height = opts.strict ? Math.max(raw, p.height) : raw;
  const radius = Math.round(p.radius * opts.radius) / 100;
  return {
    preset: p,
    line,
    font,
    basePad,
    py,
    raw,
    height,
    radius,
    formula: `max(${line}, ${p.icon}) + 2 × ${fmt(py)} + 2 × ${p.border} = ${fmt(raw)} px`,
    constraint: opts.strict && raw < p.height,
  };
}
