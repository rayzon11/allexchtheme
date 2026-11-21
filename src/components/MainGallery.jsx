import { useEffect, useMemo, useState } from "react";
import {
  SKY_GROUP_COLOURS,
  THEMES,
  PRODUCTS,
  getProduct,
} from "../hooks/useConfig";

const VARIANT_COUNT = Object.fromEntries(
  Object.entries(PRODUCTS).map(([id, p]) => [id, p.presets.length])
);

/**
 * Notion-style gallery on the left side of the workspace. Click a card →
 * the selected variant updates (brand applies + right panel shows that
 * variant's full design). No inline expansion — everything lives on the right.
 *
 * A white-label PRODUCT switcher sits at the top so the customer can jump
 * between brands (Sky Exchange, Tiger Exch, + upcoming) like a marketplace.
 */
export default function MainGallery({ activeTheme, setActiveTheme, selectedCode, onSelectVariant, onRequest }) {
  const groups = useMemo(() => {
    const order = ["Yellow", "Green", "Orange", "Red", "Blue", "Purple", "White"];
    const list = getProduct(activeTheme).presets;
    const buckets = {};
    list.forEach((p) => { (buckets[p.group || "Other"] ||= []).push(p); });
    return order.filter((g) => buckets[g]).map((g) => ({ group: g, items: buckets[g] }));
  }, [activeTheme]);

  const [filter, setFilter] = useState("All");
  useEffect(() => { setFilter("All"); }, [activeTheme]);
  const views = getProduct(activeTheme).views;
  const visible = useMemo(
    () => groups.filter((g) => filter === "All" || g.group === filter).flatMap((g) => g.items),
    [groups, filter]
  );

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
                  {!active && t.isNew && <span className="product-card-badge new">New</span>}
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
          <p>Tap any design to see every screen — desktop, mobile and login.</p>
        </div>
        <div className="gallery-page-pill">
          <span className="gallery-page-pill-dot" />
          {VARIANT_COUNT[activeTheme]} designs
        </div>
      </header>

      {/* COLOUR FILTER — sticky so it stays reachable while scrolling */}
      <nav className="colour-filter" aria-label="Filter designs by colour">
        <button
          type="button"
          className={`colour-chip${filter === "All" ? " active" : ""}`}
          onClick={() => setFilter("All")}
        >
          All <b>{VARIANT_COUNT[activeTheme]}</b>
        </button>
        {groups.map(({ group, items }) => (
          <button
            key={group}
            type="button"
            className={`colour-chip${filter === group ? " active" : ""}`}
            onClick={() => setFilter(group)}
          >
            <i style={{ background: SKY_GROUP_COLOURS[group] || "#cc0a00" }} />
            {group} <b>{items.length}</b>
          </button>
        ))}
      </nav>

      <div className="main-grid" key={activeTheme + filter}>
        {visible.map((p, i) => {
          const active = p.code === selectedCode;
          const mobileShot = views[p.code]?.mobileHome;
          return (
            <button
              key={p.code || p.name}
              type="button"
              className={`main-card${active ? " active" : ""}`}
              style={{ "--card-brand": p.brand, animationDelay: `${Math.min(i, 8) * 35}ms` }}
              onClick={() => onCardClick(p)}
              title={`${p.code} ${p.name}`}
            >
              <span className="main-card-preview">
                {p.preview ? (
                  <img src={p.preview} alt={`${p.name} desktop`} loading="lazy" />
                ) : (
                  <span className="main-card-mock" style={{ background: p.brand }} />
                )}
                {mobileShot && (
                  <span className="main-card-phone">
                    <img src={mobileShot} alt="" loading="lazy" />
                  </span>
                )}
                {active && <span className="main-card-active">✓ Selected</span>}
                <span className="main-card-view">View design →</span>
              </span>
              <span className="main-card-foot">
                <span className="main-card-tag" style={{ background: p.brand }} />
                <span className="main-card-title">
                  <strong>{p.name}</strong>
                  <small>{p.code} · {p.brand.toUpperCase()}</small>
                </span>
              </span>
            </button>
          );
        })}
      </div>

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
