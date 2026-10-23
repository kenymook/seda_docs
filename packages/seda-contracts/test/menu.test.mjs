import test from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createContractEngine,ContractValidationError} from '../src/index.mjs';
import {createDropdownMenuWebBindings,WebBindingError,createWebBindings} from '../src/web.mjs';
const engine=createContractEngine();
const action={id:'open',label:'Открыть',onSelect:{$handler:'project.open'},shortcut:{key:'o',modifiers:['Alt'],label:'Alt+O'}};
const items=[{type:'group',id:'group',label:'Проект',items:[action,{id:'locked',label:'Недоступно',disabled:true,onSelect:{$handler:'project.locked'}}]},{type:'separator',id:'separator'},{id:'delete',label:'Удалить',danger:true,onSelect:{$handler:'project.confirmDelete'}}];
const props={triggerLabel:'Действия проекта',items};

test('DropdownMenu: actual source API/defaults and five variants across eight profiles',()=>{
 const api=engine.api.get('DropdownMenu');
 assert.equal(api.refElement,'HTMLDivElement');
 assert.deepEqual(api.observedDefaults,{iconOnly:false,variant:'menu',disabled:false,shortcutScope:'menu',side:'bottom',align:'start',size:'m'});
 for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const variant of ['menu','with-icons','with-shortcuts','grouped','danger']){
  const compiled=engine.compileControl('DropdownMenu',{...props,size,variant},{theme});
  assert.equal(compiled.geometry.height.value,engine.bundle.system.sizes[size].height.value);
  assert.equal(compiled.runtimeConformance,'not-checked');assert.equal(compiled.state.menu.open,false);
  assert.equal(compiled.checks.filter(c=>c.layer==='browser').length,5);
  assert.ok(compiled.checks.filter(c=>c.layer==='browser').every(c=>c.status==='not-checked'));
 }
});
test('DropdownMenu: malformed/duplicate/nested items and fake shortcut actions are rejected',()=>{
 for(const bad of [
  null,1,[action,action],[{...action,label:' '}],[{id:'no-handler',label:'No handler'}],
  [{...action,onSelect:{$slot:'not-handler'}}],
  [{...action,shortcut:{key:'o',label:'Alt+O',modifiers:['Option']}}],
  [{...action,shortcut:{key:'o',label:'Alt+O',modifiers:['Alt','Alt']}}],
  [action,{...action,id:'other'}],
  [{type:'group',id:'g',label:'Group',items:[{type:'group',id:'nested',label:'Nested',items:[action]}]}],
  [{type:'group',id:'g',label:'Group',items:[null]}],
  [{type:'separator',id:'same'},{...action,id:'same'}],
 ]){
  const input={...props,items:bad};assert.equal(engine.validateInstance('DropdownMenu',input).valid,false,JSON.stringify(bad));
  assert.throws(()=>engine.compileControl('DropdownMenu',input),ContractValidationError);
 }
});
test('DropdownMenu: controlled ownership, icon trigger and nested opaque types are enforced',()=>{
 for(const change of [
  {triggerLabel:' '},{triggerLabel:{$slot:'name'}},{variant:'invented'},{size:'huge'},
  {open:true},{open:true,defaultOpen:false,onOpenChange:{$handler:'open'}},
  {open:'yes',onOpenChange:{$handler:'open'}},{iconOnly:true},
  {shortcutScope:'provider',items:[{...action,shortcut:{key:'o',label:'O',modifiers:[]}}]},
  {items:[{...action,id:{$slot:'bad'}}]},
 ]){
  assert.equal(engine.validateInstance('DropdownMenu',{...props,...change}).valid,false,JSON.stringify(change));
 }
 assert.equal(engine.validateInstance('DropdownMenu',{...props,iconOnly:true,triggerIcon:{$slot:'actions-icon'}}).valid,true);
 assert.equal(engine.validateInstance('DropdownMenu',{...props,open:true,onOpenChange:{$handler:'project.openChanged'}}).valid,true);
});
test('DropdownMenu: authored open/unavailability and item snapshots match documented ownership',()=>{
 for(const sample of [
  {input:{},open:false,disabled:false},
  {input:{defaultOpen:true},open:true,disabled:false},
  {input:{open:true,onOpenChange:{$handler:'change'}},open:true,disabled:false},
  {input:{defaultOpen:true,disabled:true},open:false,disabled:true},
  {input:{defaultOpen:true,items:[]},open:false,disabled:true},
  {input:{defaultOpen:true,items:[{...action,disabled:true}]},open:true,disabled:false},
 ]){
  const {state}=engine.validateInstance('DropdownMenu',{...props,...sample.input});
  assert.equal(state.menu.open,sample.open);assert.equal(state.menu.unavailable,sample.disabled);
  assert.equal(state.availability,sample.disabled?'disabled':'enabled');
 }
 const state=engine.compileControl('DropdownMenu',props).state;
 assert.equal(engine.validateInstance('DropdownMenu',props,{interaction:{active:true}}).state.tokenState,'active');
 assert.deepEqual(state.menu.items,[{id:'open',state:'default',danger:false},{id:'locked',state:'disabled',danger:false},{id:'delete',state:'default',danger:true}]);
});
test('DropdownMenu: required rules and actual used color roles cannot be removed',()=>{
 for(const check of ['menu-items','menu-open']){
  const bundle=structuredClone(engine.bundle);const c=bundle.contracts.find(c=>c.id==='DropdownMenu');c.rules=c.rules.filter(r=>r.check!==check);
  assert.ok(engine.validate(bundle).issues.some(i=>i.code==='REQUIRED_RULE_MISSING'));
 }
 const tokens=JSON.parse(fs.readFileSync(new URL('../../../tokens.json',import.meta.url),'utf8'));
 delete tokens.$collections.components.$modes['Mode 1']['dropdown-menu'].item.surface.disabled;
 const changed=createContractEngine({tokens});
 assert.equal(changed.validate().valid,false);assert.throws(()=>changed.compileControl('DropdownMenu',props),ContractValidationError);
});
test('DropdownMenu: browser-safe web binding checks geometry/colors/semantic adapter provenance',()=>{
 const control=engine.compileControl('DropdownMenu',{...props,size:'l'},{theme:'Dark'}),binding=createDropdownMenuWebBindings(control);
 assert.equal(binding.attributes['data-seda-contract'],'DropdownMenu');
 assert.equal(binding.vars['--dropdown-menu-surface-default'],control.tokenBranch.children.surface.default.cssValue);
 assert.equal(binding.vars['--seda-preset-height'],control.geometry.height.cssValue);
 assert.ok(binding.evidence.find(e=>e.property==='--focus-ring').chain.length>0);
 assert.ok(binding.evidence.find(e=>e.property==='--status-danger-text').chain.length>0);
 for(const corrupt of [d=>{d.geometry.height.value=-1;},d=>{delete d.tokenBranch.children.item.surface.hover;},d=>{delete d.semanticAdapters['--focus-ring'];}]){
  const data=structuredClone(control);corrupt(data);assert.throws(()=>createDropdownMenuWebBindings(data),WebBindingError);
 }
 const compiled=engine.compile();assert.equal(createWebBindings(compiled).controls.DropdownMenu.attributes['data-seda-contract'],'DropdownMenu');
 assert.equal(engine.audit().valid,true);
});
