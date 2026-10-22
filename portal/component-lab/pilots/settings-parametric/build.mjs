import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createContractEngine } from '../../../../packages/seda-contracts/src/index.mjs';
import { createWebBindings } from '../../../../packages/seda-contracts/src/web.mjs';

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
  const tokens = JSON.parse(tokenBytes.toString('utf8'));
  const sourceFiles = [
    ...await filesBelow(path.join(repoRoot, 'packages/seda-ui/src')),
    ...await filesBelow(path.join(packageRoot, 'src')),
    ...await filesBelow(path.join(packageRoot, 'schema')),
    ...await filesBelow(path.join(packageRoot, 'contracts')),
    ...await filesBelow(path.join(packageRoot, 'profiles')),
    path.join(packageRoot, 'system.json'),
    path.join(packageRoot, 'package.json'),
    path.join(packageRoot, 'package-lock.json'),
    ...['app.tsx', 'styles.css', 'test-fixtures.tsx', 'index.html', 'build.mjs', 'package.json', 'package-lock.json'].map(name => path.join(pilotRoot, name)),
  ].sort();
  const fingerprint = async () => Object.fromEntries(await Promise.all(sourceFiles.map(async file => [
    path.relative(repoRoot, file).split(path.sep).join('/'), sha256(await fs.readFile(file)),
  ])));
  const before = await fingerprint();
  const engine = createContractEngine({ repoRoot, packageRoot, tokens });
  const validation = engine.validate();
  if (!validation.valid) throw new Error(`Contracts failed validation: ${JSON.stringify(validation.issues)}`);
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
  const catalog = { profiles, profile: engine.bundle.profile, provenance };
  await fs.mkdir(outputDir, { recursive: true });
  const result = await build({
    absWorkingDir: pilotRoot,
    entryPoints: [path.join(pilotRoot, 'app.tsx')],
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
      '@seda-ai/ui/styles.css': path.join(repoRoot, 'packages/seda-ui/src/styles.css'),
      '@seda-ai/ui': path.join(repoRoot, 'packages/seda-ui/src/index.ts'),
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
  const after = await fingerprint();
  const afterTokens = await fs.readFile(tokenPath);
  if (JSON.stringify(before) !== JSON.stringify(after) || sha256(tokenBytes) !== sha256(afterTokens)) {
    throw new Error('A source changed during the build. Rebuild before verifying the page.');
  }
  const artifacts = [];
  for (const name of [...Object.keys(result.metafile.outputs), path.join(outputDir, 'index.html')]) {
    const file = path.resolve(pilotRoot, name);
    const relative = path.relative(outputDir, file).split(path.sep).join('/');
    if (relative.startsWith('../')) throw new Error(`Unexpected output outside build directory: ${name}`);
    const bytes = await fs.readFile(file);
    artifacts.push({ path: relative, bytes: bytes.length, sha256: sha256(bytes) });
  }
  const metadata = {
    kind: 'seda-parametric-build',
    builtAt: new Date().toISOString(),
    configurationCount: Object.keys(profiles).length,
    provenance,
    artifacts: artifacts.sort((a, b) => a.path.localeCompare(b.path)),
    validation: { valid: validation.valid, planned: validation.planned },
    sourceAudit: { valid: audit.valid },
    runtimeConformance: 'not-checked',
  };
  await fs.writeFile(path.join(outputDir, 'build-metadata.json'), JSON.stringify(metadata, null, 2) + '\n');
  return { outputDir, metadata };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { outputDir, metadata } = await buildPilot();
  console.log(JSON.stringify({ outputDir, profileCount: metadata.configurationCount, sourceAudit: metadata.sourceAudit.valid, tokenHash: metadata.provenance.tokensSha256 }, null, 2));
}
