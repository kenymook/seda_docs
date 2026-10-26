import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTokenResolver, TokenResolutionError } from "../src/tokens.mjs";

const source = JSON.parse(readFileSync(new URL("../../../tokens.json", import.meta.url), "utf8"));
const ref = (collection, ...path) => ({ collection, path });
const number = value => ({ $type: "number", $value: value });
const color = value => ({ $type: "color", $value: value });
const empty = () => ({ $collections: {
  foundation: { $modes: { "Mode 1": {} } },
  semantic: { $modes: { Light: {}, Dark: {} } },
  components: { $modes: { "Mode 1": {} } },
} });
const raises = (code, action) => assert.throws(action, error => {
  assert.ok(error instanceof TokenResolutionError);
  assert.equal(error.code, code);
  assert.equal(typeof error.path, "string");
  assert.ok(error.path.startsWith("/"));
  return true;
});
const planned = {
  ref: { ...ref("components", "text-field", "border", "disabled"), expectedType: "color" },
  alias: "{status.disabled.border}",
  target: { ...ref("semantic", "status", "disabled", "border"), expectedType: "color" },
  decision: "D16",
};

test("real component aliases resolve through semantic and foundation in both themes", () => {
  const resolver = createTokenResolver(source);
  const input = ref("components", "text-field", "foreground", "default");
  const light = resolver.resolve(input, { theme: "Light" });
  const dark = resolver.resolve(input, { theme: "Dark" });
  assert.deepEqual(light.chain.map(item => item.collection), ["components", "semantic", "foundation"]);
  assert.deepEqual(dark.chain.map(item => item.collection), ["components", "semantic", "foundation"]);
  assert.equal(light.chain[1].mode, "Light");
  assert.equal(dark.chain[1].mode, "Dark");
  assert.notEqual(light.value, dark.value);
  assert.equal(light.type, "color");
  assert.equal(light.cssValue, light.value);
  assert.deepEqual(input, ref("components", "text-field", "foreground", "default"));
});

test("field-like controls resolve the same layered surface in both themes", () => {
  const resolver = createTokenResolver(source);
  const branches = [
    ["text-field", "surface"], ["select", "surface"], ["text-area", "surface"],
    ["date-picker", "surface"], ["time-picker", "surface"],
    ["search", "input", "surface"], ["verification-code", "cell", "surface"],
    ["color-picker", "trigger", "surface"],
  ];
  for (const branch of branches) for (const theme of ["Light", "Dark"]) {
    const normal = resolver.resolve(ref("components", ...branch, "default"), { theme });
    const hovered = resolver.resolve(ref("components", ...branch, "hover"), { theme });
    assert.equal(normal.chain[1].path.join("."), "surface.control");
    assert.equal(hovered.chain[1].path.join("."), "surface.control-hover");
    assert.equal(normal.value, theme === "Dark" ? "#ffffff12" : "#ffffff");
    assert.equal(hovered.value, theme === "Dark" ? "#ffffff1c" : "#f8f8f9");
  }
  const missing = structuredClone(source);
  delete missing.$collections.semantic.$modes.Dark.surface.control;
  raises("TOKEN_ALIAS_NOT_FOUND", () => createTokenResolver(missing).resolve(ref("components", "select", "surface", "default"), { theme: "Dark" }));
});

test("field borders soften in Dark without changing Light or choice outlines", () => {
  const resolver = createTokenResolver(source);
  const states = { default: "default", hover: "hover", active: "pressed", "read-only": "default", loading: "default" };
  for (const theme of ["Light", "Dark"]) {
    for (const [componentState, roleState] of Object.entries(states)) {
      for (const component of ["text-field", "select", "text-area"]) {
        const actual = resolver.resolve(ref("components", component, "border", componentState), { theme });
        const role = resolver.resolve(ref("semantic", "border", "field", roleState), { theme });
        assert.equal(actual.value, role.value, `${theme} ${component} ${componentState}`);
        assert.equal(actual.chain[1].path.join("."), `border.field.${roleState}`);
        if (theme === "Light") assert.equal(actual.value, resolver.resolve(ref("semantic", "border", "control", roleState), { theme }).value);
      }
    }
  }
  assert.deepEqual(["default", "hover", "pressed"].map(state => resolver.resolve(ref("semantic", "border", "field", state), { theme: "Dark" }).value), ["#ffffff4d", "#ffffff59", "#ffffff66"]);
  for (const component of ["checkbox", "radio", "toggle"]) {
    const result = resolver.resolve(ref("components", component, ...(component === "toggle" ? [] : ["control"]), "border", "default"), { theme: "Dark" });
    assert.equal(result.chain[1].path.join("."), "border.control.default");
  }
  const missing = structuredClone(source);
  delete missing.$collections.semantic.$modes.Dark.border.field.hover;
  raises("TOKEN_ALIAS_NOT_FOUND", () => createTokenResolver(missing).resolve(ref("components", "select", "border", "hover"), { theme: "Dark" }));
});

test("Search input borders inherit the field roles while focus and disabled retain their own roles", () => {
  const resolver = createTokenResolver(source);
  for (const theme of ["Light", "Dark"]) {
    for (const [state, role] of [["default", "default"], ["hover", "hover"], ["active", "pressed"]]) {
      const actual = resolver.resolve(ref("components", "search", "input", "border", state), { theme });
      const expected = resolver.resolve(ref("semantic", "border", "field", role), { theme });
      assert.equal(actual.value, expected.value, `${theme} Search ${state}`);
      assert.equal(actual.chain[1].path.join("."), `border.field.${role}`);
    }
    for (const [state, role] of [["focus", "border.focus"], ["disabled", "status.disabled.border"]]) {
      const actual = resolver.resolve(ref("components", "search", "input", "border", state), { theme });
      assert.equal(actual.chain[1].path.join("."), role);
    }
  }
  const missing = structuredClone(source);
  delete missing.$collections.semantic.$modes.Dark.border.field.hover;
  raises("TOKEN_ALIAS_NOT_FOUND", () => createTokenResolver(missing).resolve(ref("components", "search", "input", "border", "hover"), { theme: "Dark" }));
});

test("all pilot component branches resolve in Light and Dark with leaf provenance", () => {
  const resolver = createTokenResolver(source);
  for (const theme of ["Light", "Dark"]) {
    for (const path of [["button", "primary", "solid"], ["button", "neutral", "secondary"], ["icon-button", "ghost"], ["text-field"]]) {
      const result = resolver.resolveBranch(ref("components", ...path), { theme });
      assert.equal(result.children.surface.default.type, "color");
      assert.deepEqual(result.children.surface.default.ref.path, [...path, "surface", "default"]);
      assert.ok(result.children.surface.default.chain.length >= 2);
    }
  }
});

test("unit conversion is explicit and does not change numeric values", () => {
  const resolver = createTokenResolver(source);
  const plain = resolver.resolve(ref("foundation", "space", "m"));
  const dimension = resolver.resolve({ ...ref("foundation", "space", "m"), expectedType: "number", unit: "px" });
  assert.equal(plain.value, 8);
  assert.equal(plain.cssValue, 8);
  assert.equal(dimension.value, 8);
  assert.equal(dimension.cssValue, "8px");
  assert.equal(resolver.resolve(ref("foundation", "font", "family")).cssValue, "Inter");
  raises("TOKEN_UNIT_UNSUPPORTED", () => resolver.resolve({ ...ref("foundation", "space", "m"), unit: "rem" }));
  raises("TOKEN_UNIT_UNSUPPORTED", () => resolver.resolve({ ...ref("foundation", "font", "family"), unit: "px" }));
});

test("missing paths and wrong leaf/branch use are distinct errors", () => {
  const resolver = createTokenResolver(source);
  raises("TOKEN_NOT_FOUND", () => resolver.resolve(ref("foundation", "space", "does-not-exist")));
  raises("TOKEN_BRANCH_AS_LEAF", () => resolver.resolve(ref("foundation", "space")));
  raises("TOKEN_LEAF_AS_BRANCH", () => resolver.resolveBranch(ref("foundation", "space", "m")));
  raises("TOKEN_TYPE_MISMATCH", () => resolver.resolve({ ...ref("foundation", "space", "m"), expectedType: "color" }));
});

test("missing selected semantic mode is not replaced with Light", () => {
  const copy = structuredClone(source);
  delete copy.$collections.semantic.$modes.Dark;
  const resolver = createTokenResolver(copy);
  raises("TOKEN_MODE_MISSING", () => resolver.resolve(ref("components", "button", "primary", "solid", "surface", "default"), { theme: "Dark" }));
  raises("TOKEN_MODE_UNKNOWN", () => resolver.resolve(ref("foundation", "space", "m"), { theme: "Sepia" }));
  raises("TOKEN_MODE_UNKNOWN", () => resolver.resolve(ref("foundation", "space", "m"), { theme: null }));
});

test("unknown collection, malformed path and unsupported expected type fail", () => {
  const resolver = createTokenResolver(source);
  raises("TOKEN_COLLECTION_UNKNOWN", () => resolver.resolve(ref("brand", "color")));
  raises("TOKEN_REF_INVALID", () => resolver.resolve({ collection: "foundation", path: [] }));
  raises("TOKEN_REF_INVALID", () => resolver.resolve({ collection: "foundation", path: ["space", ""] }));
  raises("TOKEN_TYPE_UNSUPPORTED", () => resolver.resolve({ ...ref("foundation", "space", "m"), expectedType: "dimension" }));
  raises("TOKEN_DOCUMENT_INVALID", () => createTokenResolver({}));
  raises("TOKEN_REF_INVALID", () => resolver.resolve({ ...ref("foundation", "space", "m"), mode: "Mode 2" }));
  raises("TOKEN_OPTIONS_INVALID", () => resolver.resolve(ref("foundation", "space", "m"), { mode: "Dark" }));
});

test("aliases report absent targets and invalid syntax", () => {
  const doc = empty();
  doc.$collections.components.$modes["Mode 1"].missing = color("{no.such.color}");
  doc.$collections.components.$modes["Mode 1"].malformed = color("{color..blue}");
  doc.$collections.components.$modes["Mode 1"].composite = color("mix({color.blue}, white)");
  const resolver = createTokenResolver(doc);
  raises("TOKEN_ALIAS_NOT_FOUND", () => resolver.resolve(ref("components", "missing")));
  raises("TOKEN_ALIAS_INVALID", () => resolver.resolve(ref("components", "malformed")));
  raises("TOKEN_ALIAS_INVALID", () => resolver.resolve(ref("components", "composite")));
});

test("alias lookup refuses collection ambiguity", () => {
  const doc = empty();
  doc.$collections.foundation.$modes["Mode 1"].same = number(8);
  doc.$collections.semantic.$modes.Light.same = number(12);
  doc.$collections.components.$modes["Mode 1"].consumer = number("{same}");
  const resolver = createTokenResolver(doc);
  raises("TOKEN_ALIAS_AMBIGUOUS", () => resolver.resolve(ref("components", "consumer")));
  assert.equal(resolver.resolve(ref("foundation", "same")).value, 8);
  assert.equal(resolver.resolve(ref("semantic", "same")).value, 12);
});

test("cyclic aliases terminate with a typed error", () => {
  const doc = empty();
  doc.$collections.foundation.$modes["Mode 1"].a = number("{b}");
  doc.$collections.semantic.$modes.Light.b = number("{a}");
  raises("TOKEN_ALIAS_CYCLE", () => createTokenResolver(doc).resolve(ref("foundation", "a")));
  doc.$collections.foundation.$modes["Mode 1"].a = number("{a}");
  raises("TOKEN_ALIAS_CYCLE", () => createTokenResolver(doc).resolve(ref("foundation", "a")));
});

test("alias type mismatch and invalid values do not pass resolution", () => {
  const doc = empty();
  doc.$collections.foundation.$modes["Mode 1"].dimension = number(8);
  doc.$collections.components.$modes["Mode 1"].wrong = color("{dimension}");
  doc.$collections.components.$modes["Mode 1"].invalid = number("eight");
  doc.$collections.components.$modes["Mode 1"].unknown = { $type: "duration", $value: 100 };
  const resolver = createTokenResolver(doc);
  raises("TOKEN_TYPE_MISMATCH", () => resolver.resolve(ref("components", "wrong")));
  raises("TOKEN_VALUE_INVALID", () => resolver.resolve(ref("components", "invalid")));
  raises("TOKEN_TYPE_UNSUPPORTED", () => resolver.resolve(ref("components", "unknown")));
});

test("an absent planned token stays absent while its semantic target resolves in each theme", () => {
  const historical = structuredClone(source);
  delete historical.$collections.components.$modes["Mode 1"]["text-field"].border.disabled;
  const before = JSON.stringify(historical);
  const resolver = createTokenResolver(historical);
  for (const theme of ["Light", "Dark"]) {
    const result = resolver.validatePlanned(planned, { theme });
    assert.equal(result.status, "decision-needed");
    assert.equal(result.exists, false);
    assert.equal(result.target.chain[0].mode, theme);
    assert.equal(result.target.type, "color");
    assert.equal(result.decision, "D16");
    raises("TOKEN_NOT_FOUND", () => resolver.resolve(planned.ref, { theme }));
  }
  assert.equal(JSON.stringify(historical), before);
});

test("D16 disabled border now resolves through the actual semantic alias in both themes", () => {
  const resolver = createTokenResolver(source);
  assert.equal(source.$collections.components.$modes["Mode 1"]["text-field"].border.disabled.$value, planned.alias);
  for (const theme of ["Light", "Dark"]) {
    const actual = resolver.resolve(planned.ref, { theme });
    const target = resolver.resolve(planned.target, { theme });
    assert.equal(actual.value, target.value);
    assert.equal(actual.chain[0].collection, "components");
    assert.deepEqual(actual.chain.slice(1), target.chain);
    assert.equal(actual.chain[1].mode, theme);
  }
});

test("a now-existing planned token is flagged for reconsideration", () => {
  const doc = structuredClone(source);
  doc.$collections.components.$modes["Mode 1"]["text-field"].border.disabled = color(planned.alias);
  const result = createTokenResolver(doc).validatePlanned(planned);
  assert.equal(result.status, "decision-needed");
  assert.equal(result.exists, true);
  assert.equal(result.existing.value, result.target.value);
});

test("planned alias/target disagreement and missing target are rejected", () => {
  const resolver = createTokenResolver(source);
  raises("TOKEN_PLAN_INVALID", () => resolver.validatePlanned({ ...planned, alias: "{status.disabled.text}" }));
  raises("TOKEN_PLAN_INVALID", () => resolver.validatePlanned({ ...planned, target: { ...planned.target, collection: "foundation" } }));
  raises("TOKEN_ALIAS_NOT_FOUND", () => resolver.validatePlanned({ ...planned, alias: "{missing.target}", target: ref("semantic", "missing", "target") }));
  raises("TOKEN_TYPE_MISMATCH", () => resolver.validatePlanned({ ...planned, ref: { ...planned.ref, expectedType: "number" } }));
  raises("TOKEN_UNIT_UNSUPPORTED", () => resolver.validatePlanned({ ...planned, ref: { ...planned.ref, unit: "px" } }));
});

test("same-valued roles retain separate references and independent resolution chains", () => {
  const resolver = createTokenResolver(source);
  const gap = resolver.resolve({ ...ref("foundation", "space", "s"), unit: "px" });
  const radius = resolver.resolve({ ...ref("foundation", "border", "radius", "s"), unit: "px" });
  assert.equal(gap.cssValue, "6px");
  assert.equal(radius.cssValue, "6px");
  assert.notDeepEqual(gap.ref, radius.ref);
  assert.notDeepEqual(gap.chain, radius.chain);
});
test('an alias names a token leaf, not a same-named branch in another collection',()=>{
 const resolver=createTokenResolver(source);
 for(const theme of ['Light','Dark']){
  const link=resolver.resolve(ref('components','link','default','foreground','default'),{theme});
  assert.equal(link.value,resolver.resolve(ref('semantic','link','default'),{theme}).value);
  assert.ok(link.chain.some(step=>step.collection==='semantic'));
 }
 const doc=empty();doc.$collections.semantic.$modes.Light.branch={child:color('#ffffff')};doc.$collections.components.$modes['Mode 1'].consumer=color('{branch}');
 raises('TOKEN_BRANCH_AS_LEAF',()=>createTokenResolver(doc).resolve(ref('components','consumer')));
});
