import test from'node:test';import assert from'node:assert/strict';
import{createContractEngine,createNumberFieldModel,stepNumberFieldValue,ContractValidationError}from'../src/index.mjs';
import{createNumberFieldWebBindings,createWebBindings}from'../src/web.mjs';
const engine=createContractEngine(),base={label:'Width',value:'12',onValueChange:{$handler:'change'}};
test('NumberField: actual controlled raw API and finite configuration are executable, not a static demo',()=>{
 assert.equal(engine.audit().valid,true);assert.equal(engine.validate().valid,true);
 for(const value of['','-','1e-','Mixed','NaN','Infinity','1,5','0','1.25','1e15'])assert.equal(engine.validateInstance('NumberField',{...base,value}).valid,true,value);
 for(const patch of[{value:12},{defaultValue:'12'},{onChange:{$handler:'change'}},{onValueChange:undefined},{min:2,max:1},{step:0},{step:Infinity},{min:NaN},{type:'number'},{role:'textbox'},{'aria-valuenow':0},{label:''}])assert.throws(()=>engine.compileControl('NumberField',{...base,...patch}),ContractValidationError,JSON.stringify(patch));
});
test('NumberField: raw/Mixed are not zero; decimal and large steps remain representable and immutable',()=>{
 for(const value of['','-','1e-','abc','1e309','1,5']){const model=createNumberFieldModel({value});assert.equal(model.value,null);assert.equal(stepNumberFieldValue(model,'ArrowUp'),undefined);}
 const mixed=Object.freeze(createNumberFieldModel({value:'',mixed:true,min:0,max:100}));assert.equal(mixed.numericState,'mixed');assert.equal(stepNumberFieldValue(mixed,'ArrowDown'),undefined);assert.equal(stepNumberFieldValue(mixed,'Home'),'0');assert.equal(stepNumberFieldValue(mixed,'End'),'100');
 assert.equal(stepNumberFieldValue(createNumberFieldModel({value:'.1',step:.2}),'ArrowUp'),'0.3');assert.equal(stepNumberFieldValue(createNumberFieldModel({value:'-.1',step:.2}),'ArrowDown'),'-0.3');
 assert.equal(stepNumberFieldValue(createNumberFieldModel({value:'1000000000000050',step:1}),'ArrowUp'),'1000000000000051');
 assert.equal(stepNumberFieldValue(createNumberFieldModel({value:'0.5',step:.1}),'PageDown'),'-0.5');assert.equal(stepNumberFieldValue(createNumberFieldModel({value:'1e308',step:1e308}),'PageUp'),undefined);
 assert.equal(stepNumberFieldValue(createNumberFieldModel({value:'1e308',step:1e308,max:1.5e308}),'PageUp'),'1.5e+308');
 assert.equal(stepNumberFieldValue(createNumberFieldModel({value:'3',min:0,max:3}),'ArrowUp'),undefined);assert.equal(stepNumberFieldValue(createNumberFieldModel({value:'2.33',step:.1}),'ArrowUp'),'2.43');
});
test('NumberField: state distinguishes raw data, readOnly/disabled and runtime conformance',()=>{
 const c=engine.compileControl('NumberField',{...base,value:'-',readOnly:true,errorText:'Not committed'},{interaction:{focused:true}});assert.equal(c.state.availability,'read-only');assert.equal(c.state.numberField.numericState,'incomplete');assert.equal(c.state.focusRing,true);assert.equal(c.state.validation,'error');assert.equal(c.runtimeConformance,'not-checked');assert.ok(c.checks.some(x=>x.check==='number-field-keyboard'&&x.status==='not-checked'));
 const d=engine.compileControl('NumberField',{...base,disabled:true,errorText:'Not committed'},{interaction:{focused:true}});assert.equal(d.state.validation,'none');assert.equal(d.state.focusRing,false);
});
test('NumberField: explicit TextField visual alias follows all eight profiles and fails on missing source roles',()=>{
 for(const theme of['Light','Dark'])for(const size of['s','m','l','xl']){const c=engine.compileControl('NumberField',{...base,size},{theme}),w=createNumberFieldWebBindings(c);assert.equal(w.attributes['data-seda-contract'],'NumberField');assert.equal(w.vars['--seda-preset-height'],{s:'24px',m:'32px',l:'40px',xl:'48px'}[size]);assert.ok(w.evidence.some(x=>x.property==='--text-field-border-focus'&&x.chain.length>1));const missing=structuredClone(c);delete missing.tokenBranch.children.border.focus;assert.throws(()=>createNumberFieldWebBindings(missing));}
 assert.equal(createWebBindings(engine.compile()).controls.NumberField.attributes['data-seda-contract'],'NumberField');
});
