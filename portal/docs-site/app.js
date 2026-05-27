let DOCS = [];
let flatDocs = [];
let currentMarkdown = "";
let savedMarkdown = "";
let isEditing = false;
let isPreviewing = false;
let activeDocId = "";
let healthReport = null;
let embeddedPreviewOpenSelect = null;
let embeddedPreviewActiveSelectIndex = {};
let embeddedPreviewState = {
  button: {
    variant: "primary",
    size: "m",
    state: "default",
    label: "Создать отчет",
    leadingIcon: false,
    trailingIcon: false,
    fullWidth: false,
  },
  "text-field": {
    size: "m",
    state: "default",
    label: "Название проекта",
    value: "",
    placeholder: "Введите название",
    helper: "До 80 символов",
    required: true,
    prefixIcon: false,
    clearButton: true,
  },
};

const nav = document.querySelector("#nav");
const article = document.querySelector("#document");
const breadcrumbs = document.querySelector("#breadcrumbs");
const searchInput = document.querySelector("#searchInput");
const menuButton = document.querySelector("#menuButton");
const sidebar = document.querySelector(".sidebar");
const editButton = document.querySelector("#editButton");
const saveButton = document.querySelector("#saveButton");
const cancelButton = document.querySelector("#cancelButton");
const previewButton = document.querySelector("#previewButton");
const editStatus = document.querySelector("#editStatus");
const themeButton = document.querySelector("#themeButton");
const themeIcon = document.querySelector("#themeIcon");
const sidebarResizeHandle = document.querySelector("#sidebarResizeHandle");

const sidebarWidth = Number(localStorage.getItem("seda-portal-sidebar-width") || localStorage.getItem("docs-sidebar-width"));
if (Number.isFinite(sidebarWidth)) {
  setSidebarWidth(sidebarWidth);
}

applyTheme(localStorage.getItem("seda-portal-theme") || localStorage.getItem("docs-theme") || "dark");

function flattenDocs() {
  flatDocs = DOCS.flatMap((section) =>
    section.items.map(([label, path]) => ({
      id: pathToId(path),
      label,
      path,
      section: section.title,
    })),
  );
}

function pathToId(path) {
  return path.replace(/^\.\.\//, "").replace(/\.md$/, "").replace(/[\\/]/g, "-");
}

function renderNav(filter = "") {
  const query = filter.trim().toLowerCase();
  const healthItem = !query || "health quality dashboard lint report status".includes(query)
    ? `
      <section class="nav-section">
        <h2 class="nav-section-title">System</h2>
        <a class="nav-link" href="#health" data-id="health">Docs Health</a>
      </section>
    `
    : "";
  const html = healthItem + DOCS.map((section) => {
    const items = section.items
      .map(([label, path]) => ({ label, path, id: pathToId(path) }))
      .filter((item) => {
        if (!query) return true;
        return `${section.title} ${item.label} ${item.path}`.toLowerCase().includes(query);
      });

    if (!items.length) return "";

    return `
      <section class="nav-section">
        <h2 class="nav-section-title">${escapeHtml(section.title)}</h2>
        ${items
          .map(
            (item) => `
              <a class="nav-link" href="#${item.id}" data-id="${item.id}">
                ${escapeHtml(item.label)}
              </a>
            `,
          )
          .join("")}
      </section>
    `;
  }).join("");

  nav.innerHTML = html || `<div class="nav-empty">Ничего не найдено</div>`;
  updateActiveLink(currentDoc()?.id);
}

function currentDoc() {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  return flatDocs.find((doc) => doc.id === id) || flatDocs[0];
}

function isHealthRoute() {
  return decodeURIComponent(location.hash.replace(/^#/, "")) === "health";
}

async function loadRoute() {
  if (isHealthRoute()) {
    await loadHealthDashboard();
    return;
  }

  await loadCurrentDoc();
}

async function loadCurrentDoc() {
  if (isHealthRoute()) return loadHealthDashboard();
  const doc = currentDoc();
  if (isEditing && doc.id !== activeDocId && !confirm("Есть несохраненные изменения. Открыть другой документ?")) {
    location.hash = activeDocId;
    return;
  }

  isEditing = false;
  isPreviewing = false;
  currentMarkdown = "";
  savedMarkdown = "";
  updateEditorControls();
  activeDocId = doc.id;
  updateActiveLink(doc.id);
  breadcrumbs.textContent = `${doc.section} / ${doc.label}`;
  article.innerHTML = `<div class="loading">Загружаю ${escapeHtml(doc.label)}...</div>`;

  try {
    const response = await fetch(doc.path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const markdown = await response.text();
    currentMarkdown = markdown;
    savedMarkdown = markdown;
    renderDocument();
    document.title = `${doc.label} - SEDA AI`;
    document.body.classList.remove("nav-open");
    scrollTo(0, 0);
  } catch (error) {
    article.innerHTML = `
      <div class="error">
        Не получилось загрузить <code>${escapeHtml(doc.path)}</code>.
        Открой сайт через локальный сервер, а не напрямую файлом.
      </div>
    `;
  }
}

async function loadHealthDashboard() {
  if (isEditing && !confirm("Есть несохраненные изменения. Открыть Docs Health?")) {
    location.hash = activeDocId;
    return;
  }

  isEditing = false;
  isPreviewing = false;
  currentMarkdown = "";
  savedMarkdown = "";
  activeDocId = "health";
  updateEditorControls();
  updateActiveLink("health");
  breadcrumbs.textContent = "System / Docs Health";
  article.classList.remove("editing");
  article.innerHTML = `<div class="loading">Loading documentation health...</div>`;

  try {
    const response = await fetch("/docs-site/health.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    healthReport = await response.json();
    article.innerHTML = renderHealthDashboard(healthReport);
    document.title = "Docs Health - SEDA AI";
    document.body.classList.remove("nav-open");
    scrollTo(0, 0);
  } catch (error) {
    article.innerHTML = `
      <div class="error">
        Could not load <code>docs-site/health.json</code>.
        Restart the local server with <code>node portal\\docs-site\\server.js</code>.
      </div>
    `;
  }
}

function renderHealthDashboard(report) {
  const items = report.items || [];
  const clean = items.filter((item) => item.issues.length === 0).length;
  const risky = items.filter((item) => item.issues.some((issue) => issue.severity === "error" || issue.severity === "warning"));
  const topIssues = risky.slice(0, 12);
  const figma = report.figma || { available: false };
  const actionPlan = report.actionPlan || { summary: {}, items: [], claudeTasks: "" };

  return `
    <section class="health-page">
      <header class="health-hero">
        <div>
          <p class="health-kicker">Documentation quality</p>
          <h1>Docs Health</h1>
          <p>Coverage, spec linting, metadata quality, and token/reference checks across Foundation and component specs.</p>
        </div>
        <div class="health-score" aria-label="Documentation health score">
          <strong>${escapeHtml(report.score)}</strong>
          <span>score</span>
        </div>
      </header>

      <div class="health-metrics">
        ${renderHealthMetric("Documents", report.totals.documents)}
        ${renderHealthMetric("Components", report.totals.components)}
        ${renderHealthMetric("Clean", clean)}
        ${renderHealthMetric("Token issues", report.tokens?.invalidReferences || 0)}
      </div>

      ${renderActionPlan(actionPlan)}

      ${figma.available ? renderFigmaCoverage(figma) : renderFigmaEmptyState()}

      <section class="health-section">
        <div class="health-section-header">
          <h2>Top Issues</h2>
          <span>${topIssues.length ? `${topIssues.length} documents need attention` : "No blocking issues"}</span>
        </div>
        ${topIssues.length ? topIssues.map(renderHealthIssueCard).join("") : `<div class="health-empty">No errors or warnings found. The documentation is in good shape.</div>`}
      </section>

      <section class="health-section">
        <div class="health-section-header">
          <h2>Coverage Matrix</h2>
          <span>${new Date(report.generatedAt).toLocaleString()}</span>
        </div>
        <div class="health-table-wrap">
          <table class="health-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Section</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Score</th>
                <th>Issues</th>
                <th>Tokens</th>
                <th>Figma</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(renderHealthRow).join("")}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

function renderActionPlan(actionPlan) {
  const summary = actionPlan.summary || {};
  const items = actionPlan.items || [];
  const claudeTasks = actionPlan.claudeTasks || "";

  return `
    <section class="health-section">
      <div class="health-section-header">
        <h2>Action Plan</h2>
        <span>${escapeHtml(summary.total || 0)} prioritized tasks</span>
      </div>
      <div class="health-metrics health-metrics-compact">
        ${renderHealthMetric("Fix Figma", summary.fixFigmaComponent || 0)}
        ${renderHealthMetric("Create in Figma", summary.createInFigma || 0)}
        ${renderHealthMetric("Add alias", summary.addAlias || 0)}
        ${renderHealthMetric("Write spec", summary.writeSpec || 0)}
        ${renderHealthMetric("Review docs", summary.reviewDocs || 0)}
      </div>
      <div class="health-action-grid">
        <article class="health-list-card">
          <h3>Next tasks</h3>
          ${items.length ? `<ol class="health-action-list">${items.slice(0, 14).map(renderActionItem).join("")}</ol>` : `<p>No tasks found.</p>`}
        </article>
        <article class="health-list-card">
          <h3>Claude AI brief</h3>
          ${claudeTasks ? `<pre class="health-claude-tasks">${escapeHtml(claudeTasks)}</pre>` : `<p>No Claude AI tasks generated.</p>`}
        </article>
      </div>
    </section>
  `;
}

function renderActionItem(item) {
  return `
    <li data-action-type="${escapeHtml(item.type)}">
      <strong>${escapeHtml(item.title)}</strong>
      <small>${escapeHtml(actionTypeLabel(item.type))}${item.path ? ` · ${escapeHtml(item.path.replace(/^\.\.\//, ""))}` : ""}</small>
      <span>${escapeHtml(item.detail || "")}</span>
      ${item.candidates?.length ? `<div class="health-candidates">Maybe: ${item.candidates.map((candidate) => `<span>${escapeHtml(candidate.name)}</span>`).join("")}</div>` : ""}
      ${item.quality ? renderFigmaQualityFacts(item.quality) : ""}
    </li>
  `;
}

function actionTypeLabel(type) {
  return {
    "fix-figma-component": "Fix Figma",
    "add-alias": "Add alias",
    "create-in-figma": "Create in Figma",
    "write-spec": "Write spec",
    "review-docs": "Review docs",
  }[type] || type;
}

function renderFigmaCoverage(figma) {
  const componentTotal = Number(figma.totals?.componentSets || 0) + Number(figma.totals?.standaloneComponents || 0);
  const missingInFigma = figma.missingInFigma || [];
  const missingSpecs = figma.missingSpecs || [];
  const needsNaming = figma.needsNaming || [];
  const qualityIssues = figma.qualityIssues || [];
  const qualityUnknown = figma.qualityUnknown || [];
  const baseline = figma.baseline || null;
  const generated = figma.generatedAt ? new Date(figma.generatedAt).toLocaleString() : "manual snapshot";

  return `
    <section class="health-section">
      <div class="health-section-header">
        <h2>Figma Coverage</h2>
        <span>${escapeHtml(figma.fileName || "Figma inventory")} · ${escapeHtml(generated)}</span>
      </div>
      <div class="health-metrics health-metrics-compact">
        ${renderHealthMetric("Figma components", componentTotal)}
        ${renderHealthMetric("Matched specs", figma.matchedSpecs || 0)}
        ${renderHealthMetric("Ready specs", figma.readySpecs || 0)}
        ${renderHealthMetric("Quality issues", qualityIssues.length)}
        ${renderHealthMetric("Need rescan", qualityUnknown.length)}
        ${renderHealthMetric("Alias matches", figma.aliasMatches || 0)}
        ${renderHealthMetric("Missing in Figma", missingInFigma.length)}
        ${figma.semanticTotal > 0 ? renderHealthMetric("Semantic (raw)", figma.semanticTotal) : ""}
        ${figma.semanticTotal > 0 ? renderHealthMetric("Semantic (actionable)", figma.actionableSemanticTotal ?? figma.semanticTotal) : ""}
        ${figma.exceptionTotal > 0 ? renderHealthMetric("Accepted exceptions", figma.exceptionTotal) : ""}
      </div>
      ${baseline ? renderFigmaBaseline(baseline) : ""}
      <div class="health-split">
        ${renderHealthList("Matched but not ready", qualityIssues, renderFigmaQualityGap)}
        ${renderHealthList("Need quality rescan", qualityUnknown, renderFigmaQualityGap)}
        ${renderHealthList("Specs without Figma component", missingInFigma, renderFigmaSpecGap)}
        ${renderHealthList("Needs naming / alias", needsNaming, renderFigmaSpecGap)}
        ${renderHealthList("Figma components without spec", missingSpecs.slice(0, 24), (item) => `${escapeHtml(item.name)}<small>${escapeHtml(item.page || item.type || "")}${item.variants ? ` · ${escapeHtml(item.variants)} variants` : ""}</small>`)}
      </div>
    </section>
  `;
}

function renderFigmaBaseline(baseline) {
  const failed = (baseline.checks || []).filter((check) => !check.pass);
  const checks = (baseline.checks || [])
    .map((check) => `
      <span class="health-pill" data-severity="${check.pass ? "ok" : "error"}" title="Expected ${escapeHtml(check.expected)}">
        ${escapeHtml(check.label)}: ${escapeHtml(check.actual)}
      </span>
    `)
    .join("");

  return `
    <article class="health-list-card">
      <h3>Figma Baseline ${baseline.pass ? "passed" : "failed"}</h3>
      <p>${baseline.pass
        ? "The current scan matches the clean component baseline."
        : `${failed.length} baseline check${failed.length === 1 ? "" : "s"} failed. Restore the scan before shipping Figma changes.`}
      </p>
      <div class="health-candidates">${checks}</div>
    </article>
  `;
}

function renderFigmaSpecGap(item) {
  const candidates = item.candidates || [];
  return `
    <a href="#${escapeHtml(pathToId(item.path))}">${escapeHtml(item.title)}</a>
    <small>${escapeHtml(item.path.replace(/^\.\.\//, ""))}</small>
    ${candidates.length ? `<div class="health-candidates">Maybe: ${candidates.map((candidate) => `<span>${escapeHtml(candidate.name)}</span>`).join("")}</div>` : ""}
  `;
}

function renderFigmaQualityGap(item) {
  const link = item.path ? `<a href="#${escapeHtml(pathToId(item.path))}">${escapeHtml(item.title)}</a>` : `<strong>${escapeHtml(item.title)}</strong>`;
  return `
    ${link}
    <small>${escapeHtml(item.component || "")} · ${escapeHtml(item.status || "needs audit")}</small>
    ${item.quality ? renderFigmaQualityFacts(item.quality) : ""}
    ${item.auditWarnings?.length ? `<div class="health-candidates">${item.auditWarnings.map((warning) => `<span>${escapeHtml(warning)}</span>`).join("")}</div>` : ""}
  `;
}

function renderFigmaQualityFacts(quality) {
  return `
    <div class="health-candidates">
      <span>bindings ${escapeHtml(quality.bindingCount ?? "-")}</span>
      <span>unstyled ${escapeHtml(quality.textWithoutStyle ?? "-")}</span>
      <span>raw fills ${escapeHtml(quality.rawFillNodes ?? "-")}</span>
      <span>raw strokes ${escapeHtml(quality.rawStrokeNodes ?? "-")}</span>
      <span>raw effects ${escapeHtml(quality.rawEffectNodes ?? "-")}</span>
      <span>legacy ${escapeHtml(quality.legacyBindingCount ?? 0)}</span>
      <span>semantic ${escapeHtml(quality.directSemanticBindingCount ?? 0)}</span>
      ${quality.directSemanticBindingCount > 0 && quality.actionableSemanticCount != null && quality.actionableSemanticCount < quality.directSemanticBindingCount ? `<span title="Bindings covered by accepted exceptions">${escapeHtml(quality.directSemanticBindingCount - quality.actionableSemanticCount)} accepted</span>` : ""}
      <span>raw text ${escapeHtml(quality.rawTextFillNodes ?? "-")}</span>
    </div>
  `;
}

function renderFigmaEmptyState() {
  return `
    <section class="health-section">
      <div class="health-section-header">
        <h2>Figma Coverage</h2>
        <span>No inventory connected</span>
      </div>
      <div class="health-empty">
        Scan components in the Figma plugin Settings, copy the JSON, and save it as <code>portal/docs-site/figma-components.json</code>.
      </div>
    </section>
  `;
}

function renderHealthList(title, items, renderItem) {
  return `
    <article class="health-list-card">
      <h3>${escapeHtml(title)}</h3>
      ${items.length
        ? `<ul>${items.map((item) => `<li>${renderItem(item)}</li>`).join("")}</ul>`
        : `<p>No gaps found.</p>`}
    </article>
  `;
}

function renderHealthMetric(label, value) {
  return `
    <div class="health-metric">
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function renderHealthIssueCard(item) {
  const docId = pathToId(item.path);
  const issueText = item.issues.slice(0, 4).map((issue) => `
    <li data-severity="${escapeHtml(issue.severity)}">${escapeHtml(issue.message)}</li>
  `).join("");

  return `
    <article class="health-issue-card">
      <div>
        <h3><a href="#${escapeHtml(docId)}">${escapeHtml(item.title)}</a></h3>
        <p>${escapeHtml(item.path.replace(/^\.\.\//, ""))}</p>
      </div>
      <ul>${issueText}</ul>
    </article>
  `;
}

function renderHealthRow(item) {
  const docId = pathToId(item.path);
  const issueCount = item.issues.length;
  const severity = item.issues.some((issue) => issue.severity === "error")
    ? "error"
    : item.issues.some((issue) => issue.severity === "warning")
      ? "warning"
      : issueCount
        ? "note"
        : "ok";

  return `
    <tr>
      <td><a href="#${escapeHtml(docId)}">${escapeHtml(item.title)}</a><small>${escapeHtml(item.path.replace(/^\.\.\//, ""))}</small></td>
      <td>${escapeHtml(item.section)}</td>
      <td>${escapeHtml(item.status || item.kind)}</td>
      <td>${escapeHtml(item.owner || "-")}</td>
      <td><span class="health-pill" data-severity="${item.checks.score >= 90 ? "ok" : item.checks.score >= 70 ? "warning" : "error"}">${escapeHtml(item.checks.score)}%</span></td>
      <td><span class="health-pill" data-severity="${severity}">${escapeHtml(issueCount)}</span></td>
      <td>${renderTokenStatus(item)}</td>
      <td>${renderFigmaStatus(item)}</td>
    </tr>
  `;
}

function renderTokenStatus(item) {
  const invalid = item.invalidTokenRefs || [];
  if (!item.tokenRefCount) return `<span class="health-pill">0</span>`;
  if (!invalid.length) return `<span class="health-pill" data-severity="ok">${escapeHtml(item.tokenRefCount)}</span>`;
  return `<span class="health-pill" data-severity="warning">${escapeHtml(invalid.length)} / ${escapeHtml(item.tokenRefCount)}</span>`;
}

function renderFigmaStatus(item) {
  if (item.kind !== "component") return `<span class="health-pill">-</span>`;
  if (item.figmaStatus === "matched") {
    const label = item.figmaMatch === "alias" ? `Alias: ${item.figmaComponent}` : item.figmaComponent || "Matched";
    const qualityStatus = item.figmaQualityStatus || "unknown";
    if (qualityStatus === "accepted-exceptions") {
      return `<span class="health-pill" data-severity="ok" title="All semantic bindings are accepted exceptions">${escapeHtml(label)} ·  exc.</span>`;
    }
    if (qualityStatus !== "ready" && qualityStatus !== "unknown") {
      return `<span class="health-pill" data-severity="warning">${escapeHtml(`${qualityStatus}: ${label}`)}</span>`;
    }
    return `<span class="health-pill" data-severity="ok">${escapeHtml(label)}</span>`;
  }
  if (item.figmaStatus === "missing") return `<span class="health-pill" data-severity="warning">Missing</span>`;
  return `<span class="health-pill">Not scanned</span>`;
}

function updateActiveLink(id) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.id === id);
  });
}

function renderDocument() {
  article.classList.remove("editing");
  const preview = renderEmbeddedComponentPreview(currentDoc());
  const markdown = renderMarkdown(currentMarkdown);
  article.innerHTML = preview ? insertPreviewAfterHeader(markdown, preview) : markdown;
}

function insertPreviewAfterHeader(markdownHtml, previewHtml) {
  const blockquoteIndex = markdownHtml.indexOf("</blockquote>");
  if (blockquoteIndex !== -1) {
    const insertAt = blockquoteIndex + "</blockquote>".length;
    return `${markdownHtml.slice(0, insertAt)}${previewHtml}${markdownHtml.slice(insertAt)}`;
  }

  const headingIndex = markdownHtml.indexOf("</h1>");
  if (headingIndex !== -1) {
    const insertAt = headingIndex + "</h1>".length;
    return `${markdownHtml.slice(0, insertAt)}${previewHtml}${markdownHtml.slice(insertAt)}`;
  }

  return `${previewHtml}${markdownHtml}`;
}

function renderEmbeddedComponentPreview(doc) {
  const component = embeddedComponentForDoc(doc);
  if (component === "button") {
    return renderEmbeddedButtonPreview();
  }
  if (component === "text-field") {
    return renderEmbeddedTextFieldPreview();
  }

  return "";
}

function embeddedComponentForDoc(doc) {
  const path = String(doc?.path || "").replace(/\\/g, "/");
  if (path.endsWith("specs/actions/button.md")) return "button";
  if (path.endsWith("specs/inputs/text-field.md")) return "text-field";
  return "";
}

function renderEmbeddedButtonPreview() {
  const state = embeddedPreviewState.button;
  const disabled = state.state === "disabled";
  const loading = state.state === "loading";
  const label = state.state === "loading" ? "Загрузка..." : state.label;
  const leading = state.leadingIcon ? `<span class="seda-icon seda-icon-add" aria-hidden="true"></span>` : "";
  const trailing = state.trailingIcon ? `<span class="seda-icon seda-icon-arrow-right" aria-hidden="true"></span>` : "";
  const style = embeddedButtonStyleFor(state.variant, state.size, state.state, state.fullWidth);

  return `
    <section class="component-preview" data-component-preview="button" aria-label="Предпросмотр Button">
      <div class="component-preview-header">
        <div class="component-preview-stage">
          <div class="component-preview-source">
            <span class="source-badge is-figma">Figma</span>
            ${(state.leadingIcon || state.trailingIcon || state.fullWidth) ? `<span class="source-badge is-custom">Нет в Figma</span>` : ""}
          </div>
          <button class="seda-button" type="button" data-preview-state="${escapeHtml(state.state)}" style="${style}" ${disabled ? "disabled" : ""} ${loading ? `aria-disabled="true"` : ""}>
            ${leading}<span class="seda-button-label">${escapeHtml(label)}</span>${trailing}
          </button>
        </div>
        <aside class="component-preview-controls" aria-label="Параметры Button">
          <div class="component-preview-controls-header">
            <h2>Props</h2>
            <a href="../component-lab/#button">Открыть в Lab</a>
          </div>
          ${renderEmbeddedSelect("Вариант", "variant", ["primary", "secondary", "outline", "ghost", "text", "destruction"], state.variant)}
          ${renderEmbeddedSelect("Размер", "size", ["s", "m", "l", "xl"], state.size)}
          ${renderEmbeddedSelect("Состояние", "state", ["default", "hover", "active", "loading", "focus", "disabled"], state.state)}
          <label class="component-preview-control">
            <span>Текст</span>
            <input type="text" value="${escapeHtml(state.label)}" data-component-preview-prop="label">
          </label>
          ${renderEmbeddedToggle("Иконка слева", "leadingIcon", state.leadingIcon)}
          ${renderEmbeddedToggle("Иконка справа", "trailingIcon", state.trailingIcon)}
          ${renderEmbeddedToggle("На всю ширину", "fullWidth", state.fullWidth)}
        </aside>
      </div>
    </section>
  `;
}

function renderEmbeddedTextFieldPreview() {
  const state = embeddedPreviewState["text-field"];
  const disabled = state.state === "disabled";
  const readOnly = state.state === "read-only";
  const loading = state.state === "loading";
  const required = state.required ? " *" : "";
  const prefix = state.prefixIcon ? `<span class="field-affix seda-icon seda-icon-search" aria-hidden="true"></span>` : "";
  const clear = state.clearButton && state.value
    ? `<button class="field-clear" type="button" data-component-preview-prop="value" value="" aria-label="Очистить"><span class="seda-icon seda-icon-close" aria-hidden="true"></span></button>`
    : "";
  const suffix = loading ? `<span class="field-affix" aria-hidden="true">...</span>` : clear;
  const style = embeddedFieldStyleFor("text-field", state.size, state.state);

  return `
    <section class="component-preview" data-component-preview="text-field" aria-label="Предпросмотр Text Field">
      <div class="component-preview-header">
        <div class="component-preview-stage">
          <div class="component-preview-source">
            <span class="source-badge is-figma">Figma</span>
            ${(state.prefixIcon || state.clearButton) ? `<span class="source-badge is-custom">Нет в Figma</span>` : ""}
          </div>
          <div class="seda-field-preview" style="${style}" data-preview-state="${escapeHtml(state.state)}">
            <label class="field-label">${escapeHtml(state.label)}${required}</label>
            <div class="field-shell">
              ${prefix}
              <input class="seda-field" data-component-preview-prop="value" value="${escapeHtml(state.value)}" placeholder="${escapeHtml(state.placeholder)}" ${disabled ? "disabled" : ""} ${readOnly ? "readonly" : ""}>
              ${suffix}
            </div>
            <div class="field-helper">${escapeHtml(state.helper)}</div>
          </div>
        </div>
        <aside class="component-preview-controls" aria-label="Параметры Text Field">
          <div class="component-preview-controls-header">
            <h2>Props</h2>
            <a href="../component-lab/#text-field">Открыть в Lab</a>
          </div>
          ${renderEmbeddedSelect("Размер", "size", ["s", "m", "l", "xl"], state.size)}
          ${renderEmbeddedSelect("Состояние", "state", ["default", "hover", "active", "focus", "error", "warning", "success", "disabled", "read-only", "loading"], state.state)}
          <label class="component-preview-control">
            <span>Метка</span>
            <input type="text" value="${escapeHtml(state.label)}" data-component-preview-prop="label">
          </label>
          <label class="component-preview-control">
            <span>Значение</span>
            <input type="text" value="${escapeHtml(state.value)}" data-component-preview-prop="value">
          </label>
          <label class="component-preview-control">
            <span>Плейсхолдер</span>
            <input type="text" value="${escapeHtml(state.placeholder)}" data-component-preview-prop="placeholder">
          </label>
          <label class="component-preview-control">
            <span>Подсказка</span>
            <input type="text" value="${escapeHtml(state.helper)}" data-component-preview-prop="helper">
          </label>
          ${renderEmbeddedToggle("Обязательное", "required", state.required)}
          ${renderEmbeddedToggle("Иконка слева", "prefixIcon", state.prefixIcon)}
          ${renderEmbeddedToggle("Кнопка очистки", "clearButton", state.clearButton)}
        </aside>
      </div>
    </section>
  `;
}

function renderEmbeddedSelect(label, prop, options, value) {
  const isOpen = embeddedPreviewOpenSelect === prop;
  const selectedIndex = Math.max(0, options.indexOf(value));
  const activeIndex = isOpen ? clampIndex(embeddedPreviewActiveSelectIndex[prop] ?? selectedIndex, options.length) : selectedIndex;
  const listboxId = `embedded-button-${prop}-listbox`;
  const activeOptionId = `${listboxId}-option-${activeIndex}`;

  return `
    <div class="component-preview-control component-preview-select">
      <span>${escapeHtml(label)}</span>
      <button
        class="component-preview-select-trigger ${isOpen ? "is-open" : ""}"
        type="button"
        data-component-preview-select="${escapeHtml(prop)}"
        aria-haspopup="listbox"
        aria-expanded="${isOpen}"
        aria-controls="${listboxId}"
        ${isOpen ? `aria-activedescendant="${activeOptionId}"` : ""}
      >
        <span>${escapeHtml(value)}</span>
        <span class="component-preview-select-chevron seda-icon seda-icon-arrow-chevron-down" aria-hidden="true"></span>
      </button>
      ${
        isOpen
          ? `<div class="component-preview-select-menu" id="${listboxId}" role="listbox" aria-label="${escapeHtml(label)}">
              ${options.map((option, index) => `
                <button
                  class="component-preview-select-option ${option === value ? "is-selected" : ""} ${index === activeIndex ? "is-active" : ""}"
                  id="${listboxId}-option-${index}"
                  type="button"
                  role="option"
                  aria-selected="${option === value}"
                  data-component-preview-select-option="${escapeHtml(prop)}"
                  data-value="${escapeHtml(option)}"
                >
                  <span>${escapeHtml(option)}</span>
                  ${option === value ? `<span class="component-preview-select-check" aria-hidden="true"></span>` : ""}
                </button>
              `).join("")}
            </div>`
          : ""
      }
    </div>
  `;
}

function embeddedSelectOptions(prop, component = "button") {
  const options = {
    button: {
      variant: ["primary", "secondary", "outline", "ghost", "text", "destruction"],
      size: ["s", "m", "l", "xl"],
      state: ["default", "hover", "active", "loading", "focus", "disabled"],
    },
    "text-field": {
      size: ["s", "m", "l", "xl"],
      state: ["default", "hover", "active", "focus", "error", "warning", "success", "disabled", "read-only", "loading"],
    },
  };
  return options[component]?.[prop] || options.button[prop] || [];
}

function clampIndex(index, length) {
  if (!length) return 0;
  return Math.max(0, Math.min(length - 1, Number(index) || 0));
}

function renderEmbeddedToggle(label, prop, value) {
  const css = embeddedToggleStyle(value);
  return `
    <label class="component-preview-switch" style="${css}">
      <span>${escapeHtml(label)}</span>
      <input type="checkbox" data-component-preview-prop="${escapeHtml(prop)}" ${value ? "checked" : ""}>
      <span class="seda-toggle-demo ${value ? "is-on" : ""}" aria-hidden="true"><span></span></span>
    </label>
  `;
}

function embeddedToggleStyle(checked) {
  const toggle = getComponentTokens().toggle || {};
  return styleVars({
    "--toggle-track": tokenValue(toggle.track?.[checked ? "checked" : "default"]) || (checked ? "var(--brand)" : "var(--seda-container-default)"),
    "--toggle-thumb": tokenValue(toggle.thumb?.default) || "var(--surface)",
    "--toggle-width": "36px",
    "--toggle-height": "22px",
    "--toggle-thumb-size": "18px",
    "--toggle-padding": "2px",
  });
}

function embeddedFieldStyleFor(component, size, state) {
  const branch = getComponentTokens()[component] || {};
  const surfaceState = tokenStateFor(branch.surface, state);
  const borderState = tokenStateFor(branch.border, state);
  const foregroundState = tokenStateFor(branch.foreground, state);
  const labelState = tokenStateFor(branch.label, state);
  const helperState = tokenStateFor(branch.helper, state);
  const type = controlTypeVars(size);
  const box = controlBoxVars("field", size);

  return styleVars({
    "--field-surface": tokenValue(branch.surface?.[surfaceState]) || tokenValue(branch.surface?.default) || "var(--surface)",
    "--field-border": tokenValue(branch.border?.[borderState]) || tokenValue(branch.border?.default) || "var(--border)",
    "--field-border-hover": tokenValue(branch.border?.hover) || tokenValue(branch.border?.default) || "var(--border)",
    "--field-border-active": tokenValue(branch.border?.active) || tokenValue(branch.border?.pressed) || tokenValue(branch.border?.hover) || "var(--brand)",
    "--field-focus-ring": tokenValue(branch.focus?.ring) || "var(--focus-ring)",
    "--field-foreground": tokenValue(branch.foreground?.[foregroundState]) || tokenValue(branch.foreground?.default) || "var(--text)",
    "--field-label": tokenValue(branch.label?.[labelState]) || tokenValue(branch.label?.default) || "var(--text-soft)",
    "--field-helper": tokenValue(branch.helper?.[helperState]) || tokenValue(branch.helper?.default) || "var(--text-muted)",
    "--field-icon": tokenValue(branch.icon?.[tokenStateFor(branch.icon, state)]) || tokenValue(branch.icon?.default) || "var(--text-muted)",
    "--field-height": box.height,
    "--field-padding-x": box.paddingX,
    "--field-padding-y": box.paddingY,
    "--field-gap": box.gap,
    "--field-radius": box.radius,
    "--field-border-width": box.borderWidth,
    "--field-font-size": type.size,
    "--field-line-height": type.lineHeight,
    "--field-font-weight": type.weight,
    "--field-letter-spacing": type.letterSpacing,
  });
}

function embeddedButtonStyleFor(variant, size, state, fullWidth) {
  const map = {
    primary: ["primary", "solid"],
    secondary: ["neutral", "secondary"],
    outline: ["neutral", "outline"],
    ghost: ["neutral", "ghost"],
    text: ["neutral", "text"],
    destruction: ["danger", "solid"],
  };
  const [tokenVariant, tokenStyle] = map[variant] || map.primary;
  const buttonTokens = getComponentTokens().button || {};
  const branch = getPath(buttonTokens, [tokenVariant, tokenStyle]) || {};
  const surfaceState = tokenStateFor(branch.surface, state);
  const foregroundState = tokenStateFor(branch.foreground, state);
  const borderState = tokenStateFor(branch.border, state);
  const type = controlTypeVars(size);
  const box = controlBoxVars("button", size);
  const fallback = embeddedButtonFallback(variant);

  return styleVars({
    "--button-surface": tokenValue(branch.surface?.[surfaceState]) || tokenValue(branch.surface?.default) || fallback.surface,
    "--button-surface-hover": tokenValue(branch.surface?.hover) || tokenValue(branch.surface?.default) || fallback.hover,
    "--button-surface-active": tokenValue(branch.surface?.active) || tokenValue(branch.surface?.pressed) || tokenValue(branch.surface?.hover) || tokenValue(branch.surface?.default) || fallback.hover,
    "--button-foreground": tokenValue(branch.foreground?.[foregroundState]) || tokenValue(branch.foreground?.default) || fallback.foreground,
    "--button-border": tokenValue(branch.border?.[borderState]) || tokenValue(branch.border?.default) || tokenValue(branch.surface?.default) || fallback.border,
    "--button-focus-ring": tokenValue(branch.focus?.ring) || "var(--focus-ring)",
    "--button-width": fullWidth ? "100%" : "auto",
    "--button-height": box.height,
    "--button-padding-x": box.paddingX,
    "--button-padding-y": box.paddingY,
    "--button-gap": box.gap,
    "--button-radius": box.radius,
    "--button-border-width": box.borderWidth,
    "--button-icon-size": box.iconSize,
    "--button-font-size": type.size,
    "--button-line-height": type.lineHeight,
    "--button-font-weight": type.weight,
    "--button-letter-spacing": type.letterSpacing,
  });
}

function embeddedButtonFallback(variant) {
  const fallbacks = {
    primary: {
      surface: "var(--container-brand-default, var(--seda-container-brand-default, var(--brand)))",
      hover: "var(--container-brand-hover, var(--seda-container-brand-hover, var(--brand-hover)))",
      foreground: "var(--text-on-brand-primary, var(--seda-text-on-brand-primary, #ffffff))",
      border: "var(--border-brand-default, var(--container-brand-default, var(--brand)))",
    },
    secondary: {
      surface: "var(--container-neutral-default, var(--seda-container-default, transparent))",
      hover: "var(--container-neutral-hover, var(--seda-container-hover, var(--surface-soft)))",
      foreground: "var(--text-primary, var(--seda-text-primary, currentColor))",
      border: "var(--border-default, var(--seda-border-default, currentColor))",
    },
    outline: {
      surface: "transparent",
      hover: "var(--container-neutral-hover, var(--seda-container-hover, var(--surface-soft)))",
      foreground: "var(--text-primary, var(--seda-text-primary, currentColor))",
      border: "var(--border-default, var(--seda-border-default, currentColor))",
    },
    ghost: {
      surface: "transparent",
      hover: "var(--container-neutral-hover, var(--seda-container-hover, var(--surface-soft)))",
      foreground: "var(--text-primary, var(--seda-text-primary, currentColor))",
      border: "transparent",
    },
    text: {
      surface: "transparent",
      hover: "var(--container-neutral-hover, var(--seda-container-hover, var(--surface-soft)))",
      foreground: "var(--text-secondary, var(--seda-text-secondary, currentColor))",
      border: "transparent",
    },
    destruction: {
      surface: "var(--status-danger-container-default, var(--seda-status-error-text, #c73123))",
      hover: "var(--status-danger-container-hover, var(--seda-status-error-text, #c73123))",
      foreground: "var(--text-on-brand-primary, var(--seda-text-on-brand-primary, #ffffff))",
      border: "var(--status-danger-container-default, var(--seda-status-error-text, #c73123))",
    },
  };

  return fallbacks[variant] || fallbacks.primary;
}

function getComponentTokens() {
  return window.SEDA_TOKENS?.$collections?.components?.$modes?.["Mode 1"] || {};
}

function getFoundationTokens() {
  return window.SEDA_TOKENS?.$collections?.foundation?.$modes?.["Mode 1"] || {};
}

function getSemanticTokens() {
  const mode = document.documentElement.dataset.theme === "light" ? "Light" : "Dark";
  return window.SEDA_TOKENS?.$collections?.semantic?.$modes?.[mode] || {};
}

function tokenStateFor(group, state) {
  if (group?.[state]) return state;
  if (state === "active" && group?.pressed) return "pressed";
  return state;
}

function controlTypeVars(size) {
  const map = {
    s: ["bodySmall", "base"],
    m: ["body", "base"],
    l: ["bodyLarge", "base"],
    xl: ["bodyExtraLarge", "base"],
  };
  const [role, emphasis] = map[size] || map.m;
  const token = getFoundationTokens().font?.[role]?.[emphasis];

  return {
    size: `${token?.size?.$value ?? { s: 12, m: 14, l: 16, xl: 18 }[size] ?? 14}px`,
    lineHeight: `${token?.lineHeight?.$value ?? { s: 16, m: 20, l: 24, xl: 28 }[size] ?? 20}px`,
    letterSpacing: `${token?.letterSpacing?.$value ?? 0}px`,
    weight: fontWeightValue(token?.weight?.$value ?? "Regular"),
  };
}

function controlBoxVars(kind, size) {
  const maps = {
    button: {
      s: { height: 24, paddingX: "s", paddingY: "xs", gap: "2xs", radius: "s", iconSize: 14 },
      m: { height: 32, paddingX: "m", paddingY: "s", gap: "xs", radius: "m", iconSize: 16 },
      l: { height: 40, paddingX: "xl", paddingY: "m", gap: "s", radius: "l", iconSize: 18 },
      xl: { height: 48, paddingX: "2xl", paddingY: "l", gap: "m", radius: "xl", iconSize: 20 },
    },
    field: {
      s: { height: 24, paddingX: "s", paddingY: "xs", gap: "xs", radius: "s" },
      m: { height: 32, paddingX: "m", paddingY: "s", gap: "xs", radius: "m" },
      l: { height: 40, paddingX: "xl", paddingY: "m", gap: "s", radius: "l" },
      xl: { height: 48, paddingX: "2xl", paddingY: "l", gap: "m", radius: "xl" },
    },
  };
  const config = maps[kind]?.[size] || maps.button.m;

  return {
    height: `${config.height}px`,
    paddingX: `${spaceValue(config.paddingX)}px`,
    paddingY: `${spaceValue(config.paddingY)}px`,
    gap: `${spaceValue(config.gap)}px`,
    radius: `${radiusValue(config.radius)}px`,
    borderWidth: `${borderWidthValue(config.borderWidth || "m")}px`,
    iconSize: `${config.iconSize || 16}px`,
  };
}

function spaceValue(name) {
  const fallback = { none: 0, "2xs": 2, xs: 4, s: 6, m: 8, l: 10, xl: 12, "2xl": 16, "3xl": 20 };
  return getFoundationTokens().space?.[name]?.$value ?? fallback[name] ?? 0;
}

function radiusValue(name) {
  const fallback = { none: 0, "2xs": 2, xs: 4, s: 6, m: 8, l: 10, xl: 12, "2xl": 16, circle: 999 };
  return getFoundationTokens().border?.radius?.[name]?.$value ?? fallback[name] ?? 0;
}

function borderWidthValue(name) {
  const fallback = { s: 0.5, m: 1, l: 2 };
  return getFoundationTokens().border?.width?.[name]?.$value ?? fallback[name] ?? 1;
}

function fontWeightValue(weight) {
  const normalized = String(weight).toLowerCase();
  if (normalized.includes("light")) return "300";
  if (normalized.includes("medium")) return "500";
  if (normalized.includes("semi")) return "600";
  if (normalized.includes("bold")) return "700";
  return "400";
}

function tokenValue(node) {
  if (!node?.$value) return "";
  return resolveToken(node.$value);
}

function resolveToken(value, depth = 0) {
  if (!value || depth > 12) return "";
  if (value === "{color.transparent}") return "transparent";
  if (!/^\{.+\}$/.test(value)) return String(value);

  const path = value.slice(1, -1).split(".");
  const roots = [getSemanticTokens(), getFoundationTokens()];

  for (const root of roots) {
    const found = getPath(root, path);
    if (found?.$value) return resolveToken(found.$value, depth + 1);
  }

  return "";
}

function getPath(root, path) {
  return path.reduce((node, key) => node?.[key], root);
}

function styleVars(vars) {
  return Object.entries(vars).map(([key, value]) => `${key}:${value};`).join("");
}

function renderEditor() {
  article.classList.add("editing");
  article.innerHTML = `
    ${renderMarkdownToolbar()}
    <textarea id="markdownEditor" class="markdown-editor" spellcheck="false">${escapeHtml(currentMarkdown)}</textarea>
    ${renderMarkdownHelp()}
  `;
  article.querySelector("#markdownEditor").focus();
}

function renderMarkdownToolbar() {
  const tools = [
    ["bold", "B", "Жирный"],
    ["italic", "I", "Курсив"],
    ["code", "`", "Код"],
    ["h2", "H2", "Заголовок 2"],
    ["h3", "H3", "Заголовок 3"],
    ["ul", "•", "Список"],
    ["ol", "1.", "Нумерация"],
    ["quote", ">", "Цитата"],
    ["link", "[]", "Ссылка"],
    ["codeblock", "{ }", "Блок кода"],
    ["table", "▦", "Таблица"],
    ["rule", "—", "Разделитель"],
  ];

  return `
    <div class="markdown-toolbar" aria-label="Markdown форматирование">
      ${tools
        .map(
          ([action, label, title]) => `
            <button class="markdown-tool" type="button" data-markdown-action="${action}" title="${title}" aria-label="${title}">
              ${escapeHtml(label)}
            </button>
          `,
        )
        .join("")}
      <button class="markdown-help-button" type="button" data-markdown-help aria-expanded="false">Markdown подсказки</button>
    </div>
  `;
}

function renderMarkdownHelp() {
  return `
    <div id="markdownHelpDrawer" class="markdown-help-drawer" hidden>
      <button class="markdown-help-backdrop" type="button" data-markdown-help-close aria-label="Закрыть подсказки"></button>
      <aside class="markdown-help-panel" aria-label="Markdown подсказки">
        <div class="markdown-help-header">
          <h2>Markdown подсказки</h2>
          <button class="markdown-help-close" type="button" data-markdown-help-close aria-label="Закрыть">×</button>
        </div>
        <div class="markdown-help-content">
          <section>
            <h3>Заголовки</h3>
            <div class="markdown-help-grid">
              <div><code># Заголовок 1</code><span>Главный заголовок страницы</span></div>
              <div><code>## Заголовок 2</code><span>Крупный раздел</span></div>
              <div><code>### Заголовок 3</code><span>Подраздел</span></div>
              <div><code>#### Заголовок 4</code><span>Небольшой блок</span></div>
            </div>
          </section>
          <section>
            <h3>Текст</h3>
            <div class="markdown-help-grid">
              <div><code>**жирный**</code><span>Важный фрагмент</span></div>
              <div><code>*курсив*</code><span>Акцент внутри строки</span></div>
              <div><code>~~зачеркнуто~~</code><span>Удаленный или устаревший текст</span></div>
              <div><code>\`Button\`</code><span>Код, токен, имя компонента</span></div>
              <div><code>Текст<br><br>Новый абзац</code><span>Пустая строка создает новый абзац</span></div>
              <div><code>Первая строка  <br>Вторая строка</code><span>Два пробела в конце строки делают перенос</span></div>
            </div>
          </section>
          <section>
            <h3>Списки</h3>
            <div class="markdown-help-grid">
              <div><code>- пункт<br>- пункт</code><span>Маркированный список</span></div>
              <div><code>1. пункт<br>2. пункт</code><span>Нумерованный список</span></div>
              <div><code>- [ ] задача<br>- [x] готово</code><span>Чеклист в Markdown-редакторах</span></div>
              <div><code>&nbsp;&nbsp;- вложенный</code><span>Отступ создает вложенный пункт</span></div>
            </div>
          </section>
          <section>
            <h3>Ссылки и медиа</h3>
            <div class="markdown-help-grid">
              <div><code>[текст](https://example.com)</code><span>Ссылка</span></div>
              <div><code>[текст](../foundation/tokens.md)</code><span>Ссылка на локальный документ</span></div>
              <div><code>![описание](image.png)</code><span>Изображение в Markdown</span></div>
              <div><code>&lt;https://example.com&gt;</code><span>Автоссылка в большинстве Markdown-редакторов</span></div>
            </div>
          </section>
          <section>
            <h3>Блоки</h3>
            <div class="markdown-help-grid">
              <div><code>&gt; цитата</code><span>Цитата или примечание</span></div>
              <div><code>---</code><span>Горизонтальный разделитель</span></div>
              <div><code>\`\`\`js<br>const value = true;<br>\`\`\`</code><span>Блок кода с языком</span></div>
              <div><code>    код с отступом</code><span>Альтернативный блок кода</span></div>
            </div>
          </section>
          <section>
            <h3>Таблицы</h3>
            <div class="markdown-help-grid">
              <div><code>| Имя | Описание |<br>| - | - |<br>| Button | Действие |</code><span>Обычная таблица</span></div>
              <div><code>| Слева | Центр | Справа |<br>| :--- | :---: | ---: |</code><span>Выравнивание колонок</span></div>
            </div>
          </section>
          <section>
            <h3>Экранирование</h3>
            <div class="markdown-help-grid">
              <div><code>\\*не курсив\\*</code><span>Обратный слеш отключает форматирование</span></div>
              <div><code>&amp;lt;div&amp;gt;</code><span>HTML-символы можно писать как entities</span></div>
            </div>
          </section>
        </div>
      </aside>
      </div>
  `;
}

function enterEditMode() {
  isEditing = true;
  isPreviewing = false;
  editStatus.textContent = "";
  renderEditor();
  updateEditorControls();
}

function exitEditMode() {
  isEditing = false;
  isPreviewing = false;
  currentMarkdown = savedMarkdown;
  editStatus.textContent = "";
  renderDocument();
  updateEditorControls();
}

function getEditorValue() {
  const editor = article.querySelector("#markdownEditor");
  return editor ? editor.value : currentMarkdown;
}

function applyMarkdownAction(action) {
  const editor = article.querySelector("#markdownEditor");
  if (!editor) return;

  const inlineActions = {
    bold: ["**", "**", "жирный текст"],
    italic: ["*", "*", "курсив"],
    code: ["`", "`", "код"],
  };

  if (inlineActions[action]) {
    wrapSelection(editor, ...inlineActions[action]);
    return;
  }

  if (action === "link") {
    wrapSelection(editor, "[", "](https://example.com)", "текст ссылки");
    return;
  }

  if (action === "codeblock") {
    wrapSelection(editor, "```\n", "\n```", "код");
    return;
  }

  if (action === "table") {
    insertText(editor, "\n| Колонка | Значение |\n| - | - |\n| Название | Описание |\n");
    return;
  }

  if (action === "rule") {
    insertText(editor, "\n---\n");
    return;
  }

  const lineActions = {
    h2: (line) => `## ${line.replace(/^#{1,6}\s+/, "") || "Заголовок"}`,
    h3: (line) => `### ${line.replace(/^#{1,6}\s+/, "") || "Заголовок"}`,
    ul: (line) => `- ${line.replace(/^\s*[-*]\s+/, "") || "пункт"}`,
    quote: (line) => `> ${line.replace(/^>\s?/, "") || "цитата"}`,
    ol: (line, index) => `${index + 1}. ${line.replace(/^\s*\d+\.\s+/, "") || "пункт"}`,
  };

  if (lineActions[action]) {
    transformSelectedLines(editor, lineActions[action]);
  }
}

function wrapSelection(editor, before, after, placeholder) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end) || placeholder;
  const next = `${before}${selected}${after}`;

  editor.setRangeText(next, start, end, "select");
  editor.selectionStart = start + before.length;
  editor.selectionEnd = start + before.length + selected.length;
  editor.focus();
}

function insertText(editor, text) {
  editor.setRangeText(text, editor.selectionStart, editor.selectionEnd, "end");
  editor.focus();
}

function transformSelectedLines(editor, transform) {
  const value = editor.value;
  const start = value.lastIndexOf("\n", editor.selectionStart - 1) + 1;
  let end = value.indexOf("\n", editor.selectionEnd);
  if (end === -1) end = value.length;

  const selected = value.slice(start, end);
  const next = selected
    .split("\n")
    .map((line, index) => transform(line, index))
    .join("\n");

  editor.setRangeText(next, start, end, "select");
  editor.focus();
}

function togglePreview() {
  if (!isEditing) return;

  if (isPreviewing) {
    renderEditor();
    isPreviewing = false;
  } else {
    currentMarkdown = getEditorValue();
    article.classList.remove("editing");
    article.innerHTML = renderMarkdown(currentMarkdown);
    isPreviewing = true;
  }

  updateEditorControls();
}

async function saveCurrentDoc() {
  if (!isEditing) return;

  const doc = currentDoc();
  currentMarkdown = getEditorValue();
  editStatus.textContent = "Сохраняю...";
  saveButton.disabled = true;

  try {
    const response = await fetch("/docs-site/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: doc.path, content: currentMarkdown }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `HTTP ${response.status}`);
    }

    isEditing = false;
    isPreviewing = false;
    savedMarkdown = currentMarkdown;
    editStatus.textContent = "Сохранено";
    renderDocument();
  } catch (error) {
    editStatus.textContent = "Не удалось сохранить";
    console.error(error);
  } finally {
    saveButton.disabled = false;
    updateEditorControls();
  }
}

function updateEditorControls() {
  const health = isHealthRoute();
  editButton.hidden = health || isEditing;
  saveButton.hidden = health || !isEditing;
  cancelButton.hidden = health || !isEditing;
  previewButton.hidden = health || !isEditing;
  previewButton.textContent = isPreviewing ? "Редактор" : "Предпросмотр";
}

function renderMarkdown(markdown) {
  const blocks = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const code = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push(`<blockquote>${quote.map((item) => `<p>${inline(item)}</p>`).join("")}</blockquote>`);
      continue;
    }

    if (isTableStart(lines, i)) {
      const table = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) {
        table.push(lines[i]);
        i += 1;
      }
      blocks.push(renderTable(table));
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      blocks.push(`<ul>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push(`<ol>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    const paragraph = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines, i)) {
      paragraph.push(lines[i]);
      i += 1;
    }
    blocks.push(`<p>${inline(paragraph.join(" "))}</p>`);
  }

  return blocks.join("\n");
}

function isBlockStart(lines, index) {
  const line = lines[index];
  return (
    /^```/.test(line) ||
    /^(#{1,4})\s+/.test(line) ||
    /^---+\s*$/.test(line) ||
    line.startsWith(">") ||
    isTableStart(lines, index) ||
    /^\s*[-*]\s+/.test(line) ||
    /^\s*\d+\.\s+/.test(line)
  );
}

function isTableStart(lines, index) {
  return /^\|.*\|\s*$/.test(lines[index] || "") && /^\|?[\s:-]+\|[\s|:-]*$/.test(lines[index + 1] || "");
}

function renderTable(lines) {
  const rows = lines
    .filter((line, index) => index !== 1)
    .map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));

  const [head = [], ...body] = rows;
  return `
    <table>
      <thead><tr>${head.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead>
      <tbody>
        ${body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
}

function inline(value) {
  let html = escapeHtml(value);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
    const target = href.startsWith("http") ? ` target="_blank" rel="noreferrer"` : "";
    return `<a href="${escapeHtml(href)}"${target}>${text}</a>`;
  });
  return html;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem("seda-portal-theme", nextTheme);
  localStorage.setItem("docs-theme", nextTheme);

  if (themeIcon) {
    themeIcon.textContent = "";
    themeIcon.className = `seda-icon ${nextTheme === "dark" ? "seda-icon-moon" : "seda-icon-sun"}`;
  }

  if (themeButton) {
    const label = nextTheme === "dark" ? "Включить светлую тему" : "Включить темную тему";
    themeButton.setAttribute("aria-label", label);
    themeButton.setAttribute("title", label);
  }
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  if (!isEditing && currentMarkdown) {
    renderDocument();
  }
}

function setSidebarWidth(width) {
  const nextWidth = Math.min(420, Math.max(200, Math.round(width)));
  document.documentElement.style.setProperty("--sidebar-width", `${nextWidth}px`);
  return nextWidth;
}

function startSidebarResize(event) {
  if (window.matchMedia("(max-width: 860px)").matches) return;

  event.preventDefault();
  document.body.classList.add("resizing-sidebar");
  sidebarResizeHandle.setPointerCapture(event.pointerId);

  const onPointerMove = (moveEvent) => {
    setSidebarWidth(moveEvent.clientX);
  };

  const stopResize = (upEvent) => {
    const width = setSidebarWidth(upEvent.clientX);
    localStorage.setItem("seda-portal-sidebar-width", String(width));
    localStorage.setItem("docs-sidebar-width", String(width));
    document.body.classList.remove("resizing-sidebar");
    sidebarResizeHandle.releasePointerCapture(event.pointerId);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopResize);
    window.removeEventListener("pointercancel", stopResize);
  };

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", stopResize);
  window.addEventListener("pointercancel", stopResize);
}

function showSidebarScrollbar() {
  if (!sidebar) return;

  sidebar.classList.add("is-scrolling");
  clearTimeout(showSidebarScrollbar.timeout);
  showSidebarScrollbar.timeout = setTimeout(() => {
    sidebar.classList.remove("is-scrolling");
  }, 900);
}

const scrollVisibilityTimers = new WeakMap();

function showPageScrollbar() {
  document.documentElement.classList.add("is-scrolling-page");
  document.body.classList.add("is-scrolling-page");
  clearTimeout(showPageScrollbar.timeout);
  showPageScrollbar.timeout = setTimeout(() => {
    document.documentElement.classList.remove("is-scrolling-page");
    document.body.classList.remove("is-scrolling-page");
  }, 900);
}

function showScrollableScrollbar(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  target.classList.add("is-scrolling");
  clearTimeout(scrollVisibilityTimers.get(target));
  scrollVisibilityTimers.set(
    target,
    setTimeout(() => {
      target.classList.remove("is-scrolling");
    }, 900),
  );
}

menuButton.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

themeButton.addEventListener("click", toggleTheme);
sidebarResizeHandle.addEventListener("pointerdown", startSidebarResize);
sidebar.addEventListener("scroll", showSidebarScrollbar, { passive: true });
window.addEventListener("scroll", showPageScrollbar, { passive: true });
document.addEventListener("scroll", showScrollableScrollbar, { capture: true, passive: true });
editButton.addEventListener("click", enterEditMode);
saveButton.addEventListener("click", saveCurrentDoc);
cancelButton.addEventListener("click", exitEditMode);
previewButton.addEventListener("click", togglePreview);

article.addEventListener("click", (event) => {
  const selectTrigger = event.target.closest("[data-component-preview-select]");
  if (selectTrigger) {
    event.preventDefault();
    const prop = selectTrigger.dataset.componentPreviewSelect;
    const component = selectTrigger.closest("[data-component-preview]")?.dataset.componentPreview || "button";
    const options = embeddedSelectOptions(prop, component);
    const current = embeddedPreviewState[component]?.[prop];
    embeddedPreviewOpenSelect = embeddedPreviewOpenSelect === prop ? null : prop;
    if (embeddedPreviewOpenSelect) {
      embeddedPreviewActiveSelectIndex[prop] = Math.max(0, options.indexOf(current));
    }
    renderDocument();
    requestAnimationFrame(() => article.querySelector(`[data-component-preview-select="${CSS.escape(prop)}"]`)?.focus());
    return;
  }

  const selectOption = event.target.closest("[data-component-preview-select-option]");
  if (selectOption) {
    event.preventDefault();
    const prop = selectOption.dataset.componentPreviewSelectOption;
    const component = selectOption.closest("[data-component-preview]")?.dataset.componentPreview || "button";
    embeddedPreviewState = {
      ...embeddedPreviewState,
      [component]: {
        ...embeddedPreviewState[component],
        [prop]: selectOption.dataset.value,
      },
    };
    embeddedPreviewOpenSelect = null;
    renderDocument();
    requestAnimationFrame(() => article.querySelector(`[data-component-preview-select="${CSS.escape(prop)}"]`)?.focus());
    return;
  }

  const propButton = event.target.closest("button[data-component-preview-prop]");
  if (propButton) {
    event.preventDefault();
    const preview = propButton.closest("[data-component-preview]");
    const component = preview?.dataset.componentPreview;
    const prop = propButton.dataset.componentPreviewProp;
    if (component && embeddedPreviewState[component]) {
      embeddedPreviewState = {
        ...embeddedPreviewState,
        [component]: {
          ...embeddedPreviewState[component],
          [prop]: propButton.value,
        },
      };
      renderDocument();
    }
    return;
  }

  const tool = event.target.closest("[data-markdown-action]");
  if (tool) {
    applyMarkdownAction(tool.dataset.markdownAction);
    return;
  }

  const helpButton = event.target.closest("[data-markdown-help]");
  if (helpButton) {
    setMarkdownHelpOpen(true);
    return;
  }

  if (event.target.closest("[data-markdown-help-close]")) {
    setMarkdownHelpOpen(false);
  }
});

article.addEventListener("input", handleEmbeddedPreviewControl);
article.addEventListener("change", handleEmbeddedPreviewControl);
article.addEventListener("keydown", handleEmbeddedPreviewSelectKeydown);

window.addEventListener("seda-tokens-ready", () => {
  if (!isEditing && currentMarkdown) {
    renderDocument();
  }
});

function handleEmbeddedPreviewControl(event) {
  const control = event.target.closest("[data-component-preview-prop]");
  if (!control) return;

  const preview = control.closest("[data-component-preview]");
  const component = preview?.dataset.componentPreview;
  if (!component || !embeddedPreviewState[component]) return;

  const prop = control.dataset.componentPreviewProp;
  embeddedPreviewState = {
    ...embeddedPreviewState,
    [component]: {
      ...embeddedPreviewState[component],
      [prop]: control.type === "checkbox" ? control.checked : control.value,
    },
  };

  if (component === "button" && prop === "label" && event.type === "input") {
    const label = preview.querySelector(".seda-button-label");
    if (label && embeddedPreviewState[component].state !== "loading") {
      label.textContent = control.value;
    }
    return;
  }

  if (component === "text-field" && event.type === "input" && ["label", "value", "placeholder", "helper"].includes(prop)) {
    const field = preview.querySelector(".seda-field");
    const label = preview.querySelector(".field-label");
    const helper = preview.querySelector(".field-helper");
    if (prop === "value") {
      preview.querySelectorAll('[data-component-preview-prop="value"]').forEach((input) => {
        if (input !== control) input.value = control.value;
      });
      if (field && field !== control) field.value = control.value;
    }
    if (prop === "placeholder" && field) field.placeholder = control.value;
    if (prop === "helper" && helper) helper.textContent = control.value;
    if (prop === "label" && label) {
      label.textContent = `${control.value}${embeddedPreviewState[component].required ? " *" : ""}`;
    }
    return;
  }

  preview.outerHTML = renderEmbeddedComponentPreview(currentDoc());
}

function handleEmbeddedPreviewSelectKeydown(event) {
  const trigger = event.target.closest("[data-component-preview-select]");
  if (!trigger) return;

  const prop = trigger.dataset.componentPreviewSelect;
  const component = trigger.closest("[data-component-preview]")?.dataset.componentPreview || "button";
  const options = embeddedSelectOptions(prop, component);
  if (!options.length) return;

  const current = embeddedPreviewState[component]?.[prop];
  const selectedIndex = Math.max(0, options.indexOf(current));
  const isOpen = embeddedPreviewOpenSelect === prop;
  const activeIndex = clampIndex(embeddedPreviewActiveSelectIndex[prop] ?? selectedIndex, options.length);

  if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter", " ", "Escape"].includes(event.key)) return;
  event.preventDefault();

  if (event.key === "Escape") {
    embeddedPreviewOpenSelect = null;
    renderDocument();
    requestAnimationFrame(() => article.querySelector(`[data-component-preview-select="${CSS.escape(prop)}"]`)?.focus());
    return;
  }

  if (!isOpen) {
    embeddedPreviewOpenSelect = prop;
    embeddedPreviewActiveSelectIndex[prop] = event.key === "ArrowUp" ? options.length - 1 : selectedIndex;
    renderDocument();
    requestAnimationFrame(() => article.querySelector(`[data-component-preview-select="${CSS.escape(prop)}"]`)?.focus());
    return;
  }

  if (event.key === "ArrowDown") embeddedPreviewActiveSelectIndex[prop] = Math.min(options.length - 1, activeIndex + 1);
  if (event.key === "ArrowUp") embeddedPreviewActiveSelectIndex[prop] = Math.max(0, activeIndex - 1);
  if (event.key === "Home") embeddedPreviewActiveSelectIndex[prop] = 0;
  if (event.key === "End") embeddedPreviewActiveSelectIndex[prop] = options.length - 1;

  if (event.key === "Enter" || event.key === " ") {
    embeddedPreviewState = {
      ...embeddedPreviewState,
      [component]: {
        ...embeddedPreviewState[component],
        [prop]: options[activeIndex],
      },
    };
    embeddedPreviewOpenSelect = null;
  }

  renderDocument();
  requestAnimationFrame(() => article.querySelector(`[data-component-preview-select="${CSS.escape(prop)}"]`)?.focus());
}

function setMarkdownHelpOpen(isOpen) {
  const drawer = article.querySelector("#markdownHelpDrawer");
  const helpButton = article.querySelector("[data-markdown-help]");
  if (!drawer) return;

  drawer.hidden = !isOpen;
  helpButton?.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("markdown-help-open", isOpen);
}

searchInput.addEventListener("input", (event) => {
  renderNav(event.target.value);
});

window.addEventListener("hashchange", loadRoute);
window.addEventListener("beforeunload", (event) => {
  if (!isEditing) return;

  event.preventDefault();
  event.returnValue = "";
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMarkdownHelpOpen(false);
  }
});

init();

async function init() {
  article.innerHTML = `<div class="loading">Загружаю список документов...</div>`;

  try {
    const response = await fetch("/docs-site/docs.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    DOCS = await response.json();
    flattenDocs();

    if (!flatDocs.length) {
      article.innerHTML = `<div class="error">Markdown-файлы не найдены.</div>`;
      return;
    }

    renderNav();

    if (!location.hash) {
      location.hash = flatDocs[0].id;
      return;
    }

    loadRoute();
  } catch (error) {
    article.innerHTML = `
      <div class="error">
        Не получилось загрузить индекс документации <code>docs-site/docs.json</code>.
        Перезапусти локальный сервер командой <code>node portal\\docs-site\\server.js</code>.
      </div>
    `;
  }
}
