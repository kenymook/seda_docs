import test from 'node:test';import assert from 'node:assert/strict';
import {deriveControlGeometry,normalizeControlParameters,defaultControlParameters,controlGeometryDeclarations} from '../src/control-geometry.mjs';
const m=Object.freeze({height:32,font:14,line:20,icon:16,radius:8,border:1,buttonPaddingX:12,fieldPaddingX:10});
test('Control geometry: explicit numeric vectors preserve independent X/Y and the minimum',()=>{
  const base=deriveControlGeometry(m);assert.deepEqual([base.font,base.line,base.icon,base.py,base.height,base.radius,base.buttonPaddingX,base.fieldPaddingX],[14,20,16,5,32,8,12,10]);
  const large=deriveControlGeometry(m,{scale:150,extraPaddingInline:24,extraPaddingBlock:12,radiusScale:1.75});assert.deepEqual([large.font,large.line,large.icon,large.py,large.height,large.radius,large.buttonPaddingX,large.fieldPaddingX],[21,30,24,17,66,14,36,34]);
  const small=deriveControlGeometry(m,{scale:80});assert.equal(small.raw,28);assert.equal(small.height,32);assert.equal(small.constraint,true);assert.equal(deriveControlGeometry(m,{scale:80,preserveMinimumHeight:false}).height,28);
});
test('Control geometry: nested values inherit absolutely, stay frozen and preserve caller data',()=>{
  const parent=normalizeControlParameters({scale:150,extraPaddingInline:12}),input=Object.freeze({extraPaddingBlock:6}),child=normalizeControlParameters(input,parent);assert.deepEqual(child,{...defaultControlParameters,scale:150,extraPaddingInline:12,extraPaddingBlock:6});assert.ok(Object.isFrozen(child));assert.equal(parent.extraPaddingBlock,0);assert.deepEqual(input,{extraPaddingBlock:6});
  assert.equal(normalizeControlParameters({scale:100},parent).scale,100);assert.equal(normalizeControlParameters({radiusScale:1.33}).radiusScale,1.33);assert.equal(deriveControlGeometry(m,{radiusScale:1.33}).radius,10.64);
});
test('Control geometry: invalid authored parameters and presets fail before CSS execution',()=>{
  for(const value of [null,[],new Date(),{scale:79},{scale:201},{scale:NaN},{scale:'100'},{extraPaddingInline:-1},{extraPaddingInline:25},{extraPaddingBlock:13},{radiusScale:.49},{preserveMinimumHeight:1},{unknown:12},{scale:undefined}])assert.throws(()=>normalizeControlParameters(value));
  for(const patch of[{height:0},{line:NaN},{icon:-1},{border:-1},{fieldPaddingX:Infinity},{height:20}])assert.throws(()=>deriveControlGeometry({...m,...patch}));
});
test('Control geometry: CSS expressions share dependency roles and do not author preset numbers',()=>{
  const css=controlGeometryDeclarations();for(const name of ['--seda-preset-height','--seda-preset-font-size','--seda-preset-line-height','--seda-preset-icon-size','--seda-preset-button-padding','--seda-preset-field-padding','--seda-parameter-scale','--seda-parameter-extra-inline','--seda-parameter-extra-block','--seda-parameter-minimum'])assert.ok(css.includes('var('+name+')')||css.includes('var('+name+','));assert.ok(css.includes('round(nearest,'));assert.ok(!css.includes('32px')&&!css.includes('14px'));
});
