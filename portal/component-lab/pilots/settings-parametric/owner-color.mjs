const hexPattern = /^#([\da-f]{6})([\da-f]{2})?$/i;
const number = String.raw`(?:\d+(?:\.\d+)?|\.\d+)`;
const oklchPattern = new RegExp(`^oklch\\(\\s*(${number})(%)?\\s+(${number})\\s+(${number})(?:deg)?(?:\\s*\\/\\s*(${number})(%)?)?\\s*\\)$`, 'i');

const round = (value, places) => Number(value.toFixed(places));
const gamma = value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
const encode = value => value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
const clamp = value => Math.max(0, Math.min(1, value));

export function parseOklch(value) {
  const match = oklchPattern.exec(value.trim());
  if (!match) return null;
  const lightness = Number(match[1]) / (match[2] ? 100 : 1);
  const chroma = Number(match[3]);
  const hue = Number(match[4]);
  const alpha = match[5] === undefined ? 1 : Number(match[5]) / (match[6] ? 100 : 1);
  if (![lightness, chroma, hue, alpha].every(Number.isFinite) || lightness < 0 || lightness > 1 || chroma < 0 || chroma > 1 || hue < 0 || hue > 360 || alpha < 0 || alpha > 1) return null;
  return { lightness, chroma, hue, alpha };
}

export function hexToOklch(value) {
  const match = hexPattern.exec(value);
  if (!match) return null;
  const rgb = [0, 2, 4].map(offset => gamma(parseInt(match[1].slice(offset, offset + 2), 16) / 255));
  const [r, g, b] = rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const axisB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, axisB);
  const hue = chroma < 0.00005 ? 0 : (Math.atan2(axisB, a) * 180 / Math.PI + 360) % 360;
  const alpha = match[2] ? parseInt(match[2], 16) / 255 : 1;
  return `oklch(${round(lightness * 100, 2)}% ${round(chroma, 4)} ${round(hue, 2)}${alpha < 1 ? ` / ${round(alpha, 3)}` : ''})`;
}

export function oklchToHex(value) {
  const parsed = parseOklch(value);
  if (!parsed) return null;
  const { lightness: L, chroma, hue } = parsed;
  const angle = hue * Math.PI / 180;
  const a = chroma * Math.cos(angle);
  const b = chroma * Math.sin(angle);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return `#${linear.map(channel => Math.round(clamp(encode(channel)) * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function displayOklch(value) {
  return hexToOklch(value) ?? (parseOklch(value) ? value : null);
}

export function pickerHex(value) {
  return hexPattern.test(value) ? value.slice(0, 7) : oklchToHex(value);
}
