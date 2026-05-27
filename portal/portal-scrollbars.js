(() => {
  const selectors = [
    ".sidebar",
    ".inspector",
    ".content",
    ".document",
    ".main-panel",
    ".markdown-editor",
    ".markdown-help-panel",
    "pre",
  ];
  const items = new Map();
  let activeWindowItem = null;

  document.documentElement.classList.add("portal-overlay-scrollbars");

  function isScrollable(element) {
    return element.scrollHeight > element.clientHeight + 1;
  }

  function getWindowMetrics() {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    return {
      clientHeight,
      scrollHeight,
      scrollTop,
      rect: {
        top: 0,
        bottom: window.innerHeight,
        right: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  function getElementMetrics(element) {
    const rect = element.getBoundingClientRect();
    return {
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
      rect,
    };
  }

  function updateThumb(item) {
    const metrics = item.element === window ? getWindowMetrics() : getElementMetrics(item.element);
    const maxScroll = metrics.scrollHeight - metrics.clientHeight;

    if (maxScroll <= 1 || metrics.rect.height <= 0) {
      item.thumb.hidden = true;
      return;
    }

    const trackInset = 4;
    const trackHeight = Math.max(0, metrics.rect.height - trackInset * 2);
    const thumbHeight = Math.max(24, Math.round((metrics.clientHeight / metrics.scrollHeight) * trackHeight));
    const travel = Math.max(0, trackHeight - thumbHeight);
    const top = metrics.rect.top + trackInset + (metrics.scrollTop / maxScroll) * travel;
    const right = Math.max(2, window.innerWidth - metrics.rect.right + 2);

    item.thumb.hidden = false;
    item.thumb.style.height = `${thumbHeight}px`;
    item.thumb.style.top = `${Math.round(top)}px`;
    item.thumb.style.right = `${Math.round(right)}px`;
  }

  function showThumb(item) {
    updateThumb(item);
    if (item.thumb.hidden) return;

    item.thumb.classList.add("is-visible");
    clearTimeout(item.hideTimer);
    item.hideTimer = setTimeout(() => {
      item.thumb.classList.remove("is-visible", "is-hovered");
    }, 900);
  }

  function ensureItem(element) {
    if (items.has(element)) return items.get(element);

    const thumb = document.createElement("div");
    thumb.className = "portal-scrollbar-thumb";
    thumb.hidden = true;
    document.body.appendChild(thumb);

    const item = { element, thumb, hideTimer: null };
    items.set(element, item);

    if (element === window) {
      window.addEventListener("scroll", () => showThumb(item), { passive: true });
      window.addEventListener("resize", () => updateThumb(item), { passive: true });
      document.addEventListener("mouseenter", () => showThumb(item), true);
      activeWindowItem = item;
    } else {
      element.addEventListener("scroll", () => showThumb(item), { passive: true });
      element.addEventListener("mouseenter", () => {
        item.thumb.classList.add("is-hovered");
        showThumb(item);
      });
      element.addEventListener("mouseleave", () => {
        item.thumb.classList.remove("is-hovered");
      });
    }

    return item;
  }

  function refreshScrollbars() {
    ensureItem(window);

    document.querySelectorAll(selectors.join(",")).forEach((element) => {
      const item = ensureItem(element);
      updateThumb(item);
    });

    if (activeWindowItem) updateThumb(activeWindowItem);
  }

  const observer = new MutationObserver(() => {
    requestAnimationFrame(refreshScrollbars);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  refreshScrollbars();
})();
