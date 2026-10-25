import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const groups={
 lab:['slider-workspace','card-avatar-workspace','table-workspace','inspector-consistency','workspace-rhythm','dense-workspace','chat-composer','building-layout','tooltip-workspace','application-text','adaptive-panels','reference-modal','workspace-text','icon-workspace','choice-workspace','workspace-nontext','workspace-contrast','visual-consistency','feedback-workspace','lab2','workspace','controls'],
 references:['recents','notification-workspace','search-workspace','popover-workspace','building','chat','chat-bubble-workspace','top-bar-workspace','sidebar-workspace','accordion-workspace','sandbox-model','sandbox','typography','spline-model','spline-renderer','spline','spline-manipulator','webflow-model','webflow-preview','webflow','framer-model','framer-preview','framer','workflow-model','workflow'],
};
/** CI partitions the authoritative npm verifier list; unknown or omitted files fail. */
export function planVerification(script){
 assert.equal(typeof script,'string');
 const files=script.split(/\s*&&\s*/).map(command=>{const match=/^node (verify-[a-z0-9-]+\.mjs)$/.exec(command.trim());assert.ok(match,'Unsupported verifier command: '+command);return match[1];});
 const ownership=new Map();for(const[group,names]of Object.entries(groups))for(const name of names){const file='verify-'+name+'.mjs';assert.ok(!ownership.has(file),'Duplicate CI ownership: '+file);ownership.set(file,group);}
 assert.equal(new Set(files).size,files.length,'Duplicate npm verifier');
 assert.equal(files.length,ownership.size,'CI coverage differs from npm run verify');
 for(const file of files)assert.ok(ownership.has(file),'Add CI ownership for '+file);
 for(const file of ownership.keys())assert.ok(files.includes(file),'CI verifier is absent from npm run verify: '+file);
 return Object.fromEntries(Object.keys(groups).map(group=>[group,files.filter(file=>ownership.get(file)===group)]));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const root=import.meta.dirname,pkg=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')),plan=planVerification(pkg.scripts.verify),partition=process.argv[2];
 for(const file of Object.values(plan).flat())await fs.access(path.join(root,file));
 if(partition==='--check')console.log(JSON.stringify({coverage:'complete-disjoint',scripts:Object.values(plan).flat().length,groups:Object.fromEntries(Object.entries(plan).map(([name,files])=>[name,files.length]))}));
 else{assert.ok(Object.hasOwn(plan,partition),'Expected lab, references or --check');for(const file of plan[partition]){console.log(JSON.stringify({partition,verifier:file}));const result=spawnSync(process.execPath,[file],{cwd:root,env:process.env,stdio:'inherit',windowsHide:true});if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);}console.log(JSON.stringify({partition,scripts:plan[partition].length,exitCode:0}));}
}
