let tokens = null;
let components = {};
let flatComponents = [];
let selectedComponent = "button";
let propsState = {};
let openPropSelect = null;

const nav = document.querySelector("#nav");
const searchInput = document.querySelector("#searchInput");
const currentName = document.querySelector("#currentName");
const componentTitle = document.querySelector("#componentTitle");
const componentDescription = document.querySelector("#componentDescription");
const demoStatus = document.querySelector("#demoStatus");
const previewStage = document.querySelector("#previewStage");
const examples = document.querySelector("#examples");
const propsPanel = document.querySelector("#propsPanel");
const tokenTree = document.querySelector("#tokenTree");
const themeButton = document.querySelector("#themeButton");
const themeIcon = document.querySelector("#themeIcon");
const menuButton = document.querySelector("#menuButton");
const sidebar = document.querySelector(".sidebar");
const sidebarResizeHandle = document.querySelector("#sidebarResizeHandle");
const inspector = document.querySelector(".inspector");
const inspectorResizeHandle = document.querySelector("#inspectorResizeHandle");

const demoComponents = new Set([
  "button",
  "text-field",
  "text-area",
  "select",
  "chip",
  "accordion",
  "tabs",
  "table",
  "modal",
  "alert",
  "toast",
  "tooltip",
  "popover",
  "progress-bar",
  "spinner",
  "skeleton",
  "date-picker",
  "empty-state",
  "breadcrumbs",
  "pagination",
  "stepper",
  "link",
  "button-group",
  "slider",
  "color-picker",
  "file-upload",
  "time-picker",
  "verification-code",
  "search",
]);

const controls = {
  button: [
    { id: "variant", type: "select", label: "Variant", options: ["primary", "secondary", "outline", "ghost", "text", "destruction"] },
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "loading", "focus", "disabled"] },
    { id: "label", type: "text", label: "Label", value: "Создать отчет" },
    { id: "leadingIcon", type: "boolean", label: "Leading icon" },
    { id: "trailingIcon", type: "boolean", label: "Trailing icon" },
    { id: "fullWidth", type: "boolean", label: "Full width" },
  ],
  "text-field": [
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "label", type: "text", label: "Label", value: "Название проекта" },
    { id: "value", type: "text", label: "Value", value: "" },
    { id: "placeholder", type: "text", label: "Placeholder", value: "Введите название" },
    { id: "helper", type: "text", label: "Helper", value: "До 80 символов" },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "focus", "error", "warning", "success", "disabled", "read-only", "loading"] },
    { id: "prefixIcon", type: "boolean", label: "Prefix icon" },
    { id: "suffixIcon", type: "boolean", label: "Suffix icon" },
    { id: "clearButton", type: "boolean", label: "Clear button" },
    { id: "required", type: "boolean", label: "Required", value: true },
  ],
  "text-area": [
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "label", type: "text", label: "Label", value: "Комментарий" },
    { id: "value", type: "text", label: "Value", value: "Текстовое значение" },
    { id: "placeholder", type: "text", label: "Placeholder", value: "Опишите задачу" },
    { id: "helper", type: "text", label: "Helper", value: "Можно добавить детали" },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "focus", "error", "warning", "success", "disabled", "read-only", "loading"] },
    { id: "clearButton", type: "boolean", label: "Clear button", value: true },
    { id: "counter", type: "boolean", label: "Counter" },
    { id: "resize", type: "boolean", label: "Resizable", value: true },
    { id: "required", type: "boolean", label: "Required", value: true },
  ],
  select: [
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "label", type: "text", label: "Label", value: "Статус" },
    { id: "value", type: "select", label: "Value", options: ["", "Draft", "In review", "Ready"] },
    { id: "helper", type: "text", label: "Helper", value: "Выберите значение" },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "focus", "error", "warning", "success", "disabled", "loading"] },
    { id: "open", type: "boolean", label: "Open menu", value: true },
    { id: "prefixIcon", type: "boolean", label: "Prefix icon" },
    { id: "required", type: "boolean", label: "Required", value: true },
  ],
  chip: [
    { id: "variant", type: "select", label: "Variant", options: ["default", "filled"] },
    { id: "label", type: "text", label: "Label", value: "Dataset" },
    { id: "leadingIcon", type: "boolean", label: "Leading icon" },
    { id: "control", type: "select", label: "Control", options: ["none", "arrow", "remove"] },
    { id: "disabled", type: "boolean", label: "Disabled" },
  ],
  accordion: [
    { id: "variant", type: "select", label: "Variant", options: ["default", "bordered", "elevated"] },
    { id: "expanded", type: "boolean", label: "Expanded", value: true },
    { id: "disabled", type: "boolean", label: "Disabled" },
  ],
  tabs: [
    { id: "variant", type: "select", label: "Variant", options: ["line", "pill"] },
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"], value: "m" },
    { id: "selected", type: "select", label: "Selected", options: ["Overview", "Tokens", "Accessibility"] },
    { id: "withBadges", type: "boolean", label: "Badges" },
    { id: "disabledTab", type: "boolean", label: "Disabled tab" },
  ],
  table: [
    { id: "density", type: "select", label: "Density", options: ["compact", "regular", "comfortable"] },
    { id: "selectedRow", type: "boolean", label: "Selected row", value: true },
    { id: "striped", type: "boolean", label: "Striped", value: true },
    { id: "sortable", type: "boolean", label: "Sortable", value: true },
    { id: "loading", type: "boolean", label: "Loading" },
    { id: "empty", type: "boolean", label: "Empty" },
  ],
  modal: [
    { id: "size", type: "select", label: "Size", options: ["small", "medium", "large"] },
    { id: "title", type: "text", label: "Title", value: "Удалить компонент?" },
    { id: "description", type: "text", label: "Description", value: "Проверьте действие перед подтверждением." },
    { id: "tone", type: "select", label: "Tone", options: ["neutral", "danger"] },
    { id: "closeButton", type: "boolean", label: "Close button", value: true },
    { id: "footer", type: "boolean", label: "Footer", value: true },
  ],
  "icon-button": [
    { id: "variant", type: "select", label: "Variant", options: ["primary", "neutral", "ghost", "danger"] },
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "loading", "focus", "disabled", "selected"] },
    { id: "label", type: "text", label: "Label", value: "Run action" },
  ],
  checkbox: [
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "checked", "indeterminate", "error", "disabled"] },
    { id: "label", type: "text", label: "Label", value: "Enable memory" },
    { id: "helper", type: "text", label: "Helper", value: "Applies to future generations" },
  ],
  radio: [
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "selected", "error", "disabled"] },
    { id: "label", type: "text", label: "Label", value: "Precise mode" },
    { id: "helper", type: "text", label: "Helper", value: "Best for review workflows" },
  ],
  toggle: [
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "disabled"] },
    { id: "checked", type: "boolean", label: "On", value: true },
    { id: "label", type: "text", label: "Label", value: "Enable sync" },
    { id: "helper", type: "text", label: "Helper", value: "Keeps workspace data current" },
  ],
  "segmented-control": [
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "disabled"] },
    { id: "selected", type: "select", label: "Selected", options: ["List", "Board", "Chart"] },
  ],
  avatar: [
    { id: "variant", type: "select", label: "Variant", options: ["default", "brand", "ai"] },
    { id: "size", type: "select", label: "Size", options: ["small", "medium", "large"] },
    { id: "state", type: "select", label: "State", options: ["default", "selected", "focus", "disabled"] },
    { id: "label", type: "text", label: "Initials", value: "SA" },
    { id: "status", type: "select", label: "Status", options: ["none", "online", "busy", "away", "offline"] },
  ],
  badge: [
    { id: "tone", type: "select", label: "Tone", options: ["neutral", "brand", "info", "success", "warning", "danger", "ai", "disabled"] },
    { id: "label", type: "text", label: "Label", value: "Ready" },
    { id: "leadingIcon", type: "boolean", label: "Icon" },
  ],
  tag: [
    { id: "tone", type: "select", label: "Tone", options: ["neutral", "brand", "info", "success", "warning", "danger", "ai", "disabled"] },
    { id: "label", type: "text", label: "Label", value: "Dataset" },
    { id: "leadingIcon", type: "boolean", label: "Icon" },
  ],
  card: [
    { id: "state", type: "select", label: "State", options: ["default", "hover", "selected", "disabled"] },
    { id: "label", type: "text", label: "Title", value: "Model evaluation" },
    { id: "description", type: "text", label: "Description", value: "Compare outputs, metrics, and review notes." },
  ],
  alert: [
    { id: "tone", type: "select", label: "Tone", options: ["neutral", "info", "success", "warning", "danger"] },
    { id: "label", type: "text", label: "Title", value: "Review required" },
    { id: "description", type: "text", label: "Description", value: "Check generated output before publishing." },
    { id: "action", type: "boolean", label: "Action", value: true },
    { id: "closeButton", type: "boolean", label: "Close button", value: true },
  ],
  toast: [
    { id: "tone", type: "select", label: "Tone", options: ["default", "info", "success", "warning", "danger"] },
    { id: "label", type: "text", label: "Title", value: "Run completed" },
    { id: "description", type: "text", label: "Description", value: "The evaluation report is ready." },
    { id: "action", type: "boolean", label: "Action", value: true },
    { id: "closeButton", type: "boolean", label: "Close button", value: true },
  ],
  tooltip: [
    { id: "variant", type: "select", label: "Variant", options: ["dark", "light"] },
    { id: "label", type: "text", label: "Label", value: "Token-driven helper text" },
    { id: "arrow", type: "boolean", label: "Arrow", value: true },
  ],
  popover: [
    { id: "label", type: "text", label: "Title", value: "Context details" },
    { id: "description", type: "text", label: "Description", value: "Use popovers for short contextual controls and metadata." },
    { id: "closeButton", type: "boolean", label: "Close button", value: true },
  ],
  "progress-bar": [
    { id: "tone", type: "select", label: "Tone", options: ["default", "success", "warning", "danger", "disabled"] },
    { id: "value", type: "text", label: "Value", value: "64" },
    { id: "label", type: "text", label: "Label", value: "Processing dataset" },
  ],
  spinner: [
    { id: "tone", type: "select", label: "Tone", options: ["default", "disabled"] },
    { id: "size", type: "select", label: "Size", options: ["small", "medium", "large"] },
    { id: "label", type: "text", label: "Label", value: "Loading" },
  ],
  skeleton: [
    { id: "variant", type: "select", label: "Variant", options: ["text", "card", "list"] },
    { id: "animated", type: "boolean", label: "Animated", value: true },
  ],
  "empty-state": [
    { id: "label", type: "text", label: "Title", value: "No reports yet" },
    { id: "description", type: "text", label: "Description", value: "Create a report to compare generated outputs and metrics." },
    { id: "action", type: "boolean", label: "Action", value: true },
  ],
  breadcrumbs: [
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "disabled"] },
    { id: "label", type: "text", label: "Current page", value: "Button" },
    { id: "icon", type: "boolean", label: "Home icon", value: true },
  ],
  pagination: [
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "selected", "disabled"] },
    { id: "selected", type: "select", label: "Selected", options: ["1", "2", "3", "4"] },
    { id: "showEdges", type: "boolean", label: "Edge buttons", value: true },
  ],
  stepper: [
    { id: "state", type: "select", label: "Current state", options: ["current", "completed", "upcoming", "error", "disabled"] },
    { id: "orientation", type: "select", label: "Orientation", options: ["horizontal", "vertical"] },
    { id: "label", type: "text", label: "Current label", value: "Configure tokens" },
  ],
  link: [
    { id: "variant", type: "select", label: "Variant", options: ["default", "subtle", "inverse"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "pressed", "visited", "visitedHover", "visitedPressed", "disabled"] },
    { id: "label", type: "text", label: "Label", value: "Open component spec" },
    { id: "icon", type: "boolean", label: "Trailing icon", value: true },
  ],
  "button-group": [
    { id: "variant", type: "select", label: "Variant", options: ["outline", "ghost", "solid"] },
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "selected", type: "select", label: "Selected", options: ["Preview", "Tokens", "Spec"] },
  ],
  slider: [
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "disabled"] },
    { id: "value", type: "text", label: "Value", value: "64" },
    { id: "label", type: "text", label: "Label", value: "Creativity" },
  ],
  "color-picker": [
    { id: "state", type: "select", label: "State", options: ["default", "hover", "focus", "disabled"] },
    { id: "value", type: "text", label: "Value", value: "#0072f5" },
    { id: "label", type: "text", label: "Label", value: "Accent color" },
  ],
  "file-upload": [
    { id: "state", type: "select", label: "State", options: ["default", "hover", "drag", "error", "disabled"] },
    { id: "label", type: "text", label: "Title", value: "Upload dataset" },
    { id: "description", type: "text", label: "Description", value: "Drop CSV or JSON file here." },
  ],
  "date-picker": [
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "focus", "error", "disabled"] },
    { id: "label", type: "text", label: "Label", value: "Дата" },
    { id: "value", type: "text", label: "Value", value: "" },
    { id: "placeholder", type: "text", label: "Placeholder", value: "ДД.ММ.ГГГГ" },
    { id: "helper", type: "text", label: "Helper", value: "Helper text" },
    { id: "open", type: "boolean", label: "Open calendar" },
    { id: "required", type: "boolean", label: "Required", value: true },
  ],
  "time-picker": [
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "focus", "error", "disabled"] },
    { id: "label", type: "text", label: "Label", value: "Время" },
    { id: "value", type: "text", label: "Value", value: "" },
    { id: "placeholder", type: "text", label: "Placeholder", value: "ЧЧ : ММ" },
    { id: "helper", type: "text", label: "Helper", value: "Helper text" },
    { id: "open", type: "boolean", label: "Open menu" },
    { id: "required", type: "boolean", label: "Required", value: true },
  ],
  "verification-code": [
    { id: "state", type: "select", label: "State", options: ["default", "focus", "error", "disabled"] },
    { id: "value", type: "text", label: "Value", value: "123456" },
    { id: "label", type: "text", label: "Label", value: "Security code" },
  ],
  search: [
    { id: "size", type: "select", label: "Size", options: ["s", "m", "l", "xl"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "focus", "disabled", "loading"] },
    { id: "value", type: "text", label: "Value", value: "Dataset" },
    { id: "clearButton", type: "boolean", label: "Clear button", value: true },
  ],
};


const sidebarWidth = Number(localStorage.getItem("seda-portal-sidebar-width") || localStorage.getItem("docs-sidebar-width"));
if (Number.isFinite(sidebarWidth)) {
  setSidebarWidth(sidebarWidth);
}

const inspectorWidth = Number(localStorage.getItem("seda-portal-inspector-width") || localStorage.getItem("component-lab-inspector-width"));
if (Number.isFinite(inspectorWidth)) {
  setInspectorWidth(inspectorWidth);
}

applyTheme(localStorage.getItem("seda-portal-theme") || localStorage.getItem("component-lab-theme") || "dark");
init();

async function init() {
  const response = await fetch("../tokens.json", { cache: "no-store" });
  tokens = await response.json();
  components = tokens.$collections.components.$modes["Mode 1"];
  flatComponents = Object.keys(components).sort();

  selectedComponent = location.hash.replace("#", "") || "button";
  if (!components[selectedComponent]) selectedComponent = flatComponents[0];

  renderNav();
  selectComponent(selectedComponent);
}

function renderNav(filter = "") {
  const query = filter.trim().toLowerCase();
  const groups = groupComponents(flatComponents.filter((name) => name.includes(query)));

  nav.innerHTML = Object.entries(groups)
    .map(([title, items]) => `
      <section class="nav-section">
        <h2 class="nav-section-title">${escapeHtml(title)}</h2>
        ${items.map((name) => `
          <a class="nav-link ${name === selectedComponent ? "active" : ""}" href="#${name}" data-component="${name}">
            ${escapeHtml(titleCase(name))}
            <span class="nav-count">${countLeaves(components[name])}</span>
          </a>
        `).join("")}
      </section>
    `)
    .join("");
}

function groupComponents(names) {
  const groupMap = {
    "Core demos": ["button", "text-field", "text-area", "select", "chip", "accordion", "tabs", "table", "modal"],
    Actions: ["button-group", "icon-button", "link"],
    Inputs: ["checkbox", "color-picker", "date-picker", "file-upload", "radio", "segmented-control", "slider", "time-picker", "toggle", "verification-code"],
    "Data display": ["avatar", "badge", "card", "chat-bubble", "description-list", "divider", "stat-metric", "tag", "timeline"],
    Feedback: ["alert", "empty-state", "popover", "progress-bar", "skeleton", "spinner", "toast", "tooltip"],
    Navigation: ["breadcrumbs", "drawer", "pagination", "sidebar", "stepper", "top-bar"],
    Layout: ["container", "form", "grid", "dropdown-menu", "notification-center", "search"],
  };

  const result = {};
  for (const [group, groupNames] of Object.entries(groupMap)) {
    const items = groupNames.filter((name) => names.includes(name));
    if (items.length) result[group] = items;
  }
  const other = names.filter((name) => !Object.values(groupMap).flat().includes(name));
  if (other.length) result.Other = other;
  return result;
}

function hasLiveDemo(name) {
  return Boolean(demos[name]) || components[name];
}

function getControls(name) {
  return controls[name] || genericControls(name);
}

function genericControls(name) {
  const branch = components[name] || {};
  const optionsFrom = (object, fallback) => {
    const keys = object && typeof object === "object" ? Object.keys(object).filter((key) => !key.startsWith("$")) : [];
    return keys.length ? keys : fallback;
  };
  const controlsList = [
    { id: "size", type: "select", label: "Size", options: ["small", "medium", "large"] },
    { id: "state", type: "select", label: "State", options: ["default", "hover", "active", "focus", "selected", "disabled"] },
    { id: "label", type: "text", label: "Label", value: titleCase(name) },
  ];

  if (["alert", "badge", "tag", "toast", "progress-bar", "tooltip"].includes(name)) {
    controlsList.unshift({ id: "tone", type: "select", label: "Tone", options: ["neutral", "info", "success", "warning", "danger"] });
  }
  if (["avatar", "badge", "tag", "card", "empty-state", "drawer", "popover"].includes(name)) {
    controlsList.unshift({ id: "variant", type: "select", label: "Variant", options: optionsFrom(branch.surface, ["default"]) });
  }
  if (["checkbox", "radio", "toggle", "segmented-control"].includes(name)) {
    controlsList.push({ id: "checked", type: "boolean", label: "Checked", value: true });
  }
  if (["drawer", "popover", "toast", "tooltip", "notification-center"].includes(name)) {
    controlsList.push({ id: "open", type: "boolean", label: "Open", value: true });
  }
  if (["date-picker", "time-picker", "search", "color-picker", "verification-code"].includes(name)) {
    controlsList.push({ id: "value", type: "text", label: "Value", value: sampleValue(name) });
  }
  return controlsList;
}

function selectComponent(name) {
  selectedComponent = name;
  location.hash = name;
  propsState = defaultProps(name);
  currentName.textContent = titleCase(name);
  componentTitle.textContent = titleCase(name);
  document.title = `${titleCase(name)} - SEDA AI`;
  componentDescription.textContent = hasLiveDemo(name)
    ? "Живой предпросмотр компонента с настройкой props."
    : "Для этого компонента пока доступен token preview. Интерактивный пример можно добавить следующим проходом.";
  demoStatus.textContent = hasLiveDemo(name) ? "Interactive" : "Token preview";
  renderNav(searchInput.value);
  renderProps();
  renderPreview();
  renderTokenTree();
}

function defaultProps(name) {
  const next = Object.fromEntries(getControls(name).map((control) => {
    if (control.type === "boolean") return [control.id, Boolean(control.value)];
    return [control.id, control.value ?? control.options?.[0] ?? ""];
  }));
  if (["text-field", "text-area", "select", "date-picker", "time-picker"].includes(name)) {
    next.value = "";
  }
  return next;
}

function renderProps() {
  const componentControls = getControls(selectedComponent);
  if (!componentControls.length) {
    propsPanel.innerHTML = `<div class="token-row"><span class="token-name">Props controls are not defined yet.</span></div>`;
    return;
  }

  propsPanel.innerHTML = componentControls.map((control) => {
    if (control.type === "select") {
      const css = fieldVars(components.select, "default", "m", "select");
      const isOpen = openPropSelect === control.id;
      return `
        <div class="control prop-field prop-select-control" style="${css}">
          <span class="field-label">${escapeHtml(control.label)}</span>
          <button class="seda-select prop-select-trigger ${isOpen ? "is-open" : ""}" type="button" data-prop-select="${control.id}" aria-haspopup="listbox" aria-expanded="${isOpen}">
            <span>${escapeHtml(propsState[control.id])}</span>
            <span class="prop-select-chevron" aria-hidden="true">⌄</span>
          </button>
          ${
            isOpen
              ? `<div class="prop-select-menu" role="listbox" aria-label="${escapeHtml(control.label)}">
                  ${control.options
                    .map(
                      (option) => `
                        <button class="prop-select-option ${propsState[control.id] === option ? "is-selected" : ""}" type="button" role="option" aria-selected="${propsState[control.id] === option}" data-prop-select-option="${control.id}" data-value="${escapeHtml(option)}">
                          ${escapeHtml(option)}
                        </button>
                      `,
                    )
                    .join("")}
                </div>`
              : ""
          }
        </div>
      `;
    }

    if (control.type === "boolean") {
      const css = toggleVars(components.toggle, "default", propsState[control.id], "m");
      return `
        <div class="control-row prop-toggle-row" style="${css}">
          <span class="field-label">${escapeHtml(control.label)}</span>
          <label class="prop-toggle">
            <input type="checkbox" data-prop="${control.id}" ${propsState[control.id] ? "checked" : ""} />
            <span class="seda-toggle-demo ${propsState[control.id] ? "is-on" : ""}" aria-hidden="true"><span></span></span>
          </label>
        </div>
      `;
    }

    const css = fieldVars(components["text-field"], "default", "m", "input");
    return `
      <label class="control prop-field" style="${css}">
        <span class="field-label">${escapeHtml(control.label)}</span>
        <input class="seda-field prop-input" data-prop="${control.id}" value="${escapeHtml(propsState[control.id])}" />
      </label>
    `;
  }).join("");
}

function renderPreview() {
  const render = demos[selectedComponent] || (() => renderGenericDemo(selectedComponent));
  previewStage.innerHTML = render();
  examples.innerHTML = renderExamples();
}

function updateDemoState(nextState, options = {}) {
  propsState = { ...propsState, ...nextState };
  renderProps();
  if (!options.skipPreview) {
    renderPreview();
  }
}

const demos = {
  button() {
    const map = {
      primary: ["primary", "solid"],
      secondary: ["neutral", "secondary"],
      outline: ["neutral", "outline"],
      ghost: ["neutral", "ghost"],
      text: ["neutral", "text"],
      destruction: ["danger", "solid"],
    };
    const [tokenVariant, tokenStyle] = map[propsState.variant] || map.primary;
    const branch = components.button?.[tokenVariant]?.[tokenStyle] || components.button?.primary?.solid || {};
    const surfaceState = tokenStateFor(branch.surface, propsState.state);
    const foregroundState = tokenStateFor(branch.foreground, propsState.state);
    const borderState = tokenStateFor(branch.border, propsState.state);
    const disabled = propsState.state === "disabled" || propsState.state === "loading";
    const sizeClass = `size-${propsState.size}`;
    const type = controlTypeVars(propsState.size);
    const box = controlBoxVars("button", propsState.size);
    const css = styleVars({
      "--button-surface": tokenValue(branch.surface?.[surfaceState]) || tokenValue(branch.surface?.default) || "var(--container-brand-default)",
      "--button-surface-hover": tokenValue(branch.surface?.hover) || "var(--container-brand-hover)",
      "--button-foreground": tokenValue(branch.foreground?.[foregroundState]) || tokenValue(branch.foreground?.default) || "var(--text-on-brand-primary)",
      "--button-border": tokenValue(branch.border?.[borderState]) || tokenValue(branch.border?.default) || tokenValue(branch.surface?.default) || "transparent",
      "--button-width": propsState.fullWidth ? "100%" : "auto",
      "--button-height": box.height,
      "--button-padding-x": box.paddingX,
      "--button-padding-y": box.paddingY,
      "--button-gap": box.gap,
      "--button-radius": box.radius,
      "--button-border-width": box.borderWidth,
      "--button-font-size": type.size,
      "--button-line-height": type.lineHeight,
      "--button-font-weight": type.weight,
      "--button-letter-spacing": type.letterSpacing,
    });
    const leading = propsState.leadingIcon ? `<span aria-hidden="true">+</span>` : "";
    const trailing = propsState.trailingIcon ? `<span aria-hidden="true">→</span>` : "";
    const label = propsState.state === "loading" ? "Загрузка..." : escapeHtml(propsState.label);
    const hasCustomProps = propsState.leadingIcon || propsState.trailingIcon || propsState.fullWidth;
    return `
      <div class="preview-card">
        <div class="source-row">
          <span class="source-badge is-figma">Figma</span>
          ${hasCustomProps ? `<span class="source-badge is-custom">Not in Figma</span>` : ""}
        </div>
        <div class="button-row">
          <button class="seda-button ${sizeClass}" data-demo-cycle="state:default,hover,active,focus" style="${css}" ${disabled ? "disabled" : ""}>${leading}<span>${label}</span>${trailing}</button>
        </div>
      </div>
    `;
  },
  "text-field"() {
    return renderField("input", components["text-field"], propsState.state, propsState.label, propsState.placeholder, propsState.value);
  },
  "text-area"() {
    return renderField("textarea", components["text-area"], propsState.state, propsState.label, propsState.placeholder, propsState.value);
  },
  select() {
    const state = propsState.state;
    const branch = components.select?.trigger || components.select;
    const css = fieldVars(branch, state, propsState.size, "select");
    const disabled = state === "disabled" || state === "loading";
    const required = propsState.required ? ` <span aria-hidden="true">*</span>` : "";
    const valueLabel = propsState.value || "Select...";
    return `
      <div class="preview-card field-demo" style="${css}">
        <label class="field-label">${escapeHtml(propsState.label)}${required}</label>
        <div class="field-shell size-${propsState.size}">
          ${propsState.prefixIcon ? `<span class="field-affix" aria-hidden="true">⌕</span>` : ""}
          <button class="seda-select select-trigger ${propsState.open ? "is-open" : ""}" type="button" data-demo-toggle="open" aria-haspopup="listbox" aria-expanded="${propsState.open}" ${disabled ? "disabled" : ""}>
            <span>${escapeHtml(valueLabel)}</span>
            <span class="select-chevron" aria-hidden="true">⌄</span>
          </button>
        </div>
        <div class="field-helper">${escapeHtml(helperText(state, propsState.helper))}</div>
        ${propsState.open ? renderSelectMenu() : ""}
      </div>
    `;
  },
  "date-picker"() {
    return renderDateTimePicker("date-picker");
  },
  "time-picker"() {
    return renderDateTimePicker("time-picker");
  },
  chip() {
    const branch = components.chip;
    const variant = propsState.disabled ? "disabled" : propsState.variant;
    const type = controlTypeVars("small");
    const box = controlBoxVars("chip", "medium");
    const css = styleVars({
      "--chip-surface": tokenValue(branch.surface?.[variant]) || tokenValue(branch.surface?.default),
      "--chip-border": tokenValue(branch.border?.[variant]) || tokenValue(branch.border?.default),
      "--chip-foreground": tokenValue(branch.foreground?.[variant]) || tokenValue(branch.foreground?.default),
      "--chip-height": box.height,
      "--chip-padding-x": box.paddingX,
      "--chip-gap": box.gap,
      "--chip-radius": box.radius,
      "--chip-border-width": box.borderWidth,
      "--chip-font-size": type.size,
      "--chip-line-height": type.lineHeight,
      "--chip-font-weight": type.weight,
      "--chip-letter-spacing": type.letterSpacing,
    });
    const leading = propsState.leadingIcon ? `<span aria-hidden="true">#</span>` : "";
    const control = propsState.control === "arrow"
      ? `<button class="chip-control" type="button" data-demo-set="control:none" aria-label="Open ${escapeHtml(propsState.label)}" ${propsState.disabled ? "disabled" : ""}>⌄</button>`
      : propsState.control === "remove"
        ? `<button class="chip-control" type="button" data-demo-set="control:none" aria-label="Remove ${escapeHtml(propsState.label)}" ${propsState.disabled ? "disabled" : ""}>×</button>`
        : "";
    return `<div class="preview-card"><div class="chip-row"><span class="seda-chip ${propsState.disabled ? "is-disabled" : ""}" style="${css}">${leading}<span>${escapeHtml(propsState.label)}</span>${control}</span></div></div>`;
  },
  accordion() {
    const branch = components.accordion;
    const variant = propsState.variant;
    const css = accordionVars(branch, variant, propsState.expanded ? "expanded" : "default", propsState.disabled);
    return `<div class="preview-card"><div class="seda-accordion ${propsState.expanded ? "is-expanded" : ""}" style="${css}"><button class="accordion-trigger" data-demo-toggle="expanded" aria-expanded="${propsState.expanded}" ${propsState.disabled ? "disabled" : ""}>Параметры модели <span>${propsState.expanded ? "⌃" : "⌄"}</span></button>${propsState.expanded ? `<div class="accordion-panel">Температура, контекст и ограничения генерации.</div>` : ""}</div></div>`;
  },
  tabs() {
    const tabLabels = ["Overview", "Tokens", "Accessibility"];
    const size = propsState.size || "m";
    const css = tabsVars(components.tabs, propsState.variant, size);
    const isPill = propsState.variant === "pill";
    const tabItems = tabLabels.map((tab, index) => {
      const id = `tab-${index}`;
      const panelId = `panel-${index}`;
      const isSelected = tab === propsState.selected;
      const isDisabled = propsState.disabledTab && index === 2;
      const badge = propsState.withBadges ? `<span class="tab-badge" aria-hidden="true">${index + 1}</span>` : "";
      return `<button
        class="seda-tab"
        id="${id}"
        role="tab"
        aria-selected="${isSelected}"
        aria-controls="${panelId}"
        tabindex="${isSelected ? 0 : -1}"
        data-demo-prop="selected"
        data-demo-value="${escapeHtml(tab)}"
        ${isDisabled ? 'disabled aria-disabled="true"' : ""}
      >${escapeHtml(tab)}${badge}</button>`;
    });
    const panelContent = tabLabels[tabLabels.indexOf(propsState.selected)];
    return `
      <div class="preview-card" style="width:fit-content;min-width:min(420px,100%);">
        <div
          class="seda-tabs${isPill ? " is-pill" : ""}"
          role="tablist"
          aria-label="Component sections"
          style="${css}"
        >${tabItems.join("")}</div>
        <div class="tab-panel" role="tabpanel" aria-labelledby="tab-${tabLabels.indexOf(propsState.selected)}">
          <p class="field-helper">${escapeHtml(panelContent)} panel content</p>
        </div>
      </div>
    `;
  },
  table() {
    const rows = propsState.empty ? [] : [
      ["Embedding job", "Ready", "98%"],
      ["Prompt audit", "Review", "84%"],
      ["Dataset sync", "Draft", "62%"],
    ];
    const densityClass = `density-${propsState.density}`;
    const body = propsState.loading
      ? `<tr><td colspan="3">Загрузка данных...</td></tr>`
      : rows.length
        ? rows.map((row, index) => `<tr class="${tableRowClass(index)}" data-demo-action="select-row" data-row-index="${index}" tabindex="0">${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")
        : `<tr><td colspan="3">Нет данных</td></tr>`;
    return `<div class="preview-card"><table class="seda-table ${densityClass}" style="${tableVars(components.table, propsState.density)}"><thead><tr><th>Name ${propsState.sortable ? "↕" : ""}</th><th>Status ${propsState.sortable ? "↕" : ""}</th><th>Score ${propsState.sortable ? "↕" : ""}</th></tr></thead><tbody>${body}</tbody></table></div>`;
  },
  modal() {
    const danger = propsState.tone === "danger";
    const width = propsState.size === "small" ? "360px" : propsState.size === "large" ? "640px" : "480px";
    const css = modalVars(components.modal, propsState.size, width);
    const primaryButtonCss = buttonStyleFor(danger ? components.button?.danger?.solid : components.button?.primary?.solid, "m");
    const secondaryButtonCss = buttonStyleFor(components.button?.neutral?.outline, "m");
    return `
      <div class="modal-demo" style="${css}">
        ${propsState.closeButton ? `<button class="modal-close" type="button" data-demo-set="closeButton:false" aria-label="Закрыть">×</button>` : ""}
        <h3>${escapeHtml(propsState.title)}</h3>
        <p>${escapeHtml(propsState.description)}</p>
        ${propsState.footer ? `<div class="button-row"><button class="seda-button" style="${primaryButtonCss}">Подтвердить</button><button class="seda-button" style="${secondaryButtonCss}">Отмена</button></div>` : ""}
      </div>
    `;
  },
  "icon-button"() {
    const branch = components["icon-button"]?.[propsState.variant] || components["icon-button"]?.primary || {};
    const disabled = propsState.state === "disabled" || propsState.state === "loading";
    const css = iconButtonStyleFor(branch, propsState.size, propsState.state);
    const icon = propsState.state === "loading" ? "◌" : "○";
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-figma">Figma</span></div>
        <button class="seda-icon-button" data-demo-cycle="state:default,hover,active,selected,focus" style="${css}" aria-label="${escapeHtml(propsState.label)}" ${disabled ? "disabled" : ""}>${icon}</button>
      </div>
    `;
  },
  checkbox() {
    const state = propsState.state;
    const checked = state === "checked" || state === "indeterminate";
    const css = choiceVars(components.checkbox, state, "checkbox", propsState.size);
    const mark = state === "indeterminate" ? "−" : checked ? "✓" : "";
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-figma">Figma</span></div>
        <label class="seda-choice is-checkbox" style="${css}" tabindex="0" data-demo-cycle="state:default,checked,indeterminate">
          <span class="choice-box">${mark}</span>
          <span><strong>${escapeHtml(propsState.label)}</strong><small>${escapeHtml(helperText(state, propsState.helper))}</small></span>
        </label>
      </div>
    `;
  },
  radio() {
    const state = propsState.state;
    const selected = state === "selected";
    const css = choiceVars(components.radio, state, "radio", propsState.size);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-figma">Figma</span></div>
        <label class="seda-choice is-radio" style="${css}" tabindex="0" data-demo-set="state:selected">
          <span class="choice-box is-radio">${selected ? "<i></i>" : ""}</span>
          <span><strong>${escapeHtml(propsState.label)}</strong><small>${escapeHtml(helperText(state, propsState.helper))}</small></span>
        </label>
      </div>
    `;
  },
  toggle() {
    const state = propsState.state;
    const css = toggleVars(components.toggle, state, propsState.checked, propsState.size);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-figma">Figma</span></div>
        <label class="seda-toggle-field" style="${css}">
          <button class="seda-toggle-demo ${propsState.checked ? "is-on" : ""}" data-demo-toggle="checked" ${state === "disabled" ? "disabled" : ""} aria-pressed="${propsState.checked}"><span></span></button>
          <span><strong>${escapeHtml(propsState.label)}</strong><small>${escapeHtml(helperText(state, propsState.helper))}</small></span>
        </label>
      </div>
    `;
  },
  "segmented-control"() {
    const css = segmentedVars(components["segmented-control"], propsState.size, propsState.state);
    const items = ["List", "Board", "Chart"];
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-figma">Figma</span></div>
        <div class="seda-segmented" style="${css}">
          ${items.map((item) => `<button data-demo-prop="selected" data-demo-value="${escapeHtml(item)}" aria-pressed="${item === propsState.selected}" ${propsState.state === "disabled" ? "disabled" : ""}>${escapeHtml(item)}</button>`).join("")}
        </div>
      </div>
    `;
  },
  avatar() {
    const css = avatarVars(components.avatar, propsState.variant, propsState.size, propsState.state, propsState.status);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-figma">Figma</span></div>
        <div class="seda-avatar" style="${css}">
          ${escapeHtml(String(propsState.label || "A").slice(0, 2))}
          ${propsState.status !== "none" ? `<span class="avatar-status"></span>` : ""}
        </div>
      </div>
    `;
  },
  badge() {
    const css = tonePillVars(components.badge, propsState.tone, "badge");
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-figma">Figma</span></div>
        <span class="seda-badge" style="${css}">${propsState.leadingIcon ? `<span aria-hidden="true">•</span>` : ""}${escapeHtml(propsState.label)}</span>
      </div>
    `;
  },
  tag() {
    const css = tonePillVars(components.tag, propsState.tone, "tag");
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-figma">Figma</span></div>
        <span class="seda-tag-demo" style="${css}">${propsState.leadingIcon ? `<span aria-hidden="true">#</span>` : ""}${escapeHtml(propsState.label)}</span>
      </div>
    `;
  },
  card() {
    const css = cardVars(components.card, propsState.state);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-figma">Figma</span></div>
        <article class="seda-card-demo" style="${css}">
          <span class="card-meta">Evaluation · Updated today</span>
          <h3>${escapeHtml(propsState.label)}</h3>
          <p>${escapeHtml(propsState.description)}</p>
        </article>
      </div>
    `;
  },
  alert() {
    const css = alertVars(components.alert, propsState.tone);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="seda-alert" style="${css}" role="status">
          <span class="demo-icon" aria-hidden="true">${statusIcon(propsState.tone)}</span>
          <div>
            <strong>${escapeHtml(propsState.label)}</strong>
            <p>${escapeHtml(propsState.description)}</p>
          </div>
          ${propsState.action ? `<button type="button" data-demo-set="action:false">Review</button>` : ""}
          ${propsState.closeButton ? `<button class="inline-close" type="button" data-demo-set="closeButton:false" aria-label="Close">×</button>` : ""}
        </div>
      </div>
    `;
  },
  toast() {
    const css = toastVars(components.toast, propsState.tone);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="seda-toast-demo" style="${css}" role="status">
          <span class="demo-icon" aria-hidden="true">${statusIcon(propsState.tone)}</span>
          <div>
            <strong>${escapeHtml(propsState.label)}</strong>
            <p>${escapeHtml(propsState.description)}</p>
          </div>
          ${propsState.action ? `<button type="button" data-demo-set="action:false">Open</button>` : ""}
          ${propsState.closeButton ? `<button class="inline-close" type="button" data-demo-set="closeButton:false" aria-label="Close">×</button>` : ""}
        </div>
      </div>
    `;
  },
  tooltip() {
    const css = tooltipVars(components.tooltip, propsState.variant);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <span class="seda-tooltip-demo ${propsState.arrow ? "has-arrow" : ""}" style="${css}" role="tooltip">
          ${escapeHtml(propsState.label)}
        </span>
      </div>
    `;
  },
  popover() {
    const css = popoverVars(components.popover);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="seda-popover-demo" style="${css}">
          ${propsState.closeButton ? `<button class="inline-close" type="button" data-demo-set="closeButton:false" aria-label="Close">×</button>` : ""}
          <h3>${escapeHtml(propsState.label)}</h3>
          <p>${escapeHtml(propsState.description)}</p>
          <button class="seda-button" style="${buttonStyleFor(components.button?.neutral?.outline, "m")}">Apply</button>
        </div>
      </div>
    `;
  },
  "progress-bar"() {
    const css = progressVars(components["progress-bar"], propsState.tone);
    const value = clampNumber(propsState.value, 0, 100);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="seda-progress-demo" style="${css}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}">
          <div class="progress-meta"><span>${escapeHtml(propsState.label)}</span><strong>${value}%</strong></div>
          <div class="progress-track"><span style="width:${value}%"></span></div>
        </div>
      </div>
    `;
  },
  spinner() {
    const css = spinnerVars(components.spinner, propsState.tone, propsState.size);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="spinner-wrap" style="${css}">
          <span class="seda-spinner-demo" aria-hidden="true"></span>
          <span>${escapeHtml(propsState.label)}</span>
        </div>
      </div>
    `;
  },
  skeleton() {
    const css = skeletonVars(components.skeleton, propsState.animated);
    const lines = propsState.variant === "list" ? 4 : propsState.variant === "card" ? 3 : 2;
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="seda-skeleton-demo is-${propsState.variant}" style="${css}" aria-hidden="true">
          ${Array.from({ length: lines }, (_, index) => `<span style="--skeleton-line:${index}"></span>`).join("")}
        </div>
      </div>
    `;
  },
  "empty-state"() {
    const css = emptyStateVars(components["empty-state"]);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="seda-empty-demo" style="${css}">
          <div class="demo-illustration" aria-hidden="true"></div>
          <h3>${escapeHtml(propsState.label)}</h3>
          <p>${escapeHtml(propsState.description)}</p>
          ${propsState.action ? `<button class="seda-button" data-demo-set="action:false" style="${buttonStyleFor(components.button?.primary?.solid, "m")}">Create report</button>` : ""}
        </div>
      </div>
    `;
  },
  breadcrumbs() {
    const css = breadcrumbsVars(components.breadcrumbs, propsState.state);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <nav class="seda-breadcrumbs" style="${css}" aria-label="Breadcrumbs">
          <a href="#">${propsState.icon ? "⌂ " : ""}Projects</a>
          <span aria-hidden="true">/</span>
          <a href="#">SEDA AI</a>
          <span aria-hidden="true">/</span>
          <strong>${escapeHtml(propsState.label)}</strong>
        </nav>
      </div>
    `;
  },
  pagination() {
    const css = paginationVars(components.pagination, propsState.state);
    const pages = ["1", "2", "3", "4"];
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <nav class="seda-pagination" style="${css}" aria-label="Pagination">
          ${propsState.showEdges ? `<button type="button" data-demo-action="prev-page" aria-label="Previous">‹</button>` : ""}
          ${pages.map((page) => `<button type="button" data-demo-prop="selected" data-demo-value="${page}" ${page === propsState.selected ? `aria-current="page"` : ""}>${page}</button>`).join("")}
          ${propsState.showEdges ? `<button type="button" data-demo-action="next-page" aria-label="Next">›</button>` : ""}
        </nav>
      </div>
    `;
  },
  stepper() {
    const css = stepperVars(components.stepper, propsState.state);
    const vertical = propsState.orientation === "vertical";
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <ol class="seda-stepper ${vertical ? "is-vertical" : ""}" style="${css}">
          ${stepperItem("completed", "Select component", true)}
          <b aria-hidden="true"></b>
          ${stepperItem(propsState.state, propsState.label, false)}
          <b aria-hidden="true"></b>
          ${stepperItem("upcoming", "Review in Figma", false)}
        </ol>
      </div>
    `;
  },
  link() {
    const css = linkVars(components.link, propsState.variant, propsState.state);
    const disabled = propsState.state === "disabled";
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <a class="seda-link-demo ${disabled ? "is-disabled" : ""}" style="${css}" href="#" ${disabled ? `aria-disabled="true"` : ""}>
          ${escapeHtml(propsState.label)}${propsState.icon ? ` <span aria-hidden="true">↗</span>` : ""}
        </a>
      </div>
    `;
  },
  "button-group"() {
    const map = {
      outline: components.button?.neutral?.outline,
      ghost: components.button?.neutral?.ghost,
      solid: components.button?.neutral?.secondary,
    };
    const items = ["Preview", "Tokens", "Spec"];
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="seda-button-group" role="group" aria-label="View mode">
          ${items.map((item) => `<button class="seda-button ${item === propsState.selected ? "is-selected" : ""}" data-demo-prop="selected" data-demo-value="${escapeHtml(item)}" style="${buttonStyleFor(map[propsState.variant], propsState.size)}">${item}</button>`).join("")}
        </div>
      </div>
    `;
  },
  slider() {
    const value = clampNumber(propsState.value, 0, 100);
    const css = sliderVars(components.slider, propsState.state);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="seda-slider-field" style="${css}">
          <div class="progress-meta"><span>${escapeHtml(propsState.label)}</span><strong>${value}</strong></div>
          <div class="seda-slider-demo" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}">
            <span style="width:${value}%"></span>
            <i style="left:${value}%"></i>
            <input class="seda-slider-input" type="range" min="0" max="100" value="${value}" data-demo-prop="value" aria-label="${escapeHtml(propsState.label)}" />
          </div>
        </div>
      </div>
    `;
  },
  "color-picker"() {
    const css = fieldVars(components["text-field"], propsState.state, "medium", "input");
    const color = /^#[0-9a-f]{3,8}$/i.test(propsState.value) ? propsState.value : "#0072f5";
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <label class="generic-field" style="${css}">
          <span>${escapeHtml(propsState.label)}</span>
          <div class="seda-color-picker">
            <span style="background:${escapeHtml(color)}"></span>
            <input value="${escapeHtml(color)}" readonly ${propsState.state === "disabled" ? "disabled" : ""} />
          </div>
        </label>
      </div>
    `;
  },
  "file-upload"() {
    const css = fileUploadVars(components["file-upload"], propsState.state);
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="seda-file-upload" style="${css}">
          <span class="upload-icon" aria-hidden="true">↑</span>
          <strong>${escapeHtml(propsState.label)}</strong>
          <span>${escapeHtml(propsState.description)}</span>
        </div>
      </div>
    `;
  },
  "verification-code"() {
    const css = fieldVars(components["text-field"], propsState.state, "medium", "input");
    const chars = String(propsState.value || "").padEnd(6, " ").slice(0, 6).split("");
    return `
      <div class="preview-card">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <label class="generic-field" style="${css}">
          <span>${escapeHtml(propsState.label)}</span>
          <div class="seda-code-demo" tabindex="0" data-demo-action="advance-code">
            ${chars.map((char) => `<span>${escapeHtml(char.trim())}</span>`).join("")}
          </div>
        </label>
      </div>
    `;
  },
  search() {
    const css = fieldVars(components["text-field"], propsState.state, propsState.size, "input");
    const disabled = propsState.state === "disabled" || propsState.state === "loading";
    return `
      <div class="preview-card field-demo" style="${css}">
        <div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>
        <div class="field-shell size-${propsState.size}">
          <span class="field-affix" aria-hidden="true">⌕</span>
          <input class="seda-field" data-demo-live-prop="value" type="search" value="${escapeHtml(propsState.value)}" placeholder="Search" ${disabled ? "disabled" : ""} />
          ${propsState.state === "loading" ? `<span class="field-affix" aria-hidden="true">…</span>` : propsState.clearButton ? `<button class="field-clear" type="button" data-demo-clear="value" aria-label="Clear">×</button>` : ""}
        </div>
      </div>
    `;
  },
};

function renderGenericDemo(name) {
  const branch = components[name] || {};
  const state = propsState.state || "default";
  const tone = propsState.tone || "neutral";
  const size = propsState.size || "medium";
  const label = propsState.label || titleCase(name);
  const css = genericVars(name, branch, state, tone, size);
  const badge = `<div class="source-row"><span class="source-badge is-custom">Needs Figma parity check</span></div>`;

  const map = {
    alert: () => `${badge}<div class="seda-alert" style="${css}"><span class="demo-icon">!</span><div><strong>${escapeHtml(label)}</strong><p>Check the message before continuing.</p></div></div>`,
    avatar: () => `${badge}<div class="demo-row"><div class="seda-avatar" style="${css}">SA</div><div class="seda-avatar is-small" style="${css}">A</div></div>`,
    badge: () => `${badge}<span class="seda-badge" style="${css}">${escapeHtml(label)}</span>`,
    breadcrumbs: () => `${badge}<nav class="seda-breadcrumbs" style="${css}"><a>Projects</a><span>/</span><a>SEDA AI</a><span>/</span><strong>${escapeHtml(label)}</strong></nav>`,
    "button-group": () => `${badge}<div class="button-row">${["One", "Two", "Three"].map((item) => `<button class="seda-button" style="${buttonStyleFor(components.button?.neutral?.outline, "m")}">${item}</button>`).join("")}</div>`,
    card: () => `${badge}<article class="seda-card-demo" style="${css}"><h3>${escapeHtml(label)}</h3><p>Reusable surface with content, actions, and metadata.</p></article>`,
    checkbox: () => `${badge}<label class="seda-choice" style="${css}"><span class="choice-box">${propsState.checked ? "✓" : ""}</span>${escapeHtml(label)}</label>`,
    "chat-bubble": () => `${badge}<div class="seda-chat" style="${css}"><p>${escapeHtml(label)} response generated from the selected context.</p></div>`,
    "color-picker": () => `${badge}<div class="seda-color-picker" style="${css}"><span style="background:${escapeHtml(propsState.value || "#0072f5")}"></span><input value="${escapeHtml(propsState.value || "#0072f5")}" readonly /></div>`,
    container: () => `${badge}<div class="seda-container-demo" style="${css}">Container content area</div>`,
    "date-picker": () => `${badge}${renderGenericField("Date", propsState.value || "2026-05-12", css)}`,
    "description-list": () => `${badge}<dl class="seda-description-list" style="${css}"><dt>Status</dt><dd>Ready</dd><dt>Owner</dt><dd>Design system</dd></dl>`,
    divider: () => `${badge}<div class="seda-divider" style="${css}"></div>`,
    drawer: () => `${badge}<aside class="seda-drawer-demo" style="${css}"><h3>${escapeHtml(label)}</h3><p>Panel content and actions.</p></aside>`,
    "dropdown-menu": () => `${badge}<div class="seda-menu-demo" style="${css}">${["Edit", "Duplicate", "Archive"].map((item) => `<button>${item}</button>`).join("")}</div>`,
    "empty-state": () => `${badge}<div class="seda-empty-demo" style="${css}"><div class="demo-illustration"></div><h3>${escapeHtml(label)}</h3><p>No data to show yet.</p></div>`,
    "file-upload": () => `${badge}<div class="seda-file-upload" style="${css}"><strong>${escapeHtml(label)}</strong><span>Drop file here or browse</span></div>`,
    form: () => `${badge}<form class="seda-form-demo" style="${css}">${renderGenericField("Name", "SEDA AI", "")}${renderGenericField("Status", "Ready", "")}</form>`,
    grid: () => `${badge}<div class="seda-grid-demo" style="${css}"><span></span><span></span><span></span><span></span></div>`,
    "icon-button": () => `${badge}<button class="seda-icon-button" style="${css}" aria-label="${escapeHtml(label)}">⌘</button>`,
    link: () => `${badge}<a class="seda-link-demo" style="${css}" href="#">${escapeHtml(label)}</a>`,
    "notification-center": () => `${badge}<div class="seda-notification-demo" style="${css}"><h3>${escapeHtml(label)}</h3><div>Model run finished</div><div>Dataset sync required</div></div>`,
    pagination: () => `${badge}<div class="seda-pagination" style="${css}"><button>‹</button><button>1</button><button aria-current="page">2</button><button>3</button><button>›</button></div>`,
    popover: () => `${badge}<div class="seda-popover-demo" style="${css}"><h3>${escapeHtml(label)}</h3><p>Contextual content attached to a trigger.</p></div>`,
    "progress-bar": () => `${badge}<div class="seda-progress-demo" style="${css}"><div><span></span></div><strong>64%</strong></div>`,
    radio: () => `${badge}<label class="seda-choice" style="${css}"><span class="choice-box is-radio">${propsState.checked ? "•" : ""}</span>${escapeHtml(label)}</label>`,
    search: () => `${badge}${renderGenericField("Search", propsState.value || "Dataset", css)}`,
    "segmented-control": () => `${badge}<div class="seda-segmented" style="${css}"><button aria-pressed="true">List</button><button>Board</button><button>Chart</button></div>`,
    sidebar: () => `${badge}<aside class="seda-sidebar-demo" style="${css}"><strong>SEDA AI</strong><a>Overview</a><a aria-current="page">Components</a><a>Tokens</a></aside>`,
    skeleton: () => `${badge}<div class="seda-skeleton-demo" style="${css}"><span></span><span></span><span></span></div>`,
    slider: () => `${badge}<div class="seda-slider-demo" style="${css}"><span></span></div>`,
    spinner: () => `${badge}<div class="seda-spinner-demo" style="${css}"></div>`,
    "stat-metric": () => `${badge}<div class="seda-stat-demo" style="${css}"><span>${escapeHtml(label)}</span><strong>98.4%</strong><em>+12%</em></div>`,
    stepper: () => `${badge}<div class="seda-stepper" style="${css}"><span>1</span><b></b><span aria-current="step">2</span><b></b><span>3</span></div>`,
    tag: () => `${badge}<span class="seda-tag-demo" style="${css}">${escapeHtml(label)}</span>`,
    timeline: () => `${badge}<div class="seda-timeline" style="${css}"><div><b></b><span>Created</span></div><div><b></b><span>Reviewed</span></div><div><b></b><span>Ready</span></div></div>`,
    "time-picker": () => `${badge}${renderGenericField("Time", propsState.value || "14:30", css)}`,
    toast: () => `${badge}<div class="seda-toast-demo" style="${css}"><strong>${escapeHtml(label)}</strong><p>Changes were saved.</p></div>`,
    toggle: () => `${badge}<button class="seda-toggle-demo ${propsState.checked ? "is-on" : ""}" style="${css}"><span></span></button>`,
    tooltip: () => `${badge}<div class="seda-tooltip-demo" style="${css}">${escapeHtml(label)}</div>`,
    "top-bar": () => `${badge}<header class="seda-topbar-demo" style="${css}"><strong>SEDA AI</strong><nav><a>Docs</a><a>Lab</a></nav></header>`,
    "verification-code": () => `${badge}<div class="seda-code-demo" style="${css}">${String(propsState.value || "123456").slice(0, 6).padEnd(6, "0").split("").map((char) => `<span>${escapeHtml(char)}</span>`).join("")}</div>`,
  };

  const content = (map[name] || (() => `${badge}<div class="seda-card-demo" style="${css}"><h3>${escapeHtml(label)}</h3><p>Live demo generated from component tokens.</p></div>`))();
  return `<div class="preview-card">${content}</div>`;
}

function renderGenericField(label, value, css) {
  return `<label class="generic-field" style="${css}"><span>${escapeHtml(label)}</span><input value="${escapeHtml(value)}" readonly /></label>`;
}

function sampleValue(name) {
  const values = {
    "date-picker": "2026-05-12",
    "time-picker": "14:30",
    search: "Dataset",
    "color-picker": "#0072f5",
    "verification-code": "123456",
  };
  return values[name] || "";
}


function renderField(kind, branch, state, label, placeholder, value) {
  const css = fieldVars(branch, state, propsState.size || "medium", kind);
  const disabled = state === "disabled" || state === "loading";
  const readOnly = state === "read-only";
  const sizeClass = `size-${propsState.size || "medium"}`;
  const required = propsState.required ? ` <span aria-hidden="true">*</span>` : "";
  const prefix = propsState.prefixIcon ? `<span class="field-affix" aria-hidden="true">⌕</span>` : "";
  const suffix = propsState.suffixIcon ? `<span class="field-affix" aria-hidden="true">${state === "loading" ? "…" : "i"}</span>` : "";
  const clear = propsState.clearButton ? `<button class="field-clear" type="button" data-demo-clear="value" aria-label="Очистить">×</button>` : "";
  const helper = helperText(state, propsState.helper);
  const input = kind === "textarea"
    ? `<textarea class="seda-textarea ${sizeClass}" data-demo-live-prop="value" placeholder="${escapeHtml(placeholder)}" ${disabled ? "disabled" : ""} ${readOnly ? "readonly" : ""} ${propsState.resize ? "" : `style="resize:none"`}>${escapeHtml(value)}</textarea>`
    : `<div class="field-shell ${sizeClass}">${prefix}<input class="seda-field" data-demo-live-prop="value" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}" ${disabled ? "disabled" : ""} ${readOnly ? "readonly" : ""} />${suffix}${clear}</div>`;
  const counter = kind === "textarea" && propsState.counter ? `<div class="field-counter">${String(value || "").length}/500</div>` : "";
  const labelRow = kind === "textarea"
    ? `<div class="field-label-row"><label class="field-label">${escapeHtml(label)}${required}</label>${propsState.clearButton ? `<button class="field-label-action" type="button" data-demo-clear="value">Clear</button>` : ""}</div>`
    : `<label class="field-label">${escapeHtml(label)}${required}</label>`;
  return `<div class="preview-card field-demo" style="${css}">${labelRow}${input}<div class="field-meta"><div class="field-helper">${escapeHtml(helper)}</div>${counter}</div></div>`;
}

function helperText(state, fallback = "") {
  if (state === "error") return "Нужно исправить значение";
  if (state === "warning") return "Проверьте значение";
  if (state === "success") return "Значение принято";
  if (state === "loading") return "Проверяем значение...";
  if (state === "read-only") return "Только для чтения";
  return fallback || "Подсказка под полем";
}

function renderSelectMenu() {
  const options = ["Draft", "In review", "Ready"];
  return `
    <div class="select-menu" role="listbox">
      ${options.map((option) => `<button class="select-option" type="button" data-demo-set="value:${escapeHtml(option)}" aria-selected="${option === propsState.value}">${escapeHtml(option)}</button>`).join("")}
    </div>
  `;
}

function renderDateTimePicker(name) {
  const isDate = name === "date-picker";
  const branch = components[name]?.trigger || components[name] || components["text-field"];
  const state = propsState.state;
  const disabled = state === "disabled";
  const css = fieldVars(branch, state, propsState.size || "m", "input");
  const required = propsState.required ? ` <span aria-hidden="true">*</span>` : "";
  const options = isDate ? ["12.05.2026", "13.05.2026", "14.05.2026"] : ["09:00", "14:30", "18:45"];
  const pickerPanel = isDate ? renderCalendarPanel(options) : renderTimePanel(options);

  return `
    <div class="preview-card field-demo" style="${css}">
      <label class="field-label">${escapeHtml(propsState.label)}${required}</label>
      <div class="field-shell size-${propsState.size || "m"}">
        <input class="seda-field" data-demo-live-prop="value" value="${escapeHtml(propsState.value)}" placeholder="${escapeHtml(propsState.placeholder)}" ${disabled ? "disabled" : ""} />
        <button class="field-clear" type="button" data-demo-toggle="open" aria-label="${isDate ? "Открыть календарь" : "Открыть выбор времени"}" ${disabled ? "disabled" : ""}>${isDate ? "□" : "◷"}</button>
      </div>
      <div class="field-helper">${escapeHtml(helperText(state, propsState.helper))}</div>
      ${propsState.open ? pickerPanel : ""}
    </div>
  `;
}

function renderCalendarPanel(options) {
  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const days = Array.from({ length: 35 }, (_, index) => index + 1);
  return `
    <div class="picker-panel calendar-panel" role="dialog" aria-label="Календарь">
      <div class="picker-header">
        <button type="button" aria-label="Предыдущий месяц">‹</button>
        <strong>Май 2026</strong>
        <button type="button" aria-label="Следующий месяц">›</button>
      </div>
      <div class="calendar-grid is-weekdays">${weekdays.map((day) => `<span>${day}</span>`).join("")}</div>
      <div class="calendar-grid">
        ${days.map((day) => {
          const value = `${String(day).padStart(2, "0")}.05.2026`;
          const selected = value === propsState.value;
          return `<button type="button" data-demo-prop="value" data-demo-value="${value}" aria-selected="${selected}">${day}</button>`;
        }).join("")}
      </div>
      <div class="picker-shortcuts">
        ${options.map((option) => `<button type="button" data-demo-prop="value" data-demo-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}
      </div>
    </div>
  `;
}

function renderTimePanel(options) {
  return `
    <div class="picker-panel time-panel" role="listbox" aria-label="Выбор времени">
      ${options.map((option) => `<button type="button" data-demo-prop="value" data-demo-value="${escapeHtml(option)}" aria-selected="${option === propsState.value}">${escapeHtml(option)}</button>`).join("")}
    </div>
  `;
}

function buttonStyleFor(branch, size = "m", state = "default") {
  const surfaceState = tokenStateFor(branch?.surface, state);
  const foregroundState = tokenStateFor(branch?.foreground, state);
  const borderState = tokenStateFor(branch?.border, state);
  const type = controlTypeVars(size);
  const box = controlBoxVars("button", size);
  return styleVars({
    "--button-surface": tokenValue(branch?.surface?.[surfaceState]) || tokenValue(branch?.surface?.default) || "var(--container-brand-default)",
    "--button-surface-hover": tokenValue(branch?.surface?.hover) || tokenValue(branch?.surface?.default) || "var(--container-brand-hover)",
    "--button-foreground": tokenValue(branch?.foreground?.[foregroundState]) || tokenValue(branch?.foreground?.default) || "var(--text-on-brand-primary)",
    "--button-border": tokenValue(branch?.border?.[borderState]) || tokenValue(branch?.border?.default) || tokenValue(branch?.surface?.default) || "transparent",
    "--button-width": "auto",
    "--button-height": box.height,
    "--button-padding-x": box.paddingX,
    "--button-padding-y": box.paddingY,
    "--button-gap": box.gap,
    "--button-radius": box.radius,
    "--button-border-width": box.borderWidth,
    "--button-font-size": type.size,
    "--button-line-height": type.lineHeight,
    "--button-font-weight": type.weight,
    "--button-letter-spacing": type.letterSpacing,
  });
}

function iconButtonStyleFor(branch, size = "m", state = "default") {
  const mappedState = tokenStateFor(branch?.surface, state);
  const foregroundState = tokenStateFor(branch?.foreground, state);
  const borderState = tokenStateFor(branch?.border, state);
  const box = controlBoxVars("icon-button", size);
  return styleVars({
    "--generic-surface": tokenValue(branch?.surface?.[mappedState]) || tokenValue(branch?.surface?.default) || "transparent",
    "--generic-surface-alt": tokenValue(branch?.surface?.hover) || tokenValue(branch?.surface?.selected) || "var(--container-neutral-hover)",
    "--generic-foreground": tokenValue(branch?.foreground?.[foregroundState]) || tokenValue(branch?.foreground?.default) || "var(--icon-primary)",
    "--generic-border": tokenValue(branch?.border?.[borderState]) || tokenValue(branch?.border?.default) || "transparent",
    "--generic-height": box.height,
    "--generic-padding-x": box.paddingX,
    "--generic-padding-y": box.paddingY,
    "--generic-radius": box.radius,
    "--generic-border-width": state === "focus" ? `${borderWidthValue("m")}px` : box.borderWidth,
    "--icon-button-icon-size": box.iconSize,
  });
}

function choiceVars(branch, state, kind, size = "m") {
  const selectedState = kind === "radio" ? "selected" : "checked";
  const visualState = state === "indeterminate" ? "indeterminate" : state;
  const control = branch?.control || {};
  const box = controlBoxVars(kind, size);
  const type = controlTypeVars(size);
  return styleVars({
    "--choice-control-surface": tokenValue(control.surface?.[visualState]) || tokenValue(control.surface?.default) || "var(--surface-base)",
    "--choice-control-border": tokenValue(control.border?.[visualState]) || tokenValue(control.border?.default) || "var(--border-default)",
    "--choice-control-mark": tokenValue(control.icon?.[visualState]) || tokenValue(control.dot?.[visualState]) || tokenValue(control.icon?.[selectedState]) || tokenValue(control.dot?.selected) || "var(--text-on-brand-primary)",
    "--choice-label": tokenValue(branch?.label?.[visualState]) || tokenValue(branch?.label?.default) || "var(--text-primary)",
    "--choice-helper": tokenValue(branch?.helper?.[visualState]) || tokenValue(branch?.helper?.default) || "var(--text-tertiary)",
    "--choice-size": box.height,
    "--choice-mark-size": box.iconSize,
    "--choice-radius": box.radius,
    "--choice-border-width": box.borderWidth,
    "--choice-gap": box.gap,
    "--choice-font-size": type.size,
    "--choice-line-height": type.lineHeight,
    "--choice-font-weight": type.weight,
  });
}

function toggleVars(branch, state, checked, size = "m") {
  const mode = checked ? "on" : "off";
  const visualState = state === "disabled" ? "disabled" : tokenStateFor(branch?.track?.[mode], state);
  const box = controlBoxVars("toggle", size);
  const type = controlTypeVars(size);
  return styleVars({
    "--toggle-track": tokenValue(state === "disabled" ? branch?.track?.disabled : null) || tokenValue(branch?.track?.[mode]?.[visualState]) || tokenValue(branch?.track?.[mode]?.default) || "var(--container-neutral-default)",
    "--toggle-thumb": tokenValue(branch?.thumb?.[state]) || tokenValue(branch?.thumb?.default) || "var(--surface-base)",
    "--toggle-label": tokenValue(branch?.label?.[state]) || tokenValue(branch?.label?.default) || "var(--text-primary)",
    "--toggle-helper": tokenValue(branch?.helper?.[state]) || tokenValue(branch?.helper?.default) || "var(--text-tertiary)",
    "--toggle-width": box.width,
    "--toggle-height": box.height,
    "--toggle-thumb-size": box.iconSize,
    "--toggle-padding": box.paddingX,
    "--toggle-gap": box.gap,
    "--toggle-font-size": type.size,
    "--toggle-line-height": type.lineHeight,
    "--toggle-font-weight": type.weight,
  });
}

function segmentedVars(branch, size, state) {
  const box = controlBoxVars("segmented", size);
  const segmentState = tokenStateFor(branch?.segment?.surface, state);
  return styleVars({
    "--segmented-surface": tokenValue(branch?.surface?.default) || "var(--container-neutral-default)",
    "--segmented-border": tokenValue(branch?.border?.default) || "var(--border-default)",
    "--segment-surface": tokenValue(branch?.segment?.surface?.[segmentState]) || tokenValue(branch?.segment?.surface?.default) || "transparent",
    "--segment-surface-selected": tokenValue(branch?.segment?.surface?.selected) || "var(--surface-base)",
    "--segment-foreground": tokenValue(branch?.segment?.foreground?.[segmentState]) || tokenValue(branch?.segment?.foreground?.default) || "var(--text-secondary)",
    "--segment-foreground-selected": tokenValue(branch?.segment?.foreground?.selected) || "var(--text-primary)",
    "--segmented-height": box.height,
    "--segmented-padding": box.paddingX,
    "--segmented-gap": box.gap,
    "--segmented-radius": box.radius,
    "--segmented-border-width": box.borderWidth,
    "--segmented-font-size": controlTypeVars(size).size,
    "--segmented-line-height": controlTypeVars(size).lineHeight,
  });
}

function avatarVars(branch, variant, size, state, status) {
  const box = controlBoxVars("avatar", size);
  const surfaceKey = state === "disabled" ? "disabled" : variant;
  const foregroundKey = state === "disabled" ? "disabled" : variant === "brand" ? "onBrand" : variant === "ai" ? "onAi" : "fallback";
  return styleVars({
    "--avatar-size": box.height,
    "--avatar-radius": box.radius,
    "--avatar-surface": tokenValue(branch?.surface?.[surfaceKey]) || tokenValue(branch?.surface?.default) || "var(--container-neutral-default)",
    "--avatar-foreground": tokenValue(branch?.foreground?.[foregroundKey]) || tokenValue(branch?.foreground?.fallback) || "var(--text-secondary)",
    "--avatar-border": tokenValue(branch?.border?.[state]) || tokenValue(branch?.border?.default) || "var(--surface-base)",
    "--avatar-border-width": state === "selected" || state === "focus" ? `${borderWidthValue("l")}px` : `${borderWidthValue("m")}px`,
    "--avatar-status": tokenValue(branch?.status?.[status]) || "transparent",
    "--avatar-font-size": controlTypeVars(size).size,
    "--avatar-font-weight": "500",
  });
}

function tonePillVars(branch, tone, kind) {
  const box = controlBoxVars(kind, "medium");
  const type = controlTypeVars("small");
  return styleVars({
    "--pill-surface": tokenValue(branch?.surface?.[tone]) || tokenValue(branch?.surface?.neutral) || "var(--container-neutral-default)",
    "--pill-foreground": tokenValue(branch?.foreground?.[tone]) || tokenValue(branch?.foreground?.neutral) || "var(--text-primary)",
    "--pill-border": tokenValue(branch?.border?.[tone]) || tokenValue(branch?.border?.neutral) || "var(--border-default)",
    "--pill-icon": tokenValue(branch?.icon?.[tone]) || tokenValue(branch?.icon?.neutral) || "var(--icon-secondary)",
    "--pill-height": box.height,
    "--pill-padding-x": box.paddingX,
    "--pill-gap": box.gap,
    "--pill-radius": box.radius,
    "--pill-border-width": box.borderWidth,
    "--pill-font-size": type.size,
    "--pill-line-height": type.lineHeight,
    "--pill-font-weight": type.weight,
  });
}

function cardVars(branch, state) {
  const box = controlBoxVars("card", "medium");
  return styleVars({
    "--card-surface": tokenValue(branch?.surface?.[state]) || tokenValue(branch?.surface?.default) || "var(--surface-base)",
    "--card-border": tokenValue(branch?.border?.[state]) || tokenValue(branch?.border?.default) || "var(--border-default)",
    "--card-title": tokenValue(branch?.title?.foreground) || "var(--text-primary)",
    "--card-description": tokenValue(branch?.description?.foreground) || "var(--text-secondary)",
    "--card-meta": tokenValue(branch?.metadata?.foreground) || "var(--text-tertiary)",
    "--card-padding": box.paddingX,
    "--card-gap": box.gap,
    "--card-radius": box.radius,
    "--card-border-width": box.borderWidth,
  });
}

function fieldVars(branch, state, size = "medium", kind = "input") {
  const surfaceState = tokenStateFor(branch?.surface, state);
  const borderState = tokenStateFor(branch?.border, state);
  const type = controlTypeVars(size);
  const box = controlBoxVars(kind === "textarea" ? "textarea" : "field", size);
  return styleVars({
    "--field-surface": tokenValue(branch?.surface?.[surfaceState]) || tokenValue(branch?.surface?.default) || "var(--surface-base)",
    "--field-border": tokenValue(branch?.border?.[borderState]) || tokenValue(branch?.border?.default) || "var(--border-default)",
    "--field-foreground": tokenValue(branch?.foreground?.[tokenStateFor(branch?.foreground, state)]) || tokenValue(branch?.foreground?.default) || "var(--text-primary)",
    "--field-icon": tokenValue(branch?.icon?.[tokenStateFor(branch?.icon, state)]) || tokenValue(branch?.arrow?.[tokenStateFor(branch?.arrow, state)]) || tokenValue(branch?.icon?.default) || tokenValue(branch?.arrow?.default) || "var(--text-tertiary)",
    "--field-label": tokenValue(branch?.label?.[tokenStateFor(branch?.label, state)]) || tokenValue(branch?.label?.default) || "var(--text-secondary)",
    "--field-helper": tokenValue(branch?.helper?.[tokenStateFor(branch?.helper, state)]) || tokenValue(branch?.helper?.default) || "var(--text-tertiary)",
    "--select-menu-surface": tokenValue(branch?.dropdown?.surface) || "var(--surface-overlay)",
    "--select-menu-border": tokenValue(branch?.dropdown?.border) || "var(--border-default)",
    "--select-option-surface": tokenValue(branch?.option?.surface?.default) || "transparent",
    "--select-option-surface-hover": tokenValue(branch?.option?.surface?.hover) || "var(--container-neutral-hover)",
    "--select-option-surface-selected": tokenValue(branch?.option?.surface?.selected) || "var(--container-brand-default)",
    "--select-option-foreground": tokenValue(branch?.option?.foreground?.default) || "var(--text-primary)",
    "--select-option-foreground-selected": tokenValue(branch?.option?.foreground?.selected) || "var(--text-on-brand-primary)",
    "--field-height": box.height,
    "--field-min-height": box.minHeight || box.height,
    "--field-padding-x": box.paddingX,
    "--field-padding-y": box.paddingY,
    "--field-gap": box.gap,
    "--field-radius": box.radius,
    "--field-border-width": box.borderWidth,
    "--field-font-size": type.size,
    "--field-line-height": type.lineHeight,
    "--field-font-weight": type.weight,
    "--field-letter-spacing": type.letterSpacing,
    "--field-label-font-size": type.size,
    "--field-label-line-height": type.lineHeight,
    "--field-label-font-weight": type.weight,
    "--field-helper-font-size": type.size,
    "--field-helper-line-height": type.lineHeight,
  });
}

function accordionVars(branch, variant, triggerState, disabled) {
  const state = disabled ? "disabled" : triggerState;
  const triggerType = controlTypeVars("medium");
  const box = controlBoxVars("accordion", "medium");
  return styleVars({
    "--accordion-surface": tokenValue(branch?.surface?.[variant]) || tokenValue(branch?.surface?.default) || "transparent",
    "--accordion-border": tokenValue(branch?.border?.[disabled ? "disabled" : variant]) || tokenValue(branch?.border?.default) || "var(--border-default)",
    "--accordion-panel-surface": tokenValue(branch?.panel?.surface?.[variant]) || tokenValue(branch?.panel?.surface?.default) || "var(--surface-base)",
    "--accordion-panel-border": tokenValue(branch?.panel?.border?.[variant]) || tokenValue(branch?.panel?.border?.default) || "var(--border-subtle)",
    "--accordion-panel-foreground": tokenValue(branch?.panel?.foreground?.default) || "var(--text-secondary)",
    "--accordion-trigger-surface": tokenValue(branch?.trigger?.surface?.[state]) || tokenValue(branch?.trigger?.surface?.default) || "transparent",
    "--accordion-trigger-foreground": tokenValue(branch?.trigger?.foreground?.[state]) || tokenValue(branch?.trigger?.foreground?.default) || "var(--text-primary)",
    "--accordion-trigger-height": box.height,
    "--accordion-padding-x": box.paddingX,
    "--accordion-panel-padding": box.panelPadding,
    "--accordion-radius": box.radius,
    "--accordion-border-width": box.borderWidth,
    "--accordion-font-size": triggerType.size,
    "--accordion-line-height": triggerType.lineHeight,
    "--accordion-font-weight": triggerType.weight,
  });
}

function tabsVars(branch, variant, size) {
  const group = variant === "pill" ? branch?.pill : branch?.item;
  const box = controlBoxVars("tabs", size || "medium");
  const type = controlTypeVars(size || "medium");
  const tabRadius = variant === "pill" ? "999px" : "0px";
  const indicatorWidth = variant === "pill" ? "0px" : box.indicatorWidth;
  return styleVars({
    "--tabs-list-border": tokenValue(branch?.list?.border) || "var(--border-subtle)",
    "--tabs-list-divider": tokenValue(branch?.list?.divider) || "var(--border-subtle)",
    "--tab-surface": tokenValue(group?.surface?.default) || "transparent",
    "--tab-surface-hover": tokenValue(group?.surface?.hover) || "var(--container-neutral-hover)",
    "--tab-surface-active": tokenValue(group?.surface?.active) || "var(--container-neutral-pressed)",
    "--tab-surface-selected": tokenValue(group?.surface?.selected) || "transparent",
    "--tab-border": tokenValue(group?.border?.default) || "transparent",
    "--tab-border-hover": tokenValue(group?.border?.hover) || "transparent",
    "--tab-border-selected": tokenValue(group?.border?.selected) || tokenValue(branch?.indicator?.selected) || "var(--border-focus)",
    "--tab-foreground": tokenValue(group?.foreground?.default) || "var(--text-tertiary)",
    "--tab-foreground-hover": tokenValue(group?.foreground?.hover) || "var(--text-secondary)",
    "--tab-foreground-selected": tokenValue(group?.foreground?.selected) || "var(--text-primary)",
    "--tab-foreground-disabled": tokenValue(group?.foreground?.disabled) || "var(--text-muted)",
    "--tab-badge-surface": tokenValue(branch?.badge?.surface?.default) || "var(--container-neutral-default)",
    "--tab-badge-surface-selected": tokenValue(branch?.badge?.surface?.selected) || "var(--container-brand-default)",
    "--tab-badge-foreground": tokenValue(branch?.badge?.foreground?.default) || "var(--text-secondary)",
    "--tab-badge-foreground-selected": tokenValue(branch?.badge?.foreground?.selected) || "var(--text-on-brand-primary)",
    "--tabs-gap": box.gap,
    "--tab-height": box.height,
    "--tab-padding-x": box.paddingX,
    "--tab-radius": tabRadius,
    "--tab-border-width": box.borderWidth,
    "--tab-indicator-width": indicatorWidth,
    "--tab-font-size": type.size,
    "--tab-line-height": type.lineHeight,
    "--tab-font-weight": type.weight,
  });
}

function tableVars(branch, density) {
  const box = controlBoxVars("table", density);
  const bodyType = controlTypeVars(density === "compact" ? "small" : "medium");
  const headType = controlTypeVars("small");
  return styleVars({
    "--table-surface": tokenValue(branch?.surface?.default) || "var(--surface-base)",
    "--table-border": tokenValue(branch?.border?.default) || "var(--border-default)",
    "--table-divider": tokenValue(branch?.divider?.default) || "var(--border-subtle)",
    "--table-header-surface": tokenValue(branch?.header?.surface?.default) || "var(--surface-subtle)",
    "--table-header-foreground": tokenValue(branch?.header?.foreground?.default) || "var(--text-secondary)",
    "--table-row-surface": tokenValue(branch?.row?.surface?.default) || "var(--surface-base)",
    "--table-row-striped": tokenValue(branch?.row?.surface?.striped) || "var(--surface-subtle)",
    "--table-row-selected": tokenValue(branch?.row?.surface?.selected) || "var(--container-neutral-selected)",
    "--table-cell-foreground": tokenValue(branch?.cell?.foreground?.default) || "var(--text-primary)",
    "--table-cell-padding-x": box.paddingX,
    "--table-cell-padding-y": box.paddingY,
    "--table-radius": box.radius,
    "--table-border-width": box.borderWidth,
    "--table-font-size": bodyType.size,
    "--table-line-height": bodyType.lineHeight,
    "--table-font-weight": bodyType.weight,
    "--table-header-font-size": headType.size,
    "--table-header-line-height": headType.lineHeight,
    "--table-header-font-weight": headType.weight,
  });
}

function tableRowClass(index) {
  const classes = [];
  if (index === 1 && propsState.selectedRow) classes.push("is-selected");
  if (index % 2 === 1 && propsState.striped) classes.push("is-striped");
  return classes.join(" ");
}

function modalVars(branch, size, width) {
  const map = {
    small: { padding: "2xl", gap: "xl", radius: "m" },
    medium: { padding: "3xl", gap: "2xl", radius: "l" },
    large: { padding: "4xl", gap: "2xl", radius: "l" },
  };
  const config = map[size] || map.medium;
  return styleVars({
    "--modal-width": `min(${width}, 100%)`,
    "--modal-surface": tokenValue(branch?.surface?.default) || "var(--surface-overlay)",
    "--modal-border": tokenValue(branch?.border?.default) || "var(--border-default)",
    "--modal-title-foreground": tokenValue(branch?.title?.foreground) || "var(--text-primary)",
    "--modal-description-foreground": tokenValue(branch?.description?.foreground) || "var(--text-secondary)",
    "--modal-close-icon": tokenValue(branch?.close?.icon?.default) || "var(--text-tertiary)",
    "--modal-close-surface-hover": tokenValue(branch?.close?.surface?.hover) || "var(--container-neutral-hover)",
    "--modal-padding": `${spaceValue(config.padding)}px`,
    "--modal-gap": `${spaceValue(config.gap)}px`,
    "--modal-radius": `${radiusValue(config.radius)}px`,
    "--modal-border-width": `${borderWidthValue("m")}px`,
  });
}

function alertVars(branch, tone) {
  return styleVars({
    "--alert-surface": tokenValue(branch?.surface?.[tone]) || tokenValue(branch?.surface?.neutral) || "var(--surface-subtle)",
    "--alert-border": tokenValue(branch?.border?.[tone]) || tokenValue(branch?.border?.neutral) || "var(--border-default)",
    "--alert-title": tokenValue(branch?.title?.foreground?.[tone]) || tokenValue(branch?.title?.foreground?.default) || "var(--text-primary)",
    "--alert-description": tokenValue(branch?.description?.foreground?.[tone]) || tokenValue(branch?.description?.foreground?.default) || "var(--text-secondary)",
    "--alert-icon": tokenValue(branch?.icon?.[tone]) || tokenValue(branch?.icon?.default) || "var(--container-brand-default)",
    "--alert-action": tokenValue(branch?.action?.foreground?.default) || "var(--container-brand-default)",
    "--alert-close": tokenValue(branch?.close?.icon?.default) || "var(--text-tertiary)",
  });
}

function toastVars(branch, tone) {
  const isStatus = tone && tone !== "default";
  return styleVars({
    "--toast-surface": tokenValue(branch?.surface?.[tone]) || tokenValue(branch?.surface?.default) || "var(--surface-inverse)",
    "--toast-foreground": tokenValue(isStatus ? branch?.foreground?.onStatus : branch?.foreground?.default) || "var(--text-on-brand-primary)",
    "--toast-description": tokenValue(isStatus ? branch?.foreground?.onStatus : branch?.foreground?.secondary) || "var(--text-on-brand-primary)",
    "--toast-icon": tokenValue(branch?.icon?.[tone]) || tokenValue(branch?.icon?.default) || "currentColor",
    "--toast-action": tokenValue(branch?.action?.foreground?.default) || "currentColor",
    "--toast-close": tokenValue(branch?.close?.icon?.default) || "currentColor",
  });
}

function tooltipVars(branch, variant) {
  const group = branch?.[variant] || branch?.dark || {};
  return styleVars({
    "--tooltip-surface": tokenValue(group.surface) || "var(--surface-inverse)",
    "--tooltip-foreground": tokenValue(group.foreground) || "var(--surface-base)",
    "--tooltip-border": tokenValue(group.border) || "transparent",
    "--tooltip-arrow": tokenValue(branch?.arrow?.[variant]) || tokenValue(group.surface) || "var(--surface-inverse)",
  });
}

function popoverVars(branch) {
  return styleVars({
    "--popover-surface": tokenValue(branch?.surface?.default) || "var(--surface-overlay)",
    "--popover-border": tokenValue(branch?.border?.default) || "var(--border-default)",
    "--popover-title": tokenValue(branch?.title?.foreground) || "var(--text-primary)",
    "--popover-description": tokenValue(branch?.description?.foreground) || "var(--text-secondary)",
    "--popover-close": tokenValue(branch?.close?.icon?.default) || "var(--text-tertiary)",
    "--popover-close-hover": tokenValue(branch?.close?.surface?.hover) || "var(--container-neutral-hover)",
  });
}

function progressVars(branch, tone) {
  const disabled = tone === "disabled";
  return styleVars({
    "--progress-track": tokenValue(branch?.track?.[disabled ? "disabled" : "default"]) || "var(--container-neutral-default)",
    "--progress-fill": tokenValue(branch?.fill?.[tone]) || tokenValue(branch?.fill?.default) || "var(--container-brand-default)",
    "--progress-label": tokenValue(branch?.label?.[disabled ? "disabled" : "foreground"]) || "var(--text-secondary)",
    "--progress-value": tokenValue(branch?.value?.[disabled ? "disabled" : "foreground"]) || "var(--text-primary)",
  });
}

function spinnerVars(branch, tone, size) {
  const box = controlBoxVars("spinner", size);
  return styleVars({
    "--spinner-track": tokenValue(branch?.track?.[tone]) || tokenValue(branch?.track?.default) || "var(--border-default)",
    "--spinner-fill": tokenValue(branch?.fill?.[tone]) || tokenValue(branch?.fill?.default) || "var(--container-brand-default)",
    "--spinner-size": box.height,
    "--spinner-width": box.borderWidth,
  });
}

function skeletonVars(branch, animated) {
  return styleVars({
    "--skeleton-surface": tokenValue(branch?.surface?.default) || "var(--container-neutral-default)",
    "--skeleton-surface-subtle": tokenValue(branch?.surface?.subtle) || "var(--container-neutral-hover)",
    "--skeleton-shine": tokenValue(branch?.shine?.default) || "var(--surface-base)",
    "--skeleton-animation": animated ? "skeleton-shine 1200ms ease-in-out infinite" : "none",
  });
}

function emptyStateVars(branch) {
  return styleVars({
    "--empty-illustration": tokenValue(branch?.illustration?.foreground) || "var(--text-muted)",
    "--empty-accent": tokenValue(branch?.illustration?.accent) || "var(--container-brand-default)",
    "--empty-title": tokenValue(branch?.title?.foreground) || "var(--text-primary)",
    "--empty-description": tokenValue(branch?.description?.foreground) || "var(--text-secondary)",
    "--empty-action": tokenValue(branch?.action?.foreground) || "var(--container-brand-default)",
  });
}

function breadcrumbsVars(branch, state) {
  const itemState = state === "active" ? "active" : state;
  return styleVars({
    "--breadcrumb-surface": tokenValue(branch?.item?.surface?.[itemState]) || tokenValue(branch?.item?.surface?.default) || "transparent",
    "--breadcrumb-foreground": tokenValue(branch?.item?.foreground?.[itemState]) || tokenValue(branch?.item?.foreground?.default) || "var(--text-tertiary)",
    "--breadcrumb-current": tokenValue(branch?.item?.foreground?.current) || "var(--text-primary)",
    "--breadcrumb-separator": tokenValue(branch?.separator?.foreground) || "var(--text-muted)",
  });
}

function paginationVars(branch, state) {
  const itemState = state === "active" ? "active" : state;
  return styleVars({
    "--pagination-surface": tokenValue(branch?.item?.surface?.[itemState]) || tokenValue(branch?.item?.surface?.default) || "transparent",
    "--pagination-surface-selected": tokenValue(branch?.item?.surface?.selected) || "var(--container-brand-default)",
    "--pagination-foreground": tokenValue(branch?.item?.foreground?.[itemState]) || tokenValue(branch?.item?.foreground?.default) || "var(--text-secondary)",
    "--pagination-foreground-selected": tokenValue(branch?.item?.foreground?.selected) || "var(--text-on-brand-primary)",
    "--pagination-border": tokenValue(branch?.item?.border?.[itemState]) || tokenValue(branch?.item?.border?.default) || "transparent",
    "--pagination-border-selected": tokenValue(branch?.item?.border?.selected) || "var(--border-focus)",
  });
}

function stepperVars(branch, state) {
  return styleVars({
    "--stepper-current": tokenValue(branch?.indicator?.[state]) || tokenValue(branch?.indicator?.current) || "var(--container-brand-default)",
    "--stepper-current-icon": tokenValue(branch?.icon?.[state]) || tokenValue(branch?.icon?.current) || "var(--text-on-brand-primary)",
    "--stepper-completed": tokenValue(branch?.indicator?.completed) || "var(--container-brand-default)",
    "--stepper-completed-icon": tokenValue(branch?.icon?.completed) || "var(--text-on-brand-primary)",
    "--stepper-upcoming": tokenValue(branch?.indicator?.upcoming) || "var(--container-neutral-default)",
    "--stepper-upcoming-icon": tokenValue(branch?.icon?.upcoming) || "var(--text-tertiary)",
    "--stepper-connector": tokenValue(branch?.connector?.default) || "var(--border-default)",
    "--stepper-connector-completed": tokenValue(branch?.connector?.completed) || "var(--border-focus)",
    "--stepper-label-current": tokenValue(branch?.label?.[state]) || tokenValue(branch?.label?.current) || "var(--text-primary)",
    "--stepper-label-completed": tokenValue(branch?.label?.completed) || "var(--text-secondary)",
    "--stepper-label-upcoming": tokenValue(branch?.label?.upcoming) || "var(--text-tertiary)",
  });
}

function linkVars(branch, variant, state) {
  const group = branch?.[variant]?.foreground || branch?.default?.foreground || {};
  const nextState = state === "active" ? "pressed" : state;
  return styleVars({
    "--link-foreground": tokenValue(group?.[nextState]) || tokenValue(group?.default) || "var(--container-brand-default)",
    "--link-decoration": state === "hover" || state === "visitedHover" ? "underline" : "none",
  });
}

function sliderVars(branch, state) {
  const disabled = state === "disabled";
  const thumbState = state === "active" ? "active" : state === "hover" ? "hover" : disabled ? "disabled" : "border";
  return styleVars({
    "--slider-track": tokenValue(branch?.track?.[disabled ? "disabled" : "background"]) || "var(--container-neutral-default)",
    "--slider-fill": tokenValue(branch?.track?.[state === "hover" ? "hover" : disabled ? "disabled" : "fill"]) || "var(--container-brand-default)",
    "--slider-thumb": tokenValue(branch?.thumb?.[disabled ? "disabled" : "surface"]) || "var(--surface-base)",
    "--slider-thumb-border": tokenValue(branch?.thumb?.[thumbState]) || tokenValue(branch?.thumb?.border) || "var(--border-focus)",
    "--slider-label": tokenValue(branch?.label?.[disabled ? "disabled" : "foreground"]) || "var(--text-secondary)",
    "--slider-value": tokenValue(branch?.value?.[disabled ? "disabled" : "foreground"]) || "var(--text-primary)",
  });
}

function fileUploadVars(branch, state) {
  const nextState = state === "hover" ? "hover" : state;
  return styleVars({
    "--file-surface": tokenValue(branch?.surface?.[nextState]) || tokenValue(branch?.surface?.default) || "var(--surface-base)",
    "--file-border": tokenValue(branch?.border?.[nextState]) || tokenValue(branch?.border?.default) || "var(--border-default)",
    "--file-icon": tokenValue(branch?.icon?.[nextState]) || tokenValue(branch?.icon?.default) || "var(--text-tertiary)",
    "--file-title": tokenValue(branch?.foreground?.[state === "error" ? "error" : state === "disabled" ? "disabled" : "title"]) || "var(--text-primary)",
    "--file-description": tokenValue(branch?.foreground?.[state === "disabled" ? "disabled" : "default"]) || "var(--text-secondary)",
  });
}

function statusIcon(tone) {
  return {
    success: "✓",
    warning: "!",
    danger: "!",
    info: "i",
  }[tone] || "i";
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function stepperItem(state, label, completedConnector) {
  const current = state === "current" || state === "error" || state === "disabled";
  return `
    <li class="stepper-item is-${state} ${completedConnector ? "has-completed-connector" : ""}" ${current ? `aria-current="step"` : ""}>
      <span>${state === "completed" ? "✓" : state === "error" ? "!" : ""}</span>
      <strong>${escapeHtml(label)}</strong>
    </li>
  `;
}

function genericVars(name, branch, state, tone, size) {
  const type = controlTypeVars(size);
  const box = controlBoxVars("generic", size);
  const surfaceGroup = branch?.surface || branch?.container || branch?.track || branch?.background;
  const foregroundGroup = branch?.foreground || branch?.text || branch?.label || branch?.title;
  const borderGroup = branch?.border || branch?.divider || branch?.stroke;
  const toneSurface = surfaceGroup?.[tone]?.surface || surfaceGroup?.[tone];
  const toneForeground = foregroundGroup?.[tone]?.foreground || foregroundGroup?.[tone];
  const toneBorder = borderGroup?.[tone]?.border || borderGroup?.[tone];
  const stateSurface = surfaceGroup?.[tokenStateFor(surfaceGroup, state)];
  const stateForeground = foregroundGroup?.[tokenStateFor(foregroundGroup, state)];
  const stateBorder = borderGroup?.[tokenStateFor(borderGroup, state)];
  return styleVars({
    "--generic-surface": tokenValue(toneSurface) || tokenValue(stateSurface) || tokenValue(surfaceGroup?.default) || tokenValue(branch?.surface?.default?.surface) || "var(--surface-base)",
    "--generic-surface-alt": tokenValue(surfaceGroup?.hover) || tokenValue(branch?.row?.surface?.selected) || "var(--container-neutral-hover)",
    "--generic-foreground": tokenValue(toneForeground) || tokenValue(stateForeground) || tokenValue(foregroundGroup?.default) || tokenValue(branch?.title?.foreground) || "var(--text-primary)",
    "--generic-foreground-muted": tokenValue(branch?.description?.foreground) || tokenValue(branch?.subtitle?.foreground) || tokenValue(branch?.helper?.default) || "var(--text-secondary)",
    "--generic-border": tokenValue(toneBorder) || tokenValue(stateBorder) || tokenValue(borderGroup?.default) || "var(--border-default)",
    "--generic-accent": tokenValue(branch?.fill?.[tone]) || tokenValue(branch?.indicator?.selected) || tokenValue(branch?.selection?.control?.surface?.checked) || "var(--container-brand-default)",
    "--generic-height": box.height,
    "--generic-padding-x": box.paddingX,
    "--generic-padding-y": box.paddingY,
    "--generic-gap": box.gap,
    "--generic-radius": box.radius,
    "--generic-border-width": box.borderWidth,
    "--generic-font-size": type.size,
    "--generic-line-height": type.lineHeight,
    "--generic-font-weight": type.weight,
  });
}

function tokenStateFor(group, state) {
  if (group?.[state]) return state;
  if (state === "active" && group?.pressed) return "pressed";
  return state;
}

function controlTypeVars(size) {
  const map = {
    s: ["bodySmall", "base"],
    small: ["bodySmall", "base"],
    m: ["body", "base"],
    medium: ["body", "base"],
    l: ["bodyLarge", "base"],
    large: ["bodyLarge", "base"],
    xl: ["bodyExtraLarge", "base"],
  };
  const [role, emphasis] = map[size] || map.medium;
  const token = tokens?.$collections?.foundation?.$modes?.["Mode 1"]?.font?.[role]?.[emphasis];
  return {
    size: `${token?.size?.$value ?? 14}px`,
    lineHeight: `${token?.lineHeight?.$value ?? 20}px`,
    letterSpacing: `${token?.letterSpacing?.$value ?? 0}px`,
    weight: fontWeightValue(token?.weight?.$value ?? "Regular"),
  };
}

function controlBoxVars(kind, size) {
  const maps = {
    button: {
      s: { height: 24, paddingX: "s", paddingY: "xs", gap: "2xs", radius: "s" },
      m: { height: 32, paddingX: "m", paddingY: "s", gap: "xs", radius: "m" },
      l: { height: 40, paddingX: "xl", paddingY: "m", gap: "s", radius: "l" },
      xl: { height: 48, paddingX: "2xl", paddingY: "l", gap: "m", radius: "xl" },
    },
    "icon-button": {
      s: { height: 24, paddingX: "xs", paddingY: "xs", iconSize: 16, radius: "s", borderWidth: "s" },
      m: { height: 32, paddingX: "s", paddingY: "s", iconSize: 18, radius: "m", borderWidth: "s" },
      l: { height: 40, paddingX: "m", paddingY: "m", iconSize: 20, radius: "l", borderWidth: "s" },
      xl: { height: 48, paddingX: "l", paddingY: "l", iconSize: 24, radius: "xl", borderWidth: "m" },
    },
    field: {
      s: { height: 24, paddingX: "s", paddingY: "xs", gap: "s", radius: "s" },
      m: { height: 32, paddingX: "l", paddingY: "s", gap: "s", radius: "m" },
      l: { height: 40, paddingX: "xl", paddingY: "m", gap: "m", radius: "l" },
      xl: { height: 48, paddingX: "2xl", paddingY: "l", gap: "m", radius: "xl" },
      small: { height: 24, paddingX: "s", paddingY: "xs", gap: "s", radius: "s" },
      medium: { height: 32, paddingX: "l", paddingY: "s", gap: "s", radius: "m" },
      large: { height: 40, paddingX: "xl", paddingY: "m", gap: "m", radius: "l" },
    },
    checkbox: {
      s: { height: 14, paddingX: "none", paddingY: "none", gap: "s", iconSize: 12, radius: "xs", borderWidth: "s" },
      m: { height: 16, paddingX: "none", paddingY: "none", gap: "s", iconSize: 14, radius: "xs", borderWidth: "m" },
      l: { height: 18, paddingX: "none", paddingY: "none", gap: "m", iconSize: 16, radius: "xs", borderWidth: "m" },
      xl: { height: 20, paddingX: "none", paddingY: "none", gap: "l", iconSize: 18, radius: "s", borderWidth: "m" },
      medium: { height: 16, paddingX: "none", paddingY: "none", gap: "s", iconSize: 14, radius: "xs", borderWidth: "m" },
    },
    radio: {
      s: { height: 14, paddingX: "none", paddingY: "none", gap: "s", iconSize: 6, radius: "circle", borderWidth: "s" },
      m: { height: 16, paddingX: "none", paddingY: "none", gap: "s", iconSize: 6, radius: "circle", borderWidth: "m" },
      l: { height: 18, paddingX: "none", paddingY: "none", gap: "m", iconSize: 8, radius: "circle", borderWidth: "m" },
      xl: { height: 20, paddingX: "none", paddingY: "none", gap: "l", iconSize: 8, radius: "circle", borderWidth: "m" },
      medium: { height: 16, paddingX: "none", paddingY: "none", gap: "s", iconSize: 6, radius: "circle", borderWidth: "m" },
    },
    toggle: {
      s: { width: 28, height: 20, paddingX: "2xs", paddingY: "2xs", gap: "s", iconSize: 10, radius: "circle" },
      m: { width: 34, height: 24, paddingX: "2xs", paddingY: "2xs", gap: "s", iconSize: 12, radius: "circle" },
      l: { width: 42, height: 28, paddingX: "2xs", paddingY: "2xs", gap: "m", iconSize: 16, radius: "circle" },
      xl: { width: 42, height: 28, paddingX: "2xs", paddingY: "2xs", gap: "m", iconSize: 16, radius: "circle" },
      medium: { width: 34, height: 24, paddingX: "2xs", paddingY: "2xs", gap: "s", iconSize: 12, radius: "circle" },
    },
    segmented: {
      s: { height: 28, paddingX: "s", paddingY: "2xs", gap: "2xs", radius: "s", borderWidth: "m" },
      m: { height: 32, paddingX: "m", paddingY: "xs", gap: "2xs", radius: "m", borderWidth: "m" },
      l: { height: 40, paddingX: "xl", paddingY: "s", gap: "xs", radius: "l", borderWidth: "m" },
      xl: { height: 48, paddingX: "2xl", paddingY: "m", gap: "s", radius: "xl", borderWidth: "m" },
      small: { height: 28, paddingX: "s", paddingY: "2xs", gap: "2xs", radius: "s", borderWidth: "m" },
      medium: { height: 32, paddingX: "m", paddingY: "xs", gap: "2xs", radius: "m", borderWidth: "m" },
      large: { height: 40, paddingX: "xl", paddingY: "s", gap: "xs", radius: "l", borderWidth: "m" },
    },
    avatar: {
      small: { height: 24, paddingX: "none", paddingY: "none", gap: "none", radius: "circle" },
      medium: { height: 32, paddingX: "none", paddingY: "none", gap: "none", radius: "circle" },
      large: { height: 40, paddingX: "none", paddingY: "none", gap: "none", radius: "circle" },
    },
    badge: {
      medium: { height: 20, paddingX: "s", paddingY: "none", gap: "xs", radius: "circle", borderWidth: "m" },
    },
    tag: {
      medium: { height: 24, paddingX: "m", paddingY: "none", gap: "xs", radius: "s", borderWidth: "m" },
    },
    card: {
      medium: { height: 0, paddingX: "2xl", paddingY: "2xl", gap: "m", radius: "m", borderWidth: "m" },
    },
    spinner: {
      small: { height: 16, paddingX: "none", paddingY: "none", gap: "none", radius: "circle", borderWidth: "l" },
      medium: { height: 24, paddingX: "none", paddingY: "none", gap: "none", radius: "circle", borderWidth: "l" },
      large: { height: 32, paddingX: "none", paddingY: "none", gap: "none", radius: "circle", borderWidth: "xl" },
    },
    chip: {
      medium: { height: 24, paddingX: "m", paddingY: "none", gap: "xs", radius: "s" },
    },
    accordion: {
      medium: { height: 44, paddingX: "2xl", panelPadding: "2xl", radius: "m", gap: "m" },
    },
    tabs: {
      small: { height: 24, paddingX: "m", paddingY: "none", gap: "2xs", borderWidth: "m", indicatorWidth: "l" },
      medium: { height: 36, paddingX: "xl", paddingY: "none", gap: "xs", borderWidth: "m", indicatorWidth: "l" },
      large: { height: 40, paddingX: "xl", paddingY: "none", gap: "xs", borderWidth: "m", indicatorWidth: "l" },
      extraLarge: { height: 48, paddingX: "2xl", paddingY: "none", gap: "s", borderWidth: "m", indicatorWidth: "l" },
    },
    table: {
      compact: { height: 32, paddingX: "l", paddingY: "s", radius: "m" },
      regular: { height: 40, paddingX: "xl", paddingY: "l", radius: "m" },
      comfortable: { height: 48, paddingX: "2xl", paddingY: "xl", radius: "m" },
    },
    generic: {
      small: { height: 32, paddingX: "m", paddingY: "s", gap: "xs", radius: "m" },
      medium: { height: 40, paddingX: "xl", paddingY: "m", gap: "m", radius: "m" },
      large: { height: 48, paddingX: "2xl", paddingY: "xl", gap: "xl", radius: "l" },
    },
    textarea: {
      s: { height: 72, paddingX: "s", paddingY: "xs", gap: "s", radius: "s" },
      m: { height: 92, paddingX: "l", paddingY: "s", gap: "s", radius: "m" },
      l: { height: 112, paddingX: "xl", paddingY: "m", gap: "m", radius: "l" },
      xl: { height: 136, paddingX: "2xl", paddingY: "l", gap: "m", radius: "xl" },
      small: { height: 72, paddingX: "s", paddingY: "xs", gap: "s", radius: "s" },
      medium: { height: 92, paddingX: "l", paddingY: "s", gap: "s", radius: "m" },
      large: { height: 112, paddingX: "xl", paddingY: "m", gap: "m", radius: "l" },
    },
  };
  const map = maps[kind] || maps.field;
  const config = map[size] || map.m || map.medium;
  return {
    height: `${config.height}px`,
    width: `${config.width || config.height}px`,
    minHeight: `${config.height}px`,
    paddingX: `${spaceValue(config.paddingX)}px`,
    paddingY: `${spaceValue(config.paddingY)}px`,
    panelPadding: `${spaceValue(config.panelPadding || config.paddingY || "m")}px`,
    gap: `${spaceValue(config.gap || "xs")}px`,
    radius: `${radiusValue(config.radius)}px`,
    borderWidth: `${borderWidthValue(config.borderWidth || "m")}px`,
    indicatorWidth: `${borderWidthValue(config.indicatorWidth || "l")}px`,
    iconSize: `${config.iconSize || 16}px`,
  };
}

function spaceValue(name) {
  return tokens?.$collections?.foundation?.$modes?.["Mode 1"]?.space?.[name]?.$value ?? 0;
}

function radiusValue(name) {
  return tokens?.$collections?.foundation?.$modes?.["Mode 1"]?.border?.radius?.[name]?.$value ?? 0;
}

function borderWidthValue(name) {
  return tokens?.$collections?.foundation?.$modes?.["Mode 1"]?.border?.width?.[name]?.$value ?? 1;
}

function fontWeightValue(weight) {
  const normalized = String(weight).toLowerCase();
  if (normalized.includes("light")) return "300";
  if (normalized.includes("medium")) return "500";
  if (normalized.includes("semi")) return "600";
  if (normalized.includes("bold")) return "700";
  return "400";
}

function renderTokenPreview() {
  return `<div class="preview-card">${flattenLeaves(components[selectedComponent]).slice(0, 10).map((item) => `
    <div class="token-row">
      <span class="token-name">${escapeHtml(item.path)}</span>
      <span class="token-swatch" style="--token-color:${escapeHtml(tokenValue(item.node) || "transparent")}"></span>
    </div>
  `).join("")}</div>`;
}

function renderExamples() {
  if (!demoComponents.has(selectedComponent)) return "";
  return `
    <div class="example-card"><div class="example-title">Default</div>${renderTokenPreview()}</div>
    <div class="example-card"><div class="example-title">Token count</div><strong>${countLeaves(components[selectedComponent])}</strong><span class="field-helper">component token leaves</span></div>
  `;
}

function renderTokenTree() {
  tokenTree.innerHTML = flattenLeaves(components[selectedComponent]).map((item) => {
    const value = item.node.$value;
    const resolved = tokenValue(item.node);
    return `
      <div class="token-row" title="${escapeHtml(value)}">
        <div>
          <div class="token-name">${escapeHtml(`${selectedComponent}/${item.path.replaceAll(".", "/")}`)}</div>
          <div class="token-value">${escapeHtml(value)}</div>
        </div>
        <span class="token-swatch" style="--token-color:${escapeHtml(resolved || "transparent")}"></span>
      </div>
    `;
  }).join("");
}

function tokenValue(node) {
  if (!node?.$value) return "";
  return resolveToken(node.$value);
}

function resolveToken(value, depth = 0) {
  if (!value || depth > 12) return "";
  if (value === "{color.transparent}") return "transparent";
  if (!/^\{.+\}$/.test(value)) return value;
  const path = value.slice(1, -1).split(".");
  const mode = document.documentElement.dataset.theme === "dark" ? "Dark" : "Light";
  const roots = [
    tokens.$collections.semantic.$modes[mode],
    tokens.$collections.foundation.$modes["Mode 1"],
  ];
  for (const root of roots) {
    const found = getPath(root, path);
    if (found?.$value) return resolveToken(found.$value, depth + 1);
  }
  return "";
}

function getPath(root, path) {
  return path.reduce((node, key) => node?.[key], root);
}

function flattenLeaves(node, prefix = "") {
  if (!node || typeof node !== "object") return [];
  if ("$value" in node) return [{ path: prefix, node }];
  return Object.entries(node).flatMap(([key, value]) => {
    if (key.startsWith("$")) return [];
    return flattenLeaves(value, prefix ? `${prefix}.${key}` : key);
  });
}

function countLeaves(node) {
  return flattenLeaves(node).length;
}

function styleVars(vars) {
  return Object.entries(vars).map(([key, value]) => `${key}:${value};`).join("");
}

function titleCase(value) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function applyTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("seda-portal-theme", next);
  localStorage.setItem("component-lab-theme", next);
  themeIcon.textContent = next === "dark" ? "☾" : "☀";
}

function setSidebarWidth(width) {
  const nextWidth = Math.min(420, Math.max(200, Math.round(width)));
  document.documentElement.style.setProperty("--sidebar-width", `${nextWidth}px`);
  return nextWidth;
}

function setInspectorWidth(width) {
  const nextWidth = Math.min(560, Math.max(260, Math.round(width)));
  document.documentElement.style.setProperty("--inspector-width", `${nextWidth}px`);
  return nextWidth;
}

function startSidebarResize(event) {
  if (window.matchMedia("(max-width: 980px)").matches) return;

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

function startInspectorResize(event) {
  if (window.matchMedia("(max-width: 980px)").matches) return;

  event.preventDefault();
  document.body.classList.add("resizing-inspector");
  inspectorResizeHandle.setPointerCapture(event.pointerId);

  const onPointerMove = (moveEvent) => {
    setInspectorWidth(window.innerWidth - moveEvent.clientX);
  };

  const stopResize = (upEvent) => {
    const width = setInspectorWidth(window.innerWidth - upEvent.clientX);
    localStorage.setItem("seda-portal-inspector-width", String(width));
    localStorage.setItem("component-lab-inspector-width", String(width));
    document.body.classList.remove("resizing-inspector");
    inspectorResizeHandle.releasePointerCapture(event.pointerId);
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

function showInspectorScrollbar() {
  if (!inspector) return;

  inspector.classList.add("is-scrolling");
  clearTimeout(showInspectorScrollbar.timeout);
  showInspectorScrollbar.timeout = setTimeout(() => {
    inspector.classList.remove("is-scrolling");
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

function parseDemoSet(value) {
  const [key, rawValue] = String(value).split(":");
  return { [key]: parseDemoValue(rawValue) };
}

function parseDemoValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

function nextCycleState(config) {
  const [prop, valuesString] = String(config).split(":");
  const values = valuesString.split(",");
  const currentIndex = values.indexOf(String(propsState[prop]));
  const nextValue = values[(currentIndex + 1) % values.length] || values[0];
  return { [prop]: nextValue };
}

function handleDemoAction(element) {
  const action = element.dataset.demoAction;

  if (action === "next-page" || action === "prev-page") {
    const pages = ["1", "2", "3", "4"];
    const currentIndex = Math.max(0, pages.indexOf(String(propsState.selected)));
    const delta = action === "next-page" ? 1 : -1;
    updateDemoState({ selected: pages[Math.max(0, Math.min(pages.length - 1, currentIndex + delta))] });
    return;
  }

  if (action === "advance-code") {
    const current = String(propsState.value || "000000");
    const numeric = Number(current.replace(/\D/g, "")) || 0;
    updateDemoState({ value: String((numeric + 1) % 1000000).padStart(6, "0") });
    return;
  }

  if (action === "select-row") {
    updateDemoState({ selectedRow: true });
  }
}

function handleTabsKeydown(event) {
  if (!event.target.classList.contains("seda-tab")) return;
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

  const tabList = event.target.closest(".seda-tabs");
  const tabs = Array.from(tabList.querySelectorAll(".seda-tab:not(:disabled)"));
  const currentIndex = tabs.indexOf(event.target);
  let nextIndex = currentIndex;

  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
  if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = tabs.length - 1;

  const nextTab = tabs[nextIndex];
  if (!nextTab) return;

  event.preventDefault();
  nextTab.focus();
  updateDemoState({ selected: nextTab.dataset.demoValue });
}

nav.addEventListener("click", (event) => {
  const link = event.target.closest("[data-component]");
  if (!link) return;
  event.preventDefault();
  selectComponent(link.dataset.component);
  document.body.classList.remove("nav-open");
});

function updatePropControl(target) {
  const prop = target.dataset.prop;
  if (!prop) return;
  propsState[prop] = target.type === "checkbox" ? target.checked : target.value;
  if (target.type === "checkbox") {
    renderProps();
  }
  renderPreview();
}

propsPanel.addEventListener("input", (event) => {
  updatePropControl(event.target);
});

propsPanel.addEventListener("change", (event) => {
  updatePropControl(event.target);
});

propsPanel.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-prop-select]");
  if (trigger) {
    event.stopPropagation();
    const id = trigger.dataset.propSelect;
    openPropSelect = openPropSelect === id ? null : id;
    renderProps();
    return;
  }

  const option = event.target.closest("[data-prop-select-option]");
  if (option) {
    event.stopPropagation();
    propsState[option.dataset.propSelectOption] = option.dataset.value;
    openPropSelect = null;
    renderProps();
    renderPreview();
  }
});

previewStage.addEventListener("click", (event) => {
  const clear = event.target.closest("[data-demo-clear]");
  if (clear) {
    event.preventDefault();
    updateDemoState({ [clear.dataset.demoClear]: "" });
    return;
  }

  const toggle = event.target.closest("[data-demo-toggle]");
  if (toggle) {
    event.preventDefault();
    const prop = toggle.dataset.demoToggle;
    updateDemoState({ [prop]: !propsState[prop] });
    return;
  }

  const set = event.target.closest("[data-demo-set]");
  if (set) {
    event.preventDefault();
    const next = parseDemoSet(set.dataset.demoSet);
    if (set.closest(".select-menu, .picker-panel")) next.open = false;
    updateDemoState(next);
    return;
  }

  const cycle = event.target.closest("[data-demo-cycle]");
  if (cycle) {
    event.preventDefault();
    updateDemoState(nextCycleState(cycle.dataset.demoCycle));
    return;
  }

  const action = event.target.closest("[data-demo-action]");
  if (action) {
    event.preventDefault();
    handleDemoAction(action);
    return;
  }

  const propTarget = event.target.closest("[data-demo-prop]");
  if (propTarget && propTarget.tagName !== "SELECT" && propTarget.type !== "range") {
    event.preventDefault();
    updateDemoState({ [propTarget.dataset.demoProp]: propTarget.dataset.demoValue ?? propTarget.textContent.trim() });
  }
});

previewStage.addEventListener("change", (event) => {
  const target = event.target;
  const prop = target.dataset.demoProp;
  if (!prop) return;
  updateDemoState({ [prop]: target.type === "checkbox" ? target.checked : target.value });
});

previewStage.addEventListener("input", (event) => {
  const target = event.target;
  const prop = target.dataset.demoLiveProp || target.dataset.demoProp;
  if (!prop) return;

  propsState[prop] = target.value;
  renderProps();

  if (target.type === "range") {
    renderPreview();
  }
});

previewStage.addEventListener("keydown", (event) => {
  if (event.target.closest(".seda-tabs") && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    handleTabsKeydown(event);
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") return;

  const interactive = event.target.closest("[data-demo-cycle], [data-demo-set], [data-demo-action]");
  if (!interactive) return;

  event.preventDefault();
  interactive.click();
});

searchInput.addEventListener("input", () => renderNav(searchInput.value));
themeButton.addEventListener("click", () => {
  applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  renderPreview();
  renderTokenTree();
});
menuButton.addEventListener("click", () => document.body.classList.toggle("nav-open"));
sidebarResizeHandle.addEventListener("pointerdown", startSidebarResize);
sidebar.addEventListener("scroll", showSidebarScrollbar, { passive: true });
inspectorResizeHandle.addEventListener("pointerdown", startInspectorResize);
inspector.addEventListener("scroll", showInspectorScrollbar, { passive: true });
window.addEventListener("scroll", showPageScrollbar, { passive: true });
document.addEventListener("scroll", showScrollableScrollbar, { capture: true, passive: true });

window.addEventListener("hashchange", () => {
  const next = location.hash.replace("#", "");
  if (next && next !== selectedComponent && components[next]) selectComponent(next);
});

document.addEventListener("click", (event) => {
  if (!openPropSelect || event.target.closest("#propsPanel")) return;
  openPropSelect = null;
  renderProps();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !openPropSelect) return;
  openPropSelect = null;
  renderProps();
});
