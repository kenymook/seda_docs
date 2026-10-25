import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { buildThemeAssets } from "./theme-assets.mjs";
import { createContractEngine } from "../../seda-contracts/src/index.mjs";
import { createTokenResolver } from "../../seda-contracts/src/tokens.mjs";
export async function verifyProfileSources(root) {
  const repo = path.resolve(root, "../..");
  for(const file of ['slider.mjs','slider.d.mts','number-field.mjs','number-field.d.mts'])assert.deepEqual(await fs.readFile(path.join(root,'dist/internal',file)),await fs.readFile(path.join(repo,'packages/seda-contracts/src',file)),'Installed numeric core must equal canonical contract source');
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
  const tokenResolver = createTokenResolver(JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8')));
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
      bindings.push(['--text-field-border-default',compiled.controls.NumberField.tokenBranch.children.border.default],['--text-field-border-focus',compiled.controls.NumberField.tokenBranch.children.border.focus],['--text-field-foreground-default',compiled.controls.NumberField.tokenBranch.children.foreground.default]);
      for (const [property,sourcePath] of [
        ['--avatar-foreground-on-brand',['avatar','foreground','onBrand']],
        ['--avatar-foreground-on-ai',['avatar','foreground','onAi']],
        ['--card-title-foreground',['card','title','foreground']],
        ['--card-metadata-foreground',['card','metadata','foreground']],
        ['--chat-bubble-ai-foreground',['chat-bubble','ai','foreground']],
        ['--chat-bubble-outgoing-surface-default',['chat-bubble','outgoing','surface','default']],
        ['--chat-bubble-incoming-foreground-default',['chat-bubble','incoming','foreground','default']],
        ['--chat-bubble-timestamp-foreground',['chat-bubble','timestamp','foreground']],
        ['--top-bar-surface-default',['top-bar','surface','default']],
        ['--top-bar-item-foreground-selected',['top-bar','item','foreground','selected']],
        ['--top-bar-focus-ring',['top-bar','focus','ring']],
        ['--sidebar-surface-default',['sidebar','surface','default']],
        ['--sidebar-item-foreground-selected',['sidebar','item','foreground','selected']],
        ['--sidebar-focus-ring',['sidebar','focus','ring']],
        ['--accordion-trigger-foreground-expanded',['accordion','trigger','foreground','expanded']],
        ['--accordion-panel-surface-default',['accordion','panel','surface','default']],
        ['--accordion-focus-ring',['accordion','focus','ring']],
        ['--notification-center-surface-default',['notification-center','surface','default']],
        ['--notification-center-item-foreground-unread',['notification-center','item','foreground','unread']],
        ['--notification-center-item-timestamp-foreground',['notification-center','item','timestamp','foreground']],
        ['--search-input-border-focus',['search','input','border','focus']],
        ['--search-result-surface-selected',['search','result','surface','selected']],
        ['--search-focus-ring',['search','focus','ring']],
        ['--popover-surface-default',['popover','surface','default']],
        ['--popover-title-foreground',['popover','title','foreground']],
        ['--popover-focus-ring',['popover','focus','ring']],
        ['--slider-track-fill',['slider','track','fill']],
        ['--slider-thumb-border',['slider','thumb','border']],
        ['--slider-focus-ring',['slider','focus','ring']],
      ]) bindings.push([property,tokenResolver.resolve({collection:'components',path:sourcePath,expectedType:'color'},{theme})]);
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
    await fs.mkdir(path.join(temp, "packages/seda-contracts/src"));
    await fs.copyFile(path.join(repo,'packages/seda-contracts/src/typography.mjs'),path.join(temp,'packages/seda-contracts/src/typography.mjs'));
    for(const file of ['slider.mjs','slider.d.mts','number-field.mjs','number-field.d.mts'])await fs.copyFile(path.join(repo,'packages/seda-contracts/src',file),path.join(temp,'packages/seda-contracts/src',file));
    for (const name of ["Button", "IconButton", "TextArea", "Slider", "NumberField"])
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
    const uploadTokens = JSON.parse(await fs.readFile(path.join(repo, "tokens.json"), "utf8"));
    delete uploadTokens.$collections.components.$modes["Mode 1"]["file-upload"].surface.success;
    await fs.writeFile(path.join(temp, "tokens.json"), JSON.stringify(uploadTokens));
    assert.throws(() => buildThemeAssets(pkg, output),
      /Required public component token is missing: --file-upload-surface-success/);
    const nestedTokens = JSON.parse(await fs.readFile(path.join(repo, "tokens.json"), "utf8"));
    delete nestedTokens.$collections.components.$modes["Mode 1"].alert.description.foreground.info;
    await fs.writeFile(path.join(temp, "tokens.json"), JSON.stringify(nestedTokens));
    assert.throws(() => buildThemeAssets(pkg, output),
      /Required public component token is missing: --alert-description-foreground-info/);
    const avatarTokens = JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8'));
    delete avatarTokens.$collections.components.$modes['Mode 1'].avatar.foreground.onBrand;
    await fs.writeFile(path.join(temp,'tokens.json'),JSON.stringify(avatarTokens));
    assert.throws(()=>buildThemeAssets(pkg,output),/avatar\/foreground\/onBrand/);
    const cardTokens = JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8'));
    delete cardTokens.$collections.components.$modes['Mode 1'].card.title.foreground;
    await fs.writeFile(path.join(temp,'tokens.json'),JSON.stringify(cardTokens));
    assert.throws(()=>buildThemeAssets(pkg,output),/Required public component token is missing: --card-title-foreground/);
    const messageTokens=JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8'));
    delete messageTokens.$collections.components.$modes['Mode 1']['chat-bubble'].ai.foreground;
    await fs.writeFile(path.join(temp,'tokens.json'),JSON.stringify(messageTokens));
    assert.throws(()=>buildThemeAssets(pkg,output),/Required public component token is missing: --chat-bubble-ai-foreground/);
    const barTokens=JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8'));
    delete barTokens.$collections.components.$modes['Mode 1']['top-bar'].item.foreground.selected;
    await fs.writeFile(path.join(temp,'tokens.json'),JSON.stringify(barTokens));
    assert.throws(()=>buildThemeAssets(pkg,output),/Required public component token is missing: --top-bar-item-foreground-selected/);
    const sidebarTokens=JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8'));
    delete sidebarTokens.$collections.components.$modes['Mode 1'].sidebar.item.foreground.selected;
    await fs.writeFile(path.join(temp,'tokens.json'),JSON.stringify(sidebarTokens));
    assert.throws(()=>buildThemeAssets(pkg,output),/Required public component token is missing: --sidebar-item-foreground-selected/);
    const accordionTokens=JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8'));
    delete accordionTokens.$collections.components.$modes['Mode 1'].accordion.trigger.foreground.expanded;
    await fs.writeFile(path.join(temp,'tokens.json'),JSON.stringify(accordionTokens));
    assert.throws(()=>buildThemeAssets(pkg,output),/Required public component token is missing: --accordion-trigger-foreground-expanded/);
    const notificationTokens=JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8'));
    delete notificationTokens.$collections.components.$modes['Mode 1']['notification-center'].item.foreground.unread;
    await fs.writeFile(path.join(temp,'tokens.json'),JSON.stringify(notificationTokens));
    assert.throws(()=>buildThemeAssets(pkg,output),/Required public component token is missing: --notification-center-item-foreground-unread/);
    const searchTokens=JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8'));
    delete searchTokens.$collections.components.$modes['Mode 1'].search.focus.ring;
    await fs.writeFile(path.join(temp,'tokens.json'),JSON.stringify(searchTokens));
    assert.throws(()=>buildThemeAssets(pkg,output),/Required public component token is missing: --search-focus-ring/);
    const popoverTokens=JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8'));
    delete popoverTokens.$collections.components.$modes['Mode 1'].popover.focus.ring;
    await fs.writeFile(path.join(temp,'tokens.json'),JSON.stringify(popoverTokens));
    assert.throws(()=>buildThemeAssets(pkg,output),/Required public component token is missing: --popover-focus-ring/);
    const sliderTokens=JSON.parse(await fs.readFile(path.join(repo,'tokens.json'),'utf8'));
    delete sliderTokens.$collections.components.$modes['Mode 1'].slider.focus.ring;
    await fs.writeFile(path.join(temp,'tokens.json'),JSON.stringify(sliderTokens));
    assert.throws(()=>buildThemeAssets(pkg,output),/Required public component token is missing: --slider-focus-ring/);
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
    missingUploadStateRejected: true,
    missingNestedFeedbackRoleRejected: true,
    missingAvatarAliasRejected: true,
    missingCardTitleRejected: true,
    missingMessageAIForegroundRejected: true,
    missingTopBarSelectedForegroundRejected: true,
    missingSidebarSelectedForegroundRejected: true,
    missingAccordionExpandedForegroundRejected: true,
    missingNotificationUnreadForegroundRejected: true,
    missingSearchFocusRingRejected: true,
    missingPopoverFocusRingRejected: true,
  };
}
