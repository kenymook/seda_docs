import test from 'node:test';import assert from 'node:assert/strict';import{createContractEngine,ContractValidationError}from'../src/index.mjs';
const engine=createContractEngine(),base={label:'Pages',page:1,pageCount:10,onPageChange:{$handler:'page.change'}};
test('Pagination validates controlled page bounds and labels',()=>{
 for(const props of [base,{...base,page:1,pageCount:0},{...base,page:10},{...base,variant:'prev-next'}])assert.equal(engine.validateInstance('Pagination',props).valid,true,JSON.stringify(engine.validateInstance('Pagination',props)));
 for(const invalid of [{page:0},{page:11},{pageCount:-1},{pageCount:1.5},{page:2,pageCount:0},{label:''},{onPageChange:undefined},{previousLabel:''},{variant:'unknown'}])assert.throws(()=>engine.compileControl('Pagination',{...base,...invalid}),ContractValidationError,JSON.stringify(invalid));
});
test('Pagination compiles color and geometry in both themes and keeps browser checks deferred',()=>{
 for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const variant of ['numbered','prev-next']){const c=engine.compileControl('Pagination',{...base,size,variant},{theme,controlParameters:{scale:150,extraPaddingInline:12,extraPaddingBlock:6,radiusScale:1.5}});assert.ok(c.parametric.height>=c.geometry.height.value);assert.equal(c.runtimeConformance,'not-checked');assert.ok(c.checks.filter(x=>x.layer==='browser').every(x=>x.status==='not-checked'));}
});
test('Pagination state covers boundaries, loading, and retained focus',()=>{
 let state=engine.compileControl('Pagination',base).state;assert.equal(state.pagination.previousAvailable,false);assert.equal(state.pagination.nextAvailable,true);
 state=engine.compileControl('Pagination',base,{interaction:{active:true}}).state;assert.equal(state.tokenState,'active');
 state=engine.compileControl('Pagination',{...base,page:10}).state;assert.equal(state.pagination.previousAvailable,true);assert.equal(state.pagination.nextAvailable,false);
 state=engine.compileControl('Pagination',{...base,loading:true},{interaction:{focused:true}}).state;assert.equal(state.pagination.nextAvailable,false);assert.equal(state.focusRing,false);assert.equal(state.tokenState,'disabled');
 state=engine.compileControl('Pagination',{...base,loading:true,retainFocusOnDisabled:true},{interaction:{focused:true}}).state;assert.equal(state.focusRing,true);assert.equal(state.pagination.previousAvailable,false);
 state=engine.compileControl('Pagination',{...base,pageCount:0}).state;assert.equal(state.pagination.nextAvailable,false);
});
test('Pagination rejects a missing required token rather than silently falling back',()=>{
 const bundle=structuredClone(engine.bundle);
 const contract=bundle.contracts.find(item=>item.id==='Pagination');
 contract.tokenRequirements.numbered.push(['item','surface','not-present']);
 const broken=createContractEngine({bundle});
 assert.equal(broken.validate().valid,false);
 assert.throws(()=>broken.compileControl('Pagination',base),ContractValidationError);
});
