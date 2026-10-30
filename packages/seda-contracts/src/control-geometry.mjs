// Browser-safe foundation model. The same expressions produce numeric evidence and CSS.
export const defaultControlParameters=Object.freeze({scale:100,extraPaddingInline:0,extraPaddingBlock:0,radiusScale:1,preserveMinimumHeight:true});
const limits=Object.freeze({scale:[80,200],extraPaddingInline:[0,24],extraPaddingBlock:[0,12],radiusScale:[.5,1.75]});
export function controlParameterMetadata(){return{kind:'seda-control-parameters',schemaVersion:'0.1.0',experimental:true,modelSource:'packages/seda-contracts/src/control-geometry.mjs',defaults:{...defaultControlParameters},ranges:Object.fromEntries(Object.entries(limits).map(([name,[min,max]])=>[name,{min,max}])),preserveMinimumHeight:'boolean',inheritance:'absolute-per-field',sizePriority:'component-before-provider',textScale:'independent-Text-roles',cssRequirement:'round(nearest,1px,1px) and size container units',runtimeConformance:'not-checked'};}
export function normalizeControlParameters(input={},parent=defaultControlParameters){
  if(!input||typeof input!=='object'||![Object.prototype,null].includes(Object.getPrototypeOf(input)))throw new TypeError('SEDA control parameters must be a plain object');
  const result={...defaultControlParameters,...parent,...input};
  for(const name of Object.keys(result))if(!Object.hasOwn(defaultControlParameters,name))throw new TypeError('Unknown SEDA control parameter: '+name);
  for(const[name,[min,max]]of Object.entries(limits))if(typeof result[name]!=='number'||!Number.isFinite(result[name])||result[name]<min||result[name]>max)throw new RangeError('Unsupported SEDA control parameter: '+name);
  if(typeof result.preserveMinimumHeight!=='boolean')throw new TypeError('SEDA preserveMinimumHeight must be boolean');
  return Object.freeze(result);
}
export function controlParameterVariables(parameters){
  const p=normalizeControlParameters(parameters);
  return{'--seda-parameter-scale':p.scale/100,'--seda-parameter-extra-inline':p.extraPaddingInline+'px','--seda-parameter-extra-block':p.extraPaddingBlock+'px','--seda-parameter-radius':p.radiusScale,'--seda-parameter-minimum':p.preserveMinimumHeight?1:0};
}
const ref=name=>({ref:name}),op=(name,...args)=>({op:name,args});
const expression={
  font:op('round',op('*',ref('preset.font'),ref('parameter.scale')),1),
  line:op('round',op('*',ref('preset.line'),ref('parameter.scale')),1),
  icon:op('round',op('*',ref('preset.icon'),ref('parameter.scale')),1),
  basePad:op('/',op('-',op('-',ref('preset.height'),ref('preset.line')),op('*',2,ref('preset.border'))),2),
  py:op('+',ref('basePad'),ref('parameter.extraBlock')),
  raw:op('+',op('+',op('max',ref('line'),ref('icon')),op('*',2,ref('py'))),op('*',2,ref('preset.border'))),
  height:op('max',ref('raw'),op('*',ref('preset.height'),ref('parameter.minimum'))),
  radius:op('round',op('*',ref('preset.radius'),ref('parameter.radius')),.01),
  buttonPaddingX:op('+',ref('preset.buttonPaddingX'),ref('parameter.extraInline')),
  fieldPaddingX:op('+',ref('preset.fieldPaddingX'),ref('parameter.extraInline')),
  choiceSize:op('max',ref('icon'),ref('font')),
};
function evaluate(node,values){
  if(typeof node==='number')return node;
  if(node.ref){if(!Object.hasOwn(values,node.ref))throw new Error('Unknown geometry reference: '+node.ref);return values[node.ref];}
  const[a,b]=node.args.map(arg=>evaluate(arg,values));
  switch(node.op){case'+':return a+b;case'-':return a-b;case'*':return a*b;case'/':return a/b;case'max':return Math.max(a,b);case'round':return Number((Math.round(a/b)*b).toFixed(10));default:throw new Error('Unknown geometry operation');}
}
/** Preset values come from compiled geometry; no token or size table is authored here. */
export function deriveControlGeometry(preset,parameters={}){
  const p=normalizeControlParameters(parameters),values={'parameter.scale':p.scale/100,'parameter.extraInline':p.extraPaddingInline,'parameter.extraBlock':p.extraPaddingBlock,'parameter.radius':p.radiusScale,'parameter.minimum':p.preserveMinimumHeight?1:0};
  for(const name of ['height','font','line','icon','radius','border','buttonPaddingX','fieldPaddingX']){
    const value=preset?.[name];if(typeof value!=='number'||!Number.isFinite(value)||(name==='border'||name==='radius'||name.endsWith('PaddingX')?value<0:value<=0))throw new RangeError('Invalid SEDA geometry preset: '+name);values['preset.'+name]=value;
  }
  if(preset.height<preset.line+2*preset.border)throw new RangeError('SEDA preset has negative vertical padding');
  const result={};for(const[name,node]of Object.entries(expression))result[name]=values[name]=evaluate(node,values);
  return Object.freeze({...result,constraint:p.preserveMinimumHeight&&result.raw<preset.height,parameters:p});
}
const outputNames={font:'--seda-control-font-size',line:'--seda-control-line-height',icon:'--seda-control-icon-size',basePad:'--seda-geometry-base-padding',py:'--seda-control-padding-block',raw:'--seda-geometry-raw-height',height:'--seda-control-height',radius:'--seda-control-radius',buttonPaddingX:'--seda-control-button-padding-inline',fieldPaddingX:'--seda-control-field-padding-inline',choiceSize:'--seda-control-choice-size'};
export function controlGeometryVariables(geometry){return{...Object.fromEntries(Object.entries(outputNames).map(([key,name])=>[name,geometry[key]+'px'])),'--seda-control-padding-inline':geometry.fieldPaddingX+'px',...controlParameterVariables(geometry.parameters)};}
const sources={'preset.height':'--seda-preset-height','preset.font':'--seda-preset-font-size','preset.line':'--seda-preset-line-height','preset.icon':'--seda-preset-icon-size','preset.radius':'--seda-preset-radius','preset.border':'--seda-preset-border-width','preset.buttonPaddingX':'--seda-preset-button-padding','preset.fieldPaddingX':'--seda-preset-field-padding','parameter.scale':'--seda-parameter-scale','parameter.extraInline':'--seda-parameter-extra-inline','parameter.extraBlock':'--seda-parameter-extra-block','parameter.radius':'--seda-parameter-radius','parameter.minimum':'--seda-parameter-minimum',...outputNames};
function css(node,length=false){
  if(typeof node==='number')return String(node)+(length?'px':'');
  if(node.ref){const fallback={'parameter.scale':'1','parameter.extraInline':'0px','parameter.extraBlock':'0px','parameter.radius':'1','parameter.minimum':'1'}[node.ref];return'var('+sources[node.ref]+(fallback!==undefined?', '+fallback:'')+')';}
  if(node.op==='round')return'round(nearest, '+css(node.args[0])+', '+css(node.args[1],true)+')';
  if(node.op==='max')return'max('+node.args.map(arg=>css(arg)).join(', ')+')';
  return'calc('+css(node.args[0])+' '+node.op+' '+css(node.args[1])+')';
}
/** Build-time CSS and numeric execution share the expression graph above. */
export function controlGeometryDeclarations(){
  return Object.entries(expression).map(([name,node])=>outputNames[name]+':'+css(node)+';').join('')+
    '--seda-control-padding-inline:var(--seda-control-field-padding-inline);--seda-control-border-width:var(--seda-preset-border-width);--seda-control-gap:var(--seda-preset-gap);--seda-control-extra-padding-inline:var(--seda-parameter-extra-inline);--seda-control-extra-padding-block:var(--seda-parameter-extra-block);';
}
