import { useEffect, useMemo, useRef, useState } from "react";
import {
  SKY_PRESETS,
  TIGER_PRESETS,
  SKY_GROUP_COLOURS,
  SKY_VIEWS_FALLBACK,
} from "../hooks/useConfig";

/**
 * One-page Notion-style gallery. Top hero is a swipeable carousel showing every
 * view of the currently-selected variant — desktop home, desktop login, mobile
 * home, mobile login — using the boss's saved HTML screenshots. The cards
 * below switch which variant is in the hero. No modals, no page jumps.
 */
export default function MainGallery({ activeTheme, brand, setBrand, onTigerPreview }) {
  const isSky = activeTheme === "sky";
  const scrollerRef = useRef(null);

  const groups = useMemo(() => {
    if (isSky) {
      const order = ["Yellow", "Green", "Blue", "Red", "Pink", "Purple", "Brown", "Dark"];
      const buckets = {};
      SKY_PRESETS.forEach((p) => { (buckets[p.group || "Other"] ||= []).push(p); });
      return order.filter((g) => buckets[g]).map((g) => ({ group: g, items: buckets[g] }));
    }
    return [{ group: "Tiger", items: TIGER_PRESETS }];
  }, [isSky]);

  const activeVariant = useMemo(() => {
    const list = isSky ? SKY_PRESETS : TIGER_PRESETS;
    return list.find((p) => p.brand.toLowerCase() === brand?.toLowerCase()) || list[0];
  }, [isSky, brand]);

  const slides = useMemo(() => {
    if (!activeVariant) return [];
    if (isSky) {
      return [
        { kind: "desktop", label: "Desktop · Home", src: activeVariant.preview },
        { kind: "desktop", label: "Desktop · Login", src: SKY_VIEWS_FALLBACK.loginDesktop },
        { kind: "mobile",  label: "Mobile · Home",  src: SKY_VIEWS_FALLBACK.homeMobile },
        { kind: "mobile",  label: "Mobile · Login", src: SKY_VIEWS_FALLBACK.loginMobile },
      ];
    }
    return [{ kind: "tiger", label: "Tiger · Live preview", src: null }];
  }, [activeVariant, isSky]);

  // Reset scroll position to the start when the active variant changes.
  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [activeVariant?.code, activeVariant?.name]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="gallery-page">
      <header className="gallery-page-head">
        <div>
          <h1>{isSky ? "Sky Theme" : "Tiger Theme"}</h1>
          <p>Swipe through every view, then pick a variant below to switch the design.</p>
        </div>
        <div className="gallery-page-pill">
          <span className="gallery-page-pill-dot" />
          Gallery
        </div>
      </header>

      {/* HERO swipeable viewer */}
      <section className="hero-viewer">
        <div className="hero-viewer-head">
          <div className="hero-variant-tag">
            <span className="hero-variant-code" style={{ background: activeVariant?.brand }}>
              {activeVariant?.code || activeVariant?.name}
            </span>
            <strong>{activeVariant?.name}</strong>
            {activeVariant?.group && <span className="hero-variant-group">{activeVariant.group}</span>}
          </div>
          <div className="hero-controls">
            <button type="button" className="hero-arrow" onClick={() => scrollBy(-1)} aria-label="Previous view">‹</button>
            <button type="button" className="hero-arrow" onClick={() => scrollBy(1)} aria-label="Next view">›</button>
            {!isSky && (
              <button type="button" className="hero-open-tiger" onClick={onTigerPreview}>
                Open live preview
              </button>
            )}
          </div>
        </div>

        <div className="hero-scroller" ref={scrollerRef}>
          {slides.map((s, i) => (
            <figure key={`${activeVariant?.code || activeVariant?.name}-${i}`} className={`hero-slide hero-slide-${s.kind}`}>
              <figcaption>{s.label}</figcaption>
              <div className="hero-slide-frame">
                {s.src ? (
                  <img src={s.src} alt={s.label} />
                ) : (
                  <div className="hero-slide-empty">
                    Click <em>"Open live preview"</em> to see the Tiger variant rendered live.
                  </div>
                )}
              </div>
            </figure>
          ))}
        </div>

        <div className="hero-dots">
          {slides.map((s, i) => (
            <span key={i} className="hero-dot">{s.label.split(" · ")[1] || s.kind}</span>
          ))}
        </div>
      </section>

      {/* GALLERY groups */}
      {groups.map(({ group, items }) => {
        const groupColour = isSky ? SKY_GROUP_COLOURS[group] : "#cc0a00";
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
                const active = p.brand.toLowerCase() === brand?.toLowerCase();
                return (
                  <button
                    key={p.code || p.name}
                    type="button"
                    className={`main-card${active ? " active" : ""}`}
                    onClick={() => setBrand(p.brand)}
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
                      <span className="main-card-tag" style={{ background: groupColour }} />
                      <span className="main-card-code">{p.code || p.name}</span>
                      {active && <span className="main-card-active">✓ Selected</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
