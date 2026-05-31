import { Fragment, useMemo, useState } from "react";
import {
  SKY_PRESETS,
  TIGER_PRESETS,
  SKY_GROUP_COLOURS,
  SKY_VIEWS_FALLBACK,
} from "../hooks/useConfig";

/**
 * One-page gallery. Click any card → an inline drawer slides open BELOW that
 * card showing the 4 views (desktop home/login + mobile home/login) as a
 * horizontal swipeable carousel. No page jump, no modal — the preview appears
 * where the customer clicked.
 */
export default function MainGallery({ activeTheme, brand, setBrand, onTigerPreview }) {
  const isSky = activeTheme === "sky";
  const [openCode, setOpenCode] = useState(null);

  const groups = useMemo(() => {
    if (isSky) {
      const order = ["Yellow", "Green", "Blue", "Red", "Pink", "Purple", "Brown", "Dark"];
      const buckets = {};
      SKY_PRESETS.forEach((p) => { (buckets[p.group || "Other"] ||= []).push(p); });
      return order.filter((g) => buckets[g]).map((g) => ({ group: g, items: buckets[g] }));
    }
    return [{ group: "Tiger", items: TIGER_PRESETS }];
  }, [isSky]);

  const slidesFor = (p) => {
    if (!isSky) return [];
    return [
      { kind: "desktop", label: "Desktop · Home", src: p.preview },
      { kind: "desktop", label: "Desktop · Login", src: SKY_VIEWS_FALLBACK.loginDesktop },
      { kind: "mobile",  label: "Mobile · Home",  src: SKY_VIEWS_FALLBACK.homeMobile },
      { kind: "mobile",  label: "Mobile · Login", src: SKY_VIEWS_FALLBACK.loginMobile },
    ];
  };

  const handleCardClick = (p) => {
    const key = p.code || p.name;
    setBrand(p.brand);
    if (!isSky) {
      onTigerPreview?.();
      return;
    }
    setOpenCode((cur) => (cur === key ? null : key));
  };

  return (
    <div className="gallery-page">
      <header className="gallery-page-head">
        <div>
          <h1>{isSky ? "Sky Theme" : "Tiger Theme"}</h1>
          <p>Pick a design — its full preview slides open right where you click.</p>
        </div>
        <div className="gallery-page-pill">
          <span className="gallery-page-pill-dot" />
          Gallery
        </div>
      </header>

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
                const key = p.code || p.name;
                const active = p.brand.toLowerCase() === brand?.toLowerCase();
                const open = isSky && openCode === key;
                return (
                  <Fragment key={key}>
                    <button
                      type="button"
                      className={`main-card${active ? " active" : ""}${open ? " open" : ""}`}
                      onClick={() => handleCardClick(p)}
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
                        {open && <span className="main-card-chev">▾</span>}
                        {active && !open && <span className="main-card-active">✓</span>}
                      </span>
                    </button>

                    {open && (
                      <InlineViewer
                        variant={p}
                        groupColour={groupColour}
                        slides={slidesFor(p)}
                        onClose={() => setOpenCode(null)}
                      />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function InlineViewer({ variant, groupColour, slides, onClose }) {
  return (
    <div className="inline-viewer" style={{ "--variant-c": variant.brand, "--group-c": groupColour }}>
      <header className="inline-viewer-head">
        <div className="inline-viewer-title">
          <span className="inline-viewer-code" style={{ background: variant.brand }}>
            {variant.code || variant.name}
          </span>
          <strong>{variant.name}</strong>
          {variant.group && <span className="inline-viewer-group">{variant.group}</span>}
        </div>
        <button type="button" className="inline-viewer-close" onClick={onClose} aria-label="Close">✕</button>
      </header>
      <div className="inline-viewer-scroller">
        {slides.map((s, i) => (
          <figure key={i} className={`inline-slide inline-slide-${s.kind}`}>
            <figcaption>{s.label}</figcaption>
            <div className="inline-slide-frame">
              <img src={s.src} alt={s.label} />
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
