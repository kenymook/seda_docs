import assert from 'node:assert/strict';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {Pagination} from '../dist/index.js';
const h=React.createElement,base={label:'Pages',page:1,pageCount:0,onPageChange:()=>{}};
let html=renderToStaticMarkup(h(Pagination,base));assert.match(html,/aria-label="Pages"/);assert.equal((html.match(/disabled=""/g)||[]).length,2);assert.doesNotMatch(html,/aria-current/);
html=renderToStaticMarkup(h(Pagination,{...base,pageCount:1}));assert.equal((html.match(/aria-current="page"/g)||[]).length,1);assert.equal((html.match(/disabled=""/g)||[]).length,2);
html=renderToStaticMarkup(h(Pagination,{...base,pageCount:10,page:5,variant:'prev-next'}));assert.doesNotMatch(html,/aria-current/);assert.equal((html.match(/<button/g)||[]).length,2);
for(const invalid of [{page:0},{pageCount:-1},{page:2},{pageCount:1.5},{label:''},{variant:'invented'},{onPageChange:null}])assert.throws(()=>renderToStaticMarkup(h(Pagination,{...base,...invalid})),TypeError);
console.log('PASS: empty and single-page bounds, compact mode and invalid inputs');
