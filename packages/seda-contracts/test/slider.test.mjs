import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{createContractEngine,ContractValidationError,loadBundle,createSliderModel,snapSliderValue}from'../src/index.mjs';import{createSliderWebBindings,createWebBindings}from'../src/web.mjs';
const engine=createContractEngine(),handler={$handler:'change'},base={label:'Scale',value:50,onValueChange:handler};
test('Slider: actual discriminated API preserves mode/value/thumb names and typed formatter ownership',()=>{
 for(const props of[base,{...base,formatValue:{$handler:'percent'}},{...base,mode:'range',value:[20,80],thumbLabels:['From','To']}])assert.equal(engine.validateInstance('Slider',props).valid,true);
 for(const patch of[{mode:'range'},{mode:'single',value:[20,80],thumbLabels:['A','B']},{value:[20,80]},{mode:'range',value:[20,80],thumbLabels:['A']},{label:''},{onValueChange:undefined},{defaultValue:50},{state:'focus'},{formatValue:'percent'},{orientation:'vertical'}])assert.throws(()=>engine.compileControl('Slider',{...base,...patch}),ContractValidationError,JSON.stringify(patch));
 const api=engine.api.get('Slider');assert.equal(api.observedDefaults.mode,'single');assert.equal(api.observedDefaults.min,0);assert.equal(api.props.formatValue.handlerReturnsString,true);assert.ok(api.props.mode.enumValues.includes('range'));
 assert.equal(api.discriminatedUnion,true);assert.equal(engine.api.validate('Slider',{...base,value:[20,80]}).length>0,true);assert.equal(engine.api.validate('Slider',{...base,mode:'range',value:[20,80]}).length>0,true);
});
test('Slider: shared numeric grid rejects invalid models and preserves decimal/large steps without mutation',()=>{
 for(const patch of[{value:NaN},{value:Infinity},{min:100},{max:Infinity},{step:0},{step:3},{step:5,value:52},{value:101},{mode:'range',value:[80,20],thumbLabels:['A','B']},{mode:'range',value:[20,80],thumbLabels:['','B']}])assert.throws(()=>engine.compileControl('Slider',{...base,...patch}),ContractValidationError);
 const large=createSliderModel({min:1e15,max:1e15+100,step:1,value:1e15+50});assert.equal(snapSliderValue(large,1e15+51),1e15+51);
 const decimals=createSliderModel({min:-1,max:1,step:.1,value:.2});assert.equal(snapSliderValue(decimals,.3),.3);
 const input=Object.freeze([20,80]),model=createSliderModel({mode:'range',value:input,thumbLabels:['A','B']});assert.equal(snapSliderValue(model,100,0),80);assert.equal(snapSliderValue(model,0,1),20);assert.deepEqual(input,[20,80]);assert.deepEqual(model.values,[20,80]);assert.throws(()=>snapSliderValue(model,NaN));
});
test('Slider: state facts include peer bounds, disabled precedence and explicit unchecked runtime gates',()=>{
 const c=engine.compileControl('Slider',{...base,mode:'range',value:[40,40],thumbLabels:['A','B'],errorText:'Error'},{interaction:{focused:true,active:true}});assert.equal(c.state.tokenState,'error');assert.equal(c.state.focusRing,true);assert.equal(c.state.slider.thumbs[0].max,40);assert.equal(c.state.slider.thumbs[1].min,40);assert.equal(c.state.data,'filled');assert.equal(c.runtimeConformance,'not-checked');assert.ok(c.checks.some(x=>x.check==='slider-keyboard'&&x.status==='not-checked'));
 const disabled=engine.compileControl('Slider',{...base,disabled:true,errorText:'Error'},{interaction:{focused:true}}).state;assert.equal(disabled.validation,'none');assert.equal(disabled.focusRing,false);
});
test('Slider: all profiles export own tokens, documented dimensions and semantic gap provenance',()=>{
 for(const theme of['Light','Dark'])for(const size of['s','m','l','xl']){const c=engine.compileControl('Slider',{...base,size},{theme}),w=createSliderWebBindings(c);assert.equal(w.attributes['data-seda-contract'],'Slider');assert.equal(w.vars['--seda-slider-min-rail-height'],'44px');assert.equal(w.vars['--seda-preset-height'],{s:'24px',m:'32px',l:'40px',xl:'48px'}[size]);assert.ok(w.evidence.some(x=>x.property==='--slider-thumb-border'&&x.chain.length));assert.ok(w.evidence.some(x=>x.property==='--seda-slider-track-height'&&x.source.includes('SLIDER-CONTRACT')));assert.ok(w.evidence.some(x=>x.property==='--status-danger-text'&&x.chain.length));}
 assert.equal(createWebBindings(engine.compile()).controls.Slider.attributes['data-seda-contract'],'Slider');assert.equal(engine.audit().valid,true);
});
test('Slider: missing roles/measurements and collisions cannot silently fall back to static CSS',()=>{
 const c=engine.compileControl('Slider',base);for(const key of['minRailHeight','trackHeight','focusWidth']){const bad=structuredClone(c);delete bad.geometry[key];assert.throws(()=>createSliderWebBindings(bad));}
 const noColor=structuredClone(c);delete noColor.tokenBranch.children.focus.ring;assert.throws(()=>createSliderWebBindings(noColor));
 const bundle=loadBundle(),contract=bundle.contracts.find(c=>c.id==='Slider');delete contract.geometry.minRailHeight;assert.equal(createContractEngine({bundle}).validate().valid,false);
 for(const key of ['minRailHeight','minThumbSize','trackHeight','thumbBorderWidth','focusWidth','headerGap']){const bundle=loadBundle();bundle.contracts.find(c=>c.id==='Slider').geometry[key].value=0;const invalid=createContractEngine({bundle});assert.equal(invalid.validate().valid,false);assert.throws(()=>invalid.compileControl('Slider',base),ContractValidationError);}
 const collision=loadBundle();collision.contracts.find(c=>c.id==='Slider').geometry.height={value:99,unit:'px',source:'specs/inputs/slider.md'};assert.equal(createContractEngine({bundle:collision}).validate().valid,false);
 const mutated=loadBundle();mutated.contracts.find(c=>c.id==='Slider').geometry.minRailHeight.value=52;const changed=createContractEngine({bundle:mutated});assert.equal(createSliderWebBindings(changed.compileControl('Slider',base)).vars['--seda-slider-min-rail-height'],'52px');
 const tokens=JSON.parse(fs.readFileSync(new URL('../../../tokens.json',import.meta.url),'utf8'));delete tokens.$collections.components.$modes['Mode 1'].slider.thumb.border;assert.equal(createContractEngine({tokens}).validate().valid,false);
});
