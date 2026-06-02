import { useMemo } from "react";
import {
  SKY_PRESETS,
  TIGER_PRESETS,
  SKY_GROUP_COLOURS,
  THEMES,
} from "../hooks/useConfig";

const VARIANT_COUNT = { sky: SKY_PRESETS.length, tiger: TIGER_PRESETS.length };

/**
 * Notion-style gallery on the left side of the workspace. Click a card →
 * the selected variant updates (brand applies + right panel shows that
 * variant's full design). No inline expansion — everything lives on the right.
 *
 * A white-label PRODUCT switcher sits at the top so the customer can jump
 * between brands (Sky Exchange, Tiger Exch, + upcoming) like a marketplace.
 */
export default function MainGallery({ activeTheme, setActiveTheme, selectedCode, onSelectVariant, onRequest }) {
  const isSky = activeTheme === "sky";

  const groups = useMemo(() => {
    const order = ["Yellow", "Green", "Orange", "Red", "Blue", "Purple", "White"];
    const list = isSky ? SKY_PRESETS : TIGER_PRESETS;
    const buckets = {};
    list.forEach((p) => { (buckets[p.group || "Other"] ||= []).push(p); });
    return order.filter((g) => buckets[g]).map((g) => ({ group: g, items: buckets[g] }));
  }, [isSky]);

  const onCardClick = (p) => {
    onSelectVariant?.(p);
  };

  const activeProduct = THEMES.find((t) => t.id === activeTheme) || THEMES[0];

  return (
    <div className="gallery-page">
      {/* WHITE-LABEL PRODUCT SWITCHER */}
      <section className="product-switcher" id="designs">
        <header className="product-switcher-head">
          <div>
            <span className="product-switcher-eyebrow">White-label products</span>
            <h2>Choose a platform</h2>
          </div>
          <span className="product-switcher-count">{THEMES.length} products</span>
        </header>
        <div className="product-rail">
          {THEMES.map((t) => {
            const count = VARIANT_COUNT[t.id];
            const active = t.id === activeTheme;
            return (
              <button
                key={t.id}
                type="button"
                className={`product-card${active ? " active" : ""}${t.live ? "" : " soon"}`}
                onClick={() => t.live && setActiveTheme?.(t.id)}
                disabled={!t.live}
              >
                <span className="product-card-cover">
                  <img src={t.cover} alt={t.name} loading="lazy" />
                  {!t.live && <span className="product-card-badge">Soon</span>}
                  {active && <span className="product-card-badge active">● Active</span>}
                </span>
                <span className="product-card-body">
                  <strong>{t.name}</strong>
                  <small>{t.tagline}</small>
                  <span className="product-card-meta">
                    <span className="product-card-cat">{t.category}</span>
                    {count ? <span className="product-card-variants">{count} colours</span> : null}
                  </span>
                </span>
              </button>
            );
          })}
          {/* Placeholder "more coming" slot so the rail reads as a growing catalogue */}
          <div className="product-card placeholder" aria-hidden="true">
            <span className="product-card-cover ghost">+</span>
            <span className="product-card-body">
              <strong>More soon</strong>
              <small>New platforms added regularly</small>
            </span>
          </div>
        </div>
      </section>

      <header className="gallery-page-head">
        <div>
          <h1>{activeProduct.name}</h1>
          <p>Tap any design — full preview and customizer open on the right.</p>
        </div>
        <div className="gallery-page-pill">
          <span className="gallery-page-pill-dot" />
          {VARIANT_COUNT[activeTheme]} designs
        </div>
      </header>

      {groups.map(({ group, items }) => {
        const groupColour = SKY_GROUP_COLOURS[group] || "#cc0a00";
        return (
          <section key={group} className="main-group">
            <header className="main-group-head">
              <span className="main-group-pill" style={{ background: `${groupColour}22`, color: groupColour }}>
                <i style={{ background: groupColour }} /> {group}
              </span>
              <span className="main-group-count">{items.length}</span>
            </header>
            <div className="main-grid">
              {items.map((p) => {
                const active = p.code === selectedCode;
                return (
                  <button
                    key={p.code || p.name}
                    type="button"
                    className={`main-card${active ? " active" : ""}`}
                    onClick={() => onCardClick(p)}
                    title={p.code ? `${p.code} ${p.name}` : p.name}
                  >
                    <span className="main-card-preview">
                      {p.preview ? (
                        <img src={p.preview} alt={p.name} />
                      ) : (
                        <span className="main-card-mock" style={{ background: p.brand }} />
                      )}
                    </span>
                    <span className="main-card-foot">
                      <span
                        className="main-card-tag"
                        style={{ background: p.brand }}
                        title={p.brand}
                      />
                      <span className="main-card-code">{p.code || p.name}</span>
                      {active && <span className="main-card-active">✓</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="site-footer-brand">
          <div className="app-mark"><img src="/brand-logo.png" alt="AllThemeExch" /></div>
          <div>
            <strong>ALLTHEMEEXCH</strong>
            <small>White-label gaming platforms, done right.</small>
          </div>
        </div>
        <div className="site-footer-trust">
          <span>🔒 Secure &amp; reliable</span>
          <span>💬 24/7 support</span>
        </div>
        <p className="site-footer-legal">
          © {new Date().getFullYear()} allexchtheme. For licensed operators only.
        </p>
      </footer>
    </div>
  );
}
