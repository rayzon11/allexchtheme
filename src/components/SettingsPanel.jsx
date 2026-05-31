import { useEffect, useState } from "react";
import LogoUpload from "./LogoUpload";
import { isValidHex, normaliseHex } from "../hooks/useConfig";

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
 * Always-visible right-side settings panel. Customer can change brand, site
 * name, logos at any time while browsing the gallery and previewing variants.
 */
export default function SettingsPanel({
  activeTheme,
  siteName,
  setSiteName,
  brand,
  setBrand,
  resetBrand,
  logoSrc,
  logoFileName,
  hasCustomLogo,
  logoError,
  uploadLogo,
  removeLogo,
  applyDemoLogo,
  markLogoSrc,
  markFileName,
  hasCustomMark,
  markError,
  uploadMark,
  removeMark,
  logoSize,
  markSize,
  setLogoSize,
  setMarkSize,
  onRequestDesign,
  // Mobile-only collapse controls
  mobileOpen,
  onMobileToggle,
}) {
  return (
    <aside className={`settings-panel${mobileOpen ? " mobile-open" : ""}`}>
      <header className="settings-head">
        <div>
          <strong>Customize</strong>
          <small>Live updates the preview</small>
        </div>
        <button
          type="button"
          className="settings-mobile-toggle"
          onClick={onMobileToggle}
          aria-label={mobileOpen ? "Hide settings" : "Show settings"}
        >
          {mobileOpen ? "▼" : "▲"}
        </button>
      </header>

      <div className="settings-body">
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
          <div className="config-section-title">Primary Logo (Header)</div>
          <LogoUpload
            logoSrc={logoSrc}
            logoFileName={logoFileName}
            hasCustomLogo={hasCustomLogo}
            logoError={logoError}
            onUpload={uploadLogo}
            onRemove={removeLogo}
            onApplyDemo={applyDemoLogo}
            size={logoSize}
            onSizeChange={setLogoSize}
            uploadLabel="Upload header logo"
            replaceLabel="Replace header logo"
          />
        </div>

        <div className="config-section">
          <div className="config-section-title">
            {activeTheme === "sky" ? "Mark / Icon Logo" : "Mark Logo (Sidenav)"}
          </div>
          <LogoUpload
            logoSrc={markLogoSrc}
            logoFileName={markFileName}
            hasCustomLogo={hasCustomMark}
            logoError={markError}
            onUpload={uploadMark}
            onRemove={removeMark}
            size={markSize}
            onSizeChange={setMarkSize}
            sizeMax={128}
            showDemos={false}
            uploadLabel="Upload mark / icon"
            replaceLabel="Replace mark / icon"
          />
        </div>
      </div>

      <footer className="settings-foot">
        <button type="button" className="request-btn" onClick={onRequestDesign}>
          🚀 Request This Design
        </button>
      </footer>
    </aside>
  );
}
