import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createTokenResolver } from "../../seda-contracts/src/tokens.mjs";
/** Build-time only: the consumer receives self-contained CSS and provenance JSON. */
export function buildThemeAssets(packageRoot, output) {
  const repo = path.resolve(packageRoot, "../..");
  const tokensBytes = fs.readFileSync(path.join(repo, "tokens.json"));
  const systemBytes = fs.readFileSync(
    path.join(repo, "packages/seda-contracts/system.json"),
  );
  const tokens = JSON.parse(tokensBytes),
    system = JSON.parse(systemBytes);
  const resolver = createTokenResolver(tokens);
  const hash = (bytes) =>
    crypto.createHash("sha256").update(bytes).digest("hex");
  const actionContracts = Object.fromEntries(
    ["Button", "IconButton"].map((name) => [
      name,
      JSON.parse(
        fs.readFileSync(
          path.join(repo, "packages/seda-contracts/contracts", name + ".json"),
          "utf8",
        ),
      ),
    ]),
  );
  const textAreaContract=JSON.parse(fs.readFileSync(path.join(repo,'packages/seda-contracts/contracts/TextArea.json'),'utf8'));
  const stylesBytes = fs.readFileSync(path.join(packageRoot, "src/styles.css"));
  const providerBytes = fs.readFileSync(
    path.join(packageRoot, "src/provider.css"),
  );
  const navigationBytes = fs.readFileSync(path.join(packageRoot, "src/navigation.css"));
  const overlayBytes = fs.readFileSync(path.join(packageRoot, "src/overlays.css"));
  const layoutBytes = fs.readFileSync(path.join(packageRoot, "src/layout.css"));
  const usedProperties = new Set(
    Array.from(
      (String(stylesBytes) + "\n" + String(providerBytes) + "\n" + String(navigationBytes) + "\n" + String(overlayBytes) + "\n" + String(layoutBytes)).matchAll(
        /var\((--[a-zA-Z0-9-]+)/g,
      ),
      (match) => match[1],
    ),
  );
  const report = {
    kind: "seda-ui-profiles",
    schemaVersion: "0.1.0",
    sources: {
      "tokens.json": hash(tokensBytes),
      "packages/seda-contracts/contracts/TextArea.json":hash(fs.readFileSync(path.join(repo,"packages/seda-contracts/contracts/TextArea.json"))),
      "packages/seda-contracts/system.json": hash(systemBytes),
      "packages/seda-ui/src/styles.css": hash(stylesBytes),
      "packages/seda-ui/src/provider.css": hash(providerBytes),
      "packages/seda-ui/src/navigation.css": hash(navigationBytes),
      "packages/seda-ui/src/overlays.css": hash(overlayBytes),
      "packages/seda-ui/src/layout.css": hash(layoutBytes),
      "packages/seda-ui/scripts/theme-assets.mjs": hash(
        fs.readFileSync(new URL(import.meta.url)),
      ),
      ...Object.fromEntries(
        ["Button", "IconButton"].map((name) => {
          const file = "packages/seda-contracts/contracts/" + name + ".json";
          return [file, hash(fs.readFileSync(path.join(repo, file)))];
        }),
      ),
    },
    profiles: {},
    themes: {},
    primitives: {},
  };
  const css = [
    "/* Generated from tokens.json and the shared contract system. */",
  ];
  const weight = { Regular: 400, Medium: 500, Semibold: 600, Bold: 700 };
  const dimension = (value, theme) =>
    value && typeof value === "object" && "collection" in value
      ? resolver.resolve(value, { theme })
      : { ...value, cssValue: value.value + "px" };
  for (const theme of system.supportedThemes) {
    for(const suffix of textAreaContract.tokenRequirements.default)resolver.resolve({collection:textAreaContract.tokenBranches.default.collection,path:[...textAreaContract.tokenBranches.default.path,...suffix],expectedType:"color"},{theme});
    const key = system.themeAdapter[theme],
      variables = new Map(),
      evidence = [];
    const add = (property, leaf) => {
      if (variables.has(property) && variables.get(property) !== leaf.cssValue)
        throw Error("CSS variable collision: " + property);
      if (variables.has(property)) return;
      variables.set(property, leaf.cssValue);
      evidence.push({ property, ...leaf });
    };
    function visit(node, parts, collection) {
      for (const [name, value] of Object.entries(node)) {
        const p = [...parts, name];
        if (value && typeof value === "object" && "cssValue" in value) {
          if (value.type === "color") {
            const property = "--" + p.join("-");
            if (usedProperties.has(property)) add(property, value);
            if (
              collection === "components" &&
              usedProperties.has("--seda-" + p.join("-"))
            )
              add("--seda-" + p.join("-"), value);
          }
        } else visit(value, p, collection);
      }
    }
    for (const collection of ["semantic", "components"]) {
      const mode = collection === "semantic" ? theme : "Mode 1";
      for (const group of Object.keys(
        tokens.$collections[collection].$modes[mode],
      ))
        visit(
          resolver.resolveBranch({ collection, path: [group] }, { theme })
            .children,
          [group],
          collection,
        );
    }
    const actionMappings = {
      Button: {
        primary: ["button", "primary", "solid"],
        secondary: ["button", "neutral", "secondary"],
        outline: ["button", "neutral", "outline"],
        ghost: ["button", "neutral", "ghost"],
        text: ["button", "neutral", "text"],
        destruction: ["button", "danger", "solid"],
      },
      IconButton: {
        primary: ["icon-button", "primary"],
        secondary: ["icon-button", "neutral"],
        outline: ["icon-button", "neutral"],
        ghost: ["icon-button", "ghost"],
        text: ["icon-button", "ghost"],
        destruction: ["icon-button", "danger"],
      },
    };
    for (const [component, variants] of Object.entries(actionMappings))
      for (const [variant, fallbackPath] of Object.entries(variants)) {
        const declared = actionContracts[component].tokenBranches[variant];
        const branchPath = declared?.path ?? fallbackPath;
        const branch = resolver.resolveBranch(
          {
            collection: declared?.collection ?? "components",
            path: branchPath,
          },
          { theme },
        );
        const prefix = component === "Button" ? "button" : "icon-button";
        for (const role of ["surface", "border", "foreground"])
          if (!branch.children[role]?.default)
            throw Error(
              `Required ${component}.${variant} token role missing: ${role}/default`,
            );
        if (declared)
          for (const parts of actionContracts[component].tokenRequirements[
            variant
          ])
            resolver.resolve(
              {
                ...declared,
                path: [...declared.path, ...parts],
                expectedType: "color",
              },
              { theme },
            );
        function bindAction(node, parts = []) {
          for (const [name, value] of Object.entries(node)) {
            const p = [...parts, name];
            if (value && typeof value === "object" && "cssValue" in value)
              add("--" + prefix + "-" + variant + "-" + p.join("-"), {
                ...value,
                adapter: "public-action-variant",
                apiVariant: variant,
              });
            else bindAction(value, p);
          }
        }
        bindAction(branch.children);
        if (key === "light") {
          const assignments = [];
          for (const role of ["surface", "border", "foreground"])
            for (const state of [
              "default",
              "hover",
              "pressed",
              "disabled",
              "loading",
              "selected",
            ])
              assignments.push(
                "--seda-action-" +
                  role +
                  "-" +
                  state +
                  ":var(--" +
                  prefix +
                  "-" +
                  variant +
                  "-" +
                  role +
                  "-" +
                  state +
                  ",var(--" +
                  prefix +
                  "-" +
                  variant +
                  "-" +
                  role +
                  "-default));",
              );
          assignments.push(
            "--seda-action-spinner:var(--" +
              prefix +
              "-" +
              variant +
              "-spinner-foreground,var(--" +
              prefix +
              "-" +
              variant +
              "-foreground-loading,var(--" +
              prefix +
              "-" +
              variant +
              "-foreground-default)));",
          );
          assignments.push(
            "--seda-action-focus:var(--" +
              prefix +
              "-" +
              variant +
              "-focus-ring,var(--focus-ring));",
          );
          css.push(
            ".seda-provider .seda-" +
              (component === "Button" ? "button" : "icon-button") +
              '[data-variant="' +
              variant +
              '"]{' +
              assignments.join("") +
              "}",
          );
        }
      }
    const requiredCss = String(navigationBytes) + String(overlayBytes) + fs.readFileSync(
      path.join(packageRoot, "src/provider.css"),
      "utf8",
    );
    const prefixes = Object.keys(
      tokens.$collections.components.$modes["Mode 1"],
    ).map((name) => "--" + name + "-");
    for (const match of requiredCss.matchAll(/var\((--[a-z0-9-]+)/g))
      if (
        prefixes.some((prefix) => match[1].startsWith(prefix)) &&
        !variables.has(match[1])
      )
        throw Error("Required public component token is missing: " + match[1]);
    const primitives = {
      choiceRadius: resolver.resolve(
        {
          collection: "foundation",
          path: ["border", "radius", "xs"],
          expectedType: "number",
          unit: "px",
        },
        { theme },
      ),
      toggleInset: resolver.resolve(
        {
          collection: "foundation",
          path: ["space", "2xs"],
          expectedType: "number",
          unit: "px",
        },
        { theme },
      ),
    };
    report.primitives[key] = primitives;
    for (const [name, leaf] of Object.entries(primitives))
      add(
        "--seda-primitive-" +
          name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()),
        leaf,
      );
    const family = resolver.resolve(system.typography.family, { theme }),
      labelWeight = resolver.resolve(system.typography.labelWeight, { theme });
    if (!weight[labelWeight.value])
      throw Error("Unknown label weight " + labelWeight.value);
    const familyCss = {
      ...family,
      cssValue:
        JSON.stringify(family.value) +
        ', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      adapter: "font-family-with-system-fallback",
    };
    add("--seda-font-family", familyCss);
    variables.set("--seda-label-weight", weight[labelWeight.value]);
    for (const [size, preset] of Object.entries(system.sizes)) {
      const values = { ...preset, ...system.geometry };
      const resolved = Object.fromEntries(
        Object.entries(values).map(([name, value]) => [
          name,
          dimension(value, theme),
        ]),
      );
      report.profiles[key + ":" + size] = {
        theme: key,
        controlSize: size,
        geometry: resolved,
        typography: {
          family: familyCss,
          labelWeight: { ...labelWeight, cssValue: weight[labelWeight.value] },
        },
      };
      for (const [name, value] of Object.entries(resolved))
        variables.set(
          "--seda-size-" +
            size +
            "-" +
            name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()),
          value.cssValue,
        );
    }
    report.themes[key] = evidence;
    css.push(
      '.seda-provider[data-seda-theme="' +
        key +
        '"]{color-scheme:' +
        key +
        ";" +
        [...variables]
          .map(([name, value]) => name + ":" + value + ";")
          .join("") +
        "}",
    );
  }
  const classes =
    ":is(.seda-button,.seda-icon-button,.seda-field,.seda-choice,.seda-toggle,.seda-radio-group,.seda-tabs,.seda-tree,.seda-dropdown-menu,.seda-dropdown-menu__surface)";
  for (const size of Object.keys(system.sizes)) {
    const mapping = {
      height: "height",
      radius: "radius",
      "font-size": "font-size",
      "line-height": "line-height",
      "icon-size": "icon-size",
      "border-width": "border-width",
      "field-padding": "text-field-padding-inline",
      gap: "text-field-affix-gap",
    };
    const vars = Object.entries(mapping)
      .map(
        ([name, key]) =>
          "--seda-preset-" +
          name +
          ":var(--seda-size-" +
          size +
          "-" +
          key +
          ");",
      )
      .join("");
    const defaults = report.profiles["light:" + size].geometry;
    const defaultVars = Object.entries(mapping)
      .map(([name, key]) => {
        const camel = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return "--seda-preset-" + name + ":" + defaults[camel].cssValue + ";";
      })
      .join("");
    const primitiveVars =
      "--seda-primitive-choice-radius:" +
      report.primitives.light.choiceRadius.cssValue +
      ";--seda-primitive-toggle-inset:" +
      report.primitives.light.toggleInset.cssValue +
      ";";
    css.push(
      classes +
        '[data-size="' +
        size +
        '"]{' +
        primitiveVars +
        defaultVars +
        "--seda-button-padding-x:" +
        defaults.buttonPaddingInline.cssValue +
        ";}",
    );
    css.push(
      ".seda-provider " +
        classes +
        '[data-size="' +
        size +
        '"]{' +
        vars +
        "--seda-button-padding-x:var(--seda-size-" +
        size +
        "-button-padding-inline);}",
    );
    css.push(
      '.seda-provider[data-seda-size="' +
        size +
        '"]{font-size:var(--seda-size-' +
        size +
        "-font-size);line-height:var(--seda-size-" +
        size +
        "-line-height);}",
    );
  }
  fs.writeFileSync(
    path.join(output, "profiles.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  fs.writeFileSync(path.join(output, "themes.css"), css.join("\n") + "\n");
  return { css: css.join("\n") + "\n", report };
}
