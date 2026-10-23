import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { createPilotServer } from "./server.mjs";
const output = path.join(import.meta.dirname, ".diagnostics-controls");
await fs.mkdir(output, { recursive: true });
const server = await createPilotServer({ port: 0 });
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
page.on("console", (m) => {
  if (m.type() === "error" && !m.location().url.endsWith("/favicon.ico"))
    errors.push(m.text());
});
const results = [];
const settle = () =>
  page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
const state = async (s) => {
  await page.evaluate((s) => window.sedaControlReview.setState(s), s);
  await settle();
};
async function check(name, fn) {
  try {
    const evidence = await fn();
    results.push({ name, status: "passed", evidence });
    console.log("PASS " + name);
  } catch (e) {
    results.push({ name, status: "failed", error: e.stack });
    console.log("FAIL " + name + ": " + e.message);
  }
}
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/?review=1`);
  await page.waitForFunction(() => window.sedaControlReview);
  await page.evaluate(() => document.fonts.ready);
  for (const theme of ["Light", "Dark"])
    for (const size of ["s", "m", "l", "xl"]) {
      await check("control-states-" + theme + "-" + size, async () => {
        await page.evaluate(
          ({ theme, size }) =>
            window.sedaPilot.configure({ theme, controlSize: size }),
          { theme, size },
        );
        await settle();
        const samples = [];
        for (const s of [
          {
            disabled: false,
            error: false,
            loading: false,
            indeterminate: false,
          },
          { error: true },
          { disabled: true },
          { disabled: false, error: false, indeterminate: true },
          { indeterminate: false, loading: true },
        ]) {
          await state(s);
          const snapshot = await page
            .locator("#control-fixtures")
            .evaluate((root) =>
              [...root.querySelectorAll("[data-seda-contract]")].map((el) => ({
                name: el.dataset.sedaContract,
                activity: el.dataset.contractActivity,
                validation: el.dataset.contractValidation,
                data: el.dataset.contractData,
                disabled: el.matches(":disabled"),
                invalid: el.getAttribute("aria-invalid"),
                descriptions: el.getAttribute("aria-describedby")?.split(/\s+/),
                width: el.getBoundingClientRect().width,
                height: el.getBoundingClientRect().height,
                indeterminate: el.indeterminate,
              })),
            );
          assert.equal(snapshot.length, 4);
          for (const el of snapshot) {
            assert.ok(el.width > 0 && el.height > 0);
            assert.equal(el.descriptions.length, 2);
            assert.equal(new Set(el.descriptions).size, 2);
            if (s.disabled) {
              assert.equal(el.disabled, true);
              assert.equal(el.validation, "none");
              assert.equal(el.invalid, null);
            }
          }
          if (s.indeterminate)
            assert.equal(
              snapshot.find((x) => x.name === "Checkbox").indeterminate,
              true,
            );
          if (s.loading)
            assert.equal(
              snapshot.find((x) => x.name === "Toggle").activity,
              "loading",
            );
          samples.push({ state: s, controls: snapshot });
        }
        await state({
          disabled: false,
          error: false,
          loading: false,
          indeterminate: false,
        });
        return { samples };
      });
    }
  await check("control-keyboard-multi-and-disabled-options", async () => {
    await page.locator("#control-select").selectOption("b");
    assert.equal(
      await page.evaluate(() => window.sedaControlReview.getState().value),
      "b",
    );
    const radio = page.locator('#control-radio input[value="a"]');
    await radio.focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page.evaluate(() => window.sedaControlReview.getState().radio),
      "b",
    );
    await page.keyboard.press("ArrowRight");
    assert.equal(
      await page.evaluate(() => window.sedaControlReview.getState().radio),
      "a",
    );
    await state({ multi: true });
    await page.locator("#control-select").selectOption(["a", "b"]);
    assert.deepEqual(
      await page.evaluate(() => window.sedaControlReview.getState().many),
      ["a", "b"],
    );
    await state({ multi: false });
    return { multi: ["a", "b"], radioSkippedDisabled: true };
  });
  await check("control-loading-and-disabled-guards", async () => {
    await state({ loading: true });
    const before = await page.evaluate(() =>
      window.sedaControlReview.getState(),
    );
    const box = await page.locator("#control-toggle").boundingBox();
    await page.locator("#control-toggle").click({ force: true });
    await page.locator("#control-toggle").focus();
    await page.keyboard.press("Space");
    await settle();
    assert.equal(
      await page.evaluate(() => window.sedaControlReview.getState().count),
      before.count,
    );
    assert.equal(
      await page.locator("#control-toggle").isChecked(),
      before.checked,
    );
    const after = await page.locator("#control-toggle").boundingBox();
    assert.equal(after.width, box.width);
    assert.equal(after.height, box.height);
    await state({ loading: false, disabled: true });
    const count = await page.evaluate(
      () => window.sedaControlReview.getState().count,
    );
    await page
      .locator("#control-fixtures")
      .evaluate((root) =>
        root.querySelectorAll("input,select").forEach((el) => el.click()),
      );
    assert.equal(
      await page.evaluate(() => window.sedaControlReview.getState().count),
      count,
    );
    await state({ disabled: false });
    return {
      loadingWidthDelta: 0,
      loadingHeightDelta: 0,
      callbacksWhileBlocked: 0,
    };
  });
  await check("field-single-focus-ring-and-picker", async () => {
    await page.evaluate(() =>
      window.sedaPilot.configure({ theme: "Light", controlSize: "m" }),
    );
    await settle();
    await page.locator("#nav-members").click();
    const field = page.locator("#member-search");
    await field.focus();
    async function focusEvidence(loc) {
      return loc.evaluate((el) => ({
        inner: getComputedStyle(el).outlineStyle,
        outer: getComputedStyle(el.closest(".seda-field__control"))
          .outlineStyle,
        outlineWidth: getComputedStyle(el.closest(".seda-field__control"))
          .outlineWidth,
      }));
    }
    const input = await focusEvidence(field);
    assert.equal(input.inner, "none");
    assert.equal(input.outer, "solid", JSON.stringify(input));
    assert.equal(input.outlineWidth, "2px");
    const select = page.locator("#member-role-filter");
    await field.focus();
    await page.keyboard.press("Tab");
    assert.equal(
      await select.evaluate((el) => el === document.activeElement),
      true,
    );
    const labelTops = await page.evaluate(() => ['member-search','member-role-filter'].map(id => document.getElementById(id).closest('.seda-field').querySelector('.seda-field__label').getBoundingClientRect().top));
    assert.ok(Math.abs(labelTops[0]-labelTops[1])<=1, `Label alignment: ${labelTops}`);
    const selected = await focusEvidence(select);
    assert.equal(selected.inner, "none");
    assert.equal(selected.outer, "solid", JSON.stringify(selected));
    const supported = await page.evaluate(() =>
      CSS.supports("appearance", "base-select"),
    );
    assert.equal(
      supported,
      true,
      "Target Chromium supports native picker styling",
    );
    await select.click();
    await page.screenshot({ path: path.join(output, "picker.png") });
    await page.keyboard.press("Escape");
    await page.screenshot({ path: path.join(output, "focus.png") });
    return { input, select: selected, labelTops, styledNativePicker: supported };
  });
  await check("errors-and-real-library-source", async () => {
    assert.deepEqual(errors, []);
    const metadata = JSON.parse(
      await fs.readFile(
        path.join(import.meta.dirname, "dist/build-metadata.json"),
        "utf8",
      ),
    );
    for (const name of ["Select", "Checkbox", "Radio", "Toggle", "TextField"])
      assert.ok(
        metadata.bundledComponents.some((f) =>
          f.endsWith(`/${name}/${name}.tsx`),
        ),
        name,
      );
    return { errors, components: metadata.bundledComponents };
  });
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
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
  ),
);
console.log(
  JSON.stringify({
    passed: results.filter((r) => r.status === "passed").length,
    failed: results.filter((r) => r.status === "failed").length,
    output,
  }),
);
if (results.some((r) => r.status === "failed")) process.exitCode = 1;
