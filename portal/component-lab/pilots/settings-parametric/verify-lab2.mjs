import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { chromium, firefox, webkit } from "playwright";
import { createPilotServer } from "./server.mjs";
import { derive } from "./lab-model.mjs";
const engineName = process.env.SEDA_BROWSER_ENGINE || "chromium";
const engines = { chromium, firefox, webkit };
if (!Object.hasOwn(engines, engineName)) throw new Error(`Unsupported browser engine: ${engineName}`);
const output = path.join(import.meta.dirname, engineName === "chromium" ? ".diagnostics-lab2" : `.diagnostics-lab2-${engineName}`);
await fs.mkdir(output, { recursive: true });
const server = await createPilotServer({ port: 0 });
const url = `http://127.0.0.1:${server.address().port}/?review=1`;
const browser = await engines[engineName].launch({
  headless: true,
  ...(process.env.SEDA_BROWSER_EXECUTABLE
    ? { executablePath: process.env.SEDA_BROWSER_EXECUTABLE }
    : {}),
});
const page = await browser.newPage();
page.setDefaultTimeout(6000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const results = [];
const screenshots = [];
const settle = () =>
  page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
const near = (a, b, label) =>
  assert.ok(Math.abs(a - b) <= 1, `${label}: ${a} != ${b}`);
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
async function configure(theme, size) {
  await page.evaluate(
    ({ theme, size }) =>
      window.sedaPilot.configure({ theme, controlSize: size }),
    { theme, size },
  );
  await settle();
}
const box = (selector) => page.locator(selector).boundingBox();
try {
  await check("build-source-artifact-integrity", async () => {
    const metadata = JSON.parse(
      await fs.readFile(
        path.join(process.env.SEDA_PILOT_DIST || path.join(import.meta.dirname, "dist"), "build-metadata.json"),
      ),
    );
    const hash = (bytes) =>
      crypto.createHash("sha256").update(bytes).digest("hex");
    const repo = path.resolve(import.meta.dirname, "../../../..");
    for (const [name, expected] of Object.entries(metadata.provenance.sources))
      assert.equal(
        hash(await fs.readFile(path.join(repo, name))),
        expected,
        name + " changed after build",
      );
    for (const item of metadata.artifacts) {
      const response = await page.request.get(new URL(item.path, url).href);
      assert.equal(response.status(), 200);
      assert.equal(
        hash(await response.body()),
        item.sha256,
        item.path + " differs from build",
      );
    }
    return {
      sources: Object.keys(metadata.provenance.sources).length,
      artifacts: metadata.artifacts.length,
    };
  });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await settle();
  await check("service-panels-use-seda-components", async () => {
    const left = page.locator("aside.rail");
    const right = page.locator("aside.inspector");
    assert.equal(await left.locator('select[data-seda-contract="Select"]').count(), 2);
    assert.equal(await left.locator('[data-seda-contract="Slider"]').count(), 4);
    assert.equal(await left.locator('input[data-seda-contract="Checkbox"]').count(), 1);
    assert.equal(await right.locator(".seda-card.inspectcard").count(), 6);
    assert.equal(await right.locator(".seda-accordion").count(), 2);
    assert.equal(await left.locator(".seda-alert").count(), 1);
    assert.equal(await right.locator("#conformance.seda-alert").count(), 1);
    assert.equal(await right.locator("button.seda-button[data-node]").count(), 7);
    assert.equal(await left.locator('.ends .seda-text[data-seda-text="caption/tiny"]').count(), 8);
    assert.equal(await right.locator('#nodeResult.seda-text[data-seda-text="metric/default"]').count(), 1);
    assert.equal(await right.locator('#equation.seda-text[data-seda-text="code/small"]').count(), 1);
    assert.equal(await right.locator('.metricrow strong.seda-text[data-seda-text="metric/small"]').count(), 2);
    await right.locator('[data-node="airX"]').click();
    assert.equal(await right.locator("#lab-active-node").textContent(), "airX");
    await right.locator("#applied-value-sources .seda-accordion__trigger").click();
    assert.equal(await right.locator('select#source-component[data-seda-contract="Select"]').count(), 1);
    await right.locator("#source-component").selectOption("save");
    assert.match(await right.locator(".source").first().textContent(), /seda|Lab|tokens|control/i);
    await page.locator("#theme").selectOption("dark");
    await page.locator("#size").selectOption("l");
    await page.locator("#strict").setChecked(false);
    await settle();
    assert.equal((await page.evaluate(() => window.sedaPilot.getCompiled())).configuration.controlSize, "l");
    assert.equal((await page.evaluate(() => window.sedaPilot.getLab())).parameters.strict, false);
    await right.locator("#applied-value-sources .seda-accordion__trigger").click();
    await page.setViewportSize({width:1440,height:900});
    await page.evaluate(() => window.scrollTo(0,0));
    await page.screenshot({path:path.join(output,"service-panels-dark.png")});
    await page.locator("#reset").click();
    await settle();
    await page.evaluate(() => window.scrollTo(0,0));
    await page.screenshot({path:path.join(output,"service-panels-light.png")});
  });
  for (const width of [1440, 1180, 780, 390])
    for (const theme of ["Light", "Dark"])
      for (const size of ["s", "m", "l", "xl"]) {
        await check(`geometry-${width}-${theme}-${size}`, async () => {
          await page.setViewportSize({ width, height: 1000 });
          await configure(theme, size);
          const c = await page.evaluate(() => window.sedaPilot.getCompiled());
          const data = await page.evaluate(() =>
            ["create", "save", "cancel", "help", "project"].map((id) => {
              let el = document.getElementById(id);
              if (id === "project") el = el.closest(".seda-field__control");
              const s = getComputedStyle(el),
                b = el.getBoundingClientRect();
              return {
                id,
                width: b.width,
                height: b.height,
                radius: parseFloat(s.borderRadius),
                font: parseFloat(s.fontSize),
                line: parseFloat(s.lineHeight),
                color: s.color,
                bg: s.backgroundColor,
              };
            }),
          );
          for (const v of data) {
            near(v.height, c.geometry.height.value, v.id + " height");
            near(v.radius, c.geometry.radius.value, v.id + " radius");
            near(v.font, c.geometry.fontSize.value, v.id + " font");
            near(v.line, c.geometry.lineHeight.value, v.id + " line");
          }
          assert.match(
            await page.locator("#conformance").textContent(),
            /^PASS/,
          );
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
          );
          assert.ok(overflow <= 1, `viewport overflow ${overflow}`);
          const cols = await page
            .locator(".workspace")
            .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
          if (width === 1440) {
            assert.equal(cols.split(" ").length, 3);
            assert.equal(
              (
                await page
                  .locator(".secondaryGrid")
                  .evaluate((el) => getComputedStyle(el).gridTemplateColumns)
              ).split(" ").length,
              2,
            );
          }
          if (size === "m") {
            const file = `${width}-${theme}.png`;
            await page.screenshot({
              path: path.join(output, file),
              fullPage: true,
            });
            screenshots.push(file);
          }
          return { geometry: data, columns: cols, overflow };
        });
      }
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const theme of ["Light", "Dark"])
    for (const size of ["s", "m", "l", "xl"]) {
      await check(`loading-${theme}-${size}`, async () => {
        await configure(theme, size);
        const matrix = [];
        for (const airX of [0, 6, 24]) {
          await page.locator("#airX").fill(String(airX));
          await settle();
          for (const label of [
            "OK",
            "Сохранить",
            "Сохранить изменения проекта",
          ]) {
            await page.evaluate(
              (label) => window.sedaReview.setLabel(label),
              label,
            );
            await settle();
            for (const slot of ["none", "left", "right", "both"]) {
              const sel = "#review-button-" + slot;
              const before = await box(sel);
              if (slot === "none") {
                assert.equal(
                  await page.locator(sel + " .seda-button__leading").count(),
                  0,
                );
                const labelBox = await box(sel + " .seda-button__label");
                near(
                  labelBox.x + labelBox.width / 2,
                  before.x + before.width / 2,
                  "label centered",
                );
              }
              await page.evaluate(() => window.sedaReview.setLoading(true));
              await settle();
              const during = await box(sel);
              near(during.width, before.width, "loading width");
              near(during.height, before.height, "loading height");
              const spinner = await box(sel + " .seda-button__spinner");
              near(
                spinner.x + spinner.width / 2,
                during.x + during.width / 2,
                "spinner x",
              );
              near(
                spinner.y + spinner.height / 2,
                during.y + during.height / 2,
                "spinner y",
              );
              assert.equal(
                await page
                  .locator(sel + " .seda-button__label")
                  .evaluate((el) => getComputedStyle(el).opacity),
                "0",
              );
              assert.equal(
                await page.locator(sel).getAttribute("aria-busy"),
                "true",
              );
              assert.equal(
                await page.locator(sel).getAttribute("aria-disabled"),
                "true",
              );
              const activation = await page.evaluate(
                () => window.sedaReview.getState().activations,
              );
              await page.locator(sel).evaluate((el) => el.click());
              assert.equal(
                await page.evaluate(
                  () => window.sedaReview.getState().activations,
                ),
                activation,
              );
              assert.ok(
                (await page
                  .getByRole("button", { name: label, exact: true })
                  .count()) >= 1,
                "accessible label retained",
              );
              await page.evaluate(() => window.sedaReview.setLoading(false));
              await settle();
              const after = await box(sel);
              near(after.width, before.width, "restored width");
              assert.equal(
                await page.locator(sel).evaluate((el) => el.style.width),
                "",
              );
              assert.equal(
                await page.locator(sel).evaluate((el) => el.style.height),
                "",
              );
              matrix.push({
                airX,
                label,
                slot,
                width: before.width,
                height: before.height,
                deltaWidth: during.width - before.width,
                deltaHeight: during.height - before.height,
              });
            }
          }
        }
        await page.locator("#airX").fill("0");
        await settle();
        return matrix;
      });
    }
  for (const theme of ["Light", "Dark"])
    for (const size of ["s", "m", "l", "xl"]) {
      await check("padding-x-" + theme + "-" + size, async () => {
        await page.evaluate(() => window.sedaPilot.reset());
        await settle();
        await configure(theme, size);
        await page.locator("#airX").fill("0");
        await settle();
        const compiled = await page.evaluate(() =>
          window.sedaPilot.getCompiled(),
        );
        const saveBefore = await box("#save"),
          inputBefore = await box("#project"),
          iconBefore = await box("#help");
        const readPadding = () =>
          page
            .locator("#project")
            .evaluate((el) =>
              parseFloat(
                getComputedStyle(el.closest(".seda-field__control"))
                  .paddingInlineStart,
              ),
            );
        const paddingBefore = await readPadding();
        const evidence = [];
        for (const airX of [6, 24]) {
          await page.locator("#airX").fill(String(airX));
          await settle();
          const saveAfter = await box("#save"),
            inputAfter = await box("#project"),
            iconAfter = await box("#help");
          near(
            saveAfter.width,
            saveBefore.width + 2 * airX,
            "X changes button by 2X",
          );
          near(saveAfter.height, saveBefore.height, "X does not change height");
          // The control wrapper keeps its outer width; the input content narrows.
          near(
            inputAfter.width,
            inputBefore.width - 2 * airX,
            "TextField content width",
          );
          near(
            await readPadding(),
            paddingBefore + airX,
            "TextField padding is baseline + X",
          );
          near(iconAfter.width, iconBefore.width, "IconButton ignores X");
          near(iconAfter.width, iconAfter.height, "IconButton square");
          const applied = await page.evaluate(() =>
            window.sedaPilot.getEvidence(),
          );
          assert.equal(
            applied.recipes.save.vars["--seda-control-padding-inline"],
            compiled.geometry.buttonPaddingInline.value + airX + "px",
          );
          assert.equal(
            applied.recipes.projectName.vars["--seda-control-padding-inline"],
            compiled.geometry.textFieldPaddingInline.value + airX + "px",
          );
          assert.equal(
            applied.recipes.help.vars["--seda-control-padding-inline"],
            undefined,
          );
          assert.ok(
            applied.recipes.save.evidence.find(
              (e) => e.property === "--seda-control-padding-inline",
            ).derivation,
          );
          evidence.push({
            airX,
            buttonWidth: saveAfter.width,
            fieldPadding: await readPadding(),
            iconWidth: iconAfter.width,
          });
        }
        await page.locator('[data-node="airX"]').click();
        assert.ok(
          (await page.locator("#nodeDesc").textContent()).includes(
            compiled.geometry.buttonPaddingInline.value + " + 24",
          ),
        );
        await page.locator("#airX").fill("0");
        await page.locator("#project").fill("X loading");
        await page.locator("#save").click();
        await settle();
        const frozen = await box("#save");
        await page.locator("#airX").fill("24");
        await settle();
        near(
          (await box("#save")).width,
          frozen.width,
          "X change during loading retains snapshot",
        );
        await page.locator("#success").click();
        await settle();
        near(
          (await box("#save")).width,
          saveBefore.width + 48,
          "completion applies new X",
        );
        await page.locator("#reset").click();
        await settle();
        assert.equal(await page.locator("#airX").inputValue(), "0");
        return evidence;
      });
    }
  await check("custom-formula-react-evidence", async () => {
    await page.evaluate(() => window.sedaPilot.reset());
    await settle();
    await page.locator("#airX").fill("0");
    await settle();
    await configure("Light", "m");
    for (const [scale, air, radius, strict] of [
      [150, 12, 175, true],
      [80, 0, 50, true],
      [80, 0, 50, false],
    ]) {
      for (const [id, value] of [
        ["scale", scale],
        ["air", air],
        ["radius", radius],
      ])
        await page.locator("#" + id).fill(String(value));
      await page.locator("#strict").setChecked(strict);
      await settle();
      const lab = await page.evaluate(() => window.sedaPilot.getLab());
      const c = await page.evaluate(() => window.sedaPilot.getCompiled());
      const expected = derive(c, { scale, air, radius, strict, airX: 0 });
      assert.deepEqual(lab.derived, expected);
      const h = (await box("#save")).height;
      near(h, expected.height, "derived React height");
      assert.match(
        await page.locator("#equation").textContent(),
        new RegExp("= " + expected.raw + " px"),
      );
      const applied = await page.evaluate(() => window.sedaPilot.getEvidence());
      assert.equal(
        applied.recipes.save.vars["--seda-control-height"],
        h + "px",
      );
      assert.ok(
        applied.recipes.save.evidence.find(
          (e) => e.property === "--seda-control-height",
        ).derivation.inputs.height,
      );
    }
    await page.locator('[data-node="air"]').click();
    assert.equal(await page.locator("#lab-active-node").textContent(), "air");
    assert.match(await page.locator("#deps").textContent(), /padding-y/);
    await page.locator("#airX").fill("12");
    await settle();
    const download = page.waitForEvent("download");
    await page.locator("#export").click();
    const file = await (await download).path();
    const payload = JSON.parse(await fs.readFile(file));
    assert.equal(payload.source, "seda-compiled-profile");
    assert.equal(payload.parameters.airX, 12);
    assert.equal(
      payload.calculated.buttonPaddingX,
      payload.baseGeometry.buttonPaddingInline.value + 12,
    );
    assert.equal(
      payload.evidence.recipes.projectName.vars[
        "--seda-control-padding-inline"
      ],
      payload.baseGeometry.textFieldPaddingInline.value + 12 + "px",
    );
    assert.ok(payload.provenance.tokensSha256);
    assert.equal(
      payload.evidence.recipes.save.vars["--seda-control-height"],
      payload.calculated.height + "px",
    );
    await page.locator("#reset").click();
    return { exportSource: payload.source };
  });
  await check("form-guard-snapshot-stale-retry-focus", async () => {
    await page.evaluate(() => window.sedaPilot.reset());
    await settle();
    await page.locator("#project").fill("   ");
    await page.locator("#save").click();
    await settle();
    assert.equal(
      await page.locator("#project").getAttribute("aria-invalid"),
      "true",
    );
    assert.ok(
      await page
        .locator("#project")
        .evaluate((el) => el === document.activeElement),
    );
    assert.equal(
      (await page.evaluate(() => window.sedaPilot.getRequests())).length,
      0,
    );
    await page.locator("#project").fill("A");
    const before = await box("#save");
    await page.locator("#save").click();
    await settle();
    const during = await box("#save");
    near(during.width, before.width, "save width");
    near(during.height, before.height, "save height");
    await page.evaluate(() => {
      document.getElementById("settings-form").requestSubmit();
      document.getElementById("settings-form").requestSubmit();
    });
    assert.equal(
      (await page.evaluate(() => window.sedaPilot.getRequests())).length,
      1,
    );
    await page.locator("#project").fill("B");
    await configure("Dark", "xl");
    await page.locator("#reset").click();
    assert.equal(await page.locator("#project").inputValue(), "B");
    assert.equal(
      (await page.evaluate(() => window.sedaPilot.getState())).saving,
      true,
    );
    await page.locator("#success").click();
    let s = await page.evaluate(() => window.sedaPilot.getState());
    assert.equal(s.savedValue, "A");
    assert.equal(s.projectName, "B");
    assert.equal(s.dirty, true);
    await page.locator("#save").click();
    await page.locator("#failure").click();
    assert.ok(
      (await page.evaluate(() => window.sedaPilot.getState())).saveError,
    );
    assert.equal(
      await page.locator("#project").getAttribute("aria-invalid"),
      null,
    );
    await page.locator("#project").press("Enter");
    let active = await page.evaluate(() => window.sedaPilot.getState());
    assert.equal(active.activeRequest.value, "B");
    await page.evaluate(() => window.sedaPilot.respond(1, "success"));
    assert.deepEqual(
      await page.evaluate(() => window.sedaPilot.getState()),
      active,
    );
    await page.locator("#success").click();
    await page.locator("#project").fill("C");
    await page.locator("#cancel").click();
    assert.equal(await page.locator("#project").inputValue(), "B");
    await page.locator("#help").focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#help-panel").isVisible(), true);
    assert.equal(
      await page.locator("#help").getAttribute("aria-expanded"),
      "true",
    );
    await page.locator("#transport-mode").selectOption("success");
    await page.locator("#project").fill("Auto");
    await page.locator("#save").click();
    await page.waitForFunction(() => !window.sedaPilot.getState().saving);
    assert.equal(
      (await page.evaluate(() => window.sedaPilot.getState())).savedValue,
      "Auto",
    );
    return {
      requests: await page.evaluate(() => window.sedaPilot.getRequests()),
    };
  });
  await check("projects-filter-cards-dialog-keyboard", async () => {
    await page.locator("#search").fill("Atlas");
    assert.equal(await page.locator("#projects-table-body > tr[data-row-key]").count(), 1);
    await page.locator("#search").fill("");
    await page.locator("#filter").selectOption("draft");
    assert.equal(await page.locator("#projects-table-body > tr[data-row-key]").count(), 1);
    await page.locator('[data-view="cards"]').click();
    assert.equal(await page.locator("#cardsView .productcard").count(), 1);
    assert.equal(await page.locator("#tableView").isVisible(), false);
    await page.locator("#create").click();
    assert.ok(await page.locator("#modal").evaluate((el) => el.open));
    await page.locator("#modalName").fill("New Project");
    await page.locator("#modalName").press("Enter");
    await page.waitForFunction(() => !document.getElementById("modal").open);
    assert.equal(await page.locator("#modal").evaluate((el) => el.open), false);
    assert.equal(await page.locator("#cardsView .productcard").count(), 5);
    await page.locator("#create").click();
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.getElementById("modal").open);
    assert.equal(await page.locator("#modal").evaluate((el) => el.open), false);
    await page.waitForFunction(() => document.activeElement?.id === "create");
    assert.equal(
      await page
        .locator("#create")
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await page
      .locator("#cardsView .productcard")
      .first()
      .getByRole("button", { name: "Подробнее" })
      .click();
    assert.equal(await page.locator("#project").inputValue(), "New Project");
    return { projects: 5 };
  });
  await check("token-react-propagation", async () => {
    const c = await page.evaluate(() => window.sedaPilot.getCompiled());
    const altered = structuredClone(c);
    altered.geometry.height.value = 36;
    altered.geometry.height.cssValue = "36px";
    await page.evaluate(
      (value) => window.sedaPilot.replaceCompiled(value),
      altered,
    );
    await settle();
    near(
      (await box("#save")).height,
      36,
      "modified compiled geometry reaches React",
    );
    await configure("Light", "m");
    await page.waitForTimeout(160);
    const light = await page
      .locator("#cancel")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    await configure("Dark", "m");
    await page.waitForTimeout(160);
    const dark = await page
      .locator("#cancel")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    assert.notEqual(light, dark);
    return { light, dark };
  });
  await check("padding-x-responsive", async () => { await page.goto(new URL("/",url).href);await page.waitForFunction(()=>window.sedaPilot);await page.evaluate(()=>document.fonts.ready);
    const evidence = [];
    for (const width of [1440, 390])
      for (const theme of ["Light", "Dark"])
        for (const size of ["s", "m", "l", "xl"]) {
          await page.setViewportSize({ width, height: 1000 });
          await configure(theme, size);
          await page.locator("#airX").fill("24");
          await settle();
          assert.ok(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth - window.innerWidth <= 1,
            ),
            `no viewport overflow with X=24 (${width}/${theme}/${size})`,
          );
          const icon = await box("#help");
          near(icon.width, icon.height, "responsive square IconButton");
          if (size === "m") {
            const file = "x24-" + width + "-" + theme + ".png";
            await page.screenshot({
              path: path.join(output, file),
              fullPage: true,
            });
            screenshots.push(file);
          }
          evidence.push({ width, theme, size, iconWidth: icon.width });
        }
    return evidence;
  });
  await check("no-browser-errors", () => assert.deepEqual(errors, []));
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
  await fs.writeFile(
    path.join(output, "results.json"),
    JSON.stringify({ results, screenshots, errors }, null, 2),
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
