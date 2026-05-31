import { useMemo, useState } from "react";
import {
  SKY_PRESETS,
  TIGER_PRESETS,
  SKY_GROUP_COLOURS,
} from "../hooks/useConfig";
import VariantDetailModal from "./VariantDetailModal";

/**
 * Notion-style main gallery view. The primary canvas the customer browses —
 * variants grouped by colour family, click any card to open the design's
 * Desktop + Mobile preview modal.
 */
export default function MainGallery({ activeTheme, brand, setBrand, onTigerPreview }) {
  const [detail, setDetail] = useState(null);
  const isSky = activeTheme === "sky";

  const groups = useMemo(() => {
    if (isSky) {
      const order = ["Yellow", "Green", "Blue", "Red", "Pink", "Purple", "Brown", "Dark"];
      const buckets = {};
      SKY_PRESETS.forEach((p) => {
        const g = p.group || "Other";
        (buckets[g] ||= []).push(p);
      });
      return order.filter((g) => buckets[g]).map((g) => ({ group: g, items: buckets[g] }));
    }
    // Tiger — flat group so the same gallery component renders both themes.
    return [{ group: "Tiger", items: TIGER_PRESETS }];
  }, [isSky]);

  const onCardClick = (p) => {
    if (isSky) {
      // Sky variants open the rich detail modal that shows desktop + mobile.
      setDetail(p);
    } else {
      // Tiger variants apply brand + pop the live preview overlay.
      setBrand(p.brand);
      onTigerPreview?.();
    }
  };

  return (
    <div className="main-gallery">
      <header className="main-gallery-head">
        <div>
          <h1>{isSky ? "Sky Theme" : "Tiger Theme"}</h1>
          <p>Browse the design gallery — click any variant to preview the full design.</p>
        </div>
        <div className="main-gallery-pill">
          <span className="main-gallery-pill-dot" />
          Gallery
        </div>
      </header>

      {groups.map(({ group, items }) => {
        const groupColour = isSky ? SKY_GROUP_COLOURS[group] : "#cc0a00";
        return (
          <section key={group} className="main-group">
            <header className="main-group-head">
              <span
                className="main-group-pill"
                style={{ background: `${groupColour}22`, color: groupColour }}
              >
                <i style={{ background: groupColour }} />
                {group}
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
                      <span className="main-card-tag" style={{ background: groupColour }} />
                      <span className="main-card-code">
                        {p.code || p.name}
                      </span>
                      {active && <span className="main-card-active">✓ Selected</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <VariantDetailModal
        variant={detail}
        onClose={() => setDetail(null)}
        onApply={() => {
          if (detail) setBrand(detail.brand);
          setDetail(null);
        }}
      />
    </div>
  );
}
