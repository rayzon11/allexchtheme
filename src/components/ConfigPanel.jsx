import { useEffect, useMemo, useState } from "react";
import LogoUpload from "./LogoUpload";
import DomainCheck from "./DomainCheck";
import VariantDetailModal from "./VariantDetailModal";
import {
  SKY_PRESETS,
  TIGER_PRESETS,
  SKY_GROUP_COLOURS,
  isValidHex,
  normaliseHex,
} from "../hooks/useConfig";

// Mini helper used by the shop cards to render the second gradient stop.
function darkenHex(hex, amt = 0.35) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.round((n >> 16) * (1 - amt));
  const g = Math.round(((n >> 8) & 0xff) * (1 - amt));
  const b = Math.round((n & 0xff) * (1 - amt));
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function BrandRow({ value, onChange }) {
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDraft(value);
    setInvalid(false);
  }, [value]);

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

export default function ConfigPanel({
  activeTheme,
  setActiveTheme,
  activePage,
  setActivePage,
  deviceMode,
  setDeviceMode,
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
  domain,
  setDomain,
  domainHistory,
  addDomainHistory,
  onRequestDesign,
  onOpenPreview,
}) {
  const isSky = activeTheme === "sky";
  const presets = isSky ? SKY_PRESETS : TIGER_PRESETS;
  const [detailVariant, setDetailVariant] = useState(null);

  // Group Sky presets by colour family (Yellow / Green / Blue / ...) so the
  // gallery shows the Notion-style sectioned layout. Tiger keeps its flat list.
  const skyGroups = useMemo(() => {
    if (!isSky) return [];
    const order = ["Yellow", "Green", "Blue", "Red", "Pink", "Purple", "Brown", "Dark"];
    const buckets = {};
    SKY_PRESETS.forEach((p) => {
      const g = p.group || "Other";
      if (!buckets[g]) buckets[g] = [];
      buckets[g].push(p);
    });
    return order.filter((g) => buckets[g]).map((g) => ({ group: g, items: buckets[g] }));
  }, [isSky]);

  return (
    <aside className="config-panel">
      <div className="config-section">
        <div className="config-section-title">Theme</div>
        <div className="theme-switcher">
          <button
            type="button"
            className={`theme-btn ${isSky ? "active" : ""}`}
            onClick={() => setActiveTheme("sky")}
          >
            SKY<br />EXCHANGE
          </button>
          <button
            type="button"
            className={`theme-btn ${!isSky ? "active" : ""}`}
            onClick={() => setActiveTheme("tiger")}
          >
            TIGER<br />EXCH
          </button>
        </div>
      </div>

      <div className="config-section">
        <div className="config-section-title">Page</div>
        <div className="page-switcher">
          <button
            type="button"
            className={`page-btn ${activePage === "home" ? "active" : ""}`}
            onClick={() => setActivePage("home")}
          >
            🏠 Home
          </button>
          <button
            type="button"
            className={`page-btn ${activePage === "login" ? "active" : ""}`}
            onClick={() => setActivePage("login")}
          >
            🔐 Login
          </button>
        </div>
      </div>

      <div className="config-section">
        <div className="config-section-title">Device</div>
        <div className="page-switcher">
          <button
            type="button"
            className={`page-btn ${deviceMode === "desktop" ? "active" : ""}`}
            onClick={() => setDeviceMode("desktop")}
          >
            🖥️ Desktop
          </button>
          <button
            type="button"
            className={`page-btn ${deviceMode === "mobile" ? "active" : ""}`}
            onClick={() => setDeviceMode("mobile")}
          >
            📱 Mobile
          </button>
        </div>
      </div>

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
          {isSky ? "Mark / Icon Logo" : "Mark Logo (Sidenav)"}
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

      <div className="config-section">
        <div className="config-section-title">Brand Colour</div>
        <BrandRow value={brand} onChange={setBrand} />
      </div>

      <div className="config-section">
        <div className="config-section-title">
          {isSky ? "Sky Theme — Gallery" : "Tiger Design Shop"}
        </div>
        <div className="config-section-sub">
          {isSky ? "Click any card to open the design — Desktop + Mobile preview." : "Pick a style — preview opens on click."}
        </div>

        {isSky ? (
          <div className="gallery-list">
            {skyGroups.map(({ group, items }) => (
              <section key={group} className="gallery-group">
                <header className="gallery-group-head">
                  <span
                    className="gallery-group-pill"
                    style={{ background: `${SKY_GROUP_COLOURS[group]}22`, color: SKY_GROUP_COLOURS[group] }}
                  >
                    <i style={{ background: SKY_GROUP_COLOURS[group] }} />
                    {group}
                  </span>
                  <span className="gallery-group-count">{items.length}</span>
                </header>
                <div className="gallery-grid">
                  {items.map((p) => {
                    const active = p.brand.toLowerCase() === brand.toLowerCase();
                    return (
                      <button
                        key={p.code}
                        type="button"
                        className={`gallery-card${active ? " active" : ""}`}
                        onClick={() => setDetailVariant(p)}
                        title={`${p.code} ${p.name}`}
                      >
                        <span className="gallery-card-preview" aria-hidden="true">
                          <img src={p.preview} alt={p.name} className="shop-preview-img" />
                        </span>
                        <span className="gallery-card-foot">
                          <span className="gallery-card-tag" style={{ background: SKY_GROUP_COLOURS[group] }} />
                          <span className="gallery-card-code">{p.code}</span>
                        </span>
                        {active && <span className="shop-card-tag">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="shop-grid">
            {presets.map((p) => {
              const active = p.brand.toLowerCase() === brand.toLowerCase();
              return (
                <button
                  key={p.name}
                  type="button"
                  className={`shop-card${active ? " active" : ""}`}
                  onClick={() => { setBrand(p.brand); if (onOpenPreview) onOpenPreview(); }}
                  title={p.name}
                >
                  <span className="shop-card-preview" aria-hidden="true">
                    <span className="shop-preview-bar" style={{ background: p.brand }} />
                    <span className="shop-preview-side" style={{ background: p.brand }} />
                    <span className="shop-preview-body-tiger" />
                  </span>
                  <span className="shop-card-meta">
                    <span className="shop-card-dot" style={{ background: p.brand }} />
                    <span className="shop-card-name">{p.name}</span>
                  </span>
                  {active && <span className="shop-card-tag">✓ Selected</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <VariantDetailModal
        variant={detailVariant}
        onClose={() => setDetailVariant(null)}
        onApply={() => {
          if (detailVariant) setBrand(detailVariant.brand);
          setDetailVariant(null);
        }}
      />

      <div className="config-section">
        <div className="config-section-title">Domain Availability</div>
        <DomainCheck
          value={domain}
          onChange={setDomain}
          onUseAsName={setSiteName}
          siteName={siteName}
          history={domainHistory}
          addHistory={addDomainHistory}
        />
      </div>

      <div className="config-section" style={{ borderBottom: "none", paddingBottom: 28 }}>
        <button type="button" className="reset-btn" onClick={resetBrand}>
          ↺ Reset to Default
        </button>
        <button type="button" className="request-btn" onClick={onRequestDesign}>
          🚀 Request This Design
        </button>
      </div>
    </aside>
  );
}
