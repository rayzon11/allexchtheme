import { useEffect } from "react";

/**
 * Notion-style detail modal that opens when the customer clicks any Sky variant
 * card in the grouped gallery. Shows the variant in both Desktop and Mobile
 * presentations so the boss can preview every aspect of the design in one place.
 */
export default function VariantDetailModal({ variant, onClose, onApply }) {
  useEffect(() => {
    if (!variant) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant, onClose]);

  if (!variant) return null;

  return (
    <div className="variant-modal" onClick={onClose}>
      <div className="variant-modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="variant-modal-head">
          <div className="variant-modal-title">
            <span className="variant-modal-code" style={{ background: variant.brand }}>{variant.code}</span>
            <strong>{variant.name}</strong>
            <span className="variant-modal-group">{variant.group}</span>
          </div>
          <div className="variant-modal-actions">
            <button type="button" className="variant-apply-btn" onClick={onApply}>
              ✓ Apply this design
            </button>
            <button type="button" className="variant-close-btn" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </header>

        <div className="variant-modal-body">
          {/* DESKTOP section */}
          <section className="variant-section">
            <h3 className="variant-section-title">
              <span className="variant-section-icon">🖥️</span> Desktop
            </h3>
            <div className="variant-section-grid variant-section-grid-desktop">
              <figure className="variant-frame variant-frame-desktop">
                <figcaption>Home page</figcaption>
                <div className="variant-frame-inner">
                  <img src={variant.preview} alt={`${variant.name} desktop home`} />
                </div>
              </figure>
              <figure className="variant-frame variant-frame-desktop">
                <figcaption>Login modal</figcaption>
                <div className="variant-frame-inner variant-frame-login">
                  <img src={variant.preview} alt={`${variant.name} desktop login`} />
                  <div className="variant-frame-login-modal" style={{ borderTopColor: variant.brand }}>
                    <div className="variant-login-strip" style={{ background: variant.brand }}>
                      Please login to continue
                    </div>
                    <div className="variant-login-fields">
                      <span>Username</span>
                      <span>Password</span>
                      <span>Validation Code</span>
                      <button style={{ background: variant.brand }}>Login</button>
                    </div>
                  </div>
                </div>
              </figure>
            </div>
          </section>

          {/* MOBILE section */}
          <section className="variant-section">
            <h3 className="variant-section-title">
              <span className="variant-section-icon">📱</span> Mobile
            </h3>
            <div className="variant-section-grid variant-section-grid-mobile">
              <figure className="variant-frame variant-frame-mobile">
                <figcaption>Home</figcaption>
                <div className="variant-frame-inner">
                  <img src={variant.preview} alt={`${variant.name} mobile home`} />
                </div>
              </figure>
              <figure className="variant-frame variant-frame-mobile">
                <figcaption>Login</figcaption>
                <div className="variant-frame-inner variant-frame-login-mobile" style={{ background: variant.brand }}>
                  <div className="variant-mlogin-banner" />
                  <div className="variant-mlogin-fields">
                    <span>Username</span>
                    <span>Password</span>
                    <button style={{ background: variant.brand }}>Login</button>
                  </div>
                </div>
              </figure>
              <figure className="variant-frame variant-frame-mobile">
                <figcaption>Inside</figcaption>
                <div className="variant-frame-inner">
                  <img src={variant.preview} alt={`${variant.name} mobile inside`} style={{ objectPosition: "bottom" }} />
                </div>
              </figure>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
