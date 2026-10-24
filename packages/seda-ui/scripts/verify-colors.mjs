import assert from 'node:assert/strict';
const rgba=value=>{
  assert.match(value,/^(rgba?\(|color\(srgb )/);
  const numbers=value.match(/[+-]?(?:\d*\.)?\d+(?:e[+-]?\d+)?/gi).map(Number);
  const multiplier=value.startsWith('color(srgb ')?255:1;
  return [...numbers.slice(0,3).map(value=>value*multiplier),numbers[3]??1];
};
const over=(foreground,background)=>foreground.slice(0,3).map((value,i)=>value*foreground[3]+background[i]*(1-foreground[3]));
export function textContrast(foreground,backgrounds){
  const background=backgrounds.toReversed().reduce((background,value)=>over(rgba(value),background),[255,255,255]);
  const painted=over(rgba(foreground),background);
  const luminance=rgb=>rgb.map(value=>value/255).reduce((sum,value,i)=>sum+[.2126,.7152,.0722][i]*(value<=.04045?value/12.92:((value+.055)/1.055)**2.4),0);
  const [lo,hi]=[luminance(background),luminance(painted)].sort((a,b)=>a-b);
  return (hi+.05)/(lo+.05);
}
