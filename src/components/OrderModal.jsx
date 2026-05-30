import { useEffect, useState } from "react";

export default function OrderModal({
  isOpen,
  onClose,
  activeTheme,
  siteName,
  logoSrc,
  brand,
  domain,
}) {
  const [form, setForm] = useState({ name: "", whatsapp: "", email: "", company: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSent(false);
      setForm({ name: "", whatsapp: "", email: "", company: "" });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isSky = activeTheme === "sky";
  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim() || !form.email.trim()) {
      alert("Please fill in Name, WhatsApp and Email.");
      return;
    }
    setSent(true);
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="order-modal" role="dialog" aria-modal="true">
        <button className="order-modal-close" onClick={onClose} aria-label="Close">×</button>

        {sent ? (
          <div className="order-success">
            <div className="tick">✓</div>
            <h3>Request Sent!</h3>
            <p>We will WhatsApp you within 24 hours to discuss your design.</p>
          </div>
        ) : (
          <>
            <h2>🚀 Request This Design</h2>
            <div className="sub">We'll contact you within 24 hours</div>

            <div className="order-summary-row">
              <div className="order-summary-line">
                <span className="label">Theme</span>
                <span className="order-theme-badge">
                  {isSky ? "Sky Exchange" : "Tiger Exch"}
                </span>
              </div>
              <div className="order-summary-line">
                <span className="label">Site Name</span>
                <span className="val">{siteName}</span>
              </div>
              {domain && (
                <div className="order-summary-line">
                  <span className="label">Domain</span>
                  <span className="val">{domain}</span>
                </div>
              )}
              <div className="order-summary-line">
                <span className="label">Brand Colour</span>
                <span className="order-brand-chip">
                  <span className="order-brand-chip-dot" style={{ background: brand }} />
                  <span className="hex">{brand}</span>
                </span>
              </div>
              <div className="order-summary-line">
                <span className="label">Logo</span>
                {logoSrc ? (
                  <span className="order-logo-preview">
                    <img src={logoSrc} alt="logo" />
                    <span className="val" style={{ fontSize: 11 }}>Uploaded ✓</span>
                  </span>
                ) : (
                  <span className="val" style={{ color: "#94a3b8", fontWeight: 500 }}>No logo</span>
                )}
              </div>
            </div>

            <form className="order-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name *"
                value={form.name}
                onChange={handleChange("name")}
                required
              />
              <input
                type="tel"
                placeholder="WhatsApp Number (with country code) *"
                value={form.whatsapp}
                onChange={handleChange("whatsapp")}
                required
              />
              <input
                type="email"
                placeholder="Email Address *"
                value={form.email}
                onChange={handleChange("email")}
                required
              />
              <input
                type="text"
                placeholder="Company / Brand Name (optional)"
                value={form.company}
                onChange={handleChange("company")}
              />
              <div className="order-actions">
                <button type="button" className="order-cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="order-submit-btn">
                  Send Request ✓
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
