(function () {
  const TOKEN_PATHS = ["../tokens.json", "./tokens.json", "/tokens.json"];
  let tokens = null;

  loadTokens();

  async function loadTokens() {
    for (const path of TOKEN_PATHS) {
      try {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) continue;
        tokens = await response.json();
        applyPortalTokens();
        observeTheme();
        return;
      } catch (error) {
        // Try the next relative path. The portal can be opened from several folders.
      }
    }

    console.warn("SEDA AI: tokens.json was not loaded. CSS fallback values are being used.");
  }

  function observeTheme() {
    new MutationObserver((records) => {
      if (records.some((record) => record.attributeName === "data-theme")) {
        applyPortalTokens();
      }
    }).observe(document.documentElement, { attributes: true });
  }

  function applyPortalTokens() {
    if (!tokens) return;

    const root = document.documentElement;
    const modeName = root.dataset.theme === "light" ? "Light" : "Dark";
    const foundation = tokens.$collections?.foundation?.$modes?.["Mode 1"] || {};
    const semantic = tokens.$collections?.semantic?.$modes?.[modeName] || {};
    const css = new Map();

    collectLeafVars(foundation, "foundation", css);
    collectLeafVars(semantic, "semantic", css);

    collectColorVars(foundation.color, css);
    collectSemanticVars(semantic, css);
    collectCompatibilityVars(semantic, css);

    for (const [name, value] of css) {
      root.style.setProperty(name, resolveToken(value, semantic, foundation));
    }
  }

  function collectLeafVars(node, prefix, css) {
    walkLeaves(node, [], (path, leaf) => {
      css.set(`--token-${prefix}-${path.join("-")}`, leaf.$value);
    });
  }

  function collectColorVars(colorNode, css) {
    walkLeaves(colorNode, [], (path, leaf) => {
      const name = path.join("-");
      css.set(`--color-${name}`, leaf.$value);
      css.set(`--seda-color-${name}`, leaf.$value);
    });
  }

  function collectSemanticVars(semantic, css) {
    walkLeaves(semantic, [], (path, leaf) => {
      css.set(`--${path.join("-")}`, leaf.$value);
      css.set(`--seda-${path.join("-")}`, leaf.$value);
    });
  }

  function collectCompatibilityVars(semantic, css) {
    const value = (path) => getPath(semantic, path)?.$value;

    const surfaceDefault = value(["surface", "base"]) || value(["surface", "page"]);
    const surfaceHover = value(["surface", "subtle"]) || value(["surface", "raised"]);
    const surfacePressed = value(["surface", "sunken"]) || surfaceHover;
    const borderDefault = value(["border", "default"]);
    const borderHover = value(["border", "hover"]) || value(["border", "strong"]);
    const textPrimary = value(["text", "primary"]);
    const textSecondary = value(["text", "secondary"]);
    const textTertiary = value(["text", "tertiary"]);
    const textMuted = value(["text", "muted"]);
    const brandDefault = value(["container", "brand", "default"]);
    const brandHover = value(["container", "brand", "hover"]);
    const neutralDefault = value(["container", "neutral", "default"]);
    const neutralHover = value(["container", "neutral", "hover"]);

    setIf(css, "--seda-surface-default", surfaceDefault);
    setIf(css, "--seda-surface-hover", surfaceHover);
    setIf(css, "--seda-surface-pressed", surfacePressed);
    setIf(css, "--seda-container-default", neutralDefault);
    setIf(css, "--seda-container-hover", neutralHover);
    setIf(css, "--seda-container-pressed", value(["container", "neutral", "pressed"]));
    setIf(css, "--seda-container-brand-default", brandDefault);
    setIf(css, "--seda-container-brand-hover", brandHover);
    setIf(css, "--seda-border-default", borderDefault);
    setIf(css, "--seda-border-hover", borderHover);
    setIf(css, "--seda-text-primary", textPrimary);
    setIf(css, "--seda-text-secondary", textSecondary);
    setIf(css, "--seda-text-tertiary", textTertiary);
    setIf(css, "--seda-text-muted", textMuted);
    setIf(css, "--seda-text-on-brand-primary", value(["text", "on-brand", "primary"]));
    setIf(css, "--seda-status-error-text", value(["status", "danger", "text"]));

    setIf(css, "--surface", surfaceDefault);
    setIf(css, "--surface-soft", surfaceHover);
    setIf(css, "--surface-raised", value(["surface", "raised"]) || surfaceDefault);
    setIf(css, "--border", borderDefault);
    setIf(css, "--border-strong", borderHover);
    setIf(css, "--text", textPrimary);
    setIf(css, "--text-muted", textTertiary);
    setIf(css, "--text-soft", textMuted);
    setIf(css, "--brand", brandDefault);
    setIf(css, "--brand-hover", brandHover);
    setIf(css, "--brand-soft", neutralDefault);
    setIf(css, "--code", neutralDefault);
    setIf(css, "--focus-ring", value(["focus", "ring"]));
    setIf(css, "--overlay", value(["surface", "scrim"]));
  }

  function setIf(css, name, value) {
    if (value) css.set(name, value);
  }

  function walkLeaves(node, path, visit) {
    if (!node || typeof node !== "object") return;
    if ("$value" in node) {
      visit(path, node);
      return;
    }

    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("$")) continue;
      walkLeaves(value, [...path, key], visit);
    }
  }

  function resolveToken(value, semantic, foundation, depth = 0) {
    if (!value || depth > 16) return value || "";
    if (value === "{color.transparent}") return "transparent";
    if (!/^\{.+\}$/.test(value)) return String(value);

    const path = value.slice(1, -1).split(".");
    const found = getPath(semantic, path) || getPath(foundation, path);
    return found?.$value ? resolveToken(found.$value, semantic, foundation, depth + 1) : value;
  }

  function getPath(root, path) {
    return path.reduce((node, key) => node?.[key], root);
  }
})();
