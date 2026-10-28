import { createTokenResolver } from '../../../../packages/seda-contracts/src/tokens.mjs';
import { parseOklch } from './owner-color.mjs';

const modes = { foundation: ['Mode 1'], semantic: ['Light', 'Dark'], components: ['Mode 1'] };
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

export const tokenKey = (collection, mode, path) => `${collection}|${mode}|${path}`;

export function colorCatalog(source) {
  const entries = [];
  for (const [collection, collectionModes] of Object.entries(modes)) {
    for (const mode of collectionModes) {
      const root = source.$collections[collection].$modes[mode];
      function visit(node, parts = []) {
        if (node && typeof node === 'object' && own(node, '$value')) {
          if (node.$type === 'color') entries.push({ collection, mode, path: parts.join('/'), key: tokenKey(collection, mode, parts.join('/')), authored: node.$value, group: collection === 'semantic' ? parts[0] : parts[1], component: collection === 'components' ? parts[0] : null });
          return;
        }
        if (!node || typeof node !== 'object') return;
        for (const [name, child] of Object.entries(node)) if (!name.startsWith('$')) visit(child, [...parts, name]);
      }
      visit(root);
    }
  }
  return entries;
}

export function applyWorkbenchEdits(source, edits, catalog = colorCatalog(source)) {
  if (!edits || typeof edits !== 'object' || Array.isArray(edits)) throw new Error('Некорректный черновик токенов.');
  const byKey = new Map(catalog.map(item => [item.key, item]));
  const foundation = new Set(catalog.filter(item => item.collection === 'foundation').map(item => item.path));
  const semantic = new Set(catalog.filter(item => item.collection === 'semantic').map(item => item.path));
  const copy = structuredClone(source);
  for (const [key, value] of Object.entries(edits)) {
    const item = byKey.get(key);
    if (!item) throw new Error(`Неизвестный токен ${key}.`);
    if (typeof value !== 'string' || value.length > 120) throw new Error(`Некорректное значение ${item.path}.`);
    if (item.collection === 'foundation' && !parseOklch(value)) throw new Error(`Палитра ${item.path}: нужен OKLCH, например oklch(60% 0.15 240).`);
    if (item.collection === 'semantic' && (!/^\{color\.[\w.-]+\}$/.test(value) || !foundation.has(value.slice(1, -1).replaceAll('.', '/')))) throw new Error(`Семантический токен ${item.path} должен ссылаться напрямую на цвет палитры.`);
    if (item.collection === 'components' && (!/^\{[\w.-]+\}$/.test(value) || !semantic.has(value.slice(1, -1).replaceAll('.', '/')))) throw new Error(`Токен ${item.path} должен ссылаться на семантическую роль.`);
    let node = copy.$collections[item.collection].$modes[item.mode];
    for (const part of item.path.split('/')) node = node?.[part];
    if (!node || node.$type !== 'color' || !own(node, '$value')) throw new Error(`Токен ${item.path} отсутствует в источнике.`);
    node.$value = value;
  }
  const resolver = createTokenResolver(copy);
  for (const item of catalog) {
    if (item.collection === 'semantic' && item.mode === 'Dark') continue;
    for (const theme of ['Light', 'Dark']) resolver.resolve({ collection: item.collection, path: item.path.split('/'), expectedType: 'color' }, { theme });
  }
  return copy;
}

export function resolvedToken(source, item, theme) {
  const resolver = createTokenResolver(source);
  const result = resolver.resolve({ collection: item.collection, path: item.path.split('/'), expectedType: 'color' }, { theme });
  return { value: result.cssValue, chain: result.chain.map(step => `${step.collection}/${step.mode}/${step.path.join('/')}`) };
}

export function directAlias(item) { return `{${item.path.replaceAll('/', '.')}}`; }

export function tokenRelations(source, catalog, target, theme) {
  const marker = `${target.collection}/${target.mode}/${target.path}`;
  const resolver = createTokenResolver(source);
  const byStep = new Map(catalog.map(item => [`${item.collection}/${item.mode}/${item.path}`, item]));
  const chain = resolver.resolve({ collection: target.collection, path: target.path.split('/'), expectedType: 'color' }, { theme }).chain;
  const sources = chain.slice(1).map(step => byStep.get(`${step.collection}/${step.mode}/${step.path.join('/')}`)).filter(Boolean);
  const dependents = catalog.filter(item => (item.collection !== 'semantic' || item.mode === theme) && item.key !== target.key && resolver.resolve({ collection: item.collection, path: item.path.split('/'), expectedType: 'color' }, { theme }).chain.some(step => `${step.collection}/${step.mode}/${step.path.join('/')}` === marker));
  return { sources, dependents };
}

export function dependencyCount(source, catalog, target, theme) { return tokenRelations(source, catalog, target, theme).dependents.length; }

export function workbenchColorVariables(source, theme) {
  const resolver = createTokenResolver(source);
  return Object.fromEntries(colorCatalog(source)
    .filter(item => item.collection === 'components' || item.collection === 'semantic' && item.mode === theme)
    .map(item => ['--' + item.path.replaceAll('/', '-'), resolver.resolve({ collection: item.collection, path: item.path.split('/'), expectedType: 'color' }, { theme }).cssValue]));
}
