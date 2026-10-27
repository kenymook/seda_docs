import { createTokenResolver } from '../../../../packages/seda-contracts/src/tokens.mjs';

const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const leaf = value => value !== null && typeof value === 'object' && !Array.isArray(value) && own(value, '$value');
const colorValue = value => /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(value) || /^\{[\w-]+(?:\.[\w-]+)+\}$/.test(value);

export function editableComponentTokens(evidence) {
  const result = new Map();
  for (const item of evidence) {
    if (item.type !== 'color' || item.ref?.collection !== 'components' || !Array.isArray(item.ref.path)) continue;
    const path = item.ref.path.join('/');
    if (!result.has(path)) result.set(path, { path, component: item.ref.path[0], property: item.ref.path.slice(1).join('/'), variables: [] });
    const entry = result.get(path);
    if (!entry.variables.includes(item.property)) entry.variables.push(item.property);
  }
  return [...result.values()].sort((a, b) => a.path.localeCompare(b.path));
}

export function applyTokenEdits(source, edits, editable) {
  if (!edits || typeof edits !== 'object' || Array.isArray(edits)) throw new Error('Ожидался набор изменений токенов.');
  const allowed = new Set(editable.map(item => item.path));
  const tokens = structuredClone(source);
  const root = tokens.$collections.components.$modes['Mode 1'];
  for (const [path, value] of Object.entries(edits)) {
    if (!allowed.has(path)) throw new Error(`Токен ${path} не связан с проверяемым компонентом.`);
    if (typeof value !== 'string' || value.length > 120 || !colorValue(value)) throw new Error(`Некорректное значение ${path}: нужен цвет #RRGGBB или ссылка {semantic.role}.`);
    let node = root;
    for (const part of path.split('/')) node = node?.[part];
    if (!leaf(node) || node.$type !== 'color') throw new Error(`Токен ${path} отсутствует в источнике.`);
    node.$value = value;
  }
  const resolver = createTokenResolver(tokens);
  for (const theme of ['Light', 'Dark']) {
    for (const { path } of editable) {
      const resolved = resolver.resolve({ collection: 'components', path: path.split('/'), expectedType: 'color' }, { theme });
      if (own(edits, path) && edits[path].startsWith('{') && !['semantic', 'foundation'].includes(resolved.chain[1]?.collection)) {
        throw new Error(`Токен ${path} должен ссылаться на semantic или foundation, а не на вложенный компонент.`);
      }
    }
  }
  return tokens;
}

export function resolvedColorVariables(evidence, tokens, theme) {
  const resolver = createTokenResolver(tokens);
  const vars = {};
  for (const item of evidence) {
    if (item.type !== 'color' || !item.ref) continue;
    const value = resolver.resolve(item.ref, { theme }).cssValue;
    vars[item.property] = value;
    // The public components consume the token namespace directly. Contract
    // adapters also expose --seda-* evidence names; keep both bound to one leaf.
    if (item.ref.collection === 'components') vars[`--${item.ref.path.join('-')}`] = value;
  }
  return vars;
}

export function tokenDetail(tokens, path, theme) {
  const parts = path.split('/');
  let node = tokens.$collections.components.$modes['Mode 1'];
  for (const part of parts) node = node?.[part];
  if (!leaf(node)) throw new Error(`Токен ${path} отсутствует.`);
  const resolved = createTokenResolver(tokens).resolve({ collection: 'components', path: parts, expectedType: 'color' }, { theme });
  return { authored: node.$value, value: resolved.cssValue, chain: resolved.chain.map(step => `${step.collection}/${step.mode}/${step.path.join('/')}`) };
}

export function paletteColors(tokens, theme) {
  const resolver = createTokenResolver(tokens);
  const roots = {
    semantic: tokens.$collections.semantic.$modes[theme],
    foundation: tokens.$collections.foundation.$modes['Mode 1'],
    components: tokens.$collections.components.$modes['Mode 1'],
  };
  const entries = [];
  const get = (root, path) => path.reduce((node, part) => node?.[part], root);
  const visit = (collection, node, path = []) => {
    if (leaf(node)) {
      if (node.$type !== 'color') return;
      const matches = Object.values(roots).filter(root => leaf(get(root, path))).length;
      if (matches !== 1) return;
      const value = resolver.resolve({ collection, path, expectedType: 'color' }, { theme }).cssValue;
      entries.push({ collection, path: path.join('/'), group: collection === 'foundation' ? path[1] : path[0], label: collection === 'foundation' ? path.slice(2).join('/') : path.slice(1).join('/'), alias: `{${path.join('.')}}`, value });
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [name, child] of Object.entries(node)) if (!name.startsWith('$')) visit(collection, child, [...path, name]);
  };
  visit('semantic', roots.semantic);
  visit('foundation', roots.foundation.color, ['color']);
  return entries;
}
