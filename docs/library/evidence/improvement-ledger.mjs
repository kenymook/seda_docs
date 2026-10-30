import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';

const text=value=>typeof value==='string'&&value.trim().length>0;
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
/** Read-only evidence checks. Passing validation is not design acceptance. */
export function analyzeLedger({ledger,capture,baseDir,threshold=0.2}) {
 const issues=[],candidates=[],ids=new Set();
 const issue=(location,message)=>issues.push({location,message});
 if(!Number.isFinite(threshold)||threshold<=0||threshold>=1)throw new TypeError('threshold must be between 0 and 1');
 if(ledger?.schemaVersion!==1||!Array.isArray(ledger.items))return {valid:false,issues:[{location:'ledger',message:'Expected schemaVersion 1 and an items array.'}],candidates:[]};
 for(const [i,item] of ledger.items.entries()){
  const at=`items/${i}`;
  for(const key of ['id','priority','kind','owner','title','evidence','next','exit'])if(!text(item?.[key]))issue(`${at}/${key}`,'Nonempty text required.');
  if(text(item?.id)){if(ids.has(item.id))issue(`${at}/id`,'Duplicate id.');ids.add(item.id)}
  if(item?.status!==undefined&&!['open','accepted'].includes(item.status))issue(`${at}/status`,'Status must be open or accepted.');
  if(item?.status==='accepted'){
   for(const key of ['decision','validation','acceptedBy'])if(!text(item[key]))issue(`${at}/${key}`,'Accepted findings require a human decision and validation.');
   if(!['local','shared'].includes(item.scope))issue(`${at}/scope`,'Accepted findings require an explicit local or shared scope.');
   const consumerCount=new Set(Array.isArray(item.affectedConsumers)?item.affectedConsumers.filter(text):[]).size;
   if(consumerCount<(item.scope==='shared'?2:1))issue(`${at}/affectedConsumers`,'Accepted local changes require one consumer; shared changes require two distinct consumers.');
   if(!Array.isArray(item.afterEvidence)||item.afterEvidence.length===0)issue(`${at}/afterEvidence`,'Accepted findings require at least one evidence file with its SHA-256.');
   for(const [j,ref] of (Array.isArray(item.afterEvidence)?item.afterEvidence:[]).entries()){
    const loc=`${at}/afterEvidence/${j}`;
    if(!text(ref?.path)||!/^([a-f0-9]{64})$/.test(ref?.sha256??'')){issue(loc,'Expected a relative path and lowercase SHA-256.');continue}
    try {const root=fs.realpathSync(baseDir),file=fs.realpathSync(path.resolve(root,ref.path)),relative=path.relative(root,file);if(!relative||relative.startsWith('..'+path.sep)||path.isAbsolute(relative))throw Error('outside');if(!fs.statSync(file).isFile()||sha256(fs.readFileSync(file))!==ref.sha256)throw Error('hash');}catch{issue(loc,'Evidence missing, outside the evidence directory, or hash mismatch.');}
   }
  }
 }
 if(capture?.schemaVersion!==1||!Array.isArray(capture.captures))issue('capture','Expected schemaVersion 1 and captures array.');
 else for(const [i,c] of capture.captures.entries()){
  const at=`captures/${i}`,height=c?.measurements?.header?.rect?.height,viewport=c?.measurements?.viewport?.height;
  if(!text(c?.config?.id)||!Number.isFinite(height)||height<0||!Number.isFinite(viewport)||viewport<=0){issue(at,'Missing case identity or valid header/viewport measurement.');continue;}
  if(!text(c.screenshot)||!/^([a-f0-9]{64})$/.test(c.screenshotSha256??'')){issue(at+'/screenshot','Missing screenshot path or hash.');continue;}
  try {const root=fs.realpathSync(baseDir),file=fs.realpathSync(path.resolve(root,c.screenshot)),relative=path.relative(root,file);if(!relative||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)||!fs.statSync(file).isFile()||sha256(fs.readFileSync(file))!==c.screenshotSha256)throw Error('invalid');}catch{issue(at+'/screenshot','Screenshot missing, outside directory, or hash mismatch.');continue;}
  const ratio=height/viewport;
  if(ratio>=threshold)candidates.push({caseId:c.config.id,metric:'header/viewport',headerPx:height,viewportPx:viewport,ratio,threshold,screenshot:c.screenshot,sourceCommit:capture.implementationCommit??null,classification:'observation-needs-review'});
 }
 return {valid:issues.length===0,issues,candidates};
}

/** Compare matching captures after the caller has validated each evidence directory. */
export function compareCaptures(before,after){
 if(!text(before?.route)||before.route!==after?.route||!text(before?.sourceTokensSha256)||before.sourceTokensSha256!==after?.sourceTokensSha256||!text(before?.data?.sha256)||before.data.sha256!==after?.data?.sha256)throw new TypeError('Captures must share a route, token source and dataset.');
 const fields=['id','width','height','theme','size','scale','airX','airY'];
 const key=c=>{if(fields.some(field=>c.config?.[field]===undefined)||!Number.isFinite(c.measurements?.viewport?.dpr))throw new TypeError('Comparison requires complete configuration and DPR.');return JSON.stringify([...fields.map(field=>c.config[field]),c.measurements.viewport.dpr]);};
 const left=new Map(before.captures.map(c=>[key(c),c])),right=new Map(after.captures.map(c=>[key(c),c]));
 if(left.size!==before.captures.length||right.size!==after.captures.length)throw new TypeError('Duplicate capture configurations.');
 const result=[];
 for(const [id,a] of left){const b=right.get(id);if(!b)continue;const first=a.measurements?.header?.rect?.height,second=b.measurements?.header?.rect?.height;if(!Number.isFinite(first)||!Number.isFinite(second))throw new TypeError('Both captures require header measurements.');result.push({caseId:a.config.id,beforePx:first,afterPx:second,deltaPx:second-first,beforeScreenshot:a.screenshot,afterScreenshot:b.screenshot});}
 return {matches:result,unmatchedBefore:left.size-result.length,unmatchedAfter:right.size-result.length,beforeCommit:before.implementationCommit??null,afterCommit:after.implementationCommit??null,browserBefore:before.browser??null,browserAfter:after.browser??null,browserChanged:text(before.browser)&&text(after.browser)?before.browser!==after.browser:null,platformBefore:before.platform??null,platformAfter:after.platform??null};
}

const main=process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href;
if(main){
 try{const baseDir=path.resolve(process.argv[2]??path.join(path.dirname(fileURLToPath(import.meta.url)),'../visual-baselines/files-2026-10-30'));const threshold=process.argv[3]===undefined?0.2:Number(process.argv[3]);const ledger=JSON.parse(fs.readFileSync(path.join(baseDir,'defects.json'),'utf8')),capture=JSON.parse(fs.readFileSync(path.join(baseDir,'capture.json'),'utf8'));const result=analyzeLedger({ledger,capture,baseDir,threshold});let comparison;if(process.argv[4]){const afterDir=path.resolve(process.argv[4]),afterLedger=JSON.parse(fs.readFileSync(path.join(afterDir,'defects.json'),'utf8')),after=JSON.parse(fs.readFileSync(path.join(afterDir,'capture.json'),'utf8')),checked=analyzeLedger({ledger:afterLedger,capture:after,baseDir:afterDir,threshold});if(!result.valid||!checked.valid)throw new TypeError('Both captures must pass evidence validation before comparison.');comparison=compareCaptures(capture,after);}console.log(JSON.stringify({...result,...(comparison?{comparison}:{}),scope:'Read-only candidate observations; no acceptance or automatic changes.'},null,2));if(!result.valid)process.exitCode=1;}catch(error){console.error(error.message);process.exitCode=1;}
}
