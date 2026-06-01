import { useMemo } from "react";
import {
  SKY_PRESETS,
  TIGER_PRESETS,
  SKY_GROUP_COLOURS,
} from "../hooks/useConfig";

/**
 * Notion-style gallery on the left side of the workspace. Click a card →
 * the selected variant updates (brand applies + right panel shows that
 * variant's full design). No inline expansion — everything lives on the right.
 */
export default function MainGallery({ activeTheme, selectedCode, onSelectVariant }) {
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

  return (
    <div className="gallery-page">
      <header className="gallery-page-head">
        <div>
          <h1>{isSky ? "Sky Theme" : "Tiger Theme"}</h1>
          <p>Tap any design — full preview and customizer open on the right.</p>
        </div>
        <div className="gallery-page-pill">
          <span className="gallery-page-pill-dot" />
          Gallery
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
    </div>
  );
}
