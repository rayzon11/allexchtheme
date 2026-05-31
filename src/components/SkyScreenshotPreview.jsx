import { useMemo } from "react";
import { SKY_PRESETS } from "../hooks/useConfig";

/**
 * Sky preview that renders the selected variant's saved screenshot instead of the
 * heavy iframe. The shop card the customer clicked drives `brand`, and we look the
 * matching screenshot up by hex. If no screenshot is found we fall back to the
 * Original Sky shot so the right pane is never blank.
 */
export default function SkyScreenshotPreview({ brand, deviceMode = "desktop", siteName }) {
  const src = useMemo(() => {
    const target = (brand || "").toLowerCase();
    const hit = SKY_PRESETS.find((p) => p.brand.toLowerCase() === target && p.preview);
    return hit?.preview || SKY_PRESETS[0]?.preview || null;
  }, [brand]);

  const variantName = useMemo(() => {
    const target = (brand || "").toLowerCase();
    const hit = SKY_PRESETS.find((p) => p.brand.toLowerCase() === target);
    return hit?.name || "Custom";
  }, [brand]);

  return (
    <div className={`sky-shot-stage device-${deviceMode}`}>
      <div className="sky-shot-frame">
        <div className="sky-shot-frame-bar">
          <span className="sky-shot-dots">
            <i /><i /><i />
          </span>
          <span className="sky-shot-url">{siteName?.toLowerCase().replace(/\s/g, "") || "yoursite"}.com</span>
          <span className="sky-shot-meta">{variantName}</span>
        </div>
        <div className="sky-shot-wrap">
          {src ? (
            <img src={src} alt={`${variantName} Sky variant preview`} className="sky-shot-img" />
          ) : (
            <div className="sky-shot-empty">Pick a variant from the shop →</div>
          )}
        </div>
      </div>
    </div>
  );
}
