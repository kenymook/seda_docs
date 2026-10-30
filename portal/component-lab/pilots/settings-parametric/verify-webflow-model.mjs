import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const out=path.join(import.meta.dirname,'.diagnostics-webflow');await fs.mkdir(out,{recursive:true});
await build({absWorkingDir:import.meta.dirname,entryPoints:['references/webflow-model.ts'],outfile:path.join(out,'model.mjs'),bundle:true,platform:'node',format:'esm'});
const m=await import(pathToFileURL(path.join(out,'model.mjs'))),results=[];
const copy=structuredClone,px=value=>({value,unit:'px'});
function check(name,run){try{run();results.push({name,status:'passed'});console.log('PASS '+name);}catch(error){results.push({name,status:'failed',error:error.stack});console.error('FAIL '+name,error);}}
check('source-reconstruction-roundtrip-and-empty-canvas',()=>{
 const d=m.initialDocument();assert.deepEqual(m.readDocument(m.serializeDocument(d)),d);assert.equal(d.pages[0].nodes.length,19);assert.ok(d.pages[0].nodes.every(n=>n.text===''));assert.equal(m.initialView().width,992);assert.equal(m.initialView().selection,'slide-1');assert.equal(d.pages[0].nodes.find(n=>n.id==='slide-nav').visible,false);
});
check('strict-import-rejects-unknown-properties-and-invalid-tree',()=>{
 const mutations=[d=>d.extra=true,d=>d.version=2,d=>d.pages[0].nodes[0].extra=true,d=>d.pages[0].nodes.push(copy(d.pages[0].nodes[0])),d=>d.pages[0].nodes[1].parentId='missing',d=>d.pages[0].nodes[3].parentId='slide-1',d=>d.pages[0].nodes[0].parentId='container',d=>d.pages[0].nodes[0].kind='text',d=>d.rules.body.mobile={},d=>d.rules.body.desktop.fontSize=px(NaN),d=>d.rules.body.desktop.backgroundImage='url(https://example.test)',d=>d.pages[0].nodes[0].tag='script',d=>d.pages[0].nodes[1].htmlId='duplicate',d=>d.pages[0].nodes[0].visible=1];
 for(const mutate of mutations){const d=m.initialDocument();d.pages[0].nodes[0].htmlId='duplicate';mutate(d);assert.throws(()=>m.validateDocument(d));}assert.throws(()=>m.readDocument(' '.repeat(2_000_001)));
});
check('prototype-names-and-object-inheritance-rejected',()=>{
 for(const name of ['__proto__','constructor','prototype']){const d=m.initialDocument();Object.defineProperty(d.rules,name,{value:{desktop:{color:'#112233'}},enumerable:true});assert.throws(()=>m.validateDocument(d));}
 const d=m.initialDocument();d.rules.body.desktop=Object.create({color:'#112233'});assert.throws(()=>m.validateDocument(d));assert.throws(()=>m.updateNode(m.initialDocument(),'home','slide-1',JSON.parse('{"__proto__":{"visible":false}}')));assert.equal({}.visible,undefined);
});
check('css-input-parser-preserves-units-and-rejects-injection',()=>{
 for(const unit of ['px','%','vw','vh','rem','em'])assert.deepEqual(m.parseStyleInput('fontSize','1.25'+unit),{value:1.25,unit});assert.equal(m.parseStyleInput('lineHeight','1.5'),1.5);assert.equal(m.parseStyleInput('fontWeight','600'),600);assert.equal(m.parseStyleInput('width','auto'),'auto');assert.equal(m.parseStyleInput('maxWidth','none'),'none');assert.deepEqual(m.parseStyleInput('marginLeft','-2px'),px(-2));
 for(const [key,value] of [['fontSize','0px'],['paddingLeft','-1px'],['width','none'],['minWidth','auto'],['borderWidth','10%'],['opacity','2'],['gridColumns','1.5'],['zIndex','1.5'],['color','url(x)'],['fontSize','calc(1px + 2px)'],['fontSize','1px;display:none'],['fontSize','Infinitypx'],['fontSize','1e3px'],['display','contents']])assert.throws(()=>m.parseStyleInput(key,value));
});
check('breakpoint-boundaries-and-downward-cascade',()=>{
 assert.deepEqual([240,479,480,767,768,991,992,2400].map(m.breakpointFor),['portrait','portrait','landscape','landscape','tablet','tablet','desktop','desktop']);for(const n of [239,2401,Infinity,NaN])assert.throws(()=>m.breakpointFor(n));
 let d=m.initialDocument();for(const [bp,value]of [['desktop',100],['tablet',80],['portrait',40]])d=m.setStyle(d,'slide-1',bp,'width',px(value));const p=d.pages[0];for(const [bp,value]of [['desktop',100],['tablet',80],['landscape',80],['portrait',40]])assert.deepEqual(m.resolveProperty(d,p,'slide-1','width',bp).value,px(value));
 const reset=m.setStyle(d,'slide-1','tablet','width',undefined);assert.deepEqual(m.resolveProperty(reset,reset.pages[0],'slide-1','width','landscape').value,px(100));assert.deepEqual(m.resolveProperty(reset,reset.pages[0],'slide-1','width','portrait').value,px(40));
});
check('shared-class-rule-updates-all-users-without-inline-duplication',()=>{
 let d=m.initialDocument();d=m.updateNode(d,'home','slide-2',{className:'slide-1'});d=m.setStyle(d,'slide-1','desktop','color','#123456');for(const id of ['slide-1','slide-2'])assert.equal(m.resolveProperty(d,d.pages[0],id,'color','desktop').value,'#123456');assert.equal(d.pages[0].nodes.find(n=>n.id==='slide-2').color,undefined);
});
check('relative-inheritance-is-traced-but-not-reapplied-on-descendants',()=>{
 const d=m.setStyle(m.initialDocument(),'container','desktop','fontSize',{value:2,unit:'em'}),p=d.pages[0];const resolved=m.resolveProperty(d,p,'slide-1','fontSize','desktop');assert.deepEqual(resolved.value,{value:2,unit:'em'});assert.ok(resolved.chain.some(s=>s.kind==='rule'&&s.path.join('/')==='rules/container/desktop/fontSize'));assert.equal(resolved.chain.at(-1).kind,'inherit');assert.equal(m.cssDeclarations(d,p.nodes.find(n=>n.id==='slide-1'),'desktop').fontSize,undefined);assert.equal(m.cssDeclarations(d,p.nodes.find(n=>n.id==='container'),'desktop').fontSize,'2em');
});
check('style-and-node-commands-are-immutable-and-invalid-edits-atomic',()=>{
 const d=m.initialDocument(),before=m.serializeDocument(d),next=m.setStyle(d,'slide-1','desktop','width',px(300));assert.notDeepEqual(next,d);assert.equal(m.serializeDocument(d),before);assert.throws(()=>m.setStyle(d,'slide-1','desktop','paddingLeft',px(-1)));assert.throws(()=>m.updateNode(d,'home','slide-1',{id:'new-id'}));assert.throws(()=>m.updateNode(d,'home','slide-1',{className:'missing'}));assert.equal(m.serializeDocument(d),before);
});
check('text-add-delete-descendants-and-root-protection',()=>{
 const d=m.initialDocument(),added=m.addText(d,'home','slide-1','Editable text');assert.equal(added.document.pages[0].nodes.find(n=>n.id===added.id).text,'Editable text');assert.throws(()=>m.addText(added.document,'home',added.id));assert.throws(()=>m.deleteNode(d,'home','body'));const removed=m.deleteNode(added.document,'home','container');assert.ok(!removed.pages[0].nodes.some(n=>['slide-1','slide-2',added.id].includes(n.id)));assert.equal(d.pages[0].nodes.length,19);
});
check('history-noop-undo-redo-branch-and-external-isolation',()=>{
 const d=m.initialDocument(),h=new m.AuthorHistory(d),view=m.initialView(),before=copy(view);assert.equal(h.apply(d),false);h.apply(m.updateNode(d,'home','slide-1',{name:'Renamed'}));assert.ok(h.canUndo);assert.ok(h.undo());assert.deepEqual(h.document,d);h.redo();assert.equal(h.document.pages[0].nodes.find(n=>n.id==='slide-1').name,'Renamed');h.undo();h.apply(m.setStyle(h.document,'body','desktop','color','#112233'));assert.equal(h.canRedo,false);const external=h.document;external.pages[0].name='External';assert.equal(h.document.pages[0].name,'Home');assert.deepEqual(view,before);
});
check('save-snapshot-duplicate-guard-edit-during-save-and-late-replies',()=>{
 const d=m.initialDocument(),changed=m.setStyle(d,'body','desktop','color','#112233'),s=new m.AuthorSave(d),request=s.begin(changed);assert.ok(request);request.text='tampered caller copy';assert.equal(s.begin(d),null);let saved;assert.equal(s.finish(request.token,text=>saved=text),true);assert.deepEqual(m.readDocument(saved),changed);assert.equal(s.dirty(changed),false);assert.equal(s.dirty(d),true);const old=s.begin(d);s.cancel();const active=s.begin(changed);assert.equal(s.finish(old.token,()=>assert.fail('late write')),false);assert.equal(s.busy,true);s.finish(active.token,()=>{});s.invalidate();assert.equal(s.dirty(changed),true);
});
check('save-quota-failure-retains-dirty-and-releases-retry',()=>{
 const d=m.initialDocument(),s=new m.AuthorSave(d),changed=m.setStyle(d,'body','desktop','color','#112233'),request=s.begin(changed);assert.throws(()=>s.finish(request.token,()=>{throw Error('quota');}));assert.equal(s.busy,false);assert.equal(s.dirty(changed),true);assert.ok(s.begin(changed));
});
const report={scope:'Webflow reconstructed authored-document domain only. No UI, renderer, source fidelity, accessibility or publication acceptance.',passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length,results};await fs.writeFile(path.join(out,'model-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
