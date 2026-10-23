import test from "node:test";
import assert from "node:assert/strict";
import {
  createContractEngine,
  ContractValidationError,
} from "../src/index.mjs";
import { createControlWebBindings } from "../src/web.mjs";
const engine = createContractEngine();
const names = ["Select", "Checkbox", "Radio", "Toggle"];
const handler = { $handler: "workspace.change" };
const options = [
  { value: "a", label: "Альфа" },
  { value: "b", label: "Бета" },
  { value: "c", label: "Гамма", disabled: true },
];
const sample = (name) =>
  ["Select", "Radio"].includes(name)
    ? { label: name, options, value: "a", onValueChange: handler }
    : { label: name, checked: false, onCheckedChange: handler };
for (const name of names) {
  test(`${name}: actual public API, defaults and compileControl share source and tokens`, () => {
    for (const theme of ["Light", "Dark"])
      for (const size of ["s", "m", "l", "xl"]) {
        const output = engine.compileControl(
          name,
          { ...sample(name), size },
          { theme },
        );
        assert.equal(output.component, name);
        assert.equal(output.props.size, size);
        assert.equal(
          output.geometry.height.value,
          engine.bundle.system.sizes[size].height.value,
        );
        assert.equal(output.tokenBranch.ref.path[0], name.toLowerCase());
        assert.ok(
          output.checks
            .filter((c) => c.layer === "browser")
            .every((c) => c.status === "not-checked"),
        );
        assert.equal(
          engine.api.get(name).sourcePath,
          `packages/seda-ui/src/components/${name}/${name}.types.ts`,
        );
      }
    assert.equal(
      engine.validateInstance(name, { ...sample(name), size: "giant" }).valid,
      false,
    );
    assert.equal(
      engine.validateInstance(name, { ...sample(name), inventedProp: true })
        .valid,
      false,
    );
  });
  test(`${name}: independent focus, disabled precedence and controlled conflicts`, () => {
    const valid = engine.validateInstance(
      name,
      {
        ...sample(name),
        disabled: true,
        ...(name === "Toggle" ? { loading: true } : { errorText: "Ошибка" }),
      },
      { interaction: { focused: true, hovered: true } },
    );
    assert.equal(valid.valid, true, JSON.stringify(valid.issues));
    assert.equal(valid.state.availability, "disabled");
    assert.equal(valid.state.validation, "none");
    assert.equal(valid.state.tokenState, "disabled");
    assert.equal(valid.state.focusRing, false);
    const bad = {
      ...sample(name),
      ...(["Select", "Radio"].includes(name)
        ? { defaultValue: "a" }
        : { defaultChecked: true }),
    };
    assert.equal(engine.validateInstance(name, bad).valid, false);
    const noHandler = { ...sample(name) };
    delete noHandler.onValueChange;
    delete noHandler.onCheckedChange;
    assert.equal(engine.validateInstance(name, noHandler).valid, false);
    assert.throws(
      () => engine.compileControl(name, bad),
      ContractValidationError,
    );
  });
}
test("Select/Radio: option integrity, single/multi value shape and blank error", () => {
  for (const name of ["Select", "Radio"]) {
    for (const change of [
      { options: 42 },
      { options: null },
      { options: [] },
      { options: [options[0], options[0]] },
      { options: [{ value: "x", label: " " }] },
      { value: "missing" },
      { errorText: " " },
      { value: ["a"] },
    ])
      assert.equal(
        engine.validateInstance(name, { ...sample(name), ...change }).valid,
        false,
        JSON.stringify(change),
      );
    assert.equal(
      engine.validateInstance(name, { label: name, options, defaultValue: "b" })
        .valid,
      true,
    );
    assert.equal(
      engine.validateInstance(name, { ...sample(name), value: "c" }).valid,
      true,
    );
  }
  assert.equal(
    engine.validateInstance("Select", {
      ...sample("Select"),
      selection: "multi",
      value: ["a", "b"],
    }).valid,
    true,
  );
  assert.equal(
    engine.validateInstance("Select", {
      ...sample("Select"),
      selection: "multi",
      value: ["a", "a"],
    }).valid,
    false,
  );
  assert.equal(
    engine.validateInstance("Select", {
      ...sample("Select"),
      selection: "multi",
      value: "a",
    }).valid,
    false,
  );
});
test("Choice states: checked, indeterminate, selected and loading are derived independently", () => {
  assert.equal(
    engine.compileControl("Checkbox", { ...sample("Checkbox"), checked: true })
      .state.data,
    "checked",
  );
  assert.equal(
    engine.compileControl("Checkbox", {
      ...sample("Checkbox"),
      checked: true,
      indeterminate: true,
    }).state.data,
    "indeterminate",
  );
  assert.equal(
    engine.compileControl("Radio", sample("Radio")).state.tokenState,
    "selected",
  );
  const loading = engine.compileControl(
    "Toggle",
    { ...sample("Toggle"), checked: true, loading: true },
    { interaction: { focused: true } },
  );
  assert.equal(loading.state.data, "checked");
  assert.equal(loading.state.activity, "loading");
  assert.equal(loading.state.focusRing, true);
  assert.equal(
    engine.validateInstance("Toggle", {
      ...sample("Toggle"),
      errorText: "Unsupported",
    }).valid,
    false,
  );
});
test("New contract registry rejects missing required rules, invalid sources and missing token roles", () => {
  for (const name of names) {
    const candidate = structuredClone(engine.bundle),
      c = candidate.contracts.find((c) => c.id === name);
    c.rules = c.rules.filter(
      (r) => !["selection-value", "checked-value"].includes(r.check),
    );
    assert.ok(
      engine
        .validate(candidate)
        .issues.some((i) => i.code === "REQUIRED_RULE_MISSING"),
    );
  }
  const candidate = structuredClone(engine.bundle);
  candidate.contracts
    .find((c) => c.id === "Select")
    .tokenRequirements.default.push(["surface", "missing-state"]);
  assert.equal(engine.validate(candidate).valid, false);
});
test("All eight common compiled profiles contain selection and navigation contracts with provenance", () => {
  for (const theme of ["Light", "Dark"])
    for (const controlSize of ["s", "m", "l", "xl"]) {
      const compiled = engine.compile(engine.bundle.profile, {
        overrides: { theme, controlSize },
      });
      assert.deepEqual(Object.keys(compiled.controls), [...names, "Tabs"]);
      for (const name of names) {
        assert.equal(compiled.controls[name].component, name);
        assert.ok(
          compiled.controls[name].tokenBranch.children.focus.ring.chain.length >
            1,
        );
      }
    }
});
test('Shared web bridge binds four compiled branches and rejects missing state leaves',()=>{
 const compiled=engine.compile();const web=createControlWebBindings(compiled);
 assert.ok(web.Select.vars['--seda-select-surface-default']);
 assert.ok(web.Checkbox.vars['--seda-checkbox-control-surface-indeterminate']);
 delete compiled.controls.Select.tokenBranch.children.surface.error;
 assert.throws(()=>createControlWebBindings(compiled),/Expected a resolved leaf/);
});
