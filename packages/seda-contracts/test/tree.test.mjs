import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createContractEngine,ContractValidationError} from '../src/index.mjs';
import {createTreeWebBindings,createWebBindings} from '../src/web.mjs';
const engine=createContractEngine();
const items=[{id:'root',label:'Root',children:[{id:'a',label:'A'},{id:'locked',label:'Locked',disabled:true,children:[{id:'child',label:'Child'}]},{id:'b',label:'B'}]}];
const props={label:'Layers',items,defaultExpandedIds:['root']};
test('Tree: shared compiler audits actual defaults, geometry and canonical theme roles',()=>{
 assert.deepEqual(engine.api.get('Tree').observedDefaults,{selectionMode:'single',disabled:false,emptyText:'Нет элементов',size:'m'});
 for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl']) {
  const tree=engine.compileControl('Tree',{...props,size},{theme}),binding=createTreeWebBindings(tree);
  assert.equal(tree.geometry.height.value,engine.bundle.system.sizes[size].height.value);
  assert.equal(binding.vars['--seda-preset-height'],size==='s'?'24px':size==='m'?'32px':size==='l'?'40px':'48px');
  assert.ok(binding.evidence.find(entry=>entry.property==='--tree-focus-ring').chain.length>1);
  assert.ok(tree.checks.filter(check=>check.layer==='browser').every(check=>check.status==='not-checked'));
 }
 const compiled=engine.compile(engine.bundle.profile);assert.equal(compiled.controls.Tree.component,'Tree');assert.equal(createWebBindings(compiled).controls.Tree.attributes['data-seda-contract'],'Tree');
});
test('Tree: hierarchy, stale ids, hidden selection and inherited availability are explicit',()=>{
 const tree=engine.compileControl('Tree',{...props,selectionMode:'multiple',defaultSelectedIds:['b','a','locked','child','removed'],defaultExpandedIds:[]}).state.tree;
 assert.deepEqual(tree.selectedIds,['a','b']);assert.deepEqual(tree.expandedIds,[]);assert.equal(tree.items.find(item=>item.id==='a').visible,false);assert.equal(tree.items.find(item=>item.id==='child').disabled,true);
 const disabled=engine.compileControl('Tree',{...props,disabled:true,defaultSelectedIds:['a']}).state;
 assert.equal(disabled.availability,'disabled');assert.deepEqual(disabled.tree.expandedIds,['root']);assert.deepEqual(disabled.tree.selectedIds,[]);
 assert.equal(engine.compileControl('Tree',{label:'Empty',items:[]}).state.data,'empty');
});
test('Tree: malformed hierarchy, unsupported API and ambiguous ownership are rejected',()=>{
 for(const change of [{label:''},{items:null},{items:[{id:'x',label:'A'},{id:'x',label:'B'}]},{items:[{id:'x',label:''}]},{items:[{id:'x',label:'X',children:{}}]},{items:[{id:'x',label:'X',disabled:'yes'}]},{selectedIds:['a']},{expandedIds:['root']},{defaultSelectedIds:['a','b']},{defaultExpandedIds:[1]},{selectionMode:'invented'},{orientation:'horizontal'}]) {
  assert.throws(()=>engine.compileControl('Tree',{...props,...change}),ContractValidationError,JSON.stringify(change));
 }
 const valid=engine.compileControl('Tree',{label:'Layers',items,selectedIds:['a'],onSelectionChange:{$handler:'select'},expandedIds:['root'],onExpandedChange:{$handler:'expand'}});
 assert.equal(valid.state.tree.selectionControlled,true);assert.equal(valid.state.tree.expansionControlled,true);
});
test('Tree: missing required theme leaf and tampered web binding are rejected',()=>{
 const tokens=JSON.parse(fs.readFileSync(new URL('../../../tokens.json',import.meta.url),'utf8'));
 delete tokens.$collections.components.$modes['Mode 1'].tree.focus.ring;
 assert.throws(()=>createContractEngine({tokens}).compileControl('Tree',props));
 const compiled=engine.compileControl('Tree',props),bad=structuredClone(compiled);delete bad.tokenBranch.children.focus.ring;
 assert.throws(()=>createTreeWebBindings(bad));assert.throws(()=>createTreeWebBindings({component:'Tree'}));
});
