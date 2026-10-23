import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { buildThemeAssets } from "./theme-assets.mjs";
import { createContractEngine } from "../../seda-contracts/src/index.mjs";
export async function verifyProfileSources(root) {
  const repo = path.resolve(root, "../..");
  const metadata = JSON.parse(
    await fs.readFile(path.join(root, "dist/profiles.json"), "utf8"),
  );
  for (const [file, digest] of Object.entries(metadata.sources))
    assert.equal(
      crypto
        .createHash("sha256")
        .update(await fs.readFile(path.join(repo, file)))
        .digest("hex"),
      digest,
    );
  const engine = createContractEngine({ repoRoot: repo });
  let colourAndProvenanceBindingsMatched = 0;
  for (const theme of ["Light", "Dark"])
    for (const controlSize of ["s", "m", "l", "xl"]) {
      const compiled = engine.compile(engine.bundle.profile, {
        overrides: { theme, controlSize },
      });
      const actual = metadata.profiles[theme.toLowerCase() + ":" + controlSize];
      const palette = metadata.themes[theme.toLowerCase()];
      const bindings = [
        [
          "--button-primary-surface-default",
          compiled.instances.save.tokenBranch.children.surface.default,
        ],
        [
          "--button-secondary-surface-default",
          compiled.instances.cancel.tokenBranch.children.surface.default,
        ],
        [
          "--icon-button-ghost-surface-default",
          compiled.instances.help.tokenBranch.children.surface.default,
        ],
        [
          "--text-field-surface-default",
          compiled.instances.projectName.tokenBranch.children.surface.default,
        ],
        [
          "--select-surface-default",
          compiled.controls.Select.tokenBranch.children.surface.default,
        ],
        [
          "--checkbox-control-surface-default",
          compiled.controls.Checkbox.tokenBranch.children.control.surface
            .default,
        ],
        [
          "--radio-control-surface-default",
          compiled.controls.Radio.tokenBranch.children.control.surface.default,
        ],
        [
          "--toggle-track-off-default",
          compiled.controls.Toggle.tokenBranch.children.track.off.default,
        ],
      ];
      bindings.push(['--tabs-indicator-selected', compiled.controls.Tabs.tokenBranch.children.indicator.selected], ['--tabs-pill-surface-selected', compiled.controls.Tabs.tokenBranch.children.pill.surface.selected]);
      bindings.push(['--dropdown-menu-surface-default',compiled.controls.DropdownMenu.tokenBranch.children.surface.default],['--dropdown-menu-item-surface-hover',compiled.controls.DropdownMenu.tokenBranch.children.item.surface.hover],['--status-danger-text',compiled.controls.DropdownMenu.semanticAdapters['--status-danger-text']]);
      bindings.push(['--surface-base',compiled.foundationTokens.surface],['--border-subtle',compiled.foundationTokens.separator],['--focus-ring',compiled.foundationTokens.focus]);
      for(const path of [['surface','default'],['surface','error'],['surface','disabled'],['surface','read-only'],['border','active'],['focus','ring'],['counter','default'],['label','read-only']])bindings.push(['--text-area-'+path.join('-'),path.reduce((node,key)=>node[key],compiled.controls.TextArea.tokenBranch.children)]);
      bindings.push(['--tree-row-surface-selected',compiled.controls.Tree.tokenBranch.children.row.surface.selected],['--tree-focus-ring',compiled.controls.Tree.tokenBranch.children.focus.ring]);
      for (const [property, expected] of bindings) {
        const actual = palette.find((e) => e.property === property);
        assert.ok(actual, property);
        assert.equal(actual.cssValue, expected.cssValue, property);
        assert.deepEqual(
          actual.chain,
          expected.chain,
          property + " provenance",
        );
        colourAndProvenanceBindingsMatched++;
      }
      for (const [name, value] of Object.entries(actual.geometry)) {
        assert.equal(value.value, compiled.geometry[name].value, name);
        assert.equal(value.cssValue, compiled.geometry[name].cssValue, name);
      }
    }
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "seda-public-profile-"));
  try {
    const pkg = path.join(temp, "packages/seda-ui"),
      output = path.join(pkg, "dist");
    await fs.mkdir(path.join(pkg, "src"), { recursive: true });
    await fs.mkdir(output);
    await fs.mkdir(path.join(temp, "packages/seda-contracts"));
    await fs.mkdir(path.join(temp, "packages/seda-contracts/contracts"));
    for (const name of ["Button", "IconButton", "TextArea"])
      await fs.copyFile(
        path.join(repo, "packages/seda-contracts/contracts", name + ".json"),
        path.join(temp, "packages/seda-contracts/contracts", name + ".json"),
      );
    const tokens = JSON.parse(
      await fs.readFile(path.join(repo, "tokens.json"), "utf8"),
    );
    delete tokens.$collections.components.$modes["Mode 1"].select.border.focus;
    await fs.writeFile(path.join(temp, "tokens.json"), JSON.stringify(tokens));
    await fs.copyFile(
      path.join(repo, "packages/seda-contracts/system.json"),
      path.join(temp, "packages/seda-contracts/system.json"),
    );
    await fs.copyFile(
      path.join(root, "src/provider.css"),
      path.join(pkg, "src/provider.css"),
    );
    await fs.copyFile(
      path.join(root, "src/styles.css"),
      path.join(pkg, "src/styles.css"),
    );
    await fs.copyFile(path.join(root, "src/navigation.css"), path.join(pkg, "src/navigation.css"));
    await fs.copyFile(path.join(root, "src/overlays.css"), path.join(pkg, "src/overlays.css"));
    await fs.copyFile(path.join(root, "src/layout.css"), path.join(pkg, "src/layout.css"));
    assert.throws(
      () => buildThemeAssets(pkg, output),
      /Required public component token is missing: --select-border-focus/,
    );
  } finally {
    assert.equal(path.dirname(temp), path.resolve(os.tmpdir()));
    assert.ok(path.basename(temp).startsWith("seda-public-profile-"));
    await fs.rm(temp, { recursive: true, force: true });
  }
  return {
    profilesMatchedToCompiler: 8,
    colourAndProvenanceBindingsMatched,
    sourceHashesMatched: true,
    missingStateRejected: true,
  };
}
