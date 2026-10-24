import { verifyProfileSources } from "./verify-profile-sources.mjs";
import { verifyProfiles } from "./verify-profiles.mjs";
import { verifyTabs } from "./verify-tabs.mjs";
import { verifyMenu } from "./verify-menu.mjs";
import { verifySplitView } from "./verify-split-view.mjs";
import { verifyLink } from "./verify-link.mjs";
import { verifyFileUpload } from "./verify-file-upload.mjs";
import { verifyFeedback } from "./verify-feedback.mjs";
import { verifyToastHost } from "./verify-toast-host.mjs";
import { verifyFieldContrast } from "./verify-field-contrast.mjs";
import { verifyTextArea } from "./verify-textarea.mjs";
import { verifyTypography } from "./verify-typography.mjs";
import { verifyTree } from "./verify-tree.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { chromium } from "playwright";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(
  root,
  ".diagnostics-package",
  new Date().toISOString().replace(/[:.]/g, "-"),
);
await fs.mkdir(output, { recursive: true });
const npm = process.env.npm_execpath;
assert.ok(
  npm?.endsWith("npm-cli.js"),
  "Run through npm run verify:package to select npm safely",
);
function run(args, cwd = root) {
  const r = spawnSync(process.execPath, [npm, ...args], {
    cwd,
    encoding: "utf8",
    windowsHide: true,
  });
  if (r.status !== 0)
    throw new Error(`${args[0]} failed: ${r.stdout}\n${r.stderr}`);
  return r.stdout;
}
const results = [];
async function check(name, fn) {
  const evidence = await fn();
  results.push({ name, status: "passed", evidence });
  console.log("PASS " + name);
  return evidence;
}
let browser;
try {
  const packOutput = run(["pack", "--json", "--pack-destination", output]);
  const jsonStart = packOutput.search(/^\s*\[/m);
  assert.ok(jsonStart >= 0, "npm pack must return JSON");
  const packed = JSON.parse(packOutput.slice(jsonStart))[0];
  const tarball = path.join(output, packed.filename);
  await check("tarball-export-files-and-allowlist", async () => {
    for (const file of [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/styles.css",
      "dist/manifest.json",
      "dist/profiles.json",
    ])
      assert.ok(
        packed.files.some((f) => f.path === file),
        file,
      );
    assert.ok(
      packed.files.every(
        (f) =>
          f.path.startsWith("dist/") ||
          ["package.json", "README.md", "CHANGELOG.md"].includes(f.path),
      ),
    );
    return {
      filename: packed.filename,
      files: packed.files.length,
      integrity: packed.integrity,
    };
  });
  await check("deterministic-build", async () => {
    const before = await fs.readFile(
      path.join(root, "dist/manifest.json"),
      "utf8",
    );
    run(["run", "build"]);
    const after = await fs.readFile(
      path.join(root, "dist/manifest.json"),
      "utf8",
    );
    assert.equal(after, before);
    return { identical: true, artifacts: JSON.parse(after).files.length };
  });
  await check("public-profile-sources-and-missing-state", () =>
    verifyProfileSources(root),
  );
  browser = await chromium.launch({
    headless: true,
    ...(process.env.SEDA_BROWSER_EXECUTABLE
      ? { executablePath: process.env.SEDA_BROWSER_EXECUTABLE }
      : {}),
  });
  for (const [version, types] of [
    ["18.3.1", "18.3.24"],
    ["19.2.7", "19.2.17"],
  ]) {
    const cwd = path.join(output, "react-" + version);
    await fs.mkdir(cwd, { recursive: true });
    await fs.writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({
        name: "seda-isolated-consumer",
        private: true,
        type: "module",
      }),
    );
    run(
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--package-lock=false",
        tarball,
        `react@${version}`,
        `react-dom@${version}`,
        `@types/react@${types}`,
      ],
      cwd,
    );
    const runtime = await check(
      "react-" + version + "-native-esm-and-ssr",
      async () => {
        await fs.writeFile(
          path.join(cwd, "ssr.mjs"),
          `import React from 'react';import {renderToString} from 'react-dom/server';import * as ui from '@seda-ai/ui';import {Consumer} from './consumer.mjs';const errors=[];console.error=(...a)=>errors.push(a.join(' '));const html=renderToString(React.createElement(Consumer));if(errors.length)throw Error(errors.join('\\n'));console.log(JSON.stringify({exports:Object.keys(ui),html}));`,
        );
        await fs.writeFile(
          path.join(cwd, "consumer.mjs"),
          `
import React,{useState} from 'react';import {SedaProvider,useSedaConfiguration,Icon,Button,TextField,Select,Checkbox,Radio,Toggle,IconButton} from '@seda-ai/ui';
const h=React.createElement;
export function Consumer(){const [text,setText]=useState('Atlas');const [selection,setSelection]=useState('a');const [checked,setChecked]=useState(false);const [on,setOn]=useState(true);const [pending,setPending]=useState(false);const [requests,setRequests]=useState(0);
return h('main',null,h('h1',null,'SEDA package consumer'),h(TextField,{id:'name',label:'Project',value:text,onChange:e=>setText(e.target.value)}),h(Select,{id:'select',label:'Team',value:selection,options:[{value:'a',label:'Core'},{value:'b',label:'Design'}],onValueChange:setSelection}),h(Checkbox,{id:'checkbox',label:'Digest',checked,disabled:!on,onCheckedChange:setChecked}),h(Radio,{name:'visibility',label:'Visibility',value:selection,options:[{value:'a',label:'Private'},{value:'b',label:'Team'}],onValueChange:setSelection}),h(Toggle,{id:'toggle',label:'Notifications',checked:on,onCheckedChange:setOn}),h(Button,{id:'save',iconLeft:h(Icon,{name:'add'}),loading:pending,onClick:()=>{setPending(true);setRequests(n=>n+1);}},text),h(IconButton,{id:'help','aria-label':'Help',icon:'?'}),h('button',{id:'resolve',onClick:()=>setPending(false)},'Resolve'),h('div',{style:{width:180}},h(Select,{id:'select-long',label:'Camera',helperText:'Choose a camera',defaultValue:'long',options:[{value:'long',label:'Personal Camera with a very long label'},{value:'short',label:'Other camera'}]})),h(Select,{id:'select-override',label:'Visible title','aria-label':'Custom accessible title',options:[{value:'a',label:'First choice'}]}),h('output',{id:'state'},JSON.stringify({text,selection,checked,on,pending,requests})));}
`,
        );
        const r = spawnSync(process.execPath, ["ssr.mjs"], {
          cwd,
          encoding: "utf8",
          windowsHide: true,
        });
        assert.equal(r.status, 0, r.stderr);
        assert.equal(r.stderr, "");
        const result = JSON.parse(r.stdout);
        assert.equal(result.exports.length, 26);
        for (const name of ["ToastProvider", "ToastViewport", "useToast"]) assert.ok(result.exports.includes(name));
        assert.ok(result.exports.includes("Icon"));
        assert.ok(result.exports.includes("Text"));
        assert.ok(result.exports.includes("textVariants"));
        assert.ok(result.exports.includes("TextArea"));
        assert.ok(result.exports.includes("Tree"));
        assert.ok(result.exports.includes("SplitView"));
        assert.ok(result.exports.includes("DropdownMenu"));
        assert.ok(result.exports.includes("Tabs"));
        assert.ok(result.exports.includes("SedaProvider"));
        assert.ok(result.exports.includes("useSedaConfiguration"));
        assert.match(result.html, /<select/);
        return result;
      },
    );
    await check("react-" + version + "-declarations", async () => {
      await fs.writeFile(
        path.join(cwd, "types.tsx"),
        `import {Text,TextArea,Tree,DropdownMenu,Tabs,SedaProvider,useSedaConfiguration,Icon,Button,TextField,Select,Checkbox,Radio,Toggle,IconButton} from '@seda-ai/ui';const sample=<><Button variant="primary">Save</Button><TextField label="Name"/><Select label="Team" options={[{value:'a',label:'Core'}]}/><Checkbox label="Digest"/><Radio label="Scope" options={[{value:'a',label:'Private'}]}/><Toggle label="On"/><IconButton aria-label="Help" icon="?"/></>;
const icon=<Icon name="search"/>;
// @ts-expect-error only original SEDA catalog names are accepted
const inventedIcon=<Icon name="invented"/>;
const typography=<SedaProvider textScale={115}><Text as="h2" variant="heading/section">Heading</Text></SedaProvider>;
// @ts-expect-error invented typography role
const invalidTextRole=<Text variant="heading/hero"/>;
// @ts-expect-error unsupported active element
const invalidTextTag=<Text as="button"/>;
const area=<TextArea label="Message" rows={1} autoResize maxRows={8} clearable value="draft" onChange={()=>{}} onClear={()=>{}}/>;
// @ts-expect-error label is required
const namelessArea=<TextArea/>;
// @ts-expect-error content belongs to value or defaultValue
const childrenArea=<TextArea label="Message">Hidden value</TextArea>;
// @ts-expect-error no arbitrary resizing modes
const invalidArea=<TextArea label="Message" resize="both"/>;
const tree=<Tree label="Layers" items={[{id:'frame',label:'Frame',children:[{id:'child',label:'Child'}]}]} selectionMode="multiple"/>;
// @ts-expect-error accessible label required
const namelessTree=<Tree items={[]}/>;
// @ts-expect-error hierarchy requires typed text labels
const malformedTree=<Tree label="Layers" items={[{id:'a',label:5}]}/>;
// @ts-expect-error no invented selection modes
const inventedTree=<Tree label="Layers" items={[]} selectionMode="checkbox"/>;
const menu=<DropdownMenu triggerLabel="Actions" items={[{id:'open',label:'Open',onSelect:()=>{}}]}/>;
import {SplitView} from '@seda-ai/ui';
const split=<SplitView primary="Tree" secondary="Editor" primaryLabel="Objects" secondaryLabel="Canvas"/>;
// @ts-expect-error panel labels are required
const namelessSplit=<SplitView primary="A" secondary="B"/>;
// @ts-expect-error layout orientation vocabulary is closed
const badSplitOrientation=<SplitView primary="A" secondary="B" primaryLabel="A" secondaryLabel="B" orientation="diagonal"/>;
// @ts-expect-error pane extent uses CSS px numbers, not ambiguous strings
const badSplitSize=<SplitView primary="A" secondary="B" primaryLabel="A" secondaryLabel="B" primarySize="30%"/>;
// @ts-expect-error trigger accessible name is required
const namelessMenu=<DropdownMenu items={[]}/>;
// @ts-expect-error action requires executable callback
const fakeAction=<DropdownMenu triggerLabel="Actions" items={[{id:'open',label:'Open'}]}/>;
// @ts-expect-error undocumented menu variants are rejected
const badMenuVariant=<DropdownMenu triggerLabel="Actions" items={[]} variant="invented"/>;
// @ts-expect-error shortcut modifiers use the declared keyboard vocabulary
const badShortcut=<DropdownMenu triggerLabel="Actions" items={[{id:'open',label:'Open',onSelect:()=>{},shortcut:{key:'o',label:'Alt+O',modifiers:['Option']}}]}/>;
// @ts-expect-error unknown Button variant must not become any
const badVariant=<Button variant="invented">Save</Button>;
const goodTabs=<Tabs label="Panels" items={[{value:'a',label:'A',content:'Panel'}]} activationMode="manual"/>;
// @ts-expect-error no invented orientation in the public horizontal Tabs API
const badTabs=<Tabs label="Panels" items={[]} orientation="vertical"/>;
// @ts-expect-error tab label is required for an accessible relationship
const missingTabsLabel=<Tabs items={[]}/>;
// @ts-expect-error undocumented variant is rejected
const badTabsVariant=<Tabs label="Panels" items={[]} variant="invented"/>;
// @ts-expect-error options are required by the public Select interface
const missingOptions=<Select label="Team"/>;
// @ts-expect-error checked is boolean
const wrongChecked=<Checkbox label="Digest" checked="yes"/>;
// @ts-expect-error unknown public theme is rejected
const wrongTheme=<SedaProvider theme="sepia"/>;
// @ts-expect-error unknown public size is rejected
const wrongSize=<SedaProvider controlSize="huge"/>;
function ConfigTypeCheck(){const configuration=useSedaConfiguration();
// @ts-expect-error context snapshots are readonly
configuration.controlSize='s';return null;}
import {ToastProvider,ToastViewport,useToast,type ToastOptions} from '@seda-ai/ui';
const toastHost=<ToastProvider><ToastViewport aria-label="Events"/></ToastProvider>;
function HostTypeCheck(){const host=useToast();const id:string|null=host.notify({title:'Saved',duration:null,dedupeKey:'save'});if(id)host.update(id,{description:'Updated'});
// @ts-expect-error notification content is required
host.notify({duration:5000});
// @ts-expect-error arbitrary action nodes remain presentation-only
const options:ToastOptions={title:'Saved',action:<button>Invented</button>};return null;}`,
      );
      await fs.writeFile(
        path.join(cwd, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            strict: true,
            skipLibCheck: true,
            jsx: "react-jsx",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            target: "ES2020",
            noEmit: true,
          },
          include: ["types.tsx"],
        }),
      );
      const r = spawnSync(
        process.execPath,
        [
          path.join(root, "node_modules/typescript/bin/tsc"),
          "--project",
          "tsconfig.json",
        ],
        { cwd, encoding: "utf8", windowsHide: true },
      );
      assert.equal(r.status, 0, r.stdout + r.stderr);
      return { moduleResolution: "NodeNext", negativeTypeChecks: 22 };
    });
    await check(
      "react-" + version + "-hydration-css-and-behavior",
      async () => {
        await fs.writeFile(
          path.join(cwd, "entry.mjs"),
          `import React from 'react';import {hydrateRoot} from 'react-dom/client';import {Consumer} from './consumer.mjs';import '@seda-ai/ui/styles.css';hydrateRoot(document.getElementById('root'),React.createElement(Consumer));`,
        );
        const bundle = await build({
          absWorkingDir: cwd,
          entryPoints: ["entry.mjs"],
          outdir: path.join(cwd, "web"),
          bundle: true,
          format: "esm",
          metafile: true,
        });
        const modules = Object.keys(bundle.metafile.inputs);
        assert.ok(
          modules.some((f) =>
            f.includes("node_modules/@seda-ai/ui/dist/index.js"),
          ),
        );
        assert.ok(!modules.some((f) => f.includes("seda-ui/src")));
        const js = await fs.readFile(path.join(cwd, "web/entry.js")),
          css = await fs.readFile(path.join(cwd, "web/entry.css"));
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
                runtime.html +
                '</div><script type="module" src="/app.js"></script></body></html>',
            );
          }
        });
        await new Promise((r) => server.listen(0, "127.0.0.1", r));
        const page = await browser.newPage({
          viewport: { width: 1280, height: 900 },
        });
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("console", (m) => {
          if (m.type() === "error") errors.push(m.text());
        });
        try {
          await page.goto("http://127.0.0.1:" + server.address().port);
          await page.waitForFunction(() => document.querySelector("#save"));
          assert.equal(await page.getByRole('combobox',{name:'Team',exact:true}).count(),1);
          assert.equal(await page.locator('#select').getAttribute('aria-labelledby'),'select-label');
          const iconGeometry=await page.locator('#save .seda-icon').evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,mask:getComputedStyle(el).maskImage,decorative:el.getAttribute('aria-hidden')}));
          assert.equal(iconGeometry.width,16);assert.equal(iconGeometry.height,16);
          assert.ok(iconGeometry.mask.includes('data:image/svg+xml'));assert.equal(iconGeometry.decorative,'true');
          await page.locator("#name").fill("Atlas edited");
          await page.locator("#select").selectOption("b");
          assert.equal(await page.getByRole('combobox',{name:'Team',exact:true}).count(),1);
          assert.equal(
            await page.locator("input[type=radio][value=b]").isChecked(),
            true,
          );
          assert.equal(await page.getByRole('combobox',{name:'Camera',exact:true}).count(),1);
          assert.equal(await page.getByRole('combobox',{name:'Custom accessible title',exact:true}).count(),1);
          const longGeometry=await page.locator('#select-long').evaluate(el=>({whiteSpace:getComputedStyle(el).whiteSpace,height:el.clientHeight,scrollHeight:el.scrollHeight,parentWidth:el.closest('.seda-field').getBoundingClientRect().width}));
          assert.equal(longGeometry.whiteSpace,'nowrap');
          assert.ok(longGeometry.scrollHeight<=longGeometry.height+1);
          assert.ok(longGeometry.parentWidth<=181);
          await page.locator('#select-long').click();
          await page.keyboard.press('End');await page.keyboard.press('Enter');
          assert.equal(await page.locator('#select-long').inputValue(),'short');
          assert.equal(await page.getByRole('combobox',{name:'Camera',exact:true}).count(),1);
          await page.locator("#checkbox").check();
          await page.locator("#toggle").uncheck();
          assert.equal(await page.locator("#checkbox").isDisabled(), true);
          assert.equal(await page.locator("#checkbox").isChecked(), true);
          await page.locator("#toggle").check();
          const before = await page.locator("#save").boundingBox();
          assert.ok(before.height >= 24, "Package CSS must be present");
          await page.locator("#save").click();
          const during = await page.locator("#save").boundingBox();
          await page
            .locator("#name")
            .fill("A much longer project label while the request is pending");
          const changed = await page.locator("#save").boundingBox();
          assert.equal(changed.width, before.width);
          assert.equal(changed.height, before.height);
          await page.locator("#save").click({ force: true });
          assert.equal(
            JSON.parse(await page.locator("#state").textContent()).requests,
            1,
          );
          await page.locator("#resolve").click();
          assert.equal(
            JSON.parse(await page.locator("#state").textContent()).pending,
            false,
          );
          assert.deepEqual(errors, []);
          await page.screenshot({ path: path.join(cwd, "consumer.png") });
          return {
            cssBytes: css.length,
            sourceAlias: false,
            hydrationErrors: errors,
            loadingDelta: {
              width: during.width - before.width,
              height: during.height - before.height,
            },
            requests: 1,
          };
        } finally {
          await page.close();
          await new Promise((r) => server.close(r));
        }
      },
    );
    await check("react-" + version + "-provider-profiles", () =>
      verifyProfiles({ cwd, browser, version }),
    );
    await check("react-" + version + "-tabs-navigation", () =>
      verifyTabs({ cwd, browser, version }),
    );
    await check("react-" + version + "-menu-overlays", () =>
      verifyMenu({ cwd, browser, version }),
    );
    await check("react-" + version + "-split-view", () =>
      verifySplitView({cwd,browser,version}),
    );
    await check("react-" + version + "-tree", () => verifyTree({cwd,browser,version}));
    await check("react-"+version+"-textarea",()=>verifyTextArea({cwd,browser,version}));
    await check("react-"+version+"-typography",()=>verifyTypography({cwd,browser,version}));
    await check("react-"+version+"-link-variants",()=>verifyLink({cwd,browser,version}));
    await check("react-"+version+"-file-upload",()=>verifyFileUpload({cwd,browser,version}));
    await check("react-"+version+"-feedback",()=>verifyFeedback({cwd,browser,version}));
    await check("react-"+version+"-toast-host",()=>verifyToastHost({cwd,browser,version}));
    await check("react-"+version+"-field-contrast",()=>verifyFieldContrast({cwd,browser,version}));
  }
} catch (error) {
  results.push({
    name: "package-verification",
    status: "failed",
    error: error.stack,
  });
  process.exitCode = 1;
  console.error(error.message);
} finally {
  await browser?.close();
  await fs.writeFile(
    path.join(output, "results.json"),
    JSON.stringify(
      {
        passed: results.filter((r) => r.status === "passed").length,
        failed: results.filter((r) => r.status === "failed").length,
        results,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify({
      output,
      passed: results.filter((r) => r.status === "passed").length,
      failed: results.filter((r) => r.status === "failed").length,
    }),
  );
}
