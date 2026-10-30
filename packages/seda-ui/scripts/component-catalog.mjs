import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';import ts from 'typescript';
import {componentNames} from '../../seda-contracts/src/registry.mjs';
import {createComponentCatalog} from './component-catalog-model.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export function catalogSourcePath(root,file){
 const resolved=path.resolve(root,file),relative=path.relative(root,resolved);
 if(!file||path.isAbsolute(file)||relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))throw Error('Catalog source must stay inside repository: '+file);
 return resolved;
}
async function below(dir){const files=[];for(const item of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())files.push(...await below(file));else if(item.isFile())files.push(file);}return files.sort();}
export function previewRegistrations(text,file){
 const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let registry;
 for(const statement of source.statements)if(ts.isVariableStatement(statement))for(const declaration of statement.declarationList.declarations)if(declaration.name.getText(source)==='studioPreviews')registry=declaration.initializer;
 while(registry&&(ts.isSatisfiesExpression(registry)||ts.isAsExpression(registry)||ts.isParenthesizedExpression(registry)))registry=registry.expression;
 if(!registry||!ts.isObjectLiteralExpression(registry))throw Error('Studio previews need an explicit literal registry');
 return registry.properties.map(property=>{
  if(!ts.isPropertyAssignment(property)||!ts.isStringLiteral(property.name)||!ts.isArrowFunction(property.initializer))throw Error('Opaque Studio preview registration');
  return {id:property.name.text,surface:'Studio',path:file,line:source.getLineAndCharacterOfPosition(property.getStart(source)).line+1};
 });
}
export async function generateComponentCatalog({repoRoot,tokens,tokensSha256}){
 const relative=file=>path.relative(repoRoot,file).split(path.sep).join('/'),sourceFiles=new Set();
 const read=async file=>{sourceFiles.add(file);return fs.readFile(file);};
 const library=path.join(repoRoot,'packages/seda-ui'),entry=path.join(library,'src/index.ts'),publicIndex=(await read(entry)).toString();
 await read(path.join(library,'scripts/component-catalog.mjs'));await read(path.join(library,'scripts/component-catalog-model.mjs'));
 const configPath=path.join(library,'tsconfig.json'),config=ts.readConfigFile(configPath,ts.sys.readFile);if(config.error)throw Error('Invalid public UI tsconfig');
 sourceFiles.add(configPath);const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,library),program=ts.createProgram(parsed.fileNames,parsed.options),checker=program.getTypeChecker();
 const modules=[];
 for(const match of publicIndex.matchAll(/export \* from ["']\.\/components\/([^"']+)["']/g)){
  const name=match[1],resolved=ts.resolveModuleName('./components/'+name,entry,parsed.options,ts.sys).resolvedModule;
  if(!resolved)throw Error('Unresolved public component: '+name);
  const source=program.getSourceFile(resolved.resolvedFileName),symbol=source&&checker.getSymbolAtLocation(source);if(!symbol)throw Error('Missing public module symbol: '+name);
  const exports=checker.getExportsOfModule(symbol).filter(item=>{const target=item.flags&ts.SymbolFlags.Alias?checker.getAliasedSymbol(item):item;return !!(target.flags&ts.SymbolFlags.Value);}).map(item=>item.name).sort();
  const files=await below(path.join(library,'src/components',name)),parts=[];for(const file of files)parts.push([relative(file),hash(await read(file))]);
  modules.push({name,path:relative(resolved.resolvedFileName),exports,sha256:hash(JSON.stringify(parts))});
 }
 const specs=[];for(const file of await below(path.join(repoRoot,'specs'))){if(!file.endsWith('.md')||path.basename(file)==='component-spec-template.md')continue;const text=(await read(file)).toString();specs.push({id:path.basename(file,'.md'),title:text.match(/^#\s+(.+)$/m)?.[1]?.trim()??path.basename(file,'.md'),path:relative(file),authoredStatus:text.match(/\*\*Status\*\*\s*·\s*([^\r\n]+)/)?.[1]?.trim()??null,sha256:hash(text)});}
 const contractFiles=(await below(path.join(repoRoot,'packages/seda-contracts/contracts'))).filter(file=>file.endsWith('.json')),contractIds=contractFiles.map(file=>path.basename(file,'.json')).sort();
 if(JSON.stringify(contractIds)!==JSON.stringify([...componentNames].sort()))throw Error('Contract files disagree with registry');for(const file of contractFiles)await read(file);await read(path.join(repoRoot,'packages/seda-contracts/src/registry.mjs'));
 const previewPath='portal/component-lab/pilots/settings-parametric/StudioPreviews.tsx',previews=previewRegistrations((await read(path.join(repoRoot,previewPath))).toString(),previewPath);
 const relationPath=path.join(library,'component-relations.json'),relations=JSON.parse(await read(relationPath));if(relations.schemaVersion!==1)throw Error('Unknown component relations schema');
 for(const relation of Object.values(relations.entries))for(const doc of relation.foundationDocs??[])await read(catalogSourcePath(repoRoot,doc));
 for(const evidence of [...Object.values(relations.recordedVisualEvidence).flat(),...relations.relatedPlatformEvidence]){if(!evidence.path||!evidence.scope)throw Error('Review needs a bounded source');const bytes=await read(catalogSourcePath(repoRoot,evidence.path));evidence.sha256=hash(bytes);}
 const legacyPath='reports/component-registry.md',legacy=(await read(path.join(repoRoot,legacyPath))).toString(),legacyAliases=[];
 for(const line of legacy.split(/\r?\n/)){const cells=line.split('|').map(item=>item.trim());const spec=cells[2]?.match(/`(specs\/[^`]+\.md)`/)?.[1];if(!spec||!cells[6]||cells[6]==='-')continue;legacyAliases.push({id:path.posix.basename(spec,'.md'),label:cells[6],source:legacyPath,scope:'Historical Figma naming; no runtime alias inferred.'});}
 const packageJson=JSON.parse(await read(path.join(library,'package.json')));
 for(const file of await below(path.join(library,'src')))await read(file);
 const sources=Object.fromEntries(await Promise.all([...sourceFiles].sort().map(async file=>[relative(file),hash(await fs.readFile(file))])));
 const catalog=createComponentCatalog({specs,modules,contractIds,tokenBranches:Object.keys(tokens.$collections.components.$modes['Mode 1']),previews,relations,legacyAliases,source:{packageVersion:packageJson.version,tokensSha256,inventorySha256:hash(JSON.stringify(sources))}});
 return {catalog,sources};
}
