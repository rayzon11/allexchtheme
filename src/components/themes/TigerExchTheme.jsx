import { useEffect, useRef, useState } from "react";
import { TIGER_SIDENAV_LOGO, TIGER_DEFAULT_LOGO, logoImgStyle } from "../../hooks/useConfig";
import { applyBrandVars, liftToBody, lockIframeNavigation, swapLogoImg } from "./iframeBrand";

// CSS injected into the iframe document.
//  - display:none for header/footer/sidenav so the body collapses up into them and our
//    React overlays sit cleanly on top with no empty gap.
//  - Materialize keeps main { padding-left: 242px } regardless of whether the sidenav is
//    present, so our 240px React sidenav slots into that empty column naturally.
//  - Mobile-only footer is also hidden.
const HIDE_CSS_HOME = `
  body > header { display: none !important; }
  ul#slide-out.sidenav, .sidenav-overlay { display: none !important; }
  footer.homefooter, footer.page-footer { display: none !important; }
  html, body { overflow-x: hidden !important; background: #fff !important; }
  body { padding-top: 0 !important; margin-top: 0 !important; }
`;

// Login page: kill the page behind, re-show only the Bootstrap modal centered.
// Pair with lifting both .modal and .modal-backdrop to be direct body children so the
// "hide every body child" rule doesn't hide their wrappers. ALSO override the modal's
// hard-coded colours with our brand vars.
const HIDE_CSS_LOGIN = `
  html, body { background: #0e1116 !important; overflow: hidden !important;
    padding: 0 !important; margin: 0 !important; height: 100% !important; }
  body > * { display: none !important; }
  body > .modal-backdrop { display: block !important; position: fixed !important;
    inset: 0 !important; background: rgba(0,0,0,0.65) !important; opacity: 1 !important; z-index: 1040 !important; }
  body > .modal.loginhomemodal { display: block !important; position: fixed !important;
    inset: 0 !important; z-index: 1050 !important; overflow: auto !important; }
  .modal-dialog.modal-dialog-centered { margin: 0 auto !important;
    min-height: 100vh !important; display: flex !important; align-items: center !important; }
  .modal-content { box-shadow: 0 30px 80px rgba(0,0,0,0.7) !important; }

  /* Brand-skin the FULL card — header strip, body, inputs, buttons, links. */
  .modal-content {
    background: color-mix(in srgb, var(--wl-brand, #cc0a00) 8%, #fff) !important;
    border: 1px solid color-mix(in srgb, var(--wl-brand, #cc0a00) 35%, transparent) !important;
    border-radius: 12px !important;
    overflow: hidden !important;
  }
  /* The colour strip at the top of the modal where the brand logo sits. */
  .modal-content .modal-header, .modal-content .logo-mid, .modal-content > *:first-child {
    background: var(--wl-brand, #cc0a00) !important;
    color: var(--wl-brand-text, #fff) !important;
    border-bottom: 1px solid color-mix(in srgb, var(--wl-brand, #cc0a00) 65%, #000) !important;
  }
  .modal-content h1, .modal-content h2, .modal-content h3, .modal-content h4,
  .modal-content h5, .modal-content .modal-title { color: var(--wl-brand-text, #fff) !important; }
  .modal-content .modal-body { background: transparent !important; }
  .modal-content label, .modal-content .form-label { color: color-mix(in srgb, var(--wl-brand, #cc0a00) 70%, #000) !important; }
  .modal-content input[type="text"], .modal-content input[type="password"], .modal-content input[type="email"] {
    background: #fff !important;
    border: 1px solid color-mix(in srgb, var(--wl-brand, #cc0a00) 30%, #ccc) !important;
    color: #212121 !important;
  }
  .modal-content input:focus { border-color: var(--wl-brand, #cc0a00) !important;
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--wl-brand, #cc0a00) 25%, transparent) !important; }
  /* Brand-skin the buttons + accents inside the modal. */
  .btnx.primary, .modalLoginbtn.login_btn, .modalLoginbtn { background: var(--wl-brand, #cc0a00) !important;
    color: var(--wl-brand-text, #fff) !important; border: 0 !important; }
  .btnx.primary:hover, .modalLoginbtn:hover { background: var(--wl-brand-dark, #6a0500) !important; }
  .modal-content a, .modal-content .forgot, .modal-content .signup,
  .modal-content a.login_btn { color: var(--wl-brand, #cc0a00) !important; }
`;

const SIDENAV_ITEMS = [
  { icon: "🏠", label: "Home" },
  { icon: "💰", label: "Deposit" },
  { icon: "💸", label: "Withdrawal" },
  { icon: "💬", label: "WhatsApp" },
  { icon: "🎮", label: "Aura" },
  { icon: "🃏", label: "Casino" },
  { icon: "🎰", label: "Icasino" },
  { icon: "📊", label: "A/C Statement" },
  { icon: "📋", label: "Un-Settled Bets" },
  { icon: "📜", label: "Rules" },
  { icon: "⚙️", label: "Edit Stakes" },
  { icon: "👤", label: "Profile (demo247)" },
  { icon: "🎁", label: "Offers" },
  { icon: "🌓", label: "Mode: Light" },
  { icon: "📱", label: "Download APP" },
  { icon: "🚪", label: "Logout" },
];

export default function TigerExchTheme({ siteName, logoSrc, markLogoSrc, logoSize = 32, markSize = 64, brand, activePage = "home" }) {
  const iframeRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Tiger ships two saved-HTML views — the after-login lobby and the login form page.
  const iframeSrc = activePage === "login" ? "/tiger/login.html" : "/tiger/index.html";
  // The login page already has its own header/sidenav/footer — no React overlays needed.
  const showChromeOverlays = activePage !== "login";

  // Tiger has a distinct sidenav mark (the tiger-face graphic) separate from the
  // wordmark used in the nav. Falls back to TIGER_SIDENAV_LOGO when nothing custom.
  const sidenavLogo = markLogoSrc || TIGER_SIDENAV_LOGO;

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
      applyBrandVars(doc, brand || "#cc0a00");
      liftToBody(doc, ".modal-backdrop");
      liftToBody(doc, ".modal.loginhomemodal");
      // Replace the modal's tiger-face image with the user's mark/primary logo.
      const newSrc = markLogoSrc || logoSrc;
      swapLogoImg(doc, ".modal-content img", newSrc);
      setTimeout(() => {
        liftToBody(doc, ".modal-backdrop");
        liftToBody(doc, ".modal.loginhomemodal");
        swapLogoImg(doc, ".modal-content img", newSrc);
      }, 400);
    } else {
      style.textContent = HIDE_CSS_HOME;
    }
    setReady(true);
  };

  // Re-apply brand vars + logo when the user changes them while staying on login.
  useEffect(() => {
    if (activePage !== "login") return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    applyBrandVars(doc, brand || "#cc0a00");
    swapLogoImg(doc, ".modal-content img", markLogoSrc || logoSrc);
  }, [brand, logoSrc, markLogoSrc, activePage]);

  return (
    <div className={`tig-stage${showChromeOverlays ? "" : " tig-stage-login"}`}>
      <iframe
        ref={iframeRef}
        title="tiger-preview"
        src={iframeSrc}
        className={`theme-iframe tig-iframe${ready ? " ready" : ""}`}
        onLoad={handleIframeLoad}
      />

      {/* Login view ships its own chrome inside the saved HTML — skip our overlays. */}
      {showChromeOverlays && <>
      {/* HEADER OVERLAY — replaces the entire <header> block: balance + nav + marquee + deposit/withdraw */}
      <header className="tig-header-overlay">
        <div className="tig-balance-row">
          <span>Balance : <strong>0</strong>&nbsp;&nbsp;PTI</span>
          <span>Exp : <strong>0</strong></span>
        </div>
        <div className="tig-nav-row">
          <button className="tig-hamburger" aria-label="Menu">
            <span className="material-icons" aria-hidden="true">≡</span>
          </button>
          <a className="tig-brand">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={siteName}
                style={{ ...logoImgStyle(logoSize, 240), marginTop: 4 }}
              />
            ) : (
              <span className="tig-brand-text">{siteName}</span>
            )}
          </a>
          <span style={{ width: 36 }} aria-hidden="true" />
        </div>
        <div className="tig-marquee">
          <span>Welcome To {siteName}, We have launched 4500+ games in new I-casino. Please note in new i-casino 1 point = 100 points</span>
        </div>
        <div className="tig-action-row">
          <button className="tig-action-btn deposit" type="button">
            <img alt="" src="/tiger/TIGEREXCH_files/piggy_bank.png" />
            Deposit
          </button>
          <button className="tig-action-btn withdraw" type="button">
            <img alt="" src="/tiger/TIGEREXCH_files/money.png" />
            Withdraw
          </button>
        </div>
      </header>

      {/* SIDENAV OVERLAY — slots into Materialize's reserved 242px left padding on <main>. */}
      <aside className="tig-sidenav-overlay">
        <div className="tig-sidenav-head">
          {sidenavLogo ? (
            <img
              src={sidenavLogo}
              alt={siteName}
              style={logoImgStyle(markSize, 240)}
            />
          ) : (
            <span className="tig-sidenav-brand">{siteName}</span>
          )}
        </div>
        <ul className="tig-sidenav-menu">
          {SIDENAV_ITEMS.map((it) => (
            <li key={it.label}>
              <a>
                <span className="icon">{it.icon}</span>
                <b>{it.label}</b>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* FOOTER OVERLAY */}
      <footer className="tig-footer-overlay">
        <div className="tig-footer-brand">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={siteName}
              style={logoImgStyle(Math.min(logoSize, 36), 200)}
            />
          ) : (
            <span>{siteName}</span>
          )}
        </div>
        <div className="tig-footer-text">
          {siteName} — Licensed &amp; Regulated &middot; 18+ Only &middot; Play Responsibly
        </div>
        <div className="tig-footer-copy">© 2025 {siteName}</div>
      </footer>
      </>}
    </div>
  );
}
