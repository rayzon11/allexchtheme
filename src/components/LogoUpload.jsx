import { useRef } from "react";

/**
 * Minimal logo control — just the customer's own logo + an upload/replace zone.
 * No default logo, no size slider, no colour controls. One logo, one upload.
 */
export default function LogoUpload({
  logoSrc,
  logoFileName,
  logoError,
  hasCustomLogo,
  onUpload,
  onRemove,
  uploadLabel = "Upload your logo",
  replaceLabel = "Replace logo",
}) {
  const inputRef = useRef(null);
  const handleClick = () => inputRef.current?.click();
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <div>
      {hasCustomLogo && (
        <div className="logo-preview">
          <img src={logoSrc} alt="Your logo" className="logo-preview-thumb" />
          <span className="logo-preview-name">{logoFileName || "Your logo"}</span>
          <button
            type="button"
            className="logo-remove-btn"
            onClick={onRemove}
            aria-label="Remove logo"
            title="Remove logo"
          >×</button>
        </div>
      )}

      <button
        type="button"
        className="logo-upload-zone"
        onClick={handleClick}
        style={hasCustomLogo ? { marginTop: 8 } : undefined}
      >
        <span>
          <strong style={{ display: "block", marginBottom: 2, color: "#f4f1ec", fontSize: 13 }}>
            {hasCustomLogo ? replaceLabel : uploadLabel}
          </strong>
          <small style={{ fontSize: 11 }}>PNG, JPG, SVG, WebP &middot; max 5MB</small>
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        onChange={handleChange}
        style={{ display: "none" }}
      />
      {logoError && <p className="logo-error">{logoError}</p>}
    </div>
  );
}
