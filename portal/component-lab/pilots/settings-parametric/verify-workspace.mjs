import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { createPilotServer } from "./server.mjs";
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
          const d = await page.evaluate(
            () => window.sedaPilot.getLab().derived,
          );
          for (const width of [1543, 1024, 390]) {
            await page.setViewportSize({ width, height: 1100 });
            for (const section of ["projects", "settings", "members"]) {
              await selectPage(section);
              const data = await page
                .locator("main[data-workspace]")
                .evaluate((root) =>
                  [
                    ...root.querySelectorAll(
                      ".seda-field__control,.seda-button,.seda-icon-button",
                    ),
                  ]
                    .filter((el) => el.getBoundingClientRect().height > 0)
                    .map((el) => {
                      const s = getComputedStyle(el),
                        b = el.getBoundingClientRect();
                      return {
                        id:
                          el.id ||
                          el.querySelector("input,select")?.id ||
                          el.textContent.trim(),
                        height: b.height,
                        width: b.width,
                        padding: parseFloat(s.paddingInlineStart),
                        radius: parseFloat(s.borderRadius),
                        font: parseFloat(s.fontSize),
                        line: parseFloat(s.lineHeight),
                        kind: el.classList.contains("seda-icon-button")
                          ? "icon"
                          : el.classList.contains("seda-button")
                            ? "button"
                            : "field",
                      };
                    }),
                );
              for (const v of data) {
                near(v.height, d.height, v.id + " height");
                near(v.radius, d.radius, v.id + " radius");
                near(v.font, d.font, v.id + " font");
                near(v.line, d.line, v.id + " line");
                if (v.kind === "field")
                  near(v.padding, d.fieldPaddingX, v.id + " field X");
                if (v.kind === "button")
                  near(v.padding, d.buttonPaddingX, v.id + " button X");
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
                      return {
                        kind: el.classList.contains("seda-toggle__control")
                          ? "toggle"
                          : "choice",
                        height: b.height,
                        width: b.width,
                        gap: parseFloat(
                          getComputedStyle(el.closest("label")).gap,
                        ),
                      };
                    }),
                );
              for (const choice of choiceData) {
                const mark = Math.max(d.preset.icon, d.font);
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
                near(choice.gap, 8 + params.airX, "choice gap from base + X");
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
    assert.deepEqual(evidence.coverage.libraryAdapter, [
      "Select",
      "Checkbox",
      "Radio",
      "Toggle",
    ]);
    const token = evidence.evidence.find(
      (e) => e.property === "--lab-select-surface-default",
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
    assert.equal(await page.locator("#tbody tr").count(), 2);
    await page.locator("#team-filter").selectOption("Core");
    assert.equal(await page.locator("#tbody tr").count(), 1);
    await page.locator("#reset-filters").click();
    await page.locator("#only-active").check();
    await page.locator("#select-all-projects").check();
    assert.equal(
      await page.locator('#tbody input[type="checkbox"]:checked').count(),
      2,
    );
    await page.locator("#bulk-pause").click();
    assert.match(
      await page.locator("#tbody").textContent(),
      /Проекты не найдены/,
    );
    await page.locator("#reset-filters").click();
    assert.equal(await page.locator("#tbody tr").count(), 4);
    await page.locator("#project-sort").selectOption("name-desc");
    const names = await page
      .locator("#tbody tr td:nth-child(2)")
      .allTextContents();
    assert.deepEqual(
      names.map((s) => s.trim()[0]),
      ["O", "N", "H", "A"],
    );
    await page.locator("#page-size").selectOption("3");
    assert.equal(await page.locator("#tbody tr").count(), 3);
    await page.locator("#next-page").click();
    assert.equal(await page.locator("#tbody tr").count(), 1);
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
    assert.equal(await page.locator("#tbody tr").count(), 5);
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
    await page.locator("#workspace-name").fill("Unsaved");
    await page
      .getByRole("button", { name: "Отменить изменения", exact: true })
      .click();
    assert.equal(
      await page.locator("#workspace-name").inputValue(),
      "Desktop application",
    );
    return {
      validation: "text/email/url/number",
      persistence: "navigation and profile changes",
      cancel: "last session snapshot",
    };
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
