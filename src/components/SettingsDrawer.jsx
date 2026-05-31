import { useEffect, useState } from "react";
import LogoUpload from "./LogoUpload";
import { isValidHex, normaliseHex } from "../hooks/useConfig";

/**
 * Slide-out settings drawer. Customer taps the gear icon → drawer slides in
 * from the right with site name, logos, brand colour. Keeps the gallery clean.
 */
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

export default function SettingsDrawer({
  isOpen,
  onClose,
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
  activeTheme,
}) {
  // Lock body scroll when drawer is open so the gallery doesn't scroll under it.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div className={`drawer-backdrop${isOpen ? " open" : ""}`} onClick={onClose} />
      <aside className={`settings-drawer${isOpen ? " open" : ""}`} aria-hidden={!isOpen}>
        <header className="drawer-head">
          <strong>Customize design</strong>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="drawer-body">
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

        <footer className="drawer-foot">
          <button type="button" className="request-btn" onClick={() => { onRequestDesign?.(); onClose(); }}>
            🚀 Request This Design
          </button>
        </footer>
      </aside>
    </>
  );
}
