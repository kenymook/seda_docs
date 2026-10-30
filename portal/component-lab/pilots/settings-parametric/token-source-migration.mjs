import migration from './semantic-palette-migration.mjs';
import {createTokenResolver} from '../../../../packages/seda-contracts/src/tokens.mjs';
import {applyWorkbenchEdits,designCatalog,tokenKey} from './token-workbench-model.mjs';

export function compatibleSourceHash(currentHash){
 return currentHash===migration.toHash?migration.fromHash:currentHash;
}

export function previousTokenSource(tokens,currentHash){
 if(currentHash!==migration.toHash)throw Error('Unsupported migration target');
 const previous=structuredClone(tokens);
 for(const {mode,path,from,to} of migration.aliases){
  let node=previous.$collections.semantic.$modes[mode];
  for(const part of path.split('/'))node=node?.[part];
  if(node?.$value!==to)throw Error('Migration target differs: '+mode+'/'+path);
  node.$value=from;
 }
 return previous;
}

/** Project a known older document into the current source, without writing it.
 * If an owner changed a shared semantic parent, carry that choice to every
 * former alias. This preserves appearance while making later edits independent.
 * Unknown versions are returned unchanged so existing mismatch guards apply. */
export function migrateTokenDocument(document,tokens,currentHash){
 if(!document||currentHash!==migration.toHash||document.sourceTokensSha256!==migration.fromHash)return document;
 if(!document.edits||typeof document.edits!=='object'||Array.isArray(document.edits))throw Error('Invalid source migration document');
 const previous=previousTokenSource(tokens,currentHash);
 if(!Object.keys(document.edits).length)return {...document,sourceTokensSha256:currentHash,edits:{}};
 const resolved=applyWorkbenchEdits(previous,document.edits,designCatalog(previous));
 const resolver=createTokenResolver(resolved),edits={...document.edits};
 for(const {mode,path,to} of migration.aliases){
  const key=tokenKey('semantic',mode,path);
  if(Object.hasOwn(edits,key))continue;
  const terminal=resolver.resolve({collection:'semantic',path:path.split('/'),expectedType:'color'},{theme:mode}).chain.at(-1);
  if(terminal?.collection!=='foundation'||terminal.path[0]!=='color')throw Error('Migration needs a palette colour: '+key);
  const alias='{'+terminal.path.join('.')+'}';
  if(alias!==to)edits[key]=alias;
 }
 applyWorkbenchEdits(tokens,edits);
 return {...document,sourceTokensSha256:currentHash,edits};
}
