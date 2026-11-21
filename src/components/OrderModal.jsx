import { useEffect, useRef, useState } from "react";

// WhatsApp number that receives requests, digits only with country code
// (for example "919876543210"). While this is empty the form only shows the
// confirmation screen and the request is NOT delivered anywhere.
const REQUEST_WHATSAPP = "";

const EMPTY = { name: "", whatsapp: "", email: "", company: "" };

export default function OrderModal({
  isOpen, onClose, productName, variant,
  siteName, setSiteName,
  logoSrc, logoFileName, hasCustomLogo, logoError, uploadLogo, removeLogo,
}) {
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setSent(false);
    setError("");
    setForm(EMPTY);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim() || !form.email.trim()) {
      setError("Add your name, WhatsApp number and email so we can reach you.");
      return;
    }
    setError("");
    if (REQUEST_WHATSAPP) {
      const text = [
        "New design request",
        `Platform: ${productName}`,
        `Colour: ${variant.name} (${variant.code}, ${variant.brand.toUpperCase()})`,
        `Site name: ${siteName || "-"}`,
        `Logo: ${hasCustomLogo ? "ready to send" : "to follow"}`,
        `Name: ${form.name}`,
        `WhatsApp: ${form.whatsapp}`,
        `Email: ${form.email}`,
        form.company ? `Company: ${form.company}` : "",
      ].filter(Boolean).join("\n");
      window.open(`https://wa.me/${REQUEST_WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }
    setSent(true);
  };

  return (
    <div className="modal-wrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="order-title">
        <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label="Close">✕</button>

        {sent ? (
          <div className="modal-done">
            <div className="modal-done-mark" aria-hidden="true">✓</div>
            <h2 id="order-title">Request sent</h2>
            <p>We will WhatsApp you within 24 hours to confirm the details.</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>Back to the designs</button>
          </div>
        ) : (
          <>
            <h2 id="order-title">Request this design</h2>

            <div className="order-pick">
              <span className="order-pick-shot"><img src={variant.preview} alt="" /></span>
              <div>
                <strong>{productName} in {variant.name}</strong>
                <small>
                  <i style={{ background: variant.brand }} />
                  <span>{variant.code}</span><span>{variant.brand.toUpperCase()}</span>
                </small>
              </div>
            </div>

            <form className="form" onSubmit={submit} noValidate>
              <label className="field">
                <span>Your site name</span>
                <input type="text" value={siteName} maxLength={20} onChange={(e) => setSiteName(e.target.value)} placeholder="For example MYEXCH247" />
              </label>

              <div className="field">
                <span>Your logo (optional)</span>
                {hasCustomLogo ? (
                  <div className="logo-row">
                    <img src={logoSrc} alt="Your logo" />
                    <em>{logoFileName || "Logo added"}</em>
                    <button type="button" className="btn btn-quiet btn-small" onClick={removeLogo}>Remove</button>
                  </div>
                ) : (
                  <button type="button" className="upload" onClick={() => fileRef.current?.click()}>
                    <strong>Upload logo</strong>
                    <small>PNG, JPG, SVG or WebP, up to 5 MB</small>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  hidden
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ""; }}
                />
                {logoError && <p className="form-error">{logoError}</p>}
              </div>

              <div className="field-pair">
                <label className="field">
                  <span>Full name</span>
                  <input type="text" value={form.name} onChange={set("name")} autoComplete="name" required />
                </label>
                <label className="field">
                  <span>WhatsApp number</span>
                  <input type="tel" value={form.whatsapp} onChange={set("whatsapp")} autoComplete="tel" placeholder="With country code" required />
                </label>
              </div>
              <div className="field-pair">
                <label className="field">
                  <span>Email</span>
                  <input type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
                </label>
                <label className="field">
                  <span>Company (optional)</span>
                  <input type="text" value={form.company} onChange={set("company")} autoComplete="organization" />
                </label>
              </div>

              {error && <p className="form-error" role="alert">{error}</p>}

              <div className="form-actions">
                <button type="button" className="btn btn-quiet" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send request</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
