import {applyWorkbenchEdits, colorCatalog} from './token-workbench-model.mjs';
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function tokenStoreApi(tokens, sourceHash) {
 const catalog=colorCatalog(tokens);
 return async function(request,db){
  const url=new URL(request.url);
  if(!db)return json({error:'Database unavailable'},503);
  const local=['127.0.0.1','localhost'].includes(url.hostname);
  if(!local&&!request.headers.get('oai-authenticated-user-id'))return json({error:'Sign in required'},401);
  const read=async()=>{
   const row=await db.prepare('SELECT source_hash, revision, edits_json, updated_at FROM token_documents WHERE id = ?').bind('shared').first();
   return row?{sourceTokensSha256:row.source_hash,revision:row.revision,edits:JSON.parse(row.edits_json),updatedAt:row.updated_at}:{sourceTokensSha256:sourceHash,revision:0,edits:{},updatedAt:null};
  };
  try{
   if(request.method==='GET')return json(await read());
   if(request.method!=='PUT')return json({error:'Method not allowed'},405);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'JSON required'},415);
   if(Number(request.headers.get('content-length')||0)>262144)return json({error:'Document too large'},413);
   const reader=request.body?.getReader();let size=0,chunks=[];
   if(!reader)return json({error:'Body required'},400);
   while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>262144){await reader.cancel();return json({error:'Document too large'},413);}chunks.push(value);}
   if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'Same origin required'},403);
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   let body;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{return json({error:'Invalid JSON'},400);}
   if(body.sourceTokensSha256!==sourceHash)return json({error:'Token source has changed'},409);
   if(!Number.isSafeInteger(body.revision)||body.revision<0||!body.edits||Array.isArray(body.edits)||typeof body.edits!=='object')return json({error:'Invalid document'},400);
   try{applyWorkbenchEdits(tokens,body.edits,catalog);}catch(error){return json({error:error.message},422);}
   const edits=JSON.stringify(body.edits),revision=body.revision+1,updatedAt=new Date().toISOString();
   const results=await db.batch([
    db.prepare('INSERT INTO token_documents (id, source_hash, revision, edits_json, updated_at) SELECT ?, ?, ?, ?, ? WHERE (? = 0 OR EXISTS (SELECT 1 FROM token_documents WHERE id = \'shared\')) ON CONFLICT(id) DO UPDATE SET revision = excluded.revision, edits_json = excluded.edits_json, updated_at = excluded.updated_at WHERE token_documents.source_hash = ? AND token_documents.revision = ?').bind('shared',sourceHash,revision,edits,updatedAt,body.revision,sourceHash,body.revision),
    db.prepare('INSERT OR IGNORE INTO token_history (revision, source_hash, edits_json, updated_at) SELECT revision, source_hash, edits_json, updated_at FROM token_documents WHERE id = ? AND revision = ? AND edits_json = ?').bind('shared',revision,edits)
   ]);
   if(!results[0].meta.changes)return json({error:'Document changed in another editor',document:await read()},409);
   return json({sourceTokensSha256:sourceHash,revision,edits:body.edits,updatedAt});
  }catch{return json({error:'Database temporarily unavailable'},503);}
 };
}
