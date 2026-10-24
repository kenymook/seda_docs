import test from 'node:test';import assert from 'node:assert/strict';
import {createContractEngine,ContractValidationError} from '../src/index.mjs';import{createTextAreaWebBindings,createWebBindings}from'../src/web.mjs';
const engine=createContractEngine(),base={label:'Комментарий'};
test('TextArea: native uncontrolled, controlled, readOnly ownership and clear contract',()=>{
 for(const props of [base,{...base,defaultValue:'line1\nline2'},{...base,value:'draft',onChange:{$handler:'change'}},{...base,value:'read only',readOnly:true},{...base,value:'x',clearable:true,onChange:{$handler:'change'},onClear:{$handler:'clear'}}])assert.equal(engine.validateInstance('TextArea',props).valid,true);
 for(const props of [{value:'x'},{value:'x',onChange:{$handler:'change'},defaultValue:'y'},{defaultValue:2},{value:'x',readOnly:true,clearable:true},{label:' '},{type:'email'},{children:'hidden value'},{dangerouslySetInnerHTML:{__html:'hidden value'}}])assert.throws(()=>engine.compileControl('TextArea',{...base,...props}),ContractValidationError);
});
test('TextArea: row bounds and ownership reject ignored/ambiguous geometry',()=>{
 for(const props of [{rows:0},{rows:1.5},{rows:-1},{rows:3,autoResize:true,maxRows:2},{maxRows:4},{autoResize:true,maxRows:0},{resize:'both'}])assert.throws(()=>engine.compileControl('TextArea',{...base,...props}),ContractValidationError);
 assert.equal(engine.validateInstance('TextArea',{...base,rows:1,autoResize:true,maxRows:8}).valid,true);
});
test('TextArea: disabled precedence, readOnly and focus are independent facts',()=>{
 assert.equal(engine.compileControl('TextArea',{...base,errorText:'Error',disabled:true}).state.validation,'none');
 assert.equal(engine.compileControl('TextArea',{...base,readOnly:true}).state.tokenState,'read-only');
 const state=engine.compileControl('TextArea',{...base,errorText:'Error',readOnly:true},{interaction:{focused:true}}).state;assert.equal(state.tokenState,'error');assert.equal(state.focusRing,true);
});
test('TextArea: all themes/sizes use own canonical tokens and geometry, profile includes adapter',()=>{
 for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl']){const control=engine.compileControl('TextArea',{...base,size},{theme}),binding=createTextAreaWebBindings(control);assert.equal(binding.attributes['data-seda-contract'],'TextArea');assert.equal(binding.vars['--seda-preset-height'],{s:'24px',m:'32px',l:'40px',xl:'48px'}[size]);assert.ok(binding.evidence.some(item=>item.property==='--text-area-focus-ring'));assert.ok(binding.evidence.some(item=>item.property==='--text-area-surface-read-only'));const bad=structuredClone(control);delete bad.tokenBranch.children.foreground.placeholder;assert.throws(()=>createTextAreaWebBindings(bad));}
 assert.equal(createWebBindings(engine.compile()).controls.TextArea.attributes['data-seda-contract'],'TextArea');assert.equal(engine.audit().valid,true);
});

test('TextArea: plain appearance is explicit and geometry is invariant',()=>{
 for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl']){
  const outlined=engine.compileControl('TextArea',{...base,size},{theme}),plain=engine.compileControl('TextArea',{...base,size,appearance:'plain'},{theme});
  assert.deepEqual(plain.geometry,outlined.geometry);
 }
 assert.throws(()=>engine.compileControl('TextArea',{...base,appearance:'invented'}),ContractValidationError);
});
