let DOCS = [];
let flatDocs = [];

const nav = document.querySelector("#nav");
const article = document.querySelector("#document");
const breadcrumbs = document.querySelector("#breadcrumbs");
const searchInput = document.querySelector("#searchInput");
const menuButton = document.querySelector("#menuButton");

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
  const html = DOCS.map((section) => {
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

async function loadCurrentDoc() {
  const doc = currentDoc();
  updateActiveLink(doc.id);
  breadcrumbs.textContent = `${doc.section} / ${doc.label}`;
  article.innerHTML = `<div class="loading">Загружаю ${escapeHtml(doc.label)}...</div>`;

  try {
    const response = await fetch(doc.path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const markdown = await response.text();
    article.innerHTML = renderMarkdown(markdown);
    document.title = `${doc.label} - SEDA UI Docs`;
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

function updateActiveLink(id) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.id === id);
  });
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
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
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

menuButton.addEventListener("click", () => {
  document.body.classList.toggle("nav-open");
});

searchInput.addEventListener("input", (event) => {
  renderNav(event.target.value);
});

window.addEventListener("hashchange", loadCurrentDoc);

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

    loadCurrentDoc();
  } catch (error) {
    article.innerHTML = `
      <div class="error">
        Не получилось загрузить индекс документации <code>docs-site/docs.json</code>.
        Перезапусти локальный сервер командой <code>node docs-site\\server.js</code>.
      </div>
    `;
  }
}
