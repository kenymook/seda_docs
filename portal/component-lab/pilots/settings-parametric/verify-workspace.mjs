import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { createPilotServer } from "./server.mjs";
import {createContractEngine} from '../../../../packages/seda-contracts/src/index.mjs';
const engine=createContractEngine(),localPresets=new Map();
// Independent numeric oracle over resolved profile inputs; never read expected
// dimensions from the rendered CSS or copy the Provider's expression graph.
function localGeometry(theme,size,params,variant){
  const key=theme+':'+size;
  if(!localPresets.has(key))localPresets.set(key,engine.compile(undefined,{overrides:{theme,controlSize:size}}));
  const profile=localPresets.get(key),g=variant==='text'?profile.actionVariants.text.geometry:profile.geometry,factor=params.scale/100,font=Math.round(g.fontSize.value*factor),line=Math.round(g.lineHeight.value*factor),icon=Math.round(g.iconSize.value*factor);
  return{height:Math.max(g.height.value,Math.max(line,icon)+g.height.value-g.lineHeight.value+2*params.air),font,line,radius:Number((g.radius.value*params.radius/100).toFixed(2)),fieldPaddingX:g.textFieldPaddingInline.value+params.airX,buttonPaddingX:g.buttonPaddingInline.value+params.airX};
}
const output = path.join(import.meta.dirname, ".diagnostics-workspace");
await fs.mkdir(output, { recursive: true });
const server = await createPilotServer({ port: 0 });
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.SEDA_BROWSER_EXECUTABLE
    ? { executablePath: process.env.SEDA_BROWSER_EXECUTABLE }
    : {}),
});
const page = await browser.newPage({ viewport: { width: 1543, height: 1100 } });
page.setDefaultTimeout(8000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
const near = (a, b, message) =>
  assert.ok(Math.abs(a - b) <= 1, `${message}: ${a} != ${b}`);
const settle = () =>
  page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
async function check(name, run) {
  try {
    const evidence = await run();
    results.push({ name, status: "passed", evidence });
    console.log("PASS " + name);
  } catch (e) {
    results.push({ name, status: "failed", error: e.stack });
    console.log("FAIL " + name + ": " + e.message);
  }
}
async function fresh() {
  await page.goto(base);
  await page.waitForFunction(() => window.sedaPilot);
  await page.evaluate(() => document.fonts.ready);
  await settle();
}
async function configure(theme, size, params) {
  await page.evaluate(
    ({ theme, size }) =>
      window.sedaPilot.configure({ theme, controlSize: size }),
    { theme, size },
  );
  for (const [id, value] of Object.entries(params))
    await page.locator("#" + id).fill(String(value));
  await settle();
}
async function selectPage(id) {
  await page.locator("#nav-" + id).click();
  await settle();
}
try {
  await fresh();
  for (const theme of ["Light", "Dark"])
    for (const size of ["s", "m", "l", "xl"]) {
      await check("workspace-geometry-" + theme + "-" + size, async () => {
        const configurations = [];
        for (const params of [
          { scale: 100, air: 0, airX: 0, radius: 100 },
          { scale: 150, air: 12, airX: 24, radius: 175 },
        ]) {
          await configure(theme, size, params);
          const ownership=await page.locator('main[data-workspace] > .seda-provider').evaluate(n=>({enabled:n.hasAttribute('data-seda-control-parameters'),scale:Number(n.style.getPropertyValue('--seda-parameter-scale')),privateGeometry:Array.from(n.style).filter(name=>name.startsWith('--seda-control-')),serviceScoped:document.getElementById('lab-scope').hasAttribute('data-seda-control-parameters')}));
          assert.ok(ownership.enabled);assert.equal(ownership.scale,params.scale/100);assert.deepEqual(ownership.privateGeometry,[]);assert.equal(ownership.serviceScoped,false);
          const d = await page.evaluate(
            () => window.sedaPilot.getLab().derived,
          );
          for (const width of [1543, 1024, 390]) {
            await page.setViewportSize({ width, height: 1100 });
            for (const section of ["projects", "settings", "access", "members", "editor"]) {
              await selectPage(section === "access" ? "settings" : section);
              if (section === "settings" || section === "access") await page.getByRole("tab", { name: section === "access" ? "Доступ и уведомления" : "Основные параметры", exact:true }).click();
              const data = await page
                .locator("main[data-workspace]")
                .evaluate((root) =>
                  [
                    ...root.querySelectorAll(
                      ".seda-field__control,.seda-button,.seda-icon-button,.seda-tabs__tab",
                    ),
                  ]
                    .filter((el) => el.getBoundingClientRect().height > 0)
                    .map((el) => {
                      const s = getComputedStyle(el),
                        b = el.getBoundingClientRect();
                      const area=el.querySelector('textarea'),inner=el.querySelector('.seda-field__input,.seda-field__select,.seda-textarea__input');
                      return {
                        size:el.closest('[data-size]')?.getAttribute('data-size'),
                        variant:el.getAttribute('data-variant'),rows:area?.rows??1,
                        id:
                          el.id ||
                          el.querySelector("input,select,textarea")?.id ||
                          el.textContent.trim(),
                        height: b.height,
                        width: b.width,
                        padding: parseFloat(getComputedStyle(area??el).paddingInlineStart),
                        radius: parseFloat(s.borderRadius),
                        font: parseFloat(s.fontSize),
                        line: parseFloat(s.lineHeight),
                        ...(inner ? {innerBackground:getComputedStyle(inner).backgroundColor,innerColor:getComputedStyle(inner).color,wrapperColor:s.color} : {}),
                        kind: area ? "textarea" : el.classList.contains("seda-tabs__tab") ? "tab" : el.classList.contains("seda-icon-button")
                          ? "icon"
                          : el.classList.contains("seda-button")
                            ? "button"
                            : "field",
                      };
                    }),
                );
              for (const v of data) {
                const expected=v.variant==='text'||v.size&&v.size!==size?localGeometry(theme,v.size??size,params,v.variant):d;
                if(v.innerBackground!==undefined){assert.equal(v.innerBackground,'rgba(0, 0, 0, 0)',v.id+' inner field must let the compiled surface show through');assert.equal(v.innerColor,v.wrapperColor,v.id+' inherits compiled foreground');}
                near(v.height, expected.height+(v.kind==='textarea'?(v.rows-1)*expected.line:0), v.id + " height");
                if (v.kind !== "tab") near(v.radius, expected.radius, v.id + " radius");
                near(v.font, expected.font, v.id + " font");
                near(v.line, expected.line, v.id + " line");
                if (v.kind === "field" || v.kind === "tab" || v.kind === "textarea")
                  near(v.padding, expected.fieldPaddingX, v.id + " field X");
                if (v.kind === "button")
                  near(v.padding, expected.buttonPaddingX, v.id + " button X");
                if (v.kind === "icon")
                  near(v.width, v.height, v.id + " square");
              }
              const choiceData = await page
                .locator("main[data-workspace]")
                .evaluate((root) =>
                  [
                    ...root.querySelectorAll(
                      ".seda-choice__control,.seda-toggle__control",
                    ),
                  ]
                    .filter((el) => el.getBoundingClientRect().height > 0)
                    .map((el) => {
                      const b = el.getBoundingClientRect();
                      const row=el.closest('label');
                      return {
                        kind: el.classList.contains("seda-toggle__control")
                          ? "toggle"
                          : "choice",
                        height: b.height,
                        width: b.width,
                        compact:row.dataset.content==='none'||row.classList.contains('workspace-row-choice'),
                        gap:parseFloat(getComputedStyle(row).columnGap),
                      };
                    }),
                );
              for (const choice of choiceData) {
                const mark = Math.max(d.icon, d.font);
                near(
                  choice.height,
                  choice.kind === "toggle" ? mark + 4 : mark,
                  "choice/Toggle size",
                );
                near(
                  choice.width,
                  choice.kind === "toggle" ? mark * 2 + 4 : mark,
                  "choice/Toggle shape",
                );
                near(choice.gap,choice.compact?0:8+params.airX,choice.compact?'unlabelled table choice has no content gap':'choice gap from base + X');
              }
              const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth - innerWidth,
              );
              assert.ok(
                overflow <= 1,
                `page overflow ${overflow} at ${width}/${section}`,
              );
              const checkText = await page
                .locator("#conformance")
                .textContent();
              assert.match(checkText, /^PASS/);
              configurations.push({
                params,
                width,
                section,
                visibleControls: data.length + choiceData.length,
                height: d.height,
              });
              if (size === "m" && width === 1543 && params.airX === 0)
                await page.screenshot({
                  path: path.join(output, `${section}-${theme}.png`),
                  fullPage: true,
                });
              if (size === "xl" && width === 390 && params.airX === 24)
                await page.screenshot({
                  path: path.join(output, `${section}-${theme}-narrow-xl.png`),
                  fullPage: true,
                });
            }
          }
        }
        await selectPage("projects");
        return configurations;
      });
    }
  await check("workspace-tokens-and-native-keyboard", async () => {
    await fresh();
    await configure("Dark", "m", { scale: 125, air: 4, airX: 8, radius: 125 });
    await selectPage("settings");
    const evidence = await page.evaluate(() =>
      window.sedaPilot.getWorkspaceEvidence(),
    );
    for (const name of ["select", "checkbox", "radio", "toggle"])
      assert.ok(
        evidence.evidence.some(
          (e) => e.component === name && e.chain.length > 1,
        ),
        name + " has resolver chain",
      );
    assert.deepEqual(evidence.coverage.libraryAdapter, ["SplitView", "FileUpload", "Badge", "Tag", "Alert", "Toast", "Table", "Card", "Avatar", "AvatarGroup"]);
    assert.ok(evidence.evidence.some(e=>e.component==='foundation'&&e.property==='--border-subtle'&&e.chain.length>0));
    assert.deepEqual(evidence.coverage.contract, ["Button", "IconButton", "TextField", "Select", "Checkbox", "Radio", "Toggle", "Tabs", "DropdownMenu", "Tree", "TextArea", "Slider", "NumberField"]);
    const token = evidence.evidence.find(
      (e) => e.property === "--seda-select-surface-default",
    );
    const color = await page.evaluate((value) => {
      const el = document.createElement("span");
      el.style.color = value;
      document.body.append(el);
      const result = getComputedStyle(el).color;
      el.remove();
      return result;
    }, token.cssValue);
    assert.equal(
      await page
        .locator("#workspace-region")
        .evaluate(
          (el) =>
            getComputedStyle(el.closest(".seda-field__control"))
              .backgroundColor,
        ),
      color,
    );
    await page.locator("#workspace-region").focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    assert.ok(await page.locator("#workspace-region").inputValue());
    await page.getByRole("tab", {name:"Доступ и уведомления",exact:true}).click();
    const radio = page.locator(
      'input[name="workspace-visibility"][value="private"]',
    );
    await radio.focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page
        .locator('input[name="workspace-visibility"][value="team"]')
        .isChecked(),
      true,
    );
    await page.locator("#workspace-notifications").focus();
    await page.keyboard.press("Space");
    assert.equal(await page.locator("#workspace-digest").isDisabled(), true);
    await page.keyboard.press("Space");
    assert.equal(await page.locator("#workspace-digest").isDisabled(), false);
    await page.getByRole("tab", {name:"Доступ и уведомления",exact:true}).focus();
    await page.keyboard.press("Home");
    const ring = await page.locator("#workspace-region").evaluate((el) => {
      el.focus();
      return getComputedStyle(el.closest(".seda-field__control")).outlineStyle;
    });
    assert.equal(ring, "solid");
    return {
      resolvedLeaves: evidence.evidence.length,
      selectSurface: color,
      keyboard: "Select/Radio/Toggle",
    };
  });
  await check("workspace-projects-coupled-table", async () => {
    await fresh();
    await page.locator("#filter").selectOption("active");
    assert.equal(await page.locator("#projects-table-body > tr[data-row-key]").count(), 2);
    await page.locator("#team-filter").selectOption("Core");
    assert.equal(await page.locator("#projects-table-body > tr[data-row-key]").count(), 1);
    await page.locator("#reset-filters").click();
    await page.locator("#only-active").check();
    await page.locator("#projects-table-select-all").check();
    assert.equal(
      await page.locator('#projects-table-body input[type="checkbox"]:checked').count(),
      2,
    );
    await page.locator("#bulk-pause").click();
    assert.match(
      await page.locator("#projects-table-body").textContent(),
      /Проекты не найдены/,
    );
    await page.locator("#reset-filters").click();
    assert.equal(await page.locator("#projects-table-body > tr[data-row-key]").count(), 4);
    await page.locator("#project-sort").selectOption("name-desc");
    const names=["Orbit Studio","Nova Console","Horizon App","Atlas Platform"];
    for(const [index,name]of names.entries())assert.equal(await page.locator('#projects-table-body > tr[data-row-key]').nth(index).getByRole('rowheader',{name,exact:true}).count(),1);
    await page.locator("#page-size").selectOption("3");
    assert.equal(await page.locator("#projects-table-body > tr[data-row-key]").count(), 3);
    await page.locator("#next-page").click();
    assert.equal(await page.locator("#projects-table-body > tr[data-row-key]").count(), 1);
    assert.equal(await page.locator("#next-page").isDisabled(), true);
    await page.locator("#search").fill("missing");
    assert.equal(await page.locator("#next-page").isDisabled(), true);
    assert.equal(await page.locator("#previous-page").isDisabled(), true);
    await page.locator("#reset-filters").click();
    await page.locator("#page-size").selectOption("10");
    await page.locator("#filter").selectOption("active");
    await page.locator("#create").click();
    await page.locator("#modalName").fill("New desktop project");
    await page.locator("#modalName").press("Enter");
    assert.equal(await page.locator("#filter").inputValue(), "all");
    assert.equal(await page.locator("#projects-table-body > tr[data-row-key]").count(), 5);
    return {
      filters: "intersection",
      bulk: "2 active → paused",
      pagination: "3+1",
      creation: "resets filters",
    };
  });
  await check("workspace-settings-validation-state", async () => {
    await fresh();
    await selectPage("settings");
    await page.locator("#workspace-description").fill("Согласованное описание\nКомандный контекст");
    await page.locator("#workspace-name").fill("");
    await page.locator("#workspace-email").fill("invalid");
    await page.locator("#workspace-url").fill("http://insecure.example");
    await page.locator("#workspace-budget").fill("-1");
    await page.locator("#workspace-apply").click();
    assert.equal(
      await page.locator("#workspace-name").getAttribute("aria-invalid"),
      "true",
    );
    assert.equal(
      await page
        .locator("#workspace-name")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await page.locator("#workspace-name").fill("Desktop application");
    await page.locator("#workspace-email").fill("owner@product.example");
    await page.locator("#workspace-url").fill("https://product.example");
    await page.locator("#workspace-budget").fill("5000");
    assert.equal(await page.locator("#workspace-description").inputValue(),"Согласованное описание\nКомандный контекст");
    await page.locator("#workspace-team").selectOption("Design");
    await page.locator("#workspace-apply").click();
    assert.match(
      await page.locator("#workspace-notice").textContent(),
      /сохранены/,
    );
    await selectPage("projects");
    await configure("Dark", "xl", {
      scale: 125,
      air: 6,
      airX: 18,
      radius: 150,
    });
    await selectPage("settings");
    assert.equal(
      await page.locator("#workspace-name").inputValue(),
      "Desktop application",
    );
    assert.equal(await page.locator("#workspace-team").inputValue(), "Design");
    assert.equal(await page.locator("#workspace-description").inputValue(),"Согласованное описание\nКомандный контекст");
    await page.locator("#workspace-description").fill("Несохранённый контекст");
    await page.locator("#workspace-name").fill("Unsaved");
    await page
      .getByRole("button", { name: "Отменить изменения", exact: true })
      .click();
    assert.equal(
      await page.locator("#workspace-name").inputValue(),
      "Desktop application",
    );
    assert.equal(await page.locator("#workspace-description").inputValue(),"Согласованное описание\nКомандный контекст");
    return {
      validation: "text/email/url/number",
      persistence: "navigation and profile changes",
      cancel: "last session snapshot",
    };
  });
  await check("workspace-tabs-contract-and-cross-panel-validation", async () => {
    await fresh();await selectPage("settings");
    const general=page.getByRole("tab",{name:"Основные параметры",exact:true});
    const access=page.getByRole("tab",{name:"Доступ и уведомления",exact:true});
    assert.equal(await page.locator("#settings-tabs").getAttribute("data-seda-contract"),"Tabs");
    await page.locator("#workspace-name").fill("Unsaved panel draft");
    await general.focus();await page.keyboard.press("ArrowRight");
    assert.equal(await access.getAttribute("aria-selected"),"true");
    assert.equal(await page.locator("#workspace-name").isVisible(),false);
    await page.locator("#workspace-notifications").uncheck();
    assert.equal(await page.locator("#workspace-digest").isDisabled(),true);
    await access.focus();await page.keyboard.press("Home");
    assert.equal(await page.locator("#workspace-name").inputValue(),"Unsaved panel draft");
    await page.locator("#workspace-name").fill("");await access.click();
    await page.locator("#workspace-apply").click();
    assert.equal(await general.getAttribute("aria-selected"),"true");
    assert.equal(await page.locator("#workspace-name").evaluate(el=>el===document.activeElement),true);
    assert.equal(await page.locator("#workspace-name").getAttribute("aria-invalid"),"true");
    await page.locator("#workspace-name").fill("Desktop panels");
    await configure("Dark","xl",{scale:125,air:6,airX:18,radius:150});
    await access.click();assert.equal(await page.locator("#workspace-notifications").isChecked(),false);
    const tabGeometry=await access.evaluate(el=>({height:el.getBoundingClientRect().height,padding:parseFloat(getComputedStyle(el).paddingInlineStart)}));
    const derived=await page.evaluate(()=>window.sedaPilot.getLab().derived);
    near(tabGeometry.height,derived.height,"Tabs compiled/experimental height");near(tabGeometry.padding,derived.fieldPaddingX,"Tabs base + X");
    await page.locator("#workspace-apply").click();assert.match(await page.locator("#workspace-notice").textContent(),/сохранены/);
    await general.click();assert.equal(await page.locator("#workspace-name").inputValue(),"Desktop panels");
    await page.setViewportSize({width:390,height:900});
    assert.equal(await page.locator("#settings-tabs [role=tablist]").evaluate(el=>el.scrollWidth>el.clientWidth),true);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1);
    return {contract:"Tabs",draftRetained:true,crossPanelErrorRevealed:true,keyboard:true,notificationsRetained:true,tabGeometry};
  });
  await check("workspace-members-local-addition", async () => {
    await fresh();
    await selectPage("members");
    await page.locator("#member-search").fill("Анна");
    assert.equal(await page.locator("#members-page tbody tr").count(), 1);
    await page.locator("#member-search").fill("");
    await page.locator("#member-role-filter").selectOption("editor");
    assert.equal(await page.locator("#members-page tbody tr").count(), 1);
    await page.locator("#invite-email").fill("invalid");
    await page.locator("#workspace-invite").getByRole("button").click();
    assert.equal(
      await page.locator("#invite-email").getAttribute("aria-invalid"),
      "true",
    );
    await page.locator("#invite-email").fill("new@product.example");
    await page.locator("#invite-role").selectOption("viewer");
    await page.locator("#workspace-invite").getByRole("button").click();
    assert.equal(await page.locator("#members-page tbody tr").count(), 4);
    await page.locator("#invite-email").fill("new@product.example");
    await page.locator("#workspace-invite").getByRole("button").click();
    assert.match(
      await page.locator("#invite-email-message").textContent(),
      /уже добавлен/,
    );
    assert.equal(await page.locator("#members-page tbody tr").count(), 4);
    await selectPage("settings");
    await selectPage("members");
    assert.equal(await page.locator("#members-page tbody tr").count(), 4);
    return { added: 1, duplicate: "blocked", networkInvitations: "none" };
  });
  await check("workspace-pending-save-across-navigation", async () => {
    await fresh();
    await page.locator("#project").fill("Request A");
    await page.locator("#save").click();
    await page.locator("#project").fill("New B");
    const state = await page.evaluate(() => window.sedaPilot.getState());
    await selectPage("settings");
    await configure("Dark", "xl", {
      scale: 150,
      air: 12,
      airX: 24,
      radius: 175,
    });
    await selectPage("members");
    await selectPage("projects");
    assert.deepEqual(
      await page.evaluate(() => window.sedaPilot.getState()),
      state,
    );
    await page.locator("#success").click();
    const after = await page.evaluate(() => window.sedaPilot.getState());
    assert.equal(after.savedValue, "Request A");
    assert.equal(after.projectName, "New B");
    assert.equal(after.dirty, true);
    return {
      snapshot: "Request A",
      retained: "New B",
      navigation: "projects → settings → members → projects",
    };
  });
  await check("workspace-menu-contract-and-profile-focus", async () => {
    await fresh();
    const trigger=page.getByRole('button',{name:'Действия проекта Atlas Platform',exact:true});
    const measurements=[];
    for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl']){
      await configure(theme,size,{scale:125,air:4,airX:12,radius:125});
      await trigger.click();await page.getByRole('menu').waitFor();
      const first=page.getByRole('menuitem',{name:'Открыть сведения',exact:true});
      await first.focus();
      const hoverPaint=await trigger.evaluate(el=>{const css=getComputedStyle(el),probe=document.createElement('span');probe.style.backgroundColor=css.getPropertyValue('--icon-button-ghost-surface-hover');document.body.append(probe);const result={actual:css.backgroundColor,expected:getComputedStyle(probe).backgroundColor,token:css.getPropertyValue('--icon-button-ghost-surface-hover').trim()};probe.remove();return result;});
      assert.ok(hoverPaint.token);assert.equal(hoverPaint.actual,hoverPaint.expected);
      await page.mouse.move(0,0);
      const actual=await first.evaluate(el=>{const s=getComputedStyle(el);const rect=el.getBoundingClientRect();return {height:rect.height,font:parseFloat(s.fontSize),padding:parseFloat(s.paddingInlineStart),surface:getComputedStyle(el.closest('[role=menu]')).backgroundColor};});
      const derived=await page.evaluate(()=>window.sedaPilot.getLab().derived);
      near(actual.height,derived.height,'Menu row shares computed height');near(actual.font,derived.font,'Menu font');near(actual.padding,derived.fieldPaddingX,'Menu base + X');
      assert.equal(await trigger.evaluate(el=>Math.abs(el.getBoundingClientRect().width-el.getBoundingClientRect().height)<=1),true);
      const triggerPalette=await trigger.evaluate(el=>({variant:el.dataset.variant,foreground:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor,text:el.textContent}));
      assert.equal(triggerPalette.variant,'ghost');assert.equal(triggerPalette.background,'rgba(0, 0, 0, 0)');assert.equal(await trigger.locator('[data-seda-icon]').getAttribute('data-seda-icon'),'more');
      const iconColor=await page.evaluate(value=>{const e=document.createElement('span');e.style.color=value;document.body.append(e);const color=getComputedStyle(e).color;e.remove();return color;},(await page.evaluate(()=>window.sedaPilot.getEvidence())).recipes.help.vars['--seda-foreground-default']);
      assert.equal(triggerPalette.foreground,iconColor);
      await page.evaluate(({theme,size})=>window.sedaPilot.configure({theme,controlSize:size}),{theme:theme==='Light'?'Dark':'Light',size:size==='xl'?'s':'xl'});await settle();
      assert.equal(await first.evaluate(el=>document.activeElement===el),true);
      measurements.push({theme,size,...actual});await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
    }
    const evidence=await page.evaluate(()=>window.sedaPilot.getWorkspaceEvidence());
    assert.ok(evidence.evidence.some(e=>e.component==='dropdownmenu'&&e.property==='--dropdown-menu-item-surface-hover'&&e.chain.length>1));
    return {measurements,focusRetained:true,iconTriggerSquare:true};
  });
  await check("workspace-menu-actions-and-dialog-handoff", async () => {
    await fresh();
    const trigger=page.getByRole('button',{name:'Действия проекта Atlas Platform',exact:true});
    await trigger.click();await page.getByRole('menuitem',{name:'Открыть сведения',exact:true}).click();
    assert.equal(await page.locator('#project').inputValue(),'Atlas Platform');assert.equal(await page.locator('#project').evaluate(el=>document.activeElement===el),true);
    await trigger.click();await page.getByRole('menuitem',{name:'Создать копию',exact:true}).click();
    assert.equal(await page.getByRole('menu').count(),0);assert.equal(await page.locator('#modalName').inputValue(),'Atlas Platform — копия');assert.equal(await page.locator('#modalName').evaluate(el=>document.activeElement===el),true);
    await page.locator('#modalName').press('Enter');assert.equal(await page.locator('#projects-table-body > tr[data-row-key]').count(),5);
    await page.locator('#project').fill('Несохранённый draft');
    await trigger.click();await page.getByRole('menuitem',{name:'Удалить проект',exact:true}).click();
    assert.equal(await page.locator('#projects-table-body > tr[data-row-key]').count(),5);assert.equal(await page.locator('#delete-project-dialog').evaluate(el=>el.open),true);
    await page.keyboard.press('Escape');await settle();assert.equal(await page.locator('#projects-table-body > tr[data-row-key]').count(),5);assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
    await trigger.click();await page.getByRole('menuitem',{name:'Удалить проект',exact:true}).click();await page.locator('#confirmDeleteProject').click();await settle();
    assert.equal(await page.locator('#projects-table-body > tr[data-row-key]').count(),4);assert.equal(await trigger.count(),0);assert.equal(await page.locator('#search').evaluate(el=>document.activeElement===el),true);assert.equal(await page.locator('#project').inputValue(),'Несохранённый draft');
    return {details:true,copyDialog:true,deleteConfirmation:true,cancelRetained:true,removedTriggerFocusFallback:true,formDraftRetained:true};
  });
  await check("workspace-dialog-field-theme-isolation", async () => {
    await page.setViewportSize({width:1543,height:1100});await fresh();const samples=[];
    for(const theme of ['Light','Dark'])for(const size of ['s','m','l','xl']){
      await configure(theme,size,{scale:125,air:6,airX:24,radius:125});await page.locator('#create').click();
      const field=page.locator('#modalName');
      const actual=await field.evaluate(el=>{const inner=getComputedStyle(el),outer=getComputedStyle(el.closest('.seda-field__control'));return {innerBackground:inner.backgroundColor,innerColor:inner.color,wrapperColor:outer.color,wrapperBackground:outer.backgroundColor,padding:parseFloat(outer.paddingInlineStart)};});
      assert.equal(actual.innerBackground,'rgba(0, 0, 0, 0)');assert.equal(actual.innerColor,actual.wrapperColor);assert.notEqual(actual.wrapperBackground,'rgba(0, 0, 0, 0)');
      samples.push({theme,size,...actual});await page.keyboard.press('Escape');
    }
    await page.locator('#size').selectOption('xl');await page.locator('#theme').selectOption('dark');await page.locator('#airX').fill('24');await page.screenshot({path:path.join(output,'dark-field-isolation.png')});
    return {samples};
  });
  await check("workspace-editor-panels-history-and-local-save", async () => {
    await page.setViewportSize({width:1543,height:1100});await page.evaluate(()=>localStorage.removeItem('seda.lab.editor-layout.v1'));await fresh();await selectPage('editor');
    const navigation=page.getByRole('separator',{name:'Ширина списка объектов',exact:true});
    const paneSize=()=>page.locator('#editor-layout-primary').evaluate(el=>el.getBoundingClientRect().width);
    const before=await paneSize();await navigation.focus();await page.keyboard.press('ArrowRight');await settle();near(await paneSize(),before+8,'editor panel keyboard');
    await page.locator('#editor-node-button').click();await page.locator('#editor-node-text').fill('Запустить задачу');
    assert.equal(await page.locator('#editor-preview-button').textContent(),'Запустить задачу');
    await page.locator('#editor-undo').click();assert.equal(await page.locator('#editor-preview-button').textContent(),'Создать задачу');await page.locator('#editor-redo').click();assert.equal(await page.locator('#editor-preview-button').textContent(),'Запустить задачу');
    await page.locator('#editor-button-variant').selectOption('secondary');assert.equal(await page.locator('#editor-preview-button').getAttribute('data-variant'),'secondary');
    await page.locator('#editor-button-disabled').check();assert.equal(await page.locator('#editor-preview-button').isDisabled(),true);await page.locator('#editor-button-disabled').uncheck();await page.locator('#editor-preview-button').click();assert.equal(await page.locator('#editor-preview-count').textContent(),'1');
    await page.locator('#editor-node-visible').uncheck();assert.equal(await page.locator('#editor-preview-button').isVisible(),false);await page.locator('#editor-node-visible').check();
    await configure('Dark','l',{scale:125,air:4,airX:12,radius:125});assert.equal(await page.locator('#editor-node-text').inputValue(),'Запустить задачу');assert.equal(await page.locator('#editor-preview-count').textContent(),'1');
    await selectPage('projects');await selectPage('editor');assert.equal(await page.locator('#editor-node-text').inputValue(),'Запустить задачу');
    await page.locator('#editor-save-layout').click();assert.match(await page.locator('#editor-storage-notice').textContent(),/сохранены/);const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('seda.lab.editor-layout.v1')));assert.equal(saved.document.button.text,'Запустить задачу');
    await fresh();await selectPage('editor');await page.locator('#editor-node-button').click();assert.equal(await page.locator('#editor-node-text').inputValue(),'Запустить задачу');assert.equal(await page.locator('#editor-button-variant').inputValue(),'secondary');near(await paneSize(),saved.navigation,'saved panel restored');assert.match(await page.locator('#editor-storage-notice').textContent(),/Восстановлен/);
    for(const theme of ['Light','Dark']){await configure(theme,'m',{scale:100,air:0,airX:0,radius:100});await page.screenshot({path:path.join(output,'editor-'+theme.toLowerCase()+'.png')});}
    return {keyboardResize:true,history:true,previewLinked:true,disabledAndVisible:true,profileDraftRetained:true,navigationRetained:true,localReload:true,saved};
  });
  await check("workspace-editor-storage-errors-and-corruption", async () => {
    await page.evaluate(()=>localStorage.setItem('seda.lab.editor-layout.v1','{"version":99}'));await fresh();await selectPage('editor');assert.match(await page.locator('#editor-storage-notice').textContent(),/Не удалось восстановить/);
    await page.locator('#editor-node-button').click();await page.locator('#editor-node-text').fill(' ');await page.locator('#editor-save-layout').click();assert.match(await page.locator('#editor-storage-notice').textContent(),/Заполните текст/);assert.equal(await page.locator('#editor-preview-button').count(),0);
    await page.locator('#editor-node-text').fill('Восстановленный текст');
    await page.evaluate(()=>{window.restoreEditorStorage=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('Disabled storage','QuotaExceededError');};});
    try{await page.locator('#editor-save-layout').click();assert.match(await page.locator('#editor-storage-notice').textContent(),/Не удалось сохранить/);assert.equal(await page.locator('#editor-storage-notice').getAttribute('role'),'alert');}
    finally{await page.evaluate(()=>{Storage.prototype.setItem=window.restoreEditorStorage;delete window.restoreEditorStorage;localStorage.removeItem('seda.lab.editor-layout.v1');});}
    return {corruptionFallback:true,emptyTextGuard:true,quotaErrorVisible:true};
  });
  await check("workspace-editor-tree-selection-expansion-and-reload", async () => {
    await page.evaluate(()=>localStorage.removeItem('seda.lab.editor-layout.v1'));await fresh();await selectPage('editor');
    const tree=page.getByRole('tree',{name:'Слои макета'}),frame=page.locator('#editor-node-frame'),heading=page.locator('#editor-node-heading'),button=page.locator('#editor-node-button');
    assert.equal(await tree.count(),1);assert.equal(await heading.getAttribute('aria-level'),'2');
    await heading.focus();await page.keyboard.press('ArrowDown');assert.equal(await button.evaluate(el=>el===document.activeElement),true);assert.match(await page.locator('#editor-selection').textContent(),/heading/);
    await page.keyboard.press('Space');assert.match(await page.locator('#editor-selection').textContent(),/button/);
    await page.locator('#editor-node-text').fill('Обновление из дерева');assert.equal(await button.locator('.seda-tree__label').textContent(),'Обновление из дерева');assert.equal(await page.locator('#editor-preview-button').textContent(),'Обновление из дерева');
    await frame.locator(':scope > .seda-tree__row > [data-tree-disclosure]').click();assert.equal(await button.count(),0);assert.match(await page.locator('#editor-selection').textContent(),/button/);
    await page.locator('#editor-save-layout').click();await fresh();await selectPage('editor');assert.equal(await frame.getAttribute('aria-expanded'),'false');assert.match(await page.locator('#editor-selection').textContent(),/button/);assert.equal(await page.locator('#editor-node-text').inputValue(),'Обновление из дерева');
    await frame.focus();await page.keyboard.press('ArrowRight');assert.equal(await button.getAttribute('aria-selected'),'true');
    await page.locator('#editor-node-text').fill('История дерева');await page.locator('#editor-undo').click();assert.equal(await button.locator('.seda-tree__label').textContent(),'Обновление из дерева');await page.locator('#editor-redo').click();assert.equal(await button.locator('.seda-tree__label').textContent(),'История дерева');
    return {sharedTree:true,focusDoesNotSelect:true,selectionInspectorPreview:true,hiddenSelectionPreserved:true,viewReload:true,historyUpdatesLabels:true};
  });
  await check("workspace-browser-errors", () => assert.deepEqual(errors, []));
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  await fs.writeFile(
    path.join(output, "results.json"),
    JSON.stringify(
      { scope: "joint web/desktop application workspace", results, errors },
      null,
      2,
    ),
  );
}
const failed = results.filter((r) => r.status === "failed");
console.log(
  JSON.stringify({
    passed: results.length - failed.length,
    failed: failed.length,
    output,
  }),
);
if (failed.length) process.exitCode = 1;
