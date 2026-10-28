import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createContractEngine } from '../../../../packages/seda-contracts/src/index.mjs';
import { createWebBindings } from '../../../../packages/seda-contracts/src/web.mjs';
import { validateOwnerPolicy } from '../../../../packages/seda-contracts/src/owner-policy.mjs';

const pilotRoot = import.meta.dirname;
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

async function filesBelow(directory) {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await filesBelow(file));
    else if (entry.isFile()) result.push(file);
  }
  return result;
}

/** Build a static pilot from the actual contracts, TypeScript components and token bytes. */
export async function buildPilot({
  repoRoot = path.resolve(process.env.SEDA_REPO_ROOT || path.join(pilotRoot, '../../../..')),
  outputDir = path.resolve(process.env.SEDA_PILOT_DIST || path.join(pilotRoot, 'dist')),
  tokensFile = process.env.SEDA_TOKENS_FILE,
} = {}) {
  const canonicalRepoRoot = await fs.realpath(path.resolve(pilotRoot, '../../../..'));
  repoRoot = await fs.realpath(path.resolve(repoRoot));
  // Imports above and the React adapter are anchored to this checkout. Accepting
  // another source tree would make provenance describe code that is not executed.
  if (repoRoot !== canonicalRepoRoot) {
    throw new Error('SEDA_REPO_ROOT must identify this pilot checkout. Use SEDA_TOKENS_FILE for token experiments.');
  }
  outputDir = path.resolve(outputDir);
  if ([repoRoot, pilotRoot, path.parse(outputDir).root].includes(outputDir)) {
    throw new Error('Choose a dedicated build output directory.');
  }
  const packageRoot = path.join(repoRoot, 'packages/seda-contracts');
  const tokenPath = path.resolve(tokensFile || path.join(repoRoot, 'tokens.json'));
  const tokenBytes = await fs.readFile(tokenPath);
  const libraryRoot=path.join(repoRoot,'packages/seda-ui');
  const libraryBuild=spawnSync(process.execPath,[path.join(libraryRoot,'scripts/build.mjs')],{cwd:libraryRoot,encoding:'utf8',windowsHide:true});
  if(libraryBuild.status!==0)throw Error('Public SEDA build failed: '+libraryBuild.stdout+libraryBuild.stderr);
  const canonicalManifest=await fs.readFile(path.join(libraryRoot,'dist/manifest.json'),'utf8');
  const installedManifest=await fs.readFile(path.join(pilotRoot,'node_modules/@seda-ai/ui/dist/manifest.json'),'utf8');
  if(canonicalManifest!==installedManifest)throw Error('Installed SEDA package is stale. Build packages/seda-ui, then run npm ci in the pilot before building the reference application.');
  const tokens = JSON.parse(tokenBytes.toString('utf8'));
  const sourceFiles = [
    ...await filesBelow(path.join(pilotRoot,'references')),
    ...await filesBelow(path.join(pilotRoot,'node_modules/@seda-ai/ui/dist')),
    ...await filesBelow(path.join(repoRoot, 'packages/seda-ui/src')),
    ...await filesBelow(path.join(repoRoot, 'assets/icons/seda')),
    ...await filesBelow(path.join(packageRoot, 'src')),
    ...await filesBelow(path.join(packageRoot, 'schema')),
    ...await filesBelow(path.join(packageRoot, 'contracts')),
    ...await filesBelow(path.join(packageRoot, 'profiles')),
    path.join(packageRoot, 'system.json'),
    path.join(packageRoot, 'owner-policy.json'),
    path.join(packageRoot, 'package.json'),
    path.join(packageRoot, 'package-lock.json'),
    ...['contract-controls.tsx', 'control-fixtures.tsx', 'ProductWorkspace.tsx', 'EditorWorkspace.tsx', 'workspace-bindings.mjs', 'workspace.css', 'app.tsx', 'owner.tsx', 'owner-token-draft.mjs', 'owner-color.mjs', 'owner.css', 'owner.html', 'tokens.tsx', 'tokens.css', 'tokens.html', 'token-workbench-model.mjs', 'token-store-api.mjs', 'use-token-store.tsx', 'foundation-model.mjs', 'FoundationStudio.tsx', 'StudioRailIcon.tsx', 'StudioChrome.tsx', 'studio-chrome.css', 'lab-studio.css', 'SharedDesignProvider.tsx', 'shared-design.css', 'saved-design-model.mjs', 'release-preview.tsx', 'release-preview.css', 'release-preview.html', 'release-preview-model.mjs', 'lab-model.mjs', 'styles.css', 'test-fixtures.tsx', 'index.html', 'build.mjs', 'package.json', 'package-lock.json'].map(name => path.join(pilotRoot, name)),
  ].sort();
  const fingerprint = async () => Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    path.relative(repoRoot, file).split(path.sep).join('/'), sha256(await fs.readFile(file)),
  ])));
  const before = await fingerprint();
  const engine = createContractEngine({ repoRoot, packageRoot, tokens });
  const validation = engine.validate();
  if (!validation.valid) throw new Error(`Contracts failed validation: ${JSON.stringify(validation.issues)}`);
  const ownerPolicy = validateOwnerPolicy(
    JSON.parse(await fs.readFile(path.join(packageRoot, 'owner-policy.json'), 'utf8')),
    engine.bundle.system,
    engine.bundle.profile,
  );
  const audit = engine.audit();
  if (!audit.valid) throw new Error(`Source defaults failed audit: ${JSON.stringify(audit)}`);
  const profiles = {};
  for (const theme of engine.bundle.system.supportedThemes) {
    for (const controlSize of Object.keys(engine.bundle.system.sizes)) {
      const compiled = engine.compile(engine.bundle.profile, { overrides: { theme, controlSize } });
      // A valid contract can still be outside a browser adapter's supported recipe scope.
      // Fail before producing a page with missing CSS roles or fallback values.
      createWebBindings(compiled);
      profiles[`${theme}:${controlSize}`] = compiled;
    }
  }
  const provenance = {
    reference: engine.bundle.system.source,
    tokenSource: tokensFile ? 'provided-token-file' : 'tokens.json',
    tokensSha256: sha256(tokenBytes),
    sources: { ...before, 'tokens.json': sha256(tokenBytes) },
  };
  const publicIndex = await fs.readFile(path.join(libraryRoot, 'src/index.ts'), 'utf8');
  const publicComponents = [...publicIndex.matchAll(/export \* from ["']\.\/components\/([^"']+)["']/g)].map(match => match[1]);
  const contractComponents = (await fs.readdir(path.join(packageRoot, 'contracts')))
    .filter(name => name.endsWith('.json')).map(name => name.slice(0, -5));
  if (publicComponents.length !== new Set(publicComponents).size || contractComponents.some(name => !publicComponents.includes(name))) {
    throw new Error('Owner catalog coverage disagrees with public SEDA exports');
  }
  const componentCoverage = {
    publicComponents,
    contractComponents,
    tokenBranches: Object.keys(tokens.$collections.components.$modes['Mode 1']),
  };
  const libraryBindings=JSON.parse(await fs.readFile(path.join(libraryRoot,'dist/profiles.json'),'utf8'));
  const buttonContract=engine.bundle.contracts.find(item=>item.id==='Button');
  const catalog = {libraryBindings,buttonContract, profiles, profile: engine.bundle.profile, provenance, ownerPolicy, system: engine.bundle.system, componentCoverage, tokens };
  await fs.mkdir(outputDir, { recursive: true });
  const result = await build({
    absWorkingDir: pilotRoot,
    entryPoints: [path.join(pilotRoot, 'app.tsx'), path.join(pilotRoot, 'owner.tsx'), path.join(pilotRoot, 'tokens.tsx'), path.join(pilotRoot, 'release-preview.tsx')],
    outdir: outputDir,
    entryNames: '[name]',
    assetNames: 'assets/[name]-[hash]',
    bundle: true,
    format: 'esm',
    jsx: 'automatic',
    target: 'es2020',
    sourcemap: false,
    metafile: true,
    loader: { '.woff': 'file', '.woff2': 'file' },
    nodePaths: [path.join(pilotRoot, 'node_modules')],
    alias: {
      // Library peer installs must use the host's React instance, including JSX.
      'react': path.join(pilotRoot, 'node_modules/react'),
      'react-dom': path.join(pilotRoot, 'node_modules/react-dom'),
      '@seda-ai/ui/styles.css': path.join(pilotRoot, 'node_modules/@seda-ai/ui/dist/styles.css'),
      '@seda-ai/ui': path.join(pilotRoot, 'node_modules/@seda-ai/ui/dist/index.js'),
    },
    plugins: [{
      name: 'seda-contract-catalog',
      setup(builder) {
        builder.onResolve({ filter: /^seda:catalog$/ }, () => ({ path: 'catalog', namespace: 'seda' }));
        builder.onLoad({ filter: /.*/, namespace: 'seda' }, () => ({
          contents: Object.entries(catalog).map(([name, value]) => `export const ${name} = ${JSON.stringify(value)};`).join('\n'),
          loader: 'js',
        }));
      },
    }],
  });
  await fs.copyFile(path.join(pilotRoot, 'index.html'), path.join(outputDir, 'index.html'));
  await fs.copyFile(path.join(pilotRoot, 'owner.html'), path.join(outputDir, 'owner.html'));
  await fs.copyFile(path.join(pilotRoot, 'tokens.html'), path.join(outputDir, 'tokens.html'));
  await fs.copyFile(path.join(pilotRoot, 'release-preview.html'), path.join(outputDir, 'release-preview.html'));
  const installedPackage=path.join(pilotRoot,'node_modules/@seda-ai/ui');
  if((await fs.lstat(installedPackage)).isSymbolicLink())throw Error('Reference application requires an installed package, not a source link');
  const referenceOut=path.join(outputDir,'references');
  const referenceBuild=await build({
    absWorkingDir:pilotRoot,entryPoints:['recents','building','chat','sandbox','spline','webflow','framer','workflow'].map(name=>path.join(pilotRoot,'references',name+'.tsx')),outdir:referenceOut,
    bundle:true,format:'esm',jsx:'automatic',target:'es2020',metafile:true,minify:true,
    alias:{react:path.join(pilotRoot,'node_modules/react'),'react-dom':path.join(pilotRoot,'node_modules/react-dom'),'@seda-ai/ui/styles.css':path.join(pilotRoot,'node_modules/@seda-ai/ui/dist/styles.css'),'@seda-ai/ui':path.join(pilotRoot,'node_modules/@seda-ai/ui/dist/index.js')},
    loader:{'.woff':'file','.woff2':'file'},assetNames:'fonts/[name]-[hash]',
    plugins:[{name:'reference-contract-catalog',setup(builder){
      builder.onResolve({filter:/^seda:catalog$/},()=>({path:'catalog',namespace:'seda'}));
      builder.onLoad({filter:/.*/,namespace:'seda'},()=>({contents:Object.entries(catalog).map(([name,value])=>`export const ${name} = ${JSON.stringify(value)};`).join('\n'),loader:'js'}));
    }}]
  });
  const referenceInputs=Object.keys(referenceBuild.metafile.inputs);
  const navigationProvenance={};
  for(const theme of ['Light','Dark']){
    const branch=engine.resolver.resolveBranch({collection:'components',path:['sidebar']},{theme}).children;
    const selected=branch.item.surface.selected,accent=branch.item.accent.selected;
    navigationProvenance[theme]={selected,accent};
    await fs.appendFile(path.join(referenceOut,'recents.css'),`\n.reference-app[data-seda-theme="${theme.toLowerCase()}"]{--reference-nav-selected:var(--sidebar-item-surface-selected);--reference-nav-accent:var(--sidebar-item-accent-selected);}\n`);
    await fs.appendFile(path.join(referenceOut,'chat.css'),`\n.chat-app[data-seda-theme="${theme.toLowerCase()}"]{--chat-nav-selected:var(--sidebar-item-surface-selected);--chat-nav-accent:var(--sidebar-item-accent-selected);}\n`);
    await fs.appendFile(path.join(referenceOut,'sandbox.css'),`\n.sandbox-app[data-seda-theme="${theme.toLowerCase()}"]{--sandbox-nav-selected:var(--sidebar-item-surface-selected);--sandbox-nav-accent:var(--sidebar-item-accent-selected);}\n`);
  }
  if(referenceInputs.some(file=>/seda-ui[\\/]src[\\/]/.test(file))||!referenceInputs.some(file=>file.includes('node_modules/@seda-ai/ui/dist/components/Button/Button.js')))throw Error('Reference must consume installed SEDA public ESM');
  await fs.cp(path.join(pilotRoot,'references/assets'),path.join(referenceOut,'assets'),{recursive:true});
  await fs.copyFile(path.join(pilotRoot,'references/recents.html'),path.join(referenceOut,'recents.html'));
  await fs.copyFile(path.join(pilotRoot,'references/building.html'),path.join(referenceOut,'building.html'));
  await fs.copyFile(path.join(pilotRoot,'references/chat.html'),path.join(referenceOut,'chat.html'));
  await fs.copyFile(path.join(pilotRoot,'references/sandbox.html'),path.join(referenceOut,'sandbox.html'));
  await fs.copyFile(path.join(pilotRoot,'references/spline.html'),path.join(referenceOut,'spline.html'));
  await fs.copyFile(path.join(pilotRoot,'references/webflow.html'),path.join(referenceOut,'webflow.html'));
  await fs.copyFile(path.join(pilotRoot,'references/framer.html'),path.join(referenceOut,'framer.html'));
  await fs.copyFile(path.join(pilotRoot,'references/workflow.html'),path.join(referenceOut,'workflow.html'));
  const after = await fingerprint();
  const afterTokens = await fs.readFile(tokenPath);
  if (JSON.stringify(before) !== JSON.stringify(after) || sha256(tokenBytes) !== sha256(afterTokens)) {
    throw new Error('A source changed during the build. Rebuild before verifying the page.');
  }
  const artifacts = [];
  for (const name of [...Object.keys(result.metafile.outputs), path.join(outputDir, 'index.html'), path.join(outputDir, 'owner.html'), path.join(outputDir, 'tokens.html'), path.join(outputDir, 'release-preview.html'),...await filesBelow(referenceOut)]) {
    const file = path.resolve(pilotRoot, name);
    const relative = path.relative(outputDir, file).split(path.sep).join('/');
    if (relative.startsWith('../')) throw new Error(`Unexpected output outside build directory: ${name}`);
    const bytes = await fs.readFile(file);
    artifacts.push({ path: relative, bytes: bytes.length, sha256: sha256(bytes) });
  }
  const mainInputs=Object.keys(result.metafile.inputs);
  const mainUsesInstalledPackage=mainInputs.some(file=>file.endsWith('node_modules/@seda-ai/ui/dist/index.js'));
  const sourceAlias=mainInputs.some(file=>/packages[\\/]seda-ui[\\/]src[\\/]/.test(file));
  if(!mainUsesInstalledPackage||sourceAlias)throw new Error('The main Lab must use installed @seda-ai/ui, without source aliases.');
  const mainBundle=Object.values(result.metafile.outputs).find(output=>output.entryPoint?.endsWith('app.tsx'));
  const metadata = {
    kind: 'seda-parametric-build',
    builtAt: new Date().toISOString(),
    configurationCount: Object.keys(profiles).length,
    provenance,
    artifacts: artifacts.sort((a, b) => a.path.localeCompare(b.path)),
    validation: { valid: validation.valid, planned: validation.planned },
    sourceAudit: { valid: audit.valid },
    installedPackage:mainUsesInstalledPackage,sourceAlias,
    bundledComponents: Object.entries(mainBundle?.inputs??{}).filter(([file,info])=>info.bytesInOutput>0&&file.includes('node_modules/@seda-ai/ui/dist/components/')).map(([file])=>file),
    references:Object.fromEntries([['recents','1:691'],['building','1:84'],['chat','1:3894'],['sandbox','1:1875'],['spline','1:4844'],['webflow','1:5922'],['framer','1:7743'],['workflow','1:8421']].map(([name,sourceNode])=>{
      const output=Object.entries(referenceBuild.metafile.outputs).find(([file])=>file.endsWith('/'+name+'.js'))?.[1];
      return [name,{route:'/references/'+name+'.html',sourceNode,...(name==='spline'?{contexts:{scene:'1:4844',object:'1:5441'},proceduralGeometry:true}:{}),sourceAlias:false,installedPackage:true,...(['recents','chat','sandbox'].includes(name)?{navigationProvenance}:{}),bundledComponents:Object.entries(output?.inputs??{}).filter(([file,info])=>info.bytesInOutput>0&&file.includes('node_modules/@seda-ai/ui/dist/components/')).map(([file])=>file)}];
    })),
    runtimeConformance: 'not-checked',
  };
  await fs.writeFile(path.join(outputDir, 'build-metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
  return { outputDir, metadata };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { outputDir, metadata } = await buildPilot();
  console.log(JSON.stringify({ outputDir, profileCount: metadata.configurationCount, sourceAudit: metadata.sourceAudit.valid, tokenHash: metadata.provenance.tokensSha256 }, null, 2));
}
