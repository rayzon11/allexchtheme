import { useEffect } from "react";
import TigerExchTheme from "./themes/TigerExchTheme";

/**
 * Fullscreen Tiger preview overlay. Triggered when the customer clicks a Tiger
 * design shop card — the live iframe-rendered preview slides in over the whole
 * app, with a close button and the variant name. Escape key closes too.
 */
export default function PreviewOverlay({ isOpen, onClose, variantName, themeProps }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-overlay-card" onClick={(e) => e.stopPropagation()}>
        <header className="preview-overlay-bar">
          <span className="preview-overlay-dots"><i /><i /><i /></span>
          <span className="preview-overlay-title">
            {variantName ? `Tiger — ${variantName}` : "Tiger Preview"}
          </span>
          <button type="button" className="preview-overlay-close" onClick={onClose} aria-label="Close preview">
            ✕
          </button>
        </header>
        <div className="preview-overlay-stage">
          <TigerExchTheme {...themeProps} />
        </div>
      </div>
    </div>
  );
}
