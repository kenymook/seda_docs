import test from 'node:test';import assert from 'node:assert/strict';import {createContractEngine,ContractValidationError} from '../src/index.mjs';
const engine=createContractEngine(), action={label:'Retry',onAction:{$handler:'retry'}};
test('EmptyState validates composition against the real public API',()=>{
 assert.equal(engine.validate().valid,true);
 for(const props of [{title:'Empty'},{title:'No results',reason:'no-results',primaryAction:action},{title:'Error',reason:'error',primaryAction:action,secondaryAction:{label:'Help',onAction:{$handler:'help'}}}])assert.equal(engine.validateInstance('EmptyState',props).valid,true,JSON.stringify(engine.validateInstance('EmptyState',props).issues));
 for(const props of [{title:''},{title:'Title',description:' '},{title:'Title',secondaryAction:action},{title:'Title',primaryAction:{label:'Retry'}},{title:'Title',reason:'unknown'},{title:'Title',size:'xxl'}])assert.throws(()=>engine.compileComposition('EmptyState',props),ContractValidationError,JSON.stringify(props));
});
test('EmptyState resolves its three applied color roles without inventing control geometry',()=>{
 for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl']){const result=engine.compileComposition('EmptyState',{title:'No results',size},{theme});assert.equal(result.kind,'composition');assert.equal(result.geometry,undefined);assert.equal(result.parametric,undefined);assert.equal(result.runtimeConformance,'not-checked');assert.equal(result.checks.find(c=>c.check==='component-token-binding').status,'not-checked');assert.equal(result.tokenRequirements.length,3);assert.ok(result.tokenBranch.children.title.foreground.chain.length>0);}
 assert.throws(()=>engine.compileControl('EmptyState',{title:'No results'}),ContractValidationError);
 assert.throws(()=>engine.compileComposition('Button',{children:'OK'}),ContractValidationError);
});
test('missing composition token and missing control interaction are rejected',()=>{
 const bundle=structuredClone(engine.bundle);bundle.contracts.find(c=>c.id==='EmptyState').tokenRequirements.default.push(['title','missing']);const broken=createContractEngine({bundle});assert.equal(broken.validate().valid,false);assert.throws(()=>broken.compileComposition('EmptyState',{title:'Empty'}),ContractValidationError);
 const other=structuredClone(engine.bundle);other.contracts.find(c=>c.id==='Button').states.interaction=[];assert.equal(createContractEngine({bundle:other}).validate().valid,false);
});
