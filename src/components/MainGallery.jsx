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

  const scrollToGallery = () => {
    document.getElementById("designs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
      {/* HERO — instant value proposition + trust */}
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-inner">
          <span className="hero-badge">
            <span className="hero-badge-dot" /> Trusted white-label gaming platforms
          </span>
          <h1 className="hero-title">
            Launch your own <span className="hero-title-grad">betting exchange</span><br />
            ready in hours — not months
          </h1>
          <p className="hero-sub">
            Pick a proven Sky&nbsp;Exchange or Tiger&nbsp;Exch design, drop in your
            brand and colours, and go live. Pixel-perfect, mobile-ready, and fully
            managed for you.
          </p>
          <div className="hero-actions">
            <button type="button" className="hero-cta-primary" onClick={onRequest}>
              🚀 Get my site
            </button>
            <button type="button" className="hero-cta-ghost" onClick={scrollToGallery}>
              Browse {THEMES.length} platforms ↓
            </button>
          </div>
          <ul className="hero-trust">
            <li>✓ Same-day setup</li>
            <li>✓ 40+ colour themes</li>
            <li>✓ 100% mobile-perfect</li>
            <li>✓ Dedicated support</li>
          </ul>
        </div>
      </section>

      {/* TRUST / STATS STRIP */}
      <section className="trust-strip">
        <div className="trust-stat">
          <strong>200+</strong>
          <span>Brands launched</span>
        </div>
        <div className="trust-stat">
          <strong>2</strong>
          <span>Proven platforms</span>
        </div>
        <div className="trust-stat">
          <strong>40+</strong>
          <span>Ready colour themes</span>
        </div>
        <div className="trust-stat">
          <strong>24/7</strong>
          <span>Support &amp; uptime</span>
        </div>
      </section>

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

      {/* HOW IT WORKS — builds confidence in the process */}
      <section className="how">
        <header className="how-head">
          <span className="how-eyebrow">How it works</span>
          <h2>Live in 3 simple steps</h2>
        </header>
        <div className="how-grid">
          <div className="how-step">
            <span className="how-num">1</span>
            <strong>Pick a platform</strong>
            <p>Choose a proven Sky or Tiger design from {THEMES.length} live platforms.</p>
          </div>
          <div className="how-step">
            <span className="how-num">2</span>
            <strong>Make it yours</strong>
            <p>Set your brand colour, drop in your logo, and preview every page instantly.</p>
          </div>
          <div className="how-step">
            <span className="how-num">3</span>
            <strong>Go live</strong>
            <p>We deploy your fully-managed site — mobile-perfect and ready for players.</p>
          </div>
        </div>
        <div className="how-cta">
          <button type="button" className="hero-cta-primary" onClick={onRequest}>
            🚀 Get my site now
          </button>
          <span className="how-cta-note">No setup fee surprises · Same-day delivery</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="site-footer-brand">
          <div className="app-mark">A</div>
          <div>
            <strong>allexchtheme</strong>
            <small>White-label gaming platforms, done right.</small>
          </div>
        </div>
        <div className="site-footer-trust">
          <span>🔒 Secure &amp; reliable</span>
          <span>⚡ Same-day setup</span>
          <span>💬 24/7 support</span>
        </div>
        <p className="site-footer-legal">
          © {new Date().getFullYear()} allexchtheme. For licensed operators only.
        </p>
      </footer>
    </div>
  );
}
