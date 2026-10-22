/**
 * Resolver for SEDA's current token document, not a general DTCG resolver.
 * Foundation/components use Mode 1; semantic uses the requested Light/Dark.
 * An unqualified alias must match exactly one of these three collections.
 * Numeric values stay unitless unless the caller requests the px adapter.
 * Planned additions are reported, never fabricated.
 */

const COLLECTIONS = ["semantic", "foundation", "components"];
const TYPES = ["number", "string", "color"];
const OWN = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);

export class TokenResolutionError extends Error {
  constructor(code, path, message) {
    super(message);
    this.name = "TokenResolutionError";
    this.code = code;
    this.path = path;
  }
}

function fail(code, path, message) {
  throw new TokenResolutionError(code, path, message);
}

function reference(ref) {
  if (!object(ref)) fail("TOKEN_REF_INVALID", "/tokenRef", "Token reference must be an object.");
  for (const key of Object.keys(ref)) {
    if (!["collection", "path", "expectedType", "unit"].includes(key)) {
      fail("TOKEN_REF_INVALID", `/tokenRef/${key}`, `Unknown token reference field: ${key}.`);
    }
  }
  if (!COLLECTIONS.includes(ref.collection)) {
    fail("TOKEN_COLLECTION_UNKNOWN", "/tokenRef/collection", `Unknown token collection: ${String(ref.collection)}.`);
  }
  if (!Array.isArray(ref.path) || !ref.path.length || ref.path.some(part => typeof part !== "string" || !part.length)) {
    fail("TOKEN_REF_INVALID", "/tokenRef/path", "Token path must contain nonempty string segments.");
  }
  if (ref.expectedType !== undefined && !TYPES.includes(ref.expectedType)) {
    fail("TOKEN_TYPE_UNSUPPORTED", "/tokenRef/expectedType", `Unsupported expected type: ${String(ref.expectedType)}.`);
  }
  if (ref.unit !== undefined && ref.unit !== "px") {
    fail("TOKEN_UNIT_UNSUPPORTED", "/tokenRef/unit", `Unsupported explicit unit: ${String(ref.unit)}.`);
  }
  return {
    collection: ref.collection,
    path: [...ref.path],
    ...(ref.expectedType === undefined ? {} : { expectedType: ref.expectedType }),
    ...(ref.unit === undefined ? {} : { unit: ref.unit }),
  };
}

function location(ref, mode) {
  return `/${ref.collection}/${mode}/${ref.path.join("/")}`;
}

function read(root, path) {
  let node = root;
  for (const part of path) {
    if (!object(node) || !OWN(node, part)) return { found: false };
    node = node[part];
  }
  return { found: true, node };
}

function aliasPath(value, at) {
  if (typeof value !== "string") return null;
  if (!value.includes("{") && !value.includes("}")) return null;
  const match = /^\{([^{}]+)\}$/.exec(value);
  if (!match || match[1].split(".").some(part => !part.length || part.trim() !== part)) {
    fail("TOKEN_ALIAS_INVALID", at, `Only whole-value dot-path aliases are supported: ${value}.`);
  }
  return match[1].split(".");
}

export function createTokenResolver(tokens) {
  if (!object(tokens) || !object(tokens.$collections)) {
    fail("TOKEN_DOCUMENT_INVALID", "/$collections", "Token document must contain $collections.");
  }

  function themeOf(options = {}) {
    if (!object(options)) fail("TOKEN_OPTIONS_INVALID", "/options", "Resolver options must be an object.");
    for (const key of Object.keys(options)) {
      if (key !== "theme") fail("TOKEN_OPTIONS_INVALID", `/options/${key}`, `Unknown resolver option: ${key}.`);
    }
    const theme = OWN(options, "theme") ? options.theme : "Light";
    if (theme !== "Light" && theme !== "Dark") {
      fail("TOKEN_MODE_UNKNOWN", "/theme", `Unsupported semantic theme: ${String(theme)}.`);
    }
    return theme;
  }

  function modeOf(collection, theme) {
    const mode = collection === "semantic" ? theme : "Mode 1";
    const entry = tokens.$collections[collection];
    if (!object(entry) || !object(entry.$modes) || !OWN(entry.$modes, mode) || !object(entry.$modes[mode])) {
      fail("TOKEN_MODE_MISSING", `/${collection}/${mode}`, `Token mode ${collection}/${mode} does not exist. No fallback mode is used.`);
    }
    return { mode, root: entry.$modes[mode] };
  }

  function lookup(ref, theme) {
    const { mode, root } = modeOf(ref.collection, theme);
    const found = read(root, ref.path);
    if (!found.found) {
      fail("TOKEN_NOT_FOUND", location(ref, mode), `Token path ${location(ref, mode)} does not exist.`);
    }
    return { ...found, mode };
  }

  function lookupAlias(path, theme, at) {
    const matches = [];
    // No missing mode is silently replaced by a default mode.
    for (const collection of COLLECTIONS) {
      const { root } = modeOf(collection, theme);
      if (read(root, path).found) matches.push({ collection, path });
    }
    if (!matches.length) fail("TOKEN_ALIAS_NOT_FOUND", at, `Alias {${path.join(".")}} has no target in the selected modes.`);
    if (matches.length > 1) {
      fail("TOKEN_ALIAS_AMBIGUOUS", at, `Alias {${path.join(".")}} matches multiple collections: ${matches.map(match => match.collection).join(", ")}.`);
    }
    return matches[0];
  }

  function resolveLeaf(ref, theme, visited) {
    const { node, mode } = lookup(ref, theme);
    const at = location(ref, mode);
    // Array serialization distinguishes a slash in a segment from a separator.
    const key = JSON.stringify([ref.collection, mode, ref.path]);
    if (visited.has(key)) fail("TOKEN_ALIAS_CYCLE", at, `Token alias cycle detected at ${at}.`);
    if (!object(node) || !OWN(node, "$value")) {
      fail("TOKEN_BRANCH_AS_LEAF", at, `Expected a token leaf at ${at}; received a branch or malformed leaf.`);
    }
    if (!TYPES.includes(node.$type)) fail("TOKEN_TYPE_UNSUPPORTED", at, `Unsupported token type: ${String(node.$type)}.`);
    const chain = [{ collection: ref.collection, mode, path: [...ref.path] }];
    const path = aliasPath(node.$value, at);
    let value = node.$value;
    if (path) {
      const target = resolveLeaf(lookupAlias(path, theme, at), theme, new Set(visited).add(key));
      if (target.type !== node.$type) {
        fail("TOKEN_TYPE_MISMATCH", at, `Alias declares ${node.$type} but resolves to ${target.type}.`);
      }
      value = target.value;
      chain.push(...target.chain);
    } else if (node.$type === "number" ? typeof value !== "number" || !Number.isFinite(value) : typeof value !== "string" || !value.length) {
      fail("TOKEN_VALUE_INVALID", at, `Invalid ${node.$type} token value at ${at}.`);
    }
    return { value, type: node.$type, chain };
  }

  function resolve(input, options = {}) {
    const ref = reference(input);
    const theme = themeOf(options);
    const result = resolveLeaf(ref, theme, new Set());
    const at = location(ref, ref.collection === "semantic" ? theme : "Mode 1");
    if (ref.expectedType && result.type !== ref.expectedType) {
      fail("TOKEN_TYPE_MISMATCH", at, `Expected ${ref.expectedType}; resolved ${result.type}.`);
    }
    if (ref.unit && result.type !== "number") {
      fail("TOKEN_UNIT_UNSUPPORTED", at, `The px adapter requires a number; resolved ${result.type}.`);
    }
    return { ref, ...result, cssValue: ref.unit === "px" ? `${result.value}px` : result.value };
  }

  function resolveBranch(input, options = {}) {
    const ref = reference(input);
    const theme = themeOf(options);
    const { node, mode } = lookup(ref, theme);
    const at = location(ref, mode);
    if (!object(node) || OWN(node, "$value")) fail("TOKEN_LEAF_AS_BRANCH", at, `Expected a token branch at ${at}.`);
    function descend(value, path) {
      if (!object(value)) fail("TOKEN_BRANCH_INVALID", at, `Malformed token branch at ${path.join("/")}.`);
      if (OWN(value, "$value")) return resolve({ ...ref, path }, options);
      const entries = Object.entries(value).filter(([name]) => !name.startsWith("$"));
      if (!entries.length) fail("TOKEN_BRANCH_EMPTY", at, `Token branch ${path.join("/")} contains no leaves.`);
      return Object.fromEntries(entries.map(([name, child]) => [name, descend(child, [...path, name])]));
    }
    return { ref, children: descend(node, ref.path) };
  }

  function validatePlanned(addition, options = {}) {
    if (!object(addition)) fail("TOKEN_PLAN_INVALID", "/plannedTokenAddition", "Planned addition must be an object.");
    const ref = reference(addition.ref);
    const targetRef = reference(addition.target);
    const path = aliasPath(addition.alias, "/plannedTokenAddition/alias");
    if (!path || JSON.stringify(path) !== JSON.stringify(targetRef.path)) {
      fail("TOKEN_PLAN_INVALID", "/plannedTokenAddition/alias", "Planned alias must match its explicit target path.");
    }
    const theme = themeOf(options);
    const actualTarget = lookupAlias(path, theme, "/plannedTokenAddition/alias");
    if (actualTarget.collection !== targetRef.collection) {
      fail("TOKEN_PLAN_INVALID", "/plannedTokenAddition/target", "Planned target collection does not match alias resolution.");
    }
    const target = resolve(targetRef, options);
    if (ref.expectedType && ref.expectedType !== target.type) {
      fail("TOKEN_TYPE_MISMATCH", "/plannedTokenAddition/ref", "Planned token type differs from its alias target.");
    }
    if (ref.unit && target.type !== "number") {
      fail("TOKEN_UNIT_UNSUPPORTED", "/plannedTokenAddition/ref/unit", `The px adapter requires a number; planned alias resolves to ${target.type}.`);
    }
    let existing;
    try {
      existing = resolve(ref, options);
    } catch (error) {
      if (!(error instanceof TokenResolutionError) || error.code !== "TOKEN_NOT_FOUND") throw error;
    }
    return {
      status: "decision-needed",
      exists: existing !== undefined,
      ref,
      decision: addition.decision,
      alias: addition.alias,
      target,
      ...(existing ? { existing } : {}),
      message: existing
        ? "The planned token now exists; review its implementation and retire the planned-addition record."
        : "The planned token is absent. Its target resolves, but no component token has been created.",
    };
  }

  return { resolve, resolveBranch, validatePlanned };
}
