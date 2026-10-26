import test from 'node:test';import assert from 'node:assert/strict';
import {createContractEngine,ContractValidationError} from '../src/index.mjs';
import {createWebBindings,createNumberFieldWebBindings,WebBindingError} from '../src/web.mjs';
const engine=createContractEngine(),parameters={scale:150,extraPaddingInline:24,extraPaddingBlock:12,radiusScale:1.25};
test('Parametric compiler: all eight real profiles keep preset provenance and execute common parameters',()=>{
  for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl']){
    const c=engine.compile(undefined,{overrides:{theme,controlSize:size},controlParameters:parameters}),b=createWebBindings(c),height={s:56,m:66,l:76,xl:86}[size];
    assert.equal(c.geometry.height.value,{s:24,m:32,l:40,xl:48}[size]);assert.equal(c.parametric.height,height);assert.equal(c.parametric.inputs.height.value,c.geometry.height.value);assert.notEqual(c.parametric.inputs.height,c.geometry.height);assert.equal(c.parametric.runtimeConformance,'not-checked');
    assert.equal(b.recipes.save.vars['--seda-control-height'],height+'px');assert.equal(b.recipes.save.vars['--seda-control-button-padding-inline'],c.geometry.buttonPaddingInline.value+24+'px');assert.equal(b.recipes.projectName.vars['--seda-control-padding-inline'],'34px');
    assert.equal(b.controls.NumberField.vars['--seda-control-height'],height+'px');assert.equal(b.controlParameters.scale,150);assert.ok(b.recipes.save.evidence.some(e=>e.adapter==='shared-control-geometry'&&e.inputs.line.value===c.geometry.lineHeight.value&&e.parameters.scale===150));assert.equal(new Set(b.recipes.save.evidence.map(e=>e.property)).size,b.recipes.save.evidence.length);
  }
});
test('Parametric compiler: individual local size wins; existing no-parameter output stays canonical',()=>{
  const base=engine.compile();assert.equal(Object.hasOwn(base,'parametric'),false);assert.equal(base.geometry.height.value,32);
  const local=engine.compileControl('NumberField',{label:'Width',size:'s',value:'12',onValueChange:{$handler:'change'}},{controlParameters:parameters});assert.equal(local.geometry.height.value,24);assert.equal(local.parametric.height,56);assert.equal(createNumberFieldWebBindings(local).vars['--seda-control-height'],'56px');
  const p=engine.provenance();for(const name of ['control-geometry.mjs','control-geometry.d.mts'])assert.match(p.files['packages/seda-contracts/src/'+name],/^[a-f0-9]{64}$/);
});
test('Parametric compiler: invalid configuration, stale calculations and false origins are rejected',()=>{
  assert.throws(()=>engine.compile(undefined,{controlParameters:{scale:0}}),error=>error instanceof ContractValidationError&&error.issues.some(i=>i.code==='CONTROL_PARAMETERS_INVALID'));
  const c=engine.compile(undefined,{controlParameters:parameters});
  for(const mutate of [v=>v.parametric.height++,v=>v.parametric.inputs.height.value=0,v=>v.parametric.parameters.scale=0,v=>v.parametric.runtimeConformance='passed']){const copy=structuredClone(c);mutate(copy);assert.throws(()=>createWebBindings(copy),WebBindingError);}
  const copy=structuredClone(c.controls.NumberField);copy.parametric.height++;assert.throws(()=>createNumberFieldWebBindings(copy),WebBindingError);
});
