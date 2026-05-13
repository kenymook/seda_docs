const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
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
  const filePath = path.resolve(root, `.${requestedPath}`);

  if (!filePath.startsWith(root)) {
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
  console.log(`SEDA UI Docs: http://${host}:${port}/docs-site/`);
});

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

function resolveEditableMarkdownPath(webPath) {
  if (typeof webPath !== "string" || !webPath.endsWith(".md")) return null;

  const normalized = webPath.replace(/\\/g, "/");
  if (!normalized.startsWith("../foundation/") && !normalized.startsWith("../specs/")) return null;

  const filePath = path.resolve(root, normalized.replace(/^\.\.\//, ""));
  if (!filePath.startsWith(root) || path.extname(filePath) !== ".md") return null;

  return filePath;
}
