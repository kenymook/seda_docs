import test from 'node:test';
import assert from 'node:assert/strict';
import {createContractEngine,ContractValidationError} from '../src/index.mjs';
import {createWebBindings,createTextAreaWebBindings} from '../src/web.mjs';
const engine=createContractEngine();
test('Inline action resolves source line/icon/gap roles and actual transparent token aliases',()=>{
 for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl']){
  const action=engine.compileControl('Button',{variant:'text',size,children:'Очистить'},{theme,controlParameters:{scale:150,extraPaddingInline:14,extraPaddingBlock:6}});
  const profile=engine.compile(undefined,{overrides:{theme,controlSize:size}});
  assert.deepEqual(action.geometry.height,profile.geometry.lineHeight);assert.deepEqual(action.geometry.iconSize,profile.geometry.lineHeight);
  assert.equal(action.geometry.buttonPaddingInline.value,0);assert.equal(action.geometry.borderWidth.value,0);assert.equal(action.geometry.paintBorderWidth.value,.5);assert.equal(action.actionTypography.weight.cssValue,400);
  assert.equal(action.geometry.buttonContentGap.value,{s:2,m:4,l:6,xl:8}[size]);assert.equal(action.parametric.height,Math.round(profile.geometry.lineHeight.value*1.5)+12);assert.equal(action.parametric.buttonPaddingX,14);
  assert.equal(action.tokenBranch.children.surface.hover.cssValue,action.tokenBranch.children.surface.default.cssValue);assert.equal(action.tokenBranch.children.surface.hover.adapter,'inline-transparent-state');assert.equal(action.runtimeConformance,'not-checked');
 }
});
test('Text recipes keep their own geometry and provenance through web bindings',()=>{
 const profile=structuredClone(engine.bundle.profile);profile.recipes.cancel.props.variant='text';
 const compiled=engine.compile(profile,{controlParameters:{scale:150}}),web=createWebBindings(compiled);
 assert.equal(web.recipes.cancel.vars['--seda-control-height'],'30px');assert.equal(web.recipes.save.vars['--seda-control-height'],'42px');assert.equal(web.recipes.cancel.vars['--seda-label-weight'],400);
 assert.ok(web.recipes.cancel.evidence.some(e=>e.property==='--seda-inline-paint-border'&&e.chain.length));
 const bad=structuredClone(compiled);bad.instances.cancel.parametric.inputs.height.value=32;assert.throws(()=>createWebBindings(bad));
});
test('Inline declarations reject arbitrary geometry, missing roles and use on unrelated contracts',()=>{
 for(const mutate of [b=>{b.contracts.find(c=>c.id==='Button').inlineAction.paddingInline.value=5;},b=>{b.contracts.find(c=>c.id==='Button').inlineAction.contentGaps.m.path=['space','missing'];},b=>{b.contracts.find(c=>c.id==='TextArea').inlineAction=b.contracts.find(c=>c.id==='Button').inlineAction;}]){
  const bundle=structuredClone(engine.bundle);mutate(bundle);assert.equal(engine.validate(bundle).valid,false);
 }
});
test('TextArea typography resolves with provenance and clear labels remain semantic inputs',()=>{
 const area=engine.compileControl('TextArea',{label:'Описание',clearable:true,clearLabel:'Clear'}),binding=createTextAreaWebBindings(area);
 assert.equal(binding.vars['--seda-field-weight'],400);assert.ok(binding.evidence.some(e=>e.property==='--seda-field-weight'&&e.chain.length));
 for(const clearLabel of ['', ' ',5])assert.throws(()=>engine.compileControl('TextArea',{label:'Описание',clearable:true,clearLabel}),ContractValidationError);
 const bad=structuredClone(area);delete bad.fieldTypography;assert.throws(()=>createTextAreaWebBindings(bad));
});
