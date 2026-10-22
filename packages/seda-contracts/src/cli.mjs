import fs from 'node:fs';
import path from 'node:path';
import { createContractEngine, ContractValidationError } from './index.mjs';

function options(argv) {
  const command = argv.shift() ?? 'validate';
  if (!['validate', 'audit', 'compile', 'context'].includes(command)) throw new Error(`Unknown command: ${command}`);
  const result = { command, json: false, overrides: {} };
  const seen = new Set();
  while (argv.length) {
    const flag = argv.shift();
    if (seen.has(flag)) throw new Error(`Repeated option: ${flag}`);
    seen.add(flag);
    if (flag === '--json') { result.json = true; continue; }
    if (!['--theme', '--size', '--density', '--output'].includes(flag)) throw new Error(`Unknown option: ${flag}`);
    const value = argv.shift();
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (flag === '--output') result.output = value;
    else {
      if (command !== 'compile') throw new Error(`${flag} is only supported by compile`);
      result.overrides[{ '--theme': 'theme', '--size': 'controlSize', '--density': 'density' }[flag]] = value;
    }
  }
  return result;
}

function markdownContext(engine) {
  const { system, profile, contracts } = engine.bundle;
  const lines = ['# SEDA AI Generated contract context', '', '> Generated from contracts, profile and current TypeScript sources. Do not edit this output.', '', `Contract version: ${system.schemaVersion}. UI conformance: not-checked.`, '', '## Configuration', '', JSON.stringify(profile.configuration), '', '## Components', ''];
  for (const contract of contracts) {
    const api = engine.api.get(contract.id);
    lines.push(`### ${contract.id}`, '', `Source: ${api.sourcePath}`, '', `Observed defaults: ${JSON.stringify(api.observedDefaults)}`, '', `Target default overrides: ${JSON.stringify(contract.targetDefaults)}`, '', '| Own property | Type | Required |', '| --- | --- | --- |');
    for (const prop of Object.values(api.props).filter(prop => prop.origin === 'own')) lines.push(`| ${prop.name} | ${prop.type.replaceAll('|', '\\|')} | ${prop.required} |`);
    lines.push('', `Also inherits ${Object.values(api.props).filter(prop => prop.origin !== 'own').length} native/React properties, including the actual forwardRef attributes. The public inspector validates their real TypeScript types.`, '', 'Rules:', '');
    for (const rule of contract.rules) lines.push(`- ${rule.id}: ${rule.condition} → ${rule.expected} Check: ${rule.check}; layer: ${rule.layer}; decision: ${rule.decision}.`);
    lines.push('', 'Capabilities:', '');
    for (const capability of contract.capabilities) lines.push(`- ${capability.id}: ${capability.status}. ${capability.reason}`);
    lines.push('');
  }
  lines.push('## Form events', '');
  const compiled = engine.compile();
  for (const event of compiled.form.events) lines.push(`- ${event.event}: ${event.condition} → ${event.expected} (model verification)`);
  lines.push('', '## Current source default audit', '', '```json', JSON.stringify(engine.audit(), null, 2), '```', '', '## Planned additions', '', '```json', JSON.stringify(system.plannedTokenAdditions, null, 2), '```', '');
  return lines.join('\n');
}

try {
  const args = options(process.argv.slice(2));
  const engine = createContractEngine();
  let result;
  if (args.command === 'validate') result = { ...engine.validate(), provenance: engine.provenance() };
  else if (args.command === 'audit') result = engine.audit();
  else if (args.command === 'compile') result = engine.compile(undefined, { overrides: args.overrides });
  else {
    const report = engine.validate();
    if (!report.valid) throw new ContractValidationError(report.issues);
    result = args.json ? { generated: true, runtimeConformance: 'not-checked', bundle: engine.bundle, api: engine.bundle.contracts.map(contract => engine.api.get(contract.id)), audit: engine.audit(), provenance: engine.provenance() } : markdownContext(engine);
  }
  let output;
  if (typeof result === 'string') output = result;
  else if (args.json || args.command === 'compile' || args.output) output = JSON.stringify(result, null, 2) + '\n';
  else {
    output = `${args.command}: ${result.valid ? 'PASS' : 'FAIL'} (${result.scope})\n`;
    for (const item of result.issues) output += `${item.status}: ${item.code} ${item.path} — ${item.message}\n`;
    if (result.targetDrift?.length) output += `Target default drift: ${result.targetDrift.length}\n`;
    if (result.planned?.length) output += `Planned token checks: ${result.planned.length}; status decision-needed (not fabricated).\n`;
    if (result.deferredChecks) output += `Browser checks: ${result.deferredChecks.length} not-checked.\n`;
    output += 'UI conformance: not-checked.\n';
  }
  if (args.output) { const destination = path.resolve(args.output); fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.writeFileSync(destination, output); console.log(`Written ${destination}`); }
  else process.stdout.write(output);
  if (result.valid === false) process.exitCode = 1;
} catch (error) {
  process.stderr.write(JSON.stringify({ error: error.name, message: error.message, ...(error.issues ? { issues: error.issues } : {}) }, null, 2) + '\n');
  process.exitCode = 1;
}
