import { useEffect } from "react";

/** Full-size viewer for one screen of a design, with desktop/mobile and screen switches. */
export default function Lightbox({
  kind, setKind, desktopSrc, mobileSrc, title, screens, screenId, setScreenId, onClose,
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const src = kind === "mobile" && mobileSrc ? mobileSrc : desktopSrc;
  const shown = kind === "mobile" && mobileSrc ? "mobile" : "desktop";

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="lightbox-top" onClick={(e) => e.stopPropagation()}>
        <strong>{title}</strong>
        <div className="lightbox-switches">
          <div className="segmented" role="tablist" aria-label="Screen">
            {screens.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={s.id === screenId}
                className={s.id === screenId ? "is-active" : ""}
                onClick={() => setScreenId(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
          {mobileSrc && (
            <div className="segmented" role="tablist" aria-label="Device">
              <button type="button" role="tab" aria-selected={shown === "desktop"} className={shown === "desktop" ? "is-active" : ""} onClick={() => setKind("desktop")}>Desktop</button>
              <button type="button" role="tab" aria-selected={shown === "mobile"} className={shown === "mobile" ? "is-active" : ""} onClick={() => setKind("mobile")}>Mobile</button>
            </div>
          )}
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close viewer">✕</button>
      </div>
      <div className={`lightbox-body is-${shown}`}>
        <img key={src} src={src} alt={`${title}, ${shown}`} onClick={(e) => e.stopPropagation()} />
      </div>
    </div>
  );
}
