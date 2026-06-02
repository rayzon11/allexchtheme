import { useEffect, useMemo, useState } from "react";
import { THEMES } from "../hooks/useConfig";

const CATEGORIES = ["All", "Exchange", "Sportsbook", "Casino"];

/**
 * Theme marketplace — full-screen shopping experience.
 * Trigger pill in the top bar shows the active theme; clicking opens a
 * big shop view with hero, search, category filters, and product cards.
 */
export default function ThemeSelector({ activeTheme, setActiveTheme }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const current = THEMES.find((t) => t.id === activeTheme) || THEMES[0];
  const liveCount = THEMES.filter((t) => t.live).length;
  const total = THEMES.length;

  // Lock page scroll when shop is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const filter = q.trim().toLowerCase();
    return THEMES.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (!filter) return true;
      return (
        t.name.toLowerCase().includes(filter) ||
        t.tagline.toLowerCase().includes(filter) ||
        t.category.toLowerCase().includes(filter)
      );
    });
  }, [q, cat]);

  const featured = useMemo(() => THEMES.find((t) => t.live) || THEMES[0], []);

  const pickTheme = (t) => {
    if (!t.live) return;
    setActiveTheme(t.id);
    setOpen(false);
    setQ("");
    setCat("All");
  };

  return (
    <>
      <button
        type="button"
        className={`theme-trigger${open ? " open" : ""}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="theme-trigger-thumb">
          <img src={current.cover} alt="" />
        </span>
        <span className="theme-trigger-text">
          <strong>{current.name}</strong>
          <small>Browse all themes</small>
        </span>
        <span className="theme-trigger-chev">▾</span>
      </button>

      {open && (
        <div className="shop-modal" role="dialog" aria-label="Theme marketplace">
          <header className="shop-top">
            <div className="shop-top-brand">
              <div className="app-mark"><img src="/brand-logo.png" alt="AllThemeExch" /></div>
              <div>
                <strong>Theme Shop</strong>
                <small>{liveCount} live · {total - liveCount} coming soon</small>
              </div>
            </div>
            <button type="button" className="shop-close" onClick={() => setOpen(false)} aria-label="Close shop">
              ✕
            </button>
          </header>

          <div className="shop-scroll">
            {/* HERO */}
            <section className="shop-hero">
              <div className="shop-hero-text">
                <span className="shop-hero-eyebrow">Featured</span>
                <h1>{featured.name}</h1>
                <p>{featured.tagline}</p>
                <div className="shop-hero-actions">
                  <button type="button" className="shop-cta" onClick={() => pickTheme(featured)}>
                    Customize this theme →
                  </button>
                  <span className="shop-hero-tag">{featured.category}</span>
                </div>
              </div>
              <div className="shop-hero-art">
                <img src={featured.cover} alt={featured.name} />
              </div>
            </section>

            {/* FILTER BAR */}
            <section className="shop-filters">
              <div className="shop-search">
                <span className="shop-search-icon" aria-hidden="true">🔍</span>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search themes by name, category, or feature…"
                />
                {q && <button type="button" className="shop-search-clear" onClick={() => setQ("")} aria-label="Clear">✕</button>}
              </div>
              <div className="shop-cats">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`shop-cat${cat === c ? " active" : ""}`}
                    onClick={() => setCat(c)}
                  >
                    {c}
                    <span className="shop-cat-count">
                      {c === "All" ? total : THEMES.filter((t) => t.category === c).length}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* PRODUCT GRID */}
            <section className="shop-grid">
              {filtered.length === 0 ? (
                <div className="shop-empty">
                  <strong>No themes match your search</strong>
                  <p>Try different keywords or reset the category filter.</p>
                </div>
              ) : (
                filtered.map((t) => {
                  const isActive = t.id === activeTheme;
                  return (
                    <article
                      key={t.id}
                      className={`shop-product${isActive ? " active" : ""}${t.live ? "" : " soon"}`}
                    >
                      <div className="shop-product-cover">
                        <img src={t.cover} alt={t.name} />
                        {!t.live && <span className="shop-product-badge">Coming soon</span>}
                        {isActive && <span className="shop-product-badge active">✓ Active</span>}
                      </div>
                      <div className="shop-product-body">
                        <div className="shop-product-cat">{t.category}</div>
                        <h3>{t.name}</h3>
                        <p>{t.tagline}</p>
                        <button
                          type="button"
                          className="shop-product-cta"
                          onClick={() => pickTheme(t)}
                          disabled={!t.live}
                        >
                          {t.live ? (isActive ? "✓ Selected — open" : "Customize this →") : "Coming soon"}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </section>
          </div>
        </div>
      )}
    </>
  );
}
