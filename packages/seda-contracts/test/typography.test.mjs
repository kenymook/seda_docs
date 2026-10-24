import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import{createContractEngine,createTokenResolver,compileTypography,deriveTypography,createTypographyBindings,typographyRoles,validateTypographyScale}from'../src/index.mjs';
const tokens=JSON.parse(fs.readFileSync(new URL('../../../tokens.json',import.meta.url),'utf8'));
test('typography semantic roles resolve real h1/h2/h3 and title1/2/3 tokens, not obsolete documentation names',()=>{
 for(const theme of ['Light','Dark']){const type=compileTypography(createTokenResolver(tokens),{theme});assert.equal(Object.keys(type.roles).length,23);for(const [role,[token,variant]] of Object.entries(typographyRoles)){const actual=type.roles[role],raw=tokens.$collections.foundation.$modes['Mode 1'].font[token][variant];assert.equal(actual.size.value,raw.size.$value);assert.equal(actual.lineHeight.value,raw.lineHeight.$value);assert.equal(actual.letterSpacing.value,raw.letterSpacing.$value);assert.ok(actual.size.chain.some(step=>step.path.includes(token)));}assert.equal(type.roles['heading/section'].size.value,20);assert.equal(type.roles['display/medium'].size.value,40);assert.equal(type.family.value,'Inter');}
});
test('shared compiler and web bindings expose all typography role provenance without depending on control size',()=>{
 const engine=createContractEngine();for(const theme of ['Light','Dark'])for(const controlSize of ['s','m','l','xl']){const p=engine.compile(engine.bundle.profile,{overrides:{theme,controlSize}}),binding=createTypographyBindings(p.typography.roles);assert.equal(binding.vars['--seda-type-heading-page-size'],'24px');assert.equal(binding.vars['--seda-type-heading-page-weight'],600);assert.equal(binding.vars['--seda-type-heading-page-spacing'],'0px');assert.equal(binding.evidence.length,115);assert.ok(binding.evidence.every(e=>e.source==='foundation/typography.md'));}
});
test('typography scale preserves fractional metrics, tracking and line-height ratio; important text respects its readable minimum',()=>{
 const type=compileTypography(createTokenResolver(tokens));for(const scale of [80,100,115,150,200])for(const role of Object.keys(typographyRoles)){const d=deriveTypography(type,role,scale);assert.ok(d.size>=d.base.minimumSize);assert.ok(Math.abs(d.lineHeight/d.size-d.base.lineHeight.value/d.base.size.value)<1e-10);assert.ok(Math.abs(d.letterSpacing-d.base.letterSpacing.value*d.size/d.base.size.value)<1e-10);}
 const heading=deriveTypography(type,'heading/section',115);assert.equal(heading.size,23);assert.equal(heading.lineHeight,36.8);assert.equal(deriveTypography(type,'body/default',80).size,12);assert.equal(deriveTypography(type,'body/default',80).clamped,true);assert.equal(deriveTypography(type,'caption/micro',80).size,8);
});
test('typography rejects unsupported scale, role, absent token and malformed metrics',()=>{
 for(const value of [0,79.99,200.01,Infinity,NaN,'100',null,{}])assert.throws(()=>validateTypographyScale(value));
 const type=compileTypography(createTokenResolver(tokens));for(const role of ['toString','heading/hero','__proto__',''])assert.throws(()=>deriveTypography(type,role));
 for(const [key,value]of [['size',0],['lineHeight',1],['weight','UltraBold']]){const copy=structuredClone(tokens);copy.$collections.foundation.$modes['Mode 1'].font.h2.strong[key].$value=value;assert.throws(()=>compileTypography(createTokenResolver(copy)));}
 const missing=structuredClone(tokens);delete missing.$collections.foundation.$modes['Mode 1'].font.h2;assert.throws(()=>compileTypography(createTokenResolver(missing)));
});
test('typography compilation follows token mutations in both metrics and provenance instead of duplicating presets',()=>{
 const copy=structuredClone(tokens);copy.$collections.foundation.$modes['Mode 1'].font.h2.strong.size.$value=21;copy.$collections.foundation.$modes['Mode 1'].font.h2.strong.lineHeight.$value=33;
 const type=compileTypography(createTokenResolver(copy));assert.equal(deriveTypography(type,'heading/section',150).size,31.5);assert.equal(createTypographyBindings(type).vars['--seda-type-heading-section-line'],'33px');
});
