import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import migration from './semantic-palette-migration.mjs';
import {migrateTokenDocument,previousTokenSource} from './token-source-migration.mjs';
import {applyWorkbenchEdits,colorCatalog} from './token-workbench-model.mjs';
import {createTokenResolver} from '../../../../packages/seda-contracts/src/tokens.mjs';
import {tokenStoreApi} from './token-store-api.mjs';
import {chromium} from 'playwright';
import {createPilotServer} from './server.mjs';

const raw=await fs.readFile('../../../../tokens.json','utf8'),source=JSON.parse(raw);
assert.equal(createHash('sha256').update(raw).digest('hex'),migration.toHash);
const previous=previousTokenSource(source,migration.toHash);
const previousBytes=JSON.stringify(previous,null,2).replaceAll('\n',raw.includes('\r\n')?'\r\n':'\n')+(raw.endsWith('\n')?(raw.includes('\r\n')?'\r\n':'\n'):'');
assert.equal(createHash('sha256').update(previousBytes).digest('hex'),migration.fromHash,'previous source is reconstructed exactly');
const cases=[{},
 {'semantic|Light|border/control/default':'{color.blue.60}'},
 {'semantic|Light|border/focus':'{color.red.50}'},
 {'semantic|Dark|icon/brand':'{color.purple.50}'},
 {'foundation|Mode 1|color/black/50':'oklch(40% 0.02 260)'},
 {'components|Mode 1|select/border/default':'{border.subtle}'},
 {'semantic|Light|border/control/default':'{color.blue.60}','semantic|Light|border/field/default':'{color.green.50}'},
 {'foundation|Mode 1|space/m':'12','foundation|Mode 1|font/body/base/size':'15'},
];
let compared=0;
for(const edits of cases){
 const document={sourceTokensSha256:migration.fromHash,revision:6,edits,updatedAt:'2026-10-28T00:00:00.000Z'},snapshot=structuredClone(document);
 const migrated=migrateTokenDocument(document,source,migration.toHash);
 assert.deepEqual(document,snapshot,'migration must not mutate its input');assert.equal(migrated.revision,6);assert.equal(migrated.updatedAt,document.updatedAt);
 const before=createTokenResolver(applyWorkbenchEdits(previous,edits)),after=createTokenResolver(applyWorkbenchEdits(source,migrated.edits));
 for(const item of colorCatalog(source))for(const theme of ['Light','Dark']){
  if(item.collection==='semantic'&&item.mode!==theme)continue;
  const ref={collection:item.collection,path:item.path.split('/'),expectedType:'color'};
  assert.equal(after.resolve(ref,{theme}).cssValue,before.resolve(ref,{theme}).cssValue,item.key+'/'+theme);compared++;
 }
 assert.deepEqual(migrateTokenDocument(migrated,source,migration.toHash),migrated,'idempotent');
}
assert.equal(migrateTokenDocument({sourceTokensSha256:'unknown'},source,migration.toHash).sourceTokensSha256,'unknown');

export function sqliteFixture(edits={},sourceHash=migration.fromHash){
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec('CREATE TABLE token_documents(id TEXT PRIMARY KEY,source_hash TEXT NOT NULL,revision INTEGER NOT NULL,edits_json TEXT NOT NULL,updated_at TEXT NOT NULL); CREATE TABLE token_history(revision INTEGER PRIMARY KEY,source_hash TEXT NOT NULL,edits_json TEXT NOT NULL,updated_at TEXT NOT NULL);');
 sqlite.prepare('INSERT INTO token_documents VALUES (?,?,?,?,?)').run('shared',sourceHash,6,JSON.stringify(edits),'2026-10-28T00:00:00.000Z');
 const adapter={prepare(sql){return{bind(...values){return{first:async()=>sqlite.prepare(sql).get(...values)??null,execute:()=>({meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}})};}};},async batch(statements){sqlite.exec('BEGIN');try{const results=statements.map(s=>s.execute());sqlite.exec('COMMIT');return results;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
 return{sqlite,adapter};
}
const oldEdits=cases[1],{sqlite,adapter}=sqliteFixture(oldEdits),api=tokenStoreApi(source,migration.toHash);
const request=(method,body)=>api(new Request('http://localhost/api/token-document',{method,headers:{'Content-Type':'application/json',Origin:'http://localhost'},...(body?{body:JSON.stringify(body)}:{})}),adapter);
let response=await request('GET'),doc=await response.json();assert.equal(response.status,200);
assert.equal(doc.edits['semantic|Light|border/field/default'],'{color.blue.60}');
assert.equal(sqlite.prepare('SELECT source_hash FROM token_documents').get().source_hash,migration.fromHash,'GET projects without rewriting production state');
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM token_history').get().n,0);
assert.equal((await request('PUT',{...doc,clientVersion:2,sourceTokensSha256:migration.fromHash})).status,409,'old clients cannot overwrite new-source state');
const result=await Promise.all([request('PUT',{...doc,clientVersion:2,edits:{...doc.edits,'components|Mode 1|select/border/default':'{border.subtle}'}}),request('PUT',{...doc,clientVersion:2,edits:{}})]);
assert.deepEqual(result.map(r=>r.status).sort(),[200,409],'concurrent upgrade uses revision CAS');
assert.equal(sqlite.prepare('SELECT source_hash FROM token_documents').get().source_hash,migration.toHash);
assert.deepEqual(JSON.parse(sqlite.prepare('SELECT edits_json FROM token_history WHERE revision=6').get().edits_json),oldEdits,'original row backed up atomically');
assert.equal(sqlite.prepare('SELECT source_hash FROM token_history WHERE revision=6').get().source_hash,migration.fromHash);
assert.equal(sqlite.prepare('SELECT source_hash FROM token_history WHERE revision=7').get().source_hash,migration.toHash);
assert.equal((await request('PUT',{...doc,clientVersion:2})).status,409,'late response cannot rewrite the newer revision');
sqlite.close();
const unknown=sqliteFixture({},'unknown'),unknownApi=tokenStoreApi(source,migration.toHash);
assert.equal((await (await unknownApi(new Request('http://localhost/api/token-document'),unknown.adapter)).json()).sourceTokensSha256,'unknown');unknown.sqlite.close();
console.log(`PASS: ${migration.aliases.length} semantic aliases, ${compared} resolved colour comparisons across 8 saved configurations, exact source reconstruction, idempotence, SQLite API GET projection, CAS upgrade, old-client rejection and original/new history.`);

const fixture=sqliteFixture(),browserApi=tokenStoreApi(source,migration.toHash),server=await createPilotServer({port:0});
const browser=await chromium.launch({headless:true,executablePath:process.env.SEDA_BROWSER_EXECUTABLE});
const pending={'semantic|Light|border/control/default':'{color.blue.60}','foundation|Mode 1|color/blue/60':'oklch(61% 0.12 255)'},oldDraft={sourceTokensSha256:migration.fromHash,edits:pending};
let writes=0;const errors=[];
try {
 const context=await browser.newContext(),page=await context.newPage({viewport:{width:1480,height:1000}});page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(({draft,hash})=>{
  if(!sessionStorage.seeded){localStorage.setItem('seda-token-workbench-v2',JSON.stringify(draft));localStorage.setItem('seda-token-workbench-confirmed-v2',JSON.stringify({sourceTokensSha256:hash,revision:6,edits:{},updatedAt:null}));sessionStorage.seeded='yes';}
 },{draft:oldDraft,hash:migration.fromHash});
 await context.route('**/api/token-document',async route=>{
  const req=route.request();if(req.method()==='PUT')writes++;
  const response=await browserApi(new Request(req.url(),{method:req.method(),headers:req.headers(),...(req.method()==='GET'?{}:{body:req.postData()})}),fixture.adapter);
  await route.fulfill({status:response.status,body:await response.text(),headers:{'content-type':'application/json'}});
 });
 await page.goto(`http://127.0.0.1:${server.address().port}/tokens.html`);
 await page.locator('.studio-sync-live').filter({hasText:'Сохранено в базе'}).waitFor();
 assert.equal(writes,1,'one CAS save of the pending local migration');
 const stored=JSON.parse(fixture.sqlite.prepare('SELECT edits_json FROM token_documents').get().edits_json);
 assert.deepEqual(stored,migrateTokenDocument(oldDraft,source,migration.toHash).edits);
 const backup=await page.evaluate(hash=>JSON.parse(localStorage.getItem('seda-token-workbench-v2-source-backup-'+hash)),migration.fromHash);
 assert.deepEqual(backup,oldDraft,'original pending local draft retained before replacement');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('seda-token-workbench-v2')).sourceTokensSha256),migration.toHash);
 await page.reload();await page.locator('.studio-sync-live').filter({hasText:'Сохранено в базе'}).waitFor();assert.equal(writes,1,'reload does not submit the migration twice');
 await page.getByRole('button',{name:'Семантика',exact:true}).click();
 await page.locator('.studio-library-items').getByRole('button',{name:'border',exact:true}).click();
 const field=page.locator('.studio-token-row').filter({has:page.getByRole('button',{name:'border/field/default',exact:true})});
 assert.equal(await field.locator('td').nth(1).innerText(),'{color.blue.60}','semantic table shows carried palette alias');
 await fs.mkdir('.diagnostics-token-source-migration',{recursive:true});
 await field.getByRole('button').click();await page.screenshot({path:'.diagnostics-token-source-migration/semantic-light.png'});
 await page.getByLabel('Theme',{exact:true}).selectOption('Dark');
 assert.equal(await field.locator('td').nth(1).innerText(),'{color.white.25}');
 await page.screenshot({path:'.diagnostics-token-source-migration/semantic-dark.png'});
 const offline=await browser.newContext(),consumer=await offline.newPage();consumer.on('pageerror',error=>errors.push(error.message));
 await consumer.addInitScript(({hash,edits})=>localStorage.setItem('seda-design-consumer-confirmed-v1',JSON.stringify({sourceTokensSha256:hash,revision:6,edits,updatedAt:null})),{hash:migration.fromHash,edits:pending});
 await consumer.route('**/api/token-document',route=>route.abort());
 await consumer.goto(`http://127.0.0.1:${server.address().port}/`);
 await consumer.locator('[data-seda-saved-design][data-revision="6"]').waitFor({state:'attached'});
 assert.ok((await consumer.locator('[data-seda-saved-design]').textContent()).includes('--text-field-border-default:oklch(61% 0.12 255)'), 'offline confirmed consumer retains the old inherited field colour');
 assert.equal(writes,1,'read-only consumers never upgrade the database');
 assert.deepEqual(errors,[]);
 console.log('PASS: live React old draft + confirmed cache -> current source, pending edit CAS save, original local backup, reload idempotence, direct palette UI and offline reader cache without PUT.');
 await offline.close();await context.close();
} finally {await browser.close();await new Promise(resolve=>server.close(resolve));fixture.sqlite.close();}
