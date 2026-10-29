import test from 'node:test';
import assert from 'node:assert/strict';
import {createContractEngine,ContractValidationError} from '../src/index.mjs';
const engine=createContractEngine(), handler={$handler:'owner.change'};
test('Chip checks control modes and required accessible state',()=>{
 for(const props of [{label:'Filter'},{label:'Filter',control:'remove',removeLabel:'Remove',onRemove:handler},{label:'Filter',control:'expand',expanded:false,onOpenChange:handler},{label:'Filter',control:'select',selected:false,onSelectedChange:handler}]) assert.equal(engine.validateInstance('Chip',props).valid,true,JSON.stringify(engine.validateInstance('Chip',props)));
 for(const props of [{label:''},{label:'A',control:'remove',onRemove:handler},{label:'A',control:'remove',removeLabel:'Remove'},{label:'A',control:'expand',expanded:false},{label:'A',control:'expand',onOpenChange:handler},{label:'A',control:'select',selected:false},{label:'A',control:'select',onSelectedChange:handler}]) assert.throws(()=>engine.compileControl('Chip',props),ContractValidationError);
});
test('Chip compiler resolves both themes, sizes and variants and defers browser checks',()=>{
 for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl'])for(const variant of ['default','filled','selected']){
 const c=engine.compileControl('Chip',{label:'Filter',size,variant},{theme,controlParameters:{scale:150,extraPaddingInline:12,extraPaddingBlock:6,radiusScale:1.5}});
 assert.ok(c.parametric.height>=c.geometry.height.value);assert.equal(c.runtimeConformance,'not-checked');assert.ok(c.checks.filter(x=>x.layer==='browser').every(x=>x.status==='not-checked'));
 }
});
test('Selected and disabled Chip take precedence over hover and active',()=>{
 const base={label:'Filter',control:'select',selected:true,onSelectedChange:handler};
 for(const interaction of [{hovered:true},{active:true},{focused:true}]) assert.equal(engine.compileControl('Chip',base,{interaction}).state.tokenState,'selected');
 const c=engine.compileControl('Chip',{...base,disabled:true},{interaction:{focused:true,hovered:true}});assert.equal(c.state.tokenState,'disabled');assert.equal(c.state.focusRing,false);
});
