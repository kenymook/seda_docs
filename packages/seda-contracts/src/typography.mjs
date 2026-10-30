/** Executable foundation typography. Control sizes and authored canvas text are independent. */
export const typographyRoles=Object.freeze({
 'display/large':['title1','strong',12],'display/medium':['title2','strong',12],'display/small':['title3','strong',12],
 'heading/page':['h1','strong',12],'heading/section':['h2','strong',12],'heading/panel':['h3','strong',12],'heading/compact':['headline','strong',12],
 'body/large':['bodyLarge','base',12],'body/default':['body','base',12],'body/small':['bodySmall','base',12],'body/xsmall':['bodyExtraSmall','base',10],
 'label/default':['body','strong',12],'label/small':['bodySmall','strong',12],'label/xsmall':['bodyExtraSmall','strong',10],
 'caption/default':['bodySmall','base',12],'caption/tiny':['bodyExtraSmall','base',10],'caption/micro':['caption','base',8],
 'code/default':['body','base',12],'code/small':['bodySmall','base',12],
 'metric/large':['h2','strong',12],'metric/default':['h3','strong',12],'metric/small':['headline','strong',12],'metric/label':['bodySmall','base',12],
});
for(const value of Object.values(typographyRoles))Object.freeze(value);
const weights={Regular:400,Medium:500,Semibold:600,Bold:700};
/** Web serialization only: keep the named token and its provenance intact. */
export function withSystemFontFallback(family){return{...family,cssValue:JSON.stringify(family.value)+', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',adapter:'font-family-with-system-fallback'};}
export function validateTypographyScale(scale){if(typeof scale!=='number'||!Number.isFinite(scale)||scale<80||scale>200)throw new TypeError('Typography scale must be a finite percentage from 80 to 200');return scale;}
export function compileTypography(resolver,{theme='Light'}={}){
 const family=resolver.resolve({collection:'foundation',path:['font','family'],expectedType:'string'},{theme});
 const roles=Object.fromEntries(Object.entries(typographyRoles).map(([role,[token,variant,minimumSize]])=>{
  const source='foundation/typography.md',get=(key,type)=>resolver.resolve({collection:'foundation',path:['font',token,variant,key],expectedType:type},{theme});
  const size=get('size','number'),lineHeight=get('lineHeight','number'),letterSpacing=get('letterSpacing','number'),weight=get('weight','string');
  if(size.value<=0||lineHeight.value<size.value||!Number.isFinite(size.value)||!Number.isFinite(lineHeight.value)||!Number.isFinite(letterSpacing.value)||!Object.hasOwn(weights,weight.value))throw new TypeError('Invalid typography token metrics: '+role);
  return[role,{size,lineHeight,letterSpacing,weight:{...weight,cssValue:weights[weight.value]},family:role.startsWith('code/')?{value:'SFMono-Regular, Consolas, "Liberation Mono", monospace',cssValue:'SFMono-Regular, Consolas, "Liberation Mono", monospace',type:'string',chain:[],source,adapter:'documented-monospace-stack'}:family,minimumSize,source}];
 }));return{kind:'seda-typography',roles,family};
}
export function deriveTypography(typography,role,scale=100){
 validateTypographyScale(scale);if(typography?.kind!=='seda-typography'||!Object.hasOwn(typographyRoles,role)||!Object.hasOwn(typography.roles??{},role))throw new TypeError('Unknown typography role');
 const base=typography.roles[role],factor=Math.max(scale/100,base.minimumSize/base.size.value);
 return{role,scale,size:base.size.value*factor,lineHeight:base.lineHeight.value*factor,letterSpacing:base.letterSpacing.value*factor,weight:base.weight.cssValue,family:base.family.value,clamped:factor>scale/100,base};
}
/** Base variables retain token provenance; scaling is scoped by SedaProvider or its host. */
export function createTypographyBindings(typography){
 if(typography?.kind!=='seda-typography')throw new TypeError('Expected compiled typography');
 const vars={},evidence=[];
 for(const role of Object.keys(typographyRoles)){
  const base=deriveTypography(typography,role).base,prefix='--seda-type-'+role.replaceAll('/','-');
  for(const [key,leaf]of Object.entries({size:base.size,line:base.lineHeight,spacing:base.letterSpacing,weight:base.weight,family:base.family})){
   const binding=key==='family'&&!role.startsWith('code/')?withSystemFontFallback(leaf):leaf;
   const value=['size','line','spacing'].includes(key)?leaf.value+'px':binding.cssValue;
   if(typeof value!=='string'&&typeof value!=='number'||typeof value==='number'&&!Number.isFinite(value))throw new TypeError('Invalid typography binding');
   const property=prefix+'-'+key;vars[property]=value;evidence.push({property,...binding,cssValue:value,role,source:base.source});
  }
  vars[prefix+'-minimum']=base.minimumSize+'px';vars[prefix+'-ratio']=base.lineHeight.value/base.size.value;
  vars[prefix+'-tracking-ratio']=base.letterSpacing.value/base.size.value;
 }
 return{vars,evidence};
}
