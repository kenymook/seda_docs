import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

import { componentNames as COMPONENTS } from './registry.mjs';
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const pointer = value => String(value).replaceAll('~', '~0').replaceAll('/', '~1');
const issue = (code, name, message, status = 'violated') => ({
  code, path: name == null ? '/props' : `/props/${pointer(name)}`, message,
  severity: status === 'not-checked' ? 'warning' : 'error', status,
});

function literalValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) return -Number(node.operand.text);
  return { $expression: node.getText() };
}

function implementationMetadata(file, component, repoRoot) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declaration = source.statements.flatMap(statement => ts.isVariableStatement(statement) ? [...statement.declarationList.declarations] : [])
    .find(node => ts.isIdentifier(node.name) && node.name.text === component);
  const initializer = declaration?.initializer;
  if (!initializer || !ts.isCallExpression(initializer) || !initializer.typeArguments?.[0]) {
    throw new Error(`API_SOURCE_UNSUPPORTED: ${component} must expose its forwardRef element type`);
  }
  const elementType = initializer.typeArguments[0].getText(source);
  const render = initializer.arguments[0];
  const pattern = render && (ts.isArrowFunction(render) || ts.isFunctionExpression(render)) ? render.parameters[0]?.name : null;
  if (!pattern || !ts.isObjectBindingPattern(pattern)) throw new Error(`API_SOURCE_UNSUPPORTED: ${component} must expose a destructured render parameter to audit defaults`);
  const defaults = Object.fromEntries(pattern.elements.filter(element => element.initializer).map(element => [element.propertyName?.text ?? element.name.text, literalValue(element.initializer)]));
  const defaultSources = {};
  const sizeBinding = pattern.elements.find(element => (element.propertyName?.text ?? element.name.text) === 'size');
  if (sizeBinding && !sizeBinding.initializer) {
    const hookImport = source.statements.filter(ts.isImportDeclaration).find(node => node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings) && node.importClause.namedBindings.elements.some(item => (item.propertyName?.text ?? item.name.text) === 'useSedaSize'));
    const importedName = hookImport?.importClause.namedBindings.elements.find(item => (item.propertyName?.text ?? item.name.text) === 'useSedaSize')?.name.text;
    const calls = render.body && ts.isBlock(render.body) ? render.body.statements.flatMap(node => ts.isVariableStatement(node) ? [...node.declarationList.declarations] : []) : [];
    const binding = calls.find(node => node.name.getText(source) === 'size' && ts.isCallExpression(node.initializer) && node.initializer.expression.getText(source) === importedName && node.initializer.arguments.length === 1 && node.initializer.arguments[0].getText(source) === sizeBinding.name.getText(source));
    if (!hookImport || !binding || !ts.isStringLiteral(hookImport.moduleSpecifier)) throw new Error(`API_SOURCE_UNSUPPORTED: ${component} size must use the explicit useSedaSize protocol`);
    const helperFile = path.resolve(path.dirname(file), hookImport.moduleSpecifier.text + '.tsx');
    const helper = ts.createSourceFile(helperFile, fs.readFileSync(helperFile, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const variables = helper.statements.flatMap(node => ts.isVariableStatement(node) ? [...node.declarationList.declarations] : []);
    const configurationExpression = variables.find(node => node.name.getText(helper) === 'defaultConfiguration')?.initializer;
    const configuration = configurationExpression && ts.isCallExpression(configurationExpression) && configurationExpression.expression.getText(helper) === 'Object.freeze' ? configurationExpression.arguments[0] : configurationExpression;
    const context = variables.find(node => node.name.getText(helper) === 'SedaContext')?.initializer;
    const hook = helper.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'useSedaSize');
    const statements = hook?.body?.statements;
    const contextRead = statements?.find(ts.isVariableStatement)?.declarationList.declarations[0];
    const returned = statements?.find(ts.isReturnStatement)?.expression;
    if (!configuration || !ts.isObjectLiteralExpression(configuration) || !context || !ts.isCallExpression(context) || context.expression.getText(helper) !== 'createContext' || context.arguments[0]?.getText(helper) !== 'defaultConfiguration' || !contextRead || contextRead.name.getText(helper) !== 'configuration' || contextRead.initializer?.getText(helper).replace(/\s/g,'') !== 'useContext(SedaContext)' || returned?.getText(helper).replace(/\s/g,'') !== 'size??configuration.controlSize') throw new Error('API_SOURCE_UNSUPPORTED: size fallback/context protocol changed; audit it explicitly');
    const sizeDefault = configuration.properties.find(node => ts.isPropertyAssignment(node) && node.name.getText(helper) === 'controlSize');
    if (!sizeDefault) throw new Error('API_SOURCE_UNSUPPORTED: missing standalone controlSize fallback');
    defaults.size = literalValue(sizeDefault.initializer);
    defaultSources.size = { sourcePath: path.relative(repoRoot, helperFile).split(path.sep).join('/'), scope: 'standalone-fallback', providerOverride: true };
  }
  return { elementType, defaults, defaultSources };
}

function enumValues(type) {
  const members = (type.isUnion() ? type.types : [type]).filter(part => !(part.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Void)));
  const values = [];
  for (const part of members) {
    if (part.flags & (ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral)) values.push(part.value);
    else if (part.flags & ts.TypeFlags.BooleanLiteral) values.push(part.intrinsicName === 'true');
    else if (part.flags & ts.TypeFlags.Null) values.push(null);
    else return undefined;
  }
  return values.length ? [...new Set(values)] : undefined;
}

/**
 * Read the actual exported interfaces and forwardRef element types through
 * TypeScript. Validation operates on
 * serializable recipe values, not on a rendered DOM or arbitrary React trees.
 * $slot is an opaque ReactElement binding; $handler is an opaque void callback.
 */
export function createApiInspector({ repoRoot, packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..') }) {
  if (!repoRoot) throw new Error('repoRoot is required');
  repoRoot = path.resolve(repoRoot);
  packageRoot = path.resolve(packageRoot);
  const files = Object.fromEntries(COMPONENTS.map(name => [name, {
    types: path.join(repoRoot, 'packages/seda-ui/src/components', name, `${name}.types.ts`),
    implementation: path.join(repoRoot, 'packages/seda-ui/src/components', name, `${name}.tsx`),
  }]));
  const reactTypes = path.join(packageRoot, 'node_modules/@types/react/index.d.ts');
  if (!fs.existsSync(reactTypes)) throw new Error('API_DEPENDENCY_MISSING: run npm ci in packages/seda-contracts');
  const probeFile = path.join(packageRoot, '__seda_api_probe__.ts');
  const implementations = Object.fromEntries(COMPONENTS.map(name => [name, implementationMetadata(files[name].implementation, name, repoRoot)]));
  const imports = COMPONENTS.map(name => `import type { ${name}Props } from ${JSON.stringify(files[name].types)};`).join('\n');
  const publicTypes = COMPONENTS.map(name => `type __${name}PublicProps = ${name}Props & RefAttributes<${implementations[name].elementType}>;`).join('\n');
  const sharedTypes = path.join(repoRoot, 'packages/seda-ui/src/types.ts');
  const header = `${imports}\nimport type { SedaSize as __SedaPublicSize } from ${JSON.stringify(sharedTypes)};\nimport type { ReactElement, RefAttributes } from 'react';\ntype __SedaSlot = ReactElement;\n${publicTypes}\n`;
  let probeText = header;
  let probeSource;
  const options = {
    strict: true, noEmit: true, skipLibCheck: true, types: [],
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, allowImportingTsExtensions: true,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
  };
  const host = ts.createCompilerHost(options);
  const originalReadFile = host.readFile.bind(host);
  const originalFileExists = host.fileExists.bind(host);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  const sourceCache = new Map();
  host.readFile = file => path.resolve(file) === probeFile ? probeText : originalReadFile(file);
  host.fileExists = file => path.resolve(file) === probeFile || originalFileExists(file);
  host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => {
    if (path.resolve(file) === probeFile) return probeSource ??= ts.createSourceFile(file, probeText, languageVersion, true);
    // One inspector represents one source snapshot. Recreate it after source edits.
    if (!sourceCache.has(file)) sourceCache.set(file, originalGetSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile));
    return sourceCache.get(file);
  };
  host.resolveModuleNames = (names, containingFile) => names.map(name => name === 'react'
    ? { resolvedFileName: reactTypes, extension: ts.Extension.Dts, isExternalLibraryImport: true }
    : ts.resolveModuleName(name, containingFile, options, host).resolvedModule);
  let program = ts.createProgram([probeFile, ...Object.values(files).map(file => file.types)], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) {
    const detail = diagnostics.map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')).join('\n');
    throw new Error(`API_SOURCE_INVALID: ${detail}`);
  }
  const checker = program.getTypeChecker();
  const slotDeclaration = program.getSourceFile(probeFile).statements.find(node => ts.isTypeAliasDeclaration(node) && node.name.text === '__SedaSlot');
  const slotType = checker.getTypeAtLocation(slotDeclaration);
  const metadata = new Map();
  for (const name of COMPONENTS) {
    const source = program.getSourceFile(files[name].types);
    const declaration = source.statements.find(node => (ts.isInterfaceDeclaration(node)||ts.isTypeAliasDeclaration(node)) && node.name.text === `${name}Props`);
    if (!declaration) throw new Error(`API_SOURCE_UNSUPPORTED: missing ${name}Props declaration`);
    const ownNames=new Set(),seen=new Set();
    const collect=node=>{
      if(!node||seen.has(node))return;seen.add(node);
      if(ts.isInterfaceDeclaration(node)||ts.isTypeLiteralNode(node)){for(const member of node.members)if(ts.isPropertySignature(member)&&member.name)ownNames.add(member.name.getText(source).replace(/^['"]|['"]$/g,''));for(const clause of node.heritageClauses??[])for(const base of clause.types){const name=base.expression.getText(source);collect(source.statements.find(n=>(ts.isInterfaceDeclaration(n)||ts.isTypeAliasDeclaration(n))&&n.name.text===name));}}
      else if(ts.isTypeAliasDeclaration(node)||ts.isParenthesizedTypeNode(node))collect(node.type);
      else if(ts.isUnionTypeNode(node)||ts.isIntersectionTypeNode(node))node.types.forEach(collect);
      else if(ts.isTypeReferenceNode(node)&&ts.isIdentifier(node.typeName))collect(source.statements.find(n=>(ts.isInterfaceDeclaration(n)||ts.isTypeAliasDeclaration(n))&&n.name.text===node.typeName.text));
    };collect(declaration);
    const publicDeclaration = program.getSourceFile(probeFile).statements.find(node => ts.isTypeAliasDeclaration(node) && node.name.text === `__${name}PublicProps`);
    const type = checker.getTypeAtLocation(publicDeclaration);
    const props = {};
    for (const symbol of checker.getPropertiesOfType(type)) {
      const propertyType = checker.getTypeOfSymbolAtLocation(symbol, declaration);
      const members = propertyType.isUnion() ? propertyType.types : [propertyType];
      const values = enumValues(propertyType);
      props[symbol.name] = {
        name: symbol.name, required: !(symbol.flags & ts.SymbolFlags.Optional),
        type: checker.typeToString(propertyType, undefined, ts.TypeFormatFlags.NoTruncation),
        ...(values ? { enumValues: values } : {}),
        origin: ownNames.has(symbol.name) ? 'own' : ['ref', 'key'].includes(symbol.name) ? 'react' : 'native',
        acceptsHandler: members.some(member => checker.getSignaturesOfType(member, ts.SignatureKind.Call).length > 0),
        ...(members.flatMap(member=>checker.getSignaturesOfType(member,ts.SignatureKind.Call)).length>0&&members.flatMap(member=>checker.getSignaturesOfType(member,ts.SignatureKind.Call)).every(signature=>!!(checker.getReturnTypeOfSignature(signature).flags&ts.TypeFlags.StringLike))?{handlerReturnsString:true}:{}),
        acceptsSlot: checker.isTypeAssignableTo(slotType, propertyType),
      };
    }
    metadata.set(name, {
      name, sourcePath: path.relative(repoRoot, files[name].types).split(path.sep).join('/'),
      implementationPath: path.relative(repoRoot, files[name].implementation).split(path.sep).join('/'),
      props, refElement: implementations[name].elementType, observedDefaults: implementations[name].defaults, defaultSources: implementations[name].defaultSources,
      ...(type.isUnion()?{discriminatedUnion:true}:{}),
    });
  }

  function get(name) {
    if (!metadata.has(name)) throw new Error(`API_UNKNOWN_COMPONENT: ${name}`);
    return structuredClone(metadata.get(name));
  }

  function validate(name, props, { requireRequired = true } = {}) {
    const api = metadata.get(name);
    if (!api) return [issue('API_UNKNOWN_COMPONENT', null, `Unknown component ${name}`)];
    if (!props || typeof props !== 'object' || Array.isArray(props)) return [issue('API_PROPS_OBJECT', null, 'Props must be an object')];
    const issues = [];
    if (requireRequired) for (const prop of Object.values(api.props)) {
      if (prop.required && !own(props, prop.name)) issues.push(issue('API_REQUIRED_PROP', prop.name, `${name}.${prop.name} is required by the TypeScript interface`));
    }
    const entries = [];
    for (const [key, value] of Object.entries(props)) {
      const prop = api.props[key];
      if (!prop) {
        if (/^data-[A-Za-z0-9_.:-]+$/.test(key)) {
          if (value != null && !['string', 'number', 'boolean', 'undefined'].includes(typeof value)) issues.push(issue('API_DATA_ATTRIBUTE_VALUE', key, 'A data attribute must be a scalar value'));
        } else issues.push(issue('API_UNKNOWN_PROP', key, `${key} is not part of the actual ${name}Props interface`));
        continue;
      }
      try {
        let expression;
        if (value && typeof value === 'object' && (own(value, '$handler') || own(value, '$slot'))) {
          const descriptor = own(value, '$handler') ? '$handler' : '$slot';
          const allowed = descriptor === '$handler' ? prop.acceptsHandler : prop.acceptsSlot;
          if (Object.keys(value).length !== 1 || typeof value[descriptor] !== 'string' || !value[descriptor].trim()) {
            issues.push(issue('API_BINDING_DESCRIPTOR', key, `${descriptor} must be the only key and contain a nonempty binding name`));
            continue;
          }
          if (!allowed) {
            issues.push(issue('API_BINDING_TYPE', key, `${descriptor} is not assignable to ${name}.${key}: ${prop.type}`));
            continue;
          }
          expression = descriptor === '$handler' ? prop.handlerReturnsString?'(...__args: any[]): string => ""':'(...__args: any[]): void => {}' : '(null as unknown as __SedaSlot)';
        } else expression = serialize(value, new Set());
        entries.push({ key, expression });
      } catch (error) {
        issues.push(issue(error.code ?? 'API_VALUE_UNCHECKED', key, error.message, error.code ? 'violated' : 'not-checked'));
      }
    }
    return [...issues, ...checkExpressions(name, entries, 'API_PROP_TYPE', {complete:requireRequired&&api.discriminatedUnion})];
  }

  /** Check a binding's whole value domain, rather than one current sample. */
  function validateBindingTypes(name, mapping) {
    const api = metadata.get(name);
    if (!api) return [issue('API_UNKNOWN_COMPONENT', null, `Unknown component ${name}`)];
    if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
      return [issue('BINDING_TYPE_MISMATCH', null, 'Binding domains must be an object')];
    }
    const expressions = {
      size: '(null as unknown as NonNullable<__SedaPublicSize>)',
      string: '(null as unknown as string)',
      'optional-string': '(null as unknown as string | undefined)',
      boolean: '(null as unknown as boolean)',
    };
    const entries = [];
    const issues = [];
    for (const [key, domain] of Object.entries(mapping)) {
      if (typeof domain !== 'string' || !own(expressions, domain)) {
        issues.push(issue('BINDING_DOMAIN_UNKNOWN', key, `Unsupported binding domain: ${String(domain)}`));
        continue;
      }
      if (!api.props[key]) {
        // Every supported domain is scalar and therefore safe for data-*.
        if (!/^data-[A-Za-z0-9_.:-]+$/.test(key)) {
          issues.push(issue('BINDING_TYPE_MISMATCH', key, `${key} is not part of the actual ${name} public props`));
        }
        continue;
      }
      entries.push({ key, expression: expressions[domain] });
    }
    return [...issues, ...checkExpressions(name, entries, 'BINDING_TYPE_MISMATCH')];
  }

  function checkExpressions(name, entries, code, {complete=false}={}) {
    if (!entries.length) return [];
    const issues = [];
    // Presence is checked above; Pick preserves each provided property's actual
    // requiredness/type. Partial would incorrectly admit undefined for a
    // required string such as IconButton's aria-label.
    const providedKeys = entries.map(entry => JSON.stringify(entry.key)).join(' | ');
    probeText = `${header}\ntype __DistributivePick<T,K extends keyof T>=T extends unknown?Pick<T,K>:never;\nconst __props = {\n${entries.map(entry => `  ${JSON.stringify(entry.key)}: ${entry.expression},`).join('\n')}\n} satisfies ${complete?`__${name}PublicProps`:`__DistributivePick<__${name}PublicProps, ${providedKeys}>`};\n`;
    probeSource = undefined;
    program = ts.createProgram(program.getRootFileNames(), options, host, program);
    const source = program.getSourceFile(probeFile);
    const valueDeclaration = source.statements.find(statement => ts.isVariableStatement(statement))?.declarationList.declarations[0];
    const object = valueDeclaration?.initializer?.expression;
    const properties = object && ts.isObjectLiteralExpression(object) ? [...object.properties] : [];
    for (const diagnostic of [...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source)]) {
      const position = diagnostic.start ?? 0;
      const property = properties.find(node => position >= node.getStart(source) && position < node.end);
      const key = property?.name?.text ?? null;
      issues.push(issue(code, key, ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')));
    }
    return issues;
  }

  function auditDefaults(name) {
    const api = get(name);
    const issues = [];
    for (const [key, value] of Object.entries(api.observedDefaults)) {
      if (value && typeof value === 'object' && own(value, '$expression')) {
        issues.push(issue('API_DEFAULT_UNCHECKED', key, `Default expression requires execution: ${value.$expression}`, 'not-checked'));
        continue;
      }
      for (const violation of validate(name, { [key]: value }, { requireRequired: false })) {
        issues.push({ ...violation, code: violation.status === 'not-checked' ? 'API_DEFAULT_UNCHECKED' : 'API_DEFAULT_OUTSIDE_TYPE', message: `Observed implementation default ${key}=${JSON.stringify(value)}: ${violation.message}` });
      }
    }
    return issues;
  }
  return { get, validate, validateBindingTypes, auditDefaults };
}

function serialize(value, ancestors) {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Non-finite numeric props are outside the serializable recipe format');
    return String(value);
  }
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'function') throw new Error('Actual JavaScript function signatures cannot be verified; use an explicit $handler binding for a void callback');
  if (typeof value !== 'object') throw new Error(`Unsupported recipe value: ${typeof value}`);
  if (ancestors.has(value)) throw new Error('Cyclic recipe values are not supported');
  if (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error('Custom object instances require a binding adapter');
  if (own(value, '$handler') || own(value, '$slot')) {
    const descriptor = own(value, '$handler') ? '$handler' : '$slot';
    if (Object.keys(value).length !== 1 || typeof value[descriptor] !== 'string' || !value[descriptor].trim()) {
      const error = new Error('Nested binding descriptor must contain exactly one nonempty $handler or $slot');
      error.code = 'API_BINDING_DESCRIPTOR';
      throw error;
    }
    // The full enclosing property is checked by TypeScript; a slot in value/label cannot bypass its type.
    return descriptor === '$handler' ? '(...__args: any[]): void => {}' : '(null as unknown as __SedaSlot)';
  }
  ancestors.add(value);
  const result = Array.isArray(value)
    ? `[${value.map(item => serialize(item, ancestors)).join(',')}]`
    : `{${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}:${serialize(item, ancestors)}`).join(',')}}`;
  ancestors.delete(value);
  return result;
}
