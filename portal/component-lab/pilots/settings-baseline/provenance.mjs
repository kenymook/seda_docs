import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const referenceCommit='354e19adc00605c422033a53ed1dd81dc33259ae';
const expectedFiles={
  'packages/seda-ui/src/components/Button/Button.tsx':'106fd275a302e19b71bd46c27b388f92ad67e375',
  'packages/seda-ui/src/components/IconButton/IconButton.tsx':'b13d3edbf72f0b5caf3c821a0187d4c219c3a490',
  'packages/seda-ui/src/components/TextField/TextField.tsx':'f262bdb6658399ae4e3a2989aace42713cf84eee',
  'packages/seda-ui/src/types.ts':'ff7843a4fa2bc8e1090ff390bac592180158ce8c',
  'packages/seda-ui/src/styles.css':'3f8f3bf966326b6aa7a4b516b7edb06d94014c66',
  'tokens.json':'fed01fd65cf7fd008f9a12d1f04e9daf1f398aa7',
  'portal/portal-tokens.js':'816e0c31a7500b53803bc97712cba2b557c6c1e6',
};

export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export const gitBlobSha=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

export async function sourceProvenance(repoRoot){
  const files=[];
  for(const [name,expectedGitBlobSha] of Object.entries(expectedFiles)){
    const bytes=await fs.readFile(path.join(repoRoot,name));
    const actualGitBlobSha=gitBlobSha(bytes);
    files.push({path:name,expectedGitBlobSha,actualGitBlobSha,matchesReference:actualGitBlobSha===expectedGitBlobSha});
  }
  return {referenceCommit,checkedFileCount:files.length,allReferenceFilesMatch:files.every(f=>f.matchesReference),files};
}

export async function bundleProvenance(root){
  const files=[];
  for(const name of ['fixture.js','fixture.css'])files.push({path:`dist/${name}`,sha256:sha256(await fs.readFile(path.join(root,'dist',name)))});
  return files;
}

export async function verifyBuild(root,repoRoot){
  const metadata=JSON.parse(await fs.readFile(path.join(root,'dist/build-metadata.json'),'utf8'));
  const current=await sourceProvenance(repoRoot);
  if(JSON.stringify(current)!==JSON.stringify(metadata.sourceProvenance))throw new Error('Source files changed after build. Run npm run measure to rebuild.');
  const bundle=await bundleProvenance(root);
  if(JSON.stringify(bundle)!==JSON.stringify(metadata.bundleArtifacts))throw new Error('Bundle files changed after build. Run npm run measure to rebuild.');
  return metadata;
}
