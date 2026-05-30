import { useRef } from "react";
import { DEMO_LOGOS } from "../hooks/useConfig";

/**
 * Logo upload control with preview + Upload button + (optional) demo grid.
 * Pass `showDemos={false}` for the secondary "Mark / Icon" slot so we don't
 * clutter the panel with the same demo strip twice.
 */
export default function LogoUpload({
  logoSrc,
  logoFileName,
  logoError,
  hasCustomLogo,
  onUpload,
  onRemove,
  onApplyDemo,
  size,
  onSizeChange,
  sizeMin = 16,
  sizeMax = 96,
  showDemos = true,
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
          <span className="logo-preview-name" style={{ color: "#64748b" }}>No logo</span>
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
        style={{ marginTop: 8, minHeight: showDemos ? 56 : 44 }}
      >
        <span>
          <strong style={{ display: "block", marginBottom: 2, color: "#cbd5e1", fontSize: 12 }}>
            {hasCustomLogo ? replaceLabel : uploadLabel}
          </strong>
          <small style={{ fontSize: 10 }}>PNG, JPG, SVG, WebP &middot; max 5MB</small>
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

      {showDemos && onApplyDemo && (
        <>
          <div className="demo-logos-title">Or pick a demo logo</div>
          <div className="demo-logos-grid">
            {DEMO_LOGOS.map((d) => (
              <button
                key={d.name}
                type="button"
                className={`demo-logo${logoSrc === d.src ? " active" : ""}`}
                onClick={() => onApplyDemo(d)}
                title={d.name}
              >
                <img src={d.src} alt={d.name} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
