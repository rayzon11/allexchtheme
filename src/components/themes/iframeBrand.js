/**
 * Helpers shared by SkyExchangeTheme and TigerExchTheme to brand-skin the saved login
 * iframes — push CSS variables into the iframe document, swap a saved <img> for the
 * user's logo, and lift a modal up to be a direct body child.
 */

/**
 * Push the parent's brand colour into the iframe document as `--wl-brand` /
 * `--wl-brand-dark` / `--wl-brand-text` so the injected override CSS can use them.
 */
export function applyBrandVars(doc, brand) {
  if (!doc?.documentElement) return;
  const root = doc.documentElement;
  root.style.setProperty("--wl-brand", brand);

  const m = /^#([0-9a-f]{6})$/i.exec(brand);
  if (m) {
    const n = parseInt(m[1], 16);
    const r = Math.round((n >> 16) * 0.65);
    const g = Math.round(((n >> 8) & 0xff) * 0.65);
    const b = Math.round((n & 0xff) * 0.65);
    root.style.setProperty(
      "--wl-brand-dark",
      "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
    );
    const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff)) / 255;
    root.style.setProperty("--wl-brand-text", lum > 0.6 ? "#111" : "#fff");
  }
}

/** Swap an iframe `<img>`'s src to the user's uploaded logo. Optional `size` (px)
 *  forces the rendered height with !important so external CSS can't override the
 *  size slider value. */
export function swapLogoImg(doc, selector, newSrc, size) {
  if (!newSrc) return;
  const img = doc?.querySelector(selector);
  if (!img) return;
  if (img.src !== newSrc) img.src = newSrc;
  if (typeof size === "number" && size > 0) {
    img.style.setProperty("height", `${size}px`, "important");
    img.style.setProperty("width", "auto", "important");
    img.style.setProperty("max-width", "none", "important");
    img.style.setProperty("object-fit", "contain", "important");
  }
}

/** Lift the matching element up to be a direct `<body>` child. */
export function liftToBody(doc, selector) {
  const el = doc?.querySelector(selector);
  if (el && el.parentElement !== doc.body) doc.body.appendChild(el);
}

/**
 * Lock down the iframe — anchor clicks, form submits, and any navigation API are
 * neutralised so clicking inside the preview never leaves it. Idempotent: only
 * installs once per iframe document.
 */
export function lockIframeNavigation(doc) {
  if (!doc || doc.__wl_locked) return;
  doc.__wl_locked = true;

  // Capture-phase click + auxclick listener — preventDefault on anchor or button-link
  // before the page's own handlers run. Stops middle-click and Cmd-click too.
  const swallow = (e) => {
    let el = e.target;
    while (el && el !== doc.body && el !== doc.documentElement) {
      if (el.tagName === "A" || (el.getAttribute && el.getAttribute("role") === "link")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      el = el.parentElement;
    }
  };
  doc.addEventListener("click", swallow, true);
  doc.addEventListener("auxclick", swallow, true);
  doc.addEventListener("submit", (e) => { e.preventDefault(); }, true);

  // Also patch every <base target=...> so even programmatic window.open() stays put,
  // and disable `assign`/`replace` on the iframe's own window.
  try {
    const win = doc.defaultView;
    if (win && !win.__wl_locked) {
      win.__wl_locked = true;
      win.open = () => null;
      const noop = () => {};
      try { win.location.assign = noop; } catch (_) {}
      try { win.location.replace = noop; } catch (_) {}
    }
  } catch (_) { /* cross-origin guard */ }
}
