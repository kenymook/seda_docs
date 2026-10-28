import {createTokenResolver} from '../../../../packages/seda-contracts/src/tokens.mjs';
import {compileTypography,createTypographyBindings,withSystemFontFallback} from '../../../../packages/seda-contracts/src/typography.mjs';
import {resolveInlineAction} from '../../../../packages/seda-contracts/src/inline-action.mjs';
import {applyWorkbenchEdits} from './token-workbench-model.mjs';
const weights={Regular:400,Medium:500,Semibold:600,Bold:700};
/** Re-evaluate the audited compiler's token refs; constants and rules remain authored contracts. */
export function bindSavedDesign(source,edits,templates,library,buttonContract){
 const tokens=applyWorkbenchEdits(source,edits),resolver=createTokenResolver(tokens);
 function rebind(node,theme){
  if(!node||typeof node!=='object')return node;
  if(node.ref&&Object.hasOwn(node,'cssValue')&&node.type){
   const leaf=resolver.resolve({...node.ref,expectedType:node.type},{theme});let cssValue=leaf.cssValue;
   if(node.adapter==='font-family-with-system-fallback')cssValue=withSystemFontFallback(leaf).cssValue;
   else if(node.adapter==='font-weight-name-to-number'||node.type==='string'&&typeof node.cssValue==='number'&&weights[node.value])cssValue=weights[leaf.value];
   return {...node,...leaf,cssValue};
  }
  return Array.isArray(node)?node.map(v=>rebind(v,theme)):Object.fromEntries(Object.entries(node).map(([k,v])=>[k,rebind(v,theme)]));
 }
 const profiles={};
 for(const [key,template] of Object.entries(templates)){
  const theme=template.configuration.theme,p=rebind(template,theme);
  p.typography.roles=compileTypography(resolver,{theme});
  const resolveMeasurement=(value,theme)=>value&&'collection' in value?resolver.resolve(value,{theme}):{...value,cssValue:value.value+'px'};
  p.actionVariants.text=resolveInlineAction(buttonContract,p.geometry,{size:p.configuration.controlSize,theme,resolver,resolveMeasurement,fontWeights:weights});
  for(const instance of Object.values(p.instances))if(instance.component==='Button'&&instance.props.variant==='text')Object.assign(instance,resolveInlineAction(buttonContract,p.geometry,{size:instance.props.size,theme,resolver,resolveMeasurement,fontWeights:weights}));
  profiles[key]=p;
 }
 const themeVars={};
 for(const theme of ['Light','Dark']){
  const dom=theme.toLowerCase(),vars=Object.fromEntries(library.themes[dom].map(item=>{const leaf=rebind(item,theme);return[item.property,leaf.cssValue];}));
  Object.assign(vars,createTypographyBindings(compileTypography(resolver,{theme})).vars);
  vars['--seda-label-weight']=profiles[theme+':m'].typography.labelWeight.cssValue;
  for(const size of ['s','m','l','xl'])for(const [name,leaf] of Object.entries(profiles[theme+':'+size].geometry))if(leaf&&typeof leaf==='object'&&'cssValue' in leaf)vars['--seda-size-'+size+'-'+name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())]=leaf.cssValue;
  themeVars[dom]=vars;
 }
 const css=Object.entries(themeVars).map(([theme,vars])=>'.seda-provider[data-seda-theme="'+theme+'"]{'+Object.entries(vars).map(([name,value])=>name+':'+value+';').join('')+'}').join('\n');
 return{tokens,profiles,css};
}
