import { useEffect, useMemo, useRef, useState } from "react";
import { THEMES } from "../hooks/useConfig";

/**
 * Theme picker that scales to 20+ products.
 * Top-bar trigger shows the current theme name; clicking opens a popover
 * (desktop) or full-screen sheet (mobile) with searchable, category-grouped
 * theme cards. Live themes are clickable, coming-soon themes are dimmed
 * with a "Soon" badge.
 */
export default function ThemeSelector({ activeTheme, setActiveTheme }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const popRef = useRef(null);
  const triggerRef = useRef(null);

  const current = THEMES.find((t) => t.id === activeTheme) || THEMES[0];

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (popRef.current?.contains(e.target)) return;
      if (triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups = useMemo(() => {
    const filter = q.trim().toLowerCase();
    const matches = (t) =>
      !filter ||
      t.name.toLowerCase().includes(filter) ||
      t.tagline.toLowerCase().includes(filter) ||
      t.category.toLowerCase().includes(filter);
    const order = ["Exchange", "Sportsbook", "Casino"];
    const buckets = {};
    THEMES.filter(matches).forEach((t) => {
      (buckets[t.category] ||= []).push(t);
    });
    return order.filter((k) => buckets[k]).map((k) => ({ category: k, items: buckets[k] }));
  }, [q]);

  const liveCount = THEMES.filter((t) => t.live).length;
  const total = THEMES.length;

  const pickTheme = (t) => {
    if (!t.live) return;
    setActiveTheme(t.id);
    setOpen(false);
    setQ("");
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={`theme-trigger${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="theme-trigger-thumb">
          <img src={current.cover} alt="" />
        </span>
        <span className="theme-trigger-text">
          <strong>{current.name}</strong>
          <small>{current.category} · {liveCount}/{total} live</small>
        </span>
        <span className="theme-trigger-chev">▾</span>
      </button>

      {open && (
        <>
          <div className="theme-sheet-backdrop" onClick={() => setOpen(false)} />
          <div className="theme-pop" ref={popRef} role="dialog" aria-label="Choose theme">
            <header className="theme-pop-head">
              <strong>Choose a theme</strong>
              <button type="button" className="theme-pop-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </header>
            <div className="theme-pop-search">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search themes…"
                autoFocus
              />
            </div>

            <div className="theme-pop-body">
              {groups.length === 0 && (
                <div className="theme-pop-empty">No themes match “{q}”</div>
              )}
              {groups.map(({ category, items }) => (
                <section key={category} className="theme-pop-group">
                  <header className="theme-pop-group-head">
                    <span className="theme-pop-group-name">{category}</span>
                    <span className="theme-pop-group-count">{items.length}</span>
                  </header>
                  <div className="theme-pop-grid">
                    {items.map((t) => {
                      const isActive = t.id === activeTheme;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`theme-pop-card${isActive ? " active" : ""}${t.live ? "" : " soon"}`}
                          onClick={() => pickTheme(t)}
                          disabled={!t.live}
                          title={t.live ? t.tagline : "Coming soon"}
                        >
                          <span className="theme-pop-card-cover">
                            <img src={t.cover} alt={t.name} />
                            {!t.live && <span className="theme-pop-card-badge">Soon</span>}
                            {isActive && <span className="theme-pop-card-badge active">✓ Active</span>}
                          </span>
                          <span className="theme-pop-card-meta">
                            <span className="theme-pop-card-name">{t.name}</span>
                            <span className="theme-pop-card-tag">{t.tagline}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
