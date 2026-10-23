import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { build } from "esbuild";
export async function verifyProfiles({ cwd, browser, version }) {
  await fs.writeFile(
    path.join(cwd, "profile-consumer.mjs"),
    `
import React,{useState,useEffect} from 'react';import {SedaProvider,useSedaConfiguration,Button,IconButton,TextField,Select,Checkbox,Radio,Toggle} from '@seda-ai/ui';const h=React.createElement;
function ConfigurationEcho(){return h('output',{id:'configuration',style:{overflowWrap:'anywhere'}},JSON.stringify(useSedaConfiguration()));}
function Controls({config}){const [text,setText]=useState('Atlas');const [value,setValue]=useState('a');const [checked,setChecked]=useState(false);const [on,setOn]=useState(true);const [calls,setCalls]=useState(0);const options=[{value:'a',label:'Private'},{value:'b',label:'Team'}];const error=config.error?'Проверьте значение':undefined;
return h(React.Fragment,null,h(ConfigurationEcho),h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',gap:24}},h(TextField,{size:config.bare?config.controlSize:undefined,id:'p-field',label:'Проект',value:text,onChange:e=>setText(e.target.value),disabled:config.disabled,errorText:error,helperText:'Название рабочего пространства'}),h(Select,{size:config.bare?config.controlSize:undefined,id:'p-select',label:'Доступ',value,options,onValueChange:setValue,disabled:config.disabled,errorText:error}),h(Checkbox,{size:config.bare?config.controlSize:undefined,id:'p-check',label:'Сводка',checked,onCheckedChange:setChecked,disabled:config.disabled||!on,errorText:error,indeterminate:config.indeterminate}),h(Radio,{size:config.bare?config.controlSize:undefined,id:'p-radio',name:'p-visibility',label:'Видимость',value,options,onValueChange:setValue,disabled:config.disabled,errorText:error}),h(Toggle,{size:config.bare?config.controlSize:undefined,id:'p-toggle',label:'Уведомления',checked:on,onCheckedChange:setOn,disabled:config.disabled,loading:config.loading}),h('div',null,h(Button,{size:config.bare?config.controlSize:undefined,id:'p-btn',variant:config.variant??'secondary',loading:config.loading,disabled:config.disabled,onClick:()=>setCalls(n=>n+1)},text),h(IconButton,{size:config.bare?config.controlSize:undefined,id:'p-icon',variant:config.variant??'secondary',loading:config.loading,'aria-label':'Помощь',icon:'?',disabled:config.disabled}))),h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',gap:24}},h(Button,{id:'explicit-size',size:'s'},'Локальный S'),h(SedaProvider,{id:'nested-theme',theme:config.theme==='light'?'dark':'light',style:{padding:16}},h(Button,{id:'nested-theme-btn'},'Наследует размер')),h(SedaProvider,{id:'nested-size',controlSize:'l',style:{padding:16}},h(TextField,{id:'nested-size-field',label:'Локальный L',value:'Nested',onChange:()=>{}}))),h('output',{id:'profile-state',style:{overflowWrap:'anywhere'}},JSON.stringify({text,value,checked,on,calls})));}
export function ProfileConsumer(){const [config,setConfig]=useState({theme:'light',controlSize:'m',disabled:false,error:false,loading:false,indeterminate:false});useEffect(()=>{window.sedaProfile={configure:next=>setConfig(old=>({...old,...next}))};return()=>{delete window.sedaProfile;};},[]);return h(config.bare?'div':SedaProvider,{...(config.bare?{}:{theme:config.theme,controlSize:config.controlSize}),id:'profile-scope',style:{padding:24,display:'grid',gridTemplateColumns:'minmax(0,1fr)',gap:24}},h('h1',null,'SEDA — общий профиль библиотеки'),h(Controls,{config}));}
`,
  );
  await fs.writeFile(
    path.join(cwd, "profile-ssr.mjs"),
    `import React from 'react';import {renderToString} from 'react-dom/server';import {ProfileConsumer} from './profile-consumer.mjs';const errors=[];console.error=(...a)=>errors.push(a.join(' '));const html=renderToString(React.createElement(ProfileConsumer));if(errors.length)throw Error(errors.join('\\n'));console.log(JSON.stringify({html}));`,
  );
  await fs.writeFile(
    path.join(cwd, "profile-invalid.mjs"),
    `import React from 'react';import assert from 'node:assert/strict';import {renderToString} from 'react-dom/server';import {SedaProvider,useSedaConfiguration} from '@seda-ai/ui';for(const props of [{theme:'sepia'},{controlSize:'huge'}])assert.throws(()=>renderToString(React.createElement(SedaProvider,props)),/Unsupported SEDA/);function Probe(){assert.equal(Object.isFrozen(useSedaConfiguration()),true);return null;}renderToString(React.createElement(Probe));renderToString(React.createElement(SedaProvider,null,React.createElement(Probe)));`,
  );
  const rejected = spawnSync(process.execPath, ["profile-invalid.mjs"], {
    cwd,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(rejected.status, 0, rejected.stdout + rejected.stderr);
  assert.equal(rejected.stderr, "");
  const ssr = spawnSync(process.execPath, ["profile-ssr.mjs"], {
    cwd,
    encoding: "utf8",
    windowsHide: true,
  });
  assert.equal(ssr.status, 0, ssr.stderr);
  assert.equal(ssr.stderr, "");
  const { html } = JSON.parse(ssr.stdout);
  await fs.writeFile(
    path.join(cwd, "profile-entry.mjs"),
    `import React from 'react';import {hydrateRoot} from 'react-dom/client';import {ProfileConsumer} from './profile-consumer.mjs';import '@seda-ai/ui/styles.css';hydrateRoot(document.getElementById('root'),React.createElement(ProfileConsumer));`,
  );
  const bundled = await build({
    absWorkingDir: cwd,
    entryPoints: ["profile-entry.mjs"],
    outdir: path.join(cwd, "profiles-web"),
    bundle: true,
    format: "esm",
    metafile: true,
  });
  assert.ok(
    Object.keys(bundled.metafile.inputs).some((f) =>
      f.includes("node_modules/@seda-ai/ui/dist/foundation/SedaProvider.js"),
    ),
  );
  const js = await fs.readFile(path.join(cwd, "profiles-web/profile-entry.js")),
    css = await fs.readFile(path.join(cwd, "profiles-web/profile-entry.css"));
  const metadata = JSON.parse(
    await fs.readFile(
      path.join(cwd, "node_modules/@seda-ai/ui/dist/profiles.json"),
      "utf8",
    ),
  );
  assert.equal(Object.keys(metadata.profiles).length, 8);
  const server = createServer((req, res) => {
    if (req.url === "/app.js") {
      res.setHeader("Content-Type", "text/javascript");
      res.end(js);
    } else if (req.url === "/app.css") {
      res.setHeader("Content-Type", "text/css");
      res.end(css);
    } else {
      res.setHeader("Content-Type", "text/html");
      res.end(
        '<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><link rel="stylesheet" href="/app.css"></head><body><div id="root">' +
          html +
          '</div><script type="module" src="/app.js"></script></body></html>',
      );
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const settle = () =>
    page.evaluate(
      () =>
        new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        ),
    );
  const set = async (next) => {
    await page.evaluate((next) => window.sedaProfile.configure(next), next);
    await settle();
  };
  const near = (a, b, name) =>
    assert.ok(Math.abs(a - b) <= 1, `${name}: ${a} != ${b}`);
  const measurements = [];
  const color = async (value) =>
    page.evaluate((value) => {
      const el = document.createElement("span");
      el.style.background = value;
      document.body.append(el);
      const result = getComputedStyle(el).backgroundColor;
      el.remove();
      return result;
    }, value);
  try {
    await page.goto("http://127.0.0.1:" + server.address().port);
    await page.waitForFunction(() => window.sedaProfile);
    for (const theme of ["light", "dark"])
      for (const controlSize of ["s", "m", "l", "xl"])
        for (const width of [1280, 780, 390]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.mouse.move(0, 0);
          await page.evaluate(() => document.activeElement?.blur());
          await set({ theme, controlSize });
          const geometry =
            metadata.profiles[theme + ":" + controlSize].geometry;
          const data = await page.evaluate(() => {
            const field = (id) =>
              document.getElementById(id).closest(".seda-field__control");
            const size = (el) => {
              const box = el.getBoundingClientRect(),
                s = getComputedStyle(el);
              return {
                height: box.height,
                width: box.width,
                radius: parseFloat(s.borderRadius),
                radiusRaw: s.borderRadius,
                font: parseFloat(s.fontSize),
                line: parseFloat(s.lineHeight),
                background: s.backgroundColor,
              };
            };
            return {
              button: size(document.getElementById("p-btn")),
              icon: size(document.getElementById("p-icon")),
              field: size(field("p-field")),
              select: size(field("p-select")),
              checkbox: size(document.getElementById("p-check")),
              radio: size(document.querySelector("#p-radio input")),
              toggle: size(document.getElementById("p-toggle")),
              explicit: size(document.getElementById("explicit-size")),
              nestedTheme: size(document.getElementById("nested-theme-btn")),
              nestedSize: size(field("nested-size-field")),
              nestedThemeName:
                document.getElementById("nested-theme").dataset.sedaTheme,
              nestedSizeTheme:
                document.getElementById("nested-size").dataset.sedaTheme,
              config: JSON.parse(
                document.getElementById("configuration").textContent,
              ),
              fontFamily: getComputedStyle(
                document.getElementById("profile-scope"),
              ).fontFamily,
              labelGaps: ["p-field", "p-select"].map((id) => {
                const control = document
                  .getElementById(id)
                  .closest(".seda-field__control");
                return (
                  control.getBoundingClientRect().top -
                  control
                    .closest(".seda-field")
                    .querySelector(".seda-field__label")
                    .getBoundingClientRect().bottom
                );
              }),
              overflow: document.documentElement.scrollWidth > innerWidth,
            };
          });
          assert.match(data.fontFamily, /sans-serif/);
          near(data.labelGaps[0], data.labelGaps[1], "input/select label gaps");
          for (const name of ["button", "icon", "field", "select"]) {
            near(data[name].height, geometry.height.value, name + " height");
            near(data[name].font, geometry.fontSize.value, name + " font");
            near(data[name].line, geometry.lineHeight.value, name + " line");
            near(data[name].radius, geometry.radius.value, name + " radius");
          }
          near(data.icon.width, data.icon.height, "icon square");
          near(data.checkbox.height, geometry.iconSize.value, "checkbox");
          near(data.radio.width, geometry.iconSize.value, "radio");
          assert.equal(data.radio.radiusRaw, "50%");
          near(data.radio.height, data.radio.width, "radio circle");
          near(
            data.toggle.height,
            geometry.iconSize.value +
              2 * metadata.primitives[theme].toggleInset.value,
            "toggle height",
          );
          near(
            data.toggle.width,
            geometry.iconSize.value * 2 +
              2 * metadata.primitives[theme].toggleInset.value,
            "toggle width",
          );
          near(
            data.explicit.height,
            metadata.profiles[theme + ":s"].geometry.height.value,
            "explicit size",
          );
          near(
            data.nestedTheme.height,
            geometry.height.value,
            "nested inherits size",
          );
          near(
            data.nestedSize.height,
            metadata.profiles[theme + ":l"].geometry.height.value,
            "nested L",
          );
          assert.equal(
            data.nestedThemeName,
            theme === "light" ? "dark" : "light",
          );
          assert.equal(data.nestedSizeTheme, theme);
          assert.deepEqual(data.config, { theme, controlSize });
          assert.equal(
            data.overflow,
            false,
            JSON.stringify({
              theme,
              controlSize,
              width,
              overflow: await page.evaluate(() =>
                [...document.querySelectorAll("*")]
                  .filter((el) => el.getBoundingClientRect().right > innerWidth)
                  .map((el) => ({
                    tag: el.tagName,
                    id: el.id,
                    className: el.className,
                    right: el.getBoundingClientRect().right,
                  }))
                  .slice(0, 8),
              ),
            }),
          );
          for (const [name, property] of [
            ["field", "--text-field-surface-default"],
            ["select", "--select-surface-default"],
          ])
            assert.equal(
              data[name].background,
              await color(
                metadata.themes[theme].find((e) => e.property === property)
                  .cssValue,
              ),
              property,
            );
          measurements.push({ theme, controlSize, width, data });
          if (controlSize === "m" && width === 1280)
            await page.screenshot({
              path: path.join(cwd, "profiles-" + theme + ".png"),
            });
        }
    const actionVariants = [];
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const theme of ["light", "dark"])
      for (const variant of [
        "primary",
        "secondary",
        "outline",
        "ghost",
        "text",
        "destruction",
      ]) {
        const snapshots = [];
        for (const state of [
          "default",
          "hover",
          "pressed",
          "disabled",
          "loading",
        ]) {
          await set({
            theme,
            controlSize: "m",
            variant,
            disabled: state === "disabled",
            loading: state === "loading",
          });
          await page.evaluate(() => document.activeElement?.blur());
          await page.mouse.move(0, 0);
          for (const [id, prefix] of [
            ["p-btn", "button"],
            ["p-icon", "icon-button"],
          ]) {
            const control = page.locator("#" + id);
            if (state === "hover") await control.hover();
            if (state === "pressed") {
              const box = await control.boundingBox();
              await page.mouse.move(
                box.x + box.width / 2,
                box.y + box.height / 2,
              );
              await page.mouse.down();
            }
            await settle();
            const actual = await control.evaluate((el) => {
              const s = getComputedStyle(el);
              return {
                surface: s.backgroundColor,
                border: s.borderTopColor,
                foreground: s.color,
              };
            });
            for (const role of ["surface", "border", "foreground"]) {
              const find = (key) =>
                metadata.themes[theme].find(
                  (e) =>
                    e.property ===
                    "--" + prefix + "-" + variant + "-" + role + "-" + key,
                );
              const expected = find(state) ?? find("default");
              assert.ok(expected, prefix + " " + variant + " " + role);
              assert.equal(
                actual[role],
                await color(expected.cssValue),
                [theme, prefix, variant, state, role].join("/"),
              );
            }
            snapshots.push({ state, component: prefix, actual });
            if (state === "pressed") await page.mouse.up();
            await page.mouse.move(0, 0);
          }
        }
        actionVariants.push({ theme, variant, snapshots });
      }
    await set({ variant: "secondary", disabled: false, loading: false });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const bareSizes = [];
    await page.setViewportSize({ width: 1280, height: 1000 });
    for (const controlSize of ["s", "m", "l", "xl"]) {
      await set({ bare: true, controlSize });
      const dimensions = await page.evaluate(() =>
        ["p-btn", "p-icon", "p-field", "p-select"].map((id) => {
          const el = document.getElementById(id);
          return (
            el.closest(".seda-field__control") ?? el
          ).getBoundingClientRect().height;
        }),
      );
      for (const h of dimensions)
        near(
          h,
          metadata.profiles["light:" + controlSize].geometry.height.value,
          "unprovided explicit size " + controlSize,
        );
      bareSizes.push({ controlSize, dimensions });
    }
    await set({ bare: false });
    await page.setViewportSize({ width: 1280, height: 1000 });
    await set({ theme: "light", controlSize: "m", error: true });
    await page.locator("#p-field").focus();
    assert.equal(
      await page.locator("#p-field").getAttribute("aria-invalid"),
      "true",
    );
    assert.equal(
      await page
        .locator("#p-field")
        .evaluate(
          (el) =>
            getComputedStyle(el.closest(".seda-field__control")).outlineStyle,
        ),
      "solid",
    );
    assert.equal(
      await page
        .locator("#p-field")
        .evaluate((el) => getComputedStyle(el).outlineStyle),
      "none",
    );
    assert.equal(
      await page
        .locator("#p-field")
        .evaluate(
          (el) =>
            getComputedStyle(el.closest(".seda-field__control")).borderTopColor,
        ),
      await color(
        metadata.themes.light.find(
          (e) => e.property === "--text-field-border-error",
        ).cssValue,
      ),
    );
    await set({ disabled: true });
    assert.equal(
      await page.locator("#p-field").getAttribute("aria-invalid"),
      null,
    );
    assert.equal(
      await page.locator("#p-field-message").textContent(),
      "Название рабочего пространства",
    );
    assert.equal(await page.locator("#p-select").isDisabled(), true);
    await set({ disabled: false, error: false, indeterminate: true });
    assert.equal(
      await page.locator("#p-check").evaluate((el) => el.indeterminate),
      true,
    );
    await set({ indeterminate: false });
    await page.locator("#p-field").fill("Persistent");
    await page.locator("#p-select").selectOption("b");
    await page.locator("#p-check").check();
    const callsBefore = JSON.parse(
      await page.locator("#profile-state").textContent(),
    ).calls;
    const before = await page.locator("#p-btn").boundingBox();
    await set({ loading: true });
    await page
      .locator("#p-field")
      .fill("A longer label during a pending operation");
    await set({ theme: "dark", controlSize: "xl" });
    const during = await page.locator("#p-btn").boundingBox();
    near(before.width, during.width, "pending width across profile");
    near(before.height, during.height, "pending height across profile");
    await page.locator("#p-btn").click({ force: true });
    assert.equal(
      JSON.parse(await page.locator("#profile-state").textContent()).calls,
      callsBefore,
    );
    await set({ loading: false });
    const after = await page.locator("#p-btn").boundingBox();
    near(
      after.height,
      metadata.profiles["dark:xl"].geometry.height.value,
      "new size after pending",
    );
    const state = JSON.parse(
      await page.locator("#profile-state").textContent(),
    );
    assert.equal(state.value, "b");
    assert.equal(state.checked, true);
    assert.match(state.text, /longer label/);
    await set({ controlSize: "s", theme: "light" });
    await page.locator("#p-field").fill("I");
    const smallBefore = await page.locator("#p-btn").boundingBox();
    await set({ loading: true });
    await set({ controlSize: "xl", theme: "dark" });
    const smallDuring = await page.locator("#p-btn").boundingBox();
    near(smallDuring.width, smallBefore.width, "short S-to-XL loading width");
    near(
      smallDuring.height,
      smallBefore.height,
      "short S-to-XL loading height",
    );
    assert.equal(
      await page
        .locator("#p-btn")
        .evaluate((el) => parseFloat(getComputedStyle(el).paddingInlineStart)),
      metadata.profiles["light:s"].geometry.buttonPaddingInline.value,
    );
    await set({ loading: false });
    assert.equal(
      await page
        .locator("#p-btn")
        .evaluate((el) => parseFloat(getComputedStyle(el).paddingInlineStart)),
      metadata.profiles["dark:xl"].geometry.buttonPaddingInline.value,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await set({ loading: true });
    assert.equal(
      await page
        .locator("#p-btn .seda-button__spinner")
        .evaluate((el) => getComputedStyle(el).animationName),
      "none",
    );
    await set({ loading: false });
    await page.emulateMedia({ forcedColors: "active" });
    assert.equal(
      await page
        .locator("#p-check")
        .evaluate((el) => getComputedStyle(el).borderTopStyle),
      "solid",
    );
    assert.deepEqual(errors, []);
    return {
      version,
      configurationMeasurements: measurements.length,
      measurements,
      bareSizes,
      actionVariants,
      sourceAlias: false,
      ssr: true,
      invalidConfigurationRejected: true,
      configurationFrozen: true,
      hydrationErrors: errors,
      loadingAcrossProfile: {
        width: during.width - before.width,
        height: during.height - before.height,
      },
      shortLoadingAcrossProfile: {
        width: smallDuring.width - smallBefore.width,
        height: smallDuring.height - smallBefore.height,
      },
      stateRetained: true,
      reducedMotion: true,
      forcedColorsSmoke: true,
    };
  } finally {
    await page.close();
    await new Promise((r) => server.close(r));
  }
}
