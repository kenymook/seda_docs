import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createComponentCatalog} from './component-catalog-model.mjs';
import {catalogSourcePath,generateComponentCatalog,previewRegistrations} from './component-catalog.mjs';

const module=name=>({name,path:`src/${name}.tsx`,exports:[name],sha256:'fixture'});
const fixture=()=>({specs:[{id:'select',title:'Select',authoredStatus:'ready'},{id:'chip',title:'Chip',authoredStatus:'ready'}],modules:[module('Select')],contractIds:['Select'],tokenBranches:['select','chip'],previews:[{id:'select',surface:'Studio',path:'preview.tsx',line:1}],relations:{entries:{},recordedVisualEvidence:{select:[{path:'review.md',scope:'Historical review'}]}},source:{tokensSha256:'fixture'}});

test('spec ready and historical evidence never become runtime/visual/platform acceptance',()=>{
 const catalog=createComponentCatalog(fixture()),chip=catalog.entries.find(x=>x.id==='chip'),select=catalog.entries.find(x=>x.id==='select');
 assert.equal(chip.specification.authoredStatus,'ready');assert.equal(chip.runtime.status,'missing');assert.equal(chip.preview.status,'not-registered');
 assert.equal(select.runtime.status,'exported');assert.equal(select.contract.status,'registered');assert.equal(select.preview.status,'registered');
 assert.equal(select.visualReview.recordedEvidence.length,1);assert.equal(select.visualReview.status,'not-accepted');assert.equal(select.platformReview.status,'not-accepted');
 assert.equal(catalog.counts.visualAccepted,0);
});
test('family and composition preserve ownership without invented standalone exports',()=>{
 const input=fixture();input.specs.push({id:'button-system'},{id:'number-field'});input.modules.push(module('Button'),module('NumberField'),module('TextField'));input.tokenBranches.push('text-field');
 input.relations.entries={'button-system':{kind:'family',members:['button']},'number-field':{kind:'composition',sharedTokenBranches:['text-field']}};
 const c=createComponentCatalog(input);assert.equal(c.entries.find(x=>x.id==='button-system').runtime.status,'family-only');
 assert.deepEqual(c.entries.find(x=>x.id==='number-field').tokens,{status:'shared',branches:[{id:'text-field',ownership:'shared'}]});
});
test('historical aliases do not create runtime modules',()=>{
 const input=fixture();input.legacyAliases=[{id:'chip',label:'Menu',source:'history.md'}];const c=createComponentCatalog(input);
 assert.equal(c.entries.some(x=>x.id==='menu'),false);assert.equal(c.entries.find(x=>x.id==='chip').legacyAliases[0].status,'historical-unverified');
});
for(const [name,mutate,pattern]of [
 ['orphan contract',x=>x.contractIds.push('Chip'),/Contract has no public module/],
 ['orphan preview',x=>x.previews.push({id:'chip'}),/Preview has no public component/],
 ['unknown relation',x=>x.relations.entries.unknown={},/Unknown component relation/],
 ['missing shared branch',x=>x.relations.entries.select={sharedTokenBranches:['missing']},/Invalid shared token/],
 ['self shared branch',x=>x.relations.entries.select={sharedTokenBranches:['select']},/Invalid shared token/],
 ['duplicate spec',x=>x.specs.push({id:'select'}),/duplicate spec/],
 ['empty public export',x=>x.modules[0].exports=[],/no value exports/],
])test('rejects '+name,()=>{const input=fixture();mutate(input);assert.throws(()=>createComponentCatalog(input),pattern);});
test('preview registry reads actual literal adapters and refuses opaque registrations',()=>{
 const entries=previewRegistrations(`export const studioPreviews={'select':()=>null} satisfies Registry;`,'p.tsx');assert.equal(entries[0].id,'select');assert.equal(entries[0].line,1);
 for(const text of [`export const studioPreviews={...other}`,`export const studioPreviews={[name]:()=>null}`,`export const studioPreviews={'select':external}`])assert.throws(()=>previewRegistrations(text,'p.tsx'),/Opaque/);
});
test('source references cannot escape repository',()=>{
 const root=path.resolve('catalog-fixture');assert.equal(catalogSourcePath(root,'docs/review.md'),path.join(root,'docs/review.md'));
 for(const file of ['../outside.md',path.resolve('outside.md'),''])assert.throws(()=>catalogSourcePath(root,file),/inside repository/);
});
test('real source catalog is deterministic and preserves exported values and absent previews',async()=>{
 const repoRoot=path.resolve(import.meta.dirname,'../../..'),bytes=await fs.readFile(path.join(repoRoot,'tokens.json')),options={repoRoot,tokens:JSON.parse(bytes),tokensSha256:createHash('sha256').update(bytes).digest('hex')};
 const first=await generateComponentCatalog(options),second=await generateComponentCatalog(options);assert.deepEqual(first,second);
 const get=id=>first.catalog.entries.find(x=>x.id===id);
 assert.ok(get('avatar').runtime.exports.includes('AvatarGroup'));assert.ok(!get('avatar').runtime.exports.includes('AvatarProps'));
 assert.equal(get('breadcrumbs').preview.status,'registered');assert.equal(get('breadcrumbs').contract.status,'not-registered');
 assert.equal(get('number-field').tokens.status,'shared');assert.equal(get('chip').runtime.status,'exported');assert.equal(get('chip').preview.status,'registered');assert.equal(get('icon').specification.status,'foundation-document');
 assert.equal(first.catalog.counts.publicModules,40);assert.equal(first.catalog.counts.contracts,16);assert.equal(first.catalog.counts.tokenBranches,52);assert.equal(first.catalog.counts.studioPreviews,11);
 assert.ok(first.sources['portal/component-lab/pilots/settings-parametric/StudioPreviews.tsx']);
});
