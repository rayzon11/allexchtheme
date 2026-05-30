import { useEffect, useRef, useState } from "react";
import { applyBrandVars, liftToBody, lockIframeNavigation, swapLogoImg } from "./iframeBrand";

/**
 * The saved Sky header has `<h1><a>SKYEXCHANGE</a></h1>` with no <img>. Replace the
 * anchor's text contents with an <img> of the user's logo so the saved header keeps
 * its exact spacing and behaviour, only the brand mark changes.
 */
function swapHeaderTextWithLogo(doc, src, size = 36) {
  if (!doc || !src) return;
  const anchor = doc.querySelector(".top .header h1 a");
  if (!anchor) return;
  const stamp = `${src}|${size}`;
  if (anchor.dataset.wlSwapped === stamp) return;
  anchor.dataset.wlSwapped = stamp;
  anchor.innerHTML = "";
  const img = doc.createElement("img");
  img.src = src;
  img.alt = "logo";
  img.style.height = `${size}px`;
  img.style.maxWidth = "320px";
  img.style.width = "auto";
  img.style.objectFit = "contain";
  img.style.display = "block";
  anchor.appendChild(img);
}

// Home view: keep the saved HTML's real header (.top + .menu-wrap) visible — that's
// the "perfect" pixel-accurate Sky247 look the customer expects — and re-skin it with
// our brand variables. We still hide the mobile-only chrome and the promo banner that
// holds screenshot-of-header images.
// Home view: keep the saved Sky247 HTML's REAL chrome intact — header bar, gold menu
// bar, news ticker, cricket promo banner, match list — only inject minimal CSS that
// shows desktop content and re-skins the .top header gradient with the brand colour.
// Do NOT hide the promo banner or override the iconic gold menu bar.
// Home view: keep the saved Sky247 HTML's REAL chrome intact — header bar, gold menu
// bar, news ticker, cricket promo banner, match list — only inject minimal CSS that
// shows the desktop content and re-skins the .top header gradient with the brand colour.
// We override the saved CSS's narrow-viewport hiding rules so everything renders even
// though the iframe is sub-1024px wide.
const HIDE_CSS_HOME = `
  /* Force-show every desktop chrome element — the saved HTML's CSS hides these at
     narrow viewports but we want the full Sky247 layout to render in the iframe. */
  .desktop-only,
  .desktop-only .top,
  .desktop-only .top .header,
  .desktop-only .top .menu-wrap,
  .desktop-only .top .menu-wrap .full-wrap,
  .desktop-only .top .menu-wrap .menu,
  .desktop-only .news-wrap,
  .news-bar, .news-wrap,
  .promo-banner-wrap,
  .col-center.gamehall, .gamehall-wrap-simple,
  .menu.nav-pills, .setting-wrap { display: block !important; }
  .desktop-only .top .header { display: flex !important; }
  .desktop-only .top .menu-wrap .menu { display: flex !important; flex-wrap: wrap !important; }

  .mobile-only { display: none !important; }
  body > header, .mobile-bottom-nav, .mobile-header, .mhdr-search-overlay { display: none !important; }
  html, body { overflow-x: hidden !important; }
  body { padding-top: 0 !important; margin-top: 0 !important; }

  /* Force .top to stack vertically — the saved CSS at this viewport leaves .header
     and .menu-wrap overlapping at y=0. Flex column gives us header → menu order. */
  .top {
    display: flex !important;
    flex-direction: column !important;
    background: linear-gradient(180deg, var(--wl-brand, #474747) 0%,
      color-mix(in srgb, var(--wl-brand, #474747) 25%, #000) 100%) !important;
    border-bottom: 1px solid color-mix(in srgb, var(--wl-brand, #474747) 30%, #000) !important;
    transition: background 0.3s ease !important;
  }
  .top > .header.full-wrap, .top > .menu-wrap { width: 100% !important; flex-shrink: 0 !important; }
  /* The saved CSS pins .header with position:fixed which pulls it out of flow and
     causes .menu-wrap to overlay at y=0. Force static so flex column stacks them. */
  .top > .header.full-wrap { position: static !important; }
`;

// Login-page CSS: hide the entire page body, re-show the centered login modal,
// AND override the modal's hardcoded colours with our brand vars so the customer's
// brand colour and uploaded logo carry through to the login screen.
const HIDE_CSS_LOGIN = `
  html, body { background: #0e1116 !important; overflow: hidden !important;
    padding: 0 !important; margin: 0 !important; height: 100% !important; }
  body > * { display: none !important; }
  body > .login-modal-overlay { display: flex !important; position: fixed !important;
    inset: 0 !important; align-items: center !important; justify-content: center !important;
    background: rgba(0,0,0,0.65) !important; z-index: 9999 !important; }
  .login-modal-overlay .login-modal-box { display: flex !important; }

  /* Re-skin the modal with the brand colour the user picked. */
  .login-modal-right { background: var(--wl-brand, #ffb400) !important; }
  .login-modal-title { color: var(--wl-brand-text, #000) !important; background: transparent !important; }
  .login-modal-btn { background: var(--wl-brand-dark, #b86d00) !important;
    color: var(--wl-brand-text, #fff) !important; border: 0 !important; }
  .login-modal-btn:hover { filter: brightness(1.08) !important; }
  .login-modal-captcha { background: rgba(0,0,0,0.15) !important;
    color: var(--wl-brand-text, #000) !important; }
  .login-modal-left { background: #0a0a0a !important; }
`;


// Walk the iframe body and hide any block in the first 240px that looks like a header/menu.
// Anything full-width-ish (>=70% of body) sitting at the very top of the document is presumed
// to be replaced by our React overlay.
function hideTopChrome(doc) {
  if (!doc || !doc.body) return;
  const bodyW = doc.body.offsetWidth || 1000;
  // Look at the first 8 direct children of body; that's where headers always live.
  const candidates = Array.from(doc.body.children).slice(0, 8);
  let consumed = 0;
  for (const el of candidates) {
    if (consumed >= 240) break;
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    // header/nav tags always hide
    const tag = el.tagName.toLowerCase();
    const isHeaderTag = tag === "header" || tag === "nav";
    // class hints
    const cls = (el.className || "").toString().toLowerCase();
    const looksHeader =
      /\b(top|header|nav|menu|topbar|news)\b/.test(cls) &&
      !/main|content|gamehall|body|footer/.test(cls);
    // top-of-body, full-width, < 200px tall = likely a chrome bar
    const isChrome = r.top < 250 && r.width >= bodyW * 0.7 && r.height < 220;
    if (isHeaderTag || looksHeader || isChrome) {
      el.style.setProperty("display", "none", "important");
      consumed += r.height;
    }
  }
}

export default function SkyExchangeTheme({ logoSrc, logoSize = 36, brand, activePage = "home" }) {
  const iframeRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Sky ships two saved-HTML views — the home lobby and the login form page.
  // Both render the saved HTML directly; we only inject brand-skin CSS and swap the
  // logo image — no React overlay chrome.
  const iframeSrc = activePage === "login" ? "/sky/login.html" : "/sky/home.html";

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;
    const doc = iframe.contentDocument;
    // Stop any anchor click / form submit from navigating the iframe away.
    lockIframeNavigation(doc);
    let style = doc.getElementById("__wl_hide");
    if (!style) {
      style = doc.createElement("style");
      style.id = "__wl_hide";
      doc.head.appendChild(style);
    }
    if (activePage === "login") {
      style.textContent = HIDE_CSS_LOGIN;
      applyBrandVars(doc, brand || "#ffb400");
      liftToBody(doc, ".login-modal-overlay");
      // Replace the modal's hard-coded logo with the user's primary logo.
      swapLogoImg(doc, ".login-modal-logo", logoSrc);
      // Re-run a tick later in case the modal mounts via React after onload.
      setTimeout(() => {
        liftToBody(doc, ".login-modal-overlay");
        swapLogoImg(doc, ".login-modal-logo", logoSrc);
      }, 400);
      setReady(true);
      return;
    }
    style.textContent = HIDE_CSS_HOME;
    applyBrandVars(doc, brand || "#474747");
    // Replace the saved SKYEXCHANGE text with the customer's logo image.
    swapHeaderTextWithLogo(doc, logoSrc, logoSize);
    // Re-run a tick later in case content mounts asynchronously.
    setTimeout(() => swapHeaderTextWithLogo(doc, logoSrc, logoSize), 400);
    setReady(true);
  };

  // Re-apply brand vars + logo when the user changes them while staying on the same
  // view (iframe doesn't reload between brand/logo edits).
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    applyBrandVars(doc, brand || (activePage === "login" ? "#ffb400" : "#474747"));
    if (activePage === "login") {
      swapLogoImg(doc, ".login-modal-logo", logoSrc);
    } else {
      swapHeaderTextWithLogo(doc, logoSrc, logoSize);
    }
  }, [brand, logoSrc, logoSize, activePage]);

  return (
    <div className="sky-stage">
      <iframe
        ref={iframeRef}
        title="sky-preview"
        src={iframeSrc}
        className={`theme-iframe sky-iframe${ready ? " ready" : ""}`}
        onLoad={handleIframeLoad}
      />
    </div>
  );
}
