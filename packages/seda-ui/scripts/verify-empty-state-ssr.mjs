import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {EmptyState} from '../dist/index.js';

const render=props=>renderToStaticMarkup(React.createElement(EmptyState,props));
const action={label:'Retry',onAction:()=>{}};
assert.match(render({title:'No results',reason:'no-results',headingLevel:2,primaryAction:action}),/<h2[^>]*>No results<\/h2>/);
for(const props of [{title:''},{title:'Title',description:' '},{title:'Title',reason:'invented'},{title:'Title',size:'xxl'},{title:'Title',headingLevel:1},{title:'Title',primaryAction:{label:' ',onAction:()=>{}}},{title:'Title',primaryAction:{label:'Retry'}},{title:'Title',secondaryAction:action}])assert.throws(()=>render(props),TypeError,JSON.stringify(props));
console.log('PASS: EmptyState rejects unsupported API values, empty content and incomplete action compositions.');
