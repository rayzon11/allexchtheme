import { useEffect, useMemo, useState } from "react";
import { SKY_VIEWS, TIGER_VIEWS } from "../hooks/useConfig";

/**
 * Amazon-style full product view. Opens when a customer clicks a theme card.
 * Big main image + thumbnail strip of all 6 views, variant info, colour chips,
 * and clear Request / Customize CTAs.
 */
export default function ProductModal({ variant, isSky, onClose, onRequest, onCustomize }) {
  const views = useMemo(() => {
    if (!variant) return [];
    const map = (isSky ? SKY_VIEWS : TIGER_VIEWS)[variant.code] || {};
    return [
      { label: "Desktop · Home", kind: "desktop", src: map.desktopHome },
      { label: "Desktop · Login", kind: "desktop", src: map.desktopLogin },
      { label: "Desktop · After login", kind: "desktop", src: map.desktopAfterLogin },
      { label: "Mobile · Home", kind: "mobile", src: map.mobileHome },
      { label: "Mobile · Login", kind: "mobile", src: map.mobileLogin },
      { label: "Mobile · After login", kind: "mobile", src: map.mobileAfterLogin },
    ].filter((v) => v.src);
  }, [variant, isSky]);

  const [active, setActive] = useState(0);

  useEffect(() => { setActive(0); }, [variant]);

  useEffect(() => {
    if (!variant) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % views.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + views.length) % views.length);
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [variant, views.length, onClose]);

  if (!variant) return null;
  const current = views[active] || views[0];

  return (
    <div className="pm-overlay" onClick={onClose} role="dialog" aria-label={`${variant.name} preview`}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pm-close" onClick={onClose} aria-label="Close">✕</button>

        {/* GALLERY */}
        <div className="pm-gallery">
          <div className={`pm-stage pm-stage-${current?.kind || "desktop"}`}>
            {current?.src && <img src={current.src} alt={current.label} />}
          </div>
          <div className="pm-caption">{current?.label}</div>
          <div className="pm-thumbs">
            {views.map((v, i) => (
              <button
                key={v.label}
                type="button"
                className={`pm-thumb${i === active ? " active" : ""}`}
                onClick={() => setActive(i)}
                title={v.label}
              >
                <img src={v.src} alt={v.label} loading="lazy" />
                <span className="pm-thumb-tag">{v.kind === "mobile" ? "📱" : "🖥"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <aside className="pm-info">
          <div className="pm-info-head">
            <span className="pm-code">{variant.code}</span>
            <span className="pm-group">{variant.group}</span>
          </div>
          <h2 className="pm-name">{variant.name}</h2>
          <p className="pm-platform">{isSky ? "Sky Exchange" : "Tiger Exch"} · white-label theme</p>

          <div className="pm-colours">
            <div className="pm-colour">
              <span className="pm-swatch" style={{ background: variant.brand }} />
              <div><strong>Primary</strong><small>{variant.brand?.toUpperCase()}</small></div>
            </div>
            {variant.accent && (
              <div className="pm-colour">
                <span className="pm-swatch" style={{ background: variant.accent }} />
                <div><strong>Accent</strong><small>{variant.accent.toUpperCase()}</small></div>
              </div>
            )}
          </div>

          <ul className="pm-features">
            <li>✓ Pixel-perfect, ready-to-launch design</li>
            <li>✓ Desktop &amp; mobile views included</li>
            <li>✓ Your logo &amp; brand applied</li>
            <li>✓ Same-day setup &amp; managed hosting</li>
          </ul>

          <div className="pm-actions">
            <button type="button" className="pm-cta-primary" onClick={onRequest}>
              🚀 Request this design
            </button>
            <button type="button" className="pm-cta-ghost" onClick={onCustomize}>
              🎨 Customize &amp; preview
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
