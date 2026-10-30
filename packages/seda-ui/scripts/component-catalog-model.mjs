const named=value=>typeof value==='string'&&!!value.trim();
export const componentId=name=>name.replace(/([a-z0-9])([A-Z])/g,'$1-$2').toLowerCase();
function unique(items,key,label){const found=new Set();for(const item of items){const value=key(item);if(!named(value)||found.has(value))throw Error('Invalid or duplicate '+label+': '+value);found.add(value);}return found;}
/** Presence is deliberately separate from visual/platform acceptance. */
export function createComponentCatalog({specs,modules,contractIds,tokenBranches,previews,relations,legacyAliases=[],source}){
 const specIds=unique(specs,item=>item.id,'spec'),moduleIds=unique(modules,item=>componentId(item.name),'module'),previewIds=unique(previews,item=>item.id,'preview');
 unique(contractIds,name=>name,'contract');unique(tokenBranches,name=>name,'token branch');
 const ids=new Set([...specIds,...moduleIds,...tokenBranches]),overrides=relations.entries??{};
 for(const id of Object.keys(overrides))if(!ids.has(id))throw Error('Unknown component relation: '+id);
 for(const id of Object.keys(relations.recordedVisualEvidence??{}))if(!ids.has(id))throw Error('Unknown review component: '+id);
 for(const name of contractIds)if(!modules.some(item=>item.name===name))throw Error('Contract has no public module: '+name);
 for(const id of previewIds)if(!ids.has(id)||!moduleIds.has(id))throw Error('Preview has no public component: '+id);
 const entries=[...ids].sort().map(id=>{
  const spec=specs.find(item=>item.id===id),module=modules.find(item=>componentId(item.name)===id),preview=previews.find(item=>item.id===id),relation=overrides[id]??{};
  const kind=relation.kind??'component';if(!['component','family','composition','foundation'].includes(kind))throw Error('Invalid catalogue kind: '+id);
  const members=relation.members??[];for(const member of members)if(!ids.has(member)||member===id)throw Error('Invalid family member: '+id+'/'+member);
  const borrowed=relation.sharedTokenBranches??[];for(const branch of borrowed)if(!tokenBranches.includes(branch)||branch===id)throw Error('Invalid shared token source: '+id+'/'+branch);
  if(kind==='family'&&(module||!members.length))throw Error('Family is not a standalone exported component: '+id);
  if(module&&(!module.exports?.length||!named(module.path)))throw Error('Public module has no value exports: '+id);
  const owns=tokenBranches.includes(id),contracts=module&&contractIds.includes(module.name)?[module.name]:[];
  return {id,title:spec?.title??module?.name??id,kind,
   specification:spec?{...spec,status:'present'}:{status:relation.foundationDocs?.length?'foundation-document':'missing',paths:relation.foundationDocs??[]},
   runtime:module?{status:'exported',module:module.name,path:module.path,exports:module.exports,sha256:module.sha256}:{status:kind==='family'?'family-only':'missing',module:null,exports:[]},
   tokens:{status:owns?'own':borrowed.length?'shared':'no-component-branch',branches:[...(owns?[{id,ownership:'own'}]:[]),...borrowed.map(id=>({id,ownership:'shared'}))]},
   contract:{status:contracts.length?'registered':'not-registered',ids:contracts},
   preview:preview?{id:preview.id,surface:preview.surface,path:preview.path,line:preview.line,status:'registered',scope:'Live Studio adapter; full variant/state acceptance not implied.'}:{status:'not-registered',surface:'Studio'},
   visualReview:{status:'not-accepted',recordedEvidence:relations.recordedVisualEvidence?.[id]??[]},
   platformReview:{status:'not-accepted',recordedEvidence:[]},
   familyMembers:members,legacyAliases:legacyAliases.filter(item=>item.id===id).map(({id,...alias})=>({...alias,status:'historical-unverified'})),note:relation.note??null};
 });
 for(const alias of legacyAliases)if(!specIds.has(alias.id))throw Error('Legacy alias has no specification: '+alias.id);
 return {schemaVersion:1,scope:'Source coverage. Registration, historical spec status and recorded evidence do not confer acceptance.',source,
  counts:{entries:entries.length,specifications:specs.length,publicModules:modules.length,contracts:contractIds.length,tokenBranches:tokenBranches.length,studioPreviews:previews.length,runtimeMissing:entries.filter(item=>item.runtime.status==='missing').length,visualAccepted:0,platformAccepted:0},
  entries,relatedPlatformEvidence:relations.relatedPlatformEvidence??[]};
}
