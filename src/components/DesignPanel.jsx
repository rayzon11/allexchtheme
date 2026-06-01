import { useEffect, useMemo, useState } from "react";
import LogoUpload from "./LogoUpload";
import {
  SKY_PRESETS,
  TIGER_PRESETS,
  SKY_VIEWS,
  TIGER_VIEWS,
  isValidHex,
  normaliseHex,
} from "../hooks/useConfig";

function BrandRow({ value, onChange }) {
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => { setDraft(value); setInvalid(false); }, [value]);

  const handleHex = (e) => {
    let next = e.target.value;
    if (!next.startsWith("#")) next = "#" + next;
    setDraft(next);
    if (isValidHex(next)) {
      setInvalid(false);
      onChange(normaliseHex(next));
    } else {
      setInvalid(true);
    }
  };

  return (
    <div className="brand-row">
      <label className="brand-swatch" style={{ background: value }}>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
      <input
        type="text"
        className={`hex-input${invalid ? " invalid" : ""}`}
        value={draft.toUpperCase()}
        onChange={handleHex}
        maxLength={7}
        spellCheck={false}
      />
    </div>
  );
}

/**
 * Merged right-side panel: top half is the selected design preview (Desktop
 * Home / Desktop Login / Mobile Home / Mobile Login swipeable), bottom half is
 * the full customizer (site name, brand, logos, request CTA).
 */
export default function DesignPanel({
  activeTheme,
  siteName,
  setSiteName,
  brand,
  setBrand,
  resetBrand,
  selectedCode,
  logoSrc,
  logoFileName,
  hasCustomLogo,
  logoError,
  uploadLogo,
  removeLogo,
  logoSize,
  setLogoSize,
  onRequestDesign,
  onOpenTigerPreview,
  mobileOpen,
  onMobileToggle,
}) {
  const isSky = activeTheme === "sky";

  const variant = useMemo(() => {
    const list = isSky ? SKY_PRESETS : TIGER_PRESETS;
    // Match by the selected variant CODE first (several variants share a hex);
    // fall back to brand-colour match, then the first variant.
    return (
      list.find((p) => p.code === selectedCode) ||
      list.find((p) => p.brand.toLowerCase() === brand?.toLowerCase()) ||
      list[0]
    );
  }, [isSky, selectedCode, brand]);

  const slides = useMemo(() => {
    if (!variant) return [];
    const views = (isSky ? SKY_VIEWS : TIGER_VIEWS)[variant.code] || {};
    return [
      { kind: "desktop", label: "Desktop · Home",        src: views.desktopHome       || variant.preview },
      { kind: "desktop", label: "Desktop · Login",       src: views.desktopLogin },
      { kind: "desktop", label: "Desktop · After login", src: views.desktopAfterLogin },
      { kind: "mobile",  label: "Mobile · Home",         src: views.mobileHome },
      { kind: "mobile",  label: "Mobile · Login",        src: views.mobileLogin },
      { kind: "mobile",  label: "Mobile · After login",  src: views.mobileAfterLogin },
    ].filter((s) => s.src);
  }, [variant, isSky]);

  return (
    <aside className={`design-panel${mobileOpen ? " mobile-open" : ""}`}>
      {/* iOS-style drag handle visible only on mobile */}
      <button type="button" className="design-drag-handle" onClick={onMobileToggle} aria-label="Expand sheet">
        <span />
      </button>

      <header className="design-head" onClick={(e) => {
        // Tap the whole head on mobile to toggle the sheet (except taps inside controls)
        if (e.target.closest("button, a, input")) return;
        if (window.matchMedia("(max-width: 820px)").matches) onMobileToggle?.();
      }}>
        <div className="design-head-left">
          {variant && (
            <span className="design-head-thumb">
              {variant.preview ? (
                <img src={variant.preview} alt="" />
              ) : (
                <span className="design-head-mock" style={{ background: variant.brand }} />
              )}
              <span className="design-head-code-overlay" style={{ background: variant.brand }}>
                {variant.code || variant.name}
              </span>
            </span>
          )}
          <div className="design-head-text">
            <strong>{variant?.name || "Pick a design"}</strong>
            <small>{mobileOpen ? "Tap ▼ to collapse" : `${isSky ? "Sky" : "Tiger"} · tap to customize`}</small>
          </div>
        </div>
        <button
          type="button"
          className="design-mobile-toggle"
          onClick={(e) => { e.stopPropagation(); onMobileToggle?.(); }}
          aria-label={mobileOpen ? "Collapse" : "Expand"}
        >
          {mobileOpen ? "▼" : "▲"}
        </button>
      </header>

      <div className="design-body">
        {/* PREVIEW section */}
        <section className="design-preview">
          <div className="design-preview-scroller">
            {slides.map((s, i) => (
              <figure key={i} className={`design-slide design-slide-${s.kind}`}>
                <figcaption>{s.label}</figcaption>
                <div className="design-slide-frame">
                  <img src={s.src} alt={s.label} loading="lazy" />
                </div>
              </figure>
            ))}
          </div>
          <p className="design-preview-hint">← swipe to see all views →</p>
        </section>

        {/* CUSTOMIZE section — merged in below */}
        <section className="design-customize">
          <header className="design-section-title">Customize</header>

          <div className="config-section">
            <div className="config-section-title">Site Name</div>
            <input
              type="text"
              className="site-name-input"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              maxLength={20}
              placeholder="Your brand"
            />
          </div>

          <div className="config-section">
            <div className="config-section-title">Brand Colour</div>
            <BrandRow value={brand} onChange={setBrand} />
            <button type="button" className="reset-btn mt-8" onClick={resetBrand}>
              ↺ Reset to default
            </button>
          </div>

          <div className="config-section">
            <div className="config-section-title">Logo</div>
            <LogoUpload
              logoSrc={logoSrc}
              logoFileName={logoFileName}
              hasCustomLogo={hasCustomLogo}
              logoError={logoError}
              onUpload={uploadLogo}
              onRemove={removeLogo}
              size={logoSize}
              onSizeChange={setLogoSize}
              uploadLabel="Upload your logo"
              replaceLabel="Replace logo"
            />
          </div>
        </section>
      </div>

      <footer className="design-foot">
        <button type="button" className="request-btn" onClick={onRequestDesign}>
          🚀 Request this design
        </button>
      </footer>
    </aside>
  );
}
