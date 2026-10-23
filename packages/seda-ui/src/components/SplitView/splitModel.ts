export function splitBounds(extent: number | null, separator: number, requested: number, min: number, max: number | undefined, secondaryMin: number) {
  const available = Math.max(0, (extent ?? requested + secondaryMin + separator) - separator);
  const total = Math.max(available, min + secondaryMin);
  const upper = Math.max(min, Math.min(max ?? total, total - secondaryMin));
  return {min, max:upper, total, overconstrained:extent !== null && extent < separator + min + secondaryMin};
}
export function clampSplit(value: number, min: number, max: number) {return Math.max(min,Math.min(value,max));}
