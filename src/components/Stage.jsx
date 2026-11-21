import { useRef } from "react";

/**
 * 3D showroom stage. The selected design's desktop screen sits in a browser
 * window, its mobile screen in a phone in front, and the next screen hangs
 * behind for depth. The whole stage tilts with the mouse; on touch devices it
 * holds a fixed 3D pose.
 */
export default function Stage({ desktopSrc, mobileSrc, backSrc, brand, label, onZoom }) {
  const tiltRef = useRef(null);
  const frame = useRef(0);

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      tiltRef.current?.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
      tiltRef.current?.style.setProperty("--rx", `${(-y * 9).toFixed(2)}deg`);
    });
  };

  const onLeave = () => {
    cancelAnimationFrame(frame.current);
    tiltRef.current?.style.setProperty("--ry", "0deg");
    tiltRef.current?.style.setProperty("--rx", "0deg");
  };

  return (
    <div
      className="stage"
      style={{ "--brand": brand }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="stage-tilt" ref={tiltRef}>
        <div className="stage-floor" aria-hidden="true" />
        <div className="stage-glow" aria-hidden="true" />

        {backSrc && (
          <div className="win win-back" aria-hidden="true">
            <div className="win-bar"><i /><i /><i /></div>
            <img src={backSrc} alt="" />
          </div>
        )}

        <button type="button" className="win win-front" onClick={() => onZoom?.("desktop")} aria-label={`${label}, desktop. Open full size`}>
          <div className="win-bar"><i /><i /><i /><span>yourbrand.com</span></div>
          <img src={desktopSrc} alt={`${label}, desktop`} />
        </button>

        {mobileSrc && (
          <button type="button" className="phone" onClick={() => onZoom?.("mobile")} aria-label={`${label}, mobile. Open full size`}>
            <img src={mobileSrc} alt={`${label}, mobile`} />
          </button>
        )}
      </div>
    </div>
  );
}
