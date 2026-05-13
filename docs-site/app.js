let DOCS = [];
let flatDocs = [];
let currentMarkdown = "";
let savedMarkdown = "";
let isEditing = false;
let isPreviewing = false;
let activeDocId = "";

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

function updateActiveLink(id) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.id === id);
  });
}

function renderDocument() {
  article.classList.remove("editing");
  article.innerHTML = renderMarkdown(currentMarkdown);
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
  editButton.hidden = isEditing;
  saveButton.hidden = !isEditing;
  cancelButton.hidden = !isEditing;
  previewButton.hidden = !isEditing;
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
    themeIcon.textContent = nextTheme === "dark" ? "☾" : "☀";
  }

  if (themeButton) {
    const label = nextTheme === "dark" ? "Включить светлую тему" : "Включить темную тему";
    themeButton.setAttribute("aria-label", label);
    themeButton.setAttribute("title", label);
  }
}

function toggleTheme() {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
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

window.addEventListener("hashchange", loadCurrentDoc);
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
