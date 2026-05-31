import { useRef } from "react";

/**
 * Single logo upload control — preview thumbnail with name + remove button,
 * then a click-to-upload zone, then a size slider.
 * No demo grid. One logo, one upload.
 */
export default function LogoUpload({
  logoSrc,
  logoFileName,
  logoError,
  hasCustomLogo,
  onUpload,
  onRemove,
  size,
  onSizeChange,
  sizeMin = 16,
  sizeMax = 96,
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
      <div className="logo-preview">
        {logoSrc ? (
          <img src={logoSrc} alt="logo" className="logo-preview-thumb" />
        ) : (
          <span className="logo-preview-name" style={{ color: "#908a82" }}>No logo</span>
        )}
        <span className="logo-preview-name">
          {hasCustomLogo ? logoFileName : "Default"}
        </span>
        {hasCustomLogo && (
          <button
            type="button"
            className="logo-remove-btn"
            onClick={onRemove}
            aria-label="Revert to default"
            title="Revert to default"
          >×</button>
        )}
      </div>

      <button
        type="button"
        className="logo-upload-zone"
        onClick={handleClick}
        style={{ marginTop: 8 }}
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

      {typeof size === "number" && onSizeChange && (
        <div className="logo-size-row">
          <span className="logo-size-label">Size</span>
          <input
            type="range"
            className="logo-size-slider"
            min={sizeMin}
            max={sizeMax}
            step={1}
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
          />
          <span className="logo-size-value">{size}px</span>
        </div>
      )}
    </div>
  );
}
