const http = require("http");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..", "..");
const portalRoot = path.resolve(__dirname, "..");
const root = projectRoot;
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
};

const sectionTitles = {
  foundation: "Foundation",
  actions: "Actions",
  inputs: "Inputs",
  "data-display": "Data Display",
  feedback: "Feedback",
  navigation: "Navigation",
  "overlays-layout": "Overlays & Layout",
};

const figmaBaseline = {
  matchedSpecs: 51,
  readySpecs: 51,
  qualityIssues: 0,
  missingInFigma: 0,
  needsNaming: 0,
  actionableSemanticTotal: 0,
};

const sectionOrder = [
  "foundation",
  "actions",
  "inputs",
  "data-display",
  "feedback",
  "navigation",
  "overlays-layout",
  "templates",
  "other",
];

const preferredOrder = {
  foundation: [
    "introducing",
    "tokens",
    "theming",
    "typography",
    "sizes",
    "spacing-layout",
    "states",
    "state-vocabulary",
    "interaction-model",
    "validation-model",
    "accessibility",
    "components",
    "component-anatomy",
  ],
};

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname);

  if (request.method === "OPTIONS") {
    writeCors(response);
    response.writeHead(204);
    response.end();
    return;
  }

  if (pathname === "/docs-site") {
    response.writeHead(308, { Location: "/docs-site/" });
    response.end();
    return;
  }

  if (pathname === "/component-lab") {
    response.writeHead(308, { Location: "/component-lab/" });
    response.end();
    return;
  }

  if (pathname === "/docs-site/docs.json") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(JSON.stringify(buildDocsIndex(), null, 2));
    return;
  }

  if (pathname === "/docs-site/health.json") {
    response.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end(JSON.stringify(buildDocsHealthReport(), null, 2));
    return;
  }

  if (pathname === "/docs-site/figma-components.json" && request.method === "POST") {
    readJsonBody(request, response, (body) => {
      const validationError = validateFigmaInventory(body);
      if (validationError) {
        writeCors(response);
        response.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ ok: false, error: validationError }));
        return;
      }

      const targetPath = path.join(portalRoot, "docs-site", "figma-components.json");
      const content = `${JSON.stringify(body, null, 2)}\n`;

      fs.writeFile(targetPath, content, "utf8", (error) => {
        writeCors(response);
        if (error) {
          response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          response.end(JSON.stringify({ ok: false, error: "Could not save Figma inventory" }));
          return;
        }

        response.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        });
        response.end(JSON.stringify({
          ok: true,
          path: "portal/docs-site/figma-components.json",
          generatedAt: body.generatedAt,
          components: body.components.length,
        }));
      });
    });
    return;
  }

  if (pathname === "/docs-site/save" && request.method === "POST") {
    readJsonBody(request, response, (body) => {
      const targetPath = resolveEditableMarkdownPath(body.path);

      if (!targetPath) {
        response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Invalid markdown path");
        return;
      }

      fs.writeFile(targetPath, String(body.content || ""), "utf8", (error) => {
        if (error) {
          response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          response.end("Could not save file");
          return;
        }

        response.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        });
        response.end(JSON.stringify({ ok: true }));
      });
    });
    return;
  }

  const requestedPath =
    pathname === "/" || pathname === "/docs-site/"
      ? "/docs-site/index.html"
      : pathname === "/component-lab/"
        ? "/component-lab/index.html"
        : pathname;
  const staticRoot = getStaticRoot(requestedPath);
  const filePath = path.resolve(staticRoot, `.${requestedPath}`);

  if (!filePath.startsWith(staticRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`SEDA AI Portal: http://${host}:${port}/docs-site/`);
});

function writeCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function buildDocsIndex() {
  const entries = [
    ...readMarkdownFiles(path.join(root, "foundation")).map((filePath) => ({
      section: "foundation",
      path: toWebPath(filePath),
    })),
    ...readMarkdownFiles(path.join(root, "specs")).map((filePath) => {
      const relative = path.relative(path.join(root, "specs"), filePath).split(path.sep);
      const section = relative.length > 1 ? relative[0] : "templates";
      return {
        section,
        path: toWebPath(filePath),
      };
    }),
  ];

  const grouped = new Map();

  entries.forEach((entry) => {
    const title = sectionTitles[entry.section] || titleFromSlug(entry.section);
    if (!grouped.has(entry.section)) {
      grouped.set(entry.section, { key: entry.section, title, items: [] });
    }

    grouped.get(entry.section).items.push([titleFromSlug(path.basename(entry.path, ".md")), entry.path]);
  });

  return [...grouped.values()]
    .sort((a, b) => sectionRank(a.key) - sectionRank(b.key) || a.title.localeCompare(b.title))
    .map((section) => ({
      title: section.title,
      items: section.items.sort((a, b) => itemRank(section.key, a[1]) - itemRank(section.key, b[1]) || a[0].localeCompare(b[0])),
    }));
}

function buildDocsHealthReport() {
  const docs = [
    ...readMarkdownFiles(path.join(root, "foundation")).map((filePath) => ({
      kind: "foundation",
      section: "foundation",
      filePath,
      path: toWebPath(filePath),
    })),
    ...readMarkdownFiles(path.join(root, "specs")).map((filePath) => {
      const relative = path.relative(path.join(root, "specs"), filePath).split(path.sep);
      return {
        kind: relative.length > 1 ? "component" : "template",
        section: relative.length > 1 ? relative[0] : "templates",
        filePath,
        path: toWebPath(filePath),
      };
    }),
  ];

  const tokenRegistry = readTokenRegistry();
  const items = docs.map((doc) => lintMarkdownDoc(doc, tokenRegistry));
  const figmaInventory = readFigmaInventory();
  const figmaAliases = readFigmaAliases();
  const figmaExceptions = readFigmaQualityExceptions();
  const figma = buildFigmaCoverage(items, figmaInventory, figmaAliases, figmaExceptions);
  const actionPlan = buildActionPlan(items, figma);
  const totals = items.reduce(
    (acc, item) => {
      acc[item.kind] = (acc[item.kind] || 0) + 1;
      acc.errors += item.issues.filter((issue) => issue.severity === "error").length;
      acc.warnings += item.issues.filter((issue) => issue.severity === "warning").length;
      acc.notes += item.issues.filter((issue) => issue.severity === "note").length;
      return acc;
    },
    { component: 0, foundation: 0, template: 0, errors: 0, warnings: 0, notes: 0 },
  );

  const totalChecks = items.reduce((sum, item) => sum + item.checks.total, 0);
  const passedChecks = items.reduce((sum, item) => sum + item.checks.passed, 0);
  const score = totalChecks ? Math.round((passedChecks / totalChecks) * 100) : 100;

  return {
    generatedAt: new Date().toISOString(),
    score,
    totals: {
      documents: items.length,
      components: totals.component,
      foundation: totals.foundation,
      templates: totals.template,
      errors: totals.errors,
      warnings: totals.warnings,
      notes: totals.notes,
    },
    tokens: {
      available: tokenRegistry.available,
      semantic: tokenRegistry.semantic.size,
      components: tokenRegistry.components.size,
      foundation: tokenRegistry.foundation.size,
      invalidReferences: items.reduce((sum, item) => sum + item.invalidTokenRefs.length, 0),
    },
    figma,
    actionPlan,
    items: items.sort((a, b) => b.issueWeight - a.issueWeight || a.path.localeCompare(b.path)),
  };
}

function lintMarkdownDoc(doc, tokenRegistry) {
  const markdown = fs.readFileSync(doc.filePath, "utf8");
  const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || titleFromSlug(path.basename(doc.path, ".md"));
  const headings = [...markdown.matchAll(/^#{2,3}\s+(.+)$/gm)].map((match) => normalizeHeading(match[1]));
  const meta = parseDocMeta(markdown);
  const issues = [];
  let totalChecks = 1;
  let passedChecks = title ? 1 : 0;

  if (!title) issues.push(issue("error", "Missing H1 title"));

  if (doc.kind === "component") {
    const requiredMeta = ["category", "version", "status", "owner", "last reviewed", "figma"];
    for (const field of requiredMeta) {
      totalChecks += 1;
      if (meta[field]) passedChecks += 1;
      else issues.push(issue("warning", `Missing metadata: ${field}`));
    }

    if (/owner\s*(?:В·|·|-|:)\s*TBD/i.test(markdown)) {
      issues.push(issue("note", "Owner is still TBD"));
    }
    if (/status\s*(?:В·|·|-|:)\s*needs-review/i.test(markdown)) {
      issues.push(issue("note", "Status is still needs-review"));
    }
    if (/figma\s*(?:В·|·|-|:)\s*(?:\[.*?\]|TBD|$)/i.test(markdown)) {
      issues.push(issue("warning", "Figma link looks like a placeholder"));
    }

    const requiredSections = [
      ["Key Principles", ["key principles", "principles"]],
      ["Anatomy", ["anatomy"]],
      ["Types / Variants", ["types", "variants"]],
      ["Sizes", ["sizes"]],
      ["States", ["states"]],
      ["Behavior", ["behavior"]],
      ["Accessibility", ["accessibility"]],
      ["Tokens", ["tokens", "design tokens"]],
    ];

    for (const [label, aliases] of requiredSections) {
      totalChecks += 1;
      if (headings.some((heading) => aliases.some((alias) => heading.includes(alias)))) passedChecks += 1;
      else issues.push(issue("warning", `Missing section: ${label}`));
    }
  } else if (doc.kind === "foundation") {
    const recommendedSections = ["principles", "rules", "usage", "governance", "examples"];
    totalChecks += 1;
    if (headings.length >= 2) passedChecks += 1;
    else issues.push(issue("note", "Foundation doc has fewer than two sections"));

    totalChecks += 1;
    if (recommendedSections.some((alias) => headings.some((heading) => heading.includes(alias)))) passedChecks += 1;
    else issues.push(issue("note", "Consider adding principles, rules, usage, governance, or examples"));
  }

  if (!/\[[^\]]+\]\((?:\.\.\/foundation\/|\.\.\/specs\/|https?:\/\/)/.test(markdown)) {
    issues.push(issue("note", "No cross-links found"));
  }

  const rawColorCount = (markdown.match(/#[0-9a-f]{3,8}\b/gi) || []).length;
  if (rawColorCount) issues.push(issue("warning", `Raw color values found: ${rawColorCount}`));

  const tokenRefs = extractTokenReferences(markdown);
  const invalidTokenRefs = validateTokenReferences(tokenRefs, tokenRegistry);
  const tokenRefCount = tokenRefs.length;

  if (invalidTokenRefs.length) {
    issues.push(issue("warning", `Unknown token references: ${invalidTokenRefs.slice(0, 5).join(", ")}${invalidTokenRefs.length > 5 ? ` +${invalidTokenRefs.length - 5}` : ""}`));
  }

  return {
    title,
    path: doc.path,
    section: sectionTitles[doc.section] || titleFromSlug(doc.section),
    kind: doc.kind,
    status: meta.status || "",
    owner: meta.owner || "",
    lastReviewed: meta["last reviewed"] || "",
    figma: meta.figma || "",
    tokenRefCount,
    invalidTokenRefs,
    issues,
    issueWeight: issues.reduce((sum, entry) => sum + (entry.severity === "error" ? 100 : entry.severity === "warning" ? 10 : 1), 0),
    checks: {
      passed: passedChecks,
      total: totalChecks,
      score: totalChecks ? Math.round((passedChecks / totalChecks) * 100) : 100,
    },
  };
}

function readTokenRegistry() {
  const filePath = path.join(root, "tokens.json");
  const registry = {
    available: false,
    all: new Set(["transparent"]),
    semantic: new Set(),
    components: new Set(),
    foundation: new Set(),
  };

  if (!fs.existsSync(filePath)) return registry;

  try {
    const tokens = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const collections = tokens.$collections || {};
    for (const [collectionName, collection] of Object.entries(collections)) {
      const modes = collection?.$modes || {};
      for (const mode of Object.values(modes)) {
        collectTokenPaths(mode, [], (tokenPath) => {
          registry.all.add(tokenPath);
          if (collectionName === "semantic") registry.semantic.add(tokenPath);
          if (collectionName === "components") registry.components.add(tokenPath);
          if (collectionName === "foundation") registry.foundation.add(tokenPath);
        });
      }
    }
    registry.available = true;
  } catch (error) {
    registry.available = false;
  }

  return registry;
}

function collectTokenPaths(node, segments, addPath) {
  if (!node || typeof node !== "object") return;
  if (Object.prototype.hasOwnProperty.call(node, "$value") || Object.prototype.hasOwnProperty.call(node, "$type")) {
    if (segments.length) addPath(segments.join("/"));
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    collectTokenPaths(value, [...segments, key], addPath);
  }
}

function extractTokenReferences(markdown) {
  const refs = new Set();
  const inlineMarkdown = markdown.replace(/```[\s\S]*?```/g, "");
  const codeRefs = [...inlineMarkdown.matchAll(/\x60([^\x60\r\n]+)\x60/g)].map((match) => match[1].trim());
  const knownRoots = /^(surface|container|border|text|icon|status|focus|link|shadow|opacity|duration|easing|radius|size|space|color|button|breadcrumbs|checkbox|divider|input|select|textarea|tabs|table|toggle|tooltip|popover|modal|drawer|sidebar|pagination|badge|avatar|chip|tag|skeleton|spinner|progress|card|menu|search|form|timepicker|datepicker)\//;

  for (const rawRef of codeRefs) {
    const ref = rawRef.toLowerCase();
    if (ref.startsWith("--")) continue;
    if (ref.includes(" ")) continue;
    if (!knownRoots.test(ref)) continue;
    refs.add(ref.replace(/^semantic\//, "").replace(/^components\//, "").replace(/^foundation\//, ""));
  }

  return [...refs].sort();
}

function validateTokenReferences(refs, registry) {
  if (!registry.available) return [];
  return refs.filter((ref) => {
    const root = ref.split("/")[0];
    if (semanticTokenRoots.has(root)) return !registry.semantic.has(ref);
    if (foundationTokenRoots.has(root)) return !registry.foundation.has(ref);
    return !registry.components.has(ref) && !registry.all.has(ref);
  });
}

const semanticTokenRoots = new Set([
  "surface",
  "container",
  "border",
  "text",
  "icon",
  "status",
  "focus",
  "link",
  "shadow",
  "opacity",
  "duration",
  "easing",
]);

const foundationTokenRoots = new Set(["color", "radius", "size", "space"]);

function parseDocMeta(markdown) {
  const meta = {};
  const lines = markdown.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^>\s*\*\*([^*]+)\*\*\s*(?:В·|·|-|:)\s*(.+?)\s*$/);
    if (!match) continue;
    meta[match[1].trim().toLowerCase()] = match[2].trim();
  }
  return meta;
}

function normalizeHeading(value) {
  return value
    .replace(/^\d+\.\s*/, "")
    .replace(/[^\p{L}\p{N}/ ]+/gu, " ")
    .trim()
    .toLowerCase();
}

function issue(severity, message) {
  return { severity, message };
}

function readFigmaInventory() {
  const filePath = path.join(portalRoot, "docs-site", "figma-components.json");
  if (!fs.existsSync(filePath)) return null;

  try {
    const inventory = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!inventory || !Array.isArray(inventory.components) || !inventory.components.length) return null;
    return inventory;
  } catch (error) {
    return null;
  }
}

function readFigmaAliases() {
  const filePath = path.join(portalRoot, "docs-site", "figma-component-aliases.json");
  if (!fs.existsSync(filePath)) return {};

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

    return Object.fromEntries(
      Object.entries(raw)
        .map(([spec, aliases]) => [
          normalizeComponentMatchName(spec),
          Array.isArray(aliases) ? aliases.map(normalizeComponentMatchName).filter(Boolean) : [],
        ])
        .filter(([, aliases]) => aliases.length),
    );
  } catch (error) {
    return {};
  }
}

function readFigmaQualityExceptions() {
  const filePath = path.join(portalRoot, "docs-site", "figma-quality-exceptions.json");
  if (!fs.existsSync(filePath)) return [];

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return Array.isArray(raw?.exceptions) ? raw.exceptions : [];
  } catch {
    return [];
  }
}

function buildFigmaCoverage(items, inventory, aliases = {}, exceptions = []) {
  const empty = {
    available: false,
    generatedAt: "",
    fileName: "",
    totals: { componentSets: 0, standaloneComponents: 0, variants: 0 },
    matchedSpecs: 0,
    readySpecs: 0,
    directMatches: 0,
    aliasMatches: 0,
    qualityIssues: [],
    qualityUnknown: [],
    needsNaming: [],
    missingInFigma: [],
    missingSpecs: [],
    aliasCount: Object.keys(aliases).length,
  };

  if (!inventory || !Array.isArray(inventory.components)) {
    items.forEach((item) => {
      item.figmaStatus = item.kind === "component" ? "not-scanned" : "not-applicable";
      item.figmaComponent = "";
    });
    return empty;
  }

  const components = inventory.components
    .map((component) => ({
      ...component,
      quality: decorateFigmaQuality(component, exceptions),
      matchName: normalizeComponentMatchName(component.normalizedName || component.name || ""),
    }))
    .filter((component) => component.matchName);

  const matchedComponentNames = new Set();
  const missingInFigma = [];
  const needsNaming = [];
  let matchedSpecs = 0;
  let readySpecs = 0;
  let directMatches = 0;
  let aliasMatches = 0;
  const qualityIssues = [];
  const qualityUnknown = [];

  items.forEach((item) => {
    if (item.kind !== "component") {
      item.figmaStatus = "not-applicable";
      item.figmaComponent = "";
      return;
    }

    const slug = normalizeComponentMatchName(path.basename(item.path, ".md"));
    const title = normalizeComponentMatchName(item.title);
    const aliasTargets = [...(aliases[slug] || []), ...(aliases[title] || [])];
    const directComponent = bestDirectComponentMatch(components, slug, title);
    const aliasComponent = directComponent ? null : bestAliasComponentMatch(components, aliasTargets);
    const component = directComponent || aliasComponent;

    item.checks.total += 1;

    if (component) {
      matchedSpecs += 1;
      matchedComponentNames.add(component.name);
      item.figmaStatus = "matched";
      item.figmaComponent = component.name;
      item.figmaMatch = directComponent ? "direct" : "alias";
      item.figmaQuality = component.quality || null;
      item.figmaQualityStatus = componentQualityStatus(component, exceptions);
      item.checks.passed += 1;
      if (directComponent) directMatches += 1;
      else aliasMatches += 1;

      if (item.figmaQualityStatus === "ready" || item.figmaQualityStatus === "accepted-exceptions") {
        readySpecs += 1;
      } else if (item.figmaQualityStatus === "unknown") {
        qualityUnknown.push({
          title: item.title,
          path: item.path,
          component: component.name,
          status: item.figmaQualityStatus,
        });
      } else {
        item.issues.push(issue("warning", `Figma component quality: ${item.figmaQualityStatus}`));
        qualityIssues.push({
          title: item.title,
          path: item.path,
        component: component.name,
        status: item.figmaQualityStatus,
        quality: component.quality || null,
        auditWarnings: component.auditWarnings || [],
      });
      }
    } else {
      const candidates = findFigmaCandidates(components, slug, title);
      item.figmaStatus = "missing";
      item.figmaComponent = "";
      item.figmaCandidates = candidates;
      item.issues.push(issue("warning", "No matching Figma component in inventory"));
      const missingEntry = {
        title: item.title,
        path: item.path,
        candidates,
      };
      missingInFigma.push(missingEntry);
      if (candidates.length) needsNaming.push(missingEntry);
    }

    item.checks.score = item.checks.total ? Math.round((item.checks.passed / item.checks.total) * 100) : 100;
    item.issueWeight = item.issues.reduce((sum, entry) => sum + (entry.severity === "error" ? 100 : entry.severity === "warning" ? 10 : 1), 0);
  });

  const specNames = new Set(
    items
      .filter((item) => item.kind === "component")
      .flatMap((item) => [normalizeComponentMatchName(path.basename(item.path, ".md")), normalizeComponentMatchName(item.title)]),
  );
  const missingSpecs = components
    .filter((component) => !matchedComponentNames.has(component.name) && !specNames.has(component.matchName))
    .map((component) => ({
      name: component.name,
      type: component.type,
      page: component.page,
      variants: component.variants || 0,
      status: componentQualityStatus(component, exceptions),
      quality: component.quality || null,
      auditWarnings: component.auditWarnings || [],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const component of missingSpecs.filter(isUsefulMissingSpec)) {
    if (component.status === "ready" || component.status === "accepted-exceptions" || component.status === "unknown") continue;
    qualityIssues.push({
      title: component.name,
      path: "",
      component: component.name,
      status: component.status,
      quality: component.quality || null,
      auditWarnings: component.auditWarnings || [],
      unmatched: true,
    });
  }

  const semanticTotal = (inventory.components || []).reduce(
    (sum, c) => sum + (c.quality?.directSemanticBindingCount || 0), 0,
  );
  const actionableSemanticTotal = (inventory.components || []).reduce(
    (sum, c) => sum + computeActionableSemanticCount(c, exceptions), 0,
  );

  return {
    available: true,
    generatedAt: inventory.generatedAt || "",
    fileName: inventory.fileName || "",
    totals: inventory.totals || empty.totals,
    matchedSpecs,
    readySpecs,
    directMatches,
    aliasMatches,
    qualityIssues,
    qualityUnknown,
    needsNaming,
    missingInFigma,
    missingSpecs,
    aliasCount: Object.keys(aliases).length,
    semanticTotal,
    actionableSemanticTotal,
    exceptionTotal: semanticTotal - actionableSemanticTotal,
    baseline: buildFigmaBaselineStatus({
      matchedSpecs,
      readySpecs,
      qualityIssues,
      missingInFigma,
      needsNaming,
      actionableSemanticTotal,
    }),
  };
}

function buildFigmaBaselineStatus(figma) {
  const checks = [
    {
      key: "matchedSpecs",
      label: "Matched specs",
      expected: figmaBaseline.matchedSpecs,
      actual: figma.matchedSpecs || 0,
      pass: (figma.matchedSpecs || 0) >= figmaBaseline.matchedSpecs,
    },
    {
      key: "readySpecs",
      label: "Ready specs",
      expected: figmaBaseline.readySpecs,
      actual: figma.readySpecs || 0,
      pass: (figma.readySpecs || 0) >= figmaBaseline.readySpecs,
    },
    {
      key: "qualityIssues",
      label: "Quality issues",
      expected: figmaBaseline.qualityIssues,
      actual: (figma.qualityIssues || []).length,
      pass: (figma.qualityIssues || []).length <= figmaBaseline.qualityIssues,
    },
    {
      key: "missingInFigma",
      label: "Missing in Figma",
      expected: figmaBaseline.missingInFigma,
      actual: (figma.missingInFigma || []).length,
      pass: (figma.missingInFigma || []).length <= figmaBaseline.missingInFigma,
    },
    {
      key: "needsNaming",
      label: "Needs naming",
      expected: figmaBaseline.needsNaming,
      actual: (figma.needsNaming || []).length,
      pass: (figma.needsNaming || []).length <= figmaBaseline.needsNaming,
    },
    {
      key: "actionableSemanticTotal",
      label: "Actionable semantic",
      expected: figmaBaseline.actionableSemanticTotal,
      actual: figma.actionableSemanticTotal || 0,
      pass: (figma.actionableSemanticTotal || 0) <= figmaBaseline.actionableSemanticTotal,
    },
  ];

  return {
    pass: checks.every((check) => check.pass),
    checks,
  };
}

function buildActionPlan(items, figma) {
  const actions = [];

  if (figma.available) {
    if (figma.baseline && !figma.baseline.pass) {
      const failed = figma.baseline.checks
        .filter((check) => !check.pass)
        .map((check) => `${check.label}: ${check.actual} (expected ${check.expected})`)
        .join("; ");
      actions.push({
        type: "fix-figma-component",
        priority: 0,
        title: "Restore Figma quality baseline",
        detail: `The Figma baseline regressed. Failed checks: ${failed}.`,
        path: "",
      });
    }

    for (const item of figma.qualityIssues || []) {
      actions.push({
        type: "fix-figma-component",
        priority: actionPriority(item.path, "fix-figma-component"),
        title: `Fix Figma quality for ${item.title}`,
        detail: `Matched component ${item.component} is ${item.status}.`,
        path: item.path,
        component: item.component,
        quality: item.quality || null,
      });
    }

    for (const item of figma.needsNaming || []) {
      actions.push({
        type: "add-alias",
        priority: actionPriority(item.path, "add-alias"),
        title: `Add Figma alias for ${item.title}`,
        detail: "A likely Figma component exists, but the spec and component names do not match exactly.",
        path: item.path,
        candidates: item.candidates || [],
      });
    }

    for (const item of figma.missingInFigma || []) {
      if ((item.candidates || []).length) continue;
      actions.push({
        type: "create-in-figma",
        priority: actionPriority(item.path, "create-in-figma"),
        title: `Create Figma component for ${item.title}`,
        detail: "The component spec exists, but no matching component was found in the Figma inventory.",
        path: item.path,
        candidates: [],
      });
    }

    for (const item of (figma.missingSpecs || []).filter(isUsefulMissingSpec).slice(0, 16)) {
      actions.push({
        type: "write-spec",
        priority: actionPriority("", "write-spec"),
        title: `Write spec for ${item.name}`,
        detail: `Figma component exists on ${item.page || "unknown page"}, but no matching spec was found.`,
        path: "",
        component: item.name,
        page: item.page || "",
      });
    }
  }

  for (const item of items) {
    const warnings = item.issues.filter((issue) => issue.severity === "error" || issue.severity === "warning");
    if (!warnings.length) continue;
    actions.push({
      type: "review-docs",
      priority: actionPriority(item.path, "review-docs"),
      title: `Review ${item.title}`,
      detail: warnings.slice(0, 3).map((issue) => issue.message).join("; "),
      path: item.path,
    });
  }

  const sorted = actions.sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title));

  return {
    summary: {
      total: sorted.length,
      fixFigmaComponent: sorted.filter((item) => item.type === "fix-figma-component").length,
      createInFigma: sorted.filter((item) => item.type === "create-in-figma").length,
      addAlias: sorted.filter((item) => item.type === "add-alias").length,
      writeSpec: sorted.filter((item) => item.type === "write-spec").length,
      reviewDocs: sorted.filter((item) => item.type === "review-docs").length,
    },
    items: sorted.slice(0, 36),
    claudeTasks: renderClaudeTasks(sorted.slice(0, 18)),
  };
}

function actionPriority(webPath, type) {
  const pathValue = String(webPath || "");
  const sectionMatch = pathValue.match(/\.\.\/specs\/([^/]+)\//);
  const section = sectionMatch ? sectionMatch[1] : "";
  const sectionWeight = {
    actions: 0,
    inputs: 10,
    "data-display": 20,
    feedback: 30,
    navigation: 40,
    "overlays-layout": 50,
  }[section] ?? 90;
  const typeWeight = {
    "fix-figma-component": 0,
    "add-alias": 0,
    "create-in-figma": 2,
    "write-spec": 4,
    "review-docs": 8,
  }[type] ?? 9;

  return sectionWeight + typeWeight;
}

function computeActionableSemanticCount(component, exceptions) {
  const quality = component?.quality;
  if (!quality || quality.directSemanticBindingCount === 0) return 0;
  const componentExceptions = new Set(
    exceptions.filter((e) => e.component === component.name).map((e) => e.variable),
  );
  if (componentExceptions.size === 0) return quality.directSemanticBindingCount;
  const excepedCount = (quality.directSemanticBindingNames || [])
    .filter((entry) => componentExceptions.has(entry.name))
    .reduce((sum, entry) => sum + (entry.count || 0), 0);
  return Math.max(0, quality.directSemanticBindingCount - excepedCount);
}

function componentExceptions(component, exceptions) {
  return exceptions.filter((entry) => entry.component === component?.name);
}

function hasAcceptedRawPaintExceptions(component, exceptions) {
  const quality = component?.quality;
  if (!quality) return false;

  const componentRawExceptions = componentExceptions(component, exceptions).filter((entry) =>
    String(entry.variable || "").startsWith("RAW:"),
  );
  if (!componentRawExceptions.length) return false;

  const exceptedProperties = new Set(componentRawExceptions.map((entry) => String(entry.property || "").toLowerCase()));
  const rawFillCount = (quality.rawFillNodes || 0) + (quality.rawTextFillNodes || 0);
  const rawStrokeCount = quality.rawStrokeNodes || 0;
  const rawEffectCount = quality.rawEffectNodes || 0;

  if (rawFillCount > 0 && !exceptedProperties.has("fills")) return false;
  if (rawStrokeCount > 0 && !exceptedProperties.has("strokes")) return false;
  if (rawEffectCount > 0 && !exceptedProperties.has("effects")) return false;

  return rawFillCount + rawStrokeCount + rawEffectCount > 0;
}

function decorateFigmaQuality(component, exceptions) {
  const quality = component?.quality;
  if (!quality) return null;
  const direct = quality.directSemanticBindingCount || 0;
  const actionable = computeActionableSemanticCount(component, exceptions);
  const rawPaintsExcepted = hasAcceptedRawPaintExceptions(component, exceptions);
  return {
    ...quality,
    actionableSemanticCount: actionable,
    exceptedSemanticCount: Math.max(0, direct - actionable),
    rawPaintsExcepted,
  };
}

function componentQualityStatus(component, exceptions = []) {
  const quality = component?.quality;
  if (component?.auditWarnings?.length) return "component-errors";
  if (!quality) return "unknown";
  if (!quality.hasBindings) return "unbound";
  if (quality.hasLegacyBindings || quality.legacyBindingCount > 0) return "legacy-bindings";
  if (quality.hasDirectSemanticBindings || quality.directSemanticBindingCount > 0) {
    const actionable = computeActionableSemanticCount(component, exceptions);
    if (actionable > 0) return "semantic-bindings";
    return "accepted-exceptions";
  }
  if (quality.hasUnstyledText) return "no-text-styles";
  if (quality.hasRawPaints) {
    if (hasAcceptedRawPaintExceptions(component, exceptions)) return "accepted-exceptions";
    return "raw-paints";
  }
  if (typeof quality.score === "number" && quality.score < 80) return "incomplete";
  return "ready";
}

function isUsefulMissingSpec(item) {
  const name = String(item.name || "");
  if (/^[_.]/.test(name)) return false;
  if (/^(Icon|Emoji|logo)\//i.test(name)) return false;
  if (/\/(Item|Cell|Header|Separator|Control|Option|Day|NavButton)$/i.test(name)) return false;
  return true;
}

function renderClaudeTasks(actions) {
  if (!actions.length) return "";

  const lines = [
    "# Claude AI task queue",
    "",
    "Work through these design-system documentation tasks in priority order. Keep edits scoped, preserve existing formatting, and update specs or alias mappings only where the task asks for it.",
    "",
    "Global acceptance gates:",
    "- Do not use raw hex, rgba, hardcoded font sizes, or unstyled text for production Figma components.",
    "- Bind fills, strokes, effects, spacing, radius, and text colors to existing Figma variables from the design system wherever the property supports variables.",
    "- Apply existing text styles to every text node; do not leave text as manually formatted Inter values.",
    "- Component work is not complete until the component set has the expected anatomy, variants, states, token bindings, and accessible naming from its spec.",
    "- If an expected semantic/component token is missing, stop and report the missing token name instead of substituting a raw value.",
  ];

  actions.forEach((action, index) => {
    lines.push("", `## ${index + 1}. ${action.title}`, "", `Type: ${action.type}`);
    if (action.path) lines.push(`Spec: ${action.path}`);
    if (action.component) lines.push(`Figma component: ${action.component}`);
    if (action.page) lines.push(`Figma page: ${action.page}`);
    lines.push("", action.detail);

    if (action.type === "add-alias" && action.candidates?.length) {
      lines.push("", "Candidate aliases:");
      action.candidates.forEach((candidate) => lines.push(`- ${candidate.name}${candidate.page ? ` (${candidate.page})` : ""}`));
      lines.push("", "Update portal/docs-site/figma-component-aliases.json only if the candidate is truly the same component. Do not alias partial subparts, helpers, icons, or visually similar components.");
    }

    if (action.type === "create-in-figma") {
      lines.push("", "Use the spec as the source of truth for variants, states, anatomy, behavior, accessibility, and token usage.");
      lines.push("Create the full component, not just a decorative subpart or a single visual state.");
      lines.push("After creation, audit the component set: zero unbound production fills/strokes/text colors, zero text nodes without text styles, and no raw colors except user-selected sample values explicitly documented by the spec.");
    }

    if (action.type === "fix-figma-component") {
      const quality = action.quality || {};
      lines.push("", "Figma quality audit:");
      lines.push(`- bindingCount: ${quality.bindingCount ?? "unknown"}`);
      lines.push(`- rawFillNodes: ${quality.rawFillNodes ?? "unknown"}`);
      lines.push(`- rawStrokeNodes: ${quality.rawStrokeNodes ?? "unknown"}`);
      lines.push(`- rawTextFillNodes: ${quality.rawTextFillNodes ?? "unknown"}`);
      lines.push(`- textWithoutStyle: ${quality.textWithoutStyle ?? "unknown"}`);
      lines.push(`- directSemanticBindingCount: ${quality.directSemanticBindingCount ?? 0}`);
      lines.push(`- nodeCount: ${quality.nodeCount ?? "unknown"}`);
      if (quality.directSemanticBindingNames?.length) {
        lines.push("- direct semantic bindings:");
        quality.directSemanticBindingNames.slice(0, 8).forEach((entry) => lines.push(`  - ${entry.name}: ${entry.count}`));
      }
      lines.push("", "Fix the existing Figma component instead of creating a separate duplicate. Apply existing variables and text styles, then re-run the Figma inventory scan.");
    }

    if (action.type === "write-spec") {
      lines.push("", "Create or update the matching markdown spec using the existing component spec structure.");
    }

    if (action.type === "review-docs") {
      lines.push("", "Validate token names against tokens.json, not against memory or old docs. Replace outdated token references with existing semantic/component tokens only.");
    }
  });

  return lines.join("\n");
}

function findFigmaCandidates(components, slug, title) {
  const words = new Set(
    [slug, title]
      .join(" ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !["input", "field", "control", "group", "menu", "picker", "upload", "code"].includes(word)),
  );

  if (!words.size) return [];

  return components
    .filter((component) => component.type === "component-set" && !String(component.name || "").startsWith("_"))
    .map((component) => ({
      component,
      score: [...words].reduce((sum, word) => {
        const componentWords = new Set(component.matchName.split(/\s+/).filter(Boolean));
        return sum + (componentWords.has(word) ? 1 : 0);
      }, 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.component.name.localeCompare(b.component.name))
    .slice(0, 5)
    .map((entry) => ({
      name: entry.component.name,
      page: entry.component.page,
      type: entry.component.type,
    }));
}

function normalizeComponentMatchName(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_/]+/g, " ")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .replace(/\b(component|components|base|root|desktop|mobile)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function bestDirectComponentMatch(components, slug, title) {
  return components
    .map((component) => ({
      component,
      score: componentMatchesSpec(component.matchName, slug, title),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.component.name.localeCompare(b.component.name))[0]?.component || null;
}

function bestAliasComponentMatch(components, aliasTargets) {
  for (const target of aliasTargets) {
    const component = components.find((entry) => entry.matchName === target);
    if (component) return component;
  }
  return null;
}

function componentMatchesSpec(componentName, slug, title) {
  const targets = [slug, title].filter(Boolean);
  let score = 0;
  for (const target of targets) {
    if (componentName === target) score = Math.max(score, 100);
  }
  return score;
}

function readMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return readMarkdownFiles(entryPath);
    if (entry.isFile() && entry.name.endsWith(".md")) return [entryPath];
    return [];
  });
}

function toWebPath(filePath) {
  return `../${path.relative(root, filePath).replace(/\\/g, "/")}`;
}

function getStaticRoot(requestedPath) {
  if (
    requestedPath === "/portal-icons.css" ||
    requestedPath === "/portal-sidebar.css" ||
    requestedPath === "/portal-scrollbars.js" ||
    requestedPath === "/portal-tokens.js" ||
    requestedPath.startsWith("/docs-site/") ||
    requestedPath.startsWith("/component-lab/")
  ) {
    return portalRoot;
  }

  return projectRoot;
}

function titleFromSlug(slug) {
  return slug
    .replace(/\.md$/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sectionRank(section) {
  const index = sectionOrder.indexOf(section);
  return index === -1 ? sectionOrder.length : index;
}

function itemRank(section, filePath) {
  const slug = path.basename(filePath, ".md");
  const order = preferredOrder[section] || [];
  const index = order.indexOf(slug);
  return index === -1 ? order.length : index;
}

function readJsonBody(request, response, callback) {
  let body = "";

  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1024 * 1024) {
      response.writeHead(413, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Request body is too large");
      request.destroy();
    }
  });

  request.on("end", () => {
    try {
      callback(JSON.parse(body || "{}"));
    } catch (error) {
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Invalid JSON");
    }
  });
}

function validateFigmaInventory(body) {
  if (!body || typeof body !== "object") return "Inventory must be a JSON object";
  if (typeof body.generatedAt !== "string" || !body.generatedAt) return "Missing generatedAt";
  if (typeof body.fileName !== "string" || !body.fileName) return "Missing fileName";
  if (!Number.isFinite(Number(body.pageCount))) return "Missing pageCount";
  if (!body.totals || typeof body.totals !== "object") return "Missing totals";
  if (!Number.isFinite(Number(body.totals.componentSets))) return "Missing totals.componentSets";
  if (!Number.isFinite(Number(body.totals.standaloneComponents))) return "Missing totals.standaloneComponents";
  if (!Number.isFinite(Number(body.totals.variants))) return "Missing totals.variants";
  if (!Array.isArray(body.components)) return "Missing components array";
  if (body.components.length < 1) return "Components array is empty";

  for (const [index, component] of body.components.entries()) {
    if (!component || typeof component !== "object") return `Invalid component at index ${index}`;
    if (typeof component.id !== "string" || !component.id) return `Component ${index} is missing id`;
    if (typeof component.name !== "string" || !component.name) return `Component ${index} is missing name`;
    if (component.type !== "component" && component.type !== "component-set") {
      return `Component ${component.name || index} has invalid type`;
    }
    if (!component.quality || typeof component.quality !== "object") {
      return `Component ${component.name || index} is missing quality`;
    }
  }

  return "";
}

function resolveEditableMarkdownPath(webPath) {
  if (typeof webPath !== "string" || !webPath.endsWith(".md")) return null;

  const normalized = webPath.replace(/\\/g, "/");
  if (!normalized.startsWith("../foundation/") && !normalized.startsWith("../specs/")) return null;

  const filePath = path.resolve(root, normalized.replace(/^\.\.\//, ""));
  if (!filePath.startsWith(root) || path.extname(filePath) !== ".md") return null;

  return filePath;
}
